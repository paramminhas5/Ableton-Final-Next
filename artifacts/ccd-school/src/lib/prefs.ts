"use client";
/**
 * Learner preferences: the voice lessons speak in, how hard they push, interface sounds.
 * Stored in localStorage `ccd.prefs.v1` (voice and level). Sounds stay in the existing
 * `ccd.uisound` key that audio.ts reads, so there is one source of truth for them.
 * The progress store's `difficulty` maps in: normal = standard, hard = hard.
 */
import { useCallback, useSyncExternalStore } from "react";

export type Voice = "mentor" | "straight" | "eli5";
export type Level = "gentle" | "standard" | "hard";
export type Prefs = { voice: Voice; level: Level; sound: boolean };

export const VOICES: readonly Voice[] = ["mentor", "straight", "eli5"];
export const LEVELS: readonly Level[] = ["gentle", "standard", "hard"];
export const DEFAULT_PREFS: Prefs = { voice: "mentor", level: "standard", sound: true };

export const PREFS_KEY = "ccd.prefs.v1";
const SOUND_KEY = "ccd.uisound"; // same key as audio.ts: "off" means off
const EVENT = "ccd:prefs";

/**
 * The old build, kept on its own branch. TODO(param): replace this with a deployed
 * preview URL once one exists; until then it points at the preserved branch on GitHub.
 */
export const OLD_UI_URL = "https://github.com/paramminhas5/Ableton-Final-Next/tree/school/final";

/** Progress `difficulty` as a level. */
export function levelFromDifficulty(d: "normal" | "hard" | undefined | null): Level {
  return d === "hard" ? "hard" : "standard";
}
/** A level as progress `difficulty` (gentle has no old equivalent, it counts as normal). */
export function difficultyFromLevel(l: Level): "normal" | "hard" {
  return l === "hard" ? "hard" : "normal";
}

/** Reads stored JSON defensively. Unknown or broken values fall back to the defaults. */
export function parsePrefs(raw: string | null | undefined, sound: boolean = DEFAULT_PREFS.sound): Prefs {
  let o: Record<string, unknown> = {};
  try {
    const v = raw ? JSON.parse(raw) : null;
    if (v && typeof v === "object") o = v as Record<string, unknown>;
  } catch { /* broken json: defaults */ }
  return {
    voice: VOICES.includes(o.voice as Voice) ? (o.voice as Voice) : DEFAULT_PREFS.voice,
    level: LEVELS.includes(o.level as Level) ? (o.level as Level) : DEFAULT_PREFS.level,
    sound,
  };
}

/** What goes into `ccd.prefs.v1`. Sound lives in its own key. */
export function serializePrefs(p: Prefs): string {
  return JSON.stringify({ voice: p.voice, level: p.level });
}

export function mergePrefs(cur: Prefs, patch: Partial<Prefs>): Prefs {
  return parsePrefsObject({ ...cur, ...patch });
}
function parsePrefsObject(p: Partial<Prefs>): Prefs {
  return {
    voice: VOICES.includes(p.voice as Voice) ? (p.voice as Voice) : DEFAULT_PREFS.voice,
    level: LEVELS.includes(p.level as Level) ? (p.level as Level) : DEFAULT_PREFS.level,
    sound: typeof p.sound === "boolean" ? p.sound : DEFAULT_PREFS.sound,
  };
}

function rawStored(): { raw: string | null; sound: string | null } {
  try {
    return { raw: localStorage.getItem(PREFS_KEY), sound: localStorage.getItem(SOUND_KEY) };
  } catch {
    return { raw: null, sound: null };
  }
}

export function readPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  const s = rawStored();
  return parsePrefs(s.raw, s.sound !== "off");
}

export function writePrefs(patch: Partial<Prefs>): Prefs {
  const next = mergePrefs(readPrefs(), patch);
  if (typeof window === "undefined") return next;
  try {
    localStorage.setItem(PREFS_KEY, serializePrefs(next));
    localStorage.setItem(SOUND_KEY, next.sound ? "on" : "off");
  } catch { /* storage blocked: the change lasts until reload */ memory = next; }
  try { window.dispatchEvent(new Event(EVENT)); } catch { /* ignore */ }
  return next;
}
let memory: Prefs | null = null;

// useSyncExternalStore needs a stable snapshot object while nothing changed.
let cache: { key: string; value: Prefs } = { key: "", value: DEFAULT_PREFS };
function snapshot(): Prefs {
  const base = readPrefs();
  const p = memory ?? base;
  const key = `${p.voice}|${p.level}|${p.sound}`;
  if (key !== cache.key) cache = { key, value: p };
  return cache.value;
}
function subscribe(cb: () => void) {
  const on = (e: Event) => {
    if (e.type === EVENT) return cb();
    const k = (e as StorageEvent).key;
    if (k === null || k === PREFS_KEY || k === SOUND_KEY) { memory = null; cb(); }
  };
  window.addEventListener(EVENT, on);
  window.addEventListener("storage", on);
  return () => { window.removeEventListener(EVENT, on); window.removeEventListener("storage", on); };
}

/** [prefs, setPrefs]. Renders the defaults on the server and first paint, then the stored values. */
export function usePrefs(): readonly [Prefs, (patch: Partial<Prefs>) => void] {
  const prefs = useSyncExternalStore(subscribe, snapshot, () => DEFAULT_PREFS);
  const set = useCallback((patch: Partial<Prefs>) => { writePrefs(patch); }, []);
  return [prefs, set] as const;
}
