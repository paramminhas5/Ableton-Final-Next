"use client";
/**
 * /missions (all lessons) on Model 1 parts: world chips, flow or free switch, search,
 * then chapters, paths and one row per lesson. Flow mode still locks lessons until the
 * one before them is done. Paid lessons only show a pro tag when the admin turns paid on.
 */
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
import { Icon, Silk, Switch, WORLD_LED } from "@/components/m1/controls";
import { Chips, ListRow, RefPage, SearchField, SegBar } from "@/components/m1/parts";
import { useState, useMemo } from "react";

type WorldTab = "fundamentals" | "dj" | "producer";
const WORLD_MISSIONS: Record<WorldTab, typeof MISSIONS> = {
  fundamentals: FOUNDATIONS_MISSIONS,
  dj:           DJ_WORLD_MISSIONS,
  producer:     MISSIONS,
};
const WORLDS = ["fundamentals", "dj", "producer"] as const;

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
    <RefPage title="all lessons" back="/dashboard" meta="library" right={`${ws.done} of ${ws.total} done`}
      intro={isFlowMode ? "flow mode: each lesson opens after the one before it." : "free mode: every lesson is open."}>
      <Chips options={WORLDS} value={activeWorld} onChange={w => { setActiveWorld(w); setSearch(""); }} label="World" />
      <div style={{ marginTop: 12 }}>
        <Switch label="Mode" value={isFlowMode ? "flow" : "free"} onChange={id => setLearnMode(id === "flow" ? "flow" : "classic")}
          options={[{ id: "flow", label: "flow" }, { id: "free", label: "free" }]} />
      </div>
      <div style={{ marginTop: 12 }}><SegBar value={ws.total ? ws.done / ws.total : 0} color={WORLD_LED[activeWorld]} label={`${activeWorld} progress`} /></div>
      <SearchField value={search} onChange={setSearch} label="Search lessons" placeholder={`search ${activeWorld}`} />
      {search && <p className="m1-t11" style={{ marginTop: 8 }}>{filteredMissions.length} result{filteredMissions.length !== 1 ? "s" : ""}</p>}

      {grouped.map(({ chapter, paths }) => {
        const slugs = allPaths.filter(p => p.chapter === chapter.slug).flatMap(p => p.missionSlugs);
        const chDone = slugs.filter(s => !!completed[s]).length;
        return (
          <section key={chapter.slug}>
            <Silk label={`${chapter.number}. ${chapter.title.toLowerCase()}`} right={`${chDone} of ${slugs.length}${chDone === slugs.length && slugs.length > 0 ? ", " + chapter.trophy.name.toLowerCase() : ""}`} />
            {paths.map(({ path, missions }) => (
              <div key={path.slug}>
                <ListRow href={`/path/${path.slug}`} led="var(--led-cobalt)" title={`path ${path.number}: ${path.title.toLowerCase()}`}
                  sub="view path" right={<Icon name="back" small className="ls-flip" />} style={{ marginTop: 12 }} />
                <div style={{ marginLeft: 14 }}>
                  {missions.filter(m => !search || filteredMissions.includes(m)).map(mission => {
                    const isDone = !!completed[mission.slug];
                    const locked = isLocked(mission, plan, gatingMode);
                    const flowLocked = isFlowMode && flowUnlockedSlugs !== null && !flowUnlockedSlugs.has(mission.slug) && !isDone;
                    const isPaid = isPaidMission(mission);
                    const right = (
                      <>
                        {isPaid && gatingMode === "paid" && !locked ? <span className="m1-tag">pro</span> : null}
                        {flowLocked || locked ? <Icon name="lock" small /> : <span className="m1-t11">{(mission as { xp?: number }).xp ?? 40} xp</span>}
                      </>
                    );
                    const led = isDone ? "var(--led-mint)" : flowLocked || locked ? "var(--ledoff)" : "var(--led-go)";
                    return flowLocked
                      ? <ListRow key={mission.slug} led={led} title={mission.title} sub={mission.tagline} right={right} style={{ opacity: 0.55 }} />
                      : <ListRow key={mission.slug} href={`/learn/${mission.slug}`} led={led} title={mission.title} sub={mission.tagline} right={right} style={locked ? { opacity: 0.55 } : undefined} />;
                  })}
                </div>
              </div>
            ))}
          </section>
        );
      })}
      {grouped.length === 0 && <div className="ls-panel" style={{ marginTop: 12 }}><span className="m1-t11">no lessons match. try a different word.</span></div>}
    </RefPage>
  );
}
