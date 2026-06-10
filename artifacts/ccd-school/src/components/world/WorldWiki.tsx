"use client";
/**
 * WorldWiki — compact docs-style reference for a single world.
 *
 * Design principles:
 * - COMPACT: default path state is title + tagline + badge only (no description shown).
 *   Description revealed via a small ℹ button. Cuts vertical scroll by ~60%.
 * - DOCS-STYLE: dense mission rows (py-1.5, font-sans), not fat pills.
 * - 2-COL path grid on desktop within each chapter body.
 * - SCROLL ANIMATIONS: each chapter fades up on intersection. Progress bars
 *   animate from 0 on reveal.
 * - CONTEXTUAL CATS:
 *   A. Milestone cat: when a path is 100% complete the path card header
 *      shows a small celebrating cat (animate-cat-celebrate).
 *   B. Chapter quip: expanded chapter body has a cat speech bubble with
 *      a world/chapter-specific quip (animate-cat-peek on open).
 *   C. Scroll-to-top cat is in WorldShell, not here.
 */
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { chaptersByWorld, WORLD_TROPHIES } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";
import { useProgress } from "@/lib/progress";
import { FOUNDATIONS_MISSIONS } from "@/content/missions-foundations";
import { DJ_WORLD_MISSIONS } from "@/content/missions-dj";
import { MISSIONS } from "@/content/missions";
import { getWorldTheme, getChapterEmoji, type WorldSlug } from "@/components/world/worldTheme";

// ─── Mission lookup ───────────────────────────────────────────────────────────
const ALL_MISSIONS = [...FOUNDATIONS_MISSIONS, ...DJ_WORLD_MISSIONS, ...MISSIONS];
const getMissionTitle = (slug: string) =>
  ALL_MISSIONS.find((m) => m.slug === slug)?.title ?? slug.replace(/-/g, " ");
const getMissionTagline = (slug: string): string | null =>
  ALL_MISSIONS.find((m) => m.slug === slug)?.tagline ?? null;

// ─── Chapter-specific cat quips ───────────────────────────────────────────────
const CHAPTER_QUIPS: Record<string, string> = {
  "sound-science":        "Physics is the foundation of everything you'll ever produce 🔬",
  "rhythm-and-time":      "Your internal clock is the most powerful instrument you own 🥁",
  "melody-and-pitch":     "Every great hook starts with understanding these 7 notes 🎵",
  "harmony-and-chords":   "Chords are the emotional language of music 🎹",
  "music-technology":     "The DAW is just a very fast tape recorder — you've got this 💻",
  "setup-and-culture":    "Every DJ legend started exactly here: gear and curiosity 🎧",
  "the-library":          "A great DJ's weapon is their collection. Build it wisely 📚",
  "the-mix-dj":           "This is where DJing actually happens — in the blend 🎚",
  "dj-performance":       "Reading a room is a superpower. Let's train it 🎤",
  "dj-mastery":           "This is the final boss. You're ready for it 🏆",
  "first-contact":        "Ableton Live is just a really smart instrument. Let's meet it 🖥",
  "sound-and-midi":       "Sound design is cooking — same ingredients, infinite dishes 🎼",
  "the-mix-producer":     "A great mix is invisible. A bad mix is all you can hear 🎚",
  "performance-and-flow": "Take it off the screen and play it for people 🚀",
  "advanced-producer":    "Deep water. Excellent things live here ⚡",
  "synthesis":            "You are literally building sound from vibrating air 🌀",
};

// ─── Scroll reveal hook ───────────────────────────────────────────────────────
function useReveal(rootMargin = "0px 0px -80px 0px") {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.04, rootMargin }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [rootMargin]);
  return { ref, visible };
}

// ─── Animated progress bar ────────────────────────────────────────────────────
function AnimatedBar({ pct, barFill, barBg, visible }: {
  pct: number; barFill: string; barBg: string; visible: boolean;
}) {
  return (
    <div className={`h-1 overflow-hidden ${barBg}`}>
      <div
        className={`h-full ${barFill} transition-all duration-900`}
        style={{ width: visible ? `${pct}%` : "0%" }}
      />
    </div>
  );
}

// ─── Compact path card ────────────────────────────────────────────────────────
function WikiPathCard({
  path,
  completed,
  isDark,
  pillDone,
  pillPartial,
  pillEmpty,
  barBg,
  barFill,
  catMain,
  visible,
  staggerIdx,
}: {
  path: ReturnType<typeof pathsByWorld>[number];
  completed: Record<string, unknown>;
  isDark: boolean;
  pillDone: string;
  pillPartial: string;
  pillEmpty: string;
  barBg: string;
  barFill: string;
  catMain: string;
  visible: boolean;
  staggerIdx: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showDesc, setShowDesc] = useState(false);

  const done = path.missionSlugs.filter((s) => !!completed[s]).length;
  const total = path.missionSlugs.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const complete = done === total && total > 0;

  const textBase = isDark ? "text-bone" : "text-ink";
  const textMuted = isDark ? "text-bone/55" : "text-ink/55";
  const borderCol = isDark ? "border-bone/12" : "border-ink/10";
  const rowBase = isDark
    ? "bg-bone/5 text-bone border-bone/10 hover:bg-bone/10"
    : "bg-ink/3 text-ink border-ink/8 hover:bg-acid/12";

  return (
    <div
      className={`brutal-border overflow-hidden transition-all duration-500 ${isDark ? "border-bone/12" : ""}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(14px)",
        transitionDelay: `${staggerIdx * 60}ms`,
      }}
    >
      {/* Compact header */}
      <div className={`px-3 py-2.5 flex items-center gap-2.5 ${isDark ? "bg-bone/3" : "bg-bone"}`}>
        {/* Complete milestone cat OR status badge */}
        {complete ? (
          <div className="shrink-0 w-8 h-8 flex items-center justify-center">
            <Image
              src={catMain}
              alt="Complete!"
              width={32}
              height={32}
              className="w-7 h-7 object-contain animate-cat-celebrate"
            />
          </div>
        ) : (
          <div className={`shrink-0 brutal-border px-2 py-1 text-center min-w-[40px] ${
            pct > 0 ? pillPartial : pillEmpty
          }`}>
            <div className="font-display text-xs leading-none tabular-nums">{pct}%</div>
          </div>
        )}

        {/* Title + tagline */}
        <div className="flex-1 min-w-0">
          <div className={`font-display text-sm leading-tight ${textBase}`}>{path.title}</div>
          <div className={`font-mono text-[9px] leading-snug truncate ${textMuted}`}>{path.tagline}</div>
        </div>

        {/* Info + expand buttons */}
        <div className="shrink-0 flex items-center gap-1">
          <button
            onClick={() => setShowDesc((v) => !v)}
            title="Show description"
            className={`w-6 h-6 flex items-center justify-center font-mono text-[9px] brutal-press opacity-40 hover:opacity-80 transition-opacity`}
          >ℹ</button>
          <button
            onClick={() => setExpanded((v) => !v)}
            className={`brutal-border px-2 py-1 font-mono text-[8px] uppercase brutal-press transition-colors ${
              isDark ? "bg-bone/8 text-bone hover:bg-bone/16" : "bg-ink/6 text-ink hover:bg-ink/14"
            }`}
          >
            {expanded ? "▲" : `▼ ${total}`}
          </button>
        </div>
      </div>

      {/* Animated progress bar */}
      <AnimatedBar pct={pct} barFill={barFill} barBg={barBg} visible={visible} />

      {/* Description (hidden by default) */}
      {showDesc && path.description && (
        <div className={`px-3 py-2 border-t ${borderCol} animate-slide-down`}>
          <p className={`font-mono text-[10px] leading-relaxed ${textMuted}`}>{path.description}</p>
        </div>
      )}

      {/* Mission list (compact docs rows) */}
      {expanded && (
        <div className={`border-t ${borderCol} animate-slide-down`}>
          <div className={`px-3 py-1 ${isDark ? "bg-bone/2" : "bg-ink/2"}`}>
            {path.missionSlugs.map((slug, idx) => {
              const isDone = !!completed[slug];
              const title = getMissionTitle(slug);
              const tagline = getMissionTagline(slug);
              return (
                <Link
                  key={slug}
                  href={`/learn/${slug}`}
                  className={`flex items-center gap-2 py-1.5 border-b last:border-b-0 ${borderCol} brutal-press group transition-colors ${
                    isDone ? `${pillDone} px-2 -mx-2` : `${textBase} hover:${isDark ? "bg-bone/8" : "bg-acid/10"}`
                  }`}
                >
                  <span className={`font-mono text-[8px] w-5 shrink-0 tabular-nums ${isDone ? "opacity-70" : "opacity-30"}`}>
                    {isDone ? "✓" : `${idx + 1}.`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="font-sans text-xs leading-tight">{title}</span>
                    {tagline && (
                      <span className={`font-mono text-[8px] ml-1.5 ${isDone ? "opacity-55" : textMuted}`}>
                        — {tagline}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[8px] opacity-0 group-hover:opacity-45 transition-opacity shrink-0">→</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
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
  const { ref, visible } = useReveal();

  const chPaths = paths.filter((p) => p.chapter === ch.slug).sort((a, b) => a.number - b.number);
  const chSlugs = chPaths.flatMap((p) => p.missionSlugs);
  const done = chSlugs.filter((s) => !!completed[s]).length;
  const total = chSlugs.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const complete = done === total && total > 0;
  const emoji = getChapterEmoji(ch.slug);
  const chNum = String(ch.number).padStart(2, "0");
  const quip = CHAPTER_QUIPS[ch.slug] ?? "Let's go!";

  const firstIncomplete = chSlugs.find((s) => !completed[s]);
  const startHref = firstIncomplete ? `/learn/${firstIncomplete}` : `/world/${worldSlug}`;

  return (
    <div
      id={`chapter-${ch.slug}`}
      ref={ref}
      className={`brutal-border overflow-hidden transition-all duration-500 ${
        isDark ? "border-bone/15" : ""
      } ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
      style={{ transitionDuration: "450ms" }}
    >
      {/* Accordion header — clickable */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full text-left brutal-press transition-colors ${
          isDark ? "hover:bg-bone/5" : "hover:bg-ink/4"
        }`}
      >
        <div className={`px-4 py-3.5 flex items-center gap-3 relative overflow-hidden ${theme.heroBg} ${theme.heroText}`}>
          {/* Left accent bar */}
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${theme.barFill}`} />

          {/* Number badge */}
          <div className="shrink-0 pl-2">
            <div className="font-mono text-[8px] uppercase opacity-40 mb-0.5">CH {chNum}</div>
            <span className="text-2xl leading-none">{complete ? "✓" : emoji}</span>
          </div>

          {/* Title */}
          <div className="flex-1 min-w-0">
            <div className="font-display text-lg leading-tight">{ch.title}</div>
            <div className="font-mono text-[9px] opacity-55 mt-0.5 leading-snug">{ch.tagline}</div>
          </div>

          {/* Right: pct + toggle */}
          <div className="shrink-0 flex flex-col items-end gap-1">
            <div className="font-display text-xl tabular-nums leading-none">
              {complete ? "🏆" : `${pct}%`}
            </div>
            <div className="font-mono text-[8px] opacity-35">{done}/{total}</div>
            <div className="font-mono text-[8px] opacity-30 mt-0.5">{open ? "▲" : "▼"}</div>
          </div>
        </div>

        {/* Progress bar — animates on reveal */}
        <AnimatedBar pct={pct} barFill={theme.barFill} barBg={theme.barBg} visible={visible} />
      </button>

      {/* Expanded body */}
      {open && (
        <div className={`${isDark ? "bg-[#0a1228]" : "bg-bone"} animate-slide-down`}>

          {/* Cat quip + description + CTA */}
          <div className={`px-4 pt-3 pb-3 flex items-start gap-3 border-b ${isDark ? "border-bone/10" : "border-ink/8"}`}>
            {/* Cat with peek animation */}
            <div className="shrink-0 w-10 h-10 mt-0.5 animate-cat-peek">
              <Image
                src={theme.catMain}
                alt=""
                width={40}
                height={40}
                className="w-full h-full object-contain"
                style={{ filter: "drop-shadow(2px 2px 0 rgba(0,0,0,0.2))" }}
              />
            </div>

            <div className="flex-1 min-w-0">
              {/* Speech bubble */}
              <div className={`brutal-border px-3 py-2 mb-2 relative ${
                isDark ? "bg-bone/8 text-bone" : "bg-ink/5 text-ink"
              }`}>
                <div className="font-mono text-[9px] leading-relaxed italic opacity-75">
                  &ldquo;{quip}&rdquo;
                </div>
              </div>
              <p className={`font-mono text-[10px] leading-relaxed ${isDark ? "text-bone/55" : "text-ink/55"}`}>
                {ch.description}
              </p>
            </div>

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

          {/* Paths — 2-col grid on md+ */}
          <div className="p-3">
            <div className={`font-mono text-[8px] uppercase mb-2 ${isDark ? "text-bone/35" : "text-ink/35"}`}>
              {chPaths.length} paths · {total} missions
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {chPaths.map((path, i) => (
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
                  catMain={theme.catMain}
                  visible={visible}
                  staggerIdx={i}
                />
              ))}
            </div>
          </div>

          {/* Chapter trophy */}
          {complete && (
            <div className={`mx-3 mb-3 brutal-border px-4 py-3 flex items-center gap-3 ${theme.pillDone}`}>
              <span className="text-2xl shrink-0">🏆</span>
              <div>
                <div className="font-display text-sm">{ch.trophy.name}</div>
                <div className="font-mono text-[8px] opacity-60 mt-0.5">{ch.trophy.description}</div>
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

  const firstIncompleteIdx = chapters.findIndex((ch) => {
    const chPaths = paths.filter((p) => p.chapter === ch.slug);
    const chSlugs = chPaths.flatMap((p) => p.missionSlugs);
    return chSlugs.filter((s) => !!completed[s]).length < chSlugs.length;
  });

  return (
    <div className={`${isDark ? "bg-[#0a0f2e] text-bone" : "bg-bone text-ink"} min-h-full pb-16`}>

      {/* Compact wiki header */}
      <div className={`px-5 pt-4 pb-3 border-b-4 ${isDark ? "border-bone/12" : "border-ink/10"} flex items-center justify-between gap-3`}>
        <div>
          <div className={`font-mono text-[8px] uppercase mb-0.5 ${isDark ? "text-bone/40" : "text-ink/40"}`}>
            World Wiki
          </div>
          <h2 className="font-display text-xl leading-tight">
            {theme.emoji} {theme.title}
          </h2>
          <p className={`font-mono text-[9px] mt-0.5 ${isDark ? "text-bone/45" : "text-ink/45"}`}>
            {chapters.length} chapters · {paths.length} paths · {worldTotal} missions
          </p>
        </div>

        <div className={`brutal-border px-3 py-2 text-center ${
          worldPct === 100 ? "bg-volt text-ink" : isDark ? "bg-bone/8 text-bone" : "bg-ink/6 text-ink"
        }`}>
          <div className="font-display text-2xl tabular-nums">{worldPct}%</div>
          <div className="font-mono text-[7px] uppercase opacity-50 mt-0.5">{worldDone}/{worldTotal}</div>
        </div>
      </div>

      {/* Chapter instruction */}
      <div className={`px-5 py-2 font-mono text-[8px] uppercase ${isDark ? "text-bone/30" : "text-ink/30"}`}>
        // {chapters.length} chapters — click to expand · 2-col path grid on desktop
      </div>

      {/* Chapters */}
      <div className="px-3 pb-6 space-y-2">
        {chapters.map((ch, i) => (
          <WikiChapter
            key={ch.slug}
            ch={ch}
            paths={paths}
            completed={completed}
            isDark={isDark}
            theme={theme}
            defaultOpen={i === firstIncompleteIdx || (firstIncompleteIdx === -1 && i === 0)}
            worldSlug={worldSlug}
          />
        ))}

        {/* World trophy */}
        <div className={`brutal-border p-4 mt-2 ${
          worldPct === 100
            ? "bg-volt text-ink"
            : isDark ? "bg-bone/5 text-bone/40 border-bone/12" : "bg-ink/4 text-ink/40"
        }`}>
          <div className={`font-mono text-[8px] uppercase mb-1.5 ${worldPct === 100 ? "opacity-55" : "opacity-35"}`}>
            World Trophy
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{worldPct === 100 ? "🏆" : "🔒"}</span>
            <div>
              <div className="font-display text-lg">{trophy?.name ?? "World Master"}</div>
              <div className={`font-mono text-[9px] mt-0.5 ${worldPct === 100 ? "opacity-60" : "opacity-35"}`}>
                {trophy?.description ?? `Complete all ${chapters.length} chapters to unlock`}
              </div>
              {worldPct < 100 && (
                <div className={`font-mono text-[8px] uppercase mt-1 ${isDark ? "text-bone/25" : "text-ink/25"}`}>
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
