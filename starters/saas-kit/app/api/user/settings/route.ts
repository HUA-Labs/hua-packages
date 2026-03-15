import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/auth/auth-v5";
import {
  getUserSettings,
  updateUserSettings,
} from "@/app/lib/user/settings-server";
import { getSessionUserId } from "@/app/lib/auth/session-utils-server";
import { getUserIdFromBearer } from "@/app/lib/auth/mobile-auth";
import {
  withRateLimit,
  RATE_LIMIT_PRESETS,
} from "@/app/lib/rate-limit/with-rate-limit";
import { logger } from "@/app/lib/infra/logger";
import { apiError } from "@/app/lib/errors";

async function handleGetSettings(request: NextRequest) {
  try {
    // Bearer → session fallback
    let userId = await getUserIdFromBearer(request);

    if (!userId) {
      const session = await auth();
      userId = getSessionUserId(session);
    }

    if (!userId) {
      return apiError("AUTH_REQUIRED");
    }

    const settings = await getUserSettings(userId);

    return NextResponse.json({
      data: {
        language: settings?.language || "en",
        themeStyle: settings?.theme_style || "minimal",
        themeMode: settings?.theme_mode || "system",
        pushNotifications: settings?.push_notifications ?? true,
        emailNotifications: settings?.email_notifications ?? true,
        notificationPreferences: (settings?.notification_preferences as Record<
          string,
          boolean
        >) ?? {
          notice: true,
          system: true,
          event: true,
        },
      },
    });
  } catch (e) {
    logger.error("Settings fetch failed", { error: String(e) });
    return apiError("USER_SETTINGS_FAILED");
  }
}

export const GET = withRateLimit(handleGetSettings, RATE_LIMIT_PRESETS.default);

async function handlePostSettings(request: NextRequest) {
  try {
    // Bearer → session fallback
    let userId = await getUserIdFromBearer(request);

    if (!userId) {
      const session = await auth();
      userId = getSessionUserId(session);
    }

    if (!userId) {
      return apiError("AUTH_REQUIRED");
    }
    const body = await request.json().catch(() => ({}));

    const updateData: Record<string, string | boolean | object> = {};

    // Language setting
    if (body?.language) {
      const language = String(body.language).toLowerCase();
      if (["ko", "en", "ja"].includes(language)) {
        updateData.language = language;
      }
    }

    // Theme style setting
    if (body?.themeStyle) {
      const themeStyle = String(body.themeStyle).toLowerCase();
      if (["paper", "minimal"].includes(themeStyle)) {
        updateData.theme_style = themeStyle;
      }
    }

    // Theme mode setting
    if (body?.themeMode) {
      const themeMode = String(body.themeMode).toLowerCase();
      if (["light", "dark", "system"].includes(themeMode)) {
        updateData.theme_mode = themeMode;
      }
    }

    // Push notification setting
    if (body?.pushNotifications !== undefined) {
      updateData.push_notifications =
        body.pushNotifications === true || body.pushNotifications === "true";
    }

    // Email notification setting
    if (body?.emailNotifications !== undefined) {
      updateData.email_notifications =
        body.emailNotifications === true || body.emailNotifications === "true";
    }

    // Per-type notification preferences (JSON)
    if (body?.notificationPreferences !== undefined) {
      const prefs = body.notificationPreferences;
      const validKeys = ["notice", "system", "event"];
      const sanitized: Record<string, boolean> = {};
      for (const key of validKeys) {
        if (prefs[key] !== undefined) {
          sanitized[key] = Boolean(prefs[key]);
        }
      }
      if (Object.keys(sanitized).length > 0) {
        updateData.notification_preferences = sanitized;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return apiError("VALIDATION_FAILED");
    }

    await updateUserSettings(userId, updateData);

    return NextResponse.json({ ok: true, data: updateData });
  } catch (e) {
    logger.error("Settings save failed", { error: String(e) });
    return apiError("USER_SETTINGS_FAILED");
  }
}

export const POST = withRateLimit(handlePostSettings, RATE_LIMIT_PRESETS.api);
export const PATCH = withRateLimit(handlePostSettings, RATE_LIMIT_PRESETS.api);
