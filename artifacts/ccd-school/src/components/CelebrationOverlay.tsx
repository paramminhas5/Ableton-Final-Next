"use client";
/**
 * CelebrationOverlay — full-screen moment for major achievements.
 *
 * Triggered by:
 *   • Rank-up (new rank unlocked)
 *   • 7-day streak milestone
 *   • Path trophy earned
 *   • Chapter trophy earned
 *   • World trophy earned
 *
 * Usage:
 *   <CelebrationOverlay event={event} onDone={() => setEvent(null)} />
 *
 * The parent decides when to show it — typically after CompletionModal closes,
 * or when progress changes are detected via useCelebration() hook.
 */
import { useEffect, useState, useRef } from "react";
import { playFanfare } from "@/lib/audio";

export type CelebrationEvent =
  | { kind: "rank-up";     rankName: string; rankEmoji: string }
  | { kind: "streak";      days: number }
  | { kind: "shield-earned"; streakDays: number }
  | { kind: "path-trophy"; trophyName: string; pathTitle: string }
  | { kind: "chapter-trophy"; trophyName: string; chapterTitle: string }
  | { kind: "world-trophy";   worldName: string; }
  | { kind: "ccd-master" };

interface Props {
  event: CelebrationEvent | null;
  onDone: () => void;
}

function BigConfetti() {
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    left: `${(i / 50) * 100}%`,
    delay: `${(i * 0.03).toFixed(2)}s`,
    dur:   `${(0.9 + (i % 6) * 0.12).toFixed(2)}s`,
    color: ["#C6FF00","#FF2D2D","#7B2FFF","#FFB800","#00FFFF","#FF69B4"][i % 6],
    size:  `${8 + (i % 6)}px`,
    rotate: `${i * 37}deg`,
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      <style>{`@keyframes bigfall{0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(110vh) rotate(720deg);opacity:0}}`}</style>
      {pieces.map((p, i) => (
        <div key={i} style={{
          position: "absolute", left: p.left, top: 0,
          width: p.size, height: p.size, background: p.color,
          animation: `bigfall ${p.dur} ${p.delay} ease-in forwards`,
          transform: `rotate(${p.rotate})`,
        }} />
      ))}
    </div>
  );
}

function useCountUp(target: number, active: boolean) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    const dur = 1000;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active]);
  return val;
}

function EventContent({ event }: { event: CelebrationEvent }) {
  const days = useCountUp(event.kind === "streak" ? event.days : 0, true);

  switch (event.kind) {
    case "shield-earned":
      return (
        <div className="text-center space-y-4">
          {/* Shield materialises with the keyframe defined in globals.css */}
          <div
            className="text-8xl animate-shield-earn inline-block animate-shield-pulse"
            style={{ transformOrigin: "center" }}
          >
            🛡
          </div>
          <div className="font-mono text-[10px] uppercase opacity-60">STREAK SHIELD EARNED</div>
          <div className="font-display text-4xl md:text-5xl leading-none text-acid">
            {event.streakDays}-DAY STREAK
          </div>
          <div className="brutal-border bg-acid text-ink px-6 py-3 font-display text-xl inline-block">
            +1 STREAK FREEZE
          </div>
          <div className="font-mono text-sm opacity-70 max-w-xs mx-auto leading-relaxed">
            Your streak is protected for one missed day. Keep the chain going!
          </div>
        </div>
      );
    case "rank-up":
      return (
        <div className="text-center space-y-4">
          <div style={{ fontSize: 80 }}>{event.rankEmoji}</div>
          <div className="font-mono text-[10px] uppercase opacity-60">RANK UP!</div>
          <div className="font-display text-5xl md:text-7xl leading-none">{event.rankName}</div>
          <div className="font-mono text-sm opacity-70">You&apos;ve unlocked a new rank. Keep going.</div>
        </div>
      );
    case "streak":
      return (
        <div className="text-center space-y-4">
          <div className="text-8xl">🔥</div>
          <div className="font-mono text-[10px] uppercase opacity-60">STREAK MILESTONE</div>
          <div className="font-display text-8xl leading-none text-acid">{days}</div>
          <div className="font-display text-3xl">DAY STREAK</div>
          <div className="font-mono text-sm opacity-70">
            {event.days >= 30 ? "Legendary dedication." : event.days >= 14 ? "Two weeks strong." : "One week down!"}
          </div>
          {event.days % 7 === 0 && (
            <div className="brutal-border bg-volt text-bone px-4 py-2 font-mono text-sm">
              🛡 Streak Freeze earned!
            </div>
          )}
        </div>
      );
    case "path-trophy":
      return (
        <div className="text-center space-y-4">
          <div className="text-7xl">🏅</div>
          <div className="font-mono text-[10px] uppercase opacity-60">PATH COMPLETE</div>
          <div className="font-display text-4xl md:text-5xl leading-tight">{event.pathTitle}</div>
          <div className="brutal-border bg-acid text-ink px-4 py-2 font-display text-xl inline-block">
            {event.trophyName}
          </div>
        </div>
      );
    case "chapter-trophy":
      return (
        <div className="text-center space-y-4">
          <div className="text-7xl">🏆</div>
          <div className="font-mono text-[10px] uppercase opacity-60">CHAPTER COMPLETE</div>
          <div className="font-display text-4xl leading-tight">{event.chapterTitle}</div>
          <div className="brutal-border bg-volt text-bone px-4 py-2 font-display text-xl inline-block">
            {event.trophyName}
          </div>
        </div>
      );
    case "world-trophy":
      return (
        <div className="text-center space-y-4">
          <div className="text-7xl">🌟</div>
          <div className="font-mono text-[10px] uppercase opacity-60">WORLD COMPLETE!</div>
          <div className="font-display text-5xl md:text-7xl leading-none text-acid">{event.worldName}</div>
          <div className="font-mono text-sm opacity-70">You finished an entire world. Incredible.</div>
        </div>
      );
    case "ccd-master":
      return (
        <div className="text-center space-y-4">
          <div className="text-7xl">👑</div>
          <div className="font-mono text-[10px] uppercase opacity-60">ALL WORLDS COMPLETE</div>
          <div className="font-display text-5xl md:text-7xl leading-none text-acid">CCD MASTER</div>
          <div className="font-mono text-sm opacity-70">You completed the full curriculum. Legendary.</div>
        </div>
      );
  }
}

export function CelebrationOverlay({ event, onDone }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!event) return;
    const t = setTimeout(() => { setVisible(true); playFanfare(); }, 50);
    return () => clearTimeout(t);
  }, [event]);

  if (!event) return null;

  // ── Fix #10: Shield-earned uses a lightweight toast-style overlay ──────────
  // It doesn't need the full-screen takeover — just a slick banner that
  // auto-dismisses after 3.5s or on tap.
  if (event.kind === "shield-earned") {
    return (
      <div
        className={`fixed bottom-[80px] md:bottom-6 left-3 right-3 md:left-auto md:right-6 md:w-80 z-[300]
          brutal-border bg-ink text-bone brutal-shadow transition-all duration-400
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        style={{ transition: "opacity 0.35s ease, transform 0.35s ease" }}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-4 p-4">
          <span
            className="text-4xl shrink-0 animate-shield-earn inline-block"
            style={{ transformOrigin: "center" }}
          >
            🛡
          </span>
          <div className="flex-1 min-w-0">
            <div className="font-display text-lg leading-tight">Streak Shield Earned!</div>
            <div className="font-mono text-[10px] uppercase opacity-60 mt-0.5">
              {event.streakDays}-day streak · 1 missed day protected
            </div>
          </div>
          <button
            onClick={onDone}
            aria-label="Dismiss"
            className="shrink-0 opacity-40 hover:opacity-100 transition-opacity font-mono text-sm"
          >
            ✕
          </button>
        </div>
        {/* Auto-dismiss progress bar */}
        <div className="h-0.5 bg-acid/40 overflow-hidden">
          <div
            className="h-full bg-acid"
            style={{
              width: visible ? "0%" : "100%",
              transition: visible ? "width 3.5s linear" : "none",
            }}
          />
        </div>
        {/* Auto-dismiss */}
        {visible && (() => {
          setTimeout(onDone, 3500);
          return null;
        })()}
      </div>
    );
  }

  // ── All other events: full-screen overlay ─────────────────────────────────
  const isEpic = event.kind === "world-trophy" || event.kind === "ccd-master";
  const bgColor = isEpic ? "bg-ink" : "bg-bone";
  const textColor = isEpic ? "text-bone" : "text-ink";

  return (
    <div
      className={`fixed inset-0 z-[300] flex items-center justify-center p-6 ${bgColor} ${textColor}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.95)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
      }}
      onClick={onDone}
      role="dialog"
      aria-modal="true"
      aria-live="assertive"
    >
      <BigConfetti />

      <div className="relative z-10 max-w-lg w-full space-y-8">
        <EventContent event={event} />

        <button
          onClick={onDone}
          className="brutal-border bg-acid text-ink w-full py-4 font-display text-2xl brutal-press brutal-shadow"
          aria-label="Continue"
        >
          {event.kind === "ccd-master" ? "👑 CLAIM THE CROWN" :
           event.kind === "world-trophy" ? "🌟 CONTINUE →" :
           "NICE! KEEP GOING →"}
        </button>

        <div className="text-center font-mono text-[10px] uppercase opacity-40">
          Tap anywhere to continue
        </div>
      </div>
    </div>
  );
}
