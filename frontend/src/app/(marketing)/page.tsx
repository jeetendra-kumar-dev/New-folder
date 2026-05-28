import Link from "next/link";
import { ArrowRight, Bell, Brain, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingNavbar } from "@/components/layout/marketing-navbar";

const features = [
  {
    title: "Subscription cockpit",
    description: "Track renewals, costs, reminder windows, and auto-renew status.",
    icon: Bell,
  },
  {
    title: "Email OTP access",
    description: "Sign in with a short-lived verification code and JWT sessions.",
    icon: ShieldCheck,
  },
  {
    title: "AI memory",
    description: "Save durable context, preferences, facts, and reminders.",
    icon: Brain,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNavbar />
      <main>
        <section className="border-b bg-[linear-gradient(180deg,var(--background),var(--muted))]">
          <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-md border bg-background px-3 py-1 text-sm text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Live PocketPilot workspace
              </div>
              <h1 className="text-4xl font-semibold tracking-normal text-foreground sm:text-5xl lg:text-6xl">
                PocketPilot AI
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                Manage subscriptions, build goal streaks, store AI memory, and react to real notifications from one organized dashboard.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/dashboard">
                    Open dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/login">View auth flow</Link>
                </Button>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-3 shadow-sm">
              <div className="rounded-md border bg-background p-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly spend</p>
                    <p className="text-2xl font-semibold">$128.40</p>
                  </div>
                  <div className="rounded-md bg-emerald-500/10 px-2.5 py-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    +18.2%
                  </div>
                </div>
                <div className="mt-5 grid gap-3">
                  {[72, 48, 86, 60, 94].map((value, index) => (
                    <div key={index} className="grid grid-cols-[72px_1fr] items-center gap-3">
                      <span className="text-sm text-muted-foreground">Goal {index + 1}</span>
                      <div className="h-3 rounded-sm bg-muted">
                        <div className="h-3 rounded-sm bg-primary" style={{ width: `${value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="mx-auto grid max-w-7xl gap-4 px-6 py-12 md:grid-cols-3 lg:px-8">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-lg border bg-card p-6">
              <feature.icon className="h-5 w-5 text-muted-foreground" />
              <h2 className="mt-5 text-lg font-semibold">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
