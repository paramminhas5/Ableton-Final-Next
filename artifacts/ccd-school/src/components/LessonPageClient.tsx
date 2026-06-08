"use client";
/**
 * LessonPageClient — mode-aware lesson router.
 *
 * FLOW MODE   (learnMode === "flow"):
 *   → LessonPlayer  (Duolingo screens: hook→concept→interact→quiz→summary)
 *   → Hearts active, sequential gating, XP on completion
 *   → If mission has no screens yet, falls back to InlineClassic with improved banner (#10)
 *
 * FREE MODE (learnMode === "classic"):
 *   → InlineClassic  (scrolling explainer + sim + quiz, no hearts)
 *   → All missions always accessible, no gating
 *
 * Both modes live at /learn/[slug] — same URL, completely different experience.
 *
 * Fixes:
 *   #6  — handleComplete uses getMissionContext for correct world route
 *   #10 — PathFallbackBanner is clean, informative, not misleading
 */
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LessonPlayer } from "@/components/LessonPlayer";
import { InlineClassicLesson } from "@/components/InlineClassicLesson";
import { missionBySlug, nextMission } from "@/content/missions";
import { FloatingCoachButton } from "@/components/BeatCoach";
import { useLearnMode } from "@/lib/mode";
import { getMissionContext } from "@/lib/missionContext";

// ── Flow Mode fallback banner — shown when a lesson has no screens yet ────────
// Clean, informative — makes it clear this is the explore format, not broken FLOW MODE
function FlowFallbackBanner({ missionTitle }: { missionTitle: string }) {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-4">
      <div className="brutal-border bg-acid text-ink px-5 py-4">
        <div className="flex items-start gap-3 mb-2">
          <span className="text-xl shrink-0">🌊</span>
          <div>
            <div className="font-display text-base">FLOW MODE — Explore Format</div>
            <div className="font-mono text-xs opacity-60 mt-0.5">
              {missionTitle}
            </div>
          </div>
        </div>
        <div className="font-mono text-xs opacity-80 leading-relaxed">
          This lesson uses the scrolling format. Complete the quiz to unlock the next lesson and earn your XP.
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

  // Resolve correct world route via context (fixes Producer sub-world slug bug)
  const ctx = getMissionContext(slug);

  const coachContext = [
    `[World: ${ctx?.world ?? "unknown"}]`,
    `[${learnMode === "flow" ? "Flow Mode" : "Free Mode"}]`,
    `Lesson: ${mission.title} — ${mission.tagline}.`,
    ctx?.chapter?.title ? `Chapter: ${ctx.chapter.title}.` : "",
  ].filter(Boolean).join(" ");
  const worldRoute = ctx.worldRoute || "/worlds";

  // Mission position within its path (for breadcrumb "N of M")
  const missionIndex = ctx.path
    ? ctx.path.missionSlugs.indexOf(slug) + 1
    : 1;
  const missionTotal = ctx.path?.missionSlugs.length ?? 1;

  const handleComplete = () => {
    const destination = isReview ? "/review" : "/dashboard";
    setTimeout(() => router.push(destination), 2200);
  };

  // ── FLOW MODE ──────────────────────────────────────────────────────────────
  if (learnMode === "flow") {
    return (
      <div>
        {hasScreens ? (
          /* Full Duolingo-style lesson */
          <LessonPlayer
            mission={mission}
            nextSlug={next?.slug}
            isReview={isReview}
            missionIndex={missionIndex}
            missionTotal={missionTotal}
            onComplete={handleComplete}
          />
        ) : (
          /* No screens yet → informative banner + inline classic (no hearts deducted) */
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
