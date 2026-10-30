/**
 * Weekly target (PRD EG-5). Default 3 sessions a week, plus one free pass a
 * week. There is no daily streak, and missing a day never resets progress.
 */

export const DEFAULT_TARGET = 3;

/** ISO date (YYYY-MM-DD) of the Monday of the week containing `d`, in local time. */
export function weekKey(d: Date): string {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = (x.getDay() + 6) % 7; // Monday = 0
  x.setDate(x.getDate() - dow);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`;
}

export interface WeekStore {
  /** ISO timestamps of completed sessions (kept for the last 12 weeks) */
  sessions: string[];
  /** week key in which the free pass was used, if any */
  passWeek: string | null;
  target: number;
}

export const emptyStore = (): WeekStore => ({ sessions: [], passWeek: null, target: DEFAULT_TARGET });

export interface WeekStatus {
  week: string;
  done: number;
  passUsed: boolean;
  target: number;
  /** sessions plus the pass, capped at the target for display */
  filled: number;
  met: boolean;
  remaining: number;
}

export function weekStatus(store: WeekStore, now: Date): WeekStatus {
  const week = weekKey(now);
  const done = store.sessions.filter((s) => weekKey(new Date(s)) === week).length;
  const passUsed = store.passWeek === week;
  const filled = Math.min(store.target, done + (passUsed ? 1 : 0));
  return {
    week,
    done,
    passUsed,
    target: store.target,
    filled,
    met: filled >= store.target,
    remaining: Math.max(0, store.target - filled),
  };
}

export function recordSession(store: WeekStore, now: Date): WeekStore {
  const cutoff = now.getTime() - 12 * 7 * 86400000;
  const sessions = [...store.sessions, now.toISOString()].filter((s) => new Date(s).getTime() >= cutoff);
  return { ...store, sessions };
}

/** One free pass per week. Returns the store unchanged if it was already used this week. */
export function takeFreePass(store: WeekStore, now: Date): WeekStore {
  const week = weekKey(now);
  if (store.passWeek === week) return store;
  return { ...store, passWeek: week };
}

export function canUsePass(store: WeekStore, now: Date): boolean {
  const s = weekStatus(store, now);
  return !s.passUsed && !s.met;
}
