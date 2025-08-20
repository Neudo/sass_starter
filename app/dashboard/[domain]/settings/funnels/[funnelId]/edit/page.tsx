import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect, notFound } from "next/navigation";
import { FunnelEditForm } from "./FunnelEditForm";

export default async function FunnelEditPage({
  params,
}: {
  params: Promise<{ domain: string; funnelId: string }>;
}) {
  const { domain, funnelId } = await params;
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/auth/login");
  }

  // Get site data and verify ownership
  const { data: siteData, error: siteError } = await adminClient
    .from("sites")
    .select("id, domain")
    .eq("domain", domain)
    .eq("user_id", user.id)
    .single();

  if (siteError || !siteData) {
    return notFound();
  }

  // Check user subscription for funnel access
  const { data: subscription } = await adminClient
    .from("subscriptions")
    .select("plan_tier, status")
    .eq("user_id", user.id)
    .single();

  const hasFunnelAccess = subscription && 
    (subscription.plan_tier === "professional" || subscription.plan_tier === "enterprise") &&
    subscription.status === "active";

  if (!hasFunnelAccess) {
    return redirect(`/dashboard/${domain}/settings/funnels`);
  }

  // Get funnel data with steps
  const { data: funnelData, error: funnelError } = await adminClient
    .from("funnels")
    .select(`
      id,
      name,
      description,
      is_active,
      funnel_steps (
        id,
        step_number,
        name,
        step_type,
        url_pattern,
        match_type,
        event_type,
        event_config
      )
    `)
    .eq("id", funnelId)
    .eq("site_id", siteData.id)
    .eq("user_id", user.id)
    .single();

  if (funnelError || !funnelData) {
    return notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Funnel</h1>
        <p className="text-muted-foreground">
          Modify your funnel configuration and tracking steps.
        </p>
      </div>

      <FunnelEditForm
        siteId={siteData.id}
        domain={siteData.domain}
        userId={user.id}
        funnel={funnelData}
      />
    </div>
  );
}