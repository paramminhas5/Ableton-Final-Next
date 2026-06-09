"use client";
/**
 * TrophyShareModal — P3 #33
 * Shown after path/chapter/world trophy completion.
 * Lets users share a branded card to Twitter/X or download as PNG.
 *
 * Usage:
 *   <TrophyShareModal
 *     trophyName="Blendmaster"
 *     trophyEmoji="🎚"
 *     trophyKind="path"
 *     worldName="DJ World"
 *     xp={progress.xp}
 *     streakDays={progress.streakDays}
 *     onClose={() => setShowShare(false)}
 *   />
 */
import { useRef, useEffect } from "react";

interface Props {
  trophyName: string;
  trophyEmoji: string;
  trophyKind: "path" | "chapter" | "world" | "master";
  worldName?: string;
  xp: number;
  streakDays: number;
  onClose: () => void;
}

function buildShareText(props: Props): string {
  const { trophyName, trophyKind, worldName, xp, streakDays } = props;
  const lines = [
    `🏆 Just earned "${trophyName}" on CCD.SCHOOL`,
    trophyKind === "world" ? `🌟 Completed ${worldName ?? "a world"}!` : "",
    trophyKind === "master" ? "👑 CCD MASTER — all three worlds complete!" : "",
    `⚡ ${xp} XP · 🔥 ${streakDays} day streak`,
    "📚 Free music production + DJ education",
    "ccd.school",
  ].filter(Boolean).join("\n");
  return lines;
}

export function TrophyShareModal({ trophyName, trophyEmoji, trophyKind, worldName, xp, streakDays, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = 1200, H = 630;
    canvas.width = W;
    canvas.height = H;

    // Background
    ctx.fillStyle = "#0B0B0B";
    ctx.fillRect(0, 0, W, H);

    // Acid border
    ctx.strokeStyle = "#C6FF00";
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, W - 40, H - 40);

    // Top label
    ctx.fillStyle = "#C6FF00";
    ctx.font = "bold 28px monospace";
    ctx.fillText("CCD.SCHOOL", 60, 80);

    // Trophy emoji + name
    ctx.font = "120px serif";
    ctx.fillText(trophyEmoji, 60, 280);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 72px sans-serif";
    ctx.fillText(trophyName, 60, 380);

    if (worldName) {
      ctx.fillStyle = "#C6FF00";
      ctx.font = "36px monospace";
      ctx.fillText(worldName.toUpperCase(), 60, 430);
    }

    // Stats
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "32px monospace";
    ctx.fillText(`⚡ ${xp} XP   🔥 ${streakDays} day streak`, 60, 520);

    // Bottom
    ctx.fillStyle = "#C6FF00";
    ctx.font = "24px monospace";
    ctx.fillText("ccd.school — Free music education", 60, 590);
  };

  useEffect(() => {
    // Draw on mount so canvas preview is ready
    setTimeout(drawCard, 50);
  }, []);

  const handleDownload = () => {
    drawCard();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `ccd-${trophyName.toLowerCase().replace(/\s+/g, "-")}.png`;
    a.click();
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(buildShareText({ trophyName, trophyEmoji, trophyKind, worldName, xp, streakDays, onClose }));
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank", "width=600,height=400");
  };

  const kindLabel = trophyKind === "path" ? "Path Trophy" : trophyKind === "chapter" ? "Chapter Trophy" : trophyKind === "world" ? "World Trophy" : "CCD Master";

  return (
    <div
      className="fixed inset-0 z-[400] bg-ink/90 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Share your trophy"
    >
      <div
        className="brutal-border bg-bone max-w-xl w-full brutal-shadow animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="brutal-border border-x-0 border-t-0 bg-acid text-ink px-5 py-4 flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase opacity-60 mb-0.5">{kindLabel}</div>
            <div className="font-display text-2xl">{trophyEmoji} {trophyName}</div>
          </div>
          <button onClick={onClose} aria-label="Close" className="brutal-border bg-ink/20 px-3 py-1 font-mono text-xs brutal-press">✕</button>
        </div>

        {/* Canvas preview */}
        <div className="p-4">
          <canvas
            ref={canvasRef}
            className="w-full brutal-border bg-ink"
            style={{ aspectRatio: "1200/630" }}
          />
        </div>

        {/* Share actions */}
        <div className="px-4 pb-5 space-y-3">
          <div className="font-mono text-[9px] uppercase opacity-50 mb-2">SHARE YOUR ACHIEVEMENT</div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleShareTwitter}
              className="brutal-border bg-ink text-bone px-4 py-2.5 font-mono text-xs uppercase brutal-press brutal-hover flex items-center gap-2"
            >
              <span>𝕏</span> Share on X / Twitter
            </button>
            <button
              onClick={handleDownload}
              className="brutal-border bg-acid text-ink px-4 py-2.5 font-mono text-xs uppercase brutal-press brutal-hover flex items-center gap-2"
            >
              ↓ Download PNG
            </button>
          </div>
          <div className="font-mono text-[9px] opacity-40">
            1200×630px · Perfect for stories and posts
          </div>
        </div>
      </div>
    </div>
  );
}
