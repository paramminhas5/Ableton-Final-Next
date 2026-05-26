"use client";
import { useEffect, useState, useCallback } from "react";

const KEY = "ccd.progress.v2";

export const DAILY_GOAL_XP = 50;
export const MAX_HEARTS = 5;
export const HEART_REFILL_SECS = 14400; // 4 hours — real Duolingo cadence
export const GEMS_PER_LESSON = 10;
export const GEMS_PER_PERFECT = 25;

// Spaced repetition: strength decays 10% per day, review triggered at <50%
export const STRENGTH_DECAY_PER_DAY = 0.1;
export const REVIEW_THRESHOLD = 0.5;

export type LessonStrength = {
  strength: number; // 0-1, starts at 1.0 on completion
  lastReviewed: number; // timestamp ms
};

export type Progress = {
  xp: number;
  gems: number;
  streakDays: number;
  streakShield: boolean;
  streakShieldUsedAt: string | null; // date key when shield was consumed
  lastDay: string | null;
  completedMissions: Record<string, { score: number; at: number }>;
  lessonStrengths: Record<string, LessonStrength>;
  badges: string[];
  hearts: number;
  heartRefillAt: number;
  dailyXp: number;
  dailyXpDate: string;
  // Onboarding
  onboardingDone: boolean;
  selectedWorld: "fundamentals" | "dj" | "producer" | null;
  // Placement test
  placementDone: boolean;
  unlockedChapter: number; // 1-3, chapter to start from
  // Leagues
  leagueId: string | null;
  leagueTier: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  weeklyXp: number;
  weeklyXpResetDate: string;
};


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
  xp: 0,
  gems: 0,
  streakDays: 0,
  streakShield: false,
  streakShieldUsedAt: null,
  lastDay: null,
  completedMissions: {},
  lessonStrengths: {},
  badges: [],
  hearts: MAX_HEARTS,
  heartRefillAt: 0,
  dailyXp: 0,
  dailyXpDate: todayKey(),
  onboardingDone: false,
  selectedWorld: null,
  placementDone: false,
  unlockedChapter: 1,
  leagueId: null,
  leagueTier: "bronze",
  weeklyXp: 0,
  weeklyXpResetDate: weekKey(),
});

// Compute current strength after time decay
export const getLessonStrength = (ls: LessonStrength): number => {
  const daysSince = (Date.now() - ls.lastReviewed) / (1000 * 60 * 60 * 24);
  return Math.max(0, ls.strength - daysSince * STRENGTH_DECAY_PER_DAY);
};

const applyHeartRefill = (p: Progress): Progress => {
  if (p.hearts >= MAX_HEARTS || p.heartRefillAt === 0) return p;
  const elapsed = (Date.now() - p.heartRefillAt) / 1000;
  const refilled = Math.min(
    Math.floor(elapsed / HEART_REFILL_SECS),
    MAX_HEARTS - p.hearts,
  );
  if (refilled <= 0) return p;
  const newHearts = p.hearts + refilled;
  return {
    ...p,
    hearts: newHearts,
    heartRefillAt: newHearts >= MAX_HEARTS
      ? 0
      : p.heartRefillAt + refilled * HEART_REFILL_SECS * 1000,
  };
};

const applyDayRollover = (p: Progress): Progress => {
  const today = todayKey();
  if (p.dailyXpDate === today) return p;
  return { ...p, dailyXp: 0, dailyXpDate: today };
};

const applyWeeklyReset = (p: Progress): Progress => {
  const wk = weekKey();
  if (p.weeklyXpResetDate === wk) return p;
  return { ...p, weeklyXp: 0, weeklyXpResetDate: wk };
};

const hydrate = (p: Progress): Progress =>
  applyWeeklyReset(applyDayRollover(applyHeartRefill(p)));

export const readLocal = (): Progress => {
  if (typeof localStorage === "undefined") return empty();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    return hydrate({ ...empty(), ...JSON.parse(raw) });
  } catch {
    return empty();
  }
};

const writeLocal = (p: Progress) => {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(p));
  window.dispatchEvent(new Event("progress:update"));
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


export const useProgress = () => {
  const [p, setP] = useState<Progress>(empty());

  useEffect(() => {
    setP(readLocal());
    const onUpdate = () => setP(readLocal());
    const onCloud = (e: Event) => {
      const cloud = (e as CustomEvent<Partial<Progress>>).detail;
      const local = readLocal();
      const merged = mergeProgress(local, cloud);
      writeLocal(merged);
      setP(merged);
    };
    window.addEventListener("progress:update", onUpdate);
    window.addEventListener("storage", onUpdate);
    window.addEventListener("progress:cloud", onCloud);
    return () => {
      window.removeEventListener("progress:update", onUpdate);
      window.removeEventListener("storage", onUpdate);
      window.removeEventListener("progress:cloud", onCloud);
    };
  }, []);

  const completeMission = useCallback(
    (slug: string, xp: number, score: number, badge?: string) => {
      const cur = readLocal();
      const today = todayKey();
      let streak = cur.streakDays;
      let shield = cur.streakShield;
      let shieldUsedAt = cur.streakShieldUsedAt;

      if (cur.lastDay !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
        if (cur.lastDay === yKey) {
          streak = streak + 1;
        } else if (shield && cur.lastDay && shieldUsedAt !== today) {
          // Consume shield for the missed day — keep streak
          shield = false;
          shieldUsedAt = today;
        } else {
          streak = 1;
        }
      }

      const already = cur.completedMissions[slug];
      const earnedXp = already ? 0 : xp;
      const earnedGems = already ? 0 : (score === 1 ? GEMS_PER_PERFECT : GEMS_PER_LESSON);
      const newDailyXp = cur.dailyXpDate === today ? cur.dailyXp + earnedXp : earnedXp;
      const earnShield = streak > 0 && streak % 7 === 0 && !shield;

      const next: Progress = {
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
        lessonStrengths: {
          ...cur.lessonStrengths,
          [slug]: { strength: 1.0, lastReviewed: Date.now() },
        },
        badges: badge && !cur.badges.includes(badge) ? [...cur.badges, badge] : cur.badges,
      };
      setP(next);
      writeLocal(next);
    },
    [],
  );

  const reviewMission = useCallback((slug: string, score: number) => {
    const cur = readLocal();
    const newStrength = Math.min(1.0, score + 0.2); // reviewing bumps strength
    const next: Progress = {
      ...cur,
      lessonStrengths: {
        ...cur.lessonStrengths,
        [slug]: { strength: newStrength, lastReviewed: Date.now() },
      },
    };
    setP(next);
    writeLocal(next);
  }, []);

  const loseHeart = useCallback(() => {
    const cur = readLocal();
    if (cur.hearts <= 0) return;
    const next: Progress = {
      ...cur,
      hearts: cur.hearts - 1,
      heartRefillAt: cur.heartRefillAt === 0 ? Date.now() : cur.heartRefillAt,
    };
    setP(next);
    writeLocal(next);
  }, []);

  const spendGems = useCallback((amount: number): boolean => {
    const cur = readLocal();
    if (cur.gems < amount) return false;
    const next: Progress = { ...cur, gems: cur.gems - amount };
    setP(next);
    writeLocal(next);
    return true;
  }, []);

  const refillHeart = useCallback(() => {
    const cur = readLocal();
    if (cur.hearts >= MAX_HEARTS) return;
    const next: Progress = {
      ...cur,
      hearts: Math.min(MAX_HEARTS, cur.hearts + 1),
      heartRefillAt: cur.hearts + 1 >= MAX_HEARTS ? 0 : cur.heartRefillAt,
    };
    setP(next);
    writeLocal(next);
  }, []);

  const setOnboarding = useCallback((world: Progress["selectedWorld"]) => {
    const cur = readLocal();
    const next: Progress = { ...cur, onboardingDone: true, selectedWorld: world };
    setP(next);
    writeLocal(next);
  }, []);

  const setPlacement = useCallback((chapter: number) => {
    const cur = readLocal();
    const next: Progress = { ...cur, placementDone: true, unlockedChapter: chapter };
    setP(next);
    writeLocal(next);
  }, []);

  const addXp = useCallback((amount: number) => {
    const cur = readLocal();
    const today = todayKey();
    const newDailyXp = cur.dailyXpDate === today ? cur.dailyXp + amount : amount;
    const next: Progress = {
      ...cur,
      xp: cur.xp + amount,
      dailyXp: newDailyXp,
      dailyXpDate: today,
      weeklyXp: cur.weeklyXp + amount,
    };
    setP(next);
    writeLocal(next);
  }, []);

  const reset = useCallback(() => { writeLocal(empty()); setP(empty()); }, []);

  // Missions needing review (strength < REVIEW_THRESHOLD)
  const missionsNeedingReview = Object.entries(p.lessonStrengths)
    .filter(([, ls]) => getLessonStrength(ls) < REVIEW_THRESHOLD)
    .sort(([, a], [, b]) => getLessonStrength(a) - getLessonStrength(b))
    .map(([slug]) => slug);

  const heartRefillSeconds =
    p.hearts >= MAX_HEARTS || p.heartRefillAt === 0
      ? 0
      : Math.max(0, HEART_REFILL_SECS - Math.floor((Date.now() - p.heartRefillAt) / 1000));

  const dailyGoalPct = Math.min(1, p.dailyXp / DAILY_GOAL_XP);
  const dailyGoalDone = p.dailyXp >= DAILY_GOAL_XP;

  return {
    progress: p,
    completeMission,
    reviewMission,
    loseHeart,
    refillHeart,
    spendGems,
    addXp,
    reset,
    setOnboarding,
    setPlacement,
    heartRefillSeconds,
    dailyGoalPct,
    dailyGoalDone,
    missionsNeedingReview,
  };
};
