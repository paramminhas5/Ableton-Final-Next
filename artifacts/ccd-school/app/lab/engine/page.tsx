import type { Metadata } from "next";
import { EngineLab } from "@/components/lab/EngineLab";

export const metadata: Metadata = {
  title: "engine lab",
  robots: { index: false, follow: false },
};

export default function EngineLabPage() {
  return <EngineLab />;
}
