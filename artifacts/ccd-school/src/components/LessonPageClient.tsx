"use client";
/**
 * LessonPageClient — mode-aware lesson router.
 *
 * PATH MODE   (learnMode === "ccd"):
 *   → LessonPlayer  (Duolingo screens: hook→concept→interact→quiz→summary)
 *   → Hearts active, sequential gating, XP on completion
 *   → If mission has no screens yet, falls back to InlineClassic with a banner
 *
 * EXPLORER MODE (learnMode === "classic"):
 *   → InlineClassic  (scrolling explainer + sim + quiz, no hearts)
 *   → All missions always accessible, no gating
 *
 * Both modes live at /learn/[slug] — same URL, completely different experience.
 */
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LessonPlayer } from "@/components/LessonPlayer";
import { InlineClassicLesson } from "@/components/InlineClassicLesson";
import { missionBySlug, nextMission } from "@/content/missions";
import { FloatingCoachButton } from "@/components/BeatCoach";
import { useLearnMode } from "@/lib/mode";

function CcdFallbackBanner() {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-4">
      <div className="brutal-border bg-bone text-ink px-5 py-4 flex items-start gap-3">
        <span className="text-2xl shrink-0">🛠</span>
        <div>
          <div className="font-display text-base mb-1">Classic View</div>
          <div className="font-mono text-xs opacity-70 leading-relaxed">
            Full CCD interactive lesson coming soon. Enjoy the Classic format — same content, simulator, quiz, and XP.
          </div>
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
  const coachContext = `${mission.title} — ${mission.tagline}`;

  const handleComplete = () => {
    const world = mission.world === "foundations" ? "fundamentals" : mission.world;
    setTimeout(() => router.push(`/world/${world}`), 2200);
  };

  // ── PATH MODE ─────────────────────────────────────────────────────────────
  if (learnMode === "ccd") {
    return (
      <div>
        {/* Has Duolingo screens → full LessonPlayer */}
        {hasScreens ? (
          <LessonPlayer
            mission={mission}
            nextSlug={next?.slug}
            isReview={isReview}
            onComplete={handleComplete}
          />
        ) : (
          /* No screens yet → show banner + inline classic */
          <>
            <CcdFallbackBanner />
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

  // ── EXPLORER MODE ─────────────────────────────────────────────────────────
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
