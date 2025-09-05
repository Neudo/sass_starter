import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { hasEnvVars } from "@/lib/utils";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    // For dashboard routes, we need to check authentication and access rights
    
    // Skip if env vars are not set
    if (!hasEnvVars) {
      return NextResponse.next({ request });
    }

    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // We don't need to set cookies for this check
          },
        },
      },
    );

    // Check if accessing a specific domain dashboard
    const domainMatch = pathname.match(/^\/dashboard\/([^\/]+)/);
    
    if (domainMatch && domainMatch[1]) {
      const requestedDomain = domainMatch[1];
      
      // First check if this is a public dashboard
      const { data: siteInfo } = await supabase
        .from("sites")
        .select("id, domain, user_id, is_public")
        .or(`domain.eq.${requestedDomain},domain.eq.www.${requestedDomain}`)
        .single();

      // If site doesn't exist, redirect to home page
      if (!siteInfo) {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();

      // If it's a public dashboard, allow access even without login
      if (siteInfo.is_public) {
        return await updateSession(request);
      }

      // For private dashboards, require authentication
      if (!user) {
        const url = request.nextUrl.clone();
        url.pathname = "/auth/login";
        return NextResponse.redirect(url);
      }

      // Check if user owns the site
      if (siteInfo.user_id !== user.id) {
        // User doesn't own this private site, redirect to their own dashboard
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }
    } else {
      // Accessing /dashboard without a specific domain - require login
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        const url = request.nextUrl.clone();
        url.pathname = "/auth/login";
        return NextResponse.redirect(url);
      }
    }

    // User has access, proceed with the normal session update
    return await updateSession(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
