// Real arrangement playback — 4 tracks, transport, mute/solo, automation drives master volume.
import { useEffect, useRef, useState } from "react";
import { getCtx, getMaster, midiToFreq, playKick, playSnare, playHat, playTone } from "@/lib/audio";

type TrackName = "DRUMS" | "BASS" | "SYNTH" | "VOX";
const TRACKS: { name: TrackName; color: string }[] = [
  { name: "DRUMS", color: "bg-acid" },
  { name: "BASS", color: "bg-hot text-bone" },
  { name: "SYNTH", color: "bg-volt text-bone" },
  { name: "VOX", color: "bg-sun" },
];

const BARS = 16;
const BPM = 100;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const TOTAL = BAR * BARS;

// Per-track clip ranges (bar start, bar end exclusive)
const SECTIONS: Record<TrackName, [number, number][]> = {
  DRUMS: [[0, 16]],
  BASS: [[2, 16]],
  SYNTH: [[4, 12]],
  VOX: [[8, 16]],
};

// Bass + synth note patterns (per bar cycle of 4)
const BASS = [36, 36, 43, 41];
const SYNTH_CHORD = [60, 64, 67, 72];
const VOX = [72, 74, 76, 79];

export function ArrangementSim() {
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [muted, setMuted] = useState<Record<TrackName, boolean>>({ DRUMS: false, BASS: false, SYNTH: false, VOX: false });
  const [solo, setSolo] = useState<TrackName | null>(null);
  const [auto, setAuto] = useState<number[]>(Array(BARS * 4).fill(80));
  const [draw, setDraw] = useState(false);
  const startRef = useRef<{ ctxStart: number; pos: number } | null>(null);
  const rafRef = useRef<number>(0);
  const masterGainRef = useRef<GainNode | null>(null);

  const isAudible = (t: TrackName) => !muted[t] && (solo === null || solo === t);

  const stop = () => {
    cancelAnimationFrame(rafRef.current);
    startRef.current = null;
    setPlaying(false);
  };

  const play = () => {
    const c = getCtx(); if (!c) return;
    if (!masterGainRef.current) {
      const g = c.createGain();
      g.gain.value = auto[0] / 100;
      g.connect(getMaster());
      masterGainRef.current = g;
    }
    const startCtx = c.currentTime + 0.05;
    startRef.current = { ctxStart: startCtx, pos: position };
    scheduleAll(startCtx, position);
    setPlaying(true);
    const tick = () => {
      if (!startRef.current) return;
      const elapsed = c.currentTime - startRef.current.ctxStart;
      const p = (startRef.current.pos + elapsed) % TOTAL;
      setPosition(p);
      // Update master gain from automation (cell index = beats)
      const cell = Math.floor((p / BEAT)) % auto.length;
      const v = auto[cell];
      if (masterGainRef.current && Number.isFinite(v)) {
        masterGainRef.current.gain.value = Math.max(0, Math.min(1, v / 100));
      }
      // If wrapped, reschedule next cycle
      if (elapsed > TOTAL) {
        startRef.current = { ctxStart: c.currentTime, pos: 0 };
        scheduleAll(c.currentTime, 0);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const scheduleAll = (when: number, fromPos: number) => {
    const c = getCtx(); if (!c || !masterGainRef.current) return;
    const dest = masterGainRef.current;
    const offset = when - c.currentTime;
    for (let bar = 0; bar < BARS; bar++) {
      const barTime = bar * BAR;
      if (barTime < fromPos - 0.001) continue;
      const t = offset + (barTime - fromPos);
      // Drums
      if (isAudible("DRUMS") && SECTIONS.DRUMS.some(([a, b]) => bar >= a && bar < b)) {
        for (let b = 0; b < 4; b++) {
          playKick(t + b * BEAT, dest);
          playHat(t + b * BEAT + BEAT / 2, false, dest);
        }
        playSnare(t + BEAT, dest);
        playSnare(t + 3 * BEAT, dest);
      }
      // Bass
      if (isAudible("BASS") && SECTIONS.BASS.some(([a, b]) => bar >= a && bar < b)) {
        BASS.forEach((n, i) => playTone(midiToFreq(n), t + i * BEAT, BEAT * 0.9, "sawtooth", 0.18, dest));
      }
      // Synth pad
      if (isAudible("SYNTH") && SECTIONS.SYNTH.some(([a, b]) => bar >= a && bar < b)) {
        SYNTH_CHORD.forEach((n) => playTone(midiToFreq(n), t, BAR * 0.95, "triangle", 0.05, dest));
      }
      // Vox
      if (isAudible("VOX") && SECTIONS.VOX.some(([a, b]) => bar >= a && bar < b)) {
        VOX.forEach((n, i) => playTone(midiToFreq(n), t + i * BEAT, BEAT * 0.6, "sine", 0.15, dest));
      }
    }
  };

  useEffect(() => () => { stop(); }, []);

  return (
    <div className="space-y-3">
      <div className="brutal-border bg-ink text-bone p-3 flex flex-wrap items-center gap-3">
        <button onClick={() => playing ? stop() : play()} className={`brutal-border px-4 py-2 font-display text-lg brutal-press ${playing ? "bg-hot text-bone" : "bg-acid text-ink"}`}>
          {playing ? "■ STOP" : "▶ PLAY"}
        </button>
        <button onClick={() => { stop(); setPosition(0); }} className="brutal-border bg-bone text-ink px-3 py-2 font-mono text-xs uppercase">⏮ TOP</button>
        <span className="font-mono text-xs uppercase">BAR {Math.floor(position / BAR) + 1} / {BARS} · {BPM} BPM</span>
        {solo && <span className="brutal-border bg-sun text-ink px-2 py-1 font-mono text-xs">SOLO: {solo}</span>}
      </div>

      <div className="brutal-border bg-card overflow-x-auto">
        {TRACKS.map((t) => (
          <div key={t.name} className="flex brutal-border border-x-0 border-t-0 last:border-b-0">
            <div className="w-32 brutal-border border-y-0 border-l-0 bg-ink text-bone font-mono text-xs uppercase p-2 flex flex-col gap-1 justify-center">
              <div>{t.name}</div>
              <div className="flex gap-1">
                <button onClick={() => setMuted((m) => ({ ...m, [t.name]: !m[t.name] }))}
                  className={`brutal-border px-1 text-[10px] ${muted[t.name] ? "bg-hot text-bone" : "bg-bone text-ink"}`}>M</button>
                <button onClick={() => setSolo((s) => s === t.name ? null : t.name)}
                  className={`brutal-border px-1 text-[10px] ${solo === t.name ? "bg-sun text-ink" : "bg-bone text-ink"}`}>S</button>
              </div>
            </div>
            <div className="flex-1 relative h-14 grid-bg">
              {SECTIONS[t.name].map(([a, b], i) => (
                <div key={i} className={`${t.color} brutal-border absolute top-1 bottom-1 font-mono text-[10px] uppercase px-1 flex items-center`}
                  style={{ left: `${(a / BARS) * 100}%`, width: `${((b - a) / BARS) * 100}%` }}>
                  {t.name} CLIP
                </div>
              ))}
              {/* playhead */}
              <div className="absolute top-0 bottom-0 w-[2px] bg-hot" style={{ left: `${(position / TOTAL) * 100}%` }} />
            </div>
          </div>
        ))}
        {/* Master volume automation */}
        <div className="flex">
          <div className="w-32 brutal-border border-y-0 border-l-0 bg-hot text-bone font-mono text-xs uppercase p-2 flex items-center">MASTER VOL</div>
          <svg viewBox={`0 0 ${auto.length * 8} 60`} className="flex-1 h-16 bg-bone cursor-crosshair"
            onMouseMove={(e) => {
              if (!draw) return;
              const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
              const i = Math.floor(((e.clientX - rect.left) / rect.width) * auto.length);
              const v = 100 - ((e.clientY - rect.top) / rect.height) * 100;
              setAuto((a) => a.map((x, idx) => idx === i ? Math.max(0, Math.min(100, v)) : x));
            }}
            onMouseDown={() => setDraw(true)} onMouseUp={() => setDraw(false)} onMouseLeave={() => setDraw(false)}>
            <polyline fill="none" stroke="#000" strokeWidth="2"
              points={auto.map((v, i) => `${i * 8 + 4},${60 - (v / 100) * 56 - 2}`).join(" ")} />
            {auto.map((v, i) => (<circle key={i} cx={i * 8 + 4} cy={60 - (v / 100) * 56 - 2} r="2" fill="#FF2E88" />))}
            <line x1={(position / TOTAL) * auto.length * 8} x2={(position / TOTAL) * auto.length * 8} y1={0} y2={60} stroke="#FF2E88" strokeWidth={2} />
          </svg>
        </div>
      </div>

      <p className="font-mono text-xs uppercase opacity-70">▶ PLAY to hear it. Mute/solo tracks while playing. Click & drag the bottom lane to draw master-volume automation — it shapes the playback level live.</p>
    </div>
  );
}
