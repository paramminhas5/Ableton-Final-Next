import { NextResponse } from "next/server";
import { razorpayConfigured } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

/** Which payment rails are switched on. Lets the upgrade page hide what isn't ready. */
export async function GET() {
  return NextResponse.json({
    stripe: Boolean(process.env.STRIPE_SECRET_KEY),
    razorpay: razorpayConfigured(),
  });
}
