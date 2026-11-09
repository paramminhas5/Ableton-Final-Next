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
  // Inside your world only one path is open at a time: the one you're on, or the one you tap.
  const [openPath, setOpenPath] = useState<string | null>(null);
  // Deeper lessons fold under their song lesson until you ask for them (design pass, 9 Nov night).
  const [deep, setDeep] = useState<Set<string>>(new Set());
  const toggleDeep = (slug: string) => setDeep(d => { const n = new Set(d); if (n.has(slug)) n.delete(slug); else n.add(slug); return n; });
  useEffect(() => setStars(readChallenges()), []);
  useEffect(() => { const r = readPlacement(); if (r && r.skipped.length) setPlaced(r); }, []);
  useEffect(() => {
    const slug = decodeURIComponent(window.location.hash.slice(1));
    let w: WorldId | null = slug ? worldOf(slug) : null;
    if (!w) { try { w = localStorage.getItem("ccd.world") as WorldId | null; } catch { /* default */ } }
    setOpen(w ?? progress.selectedWorld ?? "fundamentals");
    if (slug) {
      const parent = w ? journey(w, {}).flatMap(p => p.lessons).find(l => l.extras.some(e => e.slug === slug)) : undefined;
      if (parent) setDeep(new Set([parent.slug]));
    }
    if (slug) { setOpenPath(null); window.setTimeout(() => document.getElementById(`l-${slug}`)?.scrollIntoView({ block: "center" }), 80); }
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
        <p className="sy-key o1"><span><i className="sy-dot" />adds a part to your song</span><span><b>+3</b>deeper, when you want more</span></p>
        {WORLD_IDS.map((w, wi) => {
          const c = worldDone(w, done);
          const isOpen = open === w;
          return (
            <button key={w} type="button" className={`sy-whead o2 ${isOpen ? "is-open" : ""}`} style={{ ["--c" as string]: WORLD_LED[w] } as CSSProperties} aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : w)}>
              <b>{wi + 1}</b>
              <span>{INFO[w].name}<small>{INFO[w].line}</small></span>
              <em>{c.done}/{c.total}</em>
              <Icon name={isOpen ? "up" : "down"} small />
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
          <span className="wg-s" style={{ fontSize: "var(--fs-4)", color: "var(--ink)" }}>song lessons go in order and each adds a part. deeper lessons are extra: open one when a part makes you curious.</span>
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
                const here = openPath ? openPath === p.slug : p.lessons.some(l => l.slug === n?.slug || l.extras.some(e => e.slug === n?.slug)) || (!n && p.number === 1);
                const tot = p.songTotal || p.lessons.length;
                const dn = p.songTotal ? p.songDone : p.lessons.filter(l => l.done).length;
                if (!here) return (
                  <button key={p.slug} type="button" className="sy-fold" aria-expanded={false} onClick={() => setOpenPath(p.slug)}>
                    <b>path {p.number}</b><span>{p.title.toLowerCase()}</span><em>{dn}/{tot}</em><Icon name="down" small />
                  </button>
                );
                return (
                  <div key={p.slug} className="sy-path">
                    <Silk label={`path ${p.number} · ${p.title.toLowerCase()}`} right={`${dn}/${tot}`} />
                    <ol className="sy-lessons" data-budget="list">
                      {p.lessons.map((l, i) => (
                        <li key={l.slug} id={`l-${l.slug}`}>
                          <div className="sy-line">
                            <Row it={l} n={i + 1} isNext={l.slug === n?.slug} sub={l.kind === "song" ? `adds ${partOf(l.slug)}` : "bonus"} />
                            {l.extras.length > 0 && <button type="button" className={`sy-more ${deep.has(l.slug) ? "is-on" : ""}`} aria-expanded={deep.has(l.slug)} aria-label={`${l.extras.length} deeper lessons on ${l.title}`} onClick={() => toggleDeep(l.slug)}><b>+{l.extras.length}</b>deeper</button>}
                          </div>
                          {l.extras.length > 0 && deep.has(l.slug) && (
                            <ol className="sy-extras" aria-label={`Go deeper on ${l.title}`}>
                              {l.extras.map(e => <li key={e.slug} id={`l-${e.slug}`}><Row it={e} small /></li>)}
                            </ol>
                          )}
                        </li>
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

function Row({ it, n, isNext, sub, small }: { it: JourneyItem; n?: number; isNext?: boolean; sub?: string; small?: boolean }) {
  const meta = [sub, it.exists ? `${minutesFor(it.slug)} min` : "coming"].filter(Boolean).join(" · ");
  const cls = `sy-row ${it.done ? "is-done" : ""} ${isNext ? "is-next" : ""} ${small ? "is-small" : ""} ${it.exists ? "" : "is-locked"}`;
  const inner = (
    <>
      <b className="sy-n">{it.done ? <Icon name="check" small /> : small ? (it.kind === "bonus" ? <span className="jv-kind is-bonus">bonus</span> : <i className="sy-sdot" />) : String(n ?? 0).padStart(2, "0")}</b>
      <span className="sy-t">{it.title.replace(/^bonus: /, "").toLowerCase()}<small>{meta}</small></span>
      {isNext ? <em className="sy-next">up next</em> : null}
    </>
  );
  return it.exists ? <Link href={`/learn/${it.slug}`} className={cls}>{inner}</Link> : <div className={cls} aria-disabled>{inner}</div>;
}
