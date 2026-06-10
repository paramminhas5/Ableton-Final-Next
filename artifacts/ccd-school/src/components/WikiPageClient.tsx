"use client";
/**
 * WikiPageClient — /wiki standalone page.
 *
 * Shows ALL THREE WORLDS as a single continuous reference document.
 * World tabs at the top let you jump to / highlight a world section.
 * Each world's chapters are fully expanded (accordion), with path cards
 * and mission links exactly as in WorldWiki.
 *
 * On load: auto-scrolls to hash anchor (#fundamentals, #dj, #producer).
 */
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { WORLD_ORDER, WORLD_THEMES, type WorldSlug } from "@/components/world/worldTheme";
import { WorldWiki } from "@/components/world/WorldWiki";
import { chaptersByWorld } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";
import { useProgress } from "@/lib/progress";

// ─── Per-world progress summary for the tab bar ───────────────────────────────
function useAllWorldStats() {
  const { progress } = useProgress();
  const completed = progress.completedMissions;
  return WORLD_ORDER.map((world) => {
    const paths = pathsByWorld(world);
    const slugs = paths.flatMap((p) => p.missionSlugs);
    const done = slugs.filter((s) => !!completed[s]).length;
    const total = slugs.length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const chapters = chaptersByWorld(world).length;
    return { world, done, total, pct, paths: paths.length, chapters };
  });
}

// ─── Sticky world nav tabs ────────────────────────────────────────────────────
function WorldTabs({
  activeWorld,
  stats,
  onSelect,
}: {
  activeWorld: WorldSlug | null;
  stats: ReturnType<typeof useAllWorldStats>;
  onSelect: (w: WorldSlug) => void;
}) {
  return (
    <div className="sticky top-[56px] z-20 bg-bone border-b-4 border-ink">
      <div className="max-w-4xl mx-auto flex">
        {stats.map(({ world, pct }) => {
          const t = WORLD_THEMES[world];
          const active = activeWorld === world;
          return (
            <button
              key={world}
              onClick={() => onSelect(world)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 brutal-press transition-colors border-r-4 last:border-r-0 border-ink ${
                active ? `${t.accentBg} ${t.accentText}` : "bg-bone text-ink/55 hover:bg-ink/5"
              }`}
            >
              <span className="text-xl md:text-2xl leading-none">{t.emoji}</span>
              <span className="font-display text-xs md:text-sm leading-none">{t.title}</span>
              <span className={`font-mono text-[8px] uppercase tabular-nums ${active ? "opacity-65" : "opacity-40"}`}>
                {pct}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── World section header ─────────────────────────────────────────────────────
function WorldSectionHeader({ world, stats }: {
  world: WorldSlug;
  stats: { done: number; total: number; pct: number; chapters: number; paths: number };
}) {
  const t = WORLD_THEMES[world];
  return (
    <div className={`${t.heroBg} ${t.heroText} ${t.heroBorder} relative overflow-hidden`}>
      <div
        className="absolute -bottom-6 -right-6 w-40 h-40 opacity-[0.07] pointer-events-none"
        aria-hidden
      >
        <Image src={t.deco1} alt="" fill className="object-contain" />
      </div>
      <div
        className="absolute top-4 right-32 w-10 h-10 opacity-[0.10] spin-slow pointer-events-none"
        aria-hidden
      >
        <Image src={t.deco2} alt="" fill className="object-contain" />
      </div>

      <div className="px-5 py-6 md:px-8 relative z-10 flex items-start justify-between gap-4">
        <div>
          <div className={`font-mono text-[8px] uppercase mb-2 opacity-50`}>
            {stats.chapters} chapters · {stats.paths} paths · {stats.total} missions
          </div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-5xl leading-none">{t.emoji}</span>
            <h2 className="font-display text-4xl md:text-5xl leading-none">{t.title.toUpperCase()}</h2>
          </div>
          <p className={`font-mono text-xs opacity-60 max-w-md leading-relaxed`}>{t.description}</p>

          <div className="flex flex-wrap gap-2 mt-3">
            <Link
              href={`/world/${world}`}
              className={`brutal-border px-3 py-2 font-display text-xs brutal-press transition-colors ${t.flowBtn}`}
            >
              🌊 Flow Mode →
            </Link>
            <Link
              href={`/world/${world}?view=free`}
              className={`brutal-border px-3 py-2 font-display text-xs brutal-press transition-colors ${t.freeBtn}`}
            >
              📖 Free Mode →
            </Link>
          </div>
        </div>

        <div className="shrink-0 flex flex-col items-end gap-2">
          <div className="font-display text-5xl tabular-nums leading-none">{stats.pct}%</div>
          <div className={`font-mono text-[8px] uppercase opacity-50`}>{stats.done}/{stats.total}</div>
          <div
            className="w-16 h-16 md:w-20 md:h-20 wiggle"
            style={{ filter: "drop-shadow(3px 3px 0 rgba(0,0,0,0.22))" }}
            aria-hidden
          >
            <Image src={t.catMain} alt="" width={80} height={80} className="w-full h-full object-contain" />
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className={`h-2 ${t.barBg}`}>
        <div className={`h-full ${t.barFill} transition-all duration-1000`} style={{ width: `${stats.pct}%` }} />
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function WikiPageClient() {
  const allStats = useAllWorldStats();
  const [activeWorld, setActiveWorld] = useState<WorldSlug | null>(null);

  // Scroll to anchor on mount (e.g. /wiki#dj)
  useEffect(() => {
    const hash = window.location.hash.replace("#", "") as WorldSlug;
    if (hash && WORLD_ORDER.includes(hash)) {
      setActiveWorld(hash);
      setTimeout(() => {
        document.getElementById(`wiki-world-${hash}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    } else {
      setActiveWorld("fundamentals");
    }
  }, []);

  const scrollTo = (world: WorldSlug) => {
    setActiveWorld(world);
    window.history.replaceState(null, "", `#${world}`);
    document.getElementById(`wiki-world-${world}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Intersection observer: update activeWorld tab as user scrolls
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    WORLD_ORDER.forEach((world) => {
      const el = document.getElementById(`wiki-world-${world}`);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveWorld(world); },
        { rootMargin: "-10% 0px -70% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <main className="min-h-screen bg-bone">

      {/* Page header */}
      <header className="border-b-4 border-ink bg-bone relative overflow-hidden">
        <div
          className="absolute top-3 right-8 w-12 h-12 opacity-[0.12] wiggle pointer-events-none"
          aria-hidden
        >
          <Image src="/cats/cat-dancer.png" alt="" fill className="object-contain" />
        </div>
        <div className="max-w-4xl mx-auto px-4 py-7 md:py-10 relative z-10">
          <div className="font-mono text-[10px] uppercase opacity-40 mb-2">
            // 3 WORLDS · 153 MISSIONS · 16 CHAPTERS
          </div>
          <h1 className="font-display text-6xl md:text-8xl leading-none mb-3">WIKI</h1>
          <p className="font-mono text-sm opacity-55 max-w-lg leading-relaxed mb-4">
            Every world. Every chapter. Every path. Every lesson — all in one place.
            Your complete reference for the CCD.SCHOOL curriculum.
          </p>

          {/* Overall stats pills */}
          <div className="flex flex-wrap gap-2">
            {allStats.map(({ world, pct, total }) => {
              const t = WORLD_THEMES[world];
              return (
                <button
                  key={world}
                  onClick={() => scrollTo(world)}
                  className={`brutal-border px-3 py-2 flex items-center gap-2 brutal-press transition-colors ${t.accentBg} ${t.accentText}`}
                >
                  <span className="text-lg">{t.emoji}</span>
                  <span className="font-display text-sm">{t.title}</span>
                  <span className="font-mono text-[9px] opacity-60">{pct}% · {total}m</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Sticky world tabs */}
      <WorldTabs activeWorld={activeWorld} stats={allStats} onSelect={scrollTo} />

      {/* All three worlds */}
      <div className="max-w-4xl mx-auto pb-24">
        {WORLD_ORDER.map((world) => {
          const stat = allStats.find((s) => s.world === world)!;
          return (
            <div key={world} id={`wiki-world-${world}`} className="mt-8 first:mt-6">
              {/* World section header */}
              <WorldSectionHeader world={world} stats={stat} />

              {/* World wiki content */}
              <div className="px-4 pt-4">
                <WorldWiki worldSlug={world} />
              </div>

              {/* Divider between worlds */}
              <div className="mt-8 border-t-8 border-ink" />
            </div>
          );
        })}
      </div>
    </main>
  );
}
