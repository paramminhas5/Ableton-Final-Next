import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorldShell } from "@/components/world/WorldShell";
import { isWorldId } from "@/components/world/worldTheme";

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
  if (!isWorldId(slug)) notFound();

  // Unified Library shell. ?view=free → Free wiki, default → Flow snake.
  return <WorldShell slug={slug} view={view === "free" ? "free" : "flow"} />;
}
