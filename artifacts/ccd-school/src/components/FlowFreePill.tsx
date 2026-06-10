"use client";
/**
 * FlowFreePill — compact two-button pill (Flow | Free) that sets learnMode
 * and optionally navigates to the corresponding world URL.
 *
 * Standalone file to avoid circular imports between SlimHeroBar and MissionPageClient.
 */
import { useRouter } from "next/navigation";
import { useLearnMode } from "@/lib/mode";

export interface FlowFreePillProps {
  /** If provided, navigates to /world/[slug] or /world/[slug]?view=free on toggle */
  worldSlug?: string;
  /** Override to show which mode is active (defaults to learnMode from context) */
  showFree?: boolean;
  /** When true, shows emoji only — no text labels */
  compact?: boolean;
}

export function FlowFreePill({ worldSlug, showFree, compact = false }: FlowFreePillProps) {
  const { learnMode, setLearnMode } = useLearnMode();
  const router = useRouter();

  // Determine which mode is active: showFree prop overrides context
  const isFree = showFree !== undefined ? showFree : learnMode === "classic";

  const handleFlowClick = () => {
    setLearnMode("flow");
    if (worldSlug) router.push(`/world/${worldSlug}`);
  };

  const handleFreeClick = () => {
    setLearnMode("classic");
    if (worldSlug) router.push(`/world/${worldSlug}?view=free`);
  };

  return (
    <div className="flex items-center gap-0.5">
      {/* Flow pill */}
      <button
        onClick={handleFlowClick}
        title="Flow Mode — sequential, hearts on"
        aria-label="Switch to Flow Mode"
        className={`brutal-border px-2 py-1 font-mono text-[9px] uppercase brutal-press transition-colors ${
          !isFree ? "bg-acid text-ink" : "bg-bone text-ink/50 hover:bg-acid/30"
        }`}
      >
        {compact ? "🌊" : "🌊 Flow"}
      </button>

      {/* Free pill */}
      <button
        onClick={handleFreeClick}
        title="Free Mode — all lessons open, no hearts"
        aria-label="Switch to Free Mode"
        className={`brutal-border px-2 py-1 font-mono text-[9px] uppercase brutal-press transition-colors ${
          isFree ? "bg-ink text-bone" : "bg-bone text-ink/50 hover:bg-ink/20"
        }`}
      >
        {compact ? "🔓" : "🔓 Free"}
      </button>
    </div>
  );
}
