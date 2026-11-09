"use client";
import { useEffect, useRef } from "react";

// RGB-by-frequency spectrum meter.
// Maps each bar to a hue based on its frequency band:
//   lows  → red/orange (0 to 25°)
//   low-mids → yellow (25 to 60°)
//   mids  → green (60 to 150°)
//   high-mids → cyan/blue (150 to 230°)
//   highs → indigo/violet (230 to 300°)
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
      ctx.fillStyle = "#050506"; ctx.fillRect(0, 0, W, H);
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
        // one colour, the screen's mint, brighter as the band gets louder (design pass, 9 Nov night)
        ctx.fillStyle = `rgba(79, 227, 182, ${0.35 + v * 0.65})`;
        ctx.fillRect(i * (bw + 2) + 1, H - h - (showLabels ? 12 : 2), bw, h);
      }
      if (showLabels) {
        ctx.fillStyle = "#9A9AA0";
        ctx.font = "500 10px Outfit, system-ui";
        ctx.textBaseline = "bottom";
        const labels = ["20Hz", "200", "1k", "4k", "12k+"];
        labels.forEach((l, i) => {
          const x = (i / (labels.length - 1)) * (W - 24) + 4;
          ctx.fillText(l, x, H - 1);
        });
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [analyser, bars, showLabels]);
  return <canvas ref={ref} width={480} height={height} className="w-full" style={{ height, borderRadius: 8, background: "#050506" }} />;
}
