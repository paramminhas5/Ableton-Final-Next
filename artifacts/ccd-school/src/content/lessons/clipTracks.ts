/* The listening clips in lesson files, built as small tracks that play on our own engine. Pure. */
import { DRUM_PAD_NOTES, DRUM_PAD_PARAMS, INSTRUMENT_BASE } from "../../engine/params.gen";
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
    default:
      return [];
  }
}
