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
import { GoPill, Icon, Key, Screen, Silk, WORLD_LED } from "@/components/m1/controls";
import { Readout, ListRow, PageHead, RankMark, SegBar } from "@/components/m1/parts";
import { RANKS } from "@/lib/ranks";
import { type CSSProperties } from "react";

interface ProfileData {
  username: string;
  xp: number;
  streakDays: number;
  missionsCount: number;
  badges: string[];
  rank: string;
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
  ctx.fillText(data.rank, 60, 230);

  // Stats row
  const stats = [
    { label: "XP",      value: data.xp.toLocaleString() },
    { label: "Streak",  value: `${data.streakDays}d` },
    { label: "Lessons", value: String(data.missionsCount) },
    { label: "Gems",    value: String(data.gems) },
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
    ctx.fillText(`${data.badges.slice(0, 5).join("  ·  ")}${data.badges.length > 5 ? ` +${data.badges.length - 5} more` : ""}`, 60, 610);
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

  const { current: rank, idx: rankIdx } = rankFor(progress.xp);

  const profileData: ProfileData = isOwn ? {
    username: user?.name ?? username,
    xp: progress.xp,
    streakDays: progress.streakDays,
    missionsCount: Object.keys(progress.completedMissions).length,
    badges: progress.badges,
    rank: rank.name,
    gems: progress.gems,
    fundamentalsPct: worldPct("fundamentals"),
    djPct: worldPct("dj"),
    producerPct: worldPct("producer"),
  } : {
    username,
    xp: 0, streakDays: 0, missionsCount: 0, badges: [],
    rank: "Bedroom Producer", gems: 0,
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

  const showIdx = isOwn ? rankIdx : 0;
  return (
    <main className="m1-page" style={{ paddingTop: 4 }}>
      <canvas ref={canvasRef} className="hidden" aria-hidden />
      <PageHead title="profile" back="/profile" />

      <Screen>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ width: 64, height: 64, borderRadius: "50%", background: "#141416", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.08)", fontSize: 24, color: "var(--disp-ink)" }}>
            {profileData.username.slice(0, 2).toLowerCase()}
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 400, color: "var(--disp-ink)", letterSpacing: "-.02em", overflowWrap: "anywhere" }}>{profileData.username.toLowerCase()}</div>
            <div className="m1-ss" style={{ color: "var(--disp-ink)", marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}><RankMark idx={showIdx} size={26} />{profileData.rank.toLowerCase()} · rank {showIdx + 1} of {RANKS.length}</div>
          </div>
        </div>
      </Screen>

      <div className="ls-uses" style={{ ["--n" as string]: 4, marginTop: 14 } as CSSProperties}>
        <Readout value={profileData.xp} label="xp" />
        <Readout value={profileData.streakDays} label="day streak" color="var(--led-red)" />
        <Readout value={profileData.missionsCount} label="lessons" color="var(--led-mint)" />
        <Readout value={profileData.gems} label="gems" color="var(--led-lilac)" />
      </div>

      <Silk label="worlds" />
      <div className="ls-panel" style={{ flexDirection: "column", gap: 12 }}>
        {([["basics", "fundamentals", profileData.fundamentalsPct], ["dj", "dj", profileData.djPct], ["producer", "producer", profileData.producerPct]] as const).map(([label, id, pct]) => (
          <div key={id} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
            <span className="ls-led" style={{ ["--c" as string]: WORLD_LED[id] } as CSSProperties} />
            <span style={{ width: 64, color: "var(--sub)" }}>{label}</span>
            <SegBar value={pct / 100} color={WORLD_LED[id]} n={14} height={8} label={`${label} ${pct} percent`} />
            <span className="m1-t11" style={{ width: 34, textAlign: "right" }}>{pct}%</span>
          </div>
        ))}
      </div>

      {profileData.badges.length > 0 && (
        <>
          <Silk label="badges" right={`${profileData.badges.length}`} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "0 2px" }}>
            {profileData.badges.map(b => <span key={b} className="m1-tag">{b.toLowerCase()}</span>)}
          </div>
        </>
      )}

      {isOwn && (
        <>
          <Silk label="share your progress" />
          {shareUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shareUrl} alt="Your share card" style={{ width: "100%", borderRadius: 12, aspectRatio: "1200/630", objectFit: "cover", boxShadow: "var(--m1-extrude)" }} />
          )}
          <div className="m1-g" style={{ marginTop: 12 }}>
            {shareUrl ? <Key href={shareUrl} ariaLabel="Download card" label="card" style={{}}><Icon name="out" /></Key> : <Key onClick={generateCard} ariaLabel="Make the card" label="make card"><Icon name="out" /></Key>}
            <GoPill onClick={copyLink} style={{ gridColumn: "span 3" }} ariaLabel="Copy your public link">{copied ? "link copied" : "copy link"}</GoPill>
          </div>
          <p className="m1-t11" style={{ margin: "8px 4px 0" }}>ccd.school/u/{username}</p>
        </>
      )}

      {!isOwn && <ListRow href="/profile" led="var(--ledoff)" title="this profile is private or does not exist" sub="open your own profile" right={<Icon name="back" className="ls-flip" />} />}
    </main>
  );
}
