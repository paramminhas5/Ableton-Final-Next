import Stripe from "stripe";

function getStripeCredentials(): { secretKey: string; webhookSecret?: string } {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Stripe not configured. Set STRIPE_SECRET_KEY.");
  }
  return {
    secretKey,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  };
}

export async function getStripeClient(): Promise<Stripe> {
  const { secretKey } = getStripeCredentials();
  return new Stripe(secretKey, { apiVersion: "2026-05-27.dahlia" });
}

export async function getStripeWebhookSecret(): Promise<string | undefined> {
  return getStripeCredentials().webhookSecret;
}
