import type { Metadata } from "next";
import { DevicesPageClient } from "@/components/DevicesPageClient";

export const metadata: Metadata = {
  title: "Device Lab — CCD.SCHOOL",
  description: "Real, working device emulations + every built-in instrument explained. Every knob, audible.",
};

export default function DevicesPage() {
  return <DevicesPageClient />;
}
