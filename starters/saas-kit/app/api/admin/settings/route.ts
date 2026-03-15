import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/app/lib/admin/admin";
import { internalError } from "@/app/lib/errors";
import { prisma } from "@/app/lib/infra/prisma";

async function handleGetSettings(
  request: NextRequest,
  { userId }: { userId: string },
) {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: { sort_order: "asc" },
      select: {
        id: true,
        name: true,
        display_name: true,
        price_monthly: true,
        price_yearly: true,
        price_monthly_usd: true,
        price_yearly_usd: true,
        features: true,
        is_active: true,
        is_public: true,
      },
    });

    // Check which provider env keys exist (don't expose values)
    const providerStatus = {
      toss: {
        clientKey: !!process.env.TOSS_CLIENT_KEY,
        secretKey: !!process.env.TOSS_SECRET_KEY,
      },
      lemonsqueezy: {
        apiKey: !!process.env.LEMONSQUEEZY_API_KEY,
        storeId: !!process.env.LEMONSQUEEZY_STORE_ID,
        webhookSecret: !!process.env.LEMONSQUEEZY_WEBHOOK_SECRET,
      },
    };

    const exchangeRate = process.env.USD_TO_KRW_RATE
      ? parseFloat(process.env.USD_TO_KRW_RATE)
      : 1350;

    return NextResponse.json({
      plans: plans.map((p) => ({
        ...p,
        price_monthly: Number(p.price_monthly),
        price_yearly: p.price_yearly ? Number(p.price_yearly) : null,
        price_monthly_usd: p.price_monthly_usd
          ? Number(p.price_monthly_usd)
          : null,
        price_yearly_usd: p.price_yearly_usd
          ? Number(p.price_yearly_usd)
          : null,
      })),
      providerStatus,
      exchangeRate,
    });
  } catch (error) {
    console.error("Error fetching admin settings:", error);
    return internalError();
  }
}

export const GET = withAdmin(handleGetSettings);
