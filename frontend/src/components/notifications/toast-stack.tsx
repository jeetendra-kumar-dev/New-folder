"use client";

import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useNotificationStore } from "@/stores/notification-store";
import { cn } from "@/lib/utils";

const variantStyles = {
  default: "border bg-background/95",
  success: "border border-emerald-500/40 bg-emerald-500/10",
  warning: "border border-amber-500/40 bg-amber-500/10",
  destructive: "border border-destructive/40 bg-destructive/10",
} as const;

const accentBarStyles = {
  default: "bg-muted-foreground/30",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  destructive: "bg-destructive",
} as const;

const iconMap = {
  default: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  destructive: XCircle,
} as const;

export function ToastStack() {
  const toasts = useNotificationStore((s) => s.toasts);
  const removeToast = useNotificationStore((s) => s.removeToast);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[60] flex w-[min(420px,calc(100vw-2rem))] flex-col gap-2">
      {toasts.map((toast) => (
        (() => {
          const Icon = iconMap[toast.variant];
          return (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5 backdrop-blur supports-[backdrop-filter]:bg-background/80",
            variantStyles[toast.variant],
          )}
          role="status"
          aria-live="polite"
        >
          <div className="flex">
            <div className={cn("w-1.5", accentBarStyles[toast.variant])} />
            <div className="flex min-w-0 flex-1 items-start gap-3 p-3">
              <span className="mt-0.5 rounded-md bg-background/60 p-1">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                {toast.title ? <p className="text-sm font-semibold">{toast.title}</p> : null}
                <p className={cn("text-sm leading-6", toast.title ? "text-muted-foreground" : "text-foreground")}>{toast.message}</p>
              </div>
              <button
                type="button"
                className="rounded-md p-1 text-muted-foreground hover:text-foreground"
                aria-label="Dismiss notification"
                onClick={() => removeToast(toast.id)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
          );
        })()
      ))}
    </div>
  );
}

