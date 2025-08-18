import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect, notFound } from "next/navigation";
import { ImportsExportsClient } from "./ImportsExportsClient";

export default async function ImportsExportsPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/auth/login");
  }

  // Get site data and verify ownership
  const { data: siteData, error } = await adminClient
    .from("sites")
    .select("id, domain")
    .eq("domain", domain)
    .eq("user_id", user.id)
    .single();

  if (error || !siteData) {
    return notFound();
  }

  // Check if Google Analytics is connected
  const { data: tokenData } = await adminClient
    .from('google_auth_tokens')
    .select('access_token')
    .eq('user_id', user.id)
    .single();

  const isGoogleConnected = !!tokenData?.access_token;

  return (
    <ImportsExportsClient
      siteId={siteData.id}
      domain={siteData.domain}
      isGoogleConnected={isGoogleConnected}
    />
  );
}