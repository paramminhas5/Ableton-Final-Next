import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { TERMS, slugTerm, type GlossaryTerm as Term } from "@/content/glossary";


const CATS: Term["cat"][] = ["Workflow", "Devices", "Audio", "MIDI", "Performance", "Live 12", "Files"];

export const Route = createFileRoute("/glossary")({
  head: () => ({ meta: [
    { title: "Glossary — CCD.SCHOOL" },
    { name: "description", content: "A–Z of every Ableton Live concept, organised by category, with search." },
  ]}),
  component: Glossary,
});

function Glossary() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Term["cat"] | "All">("All");
  const filtered = useMemo(() => {
    return TERMS
      .filter((t) => cat === "All" || t.cat === cat)
      .filter((t) => !q || t.term.toLowerCase().includes(q.toLowerCase()) || t.def.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => a.term.localeCompare(b.term));
  }, [q, cat]);

  // If we arrived with a #slug, scroll to that term and pulse-highlight it.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-4", "ring-acid");
      setTimeout(() => el.classList.remove("ring-4", "ring-acid"), 1800);
    }
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 space-y-4">
      <header className="brutal-border bg-sun p-6 brutal-shadow">
        <div className="font-mono text-xs uppercase">// KNOWLEDGE BASE</div>
        <h1 className="text-5xl md:text-7xl mt-2">GLOSSARY</h1>
        <p className="font-mono mt-2">{TERMS.length} terms. Every concept from the Ableton Live 12 manual, defined.</p>
      </header>
      <div className="brutal-border bg-card p-3 flex flex-wrap gap-2 items-center sticky top-0 z-30">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="SEARCH…"
          className="brutal-border bg-bone px-3 py-2 font-mono text-sm uppercase flex-1 min-w-[200px]" />
        <button onClick={() => setCat("All")} className={`brutal-border px-2 py-1 font-mono text-xs uppercase ${cat === "All" ? "bg-acid" : "bg-bone"}`}>ALL</button>
        {CATS.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`brutal-border px-2 py-1 font-mono text-xs uppercase ${cat === c ? "bg-acid" : "bg-bone"}`}>{c}</button>
        ))}
        <span className="font-mono text-xs uppercase ml-auto">{filtered.length} results</span>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {filtered.map((t) => (
          <div key={t.term} id={slugTerm(t.term)} className="brutal-border bg-card p-4 brutal-shadow-sm scroll-mt-24 transition-shadow">
            <div className="flex items-baseline justify-between gap-2">
              <div className="font-display text-xl">{t.term}</div>
              <span className="brutal-border bg-volt text-bone px-2 py-0.5 font-mono text-[10px] uppercase">{t.cat}</span>
            </div>
            <div className="font-mono text-sm mt-1">{t.def}</div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="brutal-border bg-hot text-bone p-4 font-mono">No matches. Try a different term.</div>
        )}
      </div>
      <Link to="/worlds" className="brutal-border bg-acid px-4 py-2 font-mono text-xs uppercase brutal-press inline-block">← BACK TO WORLDS</Link>
    </div>
  );
}
