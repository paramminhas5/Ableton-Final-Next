import type { Metadata } from "next";
import { WorldsPageClient } from "@/components/WorldsPageClient";

export const metadata: Metadata = {
  title: "Worlds — CCD.SCHOOL",
  description:
    "Three worlds: Fundamentals, DJ World and Producer. Choose your learning path.",
  openGraph: {
    title: "Worlds | CCD.SCHOOL",
    description: "Fundamentals → DJ World → Producer. 153 missions. 15 chapters. 32 paths.",
  },
};

export default function WorldsPage() {
  return <WorldsPageClient />;
}
