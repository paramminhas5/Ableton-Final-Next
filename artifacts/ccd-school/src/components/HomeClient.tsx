"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useProgress } from "@/lib/progress";
import { FrontCurrent } from "@/components/front/FrontCurrent";

/** First visit: the School front page (FrontCurrent, 12 Nov) (its "start" opens the walkthrough at /start). Anyone who has started goes straight to home. */
export function HomeClient() {
  const { user } = useAuth();
  const router = useRouter();
  const { progress } = useProgress();
  const leaving = useRef(false);

  let returning = false;
  try {
    returning = !!(user || Object.keys(progress.completedMissions).length > 0 || progress.onboardingDone);
  } catch { returning = false; }

  useEffect(() => { if (returning && !leaving.current) router.replace("/dashboard"); }, [returning, router]);
  if (returning && !leaving.current) return null;
  return <FrontCurrent />;
}
