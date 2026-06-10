"use client";
/**
 * WorldShell — wrapper for every /world/[slug] page.
 *
 * Layout:
 *   ┌──────────────────┬─────────────────────────────────────┐
 *   │  RAIL (sticky)   │  CONTENT                            │
 *   │  ← All worlds    │  WorldPathClient (flow)             │
 *   │  [ring] Title    │  WorldPageClient (free)             │
 *   │  done/total      │  WorldWiki       (wiki tab)         │
 *   │  ─────────────   │                                     │
 *   │  SWITCH WORLD    │                                     │
 *   │  [● Fund]        │                                     │
 *   │  [  DJ  ]        │                                     │
 *   │  [  Prod]        │                                     │
 *   │  ─────────────   │                                     │
 *   │  VIEW            │                                     │
 *   │  [🌊 Flow][📖]   │                                     │
 *   │  ─────────────   │                                     │
 *   │  CHAPTERS        │                                     │
 *   │  01 🔊 Sound …   │                                     │
 *   │  02 🥁 Rhythm …  │                                     │
 *   │  ─────────────   │                                     │
 *   │  🔥 XP 💎        │                                     │
 *   └──────────────────┴─────────────────────────────────────┘
 *
 * Mobile: sticky compact bar (world identity + mode switch + ☰ sheet).
 * World switcher navigates (URL changes). View toggle is URL-driven via ModeSwitch.
 */
import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useProgress } from "@/lib/progress";
import { chaptersByWorld } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";
import { ModeSwitch } from "@/components/world/ModeSwitch";
import { WorldWiki } from "@/components/world/WorldWiki";
import {
  WORLD_ORDER,
  WORLD_THEMES,
  CHAPTER_EMOJIS,
  getWorldTheme,
  type WorldSlug,
} from "@/components/world/worldTheme";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ChapterStat {
  slug: string;
  title: string;
  number: number;
  emoji: string;
  done: number;
  total: number;
  pct: number;
  complete: boolean;
}

export interface WorldShellProps {
  worldSlug: WorldSlug;
  /** "flow" = WorldPathClient, "free" = WorldPageClient */
  view: "flow" | "free";
  children: React.ReactNode;
}

// ─── Hook: per-world stats ────────────────────────────────────────────────────
function useWorldStats(world: WorldSlug) {
  const { progress } = useProgress();
  const completed = progress.completedMissions;
  const chapters = chaptersByWorld(world);
  const paths = pathsByWorld(world);

  const chapterStats: ChapterStat[] = chapters.map((ch) => {
    const chPaths = paths.filter((p) => p.chapter === ch.slug);
    const slugs = chPaths.flatMap((p) => p.missionSlugs);
    const done = slugs.filter((s) => !!completed[s]).length;
    const total = slugs.length;
    return {
      slug: ch.slug,
      title: ch.title,
      number: ch.number,
      emoji: CHAPTER_EMOJIS[ch.slug] ?? "📖",
      done,
      total,
      pct: total > 0 ? Math.round((done / total) * 100) : 0,
      complete: done === total && total > 0,
    };
  });

  const allSlugs = paths.flatMap((p) => p.missionSlugs);
  const done = allSlugs.filter((s) => !!completed[s]).length;
  const total = allSlugs.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return { chapterStats, done, total, pct, paths: paths.length, chapters: chapters.length };
}

// ─── Scroll helper ────────────────────────────────────────────────────────────
function scrollToChapter(slug: string) {
  const el = document.getElementById(`chapter-${slug}`);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ─── Progress ring ────────────────────────────────────────────────────────────
function ProgressRing({ pct, dark }: { pct: number; dark: boolean }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const fill = dark ? "#C6FF00" : "hsl(222 47% 4%)";
  const track = dark ? "rgba(198,255,0,0.15)" : "rgba(0,0,0,0.12)";
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" className="shrink-0" aria-hidden>
      <circle cx="28" cy="28" r={r} fill="none" stroke={track} strokeWidth="5" />
      <circle
        cx="28" cy="28" r={r} fill="none"
        stroke={fill} strokeWidth="5" strokeLinecap="round"
        strokeDasharray={`${(circ * Math.min(pct, 100)) / 100} ${circ}`}
        transform="rotate(-90 28 28)"
        style={{ transition: "stroke-dasharray 0.7s ease" }}
      />
      <text
        x="28" y="32" textAnchor="middle"
        fontSize="12" fontWeight="700" fill="currentColor" fontFamily="inherit"
      >
        {pct}%
      </text>
    </svg>
  );
}

// ─── World switcher pills in rail ─────────────────────────────────────────────
function WorldSwitcher({ current, view, dark }: { current: WorldSlug; view: "flow" | "free"; dark: boolean }) {
  const suffix = view === "free" ? "?view=free" : "";
  return (
    <div className="flex flex-col gap-1.5">
      {WORLD_ORDER.map((w) => {
        const t = WORLD_THEMES[w];
        const active = w === current;
        return (
          <Link
            key={w}
            href={`/world/${w}${suffix}`}
            className={`brutal-border flex items-center gap-2.5 px-3 py-2.5 font-display text-xs brutal-press transition-all ${
              active
                ? `${t.accentBg} ${t.accentText} chunk-shadow-sm`
                : dark
                ? "bg-bone/6 text-bone hover:bg-bone/12"
                : "bg-ink/5 text-ink hover:bg-ink/10"
            }`}
          >
            <span className="text-lg leading-none shrink-0">{t.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="leading-tight truncate">{t.title}</div>
              {active && (
                <div className={`font-mono text-[8px] uppercase mt-0.5 opacity-60`}>
                  current world
                </div>
              )}
            </div>
            {active && <span className="shrink-0 text-xs opacity-70">●</span>}
          </Link>
        );
      })}
    </div>
  );
}

// ─── Chapter list ─────────────────────────────────────────────────────────────
function ChapterList({
  stats,
  dark,
  onPick,
}: {
  stats: ChapterStat[];
  dark: boolean;
  onPick: (slug: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {stats.map((ch) => {
        const doneClass = ch.complete
          ? dark
            ? "bg-volt text-ink border-volt/80"
            : "bg-ink text-bone border-ink"
          : ch.done > 0
          ? dark
            ? "bg-volt/15 text-bone border-volt/30"
            : "bg-ink/10 text-ink border-ink/25"
          : dark
          ? "bg-bone/5 text-bone/60 border-bone/12"
          : "bg-ink/4 text-ink/60 border-ink/12";

        return (
          <button
            key={ch.slug}
            onClick={() => onPick(ch.slug)}
            className={`brutal-border text-left px-2.5 py-2 flex items-center gap-2 brutal-press transition-all hover:translate-x-px group ${doneClass}`}
          >
            <span className={`font-mono text-[8px] shrink-0 w-4 tabular-nums ${dark ? "opacity-40" : "opacity-35"}`}>
              {String(ch.number).padStart(2, "0")}
            </span>
            <span className="text-sm leading-none shrink-0">
              {ch.complete ? "✓" : ch.emoji}
            </span>
            <span className="flex-1 min-w-0">
              <span className="font-display text-[11px] leading-tight block truncate">{ch.title}</span>
              <span className="flex items-center gap-1 mt-1">
                <span className={`flex-1 h-0.5 overflow-hidden ${dark ? "bg-bone/12" : "bg-ink/10"}`}>
                  <span
                    className={`block h-full transition-all duration-500 ${dark ? "bg-volt" : "bg-ink"}`}
                    style={{ width: `${ch.pct}%` }}
                  />
                </span>
                <span className={`font-mono text-[7px] shrink-0 tabular-nums ${dark ? "opacity-45" : "opacity-40"}`}>
                  {ch.done}/{ch.total}
                </span>
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Desktop Rail ─────────────────────────────────────────────────────────────
function Rail({ world, view }: { world: WorldSlug; view: "flow" | "free" }) {
  const t = getWorldTheme(world);
  const { progress } = useProgress();
  const { chapterStats, done, total, pct, paths, chapters } = useWorldStats(world);

  return (
    <aside
      className={`hidden md:flex flex-col w-[272px] shrink-0 ${t.railBg} ${t.railBorder} ${t.railText} sticky self-start overflow-y-auto`}
      style={{ top: "var(--header-h, 64px)", height: "calc(100vh - var(--header-h, 64px))" }}
    >
      <div className="flex-1 overflow-y-auto">

        {/* ── World identity ── */}
        <div className={`p-4 border-b-4 ${t.dark ? "border-bone/10" : "border-ink/10"}`}>
          <Link
            href="/worlds"
            className={`font-mono text-[9px] uppercase mb-3 block transition-opacity hover:opacity-80 ${t.railMuted}`}
          >
            ← All worlds
          </Link>
          <div className="flex items-center gap-3">
            <ProgressRing pct={pct} dark={t.dark} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-2xl leading-none">{t.emoji}</span>
                <span className="font-display text-xl leading-none">{t.title}</span>
              </div>
              <div className={`font-mono text-[9px] uppercase mt-1 ${t.railMuted}`}>
                {done}/{total} missions · {pct}%
              </div>
              <div className={`font-mono text-[8px] uppercase mt-0.5 ${t.railMuted}`}>
                {chapters} chapters · {paths} paths
              </div>
            </div>
          </div>
        </div>

        {/* ── World switcher ── */}
        <div className={`p-3 border-b-4 ${t.dark ? "border-bone/10" : "border-ink/10"}`}>
          <div className={`font-mono text-[8px] uppercase mb-2 ${t.railMuted}`}>Switch world</div>
          <WorldSwitcher current={world} view={view} dark={t.dark} />
        </div>

        {/* ── Mode switch ── */}
        <div className={`p-3 border-b-4 ${t.dark ? "border-bone/10" : "border-ink/10"}`}>
          <div className={`font-mono text-[8px] uppercase mb-2 ${t.railMuted}`}>View</div>
          <ModeSwitch worldSlug={world} activeView={view} full size="md" />
          <p className={`font-mono text-[8px] mt-2 leading-relaxed ${t.railMuted}`}>
            {view === "flow"
              ? "🌊 Sequential path — hearts on."
              : "📖 Open wiki — browse everything."}
          </p>
        </div>

        {/* ── Chapters ── */}
        <div className="p-3">
          <div className={`font-mono text-[8px] uppercase mb-2 ${t.railMuted}`}>
            {chapterStats.length} chapters
          </div>
          <ChapterList stats={chapterStats} dark={t.dark} onPick={scrollToChapter} />
        </div>
      </div>

      {/* ── Stats footer ── */}
      <div className={`border-t-4 p-3 flex items-center gap-1.5 flex-wrap ${t.dark ? "border-bone/10" : "border-ink/10"}`}>
        {[
          `🔥 ${progress.streakDays}d`,
          `${progress.xp.toLocaleString()} XP`,
          `💎 ${progress.gems}`,
        ].map((label) => (
          <div
            key={label}
            className={`brutal-border px-2 py-1 font-mono text-[8px] uppercase ${
              t.dark ? "bg-bone/8 text-bone" : "bg-ink/8 text-ink"
            }`}
          >
            {label}
          </div>
        ))}
      </div>
    </aside>
  );
}

// ─── Mobile bar + sheet ───────────────────────────────────────────────────────
function MobileBar({ world, view }: { world: WorldSlug; view: "flow" | "free" }) {
  const t = getWorldTheme(world);
  const { chapterStats, pct } = useWorldStats(world);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { progress } = useProgress();

  const pick = useCallback((slug: string) => {
    setSheetOpen(false);
    setTimeout(() => scrollToChapter(slug), 120);
  }, []);

  return (
    <div className="md:hidden">
      {/* Compact sticky bar */}
      <div
        className={`${t.railBg} ${t.railText} ${t.railBorder} border-b-4 border-r-0 sticky z-30 border-b-ink`}
        style={{ top: "var(--header-h, 56px)" }}
      >
        <div className="px-3 py-2.5 flex items-center gap-2.5">
          {/* World identity */}
          <Link href="/worlds" className="text-xl leading-none shrink-0" aria-label="All worlds">
            {t.emoji}
          </Link>
          <div className="min-w-0 flex-1">
            <div className="font-display text-sm leading-none truncate">{t.title}</div>
            <div className={`font-mono text-[8px] uppercase mt-0.5 ${t.railMuted}`}>{pct}% complete</div>
          </div>

          {/* World switcher pills — always visible */}
          <div className="flex gap-1 shrink-0">
            {WORLD_ORDER.map((w) => {
              const wt = WORLD_THEMES[w];
              const active = w === world;
              return (
                <Link
                  key={w}
                  href={`/world/${w}${view === "free" ? "?view=free" : ""}`}
                  className={`brutal-border w-8 h-8 flex items-center justify-center text-sm brutal-press transition-all ${
                    active
                      ? `${wt.accentBg} ${wt.accentText}`
                      : t.dark
                      ? "bg-bone/8 text-bone/60"
                      : "bg-ink/6 text-ink/55"
                  }`}
                  aria-label={wt.title}
                >
                  {wt.emoji}
                </Link>
              );
            })}
          </div>

          <ModeSwitch worldSlug={world} activeView={view} size="sm" />

          <button
            onClick={() => setSheetOpen(true)}
            className={`brutal-border w-9 h-9 flex items-center justify-center font-display text-sm brutal-press shrink-0 ${
              t.dark ? "bg-bone/10 text-bone" : "bg-ink/8 text-ink"
            }`}
            aria-label="Open chapters"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Chapter sheet */}
      {sheetOpen && (
        <div
          className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-sm"
          onClick={() => setSheetOpen(false)}
        >
          <div
            className={`absolute bottom-0 left-0 right-0 max-h-[78vh] overflow-y-auto ${t.railBg} ${t.railText} border-t-4 border-ink animate-slide-up`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet header */}
            <div className={`sticky top-0 flex items-center justify-between px-4 py-3 border-b-4 ${t.dark ? "border-bone/15" : "border-ink/15"} ${t.railBg}`}>
              <span className="font-display text-lg">{t.emoji} {t.title}</span>
              <button
                onClick={() => setSheetOpen(false)}
                className={`brutal-border px-3 py-1.5 font-display text-xs brutal-press ${t.dark ? "bg-bone/10" : "bg-ink/8"}`}
              >
                ✕
              </button>
            </div>

            <div className="p-4 pb-10 space-y-4">
              {/* World switcher */}
              <div>
                <div className={`font-mono text-[8px] uppercase mb-2 ${t.railMuted}`}>Switch world</div>
                <div className="flex gap-2">
                  {WORLD_ORDER.map((w) => {
                    const wt = WORLD_THEMES[w];
                    const active = w === world;
                    return (
                      <Link
                        key={w}
                        href={`/world/${w}${view === "free" ? "?view=free" : ""}`}
                        onClick={() => setSheetOpen(false)}
                        className={`flex-1 brutal-border flex flex-col items-center gap-1 py-2.5 font-display text-xs brutal-press transition-all ${
                          active
                            ? `${wt.accentBg} ${wt.accentText} chunk-shadow-sm`
                            : t.dark
                            ? "bg-bone/6 text-bone"
                            : "bg-ink/5 text-ink"
                        }`}
                      >
                        <span className="text-xl">{wt.emoji}</span>
                        <span>{wt.title.split(" ")[0]}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Mode switch */}
              <div>
                <div className={`font-mono text-[8px] uppercase mb-2 ${t.railMuted}`}>Mode</div>
                <ModeSwitch worldSlug={world} activeView={view} full size="md" />
              </div>

              {/* Stats row */}
              <div className="flex gap-2">
                {[`🔥 ${progress.streakDays}d`, `${progress.xp} XP`, `💎 ${progress.gems}`].map((l) => (
                  <div key={l} className={`brutal-border px-2.5 py-1.5 font-mono text-[9px] uppercase ${t.dark ? "bg-bone/8 text-bone" : "bg-ink/8 text-ink"}`}>
                    {l}
                  </div>
                ))}
              </div>

              {/* Chapters */}
              <div>
                <div className={`font-mono text-[8px] uppercase mb-2 ${t.railMuted}`}>Chapters</div>
                <ChapterList stats={chapterStats} dark={t.dark} onPick={pick} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────
export function WorldShell({ worldSlug, view, children }: WorldShellProps) {
  const t = getWorldTheme(worldSlug);

  return (
    <div className={`${t.surface} min-h-screen`}>
      <MobileBar world={worldSlug} view={view} />
      <div className="flex">
        <Rail world={worldSlug} view={view} />
        <main className="flex-1 min-w-0">
          {view === "free"
            ? children   /* WorldPageClient rendered by page.tsx */
            : children   /* WorldPathClient rendered by page.tsx */
          }
        </main>
      </div>
    </div>
  );
}
