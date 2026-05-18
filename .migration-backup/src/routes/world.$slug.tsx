import { createFileRoute, Link } from "@tanstack/react-router";
import { chaptersByWorld, chapterBySlug, WORLD_TROPHIES } from "@/content/chapters";
import { PATHS, pathsByWorld, pathBySlug } from "@/content/paths";
import { useProgress } from "@/lib/progress";
import { useState } from "react";

type WorldSlug = "fundamentals" | "dj" | "producer";

const WORLD_CONFIG: Record<WorldSlug, {
  title: string; emoji: string; tagline: string; description: string;
  hero: string; accent: string; nodeActive: string; nodeInactive: string; bar: string;
}> = {
  fundamentals: {
    title: "Fundamentals", emoji: "🎵",
    tagline: "The vocabulary of music — before you produce or DJ",
    description: "5 chapters · 10 paths · 40 missions. Source: learningmusic.ableton.com + Ableton Live manual",
    hero: "bg-acid text-ink", accent: "bg-acid", nodeActive: "bg-ink text-bone", nodeInactive: "bg-bone text-ink/40", bar: "bg-ink",
  },
  dj: {
    title: "DJ World", emoji: "🎧",
    tagline: "The art of playing recorded music for people",
    description: "5 chapters · 10 paths · 40 missions. Source: rekordbox 6.0.0 Instruction Manual (Pioneer DJ)",
    hero: "bg-ink text-bone", accent: "bg-volt", nodeActive: "bg-volt text-ink", nodeInactive: "bg-bone/10 text-bone/30", bar: "bg-volt",
  },
  producer: {
    title: "Producer", emoji: "🎛",
    tagline: "Build music in Ableton Live 12",
    description: "6 chapters · 15 paths · 91 missions. Source: Ableton Live 12 Reference Manual + learningsynths.ableton.com",
    hero: "bg-sun text-ink", accent: "bg-sun", nodeActive: "bg-ink text-bone", nodeInactive: "bg-bone text-ink/40", bar: "bg-ink",
  },
};

export const Route = createFileRoute("/world/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `${params.slug === "dj" ? "DJ World" : params.slug.charAt(0).toUpperCase() + params.slug.slice(1)} — CCD.SCHOOL` }],
  }),
  component: WorldPage,
});

function WorldPage() {
  const { slug } = Route.useParams();
  const world = slug as WorldSlug;
  const cfg = WORLD_CONFIG[world];
  const { progress } = useProgress();
  const completed = progress.completedMissions;
  const chapters = chaptersByWorld(world);
  const allPaths = pathsByWorld(world);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(chapters[0]?.slug ?? null);

  if (!cfg) return <div className="p-8 font-mono">World not found</div>;

  const chapterStats = (chSlug: string) => {
    const paths = allPaths.filter((p) => p.chapter === chSlug);
    const slugs = paths.flatMap((p) => p.missionSlugs);
    const done = slugs.filter((s) => !!completed[s]).length;
    return { done, total: slugs.length, pct: slugs.length > 0 ? Math.round((done / slugs.length) * 100) : 0, complete: done === slugs.length && slugs.length > 0 };
  };

  const worldStats = () => {
    const slugs = allPaths.flatMap((p) => p.missionSlugs);
    const done = slugs.filter((s) => !!completed[s]).length;
    return { done, total: slugs.length, pct: Math.round((done / slugs.length) * 100) };
  };

  const ws = worldStats();
  const trophy = WORLD_TROPHIES[world];

  return (
    <main className="min-h-screen bg-bone">
      {/* Hero */}
      <header className={`brutal-border border-x-0 border-t-0 ${cfg.hero}`}>
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
          <Link to="/worlds" className="font-mono text-[10px] uppercase opacity-50 hover:opacity-100 transition-opacity">
            ← ALL WORLDS
          </Link>
          <h1 className="font-display text-5xl md:text-8xl leading-none mt-3">
            {cfg.emoji} {cfg.title.toUpperCase()}
          </h1>
          <p className="font-display text-xl md:text-2xl mt-2 opacity-80">{cfg.tagline}</p>
          <p className="font-mono text-xs mt-2 opacity-50">{cfg.description}</p>

          {/* World progress bar */}
          <div className="mt-6 flex items-center gap-4">
            <div className={`flex-1 h-2.5 brutal-border overflow-hidden ${world === "dj" ? "bg-bone/10" : "bg-ink/10"}`}>
              <div className={`h-full ${cfg.bar} transition-all duration-700`} style={{ width: `${ws.pct}%` }} />
            </div>
            <div className="font-mono text-xs uppercase opacity-70 shrink-0">
              {ws.done}/{ws.total} · {ws.pct}%
            </div>
            {ws.pct === 100 && (
              <div className="font-mono text-xs uppercase shrink-0">🏆 {trophy.name}</div>
            )}
          </div>
        </div>
      </header>

      {/* Chapter skill tree — horizontal node map */}
      <section className="brutal-border border-x-0 border-b-0 bg-bone sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center gap-1 overflow-x-auto">
            {chapters.map((ch, i) => {
              const stats = chapterStats(ch.slug);
              const isActive = expandedChapter === ch.slug;
              return (
                <div key={ch.slug} className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setExpandedChapter(isActive ? null : ch.slug)}
                    className={`brutal-border px-3 py-2 font-mono text-[10px] uppercase brutal-press transition-all ${
                      stats.complete ? (world === "dj" ? "bg-volt text-ink" : "bg-ink text-bone")
                      : isActive ? "bg-ink text-bone"
                      : "bg-bone hover:bg-sun"
                    }`}
                  >
                    {stats.complete ? "✓ " : `${i + 1}. `}{ch.title}
                    {stats.total > 0 && !stats.complete && (
                      <span className="ml-1 opacity-50">{stats.pct}%</span>
                    )}
                  </button>
                  {i < chapters.length - 1 && (
                    <div className="w-4 h-px bg-ink/20 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Chapter detail panels */}
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4 pb-24">
        {chapters.map((ch) => {
          const isExpanded = expandedChapter === ch.slug;
          const stats = chapterStats(ch.slug);
          const chPaths = allPaths.filter((p) => p.chapter === ch.slug).sort((a, b) => a.number - b.number);

          return (
            <div key={ch.slug} className="brutal-border overflow-hidden">
              {/* Chapter header */}
              <button
                onClick={() => setExpandedChapter(isExpanded ? null : ch.slug)}
                className="w-full text-left p-4 md:p-5 flex items-start justify-between gap-4 hover:bg-sun/20 transition-colors brutal-press"
              >
                <div>
                  <div className="font-mono text-[9px] uppercase opacity-50">
                    CHAPTER {ch.number} · {chPaths.length} PATHS · {stats.total} MISSIONS
                  </div>
                  <div className="font-display text-2xl md:text-3xl mt-0.5">{ch.title}</div>
                  <div className="font-mono text-xs mt-1 opacity-60">{ch.tagline}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-display text-2xl">{stats.pct}%</div>
                  <div className="font-mono text-[9px] uppercase opacity-50">{stats.done}/{stats.total}</div>
                  {stats.complete && <div className="font-mono text-[9px] mt-1">🏆 {ch.trophy.name}</div>}
                </div>
              </button>

              {/* Progress bar */}
              <div className="h-1 bg-ink/5">
                <div
                  className={`h-full ${world === "dj" ? "bg-volt" : "bg-acid"} transition-all`}
                  style={{ width: `${stats.pct}%` }}
                />
              </div>

              {/* Expanded: description + paths */}
              {isExpanded && (
                <div className="border-t border-ink/10">
                  <div className="px-4 md:px-5 py-4 bg-bone/50">
                    <p className="font-mono text-xs leading-relaxed opacity-70 max-w-2xl">{ch.description}</p>
                    {stats.complete && (
                      <div className="mt-3 brutal-border inline-flex items-center gap-2 px-3 py-1.5 bg-acid font-mono text-[10px] uppercase">
                        🏆 {ch.trophy.name} — {ch.trophy.description}
                      </div>
                    )}
                  </div>

                  {/* Paths in this chapter */}
                  <div className="divide-y divide-ink/10">
                    {chPaths.map((path) => {
                      const pDone = path.missionSlugs.filter((s) => !!completed[s]).length;
                      const pTotal = path.missionSlugs.length;
                      const pPct = Math.round((pDone / pTotal) * 100);
                      const pComplete = pDone === pTotal;

                      return (
                        <div key={path.slug} className="px-4 md:px-5 py-4">
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="flex-1 min-w-0">
                              <div className="font-mono text-[9px] uppercase opacity-40">
                                PATH {path.number} · {pTotal} MISSIONS · {pDone} DONE
                                {path.source && <span className="ml-2 opacity-60">— {path.source.split("·")[0].trim()}</span>}
                              </div>
                              <div className="font-display text-xl md:text-2xl mt-0.5">{path.title}</div>
                              <div className="font-mono text-xs opacity-60 mt-0.5">{path.tagline}</div>

                              {/* Mission chips */}
                              <div className="flex flex-wrap gap-1 mt-3">
                                {path.missionSlugs.map((s, idx) => {
                                  const isDone = !!completed[s];
                                  return (
                                    <Link
                                      key={s}
                                      to="/mission/$slug"
                                      params={{ slug: s }}
                                      className={`brutal-border px-2 py-0.5 font-mono text-[9px] uppercase brutal-press ${
                                        isDone ? "bg-ink text-bone" : "bg-bone hover:bg-sun"
                                      }`}
                                    >
                                      {isDone ? "✓ " : `${idx + 1}. `}{s.replace(/-/g, " ")}
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="shrink-0">
                              <Link
                                to="/path/$slug"
                                params={{ slug: path.slug }}
                                className={`brutal-border px-4 py-2.5 font-display text-base brutal-press block text-center ${
                                  pComplete ? "bg-ink text-bone" :
                                  world === "dj" ? "bg-volt text-ink" : "bg-acid text-ink"
                                }`}
                              >
                                {pComplete ? "DONE ✓" : pDone > 0 ? "CONTINUE →" : "START →"}
                              </Link>
                              {pTotal > 0 && (
                                <div className="mt-2 h-1.5 brutal-border overflow-hidden w-24">
                                  <div
                                    className={`h-full ${world === "dj" ? "bg-volt" : "bg-acid"}`}
                                    style={{ width: `${pPct}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* World trophy */}
        <div className={`brutal-border p-5 ${ws.pct === 100 ? (world === "dj" ? "bg-volt text-ink" : "bg-acid text-ink") : "bg-bone opacity-40"}`}>
          <div className="font-mono text-[9px] uppercase mb-1">WORLD TROPHY</div>
          <div className="font-display text-2xl">🏆 {trophy.name}</div>
          <div className="font-mono text-xs mt-1 opacity-70">{trophy.description}</div>
          {ws.pct < 100 && (
            <div className="font-mono text-[9px] uppercase mt-2 opacity-50">
              Complete all {chapters.length} chapters to unlock
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
