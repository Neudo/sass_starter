import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const siteDomain = searchParams.get("siteId"); // This is actually the domai

    if (!siteDomain) {
      return NextResponse.json({ error: "Missing siteId" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Normalize domain - handle both with and without www
    const domainVariants = [siteDomain];
    if (siteDomain.startsWith("www.")) {
      domainVariants.push(siteDomain.substring(4));
    } else {
      domainVariants.push(`www.${siteDomain}`);
    }

    // First, get the site_id from the domain
    const { data: site } = await supabase
      .from("sites")
      .select("id")
      .in("domain", domainVariants)
      .single();

    if (!site) {
      return NextResponse.json(
        {
          funnelSteps: [],
          customEvents: [],
        },
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Cache-Control": "public, max-age=300",
          },
        }
      );
    }

    // Get both funnel steps and custom events in parallel
    const [funnelStepsResult, customEventsResult] = await Promise.all([
      supabase
        .from("funnel_steps")
        .select(
          `
          *,
          funnels!inner (
            is_active,
            site_id
          )
        `
        )
        .eq("funnels.site_id", site.id)
        .eq("funnels.is_active", true),
      supabase
        .from("custom_events")
        .select("*")
        .eq("site_id", site.id)
        .eq("is_active", true),
    ]);

    return NextResponse.json(
      {
        funnelSteps: funnelStepsResult.data || [],
        customEvents: customEventsResult.data || [],
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Cache-Control": "public, max-age=300", // Cache 5 minutes
        },
      }
    );
  } catch (error) {
    console.error("Error fetching tracking config:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
