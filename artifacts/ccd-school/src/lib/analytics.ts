/**
 * analytics.ts — PostHog wrapper for CCD.SCHOOL
 *
 * Usage:
 *   import { track } from "@/lib/analytics";
 *   track("lesson_started", { missionSlug: "what-is-sound", world: "fundamentals" });
 *
 * Events tracked:
 *   lesson_started       — user opens a lesson
 *   lesson_completed     — user finishes all screens
 *   lesson_screen_viewed — per-screen drop-off funnel
 *   quiz_answered        — per question (correct/wrong + which option)
 *   streak_extended      — streak goes up
 *   streak_broken        — streak resets to 1
 *   paywall_shown        — upgrade gate displayed
 *   paywall_clicked      — user taps "Upgrade" on gate
 *   onboarding_completed — user finishes onboarding flow
 *   placement_completed  — placement test done, chapter unlocked
 *   drill_completed      — ear training drill session
 *   push_subscribed      — user opts in to push notifications
 *   push_permission_denied
 */

// ─── Lazy-load PostHog to avoid SSR issues ────────────────────────────────────
let _ph: {
  capture: (event: string, props?: Record<string, unknown>) => void;
  identify: (id: string, props?: Record<string, unknown>) => void;
  reset: () => void;
} | null = null;

let _initialised = false;

export function initAnalytics() {
  if (_initialised || typeof window === "undefined") return;
  _initialised = true;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com";

  if (!key) {
    // No key → use a no-op shim so all track() calls are safe
    _ph = {
      capture: (event, props) => {
        if (process.env.NODE_ENV === "development") {
          // eslint-disable-next-line no-console
          console.debug("[analytics]", event, props);
        }
      },
      identify: () => {},
      reset: () => {},
    };
    return;
  }

  // Dynamic import keeps PostHog out of the SSR bundle
  import("posthog-js").then(({ default: posthog }) => {
    posthog.init(key, {
      api_host: host,
      // Privacy-first defaults
      autocapture: false,
      capture_pageview: false,  // we do it manually per route
      capture_pageleave: true,
      disable_session_recording: false,
      persistence: "localStorage+cookie",
      // Don't capture IPs
      ip: false,
    });
    _ph = posthog;
  }).catch(() => {
    // PostHog load failure is non-fatal
  });
}

/** Fire a product analytics event */
export function track(event: string, props?: Record<string, unknown>) {
  try {
    _ph?.capture(event, {
      ...props,
      // Always attach product context
      product: "ccd.school",
    });
  } catch {
    // analytics must never break the app
  }
}

/** Identify a logged-in user to PostHog */
export function identifyUser(userId: string, props?: { plan?: string; name?: string }) {
  try {
    _ph?.identify(userId, props);
  } catch {}
}

/** Reset identity on sign-out */
export function resetAnalytics() {
  try {
    _ph?.reset();
  } catch {}
}

/** Track a page view (call from usePathname effect) */
export function trackPageView(path: string) {
  track("$pageview", { $current_url: path });
}
