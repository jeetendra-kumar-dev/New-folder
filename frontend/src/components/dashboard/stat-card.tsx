"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  change: string;
  icon: LucideIcon;
  accent?: "violet" | "emerald" | "sky" | "amber";
};

function useCountUp(target: number, duration = 900) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target <= 0) { setCount(0); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(eased * target));
      if (p < 1) requestAnimationFrame(tick);
      else setCount(target);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return count;
}

const accentMap = {
  violet: {
    icon: "bg-violet-500/10 text-violet-500 dark:bg-violet-500/15 dark:text-violet-400",
    badge: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    glow: "hover:shadow-violet-500/5",
  },
  emerald: {
    icon: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    glow: "hover:shadow-emerald-500/5",
  },
  sky: {
    icon: "bg-sky-500/10 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400",
    badge: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
    glow: "hover:shadow-sky-500/5",
  },
  amber: {
    icon: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
    badge: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    glow: "hover:shadow-amber-500/5",
  },
};

export function StatCard({ label, value, change, icon: Icon, accent = "violet" }: StatCardProps) {
  const numericValue = parseInt(value.replace(/[^0-9]/g, ""), 10);
  const isNumeric = !isNaN(numericValue) && String(numericValue) === value;
  const animated = useCountUp(isNumeric ? numericValue : 0);
  const colors = accentMap[accent];

  return (
    <div
      className={cn(
        "group relative rounded-xl border bg-card p-5 card-hover overflow-hidden",
        "hover:shadow-lg",
        colors.glow,
      )}
    >
      {/* Subtle top gradient accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg transition-transform group-hover:scale-110", colors.icon)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <p className="text-3xl font-bold tracking-tight tabular-nums">
          {isNumeric ? animated : value}
        </p>
        <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", colors.badge)}>
          {change}
        </span>
      </div>
    </div>
  );
}
