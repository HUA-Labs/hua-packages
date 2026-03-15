import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/auth/auth-v5";
import type { Session } from "next-auth";
import { prisma } from "@/app/lib/infra/prisma";
import { put, del } from "@vercel/blob";
import { logger } from "@/app/lib/infra/logger";
import {
  withRateLimit,
  RATE_LIMIT_PRESETS,
} from "@/app/lib/rate-limit/with-rate-limit";

async function handleUpload(request: NextRequest) {
  try {
    const session: Session | null = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    // File type validation (block SVG — XSS vector)
    const ALLOWED_IMAGE_TYPES = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only image files are allowed. (jpeg, png, webp, gif)" },
        { status: 400 },
      );
    }

    // File size validation (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be 5MB or less." },
        { status: 400 },
      );
    }

    // Check and delete existing profile image
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { profile_image: true },
    });

    if (user?.profile_image) {
      // Only delete Vercel Blob URLs (not social login images)
      if (user.profile_image.includes("vercel-storage.com")) {
        try {
          await del(user.profile_image);
          logger.info("Deleted old profile image", {
            profileImage: user.profile_image,
          });
        } catch (error) {
          console.error("Failed to delete old image:", error);
          // Continue even if delete fails
        }
      }
    }

    // Generate unique filename per user
    const timestamp = Date.now();
    const extension = file.name.split(".").pop() || "jpg";
    const fileName = `profile-images/${session.user.id}-${timestamp}.${extension}`;

    // Upload to Vercel Blob Storage
    const blob = await put(fileName, file, {
      access: "public",
      addRandomSuffix: false,
    });

    // Update DB
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        profile_image: blob.url,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      message: "Profile image updated successfully.",
    });
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { error: "Image upload failed." },
      { status: 500 },
    );
  }
}

export const POST = withRateLimit(handleUpload, RATE_LIMIT_PRESETS.sensitive);

export async function GET() {
  return NextResponse.json(
    { error: "GET method not supported." },
    { status: 405 },
  );
}
