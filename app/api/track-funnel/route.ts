import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { siteId, sessionId, currentUrl } = body;

    if (!siteId || !sessionId || !currentUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Resolve domain to site_id if needed
    let resolvedSiteId = siteId;
    if (typeof siteId === "string" && !siteId.match(/^[0-9a-f-]+$/i)) {
      // If siteId looks like a domain, resolve it
      const { data: siteData } = await supabase
        .from("sites")
        .select("id")
        .eq("domain", siteId)
        .single();
      
      if (!siteData) {
        console.log(`No site found for domain: ${siteId}`);
        return NextResponse.json({ tracked: false });
      }
      
      resolvedSiteId = siteData.id;
    }

    // Get all active funnels for this site
    const { data: funnels, error: funnelsError } = await supabase
      .from("funnels")
      .select(`
        id,
        name,
        funnel_steps (
          step_number,
          name,
          url_pattern,
          match_type
        )
      `)
      .eq("site_id", resolvedSiteId)
      .eq("is_active", true);

    if (funnelsError || !funnels) {
      console.error("Error fetching funnels:", funnelsError);
      return NextResponse.json({ tracked: false });
    }

    const conversionsToInsert = [];

    // Check each funnel to see if current URL matches any step
    for (const funnel of funnels) {
      for (const step of funnel.funnel_steps) {
        const isMatch = checkUrlMatch(currentUrl, step.url_pattern, step.match_type);
        
        if (isMatch) {
          // Check if this session already completed this step
          const { data: existingConversion } = await supabase
            .from("funnel_conversions")
            .select("id")
            .eq("funnel_id", funnel.id)
            .eq("session_id", sessionId)
            .eq("step_number", step.step_number)
            .single();

          if (!existingConversion) {
            conversionsToInsert.push({
              funnel_id: funnel.id,
              session_id: sessionId,
              site_id: resolvedSiteId,
              step_number: step.step_number,
              step_name: step.name,
              url_visited: currentUrl,
            });
          }
        }
      }
    }

    // Insert all new conversions
    if (conversionsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from("funnel_conversions")
        .insert(conversionsToInsert);

      if (insertError) {
        console.error("Error inserting conversions:", insertError);
        return NextResponse.json({ tracked: false });
      }

      console.log(`✅ Tracked ${conversionsToInsert.length} funnel conversions`);
    }

    return NextResponse.json({ 
      tracked: true,
      conversions: conversionsToInsert.length 
    });

  } catch (error) {
    console.error("Funnel tracking error:", error);
    return NextResponse.json({ tracked: false }, { status: 500 });
  }
}

// Helper function to check if URL matches pattern based on match type
function checkUrlMatch(url: string, pattern: string, matchType: string): boolean {
  try {
    const urlPath = new URL(url).pathname;
    
    switch (matchType) {
      case "exact":
        return urlPath === pattern;
      
      case "contains":
        return urlPath.includes(pattern);
      
      case "starts_with":
        return urlPath.startsWith(pattern);
      
      case "regex":
        const regex = new RegExp(pattern);
        return regex.test(urlPath);
      
      default:
        return false;
    }
  } catch {
    // If URL parsing fails, fall back to string matching
    switch (matchType) {
      case "exact":
        return url === pattern;
      case "contains":
        return url.includes(pattern);
      case "starts_with":
        return url.startsWith(pattern);
      case "regex":
        const regex = new RegExp(pattern);
        return regex.test(url);
      default:
        return false;
    }
  }
}