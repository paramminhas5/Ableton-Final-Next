// DeviceLab v3 — single owned engine, deterministic graph, no callback wiring.
import { useEffect, useMemo, useRef, useState } from "react";
import { DeviceEngine } from "@/lib/device-engine";
import { SpectrumMeter } from "@/components/SpectrumMeter";
import { getCtx, type SampleName } from "@/lib/audio";
import type { DeviceNode } from "@/lib/audio-bus";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { SignalFlowSVG } from "@/components/SignalFlowSVG";

export type ParamSpec =
  | { kind: "knob"; id: string; label: string; min: number; max: number; step?: number; default: number; unit?: string; explain: string }
  | { kind: "select"; id: string; label: string; options: { value: string; label: string }[]; default: string; explain: string };

export type DevicePreset = { name: string; values: Record<string, number | string> };

const SAMPLES: { id: SampleName; label: string }[] = [
  { id: "drum-loop", label: "DRUMS" },
  { id: "bass-loop", label: "BASS" },
  { id: "chord-pad", label: "CHORDS" },
  { id: "vox-chop", label: "VOX" },
  { id: "full-mix", label: "FULL MIX" },
];

export function DeviceLab({
  factory,
  params,
  presets,
  listenFor,
  signalFlow,
  deviceLabel,
  defaultSample = "drum-loop",
  deviceSlug,
}: {
  title?: string;
  subtitle?: string;
  deviceLabel: string;
  factory: () => DeviceNode;
  params: ParamSpec[];
  presets?: DevicePreset[];
  listenFor: string[];
  signalFlow: string;
  defaultSample?: SampleName;
  deviceSlug?: string;
}) {
  const engineRef = useRef<DeviceEngine | null>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [bypassed, setBypassed] = useState(false);
  const [sample, setSample] = useState<SampleName>(defaultSample);
  const [bpm, setBpm] = useState(100);
  const [ctxState, setCtxState] = useState("idle");
  const [peakIn, setPeakIn] = useState(0);
  const [peakOut, setPeakOut] = useState(0);
  const [gainReduction, setGainReduction] = useState(0);
  const [focusParam, setFocusParam] = useState<string | null>(null);

  const initialValues = useMemo(() => {
    const v: Record<string, number | string> = {};
    params.forEach((p) => v[p.id] = p.default);
    return v;
  }, [params]);
  const [values, setValues] = useState<Record<string, number | string>>(initialValues);

  // Build engine on first user gesture
  const ensureEngine = async () => {
    if (engineRef.current) return engineRef.current;
    const c = getCtx();
    if (!c) return null;
    if (c.state !== "running") { try { await c.resume(); } catch {} }
    const eng = new DeviceEngine();
    eng.attachDevice(factory(), values);
    eng.setSample(sample);
    eng.setBpm(bpm);
    engineRef.current = eng;
    setReady(true);
    return eng;
  };

  // Cleanup on unmount AND on device change (route reuse safety net)
  useEffect(() => {
    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, [deviceSlug, factory]);

  // Meters
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const eng = engineRef.current;
      if (eng) {
        const bufIn = new Uint8Array(eng.analyserIn.fftSize);
        eng.analyserIn.getByteTimeDomainData(bufIn);
        let mIn = 0; for (let i = 0; i < bufIn.length; i++) { const v = Math.abs(bufIn[i] - 128); if (v > mIn) mIn = v; }
        setPeakIn(mIn / 128);
        const bufOut = new Uint8Array(eng.analyserOut.fftSize);
        eng.analyserOut.getByteTimeDomainData(bufOut);
        let mOut = 0; for (let i = 0; i < bufOut.length; i++) { const v = Math.abs(bufOut[i] - 128); if (v > mOut) mOut = v; }
        setPeakOut(mOut / 128);
        setCtxState(eng.getCtxState());
        const meta = eng.device?.meta();
        if (meta && "reduction" in meta) setGainReduction(Math.abs((meta as any).reduction || 0));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const togglePlay = async () => {
    const eng = await ensureEngine();
    if (!eng) return;
    if (eng.isPlaying()) { eng.stop(); setPlaying(false); }
    else { await eng.play(); setPlaying(true); }
  };

  const toggleBypass = () => {
    const next = !bypassed;
    setBypassed(next);
    engineRef.current?.setBypass(next);
  };

  const setParam = (id: string, v: number | string) => {
    setValues((cur) => ({ ...cur, [id]: v }));
    engineRef.current?.setParam(id, v);
  };

  const applyPreset = (preset: DevicePreset) => {
    Object.entries(preset.values).forEach(([k, v]) => setParam(k, v));
  };

  const changeSample = (s: SampleName) => { setSample(s); engineRef.current?.setSample(s); };
  const changeBpm = (b: number) => { setBpm(b); engineRef.current?.setBpm(b); };

  // (test-tone helper removed — was confusing users)

  const peakInPct = Math.min(100, Math.round(peakIn * 140));
  const peakOutPct = Math.min(100, Math.round(peakOut * 140));
  const focused = params.find((p) => p.id === focusParam) ?? null;

  return (
    <div className="space-y-4 pb-12">
      {/* Transport */}
      <div className="brutal-border bg-ink text-bone p-3 space-y-3">
        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={togglePlay}
            className={`brutal-border px-5 py-3 font-display text-xl brutal-press ${
              playing ? "bg-hot text-bone" : "bg-acid text-ink"
            }`}
          >
            {playing ? "■ STOP" : "▶ PLAY"}
          </button>

          <button
            onClick={toggleBypass}
            disabled={!ready}
            className={`brutal-border px-4 py-3 font-display text-lg brutal-press ${
              bypassed ? "bg-bone text-ink" : "bg-volt text-bone"
            } ${!ready ? "opacity-50" : ""}`}
            title="A = dry (no device). B = wet (device on)."
          >
            {bypassed ? "A · DRY" : "B · WET"}
          </button>

          <div className="flex gap-1 flex-wrap">
            {SAMPLES.map((s) => (
              <button
                key={s.id}
                onClick={() => changeSample(s.id)}
                className={`brutal-border px-2.5 py-1.5 font-mono text-[11px] uppercase ${
                  sample === s.id ? "bg-acid text-ink" : "bg-bone text-ink"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <label className="font-mono text-[11px] uppercase flex items-center gap-2 ml-auto">
            BPM
            <input type="range" min={60} max={180} step={1} value={bpm}
              onChange={(e) => changeBpm(+e.target.value)} className="w-24" />
            <span className="brutal-border bg-bone text-ink px-2 py-0.5 min-w-[40px] text-center">{bpm}</span>
          </label>

        </div>

        {/* Diagnostic strip */}
        <div className="grid grid-cols-[1fr,1fr,auto] items-center gap-3 font-mono text-[10px] uppercase">
          <div className="flex items-center gap-2">
            <span className="w-12">SOURCE</span>
            <div className="flex-1 h-3 brutal-border bg-bone overflow-hidden">
              <div className={`h-full ${peakIn > 0.7 ? "bg-hot" : peakIn > 0.05 ? "bg-acid" : "bg-bone"}`} style={{ width: `${peakInPct}%` }} />
            </div>
            <span className="w-8 text-right">{peakInPct}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-12">OUTPUT</span>
            <div className="flex-1 h-3 brutal-border bg-bone overflow-hidden">
              <div className={`h-full ${peakOut > 0.7 ? "bg-hot" : peakOut > 0.05 ? "bg-acid" : "bg-bone"}`} style={{ width: `${peakOutPct}%` }} />
            </div>
            <span className="w-8 text-right">{peakOutPct}</span>
          </div>
          <div className="flex items-center gap-2 justify-end">
            {ctxState !== "running" && ctxState !== "idle" && (
              <span className="px-2 py-0.5 brutal-border bg-hot text-bone">CTX: {ctxState}</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Device + Meters */}
      <div className="grid md:grid-cols-[2fr,1fr] gap-4">
        <div className="brutal-border bg-card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="font-display text-2xl">{deviceLabel}</div>
            {bypassed && <div className="font-mono text-xs text-hot">▸ BYPASSED · YOU ARE HEARING THE RAW SOURCE</div>}
          </div>

          {/* Sticky focused-param explainer — always visible above the knobs */}
          <div className="brutal-border bg-acid text-ink p-3 sticky top-2 z-10">
            <div className="font-mono text-[10px] uppercase opacity-70">▸ HOVER A KNOB</div>
            <div className="font-mono text-sm font-bold">{focused ? focused.label : "Pick a knob to see what it does"}</div>
            <div className="font-mono text-xs mt-1 leading-snug">
              {focused?.explain ?? "Each control has a one-line explanation here. Twist it to hear the change."}
            </div>
          </div>

          {gainReduction > 0.01 && (
            <div className="brutal-border bg-bone p-3">
              <div className="font-mono text-xs uppercase mb-2">Gain Reduction</div>
              <div className="h-2 bg-ink overflow-hidden">
                <div className="h-full bg-hot transition-all" style={{ width: `${Math.min(gainReduction * 5, 100)}%` }} />
              </div>
              <div className="font-mono text-xs mt-1">-{gainReduction.toFixed(1)} dB</div>
            </div>
          )}

          <TooltipProvider delayDuration={150}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {params.map((p) => (
              <ParamControl
                key={p.id}
                param={p}
                value={values[p.id]}
                onChange={(v) => setParam(p.id, v)}
                onFocus={() => setFocusParam(p.id)}
              />
            ))}
          </div>
          </TooltipProvider>

          {presets && presets.length > 0 && (
            <div>
              <div className="font-mono text-xs uppercase mb-2">PRESETS — TAP TO HEAR</div>
              <div className="flex flex-wrap gap-2">
                {presets.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => applyPreset(p)}
                    className="brutal-border bg-sun px-3 py-1 font-mono text-xs uppercase brutal-press hover:bg-acid"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="brutal-border bg-ink text-bone p-2">
            <div className="font-mono text-[10px] uppercase mb-1">OUTPUT SPECTRUM</div>
            <SpectrumMeter analyser={engineRef.current?.analyserOut ?? null} height={90} />
          </div>

          {focused && (
            <div className="brutal-border bg-acid text-ink p-3">
              <div className="font-mono text-xs uppercase mb-1">▸ {focused.label}</div>
              <div className="font-mono text-sm">{focused.explain}</div>
            </div>
          )}

          <div className="brutal-border bg-volt text-bone p-4">
            <div className="font-mono text-xs uppercase mb-2">WHAT CHANGED</div>
            <ul className="space-y-1 font-mono text-xs">
              {describeChanges(deviceSlug, values, params).map((l, i) => <li key={i}>▸ {l}</li>)}
            </ul>
          </div>

          <div className="brutal-border bg-acid text-ink p-3">
            <div className="font-mono text-xs uppercase mb-2">WHAT TO LISTEN FOR</div>
            <ul className="space-y-1 font-mono text-xs">
              {listenFor.map((l, i) => <li key={i}>▸ {l}</li>)}
            </ul>
          </div>

          <div className="brutal-border bg-bone p-3 font-mono text-xs">
            <div className="uppercase mb-1">HOW TO USE</div>
            Press <b>PLAY</b> → tap a <b>PRESET</b> → toggle <b>A/B</b> to compare dry vs processed. Twist knobs to hear how each parameter changes the sound.
          </div>
        </div>
      </div>

      {/* Signal flow — collapsed by default at the bottom */}
      <SignalFlowSVG flow={signalFlow} defaultOpen={false} />
    </div>
  );
}

function ParamControl({
  param, value, onChange, onFocus,
}: {
  param: ParamSpec;
  value: number | string;
  onChange: (v: number | string) => void;
  onFocus: () => void;
}) {
  if (param.kind === "select") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
        <div className="brutal-border bg-bone p-3" onMouseEnter={onFocus} onFocus={onFocus}>
        <div className="font-mono text-xs uppercase mb-1">{param.label}</div>
        <div className="flex flex-wrap gap-1">
          {param.options.map((o) => (
            <button
              key={o.value}
              onClick={() => { onFocus(); onChange(o.value); }}
              className={`brutal-border px-2 py-1 font-mono text-xs uppercase ${
                value === o.value ? "bg-acid text-ink" : "bg-card text-ink"
              } brutal-press`}
            >
              {o.label}
            </button>
          ))}
        </div>
        </div>
        </TooltipTrigger>
        <TooltipContent side="top" align="center" collisionPadding={16} avoidCollisions
          className="max-w-xs bg-ink text-bone font-mono text-xs leading-snug px-3 py-2 z-[100]">
          <div className="font-bold mb-1">{param.label}</div>
          {param.explain}
        </TooltipContent>
      </Tooltip>
    );
  }

  const raw = typeof value === "number" ? value : parseFloat(String(value));
  const v = Number.isFinite(raw) ? raw : param.default;
  const pct = ((v - param.min) / (param.max - param.min)) * 100;
  const angle = -135 + (Math.max(0, Math.min(100, pct)) / 100) * 270;

  return (
    <Tooltip>
    <TooltipTrigger asChild>
    <div
      className="brutal-border bg-bone p-3 flex flex-col items-center gap-2"
      onMouseEnter={onFocus}
      onFocus={onFocus}
    >
      <div className="font-mono text-xs uppercase text-center">{param.label}</div>
      <div className="bg-acid brutal-border w-20 h-20 rounded-full relative flex items-center justify-center">
        <div
          className="absolute left-1/2 top-1/2 origin-bottom h-8 w-1 bg-ink"
          style={{ transform: `translate(-50%, -100%) rotate(${angle}deg)`, transformOrigin: "50% 100%" }}
        />
      </div>
      <input
        type="range"
        min={param.min}
        max={param.max}
        step={param.step ?? (param.max - param.min) / 100}
        value={v}
        onChange={(e) => { onFocus(); onChange(+e.target.value); }}
        className="w-full"
      />
      <div className="font-mono text-xs text-center">
        {Number.isFinite(v) ? v.toFixed(param.step && param.step < 1 ? 2 : 0) : "—"} {param.unit ?? ""}
      </div>
    </div>
    </TooltipTrigger>
    <TooltipContent side="top" align="center" collisionPadding={16} avoidCollisions
      className="max-w-xs bg-ink text-bone font-mono text-xs leading-snug px-3 py-2 z-[100]">
      <div className="font-bold mb-1">{param.label}{param.unit ? ` (${param.unit})` : ""}</div>
      {param.explain}
    </TooltipContent>
    </Tooltip>
  );
}

function num(v: number | string | undefined, d = 0): number {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : d;
}

function describeChanges(slug: string | undefined, vals: Record<string, number | string>, params: ParamSpec[]): string[] {
  const out: string[] = [];
  switch (slug) {
    case "eq": {
      const lo = num(vals.low), mi = num(vals.mid), hi = num(vals.hi);
      if (lo > 1) out.push(`Lows boosted +${lo.toFixed(0)} dB — more weight & body`);
      if (lo < -1) out.push(`Lows cut ${lo.toFixed(0)} dB — tighter, less boom`);
      if (mi > 1) out.push(`Mids boosted +${mi.toFixed(0)} dB at ${num(vals.midFreq,1000)} Hz — more presence`);
      if (mi < -1) out.push(`Mids cut ${mi.toFixed(0)} dB at ${num(vals.midFreq,1000)} Hz — carved away`);
      if (hi > 1) out.push(`Highs +${hi.toFixed(0)} dB — air & sparkle`);
      if (hi < -1) out.push(`Highs ${hi.toFixed(0)} dB — darker, smoother`);
      break;
    }
    case "compressor":
    case "glue-compressor": {
      const t = num(vals.threshold,-20), r = num(vals.ratio,4);
      out.push(`Anything above ${t.toFixed(0)} dB squashed at ${r.toFixed(1)}:1`);
      out.push(`Attack ${(num(vals.attack,0.01)*1000).toFixed(0)} ms / Release ${(num(vals.release,0.25)*1000).toFixed(0)} ms`);
      break;
    }
    case "limiter": {
      out.push(`Ceiling ${num(vals.ceiling,-1).toFixed(1)} dB — nothing escapes`);
      out.push(`Input pushed ×${num(vals.gain,1).toFixed(2)}`);
      break;
    }
    case "saturator": {
      const d = num(vals.drive,0);
      out.push(`Drive ${d >= 0 ? "+" : ""}${d.toFixed(1)} dB — adds harmonics (${vals.type ?? "analog"})`);
      break;
    }
    case "reverb": {
      out.push(`Room: ${num(vals.size,1.5).toFixed(1)}s · decay ×${num(vals.decay,2).toFixed(1)}`);
      out.push(`Predelay ${num(vals.predelay,10).toFixed(0)} ms before tail`);
      break;
    }
    case "delay": {
      out.push(`Echo every ${(num(vals.time,0.375)*1000).toFixed(0)} ms`);
      out.push(`Feedback ${(num(vals.feedback,0.4)*100).toFixed(0)}% · tone ${num(vals.tone,4000).toFixed(0)} Hz`);
      break;
    }
    case "auto-filter": {
      out.push(`${vals.type ?? "lowpass"} cutoff ${num(vals.cutoff,2000).toFixed(0)} Hz · Q ${num(vals.Q,1).toFixed(1)}`);
      const d = num(vals.lfoDepth,0);
      if (d > 10) out.push(`LFO sweeping ±${d.toFixed(0)} Hz at ${num(vals.lfoRate,1).toFixed(2)} Hz`);
      break;
    }
    case "chorus":
    case "phaser": {
      out.push(`Modulating at ${num(vals.rate,1).toFixed(2)} Hz · depth ${num(vals.depth,0).toFixed(1)}`);
      break;
    }
    default: {
      params.forEach((p) => {
        if (p.kind === "knob") {
          const v = num(vals[p.id], p.default);
          if (v !== p.default) out.push(`${p.label}: ${v.toFixed(2)}${p.unit ?? ""}`);
        }
      });
    }
  }
  if (out.length === 0) out.push("Defaults — toggle A/B or load a preset to hear the device.");
  return out;
}
