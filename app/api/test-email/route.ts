import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Security check - only allow in development or with a secret param
    const url = new URL(req.url);
    const secret = url.searchParams.get("secret");
    
    if (process.env.NODE_ENV !== "development" && secret !== "test-resend-2024") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        error: "RESEND_API_KEY is not set",
        env: process.env.NODE_ENV,
      }, { status: 500 });
    }

    // Test simple email
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Hector Analytics <support@hectoranalytics.com>",
        to: "bassalair.quentin@gmail.com",
        subject: "Test Email - Hector Analytics",
        text: "This is a test email to verify Resend is working correctly.",
        html: `
          <div>
            <h2>Test Email</h2>
            <p>This is a test email from Hector Analytics.</p>
            <p>If you receive this, Resend is configured correctly!</p>
            <p>Timestamp: ${new Date().toISOString()}</p>
            <p>Environment: ${process.env.NODE_ENV || "unknown"}</p>
          </div>
        `,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        error: "Resend API error",
        status: response.status,
        details: data,
        apiKeyPresent: !!process.env.RESEND_API_KEY,
        apiKeyLength: process.env.RESEND_API_KEY?.length,
        apiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 10),
      }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      resendResponse: data,
      environment: process.env.NODE_ENV,
    });

  } catch (error) {
    console.error("Test email error:", error);
    return NextResponse.json({
      error: "Failed to send test email",
      details: error instanceof Error ? error.message : "Unknown error",
      apiKeyPresent: !!process.env.RESEND_API_KEY,
    }, { status: 500 });
  }
}