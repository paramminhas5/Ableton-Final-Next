import type { Metadata } from "next";
import { ShortcutsPageClient } from "@/components/ShortcutsPageClient";

export const metadata: Metadata = {
  title: "Shortcuts — CCD.SCHOOL",
  description: "Every Ableton Live keyboard shortcut, searchable and categorised.",
};

export default function ShortcutsPage() {
  return <ShortcutsPageClient />;
}
