"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

export type LearnMode = "flow" | "classic";
// Mode labels (public-facing):
//   "ccd"     → PATH MODE   — sequential, hearts on, Duolingo-style
//   "classic" → EXPLORE MODE — all lessons open, no hearts, free-browse

/** Human-readable label for each mode */
export const MODE_LABELS: Record<LearnMode, { name: string; icon: string; tagline: string }> = {
  flow:    { name: "Flow Mode", icon: "🌊", tagline: "Sequential · Hearts on · XP gated" },
  classic: { name: "Free Mode", icon: "🔓", tagline: "All open · No hearts · Jump anywhere" },
};

const MODE_KEY = "ccd.learnMode";

// ─── Context ─────────────────────────────────────────────────────────────────

type LearnModeContextType = {
  learnMode: LearnMode;
  setLearnMode: (m: LearnMode) => void;
};

const LearnModeContext = createContext<LearnModeContextType>({
  learnMode: "flow",
  setLearnMode: () => {},
});

export function LearnModeProvider({ children }: { children: ReactNode }) {
  // Always start with "classic" on the server so SSR HTML matches the
  // initial client render (no hydration mismatch). We then sync from
  // localStorage in a useEffect (client-only) immediately after mount.
  const [learnMode, setLearnModeState] = useState<LearnMode>("classic");

  // Hydrate from localStorage after first paint — runs client-side only.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(MODE_KEY) as LearnMode | null;
      const resolved: LearnMode =
        saved === "ccd" || saved === "classic" ? saved : "classic";
      setLearnModeState(resolved);
      document.documentElement.setAttribute("data-learn-mode", resolved);
    } catch {}
  }, []);

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
