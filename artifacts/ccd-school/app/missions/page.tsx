import type { Metadata } from "next";
import { MissionsPageClient } from "@/components/MissionsPageClient";

export const metadata: Metadata = {
  title: "Missions — CCD.SCHOOL",
  description:
    "All 153 missions across Fundamentals, DJ World and Producer. Search, filter and jump to any mission.",
  openGraph: {
    title: "Missions | CCD.SCHOOL",
    description: "153 missions. Search, filter, complete. Earn XP on every one.",
  },
};

export default function MissionsPage() {
  return <MissionsPageClient />;
}
