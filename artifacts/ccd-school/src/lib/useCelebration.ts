"use client";
/**
 * useCelebration — detects progress milestones and returns the next celebration event.
 *
 * Watches: XP (rank-up), streakDays (milestones), completed missions (path/chapter/world trophies).
 * Uses localStorage to track which celebrations have already been shown.
 */
import { useEffect, useRef, useState } from "react";
import { useProgress } from "@/lib/progress";
import { rankUpFrom } from "@/lib/worldRanks";
import { curPathOf } from "@/content/curriculum";
import { CHAPTERS } from "@/content/chapters";
import { pathsByWorld, type LearningPath } from "@/content/paths";

/** A path is finished when its song lessons are (deeper lessons and bonus rounds are extra). */
const spine = (p: LearningPath) => (p.songSlugs.length ? p.songSlugs : p.missionSlugs);
import type { CelebrationEvent } from "@/components/CelebrationOverlay";

const SEEN_KEY = "ccd.celebrations.v1";
const PENDING_KEY = "ccd.celebrations.pending";

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
  const [event, setEventState] = useState<CelebrationEvent | null>(null);
  // A moment earned inside a lesson waits until you leave it (ClientProviders), and survives a reload or a
  // typed url on the way: it is kept in storage until it has been shown and dismissed.
  const setEvent = (e: CelebrationEvent | null) => {
    setEventState(e);
    try { if (e) localStorage.setItem(PENDING_KEY, JSON.stringify(e)); else localStorage.removeItem(PENDING_KEY); } catch { /* storage blocked */ }
  };
  useEffect(() => {
    try { const raw = localStorage.getItem(PENDING_KEY); if (raw) setEventState(JSON.parse(raw) as CelebrationEvent); } catch { /* none */ }
  }, []);
  const prevXp = useRef(progress.xp);
  const prevStreak = useRef(progress.streakDays);
  const prevShield = useRef(progress.streakShield);
  const prevMissions = useRef<Record<string, unknown>>({});
  const mountedAt = useRef(Date.now());

  useEffect(() => {
    // Progress loads from storage right after mount. That jump is not a new achievement,
    // so the first moments only record where the learner already is.
    if (Date.now() - mountedAt.current < 2000) {
      prevXp.current = progress.xp;
      prevStreak.current = progress.streakDays;
      prevShield.current = progress.streakShield;
      prevMissions.current = { ...progress.completedMissions };
      return;
    }
    const seen = getSeenSet();

    // ── Rank-up, per world: the lesson you just finished moves its own world's rank ─────────
    {
      const fresh = Object.keys(progress.completedMissions).filter(s => progress.completedMissions[s] && !prevMissions.current[s]);
      for (const slug of fresh) {
        const world = curPathOf(slug)?.world;
        if (!world) continue;
        const up = rankUpFrom(world, prevMissions.current, progress.completedMissions);
        if (!up) continue;
        const celebId = `rank-${world}-${up.current.slug}`;
        if (seen.has(celebId)) continue;
        markSeen(celebId);
        setEvent({ kind: "rank-up", rankName: up.current.name, world });
        prevXp.current = progress.xp;
        prevMissions.current = { ...progress.completedMissions };
        return;
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

    // ── Fix #10: Streak shield earned (every 7-day milestone) ─────────────
    // The shield flips from false→true when a 7-day multiple is hit.
    // Show a lightweight shield animation instead of the full CelebrationOverlay
    // (the streak milestone overlay already fires; the shield is a bonus moment
    //  on the *next* lesson after the milestone when the shield is actually set).
    if (!prevShield.current && progress.streakShield) {
      prevShield.current = progress.streakShield;
      const celebId = `shield-${progress.streakDays}`;
      if (!seen.has(celebId)) {
        markSeen(celebId);
        setEvent({ kind: "shield-earned", streakDays: progress.streakDays });
        return;
      }
    }
    prevShield.current = progress.streakShield;

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
          const allDone = spine(path).every(s => !!completed[s]);
          const wasDone = spine(path).every(s => !!prevCompleted[s]);
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
          const chSlugs = chPaths.flatMap(p => spine(p));
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
        const worldSlugs = paths.flatMap(p => spine(p));
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
        const wSlugs = pathsByWorld(w).flatMap(p => spine(p));
        return wSlugs.every(s => !!completed[s]);
      });
      const wasMasterDone = (["fundamentals","dj","producer"] as const).every(w => {
        const wSlugs = pathsByWorld(w).flatMap(p => spine(p));
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
