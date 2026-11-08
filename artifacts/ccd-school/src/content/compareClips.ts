/**
 * The sound shootout's blind pairs (design/sound-shootout.md): the same notes through an open-source synth
 * and through our engine, loudness-matched to -16 LUFS, made by scripts/shootout/clips.py into
 * public/audio/compare/<id>/{theirs,ours,after}.mp3. Every patch on both sides was written for this test
 * (init patches, no factory presets). `after` means our engine changed this sound in the shootout, so there
 * is a "then" (ours as it was) and a "now". Not linked from anywhere; the page says no word about which is
 * better, and nothing else may until Param has done the blind test.
 */
export type ComparePair = { id: string; name: string; what: string; theirs: string; after: boolean };

export const COMPARE_PAIRS: ComparePair[] = [
  { id: "supersaw-surge", name: "supersaw lead", what: "seven detuned saws, a four-note phrase, theirs and ours (now) at full width", theirs: "surge xt", after: true },
  { id: "supersaw-vital", name: "supersaw lead", what: "seven detuned saws, a four-note phrase, theirs and ours (now) at full width", theirs: "vitalium", after: true },
  { id: "ladder-surge", name: "ladder sweep", what: "a low saw, the 4-pole ladder swept from 100 hz to 8 khz, resonance high", theirs: "surge xt (vintage ladder)", after: true },
  { id: "ladder-vital", name: "ladder sweep", what: "a low saw, the 4-pole ladder swept from 100 hz to 8 khz, resonance high", theirs: "vitalium (ladder)", after: true },
  { id: "ms2-k35", name: "ms2 sweep, driven", what: "the same sweep through the sallen-key 2-pole, resonance middle, driven", theirs: "surge xt (k35, heavy saturation)", after: true },
  { id: "svf-digital", name: "svf sweep", what: "the same sweep through a 2-pole state-variable filter, resonance high", theirs: "vitalium (digital)", after: true },
  { id: "acid-odin", name: "acid bass", what: "a 303-style line at 130 bpm, slides and accents", theirs: "odin 2 (diode ladder)", after: true },
  { id: "ep-dexed", name: "fm electric piano", what: "two chords on a two-operator fm voice, ratio 1", theirs: "dexed", after: true },
  { id: "bell-dexed", name: "fm bell", what: "four high notes on a two-operator fm voice, ratio 4", theirs: "dexed", after: true },
  { id: "pad-vital", name: "wavetable pad", what: "two chords on a saw wavetable, slow attack", theirs: "vitalium", after: true },
  { id: "kick808-geonkick", name: "808 kick", what: "two hits, a long sine body with a falling pitch", theirs: "geonkick", after: false },
  { id: "kicktechno-geonkick", name: "techno kick", what: "two hits, shorter and driven", theirs: "geonkick", after: false },
  { id: "hall-snare", name: "hall on a snare", what: "one snare hit and its hall, 2.4 s", theirs: "dragonfly hall", after: true },
  { id: "hall-chord", name: "hall on a chord", what: "one chord and its hall, 2.4 s", theirs: "dragonfly hall", after: true },
  { id: "plate-snare", name: "plate on a snare", what: "one snare hit and its plate, 2.4 s", theirs: "dragonfly plate", after: true },
  { id: "plate-chord", name: "plate on a chord", what: "one chord and its plate, 2.4 s", theirs: "dragonfly plate", after: true },
  { id: "tape-chow", name: "tape", what: "a chord pushed into tape: wow, flutter and saturation", theirs: "chow tape model", after: true },
];

export type CompareSide = "theirs" | "ours" | "after";
export const compareUrl = (id: string, side: CompareSide) => `/audio/compare/${id}/${side}.mp3`;
