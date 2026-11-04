import type { Metadata } from "next";
import { UpgradePageClient } from "@/components/UpgradePageClient";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "upgrade to pro",
  description:
    "CCD.SCHOOL Pro: cloud sync, the leaderboard and more, on top of all 198 lessons.",
};

export default function UpgradePage() {
  return <UpgradePageClient />;
}
