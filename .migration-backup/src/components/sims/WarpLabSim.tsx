import { useEffect, useRef, useState } from "react";
import { getCtx, playKick, playSnare, playHat } from "@/lib/audio";

// Drag warp markers along a "waveform" so transients (peaks) align to grid (vertical bars).
export function WarpLabSim() {
  const W = 800,
    H = 90; // height per lane
  const peaks = [0.05, 0.21, 0.41, 0.7, 0.95]; // transients (fractions of width)
  const [markers, setMarkers] = useState<number[]>([0, 0.25, 0.5, 0.75, 1]);
  const [playing, setPlaying] = useState(false);
  const [warped, setWarped] = useState(false);
  const markersRef = useRef(markers);
  markersRef.current = markers;
  const warpedRef = useRef(warped);
  warpedRef.current = warped;
  const drag = useRef<number | null>(null);
  const ref = useRef<SVGSVGElement | null>(null);

  const onMove = (e: React.PointerEvent) => {
    if (drag.current == null || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setMarkers((m) => m.map((v, i) => (i === drag.current ? x : v)));
  };
  const stop = () => {
    drag.current = null;
  };
  useEffect(() => {
    window.addEventListener("pointerup", stop);
    return () => window.removeEventListener("pointerup", stop);
  }, []);

  // score: distance peaks → nearest marker (lower = better)
  const score = peaks.reduce((s, p) => {
    const targets = [0, 0.25, 0.5, 0.75, 1]; // grid
    const idx = markers.reduce(
      (best, m, i) => (Math.abs(m - p) < Math.abs(markers[best] - p) ? i : best),
      0,
    );
    return s + Math.abs(targets[idx] - p);
  }, 0);
  const aligned = score < 0.25;

  useEffect(() => {
    if (!playing) return;
    const c = getCtx();
    if (!c) return;
    let stopped = false;
    const bpm = 100,
      beat = 60 / bpm,
      bar = beat * 4;
    let next = c.currentTime + 0.2;
    const grid = [0, 0.25, 0.5, 0.75, 1];
    const hits: ((tt: number) => void)[] = [
      (tt) => playKick(tt - c.currentTime),
      (tt) => playHat(tt - c.currentTime),
      (tt) => playSnare(tt - c.currentTime),
      (tt) => playHat(tt - c.currentTime),
      (tt) => playKick(tt - c.currentTime),
    ];
    const sched = (t: number) => {
      // Without warping: hits play at the SAMPLE'S transient positions (off-grid)
      // With warping: hits play at the marker positions (which user is dragging onto grid)
      const positions = warpedRef.current ? markersRef.current : peaks;
      positions.forEach((p, i) => hits[i] && hits[i](t + p * bar));
    };
    const tick = () => {
      if (stopped) return;
      while (next < c.currentTime + 0.3) {
        sched(next);
        next += bar;
      }
      setTimeout(tick, 60);
    };
    tick();
    return () => {
      stopped = true;
    };
  }, [playing]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <button
          onClick={() => setPlaying((p) => !p)}
          className="brutal-border bg-acid px-3 py-2 font-mono uppercase brutal-press"
        >
          {playing ? "■ Stop" : "▶ Play"}
        </button>
        <button
          onClick={() => setWarped((w) => !w)}
          className={`brutal-border px-3 py-2 font-mono uppercase brutal-press ${warped ? "bg-volt text-bone" : "bg-bone"}`}
        >
          Warp: {warped ? "ON" : "OFF"}
        </button>
        <span className="font-mono text-xs uppercase opacity-70">
          Off = raw sample (off-grid). On = hits play at your marker positions.
        </span>
      </div>
      {/* RAW lane — shows the unprocessed sample with markers users drag */}
      <div className="font-mono text-[10px] uppercase opacity-70">
        RAW SAMPLE — drag pink markers onto the transient peaks
      </div>
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full brutal-border bg-card cursor-grab touch-none"
        onPointerMove={onMove}
      >
        {[0, 0.25, 0.5, 0.75, 1].map((g, i) => (
          <line key={i} x1={g * W} x2={g * W} y1={0} y2={H} stroke="black" strokeDasharray="4 4" />
        ))}
        {Array.from({ length: 200 }).map((_, i) => {
          const x = (i / 200) * W;
          const peakNear = peaks.reduce(
            (m, p) => Math.max(m, Math.exp(-((x / W - p) ** 2) * 800)),
            0,
          );
          const h = 4 + peakNear * (H - 12) + ((i * 37) % 6);
          return (
            <line
              key={i}
              x1={x}
              x2={x}
              y1={H / 2 - h / 2}
              y2={H / 2 + h / 2}
              stroke="#000"
              strokeWidth={2}
            />
          );
        })}
        {markers.map((m, i) => (
          <g key={i} onPointerDown={() => (drag.current = i)} style={{ cursor: "grab" }}>
            <line x1={m * W} x2={m * W} y1={0} y2={H} stroke="#FF2E88" strokeWidth={3} />
            <rect x={m * W - 8} y={0} width={16} height={14} fill="#FF2E88" />
            <text
              x={m * W}
              y={11}
              textAnchor="middle"
              fontSize="10"
              fill="white"
              fontFamily="monospace"
            >
              {i + 1}
            </text>
          </g>
        ))}
      </svg>

      {/* WARPED lane — same waveform stretched so each marker→grid segment maps onto the grid cell */}
      <div className="font-mono text-[10px] uppercase opacity-70 mt-2">
        WARPED RESULT — what Live plays back ({warped ? "live" : "preview"})
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full brutal-border bg-volt/20">
        {[0, 0.25, 0.5, 0.75, 1].map((g, i) => (
          <line key={i} x1={g * W} x2={g * W} y1={0} y2={H} stroke="black" strokeDasharray="4 4" />
        ))}
        {Array.from({ length: 200 }).map((_, i) => {
          const xOut = i / 200; // 0..1 in the warped (output) timeline
          // Inverse warp: find which segment xOut falls into, then map back to source-time using the marker positions
          const sortedM = [...markers].sort((a, b) => a - b);
          const grid = [0, 0.25, 0.5, 0.75, 1];
          let xSrc = xOut;
          for (let s = 0; s < grid.length - 1; s++) {
            if (xOut >= grid[s] && xOut <= grid[s + 1]) {
              const localT = (xOut - grid[s]) / (grid[s + 1] - grid[s]);
              xSrc = sortedM[s] + localT * (sortedM[s + 1] - sortedM[s]);
              break;
            }
          }
          const peakNear = peaks.reduce(
            (m, p) => Math.max(m, Math.exp(-((xSrc - p) ** 2) * 800)),
            0,
          );
          const h = 4 + peakNear * (H - 12) + ((i * 37) % 6);
          return (
            <line
              key={i}
              x1={xOut * W}
              x2={xOut * W}
              y1={H / 2 - h / 2}
              y2={H / 2 + h / 2}
              stroke="#5b21b6"
              strokeWidth={2}
            />
          );
        })}
      </svg>
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs uppercase">Alignment:</span>
        <span
          className={`brutal-border px-3 py-1 font-mono uppercase ${aligned ? "bg-acid" : "bg-hot text-bone"}`}
        >
          {aligned ? "LOCKED" : "DRIFTING"} ({score.toFixed(2)})
        </span>
      </div>
      <p className="font-mono text-xs opacity-70">
        Drag the pink warp markers onto the transient peaks (the dashed lines are the grid).
      </p>
    </div>
  );
}
