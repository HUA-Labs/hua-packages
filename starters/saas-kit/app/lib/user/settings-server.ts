/**
 * Server-side user settings management utility
 * Uses Prisma client, so must run on server only
 */

import { prisma } from "../infra/prisma";
import { logger } from "../infra/logger";

interface UserSettingsCache {
  emotionFlowCount: number; // retained as runtime cache; DB field removed
  analysisDepth: string;
  language: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  cachedAt: number; // Cache creation time (prevent leaks in serverless environment)
}

// In-memory cache (server-side)
//
// WARNING: Serverless environment notes:
// - Each instance has its own memory, so cache is not shared
// - Can save DB queries when hitting the same instance, but not perfect caching
// - Set a short TTL to prevent stale cache from occupying memory
const userSettingsCache = new Map<string, UserSettingsCache>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5-minute TTL

/**
 * Clean up stale cache entries (prevent leaks in serverless environment)
 *
 * @remarks
 * Since setInterval doesn't work in serverless environments,
 * use Lazy Cleanup pattern — probabilistically clean up on incoming requests
 */
function cleanupExpiredCache(): void {
  const now = Date.now();
  for (const [userId, cache] of userSettingsCache.entries()) {
    if (now - cache.cachedAt > CACHE_TTL_MS) {
      userSettingsCache.delete(userId);
    }
  }
}

// Lazy Cleanup: probabilistically clean up on incoming requests
const CLEANUP_PROBABILITY = 0.02; // 2% chance (roughly once every 50 requests)

/**
 * Get the user's emotion flow count setting.
 */
export async function getUserEmotionFlowCount(userId: string): Promise<number> {
  try {
    if (Math.random() < CLEANUP_PROBABILITY) {
      cleanupExpiredCache();
    }

    const cached = userSettingsCache.get(userId);
    if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
      return cached.emotionFlowCount;
    } else if (cached) {
      userSettingsCache.delete(userId);
    }
    // Keep default value since DB field was removed
    return 6;
  } catch (error) {
    console.error("Failed to fetch emotion flow count setting:", error);
    return 6;
  }
}

/**
 * Save the user's emotion flow count setting.
 */
export async function setUserEmotionFlowCount(
  userId: string,
  count: number,
): Promise<void> {
  try {
    // No longer managed as user setting: update cache only or ignore
    if (count < 4 || count > 6) {
      throw new Error("Emotion flow count must be between 4 and 6.");
    }
    const cached = userSettingsCache.get(userId);
    const baseCache =
      cached && Date.now() - cached.cachedAt < CACHE_TTL_MS
        ? cached
        : {
            emotionFlowCount: 6,
            analysisDepth: "standard",
            language: "ko",
            emailNotifications: true,
            pushNotifications: true,
            cachedAt: Date.now(),
          };
    userSettingsCache.set(userId, {
      ...baseCache,
      emotionFlowCount: count,
      cachedAt: Date.now(),
    });
    // Not persisted to DB
  } catch (error) {
    console.error("Failed to save emotion flow count setting:", error);
    throw error;
  }
}

/**
 * Clear the user settings cache.
 */
export function clearUserSettingsCache(userId?: string): void {
  if (userId) {
    userSettingsCache.delete(userId);
  } else {
    userSettingsCache.clear();
  }
}

/**
 * Get all settings for the user.
 */
export async function getUserSettings(userId: string) {
  try {
    // Lazy Cleanup
    if (Math.random() < CLEANUP_PROBABILITY) {
      cleanupExpiredCache();
    }

    const userSettings = await prisma.userSettings.findUnique({
      where: { user_id: userId },
    });

    return userSettings;
  } catch (error) {
    console.error("Failed to fetch user settings:", error);
    return null;
  }
}

/**
 * Update user settings.
 */
export async function updateUserSettings(
  userId: string,
  data: Record<string, string | boolean | object>,
): Promise<void> {
  try {
    // Invalidate cache
    userSettingsCache.delete(userId);

    // Create if not exists, update if exists (upsert)
    await prisma.userSettings.upsert({
      where: { user_id: userId },
      update: {
        ...data,
        updated_at: new Date(),
      },
      create: {
        user_id: userId,

        language: (data.language as string) || "ko",
        theme_style: (data.theme_style as string) || "paper",
        theme_mode: (data.theme_mode as string) || "system",
        email_notifications: true,
        push_notifications:
          data.push_notifications !== undefined
            ? Boolean(data.push_notifications)
            : true,
        ...data,
      },
    });

    logger.debug("User settings updated", { userId, data });
  } catch (error) {
    console.error("Failed to update user settings:", error);
    throw error;
  }
}
