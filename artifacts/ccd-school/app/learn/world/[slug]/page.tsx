import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { World } from "@/components/m1/World";

interface Props { params: Promise<{ slug: string }> }

const TITLES: Record<string, string> = {
  fundamentals: "basics",
  dj: "dj",
  producer: "producer",
};
/** Names people (and the lesson files) use for a world, pointing at its id. */
const ALIASES: Record<string, string> = { foundations: "fundamentals", basics: "fundamentals" };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: TITLES[ALIASES[slug] ?? slug] ?? slug,
    description: "Every lesson in this world, as your song and as a list.",
  };
}

export default async function WorldPathPage({ params }: Props) {
  const { slug } = await params;
  if (ALIASES[slug]) redirect(`/learn/world/${ALIASES[slug]}`);
  if (slug === "fundamentals" || slug === "dj" || slug === "producer") return <World world={slug} />;
  notFound();
}
