import { auth } from "@/auth";
import { listActivity } from "@/lib/flux/activity";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function ActivityPage() {
  const session = await auth();
  const sub = session!.user!.id;

  let events: Awaited<ReturnType<typeof listActivity>> = [];
  try {
    events = await listActivity(sub, 100);
  } catch {
    /* Flux unavailable */
  }

  return (
    <>
      <PageHeader title="Activity" description="Audit-style timeline of your actions" />
      {events.length === 0 ? (
        <EmptyState title="No activity yet" />
      ) : (
        <ul className="space-y-2">
          {events.map((e) => (
            <li key={e.id}>
              <Card>
                <p className="text-sm font-medium">{e.action}</p>
                <p className="text-xs text-[var(--muted-fg)]">
                  {e.entity_type} · {e.entity_id} · {new Date(e.created_at).toLocaleString()}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
