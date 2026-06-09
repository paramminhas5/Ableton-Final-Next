"use client";
/**
 * MissionsPageClient — CCD-styled missions browser.
 * - CCD border-4 world tabs with correct active colours
 * - Mode switch wired via setLearnMode (not broken onClick={()=>{}})
 * - SectionReveal on every chapter group
 * - Cat decoration on chapter headers
 * - Flow mode gating intact
 */
import Link from "next/link";
import Image from "next/image";
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
import SectionReveal from "@/components/SectionReveal";
import { useState, useMemo } from "react";

type WorldTab = "fundamentals" | "dj" | "producer";
const WORLD_MISSIONS: Record<WorldTab, typeof MISSIONS> = {
  fundamentals: FOUNDATIONS_MISSIONS,
  dj:           DJ_WORLD_MISSIONS,
  producer:     MISSIONS,
};
const WORLD_STYLE: Record<WorldTab, { label: string; activeBg: string; activeText: string; bar: string; cat: string }> = {
  fundamentals: { label: "🎵 Fundamentals", activeBg: "bg-acid",         activeText: "text-ink",  bar: "bg-acid",          cat: "/cats/cat-handstand.png" },
  dj:           { label: "🎧 DJ World",     activeBg: "bg-ink",           activeText: "text-bone", bar: "bg-electric-blue", cat: "/cats/cat-dj.png" },
  producer:     { label: "🎛 Producer",     activeBg: "bg-electric-blue", activeText: "text-bone", bar: "bg-electric-blue", cat: "/cats/cat-dj-hero.png" },
};
const SIM_ICONS: Record<string, string> = {
  "ear-training":"👂","piano-roll":"🎹","drum-pad":"🥁","synth-playground":"🎛","bpm-tap":"⏱","mixer":"🎚","browser-tour":"📂","routing-puzzle":"🔌","arrangement":"📐","knob-trainer":"🎛","buffer-sim":"💾","warp-lab":"⚡","device-lab":"🔧","midi-vs-audio":"🔄","scale-aware":"🎵","tempo-compare":"⚡","groove-extractor":"🎶","none":"—",
};
const CHAPTER_CATS = ["/cats/cat-cap.png","/cats/cat-headphones.png","/cats/cat-raver.png","/cats/cat-handstand.png","/cats/cat-dancer.png","/cats/cat-dj-new.png"];

export function MissionsPageClient() {
  const { progress }  = useProgress();
  const { plan }      = useAuth();
  const { learnMode, setLearnMode } = useLearnMode();
  const gatingMode    = useGatingMode();
  const completed     = progress.completedMissions;
  const [activeWorld, setActiveWorld] = useState<WorldTab>("fundamentals");
  const [search, setSearch]           = useState("");

  const chapters      = chaptersByWorld(activeWorld);
  const allPaths      = pathsByWorld(activeWorld);
  const worldMissions = WORLD_MISSIONS[activeWorld];
  const isFlowMode    = learnMode === "flow";
  const wStyle        = WORLD_STYLE[activeWorld];

  const flowUnlockedSlugs = useMemo(() => {
    if (!isFlowMode) return null;
    const unlocked  = new Set<string>();
    let prevDone    = true;
    for (const path of allPaths.sort((a,b) => a.number - b.number)) {
      for (const slug of path.missionSlugs) {
        if (prevDone) unlocked.add(slug);
        prevDone = !!completed[slug];
      }
    }
    return unlocked;
  }, [isFlowMode, allPaths, completed]);

  const ws = useMemo(() => {
    const done = worldMissions.filter(m => !!completed[m.slug]).length;
    return { done, total: worldMissions.length, pct: Math.round((done / worldMissions.length) * 100) };
  }, [worldMissions, completed]);

  const filteredMissions = useMemo(() => {
    if (!search.trim()) return worldMissions;
    const q = search.toLowerCase();
    return worldMissions.filter(m => m.title.toLowerCase().includes(q) || m.slug.includes(q) || m.tagline?.toLowerCase().includes(q));
  }, [worldMissions, search]);

  const grouped = useMemo(() => {
    const result: { chapter: (typeof chapters)[0]; paths: { path: (typeof allPaths)[0]; missions: typeof worldMissions }[] }[] = [];
    for (const chapter of chapters) {
      const chPaths = allPaths.filter(p => p.chapter === chapter.slug).sort((a,b) => a.number - b.number);
      const pathsWithMissions = chPaths.map(path => ({
        path,
        missions: path.missionSlugs.map(s => worldMissions.find(m => m.slug === s)).filter(Boolean) as typeof worldMissions,
      })).filter(p => !search.trim() || p.missions.some(m => filteredMissions.includes(m)));
      if (pathsWithMissions.length > 0) result.push({ chapter, paths: pathsWithMissions });
    }
    return result;
  }, [chapters, allPaths, worldMissions, filteredMissions, search]);

  return (
    <main className="min-h-screen bg-bone">

      {/* ── Header ── */}
      <header className="border-b-4 border-ink bg-electric-blue text-bone relative overflow-hidden">
        <div className="absolute right-4 bottom-0 w-20 h-20 pointer-events-none wiggle" aria-hidden
          style={{ filter: "drop-shadow(3px 3px 0 hsl(222 47% 4%))" }}>
          <Image src={wStyle.cat} alt="" width={80} height={80} className="w-full h-full object-contain" />
        </div>
        <div className="max-w-5xl mx-auto px-4 py-6 relative z-10">
          <div className="font-mono text-xs uppercase opacity-60 mb-1">// 153 MISSIONS TOTAL</div>
          <h1 className="font-display text-5xl md:text-6xl leading-none" style={{ textShadow: "4px 4px 0 hsl(222 47% 4%)" }}>MISSIONS</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="font-mono text-xs uppercase opacity-70">{ws.done}/{ws.total} done · {ws.pct}%</span>
          </div>

          {/* Mode banner — wired correctly */}
          {isFlowMode ? (
            <div className="mt-3 brutal-border bg-acid text-ink px-4 py-2 flex items-center gap-2 font-display text-sm">
              <span>🌊</span>
              <span>Flow Mode — lessons unlock sequentially.</span>
              <button
                onClick={() => setLearnMode("classic")}
                className="underline font-display text-sm ml-1 hover:opacity-70">
                Switch to Free Mode
              </button>
            </div>
          ) : (
            <div className="mt-3 brutal-border bg-bone/20 text-bone px-4 py-2 flex items-center gap-2 font-display text-sm">
              <span>🔓</span>
              <span>Free Mode — all missions open.</span>
              <button
                onClick={() => setLearnMode("flow")}
                className="underline font-display text-sm ml-1 hover:opacity-70">
                Switch to Flow Mode
              </button>
            </div>
          )}

          {/* Search */}
          <div className="mt-4 flex gap-2">
            <input type="text" placeholder="Search missions..." value={search} onChange={e => setSearch(e.target.value)}
              className="brutal-border px-4 py-2 font-mono text-sm bg-bone text-ink w-full max-w-sm focus:outline-none focus:bg-acid/20" />
            {search && <button onClick={() => setSearch("")} className="brutal-border bg-bone text-ink px-3 py-2 font-display text-sm hover:bg-acid transition-colors">CLEAR</button>}
          </div>
        </div>
      </header>

      {/* ── World tabs — CCD border-4 style ── */}
      <div className="sticky top-0 z-10 bg-bone border-b-4 border-ink">
        <div className="max-w-5xl mx-auto px-4 flex">
          {(["fundamentals","dj","producer"] as WorldTab[]).map(w => {
            const ws2 = WORLD_MISSIONS[w];
            const done2 = ws2.filter(m => !!completed[m.slug]).length;
            const pct2 = Math.round((done2/ws2.length)*100);
            const isActive = activeWorld === w;
            const wst = WORLD_STYLE[w];
            return (
              <button key={w} onClick={() => { setActiveWorld(w); setSearch(""); }}
                className={`flex-1 px-3 py-3.5 font-display text-sm border-r-4 border-ink last:border-r-0 transition-colors
                  ${isActive ? `${wst.activeBg} ${wst.activeText}` : "bg-bone hover:bg-acid/20 opacity-70 hover:opacity-100"}`}>
                <div>{wst.label}</div>
                <div className="font-mono text-[10px] opacity-60 mt-0.5">{done2}/{ws2.length} · {pct2}%</div>
              </button>
            );
          })}
        </div>
        <div className="h-2 bg-ink/10">
          <div className={`h-full ${wStyle.bar} transition-all duration-700`} style={{ width: `${ws.pct}%` }} />
        </div>
      </div>

      {/* ── Mission list ── */}
      <div className="max-w-5xl mx-auto px-4 py-6 pb-24 space-y-10">
        {search && <div className="font-mono text-xs uppercase opacity-50">{filteredMissions.length} results for &quot;{search}&quot;</div>}
        {grouped.map(({ chapter, paths }, chIdx) => {
          const chDone  = allPaths.filter(p => p.chapter === chapter.slug).flatMap(p => p.missionSlugs).filter(s => !!completed[s]).length;
          const chTotal = allPaths.filter(p => p.chapter === chapter.slug).flatMap(p => p.missionSlugs).length;
          const catSrc  = CHAPTER_CATS[chIdx % CHAPTER_CATS.length];

          return (
            <SectionReveal key={chapter.slug} delay={chIdx * 0.04}>
              <section>
                {/* Chapter header with cat */}
                <div className="flex items-start gap-3 mb-2">
                  <div className="shrink-0 w-10 h-10 wiggle mt-1" style={{ filter: "drop-shadow(2px 2px 0 hsl(222 47% 4%))" }} aria-hidden>
                    <Image src={catSrc} alt="" width={40} height={40} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 flex items-end justify-between gap-4">
                    <div>
                      <div className="font-mono text-[9px] uppercase opacity-40">CHAPTER {chapter.number}</div>
                      <h2 className="font-display text-2xl md:text-3xl">{chapter.title}</h2>
                    </div>
                    <div className="font-mono text-xs uppercase opacity-60 text-right shrink-0">
                      {chDone}/{chTotal}
                      {chDone === chTotal && chTotal > 0 && <div className="text-acid">🏆 {chapter.trophy.name}</div>}
                    </div>
                  </div>
                </div>

                {/* Chapter progress */}
                <div className="h-2 brutal-border bg-ink/10 mb-4 overflow-hidden">
                  <div className={`h-full ${wStyle.bar} transition-all`}
                    style={{ width: `${chTotal > 0 ? Math.round((chDone/chTotal)*100) : 0}%` }} />
                </div>

                <div className="space-y-4">
                  {paths.map(({ path, missions }) => {
                    const pDone = missions.filter(m => !!completed[m.slug]).length;
                    return (
                      <div key={path.slug}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-display text-sm uppercase opacity-50">PATH {path.number}: {path.title}</div>
                          <Link href={`/path/${path.slug}`} className="font-mono text-[9px] uppercase opacity-50 hover:opacity-100 hover:text-acid transition-colors">VIEW PATH →</Link>
                        </div>
                        <div className="brutal-border divide-y-2 divide-ink/10 chunk-shadow-sm">
                          {missions.filter(m => !search || filteredMissions.includes(m)).map((mission, idx) => {
                            const isDone     = !!completed[mission.slug];
                            const locked     = isLocked(mission, plan, gatingMode);
                            const flowLocked = isFlowMode && flowUnlockedSlugs !== null && !flowUnlockedSlugs.has(mission.slug) && !isDone;
                            const isPaid     = isPaidMission(mission);
                            const simIcon    = SIM_ICONS[(mission as { sim?: { type?: string } }).sim?.type ?? "none"] ?? "—";
                            return (
                              <Link key={mission.slug}
                                href={flowLocked ? "#" : `/mission/${mission.slug}`}
                                onClick={flowLocked ? e => e.preventDefault() : undefined}
                                aria-disabled={flowLocked}
                                title={flowLocked ? "Complete previous lessons in Flow Mode to unlock" : mission.title}
                                className={`flex items-center gap-3 px-4 py-3 transition-colors group
                                  ${isDone ? "bg-ink/5 hover:bg-acid/20" : locked || flowLocked ? "opacity-50 cursor-not-allowed bg-ink/5" : "hover:bg-acid/20"}`}>
                                {/* Done/locked indicator */}
                                <span className={`w-6 h-6 brutal-border flex items-center justify-center font-mono text-[9px] shrink-0 transition-colors
                                  ${isDone ? "bg-ink text-bone" : locked || flowLocked ? "bg-bone" : "bg-bone group-hover:bg-acid"}`}>
                                  {isDone ? "✓" : (locked || flowLocked) ? "🔒" : idx + 1}
                                </span>
                                <span className="font-mono text-[9px] opacity-30 w-6 shrink-0 text-right tabular-nums">{(mission as { number?: number }).number}</span>
                                <span className={`font-display text-sm flex-1 min-w-0 truncate ${isDone ? "opacity-60" : ""}`}>{mission.title}</span>
                                {flowLocked && <span className="font-mono text-[8px] px-1 py-0.5 brutal-border bg-ink/20 shrink-0 uppercase">Locked</span>}
                                {isPaid && gatingMode === "paid" && !flowLocked && (
                                  <span className={`font-mono text-[8px] px-1 py-0.5 brutal-border shrink-0 ${locked ? "bg-ink text-bone" : "bg-electric-blue text-bone"}`}>
                                    {locked ? "PRO" : "PRO ✓"}
                                  </span>
                                )}
                                <span className="font-mono text-[9px] opacity-30 shrink-0 hidden sm:block w-4 text-center">{simIcon}</span>
                                <span className="font-mono text-[9px] opacity-50 shrink-0 tabular-nums">{(mission as { xp?: number }).xp ?? 40} XP</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </SectionReveal>
          );
        })}
      </div>
    </main>
  );
}
