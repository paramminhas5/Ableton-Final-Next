/**
 * The "hear the difference" clips: the same phrases rendered through the engine before and after
 * engine 2 (engine/src/bin/ab_clips.rs), loudness-matched to -30 dB RMS so level never decides it.
 * `changed` names what engine 2 did to that sound, in plain words; empty means nothing yet.
 */
export type AbClip = { id: string; name: string; what: string; changed: string[] };

export const AB_CLIPS: AbClip[] = [
  { id: "hats", name: "hats", what: "closed hats on sixteenths, open on the offbeat", changed: ["built from the measured 808 circuit: six square oscillators and two band-passes, no noise"] },
  { id: "kit", name: "the kit", what: "kick, clap and hats, some drive on the kick", changed: ["808 hats", "anti-aliased drive on the kick"] },
  { id: "lead", name: "lead", what: "a detuned lead, held then played", changed: ["JP-8000 supersaw: six side saws on the measured detune curve", "free-running oscillators, so no two notes start the same"] },
  { id: "pad", name: "pad", what: "a chord pad, slow attack, octave voicing", changed: ["voice cards: every voice slightly different, like a real polysynth", "JP-8000 supersaw spread", "free-running oscillators"] },
  { id: "drive", name: "drive", what: "the bass with the drive up", changed: ["anti-aliased drive: harmonics, not fizz"] },
  { id: "sketch", name: "the whole song", what: "four bars, everything together", changed: ["all of the above"] },
  { id: "echo", name: "echo", what: "one lead note into the echo", changed: ["the supersaw lead"] },
  { id: "kick", name: "kick", what: "the kick, four to the bar", changed: [] },
  { id: "snare", name: "snare", what: "the snare on 2 and 4", changed: [] },
  { id: "clap", name: "clap", what: "the clap on 2 and 4", changed: [] },
  { id: "bass", name: "bass", what: "a rolling bass with the filter envelope working", changed: [] },
  { id: "reverb", name: "reverb", what: "one clap into the reverb", changed: [] },
];

export const abUrl = (set: "before" | "after", id: string) => `/audio/ab/${set}/${id}.flac`;
