import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const supabase = await createClient();
    const adminClient = createAdminClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify site ownership
    const { data: site, error: siteError } = await adminClient
      .from("sites")
      .select("id")
      .eq("id", siteId)
      .eq("user_id", user.id)
      .single();

    if (siteError || !site) {
      return NextResponse.json(
        { error: "Site not found or unauthorized" },
        { status: 404 }
      );
    }

    console.log(`Resetting analytics data for site: ${siteId}`);

    // Delete analytics data but keep site configuration
    // Order matters due to foreign key constraints

    // 1. Delete funnel conversions for this site
    await adminClient
      .from("funnel_conversions")
      .delete()
      .eq("site_id", siteId);

    // 2. Delete analytics events for this site
    await adminClient
      .from("analytics_events")
      .delete()
      .eq("site_id", siteId);

    // 3. Delete sessions for this site
    await adminClient
      .from("sessions")
      .delete()
      .eq("site_id", siteId);

    // 4. Delete GA import jobs for this site
    await adminClient
      .from("ga_import_jobs")
      .delete()
      .eq("site_id", siteId);

    // 5. Delete usage events for this site
    await adminClient
      .from("usage_events")
      .delete()
      .eq("site_id", siteId);

    // Note: We keep funnels and funnel_steps as they are configuration, not data
    // Note: We keep the site record itself and its settings

    console.log(`Analytics data reset completed for site: ${siteId}`);

    return NextResponse.json({ 
      success: true, 
      message: "Analytics data reset successfully" 
    });

  } catch (error) {
    console.error("Error resetting site data:", error);
    return NextResponse.json(
      { error: "Failed to reset analytics data" },
      { status: 500 }
    );
  }
}