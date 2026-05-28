import { randomUUID } from "crypto";
import { env } from "../config/env";
import type { AiModelId, RunAiModelInput } from "../types/ai";
import { AppError } from "../utils/app-error";
import { buildUserContext } from "./user-context.service";

type UserContext = Awaited<ReturnType<typeof buildUserContext>>;

type AiModelDefinition = {
  id: AiModelId;
  name: string;
  category: "advisor" | "analyzer" | "classifier" | "architect";
  level: "foundation" | "intermediate" | "advanced";
  description: string;
  inputHint: string;
  outputShape: string[];
  stackSkills: string[];
  deploymentPath: string;
  systemPrompt: string;
  teachingPoints: string[];
};

const modelCatalog: AiModelDefinition[] = [
  {
    id: "portfolio-mentor",
    name: "Full Stack Portfolio Mentor",
    category: "advisor",
    level: "foundation",
    description: "Turns your learning goal into a production-style feature roadmap across frontend, backend, AI, and deployment.",
    inputHint: "Describe what you want to learn or build next.",
    outputShape: ["skill map", "feature plan", "deployment habit", "practice task"],
    stackSkills: ["React", "Next.js", "Tailwind CSS", "TypeScript", "Node.js", "Express", "Deployment"],
    deploymentPath: "POST /api/v1/ai/models/run with modelId=portfolio-mentor",
    systemPrompt:
      "You are a senior full-stack AI mentor. Create a practical learning path that connects frontend, backend, AI integration, TypeScript, and deployment.",
    teachingPoints: [
      "A model can be a task-specific reasoning workflow, not only a neural network trained from scratch.",
      "Good model design starts with input, context, output contract, and evaluation criteria.",
      "Deployment matters because AI features need observability, fallback behavior, and clear API boundaries.",
    ],
  },
  {
    id: "subscription-optimizer",
    name: "Subscription Optimizer",
    category: "analyzer",
    level: "intermediate",
    description: "Analyzes saved subscriptions, renewal timing, auto-renew risk, and cost patterns.",
    inputHint: "Ask for renewal risks, spend cleanup, or billing priorities.",
    outputShape: ["spend summary", "risk signals", "next actions"],
    stackSkills: ["Express services", "Prisma context", "data aggregation", "AI explanations"],
    deploymentPath: "POST /api/v1/ai/models/run with modelId=subscription-optimizer",
    systemPrompt:
      "You are a subscription optimization model. Use only the supplied workspace data and explain spend risk in concise business language.",
    teachingPoints: [
      "Analytical AI features work best when deterministic calculations happen before the language model writes the answer.",
      "Keep money-related outputs grounded in stored data.",
      "A local fallback model is useful when provider keys are missing or rate limits happen.",
    ],
  },
  {
    id: "goal-coach",
    name: "Goal Coach",
    category: "advisor",
    level: "intermediate",
    description: "Builds a focused plan from goals, roadmaps, milestones, notes, and user intent.",
    inputHint: "Ask for a 7-day plan, blockers, or next milestones.",
    outputShape: ["focus diagnosis", "7-day plan", "tracking metric"],
    stackSkills: ["context retrieval", "planning prompts", "dashboard UX", "TypeScript contracts"],
    deploymentPath: "POST /api/v1/ai/models/run with modelId=goal-coach",
    systemPrompt:
      "You are a practical goal coaching model. Use the workspace context to propose a short, measurable plan.",
    teachingPoints: [
      "Planning models need clear time horizons and measurable next steps.",
      "The same backend context can power chat, dashboards, and model-specific workflows.",
      "Model quality improves when outputs have consistent sections.",
    ],
  },
  {
    id: "content-classifier",
    name: "Workspace Content Classifier",
    category: "classifier",
    level: "foundation",
    description: "Classifies an idea as a roadmap, note, photo, video, graphic, memory, or section and proposes tags.",
    inputHint: "Paste an idea, note, asset description, or project snippet.",
    outputShape: ["content type", "confidence", "tags", "storage suggestion"],
    stackSkills: ["classification", "JSON-like output", "form automation", "workspace data modeling"],
    deploymentPath: "POST /api/v1/ai/models/run with modelId=content-classifier",
    systemPrompt:
      "You are a content classification model for a productivity workspace. Classify the user input and propose storage metadata.",
    teachingPoints: [
      "Classifier models are a strong first AI project because the output contract is easy to test.",
      "Start with rules, then replace or enhance them with provider inference when needed.",
      "Frontend forms can consume classifier output to prefill fields.",
    ],
  },
  {
    id: "model-architect",
    name: "AI Model Architect",
    category: "architect",
    level: "advanced",
    description: "Creates a model card for a custom AI feature: task, data, prompt, API, evals, and deployment plan.",
    inputHint: "Describe the AI product/model you want to create.",
    outputShape: ["model card", "dataset plan", "prompt strategy", "API contract", "evaluation checklist"],
    stackSkills: ["model design", "prompt engineering", "evaluation", "API design", "deployment"],
    deploymentPath: "POST /api/v1/ai/models/run with modelId=model-architect",
    systemPrompt:
      "You are an AI model architect. Convert the user's idea into an implementation-ready model card with data, prompt, API, evals, and deployment notes.",
    teachingPoints: [
      "Model creators define behavior, data flow, constraints, evals, and deployment, not just UI screens.",
      "A model card makes AI work understandable to engineers, users, and reviewers.",
      "Every AI feature should have an API contract and evaluation plan before scaling.",
    ],
  },
];

function publicModel(model: AiModelDefinition) {
  const { systemPrompt: _systemPrompt, ...visibleModel } = model;
  return visibleModel;
}

export function listModels() {
  return modelCatalog.map(publicModel);
}

function getModel(modelId: AiModelId) {
  const model = modelCatalog.find((entry) => entry.id === modelId);

  if (!model) {
    throw new AppError("AI model not found", 404, "AI_MODEL_NOT_FOUND");
  }

  return model;
}

function compactContextStats(context: UserContext) {
  const subscriptionTotal = context.subscriptions.reduce((sum, subscription) => sum + subscription.amount, 0);
  const activeGoals = context.goals.filter((goal) => goal.status === "IN_PROGRESS");
  const openMilestones = context.roadmaps.flatMap((roadmap) =>
    roadmap.milestones.filter((milestone) => milestone.status !== "DONE").map((milestone) => `${roadmap.title}: ${milestone.title}`),
  );

  return {
    subscriptionCount: context.subscriptions.length,
    subscriptionTotal,
    activeGoalCount: activeGoals.length,
    memoryCount: context.memories.length,
    roadmapCount: context.roadmaps.length,
    openMilestones: openMilestones.slice(0, 8),
    contentCounts: {
      notes: context.notes.length,
      photos: context.photos.length,
      videos: context.videos.length,
      graphics: context.graphics.length,
      sections: context.sections.length,
    },
  };
}

function getUpcomingRenewals(context: UserContext) {
  return [...context.subscriptions]
    .sort((a, b) => a.renewalDate.getTime() - b.renewalDate.getTime())
    .slice(0, 5)
    .map((subscription) => `${subscription.serviceName} on ${subscription.renewalDate.toISOString().slice(0, 10)} ($${subscription.amount})`);
}

function createTags(input: string) {
  const stopWords = new Set(["the", "and", "for", "with", "that", "this", "from", "into", "about", "create", "build"]);
  const words = input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.has(word));

  return [...new Set(words)].slice(0, 6);
}

function classifyContent(input: string) {
  const text = input.toLowerCase();

  if (/roadmap|milestone|timeline|plan|sprint/.test(text)) return { type: "roadmap", confidence: 0.86 };
  if (/photo|image|picture|screenshot|gallery/.test(text)) return { type: "photo", confidence: 0.84 };
  if (/video|watch|recording|tutorial|clip/.test(text)) return { type: "video", confidence: 0.83 };
  if (/diagram|chart|mockup|icon|illustration|graphic/.test(text)) return { type: "graphic", confidence: 0.85 };
  if (/remember|preference|fact|context|insight/.test(text)) return { type: "memory", confidence: 0.8 };
  if (/section|folder|area|workspace/.test(text)) return { type: "section", confidence: 0.78 };

  return { type: "note", confidence: 0.74 };
}

function localPortfolioMentor(input: string, context: UserContext) {
  const stats = compactContextStats(context);

  return [
    "## Skill Map",
    `Your current project already touches Next.js, React, Tailwind CSS, Express, Prisma, auth, and AI routes. Use this request as the learning theme: "${input}".`,
    "",
    "## Build Next",
    "- Frontend: create one polished dashboard workflow with loading, empty, error, and success states.",
    "- Backend: expose one typed Express route with Zod validation and a service function.",
    "- AI: define the model input, context, prompt/fallback, output shape, and eval checklist.",
    "- Deployment: document the frontend host, backend host, database URL, CORS origin, and environment variables.",
    "",
    "## Practice Task",
    `Build one feature that uses ${stats.subscriptionCount} subscriptions, ${stats.activeGoalCount} active goals, and ${stats.roadmapCount} roadmaps as model context.`,
    "",
    "## Portfolio Proof",
    "Record a short demo showing the UI, API request, model output, and deployment configuration.",
  ].join("\n");
}

function localSubscriptionOptimizer(input: string, context: UserContext) {
  if (!context.subscriptions.length) {
    return [
      "## Spend Summary",
      "No subscriptions are saved yet.",
      "",
      "## Next Actions",
      "- Add at least three subscriptions with renewal dates, amount, category, and auto-renew status.",
      "- Re-run this model to get renewal risk and cleanup suggestions.",
      "",
      `## User Request\n${input}`,
    ].join("\n");
  }

  const total = context.subscriptions.reduce((sum, subscription) => sum + subscription.amount, 0);
  const autoRenewCount = context.subscriptions.filter((subscription) => subscription.autoRenew).length;
  const upcoming = getUpcomingRenewals(context);
  const highest = [...context.subscriptions].sort((a, b) => b.amount - a.amount)[0];

  return [
    "## Spend Summary",
    `You track ${context.subscriptions.length} subscriptions totaling about $${total.toFixed(2)} per cycle.`,
    highest ? `Highest cost item: ${highest.serviceName} at $${highest.amount}.` : "",
    "",
    "## Risk Signals",
    `- ${autoRenewCount} subscription(s) are set to auto-renew.`,
    upcoming.length ? `- Upcoming renewals: ${upcoming.join("; ")}.` : "- No upcoming renewals found.",
    "",
    "## Next Actions",
    "- Review the highest cost subscription first.",
    "- Add notes for why each auto-renewing subscription is still useful.",
    "- Set reminder days for any subscription that needs a cancellation decision.",
    "",
    `## User Request\n${input}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function localGoalCoach(input: string, context: UserContext) {
  const activeGoals = context.goals.filter((goal) => goal.status === "IN_PROGRESS");
  const openMilestones = context.roadmaps.flatMap((roadmap) =>
    roadmap.milestones.filter((milestone) => milestone.status !== "DONE").map((milestone) => ({
      roadmap: roadmap.title,
      title: milestone.title,
      dueDate: milestone.dueDate,
    })),
  );

  return [
    "## Focus Diagnosis",
    activeGoals.length
      ? `You have ${activeGoals.length} active goal(s). The best move is to connect each goal to one visible portfolio feature.`
      : "No active goals are saved yet. Start by creating one 30-day learning goal.",
    "",
    "## 7-Day Plan",
    "- Day 1: choose one feature and write the user story.",
    "- Day 2: build the Express route and validate input with Zod.",
    "- Day 3: connect Prisma or service-level data.",
    "- Day 4: design the React/Next UI with loading and error states.",
    "- Day 5: integrate the AI model output into the UI.",
    "- Day 6: test build, lint, and API behavior.",
    "- Day 7: document deployment and record a demo.",
    "",
    "## Current Milestones",
    openMilestones.length
      ? openMilestones.slice(0, 5).map((milestone) => `- ${milestone.roadmap}: ${milestone.title}`).join("\n")
      : "- No open roadmap milestones found.",
    "",
    `## User Request\n${input}`,
  ].join("\n");
}

function localContentClassifier(input: string, context: UserContext) {
  const classification = classifyContent(input);
  const tags = createTags(input);
  const knownSections = context.sections.map((section) => section.name).slice(0, 5);

  return [
    "## Classification",
    `type: ${classification.type}`,
    `confidence: ${classification.confidence}`,
    `tags: ${tags.length ? tags.join(", ") : "general"}`,
    "",
    "## Storage Suggestion",
    knownSections.length
      ? `Attach it to one of these existing sections if relevant: ${knownSections.join(", ")}.`
      : "Create a section first if this belongs to a larger project area.",
    "",
    "## Automation Idea",
    "Use this model output to prefill a create form in the frontend, then let the user confirm before saving.",
  ].join("\n");
}

function localModelArchitect(input: string) {
  const tags = createTags(input);
  const modelName = tags.length ? `${tags[0][0].toUpperCase()}${tags[0].slice(1)} Assistant` : "Custom AI Assistant";

  return [
    "## Model Card",
    `name: ${modelName}`,
    `problem: ${input}`,
    "mode: task-specific assistant with local fallback and provider upgrade path",
    "",
    "## Inputs",
    "- user instruction",
    "- authenticated workspace context",
    "- optional model settings such as temperature",
    "",
    "## Prompt Strategy",
    "- Write a system prompt that defines role, allowed data, output sections, and refusal rules.",
    "- Keep deterministic calculations in code before calling the model.",
    "- Ask the model for concise, structured output.",
    "",
    "## API Contract",
    "POST /api/v1/ai/models/run",
    "body: { modelId, input, temperature }",
    "response: { runId, model, mode, output, teachingPoints, createdAt }",
    "",
    "## Evaluation Checklist",
    "- Does the answer use only available context?",
    "- Does every output include the required sections?",
    "- Does local fallback still give useful guidance?",
    "- Are errors visible in the UI without breaking the workflow?",
    "",
    "## Deployment Plan",
    "- Frontend: deploy Next.js with NEXT_PUBLIC_API_URL.",
    "- Backend: deploy Express with DATABASE_URL, JWT secrets, CORS_ORIGIN, and optional OPENAI_API_KEY.",
    "- Database: run Prisma migrations before production traffic.",
  ].join("\n");
}

function runLocalModel(modelId: AiModelId, input: string, context: UserContext) {
  switch (modelId) {
    case "portfolio-mentor":
      return localPortfolioMentor(input, context);
    case "subscription-optimizer":
      return localSubscriptionOptimizer(input, context);
    case "goal-coach":
      return localGoalCoach(input, context);
    case "content-classifier":
      return localContentClassifier(input, context);
    case "model-architect":
      return localModelArchitect(input);
    default:
      return localModelArchitect(input);
  }
}

async function callOpenAiForModel(model: AiModelDefinition, input: RunAiModelInput, context: UserContext) {
  const response = await fetch(`${env.OPENAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL,
      temperature: input.temperature,
      messages: [
        {
          role: "system",
          content: `${model.systemPrompt}

Return the answer in these sections: ${model.outputShape.join(", ")}.
Use only the workspace context when referencing user data.

WORKSPACE CONTEXT:
${JSON.stringify(context, null, 2)}`,
        },
        { role: "user", content: input.input },
      ],
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      return runLocalModel(model.id, input.input, context);
    }
    const errorText = await response.text();
    throw new AppError(`AI provider error: ${response.status}`, 502, "AI_PROVIDER_ERROR", { detail: errorText.slice(0, 500) });
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const output = payload.choices?.[0]?.message?.content?.trim();
  if (!output) {
    throw new AppError("AI returned an empty response", 502, "AI_EMPTY_RESPONSE");
  }

  return output;
}

export async function runModel(userId: string, input: RunAiModelInput) {
  const model = getModel(input.modelId);
  const context = await buildUserContext(userId);
  const output = env.OPENAI_API_KEY ? await callOpenAiForModel(model, input, context) : runLocalModel(model.id, input.input, context);

  return {
    runId: randomUUID(),
    model: publicModel(model),
    mode: env.OPENAI_API_KEY ? ("openai" as const) : ("local" as const),
    input: input.input,
    output,
    teachingPoints: model.teachingPoints,
    contextStats: compactContextStats(context),
    createdAt: new Date().toISOString(),
  };
}
