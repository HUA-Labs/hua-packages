import { NextRequest, NextResponse } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/app/lib/auth/auth-v5";
import { prisma } from "@/app/lib/infra/prisma";
import { Prisma } from "@/prisma/generated/client";
import { sendContactInquiryEmail } from "@/app/lib/infra/email-service";
import {
  sanitizeName,
  sanitizeEmail,
  sanitizeTitle,
  sanitizeInput,
  maskEmailForLog,
} from "@hua-labs/hua/utils";
import { generateAdvisoryLockKey } from "@/app/lib/rate-limit/advisory-lock";
import {
  withRateLimit,
  RATE_LIMIT_PRESETS,
} from "@/app/lib/rate-limit/with-rate-limit";
import { logger } from "@/app/lib/infra/logger";
import { apiError, validationError } from "@/app/lib/errors";

/**
 * Contact form API
 * POST /api/contact
 */
async function handleContact(request: NextRequest) {
  try {
    const session = await auth();

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("Request body parse failed:", parseError);
      return validationError();
    }

    let { name, email, subject, message } = body;

    // Server-side sanitization (XSS prevention)
    if (name && typeof name === "string") {
      name = sanitizeName(name);
    }
    if (email && typeof email === "string") {
      email = sanitizeEmail(email);
    }
    if (subject && typeof subject === "string") {
      subject = sanitizeTitle(subject, 100);
    }
    if (message && typeof message === "string") {
      message = sanitizeInput(message);
    }

    logger.debug("Contact request received", {
      name: name?.substring(0, 10),
      email: maskEmailForLog(email),
      subject: subject?.substring(0, 20),
      messageLength: message?.length,
      hasSession: !!session?.user?.id,
    });

    // Required field validation
    const missingFields: string[] = [];
    if (!name || name.trim().length === 0) missingFields.push("name");
    if (!email || email.trim().length === 0) missingFields.push("email");
    if (!subject || subject.trim().length === 0) missingFields.push("subject");
    if (!message || message.trim().length === 0) missingFields.push("message");

    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields);
      return apiError("VALIDATION_MISSING_FIELD");
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return apiError("VALIDATION_INVALID_FORMAT");
    }

    // Subject length validation
    const trimmedSubject = subject.trim();
    if (trimmedSubject.length > 100) {
      console.error("Subject too long:", { length: trimmedSubject.length });
      return apiError("VALIDATION_TOO_LONG");
    }

    // Message length validation
    const trimmedMessage = message.trim();
    if (trimmedMessage.length < 10) {
      console.error("Message too short:", { length: trimmedMessage.length });
      return validationError();
    }

    if (trimmedMessage.length > 5000) {
      console.error("Message too long:", { length: trimmedMessage.length });
      return apiError("VALIDATION_TOO_LONG");
    }

    // Rate limiting: max 5 inquiries per IP per hour
    // Uses PostgreSQL Advisory Lock to prevent race conditions
    const clientIP =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      null;

    if (!clientIP) {
      console.error("Cannot determine client IP:", {
        headers: {
          "x-forwarded-for": request.headers.get("x-forwarded-for"),
          "x-real-ip": request.headers.get("x-real-ip"),
        },
      });
      return validationError();
    }

    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const userAgent = request.headers.get("user-agent") || null;

    const lockKeyAdjusted = generateAdvisoryLockKey({
      scope: "contact",
      email,
      clientIP,
    });

    // Atomic rate limit check + inquiry save using advisory lock
    const inquiry = await prisma.$transaction(
      async (tx) => {
        // Acquire advisory lock (blocks until acquired, released on transaction end)
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(${lockKeyAdjusted})`;

        const recentInquiries = await tx.contactInquiry.findMany({
          where: {
            OR: [{ email }, { ip_address: clientIP }],
            created_at: {
              gte: oneHourAgo,
            },
          },
          select: { id: true },
        });

        if (recentInquiries.length >= 5) {
          throw new Error("RATE_LIMIT_EXCEEDED");
        }

        return await tx.contactInquiry.create({
          data: {
            user_id: session?.user?.id || null,
            name: name.trim(),
            email: email.trim(),
            subject: subject.trim(),
            message: trimmedMessage,
            ip_address: clientIP,
            user_agent: userAgent,
            status: "PENDING",
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        maxWait: 5000,
        timeout: 10000,
      },
    );

    logger.debug("Inquiry saved", {
      id: inquiry.id,
      email: maskEmailForLog(email),
      subject,
      userId: session?.user?.id || "guest",
    });

    // Send email (async, continue on failure)
    sendContactInquiryEmail({
      name,
      email,
      subject,
      message,
      inquiryId: inquiry.id,
    }).catch((error) => {
      console.error("Email send failed (ignored):", error);
    });

    return NextResponse.json({
      success: true,
      message: "Your inquiry has been submitted successfully.",
      inquiryId: inquiry.id,
    });
  } catch (error) {
    console.error("Contact submission error:", error);

    if (error instanceof Error && error.message === "RATE_LIMIT_EXCEEDED") {
      return apiError("RATE_LIMIT_EXCEEDED");
    }

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2034"
    ) {
      console.error("Transaction conflict (P2034):", error);
      return apiError("TRANSACTION_CONFLICT");
    }

    return apiError("INTERNAL_ERROR");
  }
}

export const POST = withRateLimit(handleContact, RATE_LIMIT_PRESETS.sensitive);
