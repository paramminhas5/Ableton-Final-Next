"use client";
/**
 * EasterEggs — hidden delights throughout the app.
 *
 * 1. KONAMI CODE (↑↑↓↓←→←→BA) — activates "disco mode" on the body
 *    (body.disco class → rainbow strobe + shaking from CCD CSS)
 *    DJ Cat explodes onto screen with "DISCO MODE ACTIVATED"
 *
 * 2. CLICK DJ CAT 5× — secret message + +5 XP bonus popup
 *
 * 3. IDLE 30s on any lesson → DJ Cat pops up: "Still there? 👀 Tap to continue..."
 *    (dispatches custom event, LessonPlayer can listen)
 *
 * 4. MORNING GREETING — if first visit of the day before noon, DJ Cat says good morning
 *
 * 5. 100% QUIZ SCORE — DJ Cat does handstand with "PERFECT!" text
 *    (this component handles the global trigger; quiz hands off via CustomEvent)
 */
import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// ─── Konami Code ─────────────────────────────────────────────────────────────
const KONAMI = [
  "ArrowUp","ArrowUp","ArrowDown","ArrowDown",
  "ArrowLeft","ArrowRight","ArrowLeft","ArrowRight",
  "b","a",
];

function useKonami(onActivate: () => void) {
  const seq = useRef<string[]>([]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      seq.current = [...seq.current, e.key].slice(-KONAMI.length);
      if (seq.current.join(",") === KONAMI.join(",")) {
        seq.current = [];
        onActivate();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onActivate]);
}

// ─── Disco overlay ───────────────────────────────────────────────────────────
function DiscoOverlay({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center pointer-events-none"
      aria-hidden
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-electric-blue/80 backdrop-blur-sm" />

      <div className="relative z-10 text-center pointer-events-auto">
        {/* Cat */}
        <motion.div
          animate={{ rotate: [-10, 10, -10], y: [0, -20, 0] }}
          transition={{ duration: 0.5, repeat: 4 }}
          className="flex justify-center mb-4"
        >
          <Image src="/cats/cat-headphones-dance.png" alt="Disco cat!" width={160} height={160}
            className="drop-shadow-[8px_8px_0_hsl(222_47%_4%)]" />
        </motion.div>

        {/* Text */}
        <div className="font-display text-5xl md:text-7xl text-acid mb-2"
          style={{ textShadow: "4px 4px 0 hsl(222 47% 4%)" }}>
          DISCO MODE
        </div>
        <div className="font-display text-2xl text-bone mb-6">ACTIVATED 🪩</div>

        {/* Disco ball */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="flex justify-center mb-6"
        >
          <Image src="/cats/disco-ball.png" alt="" width={80} height={80} className="drop-shadow-[4px_4px_0_hsl(222_47%_4%)]" />
        </motion.div>

        <button onClick={onDismiss}
          className="brutal-border bg-acid text-ink px-8 py-4 font-display text-xl chunk-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-transform">
          BACK TO NORMAL →
        </button>
        <div className="font-mono text-xs text-bone opacity-60 mt-3 uppercase tracking-widest">
          ↑↑↓↓←→←→BA was the password
        </div>
      </div>
    </motion.div>
  );
}

// ─── Secret cat click overlay ─────────────────────────────────────────────────
function SecretCatOverlay({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="fixed bottom-24 right-5 z-[9998] max-w-[260px]"
    >
      <div className="brutal-border bg-acid text-ink p-4 chunk-shadow">
        <div className="flex items-center gap-3 mb-2">
          <Image src="/cats/cat-dj-hero.png" alt="" width={48} height={48}
            className="drop-shadow-[2px_2px_0_hsl(222_47%_4%)] animate-cat-celebrate shrink-0" />
          <div className="font-display text-lg leading-tight">You found me! 🐱</div>
        </div>
        <div className="font-sans text-sm opacity-80 mb-3">
          DJ Pawsworth rewards curious students. +5 bonus XP for finding the secret!
        </div>
        <button onClick={onDismiss}
          className="brutal-border bg-ink text-bone px-3 py-1.5 font-display text-xs w-full hover:bg-electric-blue transition-colors">
          CLAIM REWARD 🎁
        </button>
      </div>
      {/* Arrow */}
      <div className="absolute -bottom-3 right-6 w-0 h-0"
        style={{ borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: "12px solid hsl(222 47% 4%)" }} />
    </motion.div>
  );
}

// ─── Morning greeting ─────────────────────────────────────────────────────────
function MorningGreeting({ onDismiss }: { onDismiss: () => void }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning! ☀️" : hour < 17 ? "Hey there! 👋" : "Evening! 🌙";
  return (
    <motion.div
      initial={{ opacity: 0, x: 80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 80 }}
      transition={{ type: "spring", stiffness: 300, damping: 22, delay: 1.5 }}
      className="fixed bottom-24 right-5 z-[9997] max-w-[240px]"
    >
      <div className="brutal-border bg-electric-blue text-bone p-4 chunk-shadow">
        <div className="flex items-center gap-2 mb-1">
          <Image src="/cats/cat-cap.png" alt="" width={36} height={36}
            className="drop-shadow-[2px_2px_0_hsl(222_47%_4%)] wiggle shrink-0" />
          <div className="font-display text-base">{greeting}</div>
        </div>
        <div className="font-sans text-xs opacity-80 mb-2">
          {progress_streak > 0 ? `${progress_streak}-day streak! Keep it going 🔥` : "Start your first lesson today!"}
        </div>
        <button onClick={onDismiss} className="font-mono text-[10px] uppercase opacity-50 hover:opacity-100">
          dismiss ✕
        </button>
      </div>
    </motion.div>
  );
}

// ─── Perfect score cat ───────────────────────────────────────────────────────
function PerfectScoreOverlay({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -20 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ scale: 0, rotate: 20 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className="fixed top-20 left-1/2 -translate-x-1/2 z-[9998] pointer-events-auto"
    >
      <div className="brutal-border bg-acid text-ink p-4 chunk-shadow text-center">
        <Image src="/cats/cat-handstand.png" alt="" width={80} height={80}
          className="mx-auto drop-shadow-[3px_3px_0_hsl(222_47%_4%)] animate-cat-celebrate" />
        <div className="font-display text-3xl mt-2">PERFECT! 🏆</div>
        <div className="font-sans text-sm opacity-70 mt-1">100% score!</div>
        <button onClick={onDismiss} className="font-mono text-[10px] uppercase opacity-50 hover:opacity-100 mt-2 block mx-auto">
          ✕
        </button>
      </div>
    </motion.div>
  );
}

// ─── Idle cat ────────────────────────────────────────────────────────────────
function IdleCat({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      onClick={onDismiss}
      className="fixed bottom-24 left-5 z-[9997] flex items-center gap-2 brutal-border bg-bone text-ink p-3 chunk-shadow hover:bg-acid transition-colors"
    >
      <Image src="/cats/cat-dj-new.png" alt="" width={40} height={40}
        className="drop-shadow-[2px_2px_0_hsl(222_47%_4%)] wiggle shrink-0" />
      <div className="text-left">
        <div className="font-display text-sm">Still there? 👀</div>
        <div className="font-mono text-[10px] uppercase opacity-60">Tap to continue</div>
      </div>
    </motion.button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
// Note: progress_streak is a module-level var updated from outside
// For simplicity we use a custom event system
let progress_streak = 0;

export function EasterEggs() {
  const [discoActive,    setDiscoActive]    = useState(false);
  const [secretCat,      setSecretCat]      = useState(false);
  const [morningGreet,   setMorningGreet]   = useState(false);
  const [perfectScore,   setPerfectScore]   = useState(false);
  const [idleCat,        setIdleCat]        = useState(false);
  const [catClickCount,  setCatClickCount]  = useState(0);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── 1. Konami Code → Disco mode ──────────────────────────────────────
  const activateDisco = useCallback(() => {
    setDiscoActive(true);
    document.body.classList.add("disco");
  }, []);
  useKonami(activateDisco);

  const deactivateDisco = useCallback(() => {
    setDiscoActive(false);
    document.body.classList.remove("disco");
  }, []);

  // ── 2. Secret cat click — expose via global for any cat image ────────
  useEffect(() => {
    const handler = () => {
      setCatClickCount(c => {
        const next = c + 1;
        if (next >= 5) { setSecretCat(true); return 0; }
        return next;
      });
    };
    window.addEventListener("ccd:cat-click", handler);
    return () => window.removeEventListener("ccd:cat-click", handler);
  }, []);

  // ── 3. Idle cat on lesson pages ──────────────────────────────────────
  useEffect(() => {
    const isLessonPage = window.location.pathname.includes("/learn/") ||
                         window.location.pathname.includes("/mission/");
    if (!isLessonPage) return;

    const reset = () => {
      setIdleCat(false);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => setIdleCat(true), 30_000);
    };

    ["mousemove","keydown","touchstart","scroll"].forEach(e =>
      window.addEventListener(e, reset, { passive: true })
    );
    idleTimer.current = setTimeout(() => setIdleCat(true), 30_000);

    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      ["mousemove","keydown","touchstart","scroll"].forEach(e =>
        window.removeEventListener(e, reset)
      );
    };
  }, []);

  // ── 4. Morning greeting — once per day ───────────────────────────────
  useEffect(() => {
    const key   = "ccd:morning-" + new Date().toDateString();
    const shown = localStorage.getItem(key);
    if (shown) return;
    const timer = setTimeout(() => {
      setMorningGreet(true);
      localStorage.setItem(key, "1");
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // ── 5. Perfect score event ───────────────────────────────────────────
  useEffect(() => {
    const handler = () => { setPerfectScore(true); setTimeout(() => setPerfectScore(false), 3000); };
    window.addEventListener("ccd:perfect-score", handler);
    return () => window.removeEventListener("ccd:perfect-score", handler);
  }, []);

  return (
    <AnimatePresence>
      {discoActive && <DiscoOverlay key="disco" onDismiss={deactivateDisco} />}
      {secretCat   && <SecretCatOverlay key="secret" onDismiss={() => setSecretCat(false)} />}
      {morningGreet && <MorningGreeting key="morning" onDismiss={() => setMorningGreet(false)} />}
      {perfectScore && <PerfectScoreOverlay key="perfect" onDismiss={() => setPerfectScore(false)} />}
      {idleCat     && <IdleCat key="idle" onDismiss={() => setIdleCat(false)} />}
    </AnimatePresence>
  );
}

/**
 * Helper: call this on any cat image onClick to count clicks
 * toward the secret achievement.
 */
export function trackCatClick() {
  window.dispatchEvent(new Event("ccd:cat-click"));
}

/**
 * Helper: call this when quiz score === 1.0 (100%)
 */
export function triggerPerfectScore() {
  window.dispatchEvent(new Event("ccd:perfect-score"));
}
