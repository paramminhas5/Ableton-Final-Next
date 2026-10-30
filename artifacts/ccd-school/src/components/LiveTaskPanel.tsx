"use client";
import { useEffect, useRef, useState } from "react";
import { LIVE_TASKS } from "@/content/liveTasks";
import { useProgress } from "@/lib/progress";
import { track } from "@/lib/analytics";

const KEY = "ccd.livetasks.v1";
const load = (): string[] => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
};

interface R { id: string; label: string; pass: boolean; found: string; hint: string }

/** "Do it in Live": upload your Set and check the lesson's task against it. XP once per task. */
export function LiveTaskPanel({ slug }: { slug: string }) {
  const task = Object.hasOwn(LIVE_TASKS, slug) ? LIVE_TASKS[slug] : undefined;
  const { addXp } = useProgress();
  const [done, setDone] = useState(false);
  const [checks, setChecks] = useState<R[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [gained, setGained] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => setDone(load().includes(slug)), [slug]);
  if (!task) return null;

  async function send(file: File) {
    setError("");
    setGained(0);
    if (!/\.als$/i.test(file.name)) return setError("Choose a Live Set, a file that ends in .als.");
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("slug", slug);
      const r = await fetch("/api/set/lesson-task", { method: "POST", body });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "Could not read that file.");
      setChecks(j.checks as R[]);
      if (j.passed) {
        const have = load();
        if (!have.includes(slug)) {
          try { localStorage.setItem(KEY, JSON.stringify([...have, slug])); } catch {}
          addXp(task!.xp);
          setGained(task!.xp);
        }
        setDone(true);
      }
      track("live_task_checked", { slug, passed: !!j.passed });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`brutal-border p-5 space-y-3 ${done ? "bg-acid" : "bg-white"}`} data-testid="live-task">
      <div className="font-mono text-[10px] uppercase opacity-70">DO IT IN LIVE{done ? " · DONE" : ` · ${task.xp} XP`}</div>
      <h3 className="font-display text-2xl leading-none">{task.title}</h3>
      <p className="font-mono text-sm">{task.task}</p>
      <ol className="list-decimal pl-5 space-y-1 font-mono text-xs">
        {task.steps.map((st) => <li key={st}>{st}</li>)}
      </ol>
      <p className="font-mono text-xs brutal-border bg-bone p-2"><b>Common mistake.</b> {task.mistake}</p>
      <input
        ref={input}
        type="file"
        accept=".als"
        className="sr-only"
        aria-label="Choose your Live Set file"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void send(f);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => input.current?.click()}
        className="brutal-border bg-ink text-bone px-4 py-2 font-mono text-xs brutal-press disabled:opacity-50"
      >
        {busy ? "CHECKING..." : done ? "CHECK AGAIN" : "UPLOAD MY SET (.ALS)"}
      </button>
      <p role="alert" className="font-mono text-xs text-red-700 min-h-4">{error}</p>
      {gained > 0 && <p className="font-display text-xl" aria-live="polite">+{gained} XP</p>}
      {checks && (
        <ul className="space-y-1">
          {checks.map((c) => (
            <li key={c.id} className="font-mono text-xs">
              <span aria-hidden>{c.pass ? "✓" : "○"}</span>
              <span className="sr-only">{c.pass ? "Passed: " : "Not yet: "}</span> {c.label}
              <span className="opacity-50"> ({c.found})</span>
              {!c.pass && <p className="mt-1 opacity-70">{c.hint}</p>}
            </li>
          ))}
        </ul>
      )}
      <p className="font-mono text-[10px] opacity-70">Your file is read in memory and never stored.</p>
    </div>
  );
}
