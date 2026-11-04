/* Pure: no fs, no yaml. The browser bundle imports this file. */
import type { Lesson, Level, RawAsk, RawStep, RawTry, ResolvedStep, ResolvedTry, Voice, VoiceText, Rounds } from "./schema";

export type ResolveOpts = { voice: Voice; level: Level };

export function voiceText(t: VoiceText, voice: Voice): string {
  if (typeof t === "string") return t;
  return t[voice] ?? t.mentor;
}

function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

/**
 * For every ask in the lesson (all levels, so positions never move when the level changes) returns the
 * new order of its options: `order[newPos] = oldIndex`. The correct answer is placed first, then the rest
 * shuffled, with the answer position chosen so that no position holds more than half the asks when the
 * option counts allow it. Deterministic per slug.
 */
export function askOrders(slug: string, steps: readonly RawStep[]): Map<number, number[]> {
  const asks = steps.map((s, i) => [s, i] as const).filter((p): p is readonly [RawAsk, number] => p[0].kind === "ask");
  const n = asks.length;
  const widest = Math.max(0, ...asks.map(([a]) => a.options.length));
  const cap = Math.max(Math.floor(n / 2), Math.ceil(n / Math.max(1, Math.min(widest, n))));
  const used: number[] = [];
  const out = new Map<number, number[]>();
  for (const [ask, i] of asks) {
    const rand = seeded(`${slug}:${i}`);
    const k = ask.options.length;
    let allowed = Array.from({ length: k }, (_, p) => p).filter((p) => (used[p] ?? 0) < cap);
    if (allowed.length === 0) allowed = Array.from({ length: k }, (_, p) => p);
    const target = allowed[Math.floor(rand() * allowed.length)];
    used[target] = (used[target] ?? 0) + 1;
    const rest = ask.options.map((_, j) => j).filter((j) => j !== ask.answer);
    for (let a = rest.length - 1; a > 0; a--) {
      const b = Math.floor(rand() * (a + 1));
      [rest[a], rest[b]] = [rest[b], rest[a]];
    }
    const order: number[] = [];
    let r = 0;
    for (let p = 0; p < k; p++) order.push(p === target ? ask.answer : rest[r++]);
    out.set(i, order);
  }
  return out;
}

function roundsFor(r: Rounds, level: Level): number {
  return typeof r === "number" ? r : r[level];
}

function resolveTry(t: RawTry, o: ResolveOpts): ResolvedTry {
  const hint = t.hint !== undefined && o.level !== "hard" ? voiceText(t.hint, o.voice) : undefined;
  const base = t.kind === "play" ? { kind: "play" as const, layer: t.layer, surface: t.surface, goal: t.goal } : { kind: "shape" as const, layer: t.layer, knobs: t.knobs };
  return { ...base, say: voiceText(t.say, o.voice), ...(hint !== undefined ? { hint } : {}) } as ResolvedTry;
}

/** Hints show at gentle and standard, never at hard. */
function hintOf(h: VoiceText | undefined, o: ResolveOpts): { hint?: string } {
  return h !== undefined && o.level !== "hard" ? { hint: voiceText(h, o.voice) } : {};
}

export function resolveLearn(lesson: Pick<Lesson, "learn">, voice: Voice): string {
  return voiceText(lesson.learn, voice);
}

export function resolveLesson(lesson: Pick<Lesson, "slug" | "steps">, o: ResolveOpts): ResolvedStep[] {
  const orders = askOrders(lesson.slug, lesson.steps);
  const out: ResolvedStep[] = [];
  lesson.steps.forEach((s, i) => {
    if (s.levels && !s.levels.includes(o.level)) return;
    switch (s.kind) {
      case "hear":
        out.push({ kind: "hear", clip: s.clip, say: voiceText(s.say, o.voice), deeper: (s.deeper ?? []).map((d) => ({ title: d.title, say: voiceText(d.say, o.voice) })) });
        break;
      case "say":
        out.push({
          kind: "say",
          title: s.title,
          say: voiceText(s.say, o.voice),
          ...(s.clip ? { clip: s.clip } : {}),
          deeper: (s.deeper ?? []).map((d) => ({ title: d.title, say: voiceText(d.say, o.voice), ...(d.try ? { try: resolveTry(d.try, o) } : {}) })),
          ...hintOf(s.hint, o),
        });
        break;
      case "play":
      case "shape": {
        const { kind, ...rest } = resolveTry(s, o);
        out.push({ kind, ...rest } as ResolvedStep);
        break;
      }
      case "ask": {
        const order = orders.get(i)!;
        const whyWrong: Record<number, string> = {};
        for (const [k, v] of Object.entries(s.whyWrong ?? {})) whyWrong[order.indexOf(Number(k))] = voiceText(v, o.voice);
        out.push({
          kind: "ask",
          q: voiceText(s.q, o.voice),
          options: order.map((j) => s.options[j]),
          answer: order.indexOf(s.answer),
          why: voiceText(s.why, o.voice),
          ...(s.whyWrong ? { whyWrong } : {}),
          ...hintOf(s.hint, o),
          ...(s.more ? { more: true } : {}),
        });
        break;
      }
      case "ear":
        out.push({ kind: "ear", drill: s.drill, rounds: roundsFor(s.rounds, o.level), ...(s.say !== undefined ? { say: voiceText(s.say, o.voice) } : {}), ...hintOf(s.hint, o) });
        break;
      case "keep":
        out.push({ kind: "keep", next: voiceText(s.next, o.voice) });
        break;
    }
  });
  return out;
}
