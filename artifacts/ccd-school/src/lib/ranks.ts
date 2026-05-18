// 12-stage rank system calibrated so ~99% completion with good scores = Ableton Master
// Total XP at 99% perfect play ≈ 15,000 XP

export type Rank = {
  slug: string;
  name: string;
  minXp: number;
  color: string; // Tailwind bg class
  textColor: string; // Tailwind text class
  tagline: string;
  emoji: string;
};

export const RANKS: Rank[] = [
  {
    slug: "bedroom",
    name: "Bedroom Producer",
    minXp: 0,
    color: "bg-bone",
    textColor: "text-ink",
    emoji: "🛏️",
    tagline: "Day one. Headphones on.",
  },
  {
    slug: "loop-maker",
    name: "Loop Maker",
    minXp: 150,
    color: "bg-acid",
    textColor: "text-ink",
    emoji: "🔁",
    tagline: "First loops won't stop.",
  },
  {
    slug: "demo",
    name: "Demo Tape",
    minXp: 400,
    color: "bg-sun",
    textColor: "text-ink",
    emoji: "📼",
    tagline: "Ideas leaving the hard drive.",
  },
  {
    slug: "studio-rat",
    name: "Studio Rat",
    minXp: 800,
    color: "bg-volt",
    textColor: "text-bone",
    emoji: "🐀",
    tagline: "Lives in the DAW.",
  },
  {
    slug: "beatmaker",
    name: "Beatmaker",
    minXp: 1400,
    color: "bg-hot",
    textColor: "text-bone",
    emoji: "🥁",
    tagline: "The drums hit right.",
  },
  {
    slug: "mix-appr",
    name: "Mix Apprentice",
    minXp: 2200,
    color: "bg-acid",
    textColor: "text-ink",
    emoji: "🎚️",
    tagline: "EQ and compress everything.",
  },
  {
    slug: "mix-eng",
    name: "Mix Engineer",
    minXp: 3200,
    color: "bg-volt",
    textColor: "text-bone",
    emoji: "🎛️",
    tagline: "Sidechain, sends, surgery.",
  },
  {
    slug: "sound-des",
    name: "Sound Designer",
    minXp: 4500,
    color: "bg-sun",
    textColor: "text-ink",
    emoji: "🌀",
    tagline: "Synthesis is a second language.",
  },
  {
    slug: "sess-prod",
    name: "Session Producer",
    minXp: 6200,
    color: "bg-hot",
    textColor: "text-bone",
    emoji: "🎹",
    tagline: "Tracks that finish themselves.",
  },
  {
    slug: "touring",
    name: "Touring Artist",
    minXp: 8000,
    color: "bg-ink",
    textColor: "text-bone",
    emoji: "🎤",
    tagline: "Push, Link, no laptop drop.",
  },
  {
    slug: "mastering",
    name: "Mastering Engineer",
    minXp: 10000,
    color: "bg-volt",
    textColor: "text-bone",
    emoji: "🔊",
    tagline: "True-peak, LUFS, last word.",
  },
  {
    slug: "master",
    name: "Ableton Master",
    minXp: 11000,
    color: "bg-acid",
    textColor: "text-ink",
    emoji: "👑",
    tagline: "The manual is a formality.",
  },
];

export function rankFor(xp: number): {
  current: Rank;
  next: Rank | null;
  progress: number;
  idx: number;
} {
  let current = RANKS[0];
  let idx = 0;
  RANKS.forEach((r, i) => {
    if (xp >= r.minXp) {
      current = r;
      idx = i;
    }
  });
  const next = RANKS[idx + 1] ?? null;
  const progress = next ? (xp - current.minXp) / (next.minXp - current.minXp) : 1;
  return { current, next, progress: Math.max(0, Math.min(1, progress)), idx };
}

// XP awards
export const XP_PER_CORRECT = 10; // per correct quiz answer
export const XP_PERFECT_BONUS = 25; // bonus for all-correct quiz
