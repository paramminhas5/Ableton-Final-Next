import type { Metadata } from "next";
import { AdminPageClient } from "@/components/AdminPageClient";

export const metadata: Metadata = {
  title: "admin",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminPageClient />;
}
