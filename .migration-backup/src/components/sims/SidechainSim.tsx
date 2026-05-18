// SidechainSim — a clear, musical example of ducking.
// Kick on every beat + sustained pad. Sidechain compressor on the pad
// ducks it on each kick so the kick punches through cleanly.
import { useEffect, useRef, useState } from "react";
import { getCtx, getMaster, midiToFreq, playKick, playTone } from "@/lib/audio";

const BPM = 100;
const BEAT = 60 / BPM;

type PresetKey = "off" | "clean" | "edm" | "extreme";
const PRESETS: Record<PresetKey, { amount: number; release: number; sc: boolean; label: string; blurb: string }> = {
  off:     { amount: 0,    release: 0.18, sc: false, label: "NO DUCK",  blurb: "Kick & pad fight for space. Muddy low end." },
  clean:   { amount: 0.55, release: 0.18, sc: true,  label: "CLEAN PUMP",blurb: "Subtle ducking — kick is clearer, pad still steady." },
  edm:     { amount: 0.85, release: 0.32, sc: true,  label: "EDM PUMP", blurb: "Big breathing motion — the classic dance pump." },
  extreme: { amount: 1,    release: 0.55, sc: true,  label: "TOO MUCH", blurb: "Pad almost disappears. Useful to hear the upper limit." },
};

export function SidechainSim() {
  const [playing, setPlaying] = useState(false);
  const [sc, setSc] = useState(true);
  const [amount, setAmount] = useState(0.85);
  const [release, setRelease] = useState(0.18);
  const [preset, setPreset] = useState<PresetKey>("edm");
  const [gr, setGr] = useState(0);
  const [kickFlash, setKickFlash] = useState(0);
  const historyRef = useRef<number[]>(new Array(120).fill(1));
  const [, force] = useState(0);
  const padGainRef = useRef<GainNode | null>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const rafRef = useRef<number>(0);

  const stop = () => {
    stopRef.current?.();
    stopRef.current = null;
    cancelAnimationFrame(rafRef.current);
    setPlaying(false);
  };

  const play = () => {
    const c = getCtx(); if (!c) return;
    const dest = getMaster();
    const padGain = c.createGain(); padGain.gain.value = 1; padGain.connect(dest);
    padGainRef.current = padGain;
    let stopped = false;
    let next = c.currentTime + 0.15;
    const tick = () => {
      if (stopped) return;
      while (next < c.currentTime + 0.4) {
        for (let b = 0; b < 4; b++) {
          const t = next + b * BEAT;
          playKick(t - c.currentTime, dest);
          const ms = (t - c.currentTime) * 1000;
          setTimeout(() => setKickFlash(Date.now()), Math.max(0, ms));
          if (sc) {
            const g = padGain.gain;
            g.cancelScheduledValues(t);
            g.setValueAtTime(g.value, t);
            g.linearRampToValueAtTime(1 - amount, t + 0.01);
            g.linearRampToValueAtTime(1, t + 0.01 + release);
          }
        }
        // Pad chord every bar
        [60, 64, 67, 72].forEach((n) =>
          playTone(midiToFreq(n), next - c.currentTime, BEAT * 4 * 0.95, "sawtooth", 0.13, padGain),
        );
        // Sub bass on root
        playTone(midiToFreq(36), next - c.currentTime, BEAT * 4 * 0.95, "sine", 0.18, padGain);
        next += BEAT * 4;
      }
      const grVal = (1 - padGain.gain.value);
      setGr(grVal);
      const h = historyRef.current;
      h.push(padGain.gain.value);
      if (h.length > 120) h.shift();
      force((x) => (x + 1) % 1000);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    stopRef.current = () => { stopped = true; try { padGain.disconnect(); } catch {} };
    setPlaying(true);
  };

  useEffect(() => () => stop(), []);

  const applyPreset = (k: PresetKey) => {
    setPreset(k);
    const p = PRESETS[k];
    setAmount(p.amount); setRelease(p.release); setSc(p.sc);
  };

  return (
    <div className="space-y-3">
      <div className="brutal-border bg-ink text-bone p-3 flex flex-wrap items-center gap-2">
        <button onClick={() => (playing ? stop() : play())}
          className={`brutal-border px-4 py-2 font-display text-lg brutal-press ${playing ? "bg-hot text-bone" : "bg-acid text-ink"}`}>
          {playing ? "■ STOP" : "▶ PLAY"}
        </button>
        <button onClick={() => setSc((s) => !s)}
          className={`brutal-border px-3 py-2 font-mono text-xs uppercase ${sc ? "bg-volt text-bone" : "bg-bone text-ink"}`}>
          SIDECHAIN: {sc ? "ON" : "OFF"}
        </button>
        <span className={`brutal-border px-3 py-2 font-mono text-xs uppercase transition-colors ${Date.now() - kickFlash < 80 ? "bg-hot text-bone" : "bg-bone text-ink"}`}>
          ● KICK
        </span>
        <span className="ml-auto font-mono text-[10px] uppercase opacity-80">{PRESETS[preset].blurb}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(PRESETS) as PresetKey[]).map((k) => (
          <button key={k} onClick={() => applyPreset(k)}
            className={`brutal-border px-3 py-2 font-mono text-xs uppercase brutal-press ${preset === k ? "bg-acid" : "bg-bone"}`}>
            {PRESETS[k].label}
          </button>
        ))}
      </div>

      <div className="brutal-border bg-bone p-3 grid md:grid-cols-2 gap-3">
        <label className="font-mono text-xs uppercase flex items-center gap-2">
          AMOUNT
          <input type="range" min={0} max={1} step={0.01} value={amount} onChange={(e) => setAmount(+e.target.value)} className="flex-1" />
          <span className="w-10 text-right">{Math.round(amount * 100)}</span>
        </label>
        <label className="font-mono text-xs uppercase flex items-center gap-2">
          RELEASE
          <input type="range" min={0.02} max={0.6} step={0.01} value={release} onChange={(e) => setRelease(+e.target.value)} className="flex-1" />
          <span className="w-12 text-right">{(release * 1000).toFixed(0)}ms</span>
        </label>
      </div>

      <div className="brutal-border bg-bone p-4">
        <div className="font-mono text-xs uppercase mb-2">PAD VOLUME (kick ducks it)</div>
        <div className="h-6 brutal-border bg-ink overflow-hidden">
          <div className="h-full bg-acid transition-none" style={{ width: `${(1 - gr) * 100}%` }} />
        </div>
        <div className="font-mono text-xs mt-2">Gain reduction: -{(gr * 24).toFixed(1)} dB</div>
        <div className="font-mono text-[10px] uppercase mt-3 opacity-70">PAD LEVEL — last 2s scrolling</div>
        <svg viewBox="0 0 240 60" className="w-full h-16 brutal-border bg-card mt-1">
          <polyline
            fill="none"
            stroke="#FF2E88"
            strokeWidth="2"
            points={historyRef.current.map((v, i) => `${(i / 120) * 240},${60 - v * 56 - 2}`).join(" ")}
          />
        </svg>
      </div>
      <p className="font-mono text-xs uppercase opacity-70">▸ Toggle sidechain off → kick & pad fight. On → pad ducks under each kick. That's the pump.</p>
    </div>
  );
}
