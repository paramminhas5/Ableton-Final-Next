import { useEffect, useRef, useState } from "react";
import { playKick, playSnare, playHat, midiToFreq, playTone, getCtx, setMasterVolume } from "@/lib/audio";

type Cell = { has: boolean; loop: number };
const TRACKS = ["DRUMS", "BASS", "CHORDS", "LEAD"];
const COLORS = ["bg-acid", "bg-hot text-bone", "bg-volt text-bone", "bg-sun"];
const SCENES = 4;

export function SessionGridSim() {
  const [grid, setGrid] = useState<Cell[][]>(() =>
    TRACKS.map(() => Array.from({ length: SCENES }, () => ({ has: true, loop: 0 })))
  );
  const [playing, setPlaying] = useState<(number | null)[]>(TRACKS.map(() => null));
  const [bar, setBar] = useState(0);
  const [running, setRunning] = useState(false);
  const [armed, setArmed] = useState(false);
  const ref = useRef({ playing: playing, bar: 0 });
  ref.current.playing = playing;

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      ref.current.bar = (ref.current.bar + 1) % 4;
      setBar(ref.current.bar);
      ref.current.playing.forEach((scene, t) => {
        if (scene == null) return;
        if (t === 0) { playKick(); if (ref.current.bar % 2 === 1) playSnare(); playHat(0.5); }
        if (t === 1) playTone(midiToFreq(36 + scene * 2), 0, 0.4, "sawtooth", 0.25);
        if (t === 2) [60, 64, 67].forEach((n) => playTone(midiToFreq(n + scene), 0, 0.4, "triangle", 0.12));
        if (t === 3) playTone(midiToFreq(72 + ref.current.bar + scene * 3), 0, 0.2, "square", 0.15);
      });
    }, 500);
    return () => clearInterval(id);
  }, [running]);

  const arm = async () => {
    const c = getCtx(); if (!c) return;
    if (c.state !== "running") { try { await c.resume(); } catch {} }
    setMasterVolume(0.85);
    setArmed(true);
  };
  const launch = (t: number, s: number) => {
    if (!armed) arm();
    // Audible tap so users hear something even when transport is stopped
    if (t === 0) playKick();
    if (t === 1) playTone(midiToFreq(36 + s * 2), 0, 0.25, "sawtooth", 0.25);
    if (t === 2) [60, 64, 67].forEach((n) => playTone(midiToFreq(n + s), 0, 0.3, "triangle", 0.12));
    if (t === 3) playTone(midiToFreq(72 + s * 3), 0, 0.18, "square", 0.15);
    setPlaying((p) => p.map((v, i) => i === t ? (v === s ? null : s) : v));
  };
  const stopAll = () => setPlaying(TRACKS.map(() => null));
  const launchScene = (s: number) => { if (!armed) arm(); setPlaying(TRACKS.map(() => s)); };
  const toggleRun = async () => { if (!armed) await arm(); setRunning((r) => !r); };

  return (
    <div className="space-y-3">
      {!armed && (
        <button onClick={arm} className="brutal-border bg-volt text-bone px-4 py-3 font-mono uppercase brutal-press w-full">▶ ENABLE AUDIO (TAP ONCE)</button>
      )}
      <div className="flex flex-wrap gap-2">
        <button onClick={toggleRun} className="brutal-border bg-acid px-3 py-2 font-mono uppercase brutal-press">{running ? "■ Stop" : "▶ Run"}</button>
        <button onClick={stopAll} className="brutal-border bg-bone px-3 py-2 font-mono uppercase brutal-press">Stop Clips</button>
        <span className="brutal-border bg-ink text-bone px-3 py-2 font-mono">BAR {bar+1}/4</span>
      </div>

      <div className="brutal-border bg-card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="brutal-border bg-ink text-bone font-mono text-xs p-2">SCENE</th>
              {TRACKS.map((t, i) => (
                <th key={t} className={`${COLORS[i]} brutal-border font-display p-2`}>{t}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: SCENES }).map((_, s) => (
              <tr key={s}>
                <td className="brutal-border bg-bone p-1">
                  <button onClick={() => launchScene(s)} className="w-full brutal-border bg-acid font-mono text-xs uppercase py-2 brutal-press">▶ {s+1}</button>
                </td>
                {TRACKS.map((_, t) => (
                  <td key={t} className="brutal-border p-1">
                    <button
                      onClick={() => launch(t, s)}
                      className={`w-full py-3 brutal-border font-mono text-xs uppercase ${playing[t] === s ? "bg-acid outline outline-4 outline-ink" : "bg-card"}`}
                    >
                      {playing[t] === s ? "▶ PLAYING" : "CLIP " + (s+1)}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
