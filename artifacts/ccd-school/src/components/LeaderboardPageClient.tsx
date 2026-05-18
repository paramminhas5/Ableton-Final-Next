"use client";
import { useProgress } from "@/lib/progress";
import { rankFor } from "@/lib/ranks";

export function LeaderboardPageClient() {
  const { progress } = useProgress();
  const { current: rank } = rankFor(progress.xp);

  return (
    <main className="min-h-screen bg-bone">
      <header className="brutal-border border-x-0 border-t-0 bg-ink text-bone">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="font-mono text-[10px] uppercase opacity-40 mb-1">// GLOBAL RANKINGS</div>
          <h1 className="font-display text-5xl md:text-7xl leading-none">LEADERBOARD</h1>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
        <div className="brutal-border bg-sun p-6 mb-6">
          <div className="font-mono text-[10px] uppercase opacity-60 mb-1">YOUR POSITION</div>
          <div className="font-display text-3xl">{rank.name} · {progress.xp} XP · 🔥 {progress.streakDays}</div>
          <div className="font-mono text-xs opacity-60 mt-1">{Object.keys(progress.completedMissions).length} missions completed</div>
        </div>
        <div className="brutal-border bg-bone p-6 text-center">
          <div className="font-display text-2xl mb-2">Global Leaderboard Coming Soon</div>
          <div className="font-mono text-sm opacity-60 leading-relaxed max-w-sm mx-auto">Cloud sync and a live leaderboard are coming in the next update. For now, keep stacking XP locally.</div>
        </div>
      </div>
    </main>
  );
}
