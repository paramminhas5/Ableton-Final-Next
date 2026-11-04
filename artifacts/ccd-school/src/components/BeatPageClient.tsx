"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ensureAudio, getCtx, playClap, playHat, playKick, playSnare } from "@/lib/audio";
import { track } from "@/lib/analytics";
import { useProgress } from "@/lib/progress";
import { LANES, PRESETS, STEPS, countHits, stepTime, type Lane, type Pattern } from "@/lib/beat/pattern";
import { patternToMidi } from "@/lib/beat/midi";
import { GoPill, Key, Silk } from "@/components/m1/controls";
import { RefPage } from "@/components/m1/parts";
import "@/components/m1/lesson.css";

const KEY = "ccd.beat.v1";
const FIRST_BEAT_XP = 20;

const clone = (p: Pattern): Pattern => ({
  kick: [...p.kick], snare: [...p.snare], clap: [...p.clap], hat: [...p.hat], ohat: [...p.ohat],
});

function play(lane: Lane, delay: number) {
  if (lane === "kick") playKick(delay);
  else if (lane === "snare") playSnare(delay);
  else if (lane === "clap") playClap(delay);
  else playHat(delay, lane === "ohat");
}

export function BeatPageClient() {
  const { addXp } = useProgress();
  const [presetId, setPresetId] = useState(PRESETS[0].id);
  const [pattern, setPattern] = useState<Pattern>(() => clone(PRESETS[0].pattern));
  const [bpm, setBpm] = useState(PRESETS[0].bpm);
  const [swing, setSwing] = useState(PRESETS[0].swing);
  const [playing, setPlaying] = useState(false);
  const [active, setActive] = useState(-1);
  const [msg, setMsg] = useState("");

  // the scheduler reads these without re-creating its timer
  const live = useRef({ pattern, bpm, swing });
  live.current = { pattern, bpm, swing };
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setPlaying(false);
    setActive(-1);
  }, []);
  useEffect(() => stop, [stop]);

  async function start() {
    if (!(await ensureAudio())) {
      setMsg("sound is blocked. tap the page once and try again.");
      return;
    }
    const ctx = getCtx();
    if (!ctx) return;
    let step = 0;
    let barStart = ctx.currentTime + 0.08;
    setPlaying(true);
    track("beat_play", { preset: presetId });
    timer.current = setInterval(() => {
      const { pattern: p, bpm: b, swing: s } = live.current;
      while (barStart + stepTime(step, b, s) < ctx.currentTime + 0.15) {
        const at = barStart + stepTime(step, b, s);
        const delay = Math.max(0, at - ctx.currentTime);
        for (const l of LANES) if (p[l.id][step]) play(l.id, delay);
        const shown = step;
        setTimeout(() => setActive(shown), delay * 1000);
        step += 1;
        if (step >= STEPS) {
          step = 0;
          barStart += (60 / b) * 4;
        }
      }
    }, 25);
  }

  function toggle(lane: Lane, i: number) {
    setPattern((p) => {
      const n = clone(p);
      n[lane][i] = !n[lane][i];
      return n;
    });
    setMsg("");
  }

  function pick(id: string) {
    const pr = PRESETS.find((x) => x.id === id)!;
    setPresetId(id);
    setPattern(clone(pr.pattern));
    setBpm(pr.bpm);
    setSwing(pr.swing);
    setMsg("");
  }

  function exportMidi() {
    if (countHits(pattern) === 0) {
      setMsg("add some hits first. the grid is empty.");
      return;
    }
    const bytes = patternToMidi(pattern, bpm, swing, 2);
    const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: "audio/midi" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `first-beat-${bpm}bpm.mid`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    let first = false;
    try {
      first = localStorage.getItem(KEY) !== "1";
      if (first) localStorage.setItem(KEY, "1");
    } catch {}
    if (first) addXp(FIRST_BEAT_XP);
    track("beat_exported", { preset: presetId, bpm, hits: countHits(pattern) });
    setMsg(first ? `saved. +${FIRST_BEAT_XP} xp for your first beat. now drag the file into live.` : "saved. drag the file into live.");
  }

  const preset = PRESETS.find((p) => p.id === presetId)!;
  const empty = () => clone({ kick: Array(STEPS).fill(false), snare: Array(STEPS).fill(false), clap: Array(STEPS).fill(false), hat: Array(STEPS).fill(false), ohat: Array(STEPS).fill(false) });
  return (
    <RefPage title="first beat" back="/atlas" meta="make" right={`${bpm} bpm`}
      intro="tap the squares to place drum hits, press play, then save it as a midi file and drag it into ableton live.">
      <div role="group" aria-label="Starting patterns" style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
        {PRESETS.map((p) => (
          <button key={p.id} type="button" aria-pressed={presetId === p.id} onClick={() => pick(p.id)} className="m1-tag"
            style={{ cursor: "pointer", height: 30, padding: "0 12px", minHeight: 0, minWidth: 0, ...(presetId === p.id ? { background: "var(--ink)", color: "var(--c0)", borderColor: "var(--ink)" } : {}) }}>
            {p.name.toLowerCase()}
          </button>
        ))}
      </div>
      <p className="ls-sub" style={{ marginTop: 10, color: "var(--sub)", fontSize: 13 }}>{preset.note}</p>

      <section aria-label="Pattern grid">
        {LANES.map((l) => (
          <div key={l.id}>
            <Silk label={l.label.toLowerCase()} />
            {[0, 8].map((from) => (
              <div key={from} style={{ display: "grid", gridTemplateColumns: "repeat(8,1fr)", gap: 6, marginBottom: 6 }}>
                {Array.from({ length: 8 }, (_, k) => from + k).map((i) => {
                  const on = pattern[l.id][i];
                  return (
                    <button key={i} type="button" aria-pressed={on} aria-label={`${l.label} step ${i + 1}`} data-active={active === i ? "true" : undefined}
                      onClick={() => toggle(l.id, i)} className={`m1-pd ${on ? "is-lit" : ""}`}
                      style={{ height: 40, ["--c" as string]: "var(--led-mint)", ...(i % 4 === 0 && !on ? { opacity: 0.85 } : {}), ...(active === i ? { boxShadow: "0 0 0 2px var(--ink)" } : {}) }} />
                  );
                })}
              </div>
            ))}
          </div>
        ))}
      </section>

      <Silk label="feel" />
      <div className="ls-panel" style={{ flexDirection: "column", gap: 14, marginTop: 8 }}>
        <label style={{ display: "block", width: "100%", fontSize: 13 }}>
          tempo <b style={{ fontWeight: 500 }}>{bpm} bpm</b>
          <input type="range" min={60} max={200} value={bpm} onChange={(e) => setBpm(Number(e.target.value))} style={{ width: "100%" }} aria-label="Tempo in BPM" />
        </label>
        <label style={{ display: "block", width: "100%", fontSize: 13 }}>
          swing <b style={{ fontWeight: 500 }}>{Math.round(swing * 100)}%</b>
          <input type="range" min={0} max={100} value={Math.round(swing * 100)} onChange={(e) => setSwing(Number(e.target.value) / 100)} style={{ width: "100%" }} aria-label="Swing percent" />
        </label>
      </div>

      <div style={{ marginTop: 16 }}>
        <GoPill onClick={playing ? stop : start}>{playing ? "stop" : "play"}</GoPill>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
        <Key wide onClick={exportMidi} ariaLabel="Save for Live (.mid)"><span style={{ fontSize: 13, fontWeight: 500 }}>save for live</span></Key>
        <Key wide onClick={() => { setPattern(empty()); setMsg(""); }} ariaLabel="Clear"><span style={{ fontSize: 13, fontWeight: 500 }}>clear</span></Key>
      </div>
      <p role="status" className="m1-t11" style={{ marginTop: 10, minHeight: 18 }}>{msg}</p>

      <Silk label="in live" />
      <section aria-label="Using it in Live" className="ls-panel" style={{ marginTop: 8, display: "block" }}>
        <ol style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8, fontSize: 14, lineHeight: 1.5 }}>
          <li>make a midi track and drop a <a style={{ textDecoration: "underline" }} href="/atlas#drum-rack">drum rack</a> on it. load a kit from the core library.</li>
          <li>drag the .mid file onto that track. your pattern appears as a clip.</li>
          <li>set live&apos;s tempo to {bpm} and press play. kick is c1, snare d1, clap d#1, closed hat f#1, open hat a#1.</li>
          <li>if a pad plays the wrong sound, drag a different sample onto that pad. live kits order pads differently.</li>
          <li>next: <a style={{ textDecoration: "underline" }} href="/build">build the rest of the track</a>, saving and uploading as you go.</li>
        </ol>
      </section>
    </RefPage>
  );
}
