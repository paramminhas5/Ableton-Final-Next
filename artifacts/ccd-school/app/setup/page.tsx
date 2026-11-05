import type { Metadata } from "next";
import { SetupPageClient } from "@/components/SetupPageClient";

export const metadata: Metadata = {
  title: "get live ready",
  description: "Install, authorise, set up audio and MIDI, scan plug-ins, and save a Set that opens anywhere.",
};

export default function SetupPage() {
  return <SetupPageClient />;
}
