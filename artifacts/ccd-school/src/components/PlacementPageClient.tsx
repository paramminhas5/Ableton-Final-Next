"use client";
/** /placement: find your level, by ear and by hand (src/components/m1/Placement.tsx). ?world= picks the world. */
import { useSearchParams } from "next/navigation";
import { Placement } from "@/components/m1/Placement";
import type { WorldId } from "@/lib/worldOrder";

export function PlacementPageClient() {
  const w = useSearchParams().get("world");
  const world: WorldId | undefined = w === "producer" || w === "fundamentals" || w === "dj" ? w : undefined;
  return <Placement world={world} />;
}
