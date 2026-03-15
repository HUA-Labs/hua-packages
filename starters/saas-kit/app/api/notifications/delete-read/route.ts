import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/auth/auth-v5";
import type { Session } from "next-auth";
import { prisma } from "@/app/lib/infra/prisma";
import { getSessionUserId } from "@/app/lib/auth/session-utils-server";
import {
  withRateLimit,
  RATE_LIMIT_PRESETS,
} from "@/app/lib/rate-limit/with-rate-limit";

/**
 * Delete all read notifications
 * DELETE /api/notifications/delete-read
 * - Personal notifications (user_id = userId): hard delete
 * - Broadcast notifications (user_id = null): UserNotificationStatus.deleted = true
 */
async function handleDeleteRead(request: NextRequest) {
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

    // 1. Hard delete personal read notifications (user_id = userId, read = true)
    const personalResult = await prisma.notification.deleteMany({
      where: {
        user_id: userId,
        read: true,
        AND: visibilityCondition,
      },
    });

    // 2. Soft delete broadcast read notifications (user_id = null)
    const readBroadcastNotifications = await prisma.notification.findMany({
      where: {
        user_id: null,
        AND: visibilityCondition,
      },
      include: {
        userStatuses: {
          where: {
            user_id: userId,
            read: true,
            deleted: false,
          },
          take: 1,
        },
      },
    });

    const readBroadcastIds = readBroadcastNotifications
      .filter((n) => n.userStatuses.length > 0)
      .map((n) => n.id);

    let broadcastDeletedCount = 0;
    if (readBroadcastIds.length > 0) {
      const updateResult = await prisma.userNotificationStatus.updateMany({
        where: {
          user_id: userId,
          notification_id: { in: readBroadcastIds },
        },
        data: {
          deleted: true,
          deleted_at: now,
        },
      });
      broadcastDeletedCount = updateResult.count;
    }

    const totalDeleted = personalResult.count + broadcastDeletedCount;

    return NextResponse.json({
      success: true,
      deletedCount: totalDeleted,
      message: `${totalDeleted} read notifications deleted.`,
    });
  } catch (error) {
    console.error("Error deleting read notifications:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export const DELETE = withRateLimit(
  handleDeleteRead,
  RATE_LIMIT_PRESETS.default,
);
