import { redirect } from "next/navigation";

// Redirect /mission/[slug] → /learn/[slug]
// This unifies all lesson URLs to /learn/[slug]
export default function MissionSlugPage({ params }: { params: { slug: string } }) {
  redirect(`/learn/${params.slug}`);
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  return {
    title: `Redirecting… | CCD.SCHOOL`,
    robots: { index: false },
  };
}
