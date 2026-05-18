import { NextResponse } from "next/server";
import { auth } from "@auth";
import { getStripeClient } from "@/lib/stripe-client";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const stripe = await getStripeClient();
    const userResult = await db.query(
      "SELECT stripe_customer_id FROM users WHERE id = $1",
      [session.user.id],
    );
    const customerId = userResult.rows[0]?.stripe_customer_id;
    if (!customerId) {
      return NextResponse.json(
        { error: "No billing account found" },
        { status: 404 },
      );
    }
    const origin =
      request.headers.get("origin") ??
      `https://${process.env.REPLIT_DOMAINS?.split(",")[0]}`;
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/profile`,
    });
    return NextResponse.json({ url: portalSession.url });
  } catch (e) {
    console.error("Portal error:", e);
    return NextResponse.json(
      { error: "Failed to open billing portal" },
      { status: 500 },
    );
  }
}
