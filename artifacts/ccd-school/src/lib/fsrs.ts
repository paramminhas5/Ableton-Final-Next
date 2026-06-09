/**
 * fsrs.ts — Free Spaced Repetition Scheduler (FSRS v4) implementation.
 *
 * Reference: https://github.com/open-spaced-repetition/fsrs4anki
 *
 * FSRS models each card with three parameters:
 *   stability (S) — how long before 90% retention
 *   difficulty (D) — inherent card difficulty (1–10)
 *   retrievability (R) — current recall probability (0–1)
 *
 * After each review the scheduler outputs:
 *   nextIntervalDays — when to review next
 *   newStability     — updated S
 *   newDifficulty    — updated D
 *
 * We store {stability, difficulty, lastReview} per mission slug in progress.
 * `getLessonStrength` (already used throughout the app) maps R → 0–1.
 *
 * ---
 * The legacy strength model used:
 *   strength = 1.0 − (daysSince × 0.1)  [hits 0 after 10 days regardless of score]
 *
 * FSRS replaces this with an evidence-based memory model where:
 *   - Easy missions (high score repeatedly) get long intervals
 *   - Hard missions (low score) get short, frequent review
 *   - A lesson answered perfectly 5 times may not need review for 30+ days
 *   - A lesson always answered wrong stays in daily review
 */

// ─── FSRS parameters (default v4 weights) ────────────────────────────────────
const W = [
  0.4,    // w0 — initial stability for "again"
  0.6,    // w1
  2.4,    // w2
  5.8,    // w3 — initial stability for "easy"
  4.93,   // w4
  0.94,   // w5
  0.86,   // w6
  0.01,   // w7
  1.49,   // w8
  0.14,   // w9
  0.94,   // w10
  2.18,   // w11
  0.05,   // w12
  0.34,   // w13
  1.26,   // w14
  0.29,   // w15
  2.61,   // w16
];

export type FSRSGrade = "again" | "hard" | "good" | "easy";

export interface FSRSCard {
  stability: number;    // days until 90% retention
  difficulty: number;   // 1–10, higher = harder
  lastReview: number;   // Unix ms timestamp
  reps: number;         // total reviews
}

// Map our 0-1 score to FSRS grade
export function scoreToGrade(score: number): FSRSGrade {
  if (score >= 0.9) return "easy";
  if (score >= 0.7) return "good";
  if (score >= 0.4) return "hard";
  return "again";
}

// Retrievability at time t given stability S
export function retrievability(stability: number, daysSince: number): number {
  return Math.pow(1 + daysSince / (9 * stability), -1);
}

// Get current strength (0–1) for display — maps R directly
export function fsrsStrength(card: FSRSCard): number {
  const daysSince = (Date.now() - card.lastReview) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.min(1, retrievability(card.stability, daysSince)));
}

// Whether the card is due for review (R < 0.9 threshold)
export function isDue(card: FSRSCard, threshold = 0.9): boolean {
  return fsrsStrength(card) < threshold;
}

// Initial card state for a brand-new item
export function newCard(): FSRSCard {
  return { stability: W[2], difficulty: 5, lastReview: Date.now(), reps: 0 };
}

// ─── Core scheduling function ─────────────────────────────────────────────────

export interface FSRSResult {
  nextIntervalDays: number;
  newStability: number;
  newDifficulty: number;
  newCard: FSRSCard;
}

export function scheduleReview(card: FSRSCard, grade: FSRSGrade): FSRSResult {
  const gradeIdx = { again: 0, hard: 1, good: 2, easy: 3 }[grade];
  // Use at least 0.001 days (~1.4 min) so R < 1.0 and the recall formula
  // always produces a meaningful stability increase even in rapid-fire tests.
  const daysSince = Math.max(0.001, (Date.now() - card.lastReview) / (1000 * 60 * 60 * 24));

  // ── Difficulty update ────────────────────────────────────────────────────────
  const gradeValue = [1, 2, 3, 4][gradeIdx]; // 1=again, 4=easy
  const newDifficulty = Math.max(
    1,
    Math.min(
      10,
      card.difficulty + W[4] * (gradeValue - 3) - W[5] * card.difficulty * (gradeValue - 3),
    ),
  );

  // ── Stability update ─────────────────────────────────────────────────────────
  let newStability: number;

  if (card.reps === 0) {
    // First review — use initial stability lookup
    newStability = [W[0], W[1], W[2], W[3]][gradeIdx];
  } else {
    const R = retrievability(card.stability, daysSince);
    const D = newDifficulty;
    const S = card.stability;

    if (grade === "again") {
      // Forgetting — stability reset with difficulty penalty
      newStability = W[11] * Math.pow(D, -W[12]) * (Math.pow(S + 1, W[13]) - 1) * Math.exp(W[14] * (1 - R));
    } else {
      // Recall — stability increases based on difficulty, current stability, and retrievability
      const modifer = grade === "easy" ? W[6] : grade === "hard" ? W[15] : 1;
      newStability =
        S *
        (Math.exp(W[8]) *
          (11 - D) *
          Math.pow(S, -W[9]) *
          (Math.exp(W[10] * (1 - R)) - 1) *
          modifer +
          1);
    }
  }

  newStability = Math.max(0.1, Math.min(365, newStability));

  // ── Interval ─────────────────────────────────────────────────────────────────
  // Target 90% retrievability at next review
  const intervalDays = Math.round(newStability * 9);
  const nextIntervalDays = Math.max(1, intervalDays);

  const updated: FSRSCard = {
    stability: newStability,
    difficulty: newDifficulty,
    lastReview: Date.now(),
    reps: card.reps + 1,
  };

  return {
    nextIntervalDays,
    newStability,
    newDifficulty,
    newCard: updated,
  };
}

// ─── Integration helpers for progress.tsx ────────────────────────────────────

/**
 * Called when a mission is completed for the first time.
 * Initialises or updates the FSRS card for that mission.
 */
export function completionToFSRS(score: number, existing?: FSRSCard): FSRSCard {
  const grade = scoreToGrade(score);
  if (!existing || existing.reps === 0) {
    const card = newCard();
    return scheduleReview(card, grade).newCard;
  }
  return scheduleReview(existing, grade).newCard;
}

/**
 * Called during a review session.
 */
export function reviewToFSRS(score: number, existing: FSRSCard): FSRSResult {
  const grade = scoreToGrade(score);
  return scheduleReview(existing, grade);
}

/**
 * Get missions sorted by urgency (most due first).
 * Used to power the Review page queue.
 */
export function getMissionsNeedingReview(
  cards: Record<string, FSRSCard>,
  threshold = 0.9,
): string[] {
  return Object.entries(cards)
    .filter(([, card]) => isDue(card, threshold))
    .sort(([, a], [, b]) => fsrsStrength(a) - fsrsStrength(b)) // weakest first
    .map(([slug]) => slug);
}

/**
 * Backward-compat: convert old LessonStrength format to FSRSCard.
 * Called during progress hydration.
 */
export function legacyStrengthToFSRS(legacy: { strength: number; lastReviewed: number }): FSRSCard {
  return {
    stability: Math.max(0.1, legacy.strength * 10), // rough mapping: 1.0 → 10 days
    difficulty: 5,
    lastReview: legacy.lastReviewed,
    reps: 1,
  };
}
