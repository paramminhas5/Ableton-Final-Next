// CompletionModal — shown when a user finishes a quiz.
// Celebrates with an animated XP counter, badge reveal, streak update,
// and a one-tap share prompt. Duolingo-style dopamine hit.
import { useEffect, useRef, useState } from "react";
import { playFanfare } from "@/lib/audio";
import { Link } from "@tanstack/react-router";
import { useProgress } from "@/lib/progress";
import { rankFor } from "@/lib/ranks";
import { MISSIONS } from "@/content/missions";
import type { Mission } from "@/content/types";

interface Props {
  mission: Mission;
  xpEarned: number; // 0 if already completed before
  score: number; // 0–1
  badgeName?: string;
  nextSlug?: string;
  onClose: () => void;
}

// Animates a number from 0 → target over ~800ms
function useCountUp(target: number, active: boolean) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active || target === 0) {
      setVal(target);
      return;
    }
    const dur = 800;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setVal(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active]);
  return val;
}

// Simple confetti burst — pure CSS, no libraries
function Confetti() {
  const pieces = Array.from({ length: 24 }, (_, i) => ({
    i,
    x: Math.random() * 100,
    delay: Math.random() * 0.4,
    dur: 0.8 + Math.random() * 0.6,
    color: ["#CDFF00", "#FF2D2D", "#7B2FFF", "#FFB800", "#111111"][i % 5],
    size: 6 + Math.round(Math.random() * 6),
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      <style>{`
        @keyframes fall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(320px) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {pieces.map((p) => (
        <div
          key={p.i}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: 0,
            width: p.size,
            height: p.size,
            background: p.color,
            animation: `fall ${p.dur}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}

export function CompletionModal({ mission, xpEarned, score, badgeName, nextSlug, onClose }: Props) {
  const { progress } = useProgress();
  const { current: rank } = rankFor(progress.xp);
  const [visible, setVisible] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shareRef = useRef<HTMLDivElement>(null);

  // Mount animation
  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(true);
      playFanfare();
    }, 30);
    return () => clearTimeout(t);
  }, []);

  const animatedXp = useCountUp(xpEarned, visible);
  const pct = Math.round(score * 100);

  const grade =
    pct === 100
      ? { label: "PERFECT", color: "bg-acid text-ink" }
      : pct >= 70
        ? { label: "SOLID", color: "bg-volt text-bone" }
        : pct >= 50
          ? { label: "DONE", color: "bg-sun text-ink" }
          : { label: "RETRY", color: "bg-ink text-bone" };

  // Generate and download share card
  const share = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const W = 1200,
      H = 630;
    c.width = W;
    c.height = H;

    ctx.fillStyle = "#E6FF55";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#0B0B0B";
    ctx.fillRect(40, 40, W - 80, H - 80);

    ctx.fillStyle = "#E6FF55";
    ctx.font = "bold 56px sans-serif";
    ctx.fillText("CCD.SCHOOL", 80, 130);

    ctx.font = "bold 80px sans-serif";
    ctx.fillText(`#${mission.number} ${mission.title}`, 80, 240);

    ctx.font = "36px monospace";
    ctx.fillText(`${pct}% · ${grade.label}`, 80, 310);

    ctx.fillStyle = "#FF3B30";
    ctx.font = "bold 120px sans-serif";
    ctx.fillText(`+${xpEarned}`, 80, 460);
    ctx.fillStyle = "#E6FF55";
    ctx.font = "36px monospace";
    ctx.fillText("XP", 80 + ctx.measureText(`+${xpEarned}`).width + 20, 460);

    ctx.font = "28px monospace";
    ctx.fillText(
      `${rank.name} · ${Object.keys(progress.completedMissions).length}/${MISSIONS.length} missions · 🔥${progress.streakDays}d`,
      80,
      540,
    );

    ctx.font = "20px monospace";
    ctx.fillStyle = "#888";
    ctx.fillText("ccd.school", 80, H - 60);

    const url = c.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `ableton-school-${mission.slug}.png`;
    a.click();
    setShowShare(true);
    // Scroll into view after a tick so the element has rendered
    setTimeout(() => shareRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-ink/70"
      onClick={onClose}
    >
      <canvas ref={canvasRef} className="hidden" aria-hidden />

      <div
        className={[
          "brutal-border bg-bone w-full max-w-lg brutal-shadow-lg relative overflow-hidden",
          "transition-all duration-300 ease-out",
          visible ? "scale-100" : "scale-95 opacity-0",
        ].join(" ")}
        onClick={(e) => e.stopPropagation()}
      >
        {visible && <Confetti />}

        {/* Grade header */}
        <div className={`${grade.color} brutal-border border-x-0 border-t-0 p-5`}>
          <div className="font-mono text-[10px] uppercase opacity-80">
            Mission {String(mission.number).padStart(2, "0")} complete
          </div>
          <div className="font-display text-5xl mt-1">{grade.label}</div>
          <div className="font-mono text-sm mt-1">{pct}% correct</div>
        </div>

        <div className="p-5 space-y-4">
          {/* XP earned */}
          <div className="flex items-center gap-3">
            <div className="brutal-border bg-acid px-4 py-3 font-display text-4xl min-w-[100px] text-center">
              +{animatedXp}
            </div>
            <div className="font-mono text-xs uppercase">
              <div className="text-sm font-bold">XP earned</div>
              {xpEarned === 0 && (
                <div className="opacity-60 mt-1">Already completed — XP only awarded once</div>
              )}
            </div>
          </div>

          {/* Badge */}
          {badgeName && (
            <div className="brutal-border bg-ink text-bone p-3 flex items-center gap-3">
              <span className="text-2xl">🏅</span>
              <div>
                <div className="font-mono text-[10px] uppercase opacity-70">Badge unlocked</div>
                <div className="font-display text-xl">{badgeName}</div>
              </div>
            </div>
          )}

          {/* Streak */}
          <div className="brutal-border bg-ink text-bone px-4 py-2 font-mono text-xs uppercase flex items-center gap-2">
            🔥 {progress.streakDays}-day streak
            {progress.streakShield && <span className="ml-auto">🛡 Streak shield active</span>}
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            {nextSlug && (
              <Link
                to="/mission/$slug"
                params={{ slug: nextSlug }}
                onClick={onClose}
                className="brutal-border bg-acid text-ink px-5 py-3 font-display text-xl brutal-press flex-1 text-center"
              >
                NEXT →
              </Link>
            )}
            <button
              onClick={share}
              className="brutal-border bg-volt text-bone px-4 py-3 font-mono text-xs uppercase brutal-press"
            >
              {showShare ? "Downloaded ✓" : "Share card"}
            </button>
            <button
              onClick={onClose}
              className="brutal-border bg-bone px-4 py-3 font-mono text-xs uppercase brutal-press"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
