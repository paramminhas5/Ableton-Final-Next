import type { Metadata } from "next";
import { DashboardClient } from "@/components/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard | CCD.SCHOOL",
  description: "Your learning progress across all three worlds.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
