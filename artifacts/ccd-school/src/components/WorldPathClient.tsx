"use client";
/**
 * WorldPathClient — Duolingo-style world path map.
 *
 * ✓ Full-bleed image hero with dark overlay (not cramped compact header)
 * ✓ Cat placed BELOW hero as a character entering the scene
 * ✓ No spine line — connector dots between nodes instead
 * ✓ Full-width Flow / Browse toggle band
 * ✓ Chapter banners: CH 01 + full name + tagline + cat quip
 * ✓ ChapterDots: emoji + short chapter name always visible
 * ✓ DJ world: deep blue (#0a0f2e) not pure black
 * ✓ Bigger nodes, better positioning
 */
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useProgress, getLessonStrength, REVIEW_THRESHOLD } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import { chaptersByWorld } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";
import { FOUNDATIONS_MISSIONS } from "@/content/missions-foundations";
import { DJ_WORLD_MISSIONS } from "@/content/missions-dj";
import { MISSIONS } from "@/content/missions";
import { rankFor } from "@/lib/ranks";
import type { Mission } from "@/content/types";
import type { Chapter } from "@/content/chapters";

type WorldId = "fundamentals" | "dj" | "producer";
type NodeState = "locked" | "available" | "complete" | "review";

interface PathNode {
  slug: string;
  title: string;
  xp: number;
  chapterSlug: string;
  chapterIndex: number;
  state: NodeState;
  isFirstInChapter: boolean;
  side: "left" | "center" | "right";
}

// FAL AI hero images
const WORLD_IMAGES: Record<string, string> = {
  fundamentals: "https://v3b.fal.media/files/b/0a9d8573/T1yPDNCVhxrVLWBs3vPLK.jpg",
  dj:           "https://v3b.fal.media/files/b/0a9d8573/vkzVEVke8UdYZtUAJEt5P.jpg",
  producer:     "https://v3b.fal.media/files/b/0a9d8573/FWDTuawui9X18aCB004I0.jpg",
};

const WORLD_OVERLAY: Record<string, string> = {
  fundamentals: "from-acid/80 via-acid/70 to-acid/50",
  dj:           "from-[#0a0f2e]/90 via-[#0a0f2e]/80 to-[#0a0f2e]/60",
  producer:     "from-sun/80 via-sun/70 to-sun/50",
};

// ─── World config ─────────────────────────────────────────────────────────────
const WORLD_META: Record<string, {
  bg: string; textColor: string; accent: string;
  nodeAvail: string; nodeDone: string; nodeReview: string;
  emoji: string; title: string; tagline: string;
  catSrc: string; glowColor: string;
  toggleBg: string; toggleText: string;
  chapterBannerBg: string; chapterBannerBorder: string;
}> = {
  fundamentals: {
    bg: "bg-bone", textColor: "text-ink", accent: "bg-acid text-ink",
    nodeAvail: "bg-acid text-ink border-4 border-ink",
    nodeDone: "bg-ink text-bone border-4 border-ink",
    nodeReview: "bg-hot text-bone border-4 border-hot",
    emoji: "🎵", title: "Fundamentals",
    tagline: "Sound · Rhythm · Melody · Harmony · Music Tech",
    catSrc: "/cats/cat-handstand.png",
    glowColor: "rgba(198,255,0,0.4)",
    toggleBg: "bg-ink text-bone", toggleText: "text-ink/60",
    chapterBannerBg: "bg-acid/20 backdrop-blur-sm",
    chapterBannerBorder: "border-t-4 border-t-acid",
  },
  dj: {
    bg: "bg-[#0a0f2e]", textColor: "text-bone", accent: "bg-volt text-ink",
    nodeAvail: "bg-volt text-ink border-4 border-volt",
    nodeDone: "bg-volt/20 text-bone border-4 border-volt/50",
    nodeReview: "bg-hot text-bone border-4 border-hot",
    emoji: "🎧", title: "DJ World",
    tagline: "Setup · Library · The Mix · Performance · Mastery",
    catSrc: "/cats/cat-dj.png",
    glowColor: "rgba(198,255,0,0.4)",
    toggleBg: "bg-volt text-ink", toggleText: "text-bone/60",
    chapterBannerBg: "bg-volt/10 backdrop-blur-sm",
    chapterBannerBorder: "border-t-4 border-t-volt",
  },
  producer: {
    bg: "bg-bone", textColor: "text-ink", accent: "bg-sun text-ink",
    nodeAvail: "bg-sun text-ink border-4 border-ink",
    nodeDone: "bg-ink text-bone border-4 border-ink",
    nodeReview: "bg-hot text-bone border-4 border-hot",
    emoji: "🎛", title: "Producer",
    tagline: "First Contact · Sound & MIDI · Mix · Performance · Advanced",
    catSrc: "/cats/cat-dj-hero.png",
    glowColor: "rgba(255,184,0,0.4)",
    toggleBg: "bg-ink text-bone", toggleText: "text-ink/60",
    chapterBannerBg: "bg-sun/20 backdrop-blur-sm",
    chapterBannerBorder: "border-t-4 border-t-sun",
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

const CHAPTER_CAT_QUIPS: Record<string, string[]> = {
  fundamentals: ["Let's start with sound! 🎵", "Rhythm is everything.", "Melody unlocked 🎶", "Chords = emotion.", "Final stretch!"],
  dj: ["DJ school is in! 🎧", "Your library is power.", "Time to mix! 🎚", "Read the crowd.", "Master level! 🏆"],
  producer: ["Welcome to Live! 🖥", "Sound design time!", "Mix it down 🎛", "Take it live! 🚀", "Expert territory!"],
};

function getMissions(world: WorldId): Mission[] {
  if (world === "fundamentals") return FOUNDATIONS_MISSIONS;
  if (world === "dj") return DJ_WORLD_MISSIONS;
  return MISSIONS;
}

const SIDE_PATTERN: ("left" | "center" | "right")[] = ["left", "center", "right", "center"];

// ─── Animated cat intro ───────────────────────────────────────────────────────
function AnimatedCatIntro({ meta, world, firstSlug }: {
  meta: typeof WORLD_META[string]; world: WorldId; firstSlug: string;
}) {
  const [visible, setVisible] = useState(false);
  const [bubbleVisible, setBubbleVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 100);
    const t2 = setTimeout(() => setBubbleVisible(true), 400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const WELCOME: Record<WorldId, { headline: string; body: string }> = {
    fundamentals: { headline: "Hi! I'm DJ Pawsworth 🐱", body: "Start with the basics of sound. Each lesson takes ~5 min. Tap START and follow along!" },
    dj: { headline: "Ready to DJ? 🎧", body: "I'll guide you through mixing step by step. First: what DJing actually is." },
    producer: { headline: "Welcome to the studio 🎛", body: "We'll tour Ableton Live together. One lesson at a time — you'll be making tracks before long!" },
  };
  const w = WELCOME[world];

  return (
    <div className="flex justify-center mb-12">
      <div className={`transition-all duration-500 ease-out w-full max-w-[340px] ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className={`brutal-border brutal-shadow p-6 ${
          world === "dj" ? "bg-[#0a1a3e] text-bone border-t-4 border-t-volt"
          : world === "fundamentals" ? "bg-acid text-ink"
          : "bg-sun text-ink"
        }`}>
          <div className="flex items-start gap-4 mb-4">
            <div style={{ filter: "drop-shadow(3px 3px 0 rgba(0,0,0,0.4))" }} className="shrink-0 animate-bounce-bob">
              <Image src={meta.catSrc} alt="DJ Pawsworth" width={68} height={68} className="object-contain" />
            </div>
            <div className={`transition-all duration-400 ease-out ${bubbleVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"}`}>
              <div className="font-display text-xl leading-tight">{w.headline}</div>
              <div className="font-mono text-[10px] uppercase opacity-60 mt-0.5">Your guide for this world</div>
            </div>
          </div>
          <p className={`font-mono text-xs leading-relaxed opacity-80 mb-5 transition-all duration-500 delay-100 ${bubbleVisible ? "opacity-80 translate-y-0" : "opacity-0 translate-y-2"}`}>
            {w.body}
          </p>
          <Link href={`/learn/${firstSlug}`} className={`block w-full text-center font-display text-base py-4 brutal-border brutal-press transition-colors ${
            world === "dj" ? "bg-volt text-ink hover:bg-acid" : "bg-ink text-bone hover:bg-electric-blue"
          }`}>
            START FIRST LESSON →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Chapter dots row — with short names ──────────────────────────────────────
function ChapterDots({ chapters, nodes, world, meta }: {
  chapters: Chapter[]; nodes: PathNode[]; world: WorldId;
  meta: typeof WORLD_META[string];
}) {
  return (
    <div className={`border-b-4 border-ink ${world === "dj" ? "bg-[#0a0f2e]" : "bg-bone"}`}>
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-center gap-1 flex-wrap">
        {chapters.map((ch, i) => {
          const chNodes = nodes.filter(n => n.chapterSlug === ch.slug);
          const done = chNodes.filter(n => n.state === "complete" || n.state === "review").length;
          const total = chNodes.length;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          const complete = pct === 100;
          const started = done > 0;
          const shortName = ch.title.split(" ")[0];

          return (
            <div key={ch.slug} className="flex items-center gap-0.5">
              <div
                title={`${ch.title} — ${pct}%`}
                className={`flex items-center gap-1.5 px-2.5 py-1 brutal-border font-mono text-[9px] uppercase transition-all ${
                  complete
                    ? world === "dj" ? "bg-volt text-ink" : "bg-ink text-bone"
                    : started
                    ? world === "dj" ? "bg-volt/30 text-bone" : "bg-acid/70 text-ink"
                    : world === "dj" ? "bg-bone/10 text-bone/40" : "bg-ink/10 text-ink/30"
                }`}
              >
                <span className="text-sm leading-none">{complete ? "✓" : CHAPTER_EMOJIS[ch.slug] ?? "📖"}</span>
                <span className="font-bold">{shortName}</span>
              </div>
              {i < chapters.length - 1 && (
                <div className={`w-2 h-px ${world === "dj" ? "bg-bone/20" : "bg-ink/20"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Full-width Flow / Browse toggle band ─────────────────────────────────────
function ModeToggleBand({ worldSlug, meta }: { worldSlug: string; meta: typeof WORLD_META[string] }) {
  const world = worldSlug as WorldId;
  return (
    <div className={`border-b-4 border-ink flex ${world === "dj" ? "bg-[#0a0f2e]" : "bg-bone"}`}>
      {/* Flow Mode — active */}
      <div className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 ${meta.toggleBg}`}>
        <span className="text-lg">🌊</span>
        <div>
          <div className="font-display text-sm leading-none">Flow Mode</div>
          <div className="font-mono text-[9px] uppercase opacity-60 mt-0.5">Sequential · hearts on</div>
        </div>
        <span className="font-mono text-[8px] bg-current/20 px-1.5 py-0.5 uppercase ml-1 opacity-80 rounded-sm">
          ACTIVE
        </span>
      </div>
      {/* Divider */}
      <div className="w-px bg-ink/30" />
      {/* Browse / Free — inactive link */}
      <Link
        href={`/world/${worldSlug}?view=free`}
        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 brutal-press transition-colors hover:opacity-80 ${
          world === "dj" ? "text-bone/60 hover:bg-bone/5" : "text-ink/50 hover:bg-acid/10"
        }`}
      >
        <span className="text-lg">📋</span>
        <div>
          <div className="font-display text-sm leading-none">Browse</div>
          <div className="font-mono text-[9px] uppercase opacity-60 mt-0.5">All lessons open</div>
        </div>
      </Link>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function WorldPathClient({ worldSlug }: { worldSlug: string }) {
  const world = worldSlug as WorldId;
  const meta = WORLD_META[world];
  const { progress } = useProgress();
  const { learnMode } = useLearnMode();
  const completed = progress.completedMissions;
  const strengths = progress.lessonStrengths;
  const unlockedChapter = progress.unlockedChapter ?? 1;

  const chapters = chaptersByWorld(world);
  const paths = pathsByWorld(world);
  const missions = getMissions(world);

  // Build flat node list
  const nodes: PathNode[] = [];
  let prevComplete = true;

  chapters.forEach((ch, chIdx) => {
    const chapterNumber = chIdx + 1;
    const placedPast = chapterNumber < unlockedChapter;
    const chPaths = paths.filter(p => p.chapter === ch.slug).sort((a, b) => a.number - b.number);

    chPaths.forEach((path, pIdx) => {
      path.missionSlugs.forEach((slug, mIdx) => {
        const isDone = !!completed[slug];
        const ls = strengths[slug];
        const needsReview = isDone && ls && getLessonStrength(ls) < REVIEW_THRESHOLD;
        const effectivelyDone = isDone || placedPast;

        let state: NodeState = "locked";
        if (isDone) state = needsReview ? "review" : "complete";
        else if (placedPast) state = "available";
        else if (prevComplete) state = "available";

        nodes.push({
          slug,
          xp: missions.find(m => m.slug === slug)?.xp ?? 40,
          title: missions.find(m => m.slug === slug)?.title ?? slug,
          chapterSlug: ch.slug, chapterIndex: chIdx, state,
          isFirstInChapter: pIdx === 0 && mIdx === 0,
          side: SIDE_PATTERN[nodes.length % 4],
        });

        prevComplete = effectivelyDone;
      });
    });
  });

  const total = nodes.length;
  const done = nodes.filter(n => n.state === "complete" || n.state === "review").length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const { current: rank } = rankFor(progress.xp);
  const isNewUser = done === 0;

  const youAreHereRef = useRef<HTMLDivElement>(null);
  const firstAvailableIdx = nodes.findIndex(n => n.state === "available");

  useEffect(() => {
    if (!isNewUser && youAreHereRef.current) {
      setTimeout(() => {
        youAreHereRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 500);
    }
  }, [isNewUser]);

  if (!meta) return <div className="p-8 font-mono">World not found: {worldSlug}</div>;

  const firstAvailableSlug = nodes.find(n => n.state === "available")?.slug;

  return (
    <div className={`min-h-screen ${meta.bg}`}>

      {/* ── Full-bleed hero header ──────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b-4 border-ink" style={{ minHeight: "320px" }}>
        {/* Background image */}
        <Image
          src={WORLD_IMAGES[world]}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* Dark gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-r ${WORLD_OVERLAY[world]}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Content */}
        <div className={`relative z-10 max-w-2xl mx-auto px-4 pt-6 pb-8 md:pt-8 md:pb-12 ${meta.textColor}`}>
          <Link href="/worlds" className="font-mono text-[10px] uppercase opacity-70 hover:opacity-100 block mb-5">
            ← ALL WORLDS
          </Link>

          {/* Big title */}
          <div className="flex items-center gap-4 mb-4">
            <span className="text-6xl md:text-8xl leading-none">{meta.emoji}</span>
            <div>
              <h1
                className="font-display text-5xl md:text-7xl leading-none"
                style={{ textShadow: "3px 3px 0 rgba(0,0,0,0.3)" }}
              >
                {meta.title}
              </h1>
              <p className="font-mono text-xs uppercase opacity-80 mt-1">{meta.tagline}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-3 brutal-border bg-black/30 overflow-hidden mb-2 max-w-md">
            <div
              className="h-full bg-current/70 transition-all duration-700"
              style={{ width: `${pct}%`, boxShadow: `0 0 12px rgba(255,255,255,0.3)` }}
            />
          </div>
          <div className="flex items-center gap-4 font-mono text-[10px] uppercase opacity-80 mb-5">
            <span>{done}/{total} lessons</span>
            <span>{pct}%</span>
            <span>{rank.name}</span>
          </div>

          {/* Stats pills */}
          <div className="flex flex-wrap gap-2">
            <div className="brutal-border bg-black/30 backdrop-blur-sm px-3 py-1 font-mono text-[10px] uppercase">
              🔥 {progress.streakDays}d streak
            </div>
            <div className="brutal-border bg-black/30 backdrop-blur-sm px-3 py-1 font-mono text-[10px] uppercase">
              {progress.xp} XP
            </div>
            <div className="brutal-border bg-black/30 backdrop-blur-sm px-3 py-1 font-mono text-[10px] uppercase">
              💎 {progress.gems}
            </div>
          </div>
        </div>
      </div>

      {/* ── Flow / Browse toggle band ───────────────────────────────────── */}
      <ModeToggleBand worldSlug={worldSlug} meta={meta} />

      {/* ── Chapter dots ───────────────────────────────────────────────── */}
      <ChapterDots chapters={chapters} nodes={nodes} world={world} meta={meta} />

      {/* ── Snake path — NO spine line ──────────────────────────────────── */}
      <div className="max-w-sm mx-auto px-4 pt-10 pb-32">

        {/* First-visit animated cat */}
        {isNewUser && firstAvailableSlug && (
          <AnimatedCatIntro meta={meta} world={world} firstSlug={firstAvailableSlug} />
        )}

        {nodes.map((node, idx) => {
          const isChapterStart = node.isFirstInChapter;
          const chEmoji = CHAPTER_EMOJIS[node.chapterSlug] ?? "📖";
          const chapter = chapters.find(c => c.slug === node.chapterSlug);
          const chQuip = (CHAPTER_CAT_QUIPS[world] ?? [])[node.chapterIndex] ?? "Let's go!";
          const chNum = String(node.chapterIndex + 1).padStart(2, "0");

          return (
            <div key={node.slug}>
              {/* Chapter banner — full name + number */}
              {isChapterStart && (
                <div className="flex justify-center my-10">
                  <div className={`brutal-border text-center max-w-[300px] w-full brutal-shadow overflow-hidden ${meta.chapterBannerBg} ${meta.chapterBannerBorder} ${meta.textColor}`}>
                    {/* Chapter label row */}
                    <div className={`px-5 pt-4 pb-3`}>
                      <div className="font-mono text-[10px] uppercase opacity-60 mb-1">
                        CH {chNum}
                      </div>
                      <div className="text-5xl mb-2">{chEmoji}</div>
                      <div className="font-display text-xl leading-tight">{chapter?.title ?? node.chapterSlug}</div>
                      <div className="font-mono text-[10px] opacity-60 mt-1 leading-snug uppercase">{chapter?.tagline ?? ""}</div>
                    </div>
                    {/* Cat quip strip */}
                    <div className={`px-4 py-2.5 border-t-2 border-current/20 flex items-center justify-center gap-2 font-mono text-[10px] italic ${
                      world === "dj" ? "bg-volt/10 text-bone" : "bg-ink/8 text-ink"
                    }`}>
                      <span className="shrink-0">🐱</span>
                      <span className="opacity-75">&ldquo;{chQuip}&rdquo;</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Node — positioned left/center/right with safe padding */}
              <div className={`relative flex mb-12 ${
                node.side === "left" ? "justify-start pl-8" :
                node.side === "right" ? "justify-end pr-8" :
                "justify-center"
              }`}>
                {idx === firstAvailableIdx ? (
                  <div className="flex flex-col items-center gap-1.5">
                    {!isNewUser && (
                      <div className={`brutal-border px-3 py-1 font-display text-[10px] uppercase mb-2 animate-pulse ${
                        world === "dj" ? "bg-volt text-ink" : "bg-acid text-ink"
                      }`}>
                        🐾 YOU ARE HERE
                      </div>
                    )}
                    <div ref={youAreHereRef}>
                      <LessonNode node={node} meta={meta} />
                    </div>
                  </div>
                ) : (
                  <LessonNode node={node} meta={meta} />
                )}
              </div>
            </div>
          );
        })}

        {/* World complete */}
        {pct === 100 && (
          <div className="brutal-border bg-acid text-ink p-8 text-center brutal-shadow mt-8">
            <div className="flex justify-center mb-4">
              <Image src={meta.catSrc} alt="" width={100} height={100}
                className="drop-shadow-[4px_4px_0_rgba(0,0,0,0.3)] animate-bounce-bob" />
            </div>
            <div className="text-5xl mb-3">🏆</div>
            <div className="font-display text-4xl">WORLD COMPLETE!</div>
            <div className="font-mono text-sm opacity-70 mt-2">You finished {meta.title}. Incredible.</div>
            <Link href="/worlds" className="mt-5 brutal-border bg-ink text-bone px-7 py-3.5 font-display text-base inline-block brutal-press hover:bg-electric-blue transition-colors">
              EXPLORE OTHER WORLDS →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Lesson Node ───────────────────────────────────────────────────────────────
function LessonNode({ node, meta }: { node: PathNode; meta: typeof WORLD_META[string] }) {
  const Wrap = ({ children, href, className, title }: {
    children: ReactNode; href?: string; className?: string; title?: string;
  }) => {
    const inner = <div className="flex flex-col items-center gap-2 group" title={title}>{children}</div>;
    if (href) return <a href={href} className={`block brutal-press ${className ?? ""}`}>{inner}</a>;
    return <div className={className}>{inner}</div>;
  };

  const Label = ({ text, dim }: { text: string; dim?: boolean }) => (
    <span className={`font-mono text-[10px] uppercase leading-tight text-center max-w-[88px] line-clamp-2 ${dim ? "opacity-20" : "opacity-60"}`}>
      {text}
    </span>
  );

  if (node.state === "locked") {
    return (
      <Wrap title={node.title} className="cursor-not-allowed">
        <div className="w-14 h-14 rounded-full border-2 border-current/15 bg-current/5 flex items-center justify-center opacity-25">
          <span className="text-lg">🔒</span>
        </div>
        <Label text={node.title} dim />
      </Wrap>
    );
  }

  if (node.state === "complete") {
    return (
      <Wrap href={`/learn/${node.slug}`} title={`${node.title} — completed`}>
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${meta.nodeDone} transition-transform group-hover:scale-110`}>
          <span className="text-2xl font-bold">✓</span>
        </div>
        <Label text={node.title} />
      </Wrap>
    );
  }

  if (node.state === "review") {
    return (
      <Wrap href={`/learn/${node.slug}?review=1`} title={`${node.title} — needs review`}>
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center ${meta.nodeReview} transition-transform group-hover:scale-110`}
          style={{ animation: "pulse 2s ease-in-out infinite" }}
        >
          <span className="text-2xl">🔥</span>
        </div>
        <Label text="Review" />
      </Wrap>
    );
  }

  // Available — big, glowing, pulsing
  return (
    <Wrap href={`/learn/${node.slug}`} title={node.title}>
      <div
        className={`w-28 h-28 rounded-full flex flex-col items-center justify-center gap-1.5 ${meta.nodeAvail} transition-all group-hover:scale-110`}
        style={{ boxShadow: `0 0 0 8px ${meta.glowColor}, 0 0 32px ${meta.glowColor}` }}
      >
        <span className="font-display text-sm font-bold leading-tight text-center px-3 line-clamp-2">
          {node.title}
        </span>
        <span className="font-mono text-[9px] opacity-90 font-bold">+{node.xp} XP</span>
      </div>
      <Label text={node.title} />
    </Wrap>
  );
}
