import Stripe from "stripe";

async function getStripeCredentials(): Promise<{
  secretKey: string;
  webhookSecret?: string;
}> {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? "depl " + process.env.WEB_REPL_RENEWAL
      : null;

  if (hostname && xReplitToken) {
    try {
      const resp = await fetch(
        `https://${hostname}/api/v2/connection?include_secrets=true&connector_names=stripe`,
        {
          headers: {
            Accept: "application/json",
            X_REPLIT_TOKEN: xReplitToken,
          },
          signal: AbortSignal.timeout(5000),
        },
      );
      if (resp.ok) {
        const data = await resp.json();
        const settings = data.items?.[0]?.settings;
        if (settings?.secret_key) {
          return {
            secretKey: settings.secret_key,
            webhookSecret: settings.webhook_secret,
          };
        }
      }
    } catch {
      // fall through to env var
    }
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "Stripe not configured. Connect Stripe via the Integrations tab or set STRIPE_SECRET_KEY.",
    );
  }
  return {
    secretKey,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  };
}

export async function getStripeClient(): Promise<Stripe> {
  const { secretKey } = await getStripeCredentials();
  return new Stripe(secretKey, { apiVersion: "2026-05-27.dahlia" });
}

export async function getStripeWebhookSecret(): Promise<string | undefined> {
  const { webhookSecret } = await getStripeCredentials();
  return webhookSecret;
}
