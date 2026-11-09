"use client";
import "./studio.css";
/**
 * A session player on a part (Logic Pro's Drummer and Bass Player): drag the puck, left to right from
 * simple to complex, bottom to top from soft to loud; fill and swing below. Every move writes ordinary
 * notes into your part that you can edit after, and each drag is one undo step.
 */
import { useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { PLAYER_DEFAULT, type PlayerSettings } from "@/lib/players";
import { newSeed } from "@/lib/dice";
import { CAP, Dice, Knob } from "./controls";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function PlayerSurface({ kind, settings, color, onApply, note }: {
  kind: "drummer" | "bass";
  settings?: PlayerSettings;
  color: string;
  /** Write the part with these settings. `first` is the first change of a gesture (one undo step). */
  onApply: (p: PlayerSettings, first: boolean) => void;
  /** One line under the pad: what it follows. */
  note: ReactNode;
}) {
  const [p, setP] = useState<PlayerSettings>(settings ?? PLAYER_DEFAULT);
  const pid = useRef<number | null>(null);
  const last = useRef(0);
  const set = (next: PlayerSettings, gesture = false) => {
    setP(next);
    const now = Date.now();
    // A drag is one undo step; a separate tap or turn more than a moment later is another.
    const first = !gesture || now - last.current > 600;
    last.current = now;
    onApply(next, first);
  };
  const fromPointer = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = clamp01((e.clientX - r.left) / r.width), y = clamp01((e.clientY - r.top) / r.height);
    set({ ...p, complexity: Math.round(x * 100) / 100, intensity: Math.round((1 - y) * 100) / 100 }, true);
  };
  const label = kind === "drummer" ? "drummer" : "bass player";
  return (
    <div className="st-player" style={{ ["--c" as string]: color } as CSSProperties}>
      <div
        data-budget="surface" className="st-tray st-xy st-playerxy"
        role="slider"
        tabIndex={0}
        aria-label={`${label}: left to right simple to complex, bottom to top soft to loud`}
        aria-valuetext={`complexity ${Math.round(p.complexity * 100)}%, intensity ${Math.round(p.intensity * 100)}%`}
        style={{ touchAction: "none", position: "relative" }}
        onKeyDown={e => {
          const d: Record<string, [number, number]> = { ArrowLeft: [-0.05, 0], ArrowRight: [0.05, 0], ArrowUp: [0, 0.05], ArrowDown: [0, -0.05] };
          const m = d[e.key];
          if (!m) return;
          e.preventDefault();
          set({ ...p, complexity: clamp01(Math.round((p.complexity + m[0]) * 100) / 100), intensity: clamp01(Math.round((p.intensity + m[1]) * 100) / 100) }, true);
        }}
        onPointerDown={e => { e.preventDefault(); try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* synthetic */ } pid.current = e.pointerId; last.current = 0; fromPointer(e); }}
        onPointerMove={e => pid.current === e.pointerId && fromPointer(e)}
        onPointerUp={() => (pid.current = null)}
        onPointerCancel={() => (pid.current = null)}
      >
        <span className="st-xy-l" style={{ top: 10 }}>loud</span>
        <span className="st-xy-l" style={{ bottom: 10 }}>soft</span>
        <span className="st-xy-l st-xy-r" style={{ bottom: 10 }}>complex</span>
        <span className="st-xy-l st-xy-r" style={{ top: 10 }}>{label}</span>
        <span className="st-xy-h" style={{ top: `${(1 - p.intensity) * 100}%` }} />
        <span className="st-xy-v" style={{ left: `${p.complexity * 100}%` }} />
        <span className="st-orb st-puck" style={{ left: `${p.complexity * 100}%`, top: `${(1 - p.intensity) * 100}%` }} />
      </div>
      <div className="st-playerrow">
        <Dice amount={p.fill} onAmount={v => set({ ...p, fill: Math.round(v * 100) / 100 }, true)} onRoll={() => set({ ...p, seed: newSeed() })} label="fill" width={96} />
        <Knob label="swing" size={26} color={CAP.grey} value={p.swing / 0.75} defaultValue={0} readout={`${Math.round(p.swing * 100)}%`} onChange={v => set({ ...p, swing: Math.round(v * 0.75 * 100) / 100 }, true)} style={{ width: 60, height: 60, aspectRatio: "auto" }} />
      </div>
      <div className="st-ss st-playernote">{note}</div>
    </div>
  );
}
