import { auth } from "@/app/lib/auth/auth-v5";
import type { Session } from "next-auth";
import { prisma } from "@/app/lib/infra/prisma";
import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimitMiddleware,
  getClientIp,
} from "@/app/lib/rate-limit/middleware";
import { getSessionUserId } from "@/app/lib/auth/session-utils-server";
import { apiError, type ErrorCode } from "@/app/lib/errors";

/**
 * Admin permission check utility
 */

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
}

/**
 * Check if the current user is an admin
 */
export async function checkAdminPermission(userId?: string): Promise<boolean> {
  try {
    const session = await auth();
    const sessionUserId = getSessionUserId(session);

    if (!sessionUserId) {
      return false;
    }

    const targetUserId = userId || sessionUserId;

    // Check user role from database
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { role: true },
    });

    // Only recognize as admin if role is 'ADMIN'
    return user?.role === "ADMIN";
  } catch (error) {
    console.error("Error checking admin permission:", error);
    return false;
  }
}

/**
 * Middleware for APIs that require admin permission
 */
export async function requireAdmin(): Promise<{
  isAdmin: boolean;
  userId?: string;
  errorCode?: ErrorCode;
}> {
  try {
    const session = await auth();
    const userId = getSessionUserId(session);

    if (!userId) {
      return { isAdmin: false, errorCode: "AUTH_REQUIRED" };
    }

    const isAdmin = await checkAdminPermission(userId);

    if (!isAdmin) {
      return { isAdmin: false, userId, errorCode: "AUTH_ADMIN_REQUIRED" };
    }

    return { isAdmin: true, userId };
  } catch (error) {
    return { isAdmin: false, errorCode: "INTERNAL_ERROR" };
  }
}

/**
 * Higher-Order Function for APIs that require admin permission
 *
 * Handles auth + admin check in one line. Also passes dynamic route params automatically.
 *
 * @param handler - Handler function to execute after admin check
 * @param options - Rate Limiting options (optional)
 * @returns Function that returns NextResponse
 *
 * @example
 * ```typescript
 * // Basic usage
 * export const GET = withAdmin(async (request, { userId }) => {
 *   return NextResponse.json({ data: ... });
 * });
 *
 * // With dynamic route params
 * export const GET = withAdmin(async (request, { userId, params }) => {
 *   const { id } = params;
 *   return NextResponse.json({ data: ... });
 * });
 *
 * // With Rate Limiting
 * export const GET = withAdmin(
 *   async (request, { userId }) => {
 *     return NextResponse.json({ data: ... });
 *   },
 *   { enableRateLimit: true, ipLimitPerMinute: 60 }
 * );
 * ```
 */
export function withAdmin<
  P extends Record<string, string> = Record<string, string>,
>(
  handler: (
    request: NextRequest,
    context: { userId: string; params: P },
  ) => Promise<Response> | Response,
  options?: {
    /** Per-user per-minute limit (default: 100) */
    userLimitPerMinute?: number;
    /** Per-IP per-minute limit (default: 200) */
    ipLimitPerMinute?: number;
    /** Whether to enable Rate Limiting (default: false) */
    enableRateLimit?: boolean;
  },
) {
  return async (
    request: NextRequest,
    routeContext: { params: Promise<P> },
  ): Promise<Response> => {
    const { isAdmin, userId, errorCode } = await requireAdmin();

    if (!isAdmin) {
      return apiError(errorCode ?? "AUTH_ADMIN_REQUIRED");
    }

    // Check Rate Limiting (if option is enabled)
    if (options?.enableRateLimit) {
      const ip = getClientIp(request);
      const rateLimitResponse = await checkRateLimitMiddleware(request, {
        userLimitPerMinute: options.userLimitPerMinute || 100,
        ipLimitPerMinute: options.ipLimitPerMinute || 200,
        userId: userId!,
        ip,
      });

      if (rateLimitResponse) {
        return rateLimitResponse;
      }
    }

    // Resolve dynamic route params
    const params = routeContext?.params ? await routeContext.params : ({} as P);

    // Admin check complete, execute handler
    return handler(request, { userId: userId!, params });
  };
}
