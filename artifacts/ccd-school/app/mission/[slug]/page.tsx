import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { missionBySlug } from "@/content/missions";
import { MissionPageClient } from "@/components/MissionPageClient";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const m = missionBySlug(slug);
  if (!m) return { title: "Mission Not Found" };
  return {
    title: `${m.title} — CCD.SCHOOL`,
    description: m.tagline,
    openGraph: {
      title: `${m.title} | CCD.SCHOOL`,
      description: m.tagline,
    },
  };
}

export default async function MissionPage({ params }: Props) {
  const { slug } = await params;
  const m = missionBySlug(slug);
  if (!m) notFound();
  return <MissionPageClient slug={slug} />;
}
