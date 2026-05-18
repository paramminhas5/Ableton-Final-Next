import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { deviceBySlug } from "@/content/devices";
import { DevicePageClient } from "@/components/DevicePageClient";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const d = deviceBySlug(slug);
  if (!d) return { title: "Device Not Found" };
  return {
    title: `${d.name} — Device Lab | CCD.SCHOOL`,
    description: d.tagline,
  };
}

export default async function DevicePage({ params }: Props) {
  const { slug } = await params;
  const d = deviceBySlug(slug);
  if (!d) notFound();
  return <DevicePageClient slug={slug} />;
}
