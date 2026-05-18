"use client";
import { useState, useEffect } from "react";

export type LearnMode = "classic" | "ccd";

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
