import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorldPathClient } from "@/components/WorldPathClient";
import { WorldPageClient } from "@/components/WorldPageClient";
import { WorldViewToggle } from "@/components/WorldViewToggle";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ view?: string }>;
};

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
    description: `Learn ${title} on CCD.SCHOOL — structured music education with chapters, paths and missions.`,
  };
}

export default async function WorldPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { view } = await searchParams;
  if (!WORLD_TITLES[slug]) notFound();

  // Default is Flow Mode (Duolingo path snake).
  // ?view=free switches to the accordion chapter/path browser (Free Mode).
  const showFree = view === "free";

  return (
    <>
      {/* Sticky tab bar — always visible so user can switch at any point */}
      <WorldViewToggle slug={slug} showFree={showFree} />

      {showFree
        ? <WorldPageClient slug={slug} />
        : <WorldPathClient worldSlug={slug} />
      }
    </>
  );
}
