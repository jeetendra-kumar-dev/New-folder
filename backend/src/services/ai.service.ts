import { prisma } from "../lib/prisma";
import { env } from "../config/env";
import type { ChatInput } from "../types/ai";
import { AppError } from "../utils/app-error";
import { buildUserContext } from "./user-context.service";

type UserContext = Awaited<ReturnType<typeof buildUserContext>>;

function formatContextSummary(context: UserContext) {
  const lines: string[] = [];

  if (context.subscriptions.length) {
    lines.push(
      `Subscriptions (${context.subscriptions.length}): ${context.subscriptions
        .map((s) => `${s.serviceName} $${s.amount} renews ${s.renewalDate.toISOString().slice(0, 10)}`)
        .join("; ")}`,
    );
  }

  if (context.goals.length) {
    lines.push(
      `Goals (${context.goals.length}): ${context.goals
        .map((g) => `${g.title} [${g.status}] ${g.completedDays}/${g.totalDays} days`)
        .join("; ")}`,
    );
  }

  if (context.memories.length) {
    lines.push(`Memories (${context.memories.length}): ${context.memories.map((m) => m.title ?? m.type).join(", ")}`);
  }

  if (context.sections.length) {
    lines.push(`Sections: ${context.sections.map((s) => s.name).join(", ")}`);
  }

  if (context.roadmaps.length) {
    lines.push(
      `Roadmaps: ${context.roadmaps
        .map((r) => `${r.title} (${r.milestones.filter((m) => m.status === "DONE").length}/${r.milestones.length} milestones done)`)
        .join("; ")}`,
    );
  }

  if (context.notes.length) {
    lines.push(`Notes: ${context.notes.map((n) => n.title).join(", ")}`);
  }

  if (context.photos.length) {
    lines.push(`Photos: ${context.photos.map((p) => p.title).join(", ")}`);
  }

  if (context.videos.length) {
    lines.push(`Videos: ${context.videos.map((v) => v.title).join(", ")}`);
  }

  if (context.graphics.length) {
    lines.push(`Graphics: ${context.graphics.map((g) => `${g.title} (${g.kind})`).join(", ")}`);
  }

  return lines.join("\n");
}

function answerFromLocalContext(message: string, context: UserContext) {
  const query = message.toLowerCase();
  const parts: string[] = [];

  if (/subscription|renew|billing|spend|cost/.test(query)) {
    if (!context.subscriptions.length) {
      parts.push("You have no subscriptions saved yet.");
    } else {
      const total = context.subscriptions.reduce((sum, s) => sum + s.amount, 0);
      parts.push(`You track ${context.subscriptions.length} subscription(s) totaling about $${total.toFixed(2)} per cycle.`);
      const upcoming = [...context.subscriptions].sort((a, b) => a.renewalDate.getTime() - b.renewalDate.getTime())[0];
      if (upcoming) {
        parts.push(`Next renewal: ${upcoming.serviceName} on ${upcoming.renewalDate.toISOString().slice(0, 10)} ($${upcoming.amount}).`);
      }
    }
  }

  if (/goal|progress|streak|habit/.test(query)) {
    if (!context.goals.length) {
      parts.push("You have no goals yet.");
    } else {
      const active = context.goals.filter((g) => g.status === "IN_PROGRESS");
      parts.push(`You have ${active.length} active goal(s) out of ${context.goals.length} total.`);
      active.slice(0, 3).forEach((g) => {
        parts.push(`- ${g.title}: ${g.completedDays}/${g.totalDays} days (${Number(g.progressPercent)}%).`);
      });
    }
  }

  if (/memory|memories|remember|context/.test(query)) {
    if (!context.memories.length) {
      parts.push("Your memory store is empty.");
    } else {
      parts.push(`Top memories: ${context.memories.slice(0, 5).map((m) => `${m.title ?? m.type} - ${m.content.slice(0, 80)}`).join(" | ")}`);
    }
  }

  if (/roadmap|milestone|plan/.test(query)) {
    if (!context.roadmaps.length) {
      parts.push("No roadmaps saved yet.");
    } else {
      context.roadmaps.forEach((r) => {
        const done = r.milestones.filter((m) => m.status === "DONE").length;
        parts.push(`- ${r.title} [${r.status}]: ${done}/${r.milestones.length} milestones complete.`);
      });
    }
  }

  if (/note|notes/.test(query)) {
    parts.push(context.notes.length ? `Notes: ${context.notes.map((n) => n.title).join(", ")}` : "No notes saved yet.");
  }

  if (/photo|image|picture/.test(query)) {
    parts.push(context.photos.length ? `Photos: ${context.photos.map((p) => p.title).join(", ")}` : "No photos saved yet.");
  }

  if (/video|watch/.test(query)) {
    parts.push(context.videos.length ? `Videos: ${context.videos.map((v) => v.title).join(", ")}` : "No videos saved yet.");
  }

  if (/graphic|design|chart|diagram/.test(query)) {
    parts.push(context.graphics.length ? `Graphics: ${context.graphics.map((g) => `${g.title} (${g.kind})`).join(", ")}` : "No graphics saved yet.");
  }

  if (/section|workspace|organize/.test(query)) {
    parts.push(context.sections.length ? `Sections: ${context.sections.map((s) => s.name).join(", ")}` : "No sections created yet.");
  }

  if (/summary|overview|everything|all my data/.test(query)) {
    parts.push(formatContextSummary(context));
  }

  if (!parts.length) {
    parts.push("Here's a snapshot of your PocketPilot data:");
    parts.push(formatContextSummary(context));
    parts.push("\nAsk about subscriptions, goals, roadmaps, notes, photos, videos, graphics, memories, or sections.");
    parts.push("\nTip: add OPENAI_API_KEY to your backend .env for richer natural-language answers.");
  }

  return parts.join("\n\n");
}

async function callOpenAi(message: string, context: UserContext, history: { role: string; content: string }[]) {
  const systemPrompt = `You are PocketPilot AI, a personal assistant with read-only access to the user's PocketPilot workspace.
Answer questions using ONLY the user data below. If the data does not contain the answer, say so clearly.
Be concise, helpful, and reference specific items by name when relevant.

USER DATA (JSON):
${JSON.stringify(context, null, 2)}`;

  const response = await fetch(`${env.OPENAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL,
      temperature: 0.3,
      messages: [{ role: "system", content: systemPrompt }, ...history],
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      return answerFromLocalContext(message, context);
    }
    const errorText = await response.text();
    throw new AppError(`AI provider error: ${response.status}`, 502, "AI_PROVIDER_ERROR", { detail: errorText.slice(0, 500) });
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = payload.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new AppError("AI returned an empty response", 502, "AI_EMPTY_RESPONSE");
  }

  return content;
}

const conversationSelect = {
  id: true,
  title: true,
  createdAt: true,
  updatedAt: true,
  messages: {
    select: { id: true, role: true, content: true, createdAt: true },
    orderBy: { createdAt: "asc" as const },
  },
} as const;

export async function listConversations(userId: string) {
  return prisma.aiConversation.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { messages: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 30,
  });
}

export async function getConversation(userId: string, id: string) {
  const conversation = await prisma.aiConversation.findFirst({
    where: { id, userId },
    select: conversationSelect,
  });

  if (!conversation) {
    throw new AppError("Conversation not found", 404, "CONVERSATION_NOT_FOUND");
  }

  return conversation;
}

export async function deleteConversation(userId: string, id: string) {
  const existing = await prisma.aiConversation.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) throw new AppError("Conversation not found", 404, "CONVERSATION_NOT_FOUND");
  await prisma.aiConversation.delete({ where: { id } });
  return { deleted: true };
}

export async function chat(userId: string, input: ChatInput) {
  const context = await buildUserContext(userId);

  let conversation = input.conversationId
    ? await prisma.aiConversation.findFirst({
        where: { id: input.conversationId, userId },
        include: { messages: { orderBy: { createdAt: "asc" }, take: 20 } },
      })
    : null;

  if (input.conversationId && !conversation) {
    throw new AppError("Conversation not found", 404, "CONVERSATION_NOT_FOUND");
  }

  if (!conversation) {
    conversation = await prisma.aiConversation.create({
      data: {
        userId,
        title: input.message.slice(0, 80),
        messages: { create: { role: "USER", content: input.message } },
      },
      include: { messages: true },
    });
  } else {
    await prisma.aiMessage.create({
      data: { conversationId: conversation.id, role: "USER", content: input.message },
    });
  }

  const priorMessages = await prisma.aiMessage.findMany({
    where: { conversationId: conversation.id, role: { not: "SYSTEM" } },
    orderBy: { createdAt: "asc" },
    take: 20,
  });

  const history = priorMessages.slice(-10).map((m) => ({ role: m.role.toLowerCase(), content: m.content }));

  const reply = env.OPENAI_API_KEY
    ? await callOpenAi(input.message, context, history)
    : answerFromLocalContext(input.message, context);

  const assistantMessage = await prisma.aiMessage.create({
    data: { conversationId: conversation.id, role: "ASSISTANT", content: reply },
    select: { id: true, role: true, content: true, createdAt: true },
  });

  await prisma.aiConversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() },
  });

  return {
    conversationId: conversation.id,
    message: assistantMessage,
    mode: env.OPENAI_API_KEY ? ("openai" as const) : ("local" as const),
  };
}
