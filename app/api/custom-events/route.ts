import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const siteParam = searchParams.get("siteId");

    if (!siteParam) {
      return NextResponse.json({ error: "Site ID is required" }, { status: 400 });
    }

    // Verify site ownership - siteParam could be either domain or UUID
    let siteQuery = adminClient
      .from("sites")
      .select("id")
      .eq("user_id", user.id);
    
    // Check if it looks like a UUID (contains hyphens) or domain
    if (siteParam.includes('-') && siteParam.length > 30) {
      siteQuery = siteQuery.eq("id", siteParam);
    } else {
      // For domain, also handle localhost
      siteQuery = siteQuery.eq("domain", siteParam);
    }

    const { data: siteData, error: siteError } = await siteQuery.single();

    if (siteError || !siteData) {
      return NextResponse.json({ error: "Site not found or unauthorized" }, { status: 404 });
    }

    // Fetch custom events for this site
    const { data: customEvents, error } = await adminClient
      .from("custom_events")
      .select(`
        id,
        name,
        description,
        event_type,
        event_selector,
        trigger_config,
        is_active,
        created_at,
        trigger_count
      `)
      .eq("site_id", siteData.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching custom events:", error);
      return NextResponse.json(
        { error: "Failed to fetch custom events" },
        { status: 500 }
      );
    }

    // Add total_triggers field for compatibility
    const customEventsWithStats = (customEvents || []).map(event => ({
      ...event,
      total_triggers: event.trigger_count || 0,
    }));

    return NextResponse.json(customEventsWithStats);
  } catch (error) {
    console.error("Error fetching custom events:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, event_type, event_selector, trigger_config, site_id } = body;

    if (!name || !event_type || !site_id) {
      return NextResponse.json(
        { error: "Name, event type, and site ID are required" },
        { status: 400 }
      );
    }

    // Verify site ownership
    const { data: siteData, error: siteError } = await adminClient
      .from("sites")
      .select("id")
      .eq("id", site_id)
      .eq("user_id", user.id)
      .single();

    if (siteError || !siteData) {
      return NextResponse.json({ error: "Site not found or unauthorized" }, { status: 404 });
    }

    // Create custom event
    const { data: newEvent, error } = await adminClient
      .from("custom_events")
      .insert({
        name,
        description: description || null,
        event_type,
        event_selector: event_selector || null,
        trigger_config: trigger_config || {},
        site_id,
        user_id: user.id,
      })
      .select(`
        id,
        name,
        description,
        event_type,
        event_selector,
        trigger_config,
        is_active,
        created_at
      `)
      .single();

    if (error) {
      console.error("Error creating custom event:", error);
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: "An event with this name already exists for this site" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Failed to create custom event" },
        { status: 500 }
      );
    }

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error("Error creating custom event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}