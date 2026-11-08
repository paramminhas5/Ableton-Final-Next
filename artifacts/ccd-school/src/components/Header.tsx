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

import { RankMark } from "@/components/m1/parts";
import Link from "next/link";
import { CCD_LINKS } from "@/lib/ccd";
import Image from "next/image";
import { useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Icon, Icon as M1Icon, Key as M1Key, Screen as M1Screen, Silk as M1Silk, WORLD_LED } from "@/components/m1/controls";
import { worldDone as worldDoneOf } from "@/lib/worldOrder";
import { CatMark, WeekDots } from "@/components/m1/shell";
import { useProgress, DAILY_GOAL_XP, MAX_HEARTS } from "@/lib/progress";
import { useAuth, signOut } from "@/lib/auth";
import { allWorldRanks, WORLD_NAME } from "@/lib/worldRanks";
import { PALETTE_OPEN_EVENT } from "@/lib/palette";
import { useLearnMode } from "@/lib/mode";
import { getMissionContext } from "@/lib/missionContext";
import { trackCatClick } from "@/components/EasterEggs";


const PRIMARY_NAV = [
  { to: "/worlds",    label: "Worlds"   },
  { to: "/wiki",      label: "Wiki"     },
  { to: "/learn",     label: "Paths"    },
  { to: "/dashboard", label: "Progress" },
] as const;

const MORE_SECTIONS = [
  {
    heading: "PRACTICE",
    links: [
      { to: "/gym",       label: "Ear Gym (5 min)"   },
      { to: "/beat",      label: "First Beat" },
      { to: "/build",     label: "Build a Set" },
      { to: "/link",      label: "Check my Live Set" },
      { to: "/train",     label: "Ear Training"      },
      { to: "/challenge", label: "Daily Challenge" },
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
      { to: "/atlas",       label: "Device Atlas" },
      { to: "/plugins",     label: "Plugin Guide" },
      { to: "/setup",       label: "Setup Guide"  },
      { to: "/signal-flow", label: "Signal Flow"  },
    ],
  },
  {
    heading: "ACCOUNT",
    links: [
      { to: "/profile",     label: "Profile & Trophies" },
      { to: "/leaderboard", label: "Leaderboard"        },
      { to: "/shop",        label: "Gem Shop"         },
      { to: "/placement",   label: "find your level"    },
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
            className={`inline-flex leading-none transition-all ${i < count ? "text-hot" : "opacity-20"}`}>
            <Icon name="heart" small />
          </span>
        ))}
        {!full && secs > 0 && (
          <span className="font-mono text-xs opacity-70 ml-1 tabular-nums">{hh}h{mm}</span>
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
              <p className="font-display text-lg mb-2">Hearts</p>
              <p className="font-sans text-sm leading-relaxed opacity-70">
                You have <strong>{count}/{MAX_HEARTS}</strong> hearts. Each wrong
                answer in <strong>Flow Mode</strong> costs 1 heart.
              </p>
              {!full && (
                <p className="font-sans text-xs mt-2 opacity-70">
                  Next refill in {hh}h{mm}m · 1 heart per 4 hours
                </p>
              )}
              {full && (
                <p className="font-sans text-xs mt-2 text-acid font-bold">Full. You&apos;re good to go</p>
              )}
            </div>
            <div className="border-t-4 border-ink px-4 py-2.5">
              <button onClick={dismissTooltip}
                className="font-mono text-xs uppercase opacity-70 hover:opacity-100 transition-opacity">
                Got it
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
  heartRefillSeconds: number;
  onClose: () => void;
}

function XpStreakPopover({ progress, dailyGoalPct, dailyGoalDone, heartRefillSeconds, onClose }: XpStreakPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const top = allWorldRanks(progress.completedMissions)[0];
  const { current: rank, next, progress: rankPct, idx: rankIdx } = top;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);



  return (
    <div ref={ref}
      className="absolute right-0 top-full mt-2 z-[60] brutal-border bg-bone chunk-shadow min-w-[230px] animate-fade-in"
      role="dialog" aria-label="XP and streak details">
      <div className="px-4 py-3 border-b-4 border-ink flex items-center gap-3">
        <RankMark idx={rankIdx} size={34} />
        <div className="flex-1">
          <p className="font-display text-base">{rank.name}</p>
          <p className="font-mono text-xs opacity-70">{WORLD_NAME[top.world]} · {rank.line}</p>
        </div>
      </div>
      <div className="px-4 py-3 border-b-4 border-ink">
        <div className="flex justify-between items-baseline mb-2">
          <span className="font-mono text-xs opacity-70">next rank</span>
          <span className="font-mono text-xs tabular-nums">{next ? next.name : "top"}</span>
        </div>
        <div className="w-full bg-ink/10 h-2 overflow-hidden border-2 border-ink">
          <div className="bg-acid h-full transition-all" style={{ width: `${rankPct * 100}%` }} />
        </div>
        <p className="font-mono text-xs opacity-70 mt-1.5 tabular-nums">{progress.xp} XP total</p>
      </div>
      <div className="px-4 py-3 border-b-4 border-ink flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase opacity-70 mb-1">Streak</p>
          <p className="font-display text-lg">
            <Icon name="flame" small /> {progress.streakDays}
            {progress.streakShield && <span className="ml-1 inline-flex"><Icon name="shield" small /></span>}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-xs uppercase opacity-70 mb-1">Gems</p>
          <p className="font-display text-lg inline-flex items-center gap-1"><Icon name="gem" small /> {progress.gems}</p>
        </div>
      </div>
      {/* Hearts row: moved from header desktop strip */}
      <div className="px-4 py-3 border-b-4 border-ink flex items-center gap-3">
        <Hearts count={progress.hearts} refillSeconds={heartRefillSeconds} />
        <div>
          <p className="font-mono text-xs uppercase opacity-70">Hearts</p>
          <p className="font-sans text-sm">{progress.hearts}/{MAX_HEARTS} remaining</p>
        </div>
      </div>
      <div className="px-4 py-3 flex items-center gap-3">
        <GoalRing pct={dailyGoalPct} done={dailyGoalDone} />
        <div>
          <p className="font-mono text-xs uppercase opacity-70">Daily goal</p>
          <p className="font-sans text-sm tabular-nums">
            {progress.dailyXp} / {DAILY_GOAL_XP} XP
            {dailyGoalDone && <span className="ml-1 inline-flex"><Icon name="check" small /></span>}
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
  const { progress, dailyGoalPct, dailyGoalDone, heartRefillSeconds } = useProgress();
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
        className="brutal-border bg-ink text-bone px-3 py-1.5 font-display text-sm brutal-press flex items-center gap-2.5 hover:bg-electric-blue transition-colors ccd-btn-hover ccd-jitter ccd-glow-pulse"
      >
        <span className={`flex items-center gap-1 transition-all duration-200 ${streakFlash ? "scale-125 text-acid" : ""}`}>
          <span className="inline-flex"><Icon name="flame" small /></span>
          <span className="font-display text-base leading-none tabular-nums">{streakDisplay}</span>
        </span>
        <span className="opacity-20 text-xs">|</span>
        <span className={`flex items-center gap-1 transition-all duration-200 ${xpFlash ? "scale-110 text-acid" : ""}`}>
          <span className="opacity-70 text-xs font-mono">XP</span>
          <span className="font-display text-base leading-none tabular-nums">{xpDisplay}</span>
        </span>
        <GoalRing pct={dailyGoalPct} done={dailyGoalDone} />
      </button>
      {open && (
        <XpStreakPopover
          progress={progress}
          dailyGoalPct={dailyGoalPct}
          dailyGoalDone={dailyGoalDone}
          heartRefillSeconds={heartRefillSeconds}
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
    setToast(next === "flow" ? "Flow mode" : "Free mode");
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
        title={isFlow ? "FLOW MODE: click to switch to Free" : "FREE MODE: click to switch to Flow"}
        aria-label={isFlow ? "Currently Flow Mode. Switch to Free Mode" : "Currently Free Mode. Switch to Flow Mode"}
        className={`brutal-border px-3 py-1.5 font-display text-sm brutal-press transition-all flex items-center gap-2 ccd-btn-hover ccd-jitter ccd-glow-pulse
          ${isFlow ? "bg-acid text-ink hover:bg-sun" : "bg-bone text-ink hover:bg-acid"}`}
      >
        <span className="inline-flex"><Icon name={isFlow ? "loop" : "lock"} small /></span>
        {!compact && <span>{isFlow ? "Flow" : "Free"}</span>}
        {!compact && <span className="opacity-70 text-xs">▼</span>}
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
            <div className="px-4 pt-3 pb-1 font-display text-xs uppercase opacity-70 tracking-widest border-b-2 border-ink/10">
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
                <div className="font-mono text-xs uppercase opacity-70 mb-2">Theme</div>
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
  const { progress, missionsNeedingReview } = useProgress();
  const { user } = useAuth();
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  const due = missionsNeedingReview.length;
  const keys: { href: string; label: string; icon: ReactNode; lit?: boolean }[] = [
    { href: "/daily", label: "daily", icon: <M1Icon name="sun" /> },
    { href: "/review", label: "review", icon: <M1Icon name="loop" />, lit: due > 0 },
    { href: "/leaderboard", label: "league", icon: <svg viewBox="0 0 24 24" className="m1-ico" aria-hidden><path d="M6 20V12M12 20V5M18 20v-5" /></svg> },
    { href: "/glossary", label: "words", icon: <M1Icon name="library" /> },
    { href: "/shortcuts", label: "shortcuts", icon: <M1Icon name="keys" /> },
    { href: "/setup", label: "setup", icon: <svg viewBox="0 0 24 24" className="m1-ico" aria-hidden><path d="M9 3v6M15 3v6M6 9h12v3a6 6 0 0 1-12 0zM12 18v3" /></svg> },
    { href: "/upgrade", label: "pro", icon: <svg viewBox="0 0 24 24" className="m1-ico" aria-hidden><path d="m12 4 2.4 5 5.6.8-4 3.9.9 5.6L12 16.6 7.1 19.3l.9-5.6-4-3.9 5.6-.8z" /></svg> },
    { href: "/settings", label: "settings", icon: <svg viewBox="0 0 24 24" className="m1-ico" aria-hidden><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></svg> },
  ];
  const worlds = (["fundamentals", "producer", "dj"] as const).map(w => ({ w, ...worldDoneOf(w, progress.completedMissions) }));
  return (
    <div role="dialog" aria-modal="true" aria-label="Menu" className="m1-face" style={{ position: "fixed", inset: 0, zIndex: 70, overflowY: "auto" }}>
      <div className="m1-page" style={{ paddingBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <span style={{ fontSize: 22, fontWeight: 500 }}>menu</span>
          <M1Key onClick={onClose} ariaLabel="Close the menu" style={{ width: 46, height: 46 }}><M1Icon name="close" /></M1Key>
        </div>
        <M1Screen>
          <button type="button" onClick={() => { onClose(); onSearch(); }} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", background: "none", border: 0, color: "var(--disp-sub)", font: "400 19px Outfit, system-ui", padding: 0, cursor: "pointer", textAlign: "left" }}>
            <M1Icon name="search" />lessons, devices, words
          </button>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 14 }}>
            {["sidechain", "warp", "eq", "beatmatch"].map(t => (
              <button key={t} type="button" className="m1-tag" onClick={() => { onClose(); onSearch(); }} style={{ height: 26, padding: "0 10px", borderRadius: 13, borderColor: "#3A3A3F", color: "var(--disp-ink)", cursor: "pointer", background: "none" }}>{t}</button>
            ))}
          </div>
          <div className="m1-ss" style={{ marginTop: 10 }}>try one</div>
        </M1Screen>
        <M1Silk label="go to" right={due ? `the lit one has ${due} due` : undefined} />
        <div className="m1-g">
          {keys.map(k => (
            <M1Key key={k.href} href={k.href} label={k.label} led={k.lit ? "var(--led-mint)" : null} ariaLabel={k.label}>{k.icon}</M1Key>
          ))}
        </div>
        <M1Silk label="worlds" />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {worlds.map(x => (
            <Link key={x.w} href={`/world/${x.w}`} onClick={onClose} className="m1-m is-wide" style={{ height: 56, justifyContent: "flex-start", flexDirection: "row", gap: 14, padding: "0 16px", textDecoration: "none", color: "var(--ink)" }}>
              <span style={{ width: 18, height: 4, borderRadius: 2, background: WORLD_LED[x.w], boxShadow: `0 0 5px ${WORLD_LED[x.w]}` }} />
              <span style={{ flex: 1, fontSize: 16, fontWeight: 500 }}>{x.w === "fundamentals" ? "basics" : x.w}</span>
              <span style={{ fontSize: 12, color: "var(--sub)" }}>{x.done} of {x.total}</span>
            </Link>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 28, marginTop: 40, fontSize: 13 }}>
          <Link href="/setup" onClick={onClose} className="m1-eng" style={{ minHeight: 0 }}>help</Link>
          {user
            ? <button type="button" className="m1-eng" onClick={() => signOut()} style={{ background: "none", border: 0, font: "inherit", cursor: "pointer", minHeight: 0 }}>sign out</button>
            : <Link href="/login" onClick={onClose} className="m1-eng" style={{ minHeight: 0 }}>sign in</Link>}
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
        <span className="text-base inline-flex"><Icon name="flame" small /></span>
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
          className="font-mono text-xs opacity-70 hover:opacity-100"><Icon name="close" small /></button>
      </div>
    </div>
  );
}

// ─── Main Header ──────────────────────────────────────────────────────────────

export function Header() {
  const pathname = usePathname() ?? "/";
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

  // A lesson is one instrument screen: it carries its own close key, progress and hearts.
  if (/^\/learn\/(?!world\/)[^/]+$/.test(pathname)) return null;
  // You and the library carry their own title bar (boards ZYou, ZLibrary).
  if (pathname === "/profile" || pathname === "/atlas" || pathname === "/login" || pathname.startsWith("/device/")) return null;

  if (pathname === "/dashboard" || pathname === "/worlds" || pathname === "/learn" || pathname.startsWith("/studio") || pathname.startsWith("/dj") || /^\/(learn\/)?world\/(fundamentals|dj|producer)$/.test(pathname)) {
    return (
      <>
        <StreakWarningBanner />
        <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onSearch={openSearch} />
      </>
    );
  }

  return (
    <header role="banner" className="m1-page" style={{ paddingBottom: 0, maxWidth: 1180, width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 44, gap: 10 }}>
        <Link href="/dashboard" aria-label="ccd school home" style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--ink)", textDecoration: "none", minHeight: 0 }}>
          <CatMark />
          <span className="m1-t15" style={{ fontWeight: 600, whiteSpace: "nowrap" }}>ccd school</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="hidden sm:flex"><WeekDots days={progress.streakDays} /></span>
          <span style={{ fontSize: 15, fontWeight: 300, fontVariantNumeric: "tabular-nums", marginRight: 4 }}>{progress.xp}<span className="m1-t11" style={{ marginLeft: 3 }}>xp</span></span>
          <button type="button" onClick={openSearch} aria-label="Search" className="m1-m" style={{ width: 40, height: 40, borderRadius: 10 }}><Icon name="search" small /></button>
          <span className="hidden sm:inline-flex"><ThemeSwitcher compact /></span>
          {user ? (
            <Link href="/profile" aria-label="Profile" className="m1-m" style={{ width: 40, height: 40, borderRadius: 10, fontSize: 12, fontWeight: 600 }}>{initials ?? <Icon name="user" small />}</Link>
          ) : (
            <span className="hidden sm:inline"><Link href="/login" className="m1-m is-wide" style={{ height: 40, padding: "0 12px", borderRadius: 10, fontSize: 13, fontWeight: 500, whiteSpace: "nowrap" }}>sign in</Link></span>
          )}
          <button type="button" onClick={() => setDrawerOpen(true)} aria-label="Open menu" aria-expanded={drawerOpen} className="m1-m" style={{ width: 40, height: 40, borderRadius: 10 }}><Icon name="menu" small /></button>
        </div>
      </div>
      <StreakWarningBanner />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onSearch={openSearch} />
    </header>
  );
}
