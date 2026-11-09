"use client";
/**
 * The studio's arrange mode (9 Nov, night): your song as sections, left to right, as long as they last.
 * Rows are your parts; tap a cell to switch a part off or on in that section. Tap a section's name to edit
 * its loop in create. Copy the loop into a new section (commit) to make a variation without losing the first.
 * With no sections yet, it shows what commit does: your loop becomes section a, its copy section b.
 */
import { type CSSProperties } from "react";
import { commitLoop, goSection, sectionNow, type Section } from "@/lib/arrange";
import { TYPE, type TrackV2 } from "@/lib/track2";
import { Icon } from "./controls";
import "./arrange.css";

export function ArrangeView({ track, update, onEdit, playingSection }: { track: TrackV2; update: (fn: (t: TrackV2) => TrackV2) => void; onEdit: () => void; playingSection: number }) {
  const secs: Section[] = track.sections ?? [];
  const now = sectionNow(track)?.index ?? -1;
  const parts = track.layers.filter(l => l.events.length || secs.some(s => s.notes?.[l.id]?.length));
  const bars = secs.reduce((a, s) => a + s.bars, 0);
  const toggle = (si: number, id: string) => update(t => ({ ...t, sections: (t.sections ?? []).map((s, i) => (i === si ? { ...s, off: s.off.includes(id) ? s.off.filter(o => o !== id) : [...s.off, id] } : s)) }));

  if (!secs.length) {
    return (
      <div className="av">
        <div className="av-how" aria-label="What copy to a new section does">
          <div className="av-blk is-now"><b>your loop</b><Lanes parts={parts} /></div>
          <Icon name="play" small />
          <div className="av-blk is-now"><b>a</b><Lanes parts={parts} /></div>
          <div className="av-blk is-new"><b>b</b><Lanes parts={parts} /></div>
        </div>
        <p className="av-line">copy your loop into a new section, change it, and your song gets a second part.</p>
        <button type="button" className="m1-m is-wide av-go" onClick={() => { update(commitLoop); onEdit(); }}>
          <span className="m1-cap" style={{ width: 40, height: 40, flex: "none" }}><Icon name="plus" small /></span><span>copy loop to a new section</span>
        </button>
      </div>
    );
  }
  return (
    <div className="av">
      <div className="av-meta"><span>{secs.length} sections · {bars} bars</span><span>tap a cell to switch a part off there</span></div>
      <div className="av-grid" role="grid" aria-label="Your song's sections" style={{ gridTemplateColumns: `64px ${secs.map(s => `${s.bars}fr`).join(" ")}` }}>
        <span />
        {secs.map((s, i) => (
          <button key={i} type="button" className={`av-sec ${i === now ? "is-edit" : ""} ${i === playingSection ? "is-play" : ""}`} onClick={() => { update(t => goSection(t, i)); onEdit(); }} aria-label={`Edit section ${s.name}`}>
            <b>{s.name}</b><small>{s.bars} bars</small>
          </button>
        ))}
        {parts.map(l => (
          <div key={l.id} className="av-row" role="row" style={{ display: "contents" }}>
            <span className="av-part" style={{ ["--c" as string]: TYPE[l.type].color } as CSSProperties}><i />{TYPE[l.type].label}</span>
            {secs.map((s, i) => {
              const on = !s.off.includes(l.id);
              return <button key={i} type="button" role="gridcell" aria-pressed={on} aria-label={`${TYPE[l.type].label} in ${s.name}, ${on ? "on" : "off"}`} className={`av-cell ${on ? "is-on" : ""} ${i === playingSection ? "is-play" : ""}`} style={{ ["--c" as string]: TYPE[l.type].color } as CSSProperties} onClick={() => toggle(i, l.id)} />;
            })}
          </div>
        ))}
      </div>
      <div className="av-keys">
        <button type="button" className="m1-m is-wide av-go" onClick={() => { update(commitLoop); onEdit(); }}>
          <span className="m1-cap" style={{ width: 40, height: 40, flex: "none" }}><Icon name="plus" small /></span><span>copy {now >= 0 ? secs[now].name : "loop"} to a new section</span>
        </button>
      </div>
    </div>
  );
}

function Lanes({ parts }: { parts: TrackV2["layers"] }) {
  return <span className="av-mini" aria-hidden>{parts.slice(0, 5).map(l => <i key={l.id} style={{ ["--c" as string]: TYPE[l.type].color } as CSSProperties} />)}</span>;
}
