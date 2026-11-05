"use client";
/** Small pieces the Model 1 pages share: page head, readouts, rows, bars, rank and league marks. */
import { type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { Icon, Key } from "./controls";
import { SevenSeg } from "./SevenSeg";
import "./lesson.css";

/** Back key, title and an optional right-hand key. Same head on every Model 1 page. */
export function PageHead({ title, back = "/dashboard", right }: { title: string; back?: string | null; right?: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, height: 56 }}>
      {back ? <Key href={back} ariaLabel="Back" style={{ width: 44, height: 44 }}><Icon name="back" /></Key> : <span style={{ width: 8 }} />}
      <h1 style={{ flex: 1, fontSize: 22, fontWeight: 500, letterSpacing: "-.02em", margin: 0 }}>{title}</h1>
      {right}
    </div>
  );
}

/** A seven-segment readout with a small label under it. */
export function Readout({ value, label, color = "#F3F2EF" }: { value: number | string; label: string; color?: string }) {
  const raw = typeof value === "number" ? (value > 9999 ? `${Math.round(value / 1000)}k` : String(value)) : value;
  return (
    <div className="ls-use" style={{ gap: 8, padding: "12px 6px 10px" }}>
      <span className="ls-lcd" style={{ marginTop: 0, padding: "7px 9px", minWidth: 54, justifyContent: "center" }}>
        <SevenSeg text={raw} color={color} digits={Math.max(1, Math.min(4, raw.replace(".", "").length))} height={26} />
      </span>
      <small style={{ fontSize: 11 }}>{label}</small>
    </div>
  );
}

/** One row on the panel: a light, a title, a line under it, something on the right. */
export function ListRow({ led = "var(--ledoff)", title, sub, right, href, onClick, style }: {
  led?: string; title: ReactNode; sub?: ReactNode; right?: ReactNode; href?: string; onClick?: () => void; style?: CSSProperties;
}) {
  const body = (
    <>
      <span className="ls-led" style={{ ["--c" as string]: led, marginTop: 0 } as CSSProperties} />
      <span style={{ flex: 1, minWidth: 0, display: "block" }}>
        <span style={{ display: "block", fontSize: 15, fontWeight: 500, lineHeight: 1.3, overflowWrap: "anywhere" }}>{title}</span>
        {sub ? <span className="m1-t11" style={{ display: "block", marginTop: 2 }}>{sub}</span> : null}
      </span>
      {right ? <span style={{ flex: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>{right}</span> : null}
    </>
  );
  const st: CSSProperties = { alignItems: "center", padding: "12px 14px 12px 16px", marginTop: 8, ...style };
  if (href) return <Link href={href} className="ls-panel is-link" style={st}>{body}</Link>;
  if (onClick) return <button type="button" className="ls-panel is-link" style={st} onClick={onClick}>{body}</button>;
  return <div className="ls-panel" style={st}>{body}</div>;
}

/** Sixteen small blocks that fill from the left. */
export function SegBar({ value, color = "var(--led-mint)", label, n = 16, height = 9 }: { value: number; color?: string; label?: string; n?: number; height?: number }) {
  const lit = Math.round(Math.max(0, Math.min(1, value)) * n);
  return (
    <span style={{ display: "flex", gap: 3, flex: 1 }} role="img" aria-label={label ?? `${Math.round(value * 100)} percent`}>
      {Array.from({ length: n }, (_, i) => <i key={i} style={{ flex: 1, height, borderRadius: 2, background: i < lit ? color : "var(--ledoff)", boxShadow: i < lit ? `0 0 5px ${color}` : undefined }} />)}
    </span>
  );
}

/** Rank as a small gauge: twelve ticks, the ones you have reached lit. Replaces the rank emoji. */
export function RankMark({ idx, total = 12, size = 40 }: { idx: number; total?: number; size?: number }) {
  const r = size / 2 - 4, c = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`rank ${idx + 1} of ${total}`} style={{ flex: "none" }}>
      {Array.from({ length: total }, (_, i) => {
        const a = (-90 + (360 / total) * i) * (Math.PI / 180);
        const on = i <= idx;
        return <path key={i} d={`M${c + (r - 5) * Math.cos(a)} ${c + (r - 5) * Math.sin(a)}L${c + r * Math.cos(a)} ${c + r * Math.sin(a)}`} stroke={on ? "var(--led-mint)" : "var(--ledoff)"} strokeWidth={2.4} strokeLinecap="round" style={on ? { filter: "drop-shadow(0 0 2px var(--led-mint))" } : undefined} />;
      })}
      <text x={c} y={c + 4} textAnchor="middle" fontFamily="Outfit" fontSize={size * 0.3} fontWeight={500} fill="currentColor">{idx + 1}</text>
    </svg>
  );
}

/** League tier as a gem with 1 to 5 facets lit, in the tier colour. */
export function TierMark({ level, color, size = 34 }: { level: number; color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" role="img" aria-label={`league tier ${level + 1} of 5`} style={{ flex: "none" }}>
      <path d="M9 6h16l6 8-14 15L3 14z" fill="none" stroke="var(--print)" strokeWidth={1.4} strokeLinejoin="round" />
      {[[3, 14, 9, 6, 17, 14], [9, 6, 17, 14, 25, 6], [25, 6, 31, 14, 17, 14], [3, 14, 17, 14, 17, 29], [17, 14, 31, 14, 17, 29]].map((t, i) => (
        <path key={i} d={`M${t[0]} ${t[1]}L${t[2]} ${t[3]}L${t[4]} ${t[5]}z`} fill={i <= level ? color : "var(--ledoff)"} opacity={i <= level ? 0.95 : 0.5} style={i <= level ? { filter: `drop-shadow(0 0 3px ${color})` } : undefined} />
      ))}
    </svg>
  );
}

/** A reference page: back key, title, then the title and a line of intro on the glass. */
export function RefPage({ title, back = "/atlas", meta, intro, right, children }: { title: string; back?: string; meta?: string; intro?: ReactNode; right?: ReactNode; children: ReactNode }) {
  return (
    <main className="m1-page" style={{ paddingTop: 4 }}>
      <PageHead title={title} back={back} />
      <div className="m1-scr"><div className="m1-glass" style={{ padding: 16 }}>
        <div className="ls-meta"><span>{meta ?? title}</span><span>{right}</span></div>
        {intro ? <p className="ls-sub" style={{ marginTop: 10 }}>{intro}</p> : null}
      </div></div>
      {children}
    </main>
  );
}

/** One line search box on the glass. */
export function SearchField({ value, onChange, label, placeholder = "search" }: { value: string; onChange: (v: string) => void; label: string; placeholder?: string }) {
  return (
    <input type="search" value={value} onChange={e => onChange(e.target.value)} aria-label={label} placeholder={placeholder}
      autoCapitalize="none" autoCorrect="off" spellCheck={false} className="ls-input" style={{ marginTop: 14, fontFamily: "inherit", fontSize: 16 }} />
  );
}

/** A wrapped row of filter chips. One is on at a time. */
export function Chips<T extends string>({ options, value, onChange, label }: { options: readonly T[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
      {options.map(o => (
        <button key={o} type="button" role="radio" aria-checked={o === value} onClick={() => onChange(o)} className="m1-tag"
          style={{ cursor: "pointer", height: 30, padding: "0 12px", minHeight: 0, minWidth: 0, ...(o === value ? { background: "var(--ink)", color: "var(--c0)", borderColor: "var(--ink)" } : {}) }}>{o.toLowerCase()}</button>
      ))}
    </div>
  );
}

/** A key cap, for shortcuts. */
export function KeyCap({ children }: { children: ReactNode }) {
  return <kbd style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 8px", borderRadius: 6, fontFamily: "inherit", fontSize: 12, fontWeight: 500, background: "linear-gradient(180deg,var(--c1),var(--c0))", boxShadow: "inset 0 1.5px 0 var(--hi),0 1px 0 var(--cs1),0 2px 0 var(--cs2)", color: "var(--ink)" }}>{children}</kbd>;
}
