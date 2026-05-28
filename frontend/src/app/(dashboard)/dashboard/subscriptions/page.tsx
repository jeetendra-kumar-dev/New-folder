"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, WalletCards } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { LoadingState } from "@/components/dashboard/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, jsonBody } from "@/lib/api";
import { formatCurrency, formatDate, formatRelativeDate } from "@/lib/format";
import { playNotificationBeep } from "@/lib/sound";
import { useNotificationStore } from "@/stores/notification-store";
import type { Subscription } from "@/types/api";

const categories = ["ENTERTAINMENT", "PRODUCTIVITY", "EDUCATION", "FINANCE", "HEALTH", "LIFESTYLE", "UTILITIES", "OTHER"];

export default function SubscriptionsPage() {
  const queryClient = useQueryClient();
  const notify = useNotificationStore((s) => s.notify);
  const soundEnabled = useNotificationStore((s) => s.soundEnabled);
  const [form, setForm] = useState({
    serviceName: "",
    renewalDate: "",
    amount: "",
    category: "PRODUCTIVITY",
    autoRenew: true,
    reminderDays: "7",
    notes: "",
  });

  const subscriptionsQuery = useQuery({
    queryKey: ["subscriptions"],
    queryFn: () => apiRequest<Subscription[]>("/subscriptions"),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      apiRequest<Subscription>("/subscriptions", {
        method: "POST",
        body: jsonBody({
          serviceName: form.serviceName,
          renewalDate: new Date(form.renewalDate).toISOString(),
          amount: Number(form.amount),
          category: form.category,
          autoRenew: form.autoRenew,
          reminderDays: form.reminderDays.split(",").map((day) => Number(day.trim())).filter(Number.isFinite),
          notes: form.notes || undefined,
        }),
      }),
    onSuccess: () => {
      setForm({ serviceName: "", renewalDate: "", amount: "", category: "PRODUCTIVITY", autoRenew: true, reminderDays: "7", notes: "" });
      void queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      notify({ title: "Saved", message: `Subscription "${form.serviceName}" added.`, variant: "success" });
      if (soundEnabled) playNotificationBeep();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/subscriptions/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      notify({ title: "Removed", message: "Subscription deleted.", variant: "destructive" });
      if (soundEnabled) playNotificationBeep();
    },
  });

  const totalSpend = useMemo(
    () => subscriptionsQuery.data?.reduce((total, subscription) => total + subscription.amount, 0) ?? 0,
    [subscriptionsQuery.data],
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Subscriptions" description={`${formatCurrency(totalSpend)} tracked across recurring services.`} />
      <form
        className="grid gap-3 rounded-lg border bg-card p-4 lg:grid-cols-[1fr_180px_140px_180px_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          createMutation.mutate();
        }}
      >
        <Input placeholder="Service name" value={form.serviceName} onChange={(event) => setForm({ ...form, serviceName: event.target.value })} required />
        <Input type="date" value={form.renewalDate} onChange={(event) => setForm({ ...form, renewalDate: event.target.value })} required />
        <Input type="number" min="0" step="0.01" placeholder="Amount" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} required />
        <select className="h-10 rounded-md border bg-background px-3 text-sm" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        <Button disabled={createMutation.isPending}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
        <div className="lg:col-span-5">
          <Textarea placeholder="Notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
        </div>
      </form>
      {createMutation.error ? <p className="text-sm text-destructive">{createMutation.error.message}</p> : null}
      {subscriptionsQuery.isLoading ? <LoadingState /> : null}
      {subscriptionsQuery.data?.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {subscriptionsQuery.data.map((subscription) => (
            <div key={subscription.id} className="rounded-lg border bg-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{subscription.serviceName}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Renews {formatDate(subscription.renewalDate)} · {formatRelativeDate(subscription.renewalDate)}
                  </p>
                </div>
                <Button variant="ghost" size="icon" aria-label="Delete subscription" onClick={() => deleteMutation.mutate(subscription.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Badge>{formatCurrency(subscription.amount)}</Badge>
                <Badge variant="outline">{subscription.category.replaceAll("_", " ")}</Badge>
                <Badge variant={subscription.autoRenew ? "success" : "warning"}>{subscription.autoRenew ? "Auto renew" : "Manual"}</Badge>
              </div>
              {subscription.notes ? <p className="mt-4 text-sm leading-6 text-muted-foreground">{subscription.notes}</p> : null}
            </div>
          ))}
        </div>
      ) : subscriptionsQuery.isSuccess ? (
        <EmptyState icon={WalletCards} title="No subscriptions yet" description="Add recurring services to unlock renewal notifications." />
      ) : null}
    </div>
  );
}
