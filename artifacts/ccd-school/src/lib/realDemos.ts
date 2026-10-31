/**
 * Listening demos made from the real recorded sounds in public/audio/real
 * (see CREDITS.md there). Each demo is a schedule function so it can be played
 * live or rendered offline in a test.
 */
import type { RealKit } from "@/lib/gym/render";

export type RealDemoKey = "real-groove" | "real-swing" | "real-hits" | "real-piano" | "ai-claps" | "ai-house";

export const REAL_DEMO_KEYS: RealDemoKey[] = ["real-groove", "real-swing", "real-hits", "real-piano", "ai-claps", "ai-house"];

export const isRealDemo = (k: string | undefined): k is RealDemoKey => !!k && (REAL_DEMO_KEYS as string[]).includes(k);

export const REAL_DEMO_LABELS: Record<RealDemoKey, string> = {
  "real-groove": "HEAR A REAL HOUSE GROOVE",
  "real-swing": "HEAR STRAIGHT, THEN SWUNG",
  "real-hits": "HEAR FOUR DRUM SOUNDS",
  "real-piano": "HEAR A REAL PIANO LOOP",
  "ai-claps": "HEAR TWO CLAPS",
  "ai-house": "HEAR A HOUSE SKETCH",
};

/** Length of each demo in seconds. */
export const REAL_DEMO_SECONDS: Record<RealDemoKey, number> = {
  "real-groove": 4.3,
  "real-swing": 8.5,
  "real-hits": 3.4,
  "real-piano": 3.6,
  "ai-claps": 5.0,
  "ai-house": 18,
};

type Ctx = BaseAudioContext;

function shot(c: Ctx, out: AudioNode, buf: AudioBuffer, t: number, gain: number, maxSeconds?: number) {
  const s = c.createBufferSource();
  s.buffer = buf;
  const g = c.createGain();
  g.gain.value = gain;
  s.connect(g).connect(out);
  s.start(t);
  if (maxSeconds) s.stop(t + maxSeconds);
}

/** Two bars of four-on-the-floor at 120 BPM: kick on every beat, clap on 2 and 4, open hat between the kicks. */
function groove(c: Ctx, out: AudioNode, kit: RealKit, t0: number, bars: number, swing: number) {
  const beat = 60 / 120;
  const eighth = beat / 2;
  for (let b = 0; b < bars; b++) {
    for (let i = 0; i < 4; i++) {
      const t = t0 + (b * 4 + i) * beat;
      shot(c, out, kit.kick, t, 0.5);
      if (i === 1 || i === 3) shot(c, out, kit.clap, t, 0.4);
      shot(c, out, kit.hat, t + eighth + eighth * swing, 0.25, 0.25);
    }
  }
}

/** Schedules a demo on any context. Returns the demo length in seconds. */
export function scheduleRealDemo(key: RealDemoKey, c: Ctx, out: AudioNode, kit: RealKit, t0 = 0): number {
  switch (key) {
    case "real-groove":
      groove(c, out, kit, t0, 2, 0);
      return REAL_DEMO_SECONDS[key];
    case "real-swing":
      // two bars straight, then two bars with the in-between hats pushed late
      groove(c, out, kit, t0, 2, 0);
      groove(c, out, kit, t0 + 4.2, 2, 0.34);
      return REAL_DEMO_SECONDS[key];
    case "real-hits":
      [kit.kick, kit.clap, kit.snare, kit.hat].forEach((b, i) => shot(c, out, b, t0 + i * 0.8, 0.9, 0.7));
      return REAL_DEMO_SECONDS[key];
    case "ai-claps":
    case "ai-house":
      return REAL_DEMO_SECONDS[key]; // scheduled by scheduleAiDemo, which needs its own buffers
    case "real-piano": {
      // the first two bars of the 8-bar loop at 140 BPM
      const two = (60 / 140) * 8;
      shot(c, out, kit.piano, t0, 0.8, two);
      return REAL_DEMO_SECONDS[key];
    }
  }
}

/** AI-generated teaching clips (see public/audio/ai/CREDITS.md). */
export interface AiClips { dry: AudioBuffer; hall: AudioBuffer; house: AudioBuffer }

let aiPromise: Promise<AiClips | null> | null = null;
export function loadAiClips(): Promise<AiClips | null> {
  if (typeof window === "undefined" || typeof OfflineAudioContext === "undefined") return Promise.resolve(null);
  aiPromise ??= (async () => {
    try {
      const dec = new OfflineAudioContext(1, 1, 44100);
      const get = async (f: string) => {
        const r = await fetch(`/audio/ai/${f}`);
        if (!r.ok) throw new Error(f);
        return dec.decodeAudioData(await r.arrayBuffer());
      };
      const [dry, hall, house] = await Promise.all([get("dry-clap.mp3"), get("hall-clap.mp3"), get("house-sketch.mp3")]);
      return { dry, hall, house };
    } catch {
      aiPromise = null;
      return null;
    }
  })();
  return aiPromise;
}

export const isAiDemo = (k: string): boolean => k === "ai-claps" || k === "ai-house";

export function scheduleAiDemo(key: "ai-claps" | "ai-house", c: Ctx, out: AudioNode, clips: AiClips, t0 = 0): number {
  if (key === "ai-house") {
    shot(c, out, clips.house, t0, 0.9);
    return REAL_DEMO_SECONDS[key];
  }
  // first the dry clap, then the same kind of clap in a big hall
  shot(c, out, clips.dry, t0, 0.9);
  shot(c, out, clips.hall, t0 + 1.8, 0.9);
  return REAL_DEMO_SECONDS[key];
}
