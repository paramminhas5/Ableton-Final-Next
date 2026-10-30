"use client";
/** Local persistence for the Ear Gym: levels per drill, recent results, weekly store. */
import { GYM_DRILLS, initialLevel, type GymDrill, type LevelState, type SessionResult } from "./engine";
import { emptyStore, type WeekStore } from "./week";

const KEY = "ccd.gym.v1";

export interface GymSaved {
  levels: Record<GymDrill, LevelState>;
  history: (SessionResult & { at: string })[]; // last 300 answers, for the skill curve later
  week: WeekStore;
}

export function freshSaved(): GymSaved {
  return {
    levels: Object.fromEntries(GYM_DRILLS.map((d) => [d, initialLevel()])) as Record<GymDrill, LevelState>,
    history: [],
    week: emptyStore(),
  };
}

export function loadGym(): GymSaved {
  const base = freshSaved();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return base;
    const p = JSON.parse(raw) as Partial<GymSaved>;
    return {
      levels: { ...base.levels, ...(p.levels ?? {}) },
      history: Array.isArray(p.history) ? p.history.slice(-300) : [],
      week: { ...base.week, ...(p.week ?? {}) },
    };
  } catch {
    return base;
  }
}

export function saveGym(s: GymSaved) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...s, history: s.history.slice(-300) }));
  } catch {
    /* private mode or full: progress just stays in memory */
  }
}
