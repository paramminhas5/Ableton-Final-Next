import type { SetState } from "./types";

/** What the browser needs to show. No notes, no file paths, nothing from the Set that is not displayed. */
export function summarizeSet(s: SetState) {
  const row = (t: SetState["tracks"][number]) => ({
    name: t.name,
    kind: t.kind,
    devices: t.devices.map((d) => d.name),
    clips: t.clips.length,
    notes: t.clips.reduce((a, c) => a + (c.notes?.length ?? 0), 0),
    sidechain: t.routing.sidechainSources,
  });
  return {
    liveVersion: s.liveVersion,
    tempo: Math.round(s.tempo * 10) / 10,
    timeSignature: s.timeSignature,
    scale: s.scale ?? null,
    tracks: s.tracks.map(row),
    returns: s.returns.map(row),
    warnings: s.warnings,
  };
}
