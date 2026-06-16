import { NextResponse } from "next/server";

export function corsHeaders(origin?: string | null) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export function emptyCorsResponse(
  status = 204,
  origin?: string | null
): NextResponse {
  return new NextResponse(null, {
    status,
    headers: corsHeaders(origin),
  });
}

export function jsonCorsResponse(
  body: unknown,
  init: ResponseInit = {},
  origin?: string | null
): NextResponse {
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...corsHeaders(origin),
      ...(init.headers || {}),
    },
  });
}

export async function readJsonBody<T>(
  request: Request
): Promise<{ data: T | null; error: string | null }> {
  try {
    return { data: (await request.json()) as T, error: null };
  } catch {
    return { data: null, error: "Invalid JSON payload" };
  }
}
