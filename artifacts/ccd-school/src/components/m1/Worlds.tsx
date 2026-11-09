"use client";
/**
 * The syllabus (9 Nov): every world, path and lesson in one tree. Each song lesson (it adds a part to your
 * song) has its deeper lessons and bonus rounds right under it, so going deeper is never hidden. The world
 * you are in is open; the others fold to one row. A link to "#slug" opens that lesson's world and scrolls to it.
 */
import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { readPlacement, type PlaceResult } from "@/lib/placement";
import { CHALLENGES, readChallenges, worldStars } from "@/lib/worldChallenge";
import { Stars } from "./Stars";
import { useProgress } from "@/lib/progress";
import { journey, minutesFor, missionAny, nextStep, partOf, worldDone, worldOf, WORLD_IDS, type JourneyItem, type WorldId } from "@/lib/worldOrder";
import { Icon, Silk, WORLD_LED } from "./controls";
import { DuoFilters } from "./Today";
import "./lesson.css";
import "./placement.css";
import "./syllabus.css";

const INFO: Record<WorldId, { name: string; line: string }> = {
  fundamentals: { name: "basics", line: "a beat, notes, a scale, chords, a bass, and the ears to hear them" },
  producer: { name: "producer", line: "your own sound, the mix, the drop, and an export to Live" },
  dj: { name: "dj", line: "play your song out with other tracks, then a set for a ccd night" },
};

export function Worlds() {
  const { progress } = useProgress();
  const [placed, setPlaced] = useState<PlaceResult | null>(null);
  const [stars, setStars] = useState<ReturnType<typeof readChallenges>>({});
  const [open, setOpen] = useState<WorldId | null>(null);
  useEffect(() => setStars(readChallenges()), []);
  useEffect(() => { const r = readPlacement(); if (r && r.skipped.length) setPlaced(r); }, []);
  useEffect(() => {
    const slug = decodeURIComponent(window.location.hash.slice(1));
    let w: WorldId | null = slug ? worldOf(slug) : null;
    if (!w) { try { w = localStorage.getItem("ccd.world") as WorldId | null; } catch { /* default */ } }
    setOpen(w ?? progress.selectedWorld ?? "fundamentals");
    if (slug) window.setTimeout(() => document.getElementById(`l-${slug}`)?.scrollIntoView({ block: "center" }), 80);
  }, [progress.selectedWorld]);
  const done = progress.completedMissions;
  const totals = useMemo(() => WORLD_IDS.map(w => { const ps = journey(w, {}); return { w, song: ps.reduce((n, p) => n + p.songTotal, 0), deeper: ps.reduce((n, p) => n + p.extraTotal, 0) }; }), []);
  const all = totals.reduce((a, t) => ({ song: a.song + t.song, deeper: a.deeper + t.deeper }), { song: 0, deeper: 0 });

  return (
    <div className="m1-page sy">
      <header className="wd-head">
        <Link href="/dashboard" className="m1-m" aria-label="Back" style={{ width: 44, height: 44 }}><Icon name="back" /></Link>
        <div style={{ flex: 1 }}>
          <div className="m1-t22">syllabus</div>
          <div className="m1-t11">3 worlds · {all.song} song lessons · {all.deeper} deeper lessons</div>
        </div>
      </header>
      <p className="sy-how"><b>song lessons</b> each add a part to your song, in order. <b>deeper</b> lessons hang off the part they are about: open one when you want more, skip it when you don&apos;t.</p>
      {!placed && Object.keys(done).length < 3 ? (
        <Link href="/placement" className="wc-card pl-offer" style={{ ["--c" as string]: "var(--led-mint)" } as CSSProperties}>
          <span>already make music? find your level<small>about 3 minutes, by ear and by hand. we start you where it gets new.</small></span><Icon name="play" small />
        </Link>
      ) : null}

      {WORLD_IDS.map((w, wi) => {
        const c = worldDone(w, done);
        const n = nextStep(w, done);
        const isOpen = open === w;
        const paths = journey(w, done);
        const st = worldStars(stars[w], w);
        return (
          <section key={w} className={`sy-world ${isOpen ? "is-open" : ""}`} style={{ ["--c" as string]: WORLD_LED[w] } as CSSProperties} aria-label={INFO[w].name}>
            <button type="button" className="sy-whead" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : w)}>
              <b>{wi + 1}</b>
              <span>{INFO[w].name}<small>{INFO[w].line}</small></span>
              <em>{c.done}/{c.total}</em>
              <Icon name={isOpen ? "up" : "down"} small />
            </button>
            {isOpen && (
              <div className="sy-body">
                {paths.map(p => (
                  <div key={p.slug} className="sy-path">
                    <Silk label={`path ${p.number} · ${p.title.toLowerCase()}`} right={p.songTotal ? `${p.songDone}/${p.songTotal} · ${p.extraTotal} deeper` : "bonus and deeper"} />
                    <ol className="sy-lessons">
                      {p.lessons.map((l, i) => (
                        <li key={l.slug} id={`l-${l.slug}`}>
                          <Row it={l} n={i + 1} isNext={l.slug === n?.slug} sub={l.kind === "song" ? `adds ${partOf(l.slug)}` : l.does} />
                          {l.extras.length > 0 && (
                            <ol className="sy-extras" aria-label={`Go deeper on ${l.title}`}>
                              {l.extras.map(e => <li key={e.slug}><Row it={e} sub={missionAny(e.slug)?.tagline?.toLowerCase() ?? e.does} small /></li>)}
                            </ol>
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
                <Link href={`/world/${w}/challenge`} className="wc-card" aria-label={`${INFO[w].name} challenge: ${st.main} of 3 stars`}>
                  <span>end of world challenge<small>{st.main || st.bonus ? `bonus ${st.bonus} of ${st.bonusOf}` : `after ${CHALLENGES[w].afterTitle}`}</small></span>
                  <Stars n={st.main} />
                </Link>
              </div>
            )}
          </section>
        );
      })}
      <DuoFilters />
    </div>
  );
}

function Row({ it, n, isNext, sub, small }: { it: JourneyItem; n?: number; isNext?: boolean; sub?: string; small?: boolean }) {
  const cls = `sy-row ${it.done ? "is-done" : ""} ${isNext ? "is-next" : ""} ${small ? "is-small" : ""} ${it.exists ? "" : "is-locked"}`;
  const inner = (
    <>
      <b className="sy-n">{it.done ? <Icon name="check" small /> : small ? <span className={`jv-kind is-${it.kind}`}>{it.kind}</span> : String(n ?? 0).padStart(2, "0")}</b>
      <span className="sy-t">{it.title.replace(/^bonus: /, "").toLowerCase()}<small>{sub}{it.exists ? ` · ${minutesFor(it.slug)} min` : ""}</small></span>
      {isNext ? <em className="sy-next">up next</em> : null}
    </>
  );
  return it.exists ? <Link href={`/learn/${it.slug}`} className={cls}>{inner}</Link> : <div className={cls} aria-disabled>{inner}</div>;
}
