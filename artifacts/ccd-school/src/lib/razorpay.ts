import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Razorpay Subscriptions, via the REST API (no SDK dependency).
 * Used for India (INR, UPI/cards/netbanking). Stripe handles everyone else.
 */

export type Billing = "monthly" | "annual";

export function razorpayConfigured(): boolean {
  return Boolean(
    process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_SECRET &&
      (process.env.RAZORPAY_PLAN_MONTHLY || process.env.RAZORPAY_PLAN_ANNUAL),
  );
}

export function planIdFor(billing: Billing): string | undefined {
  return billing === "monthly"
    ? process.env.RAZORPAY_PLAN_MONTHLY
    : process.env.RAZORPAY_PLAN_ANNUAL;
}

function authHeader(): string {
  const id = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!id || !secret) throw new Error("Razorpay not configured");
  return "Basic " + Buffer.from(`${id}:${secret}`).toString("base64");
}

async function rzp<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`https://api.razorpay.com/v1${path}`, {
    method: "POST",
    headers: { Authorization: authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  const data = (await res.json()) as T & { error?: { description?: string } };
  if (!res.ok) {
    throw new Error(data.error?.description ?? `Razorpay ${res.status}`);
  }
  return data;
}

export interface RzpSubscription {
  id: string;
  short_url: string;
  status: string;
}

export function createSubscription(planId: string, userId: string, billing: Billing) {
  return rzp<RzpSubscription>("/subscriptions", {
    plan_id: planId,
    // Razorpay requires a cycle count. 120 months / 10 years is effectively "until cancelled".
    total_count: billing === "monthly" ? 120 : 10,
    customer_notify: 1,
    notes: { userId },
  });
}

export function cancelSubscription(subscriptionId: string) {
  return rzp<RzpSubscription>(`/subscriptions/${subscriptionId}/cancel`, {
    cancel_at_cycle_end: 1,
  });
}

/** HMAC-SHA256 of the raw request body, hex, compared in constant time. */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string,
): boolean {
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Which plan a subscription event should leave the user on. null = ignore. */
export function planForEvent(event: string): "pro" | "free" | null {
  switch (event) {
    case "subscription.activated":
    case "subscription.charged":
    case "subscription.resumed":
      return "pro";
    case "subscription.cancelled":
    case "subscription.completed":
    case "subscription.halted":
    case "subscription.expired":
      return "free";
    default:
      return null;
  }
}
