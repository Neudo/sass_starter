import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE() {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete the stored Google tokens
    const { error: deleteError } = await adminClient
      .from("google_auth_tokens")
      .delete()
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Error deleting Google tokens:", deleteError);
      return NextResponse.json(
        { error: "Failed to disconnect Google Analytics" },
        { status: 500 }
      );
    }

    // Also delete any pending import jobs for this user
    await adminClient
      .from("ga_import_jobs")
      .delete()
      .eq("user_id", user.id)
      .in("status", ["pending", "running"]);

    return NextResponse.json({
      success: true,
      message: "Google Analytics disconnected successfully",
    });
  } catch (error) {
    console.error("Error in disconnect endpoint:", error);
    return NextResponse.json(
      { error: "Failed to disconnect Google Analytics" },
      { status: 500 }
    );
  }
}
