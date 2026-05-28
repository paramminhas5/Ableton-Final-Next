"use client";
/**
 * progress.tsx — Single-source-of-truth progress state via React Context.
 *
 * Architecture:
 *   - ProgressProvider wraps the app (in ClientProviders)
 *   - All state lives in ONE useState inside the provider
 *   - useProgress() reads from context — no per-component localStorage reads
 *   - All mutations write to localStorage AND dispatch to context in one step
 *   - Cross-tab sync via storage event → context update (no stale reads)
 *
 * This eliminates the race condition where two hooks calling readLocal()
 * concurrently would each see stale state and overwrite each other.
 */
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

const KEY = "ccd.progress.v2";

export const DAILY_GOAL_XP = 50;
export const MAX_HEARTS = 5;
export const HEART_REFILL_SECS = 14400; // 4 hours
export const GEMS_PER_LESSON = 10;
export const GEMS_PER_PERFECT = 25;

export const STRENGTH_DECAY_PER_DAY = 0.1;
export const REVIEW_THRESHOLD = 0.5;

export type LessonStrength = {
  strength: number;
  lastReviewed: number;
};

export type Progress = {
  xp: number;
  gems: number;
  streakDays: number;
  streakShield: boolean;
  streakShieldUsedAt: string | null;
  lastDay: string | null;
  completedMissions: Record<string, { score: number; at: number }>;
  lessonStrengths: Record<string, LessonStrength>;
  badges: string[];
  hearts: number;
  heartRefillAt: number;
  dailyXp: number;
  dailyXpDate: string;
  onboardingDone: boolean;
  selectedWorld: "fundamentals" | "dj" | "producer" | null;
  difficulty: "normal" | "hard";
  placementDone: boolean;
  unlockedChapter: number;
  leagueId: string | null;
  leagueTier: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  weeklyXp: number;
  weeklyXpResetDate: string;
};

// ─── Pure helpers (no React) ──────────────────────────────────────────────────

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const weekKey = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(d.setDate(diff));
  return `${mon.getFullYear()}-W${String(Math.ceil(mon.getDate() / 7)).padStart(2, "0")}`;
};

export const empty = (): Progress => ({
  xp: 0, gems: 0, streakDays: 0, streakShield: false, streakShieldUsedAt: null,
  lastDay: null, completedMissions: {}, lessonStrengths: {}, badges: [],
  hearts: MAX_HEARTS, heartRefillAt: 0,
  dailyXp: 0, dailyXpDate: todayKey(),
  onboardingDone: false, selectedWorld: null, difficulty: "normal",
  placementDone: false, unlockedChapter: 1,
  leagueId: null, leagueTier: "bronze",
  weeklyXp: 0, weeklyXpResetDate: weekKey(),
});

export const getLessonStrength = (ls: LessonStrength): number => {
  const daysSince = (Date.now() - ls.lastReviewed) / (1000 * 60 * 60 * 24);
  return Math.max(0, ls.strength - daysSince * STRENGTH_DECAY_PER_DAY);
};

const applyHeartRefill = (p: Progress): Progress => {
  if (p.hearts >= MAX_HEARTS || p.heartRefillAt === 0) return p;
  const elapsed = (Date.now() - p.heartRefillAt) / 1000;
  const refilled = Math.min(Math.floor(elapsed / HEART_REFILL_SECS), MAX_HEARTS - p.hearts);
  if (refilled <= 0) return p;
  const newHearts = p.hearts + refilled;
  return { ...p, hearts: newHearts, heartRefillAt: newHearts >= MAX_HEARTS ? 0 : p.heartRefillAt + refilled * HEART_REFILL_SECS * 1000 };
};

const applyDayRollover = (p: Progress): Progress => {
  const today = todayKey();
  return p.dailyXpDate === today ? p : { ...p, dailyXp: 0, dailyXpDate: today };
};

const applyWeeklyReset = (p: Progress): Progress => {
  const wk = weekKey();
  return p.weeklyXpResetDate === wk ? p : { ...p, weeklyXp: 0, weeklyXpResetDate: wk };
};

const hydrate = (p: Progress): Progress => applyWeeklyReset(applyDayRollover(applyHeartRefill(p)));

export const readLocal = (): Progress => {
  if (typeof localStorage === "undefined") return empty();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    return hydrate({ ...empty(), ...JSON.parse(raw) });
  } catch { return empty(); }
};

// writeLocal writes to storage and fires the update event.
// Does NOT call setP — that's the provider's job so we stay in React's world.
const writeLocal = (p: Progress) => {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(p));
  // Notify other tabs via storage event (native)
  // Same tab: provider listens to "progress:internal" custom event
  window.dispatchEvent(new CustomEvent("progress:internal", { detail: p }));
};

function mergeProgress(local: Progress, cloud: Partial<Progress>): Progress {
  const localM = local.completedMissions ?? {};
  const cloudM = (cloud.completedMissions ?? {}) as Record<string, { score: number; at: number }>;
  const merged = { ...cloudM, ...localM };
  for (const [slug, cm] of Object.entries(cloudM)) {
    if (!localM[slug] || cm.at > localM[slug].at) merged[slug] = cm;
  }
  const badges = new Set(local.badges ?? []);
  for (const b of (cloud.badges ?? [])) badges.add(b);
  return {
    ...local,
    xp: Math.max(local.xp, cloud.xp ?? 0),
    gems: Math.max(local.gems, cloud.gems ?? 0),
    streakDays: Math.max(local.streakDays, cloud.streakDays ?? 0),
    lastDay: local.lastDay ?? cloud.lastDay ?? null,
    completedMissions: merged,
    badges: Array.from(badges),
    hearts: Math.max(local.hearts, cloud.hearts ?? 0),
    heartRefillAt: local.heartRefillAt || (cloud.heartRefillAt ?? 0),
    streakShield: local.streakShield || (cloud.streakShield ?? false),
    weeklyXp: Math.max(local.weeklyXp, cloud.weeklyXp ?? 0),
  };
}

// ─── Context ──────────────────────────────────────────────────────────────────

type ProgressContextValue = ReturnType<typeof buildProgressValue>;

// Build the value object from a state + setter pair
function buildProgressValue(p: Progress, setP: (next: Progress) => void) {
  // Centralised write: update React state AND persist in one call
  const commit = (next: Progress) => {
    setP(next);
    writeLocal(next);
  };

  const completeMission = (slug: string, xp: number, score: number, badge?: string) => {
    // Read current p (closure) — safe because commit() updates it atomically
    const cur = p;
    const today = todayKey();
    let streak = cur.streakDays;
    let shield = cur.streakShield;
    let shieldUsedAt = cur.streakShieldUsedAt;

    if (cur.lastDay !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
      if (cur.lastDay === yKey) { streak += 1; }
      else if (shield && cur.lastDay && shieldUsedAt !== today) { shield = false; shieldUsedAt = today; }
      else { streak = 1; }
    }

    const already = cur.completedMissions[slug];
    const earnedXp = already ? 0 : xp;
    const earnedGems = already ? 0 : (score === 1 ? GEMS_PER_PERFECT : GEMS_PER_LESSON);
    const newDailyXp = cur.dailyXpDate === today ? cur.dailyXp + earnedXp : earnedXp;
    const earnShield = streak > 0 && streak % 7 === 0 && !shield;

    commit({
      ...cur,
      xp: cur.xp + earnedXp,
      gems: cur.gems + earnedGems,
      lastDay: today,
      streakDays: streak,
      streakShield: earnShield ? true : shield,
      streakShieldUsedAt: shieldUsedAt,
      dailyXp: newDailyXp,
      dailyXpDate: today,
      weeklyXp: cur.weeklyXp + earnedXp,
      completedMissions: { ...cur.completedMissions, [slug]: { score, at: Date.now() } },
      lessonStrengths: { ...cur.lessonStrengths, [slug]: { strength: 1.0, lastReviewed: Date.now() } },
      badges: badge && !cur.badges.includes(badge) ? [...cur.badges, badge] : cur.badges,
    });
  };

  const reviewMission = (slug: string, score: number) => {
    commit({ ...p, lessonStrengths: { ...p.lessonStrengths, [slug]: { strength: Math.min(1.0, score + 0.2), lastReviewed: Date.now() } } });
  };

  const loseHeart = () => {
    if (p.hearts <= 0) return;
    commit({ ...p, hearts: p.hearts - 1, heartRefillAt: p.heartRefillAt === 0 ? Date.now() : p.heartRefillAt });
  };

  const refillHeart = () => {
    if (p.hearts >= MAX_HEARTS) return;
    const next = Math.min(MAX_HEARTS, p.hearts + 1);
    commit({ ...p, hearts: next, heartRefillAt: next >= MAX_HEARTS ? 0 : p.heartRefillAt });
  };

  const spendGems = (amount: number): boolean => {
    if (p.gems < amount) return false;
    commit({ ...p, gems: p.gems - amount });
    return true;
  };

  const addXp = (amount: number) => {
    const today = todayKey();
    const newDailyXp = p.dailyXpDate === today ? p.dailyXp + amount : amount;
    commit({ ...p, xp: p.xp + amount, dailyXp: newDailyXp, dailyXpDate: today, weeklyXp: p.weeklyXp + amount });
  };

  const setOnboarding = (world: Progress["selectedWorld"], difficulty?: Progress["difficulty"]) => {
    commit({ ...p, onboardingDone: true, selectedWorld: world, difficulty: difficulty ?? p.difficulty });
  };

  const setDifficulty = (difficulty: Progress["difficulty"]) => commit({ ...p, difficulty });
  const setPlacement = (chapter: number) => commit({ ...p, placementDone: true, unlockedChapter: chapter });
  const reset = () => commit(empty());

  const missionsNeedingReview = Object.entries(p.lessonStrengths)
    .filter(([, ls]) => getLessonStrength(ls as LessonStrength) < REVIEW_THRESHOLD)
    .sort(([, a], [, b]) => getLessonStrength(a as LessonStrength) - getLessonStrength(b as LessonStrength))
    .map(([slug]) => slug);

  const heartRefillSeconds =
    p.hearts >= MAX_HEARTS || p.heartRefillAt === 0
      ? 0
      : Math.max(0, HEART_REFILL_SECS - Math.floor((Date.now() - p.heartRefillAt) / 1000));

  const dailyGoalPct = Math.min(1, p.dailyXp / DAILY_GOAL_XP);
  const dailyGoalDone = p.dailyXp >= DAILY_GOAL_XP;

  return {
    progress: p, completeMission, reviewMission, loseHeart, refillHeart,
    spendGems, addXp, reset, setOnboarding, setDifficulty, setPlacement,
    heartRefillSeconds, dailyGoalPct, dailyGoalDone, missionsNeedingReview,
  };
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [p, setP] = useState<Progress>(empty());

  // Hydrate from localStorage on mount
  useEffect(() => {
    setP(readLocal());

    // Same-tab mutations (from writeLocal → "progress:internal" event)
    const onInternal = (e: Event) => {
      setP((e as CustomEvent<Progress>).detail);
    };

    // Cross-tab sync via native storage event
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY && e.newValue) {
        try { setP(hydrate({ ...empty(), ...JSON.parse(e.newValue) })); } catch {}
      }
    };

    // Cloud sync merge
    const onCloud = (e: Event) => {
      const cloud = (e as CustomEvent<Partial<Progress>>).detail;
      setP(cur => {
        const merged = mergeProgress(cur, cloud);
        writeLocal(merged);
        return merged;
      });
    };

    window.addEventListener("progress:internal", onInternal);
    window.addEventListener("storage", onStorage as EventListener);
    window.addEventListener("progress:cloud", onCloud);
    return () => {
      window.removeEventListener("progress:internal", onInternal);
      window.removeEventListener("storage", onStorage as EventListener);
      window.removeEventListener("progress:cloud", onCloud);
    };
  }, []);

  const value = buildProgressValue(p, setP);

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error("useProgress must be used within a ProgressProvider. Wrap your app in <ProgressProvider>.");
  }
  return ctx;
}
