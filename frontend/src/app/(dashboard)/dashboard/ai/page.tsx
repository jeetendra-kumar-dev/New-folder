"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bot,
  BrainCircuit,
  ChartNoAxesCombined,
  Cpu,
  Layers3,
  MessageSquareText,
  Route,
  Send,
  Sparkles,
  Tags,
  Trash2,
} from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, jsonBody } from "@/lib/api";
import { cn } from "@/lib/utils";
import { playNotificationBeep } from "@/lib/sound";
import { useNotificationStore } from "@/stores/notification-store";
import type { AiChatResult, AiConversation, AiMessage, AiModel, AiModelId, AiModelRunResult } from "@/types/api";

const chatSuggestions = [
  "Give me an overview of my data",
  "What subscriptions are renewing soon?",
  "Summarize my active goals",
  "What roadmaps am I working on?",
  "List my notes and memories",
];

const modelPrompts: Record<AiModelId, string> = {
  "portfolio-mentor": "I want to become job-ready in React, Next.js, Node, Express, TypeScript, Tailwind, deployment, and AI integration.",
  "subscription-optimizer": "Find subscription risks and tell me what I should review first.",
  "goal-coach": "Create a 7-day plan that helps me ship one full-stack AI portfolio feature.",
  "content-classifier": "A video tutorial about deploying a Next.js frontend and Express API with environment variables.",
  "model-architect": "Create an AI model that reviews my project idea and turns it into frontend, backend, database, and deployment tasks.",
};

const modelIcons = {
  advisor: BrainCircuit,
  analyzer: ChartNoAxesCombined,
  classifier: Tags,
  architect: Layers3,
} satisfies Record<AiModel["category"], typeof BrainCircuit>;

export default function AiPage() {
  const queryClient = useQueryClient();
  const bottomRef = useRef<HTMLDivElement>(null);
  const notify = useNotificationStore((s) => s.notify);
  const clearToasts = useNotificationStore((s) => s.clearToasts);
  const soundEnabled = useNotificationStore((s) => s.soundEnabled);
  const [message, setMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [mode, setMode] = useState<"openai" | "local" | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<AiModelId>("model-architect");
  const [modelInput, setModelInput] = useState(modelPrompts["model-architect"]);
  const [temperature, setTemperature] = useState(0.3);
  const [modelResult, setModelResult] = useState<AiModelRunResult | null>(null);

  const modelsQuery = useQuery({
    queryKey: ["ai-models"],
    queryFn: () => apiRequest<AiModel[]>("/ai/models"),
  });

  const selectedModel = useMemo(
    () => modelsQuery.data?.find((model) => model.id === selectedModelId),
    [modelsQuery.data, selectedModelId],
  );

  const conversationQuery = useQuery({
    queryKey: ["ai-conversation", conversationId],
    queryFn: () => apiRequest<AiConversation>(`/ai/conversations/${conversationId}`),
    enabled: Boolean(conversationId),
  });

  useEffect(() => {
    if (conversationQuery.data?.messages) {
      setMessages(conversationQuery.data.messages);
    }
  }, [conversationQuery.data]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const modelMutation = useMutation({
    mutationFn: () =>
      apiRequest<AiModelRunResult>("/ai/models/run", {
        method: "POST",
        body: jsonBody({ modelId: selectedModelId, input: modelInput, temperature }),
      }),
    onSuccess: (result) => {
      setModelResult(result);
      clearToasts();
      const looksLikeSummary = /summarize|summary/i.test(modelInput) || selectedModelId === "subscription-optimizer" || selectedModelId === "goal-coach";
      notify({
        title: looksLikeSummary ? "Summary ready" : "AI result ready",
        message: `Model "${result.model.name}" responded (${result.mode}).`,
        variant: "success",
      });
      if (soundEnabled) playNotificationBeep();
    },
  });

  const chatMutation = useMutation({
    mutationFn: (text: string) =>
      apiRequest<AiChatResult>("/ai/chat", {
        method: "POST",
        body: jsonBody({ message: text, conversationId }),
      }),
    onMutate: (text) => {
      const optimistic: AiMessage = {
        id: `temp-${Date.now()}`,
        role: "USER",
        content: text,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimistic]);
    },
    onSuccess: async (result) => {
      setConversationId(result.conversationId);
      setMode(result.mode);
      const conversation = await apiRequest<AiConversation>(`/ai/conversations/${result.conversationId}`);
      setMessages(conversation.messages);
      void queryClient.invalidateQueries({ queryKey: ["ai-conversations"] });

      clearToasts();
      const lastAssistant = conversation.messages.slice().reverse().find((m) => m.role === "ASSISTANT");
      const userAskedSummary = /summarize|summary|overview/i.test(conversation.title ?? "") || /summarize|summary|overview/i.test(conversation.messages.at(-2)?.content ?? "");
      notify({
        title: userAskedSummary ? "AI summary" : "AI message",
        message: lastAssistant?.content ? `${lastAssistant.content.slice(0, 120)}${lastAssistant.content.length > 120 ? "…" : ""}` : "New response received.",
        variant: "default",
        timeoutMs: 6500,
      });
      if (soundEnabled) playNotificationBeep();
    },
    onError: () => {
      setMessages((prev) => prev.filter((entry) => !entry.id.startsWith("temp-")));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest(`/ai/conversations/${conversationId}`, { method: "DELETE" }),
    onSuccess: () => {
      setConversationId(undefined);
      setMessages([]);
      setMode(null);
      void queryClient.invalidateQueries({ queryKey: ["ai-conversations"] });
    },
  });

  function chooseModel(modelId: AiModelId) {
    setSelectedModelId(modelId);
    setModelInput(modelPrompts[modelId]);
    setModelResult(null);
  }

  function runSelectedModel() {
    if (!modelInput.trim() || modelMutation.isPending) return;
    modelMutation.mutate();
  }

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || chatMutation.isPending) return;
    setMessage("");
    chatMutation.mutate(trimmed);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="AI Model Studio"
        description="Train your full-stack instincts with typed model APIs, local model logic, provider fallback, and a production dashboard workflow."
      />

      <div className="grid gap-4 2xl:grid-cols-[minmax(320px,0.95fr)_minmax(420px,1.05fr)]">
        <section className="min-w-0 rounded-lg border bg-card">
          <div className="border-b p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold tracking-normal">Model Creator</h2>
                <p className="mt-1 text-sm text-muted-foreground">Design, run, evaluate, and deploy AI tasks.</p>
              </div>
              <Badge variant="outline" className="gap-1">
                <Cpu className="h-3.5 w-3.5" />
                {modelResult?.mode === "openai" ? "Provider" : "Local"}
              </Badge>
            </div>
          </div>

          <div className="grid gap-4 p-4 2xl:grid-cols-[minmax(220px,0.8fr)_minmax(0,1.2fr)]">
            <div className="space-y-2">
              {modelsQuery.isLoading ? (
                <div className="rounded-md border p-3 text-sm text-muted-foreground">Loading models...</div>
              ) : null}
              {modelsQuery.data?.map((model) => {
                const Icon = modelIcons[model.category];
                const selected = model.id === selectedModelId;

                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => chooseModel(model.id)}
                    className={cn(
                      "w-full rounded-md border p-3 text-left transition-colors hover:bg-accent",
                      selected ? "border-foreground bg-accent text-accent-foreground" : "bg-background",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium">{model.name}</span>
                        <span className="mt-1 block text-xs leading-5 text-muted-foreground">{model.level}</span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="min-w-0 space-y-4">
              <div className="rounded-md border bg-background p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold tracking-normal">{selectedModel?.name ?? "Select a model"}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{selectedModel?.description}</p>
                  </div>
                  {selectedModel ? <Badge variant="secondary">{selectedModel.category}</Badge> : null}
                </div>

                {selectedModel ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedModel.stackSkills.map((skill) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="space-y-3">
                <Textarea
                  className="min-h-36 resize-none"
                  value={modelInput}
                  onChange={(event) => setModelInput(event.target.value)}
                  placeholder={selectedModel?.inputHint ?? "Describe the model task"}
                />
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex min-w-48 flex-1 items-center gap-3 text-sm text-muted-foreground">
                    <span className="shrink-0">Temperature</span>
                    <input
                      aria-label="Temperature"
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={temperature}
                      onChange={(event) => setTemperature(Number(event.target.value))}
                      className="w-full accent-foreground"
                    />
                    <span className="w-8 text-right tabular-nums">{temperature.toFixed(1)}</span>
                  </label>
                  <Button onClick={runSelectedModel} disabled={modelMutation.isPending || !modelInput.trim()}>
                    <Cpu className="h-4 w-4" />
                    {modelMutation.isPending ? "Running" : "Run Model"}
                  </Button>
                </div>
                {modelMutation.error ? <p className="text-sm text-destructive">{modelMutation.error.message}</p> : null}
              </div>

              <div className="rounded-md border bg-background">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Route className="h-4 w-4" />
                    Model Output
                  </div>
                  {modelResult ? <Badge variant="outline">{new Date(modelResult.createdAt).toLocaleTimeString()}</Badge> : null}
                </div>
                <div className="p-4">
                  {modelResult ? (
                    <div className="space-y-4">
                      <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-muted p-4 text-sm leading-6">
                        {modelResult.output}
                      </pre>
                      <div className="grid gap-2 sm:grid-cols-3">
                        <Metric label="Subscriptions" value={modelResult.contextStats.subscriptionCount} />
                        <Metric label="Goals" value={modelResult.contextStats.activeGoalCount} />
                        <Metric label="Roadmaps" value={modelResult.contextStats.roadmapCount} />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Teaching points</p>
                        {modelResult.teachingPoints.map((point) => (
                          <p key={point} className="rounded-md bg-muted px-3 py-2 text-sm leading-6 text-muted-foreground">
                            {point}
                          </p>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <EmptyState
                      icon={Sparkles}
                      title="No run yet"
                      description="Choose a model, tune it, and run it against your workspace context."
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex min-h-[720px] min-w-0 flex-col rounded-lg border bg-card">
          <div className="border-b p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold tracking-normal">Workspace Assistant</h2>
                <p className="mt-1 text-sm text-muted-foreground">Chat with your saved subscriptions, goals, roadmaps, notes, and memories.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <MessageSquareText className="h-3.5 w-3.5" />
                  {mode === "openai" ? "Provider" : mode === "local" ? "Local" : "Ready"}
                </Badge>
                {conversationId ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate()}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {!messages.length ? (
                <EmptyState
                  icon={Bot}
                  title="Ask PocketPilot AI"
                  description="Use chat for broad questions and model creator for specialized AI tasks."
                />
              ) : null}
              {messages.map((entry) => (
                <div key={entry.id} className={cn("flex", entry.role === "USER" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-md px-4 py-3 text-sm leading-6",
                      entry.role === "USER" ? "bg-primary text-primary-foreground" : "bg-muted",
                    )}
                  >
                    {entry.content}
                  </div>
                </div>
              ))}
              {chatMutation.isPending ? (
                <div className="flex justify-start">
                  <div className="rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">Thinking...</div>
                </div>
              ) : null}
              <div ref={bottomRef} />
            </div>

            <div className="border-t p-4">
              <div className="mb-3 flex flex-wrap gap-2">
                {chatSuggestions.map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => send(suggestion)}
                    disabled={chatMutation.isPending}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
              <form
                className="flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  send(message);
                }}
              >
                <Input
                  placeholder="Ask about your data"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  disabled={chatMutation.isPending}
                />
                <Button type="submit" disabled={chatMutation.isPending || !message.trim()}>
                  <Send className="h-4 w-4" />
                  Send
                </Button>
              </form>
              {chatMutation.error ? <p className="mt-2 text-sm text-destructive">{chatMutation.error.message}</p> : null}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}
