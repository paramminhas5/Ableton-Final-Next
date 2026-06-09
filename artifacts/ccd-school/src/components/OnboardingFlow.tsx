"use client";
/**
 * OnboardingFlow — shown once to brand-new users.
 *
 * Step 1: Experience level        (Beginner / Some / Expert)
 * Step 2: What to learn?          (Fundamentals / DJ / Producer)
 * Step 3: How to learn?           (FLOW MODE / FREE MODE)
 * Step 4: Adjust difficulty       (Explore only — Normal / Hard)
 * Step 5: World overview          (Chapters + missions in chosen world, then START)
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useProgress } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import { chaptersByWorld } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";
import { PlacementTest } from "@/components/PlacementTest";

const ONBOARDING_BG = "https://v3b.fal.media/files/b/0a9d85a6/QJa9Aa24ygZJULRgwCBws.jpg";
const WORLD_BANNERS: Record<string, string> = {
  fundamentals: "https://v3b.fal.media/files/b/0a9d8573/T1yPDNCVhxrVLWBs3vPLK.jpg",
  dj: "https://v3b.fal.media/files/b/0a9d8573/vkzVEVke8UdYZtUAJEt5P.jpg",
};

type World = "fundamentals" | "dj" | "producer";
type LearnMode = "flow" | "classic";
type Difficulty = "normal" | "hard";

const WORLD_ETAS: Record<string, string> = {
  fundamentals: "~3–4 weeks at 30 min/day",
  dj: "~3–4 weeks at 30 min/day",
  producer: "~6–8 weeks at 30 min/day",
};

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
          className={`h-3 w-10 brutal-border transition-all duration-300 ${
            i < current ? "bg-acid" : i === current ? "bg-acid/60" : "bg-bone/20"
          }`}
          style={i <= current ? { boxShadow: '0 0 8px #C6FF00' } : undefined}
        />
      ))}
    </div>
  );
}

// Step 0 — Experience level
function StepExperience({ onPick }: { onPick: (exp: "none" | "some" | "lots") => void }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="font-mono text-[10px] uppercase opacity-50 mb-2">STEP 1 OF 4</div>
        <h1 className="font-display text-6xl md:text-7xl leading-none">
          BEFORE WE START,<br />
          <span className="text-acid">HOW MUCH DO YOU KNOW?</span>
        </h1>
        <p className="font-mono text-sm opacity-60 mt-3 leading-relaxed">
          This helps us put you in the right place.
        </p>
      </div>
      <div className="space-y-3">
        <button
          onClick={() => onPick("none")}
          className="w-full brutal-border bg-acid text-ink p-5 text-left brutal-press brutal-shadow"
        >
          <div className="flex items-start gap-3">
            <span className="text-3xl shrink-0 mt-0.5">🌱</span>
            <div>
              <div className="font-display text-xl">Total Beginner</div>
              <div className="font-mono text-xs opacity-70 mt-1 leading-relaxed">
                I have never made music or DJed. Start me from the very beginning.
              </div>
            </div>
          </div>
        </button>
        <button
          onClick={() => onPick("some")}
          className="w-full brutal-border bg-bone text-ink p-5 text-left brutal-press brutal-shadow hover:bg-sun/30 transition-colors"
        >
          <div className="flex items-start gap-3">
            <span className="text-3xl shrink-0 mt-0.5">🎛</span>
            <div>
              <div className="font-display text-xl">Some Experience</div>
              <div className="font-mono text-xs opacity-70 mt-1 leading-relaxed">
                I have dabbled — made some beats, played around in a DAW, or DJed a little. Help me find my level.
              </div>
              <div className="font-mono text-[10px] uppercase opacity-50 mt-2">Short placement test → skip ahead if ready</div>
            </div>
          </div>
        </button>
        <button
          onClick={() => onPick("lots")}
          className="w-full brutal-border bg-ink text-bone p-5 text-left brutal-press brutal-shadow"
        >
          <div className="flex items-start gap-3">
            <span className="text-3xl shrink-0 mt-0.5">🏆</span>
            <div>
              <div className="font-display text-xl">Experienced</div>
              <div className="font-mono text-xs opacity-70 mt-1 leading-relaxed">
                I know music theory, have produced tracks, or DJ regularly. Let me jump straight in.
              </div>
              <div className="font-mono text-[10px] uppercase opacity-50 mt-2">Skip to world selection → all chapters unlocked</div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

// Step 1 — Pick world
function StepWorld({ onPick, experience }: { onPick: (w: World) => void; experience: "none" | "some" | "lots" | null }) {
  const isPlacementNext = experience === "some";
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="font-mono text-[10px] uppercase opacity-50 mb-2">STEP 2 OF 4</div>
        <h1 className="font-display text-6xl md:text-7xl leading-none">
          WHAT DO YOU<br />
          <span className="text-acid">WANT TO LEARN?</span>
        </h1>
        <p className="font-mono text-sm opacity-60 mt-3 leading-relaxed">
          {isPlacementNext
            ? "Pick a world — we'll run a quick placement test to find your level."
            : "Pick a world. You can switch anytime from your profile."}
        </p>
      </div>
      <div className="space-y-3">
        {WORLDS.map((w) => (
          <button
            key={w.id}
            onClick={() => onPick(w.id)}
            className={`w-full brutal-border ${w.color} p-7 text-left brutal-press brutal-shadow transition-all hover:scale-[1.01] relative overflow-hidden`}
          >
            {/* World banner image for fundamentals and dj */}
            {WORLD_BANNERS[w.id] && (
              <div className="absolute inset-0 pointer-events-none">
                <Image
                  src={WORLD_BANNERS[w.id]}
                  alt=""
                  fill
                  className="object-cover opacity-15 mix-blend-multiply"
                  sizes="100vw"
                />
              </div>
            )}
            <div className="relative z-10 flex items-center gap-3">
              <span className="text-4xl shrink-0">{w.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="font-display text-2xl">{w.title}</div>
                <div className="font-mono text-xs opacity-70 mt-0.5 leading-relaxed">{w.tagline}</div>
              </div>
              <span className="font-display text-2xl opacity-60 shrink-0">{isPlacementNext ? "→ test" : "→"}</span>
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
        <div className="font-mono text-[10px] uppercase opacity-50 mb-2">STEP 3 OF 4</div>
        <h1 className="font-display text-6xl md:text-7xl leading-none">
          PICK YOUR<br />
          <span className="text-acid">LEARNING STYLE</span>
        </h1>
        <div className={`brutal-border ${w.color} px-4 py-2 inline-flex items-center gap-2 mt-3`}>
          <span>{w.emoji}</span>
          <span className="font-mono text-xs uppercase">{w.title}</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* FLOW MODE */}
        <button
          onClick={() => onPick("flow")}
          className="w-full brutal-border bg-acid text-ink p-5 text-left brutal-press brutal-shadow hover:bg-sun transition-colors"
        >
          <div className="flex items-start gap-4">
            <span className="text-4xl shrink-0 mt-0.5">🌊</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="font-display text-2xl">FLOW MODE</div>
                <span className="brutal-border bg-ink text-bone px-2 py-0.5 font-mono text-[9px] uppercase">RECOMMENDED</span>
              </div>
              <div className="font-mono text-xs opacity-80 leading-relaxed mb-3">
                Structured like Duolingo — missions unlock one by one. Wrong answers cost a heart.
                Complete each lesson before the next opens. Keeps you accountable.
              </div>
              <div className="grid grid-cols-2 gap-1.5 font-mono text-[9px] uppercase">
                {[
                  { icon: "🔒", text: "Sequential unlocking" },
                  { icon: "❤️", text: "Hearts on wrong answers" },
                  { icon: "⚡", text: "XP gating between paths" },
                  { icon: "🏆", text: "Trophy rewards" },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5 opacity-80">
                    <span>{icon}</span><span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-ink/20" />
          <span className="font-mono text-[9px] uppercase opacity-40">or</span>
          <div className="flex-1 h-px bg-ink/20" />
        </div>

        {/* FREE MODE */}
        <button
          onClick={() => onPick("classic")}
          className="w-full brutal-border bg-bone text-ink p-5 text-left brutal-press brutal-shadow hover:bg-sun/40 transition-colors"
        >
          <div className="flex items-start gap-4">
            <span className="text-4xl shrink-0 mt-0.5">🔓</span>
            <div className="flex-1">
              <div className="font-display text-2xl mb-1">FREE MODE</div>
              <div className="font-mono text-xs opacity-70 leading-relaxed mb-3">
                All lessons open from day one. Browse freely, jump to any topic, no hearts, no gates.
                You control the pace entirely.
              </div>
              <div className="grid grid-cols-2 gap-1.5 font-mono text-[9px] uppercase">
                {[
                  { icon: "🔓", text: "All lessons unlocked" },
                  { icon: "🚫", text: "No hearts / no limits" },
                  { icon: "🎯", text: "Jump to any topic" },
                  { icon: "📖", text: "Normal & hard difficulty" },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5 opacity-60">
                    <span>{icon}</span><span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </button>
      </div>

      <div className="brutal-border bg-bone/50 p-4">
        <div className="font-mono text-[9px] uppercase opacity-50 mb-1">💡 YOU CAN SWITCH ANYTIME</div>
        <div className="font-mono text-xs opacity-60 leading-relaxed">
          The mode toggle is always visible in the top navigation bar. Switch between FLOW MODE and FREE MODE at any point — your progress carries over.
        </div>
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
        <div className="font-mono text-[10px] uppercase opacity-50 mb-2">STEP 4 OF 5</div>
        <h1 className="font-display text-6xl md:text-7xl leading-none">
          ADJUST THE<br />
          <span className="text-acid">DIFFICULTY</span>
        </h1>
        <div className={`brutal-border ${w.color} px-4 py-2 inline-flex items-center gap-2 mt-3`}>
          <span>{w.emoji}</span>
          <span className="font-mono text-xs uppercase">{w.title} · Free Mode</span>
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
  experience,
  onStart,
  onBack,
}: {
  world: World;
  mode: LearnMode;
  difficulty: Difficulty;
  experience: "none" | "some" | "lots" | null;
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
        <div className="font-mono text-[10px] uppercase opacity-50 mb-2">
          {mode === "flow" ? "STEP 4 OF 4" : "STEP 5 OF 5"}
        </div>
        <h1 className="font-display text-6xl md:text-7xl leading-none">
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
          <span className="brutal-border bg-acid/80 text-ink px-2 py-1">⏱ {WORLD_ETAS[world]}</span>
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
          Mode: <strong>{mode === "flow" ? "🌊 Flow Mode" : "🔓 Free Mode"}</strong>
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
        {experience === "lots" && (
          <div className="flex items-center gap-3 font-mono text-sm text-acid">
            <span className="font-bold shrink-0">★</span>
            All chapters unlocked — you can start anywhere.
          </div>
        )}
        {experience === "some" && (
          <div className="flex items-center gap-3 font-mono text-sm text-acid">
            <span className="font-bold shrink-0">★</span>
            Starting from your placement result.
          </div>
        )}
      </div>

      <button
        onClick={onStart}
        className="w-full brutal-border bg-acid text-ink py-6 font-display text-4xl brutal-press brutal-shadow"
        style={{ animation: 'pulse-glow 2s ease-in-out infinite' }}
      >
        <style>{`@keyframes pulse-glow{0%,100%{box-shadow:0 4px 0 #0B0B0B,0 0 20px rgba(198,255,0,0.4)}50%{box-shadow:0 4px 0 #0B0B0B,0 0 40px rgba(198,255,0,0.7)}}`}</style>
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
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [selectedWorld, setSelectedWorld] = useState<World | null>(null);
  const [selectedMode, setSelectedMode] = useState<LearnMode | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("normal");
  const [experience, setExperience] = useState<"none" | "some" | "lots" | null>(null);
  const [showPlacement, setShowPlacement] = useState(false);

  const { setOnboarding } = useProgress();
  const { setLearnMode } = useLearnMode();
  const router = useRouter();

  // total steps: Flow skips difficulty → 4 real steps visible; Classic has 5
  const totalSteps = selectedMode === "flow" ? 4 : 5;

  const handleExperiencePick = (exp: "none" | "some" | "lots") => {
    setExperience(exp);
    // Always go to world selection first — placement test (if needed) comes after
    setStep(1);
  };

  const handleWorldPick = (w: World) => {
    setSelectedWorld(w);
    if (experience === "some") {
      // Now that we have a world, show the placement test
      setShowPlacement(true);
    } else {
      setStep(2);
    }
  };

  const handleModePick = (m: LearnMode) => {
    setSelectedMode(m);
    if (m === "flow") {
      // Skip difficulty step for Flow Mode — go straight to overview
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
    const difficulty = selectedMode === "flow" ? "normal" : selectedDifficulty;
    setOnboarding(selectedWorld, difficulty);
    setLearnMode(selectedMode);
    const firstLesson = WORLDS.find((w) => w.id === selectedWorld)!.firstLesson;
    onDone?.();
    router.push(`/learn/${firstLesson}`);
  };

  /**
   * Called when the PlacementTest completes with a chapter result.
   * The placement path previously skipped mode/difficulty selection and never
   * called setOnboarding — so onboardingDone stayed false and learnMode was
   * never written. This handler fixes that: it defaults to Flow Mode (most
   * structured) for placement users, marks onboarding done, and routes to
   * the correct chapter start.
   */
  const handlePlacementComplete = (firstMissionSlug: string) => {
    if (!selectedWorld) return;
    // Default placement users to Flow Mode — they want structure since they
    // indicated some existing knowledge but want guidance on where to start.
    const mode: LearnMode = selectedMode ?? "flow";
    const difficulty: Difficulty = selectedDifficulty ?? "normal";
    setOnboarding(selectedWorld, difficulty);
    setLearnMode(mode);
    onDone?.();
    router.push(`/learn/${firstMissionSlug}`);
  };

  // Visual step index for the indicator (step 0 = index 0, etc.)
  const visualStep =
    step === 4 ? totalSteps : step === 3 && selectedMode === "classic" ? 4 : step + 1;

  // Show placement test inline when experience === "some" (world already chosen)
  if (showPlacement) {
    return (
      <PlacementTest
        world={selectedWorld ?? "fundamentals"}
        onSkip={() => { setShowPlacement(false); setStep(2); }}
        onComplete={handlePlacementComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-ink text-bone flex flex-col relative overflow-hidden">
      {/* ONBOARDING_BG full-screen background */}
      <div className="fixed inset-0 pointer-events-none">
        <Image
          src={ONBOARDING_BG}
          alt=""
          fill
          className="object-cover opacity-10 mix-blend-luminosity"
          sizes="100vw"
          priority
        />
      </div>
      <div className="relative z-10 max-w-lg mx-auto w-full px-4 pt-8 pb-4">
        <StepIndicator current={visualStep - 1} total={totalSteps} />
      </div>

      <div className="relative z-10 flex-1 max-w-lg mx-auto w-full px-4 pb-16 overflow-y-auto">
        {step === 0 && !showPlacement && <StepExperience onPick={handleExperiencePick} />}

        {step === 1 && <StepWorld onPick={handleWorldPick} experience={experience} />}

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
            difficulty={selectedMode === "flow" ? "normal" : selectedDifficulty}
            experience={experience}
            onStart={handleStart}
            onBack={() => setStep(selectedMode === "flow" ? 2 : 3)}
          />
        )}
      </div>
    </div>
  );
}
