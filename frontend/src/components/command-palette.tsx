"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  Brain,
  FolderKanban,
  LayoutDashboard,
  Radar,
  Search,
  Settings,
  Sparkles,
  Target,
  WalletCards,
  Zap,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAppStore } from "@/stores/app-store";
import { useSubscriptionsQuery, useGoalsQuery, useMemoriesQuery, useNotesQuery } from "@/hooks/use-app-data";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, description: "Overview & metrics" },
  { name: "Intelligence", href: "/dashboard/intelligence", icon: Radar, description: "AI-powered insights" },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3, description: "Spend & goal analytics" },
  { name: "Workspace", href: "/dashboard/workspace", icon: FolderKanban, description: "Notes, roadmaps & content" },
  { name: "Goals", href: "/dashboard/goals", icon: Target, description: "Track your progress" },
  { name: "Subscriptions", href: "/dashboard/subscriptions", icon: WalletCards, description: "Manage renewals & spend" },
  { name: "Memories", href: "/dashboard/memories", icon: Brain, description: "AI context & knowledge" },
  { name: "AI Assistant", href: "/dashboard/ai", icon: Sparkles, description: "Chat with your data" },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell, description: "Alerts & reminders" },
  { name: "Settings", href: "/dashboard/settings", icon: Settings, description: "Profile & preferences" },
];

type ResultItem = {
  id: string;
  label: string;
  sublabel?: string;
  href: string;
  icon: React.ElementType;
  group: string;
  accent?: string;
};

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, setCommandPaletteOpen } = useAppStore();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const subscriptionsQuery = useSubscriptionsQuery();
  const goalsQuery = useGoalsQuery();
  const memoriesQuery = useMemoriesQuery();
  const notesQuery = useNotesQuery();

  /* Global keyboard shortcut */
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setCommandPaletteOpen]);

  /* Focus input when opened */
  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  const q = query.toLowerCase().trim();

  /* Build result set */
  const results: ResultItem[] = [];

  const matchedNav = navItems.filter(
    (n) => !q || n.name.toLowerCase().includes(q) || n.description.toLowerCase().includes(q),
  );
  matchedNav.forEach((n) =>
    results.push({ id: `nav-${n.href}`, label: n.name, sublabel: n.description, href: n.href, icon: n.icon, group: "Navigation" }),
  );

  if (q) {
    (subscriptionsQuery.data ?? [])
      .filter((s) => s.serviceName.toLowerCase().includes(q) || s.category.toLowerCase().includes(q))
      .slice(0, 4)
      .forEach((s) =>
        results.push({
          id: `sub-${s.id}`,
          label: s.serviceName,
          sublabel: `${formatCurrency(s.amount)}/mo · ${s.category}`,
          href: "/dashboard/subscriptions",
          icon: WalletCards,
          group: "Subscriptions",
          accent: "emerald",
        }),
      );

    (goalsQuery.data ?? [])
      .filter((g) => g.title.toLowerCase().includes(q))
      .slice(0, 4)
      .forEach((g) =>
        results.push({
          id: `goal-${g.id}`,
          label: g.title,
          sublabel: `${g.progressPercent}% complete · ${g.status.replace("_", " ")}`,
          href: "/dashboard/goals",
          icon: Target,
          group: "Goals",
          accent: "sky",
        }),
      );

    (memoriesQuery.data ?? [])
      .filter((m) => m.content.toLowerCase().includes(q) || (m.title ?? "").toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((m) =>
        results.push({
          id: `mem-${m.id}`,
          label: m.title ?? m.content.slice(0, 50),
          sublabel: `Memory · ${m.type}`,
          href: "/dashboard/memories",
          icon: Brain,
          group: "Memories",
          accent: "violet",
        }),
      );

    (notesQuery.data ?? [])
      .filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((n) =>
        results.push({
          id: `note-${n.id}`,
          label: n.title,
          sublabel: `Note · ${n.tags.join(", ") || "No tags"}`,
          href: "/dashboard/workspace",
          icon: FolderKanban,
          group: "Notes",
        }),
      );
  }

  /* Group results */
  const grouped = results.reduce<Record<string, ResultItem[]>>((acc, item) => {
    (acc[item.group] ??= []).push(item);
    return acc;
  }, {});

  const flatResults = Object.values(grouped).flat();

  function handleSelect(href: string) {
    setCommandPaletteOpen(false);
    router.push(href);
  }

  /* Arrow key navigation */
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && flatResults[activeIndex]) {
      handleSelect(flatResults[activeIndex].href);
    }
  }

  const accentColor: Record<string, string> = {
    violet: "text-violet-400",
    emerald: "text-emerald-400",
    sky: "text-sky-400",
    amber: "text-amber-400",
  };

  let flatIndex = 0;

  return (
    <Dialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <DialogContent className="p-0 overflow-hidden max-w-xl gap-0" aria-describedby={undefined}>
        {/* Search input */}
        <div className="flex items-center gap-3 border-b px-4 py-3.5">
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
            onKeyDown={onKeyDown}
            placeholder="Search pages, subscriptions, goals, memories..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden sm:flex h-5 items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto py-2">
          {Object.keys(grouped).length === 0 && (
            <div className="py-10 text-center">
              <Zap className="mx-auto h-8 w-8 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground">No results for &ldquo;{query}&rdquo;</p>
            </div>
          )}
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="px-2 mb-1">
              <p className="mb-1 px-2 pt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                {group}
              </p>
              {items.map((item) => {
                const currentIndex = flatIndex++;
                const isActive = currentIndex === activeIndex;
                return (
                  <button
                    key={item.id}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                      isActive ? "bg-accent text-accent-foreground" : "hover:bg-secondary",
                    )}
                    onMouseEnter={() => setActiveIndex(currentIndex)}
                    onClick={() => handleSelect(item.href)}
                  >
                    <div className={cn(
                      "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md",
                      isActive ? "bg-primary/20" : "bg-secondary",
                    )}>
                      <item.icon className={cn("h-3.5 w-3.5", isActive ? accentColor[item.accent ?? "violet"] ?? "text-primary" : "text-muted-foreground")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.label}</p>
                      {item.sublabel && (
                        <p className="text-xs text-muted-foreground truncate">{item.sublabel}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-between border-t px-4 py-2">
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">↑↓</kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">↵</kbd> open
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground">{flatResults.length} results</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
