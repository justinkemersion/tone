import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { describeRecordingsStatus } from "@/lib/storage/recordings";
import { configuredAuthProviders } from "@/lib/auth/providers";
import Link from "next/link";

export default async function RecordingsPage() {
  const session = await auth();
  const status = describeRecordingsStatus();
  const oauth = configuredAuthProviders().length > 0;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <PageHeader
        title="Recordings"
        description="Later: save a clip of a string. Not required to tune."
      />
      <Card className="space-y-3 text-sm">
        <p>{status.detail}</p>
        {!session?.user?.id && oauth ? (
          <p>
            <Link href="/login" className="underline">
              Sign in
            </Link>{" "}
            first if you want recordings tied to an account.
          </p>
        ) : null}
        <p className="text-[var(--muted-fg)]">Nothing was uploaded. Cloud save is not faked.</p>
      </Card>
    </div>
  );
}
