import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/app/lib/admin/admin";
import { prisma } from "@/app/lib/infra/prisma";
import {
  withRateLimit,
  RATE_LIMIT_PRESETS,
} from "@/app/lib/rate-limit/with-rate-limit";
import { CreateErrorLogRequestSchema } from "@/app/lib/api/schemas";
import { internalError, validationError } from "@/app/lib/errors";

// Error log list (admin)
async function handleGetErrorLogs(
  request: NextRequest,
  { userId }: { userId: string },
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const severity = searchParams.get("severity");
    const service = searchParams.get("service");
    const search = searchParams.get("search");

    const where: any = {};

    if (severity) {
      where.severity = severity;
    }

    if (service) {
      where.service = service;
    }

    if (search) {
      where.OR = [
        { message: { contains: search, mode: "insensitive" } },
        { stack: { contains: search, mode: "insensitive" } },
      ];
    }

    const errorLogs = await prisma.errorLog.findMany({
      where,
      orderBy: {
        created_at: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.errorLog.count({ where });

    return NextResponse.json({
      success: true,
      errorLogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching error logs:", error);
    return internalError();
  }
}

// Error log creation (admin)
async function handleCreateErrorLog(
  request: NextRequest,
  { userId }: { userId: string },
) {
  try {
    const body = await request.json();
    const parsed = CreateErrorLogRequestSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(
        "VALIDATION_FAILED",
        parsed.error.flatten().fieldErrors,
      );
    }

    const { severity, message, stack, service, ref_table, ref_id, extra } =
      parsed.data;

    const errorLog = await prisma.errorLog.create({
      data: {
        severity,
        message,
        stack,
        service,
        ref_table,
        ref_id,
        extra,
      },
    });

    return NextResponse.json(errorLog, { status: 201 });
  } catch (error) {
    console.error("Error creating error log:", error);
    return internalError();
  }
}

export const GET = withRateLimit(
  withAdmin(handleGetErrorLogs),
  RATE_LIMIT_PRESETS.default,
);
export const POST = withRateLimit(
  withAdmin(handleCreateErrorLog),
  RATE_LIMIT_PRESETS.resource,
);
