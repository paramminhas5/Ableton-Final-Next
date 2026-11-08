import type { Metadata } from "next";
import { AdminLearning } from "@/components/AdminLearning";

export const metadata: Metadata = { title: "learning", robots: { index: false, follow: false } };

export default function AdminLearningPage() {
  return <AdminLearning />;
}
