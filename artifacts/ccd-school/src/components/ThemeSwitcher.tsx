"use client";
/**
 * Light / dark / auto. Light is the OP-1 field look, dark is the OP-XY look.
 * Stored in localStorage "ccd.mode"; the inline script in layout.tsx applies it before paint.
 */
import { useEffect, useState } from "react";

export type Mode = "light" | "dark" | "system";
const KEY = "ccd.mode";

function resolve(m: Mode): "light" | "dark" {
  if (m !== "system") return m;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyMode(m: Mode) {
  const r = document.documentElement;
  const v = resolve(m);
  r.classList.remove("light", "dark");
  r.classList.add(v);
  try { localStorage.setItem(KEY, m); } catch {}
  window.dispatchEvent(new CustomEvent("mode:change", { detail: m }));
}

export function useMode() {
  const [mode, setMode] = useState<Mode>("system");
  useEffect(() => {
    let saved: Mode = "system";
    try { saved = (localStorage.getItem(KEY) as Mode) || "system"; } catch {}
    setMode(saved);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSys = () => { if ((localStorage.getItem(KEY) || "system") === "system") applyMode("system"); };
    const onChange = (e: Event) => setMode((e as CustomEvent<Mode>).detail);
    mq.addEventListener("change", onSys);
    window.addEventListener("mode:change", onChange);
    return () => { mq.removeEventListener("change", onSys); window.removeEventListener("mode:change", onChange); };
  }, []);
  return { mode, set: (m: Mode) => { applyMode(m); setMode(m); } };
}

const OPTS: { id: Mode; label: string }[] = [
  { id: "light", label: "light" },
  { id: "dark", label: "dark" },
  { id: "system", label: "auto" },
];

/** Three small keys with an LED over the active one. `compact` is a single toggle key. */
export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const { mode, set } = useMode();
  const [isDark, setIsDark] = useState(false);
  useEffect(() => { setIsDark(document.documentElement.classList.contains("dark")); }, [mode]);

  if (compact) {
    const next: Mode = isDark ? "light" : "dark";
    return (
      <button
        type="button"
        onClick={() => set(next)}
        aria-label={`Switch to ${next} mode`}
        title={`${next} mode`}
        className="f-m"
        style={{ width: 40, height: 40, borderRadius: 10 }}
      >
        <span className="f-cap" style={{ width: 28 }}>
          <svg viewBox="0 0 24 24" className="f-ico" style={{ width: 16, height: 16 }} aria-hidden>
            {isDark
              ? <><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" /></>
              : <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />}
          </svg>
        </span>
      </button>
    );
  }

  return (
    <div role="radiogroup" aria-label="Appearance" className="f-grid" style={{ gridTemplateColumns: "repeat(3, 72px)" }}>
      {OPTS.map(o => {
        const on = mode === o.id;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => set(o.id)}
            className="f-m f-sq"
          >
            <span className={`f-dot${on ? " is-on" : ""}`} style={{ ["--c" as string]: "var(--go-led)" }} />
            <span className="f-cap" style={{ width: "52%", marginTop: -6 }}>
              <svg viewBox="0 0 24 24" className="f-ico" style={{ width: 18, height: 18 }} aria-hidden>
                {o.id === "light" && <><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2" /></>}
                {o.id === "dark" && <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />}
                {o.id === "system" && <><rect x="7" y="3" width="10" height="18" rx="2" /><path d="M11 18h2" /></>}
              </svg>
            </span>
            <span className="f-ml" style={on ? { color: "var(--ink)" } : undefined}>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
