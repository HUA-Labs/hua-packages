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
 * Get single notification
 * GET /api/notifications/[id]
 * - Ownership check: user_id === self or user_id === null (broadcast)
 * - Auto-marks as read on fetch
 */
async function handleGet(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session: Session | null = await auth();
    const userId = getSessionUserId(session);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const notificationId = resolvedParams.id;

    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        OR: [{ user_id: userId }, { user_id: null }],
      },
      include: {
        announcement: true,
        userStatuses: {
          where: { user_id: userId },
          take: 1,
        },
      },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 },
      );
    }

    // Broadcast notification that was soft-deleted by the user
    if (notification.user_id === null) {
      const status = notification.userStatuses[0];
      if (status?.deleted) {
        return NextResponse.json(
          { error: "Notification not found" },
          { status: 404 },
        );
      }
    }

    // Auto mark as read
    if (notification.user_id === userId) {
      if (!notification.read) {
        await prisma.notification.update({
          where: { id: notificationId },
          data: { read: true },
        });
      }
    } else {
      const status = notification.userStatuses[0];
      if (!status?.read) {
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
            read_at: new Date(),
          },
          update: {
            read: true,
            read_at: new Date(),
          },
        });
      }
    }

    const { userStatuses, ...rest } = notification;

    return NextResponse.json({
      notification: {
        ...rest,
        read: true,
      },
    });
  } catch (error) {
    console.error("Error fetching notification:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

/**
 * Update notification read status
 * PATCH /api/notifications/[id]
 */
async function handlePatch(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session: Session | null = await auth();
    const userId = getSessionUserId(session);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const notificationId = resolvedParams.id;
    const body = await request.json();
    const { read } = body;

    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        OR: [{ user_id: userId }, { user_id: null }],
      },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 },
      );
    }

    if (notification.user_id === userId) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { read },
      });
    } else {
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
          read,
          read_at: read ? new Date() : null,
        },
        update: {
          read,
          read_at: read ? new Date() : null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      read,
    });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

/**
 * Delete single notification
 * DELETE /api/notifications/[id]
 * - Personal notifications (user_id = userId): hard delete
 * - Broadcast notifications (user_id = null): UserNotificationStatus.deleted = true
 */
async function handleDelete(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session: Session | null = await auth();
    const userId = getSessionUserId(session);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const notificationId = resolvedParams.id;

    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        OR: [{ user_id: userId }, { user_id: null }],
      },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 },
      );
    }

    if (notification.user_id === userId) {
      await prisma.notification.delete({
        where: { id: notificationId },
      });
    } else {
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
          deleted: true,
          deleted_at: new Date(),
        },
        update: {
          deleted: true,
          deleted_at: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Notification deleted.",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export const GET = withRateLimit(handleGet, RATE_LIMIT_PRESETS.default);
export const PATCH = withRateLimit(handlePatch, RATE_LIMIT_PRESETS.default);
export const DELETE = withRateLimit(handleDelete, RATE_LIMIT_PRESETS.default);
