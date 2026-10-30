import type { Metadata } from "next";
import { BeatPageClient } from "@/components/BeatPageClient";

export const metadata: Metadata = {
  title: "First Beat — CCD.SCHOOL",
  description: "Make a drum beat in your browser, then save it as a MIDI file and drag it into Ableton Live.",
};

export default function BeatPage() {
  return <BeatPageClient />;
}
