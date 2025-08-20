import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect, notFound } from "next/navigation";
import { FunnelsClient } from "./FunnelsClient";

export default async function FunnelsPage({
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

  // Check user subscription for funnel access
  const { data: subscription } = await adminClient
    .from("subscriptions")
    .select("plan_tier, status")
    .eq("user_id", user.id)
    .single();

  const hasFunnelAccess = subscription && 
    (subscription.plan_tier === "professional" || subscription.plan_tier === "enterprise") &&
    subscription.status === "active";

  return (
    <FunnelsClient
      siteId={siteData.id}
      domain={siteData.domain}
      hasFunnelAccess={!!hasFunnelAccess}
      currentPlan={subscription?.plan_tier || "free"}
    />
  );
}