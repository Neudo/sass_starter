import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
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
    const { newOwnerEmail } = body;

    if (!newOwnerEmail) {
      return NextResponse.json(
        { error: "New owner email is required" },
        { status: 400 }
      );
    }

    // Verify site ownership
    const { data: site, error: siteError } = await adminClient
      .from("sites")
      .select("id, domain, name")
      .eq("id", siteId)
      .eq("user_id", user.id)
      .single();

    if (siteError || !site) {
      return NextResponse.json(
        { error: "Site not found or unauthorized" },
        { status: 404 }
      );
    }

    // Check if the new owner email exists in the system
    const { data: newOwnerUser, error: newOwnerError } =
      await adminClient.auth.admin.listUsers();

    if (newOwnerError) {
      return NextResponse.json(
        { error: "Failed to validate new owner email" },
        { status: 500 }
      );
    }

    const targetUser = newOwnerUser.users.find(
      (u) => u.email === newOwnerEmail
    );

    if (!targetUser) {
      return NextResponse.json(
        {
          error:
            "The email address must belong to an existing Hector Analytics user",
        },
        { status: 400 }
      );
    }

    if (targetUser.id === user.id) {
      return NextResponse.json(
        { error: "Cannot transfer site to yourself" },
        { status: 400 }
      );
    }

    // For now, we'll create a simple transfer record
    // In a full implementation, you might want to:
    // 1. Create a site_transfer_requests table
    // 2. Send an email to the new owner
    // 3. Allow them to accept/reject the transfer
    // 4. Only then actually transfer the site

    // For this implementation, we'll do a direct transfer
    const { error: transferError } = await adminClient
      .from("sites")
      .update({
        user_id: targetUser.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", siteId);

    if (transferError) {
      console.error("Error transferring site:", transferError);
      return NextResponse.json(
        { error: "Failed to transfer site" },
        { status: 500 }
      );
    }

    // Note: In a production system, you might also want to:
    // 1. Transfer or handle associated subscriptions
    // 2. Send notification emails to both parties
    // 3. Log the transfer for audit purposes
    // 4. Handle any plan/billing implications

    return NextResponse.json({
      success: true,
      message: `Site ${site.domain} has been transferred to ${newOwnerEmail}`,
    });
  } catch (error) {
    console.error("Error transferring site:", error);
    return NextResponse.json(
      { error: "Failed to transfer site" },
      { status: 500 }
    );
  }
}
