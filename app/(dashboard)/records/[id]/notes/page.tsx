import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getRecord } from "@/lib/flux/records";
import { listNotesForRecord } from "@/lib/flux/notes";
import { NoteForm } from "@/components/records/NoteForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { MarkdownBody } from "@/components/ui/MarkdownBody";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default async function RecordNotesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const sub = session!.user!.id;

  const record = await getRecord(sub, id).catch(() => null);
  if (!record) notFound();

  let notes: Awaited<ReturnType<typeof listNotesForRecord>> = [];
  try {
    notes = await listNotesForRecord(sub, id);
  } catch {
    /* Flux unavailable */
  }

  return (
    <>
      <PageHeader
        title={`Notes · ${record.title}`}
        actions={
          <Link href={`/records/${id}`}>
            <Button variant="ghost">Back to record</Button>
          </Link>
        }
      />
      <div className="mb-6">
        <NoteForm recordId={id} />
      </div>
      <div className="space-y-4">
        {notes.map((note) => (
          <Card key={note.id}>
            <p className="mb-2 text-xs text-[var(--muted-fg)]">
              {new Date(note.created_at).toLocaleString()}
            </p>
            <MarkdownBody content={note.body} />
          </Card>
        ))}
      </div>
    </>
  );
}
