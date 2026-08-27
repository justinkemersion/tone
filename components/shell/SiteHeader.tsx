import { auth } from "@/auth";
import { configuredAuthProviders } from "@/lib/auth/providers";
import { SiteNav } from "./SiteNav";

export async function SiteHeader() {
  const session = await auth();
  return (
    <SiteNav signedIn={Boolean(session?.user?.id)} hasOAuth={configuredAuthProviders().length > 0} />
  );
}
