"use client";
/**
 * DailyPageClient — Today's curated lesson + review session.
 *
 * Shows:
 *   • Daily goal ring (XP progress toward 50 XP)
 *   • Today's lesson — next unlocked mission in selected world
 *   • Review section — weakest 3 missions
 *   • Streak status
 */
import Link from "next/link";
import { useProgress, DAILY_GOAL_XP, getLessonStrength, REVIEW_THRESHOLD } from "@/lib/progress";
import { FOUNDATIONS_MISSIONS } from "@/content/missions-foundations";
import { DJ_WORLD_MISSIONS } from "@/content/missions-dj";
import { MISSIONS } from "@/content/missions";
import { getMissionContext } from "@/lib/missionContext";
import { rankFor } from "@/lib/ranks";

const ALL_MISSIONS = [...FOUNDATIONS_MISSIONS, ...DJ_WORLD_MISSIONS, ...MISSIONS];

function GoalRing({ pct, done }: { pct: number; done: boolean }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" aria-label={`Daily goal ${Math.round(pct * 100)}%`}>
      <circle cx="48" cy="48" r={r} fill="none" stroke="currentColor" strokeWidth="6" opacity="0.15" />
      <circle cx="48" cy="48" r={r} fill="none"
        stroke={done ? "#7B2FFF" : "#C6FF00"}
        strokeWidth="6"
        strokeDasharray={`${circ * pct} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 48 48)"
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
      <text x="48" y="52" textAnchor="middle" dominantBaseline="middle"
        className="font-display" fontSize="20" fill="currentColor">
        {Math.round(pct * 100)}%
      </text>
    </svg>
  );
}

export function DailyPageClient() {
  const { progress, missionsNeedingReview } = useProgress();
  const completed = progress.completedMissions;
  const { current: rank } = rankFor(progress.xp);

  // Find next lesson
  const allDoneSlugs = Object.keys(completed).filter(s => completed[s]);
  const lastSlug = allDoneSlugs[allDoneSlugs.length - 1];
  const lastCtx = lastSlug ? getMissionContext(lastSlug) : null;
  const nextSlug = lastCtx?.path
    ? (() => {
        const idx = lastCtx.path.missionSlugs.indexOf(lastSlug);
        const ns = lastCtx.path.missionSlugs[idx + 1];
        return ns && !completed[ns] ? ns : null;
      })()
    : null;
  const todaySlug = nextSlug ?? (allDoneSlugs.length === 0 ? "what-is-sound" : null);
  const todayMission = todaySlug ? ALL_MISSIONS.find(m => m.slug === todaySlug) : null;

  const dailyGoalPct = Math.min(1, progress.dailyXp / DAILY_GOAL_XP);
  const dailyGoalDone = progress.dailyXp >= DAILY_GOAL_XP;

  // Top 3 review candidates
  const reviewSlugs = missionsNeedingReview.slice(0, 3);

  return (
    <main className="min-h-screen bg-bone pb-24">
      <header className="brutal-border border-x-0 border-t-0 bg-ink text-bone">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Link href="/" className="font-mono text-[10px] uppercase opacity-50 hover:opacity-100 mb-3 block">← Dashboard</Link>
          <div className="font-mono text-[10px] uppercase opacity-40 mb-1">// TODAY&apos;S LESSON</div>
          <h1 className="font-display text-5xl leading-none">DAILY<br /><span className="text-acid">PRACTICE</span></h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">

        {/* Daily goal */}
        <section className="brutal-border bg-ink text-bone p-6 flex items-center gap-6">
          <GoalRing pct={dailyGoalPct} done={dailyGoalDone} />
          <div>
            <div className="font-mono text-[10px] uppercase opacity-50 mb-1">DAILY GOAL</div>
            <div className="font-display text-3xl">
              {progress.dailyXp} / {DAILY_GOAL_XP} XP
            </div>
            {dailyGoalDone ? (
              <div className="font-mono text-xs text-acid mt-1">✓ Goal complete! Streak protected.</div>
            ) : (
              <div className="font-mono text-xs opacity-60 mt-1">
                {DAILY_GOAL_XP - progress.dailyXp} XP to go — keep at it
              </div>
            )}
            <div className="font-mono text-[10px] uppercase opacity-50 mt-2">
              🔥 {progress.streakDays}-day streak{progress.streakShield ? " 🛡 shield active" : ""}
            </div>
          </div>
        </section>

        {/* Today's lesson */}
        <section>
          <div className="font-mono text-[10px] uppercase opacity-40 mb-3">// TODAY&apos;S LESSON</div>
          {todayMission ? (
            <Link href={`/learn/${todayMission.slug}`}
              className="brutal-border bg-acid text-ink p-5 flex items-start justify-between gap-4 brutal-press brutal-shadow block">
              <div>
                <div className="font-mono text-[9px] uppercase opacity-70 mb-1">
                  {lastCtx?.world?.toUpperCase()} › {lastCtx?.chapter?.title ?? "Start here"}
                </div>
                <div className="font-display text-2xl">{todayMission.title}</div>
                <div className="font-mono text-xs opacity-70 mt-1">{todayMission.tagline}</div>
                <div className="brutal-border bg-ink/20 px-2 py-1 font-mono text-[9px] uppercase inline-block mt-2">
                  +{todayMission.xp} XP
                </div>
              </div>
              <div className="font-display text-4xl shrink-0">▶</div>
            </Link>
          ) : (
            <div className="brutal-border bg-volt text-bone p-5">
              <div className="font-display text-2xl">🎉 ALL CAUGHT UP!</div>
              <p className="font-mono text-sm opacity-70 mt-1">No new lessons — try a review session below.</p>
            </div>
          )}
        </section>

        {/* Review session */}
        {reviewSlugs.length > 0 && (
          <section>
            <div className="font-mono text-[10px] uppercase opacity-40 mb-3">
              // REVIEW ({reviewSlugs.length} fading)
            </div>
            <div className="space-y-2 mb-3">
              {reviewSlugs.map(slug => {
                const m = ALL_MISSIONS.find(m => m.slug === slug);
                const ls = progress.lessonStrengths[slug];
                const strength = ls ? getLessonStrength(ls) : 0;
                return (
                  <Link key={slug} href={`/learn/${slug}?review=1`}
                    className="brutal-border bg-bone p-3 flex items-center justify-between gap-3 brutal-press block">
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-xs truncate">{m?.title ?? slug.replace(/-/g, " ")}</div>
                      <div className="h-1 brutal-border bg-bone/30 mt-1 overflow-hidden w-32">
                        <div className="h-full bg-hot" style={{ width: `${Math.round(strength * 100)}%` }} />
                      </div>
                    </div>
                    <span className="font-mono text-[9px] uppercase opacity-60 shrink-0">Review ↺</span>
                  </Link>
                );
              })}
            </div>
            <Link href="/review"
              className="brutal-border bg-hot text-bone px-5 py-3 font-mono text-xs uppercase brutal-press block text-center">
              View All Review Sessions →
            </Link>
          </section>
        )}

        {/* Stats */}
        <section className="brutal-border bg-bone p-5">
          <div className="font-mono text-[10px] uppercase opacity-40 mb-3">// YOUR PROGRESS</div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="font-display text-3xl">{progress.xp}</div>
              <div className="font-mono text-[9px] uppercase opacity-60">Total XP</div>
            </div>
            <div className="text-center">
              <div className="font-display text-xl">{rank.emoji}</div>
              <div className="font-display text-sm leading-tight">{rank.name}</div>
              <div className="font-mono text-[9px] uppercase opacity-60">Rank</div>
            </div>
            <div className="text-center">
              <div className="font-display text-3xl">💎{progress.gems}</div>
              <div className="font-mono text-[9px] uppercase opacity-60">Gems</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
