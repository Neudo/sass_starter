import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  sendFeatureRequestConfirmationEmail,
  sendFeatureRequestNotificationEmail,
} from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

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

    const { subject, message } = await request.json();

    // Validation
    if (!subject || !message) {
      return NextResponse.json(
        { error: "Subject and message are required" },
        { status: 400 }
      );
    }

    if (subject.length > 100) {
      return NextResponse.json(
        { error: "Subject must be less than 100 characters" },
        { status: 400 }
      );
    }

    if (message.length < 10 || message.length > 1000) {
      return NextResponse.json(
        { error: "Message must be between 10 and 1000 characters" },
        { status: 400 }
      );
    }

    // Get user email and name for the record
    const userEmail = user.email || "unknown";
    const userName = user.user_metadata?.full_name || user.user_metadata?.name;

    // Send notification email to support team
    try {
      await sendFeatureRequestNotificationEmail({
        userEmail,
        userName,
        subject: subject.trim(),
        message: message.trim(),
      });
    } catch (emailError) {
      console.error(
        "Failed to send notification email to support:",
        emailError
      );
      return NextResponse.json(
        { error: "Failed to submit feature request" },
        { status: 500 }
      );
    }

    // Send confirmation email to the user
    try {
      await sendFeatureRequestConfirmationEmail({
        to: userEmail,
        userName,
        subject: subject.trim(),
        message: message.trim(),
      });
    } catch (emailError) {
      // Log email error but don't fail the request
      console.error("Failed to send confirmation email:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Feature request submitted successfully",
    });
  } catch (error) {
    console.error("Error submitting feature request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
