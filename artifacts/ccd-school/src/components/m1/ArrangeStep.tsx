"use client";
/**
 * Your song as sections. Rows are your parts, columns are sections; tap a cell to switch that part off or
 * on in that section, tap a section's fill to end it with a drum roll. It plays the whole arrangement, the
 * playing section lit. The export goal adds a download of the song as midi and a rename.
 */
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { FLAG, OUT } from "@/engine";
import type { LessonScreen } from "@/content/types";
import { arranged, sectionAt, startLayout, type Section } from "@/lib/arrange";
import { readTrackV2, writeTrackV2, TYPE, type TrackV2 } from "@/lib/track2";
import { downloadTrackV2Midi } from "@/lib/track2-midi";
import { readSongs, renameSong } from "@/lib/songs";
import { clipVariants } from "@/content/lessons/clipTracks";
import { GoPill, Icon, Key, NotYet, Screen } from "./controls";
import { Meta, useEnter } from "./LessonParts";
import { useEngineTrack } from "./useEngineTrack";
import { Gloss } from "./Gloss";

type Of<K> = Extract<LessonScreen, { kind: K }>;

const DRUMS = new Set(["drums", "hats"]);

export function ArrangeStep({ screen, accent, onNext, tail }: { screen: Of<"arrange">; accent: string; onNext: () => void; tail?: ReactNode }) {
  const [song, setSong] = useState<TrackV2 | null>(null);
  useEffect(() => {
    const t = readTrackV2();
    setSong(t.layers.some(l => l.events.length) ? t : clipVariants("four-on-the-floor")[0].track);
  }, []);
  const parts = useMemo(() => (song?.layers ?? []).filter(l => l.events.length), [song]);
  const [secs, setSecs] = useState<Section[]>([]);
  // A song with no arrangement yet starts from a layout that doesn't already answer the lesson: the learner
  // takes the drums out for the drop, adds the fills, switches the parts off. Hats count as drums.
  useEffect(() => { if (song) setSecs(song.sections?.length ? song.sections : startLayout(song, screen.goal)); }, [song]); // eslint-disable-line react-hooks/exhaustive-deps
  const shown = useMemo(() => (song ? { ...song, sections: secs } : readTrackV2()), [song, secs]);
  const { engine, ready } = useEngineTrack(shown);
  const [beat, setBeat] = useState(-1);
  useEffect(() => engine.on(evs => { for (const e of evs) if (e.kind === OUT.pos) setBeat(e.flags & FLAG.playing ? e.beat : -1); }), [engine]);
  useEffect(() => { if (!song) return; let gone = false; void ready().then(() => { if (!gone) { engine.metronome(false); engine.play(); } }).catch(() => { /* needs a tap */ }); return () => { gone = true; try { engine.stop(); } catch { /* not started */ } }; }, [!!song]); // eslint-disable-line react-hooks/exhaustive-deps
  const playing = beat >= 0;
  const now = playing && secs.length ? sectionAt(secs, beat) : -1;
  const toggle = (si: number, id: string) => setSecs(s => s.map((x, i) => (i === si ? { ...x, off: x.off.includes(id) ? x.off.filter(o => o !== id) : [...x.off, id] } : x)));
  const fill = (si: number) => setSecs(s => s.map((x, i) => (i === si ? { ...x, fill: !x.fill } : x)));
  const rise = (si: number) => setSecs(s => s.map((x, i) => (i === si ? { ...x, riser: !x.riser } : x)));
  const drums = parts.filter(l => DRUMS.has(l.type)).map(l => l.id);
  const onlyDrums = parts.length > 0 && parts.every(l => DRUMS.has(l.type));
  const met = screen.goal === "export" ? true
    : screen.goal === "fills" ? secs.some(s => s.fill)
    : screen.goal === "risers" ? secs.some(s => s.riser)
    : screen.goal === "drop" ? secs.some((s, i) => i > 0 && drums.some(d => secs[i - 1].off.includes(d)) && !drums.some(d => s.off.includes(d)))
    : secs.length >= 3 && secs.some(s => s.off.length > 0);
  const why = screen.goal === "risers" ? "tap riser on the section before a drop" : screen.goal === "fills" ? "tap fill on at least one section" : screen.goal === "drop" ? "take the drums out of one section and bring them back in the next" : "switch a part off in at least one section";
  const [say, setSay] = useState<string | null>(null);
  const [name, setName] = useState("");
  useEffect(() => { const i = readSongs(); setName(i.songs.find(s => s.id === i.active)?.name ?? "my song"); }, []);
  const keep = () => {
    if (!met) { setSay(why); window.setTimeout(() => setSay(null), 2600); return; }
    // Your song gets the arrangement. With nothing in your song yet, the starter loop you arranged becomes your song.
    if (song) {
      const now = readTrackV2();
      const has = now.layers.some(l => l.events.length);
      writeTrackV2(has ? { ...now, sections: secs, updatedAt: Date.now() } : { ...now, ...song, added: now.added, sections: secs, updatedAt: Date.now() });
      window.dispatchEvent(new Event("ccd:song"));
    }
    onNext();
  };
  useEnter(keep);
  const total = secs.reduce((n, s) => n + s.bars, 0);
  const secsLong = song ? Math.round((total * 4 * 60) / (song.bpm || 120)) : 0;
  return (
    <div className="ls-col">
      <div className="fl-inst" style={{ ["--c" as string]: accent } as CSSProperties}>
        <Screen>
          <Meta left={screen.goal === "export" ? "finish" : "your arrangement"} right={`${total} bars · ${Math.floor(secsLong / 60)}:${String(secsLong % 60).padStart(2, "0")}`} />
          <div className="ar-grid" style={{ gridTemplateColumns: `86px repeat(${secs.length}, minmax(0, 1fr))` }} role="grid" aria-label="Parts by section">
            <span />
            {secs.map((s, i) => <b key={i} className={now === i ? "is-now" : ""}>{s.name}<small>{s.bars} bars</small></b>)}
            {parts.map(l => (
              <div key={l.id} className="ar-row" role="row" style={{ display: "contents" }}>
                <span className="ar-part">{TYPE[l.type].label}</span>
                {secs.map((s, i) => {
                  const on = !s.off.includes(l.id);
                  return <button key={i} type="button" role="gridcell" aria-pressed={on} aria-label={`${TYPE[l.type].label} in ${s.name} ${i + 1}, ${on ? "on" : "off"}`} className={`ar-cell ${on ? "is-on" : ""} ${now === i ? "is-now" : ""}`} onClick={() => toggle(i, l.id)} />;
                })}
              </div>
            ))}
            <span className="ar-part">fill</span>
            {secs.map((s, i) => <button key={i} type="button" aria-pressed={!!s.fill} aria-label={`Fill at the end of ${s.name} ${i + 1}`} className={`ar-fill ${s.fill ? "is-on" : ""}`} onClick={() => fill(i)}>{s.fill ? "roll" : ""}</button>)}
            {(screen.goal === "risers" || screen.goal === "drop" || secs.some(s => s.riser)) && <span className="ar-part">riser</span>}
            {(screen.goal === "risers" || screen.goal === "drop" || secs.some(s => s.riser)) && secs.map((s, i) => <button key={`r${i}`} type="button" aria-pressed={!!s.riser} aria-label={`Riser at the end of ${s.name} ${i + 1}`} className={`ar-fill ${s.riser ? "is-on" : ""}`} onClick={() => rise(i)}>{s.riser ? "rise" : ""}</button>)}
          </div>
        </Screen>
        <div className="fl-again" style={{ justifyContent: "flex-start", marginTop: 10 }}>
          <button type="button" className="ls-chip" onClick={() => song && setSecs(startLayout(song, screen.goal))}>start over</button>
          {screen.goal === "export" && song && <button type="button" className="ls-chip" onClick={() => downloadTrackV2Midi(arranged({ ...readTrackV2(), sections: secs }))}>download midi for live</button>}
        </div>
        {screen.goal === "export" && (
          <label className="ar-name"><span>song name</span><input value={name} maxLength={24} onChange={e => setName(e.target.value)} onBlur={() => { const i = readSongs(); renameSong(i.active, name); window.dispatchEvent(new Event("ccd:song")); }} /></label>
        )}
      </div>
      <div className="fl-text">
        {screen.body.split(/\n+/).map((para, i) => <p key={i} className="ls-read"><Gloss>{para}</Gloss></p>)}
        {screen.hint ? <div className="ls-hint"><Gloss>{screen.hint}</Gloss></div> : null}
        {onlyDrums && (screen.goal === "drop" || screen.goal === "risers") ? <div className="ls-hint">your song is only drums so far, so a break with the drums out is silence. tap riser on it so the break builds. once you add a lead or chords, they float there.</div> : null}
        {say ? <div className="ls-hint" role="status">{say}</div> : null}
        {tail}
      </div>
      <div className="ls-bottom">
        <div className="m1-g">
          <Key label={playing ? "stop" : "play"} onClick={async () => { if (playing) { engine.stop(); return; } await ready(); engine.play(); }} ariaPressed={playing} ariaLabel={playing ? "Stop" : "Play the arrangement"}><Icon name={playing ? "stop" : "play"} /></Key>
          <GoPill onClick={keep} style={{ gridColumn: "span 3", opacity: met ? 1 : 0.6 }} ariaLabel={met ? "Keep this arrangement" : `Not yet: ${why}`}>{met ? (screen.goal === "export" ? "finish" : "keep this") : <NotYet why={why} />}</GoPill>
        </div>
      </div>
    </div>
  );
}
