import { useProgress, MAX_HEARTS, HEART_REFILL_SECS } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import { useEffect, useState } from "react";

export function HeartsWall() {
  const { progress, heartRefillSeconds } = useProgress();
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

  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");

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
        You've used all your hearts. Wrong answers in CCD mode cost a heart — review your answers
        carefully before submitting.
      </div>
      {secs > 0 ? (
        <div className="brutal-border bg-bone text-ink px-4 py-3 font-mono text-xl">
          Next heart in{" "}
          <strong>
            {mm}:{ss}
          </strong>
        </div>
      ) : (
        <div className="brutal-border bg-acid text-ink px-4 py-3 font-mono text-sm uppercase font-bold">
          ♥ Heart refilled — refresh to continue
        </div>
      )}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => setLearnMode("classic")}
          className="brutal-border bg-bone text-ink px-4 py-2 font-mono text-xs uppercase brutal-press"
        >
          Switch to Classic mode →
        </button>
      </div>
      <div className="font-mono text-[10px] opacity-70 leading-relaxed">
        Tip: Hearts refill every {HEART_REFILL_SECS}s. You can also earn hearts back by completing
        missions in Classic mode.
      </div>
    </div>
  );
}
