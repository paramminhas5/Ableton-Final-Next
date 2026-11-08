"use client";
/**
 * A lesson. The server works out the lesson (app/learn/[slug]/page.tsx) and hands it here, so the browser gets
 * one lesson's content, not every lesson's. Lessons written as files play in FileLesson; the old player (with
 * the 47 sims) loads only for a review.
 */
import { Component, Suspense, type ErrorInfo, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import type { LessonScreen, Mission } from "@/content/types";
import { getMissionContext } from "@/lib/missionContext";
import { useAuth } from "@/lib/auth";
import { isLocked } from "@/lib/gating";
import { useGatingMode } from "@/components/ClientProviders";
import { FileLesson, type Alts } from "@/components/m1/FileLesson";
import { GoPill, Icon, Key, Screen } from "@/components/m1/controls";
import { Bottom, Meta } from "@/components/m1/LessonParts";
import { CAT_SRC } from "@/components/m1/shell";

const M1Lesson = dynamic(() => import("@/components/m1/Lesson").then(m => m.M1Lesson), { ssr: false, loading: () => <div className="m1-page" style={{ minHeight: "100dvh" }} /> });

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

class Boundary extends Component<{ children: ReactNode; slug: string }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("[lesson]", this.props.slug, error, info); }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="ls">
        <Screen><Meta left="something broke" /><div className="ls-title">this lesson hit a snag. it has been logged.</div><p className="ls-sub">{this.state.error.message}</p></Screen>
        <Bottom left={{ label: "lessons", icon: "back", href: "/learn" }} go={{ label: "try again", onClick: () => this.setState({ error: null }) }} />
      </div>
    );
  }
}

type Props = { slug: string; mission: Mission; alts: Alts | null; next: { slug: string; title: string } | null };

function Inner({ slug, mission, alts, next }: Props) {
  const params = useSearchParams();
  const isReview = params.get("review") === "1";
  const { plan } = useAuth();
  const gatingMode = useGatingMode();
  const ctx = getMissionContext(slug);
  if (isLocked(mission, plan, gatingMode)) {
    return (
      <div data-testid="lesson-locked">
        <Message title="a pro lesson" line={`${mission.title.toLowerCase()} is part of pro. the first three lessons of every path are always free.`} back={ctx.worldRoute || "/learn"} go={{ label: "see pro", href: "/upgrade" }} />
      </div>
    );
  }
  if (mission.fromFile && !isReview) {
    return <Boundary slug={slug}><FileLesson key={slug} mission={mission} alts={alts} nextSlug={next?.slug} nextTitle={next?.title} onComplete={() => { /* the last screen carries its own next key */ }} /></Boundary>;
  }
  const spine = ctx.path?.songSlugs ?? [];
  const missionIndex = spine.includes(slug) ? spine.indexOf(slug) + 1 : ctx.path ? ctx.path.missionSlugs.indexOf(slug) + 1 : mission.number;
  const missionTotal = spine.includes(slug) ? spine.length : ctx.path?.missionSlugs.length ?? 1;
  return (
    <M1Lesson key={slug} mission={mission} nextSlug={next?.slug} nextTitle={next?.title} isReview={isReview} missionIndex={missionIndex} missionTotal={missionTotal}
      onComplete={() => { /* the last screen carries its own next key */ }} />
  );
}

export function LessonPageClient(props: Props) {
  return (
    <Suspense fallback={<div className="m1-page" style={{ minHeight: "100dvh" }} />}>
      <Inner {...props} />
    </Suspense>
  );
}

export type { LessonScreen };
