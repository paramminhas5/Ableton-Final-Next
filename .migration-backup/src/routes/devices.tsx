import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DEVICES, type DeviceDef } from "@/content/devices";
import { INSTRUMENTS } from "@/content/instruments";
import { DeviceChainSim } from "@/components/sims/DeviceChainSim";

export const Route = createFileRoute("/devices")({
  head: () => ({ meta: [
    { title: "Device Lab — CCD.SCHOOL" },
    { name: "description", content: "Real, working device emulations + every built-in instrument explained." },
  ]}),
  component: DevicesIndex,
});

const CATEGORIES = ["ALL", "INSTRUMENT", "EQ", "DYNAMICS", "DRIVE", "TIME", "MOD", "FILTER"] as const;
type Cat = (typeof CATEGORIES)[number];

const CAT_COLOR: Record<DeviceDef["category"] | "INSTRUMENT", string> = {
  INSTRUMENT: "bg-hot text-bone",
  EQ: "bg-acid",
  DYNAMICS: "bg-hot text-bone",
  DRIVE: "bg-sun",
  TIME: "bg-volt text-bone",
  MOD: "bg-bone",
  FILTER: "bg-acid",
};

function DevicesIndex() {
  const [cat, setCat] = useState<Cat>("ALL");
  const [q, setQ] = useState("");

  const filteredDevices = useMemo(() => DEVICES
    .filter((d) => cat === "ALL" || d.category === cat)
    .filter((d) => !q || d.name.toLowerCase().includes(q.toLowerCase()) || d.tagline.toLowerCase().includes(q.toLowerCase())), [cat, q]);

  const filteredInstruments = useMemo(() => INSTRUMENTS
    .filter(() => cat === "ALL" || cat === "INSTRUMENT")
    .filter((i) => !q || i.name.toLowerCase().includes(q.toLowerCase()) || i.tagline.toLowerCase().includes(q.toLowerCase())), [cat, q]);

  const total = filteredDevices.length + filteredInstruments.length;

  return (
    <div className="max-w-7xl mx-auto p-3 md:p-12">
      <div className="brutal-border bg-volt text-bone p-4 md:p-6 brutal-shadow mb-4 md:mb-6">
        <div className="font-mono text-xs uppercase">// DEVICE LAB</div>
        <h1 className="text-3xl sm:text-5xl md:text-7xl mt-2">EVERY KNOB, AUDIBLE.</h1>
        <p className="font-mono mt-2 text-sm md:text-base">{DEVICES.length} effect labs + {INSTRUMENTS.length} instruments explained. Real loops. A/B on every device.</p>
      </div>

      <div className="brutal-border bg-card p-2 md:p-3 mb-4 sticky top-12 md:top-14 z-30">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="SEARCH DEVICES & INSTRUMENTS…"
          className="brutal-border bg-bone px-3 py-2 font-mono text-sm uppercase w-full mb-2"
        />
        <div className="flex flex-wrap gap-1.5 items-center">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`brutal-border px-2.5 py-1.5 font-mono text-[11px] uppercase brutal-press ${cat === c ? "bg-acid" : "bg-bone"}`}>
              {c}
            </button>
          ))}
          <span className="font-mono text-xs uppercase ml-auto">{total} items</span>
        </div>
      </div>

      {/* INSTRUMENTS — show only when relevant */}
      {filteredInstruments.length > 0 && (
        <section className="mb-6">
          <h2 className="font-display text-2xl md:text-3xl mb-2">★ INSTRUMENTS</h2>
          <p className="font-mono text-xs opacity-70 mb-3">Built-in synths, samplers and racks. Click through to the mission that teaches each one.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {filteredInstruments.map((i) => (
              <Link key={i.slug} to="/mission/$slug" params={{ slug: i.slug }}
                className="brutal-border bg-card p-4 brutal-shadow-sm brutal-press block">
                <div className="flex gap-1 flex-wrap">
                  <span className="inline-block brutal-border bg-hot text-bone px-2 py-0.5 font-mono text-[10px] uppercase">{i.family}</span>
                </div>
                <div className="font-display text-xl md:text-2xl mt-1">{i.name}</div>
                <div className="font-mono text-xs md:text-sm mt-1 opacity-80">{i.tagline}</div>
                <p className="font-mono text-xs mt-2 leading-relaxed">{i.overview}</p>
                <div className="font-mono text-xs uppercase mt-3 brutal-border bg-acid inline-block px-2 py-1">OPEN MISSION →</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* EFFECT DEVICES */}
      {filteredDevices.length > 0 && (
        <section className="mb-6">
          <h2 className="font-display text-2xl md:text-3xl mb-2">⚙ EFFECTS — REAL LABS</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {filteredDevices.map((d) => (
              <Link key={d.slug} to="/device/$slug" params={{ slug: d.slug }}
                className="brutal-border bg-card p-4 brutal-shadow-sm brutal-press block">
                <div className={`inline-block brutal-border ${CAT_COLOR[d.category]} px-2 py-0.5 font-mono text-[10px] uppercase`}>{d.category}</div>
                <div className="font-display text-xl md:text-2xl mt-1">{d.name}</div>
                <div className="font-mono text-xs md:text-sm mt-1 opacity-80">{d.tagline}</div>
                <p className="font-mono text-xs mt-2 leading-relaxed line-clamp-3">{d.what}</p>
                <div className="font-mono text-xs uppercase mt-3 brutal-border bg-acid inline-block px-2 py-1">OPEN LAB →</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {total === 0 && (
        <div className="brutal-border bg-hot text-bone p-4 font-mono">No matches. Try a different search or category.</div>
      )}

      {/* Chain builder — collapsed at the bottom */}
      <details className="brutal-border bg-card p-3 md:p-4 mt-6">
        <summary className="font-mono text-xs uppercase cursor-pointer font-bold">▸ BUILD A CHAIN — hear order matter in real time</summary>
        <p className="font-mono text-xs opacity-70 my-3">Stack devices left to right on a live drum loop. Try EQ → Comp vs Comp → EQ.</p>
        <DeviceChainSim />
      </details>
    </div>
  );
}
