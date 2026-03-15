/**
 * Rate limiting middleware
 *
 * Rate limiting middleware applicable to API routes
 * Supports per-user and per-IP rate limits
 *
 * @remarks
 * - Edge Runtime compatible: pure JavaScript only, no Node.js API dependencies
 * - Memory-based in serverless — global limiting is not perfect
 * - Redis or external storage recommended for production
 * - Call directly inside API route handlers (bypasses Next.js middleware)
 */

import { NextRequest, NextResponse } from "next/server";
import { checkUserRateLimit, checkIpRateLimit } from "./rate-limit";

/**
 * Rate limit middleware options
 */
export interface RateLimitOptions {
  /** Per-user limit per minute (default: 10) */
  userLimitPerMinute?: number;
  /** Per-IP limit per minute (default: 100) */
  ipLimitPerMinute?: number;
  /** User ID (null means IP check only) */
  userId?: string | null;
  /** IP address */
  ip: string;
}

/**
 * Rate limit check result
 */
export interface RateLimitCheckResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Rate limit middleware
 *
 * @param request NextRequest object
 * @param options Rate limit options
 * @returns Rate limit check result or null (passed)
 */
export async function checkRateLimitMiddleware(
  request: NextRequest,
  options: RateLimitOptions,
): Promise<NextResponse | null> {
  const {
    userLimitPerMinute = 10,
    ipLimitPerMinute = 100,
    userId = null,
    ip,
  } = options;

  try {
    // Global IP-based check
    const ipResult = await checkIpRateLimit(ip, ipLimitPerMinute);
    if (!ipResult.allowed) {
      return NextResponse.json(
        {
          error: "RATE_LIMIT_EXCEEDED",
          message: "Rate limit exceeded. Please try again later.",
          resetAt: ipResult.resetAt.toISOString(),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": ipLimitPerMinute.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": Math.ceil(
              ipResult.resetAt.getTime() / 1000,
            ).toString(),
            "Retry-After": Math.ceil(
              (ipResult.resetAt.getTime() - Date.now()) / 1000,
            ).toString(),
          },
        },
      );
    }

    // Per-user check (logged-in users only)
    if (userId) {
      const userResult = await checkUserRateLimit(userId, userLimitPerMinute);
      if (!userResult.allowed) {
        return NextResponse.json(
          {
            error: "RATE_LIMIT_EXCEEDED",
            message: "Rate limit exceeded. Please try again later.",
            resetAt: userResult.resetAt.toISOString(),
          },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": userLimitPerMinute.toString(),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": Math.ceil(
                userResult.resetAt.getTime() / 1000,
              ).toString(),
              "Retry-After": Math.ceil(
                (userResult.resetAt.getTime() - Date.now()) / 1000,
              ).toString(),
            },
          },
        );
      }
    }

    // Rate limit check passed
    return null;
  } catch (error) {
    console.error("Error during rate limit check:", error);
    // Bypass rate limit on error (service availability takes priority)
    return null;
  }
}

/**
 * IP address extraction helper
 *
 * @param request NextRequest object
 * @returns IP address or 'unknown'
 */
export function getClientIp(request: NextRequest): string {
  // Use x-forwarded-for header in Vercel environment
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // Use first IP if multiple are present
    return forwardedFor.split(",")[0].trim();
  }

  // Check x-real-ip header
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Default
  return "unknown";
}
