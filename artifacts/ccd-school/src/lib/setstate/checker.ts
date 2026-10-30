import type { SetState, Track } from "./types";

/** A single thing a mission looks for in a Set. Pure data so specs can live in a database later. */
export type Check =
  | { type: "namedTracks"; min?: number } // tracks renamed from Live's defaults
  | { type: "device"; classNames: string[]; on?: "any" | "return" | "group" | "midi" | "audio" | "master"; min?: number }
  | { type: "sidechain"; min?: number }
  | { type: "groupWithChildren"; minChildren: number }
  | { type: "sendUsed"; min?: number }
  | { type: "tempo"; min: number; max: number; not?: number }
  | { type: "midiNotes"; min: number }
  /** a track holding one of these devices that also has at least minNotes MIDI notes */
  | { type: "trackWith"; classNames: string[]; minNotes: number }
  /** this many MIDI tracks that have notes in them */
  | { type: "midiTracksWithNotes"; min: number }
  /** arrangement view length: end of the last arrangement clip, in beats */
  | { type: "arrangementBeats"; min: number };

export interface CheckSpec {
  id: string;
  label: string;
  hint: string;
  check: Check;
}

export interface MissionSpec {
  id: string;
  title: string;
  why: string;
  checks: CheckSpec[];
}

export interface CheckResult {
  id: string;
  label: string;
  pass: boolean;
  /** what was found, in plain words */
  found: string;
  /** shown only when the check fails */
  hint: string;
}

export interface MissionResult {
  id: string;
  title: string;
  passed: boolean;
  checks: CheckResult[];
}

const DEFAULT_NAME = /^(\d+[-\s])?(midi|audio)(\s*\d+)?$/i;

const noteCount = (t: Track) => t.clips.reduce((a, cl) => a + (cl.notes?.length ?? 0), 0);
const allTracks = (s: SetState) => [...s.tracks, ...s.returns];

function runCheck(c: Check, s: SetState): { pass: boolean; found: string } {
  switch (c.type) {
    case "namedTracks": {
      const named = s.tracks.filter((t) => t.name.trim() && !DEFAULT_NAME.test(t.name.trim()));
      const need = c.min ?? Math.max(1, s.tracks.length);
      return { pass: s.tracks.length > 0 && named.length >= need, found: `${named.length} of ${s.tracks.length} tracks have your own name` };
    }
    case "device": {
      const pool: Track[] =
        c.on === "return" ? s.returns
        : c.on === "group" ? s.tracks.filter((t) => t.kind === "group")
        : c.on === "midi" ? s.tracks.filter((t) => t.kind === "midi")
        : c.on === "audio" ? s.tracks.filter((t) => t.kind === "audio")
        : c.on === "master" ? [s.master]
        : allTracks(s);
      const n = pool.reduce((a, t) => a + t.devices.filter((d) => c.classNames.includes(d.className)).length, 0);
      return { pass: n >= (c.min ?? 1), found: n ? `${n} found` : "none found" };
    }
    case "sidechain": {
      const n = allTracks(s).reduce((a, t) => a + t.routing.sidechainSources.length, 0);
      return { pass: n >= (c.min ?? 1), found: n ? `${n} sidechained compressor${n > 1 ? "s" : ""}` : "no sidechain routing" };
    }
    case "groupWithChildren": {
      const best = s.tracks
        .filter((t) => t.kind === "group")
        .reduce((m, g) => Math.max(m, s.tracks.filter((t) => t.groupId === g.id).length), 0);
      return { pass: best >= c.minChildren, found: best ? `largest group holds ${best} tracks` : "no group tracks" };
    }
    case "sendUsed": {
      const n = s.tracks.filter((t) => t.mixer.sendsDb.some((d) => d > -60)).length;
      return { pass: n >= (c.min ?? 1), found: n ? `${n} track${n > 1 ? "s" : ""} sending to a return` : "all sends are off" };
    }
    case "tempo": {
      const bpm = Math.round(s.tempo * 10) / 10;
      return { pass: s.tempo >= c.min && s.tempo <= c.max && (c.not === undefined || Math.round(s.tempo) !== c.not), found: `${bpm} BPM` };
    }
    case "trackWith": {
      const n = s.tracks.filter(
        (t) => t.devices.some((d) => c.classNames.includes(d.className)) && noteCount(t) >= c.minNotes,
      ).length;
      return { pass: n > 0, found: n ? "found" : "no track with that device and enough notes" };
    }
    case "midiTracksWithNotes": {
      const n = s.tracks.filter((t) => t.kind === "midi" && noteCount(t) > 0).length;
      return { pass: n >= c.min, found: `${n} MIDI track${n === 1 ? "" : "s"} with notes` };
    }
    case "arrangementBeats": {
      const end = s.tracks.reduce(
        (m, t) => t.clips.reduce((b, cl) => (cl.view === "arrangement" ? Math.max(b, (cl.startBeat ?? 0) + cl.lengthBeats) : b), m),
        0,
      );
      const bars = Math.floor(end / s.timeSignature[0]);
      return { pass: end >= c.min, found: end ? `arrangement runs ${bars} bars` : "nothing in the arrangement yet" };
    }
    case "midiNotes": {
      const n = s.tracks.reduce((a, t) => a + t.clips.reduce((b, cl) => b + (cl.notes?.length ?? 0), 0), 0);
      return { pass: n >= c.min, found: `${n} notes` };
    }
  }
}

export function checkMission(spec: MissionSpec, s: SetState): MissionResult {
  const checks = spec.checks.map((cs) => {
    const r = runCheck(cs.check, s);
    return { id: cs.id, label: cs.label, pass: r.pass, found: r.found, hint: r.pass ? "" : cs.hint };
  });
  return { id: spec.id, title: spec.title, passed: checks.every((c) => c.pass), checks };
}

export const checkMissions = (specs: MissionSpec[], s: SetState) => specs.map((m) => checkMission(m, s));
