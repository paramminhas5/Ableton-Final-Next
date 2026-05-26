import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorldPageClient } from "@/components/WorldPageClient";
import { WorldPathClient } from "@/components/WorldPathClient";
import { WorldViewToggle } from "@/components/WorldViewToggle";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ view?: string }> };

const WORLD_TITLES: Record<string, string> = {
  fundamentals: "Fundamentals",
  dj: "DJ World",
  producer: "Producer",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const title = WORLD_TITLES[slug];
  if (!title) return { title: "World Not Found" };
  return {
    title: `${title} — CCD.SCHOOL`,
    description: `Learn ${title} on CCD.SCHOOL — Duolingo-style lessons for music production and DJing.`,
  };
}

export default async function WorldPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { view } = await searchParams;
  if (!WORLD_TITLES[slug]) notFound();
  // Default to path view; ?view=classic shows the old layout
  const showClassic = view === "classic";
  return (
    <>
      <WorldViewToggle slug={slug} showClassic={showClassic} />
      {showClassic ? <WorldPageClient slug={slug} /> : <WorldPathClient worldSlug={slug} />}
    </>
  );
}
