import { RecordForm } from "@/components/records/RecordForm";
import { PageHeader } from "@/components/ui/PageHeader";

export default function NewRecordPage() {
  return (
    <>
      <PageHeader title="New record" />
      <RecordForm />
    </>
  );
}
