"use client";
/**
 * All lessons: the three worlds side by side (basics, producer, dj), how they connect, and the paths
 * inside each. One screen on a laptop; stacked on a phone.
 */
import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { readPlacement, type PlaceResult } from "@/lib/placement";
import { CHALLENGES, readChallenges, worldStars } from "@/lib/worldChallenge";
import { Stars } from "./Stars";
import { useProgress } from "@/lib/progress";
import { journey, missionAny, missionImage, nextStep, partOf, worldDone, WORLD_IDS, type WorldId } from "@/lib/worldOrder";
import { Icon, Silk, WORLD_LED } from "./controls";
import { DuoFilters } from "./Today";
import "./lesson.css";
import "./placement.css";

const INFO: Record<WorldId, { name: string; line: string; slug: string; why: string }> = {
  fundamentals: { name: "basics", line: "sound, rhythm, melody and harmony, from zero", slug: "fundamentals", why: "start here. how music works" },
  producer: { name: "producer", line: "make your own tracks, from a kick to a finished song", slug: "producer", why: "then make it. one part per lesson" },
  dj: { name: "dj", line: "beatmatch, blend, read a room. then mix your own tracks", slug: "dj", why: "then play it out, like at a ccd night" },
};
const LOOP = ["learn", "make", "practice", "studio", "mix"];

const WORLD_INFO_NAME: Record<WorldId, string> = { fundamentals: "basics", producer: "producer", dj: "dj" };

export function Worlds() {
  const { progress } = useProgress();
  const [placed, setPlaced] = useState<PlaceResult | null>(null);
  const [stars, setStars] = useState<ReturnType<typeof readChallenges>>({});
  useEffect(() => setStars(readChallenges()), []);
  useEffect(() => { const r = readPlacement(); if (r && r.skipped.length) setPlaced(r); }, []);
  const done = progress.completedMissions;
  return (
    <div className="m1-page wd">
      <header className="wd-head">
        <Link href="/dashboard" className="m1-m" aria-label="Back" style={{ width: 44, height: 44 }}><Icon name="back" /></Link>
        <div style={{ flex: 1 }}>
          <div className="m1-t22">all lessons</div>
          <div className="m1-t11">three worlds, one song</div>
        </div>
      </header>
      {!placed && Object.keys(done).length < 3 ? (
        <Link href="/placement" className="wc-card pl-offer" style={{ ["--c" as string]: "var(--led-mint)" } as CSSProperties}>
          <span>already make music? find your level<small>about 3 minutes, by ear and by hand. we start you where it gets new.</small></span><Icon name="play" small />
        </Link>
      ) : null}
      <ol className="wd-loop" aria-label="How the parts connect">{LOOP.map((l, i) => <li key={l}><b>{i + 1}</b>{l}</li>)}</ol>

      <div className="wd-cols">
        {WORLD_IDS.map((w, wi) => {
          const c = worldDone(w, done);
          const n = nextStep(w, done);
          const m = n ? missionAny(n.slug) : undefined;
          const paths = journey(w, done).map(p => ({
            p: p.slug, title: p.title,
            total: p.songTotal || p.lessons.length,
            done: p.songTotal ? p.songDone : p.lessons.filter(l => l.done).length,
            extra: p.extraTotal,
            cur: !!n && p.lessons.some(l => l.slug === n.slug),
          }));
          return (
            <section key={w} className="wd-col" style={{ ["--c" as string]: WORLD_LED[w] } as CSSProperties} aria-label={INFO[w].name}>
              <div className="wd-top">
                {n && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={missionImage(n.slug, w, "sm")} alt="" width={64} height={64} loading="lazy" decoding="async" style={{ filter: `url(#duo-${w})` }} />
                )}
                <div style={{ minWidth: 0 }}>
                  <div className="wd-step">{wi + 1} · {INFO[w].why}</div>
                  <div className="m1-t22">{INFO[w].name}</div>
                  <div className="m1-t11">{INFO[w].line}</div>
                </div>
              </div>
              <div className="wd-bar"><i style={{ width: `${c.total ? (c.done / c.total) * 100 : 0}%` }} /><span>{c.done}/{c.total} parts</span></div>
              {m && n && (
                <Link href={`/learn/${n.slug}`} className="wd-next">
                  <span><small>next · adds {partOf(n.slug)}</small>{m.title.toLowerCase()}</span><Icon name="play" small />
                </Link>
              )}
              <Silk label="paths" right={`${paths.length}`} />
              <ul className="wd-paths">
                {paths.map((p, i) => (
                  <li key={p.p} className={p.cur ? "is-cur" : p.done === p.total ? "is-done" : ""}>
                    <b>{i + 1}</b><span>{p.title}<small className="jv-sub"> · {p.extra} deeper</small></span><em>{p.done}/{p.total}</em>
                  </li>
                ))}
              </ul>
              {(() => {
                const st = worldStars(stars[w], w);
                return (
                  <Link href={`/world/${w}/challenge`} className="wc-card" aria-label={`${INFO[w].name} challenge: ${st.main} of 3 stars, bonus ${st.bonus} of ${st.bonusOf}`}>
                    <span>end of world challenge<small>{st.main || st.bonus ? `bonus ${st.bonus} of ${st.bonusOf}` : `after ${CHALLENGES[w].afterTitle}`}</small></span>
                    <Stars n={st.main} />
                  </Link>
                );
              })()}
              <Link href={`/world/${INFO[w].slug}`} className="ls-chip wd-open">open {INFO[w].name}</Link>
            </section>
          );
        })}
      </div>

      <div className="wd-foot">
        <span className="m1-t11">{placed ? `you started ${WORLD_INFO_NAME[placed.world]} at ${partOf(placed.slug)}, from find your level` : "already make music?"}</span>
        <Link href="/placement" className="ls-chip">{placed ? "take it again" : "find your level"}</Link>
      </div>
      <DuoFilters />
    </div>
  );
}
