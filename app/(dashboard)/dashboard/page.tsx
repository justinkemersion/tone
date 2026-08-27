import Link from "next/link";
import { auth } from "@/auth";
import { listActivity } from "@/lib/flux/activity";
import { countRecordsByStatus } from "@/lib/flux/records";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";

export default async function DashboardOverviewPage() {
  const session = await auth();
  const sub = session!.user!.id;

  let counts = { draft: 0, active: 0, archived: 0 };
  let activity: Awaited<ReturnType<typeof listActivity>> = [];

  try {
    counts = await countRecordsByStatus(sub);
    activity = await listActivity(sub, 8);
  } catch {
    /* Flux may be unavailable during local UI dev */
  }

  return (
    <>
      <PageHeader title="Workspace" description="Operational overview" />
      <div className="grid gap-4 sm:grid-cols-3">
        {(["draft", "active", "archived"] as const).map((status) => (
          <Card key={status}>
            <p className="text-xs uppercase tracking-wide text-[var(--muted-fg)]">{status}</p>
            <p className="mt-2 text-2xl font-semibold">{counts[status]}</p>
          </Card>
        ))}
      </div>
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium">Recent activity</h2>
          <Link href="/activity">
            <Button variant="ghost">View all</Button>
          </Link>
        </div>
        <Card>
          <ul className="space-y-2 text-sm">
            {activity.length === 0 ? (
              <li className="text-[var(--muted-fg)]">No activity yet.</li>
            ) : (
              activity.map((e) => (
                <li key={e.id}>
                  <span className="font-medium">{e.action}</span>{" "}
                  <span className="text-[var(--muted-fg)]">
                    {e.entity_type} · {new Date(e.created_at).toLocaleString()}
                  </span>
                </li>
              ))
            )}
          </ul>
        </Card>
      </section>
    </>
  );
}
