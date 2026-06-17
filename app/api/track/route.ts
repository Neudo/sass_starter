import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractClientIP, getLocationFromIP } from "@/lib/analytics/location";
import { parseUserAgent } from "@/lib/analytics/device";
import { parseTrafficSource } from "@/lib/analytics/sources";
import { shouldBlockRequest } from "@/lib/analytics/bot-detector";
import { emptyCorsResponse, jsonCorsResponse, readJsonBody } from "@/lib/api/http";
import { getSiteByDomain, normalizeDomain, sameRegistrableHost } from "@/lib/api/sites";
import { getChannel } from "@/lib/referrer-helper";

interface TrackPayload {
  sessionId?: string;
  page?: string;
  domain?: string;
  referrer?: string | null;
  urlParams?: string | Record<string, string> | null;
  language?: string;
}

function isProductionRequest() {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production"
  );
}

function validateOrigin(origin: string, domain: string): string | null {
  if (!origin || !isProductionRequest()) {
    return null;
  }

  let originDomain = "";
  try {
    originDomain = new URL(origin).hostname;
  } catch {
    return "Invalid origin";
  }

  const normalizedOrigin = normalizeDomain(originDomain);
  const normalizedDomain = normalizeDomain(domain);
  const isLocalhost =
    normalizedOrigin === "localhost" ||
    normalizedOrigin === "127.0.0.1" ||
    normalizedOrigin.endsWith(".local") ||
    normalizedDomain === "localhost" ||
    normalizedDomain === "127.0.0.1" ||
    normalizedDomain.endsWith(".local");

  if (isLocalhost) {
    return "Localhost domains not allowed in production";
  }

  if (normalizedOrigin !== normalizedDomain) {
    return "Origin does not match declared domain";
  }

  return null;
}

function externalReferrer(referrer: string | null | undefined, domain: string) {
  if (!referrer) {
    return null;
  }

  try {
    const referrerHost = new URL(referrer).hostname;
    return sameRegistrableHost(referrerHost, domain) ? null : referrer;
  } catch {
    return referrer;
  }
}

function serializeUrlParams(urlParams: TrackPayload["urlParams"]) {
  if (!urlParams) {
    return null;
  }

  if (typeof urlParams === "string") {
    return urlParams;
  }

  return new URLSearchParams(urlParams).toString();
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin") || "";
  const { data: payload, error: payloadError } =
    await readJsonBody<TrackPayload>(req);

  if (payloadError || !payload) {
    return jsonCorsResponse({ error: "Invalid payload" }, { status: 400 }, origin);
  }

  const { sessionId, page, domain, referrer, urlParams, language } = payload;

  if (!sessionId || !domain) {
    return jsonCorsResponse(
      { error: "Missing sessionId or domain" },
      { status: 400 },
      origin
    );
  }

  const originError = validateOrigin(origin, domain);
  if (originError) {
    return jsonCorsResponse({ error: originError }, { status: 403 }, origin);
  }

  if (page?.includes("/dashboard")) {
    return emptyCorsResponse(204, origin);
  }

  const userAgent = req.headers.get("user-agent");
  const deviceData = parseUserAgent(userAgent);
  const blockCheck = await shouldBlockRequest(userAgent, deviceData.browser || null);

  if (blockCheck.blocked) {
    return emptyCorsResponse(204, origin);
  }

  const site = await getSiteByDomain(domain);
  if (!site) {
    return jsonCorsResponse({ error: "Site not found" }, { status: 404 }, origin);
  }

  const ip = extractClientIP(req.headers);
  const [locationData] = await Promise.all([getLocationFromIP(ip)]);
  const trafficSource = parseTrafficSource(
    serializeUrlParams(urlParams),
    externalReferrer(referrer, domain)
  );
  const channel = getChannel(
    trafficSource.utmParams.utm_medium,
    trafficSource.utmParams.utm_source,
    trafficSource.referrerDomain
  );
  const supabase = createAdminClient();
  const currentTime = new Date().toISOString();

  const { data: existingSession } = await supabase
    .from("sessions")
    .select("id")
    .eq("id", sessionId)
    .maybeSingle();

  const sessionPayload = {
    id: sessionId,
    site_id: site.id,
    last_seen: currentTime,
    country: locationData.country,
    region: locationData.region,
    city: locationData.city,
    browser: deviceData.browser,
    browser_version: deviceData.browserVersion,
    os: deviceData.os,
    os_version: deviceData.osVersion,
    screen_size: deviceData.deviceCategory,
    language: language || "en",
    ...(!existingSession
      ? {
          referrer: trafficSource.referrer,
          referrer_domain: trafficSource.referrerDomain,
          utm_source: trafficSource.utmParams.utm_source,
          utm_medium: trafficSource.utmParams.utm_medium,
          utm_campaign: trafficSource.utmParams.utm_campaign,
          utm_term: trafficSource.utmParams.utm_term,
          utm_content: trafficSource.utmParams.utm_content,
          channel,
          created_at: currentTime,
        }
      : {}),
  };

  const { error: sessionError } = await supabase
    .from("sessions")
    .upsert(sessionPayload, {
      onConflict: "id",
      ignoreDuplicates: false,
    });

  if (sessionError) {
    return jsonCorsResponse({ error: sessionError.message }, { status: 500 }, origin);
  }

  if (page) {
    await trackPageView({
      sessionId,
      siteId: site.id,
      page,
      currentTime,
    });
  }

  return emptyCorsResponse(204, origin);
}

async function trackPageView({
  sessionId,
  siteId,
  page,
  currentTime,
}: {
  sessionId: string;
  siteId: string;
  page: string;
  currentTime: string;
}) {
  const supabase = createAdminClient();
  const { data: lastPageView } = await supabase
    .from("page_views")
    .select("id, page_path, created_at, duration_seconds")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastPageView?.page_path === page) {
    return;
  }

  if (lastPageView) {
    const lastPageTime = new Date(lastPageView.created_at).getTime();
    const currentTimeMs = new Date(currentTime).getTime();
    const pageDuration = Math.min(
      Math.max(Math.round((currentTimeMs - lastPageTime) / 1000), 1),
      1800
    );

    await supabase
      .from("page_views")
      .update({
        duration_seconds: (lastPageView.duration_seconds || 0) + pageDuration,
        exit_page: false,
      })
      .eq("id", lastPageView.id);
  }

  const { data: existingPageInSession } = await supabase
    .from("page_views")
    .select("id")
    .eq("session_id", sessionId)
    .eq("page_path", page)
    .maybeSingle();

  if (existingPageInSession) {
    await supabase
      .from("page_views")
      .update({
        created_at: currentTime,
        exit_page: false,
      })
      .eq("id", existingPageInSession.id);
    return;
  }

  const { count } = await supabase
    .from("page_views")
    .select("id", { count: "exact", head: true })
    .eq("session_id", sessionId);

  await supabase.from("page_views").insert({
    session_id: sessionId,
    site_id: siteId,
    page_path: page,
    created_at: currentTime,
    entry_page: (count || 0) === 0,
    exit_page: false,
    duration_seconds: 0,
  });
}

export async function OPTIONS(req: NextRequest) {
  return emptyCorsResponse(200, req.headers.get("origin"));
}
