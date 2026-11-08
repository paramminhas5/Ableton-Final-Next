import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { fileLesson, lessonToMission } from "@/content/lessons/adapt";
import { LessonPageClient } from "@/components/LessonPageClient";
import { missionBySlug, nextMission } from "@/content/missions";
import { nextAfter, worldOf } from "@/lib/worldOrder";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const f = fileLesson(slug);
  const m = missionBySlug(slug);
  const title = f?.title ?? m?.title;
  return {
    title: title ? title.toLowerCase() : "no lesson here",
    description: m?.tagline ?? "Learn music production and DJing step by step.",
  };
}

export default async function LearnSlugPage({ params }: Props) {
  const { slug } = await params;
  // An unknown lesson is a real 404, not a page that says so.
  const f = fileLesson(slug);
  const base = missionBySlug(slug);
  if (!f && !base) notFound();
  // The lesson is worked out here and handed to the page, so the browser gets this one lesson, not all of them.
  // One voice for now (process.md), with the other two ways of saying each step for "say it another way".
  const mission = f ? lessonToMission(f, { voice: "mentor", level: "standard" }) : base!;
  const alts = f ? { straight: lessonToMission(f, { voice: "straight", level: "standard" }).screens ?? [], eli5: lessonToMission(f, { voice: "eli5", level: "standard" }).screens ?? [] } : null;
  // Next follows the song: after a song lesson, the next song lesson; after a deeper lesson or a bonus round,
  // the song lesson after the one it hangs off (design/curriculum.md).
  const after = nextAfter(slug);
  const nm = (after ? missionBySlug(after) : undefined) ?? (worldOf(slug) ? undefined : nextMission(slug));
  // Fix #7: data-page="lesson" suppresses the 72px bottom-nav padding
  // (see globals.css — body:not([data-page="lesson"]) main rule)
  return (
    <div data-page="lesson" className="contents">
      <Suspense>
        <LessonPageClient slug={slug} mission={mission} alts={alts} next={nm ? { slug: nm.slug, title: nm.title } : null} />
      </Suspense>
    </div>
  );
}
