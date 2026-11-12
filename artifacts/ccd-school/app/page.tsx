import type { Metadata } from "next";
import { HomeClient } from "@/components/HomeClient";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: { absolute: "ccd school, learn music production and djing" },
  description:
    "Learn to make music by making it. 199 lessons across basics, producing and djing, each one adding to a song of your own. Every fact checked against the real manuals.",
  openGraph: {
    title: "CCD.SCHOOL | learn music production and djing",
    description:
      "199 lessons that build one song of your own: basics, producing and djing.",
  },
};

export default function HomePage() {
  return <HomeClient />;
}
