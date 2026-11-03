/**
 * The engine's mix readings, decoded. While analysis is on the engine sends, about 30
 * times a second, one METER and one BANDS event per layer, the clashes, and a
 * MASTER_METER that closes the frame (see engine/src/engine.rs, `out`).
 */
import { FIX, MASTER_LAYER, OUT } from "./params.gen";
import type { EngineEvent } from "./host";

export type LayerReading = {
  layer: number;
  /** Making sound right now. */
  active: boolean;
  /** Peak since the last frame, dBFS. */
  peakDb: number;
  /** Momentary loudness, LUFS. */
  lufs: number;
  /** Energy-weighted centre of the spectrum, Hz (0 when silent). */
  centreHz: number;
  /** Where it sits, -1 left .. 1 right, in pan-knob units. */
  pan: number;
  low: number;
  mid: number;
  high: number;
};

export type FixName = "duck" | "eq" | "pan";
export type BandName = "low" | "mid" | "high";

export type ClashReading = {
  /** The layer the fix changes. */
  target: number;
  /** The layer it clashes with. */
  other: number;
  group: BandName;
  /** Analysis band 0..5 (split at 120, 400, 1.2k, 3.5k, 8k Hz). */
  band: number;
  severity: number;
  fix: FixName;
  /** Normalised value for the fix's param. */
  value: number;
  fix2: FixName | null;
  value2: number;
};

export type MasterReading = {
  /** True peak since the last frame, dBTP. */
  truePeakDb: number;
  lufs: number;
  glueGrDb: number;
  limiterGrDb: number;
  comparing: boolean;
};

export type MixFrame = {
  layers: (LayerReading | null)[];
  clashes: ClashReading[];
  master: MasterReading;
};

const GROUPS: BandName[] = ["low", "mid", "high"];

function fixName(n: number): FixName | null {
  if (n === FIX.duck) return "duck";
  if (n === FIX.eq) return "eq";
  if (n === FIX.pan) return "pan";
  return null;
}

export function decodeClash(e: EngineEvent): ClashReading {
  return {
    target: e.layer,
    other: e.note,
    group: GROUPS[e.flags & 3] ?? "low",
    band: (e.flags >> 2) & 7,
    severity: e.vel,
    fix: fixName((e.flags >> 5) & 3) ?? "eq",
    value: e.aux,
    fix2: fixName((e.flags >> 7) & 3),
    value2: e.beat,
  };
}

/** Collects events into frames. `feed` returns a frame when one completes. */
export class MixReader {
  private layers: (LayerReading | null)[] = Array(MASTER_LAYER).fill(null);
  private clashes: ClashReading[] = [];

  feed(evs: EngineEvent[]): MixFrame | null {
    let done: MixFrame | null = null;
    for (const e of evs) {
      if (e.kind === OUT.meter && e.layer < MASTER_LAYER) {
        const prev = this.layers[e.layer];
        this.layers[e.layer] = {
          layer: e.layer,
          active: (e.flags & 1) === 1,
          peakDb: e.vel,
          lufs: e.aux,
          centreHz: e.note,
          pan: e.beat,
          low: prev?.low ?? -120,
          mid: prev?.mid ?? -120,
          high: prev?.high ?? -120,
        };
      } else if (e.kind === OUT.bands && e.layer < MASTER_LAYER) {
        const r = this.layers[e.layer];
        if (r) Object.assign(r, { low: e.vel, mid: e.aux, high: e.beat });
      } else if (e.kind === OUT.clash) {
        this.clashes.push(decodeClash(e));
      } else if (e.kind === OUT.masterMeter) {
        done = {
          layers: this.layers.slice(),
          clashes: this.clashes,
          master: { truePeakDb: e.vel, lufs: e.aux, glueGrDb: e.beat, limiterGrDb: e.note / 100, comparing: ((e.flags >> 8) & 1) === 1 },
        };
        this.clashes = [];
      }
    }
    return done;
  }

  /** Forget a layer (its instrument changed or it was removed). */
  clear(layer?: number) {
    if (layer === undefined) this.layers = Array(MASTER_LAYER).fill(null);
    else this.layers[layer] = null;
    this.clashes = [];
  }
}

// ── the stage ───────────────────────────────────────────────────────────────

export const STAGE_LOW_HZ = 40;
export const STAGE_HIGH_HZ = 12_000;

/** Height on the stage, 0 (bottom) .. 1 (top), for a pitch centre. Log scale. */
export function stageY(hz: number): number {
  if (!(hz > 0)) return 0.5;
  const t = Math.log2(hz / STAGE_LOW_HZ) / Math.log2(STAGE_HIGH_HZ / STAGE_LOW_HZ);
  return Math.min(1, Math.max(0, t));
}

/** Dot diameter on the stage for a loudness, in px. */
export function stageSize(lufs: number): number {
  const t = (lufs + 40) / 34; // -40 LUFS small, -6 big
  return Math.round(18 + 28 * Math.min(1, Math.max(0, t)));
}

/** "low", "low mid", "mid", "high mid", "high", for the screen. */
export function rangeName(hz: number): string {
  if (!(hz > 0)) return "";
  if (hz < 160) return "low";
  if (hz < 450) return "low mid";
  if (hz < 1_600) return "mid";
  if (hz < 5_000) return "high mid";
  return "high";
}

/** "c", "l 20", "r 40": pan as engraved on a pan knob. */
export function panName(p: number): string {
  const v = Math.round(p * 50);
  return v === 0 ? "c" : v < 0 ? `l ${-v}` : `r ${v}`;
}
