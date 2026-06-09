"use client";

import { useLearnMode } from "@/lib/mode";

interface ModeSwitchProps {
  className?: string;
  variant?: "compact" | "full";
}

export function ModeSwitch({ className = "", variant = "full" }: ModeSwitchProps) {
  const { learnMode, setLearnMode } = useLearnMode();
  const isFlow = learnMode === "flow";

  const handleToggle = () => {
    setLearnMode(isFlow ? "classic" : "flow");
  };

  if (variant === "compact") {
    return (
      <button
        onClick={handleToggle}
        className={`brutal-border px-3 py-1.5 font-display text-xs brutal-press transition-colors flex items-center gap-2 ${className} ${
          isFlow
            ? "bg-acid text-ink hover:bg-sun"
            : "bg-ink/10 text-ink hover:bg-ink/20"
        }`}
        aria-label={`Switch to ${isFlow ? "Free" : "Flow"} Mode`}
      >
        <span>{isFlow ? "🌊" : "🔓"}</span>
        <span>{isFlow ? "Flow" : "Free"}</span>
      </button>
    );
  }

  return (
    <div className={`brutal-border overflow-hidden inline-flex ${className}`}>
      <button
        onClick={() => setLearnMode("flow")}
        className={`px-4 py-2 font-display text-sm transition-colors flex items-center gap-2 ${
          isFlow
            ? "bg-acid text-ink"
            : "bg-ink/10 text-ink hover:bg-ink/20"
        }`}
        aria-label="Switch to Flow Mode"
      >
        <span>🌊</span>
        <span>Flow</span>
      </button>
      <button
        onClick={() => setLearnMode("classic")}
        className={`px-4 py-2 font-display text-sm transition-colors flex items-center gap-2 ${
          !isFlow
            ? "bg-acid text-ink"
            : "bg-ink/10 text-ink hover:bg-ink/20"
        }`}
        aria-label="Switch to Free Mode"
      >
        <span>🔓</span>
        <span>Free</span>
      </button>
    </div>
  );
}

// Hero-level mode picker for /worlds page
export function WorldModePicker() {
  const { learnMode } = useLearnMode();
  const isFlow = learnMode === "flow";

  return (
    <div className="brutal-border bg-ink text-bone p-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-mono text-[9px] uppercase opacity-60 mb-1">
              LEARNING MODE
            </div>
            <div className="font-display text-xl mb-1">
              {isFlow ? "🌊 Flow Mode" : "🔓 Free Mode"}
            </div>
            <p className="font-mono text-xs opacity-70 max-w-md">
              {isFlow
                ? "Guided path · lessons unlock in order · hearts on wrong answers"
                : "All lessons open · jump anywhere · browse by chapter and path"}
            </p>
          </div>
          
          <div className="shrink-0">
            <ModeSwitch variant="compact" />
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-bone/20">
          <div className="font-mono text-[8px] uppercase opacity-50">
            This selection applies to all worlds below
          </div>
        </div>
      </div>
    </div>
  );
}