"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, Command, LogOut, Search, Settings } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { apiRequest } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { useAuthStore } from "@/stores/auth-store";
import { useAppStore } from "@/stores/app-store";
import { cn } from "@/lib/utils";
import type { NotificationList, User } from "@/types/api";

const notificationColors: Record<string, string> = {
  SUBSCRIPTION_RENEWAL: "bg-emerald-500",
  GOAL_REMINDER: "bg-sky-500",
  MEMORY_INSIGHT: "bg-violet-500",
  SYSTEM: "bg-amber-500",
};

export function DashboardTopbar() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const clearSession = useAuthStore((state) => state.clearSession);
  const { setCommandPaletteOpen } = useAppStore();

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: () => apiRequest<User>("/auth/me"),
    initialData: user ?? undefined,
  });

  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiRequest<NotificationList>("/notifications"),
    refetchInterval: 15000,
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => apiRequest("/notifications/read-all", { method: "PATCH" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/notifications/${id}/read`, { method: "PATCH" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  function signOut() {
    if (refreshToken) {
      void apiRequest("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      }).catch(() => undefined);
    }
    clearSession();
    window.location.href = "/login";
  }

  const currentUser = meQuery.data;
  const initials = currentUser?.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "PP";
  const notifications = notificationsQuery.data?.notifications ?? [];
  const unreadCount = notificationsQuery.data?.unreadCount ?? 0;

  return (
    <div className="flex w-full items-center justify-between gap-3">
      {/* Command palette trigger */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="group hidden w-full max-w-xs md:flex items-center gap-2 rounded-lg border bg-secondary/50 px-3 h-8 text-sm text-muted-foreground transition-all hover:bg-secondary hover:text-foreground hover:border-primary/30"
        aria-label="Open command palette"
      >
        <Search className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="flex-1 text-left text-xs">Search everything...</span>
        <kbd className="hidden sm:flex h-4 items-center gap-0.5 rounded border bg-background/60 px-1 text-[9px] font-medium">
          <Command className="h-2.5 w-2.5" />K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        {/* Mobile search */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 md:hidden"
          onClick={() => setCommandPaletteOpen(true)}
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </Button>

        <ThemeToggle />

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-8 w-8" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-violet-500 px-1 text-[9px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between py-2">
              <span className="font-semibold">Notifications</span>
              {unreadCount > 0 && (
                <button
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  onClick={() => markAllReadMutation.mutate()}
                >
                  <CheckCheck className="h-3 w-3" />
                  Mark all read
                </button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length ? (
              notifications.slice(0, 6).map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="items-start gap-2.5 py-2.5 cursor-pointer"
                  onClick={() => {
                    if (!notification.isRead) markReadMutation.mutate(notification.id);
                  }}
                >
                  <span
                    className={cn(
                      "mt-1 h-2 w-2 flex-shrink-0 rounded-full",
                      notification.isRead ? "bg-muted-foreground/30" : (notificationColors[notification.type] ?? "bg-primary"),
                    )}
                  />
                  <span className="grid gap-0.5">
                    <span className={cn("text-sm leading-snug", !notification.isRead && "font-medium")}>{notification.message}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(notification.createdAt)}</span>
                  </span>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">All caught up!</div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="brand-gradient text-[11px] font-semibold text-white">{initials}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="space-y-0.5">
                <p className="font-medium">{currentUser?.name ?? "PocketPilot User"}</p>
                <p className="text-xs font-normal text-muted-foreground">{currentUser?.email ?? "Signed in"}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
