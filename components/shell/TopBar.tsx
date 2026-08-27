import { signOut } from "@/auth";
import { getAppDisplayName } from "@/lib/config/app";
import { Button } from "@/components/ui/Button";

export function TopBar({ email }: { email?: string | null }) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-[var(--border)] px-4">
      <span className="text-sm font-semibold tracking-wide">{getAppDisplayName()}</span>
      <div className="flex items-center gap-3">
        {email ? <span className="text-xs text-[var(--muted-fg)]">{email}</span> : null}
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <Button type="submit" variant="secondary">
            Sign out
          </Button>
        </form>
      </div>
    </header>
  );
}
