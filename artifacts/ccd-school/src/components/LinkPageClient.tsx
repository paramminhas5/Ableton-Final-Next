"use client";
import { useRef, useState } from "react";
import { track } from "@/lib/analytics";

interface TrackRow { name: string; kind: string; devices: { name: string; atlasId: string | null }[]; clips: number; notes: number; sidechain: string[] }
interface Result {
  set: {
    liveVersion: string; tempo: number; timeSignature: [number, number];
    scale: { root: string; name: string } | null;
    tracks: TrackRow[]; returns: TrackRow[]; warnings: string[];
  };
  missions: { id: string; title: string; passed: boolean; checks: { id: string; label: string; pass: boolean; found: string; hint: string }[] }[];
}

export function LinkPageClient() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [res, setRes] = useState<Result | null>(null);
  const input = useRef<HTMLInputElement>(null);

  async function send(file: File) {
    setError("");
    setRes(null);
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
      setRes(j);
      track("set_uploaded", { missions_passed: (j as Result).missions.filter((m) => m.passed).length });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const all = res ? [...res.set.tracks, ...res.set.returns] : [];
  return (
    <main className="min-h-screen bg-bone">
      <div className="mx-auto w-full max-w-2xl px-4 py-8 space-y-6">
        <header>
          <div className="font-mono text-[10px] uppercase opacity-40 mb-1">// CONNECT LIVE</div>
          <h1 className="font-display text-4xl leading-none">CHECK YOUR OWN SET.</h1>
          <p className="font-mono text-xs opacity-60 mt-3">
            Upload a Live Set (.als). We read it in memory, check it against four real mixing habits, and throw it away.
            Nothing is stored. Save a copy of your Set first if you want to be careful. We never change it.
          </p>
        </header>

        <section
          className="brutal-border bg-white p-6 text-center"
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
            {busy ? "READING..." : "CHOOSE A .ALS FILE"}
          </button>
          <p className="font-mono text-xs opacity-50 mt-3">or drop it here. Up to 30 MB.</p>
          <p role="alert" className="font-mono text-xs text-red-700 mt-3 min-h-4">{error}</p>
        </section>

        {res && (
          <>
            <section className="brutal-border bg-bone p-4" aria-label="Your Set">
              <div className="font-mono text-[10px] uppercase opacity-40 mb-2">YOUR SET</div>
              <p className="font-mono text-sm">
                {res.set.tempo} BPM · {res.set.timeSignature.join("/")}
                {res.set.scale ? ` · ${res.set.scale.root} ${res.set.scale.name}` : ""}
                {res.set.liveVersion ? ` · Live ${res.set.liveVersion}` : ""}
              </p>
              <p className="font-mono text-xs opacity-60 mt-1">
                {res.set.tracks.length} tracks, {res.set.returns.length} returns
              </p>
              <ul className="mt-3 divide-y divide-black/10">
                {all.map((t, i) => (
                  <li key={i} className="py-2 font-mono text-xs flex flex-wrap gap-x-3">
                    <span className="font-bold">{t.name || "(unnamed)"}</span>
                    <span className="opacity-50">{t.kind}</span>
                    {t.devices.length > 0 && (
                      <span>
                        {t.devices.map((d, k) => (
                          <span key={k}>
                            {k > 0 && ", "}
                            {d.atlasId ? <a className="underline" href={`/atlas#${d.atlasId}`}>{d.name}</a> : d.name}
                          </span>
                        ))}
                      </span>
                    )}
                    {t.notes > 0 && <span className="opacity-50">{t.notes} notes</span>}
                    {t.sidechain.length > 0 && <span>sidechain: {t.sidechain.join(", ")}</span>}
                  </li>
                ))}
              </ul>
            </section>

            <section aria-label="Missions" className="space-y-3">
              {res.missions.map((m) => (
                <article key={m.id} className={`brutal-border p-4 ${m.passed ? "bg-acid" : "bg-white"}`}>
                  <h2 className="font-display text-2xl leading-none">
                    {m.passed ? "DONE · " : ""}
                    {m.title}
                  </h2>
                  <ul className="mt-3 space-y-2">
                    {m.checks.map((c) => (
                      <li key={c.id} className="font-mono text-xs">
                        <span aria-hidden>{c.pass ? "✓" : "○"}</span>{" "}
                        <span className="sr-only">{c.pass ? "Passed: " : "Not yet: "}</span>
                        {c.label} <span className="opacity-50">({c.found})</span>
                        {!c.pass && <p className="mt-1 opacity-70">{c.hint}</p>}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
              <p className="font-mono text-xs opacity-60">Fix something in Live, save, and upload again.</p>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
