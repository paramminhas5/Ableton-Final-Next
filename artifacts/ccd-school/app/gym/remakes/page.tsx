import type { Metadata } from "next";
import { Remakes } from "@/components/m1/Remakes";

export const metadata: Metadata = { title: "remakes", description: "Famous kinds of sound, rebuilt on your own instruments: match one by ear, then keep it in your song." };

export default function RemakesPage() {
  return <Remakes />;
}
