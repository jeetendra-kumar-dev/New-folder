import { PageHeader } from "@/components/layout/page-header";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Review product usage, activation, and retention trends." />
      <div className="grid gap-4 lg:grid-cols-3">
        {["Activation", "Retention", "Expansion"].map((metric, index) => (
          <div key={metric} className="rounded-lg border bg-card p-6">
            <p className="text-sm font-medium text-muted-foreground">{metric}</p>
            <p className="mt-4 text-3xl font-semibold">{[68, 84, 31][index]}%</p>
            <div className="mt-6 h-2 rounded-sm bg-muted">
              <div className="h-2 rounded-sm bg-primary" style={{ width: `${[68, 84, 31][index]}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
