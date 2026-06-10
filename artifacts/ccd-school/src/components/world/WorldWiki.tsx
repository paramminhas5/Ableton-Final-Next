"use client";
/**
 * WorldWiki — full reference wiki for a single world.
 *
 * Used inside WorldShell (free view) AND by the standalone WikiPageClient.
 *
 * Per chapter:
 *  - Accordion header (emoji, title, tagline, progress, ▶ Start CTA)
 *  - Chapter description
 *  - Path cards (title, tagline, description, progress, mission list toggle)
 *  - Each mission → direct /learn/[slug] link with title + tagline
 *  - Chapter trophy when complete
 * World trophy at bottom.
 */
import Link from "next/link";
import { useState } from "react";
import { chaptersByWorld, WORLD_TROPHIES } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";
import { useProgress } from "@/lib/progress";
import { FOUNDATIONS_MISSIONS } from "@/content/missions-foundations";
import { DJ_WORLD_MISSIONS } from "@/content/missions-dj";
import { MISSIONS } from "@/content/missions";
import { getWorldTheme, getChapterEmoji, type WorldSlug } from "@/components/world/worldTheme";

// ─── Mission lookup ───────────────────────────────────────────────────────────
const ALL_MISSIONS = [...FOUNDATIONS_MISSIONS, ...DJ_WORLD_MISSIONS, ...MISSIONS];
function getMissionTitle(slug: string) {
  return ALL_MISSIONS.find((m) => m.slug === slug)?.title ?? slug.replace(/-/g, " ");
}
function getMissionTagline(slug: string): string | null {
  return ALL_MISSIONS.find((m) => m.slug === slug)?.tagline ?? null;
}

// ─── Path card ────────────────────────────────────────────────────────────────
function WikiPathCard({
  path,
  completed,
  isDark,
  pillDone,
  pillPartial,
  pillEmpty,
  barBg,
  barFill,
}: {
  path: ReturnType<typeof pathsByWorld>[number];
  completed: Record<string, unknown>;
  isDark: boolean;
  pillDone: string;
  pillPartial: string;
  pillEmpty: string;
  barBg: string;
  barFill: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const done = path.missionSlugs.filter((s) => !!completed[s]).length;
  const total = path.missionSlugs.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const complete = done === total && total > 0;

  const textBase = isDark ? "text-bone" : "text-ink";
  const textMuted = isDark ? "text-bone/55" : "text-ink/55";
  const borderMuted = isDark ? "border-bone/12" : "border-ink/10";
  const hoverBg = isDark ? "hover:bg-bone/5" : "hover:bg-ink/4";
  const missionRow = isDark
    ? "bg-bone/5 text-bone border-bone/12 hover:bg-bone/10"
    : "bg-ink/4 text-ink border-ink/10 hover:bg-acid/15";
  const missionDone = complete ? pillDone : "";

  return (
    <div className={`brutal-border overflow-hidden ${isDark ? "border-bone/15" : ""}`}>
      {/* Path header */}
      <div className={`p-4 ${isDark ? "bg-bone/3" : "bg-bone"}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className={`font-mono text-[8px] uppercase mb-1 ${textMuted}`}>
              PATH {path.number} · {total} MISSIONS
            </div>
            <div className={`font-display text-lg leading-tight mb-0.5 ${textBase}`}>{path.title}</div>
            <div className={`font-mono text-xs leading-snug ${textMuted}`}>{path.tagline}</div>
          </div>
          {/* Badge */}
          <div
            className={`shrink-0 brutal-border px-2.5 py-1.5 text-center min-w-[50px] ${
              complete ? pillDone : pct > 0 ? pillPartial : pillEmpty
            }`}
          >
            <div className="font-display text-sm leading-none tabular-nums">
              {complete ? "✓" : `${pct}%`}
            </div>
            <div className="font-mono text-[7px] uppercase opacity-55 mt-0.5">{done}/{total}</div>
          </div>
        </div>

        {path.description && (
          <p className={`font-mono text-[10px] leading-relaxed mt-2 ${textMuted}`}>
            {path.description}
          </p>
        )}

        {/* Progress bar */}
        <div className={`h-1 mt-3 overflow-hidden ${barBg}`}>
          <div
            className={`h-full ${barFill} transition-all duration-700`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Mission toggle */}
      <div className={`border-t ${borderMuted}`}>
        <button
          onClick={() => setExpanded((v) => !v)}
          className={`w-full px-4 py-2.5 flex items-center justify-between brutal-press transition-colors ${hoverBg} ${textMuted}`}
        >
          <span className="font-mono text-[9px] uppercase">
            {expanded ? "▲ Hide lessons" : `▼ ${total} lessons`}
          </span>
          {complete && (
            <span className={`font-mono text-[9px] uppercase ${isDark ? "text-volt" : "text-ink"}`}>
              Complete ✓
            </span>
          )}
        </button>

        {expanded && (
          <div className={`px-4 pb-4 pt-1 ${isDark ? "bg-bone/2" : "bg-ink/2"}`}>
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
                      isDone ? (complete ? pillDone : pillDone) : missionRow
                    }`}
                  >
                    <span className={`font-mono text-[8px] shrink-0 mt-0.5 w-4 ${isDone ? "opacity-75" : "opacity-35"}`}>
                      {isDone ? "✓" : `${idx + 1}.`}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-display text-xs leading-tight">{title}</div>
                      {tagline && (
                        <div className={`font-mono text-[8px] leading-snug mt-0.5 truncate ${isDone ? "opacity-55" : textMuted}`}>
                          {tagline}
                        </div>
                      )}
                    </div>
                    <span className="font-mono text-[9px] shrink-0 mt-0.5 opacity-0 group-hover:opacity-50 transition-opacity">
                      →
                    </span>
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

// ─── Chapter accordion ────────────────────────────────────────────────────────
function WikiChapter({
  ch,
  paths,
  completed,
  isDark,
  theme,
  defaultOpen,
  worldSlug,
}: {
  ch: ReturnType<typeof chaptersByWorld>[number];
  paths: ReturnType<typeof pathsByWorld>;
  completed: Record<string, unknown>;
  isDark: boolean;
  theme: ReturnType<typeof getWorldTheme>;
  defaultOpen: boolean;
  worldSlug: WorldSlug;
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

  // First incomplete mission = start CTA target
  const firstIncomplete = chSlugs.find((s) => !completed[s]);
  const startHref = firstIncomplete ? `/learn/${firstIncomplete}` : `/world/${worldSlug}`;

  return (
    <div
      id={`wiki-chapter-${ch.slug}`}
      className={`brutal-border overflow-hidden ${isDark ? "border-bone/15" : ""}`}
    >
      {/* Accordion header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full text-left brutal-press transition-colors ${
          isDark ? "hover:bg-bone/5" : "hover:bg-ink/4"
        }`}
      >
        <div
          className={`px-5 py-4 flex items-center gap-4 relative overflow-hidden ${theme.heroBg} ${theme.heroText}`}
        >
          {/* Accent left bar */}
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${theme.barFill}`} />

          <div className="shrink-0 pl-2">
            <div className="font-mono text-[8px] uppercase opacity-45 mb-1">CH {chNum}</div>
            <span className="text-3xl leading-none">{complete ? "✓" : emoji}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-display text-xl leading-tight">{ch.title}</div>
            <div className="font-mono text-[10px] opacity-55 mt-0.5 leading-snug">{ch.tagline}</div>
            <div className="font-mono text-[8px] opacity-40 mt-1 uppercase">
              {chPaths.length} paths · {total} missions
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-end gap-1.5">
            <div className="font-display text-2xl tabular-nums leading-none">
              {complete ? "🏆" : `${pct}%`}
            </div>
            <div className="font-mono text-[9px] opacity-40">{done}/{total}</div>
            <div className="font-mono text-[9px] opacity-35">{open ? "▲" : "▼"}</div>
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

      {/* Expanded body */}
      {open && (
        <div className={isDark ? "bg-[#0a1228]" : "bg-bone"}>
          {/* Description + Start CTA */}
          <div
            className={`px-5 py-4 border-b flex items-start justify-between gap-4 ${
              isDark ? "border-bone/10" : "border-ink/10"
            }`}
          >
            <p
              className={`font-mono text-xs leading-relaxed flex-1 ${
                isDark ? "text-bone/60" : "text-ink/60"
              }`}
            >
              {ch.description}
            </p>
            {!complete && (
              <Link
                href={startHref}
                className={`shrink-0 brutal-border px-3 py-2 font-display text-xs brutal-press transition-colors ${theme.flowBtn}`}
                onClick={(e) => e.stopPropagation()}
              >
                {done > 0 ? "Continue →" : "Start →"}
              </Link>
            )}
          </div>

          {/* Paths */}
          <div className="p-4 space-y-3">
            <div
              className={`font-mono text-[8px] uppercase mb-2 ${
                isDark ? "text-bone/40" : "text-ink/40"
              }`}
            >
              {chPaths.length} paths in this chapter
            </div>
            {chPaths.map((path) => (
              <WikiPathCard
                key={path.slug}
                path={path}
                completed={completed}
                isDark={isDark}
                pillDone={theme.pillDone}
                pillPartial={theme.pillPartial}
                pillEmpty={theme.pillEmpty}
                barBg={theme.barBg}
                barFill={theme.barFill}
              />
            ))}
          </div>

          {/* Chapter trophy */}
          {complete && (
            <div className={`mx-4 mb-4 brutal-border px-4 py-3 flex items-center gap-3 ${theme.pillDone}`}>
              <span className="text-2xl shrink-0">🏆</span>
              <div>
                <div className="font-display text-base">{ch.trophy.name}</div>
                <div className="font-mono text-[9px] opacity-65 mt-0.5">{ch.trophy.description}</div>
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

  // Auto-open first incomplete chapter
  const firstIncompleteIdx = chapters.findIndex((ch) => {
    const chPaths = paths.filter((p) => p.chapter === ch.slug);
    const chSlugs = chPaths.flatMap((p) => p.missionSlugs);
    return chSlugs.filter((s) => !!completed[s]).length < chSlugs.length;
  });

  return (
    <div className={`${isDark ? "bg-[#0a0f2e] text-bone" : "bg-bone text-ink"} min-h-full`}>

      {/* Wiki header */}
      <div
        className={`px-5 pt-5 pb-4 border-b-4 ${
          isDark ? "border-bone/12" : "border-ink/10"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <div
              className={`font-mono text-[8px] uppercase mb-1 ${
                isDark ? "text-bone/40" : "text-ink/40"
              }`}
            >
              World Wiki
            </div>
            <h2 className="font-display text-2xl leading-tight">
              {theme.emoji} {theme.title}
            </h2>
            <p className={`font-mono text-xs mt-1 ${isDark ? "text-bone/50" : "text-ink/50"}`}>
              {chapters.length} chapters · {paths.length} paths · {worldTotal} missions · {worldPct}% complete
            </p>
          </div>

          <div
            className={`brutal-border px-3 py-2 text-center ${
              worldPct === 100
                ? "bg-volt text-ink"
                : isDark
                ? "bg-bone/8 text-bone"
                : "bg-ink/6 text-ink"
            }`}
          >
            <div className="font-display text-2xl tabular-nums">{worldPct}%</div>
            <div
              className={`font-mono text-[7px] uppercase opacity-50 mt-0.5`}
            >
              {worldDone}/{worldTotal}
            </div>
          </div>
        </div>
      </div>

      {/* Chapters */}
      <div className="p-4 space-y-3 pb-12">
        <div
          className={`font-mono text-[8px] uppercase mb-3 ${
            isDark ? "text-bone/35" : "text-ink/35"
          }`}
        >
          // {chapters.length} chapters — click to expand
        </div>

        {chapters.map((ch, i) => (
          <WikiChapter
            key={ch.slug}
            ch={ch}
            paths={paths}
            completed={completed}
            isDark={isDark}
            theme={theme}
            defaultOpen={
              i === firstIncompleteIdx || (firstIncompleteIdx === -1 && i === 0)
            }
            worldSlug={worldSlug}
          />
        ))}

        {/* World trophy */}
        <div
          className={`brutal-border p-5 mt-4 ${
            worldPct === 100
              ? "bg-volt text-ink"
              : isDark
              ? "bg-bone/5 text-bone/40 border-bone/12"
              : "bg-ink/4 text-ink/40"
          }`}
        >
          <div
            className={`font-mono text-[8px] uppercase mb-2 ${
              worldPct === 100 ? "opacity-55" : "opacity-40"
            }`}
          >
            World Trophy
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{worldPct === 100 ? "🏆" : "🔒"}</span>
            <div>
              <div className="font-display text-xl">{trophy?.name ?? "World Master"}</div>
              <div
                className={`font-mono text-[10px] mt-0.5 ${
                  worldPct === 100 ? "opacity-65" : "opacity-40"
                }`}
              >
                {trophy?.description ?? `Complete all ${chapters.length} chapters to unlock`}
              </div>
              {worldPct < 100 && (
                <div
                  className={`font-mono text-[8px] uppercase mt-1.5 ${
                    isDark ? "text-bone/30" : "text-ink/30"
                  }`}
                >
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
