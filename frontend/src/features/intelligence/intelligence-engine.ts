import type { IntelligenceFocus, IntelligenceHorizon } from "@/schemas/intelligence";
import type { DashboardSummary, Goal, Memory, Note, NotificationList, Roadmap, Subscription } from "@/types/api";

export type InsightKind = "money" | "goals" | "learning" | "operations";
export type InsightSeverity = "critical" | "high" | "medium" | "low";

export type IntelligenceInsight = {
  id: string;
  kind: InsightKind;
  severity: InsightSeverity;
  title: string;
  description: string;
  impact: string;
  evidence: string[];
  actionLabel: string;
  prompt: string;
};

export type IntelligenceLane = {
  id: InsightKind;
  label: string;
  score: number;
  count: number;
  description: string;
};

export type ContextSource = {
  label: string;
  count: number;
  quality: "strong" | "partial" | "empty";
};

export type IntelligenceBrief = {
  scores: {
    readiness: number;
    contextCoverage: number;
    spendRisk: number;
    executionRisk: number;
  };
  lanes: IntelligenceLane[];
  insights: IntelligenceInsight[];
  sources: ContextSource[];
};

type BuildInput = {
  horizon: IntelligenceHorizon;
  focus: IntelligenceFocus;
  summary?: DashboardSummary;
  notifications?: NotificationList;
  subscriptions: Subscription[];
  goals: Goal[];
  memories: Memory[];
  roadmaps: Roadmap[];
  notes: Note[];
  now?: Date;
};

const horizonDays: Record<IntelligenceHorizon, number> = {
  today: 1,
  week: 7,
  month: 30,
};

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function daysUntil(date: string, now: Date) {
  const target = new Date(date);
  const start = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const end = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.ceil((end - start) / 86_400_000);
}

function severityRank(severity: InsightSeverity) {
  return { critical: 4, high: 3, medium: 2, low: 1 }[severity];
}

function sourceQuality(count: number, strongAt: number): ContextSource["quality"] {
  if (count <= 0) return "empty";
  return count >= strongAt ? "strong" : "partial";
}

function laneScore(kind: InsightKind, insights: IntelligenceInsight[]) {
  const laneInsights = insights.filter((insight) => insight.kind === kind);
  const risk = laneInsights.reduce((sum, insight) => sum + severityRank(insight.severity) * 11, 0);
  return clamp(100 - risk);
}

export function buildIntelligenceBrief(input: BuildInput): IntelligenceBrief {
  const now = input.now ?? new Date();
  const days = horizonDays[input.horizon];
  const insights: IntelligenceInsight[] = [];
  const upcomingRenewals = input.subscriptions
    .map((subscription) => ({ subscription, daysAway: daysUntil(subscription.renewalDate, now) }))
    .filter((entry) => entry.daysAway >= 0 && entry.daysAway <= days)
    .sort((a, b) => a.daysAway - b.daysAway);

  if (upcomingRenewals.length) {
    const total = upcomingRenewals.reduce((sum, entry) => sum + entry.subscription.amount, 0);
    const autoRenewals = upcomingRenewals.filter((entry) => entry.subscription.autoRenew);
    insights.push({
      id: "renewal-review",
      kind: "money",
      severity: autoRenewals.length ? "high" : "medium",
      title: `${upcomingRenewals.length} renewal${upcomingRenewals.length === 1 ? "" : "s"} need review`,
      description: `${money.format(total)} is scheduled inside this horizon, with ${autoRenewals.length} service${autoRenewals.length === 1 ? "" : "s"} on auto-renew.`,
      impact: "Prevents surprise spend and gives you a clean cancellation window.",
      evidence: upcomingRenewals.slice(0, 4).map(({ subscription, daysAway }) => `${subscription.serviceName}: ${money.format(subscription.amount)} in ${daysAway} day${daysAway === 1 ? "" : "s"}`),
      actionLabel: "Draft spend review",
      prompt: `Create a renewal review plan for these subscriptions: ${upcomingRenewals
        .map(({ subscription, daysAway }) => `${subscription.serviceName} ${money.format(subscription.amount)} in ${daysAway} days`)
        .join(", ")}. Include what to keep, cancel, negotiate, or move to manual renewal.`,
    });
  }

  const highestSubscription = [...input.subscriptions].sort((a, b) => b.amount - a.amount)[0];
  if (highestSubscription && highestSubscription.amount >= 25) {
    insights.push({
      id: "largest-subscription",
      kind: "money",
      severity: highestSubscription.amount >= 75 ? "high" : "medium",
      title: `${highestSubscription.serviceName} is the largest recurring cost`,
      description: `${money.format(highestSubscription.amount)} is concentrated in one service.`,
      impact: "A single pricing review can free budget without changing the whole stack.",
      evidence: [highestSubscription.category.replaceAll("_", " "), highestSubscription.autoRenew ? "Auto-renew enabled" : "Manual renewal"],
      actionLabel: "Question value",
      prompt: `Evaluate whether ${highestSubscription.serviceName} at ${money.format(highestSubscription.amount)} is worth keeping. Compare it against my goals, workspace context, and likely alternatives.`,
    });
  }

  const activeGoals = input.goals.filter((goal) => goal.status === "IN_PROGRESS");
  const slippingGoals = activeGoals
    .map((goal) => ({ goal, daysAway: goal.targetDate ? daysUntil(goal.targetDate, now) : undefined }))
    .filter(({ goal, daysAway }) => (daysAway === undefined || daysAway <= days) && goal.progressPercent < 70)
    .sort((a, b) => (a.daysAway ?? 999) - (b.daysAway ?? 999));

  if (slippingGoals.length) {
    const lead = slippingGoals[0].goal;
    insights.push({
      id: "goal-recovery",
      kind: "goals",
      severity: slippingGoals.some(({ daysAway }) => daysAway !== undefined && daysAway <= 3) ? "high" : "medium",
      title: `${slippingGoals.length} active goal${slippingGoals.length === 1 ? "" : "s"} could slip`,
      description: `${lead.title} is at ${Math.round(lead.progressPercent)}% progress${lead.targetDate ? ` with a target date inside view` : ""}.`,
      impact: "Keeps attention on recoverable goals before they become stale.",
      evidence: slippingGoals.slice(0, 4).map(({ goal, daysAway }) => `${goal.title}: ${goal.completedDays}/${goal.totalDays} days${daysAway !== undefined ? `, ${daysAway} days left` : ""}`),
      actionLabel: "Build recovery plan",
      prompt: `Create a recovery plan for these goals: ${slippingGoals
        .map(({ goal }) => `${goal.title} (${goal.completedDays}/${goal.totalDays} days, ${Math.round(goal.progressPercent)}%)`)
        .join(", ")}. Make it realistic for the next ${days} day${days === 1 ? "" : "s"}.`,
    });
  } else if (!activeGoals.length) {
    insights.push({
      id: "no-active-goals",
      kind: "goals",
      severity: "low",
      title: "No active goals are steering the week",
      description: "Your workspace has no in-progress goal to anchor daily decisions.",
      impact: "A single near-term goal makes AI suggestions and reminders more useful.",
      evidence: ["Create one measurable goal with a small total-day target."],
      actionLabel: "Pick a goal",
      prompt: "Recommend one high-leverage goal I should create from my current subscriptions, memories, notes, and roadmaps.",
    });
  }

  const openMilestones = input.roadmaps.flatMap((roadmap) =>
    roadmap.milestones
      .filter((milestone) => milestone.status !== "DONE")
      .map((milestone) => ({ roadmap, milestone, daysAway: milestone.dueDate ? daysUntil(milestone.dueDate, now) : undefined })),
  );
  const urgentMilestones = openMilestones.filter((entry) => entry.daysAway !== undefined && entry.daysAway <= days);

  if (urgentMilestones.length) {
    insights.push({
      id: "milestone-stack",
      kind: "learning",
      severity: urgentMilestones.some((entry) => (entry.daysAway ?? 99) <= 2) ? "high" : "medium",
      title: `${urgentMilestones.length} roadmap milestone${urgentMilestones.length === 1 ? "" : "s"} are due soon`,
      description: "Open milestones are competing for the same attention window.",
      impact: "Sequencing milestones turns a backlog into a shippable path.",
      evidence: urgentMilestones.slice(0, 4).map(({ roadmap, milestone, daysAway }) => `${roadmap.title}: ${milestone.title}${daysAway !== undefined ? ` in ${daysAway} day${daysAway === 1 ? "" : "s"}` : ""}`),
      actionLabel: "Sequence milestones",
      prompt: `Sequence these due roadmap milestones into a practical execution order: ${urgentMilestones
        .map(({ roadmap, milestone }) => `${roadmap.title} - ${milestone.title}`)
        .join(", ")}.`,
    });
  }

  const unreadCount = input.notifications?.unreadCount ?? input.summary?.metrics.unreadNotifications ?? 0;
  if (unreadCount > 0) {
    insights.push({
      id: "notification-backlog",
      kind: "operations",
      severity: unreadCount >= 5 ? "medium" : "low",
      title: `${unreadCount} unread alert${unreadCount === 1 ? "" : "s"}`,
      description: "Notifications are useful only when the stream stays small enough to trust.",
      impact: "Keeps renewal and goal reminders from becoming background noise.",
      evidence: (input.notifications?.notifications ?? []).slice(0, 3).map((notification) => notification.message),
      actionLabel: "Triage alerts",
      prompt: "Triage my unread alerts and tell me which ones need action today, which can wait, and which are just informational.",
    });
  }

  const contentCount = input.notes.length + input.roadmaps.length + input.memories.length;
  if (input.memories.length < 3 || contentCount < 6) {
    insights.push({
      id: "context-depth",
      kind: "learning",
      severity: input.memories.length === 0 ? "medium" : "low",
      title: "AI context could be sharper",
      description: "The assistant has limited durable context to retrieve from.",
      impact: "More memories and notes make answers less generic and more personal.",
      evidence: [`${input.memories.length} memories`, `${input.notes.length} notes`, `${input.roadmaps.length} roadmaps`],
      actionLabel: "Find missing context",
      prompt: "Identify the most important missing memories, notes, or roadmap details I should add so AI answers become more useful.",
    });
  }

  const unsectionedNotes = input.notes.filter((note) => !note.section).length;
  if (unsectionedNotes >= 3) {
    insights.push({
      id: "workspace-taxonomy",
      kind: "operations",
      severity: "low",
      title: `${unsectionedNotes} notes need a home`,
      description: "Unsectioned notes are harder to retrieve and connect to roadmaps.",
      impact: "Better grouping improves search, AI context, and review speed.",
      evidence: input.notes.filter((note) => !note.section).slice(0, 4).map((note) => note.title),
      actionLabel: "Suggest sections",
      prompt: "Suggest a clean section taxonomy for my unsectioned notes and explain which note should move where.",
    });
  }

  const focusMap: Record<IntelligenceFocus, InsightKind[]> = {
    all: ["money", "goals", "learning", "operations"],
    money: ["money"],
    goals: ["goals"],
    learning: ["learning"],
    operations: ["operations"],
  };

  const filteredInsights = insights
    .filter((insight) => focusMap[input.focus].includes(insight.kind))
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity));

  const sourceDefinitions: ContextSource[] = [
    { label: "Subscriptions", count: input.subscriptions.length, quality: sourceQuality(input.subscriptions.length, 3) },
    { label: "Goals", count: input.goals.length, quality: sourceQuality(input.goals.length, 2) },
    { label: "Memories", count: input.memories.length, quality: sourceQuality(input.memories.length, 5) },
    { label: "Roadmaps", count: input.roadmaps.length, quality: sourceQuality(input.roadmaps.length, 2) },
    { label: "Notes", count: input.notes.length, quality: sourceQuality(input.notes.length, 5) },
    { label: "Alerts", count: input.notifications?.notifications.length ?? 0, quality: sourceQuality(input.notifications?.notifications.length ?? 0, 3) },
  ];

  const populatedSources = sourceDefinitions.filter((source) => source.count > 0).length;
  const coverage = clamp((populatedSources / sourceDefinitions.length) * 100);
  const spendRisk = clamp(upcomingRenewals.length * 18 + (highestSubscription?.amount ?? 0));
  const executionRisk = clamp(slippingGoals.length * 28 + urgentMilestones.length * 16 + unreadCount * 4);
  const readiness = clamp(100 - (spendRisk * 0.25 + executionRisk * 0.35) + coverage * 0.3);

  return {
    scores: {
      readiness,
      contextCoverage: coverage,
      spendRisk,
      executionRisk,
    },
    lanes: [
      { id: "money", label: "Spend control", score: laneScore("money", insights), count: insights.filter((insight) => insight.kind === "money").length, description: "Renewals, auto-pay, and budget pressure." },
      { id: "goals", label: "Goal momentum", score: laneScore("goals", insights), count: insights.filter((insight) => insight.kind === "goals").length, description: "Progress drift and next recoverable moves." },
      { id: "learning", label: "Knowledge loop", score: laneScore("learning", insights), count: insights.filter((insight) => insight.kind === "learning").length, description: "Roadmaps, notes, and AI context depth." },
      { id: "operations", label: "Workspace hygiene", score: laneScore("operations", insights), count: insights.filter((insight) => insight.kind === "operations").length, description: "Alerts, organization, and daily maintenance." },
    ],
    insights: filteredInsights,
    sources: sourceDefinitions,
  };
}
