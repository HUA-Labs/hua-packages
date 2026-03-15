import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/app/lib/admin/admin";
import { prisma } from "@/app/lib/infra/prisma";
import {
  withRateLimit,
  RATE_LIMIT_PRESETS,
} from "@/app/lib/rate-limit/with-rate-limit";
import { CreateAnnouncementRequestSchema } from "@/app/lib/api/schemas";
import { internalError, validationError } from "@/app/lib/errors";

// Get announcements list
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const published = searchParams.get("published");

    const where: any = {
      deleted_at: null,
    };

    if (published === "true") {
      where.published_at = {
        not: null,
        lte: new Date(),
      };
      where.OR = [{ expires_at: null }, { expires_at: { gte: new Date() } }];
    }

    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: {
        created_at: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.announcement.count({ where });

    return NextResponse.json({
      success: true,
      announcements,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return internalError();
  }
}

// Create announcement (admin only)
async function handleCreateAnnouncement(
  request: NextRequest,
  { userId }: { userId: string },
) {
  try {
    const requestBody = await request.json();
    const parsed = CreateAnnouncementRequestSchema.safeParse(requestBody);

    if (!parsed.success) {
      return validationError(
        "VALIDATION_FAILED",
        parsed.error.flatten().fieldErrors,
      );
    }

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
    } = parsed.data;

    const announcement = await prisma.announcement.create({
      data: {
        title,
        body,
        title_en: title_en || null,
        body_en: body_en || null,
        title_ja: title_ja || null,
        body_ja: body_ja || null,
        tags: tags || [],
        published_at: published_at ? new Date(published_at) : null,
        expires_at: expires_at ? new Date(expires_at) : null,
      },
    });

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return internalError();
  }
}

export const POST = withRateLimit(
  withAdmin(handleCreateAnnouncement),
  RATE_LIMIT_PRESETS.resource,
);
