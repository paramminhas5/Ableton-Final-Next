import { useRef } from "react";
import { useProgress } from "@/lib/progress";
import { rankFor } from "@/lib/ranks";
import { MISSIONS } from "@/content/missions";

export function ShareCard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { progress } = useProgress();
  const { current } = rankFor(progress.xp);
  const done = Object.keys(progress.completedMissions).length;

  const draw = () => {
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
    ctx.font = "bold 64px sans-serif";
    ctx.fillText("CCD.SCHOOL", 80, 140);
    ctx.font = "bold 96px sans-serif";
    ctx.fillText(current.name, 80, 260);
    ctx.font = "32px monospace";
    ctx.fillText(current.tagline, 80, 310);
    ctx.font = "bold 140px sans-serif";
    ctx.fillStyle = "#FF3B30";
    ctx.fillText(`${progress.xp}`, 80, 470);
    ctx.fillStyle = "#E6FF55";
    ctx.font = "32px monospace";
    ctx.fillText("XP", 80 + ctx.measureText(`${progress.xp}`).width + 20, 470);
    ctx.font = "28px monospace";
    ctx.fillText(
      `${done} / ${MISSIONS.length} missions · ${progress.streakDays} day streak`,
      80,
      530,
    );
    ctx.font = "20px monospace";
    ctx.fillText("ccd.school", 80, H - 80);
  };

  const download = () => {
    draw();
    const c = canvasRef.current;
    if (!c) return;
    const url = c.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `ableton-school-${current.slug}-${progress.xp}xp.png`;
    a.click();
  };

  return (
    <div className="brutal-border bg-card p-4 brutal-shadow-sm">
      <div className="font-mono text-xs uppercase mb-2">// SHARE CARD</div>
      <canvas ref={canvasRef} className="w-full max-w-md brutal-border bg-acid" />
      <div className="flex gap-2 mt-3">
        <button
          onClick={draw}
          className="brutal-border bg-acid px-3 py-2 font-mono text-xs uppercase brutal-press"
        >
          Preview
        </button>
        <button
          onClick={download}
          className="brutal-border bg-ink text-bone px-3 py-2 font-mono text-xs uppercase brutal-press"
        >
          Download PNG
        </button>
      </div>
    </div>
  );
}
