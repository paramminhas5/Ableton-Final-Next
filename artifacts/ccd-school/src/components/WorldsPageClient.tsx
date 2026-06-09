"use client";
/**
 * WorldsPageClient — /worlds index.
 *
 * Complete overhaul:
 * - NO images at all — pure color-block CCD cards
 * - Cats everywhere: different cat per world, floating decorative cats
 * - Scroll-linked entrance animations via IntersectionObserver
 * - Marquee ticker strip
 * - Big chapter pills (expanded, not tiny badges)
 * - Brutalist CCD design system throughout
 */
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { chaptersByWorld } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";
import { useProgress } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";

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
    title: "Fundamentals",
    emoji: "🎵",
    tagline: "The vocabulary of music",
    description: "Sound, rhythm, melody, harmony and music technology. The foundation for everything.",
    to: "/world/fundamentals",
    // Color system
    bg: "bg-acid",           // card background
    textPrimary: "text-ink",
    textMuted: "text-ink/60",
    border: "border-ink",
    barBg: "bg-ink/20",
    barFill: "bg-ink",
    ctaBg: "bg-ink",
    ctaText: "text-bone",
    ctaHover: "hover:bg-electric-blue",
    pillDone: "bg-ink text-bone",
    pillPartial: "bg-ink/40 text-ink",
    pillEmpty: "bg-ink/10 text-ink/40",
    shadow: "chunk-shadow",
    // Cats for this world
    catMain: "/cats/cat-handstand.png",
    catDeco1: "/cats/cat-headphones.png",
    catDeco2: "/cats/star.png",
    // Decorative elements
    deco1: "/cats/music-note.png",
    deco2: "/cats/vinyl.png",
  },
  dj: {
    title: "DJ World",
    emoji: "🎧",
    tagline: "The art of playing for people",
    description: "rekordbox, beatmatching, cue points, the mix, crowd reading and career.",
    to: "/world/dj",
    bg: "bg-[#0a0f2e]",
    textPrimary: "text-bone",
    textMuted: "text-bone/60",
    border: "border-volt",
    barBg: "bg-volt/20",
    barFill: "bg-volt",
    ctaBg: "bg-volt",
    ctaText: "text-ink",
    ctaHover: "hover:bg-acid",
    pillDone: "bg-volt text-ink",
    pillPartial: "bg-volt/40 text-bone",
    pillEmpty: "bg-bone/10 text-bone/30",
    shadow: "brutal-shadow-acid",
    catMain: "/cats/cat-dj.png",
    catDeco1: "/cats/cat-dj-new.png",
    catDeco2: "/cats/disco-ball.png",
    deco1: "/cats/headphones.png",
    deco2: "/cats/vinyl-music.png",
  },
  producer: {
    title: "Producer",
    emoji: "🎛",
    tagline: "Build music in Ableton Live 12",
    description: "From opening Live for the first time to deep instruments, Live 12 power features and pro output.",
    to: "/world/producer",
    bg: "bg-sun",
    textPrimary: "text-ink",
    textMuted: "text-ink/60",
    border: "border-ink",
    barBg: "bg-ink/20",
    barFill: "bg-ink",
    ctaBg: "bg-ink",
    ctaText: "text-bone",
    ctaHover: "hover:bg-hot",
    pillDone: "bg-ink text-bone",
    pillPartial: "bg-ink/40 text-ink",
    pillEmpty: "bg-ink/10 text-ink/40",
    shadow: "chunk-shadow",
    catMain: "/cats/cat-dj-hero.png",
    catDeco1: "/cats/cat-raver.png",
    catDeco2: "/cats/boombox.png",
    deco1: "/cats/music-note.png",
    deco2: "/cats/star.png",
  },
} as const;

// ─── Scroll reveal hook ────────────────────────────────────────────────────────
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, visible };
}

// ─── Marquee strip ────────────────────────────────────────────────────────────
function MarqueeStrip() {
  const items = [
    "🎵 153 MISSIONS",
    "🌍 3 WORLDS",
    "📚 16 CHAPTERS",
    "🎧 DJ WORLD",
    "🎛 PRODUCER",
    "🔊 FUNDAMENTALS",
    "🐱 CATS CAN DANCE",
    "⚡ GAMIFIED LEARNING",
    "🏆 EARN TROPHIES",
    "🌊 FLOW MODE",
    "🔓 FREE MODE",
  ];
  const repeated = [...items, ...items];

  return (
    <div className="border-b-4 border-ink bg-ink text-bone overflow-hidden py-2.5">
      <div className="flex gap-8 animate-marquee whitespace-nowrap">
        {repeated.map((item, i) => (
          <span key={i} className="font-display text-sm uppercase shrink-0 flex items-center gap-2">
            {item}
            <span className="text-acid opacity-60 mx-1">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Chapter pills strip ──────────────────────────────────────────────────────
function ChapterPills({
  world,
  meta,
  chapterStats,
}: {
  world: WorldId;
  meta: typeof WORLD_META[WorldId];
  chapterStats: { slug: string; title: string; number: number; pct: number; complete: boolean; tagline: string }[];
}) {
  return (
    <div className="mt-5 pt-4 border-t-2 border-current/20">
      <div className={`font-mono text-[9px] uppercase mb-3 ${meta.textMuted}`}>
        {chapterStats.length} CHAPTERS
      </div>
      <div className="flex flex-col gap-2">
        {chapterStats.map((ch) => {
          const emoji = CHAPTER_EMOJIS[ch.slug] ?? "📖";
          const stateClass = ch.complete
            ? meta.pillDone
            : ch.pct > 0
            ? meta.pillPartial
            : meta.pillEmpty;

          return (
            <div
              key={ch.slug}
              className={`brutal-border flex items-center gap-3 px-3 py-2.5 transition-all ${stateClass}`}
            >
              {/* Left: number + emoji */}
              <div className="shrink-0 flex items-center gap-2 w-12">
                <span className="font-mono text-[9px] opacity-50">{String(ch.number).padStart(2, "0")}</span>
                <span className="text-base leading-none">{ch.complete ? "✓" : emoji}</span>
              </div>

              {/* Middle: title + tagline */}
              <div className="flex-1 min-w-0">
                <div className="font-display text-sm leading-tight">{ch.title}</div>
                <div className="font-mono text-[9px] opacity-55 mt-0.5 truncate">{ch.tagline}</div>
              </div>

              {/* Right: progress */}
              <div className="shrink-0 text-right">
                {ch.pct > 0 && !ch.complete && (
                  <div className="font-display text-base tabular-nums">{ch.pct}%</div>
                )}
                {ch.complete && (
                  <div className="font-mono text-[9px] uppercase opacity-70">done</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── World Card ───────────────────────────────────────────────────────────────
function WorldCard({ world, index }: { world: WorldId; index: number }) {
  const { progress } = useProgress();
  const completed = progress.completedMissions;
  const { ref, visible } = useScrollReveal();

  const meta = WORLD_META[world];
  const chapters = chaptersByWorld(world);
  const paths = pathsByWorld(world);
  const allSlugs = paths.flatMap(p => p.missionSlugs);
  const done = allSlugs.filter(s => !!completed[s]).length;
  const total = allSlugs.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const chapterStats = chapters.map(ch => {
    const chPaths = paths.filter(p => p.chapter === ch.slug);
    const chSlugs = chPaths.flatMap(p => p.missionSlugs);
    const chDone = chSlugs.filter(s => !!completed[s]).length;
    const chPct = chSlugs.length > 0 ? Math.round((chDone / chSlugs.length) * 100) : 0;
    return {
      slug: ch.slug,
      title: ch.title,
      tagline: ch.tagline,
      number: ch.number,
      pct: chPct,
      complete: chDone === chSlugs.length && chSlugs.length > 0,
    };
  });

  const ctaLabel = done === 0 ? "START →" : pct === 100 ? "REVIEW →" : "CONTINUE →";
  const progressLabel = done === 0
    ? `${total} missions waiting`
    : pct === 100
    ? "World complete 🏆"
    : `${done} / ${total} missions done`;

  // Stagger delay per card
  const delay = index * 120;

  return (
    <div
      ref={ref}
      className="transition-all duration-700 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      <div className={`brutal-border ${meta.shadow} overflow-hidden`}>

        {/* ── Card body — solid color ──────────────────────────────── */}
        <div className={`${meta.bg} ${meta.textPrimary} p-6 md:p-8 relative overflow-hidden`}>

          {/* Decorative background cats — large, low opacity, positioned absolutely */}
          <div
            className="absolute -bottom-4 -right-4 w-40 h-40 opacity-10 pointer-events-none"
            aria-hidden
          >
            <Image src={meta.deco1} alt="" fill className="object-contain" />
          </div>
          <div
            className="absolute top-4 right-32 w-12 h-12 opacity-15 pointer-events-none spin-slow"
            aria-hidden
          >
            <Image src={meta.deco2} alt="" fill className="object-contain" />
          </div>

          {/* Top row: meta label + big % */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <div className={`font-mono text-[9px] uppercase mb-1 ${meta.textMuted}`}>
                {chapters.length} CHAPTERS · {paths.length} PATHS · {total} MISSIONS
              </div>
              {/* World title */}
              <div className="flex items-center gap-3">
                <span className="text-5xl md:text-6xl leading-none">{meta.emoji}</span>
                <h2 className="font-display text-4xl md:text-6xl leading-none">
                  {meta.title.toUpperCase()}
                </h2>
              </div>
              <p className={`font-display text-base md:text-lg mt-1 ${meta.textMuted}`}>
                {meta.tagline}
              </p>
            </div>

            {/* Right: % + cat */}
            <div className="shrink-0 flex flex-col items-end gap-3">
              <div className="text-right">
                <div className="font-display text-5xl md:text-6xl tabular-nums leading-none">
                  {pct}%
                </div>
                <div className={`font-mono text-[9px] uppercase mt-1 ${meta.textMuted}`}>
                  {done}/{total}
                </div>
              </div>
              <div
                className="w-20 h-20 md:w-24 md:h-24 wiggle"
                style={{ filter: "drop-shadow(4px 4px 0 rgba(0,0,0,0.25))" }}
                aria-hidden
              >
                <Image
                  src={meta.catMain}
                  alt=""
                  width={96}
                  height={96}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <p className={`font-mono text-xs leading-relaxed mb-5 max-w-lg ${meta.textMuted}`}>
            {meta.description}
          </p>

          {/* Progress bar */}
          <div className={`h-3 brutal-border overflow-hidden mb-1 ${meta.barBg}`}>
            <div
              className={`h-full ${meta.barFill} transition-all duration-1000`}
              style={{ width: visible ? `${pct}%` : "0%" }}
            />
          </div>
          <div className={`font-mono text-[9px] uppercase ${meta.textMuted}`}>{progressLabel}</div>

          {/* Chapter pills — expanded, full-width */}
          <ChapterPills world={world} meta={meta} chapterStats={chapterStats} />

          {/* Bottom: decorative cat row */}
          <div className="flex items-end justify-between mt-5 pt-4 border-t-2 border-current/15">
            <div className="flex items-end gap-3">
              <div
                className="w-12 h-12 float"
                style={{ filter: "drop-shadow(2px 2px 0 rgba(0,0,0,0.2))", animationDelay: "0.3s" }}
                aria-hidden
              >
                <Image src={meta.catDeco1} alt="" width={48} height={48} className="w-full h-full object-contain" />
              </div>
              <div
                className="w-10 h-10 float"
                style={{ filter: "drop-shadow(2px 2px 0 rgba(0,0,0,0.15))", animationDelay: "1.1s" }}
                aria-hidden
              >
                <Image src={meta.catDeco2} alt="" width={40} height={40} className="w-full h-full object-contain" />
              </div>
            </div>
            <div className={`font-mono text-[9px] uppercase ${meta.textMuted}`}>
              🐾 {world === "dj" ? "rekordbox · pioneer · serato" : world === "producer" ? "ableton live 12" : "music theory basics"}
            </div>
          </div>
        </div>

        {/* ── CTA footer strip ─────────────────────────────────────── */}
        <Link
          href={meta.to}
          className={`block ${meta.ctaBg} ${meta.ctaText} px-6 py-4 flex items-center justify-between brutal-press ${meta.ctaHover} transition-colors group`}
        >
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs uppercase opacity-60">{progressLabel}</span>
          </div>
          <span className="font-display text-lg group-hover:translate-x-1 transition-transform">
            {ctaLabel}
          </span>
        </Link>
      </div>
    </div>
  );
}

// ─── Hero header ──────────────────────────────────────────────────────────────
function Hero() {
  const { learnMode } = useLearnMode();
  const isFlow = learnMode === "flow";

  return (
    <header className="border-b-4 border-ink bg-bone relative overflow-hidden">
      {/* Decorative cats scattered in background */}
      <div className="absolute top-3 right-4 w-14 h-14 opacity-20 wiggle pointer-events-none" aria-hidden>
        <Image src="/cats/cat-dancer.png" alt="" fill className="object-contain" />
      </div>
      <div className="absolute bottom-2 right-32 w-10 h-10 opacity-15 spin-slow pointer-events-none" aria-hidden>
        <Image src="/cats/star.png" alt="" fill className="object-contain" />
      </div>
      <div className="absolute top-6 right-24 w-8 h-8 opacity-10 float pointer-events-none" aria-hidden>
        <Image src="/cats/music-note.png" alt="" fill className="object-contain" />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 relative z-10">
        <div className="font-mono text-[10px] uppercase opacity-40 mb-2">
          // THREE WORLDS · 153 MISSIONS · 16 CHAPTERS
        </div>
        <h1 className="font-display text-6xl md:text-8xl leading-none mb-3">WORLDS</h1>
        <p className="font-mono text-sm opacity-60 max-w-xl leading-relaxed mb-4">
          Start with Fundamentals — it unlocks everything. Then specialise as a DJ, a Producer, or both.
        </p>
        {/* Mode indicator — inline, linked to header toggle */}
        <div className={`inline-flex items-center gap-2 brutal-border px-3 py-2 font-mono text-xs uppercase ${
          isFlow ? "bg-acid text-ink" : "bg-bone text-ink"
        }`}>
          <span>{isFlow ? "🌊" : "🔓"}</span>
          <span className="font-display text-xs">{isFlow ? "Flow Mode" : "Free Mode"}</span>
          <span className="opacity-40">— toggle in header</span>
        </div>
      </div>
    </header>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function WorldsPageClient() {
  return (
    <main className="min-h-screen bg-bone">
      <Hero />
      <MarqueeStrip />

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 pb-24">
        {(["fundamentals", "dj", "producer"] as WorldId[]).map((world, i) => (
          <WorldCard key={world} world={world} index={i} />
        ))}
      </div>
    </main>
  );
}
