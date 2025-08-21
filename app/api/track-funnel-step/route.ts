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
        { status: 400 }
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
        { status: 404 }
      );
    }

    // Type assertion to fix TypeScript inference
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const typedStepData = stepData as any;

    // Verify domain matches
    const actualDomain = typedStepData.funnels.sites.domain;
    if (actualDomain !== site_domain) {
      return NextResponse.json({ error: "Domain mismatch" }, { status: 403 });
    }

    // Check if this session has already completed this step
    const { data: existingCompletion, error: checkError } = await adminClient
      .from("funnel_step_completions")
      .select("id")
      .eq("step_id", step_id)
      .eq("session_id", session_id)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 = not found, which is expected
      console.error("Error checking existing completion:", checkError);
      return NextResponse.json(
        { error: "Failed to check completion status" },
        { status: 500 }
      );
    }

    // If already completed, don't count again
    if (existingCompletion) {
      return NextResponse.json({
        success: true,
        already_completed: true,
        step_name: typedStepData.name,
        step_number: typedStepData.step_number,
      });
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
        console.error("Error fetching funnel steps:", allStepsError);
        return NextResponse.json(
          { error: "Failed to validate step sequence" },
          { status: 500 }
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
            { status: 500 }
          );
        }

        // If any previous step is not completed, reject this step completion
        if (!prevCompletion) {
          return NextResponse.json({
            success: false,
            error: "Previous step not completed",
            step_name: typedStepData.name,
            step_number: typedStepData.step_number,
            required_previous_step: prevStep.step_number,
          });
        }
      }
    }

    // Record the completion (this will prevent future duplicates)
    const { error: insertCompletionError } = await adminClient
      .from("funnel_step_completions")
      .insert({
        step_id,
        session_id,
        site_domain,
        metadata: {},
      });

    if (insertCompletionError) {
      console.error("Error inserting completion:", insertCompletionError);
      return NextResponse.json(
        { error: "Failed to record completion" },
        { status: 500 }
      );
    }

    // Get current step count and increment it
    const { data: currentStep, error: getCurrentError } = await adminClient
      .from("funnel_steps")
      .select("step_count")
      .eq("id", step_id)
      .single();

    if (getCurrentError) {
      console.error("Error getting current step count:", getCurrentError);
      return NextResponse.json(
        { error: "Failed to get current step count" },
        { status: 500 }
      );
    }

    const newCount = (currentStep?.step_count || 0) + 1;

    // Update the step count
    const { error: updateError } = await adminClient
      .from("funnel_steps")
      .update({ step_count: newCount })
      .eq("id", step_id);

    if (updateError) {
      console.error("Error updating step count:", updateError);
      return NextResponse.json(
        { error: "Failed to update step count" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      step_name: typedStepData.name,
      step_number: typedStepData.step_number,
    });
  } catch (error) {
    console.error("Error tracking funnel step:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
