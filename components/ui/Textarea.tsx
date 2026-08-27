import { cn } from "@/lib/ui/cn";
import type { TextareaHTMLAttributes } from "react";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm min-h-[120px]",
        className,
      )}
      {...props}
    />
  );
}
