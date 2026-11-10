/**
 * Registry of the clips a `hear` step can name. Rendering happens elsewhere (engine offline render);
 * this is only the id, label and musical shape of each clip.
 */
export type ClipDef = { id: string; title: string; bars: number; bpm: number; description: string };

export const CLIPS: readonly ClipDef[] = [
  { id: "click", title: "the click", bars: 2, bpm: 120, description: "The metronome alone: a higher click on beat one of each bar, a lower one on two, three and four." },
  { id: "kick-alone", title: "kick alone", bars: 2, bpm: 120, description: "A single kick on every beat, nothing else." },
  { id: "kick-and-clap", title: "kick and clap", bars: 2, bpm: 120, description: "Kick on every beat with a clap on 2 and 4." },
  { id: "four-on-the-floor", title: "four on the floor", bars: 4, bpm: 124, description: "Kick on every beat, clap on 2 and 4, closed hats on the eighths." },
  { id: "short-vs-long-kick", title: "short vs long kick", bars: 2, bpm: 120, description: "The same kick pattern first with a short decay, then with a long one." },
  { id: "two-tracks", title: "two tracks, one beat", bars: 2, bpm: 124, description: "Two grooves at the same tempo, then both together in time." },
  { id: "synth-note", title: "one synth note", bars: 2, bpm: 120, description: "A soft synth note held for most of each bar." },
  { id: "synth-pitch", title: "low and high", bars: 2, bpm: 120, description: "The same soft synth note, low then high." },
  { id: "synth-loud", title: "quiet and loud", bars: 2, bpm: 120, description: "The same soft note, quiet then loud." },
  { id: "octave", title: "a, then a an octave up", bars: 2, bpm: 120, description: "The note a at 220 hz, then the a above it at 440 hz, twice the speed." },
  { id: "synth-shapes", title: "three wave shapes", bars: 2, bpm: 120, description: "The same note as a soft wave, a saw and a square." },
  { id: "subdivisions", title: "quarters, eighths, sixteenths", bars: 2, bpm: 120, description: "A kick on every beat with closed hats on the beats, then the eighths, then the sixteenths." },
  { id: "straight-vs-swung", title: "straight and swung", bars: 2, bpm: 120, description: "Kick, clap and sixteenth hats, played straight, then swung." },
  { id: "hats-offbeat", title: "hats on the offbeat", bars: 2, bpm: 124, description: "Open hats between the kicks, the lift that makes a groove bounce." },
];

export const CLIP_IDS: ReadonlySet<string> = new Set(CLIPS.map((c) => c.id));
