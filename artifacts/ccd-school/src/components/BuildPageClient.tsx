"use client";
import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { useProgress } from "@/lib/progress";
import { atlasById } from "@/content/atlas";
import { BUILD_STAGES } from "@/content/build";
import { LESSON_LINKS } from "@/content/lessonLinks";
import { MISSIONS } from "@/content/missions";
import { GoPill, Silk } from "@/components/m1/controls";
import { RefPage, SegBar } from "@/components/m1/parts";

const lessonsForStage = (stage: string) =>
  Object.entries(LESSON_LINKS)
    .filter(([, l]) => l.stage === stage)
    .map(([slug]) => MISSIONS.find((m) => m.slug === slug))
    .filter((m): m is NonNullable<typeof m> => !!m);


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
    <RefPage title="build a set" back="/atlas" meta="live" right={`${done.length} of ${BUILD_STAGES.length} stages`}
      intro={<>do each stage in live, save, and upload the .als here. your real set is checked. nothing is stored and your file is never changed. new to live? start with <a style={{ textDecoration: "underline" }} href="/setup">setup</a>.</>}>
      <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Build progress" style={{ marginTop: 14 }}>
        <SegBar value={done.length / BUILD_STAGES.length} color="var(--led-mint)" />
      </div>

      <div className="ls-panel" style={{ flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center", marginTop: 14, padding: 20 }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files[0];
          if (f) void send(f);
        }}>
        <input ref={input} type="file" accept=".als" className="sr-only" aria-label="Choose a Live Set file"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void send(f);
            e.target.value = "";
          }} />
        <GoPill onClick={() => input.current?.click()} disabled={busy}>{busy ? "checking" : "upload my set (.als)"}</GoPill>
        <p role="alert" style={{ color: "var(--led-red)", fontSize: 13, minHeight: 18, margin: 0 }}>{error}</p>
        {gained > 0 && <b aria-live="polite" style={{ fontSize: 18, fontWeight: 500 }}>+{gained} xp</b>}
      </div>

      <Silk label="stages" right={`${done.length} done`} />
      <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {BUILD_STAGES.map((st, i) => {
          const ok = done.includes(st.id);
          const isCurrent = i === current;
          const r = results[st.id];
          const locked = !ok && !isCurrent;
          return (
            <li key={st.id} className="ls-panel" style={{ flexDirection: "column", gap: 8, marginTop: 8, opacity: locked ? 0.55 : 1, ...(isCurrent ? { boxShadow: "inset 0 0 0 1.5px var(--led-mint)" } : {}) }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
                <span className="ls-led" style={{ ["--c" as string]: ok ? "var(--led-mint)" : isCurrent ? "var(--led-mint)" : "var(--ledoff)", marginTop: 0 }} />
                <h2 style={{ flex: 1, fontSize: 16, fontWeight: 500, margin: 0 }}>{i + 1}. {st.title.toLowerCase()}</h2>
                <span className="m1-t11">{ok ? "done" : `${st.xp} xp`}</span>
              </div>
              {!locked && (
                <>
                  <p style={{ fontSize: 14, lineHeight: 1.5, margin: 0 }}>{st.task}</p>
                  <p style={{ fontSize: 13, lineHeight: 1.5, color: "var(--sub)", margin: 0 }}>{st.why}</p>
                  {st.learn.length > 0 && (
                    <p className="m1-t11" style={{ margin: 0 }}>
                      read first:{" "}
                      {st.learn.map((id, k) => (
                        <span key={id}>
                          {k > 0 && ", "}
                          <a style={{ textDecoration: "underline" }} href={`/atlas#${id}`}>{atlasById(id)?.name ?? id}</a>
                        </span>
                      ))}
                    </p>
                  )}
                  {isCurrent && !ok && lessonsForStage(st.id).length > 0 && (
                    <p className="m1-t11" style={{ margin: 0 }} data-testid="stage-lessons">
                      stuck? lessons for this stage:{" "}
                      {lessonsForStage(st.id).map((m, k) => (
                        <span key={m.slug}>
                          {k > 0 && ", "}
                          <a style={{ textDecoration: "underline" }} href={`/learn/${m.slug}`}>{m.title}</a>
                        </span>
                      ))}
                    </p>
                  )}
                  {(isCurrent || ok) && (
                    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
                      {st.checks.map((c) => {
                        const rc = r?.checks.find((x) => x.id === c.id);
                        const pass = ok || rc?.pass;
                        return (
                          <li key={c.id} style={{ fontSize: 13, lineHeight: 1.45, display: "flex", gap: 8 }}>
                            <span className="ls-led" style={{ ["--c" as string]: pass ? "var(--led-mint)" : "var(--ledoff)", marginTop: 5 }} />
                            <span>
                              <span className="sr-only">{pass ? "Passed: " : "Not yet: "}</span>
                              {c.label}
                              {rc && <span className="m1-t11"> ({rc.found})</span>}
                              {!pass && rc && <span style={{ display: "block", color: "var(--sub)", marginTop: 2 }}>{rc.hint}</span>}
                            </span>
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
        <div className="ls-panel" style={{ marginTop: 12, flexDirection: "column", gap: 4 }}>
          <b style={{ fontSize: 17, fontWeight: 500 }}>you built a track.</b>
          <span style={{ fontSize: 14 }}>next: <a style={{ textDecoration: "underline" }} href="/gym">train your ears</a> or <a style={{ textDecoration: "underline" }} href="/link">run the mixing checks</a>.</span>
        </div>
      )}
    </RefPage>
  );
}
