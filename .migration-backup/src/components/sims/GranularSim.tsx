// GranularSim — scrub through a synthesised source with grain controls.
// Teaches: Position, Spray, Size, Density — the core Granulator III parameters.
import { useCallback, useEffect, useRef, useState } from "react";
import { getCtx } from "@/lib/audio";

export function GranularSim() {
  const [position, setPosition] = useState(0.3);
  const [spray, setSpray] = useState(0.1);
  const [size, setSize] = useState(0.08);
  const [density, setDensity] = useState(12);
  const [playing, setPlaying] = useState(false);
  const sourceRef = useRef<AudioBuffer | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Build source buffer on mount — a pitched sawtooth + vowel formants
  useEffect(() => {
    const ctx = getCtx();
    if (!ctx) return;
    const dur = 4;
    const sr = ctx.sampleRate;
    const len = dur * sr;
    const buf = ctx.createBuffer(1, len, sr);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const t = i / sr;
      // Evolving pitched source
      const f0 = 110 + 55 * Math.sin(t * 0.3);
      let s = 0;
      for (let h = 1; h <= 8; h++) s += Math.sin(2 * Math.PI * f0 * h * t) / h;
      // Vowel formant envelope across time
      const vowelEnv = 0.5 + 0.5 * Math.sin(t * 0.7);
      data[i] = (s / 4) * vowelEnv * 0.6;
    }
    sourceRef.current = buf;
  }, []);

  const scheduleGrain = useCallback(
    (ctx: AudioContext) => {
      const buf = sourceRef.current;
      if (!buf) return;
      const t = ctx.currentTime + 0.01;
      const grainDur = Math.max(0.02, size);
      const pos = Math.max(0, Math.min(1, position + (Math.random() - 0.5) * spray));
      const offset = pos * (buf.duration - grainDur);

      const src = ctx.createBufferSource();
      src.buffer = buf;
      const g = ctx.createGain();
      // Hanning window envelope on each grain
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.4 / Math.sqrt(density), t + grainDur * 0.3);
      g.gain.linearRampToValueAtTime(0.0001, t + grainDur);
      src.connect(g).connect(ctx.destination);
      src.start(t, offset, grainDur + 0.01);
    },
    [position, spray, size, density],
  );

  useEffect(() => {
    if (!playing) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    const intervalMs = 1000 / density;
    timerRef.current = setInterval(() => {
      const ctx = getCtx();
      if (ctx) scheduleGrain(ctx);
    }, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playing, scheduleGrain, density]);

  const Knob = ({
    label,
    value,
    min,
    max,
    step = 0.01,
    format,
    onChange,
  }: {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    format: (v: number) => string;
    onChange: (v: number) => void;
  }) => (
    <div className="space-y-1">
      <div className="flex justify-between font-mono text-[10px] uppercase opacity-60">
        <span>{label}</span>
        <span>{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="w-full accent-ink"
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="brutal-border bg-ink text-bone p-3">
        <div className="font-mono text-[10px] uppercase opacity-60">
          Granulator III — Core Parameters
        </div>
        <div className="font-display text-2xl mt-1">GRANULAR ENGINE</div>
      </div>

      <button
        onClick={() => setPlaying((p) => !p)}
        className={`brutal-border px-5 py-3 font-display text-xl brutal-press w-full ${playing ? "bg-hot text-bone" : "bg-acid text-ink"}`}
      >
        {playing ? "■ Stop" : "▶ Play Grains"}
      </button>

      <div className="space-y-3 brutal-border p-4 bg-card">
        <Knob
          label="Position — where in the sample"
          value={position}
          min={0}
          max={1}
          format={(v) => `${Math.round(v * 100)}%`}
          onChange={setPosition}
        />
        <Knob
          label="Spray — random scatter"
          value={spray}
          min={0}
          max={1}
          format={(v) => `${Math.round(v * 100)}%`}
          onChange={setSpray}
        />
        <Knob
          label="Grain size"
          value={size}
          min={0.01}
          max={0.5}
          step={0.01}
          format={(v) => `${Math.round(v * 1000)}ms`}
          onChange={setSize}
        />
        <Knob
          label="Density — grains/sec"
          value={density}
          min={2}
          max={40}
          step={1}
          format={(v) => `${v}/s`}
          onChange={(v) => setDensity(v)}
        />
      </div>

      <div className="brutal-border bg-bone p-3 font-mono text-[10px] uppercase opacity-60 leading-relaxed">
        TIP: Set Position to 0% and automate it slowly to 100% — the texture evolves without
        repeating. High Spray + small Size = clouds. Low Spray + large Size = transparent
        time-stretch.
      </div>
    </div>
  );
}
