import { redirect } from "next/navigation";
import { fileLesson } from "@/content/lessons/adapt";
import { missionBySlug } from "@/content/missions";

// Redirect /mission/[slug] → /learn/[slug]
// This unifies all lesson URLs to /learn/[slug]
export default function MissionSlugPage({ params }: { params: { slug: string } }) {
  // Old links to lessons that no longer exist go to the worlds, not a dead end.
  redirect(fileLesson(params.slug) || missionBySlug(params.slug) ? `/learn/${params.slug}` : "/worlds");
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  return {
    title: "redirecting",
    robots: { index: false },
  };
}
