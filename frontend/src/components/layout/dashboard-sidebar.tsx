"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Brain, FolderKanban, LayoutDashboard, LifeBuoy, Settings, Sparkles, Target, WalletCards, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAppStore } from "@/stores/app-store";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Workspace", href: "/dashboard/workspace", icon: FolderKanban },
  { name: "AI Assistant", href: "/dashboard/ai", icon: Sparkles },
  { name: "Subscriptions", href: "/dashboard/subscriptions", icon: WalletCards },
  { name: "Goals", href: "/dashboard/goals", icon: Target },
  { name: "Memories", href: "/dashboard/memories", icon: Brain },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useAppStore();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r bg-background transition-transform lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold" onClick={() => setSidebarOpen(false)}>
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">A</span>
          PocketPilot AI
        </Link>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Close sidebar" onClick={() => setSidebarOpen(false)}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      <Separator />
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive && "bg-accent text-accent-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4">
        <div className="rounded-lg bg-muted p-4">
          <LifeBuoy className="h-5 w-5 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">PocketPilot workspace</p>
          <p className="mt-1 text-sm text-muted-foreground">Organize content in Workspace and ask AI about your data anytime.</p>
        </div>
      </div>
    </aside>
  );
}
