"use client";
/** The dashboard's "you" panel: rank and xp, streak, stripes, and the trophy shelf. Opens your profile. */
import Link from "next/link";
import { useEffect, useState } from "react";
import { allWorldRanks, WORLD_NAME } from "@/lib/worldRanks";
import { readStripes, STRIPES_EVENT, trophiesFor, type Stripes } from "@/lib/rewards";
import { Icon } from "./controls";

export function YouCard({ xp, streak, done, compact }: { xp: number; streak: number; done: Record<string, unknown>; compact?: boolean }) {
  const [stripes, setStripes] = useState<Stripes>({});
  useEffect(() => {
    const r = () => setStripes(readStripes());
    r();
    window.addEventListener(STRIPES_EVENT, r);
    return () => window.removeEventListener(STRIPES_EVENT, r);
  }, []);
  // Ranks are per world; the card leads with the world you have gone furthest in.
  const ranks = allWorldRanks(done);
  const rank = ranks[0];
  const trophies = trophiesFor(stripes, done);
  const gold = Object.values(stripes).filter(s => s.gold).length;
  const seg = 20, lit = Math.round(rank.progress * seg);
  const n = Object.keys(stripes).length;
  return (
    <Link href="/profile" className="td-you" aria-label="Your profile">
      <div className="td-you-glass">
        <div className="td-you-top"><span>{WORLD_NAME[rank.world]} rank {rank.idx + 1} of {rank.total}</span><span>{xp} xp</span></div>
        <div className="td-you-rank">{rank.current.name.toLowerCase()}</div>
        <div className="td-you-leds" aria-label={`${Math.round(rank.progress * 100)}% to ${rank.next?.name ?? "the top"}`}>{Array.from({ length: seg }, (_, i) => <i key={i} className={i < lit ? "is-on" : ""} />)}</div>
        <div className="td-you-next">{rank.next ? `next: ${rank.next.name}` : "top rank"}{compact ? `${streak ? ` · ${streak} day streak` : ""}` : ` · ${ranks.slice(1).map(r => `${WORLD_NAME[r.world]}: ${r.current.name}`).join(" · ")}`}</div>
      </div>
      {compact ? null : <>
      <div className="td-you-stats">
        <span><b className="is-fire">{streak}</b>day streak</span>
        <span><b className="td-you-stripes">{Array.from({ length: Math.max(3, Math.min(6, n)) }, (_, i) => <i key={i} className={i < n ? (i < gold ? "is-gold" : "is-on") : ""} />)}</b>{n} {n === 1 ? "stripe" : "stripes"}{gold ? ` · ${gold} gold` : ""}</span>
      </div>
      <div className="td-shelf" aria-label="Trophies">
        {trophies.map((t, i) => <span key={t.id} className={t.won ? "is-won" : ""} style={{ animationDelay: `${i * 120}ms` }} title={`${t.name}: ${t.line}`}><Icon name={t.icon} small /></span>)}
      </div>
      </>}
    </Link>
  );
}
