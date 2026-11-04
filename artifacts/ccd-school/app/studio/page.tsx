import type { Metadata } from "next";
import { Studio } from "@/components/m1/Studio";

export const metadata: Metadata = {
  title: "studio",
  description: "Your track. Every lesson adds a layer; here you shape it, add more and export it to Ableton Live.",
};

export default function StudioPage() {
  return <Studio />;
}
