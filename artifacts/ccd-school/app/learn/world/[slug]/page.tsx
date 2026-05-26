import type { Metadata } from "next";
import { WorldPathClient } from "@/components/WorldPathClient";

interface Props { params: Promise<{ slug: string }> }

const TITLES: Record<string, string> = {
  fundamentals: "Fundamentals — Music Foundations",
  dj: "DJ World",
  producer: "Producer — Ableton Live 12",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${TITLES[slug] ?? slug} | CCD.SCHOOL`,
    description: "Your Duolingo-style learning path for music production and DJing.",
  };
}

export default async function WorldPathPage({ params }: Props) {
  const { slug } = await params;
  return <WorldPathClient worldSlug={slug} />;
}
