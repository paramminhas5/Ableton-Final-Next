"use client";
/**
 * SectionReveal — CCD-style spring scroll entrance animation.
 * Every section that wraps this will slide up + scale in as it enters the viewport.
 * Direct port from CatsCanDance main site.
 */
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  id?: string;
  /** Delay in seconds before animation starts (for staggered sections) */
  delay?: number;
}

const SectionReveal = ({ children, className, id, delay = 0 }: Props) => (
  <motion.div
    id={id}
    initial={{ y: 24, scale: 0.98, opacity: 0 }}
    whileInView={{ y: 0, scale: 1, opacity: 1 }}
    viewport={{ once: true, amount: 0.12 }}
    transition={{
      type: "spring",
      stiffness: 200,
      damping: 22,
      delay,
    }}
    className={className}
  >
    {children}
  </motion.div>
);

export default SectionReveal;
