"use client";

import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type { Goal, NotificationList } from "@/types/api";
import { playNotificationBeep, unlockAudio } from "@/lib/sound";
import { useNotificationStore } from "@/stores/notification-store";

function dayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function isDueSoon(targetDateIso: string) {
  const now = Date.now();
  const target = new Date(targetDateIso).getTime();
  const diffMs = target - now;
  return diffMs <= 24 * 60 * 60 * 1000 && diffMs >= -6 * 60 * 60 * 1000; // within 24h, allow small grace past due
}

export function RealtimeNotifier() {
  const notify = useNotificationStore((s) => s.notify);
  const soundEnabled = useNotificationStore((s) => s.soundEnabled);
  const enableSound = useNotificationStore((s) => s.enableSound);

  // Share the same cache key the topbar already uses.
  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiRequest<NotificationList>("/notifications"),
    refetchInterval: 15000,
  });

  const goalsQuery = useQuery({
    queryKey: ["goals"],
    queryFn: () => apiRequest<Goal[]>("/goals"),
    refetchInterval: 60000,
  });

  const lastSeenIdsRef = useRef<Set<string>>(new Set());
  const reminderSentRef = useRef<Record<string, string>>({});

  const unread = useMemo(
    () => (notificationsQuery.data?.notifications ?? []).filter((n) => !n.isRead),
    [notificationsQuery.data],
  );

  useEffect(() => {
    // Unlock audio after a user interaction once; also a convenient place to enable sound.
    const handler = () => unlockAudio();
    window.addEventListener("pointerdown", handler, { once: true });
    return () => window.removeEventListener("pointerdown", handler);
  }, []);

  useEffect(() => {
    const currentIds = new Set((notificationsQuery.data?.notifications ?? []).map((n) => n.id));
    const prev = lastSeenIdsRef.current;

    // First load: don't spam.
    if (prev.size === 0) {
      lastSeenIdsRef.current = currentIds;
      return;
    }

    const newUnread = unread.filter((n) => !prev.has(n.id));
    if (!newUnread.length) {
      lastSeenIdsRef.current = currentIds;
      return;
    }

    // Show latest first.
    newUnread.slice(0, 2).forEach((n) => {
      notify({ title: "New notification", message: n.message, variant: "default" });
      if (soundEnabled) playNotificationBeep();
    });

    lastSeenIdsRef.current = currentIds;
  }, [notify, soundEnabled, unread, notificationsQuery.data]);

  useEffect(() => {
    const goals = goalsQuery.data ?? [];
    const today = dayKey();

    goals.forEach((goal) => {
      if (goal.status !== "IN_PROGRESS") return;
      if (!goal.targetDate) return;
      if (!isDueSoon(goal.targetDate)) return;

      const key = `goal:${goal.id}`;
      if (reminderSentRef.current[key] === today) return;
      reminderSentRef.current[key] = today;

      notify({
        title: "Goal reminder",
        message: `"${goal.title}" is due soon. Add a day or update your plan.`,
        variant: "warning",
        timeoutMs: 7000,
      });
      if (soundEnabled) playNotificationBeep();
    });
  }, [goalsQuery.data, notify, soundEnabled]);

  // Small affordance: if sound is disabled, we enable it once the user clicks the first time on any page element.
  // This avoids silent confusion while respecting browser autoplay restrictions.
  useEffect(() => {
    if (soundEnabled) return;
    const handler = () => enableSound();
    window.addEventListener("pointerdown", handler, { once: true });
    return () => window.removeEventListener("pointerdown", handler);
  }, [enableSound, soundEnabled]);

  return null;
}

