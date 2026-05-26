import type { Metadata } from "next";
import { DailyPageClient } from "@/components/DailyPageClient";

export const metadata: Metadata = {
  title: "Today's Lesson | CCD.SCHOOL",
  description: "Your curated daily lesson — complete it to keep your streak alive.",
};

export default function DailyPage() {
  return <DailyPageClient />;
}
