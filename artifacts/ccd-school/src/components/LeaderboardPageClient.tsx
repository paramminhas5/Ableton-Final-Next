"use client";
import { useEffect, useState } from "react";
import { useProgress } from "@/lib/progress";
import { rankFor } from "@/lib/ranks";
import { useAuth } from "@/lib/auth";
import { LeagueBoard } from "@/components/LeagueBoard";
import { Icon, Screen, Silk, Switch } from "@/components/m1/controls";
import { SevenSeg } from "@/components/m1/SevenSeg";
import { ListRow, PageHead, RankMark } from "@/components/m1/parts";

type Entry = { rank: number; id: string; name: string; image?: string; plan: string; xp: number; streakDays: number; missionsCount: number; isCurrentUser: boolean };
type Tab = "league" | "alltime";

export function LeaderboardPageClient() {
  const { progress } = useProgress();
  const { current: rank, idx } = rankFor(progress.xp);
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("league");

  useEffect(() => {
    fetch("/api/leaderboard").then(r => r.json())
      .then(d => { setEntries(d.entries ?? []); setMyRank(d.currentUserRank ?? null); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <main className="m1-page" style={{ paddingTop: 4 }}>
      <PageHead title="leaderboard" back="/profile" />
      <Screen>
        <div className="ls-meta"><span>you</span><span>{myRank ? `#${myRank} overall` : "not ranked yet"}</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12 }}>
          <span className="ls-lcd" style={{ marginTop: 0 }}><SevenSeg text={String(Math.min(progress.weeklyXp, 9999))} color="var(--led-go)" digits={4} height={40} /></span>
          <span style={{ color: "var(--disp-sub)", fontSize: 14 }}>xp this week</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, color: "var(--disp-ink)" }}>
          <RankMark idx={idx} size={34} />
          <span style={{ fontSize: 14 }}>{rank.name.toLowerCase()} · {progress.xp} xp · {Object.keys(progress.completedMissions).length} lessons</span>
        </div>
      </Screen>

      <div style={{ marginTop: 14 }}>
        <Switch label="Board" value={tab} onChange={id => setTab(id as Tab)} options={[{ id: "league", label: "my league" }, { id: "alltime", label: "all time" }]} />
      </div>

      {!user && <ListRow href="/login" led="var(--led-go)" title="sign in to compete" sub="your weekly xp counts once you have an account" right={<Icon name="back" className="ls-flip" />} />}

      {tab === "league" ? <LeagueBoard /> : (
        <>
          <Silk label="all time" right="xp" />
          {loading ? <div className="ls-panel" aria-busy="true"><span className="m1-t11">loading</span></div>
            : entries.length === 0 ? <div className="ls-panel" style={{ flexDirection: "column", gap: 4 }}><b style={{ fontSize: 16, fontWeight: 500 }}>be the first</b><span className="m1-t11">make an account and finish a lesson to show up here.</span></div>
            : entries.map(e => (
              <ListRow key={e.id} led={e.isCurrentUser ? "var(--led-go)" : e.rank <= 3 ? "var(--led-lilac)" : "var(--ledoff)"}
                style={{ padding: "9px 14px 9px 16px", marginTop: 6, ...(e.isCurrentUser ? { boxShadow: "inset 0 0 0 2px var(--led-go)" } : {}) }}
                title={<span style={{ display: "flex", gap: 10, alignItems: "baseline" }}><b style={{ width: 24, fontWeight: 400, color: "var(--sub)", fontVariantNumeric: "tabular-nums" }}>{e.rank}</b>{e.isCurrentUser ? "you" : e.name.toLowerCase()}{e.plan === "pro" ? <span className="m1-tag" style={{ marginLeft: 6 }}>pro</span> : null}</span>}
                sub={`${e.missionsCount} lessons · ${e.streakDays} day streak`}
                right={<span style={{ fontVariantNumeric: "tabular-nums", fontSize: 14 }}>{e.xp.toLocaleString()}</span>} />
            ))}
        </>
      )}
    </main>
  );
}
