"use client";
/**
 * The syllabus as a map (10 Nov): each world's paths are rows of pads, one pad per song lesson, named by the
 * part it adds to your song and coloured like that part. Lit is done, the outlined one is next. Tap a pad to
 * see the lesson, start it, or open its deeper lessons. Replaces the long list (Param: "a lot of it needs to
 * be conveyed visually").
 *
 * Before (9 Nov): every world, path and lesson in one tree. Each song lesson (it adds a part to your
 * song) has its deeper lessons and bonus rounds right under it, so going deeper is never hidden. The world
 * you are in is open; the others fold to one row. A link to "#slug" opens that lesson's world and scrolls to it.
 */
import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { readPlacement, type PlaceResult } from "@/lib/placement";
import { CHALLENGES, readChallenges, worldStars } from "@/lib/worldChallenge";
import { Stars } from "./Stars";
import { useProgress } from "@/lib/progress";
import { journey, minutesFor, missionAny, nextStep, partOf, worldDone, worldOf, WORLD_IDS, type JourneyLesson, type WorldId } from "@/lib/worldOrder";
import { Icon, WORLD_LED } from "./controls";
import { KIND } from "@/lib/track";
import { DuoFilters } from "./Today";
import { TopBar } from "./TopBar";
import { ReviewWidget } from "./Widgets";
import "./lesson.css";
import "./placement.css";
import "./syllabus.css";

const INFO: Record<WorldId, { name: string; line: string }> = {
  fundamentals: { name: "basics", line: "beat, notes, chords, bass" },
  producer: { name: "producer", line: "your sound, the mix, the drop" },
  dj: { name: "dj", line: "mixing, then a set" },
};

export function Worlds() {
  const { progress, missionsNeedingReview } = useProgress();
  const [placed, setPlaced] = useState<PlaceResult | null>(null);
  const [stars, setStars] = useState<ReturnType<typeof readChallenges>>({});
  const [open, setOpen] = useState<WorldId | null>("fundamentals"); // a world is open from the first paint, so nothing jumps
  // The pad you tapped; until then, the lesson that is next.
  const [pick, setPick] = useState<string | null>(null);
  useEffect(() => setStars(readChallenges()), []);
  useEffect(() => { const r = readPlacement(); if (r && r.skipped.length) setPlaced(r); }, []);
  useEffect(() => {
    const slug = decodeURIComponent(window.location.hash.slice(1));
    let w: WorldId | null = slug ? worldOf(slug) : null;
    if (!w) { try { w = localStorage.getItem("ccd.world") as WorldId | null; } catch { /* default */ } }
    setOpen(w ?? progress.selectedWorld ?? "fundamentals");
    if (slug) {
      const parent = w ? journey(w, {}).flatMap(p => p.lessons).find(l => l.slug === slug || l.extras.some(e => e.slug === slug)) : undefined;
      if (parent) setPick(parent.slug);
      window.setTimeout(() => document.getElementById(`l-${parent?.slug ?? slug}`)?.scrollIntoView({ block: "center" }), 80);
    }
  }, [progress.selectedWorld]);
  const done = progress.completedMissions;
  const totals = useMemo(() => WORLD_IDS.map(w => { const ps = journey(w, {}); return { w, song: ps.reduce((n, p) => n + p.songTotal, 0), deeper: ps.reduce((n, p) => n + p.extraTotal, 0) }; }), []);
  const all = totals.reduce((a, t) => ({ song: a.song + t.song, deeper: a.deeper + t.deeper }), { song: 0, deeper: 0 });

  const openW = open ?? "fundamentals";
  const nxt = nextStep(openW, done);
  const nxtM = nxt ? missionAny(nxt.slug) : undefined;
  return (
    <div className="m1-page sy fr">
      <TopBar title="syllabus" sub={`${all.song} lessons · ${all.deeper} extras`} back="/dashboard" screen="syllabus" />
      <div className="fr-l">
        <p className="sy-key o1"><span><i className="sr-kd is-done"><Icon name="check" small /></i>done</span><span><i className="sr-kd is-next" />up next</span><span><i className="sr-kd" />to come</span><span><i className="sr-xtag">extra</i>optional, more on the same idea</span></p>
        {WORLD_IDS.map((w, wi) => {
          const c = worldDone(w, done);
          const isOpen = open === w;
          return (
            <button key={w} type="button" className={`sy-whead o2 ${isOpen ? "is-open" : ""}`} style={{ ["--c" as string]: WORLD_LED[w] } as CSSProperties} aria-pressed={isOpen} onClick={() => { setOpen(w); setPick(null); }}>
              <b>{wi + 1}</b>
              <span>{INFO[w].name}<small>{INFO[w].line}</small></span>
              <em>{c.done}/{c.total}</em>
              <i className="sy-wbar" aria-hidden><em style={{ width: `${c.total ? (c.done / c.total) * 100 : 0}%` }} /></i>
            </button>
          );
        })}
        {!placed && Object.keys(done).length < 3 ? (
          <Link href="/placement" className="wc-card pl-offer o3" style={{ ["--c" as string]: "var(--led-mint)" } as CSSProperties}>
            <span>already make music?<small>find your level in about 3 minutes</small></span><Icon name="play" small />
          </Link>
        ) : null}
        <div className="fr-side wg sy-how o4">
          <div className="wg-h"><b>how it works</b></div>
          <span className="wg-s" style={{ fontSize: "var(--fs-4)", color: "var(--ink)" }}>go top to bottom. each lesson adds one part to your song. under some lessons there are extras: optional lessons on the same idea, for when you want more.</span>
        </div>
      </div>

      <div className="fr-c">
        {WORLD_IDS.filter(w => w === open).map(w => {
          const n = nextStep(w, done);
          const paths = journey(w, done);
          const st = worldStars(stars[w], w);
          return (
            <section key={w} className="sy-body o2" style={{ ["--c" as string]: WORLD_LED[w] } as CSSProperties} aria-label={INFO[w].name}>
              {paths.map(p => {
                const tot = p.songTotal || p.lessons.length;
                const dn = p.songTotal ? p.songDone : p.lessons.filter(l => l.done).length;
                return (
                  <div key={p.slug} className="sm-path">
                    <div className="sm-head"><b>{p.number}</b><span>{p.title.toLowerCase()}</span><em>{dn}/{tot}</em></div>
                    <ol className="sr-list" data-budget="list" aria-label={`path ${p.number}, ${p.title}`}>
                      {p.lessons.map((l, i) => (
                        <Row key={l.slug} l={l} num={`${p.number}.${i + 1}`} isNext={l.slug === n?.slug && !l.done && !l.covered}
                          open={pick === l.slug} onToggle={() => setPick(pick === l.slug ? null : l.slug)} />
                      ))}
                    </ol>
                  </div>
                );
              })}
              <Link href={`/world/${w}/challenge`} className="wc-card" aria-label={`${INFO[w].name} challenge: ${st.main} of 3 stars`}>
                <span>end of world challenge<small>{st.main || st.bonus ? `bonus ${st.bonus} of ${st.bonusOf}` : `after ${CHALLENGES[w].afterTitle}`}</small></span>
                <Stars n={st.main} />
              </Link>
            </section>
          );
        })}
      </div>

      <div className="fr-r">
        {nxt && nxtM ? (
          <Link href={`/learn/${nxt.slug}`} className="wg fr-side sy-up" style={{ ["--c" as string]: WORLD_LED[openW] } as CSSProperties}>
            <div className="wg-h"><b>up next</b><span>{INFO[openW].name}</span></div>
            <span className="wg-t">{nxtM.title.toLowerCase()}</span>
            <span className="wg-s">adds {partOf(nxt.slug)} · {minutesFor(nxt.slug)} min</span>
            <span className="sy-upgo"><span className="m1-cap is-go is-pill" style={{ width: "100%", height: 52 }}>start <Icon name="play" small /></span></span>
          </Link>
        ) : null}
        <div className="fr-side"><ReviewWidget due={missionsNeedingReview.length} any={Object.keys(done).length > 0} /></div>
      </div>
      <DuoFilters />
    </div>
  );
}

function partColor(part: string): string {
  const w = part.toLowerCase();
  const k = (Object.keys(KIND) as (keyof typeof KIND)[]).find(x => w.includes(x)) ?? (w.includes("snare") ? "clap" : w.includes("synth") || w.includes("melody") || w.includes("note") ? "lead" : w.includes("chord") || w.includes("harmony") ? "chords" : null);
  return k ? KIND[k].color : "var(--c)";
}

/** One lesson in the road: a numbered dot, its name and what it adds, start on the next one, and its extras
 *  named right under it (10 Nov, Param: "+3 marks, i still don't know if there are any"). */
function Row({ l, num, isNext, open, onToggle }: { l: JourneyLesson; num: string; isNext: boolean; open: boolean; onToggle: () => void }) {
  const bonus = l.kind !== "song";
  const part = bonus ? "" : partOf(l.slug);
  const title = l.title.replace(/^bonus: /, "").toLowerCase();
  const state = l.done && !l.covered ? "is-done" : l.covered ? "is-covered" : isNext ? "is-next" : "";
  const sub = l.covered ? (l.covered === "tempo-bpm" ? "you set your tempo in lesson 1" : "you already did this in basics") : bonus ? "bonus round, nothing added to your song" : `adds ${part} to your song`;
  const xs = l.extras;
  const names = xs.map(e => e.title.replace(/^bonus: /, "").toLowerCase());
  const xDone = xs.filter(e => e.done).length;
  return (
    <li id={`l-${l.slug}`} className={`sr ${state} ${l.exists ? "" : "is-locked"}`} style={{ ["--pc" as string]: partColor(part || "bonus") } as CSSProperties}>
      <span className="sr-dot" aria-hidden>{l.done || l.covered ? <Icon name="check" small /> : num}</span>
      {l.exists ? (
        <Link href={`/learn/${l.slug}`} className="sr-main" aria-label={`${num} ${title}: ${sub}${l.done ? ", done" : isNext ? ", up next" : ""}`}>
          <span className="sr-t">{isNext ? <em>up next</em> : null}<b>{title}</b>{bonus ? <i className="sr-xtag">bonus</i> : null}</span>
          <small>{sub} · {minutesFor(l.slug)} min</small>
        </Link>
      ) : <span className="sr-main"><span className="sr-t"><b>{title}</b></span><small>coming soon</small></span>}
      {isNext && l.exists ? <Link href={`/learn/${l.slug}`} className="m1-cap is-go is-pill sr-go" aria-hidden tabIndex={-1}>start <Icon name="play" small /></Link> : null}
      {xs.length ? (
        <button type="button" className={`sr-x ${open ? "is-open" : ""}`} aria-expanded={open} onClick={onToggle}>
          <i className="sr-xtag">extra</i>
          <span><b>{xs.length} more on this{xDone ? `, ${xDone} done` : ""}</b>{open ? null : <small>{names.slice(0, 2).join(" · ")}{names.length > 2 ? ` · +${names.length - 2}` : ""}</small>}</span>
          <Icon name={open ? "up" : "down"} small />
        </button>
      ) : null}
      {open && xs.length ? (
        <ul className="sr-xl">
          {xs.map((e, i) => (
            <li key={e.slug} id={`l-${e.slug}`}>
              {e.exists
                ? <Link href={`/learn/${e.slug}`} className={`sr-xi ${e.done ? "is-done" : ""}`}><span>{e.done ? <Icon name="check" small /> : i + 1}</span><b>{names[i]}</b><small>{minutesFor(e.slug)} min</small></Link>
                : <span className="sr-xi is-locked"><span>{i + 1}</span><b>{names[i]}</b><small>coming</small></span>}
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}
