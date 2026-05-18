"use client";
import { Simulator } from "@/components/sims/Simulator";

export function MatchPageClient() {
  return (
    <main className="min-h-screen bg-bone">
      <header className="brutal-border border-x-0 border-t-0 bg-hot text-bone">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="font-mono text-[10px] uppercase opacity-40 mb-1">// MIX MATCH</div>
          <h1 className="font-display text-4xl md:text-6xl leading-none">MIX MATCH</h1>
          <p className="font-mono text-sm mt-2 opacity-70">Listen and identify the processing chain. Train your ears like a pro.</p>
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-4 py-6 pb-24">
        <Simulator type="comp-lake" />
      </div>
    </main>
  );
}
