"use client";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { BarChart3, Brain, Target, TrendingUp, WalletCards } from "lucide-react";
import { MotionPanel } from "@/components/motion/motion-panel";
import { LoadingState } from "@/components/dashboard/loading-state";
import { useSubscriptionsQuery, useGoalsQuery, useMemoriesQuery } from "@/hooks/use-app-data";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

/* ── colour palette that works in both themes ────────────────────────────── */
const PALETTE = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#6366f1", "#14b8a6"];

const GOAL_STATUS_COLOR: Record<string, string> = {
  IN_PROGRESS: "#8b5cf6",
  NOT_STARTED: "#71717a",
  COMPLETED: "#10b981",
  ARCHIVED: "#f59e0b",
};

/* ── small helpers ───────────────────────────────────────────────────────── */
function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const k = key(item);
    (acc[k] ??= []).push(item);
    return acc;
  }, {});
}

function SummaryCard({
  label, value, sub, icon: Icon, accent,
}: { label: string; value: string; sub: string; icon: React.ElementType; accent: string }) {
  return (
    <div className={cn("rounded-xl border bg-card p-5 hover:shadow-md transition-shadow")}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", accent)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-4 text-3xl font-bold tabular-nums tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

/* ── custom tooltip ──────────────────────────────────────────────────────── */
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name?: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 shadow-lg text-xs">
      {label && <p className="font-medium mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-muted-foreground">
          {p.name ? `${p.name}: ` : ""}<span className="text-foreground font-semibold">{typeof p.value === "number" && p.value < 100 ? `${p.value}%` : formatCurrency(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 shadow-lg text-xs">
      <p className="font-medium">{item.name}</p>
      <p className="text-muted-foreground">Spend: <span className="text-foreground font-semibold">{formatCurrency(item.value)}</span></p>
    </div>
  );
}

export default function AnalyticsPage() {
  const subscriptionsQuery = useSubscriptionsQuery();
  const goalsQuery = useGoalsQuery();
  const memoriesQuery = useMemoriesQuery();

  const isLoading = subscriptionsQuery.isLoading || goalsQuery.isLoading || memoriesQuery.isLoading;
  if (isLoading) return <LoadingState label="Loading analytics" />;

  const subscriptions = subscriptionsQuery.data ?? [];
  const goals = goalsQuery.data ?? [];
  const memories = memoriesQuery.data ?? [];

  /* ── Subscription metrics ─────────────────────────────────────────────── */
  const totalMonthly = subscriptions.reduce((s, sub) => s + sub.amount, 0);
  const totalAnnual = totalMonthly * 12;
  const autoRenewCount = subscriptions.filter((s) => s.autoRenew).length;

  const byCategory = groupBy(subscriptions, (s) => s.category || "Other");
  const categoryData = Object.entries(byCategory)
    .map(([name, subs]) => ({ name, value: subs.reduce((t, s) => t + s.amount, 0) }))
    .sort((a, b) => b.value - a.value);

  const topSubsData = [...subscriptions]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8)
    .map((s) => ({ name: s.serviceName, amount: s.amount }));

  /* ── Goal metrics ─────────────────────────────────────────────────────── */
  const activeGoals = goals.filter((g) => g.status === "IN_PROGRESS");
  const completedGoals = goals.filter((g) => g.status === "COMPLETED");
  const avgProgress = goals.length
    ? Math.round(goals.reduce((s, g) => s + g.progressPercent, 0) / goals.length)
    : 0;

  const goalProgressData = goals.slice(0, 8).map((g) => ({
    name: g.title.length > 20 ? g.title.slice(0, 20) + "…" : g.title,
    progress: g.progressPercent,
    fill: GOAL_STATUS_COLOR[g.status] ?? "#8b5cf6",
  }));

  const goalStatusData = Object.entries(groupBy(goals, (g) => g.status)).map(([name, gs]) => ({
    name: name.replace("_", " "),
    value: gs.length,
  }));

  /* ── Memory metrics ───────────────────────────────────────────────────── */
  const memoryTypeData = Object.entries(groupBy(memories, (m) => m.type)).map(([name, ms]) => ({
    name,
    value: ms.length,
  }));

  const avgImportance = memories.length
    ? (memories.reduce((s, m) => s + m.importance, 0) / memories.length).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      {/* Page header */}
      <MotionPanel>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
            <BarChart3 className="h-5 w-5 text-violet-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
            <p className="text-sm text-muted-foreground">Real-time insights from your workspace data</p>
          </div>
        </div>
      </MotionPanel>

      {/* Summary row */}
      <MotionPanel delay={0.05}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Monthly spend" value={formatCurrency(totalMonthly)} sub={`${formatCurrency(totalAnnual)}/year projected`} icon={WalletCards} accent="bg-emerald-500/10 text-emerald-500" />
          <SummaryCard label="Active goals" value={String(activeGoals.length)} sub={`${avgProgress}% avg progress`} icon={Target} accent="bg-sky-500/10 text-sky-500" />
          <SummaryCard label="AI memories" value={String(memories.length)} sub={`${avgImportance} avg importance`} icon={Brain} accent="bg-violet-500/10 text-violet-500" />
          <SummaryCard label="Auto-renewing" value={String(autoRenewCount)} sub={`of ${subscriptions.length} subscriptions`} icon={TrendingUp} accent="bg-amber-500/10 text-amber-500" />
        </div>
      </MotionPanel>

      {/* Subscription charts */}
      <MotionPanel delay={0.1}>
        <div className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
          {/* Top subscriptions bar chart */}
          <div className="rounded-xl border bg-card p-5">
            <h2 className="font-semibold mb-1">Spend by subscription</h2>
            <p className="text-xs text-muted-foreground mb-4">Monthly cost, sorted highest to lowest</p>
            {topSubsData.length ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={topSubsData} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    tick={{ fontSize: 11, fill: "currentColor" }}
                    className="text-muted-foreground"
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "oklch(1 0 0 / 0.04)" }} />
                  <Bar dataKey="amount" radius={[0, 6, 6, 0]} fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
                No subscription data yet
              </div>
            )}
          </div>

          {/* Category donut */}
          <div className="rounded-xl border bg-card p-5">
            <h2 className="font-semibold mb-1">Spend by category</h2>
            <p className="text-xs text-muted-foreground mb-4">Monthly distribution</p>
            {categoryData.length ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={index} fill={PALETTE[index % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend
                    formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                    iconSize={8}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
                No category data yet
              </div>
            )}
          </div>
        </div>
      </MotionPanel>

      {/* Goals charts */}
      <MotionPanel delay={0.15}>
        <div className="grid gap-4 lg:grid-cols-[1fr_0.6fr]">
          {/* Goal progress bars */}
          <div className="rounded-xl border bg-card p-5">
            <h2 className="font-semibold mb-1">Goal progress</h2>
            <p className="text-xs text-muted-foreground mb-4">Completion % per goal</p>
            {goalProgressData.length ? (
              <ResponsiveContainer width="100%" height={Math.max(180, goalProgressData.length * 36)}>
                <BarChart data={goalProgressData} layout="vertical" margin={{ left: 0, right: 40, top: 0, bottom: 0 }}>
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={130}
                    tick={{ fontSize: 11, fill: "currentColor" }}
                    className="text-muted-foreground"
                  />
                  <Tooltip
                    content={({ active, payload, label }) =>
                      active && payload?.length ? (
                        <div className="rounded-lg border bg-popover px-3 py-2 shadow-lg text-xs">
                          <p className="font-medium">{label}</p>
                          <p className="text-muted-foreground">Progress: <span className="text-foreground font-semibold">{payload[0].value}%</span></p>
                        </div>
                      ) : null
                    }
                    cursor={{ fill: "oklch(1 0 0 / 0.04)" }}
                  />
                  <Bar dataKey="progress" radius={[0, 6, 6, 0]}>
                    {goalProgressData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[180px] items-center justify-center text-sm text-muted-foreground">
                No goals yet
              </div>
            )}
          </div>

          {/* Goal status + Memory type donut */}
          <div className="space-y-4">
            <div className="rounded-xl border bg-card p-5">
              <h2 className="font-semibold mb-1">Goal status</h2>
              <p className="text-xs text-muted-foreground mb-3">By status breakdown</p>
              {goalStatusData.length ? (
                <div className="space-y-2">
                  {goalStatusData.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: PALETTE[i % PALETTE.length] }} />
                      <p className="text-xs flex-1 capitalize text-muted-foreground">{item.name.toLowerCase()}</p>
                      <p className="text-xs font-semibold tabular-nums">{item.value}</p>
                    </div>
                  ))}
                  <div className="mt-1 pt-1 border-t flex justify-between">
                    <span className="text-xs text-muted-foreground">Completed</span>
                    <span className="text-xs font-semibold text-emerald-500">{completedGoals.length} / {goals.length}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No goals yet</p>
              )}
            </div>

            <div className="rounded-xl border bg-card p-5">
              <h2 className="font-semibold mb-1">Memory types</h2>
              <p className="text-xs text-muted-foreground mb-3">AI context breakdown</p>
              {memoryTypeData.length ? (
                <div className="space-y-2">
                  {memoryTypeData.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: PALETTE[i % PALETTE.length] }} />
                      <p className="text-xs flex-1 capitalize text-muted-foreground">{item.name.toLowerCase()}</p>
                      <p className="text-xs font-semibold tabular-nums">{item.value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No memories yet</p>
              )}
            </div>
          </div>
        </div>
      </MotionPanel>
    </div>
  );
}
