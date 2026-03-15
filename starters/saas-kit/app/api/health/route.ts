/**
 * Health Check Endpoint
 *
 * GET /api/health
 * - DB connection status check
 * - Basic server response check
 * - For deployment verification and monitoring
 */

import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/infra/prisma";

interface HealthStatus {
  status: "healthy" | "unhealthy" | "degraded";
  timestamp: string;
  checks: {
    database: {
      status: "up" | "down";
      latency?: number;
      error?: string;
    };
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
  };
}

export async function GET() {
  const startTime = Date.now();

  const healthStatus: HealthStatus = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    checks: {
      database: {
        status: "up",
      },
      memory: {
        used: 0,
        total: 0,
        percentage: 0,
      },
    },
  };

  // 1. Database Connection Check
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    healthStatus.checks.database.latency = Date.now() - dbStart;
  } catch (error) {
    console.error("Database health check failed:", error);
    healthStatus.status = "unhealthy";
    healthStatus.checks.database.status = "down";
    healthStatus.checks.database.error = "database unavailable";
  }

  // 2. Memory Usage Check (RSS — reflects actual process memory in serverless environments)
  try {
    const memUsage = process.memoryUsage();
    const rss = memUsage.rss;
    const functionLimit = 1024 * 1024 * 1024; // Default 1024MB
    const memPercentage = Math.round((rss / functionLimit) * 100);

    healthStatus.checks.memory = {
      used: Math.round(rss / 1024 / 1024), // MB
      total: Math.round(functionLimit / 1024 / 1024), // MB
      percentage: memPercentage,
    };

    // Degraded if RSS exceeds 85% of function limit
    if (memPercentage > 85 && healthStatus.status === "healthy") {
      healthStatus.status = "degraded";
    }
  } catch {
    if (healthStatus.status === "healthy") {
      healthStatus.status = "degraded";
    }
  }

  // 3. Return response
  const httpStatus = healthStatus.status === "unhealthy" ? 503 : 200;

  return NextResponse.json(healthStatus, {
    status: httpStatus,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "X-Response-Time": `${Date.now() - startTime}ms`,
    },
  });
}
