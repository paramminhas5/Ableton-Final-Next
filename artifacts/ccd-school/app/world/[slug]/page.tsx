import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { World } from "@/components/m1/World";

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
    title: title,
    description: `Learn ${title} on CCD.SCHOOL: lessons that build one song of your own.`,
  };
}

export default async function WorldPage({ params }: Props) {
  const { slug } = await params;
  if (!WORLD_TITLES[slug]) notFound();
  // Model 1: a world is a 16-step sequencer. Flow and free are a switch on that screen.
  return <World world={slug as "fundamentals" | "dj" | "producer"} />;
}
