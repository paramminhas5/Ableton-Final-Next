import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorldPageClient } from "@/components/WorldPageClient";

type Props = { params: Promise<{ slug: string }> };

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
    description: `Explore the ${title} world on CCD.SCHOOL — structured missions, paths and chapters.`,
  };
}

export default async function WorldPage({ params }: Props) {
  const { slug } = await params;
  if (!WORLD_TITLES[slug]) notFound();
  return <WorldPageClient slug={slug} />;
}
