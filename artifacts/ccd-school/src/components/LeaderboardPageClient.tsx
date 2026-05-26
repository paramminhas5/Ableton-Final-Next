"use client";
import { useEffect, useState } from "react";
import { useProgress } from "@/lib/progress";
import { rankFor } from "@/lib/ranks";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { LeagueBoard } from "@/components/LeagueBoard";

type Entry = {
  rank: number;
  id: string;
  name: string;
  image?: string;
  plan: string;
  xp: number;
  streakDays: number;
  missionsCount: number;
  isCurrentUser: boolean;
};

type Tab = "league" | "alltime";

export function LeaderboardPageClient() {
  const { progress } = useProgress();
  const { current: rank } = rankFor(progress.xp);
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("league");

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => {
        setEntries(d.entries ?? []);
        setCurrentUserRank(d.currentUserRank ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-bone">
      <header className="brutal-border border-x-0 border-t-0 bg-ink text-bone">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="font-mono text-[10px] uppercase opacity-40 mb-1">// GLOBAL RANKINGS</div>
          <h1 className="font-display text-5xl md:text-7xl leading-none">LEADERBOARD</h1>
        </div>
      </header>

      {/* Tab switcher */}
      <div className="brutal-border border-x-0 border-t-0 bg-bone sticky top-[52px] md:top-[56px] z-20 flex max-w-4xl mx-auto">
        <button onClick={() => setTab("league")}
          className={`flex-1 py-2.5 font-mono text-[10px] uppercase brutal-press transition-colors brutal-border border-y-0 border-l-0 ${tab === "league" ? "bg-acid text-ink font-bold" : "bg-bone hover:bg-sun"}`}>
          🏆 My League
        </button>
        <button onClick={() => setTab("alltime")}
          className={`flex-1 py-2.5 font-mono text-[10px] uppercase brutal-press transition-colors ${tab === "alltime" ? "bg-acid text-ink font-bold" : "bg-bone hover:bg-sun"}`}>
          🌍 All-Time
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 pb-24">

        {/* Your position pill */}
        <div className="brutal-border bg-sun p-5 mb-6">
          <div className="font-mono text-[10px] uppercase opacity-60 mb-1">YOUR POSITION</div>
          <div className="font-display text-2xl">{rank.name} · {progress.xp} XP · 🔥 {progress.streakDays}</div>
          <div className="font-mono text-xs opacity-60 mt-1">
            {Object.keys(progress.completedMissions).length} missions · 💎 {progress.gems} gems · {progress.weeklyXp} XP this week
            {currentUserRank && <span> · #{currentUserRank} globally</span>}
          </div>
          {!user && (
            <div className="mt-3">
              <Link href="/login" className="brutal-border bg-ink text-bone px-3 py-1.5 font-mono text-xs uppercase brutal-press inline-block">
                SIGN IN TO COMPETE →
              </Link>
            </div>
          )}
        </div>

        {/* League tab */}
        {tab === "league" && (
          <LeagueBoard />
        )}

        {/* All-time tab */}
        {tab === "alltime" && (
          <>
        {loading ? (
          <div className="brutal-border bg-bone p-6 text-center font-mono text-xs uppercase opacity-40">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="brutal-border bg-bone p-6 text-center">
            <div className="font-display text-2xl mb-2">Be the First</div>
            <div className="font-mono text-sm opacity-60">Create an account and complete missions to appear on the leaderboard.</div>
          </div>
        ) : (
          <div className="brutal-border divide-y divide-ink/5">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className={`flex items-center gap-3 px-4 py-3 ${entry.isCurrentUser ? "bg-acid" : entry.rank <= 3 ? "bg-sun/30" : ""}`}
              >
                <span className={`w-8 font-display text-xl shrink-0 ${entry.rank <= 3 ? "text-ink" : "opacity-40"}`}>
                  {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : `#${entry.rank}`}
                </span>
                {entry.image ? (
                  <img src={entry.image} alt="" className="w-7 h-7 brutal-border shrink-0 object-cover" />
                ) : (
                  <div className="w-7 h-7 brutal-border bg-ink text-bone flex items-center justify-center font-mono text-[9px] shrink-0">
                    {entry.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-display text-base leading-none truncate">
                    {entry.name}
                    {entry.plan === "pro" && <span className="ml-1 font-mono text-[8px] bg-volt text-ink px-1 py-0.5 align-middle">PRO</span>}
                    {entry.isCurrentUser && <span className="ml-1 font-mono text-[8px] opacity-60">YOU</span>}
                  </div>
                  <div className="font-mono text-[9px] opacity-50 mt-0.5">{entry.missionsCount} missions · 🔥 {entry.streakDays}</div>
                </div>
                <div className="font-display text-xl shrink-0">{entry.xp.toLocaleString()} <span className="font-mono text-[9px] opacity-50">XP</span></div>
              </div>
            ))}
          </div>
        )}
          </>
        )}
      </div>
    </main>
  );
}

