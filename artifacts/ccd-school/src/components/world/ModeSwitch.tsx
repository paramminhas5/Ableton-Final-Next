"use client";
/**
 * ModeSwitch — the ONE mode toggle used everywhere (header, rail, mobile bar).
 *
 * Two operating modes:
 *  1. URL-driven (worldSlug + activeView provided): the active segment is
 *     derived from the URL, and clicking navigates to /world/[slug] (flow)
 *     or /world/[slug]?view=free. This makes the URL the single source of
 *     truth on world pages — no context/URL drift, the view always switches.
 *  2. Context-driven (no worldSlug): reflects learnMode and toggles it.
 *     Used on non-world pages (e.g. /learn, home).
 *
 * Same visual + interaction everywhere. A segmented control with a sliding
 * brutalist highlight.
 */
import { useRouter } from "next/navigation";
import { useLearnMode } from "@/lib/mode";

interface Props {
  /** When provided, switch is URL-driven for this world. */
  worldSlug?: string;
  /** Current view from the URL — required when worldSlug is set. */
  activeView?: "flow" | "free";
  /** Full-width (rail / mobile sheet) vs inline (header). */
  full?: boolean;
  /** Larger touch targets for the rail. */
  size?: "sm" | "md";
  className?: string;
}

export function ModeSwitch({ worldSlug, activeView, full = false, size = "sm", className = "" }: Props) {
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
      {/* FLOW */}
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

      {/* FREE */}
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
