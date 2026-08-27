"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import type { AuthProviderId } from "@/lib/auth/providers";

export function SignInButtons({ providers }: { providers: AuthProviderId[] }) {
  if (providers.length === 0) {
    return (
      <p className="text-sm text-[var(--muted-fg)]">
        No OAuth providers configured. Set AUTH_GITHUB_* or AUTH_GOOGLE_* in .env
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {providers.includes("github") ? (
        <Button type="button" onClick={() => signIn("github", { callbackUrl: "/" })}>
          Continue with GitHub
        </Button>
      ) : null}
      {providers.includes("google") ? (
        <Button type="button" variant="secondary" onClick={() => signIn("google", { callbackUrl: "/" })}>
          Continue with Google
        </Button>
      ) : null}
    </div>
  );
}
