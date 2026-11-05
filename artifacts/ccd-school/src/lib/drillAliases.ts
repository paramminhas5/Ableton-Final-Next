export type DrillType = "interval" | "chord" | "scale" | "note-in-scale" | "eq-cut" | "reverb";

/** Lesson content names its drill loosely ("high-low", "intervals"); map every name to a real drill. */
export const DRILL_ALIASES: Record<string, DrillType> = {
  interval: "interval", intervals: "interval", "high-low": "interval", pitch: "interval",
  chord: "chord", chords: "chord",
  scale: "scale", scales: "scale",
  "note-in-scale": "note-in-scale",
  "eq-cut": "eq-cut", timbre: "eq-cut", eq: "eq-cut",
  reverb: "reverb", loudness: "reverb", space: "reverb",
};
export function drillFor(mode: unknown): DrillType {
  return typeof mode === "string" && DRILL_ALIASES[mode] ? DRILL_ALIASES[mode] : "interval";
}

