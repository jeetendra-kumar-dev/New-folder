"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Brain, Plus, Trash2 } from "lucide-react";
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
import type { Memory } from "@/types/api";

const memoryTypes = ["PREFERENCE", "FACT", "CONTEXT", "INSIGHT", "REMINDER", "OTHER"];

export default function MemoriesPage() {
  const queryClient = useQueryClient();
  const notify = useNotificationStore((s) => s.notify);
  const soundEnabled = useNotificationStore((s) => s.soundEnabled);
  const [form, setForm] = useState({ title: "", content: "", type: "CONTEXT", importance: "3", source: "" });

  const memoriesQuery = useQuery({
    queryKey: ["memories"],
    queryFn: () => apiRequest<Memory[]>("/memories"),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      apiRequest<Memory>("/memories", {
        method: "POST",
        body: jsonBody({
          title: form.title || undefined,
          content: form.content,
          type: form.type,
          importance: Number(form.importance),
          source: form.source || undefined,
        }),
      }),
    onSuccess: () => {
      setForm({ title: "", content: "", type: "CONTEXT", importance: "3", source: "" });
      void queryClient.invalidateQueries({ queryKey: ["memories"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      notify({ title: "Saved", message: "Memory saved.", variant: "success" });
      if (soundEnabled) playNotificationBeep();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/memories/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["memories"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      notify({ title: "Removed", message: "Memory deleted.", variant: "destructive" });
      if (soundEnabled) playNotificationBeep();
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Memories" description="Store durable AI context for PocketPilot." />
      <form
        className="grid gap-3 rounded-lg border bg-card p-4 lg:grid-cols-[1fr_160px_120px_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          createMutation.mutate();
        }}
      >
        <Input placeholder="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
        <select className="h-10 rounded-md border bg-background px-3 text-sm" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
          {memoryTypes.map((type) => (
            <option key={type} value={type}>
              {type.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        <Input type="number" min="1" max="5" value={form.importance} onChange={(event) => setForm({ ...form, importance: event.target.value })} />
        <Button disabled={createMutation.isPending}>
          <Plus className="h-4 w-4" />
          Save
        </Button>
        <Input className="lg:col-span-4" placeholder="Source" value={form.source} onChange={(event) => setForm({ ...form, source: event.target.value })} />
        <Textarea className="lg:col-span-4" placeholder="Memory content" value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} required />
      </form>
      {createMutation.error ? <p className="text-sm text-destructive">{createMutation.error.message}</p> : null}
      {memoriesQuery.isLoading ? <LoadingState /> : null}
      {memoriesQuery.data?.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {memoriesQuery.data.map((memory) => (
            <div key={memory.id} className="rounded-lg border bg-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{memory.title ?? memory.type.replaceAll("_", " ")}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{memory.source ?? "PocketPilot"}</p>
                </div>
                <Button variant="ghost" size="icon" aria-label="Delete memory" onClick={() => deleteMutation.mutate(memory.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{memory.content}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Badge>{memory.type.replaceAll("_", " ")}</Badge>
                <Badge variant="outline">Importance {memory.importance}</Badge>
              </div>
            </div>
          ))}
        </div>
      ) : memoriesQuery.isSuccess ? (
        <EmptyState icon={Brain} title="No memories yet" description="Save facts, preferences, and context for future AI workflows." />
      ) : null}
    </div>
  );
}
