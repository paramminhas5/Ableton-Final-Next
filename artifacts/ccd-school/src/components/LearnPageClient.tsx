"use client";
import Link from "next/link";
import { chaptersByWorld } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";
import { useProgress } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import { ModeSwitcherBanner } from "@/components/ModeSwitcherBanner";
import { useState } from "react";

type WorldTab = "fundamentals" | "dj" | "producer";

const WORLD_LABELS: Record<
  WorldTab,
  { label: string; emoji: string; activeText: string; activeBg: string; accentBar: string }
> = {
  fundamentals: {
    label: "Fundamentals",
    emoji: "🎵",
    activeText: "text-ink",
    activeBg: "bg-acid",
    accentBar: "bg-acid",
  },
  dj: {
    label: "DJ World",
    emoji: "🎧",
    activeText: "text-bone",
    activeBg: "bg-ink",
    accentBar: "bg-volt",
  },
  producer: {
    label: "Producer",
    emoji: "🎛",
    activeText: "text-ink",
    activeBg: "bg-sun",
    accentBar: "bg-sun",
  },
};

export function LearnPageClient() {
  const { progress } = useProgress();
  const { learnMode } = useLearnMode();
  const completed = progress.completedMissions;
  const [activeWorld, setActiveWorld] = useState<WorldTab>("fundamentals");

  const chapters = chaptersByWorld(activeWorld);
  const allPaths = pathsByWorld(activeWorld);
  const wm = WORLD_LABELS[activeWorld];

  const pathStats = (missionSlugs: string[]) => {
    const done = missionSlugs.filter((s) => !!completed[s]).length;
    const total = missionSlugs.length;
    return {
      done,
      total,
      pct: total > 0 ? Math.round((done / total) * 100) : 0,
      complete: done === total && total > 0,
    };
  };

  const chapterStats = (chSlug: string) => {
    const paths = allPaths.filter((p) => p.chapter === chSlug);
    const slugs = paths.flatMap((p) => p.missionSlugs);
    const done = slugs.filter((s) => !!completed[s]).length;
    const total = slugs.length;
    return {
      done,
      total,
      pct: total > 0 ? Math.round((done / total) * 100) : 0,
      complete: done === total && total > 0,
    };
  };

  const worldStats = () => {
    const slugs = allPaths.flatMap((p) => p.missionSlugs);
    const done = slugs.filter((s) => !!completed[s]).length;
    return {
      done,
      total: slugs.length,
      pct: slugs.length > 0 ? Math.round((done / slugs.length) * 100) : 0,
    };
  };

  const ws = worldStats();

  return (
    <main className="min-h-screen bg-bone">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <header className="border-b-2 border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <p className="font-mono text-xs uppercase opacity-40 tracking-widest mb-1">
            Paths — all chapters · all worlds
          </p>
          <h1 className="font-display text-5xl md:text-6xl leading-none">Paths</h1>
        </div>
      </header>

      {/* ── Mode switcher ───────────────────────────────────────────────── */}
      <ModeSwitcherBanner variant="bar" />

      {/* ── World tabs ──────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-bone border-b-2 border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex gap-0">
          {(["fundamentals", "dj", "producer"] as WorldTab[]).map((w) => {
            const meta = WORLD_LABELS[w];
            const paths = pathsByWorld(w);
            const done = paths
              .flatMap((p) => p.missionSlugs)
              .filter((s) => !!completed[s]).length;
            const total = paths.flatMap((p) => p.missionSlugs).length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const isActive = activeWorld === w;
            return (
              <button
                key={w}
                onClick={() => setActiveWorld(w)}
                className={`flex-1 px-3 py-3.5 font-sans text-sm font-medium brutal-press transition-all border-b-0 border-t-0 border-x-0
                  ${isActive
                    ? `${meta.activeBg} ${meta.activeText}`
                    : "bg-bone hover:bg-sun/30 opacity-70 hover:opacity-100"
                  }`}
              >
                <div className="font-semibold">
                  {meta.emoji} {meta.label}
                </div>
                <div className="font-mono text-xs opacity-60 mt-0.5">
                  {done}/{total} · {pct}%
                </div>
              </button>
            );
          })}
        </div>
        {/* World progress bar */}
        <div className="h-1.5 bg-ink/8">
          <div
            className={`h-full ${wm.accentBar} transition-all duration-700`}
            style={{ width: `${ws.pct}%` }}
          />
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10 pb-28">

        {/* World overview link */}
        <Link
          href={`/world/${activeWorld}`}
          className="brutal-border inline-flex items-center gap-2 px-4 py-2.5 font-sans text-sm font-medium brutal-press rounded-md hover:bg-sun transition-colors"
        >
          View {activeWorld} world overview →
        </Link>

        {chapters.map((chapter) => {
          const cStats = chapterStats(chapter.slug);
          const chPaths = allPaths
            .filter((p) => p.chapter === chapter.slug)
            .sort((a, b) => a.number - b.number);

          return (
            <section key={chapter.slug} className="animate-fade-up">
              {/* ── Chapter header ──────────────────────────────────────── */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="font-mono text-xs uppercase opacity-40 tracking-widest mb-1">
                    Chapter {chapter.number} · {chPaths.length} paths · {cStats.total} missions
                  </p>
                  <h2 className="font-display text-3xl md:text-4xl leading-tight">
                    {chapter.title}
                  </h2>
                  <p className="font-sans text-sm opacity-60 mt-1 leading-snug">
                    {chapter.tagline}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono text-xs uppercase opacity-50">
                    {cStats.done}/{cStats.total}
                  </p>
                  {cStats.complete && (
                    <p className="font-mono text-xs mt-0.5">
                      🏆 {chapter.trophy.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Chapter progress bar */}
              <div className="h-2 brutal-border rounded-full mb-5 bg-ink/6 overflow-hidden">
                <div
                  className={`h-full ${wm.accentBar} rounded-full transition-all duration-700`}
                  style={{ width: `${cStats.pct}%` }}
                />
              </div>

              {/* ── Path cards grid ─────────────────────────────────────── */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {chPaths.map((path) => {
                  const pStats = pathStats(path.missionSlugs);
                  const ctaStyle = pStats.complete
                    ? "bg-ink text-bone"
                    : pStats.done > 0
                    ? `${wm.activeBg} ${wm.activeText}`
                    : "bg-bone hover:bg-sun";

                  return (
                    <div
                      key={path.slug}
                      className="brutal-border rounded-lg flex flex-col overflow-hidden brutal-shadow-sm hover:brutal-shadow transition-all duration-200"
                    >
                      {/* Card body */}
                      <div className="p-5 flex-1 space-y-3">
                        <div>
                          <p className="font-mono text-xs uppercase opacity-40 tracking-wide mb-1">
                            Path {path.number} · {pStats.total} missions
                          </p>
                          <h3 className="font-display text-xl leading-tight">
                            {path.title}
                          </h3>
                          <p className="font-sans text-sm opacity-60 mt-1.5 leading-snug">
                            {path.tagline}
                          </p>
                        </div>

                        {/* Progress */}
                        <div>
                          <div className="h-2 bg-ink/8 rounded-full overflow-hidden mb-1.5">
                            <div
                              className={`h-full ${wm.accentBar} rounded-full transition-all`}
                              style={{ width: `${pStats.pct}%` }}
                            />
                          </div>
                          <p className="font-mono text-xs opacity-45">
                            {pStats.done}/{pStats.total} · {pStats.pct}%
                          </p>
                        </div>
                      </div>

                      {/* CTA button */}
                      <Link
                        href={`/path/${path.slug}`}
                        className={`border-t-2 border-border px-5 py-3 font-sans text-sm font-semibold brutal-press text-center transition-colors ${ctaStyle}`}
                      >
                        {pStats.complete
                          ? "✓ Complete"
                          : pStats.done > 0
                          ? "Continue →"
                          : "Start →"}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
