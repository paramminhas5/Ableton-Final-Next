import type { Metadata } from "next";
import { SoundAB } from "@/components/m1/SoundAB";

export const metadata: Metadata = {
  title: "hear the difference",
  description: "The same phrases through the old engine and the new one, loudness-matched, with a blind test.",
};

export default function SoundPage() {
  return <SoundAB />;
}
