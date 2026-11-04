"use client";
import { useEffect, useState } from "react";
import { Icon, Silk } from "@/components/m1/controls";
import { RefPage, SegBar } from "@/components/m1/parts";
import { SETUP } from "@/content/setup";

const KEY = "ccd.setup.v1";

function load(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function SetupPageClient() {
  const [done, setDone] = useState<string[]>([]);
  useEffect(() => setDone(load()), []);

  const total = SETUP.reduce((a, s) => a + s.steps.length, 0);
  const toggle = (id: string) => {
    const next = done.includes(id) ? done.filter((x) => x !== id) : [...done, id];
    setDone(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  };

  return (
    <RefPage title="setup" meta="get live ready" right={`${done.length} of ${total}`}
      intro="everything to install and switch on before your first track. menu names shift a little between live versions, so each step says what to look for. ticks stay on this device.">
      <div style={{ display: "flex", marginTop: 14 }}><SegBar value={total ? done.length / total : 0} color="var(--led-mint)" n={20} height={6} label={`${done.length} of ${total} steps done`} /></div>
      {SETUP.map(sec => (
        <section key={sec.id} id={sec.id} style={{ scrollMarginTop: 80 }}>
          <Silk label={sec.title.toLowerCase()} />
          {sec.steps.map(s => {
            const on = done.includes(s.id);
            return (
              <article key={s.id} className="ls-panel" style={{ flexDirection: "column", gap: 10 }}>
                <button type="button" role="checkbox" aria-checked={on} onClick={() => toggle(s.id)}
                  style={{ display: "flex", alignItems: "flex-start", gap: 12, width: "100%", background: "none", border: 0, padding: 0, textAlign: "left", font: "inherit", color: "inherit", cursor: "pointer", minHeight: 0 }}>
                  <span className="m1-well" style={{ width: 28, height: 28, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", color: on ? "var(--led-mint)" : "transparent" }}><Icon name="check" small /></span>
                  <span><b style={{ display: "block", fontSize: 16, fontWeight: 500 }}>{s.title}</b><span className="m1-t11" style={{ display: "block", marginTop: 3 }}>{s.why}</span></span>
                </button>
                <ol style={{ margin: "0 0 0 40px", padding: 0, fontSize: 14, lineHeight: 1.55, color: "var(--sub)", fontWeight: 400 }}>
                  {s.do.map((d, i) => <li key={i} style={{ marginBottom: 3 }}>{d}</li>)}
                </ol>
                {s.watch && <p className="m1-t11" style={{ margin: "0 0 0 40px" }}>watch for: {s.watch}</p>}
              </article>
            );
          })}
        </section>
      ))}
      <p className="m1-t11" style={{ margin: "14px 4px 0" }}>ready? <a href="/studio" style={{ textDecoration: "underline" }}>make your first track</a> or <a href="/atlas" style={{ textDecoration: "underline" }}>see what every device does</a>.</p>
    </RefPage>
  );
}
