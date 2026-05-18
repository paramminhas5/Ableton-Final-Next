import type { Metadata } from "next";
import { UpgradePageClient } from "@/components/UpgradePageClient";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Upgrade to PRO",
  description:
    "Unlock all 153 missions, advanced content, cloud sync, and compete on the global leaderboard with CCD.SCHOOL PRO.",
};

export default function UpgradePage() {
  return <UpgradePageClient />;
}
