import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET bot sessions for a site
export async function GET(req: NextRequest) {
  const siteId = req.nextUrl.searchParams.get("siteId");
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "100");
  
  if (!siteId) {
    return NextResponse.json(
      { error: "Site ID is required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const adminClient = createAdminClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  // Verify user owns the site
  const { data: site } = await adminClient
    .from("sites")
    .select("id")
    .eq("id", siteId)
    .eq("user_id", user.id)
    .single();

  if (!site) {
    return NextResponse.json(
      { error: "Site not found or access denied" },
      { status: 403 }
    );
  }

  // Get bot sessions
  const { data: botSessions, error } = await adminClient
    .from("bot_sessions")
    .select("*")
    .eq("site_id", siteId)
    .order("attempted_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch bot sessions" },
      { status: 500 }
    );
  }

  // Get statistics
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  const { data: stats } = await adminClient
    .from("bot_sessions")
    .select("block_reason")
    .eq("site_id", siteId)
    .gte("attempted_at", twentyFourHoursAgo);

  const blockReasons: Record<string, number> = {};
  if (stats) {
    stats.forEach(session => {
      const reason = session.block_reason || 'unknown';
      blockReasons[reason] = (blockReasons[reason] || 0) + 1;
    });
  }

  return NextResponse.json({
    sessions: botSessions,
    stats: {
      total24h: stats?.length || 0,
      byReason: blockReasons
    }
  });
}