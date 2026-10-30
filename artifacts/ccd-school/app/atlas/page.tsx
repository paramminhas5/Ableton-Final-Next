import type { Metadata } from "next";
import { AtlasPageClient } from "@/components/AtlasPageClient";

export const metadata: Metadata = {
  title: "Every Ableton device, explained — CCD.SCHOOL",
  description: "What each of Live's own devices does, when to reach for it, and one tip. Search or filter by job.",
};

export default function AtlasPage() {
  return <AtlasPageClient />;
}
