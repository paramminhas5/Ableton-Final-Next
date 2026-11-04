"use client";
/**
 * One world: what it is and your progress, its paths, and the lessons in the path you pick.
 * Three panels on a laptop, stacked on a phone.
 */
import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useProgress } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import { missionAny, missionImage, minutesFor, worldSteps, WORLD_LABEL, type WorldId } from "@/lib/worldOrder";
import { GoPill, Icon, Screen, Silk, WORLD_LED } from "./controls";
import { DuoFilters } from "./Today";
import "./lesson.css";

const ABOUT: Record<WorldId, { line: string; then: string }> = {
  fundamentals: { line: "how sound and music work: sound, rhythm, melody and harmony, from zero.", then: "then: producer" },
  producer: { line: "make your own tracks, one part per lesson, from a kick to a finished song.", then: "then: dj, mixing your own tracks" },
  dj: { line: "beatmatch, blend and read a room. then mix the tracks you produced.", then: "the last step: play it out" },
};

export function World({ world }: { world: WorldId }) {
  const { progress } = useProgress();
  const { learnMode } = useLearnMode();
  const done = progress.completedMissions;
  const steps = worldSteps(world);
  const nextIdx = Math.max(0, steps.findIndex(s => !done[s.slug]));
  const next = steps[nextIdx];
  const paths = useMemo(() => Array.from(new Set(steps.map(s => s.path))).map(p => {
    const inP = steps.filter(s => s.path === p);
    return { p, title: inP[0].pathTitle, lessons: inP, done: inP.filter(s => done[s.slug]).length };
  }), [steps, done]);
  const [sel, setSel] = useState(0);
  useEffect(() => { const i = paths.findIndex(p => p.p === next?.path); if (i >= 0) setSel(i); }, [next?.path, paths]);
  const flow = learnMode !== "classic";
  const total = steps.length;
  const doneCount = steps.filter(s => done[s.slug]).length;
  const led = WORLD_LED[world];
  const nm = next ? missionAny(next.slug) : undefined;
  const path = paths[sel];

  return (
    <div className="m1-page wv" style={{ ["--c" as string]: led } as CSSProperties}>
      <header className="wd-head">
        <Link href="/worlds" className="m1-m" aria-label="All lessons" style={{ width: 44, height: 44 }}><Icon name="back" /></Link>
        <div style={{ flex: 1 }}>
          <div className="m1-t22">{WORLD_LABEL[world]}</div>
          <div className="m1-t11">{paths.length} paths · {total} lessons</div>
        </div>
      </header>

      <div className="wv-cols">
        <section className="wv-left">
          <Screen>
            {next && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={missionImage(next.slug, world)} alt="" className="wv-img" style={{ filter: `url(#duo-${world})` }} />
            )}
            <div className="m1-ss">{ABOUT[world].then}</div>
            <p className="wv-about">{ABOUT[world].line}</p>
            <div className="wd-bar"><i style={{ width: `${total ? (doneCount / total) * 100 : 0}%` }} /><span>{doneCount}/{total}</span></div>
          </Screen>
          {nm && next && (
            <div className="wv-next">
              <div className="m1-t11">next lesson · {minutesFor(next.slug)} min</div>
              <div className="m1-t22">{nm.title.toLowerCase()}</div>
              <div style={{ height: 64, marginTop: 10 }}><GoPill href={`/learn/${next.slug}`} style={{ height: 64, width: "100%" }}>start <Icon name="play" small /></GoPill></div>
            </div>
          )}
        </section>

        <section className="wv-mid" aria-label="Paths">
          <Silk label="paths" right={`${paths.length}`} />
          <ul className="wv-paths" role="listbox" aria-label="Paths">
            {paths.map((p, i) => (
              <li key={p.p}>
                <button type="button" role="option" aria-selected={i === sel} className={`wv-path ${i === sel ? "is-sel" : ""} ${p.done === p.lessons.length ? "is-done" : ""}`} onClick={() => setSel(i)}>
                  <b>path {i + 1}</b><span>{p.title.toLowerCase()}</span><em>{p.done}/{p.lessons.length}</em>
                  <i className="wv-meter" style={{ width: `${(p.done / p.lessons.length) * 100}%` }} />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="wv-right" aria-label={path ? `${path.title} lessons` : "Lessons"}>
          <Silk label={path ? path.title.toLowerCase() : "lessons"} right={path ? `${path.done} of ${path.lessons.length} done` : undefined} />
          <ol className="wv-lessons" key={sel}>
            {path?.lessons.map((s, i) => {
              const gi = steps.indexOf(s);
              const isDone = !!done[s.slug];
              const isNext = gi === nextIdx;
              const locked = flow && gi > nextIdx && !isDone;
              const m = missionAny(s.slug);
              return (
                <li key={s.slug} style={{ animationDelay: `${i * 50}ms` }}>
                  <Link href={locked ? "#" : `/learn/${s.slug}`} aria-disabled={locked} className={`wv-lesson ${isDone ? "is-done" : ""} ${isNext ? "is-next" : ""} ${locked ? "is-locked" : ""}`} onClick={e => { if (locked) e.preventDefault(); }}>
                    <b>{isDone ? <Icon name="check" small /> : String(gi + 1).padStart(2, "0")}</b>
                    <span>{(m?.title ?? s.title).toLowerCase()}<small>{minutesFor(s.slug)} min{isNext ? " · up next" : locked ? " · opens after the one before" : ""}</small></span>
                    {!locked && <Icon name="play" small />}
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
      <DuoFilters />
    </div>
  );
}
