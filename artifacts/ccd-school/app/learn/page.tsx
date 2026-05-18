import type { Metadata } from "next";
import { LearnPageClient } from "@/components/LearnPageClient";

export const metadata: Metadata = {
  title: "Paths — CCD.SCHOOL",
  description: "All learning paths — Fundamentals, DJ World and Producer. Every chapter, every path, every mission.",
};

export default function LearnPage() {
  return <LearnPageClient />;
}
