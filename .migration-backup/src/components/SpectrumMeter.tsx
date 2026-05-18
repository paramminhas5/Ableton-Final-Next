import { useEffect, useRef } from "react";

// RGB-by-frequency spectrum meter.
// Maps each bar to a hue based on its frequency band:
//   lows  → red/orange (0–25°)
//   low-mids → yellow (25–60°)
//   mids  → green (60–150°)
//   high-mids → cyan/blue (150–230°)
//   highs → indigo/violet (230–300°)
export function SpectrumMeter({
  analyser,
  height = 80,
  bars = 48,
  showLabels = true,
}: {
  analyser: AnalyserNode | null;
  height?: number;
  bars?: number;
  showLabels?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!analyser || !ref.current) return;
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    let raf = 0;
    const draw = () => {
      analyser.getByteFrequencyData(data);
      const W = canvas.width, H = canvas.height;
      ctx.fillStyle = "#F5F1E8"; ctx.fillRect(0, 0, W, H);
      // Use log-ish band grouping so lows aren't crammed into one bar.
      const bw = W / bars - 2;
      const nyquistBins = data.length;
      for (let i = 0; i < bars; i++) {
        const t0 = Math.pow(i / bars, 2);
        const t1 = Math.pow((i + 1) / bars, 2);
        const lo = Math.floor(t0 * nyquistBins);
        const hi = Math.max(lo + 1, Math.floor(t1 * nyquistBins));
        let sum = 0;
        for (let j = lo; j < hi; j++) sum += data[j];
        const v = sum / (hi - lo) / 255;
        const h = v * (H - (showLabels ? 12 : 2));
        // Hue ramp red→violet across bands. saturation high, lightness scales with level.
        const hue = (i / bars) * 290; // 0..290 deg
        const light = 35 + v * 30;
        ctx.fillStyle = `hsl(${hue}, 95%, ${light}%)`;
        ctx.fillRect(i * (bw + 2) + 1, H - h - (showLabels ? 12 : 2), bw, h);
      }
      if (showLabels) {
        ctx.fillStyle = "#0A0A0A";
        ctx.font = "9px monospace";
        ctx.textBaseline = "bottom";
        const labels = ["20Hz", "200", "1k", "4k", "12k+"];
        labels.forEach((l, i) => {
          const x = (i / (labels.length - 1)) * (W - 24) + 4;
          ctx.fillText(l, x, H - 1);
        });
      }
      ctx.strokeStyle = "#0A0A0A"; ctx.lineWidth = 3;
      ctx.strokeRect(1.5, 1.5, W - 3, H - 3);
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [analyser, bars, showLabels]);
  return <canvas ref={ref} width={480} height={height} className="w-full brutal-border bg-bone" style={{ height }} />;
}
