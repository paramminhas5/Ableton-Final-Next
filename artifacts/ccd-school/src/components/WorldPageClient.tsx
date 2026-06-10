"use client";
/**
 * WorldPageClient — Free Mode chapter/path browser.
 *
 * Changes in this version:
 * ✓ No own hero — WorldShell provides the rail + layout
 * ✓ Chapter sections animate in on scroll (fade-up-chapter, staggered)
 * ✓ Progress bars animate on reveal (width 0 → N%)
 * ✓ Contextual cat speech bubble in each chapter header
 * ✓ Completed paths show celebrating cat in card header
 * ✓ Path cards are compact — description behind ℹ toggle
 * ✓ Mission rows are dense docs-style links
 * ✓ Chapter anchor IDs use `chapter-{slug}` for WorldShell IntersectionObserver
 */
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { chaptersByWorld, WORLD_TROPHIES } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";
import { FOUNDATIONS_MISSIONS } from "@/content/missions-foundations";
import { DJ_WORLD_MISSIONS } from "@/content/missions-dj";
import { MISSIONS } from "@/content/missions";
import { useProgress } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import { SlimHeroBar } from "@/components/SlimHeroBar";

type WorldSlug = "fundamentals" | "dj" | "producer";

// ─── Config ───────────────────────────────────────────────────────────────────
const WORLD_CONFIG = {
  fundamentals: {
    title: "Fundamentals", emoji: "🎵",
    tagline: "The vocabulary of music — before you produce or DJ",
    heroBg: "bg-acid", heroText: "text-ink",
    bar: "bg-ink", barBg: "bg-ink/15",
    chapterAccentBg: "bg-acid/25", chapterAccentText: "text-ink",
    chapterBorderLeft: "border-l-4 border-acid",
    pillDone: "bg-ink text-bone", pillPartial: "bg-ink/25 text-ink",
    pathCtaBg: "bg-acid text-ink hover:bg-sun", pathCtaDone: "bg-ink text-bone opacity-70",
    catMain: "/cats/cat-handstand.png", catDeco1: "/cats/cat-headphones.png",
    deco1: "/cats/music-note.png", deco2: "/cats/star.png",
    worldBg: "bg-bone", trophyBg: "bg-acid text-ink",
    flowLinkClass: "bg-ink/10 text-ink hover:bg-ink/20",
    dark: false,
  },
  dj: {
    title: "DJ World", emoji: "🎧",
    tagline: "The art of playing recorded music for people",
    heroBg: "bg-[#0a0f2e]", heroText: "text-bone",
    bar: "bg-volt", barBg: "bg-volt/15",
    chapterAccentBg: "bg-volt/12", chapterAccentText: "text-bone",
    chapterBorderLeft: "border-l-4 border-volt",
    pillDone: "bg-volt text-ink", pillPartial: "bg-volt/30 text-bone",
    pathCtaBg: "bg-volt text-ink hover:bg-acid", pathCtaDone: "bg-volt/30 text-bone opacity-70",
    catMain: "/cats/cat-dj.png", catDeco1: "/cats/cat-dj-new.png",
    deco1: "/cats/disco-ball.png", deco2: "/cats/headphones.png",
    worldBg: "bg-[#0a0f2e]", trophyBg: "bg-volt text-ink",
    flowLinkClass: "bg-bone/10 text-bone hover:bg-bone/20",
    dark: true,
  },
  producer: {
    title: "Producer", emoji: "🎛",
    tagline: "Build music in Ableton Live 12",
    heroBg: "bg-sun", heroText: "text-ink",
    bar: "bg-ink", barBg: "bg-ink/15",
    chapterAccentBg: "bg-sun/25", chapterAccentText: "text-ink",
    chapterBorderLeft: "border-l-4 border-sun",
    pillDone: "bg-ink text-bone", pillPartial: "bg-sun text-ink",
    pathCtaBg: "bg-sun text-ink hover:bg-acid", pathCtaDone: "bg-ink text-bone opacity-70",
    catMain: "/cats/cat-dj-hero.png", catDeco1: "/cats/cat-raver.png",
    deco1: "/cats/boombox.png", deco2: "/cats/vinyl-music.png",
    worldBg: "bg-bone", trophyBg: "bg-sun text-ink",
    flowLinkClass: "bg-ink/10 text-ink hover:bg-ink/20",
    dark: false,
  },
} as const;

const CHAPTER_EMOJIS: Record<string, string> = {
  "sound-science": "🔊", "rhythm-and-time": "🥁", "melody-and-pitch": "🎵",
  "harmony-and-chords": "🎹", "music-technology": "💻",
  "setup-and-culture": "🎧", "the-library": "📚", "the-mix-dj": "🎛",
  "dj-performance": "🎤", "dj-mastery": "🏆",
  "first-contact": "🖥", "sound-and-midi": "🎼", "the-mix-producer": "🎚",
  "performance-and-flow": "🚀", "advanced-producer": "⚡", "synthesis": "🌀",
};

const CHAPTER_QUIPS: Record<string, string> = {
  "sound-science": "Physics first. Everything else follows 🔬",
  "rhythm-and-time": "The beat is the heartbeat of music 🥁",
  "melody-and-pitch": "7 notes. Infinite hooks 🎵",
  "harmony-and-chords": "Chords are emotions made audible 🎹",
  "music-technology": "The DAW is your studio. Let's get comfortable 💻",
  "setup-and-culture": "Know your gear, know your roots 🎧",
  "the-library": "Your collection is your identity 📚",
  "the-mix-dj": "This is where DJing actually happens 🎚",
  "dj-performance": "Reading a room is a learnable skill 🎤",
  "dj-mastery": "Final boss. You've got this 🏆",
  "first-contact": "Live is a very smart instrument 🖥",
  "sound-and-midi": "Sound design is cooking with electricity 🎼",
  "the-mix-producer": "A great mix is invisible 🎚",
  "performance-and-flow": "Now take it off the screen 🚀",
  "advanced-producer": "Deep water. Excellent things live here ⚡",
  "synthesis": "Literally building sound from math 🌀",
};

const ALL_MISSIONS = [...FOUNDATIONS_MISSIONS, ...DJ_WORLD_MISSIONS, ...MISSIONS];
const getMissionTitle = (slug: string) =>
  ALL_MISSIONS.find((m) => m.slug === slug)?.title ?? slug.replace(/-/g, " ");

// ─── Scroll reveal hook ───────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.04, rootMargin: "0px 0px -60px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

// ─── Animated progress bar ────────────────────────────────────────────────────
function AnimBar({ pct, bar, barBg, visible }: {
  pct: number; bar: string; barBg: string; visible: boolean;
}) {
  return (
    <div className={`h-1.5 brutal-border overflow-hidden ${barBg}`}>
      <div
        className={`h-full ${bar} transition-all duration-900`}
        style={{ width: visible ? `${pct}%` : "0%" }}
      />
    </div>
  );
}

// ─── Compact Path card ────────────────────────────────────────────────────────
function PathCard({
  path, completed, cfg, visible, staggerIdx,
}: {
  path: ReturnType<typeof pathsByWorld>[number];
  completed: Record<string, unknown>;
  cfg: typeof WORLD_CONFIG[WorldSlug];
  visible: boolean;
  staggerIdx: number;
}) {
  const [showMissions, setShowMissions] = useState(false);
  const [showDesc, setShowDesc] = useState(false);

  const done = path.missionSlugs.filter((s) => !!completed[s]).length;
  const total = path.missionSlugs.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const complete = done === total && total > 0;
  const started = done > 0 && !complete;

  const borderCol = cfg.dark ? "border-bone/12" : "border-ink/10";

  return (
    <div
      className={`brutal-border overflow-hidden ${cfg.dark ? "border-volt/25" : ""} transition-all duration-500`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transitionDelay: `${staggerIdx * 70}ms`,
      }}
    >
      {/* Compact header row */}
      <div className={`px-3 py-2.5 flex items-center gap-2.5 ${cfg.dark ? "bg-[#0a1228]" : "bg-bone"}`}>
        {/* Complete cat OR status */}
        {complete ? (
          <div className="shrink-0 w-8 h-8">
            <Image
              src={cfg.catMain}
              alt="Complete"
              width={32}
              height={32}
              className="w-full h-full object-contain animate-cat-celebrate"
            />
          </div>
        ) : (
          <div className={`shrink-0 brutal-border px-1.5 py-1 text-center min-w-[38px] ${
            started ? cfg.pillPartial : `${cfg.dark ? "bg-bone/8 text-bone/50" : "bg-ink/6 text-ink/45"} border-current/15`
          }`}>
            <div className="font-display text-xs tabular-nums">{pct}%</div>
          </div>
        )}

        {/* Title */}
        <div className="flex-1 min-w-0">
          <div className={`font-display text-sm leading-tight ${cfg.dark ? "text-bone" : "text-ink"}`}>{path.title}</div>
          <div className={`font-mono text-[9px] truncate ${cfg.dark ? "text-bone/50" : "text-ink/50"}`}>{path.tagline}</div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setShowDesc((v) => !v)}
            className={`w-6 h-6 flex items-center justify-center font-mono text-[9px] opacity-35 hover:opacity-70 brutal-press`}
          >ℹ</button>
          <button
            onClick={() => setShowMissions((v) => !v)}
            className={`brutal-border px-2 py-1 font-mono text-[8px] uppercase brutal-press ${
              cfg.dark ? "bg-bone/8 text-bone hover:bg-bone/15" : "bg-ink/6 text-ink hover:bg-ink/12"
            }`}
          >
            {showMissions ? "▲" : `▼ ${total}`}
          </button>
          <Link
            href={`/path/${path.slug}`}
            className={`brutal-border px-3 py-1.5 font-display text-xs brutal-press transition-colors ${
              complete ? cfg.pathCtaDone : cfg.pathCtaBg
            }`}
          >
            {complete ? "✓" : started ? "→" : "START"}
          </Link>
        </div>
      </div>

      {/* Progress bar */}
      <AnimBar pct={pct} bar={cfg.bar} barBg={cfg.barBg} visible={visible} />

      {/* Description */}
      {showDesc && (
        <div className={`px-3 py-2 border-t ${borderCol} animate-slide-down`}>
          <p className={`font-mono text-[10px] leading-relaxed ${cfg.dark ? "text-bone/55" : "text-ink/55"}`}>
            {path.description ?? path.tagline}
          </p>
        </div>
      )}

      {/* Missions — dense doc rows */}
      {showMissions && (
        <div className={`border-t ${borderCol} animate-slide-down`}>
          <div className={`px-3 py-1 ${cfg.dark ? "bg-[#060b1e]" : "bg-ink/2"}`}>
            {path.missionSlugs.map((slug, idx) => {
              const isDone = !!completed[slug];
              return (
                <Link
                  key={slug}
                  href={`/learn/${slug}`}
                  className={`flex items-center gap-2 py-1.5 border-b last:border-b-0 ${borderCol} group transition-colors ${
                    isDone
                      ? `${cfg.pillDone} px-2 -mx-2`
                      : cfg.dark
                      ? "text-bone hover:bg-bone/8"
                      : "text-ink hover:bg-acid/10"
                  }`}
                >
                  <span className={`font-mono text-[8px] w-5 shrink-0 tabular-nums ${isDone ? "opacity-65" : "opacity-30"}`}>
                    {isDone ? "✓" : `${idx + 1}.`}
                  </span>
                  <span className="font-sans text-xs flex-1 min-w-0 truncate">{getMissionTitle(slug)}</span>
                  <span className="font-mono text-[8px] opacity-0 group-hover:opacity-40 transition-opacity shrink-0">→</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Chapter section ──────────────────────────────────────────────────────────
function ChapterSection({
  ch, paths, completed, world, cfg, chapterIndex,
}: {
  ch: ReturnType<typeof chaptersByWorld>[number];
  paths: ReturnType<typeof pathsByWorld>;
  completed: Record<string, unknown>;
  world: WorldSlug;
  cfg: typeof WORLD_CONFIG[WorldSlug];
  chapterIndex: number;
}) {
  const { ref, visible } = useReveal();
  const chPaths = paths.filter((p) => p.chapter === ch.slug).sort((a, b) => a.number - b.number);
  const chSlugs = chPaths.flatMap((p) => p.missionSlugs);
  const done = chSlugs.filter((s) => !!completed[s]).length;
  const total = chSlugs.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const complete = done === total && total > 0;
  const chEmoji = CHAPTER_EMOJIS[ch.slug] ?? "📖";
  const chNum = String(ch.number).padStart(2, "0");
  const quip = CHAPTER_QUIPS[ch.slug] ?? "Let's go!";

  return (
    <div
      id={`chapter-${ch.slug}`}
      ref={ref}
      className={`mb-6 transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
      style={{ animationDelay: `${chapterIndex * 80}ms` }}
    >
      {/* Chapter header */}
      <div className={`brutal-border overflow-hidden mb-2 ${cfg.chapterBorderLeft}`}>
        <div className={`${cfg.chapterAccentBg} ${cfg.chapterAccentText} px-4 py-3.5 flex items-center gap-3 relative overflow-hidden`}>
          {/* Chapter number + emoji */}
          <div className="shrink-0 flex flex-col items-center w-10">
            <span className="font-mono text-[8px] opacity-45">CH {chNum}</span>
            <span className="text-2xl leading-none mt-0.5">{complete ? "✓" : chEmoji}</span>
          </div>

          {/* Title */}
          <div className="flex-1 min-w-0">
            <div className="font-display text-xl leading-tight">{ch.title}</div>
            <div className="font-mono text-[9px] opacity-55 mt-0.5 leading-snug">{ch.tagline}</div>
            <div className="font-mono text-[8px] opacity-35 mt-1 uppercase">
              {chPaths.length} paths · {total} missions
            </div>
          </div>

          {/* Progress */}
          <div className="shrink-0 text-right">
            <div className="font-display text-2xl tabular-nums leading-none">
              {complete ? "🏆" : `${pct}%`}
            </div>
            <div className="font-mono text-[8px] opacity-45 mt-0.5">{done}/{total}</div>
          </div>
        </div>

        {/* Cat quip row */}
        <div className={`px-4 py-2.5 flex items-center gap-3 border-t ${cfg.dark ? "border-bone/10 bg-[#0a1228]" : "border-ink/8 bg-bone"}`}>
          <div className="shrink-0 w-8 h-8 animate-bounce-bob" aria-hidden>
            <Image
              src={cfg.catMain}
              alt=""
              width={32}
              height={32}
              className="w-full h-full object-contain"
              style={{ filter: "drop-shadow(2px 2px 0 rgba(0,0,0,0.2))" }}
            />
          </div>
          <div className={`brutal-border px-3 py-1.5 flex-1 ${cfg.dark ? "bg-bone/8 text-bone" : "bg-ink/5 text-ink"}`}>
            <span className="font-mono text-[9px] italic opacity-70">&ldquo;{quip}&rdquo;</span>
          </div>
        </div>

        {/* Chapter progress bar */}
        <AnimBar pct={pct} bar={cfg.bar} barBg={cfg.barBg} visible={visible} />
      </div>

      {/* Path cards — 2-col on desktop */}
      <div className="pl-3 grid grid-cols-1 md:grid-cols-2 gap-2">
        {chPaths.map((path, i) => (
          <PathCard
            key={path.slug}
            path={path}
            completed={completed}
            cfg={cfg}
            visible={visible}
            staggerIdx={i}
          />
        ))}
      </div>

      {/* Chapter trophy */}
      {complete && (
        <div className={`mt-2 brutal-border px-4 py-3 flex items-center gap-3 ${cfg.trophyBg}`}>
          <span className="text-xl">🏆</span>
          <div>
            <div className="font-display text-sm">{ch.trophy.name}</div>
            <div className="font-mono text-[8px] opacity-65">{ch.trophy.description}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function WorldPageClient({ slug }: { slug: string }) {
  const world = slug as WorldSlug;
  const cfg = WORLD_CONFIG[world];
  const { progress } = useProgress();
  const { setLearnMode } = useLearnMode();
  const completed = progress.completedMissions;
  const chapters = chaptersByWorld(world);
  const allPaths = pathsByWorld(world);

  if (!cfg) return <div className="p-8 font-mono">World not found</div>;

  const worldDone = allPaths.flatMap((p) => p.missionSlugs).filter((s) => !!completed[s]).length;
  const worldTotal = allPaths.flatMap((p) => p.missionSlugs).length;
  const worldPct = worldTotal > 0 ? Math.round((worldDone / worldTotal) * 100) : 0;
  const trophy = WORLD_TROPHIES[world];

  return (
    <div className={`min-h-screen ${cfg.worldBg}`}>

      {/* SlimHeroBar — Free Mode sticky header */}
      <SlimHeroBar worldSlug={slug} showFree={true} />

      {/* Slim world header (WorldShell already shows rail identity, so keep this minimal) */}
      <div className={`${cfg.heroBg} ${cfg.heroText} border-b-4 ${cfg.dark ? "border-volt" : "border-ink"} relative overflow-hidden`}>
        <div className="absolute top-3 right-6 w-10 h-10 opacity-10 spin-slow pointer-events-none" aria-hidden>
          <Image src={cfg.deco2} alt="" fill className="object-contain" />
        </div>

        <div className="px-5 py-5 relative z-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className={`font-mono text-[8px] uppercase opacity-45 mb-1`}>
                {chapters.length} chapters · {allPaths.length} paths · {worldTotal} missions
              </div>
              <h1 className="font-display text-4xl md:text-5xl leading-none mb-1">
                {cfg.emoji} {cfg.title.toUpperCase()}
              </h1>
              <p className={`font-mono text-xs opacity-55 mb-3`}>{cfg.tagline}</p>

              {/* Progress bar */}
              <div className="flex items-center gap-3 max-w-sm">
                <div className={`flex-1 h-2 brutal-border overflow-hidden ${cfg.barBg}`}>
                  <div className={`h-full ${cfg.bar} transition-all duration-700`} style={{ width: `${worldPct}%` }} />
                </div>
                <span className={`font-mono text-[9px] opacity-55 tabular-nums`}>{worldDone}/{worldTotal} · {worldPct}%</span>
              </div>

              {/* Mode row */}
              <div className="mt-3 flex items-center gap-2.5">
                <div className={`inline-flex items-center gap-1.5 brutal-border px-2.5 py-1.5 font-mono text-[9px] ${cfg.dark ? "bg-bone/8 text-bone border-bone/20" : "bg-ink/8 text-ink"}`}>
                  <span>📖</span>
                  <span className="font-display text-xs">Free Mode</span>
                  <span className="opacity-40">— all lessons open</span>
                </div>
                <Link
                  href={`/world/${world}`}
                  onClick={() => setLearnMode("flow")}
                  className={`brutal-border px-2.5 py-1.5 font-display text-xs brutal-press transition-colors ${cfg.flowLinkClass}`}
                >
                  Switch to Flow →
                </Link>
              </div>
            </div>

            {/* Cat */}
            <div className="shrink-0 flex flex-col items-center gap-1.5">
              <div className="w-16 h-16 md:w-20 md:h-20 wiggle" style={{ filter: "drop-shadow(3px 3px 0 rgba(0,0,0,0.2))" }} aria-hidden>
                <Image src={cfg.catMain} alt="" width={80} height={80} className="w-full h-full object-contain" />
              </div>
              <div className="flex gap-1.5">
                <div className="w-7 h-7 float opacity-60" style={{ animationDelay: "0.3s" }} aria-hidden>
                  <Image src={cfg.catDeco1} alt="" width={28} height={28} className="w-full h-full object-contain" style={{ filter: "drop-shadow(2px 2px 0 rgba(0,0,0,0.15))" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chapter sections */}
      <div className="px-4 pt-6 pb-24">
        <div className={`font-mono text-[9px] uppercase mb-4 ${cfg.dark ? "text-bone/35" : "text-ink/35"}`}>
          // {chapters.length} chapters — all lessons open · 2-col grid on desktop
        </div>

        {chapters.map((ch, chIdx) => (
          <ChapterSection
            key={ch.slug}
            ch={ch}
            paths={allPaths}
            completed={completed}
            world={world}
            cfg={cfg}
            chapterIndex={chIdx}
          />
        ))}

        {/* World trophy */}
        <div className={`brutal-border p-4 mt-4 ${
          worldPct === 100 ? cfg.trophyBg : cfg.dark ? "bg-[#0a1228] text-bone/40" : "bg-ink/4 text-ink/40"
        }`}>
          <div className="font-mono text-[8px] uppercase mb-1 opacity-50">World Trophy</div>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{worldPct === 100 ? "🏆" : "🔒"}</span>
            <div>
              <div className="font-display text-lg">{trophy.name}</div>
              <div className="font-mono text-[9px] mt-0.5 opacity-65">{trophy.description}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
