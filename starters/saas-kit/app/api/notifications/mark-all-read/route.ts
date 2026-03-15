import { NextRequest, NextResponse } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/app/lib/auth/auth-v5";
import { prisma } from "@/app/lib/infra/prisma";
import { getSessionUserId } from "@/app/lib/auth/session-utils-server";
import {
  withRateLimit,
  RATE_LIMIT_PRESETS,
} from "@/app/lib/rate-limit/with-rate-limit";

/**
 * Mark all notifications as read
 * PATCH /api/notifications/mark-all-read
 * - Personal notifications (user_id = userId): Notification.read = true
 * - Broadcast notifications (user_id = null): UserNotificationStatus.read = true
 */
async function handleMarkAllRead(request: NextRequest) {
  try {
    const session: Session | null = await auth();
    const userId = getSessionUserId(session);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const now = new Date();

    const visibilityCondition = [
      {
        OR: [{ visible_from: null }, { visible_from: { lte: now } }],
      },
      {
        OR: [{ visible_to: null }, { visible_to: { gte: now } }],
      },
    ];

    // 1. Mark personal notifications as read
    const personalResult = await prisma.notification.updateMany({
      where: {
        user_id: userId,
        read: false,
        AND: visibilityCondition,
      },
      data: {
        read: true,
      },
    });

    // 2. Mark broadcast notifications as read via UserNotificationStatus
    const unreadBroadcastNotifications = await prisma.notification.findMany({
      where: {
        user_id: null,
        AND: visibilityCondition,
      },
      include: {
        userStatuses: {
          where: {
            user_id: userId,
            deleted: false,
          },
          take: 1,
        },
      },
    });

    const unreadBroadcastIds = unreadBroadcastNotifications
      .filter((n) => {
        const status = n.userStatuses[0];
        return !status || !status.read;
      })
      .map((n) => n.id);

    let broadcastUpdatedCount = 0;
    for (const notificationId of unreadBroadcastIds) {
      await prisma.userNotificationStatus.upsert({
        where: {
          user_id_notification_id: {
            user_id: userId,
            notification_id: notificationId,
          },
        },
        create: {
          user_id: userId,
          notification_id: notificationId,
          read: true,
          read_at: now,
        },
        update: {
          read: true,
          read_at: now,
        },
      });
      broadcastUpdatedCount++;
    }

    const totalUpdated = personalResult.count + broadcastUpdatedCount;

    return NextResponse.json({
      success: true,
      updatedCount: totalUpdated,
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export const PATCH = withRateLimit(
  handleMarkAllRead,
  RATE_LIMIT_PRESETS.default,
);
