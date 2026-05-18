// Progress store: localStorage when signed out, Supabase when signed in.
// Hearts, daily goal, streak shield added for CCD mode.
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const KEY = "ableton.school.progress.v1";
const MERGED_KEY = "ableton.school.merged_for";

export const DAILY_GOAL_XP = 50; // XP target per day
export const MAX_HEARTS = 3; // CCD mode lives
export const HEART_REFILL_SECS = 60; // 1 minute refill

export type Progress = {
  xp: number;
  streakDays: number;
  lastDay: string | null;
  completedMissions: Record<string, { score: number; at: number }>;
  badges: string[];
  // CCD additions
  hearts: number; // 0–3
  heartRefillAt: number; // epoch ms when last heart was lost (0 = full)
  dailyXp: number; // XP earned today
  dailyXpDate: string; // 'YYYY-MM-DD' to detect day rollover
  streakShield: boolean; // absorbs one missed day; earned at 7-day streaks
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

// Calculate how many hearts should have refilled since heartRefillAt
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

// Reset dailyXp if it's a new day
const applyDayRollover = (p: Progress): Progress => {
  const today = todayKey();
  if (p.dailyXpDate === today) return p;
  return { ...p, dailyXp: 0, dailyXpDate: today };
};

const hydrate = (p: Progress): Progress => applyDayRollover(applyHeartRefill(p));

const readLocal = (): Progress => {
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

async function readCloud(userId: string): Promise<Progress> {
  const [{ data: prog }, { data: comps }, { data: bdg }] = await Promise.all([
    supabase
      .from("progress")
      .select("xp, streak_days, last_day")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("mission_completions")
      .select("mission_slug, score, completed_at")
      .eq("user_id", userId),
    supabase.from("badges").select("badge_slug").eq("user_id", userId),
  ]);
  const completedMissions: Progress["completedMissions"] = {};
  (comps ?? []).forEach((c) => {
    completedMissions[c.mission_slug] = {
      score: Number(c.score),
      at: new Date(c.completed_at).getTime(),
    };
  });
  // Merge cloud basics with local CCD state (hearts live client-side only)
  const local = readLocal();
  return hydrate({
    ...local,
    xp: prog?.xp ?? 0,
    streakDays: prog?.streak_days ?? 0,
    lastDay: prog?.last_day ?? null,
    completedMissions,
    badges: (bdg ?? []).map((b) => b.badge_slug),
  });
}

async function writeCloudCompletion(userId: string, slug: string, score: number, badge?: string) {
  await supabase
    .from("mission_completions")
    .upsert({ user_id: userId, mission_slug: slug, score }, { onConflict: "user_id,mission_slug" });
  if (badge) {
    await supabase
      .from("badges")
      .upsert({ user_id: userId, badge_slug: badge }, { onConflict: "user_id,badge_slug" });
  }
}

async function writeCloudProgress(userId: string, xp: number, streak: number, lastDay: string) {
  await supabase.from("progress").upsert(
    {
      user_id: userId,
      xp,
      streak_days: streak,
      last_day: lastDay,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
}

async function mergeLocalIntoCloud(userId: string) {
  if (typeof localStorage === "undefined") return;
  if (localStorage.getItem(MERGED_KEY) === userId) return;
  const local = readLocal();
  if (
    local.xp === 0 &&
    Object.keys(local.completedMissions).length === 0 &&
    local.badges.length === 0
  ) {
    localStorage.setItem(MERGED_KEY, userId);
    return;
  }
  const cloud = await readCloud(userId);
  const today = todayKey();
  const lastDay =
    cloud.lastDay && local.lastDay
      ? cloud.lastDay > local.lastDay
        ? cloud.lastDay
        : local.lastDay
      : (cloud.lastDay ?? local.lastDay ?? today);
  await writeCloudProgress(
    userId,
    Math.max(cloud.xp, local.xp),
    Math.max(cloud.streakDays, local.streakDays),
    lastDay,
  );
  const rows = Object.entries(local.completedMissions).map(([slug, v]) => ({
    user_id: userId,
    mission_slug: slug,
    score: v.score,
    completed_at: new Date(v.at).toISOString(),
  }));
  if (rows.length)
    await supabase.from("mission_completions").upsert(rows, { onConflict: "user_id,mission_slug" });
  if (local.badges.length) {
    await supabase.from("badges").upsert(
      local.badges.map((b) => ({ user_id: userId, badge_slug: b })),
      { onConflict: "user_id,badge_slug" },
    );
  }
  localStorage.setItem(MERGED_KEY, userId);
}

export const useProgress = () => {
  const [p, setP] = useState<Progress>(empty());
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const refresh = async (uid: string | null) => {
      if (!mounted) return;
      if (uid) {
        await mergeLocalIntoCloud(uid);
        const cloud = await readCloud(uid);
        if (mounted) setP(cloud);
      } else {
        setP(readLocal());
      }
    };
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      const uid = s?.user?.id ?? null;
      setUserId(uid);
      void refresh(uid);
    });
    supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user?.id ?? null;
      setUserId(uid);
      void refresh(uid);
    });
    const h = () => {
      if (!userId) setP(readLocal());
    };
    window.addEventListener("progress:update", h);
    window.addEventListener("storage", h);
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
      window.removeEventListener("progress:update", h);
      window.removeEventListener("storage", h);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const completeMission = useCallback(
    (slug: string, xp: number, score: number, badge?: string) => {
      const cur = userId ? p : readLocal();
      const today = todayKey();
      let streak = cur.streakDays;

      if (cur.lastDay !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
        if (cur.lastDay === yKey) {
          streak = streak + 1;
        } else if (cur.streakShield && cur.lastDay) {
          // Shield absorbs one missed day
          streak = streak; // keep streak, consume shield
        } else {
          streak = 1;
        }
      }

      const already = cur.completedMissions[slug];
      const earnedXp = already ? 0 : xp;
      const newDailyXp = cur.dailyXpDate === today ? cur.dailyXp + earnedXp : earnedXp;

      // Earn a streak shield at 7-day milestones
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
      if (userId) {
        void writeCloudCompletion(userId, slug, score, badge);
        void writeCloudProgress(userId, next.xp, next.streakDays, next.lastDay!);
      } else {
        writeLocal(next);
      }
    },
    [p, userId],
  );

  const loseHeart = useCallback(() => {
    const cur = userId ? p : readLocal();
    if (cur.hearts <= 0) return;
    const next: Progress = {
      ...cur,
      hearts: cur.hearts - 1,
      heartRefillAt: cur.heartRefillAt === 0 ? Date.now() : cur.heartRefillAt,
    };
    setP(next);
    if (!userId) writeLocal(next);
  }, [p, userId]);

  const reset = useCallback(() => {
    if (userId) return;
    writeLocal(empty());
  }, [userId]);

  // Seconds until next heart refills (0 = full)
  const heartRefillSeconds =
    p.hearts >= MAX_HEARTS || p.heartRefillAt === 0
      ? 0
      : Math.max(0, HEART_REFILL_SECS - Math.floor((Date.now() - p.heartRefillAt) / 1000));

  const dailyGoalPct = Math.min(1, p.dailyXp / DAILY_GOAL_XP);
  const dailyGoalDone = p.dailyXp >= DAILY_GOAL_XP;

  const addXp = (amount: number) => {
    const cur = userId ? p : readLocal();
    const today = todayKey();
    const newDailyXp = cur.dailyXpDate === today ? cur.dailyXp + amount : amount;
    const next: Progress = { ...cur, xp: cur.xp + amount, dailyXp: newDailyXp, dailyXpDate: today };
    setP(next);
    if (!userId) writeLocal(next);
    if (userId) void writeCloudProgress(userId, next.xp, next.streakDays, next.lastDay ?? today);
  };

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
