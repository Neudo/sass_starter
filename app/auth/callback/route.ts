import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const mode = searchParams.get("mode") || "login";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      // Check if this is a new user by looking at the user metadata
      const isNewUser =
        data.user?.user_metadata?.iss === "https://accounts.google.com" &&
        new Date(data.user?.created_at || "").getTime() > Date.now() - 60000; // Created within last minute

      let redirectPath = "/dashboard"; // Default for existing users

      if (mode === "register" || isNewUser) {
        redirectPath = "/welcome";
      }

      console.log(
        `Redirecting ${isNewUser ? "new" : "existing"} user to: ${origin}${redirectPath}`
      );
      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
