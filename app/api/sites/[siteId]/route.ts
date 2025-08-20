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
      .select("id, domain")
      .eq("id", siteId)
      .eq("user_id", user.id)
      .single();

    if (siteError || !site) {
      return NextResponse.json(
        { error: "Site not found or unauthorized" },
        { status: 404 }
      );
    }

    console.log(`Deleting site: ${site.domain} (${siteId})`);

    // Delete site and all related data
    // The CASCADE constraints should handle most relationships,
    // but we'll be explicit for important data

    // 1. Delete funnel conversions
    await adminClient
      .from("funnel_conversions")
      .delete()
      .eq("site_id", siteId);

    // 2. Delete funnel steps (via funnel deletion cascade)
    const { data: funnels } = await adminClient
      .from("funnels")
      .select("id")
      .eq("site_id", siteId);

    if (funnels && funnels.length > 0) {
      const funnelIds = funnels.map(f => f.id);
      
      await adminClient
        .from("funnel_steps")
        .delete()
        .in("funnel_id", funnelIds);
    }

    // 3. Delete funnels
    await adminClient
      .from("funnels")
      .delete()
      .eq("site_id", siteId);

    // 4. Delete analytics events
    await adminClient
      .from("analytics_events")
      .delete()
      .eq("site_id", siteId);

    // 5. Delete sessions
    await adminClient
      .from("sessions")
      .delete()
      .eq("site_id", siteId);

    // 6. Delete GA import jobs
    await adminClient
      .from("ga_import_jobs")
      .delete()
      .eq("site_id", siteId);

    // 7. Delete usage events
    await adminClient
      .from("usage_events")
      .delete()
      .eq("site_id", siteId);

    // 8. Finally, delete the site itself
    const { error: deleteSiteError } = await adminClient
      .from("sites")
      .delete()
      .eq("id", siteId);

    if (deleteSiteError) {
      console.error("Error deleting site:", deleteSiteError);
      throw deleteSiteError;
    }

    console.log(`Site deletion completed: ${site.domain}`);

    return NextResponse.json({ 
      success: true, 
      message: "Site deleted successfully" 
    });

  } catch (error) {
    console.error("Error deleting site:", error);
    return NextResponse.json(
      { error: "Failed to delete site" },
      { status: 500 }
    );
  }
}