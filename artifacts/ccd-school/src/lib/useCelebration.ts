"use client";
/**
 * useCelebration — detects progress milestones and returns the next celebration event.
 *
 * Watches: XP (rank-up), streakDays (milestones), completed missions (path/chapter/world trophies).
 * Uses localStorage to track which celebrations have already been shown.
 */
import { useEffect, useRef, useState } from "react";
import { useProgress } from "@/lib/progress";
import { rankFor } from "@/lib/ranks";
import { CHAPTERS } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";
import type { CelebrationEvent } from "@/components/CelebrationOverlay";

const SEEN_KEY = "ccd.celebrations.v1";

function getSeenSet(): Set<string> {
  if (typeof localStorage === "undefined") return new Set();
  try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]")); }
  catch { return new Set(); }
}

function markSeen(id: string) {
  if (typeof localStorage === "undefined") return;
  const s = getSeenSet();
  s.add(id);
  localStorage.setItem(SEEN_KEY, JSON.stringify(Array.from(s)));
}

export function useCelebration() {
  const { progress } = useProgress();
  const [event, setEvent] = useState<CelebrationEvent | null>(null);
  const prevXp = useRef(progress.xp);
  const prevStreak = useRef(progress.streakDays);
  const prevMissions = useRef<Record<string, unknown>>({});

  useEffect(() => {
    const seen = getSeenSet();

    // ── Rank-up ──────────────────────────────────────────────────────────────
    if (progress.xp > prevXp.current) {
      const { current: oldRank } = rankFor(prevXp.current);
      const { current: newRank } = rankFor(progress.xp);
      if (newRank.slug !== oldRank.slug) {
        const celebId = `rank-${newRank.slug}`;
        if (!seen.has(celebId)) {
          markSeen(celebId);
          setEvent({ kind: "rank-up", rankName: newRank.name, rankEmoji: newRank.emoji });
          prevXp.current = progress.xp;
          return;
        }
      }
      prevXp.current = progress.xp;
    }

    // ── Streak milestones (7, 14, 21, 30, 60, 100…) ───────────────────────
    if (progress.streakDays > prevStreak.current) {
      const milestones = [7, 14, 21, 30, 60, 100, 365];
      for (const m of milestones) {
        if (progress.streakDays >= m && prevStreak.current < m) {
          const celebId = `streak-${m}`;
          if (!seen.has(celebId)) {
            markSeen(celebId);
            setEvent({ kind: "streak", days: progress.streakDays });
            prevStreak.current = progress.streakDays;
            return;
          }
        }
      }
      prevStreak.current = progress.streakDays;
    }

    // ── Path / Chapter / World trophies ───────────────────────────────────
    const completed = progress.completedMissions;
    const prevCompleted = prevMissions.current;

    // Check if any new missions completed
    const newSlugs = Object.keys(completed).filter(s => completed[s] && !prevCompleted[s]);
    if (newSlugs.length > 0) {
      for (const world of ["fundamentals", "dj", "producer"] as const) {
        const paths = pathsByWorld(world);
        for (const path of paths) {
          // Path trophy
          const allDone = path.missionSlugs.every(s => !!completed[s]);
          const wasDone = path.missionSlugs.every(s => !!prevCompleted[s]);
          if (allDone && !wasDone) {
            const celebId = `path-${path.slug}`;
            if (!seen.has(celebId)) {
              markSeen(celebId);
              setEvent({ kind: "path-trophy", trophyName: `${path.title} Complete`, pathTitle: path.title });
              prevMissions.current = { ...completed };
              return;
            }
          }
        }

        // Chapter trophy
        const chapters = CHAPTERS.filter(c => c.world === world);
        for (const ch of chapters) {
          const chPaths = paths.filter(p => p.chapter === ch.slug);
          const chSlugs = chPaths.flatMap(p => p.missionSlugs);
          const allDone = chSlugs.every(s => !!completed[s]);
          const wasDone = chSlugs.every(s => !!prevCompleted[s]);
          if (allDone && !wasDone && chSlugs.length > 0) {
            const celebId = `chapter-${ch.slug}`;
            if (!seen.has(celebId)) {
              markSeen(celebId);
              setEvent({ kind: "chapter-trophy", trophyName: ch.trophy.name, chapterTitle: ch.title });
              prevMissions.current = { ...completed };
              return;
            }
          }
        }

        // World trophy
        const worldSlugs = paths.flatMap(p => p.missionSlugs);
        const allWorldDone = worldSlugs.every(s => !!completed[s]);
        const wasWorldDone = worldSlugs.every(s => !!prevCompleted[s]);
        if (allWorldDone && !wasWorldDone && worldSlugs.length > 0) {
          const celebId = `world-${world}`;
          if (!seen.has(celebId)) {
            markSeen(celebId);
            setEvent({ kind: "world-trophy", worldName: world === "fundamentals" ? "Fundamentals" : world === "dj" ? "DJ World" : "Producer" });
            prevMissions.current = { ...completed };
            return;
          }
        }
      }

      // CCD Master — all 3 worlds done
      const allMasterDone = (["fundamentals","dj","producer"] as const).every(w => {
        const wSlugs = pathsByWorld(w).flatMap(p => p.missionSlugs);
        return wSlugs.every(s => !!completed[s]);
      });
      const wasMasterDone = (["fundamentals","dj","producer"] as const).every(w => {
        const wSlugs = pathsByWorld(w).flatMap(p => p.missionSlugs);
        return wSlugs.every(s => !!prevCompleted[s]);
      });
      if (allMasterDone && !wasMasterDone) {
        const celebId = "ccd-master";
        if (!seen.has(celebId)) {
          markSeen(celebId);
          setEvent({ kind: "ccd-master" });
          prevMissions.current = { ...completed };
          return;
        }
      }

      prevMissions.current = { ...completed };
    }
  }, [progress.xp, progress.streakDays, progress.completedMissions]);

  const dismiss = () => setEvent(null);

  return { celebrationEvent: event, dismissCelebration: dismiss };
}
