/**
 * Punch-in effects (the EP-133's punch-in fx, Push 3's XY punch-in effects, djay's crossfader fx): what each
 * key does and how its amount reads. The sound is the engine's (engine/src/punch.rs); these are the same
 * formulas, for the screen. Tested in tests/punch.test.ts.
 */
import { PUNCH } from "@/engine/params.gen";

export type PunchKey = "repeat" | "filter" | "tapeStop" | "throw";
/** In the order the keys sit, with the names most tools give them. */
export const PUNCH_KEYS: { key: PunchKey; mode: number; label: string; hint: string }[] = [
  { key: "repeat", mode: PUNCH.repeat, label: "beat repeat", hint: "higher is faster" },
  { key: "filter", mode: PUNCH.filter, label: "filter", hint: "low pass below, high pass above" },
  { key: "tapeStop", mode: PUNCH.tapeStop, label: "tape stop", hint: "higher is slower" },
  { key: "throw", mode: PUNCH.throw, label: "reverb throw", hint: "higher is more" },
];

/** Beat repeat length in beats: a quarter note at the bottom of the key, a 32nd at the top. */
export function repeatBeats(amount: number): number {
  const i = Math.min(3, Math.floor(Math.min(1, Math.max(0, amount)) * 4));
  return [1, 0.5, 0.25, 0.125][i];
}
/** Tape stop time in seconds. */
export const tapeSeconds = (amount: number) => 0.15 + Math.min(1, Math.max(0, amount)) * 1.85;
/** The filter's cutoff in hz and whether it is a high pass. */
export function filterAt(amount: number): { hz: number; hp: boolean } {
  const a = Math.min(1, Math.max(0, amount));
  return a < 0.5 ? { hz: 120 * Math.pow(18000 / 120, a / 0.5), hp: false } : { hz: 20 * Math.pow(4000 / 20, (a - 0.5) / 0.5), hp: true };
}

const hz = (f: number) => (f >= 1000 ? `${(f / 1000).toFixed(1)} khz` : `${Math.round(f)} hz`);
/** What the screen says while a key is held. */
export function punchReadout(key: PunchKey, amount: number): string {
  if (key === "repeat") return `1/${Math.round(4 / repeatBeats(amount))}`;
  if (key === "tapeStop") return `${tapeSeconds(amount).toFixed(1)} s`;
  if (key === "filter") { const f = filterAt(amount); return `${f.hp ? "high" : "low"} pass ${hz(f.hz)}`; }
  return `${Math.round(amount * 100)}%`;
}
