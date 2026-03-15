import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/infra/prisma";
import { withAdmin } from "@/app/lib/admin/admin";
import { apiError } from "@/app/lib/errors";

/**
 * Admin notification single fetch
 * GET /api/admin/notifications/[id]
 */
export const GET = withAdmin(
  async (
    request: NextRequest,
    { userId, params }: { userId: string; params: { id: string } },
  ) => {
    try {
      const { id } = params;

      const notification = await prisma.notification.findUnique({
        where: { id },
      });

      if (!notification) {
        return apiError("NOTIFICATION_NOT_FOUND");
      }

      return NextResponse.json({ notification });
    } catch (error) {
      console.error("Error fetching admin notification:", error);
      return apiError("INTERNAL_ERROR");
    }
  },
);

/**
 * Admin notification update
 * PATCH /api/admin/notifications/[id]
 */
export const PATCH = withAdmin(
  async (
    request: NextRequest,
    { userId, params }: { userId: string; params: { id: string } },
  ) => {
    try {
      const { id } = params;
      const body = await request.json();

      const existing = await prisma.notification.findUnique({ where: { id } });
      if (!existing) {
        return apiError("NOTIFICATION_NOT_FOUND");
      }

      const updateData: Record<string, unknown> = {};
      if (body.title !== undefined) updateData.title = body.title;
      if (body.message !== undefined) updateData.message = body.message;
      if (body.type !== undefined) updateData.type = body.type;
      if (body.visible_from !== undefined)
        updateData.visible_from = body.visible_from
          ? new Date(body.visible_from)
          : null;
      if (body.visible_to !== undefined)
        updateData.visible_to = body.visible_to
          ? new Date(body.visible_to)
          : null;

      const notification = await prisma.notification.update({
        where: { id },
        data: updateData,
      });

      return NextResponse.json({ notification });
    } catch (error) {
      console.error("Error updating admin notification:", error);
      return apiError("INTERNAL_ERROR");
    }
  },
);

/**
 * Admin notification delete
 * DELETE /api/admin/notifications/[id]
 */
export const DELETE = withAdmin(
  async (
    request: NextRequest,
    { userId, params }: { userId: string; params: { id: string } },
  ) => {
    try {
      const { id } = params;

      const existing = await prisma.notification.findUnique({ where: { id } });
      if (!existing) {
        return apiError("NOTIFICATION_NOT_FOUND");
      }

      await prisma.notification.delete({ where: { id } });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error deleting admin notification:", error);
      return apiError("INTERNAL_ERROR");
    }
  },
);
