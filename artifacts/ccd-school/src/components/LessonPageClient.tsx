"use client";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LessonPlayer } from "@/components/LessonPlayer";
import { missionBySlug, nextMission } from "@/content/missions";
import { BeatCoach, useBeatCoach } from "@/components/BeatCoach";

function Inner({ slug }: { slug: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const isReview = params.get("review") === "1";
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
  const handleComplete = () => {
    const world = mission.world === "foundations" ? "fundamentals" : mission.world;
    setTimeout(() => router.push(`/world/${world}`), 2200);
  };

  const coachContext = `${mission.title} — ${mission.tagline}`;

  return (
    <div>
      {showCoach && (
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <BeatCoach
            context={coachContext}
            autoOpen
            onClose={dismissCoach}
          />
        </div>
      )}
      <LessonPlayer
        mission={mission}
        nextSlug={next?.slug}
        isReview={isReview}
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
