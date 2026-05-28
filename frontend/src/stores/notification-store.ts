import { create } from "zustand";

export type ToastVariant = "default" | "success" | "warning" | "destructive";

export type ToastItem = {
  id: string;
  title?: string;
  message: string;
  createdAt: number;
  variant: ToastVariant;
  timeoutMs: number;
};

type NotificationState = {
  toasts: ToastItem[];
  soundEnabled: boolean;
  enableSound: () => void;
  disableSound: () => void;
  notify: (input: { title?: string; message: string; variant?: ToastVariant; timeoutMs?: number }) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
};

const soundKey = "pocketpilot.soundEnabled";

function readInitialSoundSetting() {
  if (typeof window === "undefined") return false;
  const raw = window.localStorage.getItem(soundKey);
  if (raw === null) return false;
  return raw === "true";
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  toasts: [],
  soundEnabled: readInitialSoundSetting(),
  enableSound: () => {
    if (typeof window !== "undefined") window.localStorage.setItem(soundKey, "true");
    set({ soundEnabled: true });
  },
  disableSound: () => {
    if (typeof window !== "undefined") window.localStorage.setItem(soundKey, "false");
    set({ soundEnabled: false });
  },
  notify: ({ title, message, variant = "default", timeoutMs = 4500 }) => {
    const id = `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const toast: ToastItem = { id, title, message, createdAt: Date.now(), variant, timeoutMs };
    set((state) => ({ toasts: [...state.toasts, toast].slice(-5) }));

    if (timeoutMs > 0) {
      window.setTimeout(() => {
        get().removeToast(id);
      }, timeoutMs);
    }

    return id;
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
  clearToasts: () => set({ toasts: [] }),
}));

