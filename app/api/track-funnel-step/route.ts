import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const adminClient = createAdminClient();
    const body = await request.json();
    const { step_id, session_id, site_domain } = body;

    if (!step_id || !session_id || !site_domain) {
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

    if (stepError || !stepData) {
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

    // Check if this session has already completed this step

    const { data: existingCompletion, error: checkError } = await adminClient
      .from("funnel_step_completions")
      .select("id")
      .eq("step_id", step_id)
      .eq("session_id", session_id)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
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
      // Get all steps for this funnel ordered by step_number
      const { data: allSteps, error: allStepsError } = await adminClient
        .from("funnel_steps")
        .select("id, step_number")
        .eq("funnel_id", typedStepData.funnel_id)
        .order("step_number", { ascending: true });

      if (allStepsError) {
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
    const { error: insertCompletionError } = await adminClient
      .from("funnel_step_completions")
      .insert({
        step_id,
        session_id,
        site_domain: typedStepData.funnels.sites.domain, // Use the domain from the step's site
        metadata: {},
      });

    if (insertCompletionError) {
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
