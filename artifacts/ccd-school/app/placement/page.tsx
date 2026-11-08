import type { Metadata } from "next";
import { Suspense } from "react";
import { PlacementPageClient } from "@/components/PlacementPageClient";

export const metadata: Metadata = {
  title: "find your level",
  description: "Already make music? About three minutes by ear and by hand, and we start you where the lessons get new for you.",
};

export default function PlacementPage() {
  return <Suspense fallback={null}><PlacementPageClient /></Suspense>;
}
