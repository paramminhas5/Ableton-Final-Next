import type { Metadata } from "next";
import { HomeClient } from "@/components/HomeClient";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "CCD.SCHOOL — Learn Music Production & DJing",
  description:
    "The most structured music education on the internet. 153 missions across 3 worlds — Fundamentals, DJ and Producer. Every concept sourced from real manuals.",
  openGraph: {
    title: "CCD.SCHOOL — Learn Music Production & DJing",
    description:
      "153 missions. Fundamentals, DJ World, Producer. Gamified, source-verified. No fluff.",
  },
};

export default function HomePage() {
  return <HomeClient />;
}
