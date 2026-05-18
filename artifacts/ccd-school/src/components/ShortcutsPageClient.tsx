"use client";
import { useState, useMemo } from "react";

type Shortcut = { keys: string[]; desc: string; cat: string };

const SHORTCUTS: Shortcut[] = [
  { keys: ["Cmd/Ctrl", "Z"], desc: "Undo", cat: "General" },
  { keys: ["Cmd/Ctrl", "Shift", "Z"], desc: "Redo", cat: "General" },
  { keys: ["Cmd/Ctrl", "S"], desc: "Save Set", cat: "General" },
  { keys: ["Cmd/Ctrl", "Shift", "S"], desc: "Save Set As", cat: "General" },
  { keys: ["Cmd/Ctrl", "N"], desc: "New Set", cat: "General" },
  { keys: ["Cmd/Ctrl", "O"], desc: "Open Set", cat: "General" },
  { keys: ["Space"], desc: "Play/Stop", cat: "Transport" },
  { keys: ["F9"], desc: "Record", cat: "Transport" },
  { keys: ["Shift", "Space"], desc: "Play from selection", cat: "Transport" },
  { keys: ["Cmd/Ctrl", "Space"], desc: "Capture MIDI", cat: "Transport" },
  { keys: ["Tab"], desc: "Switch Session/Arrangement", cat: "Navigation" },
  { keys: ["Cmd/Ctrl", "Alt", "L"], desc: "Toggle Device View", cat: "Navigation" },
  { keys: ["Cmd/Ctrl", "Alt", "B"], desc: "Toggle Browser", cat: "Navigation" },
  { keys: ["Cmd/Ctrl", "Alt", "M"], desc: "Toggle MIDI Map Mode", cat: "MIDI" },
  { keys: ["Cmd/Ctrl", "Alt", "K"], desc: "Toggle Key Map Mode", cat: "MIDI" },
  { keys: ["Cmd/Ctrl", "D"], desc: "Duplicate Track/Clip", cat: "Editing" },
  { keys: ["Cmd/Ctrl", "E"], desc: "Split Clip at Selection", cat: "Editing" },
  { keys: ["Cmd/Ctrl", "J"], desc: "Join Clips", cat: "Editing" },
  { keys: ["Cmd/Ctrl", "L"], desc: "Loop Selection", cat: "Editing" },
  { keys: ["Cmd/Ctrl", "G"], desc: "Group Tracks", cat: "Tracks" },
  { keys: ["Cmd/Ctrl", "Shift", "G"], desc: "Ungroup Tracks", cat: "Tracks" },
  { keys: ["Cmd/Ctrl", "T"], desc: "New Audio Track", cat: "Tracks" },
  { keys: ["Cmd/Ctrl", "Shift", "T"], desc: "New MIDI Track", cat: "Tracks" },
  { keys: ["Cmd/Ctrl", "Alt", "T"], desc: "New Return Track", cat: "Tracks" },
  { keys: ["M"], desc: "Toggle Track Mute", cat: "Tracks" },
  { keys: ["S"], desc: "Toggle Track Solo", cat: "Tracks" },
  { keys: ["0"], desc: "Set Volume to 0dB", cat: "Mixer" },
  { keys: ["Cmd/Ctrl", "Shift", "F"], desc: "Find in Browser", cat: "Browser" },
];

const CATS = ["All", ...Array.from(new Set(SHORTCUTS.map((s) => s.cat)))];

export function ShortcutsPageClient() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");

  const filtered = useMemo(() => SHORTCUTS
    .filter((s) => cat === "All" || s.cat === cat)
    .filter((s) => !q || s.desc.toLowerCase().includes(q.toLowerCase()) || s.keys.join(" ").toLowerCase().includes(q.toLowerCase())),
    [q, cat]
  );

  return (
    <main className="min-h-screen bg-bone">
      <header className="brutal-border border-x-0 border-t-0 bg-bone">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="font-mono text-[10px] uppercase opacity-40 mb-1">// ABLETON LIVE 12</div>
          <h1 className="font-display text-4xl md:text-6xl leading-none">SHORTCUTS</h1>
          <p className="font-mono text-sm mt-2 opacity-70">Every keyboard shortcut in Ableton Live. Searchable and categorised.</p>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
        <div className="brutal-border bg-bone p-3 mb-4 flex flex-wrap gap-2 items-center sticky top-12 md:top-14 z-20">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search shortcuts…"
            className="brutal-border bg-bone px-3 py-2 font-mono text-sm flex-1 min-w-[180px] focus:outline-none" />
          {CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`brutal-border px-3 py-1.5 font-mono text-[10px] uppercase brutal-press ${cat === c ? "bg-acid" : "bg-bone"}`}>{c}</button>
          ))}
          <span className="font-mono text-[9px] uppercase opacity-50 ml-auto">{filtered.length}</span>
        </div>
        <div className="brutal-border divide-y divide-ink/10">
          {filtered.map((s, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-sun/20">
              <div className="flex gap-1 shrink-0">
                {s.keys.map((k, ki) => (
                  <span key={ki}>
                    {ki > 0 && <span className="font-mono text-[9px] opacity-30 mx-0.5">+</span>}
                    <kbd className="brutal-border bg-ink text-bone px-2 py-0.5 font-mono text-[10px] uppercase">{k}</kbd>
                  </span>
                ))}
              </div>
              <div className="flex-1 font-mono text-sm">{s.desc}</div>
              <div className="shrink-0 brutal-border bg-bone px-2 py-0.5 font-mono text-[9px] uppercase opacity-60">{s.cat}</div>
            </div>
          ))}
          {filtered.length === 0 && <div className="p-6 font-mono text-sm opacity-50">No shortcuts match your search.</div>}
        </div>
      </div>
    </main>
  );
}
