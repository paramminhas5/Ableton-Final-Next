import { NextResponse } from "next/server";
import { auth } from "@auth";
import { db } from "@/lib/db";
import { cancelSubscription, razorpayConfigured } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

/** Cancels at the end of the paid cycle. Access stays until the webhook says it ended. */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!razorpayConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }
  const r = await db.query("SELECT razorpay_subscription_id FROM users WHERE id = $1", [
    session.user.id,
  ]);
  const subId = r.rows[0]?.razorpay_subscription_id;
  if (!subId) {
    return NextResponse.json({ error: "No India subscription found" }, { status: 404 });
  }
  try {
    await cancelSubscription(subId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Razorpay cancel error:", e);
    return NextResponse.json({ error: "Failed to cancel" }, { status: 500 });
  }
}
