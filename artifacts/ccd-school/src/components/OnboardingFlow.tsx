"use client";
/**
 * OnboardingFlow — shown once to brand-new users.
 *
 * Step 1: What do you want to learn?   (Fundamentals / DJ / Producer)
 * Step 2: How do you want to learn?    (CCD Path Mode / Classic Explorer)
 * Step 3: Adjust difficulty            (Classic only — Normal / Hard)
 * Step 4: World overview               (Chapters + missions in chosen world, then START)
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProgress } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import { chaptersByWorld } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";

type World = "fundamentals" | "dj" | "producer";
type LearnMode = "ccd" | "classic";
type Difficulty = "normal" | "hard";

// ─── static data ─────────────────────────────────────────────────────────────

const WORLDS: {
  id: World;
  emoji: string;
  title: string;
  tagline: string;
  detail: string;
  color: string;
  border: string;
  firstLesson: string;
}[] = [
  {
    id: "fundamentals",
    emoji: "🎵",
    title: "Fundamentals",
    tagline: "Sound, rhythm, melody, harmony & music tech",
    detail: "The vocabulary of music — built from zero. Perfect if you're new or want to fill gaps.",
    color: "bg-acid text-ink",
    border: "border-ink",
    firstLesson: "what-is-sound",
  },
  {
    id: "dj",
    emoji: "🎧",
    title: "DJ World",
    tagline: "Beatmatching, crowd reading, rekordbox, set building",
    detail: "Learn to DJ properly — from gear setup through to reading a room. Built from the rekordbox 6.0 Manual.",
    color: "bg-ink text-bone",
    border: "border-bone",
    firstLesson: "what-is-djing",
  },
  {
    id: "producer",
    emoji: "🎛",
    title: "Producer",
    tagline: "Ableton Live 12 — from zero to full track production",
    detail: "Every instrument, effect, and workflow in Ableton Live 12. Built from the official Reference Manual.",
    color: "bg-sun text-ink",
    border: "border-ink",
    firstLesson: "what-is-live",
  },
];

const CHAPTER_EMOJIS: Record<string, string> = {
  "sound-science": "🔊",
  "rhythm-and-time": "🥁",
  "melody-and-pitch": "🎵",
  "harmony-and-chords": "🎹",
  "music-technology": "💻",
  "setup-and-culture": "🎧",
  "the-library": "📚",
  "the-mix-dj": "🎛",
  "dj-performance": "🎤",
  "dj-mastery": "🏆",
  "first-contact": "🖥",
  "sound-and-midi": "🎼",
  "the-mix-producer": "🎚",
  "performance-and-flow": "🚀",
  "advanced-producer": "⚡",
  synthesis: "🌀",
};

// ─── step components ──────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-2 justify-center mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-2 w-10 brutal-border transition-all duration-300 ${
            i < current ? "bg-acid" : i === current ? "bg-acid/60" : "bg-bone/20"
          }`}
        />
      ))}
    </div>
  );
}

// Step 1 — Pick world
function StepWorld({ onPick }: { onPick: (w: World) => void }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="font-mono text-[10px] uppercase opacity-50 mb-2">STEP 1 OF 4</div>
        <h1 className="font-display text-5xl leading-none">
          WHAT DO YOU<br />
          <span className="text-acid">WANT TO LEARN?</span>
        </h1>
        <p className="font-mono text-sm opacity-60 mt-3 leading-relaxed">
          Pick a world. You can switch anytime from your profile.
        </p>
      </div>
      <div className="space-y-3">
        {WORLDS.map((w) => (
          <button
            key={w.id}
            onClick={() => onPick(w.id)}
            className={`w-full brutal-border ${w.color} p-5 text-left brutal-press brutal-shadow transition-all hover:scale-[1.01]`}
          >
            <div className="flex items-center gap-3">
              <span className="text-4xl shrink-0">{w.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="font-display text-2xl">{w.title}</div>
                <div className="font-mono text-xs opacity-70 mt-0.5 leading-relaxed">{w.tagline}</div>
              </div>
              <span className="font-display text-2xl opacity-60 shrink-0">→</span>
            </div>
          </button>
        ))}
      </div>
      <div className="text-center">
        <button
          onClick={() => onPick("fundamentals")}
          className="font-mono text-[10px] uppercase opacity-40 hover:opacity-70 underline underline-offset-2"
        >
          Not sure? Start with Fundamentals
        </button>
      </div>
    </div>
  );
}

// Step 2 — Pick mode
function StepMode({ world, onPick, onBack }: { world: World; onPick: (m: LearnMode) => void; onBack: () => void }) {
  const w = WORLDS.find((x) => x.id === world)!;
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <button onClick={onBack} className="font-mono text-[10px] uppercase opacity-40 hover:opacity-70 mb-4 block">
          ← back
        </button>
        <div className="font-mono text-[10px] uppercase opacity-50 mb-2">STEP 2 OF 4</div>
        <h1 className="font-display text-5xl leading-none">
          HOW DO YOU<br />
          <span className="text-acid">WANT TO LEARN IT?</span>
        </h1>
        <div className={`brutal-border ${w.color} px-4 py-2 inline-flex items-center gap-2 mt-3`}>
          <span>{w.emoji}</span>
          <span className="font-mono text-xs uppercase">{w.title}</span>
        </div>
      </div>
      <div className="space-y-3">
        <button
          onClick={() => onPick("ccd")}
          className="w-full brutal-border bg-volt text-bone p-5 text-left brutal-press brutal-shadow"
        >
          <div className="flex items-start gap-3">
            <span className="text-3xl shrink-0 mt-0.5">🔒</span>
            <div>
              <div className="font-display text-xl">CCD Mode</div>
              <div className="font-mono text-xs opacity-80 mt-1 leading-relaxed">
                Structured like Duolingo — lessons unlock one by one. Wrong answers cost a heart.
                Keeps you accountable and moving forward.
              </div>
              <div className="font-mono text-[10px] uppercase opacity-60 mt-2">
                Sequential · Hearts on · XP gated
              </div>
            </div>
          </div>
        </button>
        <button
          onClick={() => onPick("classic")}
          className="w-full brutal-border bg-bone text-ink p-5 text-left brutal-press brutal-shadow hover:bg-sun/30 transition-colors"
        >
          <div className="flex items-start gap-3">
            <span className="text-3xl shrink-0 mt-0.5">🗺</span>
            <div>
              <div className="font-display text-xl">Classic Mode</div>
              <div className="font-mono text-xs opacity-70 mt-1 leading-relaxed">
                All lessons open from day one. Browse freely, jump to any topic, no hearts, no gates.
                You control the pace.
              </div>
              <div className="font-mono text-[10px] uppercase opacity-50 mt-2">
                All open · No hearts · Jump anywhere
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

// Step 3 — Difficulty (Classic only)
function StepDifficulty({
  world,
  onPick,
  onBack,
}: {
  world: World;
  onPick: (d: Difficulty) => void;
  onBack: () => void;
}) {
  const w = WORLDS.find((x) => x.id === world)!;
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <button onClick={onBack} className="font-mono text-[10px] uppercase opacity-40 hover:opacity-70 mb-4 block">
          ← back
        </button>
        <div className="font-mono text-[10px] uppercase opacity-50 mb-2">STEP 3 OF 4</div>
        <h1 className="font-display text-5xl leading-none">
          ADJUST THE<br />
          <span className="text-acid">DIFFICULTY</span>
        </h1>
        <div className={`brutal-border ${w.color} px-4 py-2 inline-flex items-center gap-2 mt-3`}>
          <span>{w.emoji}</span>
          <span className="font-mono text-xs uppercase">{w.title} · Classic Mode</span>
        </div>
        <p className="font-mono text-sm opacity-60 mt-3 leading-relaxed">
          You can change this at any time from the mission page.
        </p>
      </div>
      <div className="space-y-3">
        <button
          onClick={() => onPick("normal")}
          className="w-full brutal-border bg-bone text-ink p-5 text-left brutal-press brutal-shadow hover:bg-acid/30 transition-colors"
        >
          <div className="flex items-start gap-3">
            <span className="text-3xl shrink-0 mt-0.5">📖</span>
            <div>
              <div className="font-display text-xl">Normal</div>
              <div className="font-mono text-xs opacity-70 mt-1 leading-relaxed">
                Full hints available, standard questions, 50% pass threshold. 
                Recommended if you're new to this topic.
              </div>
              <div className="font-mono text-[10px] uppercase opacity-50 mt-2">
                Hints on · Standard questions · 50% to pass
              </div>
            </div>
          </div>
        </button>
        <button
          onClick={() => onPick("hard")}
          className="w-full brutal-border bg-hot text-bone p-5 text-left brutal-press brutal-shadow"
        >
          <div className="flex items-start gap-3">
            <span className="text-3xl shrink-0 mt-0.5">🔥</span>
            <div>
              <div className="font-display text-xl">Hard</div>
              <div className="font-mono text-xs opacity-80 mt-1 leading-relaxed">
                No hints, harder questions where available, 70% pass threshold.
                For those who already have some background.
              </div>
              <div className="font-mono text-[10px] uppercase opacity-60 mt-2">
                No hints · Harder questions · 70% to pass
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

// Step 4 — World overview + launch
function StepOverview({
  world,
  mode,
  difficulty,
  onStart,
  onBack,
}: {
  world: World;
  mode: LearnMode;
  difficulty: Difficulty;
  onStart: () => void;
  onBack: () => void;
}) {
  const w = WORLDS.find((x) => x.id === world)!;
  const chapters = chaptersByWorld(world);
  const allPaths = pathsByWorld(world);
  const totalMissions = allPaths.flatMap((p) => p.missionSlugs).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <button onClick={onBack} className="font-mono text-[10px] uppercase opacity-40 hover:opacity-70 mb-4 block">
          ← back
        </button>
        <div className="font-mono text-[10px] uppercase opacity-50 mb-2">STEP 4 OF 4</div>
        <h1 className="font-display text-5xl leading-none">
          HERE&apos;S WHAT<br />
          <span className="text-acid">YOU&apos;LL LEARN</span>
        </h1>
      </div>

      {/* World hero card */}
      <div className={`brutal-border ${w.color} p-5 brutal-shadow`}>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{w.emoji}</span>
          <div>
            <div className="font-display text-3xl">{w.title}</div>
            <div className="font-mono text-xs opacity-70 mt-0.5">{w.tagline}</div>
          </div>
        </div>
        <div className="font-mono text-xs opacity-70 leading-relaxed mb-3">{w.detail}</div>
        <div className="flex flex-wrap gap-2 font-mono text-[10px] uppercase">
          <span className="brutal-border bg-ink/10 px-2 py-1">{chapters.length} chapters</span>
          <span className="brutal-border bg-ink/10 px-2 py-1">{allPaths.length} paths</span>
          <span className="brutal-border bg-ink/10 px-2 py-1">{totalMissions} missions</span>
        </div>
      </div>

      {/* Chapter breakdown */}
      <div>
        <div className="font-mono text-[10px] uppercase opacity-50 mb-3">// CHAPTERS</div>
        <div className="space-y-2">
          {chapters.map((ch, i) => {
            const paths = allPaths.filter((p) => p.chapter === ch.slug);
            const missionCount = paths.flatMap((p) => p.missionSlugs).length;
            const emoji = CHAPTER_EMOJIS[ch.slug] ?? "📖";
            return (
              <div key={ch.slug} className="brutal-border bg-bone/10 p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0 mt-0.5">{emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="font-display text-base leading-tight">{ch.title}</div>
                      <div className="font-mono text-[9px] uppercase opacity-50 shrink-0">
                        {missionCount} missions
                      </div>
                    </div>
                    <div className="font-mono text-xs opacity-60 mt-0.5 leading-snug">{ch.tagline}</div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {paths.map((p) => (
                        <span key={p.slug} className="font-mono text-[9px] uppercase opacity-40 brutal-border bg-bone/10 px-1.5 py-0.5">
                          {p.title}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Setup summary */}
      <div className="brutal-border bg-bone/10 p-4 space-y-2">
        <div className="font-mono text-[10px] uppercase opacity-50 mb-1">YOUR SETUP</div>
        <div className="flex items-center gap-3 font-mono text-sm">
          <span className="text-acid font-bold shrink-0">✓</span>
          World: <strong>{w.title}</strong>
        </div>
        <div className="flex items-center gap-3 font-mono text-sm">
          <span className="text-acid font-bold shrink-0">✓</span>
          Mode: <strong>{mode === "ccd" ? "🔒 CCD Mode" : "🗺 Classic Mode"}</strong>
        </div>
        {mode === "classic" && (
          <div className="flex items-center gap-3 font-mono text-sm">
            <span className="text-acid font-bold shrink-0">✓</span>
            Difficulty: <strong>{difficulty === "hard" ? "🔥 Hard" : "📖 Normal"}</strong>
          </div>
        )}
        <div className="flex items-center gap-3 font-mono text-sm">
          <span className="text-acid font-bold shrink-0">✓</span>
          No account needed to start
        </div>
      </div>

      <button
        onClick={onStart}
        className="w-full brutal-border bg-acid text-ink py-5 font-display text-3xl brutal-press brutal-shadow"
      >
        START FIRST LESSON →
      </button>
      <div className="font-mono text-[10px] uppercase opacity-40 text-center">
        Free to start · No sign-up required
      </div>
    </div>
  );
}

// ─── main export ──────────────────────────────────────────────────────────────

export function OnboardingFlow({ onDone }: { onDone?: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedWorld, setSelectedWorld] = useState<World | null>(null);
  const [selectedMode, setSelectedMode] = useState<LearnMode | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("normal");

  const { setOnboarding } = useProgress();
  const { setLearnMode } = useLearnMode();
  const router = useRouter();

  // total steps: CCD skips difficulty → 3 real steps visible; Classic has 4
  const totalSteps = selectedMode === "ccd" ? 3 : 4;

  const handleWorldPick = (w: World) => {
    setSelectedWorld(w);
    setStep(2);
  };

  const handleModePick = (m: LearnMode) => {
    setSelectedMode(m);
    if (m === "ccd") {
      // Skip difficulty step for CCD — go straight to overview
      setStep(4);
    } else {
      setStep(3);
    }
  };

  const handleDifficultyPick = (d: Difficulty) => {
    setSelectedDifficulty(d);
    setStep(4);
  };

  const handleStart = () => {
    if (!selectedWorld || !selectedMode) return;
    const difficulty = selectedMode === "ccd" ? "normal" : selectedDifficulty;
    setOnboarding(selectedWorld, difficulty);
    setLearnMode(selectedMode);
    const firstLesson = WORLDS.find((w) => w.id === selectedWorld)!.firstLesson;
    onDone?.();
    router.push(`/learn/${firstLesson}`);
  };

  // Visual step index for the indicator (always 1-4 but CCD shows 1-3)
  const visualStep =
    step === 4 ? totalSteps : step === 3 && selectedMode === "classic" ? 3 : step;

  return (
    <div className="min-h-screen bg-ink text-bone flex flex-col">
      <div className="max-w-lg mx-auto w-full px-4 pt-8 pb-4">
        <StepIndicator current={visualStep - 1} total={totalSteps} />
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full px-4 pb-16 overflow-y-auto">
        {step === 1 && <StepWorld onPick={handleWorldPick} />}

        {step === 2 && selectedWorld && (
          <StepMode
            world={selectedWorld}
            onPick={handleModePick}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && selectedWorld && selectedMode === "classic" && (
          <StepDifficulty
            world={selectedWorld}
            onPick={handleDifficultyPick}
            onBack={() => setStep(2)}
          />
        )}

        {step === 4 && selectedWorld && selectedMode && (
          <StepOverview
            world={selectedWorld}
            mode={selectedMode}
            difficulty={selectedMode === "ccd" ? "normal" : selectedDifficulty}
            onStart={handleStart}
            onBack={() => setStep(selectedMode === "ccd" ? 2 : 3)}
          />
        )}
      </div>
    </div>
  );
}
