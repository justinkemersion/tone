"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveProfileAction } from "@/app/(dashboard)/actions/profile";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { ProfileRow } from "@/lib/types/entities";

export function ProfileForm({ profile }: { profile: ProfileRow | null }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setOk(false);
    const fd = new FormData(e.currentTarget);
    const result = await saveProfileAction({
      display_name: String(fd.get("display_name") ?? ""),
      avatar_url: String(fd.get("avatar_url") ?? ""),
    });
    if (!result.ok) setError(result.error);
    else {
      setError(null);
      setOk(true);
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium">Display name</label>
        <Input name="display_name" defaultValue={profile?.display_name ?? ""} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium">Avatar URL</label>
        <Input name="avatar_url" type="url" defaultValue={profile?.avatar_url ?? ""} />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {ok ? <p className="text-sm text-green-700">Saved.</p> : null}
      <Button type="submit">Save profile</Button>
    </form>
  );
}
