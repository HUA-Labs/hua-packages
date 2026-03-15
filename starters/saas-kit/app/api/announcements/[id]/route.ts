import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/auth/auth-v5";
import { prisma } from "@/app/lib/infra/prisma";
import { checkAdminPermission } from "@/app/lib/admin/admin";
import { getSessionUserId } from "@/app/lib/auth/session-utils-server";
import {
  unauthorized,
  forbidden,
  notFound,
  internalError,
} from "@/app/lib/errors";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Get single announcement
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const session = await auth();
    const userId = getSessionUserId(session);
    const isAdmin = userId ? await checkAdminPermission(userId) : false;

    // Admins can view all announcements; regular users see published only
    const announcement = await prisma.announcement.findFirst({
      where: {
        id,
        deleted_at: null,
        ...(isAdmin
          ? {}
          : {
              published_at: {
                not: null,
                lte: new Date(),
              },
              OR: [{ expires_at: null }, { expires_at: { gte: new Date() } }],
            }),
      },
    });

    if (!announcement) {
      return notFound("ANNOUNCEMENT");
    }

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("Error fetching announcement:", error);
    return internalError();
  }
}

// Update announcement (admin only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const userId = getSessionUserId(session);

    if (!userId) {
      return unauthorized();
    }

    const isAdmin = await checkAdminPermission(userId);
    if (!isAdmin) {
      return forbidden("AUTH_ADMIN_REQUIRED");
    }

    const { id } = await params;
    const requestBody = await request.json();
    const {
      title,
      body,
      title_en,
      body_en,
      title_ja,
      body_ja,
      tags,
      published_at,
      expires_at,
    } = requestBody;

    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(body !== undefined && { body }),
        ...(title_en !== undefined && { title_en }),
        ...(body_en !== undefined && { body_en }),
        ...(title_ja !== undefined && { title_ja }),
        ...(body_ja !== undefined && { body_ja }),
        ...(tags !== undefined && { tags }),
        ...(published_at !== undefined && {
          published_at: published_at ? new Date(published_at) : null,
        }),
        ...(expires_at !== undefined && {
          expires_at: expires_at ? new Date(expires_at) : null,
        }),
        updated_at: new Date(),
      },
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("Error updating announcement:", error);
    return internalError();
  }
}

// Delete announcement (admin only, soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const userId = getSessionUserId(session);

    if (!userId) {
      return unauthorized();
    }

    const isAdmin = await checkAdminPermission(userId);
    if (!isAdmin) {
      return forbidden("AUTH_ADMIN_REQUIRED");
    }

    const { id } = await params;

    await prisma.announcement.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return internalError();
  }
}
