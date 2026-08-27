"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addTagAction, removeTagAction } from "@/app/(dashboard)/actions/records";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TagChip } from "@/components/ui/TagChip";
import type { RecordTagRow } from "@/lib/types/entities";

export function TagEditor({
  recordId,
  tags,
}: {
  recordId: string;
  tags: RecordTagRow[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function addTag(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const tag = String(fd.get("tag") ?? "").trim();
    if (!tag) return;
    const result = await addTagAction(recordId, { tag });
    if (!result.ok) setError(result.error);
    else router.refresh();
    (e.target as HTMLFormElement).reset();
  }

  async function remove(tagId: string) {
    const result = await removeTagAction(tagId);
    if (!result.ok) setError(result.error);
    else router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <button key={t.id} type="button" onClick={() => remove(t.id)} className="group">
            <TagChip tag={`${t.tag} ×`} />
          </button>
        ))}
      </div>
      <form onSubmit={addTag} className="flex gap-2">
        <Input name="tag" placeholder="Add tag" className="max-w-xs" />
        <Button type="submit" variant="secondary">
          Add
        </Button>
      </form>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
