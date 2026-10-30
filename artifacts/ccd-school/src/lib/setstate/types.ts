/**
 * SetState: one normalised shape for an Ableton Live Set (PRD "Key specs: 1").
 * Produced from an uploaded .als file today; the Extension and companion app
 * will produce the same shape later. The checker only ever sees this type.
 */
export interface SetState {
  source: "extension" | "companion" | "upload";
  liveVersion: string; // e.g. "12.3.2"
  tempo: number;
  timeSignature: [number, number];
  scale?: { root: string; name: string };
  tracks: Track[];
  returns: Track[];
  master: Track;
  /** non-fatal problems found while reading (unknown schema, truncated, limits) */
  warnings: string[];
}

export type TrackKind = "midi" | "audio" | "group" | "return" | "master";

export interface Track {
  id: string;
  name: string;
  kind: TrackKind;
  color?: number;
  /** id of the group track this one sits in, if any */
  groupId?: string;
  devices: Device[];
  clips: Clip[];
  mixer: { volumeDb: number; pan: number; sendsDb: number[]; muted: boolean };
  routing: { input?: string; output?: string; sidechainSources: string[] };
  automation: { param: string; points: number }[];
}

export interface Device {
  name: string; // user-visible name when renamed, else same as className
  /** Live's internal element name, e.g. "DrumGroupDevice", "Compressor2", "Eq8" */
  className: string;
  /** direct numeric parameters (booleans as 0 or 1) */
  params: Record<string, number>;
}

export interface Clip {
  name: string;
  view: "session" | "arrangement";
  kind: "midi" | "audio";
  lengthBeats: number;
  startBeat?: number;
  notes?: { pitch: number; start: number; dur: number; vel: number }[];
  warp?: { mode: string; on: boolean };
}

export interface ParseLimits {
  /** reject archives that expand beyond this many bytes of XML */
  maxXmlBytes: number;
  maxTracks: number;
  maxNotesPerClip: number;
  maxDepth: number;
}

export const DEFAULT_LIMITS: ParseLimits = {
  maxXmlBytes: 800 * 1024 * 1024,
  maxTracks: 256,
  maxNotesPerClip: 100_000,
  maxDepth: 128,
};

export class AlsError extends Error {
  constructor(
    public code: "not_gzip" | "too_large" | "not_live_set" | "too_deep" | "too_many_tracks",
    message: string,
  ) {
    super(message);
    this.name = "AlsError";
  }
}
