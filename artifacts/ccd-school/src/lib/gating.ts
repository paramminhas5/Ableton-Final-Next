import { PATHS } from "@/content/paths";
import type { Mission } from "@/content/types";

export const FREE_MISSIONS_PER_PATH = 3;

const missionFreePositions = new Map<string, boolean>();

function buildFreeSet() {
  if (missionFreePositions.size > 0) return;
  for (const path of PATHS) {
    path.missionSlugs.forEach((slug, idx) => {
      if (idx < FREE_MISSIONS_PER_PATH) {
        missionFreePositions.set(slug, true);
      }
    });
  }
}

export function isPaidMission(mission: Pick<Mission, "slug" | "tier">): boolean {
  if (mission.tier === "deep") return true;
  buildFreeSet();
  return !missionFreePositions.has(mission.slug);
}

export type GatingMode = "free" | "paid";

export function isLocked(
  mission: Pick<Mission, "slug" | "tier">,
  userPlan: "free" | "pro",
  gatingMode: GatingMode,
): boolean {
  if (gatingMode === "free") return false;
  if (userPlan === "pro") return false;
  return isPaidMission(mission);
}
