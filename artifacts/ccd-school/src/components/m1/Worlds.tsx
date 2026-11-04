"use client";
/**
 * All lessons: the three worlds side by side (basics, producer, dj), how they connect, and the paths
 * inside each. One screen on a laptop; stacked on a phone.
 */
import Link from "next/link";
import type { CSSProperties } from "react";
import { useProgress } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import { missionAny, missionImage, nextStep, worldDone, worldSteps, WORLD_IDS, type WorldId } from "@/lib/worldOrder";
import { Icon, Silk, Switch, WORLD_LED } from "./controls";
import { DuoFilters } from "./Today";
import "./lesson.css";

const INFO: Record<WorldId, { name: string; line: string; slug: string; why: string }> = {
  fundamentals: { name: "basics", line: "sound, rhythm, melody and harmony, from zero", slug: "fundamentals", why: "start here. how music works" },
  producer: { name: "producer", line: "make your own tracks, from a kick to a finished song", slug: "producer", why: "then make it. one part per lesson" },
  dj: { name: "dj", line: "beatmatch, blend, read a room. then mix your own tracks", slug: "dj", why: "then play it out, like at a ccd night" },
};
const LOOP = ["learn", "make", "practice", "studio", "mix"];

export function Worlds() {
  const { progress } = useProgress();
  const { learnMode, setLearnMode } = useLearnMode();
  const flow = learnMode !== "classic";
  const done = progress.completedMissions;
  return (
    <div className="m1-page wd">
      <header className="wd-head">
        <Link href="/dashboard" className="m1-m" aria-label="Back" style={{ width: 44, height: 44 }}><Icon name="back" /></Link>
        <div style={{ flex: 1 }}>
          <div className="m1-t22">all lessons</div>
          <div className="m1-t11">three worlds, one song</div>
        </div>
        <div className="wd-mode">
          <Switch label="How lessons open" value={flow ? "flow" : "free"} onChange={id => setLearnMode(id === "flow" ? "flow" : "classic")}
            options={[{ id: "flow", label: "journey" }, { id: "free", label: "see all" }]} />
        </div>
      </header>
      <ol className="wd-loop" aria-label="How the parts connect">{LOOP.map((l, i) => <li key={l}><b>{i + 1}</b>{l}</li>)}</ol>

      <div className="wd-cols">
        {WORLD_IDS.map((w, wi) => {
          const c = worldDone(w, done);
          const n = nextStep(w, done);
          const m = n ? missionAny(n.slug) : undefined;
          const steps = worldSteps(w);
          const paths = Array.from(new Set(steps.map(s => s.path))).map(p => {
            const inP = steps.filter(s => s.path === p);
            return { p, title: inP[0].pathTitle, total: inP.length, done: inP.filter(s => done[s.slug]).length, cur: !!n && n.path === p };
          });
          return (
            <section key={w} className="wd-col" style={{ ["--c" as string]: WORLD_LED[w] } as CSSProperties} aria-label={INFO[w].name}>
              <div className="wd-top">
                {n && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={missionImage(n.slug, w)} alt="" style={{ filter: `url(#duo-${w})` }} />
                )}
                <div style={{ minWidth: 0 }}>
                  <div className="wd-step">{wi + 1} · {INFO[w].why}</div>
                  <div className="m1-t22">{INFO[w].name}</div>
                  <div className="m1-t11">{INFO[w].line}</div>
                </div>
              </div>
              <div className="wd-bar"><i style={{ width: `${c.total ? (c.done / c.total) * 100 : 0}%` }} /><span>{c.done}/{c.total}</span></div>
              {m && n && (
                <Link href={`/learn/${n.slug}`} className="wd-next">
                  <span><small>next lesson</small>{m.title.toLowerCase()}</span><Icon name="play" small />
                </Link>
              )}
              <Silk label="paths" right={`${paths.length}`} />
              <ul className="wd-paths">
                {paths.map((p, i) => (
                  <li key={p.p} className={p.cur ? "is-cur" : p.done === p.total ? "is-done" : ""}>
                    <b>{i + 1}</b><span>{p.title.toLowerCase()}</span><em>{p.done}/{p.total}</em>
                  </li>
                ))}
              </ul>
              <Link href={`/world/${INFO[w].slug}`} className="ls-chip wd-open">open {INFO[w].name}</Link>
            </section>
          );
        })}
      </div>

      <div className="wd-foot">
        <span className="m1-t11">already know some of this?</span>
        <Link href="/placement" className="ls-chip">find my level</Link>
      </div>
      <DuoFilters />
    </div>
  );
}
