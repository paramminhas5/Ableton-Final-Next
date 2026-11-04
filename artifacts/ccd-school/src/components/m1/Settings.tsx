"use client";
/** Settings: interface sounds, learning mode, and a way back to the old build. Voices live in each lesson step now. */
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
    <RefPage title="settings" back="/profile" meta="sound and how lessons open" intro={"lessons explain everything the first time. if a step doesn't land, every lesson has say it another way and simpler please right under the text."}>
      <Silk label="sound and mode" />
      <ListRow led={prefs.sound ? "var(--led-mint)" : undefined} title="interface sounds" sub="the little clicks and chimes. music always plays."
        right={<div style={{ width: 124 }}><Switch label="Interface sounds" value={prefs.sound ? "on" : "off"} onChange={id => setPrefs({ sound: id === "on" })}
          options={[{ id: "on", label: "on" }, { id: "off", label: "off" }]} /></div>} />
      <ListRow led="var(--led-mint)" title="learning mode" sub="journey takes lessons in order. see all opens every lesson at once."
        right={<div style={{ width: 124 }}><Switch label="Learning mode" value={learnMode === "flow" ? "flow" : "free"} onChange={id => setLearnMode(id === "flow" ? "flow" : "classic")}
          options={[{ id: "flow", label: "journey" }, { id: "free", label: "see all" }]} /></div>} />

      <Silk label="elsewhere" />
      <ListRow title="old version" sub="the build from before the redesign, as it was." href={OLD_UI_URL}
        right={<span className="m1-t11">opens in github</span>} />

      <div style={{ marginTop: 16 }}><GoPill href="/dashboard">back to learning</GoPill></div>
    </RefPage>
  );
}
