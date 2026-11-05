/**
 * The "hear the difference" clips: the same phrases rendered through the engine before and after
 * engine 2 (engine/src/bin/ab_clips.rs), loudness-matched to -30 dB RMS so level never decides it.
 * Only clips that engine 2 has changed are listed; `listen` says what to listen for, in plain words.
 * When a later engine item changes a sound, its clip comes back into this list.
 */
/** `afterOnly`: a sound the old engine could not make at all, so there is no "then" to play. */
export type AbClip = { id: string; name: string; what: string; listen: string; afterOnly?: boolean };

export const AB_CLIPS: AbClip[] = [
  { id: "kick", name: "kick", what: "the kick, four to the bar", listen: "a sharper punch at the very start of each kick, the body holds for a moment before it falls, and the low note sighs down and rings out under the next beat instead of fading away." },
  { id: "kicks", name: "kick bodies", what: "the kick's three bodies, two hits each: round, tight, hard", listen: "before, all six hits are the same kick. after, the first two are the round 808 body, the next two are rounded off and quicker, and the last two are clipped hard, so the kick can sit soft under a song or cut through it." },
  { id: "snares", name: "snare layers", what: "one snare three ways: fat body, tight snap, long rattle", listen: "before, six identical snares. after, every snare is a body and a snap you can set apart: first a fat body that drops in pitch, then a short bright snap, then a long rattle of wires." },
  { id: "perc", name: "metal percussion", what: "a bell and a metal bar over hats", listen: "before, a blip and a woodblock over hats that never change. after, a cowbell built from two of the cymbal's square waves, a struck metal bar with its out-of-tune overtones, and hats that differ a little on every hit, like a hand playing them." },
  { id: "hats", name: "hats", what: "closed and open hats", listen: "before is hiss. after is metal: cymbals built from six tuned square waves, the method described in the published analysis of the 808 circuit." },
  { id: "pad", name: "chord pad", what: "a slow chord pad", listen: "every voice is now slightly different from the next, so the chord moves and breathes instead of sitting still." },
  { id: "lead", name: "lead", what: "a held note, then a short phrase", listen: "the wide, shimmering stack of the classic trance supersaw, and no two notes start exactly the same." },
  { id: "scream", name: "scream filter", what: "the rolling bass through the new scream filter, driven", listen: "before is the one filter the old engine had. after, the same line through a 2-pole filter in the style of the ms-20: it keeps its low end as the resonance rises and snarls on the filter envelope's peaks." },
  { id: "smooth", name: "smooth filter", what: "the rolling bass through the new smooth filter", listen: "before is the old filter. after, a 2-pole state-variable filter in the style of the oberheim sem: rounder and sweeter, the resonance sings without thinning the bass." },
  { id: "reverb", name: "hall", what: "one clap into the hall reverb", listen: "the tail no longer rings on one pitch: every path through the hall drifts slowly, so it stays smooth all the way down, and the top dies away before the body." },
  { id: "plate", name: "plate", what: "one clap into the new plate reverb", listen: "before is the old hall, the only reverb the old engine had. after, a plate built to jon dattorro's published design: brighter and denser from the first instant, wide, and the classic sound on snares and vocals." },
  { id: "echo", name: "tape echo", what: "one lead note into the echo", listen: "the repeats now sound like tape: each one a little darker and rounder than the last, the pitch wavering very slightly as the tape speed would, more on longer delays. while you play into it, the repeats step back; in the gaps they come forward." },
  { id: "drive", name: "driven bass", what: "a bass with the drive turned up", listen: "the grit is warmer and cleaner. the harsh fizz on top is gone." },
  { id: "kit", name: "the kit", what: "kick, clap and hats with some drive", listen: "metal hats, a punchier kick and a cleaner, warmer drive on it." },
  { id: "pluck", name: "plucked strings", what: "an arpeggio on the new resonator voice", listen: "new: there was no way to make this before. a burst of noise rings a tuned delay line, the way a string rings after a pluck: low notes ring longer, and every note is in tune to within a cent.", afterOnly: true },
  { id: "mallet", name: "mallet", what: "a marimba line on the two-resonator voice", listen: "new: two resonators, the bar and its overtone four times up, struck together. the overtone dies first, which is what makes a marimba sound wooden and round.", afterOnly: true },
  { id: "keys", name: "keys", what: "chords on the struck-string voice", listen: "new: a soft hammer on two strings tuned a hair apart, so each note beats slowly as it fades, the way a piano's paired strings do.", afterOnly: true },
  { id: "glued", name: "glued song", what: "the whole song with the bus compressor pushed hard", listen: "before, the chords and hats drop in level on every kick and swell back up. after, the compressor listens past the kick's low end, so the song holds together and stays as loud." },
  { id: "sketch", name: "the whole song", what: "four bars with everything playing", listen: "all of it together: wider chords and lead, metal hats, a punchier kick, cleaner grit." },
];

/** Clips with a before and an after (the blind test plays these). */
export const AB_PAIRS = (): AbClip[] => AB_CLIPS.filter(c => !c.afterOnly);

export const abUrl = (set: "before" | "after", id: string) => `/audio/ab/${set}/${id}.flac`;
