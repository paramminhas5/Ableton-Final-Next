"use client";
import { Simulator } from "@/components/sims/Simulator";

export function TrainPageClient() {
  return (
    <main className="min-h-screen bg-bone">
      <header className="brutal-border border-x-0 border-t-0 bg-acid text-ink">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="font-mono text-[10px] uppercase opacity-40 mb-1">// EAR TRAINING</div>
          <h1 className="font-display text-4xl md:text-6xl leading-none">TRAIN YOUR EAR</h1>
          <p className="font-mono text-sm mt-2 opacity-70">Intervals, chords, scales. Hear the difference before you produce it.</p>
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-4 py-6 pb-24">
        <Simulator type="ear-training" />
      </div>
    </main>
  );
}
