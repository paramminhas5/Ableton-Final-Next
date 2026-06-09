"use client";
/**
 * LessonPageClient — mode-aware lesson router.
 *
 * FLOW MODE (learnMode === "flow"):
 *   → LessonPlayer (Duolingo screens) if screens exist, else InlineClassic fallback
 *   → On complete: shows NextLessonInterstitial then auto-advances to next lesson
 *   → If no next lesson: routes back to the world snake
 *
 * FREE MODE (learnMode === "classic"):
 *   → InlineClassic (scrolling explainer + sim + quiz, no hearts)
 *   → On complete: routes to /dashboard
 */
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Suspense, useState, useEffect } from "react";
import { LessonPlayer } from "@/components/LessonPlayer";
import { InlineClassicLesson } from "@/components/InlineClassicLesson";
import { missionBySlug, nextMission } from "@/content/missions";
import { FloatingCoachButton } from "@/components/BeatCoach";
import { useLearnMode } from "@/lib/mode";
import { getMissionContext } from "@/lib/missionContext";

// ── Cat speech-bubble quips per world ─────────────────────────────────────────
const NEXT_QUIPS: Record<string, string[]> = {
  fundamentals: [
    "That's the foundation. Now let's build on it! 🎵",
    "You're getting it! Music theory unlocked. 🔑",
    "Knowledge stacking nicely. Keep going! 📚",
    "One more piece of the puzzle. You've got this! 🧩",
  ],
  dj: [
    "The dancefloor awaits. Next lesson incoming! 🎧",
    "DJ skills loading... one lesson at a time. 🎚",
    "Your mix is getting smoother. Keep pushing! 🔊",
    "The crowd can feel the difference. Let's go! 🕺",
  ],
  producer: [
    "Ableton mastery in progress. You're killing it! 🎛",
    "Studio skills unlocked. Next chapter awaits! 🎼",
    "Your sound is evolving. Keep building! ⚡",
    "Production level up! Don't stop now. 🚀",
  ],
};

const CAT_IMAGES: Record<string, string> = {
  fundamentals: "/cats/cat-handstand.png",
  dj: "/cats/cat-dj.png",
  producer: "/cats/cat-dj-hero.png",
};

// ── Next Lesson Interstitial — full-screen celebration before advancing ────────
function NextLessonInterstitial({
  currentTitle,
  nextSlug,
  nextTitle,
  nextTagline,
  nextXp,
  world,
  worldRoute,
  onContinue,
}: {
  currentTitle: string;
  nextSlug: string | null;
  nextTitle: string | null;
  nextTagline: string | null;
  nextXp: number;
  world: string | null;
  worldRoute: string;
  onContinue: () => void;
}) {
  const [countdown, setCountdown] = useState(4);
  const catSrc = CAT_IMAGES[world ?? "fundamentals"] ?? "/cats/cat-dj-hero.png";
  const quips = NEXT_QUIPS[world ?? "fundamentals"] ?? NEXT_QUIPS.fundamentals;
  const quip = quips[Math.floor(Math.random() * quips.length)];

  // Auto-advance after countdown
  useEffect(() => {
    if (countdown <= 0) { onContinue(); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, onContinue]);

  return (
    <div className="fixed inset-0 z-50 bg-acid flex flex-col items-center justify-center px-4 text-ink">
      {/* Cat mascot */}
      <div className="relative mb-4" style={{ filter: "drop-shadow(4px 4px 0 hsl(222 47% 4%))" }}>
        <Image
          src={catSrc}
          alt="DJ Pawsworth celebrating"
          width={140}
          height={140}
          className="animate-bounce-bob"
        />
        {/* Speech bubble */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-max max-w-[200px]">
          <div className="brutal-border bg-bone text-ink px-3 py-2 font-display text-xs text-center leading-snug">
            {quip}
          </div>
          {/* Bubble tail */}
          <div className="w-3 h-3 bg-bone border-r-2 border-b-2 border-ink mx-auto -mt-0.5 rotate-45" />
        </div>
      </div>

      {/* Completed pill */}
      <div className="brutal-border bg-ink text-bone px-4 py-1 font-mono text-[10px] uppercase mb-6">
        ✓ COMPLETED — {currentTitle}
      </div>

      {nextSlug && nextTitle ? (
        <>
          <div className="font-mono text-[10px] uppercase opacity-60 mb-2">UP NEXT</div>
          <div className="brutal-border bg-bone text-ink p-5 max-w-sm w-full text-center brutal-shadow mb-6">
            <div className="font-display text-2xl leading-tight mb-1">{nextTitle}</div>
            {nextTagline && (
              <div className="font-mono text-xs opacity-60 leading-snug mb-3">{nextTagline}</div>
            )}
            <div className="font-mono text-[10px] uppercase opacity-50">+{nextXp} XP</div>
          </div>
          <button
            onClick={onContinue}
            className="brutal-border bg-ink text-bone px-8 py-4 font-display text-xl brutal-press chunk-shadow hover:bg-electric-blue transition-colors mb-3"
          >
            START NEXT LESSON →
          </button>
          <div className="font-mono text-[10px] uppercase opacity-50">
            Auto-continuing in {countdown}s…
          </div>
        </>
      ) : (
        <>
          <div className="font-display text-3xl mb-2">🏆 PATH COMPLETE!</div>
          <div className="font-mono text-sm opacity-70 mb-6 text-center max-w-xs">
            You finished this section. Head back to your world map to see what&apos;s unlocked.
          </div>
          <button
            onClick={onContinue}
            className="brutal-border bg-ink text-bone px-8 py-4 font-display text-xl brutal-press chunk-shadow hover:bg-electric-blue transition-colors"
          >
            BACK TO WORLD MAP →
          </button>
        </>
      )}
    </div>
  );
}

// ── Flow Mode fallback banner ─────────────────────────────────────────────────
function FlowFallbackBanner({ missionTitle }: { missionTitle: string }) {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-4">
      <div className="brutal-border bg-acid text-ink px-5 py-4">
        <div className="flex items-start gap-3 mb-2">
          <span className="text-xl shrink-0">🌊</span>
          <div>
            <div className="font-display text-base">FLOW MODE</div>
            <div className="font-mono text-xs opacity-60 mt-0.5">{missionTitle}</div>
          </div>
        </div>
        <div className="font-mono text-xs opacity-80 leading-relaxed">
          Complete the quiz below to unlock the next lesson and earn your XP.
        </div>
        <div className="mt-3 flex flex-wrap gap-2 font-mono text-[9px] uppercase">
          <span className="brutal-border bg-ink/20 px-2 py-1">✓ Full content</span>
          <span className="brutal-border bg-ink/20 px-2 py-1">✓ Interactive sim</span>
          <span className="brutal-border bg-ink/20 px-2 py-1">✓ Quiz + XP</span>
        </div>
      </div>
    </div>
  );
}

function Inner({ slug }: { slug: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const isReview = params.get("review") === "1";
  const { learnMode } = useLearnMode();
  const [showInterstitial, setShowInterstitial] = useState(false);

  const mission = missionBySlug(slug);
  if (!mission) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 font-mono text-xl">
        Mission not found: {slug}
      </div>
    );
  }

  const next = nextMission(slug);
  const hasScreens = (mission.screens?.length ?? 0) > 0;
  const ctx = getMissionContext(slug);
  const worldRoute = ctx.worldRoute || "/worlds";

  const missionIndex = ctx.path
    ? ctx.path.missionSlugs.indexOf(slug) + 1
    : 1;
  const missionTotal = ctx.path?.missionSlugs.length ?? 1;

  const coachContext = [
    `[World: ${ctx?.world ?? "unknown"}]`,
    `[${learnMode === "flow" ? "Flow Mode" : "Free Mode"}]`,
    ctx?.chapter?.title ? `[Chapter: ${ctx.chapter.title}]` : "",
    ctx?.path?.title ? `[Path: ${ctx.path.title}]` : "",
    `Lesson: "${mission.title}" — ${mission.tagline}.`,
    `Mission ${missionIndex} of ${missionTotal} in this path.`,
  ].filter(Boolean).join(" ");

  // Find next mission details for interstitial
  const nextMissionData = next ? missionBySlug(next.slug) : null;

  const handleComplete = () => {
    if (isReview) {
      setTimeout(() => router.push("/review"), 1500);
      return;
    }
    if (learnMode === "flow") {
      // Show the cat interstitial, then navigate
      setShowInterstitial(true);
    } else {
      // Free mode: just go to dashboard
      setTimeout(() => router.push("/dashboard"), 1500);
    }
  };

  const handleInterstitialContinue = () => {
    if (next?.slug) {
      router.push(`/learn/${next.slug}`);
    } else {
      router.push(worldRoute);
    }
  };

  // ── FLOW MODE ──────────────────────────────────────────────────────────────
  if (learnMode === "flow") {
    return (
      <div>
        {showInterstitial && (
          <NextLessonInterstitial
            currentTitle={mission.title}
            nextSlug={next?.slug ?? null}
            nextTitle={nextMissionData?.title ?? next?.title ?? null}
            nextTagline={nextMissionData?.tagline ?? null}
            nextXp={nextMissionData?.xp ?? 40}
            world={ctx.world}
            worldRoute={worldRoute}
            onContinue={handleInterstitialContinue}
          />
        )}
        {hasScreens ? (
          <LessonPlayer
            mission={mission}
            nextSlug={next?.slug}
            isReview={isReview}
            missionIndex={missionIndex}
            missionTotal={missionTotal}
            onComplete={handleComplete}
          />
        ) : (
          <>
            <FlowFallbackBanner missionTitle={mission.title} />
            <InlineClassicLesson
              mission={mission}
              nextSlug={next?.slug}
              isReview={isReview}
              mode="path"
              onComplete={handleComplete}
            />
          </>
        )}
        <FloatingCoachButton context={coachContext} />
      </div>
    );
  }

  // ── FREE MODE ───────────────────────────────────────────────────────────────
  return (
    <div>
      <InlineClassicLesson
        mission={mission}
        nextSlug={next?.slug}
        isReview={isReview}
        mode="explore"
        onComplete={handleComplete}
      />
      <FloatingCoachButton context={coachContext} />
    </div>
  );
}

export function LessonPageClient({ slug }: { slug: string }) {
  return (
    <Suspense fallback={<div className="p-8 font-mono text-sm animate-pulse">Loading lesson…</div>}>
      <Inner slug={slug} />
    </Suspense>
  );
}
