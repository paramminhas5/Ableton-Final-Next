import type { Metadata } from "next";
import { LeaderboardPageClient } from "@/components/LeaderboardPageClient";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Leaderboard — CCD.SCHOOL",
  description: "Top learners on CCD.SCHOOL ranked by XP.",
};

export default function LeaderboardPage() {
  return <LeaderboardPageClient />;
}
