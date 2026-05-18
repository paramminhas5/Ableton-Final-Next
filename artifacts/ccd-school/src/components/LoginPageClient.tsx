"use client";
import Link from "next/link";
import { useProgress } from "@/lib/progress";
import { rankFor } from "@/lib/ranks";

export function LoginPageClient() {
  const { progress } = useProgress();
  const { current: rank } = rankFor(progress.xp);

  return (
    <main className="min-h-screen bg-bone flex flex-col">
      <div className="max-w-lg mx-auto px-4 py-16 flex-1 flex flex-col justify-center">
        <div className="brutal-border bg-acid p-6 brutal-shadow mb-6">
          <div className="font-mono text-[10px] uppercase opacity-60 mb-1">// CCD.SCHOOL</div>
          <h1 className="font-display text-4xl leading-none">SIGN IN</h1>
          <p className="font-mono text-sm mt-2 opacity-70">Save your progress to the cloud and access it from any device.</p>
        </div>

        {progress.xp > 0 && (
          <div className="brutal-border bg-sun p-4 mb-6">
            <div className="font-mono text-[10px] uppercase opacity-60 mb-1">YOUR LOCAL PROGRESS</div>
            <div className="font-display text-2xl">{progress.xp} XP · {rank.name}</div>
            <div className="font-mono text-xs opacity-60 mt-1">{Object.keys(progress.completedMissions).length} missions · 🔥 {progress.streakDays} day streak</div>
            <div className="font-mono text-[9px] opacity-50 mt-2">Signing in will link this progress to your account.</div>
          </div>
        )}

        <div className="brutal-border bg-bone p-6 space-y-4">
          <div className="brutal-border bg-ink text-bone p-4 text-center">
            <div className="font-display text-xl mb-1">Cloud Sync Coming Soon</div>
            <div className="font-mono text-xs opacity-70 leading-relaxed">Authentication is being set up. Your progress is safely stored locally in the meantime.</div>
          </div>
          <div className="font-mono text-[9px] uppercase opacity-40 leading-relaxed">No account needed to use CCD.SCHOOL. Your XP, missions and streaks are stored in your browser and persist between sessions.</div>
        </div>

        <div className="mt-6 flex gap-3">
          <Link href="/" className="brutal-border px-4 py-2 font-mono text-xs uppercase brutal-press hover:bg-sun">← HOME</Link>
          <Link href="/worlds" className="brutal-border bg-acid px-4 py-2 font-mono text-xs uppercase brutal-press">START LEARNING →</Link>
        </div>
      </div>
    </main>
  );
}
