"use client";
/**
 * ScrollPaw — CCD-style scroll progress indicator.
 * A paw-shaped SVG that fills with acid-yellow as you scroll.
 * Clicking it returns to the top of the page.
 * Direct port from CatsCanDance main site.
 */
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useState } from "react";

// Recognizable paw: 1 main pad + 4 toe beans
const PAW_PATH =
  "M50 95c-16 0-28-9-28-22 0-13 12-22 28-22s28 9 28 22c0 13-12 22-28 22z " +
  "M22 42c-7 0-12-6-12-13s5-13 12-13 12 6 12 13-5 13-12 13z " +
  "M78 42c-7 0-12-6-12-13s5-13 12-13 12 6 12 13-5 13-12 13z " +
  "M38 22c-6 0-10-5-10-11S32 0 38 0s10 5 10 11-4 11-10 11z " +
  "M62 22c-6 0-10-5-10-11S56 0 62 0s10 5 10 11-4 11-10 11z";

const ScrollPaw = () => {
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 20 });
  const fillY = useTransform(smooth, [0, 1], [100, 0]);
  const ringOpacity = useTransform(smooth, [0, 0.9, 1], [0.3, 0.6, 1]);
  const pct = useTransform(smooth, (v) => `${Math.round(v * 100)}%`);
  const [hover, setHover] = useState(false);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="fixed bottom-5 right-5 z-50 w-16 h-16 md:w-20 md:h-20 group"
      aria-label="Scroll progress — click to return to top"
    >
      {/* Tooltip */}
      {hover && (
        <span className="absolute -top-10 right-0 bg-ink text-bone font-display text-xs px-2 py-1 border-2 border-ink whitespace-nowrap chunk-shadow-sm">
          <motion.span>{pct}</motion.span> · top ↑
        </span>
      )}

      {/* Pulsing ring */}
      <motion.span
        style={{ opacity: ringOpacity }}
        className="absolute inset-[-6px] rounded-full border-4 border-acid animate-pulse"
        aria-hidden
      />

      {/* Paw SVG */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-[4px_4px_0_hsl(222_47%_4%)]"
        aria-hidden
      >
        <defs>
          <clipPath id="paw-clip-ccd">
            <path d={PAW_PATH} />
          </clipPath>
        </defs>
        <g clipPath="url(#paw-clip-ccd)">
          {/* Background — cream */}
          <rect x="0" y="0" width="100" height="100" fill="hsl(20 6% 90%)" />
          {/* Fill — acid yellow rises from bottom */}
          <motion.rect
            x="0"
            width="100"
            height="100"
            fill="hsl(84 81% 56%)"
            style={{ y: fillY }}
          />
        </g>
        {/* Outline */}
        <path
          d={PAW_PATH}
          fill="none"
          stroke="hsl(222 47% 4%)"
          strokeWidth="5"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

export default ScrollPaw;
