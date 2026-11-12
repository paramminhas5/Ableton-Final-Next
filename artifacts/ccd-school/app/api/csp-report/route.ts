/**
 * Receives Content-Security-Policy violation reports (report-only, next.config.mjs) and logs one short line
 * to the Vercel runtime log, so we can see what a strict policy would block before enforcing it.
 */
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const text = (await request.text()).slice(0, 16_000);
    const body = JSON.parse(text);
    const r = body?.["csp-report"] ?? body?.[0]?.body ?? body ?? {};
    const pick = (k: string, k2: string) => String(r[k] ?? r[k2] ?? "").slice(0, 200);
    console.warn("[csp]", pick("violated-directive", "effectiveDirective"), pick("blocked-uri", "blockedURL"), "on", pick("document-uri", "documentURL"));
  } catch {
    /* ignore malformed reports */
  }
  return new Response(null, { status: 204 });
}
