"use client";

import { useQuery } from "@tanstack/react-query";
import { Bell, Brain, Target, WalletCards } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { LoadingState } from "@/components/dashboard/loading-state";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { MotionPanel } from "@/components/motion/motion-panel";
import { apiRequest } from "@/lib/api";
import { formatCurrency, formatDate, formatRelativeDate } from "@/lib/format";
import type { DashboardSummary, NotificationList } from "@/types/api";

export default function DashboardPage() {
  const summaryQuery = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => apiRequest<DashboardSummary>("/dashboard/summary"),
  });

  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiRequest<NotificationList>("/notifications"),
    refetchInterval: 15000,
  });

  if (summaryQuery.isLoading) {
    return <LoadingState label="Loading dashboard" />;
  }

  if (summaryQuery.error || !summaryQuery.data) {
    return <EmptyState icon={Bell} title="Dashboard unavailable" description="The API could not load your workspace summary." />;
  }

  const { metrics, upcomingRenewals } = summaryQuery.data;
  const stats = [
    { label: "Subscriptions", value: String(metrics.subscriptions), change: formatCurrency(metrics.monthlySpend), icon: WalletCards },
    { label: "Active goals", value: String(metrics.activeGoals), change: `${metrics.completedGoals} done`, icon: Target },
    { label: "Memories", value: String(metrics.memories), change: "AI context", icon: Brain },
    { label: "Unread alerts", value: String(metrics.unreadNotifications), change: "Live", icon: Bell },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="A live view of subscriptions, goals, memories, and notifications." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <MotionPanel key={stat.label} delay={index * 0.05}>
            <StatCard {...stat} />
          </MotionPanel>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <MotionPanel className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold">Upcoming renewals</h2>
          <div className="mt-5 space-y-3">
            {upcomingRenewals.length ? (
              upcomingRenewals.map((renewal) => (
                <div key={renewal.id} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="font-medium">{renewal.serviceName}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(renewal.renewalDate)} · {formatRelativeDate(renewal.renewalDate)}
                    </p>
                  </div>
                  <p className="font-semibold">{formatCurrency(renewal.amount)}</p>
                </div>
              ))
            ) : (
              <p className="rounded-md border bg-muted p-4 text-sm text-muted-foreground">No renewals in the next 30 days.</p>
            )}
          </div>
        </MotionPanel>
        <MotionPanel className="rounded-lg border bg-card p-6" delay={0.08}>
          <h2 className="text-lg font-semibold">Notification stream</h2>
          <div className="mt-5 space-y-3">
            {(notificationsQuery.data?.notifications ?? []).slice(0, 5).map((notification) => (
              <div key={notification.id} className="rounded-md border p-3">
                <p className="text-sm font-medium">{notification.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatDate(notification.createdAt)}</p>
              </div>
            ))}
            {!notificationsQuery.data?.notifications.length ? (
              <p className="rounded-md border bg-muted p-4 text-sm text-muted-foreground">No notifications yet.</p>
            ) : null}
          </div>
        </MotionPanel>
      </div>
    </div>
  );
}
