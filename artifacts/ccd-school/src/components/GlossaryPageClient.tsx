"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Silk, Icon } from "@/components/m1/controls";
import { Chips, RefPage, SearchField } from "@/components/m1/parts";
import { TERMS, slugTerm, type GlossaryTerm as Term } from "@/content/glossary";

const CATS: Term["cat"][] = ["Workflow", "Devices", "Audio", "MIDI", "Performance", "Live 12", "Files"];

// P2 #27: Map key glossary terms to their most relevant mission slug
const TERM_MISSION_MAP: Record<string, string> = {
  "EQ": "eq-eight-basics",
  "EQ Eight": "eq-eight-basics",
  "Compression": "compressor-basics",
  "Compressor": "compressor-basics",
  "Sidechain": "sidechain-compression",
  "Reverb": "reverb-delay",
  "Delay": "reverb-delay",
  "MIDI": "midi-piano-roll",
  "Piano Roll": "midi-piano-roll",
  "Warp": "warp-modes",
  "Drum Rack": "drum-rack",
  "Sampler": "sampler-simpler",
  "Wavetable": "wavetable-intro",
  "Operator": "operator-fm",
  "Session View": "what-is-live",
  "Arrangement View": "what-is-live",
  "Browser": "browser-and-library",
  "Rack": "instrument-racks",
  "Macro": "instrument-racks",
  "Automation": "automation-basics",
  "Send / Pre / Post": "sends-returns",
  "Return Track": "sends-returns",
  "Glue Compressor": "glue-compressor",
  "Gain Staging": "gain-staging",
  "LFO": "lfo-modulation",
  "Saturation": "saturator-waveshaper",
  "Push 3": "push-3-intro",
  "Ableton Link": "ableton-link",
};

export function GlossaryPageClient() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const filtered = useMemo(() => {
    return TERMS
      .filter((t) => cat === "all" || t.cat.toLowerCase() === cat)
      .filter((t) => !q || t.term.toLowerCase().includes(q.toLowerCase()) || t.def.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => a.term.localeCompare(b.term));
  }, [q, cat]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.style.boxShadow = "inset 0 0 0 2px var(--led-go)";
      setTimeout(() => { el.style.boxShadow = ""; }, 1800);
    }
  }, []);

  return (
    <RefPage title="glossary" meta="library" right={`${filtered.length} of ${TERMS.length}`} intro="every term from the live 12 manual, in plain words.">
      <SearchField value={q} onChange={setQ} label="Search the glossary" />
      <Chips options={["all", ...CATS.map(c => c.toLowerCase())]} value={cat} onChange={setCat} label="Group" />
      <Silk label="terms" right={`${filtered.length}`} />
      {filtered.map((t) => {
        const missionSlug = TERM_MISSION_MAP[t.term];
        return (
          <div key={t.term} id={slugTerm(t.term)} className="ls-panel" style={{ flexDirection: "column", gap: 6, scrollMarginTop: 80 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, width: "100%" }}>
              <b style={{ fontSize: 17, fontWeight: 500 }}>{t.term}</b>
              <span className="m1-tag">{t.cat.toLowerCase()}</span>
            </div>
            <span style={{ fontSize: 14, lineHeight: 1.5, color: "var(--sub)", fontWeight: 400 }}>{t.def}</span>
            {missionSlug && (
              <Link href={`/learn/${missionSlug}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>
                learn this in a lesson <Icon name="back" small className="ls-flip" />
              </Link>
            )}
          </div>
        );
      })}
      {filtered.length === 0 && <div className="ls-panel"><span className="m1-t11">no matches. try a different word.</span></div>}
    </RefPage>
  );
}
