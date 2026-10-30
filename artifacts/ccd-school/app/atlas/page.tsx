import type { Metadata } from "next";
import { AtlasPageClient } from "@/components/AtlasPageClient";
import { LESSON_LINKS } from "@/content/lessonLinks";
import { missionBySlug } from "@/content/missions";

export const metadata: Metadata = {
  title: "Every Ableton device, explained — CCD.SCHOOL",
  description: "What each of Live's own devices does, when to reach for it, and one tip. Search or filter by job.",
};

// Built on the server so the lesson catalogue does not ship to the browser with this page.
function lessonsByDevice() {
  const out: Record<string, { slug: string; title: string }[]> = {};
  for (const [slug, l] of Object.entries(LESSON_LINKS)) {
    const m = missionBySlug(slug);
    if (!m) continue;
    for (const d of l.devices ?? []) (out[d] ??= []).push({ slug, title: m.title });
  }
  return out;
}

export default function AtlasPage() {
  return <AtlasPageClient lessons={lessonsByDevice()} />;
}
