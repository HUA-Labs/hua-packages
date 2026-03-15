import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/app/lib/admin/admin";
import { internalError } from "@/app/lib/errors";
import { prisma } from "@/app/lib/infra/prisma";

async function handleGetHistory(
  request: NextRequest,
  { userId }: { userId: string },
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(
      1,
      Math.min(1000, parseInt(searchParams.get("page") || "1") || 1),
    );
    const limit = Math.max(
      1,
      Math.min(100, parseInt(searchParams.get("limit") || "20") || 20),
    );
    const status = searchParams.get("status");
    const provider = searchParams.get("provider");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: any = {};
    if (status) where.status = status;
    if (provider) where.provider = provider;
    if (from || to) {
      where.created_at = {};
      if (from) where.created_at.gte = new Date(`${from}T00:00:00+09:00`);
      if (to) {
        const nextDay = new Date(`${to}T00:00:00+09:00`);
        nextDay.setDate(nextDay.getDate() + 1);
        where.created_at.lt = nextDay;
      }
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          user: { select: { id: true, email_hash: true, nickname_hash: true } },
          subscription: {
            select: { plan: { select: { display_name: true } } },
          },
        },
        orderBy: { created_at: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ]);

    return NextResponse.json({
      payments: payments.map((p) => ({
        id: p.id,
        user: p.user
          ? {
              id: p.user.id,
              email_hash: p.user.email_hash,
              nickname_hash: p.user.nickname_hash,
            }
          : null,
        amount: Number(p.amount),
        currency: p.currency,
        status: p.status,
        provider: p.provider,
        method: p.method,
        order_name: p.order_name,
        plan_name: p.subscription?.plan?.display_name ?? null,
        created_at: p.created_at,
        paid_at: p.paid_at,
      })),
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
      },
    });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    return internalError();
  }
}

export const GET = withAdmin(handleGetHistory);
