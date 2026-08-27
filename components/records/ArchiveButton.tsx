"use client";

import { useRouter } from "next/navigation";
import { archiveRecordAction } from "@/app/(dashboard)/actions/records";
import { Button } from "@/components/ui/Button";

export function ArchiveButton({ recordId }: { recordId: string }) {
  const router = useRouter();

  async function archive() {
    const result = await archiveRecordAction(recordId);
    if (result.ok) {
      router.refresh();
    }
  }

  return (
    <Button type="button" variant="secondary" onClick={archive}>
      Archive
    </Button>
  );
}
