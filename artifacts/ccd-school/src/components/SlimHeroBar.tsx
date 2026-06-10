"use client";
/**
 * SlimHeroBar — Compact sticky bar that replaces WorldHero + ChapterTrack + WorldViewToggle.
 *
 * Renders at the top of both Flow Mode (WorldPathClient) and Free Mode (WorldPageClient).
 * Contains: world emoji + title, slim progress bar, scrollable chapter nodes,
 * FlowFreePill toggle, and a chevron dropdown with XP/streak/gems details.
 */
import { useState, useEffect } from "react";
import { FlowFreePill } from "@/components/FlowFreePill";
import { useProgress } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import { chaptersByWorld } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";

// ─── World meta — accent backgrounds ─────────────────────────────────────────
const WORLD_META: Record<string, {
  accentBg: string;
  emoji: string;
  title: string;
  tagline: string;
}> = {
  fundamentals: {
    accentBg: "bg-acid",
    emoji: "🎵",
    title: "Fundamentals",
    tagline: "Sound · Rhythm · Melody · Harmony · Music Tech",
  },
  dj: {
    accentBg: "bg-volt",
    emoji: "🎧",
    title: "DJ World",
    tagline: "Setup · Library · The Mix · Performance · Mastery",
  },
  producer: {
    accentBg: "bg-sun",
    emoji: "🎛",
    title: "Producer",
    tagline: "First Contact · Sound & MIDI · Mix · Performance · Advanced",
  },
};

export interface SlimHeroBarProps {
  worldSlug: string;
  showFree: boolean;
}

export function SlimHeroBar({ worldSlug, showFree }: SlimHeroBarProps) {
  const meta = WORLD_META[worldSlug];
  const { progress } = useProgress();
  const { setLearnMode } = useLearnMode();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Sync learnMode context on mount
  useEffect(() => {
    if (showFree) {
      setLearnMode("classic");
    } else {
      setLearnMode("flow");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFree]);

  if (!meta) return null;

  const chapters = chaptersByWorld(worldSlug as "fundamentals" | "dj" | "producer");
  const allPaths = pathsByWorld(worldSlug as "fundamentals" | "dj" | "producer");

  // Calculate progress percentage
  const allSlugs = allPaths.flatMap((p) => p.missionSlugs);
  const total = allSlugs.length;
  const done = allSlugs.filter((s) => !!progress.completedMissions[s]).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const scrollToChapter = (chapterSlug: string) => {
    const el = document.getElementById(`chapter-${chapterSlug}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className={`sticky top-[52px] md:top-[56px] z-30 h-12 md:h-14 border-b-4 border-ink flex items-stretch relative ${meta.accentBg}`}>

      {/* Left zone: world emoji + title */}
      <div className="px-3 flex items-center gap-2 shrink-0 border-r-4 border-ink">
        <span className="text-base leading-none">{meta.emoji}</span>
        <span className="font-display text-sm uppercase leading-none whitespace-nowrap">
          {meta.title.toUpperCase()}
        </span>
      </div>

      {/* Center zone: progress bar + scrollable chapter nodes */}
      <div className="flex-1 flex flex-col justify-center overflow-hidden">
        {/* Slim progress bar */}
        <div className="h-1.5 bg-ink/10 w-full">
          <div
            className="h-full bg-ink/70 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Horizontally scrollable chapter nodes */}
        <div className="overflow-x-auto flex items-center gap-1 px-2 py-0.5 scrollbar-none" style={{ scrollbarWidth: "none" }}>
          {chapters.map((ch, i) => {
            const chSlugs = allPaths
              .filter((p) => p.chapter === ch.slug)
              .flatMap((p) => p.missionSlugs);
            const chDone = chSlugs.filter((s) => !!progress.completedMissions[s]).length;
            const complete = chDone === chSlugs.length && chSlugs.length > 0;
            return (
              <button
                key={ch.slug}
                onClick={() => scrollToChapter(ch.slug)}
                title={ch.title}
                className={`shrink-0 brutal-border px-2 py-0.5 font-mono text-[8px] uppercase brutal-press transition-colors hover:bg-ink/20 ${
                  complete ? "bg-ink text-bone" : "bg-ink/10 text-ink/70"
                }`}
              >
                {complete ? "✓" : String(i + 1).padStart(2, "0")}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right zone: FlowFreePill + chevron */}
      <div className="px-2 flex items-center gap-1.5 shrink-0 border-l-4 border-ink">
        <FlowFreePill worldSlug={worldSlug} showFree={showFree} compact />
        <button
          onClick={() => setDropdownOpen((o) => !o)}
          aria-label={dropdownOpen ? "Close world details" : "Open world details"}
          aria-expanded={dropdownOpen}
          className="brutal-border bg-ink/10 px-2 py-1 font-mono text-xs brutal-press hover:bg-ink/25 transition-colors"
        >
          ▾
        </button>
      </div>

      {/* Dropdown overlay + panel */}
      {dropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setDropdownOpen(false)}
            aria-hidden
          />
          <div className="absolute top-full left-0 right-0 z-50 brutal-border bg-bone chunk-shadow animate-fade-in">
            <div className="px-4 py-3 border-b-4 border-ink flex items-center justify-between gap-4">
              <div>
                <div className="font-display text-lg leading-none">{meta.emoji} {meta.title.toUpperCase()}</div>
                <div className="font-mono text-[9px] uppercase opacity-55 mt-1">{meta.tagline}</div>
              </div>
              <div className="font-display text-2xl tabular-nums">{pct}%</div>
            </div>
            <div className="px-4 py-3 flex items-center gap-6 flex-wrap">
              <div>
                <div className="font-mono text-[9px] uppercase opacity-45 mb-0.5">XP</div>
                <div className="font-display text-base">{progress.xp}</div>
              </div>
              <div>
                <div className="font-mono text-[9px] uppercase opacity-45 mb-0.5">Streak</div>
                <div className="font-display text-base">🔥 {progress.streakDays}</div>
              </div>
              <div>
                <div className="font-mono text-[9px] uppercase opacity-45 mb-0.5">Gems</div>
                <div className="font-display text-base">💎 {progress.gems}</div>
              </div>
              <div>
                <div className="font-mono text-[9px] uppercase opacity-45 mb-0.5">Progress</div>
                <div className="font-display text-base">{done}/{total}</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Re-export FlowFreePill for consumers that import from SlimHeroBar
export { FlowFreePill } from "@/components/FlowFreePill";
