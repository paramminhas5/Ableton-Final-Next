import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorldShell } from "@/components/world/WorldShell";
import { World } from "@/components/m1/World";
import { WorldPageClient } from "@/components/WorldPageClient";

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

  const isFree = view === "free";
  const activeView = isFree ? "free" : "flow";

  // Model 1: a world is a 16-step sequencer. The old browse view stays at ?view=free.
  if (!isFree) return <World world={slug as "fundamentals" | "dj" | "producer"} />;
  return (
    <WorldShell worldSlug={slug as any} view={activeView}>
      <WorldPageClient slug={slug} />
    </WorldShell>
  );
}
