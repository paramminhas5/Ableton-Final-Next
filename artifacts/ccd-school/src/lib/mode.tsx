"use client";
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type LearnMode = "classic" | "ccd";
// Mode labels (public-facing):
//   "ccd"     → PATH MODE   — sequential, hearts on, Duolingo-style
//   "classic" → EXPLORE MODE — all lessons open, no hearts, free-browse
// Mode/difficulty: only two axes now — learnMode (ccd/classic) and progress.difficulty (normal/hard)
// The old Beginner/Intermediate/Advanced axis is removed.

/** Human-readable label for each mode */
export const MODE_LABELS: Record<LearnMode, { name: string; icon: string; tagline: string }> = {
  ccd:     { name: "PATH MODE",    icon: "🗺",  tagline: "Sequential · Hearts on · XP gated" },
  classic: { name: "EXPLORE MODE", icon: "🔓", tagline: "All open · No hearts · Jump anywhere" },
};

const MODE_KEY = "ccd.learnMode";

function getInitialMode(): LearnMode {
  if (typeof window === "undefined") return "classic";
  try {
    const saved = localStorage.getItem(MODE_KEY) as LearnMode | null;
    return saved === "ccd" || saved === "classic" ? saved : "classic";
  } catch {
    return "classic";
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

type LearnModeContextType = {
  learnMode: LearnMode;
  setLearnMode: (m: LearnMode) => void;
};

const LearnModeContext = createContext<LearnModeContextType>({
  learnMode: "classic",
  setLearnMode: () => {},
});

export function LearnModeProvider({ children }: { children: ReactNode }) {
  const [learnMode, setLearnModeState] = useState<LearnMode>(getInitialMode);

  const setLearnMode = useCallback((m: LearnMode) => {
    setLearnModeState(m);
    try {
      localStorage.setItem(MODE_KEY, m);
      document.documentElement.setAttribute("data-learn-mode", m);
    } catch {}
  }, []);

  return (
    <LearnModeContext.Provider value={{ learnMode, setLearnMode }}>
      {children}
    </LearnModeContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useLearnMode() {
  return useContext(LearnModeContext);
}

// Legacy — kept for backward compat, no-op now. Remove after audit.
export type Mode = "beginner" | "intermediate" | "advanced";
/** @deprecated The Beginner/Intermediate/Advanced axis is removed. Use progress.difficulty instead. */
export function useMode() {
  return { mode: "beginner" as Mode, setMode: (_: Mode) => {} };
}
