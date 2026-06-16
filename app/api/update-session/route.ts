import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { emptyCorsResponse, jsonCorsResponse, readJsonBody } from "@/lib/api/http";

interface UpdateSessionPayload {
  sessionId?: string;
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  const { data: body, error } = await readJsonBody<UpdateSessionPayload>(req);

  if (error || !body) {
    return jsonCorsResponse({ error: "Invalid payload" }, { status: 400 }, origin);
  }

  const { sessionId } = body;

  if (!sessionId) {
    return jsonCorsResponse({ error: "Missing sessionId" }, { status: 400 }, origin);
  }

  const supabase = createAdminClient();
  const currentTime = new Date();
  const currentTimeIso = currentTime.toISOString();

  const [{ error: sessionError }, { data: lastPageView, error: pageViewError }] =
    await Promise.all([
      supabase
        .from("sessions")
        .update({ last_seen: currentTimeIso })
        .eq("id", sessionId),
      supabase
        .from("page_views")
        .select("id, created_at")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  if (sessionError) {
    return jsonCorsResponse({ error: "Session not found" }, { status: 404 }, origin);
  }

  if (pageViewError) {
    console.error("Session heartbeat page view lookup failed:", pageViewError);
    return jsonCorsResponse({ error: "Server error" }, { status: 500 }, origin);
  }

  if (lastPageView) {
    const lastPageTime = new Date(lastPageView.created_at).getTime();
    const totalTimeOnPage = Math.round(
      (currentTime.getTime() - lastPageTime) / 1000
    );
    const cappedTotalTime = Math.min(Math.max(totalTimeOnPage, 1), 1800);

    await supabase
      .from("page_views")
      .update({
        duration_seconds: cappedTotalTime,
        exit_page: true,
      })
      .eq("id", lastPageView.id);
  }

  return emptyCorsResponse(204, origin);
}

export async function OPTIONS(req: NextRequest) {
  return emptyCorsResponse(200, req.headers.get("origin"));
}
