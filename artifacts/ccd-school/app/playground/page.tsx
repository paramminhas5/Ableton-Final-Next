import type { Metadata } from "next";
import { PlaygroundPageClient } from "@/components/PlaygroundPageClient";

export const metadata: Metadata = {
  title: "workbench",
  description: "Free-play workbench: chain devices, experiment with audio, build your own signal flow.",
};

export default function PlaygroundPage() {
  return <PlaygroundPageClient />;
}
