/**
 * Abuse detection alert API
 *
 * GET: Abuse alert list (filtering, pagination)
 */

import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/app/lib/admin/admin";
import { internalError } from "@/app/lib/errors";
import {
  AbuseAlertStatus,
  AlertType,
  AbusePattern,
  PenaltyLevel,
} from "@/prisma/generated/client";
import { prisma } from "@/app/lib/infra/prisma";

async function handleGetAbuseAlerts(
  request: NextRequest,
  { userId }: { userId: string },
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") as AbuseAlertStatus | null;
    const alertType = searchParams.get("alertType") as AlertType | null;
    const abusePattern = searchParams.get(
      "abusePattern",
    ) as AbusePattern | null;
    const penaltyLevel = searchParams.get(
      "penaltyLevel",
    ) as PenaltyLevel | null;
    const urgentOnly = searchParams.get("urgentOnly") === "true";
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const reviewedBy = searchParams.get("reviewedBy");

    const where: any = {};

    if (status) {
      where.status = status;
    } else if (urgentOnly) {
      where.status = {
        in: [AbuseAlertStatus.PENDING, AbuseAlertStatus.REVIEWED],
      };
    }

    if (alertType) {
      where.alert_type = alertType;
    }

    if (abusePattern) {
      where.abuse_patterns = {
        has: abusePattern,
      };
    }

    if (penaltyLevel) {
      where.penalty_level = penaltyLevel;
    }

    if (dateFrom || dateTo) {
      where.created_at = {};
      if (dateFrom) {
        where.created_at.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.created_at.lte = new Date(dateTo);
      }
    }

    if (reviewedBy) {
      where.reviewed_by = reviewedBy;
    }

    const skip = (page - 1) * limit;

    const [alerts, totalCount] = await Promise.all([
      prisma.abuseAlert.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              nickname_hash: true,
              email_hash: true,
              state: true,
              created_at: true,
            },
          },
        },
        orderBy: [{ status: "asc" }, { created_at: "desc" }],
        skip,
        take: limit,
      }),
      prisma.abuseAlert.count({ where }),
    ]);

    return NextResponse.json({
      alerts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Abuse alert list fetch failed:", error);
    return internalError();
  }
}

export const GET = withAdmin(handleGetAbuseAlerts);
