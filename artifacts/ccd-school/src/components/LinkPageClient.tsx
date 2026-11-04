"use client";
import { useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { missionBySlug } from "@/content/missions";
import { GoPill, Silk } from "@/components/m1/controls";
import { RefPage } from "@/components/m1/parts";

/** which lessons teach what each Set mission looks for */
const MISSION_LESSONS: Record<string, string[]> = {
  "name-your-tracks": ["tracks", "the-mixer"],
  "pump-the-bass": ["compressor", "sidechain"],
  "drum-bus": ["groups-routing", "glue-compressor"],
  "space-with-a-return": ["sends-returns", "reverb-delay"],
};

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
    <RefPage title="check my set" back="/atlas" meta="live"
      intro="upload a live set (.als). it is read in memory, checked against four real mixing habits, and thrown away. nothing is stored and your set is never changed.">
      <div className="ls-panel" style={{ flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center", marginTop: 12, padding: 20 }}
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
        <GoPill onClick={() => input.current?.click()} disabled={busy}>{busy ? "reading" : "choose a .als file"}</GoPill>
        <span className="m1-t11">or drop it here. up to 30 mb.</span>
        <p role="alert" style={{ color: "var(--led-red)", fontSize: 13, minHeight: 18, margin: 0 }}>{error}</p>
      </div>

      {res && (
        <>
          <section aria-label="Your Set">
            <Silk label="your set" right={`${res.set.tracks.length} tracks, ${res.set.returns.length} returns`} />
            <div className="ls-panel" style={{ flexDirection: "column", gap: 4, marginTop: 8 }}>
              <b style={{ fontSize: 16, fontWeight: 500 }}>
                {res.set.tempo} bpm, {res.set.timeSignature.join("/")}
                {res.set.scale ? `, ${res.set.scale.root} ${res.set.scale.name}` : ""}
              </b>
              {res.set.liveVersion ? <span className="m1-t11">live {res.set.liveVersion}</span> : null}
            </div>
            {all.map((t, i) => (
              <div key={i} className="ls-panel" style={{ flexDirection: "column", gap: 4, marginTop: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, width: "100%" }}>
                  <b style={{ fontSize: 15, fontWeight: 500 }}>{t.name || "(unnamed)"}</b>
                  <span className="m1-tag">{t.kind.toLowerCase()}</span>
                </div>
                {t.devices.length > 0 && (
                  <span style={{ fontSize: 13, color: "var(--sub)" }}>
                    {t.devices.map((d, k) => (
                      <span key={k}>
                        {k > 0 && ", "}
                        {d.atlasId ? <a style={{ textDecoration: "underline" }} href={`/atlas#${d.atlasId}`}>{d.name}</a> : d.name}
                      </span>
                    ))}
                  </span>
                )}
                {(t.notes > 0 || t.sidechain.length > 0) && (
                  <span className="m1-t11">
                    {t.notes > 0 ? `${t.notes} notes` : ""}{t.notes > 0 && t.sidechain.length > 0 ? ", " : ""}{t.sidechain.length > 0 ? `sidechain: ${t.sidechain.join(", ")}` : ""}
                  </span>
                )}
              </div>
            ))}
          </section>

          <section aria-label="Missions">
            <Silk label="missions" right={`${res.missions.filter((m) => m.passed).length} of ${res.missions.length} done`} />
            {res.missions.map((m) => (
              <article key={m.id} className="ls-panel" style={{ flexDirection: "column", gap: 8, marginTop: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
                  <span className="ls-led" style={{ ["--c" as string]: m.passed ? "var(--led-mint)" : "var(--ledoff)", marginTop: 0 }} />
                  <b style={{ fontSize: 16, fontWeight: 500, flex: 1 }}>{m.title.toLowerCase()}</b>
                  {m.passed ? <span className="m1-tag">done</span> : null}
                </div>
                {!m.passed && MISSION_LESSONS[m.id] && (
                  <p className="m1-t11" style={{ margin: 0 }} data-testid="weak-spot-lessons">
                    learn it:{" "}
                    {MISSION_LESSONS[m.id].map((slug, k) => (
                      <span key={slug}>
                        {k > 0 && ", "}
                        <a style={{ textDecoration: "underline" }} href={`/learn/${slug}`}>{missionBySlug(slug)?.title ?? slug}</a>
                      </span>
                    ))}
                  </p>
                )}
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
                  {m.checks.map((c) => (
                    <li key={c.id} style={{ fontSize: 13, lineHeight: 1.45 }}>
                      <span className="sr-only">{c.pass ? "Passed: " : "Not yet: "}</span>
                      <span style={{ color: c.pass ? "var(--ink)" : "var(--sub)" }}>{c.label}</span>{" "}
                      <span className="m1-t11">({c.found})</span>
                      {!c.pass && <span style={{ display: "block", color: "var(--sub)", marginTop: 2 }}>{c.hint}</span>}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
            <p className="m1-t11" style={{ marginTop: 10 }}>fix something in live, save, and upload again.</p>
          </section>
        </>
      )}
    </RefPage>
  );
}
