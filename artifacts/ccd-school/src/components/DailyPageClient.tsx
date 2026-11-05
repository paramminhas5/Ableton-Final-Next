"use client";
/**
 * Daily, Model 1: the day's goal on the glass, the one lesson to do next, what is fading.
 * Same data as before: daily xp against the goal, next lesson in the last world, weakest three lessons.
 */
import { type CSSProperties } from "react";
import { useProgress, DAILY_GOAL_XP, getLessonStrength } from "@/lib/progress";
import { FOUNDATIONS_MISSIONS } from "@/content/missions-foundations";
import { DJ_WORLD_MISSIONS } from "@/content/missions-dj";
import { MISSIONS } from "@/content/missions";
import { getMissionContext } from "@/lib/missionContext";
import { allWorldRanks } from "@/lib/worldRanks";
import { GoPill, Icon, Screen, Silk, WORLD_LED } from "@/components/m1/controls";
import { SevenSeg } from "@/components/m1/SevenSeg";
import { ListRow, PageHead, RankMark, Readout, SegBar } from "@/components/m1/parts";

const ALL_MISSIONS = [...FOUNDATIONS_MISSIONS, ...DJ_WORLD_MISSIONS, ...MISSIONS];

export function DailyPageClient() {
  const { progress, missionsNeedingReview } = useProgress();
  const completed = progress.completedMissions;
  const { current: rank, idx } = allWorldRanks(progress.completedMissions)[0];

  const allDoneSlugs = Object.keys(completed).filter(s => completed[s]);
  const lastSlug = allDoneSlugs[allDoneSlugs.length - 1];
  const lastCtx = lastSlug ? getMissionContext(lastSlug) : null;
  const nextSlug = lastCtx?.path
    ? (() => {
        const i = lastCtx.path.missionSlugs.indexOf(lastSlug);
        const ns = lastCtx.path.missionSlugs[i + 1];
        return ns && !completed[ns] ? ns : null;
      })()
    : null;
  const todaySlug = nextSlug ?? (allDoneSlugs.length === 0 ? "tempo-bpm" : null);
  const today = todaySlug ? ALL_MISSIONS.find(m => m.slug === todaySlug) : null;
  const todayWorld = (today?.world ?? "fundamentals") as "fundamentals" | "dj" | "producer";

  const pct = Math.min(1, progress.dailyXp / DAILY_GOAL_XP);
  const done = progress.dailyXp >= DAILY_GOAL_XP;
  const reviewSlugs = missionsNeedingReview.slice(0, 3);

  return (
    <main className="m1-page" style={{ paddingTop: 4 }}>
      <PageHead title="today" />

      <Screen>
        <div className="ls-meta"><span>daily goal</span><span>{done ? "done" : `${DAILY_GOAL_XP - progress.dailyXp} xp to go`}</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14 }}>
          <span className="ls-lcd" style={{ marginTop: 0 }}>
            <SevenSeg text={String(Math.min(progress.dailyXp, 999))} color={done ? "var(--led-mint)" : "var(--led-mint)"} digits={3} height={40} />
          </span>
          <span style={{ color: "var(--disp-sub)", fontSize: 14 }}>of {DAILY_GOAL_XP} xp</span>
        </div>
        <div style={{ marginTop: 16, display: "flex" }}>
          <SegBar value={pct} color={done ? "var(--led-mint)" : "var(--led-mint)"} label={`daily goal ${Math.round(pct * 100)} percent`} />
        </div>
        <div className="ls-meta" style={{ marginTop: 14, justifyContent: "flex-start", gap: 16, alignItems: "center" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Icon name="flame" small />{progress.streakDays} day streak</span>
          {progress.streakShield ? <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--led-mint)" }}><Icon name="shield" small />shield ready</span> : null}
        </div>
      </Screen>

      <Silk label="next lesson" />
      {today ? (
        <ListRow
          href={`/learn/${today.slug}`}
          led={WORLD_LED[todayWorld]}
          title={today.title}
          sub={`${lastCtx?.chapter?.title ?? "start here"} · +${today.xp} xp`}
          right={<Icon name="back" className="ls-flip" />}
        />
      ) : (
        <div className="ls-panel" style={{ flexDirection: "column", gap: 4 }}>
          <b style={{ fontSize: 16, fontWeight: 500 }}>all caught up</b>
          <span className="m1-t11">no new lessons right now. a review keeps what you know.</span>
        </div>
      )}

      {reviewSlugs.length > 0 && (
        <>
          <Silk label="fading" right={`${missionsNeedingReview.length} due`} />
          {reviewSlugs.map(slug => {
            const m = ALL_MISSIONS.find(x => x.slug === slug);
            const ls = progress.lessonStrengths[slug];
            const strength = ls ? getLessonStrength(ls) : 0;
            return (
              <ListRow key={slug} href={`/learn/${slug}?review=1`} led="var(--led-red)"
                title={m?.title ?? slug.replace(/-/g, " ")}
                sub={<span style={{ display: "flex", marginTop: 4, width: 120 }}><SegBar value={strength} color="var(--led-red)" n={8} height={6} label={`${Math.round(strength * 100)} percent strength`} /></span>}
                right={<span className="m1-tag">review</span>} />
            );
          })}
          <ListRow href="/review" title="all reviews" right={<Icon name="back" className="ls-flip" />} />
        </>
      )}

      <Silk label="your progress" />
      <div className="ls-uses" style={{ ["--n" as string]: 3 } as CSSProperties}>
        <Readout value={progress.xp} label="xp" />
        <div className="ls-use" style={{ gap: 8, padding: "12px 6px 10px" }}>
          <RankMark idx={idx} size={44} />
          <small style={{ fontSize: 11 }}>{rank.name.toLowerCase()}</small>
        </div>
        <Readout value={progress.gems} label="gems" color="var(--led-lilac)" />
      </div>

      {today && (
        <div className="m1-g" style={{ marginTop: 16 }}>
          <GoPill href={`/learn/${today.slug}`} style={{ gridColumn: "1 / -1" }}>start lesson</GoPill>
        </div>
      )}
    </main>
  );
}
