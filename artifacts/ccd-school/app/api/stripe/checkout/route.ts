import { NextResponse } from "next/server";
import { auth } from "@auth";
import { getStripeClient } from "@/lib/stripe-client";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { priceId } = (await request.json()) as { priceId: string };
  if (!priceId) {
    return NextResponse.json({ error: "priceId required" }, { status: 400 });
  }

  try {
    const stripe = await getStripeClient();
    const userResult = await db.query(
      "SELECT email, stripe_customer_id FROM users WHERE id = $1",
      [session.user.id],
    );
    const user = userResult.rows[0];
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: session.user.id },
      });
      customerId = customer.id;
      await db.query(
        "UPDATE users SET stripe_customer_id = $1 WHERE id = $2",
        [customerId, session.user.id],
      );
    }

    const origin =
      request.headers.get("origin") ??
      `https://${process.env.REPLIT_DOMAINS?.split(",")[0]}`;

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/worlds?upgraded=true`,
      cancel_url: `${origin}/upgrade`,
      metadata: { userId: session.user.id },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (e) {
    console.error("Stripe checkout error:", e);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
