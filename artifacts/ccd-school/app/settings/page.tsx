import type { Metadata } from "next";
import { Settings } from "@/components/m1/Settings";

export const metadata: Metadata = {
  title: "Settings — CCD.SCHOOL",
  description: "Pick the voice lessons speak in, how hard they push, and the interface sounds.",
};

export default function SettingsPage() {
  return <Settings />;
}
