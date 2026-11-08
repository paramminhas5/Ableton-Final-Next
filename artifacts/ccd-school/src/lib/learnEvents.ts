/**
 * Learning analytics: the events that say whether the school teaches (where learners stop, which steps
 * take many checks or get skipped, who comes back the next day). No new keys or services:
 * - every event goes to the product analytics wrapper (PostHog when its key is set, else nothing),
 * - a few go to Vercel Web Analytics as custom events (sent only once Web Analytics is switched on for the
 *   project; until then the call does nothing useful and costs nothing),
 * - and every event is kept on the device in a queue, sent to /api/learn/events (our own database, the
 *   existing progress_events table) once the learner is signed in. Signed out, they wait on the device.
 * A short log stays on the device too, so the admin view can show this device's funnel without a database.
 */
import { track as vercelTrack } from "@vercel/analytics";
import { track } from "./analytics";

import type { LearnEventName } from "./learnFunnel";

export type { LearnEventName };
export type LearnEvent = { e: LearnEventName; t: number; p: Record<string, string | number | boolean | null> };
const QUEUE = "ccd.learn.q.v1";
const LOG = "ccd.learn.log.v1";
const MAX_QUEUE = 600, MAX_LOG = 2000;
/** Sent to Vercel as custom events (its plans cap custom events, so only the few that matter most). */
const TO_VERCEL = new Set<LearnEventName>(["lesson_started", "lesson_finished", "placement_result", "came_back_next_day", "challenge_done"]);
export const LEARN_EVENT = "ccd:learn";

function read(key: string): LearnEvent[] {
  try { const a = JSON.parse(localStorage.getItem(key) ?? "[]"); return Array.isArray(a) ? a : []; } catch { return []; }
}
function write(key: string, a: LearnEvent[]) {
  try { localStorage.setItem(key, JSON.stringify(a)); } catch { /* storage full or blocked */ }
}

/** Only flat, small values travel: strings cut to 80 characters, numbers rounded to 3 places. */
function clean(p: Record<string, unknown>): LearnEvent["p"] {
  const out: LearnEvent["p"] = {};
  for (const [k, v] of Object.entries(p)) {
    if (v === undefined) continue;
    if (typeof v === "number") out[k] = Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null;
    else if (typeof v === "boolean" || v === null) out[k] = v;
    else out[k] = String(v).slice(0, 80);
  }
  return out;
}

/** Record one learning event. Never throws. */
export function learn(e: LearnEventName, props: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const p = clean(props);
  const ev: LearnEvent = { e, t: Date.now(), p };
  // Named learn_* in product analytics, so they never double up with the older events of the same idea.
  try { track(`learn_${e}`, p); } catch { /* analytics must never break the app */ }
  if (TO_VERCEL.has(e)) { try { vercelTrack(e, p); } catch { /* not switched on */ } }
  const q = read(QUEUE); q.push(ev); write(QUEUE, q.slice(-MAX_QUEUE));
  const log = read(LOG); log.push(ev); write(LOG, log.slice(-MAX_LOG));
  try { window.dispatchEvent(new CustomEvent(LEARN_EVENT, { detail: ev })); } catch { /* old browser */ }
}

/** Events not yet sent, oldest first. */
export const pendingEvents = () => read(QUEUE);
/** Forget the first `n` queued events (they reached the server). */
export function dropSent(n: number) { write(QUEUE, read(QUEUE).slice(n)); }
/** This device's log, for the admin view's "this device". */
export const localLog = () => read(LOG);

// ── a step's result, handed from the step that knows it (match, copy) to the player that records it ──
let result: Record<string, unknown> | null = null;
/** A step reports how it went (checks, hints, stars); the player adds it to that step's step_done. */
export function stepResult(r: Record<string, unknown>) { result = r; }
export function takeStepResult(): Record<string, unknown> | null { const r = result; result = null; return r; }

// ── coming back ──────────────────────────────────────────────────────────────
const DAYS = "ccd.learn.days.v1";
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
/**
 * Called once per app load: notes today as a day the learner was here and, the first time today, says
 * whether they came back and after how long ("came_back", and "came_back_next_day" when the last visit was
 * yesterday). Days are local. Returns what it recorded, for tests.
 */
export function noteVisit(now = new Date()): LearnEventName[] {
  let days: string[] = [];
  try { days = JSON.parse(localStorage.getItem(DAYS) ?? "[]"); if (!Array.isArray(days)) days = []; } catch { days = []; }
  const today = dayKey(now);
  if (days.includes(today)) return [];
  const last = days[days.length - 1];
  const out: LearnEventName[] = [];
  if (last) {
    const gap = Math.round((new Date(`${today}T12:00:00`).getTime() - new Date(`${last}T12:00:00`).getTime()) / 86400000);
    learn("came_back", { gapDays: gap, visits: days.length + 1 });
    out.push("came_back");
    if (gap === 1) { learn("came_back_next_day", { visits: days.length + 1 }); out.push("came_back_next_day"); }
  }
  try { localStorage.setItem(DAYS, JSON.stringify([...days, today].slice(-60))); } catch { /* blocked */ }
  return out;
}
