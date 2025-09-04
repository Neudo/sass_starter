import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const adminClient = createAdminClient();

    const { searchParams } = new URL(request.url);
    const siteDomain = searchParams.get("siteId");

    if (!siteDomain) {
      return NextResponse.json(
        { error: "Site domain is required" },
        { 
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      );
    }

    // Normalize domain - handle both with and without www
    const domainVariants = [siteDomain];
    if (siteDomain.startsWith('www.')) {
      domainVariants.push(siteDomain.substring(4));
    } else {
      domainVariants.push(`www.${siteDomain}`);
    }

    // Find site by domain (no auth check - public endpoint)
    const { data: sites, error: siteError } = await adminClient
      .from("sites")
      .select("id")
      .in("domain", domainVariants);
    
    const siteData = sites && sites.length > 0 ? sites[0] : null;

    if (siteError || !siteData) {
      return NextResponse.json([], {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }); // Return empty array if site not found
    }

    // Fetch only active custom events for this site
    const { data: customEvents, error } = await adminClient
      .from("custom_events")
      .select(
        `
        id,
        name,
        event_type,
        event_selector,
        trigger_config,
        is_active
      `
      )
      .eq("site_id", siteData.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching custom events:", error);
      return NextResponse.json([], {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    return NextResponse.json(customEvents || [], {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Error in public-custom-events:", error);
    return NextResponse.json([], {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }
}

// Handle OPTIONS for CORS
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
