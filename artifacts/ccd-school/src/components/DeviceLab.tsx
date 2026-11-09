"use client";
// DeviceLab v3 — single owned engine, deterministic graph, no callback wiring.
import { useEffect, useMemo, useRef, useState } from "react";
import { DeviceEngine } from "@/lib/device-engine";
import { SpectrumMeter } from "@/components/SpectrumMeter";
import { getCtx, type SampleName } from "@/lib/audio";
import type { DeviceNode } from "@/lib/audio-bus";
import { CAP, GoPill, Icon, Knob, Screen, Silk } from "@/components/m1/controls";
import "@/components/m1/devicelab.css";
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
  subtitle,
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

  const fmt = (p: ParamSpec | null) => {
    if (!p) return "";
    if (p.kind === "select") return String(values[p.id] ?? p.default);
    const v = num(values[p.id], p.default);
    return `${v.toFixed(p.step && p.step < 1 ? 2 : 0)}${p.unit ? ` ${p.unit}` : ""}`;
  };
  const knobs = params.filter((p): p is Extract<ParamSpec, { kind: "knob" }> => p.kind === "knob");
  const selects = params.filter((p): p is Extract<ParamSpec, { kind: "select" }> => p.kind === "select");

  // Model 1 look (design pass, 9 Nov night): the glass shows what you touch, one pink key plays, knobs are real knobs.
  return (
    <div className="dl">
      <Screen className="dl-scr">
        <div className="dl-meta"><span>{focused ? deviceLabel.toLowerCase() : "device lab"}</span><span>{!playing ? "press play" : bypassed ? "a: without it" : "b: with it"}</span></div>
        <div className="dl-big">{focused ? <>{focused.label.toLowerCase()} <b>{fmt(focused)}</b></> : deviceLabel.toLowerCase()}</div>
        <p className="dl-explain">{focused?.explain ?? (subtitle ? `${subtitle} Press play, then turn any knob.` : "Press play, then turn any knob.")}</p>
        <div className="dl-spec"><SpectrumMeter analyser={engineRef.current?.analyserOut ?? null} height={64} /></div>
        <div className="dl-meters">
          <span>in</span><i><b style={{ width: `${peakInPct}%` }} /></i>
          <span>out</span><i><b style={{ width: `${peakOutPct}%` }} /></i>
          {gainReduction > 0.01 ? <em>squashing {gainReduction.toFixed(1)} db</em> : null}
          {ctxState !== "running" && ctxState !== "idle" ? <em>sound is {ctxState}</em> : null}
        </div>
      </Screen>

      <div className="dl-transport">
        <GoPill onClick={() => void togglePlay()} style={{ height: 64 }}>{playing ? "stop" : <>play <Icon name="play" small /></>}</GoPill>
        <button type="button" className={`dl-ab ${bypassed ? "" : "is-on"}`} onClick={toggleBypass} disabled={!ready} aria-pressed={!bypassed} title="a is the sound without the device, b is with it">
          <i aria-hidden /><b>{bypassed ? "a" : "b"}</b><small>{bypassed ? "without" : "with it"}</small>
        </button>
      </div>
      <div className="dl-sources" role="radiogroup" aria-label="What plays through it">
        {SAMPLES.map((x) => <button key={x.id} type="button" role="radio" aria-checked={sample === x.id} className={`dl-src ${sample === x.id ? "is-on" : ""}`} onClick={() => changeSample(x.id)}>{x.label.toLowerCase()}</button>)}
        <button type="button" className="dl-src" onClick={() => changeBpm(bpm >= 140 ? 80 : bpm + 10)} aria-label={`Tempo ${bpm} bpm, tap to change`}>{bpm} bpm</button>
      </div>

      <Silk label="knobs" right="turn anything" />
      <div className="dl-knobs">
        {knobs.map((p) => {
          const v = num(values[p.id], p.default);
          const n = (v - p.min) / (p.max - p.min);
          const d = (p.default - p.min) / (p.max - p.min);
          return (
            <div key={p.id} className={`dl-knob ${focusParam === p.id ? "is-on" : ""}`} onPointerDown={() => setFocusParam(p.id)} onMouseEnter={() => setFocusParam(p.id)}>
              <Knob label={p.label.toLowerCase()} value={Math.max(0, Math.min(1, n))} defaultValue={d} color={CAP.navy} size={56} height={128} led="var(--led-mint)"
                onChange={(x) => { setFocusParam(p.id); const raw = p.min + x * (p.max - p.min); const st = p.step ?? 0; setParam(p.id, st ? Math.round(raw / st) * st : raw); }} />
            </div>
          );
        })}
      </div>
      {selects.map((p) => (
        <div key={p.id} className="dl-select" onMouseEnter={() => setFocusParam(p.id)}>
          <span>{p.label.toLowerCase()}</span>
          <div className="dl-seg" role="radiogroup" aria-label={p.label}>
            {p.options.map((o) => <button key={o.value} type="button" role="radio" aria-checked={values[p.id] === o.value} className={values[p.id] === o.value ? "is-on" : ""} onClick={() => { setFocusParam(p.id); setParam(p.id, o.value); }}>{o.label.toLowerCase()}</button>)}
          </div>
        </div>
      ))}

      {presets && presets.length > 0 && (
        <>
          <Silk label="presets" right="tap to hear" />
          <div className="dl-presets">
            {presets.map((p) => <button key={p.name} type="button" className="dl-src" onClick={() => { applyPreset(p); if (!playing) void togglePlay(); }}>{p.name.toLowerCase()}</button>)}
          </div>
        </>
      )}

      <div className="dl-notes">
        <div className="dl-note">
          <b>what changed</b>
          <ul>{describeChanges(deviceSlug, values, params).map((l, i) => <li key={i}>{l}</li>)}</ul>
        </div>
        <div className="dl-note">
          <b>listen for</b>
          <ul>{listenFor.map((l, i) => <li key={i}>{l}</li>)}</ul>
        </div>
      </div>

      <SignalFlowSVG flow={signalFlow} defaultOpen={false} />
    </div>
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
      if (lo > 1) out.push(`Lows boosted +${lo.toFixed(0)} dB: more weight & body`);
      if (lo < -1) out.push(`Lows cut ${lo.toFixed(0)} dB: tighter, less boom`);
      if (mi > 1) out.push(`Mids boosted +${mi.toFixed(0)} dB at ${num(vals.midFreq,1000)} Hz: more presence`);
      if (mi < -1) out.push(`Mids cut ${mi.toFixed(0)} dB at ${num(vals.midFreq,1000)} Hz: carved away`);
      if (hi > 1) out.push(`Highs +${hi.toFixed(0)} dB: air & sparkle`);
      if (hi < -1) out.push(`Highs ${hi.toFixed(0)} dB: darker, smoother`);
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
      out.push(`Ceiling ${num(vals.ceiling,-1).toFixed(1)} dB: nothing escapes`);
      out.push(`Input pushed ×${num(vals.gain,1).toFixed(2)}`);
      break;
    }
    case "saturator": {
      const d = num(vals.drive,0);
      out.push(`Drive ${d >= 0 ? "+" : ""}${d.toFixed(1)} dB: adds harmonics (${vals.type ?? "analog"})`);
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
  if (out.length === 0) out.push("Everything is at its default. Tap a preset, or switch between a and b to hear the difference.");
  return out;
}
