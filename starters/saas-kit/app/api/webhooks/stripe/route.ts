/**
 * POST /api/webhooks/stripe
 *
 * Stripe webhook handler (stub).
 * To be implemented after Stripe integration setup.
 */

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Stripe webhooks not yet implemented" },
    { status: 501 },
  );
}
