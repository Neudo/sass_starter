import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOAuth2Client } from "@/lib/google-analytics";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  // Handle OAuth error
  if (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.redirect(
      new URL(
        `/dashboard/settings/imports?error=${encodeURIComponent(error)}`,
        request.url
      )
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/dashboard/settings/imports?error=missing_code", request.url)
    );
  }

  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Exchange authorization code for tokens
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token) {
      throw new Error("No access token received");
    }

    // Store tokens in database
    const { data: upsertData, error: dbError } = await adminClient
      .from("google_auth_tokens")
      .upsert({
        user_id: user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
        scope:
          tokens.scope || "https://www.googleapis.com/auth/analytics.readonly",
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) {
      console.error("Error storing Google tokens:", JSON.stringify(dbError, null, 2));
      throw new Error(`Failed to store authentication tokens: ${dbError.message || 'Unknown error'}`);
    }

    console.log("Successfully stored Google tokens for user:", user.id);

    // Parse state to get domain
    let redirectPath = "/dashboard/settings/imports?success=connected";
    
    try {
      const state = searchParams.get("state");
      if (state) {
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
        if (stateData.domain) {
          redirectPath = `/dashboard/${stateData.domain}/settings/imports?success=connected`;
        }
      }
    } catch (err) {
      console.error("Error parsing state:", err);
    }

    // Redirect back to imports page with success
    return NextResponse.redirect(
      new URL(redirectPath, request.url)
    );
  } catch (error) {
    console.error("Error in Google OAuth callback:", error);
    return NextResponse.redirect(
      new URL(
        `/dashboard/settings/imports?error=${encodeURIComponent(
          "auth_failed"
        )}`,
        request.url
      )
    );
  }
}
