// SynthPlaygroundSim — subtractive synth with filter, envelope, detune.
// Used for: meld, drift, instruments-overview missions.
import { useRef, useState } from "react";
import { getCtx, midiToFreq } from "@/lib/audio";

type OscType = "sawtooth" | "square" | "triangle" | "sine";
const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const WHITE = [0, 2, 4, 5, 7, 9, 11];
const BLACK = [1, 3, -1, 6, 8, 10, -1];

export function SynthPlaygroundSim() {
  const [osc1, setOsc1] = useState<OscType>("sawtooth");
  const [osc2, setOsc2] = useState<OscType>("square");
  const [detune, setDetune] = useState(7);
  const [cutoff, setCutoff] = useState(1200);
  const [reso, setReso] = useState(2);
  const [attack, setAttack] = useState(0.01);
  const [release, setRelease] = useState(0.4);
  const [mix, setMix] = useState(0.5);
  const [drift, setDrift] = useState(0.3);
  const activeRef = useRef<
    Map<
      number,
      { o1: OscillatorNode; o2: OscillatorNode; filter: BiquadFilterNode; gain: GainNode }
    >
  >(new Map());

  const noteOn = (midi: number) => {
    if (activeRef.current.has(midi)) return;
    const ctx = getCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const freq = midiToFreq(midi);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.4, t + attack);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(cutoff, t);
    filter.Q.value = reso;

    const o1 = ctx.createOscillator();
    o1.type = osc1;
    o1.frequency.value = freq;
    // Drift — random micro-detune per note
    o1.detune.value = (Math.random() - 0.5) * drift * 20;

    const o2 = ctx.createOscillator();
    o2.type = osc2;
    o2.frequency.value = freq;
    o2.detune.value = detune * 100 + (Math.random() - 0.5) * drift * 20;

    const g1 = ctx.createGain();
    g1.gain.value = 1 - mix;
    const g2 = ctx.createGain();
    g2.gain.value = mix;

    o1.connect(g1).connect(filter);
    o2.connect(g2).connect(filter);
    filter.connect(g).connect(ctx.destination);

    o1.start(t);
    o2.start(t);
    activeRef.current.set(midi, { o1, o2, filter, gain: g });
  };

  const noteOff = (midi: number) => {
    const voice = activeRef.current.get(midi);
    if (!voice) return;
    const ctx = getCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    voice.gain.gain.cancelScheduledValues(t);
    voice.gain.gain.setValueAtTime(voice.gain.gain.value, t);
    voice.gain.gain.exponentialRampToValueAtTime(0.0001, t + release);
    setTimeout(
      () => {
        try {
          voice.o1.stop();
          voice.o2.stop();
        } catch {}
        activeRef.current.delete(midi);
      },
      (release + 0.1) * 1000,
    );
  };

  const octave = 4;
  const Sel = ({
    val,
    options,
    onChange,
  }: {
    val: string;
    options: string[];
    onChange: (v: string) => void;
  }) => (
    <select
      value={val}
      onChange={(e) => onChange(e.target.value)}
      className="brutal-border bg-bone font-mono text-xs uppercase px-2 py-1"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );

  return (
    <div className="space-y-4">
      <div className="brutal-border bg-ink text-bone p-3">
        <div className="font-mono text-[10px] uppercase opacity-60">
          Subtractive Synth Playground
        </div>
        <div className="font-display text-2xl mt-1">DUAL OSC · FILTER · ENV</div>
      </div>

      {/* Oscillators */}
      <div className="grid grid-cols-2 gap-2">
        <div className="brutal-border p-3 space-y-2">
          <div className="font-mono text-[10px] uppercase opacity-60">Osc 1</div>
          <Sel
            val={osc1}
            options={["sawtooth", "square", "triangle", "sine"]}
            onChange={(v) => setOsc1(v as OscType)}
          />
        </div>
        <div className="brutal-border p-3 space-y-2">
          <div className="font-mono text-[10px] uppercase opacity-60">Osc 2 (+ detune)</div>
          <Sel
            val={osc2}
            options={["sawtooth", "square", "triangle", "sine"]}
            onChange={(v) => setOsc2(v as OscType)}
          />
          <input
            type="range"
            min={0}
            max={12}
            step={0.5}
            value={detune}
            onChange={(e) => setDetune(+e.target.value)}
            className="w-full accent-ink"
          />
          <div className="font-mono text-[9px] opacity-50">
            {detune > 0 ? `+${detune} semitones` : "unison"}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="brutal-border p-3 space-y-3">
        {[
          {
            label: "Osc Mix (1→2)",
            val: mix,
            min: 0,
            max: 1,
            fmt: (v: number) => `${Math.round(v * 100)}%`,
            set: setMix,
          },
          {
            label: "Filter Cutoff",
            val: cutoff,
            min: 80,
            max: 18000,
            fmt: (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}kHz` : `${Math.round(v)}Hz`),
            set: setCutoff,
          },
          {
            label: "Resonance",
            val: reso,
            min: 0.1,
            max: 20,
            step: 0.1,
            fmt: (v: number) => v.toFixed(1),
            set: setReso,
          },
          {
            label: "Attack",
            val: attack,
            min: 0.001,
            max: 2,
            step: 0.001,
            fmt: (v: number) => `${(v * 1000).toFixed(0)}ms`,
            set: setAttack,
          },
          {
            label: "Release",
            val: release,
            min: 0.05,
            max: 3,
            step: 0.01,
            fmt: (v: number) => `${v.toFixed(2)}s`,
            set: setRelease,
          },
          {
            label: "Drift",
            val: drift,
            min: 0,
            max: 1,
            fmt: (v: number) => `${Math.round(v * 100)}%`,
            set: setDrift,
          },
        ].map(({ label, val, min, max, step = 0.01, fmt, set }) => (
          <div key={label} className="space-y-0.5">
            <div className="flex justify-between font-mono text-[10px] uppercase opacity-60">
              <span>{label}</span>
              <span>{fmt(val)}</span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={val}
              onChange={(e) => set(+e.target.value)}
              className="w-full accent-ink"
            />
          </div>
        ))}
      </div>

      {/* Piano keyboard */}
      <div className="relative h-24 brutal-border bg-bone overflow-hidden">
        <div className="flex h-full">
          {WHITE.map((semi, wi) => {
            const midi = octave * 12 + semi;
            const noteName = NOTES[semi];
            return (
              <div
                key={wi}
                className="flex-1 relative"
                onPointerDown={() => noteOn(midi)}
                onPointerUp={() => noteOff(midi)}
                onPointerLeave={() => noteOff(midi)}
              >
                <div className="absolute inset-0 brutal-border bg-bone hover:bg-acid/30 active:bg-acid cursor-pointer select-none touch-none flex items-end justify-center pb-1">
                  <span className="font-mono text-[8px] opacity-40">{noteName}</span>
                </div>
              </div>
            );
          })}
        </div>
        {/* Black keys overlay */}
        <div className="absolute inset-0 flex pointer-events-none">
          {BLACK.map((semi, bi) => {
            if (semi === -1) return <div key={bi} className="flex-1" />;
            const midi = octave * 12 + semi;
            return (
              <div
                key={bi}
                className="flex-1 flex justify-center"
                style={{ marginLeft: "-6%", width: "8%" }}
              >
                <div
                  className="w-full h-[60%] brutal-border bg-ink pointer-events-auto cursor-pointer select-none touch-none hover:bg-volt active:bg-acid"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    noteOn(midi);
                  }}
                  onPointerUp={(e) => {
                    e.stopPropagation();
                    noteOff(midi);
                  }}
                  onPointerLeave={() => noteOff(midi)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
