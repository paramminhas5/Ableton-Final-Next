import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { fileLesson } from "@/content/lessons/adapt";
import { LessonPageClient } from "@/components/LessonPageClient";
import { missionBySlug } from "@/content/missions";

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
  if (!fileLesson(slug) && !missionBySlug(slug)) notFound();
  // Fix #7: data-page="lesson" suppresses the 72px bottom-nav padding
  // (see globals.css — body:not([data-page="lesson"]) main rule)
  return (
    <div data-page="lesson" className="contents">
      <Suspense>
        <LessonPageClient slug={slug} />
      </Suspense>
    </div>
  );
}
