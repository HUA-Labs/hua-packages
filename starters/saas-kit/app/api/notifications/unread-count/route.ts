import { NextRequest, NextResponse } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/app/lib/auth/auth-v5";
import { prisma } from "@/app/lib/infra/prisma";
import type { Prisma, NotificationType } from "@/prisma/generated/client";
import { getSessionUserId } from "@/app/lib/auth/session-utils-server";
import { getUserSettings } from "@/app/lib/user/settings-server";
import {
  withRateLimit,
  RATE_LIMIT_PRESETS,
} from "@/app/lib/rate-limit/with-rate-limit";

// Default notification preferences
const DEFAULT_NOTIFICATION_PREFERENCES = {
  notice: true,
  system: true,
  event: true,
};

/**
 * Get unread notification count
 * GET /api/notifications/unread-count
 * - Personal notifications (user_id = userId): Notification.read = false
 * - Broadcast notifications (user_id = null): UserNotificationStatus.read = false or no status
 */
async function handleUnreadCount(request: NextRequest) {
  try {
    const session = await auth();
    const userId = getSessionUserId(session);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const now = new Date();

    const userSettings = await getUserSettings(userId);

    const notificationPrefs =
      (userSettings?.notification_preferences as Record<
        string,
        boolean
      > | null) || DEFAULT_NOTIFICATION_PREFERENCES;

    const allowedTypes = Object.entries(notificationPrefs)
      .filter(([_, enabled]) => enabled)
      .map(([notifType]) => notifType as NotificationType);

    const visibilityCondition = [
      {
        OR: [{ visible_from: null }, { visible_from: { lte: now } }],
      },
      {
        OR: [{ visible_to: null }, { visible_to: { gte: now } }],
      },
    ];

    let typeCondition: Prisma.NotificationWhereInput = {};
    if (allowedTypes.length < 3) {
      typeCondition = { type: { in: allowedTypes } };
    }

    // 1. Personal unread count
    const personalUnreadCount = await prisma.notification.count({
      where: {
        user_id: userId,
        read: false,
        AND: visibilityCondition,
        ...typeCondition,
      },
    });

    // 2. Broadcast unread count
    const broadcastNotifications = await prisma.notification.findMany({
      where: {
        user_id: null,
        AND: visibilityCondition,
        ...typeCondition,
      },
      include: {
        userStatuses: {
          where: { user_id: userId },
          take: 1,
        },
      },
    });

    const broadcastUnreadCount = broadcastNotifications.filter((n) => {
      const status = n.userStatuses[0];
      if (status?.deleted) return false;
      return !status || !status.read;
    }).length;

    const totalUnreadCount = personalUnreadCount + broadcastUnreadCount;

    return NextResponse.json({
      unreadCount: totalUnreadCount,
    });
  } catch (error) {
    console.error("Error fetching unread notification count:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export const GET = withRateLimit(handleUnreadCount, RATE_LIMIT_PRESETS.default);
