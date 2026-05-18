"use client";
import { useState } from "react";
import { Simulator } from "@/components/sims/Simulator";
import { SIM_LIST } from "@/components/sims/Simulator";
import type { SimType } from "@/content/types";

export function PlaygroundPageClient() {
  const [activeSim, setActiveSim] = useState<SimType>("drum-pad");
  return (
    <main className="min-h-screen bg-bone">
      <header className="brutal-border border-x-0 border-t-0 bg-volt text-bone">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="font-mono text-[10px] uppercase opacity-50 mb-1">// WORKBENCH</div>
          <h1 className="font-display text-4xl md:text-6xl leading-none">FREE PLAY</h1>
          <p className="font-mono text-sm mt-2 opacity-70">Explore all {SIM_LIST.length} simulators. No quiz. No pressure. Just learn by doing.</p>
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-4 py-6 pb-24">
        <div className="flex flex-wrap gap-1.5 mb-6">
          {SIM_LIST.map(({ type, label, color }) => (
            <button key={type} onClick={() => setActiveSim(type as SimType)}
              className={`brutal-border px-3 py-2 font-mono text-[10px] uppercase brutal-press transition-all ${activeSim === type ? `${color} font-bold` : "bg-bone hover:bg-sun"}`}>
              {label}
            </button>
          ))}
        </div>
        <Simulator key={activeSim} type={activeSim as SimType} />
      </div>
    </main>
  );
}
