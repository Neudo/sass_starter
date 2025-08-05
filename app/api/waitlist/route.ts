import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabase = await createAdminClient();
    await supabase.from("waitlist").insert({ email });

    // Try sending the email and capture any errors
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Hector Analytics <support@hectoranalytics.com>",
        to: email,
        subject: "You're on the Hector Analytics waitlist!",
        html: `<p>Thanks for joining the Hector Analytics waitlist. You'll receive one month free when we launch. No credit card required.</p>`,
      }),
    });

    // Log email sending response for debugging
    const emailResult = await emailResponse.json();
    console.log("Email sending result:", emailResult);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("waitlist error", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
