/**
 * Leagues system — Bronze → Silver → Gold → Platinum → Diamond
 *
 * Rules (Duolingo-style):
 *   - 30 players per league, seeded from global leaderboard
 *   - League resets Sunday midnight UTC
 *   - Top 10 promote to next tier
 *   - Bottom 5 demote to previous tier
 *   - XP counted from Monday 00:00 UTC to Sunday 23:59 UTC
 */

export type LeagueTier = "bronze" | "silver" | "gold" | "platinum" | "diamond";

export const LEAGUE_TIERS: {
  id: LeagueTier;
  label: string;
  emoji: string;
  color: string;
  promoteTop: number;
  demoteBottom: number;
}[] = [
  { id: "bronze",   label: "Bronze",   emoji: "🥉", color: "bg-[#CD7F32] text-bone", promoteTop: 10, demoteBottom: 0  },
  { id: "silver",   label: "Silver",   emoji: "🥈", color: "bg-bone text-ink",        promoteTop: 10, demoteBottom: 5  },
  { id: "gold",     label: "Gold",     emoji: "🥇", color: "bg-sun text-ink",          promoteTop: 10, demoteBottom: 5  },
  { id: "platinum", label: "Platinum", emoji: "💠", color: "bg-volt text-bone",        promoteTop: 10, demoteBottom: 5  },
  { id: "diamond",  label: "Diamond",  emoji: "💎", color: "bg-acid text-ink",         promoteTop: 0,  demoteBottom: 5  },
];

export function tierConfig(tier: LeagueTier) {
  return LEAGUE_TIERS.find(t => t.id === tier) ?? LEAGUE_TIERS[0];
}

export function nextTier(tier: LeagueTier): LeagueTier | null {
  const idx = LEAGUE_TIERS.findIndex(t => t.id === tier);
  return LEAGUE_TIERS[idx + 1]?.id ?? null;
}

export function prevTier(tier: LeagueTier): LeagueTier | null {
  const idx = LEAGUE_TIERS.findIndex(t => t.id === tier);
  return LEAGUE_TIERS[idx - 1]?.id ?? null;
}

/** Determines promotion/demotion zone for a rank in a 30-player league */
export function rankZone(rank: number, tier: LeagueTier): "promote" | "safe" | "demote" {
  const cfg = tierConfig(tier);
  if (rank <= cfg.promoteTop && cfg.promoteTop > 0) return "promote";
  if (rank > 30 - cfg.demoteBottom && cfg.demoteBottom > 0) return "demote";
  return "safe";
}

/** Mock league entry shape — real data comes from /api/leaderboard */
export type LeagueEntry = {
  rank: number;
  userId: string;
  name: string;
  weeklyXp: number;
  tier: LeagueTier;
  isCurrentUser?: boolean;
};
