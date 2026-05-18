import { useState } from "react";

const HOTSPOTS = [
  { x: 8, y: 12, w: 84, h: 8, label: "CONTROL BAR", desc: "Tempo, transport, metronome, quantization, MIDI/Key map." },
  { x: 8, y: 22, w: 18, h: 60, label: "BROWSER", desc: "Sounds, drums, samples, packs, your library." },
  { x: 27, y: 22, w: 65, h: 38, label: "MAIN VIEW", desc: "Session grid or Arrangement timeline (Tab to switch)." },
  { x: 27, y: 61, w: 65, h: 21, label: "DETAIL VIEW", desc: "Clip & device editor — opens at the bottom." },
  { x: 27, y: 83, w: 65, h: 6, label: "MIXER STRIP", desc: "Faders, sends, IO." },
  { x: 8, y: 83, w: 18, h: 6, label: "INFO VIEW", desc: "Hover anything in Live, read what it does here." },
];

export function InterfaceTourSim() {
  const [active, setActive] = useState<number | null>(null);
  return (
    <div className="grid md:grid-cols-[2fr,1fr] gap-3">
      <div className="brutal-border bg-card relative" style={{ aspectRatio: "16/10" }}>
        <div className="absolute inset-0 grid-bg opacity-30" />
        {HOTSPOTS.map((h, i) => (
          <button key={i} onClick={() => setActive(i)}
            className={`absolute brutal-border font-mono text-[10px] uppercase ${active === i ? "bg-acid" : "bg-card/80"} hover:bg-acid`}
            style={{ left: `${h.x}%`, top: `${h.y}%`, width: `${h.w}%`, height: `${h.h}%` }}>
            {h.label}
          </button>
        ))}
      </div>
      <div className="brutal-border bg-bone p-4">
        <h4 className="font-display text-xl mb-2">{active != null ? HOTSPOTS[active].label : "TAP A REGION"}</h4>
        <p className="font-mono text-sm">{active != null ? HOTSPOTS[active].desc : "Click any labelled region of the fake Live window to learn what it does."}</p>
      </div>
    </div>
  );
}
