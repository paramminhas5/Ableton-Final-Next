// BPMTapSim — tap along to a beat, see your BPM accuracy in real time.
// Used for: tempo-following mission
import { useCallback, useRef, useState } from "react";
import { getCtx, playKick } from "@/lib/audio";

const TARGETS = [85, 95, 105, 115, 125, 135, 145, 160];

export function BPMTapSim() {
  const [targetBpm] = useState(() => TARGETS[Math.floor(Math.random() * TARGETS.length)]);
  const [tappedBpm, setTappedBpm] = useState<number | null>(null);
  const [taps, setTaps] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [accuracy, setAccuracy] = useState<"great" | "close" | "off" | null>(null);
  const tapTimesRef = useRef<number[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextRef = useRef(0);
  const beatRef = useRef(0);

  const startMetronome = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    setPlaying(true);
    tapTimesRef.current = [];
    setTaps(0);
    setTappedBpm(null);
    setAccuracy(null);
    const step = 60 / targetBpm;
    nextRef.current = ctx.currentTime + 0.1;
    beatRef.current = 0;

    const tick = () => {
      const ctx2 = getCtx();
      if (!ctx2) return;
      while (nextRef.current < ctx2.currentTime + 0.3) {
        playKick(nextRef.current - ctx2.currentTime);
        nextRef.current += step;
        beatRef.current++;
      }
    };
    tick();
    timerRef.current = setInterval(tick, 50);
    setTimeout(() => {
      if (timerRef.current) clearInterval(timerRef.current);
      setPlaying(false);
    }, 8000);
  }, [targetBpm]);

  const tap = () => {
    const now = performance.now();
    tapTimesRef.current.push(now);
    const times = tapTimesRef.current;
    if (times.length < 2) {
      setTaps(1);
      return;
    }
    // Average intervals of last 8 taps
    const recent = times.slice(-8);
    const intervals = recent.slice(1).map((t, i) => t - recent[i]);
    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const bpm = Math.round(60000 / avg);
    setTappedBpm(bpm);
    setTaps(times.length);
    const diff = Math.abs(bpm - targetBpm);
    setAccuracy(diff <= 3 ? "great" : diff <= 8 ? "close" : "off");
  };

  const stop = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPlaying(false);
  };

  const accentColor =
    accuracy === "great"
      ? "bg-acid text-ink"
      : accuracy === "close"
        ? "bg-sun text-ink"
        : accuracy === "off"
          ? "bg-hot text-bone"
          : "bg-bone";

  return (
    <div className="space-y-4">
      <div className="brutal-border bg-ink text-bone p-4">
        <div className="font-mono text-[10px] uppercase opacity-60">Target BPM</div>
        <div className="font-display text-6xl">{targetBpm}</div>
        <div className="font-mono text-xs opacity-60 mt-1">
          Tap along to the kick. Live's Tempo Follower does this — but with your band.
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={playing ? stop : startMetronome}
          className={`brutal-border px-4 py-3 font-display text-xl brutal-press ${playing ? "bg-hot text-bone" : "bg-acid text-ink"}`}
        >
          {playing ? "■ Stop" : "▶ Play Beat"}
        </button>

        <button
          onPointerDown={tap}
          className="brutal-border bg-volt text-bone px-4 py-3 font-display text-xl brutal-press select-none touch-none"
        >
          TAP
        </button>
      </div>

      {tappedBpm !== null && (
        <div className={`brutal-border p-4 animate-fade-in ${accentColor}`}>
          <div className="font-mono text-[10px] uppercase opacity-70">Your BPM ({taps} taps)</div>
          <div className="font-display text-5xl">{tappedBpm}</div>
          <div className="font-mono text-sm mt-1">
            {accuracy === "great"
              ? `Perfect! Off by ${Math.abs(tappedBpm - targetBpm)} BPM`
              : accuracy === "close"
                ? `Close — off by ${Math.abs(tappedBpm - targetBpm)} BPM`
                : `Off by ${Math.abs(tappedBpm - targetBpm)} BPM — keep tapping`}
          </div>
        </div>
      )}

      <div className="brutal-border bg-bone p-3 font-mono text-[10px] uppercase opacity-60 leading-relaxed">
        Tempo Follower in Live does this automatically — it listens to an audio input (drummer, DJ)
        and adjusts Live's BPM to match in real time.
      </div>
    </div>
  );
}
