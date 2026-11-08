/**
 * The learning funnel from raw learning events (src/lib/learnEvents.ts): where learners drop, which steps
 * take the most checks or get skipped most, placements, gym sessions and next-day returns. Pure, so the
 * admin view runs the same summary on the database's rows and on this device's log, and it is tested.
 */
export type LearnEventName =
  | "lesson_started" | "step_shown" | "step_skipped" | "step_done" | "lesson_finished"
  | "came_back" | "came_back_next_day" | "placement_result" | "gym_session"
  | "challenge_done" | "remake_done";
/** Every learning event the server accepts. */
export const LEARN_EVENTS: readonly LearnEventName[] = ["lesson_started", "step_shown", "step_skipped", "step_done", "lesson_finished", "came_back", "came_back_next_day", "placement_result", "gym_session", "challenge_done", "remake_done"];

export type Row = { who: string; e: string; t: number; p: Record<string, unknown> };

export type LessonRow = { slug: string; started: number; finished: number; learners: number; finishRate: number; dropStep: string | null };
export type StepRow = { slug: string; step: number; kind: string; shown: number; skipped: number; done: number; skipRate: number; checks: number; avgChecks: number; hints: number; avgStars: number | null };
export type Funnel = {
  learners: number; events: number; from: number; to: number;
  lessons: LessonRow[];
  steps: StepRow[];
  mostChecks: StepRow[];
  mostSkipped: StepRow[];
  placements: { world: string; level: number; n: number }[];
  gym: { sessions: number; learners: number; accuracy: number | null };
  returning: { learners: number; cameBack: number; nextDay: number; nextDayRate: number | null };
  challenges: { world: string; n: number; avgStars: number }[];
};

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const str = (v: unknown) => (typeof v === "string" ? v : v == null ? "" : String(v));

export function funnel(rows: Row[]): Funnel {
  const who = new Set(rows.map(r => r.who));
  const L = new Map<string, { started: Set<string>; finished: Set<string>; s: number; f: number }>();
  const S = new Map<string, StepRow & { stars: number[]; checked: number }>();
  const lesson = (slug: string) => { let x = L.get(slug); if (!x) L.set(slug, (x = { started: new Set(), finished: new Set(), s: 0, f: 0 })); return x; };
  const step = (slug: string, i: number, kind: string) => {
    const k = `${slug}#${i}`;
    let x = S.get(k);
    if (!x) S.set(k, (x = { slug, step: i, kind, shown: 0, skipped: 0, done: 0, skipRate: 0, checks: 0, avgChecks: 0, hints: 0, avgStars: null, stars: [], checked: 0 }));
    if (kind && !x.kind) x.kind = kind;
    return x;
  };
  const P = new Map<string, number>();
  const C = new Map<string, number[]>();
  let gymN = 0; const gymWho = new Set<string>(); const acc: number[] = [];
  const back = new Set<string>(), next = new Set<string>(), visitors = new Set<string>();
  for (const r of rows) {
    const slug = str(r.p.slug ?? r.p.missionSlug);
    switch (r.e) {
      case "lesson_started": { const x = lesson(slug); x.s++; x.started.add(r.who); break; }
      case "lesson_finished": { const x = lesson(slug); x.f++; x.finished.add(r.who); break; }
      case "step_shown": step(slug, num(r.p.step) ?? -1, str(r.p.kind)).shown++; break;
      case "step_skipped": step(slug, num(r.p.step) ?? -1, str(r.p.kind)).skipped++; break;
      case "step_done": {
        const x = step(slug, num(r.p.step) ?? -1, str(r.p.kind));
        x.done++;
        const c = num(r.p.checks), h = num(r.p.hints), st = num(r.p.stars);
        if (c !== null) { x.checks += c; x.checked++; }
        if (h !== null) x.hints += h;
        if (st !== null) x.stars.push(st);
        break;
      }
      case "placement_result": { const k = `${str(r.p.world)}#${num(r.p.level) ?? 0}`; P.set(k, (P.get(k) ?? 0) + 1); break; }
      case "gym_session": { gymN++; gymWho.add(r.who); const a = num(r.p.accuracy); if (a !== null) acc.push(a); break; }
      case "came_back": back.add(r.who); break;
      case "came_back_next_day": next.add(r.who); break;
      case "challenge_done": { const w = str(r.p.world); const a = C.get(w) ?? []; a.push(num(r.p.stars) ?? 0); C.set(w, a); break; }
    }
    visitors.add(r.who);
  }
  const steps: StepRow[] = [...S.values()].map(({ stars, checked, ...x }) => ({
    ...x,
    skipRate: x.shown ? x.skipped / x.shown : 0,
    avgChecks: checked ? x.checks / checked : 0,
    avgStars: stars.length ? stars.reduce((a, b) => a + b, 0) / stars.length : null,
  })).sort((a, b) => (a.slug === b.slug ? a.step - b.step : a.slug < b.slug ? -1 : 1));
  const lessons: LessonRow[] = [...L.entries()].map(([slug, x]) => {
    // Where people stop: the step of this lesson most often shown last before not finishing, approximated as
    // the step with the biggest fall in "shown" from the one before it.
    const ss = steps.filter(s => s.slug === slug && s.step >= 0);
    let drop: string | null = null, worst = 0;
    for (let i = 1; i < ss.length; i++) { const fall = ss[i - 1].shown - ss[i].shown; if (fall > worst) { worst = fall; drop = `step ${ss[i - 1].step + 1} (${ss[i - 1].kind})`; } }
    return { slug, started: x.s, finished: x.f, learners: x.started.size, finishRate: x.started.size ? Math.min(1, x.finished.size / x.started.size) : 0, dropStep: drop };
  }).sort((a, b) => b.started - a.started);
  const withChecks = steps.filter(s => s.avgChecks > 0);
  return {
    learners: who.size, events: rows.length,
    from: rows.length ? Math.min(...rows.map(r => r.t)) : 0, to: rows.length ? Math.max(...rows.map(r => r.t)) : 0,
    lessons, steps,
    mostChecks: [...withChecks].sort((a, b) => b.avgChecks - a.avgChecks).slice(0, 10),
    mostSkipped: steps.filter(s => s.shown >= 1 && s.skipped > 0).sort((a, b) => b.skipRate - a.skipRate || b.skipped - a.skipped).slice(0, 10),
    placements: [...P.entries()].map(([k, n]) => { const [world, level] = k.split("#"); return { world, level: Number(level), n }; }).sort((a, b) => a.world.localeCompare(b.world) || a.level - b.level),
    gym: { sessions: gymN, learners: gymWho.size, accuracy: acc.length ? acc.reduce((a, b) => a + b, 0) / acc.length : null },
    returning: { learners: visitors.size, cameBack: back.size, nextDay: next.size, nextDayRate: visitors.size ? next.size / visitors.size : null },
    challenges: [...C.entries()].map(([world, a]) => ({ world, n: a.length, avgStars: a.reduce((x, y) => x + y, 0) / a.length })),
  };
}
