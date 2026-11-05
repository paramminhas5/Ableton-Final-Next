"use client";
/**
 * The studio's "elsewhere" line under the big readout: what the knob you just turned is called on other
 * instruments (src/lib/controlNames.ts). On a phone one line holds about two names, so the line is a key:
 * tap it and the whole list opens over the screen, wrapped, without the screen changing height; tap again
 * (or turn another knob) and it closes.
 */
import { useEffect, useState } from "react";
import { CONTROLS, elsewhereLine } from "@/lib/controlNames";

export function ElsewhereLine({ ctl }: { ctl: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [ctl]);
  const short = elsewhereLine(ctl, 2);
  const all = CONTROLS[ctl]?.elsewhere ?? [];
  if (!short) return null;
  const more = all.length > 2;
  return (
    <>
      <button type="button" className="st-else" aria-expanded={open} aria-label={`same control elsewhere: ${elsewhereLine(ctl, 8)}`} onClick={() => setOpen(o => !o)}>
        <span className="st-else-t">elsewhere · {short}</span>
        <span className="st-else-m" aria-hidden>{more ? `+${all.length - 2}` : "more"}</span>
      </button>
      {open ? (
        <button type="button" className="st-elsepop" onClick={() => setOpen(false)} aria-label="Close the list">
          <span className="st-elsepop-h">same control elsewhere</span>
          <span className="st-elsepop-b">{all.slice(0, 8).map(([w, n], i) => <span key={w + n}>{i ? " · " : ""}<b>{w}</b>: {n}</span>)}</span>
        </button>
      ) : null}
    </>
  );
}
