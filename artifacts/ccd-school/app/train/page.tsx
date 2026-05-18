import type { Metadata } from "next";
import { TrainPageClient } from "@/components/TrainPageClient";

export const metadata: Metadata = {
  title: "Ear Training — CCD.SCHOOL",
  description: "Train your ear — intervals, chords, scales. Hear the difference before you produce it.",
};

export default function TrainPage() {
  return <TrainPageClient />;
}
