"use client";
/** Settings: voice, level, interface sounds, learning mode, and a way back to the old build. */
import { useEffect, type CSSProperties } from "react";
import { GoPill, Silk, Switch } from "./controls";
import { ListRow, RefPage } from "./parts";
import { useProgress } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import {
  OLD_UI_URL, difficultyFromLevel, levelFromDifficulty, usePrefs, PREFS_KEY,
  type Level, type Voice,
} from "@/lib/prefs";

const VOICES: { id: Voice; name: string; sample: string }[] = [
  { id: "mentor", name: "mentor", sample: "Take your time. Listen first, then we'll name what you heard." },
  { id: "straight", name: "straight", sample: "Listen. Then name it." },
  { id: "eli5", name: "eli5", sample: "It is just a big thump, like a heartbeat for the song." },
];

const LEVELS: { id: Level; name: string; line: string }[] = [
  { id: "gentle", name: "gentle", line: "more hints, and a miss never costs you." },
  { id: "standard", name: "standard", line: "the usual pace, hints when you ask." },
  { id: "hard", name: "hard", line: "fewer hints, and the ear has to be right." },
];

const quote: CSSProperties = { fontStyle: "italic" };

export function Settings() {
  const [prefs, setPrefs] = usePrefs();
  const { progress, setDifficulty } = useProgress();
  const { learnMode, setLearnMode } = useLearnMode();

  // First visit: if the old hints setting was already on hard, carry it over once.
  useEffect(() => {
    try {
      if (localStorage.getItem(PREFS_KEY) === null && levelFromDifficulty(progress.difficulty) === "hard") setPrefs({ level: "hard" });
    } catch { /* storage blocked */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pickLevel = (level: Level) => {
    setPrefs({ level });
    if (progress.difficulty !== difficultyFromLevel(level)) setDifficulty(difficultyFromLevel(level));
  };

  return (
    <RefPage title="settings" back="/profile" meta="how it talks to you" intro="pick the voice and the pace. you can change these any time, even in the middle of a lesson.">
      <Silk label="voice" />
      <div role="radiogroup" aria-label="Voice">
        {VOICES.map(v => (
          <ListRow key={v.id} led={prefs.voice === v.id ? "var(--led-go)" : undefined}
            title={v.name} sub={<span style={quote}>{v.sample}</span>}
            right={<span className="m1-t11">{prefs.voice === v.id ? "on" : ""}</span>}
            onClick={() => setPrefs({ voice: v.id })} />
        ))}
      </div>

      <Silk label="level" />
      <div role="radiogroup" aria-label="Level">
        {LEVELS.map(l => (
          <ListRow key={l.id} led={prefs.level === l.id ? "var(--led-mint)" : undefined}
            title={l.name} sub={l.line}
            right={<span className="m1-t11">{prefs.level === l.id ? "on" : ""}</span>}
            onClick={() => pickLevel(l.id)} />
        ))}
      </div>

      <Silk label="sound and mode" />
      <ListRow led={prefs.sound ? "var(--led-mint)" : undefined} title="interface sounds" sub="the little clicks and chimes. music always plays."
        right={<div style={{ width: 124 }}><Switch label="Interface sounds" value={prefs.sound ? "on" : "off"} onChange={id => setPrefs({ sound: id === "on" })}
          options={[{ id: "on", label: "on" }, { id: "off", label: "off" }]} /></div>} />
      <ListRow led="var(--led-go)" title="learning mode" sub="flow keeps lessons in order with hearts. free opens everything."
        right={<div style={{ width: 124 }}><Switch label="Learning mode" value={learnMode === "flow" ? "flow" : "free"} onChange={id => setLearnMode(id === "flow" ? "flow" : "classic")}
          options={[{ id: "flow", label: "flow" }, { id: "free", label: "free" }]} /></div>} />

      <Silk label="elsewhere" />
      <ListRow title="old version" sub="the build from before the redesign, as it was." href={OLD_UI_URL}
        right={<span className="m1-t11">opens in github</span>} />

      <div style={{ marginTop: 16 }}><GoPill href="/dashboard">back to learning</GoPill></div>
    </RefPage>
  );
}
