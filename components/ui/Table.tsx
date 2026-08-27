import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

export function Table({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-x-auto rounded-lg border border-[var(--border)]", className)}>
      <table className="w-full text-left text-sm">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return <thead className="border-b border-[var(--border)] bg-[var(--muted)]">{children}</thead>;
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-[var(--border)]">{children}</tbody>;
}

export function TR({ children }: { children: ReactNode }) {
  return <tr>{children}</tr>;
}

export function TH({ children }: { children: ReactNode }) {
  return <th className="px-4 py-2 font-medium">{children}</th>;
}

export function TD({ children }: { children: ReactNode }) {
  return <td className="px-4 py-2">{children}</td>;
}
