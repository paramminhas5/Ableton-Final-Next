"use client";
/**
 * CompletionModal — DJ Pawsworth celebrates with the user.
 * CCD-style: electric-blue bg, chunk-shadow, Bowlby One,
 * DJ Cat doing celebration dance, confetti, animated XP counter.
 */
import { useEffect, useRef, useState } from "react";
import { playFanfare } from "@/lib/audio";
import Link from "next/link";
import Image from "next/image";
import { useProgress } from "@/lib/progress";
import { rankFor } from "@/lib/ranks";
import { MISSIONS } from "@/content/missions";
import type { Mission } from "@/content/types";
import { motion } from "framer-motion";

interface Props {
  mission: Mission;
  xpEarned: number;
  score: number;
  badgeName?: string;
  nextSlug?: string;
  onClose: () => void;
}

function useCountUp(target: number, active: boolean) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active || target === 0) { setVal(target); return; }
    const dur = 800;
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

function Confetti() {
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    i, x: Math.random() * 100,
    delay: Math.random() * 0.5,
    dur: 0.8 + Math.random() * 0.8,
    color: ["hsl(84 81% 56%)", "hsl(0 72% 51%)", "hsl(221 83% 53%)", "hsl(44 100% 60%)", "hsl(222 47% 4%)"][i % 5],
    size: 8 + Math.round(Math.random() * 10),
    shape: i % 3 === 0 ? "circle" : "square",
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      <style>{`@keyframes fall{0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(340px) rotate(720deg);opacity:0}}`}</style>
      {pieces.map(p => (
        <div key={p.i} style={{
          position: "absolute", left: `${p.x}%`, top: 0,
          width: p.size, height: p.size, background: p.color,
          borderRadius: p.shape === "circle" ? "50%" : "0",
          animation: `fall ${p.dur}s ${p.delay}s ease-in forwards`,
        }} />
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

  useEffect(() => {
    const t = setTimeout(() => { setVisible(true); playFanfare(); }, 30);
    return () => clearTimeout(t);
  }, []);

  const animatedXp = useCountUp(xpEarned, visible);
  const pct = Math.round(score * 100);

  const grade =
    pct === 100 ? { label: "PERFECT 🎉", color: "bg-acid text-ink",          border: "border-b-4 border-ink"  } :
    pct >= 70   ? { label: "SOLID 💪",   color: "bg-electric-blue text-bone", border: "border-b-4 border-acid" } :
    pct >= 50   ? { label: "DONE ✓",     color: "bg-sun text-ink",            border: "border-b-4 border-ink"  } :
                  { label: "RETRY ↺",    color: "bg-ink text-bone",            border: "border-b-4 border-acid" };

  const share = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    c.width = 1200; c.height = 630;
    ctx.fillStyle = "hsl(84 81% 56%)"; ctx.fillRect(0, 0, 1200, 630);
    ctx.fillStyle = "hsl(222 47% 4%)"; ctx.fillRect(40, 40, 1120, 550);
    ctx.fillStyle = "hsl(84 81% 56%)";
    ctx.font = "bold 56px sans-serif"; ctx.fillText("CCD.SCHOOL", 80, 130);
    ctx.font = "bold 72px sans-serif"; ctx.fillText(`#${mission.number} ${mission.title}`, 80, 230);
    ctx.font = "36px monospace"; ctx.fillText(`${pct}% · ${grade.label}`, 80, 300);
    ctx.fillStyle = "hsl(84 81% 56%)";
    ctx.font = "bold 120px sans-serif"; ctx.fillText(`+${xpEarned}`, 80, 460);
    ctx.fillStyle = "hsl(222 47% 4%)";
    ctx.font = "28px monospace"; ctx.fillText(`${rank.name} · 🔥${progress.streakDays}d streak`, 80, 540);
    ctx.fillStyle = "#888"; ctx.font = "20px monospace"; ctx.fillText("ccd.school", 80, 600);
    const url = c.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url; a.download = `ccd-school-${mission.slug}.png`; a.click();
    setShowShare(true);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-ink/75" onClick={onClose}>
      <canvas ref={canvasRef} className="hidden" aria-hidden />

      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 16 }}
        className="brutal-border bg-bone w-full max-w-lg chunk-shadow-lg relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {visible && <Confetti />}

        {/* Grade header */}
        <div className={`${grade.color} ${grade.border} brutal-border border-x-0 border-t-0 p-5 relative z-10`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-mono text-xs uppercase opacity-80">Mission {String(mission.number).padStart(2, "0")} complete</div>
              <div className="font-display text-5xl mt-1 leading-none">{grade.label}</div>
              <div className="font-sans text-sm mt-1">{pct}% correct</div>
            </div>
            {/* DJ Cat celebrating */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.3 }}
              className="relative w-24 h-24 shrink-0 animate-cat-celebrate"
              style={{ filter: "drop-shadow(3px 3px 0 hsl(222 47% 4%))" }}
            >
              <Image src="/cats/cat-headphones-dance.png" alt="DJ Pawsworth celebrating!" fill
                className="object-contain" sizes="96px" priority />
            </motion.div>
          </div>
        </div>

        <div className="p-5 space-y-4 relative z-10">
          {/* XP earned */}
          <div className="flex items-center gap-3">
            <div className="brutal-border bg-acid px-4 py-3 font-display text-5xl min-w-[100px] text-center chunk-shadow-sm">
              <span style={{ textShadow: "0 0 20px hsl(84 81% 56%)" }}>+{animatedXp}</span>
            </div>
            <div className="font-sans text-xs uppercase">
              <div className="text-sm font-bold">XP earned</div>
              {xpEarned === 0 && <div className="opacity-60 mt-1">Already completed — XP only awarded once</div>}
            </div>
          </div>

          {/* Badge */}
          {badgeName && (
            <div className="brutal-border bg-electric-blue text-bone p-3 flex items-center gap-3 chunk-shadow-sm">
              <span className="text-2xl">🏅</span>
              <div>
                <div className="font-mono text-xs uppercase opacity-70">Badge unlocked</div>
                <div className="font-display text-xl">{badgeName}</div>
              </div>
            </div>
          )}

          {/* Streak */}
          <div className="brutal-border bg-ink text-bone px-4 py-2 font-display text-sm flex items-center gap-2">
            🔥 {progress.streakDays}-day streak
            {progress.streakShield && <span className="ml-auto text-acid">🛡 Shield active</span>}
          </div>

          {/* DJ Pawsworth tip */}
          <div className="brutal-border bg-bone border-4 border-ink p-3 flex items-center gap-3">
            <div className="relative w-12 h-12 shrink-0 wiggle" style={{ filter: "drop-shadow(2px 2px 0 hsl(222 47% 4%))" }}>
              <Image src="/cats/cat-dj-new.png" alt="" fill className="object-contain" sizes="48px" />
            </div>
            <p className="font-sans text-xs opacity-70 leading-snug">
              {pct === 100
                ? "Flawless! DJ Pawsworth is impressed. 🎧"
                : pct >= 70
                  ? "Solid work. Keep the momentum going!"
                  : "Every lesson makes you better. Come back and crush it!"}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            {nextSlug && (
              <Link href={`/learn/${nextSlug}`} onClick={onClose}
                className="brutal-border bg-acid text-ink px-5 py-4 font-display text-xl brutal-press chunk-shadow flex-1 text-center ccd-btn-hover">
                NEXT →
              </Link>
            )}
            <button onClick={share}
              className="brutal-border bg-electric-blue text-bone px-4 py-4 font-display text-sm brutal-press chunk-shadow-sm ccd-btn-hover">
              {showShare ? "Downloaded ✓" : "📸 Share"}
            </button>
            <button onClick={onClose}
              className="brutal-border bg-bone px-4 py-4 font-display text-sm brutal-press">
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
