/**
 * User Data Export Request API
 *
 * POST /api/user/export
 *   body: { format: 'html' | 'json' }
 *
 * 1. Create DataExportRequest
 * 2. Send download link via email
 * 3. User clicks link in email → /download generates the file
 *
 * GET /api/user/export — Check export request status
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/auth/auth-v5";
import { prisma } from "@/app/lib/infra/prisma";
import { decryptUserData } from "@/app/lib/security/encryption";
import { sendDataExportEmail } from "@/app/lib/infra/email-service";
import crypto from "crypto";
import { apiError } from "@/app/lib/errors";

// Generate download token (HMAC signed)
function generateDownloadToken(
  requestId: string,
  userId: string,
  expiresAt: Date,
): string {
  const secret = process.env.EXPORT_TOKEN_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error(
      "EXPORT_TOKEN_SECRET or NEXTAUTH_SECRET must be configured",
    );
  }
  const payload = `${requestId}:${userId}:${expiresAt.getTime()}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return Buffer.from(`${payload}:${signature}`).toString("base64url");
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return apiError("AUTH_REQUIRED");
    }

    const userId = session.user.id;

    const body = await request.json().catch(() => ({}));
    const format = body.format || "html";

    if (!["html", "json"].includes(format)) {
      return apiError("VALIDATION_INVALID_FORMAT");
    }

    // Check for existing pending request (prevent duplicates)
    const existingRequest = await prisma.dataExportRequest.findFirst({
      where: {
        user_id: userId,
        status: "PENDING",
        expires_at: { gt: new Date() },
      },
    });

    if (existingRequest) {
      return apiError("EXPORT_IN_PROGRESS", { requestId: existingRequest.id });
    }

    // Get user email and decrypt
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email_enc: true,
        nickname_enc: true,
      },
    });

    if (!user?.email_enc) {
      return apiError("USER_NOT_FOUND");
    }

    const userEmail = await decryptUserData(Buffer.from(user.email_enc));
    const userName = user.nickname_enc
      ? await decryptUserData(Buffer.from(user.nickname_enc))
      : null;

    // Create DataExportRequest
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // expires in 7 days

    const exportRequest = await prisma.dataExportRequest.create({
      data: {
        user_id: userId,
        status: "PENDING",
        expires_at: expiresAt,
      },
    });

    // Generate download token
    const downloadToken = generateDownloadToken(
      exportRequest.id,
      userId,
      expiresAt,
    );

    // Build download URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://example.com";
    const downloadUrl = `${baseUrl}/api/user/export/download?token=${downloadToken}&format=${format}`;

    // Send email
    const emailResult = await sendDataExportEmail({
      to: userEmail,
      userName: userName || "User",
      downloadUrl,
      expiresAt,
      format,
    });

    if (!emailResult.success) {
      // Delete request on email failure
      await prisma.dataExportRequest.delete({
        where: { id: exportRequest.id },
      });

      return apiError("EXPORT_SEND_FAILED");
    }

    return NextResponse.json({
      success: true,
      message: "Export request submitted. Please check your email.",
      requestId: exportRequest.id,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("Export request error:", error);
    return apiError("INTERNAL_ERROR");
  }
}

// GET — check request status
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return apiError("AUTH_REQUIRED");
    }

    const userId = session.user.id;

    const recentRequests = await prisma.dataExportRequest.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
      take: 5,
      select: {
        id: true,
        status: true,
        created_at: true,
        expires_at: true,
        completed_at: true,
      },
    });

    return NextResponse.json({
      requests: recentRequests.map((r) => ({
        id: r.id,
        status: r.status,
        createdAt: r.created_at.toISOString(),
        expiresAt: r.expires_at.toISOString(),
        completedAt: r.completed_at?.toISOString() || null,
        isExpired: r.expires_at < new Date(),
      })),
    });
  } catch (error) {
    console.error("Export status fetch error:", error);
    return apiError("INTERNAL_ERROR");
  }
}
