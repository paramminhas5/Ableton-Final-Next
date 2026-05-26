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
import { BeatCoach, useBeatCoach } from "@/components/BeatCoach";
import { useLearnMode } from "@/lib/mode";
import Link from "next/link";

function ModeModeBanner({ slug }: { slug: string }) {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-4">
      <div className="brutal-border bg-sun text-ink px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <div className="font-mono text-[9px] uppercase opacity-60 mb-0.5">Path Mode — screens not built yet</div>
          <div className="font-mono text-xs">Loading classic view for this lesson.</div>
        </div>
        <Link href={`/mission/${slug}`} className="brutal-border bg-ink text-bone px-3 py-1.5 font-mono text-[9px] uppercase brutal-press shrink-0">
          Full Classic →
        </Link>
      </div>
    </div>
  );
}

function Inner({ slug }: { slug: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const isReview = params.get("review") === "1";
  const { learnMode } = useLearnMode();
  const { wrongCount, showCoach, onWrong, onCorrect, dismissCoach } = useBeatCoach();

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
        {showCoach && (
          <div className="max-w-2xl mx-auto px-4 pt-4">
            <BeatCoach context={coachContext} autoOpen onClose={dismissCoach} />
          </div>
        )}

        {/* Has Duolingo screens → full LessonPlayer */}
        {hasScreens ? (
          <LessonPlayer
            mission={mission}
            nextSlug={next?.slug}
            isReview={isReview}
            onComplete={handleComplete}
            onWrong={onWrong}
            onCorrect={onCorrect}
          />
        ) : (
          /* No screens yet → show banner + inline classic */
          <>
            <ModeModeBanner slug={slug} />
            <InlineClassicLesson
              mission={mission}
              nextSlug={next?.slug}
              isReview={isReview}
              mode="path"
              onComplete={handleComplete}
              onWrong={onWrong}
              onCorrect={onCorrect}
            />
          </>
        )}

        {!showCoach && (
          <div className="max-w-2xl mx-auto px-4 pb-8">
            <BeatCoach context={coachContext} />
          </div>
        )}
      </div>
    );
  }

  // ── EXPLORER MODE ─────────────────────────────────────────────────────────
  return (
    <div>
      {showCoach && (
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <BeatCoach context={coachContext} autoOpen onClose={dismissCoach} />
        </div>
      )}

      <InlineClassicLesson
        mission={mission}
        nextSlug={next?.slug}
        isReview={isReview}
        mode="explore"
        onComplete={handleComplete}
        onWrong={onWrong}
        onCorrect={onCorrect}
      />

      {!showCoach && (
        <div className="max-w-2xl mx-auto px-4 pb-8">
          <BeatCoach context={coachContext} />
        </div>
      )}
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
