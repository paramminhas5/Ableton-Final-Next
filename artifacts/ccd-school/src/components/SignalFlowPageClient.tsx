"use client";
import { SignalFlowDiagram, SIMPLE_DEVICE_FLOW } from "@/components/V2_SignalFlowDiagram";

export function SignalFlowPageClient() {
  return (
    <main className="min-h-screen bg-bone">
      <header className="brutal-border border-x-0 border-t-0 bg-acid text-ink">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="font-mono text-[10px] uppercase opacity-40 mb-1">// ABLETON LIVE 12</div>
          <h1 className="font-display text-4xl md:text-6xl leading-none">SIGNAL FLOW</h1>
          <p className="font-mono text-sm mt-2 opacity-70">Visualise audio signal flow in Ableton Live — from source to speaker.</p>
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-4 py-6 pb-24">
        <SignalFlowDiagram diagram={SIMPLE_DEVICE_FLOW} />
      </div>
    </main>
  );
}
