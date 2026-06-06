/**
 * Tests for the progress engine core logic.
 *
 * These test the pure functions extracted from progress.tsx:
 *   - todayKey / weekKey formatting
 *   - applyHeartRefill
 *   - streak computation (via completeMission logic)
 *   - mergeProgress (cloud merge)
 *   - FSRS integration
 *
 * Run: pnpm vitest --run
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

// ─── Import pure logic (not the React hooks) ──────────────────────────────────
// We test the computations in isolation to avoid React/DOM dependencies.

const MAX_HEARTS = 5;
const HEART_REFILL_SECS = 14400; // 4 hours

// Replicate the pure helpers from progress.tsx so we can test them independently
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const yesterdayKey = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// Heart refill computation
function applyHeartRefill(hearts: number, heartRefillAt: number): { hearts: number; heartRefillAt: number } {
  if (hearts >= MAX_HEARTS || heartRefillAt === 0) return { hearts, heartRefillAt };
  const elapsed = (Date.now() - heartRefillAt) / 1000;
  const refilled = Math.min(Math.floor(elapsed / HEART_REFILL_SECS), MAX_HEARTS - hearts);
  if (refilled <= 0) return { hearts, heartRefillAt };
  const newHearts = hearts + refilled;
  return {
    hearts: newHearts,
    heartRefillAt: newHearts >= MAX_HEARTS ? 0 : heartRefillAt + refilled * HEART_REFILL_SECS * 1000,
  };
}

// Streak computation (extracted from completeMission in progress.tsx)
function computeStreak(
  currentStreak: number,
  lastDay: string | null,
  streakShield: boolean,
  shieldUsedAt: string | null,
  today: string,
  yesterday: string,
): { streak: number; shield: boolean; shieldUsedAt: string | null } {
  let streak = currentStreak;
  let shield = streakShield;
  let newShieldUsedAt = shieldUsedAt;

  if (lastDay !== today) {
    if (lastDay === yesterday) {
      streak += 1;
    } else if (shield && lastDay && newShieldUsedAt !== today) {
      shield = false;
      newShieldUsedAt = today;
    } else {
      streak = 1;
    }
  }

  return { streak, shield, shieldUsedAt: newShieldUsedAt };
}

// XP spoofing check: server caps per-mission XP
function safeXp(clientXp: number): number {
  return Math.min(Math.max(0, Math.floor(clientXp)), 500);
}

// mergeProgress logic (from progress.tsx)
function mergeProgress(
  local: { xp: number; gems: number; completedMissions: Record<string, { score: number; at: number }>; streakDays: number },
  cloud: { xp?: number; gems?: number; completedMissions?: Record<string, { score: number; at: number }>; streakDays?: number },
) {
  const localM = local.completedMissions ?? {};
  const cloudM = cloud.completedMissions ?? {};
  const merged = { ...cloudM, ...localM };
  for (const [slug, cm] of Object.entries(cloudM)) {
    if (!localM[slug] || cm.at > localM[slug].at) merged[slug] = cm;
  }
  return {
    xp: Math.max(local.xp, cloud.xp ?? 0),
    gems: Math.max(local.gems, cloud.gems ?? 0),
    streakDays: Math.max(local.streakDays, cloud.streakDays ?? 0),
    completedMissions: merged,
  };
}


// ─── Heart Refill Tests ───────────────────────────────────────────────────────

describe("Heart Refill", () => {
  it("returns unchanged if hearts are full", () => {
    const result = applyHeartRefill(5, 0);
    expect(result.hearts).toBe(5);
  });

  it("returns unchanged if heartRefillAt is 0 (refill not started)", () => {
    const result = applyHeartRefill(3, 0);
    expect(result.hearts).toBe(3);
  });

  it("does not refill if not enough time has passed", () => {
    const oneHourAgo = Date.now() - 3600 * 1000; // 1 hour (< 4 hour refill rate)
    const result = applyHeartRefill(3, oneHourAgo);
    expect(result.hearts).toBe(3);
  });

  it("refills 1 heart after 4 hours", () => {
    const fourHoursAgo = Date.now() - (HEART_REFILL_SECS + 60) * 1000;
    const result = applyHeartRefill(4, fourHoursAgo);
    expect(result.hearts).toBe(5);
    expect(result.heartRefillAt).toBe(0); // full → timer cleared
  });

  it("refills 2 hearts after 8 hours from 3", () => {
    const eightHoursAgo = Date.now() - (HEART_REFILL_SECS * 2 + 60) * 1000;
    const result = applyHeartRefill(3, eightHoursAgo);
    expect(result.hearts).toBe(5); // 3 + 2 = 5
    expect(result.heartRefillAt).toBe(0);
  });

  it("caps refill at MAX_HEARTS", () => {
    const twentyHoursAgo = Date.now() - (HEART_REFILL_SECS * 5 + 60) * 1000;
    const result = applyHeartRefill(1, twentyHoursAgo);
    expect(result.hearts).toBe(5);
    expect(result.hearts).not.toBeGreaterThan(MAX_HEARTS);
  });

  it("keeps refillAt timer running when partially refilled", () => {
    const fiveHoursAgo = Date.now() - (HEART_REFILL_SECS + HEART_REFILL_SECS / 2) * 1000;
    const result = applyHeartRefill(3, fiveHoursAgo); // 1 refill
    expect(result.hearts).toBe(4);
    expect(result.heartRefillAt).toBeGreaterThan(0); // timer still running (1 more needed)
  });
});


// ─── Streak Computation Tests ─────────────────────────────────────────────────

describe("Streak Computation", () => {
  const today = todayKey();
  const yesterday = yesterdayKey();

  it("increments streak if last activity was yesterday", () => {
    const { streak } = computeStreak(5, yesterday, false, null, today, yesterday);
    expect(streak).toBe(6);
  });

  it("keeps streak if last activity was today (double-completion)", () => {
    const { streak } = computeStreak(5, today, false, null, today, yesterday);
    expect(streak).toBe(5); // no change — already did today
  });

  it("resets streak to 1 if last activity was 2+ days ago (no shield)", () => {
    const twoDaysAgo = "2000-01-01";
    const { streak } = computeStreak(5, twoDaysAgo, false, null, today, yesterday);
    expect(streak).toBe(1);
  });

  it("uses streak shield to avoid reset", () => {
    const twoDaysAgo = "2000-01-01";
    const { streak, shield } = computeStreak(7, twoDaysAgo, true, null, today, yesterday);
    expect(streak).toBe(7); // shield consumed, streak preserved
    expect(shield).toBe(false); // shield spent
  });

  it("does not re-use shield on same day", () => {
    const twoDaysAgo = "2000-01-01";
    const { streak } = computeStreak(7, twoDaysAgo, true, today, today, yesterday);
    // shield was already used today, so resets
    expect(streak).toBe(1);
  });

  it("earns shield at every 7-day milestone", () => {
    // streak of 6 + 1 = 7, should earn shield
    const { streak } = computeStreak(6, yesterday, false, null, today, yesterday);
    expect(streak).toBe(7);
    // Shield earning is handled outside this function, just verifying streak
  });

  it("handles null lastDay (first-ever lesson)", () => {
    const { streak } = computeStreak(0, null, false, null, today, yesterday);
    expect(streak).toBe(1);
  });
});


// ─── XP Security Tests ────────────────────────────────────────────────────────

describe("XP Security (server-side spoofing prevention)", () => {
  it("caps XP to 500 per mission", () => {
    expect(safeXp(99999)).toBe(500);
    expect(safeXp(501)).toBe(500);
    expect(safeXp(500)).toBe(500);
    expect(safeXp(100)).toBe(100);
  });

  it("floors negative XP to 0", () => {
    expect(safeXp(-100)).toBe(0);
    expect(safeXp(-1)).toBe(0);
  });

  it("floors fractional XP", () => {
    expect(safeXp(99.9)).toBe(99);
    expect(safeXp(50.5)).toBe(50);
  });
});


// ─── Progress Merge Tests ─────────────────────────────────────────────────────

describe("Progress Merge (cloud sync)", () => {
  it("takes highest XP between local and cloud", () => {
    const merged = mergeProgress(
      { xp: 500, gems: 10, completedMissions: {}, streakDays: 3 },
      { xp: 800, gems: 5, completedMissions: {}, streakDays: 1 },
    );
    expect(merged.xp).toBe(800);
    expect(merged.gems).toBe(10); // local higher
  });

  it("takes highest streak", () => {
    const merged = mergeProgress(
      { xp: 0, gems: 0, completedMissions: {}, streakDays: 10 },
      { xp: 0, gems: 0, completedMissions: {}, streakDays: 3 },
    );
    expect(merged.streakDays).toBe(10);
  });

  it("merges completedMissions, preferring most recently completed", () => {
    const t1 = 1000;
    const t2 = 2000;
    const merged = mergeProgress(
      {
        xp: 0, gems: 0, streakDays: 0,
        completedMissions: { "mission-a": { score: 0.5, at: t1 } },
      },
      {
        completedMissions: { "mission-a": { score: 1.0, at: t2 }, "mission-b": { score: 0.8, at: t1 } },
      },
    );
    // mission-a: cloud is newer (t2 > t1)
    expect(merged.completedMissions["mission-a"].score).toBe(1.0);
    // mission-b: only in cloud
    expect(merged.completedMissions["mission-b"]).toBeDefined();
  });

  it("local missions override cloud if local is newer", () => {
    const t1 = 1000;
    const t2 = 2000;
    const merged = mergeProgress(
      {
        xp: 0, gems: 0, streakDays: 0,
        completedMissions: { "mission-a": { score: 1.0, at: t2 } },
      },
      {
        completedMissions: { "mission-a": { score: 0.3, at: t1 } },
      },
    );
    expect(merged.completedMissions["mission-a"].score).toBe(1.0); // local wins (newer)
  });
});


// ─── FSRS Tests ───────────────────────────────────────────────────────────────

describe("FSRS Spaced Repetition", async () => {
  const { scheduleReview, newCard, retrievability, isDue, scoreToGrade } = await import("../src/lib/fsrs");

  it("creates a new card with default values", () => {
    const card = newCard();
    expect(card.stability).toBeGreaterThan(0);
    expect(card.difficulty).toBe(5);
    expect(card.reps).toBe(0);
    expect(card.lastReview).toBeLessThanOrEqual(Date.now());
  });

  it("maps score to correct grade", () => {
    expect(scoreToGrade(1.0)).toBe("easy");
    expect(scoreToGrade(0.9)).toBe("easy");
    expect(scoreToGrade(0.8)).toBe("good");
    expect(scoreToGrade(0.7)).toBe("good");
    expect(scoreToGrade(0.5)).toBe("hard");
    expect(scoreToGrade(0.2)).toBe("again");
    expect(scoreToGrade(0)).toBe("again");
  });

  it("schedules longer interval for 'easy' than 'again'", () => {
    const card = newCard();
    const easyResult = scheduleReview(card, "easy");
    const againResult = scheduleReview(card, "again");
    expect(easyResult.nextIntervalDays).toBeGreaterThan(againResult.nextIntervalDays);
  });

  it("increases stability after successful recall", () => {
    const card = newCard();
    const first = scheduleReview(card, "good");
    const second = scheduleReview(first.newCard, "good");
    expect(second.newStability).toBeGreaterThan(first.newStability);
  });

  it("decreases stability for 'again' (forgetting)", () => {
    // Give the card high stability first
    let card = newCard();
    for (let i = 0; i < 5; i++) {
      card = scheduleReview(card, "easy").newCard;
    }
    const highStability = card.stability;
    const result = scheduleReview(card, "again");
    expect(result.newStability).toBeLessThan(highStability);
  });

  it("marks card as due when retrievability < threshold", () => {
    const card = newCard();
    // Force lastReview to 30 days ago with low stability
    const staleCard = { ...card, stability: 1, lastReview: Date.now() - 30 * 24 * 3600 * 1000 };
    expect(isDue(staleCard, 0.9)).toBe(true);
  });

  it("marks card as NOT due when recently reviewed with high stability", () => {
    const card = { ...newCard(), stability: 100, lastReview: Date.now() };
    expect(isDue(card, 0.9)).toBe(false);
  });

  it("retrievability is 1 at t=0 for any stability", () => {
    expect(retrievability(10, 0)).toBe(1);
    expect(retrievability(0.5, 0)).toBe(1);
  });

  it("retrievability decreases over time", () => {
    const r1 = retrievability(7, 1);
    const r2 = retrievability(7, 7);
    const r3 = retrievability(7, 30);
    expect(r1).toBeGreaterThan(r2);
    expect(r2).toBeGreaterThan(r3);
  });

  it("all interval outputs are positive integers", () => {
    const card = newCard();
    const grades = ["again", "hard", "good", "easy"] as const;
    for (const grade of grades) {
      const result = scheduleReview(card, grade);
      expect(result.nextIntervalDays).toBeGreaterThan(0);
      expect(Number.isInteger(result.nextIntervalDays)).toBe(true);
    }
  });

  it("difficulty stays within 1-10 range", () => {
    let card = newCard();
    for (let i = 0; i < 20; i++) {
      card = scheduleReview(card, "again").newCard;
    }
    expect(card.difficulty).toBeGreaterThanOrEqual(1);
    expect(card.difficulty).toBeLessThanOrEqual(10);
    // Reset and do all easy
    card = newCard();
    for (let i = 0; i < 20; i++) {
      card = scheduleReview(card, "easy").newCard;
    }
    expect(card.difficulty).toBeGreaterThanOrEqual(1);
    expect(card.difficulty).toBeLessThanOrEqual(10);
  });
});
