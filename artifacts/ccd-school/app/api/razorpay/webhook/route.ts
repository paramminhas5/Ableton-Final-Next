import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { planForEvent, verifyWebhookSignature } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("RAZORPAY_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }
  const signature = request.headers.get("x-razorpay-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }
  const raw = await request.text();
  if (!verifyWebhookSignature(raw, signature, secret)) {
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }

  try {
    const evt = JSON.parse(raw) as {
      event: string;
      payload?: {
        subscription?: { entity?: { id?: string; notes?: { userId?: string } } };
      };
    };
    const plan = planForEvent(evt.event);
    const sub = evt.payload?.subscription?.entity;
    if (plan && sub?.id) {
      const userId = sub.notes?.userId;
      if (userId) {
        await db.query(
          "UPDATE users SET plan = $1, razorpay_subscription_id = $2 WHERE id = $3",
          [plan, sub.id, userId],
        );
      } else {
        await db.query(
          "UPDATE users SET plan = $1 WHERE razorpay_subscription_id = $2",
          [plan, sub.id],
        );
      }
    }
    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("Razorpay webhook error:", e);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 400 });
  }
}
