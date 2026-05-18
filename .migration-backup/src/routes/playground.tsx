import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Simulator } from "@/components/sims/Simulator";
import { DeviceChainSim } from "@/components/sims/DeviceChainSim";
import type { SimType } from "@/content/types";

export const Route = createFileRoute("/playground")({
  head: () => ({
    meta: [
      { title: "Workbench — CCD.SCHOOL" },
      {
        name: "description",
        content: "Hands-on labs: device chain, sidechain, sends, drum rack, piano roll, mixer.",
      },
    ],
  }),
  component: Workbench,
});

type TabId = "chain" | SimType;
const SIM_TABS: { id: SimType; label: string }[] = [
  { id: "sidechain", label: "Sidechain" },
  { id: "send-return", label: "Sends/Returns" },
  { id: "drum-pad", label: "Drum Rack" },
  { id: "piano-roll", label: "Piano Roll" },
  { id: "mixer", label: "Mixer" },
  { id: "device-chain", label: "Device Chain v2" },
  { id: "warp-lab", label: "Warp Lab" },
  { id: "knob-trainer", label: "Knob Trainer" },
  { id: "session-grid", label: "Session Grid" },
  { id: "arrangement", label: "Arrangement" },
  { id: "routing-puzzle", label: "Routing" },
  { id: "midi-map", label: "MIDI Map" },
  { id: "ear-training", label: "Ear Training" },
  { id: "midi-vs-audio", label: "MIDI vs Audio" },
  { id: "interface-tour", label: "Interface" },
];

function Workbench() {
  const [tab, setTab] = useState<TabId>("chain");
  return (
    <div className="max-w-7xl mx-auto p-3 md:p-12 space-y-4 md:space-y-6">
      <header>
        <h1 className="text-3xl sm:text-5xl md:text-7xl">// WORKBENCH</h1>
        <p className="font-mono text-xs uppercase opacity-70 mt-2">
          Hands-on labs. Each one has its own ▶ play button and its own audio — no shared transport.
        </p>
      </header>

      <div className="brutal-border bg-card p-2 flex gap-1 overflow-x-auto whitespace-nowrap scrollbar-thin">
        <TabBtn id="chain" tab={tab} setTab={setTab} label="DEVICE CHAIN" />
        {SIM_TABS.map((t) => (
          <TabBtn key={t.id} id={t.id} tab={tab} setTab={setTab} label={t.label.toUpperCase()} />
        ))}
      </div>

      <div className="brutal-border bg-card p-4">
        {tab === "chain" ? <DeviceChainSim /> : <Simulator type={tab as SimType} />}
      </div>
    </div>
  );
}

function TabBtn({
  id,
  tab,
  setTab,
  label,
}: {
  id: TabId;
  tab: TabId;
  setTab: (t: TabId) => void;
  label: string;
}) {
  const active = tab === id;
  return (
    <button
      onClick={() => setTab(id)}
      aria-pressed={active}
      className={`brutal-border px-3 py-1.5 font-mono text-[11px] uppercase brutal-press ${active ? "bg-ink text-bone" : "bg-bone text-ink hover:bg-acid"}`}
    >
      {label}
    </button>
  );
}
