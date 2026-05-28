"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { LoadingState } from "@/components/dashboard/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { NotificationList } from "@/types/api";

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiRequest<NotificationList>("/notifications"),
    refetchInterval: 15000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/notifications/${id}/read`, { method: "PATCH" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllMutation = useMutation({
    mutationFn: () => apiRequest("/notifications/read-all", { method: "PATCH" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/notifications/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <PageHeader title="Notifications" description={`${notificationsQuery.data?.unreadCount ?? 0} unread alerts.`} />
        <Button variant="outline" onClick={() => markAllMutation.mutate()}>
          <CheckCheck className="h-4 w-4" />
          Mark all read
        </Button>
      </div>
      {notificationsQuery.isLoading ? <LoadingState /> : null}
      {notificationsQuery.data?.notifications.length ? (
        <div className="space-y-3">
          {notificationsQuery.data.notifications.map((notification) => (
            <div key={notification.id} className="flex flex-col gap-4 rounded-lg border bg-card p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={notification.isRead ? "secondary" : "default"}>{notification.type.replaceAll("_", " ")}</Badge>
                  <span className="text-xs text-muted-foreground">{formatDate(notification.createdAt)}</span>
                </div>
                <p className="mt-2 text-sm font-medium">{notification.message}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={notification.isRead} onClick={() => markReadMutation.mutate(notification.id)}>
                  Read
                </Button>
                <Button size="icon" variant="ghost" aria-label="Delete notification" onClick={() => deleteMutation.mutate(notification.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : notificationsQuery.isSuccess ? (
        <EmptyState icon={Bell} title="No notifications" description="New subscription, goal, and memory events will appear here." />
      ) : null}
    </div>
  );
}
