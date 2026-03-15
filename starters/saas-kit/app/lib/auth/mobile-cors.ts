/**
 * Mobile CORS Utilities
 *
 * Adds CORS headers only when Bearer token is present.
 * Origin restricted to known production and dev origins.
 */

import { NextRequest, NextResponse } from "next/server";
import { extractBearerToken } from "./mobile-auth";

const ALLOWED_ORIGINS = [
  // Add your production domains here
  // "https://your-app.com",
  "http://localhost:3000",
  "http://localhost:3001",
];

function resolveAllowedOrigin(origin: string | null): string | null {
  if (!origin) return null;

  // Extra origins from env (space-separated list)
  const extra = process.env.MOBILE_CORS_ALLOWED_ORIGINS;
  if (extra) {
    const extras = extra
      .split(" ")
      .map((s) => s.trim())
      .filter(Boolean);
    if (extras.includes(origin)) return origin;
  }

  if (ALLOWED_ORIGINS.includes(origin)) return origin;

  return null;
}

/**
 * Add CORS headers to response if request has Bearer token and known origin.
 * Returns a new NextResponse with CORS headers applied.
 */
export function addCorsHeaders(
  request: NextRequest,
  response: NextResponse,
): NextResponse {
  // Only add CORS for Bearer-authenticated requests
  if (!extractBearerToken(request)) {
    return response;
  }

  const origin = request.headers.get("origin");
  const allowed = resolveAllowedOrigin(origin);
  if (!allowed) return response;

  response.headers.set("Access-Control-Allow-Origin", allowed);
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );
  response.headers.set("Access-Control-Max-Age", "86400");

  return response;
}

/**
 * Handle OPTIONS preflight for mobile CORS.
 */
export function handleMobileCorsPrelight(request: NextRequest): NextResponse {
  const origin = request.headers.get("origin");
  const allowed = resolveAllowedOrigin(origin);

  if (!allowed) {
    return new NextResponse(null, { status: 403 });
  }

  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": allowed,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}
