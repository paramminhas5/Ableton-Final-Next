/* The listening clips in lesson files, built as small tracks that play on our own engine. Pure. */
import { DRUM_PAD_NOTES, DRUM_PAD_PARAMS, INSTRUMENT_BASE, LEAD_PARAMS } from "../../engine/params.gen";
const LEAD = (key: string) => LEAD_PARAMS.find(p => p.key === key)!.index;
import { emptyTrackV2, newLayerV2, type NoteEvent, type TrackV2 } from "../../lib/track2";

const PAD = (name: "kick" | "clap" | "closed" | "open") => ({ kick: 0, clap: 2, closed: 4, open: 5 })[name];
const NOTE = (name: "kick" | "clap" | "closed" | "open") => DRUM_PAD_NOTES[PAD(name)];
const decayIndex = (pad: number) => INSTRUMENT_BASE + pad * DRUM_PAD_PARAMS.length + DRUM_PAD_PARAMS.findIndex(p => p.key === "decay");

const hits = (note: number, beats: number[], vel = 0.9, len = 0.2): NoteEvent[] => beats.map(start => ({ note, vel, start, len }));
const every = (from: number, to: number, step: number, offset = 0) => { const out: number[] = []; for (let b = from + offset; b < to; b += step) out.push(b); return out; };

export type ClipVariant = { label: string; track: TrackV2 };

function base(bpm: number, bars: number): TrackV2 {
  return { ...emptyTrackV2(), bpm, loop: bars * 4 };
}

/** One or more playable versions of a clip. Most have one; short-vs-long has two. */
export function clipVariants(id: string): ClipVariant[] {
  switch (id) {
    case "kick-alone": {
      const t = base(120, 2);
      const l = newLayerV2("drums"); l.events = hits(NOTE("kick"), every(0, 8, 1));
      return [{ label: "kick", track: { ...t, layers: [l] } }];
    }
    case "kick-and-clap": {
      const t = base(120, 2);
      const l = newLayerV2("drums"); l.events = [...hits(NOTE("kick"), every(0, 8, 1)), ...hits(NOTE("clap"), every(0, 8, 2, 1), 0.8)];
      return [{ label: "kick and clap", track: { ...t, layers: [l] } }];
    }
    case "four-on-the-floor": {
      const t = base(124, 4);
      const d = newLayerV2("drums"); d.events = [...hits(NOTE("kick"), every(0, 16, 1)), ...hits(NOTE("clap"), every(0, 16, 2, 1), 0.8)];
      const h = newLayerV2("hats"); h.pad = PAD("closed"); h.events = hits(NOTE("closed"), every(0, 16, 0.5, 0.5).filter((_, i) => i % 2 === 0), 0.6, 0.1);
      return [{ label: "the full groove", track: { ...t, layers: [d, h] } }];
    }
    case "short-vs-long-kick": {
      const mk = (decay: number): TrackV2 => {
        const t = base(120, 2);
        const l = newLayerV2("drums"); l.events = hits(NOTE("kick"), every(0, 8, 1)); l.params = { [decayIndex(PAD("kick"))]: decay };
        return { ...t, layers: [l] };
      };
      return [{ label: "short", track: mk(0.12) }, { label: "long", track: mk(0.9) }];
    }
    case "hats-offbeat": {
      const t = base(124, 2);
      const d = newLayerV2("drums"); d.events = hits(NOTE("kick"), every(0, 8, 1));
      const h = newLayerV2("hats"); h.pad = PAD("open"); h.events = hits(NOTE("open"), every(0, 8, 1, 0.5), 0.7, 0.2);
      return [{ label: "hats between the kicks", track: { ...t, layers: [d, h] } }];
    }
    case "two-tracks": {
      // Two short grooves at the same tempo, then the two played together in time: a blend.
      const t = base(124, 2);
      const a = newLayerV2("drums"); a.events = [...hits(NOTE("kick"), every(0, 8, 1)), ...hits(NOTE("clap"), every(0, 8, 2, 1), 0.8)];
      const b = newLayerV2("hats"); b.pad = PAD("open"); b.events = hits(NOTE("open"), every(0, 8, 1, 0.5), 0.7, 0.2);
      const bk = newLayerV2("drums"); bk.events = hits(NOTE("kick"), every(0, 8, 1));
      return [
        { label: "track a", track: { ...t, layers: [a] } },
        { label: "track b", track: { ...t, layers: [bk, b] } },
        { label: "both, in time", track: { ...t, layers: [a, b] } },
      ];
    }
    case "synth-note":
    case "synth-pitch":
    case "synth-shapes":
    case "synth-loud": {
      // The lead synth with one oscillator and no detune, so the shape you hear is the shape you see.
      const tone = (note: number, wave: number, cutoff: number, vel = 0.85): TrackV2 => {
        const t = base(120, 2);
        const l = newLayerV2("lead");
        l.events = [0, 4].map(start => ({ note, vel, start, len: 3 }));
        l.params = { [LEAD("wave")]: wave, [LEAD("cutoff")]: cutoff, [LEAD("detune")]: 0, [LEAD("env")]: 0, [LEAD("release")]: 0.25 };
        return { ...t, layers: [l] };
      };
      if (id === "synth-note") return [{ label: "one note", track: tone(57, 0, 0.18) }];
      if (id === "synth-loud") return [{ label: "quiet", track: tone(57, 0, 0.18, 0.25) }, { label: "loud", track: tone(57, 0, 0.18, 1) }];
      if (id === "synth-pitch") return [{ label: "low", track: tone(45, 0, 0.18) }, { label: "high", track: tone(69, 0, 0.18) }];
      return [{ label: "soft", track: tone(57, 0, 0.18) }, { label: "saw", track: tone(57, 0, 0.9) }, { label: "square", track: tone(57, 1, 0.9) }];
    }
    default:
      return [];
  }
}
