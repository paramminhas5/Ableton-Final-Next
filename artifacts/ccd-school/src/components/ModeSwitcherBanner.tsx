"use client";
/**
 * ModeSwitcherBanner — inline mode toggle shown on /learn, /world/* pages.
 *
 * Two variants:
 *   "bar"  — compact horizontal strip (used at page top)
 *   "card" — full comparison card (used on first visit or settings screens)
 *
 * When rendered on a /world/[slug] page, switching mode also navigates to/from
 * ?view=classic so the URL param and the mode context stay in sync.
 */
import { useState } from "react";
import { useLearnMode } from "@/lib/mode";
import { useRouter, usePathname } from "next/navigation";

interface Props {
  variant?: "bar" | "card";
  className?: string;
}

export function ModeSwitcherBanner({ variant = "bar", className = "" }: Props) {
  const { learnMode, setLearnMode } = useLearnMode();
  const isFlow = learnMode === "flow";
  const [justSwitched, setJustSwitched] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Detect if we're on a /world/[slug] page so we can sync the ?view= param
  const worldMatch = pathname?.match(/^\/world\/([^/]+)$/);
  const worldSlug = worldMatch ? worldMatch[1] : null;

  const switchMode = () => {
    const next = isFlow ? "classic" : "flow";
    setLearnMode(next);
    setJustSwitched(true);
    setTimeout(() => setJustSwitched(false), 1500);
    // Sync URL param when on a world page
    if (worldSlug) {
      if (next === "classic") {
        router.push(`/world/${worldSlug}?view=classic`);
      } else {
        router.push(`/world/${worldSlug}`);
      }
    }
  };

  /* ── CARD variant ──────────────────────────────────────────────────── */
  if (variant === "card") {
    return (
      <div className={`brutal-border rounded-xl bg-bone brutal-shadow ${className}`}>
        {/* Header */}
        <div className="border-b-2 border-border bg-ink text-bone px-5 py-4 rounded-t-xl">
          <p className="font-mono text-xs uppercase opacity-45 mb-0.5">Learning Mode</p>
          <p className="font-display text-2xl">
            {isFlow ? "🌊 Flow Mode" : "🔓 Free Mode"}
          </p>
        </div>

        {/* Mode cards side by side */}
        <div className="grid grid-cols-2">
          {/* FLOW MODE */}
          <button
            onClick={() => !isFlow && setLearnMode("flow")}
            className={`p-5 text-left transition-all border-r-2 border-border rounded-bl-xl
              ${isFlow
                ? "bg-acid text-ink cursor-default"
                : "bg-bone hover:bg-acid/15 cursor-pointer brutal-press"}`}
            aria-pressed={isFlow}
          >
            <div className="text-3xl mb-3">🌊</div>
            <p className="font-display text-lg leading-tight mb-2.5">Flow Mode</p>
            <ul className="space-y-1.5">
              {[
                "Sequential unlock",
                "Hearts on errors",
                "XP gating",
                "Structured progress",
              ].map((text) => (
                <li key={text} className="flex items-center gap-2 font-sans text-sm opacity-75">
                  <span className="text-xs">✓</span> {text}
                </li>
              ))}
            </ul>
            {isFlow && (
              <p className="mt-3.5 font-mono text-xs uppercase font-bold opacity-60">● Active</p>
            )}
          </button>

          {/* FREE MODE */}
          <button
            onClick={() => isFlow && setLearnMode("classic")}
            className={`p-5 text-left transition-all rounded-br-xl
              ${!isFlow
                ? "bg-bone text-ink cursor-default"
                : "bg-bone hover:bg-sun/30 cursor-pointer brutal-press"}`}
            aria-pressed={!isFlow}
          >
            <div className="text-3xl mb-3">🔓</div>
            <p className="font-display text-lg leading-tight mb-2.5">Free Mode</p>
            <ul className="space-y-1.5">
              {[
                "All lessons open",
                "No hearts",
                "Jump anywhere",
                "Normal & hard diff.",
              ].map((text) => (
                <li key={text} className="flex items-center gap-2 font-sans text-sm opacity-65">
                  <span className="text-xs">✓</span> {text}
                </li>
              ))}
            </ul>
            {!isFlow && (
              <p className="mt-3.5 font-mono text-xs uppercase font-bold opacity-60">● Active</p>
            )}
          </button>
        </div>

        {/* Switch CTA */}
        <div className="px-5 py-3.5 border-t-2 border-border flex items-center justify-between gap-3">
          <p className="font-sans text-sm opacity-50">
            Switch anytime — progress carries over
          </p>
          <button
            onClick={switchMode}
            className="brutal-border rounded-md bg-ink text-bone px-4 py-2 font-sans text-sm font-medium brutal-press hover:bg-acid hover:text-ink transition-colors shrink-0"
          >
            {justSwitched ? "✓ Switched" : `Switch to ${isFlow ? "Free" : "Flow"} →`}
          </button>
        </div>
      </div>
    );
  }

  /* ── BAR variant (default) ─────────────────────────────────────────── */
  return (
    <div
      className={`flex items-center justify-between gap-3 px-4 py-3
        ${isFlow ? "bg-acid text-ink" : "bg-bone text-ink"}
        ${className}`}
    >
      {/* Left: mode info */}
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-xl shrink-0">{isFlow ? "🌊" : "🔓"}</span>
        <div className="min-w-0">
          <p className="font-display text-base leading-tight">
            {isFlow ? "Flow Mode" : "Free Mode"}
          </p>
          <p className="font-sans text-xs opacity-55 truncate mt-0.5">
            {isFlow
              ? "Sequential · hearts on · XP gated"
              : "All lessons open · no hearts · jump anywhere"}
          </p>
        </div>
      </div>

      {/* Right: switch button */}
      <button
        onClick={switchMode}
        className={`shrink-0 brutal-border px-4 py-2 font-display text-sm transition-colors chunk-shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none
          ${isFlow
            ? "bg-ink text-bone hover:bg-electric-blue"
            : "bg-ink text-bone hover:bg-acid"}`}
      >
        {justSwitched ? "✓ Switched!" : `Switch to ${isFlow ? "Free" : "Flow"} →`}
      </button>
    </div>
  );
}
