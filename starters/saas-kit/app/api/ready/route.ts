import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/infra/prisma";
import { getRedisClient } from "@/app/lib/infra/redis";
import { apiError } from "@/app/lib/errors";

/**
 * GET /api/ready — Service readiness check
 *
 * Checks DB + Redis connection status.
 * Also usable for DB warm-keep via cron.
 */
export async function GET() {
  const checks: Record<string, boolean> = {
    db: false,
    redis: false,
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.db = true;
  } catch {
    // DB connection failed
  }

  try {
    const redis = getRedisClient();
    if (redis) {
      await redis.ping();
      checks.redis = true;
    } else {
      // Redis not configured — skip (not required)
      checks.redis = true;
    }
  } catch {
    // Redis connection failed
  }

  // DB is required — 503 if DB is down
  if (!checks.db) {
    return apiError("SERVICE_WAKING");
  }

  return NextResponse.json({
    status: "ok",
    checks,
    timestamp: new Date().toISOString(),
  });
}
