"use client";
// Progress store: localStorage only (cloud sync via Supabase removed for Next.js migration)
import { useEffect, useState, useCallback } from "react";

const KEY = "ccd.progress.v1";

export const DAILY_GOAL_XP = 50;
export const MAX_HEARTS = 3;
export const HEART_REFILL_SECS = 60;

export type Progress = {
  xp: number;
  streakDays: number;
  lastDay: string | null;
  completedMissions: Record<string, { score: number; at: number }>;
  badges: string[];
  hearts: number;
  heartRefillAt: number;
  dailyXp: number;
  dailyXpDate: string;
  streakShield: boolean;
};

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const empty = (): Progress => ({
  xp: 0,
  streakDays: 0,
  lastDay: null,
  completedMissions: {},
  badges: [],
  hearts: MAX_HEARTS,
  heartRefillAt: 0,
  dailyXp: 0,
  dailyXpDate: todayKey(),
  streakShield: false,
});

const applyHeartRefill = (p: Progress): Progress => {
  if (p.hearts >= MAX_HEARTS || p.heartRefillAt === 0) return p;
  const elapsed = (Date.now() - p.heartRefillAt) / 1000;
  const refilled = Math.min(Math.floor(elapsed / HEART_REFILL_SECS), MAX_HEARTS - p.hearts);
  if (refilled <= 0) return p;
  const newHearts = p.hearts + refilled;
  return {
    ...p,
    hearts: newHearts,
    heartRefillAt:
      newHearts >= MAX_HEARTS ? 0 : p.heartRefillAt + refilled * HEART_REFILL_SECS * 1000,
  };
};

const applyDayRollover = (p: Progress): Progress => {
  const today = todayKey();
  if (p.dailyXpDate === today) return p;
  return { ...p, dailyXp: 0, dailyXpDate: today };
};

const hydrate = (p: Progress): Progress => applyDayRollover(applyHeartRefill(p));

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

export const useProgress = () => {
  const [p, setP] = useState<Progress>(empty());

  useEffect(() => {
    setP(readLocal());
    const h = () => setP(readLocal());
    window.addEventListener("progress:update", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("progress:update", h);
      window.removeEventListener("storage", h);
    };
  }, []);

  const completeMission = useCallback(
    (slug: string, xp: number, score: number, badge?: string) => {
      const cur = readLocal();
      const today = todayKey();
      let streak = cur.streakDays;

      if (cur.lastDay !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
        if (cur.lastDay === yKey) {
          streak = streak + 1;
        } else if (cur.streakShield && cur.lastDay) {
          // keep streak, consume shield
        } else {
          streak = 1;
        }
      }

      const already = cur.completedMissions[slug];
      const earnedXp = already ? 0 : xp;
      const newDailyXp = cur.dailyXpDate === today ? cur.dailyXp + earnedXp : earnedXp;
      const earnShield = streak > 0 && streak % 7 === 0 && !cur.streakShield;

      const next: Progress = {
        ...cur,
        xp: cur.xp + earnedXp,
        lastDay: today,
        streakDays: streak,
        dailyXp: newDailyXp,
        dailyXpDate: today,
        completedMissions: { ...cur.completedMissions, [slug]: { score, at: Date.now() } },
        badges: badge && !cur.badges.includes(badge) ? [...cur.badges, badge] : cur.badges,
        streakShield: earnShield ? true : cur.streakShield,
      };
      setP(next);
      writeLocal(next);
    },
    [],
  );

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

  const reset = useCallback(() => {
    writeLocal(empty());
    setP(empty());
  }, []);

  const addXp = useCallback((amount: number) => {
    const cur = readLocal();
    const today = todayKey();
    const newDailyXp = cur.dailyXpDate === today ? cur.dailyXp + amount : amount;
    const next: Progress = { ...cur, xp: cur.xp + amount, dailyXp: newDailyXp, dailyXpDate: today };
    setP(next);
    writeLocal(next);
  }, []);

  const heartRefillSeconds =
    p.hearts >= MAX_HEARTS || p.heartRefillAt === 0
      ? 0
      : Math.max(0, HEART_REFILL_SECS - Math.floor((Date.now() - p.heartRefillAt) / 1000));

  const dailyGoalPct = Math.min(1, p.dailyXp / DAILY_GOAL_XP);
  const dailyGoalDone = p.dailyXp >= DAILY_GOAL_XP;

  return {
    progress: p,
    completeMission,
    loseHeart,
    addXp,
    reset,
    heartRefillSeconds,
    dailyGoalPct,
    dailyGoalDone,
  };
};
