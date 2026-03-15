/**
 * Rate Limiting Wrapper
 *
 * Higher-Order Function that applies rate limiting to API routes
 * Extends the withAdmin pattern for general API use
 *
 * @example
 * ```typescript
 * // Basic usage (IP-based, 60 req/min)
 * export const GET = withRateLimit(async (request) => {
 *   return NextResponse.json({ data: ... });
 * });
 *
 * // Custom limit
 * export const POST = withRateLimit(
 *   async (request) => { ... },
 *   { ipLimitPerMinute: 10 }
 * );
 * ```
 */

import { NextRequest, NextResponse } from "next/server";
import {
  checkIpRateLimit,
  checkUserRateLimit,
} from "@/app/lib/rate-limit/rate-limit";

export interface RateLimitOptions {
  /** Per-IP limit per minute (default: 60) */
  ipLimitPerMinute?: number;
  /** Per-user limit per minute (default: disabled) */
  userLimitPerMinute?: number;
  /** Function to extract user ID (required for session-based limiting) */
  getUserId?: (request: NextRequest) => Promise<string | null>;
}

/**
 * IP address extraction helper
 */
function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  return "unknown";
}

/**
 * Rate Limiting Wrapper
 *
 * @param handler - API handler function
 * @param options - Rate limiting options
 * @returns Handler with rate limiting applied
 */
export function withRateLimit(
  handler: (
    request: NextRequest,
    context?: any,
  ) => Promise<Response> | Response,
  options: RateLimitOptions = {},
) {
  const { ipLimitPerMinute = 60, userLimitPerMinute, getUserId } = options;

  return async (request: NextRequest, context?: unknown): Promise<Response> => {
    const ip = getClientIp(request);

    // 1. IP-based rate limit check
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

    // 2. User-based rate limit check (optional)
    if (userLimitPerMinute && getUserId) {
      const userId = await getUserId(request);
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
    }

    // 3. Execute handler
    return handler(request, context);
  };
}

/**
 * Rate limit presets
 * Pre-defined settings for common use cases
 */
export const RATE_LIMIT_PRESETS = {
  /** Default API: 60 req/min */
  default: { ipLimitPerMinute: 60 },
  /** Auth API: 20 req/min (brute-force protection) */
  auth: { ipLimitPerMinute: 20 },
  /** Resource API: 30 req/min */
  resource: { ipLimitPerMinute: 30 },
  /** API calls: 10 req/min */
  api: { ipLimitPerMinute: 10 },
  /** Sensitive API: 5 req/min */
  sensitive: { ipLimitPerMinute: 5 },
} as const;
