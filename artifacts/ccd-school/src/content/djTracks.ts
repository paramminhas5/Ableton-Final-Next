/**
 * Param's dj picks, measured 5 Nov 2026 (bpm by comb fit on the onsets, key by chroma against the
 * Krumhansl profiles, sections from the low-band energy per eight bars: rough, so the cues are named
 * "drums in", "break", "drop" only where the energy says so). Only the numbers live here. The audio stays
 * out of the repo and the public app; see design/dj-bank-private.md for how it reaches a deck once CCD has
 * the rights to stream it.
 */
import type { BankTrack } from "./djBank";

export type RealTrack = BankTrack & { artist: string; title: string; bars: number; cues: { name: string; bar: number }[] };

const pc = (n: string) => ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].indexOf(n);
const real = (id: string, name: string, artist: string, title: string, bpm: number, key: string, camelot: string, style: BankTrack["style"], bars: number, cues: RealTrack["cues"]): RealTrack => {
  const [note, mode] = key.split(" ");
  return { id, name, artist, title, bpm, key: key.toLowerCase(), camelot, root: 36 + pc(note), minor: mode === "minor", style, bars, cues };
};

export const REAL_TRACKS: RealTrack[] = [
  real("aat-like-this", "like this", "aat", "like this", 127.0, "G# minor", "1A", "offbeat", 104, [{ name: "intro", bar: 1 }, { name: "break", bar: 17 }, { name: "drop", bar: 33 }]),
  real("aline-umber-les-mecs-en-chemise-radio-ed", "les mecs en chemise", "aline umber", "les mecs en chemise (radio edit)", 128.0, "G minor", "6A", "rolling", 102, [{ name: "intro", bar: 1 }, { name: "break", bar: 89 }]),
  real("barry-can-t-swim-kimpton", "kimpton", "barry can't swim", "kimpton", 122.0, "E minor", "9A", "bouncy", 116, [{ name: "intro", bar: 1 }, { name: "drums in", bar: 33 }, { name: "break", bar: 49 }, { name: "drop", bar: 73 }]),
  real("barry-can-t-swim-sonder", "sonder", "barry can't swim", "sonder", 128.0, "F minor", "4A", "rolling", 96, [{ name: "intro", bar: 1 }, { name: "drums in", bar: 65 }]),
  real("caribou-odessa", "odessa", "caribou", "odessa", 118.0, "F minor", "4A", "bouncy", 155, [{ name: "intro", bar: 1 }, { name: "drums in", bar: 9 }]),
  real("chez-damier-can-you-feel-it-mk-new-york-", "can you feel it", "chez damier", "can you feel it (mk new york dub extended)", 124.0, "A# minor", "3A", "offbeat", 169, [{ name: "intro", bar: 1 }, { name: "drums in", bar: 17 }, { name: "break", bar: 73 }, { name: "drop", bar: 89 }]),
  real("dj-atlance-liquid-sunshine", "liquid sunshine", "dj atlance", "liquid sunshine", 127.0, "F major", "7B", "offbeat", 177, [{ name: "intro", bar: 1 }, { name: "drums in", bar: 25 }, { name: "break", bar: 81 }, { name: "drop", bar: 113 }]),
  real("franky-rizardo-baile-de-fantome", "baile de fantome", "franky rizardo", "baile de fantome", 128.0, "C# minor", "12A", "rolling", 128, [{ name: "intro", bar: 1 }, { name: "drums in", bar: 9 }, { name: "break", bar: 25 }, { name: "drop", bar: 41 }]),
  real("mf-doom-doomsday", "doomsday", "mf doom", "doomsday", 95.4, "F# major", "2B", "bouncy", 118, [{ name: "intro", bar: 1 }, { name: "break", bar: 97 }, { name: "drop", bar: 105 }]),
  real("sidney-charles-disco-bumpin", "disco bumpin", "sidney charles", "disco bumpin", 130.0, "F# minor", "11A", "rolling", 117, [{ name: "intro", bar: 1 }, { name: "drums in", bar: 9 }, { name: "break", bar: 25 }, { name: "drop", bar: 33 }]),
  real("cap", "cap", "", "cap", 130.0, "F# minor", "11A", "rolling", 108, [{ name: "intro", bar: 1 }, { name: "drums in", bar: 17 }, { name: "break", bar: 57 }, { name: "drop", bar: 89 }]),
  real("barry-can-t-swim-all-my-friends", "all my friends", "barry can't swim", "all my friends", 120.0, "C# major", "3B", "bouncy", 100, [{ name: "intro", bar: 1 }, { name: "drums in", bar: 25 }]),
  real("mainline-magic-orchestra-xumba-xumba-ede", "xumba xumba", "mainline magic orchestra", "xumba xumba (eden burns remix)", 126.0, "G major", "9B", "offbeat", 157, [{ name: "intro", bar: 1 }, { name: "drums in", bar: 65 }]),
];
