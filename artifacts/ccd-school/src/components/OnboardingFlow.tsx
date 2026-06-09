"use client";
/**
 * OnboardingFlow — DJ Pawsworth guides new users through setup.
 * CCD-style: electric-blue background, Bowlby One headings,
 * chunk-shadow cards, border-4, DJ Cat mascot on every step.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useProgress } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import { chaptersByWorld } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";
import { PlacementTest } from "@/components/PlacementTest";
import { motion, AnimatePresence } from "framer-motion";

type World      = "fundamentals" | "dj" | "producer";
type LearnMode  = "flow" | "classic";
type Difficulty = "normal" | "hard";

const WORLD_ETAS: Record<string, string> = {
  fundamentals: "~3–4 weeks at 30 min/day",
  dj:           "~3–4 weeks at 30 min/day",
  producer:     "~6–8 weeks at 30 min/day",
};

const WORLDS: {
  id: World; emoji: string; title: string; tagline: string; detail: string;
  color: string; firstLesson: string;
}[] = [
  { id: "fundamentals", emoji: "🎵", title: "Fundamentals",
    tagline: "Sound, rhythm, melody, harmony & music tech",
    detail: "The vocabulary of music — built from zero. Perfect if you're new or want to fill gaps.",
    color: "bg-acid text-ink", firstLesson: "what-is-sound" },
  { id: "dj", emoji: "🎧", title: "DJ World",
    tagline: "Beatmatching, crowd reading, rekordbox, set building",
    detail: "Learn to DJ properly — from gear setup through to reading a room.",
    color: "bg-ink text-bone", firstLesson: "what-is-djing" },
  { id: "producer", emoji: "🎛", title: "Producer",
    tagline: "Ableton Live 12 — from zero to full track production",
    detail: "Every instrument, effect, and workflow in Ableton Live 12.",
    color: "bg-electric-blue text-bone", firstLesson: "what-is-live" },
];

const CHAPTER_EMOJIS: Record<string, string> = {
  "sound-science": "🔊", "rhythm-and-time": "🥁", "melody-and-pitch": "🎵",
  "harmony-and-chords": "🎹", "music-technology": "💻", "setup-and-culture": "🎧",
  "the-library": "📚", "the-mix-dj": "🎛", "dj-performance": "🎤",
  "dj-mastery": "🏆", "first-contact": "🖥", "sound-and-midi": "🎼",
  "the-mix-producer": "🎚", "performance-and-flow": "🚀", "advanced-producer": "⚡",
  synthesis: "🌀",
};

// ─── DJ Cat speech bubble messages per step ───────────────────────────────────
const CAT_MESSAGES: Record<number, string> = {
  0: "Hey! I'm DJ Pawsworth. Let me help you get started. First — how much do you already know? 🎵",
  1: "Nice! Now pick the world you want to conquer. You can always switch later. 🌍",
  2: "Almost there! Choose your learning style — I recommend Flow Mode for structure. 🌊",
  3: "You're hardcore! Pick your difficulty level. No wrong answer here. 🔥",
  4: "This is it — let's see what you're getting into. Ready to press play? 🎧",
};

// Pose per step
const CAT_POSES = ["handstand", "cap", "play", "neutral", "celebrate"] as const;
const CAT_SRCS  = [
  "/cats/cat-handstand.png",
  "/cats/cat-cap.png",
  "/cats/cat-dj.png",
  "/cats/cat-dj-hero.png",
  "/cats/cat-headphones-dance.png",
];

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-2 justify-center mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i}
          className={`h-3 w-10 brutal-border transition-all duration-300 ${
            i < current ? "bg-acid" : i === current ? "bg-acid/60" : "bg-bone/20"
          }`}
          style={i <= current ? { boxShadow: "0 0 8px hsl(84 81% 56%)" } : undefined}
        />
      ))}
    </div>
  );
}

// ─── DJ Cat mascot header for each step ──────────────────────────────────────
function StepCat({ step }: { step: number }) {
  const src = CAT_SRCS[step % CAT_SRCS.length];
  const msg = CAT_MESSAGES[step] ?? "Let's do this! 🐱";

  return (
    <motion.div
      key={step}
      initial={{ opacity: 0, scale: 0.7, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className="flex flex-col items-center gap-3 mb-8"
    >
      {/* Speech bubble */}
      <div className="relative bg-bone text-ink brutal-border px-4 py-3 chunk-shadow max-w-[280px] text-center">
        <p className="font-sans text-sm leading-snug">{msg}</p>
        {/* Arrow */}
        <span className="absolute -bottom-[18px] left-1/2 -translate-x-1/2 w-0 h-0"
          style={{ borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: "14px solid hsl(222 47% 4%)" }}
          aria-hidden />
        <span className="absolute -bottom-[12px] left-1/2 -translate-x-1/2 w-0 h-0"
          style={{ borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderTop: "11px solid hsl(20 6% 90%)" }}
          aria-hidden />
      </div>
      {/* Cat */}
      <div className="relative w-28 h-28 mt-4 wiggle"
        style={{ filter: "drop-shadow(4px 4px 0 hsl(222 47% 4%))" }}>
        <Image src={src} alt="DJ Pawsworth" fill className="object-contain" sizes="112px" priority />
      </div>
    </motion.div>
  );
}

// ─── Step 0 — Experience ──────────────────────────────────────────────────────
function StepExperience({ onPick }: { onPick: (exp: "none" | "some" | "lots") => void }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <StepCat step={0} />
      <div>
        <div className="font-mono text-xs uppercase opacity-50 mb-2">STEP 1 OF 4</div>
        <h1 className="font-display text-5xl md:text-6xl leading-none">
          HOW MUCH DO<br /><span className="text-acid">YOU KNOW?</span>
        </h1>
        <p className="font-sans text-sm opacity-60 mt-3 leading-relaxed">This helps me put you in the right place.</p>
      </div>
      <div className="space-y-3">
        {[
          { id: "none" as const,  icon: "🌱", title: "Total Beginner",  sub: "I've never made music or DJed. Start me from scratch.", color: "bg-acid text-ink" },
          { id: "some" as const,  icon: "🎛", title: "Some Experience", sub: "I've dabbled — beats, a DAW, or DJed a little.", color: "bg-bone text-ink" },
          { id: "lots" as const,  icon: "🏆", title: "Experienced",     sub: "I know music theory, produce tracks, or DJ regularly.", color: "bg-ink text-bone" },
        ].map(opt => (
          <button key={opt.id} onClick={() => onPick(opt.id)}
            className={`w-full brutal-border ${opt.color} p-5 text-left brutal-press chunk-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-transform`}>
            <div className="flex items-start gap-3">
              <span className="text-3xl shrink-0 mt-0.5">{opt.icon}</span>
              <div>
                <div className="font-display text-xl">{opt.title}</div>
                <div className="font-sans text-xs opacity-70 mt-1 leading-relaxed">{opt.sub}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Step 1 — World ───────────────────────────────────────────────────────────
function StepWorld({ onPick, experience }: { onPick: (w: World) => void; experience: "none" | "some" | "lots" | null }) {
  const isPlacementNext = experience === "some";
  return (
    <div className="space-y-6 animate-fade-in">
      <StepCat step={1} />
      <div>
        <div className="font-mono text-xs uppercase opacity-50 mb-2">STEP 2 OF 4</div>
        <h1 className="font-display text-5xl md:text-6xl leading-none">
          WHAT DO YOU<br /><span className="text-acid">WANT TO LEARN?</span>
        </h1>
        <p className="font-sans text-sm opacity-60 mt-3 leading-relaxed">
          {isPlacementNext ? "Pick a world — I'll run a quick placement test." : "Pick a world. Switch anytime from your profile."}
        </p>
      </div>
      <div className="space-y-3">
        {WORLDS.map(w => (
          <button key={w.id} onClick={() => onPick(w.id)}
            className={`w-full brutal-border ${w.color} p-6 text-left brutal-press chunk-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-transform`}>
            <div className="flex items-center gap-3">
              <span className="text-4xl shrink-0">{w.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="font-display text-2xl">{w.title}</div>
                <div className="font-sans text-xs opacity-70 mt-0.5 leading-relaxed">{w.tagline}</div>
              </div>
              <span className="font-display text-2xl opacity-60 shrink-0">{isPlacementNext ? "→ test" : "→"}</span>
            </div>
          </button>
        ))}
      </div>
      <div className="text-center">
        <button onClick={() => onPick("fundamentals")}
          className="font-mono text-xs uppercase opacity-40 hover:opacity-70 underline underline-offset-2">
          Not sure? Start with Fundamentals
        </button>
      </div>
    </div>
  );
}

// ─── Step 2 — Mode ────────────────────────────────────────────────────────────
function StepMode({ world, onPick, onBack }: { world: World; onPick: (m: LearnMode) => void; onBack: () => void }) {
  const w = WORLDS.find(x => x.id === world)!;
  return (
    <div className="space-y-6 animate-fade-in">
      <StepCat step={2} />
      <div>
        <button onClick={onBack} className="font-mono text-xs uppercase opacity-40 hover:opacity-70 mb-4 block">← back</button>
        <div className="font-mono text-xs uppercase opacity-50 mb-2">STEP 3 OF 4</div>
        <h1 className="font-display text-5xl md:text-6xl leading-none">
          PICK YOUR<br /><span className="text-acid">LEARNING STYLE</span>
        </h1>
        <div className={`brutal-border ${w.color} px-4 py-2 inline-flex items-center gap-2 mt-3`}>
          <span>{w.emoji}</span>
          <span className="font-mono text-xs uppercase">{w.title}</span>
        </div>
      </div>
      <div className="space-y-4">
        <button onClick={() => onPick("flow")}
          className="w-full brutal-border bg-acid text-ink p-5 text-left brutal-press chunk-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-transform">
          <div className="flex items-start gap-4">
            <span className="text-4xl shrink-0 mt-0.5">🌊</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="font-display text-2xl">FLOW MODE</div>
                <span className="brutal-border bg-ink text-bone px-2 py-0.5 font-mono text-[9px] uppercase">RECOMMENDED</span>
              </div>
              <div className="font-sans text-xs opacity-80 leading-relaxed mb-3">
                Structured like Duolingo — missions unlock one by one. Wrong answers cost a heart.
              </div>
              <div className="grid grid-cols-2 gap-1.5 font-mono text-[9px] uppercase">
                {[["🔒","Sequential unlocking"],["❤️","Hearts on wrong answers"],["⚡","XP gating"],["🏆","Trophy rewards"]].map(([ic,tx]) => (
                  <div key={tx} className="flex items-center gap-1.5 opacity-80"><span>{ic}</span><span>{tx}</span></div>
                ))}
              </div>
            </div>
          </div>
        </button>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-ink/20" />
          <span className="font-mono text-[9px] uppercase opacity-40">or</span>
          <div className="flex-1 h-px bg-ink/20" />
        </div>
        <button onClick={() => onPick("classic")}
          className="w-full brutal-border bg-bone text-ink p-5 text-left brutal-press chunk-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-transform">
          <div className="flex items-start gap-4">
            <span className="text-4xl shrink-0 mt-0.5">🔓</span>
            <div className="flex-1">
              <div className="font-display text-2xl mb-1">FREE MODE</div>
              <div className="font-sans text-xs opacity-70 leading-relaxed">
                All lessons open from day one. Browse freely, no hearts, no gates.
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

// ─── Step 3 — Difficulty ──────────────────────────────────────────────────────
function StepDifficulty({ world, onPick, onBack }: { world: World; onPick: (d: Difficulty) => void; onBack: () => void }) {
  const w = WORLDS.find(x => x.id === world)!;
  return (
    <div className="space-y-6 animate-fade-in">
      <StepCat step={3} />
      <div>
        <button onClick={onBack} className="font-mono text-xs uppercase opacity-40 hover:opacity-70 mb-4 block">← back</button>
        <div className="font-mono text-xs uppercase opacity-50 mb-2">STEP 4 OF 5</div>
        <h1 className="font-display text-5xl md:text-6xl leading-none">
          ADJUST THE<br /><span className="text-acid">DIFFICULTY</span>
        </h1>
      </div>
      <div className="space-y-3">
        <button onClick={() => onPick("normal")}
          className="w-full brutal-border bg-bone text-ink p-5 text-left brutal-press chunk-shadow hover:bg-acid/30 transition-colors">
          <div className="flex items-start gap-3">
            <span className="text-3xl shrink-0 mt-0.5">📖</span>
            <div>
              <div className="font-display text-xl">Normal</div>
              <div className="font-sans text-xs opacity-70 mt-1 leading-relaxed">Full hints, standard questions, 50% pass threshold.</div>
            </div>
          </div>
        </button>
        <button onClick={() => onPick("hard")}
          className="w-full brutal-border bg-hot text-bone p-5 text-left brutal-press chunk-shadow">
          <div className="flex items-start gap-3">
            <span className="text-3xl shrink-0 mt-0.5">🔥</span>
            <div>
              <div className="font-display text-xl">Hard</div>
              <div className="font-sans text-xs opacity-80 mt-1 leading-relaxed">No hints, harder questions, 70% pass threshold.</div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

// ─── Step 4 — Overview + Launch ───────────────────────────────────────────────
function StepOverview({ world, mode, difficulty, experience, onStart, onBack }: {
  world: World; mode: LearnMode; difficulty: Difficulty;
  experience: "none" | "some" | "lots" | null; onStart: () => void; onBack: () => void;
}) {
  const w = WORLDS.find(x => x.id === world)!;
  const chapters = chaptersByWorld(world);
  const allPaths = pathsByWorld(world);
  const totalMissions = allPaths.flatMap(p => p.missionSlugs).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <StepCat step={4} />
      <div>
        <button onClick={onBack} className="font-mono text-xs uppercase opacity-40 hover:opacity-70 mb-4 block">← back</button>
        <div className="font-mono text-xs uppercase opacity-50 mb-2">
          {mode === "flow" ? "STEP 4 OF 4" : "STEP 5 OF 5"}
        </div>
        <h1 className="font-display text-5xl md:text-6xl leading-none">
          HERE&apos;S WHAT<br /><span className="text-acid">YOU&apos;LL LEARN</span>
        </h1>
      </div>

      {/* World hero card */}
      <div className={`brutal-border ${w.color} p-5 chunk-shadow`}>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{w.emoji}</span>
          <div>
            <div className="font-display text-3xl">{w.title}</div>
            <div className="font-sans text-xs opacity-70 mt-0.5">{w.tagline}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 font-mono text-[10px] uppercase mt-3">
          <span className="brutal-border bg-ink/10 px-2 py-1">{chapters.length} chapters</span>
          <span className="brutal-border bg-ink/10 px-2 py-1">{allPaths.length} paths</span>
          <span className="brutal-border bg-ink/10 px-2 py-1">{totalMissions} missions</span>
          <span className="brutal-border bg-acid/80 text-ink px-2 py-1">⏱ {WORLD_ETAS[world]}</span>
        </div>
      </div>

      {/* Chapter breakdown */}
      <div>
        <div className="font-mono text-xs uppercase opacity-50 mb-3">// CHAPTERS</div>
        <div className="space-y-2">
          {chapters.map((ch, i) => {
            const paths = allPaths.filter(p => p.chapter === ch.slug);
            const missionCount = paths.flatMap(p => p.missionSlugs).length;
            const emoji = CHAPTER_EMOJIS[ch.slug] ?? "📖";
            return (
              <div key={ch.slug} className="brutal-border bg-bone/10 p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0 mt-0.5">{emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="font-display text-base leading-tight">{ch.title}</div>
                      <div className="font-mono text-[9px] uppercase opacity-50 shrink-0">{missionCount} missions</div>
                    </div>
                    <div className="font-sans text-xs opacity-60 mt-0.5 leading-snug">{ch.tagline}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Setup summary */}
      <div className="brutal-border bg-bone/10 p-4 space-y-2">
        <div className="font-mono text-xs uppercase opacity-50 mb-1">YOUR SETUP</div>
        {[
          ["World", w.title],
          ["Mode", mode === "flow" ? "🌊 Flow Mode" : "🔓 Free Mode"],
          ...(mode === "classic" ? [["Difficulty", difficulty === "hard" ? "🔥 Hard" : "📖 Normal"]] : []),
        ].map(([label, value]) => (
          <div key={label} className="flex items-center gap-3 font-sans text-sm">
            <span className="text-acid font-bold shrink-0">✓</span>
            {label}: <strong>{value}</strong>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button onClick={onStart}
        className="w-full brutal-border bg-acid text-ink py-6 font-display text-4xl brutal-press chunk-shadow ccd-btn-hover animate-pulse-glow">
        START FIRST LESSON →
      </button>
      <div className="font-mono text-[10px] uppercase opacity-40 text-center">Free to start · No sign-up required</div>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-ink/95 border-t-4 border-acid md:hidden"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" }}>
        <button onClick={onStart}
          className="w-full brutal-border bg-acid text-ink py-4 font-display text-2xl brutal-press chunk-shadow">
          START NOW →
        </button>
      </div>
      <div className="h-20 md:hidden" aria-hidden />
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function OnboardingFlow({ onDone }: { onDone?: () => void }) {
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [selectedWorld,      setSelectedWorld]      = useState<World | null>(null);
  const [selectedMode,       setSelectedMode]       = useState<LearnMode | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("normal");
  const [experience,         setExperience]         = useState<"none" | "some" | "lots" | null>(null);
  const [showPlacement,      setShowPlacement]      = useState(false);

  const { setOnboarding } = useProgress();
  const { setLearnMode }  = useLearnMode();
  const router            = useRouter();

  const totalSteps = selectedMode === "flow" ? 4 : 5;

  const handleExperiencePick = (exp: "none" | "some" | "lots") => { setExperience(exp); setStep(1); };
  const handleWorldPick = (w: World) => {
    setSelectedWorld(w);
    if (experience === "some") { setShowPlacement(true); } else { setStep(2); }
  };
  const handleModePick = (m: LearnMode) => {
    setSelectedMode(m);
    if (m === "flow") { setStep(4); } else { setStep(3); }
  };
  const handleDifficultyPick = (d: Difficulty) => { setSelectedDifficulty(d); setStep(4); };

  const handleStart = () => {
    if (!selectedWorld || !selectedMode) return;
    const difficulty = selectedMode === "flow" ? "normal" : selectedDifficulty;
    setOnboarding(selectedWorld, difficulty);
    setLearnMode(selectedMode);
    const firstLesson = WORLDS.find(w => w.id === selectedWorld)!.firstLesson;
    onDone?.();
    router.push(`/learn/${firstLesson}`);
  };

  const handlePlacementComplete = (firstMissionSlug: string) => {
    if (!selectedWorld) return;
    const mode: LearnMode      = selectedMode ?? "flow";
    const difficulty: Difficulty = selectedDifficulty ?? "normal";
    setOnboarding(selectedWorld, difficulty);
    setLearnMode(mode);
    onDone?.();
    router.push(`/learn/${firstMissionSlug}`);
  };

  const visualStep = step === 4 ? totalSteps : step === 3 && selectedMode === "classic" ? 4 : step + 1;

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
    <div className="min-h-screen bg-electric-blue text-bone flex flex-col relative overflow-hidden">
      {/* Dot-grid texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.06]"
        style={{ backgroundImage: "radial-gradient(hsl(222 47% 4%) 1px, transparent 1px)", backgroundSize: "4px 4px" }}
        aria-hidden />

      {/* Step indicator */}
      <div className="relative z-10 max-w-lg mx-auto w-full px-4 pt-8 pb-2">
        <StepIndicator current={visualStep - 1} total={totalSteps} />
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 flex-1 max-w-lg mx-auto w-full px-4 pb-16 overflow-y-auto"
        >
          {step === 0 && <StepExperience onPick={handleExperiencePick} />}
          {step === 1 && <StepWorld onPick={handleWorldPick} experience={experience} />}
          {step === 2 && selectedWorld && <StepMode world={selectedWorld} onPick={handleModePick} onBack={() => setStep(1)} />}
          {step === 3 && selectedWorld && selectedMode === "classic" && (
            <StepDifficulty world={selectedWorld} onPick={handleDifficultyPick} onBack={() => setStep(2)} />
          )}
          {step === 4 && selectedWorld && selectedMode && (
            <StepOverview
              world={selectedWorld} mode={selectedMode}
              difficulty={selectedMode === "flow" ? "normal" : selectedDifficulty}
              experience={experience} onStart={handleStart}
              onBack={() => setStep(selectedMode === "flow" ? 2 : 3)}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
