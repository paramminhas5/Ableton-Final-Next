"use client";
import { useState, useEffect } from "react";

export type LearnMode = "classic" | "ccd";

export type Mode = "beginner" | "intermediate" | "advanced";

const DIFF_KEY = "ccd.diffMode";

export function useMode() {
  const [mode, setModeState] = useState<Mode>("beginner");

  useEffect(() => {
    if (typeof localStorage === "undefined") return;
    const saved = localStorage.getItem(DIFF_KEY) as Mode | null;
    if (saved === "beginner" || saved === "intermediate" || saved === "advanced") {
      setModeState(saved);
    }
  }, []);

  const setMode = (m: Mode) => {
    setModeState(m);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(DIFF_KEY, m);
    }
  };

  return { mode, setMode };
}

const MODE_KEY = "ccd.learnMode";

export function useLearnMode() {
  const [learnMode, setLearnModeState] = useState<LearnMode>("classic");

  useEffect(() => {
    if (typeof localStorage === "undefined") return;
    const saved = localStorage.getItem(MODE_KEY) as LearnMode | null;
    if (saved === "ccd" || saved === "classic") setLearnModeState(saved);
  }, []);

  const setLearnMode = (mode: LearnMode) => {
    setLearnModeState(mode);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(MODE_KEY, mode);
    }
  };

  return { learnMode, setLearnMode };
}
