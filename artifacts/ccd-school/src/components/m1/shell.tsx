"use client";
/** Model 1 shell: header, mode bar, world dial, the track as lanes on the screen. */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type CSSProperties } from "react";
import { FLAG, OUT, getEngine } from "@/engine";
import { Icon, LED } from "./controls";
import type { Layer, Track } from "@/lib/track";
import { KIND } from "@/lib/track";

export const CAT_SRC = "/brand/ccd-cat.png";

export function CatMark({ size = 26 }: { size?: number }) {
  // Tap the cat and it spins (fix 15).
  const [spin, setSpin] = useState(0);
  return (
    <span aria-hidden onPointerDown={() => setSpin(n => n + 1)} style={{ width: size, height: size, borderRadius: "50%", background: "#0B0B0C", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 0 var(--hi), inset 0 1px 2px rgba(255,255,255,.15)", flex: "none", cursor: "pointer" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img key={spin} src={CAT_SRC} alt="" className={spin ? "m1-spin" : ""} style={{ width: size * 0.8 }} />
    </span>
  );
}

/**
 * The cat moves with the beat, or not at all (process.md). While the engine plays, <html> gets
 * `ccd-playing` and `--beat-ms` (one beat at the tempo that is playing); `.m1-dancing` sways on it.
 */
export function BeatSync() {
  useEffect(() => {
    const root = document.documentElement;
    let last: { beat: number; t: number } | null = null;
    let ms = 500;
    const off = getEngine().on(evs => {
      for (const e of evs) {
        if (e.kind !== OUT.pos) continue;
        const playing = !!(e.flags & FLAG.playing);
        if (!playing) { if (root.classList.contains("ccd-playing")) root.classList.remove("ccd-playing"); last = null; continue; }
        const t = performance.now();
        if (last && e.beat > last.beat + 0.25) {
          const est = (t - last.t) / (e.beat - last.beat);
          if (est > 200 && est < 2000) { ms = ms * 0.7 + est * 0.3; root.style.setProperty("--beat-ms", `${Math.round(ms)}ms`); }
          last = { beat: e.beat, t };
        } else if (!last || e.beat < last.beat) last = { beat: e.beat, t };
        if (!root.classList.contains("ccd-playing")) root.classList.add("ccd-playing");
      }
    });
    return () => { off(); root.classList.remove("ccd-playing"); };
  }, []);
  return null;
}

export function WeekDots({ days }: { days: number }) {
  const lit = Math.min(7, days);
  return (
    <span role="img" aria-label={`${days} day streak`} style={{ display: "flex", gap: 4 }}>
      {Array.from({ length: 7 }, (_, i) => (
        <span key={i} style={{ width: 6, height: 6, borderRadius: 3, background: i < lit ? "var(--ink)" : "var(--ledoff)", boxShadow: "inset 0 1px 1px rgba(0,0,0,.2)" }} />
      ))}
    </span>
  );
}

export const MODES = [
  { id: "learn", label: "learn", href: "/dashboard", match: (p: string) => p === "/" || p === "/dashboard" || p.startsWith("/world") || p.startsWith("/learn") || p.startsWith("/path") || p === "/worlds" },
  { id: "practice", label: "practice", href: "/gym", match: (p: string) => ["/gym", "/review", "/daily", "/beat", "/train", "/challenge", "/match", "/dj"].some(x => p.startsWith(x)) },
  { id: "studio", label: "studio", href: "/studio", match: (p: string) => p.startsWith("/studio") || p.startsWith("/build") || p.startsWith("/playground") },
  { id: "library", label: "library", href: "/atlas", match: (p: string) => ["/atlas", "/devices", "/device", "/glossary", "/plugins", "/signal-flow", "/wiki", "/shortcuts"].some(x => p.startsWith(x)) },
] as const;

const HIDE = [/^\/$/, /^\/studio/, /^\/world\/[^/]+\/challenge/, /^\/gym\/remakes/, /^\/lab\//, /^\/learn\/[^/]+/, /^\/mission\/[^/]+/, /^\/placement/, /^\/onboarding/, /^\/login/];

/** Four mode keys. The one you are in has a black cap and its light on. */
export function ModeBar() {
  const pathname = usePathname() ?? "/";
  if (HIDE.some(r => r.test(pathname))) return null;
  return (
    <nav aria-label="Modes" className="m1-g m1-modebar" style={{ position: "fixed", left: "max(16px, calc(50% - 204px))", right: "max(16px, calc(50% - 204px))", bottom: "calc(16px + env(safe-area-inset-bottom, 0px))", zIndex: 40, maxWidth: 408, margin: "0 auto", padding: "10px 8px 0", borderRadius: 18, background: "var(--deck2)", boxShadow: "0 -14px 18px -4px var(--deck2)" }}>
      {MODES.map(m => {
        const on = m.match(pathname);
        return (
          <Link key={m.id} href={m.href} className="m1-m" aria-label={m.label} aria-current={on ? "page" : undefined}>
            <span className={`m1-dot ${on ? "is-on" : ""}`} style={{ ["--c" as string]: LED.white } as CSSProperties} />
            <span className={`m1-cap ${on ? "is-blk" : ""}`} style={{ width: "52%", marginTop: -9 }}><Icon name={m.id} /></span>
            <span className={`m1-ml ${on ? "is-on" : ""}`}>{m.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/** Detented world dial. Labels sit outside the ticks so they never overlap. */
export function WorldDial({ value, onChange, width = 166, height = 146, size = 66 }: {
  value: "fundamentals" | "dj" | "producer";
  onChange?: (w: "fundamentals" | "dj" | "producer") => void;
  width?: number; height?: number; size?: number;
}) {
  const opts = [
    { id: "fundamentals" as const, label: "basics", a: -150, c: LED.mint },
    { id: "dj" as const, label: "dj", a: -90, c: LED.cobalt },
    { id: "producer" as const, label: "producer", a: -30, c: LED.go },
  ];
  const sel = Math.max(0, opts.findIndex(o => o.id === value));
  const cx = width / 2, cy = height / 2 + 10;
  const rIn = size / 2 + 8, rOut = size / 2 + 15;
  const turn = () => onChange?.(opts[(sel + 1) % 3].id);
  return (
    <div role="radiogroup" aria-label="World" style={{ position: "relative", width, height }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }} aria-hidden>
        {opts.map((o, i) => {
          const ar = (o.a * Math.PI) / 180;
          const on = i === sel;
          const x1 = cx + rOut * Math.cos(ar), y1 = cy + rOut * Math.sin(ar);
          const tx = o.a === -90 ? cx : o.a < -90 ? 4 : width - 4;
          const ty = o.a === -90 ? y1 - 7 : y1 - 8;
          const anchor = o.a === -90 ? "middle" : o.a < -90 ? "start" : "end";
          return (
            <g key={o.id}>
              <path d={`M${cx + rIn * Math.cos(ar)} ${cy + rIn * Math.sin(ar)}L${x1} ${y1}`} style={{ stroke: on ? o.c : "var(--print)" }} strokeWidth={on ? 2.6 : 1.4} strokeLinecap="round" />
              <text x={tx} y={ty + 1} textAnchor={anchor} fontFamily="Outfit" fontSize={11} fontWeight={on ? 600 : 500} style={{ fill: "var(--ehi)" }}>{o.label}</text>
              <text x={tx} y={ty} textAnchor={anchor} fontFamily="Outfit" fontSize={11} fontWeight={on ? 600 : 500} style={{ fill: on ? "var(--ink)" : "var(--print)" }}>{o.label}</text>
            </g>
          );
        })}
      </svg>
      {opts.map((o, i) => (
        <button key={o.id} type="button" role="radio" aria-checked={i === sel} aria-label={o.label} onClick={() => onChange?.(o.id)}
          style={{ position: "absolute", top: 0, height: 34, left: i === 0 ? 0 : i === 1 ? width / 2 - 24 : width - 64, width: i === 1 ? 48 : 64, background: "none", border: 0, minHeight: 0, minWidth: 0, cursor: "pointer" }} />
      ))}
      <button type="button" onClick={turn} aria-label="Turn to the next world" className="m1-well"
        style={{ position: "absolute", left: cx - size / 2 - 8, top: cy - size / 2 - 8, width: size + 16, height: size + 16, border: 0, padding: 0, minHeight: 0, minWidth: 0, cursor: "pointer" }}>
        <span className="m1-kb" style={{ width: size, height: size, marginTop: -4 }}>
          <span className="m1-kc" style={{ ["--c" as string]: "var(--c0)", width: size * 0.66, height: size * 0.66, display: "block" } as CSSProperties}>
            <b style={{ background: opts[sel].c, boxShadow: `0 0 5px ${opts[sel].c}`, transform: `rotate(${opts[sel].a + 90}deg)` }} />
          </span>
        </span>
      </button>
    </div>
  );
}

/** Your track on the screen: one lane per layer, a block per active step. */
export function Lanes({ track, next, sel, solo, onLane, width = 338, playhead = -1 }: {
  track: Track;
  next?: { kind: Layer["kind"]; isNew: boolean } | null;
  sel?: string | null;
  solo?: string | null;
  onLane?: (id: string) => void;
  width?: number;
  playhead?: number;
}) {
  const rows: { id: string; name: string; color: string; steps: boolean[]; ghost?: boolean; muted?: boolean }[] = track.layers.map(l => ({
    id: l.id, name: l.label ?? KIND[l.kind].label, color: KIND[l.kind].color, steps: l.steps, muted: l.mute,
  }));
  if (next?.isNew && rows.length < 8) rows.push({ id: "__next", name: next.kind, color: KIND[next.kind].color, steps: [], ghost: true });
  const lh = rows.length > 5 ? 7 : 10, gap = rows.length > 5 ? 8 : 12, nameW = 54, top = 12;
  const h = top + Math.max(1, rows.length) * (lh + gap);
  const x0 = nameW, x1 = width;
  const sw = (x1 - x0) / 16;
  return (
    <svg viewBox={`0 0 ${width} ${h}`} width="100%" style={{ display: "block", overflow: "visible" }} role="img" aria-label={`Your track: ${rows.filter(r => !r.ghost).map(r => r.name).join(", ") || "empty"}`}>
      {Array.from({ length: 17 }, (_, i) => <path key={i} d={`M${x0 + sw * i} 0v${i % 4 === 0 ? 6 : 3}`} stroke="#6E6E73" strokeWidth={1} />)}
      {rows.map((r, i) => {
        const y = top + i * (lh + gap);
        const dim = (!!solo && solo !== r.id) || r.muted;
        const isSel = sel === r.id;
        return (
          <g key={r.id} onClick={onLane && !r.ghost ? () => onLane(r.id) : undefined} style={{ cursor: onLane && !r.ghost ? "pointer" : undefined }}>
            <rect x={0} y={y - 4} width={width} height={lh + 8} fill="transparent" />
            <text x={0} y={y + lh - 1} fontFamily="Outfit" fontSize={12} fontWeight={isSel ? 600 : 500} style={{ fill: isSel || r.ghost ? r.color : dim ? "#55555A" : "var(--print, #A6A6AC)" }}>{r.name}</text>
            <rect x={x0} y={y} width={x1 - x0} height={lh} rx={2} fill="#141416" />
            {r.ghost ? (
              <rect x={x0 + 1} y={y + 0.5} width={x1 - x0 - 2} height={lh - 1} rx={2} fill="none" stroke={r.color} strokeWidth={1} strokeDasharray="3 3" />
            ) : r.steps.map((on, k) => on ? (
              <rect key={k} x={x0 + sw * k + 1} y={y} width={sw - 2} height={lh} rx={2} fill={r.color} opacity={dim ? 0.28 : sel && !isSel ? 0.55 : 1} />
            ) : null)}
            {solo === r.id && <><rect x={x1 - 34} y={y - 3} width={34} height={16} rx={4} fill={r.color} /><text x={x1 - 17} y={y + 9} textAnchor="middle" fontFamily="Outfit" fontSize={10} fontWeight={600} fill="#141416">solo</text></>}
          </g>
        );
      })}
      {playhead >= 0 && <path d={`M${x0 + sw * playhead + sw / 2} 0V${h}`} stroke="#F3F2EF" strokeWidth={1.2} />}
      {playhead < 0 && <><path d={`M${x0} 0V${h}`} stroke="#F3F2EF" strokeWidth={1.2} /><rect x={x0 - 3.5} y={0} width={7} height={5} rx={1} fill="#F3F2EF" /></>}
    </svg>
  );
}
