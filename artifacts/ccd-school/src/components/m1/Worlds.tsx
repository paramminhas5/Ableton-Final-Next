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
import { journey, minutesFor, missionAny, nextStep, partOf, worldDone, worldOf, WORLD_IDS, type JourneyItem, type JourneyLesson, type WorldId } from "@/lib/worldOrder";
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
      <TopBar title="syllabus" sub={`${all.song} song lessons · ${all.deeper} deeper`} back="/dashboard" screen="syllabus" />
      <div className="fr-l">
        <p className="sy-key o1"><span><i className="sm-k is-done" />done</span><span><i className="sm-k is-next" />next</span><span><i className="sm-k" />to come</span><span><b>+2</b>deeper lessons</span></p>
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
          <span className="wg-s" style={{ fontSize: "var(--fs-4)", color: "var(--ink)" }}>each pad is a lesson, named for the part it adds to your song. go left to right, top to bottom. deeper lessons are extra: open one when a part makes you curious.</span>
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
                const selSlug = pick ?? n?.slug;
                const sel = p.lessons.find(l => l.slug === selSlug);
                return (
                  <div key={p.slug} className="sm-path">
                    <div className="sm-head"><b>{p.number}</b><span>{p.title.toLowerCase()}</span><em>{dn}/{tot}</em></div>
                    <ol className="sm-row" data-budget="list" aria-label={`path ${p.number}, ${p.title}`} style={{ ["--n" as string]: Math.min(5, Math.max(4, p.lessons.length)) } as CSSProperties}>
                      {p.lessons.map((l, i) => {
                        const part = l.kind === "song" ? partOf(l.slug) : l.title.replace(/^bonus: /, "").toLowerCase();
                        const isNext = l.slug === n?.slug && !l.done;
                        return (
                          <li key={l.slug} id={`l-${l.slug}`}>
                            <button type="button" className={`sm-pad ${l.done ? "is-done" : ""} ${l.covered ? "is-covered" : ""} ${isNext ? "is-next" : ""} ${l.slug === selSlug ? "is-sel" : ""} ${l.exists ? "" : "is-locked"}`}
                              style={{ ["--pc" as string]: partColor(part) } as CSSProperties} aria-pressed={l.slug === selSlug} aria-label={`${l.title}: adds ${part}${l.covered ? ", covered in basics" : l.done ? ", done" : isNext ? ", up next" : ""}`} onClick={() => setPick(l.slug)}>
                              <small>{p.number}.{i + 1}</small>
                              <span>{short(part)}</span>
                              {l.extras.length ? <em aria-hidden>+{l.extras.length}</em> : null}
                            </button>
                          </li>
                        );
                      })}
                    </ol>
                    {sel ? <Detail it={sel} isNext={sel.slug === n?.slug} /> : null}
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

const short = (t: string) => (t.length > 18 ? `${t.split(/ and |, /)[0]}` : t);
function partColor(part: string): string {
  const w = part.toLowerCase();
  const k = (Object.keys(KIND) as (keyof typeof KIND)[]).find(x => w.includes(x)) ?? (w.includes("snare") ? "clap" : w.includes("synth") || w.includes("melody") || w.includes("note") ? "lead" : w.includes("chord") || w.includes("harmony") ? "chords" : null);
  return k ? KIND[k].color : "var(--c)";
}

/** The lesson under the pad you tapped: what it adds, how long, the key to start it and its deeper lessons. */
function Detail({ it, isNext }: { it: JourneyLesson; isNext: boolean }) {
  const part = it.kind === "song" ? partOf(it.slug) : "";
  return (
    <div className="sm-detail" style={{ ["--pc" as string]: partColor(part || "bonus") } as CSSProperties}>
      {it.exists ? (
        <Link href={`/learn/${it.slug}`} className="sm-go">
          <span className="sm-gotx">
            <small>{it.covered ? (it.covered === "tempo-bpm" ? "you set your tempo in lesson 1 · open it anyway" : "covered in basics · open it anyway") : it.done ? "done · go again" : isNext ? "up next" : "lesson"} · {minutesFor(it.slug)} min</small>
            <b>{it.title.replace(/^bonus: /, "").toLowerCase()}</b>
            <span>{part ? `adds ${part} to your song` : "a bonus round, nothing added"}</span>
          </span>
          <span className={`m1-cap ${isNext ? "is-go" : ""}`} style={{ width: 52, height: 52, flex: "none" }}><Icon name={it.done ? "loop" : "play"} small /></span>
        </Link>
      ) : <div className="sm-go is-locked"><span className="sm-gotx"><b>{it.title.toLowerCase()}</b><span>coming soon</span></span></div>}
      {it.extras.length ? (
        <div className="sm-deeper">
          <span className="sm-dl">go deeper on {part || "this"}, when you want</span>
          <ul>
            {it.extras.map(e => (
              <li key={e.slug} id={`l-${e.slug}`}>
                {e.exists
                  ? <Link href={`/learn/${e.slug}`} className={`sm-chip ${e.done ? "is-done" : ""}`}>{e.done ? <Icon name="check" small /> : null}{e.title.replace(/^bonus: /, "").toLowerCase()}<small>{minutesFor(e.slug)} min</small></Link>
                  : <span className="sm-chip is-locked">{e.title.toLowerCase()}<small>coming</small></span>}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
