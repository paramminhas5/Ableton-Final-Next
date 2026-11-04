import type { Metadata } from "next";
import { BuildPageClient } from "@/components/BuildPageClient";

export const metadata: Metadata = {
  title: "build your first live set",
  description: "Fourteen stages from empty Set to arranged and mixed track. Upload your Set after each stage and it is checked for real.",
};

export default function BuildPage() {
  return <BuildPageClient />;
}
