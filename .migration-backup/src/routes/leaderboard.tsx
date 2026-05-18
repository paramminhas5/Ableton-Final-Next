import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { rankFor } from "@/lib/ranks";
import { useProgress } from "@/lib/progress";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — CCD.SCHOOL" },
      { name: "description", content: "Weekly XP rankings — who's learning hardest this week?" },
    ],
  }),
  component: LeaderboardPage,
});

type Entry = {
  user_id: string;
  xp: number;
  streak_days: number;
  display: string; // anonymised label
};

// Generate a memorable anonymous handle from a UUID
function hashHandle(uid: string): string {
  const words = [
    "Acid",
    "Volt",
    "Bass",
    "Kick",
    "Snare",
    "Warp",
    "Send",
    "Gain",
    "Peak",
    "Hold",
    "Gate",
    "Sidechain",
    "Clip",
    "Loop",
    "Rack",
    "Pad",
  ];
  const adj = ["Fast", "Deep", "Hard", "Raw", "Hot", "Cold", "Live", "Dead"];
  let h = 0;
  for (let i = 0; i < uid.length; i++) h = (h * 31 + uid.charCodeAt(i)) >>> 0;
  return `${adj[h % adj.length]}${words[(h >> 4) % words.length]}${(h % 99) + 1}`;
}

function LeaderboardPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { progress } = useProgress();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Fetch top 25 by all-time XP from the progress table.
        // For weekly XP: add a materialized view `weekly_xp` in Supabase
        // and query that instead. Schema in README.
        const { data, error: err } = await supabase
          .from("progress")
          .select("user_id, xp, streak_days")
          .order("xp", { ascending: false })
          .limit(25);

        if (err) throw err;

        setEntries(
          (data ?? []).map((row) => ({
            user_id: row.user_id,
            xp: row.xp ?? 0,
            streak_days: row.streak_days ?? 0,
            display: hashHandle(row.user_id),
          })),
        );
      } catch (e: any) {
        setError(e?.message ?? "Could not load leaderboard.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const podiumColors = ["bg-acid", "bg-volt text-bone", "bg-hot text-bone"];

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-12 space-y-6">
      <Link to="/" className="font-mono text-xs uppercase underline">
        ← HOME
      </Link>

      <header className="brutal-border bg-ink text-bone p-6 brutal-shadow">
        <div className="font-mono text-xs uppercase">// RANKINGS</div>
        <h1 className="text-5xl md:text-7xl mt-2">LEADERBOARD</h1>
        <p className="font-mono mt-2 text-sm">All-time XP · Top 25 producers on the platform.</p>
        <p className="font-mono text-[10px] opacity-50 mt-1">
          Usernames are anonymised — only you know yours. Sign in to appear on this board.
        </p>
      </header>

      {/* Your own rank card */}
      {progress.xp > 0 && (
        <div className="brutal-border bg-sun p-4 flex items-center gap-4">
          <div className="font-mono text-[10px] uppercase opacity-70">You</div>
          <div className="font-display text-3xl flex-1">{progress.xp} XP</div>
          <div className="font-mono text-xs uppercase opacity-70">🔥 {progress.streakDays}d</div>
          <div className="brutal-border bg-bone text-ink px-2 py-1 font-mono text-[10px] uppercase">
            {rankFor(progress.xp).current.name}
          </div>
        </div>
      )}

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="brutal-border bg-bone p-4 animate-pulse h-14" />
          ))}
        </div>
      )}

      {error && (
        <div className="brutal-border bg-hot text-bone p-4 font-mono text-sm">
          {error}
          <div className="text-xs opacity-70 mt-1">Sign in to unlock leaderboard access.</div>
        </div>
      )}

      {!loading && !error && entries.length === 0 && (
        <div className="brutal-border bg-bone p-6 font-mono text-sm text-center">
          No entries yet — sign in and complete missions to appear here.
        </div>
      )}

      {!loading && entries.length > 0 && (
        <ol className="space-y-2">
          {entries.map((e, i) => {
            const rank = rankFor(e.xp);
            const isTop3 = i < 3;
            return (
              <li key={e.user_id}>
                <div
                  className={`brutal-border p-3 flex items-center gap-3 ${isTop3 ? podiumColors[i] : "bg-card"}`}
                >
                  {/* Position */}
                  <div className="font-display text-2xl w-10 text-center shrink-0">
                    {i === 0 ? "①" : i === 1 ? "②" : i === 2 ? "③" : `${i + 1}`}
                  </div>

                  {/* Handle + rank */}
                  <div className="flex-1 min-w-0">
                    <div className="font-display text-lg truncate">{e.display}</div>
                    <div className="font-mono text-[10px] uppercase opacity-70">
                      {rank.current.name}
                    </div>
                  </div>

                  {/* Streak */}
                  <div className="font-mono text-xs shrink-0 opacity-80">🔥 {e.streak_days}d</div>

                  {/* XP */}
                  <div
                    className={`brutal-border px-3 py-1 font-display text-xl shrink-0 ${isTop3 ? "bg-bone text-ink" : "bg-acid text-ink"}`}
                  >
                    {e.xp.toLocaleString()}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <div className="brutal-border bg-bone p-4 font-mono text-[10px] uppercase leading-relaxed opacity-70">
        Weekly leaderboard coming soon — this currently shows all-time XP. Complete missions daily
        to climb the ranks and protect your streak. 🔥
      </div>
    </div>
  );
}
