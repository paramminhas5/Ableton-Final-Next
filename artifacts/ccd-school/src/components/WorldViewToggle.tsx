"use client";
// WorldViewToggle — tab switcher between Duolingo Path and Classic views.
import Link from "next/link";

interface Props {
  slug: string;
  showClassic: boolean;
}

export function WorldViewToggle({ slug, showClassic }: Props) {
  return (
    <div className="brutal-border border-x-0 border-t-0 bg-bone sticky top-[52px] md:top-[56px] z-30">
      <div className="max-w-5xl mx-auto flex">
        <Link
          href={`/world/${slug}`}
          className={`flex-1 py-2.5 text-center font-mono text-[10px] uppercase brutal-border border-y-0 border-l-0 brutal-press transition-colors ${
            !showClassic ? "bg-acid text-ink font-bold" : "bg-bone hover:bg-sun"
          }`}
        >
          🗺 Path View
        </Link>
        <Link
          href={`/world/${slug}?view=classic`}
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
