import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";

export const Route = createFileRoute("/shortcuts")({
  head: () => ({
    meta: [
      { title: "Shortcuts — CCD.SCHOOL" },
      { name: "description", content: "Every Live keyboard shortcut worth memorising, organised by category." },
    ],
  }),
  component: ShortcutsPage,
});

type Shortcut = { keys: string; action: string; cat: string };

const SHORTCUTS: Shortcut[] = [
  { cat: "Transport", keys: "Space", action: "Play / Stop" },
  { cat: "Transport", keys: "F9", action: "Record" },
  { cat: "Transport", keys: "F1", action: "Toggle metronome" },
  { cat: "Transport", keys: "Shift+F9", action: "Session record" },
  { cat: "Views", keys: "Tab", action: "Toggle Session / Arrangement" },
  { cat: "Views", keys: "Shift+Tab", action: "Toggle Detail view" },
  { cat: "Views", keys: "Cmd/Ctrl+Alt+B", action: "Toggle Browser" },
  { cat: "Views", keys: "Cmd/Ctrl+Alt+L", action: "Toggle Hot-Swap" },
  { cat: "Editing", keys: "Cmd/Ctrl+Z", action: "Undo" },
  { cat: "Editing", keys: "Cmd/Ctrl+Shift+Z", action: "Redo" },
  { cat: "Editing", keys: "Cmd/Ctrl+D", action: "Duplicate clip / selection" },
  { cat: "Editing", keys: "Cmd/Ctrl+E", action: "Split clip at marker" },
  { cat: "Editing", keys: "Cmd/Ctrl+J", action: "Consolidate selection" },
  { cat: "Editing", keys: "Cmd/Ctrl+L", action: "Loop selection" },
  { cat: "Editing", keys: "Cmd/Ctrl+U", action: "Quantize" },
  { cat: "Editing", keys: "Cmd/Ctrl+Shift+U", action: "Quantize settings" },
  { cat: "Editing", keys: "Cmd/Ctrl+G", action: "Group tracks" },
  { cat: "Editing", keys: "Cmd/Ctrl+T", action: "Insert audio track" },
  { cat: "Editing", keys: "Cmd/Ctrl+Shift+T", action: "Insert MIDI track" },
  { cat: "Editing", keys: "Cmd/Ctrl+Alt+T", action: "Insert return track" },
  { cat: "Editing", keys: "B", action: "Toggle pencil draw mode" },
  { cat: "Editing", keys: "Cmd/Ctrl+M", action: "Toggle MIDI map mode" },
  { cat: "Editing", keys: "Cmd/Ctrl+K", action: "Toggle key map mode" },
  { cat: "Clips", keys: "Cmd/Ctrl+R", action: "Rename selected" },
  { cat: "Clips", keys: "0", action: "Activate / deactivate clip" },
  { cat: "Clips", keys: "Shift+Click", action: "Add to selection" },
  { cat: "Clips", keys: "Alt+drag", action: "Duplicate clip" },
  { cat: "Browser", keys: "Cmd/Ctrl+F", action: "Search the browser" },
  { cat: "Browser", keys: "Enter", action: "Hot-Swap selected" },
  { cat: "Browser", keys: "Cmd/Ctrl+L", action: "Lock Hot-Swap" },
];

const CATS = ["All", "Transport", "Views", "Editing", "Clips", "Browser"];

// ---- key matching for the trainer ----
function parseCombo(keys: string) {
  // Accept "Cmd/Ctrl+Shift+U" → {mods: {ctrl, shift}, key: "u"}
  const parts = keys.split("+").map((p) => p.trim());
  const mods = { ctrl: false, shift: false, alt: false };
  let main = "";
  for (const p of parts) {
    const lp = p.toLowerCase();
    if (lp === "cmd/ctrl" || lp === "cmd" || lp === "ctrl") mods.ctrl = true;
    else if (lp === "shift") mods.shift = true;
    else if (lp === "alt" || lp === "option" || lp === "opt") mods.alt = true;
    else main = lp;
  }
  return { mods, main };
}
function matchEvent(e: KeyboardEvent, target: ReturnType<typeof parseCombo>) {
  const ctrl = e.ctrlKey || e.metaKey;
  if (ctrl !== target.mods.ctrl) return false;
  if (e.shiftKey !== target.mods.shift) return false;
  if (e.altKey !== target.mods.alt) return false;
  const k = e.key.toLowerCase();
  if (target.main === "space") return k === " " || e.code === "Space";
  if (target.main === "tab") return k === "tab";
  if (target.main === "enter") return k === "enter";
  // function keys, letters, digits
  return k === target.main || e.code.toLowerCase() === target.main;
}

function ShortcutsPage() {
  const [cat, setCat] = useState<string>("All");
  const [tab, setTab] = useState<"list" | "trainer">("list");
  const list = SHORTCUTS.filter((s) => cat === "All" || s.cat === cat);
  return (
    <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-4">
      <header className="brutal-border bg-volt text-bone p-6 brutal-shadow">
        <div className="font-mono text-xs uppercase">// REFERENCE</div>
        <h1 className="text-5xl md:text-7xl mt-2">SHORTCUTS</h1>
        <p className="font-mono mt-2">Memorise these. Move at the speed of thought.</p>
      </header>
      <div className="brutal-border bg-bone p-2 flex gap-2">
        <button onClick={() => setTab("list")} className={`brutal-border px-3 py-2 font-mono text-xs uppercase brutal-press ${tab === "list" ? "bg-acid" : "bg-card"}`}>📖 REFERENCE</button>
        <button onClick={() => setTab("trainer")} className={`brutal-border px-3 py-2 font-mono text-xs uppercase brutal-press ${tab === "trainer" ? "bg-hot text-bone" : "bg-card"}`}>🎯 TRAINER</button>
      </div>
      {tab === "trainer" ? (
        <Trainer pool={list.length ? list : SHORTCUTS} />
      ) : (
      <>
      <div className="brutal-border bg-card p-3 flex flex-wrap gap-2 sticky top-0 z-30">
        {CATS.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`brutal-border px-3 py-2 font-mono text-xs uppercase brutal-press ${cat === c ? "bg-acid" : "bg-bone"}`}
          >
            {c}
          </button>
        ))}
        <span className="font-mono text-xs uppercase ml-auto">{list.length}</span>
      </div>
      <div className="grid md:grid-cols-2 gap-2">
        {list.map((s, i) => (
          <div key={i} className="brutal-border bg-card p-3 flex items-center justify-between gap-3">
            <kbd className="brutal-border bg-ink text-bone px-2 py-1 font-mono text-xs whitespace-nowrap">{s.keys}</kbd>
            <div className="font-mono text-sm flex-1 ml-2">{s.action}</div>
            <span className="brutal-border bg-bone px-2 py-0.5 font-mono text-[10px] uppercase">{s.cat}</span>
          </div>
        ))}
      </div>
      </>
      )}
      <Link to="/" className="brutal-border bg-bone px-4 py-2 font-mono text-xs uppercase brutal-press inline-block">← HOME</Link>
    </div>
  );
}

function Trainer({ pool }: { pool: Shortcut[] }) {
  // Filter shortcuts that are practically reproducible in-browser (skip mouse-based ones)
  const playable = useMemo(
    () => pool.filter((s) => !/click|drag/i.test(s.keys)),
    [pool],
  );
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * playable.length));
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(() => {
    if (typeof window === "undefined") return 0;
    return Number(localStorage.getItem("shortcuts.best") || "0");
  });
  const [feedback, setFeedback] = useState<"idle" | "right" | "wrong">("idle");
  const [last, setLast] = useState<string>("");
  const [preview, setPreview] = useState(true);
  const [hintShown, setHintShown] = useState(false);
  const target = playable[idx];
  const parsed = useMemo(() => parseCombo(target.keys), [target]);
  const lockRef = useRef(false);

  // reset hint when round changes
  useEffect(() => { setHintShown(false); }, [idx]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Ignore lone modifier presses
      if (["Control","Shift","Alt","Meta"].includes(e.key)) return;
      if (lockRef.current) return;
      // Always block default so browser shortcuts don't fire
      e.preventDefault();
      const desc = [
        e.ctrlKey || e.metaKey ? "Cmd/Ctrl" : "",
        e.shiftKey ? "Shift" : "",
        e.altKey ? "Alt" : "",
        e.key.length === 1 ? e.key.toUpperCase() : e.key,
      ].filter(Boolean).join("+");
      setLast(desc);
      const ok = matchEvent(e, parsed);
      if (ok) {
        const ns = score + 1;
        const nstr = streak + 1;
        setScore(ns); setStreak(nstr);
        if (nstr > best) { setBest(nstr); localStorage.setItem("shortcuts.best", String(nstr)); }
        setFeedback("right");
      } else {
        setStreak(0);
        setFeedback("wrong");
      }
      lockRef.current = true;
      setTimeout(() => {
        lockRef.current = false;
        setFeedback("idle");
        setIdx(Math.floor(Math.random() * playable.length));
      }, ok ? 700 : 1400); // give 1.4s on wrong so the keycap reveal is readable
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [parsed, score, streak, best, playable.length]);

  const tone = feedback === "right" ? "bg-acid" : feedback === "wrong" ? "bg-hot text-bone" : "bg-sun";
  const modHint = [parsed.mods.ctrl ? "⌘/Ctrl" : "", parsed.mods.shift ? "⇧" : "", parsed.mods.alt ? "⌥" : ""].filter(Boolean).join(" + ") || "(no modifiers)";
  const keycapParts = target.keys.split("+").map((p) => p.trim());
  return (
    <div className="space-y-3">
      <div className="brutal-border bg-card p-3 flex flex-wrap gap-3 font-mono text-xs uppercase">
        <span className="brutal-border bg-bone px-2 py-1">SCORE {score}</span>
        <span className="brutal-border bg-bone px-2 py-1">STREAK {streak}</span>
        <span className="brutal-border bg-volt text-bone px-2 py-1">BEST {best}</span>
        <button onClick={() => setPreview((p) => !p)} className={`brutal-border px-2 py-1 brutal-press ${preview ? "bg-acid" : "bg-bone"}`}>
          PREVIEW {preview ? "ON" : "OFF"}
        </button>
        <button onClick={() => { setHintShown(true); setStreak(0); }} disabled={hintShown}
          className="brutal-border bg-sun px-2 py-1 brutal-press disabled:opacity-50">
          💡 HINT (-streak)
        </button>
        <span className="opacity-60 ml-auto">Tip: focus this page, then press the combo</span>
      </div>
      <div className={`brutal-border ${tone} p-8 brutal-shadow text-center transition-colors`}>
        <div className="font-mono text-xs uppercase opacity-70">PRESS THE SHORTCUT FOR</div>
        <div className="font-display text-3xl md:text-5xl mt-2">{target.action}</div>
        <div className="font-mono text-xs uppercase mt-3 opacity-70">CATEGORY · {target.cat}</div>
        {hintShown && feedback === "idle" && (
          <div className="font-mono text-sm uppercase mt-3 brutal-border bg-bone text-ink inline-block px-3 py-1">
            HINT · modifiers: {modHint}
          </div>
        )}
        {preview && feedback === "idle" && (
          <div className="font-mono text-[10px] uppercase mt-2 opacity-50">[preview mode] answer: {target.keys}</div>
        )}
        <div className="mt-6 min-h-[2rem]">
          {feedback === "right" && <div className="font-display text-2xl">✓ NICE — {target.keys}</div>}
          {feedback === "wrong" && (
            <div className="space-y-2">
              <div className="font-display text-xl">✗ NOT QUITE</div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {keycapParts.map((p, i) => (
                  <span key={i} className="brutal-border bg-bone text-ink px-3 py-2 font-mono text-base shadow-[0_0_18px_4px_rgba(255,255,255,0.6)] animate-pulse">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}
          {feedback === "idle" && last && <div className="font-mono text-xs opacity-60">last: {last}</div>}
        </div>
      </div>
      <div className="brutal-border bg-bone p-3 font-mono text-xs uppercase">
        ▸ Turn PREVIEW off for a real challenge. Use HINT only when stuck — it costs your streak.
      </div>
    </div>
  );
}