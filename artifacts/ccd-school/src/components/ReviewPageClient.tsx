"use client";
/**
 * Review, Model 1. Lessons fade over time; the weakest come first.
 * Review mode calls reviewMission() instead of completeMission() when the lesson ends.
 */
import { useProgress, getLessonStrength, REVIEW_THRESHOLD } from "@/lib/progress";
import { FOUNDATIONS_MISSIONS } from "@/content/missions-foundations";
import { DJ_WORLD_MISSIONS } from "@/content/missions-dj";
import { MISSIONS } from "@/content/missions";
import { GoPill, Icon, Screen, Silk } from "@/components/m1/controls";
import { SevenSeg } from "@/components/m1/SevenSeg";
import { ListRow, PageHead, SegBar } from "@/components/m1/parts";

const ALL_MISSIONS = [...FOUNDATIONS_MISSIONS, ...DJ_WORLD_MISSIONS, ...MISSIONS];

export function ReviewPageClient() {
  const { progress, missionsNeedingReview } = useProgress();
  const strengths = progress.lessonStrengths;
  const fsrsCards = progress.fsrsCards ?? {};
  const completed = progress.completedMissions;

  const items = Object.entries(strengths)
    .map(([slug, ls]) => ({ slug, strength: getLessonStrength(ls), lastReviewed: ls.lastReviewed }))
    .filter(i => !!completed[i.slug])
    .sort((a, b) => a.strength - b.strength);
  const needs = items.filter(i => i.strength < REVIEW_THRESHOLD);
  const healthy = items.filter(i => i.strength >= REVIEW_THRESHOLD);

  const title = (slug: string) => ALL_MISSIONS.find(m => m.slug === slug)?.title ?? slug.replace(/-/g, " ");
  const since = (ts: number) => {
    const d = Math.floor((Date.now() - ts) / 86_400_000);
    return d <= 0 ? "today" : d === 1 ? "yesterday" : `${d} days ago`;
  };

  return (
    <main className="m1-page" style={{ paddingTop: 4 }}>
      <PageHead title="review" back="/gym" />
      <Screen>
        <div className="ls-meta"><span>spaced review</span><span>{missionsNeedingReview.length} due</span></div>
        <div style={{ display: "flex", gap: 22, alignItems: "flex-end", marginTop: 14 }}>
          <div>
            <span className="ls-lcd" style={{ marginTop: 0 }}><SevenSeg text={String(needs.length)} color={needs.length ? "var(--led-red)" : "var(--led-mint)"} digits={2} height={40} /></span>
            <div className="m1-ss" style={{ marginTop: 6 }}>fading</div>
          </div>
          <div>
            <span className="ls-lcd" style={{ marginTop: 0 }}><SevenSeg text={String(healthy.length)} color="var(--led-mint)" digits={2} height={40} /></span>
            <div className="m1-ss" style={{ marginTop: 6 }}>strong</div>
          </div>
        </div>
        <p className="ls-sub" style={{ marginTop: 14 }}>lessons fade as days pass. a short review brings them back and pushes the next one further out.</p>
      </Screen>

      {items.length === 0 && (
        <div className="ls-panel" style={{ flexDirection: "column", gap: 8 }}>
          <b style={{ fontSize: 16, fontWeight: 500 }}>nothing to review yet</b>
          <span className="m1-t11">finish a lesson first. it shows up here as it starts to fade.</span>
        </div>
      )}

      {needs.length > 0 && (
        <>
          <Silk label="needs review" right={`${needs.length}`} />
          {needs.map(i => {
            const f = fsrsCards[i.slug];
            return (
              <ListRow key={i.slug} href={`/learn/${i.slug}?review=1`} led="var(--led-red)"
                title={title(i.slug)}
                sub={<>
                  <span style={{ display: "flex", width: 140, marginTop: 5 }}><SegBar value={i.strength} color="var(--led-red)" n={10} height={6} label={`${Math.round(i.strength * 100)} percent strength`} /></span>
                  <span style={{ display: "block", marginTop: 4 }}>last {since(i.lastReviewed ?? 0)}{f ? ` · ${f.reps} reviews · holds ${Math.round(f.stability)} days` : ""}</span>
                </>}
                right={<Icon name="back" className="ls-flip" />} />
            );
          })}
        </>
      )}

      {healthy.length > 0 && (
        <>
          <Silk label="strong" right={`${healthy.length}`} />
          {healthy.map(i => (
            <ListRow key={i.slug} href={`/learn/${i.slug}?review=1`} led="var(--led-mint)" title={title(i.slug)}
              sub={`${Math.round(i.strength * 100)} percent`} right={<span className="m1-tag">again</span>} />
          ))}
        </>
      )}

      <Silk label="how it works" />
      <p className="m1-t11" style={{ margin: "8px 4px 0", lineHeight: 1.5 }}>
        review uses fsrs, a spaced repetition schedule like the one anki uses. after each review it works out the next gap from your score. easy lessons wait longer, hard ones come back sooner. holds N days is how long until you would likely remember it less than nine times in ten.
      </p>

      {needs.length > 0 && (
        <div className="m1-g" style={{ marginTop: 16 }}>
          <GoPill href={`/learn/${needs[0].slug}?review=1`} style={{ gridColumn: "1 / -1" }}>start review</GoPill>
        </div>
      )}
    </main>
  );
}
