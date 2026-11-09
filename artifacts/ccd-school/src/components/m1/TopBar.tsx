"use client";
/**
 * One top bar for every main screen (design pass, 9 Nov night). Same height, same keys, same order everywhere:
 * the screen's name on the left (or ccd school on home), then streak, xp, search, "?" and you on the right.
 * Every key is the same 38 px square, so nothing on the bar is bigger than it needs to be.
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { useProgress } from "@/lib/progress";
import { PALETTE_OPEN_EVENT } from "@/lib/palette";
import { Icon } from "./controls";
import { CatMark, WeekDots } from "./shell";
import { Walkthrough } from "./Walkthrough";
import "./frame.css";

export function TopBar({ title, sub, back, screen, extra }: { title?: string; sub?: string; back?: string; screen: string; extra?: ReactNode }) {
  const { progress } = useProgress();
  return (
    <header className="tb">
      <div className="tb-l">
        {back ? <Link href={back} className="tb-k" aria-label="Back"><Icon name="back" small /></Link> : null}
        {title ? (
          <h1 className="tb-title">{title}{sub ? <small>{sub}</small> : null}</h1>
        ) : (
          <Link href="/dashboard" className="tb-brand" aria-label="ccd school home"><CatMark size={28} /><span>ccd school</span></Link>
        )}
      </div>
      <div className="tb-r">
        {extra}
        <span className="tb-streak"><WeekDots days={progress.streakDays} /></span>
        <span className="tb-xp">{progress.xp}<small>xp</small></span>
        <button type="button" className="tb-k" aria-label="Search" onClick={() => window.dispatchEvent(new Event(PALETTE_OPEN_EVENT))}><Icon name="search" small /></button>
        <Walkthrough screen={screen} />
        <Link href="/profile" className="tb-k tb-you" aria-label="You"><Icon name="user" small /></Link>
      </div>
    </header>
  );
}
