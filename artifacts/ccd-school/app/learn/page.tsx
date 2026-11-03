import type { Metadata } from "next";
import { Worlds } from "@/components/m1/Worlds";

export const metadata: Metadata = {
  title: "Paths — CCD.SCHOOL",
  description: "All learning paths — Fundamentals, DJ World and Producer. Every chapter, every path, every mission.",
};

export default function LearnPage() {
  return <Worlds />;
}
