"use client";
/**
 * The lesson route. Flow mode and free mode both use the Model 1 lesson player; flow
 * mode has hearts, free mode has none. The last screen has its own next key, so there
 * is no interstitial: you go on when you choose to.
 */
import { Suspense, useMemo } from "react";
import { fileLesson, lessonToMission } from "@/content/lessons/adapt";
import { usePrefs } from "@/lib/prefs";
import { useSearchParams } from "next/navigation";
import { M1Lesson } from "@/components/m1/Lesson";
import { missionBySlug, nextMission } from "@/content/missions";
import { getMissionContext } from "@/lib/missionContext";
import { useAuth } from "@/lib/auth";
import { isLocked } from "@/lib/gating";
import { useGatingMode } from "@/components/ClientProviders";
import { GoPill, Icon, Key, Screen } from "@/components/m1/controls";
import { CAT_SRC } from "@/components/m1/shell";

function Message({ title, line, back, go }: { title: string; line: string; back: string; go?: { label: string; href: string } }) {
  return (
    <div className="m1-page" style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", paddingBottom: 24 }}>
      <div style={{ height: 46 }} />
      <Screen>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CAT_SRC} alt="" style={{ position: "absolute", right: 14, top: 12, width: 64 }} />
        <span className="m1-ss">cats can dance school</span>
        <div className="m1-t36" style={{ marginTop: 10, maxWidth: 240, color: "var(--disp-ink)" }}>{title}</div>
        <p style={{ fontSize: 15, lineHeight: 1.45, marginTop: 12, color: "var(--disp-ink)", opacity: 0.9 }}>{line}</p>
      </Screen>
      <div className="m1-g" style={{ marginTop: "auto", paddingTop: 16 }}>
        <Key label="back" href={back} ariaLabel="Back"><Icon name="back" /></Key>
        {go ? <GoPill href={go.href} style={{ gridColumn: "span 3" }}>{go.label}</GoPill> : null}
      </div>
    </div>
  );
}

function Inner({ slug }: { slug: string }) {
  const params = useSearchParams();
  const isReview = params.get("review") === "1";
  const { plan } = useAuth();
  const gatingMode = useGatingMode();

  const [prefs] = usePrefs();
  const base = missionBySlug(slug);
  // A lesson from a file is resolved again whenever voice or level changes.
  const mission = useMemo(() => {
    const f = fileLesson(slug);
    return f ? lessonToMission(f, { voice: prefs.voice, level: prefs.level }) : base;
  }, [slug, prefs.voice, prefs.level, base]);
  if (!mission) return <Message title="no lesson here" line={`we couldn't find a lesson called ${slug}.`} back="/learn" go={{ label: "all lessons", href: "/learn" }} />;

  const ctx = getMissionContext(slug);
  if (isLocked(mission, plan, gatingMode)) {
    return (
      <div data-testid="lesson-locked">
        <Message title="a pro lesson" line={`${mission.title.toLowerCase()} is part of pro. the first three lessons of every path are always free.`} back={ctx.worldRoute || "/learn"} go={{ label: "see pro", href: "/upgrade" }} />
      </div>
    );
  }

  const next = nextMission(slug);
  const missionIndex = ctx.path ? ctx.path.missionSlugs.indexOf(slug) + 1 : mission.number;
  const missionTotal = ctx.path?.missionSlugs.length ?? 1;
  return (
    <M1Lesson
      key={`${slug}.${prefs.voice}.${prefs.level}`}
      mission={mission}
      nextSlug={next?.slug}
      isReview={isReview}
      missionIndex={missionIndex}
      missionTotal={missionTotal}
      onComplete={() => { /* the last screen carries its own next key */ }}
    />
  );
}

export function LessonPageClient({ slug }: { slug: string }) {
  return (
    <Suspense fallback={<div className="m1-page" style={{ minHeight: "100dvh" }} />}>
      <Inner slug={slug} />
    </Suspense>
  );
}
