import type { Metadata } from "next";
import { PlacementPageClient } from "@/components/PlacementPageClient";

export const metadata: Metadata = {
  title: "Placement Test | CCD.SCHOOL",
  description: "Answer 12 quick questions and we'll skip you to the right chapter.",
};

export default function PlacementPage() {
  return <PlacementPageClient />;
}
