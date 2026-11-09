"use client";
/**
 * Simple or everything (9 Nov). Simple is the default: each screen shows what your lessons have taught you.
 * Everything shows every control, for people who already know. It is on from the start for anyone who places
 * past the basics in find your level. `?all=1` in the address turns it on for that visit (shots).
 */
import { useCallback, useEffect, useState } from "react";

const KEY = "ccd.everything";
const EVENT = "ccd:everything";

export function readEverything(): boolean {
  try {
    const q = new URLSearchParams(window.location.search).get("all");
    if (q === "1") return true;
    if (q === "0") return false;
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function useEverything(): [boolean, (v: boolean) => void] {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const r = () => setOn(readEverything());
    r();
    window.addEventListener(EVENT, r);
    return () => window.removeEventListener(EVENT, r);
  }, []);
  const set = useCallback((v: boolean) => {
    try { localStorage.setItem(KEY, v ? "1" : "0"); } catch { /* ignore */ }
    setOn(v);
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return [on, set];
}

export function EverythingSwitch({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="ev-sw" role="radiogroup" aria-label="How much to show">
      <button type="button" role="radio" aria-checked={!value} onClick={() => onChange(false)}>simple</button>
      <button type="button" role="radio" aria-checked={value} onClick={() => onChange(true)}>everything</button>
    </div>
  );
}

/** The compact header key (9 Nov, night): one tag-sized key with a light, "all" lit when everything shows. */
export function DepthKey({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" className={`hk ${value ? "is-on" : ""}`} aria-pressed={value} onClick={() => onChange(!value)}
      aria-label={value ? "Showing every control. Tap for simple" : "Simple: only what you've learnt. Tap to show every control"}>
      <i aria-hidden />all
    </button>
  );
}
