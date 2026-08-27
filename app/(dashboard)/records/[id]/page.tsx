import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getRecord, listTagsForRecord } from "@/lib/flux/records";
import { RecordForm } from "@/components/records/RecordForm";
import { TagEditor } from "@/components/records/TagEditor";
import { ArchiveButton } from "@/components/records/ArchiveButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";

export default async function RecordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const sub = session!.user!.id;

  let record = null;
  let tags: Awaited<ReturnType<typeof listTagsForRecord>> = [];
  try {
    record = await getRecord(sub, id);
    if (record) tags = await listTagsForRecord(sub, id);
  } catch {
    /* Flux unavailable */
  }

  if (!record) notFound();

  return (
    <>
      <PageHeader
        title={record.title}
        actions={
          <div className="flex gap-2">
            <Link href={`/records/${id}/notes`}>
              <Button variant="secondary">Notes</Button>
            </Link>
            {record.status !== "archived" ? <ArchiveButton recordId={id} /> : null}
          </div>
        }
      />
      <div className="mb-4">
        <StatusPill status={record.status} />
      </div>
      <section className="mb-8">
        <h2 className="mb-2 text-sm font-medium">Edit</h2>
        <RecordForm record={record} />
      </section>
      <section>
        <h2 className="mb-2 text-sm font-medium">Tags</h2>
        <TagEditor recordId={id} tags={tags} />
      </section>
    </>
  );
}
