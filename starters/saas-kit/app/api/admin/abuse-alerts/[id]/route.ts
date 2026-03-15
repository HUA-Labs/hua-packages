/**
 * Abuse detection alert detail API
 *
 * GET: Abuse alert detail
 * PATCH: Update abuse alert status
 */

import { NextRequest, NextResponse } from "next/server";
import { AbuseAlertStatus } from "@/prisma/generated/client";
import { withAdmin } from "@/app/lib/admin/admin";
import { prisma } from "@/app/lib/infra/prisma";
import { notFound, validationError, internalError } from "@/app/lib/errors";

export const GET = withAdmin(
  async (
    request: NextRequest,
    { userId, params }: { userId: string; params: { id: string } },
  ) => {
    try {
      const { id } = params;

      const alert = await prisma.abuseAlert.findUnique({
        where: { id },
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
      });

      if (!alert) {
        return notFound("ADMIN_ABUSE");
      }

      return NextResponse.json({ alert });
    } catch (error) {
      console.error("Abuse alert detail fetch failed:", error);
      return internalError();
    }
  },
);

export const PATCH = withAdmin(
  async (
    request: NextRequest,
    { userId, params }: { userId: string; params: { id: string } },
  ) => {
    try {
      const { id } = params;

      const body = await request.json();
      const { status, adminNotes, actionTaken } = body;

      if (!status || !Object.values(AbuseAlertStatus).includes(status)) {
        return validationError();
      }

      const currentAlert = await prisma.abuseAlert.findUnique({
        where: { id },
        select: { status: true, reviewed_by: true },
      });

      if (!currentAlert) {
        return notFound("ADMIN_ABUSE");
      }

      const updatedAlert = await prisma.abuseAlert.update({
        where: { id },
        data: {
          status: status as AbuseAlertStatus,
          reviewed_by: userId,
          reviewed_at: new Date(),
          admin_notes: adminNotes || undefined,
          action_taken: actionTaken || undefined,
        },
        include: {
          user: {
            select: {
              id: true,
              nickname_hash: true,
              email_hash: true,
              state: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Abuse alert status updated.",
        alert: updatedAlert,
      });
    } catch (error) {
      console.error("Abuse alert status update failed:", error);
      return internalError();
    }
  },
);
