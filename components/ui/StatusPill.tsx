import { cn } from "@/lib/ui/cn";
import type { RecordStatus } from "@/lib/types/entities";

const styles: Record<RecordStatus, string> = {
  draft: "bg-[var(--muted)] text-[var(--muted-fg)]",
  active: "bg-[var(--accent)] text-[var(--accent-fg)]",
  archived: "bg-[var(--muted)] text-[var(--muted-fg)] line-through",
};

export function StatusPill({ status }: { status: RecordStatus }) {
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium capitalize", styles[status])}>
      {status}
    </span>
  );
}
