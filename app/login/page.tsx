import { SignInButtons } from "@/components/auth/SignInButtons";
import { Card } from "@/components/ui/Card";
import { configuredAuthProviders } from "@/lib/auth/providers";

export default function LoginPage() {
  const providers = configuredAuthProviders();

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-6">
      <Card>
        <h1 className="mb-4 text-lg font-semibold">Sign in</h1>
        <SignInButtons providers={providers} />
      </Card>
    </div>
  );
}
