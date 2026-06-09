"use client";
/**
 * WorldsPageClient — /worlds index.
 *
 * World cards:
 * - Full-bleed FAL AI image as atmospheric background
 * - Dark gradient overlay ensures text is always readable
 * - DJ world: deep electric blue (#0a0f2e) instead of pure black
 * - Large cat mascot bottom-right
 * - Chapter step badges
 * - Clean CTA footer
 */
import Link from "next/link";
import Image from "next/image";
import { chaptersByWorld } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";
import { useProgress } from "@/lib/progress";
import { ModeSwitcherBanner } from "@/components/ModeSwitcherBanner";

// FAL AI atmospheric images — used as full-bleed backgrounds
const WORLD_IMAGES: Record<string, string> = {
  fundamentals: "https://v3b.fal.media/files/b/0a9d8573/T1yPDNCVhxrVLWBs3vPLK.jpg",
  dj:           "https://v3b.fal.media/files/b/0a9d8573/vkzVEVke8UdYZtUAJEt5P.jpg",
  producer:     "https://v3b.fal.media/files/b/0a9d8573/FWDTuawui9X18aCB004I0.jpg",
};

// Dark overlay tint per world — sits on top of image
const WORLD_OVERLAY: Record<string, string> = {
  fundamentals: "from-acid/80 via-acid/60 to-acid/40",
  dj:           "from-[#0a0f2e]/90 via-[#0a0f2e]/75 to-[#0a0f2e]/50",
  producer:     "from-sun/80 via-sun/60 to-sun/40",
};

type WorldId = "fundamentals" | "dj" | "producer";

const WORLD_META: Record<WorldId, {
  title: string; emoji: string; tagline: string; description: string;
  textColor: string; bar: string; ctaBg: string; ctaText: string;
  accentBorder: string; catSrc: string; to: string;
  chapterBadgeDone: string; chapterBadgePartial: string; chapterBadgeEmpty: string;
}> = {
  fundamentals: {
    title: "Fundamentals", emoji: "🎵",
    tagline: "The vocabulary of music",
    description: "Sound, rhythm, melody, harmony and music technology — built from learningmusic.ableton.com.",
    textColor: "text-ink",
    bar: "bg-ink", ctaBg: "bg-ink", ctaText: "text-bone",
    accentBorder: "border-l-4 border-l-ink",
    catSrc: "/cats/cat-handstand.png", to: "/world/fundamentals",
    chapterBadgeDone: "bg-ink text-bone",
    chapterBadgePartial: "bg-ink/50 text-ink",
    chapterBadgeEmpty: "bg-ink/15 text-ink/50",
  },
  dj: {
    title: "DJ World", emoji: "🎧",
    tagline: "The art of playing for people",
    description: "rekordbox, beatmatching, cue points, the mix, crowd reading and career — from the Pioneer DJ manual.",
    textColor: "text-bone",
    bar: "bg-volt", ctaBg: "bg-volt", ctaText: "text-ink",
    accentBorder: "border-l-4 border-l-volt",
    catSrc: "/cats/cat-dj.png", to: "/world/dj",
    chapterBadgeDone: "bg-volt text-ink",
    chapterBadgePartial: "bg-volt/50 text-bone",
    chapterBadgeEmpty: "bg-bone/15 text-bone/50",
  },
  producer: {
    title: "Producer", emoji: "🎛",
    tagline: "Build music in Ableton Live 12",
    description: "From opening Live for the first time to mastering deep instruments, Live 12 power features and professional output.",
    textColor: "text-ink",
    bar: "bg-ink", ctaBg: "bg-ink", ctaText: "text-bone",
    accentBorder: "border-l-4 border-l-ink",
    catSrc: "/cats/cat-dj-hero.png", to: "/world/producer",
    chapterBadgeDone: "bg-ink text-bone",
    chapterBadgePartial: "bg-ink/50 text-ink",
    chapterBadgeEmpty: "bg-ink/15 text-ink/50",
  },
};

export function WorldsPageClient() {
  const { progress } = useProgress();
  const completed = progress.completedMissions;

  const worldStats = (world: WorldId) => {
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
        slug: ch.slug, title: ch.title, number: ch.number,
        pct: chPct, complete: chDone === chSlugs.length && chSlugs.length > 0,
      };
    });
    return { done, total, pct, chapters: chapters.length, paths: paths.length, chapterStats };
  };

  return (
    <main className="min-h-screen bg-bone">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <header className="border-b-4 border-ink bg-bone">
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-10">
          <div className="font-mono text-[10px] uppercase opacity-40 mb-2">// THREE WORLDS · 153 MISSIONS</div>
          <h1 className="font-display text-5xl md:text-7xl leading-none">WORLDS</h1>
          <p className="font-mono text-sm mt-3 opacity-60 max-w-xl leading-relaxed">
            Start with Fundamentals — it unlocks everything. Then specialise as a DJ, a Producer, or both.
          </p>
        </div>
      </header>

      {/* ── Mode switcher ───────────────────────────────────────────────── */}
      <ModeSwitcherBanner variant="bar" />

      {/* ── World cards ─────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-5 pb-24">
        {(["fundamentals", "dj", "producer"] as WorldId[]).map(world => {
          const meta = WORLD_META[world];
          const stats = worldStats(world);
          const overlay = WORLD_OVERLAY[world];

          return (
            <Link
              key={world}
              href={meta.to}
              className={`block brutal-border brutal-press overflow-hidden chunk-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-transform ${meta.accentBorder}`}
            >
              {/* Full-bleed image card body */}
              <div className={`${meta.textColor} relative overflow-hidden min-h-[220px] md:min-h-[240px]`}>

                {/* Background image — full bleed */}
                <Image
                  src={WORLD_IMAGES[world]}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 80vw"
                  priority
                />

                {/* Dark gradient overlay — left-heavy so text is always readable */}
                <div className={`absolute inset-0 bg-gradient-to-r ${overlay}`} />
                {/* Additional bottom fade for extra contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                {/* Content layer */}
                <div className="relative z-10 p-6 md:p-8 flex items-start justify-between gap-4">

                  {/* Left: text */}
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-[9px] uppercase opacity-70 mb-3">
                      {stats.chapters} CHAPTERS · {stats.paths} PATHS · {stats.total} MISSIONS
                    </div>

                    {/* World title */}
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-5xl md:text-6xl leading-none">{meta.emoji}</span>
                      <h2
                        className="font-display text-4xl md:text-6xl leading-none"
                        style={{ textShadow: "2px 2px 0 rgba(0,0,0,0.3)" }}
                      >
                        {meta.title.toUpperCase()}
                      </h2>
                    </div>

                    <p className="font-display text-lg md:text-xl opacity-90 mb-2">{meta.tagline}</p>
                    <p className="font-mono text-xs opacity-75 leading-relaxed max-w-md mb-5">{meta.description}</p>

                    {/* Chapter steps */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {stats.chapterStats.map((ch, i) => (
                        <div key={ch.slug} className="flex items-center gap-1">
                          <div className={`brutal-border px-2 py-1 flex items-center gap-1 font-mono text-[9px] uppercase transition-all backdrop-blur-sm ${
                            ch.complete
                              ? meta.chapterBadgeDone
                              : ch.pct > 0
                              ? meta.chapterBadgePartial
                              : meta.chapterBadgeEmpty
                          }`}>
                            <span className="font-bold">{ch.complete ? "✓" : ch.number}</span>
                            <span className="opacity-80 ml-0.5">
                              {ch.title.split(" ")[0]}
                            </span>
                            {ch.pct > 0 && !ch.complete && (
                              <span className="opacity-70 ml-0.5">{ch.pct}%</span>
                            )}
                          </div>
                          {i < stats.chapterStats.length - 1 && (
                            <div className="w-2 h-px opacity-40 bg-current" />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Progress bar */}
                    <div className={`mt-4 h-2 brutal-border overflow-hidden backdrop-blur-sm ${world === "dj" ? "bg-bone/10" : "bg-black/20"}`}>
                      <div
                        className={`h-full ${meta.bar} transition-all duration-700`}
                        style={{ width: `${stats.pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Right: % + cat */}
                  <div className="shrink-0 flex flex-col items-end gap-3">
                    <div className="text-right">
                      <div
                        className="font-display text-5xl md:text-6xl tabular-nums leading-none"
                        style={{ textShadow: "2px 2px 0 rgba(0,0,0,0.3)" }}
                      >
                        {stats.pct}%
                      </div>
                      <div className="font-mono text-[9px] uppercase opacity-70 mt-1">{stats.done}/{stats.total}</div>
                    </div>
                    {/* Cat mascot */}
                    <div
                      className="w-20 h-20 md:w-28 md:h-28 wiggle"
                      style={{ filter: "drop-shadow(3px 3px 0 rgba(0,0,0,0.5))" }}
                      aria-hidden
                    >
                      <Image src={meta.catSrc} alt="" width={112} height={112} className="w-full h-full object-contain" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer CTA strip */}
              <div className={`${meta.ctaBg} ${meta.ctaText} px-6 py-3.5 flex items-center justify-between`}>
                <span className="font-mono text-xs uppercase opacity-80">
                  {stats.done === 0 ? "Not started" : stats.pct === 100 ? "World complete 🏆" : `${stats.done} missions done`}
                </span>
                <span className="font-display text-sm font-bold">
                  {stats.done === 0 ? "START →" : stats.pct === 100 ? "REVIEW →" : "CONTINUE →"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
