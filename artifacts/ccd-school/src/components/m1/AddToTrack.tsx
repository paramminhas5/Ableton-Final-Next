"use client";
/**
 * End of a lesson. The screen shows what you learned and the layer it offers your track:
 * the line you played in try it, or the lesson's own pattern if you skipped it. Shape it
 * with two knobs, hear it on the engine, then add it. Nothing joins your track unless
 * you press add.
 */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { FLAG, OUT, display } from "@/engine";
import { offerFor, previewLayer, readTrack } from "@/lib/track";
import { applyTake, shapeKnobs, takeType, type Shape, type Take } from "@/lib/lessonTake";
import { migrateV1, paramOf, readTrackV2, toV1View, writeTrackV2, type LayerV2, type TrackV2 } from "@/lib/track2";
import { worldOf } from "@/lib/worldOrder";
import type { Mission } from "@/content/types";
import { CAP, GoPill, Icon, Key, Knob, Screen, Silk } from "./controls";
import { CAT_SRC, Lanes } from "./shell";
import { useEngineTrack } from "./useEngineTrack";
import { nameSongIfNew, settleSeed } from "@/lib/songs";

/** The lesson's own pattern as a take, for when try it was skipped. */
export function presetTake(mission: Mission): Take {
  const v1 = readTrack();
  const offer = offerFor({ ...v1, added: [] }, mission);
  const layer = previewLayer({ ...v1, added: [] }, offer);
  const one = migrateV1({ v: 1, bpm: v1.bpm, layers: [{ ...layer, sidechain: false }], added: [], updatedAt: 0 });
  return { type: takeType(offer.kind), events: one.layers[0]?.events ?? [] };
}

const NOUN: Record<string, string> = { drums: "a drum", hats: "hats", bass: "a bass line", chords: "chords", lead: "a lead line", fx: "an effect", sample: "a sample" };

export type AddKeys = { added: boolean; playing: boolean; hear: () => void; add: () => void };

export function AddToTrack({ mission, xp, take, accent, keys }: { mission: Mission; xp: number; take: Take | null; accent?: string; keys?: (k: AddKeys) => ReactNode }) {
  const [base, setBase] = useState<TrackV2 | null>(null);
  useEffect(() => setBase(readTrackV2()), []);
  const slug = mission.slug;
  const already = !!base?.added.includes(slug);
  const line = useMemo(() => (take?.events.length ? take : presetTake(mission)), [take, mission]);
  const knobs = shapeKnobs(line.type);
  const [params, setParams] = useState<Record<number, number>>(() => { try { return JSON.parse(sessionStorage.getItem(`ccd.shape.${slug}`) ?? "{}") as Record<number, number>; } catch { return {}; } });
  const [added, setAdded] = useState(false);
  const [touched, setTouched] = useState<string | null>(null);
  const [beat, setBeat] = useState(-1);

  const world = worldOf(slug) ?? undefined;
  const preview = useMemo(() => (base ? applyTake({ ...base, added: [] }, slug, line, world, params) : null), [base, slug, line, world, params]);
  const shown = added || already ? base : preview;
  const { engine, start } = useEngineTrack(shown ?? readTrackV2());
  const playing = beat >= 0;

  useEffect(() => engine.on(evs => {
    for (const e of evs) if (e.kind === OUT.pos) setBeat(e.flags & FLAG.playing ? e.beat : -1);
  }), [engine]);

  const layerOf = (t: TrackV2 | null): LayerV2 | undefined => t?.layers.find(l => l.type === line.type);
  const sel = layerOf(shown);
  const value = (s: Shape) => params[s.index] ?? (sel ? paramOf(sel, s.index) : s.spec.default);

  const hear = () => {
    start();
    if (playing) engine.stop();
    else engine.play();
  };
  const add = () => {
    const now = readTrackV2();
    const next = applyTake(now, slug, line, world, params);
    writeTrackV2(next);
    // The starter loop was ours: once your first part is in, its parts go and the song is only yours.
    if (!settleSeed()) nameSongIfNew();
    setBase(readTrackV2());
    setAdded(true);
  };

  const v1 = shown ? toV1View(shown) : null;
  const selId = v1?.layers.find(l => sel && (l.id === sel.id || l.id.startsWith(`${sel.id}:`)))?.id ?? null;
  const loopBeat = shown && playing ? (((beat % shown.loop) + shown.loop) % shown.loop) : -1;
  const playhead = loopBeat >= 0 ? Math.floor((loopBeat / (shown?.loop ?? 4)) * 16) : -1;
  const isIn = added || already;
  const what = take?.events.length ? "your line" : "the lesson's pattern";

  return (
    <div className="ls-col">
      <Screen>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CAT_SRC} alt="" className={`ls-sticker ${playing ? "m1-dancing" : ""}`} />
        <span className="m1-ss">you learned</span>
        <div className="ls-title is-big" style={{ maxWidth: 220 }}>{mission.title.toLowerCase()}</div>
        <div className="m1-ss" style={{ marginTop: 10, color: "var(--disp-ink)" }}>
          {xp > 0 ? `+${xp} xp · ` : ""}{line.type} · {what}
          {touched ? ` · ${touched}` : ""}
        </div>
        <div style={{ marginTop: 18 }}>
          {v1 && <Lanes track={v1} sel={selId} playhead={playhead} />}
        </div>
        {isIn
          ? <div className="m1-t22" style={{ marginTop: 12, color: "var(--disp-ink)" }}>great, you&apos;ve added {NOUN[line.type] ?? "a layer"} to your track.</div>
          : <div className="m1-ss" style={{ marginTop: 8 }}>joins your track when you add it</div>}
      </Screen>

      {!isIn && (
        <>
          <Silk label="shape it first" right="the screen shows values" />
          <div className="m1-g" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {knobs.map((k, i) => (
              <Knob key={k.index} label={k.spec.label} color={CAP.navy} size={74} height={170} led={accent ?? "var(--led-mint)"}
                value={value(k)} defaultValue={k.spec.default} readout={display(k.spec, value(k))}
                onChange={v => setParams(p => ({ ...p, [k.index]: v }))}
                onTouch={(label, v) => setTouched(`${label} ${display(k.spec, v)}`)} />
            ))}
          </div>
        </>
      )}

      {keys ? keys({ added: isIn, playing, hear, add }) : (
        <div className="m1-g" style={{ marginTop: 12 }}>
          <Key label={playing ? "stop" : "hear"} onClick={hear} ariaPressed={playing} ariaLabel={playing ? "Stop" : "Hear it in your track"}>
            <Icon name={playing ? "stop" : "hear"} />
          </Key>
          {isIn ? (
            <GoPill href="/studio" style={{ gridColumn: "span 3" }} ariaLabel="Open studio"><Icon name="studio" />open studio</GoPill>
          ) : (
            <GoPill onClick={add} style={{ gridColumn: "span 3" }} ariaLabel="Add to my track"><Icon name="plus" />add to my song</GoPill>
          )}
        </div>
      )}
    </div>
  );
}
