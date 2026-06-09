"use client";
/**
 * DjCatMascot — DJ Pawsworth, the CCD.SCHOOL mascot.
 *
 * The DJ cat appears throughout the app:
 *   - Onboarding: guides users through setup steps
 *   - Mission intro: gives context tips
 *   - Completion: celebrates with the user
 *   - Between missions: transitions
 *   - Error states: sad/confused expression
 *
 * Poses map to different cat images:
 *   neutral    → cat-dj-hero.png   (default standing DJ)
 *   celebrate  → cat-headphones-dance.png  (arms up, dancing)
 *   think      → cat-dj-new.png    (pondering)
 *   sad        → cat-raver.png     (subdued)
 *   play       → cat-dj.png        (at the decks)
 *   walk       → cat-headphones.png (walking)
 *   handstand  → cat-handstand.png  (excited!)
 *   cap        → cat-cap.png       (casual)
 */

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export type CatPose =
  | "neutral"
  | "celebrate"
  | "think"
  | "sad"
  | "play"
  | "walk"
  | "handstand"
  | "cap";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

const POSE_SRC: Record<CatPose, string> = {
  neutral:   "/cats/cat-dj-hero.png",
  celebrate: "/cats/cat-headphones-dance.png",
  think:     "/cats/cat-dj-new.png",
  sad:       "/cats/cat-raver.png",
  play:      "/cats/cat-dj.png",
  walk:      "/cats/cat-headphones.png",
  handstand: "/cats/cat-handstand.png",
  cap:       "/cats/cat-cap.png",
};

const POSE_ANIMATION: Record<CatPose, string> = {
  neutral:   "float",
  celebrate: "animate-cat-celebrate",
  think:     "wiggle",
  sad:       "float",
  play:      "wiggle",
  walk:      "animate-bounce-bob",
  handstand: "wiggle",
  cap:       "float",
};

const SIZE_CLASS: Record<Size, string> = {
  xs: "w-12 h-12",
  sm: "w-20 h-20",
  md: "w-32 h-32",
  lg: "w-48 h-48",
  xl: "w-64 h-64",
};

interface Props {
  /** Cat expression/pose to show */
  pose?: CatPose;
  /** Size of the cat image */
  size?: Size;
  /** Speech bubble text — shown in a callout above the cat */
  speechBubble?: string;
  /** Extra CSS classes on the wrapper */
  className?: string;
  /** Animate entrance */
  entrance?: boolean;
  /** Flip horizontally */
  flip?: boolean;
}

export function DjCatMascot({
  pose = "neutral",
  size = "md",
  speechBubble,
  className = "",
  entrance = true,
  flip = false,
}: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const src = POSE_SRC[pose];
  const anim = POSE_ANIMATION[pose];
  const sizeClass = SIZE_CLASS[size];

  const wrapper = (
    <div className={`relative inline-flex flex-col items-center gap-2 ${className}`}>
      {/* Speech bubble */}
      <AnimatePresence>
        {speechBubble && mounted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 6 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative max-w-[220px] bg-bone text-ink border-4 border-ink px-3 py-2 chunk-shadow font-sans text-sm leading-snug text-center"
          >
            {speechBubble}
            {/* Pointer arrow */}
            <span
              className="absolute -bottom-[18px] left-1/2 -translate-x-1/2 w-0 h-0"
              style={{
                borderLeft: "10px solid transparent",
                borderRight: "10px solid transparent",
                borderTop: "14px solid hsl(222 47% 4%)",
              }}
              aria-hidden
            />
            <span
              className="absolute -bottom-[12px] left-1/2 -translate-x-1/2 w-0 h-0"
              style={{
                borderLeft: "8px solid transparent",
                borderRight: "8px solid transparent",
                borderTop: "11px solid hsl(20 6% 90%)",
              }}
              aria-hidden
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cat image */}
      <div
        className={`relative ${sizeClass} ${anim} mt-${speechBubble ? "4" : "0"}`}
        style={{
          filter: "drop-shadow(4px 4px 0 hsl(222 47% 4%))",
          transform: flip ? "scaleX(-1)" : undefined,
        }}
      >
        <Image
          src={src}
          alt={`DJ Pawsworth — ${pose}`}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 128px, 256px"
        />
      </div>
    </div>
  );

  if (!entrance) return wrapper;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, rotate: -10, y: 20 }}
      animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
      className="inline-flex"
    >
      {wrapper}
    </motion.div>
  );
}

/**
 * MascotTip — compact DJ Cat tip card used in MissionIntroCard and lesson transitions.
 */
export function MascotTip({
  tip,
  pose = "think",
  accent = "bg-electric-blue text-bone",
}: {
  tip: string;
  pose?: CatPose;
  accent?: string;
}) {
  return (
    <div className={`brutal-border ${accent} p-4 flex items-center gap-4`}>
      <div className="shrink-0">
        <div
          className="relative w-16 h-16 wiggle"
          style={{ filter: "drop-shadow(3px 3px 0 hsl(222 47% 4%))" }}
        >
          <Image
            src={POSE_SRC[pose]}
            alt="DJ Pawsworth tip"
            fill
            className="object-contain"
            sizes="64px"
          />
        </div>
      </div>
      <div>
        <div className="font-display text-sm uppercase opacity-70 mb-1">DJ PAWSWORTH SAYS</div>
        <div className="font-sans text-sm leading-relaxed">{tip}</div>
      </div>
    </div>
  );
}

/**
 * MascotCelebration — full celebration overlay cat for CompletionModal.
 */
export function MascotCelebration({ xp }: { xp: number }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -15 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }}
      className="flex flex-col items-center gap-2"
    >
      <div
        className="relative w-40 h-40 animate-cat-celebrate"
        style={{ filter: "drop-shadow(6px 6px 0 hsl(222 47% 4%))" }}
      >
        <Image
          src="/cats/cat-headphones-dance.png"
          alt="DJ Pawsworth celebrating!"
          fill
          className="object-contain"
          sizes="160px"
          priority
        />
      </div>
      {xp > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="font-display text-3xl text-acid"
          style={{ textShadow: "3px 3px 0 hsl(222 47% 4%)" }}
        >
          +{xp} XP! 🎉
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * MascotOnboardStep — cat with world-appropriate pose for onboarding.
 */
export function MascotOnboardStep({
  step,
  world,
  message,
}: {
  step: number;
  world?: string;
  message: string;
}) {
  const poses: CatPose[] = ["handstand", "cap", "play", "neutral", "celebrate"];
  const pose: CatPose = poses[step % poses.length] ?? "neutral";

  return (
    <div className="flex justify-center mb-6">
      <DjCatMascot
        pose={pose}
        size="lg"
        speechBubble={message}
        entrance
      />
    </div>
  );
}
