export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--border)] p-8 text-center">
      <p className="text-sm font-medium">{title}</p>
      {hint ? <p className="mt-2 text-sm text-[var(--muted-fg)]">{hint}</p> : null}
    </div>
  );
}
