import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { useProgress, DAILY_GOAL_XP, MAX_HEARTS } from "@/lib/progress";
import { useAuth, signOut } from "@/lib/auth";
import { RankBadge } from "./HomeWidgets";
import { PALETTE_OPEN_EVENT } from "./CommandPalette";

const PRIMARY = [
  { to: "/worlds", label: "Worlds" },
  { to: "/learn", label: "Paths" },
  { to: "/missions", label: "Missions" },
  { to: "/devices", label: "Devices" },
  { to: "/playground", label: "Workbench" },
] as const;

const MORE_LINKS = [
  { to: "/train", label: "Ear Training" },
  { to: "/match", label: "Mix Match" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/glossary", label: "Glossary" },
  { to: "/shortcuts", label: "Shortcuts" },
] as const;

// ── Daily goal ring ──────────────────────────────────────────────────────────
function GoalRing({ pct, done }: { pct: number; done: boolean }) {
  const r = 8;
  const circ = 2 * Math.PI * r;
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      aria-label={`Daily goal ${Math.round(pct * 100)}%`}
    >
      <circle
        cx="11"
        cy="11"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        opacity="0.2"
      />
      <circle
        cx="11"
        cy="11"
        r={r}
        fill="none"
        stroke={done ? "#7B2FFF" : "#CDFF00"}
        strokeWidth="2.5"
        strokeDasharray={`${circ * pct} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 11 11)"
        style={{ transition: "stroke-dasharray 0.4s" }}
      />
    </svg>
  );
}

// ── Hearts (CCD mode only) ───────────────────────────────────────────────────
function Hearts({ count, refillSeconds }: { count: number; refillSeconds: number }) {
  const [secs, setSecs] = useState(refillSeconds);
  useEffect(() => setSecs(refillSeconds), [refillSeconds]);
  useEffect(() => {
    if (count >= MAX_HEARTS || secs <= 0) return;
    const id = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [count, secs]);
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  return (
    <div className="flex items-center gap-0.5" title={`${count} hearts · next in ${mm}:${ss}`}>
      {Array.from({ length: MAX_HEARTS }).map((_, i) => (
        <span key={i} className={`text-sm leading-none ${i < count ? "text-acid" : "opacity-20"}`}>
          ♥
        </span>
      ))}
      {count < MAX_HEARTS && secs > 0 && (
        <span className="font-mono text-[9px] opacity-50 ml-0.5">
          +♥{mm}:{ss}
        </span>
      )}
    </div>
  );
}

function useDarkMode() {
  const [dark, setDark] = useState(
    () =>
      typeof localStorage !== "undefined" && localStorage.getItem("ableton.school.dark") === "1",
  );
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("ableton.school.dark", dark ? "1" : "0");
  }, [dark]);
  return { dark, toggle: () => setDark((d) => !d) };
}

// ── Search icon SVG ─────────────────────────────────────────────────────────
function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="6.5" cy="6.5" r="4.5" />
      <line x1="10.5" y1="10.5" x2="14" y2="14" />
    </svg>
  );
}

// ── Avatar / profile icon ────────────────────────────────────────────────────
function UserIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <circle cx="8" cy="5" r="3" />
      <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    </svg>
  );
}


// (Mode pill removed — depth toggle is per-mission, only where it changes content)

// ── Header ───────────────────────────────────────────────────────────────────
export function Header() {
  const { progress, dailyGoalPct, dailyGoalDone, heartRefillSeconds } = useProgress();
  const { user } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMoreOpen(false);
        setDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const openSearch = () => window.dispatchEvent(new Event(PALETTE_OPEN_EVENT));

  return (
    <header className="brutal-border border-x-0 border-t-0 bg-bone sticky top-0 z-40">
      <div className="flex items-stretch h-12 md:h-14">
        {/* Logo */}
        <Link
          to="/"
          className="brutal-border border-y-0 border-l-0 px-3 md:px-4 flex items-center font-display text-base md:text-xl bg-acid hover-glitch shrink-0"
        >
          CCD.SCHOOL
        </Link>

        {/* Desktop primary nav */}
        <nav className="hidden md:flex flex-1 items-stretch font-mono uppercase text-xs">
          {PRIMARY.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="px-4 flex items-center brutal-border border-y-0 border-l-0 hover:bg-sun transition-colors"
            >
              {l.label}
            </Link>
          ))}

          {/* More dropdown */}
          <div className="relative flex items-stretch">
            <button
              onClick={() => setMoreOpen((o) => !o)}
              aria-expanded={moreOpen}
              className="px-4 flex items-center brutal-border border-y-0 border-l-0 hover:bg-sun"
            >
              MORE ▾
            </button>
            {moreOpen && (
              <div className="absolute top-full left-0 brutal-border bg-bone min-w-[160px] z-50 shadow-lg">
                {MORE_LINKS.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setMoreOpen(false)}
                    className="block px-4 py-2 font-mono uppercase text-xs hover:bg-acid brutal-border border-x-0 border-t-0"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="flex-1 md:flex-none" />

        {/* Desktop right cluster */}
        <div className="hidden md:flex items-center gap-1.5 px-3">
          {/* Theme picker (single switcher — was previously duplicated) */}
          {/* Search */}
          <button
            onClick={openSearch}
            title="Search (⌘K)"
            className="brutal-border bg-bone px-2.5 py-1.5 hover:bg-sun flex items-center gap-1.5 font-mono text-[10px] uppercase"
          >
            <SearchIcon /> Search
          </button>
          {/* Hearts (CCD only — set in /learn) */}
          {progress.hearts < MAX_HEARTS && (
            <Hearts count={progress.hearts} refillSeconds={heartRefillSeconds} />
          )}

          {/* Goal ring */}
          <div
            title={`Daily goal: ${progress.dailyXp}/${DAILY_GOAL_XP} XP`}
            className="flex items-center"
          >
            <GoalRing pct={dailyGoalPct} done={dailyGoalDone} />
          </div>

          {/* XP + streak pill */}
          <span className="brutal-border bg-acid px-2 py-1 font-mono text-[10px] uppercase">
            {progress.xp} XP
          </span>
          <span className="brutal-border bg-ink text-bone px-2 py-1 font-mono text-[10px] uppercase">
            🔥 {progress.streakDays}
            {progress.streakShield ? "🛡" : ""}
          </span>

          {/* Rank */}
          <RankBadge compact />

          {/* Profile / sign-in */}
          <ThemeSwitcher compact />
          {user ? (
            <Link
              to="/profile"
              className="brutal-border bg-bone px-2.5 py-1.5 hover:bg-sun flex items-center gap-1.5 font-mono text-[10px] uppercase"
              title={user.email ?? "Profile"}
            >
              <UserIcon /> {user.email?.split("@")[0] ?? "Profile"}
            </Link>
          ) : (
            <Link
              to="/login"
              className="brutal-border bg-volt text-bone px-3 py-1.5 font-mono text-[10px] uppercase brutal-press"
            >
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile row */}
        <div className="md:hidden flex items-center gap-1.5 px-2">
          {progress.hearts < MAX_HEARTS && (
            <Hearts count={progress.hearts} refillSeconds={heartRefillSeconds} />
          )}
          <span className="brutal-border bg-acid px-1.5 py-1 font-mono text-[10px]">
            {progress.xp}xp
          </span>
          <button
            onClick={openSearch}
            aria-label="Search"
            className="brutal-border bg-bone px-2.5 py-1.5 flex items-center"
          >
            <SearchIcon />
          </button>
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Menu"
            className="brutal-border bg-ink text-bone px-3 py-1.5 font-display text-lg"
          >
            ≡
          </button>
        </div>
      </div>

      {/* Marquee */}
      <div className="hidden md:block">
        <Marquee />
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-ink/80"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-[78%] max-w-[320px] bg-bone brutal-border border-y-0 border-r-0 overflow-y-auto animate-slide-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 brutal-border border-x-0 border-t-0 bg-acid">
              <span className="font-display text-lg">CCD.SCHOOL</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="brutal-border bg-ink text-bone px-3 py-1 font-mono text-xs"
              >
                ✕
              </button>
            </div>

            {/* Search */}
            <button
              onClick={() => {
                setDrawerOpen(false);
                openSearch();
              }}
              className="w-full text-left px-4 py-3 brutal-border border-x-0 border-t-0 hover:bg-sun font-mono uppercase text-sm flex items-center gap-2"
            >
              <SearchIcon /> Search
            </button>

            {/* Nav */}
            <nav className="flex flex-col font-mono uppercase text-sm">
              {[...PRIMARY, ...MORE_LINKS].map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setDrawerOpen(false)}
                  className="px-4 py-3 brutal-border border-x-0 border-t-0 hover:bg-acid"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="p-3 space-y-2">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setDrawerOpen(false)}
                    className="block brutal-border bg-volt text-bone px-3 py-2 font-mono text-xs uppercase text-center brutal-press"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setDrawerOpen(false);
                    }}
                    className="w-full brutal-border bg-bone px-3 py-2 font-mono text-xs uppercase text-left brutal-press"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setDrawerOpen(false)}
                  className="block brutal-border bg-volt text-bone px-3 py-2 font-mono text-xs uppercase text-center brutal-press"
                >
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
    "ABLETON LIVE 12",
    "WARP MARKERS",
    "MAX FOR LIVE",
    "SESSION VIEW",
    "SIDECHAIN",
    "PUSH 3",
    "MIDI TRANSFORMS",
    "MELD",
    "ROAR",
    "DRUM RACK",
    "ABLETON LINK",
    "CV TOOLS",
  ];
  const row = [...items, ...items];
  return (
    <div className="brutal-border border-x-0 border-b-0 bg-ink text-bone overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap py-1 font-mono text-xs uppercase tracking-widest">
        {row.map((t, i) => (
          <span key={i} className="px-6">
            ★ {t}
          </span>
        ))}
      </div>
    </div>
  );
}
