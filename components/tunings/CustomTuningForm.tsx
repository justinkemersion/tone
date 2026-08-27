"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createTuningAction } from "@/app/(dashboard)/actions/tunings";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const DEFAULT_NOTES = ["E2", "A2", "D3", "G3", "B3", "E4"];

export function CustomTuningForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const notes = DEFAULT_NOTES.map((_, i) => String(fd.get(`n${i}`) ?? "").trim());
    const result = await createTuningAction({ name, notes });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mb-4 space-y-3 rounded-lg border border-[var(--border)] p-4">
      <label className="block text-xs font-medium">
        Name
        <Input name="name" required className="mt-1" placeholder="My tuning" />
      </label>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {DEFAULT_NOTES.map((note, i) => (
          <label key={i} className="text-xs">
            {6 - i}
            <Input name={`n${i}`} defaultValue={note} className="mt-1" required />
          </label>
        ))}
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit">Save tuning</Button>
    </form>
  );
}
