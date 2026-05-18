import type { Metadata } from "next";
import { ProfilePageClient } from "@/components/ProfilePageClient";

export const metadata: Metadata = {
  title: "Profile — CCD.SCHOOL",
  description: "Your XP, trophies, rank and progress across all three worlds.",
};

export default function ProfilePage() {
  return <ProfilePageClient />;
}
