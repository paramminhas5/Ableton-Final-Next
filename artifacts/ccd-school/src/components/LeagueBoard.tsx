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
import { rankFor } from "@/lib/ranks";

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

  return (
    <div className="space-y-4">
      {/* League header */}
      <div className={`brutal-border ${cfg.color} p-5`}>
        <div className="font-mono text-[10px] uppercase opacity-70 mb-1">YOUR LEAGUE</div>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{cfg.emoji}</span>
          <div>
            <div className="font-display text-3xl">{cfg.label} League</div>
            <div className="font-mono text-xs opacity-70 mt-0.5">
              {LEAGUE_TIERS.find(t => t.id === tier)?.promoteTop ?? 0} promote
              {prev ? ` · bottom 5 demote to ${tierConfig(prev as LeagueTier).label}` : ""}
            </div>
          </div>
        </div>
        {myEntry && (
          <div className="mt-3 flex items-center gap-3 font-mono text-sm">
            <span>Your rank: <strong>#{myEntry.rank}</strong></span>
            <span className="opacity-60">·</span>
            <span>{myEntry.weeklyXp} XP this week</span>
            {zone === "promote" && next && (
              <span className="brutal-border bg-acid text-ink px-2 py-0.5 text-[10px] uppercase ml-auto">
                ↑ Promote zone → {tierConfig(next).label}
              </span>
            )}
            {zone === "demote" && prev && (
              <span className="brutal-border bg-hot text-bone px-2 py-0.5 text-[10px] uppercase ml-auto">
                ↓ Demotion zone
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tier progress bar */}
      <div className="brutal-border bg-bone p-3">
        <div className="flex justify-between items-center mb-2">
          {LEAGUE_TIERS.map(t => (
            <div key={t.id} className="flex flex-col items-center gap-1">
              <span className={`text-lg ${t.id === tier ? "opacity-100" : "opacity-30"}`}>{t.emoji}</span>
              <span className={`font-mono text-[8px] uppercase ${t.id === tier ? "font-bold" : "opacity-40"}`}>
                {t.label}
              </span>
            </div>
          ))}
        </div>
        <div className="h-1.5 bg-ink/10 brutal-border overflow-hidden">
          <div
            className={`h-full ${cfg.color.split(" ")[0]} transition-all duration-700`}
            style={{ width: `${((LEAGUE_TIERS.findIndex(t => t.id === tier) + 1) / LEAGUE_TIERS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Leaderboard table */}
      {loading ? (
        <div className="space-y-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="brutal-border bg-bone/50 h-10 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="brutal-border overflow-hidden">
          {/* Column headers */}
          <div className="grid grid-cols-[40px_1fr_80px] px-3 py-1.5 bg-ink text-bone font-mono text-[9px] uppercase opacity-70">
            <span>#</span><span>Player</span><span className="text-right">Weekly XP</span>
          </div>
          {entries.map(entry => {
            const zone = rankZone(entry.rank, tier);
            const rowBg =
              entry.isCurrentUser ? "bg-acid text-ink font-bold" :
              zone === "promote"  ? "bg-acid/10" :
              zone === "demote"   ? "bg-hot/10" : "bg-bone";
            const indicator =
              zone === "promote" ? "↑" :
              zone === "demote"  ? "↓" : "";
            return (
              <div key={entry.userId}
                className={`grid grid-cols-[40px_1fr_80px] px-3 py-2.5 brutal-border border-x-0 border-t-0 ${rowBg} transition-colors`}>
                <span className="font-display text-lg leading-none">{entry.rank}</span>
                <span className="font-mono text-xs flex items-center gap-1 truncate">
                  {indicator && <span className="text-[10px]">{indicator}</span>}
                  {entry.name}
                  {entry.isCurrentUser && <span className="opacity-50 text-[9px]">(you)</span>}
                </span>
                <span className="font-mono text-xs text-right tabular-nums">{entry.weeklyXp}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-2 font-mono text-[9px] uppercase opacity-60">
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-acid inline-block" /> Promotion zone (top 10)</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-hot inline-block" /> Demotion zone (bottom 5)</span>
        <span className="opacity-40">Resets Sunday midnight UTC</span>
      </div>
    </div>
  );
}
