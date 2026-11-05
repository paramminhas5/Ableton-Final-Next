import type { Metadata } from "next";
import { SoundCompare } from "@/components/m1/SoundCompare";

export const metadata: Metadata = {
  title: "sound against the open-source synths",
  description: "Blind, loudness-matched pairs: the same notes through open-source synths and through our engine.",
  robots: { index: false, follow: false },
};

export default function SoundComparePage() {
  return <SoundCompare />;
}
