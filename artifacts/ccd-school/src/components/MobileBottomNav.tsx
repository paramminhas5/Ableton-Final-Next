"use client";
/**
 * MobileBottomNav — CCD-style phone bottom tab bar.
 * border-t-4 border-ink, acid-yellow active tab, font-display labels,
 * chunk-shadow on active indicator, DJ Cat favicon.
 */
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useProgress } from "@/lib/progress";

const TABS = [
  { href: "/learn",    label: "Learn",   matchFn: (p: string) => p === "/learn" || p.startsWith("/world") || p.startsWith("/path"), icon: LearnIcon },
  { href: "/daily",    label: "Daily",   matchFn: (p: string) => p === "/daily",   icon: DailyIcon },
  { href: "/review",   label: "Review",  matchFn: (p: string) => p === "/review",  icon: ReviewIcon, badge: true },
  { href: "/profile",  label: "Profile", matchFn: (p: string) => p === "/profile" || p.startsWith("/u/"), icon: ProfileIcon },
] as const;

const HIDDEN_PATTERNS = [
  /^\/learn\/[^/]+/,
  /^\/mission\/[^/]+/,
  /^\/placement/,
  /^\/onboarding/,
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { missionsNeedingReview } = useProgress();

  const isHidden = HIDDEN_PATTERNS.some(re => re.test(pathname));
  if (isHidden) return null;

  const reviewCount = missionsNeedingReview?.length ?? 0;

  return (
    <>
      <nav
        aria-label="Main navigation"
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-bone border-t-4 border-ink flex items-stretch pb-safe"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {TABS.map(tab => {
          const active = tab.matchFn(pathname);
          const Icon   = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={tab.label}
              aria-current={active ? "page" : undefined}
              className={`
                flex-1 flex flex-col items-center justify-center gap-1
                py-3 min-h-[56px] relative transition-colors
                ${active ? "bg-acid text-ink" : "text-ink/40 hover:text-ink/70 hover:bg-acid/10"}
              `}
            >
              {/* Active top bar */}
              {active && (
                <span aria-hidden className="absolute top-0 left-0 right-0 h-[4px] bg-ink" />
              )}

              {/* Icon with badge */}
              <span className="relative">
                <Icon active={active} />
                {"badge" in tab && tab.badge && reviewCount > 0 && (
                  <span
                    aria-label={`${reviewCount} lessons to review`}
                    className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 bg-hot text-bone font-mono text-[9px] font-bold flex items-center justify-center brutal-border border-bone leading-none"
                  >
                    {reviewCount > 9 ? "9+" : reviewCount}
                  </span>
                )}
              </span>

              {/* Label — font-display for CCD style */}
              <span className={`font-display text-[9px] uppercase leading-none tracking-wide ${active ? "opacity-100" : "opacity-60"}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Spacer */}
      <div aria-hidden className="md:hidden h-[72px]" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }} />
    </>
  );
}

// ── SVG Icons ──────────────────────────────────────────────────────────────────

function LearnIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function DailyIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function ReviewIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
