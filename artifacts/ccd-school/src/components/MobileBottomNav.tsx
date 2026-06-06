"use client";
/**
 * MobileBottomNav — phone-native bottom tab bar.
 *
 * Visible only on mobile (< 768px / md breakpoint).
 * On desktop the existing sidebar / header navigation is used.
 *
 * Tabs:
 *   Learn    → /learn          (path map)
 *   Daily    → /daily          (today's lesson)
 *   Review   → /review         (SR queue, shows badge count)
 *   Profile  → /profile        (XP, streak, stats)
 *
 * Active tab is highlighted with the acid (#C6FF00) colour.
 * The bar sits at the bottom safe area (accounts for iPhone notch).
 * A matching padding shim is injected into <main> so content
 * isn't hidden behind the bar.
 *
 * The bar is hidden when:
 *   - The lesson player is full-screen (URL matches /learn/[slug] or /mission/[slug])
 *   - The user is on desktop
 */

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useProgress } from "@/lib/progress";

// ── Tab definitions ───────────────────────────────────────────────────────────
const TABS = [
  {
    href: "/learn",
    label: "Learn",
    matchFn: (p: string) => p === "/learn" || p.startsWith("/world") || p.startsWith("/path"),
    icon: LearnIcon,
  },
  {
    href: "/daily",
    label: "Daily",
    matchFn: (p: string) => p === "/daily",
    icon: DailyIcon,
  },
  {
    href: "/review",
    label: "Review",
    matchFn: (p: string) => p === "/review",
    icon: ReviewIcon,
    badge: true, // shows review count
  },
  {
    href: "/profile",
    label: "Profile",
    matchFn: (p: string) => p === "/profile" || p.startsWith("/u/"),
    icon: ProfileIcon,
  },
] as const;

// Pages where the bottom nav should be hidden (immersive lesson experience)
const HIDDEN_PATTERNS = [
  /^\/learn\/[^/]+/, // /learn/[slug]
  /^\/mission\/[^/]+/, // /mission/[slug]
  /^\/placement/,
  /^\/onboarding/,
];

// ─────────────────────────────────────────────────────────────────────────────

export function MobileBottomNav() {
  const pathname = usePathname();
  const { missionsNeedingReview } = useProgress();

  // Hide during immersive lesson sessions
  const isHidden = HIDDEN_PATTERNS.some((re) => re.test(pathname));
  if (isHidden) return null;

  const reviewCount = missionsNeedingReview?.length ?? 0;

  return (
    <>
      {/* The nav bar itself */}
      <nav
        aria-label="Main navigation"
        className="
          fixed bottom-0 left-0 right-0 z-40
          md:hidden
          bg-bone brutal-border border-x-0 border-b-0
          flex items-stretch
          pb-safe
        "
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {TABS.map((tab) => {
          const active = tab.matchFn(pathname);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={tab.label}
              aria-current={active ? "page" : undefined}
              className={`
                flex-1 flex flex-col items-center justify-center gap-1
                py-3 min-h-[56px] relative
                transition-colors
                ${active ? "text-ink" : "text-ink/40 hover:text-ink/70"}
              `}
            >
              {/* Active indicator bar at top */}
              {active && (
                <span
                  aria-hidden
                  className="absolute top-0 left-3 right-3 h-[3px] bg-acid rounded-b"
                />
              )}

              {/* Icon with optional badge */}
              <span className="relative">
                <Icon active={active} />
                {tab.badge && reviewCount > 0 && (
                  <span
                    aria-label={`${reviewCount} lessons to review`}
                    className="
                      absolute -top-1.5 -right-2
                      min-w-[16px] h-4 px-1
                      bg-hot text-bone
                      font-mono text-[9px] font-bold
                      flex items-center justify-center
                      rounded-full brutal-border border-bone
                      leading-none
                    "
                  >
                    {reviewCount > 9 ? "9+" : reviewCount}
                  </span>
                )}
              </span>

              {/* Label */}
              <span
                className={`font-mono text-[9px] uppercase leading-none tracking-wider ${
                  active ? "opacity-100" : "opacity-60"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Spacer so page content isn't hidden behind the bar on mobile */}
      <div
        aria-hidden
        className="md:hidden h-[72px]"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      />
    </>
  );
}

// ── SVG Icons (inline, no external dep) ──────────────────────────────────────

function LearnIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={active ? 2.5 : 2}
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden
    >
      {/* Book / path map icon */}
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function DailyIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={active ? 2.5 : 2}
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden
    >
      {/* Lightning bolt — "today's challenge" */}
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function ReviewIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={active ? 2.5 : 2}
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden
    >
      {/* Refresh / spaced repetition */}
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={active ? 2.5 : 2}
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden
    >
      {/* User circle */}
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
