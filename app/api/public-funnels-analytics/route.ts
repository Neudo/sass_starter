import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const adminClient = createAdminClient();

    const searchParams = request.nextUrl.searchParams;
    const siteDomain = searchParams.get("domain");
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");

    if (!siteDomain) {
      return NextResponse.json(
        { error: "Domain is required" },
        { status: 400 }
      );
    }

    // Normalize domain - handle both with and without www
    const domainVariants = [siteDomain];
    if (siteDomain.startsWith('www.')) {
      domainVariants.push(siteDomain.substring(4));
    } else {
      domainVariants.push(`www.${siteDomain}`);
    }

    // Find site by domain and verify public access is enabled
    const { data: siteData, error: siteError } = await adminClient
      .from("sites")
      .select("id, public_enabled")
      .in("domain", domainVariants)
      .single();

    if (siteError || !siteData || !siteData.public_enabled) {
      return NextResponse.json([]);
    }

    // Get funnels with their steps and completion counts
    const { data: funnels, error: funnelsError } = await adminClient
      .from("funnels")
      .select(
        `
        id,
        name,
        description,
        is_active,
        created_at,
        funnel_steps!inner (
          id,
          step_number,
          name,
          url_pattern,
          match_type
        )
      `
      )
      .eq("site_id", siteData.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (funnelsError) {
      console.error("Error fetching funnels:", funnelsError);
      return NextResponse.json([]);
    }

    // For each funnel, get completion counts with date filtering
    const funnelsWithAnalytics = await Promise.all(
      (funnels || []).map(async (funnel) => {
        const steps = (funnel.funnel_steps || []).sort(
          (a, b) => a.step_number - b.step_number
        );

        // Get completion counts for each step with date filtering
        const stepsWithData = await Promise.all(
          steps.map(async (step) => {
            let completionsQuery = adminClient
              .from("funnel_step_completions")
              .select("id, session_id")
              .eq("step_id", step.id);

            // Apply date filters if provided
            if (fromDate && toDate) {
              completionsQuery = completionsQuery
                .gte("completed_at", fromDate)
                .lte("completed_at", toDate);
            }

            const { data: completions } = await completionsQuery;
            const visitors = completions?.length || 0;
            
            // Get session data for source and country breakdown
            let sourceBreakdown: Array<{
              source: string;
              count: number;
              percentage: number;
            }> = [];
            let countryBreakdown: Array<{
              country: string;
              count: number;
              percentage: number;
            }> = [];
            
            if (completions && completions.length > 0) {
              const sessionIds = completions.map(c => c.session_id).filter(Boolean);
              
              if (sessionIds.length > 0) {
                // Get sessions data
                const { data: sessions } = await adminClient
                  .from("sessions")
                  .select("referrer, country")
                  .in("id", sessionIds);
                
                if (sessions) {
                  // Source breakdown
                  const sourceCounts: Record<string, number> = {};
                  sessions.forEach((session) => {
                    const source = session.referrer || "Direct";
                    sourceCounts[source] = (sourceCounts[source] || 0) + 1;
                  });
                  
                  sourceBreakdown = Object.entries(sourceCounts)
                    .map(([source, count]) => ({
                      source,
                      count,
                      percentage: Math.round((count / sessions.length) * 100),
                    }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 3);
                  
                  // Country breakdown
                  const countryCounts: Record<string, number> = {};
                  sessions.forEach((session) => {
                    const country = session.country || "Unknown";
                    countryCounts[country] = (countryCounts[country] || 0) + 1;
                  });
                  
                  countryBreakdown = Object.entries(countryCounts)
                    .map(([country, count]) => ({
                      country,
                      count,
                      percentage: Math.round((count / sessions.length) * 100),
                    }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 3);
                }
              }
            }

            return {
              ...step,
              visitors,
              source_breakdown: sourceBreakdown,
              country_breakdown: countryBreakdown,
            };
          })
        );

        // Calculate conversion rates after getting all visitor counts
        const stepsWithRates = stepsWithData.map((step) => {
          const firstStepVisitors = stepsWithData[0]?.visitors || 0;
          const conversionRate =
            firstStepVisitors > 0
              ? (step.visitors / firstStepVisitors) * 100
              : 0;

          return {
            ...step,
            conversion_rate: conversionRate,
          };
        });

        // Calculate overall funnel conversion rate
        const totalVisitors = stepsWithRates[0]?.visitors || 0;
        const completedVisitors =
          stepsWithRates[stepsWithRates.length - 1]?.visitors || 0;
        const overallConversionRate =
          totalVisitors > 0 ? (completedVisitors / totalVisitors) * 100 : 0;

        return {
          ...funnel,
          steps: stepsWithRates,
          total_visitors: totalVisitors,
          conversion_rate: overallConversionRate,
        };
      })
    );

    return NextResponse.json(funnelsWithAnalytics);
  } catch (error) {
    console.error("Error fetching public funnels analytics:", error);
    return NextResponse.json([]);
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