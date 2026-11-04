import type { Metadata } from "next";
import { MissionsPageClient } from "@/components/MissionsPageClient";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Missions",
  description:
    "All 198 lessons across basics, producer and dj. Search, filter and jump to any lesson.",
  openGraph: {
    title: "Missions | CCD.SCHOOL",
    description: "198 lessons. Search, filter and jump to any one.",
  },
};

export default function MissionsPage() {
  return <MissionsPageClient />;
}
