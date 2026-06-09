"use client";
/**
 * WorldsPageClient — /worlds — Central Hub
 *
 * Layout:
 * - Left sidebar: world switcher pills (in-page state, no navigation)
 * - Right panel: active world hero, chapter list, stats, CTA
 * - Mobile: tabs at top, content below
 */
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { chaptersByWorld } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";
import { useProgress } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import { WorldModePicker } from "./world/ModeSwitch";

type WorldId = "fundamentals" | "dj" | "producer";

const WORLDS: WorldId[] = ["fundamentals", "dj", "producer"];

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
    emoji: "🎵",
    title: "Fundamentals",
    tagline: "The vocabulary of music",
    description: "Sound, rhythm, melody, harmony and music technology. The foundation for everything — before you produce or DJ.",
    heroBg: "bg-acid",
    heroText: "text-ink",
    heroBorder: "border-b-4 border-ink",
    sidebarActive: "bg-acid text-ink border-l-4 border-ink",
    sidebarInactive: "bg-bone text-ink/50 hover:bg-acid/20 hover:text-ink",
    barBg: "bg-ink/15",
    barFill: "bg-ink",
    pillDone: "bg-ink text-bone",
    pillPartial: "bg-acid text-ink",
    pillEmpty: "bg-ink/10 text-ink/40",
    pillConnector: "bg-ink/25",
    flowBtn: "bg-ink text-bone hover:bg-electric-blue",
    freeBtn: "bg-ink/10 text-ink hover:bg-ink/20 border border-ink/30",
    catMain: "/cats/cat-handstand.png",
    catDeco1: "/cats/cat-headphones.png",
    deco1: "/cats/music-note.png",
    deco2: "/cats/star.png",
    worldBg: "bg-bone",
    accentDot: "bg-ink",
    statBg: "bg-ink/5",
    chapterBg: "bg-bone",
    chapterHover: "hover:bg-acid/15",
  },
  dj: {
    emoji: "🎧",
    title: "DJ World",
    tagline: "The art of playing for people",
    description: "rekordbox, beatmatching, cue points, the mix, crowd reading and career. 40 missions built from the DJ booth up.",
    heroBg: "bg-[#0a0f2e]",
    heroText: "text-bone",
    heroBorder: "border-b-4 border-volt",
    sidebarActive: "bg-[#0a0f2e] text-bone border-l-4 border-volt",
    sidebarInactive: "bg-bone text-ink/50 hover:bg-[#0a0f2e]/10 hover:text-ink",
    barBg: "bg-volt/20",
    barFill: "bg-volt",
    pillDone: "bg-volt text-ink",
    pillPartial: "bg-volt/40 text-bone",
    pillEmpty: "bg-bone/10 text-bone/35",
    pillConnector: "bg-volt/30",
    flowBtn: "bg-volt text-ink hover:bg-acid",
    freeBtn: "bg-bone/10 text-ink hover:bg-bone/20 border border-bone/30",
    catMain: "/cats/cat-dj.png",
    catDeco1: "/cats/cat-dj-new.png",
    deco1: "/cats/disco-ball.png",
    deco2: "/cats/headphones.png",
    worldBg: "bg-[#0a0f2e]",
    accentDot: "bg-volt",
    statBg: "bg-bone/5",
    chapterBg: "bg-[#0a1228]",
    chapterHover: "hover:bg-volt/10",
  },
  producer: {
    emoji: "🎛",
    title: "Producer",
    tagline: "Build music in Ableton Live 12",
    description: "From opening Live for the first time to deep instruments, Live 12 power features and pro output. 91 missions across 6 chapters.",
    heroBg: "bg-sun",
    heroText: "text-ink",
    heroBorder: "border-b-4 border-ink",
    sidebarActive: "bg-sun text-ink border-l-4 border-ink",
    sidebarInactive: "bg-bone text-ink/50 hover:bg-sun/20 hover:text-ink",
    barBg: "bg-ink/15",
    barFill: "bg-ink",
    pillDone: "bg-ink text-bone",
    pillPartial: "bg-sun text-ink",
    pillEmpty: "bg-ink/10 text-ink/40",
    pillConnector: "bg-ink/25",
    flowBtn: "bg-ink text-bone hover:bg-hot",
    freeBtn: "bg-ink/10 text-ink hover:bg-ink/20 border border-ink/30",
    catMain: "/cats/cat-dj-hero.png",
    catDeco1: "/cats/cat-raver.png",
    deco1: "/cats/boombox.png",
    deco2: "/cats/vinyl.png",
    worldBg: "bg-bone",
    accentDot: "bg-ink",
    statBg: "bg-ink/5",
    chapterBg: "bg-bone",
    chapterHover: "hover:bg-sun/15",
  },
} as const;

// ─── Circular progress ring ───────────────────────────────────────────────────
function ProgressRing({
  pct,
  size = 72,
  stroke = 7,
  color,
  trackColor,
}: {
  pct: number;
  size?: number;
  stroke?: number;
  color: string;
  trackColor: string;
}) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * Math.min(pct / 100, 1);
  const cx = size / 2;
  const cy = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: "stroke-dasharray 0.8s ease" }}
      />
      <text
        x={cx} y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="13"
        fontWeight="700"
        fill="currentColor"
        fontFamily="inherit"
      >
        {pct}%
      </text>
    </svg>
  );
}

// ─── Marquee ──────────────────────────────────────────────────────────────────
function MarqueeStrip() {
  const items = [
    "🎵 153 MISSIONS", "🌍 3 WORLDS", "📚 16 CHAPTERS",
    "🎧 DJ WORLD", "🎛 PRODUCER", "🔊 FUNDAMENTALS",
    "🐱 CATS INCLUDED", "⚡ GAMIFIED", "🏆 EARN TROPHIES",
    "🌊 FLOW MODE", "🔓 FREE MODE",
  ];
  const doubled = [...items, ...items];
  return (
    <div className="border-y-4 border-ink bg-ink text-bone overflow-hidden py-2.5 shrink-0">
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

// ─── Chapter row inside panel ─────────────────────────────────────────────────
function ChapterRow({
  slug,
  title,
  number,
  pct,
  complete,
  meta,
}: {
  slug: string;
  title: string;
  number: number;
  pct: number;
  complete: boolean;
  meta: typeof WORLD_META[WorldId];
}) {
  const emoji = CHAPTER_EMOJIS[slug] ?? "📖";
  const pillClass = complete
    ? meta.pillDone
    : pct > 0
    ? meta.pillPartial
    : meta.pillEmpty;

  return (
    <div className={`flex items-center gap-3 px-4 py-3 border-b border-current/10 transition-colors ${meta.chapterHover}`}>
      {/* Number + emoji */}
      <div className={`brutal-border w-9 h-9 flex flex-col items-center justify-center shrink-0 text-[10px] font-mono ${pillClass}`}>
        <span className="text-base leading-none">{complete ? "✓" : emoji}</span>
      </div>

      {/* Title + bar */}
      <div className="flex-1 min-w-0">
        <div className={`font-display text-sm leading-tight truncate ${meta.heroText}`}>
          {title}
        </div>
        <div className={`h-1 mt-1.5 rounded-sm overflow-hidden ${meta.barBg}`}>
          <div
            className={`h-full ${meta.barFill} transition-all duration-700`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Pct label */}
      <div className={`font-mono text-[10px] tabular-nums shrink-0 ${meta.heroText} opacity-50`}>
        {complete ? "done" : pct > 0 ? `${pct}%` : `CH${String(number).padStart(2, "0")}`}
      </div>
    </div>
  );
}

// ─── Active world panel ───────────────────────────────────────────────────────
function WorldPanel({ world }: { world: WorldId }) {
  const { progress } = useProgress();
  const { learnMode } = useLearnMode();
  const completed = progress.completedMissions;
  const meta = WORLD_META[world];
  const isFlow = learnMode === "flow";
  const chapters = chaptersByWorld(world);
  const paths = pathsByWorld(world);

  const allSlugs = paths.flatMap((p) => p.missionSlugs);
  const done = allSlugs.filter((s) => !!completed[s]).length;
  const total = allSlugs.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const chapterStats = chapters.map((ch) => {
    const chPaths = paths.filter((p) => p.chapter === ch.slug);
    const chSlugs = chPaths.flatMap((p) => p.missionSlugs);
    const chDone = chSlugs.filter((s) => !!completed[s]).length;
    const chPct = chSlugs.length > 0 ? Math.round((chDone / chSlugs.length) * 100) : 0;
    return {
      slug: ch.slug,
      title: ch.title,
      number: ch.number,
      pct: chPct,
      complete: chDone === chSlugs.length && chSlugs.length > 0,
    };
  });

  const completedChapters = chapterStats.filter((c) => c.complete).length;
  const href = isFlow ? `/world/${world}` : `/world/${world}?view=free`;

  const ringColor = world === "dj" ? "#C6FF00" : world === "producer" ? "#FFB800" : "#000000";
  const ringTrack = world === "dj" ? "rgba(198,255,0,0.15)" : "rgba(0,0,0,0.12)";

  return (
    <div className={`flex flex-col h-full ${meta.worldBg}`}>

      {/* ── Hero ── */}
      <div className={`${meta.heroBg} ${meta.heroText} ${meta.heroBorder} relative overflow-hidden`}>
        <div className="px-6 pt-6 pb-5 flex items-start gap-5 relative z-10">

          {/* Left: info */}
          <div className="flex-1 min-w-0">
            <div className={`font-mono text-[9px] uppercase opacity-50 mb-2`}>
              {chapters.length} CHAPTERS · {paths.length} PATHS · {total} MISSIONS
            </div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-5xl leading-none">{meta.emoji}</span>
              <h2 className="font-display text-4xl md:text-5xl leading-none">
                {meta.title.toUpperCase()}
              </h2>
            </div>
            <p className={`font-mono text-xs opacity-60 mt-1 mb-4 max-w-sm leading-relaxed`}>
              {meta.description}
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-2">
              <div className={`brutal-border px-3 py-1.5 font-mono text-[10px] uppercase ${meta.statBg} ${meta.heroText}`}>
                {done}/{total} missions
              </div>
              <div className={`brutal-border px-3 py-1.5 font-mono text-[10px] uppercase ${meta.statBg} ${meta.heroText}`}>
                {completedChapters}/{chapters.length} chapters
              </div>
              {pct === 100 && (
                <div className={`brutal-border px-3 py-1.5 font-mono text-[10px] uppercase bg-volt text-ink`}>
                  🏆 Complete
                </div>
              )}
            </div>
          </div>

          {/* Right: ring + cat */}
          <div className="shrink-0 flex flex-col items-center gap-3">
            <div className={`${meta.heroText}`}>
              <ProgressRing pct={pct} size={80} stroke={8} color={ringColor} trackColor={ringTrack} />
            </div>
            <div
              className="w-20 h-20 wiggle"
              style={{ filter: "drop-shadow(3px 3px 0 rgba(0,0,0,0.25))" }}
              aria-hidden
            >
              <Image src={meta.catMain} alt="" width={80} height={80} className="w-full h-full object-contain" />
            </div>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className={`h-2 ${meta.barBg}`}>
          <div
            className={`h-full ${meta.barFill} transition-all duration-1000`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* ── Chapter list ── */}
      <div className={`flex-1 overflow-y-auto ${meta.worldBg} ${meta.heroText}`}>
        <div className={`px-4 pt-4 pb-2 flex items-center justify-between`}>
          <span className={`font-mono text-[9px] uppercase opacity-50`}>CHAPTERS</span>
          <Link
            href={`/world/${world}?view=free`}
            className={`font-mono text-[9px] uppercase opacity-50 hover:opacity-100 transition-opacity`}
          >
            Wiki →
          </Link>
        </div>

        {chapterStats.map((ch) => (
          <ChapterRow key={ch.slug} {...ch} meta={meta} />
        ))}
      </div>

      {/* ── CTA footer ── */}
      <div className={`border-t-4 border-ink shrink-0`}>
        <div className="grid grid-cols-2 gap-0">
          <Link
            href={`/world/${world}`}
            className={`flex items-center justify-center gap-2 py-4 px-4 font-display text-sm border-r-4 border-ink brutal-press transition-colors ${meta.flowBtn}`}
          >
            <span>🌊</span>
            <div className="text-left">
              <div className="leading-none">FLOW MODE</div>
              <div className="font-mono text-[8px] opacity-60 mt-0.5 leading-none normal-case">Sequential · guided</div>
            </div>
          </Link>
          <Link
            href={`/world/${world}?view=free`}
            className={`flex items-center justify-center gap-2 py-4 px-4 font-display text-sm brutal-press transition-colors ${meta.freeBtn}`}
          >
            <span>🔓</span>
            <div className="text-left">
              <div className="leading-none">FREE MODE</div>
              <div className="font-mono text-[8px] opacity-60 mt-0.5 leading-none normal-case">All open · jump anywhere</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── World sidebar pill ───────────────────────────────────────────────────────
function WorldPill({
  world,
  active,
  onClick,
  pct,
}: {
  world: WorldId;
  active: boolean;
  onClick: () => void;
  pct: number;
}) {
  const meta = WORLD_META[world];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left brutal-border px-4 py-3.5 transition-all brutal-press flex items-center gap-3 ${
        active ? meta.sidebarActive : meta.sidebarInactive
      }`}
    >
      <span className="text-2xl leading-none shrink-0">{meta.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="font-display text-sm leading-none">{meta.title}</div>
        <div className="font-mono text-[9px] opacity-55 mt-1 leading-none">{meta.tagline}</div>
        {/* Mini progress bar */}
        <div className={`h-0.5 mt-2 ${active ? "bg-current/20" : "bg-current/10"} overflow-hidden`}>
          <div
            className={`h-full transition-all duration-700 ${active ? "bg-current/70" : "bg-current/40"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className="font-mono text-[10px] tabular-nums opacity-50 shrink-0">{pct}%</div>
    </button>
  );
}

// ─── Page hero ────────────────────────────────────────────────────────────────
function PageHero() {
  return (
    <header className="border-b-4 border-ink bg-bone relative overflow-hidden shrink-0">
      <div className="absolute top-4 right-8 w-12 h-12 opacity-10 wiggle pointer-events-none" aria-hidden>
        <Image src="/cats/cat-dancer.png" alt="" fill className="object-contain" />
      </div>
      <div className="max-w-full px-6 py-6 md:py-8 relative z-10">
        <div className="font-mono text-[10px] uppercase opacity-40 mb-1.5">
          // 3 WORLDS · 153 MISSIONS · 16 CHAPTERS
        </div>
        <h1 className="font-display text-6xl md:text-7xl leading-none">WORLDS</h1>
        <p className="font-mono text-sm opacity-50 mt-2 max-w-sm leading-relaxed">
          Start with Fundamentals. Specialise as a DJ, Producer, or both.
        </p>
      </div>
    </header>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function WorldsPageClient() {
  const [activeWorld, setActiveWorld] = useState<WorldId>("fundamentals");
  const { progress } = useProgress();
  const completed = progress.completedMissions;

  // Compute pct for each world for the sidebar pills
  const worldPcts = WORLDS.reduce<Record<WorldId, number>>((acc, world) => {
    const paths = pathsByWorld(world);
    const slugs = paths.flatMap((p) => p.missionSlugs);
    const done = slugs.filter((s) => !!completed[s]).length;
    acc[world] = slugs.length > 0 ? Math.round((done / slugs.length) * 100) : 0;
    return acc;
  }, {} as Record<WorldId, number>);

  return (
    <main className="min-h-screen bg-bone flex flex-col">
      <PageHero />
      <MarqueeStrip />

      {/* ── Mode picker ── */}
      <WorldModePicker />

      {/* ── Main layout: sidebar + panel ── */}
      <div className="flex flex-1 min-h-0">

        {/* ── Left sidebar ── */}
        <aside className="w-64 shrink-0 bg-bone border-r-4 border-ink flex flex-col hidden md:flex">

          <div className="px-4 pt-5 pb-3 border-b-2 border-ink/10">
            <div className="font-mono text-[9px] uppercase opacity-50">SELECT WORLD</div>
          </div>

          <div className="flex-1 flex flex-col gap-0 py-3 px-3 space-y-2">
            {WORLDS.map((world) => (
              <WorldPill
                key={world}
                world={world}
                active={activeWorld === world}
                onClick={() => setActiveWorld(world)}
                pct={worldPcts[world]}
              />
            ))}
          </div>

          {/* Sidebar footer: overall stats */}
          <div className="border-t-4 border-ink px-4 py-4 bg-ink text-bone">
            <div className="font-mono text-[9px] uppercase opacity-60 mb-2">OVERALL</div>
            <div className="space-y-1.5">
              {WORLDS.map((w) => (
                <div key={w} className="flex items-center gap-2">
                  <span className="text-sm">{WORLD_META[w].emoji}</span>
                  <div className={`flex-1 h-1.5 bg-bone/15 overflow-hidden`}>
                    <div
                      className="h-full bg-acid transition-all duration-700"
                      style={{ width: `${worldPcts[w]}%` }}
                    />
                  </div>
                  <span className="font-mono text-[9px] tabular-nums opacity-60 w-7 text-right">{worldPcts[w]}%</span>
                </div>
              ))}
            </div>
            <Link
              href="/dashboard"
              className="mt-3 block font-mono text-[9px] uppercase opacity-50 hover:opacity-100 transition-opacity"
            >
              Full progress →
            </Link>
          </div>
        </aside>

        {/* ── Mobile: world tabs ── */}
        <div className="md:hidden w-full">
          {/* Tab bar */}
          <div className="flex border-b-4 border-ink bg-bone sticky top-[52px] z-20">
            {WORLDS.map((world) => {
              const meta = WORLD_META[world];
              const isActive = activeWorld === world;
              return (
                <button
                  key={world}
                  onClick={() => setActiveWorld(world)}
                  className={`flex-1 py-3 flex flex-col items-center gap-1 brutal-press transition-colors border-r-4 last:border-r-0 border-ink ${
                    isActive ? `${meta.heroBg} ${meta.heroText}` : "bg-bone text-ink/50"
                  }`}
                >
                  <span className="text-xl">{meta.emoji}</span>
                  <span className="font-mono text-[8px] uppercase">{meta.title.split(" ")[0]}</span>
                  <span className="font-mono text-[8px] opacity-60">{worldPcts[world]}%</span>
                </button>
              );
            })}
          </div>

          {/* Mobile panel */}
          <WorldPanel world={activeWorld} />
        </div>

        {/* ── Desktop: right panel ── */}
        <div className="hidden md:flex flex-1 min-w-0 overflow-y-auto">
          <div className="w-full">
            <WorldPanel world={activeWorld} />
          </div>
        </div>
      </div>
    </main>
  );
}
