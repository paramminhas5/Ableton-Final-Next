import { createFileRoute, Link } from "@tanstack/react-router";
import { CHAPTERS, chaptersByWorld } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";
import { MISSIONS, missionBySlug } from "@/content/missions";
import { FOUNDATIONS_MISSIONS } from "@/content/missions-foundations";
import { DJ_WORLD_MISSIONS } from "@/content/missions-dj";
import { useProgress } from "@/lib/progress";
import { useState, useMemo } from "react";

export const Route = createFileRoute("/missions")({
  head: () => ({
    meta: [
      { title: "Missions — CCD.SCHOOL" },
      { name: "description", content: "All 153 missions across Fundamentals, DJ World and Producer. Search, filter and jump to any mission." },
    ],
  }),
  component: MissionsPage,
});

type WorldTab = "fundamentals" | "dj" | "producer";

const WORLD_MISSIONS: Record<WorldTab, typeof MISSIONS> = {
  fundamentals: FOUNDATIONS_MISSIONS,
  dj: DJ_WORLD_MISSIONS,
  producer: MISSIONS,
};

const SIM_ICONS: Record<string, string> = {
  "ear-training": "👂", "piano-roll": "🎹", "drum-pad": "🥁", "synth-playground": "🎛",
  "bpm-tap": "⏱", "mixer": "🎚", "browser-tour": "📂", "routing-puzzle": "🔌",
  "arrangement": "📐", "knob-trainer": "🎛", "buffer-sim": "💾", "warp-lab": "⚡",
  "device-lab": "🔧", "midi-vs-audio": "🔄", "scale-aware": "🎵", "tempo-compare": "⚡",
  "groove-extractor": "🎶", "none": "—",
};

function MissionsPage() {
  const { progress } = useProgress();
  const completed = progress.completedMissions;
  const [activeWorld, setActiveWorld] = useState<WorldTab>("fundamentals");
  const [search, setSearch] = useState("");

  const chapters = chaptersByWorld(activeWorld);
  const allPaths = pathsByWorld(activeWorld);
  const worldMissions = WORLD_MISSIONS[activeWorld];

  // Build a map: missionSlug → { chapter, path }
  const missionMap = useMemo(() => {
    const map: Record<string, { chapterTitle: string; pathTitle: string; pathSlug: string }> = {};
    allPaths.forEach((path) => {
      const chapter = chapters.find((c) => c.slug === path.chapter);
      path.missionSlugs.forEach((s) => {
        map[s] = {
          chapterTitle: chapter?.title ?? "",
          pathTitle: path.title,
          pathSlug: path.slug,
        };
      });
    });
    return map;
  }, [allPaths, chapters]);

  const worldStats = () => {
    const done = worldMissions.filter((m) => !!completed[m.slug]).length;
    return { done, total: worldMissions.length, pct: Math.round((done / worldMissions.length) * 100) };
  };

  const ws = worldStats();

  const filteredMissions = useMemo(() => {
    if (!search.trim()) return worldMissions;
    const q = search.toLowerCase();
    return worldMissions.filter(
      (m) => m.title.toLowerCase().includes(q) || m.slug.includes(q) || m.tagline?.toLowerCase().includes(q)
    );
  }, [worldMissions, search]);

  // Group filtered missions by chapter
  const grouped = useMemo(() => {
    const result: { chapter: typeof chapters[0]; paths: { path: typeof allPaths[0]; missions: typeof worldMissions }[] }[] = [];
    for (const chapter of chapters) {
      const chPaths = allPaths.filter((p) => p.chapter === chapter.slug).sort((a, b) => a.number - b.number);
      const pathsWithMissions = chPaths.map((path) => ({
        path,
        missions: path.missionSlugs.map((s) => worldMissions.find((m) => m.slug === s)).filter(Boolean) as typeof worldMissions,
      })).filter((p) => {
        if (!search.trim()) return true;
        return p.missions.some((m) => filteredMissions.includes(m));
      });
      if (pathsWithMissions.length > 0) result.push({ chapter, paths: pathsWithMissions });
    }
    return result;
  }, [chapters, allPaths, worldMissions, filteredMissions, search]);

  return (
    <main className="min-h-screen bg-bone">
      {/* Header */}
      <header className="brutal-border border-x-0 border-t-0">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="font-mono text-[10px] uppercase opacity-40 mb-1">// 153 MISSIONS TOTAL</div>
          <h1 className="font-display text-5xl leading-none">MISSIONS</h1>

          {/* Search */}
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              placeholder="Search missions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="brutal-border px-4 py-2 font-mono text-sm bg-bone w-full max-w-sm focus:outline-none focus:bg-sun/20"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="brutal-border px-3 py-2 font-mono text-xs uppercase brutal-press hover:bg-sun"
              >
                CLEAR
              </button>
            )}
          </div>
        </div>
      </header>

      {/* World tabs */}
      <div className="sticky top-0 z-10 bg-bone brutal-border border-x-0 border-t-0">
        <div className="max-w-5xl mx-auto px-4 flex gap-0">
          {(["fundamentals", "dj", "producer"] as WorldTab[]).map((w) => {
            const wm = { fundamentals: { label: "🎵 Fundamentals", active: "bg-acid text-ink" }, dj: { label: "🎧 DJ World", active: "bg-ink text-bone" }, producer: { label: "🎛 Producer", active: "bg-sun text-ink" } }[w];
            const missions = WORLD_MISSIONS[w];
            const done = missions.filter((m) => !!completed[m.slug]).length;
            const pct = Math.round((done / missions.length) * 100);
            return (
              <button
                key={w}
                onClick={() => { setActiveWorld(w); setSearch(""); }}
                className={`flex-1 brutal-border border-b-0 px-3 py-3 font-mono text-[10px] uppercase brutal-press transition-all ${activeWorld === w ? wm.active : "bg-bone hover:bg-sun/30"}`}
              >
                <div>{wm.label}</div>
                <div className="opacity-60 mt-0.5">{done}/{missions.length} · {pct}%</div>
              </button>
            );
          })}
        </div>
        <div className="h-1 bg-ink/5">
          <div
            className={`h-full transition-all ${activeWorld === "dj" ? "bg-volt" : "bg-acid"}`}
            style={{ width: `${ws.pct}%` }}
          />
        </div>
      </div>

      {/* Mission list */}
      <div className="max-w-5xl mx-auto px-4 py-6 pb-24 space-y-8">
        {search && (
          <div className="font-mono text-xs uppercase opacity-50">
            {filteredMissions.length} results for "{search}"
          </div>
        )}

        {grouped.map(({ chapter, paths }) => {
          const chDone = allPaths.filter((p) => p.chapter === chapter.slug)
            .flatMap((p) => p.missionSlugs).filter((s) => !!completed[s]).length;
          const chTotal = allPaths.filter((p) => p.chapter === chapter.slug)
            .flatMap((p) => p.missionSlugs).length;

          return (
            <section key={chapter.slug}>
              {/* Chapter header */}
              <div className="flex items-end justify-between mb-2">
                <div>
                  <div className="font-mono text-[9px] uppercase opacity-40">CHAPTER {chapter.number}</div>
                  <h2 className="font-display text-2xl">{chapter.title}</h2>
                </div>
                <div className="font-mono text-xs uppercase opacity-60 text-right">
                  {chDone}/{chTotal}
                  {chDone === chTotal && chTotal > 0 && <div>🏆 {chapter.trophy.name}</div>}
                </div>
              </div>
              <div className="h-0.5 bg-ink/10 mb-4" />

              {/* Paths */}
              <div className="space-y-4">
                {paths.map(({ path, missions }) => {
                  const pDone = missions.filter((m) => !!completed[m.slug]).length;
                  const pTotal = missions.length;

                  return (
                    <div key={path.slug}>
                      {/* Path label */}
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-mono text-[9px] uppercase opacity-50">
                          PATH {path.number}: {path.title.toUpperCase()}
                        </div>
                        <Link
                          to="/path/$slug"
                          params={{ slug: path.slug }}
                          className="font-mono text-[9px] uppercase opacity-50 hover:opacity-100 brutal-press"
                        >
                          VIEW SNAKE →
                        </Link>
                      </div>

                      {/* Missions table */}
                      <div className="brutal-border divide-y divide-ink/5">
                        {missions
                          .filter((m) => !search || filteredMissions.includes(m))
                          .map((mission, idx) => {
                            const isDone = !!completed[mission.slug];
                            const simIcon = SIM_ICONS[(mission as any).sim?.type ?? "none"] ?? "—";
                            return (
                              <Link
                                key={mission.slug}
                                to="/mission/$slug"
                                params={{ slug: mission.slug }}
                                className={`flex items-center gap-3 px-3 py-2.5 brutal-press transition-colors ${isDone ? "bg-ink/5 hover:bg-acid/20" : "hover:bg-sun/40"}`}
                              >
                                {/* Done indicator */}
                                <span className={`w-5 h-5 brutal-border flex items-center justify-center font-mono text-[9px] shrink-0 ${isDone ? "bg-ink text-bone" : "bg-bone"}`}>
                                  {isDone ? "✓" : idx + 1}
                                </span>

                                {/* Mission number */}
                                <span className="font-mono text-[9px] opacity-30 w-6 shrink-0 text-right">
                                  {(mission as any).number}
                                </span>

                                {/* Title */}
                                <span className={`font-display text-sm flex-1 min-w-0 truncate ${isDone ? "opacity-60" : ""}`}>
                                  {mission.title}
                                </span>

                                {/* Sim type */}
                                <span className="font-mono text-[9px] opacity-30 shrink-0 hidden sm:block w-4 text-center" title={(mission as any).sim?.type}>
                                  {simIcon}
                                </span>

                                {/* XP */}
                                <span className="font-mono text-[9px] opacity-50 shrink-0">
                                  {(mission as any).xp ?? 40} XP
                                </span>
                              </Link>
                            );
                          })}
                      </div>
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
