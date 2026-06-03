"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  CircleGauge,
  DatabaseZap,
  Eye,
  Gauge,
  MessageSquareText,
  Pin,
  PinOff,
  Radar,
  RefreshCcw,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Target,
  WalletCards,
  X,
} from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { LoadingState } from "@/components/dashboard/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { buildIntelligenceBrief, type InsightKind, type InsightSeverity, type IntelligenceInsight } from "@/features/intelligence/intelligence-engine";
import {
  dismissInsight,
  restoreDismissedInsights,
  setFocus,
  setHorizon,
  setPromptDraft,
  setSelectedInsightId,
  togglePinnedInsight,
} from "@/features/intelligence/intelligence-slice";
import { useIntelligenceDataQueries } from "@/hooks/use-app-data";
import { apiRequest, jsonBody } from "@/lib/api";
import { playNotificationBeep } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { intelligencePromptSchema, type IntelligenceFocus, type IntelligenceHorizon } from "@/schemas/intelligence";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useAppStore } from "@/stores/app-store";
import { useNotificationStore } from "@/stores/notification-store";
import type { AiChatResult } from "@/types/api";

const horizonOptions: Array<{ id: IntelligenceHorizon; label: string }> = [
  { id: "today", label: "Today" },
  { id: "week", label: "7 days" },
  { id: "month", label: "30 days" },
];

const focusOptions: Array<{ id: IntelligenceFocus; label: string }> = [
  { id: "all", label: "All" },
  { id: "money", label: "Money" },
  { id: "goals", label: "Goals" },
  { id: "learning", label: "Learning" },
  { id: "operations", label: "Ops" },
];

const kindIcons = {
  money: WalletCards,
  goals: Target,
  learning: Brain,
  operations: ShieldCheck,
} satisfies Record<InsightKind, typeof WalletCards>;

const severityStyles = {
  critical: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
  high: "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300",
  medium: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  low: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
} satisfies Record<InsightSeverity, string>;

export default function IntelligencePage() {
  const dispatch = useAppDispatch();
  const { density, toggleDensity } = useAppStore();
  const notify = useNotificationStore((state) => state.notify);
  const soundEnabled = useNotificationStore((state) => state.soundEnabled);
  const { dismissedInsightIds, focus, horizon, pinnedInsightIds, promptDraft, selectedInsightId } = useAppSelector((state) => state.intelligence);
  const data = useIntelligenceDataQueries();
  const [validationMessage, setValidationMessage] = useState("");
  const [assistantReply, setAssistantReply] = useState("");

  const brief = useMemo(
    () =>
      buildIntelligenceBrief({
        horizon,
        focus,
        summary: data.summary.data,
        notifications: data.notifications.data,
        subscriptions: data.subscriptions.data ?? [],
        goals: data.goals.data ?? [],
        memories: data.memories.data ?? [],
        roadmaps: data.roadmaps.data ?? [],
        notes: data.notes.data ?? [],
      }),
    [data.goals.data, data.memories.data, data.notes.data, data.notifications.data, data.roadmaps.data, data.subscriptions.data, data.summary.data, focus, horizon],
  );

  const visibleInsights = useMemo(
    () =>
      brief.insights
        .filter((insight) => !dismissedInsightIds.includes(insight.id))
        .sort((a, b) => Number(pinnedInsightIds.includes(b.id)) - Number(pinnedInsightIds.includes(a.id))),
    [brief.insights, dismissedInsightIds, pinnedInsightIds],
  );

  const selectedInsight = visibleInsights.find((insight) => insight.id === selectedInsightId);

  const aiMutation = useMutation({
    mutationFn: (prompt: string) =>
      apiRequest<AiChatResult>("/ai/chat", {
        method: "POST",
        body: jsonBody({ message: prompt }),
      }),
    onSuccess: (result) => {
      setAssistantReply(result.message.content);
      notify({
        title: "Intelligence brief ready",
        message: `${result.message.content.slice(0, 120)}${result.message.content.length > 120 ? "..." : ""}`,
        variant: "success",
        timeoutMs: 6500,
      });
      if (soundEnabled) playNotificationBeep();
    },
  });

  function runPrompt() {
    const parsed = intelligencePromptSchema.safeParse({ prompt: promptDraft, sourceInsightId: selectedInsightId });
    if (!parsed.success) {
      setValidationMessage(parsed.error.issues[0]?.message ?? "Prompt is not valid.");
      return;
    }
    setValidationMessage("");
    aiMutation.mutate(parsed.data.prompt);
  }

  function applyInsightPrompt(insight: IntelligenceInsight) {
    dispatch(setSelectedInsightId(insight.id));
    dispatch(setPromptDraft(insight.prompt));
    setAssistantReply("");
    setValidationMessage("");
  }

  function refreshAll() {
    void Promise.all([
      data.summary.refetch(),
      data.notifications.refetch(),
      data.subscriptions.refetch(),
      data.goals.refetch(),
      data.memories.refetch(),
      data.roadmaps.refetch(),
      data.notes.refetch(),
    ]);
  }

  if (data.isLoading) {
    return <LoadingState label="Loading intelligence" />;
  }

  if (data.hasError) {
    return <EmptyState icon={AlertTriangle} title="Intelligence unavailable" description="The API could not load enough workspace data." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Intelligence" description="Prioritized decisions from spend, goals, memory, workspace content, and live alerts." />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <SegmentedControl
            label="Horizon"
            options={horizonOptions}
            value={horizon}
            onChange={(value) => dispatch(setHorizon(value))}
          />
          <SegmentedControl
            label="Focus"
            options={focusOptions}
            value={focus}
            onChange={(value) => dispatch(setFocus(value))}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={refreshAll} disabled={data.isFetching}>
            <RefreshCcw className={cn("h-4 w-4", data.isFetching && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={toggleDensity}>
            <SlidersHorizontal className="h-4 w-4" />
            {density === "compact" ? "Compact" : "Comfort"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ScoreCard label="Command readiness" value={brief.scores.readiness} icon={CircleGauge} />
        <ScoreCard label="Context coverage" value={brief.scores.contextCoverage} icon={DatabaseZap} />
        <ScoreCard label="Spend pressure" value={brief.scores.spendRisk} icon={WalletCards} inverse />
        <ScoreCard label="Execution pressure" value={brief.scores.executionRisk} icon={Target} inverse />
      </div>

      <div className="grid gap-3 lg:grid-cols-4">
        {brief.lanes.map((lane) => {
          const Icon = kindIcons[lane.id];
          return (
            <div key={lane.id} className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{lane.label}</p>
                    <p className="text-xs text-muted-foreground">{lane.count} signal{lane.count === 1 ? "" : "s"}</p>
                  </div>
                </div>
                <Badge variant={lane.score >= 75 ? "success" : lane.score >= 50 ? "warning" : "outline"}>{lane.score}</Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{lane.description}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <section className="min-w-0 rounded-lg border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
            <div>
              <h2 className="text-base font-semibold">Decision Queue</h2>
              <p className="mt-1 text-sm text-muted-foreground">{visibleInsights.length} active signal{visibleInsights.length === 1 ? "" : "s"}</p>
            </div>
            {dismissedInsightIds.length ? (
              <Button variant="ghost" size="sm" onClick={() => dispatch(restoreDismissedInsights())}>
                <Eye className="h-4 w-4" />
                Restore
              </Button>
            ) : null}
          </div>

          <div className={cn("space-y-3 p-4", density === "compact" && "space-y-2 p-3")}>
            {visibleInsights.length ? (
              visibleInsights.map((insight) => (
                <InsightCard
                  key={insight.id}
                  compact={density === "compact"}
                  insight={insight}
                  isPinned={pinnedInsightIds.includes(insight.id)}
                  isSelected={selectedInsightId === insight.id}
                  onDismiss={() => dispatch(dismissInsight(insight.id))}
                  onPin={() => dispatch(togglePinnedInsight(insight.id))}
                  onUsePrompt={() => applyInsightPrompt(insight)}
                />
              ))
            ) : (
              <EmptyState icon={CheckCircle2} title="No active signals" description="The current horizon looks stable." />
            )}
          </div>
        </section>

        <div className="min-w-0 space-y-4">
          <section className="rounded-lg border bg-card">
            <div className="border-b p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold">AI Action Runner</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedInsight ? selectedInsight.title : "General workspace brief"}</p>
                </div>
                <Badge variant="outline" className="gap-1">
                  <MessageSquareText className="h-3.5 w-3.5" />
                  RAG
                </Badge>
              </div>
            </div>
            <div className="space-y-3 p-4">
              <Textarea
                className="min-h-36 resize-none"
                value={promptDraft}
                onChange={(event) => {
                  dispatch(setPromptDraft(event.target.value));
                  setValidationMessage("");
                }}
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">{promptDraft.trim().length}/2000 characters</p>
                <Button onClick={runPrompt} disabled={aiMutation.isPending}>
                  <Send className="h-4 w-4" />
                  {aiMutation.isPending ? "Running" : "Run"}
                </Button>
              </div>
              {validationMessage ? <p className="text-sm text-destructive">{validationMessage}</p> : null}
              {aiMutation.error ? <p className="text-sm text-destructive">{aiMutation.error.message}</p> : null}
              {assistantReply ? (
                <div className="rounded-md border bg-background p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                    <Radar className="h-4 w-4" />
                    Response
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{assistantReply}</p>
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-lg border bg-card">
            <div className="border-b p-4">
              <h2 className="text-base font-semibold">Context Coverage</h2>
              <p className="mt-1 text-sm text-muted-foreground">Sources available for retrieval and reasoning.</p>
            </div>
            <div className="space-y-3 p-4">
              {brief.sources.map((source) => (
                <div key={source.label} className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium">{source.label}</span>
                    <Badge variant={source.quality === "strong" ? "success" : source.quality === "partial" ? "warning" : "outline"}>
                      {source.count}
                    </Badge>
                  </div>
                  <div className="h-2 overflow-hidden rounded-sm bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-sm",
                        source.quality === "strong" ? "bg-emerald-500" : source.quality === "partial" ? "bg-amber-500" : "bg-muted-foreground/30",
                      )}
                      style={{ width: `${Math.min(100, Math.max(8, source.count * 18))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SegmentedControl<TValue extends string>({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: TValue) => void;
  options: Array<{ id: TValue; label: string }>;
  value: TValue;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-card p-1">
      <span className="px-2 text-xs font-medium uppercase text-muted-foreground">{label}</span>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={cn(
            "h-8 rounded-md px-3 text-sm font-medium transition-colors",
            value === option.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function ScoreCard({
  icon: Icon,
  inverse = false,
  label,
  value,
}: {
  icon: typeof Gauge;
  inverse?: boolean;
  label: string;
  value: number;
}) {
  const healthy = inverse ? value <= 35 : value >= 70;
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>
        </div>
        <span className={cn("flex h-11 w-11 items-center justify-center rounded-md", healthy ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-700 dark:text-amber-400")}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-sm bg-muted">
        <div
          className={cn("h-full rounded-sm", healthy ? "bg-emerald-500" : "bg-amber-500")}
          style={{ width: `${Math.max(4, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

function InsightCard({
  compact,
  insight,
  isPinned,
  isSelected,
  onDismiss,
  onPin,
  onUsePrompt,
}: {
  compact: boolean;
  insight: IntelligenceInsight;
  isPinned: boolean;
  isSelected: boolean;
  onDismiss: () => void;
  onPin: () => void;
  onUsePrompt: () => void;
}) {
  const Icon = kindIcons[insight.kind];

  return (
    <article className={cn("rounded-md border bg-background p-4 transition-colors", compact && "p-3", isSelected && "border-foreground")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold tracking-normal">{insight.title}</h3>
              <Badge variant="outline" className={severityStyles[insight.severity]}>
                {insight.severity}
              </Badge>
            </div>
            <p className={cn("mt-2 text-sm leading-6 text-muted-foreground", compact && "mt-1 leading-5")}>{insight.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label={isPinned ? "Unpin insight" : "Pin insight"} title={isPinned ? "Unpin insight" : "Pin insight"} onClick={onPin}>
            {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" aria-label="Dismiss insight" title="Dismiss insight" onClick={onDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className={cn("mt-4 grid gap-2", compact && "mt-3")}>
        <p className="text-sm font-medium">{insight.impact}</p>
        <div className="flex flex-wrap gap-2">
          {insight.evidence.map((item) => (
            <Badge key={item} variant="secondary" className="max-w-full truncate">
              {item}
            </Badge>
          ))}
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button variant="outline" size="sm" onClick={onUsePrompt}>
          <MessageSquareText className="h-4 w-4" />
          {insight.actionLabel}
        </Button>
      </div>
    </article>
  );
}
