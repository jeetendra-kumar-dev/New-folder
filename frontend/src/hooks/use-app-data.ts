"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type {
  DashboardSummary,
  Goal,
  Memory,
  Note,
  NotificationList,
  Roadmap,
  Subscription,
} from "@/types/api";

export const queryKeys = {
  dashboardSummary: ["dashboard-summary"] as const,
  notifications: ["notifications"] as const,
  subscriptions: ["subscriptions"] as const,
  goals: ["goals"] as const,
  memories: ["memories"] as const,
  roadmaps: ["roadmaps"] as const,
  notes: ["notes"] as const,
};

export function useDashboardSummaryQuery() {
  return useQuery({
    queryKey: queryKeys.dashboardSummary,
    queryFn: () => apiRequest<DashboardSummary>("/dashboard/summary"),
  });
}

export function useNotificationsQuery() {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () => apiRequest<NotificationList>("/notifications"),
    refetchInterval: 15000,
  });
}

export function useSubscriptionsQuery() {
  return useQuery({
    queryKey: queryKeys.subscriptions,
    queryFn: () => apiRequest<Subscription[]>("/subscriptions"),
  });
}

export function useGoalsQuery() {
  return useQuery({
    queryKey: queryKeys.goals,
    queryFn: () => apiRequest<Goal[]>("/goals"),
  });
}

export function useMemoriesQuery() {
  return useQuery({
    queryKey: queryKeys.memories,
    queryFn: () => apiRequest<Memory[]>("/memories"),
  });
}

export function useRoadmapsQuery() {
  return useQuery({
    queryKey: queryKeys.roadmaps,
    queryFn: () => apiRequest<Roadmap[]>("/workspace/roadmaps"),
  });
}

export function useNotesQuery() {
  return useQuery({
    queryKey: queryKeys.notes,
    queryFn: () => apiRequest<Note[]>("/workspace/notes"),
  });
}

export function useIntelligenceDataQueries() {
  const summary = useDashboardSummaryQuery();
  const notifications = useNotificationsQuery();
  const subscriptions = useSubscriptionsQuery();
  const goals = useGoalsQuery();
  const memories = useMemoriesQuery();
  const roadmaps = useRoadmapsQuery();
  const notes = useNotesQuery();
  const queries = [summary, notifications, subscriptions, goals, memories, roadmaps, notes];

  return {
    summary,
    notifications,
    subscriptions,
    goals,
    memories,
    roadmaps,
    notes,
    isLoading: queries.some((query) => query.isLoading),
    isFetching: queries.some((query) => query.isFetching),
    hasError: queries.some((query) => query.isError),
  };
}
