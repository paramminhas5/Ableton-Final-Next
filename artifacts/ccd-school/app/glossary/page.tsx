import type { Metadata } from "next";
import { GlossaryPageClient } from "@/components/GlossaryPageClient";

export const metadata: Metadata = {
  title: "glossary",
  description: "A to Z of every Ableton Live concept, organised by category, with search.",
};

export default function GlossaryPage() {
  return <GlossaryPageClient />;
}
