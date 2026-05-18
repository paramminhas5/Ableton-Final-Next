import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { getCtx, getMaster, startLoop, type LoopHandle, type SampleName } from "@/lib/audio";
import { saveDrillScore } from "@/lib/drills";
import { AudioUnlock } from "@/components/AudioUnlock";

export const Route = createFileRoute("/match")({
  head: () => ({ meta: [
    { title: "Mix Match — CCD.SCHOOL" },
    { name: "description", content: "Match the target sound by adjusting EQ, compression and reverb." },
  ]}),
  component: MatchPage,
});

type Params = { hpHz: number; lpHz: number; comp: number; rev: number };
const SOURCES: { name: string; src: SampleName }[] = [
  { name: "Drums", src: "drum-loop" },
  { name: "Bass", src: "bass-loop" },
  { name: "Chords", src: "chord-pad" },
];

function randTarget(): Params {
  return {
    hpHz: [40, 80, 150, 250, 400][Math.floor(Math.random() * 5)],
    lpHz: [3000, 5000, 8000, 12000, 18000][Math.floor(Math.random() * 5)],
    comp: [0, 0.3, 0.6, 0.9][Math.floor(Math.random() * 4)],
    rev: [0, 0.2, 0.5, 0.8][Math.floor(Math.random() * 4)],
  };
}
const DEFAULT: Params = { hpHz: 20, lpHz: 20000, comp: 0, rev: 0 };

function buildChain(out: AudioNode, p: Params) {
  const c = getCtx()!;
  const hp = c.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = p.hpHz;
  const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = p.lpHz;
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -12 - p.comp * 30; comp.ratio.value = 1 + p.comp * 11;
  comp.attack.value = 0.005; comp.release.value = 0.12; comp.knee.value = 6;
  const make = c.createGain(); make.gain.value = 1 + p.comp * 1.2;
  // simple reverb send
  const dry = c.createGain(); dry.gain.value = 1 - p.rev * 0.5;
  const wet = c.createGain(); wet.gain.value = p.rev;
  // synthetic IR
  const irLen = 0.4 + p.rev * 2.4;
  const ir = c.createBuffer(2, c.sampleRate * irLen, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2.5);
  }
  const conv = c.createConvolver(); conv.buffer = ir;
  hp.connect(lp).connect(comp).connect(make);
  make.connect(dry).connect(out);
  make.connect(conv).connect(wet).connect(out);
  return hp; // input node
}

function distance(a: Params, b: Params) {
  // Normalised log-frequency distances for filters; absolute diffs for comp/rev.
  const lf = Math.abs(Math.log2(a.hpHz / b.hpHz)) / 5;
  const lf2 = Math.abs(Math.log2(a.lpHz / b.lpHz)) / 5;
  return lf + lf2 + Math.abs(a.comp - b.comp) + Math.abs(a.rev - b.rev);
}

function MatchPage() {
  const [srcIdx, setSrcIdx] = useState(0);
  const [target, setTarget] = useState<Params>(() => randTarget());
  const [user, setUser] = useState<Params>(DEFAULT);
  const [playing, setPlaying] = useState<"target" | "user" | null>(null);
  const [submitted, setSubmitted] = useState<{ score: number; dist: number } | null>(null);
  const handleRef = useRef<LoopHandle | null>(null);
  const inputRef = useRef<AudioNode | null>(null);
  const outRef = useRef<GainNode | null>(null);

  const stop = () => {
    handleRef.current?.stop(); handleRef.current = null;
    try { outRef.current?.disconnect(); } catch {}
    outRef.current = null; inputRef.current = null;
    setPlaying(null);
  };
  const play = (which: "target" | "user") => {
    stop();
    const c = getCtx(); if (!c) return;
    const out = c.createGain(); out.gain.value = 0.7; out.connect(getMaster());
    outRef.current = out;
    const inNode = buildChain(out, which === "target" ? target : user);
    inputRef.current = inNode;
    handleRef.current = startLoop(SOURCES[srcIdx].src, 100, inNode);
    setPlaying(which);
  };
  useEffect(() => () => stop(), []); // eslint-disable-line

  const submit = async () => {
    const dist = distance(user, target);
    const score = Math.max(0, Math.round(100 - dist * 25));
    setSubmitted({ score, dist });
    await saveDrillScore("compression", Math.round(score / 10), 10); // log under 'compression' bucket; could split per-source later
  };

  const reset = () => {
    stop();
    setTarget(randTarget()); setUser(DEFAULT); setSubmitted(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-12 space-y-4">
      <AudioUnlock />
      <header className="brutal-border bg-volt text-bone p-6 brutal-shadow">
        <div className="font-mono text-xs uppercase">// PRACTICE</div>
        <h1 className="text-5xl md:text-7xl mt-2">MIX MATCH</h1>
        <p className="font-mono mt-2">Listen to the target. Tweak HP, LP, compression, reverb until your version matches.</p>
      </header>

      <div className="brutal-border bg-bone p-4">
        <div className="font-mono text-xs uppercase font-bold mb-1">▸ WHY THIS DRILL</div>
        <ul className="font-mono text-xs space-y-1">
          <li>▸ Engineers reverse-engineer reference tracks every day. This is that skill, in 2 minutes.</li>
          <li>▸ Trains you to hear filter slope, dynamics movement, and wet/dry balance — the four most-used controls in any mix.</li>
          <li>▸ Use A/B fast — short loops, quick toggles. Don't stare at sliders.</li>
        </ul>
      </div>

      <div className="brutal-border bg-card p-3 flex flex-wrap gap-2 items-center font-mono text-xs uppercase">
        <span>SOURCE:</span>
        {SOURCES.map((s, i) => (
          <button key={s.name} onClick={() => { stop(); setSrcIdx(i); reset(); }}
            className={`brutal-border px-3 py-2 brutal-press ${srcIdx === i ? "bg-acid" : "bg-bone"}`}>{s.name}</button>
        ))}
        <button onClick={reset} className="ml-auto brutal-border bg-hot text-bone px-3 py-2 brutal-press">⟳ NEW TARGET</button>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="brutal-border bg-sun p-4">
          <div className="font-mono text-xs uppercase font-bold">▶ TARGET</div>
          <button onClick={() => play("target")}
            className={`mt-2 brutal-border px-4 py-2 font-mono text-sm uppercase brutal-press ${playing === "target" ? "bg-hot text-bone" : "bg-bone"}`}>
            {playing === "target" ? "■ STOP" : "▶ PLAY TARGET"}
          </button>
          <div className="font-mono text-xs mt-3 opacity-70">Use your ears, not your eyes. Don't peek at the values.</div>
        </div>
        <div className="brutal-border bg-acid p-4">
          <div className="font-mono text-xs uppercase font-bold">▶ YOUR MIX</div>
          <button onClick={() => play("user")}
            className={`mt-2 brutal-border px-4 py-2 font-mono text-sm uppercase brutal-press ${playing === "user" ? "bg-hot text-bone" : "bg-bone"}`}>
            {playing === "user" ? "■ STOP" : "▶ PLAY MINE"}
          </button>
          <button onClick={stop} className="ml-2 brutal-border bg-bone px-3 py-2 font-mono text-xs uppercase brutal-press">■ STOP</button>
        </div>
      </div>

      <div className="brutal-border bg-card p-4 space-y-3">
        <Slider label="High-pass" value={user.hpHz} min={20} max={500} step={1} unit="Hz" log onChange={(v) => setUser((u) => ({ ...u, hpHz: v }))} />
        <Slider label="Low-pass" value={user.lpHz} min={2000} max={20000} step={50} unit="Hz" log onChange={(v) => setUser((u) => ({ ...u, lpHz: v }))} />
        <Slider label="Compression" value={user.comp} min={0} max={1} step={0.05} unit="" onChange={(v) => setUser((u) => ({ ...u, comp: v }))} />
        <Slider label="Reverb send" value={user.rev} min={0} max={1} step={0.05} unit="" onChange={(v) => setUser((u) => ({ ...u, rev: v }))} />
      </div>

      {!submitted ? (
        <button onClick={submit} className="brutal-border bg-ink text-bone px-6 py-3 font-display text-2xl brutal-press w-full">SUBMIT MATCH</button>
      ) : (
        <div className="brutal-border bg-acid p-6 brutal-shadow text-center space-y-2">
          <div className="font-mono text-xs uppercase">RESULT</div>
          <div className="font-display text-6xl">{submitted.score}/100</div>
          <div className="font-mono">{submitted.score >= 80 ? "🔥 Producer ears." : submitted.score >= 50 ? "Close — try again." : "Way off. Compare A/B and tweak."}</div>
          <div className="brutal-border bg-bone p-3 font-mono text-xs text-left mt-3 space-y-2">
            <ParamFeedback label="HIGH-PASS" target={target.hpHz} user={user.hpHz} unit="Hz" log />
            <ParamFeedback label="LOW-PASS"  target={target.lpHz} user={user.lpHz} unit="Hz" log />
            <ParamFeedback label="COMPRESSION" target={target.comp} user={user.comp} unit="" />
            <ParamFeedback label="REVERB"      target={target.rev}  user={user.rev}  unit="" />
          </div>
          <button onClick={reset} className="brutal-border bg-volt text-bone px-4 py-2 font-mono text-xs uppercase brutal-press">▶ NEW MATCH</button>
        </div>
      )}

      <Link to="/" className="brutal-border bg-bone px-4 py-2 font-mono text-xs uppercase brutal-press inline-block">← HOME</Link>
    </div>
  );
}

function ParamFeedback({ label, target, user, unit, log }: { label: string; target: number; user: number; unit: string; log?: boolean }) {
  // Direction: how off and which way
  let diffPct: number;
  let txt: string;
  if (log) {
    const d = Math.log2(user / target);
    diffPct = Math.max(-1, Math.min(1, d / 4));
    const cents = Math.round(d * 1200);
    txt = `${user > target ? "↑ too high" : "↓ too low"} by ${Math.abs(cents)}¢ (target ${Math.round(target)} ${unit})`;
  } else {
    const d = user - target;
    diffPct = Math.max(-1, Math.min(1, d * 2));
    txt = `${d > 0 ? "↑ too much" : "↓ too little"} by ${Math.abs(d * 100).toFixed(0)}% (target ${target.toFixed(2)})`;
  }
  const onTarget = Math.abs(diffPct) < 0.05;
  return (
    <div>
      <div className="flex justify-between"><span className="font-bold">{label}</span><span>{onTarget ? "✓ on target" : txt}</span></div>
      <div className="relative h-2 bg-card brutal-border overflow-hidden mt-1">
        <div className="absolute top-0 bottom-0 w-px bg-ink" style={{ left: "50%" }} />
        <div className={`absolute top-0 bottom-0 ${onTarget ? "bg-acid" : "bg-hot"}`}
             style={{ left: diffPct >= 0 ? "50%" : `${50 + diffPct * 50}%`, width: `${Math.abs(diffPct) * 50}%` }} />
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, unit, log, onChange }:
  { label: string; value: number; min: number; max: number; step: number; unit: string; log?: boolean; onChange: (v: number) => void }) {
  // For log sliders, map slider 0..1 to log range
  const slider = log ? (Math.log(value / min) / Math.log(max / min)) : value;
  const sMin = log ? 0 : min;
  const sMax = log ? 1 : max;
  const sStep = log ? 0.001 : step;
  return (
    <div>
      <div className="flex justify-between font-mono text-xs uppercase">
        <span>{label}</span>
        <span>{Math.round(value)}{unit ? ` ${unit}` : ""}</span>
      </div>
      <input type="range" min={sMin} max={sMax} step={sStep} value={slider}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          onChange(log ? min * Math.pow(max / min, v) : v);
        }}
        className="w-full" />
    </div>
  );
}