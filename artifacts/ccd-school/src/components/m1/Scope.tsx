"use client";
/**
 * A scope on the instrument screen and a spectrum on the mix screen (touch and hear, item 4; Vital and
 * Serum show both, Live 12's Auto Filter draws its spectrum live). The engine keeps the last 2048 samples
 * of one part (or the master) in a small ring and the worklet sends them about 30 times a second
 * (engine.rs cmd SCOPE); each screen draws one canvas on animation frames, 60 a second, 30 on a device
 * that can't keep up. Nothing is drawn while nothing plays.
 */
import { useEffect, useRef } from "react";
import { SCOPE_MASTER, type Engine } from "@/engine";

/** The latest samples from the engine's scope, kept in a ref so drawing never re-renders React. */
function useScope(engine: Engine, src: number | null) {
  const data = useRef<{ x: Float32Array | null; t: number }>({ x: null, t: 0 });
  useEffect(() => {
    if (src === null || src < 0) return;
    const off = engine.scope(src, x => { data.current = { x, t: performance.now() }; });
    return () => { off(); data.current = { x: null, t: 0 }; };
  }, [engine, src]);
  return data;
}

/** One canvas, drawn on animation frames; drops to every other frame when frames run long. */
function useCanvasLoop(draw: (ctx: CanvasRenderingContext2D, w: number, h: number, now: number) => void) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);
  drawRef.current = draw;
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let raf = 0, last = 0, slow = 0, skip = false;
    // A phone with few cores starts at 30 a second.
    let half = typeof navigator !== "undefined" && (navigator.hardwareConcurrency ?? 8) <= 4;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = last ? now - last : 16;
      last = now;
      // Frames taking longer than 24 ms for a second: draw every other one from then on.
      slow = dt > 24 ? slow + 1 : Math.max(0, slow - 1);
      if (slow > 30) half = true;
      if (half && (skip = !skip)) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.round(cv.clientWidth * dpr), h = Math.round(cv.clientHeight * dpr);
      if (!w || !h) return;
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      drawRef.current(ctx, w, h, now);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return ref;
}

/** The selected part's waveform, steadied on a rising zero crossing like a hardware scope's trigger. */
export function ScopeView({ engine, layer, color, className }: { engine: Engine; layer: number; color: string; className?: string }) {
  const data = useScope(engine, layer);
  const ref = useCanvasLoop((ctx, w, h, now) => {
    // Phosphor: the last trace fades out over a few frames, so a short hit stays readable.
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";
    const { x, t } = data.current;
    if (!x || now - t > 250) return;
    const N = Math.min(1024, x.length >> 1);
    // The last rising crossing that still leaves a full window after it.
    let at = x.length - N;
    for (let i = x.length - N; i > 1; i--) if (x[i - 1] < 0 && x[i] >= 0) { at = i; break; }
    let peak = 1e-4;
    for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(x[at + i]));
    if (peak < 1e-3) return;
    const g = (0.45 * h) / Math.max(0.05, peak);
    ctx.lineWidth = Math.max(1, h / 22);
    ctx.lineJoin = "round";
    ctx.strokeStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = h / 6;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const px = (i / (N - 1)) * w, py = h / 2 - x[at + i] * g;
      if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
    }
    ctx.stroke();
  });
  return <canvas ref={ref} className={`m1-scope ${className ?? ""}`} aria-hidden />;
}

// ── spectrum ─────────────────────────────────────────────────────────────────

/** In-place radix-2 FFT, magnitudes out. `n` a power of two. */
export function magnitudes(x: Float32Array, n = 2048): Float32Array {
  const re = new Float32Array(n), im = new Float32Array(n);
  const off = Math.max(0, x.length - n);
  for (let i = 0; i < n; i++) re[i] = (x[off + i] ?? 0) * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1)));
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = i + k, b = a + len / 2;
        const tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr; im[b] = im[a] - ti;
        re[a] += tr; im[a] += ti;
        const nr = cr * wr - ci * wi;
        ci = cr * wi + ci * wr;
        cr = nr;
      }
    }
  }
  const out = new Float32Array(n / 2);
  // Hann's coherent gain is a half: a full-scale sine reads 0 dB.
  for (let k = 0; k < n / 2; k++) out[k] = (Math.hypot(re[k], im[k]) * 4) / n;
  return out;
}

/** dB at `bands` log-spaced points from 20 Hz to 20 kHz (the same axis as the filter picture). */
export function spectrumBands(mag: Float32Array, sr: number, bands: number): Float32Array {
  const n = mag.length * 2;
  const out = new Float32Array(bands);
  for (let b = 0; b < bands; b++) {
    const f0 = 20 * Math.pow(1000, b / bands), f1 = 20 * Math.pow(1000, (b + 1) / bands);
    const k0 = Math.max(1, Math.floor((f0 * n) / sr)), k1 = Math.max(k0, Math.min(mag.length - 1, Math.ceil((f1 * n) / sr)));
    let m = 0;
    for (let k = k0; k <= k1; k++) m = Math.max(m, mag[k]);
    out[b] = 20 * Math.log10(Math.max(1e-7, m));
  }
  return out;
}

/** The master's spectrum, 20 Hz to 20 kHz, falling back slowly like an analyser's release. */
export function SpectrumView({ engine, color = "#C9CBD1", sr = 48000, className }: { engine: Engine; color?: string; sr?: number; className?: string }) {
  const data = useScope(engine, SCOPE_MASTER);
  const held = useRef<{ db: Float32Array | null; t: number }>({ db: null, t: 0 });
  const ref = useCanvasLoop((ctx, w, h, now) => {
    ctx.clearRect(0, 0, w, h);
    const { x, t } = data.current;
    const B = Math.max(24, Math.min(96, Math.round(w / 6)));
    if (x && t !== held.current.t && now - t < 250) {
      const db = spectrumBands(magnitudes(x), sr, B);
      const prev = held.current.db;
      // Rise at once, fall 18 dB a second.
      const fall = ((t - held.current.t) / 1000) * 18;
      if (prev && prev.length === B) for (let i = 0; i < B; i++) db[i] = Math.max(db[i], prev[i] - fall);
      held.current = { db, t };
    } else if (held.current.db && now - held.current.t > 400) {
      held.current.db = held.current.db.map(v => v - 1.2);
    }
    const db = held.current.db;
    if (!db || db.length !== B || db.every(v => v < -84)) return;
    const y = (v: number) => h - Math.max(0, Math.min(1, (v + 84) / 84)) * h;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let i = 0; i < B; i++) ctx.lineTo(((i + 0.5) / B) * w, y(db[i]));
    ctx.lineTo(w, h);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, color + "88");
    grad.addColorStop(1, color + "08");
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = Math.max(1, h / 40);
    ctx.strokeStyle = color;
    ctx.beginPath();
    for (let i = 0; i < B; i++) { const px = ((i + 0.5) / B) * w, py = y(db[i]); if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); }
    ctx.stroke();
  });
  return <canvas ref={ref} className={`m1-spectrum ${className ?? ""}`} aria-hidden />;
}
