import type { Metadata } from "next";
import { ShopPageClient } from "@/components/ShopPageClient";

export const metadata: Metadata = {
  title: "Gem Shop | CCD.SCHOOL",
  description: "Spend your gems on streak freezes, heart refills and XP boosts.",
};

export default function ShopPage() {
  return <ShopPageClient />;
}
