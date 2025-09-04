import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect, notFound } from "next/navigation";
import { CustomEventCreateForm } from "./CustomEventCreateForm";
import { Breadcrumb } from "@/components/breadcrumb";

export default async function CreateCustomEventPage({
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

  // Check user subscription for custom events access
  const { data: subscription } = await adminClient
    .from("subscriptions")
    .select("plan_tier, status")
    .eq("user_id", user.id)
    .single();

  const hasCustomEventsAccess = subscription && 
    (subscription.plan_tier === "professional" || subscription.plan_tier === "enterprise") &&
    subscription.status === "active";

  if (!hasCustomEventsAccess) {
    return redirect(`/dashboard/${domain}/settings/events`);
  }

  return (
    <div className="space-y-6">
      <Breadcrumb 
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: domain, href: `/dashboard/${domain}` },
          { label: "Settings", href: `/dashboard/${domain}/settings` },
          { label: "Custom events", href: `/dashboard/${domain}/settings/events` },
          { label: "Create event" }
        ]}
        className="mb-6"
      />
      <CustomEventCreateForm
        siteId={siteData.id}
        domain={siteData.domain}
      />
    </div>
  );
}