"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function togglePublicDashboard(siteId: string, enabled: boolean) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { error: "Not authenticated" };
  }

  // Verify site ownership
  const { data: siteData, error: siteError } = await adminClient
    .from("sites")
    .select("user_id")
    .eq("id", siteId)
    .single();

  if (siteError || !siteData || siteData.user_id !== user.id) {
    return { error: "Site not found or access denied" };
  }

  // Update public_enabled field
  const { error: updateError } = await adminClient
    .from("sites")
    .update({ public_enabled: enabled })
    .eq("id", siteId);

  if (updateError) {
    return { error: "Failed to update public dashboard setting" };
  }

  // Revalidate the settings page and public dashboard page
  revalidatePath(`/dashboard/[domain]/settings`);
  revalidatePath(`/[domain]`);

  return { 
    success: enabled 
      ? "Public dashboard enabled successfully" 
      : "Public dashboard disabled successfully" 
  };
}