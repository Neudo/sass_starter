import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface FunnelConversion {
  funnel_id: string;
  session_id: string;
  site_id: string;
  step_number: number;
  step_name: string;
  url_visited: string;
}

export async function POST(request: NextRequest) {
  console.log("🎯 Funnel tracking request received");
  try {
    const body = await request.json();
    const {
      siteId,
      sessionId,
      currentUrl,
      eventType = "page_view",
      customEvent,
    } = body;

    console.log("📊 Funnel tracking data:", {
      siteId,
      sessionId,
      currentUrl,
      eventType,
      customEvent,
    });

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
      const { data: siteData, error: siteError } = await supabase
        .from("sites")
        .select("id")
        .eq("domain", siteId)
        .single();

      if (siteError || !siteData) {
        return NextResponse.json({ tracked: false });
      }

      resolvedSiteId = siteData.id;
    }

    // Get all active funnels for this site
    const { data: funnels, error: funnelsError } = await supabase
      .from("funnels")
      .select(
        `
        id,
        name,
        funnel_steps (
          id,
          step_number,
          name,
          step_type,
          url_pattern,
          match_type,
          event_type,
          event_config
        )
      `
      )
      .eq("site_id", resolvedSiteId)
      .eq("is_active", true);

    if (funnelsError || !funnels) {
      console.log(
        "❌ Error fetching funnels or no funnels found:",
        funnelsError
      );
      return NextResponse.json({ tracked: false });
    }

    console.log(`🎯 Found ${funnels?.length || 0} active funnels for site`);

    const conversionsToInsert: FunnelConversion[] = [];

    // Handle different event types
    if (eventType === "custom_event" && customEvent) {
      // Handle custom event tracking
      await handleCustomEvent(
        supabase,
        funnels,
        sessionId,
        resolvedSiteId,
        customEvent,
        conversionsToInsert,
        currentUrl
      );
    } else {
      // Handle page view tracking
      await handlePageViewTracking(
        supabase,
        funnels,
        sessionId,
        resolvedSiteId,
        currentUrl,
        conversionsToInsert
      );
    }

    // Insert all new conversions
    if (conversionsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from("funnel_conversions")
        .insert(conversionsToInsert);

      if (insertError) {
        return NextResponse.json({ tracked: false });
      }
    }

    return NextResponse.json({
      tracked: true,
      conversions: conversionsToInsert.length,
    });
  } catch (error) {
    console.error("Error tracking funnel:", error);
    return NextResponse.json({ tracked: false }, { status: 500 });
  }
}

// Handler for page view tracking
async function handlePageViewTracking(
  supabase: ReturnType<typeof createAdminClient>,
  funnels: Array<{
    id: string;
    name: string;
    funnel_steps: Array<{
      id: string;
      step_number: number;
      name: string;
      step_type: string;
      url_pattern: string;
      match_type: string;
      event_type?: string;
      event_config?: Record<string, unknown>;
    }>;
  }>,
  sessionId: string,
  siteId: string,
  currentUrl: string,
  conversionsToInsert: FunnelConversion[]
) {
  // Check each funnel to see if current URL matches any step
  for (const funnel of funnels) {
    // Get all existing conversions for this session and funnel
    const { data: existingConversions } = await supabase
      .from("funnel_conversions")
      .select("step_number")
      .eq("funnel_id", funnel.id)
      .eq("session_id", sessionId)
      .order("step_number");

    const completedSteps = new Set(
      existingConversions?.map((c: { step_number: number }) => c.step_number) || []
    );

    for (const step of funnel.funnel_steps) {
      // Only process page_view steps for page view events
      if (step.step_type !== "page_view") continue;

      const isMatch = checkUrlMatch(
        currentUrl,
        step.url_pattern,
        step.match_type
      );

      console.log(`📊 Checking step ${step.step_number} (${step.name}):`, {
        step_type: step.step_type,
        url_pattern: step.url_pattern,
        match_type: step.match_type,
        currentUrl,
        isMatch,
        alreadyCompleted: completedSteps.has(step.step_number),
      });

      if (isMatch && !completedSteps.has(step.step_number)) {
        // SEQUENTIAL VALIDATION: Check if previous steps are completed
        let canCompleteThisStep = true;

        if (step.step_number > 1) {
          // For steps 2+, check that the previous step is completed
          const previousStepNumber = step.step_number - 1;
          if (!completedSteps.has(previousStepNumber)) {
            canCompleteThisStep = false;
            console.log(
              `🚫 Step ${step.step_number} (${step.name}) skipped - previous step ${previousStepNumber} not completed`
            );
          }
        }

        if (canCompleteThisStep) {
          conversionsToInsert.push({
            funnel_id: funnel.id,
            session_id: sessionId,
            site_id: siteId,
            step_number: step.step_number,
            step_name: step.name,
            url_visited: currentUrl,
          });

          // Add to completed steps for this session (in case there are multiple matching steps)
          completedSteps.add(step.step_number);

          console.log(
            `✅ Step ${step.step_number} (${step.name}) completed in sequence`
          );
        }
      }
    }
  }
}

// Handler for custom event tracking
async function handleCustomEvent(
  supabase: ReturnType<typeof createAdminClient>,
  funnels: Array<{
    id: string;
    name: string;
    funnel_steps: Array<{
      id: string;
      step_number: number;
      name: string;
      step_type: string;
      url_pattern?: string;
      match_type?: string;
      event_type?: string;
      event_config?: Record<string, unknown>;
    }>;
  }>,
  sessionId: string,
  siteId: string,
  customEvent: {
    step_id: string;
    funnel_id: string;
    step_number: number;
    event_type: string;
    event_data?: Record<string, unknown>;
  },
  conversionsToInsert: FunnelConversion[],
  currentUrl: string
) {
  const { step_id, funnel_id, step_number, event_type, event_data } =
    customEvent;

  console.log(`🎯 Processing custom event:`, {
    step_id,
    funnel_id,
    step_number,
    event_type,
    event_data,
  });

  // Get all existing conversions for this session and funnel
  const { data: existingConversions } = await supabase
    .from("funnel_conversions")
    .select("step_number")
    .eq("funnel_id", funnel_id)
    .eq("session_id", sessionId)
    .order("step_number");

  const completedSteps = new Set(
    existingConversions?.map((c: { step_number: number }) => c.step_number) || []
  );

  // Check if this step is already completed
  if (completedSteps.has(step_number)) {
    console.log(`🚫 Custom event step ${step_number} already completed`);
    return;
  }

  // SEQUENTIAL VALIDATION: Check if previous steps are completed
  let canCompleteThisStep = true;

  if (step_number > 1) {
    const previousStepNumber = step_number - 1;
    if (!completedSteps.has(previousStepNumber)) {
      canCompleteThisStep = false;
      console.log(
        `🚫 Custom event step ${step_number} skipped - previous step ${previousStepNumber} not completed`
      );
    }
  }

  if (canCompleteThisStep) {
    conversionsToInsert.push({
      funnel_id: funnel_id,
      session_id: sessionId,
      site_id: siteId,
      step_number: step_number,
      step_name: `Custom Event: ${event_type}`,
      url_visited: currentUrl,
    });

    console.log(
      `✅ Custom event step ${step_number} (${event_type}) completed in sequence`
    );
  }
}

// Helper function to check if URL matches pattern based on match type
function checkUrlMatch(
  url: string,
  pattern: string,
  matchType: string
): boolean {
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
