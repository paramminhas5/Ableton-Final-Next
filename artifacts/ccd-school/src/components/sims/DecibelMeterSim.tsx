"use client";
// DecibelMeterSim — move a fader, hear the volume change, see dB meter.
// Replaces KnobTrainerSim on amplitude/volume missions.
import { useRef, useState, useEffect } from "react";
import { getCtx } from "@/lib/audio";

const DB_STOPS = [
  { db: -60, label: "Silence",         color: "#333" },
  { db: -40, label: "Bedroom whisper", color: "#555" },
  { db: -20, label: "Normal",          color: "#C6FF00" },
  { db: -12, label: "Good level",      color: "#C6FF00" },
  { db:  -6, label: "Hot",             color: "#FFB800" },
  { db:   0, label: "CLIP! ⚠",         color: "#FF3B30" },
];

function dbToLinear(db: number) {
  return Math.pow(10, db / 20);
}

function linearToDb(linear: number) {
  if (linear <= 0) return -Infinity;
  return 20 * Math.log10(linear);
}

export function DecibelMeterSim() {
  const [fader, setFader] = useState(70); // 0–100 maps to -60dB–0dB
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const playingRef = useRef(false);
  const [playing, setPlaying] = useState(false);

  // fader 0 = -60dB, fader 100 = 0dBFS
  const db = -60 + (fader / 100) * 60;
  const linear = dbToLinear(db);
  const isClipping = db >= 0;
  const isHot = db >= -6;

  const meterPct = Math.max(0, Math.min(100, (db + 60) / 60 * 100));

  const meterColor = isClipping ? "#FF3B30" : isHot ? "#FFB800" : "#C6FF00";

  const startTone = async () => {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state !== "running") { try { await ctx.resume(); } catch {} }
    if (playingRef.current) return;
    playingRef.current = true;
    setPlaying(true);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.value = 220;
    gain.gain.value = isClipping ? 1.0 : linear * 0.8;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    oscRef.current = osc;
    gainRef.current = gain;
    ctxRef.current = ctx;
  };

  const stopTone = () => {
    if (!playingRef.current) return;
    playingRef.current = false;
    setPlaying(false);
    try { oscRef.current?.stop(); } catch {}
    oscRef.current = null;
    gainRef.current = null;
  };

  // Update gain in real time while dragging
  useEffect(() => {
    if (gainRef.current && ctxRef.current) {
      gainRef.current.gain.setTargetAtTime(
        isClipping ? 1.0 : linear * 0.8,
        ctxRef.current.currentTime,
        0.01,
      );
    }
  }, [fader, linear, isClipping]);

  // Cleanup on unmount
  useEffect(() => () => stopTone(), []);

  const label = DB_STOPS.slice().reverse().find(s => db >= s.db)?.label ?? "Silence";

  return (
    <div className="space-y-4">
      <div className="brutal-border bg-ink text-bone p-4">
        <div className="font-mono text-[10px] uppercase opacity-60">Decibel Meter</div>
        <div className="font-display text-2xl mt-1">HEAR THE VOLUME — SEE THE dB</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Fader column */}
        <div className="brutal-border p-4 flex flex-col items-center gap-3">
          <div className="font-mono text-[10px] uppercase opacity-60">Fader</div>
          <input
            type="range" min={0} max={100} value={fader}
            onChange={e => setFader(+e.target.value)}
            className="accent-acid"
            style={{ writingMode: "vertical-lr", direction: "rtl", height: 160, width: 32 }}
          />
          <div className={`font-display text-3xl ${isClipping ? "text-hot" : ""}`}>
            {db >= 0 ? "0.0" : db.toFixed(1)} dB
          </div>
          <div className="font-mono text-[9px] uppercase opacity-60">{label}</div>
        </div>

        {/* Meter column */}
        <div className="brutal-border p-4 flex flex-col gap-2">
          <div className="font-mono text-[10px] uppercase opacity-60">Level Meter</div>
          <div className="relative flex-1 brutal-border bg-ink overflow-hidden" style={{ minHeight: 160 }}>
            <div
              className="absolute bottom-0 left-0 right-0 transition-all duration-75"
              style={{ height: `${meterPct}%`, background: meterColor }}
            />
            {/* dBFS scale markers */}
            {[-60,-40,-20,-12,-6,0].map(d => (
              <div
                key={d}
                className="absolute right-0 font-mono text-[8px] opacity-50 pr-1"
                style={{ bottom: `${(d + 60) / 60 * 100}%`, transform: "translateY(50%)" }}
              >
                {d === 0 ? "0 dBFS" : `${d}`}
              </div>
            ))}
          </div>
          {isClipping && (
            <div className="brutal-border bg-hot text-bone px-2 py-1 font-mono text-[10px] uppercase text-center animate-pulse">
              CLIPPING ⚠ Distortion!
            </div>
          )}
        </div>
      </div>

      {/* Play/stop */}
      <button
        onPointerDown={startTone}
        onPointerUp={stopTone}
        onPointerLeave={stopTone}
        className={`brutal-border w-full py-4 font-display text-2xl brutal-press transition-colors ${
          playing ? "bg-hot text-bone" : "bg-acid text-ink"
        }`}
      >
        {playing ? "▶ HOLD TO HEAR ◀" : "▶ HOLD & DRAG FADER"}
      </button>

      <div className="grid grid-cols-2 gap-2">
        {DB_STOPS.slice(2).map(s => (
          <div key={s.db} className="brutal-border p-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
            <div>
              <div className="font-display text-sm">{s.db} dB</div>
              <div className="font-mono text-[9px] opacity-60">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="brutal-border bg-sun/20 p-3 font-mono text-xs leading-relaxed">
        <strong>Rule:</strong> Never exceed 0 dBFS in a DAW — that is the digital ceiling. 
        Clipping creates harsh distortion that cannot be undone. Aim for peaks at -6 dB.
      </div>
    </div>
  );
}
