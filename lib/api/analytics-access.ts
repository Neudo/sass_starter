import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

interface AnalyticsAccessOptions {
  siteId: string;
  isPublic?: boolean;
}

export async function canReadAnalytics({
  siteId,
  isPublic = false,
}: AnalyticsAccessOptions) {
  const admin = createAdminClient();

  const { data: site, error } = await admin
    .from("sites")
    .select("id, user_id, public_enabled")
    .eq("id", siteId)
    .maybeSingle();

  if (error || !site) {
    return { allowed: false, status: 404, error: "Site not found" };
  }

  if (isPublic && site.public_enabled) {
    return { allowed: true, status: 200, error: null };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { allowed: false, status: 401, error: "Unauthorized" };
  }

  if (site.user_id !== user.id) {
    return { allowed: false, status: 403, error: "Forbidden" };
  }

  return { allowed: true, status: 200, error: null };
}
