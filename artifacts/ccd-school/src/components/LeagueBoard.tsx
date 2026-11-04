"use client";
/**
 * LeagueBoard — renders the current user's league with 30 players.
 * Shows promotion zone (top 10 = green), safe zone, demotion zone (bottom 5 = red).
 * Fetches from /api/leaderboard, falls back to mock data for logged-out users.
 */
import { useEffect, useState } from "react";
import { useProgress } from "@/lib/progress";
import { useAuth } from "@/lib/auth";
import {
  LEAGUE_TIERS, tierConfig, nextTier, prevTier, rankZone,
  type LeagueTier, type LeagueEntry,
} from "@/lib/leagues";
import { Silk } from "@/components/m1/controls";
import { ListRow, SegBar, TierMark } from "@/components/m1/parts";

const LEAGUE_SIZE = 30;

function generateMockLeague(
  weeklyXp: number,
  tier: LeagueTier,
): LeagueEntry[] {
  // Seed deterministic mock entries around the user's XP
  const entries: LeagueEntry[] = [];
  for (let i = 0; i < LEAGUE_SIZE - 1; i++) {
    const variance = Math.floor(Math.sin(i * 137.5) * 300 + 400);
    entries.push({
      rank: 0,
      userId: `mock-${i}`,
      name: [
        "BeatMaker99","SynthWave","DJKlaus","LoopLord","TrackStar",
        "KickDrum","BassHead","MelodyMakr","ChordCraft","WavRider",
        "FreqMaster","ReverbKid","AcidHouse","VoltageCtrl","SunDrop",
        "NightOwl","SubSonic","PitchPerfect","GrooveAgent","MixMaestro",
        "SoundSculptr","FilterFreak","OscillatorX","ArpAdmin","SampleSage",
        "WarpWizard","BPMBoss","CueMaster","HatHero","DropDoctor",
      ][i],
      weeklyXp: Math.max(0, weeklyXp + variance - 200),
      tier,
      isCurrentUser: false,
    });
  }
  entries.push({ rank: 0, userId: "you", name: "You", weeklyXp, tier, isCurrentUser: true });
  entries.sort((a, b) => b.weeklyXp - a.weeklyXp);
  entries.forEach((e, i) => { e.rank = i + 1; });
  return entries;
}

export function LeagueBoard() {
  const { progress } = useProgress();
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeagueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const tier = progress.leagueTier;
  const cfg = tierConfig(tier);
  const next = nextTier(tier);
  const prev = prevTier(tier);

  useEffect(() => {
    if (user) {
      fetch("/api/leaderboard?weekly=1")
        .then(r => r.json())
        .then(d => {
          if (Array.isArray(d.entries)) {
            setEntries(d.entries);
          } else {
            setEntries(generateMockLeague(progress.weeklyXp, tier));
          }
        })
        .catch(() => setEntries(generateMockLeague(progress.weeklyXp, tier)))
        .finally(() => setLoading(false));
    } else {
      setEntries(generateMockLeague(progress.weeklyXp, tier));
      setLoading(false);
    }
  }, [user, progress.weeklyXp, tier]);

  const myEntry = entries.find(e => e.isCurrentUser);
  const zone = myEntry ? rankZone(myEntry.rank, tier) : "safe";
  const level = LEAGUE_TIERS.findIndex(t => t.id === tier);

  return (
    <div>
      <div className="ls-panel" style={{ alignItems: "center", gap: 14 }}>
        <TierMark level={level} color={cfg.led} size={44} />
        <span style={{ flex: 1, minWidth: 0 }}>
          <b style={{ display: "block", fontSize: 18, fontWeight: 500 }}>{cfg.label.toLowerCase()} league</b>
          <span className="m1-t11" style={{ display: "block", marginTop: 2 }}>
            {cfg.promoteTop > 0 ? `top ${cfg.promoteTop} move up` : "top league"}
            {prev ? ` · bottom 5 drop to ${tierConfig(prev as LeagueTier).label.toLowerCase()}` : ""}
          </span>
        </span>
        {myEntry && <span style={{ fontSize: 22, fontWeight: 300 }} aria-label={`you are number ${myEntry.rank}`}>#{myEntry.rank}</span>}
      </div>
      {myEntry && (
        <p className="m1-t11" style={{ margin: "8px 4px 0" }}>
          {myEntry.weeklyXp} xp this week
          {zone === "promote" && next ? ` · in the zone for ${tierConfig(next).label.toLowerCase()}` : ""}
          {zone === "demote" ? " · in the drop zone, a lesson or two gets you out" : ""}
        </p>
      )}

      <Silk label="leagues" />
      <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 6px 0" }}>
        {LEAGUE_TIERS.map((t, i) => (
          <span key={t.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, opacity: i === level ? 1 : 0.55 }}>
            <TierMark level={i} color={t.led} size={28} />
            <span className="m1-t11" style={{ fontWeight: i === level ? 600 : 500 }}>{t.label.toLowerCase()}</span>
          </span>
        ))}
      </div>
      <div style={{ display: "flex", marginTop: 12 }}><SegBar value={(level + 1) / LEAGUE_TIERS.length} color={cfg.led} n={20} height={6} label={`tier ${level + 1} of ${LEAGUE_TIERS.length}`} /></div>

      <Silk label="this week" right="xp" />
      {loading ? (
        <div className="ls-panel" aria-busy="true"><span className="m1-t11">loading</span></div>
      ) : (
        entries.map(e => {
          const z = rankZone(e.rank, tier);
          const led = e.isCurrentUser ? "var(--led-go)" : z === "promote" ? "var(--led-mint)" : z === "demote" ? "var(--led-red)" : "var(--ledoff)";
          return (
            <ListRow key={e.userId} led={led} style={{ padding: "9px 14px 9px 16px", marginTop: 6, ...(e.isCurrentUser ? { boxShadow: "inset 0 0 0 2px var(--led-go)" } : {}) }}
              title={<span style={{ display: "flex", gap: 10, alignItems: "baseline" }}><b style={{ width: 24, fontWeight: 400, color: "var(--sub)", fontVariantNumeric: "tabular-nums" }}>{e.rank}</b>{e.isCurrentUser ? "you" : e.name.toLowerCase()}</span>}
              right={<span style={{ fontVariantNumeric: "tabular-nums", fontSize: 14 }}>{e.weeklyXp}</span>} />
          );
        })
      )}
      <p className="m1-t11" style={{ margin: "10px 4px 0" }}>green is the move up zone, red is the drop zone. leagues reset sunday at midnight utc.</p>
    </div>
  );
}
