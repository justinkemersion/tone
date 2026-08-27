import { cn } from "@/lib/ui/cn";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const variants: Record<Variant, string> = {
  primary: "bg-[var(--accent)] text-[var(--accent-fg)] hover:opacity-90",
  secondary: "border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--muted)]",
  ghost: "hover:bg-[var(--muted)]",
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
