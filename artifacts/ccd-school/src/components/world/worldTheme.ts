/**
 * worldTheme.ts — single source of truth for per-world visual identity.
 * Used by WorldShell, FlowView (snake) and FreeView (wiki) so colours,
 * cats and emojis never drift between surfaces.
 */

export type WorldId = "fundamentals" | "dj" | "producer";

export interface WorldTheme {
  id: WorldId;
  title: string;
  emoji: string;
  tagline: string;
  description: string;
  dark: boolean;
  /** Page / content background */
  surface: string;
  /** Rail background */
  railBg: string;
  /** Primary accent (chips, bars, active states) */
  accentBg: string;
  accentText: string;
  /** Secondary / soft accent for biome bands */
  biomeTint: string;
  /** Text colours on the world surface */
  textPrimary: string;
  textMuted: string;
  /** Snake node states */
  nodeAvail: string;
  nodeDone: string;
  nodeReview: string;
  /** Trail line + glow */
  trail: string;
  glow: string;
  /** Cats */
  catMain: string;
  catDeco1: string;
  catDeco2: string;
  deco1: string;
  deco2: string;
}

export const WORLD_THEME: Record<WorldId, WorldTheme> = {
  fundamentals: {
    id: "fundamentals",
    title: "Fundamentals",
    emoji: "🎵",
    tagline: "The vocabulary of music",
    description: "Sound, rhythm, melody, harmony and music technology. The foundation for everything.",
    dark: false,
    surface: "bg-bone",
    railBg: "bg-acid",
    accentBg: "bg-acid",
    accentText: "text-ink",
    biomeTint: "bg-acid/10",
    textPrimary: "text-ink",
    textMuted: "text-ink/55",
    nodeAvail: "bg-acid text-ink border-4 border-ink",
    nodeDone: "bg-ink text-bone border-4 border-ink",
    nodeReview: "bg-hot text-bone border-4 border-hot",
    trail: "rgba(34,47,10,0.18)",
    glow: "rgba(198,255,0,0.45)",
    catMain: "/cats/cat-handstand.png",
    catDeco1: "/cats/cat-headphones.png",
    catDeco2: "/cats/cat-dancer.png",
    deco1: "/cats/music-note.png",
    deco2: "/cats/star.png",
  },
  dj: {
    id: "dj",
    title: "DJ World",
    emoji: "🎧",
    tagline: "The art of playing for people",
    description: "rekordbox, beatmatching, cue points, the mix, crowd reading and career.",
    dark: true,
    surface: "bg-[#0a0f2e]",
    railBg: "bg-[#0a0f2e]",
    accentBg: "bg-volt",
    accentText: "text-ink",
    biomeTint: "bg-volt/5",
    textPrimary: "text-bone",
    textMuted: "text-bone/55",
    nodeAvail: "bg-volt text-ink border-4 border-volt",
    nodeDone: "bg-volt/20 text-bone border-4 border-volt/50",
    nodeReview: "bg-hot text-bone border-4 border-hot",
    trail: "rgba(120,160,255,0.22)",
    glow: "rgba(198,255,0,0.4)",
    catMain: "/cats/cat-dj.png",
    catDeco1: "/cats/cat-dj-new.png",
    catDeco2: "/cats/cat-cap.png",
    deco1: "/cats/disco-ball.png",
    deco2: "/cats/headphones.png",
  },
  producer: {
    id: "producer",
    title: "Producer",
    emoji: "🎛",
    tagline: "Build music in Ableton Live 12",
    description: "From opening Live to deep instruments, Live 12 power features and pro output.",
    dark: false,
    surface: "bg-bone",
    railBg: "bg-sun",
    accentBg: "bg-sun",
    accentText: "text-ink",
    biomeTint: "bg-sun/10",
    textPrimary: "text-ink",
    textMuted: "text-ink/55",
    nodeAvail: "bg-sun text-ink border-4 border-ink",
    nodeDone: "bg-ink text-bone border-4 border-ink",
    nodeReview: "bg-hot text-bone border-4 border-hot",
    trail: "rgba(34,47,10,0.18)",
    glow: "rgba(255,184,0,0.45)",
    catMain: "/cats/cat-dj-hero.png",
    catDeco1: "/cats/cat-raver.png",
    catDeco2: "/cats/cat-source.png",
    deco1: "/cats/boombox.png",
    deco2: "/cats/vinyl-music.png",
  },
};

export const CHAPTER_EMOJIS: Record<string, string> = {
  "sound-science": "🔊", "rhythm-and-time": "🥁", "melody-and-pitch": "🎵",
  "harmony-and-chords": "🎹", "music-technology": "💻",
  "setup-and-culture": "🎧", "the-library": "📚", "the-mix-dj": "🎛",
  "dj-performance": "🎤", "dj-mastery": "🏆",
  "first-contact": "🖥", "sound-and-midi": "🎼", "the-mix-producer": "🎚",
  "performance-and-flow": "🚀", "advanced-producer": "⚡", "synthesis": "🌀",
};

export const CHAPTER_CAT_QUIPS: Record<WorldId, string[]> = {
  fundamentals: ["Let's start with sound! 🎵", "Rhythm is everything.", "Melody unlocked 🎶", "Chords = emotion.", "Final stretch!"],
  dj: ["DJ school is in! 🎧", "Your library is power.", "Time to mix! 🎚", "Read the crowd.", "Master level! 🏆"],
  producer: ["Welcome to Live! 🖥", "Sound design time!", "Mix it down 🎛", "Take it live! 🚀", "Expert territory!", "Synths unlocked 🌀"],
};

export const WORLD_ORDER: WorldId[] = ["fundamentals", "dj", "producer"];

export function isWorldId(slug: string): slug is WorldId {
  return slug === "fundamentals" || slug === "dj" || slug === "producer";
}
