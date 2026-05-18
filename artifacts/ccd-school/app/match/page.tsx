import type { Metadata } from "next";
import { MatchPageClient } from "@/components/MatchPageClient";

export const metadata: Metadata = {
  title: "Mix Match — CCD.SCHOOL",
  description: "Match the mix. Listen and identify the processing chain.",
};

export default function MatchPage() {
  return <MatchPageClient />;
}
