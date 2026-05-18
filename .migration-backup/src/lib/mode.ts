// Mode system: beginner → intermediate → advanced
// Intermediate has a path choice: DJ (rekordbox) or Ableton
// LearnMode is orthogonal: classic (open) vs ccd (gated, hearts, XP)
import { useEffect, useState } from "react";

export type Mode = "beginner" | "intermediate" | "advanced";
export type IntermediatePath = "dj" | "ableton";
export type LearnMode = "classic" | "ccd";

const MODE_KEY = "ableton.school.mode";
const PATH_KEY = "ableton.school.intermediate-path";
const LEARN_KEY = "ableton.school.learn-mode";

const read = (): Mode => {
  if (typeof localStorage === "undefined") return "beginner";
  return (localStorage.getItem(MODE_KEY) as Mode) || "beginner";
};

const readPath = (): IntermediatePath | null => {
  if (typeof localStorage === "undefined") return null;
  return (localStorage.getItem(PATH_KEY) as IntermediatePath) || null;
};

const readLearn = (): LearnMode => {
  if (typeof localStorage === "undefined") return "classic";
  return (localStorage.getItem(LEARN_KEY) as LearnMode) || "classic";
};

export const useMode = () => {
  const [mode, setModeState] = useState<Mode>("beginner");
  useEffect(() => {
    setModeState(read());
    const h = () => setModeState(read());
    window.addEventListener("mode:update", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("mode:update", h);
      window.removeEventListener("storage", h);
    };
  }, []);

  const setMode = (m: Mode) => {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(MODE_KEY, m);
    window.dispatchEvent(new Event("mode:update"));
    setModeState(m);
  };

  return { mode, setMode };
};

export const useIntermediatePath = () => {
  const [path, setPathState] = useState<IntermediatePath | null>(null);
  useEffect(() => {
    setPathState(readPath());
    const h = () => setPathState(readPath());
    window.addEventListener("path:update", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("path:update", h);
      window.removeEventListener("storage", h);
    };
  }, []);

  const setPath = (p: IntermediatePath) => {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(PATH_KEY, p);
    window.dispatchEvent(new Event("path:update"));
    setPathState(p);
  };

  return { path, setPath };
};

export const useLearnMode = () => {
  const [learnMode, setLearnModeState] = useState<LearnMode>("classic");
  useEffect(() => {
    setLearnModeState(readLearn());
    const h = () => setLearnModeState(readLearn());
    window.addEventListener("learn-mode:update", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("learn-mode:update", h);
      window.removeEventListener("storage", h);
    };
  }, []);

  const setLearnMode = (m: LearnMode) => {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(LEARN_KEY, m);
    window.dispatchEvent(new Event("learn-mode:update"));
    setLearnModeState(m);
  };

  return { learnMode, setLearnMode };
};
