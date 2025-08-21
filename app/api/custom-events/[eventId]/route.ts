import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, event_type, event_selector, trigger_config, is_active } = body;

    if (!name || !event_type) {
      return NextResponse.json(
        { error: "Name and event type are required" },
        { status: 400 }
      );
    }

    // First verify the event exists and user has permission
    const { data: existingEvent, error: checkError } = await adminClient
      .from("custom_events")
      .select("id, site_id")
      .eq("id", eventId)
      .single();

    if (checkError || !existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Verify site ownership
    const { data: siteData, error: siteError } = await adminClient
      .from("sites")
      .select("id")
      .eq("id", existingEvent.site_id)
      .eq("user_id", user.id)
      .single();

    if (siteError || !siteData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update custom event
    const { data: updatedEvent, error } = await adminClient
      .from("custom_events")
      .update({
        name,
        description: description || null,
        event_type,
        event_selector: event_selector || null,
        trigger_config: trigger_config || {},
        is_active,
      })
      .eq("id", eventId)
      .select(`
        id,
        name,
        description,
        event_type,
        event_selector,
        trigger_config,
        is_active,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      console.error("Error updating custom event:", error);
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: "An event with this name already exists for this site" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Failed to update custom event" },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Error updating custom event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First verify the event exists and user has permission
    const { data: existingEvent, error: checkError } = await adminClient
      .from("custom_events")
      .select("id, site_id")
      .eq("id", eventId)
      .single();

    if (checkError || !existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Verify site ownership
    const { data: siteData, error: siteError } = await adminClient
      .from("sites")
      .select("id")
      .eq("id", existingEvent.site_id)
      .eq("user_id", user.id)
      .single();

    if (siteError || !siteData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete custom event
    const { error } = await adminClient
      .from("custom_events")
      .delete()
      .eq("id", eventId);

    if (error) {
      console.error("Error deleting custom event:", error);
      return NextResponse.json(
        { error: "Failed to delete custom event" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting custom event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { is_active } = body;

    if (typeof is_active !== 'boolean') {
      return NextResponse.json(
        { error: "is_active must be a boolean" },
        { status: 400 }
      );
    }

    // First verify the event exists and user has permission
    const { data: existingEvent, error: checkError } = await adminClient
      .from("custom_events")
      .select("id, site_id")
      .eq("id", eventId)
      .single();

    if (checkError || !existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Verify site ownership
    const { data: siteData, error: siteError } = await adminClient
      .from("sites")
      .select("id")
      .eq("id", existingEvent.site_id)
      .eq("user_id", user.id)
      .single();

    if (siteError || !siteData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update is_active status
    const { data: updatedEvent, error } = await adminClient
      .from("custom_events")
      .update({ is_active })
      .eq("id", eventId)
      .select(`
        id,
        name,
        description,
        event_type,
        event_selector,
        trigger_config,
        is_active,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      console.error("Error updating custom event status:", error);
      return NextResponse.json(
        { error: "Failed to update custom event status" },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Error updating custom event status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}