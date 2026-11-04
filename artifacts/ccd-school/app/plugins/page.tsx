import type { Metadata } from "next";
import { PluginsPageClient } from "@/components/PluginsPageClient";

export const metadata: Metadata = {
  title: "which plug-in for which job",
  description: "Stock Live device first, then well-known free and paid plug-ins for each job. Formats, folders and what to install.",
};

export default function PluginsPage() {
  return <PluginsPageClient />;
}
