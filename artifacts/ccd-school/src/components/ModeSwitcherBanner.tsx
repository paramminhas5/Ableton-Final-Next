"use client";
/**
 * ModeSwitcherBanner — prominent inline mode toggle shown on /learn, /world/*, /worlds pages.
 *
 * Two variants:
 *   "bar"  — compact horizontal strip (used at page top)
 *   "card" — full comparison card (used on first visit or settings screens)
 */
import { useState } from "react";
import { useLearnMode } from "@/lib/mode";

interface Props {
  variant?: "bar" | "card";
  className?: string;
}

export function ModeSwitcherBanner({ variant = "bar", className = "" }: Props) {
  const { learnMode, setLearnMode } = useLearnMode();
  const isPath = learnMode === "ccd";
  const [justSwitched, setJustSwitched] = useState(false);

  const switchMode = () => {
    setLearnMode(isPath ? "classic" : "ccd");
    setJustSwitched(true);
    setTimeout(() => setJustSwitched(false), 1500);
  };

  if (variant === "card") {
    return (
      <div className={`brutal-border bg-bone brutal-shadow ${className}`}>
        {/* Header */}
        <div className="brutal-border border-x-0 border-t-0 bg-ink text-bone px-5 py-3">
          <div className="font-mono text-[9px] uppercase opacity-50 mb-0.5">// LEARNING MODE</div>
          <div className="font-display text-2xl">
            {isPath ? "🗺 PATH MODE" : "🔓 EXPLORE MODE"}
          </div>
        </div>

        {/* Mode cards side by side */}
        <div className="grid grid-cols-2 gap-0">
          {/* PATH MODE */}
          <button
            onClick={() => !isPath && setLearnMode("ccd")}
            className={`p-5 text-left transition-all brutal-border border-b-0 border-l-0 border-t-0
              ${isPath
                ? "bg-acid text-ink cursor-default"
                : "bg-bone hover:bg-acid/20 cursor-pointer brutal-press"}`}
            aria-pressed={isPath}
          >
            <div className="text-3xl mb-3">🗺</div>
            <div className="font-display text-lg leading-tight mb-2">PATH MODE</div>
            <ul className="space-y-1 font-mono text-[9px] uppercase">
              {[
                { ok: true,  text: "Sequential unlock" },
                { ok: true,  text: "Hearts on errors" },
                { ok: true,  text: "XP gating" },
                { ok: true,  text: "Structured progress" },
              ].map(({ ok, text }) => (
                <li key={text} className={`flex items-center gap-1.5 ${ok ? "opacity-80" : "opacity-40"}`}>
                  <span>{ok ? "✓" : "✗"}</span> {text}
                </li>
              ))}
            </ul>
            {isPath && (
              <div className="mt-3 font-mono text-[9px] uppercase font-bold opacity-70">● ACTIVE</div>
            )}
          </button>

          {/* EXPLORE MODE */}
          <button
            onClick={() => isPath && setLearnMode("classic")}
            className={`p-5 text-left transition-all brutal-border border-b-0 border-r-0 border-t-0
              ${!isPath
                ? "bg-bone text-ink cursor-default border-ink"
                : "bg-bone hover:bg-sun/30 cursor-pointer brutal-press"}`}
            aria-pressed={!isPath}
          >
            <div className="text-3xl mb-3">🔓</div>
            <div className="font-display text-lg leading-tight mb-2">EXPLORE MODE</div>
            <ul className="space-y-1 font-mono text-[9px] uppercase">
              {[
                { ok: true,  text: "All lessons open" },
                { ok: true,  text: "No hearts" },
                { ok: true,  text: "Jump anywhere" },
                { ok: true,  text: "Normal & hard diff." },
              ].map(({ ok, text }) => (
                <li key={text} className={`flex items-center gap-1.5 ${ok ? "opacity-70" : "opacity-30"}`}>
                  <span>{ok ? "✓" : "✗"}</span> {text}
                </li>
              ))}
            </ul>
            {!isPath && (
              <div className="mt-3 font-mono text-[9px] uppercase font-bold opacity-70">● ACTIVE</div>
            )}
          </button>
        </div>

        {/* Switch CTA */}
        <div className="px-5 py-3 flex items-center justify-between gap-3">
          <div className="font-mono text-[9px] uppercase opacity-50 leading-relaxed">
            Switch anytime — progress carries over
          </div>
          <button
            onClick={switchMode}
            className="brutal-border bg-ink text-bone px-4 py-2 font-mono text-[9px] uppercase brutal-press hover:bg-acid hover:text-ink transition-colors shrink-0"
          >
            {justSwitched ? "✓ SWITCHED" : `SWITCH TO ${isPath ? "EXPLORE" : "PATH"} →`}
          </button>
        </div>
      </div>
    );
  }

  // variant === "bar"
  return (
    <div
      className={`brutal-border border-x-0 flex items-center justify-between gap-3 px-4 py-3
        ${isPath ? "bg-acid text-ink" : "bg-bone text-ink border-ink/20"}
        ${className}`}
    >
      {/* Left: mode info */}
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-2xl shrink-0">{isPath ? "🗺" : "🔓"}</span>
        <div className="min-w-0">
          <div className="font-display text-base leading-tight">
            {isPath ? "PATH MODE" : "EXPLORE MODE"}
          </div>
          <div className="font-mono text-[9px] uppercase opacity-60 truncate">
            {isPath
              ? "Sequential · hearts on · XP gated"
              : "All lessons open · no hearts · jump anywhere"}
          </div>
        </div>
      </div>

      {/* Right: switch button */}
      <button
        onClick={switchMode}
        className={`shrink-0 brutal-border px-3 py-1.5 font-mono text-[9px] uppercase brutal-press transition-colors
          ${isPath
            ? "bg-ink text-bone hover:bg-volt hover:text-ink"
            : "bg-bone text-ink hover:bg-acid brutal-border"}`}
      >
        {justSwitched
          ? "✓"
          : `SWITCH TO ${isPath ? "EXPLORE" : "PATH"} →`}
      </button>
    </div>
  );
}
