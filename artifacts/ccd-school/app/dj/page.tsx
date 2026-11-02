import type { Metadata } from "next";
import { DJ } from "@/components/m1/DJ";

export const metadata: Metadata = {
  title: "DJ",
  description: "Two decks, a mixer and a crossfader. Mix your own track with a house loop.",
};

export default function DJPage() {
  return <DJ />;
}
