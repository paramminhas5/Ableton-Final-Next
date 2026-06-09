"use client";
/**
 * WorldWiki — full reference wiki for a world.
 *
 * Structure per chapter:
 * - Chapter header (emoji, title, tagline, description, progress, trophy)
 * - Paths within chapter: title, tagline, description
 * - Mission list: slug → title as pill links
 *
 * Themed to the world's color palette via worldTheme.ts
 */
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { chaptersByWorld, WORLD_TROPHIES } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";
import { useProgress } from "@/lib/progress";
import { getWorldTheme, getChapterEmoji, type WorldSlug } from "./worldTheme";

// ─── Mission title map (slug → readable title) ────────────────────────────────
// We pull titles from the missions content but keep it lightweight with a
// shared import so we don't duplicate data.
import { FOUNDATIONS_MISSIONS } from "@/content/missions-foundations";
import { DJ_WORLD_MISSIONS } from "@/content/missions-dj";
import { MISSIONS } from "@/content/missions";

function getMissionTitle(slug: string): string {
  const all = [...FOUNDATIONS_MISSIONS, ...DJ_WORLD_MISSIONS, ...MISSIONS];
  return all.find((m) => m.slug === slug)?.title ?? slug.replace(/-/g, " ");
}

function getMissionTagline(slug: string): string | null {
  const all = [...FOUNDATIONS_MISSIONS, ...DJ_WORLD_MISSIONS, ...MISSIONS];
  return all.find((m) => m.slug === slug)?.tagline ?? null;
}

// ─── Path card in wiki ────────────────────────────────────────────────────────
function WikiPathCard({
  path,
  completed,
  theme,
  isDark,
}: {
  path: ReturnType<typeof pathsByWorld>[number];
  completed: Record<string, { at?: number } | boolean | undefined>;
  theme: ReturnType<typeof getWorldTheme>;
  isDark: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const done = path.missionSlugs.filter((s) => !!completed[s]).length;
  const total = path.missionSlugs.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const complete = done === total && total > 0;

  return (
    <div className={`brutal-border overflow-hidden ${isDark ? "border-bone/20" : ""}`}>
      {/* Path header */}
      <div className={`p-4 ${isDark ? "bg-white/5" : "bg-bone"}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className={`font-mono text-[9px] uppercase mb-1 ${isDark ? "text-bone/40" : "text-ink/40"}`}>
              PATH {path.number} · {total} MISSIONS
            </div>
            <div className={`font-display text-lg leading-tight mb-0.5 ${isDark ? "text-bone" : "text-ink"}`}>
              {path.title}
            </div>
            <div className={`font-mono text-[10px] leading-snug ${isDark ? "text-bone/55" : "text-ink/55"}`}>
              {path.tagline}
            </div>
          </div>

          {/* Progress badge */}
          <div className={`shrink-0 brutal-border px-2.5 py-1.5 text-center min-w-[52px] ${
            complete ? theme.pillDone : pct > 0 ? theme.pillPartial : theme.pillEmpty
          }`}>
            <div className="font-display text-base leading-none tabular-nums">
              {complete ? "✓" : `${pct}%`}
            </div>
            <div className="font-mono text-[7px] uppercase opacity-60 mt-0.5">
              {done}/{total}
            </div>
          </div>
        </div>

        {/* Description */}
        {path.description && (
          <p className={`font-mono text-[10px] leading-relaxed mt-2 ${isDark ? "text-bone/50" : "text-ink/50"}`}>
            {path.description}
          </p>
        )}

        {/* Progress bar */}
        <div className={`h-1 mt-3 overflow-hidden ${theme.barBg}`}>
          <div
            className={`h-full ${theme.barFill} transition-all duration-700`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Mission toggle */}
      <div className={`border-t ${isDark ? "border-bone/10" : "border-ink/10"}`}>
        <button
          onClick={() => setExpanded((v) => !v)}
          className={`w-full px-4 py-2.5 flex items-center justify-between brutal-press transition-colors ${
            isDark
              ? "text-bone/50 hover:text-bone/80 hover:bg-white/5"
              : "text-ink/45 hover:text-ink/80 hover:bg-ink/5"
          }`}
        >
          <span className="font-mono text-[9px] uppercase">
            {expanded ? "▲ Hide lessons" : `▼ ${total} lessons`}
          </span>
          {complete && (
            <span className={`font-mono text-[9px] uppercase ${theme.barFill.replace("bg-", "text-")}`}>
              Complete ✓
            </span>
          )}
        </button>

        {expanded && (
          <div className={`px-4 pb-4 pt-1 ${isDark ? "bg-white/3" : "bg-ink/3"}`}>
            <div className="space-y-1.5">
              {path.missionSlugs.map((slug, idx) => {
                const isDone = !!completed[slug];
                const title = getMissionTitle(slug);
                const tagline = getMissionTagline(slug);
                return (
                  <Link
                    key={slug}
                    href={`/learn/${slug}`}
                    className={`flex items-start gap-3 brutal-border px-3 py-2.5 brutal-press transition-colors group ${
                      isDone
                        ? theme.pillDone
                        : isDark
                        ? "bg-white/5 text-bone hover:bg-white/10 border-bone/20"
                        : "bg-bone text-ink hover:bg-acid/20 border-ink/15"
                    }`}
                  >
                    {/* Index / done */}
                    <span className={`font-mono text-[9px] shrink-0 mt-0.5 w-4 ${isDone ? "opacity-80" : "opacity-40"}`}>
                      {isDone ? "✓" : `${idx + 1}.`}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-display text-xs leading-tight">{title}</div>
                      {tagline && (
                        <div className={`font-mono text-[9px] leading-snug mt-0.5 truncate ${
                          isDone ? "opacity-60" : isDark ? "text-bone/45" : "text-ink/45"
                        }`}>
                          {tagline}
                        </div>
                      )}
                    </div>
                    <span className={`font-mono text-[9px] shrink-0 mt-0.5 opacity-0 group-hover:opacity-60 transition-opacity`}>→</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Chapter section ──────────────────────────────────────────────────────────
function WikiChapterSection({
  ch,
  paths,
  completed,
  theme,
  isDark,
  defaultOpen,
}: {
  ch: ReturnType<typeof chaptersByWorld>[number];
  paths: ReturnType<typeof pathsByWorld>;
  completed: Record<string, { at?: number } | boolean | undefined>;
  theme: ReturnType<typeof getWorldTheme>;
  isDark: boolean;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const chPaths = paths.filter((p) => p.chapter === ch.slug).sort((a, b) => a.number - b.number);
  const chSlugs = chPaths.flatMap((p) => p.missionSlugs);
  const done = chSlugs.filter((s) => !!completed[s]).length;
  const total = chSlugs.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const complete = done === total && total > 0;
  const emoji = getChapterEmoji(ch.slug);
  const chNum = String(ch.number).padStart(2, "0");

  return (
    <div
      id={`wiki-chapter-${ch.slug}`}
      className={`brutal-border overflow-hidden ${isDark ? "border-bone/20" : ""}`}
    >
      {/* Chapter header — always visible, clickable to expand */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full text-left brutal-press transition-colors ${
          isDark ? "hover:bg-white/5" : "hover:bg-ink/5"
        }`}
      >
        <div className={`px-5 py-4 flex items-center gap-4 relative overflow-hidden ${theme.heroBg} ${theme.heroText}`}>
          {/* Accent bar on left */}
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${theme.barFill}`} />

          {/* Chapter number + emoji */}
          <div className="shrink-0 pl-2">
            <div className={`font-mono text-[8px] uppercase opacity-50 mb-1`}>CH {chNum}</div>
            <span className="text-3xl leading-none">{complete ? "✓" : emoji}</span>
          </div>

          {/* Title + tagline */}
          <div className="flex-1 min-w-0">
            <div className="font-display text-xl leading-tight">{ch.title}</div>
            <div className={`font-mono text-[10px] opacity-60 mt-0.5 leading-snug`}>{ch.tagline}</div>
            <div className={`font-mono text-[9px] opacity-40 mt-1 uppercase`}>
              {chPaths.length} paths · {total} missions
            </div>
          </div>

          {/* Right: pct + expand */}
          <div className="shrink-0 flex flex-col items-end gap-2">
            <div className={`font-display text-2xl tabular-nums leading-none`}>
              {complete ? "🏆" : `${pct}%`}
            </div>
            <div className={`font-mono text-[10px] opacity-40`}>{done}/{total}</div>
            <div className={`font-mono text-[9px] opacity-40`}>{open ? "▲" : "▼"}</div>
          </div>
        </div>

        {/* Thin progress bar */}
        <div className={`h-1.5 ${theme.barBg}`}>
          <div
            className={`h-full ${theme.barFill} transition-all duration-700`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </button>

      {/* Expanded content */}
      {open && (
        <div className={`${isDark ? "bg-[#0a1228]" : "bg-bone"}`}>
          {/* Chapter description */}
          <div className={`px-5 py-4 border-b ${isDark ? "border-bone/10" : "border-ink/10"} flex items-start gap-3`}>
            <div className={`font-mono text-xs leading-relaxed ${isDark ? "text-bone/60" : "text-ink/60"}`}>
              {ch.description}
            </div>
          </div>

          {/* Paths */}
          <div className="p-4 space-y-3">
            <div className={`font-mono text-[9px] uppercase mb-3 ${isDark ? "text-bone/40" : "text-ink/40"}`}>
              {chPaths.length} PATHS IN THIS CHAPTER
            </div>
            {chPaths.map((path) => (
              <WikiPathCard
                key={path.slug}
                path={path}
                completed={completed}
                theme={theme}
                isDark={isDark}
              />
            ))}
          </div>

          {/* Chapter trophy */}
          {complete && (
            <div className={`mx-4 mb-4 brutal-border px-4 py-3 flex items-center gap-3 ${theme.pillDone}`}>
              <span className="text-2xl shrink-0">🏆</span>
              <div>
                <div className="font-display text-base">{ch.trophy.name}</div>
                <div className="font-mono text-[9px] opacity-70 mt-0.5">{ch.trophy.description}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function WorldWiki({ worldSlug }: { worldSlug: WorldSlug }) {
  const theme = getWorldTheme(worldSlug);
  const { progress } = useProgress();
  const completed = progress.completedMissions;
  const chapters = chaptersByWorld(worldSlug);
  const paths = pathsByWorld(worldSlug);
  const trophy = WORLD_TROPHIES[worldSlug];

  const isDark = worldSlug === "dj";

  const worldDone = paths.flatMap((p) => p.missionSlugs).filter((s) => !!completed[s]).length;
  const worldTotal = paths.flatMap((p) => p.missionSlugs).length;
  const worldPct = worldTotal > 0 ? Math.round((worldDone / worldTotal) * 100) : 0;

  // Find the first incomplete chapter to auto-open it
  const firstIncompleteIdx = chapters.findIndex((ch) => {
    const chPaths = paths.filter((p) => p.chapter === ch.slug);
    const chSlugs = chPaths.flatMap((p) => p.missionSlugs);
    const done = chSlugs.filter((s) => !!completed[s]).length;
    return done < chSlugs.length;
  });

  return (
    <div className={`${isDark ? "bg-[#0a0f2e] text-bone" : "bg-bone text-ink"} min-h-full`}>

      {/* Wiki header */}
      <div className={`px-5 pt-5 pb-4 border-b ${isDark ? "border-bone/15" : "border-ink/10"}`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className={`font-mono text-[9px] uppercase mb-1 ${isDark ? "text-bone/40" : "text-ink/40"}`}>
              WORLD WIKI
            </div>
            <h2 className="font-display text-2xl leading-tight">
              {theme.emoji} {theme.title}
            </h2>
            <p className={`font-mono text-xs mt-1 ${isDark ? "text-bone/50" : "text-ink/50"}`}>
              {chapters.length} chapters · {paths.length} paths · {worldTotal} missions · {worldPct}% complete
            </p>
          </div>

          <div className={`brutal-border px-3 py-2 text-center ${
            worldPct === 100 ? "bg-volt text-ink" : isDark ? "bg-white/5 text-bone" : "bg-ink/5 text-ink"
          }`}>
            <div className="font-display text-2xl tabular-nums">{worldPct}%</div>
            <div className={`font-mono text-[8px] uppercase opacity-50 mt-0.5`}>{worldDone}/{worldTotal}</div>
          </div>
        </div>
      </div>

      {/* Chapter list */}
      <div className="p-4 space-y-3 pb-10">
        <div className={`font-mono text-[9px] uppercase mb-4 ${isDark ? "text-bone/40" : "text-ink/40"}`}>
          // {chapters.length} CHAPTERS — CLICK TO EXPAND
        </div>

        {chapters.map((ch, i) => (
          <WikiChapterSection
            key={ch.slug}
            ch={ch}
            paths={paths}
            completed={completed}
            theme={theme}
            isDark={isDark}
            defaultOpen={i === firstIncompleteIdx || (firstIncompleteIdx === -1 && i === 0)}
          />
        ))}

        {/* World trophy */}
        <div className={`brutal-border p-5 mt-4 ${
          worldPct === 100
            ? "bg-volt text-ink"
            : isDark
            ? "bg-white/5 text-bone/40 border-bone/15"
            : "bg-ink/5 text-ink/40"
        }`}>
          <div className={`font-mono text-[9px] uppercase mb-2 ${worldPct === 100 ? "opacity-60" : "opacity-40"}`}>
            WORLD TROPHY
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{worldPct === 100 ? "🏆" : "🔒"}</span>
            <div>
              <div className="font-display text-xl">{trophy?.name ?? "World Master"}</div>
              <div className={`font-mono text-[10px] mt-0.5 ${worldPct === 100 ? "opacity-70" : "opacity-40"}`}>
                {trophy?.description ?? `Complete all ${chapters.length} chapters to unlock`}
              </div>
              {worldPct < 100 && (
                <div className={`font-mono text-[9px] uppercase mt-1.5 ${isDark ? "text-bone/30" : "text-ink/30"}`}>
                  {worldTotal - worldDone} missions remaining
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
