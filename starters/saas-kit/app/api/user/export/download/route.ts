/**
 * User Data Export Download API
 *
 * GET /api/user/export/download
 *   ?token=xxx (HMAC-signed download token)
 *   &format=html|json
 *
 * Accessed via email download link.
 * Verifies token, generates file on-the-fly, and returns it.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/infra/prisma";
import { decryptUserData } from "@/app/lib/security/encryption";
import crypto from "crypto";
import { apiError } from "@/app/lib/errors";

interface ResourceExportEntry {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface ExportData {
  exportedAt: string;
  user: {
    email: string;
    name: string | null;
  };
  totalCount: number;
  resources: ResourceExportEntry[];
}

// Verify download token
function verifyDownloadToken(
  token: string,
): { requestId: string; userId: string; expiresAt: Date } | null {
  try {
    const secret =
      process.env.EXPORT_TOKEN_SECRET ||
      process.env.NEXTAUTH_SECRET ||
      "fallback-secret";
    const decoded = Buffer.from(token, "base64url").toString();
    const parts = decoded.split(":");

    if (parts.length !== 4) return null;

    const [requestId, userId, expiresAtStr, signature] = parts;
    const payload = `${requestId}:${userId}:${expiresAtStr}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    if (signature !== expectedSignature) return null;

    const expiresAt = new Date(parseInt(expiresAtStr, 10));
    if (expiresAt < new Date()) return null;

    return { requestId, userId, expiresAt };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // 1. Verify token
    const token = request.nextUrl.searchParams.get("token");
    const format = request.nextUrl.searchParams.get("format") || "json";

    if (!token) {
      return apiError("VALIDATION_MISSING_FIELD");
    }

    const tokenData = verifyDownloadToken(token);
    if (!tokenData) {
      return apiError("AUTH_REQUIRED");
    }

    const { requestId, userId } = tokenData;

    // 2. Verify export request
    const exportRequest = await prisma.dataExportRequest.findUnique({
      where: { id: requestId },
    });

    if (!exportRequest || exportRequest.user_id !== userId) {
      return apiError("EXPORT_NOT_FOUND");
    }

    if (exportRequest.expires_at < new Date()) {
      return apiError("EXPORT_EXPIRED");
    }

    // 3. Get user info
    const userRaw = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email_enc: true,
        nickname_enc: true,
      },
    });

    const userEmail = userRaw?.email_enc
      ? await decryptUserData(Buffer.from(userRaw.email_enc))
      : "";
    const userName = userRaw?.nickname_enc
      ? await decryptUserData(Buffer.from(userRaw.nickname_enc))
      : null;

    // 4. Build export data (domain-specific resources omitted — add your own here)
    const exportData: ExportData = {
      exportedAt: new Date().toISOString(),
      user: { email: userEmail || "", name: userName || null },
      totalCount: 0,
      resources: [],
    };

    // 5. Update request status
    await prisma.dataExportRequest.update({
      where: { id: requestId },
      data: {
        status: "COMPLETED",
        completed_at: new Date(),
      },
    });

    // 6. Return file
    const filename = `data-export-${new Date().toISOString().split("T")[0]}.${format}`;

    if (format === "html") {
      const html = generateHTML(exportData);
      return new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export download error:", error);
    return apiError("INTERNAL_ERROR");
  }
}

function generateHTML(data: ExportData): string {
  const escapeHtml = (str: string) => {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
      .replace(/\n/g, "<br>");
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Data Export — ${escapeHtml(data.user.name || data.user.email)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.8; color: #333; background: #fafafa; padding: 2rem;
    }
    .container { max-width: 800px; margin: 0 auto; }
    header.main-header {
      text-align: center; padding: 2rem 0 3rem;
      border-bottom: 1px solid #e5e5e5; margin-bottom: 3rem;
    }
    h1 { font-size: 2rem; font-weight: 600; color: #1a1a1a; margin-bottom: 0.5rem; }
    .export-info { font-size: 0.9rem; color: #666; }
    footer { text-align: center; padding: 2rem 0; color: #888; font-size: 0.85rem; }
  </style>
</head>
<body>
  <div class="container">
    <header class="main-header">
      <h1>Data Export</h1>
      <p class="export-info">
        ${escapeHtml(data.user.name || data.user.email)}<br>
        Total ${data.totalCount} records | Exported: ${formatDate(data.exportedAt)}
      </p>
    </header>
    <main></main>
    <footer><p>Exported from your account</p></footer>
  </div>
</body>
</html>`;
}
