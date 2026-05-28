"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Target, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { LoadingState } from "@/components/dashboard/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, jsonBody } from "@/lib/api";
import { playNotificationBeep } from "@/lib/sound";
import { useNotificationStore } from "@/stores/notification-store";
import type { Goal } from "@/types/api";

export default function GoalsPage() {
  const queryClient = useQueryClient();
  const notify = useNotificationStore((s) => s.notify);
  const soundEnabled = useNotificationStore((s) => s.soundEnabled);
  const [form, setForm] = useState({ title: "", description: "", totalDays: "30", targetDate: "" });

  const goalsQuery = useQuery({
    queryKey: ["goals"],
    queryFn: () => apiRequest<Goal[]>("/goals"),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      apiRequest<Goal>("/goals", {
        method: "POST",
        body: jsonBody({
          title: form.title,
          description: form.description || undefined,
          totalDays: Number(form.totalDays),
          completedDays: 0,
          targetDate: form.targetDate ? new Date(form.targetDate).toISOString() : undefined,
        }),
      }),
    onSuccess: () => {
      setForm({ title: "", description: "", totalDays: "30", targetDate: "" });
      void queryClient.invalidateQueries({ queryKey: ["goals"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      notify({ title: "Saved", message: `Goal "${form.title}" created.`, variant: "success" });
      if (soundEnabled) playNotificationBeep();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (goal: Goal) =>
      apiRequest<Goal>(`/goals/${goal.id}`, {
        method: "PATCH",
        body: jsonBody({ completedDays: Math.min(goal.totalDays, goal.completedDays + 1) }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["goals"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      notify({ title: "Updated", message: "Goal progress saved.", variant: "default" });
      if (soundEnabled) playNotificationBeep();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/goals/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["goals"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      notify({ title: "Removed", message: "Goal deleted.", variant: "destructive" });
      if (soundEnabled) playNotificationBeep();
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Goals" description="Track streaks and completion progress." />
      <form
        className="grid gap-3 rounded-lg border bg-card p-4 lg:grid-cols-[1fr_140px_180px_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          createMutation.mutate();
        }}
      >
        <Input placeholder="Goal title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
        <Input type="number" min="1" value={form.totalDays} onChange={(event) => setForm({ ...form, totalDays: event.target.value })} required />
        <Input type="date" value={form.targetDate} onChange={(event) => setForm({ ...form, targetDate: event.target.value })} />
        <Button disabled={createMutation.isPending}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
        <div className="lg:col-span-4">
          <Textarea placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        </div>
      </form>
      {createMutation.error ? <p className="text-sm text-destructive">{createMutation.error.message}</p> : null}
      {goalsQuery.isLoading ? <LoadingState /> : null}
      {goalsQuery.data?.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {goalsQuery.data.map((goal) => (
            <div key={goal.id} className="rounded-lg border bg-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{goal.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {goal.completedDays}/{goal.totalDays} days complete
                  </p>
                </div>
                <Button variant="ghost" size="icon" aria-label="Delete goal" onClick={() => deleteMutation.mutate(goal.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-5 h-2 rounded-sm bg-muted">
                <div className="h-2 rounded-sm bg-primary" style={{ width: `${goal.progressPercent}%` }} />
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <Badge variant={goal.status === "COMPLETED" ? "success" : "secondary"}>{goal.status.replaceAll("_", " ")}</Badge>
                <Button size="sm" variant="outline" disabled={goal.status === "COMPLETED"} onClick={() => updateMutation.mutate(goal)}>
                  Add day
                </Button>
              </div>
              {goal.description ? <p className="mt-4 text-sm leading-6 text-muted-foreground">{goal.description}</p> : null}
            </div>
          ))}
        </div>
      ) : goalsQuery.isSuccess ? (
        <EmptyState icon={Target} title="No goals yet" description="Create a goal and PocketPilot will track progress notifications." />
      ) : null}
    </div>
  );
}
