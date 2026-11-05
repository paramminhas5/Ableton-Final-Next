/**
 * The "hear the difference" clips: the same phrases rendered through the engine before and after
 * engine 2 (engine/src/bin/ab_clips.rs), loudness-matched to -30 dB RMS so level never decides it.
 * Only clips that engine 2 has changed are listed; `listen` says what to listen for, in plain words.
 * When a later engine item changes a sound, its clip comes back into this list.
 */
export type AbClip = { id: string; name: string; what: string; listen: string };

export const AB_CLIPS: AbClip[] = [
  { id: "kick", name: "kick", what: "the kick, four to the bar", listen: "a sharper punch at the very start of each kick, the body holds for a moment before it falls, and the low note sighs down and rings out under the next beat instead of fading away." },
  { id: "hats", name: "hats", what: "closed and open hats", listen: "before is hiss. after is metal: cymbals built from six tuned square waves, the method described in the published analysis of the 808 circuit." },
  { id: "pad", name: "chord pad", what: "a slow chord pad", listen: "every voice is now slightly different from the next, so the chord moves and breathes instead of sitting still." },
  { id: "lead", name: "lead", what: "a held note, then a short phrase", listen: "the wide, shimmering stack of the classic trance supersaw, and no two notes start exactly the same." },
  { id: "drive", name: "driven bass", what: "a bass with the drive turned up", listen: "the grit is warmer and cleaner. the harsh fizz on top is gone." },
  { id: "kit", name: "the kit", what: "kick, clap and hats with some drive", listen: "metal hats, a punchier kick and a cleaner, warmer drive on it." },
  { id: "glued", name: "glued song", what: "the whole song with the bus compressor pushed hard", listen: "before, the chords and hats drop in level on every kick and swell back up. after, the compressor listens past the kick's low end, so the song holds together and stays as loud." },
  { id: "sketch", name: "the whole song", what: "four bars with everything playing", listen: "all of it together: wider chords and lead, metal hats, a punchier kick, cleaner grit." },
];

export const abUrl = (set: "before" | "after", id: string) => `/audio/ab/${set}/${id}.flac`;
