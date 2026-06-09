"use client";
/**
 * WorldViewToggle — tab switcher between Duolingo Path and Classic views.
 *
 * Fix: syncs learnMode context with the URL ?view= param on mount AND on click,
 * so the banner and the lesson page view always stay consistent.
 *   Path View   → learnMode "flow"    → no ?view param
 *   Classic View → learnMode "classic" → ?view=classic
 */
import Link from "next/link";
import { useEffect } from "react";
import { useLearnMode } from "@/lib/mode";

interface Props {
  slug: string;
  showClassic: boolean;
}

export function WorldViewToggle({ slug, showClassic }: Props) {
  const { learnMode, setLearnMode } = useLearnMode();

  // On mount: sync mode context to match the URL param so the banner reflects reality
  useEffect(() => {
    if (showClassic && learnMode !== "classic") setLearnMode("classic");
    if (!showClassic && learnMode !== "flow")   setLearnMode("flow");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showClassic]);

  return (
    <div className="brutal-border border-x-0 border-t-0 bg-bone sticky top-[52px] md:top-[56px] z-30">
      <div className="max-w-5xl mx-auto flex">
        <Link
          href={`/world/${slug}`}
          onClick={() => setLearnMode("flow")}
          className={`flex-1 py-2.5 text-center font-mono text-[10px] uppercase brutal-border border-y-0 border-l-0 brutal-press transition-colors ${
            !showClassic ? "bg-acid text-ink font-bold" : "bg-bone hover:bg-sun"
          }`}
        >
          🗺 Path View
        </Link>
        <Link
          href={`/world/${slug}?view=classic`}
          onClick={() => setLearnMode("classic")}
          className={`flex-1 py-2.5 text-center font-mono text-[10px] uppercase brutal-press transition-colors ${
            showClassic ? "bg-acid text-ink font-bold" : "bg-bone hover:bg-sun"
          }`}
        >
          📋 Classic View
        </Link>
      </div>
    </div>
  );
}
