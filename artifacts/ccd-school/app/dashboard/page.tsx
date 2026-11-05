import type { Metadata } from "next";
import { Today } from "@/components/m1/Today";

export const metadata: Metadata = {
  title: "today",
  description: "Your track, your next lesson and today's practice.",
};

export default function DashboardPage() {
  return <Today />;
}
