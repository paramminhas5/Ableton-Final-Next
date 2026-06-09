"use client";
/**
 * Header — CCD.SCHOOL navigation
 * Styled as a true child of CatsCanDance:
 *   - Electric-blue logo area
 *   - border-4 border-ink everywhere
 *   - chunk-shadow on dropdowns
 *   - Bowlby One (font-display) for all nav labels
 *   - CCD hover: acid-yellow highlight
 *   - DJ Cat avatar in mobile drawer
 */

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { useProgress, DAILY_GOAL_XP, MAX_HEARTS } from "@/lib/progress";
import { useAuth, signOut } from "@/lib/auth";
import { rankFor } from "@/lib/ranks";
import { PALETTE_OPEN_EVENT } from "@/components/CommandPalette";
import { useLearnMode } from "@/lib/mode";
import { getMissionContext } from "@/lib/missionContext";
import { MISSIONS } from "@/content/missions";
import { FOUNDATIONS_MISSIONS } from "@/content/missions-foundations";
import { DJ_WORLD_MISSIONS } from "@/content/missions-dj";
import { trackCatClick } from "@/components/EasterEggs";

const ALL_MISSIONS = [...FOUNDATIONS_MISSIONS, ...DJ_WORLD_MISSIONS, ...MISSIONS];

const PRIMARY_NAV = [
  { to: "/worlds",    label: "Worlds"   },
  { to: "/learn",     label: "Paths"    },
  { to: "/missions",  label: "Missions" },
  { to: "/dashboard", label: "Progress" },
] as const;

const MORE_SECTIONS = [
  {
    heading: "PRACTICE",
    links: [
      { to: "/train",     label: "Ear Training"      },
      { to: "/challenge", label: "Daily Challenge ⚡" },
      { to: "/match",     label: "Flashcard Match"    },
      { to: "/review",    label: "Review Session"     },
    ],
  },
  {
    heading: "REFERENCE",
    links: [
      { to: "/glossary",    label: "Glossary"     },
      { to: "/shortcuts",   label: "Shortcuts"    },
      { to: "/devices",     label: "Devices"      },
      { to: "/signal-flow", label: "Signal Flow"  },
    ],
  },
  {
    heading: "ACCOUNT",
    links: [
      { to: "/profile",     label: "Profile & Trophies" },
      { to: "/leaderboard", label: "Leaderboard"        },
      { to: "/shop",        label: "Gem Shop 💎"         },
      { to: "/placement",   label: "Placement Test"     },
    ],
    includeTheme: true,
  },
] as const;

// ─── Icons ────────────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="4.5" />
      <line x1="10.5" y1="10.5" x2="14" y2="14" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="8" cy="5" r="3" />
      <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    </svg>
  );
}

// ─── GoalRing ─────────────────────────────────────────────────────────────────

function GoalRing({ pct, done }: { pct: number; done: boolean }) {
  const r    = 8;
  const circ = 2 * Math.PI * r;
  return (
    <svg width="20" height="20" viewBox="0 0 22 22"
      aria-label={`Daily goal ${Math.round(pct * 100)}%`} role="img">
      <circle cx="11" cy="11" r={r} fill="none" stroke="currentColor"
        strokeWidth="2.5" opacity="0.18" />
      <circle cx="11" cy="11" r={r} fill="none"
        stroke={done ? "hsl(221 83% 53%)" : "hsl(84 81% 56%)"}
        strokeWidth="2.5"
        strokeDasharray={`${circ * pct} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 11 11)"
        style={{ transition: "stroke-dasharray 0.5s ease" }}
      />
    </svg>
  );
}

// ─── Hearts ───────────────────────────────────────────────────────────────────

const HEARTS_TOOLTIP_KEY = "ccd.hearts_header_seen";

function Hearts({ count, refillSeconds }: { count: number; refillSeconds: number }) {
  const [secs, setSecs] = useState(refillSeconds);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [hasSeenTooltip, setHasSeenTooltip] = useState(true);

  useEffect(() => {
    try { setHasSeenTooltip(!!sessionStorage.getItem(HEARTS_TOOLTIP_KEY)); } catch {}
  }, []);

  useEffect(() => setSecs(refillSeconds), [refillSeconds]);
  useEffect(() => {
    if (count >= MAX_HEARTS || secs <= 0) return;
    const id = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [count, secs]);

  const dismissTooltip = () => {
    try { sessionStorage.setItem(HEARTS_TOOLTIP_KEY, "1"); } catch {}
    setHasSeenTooltip(true);
    setTooltipOpen(false);
  };

  const hh   = String(Math.floor(secs / 3600)).padStart(1, "0");
  const mm   = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
  const full = count >= MAX_HEARTS;

  return (
    <div className="relative">
      <button
        onClick={() => {
          setTooltipOpen((o) => !o);
          if (!hasSeenTooltip) {
            try { sessionStorage.setItem(HEARTS_TOOLTIP_KEY, "1"); } catch {}
            setHasSeenTooltip(true);
          }
        }}
        aria-label={`Hearts: ${count} of ${MAX_HEARTS}`}
        className="flex items-center gap-0.5 brutal-press hover:opacity-80 transition-opacity"
      >
        {Array.from({ length: MAX_HEARTS }).map((_, i) => (
          <span key={i} aria-hidden="true"
            className={`text-base leading-none transition-all ${i < count ? "text-hot" : "opacity-20"}`}>
            ♥
          </span>
        ))}
        {!full && secs > 0 && (
          <span className="font-mono text-xs opacity-45 ml-1 tabular-nums">{hh}h{mm}</span>
        )}
        {!hasSeenTooltip && (
          <span className="ml-1 w-1.5 h-1.5 rounded-full bg-acid animate-ping absolute -top-0.5 -right-0.5" aria-hidden />
        )}
      </button>

      {tooltipOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={dismissTooltip} aria-hidden />
          <div className="absolute right-0 top-full mt-2 z-50 brutal-border bg-bone chunk-shadow w-60 animate-fade-in">
            <div className="px-4 pt-3.5 pb-3">
              <p className="font-display text-lg mb-2">♥ Hearts</p>
              <p className="font-sans text-sm leading-relaxed opacity-70">
                You have <strong>{count}/{MAX_HEARTS}</strong> hearts. Each wrong
                answer in <strong>Flow Mode</strong> costs 1 heart.
              </p>
              {!full && (
                <p className="font-sans text-xs mt-2 opacity-55">
                  Next refill in {hh}h{mm}m · 1 heart per 4 hours
                </p>
              )}
              {full && (
                <p className="font-sans text-xs mt-2 text-acid font-bold">♥ Full — you&apos;re good to go</p>
              )}
            </div>
            <div className="border-t-4 border-ink px-4 py-2.5">
              <button onClick={dismissTooltip}
                className="font-mono text-xs uppercase opacity-45 hover:opacity-100 transition-opacity">
                Got it ✕
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── XpStreakPopover ──────────────────────────────────────────────────────────

interface XpStreakPopoverProps {
  progress: ReturnType<typeof useProgress>["progress"];
  dailyGoalPct: number;
  dailyGoalDone: boolean;
  onClose: () => void;
}

function XpStreakPopover({ progress, dailyGoalPct, dailyGoalDone, onClose }: XpStreakPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { current: rank, next, progress: rankPct } = rankFor(progress.xp);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const xpToNext = next ? next.minXp - progress.xp : 0;

  return (
    <div ref={ref}
      className="absolute right-0 top-full mt-2 z-[60] brutal-border bg-bone chunk-shadow min-w-[230px] animate-fade-in"
      role="dialog" aria-label="XP and streak details">
      <div className="px-4 py-3 border-b-4 border-ink flex items-center gap-3">
        <span className="text-2xl leading-none">{rank.emoji}</span>
        <div className="flex-1">
          <p className="font-display text-base">{rank.name}</p>
          <p className="font-mono text-xs opacity-45 uppercase">{rank.tagline}</p>
        </div>
      </div>
      <div className="px-4 py-3 border-b-4 border-ink">
        <div className="flex justify-between items-baseline mb-2">
          <span className="font-mono text-xs uppercase opacity-50">XP to next rank</span>
          <span className="font-mono text-xs tabular-nums">{xpToNext > 0 ? `${xpToNext} left` : "MAX"}</span>
        </div>
        <div className="w-full bg-ink/10 h-2 overflow-hidden border-2 border-ink">
          <div className="bg-acid h-full transition-all" style={{ width: `${rankPct * 100}%` }} />
        </div>
        <p className="font-mono text-xs opacity-45 mt-1.5 tabular-nums">{progress.xp} XP total</p>
      </div>
      <div className="px-4 py-3 border-b-4 border-ink flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase opacity-45 mb-1">Streak</p>
          <p className="font-display text-lg">
            🔥 {progress.streakDays}
            {progress.streakShield && <span className="ml-1 text-base">🛡</span>}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-xs uppercase opacity-45 mb-1">Gems</p>
          <p className="font-display text-lg">💎 {progress.gems}</p>
        </div>
      </div>
      <div className="px-4 py-3 flex items-center gap-3">
        <GoalRing pct={dailyGoalPct} done={dailyGoalDone} />
        <div>
          <p className="font-mono text-xs uppercase opacity-45">Daily goal</p>
          <p className="font-sans text-sm tabular-nums">
            {progress.dailyXp} / {DAILY_GOAL_XP} XP
            {dailyGoalDone && <span className="ml-1 text-xs">✓</span>}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── XpStreakBadge ────────────────────────────────────────────────────────────

function useAnimatedNumber(value: number) {
  const [display, setDisplay] = useState(value);
  const [flash, setFlash] = useState(false);
  const prevRef = useRef(value);

  useEffect(() => {
    if (value === prevRef.current) return;
    const prev = prevRef.current;
    prevRef.current = value;
    if (value <= prev) { setDisplay(value); return; }
    const steps = Math.min(value - prev, 20);
    const stepSize = (value - prev) / steps;
    let cur = prev; let i = 0;
    setFlash(true);
    const interval = setInterval(() => {
      i++; cur += stepSize;
      setDisplay(Math.round(cur));
      if (i >= steps) {
        clearInterval(interval);
        setDisplay(value);
        setTimeout(() => setFlash(false), 500);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [value]);

  return { display, flash };
}

function XpStreakBadge() {
  const { progress, dailyGoalPct, dailyGoalDone } = useProgress();
  const [open, setOpen] = useState(false);
  const { display: xpDisplay, flash: xpFlash } = useAnimatedNumber(progress.xp);
  const { display: streakDisplay, flash: streakFlash } = useAnimatedNumber(progress.streakDays);

  return (
    <div className="relative flex items-center gap-1">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        title="View XP, streak and daily goal"
        className="brutal-border bg-ink text-bone px-3 py-1.5 font-display text-sm brutal-press flex items-center gap-2.5 hover:bg-electric-blue transition-colors ccd-btn-hover"
      >
        <span className={`flex items-center gap-1 transition-all duration-200 ${streakFlash ? "scale-125 text-acid" : ""}`}>
          <span>🔥</span>
          <span className="font-display text-base leading-none tabular-nums">{streakDisplay}</span>
        </span>
        <span className="opacity-20 text-xs">|</span>
        <span className={`flex items-center gap-1 transition-all duration-200 ${xpFlash ? "scale-110 text-acid" : ""}`}>
          <span className="opacity-50 text-xs font-mono">XP</span>
          <span className="font-display text-base leading-none tabular-nums">{xpDisplay}</span>
        </span>
        <GoalRing pct={dailyGoalPct} done={dailyGoalDone} />
      </button>
      {open && (
        <XpStreakPopover
          progress={progress}
          dailyGoalPct={dailyGoalPct}
          dailyGoalDone={dailyGoalDone}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

// ─── ModeTogglePill ───────────────────────────────────────────────────────────
// URL-aware: when on /world/[slug] navigates to/from ?view=free instead of
// only toggling context. This makes the header pill the single source of truth
// that actually changes the visible page.

function ModeTogglePill({ compact = false }: { compact?: boolean }) {
  const { learnMode, setLearnMode } = useLearnMode();
  const [toast, setToast] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Detect /world/[slug] — any deeper path is not a world page
  const worldMatch = pathname?.match(/^\/world\/([^/]+)$/);
  const worldSlug = worldMatch ? worldMatch[1] : null;

  const toggle = useCallback(() => {
    const next = learnMode === "flow" ? "classic" : "flow";
    setLearnMode(next);
    setToast(next === "flow" ? "🌊 Flow Mode" : "🔓 Free Mode");
    setTimeout(() => setToast(null), 2000);

    // On a world page: navigate to/from ?view=free so the page actually switches
    if (worldSlug) {
      if (next === "classic") {
        router.push(`/world/${worldSlug}?view=free`);
      } else {
        router.push(`/world/${worldSlug}`);
      }
    }
  }, [learnMode, setLearnMode, worldSlug, router]);

  const isFlow = learnMode === "flow";

  return (
    <div className="relative">
      <button
        onClick={toggle}
        title={isFlow ? "FLOW MODE — click to switch to Free" : "FREE MODE — click to switch to Flow"}
        aria-label={isFlow ? "Currently Flow Mode. Switch to Free Mode" : "Currently Free Mode. Switch to Flow Mode"}
        className={`brutal-border px-3 py-1.5 font-display text-sm brutal-press transition-all flex items-center gap-2 ccd-btn-hover
          ${isFlow ? "bg-acid text-ink hover:bg-sun" : "bg-bone text-ink hover:bg-acid"}`}
      >
        <span>{isFlow ? "🌊" : "🔓"}</span>
        {!compact && <span>{isFlow ? "Flow" : "Free"}</span>}
        {!compact && <span className="opacity-30 text-xs">▼</span>}
      </button>
      {toast && (
        <div className="absolute top-full right-0 mt-2 z-[999] brutal-border bg-ink text-bone px-4 py-2.5 font-display text-xs whitespace-nowrap chunk-shadow animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}

// ─── MoreDropdown ─────────────────────────────────────────────────────────────

function MoreDropdown({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />
      <div
        className="absolute top-full left-0 brutal-border bg-bone z-50 min-w-[220px] chunk-shadow animate-fade-in"
        role="menu" aria-label="More navigation"
      >
        {MORE_SECTIONS.map((section) => (
          <div key={section.heading}>
            <div className="px-4 pt-3 pb-1 font-display text-xs uppercase opacity-40 tracking-widest border-b-2 border-ink/10">
              {section.heading}
            </div>
            {section.links.map((l) => (
              <Link key={l.to} href={l.to} onClick={onClose} role="menuitem"
                className="block px-4 py-2.5 font-display text-sm hover:bg-acid border-b border-ink/10 transition-colors">
                {l.label}
              </Link>
            ))}
            {"includeTheme" in section && section.includeTheme && (
              <div className="px-3 py-2.5 border-t-2 border-ink/20">
                <div className="font-mono text-xs uppercase opacity-40 mb-2">Theme</div>
                <ThemeSwitcher compact />
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

// ─── MobileDrawer ─────────────────────────────────────────────────────────────

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  onSearch: () => void;
}

function MobileDrawer({ open, onClose, onSearch }: MobileDrawerProps) {
  const { progress, heartRefillSeconds } = useProgress();
  const { user } = useAuth();
  const { learnMode } = useLearnMode();
  if (!open) return null;

  const handleSearch = () => { onClose(); onSearch(); };

  const completed = progress.completedMissions;
  const hasMissions = Object.keys(completed).length > 0;
  const allDoneSlugs = Object.entries(completed)
    .filter(([, v]) => v)
    .sort(([, a], [, b]) => (b?.at ?? 0) - (a?.at ?? 0))
    .map(([slug]) => slug);
  const lastSlug = allDoneSlugs[0];
  const lastCtx = lastSlug ? getMissionContext(lastSlug) : null;
  const nextSlug = lastCtx?.path
    ? (() => {
        const idx = lastCtx.path.missionSlugs.indexOf(lastSlug);
        const ns = lastCtx.path.missionSlugs[idx + 1];
        return ns && !completed[ns] ? ns : null;
      })()
    : null;
  const continueSlug = nextSlug ?? (Object.keys(completed).length === 0 ? "what-is-sound" : null);

  return (
    <div className="md:hidden fixed inset-0 z-50 bg-ink/80"
      onClick={onClose} role="dialog" aria-modal="true" aria-label="Navigation menu">
      <div className="absolute right-0 top-0 bottom-0 w-[82%] max-w-[340px] bg-bone brutal-border border-y-0 border-r-0 overflow-y-auto"
        onClick={e => e.stopPropagation()}>

        {/* Drawer header — electric-blue CCD style */}
        <div className="flex items-center justify-between p-3.5 border-b-4 border-ink bg-electric-blue">
          <div className="flex items-center gap-2">
            <Image src="/cats/cat-dj-hero.png" alt="" width={36} height={36}
              className="object-contain drop-shadow-[2px_2px_0_hsl(222_47%_4%)]" />
            <span className="font-display text-lg text-bone">CCD<span className="text-acid">.</span>SCHOOL</span>
          </div>
          <button onClick={onClose} aria-label="Close menu"
            className="brutal-border bg-bone text-ink px-3 py-1.5 font-display text-xs brutal-press">
            ✕
          </button>
        </div>

        {/* Continue shortcut */}
        {continueSlug && (
          <Link href={`/learn/${continueSlug}`} onClick={onClose}
            className="block px-4 py-3.5 border-b-4 border-ink bg-acid text-ink font-display text-base brutal-press hover:bg-sun transition-colors flex items-center gap-3">
            <span className="text-2xl shrink-0">▶</span>
            <div>
              <p className="font-mono text-xs uppercase opacity-55">
                {hasMissions ? "Continue where you left off" : "Start your first lesson"}
              </p>
              <p className="font-display text-base leading-tight mt-0.5">
                {continueSlug.replace(/-/g, " ")}
              </p>
            </div>
          </Link>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 border-b-4 border-ink">
          {[
            { value: `${progress.xp}`, label: "XP" },
            { value: `🔥${progress.streakDays}${progress.streakShield ? "🛡" : ""}`, label: "Streak" },
            { value: `💎${progress.gems}`, label: "Gems" },
          ].map(({ value, label }, i) => (
            <div key={label} className={`p-3.5 text-center${i < 2 ? " border-r-4 border-ink" : ""}`}>
              <div className="font-display text-xl tabular-nums">{value}</div>
              <div className="font-mono text-xs uppercase opacity-45 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Hearts */}
        <div className="px-4 py-3 border-b-4 border-ink flex items-center gap-3">
          <Hearts count={progress.hearts} refillSeconds={heartRefillSeconds} />
          <span className="font-sans text-sm opacity-55">{progress.hearts}/{MAX_HEARTS} hearts</span>
        </div>

        {/* Mode toggle */}
        <div className="px-4 py-3.5 border-b-4 border-ink flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-xs uppercase opacity-45 mb-0.5">Learning Mode</p>
            <p className="font-display text-sm">{learnMode === "flow" ? "🌊 Flow Mode" : "🔓 Free Mode"}</p>
          </div>
          <ModeTogglePill compact />
        </div>

        {/* Search */}
        <button onClick={handleSearch}
          className="w-full text-left px-4 py-3 border-b-4 border-ink hover:bg-acid font-display text-sm flex items-center gap-2.5 transition-colors">
          <SearchIcon /> Search ⌘K
        </button>

        {/* Nav sections */}
        <nav aria-label="Mobile navigation">
          {[
            { heading: "Worlds", links: [
              { to: "/world/fundamentals", label: "🎵 Fundamentals" },
              { to: "/world/dj",           label: "🎧 DJ World"     },
              { to: "/world/producer",     label: "🎛 Producer"     },
            ]},
            { heading: "Learn", links: [
              { to: "/learn",    label: "📚 All Paths"    },
              { to: "/missions", label: "🎯 All Missions" },
              { to: "/daily",    label: "⚡ Daily Challenge" },
            ]},
            { heading: "Practice", links: [
              { to: "/train",     label: "Ear Training"    },
              { to: "/challenge", label: "Daily Challenge" },
              { to: "/review",    label: "Review Session"  },
              { to: "/match",     label: "Flashcard Match" },
            ]},
            { heading: "Reference", links: [
              { to: "/glossary",    label: "Glossary"    },
              { to: "/shortcuts",   label: "Shortcuts"   },
              { to: "/devices",     label: "Devices"     },
              { to: "/signal-flow", label: "Signal Flow" },
            ]},
            { heading: "Account", links: [
              { to: "/profile",     label: "Profile"        },
              { to: "/leaderboard", label: "Leaderboard"    },
              { to: "/shop",        label: "Gem Shop 💎"    },
              { to: "/placement",   label: "Placement Test" },
            ]},
          ].map(({ heading, links }) => (
            <div key={heading}>
              <div className="px-4 pt-3 pb-1 font-display text-xs uppercase opacity-40 tracking-widest border-t-4 border-ink">
                {heading}
              </div>
              {links.map((l) => (
                <Link key={l.to} href={l.to} onClick={onClose}
                  className="block px-4 py-3 border-t border-ink/25 hover:bg-acid font-display text-sm transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Theme */}
        <div className="px-4 py-3.5 border-t-4 border-ink">
          <div className="font-mono text-xs uppercase opacity-40 mb-2.5">Theme</div>
          <ThemeSwitcher compact />
        </div>

        {/* Auth */}
        <div className="p-4 space-y-2 border-t-4 border-ink">
          {user ? (
            <>
              <Link href="/profile" onClick={onClose}
                className="flex items-center gap-2 brutal-border bg-electric-blue text-bone px-3 py-2.5 font-display text-sm text-center brutal-press justify-center chunk-shadow ccd-btn-hover">
                <UserIcon /> Profile
              </Link>
              <button onClick={() => { signOut(); onClose(); }}
                className="w-full brutal-border bg-bone px-3 py-2.5 font-display text-sm text-left brutal-press hover:bg-acid transition-colors">
                Sign out
              </button>
            </>
          ) : (
            <Link href="/login" onClick={onClose}
              className="block brutal-border bg-electric-blue text-bone px-3 py-2.5 font-display text-sm font-medium text-center brutal-press chunk-shadow ccd-btn-hover">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── StreakWarningBanner ──────────────────────────────────────────────────────

function StreakWarningBanner() {
  const { progress, dailyGoalDone } = useProgress();
  const [isAtRisk, setIsAtRisk] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const check = () => {
      const hour = new Date().getHours();
      setIsAtRisk(progress.streakDays > 0 && !dailyGoalDone && hour >= 20);
    };
    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, [progress.streakDays, dailyGoalDone]);

  if (!isAtRisk || dismissed) return null;

  return (
    <div className="bg-hot text-bone px-4 py-2.5 flex items-center justify-between gap-3 border-b-4 border-ink">
      <div className="flex items-center gap-2.5 font-sans text-sm">
        <span className="text-base">🔥</span>
        <span>
          Your <strong>{progress.streakDays}-day streak</strong> is at risk!{" "}
          {progress.streakShield ? "Your shield will protect it tonight." : "Do at least one lesson before midnight."}
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <a href="/worlds"
          className="brutal-border bg-bone text-hot px-3 py-1.5 font-display text-xs brutal-press hover:bg-acid hover:text-ink transition-colors">
          Learn now →
        </a>
        <button onClick={() => setDismissed(true)} aria-label="Dismiss"
          className="font-mono text-xs opacity-55 hover:opacity-100">✕</button>
      </div>
    </div>
  );
}

// ─── Main Header ──────────────────────────────────────────────────────────────

export function Header() {
  const { progress, heartRefillSeconds } = useProgress();
  const { user } = useAuth();
  const [moreOpen,   setMoreOpen]   = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setMoreOpen(false); setDrawerOpen(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const openSearch = useCallback(
    () => window.dispatchEvent(new Event(PALETTE_OPEN_EVENT)),
    []
  );

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
    : null;

  return (
    <header className="border-b-4 border-ink bg-bone sticky top-0 z-40" role="banner">

      {/* ── Main bar ── */}
      <div className="flex items-stretch h-14 md:h-16">

        {/* Logo — electric-blue CCD style */}
        <Link
          href="/"
          className="border-r-4 border-ink px-3 md:px-5 flex items-center gap-2 font-display text-base md:text-lg bg-electric-blue text-bone hover:bg-ink transition-colors shrink-0"
          aria-label="CCD.SCHOOL home"
        >
          <Image
            src="/cats/cat-dj-hero.png"
            alt=""
            width={28}
            height={28}
            onClick={trackCatClick}
            className="object-contain drop-shadow-[2px_2px_0_hsl(222_47%_4%)] hidden sm:block cursor-pointer hover:scale-110 transition-transform"
          />
          <span className="text-bone">CATS CAN</span><span className="text-acid"> DANCE</span>
        </Link>

        {/* Primary nav — desktop */}
        <nav className="hidden md:flex items-stretch font-display text-sm" aria-label="Main navigation">
          {PRIMARY_NAV.map((l) => (
            <Link key={`${l.to}-${l.label}`} href={l.to}
              className="px-4 flex items-center border-r-4 border-ink hover:bg-acid transition-colors whitespace-nowrap">
              {l.label}
            </Link>
          ))}
          <div className="relative flex items-stretch">
            <button
              onClick={() => setMoreOpen((o) => !o)}
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              className="px-4 flex items-center border-r-4 border-ink hover:bg-acid transition-colors font-display text-sm whitespace-nowrap">
              More ▾
            </button>
            <MoreDropdown open={moreOpen} onClose={() => setMoreOpen(false)} />
          </div>
        </nav>

        <div className="flex-1" />

        {/* Right strip — desktop */}
        <div className="hidden md:flex items-center gap-2 px-3">
          <button onClick={openSearch} title="Search (⌘K)" aria-label="Open search"
            className="brutal-border bg-bone px-2.5 py-1.5 hover:bg-acid flex items-center gap-1.5 font-display text-sm transition-colors brutal-press ccd-btn-hover">
            <SearchIcon />
            <span className="hidden lg:inline font-mono text-xs opacity-55">⌘K</span>
          </button>

          <Hearts count={progress.hearts} refillSeconds={heartRefillSeconds} />
          <XpStreakBadge />
          <ModeTogglePill />

          {user ? (
            <Link href="/profile" aria-label="View profile" title={user.name ?? "Profile"}
              className="brutal-border bg-bone w-10 h-10 flex items-center justify-center font-display text-xs hover:bg-acid transition-colors brutal-press ccd-btn-hover">
              {initials ?? <UserIcon />}
            </Link>
          ) : (
            <Link href="/login"
              className="brutal-border bg-electric-blue text-bone px-3 py-1.5 font-display text-sm brutal-press chunk-shadow hover:bg-ink transition-colors ccd-btn-hover">
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile strip — decluttered: just streak pill + search + menu */}
        <div className="md:hidden flex items-center gap-1.5 px-3">
          <span className="brutal-border bg-ink text-bone px-2.5 py-1.5 font-display text-xs tabular-nums leading-none">
            🔥{progress.streakDays}
          </span>
          <button onClick={openSearch} aria-label="Search"
            className="brutal-border bg-bone px-3 py-2 flex items-center brutal-press hover:bg-acid transition-colors">
            <SearchIcon />
          </button>
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu" aria-expanded={drawerOpen}
            className="brutal-border bg-electric-blue text-bone px-3 py-2 font-display text-xl leading-none">
            ≡
          </button>
        </div>
      </div>

      <StreakWarningBanner />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onSearch={openSearch} />
    </header>
  );
}
