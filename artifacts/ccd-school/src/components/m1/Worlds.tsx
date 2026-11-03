"use client";
/** All worlds: pick one, and choose how you learn (flow in order, free everything open). */
import Link from "next/link";
import { useProgress } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import { missionAny, missionImage, nextStep, worldDone, WORLD_IDS, type WorldId } from "@/lib/worldOrder";
import { Icon, Screen, Silk, Switch, WORLD_LED } from "./controls";
import { DuoFilters } from "./Today";

const INFO: Record<WorldId, { name: string; line: string; slug: string }> = {
  fundamentals: { name: "the basics", line: "sound, rhythm, melody and harmony, from zero", slug: "fundamentals" },
  dj: { name: "dj", line: "beatmatching, mixing and reading a room, on rekordbox", slug: "dj" },
  producer: { name: "make tracks", line: "synthesis and ableton live, to a finished track", slug: "producer" },
};

export function Worlds() {
  const { progress } = useProgress();
  const { learnMode, setLearnMode } = useLearnMode();
  const flow = learnMode !== "classic";
  const done = progress.completedMissions;
  return (
    <div className="m1-page">
      <header style={{ display: "flex", alignItems: "center", gap: 12, height: 48 }}>
        <Link href="/dashboard" className="m1-m" aria-label="Back" style={{ width: 44 }}><Icon name="back" /></Link>
        <div style={{ flex: 1 }}>
          <div className="m1-t22">all lessons</div>
          <div className="m1-t11">three worlds, one track</div>
        </div>
      </header>

      <Silk label="how you learn" style={{ marginTop: 6 }} />
      <Switch label="how you learn" value={flow ? "flow" : "free"} onChange={id => setLearnMode(id === "flow" ? "flow" : "classic")}
        options={[{ id: "flow", label: "flow" }, { id: "free", label: "free" }]} />
      <div className="m1-t11" style={{ marginTop: 6, textAlign: "center" }}>{flow ? "flow: in order, one lesson opens the next" : "free: every lesson is open, go where you like"}</div>

      <Silk label="pick a world" style={{ marginTop: 18 }} />
      <div style={{ display: "grid", gap: 12 }}>
        {WORLD_IDS.map(w => {
          const c = worldDone(w, done);
          const n = nextStep(w, done);
          const m = n ? missionAny(n.slug) : undefined;
          return (
            <Link key={w} href={`/world/${INFO[w].slug}`} className="m1-m is-wide" style={{ height: 112, justifyContent: "flex-start", gap: 14, padding: "0 12px" }} aria-label={`${INFO[w].name}, ${c.done} of ${c.total} done`}>
              {n && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={missionImage(n.slug, w)} alt="" style={{ width: 80, height: 80, borderRadius: 10, objectFit: "cover", flex: "none", filter: `url(#duo-${w})` }} />
              )}
              <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                <div className="m1-t22">{INFO[w].name}</div>
                <div className="m1-t11" style={{ marginTop: 4 }}>{INFO[w].line}</div>
                <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ flex: 1, height: 4, borderRadius: 2, background: "var(--ledoff)", overflow: "hidden" }}>
                    <i style={{ display: "block", height: "100%", width: `${c.total ? (c.done / c.total) * 100 : 0}%`, background: WORLD_LED[w] }} />
                  </span>
                  <span className="m1-t11">{c.done}/{c.total}</span>
                </div>
                {m && <div className="m1-t11" style={{ marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>next: {m.title.toLowerCase()}</div>}
              </div>
            </Link>
          );
        })}
      </div>

      <Screen style={{ marginTop: 18 }}>
        <div className="m1-ss">not sure where to start?</div>
        <div className="m1-t15" style={{ marginTop: 6 }}>take the five minute level check and skip what you know</div>
        <Link href="/placement" className="m1-tag" style={{ marginTop: 12, height: 34, padding: "0 14px", display: "inline-flex", color: "var(--disp-ink)", borderColor: "rgba(255,255,255,.3)" }}>find my level</Link>
      </Screen>
      <DuoFilters />
    </div>
  );
}
