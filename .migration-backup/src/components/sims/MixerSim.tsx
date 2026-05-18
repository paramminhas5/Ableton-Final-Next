import { useEffect, useRef, useState } from "react";
import { getCtx, getMaster, midiToFreq, playKick, playSnare, playHat, playTone } from "@/lib/audio";

type Track = { name: string; color: string; vol: number; pan: number; mute: boolean; solo: boolean };

const init: Track[] = [
  { name: "DRUMS", color: "bg-acid", vol: 0.8, pan: 0, mute: false, solo: false },
  { name: "BASS", color: "bg-hot text-bone", vol: 0.7, pan: -0.1, mute: false, solo: false },
  { name: "SYNTH", color: "bg-volt text-bone", vol: 0.6, pan: 0.2, mute: false, solo: false },
  { name: "PAD", color: "bg-sun", vol: 0.5, pan: 0, mute: false, solo: false },
  { name: "VOX", color: "bg-bone", vol: 0.65, pan: 0, mute: false, solo: false },
];

export function MixerSim() {
  const [tracks, setTracks] = useState<Track[]>(init);
  const [playing, setPlaying] = useState(false);
  const tracksRef = useRef(tracks);
  tracksRef.current = tracks;
  const nodesRef = useRef<{ gain: GainNode; pan: StereoPannerNode }[]>([]);

  // Build gain/pan nodes per track once audio runs
  useEffect(() => {
    if (!playing) return;
    const c = getCtx(); if (!c) return;
    nodesRef.current = tracksRef.current.map(() => {
      const g = c.createGain(); const p = c.createStereoPanner();
      g.connect(p).connect(getMaster()); return { gain: g, pan: p };
    });
    let stopped = false;
    const bpm = 110, beat = 60 / bpm, bar = beat * 4;
    let next = c.currentTime + 0.2;
    const bassPat = [36, 36, 43, 41];
    const synthPat = [60, 64, 67, 72];
    const padPat = [55, 59, 62];
    const voxPat = [72, 76, 79, 76];
    const sched = (t: number) => {
      const trs = tracksRef.current;
      const anySolo = trs.some((x) => x.solo);
      const audible = (i: number) => {
        const tr = trs[i]; if (tr.mute) return false;
        if (anySolo && !tr.solo) return false;
        return true;
      };
      const dest = (i: number) => nodesRef.current[i].gain;
      // DRUMS
      if (audible(0)) for (let b = 0; b < 4; b++) {
        playKick(t + b * beat - c.currentTime, dest(0));
        playHat(t + b * beat + beat / 2 - c.currentTime, false, dest(0));
        if (b === 1 || b === 3) playSnare(t + b * beat - c.currentTime, dest(0));
      }
      if (audible(1)) bassPat.forEach((n, i) => playTone(midiToFreq(n), t + i * beat - c.currentTime, beat * 0.9, "sawtooth", 0.25, dest(1)));
      if (audible(2)) synthPat.forEach((n, i) => playTone(midiToFreq(n), t + i * beat - c.currentTime, beat * 0.5, "square", 0.12, dest(2)));
      if (audible(3)) padPat.forEach((n) => playTone(midiToFreq(n), t - c.currentTime, bar * 0.95, "triangle", 0.08, dest(3)));
      if (audible(4)) voxPat.forEach((n, i) => playTone(midiToFreq(n), t + i * beat - c.currentTime, beat * 0.6, "sine", 0.18, dest(4)));
    };
    const tick = () => {
      if (stopped) return;
      while (next < c.currentTime + 0.3) { sched(next); next += bar; }
      setTimeout(tick, 60);
    };
    tick();
    return () => {
      stopped = true;
      nodesRef.current.forEach((n) => { try { n.pan.disconnect(); n.gain.disconnect(); } catch {} });
      nodesRef.current = [];
    };
  }, [playing]);

  // Update gain/pan as user moves faders
  useEffect(() => {
    nodesRef.current.forEach((n, i) => {
      const tr = tracks[i]; if (!n) return;
      n.gain.gain.value = tr.vol;
      n.pan.pan.value = tr.pan;
    });
  }, [tracks]);

  const upd = (i: number, patch: Partial<Track>) => setTracks((t) => t.map((tr, idx) => idx === i ? { ...tr, ...patch } : tr));
  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-center">
        <button onClick={() => setPlaying((p) => !p)} className="brutal-border bg-acid px-4 py-2 font-mono uppercase brutal-press">
          {playing ? "■ Stop" : "▶ Play Mix"}
        </button>
        <span className="font-mono text-xs uppercase opacity-70">Move faders, mute, solo — listen.</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {tracks.map((t, i) => (
          <div key={t.name} className="brutal-border bg-card p-3 flex flex-col items-stretch gap-2">
            <div className={`${t.color} brutal-border font-display text-center py-1`}>{t.name}</div>
            <div className="flex gap-1">
              <button onClick={() => upd(i, { mute: !t.mute })} className={`flex-1 brutal-border font-mono text-xs py-1 ${t.mute ? "bg-hot text-bone" : "bg-bone"}`}>M</button>
              <button onClick={() => upd(i, { solo: !t.solo })} className={`flex-1 brutal-border font-mono text-xs py-1 ${t.solo ? "bg-acid" : "bg-bone"}`}>S</button>
            </div>
            <div className="flex flex-col items-center gap-1">
              <VFader value={t.vol} onChange={(v) => upd(i, { vol: v })} />
              <span className="font-mono text-[10px]">{Math.round(t.vol * 100)}</span>
            </div>
            <label className="font-mono text-[10px] flex flex-col">
              PAN {t.pan.toFixed(1)}
              <input type="range" min={-1} max={1} step={0.05} value={t.pan} onChange={(e) => upd(i, { pan: +e.target.value })} />
            </label>
            <Meter active={!t.mute} level={t.vol} />
          </div>
        ))}
        <div className="brutal-border bg-ink text-bone p-3 flex flex-col items-center gap-2">
          <div className="brutal-border bg-acid text-ink font-display py-1 px-3">MASTER</div>
          <Meter active level={tracks.reduce((s, t) => s + (t.mute ? 0 : t.vol), 0) / tracks.length} big />
          <div className="font-mono text-xs">0.0 dB</div>
        </div>
      </div>
    </div>
  );
}

function Meter({ active, level, big = false }: { active: boolean; level: number; big?: boolean }) {
  const segs = big ? 16 : 10;
  const lit = active ? Math.floor(level * segs) : 0;
  return (
    <div className="flex flex-col-reverse gap-[2px] w-full">
      {Array.from({ length: segs }).map((_, i) => (
        <div key={i} className={`h-2 brutal-border ${i < lit ? (i > segs * 0.8 ? "bg-hot" : i > segs * 0.6 ? "bg-sun" : "bg-acid") : "bg-bone"}`} />
      ))}
    </div>
  );
}

// Custom vertical fader — pointer events on a div so touch works correctly
// on iOS without the rotated <input type=range> hit-target weirdness.
function VFader({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const setFromY = (clientY: number) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const v = 1 - (clientY - r.top) / r.height;
    onChange(Math.max(0, Math.min(1, v)));
  };
  const onDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setFromY(e.clientY);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    setFromY(e.clientY);
  };
  const onUp = (e: React.PointerEvent) => {
    draggingRef.current = false;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };
  const pct = Math.round(value * 100);
  return (
    <div
      ref={ref}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      role="slider"
      aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}
      className="relative h-36 w-8 brutal-border bg-ink touch-none cursor-pointer select-none"
    >
      <div className="absolute inset-x-0 bottom-0 bg-acid" style={{ height: `${pct}%` }} />
      <div
        className="absolute left-0 right-0 h-3 bg-bone brutal-border"
        style={{ bottom: `calc(${pct}% - 6px)` }}
      />
    </div>
  );
}
