"use client";
/**
 * Today. Four zones: your track on the screen, the next lesson, the world dial with
 * today's meter and a hear key, and the mode bar. The screen does the explaining.
 */
import "@/components/m1/lesson.css";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useProgress, DAILY_GOAL_XP } from "@/lib/progress";
import { useTrack, offerFor, previewLayer } from "@/lib/track";
import { audition, playTrack, stopTrack } from "@/lib/track-engine";
import { nextStep, worldSteps, worldDone, missionAny, missionImage, missionTools, minutesFor, WORLD_LABEL, type WorldId } from "@/lib/worldOrder";
import { CAP, GoPill, Icon, Key, Knob, Screen, Silk, Switch } from "./controls";
import { PALETTE_OPEN_EVENT } from "@/components/CommandPalette";
import { CatMark, CAT_SRC, Lanes, WeekDots } from "./shell";

const WORLD_KEY = "ccd.world";
const WORLDS: WorldId[] = ["fundamentals", "dj", "producer"];

export function Today() {
  const { progress } = useProgress();
  const { track } = useTrack();
  const [world, setWorld] = useState<WorldId>("fundamentals");
  const [sel, setSel] = useState<string | null>(null);
  const [view, setView] = useState<"world" | "track">("world");
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(-1);
  const [q, setQ] = useState("");
  const trackRef = useRef(track);
  trackRef.current = track;

  useEffect(() => {
    let w: WorldId | null = null;
    try { w = localStorage.getItem(WORLD_KEY) as WorldId | null; } catch {}
    if (!w && progress.selectedWorld) w = progress.selectedWorld;
    if (w) setWorld(w);
  }, [progress.selectedWorld]);
  useEffect(() => () => stopTrack(), []);

  const done = progress.completedMissions;
  const steps = worldSteps(world);
  const next = nextStep(world, done);
  const cur = steps.find(st => st.slug === sel) ?? next;
  const mission = cur ? missionAny(cur.slug) : undefined;
  const counts = worldDone(world, done);
  // Zones are the paths in this world, in order. Lessons are the steps in the zone you are on.
  const zones = useMemo(() => Array.from(new Set(steps.map(st => st.path))).map(path => ({ path, title: steps.find(st => st.path === path)!.pathTitle })), [steps]);
  const zi = Math.max(0, zones.findIndex(z => z.path === cur?.path));
  const inZone = steps.filter(st => st.path === zones[zi]?.path);
  const li = Math.max(0, inZone.findIndex(st => st.slug === cur?.slug));
  const ci = Math.max(0, steps.findIndex(st => st.slug === cur?.slug));
  const listRef = useRef<HTMLDivElement>(null);
  // Turning a knob scrolls the list (only the list, not the page) to the lesson you are on.
  useEffect(() => {
    const box = listRef.current;
    const row = box?.querySelector<HTMLElement>('[aria-current="true"]');
    if (box && row) box.scrollTo({ top: row.offsetTop - box.clientHeight / 2 + row.clientHeight / 2, behavior: "smooth" });
  }, [cur?.slug, world]);
  const offer = useMemo(() => (mission ? offerFor(track, mission) : null), [track, mission]);
  const todayXp = progress.dailyXp ?? 0;
  const lit = Math.min(9, Math.round((todayXp / DAILY_GOAL_XP) * 9));
  // Drum lanes show as separate rows but are one layer (one drum rack) in the track.
  const layers = new Set(track.layers.map(l => l.id.split(":")[0])).size;

  const all = useMemo(() => WORLDS.flatMap(w => worldSteps(w).map(st => ({ ...st, world: w }))), []);
  const hits = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return all.filter(st => st.title.toLowerCase().includes(t) || st.pathTitle.toLowerCase().includes(t) || (missionAny(st.slug)?.tagline ?? "").toLowerCase().includes(t)).slice(0, 8);
  }, [q, all]);

  const pickWorld = (w: WorldId) => { setWorld(w); setSel(null); try { localStorage.setItem(WORLD_KEY, w); } catch {} };
  const pickZone = (i: number) => {
    const z = zones[i];
    if (!z || i === zi) return;
    const inz = steps.filter(st => st.path === z.path);
    setSel((inz.find(st => !done[st.slug]) ?? inz[0]).slug);
  };
  const pickLesson = (i: number) => { const st = steps[i]; if (st && st.slug !== cur?.slug) setSel(st.slug); };
  const idxOf = (v: number, n: number) => Math.max(0, Math.min(n - 1, Math.round(v * (n - 1))));
  const val = (i: number, n: number) => (n > 1 ? i / (n - 1) : 0);
  const wi = WORLDS.indexOf(world);
  const short = (t: string, n = 14) => (t.length > n ? `${t.slice(0, n - 1).trim()}…` : t);

  const hear = async () => {
    if (playing) { stopTrack(); setPlaying(false); setStep(-1); return; }
    if (!layers) { if (offer) audition(previewLayer(track, offer)); return; }
    setPlaying(true);
    await playTrack(() => trackRef.current, s => setStep(s));
  };

  const isDone = !!(cur && done[cur.slug]);
  return (
    <div className="m1-page td-root">
      <header className="td-head" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CatMark />
          <span className="m1-t15" style={{ fontWeight: 600 }}>ccd school</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <WeekDots days={progress.streakDays} />
          <span style={{ fontSize: 15, fontWeight: 300, fontVariantNumeric: "tabular-nums" }}>{progress.xp}<span className="m1-t11" style={{ marginLeft: 3 }}>xp</span></span>
          <div className="td-tools">
            <button type="button" aria-label="Search lessons" onClick={() => window.dispatchEvent(new Event(PALETTE_OPEN_EVENT))}><Icon name="search" small /></button>
            <Link href="/settings" aria-label="Settings"><Icon name="settings" small /><span className="td-tl">settings</span></Link>
            <Link href="/profile" aria-label="Profile"><Icon name="user" small /></Link>
          </div>
        </div>
      </header>

      <div className="td-switch" style={{ marginTop: 6 }}>
        <Switch label="what the screen shows" value={view} onChange={id => setView(id as "world" | "track")} options={[{ id: "world", label: "lesson" }, { id: "track", label: "your track" }]} />
      </div>

      <div className="td-search" style={{ marginTop: 12 }}>
        <label className="m1-ss" htmlFor="td-q" style={{ display: "block", marginBottom: 6 }}>find a lesson</label>
        <input id="td-q" type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="kick, hats, eq, mixing..." autoComplete="off"
          style={{ width: "100%", height: 46, borderRadius: 12, border: "1px solid var(--print)", background: "var(--deck2)", color: "var(--ink)", padding: "0 14px", font: "400 16px Outfit, system-ui" }} />
        {q.trim() && (
          <div role="list" style={{ marginTop: 8, display: "grid", gap: 6 }}>
            {hits.length ? hits.map(h => (
              <Link key={h.slug} role="listitem" href={`/learn/${h.slug}`} className="m1-m is-wide" style={{ height: 52, justifyContent: "space-between", padding: "0 14px", textAlign: "left" }}>
                <span style={{ textTransform: "lowercase", fontWeight: 500 }}>{h.title}</span>
                <span className="m1-t11">{WORLD_LABEL[h.world]} · {h.pathTitle.toLowerCase()}</span>
              </Link>
            )) : <div className="m1-ss">no lesson called that. try a shorter word.</div>}
          </div>
        )}
      </div>

      <div className="td-left">
      {view === "world" ? (
        <Screen style={{ marginTop: 8 }} key={cur?.slug}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={CAT_SRC} alt="" className="m1-dancing" style={{ position: "absolute", right: 16, top: 14, width: 66 }} />
          <div className="m1-ss">{WORLD_LABEL[world]} · {zones[zi]?.title.toLowerCase()}</div>
          <div className="m1-t22 td-pop" style={{ marginTop: 8, maxWidth: 230, textTransform: "lowercase" }}>{mission?.title ?? "all done"}</div>
          <div className="m1-ss td-pop" style={{ marginTop: 8, color: "var(--disp-ink)" }}>lesson {li + 1} of {inZone.length} · zone {zi + 1} of {zones.length} · {isDone ? "done" : cur ? `${minutesFor(cur.slug)} min` : ""}</div>
          <div style={{ marginTop: 14, display: "flex", gap: 3 }} role="img" aria-label={`${counts.done} of ${counts.total} lessons done`}>
            {Array.from({ length: 24 }, (_, i) => (
              <span key={i} style={{ flex: 1, height: 8, borderRadius: 2, background: i < Math.round((counts.done / Math.max(1, counts.total)) * 24) ? "#5EEAC1" : "#232326" }} />
            ))}
          </div>
          <div className="m1-ss" style={{ marginTop: 8 }}>{counts.done} of {counts.total} {WORLD_LABEL[world]} lessons done{layers ? ` · your track has ${layers} ${layers === 1 ? "layer" : "layers"}` : ""}</div>
        </Screen>
      ) : (
      <Screen style={{ marginTop: 8 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CAT_SRC} alt="" className={playing ? "m1-dancing" : ""} style={{ position: "absolute", right: 16, top: 14, width: layers ? 66 : 92 }} />
        <div className="m1-ss">your track</div>
        {layers ? (
          <>
            <div className="m1-t36" style={{ marginTop: 8 }}>{layers} {layers === 1 ? "layer" : "layers"}</div>
            <div style={{ display: "flex", gap: 14, marginTop: 10 }}>
              <span className="m1-ss" style={{ color: "var(--disp-ink)" }}>{track.bpm} bpm</span>
              <span className="m1-ss" style={{ color: "var(--disp-ink)" }}>a minor</span>
              <span className="m1-ss" style={{ color: "var(--disp-ink)" }}>{playing ? `step ${step + 1}` : "1 bar loop"}</span>
            </div>
          </>
        ) : (
          <>
            <div className="m1-t22" style={{ marginTop: 8, maxWidth: 200 }}>every lesson adds a layer</div>
            <div className="m1-ss" style={{ marginTop: 8 }}>finish one to start your track</div>
          </>
        )}
        <div style={{ marginTop: 20 }}>
          <Lanes track={track} next={offer && offer.isNew ? offer : null} playhead={playing ? step : -1} />
        </div>
        {offer && mission && (
          <div className="m1-ss" style={{ marginTop: 8 }}>
            {offer.isNew ? `${offer.kind} joins after ` : `${offer.kind} changes after `}
            <span style={{ color: "#FF6FAE" }}>{mission.title.toLowerCase()}</span>
          </div>
        )}
      </Screen>
      )}

      {cur && mission && (
        <Link href={`/learn/${cur.slug}`} className="m1-m is-wide" key={`c-${cur.slug}`} style={{ marginTop: 14, height: 108, justifyContent: "flex-start", gap: 14, padding: "0 12px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={missionImage(cur.slug, world)} alt="" className="td-pop" style={{ width: 72, height: 72, borderRadius: 10, objectFit: "cover", flex: "none", filter: `url(#duo-${world})`, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.2), 0 1px 0 var(--hi)" }} />
          <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
            <div className="m1-eng" style={{ fontSize: 11, fontWeight: 500 }}>{isDone ? "go again" : cur.slug === next?.slug ? "up next" : "start this"} · {WORLD_LABEL[world]} {String(cur.index + 1).padStart(2, "0")}</div>
            <div className="m1-t22" style={{ marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textTransform: "lowercase" }}>{mission.title}</div>
            <div className="m1-t11" style={{ marginTop: 4 }}>{minutesFor(cur.slug)} min · {missionTools(cur.slug).join(" · ")}</div>
          </div>
          <span className="m1-cap is-go" style={{ width: 62, flex: "none" }}><Icon name="play" /></span>
        </Link>
      )}
      </div>

      <div className="td-right">
      <Silk label="turn to choose" right="or tap a lesson below" />
      <div className="td-knobs">
        <div><span className="m1-ss">world</span>
          <Knob label={WORLD_LABEL[world]} color={CAP.go} size={64} height={170} led="var(--led-go)" detents={3} value={val(wi, 3)} defaultValue={val(wi, 3)} onChange={v => { const w = WORLDS[idxOf(v, 3)]; if (w !== world) pickWorld(w); }} />
        </div>
        <div><span className="m1-ss">zone</span>
          <Knob label={short(zones[zi]?.title.toLowerCase() ?? "-")} color={CAP.navy} size={64} height={170} led="var(--led-mint)" detents={zones.length} value={val(zi, zones.length)} defaultValue={val(zi, zones.length)} onChange={v => pickZone(idxOf(v, zones.length))} />
        </div>
        <div><span className="m1-ss">lesson {ci + 1} of {steps.length}</span>
          <Knob label={short(mission?.title.toLowerCase() ?? "-", 16)} color={CAP.grey} size={64} height={170} led="var(--led-cobalt, #8CA3FF)" detents={steps.length} value={val(ci, steps.length)} defaultValue={val(ci, steps.length)} onChange={v => pickLesson(idxOf(v, steps.length))} />
        </div>
      </div>
      <div className="m1-g" style={{ marginTop: 12 }}>
        <GoPill onClick={hear} disabled={!layers && !offer} style={{ gridColumn: "1 / -1" }} ariaLabel={playing ? "Stop your song" : layers ? "Play the song you are building" : "Hear what the next lesson adds"}><Icon name={playing ? "stop" : "hear"} small />{playing ? "stop" : layers ? "play my song" : "hear what's next"}</GoPill>
      </div>
      <div className="td-jump">
        <Silk label="jump to" />
        <div className="m1-g">
          <Key label="studio" href="/studio" ariaLabel="Open the studio"><Icon name="studio" /></Key>
          <Key label="ear gym" href="/gym" ariaLabel="Open the ear gym"><Icon name="hear" /></Key>
          <Key label="review" href="/review" ariaLabel="Review what you learned"><Icon name="reset" /></Key>
          <Key label="all worlds" href="/worlds" ariaLabel="See all worlds"><Icon name="menu" /></Key>
        </div>
      </div>
      </div>
      <section className="td-all" aria-label={`${WORLD_LABEL[world]} lessons`}>
        <Silk label={`${WORLD_LABEL[world]} lessons`} right={`${counts.done} of ${counts.total} done`} />
        <div className="td-list" ref={listRef} role="listbox" aria-label="Lessons">
          {steps.map((st, i) => {
            const d = !!done[st.slug];
            const on = st.slug === cur?.slug;
            return (
              <div key={st.slug}>
                {(i === 0 || steps[i - 1].path !== st.path) && <div className="m1-ss td-zone">{st.pathTitle.toLowerCase()}</div>}
                <button type="button" role="option" aria-selected={on} aria-current={on ? "true" : undefined} className={`m1-m is-wide td-row ${on ? "is-sel" : ""}`} onClick={() => setSel(st.slug)}>
                  <span className="m1-t11" style={{ width: 24, color: d ? "#5EEAC1" : undefined }}>{d ? "✓" : String(i + 1).padStart(2, "0")}</span>
                  <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textTransform: "lowercase", fontWeight: on ? 600 : 400, textAlign: "left" }}>{st.title}</span>
                  {on && <span className="m1-t11" style={{ color: "#FF6FAE" }}>{d ? "done" : "selected"}</span>}
                </button>
              </div>
            );
          })}
        </div>
      </section>
      <DuoFilters />
    </div>
  );
}

/** Duotone tints for lesson pictures: ink plus the world colour. */
export function DuoFilters() {
  const tints: Record<string, [number, number, number]> = { producer: [1, 0.36, 0.64], dj: [0.55, 0.64, 1], fundamentals: [0.36, 0.92, 0.76] };
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
      {Object.entries(tints).map(([k, [r, g, b]]) => (
        <filter key={k} id={`duo-${k}`} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 1 0" />
          <feComponentTransfer>
            <feFuncR type="table" tableValues={`.05 ${r}`} />
            <feFuncG type="table" tableValues={`.05 ${g}`} />
            <feFuncB type="table" tableValues={`.06 ${b}`} />
          </feComponentTransfer>
        </filter>
      ))}
    </svg>
  );
}
