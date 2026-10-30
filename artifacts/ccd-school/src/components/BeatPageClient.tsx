"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ensureAudio, getCtx, playClap, playHat, playKick, playSnare } from "@/lib/audio";
import { track } from "@/lib/analytics";
import { useProgress } from "@/lib/progress";
import { LANES, PRESETS, STEPS, countHits, stepTime, type Lane, type Pattern } from "@/lib/beat/pattern";
import { patternToMidi } from "@/lib/beat/midi";

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
      setMsg("Sound is blocked. Tap the page once and try again.");
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
      setMsg("Add some hits first. The grid is empty.");
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
    setMsg(first ? `Saved. +${FIRST_BEAT_XP} XP for your first beat. Now drag the file into Live.` : "Saved. Drag the file into Live.");
  }

  const preset = PRESETS.find((p) => p.id === presetId)!;
  return (
    <main className="min-h-screen bg-bone">
      <div className="mx-auto w-full max-w-xl px-4 py-8 space-y-6">
        <header>
          <div className="font-mono text-[10px] uppercase opacity-70 mb-1">// FIRST BEAT</div>
          <h1 className="font-display text-4xl leading-none">MAKE A BEAT. TAKE IT TO LIVE.</h1>
          <p className="font-mono text-xs opacity-70 mt-3">
            Tap the squares to place drum hits, press play, then save it as a MIDI file and drag it into Ableton Live.
          </p>
        </header>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Starting patterns">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={presetId === p.id}
              onClick={() => pick(p.id)}
              className={`brutal-border px-3 py-2 font-mono text-xs ${presetId === p.id ? "bg-ink text-bone" : "bg-white"}`}
            >
              {p.name}
            </button>
          ))}
        </div>
        <p className="font-mono text-xs opacity-70">{preset.note}</p>

        <section className="brutal-border bg-white p-3 space-y-4" aria-label="Pattern grid">
          {LANES.map((l) => (
            <div key={l.id}>
              <div className="font-mono text-[10px] uppercase opacity-70 mb-1">{l.label}</div>
              {[0, 8].map((from) => (
                <div key={from} className="grid grid-cols-8 gap-1 mb-1">
                  {Array.from({ length: 8 }, (_, k) => from + k).map((i) => {
                    const on = pattern[l.id][i];
                    return (
                      <button
                        key={i}
                        type="button"
                        aria-pressed={on}
                        aria-label={`${l.label} step ${i + 1}`}
                        onClick={() => toggle(l.id, i)}
                        className={`h-10 brutal-border ${on ? "bg-acid" : i % 4 === 0 ? "bg-black/10" : "bg-bone"} ${active === i ? "outline outline-2 outline-ink" : ""}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </section>

        <section className="grid grid-cols-2 gap-4">
          <label className="font-mono text-xs">
            Tempo: <b>{bpm} BPM</b>
            <input type="range" min={60} max={200} value={bpm} onChange={(e) => setBpm(Number(e.target.value))} className="w-full" aria-label="Tempo in BPM" />
          </label>
          <label className="font-mono text-xs">
            Swing: <b>{Math.round(swing * 100)}%</b>
            <input type="range" min={0} max={100} value={Math.round(swing * 100)} onChange={(e) => setSwing(Number(e.target.value) / 100)} className="w-full" aria-label="Swing percent" />
          </label>
        </section>

        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={playing ? stop : start} className="brutal-border bg-acid px-5 py-3 font-display text-xl chunk-shadow">
            {playing ? "STOP" : "PLAY"}
          </button>
          <button type="button" onClick={exportMidi} className="brutal-border bg-white px-5 py-3 font-display text-xl chunk-shadow">
            SAVE FOR LIVE (.MID)
          </button>
          <button type="button" onClick={() => setPattern(clone({ kick: Array(STEPS).fill(false), snare: Array(STEPS).fill(false), clap: Array(STEPS).fill(false), hat: Array(STEPS).fill(false), ohat: Array(STEPS).fill(false) }))} className="brutal-border bg-bone px-4 py-3 font-mono text-xs">
            Clear
          </button>
        </div>
        <p role="status" className="font-mono text-xs min-h-4">{msg}</p>

        <section className="brutal-border bg-bone p-4" aria-label="Using it in Live">
          <h2 className="font-display text-2xl leading-none">IN LIVE</h2>
          <ol className="mt-3 list-decimal ml-5 space-y-1 font-mono text-xs">
            <li>Make a MIDI track and drop a <a className="underline" href="/atlas#drum-rack">Drum Rack</a> on it. Load a kit from the Core Library.</li>
            <li>Drag the .mid file onto that track. Your pattern appears as a clip.</li>
            <li>Set Live&apos;s tempo to {bpm} and press play. Kick is C1, snare D1, clap D#1, closed hat F#1, open hat A#1.</li>
            <li>If a pad plays the wrong sound, drag a different sample onto that pad. Live kits order pads differently.</li>
            <li>Next: <a className="underline" href="/build">build the rest of the track</a>, saving and uploading as you go.</li>
          </ol>
        </section>
      </div>
    </main>
  );
}
