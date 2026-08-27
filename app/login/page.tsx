import { SignInButtons } from "@/components/auth/SignInButtons";
import { Card } from "@/components/ui/Card";
import { configuredAuthProviders } from "@/lib/auth/providers";
import Link from "next/link";

export default function LoginPage() {
  const providers = configuredAuthProviders();

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-3rem)] max-w-md flex-col justify-center p-6">
      <Card>
        <h1 className="mb-2 text-lg font-semibold">Sign in</h1>
        <p className="mb-4 text-sm text-[var(--muted-fg)]">
          Optional. The tuner works without an account. Sign-in saves tunings and preferences.
        </p>
        <SignInButtons providers={providers} />
        <p className="mt-4 text-center text-xs text-[var(--muted-fg)]">
          <Link href="/" className="underline">
            Back to the tuner
          </Link>
        </p>
      </Card>
    </div>
  );
}
