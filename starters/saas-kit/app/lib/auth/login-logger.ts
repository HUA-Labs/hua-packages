/**
 * Login event recording utility
 *
 * Fire-and-forget pattern: log failures do not block the login flow.
 * Same pattern as admin-audit-log.ts.
 */

import { prisma } from "@/app/lib/infra/prisma";
import { logger } from "@/app/lib/infra/logger";

export type LoginAction =
  | "login_credentials"
  | "login_kakao"
  | "login_google"
  | "login_line"
  | "login_discord"
  | "login_failed"
  | "signup"
  | "signup_social";

export type DeviceType = "mobile" | "desktop" | "tablet";

export interface LoginEventInput {
  userId?: string | null;
  action: LoginAction;
  ip?: string | null;
  userAgent?: string | null;
  success?: boolean;
}

/**
 * Parse device type from User-Agent string
 */
function parseDevice(ua?: string | null): DeviceType {
  if (!ua) return "desktop";
  const lower = ua.toLowerCase();

  // Check tablet first (iPad, Android tablet, etc.)
  if (
    lower.includes("ipad") ||
    (lower.includes("android") && !lower.includes("mobile"))
  ) {
    return "tablet";
  }

  // Check mobile
  if (
    lower.includes("mobile") ||
    lower.includes("iphone") ||
    lower.includes("ipod") ||
    lower.includes("android") ||
    lower.includes("webos") ||
    lower.includes("blackberry") ||
    lower.includes("opera mini") ||
    lower.includes("opera mobi")
  ) {
    return "mobile";
  }

  return "desktop";
}

/**
 * Record login event to LoginLog table (fire-and-forget)
 */
export async function recordLoginEvent(input: LoginEventInput): Promise<void> {
  try {
    await prisma.loginLog.create({
      data: {
        user_id: input.userId || null,
        is_guest: false,
        ip: input.ip || null,
        device: parseDevice(input.userAgent),
        ua: input.userAgent || null,
        action: input.action,
        success: input.success ?? true,
      },
    });
  } catch (error) {
    console.error("Failed to record login event:", error);
    // silent fail - does not block login flow
  }
}

/**
 * Helper to extract IP/UA from NextAuth callback
 * Wrapped in try-catch since headers() can fail
 * In Next.js 15+, headers() is async
 */
export async function extractRequestInfo(): Promise<{
  ip: string | null;
  userAgent: string | null;
}> {
  try {
    // Next.js headers() is only available in server components/API routes
    const { headers } = await import("next/headers");
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      null;
    const userAgent = headersList.get("user-agent") || null;
    return { ip, userAgent };
  } catch (e) {
    logger.debug("login-logger headers() access failed", {
      error: e instanceof Error ? e.message : String(e),
    });
    return { ip: null, userAgent: null };
  }
}

/**
 * Convert social provider name to LoginAction
 */
export function providerToAction(provider: string): LoginAction {
  switch (provider) {
    case "kakao":
      return "login_kakao";
    case "google":
      return "login_google";
    case "line":
      return "login_line";
    case "discord":
      return "login_discord";
    default:
      return "login_credentials";
  }
}
