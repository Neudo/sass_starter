import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabase = await createClient();
    await supabase.from("waitlist").insert({ email });

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Dana Analytics <onboarding@resend.dev>",
        to: email,
        subject: "You're on the Dana waitlist!",
        html: `<p>Thanks for joining the Dana Analytics waitlist. You'll receive one month free when we launch. No credit card required.</p>`,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("waitlist error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
