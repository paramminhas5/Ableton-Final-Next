/**
 * The "hear the difference" clips: the same phrases rendered through the engine before and after
 * engine 2 (engine/src/bin/ab_clips.rs), loudness-matched to -30 dB RMS so level never decides it.
 * Only clips that engine 2 has changed are listed; `listen` says what to listen for, in plain words.
 * When a later engine item changes a sound, its clip comes back into this list.
 */
export type AbClip = { id: string; name: string; what: string; listen: string };

export const AB_CLIPS: AbClip[] = [
  { id: "hats", name: "hats", what: "closed and open hats", listen: "before is hiss. after is metal: the shimmer of a real drum machine's cymbals, built the way the 808 builds them." },
  { id: "pad", name: "chord pad", what: "a slow chord pad", listen: "every voice is now slightly different, like a real synth, so the chord moves and breathes instead of sitting still." },
  { id: "lead", name: "lead", what: "a held note, then a short phrase", listen: "the wide, shimmering stack of the classic trance supersaw, and no two notes start exactly the same." },
  { id: "drive", name: "driven bass", what: "a bass with the drive turned up", listen: "the grit is warmer and cleaner. the harsh fizz on top is gone." },
  { id: "kit", name: "the kit", what: "kick, clap and hats with some drive", listen: "metal hats and a cleaner, warmer drive on the kick." },
  { id: "sketch", name: "the whole song", what: "four bars with everything playing", listen: "all of it together: wider chords and lead, metal hats, cleaner grit." },
];

export const abUrl = (set: "before" | "after", id: string) => `/audio/ab/${set}/${id}.flac`;
