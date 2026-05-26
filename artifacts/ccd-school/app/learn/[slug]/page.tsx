import type { Metadata } from "next";
import { LessonPageClient } from "@/components/LessonPageClient";
import { missionBySlug } from "@/content/missions";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const m = missionBySlug(slug);
  return {
    title: m ? `${m.title} | CCD.SCHOOL` : "Lesson | CCD.SCHOOL",
    description: m?.tagline ?? "Learn music production and DJing step by step.",
  };
}

export default async function LearnSlugPage({ params }: Props) {
  const { slug } = await params;
  return <LessonPageClient slug={slug} />;
}
