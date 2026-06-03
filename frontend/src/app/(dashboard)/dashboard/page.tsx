"use client";

import { Bell, Brain, Sparkles, Target, WalletCards, AlertTriangle, CalendarDays, ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/dashboard/empty-state";
import { LoadingState } from "@/components/dashboard/loading-state";
import { StatCard } from "@/components/dashboard/stat-card";
import { MotionPanel } from "@/components/motion/motion-panel";
import { formatCurrency, formatDate, formatRelativeDate } from "@/lib/format";
import { useDashboardSummaryQuery, useNotificationsQuery } from "@/hooks/use-app-data";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getDaysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

const notificationAccents: Record<string, string> = {
  SUBSCRIPTION_RENEWAL: "border-l-emerald-500 bg-emerald-500/5",
  GOAL_REMINDER: "border-l-sky-500 bg-sky-500/5",
  MEMORY_INSIGHT: "border-l-violet-500 bg-violet-500/5",
  SYSTEM: "border-l-amber-500 bg-amber-500/5",
};

export default function DashboardPage() {
  const summaryQuery = useDashboardSummaryQuery();
  const notificationsQuery = useNotificationsQuery();
  const user = useAuthStore((state) => state.user);

  if (summaryQuery.isLoading) return <LoadingState label="Loading your workspace" />;
  if (summaryQuery.error || !summaryQuery.data) {
    return <EmptyState icon={Bell} title="Dashboard unavailable" description="The API could not load your workspace summary." />;
  }

  const { metrics, upcomingRenewals } = summaryQuery.data;
  const urgentRenewals = upcomingRenewals.filter((r) => getDaysUntil(r.renewalDate) <= 7);
  const notifications = (notificationsQuery.data?.notifications ?? []).slice(0, 5);

  const firstName = user?.name?.split(" ")[0] ?? "there";
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const stats = [
    { label: "Subscriptions", value: String(metrics.subscriptions), change: formatCurrency(metrics.monthlySpend) + "/mo", icon: WalletCards, accent: "emerald" as const },
    { label: "Active Goals", value: String(metrics.activeGoals), change: `${metrics.completedGoals} done`, icon: Target, accent: "sky" as const },
    { label: "AI Memories", value: String(metrics.memories), change: "Context items", icon: Brain, accent: "violet" as const },
    { label: "Unread Alerts", value: String(metrics.unreadNotifications), change: "Live", icon: Bell, accent: "amber" as const },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting header */}
      <MotionPanel>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {getGreeting()}, {firstName}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{today}</p>
          </div>
          {urgentRenewals.length > 0 && (
            <Link
              href="/dashboard/subscriptions"
              className="inline-flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              {urgentRenewals.length} renewal{urgentRenewals.length > 1 ? "s" : ""} due soon
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </MotionPanel>

      {/* Stat cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, i) => (
          <MotionPanel key={stat.label} delay={i * 0.06}>
            <StatCard {...stat} />
          </MotionPanel>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        {/* Upcoming renewals */}
        <MotionPanel delay={0.1}>
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-emerald-500" />
                <h2 className="font-semibold">Upcoming renewals</h2>
              </div>
              <Link
                href="/dashboard/subscriptions"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y">
              {upcomingRenewals.length ? (
                upcomingRenewals.slice(0, 5).map((renewal) => {
                  const days = getDaysUntil(renewal.renewalDate);
                  const isUrgent = days <= 3;
                  const isSoon = days <= 7;
                  return (
                    <div key={renewal.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-secondary/50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold",
                          isUrgent ? "bg-red-500/15 text-red-500" : isSoon ? "bg-amber-500/15 text-amber-500" : "bg-emerald-500/10 text-emerald-500",
                        )}>
                          {days}d
                        </div>
                        <div>
                          <p className="text-sm font-medium">{renewal.serviceName}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(renewal.renewalDate)} · {formatRelativeDate(renewal.renewalDate)}</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold tabular-nums">{formatCurrency(renewal.amount)}</p>
                    </div>
                  );
                })
              ) : (
                <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                  No renewals in the next 30 days
                </div>
              )}
            </div>
          </div>
        </MotionPanel>

        {/* Right column */}
        <div className="space-y-4">
          {/* Notification stream */}
          <MotionPanel delay={0.14}>
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-violet-500" />
                  <h2 className="font-semibold">Recent alerts</h2>
                </div>
                <Link
                  href="/dashboard/notifications"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="divide-y">
                {notifications.length ? (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        "border-l-2 px-4 py-3 hover:bg-secondary/30 transition-colors",
                        notificationAccents[n.type] ?? "border-l-muted",
                      )}
                    >
                      <p className={cn("text-sm leading-snug", !n.isRead && "font-medium")}>{n.message}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(n.createdAt)}</p>
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-6 text-center text-sm text-muted-foreground">No notifications yet</div>
                )}
              </div>
            </div>
          </MotionPanel>

          {/* Quick actions */}
          <MotionPanel delay={0.18}>
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b">
                <Sparkles className="h-4 w-4 text-violet-500" />
                <h2 className="font-semibold">Quick actions</h2>
              </div>
              <div className="p-3 grid grid-cols-2 gap-2">
                {[
                  { label: "Ask AI", href: "/dashboard/ai", icon: Sparkles, color: "text-violet-500 bg-violet-500/10" },
                  { label: "Add Goal", href: "/dashboard/goals", icon: Target, color: "text-sky-500 bg-sky-500/10" },
                  { label: "Add Sub", href: "/dashboard/subscriptions", icon: WalletCards, color: "text-emerald-500 bg-emerald-500/10" },
                  { label: "Analytics", href: "/dashboard/analytics", icon: TrendingUp, color: "text-amber-500 bg-amber-500/10" },
                ].map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex items-center gap-2.5 rounded-lg border p-3 text-sm font-medium hover:bg-secondary transition-colors group"
                  >
                    <div className={cn("flex h-7 w-7 items-center justify-center rounded-md flex-shrink-0", action.color)}>
                      <action.icon className="h-3.5 w-3.5" />
                    </div>
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>
          </MotionPanel>
        </div>
      </div>

      {/* Workspace summary */}
      {(metrics.notes + metrics.roadmaps + metrics.sections) > 0 && (
        <MotionPanel delay={0.22}>
          <div className="rounded-xl border bg-card px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm">Workspace at a glance</h2>
              <Link href="/dashboard/workspace" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                Open <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {[
                { label: "Sections", value: metrics.sections },
                { label: "Roadmaps", value: metrics.roadmaps },
                { label: "Notes", value: metrics.notes },
                { label: "Photos", value: metrics.photos },
                { label: "Videos", value: metrics.videos },
                { label: "Graphics", value: metrics.graphics },
              ].map((item) => (
                <div key={item.label} className="text-center rounded-lg bg-secondary/50 p-2.5">
                  <p className="text-lg font-bold tabular-nums">{item.value}</p>
                  <p className="text-[10px] text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </MotionPanel>
      )}
    </div>
  );
}
