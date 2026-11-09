import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { partCard } from "@/content/parts";
import { PartCardView } from "@/components/m1/PartCard";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = partCard(id);
  return p ? { title: p.name, description: p.line } : { title: "part not found" };
}

export default async function PartPage({ params }: Props) {
  const { id } = await params;
  if (!partCard(id)) notFound();
  return <PartCardView id={id} />;
}
