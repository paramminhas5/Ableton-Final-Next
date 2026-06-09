/**
 * World Theme Configuration
 * 
 * Centralized theme configuration for world components
 * Used by WorldShell, WorldPageClient, WorldsPageClient, etc.
 */

export type WorldSlug = "fundamentals" | "dj" | "producer";

export interface WorldTheme {
  // Core colors
  bg: string;
  textPrimary: string;
  textMuted: string;
  
  // Hero section
  heroBg: string;
  heroBorder: string;
  heroText: string;
  
  // UI elements
  accentBg: string;
  accentText: string;
  
  // Progress indicators
  barBg: string;
  barFill: string;
  
  // Status pills
  pillDone: string;
  pillPartial: string;
  pillEmpty: string;
  pillConnector: string;
  
  // Mode buttons
  flowBtn: string;
  freeBtn: string;
  
  // Visual elements
  shadow: string;
  catMain: string;
  catDeco1: string;
  catDeco2: string;
  deco1: string;
  deco2: string;
  emoji: string;
  
  // Info
  title: string;
  tagline: string;
  description: string;
  
  // Shell specific
  sidebarBg: string;
  sidebarBorder: string;
  sidebarText: string;
  contentBg: string;
  viewToggleBg: string;
  viewToggleText: string;
  viewToggleActive: string;
}

export const WORLD_THEMES: Record<WorldSlug, WorldTheme> = {
  fundamentals: {
    bg: "bg-bone",
    textPrimary: "text-ink",
    textMuted: "text-ink/55",
    
    heroBg: "bg-acid",
    heroBorder: "border-b-4 border-ink",
    heroText: "text-ink",
    
    accentBg: "bg-acid",
    accentText: "text-ink",
    
    barBg: "bg-ink/20",
    barFill: "bg-ink",
    
    pillDone: "bg-ink text-bone",
    pillPartial: "bg-ink/35 text-ink",
    pillEmpty: "bg-ink/10 text-ink/40",
    pillConnector: "bg-ink/25",
    
    flowBtn: "bg-ink text-bone hover:bg-electric-blue",
    freeBtn: "bg-ink/15 text-ink hover:bg-ink/30 border-ink/40",
    
    shadow: "chunk-shadow",
    catMain: "/cats/cat-handstand.png",
    catDeco1: "/cats/cat-headphones.png",
    catDeco2: "/cats/cat-dancer.png",
    deco1: "/cats/music-note.png",
    deco2: "/cats/vinyl.png",
    emoji: "🎵",
    
    title: "Fundamentals",
    tagline: "The vocabulary of music",
    description: "Sound, rhythm, melody, harmony and music technology. The foundation for everything.",
    
    sidebarBg: "bg-ink text-bone",
    sidebarBorder: "border-r-4 border-ink",
    sidebarText: "text-bone",
    contentBg: "bg-bone",
    viewToggleBg: "bg-ink/10",
    viewToggleText: "text-ink",
    viewToggleActive: "bg-acid text-ink",
  },
  dj: {
    bg: "bg-[#0a0f2e]",
    textPrimary: "text-bone",
    textMuted: "text-bone/55",
    
    heroBg: "bg-[#0a0f2e]",
    heroBorder: "border-b-4 border-volt",
    heroText: "text-bone",
    
    accentBg: "bg-volt",
    accentText: "text-ink",
    
    barBg: "bg-volt/20",
    barFill: "bg-volt",
    
    pillDone: "bg-volt text-ink",
    pillPartial: "bg-volt/35 text-bone",
    pillEmpty: "bg-bone/10 text-bone/35",
    pillConnector: "bg-volt/25",
    
    flowBtn: "bg-volt text-ink hover:bg-acid",
    freeBtn: "bg-bone/10 text-bone hover:bg-bone/20 border-bone/20",
    
    shadow: "brutal-shadow-acid",
    catMain: "/cats/cat-dj.png",
    catDeco1: "/cats/cat-dj-new.png",
    catDeco2: "/cats/cat-cap.png",
    deco1: "/cats/disco-ball.png",
    deco2: "/cats/headphones.png",
    emoji: "🎧",
    
    title: "DJ World",
    tagline: "The art of playing for people",
    description: "rekordbox, beatmatching, cue points, the mix, crowd reading and career.",
    
    sidebarBg: "bg-[#0a1228] text-bone",
    sidebarBorder: "border-r-4 border-volt",
    sidebarText: "text-bone",
    contentBg: "bg-[#0a0f2e]",
    viewToggleBg: "bg-volt/10",
    viewToggleText: "text-bone",
    viewToggleActive: "bg-volt text-ink",
  },
  producer: {
    bg: "bg-bone",
    textPrimary: "text-ink",
    textMuted: "text-ink/55",
    
    heroBg: "bg-sun",
    heroBorder: "border-b-4 border-ink",
    heroText: "text-ink",
    
    accentBg: "bg-sun",
    accentText: "text-ink",
    
    barBg: "bg-ink/20",
    barFill: "bg-ink",
    
    pillDone: "bg-ink text-bone",
    pillPartial: "bg-ink/35 text-ink",
    pillEmpty: "bg-ink/10 text-ink/40",
    pillConnector: "bg-ink/25",
    
    flowBtn: "bg-ink text-bone hover:bg-hot",
    freeBtn: "bg-ink/15 text-ink hover:bg-ink/30 border-ink/40",
    
    shadow: "chunk-shadow",
    catMain: "/cats/cat-dj-hero.png",
    catDeco1: "/cats/cat-raver.png",
    catDeco2: "/cats/cat-source.png",
    deco1: "/cats/boombox.png",
    deco2: "/cats/star.png",
    emoji: "🎛",
    
    title: "Producer",
    tagline: "Build music in Ableton Live 12",
    description: "From opening Live for the first time to deep instruments, Live 12 power features and pro output.",
    
    sidebarBg: "bg-ink text-bone",
    sidebarBorder: "border-r-4 border-sun",
    sidebarText: "text-bone",
    contentBg: "bg-bone",
    viewToggleBg: "bg-ink/10",
    viewToggleText: "text-ink",
    viewToggleActive: "bg-sun text-ink",
  },
};

export function getWorldTheme(worldSlug: WorldSlug): WorldTheme {
  return WORLD_THEMES[worldSlug] || WORLD_THEMES.fundamentals;
}

export function getChapterEmoji(chapterSlug: string): string {
  const CHAPTER_EMOJIS: Record<string, string> = {
    "sound-science": "🔊", "rhythm-and-time": "🥁", "melody-and-pitch": "🎵",
    "harmony-and-chords": "🎹", "music-technology": "💻",
    "setup-and-culture": "🎧", "the-library": "📚", "the-mix-dj": "🎛",
    "dj-performance": "🎤", "dj-mastery": "🏆",
    "first-contact": "🖥", "sound-and-midi": "🎼", "the-mix-producer": "🎚",
    "performance-and-flow": "🚀", "advanced-producer": "⚡", "synthesis": "🌀",
  };
  return CHAPTER_EMOJIS[chapterSlug] ?? "📖";
}