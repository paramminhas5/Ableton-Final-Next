import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorldShell } from "@/components/world/WorldShell";
import { WorldPathClient } from "@/components/WorldPathClient";
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

  // Default: Flow Mode snake path. ?view=free: Free Mode accordion browser.
  const showFree = view === "free";
  
  // Wrap the appropriate component in WorldShell
  const content = showFree
    ? <WorldPageClient slug={slug} />
    : <WorldPathClient worldSlug={slug} />;

  return (
    <WorldShell worldSlug={slug as any}>
      {content}
    </WorldShell>
  );
}
