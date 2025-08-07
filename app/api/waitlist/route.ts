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

    // Check if API key exists
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set");
      return NextResponse.json(
        { error: "Email configuration error" },
        { status: 500 }
      );
    }

    // Try sending the email and capture any errors
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Hector from Hector Analytics <support@hectoranalytics.com>",
        to: email,
        subject: "Welcome to Hector Analytics",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px;">
            <p>Hi there,</p>
            
            <p>Thank you for your interest in Hector Analytics. I wanted to personally confirm that you're now on our early access list.</p>
            
            <p>We're building something special - a analytics platform that actually makes sense for modern teams. As an early supporter, you'll get:</p>
            
            <ul style="margin: 16px 0; padding-left: 20px;">
              <li>First access when we launch</li>
              <li>30 days at no cost to try everything</li>
              <li>Direct line to our team for feedback</li>
            </ul>
            
            <p>I'll keep you updated on our progress. In the meantime, feel free to reply if you have any questions about what we're building.</p>
            
            <p>Best regards,<br>
            Quentin<br>
            Founder, Hector Analytics</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
            <p style="font-size: 12px; color: #666;">You're receiving this because you signed up for early access to Hector Analytics. If you'd prefer not to receive updates, just reply and let me know.</p>
          </div>
        `,
      }),
    });

    // Log email sending response for debugging
    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error("Email sending failed:", {
        status: emailResponse.status,
        error: errorData,
        to: email
      });
      // Continue anyway, user is already in waitlist
    } else {
      const emailResult = await emailResponse.json();
      console.log("Email sent successfully:", emailResult);
    }

    // Send notification email to admin
    try {
      const adminEmailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Hector Analytics <support@hectoranalytics.com>",
          to: "bassalair.quentin@gmail.com",
          subject: "🎉 Nouvelle inscription à la waitlist !",
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333;">
              <h2 style="color: #3d9dbd;">Quelqu'un vient de s'inscrire à la waitlist !</h2>
              
              <p><strong>Email :</strong> ${email}</p>
              <p><strong>Date :</strong> ${new Date().toLocaleString('fr-FR', { 
                timeZone: 'Europe/Paris',
                dateStyle: 'full',
                timeStyle: 'short'
              })}</p>
              
              <p style="margin-top: 20px; padding: 15px; background: #f0f9ff; border-left: 4px solid #3d9dbd;">
                N'oublie pas de le/la contacter personnellement si c'est un prospect intéressant !
              </p>
            </div>
          `,
        }),
      });

      if (!adminEmailResponse.ok) {
        const adminErrorData = await adminEmailResponse.json();
        console.error("Admin notification email failed:", {
          status: adminEmailResponse.status,
          error: adminErrorData
        });
      } else {
        const adminResult = await adminEmailResponse.json();
        console.log("Admin notification sent:", adminResult);
      }
    } catch (adminEmailError) {
      console.error("Failed to send admin notification:", adminEmailError);
      // Don't fail the whole request if admin notification fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("waitlist error", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
