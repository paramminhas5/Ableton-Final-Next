"use client";
/**
 * LearnPageClient — /learn — Paths browser.
 *
 * Two view modes toggled inline:
 *   Cards view (default): 2-3 col grid of path cards per chapter
 *   List view:            compact single-column rows — title, tagline, progress, CTA
 *
 * World tabs (Fundamentals / DJ / Producer) stay the same.
 * Cat decoration in header changes per world.
 */
import Link from "next/link";
import Image from "next/image";
import { chaptersByWorld } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";
import { useProgress } from "@/lib/progress";
import { ModeSwitcherBanner } from "@/components/ModeSwitcherBanner";
import SectionReveal from "@/components/SectionReveal";
import { useState } from "react";

type WorldTab = "fundamentals" | "dj" | "producer";
type ViewMode = "cards" | "list";

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
  const completed = progress.completedMissions;
  const [activeWorld, setActiveWorld] = useState<WorldTab>("fundamentals");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");

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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 relative z-10">
          <p className="font-mono text-xs uppercase opacity-60 tracking-widest mb-1">All chapters · all worlds</p>
          <h1 className="font-display text-5xl md:text-6xl leading-none" style={{ textShadow: "4px 4px 0 hsl(222 47% 4%)" }}>
            PATHS
          </h1>
          <div className="flex items-center gap-3 mt-3 font-mono text-xs uppercase opacity-70">
            <span>{ws.done}/{ws.total} missions</span>
            <span className="text-acid font-bold">{ws.pct}%</span>
          </div>
        </div>
      </header>

      {/* ── Mode switcher ────────────────────────────────────────────────── */}
      <div className="border-b-4 border-ink">
        <ModeSwitcherBanner variant="bar" />
      </div>

      {/* ── World tabs ───────────────────────────────────────────────────── */}
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

          {/* View mode toggle — right-aligned */}
          <div className="flex items-center px-3 border-l-4 border-ink gap-1">
            <button
              onClick={() => setViewMode("cards")}
              title="Cards view"
              className={`w-8 h-8 brutal-border flex items-center justify-center brutal-press transition-colors ${
                viewMode === "cards" ? "bg-ink text-bone" : "bg-bone hover:bg-acid"
              }`}
            >
              {/* Grid icon */}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
                <rect x="0" y="0" width="6" height="6" rx="1"/>
                <rect x="8" y="0" width="6" height="6" rx="1"/>
                <rect x="0" y="8" width="6" height="6" rx="1"/>
                <rect x="8" y="8" width="6" height="6" rx="1"/>
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              title="List view"
              className={`w-8 h-8 brutal-border flex items-center justify-center brutal-press transition-colors ${
                viewMode === "list" ? "bg-ink text-bone" : "bg-bone hover:bg-acid"
              }`}
            >
              {/* List icon */}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                <line x1="4" y1="3" x2="14" y2="3"/>
                <line x1="4" y1="7" x2="14" y2="7"/>
                <line x1="4" y1="11" x2="14" y2="11"/>
                <circle cx="1.5" cy="3" r="1" fill="currentColor" stroke="none"/>
                <circle cx="1.5" cy="7" r="1" fill="currentColor" stroke="none"/>
                <circle cx="1.5" cy="11" r="1" fill="currentColor" stroke="none"/>
              </svg>
            </button>
          </div>
        </div>

        {/* World progress bar */}
        <div className="h-1.5 bg-ink/10">
          <div className={`h-full ${wm.bar} transition-all duration-700`} style={{ width: `${ws.pct}%` }} />
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10 pb-28">

        {/* Link to world page */}
        <Link href={`/world/${activeWorld}`}
          className="brutal-border inline-flex items-center gap-2 px-4 py-2.5 font-display text-sm border-4 border-ink hover:bg-acid transition-colors chunk-shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
          View {WORLD_META[activeWorld].label} world path →
        </Link>

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

                {/* ── CARDS VIEW ─────────────────────────────────────────── */}
                {viewMode === "cards" && (
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
                )}

                {/* ── LIST VIEW ──────────────────────────────────────────── */}
                {viewMode === "list" && (
                  <div className="brutal-border divide-y divide-ink/10 chunk-shadow">
                    {chPaths.map(path => {
                      const pStats = pathStats(path.missionSlugs);
                      return (
                        <div key={path.slug} className="flex items-center gap-4 px-4 py-3 hover:bg-acid/10 transition-colors">
                          {/* Status indicator */}
                          <div className={`shrink-0 w-8 h-8 brutal-border flex items-center justify-center font-display text-sm ${
                            pStats.complete ? "bg-ink text-bone" : pStats.done > 0 ? `${wm.activeBg} ${wm.activeText}` : "bg-bone"
                          }`}>
                            {pStats.complete ? "✓" : pStats.done > 0 ? `${pStats.pct}%` : path.number}
                          </div>
                          {/* Text */}
                          <div className="flex-1 min-w-0">
                            <div className="font-display text-base leading-tight">{path.title}</div>
                            <div className="font-mono text-[10px] opacity-50 mt-0.5 truncate">{path.tagline}</div>
                          </div>
                          {/* Progress bar (thin) */}
                          <div className="shrink-0 w-20 hidden sm:block">
                            <div className="h-1.5 brutal-border bg-ink/10 overflow-hidden">
                              <div className={`h-full ${wm.bar}`} style={{ width: `${pStats.pct}%` }} />
                            </div>
                            <div className="font-mono text-[9px] opacity-40 mt-0.5 text-right">{pStats.done}/{pStats.total}</div>
                          </div>
                          {/* CTA */}
                          <Link href={`/path/${path.slug}`}
                            className={`shrink-0 brutal-border px-3 py-1.5 font-display text-xs brutal-press transition-colors ${
                              pStats.complete ? "bg-ink text-bone" : `${wm.activeBg} ${wm.activeText} hover:opacity-80`
                            }`}>
                            {pStats.complete ? "Done ✓" : pStats.done > 0 ? "Go →" : "Start →"}
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </SectionReveal>
          );
        })}
      </div>
    </main>
  );
}
