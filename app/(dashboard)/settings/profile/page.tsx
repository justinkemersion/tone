import { auth } from "@/auth";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { getProfile } from "@/lib/flux/profiles";

export default async function ProfileSettingsPage() {
  const session = await auth();
  const sub = session!.user!.id;
  let profile = null;
  try {
    profile = await getProfile(sub);
  } catch {
    /* Flux unavailable */
  }

  return (
    <>
      <PageHeader title="Profile" description="Your workspace identity" />
      <ProfileForm profile={profile} />
    </>
  );
}
