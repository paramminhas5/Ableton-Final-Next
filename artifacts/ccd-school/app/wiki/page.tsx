import type { Metadata } from "next";
import { WikiPageClient } from "@/components/WikiPageClient";

export const metadata: Metadata = {
  title: "Wiki — CCD.SCHOOL",
  description:
    "Complete reference wiki for all three worlds: Fundamentals, DJ World and Producer. Every chapter, path and mission in one place.",
  openGraph: {
    title: "Wiki | CCD.SCHOOL",
    description: "The full CCD.SCHOOL curriculum reference — 3 worlds, 16 chapters, 153 missions.",
  },
};

export default function WikiPage() {
  return <WikiPageClient />;
}
