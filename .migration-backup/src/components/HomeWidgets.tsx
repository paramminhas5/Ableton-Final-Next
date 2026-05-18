import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MISSIONS } from "@/content/missions";
import { useProgress } from "@/lib/progress";
import { rankFor } from "@/lib/ranks";

function dayHash() {
  const d = new Date();
  const key = `${d.getUTCFullYear()}${d.getUTCMonth()}${d.getUTCDate()}`;
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return h;
}

const DRILLS = [
  { slug: "interval", label: "Interval ID" },
  { slug: "chord", label: "Chord Quality" },
  { slug: "eq-cut", label: "EQ Cut" },
  { slug: "compression", label: "Compression Spotting" },
  { slug: "reverb", label: "Reverb Tail" },
];

export function DailyChallenge() {
  const { progress } = useProgress();
  const today = useMemo(() => {
    const h = dayHash();
    const mission = MISSIONS[h % MISSIONS.length];
    const drill = DRILLS[h % DRILLS.length];
    return { mission, drill };
  }, []);
  const done = !!progress.completedMissions[today.mission.slug];
  return (
    <div className="brutal-border bg-sun p-5 brutal-shadow">
      <div className="font-mono text-xs uppercase">// DAILY CHALLENGE</div>
      <div className="grid md:grid-cols-2 gap-3 mt-2">
        <Link
          to="/mission/$slug"
          params={{ slug: today.mission.slug }}
          className="brutal-border bg-bone p-3 brutal-press block"
        >
          <div className="font-mono text-[10px] uppercase">
            Mission of the day {done ? "· ✓ done" : ""}
          </div>
          <div className="font-display text-2xl">
            #{today.mission.number} {today.mission.title}
          </div>
          <div className="font-mono text-xs opacity-70 mt-1">{today.mission.tagline}</div>
        </Link>
        <Link to="/train" className="brutal-border bg-bone p-3 brutal-press block">
          <div className="font-mono text-[10px] uppercase">Drill of the day</div>
          <div className="font-display text-2xl">{today.drill.label}</div>
          <div className="font-mono text-xs opacity-70 mt-1">
            10 quick rounds in the Train room.
          </div>
        </Link>
      </div>
    </div>
  );
}

export function SpacedReview() {
  const { progress } = useProgress();
  const candidates = useMemo(() => {
    const now = Date.now();
    return Object.entries(progress.completedMissions)
      .map(([slug, v]) => ({ slug, ageDays: (now - v.at) / 86400000 }))
      .filter((c) => c.ageDays >= 1)
      .sort((a, b) => b.ageDays - a.ageDays)
      .slice(0, 3)
      .map((c) => ({ ...c, mission: MISSIONS.find((m) => m.slug === c.slug)! }))
      .filter((c) => !!c.mission);
  }, [progress.completedMissions]);

  if (candidates.length === 0) return null;
  return (
    <div className="brutal-border bg-bone p-5 brutal-shadow">
      <div className="font-mono text-xs uppercase">// REVIEW QUEUE — keep it sticky</div>
      <div className="grid md:grid-cols-3 gap-2 mt-2">
        {candidates.map((c) => (
          <Link
            key={c.slug}
            to="/mission/$slug"
            params={{ slug: c.slug }}
            className="brutal-border bg-card p-3 brutal-press block"
          >
            <div className="font-mono text-[10px] uppercase">
              ↻ Review · {Math.round(c.ageDays)}d ago
            </div>
            <div className="font-display text-lg">{c.mission.title}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function RankBadge({ compact = false }: { compact?: boolean }) {
  const { progress } = useProgress();
  const { current, next, progress: pct } = rankFor(progress.xp);
  if (compact) {
    return (
      <span
        className={`brutal-border ${current.color} px-2 py-1 font-mono text-xs uppercase`}
        title={current.tagline}
      >
        {current.name}
      </span>
    );
  }
  return (
    <div className={`brutal-border ${current.color} p-4 brutal-shadow-sm`}>
      <div className="font-mono text-xs uppercase">// RANK</div>
      <div className="font-display text-3xl mt-1">{current.name}</div>
      <div className="font-mono text-xs opacity-80">{current.tagline}</div>
      <div className="h-2 brutal-border mt-3 bg-bone overflow-hidden">
        <div className="h-full bg-ink" style={{ width: `${Math.round(pct * 100)}%` }} />
      </div>
      <div className="font-mono text-xs uppercase mt-2">
        {next ? `${next.minXp - progress.xp} XP to ${next.name}` : "Top rank achieved."}
      </div>
    </div>
  );
}

export function Onboarding() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (typeof localStorage === "undefined") return;
    if (!localStorage.getItem("ableton.school.onboarded")) setShow(true);
  }, []);
  if (!show) return null;
  const close = () => {
    localStorage.setItem("ableton.school.onboarded", "1");
    setShow(false);
  };
  const steps = [
    {
      title: "Welcome to CCD.SCHOOL",
      body: "116 missions across 6 worlds. 23 interactive simulators. Ear training drills, a mix-match game, a workbench. No fluff.",
    },
    {
      title: "Pick a path",
      body: "Try a curated path like ‘Make Your First Beat’ or ‘Mix a Track’ — they cut across worlds in the right order.",
    },
    {
      title: "⌘K opens search",
      body: "Anywhere in the app press ⌘K (or Ctrl-K) to jump to any mission, device or page in two keystrokes.",
    },
  ];
  const s = steps[step];
  return (
    <div className="fixed inset-0 z-[90] bg-ink/70 flex items-center justify-center p-4">
      <div className="brutal-border bg-bone p-6 max-w-md w-full brutal-shadow-lg animate-fade-in">
        <div className="font-mono text-xs uppercase">
          // {step + 1} / {steps.length}
        </div>
        <h2 className="font-display text-3xl mt-1">{s.title}</h2>
        <p className="font-mono text-sm mt-3">{s.body}</p>
        <div className="flex gap-2 mt-5">
          <button
            onClick={close}
            className="brutal-border bg-card px-3 py-2 font-mono text-xs uppercase brutal-press"
          >
            Skip
          </button>
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="brutal-border bg-acid px-3 py-2 font-mono text-xs uppercase brutal-press ml-auto"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={close}
              className="brutal-border bg-hot text-bone px-3 py-2 font-mono text-xs uppercase brutal-press ml-auto"
            >
              Let's go
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
