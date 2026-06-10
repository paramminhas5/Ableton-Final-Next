"use client";
/**
 * @deprecated Replaced by SlimHeroBar in ui-redesign-polish.
 * Remove once SlimHeroBar is verified in production.
 *
 * WorldViewToggle — sticky tab bar on every /world/[slug] page.
 *
 * 🌊 Flow Mode  → /world/[slug]            (WorldPathClient — Duolingo snake)
 * 📋 Free Mode  → /world/[slug]?view=free  (WorldPageClient — accordion browser)
 *
 * Also syncs the learnMode context so the rest of the app (hearts, gating)
 * reflects whichever view is active.
 */
import Link from "next/link";
import { useEffect } from "react";
import { useLearnMode } from "@/lib/mode";

interface Props {
  slug: string;
  /** true when ?view=free is present in the URL */
  showFree: boolean;
}

export function WorldViewToggle({ slug, showFree }: Props) {
  const { learnMode, setLearnMode } = useLearnMode();

  // Sync mode context to URL param on mount so banners/hearts reflect reality
  useEffect(() => {
    if (showFree && learnMode !== "classic") setLearnMode("classic");
    if (!showFree && learnMode !== "flow")   setLearnMode("flow");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFree]);

  return (
    <div className="brutal-border border-x-0 border-t-0 bg-bone sticky top-[52px] md:top-[56px] z-30">
      <div className="max-w-5xl mx-auto flex">

        {/* ── Flow Mode tab ─────────────────────────────────────────── */}
        <Link
          href={`/world/${slug}`}
          onClick={() => setLearnMode("flow")}
          className={`flex-1 flex flex-col items-center justify-center py-2.5 px-3 border-r-4 border-ink brutal-press transition-colors
            ${!showFree
              ? "bg-acid text-ink"
              : "bg-bone text-ink/50 hover:bg-acid/20"
            }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🌊</span>
            <span className="font-display text-xs uppercase">Flow Mode</span>
            {!showFree && (
              <span className="font-mono text-[8px] bg-ink text-bone px-1.5 py-0.5 uppercase ml-1">Active</span>
            )}
          </div>
          <span className="font-mono text-[9px] opacity-60 mt-0.5 hidden sm:block">
            Sequential · locked nodes · hearts on
          </span>
        </Link>

        {/* ── Free Mode tab ─────────────────────────────────────────── */}
        <Link
          href={`/world/${slug}?view=free`}
          onClick={() => setLearnMode("classic")}
          className={`flex-1 flex flex-col items-center justify-center py-2.5 px-3 brutal-press transition-colors
            ${showFree
              ? "bg-bone text-ink border-l-4 border-l-ink"
              : "bg-bone text-ink/50 hover:bg-ink/5"
            }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🔓</span>
            <span className="font-display text-xs uppercase">Free Mode</span>
            {showFree && (
              <span className="font-mono text-[8px] bg-ink text-bone px-1.5 py-0.5 uppercase ml-1">Active</span>
            )}
          </div>
          <span className="font-mono text-[9px] opacity-60 mt-0.5 hidden sm:block">
            All lessons open · jump anywhere · no hearts
          </span>
        </Link>

      </div>
    </div>
  );
}
