import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorldChallenge } from "@/components/m1/WorldChallenge";

type Props = { params: Promise<{ slug: string }> };
const NAMES: Record<string, string> = { fundamentals: "basics", producer: "producer", dj: "dj" };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return NAMES[slug] ? { title: `${NAMES[slug]} challenge`, description: `The end of the ${NAMES[slug]} world: match a sound and copy a part of your own song by ear, for stars.` } : { title: "no world here" };
}

export default async function WorldChallengePage({ params }: Props) {
  const { slug } = await params;
  if (!NAMES[slug]) notFound();
  return <WorldChallenge world={slug as "fundamentals" | "producer" | "dj"} />;
}
