"use client";
import { useProgress, MAX_HEARTS } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import { useEffect, useState } from "react";

export function HeartsWall() {
  const { progress, heartRefillSeconds, spendGems, refillHeart } = useProgress();
  const { setLearnMode } = useLearnMode();
  const [secs, setSecs] = useState(heartRefillSeconds);

  useEffect(() => {
    setSecs(heartRefillSeconds);
  }, [heartRefillSeconds]);
  useEffect(() => {
    if (secs <= 0) return;
    const id = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [secs]);

  const hh = Math.floor(secs / 3600);
  const mm = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  const timeStr = hh > 0 ? `${hh}h ${mm}m` : `${mm}:${ss}`;

  const handleSpendGems = () => {
    if (spendGems(20)) {
      refillHeart();
    }
  };

  if (progress.hearts > 0) return null;

  return (
    <div className="brutal-border bg-ink text-bone p-6 space-y-4 my-4">
      <div className="flex gap-1 text-2xl">
        {Array.from({ length: MAX_HEARTS }).map((_, i) => (
          <span key={i} className="opacity-20">
            ♥
          </span>
        ))}
      </div>
      <div className="font-display text-4xl">OUT OF HEARTS</div>
      <div className="font-mono text-sm leading-relaxed opacity-90">
        You&apos;ve used all your hearts. Wrong answers in Flow Mode cost a heart — review your answers
        carefully before submitting.
      </div>
      {secs > 0 ? (
        <div className="brutal-border bg-bone text-ink px-4 py-3 font-mono text-xl">
          Next heart in{" "}
          <strong>
            {timeStr}
          </strong>
        </div>
      ) : (
        <div className="brutal-border bg-acid text-ink px-4 py-3 font-mono text-sm uppercase font-bold">
          ♥ Heart refilled — refresh to continue
        </div>
      )}
      {progress.gems >= 20 && (
        <button
          onClick={handleSpendGems}
          className="brutal-border bg-acid text-ink px-4 py-2 font-mono text-xs uppercase brutal-press"
        >
          💎 Spend 20 gems for a heart ({progress.gems} available)
        </button>
      )}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => setLearnMode("classic")}
          className="brutal-border bg-bone text-ink px-4 py-2 font-mono text-xs uppercase brutal-press"
        >
          Switch to Free Mode →
        </button>
      </div>
      <div className="font-mono text-[10px] opacity-70 leading-relaxed">
        Tip: Hearts refill one every 4 hours. Spend 20 💎 gems to refill immediately.
      </div>
    </div>
  );
}
