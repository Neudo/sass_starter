import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect, notFound } from "next/navigation";
import { CustomEventEditForm } from "./CustomEventEditForm";

export default async function EditCustomEventPage({
  params,
}: {
  params: Promise<{ domain: string; eventId: string }>;
}) {
  const { domain, eventId } = await params;
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

  // Get custom event data - for now we'll simulate the fetch
  // Once the API is ready, this will fetch from /api/custom-events/[eventId]
  const mockCustomEvent = {
    id: eventId,
    name: "Sample Click Event",
    description: "Tracks clicks on purchase buttons",
    event_type: "click" as const,
    event_selector: ".buy-button",
    trigger_config: {},
    is_active: true,
  };

  return (
    <CustomEventEditForm
      siteId={siteData.id}
      domain={siteData.domain}
      customEvent={mockCustomEvent}
    />
  );
}