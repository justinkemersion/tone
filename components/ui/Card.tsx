import { cn } from "@/lib/ui/cn";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm",
        className,
      )}
      {...props}
    />
  );
}
