export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="h-4 w-24 rounded-sm bg-muted" />
      <div className="mt-5 grid gap-3">
        <div className="h-10 rounded-sm bg-muted" />
        <div className="h-10 rounded-sm bg-muted" />
        <div className="h-10 rounded-sm bg-muted" />
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}
