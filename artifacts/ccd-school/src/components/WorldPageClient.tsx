"use client";
/**
 * WorldPageClient — Free Mode chapter/path browser.
 *
 * Progressive disclosure:
 *   - Nothing auto-expanded on load — just chapter cards showing title + progress
 *   - Click chapter → expands to show PATHS ONLY (not mission chips)
 *   - Each path card has title, tagline, progress, START/CONTINUE/DONE button
 *   - "Show missions →" toggle inside each path reveals individual mission links
 *
 * Cat mascot alongside each chapter header for personality.
 * "Back to Path View" pill at top to escape back to Flow mode snake.
 */
import Link from "next/link";
import Image from "next/image";
import { chaptersByWorld, WORLD_TROPHIES } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";
import { useProgress } from "@/lib/progress";
import { useState } from "react";

type WorldSlug = "fundamentals" | "dj" | "producer";

const WORLD_CONFIG: Record<WorldSlug, {
  title: string; emoji: string; tagline: string; description: string;
  hero: string; bar: string; accent: string; cta: string; catSrc: string;
}> = {
  fundamentals: {
    title: "Fundamentals", emoji: "🎵",
    tagline: "The vocabulary of music — before you produce or DJ",
    description: "5 chapters · 10 paths · 40 missions",
    hero: "bg-acid text-ink", bar: "bg-ink", accent: "bg-ink text-bone",
    cta: "bg-acid text-ink", catSrc: "/cats/cat-handstand.png",
  },
  dj: {
    title: "DJ World", emoji: "🎧",
    tagline: "The art of playing recorded music for people",
    description: "5 chapters · 10 paths · 40 missions",
    hero: "bg-ink text-bone", bar: "bg-volt", accent: "bg-volt text-ink",
    cta: "bg-volt text-ink", catSrc: "/cats/cat-dj.png",
  },
  producer: {
    title: "Producer", emoji: "🎛",
    tagline: "Build music in Ableton Live 12",
    description: "6 chapters · 15 paths · 91 missions",
    hero: "bg-sun text-ink", bar: "bg-ink", accent: "bg-ink text-bone",
    cta: "bg-sun text-ink", catSrc: "/cats/cat-dj-hero.png",
  },
};

const CHAPTER_EMOJIS: Record<string, string> = {
  "sound-science": "🔊", "rhythm-and-time": "🥁", "melody-and-pitch": "🎵",
  "harmony-and-chords": "🎹", "music-technology": "💻",
  "setup-and-culture": "🎧", "the-library": "📚", "the-mix-dj": "🎛",
  "dj-performance": "🎤", "dj-mastery": "🏆",
  "first-contact": "🖥", "sound-and-midi": "🎼", "the-mix-producer": "🎚",
  "performance-and-flow": "🚀", "advanced-producer": "⚡", "synthesis": "🌀",
};

// Path card — shows title/tagline/progress, missions hidden behind toggle
function PathCard({
  path,
  completed,
  world,
  cfg,
}: {
  path: ReturnType<typeof pathsByWorld>[number];
  completed: Record<string, unknown>;
  world: WorldSlug;
  cfg: typeof WORLD_CONFIG[WorldSlug];
}) {
  const [showMissions, setShowMissions] = useState(false);
  const done = path.missionSlugs.filter(s => !!completed[s]).length;
  const total = path.missionSlugs.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const complete = done === total && total > 0;

  return (
    <div className="brutal-border overflow-hidden">
      {/* Path header row */}
      <div className="p-4 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[9px] uppercase opacity-40 mb-0.5">
            PATH {path.number} · {total} MISSIONS
          </div>
          <div className="font-display text-lg leading-tight">{path.title}</div>
          <div className="font-mono text-xs opacity-60 mt-0.5 leading-snug">{path.tagline}</div>

          {/* Progress bar */}
          <div className="mt-2.5 flex items-center gap-2">
            <div className="flex-1 h-1.5 brutal-border bg-ink/10 overflow-hidden">
              <div
                className={`h-full ${cfg.bar} transition-all duration-500`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="font-mono text-[9px] opacity-50 shrink-0">{done}/{total}</span>
          </div>
        </div>

        {/* CTA */}
        <div className="shrink-0 flex flex-col items-end gap-2">
          <Link
            href={`/path/${path.slug}`}
            className={`brutal-border px-4 py-2 font-display text-sm brutal-press text-center block ${
              complete ? cfg.accent : cfg.cta
            }`}
          >
            {complete ? "DONE ✓" : done > 0 ? "CONTINUE →" : "START →"}
          </Link>
        </div>
      </div>

      {/* Show/hide missions toggle */}
      <div className="border-t border-ink/10">
        <button
          onClick={() => setShowMissions(v => !v)}
          className="w-full px-4 py-2 flex items-center justify-between font-mono text-[9px] uppercase opacity-50 hover:opacity-80 transition-opacity brutal-press"
        >
          <span>{showMissions ? "Hide lessons ▲" : `Show ${total} lessons ▼`}</span>
          {complete && <span className="text-[10px]">✓ Complete</span>}
        </button>

        {showMissions && (
          <div className="px-4 pb-4 flex flex-wrap gap-1.5 border-t border-ink/10 pt-3">
            {path.missionSlugs.map((s, idx) => {
              const isDone = !!completed[s];
              return (
                <Link
                  key={s}
                  href={`/learn/${s}`}
                  className={`brutal-border px-2.5 py-1 font-mono text-[9px] uppercase brutal-press transition-colors ${
                    isDone
                      ? world === "dj" ? "bg-volt text-ink" : "bg-ink text-bone"
                      : "bg-bone hover:bg-acid"
                  }`}
                >
                  {isDone ? "✓ " : `${idx + 1}. `}
                  {s.replace(/-/g, " ")}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function WorldPageClient({ slug }: { slug: string }) {
  const world = slug as WorldSlug;
  const cfg = WORLD_CONFIG[world];
  const { progress } = useProgress();
  const completed = progress.completedMissions;
  const chapters = chaptersByWorld(world);
  const allPaths = pathsByWorld(world);
  // Nothing auto-expanded — user clicks to open
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

  if (!cfg) return <div className="p-8 font-mono">World not found</div>;

  const chapterStats = (chSlug: string) => {
    const paths = allPaths.filter(p => p.chapter === chSlug);
    const slugs = paths.flatMap(p => p.missionSlugs);
    const done = slugs.filter(s => !!completed[s]).length;
    const total = slugs.length;
    return {
      done, total,
      pct: total > 0 ? Math.round((done / total) * 100) : 0,
      complete: done === total && total > 0,
    };
  };

  const worldDone = allPaths.flatMap(p => p.missionSlugs).filter(s => !!completed[s]).length;
  const worldTotal = allPaths.flatMap(p => p.missionSlugs).length;
  const worldPct = worldTotal > 0 ? Math.round((worldDone / worldTotal) * 100) : 0;
  const trophy = WORLD_TROPHIES[world];

  return (
    <main className="min-h-screen bg-bone">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className={`brutal-border border-x-0 border-t-0 ${cfg.hero}`}>
        <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <Link
                href="/worlds"
                className="font-mono text-[10px] uppercase opacity-50 hover:opacity-100 transition-opacity block mb-3"
              >
                ← ALL WORLDS
              </Link>
              <h1 className="font-display text-5xl md:text-7xl leading-none mb-2">
                {cfg.emoji} {cfg.title.toUpperCase()}
              </h1>
              <p className="font-mono text-xs opacity-60 mb-1">{cfg.tagline}</p>
              <p className="font-mono text-[10px] opacity-40">{cfg.description}</p>

              {/* World progress bar */}
              <div className="mt-4 flex items-center gap-3">
                <div className={`flex-1 h-2 brutal-border overflow-hidden ${world === "dj" ? "bg-bone/10" : "bg-ink/10"}`}>
                  <div
                    className={`h-full ${cfg.bar} transition-all duration-700`}
                    style={{ width: `${worldPct}%` }}
                  />
                </div>
                <div className="font-mono text-xs opacity-60 shrink-0">
                  {worldDone}/{worldTotal} · {worldPct}%
                </div>
              </div>
            </div>

            {/* Cat mascot */}
            <div
              className="shrink-0 w-20 h-20 md:w-28 md:h-28 wiggle"
              style={{ filter: "drop-shadow(4px 4px 0 hsl(222 47% 4%))" }}
              aria-hidden
            >
              <Image src={cfg.catSrc} alt="" width={112} height={112} className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Back to snake pill */}
          <div className="mt-4 flex items-center gap-3">
            <Link
              href={`/world/${world}`}
              className={`brutal-border px-3 py-1.5 font-mono text-[9px] uppercase brutal-press transition-colors ${
                world === "dj"
                  ? "bg-bone/10 text-bone hover:bg-volt/30"
                  : "bg-ink/10 text-ink hover:bg-acid/60"
              }`}
            >
              🌊 Back to Path View
            </Link>
            <span className="font-mono text-[9px] opacity-40 uppercase">Free Mode — all lessons open</span>
          </div>
        </div>
      </header>

      {/* ── Chapter list — nothing auto-expanded ────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-3 pb-24">

        <div className="font-mono text-[10px] uppercase opacity-40 mb-4">
          // {chapters.length} CHAPTERS — CLICK TO EXPLORE
        </div>

        {chapters.map((ch, chIdx) => {
          const stats = chapterStats(ch.slug);
          const isOpen = expandedChapter === ch.slug;
          const chPaths = allPaths
            .filter(p => p.chapter === ch.slug)
            .sort((a, b) => a.number - b.number);
          const chEmoji = CHAPTER_EMOJIS[ch.slug] ?? "📖";

          return (
            <div key={ch.slug} className="brutal-border overflow-hidden">

              {/* Chapter header — always visible, click to expand */}
              <button
                onClick={() => setExpandedChapter(isOpen ? null : ch.slug)}
                className="w-full text-left p-4 md:p-5 flex items-center gap-4 hover:bg-ink/5 transition-colors brutal-press"
              >
                {/* Emoji + cat */}
                <div className="shrink-0 flex flex-col items-center gap-1 w-10">
                  <span className="text-2xl">{chEmoji}</span>
                  {stats.complete && (
                    <span className="font-mono text-[8px] text-acid bg-ink px-1">✓</span>
                  )}
                </div>

                {/* Title block */}
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-[9px] uppercase opacity-40 mb-0.5">
                    CHAPTER {ch.number} · {chPaths.length} PATHS · {stats.total} MISSIONS
                  </div>
                  <div className="font-display text-xl md:text-2xl leading-tight">{ch.title}</div>
                  <div className="font-mono text-xs opacity-55 mt-0.5 leading-snug">{ch.tagline}</div>
                </div>

                {/* Right: pct + chevron */}
                <div className="shrink-0 flex flex-col items-end gap-1">
                  <div className="font-display text-2xl tabular-nums">
                    {stats.pct}%
                  </div>
                  <div className="font-mono text-[9px] opacity-40">{stats.done}/{stats.total}</div>
                  {stats.complete && (
                    <div className="font-mono text-[8px]">🏆 {ch.trophy.name}</div>
                  )}
                </div>

                <div className={`font-display text-xl opacity-40 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`}>
                  ▾
                </div>
              </button>

              {/* Thin progress bar always visible under header */}
              <div className="h-1 bg-ink/5">
                <div
                  className={`h-full ${world === "dj" ? "bg-volt" : "bg-acid"} transition-all duration-500`}
                  style={{ width: `${stats.pct}%` }}
                />
              </div>

              {/* Expanded content — paths only (missions hidden inside each path) */}
              {isOpen && (
                <div className="border-t border-ink/10">
                  {/* Chapter description */}
                  <div className="px-4 md:px-5 py-3 bg-bone/50 flex items-start gap-3">
                    {/* Small cat quip */}
                    <div
                      className="shrink-0 w-10 h-10"
                      style={{ filter: "drop-shadow(2px 2px 0 hsl(222 47% 4%))" }}
                      aria-hidden
                    >
                      <Image src={cfg.catSrc} alt="" width={40} height={40} className="w-full h-full object-contain" />
                    </div>
                    <p className="font-mono text-xs leading-relaxed opacity-60 max-w-2xl">{ch.description}</p>
                  </div>

                  {/* Path cards */}
                  <div className="divide-y divide-ink/10">
                    {chPaths.map(path => (
                      <div key={path.slug} className="px-4 md:px-5 py-1">
                        <PathCard
                          path={path}
                          completed={completed}
                          world={world}
                          cfg={cfg}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Chapter trophy — shown if complete */}
                  {stats.complete && (
                    <div className={`px-4 py-3 border-t border-ink/10 ${cfg.accent}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🏆</span>
                        <div>
                          <div className="font-display text-base">{ch.trophy.name}</div>
                          <div className="font-mono text-[9px] opacity-70">{ch.trophy.description}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* World trophy */}
        <div className={`brutal-border p-5 mt-4 ${
          worldPct === 100
            ? world === "dj" ? "bg-volt text-ink" : "bg-acid text-ink"
            : "bg-bone opacity-40"
        }`}>
          <div className="font-mono text-[9px] uppercase mb-1">WORLD TROPHY</div>
          <div className="font-display text-2xl">🏆 {trophy.name}</div>
          <div className="font-mono text-xs mt-1 opacity-70">{trophy.description}</div>
          {worldPct < 100 && (
            <div className="font-mono text-[9px] uppercase mt-2 opacity-50">
              Complete all {chapters.length} chapters to unlock
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
