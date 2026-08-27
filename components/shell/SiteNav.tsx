"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/ui/cn";

const links = [
  { href: "/", label: "Tuner" },
  { href: "/tunings", label: "Tunings" },
  { href: "/settings", label: "Settings" },
];

export function SiteNav({
  signedIn,
  hasOAuth,
}: {
  signedIn: boolean;
  hasOAuth: boolean;
}) {
  const pathname = usePathname();

  return (
    <header className="flex h-12 items-center justify-between gap-3 border-b border-[var(--border)] px-3 sm:px-5">
      <div className="flex min-w-0 items-center gap-4">
        <Link href="/" className="shrink-0 text-sm font-semibold tracking-[0.18em]">
          TONE
        </Link>
        <nav className="flex items-center gap-1" aria-label="Primary">
          {links.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-2 py-1 text-xs sm:text-sm",
                  active
                    ? "text-[var(--foreground)]"
                    : "text-[var(--muted-fg)] hover:text-[var(--foreground)]",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-2 text-xs">
        {signedIn ? (
          <button
            type="button"
            className="text-[var(--muted-fg)] hover:text-[var(--foreground)]"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Sign out
          </button>
        ) : hasOAuth ? (
          <Link href="/login" className="text-[var(--muted-fg)] hover:text-[var(--foreground)]">
            Sign in
          </Link>
        ) : (
          <span className="hidden text-[var(--muted-fg)] sm:inline">Tuning works without an account</span>
        )}
      </div>
    </header>
  );
}
