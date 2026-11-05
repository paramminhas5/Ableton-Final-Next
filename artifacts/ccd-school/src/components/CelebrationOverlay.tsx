"use client";
/**
 * Moments, Model 1: rank up, streak (board ZStreak), shield, and the trophies.
 * A full screen on the glass with one pink key. The shield is a small toast.
 */
import { useEffect, useState } from "react";
import { playFanfare } from "@/lib/audio";
import { useProgress } from "@/lib/progress";
import { RANKS } from "@/lib/ranks";
import { WORLD_NAME, WORLD_RANKS } from "@/lib/worldRanks";
import type { CurWorld } from "@/content/curriculum";
import { TrophyShareModal } from "@/components/TrophyShareModal";
import { GoPill, Icon, Key } from "@/components/m1/controls";
import { SevenSeg } from "@/components/m1/SevenSeg";
import { RankMark, SegBar } from "@/components/m1/parts";
import "@/components/m1/lesson.css";

export type CelebrationEvent =
  | { kind: "rank-up"; rankName: string; rankEmoji?: string; world?: CurWorld }
  | { kind: "streak"; days: number }
  | { kind: "shield-earned"; streakDays: number }
  | { kind: "path-trophy"; trophyName: string; pathTitle: string }
  | { kind: "chapter-trophy"; trophyName: string; chapterTitle: string }
  | { kind: "world-trophy"; worldName: string }
  | { kind: "ccd-master" };

interface Props { event: CelebrationEvent | null; onDone: () => void }

const MILESTONES = [7, 14, 21, 30, 60, 100, 365];
const DAYS = ["m", "t", "w", "t", "f", "s", "s"];

function useCountUp(target: number) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { setVal(target); return; }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 900);
      setVal(Math.round((1 - Math.pow(1 - t, 3)) * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return val;
}

function Lcd({ n, color, digits, height = 64 }: { n: number; color: string; digits: number; height?: number }) {
  return <span className="ls-lcd" style={{ marginTop: 0, padding: "14px 18px" }}><SevenSeg text={String(n)} color={color} digits={digits} height={height} /></span>;
}

function StreakBody({ days, shield }: { days: number; shield: boolean }) {
  const n = useCountUp(days);
  const today = (new Date().getDay() + 6) % 7; // monday is 0
  const next = MILESTONES.find(m => m > days);
  return (
    <>
      <div className="m1-scr"><div className="m1-glass" style={{ padding: 16, minHeight: 300, display: "flex", flexDirection: "column" }}>
        <div className="ls-meta"><span>streak</span><span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: shield ? "var(--led-mint)" : undefined }}>{shield ? <><Icon name="shield" small />shield ready</> : null}</span></div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, padding: "10px 0" }}>
          <Lcd n={n} color="var(--led-mint)" digits={Math.max(2, String(days).length)} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 300, color: "var(--disp-ink)", letterSpacing: "-.02em" }}>days in a row</div>
            <div style={{ fontSize: 14, color: "var(--disp-sub)", marginTop: 6, maxWidth: 260 }}>{shield ? "miss a day and the shield keeps it going." : "a lesson a day keeps it lit."}</div>
          </div>
        </div>
      </div></div>
      <div className="m1-silk" style={{ marginTop: 14 }}><i className="l" /><span>this week</span><i className="r" /></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: 6, marginTop: 8 }} role="img" aria-label={`${Math.min(days, today + 1)} of this week's days done`}>
        {DAYS.map((d, i) => {
          const lit = i <= today && today - i < days;
          const now = i === today;
          return (
            <span key={i} className="m1-m" style={{ height: 56, pointerEvents: "none" }}>
              <span className="m1-dot is-on" style={{ ["--c" as string]: lit ? "var(--led-mint)" : "var(--ledoff)", opacity: lit ? 1 : 0.5 } as React.CSSProperties} />
              <span className={`m1-cap ${now ? "is-blk" : ""}`} style={{ width: "62%", marginTop: -6, fontSize: 13 }}>{d}</span>
            </span>
          );
        })}
      </div>
      {next && (
        <div className="ls-panel" style={{ alignItems: "center", marginTop: 12 }}>
          <span style={{ flex: 1 }}>
            <span className="m1-t11" style={{ display: "block" }}>next milestone</span>
            <b style={{ fontSize: 16, fontWeight: 500 }}>{next} days{next % 7 === 0 ? ", a shield" : ""}</b>
          </span>
          <span className="ls-lcd" style={{ marginTop: 0, padding: "6px 10px" }}><SevenSeg text={String(next - days)} color="#F3F2EF" digits={2} height={26} /></span>
        </div>
      )}
    </>
  );
}

function RankBody({ name, world }: { name: string; world?: CurWorld }) {
  // World ranks (src/lib/worldRanks.ts); the old xp ladder only for events from before them.
  const ladder = world ? WORLD_RANKS[world] : RANKS.map(r => ({ slug: r.slug, name: r.name, line: r.tagline }));
  const idx = Math.max(0, ladder.findIndex(r => r.name.toLowerCase() === name.toLowerCase()));
  const r = ladder[idx];
  return (
    <div className="m1-scr"><div className="m1-glass" style={{ padding: 16, minHeight: 360, display: "flex", flexDirection: "column" }}>
      <div className="ls-meta"><span>{world ? `${WORLD_NAME[world]} rank up` : "rank up"}</span><span>{idx + 1} of {ladder.length}</span></div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, color: "var(--disp-ink)" }}>
        <RankMark idx={Math.min(idx, RANKS.length - 1)} size={120} />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 30, fontWeight: 300, letterSpacing: "-.02em" }}>{name.toLowerCase()}</div>
          <div style={{ fontSize: 14, color: "var(--disp-sub)", marginTop: 6 }}>{r?.line.toLowerCase()}</div>
        </div>
        <div style={{ width: "100%", display: "flex" }}><SegBar value={(idx + 1) / ladder.length} color="var(--led-mint)" n={ladder.length} height={6} label={`rank ${idx + 1} of ${ladder.length}`} /></div>
      </div>
    </div></div>
  );
}

function TrophyBody({ label, title, sub }: { label: string; title: string; sub?: string }) {
  return (
    <div className="m1-scr"><div className="m1-glass" style={{ padding: 16, minHeight: 360, display: "flex", flexDirection: "column" }}>
      <div className="ls-meta"><span>{label}</span><span /></div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 18 }}>
        <div style={{ display: "flex", gap: 4 }} aria-hidden>
          {Array.from({ length: 16 }, (_, i) => <i key={i} style={{ flex: 1, height: 14, borderRadius: 3, background: i % 4 === 0 ? "var(--led-mint)" : "var(--led-mint)", opacity: i % 2 ? 0.6 : 1, boxShadow: "0 0 6px currentColor" }} />)}
        </div>
        <div style={{ fontSize: 34, fontWeight: 300, letterSpacing: "-.03em", lineHeight: 1.05, color: "var(--disp-ink)", textWrap: "balance" as never }}>{title.toLowerCase()}</div>
        {sub && <div style={{ fontSize: 14, color: "var(--disp-sub)" }}>{sub}</div>}
      </div>
    </div></div>
  );
}

export function CelebrationOverlay({ event, onDone }: Props) {
  const [visible, setVisible] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const { progress } = useProgress();

  useEffect(() => {
    if (!event) return;
    setShowShare(false);
    const t = window.setTimeout(() => { setVisible(true); playFanfare(); }, 50);
    return () => { window.clearTimeout(t); setVisible(false); };
  }, [event]);

  // The shield toast closes on its own.
  useEffect(() => {
    if (event?.kind !== "shield-earned") return;
    const t = window.setTimeout(onDone, 3600);
    return () => window.clearTimeout(t);
  }, [event, onDone]);

  if (!event) return null;

  if (event.kind === "shield-earned") {
    return (
      <div role="status" aria-live="polite" onClick={onDone} className="m1-scr"
        style={{ position: "fixed", left: "max(16px, calc(50% - 204px))", right: "max(16px, calc(50% - 204px))", bottom: "calc(110px + env(safe-area-inset-bottom, 0px))", zIndex: 300, maxWidth: 408, margin: "0 auto", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(10px)", transition: "opacity .3s, transform .3s" }}>
        <div className="m1-glass" style={{ padding: 14, display: "flex", alignItems: "center", gap: 12, color: "var(--disp-ink)" }}>
          <span style={{ color: "var(--led-mint)" }}><Icon name="shield" /></span>
          <span style={{ flex: 1 }}>
            <b style={{ display: "block", fontSize: 16, fontWeight: 500 }}>shield earned</b>
            <span className="m1-ss">{event.streakDays} day streak · covers one missed day</span>
          </span>
        </div>
      </div>
    );
  }

  const trophy = event.kind === "path-trophy" || event.kind === "chapter-trophy" || event.kind === "world-trophy" || event.kind === "ccd-master";
  const shareable = event.kind === "path-trophy" ? { name: event.trophyName, kind: "path" as const }
    : event.kind === "chapter-trophy" ? { name: event.trophyName, kind: "chapter" as const }
    : event.kind === "world-trophy" ? { name: `${event.worldName} complete`, kind: "world" as const }
    : event.kind === "ccd-master" ? { name: "ccd master", kind: "master" as const } : null;

  return (
    <div role="dialog" aria-modal="true" aria-label="Moment"
      style={{ position: "fixed", inset: 0, zIndex: 300, overflowY: "auto", background: "linear-gradient(180deg,var(--deck),var(--deck2))", opacity: visible ? 1 : 0, transition: "opacity .3s" }}>
      {/* The backdrop covers the whole screen, so the page behind (and its go key) never shows beside the sheet. */}
      <div className="ls">
      <div className="ls-top"><button type="button" className="ls-x" aria-label="Close" onClick={onDone}><Icon name="close" /></button><span style={{ flex: 1 }} /></div>
      <div className="ls-col">
        {event.kind === "streak" && <StreakBody days={event.days} shield={progress.streakShield} />}
        {event.kind === "rank-up" && <RankBody name={event.rankName} world={event.world} />}
        {event.kind === "path-trophy" && <TrophyBody label="path done" title={event.pathTitle} sub="every lesson on this path is done" />}
        {event.kind === "chapter-trophy" && <TrophyBody label="chapter done" title={event.chapterTitle} sub="on to the next chapter" />}
        {event.kind === "world-trophy" && <TrophyBody label="world done" title={event.worldName} sub="your track from this world is ready to send to live" />}
        {event.kind === "ccd-master" && <TrophyBody label="all three worlds" title="ccd master" sub="basics, dj and producer are done" />}
      </div>
      <div className="ls-bottom"><div className="m1-g">
        {trophy && shareable
          ? <Key label="share" onClick={() => setShowShare(true)} ariaLabel="Share this achievement"><Icon name="out" /></Key>
          : <Key label="close" onClick={onDone} ariaLabel="Close"><Icon name="close" /></Key>}
        <GoPill onClick={onDone} style={{ gridColumn: "span 3" }}>{event.kind === "streak" ? "continue" : "keep going"}</GoPill>
      </div></div>
      {showShare && shareable && (
        <TrophyShareModal trophyName={shareable.name} trophyKind={shareable.kind}
          worldName={event.kind === "world-trophy" ? event.worldName : undefined}
          xp={progress.xp} streakDays={progress.streakDays} onClose={() => setShowShare(false)} />
      )}
      </div>
    </div>
  );
}
