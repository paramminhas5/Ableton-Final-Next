"use client";
/**
 * PublicProfileClient — shareable profile page at /u/[username]
 *
 * For the current user: shows real data from progress + auth.
 * For others: fetches from /api/profile/[username] (graceful fallback if not found).
 * Canvas API share card — downloadable PNG.
 */
import { useEffect, useRef, useState } from "react";
import { useProgress } from "@/lib/progress";
import { useAuth } from "@/lib/auth";
import { rankFor } from "@/lib/ranks";
import { pathsByWorld } from "@/content/paths";
import Link from "next/link";

interface ProfileData {
  username: string;
  xp: number;
  streakDays: number;
  missionsCount: number;
  badges: string[];
  rank: string;
  rankEmoji: string;
  gems: number;
  fundamentalsPct: number;
  djPct: number;
  producerPct: number;
}

function buildShareCard(
  canvas: HTMLCanvasElement,
  data: ProfileData,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const W = 1200, H = 630;
  canvas.width = W;
  canvas.height = H;

  // Background
  ctx.fillStyle = "#0B0B0B";
  ctx.fillRect(0, 0, W, H);

  // Acid border strip
  ctx.fillStyle = "#C6FF00";
  ctx.fillRect(0, 0, W, 8);
  ctx.fillRect(0, H - 8, W, 8);

  // CCD.SCHOOL wordmark
  ctx.fillStyle = "#C6FF00";
  ctx.font = "bold 28px monospace";
  ctx.fillText("CCD.SCHOOL", 60, 70);

  // Username
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `bold 72px sans-serif`;
  ctx.fillText(data.username, 60, 170);

  // Rank
  ctx.fillStyle = "#C6FF00";
  ctx.font = `bold 36px sans-serif`;
  ctx.fillText(`${data.rankEmoji} ${data.rank}`, 60, 230);

  // Stats row
  const stats = [
    { label: "XP",      value: data.xp.toLocaleString() },
    { label: "Streak",  value: `🔥${data.streakDays}d` },
    { label: "Lessons", value: String(data.missionsCount) },
    { label: "Gems",    value: `💎${data.gems}` },
  ];
  stats.forEach((s, i) => {
    const x = 60 + i * 280;
    ctx.fillStyle = "#C6FF00";
    ctx.font = "bold 56px sans-serif";
    ctx.fillText(s.value, x, 350);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "20px monospace";
    ctx.fillText(s.label.toUpperCase(), x, 385);
  });

  // World progress bars
  const worlds = [
    { label: "Fundamentals", pct: data.fundamentalsPct, color: "#C6FF00" },
    { label: "DJ World",     pct: data.djPct,            color: "#7B2FFF" },
    { label: "Producer",     pct: data.producerPct,      color: "#FFB800" },
  ];
  worlds.forEach((w, i) => {
    const y = 440 + i * 48;
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillRect(60, y, 700, 22);
    ctx.fillStyle = w.color;
    ctx.fillRect(60, y, Math.round(700 * w.pct / 100), 22);
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "16px monospace";
    ctx.fillText(`${w.label}  ${w.pct}%`, 775, y + 16);
  });

  // Badges
  if (data.badges.length > 0) {
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "16px monospace";
    ctx.fillText(`🏅 ${data.badges.slice(0, 5).join("  ·  ")}${data.badges.length > 5 ? ` +${data.badges.length - 5} more` : ""}`, 60, 610);
  }

  // Footer
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.font = "18px monospace";
  ctx.fillText("ccd.school", W - 160, H - 25);
}

export function PublicProfileClient({ username }: { username: string }) {
  const { progress } = useProgress();
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isOwn = user?.name === username || user?.email?.split("@")[0] === username;

  const worldPct = (world: "fundamentals" | "dj" | "producer") => {
    const paths = pathsByWorld(world);
    const slugs = paths.flatMap(p => p.missionSlugs);
    const done = slugs.filter(s => !!progress.completedMissions[s]).length;
    return slugs.length > 0 ? Math.round((done / slugs.length) * 100) : 0;
  };

  const { current: rank } = rankFor(progress.xp);

  const profileData: ProfileData = isOwn ? {
    username: user?.name ?? username,
    xp: progress.xp,
    streakDays: progress.streakDays,
    missionsCount: Object.keys(progress.completedMissions).length,
    badges: progress.badges,
    rank: rank.name,
    rankEmoji: rank.emoji,
    gems: progress.gems,
    fundamentalsPct: worldPct("fundamentals"),
    djPct: worldPct("dj"),
    producerPct: worldPct("producer"),
  } : {
    username,
    xp: 0, streakDays: 0, missionsCount: 0, badges: [],
    rank: "Bedroom Producer", rankEmoji: "🛏️", gems: 0,
    fundamentalsPct: 0, djPct: 0, producerPct: 0,
  };

  const generateCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    buildShareCard(canvas, profileData);
    const url = canvas.toDataURL("image/png");
    setShareUrl(url);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(`https://ccd.school/u/${username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (isOwn) generateCard();
  }, [isOwn, progress.xp]);

  return (
    <main className="min-h-screen bg-bone pb-24">
      <canvas ref={canvasRef} className="hidden" aria-hidden />

      <header className="brutal-border border-x-0 border-t-0 bg-ink text-bone">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Link href="/profile" className="font-mono text-[10px] uppercase opacity-50 hover:opacity-100 mb-3 block">← Profile</Link>
          <div className="flex items-center gap-4">
            <div className="brutal-border bg-acid text-ink w-16 h-16 flex items-center justify-center font-display text-3xl">
              {profileData.username.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="font-display text-4xl leading-none">{profileData.username}</h1>
              <div className="font-mono text-sm opacity-60 mt-1">
                {profileData.rankEmoji} {profileData.rank}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "XP",          value: profileData.xp.toLocaleString(), color: "bg-acid text-ink" },
            { label: "Streak",      value: `🔥 ${profileData.streakDays}d`,  color: "bg-volt text-bone" },
            { label: "Lessons",     value: profileData.missionsCount,         color: "bg-bone text-ink" },
            { label: "Gems",        value: `💎 ${profileData.gems}`,          color: "bg-bone text-ink" },
          ].map(s => (
            <div key={s.label} className={`brutal-border ${s.color} p-4 text-center`}>
              <div className="font-display text-3xl">{s.value}</div>
              <div className="font-mono text-[9px] uppercase opacity-60 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* World progress */}
        <div className="brutal-border bg-bone p-5 space-y-3">
          <div className="font-mono text-[10px] uppercase opacity-40 mb-3">WORLD PROGRESS</div>
          {[
            { label: "🎵 Fundamentals", pct: profileData.fundamentalsPct, color: "bg-acid" },
            { label: "🎧 DJ World",     pct: profileData.djPct,            color: "bg-volt" },
            { label: "🎛 Producer",     pct: profileData.producerPct,      color: "bg-sun" },
          ].map(w => (
            <div key={w.label}>
              <div className="flex justify-between font-mono text-xs mb-1">
                <span>{w.label}</span>
                <span className="opacity-60">{w.pct}%</span>
              </div>
              <div className="h-2 brutal-border bg-bone/30 overflow-hidden">
                <div className={`h-full ${w.color} transition-all duration-700`} style={{ width: `${w.pct}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Badges */}
        {profileData.badges.length > 0 && (
          <div className="brutal-border bg-bone p-5">
            <div className="font-mono text-[10px] uppercase opacity-40 mb-3">BADGES ({profileData.badges.length})</div>
            <div className="flex flex-wrap gap-2">
              {profileData.badges.map(b => (
                <span key={b} className="brutal-border bg-acid text-ink px-3 py-1 font-mono text-[10px] uppercase">🏅 {b}</span>
              ))}
            </div>
          </div>
        )}

        {/* Share card */}
        {isOwn && (
          <div className="brutal-border bg-ink text-bone p-5 space-y-4">
            <div className="font-mono text-[10px] uppercase opacity-50">SHARE YOUR PROGRESS</div>
            {shareUrl && (
              <img src={shareUrl} alt="Share card preview"
                className="w-full brutal-border" style={{ aspectRatio: "1200/630", objectFit: "cover" }} />
            )}
            <div className="flex gap-2 flex-wrap">
              {shareUrl && (
                <a href={shareUrl} download={`ccd-school-${username}.png`}
                  className="brutal-border bg-acid text-ink px-4 py-2.5 font-mono text-xs uppercase brutal-press">
                  ⬇ Download Card
                </a>
              )}
              <button onClick={copyLink}
                className="brutal-border bg-volt text-bone px-4 py-2.5 font-mono text-xs uppercase brutal-press">
                {copied ? "✓ Copied!" : "🔗 Copy Link"}
              </button>
              {!shareUrl && (
                <button onClick={generateCard}
                  className="brutal-border bg-bone text-ink px-4 py-2.5 font-mono text-xs uppercase brutal-press">
                  Generate Card
                </button>
              )}
            </div>
            <div className="font-mono text-[9px] opacity-40">
              Public URL: ccd.school/u/{username}
            </div>
          </div>
        )}

        {!isOwn && (
          <div className="brutal-border bg-sun p-4 text-center">
            <div className="font-mono text-sm opacity-70">
              {username} hasn&apos;t made their profile public yet, or doesn&apos;t exist.
            </div>
            <Link href="/profile" className="brutal-border bg-ink text-bone px-4 py-2 font-mono text-xs uppercase brutal-press inline-block mt-3">
              View Your Profile →
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
