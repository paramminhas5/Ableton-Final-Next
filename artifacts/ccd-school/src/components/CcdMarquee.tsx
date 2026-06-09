"use client";
/**
 * CcdMarquee — CCD-style scrolling marquee strip.
 * acid-yellow background, border-y-4 border-ink, font-display, ★ separators.
 * Direct port from CatsCanDance main site Marquee component.
 */

type Size = "lg" | "sm";

interface Props {
  /** Items to scroll. Defaults to music-education themed phrases. */
  items?: string[];
  /** Background color class. Default: bg-acid (acid-yellow) */
  bg?: string;
  /** Text color class. Default: text-ink */
  textColor?: string;
  /** Reverse scroll direction */
  reverse?: boolean;
  /** Size variant */
  size?: Size;
}

const DEFAULT_ITEMS = [
  "LEARN MUSIC 🎧",
  "153 MISSIONS",
  "ABLETON LIVE 12",
  "REKORDBOX 6.0",
  "MUSIC THEORY",
  "BEAT GRIDS",
  "CAMELOT WHEEL",
  "SPACED REPETITION",
  "FREE TO START",
  "DJ WORLD",
  "PRODUCER PATH",
  "FUNDAMENTALS",
];

const CcdMarquee = ({
  items,
  bg = "bg-acid",
  textColor = "text-ink",
  reverse = false,
  size = "sm",
}: Props) => {
  const list = items && items.length ? items : DEFAULT_ITEMS;
  // Triple the list so there's no gap at any speed
  const loop = [...list, ...list, ...list];

  const isLg = size === "lg";
  const padding = isLg ? "py-2 md:py-4" : "py-1.5 md:py-2.5";
  const textSize = isLg ? "text-2xl md:text-5xl" : "text-base md:text-2xl";
  const gap = isLg ? "gap-8 md:gap-12" : "gap-6 md:gap-10";

  return (
    <div className={`${bg} border-y-4 border-ink ${padding} overflow-hidden`}>
      <div
        className={`flex ${gap} whitespace-nowrap marquee marquee-speed ${
          reverse ? "[animation-direction:reverse]" : ""
        }`}
      >
        {loop.map((item, i) => (
          <span
            key={i}
            className={`font-display ${textSize} ${textColor} flex items-center ${gap}`}
          >
            {item}
            <span className="text-magenta ml-2">★</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default CcdMarquee;
