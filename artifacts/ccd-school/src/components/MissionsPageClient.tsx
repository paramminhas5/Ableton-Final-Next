"use client";
import Link from "next/link";
import { chaptersByWorld } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";
import { MISSIONS } from "@/content/missions";
import { FOUNDATIONS_MISSIONS } from "@/content/missions-foundations";
import { DJ_WORLD_MISSIONS } from "@/content/missions-dj";
import { useProgress } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import { useAuth } from "@/lib/auth";
import { useGatingMode } from "@/components/ClientProviders";
import { isPaidMission, isLocked } from "@/lib/gating";
import { useState, useMemo } from "react";

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

export function MissionsPageClient() {
  const { progress } = useProgress();
  const { plan } = useAuth();
  const { learnMode } = useLearnMode();
  const gatingMode = useGatingMode();
  const completed = progress.completedMissions;
  const [activeWorld, setActiveWorld] = useState<WorldTab>("fundamentals");
  const [search, setSearch] = useState("");

  const chapters = chaptersByWorld(activeWorld);
  const allPaths = pathsByWorld(activeWorld);
  const worldMissions = WORLD_MISSIONS[activeWorld];
  const isFlowMode = learnMode === "flow";

  // P0 #2: Build sequential unlock state for flow mode gating
  const flowUnlockedSlugs = useMemo(() => {
    if (!isFlowMode) return null; // null = all unlocked
    const unlocked = new Set<string>();
    let prevDone = true;
    for (const path of allPaths.sort((a, b) => a.number - b.number)) {
      for (const slug of path.missionSlugs) {
        if (prevDone) unlocked.add(slug);
        prevDone = !!completed[slug];
      }
    }
    return unlocked;
  }, [isFlowMode, allPaths, completed]);

  const ws = useMemo(() => {
    const done = worldMissions.filter((m) => !!completed[m.slug]).length;
    return { done, total: worldMissions.length, pct: Math.round((done / worldMissions.length) * 100) };
  }, [worldMissions, completed]);

  const filteredMissions = useMemo(() => {
    if (!search.trim()) return worldMissions;
    const q = search.toLowerCase();
    return worldMissions.filter((m) => m.title.toLowerCase().includes(q) || m.slug.includes(q) || m.tagline?.toLowerCase().includes(q));
  }, [worldMissions, search]);

  const grouped = useMemo(() => {
    const result: { chapter: typeof chapters[0]; paths: { path: typeof allPaths[0]; missions: typeof worldMissions }[] }[] = [];
    for (const chapter of chapters) {
      const chPaths = allPaths.filter((p) => p.chapter === chapter.slug).sort((a, b) => a.number - b.number);
      const pathsWithMissions = chPaths.map((path) => ({
        path,
        missions: path.missionSlugs.map((s) => worldMissions.find((m) => m.slug === s)).filter(Boolean) as typeof worldMissions,
      })).filter((p) => { if (!search.trim()) return true; return p.missions.some((m) => filteredMissions.includes(m)); });
      if (pathsWithMissions.length > 0) result.push({ chapter, paths: pathsWithMissions });
    }
    return result;
  }, [chapters, allPaths, worldMissions, filteredMissions, search]);

  return (
    <main className="min-h-screen bg-bone">
      <header className="brutal-border border-x-0 border-t-0">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="font-mono text-[10px] uppercase opacity-40 mb-1">// 153 MISSIONS TOTAL</div>
          <h1 className="font-display text-5xl leading-none">MISSIONS</h1>
          {/* P0 #2: Flow mode gating notice */}
          {isFlowMode && (
            <div className="mt-3 brutal-border bg-acid text-ink px-4 py-2 flex items-center gap-2 font-mono text-[10px] uppercase">
              <span>🌊</span>
              <span>Flow Mode — lessons unlock sequentially. <button onClick={() => {}} className="underline opacity-60">Switch to Free Mode</button> to browse freely.</span>
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <input type="text" placeholder="Search missions..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="brutal-border px-4 py-2 font-mono text-sm bg-bone w-full max-w-sm focus:outline-none focus:bg-sun/20" />
            {search && <button onClick={() => setSearch("")} className="brutal-border px-3 py-2 font-mono text-xs uppercase brutal-press hover:bg-sun">CLEAR</button>}
          </div>
        </div>
      </header>
      <div className="sticky top-0 z-10 bg-bone brutal-border border-x-0 border-t-0">
        <div className="max-w-5xl mx-auto px-4 flex gap-0">
          {(["fundamentals", "dj", "producer"] as WorldTab[]).map((w) => {
            const wm = { fundamentals: { label: "🎵 Fundamentals", active: "bg-acid text-ink" }, dj: { label: "🎧 DJ World", active: "bg-ink text-bone" }, producer: { label: "🎛 Producer", active: "bg-sun text-ink" } }[w];
            const missions = WORLD_MISSIONS[w];
            const done = missions.filter((m) => !!completed[m.slug]).length;
            const pct = Math.round((done / missions.length) * 100);
            return (
              <button key={w} onClick={() => { setActiveWorld(w); setSearch(""); }}
                className={`flex-1 brutal-border border-b-0 px-3 py-3 font-mono text-[10px] uppercase brutal-press transition-all ${activeWorld === w ? wm.active : "bg-bone hover:bg-sun/30"}`}>
                <div>{wm.label}</div>
                <div className="opacity-60 mt-0.5">{done}/{missions.length} · {pct}%</div>
              </button>
            );
          })}
        </div>
        <div className="h-1 bg-ink/5">
          <div className={`h-full transition-all ${activeWorld === "dj" ? "bg-volt" : "bg-acid"}`} style={{ width: `${ws.pct}%` }} />
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-6 pb-24 space-y-8">
        {search && <div className="font-mono text-xs uppercase opacity-50">{filteredMissions.length} results for &quot;{search}&quot;</div>}
        {grouped.map(({ chapter, paths }) => {
          const chDone = allPaths.filter((p) => p.chapter === chapter.slug).flatMap((p) => p.missionSlugs).filter((s) => !!completed[s]).length;
          const chTotal = allPaths.filter((p) => p.chapter === chapter.slug).flatMap((p) => p.missionSlugs).length;
          return (
            <section key={chapter.slug}>
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
              <div className="space-y-4">
                {paths.map(({ path, missions }) => {
                  const pDone = missions.filter((m) => !!completed[m.slug]).length;
                  return (
                    <div key={path.slug}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-mono text-[9px] uppercase opacity-50">PATH {path.number}: {path.title.toUpperCase()}</div>
                        <Link href={`/path/${path.slug}`} className="font-mono text-[9px] uppercase opacity-50 hover:opacity-100 brutal-press">VIEW SNAKE →</Link>
                      </div>
                      <div className="brutal-border divide-y divide-ink/5">
                        {missions.filter((m) => !search || filteredMissions.includes(m)).map((mission, idx) => {
                          const isDone = !!completed[mission.slug];
                          const locked = isLocked(mission, plan, gatingMode);
                          // P0 #2: flow mode sequential gating
                          const flowLocked = isFlowMode && flowUnlockedSlugs !== null && !flowUnlockedSlugs.has(mission.slug) && !isDone;
                          const isPaid = isPaidMission(mission);
                          const simIcon = SIM_ICONS[(mission as { sim?: { type?: string } }).sim?.type ?? "none"] ?? "—";
                          return (
                            <div key={mission.slug} className="relative">
                              <Link href={flowLocked ? "#" : `/mission/${mission.slug}`}
                                onClick={flowLocked ? (e) => e.preventDefault() : undefined}
                                aria-disabled={flowLocked}
                                title={flowLocked ? "Complete previous lessons in Flow Mode to unlock" : mission.title}
                                className={`flex items-center gap-3 px-3 py-2.5 brutal-press transition-colors ${isDone ? "bg-ink/5 hover:bg-acid/20" : locked || flowLocked ? "opacity-60 cursor-not-allowed" : "hover:bg-sun/40"}`}>
                                <span className={`w-5 h-5 brutal-border flex items-center justify-center font-mono text-[9px] shrink-0 ${isDone ? "bg-ink text-bone" : "bg-bone"}`}>
                                  {isDone ? "✓" : (locked || flowLocked) ? "🔒" : idx + 1}
                                </span>
                                <span className="font-mono text-[9px] opacity-30 w-6 shrink-0 text-right">{(mission as { number?: number }).number}</span>
                                <span className={`font-display text-sm flex-1 min-w-0 truncate ${isDone ? "opacity-60" : ""}`}>{mission.title}</span>
                                {flowLocked && (
                                  <span className="font-mono text-[8px] px-1 py-0.5 brutal-border bg-ink/20 shrink-0 uppercase">Flow locked</span>
                                )}
                                {isPaid && gatingMode === "paid" && !flowLocked && (
                                  <span className={`font-mono text-[8px] px-1 py-0.5 brutal-border shrink-0 ${locked ? "bg-ink text-bone" : "bg-volt text-ink"}`}>
                                    {locked ? "PRO" : "PRO ✓"}
                                  </span>
                                )}
                                <span className="font-mono text-[9px] opacity-30 shrink-0 hidden sm:block w-4 text-center">{simIcon}</span>
                                <span className="font-mono text-[9px] opacity-50 shrink-0">{(mission as { xp?: number }).xp ?? 40} XP</span>
                              </Link>
                            </div>
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
