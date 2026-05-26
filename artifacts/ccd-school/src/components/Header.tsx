"use client";
/**
 * Header v2 — Duolingo-rebuild
 *
 * Changes from v1:
 *   • 5 hearts (♥♥♥♥♥) displayed with 4-hour countdown timer
 *   • 💎 Gems counter (new)
 *   • RankBadge now shows real rank name + emoji (was null stub)
 *   • Streak shield 🛡 shown inline with streak count
 *   • Daily goal ring updated to match new progress shape
 *   • Nav: "Worlds" now links to /world/fundamentals (new path view) + "Learn" replaces "Paths"
 *   • Mobile drawer updated with hearts + gems
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { useProgress, DAILY_GOAL_XP, MAX_HEARTS } from "@/lib/progress";
import { useAuth, signOut } from "@/lib/auth";
import { rankFor } from "@/lib/ranks";
import { PALETTE_OPEN_EVENT } from "@/components/CommandPalette";

const PRIMARY = [
  { to: "/world/fundamentals", label: "Fundamentals" },
  { to: "/world/dj",           label: "DJ World" },
  { to: "/world/producer",     label: "Producer" },
  { to: "/missions",           label: "Missions" },
] as const;

const MORE_LINKS = [
  { to: "/train",        label: "Ear Training" },
  { to: "/leaderboard",  label: "Leaderboard" },
  { to: "/shop",         label: "Gem Shop 💎" },
  { to: "/placement",    label: "Placement Test" },
  { to: "/glossary",     label: "Glossary" },
  { to: "/shortcuts",    label: "Shortcuts" },
  { to: "/devices",      label: "Devices" },
  { to: "/playground",   label: "Workbench" },
] as const;

// ─── sub-components ───────────────────────────────────────────────────────────

function GoalRing({ pct, done }: { pct: number; done: boolean }) {
  const r = 8;
  const circ = 2 * Math.PI * r;
  return (
    <svg width="22" height="22" viewBox="0 0 22 22"
      aria-label={`Daily goal ${Math.round(pct * 100)}%`}
      role="img">
      <circle cx="11" cy="11" r={r} fill="none" stroke="currentColor"
        strokeWidth="2.5" opacity="0.2" />
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

function Hearts({ count, refillSeconds }: { count: number; refillSeconds: number }) {
  const [secs, setSecs] = useState(refillSeconds);
  useEffect(() => setSecs(refillSeconds), [refillSeconds]);
  useEffect(() => {
    if (count >= MAX_HEARTS || secs <= 0) return;
    const id = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [count, secs]);

  const hh = String(Math.floor(secs / 3600)).padStart(1, "0");
  const mm = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
  const full = count >= MAX_HEARTS;

  return (
    <div className="flex items-center gap-0.5"
      title={full ? "Full hearts" : `${count}/${MAX_HEARTS} hearts · refills in ${hh}h${mm}m`}>
      {Array.from({ length: MAX_HEARTS }).map((_, i) => (
        <span key={i}
          className={`text-sm leading-none transition-all ${i < count ? "text-hot" : "opacity-20"}`}
          aria-hidden="true">♥</span>
      ))}
      {!full && secs > 0 && (
        <span className="font-mono text-[8px] opacity-50 ml-0.5 tabular-nums">
          {hh}h{mm}
        </span>
      )}
    </div>
  );
}

function RankBadge() {
  const { progress } = useProgress();
  const { current: rank } = rankFor(progress.xp);
  return (
    <span
      className="brutal-border bg-bone px-2 py-1 font-mono text-[9px] uppercase"
      title={`Rank: ${rank.name}`}>
      {rank.emoji} {rank.name}
    </span>
  );
}

function GemsCounter({ gems }: { gems: number }) {
  return (
    <Link href="/shop"
      className="brutal-border bg-bone px-2 py-1 font-mono text-[10px] uppercase hover:bg-sun transition-colors"
      title={`${gems} gems — visit shop`}>
      💎 {gems}
    </Link>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="4.5" />
      <line x1="10.5" y1="10.5" x2="14" y2="14" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="8" cy="5" r="3" />
      <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    </svg>
  );
}

// ─── main Header ──────────────────────────────────────────────────────────────

export function Header() {
  const { progress, dailyGoalPct, dailyGoalDone, heartRefillSeconds } = useProgress();
  const { user } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setMoreOpen(false); setDrawerOpen(false); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const openSearch = () => window.dispatchEvent(new Event(PALETTE_OPEN_EVENT));

  return (
    <header className="brutal-border border-x-0 border-t-0 bg-bone sticky top-0 z-40" role="banner">
      <div className="flex items-stretch h-12 md:h-14">

        {/* Logo */}
        <Link href="/"
          className="brutal-border border-y-0 border-l-0 px-3 md:px-4 flex items-center font-display text-base md:text-xl bg-acid hover:bg-sun transition-colors shrink-0"
          aria-label="CCD.SCHOOL home">
          CCD.SCHOOL
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex flex-1 items-stretch font-mono uppercase text-xs" aria-label="Main navigation">
          {PRIMARY.map(l => (
            <Link key={l.to} href={l.to}
              className="px-3 flex items-center brutal-border border-y-0 border-l-0 hover:bg-sun transition-colors whitespace-nowrap">
              {l.label}
            </Link>
          ))}
          <div className="relative flex items-stretch">
            <button
              onClick={() => setMoreOpen(o => !o)}
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              className="px-3 flex items-center brutal-border border-y-0 border-l-0 hover:bg-sun transition-colors">
              MORE ▾
            </button>
            {moreOpen && (
              <div className="absolute top-full left-0 brutal-border bg-bone min-w-[180px] z-50"
                role="menu">
                {MORE_LINKS.map(l => (
                  <Link key={l.to} href={l.to}
                    onClick={() => setMoreOpen(false)}
                    role="menuitem"
                    className="block px-4 py-2.5 font-mono uppercase text-xs hover:bg-acid brutal-border border-x-0 border-t-0 transition-colors">
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="flex-1 md:flex-none" />

        {/* Desktop gamification strip */}
        <div className="hidden md:flex items-center gap-1.5 px-3">
          {/* Search */}
          <button onClick={openSearch} title="Search (⌘K)" aria-label="Search"
            className="brutal-border bg-bone px-2.5 py-1.5 hover:bg-sun flex items-center gap-1.5 font-mono text-[10px] uppercase transition-colors">
            <SearchIcon /> ⌘K
          </button>

          {/* Hearts — always shown */}
          <Hearts count={progress.hearts} refillSeconds={heartRefillSeconds} />

          {/* Daily goal ring */}
          <div title={`Daily goal: ${progress.dailyXp}/${DAILY_GOAL_XP} XP`}>
            <GoalRing pct={dailyGoalPct} done={dailyGoalDone} />
          </div>

          {/* XP */}
          <span className="brutal-border bg-acid px-2 py-1 font-mono text-[10px] uppercase tabular-nums"
            title={`Total XP: ${progress.xp}`}>
            {progress.xp} XP
          </span>

          {/* Streak */}
          <span className="brutal-border bg-ink text-bone px-2 py-1 font-mono text-[10px] uppercase tabular-nums"
            title={progress.streakShield ? "Streak + Shield active" : `${progress.streakDays}-day streak`}>
            🔥 {progress.streakDays}{progress.streakShield ? "🛡" : ""}
          </span>

          {/* Gems */}
          <GemsCounter gems={progress.gems} />

          {/* Rank badge */}
          <RankBadge />

          {/* Theme */}
          <ThemeSwitcher compact />

          {/* Auth */}
          {user ? (
            <Link href="/profile"
              className="brutal-border bg-bone px-2.5 py-1.5 hover:bg-sun flex items-center gap-1.5 font-mono text-[10px] uppercase transition-colors"
              aria-label="View profile">
              <UserIcon /> Profile
            </Link>
          ) : (
            <Link href="/login"
              className="brutal-border bg-volt text-bone px-3 py-1.5 font-mono text-[10px] uppercase brutal-press">
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile strip */}
        <div className="md:hidden flex items-center gap-1.5 px-2">
          <Hearts count={progress.hearts} refillSeconds={heartRefillSeconds} />
          <span className="brutal-border bg-acid px-1.5 py-1 font-mono text-[9px] tabular-nums">
            {progress.xp}xp
          </span>
          <span className="font-mono text-[9px] text-hot tabular-nums">
            🔥{progress.streakDays}{progress.streakShield ? "🛡" : ""}
          </span>
          <button onClick={openSearch} aria-label="Search"
            className="brutal-border bg-bone px-2 py-1.5 flex items-center">
            <SearchIcon />
          </button>
          <button onClick={() => setDrawerOpen(true)} aria-label="Open menu"
            aria-expanded={drawerOpen}
            className="brutal-border bg-ink text-bone px-3 py-1.5 font-display text-lg">
            ≡
          </button>
        </div>
      </div>

      {/* Marquee ticker */}
      <div className="hidden md:block">
        <Marquee />
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-ink/80"
          onClick={() => setDrawerOpen(false)}
          role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div
            className="absolute right-0 top-0 bottom-0 w-[80%] max-w-[320px] bg-bone brutal-border border-y-0 border-r-0 overflow-y-auto"
            onClick={e => e.stopPropagation()}>

            {/* Drawer header */}
            <div className="flex items-center justify-between p-3 brutal-border border-x-0 border-t-0 bg-acid">
              <span className="font-display text-lg">CCD.SCHOOL</span>
              <button onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="brutal-border bg-ink text-bone px-3 py-1 font-mono text-xs">✕</button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-0 brutal-border border-x-0 border-t-0">
              <div className="p-3 text-center brutal-border border-y-0 border-l-0">
                <div className="font-display text-xl">{progress.xp}</div>
                <div className="font-mono text-[8px] uppercase opacity-60">XP</div>
              </div>
              <div className="p-3 text-center brutal-border border-y-0 border-l-0">
                <div className="font-display text-xl">🔥{progress.streakDays}</div>
                <div className="font-mono text-[8px] uppercase opacity-60">Streak</div>
              </div>
              <div className="p-3 text-center">
                <div className="font-display text-xl">💎{progress.gems}</div>
                <div className="font-mono text-[8px] uppercase opacity-60">Gems</div>
              </div>
            </div>

            {/* Hearts in drawer */}
            <div className="px-4 py-3 brutal-border border-x-0 border-t-0 flex items-center gap-2">
              <Hearts count={progress.hearts} refillSeconds={heartRefillSeconds} />
              <span className="font-mono text-[9px] uppercase opacity-60 ml-2">
                {progress.hearts}/{MAX_HEARTS} hearts
              </span>
            </div>

            {/* Search */}
            <button
              onClick={() => { setDrawerOpen(false); openSearch(); }}
              className="w-full text-left px-4 py-3 brutal-border border-x-0 border-t-0 hover:bg-sun font-mono uppercase text-sm flex items-center gap-2">
              <SearchIcon /> Search (⌘K)
            </button>

            {/* Nav links */}
            <nav className="flex flex-col font-mono uppercase text-sm" aria-label="Mobile navigation">
              {[...PRIMARY, ...MORE_LINKS].map(l => (
                <Link key={l.to} href={l.to}
                  onClick={() => setDrawerOpen(false)}
                  className="px-4 py-3 brutal-border border-x-0 border-t-0 hover:bg-acid transition-colors">
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Auth */}
            <div className="p-3 space-y-2">
              {user ? (
                <>
                  <Link href="/profile" onClick={() => setDrawerOpen(false)}
                    className="block brutal-border bg-volt text-bone px-3 py-2 font-mono text-xs uppercase text-center brutal-press">
                    Profile
                  </Link>
                  <button
                    onClick={() => { signOut(); setDrawerOpen(false); }}
                    className="w-full brutal-border bg-bone px-3 py-2 font-mono text-xs uppercase text-left brutal-press hover:bg-sun">
                    Sign out
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={() => setDrawerOpen(false)}
                  className="block brutal-border bg-volt text-bone px-3 py-2 font-mono text-xs uppercase text-center brutal-press">
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function Marquee() {
  const items = [
    "153 MISSIONS", "3 WORLDS", "5 HEARTS", "FUNDAMENTALS",
    "DJ WORLD", "PRODUCER", "ABLETON LIVE 12", "REKORDBOX 6",
    "SPACED REPETITION", "GEM SHOP", "DAILY STREAK", "BEAT COACH AI",
  ];
  const row = [...items, ...items];
  return (
    <div className="brutal-border border-x-0 border-b-0 bg-ink text-bone overflow-hidden" aria-hidden="true">
      <div className="flex animate-marquee whitespace-nowrap py-1 font-mono text-[10px] uppercase tracking-widest">
        {row.map((t, i) => <span key={i} className="px-5">★ {t}</span>)}
      </div>
    </div>
  );
}
