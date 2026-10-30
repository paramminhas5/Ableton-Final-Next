import type { Metadata } from "next";
import { GymPageClient } from "@/components/GymPageClient";

export const metadata: Metadata = {
  title: "Ear Gym — CCD.SCHOOL",
  description:
    "Five-minute ear training sessions on your phone. EQ, compression, tempo and groove. Difficulty adapts to you. Three sessions a week, no daily streak.",
};

export default function GymPage() {
  return <GymPageClient />;
}
