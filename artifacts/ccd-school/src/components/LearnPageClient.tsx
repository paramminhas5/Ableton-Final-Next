"use client";
/**
 * LearnPageClient — /learn
 *
 * Default view: Snake (Duolingo-style world path) for the active world.
 * Toggle: "Flow" and "Free" buttons switch between guided path and free browser.
 *
 * World tabs (Fundamentals / DJ / Producer) stay the same across both views.
 */
import Link from "next/link";
import Image from "next/image";
import { chaptersByWorld } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";
import { useProgress } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import SectionReveal from "@/components/SectionReveal";
import { WorldPathClient } from "@/components/WorldPathClient";
import { useState } from "react";

type WorldTab = "fundamentals" | "dj" | "producer";
type ViewMode = "flow" | "free";

const WORLD_META: Record<WorldTab, {
  label: string; emoji: string;
  activeBg: string; activeText: string; bar: string; catSrc: string;
}> = {
  fundamentals: { label: "Fundamentals", emoji: "🎵", activeBg: "bg-acid",          activeText: "text-ink",  bar: "bg-acid",          catSrc: "/cats/cat-handstand.png" },
  dj:           { label: "DJ World",     emoji: "🎧", activeBg: "bg-ink",            activeText: "text-bone", bar: "bg-electric-blue", catSrc: "/cats/cat-dj.png"        },
  producer:     { label: "Producer",     emoji: "🎛", activeBg: "bg-electric-blue",  activeText: "text-bone", bar: "bg-electric-blue", catSrc: "/cats/cat-dj-hero.png"   },
};

const CHAPTER_CATS = [
  "/cats/cat-cap.png",
  "/cats/cat-headphones.png",
  "/cats/cat-raver.png",
  "/cats/cat-handstand.png",
  "/cats/cat-dancer.png",
];

export function LearnPageClient() {
  const { progress } = useProgress();
  const { learnMode, setLearnMode } = useLearnMode();
  const completed = progress.completedMissions;
  const [activeWorld, setActiveWorld] = useState<WorldTab>("fundamentals");
  const [viewMode, setViewMode] = useState<ViewMode>(learnMode === "flow" ? "flow" : "free");

  const chapters = chaptersByWorld(activeWorld);
  const allPaths = pathsByWorld(activeWorld);
  const wm = WORLD_META[activeWorld];

  const pathStats = (slugs: string[]) => {
    const done = slugs.filter(s => !!completed[s]).length;
    const total = slugs.length;
    return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0, complete: done === total && total > 0 };
  };

  const chapterStats = (chSlug: string) => {
    const slugs = allPaths.filter(p => p.chapter === chSlug).flatMap(p => p.missionSlugs);
    const done = slugs.filter(s => !!completed[s]).length;
    const total = slugs.length;
    return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0, complete: done === total && total > 0 };
  };

  const worldStats = () => {
    const slugs = allPaths.flatMap(p => p.missionSlugs);
    const done = slugs.filter(s => !!completed[s]).length;
    return { done, total: slugs.length, pct: slugs.length > 0 ? Math.round((done / slugs.length) * 100) : 0 };
  };

  const ws = worldStats();

  return (
    <main className="min-h-screen bg-bone">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <header className="border-b-4 border-ink bg-electric-blue text-bone relative overflow-hidden">
        <div
          className="absolute right-4 bottom-0 w-20 h-20 md:w-28 md:h-28 pointer-events-none wiggle"
          aria-hidden
          style={{ filter: "drop-shadow(3px 3px 0 hsl(222 47% 4%))" }}
        >
          <Image src={wm.catSrc} alt="" width={112} height={112} className="w-full h-full object-contain" />
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 relative z-10">
          <p className="font-mono text-xs uppercase opacity-60 tracking-widest mb-1">Your learning path</p>
          <h1 className="font-display text-5xl md:text-6xl leading-none" style={{ textShadow: "4px 4px 0 hsl(222 47% 4%)" }}>
            LEARN
          </h1>
          <div className="flex items-center gap-3 mt-3 font-mono text-xs uppercase opacity-70">
            <span>{ws.done}/{ws.total} missions</span>
            <span className="text-acid font-bold">{ws.pct}%</span>
          </div>
        </div>
      </header>

      {/* ── World tabs + view toggle ──────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-bone border-b-4 border-ink">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-stretch">
          {(["fundamentals", "dj", "producer"] as WorldTab[]).map(w => {
            const meta = WORLD_META[w];
            const paths = pathsByWorld(w);
            const done = paths.flatMap(p => p.missionSlugs).filter(s => !!completed[s]).length;
            const total = paths.flatMap(p => p.missionSlugs).length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const isActive = activeWorld === w;
            return (
              <button key={w} onClick={() => setActiveWorld(w)}
                className={`flex-1 px-3 py-3 font-display text-sm border-r-4 border-ink last:border-r-0 transition-colors ${
                  isActive ? `${meta.activeBg} ${meta.activeText}` : "bg-bone hover:bg-acid/20 opacity-70 hover:opacity-100"
                }`}>
                <div>{meta.emoji} {meta.label}</div>
                <div className="font-mono text-[10px] opacity-60 mt-0.5">{done}/{total} · {pct}%</div>
              </button>
            );
          })}

          {/* View toggle — flow vs free */}
          <div className="flex items-center px-3 border-l-4 border-ink gap-1 shrink-0">
            <button
              onClick={() => { setViewMode("flow"); setLearnMode("flow"); }}
              title="Flow mode: Guided snake path"
              className={`px-3 py-1.5 brutal-border font-display text-xs brutal-press transition-colors whitespace-nowrap ${
                viewMode === "flow" ? "bg-ink text-bone" : "bg-bone hover:bg-acid"
              }`}
            >
              🌊 Flow
            </button>
            <button
              onClick={() => { setViewMode("free"); setLearnMode("classic"); }}
              title="Free mode: Browse all lessons"
              className={`px-3 py-1.5 brutal-border font-display text-xs brutal-press transition-colors whitespace-nowrap ${
                viewMode === "free" ? "bg-ink text-bone" : "bg-bone hover:bg-acid"
              }`}
            >
              🔓 Free
            </button>
          </div>
        </div>

        {/* World progress bar */}
        <div className="h-1.5 bg-ink/10">
          <div className={`h-full ${wm.bar} transition-all duration-700`} style={{ width: `${ws.pct}%` }} />
        </div>
      </div>

      {/* ── FLOW VIEW (default) ─────────────────────────────────────────── */}
      {viewMode === "flow" && (
        <WorldPathClient worldSlug={activeWorld} embedded />
      )}

      {/* ── FREE BROWSER VIEW ───────────────────────────────────────────── */}
      {viewMode === "free" && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10 pb-28">
          {chapters.map((chapter, chIdx) => {
            const cStats = chapterStats(chapter.slug);
            const chPaths = allPaths.filter(p => p.chapter === chapter.slug).sort((a, b) => a.number - b.number);
            const catSrc = CHAPTER_CATS[chIdx % CHAPTER_CATS.length];

            return (
              <SectionReveal key={chapter.slug} delay={chIdx * 0.05}>
                <section>
                  {/* Chapter header */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-11 h-11 wiggle" style={{ filter: "drop-shadow(2px 2px 0 hsl(222 47% 4%))" }} aria-hidden>
                        <Image src={catSrc} alt="" width={44} height={44} className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <p className="font-mono text-xs uppercase opacity-40 tracking-widest mb-0.5">
                          Chapter {chapter.number} · {chPaths.length} paths · {cStats.total} missions
                        </p>
                        <h2 className="font-display text-2xl md:text-3xl leading-tight">{chapter.title}</h2>
                        <p className="font-sans text-sm opacity-55 mt-0.5 leading-snug">{chapter.tagline}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono text-xs uppercase opacity-50">{cStats.done}/{cStats.total}</p>
                      {cStats.complete && <p className="font-mono text-xs mt-0.5">🏆 {chapter.trophy.name}</p>}
                    </div>
                  </div>

                  {/* Chapter progress bar */}
                  <div className="h-2.5 brutal-border bg-ink/8 mb-5 overflow-hidden">
                    <div className={`h-full ${wm.bar} transition-all duration-700`} style={{ width: `${cStats.pct}%` }} />
                  </div>

                  {/* Path cards — 2-3 col grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {chPaths.map(path => {
                      const pStats = pathStats(path.missionSlugs);
                      const ctaBg = pStats.complete
                        ? "bg-ink text-bone"
                        : pStats.done > 0
                        ? `${wm.activeBg} ${wm.activeText}`
                        : "bg-bone hover:bg-acid";
                      return (
                        <div key={path.slug} className="brutal-border flex flex-col overflow-hidden chunk-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-transform">
                          <div className="p-5 flex-1 space-y-3">
                            <div>
                              <p className="font-mono text-xs uppercase opacity-40 tracking-wide mb-1">
                                Path {path.number} · {pStats.total} missions
                              </p>
                              <h3 className="font-display text-xl leading-tight">{path.title}</h3>
                              <p className="font-sans text-sm opacity-55 mt-1.5 leading-snug">{path.tagline}</p>
                            </div>
                            <div>
                              <div className="h-2 brutal-border bg-ink/8 overflow-hidden mb-1.5">
                                <div className={`h-full ${wm.bar} transition-all`} style={{ width: `${pStats.pct}%` }} />
                              </div>
                              <p className="font-mono text-xs opacity-40">{pStats.done}/{pStats.total} · {pStats.pct}%</p>
                            </div>
                          </div>
                          <Link href={`/path/${path.slug}`}
                            className={`border-t-4 border-ink px-5 py-3 font-display text-sm text-center transition-colors ${ctaBg}`}>
                            {pStats.complete ? "✓ Complete" : pStats.done > 0 ? "Continue →" : "Start →"}
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </SectionReveal>
            );
          })}
        </div>
      )}
    </main>
  );
}
