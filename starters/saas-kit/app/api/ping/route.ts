/**
 * Lightweight Ping Endpoint
 *
 * GET /api/ping
 * - Server liveness check (no DB connection)
 * - Separate monitoring from /api/health:
 *   ping failure = server down, health failure = DB down
 */

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { status: "pong", timestamp: new Date().toISOString() },
    {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    },
  );
}
