import { NextRequest, NextResponse } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/app/lib/auth/auth-v5";
import { prisma } from "@/app/lib/infra/prisma";
import type { Prisma, NotificationType } from "@/prisma/generated/client";
import { requireAdmin } from "@/app/lib/admin/admin";
import { getSessionUserId } from "@/app/lib/auth/session-utils-server";
import { getUserSettings } from "@/app/lib/user/settings-server";
import {
  NotificationListQuerySchema,
  CreateNotificationRequestSchema,
  UpdateNotificationReadRequestSchema,
} from "@/app/lib/api/schemas";
import { createValidationErrorResponse } from "@/app/lib/api/response";
import {
  withRateLimit,
  RATE_LIMIT_PRESETS,
} from "@/app/lib/rate-limit/with-rate-limit";
import { apiError } from "@/app/lib/errors";

// Default notification preferences
const DEFAULT_NOTIFICATION_PREFERENCES = {
  notice: true,
  system: true,
  event: true,
};

async function handleGetNotifications(request: NextRequest) {
  try {
    const session = await auth();
    const userId = getSessionUserId(session);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const queryParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    const validationResult = NotificationListQuerySchema.safeParse(queryParams);

    if (!validationResult.success) {
      return createValidationErrorResponse(validationResult.error);
    }

    const { page, limit, type, read } = validationResult.data;
    const now = new Date();

    const userSettings = await getUserSettings(userId);

    if (userSettings?.push_notifications === false) {
      return NextResponse.json({
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0,
        },
      });
    }

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
    if (type) {
      if (!allowedTypes.includes(type)) {
        return NextResponse.json({
          data: [],
          pagination: { page, limit, total: 0, pages: 0 },
        });
      }
      typeCondition = { type };
    } else if (allowedTypes.length < 3) {
      typeCondition = { type: { in: allowedTypes } };
    }

    const personalWhere: Prisma.NotificationWhereInput = {
      user_id: userId,
      AND: visibilityCondition,
      ...typeCondition,
      ...(read !== undefined ? { read } : {}),
    };

    const personalNotifications = await prisma.notification.findMany({
      where: personalWhere,
      include: {
        announcement: true,
      },
      orderBy: { created_at: "desc" },
    });

    const broadcastNotifications = await prisma.notification.findMany({
      where: {
        user_id: null,
        AND: visibilityCondition,
        ...typeCondition,
      },
      include: {
        announcement: true,
        userStatuses: {
          where: { user_id: userId },
          take: 1,
        },
      },
      orderBy: { created_at: "desc" },
    });

    const broadcastWithStatus = broadcastNotifications
      .filter((n) => {
        const status = n.userStatuses[0];
        return !status?.deleted;
      })
      .filter((n) => {
        if (read === undefined) return true;
        const status = n.userStatuses[0];
        const isRead = status?.read ?? false;
        return isRead === read;
      })
      .map((n) => {
        const status = n.userStatuses[0];
        const { userStatuses, ...rest } = n;
        return {
          ...rest,
          read: status?.read ?? false,
        };
      });

    const allNotifications = [
      ...personalNotifications,
      ...broadcastWithStatus,
    ].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    const total = allNotifications.length;
    const paginatedNotifications = allNotifications.slice(
      (page - 1) * limit,
      page * limit,
    );

    return NextResponse.json({
      success: true,
      data: paginatedNotifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export const GET = withRateLimit(
  handleGetNotifications,
  RATE_LIMIT_PRESETS.default,
);

// Create notification (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = getSessionUserId(session);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminCheck = await requireAdmin();
    if (!adminCheck.isAdmin) {
      return apiError(adminCheck.errorCode ?? "AUTH_ADMIN_REQUIRED");
    }

    const body: unknown = await request.json();

    const validationResult = CreateNotificationRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return createValidationErrorResponse(validationResult.error);
    }

    const {
      user_id,
      type,
      title,
      message,
      title_en,
      message_en,
      title_ja,
      message_ja,
      visible_from,
      visible_to,
      announcement_id,
      adminOnly,
      sendEmail,
    } = validationResult.data;

    if (user_id === null) {
      const users = await prisma.user.findMany({
        where: adminOnly ? { role: "ADMIN" } : undefined,
        select: { id: true },
      });

      const notifications = await Promise.all(
        users.map((user) =>
          prisma.notification.create({
            data: {
              user_id: user.id,
              type,
              title,
              message,
              title_en: title_en || null,
              message_en: message_en || null,
              title_ja: title_ja || null,
              message_ja: message_ja || null,
              visible_from: visible_from ? new Date(visible_from) : null,
              visible_to: visible_to ? new Date(visible_to) : null,
              announcement_id,
            },
            include: {
              announcement: true,
            },
          }),
        ),
      );

      return NextResponse.json(
        {
          message: `Notification sent to ${notifications.length} ${adminOnly ? "admin" : ""} users.`,
          count: notifications.length,
          adminOnly: adminOnly || false,
          sendEmail: sendEmail || false,
          notifications: notifications.slice(0, 5),
        },
        { status: 201 },
      );
    } else {
      const notification = await prisma.notification.create({
        data: {
          user_id,
          type,
          title,
          message,
          title_en: title_en || null,
          message_en: message_en || null,
          title_ja: title_ja || null,
          message_ja: message_ja || null,
          visible_from: visible_from ? new Date(visible_from) : null,
          visible_to: visible_to ? new Date(visible_to) : null,
          announcement_id,
        },
        include: {
          announcement: true,
        },
      });

      return NextResponse.json(notification, { status: 201 });
    }
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// Update notification read status
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    const userId = getSessionUserId(session);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json();

    const validationResult =
      UpdateNotificationReadRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return createValidationErrorResponse(validationResult.error);
    }

    const { notificationId, read } = validationResult.data;

    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        user_id: userId,
      },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 },
      );
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { read },
      include: {
        announcement: true,
      },
    });

    return NextResponse.json(updatedNotification);
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
