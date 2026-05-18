// Custom monoline glyphs — replaces emojis with consistent geometric marks.
// Each glyph is 24×24, currentColor stroke. Add to the GLYPHS map; render
// with <Glyph name="..." className="..." />. Unknown names fall back to a
// neutral dot.
import type { ReactElement, SVGProps } from "react";

type GlyphName =
  | "wave"
  | "drum"
  | "note"
  | "piano"
  | "monitor"
  | "fader"
  | "mixer"
  | "headphones"
  | "deck"
  | "cue"
  | "crowd"
  | "key"
  | "library"
  | "sparkle"
  | "clipboard"
  | "wave-fx"
  | "midi"
  | "device"
  | "sampler"
  | "synth"
  | "session"
  | "arrangement"
  | "warp"
  | "sidechain"
  | "compass"
  | "spark"
  | "grid"
  | "dot";

const STROKE = { strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const PATHS: Record<GlyphName, ReactElement> = {
  wave: (
    <path d="M2 12 Q5 4 8 12 T14 12 T20 12 T22 12" fill="none" stroke="currentColor" {...STROKE} />
  ),
  drum: (
    <g fill="none" stroke="currentColor" {...STROKE}>
      <ellipse cx="12" cy="7" rx="8" ry="2.5" />
      <path d="M4 7v9c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5V7" />
    </g>
  ),
  note: (
    <g fill="none" stroke="currentColor" {...STROKE}>
      <path d="M9 18V5l10-2v13" />
      <circle cx="7" cy="18" r="2.5" />
      <circle cx="17" cy="16" r="2.5" />
    </g>
  ),
  piano: (
    <g fill="none" stroke="currentColor" {...STROKE}>
      <rect x="3" y="5" width="18" height="14" />
      <path d="M8 5v9M13 5v9M18 5v9M3 14h18" />
    </g>
  ),
  monitor: (
    <g fill="none" stroke="currentColor" {...STROKE}>
      <rect x="3" y="4" width="18" height="13" />
      <path d="M9 21h6M12 17v4" />
    </g>
  ),
  fader: (
    <g fill="none" stroke="currentColor" {...STROKE}>
      <path d="M6 3v18M12 3v18M18 3v18" />
      <rect x="4" y="8" width="4" height="3" />
      <rect x="10" y="13" width="4" height="3" />
      <rect x="16" y="6" width="4" height="3" />
    </g>
  ),
  mixer: (
    <g fill="none" stroke="currentColor" {...STROKE}>
      <circle cx="7" cy="8" r="2.5" />
      <circle cx="17" cy="8" r="2.5" />
      <path d="M4 16h16M4 20h16" />
    </g>
  ),
  headphones: (
    <g fill="none" stroke="currentColor" {...STROKE}>
      <path d="M4 14a8 8 0 0 1 16 0" />
      <rect x="3" y="13" width="4" height="7" />
      <rect x="17" y="13" width="4" height="7" />
    </g>
  ),
  deck: (
    <g fill="none" stroke="currentColor" {...STROKE}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
    </g>
  ),
  cue: (
    <g fill="none" stroke="currentColor" {...STROKE}>
      <path d="M12 2v14" />
      <path d="M7 17h10l-5 5z" fill="currentColor" />
    </g>
  ),
  crowd: (
    <g fill="none" stroke="currentColor" {...STROKE}>
      <circle cx="7" cy="8" r="2.5" />
      <circle cx="17" cy="8" r="2.5" />
      <circle cx="12" cy="6" r="2.5" />
      <path d="M2 20c0-3 2-5 5-5s5 2 5 5M12 20c0-3 2-5 5-5s5 2 5 5" />
    </g>
  ),
  key: (
    <g fill="none" stroke="currentColor" {...STROKE}>
      <circle cx="8" cy="12" r="4" />
      <path d="M12 12h9M17 12v4M20 12v3" />
    </g>
  ),
  library: (
    <g fill="none" stroke="currentColor" {...STROKE}>
      <rect x="3" y="4" width="4" height="16" />
      <rect x="9" y="4" width="4" height="16" />
      <path d="M15 4l5 1-3 15-5-1z" />
    </g>
  ),
  sparkle: (
    <g fill="none" stroke="currentColor" {...STROKE}>
      <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
      <path d="M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3" />
    </g>
  ),
  clipboard: (
    <g fill="none" stroke="currentColor" {...STROKE}>
      <rect x="5" y="5" width="14" height="16" />
      <rect x="8" y="2" width="8" height="4" />
      <path d="M8 11h8M8 15h8M8 19h5" />
    </g>
  ),
  "wave-fx": (
    <g fill="none" stroke="currentColor" {...STROKE}>
      <path d="M2 16 Q5 6 8 16 T14 16 T22 16" />
      <path d="M2 10 Q5 4 8 10 T14 10 T22 10" opacity="0.5" />
    </g>
  ),
  midi: (
    <g fill="none" stroke="currentColor" {...STROKE}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="6" cy="14" r="1.5" />
      <circle cx="18" cy="14" r="1.5" />
      <circle cx="9" cy="7" r="1.5" />
      <circle cx="15" cy="7" r="1.5" />
      <circle cx="12" cy="18" r="1.5" />
    </g>
  ),
  device: (
    <g fill="none" stroke="currentColor" {...STROKE}>
      <rect x="3" y="6" width="18" height="12" />
      <circle cx="8" cy="12" r="2" />
      <path d="M14 10h4M14 14h4" />
    </g>
  ),
  sampler: (
    <g fill="none" stroke="currentColor" {...STROKE}>
      <rect x="3" y="3" width="8" height="8" />
      <rect x="13" y="3" width="8" height="8" />
      <rect x="3" y="13" width="8" height="8" />
      <rect x="13" y="13" width="8" height="8" />
    </g>
  ),
  synth: (
    <g fill="none" stroke="currentColor" {...STROKE}>
      <path d="M3 12 Q7 4 11 12 T19 12 T22 12" />
      <circle cx="6" cy="18" r="1.5" />
      <circle cx="12" cy="18" r="1.5" />
      <circle cx="18" cy="18" r="1.5" />
    </g>
  ),
  session: (
    <g fill="none" stroke="currentColor" {...STROKE}>
      <rect x="3" y="3" width="6" height="6" />
      <rect x="11" y="3" width="6" height="6" />
      <rect x="3" y="11" width="6" height="6" />
      <rect x="11" y="11" width="6" height="6" />
    </g>
  ),
  arrangement: (
    <g fill="none" stroke="currentColor" {...STROKE}>
      <rect x="2" y="5" width="20" height="4" />
      <rect x="2" y="11" width="14" height="4" />
      <rect x="2" y="17" width="18" height="4" />
    </g>
  ),
  warp: (
    <g fill="none" stroke="currentColor" {...STROKE}>
      <path d="M3 12c4-8 14 8 18 0" />
      <path d="M3 12h18" opacity="0.3" />
    </g>
  ),
  sidechain: (
    <g fill="none" stroke="currentColor" {...STROKE}>
      <path d="M3 8h6l3 8 3-8h6" />
    </g>
  ),
  compass: (
    <g fill="none" stroke="currentColor" {...STROKE}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 15l3-8 3 8-3-2z" fill="currentColor" />
    </g>
  ),
  spark: (
    <g fill="none" stroke="currentColor" {...STROKE}>
      <path d="M12 2v8M12 14v8M2 12h8M14 12h8" />
    </g>
  ),
  grid: (
    <g fill="none" stroke="currentColor" {...STROKE}>
      <rect x="3" y="3" width="18" height="18" />
      <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
    </g>
  ),
  dot: <circle cx="12" cy="12" r="3" fill="currentColor" />,
};

interface Props extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: GlyphName | string;
  size?: number;
}

export function Glyph({ name, size = 24, className, ...rest }: Props) {
  const path = (PATHS as Record<string, ReactElement>)[name] ?? PATHS.dot;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {path}
    </svg>
  );
}

// Map emoji → glyph name, so existing data with emojis still renders nicely
const EMOJI_MAP: Record<string, GlyphName> = {
  "🔊": "wave",
  "🥁": "drum",
  "🎵": "note",
  "🎶": "note",
  "🎹": "piano",
  "💻": "monitor",
  "🎚️": "fader",
  "🎚": "fader",
  "🎛️": "mixer",
  "🎛": "mixer",
  "🎧": "headphones",
  "⏱️": "deck",
  "⏱": "deck",
  "📍": "cue",
  "👥": "crowd",
  "🌊": "wave-fx",
  "📚": "library",
  "🔑": "key",
  "✨": "sparkle",
  "📋": "clipboard",
  "🌱": "spark",
  "🏆": "sparkle",
  "🎯": "compass",
};

export function glyphFromEmoji(emoji?: string | null): GlyphName {
  if (!emoji) return "dot";
  return EMOJI_MAP[emoji] ?? "dot";
}

// Convenience: render either the emoji-mapped glyph or a fallback
export function EmojiGlyph({ emoji, size = 22, className }: { emoji?: string; size?: number; className?: string }) {
  return <Glyph name={glyphFromEmoji(emoji)} size={size} className={className} />;
}
