"use client";
/**
 * OnboardingFlow — 3-screen welcome shown once to new users.
 *
 * Screen 1: Pick your world (Fundamentals / DJ / Producer)
 * Screen 2: How do you like to learn? (Path mode / Classic mode)
 * Screen 3: Try your first lesson — CTA, no account needed
 *
 * Saves selection to progress via setOnboarding().
 * Replaces HomeClient landing for brand-new users with zero progress.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProgress } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";

type World = "fundamentals" | "dj" | "producer";

const WORLDS: { id: World; emoji: string; title: string; tagline: string; color: string; firstLesson: string }[] = [
  {
    id: "fundamentals",
    emoji: "🎵",
    title: "Fundamentals",
    tagline: "Sound, rhythm, melody, harmony & music tech from zero.",
    color: "bg-acid text-ink",
    firstLesson: "what-is-sound",
  },
  {
    id: "dj",
    emoji: "🎧",
    title: "DJ World",
    tagline: "Beatmatching, crowd reading, rekordbox, set building.",
    color: "bg-ink text-bone",
    firstLesson: "what-is-djing",
  },
  {
    id: "producer",
    emoji: "🎛",
    title: "Producer",
    tagline: "Ableton Live 12 from zero to full track production.",
    color: "bg-sun text-ink",
    firstLesson: "what-is-live",
  },
];

const LEARN_MODES: { id: "ccd" | "classic"; emoji: string; title: string; desc: string; color: string }[] = [
  {
    id: "ccd",
    emoji: "🔒",
    title: "Path Mode",
    desc: "Lessons unlock one by one. Wrong answers cost a heart. Like Duolingo — structured and motivating.",
    color: "bg-volt text-bone",
  },
  {
    id: "classic",
    emoji: "🗺",
    title: "Explorer Mode",
    desc: "All lessons open from the start. Jump anywhere, no hearts, no gates. Normal or Hard quiz difficulty.",
    color: "bg-bone text-ink",
  },
];

export function OnboardingFlow({ onDone }: { onDone?: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedWorld, setSelectedWorld] = useState<World | null>(null);
  const [selectedMode, setSelectedMode] = useState<"ccd" | "classic" | null>(null);
  const { setOnboarding } = useProgress();
  const { setLearnMode } = useLearnMode();
  const router = useRouter();

  const handleWorldPick = (w: World) => {
    setSelectedWorld(w);
    setStep(2);
  };

  const handleModePick = (mode: "ccd" | "classic") => {
    setSelectedMode(mode);
    setStep(3);
  };

  const handleStart = () => {
    if (!selectedWorld || !selectedMode) return;
    setOnboarding(selectedWorld);
    setLearnMode(selectedMode);
    const firstLesson = WORLDS.find(w => w.id === selectedWorld)!.firstLesson;
    onDone?.();
    router.push(`/learn/${firstLesson}`);
  };

  return (
    <div className="min-h-screen bg-ink text-bone flex flex-col">
      {/* Step indicator */}
      <div className="flex gap-2 p-4 justify-center">
        {[1, 2, 3].map(s => (
          <div key={s} className={`h-2 w-10 brutal-border transition-all duration-300 ${
            s <= step ? "bg-acid" : "bg-bone/20"
          }`} />
        ))}
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full px-4 py-8">

        {/* ── STEP 1: Pick world ── */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <div className="font-mono text-[10px] uppercase opacity-50 mb-2">STEP 1 OF 3</div>
              <h1 className="font-display text-5xl leading-none">
                WHAT ARE YOU<br />
                <span className="text-acid">HERE TO LEARN?</span>
              </h1>
              <p className="font-mono text-sm opacity-60 mt-3 leading-relaxed">
                Pick a world. You can switch anytime.
              </p>
            </div>
            <div className="space-y-3">
              {WORLDS.map(w => (
                <button
                  key={w.id}
                  onClick={() => handleWorldPick(w.id)}
                  className={`w-full brutal-border ${w.color} p-5 text-left brutal-press brutal-shadow transition-all hover:scale-[1.01]`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{w.emoji}</span>
                    <div>
                      <div className="font-display text-2xl">{w.title}</div>
                      <div className="font-mono text-xs opacity-70 mt-0.5">{w.tagline}</div>
                    </div>
                    <span className="ml-auto font-display text-2xl opacity-60">→</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="text-center">
              <button
                onClick={() => { setSelectedWorld("fundamentals"); setStep(2); }}
                className="font-mono text-[10px] uppercase opacity-40 hover:opacity-70 underline underline-offset-2"
              >
                Not sure? Start with Fundamentals
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Pick mode ── */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <button onClick={() => setStep(1)} className="font-mono text-[10px] uppercase opacity-40 hover:opacity-70 mb-4 block">← back</button>
              <div className="font-mono text-[10px] uppercase opacity-50 mb-2">STEP 2 OF 3</div>
              <h1 className="font-display text-5xl leading-none">
                HOW DO YOU<br />
                <span className="text-acid">LIKE TO LEARN?</span>
              </h1>
            </div>
            <div className="space-y-3">
              {LEARN_MODES.map(m => (
                <button
                  key={m.id}
                  onClick={() => handleModePick(m.id)}
                  className={`w-full brutal-border ${m.color} p-5 text-left brutal-press brutal-shadow`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl shrink-0 mt-0.5">{m.emoji}</span>
                    <div>
                      <div className="font-display text-xl">{m.title}</div>
                      <div className="font-mono text-xs opacity-70 mt-1 leading-relaxed">{m.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 3: Launch ── */}
        {step === 3 && selectedWorld && selectedMode && (
          <div className="space-y-6 animate-fade-in text-center">
            <button onClick={() => setStep(2)} className="font-mono text-[10px] uppercase opacity-40 hover:opacity-70 block mx-auto">← back</button>
            <div className="font-mono text-[10px] uppercase opacity-50">STEP 3 OF 3</div>

            <div>
              <div className="text-6xl mb-4">{WORLDS.find(w => w.id === selectedWorld)!.emoji}</div>
              <h1 className="font-display text-5xl leading-none">
                YOU&apos;RE READY.<br />
                <span className="text-acid">LET&apos;S GO.</span>
              </h1>
            </div>

            <div className="brutal-border bg-bone/10 p-4 text-left space-y-2">
              <div className="font-mono text-[10px] uppercase opacity-50">YOUR SETUP</div>
              <div className="flex items-center gap-3 font-mono text-sm">
                <span className="text-acid">✓</span>
                World: <strong>{WORLDS.find(w => w.id === selectedWorld)!.title}</strong>
              </div>
              <div className="flex items-center gap-3 font-mono text-sm">
                <span className="text-acid">✓</span>
                Mode: <strong>{selectedMode === "ccd" ? "🔒 Path Mode" : "🗺 Explorer Mode"}</strong>
              </div>
              <div className="flex items-center gap-3 font-mono text-sm">
                <span className="text-acid">✓</span>
                No account needed to start
              </div>
            </div>

            <button
              onClick={handleStart}
              className="w-full brutal-border bg-acid text-ink py-5 font-display text-3xl brutal-press brutal-shadow"
            >
              START FIRST LESSON →
            </button>

            <div className="font-mono text-[10px] uppercase opacity-40">
              First lesson is always free. No sign-up required.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
