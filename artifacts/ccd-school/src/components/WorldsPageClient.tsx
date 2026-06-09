"use client";
/**
 * WorldsPageClient — /worlds index.
 *
 * Design:
 * - NO images — pure CCD color-block cards
 * - Compact horizontal chapter breadcrumb rail (one scrollable row, not 5+ full rows)
 * - SINGLE CTA: Based on hero-level mode selection (Flow or Free)
 * - Scroll-linked card entrance animations
 * - Cats and decorative elements
 * - Marquee ticker
 * - Hero-level mode picker for all worlds
 */
"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { chaptersByWorld } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";
import { useProgress } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import { WorldModePicker } from "./world/ModeSwitch";

type WorldId = "fundamentals" | "dj" | "producer";

const CHAPTER_EMOJIS: Record<string, string> = {
  "sound-science": "🔊", "rhythm-and-time": "🥁", "melody-and-pitch": "🎵",
  "harmony-and-chords": "🎹", "music-technology": "💻",
  "setup-and-culture": "🎧", "the-library": "📚", "the-mix-dj": "🎛",
  "dj-performance": "🎤", "dj-mastery": "🏆",
  "first-contact": "🖥", "sound-and-midi": "🎼", "the-mix-producer": "🎚",
  "performance-and-flow": "🚀", "advanced-producer": "⚡", "synthesis": "🌀",
};

const WORLD_META = {
  fundamentals: {
    title: "Fundamentals", emoji: "🎵",
    tagline: "The vocabulary of music",
    description: "Sound, rhythm, melody, harmony and music technology. The foundation for everything.",
    bg: "bg-acid", textPrimary: "text-ink", textMuted: "text-ink/55",
    barBg: "bg-ink/20", barFill: "bg-ink",
    pillDone: "bg-ink text-bone", pillPartial: "bg-ink/35 text-ink", pillEmpty: "bg-ink/10 text-ink/40",
    pillConnector: "bg-ink/25",
    flowBtn: "bg-ink text-bone hover:bg-electric-blue",
    freeBtn: "bg-ink/15 text-ink hover:bg-ink/30 border-ink/40",
    shadow: "chunk-shadow",
    catMain: "/cats/cat-handstand.png",
    catDeco1: "/cats/cat-headphones.png",
    catDeco2: "/cats/cat-dancer.png",
    deco1: "/cats/music-note.png",
    deco2: "/cats/vinyl.png",
  },
  dj: {
    title: "DJ World", emoji: "🎧",
    tagline: "The art of playing for people",
    description: "rekordbox, beatmatching, cue points, the mix, crowd reading and career.",
    bg: "bg-[#0a0f2e]", textPrimary: "text-bone", textMuted: "text-bone/55",
    barBg: "bg-volt/20", barFill: "bg-volt",
    pillDone: "bg-volt text-ink", pillPartial: "bg-volt/35 text-bone", pillEmpty: "bg-bone/10 text-bone/35",
    pillConnector: "bg-volt/25",
    flowBtn: "bg-volt text-ink hover:bg-acid",
    freeBtn: "bg-bone/10 text-bone hover:bg-bone/20 border-bone/20",
    shadow: "brutal-shadow-acid",
    catMain: "/cats/cat-dj.png",
    catDeco1: "/cats/cat-dj-new.png",
    catDeco2: "/cats/cat-cap.png",
    deco1: "/cats/disco-ball.png",
    deco2: "/cats/headphones.png",
  },
  producer: {
    title: "Producer", emoji: "🎛",
    tagline: "Build music in Ableton Live 12",
    description: "From opening Live for the first time to deep instruments, Live 12 power features and pro output.",
    bg: "bg-sun", textPrimary: "text-ink", textMuted: "text-ink/55",
    barBg: "bg-ink/20", barFill: "bg-ink",
    pillDone: "bg-ink text-bone", pillPartial: "bg-ink/35 text-ink", pillEmpty: "bg-ink/10 text-ink/40",
    pillConnector: "bg-ink/25",
    flowBtn: "bg-ink text-bone hover:bg-hot",
    freeBtn: "bg-ink/15 text-ink hover:bg-ink/30 border-ink/40",
    shadow: "chunk-shadow",
    catMain: "/cats/cat-dj-hero.png",
    catDeco1: "/cats/cat-raver.png",
    catDeco2: "/cats/cat-source.png",
    deco1: "/cats/boombox.png",
    deco2: "/cats/star.png",
  },
} as const;

// ─── Scroll reveal ────────────────────────────────────────────────────────────
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

// ─── Marquee ──────────────────────────────────────────────────────────────────
function MarqueeStrip() {
  const items = [
    "🎵 153 MISSIONS", "🌍 3 WORLDS", "📚 16 CHAPTERS",
    "🎧 DJ WORLD", "🎛 PRODUCER", "🔊 FUNDAMENTALS",
    "🐱 CATS CAN DANCE", "⚡ GAMIFIED", "🏆 EARN TROPHIES",
    "🌊 FLOW MODE", "🔓 FREE MODE",
  ];
  const doubled = [...items, ...items];
  return (
    <div className="border-b-4 border-ink bg-ink text-bone overflow-hidden py-2.5">
      <div className="flex gap-8 animate-marquee whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="font-display text-sm uppercase shrink-0">
            {item}<span className="text-acid mx-3 opacity-50">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Chapter breadcrumb rail ──────────────────────────────────────────────────
// A single scrollable horizontal row — compact pills connected by a line.
function ChapterRail({
  meta,
  chapterStats,
}: {
  meta: typeof WORLD_META[WorldId];
  chapterStats: { slug: string; title: string; number: number; pct: number; complete: boolean }[];
}) {
  return (
    <div className="mt-4 pt-3 border-t-2 border-current/15">
      <div className={`font-mono text-[8px] uppercase mb-2 ${meta.textMuted}`}>
        {chapterStats.length} CHAPTERS
      </div>

      {/* Scrollable horizontal rail */}
      <div className="overflow-x-auto pb-1 -mx-1 px-1">
        <div className="flex items-center gap-0 min-w-max">
          {chapterStats.map((ch, i) => {
            const emoji = CHAPTER_EMOJIS[ch.slug] ?? "📖";
            const isDone = ch.complete;
            const isStarted = ch.pct > 0 && !isDone;

            const pillClass = isDone
              ? meta.pillDone
              : isStarted
              ? meta.pillPartial
              : meta.pillEmpty;

            return (
              <div key={ch.slug} className="flex items-center">
                {i > 0 && (
                  <div className={`w-3 h-px shrink-0 ${meta.pillConnector}`} />
                )}
                <div className={`brutal-border flex items-center gap-1 px-2 py-1 shrink-0 transition-all ${pillClass}`}>
                  <span className="text-xs leading-none">
                    {isDone ? "✓" : emoji}
                  </span>
                  <span className="font-display text-[10px] leading-none max-w-[52px] truncate">
                    {ch.title.split(" ")[0]}
                  </span>
                  {isStarted && (
                    <span className="font-mono text-[7px] opacity-60 leading-none">
                      {ch.pct}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── World Card ───────────────────────────────────────────────────────────────
function WorldCard({ world, index }: { world: WorldId; index: number }) {
  const { progress } = useProgress();
  const { learnMode } = useLearnMode();
  const completed = progress.completedMissions;
  const { ref, visible } = useScrollReveal();

  const meta = WORLD_META[world];
  const chapters = chaptersByWorld(world);
  const paths = pathsByWorld(world);
  const allSlugs = paths.flatMap(p => p.missionSlugs);
  const done = allSlugs.filter(s => !!completed[s]).length;
  const total = allSlugs.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  
  const isFlow = learnMode === "flow";
  const href = isFlow ? `/world/${world}` : `/world/${world}?view=free`;

  const chapterStats = chapters.map(ch => {
    const chPaths = paths.filter(p => p.chapter === ch.slug);
    const chSlugs = chPaths.flatMap(p => p.missionSlugs);
    const chDone = chSlugs.filter(s => !!completed[s]).length;
    const chPct = chSlugs.length > 0 ? Math.round((chDone / chSlugs.length) * 100) : 0;
    return {
      slug: ch.slug, title: ch.title, number: ch.number,
      pct: chPct, complete: chDone === chSlugs.length && chSlugs.length > 0,
    };
  });

  const progressLabel = done === 0
    ? `${total} missions`
    : pct === 100 ? "Complete 🏆"
    : `${done}/${total}`;

  return (
    <div
      ref={ref}
      className="transition-all duration-700 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(36px)",
        transitionDelay: `${index * 100}ms`,
      }}
    >
      <div className={`brutal-border ${meta.shadow} overflow-hidden`}>

        {/* ── Card body ── */}
        <div className={`${meta.bg} ${meta.textPrimary} p-4 md:p-6 relative overflow-hidden`}>

          {/* Decorative bg elements */}
          <div className="absolute -bottom-6 -right-6 w-36 h-36 opacity-[0.07] pointer-events-none" aria-hidden>
            <Image src={meta.deco1} alt="" fill className="object-contain" />
          </div>
          <div className="absolute top-4 right-28 w-10 h-10 opacity-[0.12] spin-slow pointer-events-none" aria-hidden>
            <Image src={meta.deco2} alt="" fill className="object-contain" />
          </div>

          {/* Top: title + cat */}
          <div className="flex items-start justify-between gap-4">

            {/* Left: title block */}
            <div className="flex-1 min-w-0">
              <div className={`font-mono text-[9px] uppercase mb-1 ${meta.textMuted}`}>
                {chapters.length} CH · {paths.length} PATHS · {total} MISSIONS
              </div>
              <div className="flex items-center gap-2.5 mb-1">
                <span className="text-4xl md:text-5xl leading-none">{meta.emoji}</span>
                <h2 className="font-display text-3xl md:text-5xl leading-none">
                  {meta.title.toUpperCase()}
                </h2>
              </div>
              <p className={`font-display text-sm md:text-base ${meta.textMuted}`}>
                {meta.tagline}
              </p>
            </div>

            {/* Right: % + cat */}
            <div className="shrink-0 flex flex-col items-end gap-2">
              <div className="text-right">
                <div className="font-display text-4xl md:text-5xl tabular-nums leading-none">
                  {pct}%
                </div>
                <div className={`font-mono text-[8px] uppercase mt-0.5 ${meta.textMuted}`}>
                  {progressLabel}
                </div>
              </div>
              <div
                className="w-16 h-16 md:w-20 md:h-20 wiggle"
                style={{ filter: "drop-shadow(3px 3px 0 rgba(0,0,0,0.2))" }}
                aria-hidden
              >
                <Image src={meta.catMain} alt="" width={80} height={80} className="w-full h-full object-contain" />
              </div>
            </div>
          </div>

          {/* Description */}
          <p className={`font-mono text-xs leading-relaxed mt-3 mb-4 max-w-lg ${meta.textMuted}`}>
            {meta.description}
          </p>

          {/* Progress bar */}
          <div className={`h-2.5 brutal-border overflow-hidden mb-1 ${meta.barBg}`}>
            <div
              className={`h-full ${meta.barFill} transition-all duration-1000`}
              style={{ width: visible ? `${pct}%` : "0%" }}
            />
          </div>

          {/* Chapter breadcrumb rail — compact, single row */}
          <ChapterRail meta={meta} chapterStats={chapterStats} />

          {/* Bottom deco cats — slim row */}
          <div className="flex items-end gap-2 mt-3 pt-2 border-t-2 border-current/10">
            <div className="w-7 h-7 float opacity-55" style={{ animationDelay: "0.3s" }} aria-hidden>
              <Image src={meta.catDeco1} alt="" width={28} height={28} className="w-full h-full object-contain" style={{ filter: "drop-shadow(2px 2px 0 rgba(0,0,0,0.15))" }} />
            </div>
            <div className="w-6 h-6 float opacity-45" style={{ animationDelay: "1.2s" }} aria-hidden>
              <Image src={meta.catDeco2} alt="" width={24} height={24} className="w-full h-full object-contain" style={{ filter: "drop-shadow(2px 2px 0 rgba(0,0,0,0.12))" }} />
            </div>
          </div>
        </div>

        {/* ── Single CTA footer — Based on current mode selection ── */}
        <div className="border-t-4 border-ink">
          <Link
            href={href}
            className={`brutal-press transition-colors flex items-center justify-between gap-3 py-4 px-5 group ${
              isFlow ? meta.flowBtn : meta.freeBtn
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl shrink-0">{isFlow ? "🌊" : "🔓"}</span>
              <div>
                <div className="font-display text-sm leading-none">
                  {isFlow ? "FLOW MODE" : "FREE MODE"}
                </div>
                <div className="font-mono text-[8px] uppercase opacity-60 mt-1 leading-tight max-w-[140px]">
                  {isFlow
                    ? "Guided path · lessons unlock in order"
                    : "All lessons open · jump anywhere"}
                </div>
              </div>
            </div>
            <span className="font-display text-lg shrink-0 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Page hero ────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <header className="border-b-4 border-ink bg-bone relative overflow-hidden">
      <div className="absolute top-3 right-6 w-12 h-12 opacity-15 wiggle pointer-events-none" aria-hidden>
        <Image src="/cats/cat-dancer.png" alt="" fill className="object-contain" />
      </div>
      <div className="absolute bottom-2 right-28 w-9 h-9 opacity-10 spin-slow pointer-events-none" aria-hidden>
        <Image src="/cats/star.png" alt="" fill className="object-contain" />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-7 md:py-10 relative z-10">
        <div className="font-mono text-[10px] uppercase opacity-40 mb-2">
          // 3 WORLDS · 153 MISSIONS · 16 CHAPTERS
        </div>
        <h1 className="font-display text-6xl md:text-8xl leading-none mb-3">WORLDS</h1>
        <p className="font-mono text-sm opacity-55 max-w-lg leading-relaxed mb-4">
          Start with Fundamentals — it unlocks everything. Then specialise as a DJ, Producer, or both.
        </p>
      </div>
    </header>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function WorldsPageClient() {
  return (
    <main className="min-h-screen bg-bone">
      <Hero />
      <WorldModePicker />
      <MarqueeStrip />
      <div className="max-w-5xl mx-auto px-4 py-7 space-y-5 pb-24">
        {(["fundamentals", "dj", "producer"] as WorldId[]).map((world, i) => (
          <WorldCard key={world} world={world} index={i} />
        ))}
      </div>
    </main>
  );
}
