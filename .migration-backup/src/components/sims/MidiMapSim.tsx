// MIDI Map Sim — simulates Ableton's actual MIDI map mode flow:
// enter map mode → click parameter → move controller → assign.
import { useEffect, useRef, useState } from "react";
import { getCtx, getMaster, midiToFreq, playTone } from "@/lib/audio";

type MapState = "idle" | "map-mode" | "param-selected" | "assigned";

const PARAMS = [
  { id: "filter", label: "Filter Cutoff", min: 200, max: 12000, unit: "Hz", defaultVal: 6000 },
  { id: "reverb", label: "Reverb Wet", min: 0, max: 100, unit: "%", defaultVal: 20 },
  { id: "delay", label: "Delay Feedback", min: 0, max: 85, unit: "%", defaultVal: 30 },
  { id: "volume", label: "Track Volume", min: 0, max: 100, unit: "%", defaultVal: 75 },
  { id: "pitch", label: "Pitch Shift", min: -12, max: 12, unit: "st", defaultVal: 0 },
];

interface Assignment {
  paramId: string;
  cc: number;
  min: number;
  max: number;
}

export function MidiMapSim() {
  const [mapState, setMapState] = useState<MapState>("idle");
  const [selected, setSelected] = useState<string | null>(null);
  const [cc, setCc] = useState(74);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [knob, setKnob] = useState(64);
  const [playing, setPlaying] = useState(false);
  const stateRef = useRef<{
    filter: BiquadFilterNode;
    revWet: GainNode;
    dlFb: GainNode;
    vol: GainNode;
    pitchOsc?: OscillatorNode;
  } | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(
    () => () => {
      stopRef.current?.();
    },
    [],
  );

  // Apply knob value to all assignments
  useEffect(() => {
    const r = stateRef.current;
    if (!r) return;
    assignments.forEach((a) => {
      const norm = knob / 127;
      const v = a.min + norm * (a.max - a.min);
      if (a.paramId === "filter")
        r.filter.frequency.setTargetAtTime(v, getCtx()?.currentTime ?? 0, 0.02);
      if (a.paramId === "reverb")
        r.revWet.gain.setTargetAtTime((v / 100) * 0.8, getCtx()?.currentTime ?? 0, 0.02);
      if (a.paramId === "delay")
        r.dlFb.gain.setTargetAtTime((v / 100) * 0.85, getCtx()?.currentTime ?? 0, 0.02);
      if (a.paramId === "volume")
        r.vol.gain.setTargetAtTime(v / 100, getCtx()?.currentTime ?? 0, 0.02);
    });
  }, [knob, assignments]);

  const togglePlay = () => {
    if (playing) {
      stopRef.current?.();
      setPlaying(false);
      stateRef.current = null;
      return;
    }
    const ctx = getCtx();
    if (!ctx) return;
    setPlaying(true);
    const master = getMaster();
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 6000;
    filter.Q.value = 2;
    const delay = ctx.createDelay(1.0);
    delay.delayTime.value = 0.28;
    const dlFb = ctx.createGain();
    dlFb.gain.value = 0.3;
    delay.connect(dlFb).connect(delay);
    const conv = ctx.createConvolver();
    const len = 1.5 * ctx.sampleRate;
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.2);
    }
    conv.buffer = ir;
    const revWet = ctx.createGain();
    revWet.gain.value = 0.2;
    const vol = ctx.createGain();
    vol.gain.value = 0.6;
    filter.connect(delay).connect(vol);
    filter.connect(vol);
    delay.connect(conv);
    conv.connect(revWet).connect(vol);
    vol.connect(master);
    stateRef.current = { filter, revWet, dlFb, vol };

    let stopped = false;
    const pat = [60, 64, 67, 72, 67, 64];
    let i = 0;
    let next = ctx.currentTime + 0.1;
    const bpm = 110,
      beat = 60 / bpm;
    const tick = () => {
      if (stopped) return;
      while (next < ctx.currentTime + 0.3) {
        playTone(
          midiToFreq(pat[i % pat.length]),
          next - ctx.currentTime,
          beat * 0.85,
          "sawtooth",
          0.25,
          filter,
        );
        i++;
        next += beat;
      }
      setTimeout(tick, 60);
    };
    tick();
    stopRef.current = () => {
      stopped = true;
      try {
        vol.disconnect();
      } catch {}
    };
  };

  const enterMapMode = () => {
    setMapState("map-mode");
    setSelected(null);
  };
  const exitMapMode = () => {
    setMapState("idle");
    setSelected(null);
  };

  const selectParam = (id: string) => {
    if (mapState !== "map-mode") return;
    setSelected(id);
    setMapState("param-selected");
  };

  const assign = () => {
    if (!selected) return;
    const param = PARAMS.find((p) => p.id === selected)!;
    // Remove existing assignment for this param+cc combo
    const filtered = assignments.filter((a) => !(a.paramId === selected && a.cc === cc));
    setAssignments([...filtered, { paramId: selected, cc, min: param.min, max: param.max }]);
    setMapState("idle");
    setSelected(null);
  };

  const removeAssignment = (paramId: string, assignedCc: number) => {
    setAssignments((a) => a.filter((x) => !(x.paramId === paramId && x.cc === assignedCc)));
  };

  const getParamValue = (paramId: string) => {
    const a = assignments.find((x) => x.paramId === paramId);
    if (!a) return PARAMS.find((p) => p.id === paramId)?.defaultVal ?? 0;
    return a.min + (knob / 127) * (a.max - a.min);
  };

  const isMapMode = mapState === "map-mode" || mapState === "param-selected";

  return (
    <div className="space-y-4">
      {/* How it works explanation */}
      <div className="brutal-border bg-sun/20 p-3 font-mono text-xs leading-relaxed">
        <strong>How Ableton MIDI Map works:</strong> Press MAP → click a parameter → move your
        controller → repeat. The controller is then permanently bound to that parameter in this
        session. Try it below.
      </div>

      {/* Transport + Map mode toggle */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={togglePlay}
          className={`brutal-border px-4 py-2 font-display text-lg brutal-press ${playing ? "bg-hot text-bone" : "bg-acid text-ink"}`}
        >
          {playing ? "■ Stop" : "▶ Play Loop"}
        </button>

        <button
          onClick={isMapMode ? exitMapMode : enterMapMode}
          className={`brutal-border px-4 py-2 font-display text-lg brutal-press ${isMapMode ? "bg-ink text-bone animate-pulse" : "bg-volt text-bone"}`}
        >
          {isMapMode ? "✕ EXIT MAP MODE" : "MAP"}
        </button>
      </div>

      {/* Map mode instruction */}
      {mapState === "map-mode" && (
        <div className="brutal-border bg-volt text-bone p-3 font-mono text-sm font-bold uppercase animate-pulse">
          MAP MODE ACTIVE — Click a parameter below to select it
        </div>
      )}
      {mapState === "param-selected" && (
        <div className="brutal-border bg-acid text-ink p-3 font-mono text-sm space-y-2">
          <div className="font-bold uppercase">
            Parameter selected: {PARAMS.find((p) => p.id === selected)?.label}
          </div>
          <div className="text-xs">Now choose a CC number and click ASSIGN</div>
          <div className="flex gap-2 items-center flex-wrap">
            <label className="text-xs uppercase">CC#</label>
            <input
              type="number"
              min={0}
              max={127}
              value={cc}
              onChange={(e) => setCc(Math.min(127, Math.max(0, +e.target.value)))}
              className="brutal-border bg-bone text-ink w-16 px-2 py-1 font-mono text-sm"
            />
            <button
              onClick={assign}
              className="brutal-border bg-ink text-bone px-4 py-1 font-mono text-sm uppercase brutal-press"
            >
              ASSIGN
            </button>
          </div>
        </div>
      )}

      {/* Parameters */}
      <div className="space-y-2">
        <div className="font-mono text-[10px] uppercase opacity-60">
          Parameters {isMapMode ? "— click one to map" : "— controlled by CC slider below"}
        </div>
        {PARAMS.map((p) => {
          const isAssigned = assignments.some((a) => a.paramId === p.id);
          const isHighlighted = selected === p.id;
          const val = getParamValue(p.id);
          return (
            <div
              key={p.id}
              onClick={() => selectParam(p.id)}
              className={[
                "brutal-border p-3 transition-all",
                isMapMode ? "cursor-pointer hover:bg-volt hover:text-bone" : "cursor-default",
                isHighlighted ? "bg-acid text-ink" : isAssigned ? "bg-volt text-bone" : "bg-card",
              ].join(" ")}
            >
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="font-mono text-xs uppercase flex items-center gap-2">
                    {p.label}
                    {isAssigned && (
                      <span className="brutal-border px-1 py-0.5 text-[9px] bg-bone text-ink">
                        CC {assignments.find((a) => a.paramId === p.id)?.cc}
                      </span>
                    )}
                  </div>
                  <div className="h-1.5 brutal-border bg-bone mt-1 overflow-hidden">
                    <div
                      className="h-full bg-current transition-all"
                      style={{ width: `${((val - p.min) / (p.max - p.min)) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="font-mono text-sm font-bold w-16 text-right">
                  {typeof val === "number" ? Math.round(val) : val}
                  {p.unit}
                </div>
                {isAssigned && !isMapMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAssignment(p.id, assignments.find((a) => a.paramId === p.id)!.cc);
                    }}
                    className="brutal-border bg-bone text-ink px-1 py-0.5 font-mono text-[9px] hover:bg-hot hover:text-bone"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Controller knob */}
      <div className="brutal-border bg-card p-4 space-y-2">
        <div className="flex justify-between font-mono text-[10px] uppercase">
          <span>Controller CC {cc}</span>
          <span>{knob} / 127</span>
        </div>
        <input
          type="range"
          min={0}
          max={127}
          value={knob}
          onChange={(e) => setKnob(+e.target.value)}
          className="w-full accent-ink"
        />
        <div className="font-mono text-[9px] opacity-50">
          {assignments.length === 0
            ? "Assign parameters first, then use this to control them"
            : `Controlling: ${assignments.map((a) => PARAMS.find((p) => p.id === a.paramId)?.label).join(", ")}`}
        </div>
      </div>

      {/* Assignments list */}
      {assignments.length > 0 && (
        <div className="brutal-border bg-ink text-bone p-3 space-y-1">
          <div className="font-mono text-[10px] uppercase opacity-60">
            Active MIDI Map assignments
          </div>
          {assignments.map((a) => (
            <div key={`${a.paramId}-${a.cc}`} className="font-mono text-xs flex items-center gap-2">
              <span className="text-acid">CC {a.cc}</span>
              <span>→</span>
              <span>{PARAMS.find((p) => p.id === a.paramId)?.label}</span>
              <span className="opacity-40">
                ({a.min}–{a.max})
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
