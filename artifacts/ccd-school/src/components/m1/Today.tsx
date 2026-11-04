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
import { nextStep, worldDone, missionAny, missionImage, missionTools, minutesFor, WORLD_LABEL, type WorldId } from "@/lib/worldOrder";
import { Icon, Key, Meter, Screen, Silk, Switch } from "./controls";
import { CatMark, CAT_SRC, Lanes, WeekDots, WorldDial } from "./shell";

const WORLD_KEY = "ccd.world";

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
        </div>
      </header>

      <div className="td-switch" style={{ marginTop: 6 }}>
        <Switch label="what the screen shows" value={view} onChange={id => setView(id as "world" | "track")} options={[{ id: "world", label: "world" }, { id: "track", label: "your track" }]} />
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
        <div className="m1-m is-wide" style={{ height: 184, flexDirection: "column", justifyContent: "flex-start", paddingTop: 16 }}>
          <Meter segments={9} lit={lit} />
          <span className="m1-ml">today</span>
        </div>
        <Key wide label={playing ? "stop" : layers ? "hear track" : "hear next"} onClick={hear} disabled={!layers && !offer} ariaLabel={playing ? "Stop your track" : layers ? "Hear your track" : "Hear what the next lesson adds"} ariaPressed={playing} style={{ height: 184 }} capStyle={{ width: "64%" }}>
          <Icon name={playing ? "stop" : "hear"} />
        </Key>
      </div>
      </div>
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
