"use client";
/**
 * "In your DAW" (10 Nov): pick Live, FL Studio or Logic and see where the controls from this lesson are, on a
 * drawing of that program's top bar, with how to use each one. Tap a control to light it on the bar.
 * Your pick is kept for every lesson. Photos and videos come with the DAW packs.
 */
import { useEffect, useState } from "react";
import { DAWS, DAW_TOPICS, type DawId } from "@/content/daw";

const KEY = "ccd.daw";
const ZONES = ["left", "middle", "right", "editor"] as const;

export function DawPanel({ topics, intro }: { topics: string[]; intro?: string }) {
  const [daw, setDaw] = useState<DawId>("live");
  const [on, setOn] = useState(topics[0]);
  useEffect(() => { try { const v = localStorage.getItem(KEY) as DawId | null; if (v && DAWS.some(d => d.id === v)) setDaw(v); } catch { /* none */ } }, []);
  const pick = (d: DawId) => { setDaw(d); try { localStorage.setItem(KEY, d); } catch { /* none */ } };
  const cur = DAW_TOPICS[on]?.[daw];
  return (
    <div className="daw">
      {intro ? <p className="daw-intro">{intro}</p> : null}
      <div className="daw-tabs" role="tablist" aria-label="Your music program">
        {DAWS.map(d => <button key={d.id} type="button" role="tab" aria-selected={daw === d.id} className={daw === d.id ? "is-on" : ""} onClick={() => pick(d.id)}>{d.name}</button>)}
      </div>
      {/* a drawing of the program: its top bar in three zones, and the editor area below */}
      <div className={`daw-app is-${daw}`} aria-hidden>
        <div className="daw-bar">
          {ZONES.slice(0, 3).map(z => (
            <div key={z} className="daw-zone">
              {topics.filter(t => DAW_TOPICS[t][daw].zone === z).map(t => <span key={t} className={`daw-ctl ${on === t ? "is-on" : ""}`}>{DAW_TOPICS[t][daw].name}</span>)}
            </div>
          ))}
        </div>
        <div className="daw-editor">
          {topics.filter(t => DAW_TOPICS[t][daw].zone === "editor").map(t => <span key={t} className={`daw-ctl ${on === t ? "is-on" : ""}`}>{DAW_TOPICS[t][daw].name}</span>)}
          {!topics.some(t => DAW_TOPICS[t][daw].zone === "editor") ? <i>tracks and clips</i> : null}
        </div>
      </div>
      <div className="daw-list" role="group" aria-label="Controls in this lesson">
        {topics.map(t => (
          <button key={t} type="button" className={`daw-item ${on === t ? "is-on" : ""}`} aria-pressed={on === t} onClick={() => setOn(t)}>
            <b>{DAW_TOPICS[t][daw].name}</b><span>{DAW_TOPICS[t].label}</span>
          </button>
        ))}
      </div>
      {cur ? <p className="daw-how"><b>{cur.name}.</b> {cur.how}</p> : null}
    </div>
  );
}
