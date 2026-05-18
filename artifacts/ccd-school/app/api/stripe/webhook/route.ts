import { NextResponse } from "next/server";
import { getStripeClient, getStripeWebhookSecret } from "@/lib/stripe-client";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.arrayBuffer();
  const payload = Buffer.from(body);
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  try {
    const stripe = await getStripeClient();
    const webhookSecret = await getStripeWebhookSecret();

    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is not configured");
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }

    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as {
          customer?: string;
          customer_email?: string;
          metadata?: { userId?: string };
        };
        const customerId = session.customer;
        const userId = session.metadata?.userId;

        if (userId) {
          await db.query(
            "UPDATE users SET plan = 'pro', stripe_customer_id = COALESCE(stripe_customer_id, $1) WHERE id = $2",
            [customerId, userId],
          );
        } else if (customerId) {
          await db.query(
            "UPDATE users SET plan = 'pro' WHERE stripe_customer_id = $1",
            [customerId],
          );
        }
        break;
      }

      case "customer.subscription.deleted":
      case "invoice.payment_failed": {
        const obj = event.data.object as { customer?: string };
        if (obj.customer) {
          await db.query(
            "UPDATE users SET plan = 'free' WHERE stripe_customer_id = $1",
            [obj.customer],
          );
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as {
          customer?: string;
          status?: string;
        };
        if (sub.customer) {
          const plan =
            sub.status === "active" || sub.status === "trialing"
              ? "pro"
              : "free";
          await db.query(
            "UPDATE users SET plan = $1 WHERE stripe_customer_id = $2",
            [plan, sub.customer],
          );
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("Webhook error:", e);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 400 },
    );
  }
}
