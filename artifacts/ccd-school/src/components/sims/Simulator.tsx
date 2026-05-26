"use client";
import { lazy, Suspense, Component, type ReactNode, type ErrorInfo } from "react";
import type { SimType } from "@/content/types";

// ─── CORE SIMS (always loaded) ────────────────────────────────────────────────
const DrumPadSim        = lazy(() => import("./DrumPadSim").then(m => ({ default: m.DrumPadSim })));
const PianoRollSim      = lazy(() => import("./PianoRollSim").then(m => ({ default: m.PianoRollSim })));
const MixerSim          = lazy(() => import("./MixerSim").then(m => ({ default: m.MixerSim })));
const DeviceChainSim    = lazy(() => import("./DeviceChainSim").then(m => ({ default: m.DeviceChainSim })));
const WarpLabSim        = lazy(() => import("./WarpLabSim").then(m => ({ default: m.WarpLabSim })));
const SessionGridSim    = lazy(() => import("./SessionGridSim").then(m => ({ default: m.SessionGridSim })));
const ArrangementSim    = lazy(() => import("./ArrangementSim").then(m => ({ default: m.ArrangementSim })));
const RoutingPuzzleSim  = lazy(() => import("./RoutingPuzzleSim").then(m => ({ default: m.RoutingPuzzleSim })));
const MidiMapSim        = lazy(() => import("./MidiMapSim").then(m => ({ default: m.MidiMapSim })));
const EarTrainingSim    = lazy(() => import("./EarTrainingSim").then(m => ({ default: m.EarTrainingSim })));
const InterfaceTourSim  = lazy(() => import("./InterfaceTourSim").then(m => ({ default: m.InterfaceTourSim })));
const BrowserTourSim    = lazy(() => import("./BrowserTourSim").then(m => ({ default: m.BrowserTourSim })));
const MidiVsAudioSim    = lazy(() => import("./MidiVsAudioSim").then(m => ({ default: m.MidiVsAudioSim })));
const DeviceLabBySlug   = lazy(() => import("./DeviceLabBySlug").then(m => ({ default: m.DeviceLabBySlug })));
const SidechainSim      = lazy(() => import("./SidechainSim").then(m => ({ default: m.SidechainSim })));
const SendReturnSim     = lazy(() => import("./SendReturnSim").then(m => ({ default: m.SendReturnSim })));
const CompLakeSim       = lazy(() => import("./CompLakeSim").then(m => ({ default: m.CompLakeSim })));
const GrooveExtractorSim = lazy(() => import("./GrooveExtractorSim").then(m => ({ default: m.GrooveExtractorSim })));
const BPMTapSim         = lazy(() => import("./BPMTapSim").then(m => ({ default: m.BPMTapSim })));
const BeatBuilderSim    = lazy(() => import("./BeatBuilderSim").then(m => ({ default: m.BeatBuilderSim })));
const NoteExplorerSim   = lazy(() => import("./NoteExplorerSim").then(m => ({ default: m.NoteExplorerSim })));
const ChordStackerSim   = lazy(() => import("./ChordStackerSim").then(m => ({ default: m.ChordStackerSim })));
const BasslineLabSim    = lazy(() => import("./BasslineLabSim").then(m => ({ default: m.BasslineLabSim })));
const MelodyShaperSim   = lazy(() => import("./MelodyShaperSim").then(m => ({ default: m.MelodyShaperSim })));
const SongStructureSim  = lazy(() => import("./SongStructureSim").then(m => ({ default: m.SongStructureSim })));
const SubtractiveSynthSim = lazy(() => import("./SubtractiveSynthSim").then(m => ({ default: m.SubtractiveSynthSim })));
const BeatmatchTrainerSim = lazy(() => import("./BeatmatchTrainerSim").then(m => ({ default: m.BeatmatchTrainerSim })));
const HotCueDrillSim    = lazy(() => import("./HotCueDrillSim").then(m => ({ default: m.HotCueDrillSim })));
const LoopRollSim       = lazy(() => import("./LoopRollSim").then(m => ({ default: m.LoopRollSim })));
const HarmonicMixWheelSim = lazy(() => import("./HarmonicMixWheelSim").then(m => ({ default: m.HarmonicMixWheelSim })));
const OscillatorMixerSim = lazy(() => import("./OscillatorMixerSim").then(m => ({ default: m.OscillatorMixerSim })));
const FilterEnvelopeSim = lazy(() => import("./FilterEnvelopeSim").then(m => ({ default: m.FilterEnvelopeSim })));
const LFOLabSim         = lazy(() => import("./LFOLabSim").then(m => ({ default: m.LFOLabSim })));

// ─── NEW SIMS (Duolingo rebuild) ──────────────────────────────────────────────
const WaveformVisualizerSim = lazy(() => import("./WaveformVisualizerSim").then(m => ({ default: m.WaveformVisualizerSim })));
const DecibelMeterSim       = lazy(() => import("./DecibelMeterSim").then(m => ({ default: m.DecibelMeterSim })));
const ChordProgressionSim   = lazy(() => import("./ChordProgressionSim").then(m => ({ default: m.ChordProgressionSim })));
const SignalFlowBuilderSim  = lazy(() => import("./SignalFlowBuilderSim").then(m => ({ default: m.SignalFlowBuilderSim })));

// ─── ADVANCED SIMS (chapter 5+, tier:"deep") ─────────────────────────────────
const GranularSim       = lazy(() => import("./GranularSim").then(m => ({ default: m.GranularSim })));
const StemSplitterSim   = lazy(() => import("./StemSplitterSim").then(m => ({ default: m.StemSplitterSim })));
const MidiTransformSim  = lazy(() => import("./MidiTransformSim").then(m => ({ default: m.MidiTransformSim })));
const ScaleAwareSim     = lazy(() => import("./ScaleAwareSim").then(m => ({ default: m.ScaleAwareSim })));
const Push3Sim          = lazy(() => import("./Push3Sim").then(m => ({ default: m.Push3Sim })));

function SimSkeleton() {
  return (
    <div className="brutal-border bg-bone p-6 space-y-3 animate-pulse">
      <div className="h-8 w-48 bg-ink/10 brutal-border" />
      <div className="grid grid-cols-4 gap-1">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="h-10 brutal-border bg-ink/10" />
        ))}
      </div>
    </div>
  );
}

class SimErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("[Sim]", error, info); }
  render() {
    if (this.state.error) {
      return (
        <div className="brutal-border bg-hot text-bone p-6 space-y-3">
          <div className="font-display text-2xl">SIMULATOR CRASHED</div>
          <div className="font-mono text-xs opacity-80">{(this.state.error as Error).message}</div>
          <button onClick={() => this.setState({ error: null })}
            className="brutal-border bg-bone text-ink px-4 py-2 font-mono uppercase brutal-press">
            ↺ Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function SimInner({ type, preset }: { type: SimType; preset?: Record<string, unknown> }) {
  switch (type) {
    case "drum-pad":            return <DrumPadSim />;
    case "piano-roll":          return <PianoRollSim />;
    case "mixer":               return <MixerSim />;
    case "device-chain":        return <DeviceChainSim />;
    case "warp-lab":            return <WarpLabSim />;
    case "session-grid":        return <SessionGridSim />;
    case "arrangement":         return <ArrangementSim />;
    case "routing-puzzle":      return <RoutingPuzzleSim />;
    case "midi-map":            return <MidiMapSim />;
    case "ear-training":        return <EarTrainingSim preset={preset} />;
    case "interface-tour":      return <InterfaceTourSim />;
    case "browser-tour":        return <BrowserTourSim />;
    case "midi-vs-audio":       return <MidiVsAudioSim />;
    case "device-lab":          return <DeviceLabBySlug slug={(preset?.device as string) || "eq"} />;
    case "sidechain":           return <SidechainSim />;
    case "send-return":         return <SendReturnSim />;
    case "comp-lake":           return <CompLakeSim />;
    case "groove-extractor":    return <GrooveExtractorSim />;
    case "bpm-tap":             return <BPMTapSim />;
    case "beat-builder":        return <BeatBuilderSim />;
    case "note-explorer":       return <NoteExplorerSim />;
    case "chord-stacker":       return <ChordStackerSim />;
    case "bassline-lab":        return <BasslineLabSim />;
    case "melody-shaper":       return <MelodyShaperSim />;
    case "song-structure":      return <SongStructureSim />;
    case "subtractive-synth":   return <SubtractiveSynthSim />;
    case "beatmatch-trainer":   return <BeatmatchTrainerSim />;
    case "hot-cue-drill":       return <HotCueDrillSim />;
    case "loop-roll":           return <LoopRollSim />;
    case "harmonic-mix-wheel":  return <HarmonicMixWheelSim />;
    case "osc-mixer":           return <OscillatorMixerSim />;
    case "filter-envelope":     return <FilterEnvelopeSim />;
    case "lfo-lab":             return <LFOLabSim />;
    // NEW sims
    case "waveform-visualizer": return <WaveformVisualizerSim />;
    case "decibel-meter":       return <DecibelMeterSim />;
    case "chord-progression":   return <ChordProgressionSim />;
    case "signal-flow-builder": return <SignalFlowBuilderSim />;
    // ADVANCED (chapter 5+)
    case "granular":            return <GranularSim />;
    case "stem-splitter":       return <StemSplitterSim />;
    case "midi-transform":      return <MidiTransformSim />;
    case "scale-aware":         return <ScaleAwareSim />;
    case "push3":               return <Push3Sim />;
    case "none":
    default:
      return (
        <div className="brutal-border bg-bone p-6 font-mono text-xs uppercase">
          No simulator for this screen — read &amp; quiz only.
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
