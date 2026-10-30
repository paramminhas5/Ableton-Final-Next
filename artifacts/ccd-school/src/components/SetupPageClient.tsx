"use client";
import { useEffect, useState } from "react";
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
    <main className="min-h-screen bg-bone">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 space-y-6">
        <header>
          <div className="font-mono text-[10px] uppercase opacity-70 mb-1">// SETUP</div>
          <h1 className="font-display text-4xl leading-none">GET LIVE READY.</h1>
          <p className="font-mono text-xs opacity-70 mt-3">
            Everything you need installed and switched on before your first track. Menu names can differ a little between
            Live versions, so each step says what to look for. Ticks are saved on this device.
          </p>
          <p className="font-mono text-sm mt-3" aria-live="polite">{done.length} of {total} done</p>
        </header>

        {SETUP.map((sec) => (
          <section key={sec.id} id={sec.id} className="space-y-3 scroll-mt-24">
            <h2 className="font-display text-2xl leading-none">{sec.title.toUpperCase()}</h2>
            {sec.steps.map((s) => {
              const on = done.includes(s.id);
              return (
                <article key={s.id} className={`brutal-border p-4 ${on ? "bg-acid" : "bg-white"}`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => toggle(s.id)}
                      className="mt-1 h-5 w-5 shrink-0"
                    />
                    <span>
                      <span className="font-display text-xl leading-none block">{s.title}</span>
                      <span className="font-mono text-xs opacity-70 block mt-1">{s.why}</span>
                    </span>
                  </label>
                  <ol className="mt-3 ml-8 list-decimal space-y-1 font-mono text-xs">
                    {s.do.map((d, i) => <li key={i}>{d}</li>)}
                  </ol>
                  {s.watch && <p className="font-mono text-xs mt-3 ml-8 opacity-70"><b>Watch for:</b> {s.watch}</p>}
                </article>
              );
            })}
          </section>
        ))}

        <p className="font-mono text-xs">
          Ready? <a className="underline" href="/build">Build your first Set</a> or{" "}
          <a className="underline" href="/atlas">read what every device does</a>.
        </p>
      </div>
    </main>
  );
}
