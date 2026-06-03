"use client";

import { Menu } from "lucide-react";
import { useAppStore } from "@/stores/app-store";
import { Button } from "@/components/ui/button";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import { CommandPalette } from "@/components/command-palette";
import { ToastStack } from "@/components/notifications/toast-stack";
import { RealtimeNotifier } from "@/components/notifications/realtime-notifier";
import { cn } from "@/lib/utils";

export function DashboardShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const { sidebarOpen, setSidebarOpen } = useAppStore();

  return (
    <div className="min-h-screen bg-background">
      <RealtimeNotifier />
      <ToastStack />
      <CommandPalette />

      <DashboardSidebar />

      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden",
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card/80 backdrop-blur-md px-4 lg:px-5">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 lg:hidden"
            aria-label="Open sidebar"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>
          <DashboardTopbar />
        </div>

        {/* Page content */}
        <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6">{children}</main>
      </div>
    </div>
  );
}
