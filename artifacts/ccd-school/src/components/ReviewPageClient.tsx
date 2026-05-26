"use client";
/**
 * ReviewPageClient — Spaced repetition review session.
 *
 * Shows all missions whose strength has decayed below REVIEW_THRESHOLD,
 * sorted by weakest first. User can launch any of them in review mode
 * (LessonPlayer with isReview=true, which calls reviewMission() instead
 * of completeMission() on finish).
 *
 * Also displays a strength bar so users can see which lessons are fading.
 */
import Link from "next/link";
import { useProgress, getLessonStrength, REVIEW_THRESHOLD } from "@/lib/progress";
import { FOUNDATIONS_MISSIONS } from "@/content/missions-foundations";
import { DJ_WORLD_MISSIONS } from "@/content/missions-dj";
import { MISSIONS } from "@/content/missions";

const ALL_MISSIONS = [...FOUNDATIONS_MISSIONS, ...DJ_WORLD_MISSIONS, ...MISSIONS];

function StrengthBar({ strength }: { strength: number }) {
  const pct = Math.round(Math.max(0, Math.min(1, strength)) * 100);
  const color =
    pct >= 80 ? "bg-acid" :
    pct >= 50 ? "bg-volt" :
    pct >= 25 ? "bg-sun" : "bg-hot";
  return (
    <div className="h-1.5 brutal-border bg-bone/30 overflow-hidden w-full">
      <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function ReviewPageClient() {
  const { progress } = useProgress();
  const strengths = progress.lessonStrengths;
  const completed = progress.completedMissions;

  // Build review list: completed missions with strength tracked, sorted weakest first
  const reviewItems = Object.entries(strengths)
    .map(([slug, ls]) => ({
      slug,
      strength: getLessonStrength(ls),
      lastReviewed: ls.lastReviewed,
    }))
    .filter(item => !!completed[item.slug]) // only completed missions
    .sort((a, b) => a.strength - b.strength);

  const needsReview = reviewItems.filter(item => item.strength < REVIEW_THRESHOLD);
  const healthy    = reviewItems.filter(item => item.strength >= REVIEW_THRESHOLD);

  const getMission = (slug: string) => ALL_MISSIONS.find(m => m.slug === slug);

  const daysSince = (ts: number) => {
    const d = Math.floor((Date.now() - ts) / (1000 * 60 * 60 * 24));
    return d === 0 ? "today" : d === 1 ? "yesterday" : `${d} days ago`;
  };

  return (
    <main className="min-h-screen bg-bone pb-24">
      <header className="brutal-border border-x-0 border-t-0 bg-ink text-bone">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Link href="/" className="font-mono text-[10px] uppercase opacity-50 hover:opacity-100 mb-3 block">← Dashboard</Link>
          <div className="font-mono text-[10px] uppercase opacity-40 mb-1">// SPACED REPETITION</div>
          <h1 className="font-display text-5xl md:text-7xl leading-none">
            REVIEW<br /><span className="text-acid">SESSION</span>
          </h1>
          <p className="font-mono text-sm opacity-60 mt-3 leading-relaxed max-w-lg">
            Lessons fade over time. Review the weakest ones to lock them in long-term.
            Each review refreshes the strength back toward 100%.
          </p>
          <div className="flex gap-3 mt-4 font-mono text-[10px] uppercase">
            <span className="brutal-border bg-hot text-bone px-2 py-1">🔥 {needsReview.length} need review</span>
            <span className="brutal-border bg-acid text-ink px-2 py-1">✓ {healthy.length} healthy</span>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-10">

        {needsReview.length === 0 && healthy.length === 0 && (
          <div className="brutal-border bg-sun p-8 text-center">
            <div className="font-display text-3xl mb-2">Nothing to review yet</div>
            <p className="font-mono text-sm opacity-70">Complete some lessons first — then come back to review them as they fade.</p>
            <Link href="/world/fundamentals" className="brutal-border bg-ink text-bone px-5 py-3 font-mono text-xs uppercase brutal-press inline-block mt-4">
              Start Learning →
            </Link>
          </div>
        )}

        {/* Needs review */}
        {needsReview.length > 0 && (
          <section>
            <div className="font-mono text-[10px] uppercase opacity-40 mb-3">
              // NEEDS REVIEW — {needsReview.length} lesson{needsReview.length > 1 ? "s" : ""}
            </div>
            <div className="space-y-2">
              {needsReview.map(item => {
                const mission = getMission(item.slug);
                const pct = Math.round(item.strength * 100);
                return (
                  <div key={item.slug} className="brutal-border bg-bone p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-[9px] uppercase opacity-50 mb-0.5">
                          {mission?.world?.toUpperCase()} · Last reviewed {daysSince(progress.lessonStrengths[item.slug]?.lastReviewed ?? 0)}
                        </div>
                        <div className="font-display text-lg leading-tight">
                          {mission?.title ?? item.slug.replace(/-/g, " ")}
                        </div>
                        <div className="font-mono text-xs opacity-60 mt-0.5">{mission?.tagline}</div>
                        <div className="mt-2 flex items-center gap-2">
                          <StrengthBar strength={item.strength} />
                          <span className="font-mono text-[9px] uppercase opacity-60 shrink-0">{pct}%</span>
                        </div>
                      </div>
                      <Link
                        href={`/learn/${item.slug}?review=1`}
                        className="brutal-border bg-hot text-bone px-4 py-2.5 font-display text-base brutal-press shrink-0">
                        REVIEW →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Review all button */}
            <Link
              href={`/learn/${needsReview[0]?.slug}?review=1`}
              className="mt-4 brutal-border bg-acid text-ink px-5 py-4 font-display text-2xl brutal-press brutal-shadow block text-center">
              ▶ START REVIEW SESSION ({needsReview.length} lessons)
            </Link>
          </section>
        )}

        {/* Healthy lessons */}
        {healthy.length > 0 && (
          <section>
            <div className="font-mono text-[10px] uppercase opacity-40 mb-3">
              // HEALTHY — {healthy.length} lesson{healthy.length > 1 ? "s" : ""}
            </div>
            <div className="space-y-1">
              {healthy.map(item => {
                const mission = getMission(item.slug);
                const pct = Math.round(item.strength * 100);
                return (
                  <div key={item.slug} className="brutal-border bg-bone/50 p-3 flex items-center gap-3">
                    <StrengthBar strength={item.strength} />
                    <span className="font-mono text-[9px] uppercase opacity-50 shrink-0 w-8 text-right">{pct}%</span>
                    <span className="font-mono text-xs flex-1 truncate opacity-70">
                      {mission?.title ?? item.slug.replace(/-/g, " ")}
                    </span>
                    <Link href={`/learn/${item.slug}?review=1`}
                      className="font-mono text-[9px] uppercase opacity-40 hover:opacity-80 shrink-0">
                      review
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* How it works */}
        <section className="brutal-border bg-ink text-bone p-5">
          <div className="font-mono text-[10px] uppercase opacity-50 mb-3">// HOW SPACED REPETITION WORKS</div>
          <div className="space-y-2 font-mono text-xs opacity-70 leading-relaxed">
            <p>Lesson strength starts at 100% when you complete it. It decays 10% per day without review.</p>
            <p>Below 50% = review recommended. Reviewing bumps strength back up toward 100%.</p>
            <p>Regular short reviews beat cramming — reviewing 3 lessons for 5 minutes is more effective than one 60-minute session.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
