// MidiTransformSim — pick a clip, apply a transform, see + hear notes change.
import { useMemo, useState } from "react";
import { getCtx, getMaster, midiToFreq, playTone } from "@/lib/audio";

type Note = { step: number; pitch: number; len: number; vel: number };

const SEED: Note[] = [
  { step: 0, pitch: 60, len: 2, vel: 100 },
  { step: 4, pitch: 64, len: 2, vel: 100 },
  { step: 8, pitch: 67, len: 2, vel: 100 },
  { step: 12, pitch: 72, len: 2, vel: 100 },
];

type TransformId = "connect" | "arpeggiate" | "strum" | "recombine" | "ornament" | "quantize-feel";

const TRANSFORMS: { id: TransformId; label: string; blurb: string }[] = [
  { id: "connect",      label: "CONNECT",     blurb: "Fill gaps between notes with stepwise motion." },
  { id: "arpeggiate",   label: "ARPEGGIATE",  blurb: "Fan held chord across time as an arp." },
  { id: "strum",        label: "STRUM",       blurb: "Slightly stagger note starts for guitar feel." },
  { id: "recombine",    label: "RECOMBINE",   blurb: "Shuffle pitches and rhythms creatively." },
  { id: "ornament",     label: "ORNAMENT",    blurb: "Add grace notes around existing notes." },
  { id: "quantize-feel",label: "VELOCITY SHAPE", blurb: "Reshape dynamics across the clip." },
];

function apply(notes: Note[], t: TransformId): Note[] {
  switch (t) {
    case "connect": {
      const out: Note[] = [];
      for (let i = 0; i < notes.length; i++) {
        const a = notes[i], b = notes[i + 1];
        out.push(a);
        if (b) {
          const dir = b.pitch > a.pitch ? 1 : -1;
          const steps = Math.abs(b.pitch - a.pitch);
          for (let s = 1; s < steps; s++) {
            out.push({ step: a.step + s, pitch: a.pitch + dir * s, len: 1, vel: 70 });
          }
        }
      }
      return out;
    }
    case "arpeggiate":
      return notes.flatMap((n, i) =>
        [0, 1, 2, 3].map((k) => ({ step: i * 4 + k, pitch: n.pitch + k * 3, len: 1, vel: 90 }))
      );
    case "strum":
      return notes.map((n, i) => ({ ...n, step: n.step + i * 0.25 }));
    case "recombine": {
      const pitches = notes.map((n) => n.pitch).sort(() => Math.random() - 0.5);
      return notes.map((n, i) => ({ ...n, pitch: pitches[i] }));
    }
    case "ornament":
      return notes.flatMap((n) => [
        { step: Math.max(0, n.step - 0.5), pitch: n.pitch + 2, len: 0.5, vel: 60 },
        n,
      ]);
    case "quantize-feel":
      return notes.map((n, i) => ({ ...n, vel: 60 + (i % 2 === 0 ? 50 : 10) }));
  }
}

export function MidiTransformSim() {
  const [seed, setSeed] = useState<Note[]>(SEED);
  const [tx, setTx] = useState<TransformId>("connect");
  const transformed = useMemo(() => apply(seed, tx), [seed, tx]);
  const T = TRANSFORMS.find((t) => t.id === tx)!;

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {TRANSFORMS.map((t) => (
          <button key={t.id} onClick={() => setTx(t.id)}
            className={`brutal-border px-3 py-1.5 font-mono text-xs uppercase brutal-press ${tx === t.id ? "bg-volt text-bone" : "bg-bone text-ink"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <p className="font-mono text-xs opacity-80">{T.blurb}</p>

      <div className="grid md:grid-cols-2 gap-3">
        <Roll title="BEFORE" notes={seed} accent="bg-bone" />
        <Roll title={`AFTER · ${T.label}`} notes={transformed} accent="bg-acid" />
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={async () => {
          const c = getCtx(); if (!c) return;
          if (c.state !== "running") { try { await c.resume(); } catch {} }
          const beat = 0.18;
          [...seed].forEach((n) => playTone(midiToFreq(n.pitch), n.step * beat, beat * 0.9, "sawtooth", 0.15, getMaster()));
        }} className="brutal-border bg-bone px-3 py-1.5 font-mono text-xs uppercase brutal-press">▶ BEFORE</button>
        <button onClick={async () => {
          const c = getCtx(); if (!c) return;
          if (c.state !== "running") { try { await c.resume(); } catch {} }
          const beat = 0.18;
          transformed.forEach((n) => playTone(midiToFreq(n.pitch), n.step * beat, beat * (n.len || 1) * 0.9, "sawtooth", 0.18, getMaster()));
        }} className="brutal-border bg-acid px-3 py-1.5 font-mono text-xs uppercase brutal-press">▶ AFTER</button>
        <button onClick={() => setSeed(SEED)} className="brutal-border bg-bone px-3 py-1.5 font-mono text-xs uppercase brutal-press">RESET</button>
        <button onClick={() => setSeed(transformed)} className="brutal-border bg-hot text-bone px-3 py-1.5 font-mono text-xs uppercase brutal-press">COMMIT</button>
      </div>
      <p className="font-mono text-[11px] uppercase opacity-70">
        ▸ Commit is destructive in real Live too — duplicate your clip first if you want a safe before/after.
      </p>
    </div>
  );
}

function Roll({ title, notes, accent }: { title: string; notes: Note[]; accent: string }) {
  const minP = 54, maxP = 84;
  const W = 320, H = 160;
  const stepW = W / 24;
  const pitchH = H / (maxP - minP);
  return (
    <div className="brutal-border bg-ink text-bone p-2">
      <div className="font-mono text-[10px] uppercase mb-1">{title}</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40 bg-card">
        {Array.from({ length: 24 }).map((_, i) => (
          <line key={i} x1={i * stepW} x2={i * stepW} y1={0} y2={H} stroke="hsl(var(--border))" strokeWidth={i % 4 === 0 ? 1 : 0.3} />
        ))}
        {notes.map((n, i) => (
          <rect key={i}
            x={n.step * stepW} y={H - (n.pitch - minP + 1) * pitchH}
            width={Math.max(stepW * n.len, 4)} height={pitchH - 1}
            className={accent} fillOpacity={0.4 + n.vel / 200}
            stroke="currentColor" strokeWidth={1}
          />
        ))}
      </svg>
    </div>
  );
}
