/**
 * World Theme Configuration
 *
 * Single source of truth for all world colors, assets, and UI tokens.
 * Used by WorldShell, WorldsPageClient, WikiPageClient, WorldWiki, WorldPathClient, etc.
 */

export type WorldSlug = "fundamentals" | "dj" | "producer";

export const WORLD_ORDER: WorldSlug[] = ["fundamentals", "dj", "producer"];

export interface WorldTheme {
  // Identity
  emoji: string;
  title: string;
  tagline: string;
  description: string;

  // Page background
  bg: string;         // main page bg
  surface: string;    // content area bg (same as bg usually)

  // Text
  textPrimary: string;
  textMuted: string;

  // Hero / header
  heroBg: string;
  heroBorder: string;
  heroText: string;

  // Accent (world colour)
  accentBg: string;
  accentText: string;

  // Rail / sidebar
  railBg: string;       // sidebar bg
  railBorder: string;   // sidebar right border
  railText: string;     // sidebar primary text
  railMuted: string;    // sidebar muted/label text
  dark: boolean;        // true = dark rail (DJ), false = light

  // Progress
  barBg: string;
  barFill: string;

  // Status pills
  pillDone: string;
  pillPartial: string;
  pillEmpty: string;
  pillConnector: string;

  // Mode buttons (Flow / Free)
  flowBtn: string;
  freeBtn: string;

  // View toggle (World / Wiki)
  viewToggleBg: string;
  viewToggleText: string;
  viewToggleActive: string;

  // Assets
  catMain: string;
  catDeco1: string;
  catDeco2: string;
  deco1: string;
  deco2: string;

  // Shadow
  shadow: string;
}

export const WORLD_THEMES: Record<WorldSlug, WorldTheme> = {
  fundamentals: {
    emoji: "🎵",
    title: "Fundamentals",
    tagline: "The vocabulary of music",
    description: "Sound, rhythm, melody, harmony and music technology. The foundation for everything — before you produce or DJ.",

    bg: "bg-bone",
    surface: "bg-bone",
    textPrimary: "text-ink",
    textMuted: "text-ink/55",

    heroBg: "bg-acid",
    heroBorder: "border-b-4 border-ink",
    heroText: "text-ink",

    accentBg: "bg-acid",
    accentText: "text-ink",

    // Rail: warm off-white, clearly readable
    railBg: "bg-[#f0ece4]",
    railBorder: "border-r-4 border-ink",
    railText: "text-ink",
    railMuted: "text-ink/50",
    dark: false,

    barBg: "bg-ink/15",
    barFill: "bg-ink",

    pillDone: "bg-ink text-bone",
    pillPartial: "bg-ink/30 text-ink",
    pillEmpty: "bg-ink/8 text-ink/45",
    pillConnector: "bg-ink/20",

    flowBtn: "bg-ink text-bone hover:bg-electric-blue",
    freeBtn: "bg-ink/12 text-ink hover:bg-ink/22 border border-ink/25",

    viewToggleBg: "bg-ink/8",
    viewToggleText: "text-ink",
    viewToggleActive: "bg-acid text-ink",

    catMain: "/cats/cat-handstand.png",
    catDeco1: "/cats/cat-headphones.png",
    catDeco2: "/cats/cat-dancer.png",
    deco1: "/cats/music-note.png",
    deco2: "/cats/vinyl.png",

    shadow: "chunk-shadow",
  },

  dj: {
    emoji: "🎧",
    title: "DJ World",
    tagline: "The art of playing for people",
    description: "rekordbox, beatmatching, cue points, the mix, crowd reading and career. 40 missions built from the DJ booth up.",

    bg: "bg-[#0a0f2e]",
    surface: "bg-[#0a0f2e]",
    textPrimary: "text-bone",
    textMuted: "text-bone/55",

    heroBg: "bg-[#0a0f2e]",
    heroBorder: "border-b-4 border-volt",
    heroText: "text-bone",

    accentBg: "bg-volt",
    accentText: "text-ink",

    // Rail: slightly lighter deep navy, bone text
    railBg: "bg-[#0d1535]",
    railBorder: "border-r-4 border-volt/60",
    railText: "text-bone",
    railMuted: "text-bone/50",
    dark: true,

    barBg: "bg-volt/20",
    barFill: "bg-volt",

    pillDone: "bg-volt text-ink",
    pillPartial: "bg-volt/30 text-bone",
    pillEmpty: "bg-bone/8 text-bone/40",
    pillConnector: "bg-volt/25",

    flowBtn: "bg-volt text-ink hover:bg-acid",
    freeBtn: "bg-bone/10 text-bone hover:bg-bone/18 border border-bone/20",

    viewToggleBg: "bg-bone/8",
    viewToggleText: "text-bone",
    viewToggleActive: "bg-volt text-ink",

    catMain: "/cats/cat-dj.png",
    catDeco1: "/cats/cat-dj-new.png",
    catDeco2: "/cats/cat-cap.png",
    deco1: "/cats/disco-ball.png",
    deco2: "/cats/headphones.png",

    shadow: "brutal-shadow-acid",
  },

  producer: {
    emoji: "🎛",
    title: "Producer",
    tagline: "Build music in Ableton Live 12",
    description: "From opening Live for the first time to deep instruments, Live 12 power features and pro output. 91 missions across 6 chapters.",

    bg: "bg-bone",
    surface: "bg-bone",
    textPrimary: "text-ink",
    textMuted: "text-ink/55",

    heroBg: "bg-sun",
    heroBorder: "border-b-4 border-ink",
    heroText: "text-ink",

    accentBg: "bg-sun",
    accentText: "text-ink",

    // Rail: warm cream, clearly readable
    railBg: "bg-[#f5f0e8]",
    railBorder: "border-r-4 border-ink",
    railText: "text-ink",
    railMuted: "text-ink/50",
    dark: false,

    barBg: "bg-ink/15",
    barFill: "bg-ink",

    pillDone: "bg-ink text-bone",
    pillPartial: "bg-sun text-ink",
    pillEmpty: "bg-ink/8 text-ink/45",
    pillConnector: "bg-ink/20",

    flowBtn: "bg-ink text-bone hover:bg-hot",
    freeBtn: "bg-ink/12 text-ink hover:bg-ink/22 border border-ink/25",

    viewToggleBg: "bg-ink/8",
    viewToggleText: "text-ink",
    viewToggleActive: "bg-sun text-ink",

    catMain: "/cats/cat-dj-hero.png",
    catDeco1: "/cats/cat-raver.png",
    catDeco2: "/cats/cat-source.png",
    deco1: "/cats/boombox.png",
    deco2: "/cats/star.png",

    shadow: "chunk-shadow",
  },
};

/** Helper used by most components */
export function getWorldTheme(slug: WorldSlug): WorldTheme {
  return WORLD_THEMES[slug] ?? WORLD_THEMES.fundamentals;
}

/** Convenience alias matching reference-branch naming */
export const WORLD_THEME = WORLD_THEMES;

/** Chapter emoji map — single source of truth */
export const CHAPTER_EMOJIS: Record<string, string> = {
  "sound-science": "🔊",
  "rhythm-and-time": "🥁",
  "melody-and-pitch": "🎵",
  "harmony-and-chords": "🎹",
  "music-technology": "💻",
  "setup-and-culture": "🎧",
  "the-library": "📚",
  "the-mix-dj": "🎛",
  "dj-performance": "🎤",
  "dj-mastery": "🏆",
  "first-contact": "🖥",
  "sound-and-midi": "🎼",
  "the-mix-producer": "🎚",
  "performance-and-flow": "🚀",
  "advanced-producer": "⚡",
  "synthesis": "🌀",
};

export function getChapterEmoji(slug: string): string {
  return CHAPTER_EMOJIS[slug] ?? "📖";
}
