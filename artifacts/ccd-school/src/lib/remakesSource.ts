/**
 * Where the remakes screen gets its list: the engine's remakes (src/lib/remakes.ts) in the shape the screen
 * reads. `says` is the remake's blurb, `params` every setting that makes the sound, and `start` where every
 * setting begins (the lit knobs away from the answer, the rest already in place), all by param key.
 */
import { REMAKES as LIST, remakeStart, type Remake as Base } from "./remakes";

export type Remake = Base & { says: string; params: Record<string, number>; begin: Record<string, number> };

export const REMAKES: Remake[] = LIST.map(r => ({ ...r, says: r.blurb, params: r.target, begin: remakeStart(r) }));
