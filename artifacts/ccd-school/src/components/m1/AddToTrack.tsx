"use client";
/**
 * End of a lesson. The screen shows what you learned and the layer it offers your track.
 * Shape it with two knobs, hear it, then add it. Nothing joins your track unless you press add.
 */
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTrack, offerFor, previewLayer, applyOffer, KIND, type Layer } from "@/lib/track";
import { playTrack, stopTrack } from "@/lib/track-engine";
import { worldOf } from "@/lib/worldOrder";
import type { Mission } from "@/content/types";
import { CAP, GoPill, Icon, Key, Knob, Screen, Silk } from "./controls";
import { CAT_SRC, Lanes } from "./shell";

export function AddToTrack({ mission, xp }: { mission: Mission; xp: number }) {
  const { track, update } = useTrack();
  const already = track.added.includes(mission.slug);
  const offer = useMemo(() => offerFor({ ...track, added: [] }, mission), [track, mission]);
  const base = useMemo(() => previewLayer(track, offer), [track, offer]);
  const [params, setParams] = useState<Layer["params"]>(base.params);
  const [added, setAdded] = useState(already);
  const [playing, setPlaying] = useState(false);
  const [touched, setTouched] = useState<{ label: string; v: number } | null>(null);
  const live = useRef({ track, params });
  live.current = { track, params };
  useEffect(() => { setParams(base.params); }, [base.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => stopTrack(), []);

  const k = KIND[offer.kind];
  const preview = () => {
    const { track: t, params: p } = live.current;
    const pv = applyOffer({ ...t, added: [] }, offer, "__preview__", undefined, p);
    return pv;
  };
  const shown = added ? track : preview();
  const selId = offer.isNew ? shown.layers[shown.layers.length - 1]?.id : offer.layerId;

  const hear = async () => {
    if (playing) { stopTrack(); setPlaying(false); return; }
    setPlaying(true);
    await playTrack(() => (added ? live.current.track : preview()));
  };

  const add = () => {
    update(t => applyOffer(t, offer, mission.slug, worldOf(mission.slug) ?? undefined, params));
    setAdded(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Screen>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CAT_SRC} alt="" className={playing ? "m1-dancing" : ""} style={{ position: "absolute", right: 16, top: 14, width: 76 }} />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span className="m1-ss">you learned</span>
        </div>
        <div className="m1-t36" style={{ marginTop: 8, maxWidth: 220, textTransform: "lowercase" }}>{mission.title}</div>
        <div className="m1-ss" style={{ marginTop: 10, color: "var(--disp-ink)" }}>
          {xp > 0 ? `+${xp} xp · ` : ""}{offer.isNew ? `new layer · ${k.label}` : `${k.label} · new pattern`}
          {touched ? ` · ${touched.label} ${Math.round(touched.v * 100)}%` : ""}
        </div>
        <div style={{ marginTop: 18 }}>
          <Lanes track={shown} sel={selId} />
        </div>
        <div className="m1-ss" style={{ marginTop: 8 }}>{added ? "in your track" : "joins your track when you add it"}</div>
      </Screen>

      {!added && (
        <>
          <Silk label="shape it first" right="the screen shows values" />
          <div className="m1-g" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {[0, 1].map(i => (
              <Knob key={i} label={k.knobs[i]} color={i === 0 ? CAP.go : CAP.navy} size={74} height={170} led="var(--led-go)"
                value={params[i]} defaultValue={k.defaults[i]}
                onChange={v => setParams(p => p.map((x, j) => (j === i ? v : x)) as Layer["params"])}
                onTouch={(label, v) => setTouched({ label, v })} />
            ))}
          </div>
        </>
      )}

      <div className="m1-g" style={{ marginTop: 12 }}>
        <Key label={playing ? "stop" : "hear"} onClick={hear} ariaPressed={playing} ariaLabel={playing ? "Stop" : "Hear it in your track"}><Icon name={playing ? "stop" : "hear"} /></Key>
        {added ? (
          <GoPill href="/studio" style={{ gridColumn: "span 3" }} ariaLabel="Open studio"><Icon name="studio" />open studio</GoPill>
        ) : (
          <GoPill onClick={add} style={{ gridColumn: "span 3" }} ariaLabel="Add to my track"><Icon name="plus" />add to my track</GoPill>
        )}
      </div>
      {!added && <Link href="/dashboard" className="m1-eng" style={{ textAlign: "center", fontSize: 12, marginTop: 12, minHeight: 0 }}>not now</Link>}
    </div>
  );
}
