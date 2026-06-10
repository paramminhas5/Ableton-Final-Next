"use client";
/**
 * ModeSwitch — URL-driven Flow / Free segmented control.
 * Ported from ui/worlds-overhaul reference branch.
 *
 * Two modes:
 *  1. URL-driven (worldSlug + activeView): navigates to /world/[slug] or
 *     /world/[slug]?view=free. URL is the single source of truth.
 *  2. Context-driven (no worldSlug): reflects learnMode context, toggles it.
 *
 * Same visual everywhere — rail, mobile sheet, header.
 */
import { useRouter } from "next/navigation";
import { useLearnMode } from "@/lib/mode";

interface ModeSwitchProps {
  /** When provided the switch is URL-driven for this world. */
  worldSlug?: string;
  /** Current view from the URL — required when worldSlug is set. */
  activeView?: "flow" | "free";
  /** Fill the container width (rail / sheet) vs inline (header). */
  full?: boolean;
  /** Touch-target size. */
  size?: "sm" | "md";
  className?: string;
}

export function ModeSwitch({
  worldSlug,
  activeView,
  full = false,
  size = "sm",
  className = "",
}: ModeSwitchProps) {
  const { learnMode, setLearnMode } = useLearnMode();
  const router = useRouter();

  const urlDriven = !!worldSlug && !!activeView;
  const isFlow = urlDriven ? activeView === "flow" : learnMode === "flow";

  const select = (toFlow: boolean) => {
    if (toFlow === isFlow) return;
    setLearnMode(toFlow ? "flow" : "classic");
    if (worldSlug) {
      router.push(toFlow ? `/world/${worldSlug}` : `/world/${worldSlug}?view=free`);
    }
  };

  const pad = size === "md" ? "py-2.5 px-4 text-sm" : "py-1.5 px-3 text-xs";

  return (
    <div
      role="tablist"
      aria-label="Learning mode"
      className={`brutal-border bg-bone inline-flex p-1 gap-1 ${full ? "w-full" : ""} ${className}`}
    >
      <button
        role="tab"
        aria-selected={isFlow}
        onClick={() => select(true)}
        title="Flow Mode — focused, one lesson at a time"
        className={`flex-1 flex items-center justify-center gap-1.5 font-display brutal-press transition-all ${pad} ${
          isFlow
            ? "bg-acid text-ink chunk-shadow-sm"
            : "text-ink/45 hover:text-ink hover:bg-ink/5"
        }`}
      >
        <span className="text-sm leading-none">🌊</span>
        <span>Flow</span>
      </button>

      <button
        role="tab"
        aria-selected={!isFlow}
        onClick={() => select(false)}
        title="Free Mode — open wiki, browse anything"
        className={`flex-1 flex items-center justify-center gap-1.5 font-display brutal-press transition-all ${pad} ${
          !isFlow
            ? "bg-electric-blue text-bone chunk-shadow-sm"
            : "text-ink/45 hover:text-ink hover:bg-ink/5"
        }`}
      >
        <span className="text-sm leading-none">📖</span>
        <span>Free</span>
      </button>
    </div>
  );
}

/** Backwards-compat default export */
export default ModeSwitch;
