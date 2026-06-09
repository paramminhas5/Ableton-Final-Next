"use client";
/**
 * WorldShell — wrapper for every /world/[slug] page.
 *
 * Layout:
 *   ┌─────────────────────────────────────────────────────────────┐
 *   │  SLIM HEADER: emoji · title · progress bar · [World][Wiki]  │
 *   ├──────────────┬──────────────────────────────────────────────┤
 *   │  SIDEBAR     │  MAIN CONTENT                                │
 *   │  · world     │  (WorldPathClient / WorldPageClient / Wiki)  │
 *   │    switcher  │                                              │
 *   │    (navigates│                                              │
 *   │    to slug)  │                                              │
 *   │  · chapters  │                                              │
 *   │  · stats     │                                              │
 *   │  · mode btns │                                              │
 *   └──────────────┴──────────────────────────────────────────────┘
 *
 * World switcher navigates (URL changes to /world/dj, /world/producer, etc.)
 * View toggle (World/Wiki) is in-page state.
 */
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { WorldSlug, getWorldTheme, getChapterEmoji } from "./worldTheme";
import { WorldWiki } from "./WorldWiki";
import { chaptersByWorld } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";
import { useProgress } from "@/lib/progress";

// ─── World switcher config ─────────────────────────────────────────────────────
type SwitcherWorld = { slug: WorldSlug; emoji: string; label: string; shortLabel: string };
const SWITCHER_WORLDS: SwitcherWorld[] = [
  { slug: "fundamentals", emoji: "🎵", label: "Fundamentals", shortLabel: "Fund." },
  { slug: "dj",           emoji: "🎧", label: "DJ World",     shortLabel: "DJ"    },
  { slug: "producer",     emoji: "🎛", label: "Producer",     shortLabel: "Prod." },
];

interface WorldShellProps {
  worldSlug: WorldSlug;
  children: React.ReactNode;
  currentView?: "world" | "wiki";
}

type ShellView = "world" | "wiki";

// ─── Sidebar world switcher pill ──────────────────────────────────────────────
function SwitcherPill({
  world,
  active,
  pct,
  isDark,
}: {
  world: SwitcherWorld;
  active: boolean;
  pct: number;
  isDark: boolean;
}) {
  return (
    <Link
      href={`/world/${world.slug}`}
      className={`flex items-center gap-2.5 px-3 py-2.5 brutal-border brutal-press transition-colors w-full ${
        active
          ? isDark
            ? "bg-volt text-ink border-volt"
            : "bg-ink text-bone border-ink"
          : isDark
          ? "bg-white/5 text-bone/60 hover:bg-white/10 hover:text-bone border-bone/20"
          : "bg-ink/5 text-ink/55 hover:bg-ink/12 hover:text-ink border-ink/15"
      }`}
    >
      <span className="text-base leading-none shrink-0">{world.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="font-display text-xs leading-none">{world.label}</div>
        {/* Mini bar */}
        <div className={`h-0.5 mt-1.5 overflow-hidden ${active ? "bg-current/25" : "bg-current/12"}`}>
          <div
            className="h-full bg-current/60 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <span className="font-mono text-[9px] tabular-nums opacity-50 shrink-0">{pct}%</span>
    </Link>
  );
}

// ─── Main shell ───────────────────────────────────────────────────────────────
export function WorldShell({ worldSlug, children, currentView = "world" }: WorldShellProps) {
  const [activeView, setActiveView] = useState<ShellView>(currentView);
  const theme = getWorldTheme(worldSlug);
  const { progress } = useProgress();
  const completed = progress.completedMissions;

  const chapters = chaptersByWorld(worldSlug);
  const paths = pathsByWorld(worldSlug);
  const isDark = worldSlug === "dj";

  // World-level progress
  const allSlugs = paths.flatMap((p) => p.missionSlugs);
  const worldDone = allSlugs.filter((s) => !!completed[s]).length;
  const worldTotal = allSlugs.length;
  const worldPct = worldTotal > 0 ? Math.round((worldDone / worldTotal) * 100) : 0;

  // Per-world pct for switcher pills
  const worldPcts = SWITCHER_WORLDS.reduce<Record<string, number>>((acc, w) => {
    const ps = pathsByWorld(w.slug);
    const slugs = ps.flatMap((p) => p.missionSlugs);
    const done = slugs.filter((s) => !!completed[s]).length;
    acc[w.slug] = slugs.length > 0 ? Math.round((done / slugs.length) * 100) : 0;
    return acc;
  }, {});

  // Per-chapter progress
  const chapterStats = chapters.map((ch) => {
    const chPaths = paths.filter((p) => p.chapter === ch.slug);
    const chSlugs = chPaths.flatMap((p) => p.missionSlugs);
    const chDone = chSlugs.filter((s) => !!completed[s]).length;
    const chPct = chSlugs.length > 0 ? Math.round((chDone / chSlugs.length) * 100) : 0;
    const complete = chDone === chSlugs.length && chSlugs.length > 0;
    return { ...ch, pct: chPct, done: chDone, total: chSlugs.length, complete };
  });

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.textPrimary}`}>

      {/* ── Slim sticky header ─────────────────────────────────────────── */}
      <header className={`sticky top-[52px] md:top-[56px] z-30 ${theme.heroBg} ${theme.heroText} ${theme.heroBorder}`}>
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center gap-4">

          {/* Back */}
          <Link
            href="/worlds"
            className={`font-mono text-[10px] uppercase opacity-50 hover:opacity-100 transition-opacity shrink-0 hidden sm:block`}
          >
            ← Worlds
          </Link>

          {/* Emoji + title */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-2xl leading-none">{theme.emoji}</span>
            <span className="font-display text-xl leading-none hidden sm:block">
              {theme.title.toUpperCase()}
            </span>
          </div>

          {/* Progress bar — flex fill */}
          <div className="flex-1 flex items-center gap-2 max-w-xs">
            <div className={`flex-1 h-2 brutal-border overflow-hidden ${theme.barBg}`}>
              <div
                className={`h-full ${theme.barFill} transition-all duration-700`}
                style={{ width: `${worldPct}%` }}
              />
            </div>
            <span className={`font-mono text-[10px] tabular-nums opacity-55 shrink-0`}>
              {worldDone}/{worldTotal}
            </span>
          </div>

          {/* Spacer */}
          <div className="flex-1 hidden md:block" />

          {/* View toggle */}
          <div className={`inline-flex brutal-border overflow-hidden shrink-0 ${theme.viewToggleBg}`}>
            <button
              onClick={() => setActiveView("world")}
              className={`px-4 py-2 font-display text-xs transition-colors ${
                activeView === "world"
                  ? theme.viewToggleActive
                  : `${theme.viewToggleText} hover:opacity-80`
              }`}
            >
              World
            </button>
            <button
              onClick={() => setActiveView("wiki")}
              className={`px-4 py-2 font-display text-xs transition-colors border-l-2 border-current/20 ${
                activeView === "wiki"
                  ? theme.viewToggleActive
                  : `${theme.viewToggleText} hover:opacity-80`
              }`}
            >
              Wiki
            </button>
          </div>

          {/* Cat — small */}
          <div
            className="shrink-0 w-8 h-8 wiggle hidden md:block"
            style={{ filter: "drop-shadow(2px 2px 0 rgba(0,0,0,0.2))" }}
            aria-hidden
          >
            <Image
              src={theme.catMain}
              alt=""
              width={32}
              height={32}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </header>

      {/* ── Body: sidebar + content ─────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto flex min-h-[calc(100vh-120px)]">

        {/* ── Sidebar ────────────────────────────────────────────────────── */}
        <aside
          className={`w-60 shrink-0 hidden md:flex flex-col sticky top-[100px] self-start max-h-[calc(100vh-100px)] ${theme.sidebarBg} ${theme.sidebarBorder}`}
        >
          <div className="flex-1 overflow-y-auto">

            {/* World switcher */}
            <div className="p-3 border-b border-current/15">
              <div className={`font-mono text-[8px] uppercase mb-2 opacity-50`}>SWITCH WORLD</div>
              <div className="space-y-1.5">
                {SWITCHER_WORLDS.map((w) => (
                  <SwitcherPill
                    key={w.slug}
                    world={w}
                    active={w.slug === worldSlug}
                    pct={worldPcts[w.slug] ?? 0}
                    isDark={isDark}
                  />
                ))}
              </div>
            </div>

            {/* Chapter list */}
            <div className="p-3 border-b border-current/15">
              <div className={`font-mono text-[8px] uppercase mb-2 opacity-50`}>CHAPTERS</div>
              <div className="space-y-1">
                {chapterStats.map((ch) => {
                  const emoji = getChapterEmoji(ch.slug);
                  return (
                    <button
                      key={ch.slug}
                      onClick={() => {
                        setActiveView("wiki");
                        setTimeout(() => {
                          document
                            .getElementById(`wiki-chapter-${ch.slug}`)
                            ?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }, 100);
                      }}
                      className={`w-full text-left flex items-center gap-2 px-2.5 py-2 brutal-border transition-colors brutal-press ${
                        ch.complete
                          ? theme.pillDone
                          : ch.pct > 0
                          ? theme.pillPartial
                          : isDark
                          ? "bg-white/5 text-bone/60 border-bone/15 hover:bg-white/10"
                          : `${theme.viewToggleBg} ${theme.viewToggleText} hover:opacity-80`
                      }`}
                    >
                      <span className="text-sm shrink-0">{ch.complete ? "✓" : emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-display text-[10px] leading-tight truncate">{ch.title}</div>
                        <div className={`font-mono text-[7px] opacity-50 mt-0.5`}>
                          CH{String(ch.number).padStart(2, "0")} · {ch.pct}%
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stats */}
            <div className="p-3 border-b border-current/15">
              <div className={`font-mono text-[8px] uppercase mb-2 opacity-50`}>WORLD STATS</div>
              <div className="space-y-1.5">
                {[
                  { label: "Missions", value: `${worldDone}/${worldTotal}` },
                  { label: "Complete", value: `${worldPct}%` },
                  { label: "Chapters",  value: `${chapterStats.filter((c) => c.complete).length}/${chapters.length}` },
                  { label: "Paths",    value: `${paths.length}` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className={`font-mono text-[9px] opacity-55`}>{label}</span>
                    <span className="font-display text-sm">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mode buttons */}
            <div className="p-3">
              <div className={`font-mono text-[8px] uppercase mb-2 opacity-50`}>LEARN MODE</div>
              <div className="space-y-1.5">
                <Link
                  href={`/world/${worldSlug}`}
                  className={`flex items-center gap-2 brutal-border px-3 py-2 font-display text-xs brutal-press transition-colors ${theme.flowBtn}`}
                >
                  <span>🌊</span>
                  <div>
                    <div className="leading-none">Flow Mode</div>
                    <div className="font-mono text-[7px] opacity-55 mt-0.5 font-normal">Sequential · guided</div>
                  </div>
                </Link>
                <Link
                  href={`/world/${worldSlug}?view=free`}
                  className={`flex items-center gap-2 brutal-border px-3 py-2 font-display text-xs brutal-press transition-colors ${theme.freeBtn}`}
                >
                  <span>🔓</span>
                  <div>
                    <div className="leading-none">Free Mode</div>
                    <div className="font-mono text-[7px] opacity-55 mt-0.5 font-normal">All open · jump anywhere</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Mobile sidebar (horizontal strip) ──────────────────────────── */}
        <div className="md:hidden w-full border-b-4 border-ink">
          {/* Mobile world switcher */}
          <div className={`flex border-b-2 border-current/15 ${theme.sidebarBg}`}>
            {SWITCHER_WORLDS.map((w) => {
              const isActive = w.slug === worldSlug;
              return (
                <Link
                  key={w.slug}
                  href={`/world/${w.slug}`}
                  className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 brutal-press transition-colors ${
                    isActive
                      ? isDark ? "bg-volt text-ink" : "bg-ink text-bone"
                      : isDark ? "text-bone/50 hover:text-bone" : "text-ink/50 hover:text-ink"
                  }`}
                >
                  <span className="text-lg">{w.emoji}</span>
                  <span className="font-mono text-[8px] uppercase">{w.shortLabel}</span>
                  <span className="font-mono text-[7px] opacity-50">{worldPcts[w.slug]}%</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Main content area ───────────────────────────────────────────── */}
        <main className={`flex-1 min-w-0 ${theme.contentBg}`}>
          {activeView === "world" ? (
            children
          ) : (
            <WorldWiki worldSlug={worldSlug} />
          )}
        </main>
      </div>
    </div>
  );
}
