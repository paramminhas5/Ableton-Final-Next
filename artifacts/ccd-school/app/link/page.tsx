import type { Metadata } from "next";
import { LinkPageClient } from "@/components/LinkPageClient";

export const metadata: Metadata = {
  title: "Connect Ableton Live — CCD.SCHOOL",
  description: "Upload your Live Set and get feedback on your own project, checked against real mixing habits. Your file is read in memory and never stored.",
};

export default function LinkPage() {
  return <LinkPageClient />;
}
