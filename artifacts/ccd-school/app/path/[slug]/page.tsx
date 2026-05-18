import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pathBySlug } from "@/content/paths";
import { PathPageClient } from "@/components/PathPageClient";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const path = pathBySlug(slug);
  if (!path) return { title: "Path Not Found" };
  return {
    title: `${path.title} — CCD.SCHOOL`,
    description: path.tagline,
  };
}

export default async function PathPage({ params }: Props) {
  const { slug } = await params;
  const path = pathBySlug(slug);
  if (!path) notFound();
  return <PathPageClient slug={slug} />;
}
