"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createNoteAction } from "@/app/(dashboard)/actions/notes";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

export function NoteForm({ recordId }: { recordId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = String(fd.get("body") ?? "");
    const result = await createNoteAction({ record_id: recordId, body });
    if (!result.ok) setError(result.error);
    else {
      (e.target as HTMLFormElement).reset();
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <Textarea name="body" placeholder="Markdown note…" required />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" variant="secondary">
        Add note
      </Button>
    </form>
  );
}
