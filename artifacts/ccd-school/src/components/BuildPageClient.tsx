"use client";
import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { useProgress } from "@/lib/progress";
import { atlasById } from "@/content/atlas";
import { BUILD_STAGES } from "@/content/build";

const KEY = "ccd.build.v1";

interface StageResult {
  id: string;
  passed: boolean;
  checks: { id: string; label: string; pass: boolean; found: string; hint: string }[];
}

function load(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function BuildPageClient() {
  const { addXp } = useProgress();
  const [done, setDone] = useState<string[]>([]);
  const [results, setResults] = useState<Record<string, StageResult>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [gained, setGained] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => setDone(load()), []);

  async function send(file: File) {
    setError("");
    setGained(0);
    if (!/\.als$/i.test(file.name)) {
      setError("Choose a Live Set, a file that ends in .als.");
      return;
    }
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const r = await fetch("/api/set/analyze", { method: "POST", body });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "Could not read that file.");
      const map: Record<string, StageResult> = {};
      for (const s of j.build as StageResult[]) map[s.id] = s;
      setResults(map);

      // reward stages in order; a stage only counts once, and only if every earlier stage holds
      const have = new Set(load());
      let xp = 0;
      for (const st of BUILD_STAGES) {
        if (!map[st.id]?.passed) break;
        if (!have.has(st.id)) {
          have.add(st.id);
          xp += st.xp;
        }
      }
      const next = [...have];
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {}
      setDone(next);
      if (xp > 0) {
        addXp(xp);
        setGained(xp);
      }
      track("build_set_checked", { stages_passed: next.length });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const current = BUILD_STAGES.findIndex((s) => !done.includes(s.id));
  const pct = Math.round((done.length / BUILD_STAGES.length) * 100);

  return (
    <main className="min-h-screen bg-bone">
      <div className="mx-auto w-full max-w-2xl px-4 py-8 space-y-6">
        <header>
          <div className="font-mono text-[10px] uppercase opacity-40 mb-1">// BUILD A SET</div>
          <h1 className="font-display text-4xl leading-none">YOUR FIRST TRACK, IN NINE STAGES.</h1>
          <p className="font-mono text-xs opacity-60 mt-3">
            Do each stage in Live, save, and upload the .als here. We check your real Set. Nothing is stored and your file
            is never changed. New to Live? Start with <a className="underline" href="/setup">Setup</a>.
          </p>
          <div
            className="brutal-border bg-white h-4 mt-4"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Build progress"
          >
            <div className="h-full bg-acid" style={{ width: `${pct}%` }} />
          </div>
          <p className="font-mono text-xs mt-1">{done.length} of {BUILD_STAGES.length} stages</p>
        </header>

        <section
          className="brutal-border bg-white p-5 text-center"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files[0];
            if (f) void send(f);
          }}
        >
          <input
            ref={input}
            type="file"
            accept=".als"
            className="sr-only"
            aria-label="Choose a Live Set file"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void send(f);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => input.current?.click()}
            className="brutal-border bg-acid px-5 py-3 font-display text-xl chunk-shadow disabled:opacity-50"
          >
            {busy ? "CHECKING..." : "UPLOAD MY SET (.ALS)"}
          </button>
          <p role="alert" className="font-mono text-xs text-red-700 mt-3 min-h-4">{error}</p>
          {gained > 0 && <p className="font-display text-2xl" aria-live="polite">+{gained} XP</p>}
        </section>

        <ol className="space-y-3">
          {BUILD_STAGES.map((st, i) => {
            const ok = done.includes(st.id);
            const isCurrent = i === current;
            const r = results[st.id];
            const locked = !ok && !isCurrent;
            return (
              <li
                key={st.id}
                className={`brutal-border p-4 ${ok ? "bg-acid" : isCurrent ? "bg-white chunk-shadow" : "bg-bone"} ${locked ? "opacity-60" : ""}`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="font-display text-2xl leading-none">
                    {i + 1}. {st.title}
                  </h2>
                  <span className="font-mono text-xs">{ok ? "Done" : `${st.xp} XP`}</span>
                </div>
                {!locked && (
                  <>
                    <p className="font-mono text-sm mt-2">{st.task}</p>
                    <p className="font-mono text-xs opacity-70 mt-1">{st.why}</p>
                    {st.learn.length > 0 && (
                      <p className="font-mono text-xs mt-2">
                        Read first:{" "}
                        {st.learn.map((id, k) => (
                          <span key={id}>
                            {k > 0 && ", "}
                            <a className="underline" href={`/atlas#${id}`}>{atlasById(id)?.name ?? id}</a>
                          </span>
                        ))}
                      </p>
                    )}
                    {(isCurrent || ok) && (
                      <ul className="mt-3 space-y-2">
                        {st.checks.map((c) => {
                          const rc = r?.checks.find((x) => x.id === c.id);
                          const pass = ok || rc?.pass;
                          return (
                            <li key={c.id} className="font-mono text-xs">
                              <span aria-hidden>{pass ? "✓" : "○"}</span>{" "}
                              <span className="sr-only">{pass ? "Passed: " : "Not yet: "}</span>
                              {c.label}
                              {rc && <span className="opacity-50"> ({rc.found})</span>}
                              {!pass && rc && <p className="mt-1 opacity-70">{rc.hint}</p>}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ol>

        {done.length === BUILD_STAGES.length && (
          <p className="brutal-border bg-acid p-4 font-display text-2xl">
            YOU BUILT A TRACK. Next: <a className="underline" href="/gym">train your ears</a> or{" "}
            <a className="underline" href="/link">run the mixing checks</a>.
          </p>
        )}
      </div>
    </main>
  );
}
