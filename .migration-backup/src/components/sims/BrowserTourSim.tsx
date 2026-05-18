import { useState } from "react";

const ITEMS = [
  { cat: "SOUNDS", items: ["Bass · Sub Pluck", "Lead · Acid Saw", "Pad · Glass Choir", "Keys · Soft Rhodes"] },
  { cat: "DRUMS", items: ["Kit · 909 Core", "Kit · 808 Trap", "One-Shot · Snap", "One-Shot · Crash"] },
  { cat: "SAMPLES", items: ["Loop · Funk Drums 95", "Loop · Vox Chop", "FX · Riser 8 Bar", "FX · Downlifter"] },
  { cat: "INSTRUMENTS", items: ["Operator", "Wavetable", "Drift", "Meld", "Sampler", "Drum Rack"] },
  { cat: "AUDIO EFFECTS", items: ["EQ Eight", "Compressor", "Reverb", "Hybrid Reverb", "Echo", "Saturator", "Roar"] },
  { cat: "MAX FOR LIVE", items: ["LFO", "Envelope Follower", "Convolution Reverb"] },
];

export function BrowserTourSim() {
  const [cat, setCat] = useState(0);
  const [q, setQ] = useState("");
  const list = ITEMS[cat].items.filter((i) => i.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="grid md:grid-cols-[200px,1fr] gap-3 brutal-border bg-card">
      <div className="brutal-border border-y-0 border-l-0 p-2 space-y-1">
        {ITEMS.map((c, i) => (
          <button key={c.cat} onClick={() => setCat(i)} className={`w-full text-left font-mono text-xs uppercase brutal-border px-2 py-1 ${cat === i ? "bg-acid" : "bg-bone"}`}>
            {c.cat}
          </button>
        ))}
      </div>
      <div className="p-3 space-y-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="w-full brutal-border bg-bone p-2 font-mono text-sm" />
        <ul className="space-y-1">
          {list.map((i) => (
            <li key={i} className="brutal-border bg-bone px-3 py-2 font-mono text-sm flex items-center justify-between hover:bg-acid cursor-grab">
              <span>{i}</span><span className="text-xs opacity-60">drag →</span>
            </li>
          ))}
          {list.length === 0 && <li className="font-mono text-xs opacity-60">No matches.</li>}
        </ul>
      </div>
    </div>
  );
}
