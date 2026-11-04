import type { Metadata } from "next";
import { Worlds } from "@/components/m1/Worlds";

export const metadata: Metadata = {
  title: "Worlds",
  description:
    "Three worlds: Fundamentals, DJ World and Producer. Choose your learning path.",
  openGraph: {
    title: "Worlds | CCD.SCHOOL",
    description: "Basics, producer and dj: 198 lessons in 16 paths, all building one song of your own.",
  },
};

export default function WorldsPage() {
  return (
    <Worlds />
  );
}
