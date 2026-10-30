import { NextResponse } from "next/server";
import { auth } from "@auth";
import { db } from "@/lib/db";
import {
  createSubscription,
  planIdFor,
  razorpayConfigured,
  type Billing,
} from "@/lib/razorpay";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!razorpayConfigured()) {
    return NextResponse.json(
      { error: "India payments are not switched on yet." },
      { status: 503 },
    );
  }
  const { billing } = (await request.json()) as { billing?: Billing };
  if (billing !== "monthly" && billing !== "annual") {
    return NextResponse.json({ error: "billing must be monthly or annual" }, { status: 400 });
  }
  const planId = planIdFor(billing);
  if (!planId) {
    return NextResponse.json({ error: "That plan is not available yet." }, { status: 503 });
  }
  try {
    const sub = await createSubscription(planId, session.user.id, billing);
    await db.query("UPDATE users SET razorpay_subscription_id = $1 WHERE id = $2", [
      sub.id,
      session.user.id,
    ]);
    return NextResponse.json({ url: sub.short_url });
  } catch (e) {
    console.error("Razorpay checkout error:", e);
    return NextResponse.json({ error: "Failed to start checkout" }, { status: 500 });
  }
}
