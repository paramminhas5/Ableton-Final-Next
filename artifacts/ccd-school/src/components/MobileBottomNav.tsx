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
  { href: "/worlds",    label: "Worlds",   matchFn: (p: string) => p === "/worlds" || p.startsWith("/world") || p.startsWith("/path") || p === "/learn", icon: WorldsIcon },
  { href: "/missions",  label: "Missions", matchFn: (p: string) => p === "/missions", icon: MissionsIcon },
  { href: "/review",    label: "Review",   matchFn: (p: string) => p === "/review",  icon: ReviewIcon, badge: true },
  { href: "/dashboard", label: "Progress", matchFn: (p: string) => p === "/dashboard" || p === "/profile" || p.startsWith("/u/"), icon: ProgressIcon },
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

function WorldsIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function MissionsIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
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

function ProgressIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}
