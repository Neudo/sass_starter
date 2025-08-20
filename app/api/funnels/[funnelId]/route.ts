import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ funnelId: string }> }
) {
  try {
    const { funnelId } = await params;
    const supabase = await createClient();
    const adminClient = createAdminClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify funnel ownership
    const { data: funnel, error: funnelError } = await adminClient
      .from("funnels")
      .select("id")
      .eq("id", funnelId)
      .eq("user_id", user.id)
      .single();

    if (funnelError || !funnel) {
      return NextResponse.json(
        { error: "Funnel not found or unauthorized" },
        { status: 404 }
      );
    }

    // Delete funnel (CASCADE will delete steps and conversions)
    const { error: deleteError } = await adminClient
      .from("funnels")
      .delete()
      .eq("id", funnelId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting funnel:", error);
    return NextResponse.json(
      { error: "Failed to delete funnel" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ funnelId: string }> }
) {
  try {
    const { funnelId } = await params;
    const supabase = await createClient();
    const adminClient = createAdminClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, steps, is_active } = body;

    // Verify funnel ownership
    const { data: funnel, error: funnelError } = await adminClient
      .from("funnels")
      .select("id")
      .eq("id", funnelId)
      .eq("user_id", user.id)
      .single();

    if (funnelError || !funnel) {
      return NextResponse.json(
        { error: "Funnel not found or unauthorized" },
        { status: 404 }
      );
    }

    // Update funnel
    const { error: updateError } = await adminClient
      .from("funnels")
      .update({
        name,
        description,
        is_active,
      })
      .eq("id", funnelId);

    if (updateError) {
      throw updateError;
    }

    // If steps are provided, update them
    if (steps && Array.isArray(steps)) {
      // Delete existing steps
      await adminClient.from("funnel_steps").delete().eq("funnel_id", funnelId);

      // Insert new steps
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stepsToInsert = steps.map((step: any, index: number) => ({
        funnel_id: funnelId,
        step_number: index + 1,
        name: step.name,
        url_pattern: step.url_pattern,
        match_type: step.match_type || "exact",
      }));

      const { error: stepsError } = await adminClient
        .from("funnel_steps")
        .insert(stepsToInsert);

      if (stepsError) {
        throw stepsError;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating funnel:", error);
    return NextResponse.json(
      { error: "Failed to update funnel" },
      { status: 500 }
    );
  }
}
