import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest } from "next/server";
import { emptyCorsResponse, jsonCorsResponse, readJsonBody } from "@/lib/api/http";
import { sameRegistrableHost } from "@/lib/api/sites";

interface TrackFunnelStepPayload {
  step_id?: string;
  session_id?: string;
  site_domain?: string;
}

interface FunnelStepRecord {
  id: string;
  funnel_id: string;
  step_number: number;
  name: string;
  funnels: {
    site_id: string;
    sites: {
      domain: string;
    };
  };
}

interface PreviousFunnelStep {
  id: string;
  step_number: number;
}

interface PreviousStepCompletion {
  step_id: string;
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const { data: body, error } =
    await readJsonBody<TrackFunnelStepPayload>(request);

  if (error || !body) {
    return jsonCorsResponse({ error: "Invalid payload" }, { status: 400 }, origin);
  }

  const { step_id, session_id, site_domain } = body;

  if (!step_id || !session_id || !site_domain) {
    return jsonCorsResponse({ error: "Missing required fields" }, { status: 400 }, origin);
  }

  const adminClient = createAdminClient();
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
    .maybeSingle();

  const step = stepData as unknown as FunnelStepRecord | null;

  if (stepError || !step) {
    return jsonCorsResponse({ error: "Funnel step not found" }, { status: 404 }, origin);
  }

  if (!sameRegistrableHost(step.funnels.sites.domain, site_domain)) {
    return jsonCorsResponse(
      { error: "Funnel step does not belong to this domain" },
      { status: 403 },
      origin
    );
  }

  const { data: existingCompletion, error: checkError } = await adminClient
    .from("funnel_step_completions")
    .select("id")
    .eq("step_id", step_id)
    .eq("session_id", session_id)
    .maybeSingle();

  if (checkError) {
    return jsonCorsResponse(
      { error: "Failed to check existing completion" },
      { status: 500 },
      origin
    );
  }

  if (existingCompletion) {
    return jsonCorsResponse(
      {
        success: true,
        step_name: step.name,
        step_number: step.step_number,
        already_completed: true,
      },
      {},
      origin
    );
  }

  if (step.step_number > 1) {
    const { data: previousSteps, error: previousStepsError } = await adminClient
      .from("funnel_steps")
      .select("id, step_number")
      .eq("funnel_id", step.funnel_id)
      .lt("step_number", step.step_number);

    if (previousStepsError) {
      return jsonCorsResponse(
        { error: "Failed to validate step sequence" },
        { status: 500 },
        origin
      );
    }

    const typedPreviousSteps =
      (previousSteps as PreviousFunnelStep[] | null) || [];
    const previousStepIds = typedPreviousSteps.map(
      (previousStep) => previousStep.id
    );

    if (previousStepIds.length > 0) {
      const { data: previousCompletions, error: previousCompletionsError } =
        await adminClient
          .from("funnel_step_completions")
          .select("step_id")
          .eq("session_id", session_id)
          .in("step_id", previousStepIds);

      if (previousCompletionsError) {
        return jsonCorsResponse(
          { error: "Failed to validate previous steps" },
          { status: 500 },
          origin
        );
      }

      const completedStepIds = new Set(
        ((previousCompletions as PreviousStepCompletion[] | null) || []).map(
          (completion) => completion.step_id
        )
      );
      const missingStep = typedPreviousSteps.find(
        (previousStep) => !completedStepIds.has(previousStep.id)
      );

      if (missingStep) {
        return jsonCorsResponse(
          {
            success: false,
            error: "Previous step not completed",
            step_name: step.name,
            step_number: step.step_number,
            required_previous_step: missingStep.step_number,
          },
          {},
          origin
        );
      }
    }
  }

  const { error: insertCompletionError } = await adminClient
    .from("funnel_step_completions")
    .insert({
      step_id,
      session_id,
      site_domain: step.funnels.sites.domain,
      metadata: {},
    });

  if (insertCompletionError?.code === "23505") {
    return jsonCorsResponse(
      {
        success: true,
        step_name: step.name,
        step_number: step.step_number,
        already_completed: true,
      },
      {},
      origin
    );
  }

  if (insertCompletionError) {
    return jsonCorsResponse(
      { error: "Failed to record completion" },
      { status: 500 },
      origin
    );
  }

  return jsonCorsResponse(
    {
      success: true,
      step_name: step.name,
      step_number: step.step_number,
    },
    {},
    origin
  );
}

export async function OPTIONS(request: NextRequest) {
  return emptyCorsResponse(200, request.headers.get("origin"));
}
