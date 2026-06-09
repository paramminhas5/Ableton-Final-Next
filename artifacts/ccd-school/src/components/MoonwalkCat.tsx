"use client";
/**
 * MoonwalkCat — CCD's scrolling cat mascot.
 * The cat walks across the bottom of the screen as you scroll.
 * Direct port + enhancement from CatsCanDance main site.
 * Uses cat-headphones.png from /public/cats/
 */
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

const MoonwalkCat = () => {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  // Walk from off-screen left to off-screen right as page scrolls
  const x = useTransform(scrollYProgress, [0, 1], ["-12vw", "112vw"]);
  // Slight rotation as it walks
  const rot = useTransform(scrollYProgress, [0, 1], [-6, 6]);

  if (reduce) return null;

  return (
    <motion.div
      aria-hidden
      style={{ x, willChange: "transform" }}
      className="fixed bottom-3 left-0 z-[60] pointer-events-none"
    >
      <motion.img
        src="/cats/cat-headphones.png"
        alt=""
        // Bob up and down as it walks
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
        style={{
          rotate: rot,
          transform: "scaleX(-1)", // face right (walking direction)
          filter: "drop-shadow(4px 4px 0 hsl(222 47% 4%))",
        }}
        className="w-12 md:w-20"
      />
    </motion.div>
  );
};

export default MoonwalkCat;
