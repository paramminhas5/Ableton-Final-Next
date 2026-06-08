"use client";
/**
 * Header v3 — Streamlined Brutalista
 *
 * Desktop (left → right):
 *   Logo | Learn · Worlds · Progress | More ▾ | <flex spacer> |
 *   Search | Hearts | XP+Streak badge (popover) | Mode pill | Profile/Sign in
 *
 * The old marquee ticker is replaced with a single 1px separator line.
 * The right strip is trimmed to exactly 5 elements.
 * ThemeSwitcher is accessible via the More ▾ → ACCOUNT section.
 *
 * Mobile: ≡ drawer with compact stats, hearts, mode toggle, and
 * categorised nav sections.
 */

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
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

const ALL_MISSIONS = [...FOUNDATIONS_MISSIONS, ...DJ_WORLD_MISSIONS, ...MISSIONS];

// ─── Nav data ─────────────────────────────────────────────────────────────────

/** Primary nav — 3 items max; deliberately short for quick scanning */
const PRIMARY_NAV = [
  { to: "/learn",      label: "Learn"    },
  { to: "/worlds",     label: "Worlds"   },
  { to: "/dashboard",  label: "Progress" },
] as const;

/** Sections for the "More ▾" dropdown */
const MORE_SECTIONS = [
  {
    heading: "PRACTICE",
    links: [
      { to: "/train",    label: "Ear Training"       },
      { to: "/challenge",label: "Daily Challenge ⚡"  },
      { to: "/match",    label: "Flashcard Match"     },
      { to: "/review",   label: "Review Session"      },
    ],
  },
  {
    heading: "REFERENCE",
    links: [
      { to: "/missions",     label: "All Missions"  },
      { to: "/glossary",     label: "Glossary"      },
      { to: "/shortcuts",    label: "Shortcuts"     },
      { to: "/devices",      label: "Devices"       },
      { to: "/signal-flow",  label: "Signal Flow"   },
    ],
  },
  {
    heading: "ACCOUNT",
    links: [
      { to: "/profile",    label: "Profile & Trophies" },
      { to: "/leaderboard",label: "Leaderboard"        },
      { to: "/shop",       label: "Gem Shop 💎"         },
      { to: "/placement",  label: "Placement Test"     },
    ],
    // NOTE: "Settings / Theme" is rendered separately as a ThemeSwitcher button
    includeTheme: true,
  },
] as const;



// ─── Shared tiny SVG icons ────────────────────────────────────────────────────

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

// ─── GoalRing — SVG arc showing daily XP progress ────────────────────────────

function GoalRing({ pct, done }: { pct: number; done: boolean }) {
  const r    = 8;
  const circ = 2 * Math.PI * r;
  return (
    <svg width="20" height="20" viewBox="0 0 22 22"
      aria-label={`Daily goal ${Math.round(pct * 100)}%`} role="img">
      <circle cx="11" cy="11" r={r} fill="none" stroke="currentColor"
        strokeWidth="2.5" opacity="0.18" />
      <circle cx="11" cy="11" r={r} fill="none"
        stroke={done ? "#7B2FFF" : "#C6FF00"}
        strokeWidth="2.5"
        strokeDasharray={`${circ * pct} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 11 11)"
        style={{ transition: "stroke-dasharray 0.5s ease" }}
      />
    </svg>
  );
}



// ─── Hearts — 5 ♥ with live countdown timer + first-time tooltip ─────────────

const HEARTS_TOOLTIP_KEY = "ccd.hearts_header_seen";

function Hearts({ count, refillSeconds }: { count: number; refillSeconds: number }) {
  const [secs, setSecs] = useState(refillSeconds);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [hasSeenTooltip, setHasSeenTooltip] = useState(true); // assume seen until hydrated

  useEffect(() => {
    // Hydrate — check if user has seen the header hearts tooltip
    try {
      setHasSeenTooltip(!!sessionStorage.getItem(HEARTS_TOOLTIP_KEY));
    } catch {}
  }, []);

  useEffect(() => setSecs(refillSeconds), [refillSeconds]);
  useEffect(() => {
    if (count >= MAX_HEARTS || secs <= 0) return;
    const id = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
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
          setTooltipOpen(o => !o);
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
            className={`text-sm leading-none transition-all ${i < count ? "text-hot" : "opacity-20"}`}>
            ♥
          </span>
        ))}
        {!full && secs > 0 && (
          <span className="font-mono text-[8px] opacity-50 ml-0.5 tabular-nums">
            {hh}h{mm}
          </span>
        )}
        {/* Pulsing dot for first-time users who haven't clicked yet */}
        {!hasSeenTooltip && (
          <span className="ml-1 w-1.5 h-1.5 rounded-full bg-acid animate-ping absolute -top-0.5 -right-0.5" aria-hidden />
        )}
      </button>

      {/* Tooltip panel */}
      {tooltipOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={dismissTooltip} aria-hidden />
          <div className="absolute right-0 top-full mt-2 z-50 brutal-border bg-bone brutal-shadow w-56">
            <div className="px-4 pt-3 pb-2">
              <div className="font-display text-base mb-1">♥ Hearts</div>
              <div className="font-mono text-[10px] leading-relaxed opacity-70">
                You have <strong>{count}/{MAX_HEARTS}</strong> hearts.
                Each wrong answer in <strong>Flow Mode</strong> costs 1 heart.
              </div>
              {!full && (
                <div className="font-mono text-[10px] mt-1.5 opacity-60">
                  Next refill in {hh}h{mm}m · 1 heart per 4 hours
                </div>
              )}
              {full && (
                <div className="font-mono text-[10px] mt-1.5 text-acid font-bold">
                  ♥ Full — you&apos;re good to go
                </div>
              )}
            </div>
            <div className="brutal-border border-x-0 border-b-0 px-4 py-2">
              <button
                onClick={dismissTooltip}
                className="font-mono text-[9px] uppercase opacity-50 hover:opacity-100 transition-opacity"
              >
                Got it ✕
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}



// ─── XpStreakPopover — small panel opened by clicking the combo badge ─────────

interface XpStreakPopoverProps {
  progress: ReturnType<typeof useProgress>["progress"];
  dailyGoalPct: number;
  dailyGoalDone: boolean;
  onClose: () => void;
}

function XpStreakPopover({ progress, dailyGoalPct, dailyGoalDone, onClose }: XpStreakPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { current: rank, next, progress: rankPct } = rankFor(progress.xp);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const xpToNext = next ? next.minXp - progress.xp : 0;

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 z-[60] brutal-border bg-bone brutal-shadow min-w-[220px]"
      role="dialog"
      aria-label="XP and streak details"
    >
      {/* Rank row */}
      <div className="px-4 py-3 brutal-border border-x-0 border-t-0 flex items-center gap-3">
        <span className="text-2xl leading-none">{rank.emoji}</span>
        <div className="flex-1">
          <div className="font-display text-sm uppercase">{rank.name}</div>
          <div className="font-mono text-[9px] uppercase opacity-50">{rank.tagline}</div>
        </div>
      </div>

      {/* XP progress to next rank */}
      <div className="px-4 py-3 brutal-border border-x-0 border-t-0">
        <div className="flex justify-between items-baseline mb-1.5">
          <span className="font-mono text-[9px] uppercase opacity-60">XP to next rank</span>
          <span className="font-mono text-[9px] tabular-nums">{xpToNext > 0 ? `${xpToNext} left` : "MAX"}</span>
        </div>
        <div className="w-full bg-ink/10 h-2 brutal-border">
          <div
            className="bg-acid h-full transition-all"
            style={{ width: `${rankPct * 100}%` }}
          />
        </div>
        <div className="font-mono text-[9px] opacity-50 mt-1 tabular-nums">{progress.xp} XP total</div>
      </div>

      {/* Streak + shield */}
      <div className="px-4 py-3 brutal-border border-x-0 border-t-0 flex items-center justify-between">
        <div>
          <div className="font-mono text-[9px] uppercase opacity-60 mb-0.5">Streak</div>
          <div className="font-display text-lg">
            🔥 {progress.streakDays}
            {progress.streakShield && <span className="ml-1 text-sm">🛡</span>}
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[9px] uppercase opacity-60 mb-0.5">Gems</div>
          <div className="font-display text-lg">💎 {progress.gems}</div>
        </div>
      </div>

      {/* Daily goal ring */}
      <div className="px-4 py-3 flex items-center gap-3">
        <GoalRing pct={dailyGoalPct} done={dailyGoalDone} />
        <div>
          <div className="font-mono text-[9px] uppercase opacity-60">Daily goal</div>
          <div className="font-mono text-[10px] tabular-nums">
            {progress.dailyXp} / {DAILY_GOAL_XP} XP
            {dailyGoalDone && <span className="ml-1 text-[9px]">✓</span>}
          </div>
        </div>
      </div>
    </div>
  );
}



// ─── XpStreakBadge — compact combo badge that opens the popover ───────────────

function XpStreakBadge() {
  const { progress, dailyGoalPct, dailyGoalDone } = useProgress();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        title="View XP, streak and daily goal"
        className="brutal-border bg-ink text-bone px-2.5 py-1 font-mono text-[10px] uppercase tabular-nums brutal-press flex items-center gap-1.5 hover:bg-volt transition-colors"
      >
        🔥{progress.streakDays}
        <span className="opacity-40">·</span>
        {progress.xp}XP
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



// ─── ModeTogglePill — FLOW MODE / FREE MODE ──────────────────────────────────

function ModeTogglePill({ compact = false }: { compact?: boolean }) {
  const { learnMode, setLearnMode } = useLearnMode();
  const [toast, setToast] = useState<string | null>(null);

  const toggle = useCallback(() => {
    const next = learnMode === "flow" ? "classic" : "flow";
    setLearnMode(next);
    setToast(
      next === "flow"
        ? "🌊 FLOW MODE — locked in, hearts on, sequential"
        : "🔓 FREE MODE — all lessons open"
    );
    setTimeout(() => setToast(null), 2800);
  }, [learnMode, setLearnMode]);

  const isPath = learnMode === "flow";

  return (
    <div className="relative">
      <button
        onClick={toggle}
        title={isPath
          ? "FLOW MODE — click to switch to Free Mode"
          : "FREE MODE — click to switch to Flow Mode"}
        aria-label={isPath ? "Currently in FLOW MODE. Click to switch to FREE MODE" : "Currently in FREE MODE. Click to switch to FLOW MODE"}
        className={`brutal-border px-3 py-1.5 font-mono text-[10px] uppercase brutal-press transition-all flex items-center gap-2 font-bold
          ${isPath
            ? "bg-acid text-ink hover:bg-sun border-2"
            : "bg-bone text-ink hover:bg-sun border-2"}`}
      >
        <span className="text-sm">{isPath ? "🌊" : "🔓"}</span>
        {!compact && (
          <span className="tracking-wider">{isPath ? "FLOW" : "FREE"}</span>
        )}
        {!compact && (
          <span className="opacity-40 text-[8px]">▼</span>
        )}
      </button>
      {toast && (
        <div className="absolute top-full right-0 mt-2 z-[999] brutal-border bg-ink text-bone px-4 py-2.5 font-mono text-[10px] uppercase whitespace-nowrap brutal-shadow animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}



// ─── MoreDropdown — sectioned "More ▾" menu ──────────────────────────────────

interface MoreDropdownProps {
  open: boolean;
  onClose: () => void;
}

function MoreDropdown({ open, onClose }: MoreDropdownProps) {
  if (!open) return null;

  return (
    <>
      {/* Transparent backdrop to catch outside clicks */}
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />

      <div
        className="absolute top-full left-0 brutal-border bg-bone z-50 min-w-[220px] brutal-shadow"
        role="menu"
        aria-label="More navigation"
      >
        {MORE_SECTIONS.map((section) => (
          <div key={section.heading}>
            {/* Section header */}
            <div className="px-4 pt-3 pb-1 font-mono text-[9px] uppercase opacity-50 tracking-widest">
              {section.heading}
            </div>

            {/* Section links */}
            {section.links.map((l) => (
              <Link
                key={l.to}
                href={l.to}
                onClick={onClose}
                role="menuitem"
                className="block px-4 py-2 font-mono text-[11px] uppercase hover:bg-acid brutal-border border-x-0 border-t-0 transition-colors"
              >
                {l.label}
              </Link>
            ))}

            {/* Theme switcher injected at the bottom of ACCOUNT */}
            {"includeTheme" in section && section.includeTheme && (
              <div className="px-3 py-2 brutal-border border-x-0 border-t-0">
                <div className="font-mono text-[9px] uppercase opacity-50 mb-1.5">Settings / Theme</div>
                <ThemeSwitcher compact />
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}



// ─── MobileDrawer — full-screen side panel ────────────────────────────────────

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

  // Compute "continue" slug for quick-resume
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
    <div
      className="md:hidden fixed inset-0 z-50 bg-ink/80"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
    >
      <div
        className="absolute right-0 top-0 bottom-0 w-[82%] max-w-[340px] bg-bone brutal-border border-y-0 border-r-0 overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between p-3 brutal-border border-x-0 border-t-0 bg-acid">
          <span className="font-display text-lg">CCD.SCHOOL</span>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="brutal-border bg-ink text-bone px-3 py-1 font-mono text-xs brutal-press"
          >
            ✕
          </button>
        </div>

        {/* ▶ Continue shortcut — shown only if user has progress */}
        {continueSlug && (
          <Link
            href={`/learn/${continueSlug}`}
            onClick={onClose}
            className="block px-4 py-3 brutal-border border-x-0 border-t-0 bg-acid text-ink font-display text-base brutal-press hover:bg-sun transition-colors flex items-center gap-3"
          >
            <span className="text-2xl shrink-0">▶</span>
            <div>
              <div className="font-mono text-[9px] uppercase opacity-60">
                {hasMissions ? "CONTINUE WHERE YOU LEFT OFF" : "START YOUR FIRST LESSON"}
              </div>
              <div className="font-display text-base leading-tight">
                {continueSlug.replace(/-/g, " ")}
              </div>
            </div>
          </Link>
        )}

        {/* Compact stats row — 3 columns */}
        <div className="grid grid-cols-3 brutal-border border-x-0 border-t-0">
          {[
            { value: `${progress.xp}`, label: "XP" },
            { value: `🔥${progress.streakDays}${progress.streakShield ? "🛡" : ""}`, label: "Streak" },
            { value: `💎${progress.gems}`, label: "Gems" },
          ].map(({ value, label }, i) => (
            <div key={label}
              className={`p-3 text-center${i < 2 ? " brutal-border border-y-0 border-l-0" : ""}`}>
              <div className="font-display text-xl tabular-nums">{value}</div>
              <div className="font-mono text-[8px] uppercase opacity-60">{label}</div>
            </div>
          ))}
        </div>

        {/* Hearts row */}
        <div className="px-4 py-3 brutal-border border-x-0 border-t-0 flex items-center gap-3">
          <Hearts count={progress.hearts} refillSeconds={heartRefillSeconds} />
          <span className="font-mono text-[9px] uppercase opacity-60">
            {progress.hearts}/{MAX_HEARTS} hearts
          </span>
        </div>

        {/* Mode toggle row */}
        <div className="px-4 py-3 brutal-border border-x-0 border-t-0 flex items-center justify-between gap-3">
          <div>
            <div className="font-mono text-[9px] uppercase opacity-60 mb-0.5">Learning Mode</div>
            <div className="font-mono text-[10px] uppercase font-bold">
              {learnMode === "flow" ? "🌊 FLOW MODE" : "🔓 FREE MODE"}
            </div>
            <div className="font-mono text-[8px] uppercase opacity-50 mt-0.5 leading-tight">
              {learnMode === "flow" ? "Sequential · hearts on" : "All open · no hearts"}
            </div>
          </div>
          <ModeTogglePill compact />
        </div>

        {/* Search */}
        <button
          onClick={handleSearch}
          className="w-full text-left px-4 py-3 brutal-border border-x-0 border-t-0 hover:bg-sun font-mono text-[11px] uppercase flex items-center gap-2 transition-colors"
        >
          <SearchIcon /> Search ⌘K
        </button>

        {/* Nav sections */}
        <nav aria-label="Mobile navigation">
          {[
            {
              heading: "LEARN",
              links: [
                { to: "/world/fundamentals", label: "Fundamentals" },
                { to: "/world/dj",           label: "DJ World"     },
                { to: "/world/producer",     label: "Producer"     },
                { to: "/missions",           label: "All Missions" },
              ],
            },
            {
              heading: "PRACTICE",
              links: [
                { to: "/train",    label: "Ear Training"    },
                { to: "/challenge",label: "Daily Challenge" },
                { to: "/review",   label: "Review Session"  },
                { to: "/match",    label: "Flashcard Match" },
              ],
            },
            {
              heading: "REFERENCE",
              links: [
                { to: "/glossary",    label: "Glossary"    },
                { to: "/shortcuts",   label: "Shortcuts"   },
                { to: "/devices",     label: "Devices"     },
                { to: "/signal-flow", label: "Signal Flow" },
              ],
            },
            {
              heading: "ACCOUNT",
              links: [
                { to: "/profile",     label: "Profile"     },
                { to: "/leaderboard", label: "Leaderboard" },
                { to: "/shop",        label: "Gem Shop 💎"  },
                { to: "/placement",   label: "Placement Test" },
              ],
            },
          ].map(({ heading, links }) => (
            <div key={heading}>
              <div className="px-4 pt-3 pb-1 font-mono text-[9px] uppercase opacity-50 tracking-widest brutal-border border-x-0 border-t-0">
                {heading}
              </div>
              {links.map(l => (
                <Link
                  key={l.to}
                  href={l.to}
                  onClick={onClose}
                  className="block px-4 py-3 brutal-border border-x-0 border-t-0 hover:bg-acid font-mono text-[11px] uppercase transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Theme (in drawer) */}
        <div className="px-4 py-3 brutal-border border-x-0 border-t-0">
          <div className="font-mono text-[9px] uppercase opacity-50 mb-2">Settings / Theme</div>
          <ThemeSwitcher compact />
        </div>

        {/* Auth */}
        <div className="p-3 space-y-2">
          {user ? (
            <>
              <Link
                href="/profile"
                onClick={onClose}
                className="block brutal-border bg-volt text-bone px-3 py-2 font-mono text-xs uppercase text-center brutal-press"
              >
                <UserIcon /> Profile
              </Link>
              <button
                onClick={() => { signOut(); onClose(); }}
                className="w-full brutal-border bg-bone px-3 py-2 font-mono text-xs uppercase text-left brutal-press hover:bg-sun transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              className="block brutal-border bg-volt text-bone px-3 py-2 font-mono text-xs uppercase text-center brutal-press"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}



// ─── StreakWarningBanner — shown when streak is at risk tonight ───────────────

function StreakWarningBanner() {
  const { progress, dailyGoalDone } = useProgress();
  const [isAtRisk, setIsAtRisk] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // At risk if: streak > 0, daily goal NOT done, and it's past 20:00 local time
    const check = () => {
      const hour = new Date().getHours();
      setIsAtRisk(
        progress.streakDays > 0 &&
        !dailyGoalDone &&
        hour >= 20
      );
    };
    check();
    const id = setInterval(check, 60_000); // re-check every minute
    return () => clearInterval(id);
  }, [progress.streakDays, dailyGoalDone]);

  if (!isAtRisk || dismissed) return null;

  return (
    <div className="bg-hot text-bone px-4 py-2 flex items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-2 font-mono text-[11px] uppercase">
        <span className="text-base">🔥</span>
        <span>
          Your <strong>{progress.streakDays}-day streak</strong> is at risk!
          {progress.streakShield
            ? " Your shield will protect it tonight."
            : " Do at least one lesson before midnight."}
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <a
          href="/learn"
          className="brutal-border bg-bone text-hot px-3 py-1 font-mono text-[10px] uppercase brutal-press hover:bg-acid hover:text-ink transition-colors"
        >
          LEARN NOW →
        </a>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss streak warning"
          className="font-mono text-[10px] opacity-60 hover:opacity-100"
        >
          ✕
        </button>
      </div>
    </div>
  );
}



// ─── Main Header export ───────────────────────────────────────────────────────

export function Header() {
  const { progress, heartRefillSeconds } = useProgress();
  const { user } = useAuth();

  const [moreOpen,   setMoreOpen]   = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close all panels on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMoreOpen(false);
        setDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const openSearch = useCallback(
    () => window.dispatchEvent(new Event(PALETTE_OPEN_EVENT)),
    []
  );

  // User initials for avatar
  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
    : null;

  return (
    <header className="brutal-border border-x-0 border-t-0 bg-bone sticky top-0 z-40" role="banner">

      {/* ── Main bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-stretch h-12 md:h-14">

        {/* 1. Logo */}
        <Link
          href="/"
          className="brutal-border border-y-0 border-l-0 px-3 md:px-4 flex items-center font-display text-base md:text-xl bg-acid hover:bg-sun transition-colors shrink-0"
          aria-label="CCD.SCHOOL home"
        >
          CCD.SCHOOL
        </Link>

        {/* 2. Primary nav — desktop only, 3 items */}
        <nav
          className="hidden md:flex items-stretch font-mono uppercase text-xs"
          aria-label="Main navigation"
        >
          {PRIMARY_NAV.map(l => (
            <Link
              key={`${l.to}-${l.label}`}
              href={l.to}
              className="px-3 flex items-center brutal-border border-y-0 border-l-0 hover:bg-sun transition-colors whitespace-nowrap"
            >
              {l.label}
            </Link>
          ))}

          {/* 3. More ▾ dropdown trigger */}
          <div className="relative flex items-stretch">
            <button
              onClick={() => setMoreOpen(o => !o)}
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              className="px-3 flex items-center brutal-border border-y-0 border-l-0 hover:bg-sun transition-colors font-mono uppercase text-xs whitespace-nowrap"
            >
              More ▾
            </button>
            <MoreDropdown open={moreOpen} onClose={() => setMoreOpen(false)} />
          </div>
        </nav>

        {/* 4. Spacer */}
        <div className="flex-1" />

        {/* 5. Right strip — desktop, exactly 5 elements ─────────────────── */}
        <div className="hidden md:flex items-center gap-1.5 px-3">

          {/* 5a. Search */}
          <button
            onClick={openSearch}
            title="Search (⌘K)"
            aria-label="Open search"
            className="brutal-border bg-bone px-2.5 py-1.5 hover:bg-sun flex items-center gap-1.5 font-mono text-[10px] uppercase transition-colors brutal-press"
          >
            <SearchIcon />
            <span className="hidden lg:inline">⌘K</span>
          </button>

          {/* 5b. Hearts */}
          <Hearts count={progress.hearts} refillSeconds={heartRefillSeconds} />

          {/* 5c. XP+Streak combo badge → opens popover */}
          <XpStreakBadge />

          {/* 5d. Mode pill */}
          <ModeTogglePill />

          {/* 5e. Profile / Sign in */}
          {user ? (
            <Link
              href="/profile"
              aria-label="View profile"
              title={user.name ?? "Profile"}
              className="brutal-border bg-bone w-8 h-8 flex items-center justify-center font-mono text-[10px] uppercase hover:bg-sun transition-colors brutal-press"
            >
              {initials ?? <UserIcon />}
            </Link>
          ) : (
            <Link
              href="/login"
              className="brutal-border bg-volt text-bone px-3 py-1.5 font-mono text-[10px] uppercase brutal-press"
            >
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile strip ─────────────────────────────────────────────────── */}
        {/* Fix #9: When the MobileBottomNav is shown (< md), the hamburger
            drawer is redundant — it duplicates Learn/Review/Profile tabs.
            We strip it down to: logo (already rendered) + hearts + streak
            badge + search. The ≡ drawer is hidden on lesson-free pages;
            shown only on pages where the bottom nav is absent (placement,
            onboarding, etc.) via the `data-no-bottom-nav` attribute. */}
        <div className="md:hidden flex items-center gap-1.5 px-2">
          {/* Hearts — always visible on mobile for quick reference */}
          <Hearts count={progress.hearts} refillSeconds={heartRefillSeconds} />

          {/* Compact streak + XP badge */}
          <span className="brutal-border bg-ink text-bone px-1.5 py-1 font-mono text-[9px] tabular-nums">
            🔥{progress.streakDays} · {progress.xp}xp
          </span>

          {/* Search — available on all pages */}
          <button
            onClick={openSearch}
            aria-label="Search"
            className="brutal-border bg-bone px-2 py-1.5 flex items-center brutal-press"
          >
            <SearchIcon />
          </button>

          {/* ≡ Menu — only shown on pages without the bottom nav (e.g. lesson,
              placement, onboarding). On all other mobile pages the bottom nav
              handles navigation so the drawer would be redundant clutter.
              We detect lesson pages via [data-page="lesson"] and hide it there;
              on other non-tabbed pages it's still useful. */}
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            className="brutal-border bg-ink text-bone px-3 py-1.5 font-display text-lg"
          >
            ≡
          </button>
        </div>
      </div>

      {/* ── 1px separator line (replaces marquee) ──────────────────────── */}
      <div className="h-px bg-ink hidden md:block" aria-hidden="true" />

      {/* ── Streak-at-risk warning banner ─────────────────────────────── */}
      <StreakWarningBanner />

      {/* ── Mobile drawer ─────────────────────────────────────────────── */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSearch={openSearch}
      />
    </header>
  );
}
