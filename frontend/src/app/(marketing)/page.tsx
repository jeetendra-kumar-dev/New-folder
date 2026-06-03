import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Brain,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  WalletCards,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingNavbar } from "@/components/layout/marketing-navbar";

const features = [
  {
    title: "Subscription cockpit",
    description: "Track every renewal, cost, and reminder window. Never get surprised by a charge again.",
    icon: WalletCards,
    accent: "bg-emerald-500/10 text-emerald-500",
  },
  {
    title: "Goal tracking & streaks",
    description: "Set multi-day goals, monitor progress, and build consistent habits with accountability tracking.",
    icon: Target,
    accent: "bg-sky-500/10 text-sky-500",
  },
  {
    title: "AI memory system",
    description: "Store preferences, facts, and context. Your AI assistant remembers everything about you.",
    icon: Brain,
    accent: "bg-violet-500/10 text-violet-500",
  },
  {
    title: "Context-aware AI chat",
    description: "Chat with an AI that knows your subscriptions, goals, memories, and workspace content.",
    icon: Sparkles,
    accent: "bg-purple-500/10 text-purple-500",
  },
  {
    title: "Real-time notifications",
    description: "Get smart alerts for upcoming renewals, goal reminders, and AI-powered insights.",
    icon: Bell,
    accent: "bg-amber-500/10 text-amber-500",
  },
  {
    title: "Secure by design",
    description: "Email OTP access, JWT refresh sessions, and Zod-validated APIs throughout.",
    icon: ShieldCheck,
    accent: "bg-rose-500/10 text-rose-500",
  },
];

const stats = [
  { value: "5", label: "AI model workflows" },
  { value: "RAG", label: "Context injection" },
  { value: "JWT", label: "Secure sessions" },
  { value: "∞", label: "Workspace items" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNavbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b">
          {/* Background glow */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[600px] w-[600px] rounded-full bg-violet-500/5 blur-3xl" />
          </div>

          <div className="relative mx-auto grid min-h-[calc(100vh-3.5rem)] w-full max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:px-8">
            {/* Left: Copy */}
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-600 dark:text-violet-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-500 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-violet-500" />
                </span>
                Live workspace · AI-powered
              </div>

              <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                <span className="brand-gradient-text">PocketPilot</span>
                <br />
                <span className="text-foreground">AI</span>
              </h1>

              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Your intelligent personal OS. Manage subscriptions, build goals, store AI memory, and chat with an assistant that genuinely knows your life.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="brand-gradient text-white hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/20">
                  <Link href="/dashboard">
                    Open dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/login">Sign in</Link>
                </Button>
              </div>

              {/* Mini stats */}
              <div className="mt-12 grid grid-cols-4 gap-4 border-t pt-8">
                {stats.map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-bold brand-gradient-text">{s.value}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Dashboard preview mockup */}
            <div className="relative lg:block">
              <div className="rounded-2xl border bg-card p-1 shadow-2xl shadow-black/20">
                {/* Fake topbar */}
                <div className="flex items-center gap-2 rounded-t-xl border-b bg-background/50 px-4 py-2.5">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md brand-gradient">
                    <Zap className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-xs font-semibold">PocketPilot AI</span>
                  <div className="ml-auto flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] text-muted-foreground">Live</span>
                  </div>
                </div>

                {/* Fake dashboard content */}
                <div className="rounded-b-xl bg-background/30 p-4 space-y-3">
                  {/* Stat row */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Monthly spend", value: "$128.40", color: "text-emerald-500", bg: "bg-emerald-500/10" },
                      { label: "Active goals", value: "4", color: "text-sky-500", bg: "bg-sky-500/10" },
                    ].map((card) => (
                      <div key={card.label} className="rounded-lg border bg-card p-3">
                        <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{card.label}</p>
                        <p className={`mt-1.5 text-xl font-bold ${card.color}`}>{card.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Renewal list */}
                  <div className="rounded-lg border bg-card p-3 space-y-2">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Upcoming renewals</p>
                    {[
                      { name: "Netflix", days: "2d", amount: "$15.99", color: "bg-red-500/15 text-red-500" },
                      { name: "Spotify", days: "5d", amount: "$9.99", color: "bg-amber-500/15 text-amber-500" },
                      { name: "GitHub", days: "12d", amount: "$4.00", color: "bg-emerald-500/10 text-emerald-500" },
                    ].map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`flex h-5 w-5 items-center justify-center rounded text-[9px] font-bold ${item.color}`}>
                            {item.days}
                          </div>
                          <span className="text-[10px] font-medium">{item.name}</span>
                        </div>
                        <span className="text-[10px] font-semibold">{item.amount}</span>
                      </div>
                    ))}
                  </div>

                  {/* AI chat teaser */}
                  <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-3">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-md brand-gradient flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-2.5 w-2.5 text-white" />
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        <span className="font-medium text-foreground">AI:</span> You have 2 renewals this week totalling $25.98. Your Netflix subscription has been active for 8 months.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-3 -right-3 flex items-center gap-2 rounded-xl border bg-card px-3 py-2 shadow-lg">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <div>
                  <p className="text-[10px] font-semibold">AI context active</p>
                  <p className="text-[9px] text-muted-foreground">12 memories · 4 goals</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features grid */}
        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Everything in one place</h2>
            <p className="mt-3 text-muted-foreground">A personal command center built on modern full-stack architecture</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="group rounded-xl border bg-card p-6 card-hover"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${feature.accent}`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA banner */}
        <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl border bg-card p-8 text-center">
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-64 w-64 rounded-full bg-violet-500/8 blur-3xl" />
            </div>
            <div className="relative">
              <Zap className="mx-auto h-10 w-10 mb-4 text-violet-500" />
              <h2 className="text-2xl font-bold">Ready to take control?</h2>
              <p className="mt-2 text-muted-foreground">Open your dashboard and start organizing your digital life with AI.</p>
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button asChild size="lg" className="brand-gradient text-white hover:opacity-90 shadow-lg shadow-violet-500/20">
                  <Link href="/dashboard">
                    Open dashboard <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
