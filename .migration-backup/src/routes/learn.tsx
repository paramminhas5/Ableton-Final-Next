import { createFileRoute, Link } from "@tanstack/react-router";
import { CHAPTERS, chaptersByWorld } from "@/content/chapters";
import { PATHS, pathsByWorld } from "@/content/paths";
import { useProgress } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import { useState } from "react";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Paths — CCD.SCHOOL" },
      { name: "description", content: "All learning paths — Fundamentals, DJ World and Producer. Every chapter, every path, every mission." },
    ],
  }),
  component: PathsHub,
});

type WorldTab = "fundamentals" | "dj" | "producer";

const WORLD_LABELS: Record<WorldTab, { label: string; emoji: string; active: string }> = {
  fundamentals: { label: "Fundamentals", emoji: "🎵", active: "bg-acid text-ink" },
  dj: { label: "DJ World", emoji: "🎧", active: "bg-ink text-bone" },
  producer: { label: "Producer", emoji: "🎛", active: "bg-sun text-ink" },
};

function PathsHub() {
  const { progress } = useProgress();
  const { learnMode, setLearnMode } = useLearnMode();
  const completed = progress.completedMissions;
  const [activeWorld, setActiveWorld] = useState<WorldTab>("fundamentals");

  const chapters = chaptersByWorld(activeWorld);
  const allPaths = pathsByWorld(activeWorld);

  const pathStats = (missionSlugs: string[]) => {
    const done = missionSlugs.filter((s) => !!completed[s]).length;
    const total = missionSlugs.length;
    return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0, complete: done === total && total > 0 };
  };

  const chapterStats = (chapterSlug: string) => {
    const paths = allPaths.filter((p) => p.chapter === chapterSlug);
    const slugs = paths.flatMap((p) => p.missionSlugs);
    const done = slugs.filter((s) => !!completed[s]).length;
    const total = slugs.length;
    return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0, complete: done === total && total > 0 };
  };

  const worldStats = () => {
    const slugs = allPaths.flatMap((p) => p.missionSlugs);
    const done = slugs.filter((s) => !!completed[s]).length;
    return { done, total: slugs.length, pct: Math.round((done / slugs.length) * 100) };
  };

  const ws = worldStats();

  return (
    <main className="min-h-screen bg-bone">
      {/* Header */}
      <header className="brutal-border border-x-0 border-t-0">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="font-mono text-[10px] uppercase opacity-40 mb-1">// PATHS — ALL CHAPTERS · ALL PATHS</div>
          <h1 className="font-display text-5xl leading-none">PATHS</h1>

          {/* CCD / Classic toggle */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setLearnMode("classic")}
              className={`brutal-border px-4 py-2 font-mono text-xs uppercase brutal-press ${learnMode === "classic" ? "bg-ink text-bone" : "bg-bone hover:bg-sun"}`}
            >
              {learnMode === "classic" ? "● " : ""}CLASSIC — All open
            </button>
            <button
              onClick={() => setLearnMode("ccd")}
              className={`brutal-border px-4 py-2 font-mono text-xs uppercase brutal-press ${learnMode === "ccd" ? "bg-ink text-bone" : "bg-bone hover:bg-sun"}`}
            >
              {learnMode === "ccd" ? "● " : ""}CCD MODE — Sequential ❤️ {learnMode === "ccd" ? `${progress.hearts}` : ""}
            </button>
          </div>
        </div>
      </header>

      {/* World tabs */}
      <div className="sticky top-0 z-10 bg-bone brutal-border border-x-0 border-t-0">
        <div className="max-w-5xl mx-auto px-4 flex gap-0">
          {(["fundamentals", "dj", "producer"] as WorldTab[]).map((w) => {
            const wm = WORLD_LABELS[w];
            const isActive = activeWorld === w;
            const paths = pathsByWorld(w);
            const done = paths.flatMap((p) => p.missionSlugs).filter((s) => !!completed[s]).length;
            const total = paths.flatMap((p) => p.missionSlugs).length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <button
                key={w}
                onClick={() => setActiveWorld(w)}
                className={`flex-1 brutal-border border-b-0 px-3 py-3 font-mono text-[10px] uppercase brutal-press transition-all ${isActive ? wm.active : "bg-bone hover:bg-sun/30"}`}
              >
                <div>{wm.emoji} {wm.label}</div>
                <div className="opacity-60 mt-0.5">{done}/{total} · {pct}%</div>
              </button>
            );
          })}
        </div>

        {/* World progress bar */}
        <div className="h-1 bg-ink/5">
          <div
            className={`h-full transition-all duration-700 ${activeWorld === "dj" ? "bg-volt" : "bg-acid"}`}
            style={{ width: `${ws.pct}%` }}
          />
        </div>
      </div>

      {/* Chapters + Paths */}
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-8 pb-24">
        {/* Link to world overview */}
        <Link
          to="/world/$slug"
          params={{ slug: activeWorld }}
          className="brutal-border px-4 py-2 font-mono text-xs uppercase brutal-press inline-flex items-center gap-2 hover:bg-sun"
        >
          VIEW {activeWorld.toUpperCase()} WORLD OVERVIEW →
        </Link>

        {chapters.map((chapter) => {
          const cStats = chapterStats(chapter.slug);
          const chPaths = allPaths
            .filter((p) => p.chapter === chapter.slug)
            .sort((a, b) => a.number - b.number);

          return (
            <section key={chapter.slug}>
              {/* Chapter header */}
              <div className="flex items-end justify-between mb-3">
                <div>
                  <div className="font-mono text-[9px] uppercase opacity-40">
                    CHAPTER {chapter.number} · {chPaths.length} PATHS · {cStats.total} MISSIONS
                  </div>
                  <h2 className="font-display text-3xl">{chapter.title}</h2>
                  <div className="font-mono text-xs opacity-60 mt-0.5">{chapter.tagline}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs uppercase opacity-60">{cStats.done}/{cStats.total}</div>
                  {cStats.complete && <div className="font-mono text-[10px]">🏆 {chapter.trophy.name}</div>}
                </div>
              </div>

              {/* Chapter progress bar */}
              <div className="h-1 brutal-border mb-4 bg-ink/5 overflow-hidden">
                <div
                  className={`h-full ${activeWorld === "dj" ? "bg-volt" : "bg-acid"} transition-all`}
                  style={{ width: `${cStats.pct}%` }}
                />
              </div>

              {/* Path cards grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {chPaths.map((path) => {
                  const pStats = pathStats(path.missionSlugs);

                  return (
                    <div key={path.slug} className="brutal-border flex flex-col">
                      {/* Path header */}
                      <div className="p-4 flex-1">
                        <div className="font-mono text-[9px] uppercase opacity-40">
                          PATH {path.number} · {pStats.total} MISSIONS
                        </div>
                        <div className="font-display text-xl mt-0.5">{path.title}</div>
                        <div className="font-mono text-xs opacity-60 mt-0.5">{path.tagline}</div>

                        {/* Progress bar */}
                        <div className="h-1.5 brutal-border mt-3 bg-ink/10 overflow-hidden">
                          <div
                            className={`h-full transition-all ${activeWorld === "dj" ? "bg-volt" : "bg-acid"}`}
                            style={{ width: `${pStats.pct}%` }}
                          />
                        </div>
                        <div className="font-mono text-[9px] uppercase opacity-50 mt-1">
                          {pStats.done}/{pStats.total} missions · {pStats.pct}%
                        </div>

                        {/* Source */}
                        {path.source && (
                          <div className="font-mono text-[8px] opacity-30 mt-2 leading-relaxed">
                            {path.source.length > 60 ? path.source.slice(0, 60) + "…" : path.source}
                          </div>
                        )}
                      </div>

                      {/* CTA */}
                      <Link
                        to="/path/$slug"
                        params={{ slug: path.slug }}
                        className={`brutal-border border-x-0 border-b-0 px-4 py-2.5 font-mono text-xs uppercase brutal-press text-center transition-colors ${
                          pStats.complete
                            ? "bg-ink text-bone"
                            : pStats.done > 0
                            ? activeWorld === "dj" ? "bg-volt text-ink" : "bg-acid text-ink"
                            : "bg-bone hover:bg-sun"
                        }`}
                      >
                        {pStats.complete ? "✓ COMPLETE" : pStats.done > 0 ? "CONTINUE →" : "START →"}
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
