"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  Brain,
  FolderKanban,
  LayoutDashboard,
  Radar,
  Settings,
  Sparkles,
  Target,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/app-store";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Intelligence", href: "/dashboard/intelligence", icon: Radar },
      { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Workspace",
    items: [
      { name: "Workspace", href: "/dashboard/workspace", icon: FolderKanban },
      { name: "Goals", href: "/dashboard/goals", icon: Target },
      { name: "Subscriptions", href: "/dashboard/subscriptions", icon: WalletCards },
      { name: "Memories", href: "/dashboard/memories", icon: Brain },
    ],
  },
  {
    label: "AI & Comms",
    items: [
      { name: "AI Assistant", href: "/dashboard/ai", icon: Sparkles },
      { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
    ],
  },
  {
    label: "Account",
    items: [{ name: "Settings", href: "/dashboard/settings", icon: Settings }],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const user = useAuthStore((state) => state.user);

  const initials = user?.name
    ?.split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "PP";

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform duration-300 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center justify-between px-4 border-b">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg brand-gradient shadow-sm">
            <Zap className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight">PocketPilot AI</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 lg:hidden"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "group relative flex h-9 items-center gap-2.5 rounded-md px-2.5 text-sm font-medium transition-all duration-150",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
                    )}
                    <item.icon
                      className={cn(
                        "h-4 w-4 flex-shrink-0 transition-colors",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                      )}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-secondary transition-colors cursor-pointer">
          <div className="flex h-7 w-7 items-center justify-center rounded-full brand-gradient text-[11px] font-semibold text-white flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{user?.name ?? "PocketPilot User"}</p>
            <p className="text-[10px] text-muted-foreground truncate">{user?.email ?? "Signed in"}</p>
          </div>
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" title="AI Active" />
        </div>
      </div>
    </aside>
  );
}
