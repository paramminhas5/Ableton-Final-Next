/**
 * Registry of the clips a `hear` step can name. Rendering happens elsewhere (engine offline render);
 * this is only the id, label and musical shape of each clip.
 */
export type ClipDef = { id: string; title: string; bars: number; bpm: number; description: string };

export const CLIPS: readonly ClipDef[] = [
  { id: "kick-alone", title: "kick alone", bars: 2, bpm: 120, description: "A single kick on every beat, nothing else." },
  { id: "kick-and-clap", title: "kick and clap", bars: 2, bpm: 120, description: "Kick on every beat with a clap on 2 and 4." },
  { id: "four-on-the-floor", title: "four on the floor", bars: 4, bpm: 124, description: "Kick on every beat, clap on 2 and 4, closed hats on the eighths." },
  { id: "short-vs-long-kick", title: "short vs long kick", bars: 2, bpm: 120, description: "The same kick pattern first with a short decay, then with a long one." },
  { id: "hats-offbeat", title: "hats on the offbeat", bars: 2, bpm: 124, description: "Open hats between the kicks, the lift that makes a groove bounce." },
];

export const CLIP_IDS: ReadonlySet<string> = new Set(CLIPS.map((c) => c.id));
