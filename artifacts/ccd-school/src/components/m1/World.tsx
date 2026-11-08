"use client";
/**
 * One world, two ways to see it (design/curriculum.md):
 * - song: the world as your song, one lane per part a song lesson gives you, lit when you've made it.
 * - list: paths, and in the path you pick its song lessons with their deeper lessons and bonus rounds.
 * Nothing is locked. Lessons still to be made show as "coming"; lessons not yet rebuilt as "old version".
 */
import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useProgress } from "@/lib/progress";
import { journey, missionAny, missionImage, minutesFor, nextStep, partOf, worldDone, WORLD_LABEL, type JourneyItem, type JourneyLesson, type WorldId } from "@/lib/worldOrder";
import { GoPill, Icon, Screen, Silk, Switch, WORLD_LED } from "./controls";
import { SongStrip } from "./FileLesson";
import { DuoFilters } from "./Today";
import { readChallenges } from "@/lib/worldChallenge";
import { Stars } from "./Stars";
import "./lesson.css";
import "./placement.css";

const ABOUT: Record<WorldId, { line: string; then: string }> = {
  fundamentals: { line: "a beat, notes, a scale, chords and a bass, and the ears to hear them. every lesson adds to your song.", then: "then: producer" },
  producer: { line: "make your song sound good: your own kick, bass that makes room, a shaped synth, the mix and the drop.", then: "then: dj, playing your song out" },
  dj: { line: "play your song out with other tracks: match, blend, read the room, record a set.", then: "the last step: a ccd night" },
};

type View = "song" | "list";
const VIEW_KEY = "ccd.journey.view";

function Tag({ it }: { it: JourneyItem }) {
  if (!it.exists) return <em className="jv-tag is-coming">coming</em>;
  if (!it.rebuilt) return <em className="jv-tag">old version</em>;
  return null;
}

export function World({ world }: { world: WorldId }) {
  const { progress } = useProgress();
  const done = progress.completedMissions;
  const paths = useMemo(() => journey(world, done), [world, done]);
  const next = nextStep(world, done);
  const count = worldDone(world, done);
  const [view, setView] = useState<View>("song");
  const [chStars, setChStars] = useState(0);
  useEffect(() => setChStars(readChallenges()[world]?.main ?? 0), [world]);
  useEffect(() => { try { const v = localStorage.getItem(VIEW_KEY); if (v === "list" || v === "song") setView(v); } catch { /* default */ } }, []);
  const pick = (v: View) => { setView(v); try { localStorage.setItem(VIEW_KEY, v); } catch { /* ignore */ } };
  const [sel, setSel] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => { const i = paths.findIndex(p => p.lessons.some(l => l.slug === next?.slug)); if (i >= 0) setSel(i); }, [next?.slug, paths]);
  const led = WORLD_LED[world];
  const nm = next ? missionAny(next.slug) : undefined;
  const path = paths[sel];
  const toList = (pathIdx: number, slug: string) => { setSel(pathIdx); setOpen(slug); pick("list"); };

  return (
    <div className="m1-page wv" style={{ ["--c" as string]: led } as CSSProperties}>
      <header className="wd-head">
        <Link href="/worlds" className="m1-m" aria-label="All worlds" style={{ width: 44, height: 44 }}><Icon name="back" /></Link>
        <div style={{ flex: 1 }}>
          <div className="m1-t22">{WORLD_LABEL[world]}</div>
          <div className="m1-t11">{paths.length} paths · {count.total} song lessons · {paths.reduce((n, p) => n + p.extraTotal, 0)} to go deeper</div>
        </div>
        <div className="wd-mode jv-mode"><Switch label="How to see this world" value={view} onChange={id => pick(id as View)} options={[{ id: "song", label: "song" }, { id: "list", label: "list" }]} /></div>
      </header>

      <div className="wv-cols" data-view={view}>
        <section className="wv-left">
          <Screen>
            {next && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={missionImage(next.slug, world, "md")} alt="" decoding="async" className="wv-img" style={{ filter: `url(#duo-${world})` }} />
            )}
            <div className="m1-ss">{ABOUT[world].then}</div>
            <p className="wv-about">{ABOUT[world].line}</p>
            <div className="wd-bar"><i style={{ width: `${count.total ? (count.done / count.total) * 100 : 0}%` }} /><span>{count.done}/{count.total} parts</span></div>
          </Screen>
          {nm && next && (
            <div className="wv-next">
              <div className="m1-t11">next · adds {partOf(next.slug)} · {minutesFor(next.slug)} min</div>
              <div className="m1-t22">{nm.title.toLowerCase()}</div>
              <div style={{ height: 64, marginTop: 10 }}><GoPill href={`/learn/${next.slug}`} style={{ height: 64, width: "100%" }}>start <Icon name="play" small /></GoPill></div>
            </div>
          )}
          <Link href={`/world/${world}/challenge`} className="wc-card">
            <span>end of world challenge<small>a match and a copy on your own song, for stars</small></span><Stars n={chStars} />
          </Link>
        </section>

        {view === "song" ? (
          <section className="jv-song" aria-label="Your song in this world">
            <SongStrip />
            {paths.map((p, pi) => (
              <div key={p.slug} className="jv-sec">
                <Silk label={`path ${p.number} · ${p.title}`} right={p.songTotal ? `${p.songDone}/${p.songTotal}` : "bonus"} />
                <ol className="jv-lanes">
                  {p.lessons.map(l => <Lane key={l.slug} l={l} isNext={l.slug === next?.slug} onExtras={() => toList(pi, l.slug)} />)}
                </ol>
              </div>
            ))}
          </section>
        ) : (
          <>
            <section className="wv-mid" aria-label="Paths">
              <Silk label="paths" right={`${paths.length}`} />
              <ul className="wv-paths" role="listbox" aria-label="Paths">
                {paths.map((p, i) => {
                  const tot = p.songTotal || p.lessons.length;
                  const dn = p.songTotal ? p.songDone : p.lessons.filter(l => l.done).length;
                  return (
                    <li key={p.slug}>
                      <button type="button" role="option" aria-selected={i === sel} className={`wv-path ${i === sel ? "is-sel" : ""} ${dn === tot ? "is-done" : ""}`} onClick={() => setSel(i)}>
                        <b>path {p.number}</b><span>{p.title}<small className="jv-sub">{p.songTotal ? `${p.songTotal} song · ${p.extraTotal} deeper` : "bonus and deeper"}</small></span><em>{dn}/{tot}</em>
                        <i className="wv-meter" style={{ width: `${tot ? (dn / tot) * 100 : 0}%` }} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="wv-right" aria-label={path ? `${path.title} lessons` : "Lessons"}>
              <Silk label={path ? path.title : "lessons"} right={path ? (path.songTotal ? `${path.songDone} of ${path.songTotal} song lessons` : "bonus and deeper") : undefined} />
              <ol className="wv-lessons" key={sel}>
                {path?.lessons.map((l, i) => (
                  <li key={l.slug} style={{ animationDelay: `${i * 50}ms` }}>
                    <Row it={l} n={i + 1} isNext={l.slug === next?.slug} sub={l.kind === "song" ? `adds ${partOf(l.slug)}` : l.does} />
                    {l.extras.length > 0 && (
                      <details className="jv-extras" open={open === l.slug || undefined}>
                        <summary>{l.extras.filter(e => e.kind === "deeper").length ? `go deeper · ${l.extras.length}` : `bonus · ${l.extras.length}`}</summary>
                        <ol>
                          {l.extras.map(e => <li key={e.slug}><Row it={e} sub={e.does} small /></li>)}
                        </ol>
                      </details>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          </>
        )}
      </div>
      <DuoFilters />
    </div>
  );
}

function Lane({ l, isNext, onExtras }: { l: JourneyLesson; isNext: boolean; onExtras: () => void }) {
  const cls = `jv-lane ${l.done ? "is-done" : ""} ${isNext ? "is-next" : ""} ${l.exists ? "" : "is-coming"} ${l.kind !== "song" ? "is-bonus" : ""}`;
  const body = (
    <>
      <i className="jv-led" aria-hidden />
      <span className="jv-part">{l.kind === "song" ? partOf(l.slug) : l.title.replace(/^bonus: /, "")}<small>{l.kind === "song" ? l.title : "bonus round"}</small></span>
      <span className="jv-clip" aria-hidden>{Array.from({ length: 8 }, (_, i) => <b key={i} />)}</span>
      <span className="jv-tagcell"><Tag it={l} /></span>
    </>
  );
  return (
    <li className="jv-row">
      {l.exists
        ? <Link href={`/learn/${l.slug}`} className={cls} aria-label={`${l.title}${l.done ? ", in your song" : isNext ? ", up next" : ""}`}>{body}</Link>
        : <div className={cls} aria-label={`${l.title}, coming`}>{body}</div>}
      {l.extras.length > 0
        ? <button type="button" className="jv-more" onClick={onExtras} aria-label={`${l.extras.length} more on ${l.title}`}><b>+{l.extras.length}</b><small>deeper</small></button>
        : <span className="jv-more is-none" aria-hidden />}
    </li>
  );
}

function Row({ it, n, isNext, sub, small }: { it: JourneyItem; n?: number; isNext?: boolean; sub?: string; small?: boolean }) {
  const cls = `wv-lesson ${it.done ? "is-done" : ""} ${isNext ? "is-next" : ""} ${it.exists ? "" : "is-locked"} ${small ? "is-small" : ""}`;
  const inner = (
    <>
      <b>{it.done ? <Icon name="check" small /> : small ? <span className={`jv-kind is-${it.kind}`}>{it.kind}</span> : String(n ?? 0).padStart(2, "0")}</b>
      <span>{it.title.replace(/^bonus: /, "")}<small>{sub}{it.exists ? ` · ${minutesFor(it.slug)} min` : ""}{isNext ? " · up next" : ""}</small></span>
      <Tag it={it} />
      {it.exists && <Icon name="play" small />}
    </>
  );
  return it.exists ? <Link href={`/learn/${it.slug}`} className={cls}>{inner}</Link> : <div className={cls} aria-disabled>{inner}</div>;
}
