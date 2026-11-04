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
import { Icon, Key, Meter, Screen, Silk, Switch } from "./controls";
import { PALETTE_OPEN_EVENT } from "@/components/CommandPalette";
import { CatMark, CAT_SRC, Lanes, WeekDots, WorldDial } from "./shell";

const WORLD_KEY = "ccd.world";
const WORLDS: WorldId[] = ["fundamentals", "dj", "producer"];
const IC = { width: 40, height: 40, borderRadius: 10 } as const;

export function Today() {
  const { progress } = useProgress();
  const { track } = useTrack();
  const [world, setWorld] = useState<WorldId>("fundamentals");
  const [view, setView] = useState<"world" | "track">("world");
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(-1);
  const trackRef = useRef(track);
  trackRef.current = track;

  useEffect(() => {
    let w: WorldId | null = null;
    try { w = localStorage.getItem(WORLD_KEY) as WorldId | null; } catch {}
    if (!w && progress.selectedWorld) w = progress.selectedWorld;
    if (w) setWorld(w);
  }, [progress.selectedWorld]);
  useEffect(() => () => stopTrack(), []);

  const [q, setQ] = useState("");
  const all = useMemo(() => WORLDS.flatMap(w => worldSteps(w).map(st => ({ ...st, world: w }))), []);
  const hits = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return all.filter(st => st.title.toLowerCase().includes(t) || st.pathTitle.toLowerCase().includes(t) || (missionAny(st.slug)?.tagline ?? "").toLowerCase().includes(t)).slice(0, 8);
  }, [q, all]);
  const list = worldSteps(world);

  const pick = (w: WorldId) => { setWorld(w); try { localStorage.setItem(WORLD_KEY, w); } catch {} };

  const done = progress.completedMissions;
  const next = nextStep(world, done);
  const mission = next ? missionAny(next.slug) : undefined;
  const counts = worldDone(world, done);
  const offer = useMemo(() => (mission ? offerFor(track, mission) : null), [track, mission]);
  const todayXp = progress.dailyXp ?? 0;
  const lit = Math.min(9, Math.round((todayXp / DAILY_GOAL_XP) * 9));
  // Drum lanes show as separate rows but are one layer (one drum rack) in the track.
  const layers = new Set(track.layers.map(l => l.id.split(":")[0])).size;

  const hear = async () => {
    if (playing) { stopTrack(); setPlaying(false); setStep(-1); return; }
    if (!layers) { if (offer) audition(previewLayer(track, offer)); return; }
    setPlaying(true);
    await playTrack(() => trackRef.current, s => setStep(s));
  };

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
          <button type="button" className="m1-m" style={IC} aria-label="Search lessons" onClick={() => window.dispatchEvent(new Event(PALETTE_OPEN_EVENT))}><Icon name="search" small /></button>
          <Link href="/settings" className="m1-m" style={IC} aria-label="Settings"><Icon name="settings" small /></Link>
          <Link href="/profile" className="m1-m" style={IC} aria-label="Profile"><Icon name="user" small /></Link>
        </div>
      </header>

      <div className="td-switch" style={{ marginTop: 6 }}>
        <Switch label="what the screen shows" value={view} onChange={id => setView(id as "world" | "track")} options={[{ id: "world", label: "world" }, { id: "track", label: "your track" }]} />
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
        <Screen style={{ marginTop: 8 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={CAT_SRC} alt="" style={{ position: "absolute", right: 16, top: 14, width: 66 }} />
          <div className="m1-ss">{WORLD_LABEL[world]} world</div>
          <div className="m1-t36" style={{ marginTop: 8 }}>{counts.done}<span style={{ fontSize: 18, color: "var(--disp-sub)" }}> of {counts.total} lessons</span></div>
          <div style={{ marginTop: 14, display: "flex", gap: 3 }} role="img" aria-label={`${counts.done} of ${counts.total} lessons done`}>
            {Array.from({ length: 24 }, (_, i) => (
              <span key={i} style={{ flex: 1, height: 8, borderRadius: 2, background: i < Math.round((counts.done / Math.max(1, counts.total)) * 24) ? "#5EEAC1" : "#232326" }} />
            ))}
          </div>
          {next && mission && (
            <div className="m1-ss" style={{ marginTop: 12 }}>
              up next · <span style={{ color: "var(--disp-ink)" }}>{next.pathTitle.toLowerCase()}</span>
            </div>
          )}
          <div className="m1-ss" style={{ marginTop: 4 }}>{layers ? `your track has ${layers} ${layers === 1 ? "layer" : "layers"}` : "every lesson adds a layer to your track"}</div>
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

      {next && mission && (
        <Link href={`/learn/${next.slug}`} className="m1-m is-wide" style={{ marginTop: 14, height: 108, justifyContent: "flex-start", gap: 14, padding: "0 12px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={missionImage(next.slug, world)} alt="" style={{ width: 72, height: 72, borderRadius: 10, objectFit: "cover", flex: "none", filter: `url(#duo-${world})`, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.2), 0 1px 0 var(--hi)" }} />
          <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
            <div className="m1-eng" style={{ fontSize: 11, fontWeight: 500 }}>next lesson · {WORLD_LABEL[world]} {String(next.index + 1).padStart(2, "0")}</div>
            <div className="m1-t22" style={{ marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textTransform: "lowercase" }}>{mission.title}</div>
            <div className="m1-t11" style={{ marginTop: 4 }}>{minutesFor(next.slug)} min · {missionTools(next.slug).join(" · ")}</div>
          </div>
          <span className="m1-cap is-go" style={{ width: 62, flex: "none" }}><Icon name="play" /></span>
        </Link>
      )}

      </div>

      <div className="td-right">
      <Silk label="worlds" right="today" />
      <div className="m1-g">
        <div className="m1-m is-wide" style={{ gridColumn: "span 2", height: 184, flexDirection: "column", justifyContent: "flex-start", paddingTop: 8 }}>
          <WorldDial value={world} onChange={pick} />
          <span className="m1-ml">{counts.done} of {counts.total}</span>
        </div>
        <Link href="/daily" className="m1-m is-wide" aria-label={`Today's goal, ${lit} of 9 lit. Start a two minute quick practice`} style={{ height: 184, flexDirection: "column", justifyContent: "flex-start", paddingTop: 16 }}>
          <Meter segments={9} lit={lit} />
          <span className="m1-ml">{lit >= 9 ? "goal done" : "quick practice"}</span>
        </Link>
        <Key wide label={playing ? "stop" : layers ? "play my song" : "hear next"} onClick={hear} disabled={!layers && !offer} ariaLabel={playing ? "Stop your song" : layers ? "Play the song you are building" : "Hear what the next lesson adds"} ariaPressed={playing} style={{ height: 184 }} capStyle={{ width: "64%" }}>
          <Icon name={playing ? "stop" : "hear"} />
        </Key>
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
      <section className="td-all" aria-label={`All ${WORLD_LABEL[world]} lessons`}>
        <Silk label={`all ${WORLD_LABEL[world]} lessons`} right={`${counts.done} of ${counts.total} done`} />
        <div className="td-list">
          {list.map(st => {
            const d = !!done[st.slug];
            const isNext = next?.slug === st.slug && !d;
            return (
              <Link key={st.slug} href={`/learn/${st.slug}`} className="m1-m is-wide" aria-label={`${st.title}${d ? ", done" : ""}`} style={{ height: 56, justifyContent: "flex-start", gap: 12, padding: "0 14px", textAlign: "left" }}>
                <span className="m1-t11" style={{ width: 22, color: d ? "var(--led-mint, #5EEAC1)" : undefined }}>{d ? "✓" : String(st.index + 1).padStart(2, "0")}</span>
                <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textTransform: "lowercase", fontWeight: isNext ? 600 : 400 }}>{st.title}</span>
                <span className="m1-t11">{isNext ? "up next" : st.pathTitle.toLowerCase()}</span>
              </Link>
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
