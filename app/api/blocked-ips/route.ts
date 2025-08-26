import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET blocked IPs for a site
export async function GET(req: NextRequest) {
  const siteId = req.nextUrl.searchParams.get("siteId");

  if (!siteId) {
    return NextResponse.json({ error: "Site ID is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const adminClient = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  // Get blocked IPs
  const { data: blockedIPs, error } = await adminClient
    .from("blocked_ips")
    .select("*")
    .eq("site_id", siteId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch blocked IPs" },
      { status: 500 }
    );
  }

  return NextResponse.json(blockedIPs);
}

// POST - Add a blocked IP
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const { siteId, ip, reason, expiresAt } = await req.json();

  if (!siteId || !ip) {
    return NextResponse.json(
      { error: "Site ID and IP are required" },
      { status: 400 }
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

  // Add blocked IP
  const { data, error } = await adminClient
    .from("blocked_ips")
    .insert({
      site_id: siteId,
      ip,
      reason,
      expires_at: expiresAt || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      // Unique violation
      return NextResponse.json(
        { error: "IP is already blocked for this site" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Failed to block IP" }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE - Remove a blocked IP
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const { siteId, ip } = await req.json();

  if (!siteId || !ip) {
    return NextResponse.json(
      { error: "Site ID and IP are required" },
      { status: 400 }
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

  // Remove blocked IP
  const { error } = await adminClient
    .from("blocked_ips")
    .delete()
    .eq("site_id", siteId)
    .eq("ip", ip);

  if (error) {
    return NextResponse.json(
      { error: "Failed to unblock IP" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
