"use client";
/** Share a trophy: a card drawn on a canvas, in the Model 1 colours. Native share where the phone has it. */
import { useEffect, useRef, useState } from "react";
import { GoPill, Icon, Key } from "@/components/m1/controls";
import "@/components/m1/lesson.css";

interface Props {
  trophyName: string;
  /** Kept so old callers still compile. Emoji are no longer drawn. */
  trophyEmoji?: string;
  trophyKind: "path" | "chapter" | "world" | "master";
  worldName?: string;
  xp: number;
  streakDays: number;
  onClose: () => void;
}

const KIND_LABEL = { path: "path done", chapter: "chapter done", world: "world done", master: "ccd master" } as const;

function shareText({ trophyName, trophyKind, worldName, xp, streakDays }: Props): string {
  return [
    `just finished "${trophyName}" on cats can dance school`,
    trophyKind === "world" ? `${worldName ?? "a world"} is done` : "",
    trophyKind === "master" ? "all three worlds are done" : "",
    `${xp} xp, ${streakDays} day streak`,
    "make music while you learn it",
    "ccd.school",
  ].filter(Boolean).join("\n");
}

export function TrophyShareModal(props: Props) {
  const { trophyName, trophyKind, worldName, xp, streakDays, onClose } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const c = canvasRef.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const W = 1200, H = 630;
    c.width = W; c.height = H;
    ctx.fillStyle = "#0B0B0C"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#050506"; ctx.beginPath(); ctx.roundRect(40, 40, W - 80, H - 80, 28); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.08)"; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = "#9A9AA0"; ctx.font = "500 28px Outfit, sans-serif";
    ctx.fillText(KIND_LABEL[trophyKind], 90, 120);
    ctx.fillStyle = "#F3F2EF"; ctx.font = "300 84px Outfit, sans-serif";
    ctx.fillText(trophyName.toLowerCase().slice(0, 28), 90, 250);
    if (worldName) { ctx.fillStyle = "#4FE3B6"; ctx.font = "500 36px Outfit, sans-serif"; ctx.fillText(worldName.toLowerCase(), 90, 312); }
    // sixteen lit steps
    for (let i = 0; i < 16; i++) {
      ctx.fillStyle = i % 4 === 0 ? "#7D96FF" : "#4FE3B6";
      ctx.globalAlpha = i % 2 === 0 ? 1 : 0.6;
      ctx.beginPath(); ctx.roundRect(90 + i * 62, 380, 52, 34, 6); ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#F3F2EF"; ctx.font = "500 44px Outfit, sans-serif";
    ctx.fillText(`${xp.toLocaleString()} xp`, 90, 500);
    ctx.fillStyle = "#9A9AA0"; ctx.font = "500 30px Outfit, sans-serif";
    ctx.fillText(`${streakDays} day streak`, 90, 548);
    ctx.textAlign = "right"; ctx.fillText("cats can dance school", W - 90, 548);
  }, [trophyKind, trophyName, worldName, xp, streakDays]);

  const download = () => {
    const c = canvasRef.current; if (!c) return;
    const a = document.createElement("a");
    a.href = c.toDataURL("image/png");
    a.download = `ccd-${trophyName.toLowerCase().replace(/\s+/g, "-")}.png`;
    a.click();
  };
  const share = async () => {
    const text = shareText(props);
    try {
      if (navigator.share) await navigator.share({ title: trophyName, text, url: "https://ccd.school" });
      else { await navigator.clipboard.writeText(text); setCopied(true); window.setTimeout(() => setCopied(false), 1800); }
    } catch { /* cancelled */ }
  };

  return (
    <div className="ls-sheet" role="dialog" aria-modal="true" aria-label="Share your trophy" onClick={onClose}>
      <div className="ls-sheet-body" onClick={e => e.stopPropagation()}>
        <div className="ls-meta" style={{ color: "var(--sub)" }}><span>{KIND_LABEL[trophyKind]}</span><span>share</span></div>
        <canvas ref={canvasRef} style={{ width: "100%", aspectRatio: "1200/630", borderRadius: 12, marginTop: 10, boxShadow: "var(--m1-extrude)" }} aria-label="Share card preview" />
        <div className="ls-bottom"><div className="m1-g">
          <Key label="close" onClick={onClose} ariaLabel="Close"><Icon name="close" /></Key>
          <Key label="save" onClick={download} ariaLabel="Download the card"><Icon name="out" /></Key>
          <GoPill onClick={share} style={{ gridColumn: "span 2" }}>{copied ? "copied" : "share"}</GoPill>
        </div></div>
      </div>
    </div>
  );
}
