"use client";
/**
 * WorldPageClient — Free Mode chapter/path browser.
 *
 * Overhaul:
 * ✓ NO chapter accordion — everything visible, grouped by chapter
 * ✓ Chapter sections use big color-accent headers with cats
 * ✓ Path cards are big, tactile, fun
 * ✓ Solid color hero — no images
 * ✓ Inline mode indicator linked to header toggle
 * ✓ No "Browse" button — header ModeTogglePill is the source of truth
 * ✓ Mission list hidden behind lightweight toggle inside each path card
 */
import Link from "next/link";
import Image from "next/image";
import { chaptersByWorld, WORLD_TROPHIES } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";
import { useProgress } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import { useState } from "react";

type WorldSlug = "fundamentals" | "dj" | "producer";

const WORLD_CONFIG: Record<WorldSlug, {
  title: string; emoji: string; tagline: string; description: string;
  heroBg: string; heroText: string;
  bar: string; barBg: string;
  chapterAccentBg: string; chapterAccentText: string;
  chapterBorder: string;
  pillDone: string; pillActive: string;
  pathCtaBg: string; pathCtaText: string; pathCtaDone: string; pathCtaDoneText: string;
  catMain: string; catDeco1: string; catDeco2: string;
  deco1: string; deco2: string;
  worldBg: string;
  trophyBg: string; trophyText: string;
  flowLinkClass: string;
}> = {
  fundamentals: {
    title: "Fundamentals", emoji: "🎵",
    tagline: "The vocabulary of music — before you produce or DJ",
    description: "5 chapters · 10 paths · 40 missions",
    heroBg: "bg-acid", heroText: "text-ink",
    bar: "bg-ink", barBg: "bg-ink/15",
    chapterAccentBg: "bg-acid/30", chapterAccentText: "text-ink",
    chapterBorder: "border-l-4 border-acid",
    pillDone: "bg-ink text-bone",
    pillActive: "bg-acid text-ink",
    pathCtaBg: "bg-acid text-ink", pathCtaText: "text-ink",
    pathCtaDone: "bg-ink text-bone", pathCtaDoneText: "text-bone",
    catMain: "/cats/cat-handstand.png",
    catDeco1: "/cats/cat-headphones.png",
    catDeco2: "/cats/cat-dancer.png",
    deco1: "/cats/music-note.png",
    deco2: "/cats/star.png",
    worldBg: "bg-bone",
    trophyBg: "bg-acid text-ink", trophyText: "text-ink",
    flowLinkClass: "bg-ink/10 text-ink hover:bg-ink/20",
  },
  dj: {
    title: "DJ World", emoji: "🎧",
    tagline: "The art of playing recorded music for people",
    description: "5 chapters · 10 paths · 40 missions",
    heroBg: "bg-[#0a0f2e]", heroText: "text-bone",
    bar: "bg-volt", barBg: "bg-volt/15",
    chapterAccentBg: "bg-volt/15", chapterAccentText: "text-bone",
    chapterBorder: "border-l-4 border-volt",
    pillDone: "bg-volt text-ink",
    pillActive: "bg-volt/50 text-bone",
    pathCtaBg: "bg-volt text-ink", pathCtaText: "text-ink",
    pathCtaDone: "bg-volt/30 text-bone", pathCtaDoneText: "text-bone",
    catMain: "/cats/cat-dj.png",
    catDeco1: "/cats/cat-dj-new.png",
    catDeco2: "/cats/cat-cap.png",
    deco1: "/cats/disco-ball.png",
    deco2: "/cats/headphones.png",
    worldBg: "bg-[#0a0f2e]",
    trophyBg: "bg-volt text-ink", trophyText: "text-ink",
    flowLinkClass: "bg-bone/10 text-bone hover:bg-bone/20",
  },
  producer: {
    title: "Producer", emoji: "🎛",
    tagline: "Build music in Ableton Live 12",
    description: "6 chapters · 15 paths · 91 missions",
    heroBg: "bg-sun", heroText: "text-ink",
    bar: "bg-ink", barBg: "bg-ink/15",
    chapterAccentBg: "bg-sun/30", chapterAccentText: "text-ink",
    chapterBorder: "border-l-4 border-sun",
    pillDone: "bg-ink text-bone",
    pillActive: "bg-sun text-ink",
    pathCtaBg: "bg-sun text-ink", pathCtaText: "text-ink",
    pathCtaDone: "bg-ink text-bone", pathCtaDoneText: "text-bone",
    catMain: "/cats/cat-dj-hero.png",
    catDeco1: "/cats/cat-raver.png",
    catDeco2: "/cats/cat-source.png",
    deco1: "/cats/boombox.png",
    deco2: "/cats/vinyl-music.png",
    worldBg: "bg-bone",
    trophyBg: "bg-sun text-ink", trophyText: "text-ink",
    flowLinkClass: "bg-ink/10 text-ink hover:bg-ink/20",
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

// ─── Path card ────────────────────────────────────────────────────────────────
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
  const started = done > 0;

  return (
    <div className={`brutal-border overflow-hidden bg-bone ${world === "dj" ? "border-volt/40" : ""}`}>

      {/* Path header */}
      <div className="p-4 md:p-5 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Path number */}
          <div className={`font-mono text-[9px] uppercase opacity-40 mb-1`}>
            PATH {path.number} · {total} MISSIONS
          </div>

          {/* Title */}
          <div className={`font-display text-xl md:text-2xl leading-tight ${world === "dj" ? "text-[#0a0f2e]" : "text-ink"}`}>
            {path.title}
          </div>
          <div className="font-mono text-xs opacity-55 mt-0.5 leading-snug">{path.tagline}</div>

          {/* Progress bar */}
          <div className="mt-3 flex items-center gap-2">
            <div className={`flex-1 h-2 brutal-border overflow-hidden ${cfg.barBg}`}>
              <div
                className={`h-full ${cfg.bar} transition-all duration-500`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="font-mono text-[10px] opacity-50 shrink-0 tabular-nums">{done}/{total}</span>
          </div>
        </div>

        {/* CTA */}
        <div className="shrink-0">
          <Link
            href={`/path/${path.slug}`}
            className={`brutal-border px-4 py-2.5 font-display text-sm brutal-press block text-center transition-colors ${
              complete
                ? `${cfg.pathCtaDone} ${cfg.pathCtaDoneText}`
                : `${cfg.pathCtaBg} ${cfg.pathCtaText} hover:opacity-90`
            }`}
          >
            {complete ? "DONE ✓" : started ? "CONTINUE →" : "START →"}
          </Link>
        </div>
      </div>

      {/* Mission toggle */}
      <div className="border-t border-ink/10">
        <button
          onClick={() => setShowMissions(v => !v)}
          className="w-full px-4 py-2.5 flex items-center justify-between font-mono text-[9px] uppercase opacity-45 hover:opacity-80 transition-opacity brutal-press"
        >
          <span>{showMissions ? "▲ Hide lessons" : `▼ Show ${total} lessons`}</span>
          {complete && <span className="text-[10px] text-acid">✓ Complete</span>}
        </button>

        {showMissions && (
          <div className="px-4 pb-4 pt-2 flex flex-wrap gap-1.5 border-t border-ink/10">
            {path.missionSlugs.map((s, idx) => {
              const isDone = !!completed[s];
              return (
                <Link
                  key={s}
                  href={`/learn/${s}`}
                  className={`brutal-border px-2.5 py-1.5 font-mono text-[9px] uppercase brutal-press transition-colors ${
                    isDone
                      ? cfg.pillDone
                      : "bg-bone hover:bg-acid text-ink"
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

// ─── Chapter section ──────────────────────────────────────────────────────────
function ChapterSection({
  ch,
  paths,
  completed,
  world,
  cfg,
  chapterIndex,
}: {
  ch: ReturnType<typeof chaptersByWorld>[number];
  paths: ReturnType<typeof pathsByWorld>;
  completed: Record<string, unknown>;
  world: WorldSlug;
  cfg: typeof WORLD_CONFIG[WorldSlug];
  chapterIndex: number;
}) {
  const chPaths = paths.filter(p => p.chapter === ch.slug).sort((a, b) => a.number - b.number);
  const chSlugs = chPaths.flatMap(p => p.missionSlugs);
  const done = chSlugs.filter(s => !!completed[s]).length;
  const total = chSlugs.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const complete = done === total && total > 0;
  const chEmoji = CHAPTER_EMOJIS[ch.slug] ?? "📖";
  const chNum = String(ch.number).padStart(2, "0");

  // Alternate deco cats per chapter
  const decoSrc = chapterIndex % 2 === 0 ? cfg.deco1 : cfg.deco2;

  return (
    <div className="mb-8">
      {/* Chapter header */}
      <div className={`brutal-border overflow-hidden mb-3 ${cfg.chapterBorder}`}>
        <div className={`${cfg.chapterAccentBg} ${cfg.chapterAccentText} px-4 md:px-6 py-4 flex items-center gap-4 relative overflow-hidden`}>

          {/* Decorative deco element */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 opacity-15 pointer-events-none" aria-hidden>
            <Image src={decoSrc} alt="" fill className="object-contain" />
          </div>

          {/* Chapter number + emoji */}
          <div className="shrink-0 flex flex-col items-center w-12 gap-0.5">
            <span className="font-mono text-[9px] opacity-50">CH {chNum}</span>
            <span className="text-3xl leading-none">{complete ? "✓" : chEmoji}</span>
          </div>

          {/* Title block */}
          <div className="flex-1 min-w-0">
            <div className="font-display text-xl md:text-2xl leading-tight">{ch.title}</div>
            <div className="font-mono text-xs opacity-60 mt-0.5 leading-snug">{ch.tagline}</div>
            <div className="font-mono text-[9px] opacity-40 mt-1 uppercase">
              {chPaths.length} PATHS · {total} MISSIONS
            </div>
          </div>

          {/* Right: progress */}
          <div className="shrink-0 text-right">
            <div className="font-display text-3xl tabular-nums leading-none">
              {complete ? "🏆" : `${pct}%`}
            </div>
            <div className="font-mono text-[9px] opacity-50 mt-0.5">{done}/{total}</div>
          </div>
        </div>

        {/* Chapter description */}
        <div className={`px-4 md:px-6 py-3 flex items-start gap-3 ${world === "dj" ? "bg-[#0a1228]" : "bg-bone"}`}>
          <div className="shrink-0 w-8 h-8 opacity-70" aria-hidden style={{ filter: "drop-shadow(2px 2px 0 rgba(0,0,0,0.2))" }}>
            <Image src={cfg.catMain} alt="" width={32} height={32} className="w-full h-full object-contain" />
          </div>
          <p className={`font-mono text-xs leading-relaxed opacity-60 ${world === "dj" ? "text-bone" : "text-ink"}`}>
            {ch.description}
          </p>
        </div>

        {/* Thin progress bar */}
        <div className={`h-1.5 ${cfg.barBg}`}>
          <div
            className={`h-full ${cfg.bar} transition-all duration-700`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Path cards — always visible, no accordion */}
      <div className="pl-3 md:pl-5 space-y-3">
        {chPaths.map(path => (
          <PathCard
            key={path.slug}
            path={path}
            completed={completed}
            world={world}
            cfg={cfg}
          />
        ))}
      </div>

      {/* Chapter trophy if complete */}
      {complete && (
        <div className={`mt-3 brutal-border px-4 py-3 flex items-center gap-3 ${cfg.trophyBg}`}>
          <span className="text-2xl">🏆</span>
          <div>
            <div className="font-display text-base">{ch.trophy.name}</div>
            <div className="font-mono text-[9px] opacity-70">{ch.trophy.description}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function WorldPageClient({ slug }: { slug: string }) {
  const world = slug as WorldSlug;
  const cfg = WORLD_CONFIG[world];
  const { progress } = useProgress();
  const { setLearnMode } = useLearnMode();
  const completed = progress.completedMissions;
  const chapters = chaptersByWorld(world);
  const allPaths = pathsByWorld(world);

  if (!cfg) return <div className="p-8 font-mono">World not found</div>;

  const worldDone = allPaths.flatMap(p => p.missionSlugs).filter(s => !!completed[s]).length;
  const worldTotal = allPaths.flatMap(p => p.missionSlugs).length;
  const worldPct = worldTotal > 0 ? Math.round((worldDone / worldTotal) * 100) : 0;
  const trophy = WORLD_TROPHIES[world];

  return (
    <main className={`min-h-screen ${cfg.worldBg}`}>

      {/* ── Solid color hero ─────────────────────────────────────────────── */}
      <header className={`${cfg.heroBg} ${cfg.heroText} border-b-4 ${world === "dj" ? "border-volt" : "border-ink"} relative overflow-hidden`}>

        {/* Decorative floating elements */}
        <div className="absolute top-4 right-48 w-10 h-10 opacity-15 float pointer-events-none" aria-hidden style={{ animationDelay: "0.5s" }}>
          <Image src={cfg.deco1} alt="" fill className="object-contain" />
        </div>
        <div className="absolute bottom-6 right-8 w-14 h-14 opacity-10 spin-slow pointer-events-none" aria-hidden>
          <Image src={cfg.deco2} alt="" fill className="object-contain" />
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6 md:py-8 relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <Link href="/worlds" className={`font-mono text-[10px] uppercase opacity-50 hover:opacity-100 transition-opacity block mb-3 ${cfg.heroText}`}>
                ← ALL WORLDS
              </Link>
              <h1 className="font-display text-5xl md:text-7xl leading-none mb-2">
                {cfg.emoji} {cfg.title.toUpperCase()}
              </h1>
              <p className={`font-mono text-xs opacity-60 mb-1`}>{cfg.tagline}</p>
              <p className={`font-mono text-[10px] opacity-40`}>{cfg.description}</p>

              {/* World progress bar */}
              <div className="mt-4 flex items-center gap-3 max-w-md">
                <div className={`flex-1 h-2.5 brutal-border overflow-hidden ${cfg.barBg}`}>
                  <div
                    className={`h-full ${cfg.bar} transition-all duration-700`}
                    style={{ width: `${worldPct}%` }}
                  />
                </div>
                <div className={`font-mono text-xs opacity-60 shrink-0 tabular-nums`}>
                  {worldDone}/{worldTotal} · {worldPct}%
                </div>
              </div>
            </div>

            {/* Cat mascot + deco cats */}
            <div className="shrink-0 flex flex-col items-center gap-2">
              <div
                className="w-20 h-20 md:w-28 md:h-28 wiggle"
                style={{ filter: "drop-shadow(4px 4px 0 rgba(0,0,0,0.2))" }}
                aria-hidden
              >
                <Image src={cfg.catMain} alt="" width={112} height={112} className="w-full h-full object-contain" />
              </div>
              <div className="flex gap-2">
                <div className="w-8 h-8 float opacity-70" aria-hidden style={{ animationDelay: "0.3s" }}>
                  <Image src={cfg.catDeco1} alt="" width={32} height={32} className="w-full h-full object-contain" style={{ filter: "drop-shadow(2px 2px 0 rgba(0,0,0,0.15))" }} />
                </div>
                <div className="w-7 h-7 float opacity-60" aria-hidden style={{ animationDelay: "1.1s" }}>
                  <Image src={cfg.catDeco2} alt="" width={28} height={28} className="w-full h-full object-contain" style={{ filter: "drop-shadow(2px 2px 0 rgba(0,0,0,0.15))" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Inline mode indicator — linked to header toggle */}
          <div className="mt-5 flex items-center gap-3">
            <div className={`inline-flex items-center gap-2 brutal-border px-3 py-2 font-mono text-xs ${world === "dj" ? "bg-bone/10 text-bone border-bone/30" : "bg-ink/10 text-ink"}`}>
              <span>🔓</span>
              <span className="font-display text-xs">Free Mode</span>
              <span className="opacity-40">— all lessons open</span>
            </div>
            <Link
              href={`/world/${world}`}
              onClick={() => setLearnMode("flow")}
              className={`brutal-border px-3 py-2 font-display text-xs brutal-press transition-colors ${cfg.flowLinkClass}`}
            >
              Switch to Flow →
            </Link>
          </div>
        </div>
      </header>

      {/* ── Chapter sections — all visible, no accordion ─────────────────── */}
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-24">

        <div className={`font-mono text-[10px] uppercase mb-6 ${world === "dj" ? "text-bone/40" : "text-ink/40"}`}>
          // {chapters.length} CHAPTERS — ALL LESSONS OPEN
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
        <div className={`brutal-border p-5 mt-4 transition-all ${
          worldPct === 100
            ? cfg.trophyBg
            : world === "dj" ? "bg-[#0a1228] text-bone/40" : "bg-bone/50 text-ink/40"
        }`}>
          <div className="font-mono text-[9px] uppercase mb-1">WORLD TROPHY</div>
          <div className="font-display text-2xl flex items-center gap-2">
            <span>🏆</span>
            <span>{trophy.name}</span>
          </div>
          <div className="font-mono text-xs mt-1 opacity-70">{trophy.description}</div>
          {worldPct < 100 && (
            <div className="font-mono text-[9px] uppercase mt-2 opacity-50">
              Complete all {chapters.length} chapters to unlock · {worldPct}% done
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
