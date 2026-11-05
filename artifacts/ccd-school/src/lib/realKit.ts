/**
 * The recorded kit (public/audio/real, cleared for CCD School): a sampler layer that plays your drum
 * pattern with real kick, clap, hat and snare recordings. Slots 0 to 3; the sampler plays slot n on note 36 + n.
 */
import { decodeFile, putSample } from "./samples";
import { newLayerV2, type LayerV2, type NoteEvent, type TrackV2 } from "./track2";

export const REAL_KIT_ID = "real-kit";
const FILES = ["kick", "clap", "hat", "snare"] as const;
/** Synth drum note to recorded slot: kick, clap, closed and open hat, snare. */
const MAP: Record<number, number> = { 36: 0, 39: 1, 42: 2, 46: 2, 38: 3 };

let loading: Promise<boolean> | null = null;
/** Load the four recordings into this browser's sample store once. */
export function loadRealKit(): Promise<boolean> {
  loading ??= (async () => {
    try {
      for (let i = 0; i < FILES.length; i++) {
        const r = await fetch(`/audio/real/${FILES[i]}.wav`);
        if (!r.ok) return false;
        await putSample(REAL_KIT_ID, i, await decodeFile(await r.blob()));
      }
      return true;
    } catch {
      return false;
    }
  })();
  return loading;
}

/** A sampler layer playing your drums and hats on the recorded kit. */
export function realKitLayer(t: TrackV2): LayerV2 {
  const evs: NoteEvent[] = [];
  for (const l of t.layers) {
    if ((l.type !== "drums" && l.type !== "hats") || l.id.startsWith("__")) continue;
    for (const e of l.events) { const s = MAP[e.note]; if (s !== undefined) evs.push({ ...e, note: 36 + s }); }
  }
  const layer = newLayerV2("sample", "real-drums");
  return { ...layer, id: REAL_KIT_ID, events: evs.sort((a, b) => a.start - b.start), samples: { 0: "kick", 1: "clap", 2: "hat", 3: "snare" } };
}

/** Your song with the recorded kit in place of the synth drums (the synth layers are muted, not deleted). */
export function withRealKit(t: TrackV2): TrackV2 {
  const rest = t.layers.filter(l => l.id !== REAL_KIT_ID).map(l => (l.type === "drums" || l.type === "hats" ? { ...l, mute: true } : l));
  return { ...t, layers: [...rest, realKitLayer(t)].slice(0, 8) };
}
export function withSynthKit(t: TrackV2): TrackV2 {
  return { ...t, layers: t.layers.filter(l => l.id !== REAL_KIT_ID).map(l => (l.type === "drums" || l.type === "hats" ? { ...l, mute: false } : l)) };
}
