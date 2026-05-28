import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Billing" description="Manage subscriptions, invoices, and payment settings." />
      <div className="rounded-lg border bg-card p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Current plan</p>
            <h2 className="mt-2 text-2xl font-semibold">Scale</h2>
            <p className="mt-2 text-sm text-muted-foreground">$249/month, renews on June 22, 2026.</p>
          </div>
          <Button>Manage plan</Button>
        </div>
      </div>
    </div>
  );
}
