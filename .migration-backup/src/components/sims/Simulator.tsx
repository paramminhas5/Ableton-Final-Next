import { lazy, Suspense, Component, type ReactNode, type ErrorInfo } from "react";
import type { SimType } from "@/content/types";

// Lazy-load every simulator — users only download code for sims they visit.
const DrumPadSim = lazy(() => import("./DrumPadSim").then((m) => ({ default: m.DrumPadSim })));
const PianoRollSim = lazy(() =>
  import("./PianoRollSim").then((m) => ({ default: m.PianoRollSim })),
);
const MixerSim = lazy(() => import("./MixerSim").then((m) => ({ default: m.MixerSim })));
const DeviceChainSim = lazy(() =>
  import("./DeviceChainSim").then((m) => ({ default: m.DeviceChainSim })),
);
const WarpLabSim = lazy(() => import("./WarpLabSim").then((m) => ({ default: m.WarpLabSim })));
const KnobTrainerSim = lazy(() =>
  import("./KnobTrainerSim").then((m) => ({ default: m.KnobTrainerSim })),
);
const SessionGridSim = lazy(() =>
  import("./SessionGridSim").then((m) => ({ default: m.SessionGridSim })),
);
const ArrangementSim = lazy(() =>
  import("./ArrangementSim").then((m) => ({ default: m.ArrangementSim })),
);
const RoutingPuzzleSim = lazy(() =>
  import("./RoutingPuzzleSim").then((m) => ({ default: m.RoutingPuzzleSim })),
);
const MidiMapSim = lazy(() => import("./MidiMapSim").then((m) => ({ default: m.MidiMapSim })));
const EarTrainingSim = lazy(() =>
  import("./EarTrainingSim").then((m) => ({ default: m.EarTrainingSim })),
);
const InterfaceTourSim = lazy(() =>
  import("./InterfaceTourSim").then((m) => ({ default: m.InterfaceTourSim })),
);
const BrowserTourSim = lazy(() =>
  import("./BrowserTourSim").then((m) => ({ default: m.BrowserTourSim })),
);
const MidiVsAudioSim = lazy(() =>
  import("./MidiVsAudioSim").then((m) => ({ default: m.MidiVsAudioSim })),
);
const DeviceLabBySlug = lazy(() =>
  import("./DeviceLabBySlug").then((m) => ({ default: m.DeviceLabBySlug })),
);
const SidechainSim = lazy(() =>
  import("./SidechainSim").then((m) => ({ default: m.SidechainSim })),
);
const SendReturnSim = lazy(() =>
  import("./SendReturnSim").then((m) => ({ default: m.SendReturnSim })),
);
const StemSplitterSim = lazy(() =>
  import("./StemSplitterSim").then((m) => ({ default: m.StemSplitterSim })),
);
const MidiTransformSim = lazy(() =>
  import("./MidiTransformSim").then((m) => ({ default: m.MidiTransformSim })),
);
const ScaleAwareSim = lazy(() =>
  import("./ScaleAwareSim").then((m) => ({ default: m.ScaleAwareSim })),
);
const CompLakeSim = lazy(() => import("./CompLakeSim").then((m) => ({ default: m.CompLakeSim })));
const GrooveExtractorSim = lazy(() =>
  import("./GrooveExtractorSim").then((m) => ({ default: m.GrooveExtractorSim })),
);
const Push3Sim = lazy(() => import("./Push3Sim").then((m) => ({ default: m.Push3Sim })));
const BeatBuilderSim = lazy(() => import("./BeatBuilderSim").then((m) => ({ default: m.BeatBuilderSim })));
const NoteExplorerSim = lazy(() => import("./NoteExplorerSim").then((m) => ({ default: m.NoteExplorerSim })));
const ChordStackerSim = lazy(() => import("./ChordStackerSim").then((m) => ({ default: m.ChordStackerSim })));
const BasslineLabSim = lazy(() => import("./BasslineLabSim").then((m) => ({ default: m.BasslineLabSim })));
const MelodyShaperSim = lazy(() => import("./MelodyShaperSim").then((m) => ({ default: m.MelodyShaperSim })));
const SongStructureSim = lazy(() => import("./SongStructureSim").then((m) => ({ default: m.SongStructureSim })));
const SubtractiveSynthSim = lazy(() => import("./SubtractiveSynthSim").then((m) => ({ default: m.SubtractiveSynthSim })));
const BeatmatchTrainerSim = lazy(() => import("./BeatmatchTrainerSim").then((m) => ({ default: m.BeatmatchTrainerSim })));
const HotCueDrillSim = lazy(() => import("./HotCueDrillSim").then((m) => ({ default: m.HotCueDrillSim })));
const LoopRollSim = lazy(() => import("./LoopRollSim").then((m) => ({ default: m.LoopRollSim })));
const HarmonicMixWheelSim = lazy(() => import("./HarmonicMixWheelSim").then((m) => ({ default: m.HarmonicMixWheelSim })));
const OscillatorMixerSim = lazy(() => import("./OscillatorMixerSim").then((m) => ({ default: m.OscillatorMixerSim })));
const FilterEnvelopeSim = lazy(() => import("./FilterEnvelopeSim").then((m) => ({ default: m.FilterEnvelopeSim })));
const LFOLabSim = lazy(() => import("./LFOLabSim").then((m) => ({ default: m.LFOLabSim })));

function SimSkeleton() {
  return (
    <div className="brutal-border bg-card p-6 space-y-3">
      <div className="flex gap-2">
        <div className="h-9 w-24 brutal-border bg-bone animate-pulse" />
        <div className="h-9 w-40 brutal-border bg-bone animate-pulse" />
      </div>
      <div className="grid grid-cols-8 gap-1">
        {Array.from({ length: 32 }).map((_, i) => (
          <div key={i} className="h-9 brutal-border bg-bone animate-pulse" />
        ))}
      </div>
      <div className="h-3 w-48 bg-bone animate-pulse rounded" />
    </div>
  );
}

interface EBState {
  error: Error | null;
}
class SimErrorBoundary extends Component<{ children: ReactNode }, EBState> {
  state: EBState = { error: null };
  static getDerivedStateFromError(error: Error): EBState {
    return { error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[SimErrorBoundary]", error, info.componentStack);
  }
  reset = () => this.setState({ error: null });
  render() {
    if (this.state.error) {
      return (
        <div className="brutal-border bg-hot text-bone p-6 space-y-3">
          <div className="font-display text-2xl">SIMULATOR CRASHED</div>
          <div className="font-mono text-xs opacity-80 break-all">{this.state.error.message}</div>
          <div className="font-mono text-[10px] uppercase opacity-60 leading-relaxed">
            Your progress is safe — the explainer and quiz still work.
            <br />
            Common fix: click anywhere on the page first to unlock audio, then retry.
          </div>
          <button
            onClick={this.reset}
            className="brutal-border bg-bone text-ink px-4 py-2 font-mono uppercase brutal-press"
          >
            ↺ Retry Simulator
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function SimInner({ type, preset }: { type: SimType; preset?: Record<string, unknown> }) {
  switch (type) {
    case "drum-pad":
      return <DrumPadSim />;
    case "piano-roll":
      return <PianoRollSim />;
    case "mixer":
      return <MixerSim />;
    case "device-chain":
      return <DeviceChainSim />;
    case "warp-lab":
      return <WarpLabSim />;
    case "knob-trainer":
      return <KnobTrainerSim preset={preset} />;
    case "session-grid":
      return <SessionGridSim />;
    case "arrangement":
      return <ArrangementSim />;
    case "routing-puzzle":
      return <RoutingPuzzleSim />;
    case "midi-map":
      return <MidiMapSim />;
    case "ear-training":
      return <EarTrainingSim preset={preset} />;
    case "interface-tour":
      return <InterfaceTourSim />;
    case "browser-tour":
      return <BrowserTourSim />;
    case "midi-vs-audio":
      return <MidiVsAudioSim />;
    case "device-lab":
      return <DeviceLabBySlug slug={(preset?.device as string) || "eq"} />;
    case "sidechain":
      return <SidechainSim />;
    case "send-return":
      return <SendReturnSim />;
    case "stem-splitter":
      return <StemSplitterSim />;
    case "midi-transform":
      return <MidiTransformSim />;
    case "scale-aware":
      return <ScaleAwareSim />;
    case "comp-lake":
      return <CompLakeSim />;
    case "groove-extractor":
      return <GrooveExtractorSim />;
    case "push3":
      return <Push3Sim />;
    case "beat-builder":
      return <BeatBuilderSim />;
    case "note-explorer":
      return <NoteExplorerSim />;
    case "chord-stacker":
      return <ChordStackerSim />;
    case "bassline-lab":
      return <BasslineLabSim />;
    case "melody-shaper":
      return <MelodyShaperSim />;
    case "song-structure":
      return <SongStructureSim />;
    case "subtractive-synth":
      return <SubtractiveSynthSim />;
    case "beatmatch-trainer":
      return <BeatmatchTrainerSim />;
    case "hot-cue-drill":
      return <HotCueDrillSim />;
    case "loop-roll":
      return <LoopRollSim />;
    case "harmonic-mix-wheel":
      return <HarmonicMixWheelSim />;
    case "osc-mixer":
      return <OscillatorMixerSim />;
    case "filter-envelope":
      return <FilterEnvelopeSim />;
    case "lfo-lab":
      return <LFOLabSim />;
    default:
      return (
        <div className="brutal-border bg-bone p-6 font-mono text-xs uppercase">
          No simulator for this mission — read &amp; quiz only.
        </div>
      );
  }
}

export function Simulator({ type, preset }: { type: SimType; preset?: Record<string, unknown> }) {
  return (
    <SimErrorBoundary>
      <Suspense fallback={<SimSkeleton />}>
        <SimInner type={type} preset={preset} />
      </Suspense>
    </SimErrorBoundary>
  );
}

export const SIM_LIST: { type: SimType; label: string; color: string }[] = [
  { type: "drum-pad", label: "Drum Rack", color: "bg-acid" },
  { type: "piano-roll", label: "Piano Roll", color: "bg-hot text-bone" },
  { type: "mixer", label: "Mixer", color: "bg-volt text-bone" },
  { type: "device-chain", label: "Device Chain", color: "bg-sun" },
  { type: "warp-lab", label: "Warp Lab", color: "bg-acid" },
  { type: "knob-trainer", label: "Knob Trainer", color: "bg-hot text-bone" },
  { type: "session-grid", label: "Session Grid", color: "bg-volt text-bone" },
  { type: "arrangement", label: "Arrangement", color: "bg-sun" },
  { type: "routing-puzzle", label: "Routing", color: "bg-acid" },
  { type: "midi-map", label: "MIDI Map", color: "bg-hot text-bone" },
  { type: "ear-training", label: "Ear Training", color: "bg-volt text-bone" },
  { type: "interface-tour", label: "Interface Tour", color: "bg-sun" },
  { type: "browser-tour", label: "Browser", color: "bg-acid" },
  { type: "sidechain", label: "Sidechain", color: "bg-hot text-bone" },
  { type: "send-return", label: "Sends/Returns", color: "bg-volt text-bone" },
  { type: "stem-splitter", label: "Stem Splitter", color: "bg-acid" },
  { type: "midi-transform", label: "MIDI Transform", color: "bg-hot text-bone" },
  { type: "scale-aware", label: "Scale Aware", color: "bg-volt text-bone" },
  { type: "comp-lake", label: "Comp Lake", color: "bg-sun" },
  { type: "groove-extractor", label: "Groove Pool", color: "bg-acid" },
  { type: "push3", label: "Push 3", color: "bg-hot text-bone" },
];
