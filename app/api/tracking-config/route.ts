import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const siteDomain = searchParams.get('siteId'); // This is actually the domain

    console.log('[Tracking Config] Request for domain:', siteDomain);

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

    console.log('[Tracking Config] Looking for site with domains:', domainVariants);

    // First, get the site_id from the domain
    const { data: site, error: siteError } = await supabase
      .from("sites")
      .select("id")
      .in("domain", domainVariants)
      .single();

    console.log('[Tracking Config] Site lookup result:', { site, error: siteError });

    if (!site) {
      console.log('[Tracking Config] No site found for domain:', siteDomain);
      return NextResponse.json({ 
        funnelSteps: [],
        customEvents: []
      }, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Cache-Control": "public, max-age=300"
        }
      });
    }

    console.log('[Tracking Config] Found site_id:', site.id);

    // Get both funnel steps and custom events in parallel
    const [funnelStepsResult, customEventsResult] = await Promise.all([
      supabase
        .from("funnel_steps")
        .select(`
          *,
          funnels!inner (
            is_active,
            site_id
          )
        `)
        .eq("funnels.site_id", site.id)
        .eq("funnels.is_active", true),
      supabase
        .from("custom_events")
        .select("*")
        .eq("site_id", site.id)
        .eq("is_active", true)
    ]);

    console.log('[Tracking Config] Query results:', {
      funnelSteps: funnelStepsResult.data?.length || 0,
      customEvents: customEventsResult.data?.length || 0,
      funnelStepsError: funnelStepsResult.error,
      customEventsError: customEventsResult.error
    });

    if (funnelStepsResult.data && funnelStepsResult.data.length > 0) {
      console.log('[Tracking Config] Funnel steps found:', 
        funnelStepsResult.data.map(s => ({
          id: s.id,
          name: s.name,
          type: s.step_type,
          url: s.url_pattern
        }))
      );
    }

    return NextResponse.json({
      funnelSteps: funnelStepsResult.data || [],
      customEvents: customEventsResult.data || []
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "public, max-age=300" // Cache 5 minutes
      }
    });

  } catch (error) {
    console.error('Error fetching tracking config:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { 
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        }
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