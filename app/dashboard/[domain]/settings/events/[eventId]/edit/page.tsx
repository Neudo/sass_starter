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

  // Get the actual custom event data from database
  const { data: customEvent, error: eventError } = await adminClient
    .from("custom_events")
    .select("*")
    .eq("id", eventId)
    .eq("site_id", siteData.id)
    .single();

  if (eventError || !customEvent) {
    return notFound();
  }

  return (
    <CustomEventEditForm
      siteId={siteData.id}
      domain={siteData.domain}
      customEvent={customEvent}
    />
  );
}