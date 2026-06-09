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
  const { progress, missionsNeedingReview } = useProgress();
  const strengths = progress.lessonStrengths;
  const fsrsCards = progress.fsrsCards ?? {};
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

  // P1 #14: FSRS stability display helper
  const fsrsInfo = (slug: string) => {
    const card = fsrsCards[slug];
    if (!card) return null;
    return {
      stability: Math.round(card.stability),
      reps: card.reps,
    };
  };

  return (
    <main className="min-h-screen bg-bone pb-24">
      {/* P1 #14: REVIEW MODE distinctive header — hot/red tones */}
      <header className="brutal-border border-x-0 border-t-0 bg-hot text-bone">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Link href="/dashboard" className="font-mono text-[10px] uppercase opacity-60 hover:opacity-100 mb-3 block">← Dashboard</Link>
          {/* P1 #14: REVIEW MODE pill */}
          <div className="brutal-border bg-bone text-hot px-3 py-1 font-mono text-[10px] uppercase font-bold inline-flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-hot animate-pulse inline-block" />
            REVIEW MODE · SPACED REPETITION
          </div>
          <h1 className="font-display text-5xl md:text-7xl leading-none">
            REVIEW<br /><span className="text-bone/80">SESSION</span>
          </h1>
          <p className="font-sans text-sm opacity-80 mt-3 leading-relaxed max-w-lg">
            Lessons fade over time. Review the weakest ones now to lock them in long-term.
            Each review refreshes retention and extends the next interval.
          </p>
          <div className="flex gap-3 mt-4 font-mono text-[10px] uppercase flex-wrap">
            <span className="brutal-border bg-bone text-hot px-2 py-1">🔥 {needsReview.length} need review</span>
            <span className="brutal-border bg-bone/20 text-bone px-2 py-1">✓ {healthy.length} healthy</span>
            {/* P1 #14: show FSRS queue count */}
            {missionsNeedingReview.length > 0 && (
              <span className="brutal-border bg-ink text-bone px-2 py-1">🧠 FSRS: {missionsNeedingReview.length} due</span>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-10">

        {needsReview.length === 0 && healthy.length === 0 && (
          <div className="brutal-border bg-sun p-8 text-center">
            <div className="font-display text-3xl mb-2">Nothing to review yet</div>
            <p className="font-sans text-sm opacity-70">Complete some lessons first — then come back to review them as they fade.</p>
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
                const fsrs = fsrsInfo(item.slug);
                return (
                  <div key={item.slug} className="brutal-border bg-bone p-4 border-l-4 border-l-hot">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-[9px] uppercase opacity-50 mb-0.5">
                          {mission?.world?.toUpperCase()} · Last reviewed {daysSince(progress.lessonStrengths[item.slug]?.lastReviewed ?? 0)}
                          {/* P1 #14: FSRS stability info */}
                          {fsrs && <span className="ml-2 text-volt">· FSRS {fsrs.reps} rep{fsrs.reps !== 1 ? "s" : ""} · {fsrs.stability}d stability</span>}
                        </div>
                        <div className="font-display text-lg leading-tight">
                          {mission?.title ?? item.slug.replace(/-/g, " ")}
                        </div>
                        <div className="font-sans text-xs opacity-60 mt-0.5">{mission?.tagline}</div>
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
              className="mt-4 brutal-border bg-hot text-bone px-5 py-4 font-display text-2xl brutal-press brutal-shadow block text-center">
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
                const fsrs = fsrsInfo(item.slug);
                return (
                  <div key={item.slug} className="brutal-border bg-bone/50 p-3 flex items-center gap-3">
                    <StrengthBar strength={item.strength} />
                    <span className="font-mono text-[9px] uppercase opacity-50 shrink-0 w-8 text-right">{pct}%</span>
                    <span className="font-sans text-xs flex-1 truncate opacity-70">
                      {mission?.title ?? item.slug.replace(/-/g, " ")}
                    </span>
                    {fsrs && (
                      <span className="font-mono text-[8px] opacity-40 shrink-0 hidden sm:block">{fsrs.stability}d</span>
                    )}
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

        {/* How it works — P1 #14: updated to mention FSRS */}
        <section className="brutal-border bg-ink text-bone p-5">
          <div className="font-mono text-[10px] uppercase opacity-50 mb-3">// HOW FSRS SPACED REPETITION WORKS</div>
          <div className="space-y-2 font-sans text-xs opacity-70 leading-relaxed">
            <p>CCD.SCHOOL uses FSRS v4 — the same algorithm that powers Anki, optimised for long-term memory.</p>
            <p>After each review, the scheduler calculates a new interval based on your score, stability, and difficulty. Easy lessons get longer gaps; hard lessons come back sooner.</p>
            <p>The "stability" number (shown in days) is how long until retrievability drops below 90%. A lesson reviewed 5× correctly might have 30+ day stability.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
