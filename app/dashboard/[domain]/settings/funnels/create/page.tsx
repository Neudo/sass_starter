import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect, notFound } from "next/navigation";
import { FunnelCreateForm } from "./FunnelCreateForm";

export default async function CreateFunnelPage({
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

  if (!hasFunnelAccess) {
    return redirect(`/dashboard/${domain}/settings/funnels`);
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Funnel</h1>
        <p className="text-muted-foreground mt-2">
          Track how visitors move through your conversion path
        </p>
      </div>

      <FunnelCreateForm 
        siteId={siteData.id}
        domain={domain}
        userId={user.id}
      />
    </div>
  );
}