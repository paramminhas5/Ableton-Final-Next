"use client";
import { useState, useMemo } from "react";
import { Silk } from "@/components/m1/controls";
import { Chips, KeyCap, ListRow, RefPage, SearchField } from "@/components/m1/parts";

type Shortcut = { keys: string[]; desc: string; cat: string };

const SHORTCUTS: Shortcut[] = [
  { keys: ["Cmd/Ctrl", "Z"], desc: "Undo", cat: "General" },
  { keys: ["Cmd/Ctrl", "Shift", "Z"], desc: "Redo", cat: "General" },
  { keys: ["Cmd/Ctrl", "S"], desc: "Save Set", cat: "General" },
  { keys: ["Cmd/Ctrl", "Shift", "S"], desc: "Save Set As", cat: "General" },
  { keys: ["Cmd/Ctrl", "N"], desc: "New Set", cat: "General" },
  { keys: ["Cmd/Ctrl", "O"], desc: "Open Set", cat: "General" },
  { keys: ["Space"], desc: "Play/Stop", cat: "Transport" },
  { keys: ["F9"], desc: "Record", cat: "Transport" },
  { keys: ["Shift", "Space"], desc: "Play from selection", cat: "Transport" },
  { keys: ["Cmd/Ctrl", "Space"], desc: "Capture MIDI", cat: "Transport" },
  { keys: ["Tab"], desc: "Switch Session/Arrangement", cat: "Navigation" },
  { keys: ["Cmd/Ctrl", "Alt", "L"], desc: "Toggle Device View", cat: "Navigation" },
  { keys: ["Cmd/Ctrl", "Alt", "B"], desc: "Toggle Browser", cat: "Navigation" },
  { keys: ["Cmd/Ctrl", "Alt", "M"], desc: "Toggle MIDI Map Mode", cat: "MIDI" },
  { keys: ["Cmd/Ctrl", "Alt", "K"], desc: "Toggle Key Map Mode", cat: "MIDI" },
  { keys: ["Cmd/Ctrl", "D"], desc: "Duplicate Track/Clip", cat: "Editing" },
  { keys: ["Cmd/Ctrl", "E"], desc: "Split Clip at Selection", cat: "Editing" },
  { keys: ["Cmd/Ctrl", "J"], desc: "Join Clips", cat: "Editing" },
  { keys: ["Cmd/Ctrl", "L"], desc: "Loop Selection", cat: "Editing" },
  { keys: ["Cmd/Ctrl", "G"], desc: "Group Tracks", cat: "Tracks" },
  { keys: ["Cmd/Ctrl", "Shift", "G"], desc: "Ungroup Tracks", cat: "Tracks" },
  { keys: ["Cmd/Ctrl", "T"], desc: "New Audio Track", cat: "Tracks" },
  { keys: ["Cmd/Ctrl", "Shift", "T"], desc: "New MIDI Track", cat: "Tracks" },
  { keys: ["Cmd/Ctrl", "Alt", "T"], desc: "New Return Track", cat: "Tracks" },
  { keys: ["M"], desc: "Toggle Track Mute", cat: "Tracks" },
  { keys: ["S"], desc: "Toggle Track Solo", cat: "Tracks" },
  { keys: ["0"], desc: "Set Volume to 0dB", cat: "Mixer" },
  { keys: ["Cmd/Ctrl", "Shift", "F"], desc: "Find in Browser", cat: "Browser" },
];

const CATS = ["all", ...Array.from(new Set(SHORTCUTS.map((s) => s.cat.toLowerCase())))];

export function ShortcutsPageClient() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const filtered = useMemo(() => SHORTCUTS
    .filter(s => cat === "all" || s.cat.toLowerCase() === cat)
    .filter(s => !q || s.desc.toLowerCase().includes(q.toLowerCase()) || s.keys.join(" ").toLowerCase().includes(q.toLowerCase())),
    [q, cat]);
  return (
    <RefPage title="shortcuts" meta="ableton live 12" right={`${filtered.length}`} intro="the keys that save the most time. search or pick a group.">
      <SearchField value={q} onChange={setQ} label="Search shortcuts" />
      <Chips options={CATS} value={cat} onChange={setCat} label="Group" />
      <Silk label="keys" right={`${filtered.length}`} />
      {filtered.map((s, i) => (
        <ListRow key={i} title={s.desc} sub={s.cat.toLowerCase()}
          right={<span style={{ display: "inline-flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end", maxWidth: 170 }}>{s.keys.map((k, ki) => <KeyCap key={ki}>{k.toLowerCase().replace("cmd/ctrl", "cmd")}</KeyCap>)}</span>} />
      ))}
      {filtered.length === 0 && <div className="ls-panel"><span className="m1-t11">nothing matches. try another word.</span></div>}
    </RefPage>
  );
}
