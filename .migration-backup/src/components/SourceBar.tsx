// Source picker + transport for any device lab.
// Bulletproof: lazy source creation, guaranteed test tone, live peak meter.
import { useEffect, useRef, useState } from "react";
import { createSource, type SourceHandle } from "@/lib/source";
import { getCtx, getMaster, playTone, midiToFreq, type SampleName } from "@/lib/audio";

const SAMPLES: { id: SampleName; label: string }[] = [
  { id: "drum-loop", label: "DRUMS" },
  { id: "bass-loop", label: "BASS" },
  { id: "chord-pad", label: "CHORDS" },
  { id: "vox-chop", label: "VOX" },
  { id: "full-mix", label: "FULL MIX" },
];

export function SourceBar({
  onReady,
  defaultSample = "drum-loop",
}: {
  onReady: (src: SourceHandle) => void;
  defaultSample?: SampleName;
}) {
  const [sample, setSample] = useState<SampleName>(defaultSample);
  const [playing, setPlaying] = useState(false);
  const [bpm, setBpm] = useState(100);
  const [ctxState, setCtxState] = useState<string>("idle");
  const [peak, setPeak] = useState(0);

  const srcRef = useRef<SourceHandle | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number>(0);

  // Build source lazily so AudioContext is unlocked first by user gesture.
  const ensureSource = async () => {
    const c = getCtx();
    if (!c) return null;
    if (c.state !== "running") {
      try { await c.resume(); } catch {}
    }
    setCtxState(c.state);
    if (!srcRef.current) {
      const s = createSource(sample, bpm);
      // Insert an analyser between source and consumer so we can prove signal.
      const an = c.createAnalyser();
      an.fftSize = 512;
      s.source.connect(an);
      analyserRef.current = an;
      srcRef.current = s;
      onReady(s);
    }
    return srcRef.current;
  };

  // Live peak meter — proves audio is actually flowing.
  useEffect(() => {
    const tick = () => {
      const an = analyserRef.current;
      if (an) {
        const buf = new Uint8Array(an.fftSize);
        an.getByteTimeDomainData(buf);
        let max = 0;
        for (let i = 0; i < buf.length; i++) {
          const v = Math.abs(buf[i] - 128);
          if (v > max) max = v;
        }
        setPeak(max / 128);
      }
      const c = getCtx();
      if (c) setCtxState(c.state);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => () => { srcRef.current?.stop(); }, []);

  const togglePlay = async () => {
    const s = await ensureSource();
    if (!s) return;
    if (playing) { s.stop(); setPlaying(false); }
    else { s.start(); setPlaying(true); }
  };

  const playTestTone = async () => {
    const c = getCtx();
    if (!c) return;
    if (c.state !== "running") { try { await c.resume(); } catch {} }
    setCtxState(c.state);
    // Direct to master — bypasses the device chain entirely.
    const t0 = c.currentTime;
    [60, 64, 67, 72].forEach((n, i) =>
      playTone(midiToFreq(n), 0.05 + i * 0.18, 0.25, "triangle", 0.35, getMaster())
    );
    void t0;
  };

  const changeSample = (n: SampleName) => {
    setSample(n);
    srcRef.current?.setSample(n);
  };
  const changeBpm = (b: number) => {
    setBpm(b);
    srcRef.current?.setBpm(b);
  };

  const peakPct = Math.min(100, Math.round(peak * 140));
  const peakColor = peak > 0.7 ? "bg-hot" : peak > 0.05 ? "bg-acid" : "bg-bone";

  return (
    <div className="brutal-border bg-ink text-bone p-3 space-y-3">
      <div className="flex flex-wrap gap-3 items-center">
        <button
          onClick={togglePlay}
          className={`brutal-border px-4 py-3 font-display text-lg brutal-press ${
            playing ? "bg-hot text-bone" : "bg-acid text-ink"
          }`}
        >
          {playing ? "■ STOP" : "▶ PLAY"}
        </button>

        <button
          onClick={playTestTone}
          className="brutal-border bg-sun text-ink px-3 py-2 font-mono text-xs uppercase brutal-press"
          title="Plays a chord straight to your speakers — proves your output works"
        >
          ♪ TEST TONE
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
            onChange={(e) => changeBpm(+e.target.value)} className="w-28" />
          <span className="brutal-border bg-bone text-ink px-2 py-0.5 min-w-[40px] text-center">{bpm}</span>
        </label>
      </div>

      {/* Diagnostic strip */}
      <div className="flex items-center gap-3 font-mono text-[10px] uppercase">
        <span className={`px-2 py-0.5 brutal-border ${ctxState === "running" ? "bg-acid text-ink" : "bg-hot text-bone"}`}>
          CTX: {ctxState}
        </span>
        <span>SIGNAL</span>
        <div className="flex-1 h-3 brutal-border bg-bone overflow-hidden">
          <div className={`h-full transition-all ${peakColor}`} style={{ width: `${peakPct}%` }} />
        </div>
        <span className="w-10 text-right">{peakPct}%</span>
      </div>
    </div>
  );
}
