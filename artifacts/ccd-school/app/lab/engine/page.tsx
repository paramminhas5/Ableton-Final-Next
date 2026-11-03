import type { Metadata } from "next";
import { EngineLab } from "@/components/lab/EngineLab";

export const metadata: Metadata = {
  title: "Engine lab",
  robots: { index: false, follow: false },
};

export default function EngineLabPage() {
  return <EngineLab />;
}
