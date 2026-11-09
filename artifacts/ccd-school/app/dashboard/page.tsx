import type { Metadata } from "next";
import { Home } from "@/components/v2/Home";

export const metadata: Metadata = {
  title: "today",
  description: "Your track, your next lesson and today's practice.",
};

export default function DashboardPage() {
  return <Home />;
}
