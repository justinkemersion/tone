"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createRecordAction, updateRecordAction } from "@/app/(dashboard)/actions/records";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { RecordRow, RecordStatus } from "@/lib/types/entities";

export function RecordForm({
  record,
}: {
  record?: Pick<RecordRow, "id" | "title" | "description" | "status">;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: String(fd.get("title") ?? ""),
      description: String(fd.get("description") ?? "") || undefined,
      status: (fd.get("status") as RecordStatus) || undefined,
    };
    const result = record
      ? await updateRecordAction(record.id, payload)
      : await createRecordAction(payload);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(`/records/${result.data!.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium">Title</label>
        <Input name="title" defaultValue={record?.title} required />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium">Description</label>
        <Textarea name="description" defaultValue={record?.description ?? ""} />
      </div>
      {record ? (
        <div>
          <label className="mb-1 block text-xs font-medium">Status</label>
          <select
            name="status"
            defaultValue={record.status}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
          >
            <option value="draft">draft</option>
            <option value="active">active</option>
            <option value="archived">archived</option>
          </select>
        </div>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {record ? "Save" : "Create record"}
      </Button>
    </form>
  );
}
