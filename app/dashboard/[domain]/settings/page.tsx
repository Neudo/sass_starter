import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect, notFound } from "next/navigation";
import { SiteSettingsClient } from "./SiteSettingsClient";

export default async function SiteSettingsPage({
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
    .select("id, domain, public_enabled")
    .eq("domain", domain)
    .eq("user_id", user.id)
    .single();

  if (error || !siteData) {
    return notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{domain}</h1>
        <p className="text-muted-foreground mt-2">
          Manage your website settings and preferences
        </p>
      </div>

      <SiteSettingsClient
        siteId={siteData.id}
        domain={siteData.domain}
        publicEnabled={siteData.public_enabled}
      />
    </div>
  );
}