import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatedSignalFlow } from "@/components/AnimatedSignalFlow";

export const Route = createFileRoute("/signal-flow")({
  head: () => ({
    meta: [
      { title: "Signal Flow — CCD.SCHOOL" },
      { name: "description", content: "How audio actually moves through Live: tracks, sends, returns, master." },
    ],
  }),
  component: SignalFlowPage,
});

const FLOWS: { title: string; flow: string; explain: string }[] = [
  {
    title: "Track signal flow",
    flow: "TRACK IN → INSERT FX → TRACK GAIN → SENDS → MASTER → LIMITER → OUT",
    explain:
      "Every audio or instrument track passes through its insert effects, then its volume fader. Sends branch off to Return tracks (parallel). Everything sums into the Master.",
  },
  {
    title: "Drum Rack chain",
    flow: "MIDI → PAD → SIMPLER → CHAIN FX → RACK MIX → DRUM BUSS → MASTER",
    explain:
      "MIDI hits land on a pad. Each pad is its own chain with a Simpler and any FX. The rack sums them; you can put a Drum Buss after the rack on the same track.",
  },
  {
    title: "Audio vs MIDI track",
    flow: "AUDIO TRACK: INPUT → CLIP → INSERT FX → MIX",
    explain:
      "An audio track plays a sample. A MIDI track plays an instrument: MIDI → INSTRUMENT → INSERT FX → MIX.",
  },
  {
    title: "Sidechain ducking",
    flow: "KICK SEND → COMP DETECTOR → BASS COMP → BASS OUT",
    explain:
      "Route the kick into the bass compressor's sidechain input. The kick triggers gain reduction on the bass — classic pump.",
  },
];

function SignalFlowPage() {
  return (
    <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-6">
      <header className="brutal-border bg-acid p-6 brutal-shadow">
        <div className="font-mono text-xs uppercase">// REFERENCE</div>
        <h1 className="text-5xl md:text-7xl mt-2">SIGNAL FLOW</h1>
        <p className="font-mono mt-2">Where sound goes inside Live. Read top-to-bottom.</p>
      </header>
      {FLOWS.map((f) => (
        <section key={f.title} className="brutal-border bg-card p-4 brutal-shadow-sm space-y-3">
          <div className="font-display text-2xl">{f.title}</div>
          <AnimatedSignalFlow flow={f.flow} legend="Glowing dot = your audio signal travelling through Live." />
          <p className="font-mono text-sm">{f.explain}</p>
        </section>
      ))}
      <Link to="/" className="brutal-border bg-bone px-4 py-2 font-mono text-xs uppercase brutal-press inline-block">← HOME</Link>
    </div>
  );
}