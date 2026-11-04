"use client";
/** The dashboard's "you" panel: rank and xp, streak, stripes, and the trophy shelf. Opens your profile. */
import Link from "next/link";
import { useEffect, useState } from "react";
import { rankFor } from "@/lib/ranks";
import { readStripes, STRIPES_EVENT, trophiesFor, type Stripes } from "@/lib/rewards";
import { Icon } from "./controls";

export function YouCard({ xp, streak, done }: { xp: number; streak: number; done: Record<string, unknown> }) {
  const [stripes, setStripes] = useState<Stripes>({});
  useEffect(() => {
    const r = () => setStripes(readStripes());
    r();
    window.addEventListener(STRIPES_EVENT, r);
    return () => window.removeEventListener(STRIPES_EVENT, r);
  }, []);
  const rank = rankFor(xp);
  const trophies = trophiesFor(stripes, done);
  const gold = Object.values(stripes).filter(s => s.gold).length;
  return (
    <Link href="/profile" className="td-you" aria-label="Your profile">
      <div className="td-you-top"><b>{rank.current.name.toLowerCase()}</b><span>{xp} xp</span></div>
      <div className="fl-rank"><span>rank {rank.idx + 1}</span><div><i style={{ width: `${Math.round(rank.progress * 100)}%` }} /></div><span>{rank.next ? rank.next.name.toLowerCase() : "top"}</span></div>
      <div className="td-you-stats">
        <span><b>{streak}</b>day streak</span>
        <span><b>{Object.keys(stripes).length}</b>stripes</span>
        <span><b>{gold}</b>gold</span>
        <span><b>{trophies.filter(t => t.won).length}/{trophies.length}</b>trophies</span>
      </div>
      <div className="td-shelf" aria-label="Trophies">
        {trophies.map(t => <span key={t.id} className={t.won ? "is-won" : ""} title={`${t.name}: ${t.line}`}><Icon name={t.icon} small /></span>)}
      </div>
    </Link>
  );
}
