import type { Metadata } from "next";
import { SignalFlowPageClient } from "@/components/SignalFlowPageClient";

export const metadata: Metadata = {
  title: "signal flow",
  description: "Visualise signal flow in Ableton Live: from source to speaker.",
};

export default function SignalFlowPage() {
  return <SignalFlowPageClient />;
}
