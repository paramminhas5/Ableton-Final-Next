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

// ── punch-ins recorded into the song ──────────────────────────────────────────────────────────────────────

/**
 * A punch-in recorded into the song (the studio's rec key held while you press a key): when it starts and ends,
 * in beats on the loop the engine plays (the whole arrangement when the song has one), which effect, its amount
 * when pressed, and how the amount moved while held ([beat, amount], beats on the same loop). The engine plays
 * them back on their exact sample (cmd punchAdd). Saved on the song as `punches`; songs without it have none.
 */
export type Punch = { at: number; end: number; fx: PunchKey; amt: number; moves?: [number, number][] };

const KEY_OF: Record<number, PunchKey> = Object.fromEntries(PUNCH_KEYS.map(k => [k.mode, k.key]));
const MODE_OF: Record<PunchKey, number> = Object.fromEntries(PUNCH_KEYS.map(k => [k.key, k.mode])) as Record<PunchKey, number>;
export const punchKeyOf = (mode: number): PunchKey | null => KEY_OF[mode] ?? null;
export const labelOf = (fx: PunchKey) => PUNCH_KEYS.find(k => k.key === fx)?.label ?? fx;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const isNum = (x: unknown): x is number => typeof x === "number" && Number.isFinite(x);

/** The engine's automation points for the song's punches: a press, its moves, and a let-go, by beat. */
export function punchPoints(punches: Punch[] | undefined, loop: number): { mode: number; amount: number; beat: number }[] {
  const out: { mode: number; amount: number; beat: number }[] = [];
  const wrap = (b: number) => ((b % loop) + loop) % loop;
  for (const p of punches ?? []) {
    out.push({ mode: MODE_OF[p.fx], amount: clamp01(p.amt), beat: wrap(p.at) });
    for (const [b, a] of p.moves ?? []) out.push({ mode: MODE_OF[p.fx], amount: clamp01(a), beat: wrap(b) });
    out.push({ mode: PUNCH.off, amount: 0, beat: wrap(p.end) });
  }
  return out.sort((a, b) => a.beat - b.beat);
}

/** How long a punch holds, in beats, on a loop of `loop` (it may wrap past the loop's end). */
export const punchLen = (p: Punch, loop: number) => { const d = (((p.end - p.at) % loop) + loop) % loop; return d === 0 ? loop : d; };

/** Does beat `b` fall inside the punch? */
const inside = (p: Punch, b: number, loop: number) => ((((b - p.at) % loop) + loop) % loop) < punchLen(p, loop);

/** Add a punch: the ones it overlaps are replaced (a new take over an old one), the list stays in time order. */
export function addPunch(list: Punch[] | undefined, p: Punch, loop: number): Punch[] {
  const keep = (list ?? []).filter(q => !inside(p, q.at, loop) && !inside(q, p.at, loop));
  return [...keep, p].sort((a, b) => a.at - b.at);
}

/**
 * Builds punches from the engine's PUNCHED events while recording: a press opens one, presses of the same key
 * are moves (kept only when the amount moved 0.02 or more), a let-go or another key closes it.
 */
export function punchRecorder(loop: () => number) {
  let open: Punch | null = null;
  return {
    /** Feed one event (effect `mode`, `amount`, loop `beat`); returns a finished punch when one closes. */
    feed(mode: number, amount: number, beat: number): Punch | null {
      const key = punchKeyOf(mode);
      let done: Punch | null = null;
      if (open && (key === null || key !== open.fx)) {
        done = { ...open, end: beat };
        open = null;
      }
      if (key) {
        if (open) {
          const last = open.moves?.length ? open.moves[open.moves.length - 1][1] : open.amt;
          if (Math.abs(amount - last) >= 0.02) open.moves = [...(open.moves ?? []), [beat, Math.round(clamp01(amount) * 1000) / 1000]];
        } else open = { at: beat, end: beat, fx: key, amt: Math.round(clamp01(amount) * 1000) / 1000 };
      }
      if (done && punchLen(done, loop()) < 1 / 64) return null;
      return done;
    },
    /** Recording stopped with a key still held: it ends where we are. */
    close(beat: number): Punch | null {
      if (!open) return null;
      const done = { ...open, end: beat };
      open = null;
      return done;
    },
    get holding() { return open !== null; },
  };
}

/** Make stored punches safe: known effects, finite beats, amounts in 0..1. Missing stays missing. */
export function cleanPunches(v: unknown): Punch[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const out: Punch[] = [];
  for (const p of v) {
    if (!p || typeof p !== "object") continue;
    const q = p as Partial<Punch>;
    if (!isNum(q.at) || !isNum(q.end) || !isNum(q.amt) || !q.fx || !(q.fx in MODE_OF) || q.at < 0 || q.end < 0) continue;
    const moves = Array.isArray(q.moves) ? q.moves.filter(m => Array.isArray(m) && isNum(m[0]) && isNum(m[1]) && m[0] >= 0).map(m => [m[0], clamp01(m[1])] as [number, number]) : undefined;
    out.push({ at: q.at, end: q.end, fx: q.fx, amt: clamp01(q.amt), ...(moves?.length ? { moves } : {}) });
  }
  return out.length ? out.slice(0, 256) : undefined;
}
