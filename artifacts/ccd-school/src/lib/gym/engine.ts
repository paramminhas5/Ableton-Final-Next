/**
 * Ear Gym engine (PRD EG-1 to EG-5). Pure logic, no audio, no DOM.
 *
 * Difficulty rule (EG-1): level goes up after 4 correct answers in a row and
 * down after 2 misses in a row. A level change resets both streaks.
 */

export type GymDrill = "eq" | "compression" | "groove";
export const GYM_DRILLS: GymDrill[] = ["eq", "compression", "groove"];

export const MIN_LEVEL = 1;
export const MAX_LEVEL = 8;
export const UP_AFTER = 4;
export const DOWN_AFTER = 2;

export interface LevelState {
  level: number;
  correctRun: number;
  missRun: number;
}

export const initialLevel = (level = 1): LevelState => ({
  level: Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, level)),
  correctRun: 0,
  missRun: 0,
});

export function advance(state: LevelState, correct: boolean): LevelState {
  if (correct) {
    const run = state.correctRun + 1;
    if (run >= UP_AFTER && state.level < MAX_LEVEL) {
      return { level: state.level + 1, correctRun: 0, missRun: 0 };
    }
    return { ...state, correctRun: run >= UP_AFTER ? 0 : run, missRun: 0 };
  }
  const miss = state.missRun + 1;
  if (miss >= DOWN_AFTER && state.level > MIN_LEVEL) {
    return { level: state.level - 1, correctRun: 0, missRun: 0 };
  }
  return { ...state, correctRun: 0, missRun: miss >= DOWN_AFTER ? 0 : miss };
}

// ─── Question specs ──────────────────────────────────────────────────────────

export interface Rng {
  (): number;
}

/** Small deterministic PRNG so tests and replays are repeatable. */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const EQ_CENTERS = [63, 125, 250, 500, 1000, 2000, 4000, 8000, 12000, 16000];

export interface EqQuestion {
  drill: "eq";
  options: number[]; // Hz, ascending
  answerHz: number;
  boostDb: number;
  q: number;
}

/** 3 options at level 1, up to all 10 at level 8. Boost shrinks from 12 dB to 4 dB. */
export function makeEqQuestion(level: number, rng: Rng): EqQuestion {
  const count = Math.min(EQ_CENTERS.length, 2 + level + (level >= 8 ? 1 : 0));
  // pick `count` centers spread across the range, always including the answer
  const answer = EQ_CENTERS[Math.floor(rng() * EQ_CENTERS.length)];
  const pool = EQ_CENTERS.filter((c) => c !== answer);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const options = [answer, ...pool.slice(0, count - 1)].sort((a, b) => a - b);
  return {
    drill: "eq",
    options,
    answerHz: answer,
    boostDb: Math.max(4, 13 - level),
    q: 1.2,
  };
}

export type AttackSetting = "fast" | "medium" | "slow";

export interface CompressionQuestion {
  drill: "compression";
  compressed: boolean;
  /** only asked at level 3+, and only if the clip is compressed */
  askAttack: boolean;
  attack: AttackSetting;
  ratio: number;
  thresholdDb: number;
}

export function makeCompressionQuestion(level: number, rng: Rng): CompressionQuestion {
  const compressed = rng() < 0.5;
  const attacks: AttackSetting[] = ["fast", "medium", "slow"];
  return {
    drill: "compression",
    compressed,
    askAttack: compressed && level >= 3,
    attack: attacks[Math.floor(rng() * 3)],
    // gentler compression at higher levels = harder to hear
    ratio: Math.max(1.8, 8 - level * 0.75),
    thresholdDb: -30 + level * 1.5,
  };
}

export type GrooveKind = "tempo" | "swing";

export interface GrooveQuestion {
  drill: "groove";
  kind: GrooveKind;
  baseBpm: number;
  /** which clip is the faster / swung one */
  answer: "A" | "B";
  deltaBpm: number; // tempo kind
  swing: number; // swing kind, 0..0.5 of an eighth
}

export function makeGrooveQuestion(level: number, rng: Rng, prev?: GrooveKind): GrooveQuestion {
  const kind: GrooveKind = prev ? (prev === "tempo" ? "swing" : "tempo") : rng() < 0.5 ? "tempo" : "swing";
  return {
    drill: "groove",
    kind,
    baseBpm: 100 + Math.floor(rng() * 5) * 8,
    answer: rng() < 0.5 ? "A" : "B",
    deltaBpm: Math.max(2, 20 - level * 2.5),
    swing: Math.max(0.08, 0.5 - level * 0.05),
  };
}

export type GymQuestion = EqQuestion | CompressionQuestion | GrooveQuestion;

// ─── Session ─────────────────────────────────────────────────────────────────

export const SESSION_SECONDS = 5 * 60;
/** A session only counts toward the week if the learner answered at least this many. */
export const MIN_ANSWERS_FOR_SESSION = 5;

export interface SessionResult {
  drill: GymDrill;
  level: number;
  correct: boolean;
  responseMs: number;
}

export function summarize(results: SessionResult[]) {
  const answered = results.length;
  const correct = results.filter((r) => r.correct).length;
  const byDrill: Record<string, { answered: number; correct: number; maxLevel: number }> = {};
  for (const r of results) {
    const d = (byDrill[r.drill] ??= { answered: 0, correct: 0, maxLevel: 1 });
    d.answered++;
    if (r.correct) d.correct++;
    d.maxLevel = Math.max(d.maxLevel, r.level);
  }
  return {
    answered,
    correct,
    accuracy: answered ? correct / answered : 0,
    counts: answered >= MIN_ANSWERS_FOR_SESSION,
    byDrill,
  };
}
