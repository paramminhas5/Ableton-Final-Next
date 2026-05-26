import type { Metadata } from "next";
import { ChallengePageClient } from "@/components/ChallengePageClient";

export const metadata: Metadata = {
  title: "Daily Challenge | CCD.SCHOOL",
  description: "5 questions, 30 seconds each. No wrong answers allowed. Compete globally.",
};

export default function ChallengePage() {
  return <ChallengePageClient />;
}
