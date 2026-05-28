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

export const SIM_LIST: { type: SimType; label: string; color: string }[] = [
  { type: "drum-pad",            label: "Drum Pad",            color: "bg-acid text-ink" },
  { type: "piano-roll",          label: "Piano Roll",          color: "bg-volt text-bone" },
  { type: "mixer",               label: "Mixer",               color: "bg-sun text-ink" },
  { type: "device-chain",        label: "Device Chain",        color: "bg-acid text-ink" },
  { type: "warp-lab",            label: "Warp Lab",            color: "bg-volt text-bone" },
  { type: "session-grid",        label: "Session Grid",        color: "bg-sun text-ink" },
  { type: "arrangement",         label: "Arrangement",         color: "bg-acid text-ink" },
  { type: "routing-puzzle",      label: "Routing Puzzle",      color: "bg-volt text-bone" },
  { type: "midi-map",            label: "MIDI Map",            color: "bg-sun text-ink" },
  { type: "ear-training",        label: "Ear Training",        color: "bg-acid text-ink" },
  { type: "interface-tour",      label: "Interface Tour",      color: "bg-volt text-bone" },
  { type: "browser-tour",        label: "Browser Tour",        color: "bg-sun text-ink" },
  { type: "midi-vs-audio",       label: "MIDI vs Audio",       color: "bg-acid text-ink" },
  { type: "device-lab",          label: "Device Lab",          color: "bg-volt text-bone" },
  { type: "sidechain",           label: "Sidechain",           color: "bg-sun text-ink" },
  { type: "send-return",         label: "Send & Return",       color: "bg-acid text-ink" },
  { type: "comp-lake",           label: "Comp Lake",           color: "bg-volt text-bone" },
  { type: "groove-extractor",    label: "Groove Extractor",    color: "bg-sun text-ink" },
  { type: "bpm-tap",             label: "BPM Tap",             color: "bg-acid text-ink" },
  { type: "beat-builder",        label: "Beat Builder",        color: "bg-volt text-bone" },
  { type: "note-explorer",       label: "Note Explorer",       color: "bg-sun text-ink" },
  { type: "chord-stacker",       label: "Chord Stacker",       color: "bg-acid text-ink" },
  { type: "bassline-lab",        label: "Bassline Lab",        color: "bg-volt text-bone" },
  { type: "melody-shaper",       label: "Melody Shaper",       color: "bg-sun text-ink" },
  { type: "song-structure",      label: "Song Structure",      color: "bg-acid text-ink" },
  { type: "subtractive-synth",   label: "Subtractive Synth",   color: "bg-volt text-bone" },
  { type: "beatmatch-trainer",   label: "Beatmatch Trainer",   color: "bg-sun text-ink" },
  { type: "hot-cue-drill",       label: "Hot Cue Drill",       color: "bg-acid text-ink" },
  { type: "loop-roll",           label: "Loop Roll",           color: "bg-volt text-bone" },
  { type: "harmonic-mix-wheel",  label: "Harmonic Mix Wheel",  color: "bg-sun text-ink" },
  { type: "osc-mixer",           label: "Osc Mixer",           color: "bg-acid text-ink" },
  { type: "filter-envelope",     label: "Filter Envelope",     color: "bg-volt text-bone" },
  { type: "lfo-lab",             label: "LFO Lab",             color: "bg-sun text-ink" },
  { type: "waveform-visualizer", label: "Waveform Visualizer", color: "bg-acid text-ink" },
  { type: "decibel-meter",       label: "Decibel Meter",       color: "bg-volt text-bone" },
  { type: "chord-progression",   label: "Chord Progression",   color: "bg-sun text-ink" },
  { type: "signal-flow-builder", label: "Signal Flow Builder", color: "bg-acid text-ink" },
  { type: "granular",            label: "Granular",            color: "bg-volt text-bone" },
  { type: "stem-splitter",       label: "Stem Splitter",       color: "bg-sun text-ink" },
  { type: "midi-transform",      label: "MIDI Transform",      color: "bg-acid text-ink" },
  { type: "scale-aware",         label: "Scale Aware",         color: "bg-volt text-bone" },
  { type: "push3",               label: "Push 3",              color: "bg-sun text-ink" },
];

export function Simulator({ type, preset }: { type: SimType; preset?: Record<string, unknown> }) {
  return (
    <SimErrorBoundary>
      <Suspense fallback={<SimSkeleton />}>
        <SimInner type={type} preset={preset} />
      </Suspense>
    </SimErrorBoundary>
  );
}
