"use client";
/**
 * Model 1 controls. Every control looks and behaves like the hardware it teaches:
 * keys travel when pressed, knobs and faders follow your finger (drag up/down, scroll,
 * arrow keys, double-tap to reset), pads light up. Knobs and faders never print numbers;
 * they report what you touched through `onTouch` so the screen can show it.
 */
import "./pictures.css";
import Link from "next/link";
import { useCallback, useRef, type CSSProperties, type ReactNode, type KeyboardEvent, type PointerEvent } from "react";

export const LED = {
  mint: "var(--led-mint)",
  cobalt: "var(--led-cobalt)",
  go: "var(--led-go)",
  lilac: "var(--led-lilac)",
  red: "var(--led-red)",
  white: "var(--led-white)",
} as const;

export const CAP = {
  mint: "#36C9A0",
  cobalt: "#5B76F2",
  go: "#E8418A",
  lilac: "#9A7BF0",
  grey: "#9C9EA4",
  navy: "#2B355E",
} as const;

export const WORLD_LED: Record<"fundamentals" | "dj" | "producer", string> = {
  fundamentals: LED.mint,
  dj: LED.cobalt,
  producer: LED.lilac,
};

// ── icons: one set, 24 grid, 1.6 stroke, round ends ─────────────────────
const P: Record<string, ReactNode> = {
  learn: <path d="M4 7h10M4 12h16M4 17h7" />,
  practice: <><path d="M9 3.5h6l3.5 17h-13z" /><path d="m12 15 4.5-8" /></>,
  studio: <><path d="M6 4v16M12 4v16M18 4v16" /><path d="M4.5 14h3M10.5 8h3M16.5 11h3" /></>,
  library: <path d="M5 4v16M10 4v16M14.5 5l4.5 15" />,
  dj: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="2.5" /></>,
  hear: <><path d="M4 9.5v5h3.5L12 18V6L7.5 9.5z" /><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  back: <path d="m14.5 6-6 6 6 6" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  edit: <><path d="M5 19h3.5L18 9.5 14.5 6 5 15.5z" /><path d="M13 7.5 16.5 11" /></>,
  reset: <><path d="M4.5 12a7.5 7.5 0 1 0 2.4-5.5" /><path d="M4 4v4.5h4.5" /></>,
  out: <><path d="M12 15V4M8 8l4-4 4 4" /><path d="M5 14v6h14v-6" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  lock: <><rect x="6" y="11" width="12" height="9" rx="2" /><path d="M9 11V8.5a3 3 0 0 1 6 0V11" /></>,
  knob: <><circle cx="12" cy="12" r="7.5" /><path d="M12 12l3.5-4.5" /></>,
  keys: <><rect x="3.5" y="6" width="17" height="12" rx="2" /><path d="M8 6v12M12 6v12M16 6v12" /></>,
  pads: <><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2" /></>,
  moon: <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
  user: <><circle cx="12" cy="8.5" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  settings: <><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></>,
  loop: <><path d="M5 11V9a3 3 0 0 1 3-3h10" /><path d="m15 3 3 3-3 3" /><path d="M19 13v2a3 3 0 0 1-3 3H6" /><path d="m9 21-3-3 3-3" /></>,
  flame: <path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.2 2-4.2.3 1.2 1 1.9 1.7 2.2C10.5 8 11 5.5 12 3z" />,
  shield: <path d="M12 3.5 5.5 6v5.5c0 4 2.7 7 6.5 9 3.8-2 6.5-5 6.5-9V6z" />,
  gem: <><path d="M7 4.5h10l3.5 5L12 20 3.5 9.5z" /><path d="M3.5 9.5h17M9.5 4.5 8 9.5l4 10.5 4-10.5-1.5-5" /></>,
  bolt: <path d="M13 3 5.5 13.5H11L10 21l7.5-10.5H12z" />,
  heart: <path d="M12 20s-7.5-4.4-7.5-10A4.2 4.2 0 0 1 12 7.6 4.2 4.2 0 0 1 19.5 10c0 5.600-7.500 10-7.500 10z" />,
  trophy: <><path d="M8 4.5h8v5a4 4 0 0 1-8 0z" /><path d="M8 6.5H5v1.500a3 3 0 0 0 3 3M16 6.500h3v1.500a3 3 0 0 1-3 3" /><path d="M12 13.500V17M8.500 20h7M10 17h4" /></>,
  globe: <><circle cx="12" cy="12" r="8.500" /><path d="M3.500 12h17M12 3.500c2.500 2.500 3.500 5.500 3.500 8.500s-1 6-3.500 8.500C9.500 18 8.500 15 8.500 12s1-6 3.500-8.500z" /></>,
  up: <path d="m6 14 6-6 6 6" />,
  down: <path d="m6 10 6 6 6-6" />,
  brain: <><path d="M9.500 4.500a3 3 0 0 0-3 3 3 3 0 0 0-1.500 5.500 3 3 0 0 0 2 4.500 3 3 0 0 0 5.500 1V5.500a3 3 0 0 0-3-1z" /><path d="M14.500 4.500a3 3 0 0 1 3 3 3 3 0 0 1 1.500 5.500 3 3 0 0 1-2 4.500 3 3 0 0 1-3 1.500" /></>,
  note: <><path d="M9 17V5.500l10-2V15" /><circle cx="6.500" cy="17" r="2.500" /><circle cx="16.500" cy="15" r="2.500" /></>,
  cat: <path d="M5 20V8l3.500 3h7L19 8v12z" />,
};

export function Icon({ name, small, className }: { name: keyof typeof P | string; small?: boolean; className?: string }) {
  if (name === "play") return <svg viewBox="0 0 24 24" width={small ? 15 : 20} height={small ? 15 : 20} fill="currentColor" aria-hidden><path d="M8 5.5v13l11-6.5z" /></svg>;
  if (name === "stop") return <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden><rect x="6" y="6" width="12" height="12" rx="2" /></svg>;
  if (name === "rec") return <svg viewBox="0 0 24 24" width={16} height={16} aria-hidden><circle cx="12" cy="12" r="6" fill="#FF4A5A" /></svg>;
  return <svg viewBox="0 0 24 24" className={`${small ? "m1-ico-s" : "m1-ico"} ${className ?? ""}`} aria-hidden>{P[name]}</svg>;
}

// ── panel lettering ─────────────────────────────────────────────────────
export function Silk({ label, right, style }: { label: string; right?: string; style?: CSSProperties }) {
  return right ? (
    <div className="m1-silk" style={style}><i className="l" /><span>{label}</span><i /><span>{right}</span><i className="rs" /></div>
  ) : (
    <div className="m1-silk" style={style}><i className="l" /><span>{label}</span><i className="r" /></div>
  );
}

export function Screen({ children, height, style, className }: { children: ReactNode; height?: number | string; style?: CSSProperties; className?: string }) {
  return (
    <div className={`m1-scr ${className ?? ""}`} style={style}>
      <div className="m1-glass" style={{ height, padding: "16px" }}>{children}</div>
    </div>
  );
}

// ── keys ────────────────────────────────────────────────────────────────
type KeyProps = {
  onPointerDown?: () => void;
  onPointerUp?: () => void;
  onPointerLeave?: () => void;
  children?: ReactNode;
  label?: string;
  cap?: "" | "blk" | "go";
  led?: string | null;
  href?: string;
  onClick?: () => void;
  ariaLabel?: string;
  ariaPressed?: boolean;
  ariaCurrent?: boolean;
  disabled?: boolean;
  wide?: boolean;
  capStyle?: CSSProperties;
  style?: CSSProperties;
  className?: string;
};

export function Key({ children, label, cap = "", led, href, onClick, ariaLabel, ariaPressed, ariaCurrent, disabled, wide, capStyle, style, className, onPointerDown, onPointerUp, onPointerLeave }: KeyProps) {
  const inner = (
    <>
      {led ? <span className="m1-dot is-on" style={{ ["--c" as string]: led }} /> : null}
      <span className={`m1-cap ${cap ? "is-" + cap : ""}`} style={{ ...(label ? { width: "56%", marginTop: -12 } : {}), ...capStyle }}>{children}</span>
      {label ? <span className={`m1-ml ${ariaCurrent || ariaPressed ? "is-on" : ""}`}>{label}</span> : null}
    </>
  );
  const cls = `m1-m ${wide ? "is-wide" : ""} ${disabled ? "is-dim" : ""} ${className ?? ""}`;
  const aria = ariaLabel ?? label;
  if (href && !disabled) {
    return <Link href={href} className={cls} style={style} aria-label={aria} aria-current={ariaCurrent ? "page" : undefined}>{inner}</Link>;
  }
  return (
    <button type="button" className={cls} style={style} aria-label={aria} aria-pressed={ariaPressed} disabled={disabled} onClick={onClick} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerLeave={onPointerLeave}>
      {inner}
    </button>
  );
}

/** Wide key with a pill cap, for the one main action on a screen. */
export function GoPill({ children, href, onClick, ariaLabel, style, disabled }: { children: ReactNode; href?: string; onClick?: () => void; ariaLabel?: string; style?: CSSProperties; disabled?: boolean }) {
  const cap = <span className="m1-cap is-go is-pill" style={{ width: "90%", height: "58%", gap: 8, fontSize: 16, fontWeight: 500, marginTop: -12 }}>{children}</span>;
  if (href && !disabled) return <Link href={href} className="m1-m is-wide" style={style} aria-label={ariaLabel}>{cap}</Link>;
  return <button type="button" className={`m1-m is-wide ${disabled ? "is-dim" : ""}`} style={style} onClick={onClick} disabled={disabled} aria-label={ariaLabel}>{cap}</button>;
}

export function Pad({ children, lit, onClick, href, ariaLabel, ariaPressed, height = 48, style }: { children: ReactNode; lit?: string | null; onClick?: () => void; href?: string; ariaLabel?: string; ariaPressed?: boolean; height?: number; style?: CSSProperties }) {
  const st = { height, ...(lit ? { ["--c" as string]: lit } : {}), ...style } as CSSProperties;
  if (href) return <Link href={href} className={`m1-pd ${lit ? "is-lit" : ""}`} style={st} aria-label={ariaLabel}>{children}</Link>;
  return <button type="button" className={`m1-pd ${lit ? "is-lit" : ""}`} style={st} onClick={onClick} aria-label={ariaLabel} aria-pressed={ariaPressed}>{children}</button>;
}

export function Dash({ color, on = true, style }: { color?: string; on?: boolean; style?: CSSProperties }) {
  return <span className={`m1-dash ${on ? "is-on" : ""}`} style={{ ["--c" as string]: color, ...style } as CSSProperties} />;
}

// ── shared drag behaviour for knobs and faders ──────────────────────────
function useDrag(value: number, onChange: ((v: number) => void) | undefined, range = 180, defaultValue?: number, detents?: number) {
  const start = useRef<{ y: number; v: number } | null>(null);
  const lastTap = useRef(0);
  const clamp = (v: number) => Math.max(0, Math.min(1, v));
  const onPointerDown = useCallback((e: PointerEvent<HTMLElement>) => {
    if (!onChange) return;
    const now = Date.now();
    if (defaultValue !== undefined && now - lastTap.current < 300) { onChange(defaultValue); lastTap.current = 0; return; }
    lastTap.current = now;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    start.current = { y: e.clientY, v: value };
  }, [onChange, value, defaultValue]);
  const onPointerMove = useCallback((e: PointerEvent<HTMLElement>) => {
    if (!start.current || !onChange) return;
    onChange(clamp(start.current.v + (start.current.y - e.clientY) / range));
  }, [onChange, range]);
  const onPointerUp = useCallback(() => { start.current = null; }, []);
  const onKeyDown = useCallback((e: KeyboardEvent<HTMLElement>) => {
    if (!onChange) return;
    const step = detents && detents > 1 ? 1 / (detents - 1) : e.shiftKey ? 0.1 : 0.02;
    if (e.key === "ArrowUp" || e.key === "ArrowRight") { e.preventDefault(); onChange(clamp(value + step)); }
    if (e.key === "ArrowDown" || e.key === "ArrowLeft") { e.preventDefault(); onChange(clamp(value - step)); }
    if (e.key === "PageUp") { e.preventDefault(); onChange(clamp(value + Math.max(step, 0.1))); }
    if (e.key === "PageDown") { e.preventDefault(); onChange(clamp(value - Math.max(step, 0.1))); }
    if (e.key === "Home") onChange(0);
    if (e.key === "End") onChange(1);
  }, [onChange, value, detents]);
  const onWheel = useCallback((e: React.WheelEvent<HTMLElement>) => {
    if (!onChange) return;
    if (detents && detents > 1) { if (Math.abs(e.deltaY) > 4) onChange(clamp(value - Math.sign(e.deltaY) / (detents - 1))); return; }
    onChange(clamp(value - e.deltaY / 800));
  }, [onChange, value, detents]);
  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp, onKeyDown, onWheel };
}

function Scale({ size, steps, at = -1 }: { size: number; steps?: number; at?: number }) {
  const c = size / 2, r0 = size / 2 - 7, r1 = size / 2 - 2;
  // A stepped knob gets one line per step, and the current one lit.
  if (steps && steps > 1 && steps <= 48) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", inset: 0 }} aria-hidden>
        {Array.from({ length: steps }, (_, i) => {
          const a = ((135 + (i * 270) / (steps - 1)) * Math.PI) / 180;
          const on = i === at;
          return <path key={i} d={`M${c + (on ? r0 - 3 : r0) * Math.cos(a)} ${c + (on ? r0 - 3 : r0) * Math.sin(a)}L${c + r1 * Math.cos(a)} ${c + r1 * Math.sin(a)}`} strokeWidth={on ? 2.4 : 1.2} opacity={on ? 1 : 0.55} strokeLinecap="round" style={{ stroke: on ? "var(--led-mint)" : "var(--print)" }} />;
        })}
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", inset: 0 }} aria-hidden>
      {Array.from({ length: 11 }, (_, i) => {
        const a = ((135 + i * 27) * Math.PI) / 180;
        const major = i === 0 || i === 5 || i === 10;
        return <path key={i} d={`M${c + r0 * Math.cos(a)} ${c + r0 * Math.sin(a)}L${c + r1 * Math.cos(a)} ${c + r1 * Math.sin(a)}`} strokeWidth={major ? 1.4 : 1} opacity={major ? 0.9 : 0.6} strokeLinecap="round" style={{ stroke: "var(--print)" }} />;
      })}
    </svg>
  );
}

type KnobProps = {
  value: number;
  onChange?: (v: number) => void;
  onTouch?: (label: string, v: number) => void;
  label: string;
  color?: string;
  led?: string | null;
  size?: number;
  defaultValue?: number;
  bare?: boolean;
  height?: number;
  style?: CSSProperties;
  /** number of click stops: arrow keys, wheel and drag move one stop at a time */
  detents?: number;
  /** A click (no drag) steps the knob on by one, wrapping round. */
  onStep?: () => void;
  /** The value in words ("1.2 kHz", "40%"), shown under the label and read out by screen readers. */
  readout?: string;
  /** The colour of the line this knob moves on the screen: drawn as a lit ring from rest to the value. */
  ring?: string;
  /** Doing nothing at this value (an amount at zero, a centred eq): the ring and led stay dark. */
  idle?: boolean;
  /** Where the ring starts: 0 for amounts, 0.5 for centred knobs (pan, eq, tune). */
  ringFrom?: number;
  /** The lesson is about another control: this one dims (but still works). */
  dim?: boolean;
  /** The lesson is about this control: it gets a soft halo. */
  spot?: boolean;
};

/** The value ring: an led arc in the colour of what the knob moves, from rest to the value. Dark when idle. */
function Ring({ size, value, color, from = 0, idle }: { size: number; value: number; color: string; from?: number; idle?: boolean }) {
  const c = size / 2, r = size / 2 - 3.5;
  const ang = (n: number) => ((135 + 270 * Math.max(0, Math.min(1, n))) * Math.PI) / 180;
  const pt = (n: number) => `${(c + r * Math.cos(ang(n))).toFixed(2)} ${(c + r * Math.sin(ang(n))).toFixed(2)}`;
  const arc = (a: number, b: number) => { const lo = Math.min(a, b), hi = Math.max(a, b); return `M${pt(lo)}A${r} ${r} 0 ${(hi - lo) * 270 > 180 ? 1 : 0} 1 ${pt(hi)}`; };
  const lit = !idle && Math.abs(value - from) > 0.004;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={`m1-ring ${lit ? "is-lit" : ""}`} style={{ position: "absolute", inset: 0, ["--c" as string]: color } as CSSProperties} aria-hidden>
      <path d={arc(0, 1)} className="m1-ring-bed" />
      {lit && <path d={arc(from, value)} className="m1-ring-arc" />}
      {lit && <circle cx={c + r * Math.cos(ang(value))} cy={c + r * Math.sin(ang(value))} r={2.2} className="m1-ring-tip" />}
    </svg>
  );
}

/** Knurled knob in a well. Drag up or down, scroll, or use arrow keys. Double-tap to reset. */
export function Knob({ value, onChange, onTouch, label, color = CAP.grey, led, size = 46, defaultValue, bare, height, style, detents, onStep, readout, ring, idle, ringFrom, dim, spot }: KnobProps) {
  const set = useCallback((v: number) => { onChange?.(v); onTouch?.(label, v); }, [onChange, onTouch, label]);
  const drag0 = useDrag(value, onChange ? set : undefined, detents && detents > 1 ? Math.min(600, Math.max(70, 56 * (detents - 1))) : 180, defaultValue, detents);
  const press = useRef<{ x: number; y: number; t: number } | null>(null);
  const drag = onStep ? {
    ...drag0,
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => { press.current = { x: e.clientX, y: e.clientY, t: e.timeStamp }; drag0.onPointerDown?.(e as never); },
    onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => {
      const p = press.current; press.current = null;
      drag0.onPointerUp?.();
      if (p && Math.hypot(e.clientX - p.x, e.clientY - p.y) < 5 && e.timeStamp - p.t < 400) onStep();
    },
  } : drag0;
  const at = detents && detents > 1 ? Math.round(value * (detents - 1)) : -1;
  const well = size + 18;
  const rot = -135 + 270 * value;
  const knob = (
    <div
      className="m1-knob"
      role="slider"
      tabIndex={onChange ? 0 : -1}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      aria-valuetext={readout}
      {...drag}
      style={{ position: "relative", width: well + 14, height: well + 14, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      {size >= 46 && !ring && <Scale size={well + 14} steps={detents} at={at} />}
      {ring ? <Ring size={well + 14} value={value} color={ring} from={ringFrom} idle={idle} /> : null}
      <div className="m1-well" style={{ width: well, height: well }}>
        <div className="m1-kb" style={{ width: size, height: size, marginTop: -4 }}>
          <div className="m1-kc" style={{ ["--c" as string]: color, width: size * 0.68, height: size * 0.68 } as CSSProperties}>
            <b style={{ transform: `rotate(${rot}deg)` }} />
          </div>
        </div>
      </div>
    </div>
  );
  if (bare) return knob;
  const ledC = ring ?? led;
  return (
    <div className={`m1-m is-wide ${dim ? "is-unlit" : ""} ${spot ? "is-spot" : ""} ${ring && idle ? "is-idle" : ""}`} style={{ height: height ?? undefined, aspectRatio: height ? "auto" : 1, flexDirection: "column", ...style }}>
      {ledC ? <Dash color={ledC} on={ring ? !idle : true} style={{ position: "absolute", top: 9, left: "50%", marginLeft: -9 }} /> : null}
      <div style={{ marginTop: -12 }}>{knob}</div>
      <span className="m1-ml is-on" style={{ color: "var(--ink)" }}>{label}</span>
      {readout ? <span className="m1-kv" aria-hidden>{readout}</span> : null}
    </div>
  );
}

type FaderProps = {
  value: number;
  onChange?: (v: number) => void;
  onTouch?: (label: string, v: number) => void;
  label: string;
  led?: string;
  height?: number;
  width?: number;
  horizontal?: boolean;
  defaultValue?: number;
  /** Engrave the 0 dB line across the slot, at `defaultValue`. */
  unity?: boolean;
  /** Width of the cap (defaults to the fader's width less 6). */
  capWidth?: number;
  /** What a screen reader hears, eg "-3 db". */
  valueText?: string;
};

/** Fader with printed ticks. Drag, scroll, or arrow keys. Double-tap snaps to 0 dB (75%). */
export function Fader({ value, onChange, onTouch, label, led, height = 140, width = 44, horizontal, defaultValue = 0.75, unity, capWidth, valueText }: FaderProps) {
  const set = useCallback((v: number) => { onChange?.(v); onTouch?.(label, v); }, [onChange, onTouch, label]);
  const drag = useDrag(value, onChange ? set : undefined, horizontal ? -160 : height - 40, defaultValue);
  if (horizontal) {
    const w = width;
    return (
      <div className="m1-fader" role="slider" tabIndex={0} aria-label={label} aria-orientation="horizontal" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value * 100)}
        {...drag}
        onPointerMove={(e) => {
          if (!onChange || !(e.buttons & 1)) return;
          const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
          set(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)));
        }}
        style={{ position: "relative", width: w, height: 30 }}>
        {Array.from({ length: 9 }, (_, i) => <i key={i} style={{ position: "absolute", top: -4, left: (i * w) / 8, width: 1, height: i % 4 === 0 ? 6 : 4, background: "var(--tick)" }} />)}
        <div className="m1-fslot" style={{ top: 12, left: 0, right: 0, width: "auto", height: 6, marginLeft: 0 }} />
        <div className="m1-fcap" style={{ top: 2, left: `${value * 100}%`, width: 26, height: 26, marginLeft: -13, background: "repeating-linear-gradient(90deg,rgba(0,0,0,0) 0 3px,rgba(0,0,0,.10) 3px 4px),linear-gradient(180deg,var(--c1),var(--c0))" }}>
          <i style={{ left: 12, right: "auto", width: 2, top: 4, height: 18 }} />
        </div>
      </div>
    );
  }
  const th = height - 30;
  const top = 6 + (1 - value) * th - 11;
  const cw = capWidth ?? width - 6;
  return (
    <div className="m1-fader" role="slider" tabIndex={0} aria-label={label} aria-orientation="vertical" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value * 100)} aria-valuetext={valueText} {...drag}
      style={{ position: "relative", width, height }}>
      {led ? <Dash color={led} style={{ position: "absolute", top: -14, left: "50%", marginLeft: -9 }} /> : null}
      {Array.from({ length: 9 }, (_, j) => {
        const w = j === 0 || j === 2 || j === 8 ? 8 : 5;
        const y = 6 + (j * th) / 8;
        return <span key={j}><i style={{ position: "absolute", left: 0, top: y, width: w, height: 1, background: "var(--tick)" }} /><i style={{ position: "absolute", right: 0, top: y, width: w, height: 1, background: "var(--tick)" }} /></span>;
      })}
      <div className="m1-fslot" style={{ top: 2, bottom: 2 }} />
      {unity ? <i className="m1-unity" style={{ top: 6 + (1 - defaultValue) * th }} /> : null}
      <div className="m1-fcap" style={{ top, width: cw, marginLeft: -cw / 2, height: 22 }}><i /></div>
    </div>
  );
}

export function Switch({ options, value, onChange, label }: { options: { id: string; label: string }[]; value: string; onChange: (id: string) => void; label: string }) {
  return (
    <div className="m1-sw" role="radiogroup" aria-label={label}>
      {options.map(o => (
        <button key={o.id} type="button" role="radio" aria-checked={o.id === value} onClick={() => onChange(o.id)}>{o.label}</button>
      ))}
    </div>
  );
}

export function Meter({ segments = 9, lit = 0, size = 8 }: { segments?: number; lit?: number; size?: number }) {
  const col = (i: number) => (i < segments * 0.6 ? LED.mint : i < segments * 0.85 ? LED.lilac : LED.go);
  return (
    <div role="img" aria-label={`${lit} of ${segments}`} style={{ display: "flex", flexDirection: "column-reverse", gap: 4, padding: 10, borderRadius: 10, background: "#050506", boxShadow: "0 0 0 3px #000, inset 0 0 0 1px rgba(255,255,255,.05)" }}>
      {Array.from({ length: segments }, (_, i) => (
        <span key={i} style={{ display: "block", width: 22, height: size, borderRadius: 2, background: i < lit ? col(i) : "#232326", boxShadow: i < lit ? `0 0 6px ${col(i)}` : undefined }} />
      ))}
    </div>
  );
}

/** Small knurled knob without a module, for dense mixer sections. */
export function MiniKnob(props: Omit<KnobProps, "bare" | "size">) {
  return <Knob {...props} size={30} bare />;
}
