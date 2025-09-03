import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const adminClient = createAdminClient();
    const body = await request.json();
    const { step_id, session_id, site_domain } = body;
    
    console.log('[Track Funnel Step] Request received:', { step_id, session_id, site_domain });

    if (!step_id || !session_id || !site_domain) {
      console.log('[Track Funnel Step] Missing fields:', { 
        has_step_id: !!step_id, 
        has_session_id: !!session_id, 
        has_site_domain: !!site_domain 
      });
      return NextResponse.json(
        { error: "Missing required fields" },
        { 
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      );
    }

    // Verify the step exists and get site info
    console.log('[Track Funnel Step] Looking up step:', step_id);
    const { data: stepData, error: stepError } = await adminClient
      .from("funnel_steps")
      .select(
        `
        id,
        funnel_id,
        step_number,
        name,
        funnels!inner (
          site_id,
          sites!inner (
            domain
          )
        )
      `
      )
      .eq("id", step_id)
      .single();

    console.log('[Track Funnel Step] Step lookup result:', { 
      found: !!stepData, 
      error: stepError,
      stepName: stepData?.name,
      stepNumber: stepData?.step_number
    });

    if (stepError || !stepData) {
      console.log('[Track Funnel Step] Step not found for ID:', step_id);
      return NextResponse.json(
        { error: "Funnel step not found" },
        { 
          status: 404,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      );
    }

    // Type assertion to fix TypeScript inference
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const typedStepData = stepData as any;

    // Domain verification removed - we trust the step_id is valid
    // The step is already linked to the correct site via funnel->site relationship
    console.log('[Track Funnel Step] Step verified, site domain from DB:', typedStepData.funnels.sites.domain);
    console.log('[Track Funnel Step] Request domain:', site_domain, '(domain check skipped - using step_id validation)');

    // Check if this session has already completed this step
    console.log('[Track Funnel Step] Checking for existing completion...');
    const { data: existingCompletion, error: checkError } = await adminClient
      .from("funnel_step_completions")
      .select("id")
      .eq("step_id", step_id)
      .eq("session_id", session_id)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("[Track Funnel Step] Error checking existing completion:", checkError);
      return NextResponse.json(
        { error: "Failed to check existing completion" },
        { 
          status: 500,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      );
    }

    // If already completed, return success without duplicating
    if (existingCompletion) {
      console.log('[Track Funnel Step] Step already completed by this session');
      return NextResponse.json(
        {
          success: true,
          step_name: typedStepData.name,
          step_number: typedStepData.step_number,
          already_completed: true,
        },
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      );
    }

    // Check if all previous steps have been completed by this session (sequential validation)
    if (typedStepData.step_number > 1) {
      console.log('[Track Funnel Step] Checking previous steps (current step number:', typedStepData.step_number, ')');
      // Get all steps for this funnel ordered by step_number
      const { data: allSteps, error: allStepsError } = await adminClient
        .from("funnel_steps")
        .select("id, step_number")
        .eq("funnel_id", typedStepData.funnel_id)
        .order("step_number", { ascending: true });

      if (allStepsError) {
        console.error("Error fetching funnel steps:", allStepsError);
        return NextResponse.json(
          { error: "Failed to validate step sequence" },
          { 
            status: 500,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "POST, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type",
            },
          }
        );
      }

      // Check that all previous steps have been completed by this session
      const previousSteps =
        allSteps?.filter((s) => s.step_number < typedStepData.step_number) ||
        [];

      for (const prevStep of previousSteps) {
        const { data: prevCompletion, error: prevError } = await adminClient
          .from("funnel_step_completions")
          .select("id")
          .eq("step_id", prevStep.id)
          .eq("session_id", session_id)
          .single();

        if (prevError && prevError.code !== "PGRST116") {
          console.error("Error checking previous step completion:", prevError);
          return NextResponse.json(
            { error: "Failed to validate previous steps" },
            { 
              status: 500,
              headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
              },
            }
          );
        }

        // If any previous step is not completed, reject this step completion
        if (!prevCompletion) {
          console.log('[Track Funnel Step] Previous step', prevStep.step_number, 'not completed. Rejecting.');
          return NextResponse.json(
            {
              success: false,
              error: "Previous step not completed",
              step_name: typedStepData.name,
              step_number: typedStepData.step_number,
              required_previous_step: prevStep.step_number,
            },
            {
              headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
              },
            }
          );
        }
      }
    }

    // Record the completion (this will prevent future duplicates)
    console.log('[Track Funnel Step] Recording completion for step:', typedStepData.name);
    const { error: insertCompletionError } = await adminClient
      .from("funnel_step_completions")
      .insert({
        step_id,
        session_id,
        site_domain: typedStepData.funnels.sites.domain, // Use the domain from the step's site
        metadata: {},
      });

    if (insertCompletionError) {
      console.error("[Track Funnel Step] Error inserting completion:", insertCompletionError);
      return NextResponse.json(
        { error: "Failed to record completion" },
        { 
          status: 500,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      );
    }

    // Note: Step count is calculated dynamically from funnel_step_completions table
    console.log('[Track Funnel Step] SUCCESS! Step completed:', typedStepData.name, 'step number:', typedStepData.step_number);
    
    return NextResponse.json(
      {
        success: true,
        step_name: typedStepData.name,
        step_number: typedStepData.step_number,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  } catch (error) {
    console.error("[Track Funnel Step] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { 
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}