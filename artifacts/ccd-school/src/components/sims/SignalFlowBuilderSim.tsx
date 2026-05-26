"use client";
// SignalFlowBuilderSim — drag blocks into the correct signal chain order.
// Teaches: Source → Effects → Output flow.
import { useState } from "react";

type Block = { id: string; label: string; icon: string; category: "source" | "effect" | "output" };

const ALL_BLOCKS: Block[] = [
  { id: "mic",        label: "Microphone",  icon: "🎤", category: "source" },
  { id: "instrument", label: "Instrument",  icon: "🎸", category: "source" },
  { id: "eq",         label: "EQ",          icon: "🎛", category: "effect" },
  { id: "compressor", label: "Compressor",  icon: "📊", category: "effect" },
  { id: "reverb",     label: "Reverb",      icon: "🌊", category: "effect" },
  { id: "delay",      label: "Delay",       icon: "🔁", category: "effect" },
  { id: "speakers",   label: "Speakers",    icon: "🔊", category: "output" },
  { id: "headphones", label: "Headphones",  icon: "🎧", category: "output" },
];

type Chain = (Block | null)[];

const SCENARIOS: { title: string; prompt: string; solution: string[]; hint: string }[] = [
  {
    title: "Basic Vocal Chain",
    prompt: "Build: Mic → EQ → Compressor → Reverb → Speakers",
    solution: ["mic","eq","compressor","reverb","speakers"],
    hint: "Source always comes first, output always comes last. EQ before compress — shape then control.",
  },
  {
    title: "Guitar with Delay",
    prompt: "Build: Instrument → EQ → Delay → Speakers",
    solution: ["instrument","eq","delay","speakers"],
    hint: "Guitar is an instrument source. Delay is a time-based effect — usually goes after EQ.",
  },
  {
    title: "Full Mix Bus",
    prompt: "Build: Instrument → Compressor → EQ → Headphones",
    solution: ["instrument","compressor","eq","headphones"],
    hint: "On a mix bus, compress the whole mix first, then EQ the result. Headphones = your output.",
  },
];

export function SignalFlowBuilderSim() {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [chain, setChain] = useState<(Block | null)[]>([null, null, null, null, null]);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [dragging, setDragging] = useState<Block | null>(null);
  const scene = SCENARIOS[sceneIdx];
  const solutionLength = scene.solution.length;

  const availableBlocks = ALL_BLOCKS.filter(
    b => !chain.some(c => c?.id === b.id)
  );

  const dropOnSlot = (idx: number) => {
    if (!dragging) return;
    const newChain = [...chain];
    newChain[idx] = dragging;
    setChain(newChain);
    setDragging(null);
    setChecked(false);
  };

  const removeFromSlot = (idx: number) => {
    const newChain = [...chain];
    newChain[idx] = null;
    setChain(newChain);
    setChecked(false);
  };

  const checkAnswer = () => {
    const filled = chain.slice(0, solutionLength).map(b => b?.id ?? "");
    const isCorrect = scene.solution.every((id, i) => filled[i] === id);
    setChecked(true);
    setCorrect(isCorrect);
  };

  const reset = () => {
    setChain([null, null, null, null, null]);
    setChecked(false);
    setCorrect(false);
  };

  const nextScene = () => {
    setSceneIdx((sceneIdx + 1) % SCENARIOS.length);
    reset();
  };

  return (
    <div className="space-y-4">
      <div className="brutal-border bg-ink text-bone p-4">
        <div className="font-mono text-[10px] uppercase opacity-60">Signal Flow Builder</div>
        <div className="font-display text-xl mt-1">{scene.title}</div>
        <div className="font-mono text-xs mt-1 opacity-70">{scene.prompt}</div>
      </div>

      {/* Available blocks */}
      <div>
        <div className="font-mono text-[10px] uppercase opacity-50 mb-2">Drag blocks into the chain ↓</div>
        <div className="flex flex-wrap gap-2">
          {availableBlocks.map(block => (
            <div
              key={block.id}
              draggable
              onDragStart={() => setDragging(block)}
              onDragEnd={() => setDragging(null)}
              onClick={() => {
                // On mobile: tap to place in first empty slot
                const firstEmpty = chain.findIndex(c => c === null);
                if (firstEmpty !== -1) {
                  const newChain = [...chain];
                  newChain[firstEmpty] = block;
                  setChain(newChain);
                  setChecked(false);
                }
              }}
              className={`brutal-border px-3 py-2 font-mono text-xs uppercase cursor-grab select-none brutal-press
                ${block.category === "source" ? "bg-acid text-ink" : block.category === "output" ? "bg-ink text-bone" : "bg-volt text-bone"}
                ${dragging?.id === block.id ? "opacity-40" : ""}
              `}
            >
              {block.icon} {block.label}
            </div>
          ))}
          {availableBlocks.length === 0 && (
            <div className="font-mono text-[10px] opacity-40 uppercase">All blocks placed ↓</div>
          )}
        </div>
      </div>

      {/* Chain slots */}
      <div>
        <div className="font-mono text-[10px] uppercase opacity-50 mb-2">Your chain (left = first in signal path)</div>
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {Array.from({ length: solutionLength }).map((_, idx) => {
            const block = chain[idx];
            const slotCorrect = checked && block?.id === scene.solution[idx];
            const slotWrong = checked && block !== null && block.id !== scene.solution[idx];
            return (
              <div key={idx} className="flex items-center gap-1 shrink-0">
                <div
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => dropOnSlot(idx)}
                  onClick={() => block && removeFromSlot(idx)}
                  className={`brutal-border w-20 h-20 flex flex-col items-center justify-center cursor-pointer select-none transition-all
                    ${block ? "bg-bone" : "bg-bone/40 border-dashed"}
                    ${slotCorrect ? "bg-acid text-ink outline outline-2 outline-acid" : ""}
                    ${slotWrong ? "bg-hot text-bone" : ""}
                  `}
                  title={block ? "Click to remove" : "Drop here"}
                >
                  {block ? (
                    <>
                      <div className="text-2xl">{block.icon}</div>
                      <div className="font-mono text-[8px] uppercase mt-1 text-center leading-tight">{block.label}</div>
                      {slotCorrect && <div className="text-[10px]">✓</div>}
                      {slotWrong && <div className="text-[10px]">✗</div>}
                    </>
                  ) : (
                    <div className="font-mono text-[10px] uppercase opacity-30">{idx + 1}</div>
                  )}
                </div>
                {idx < solutionLength - 1 && (
                  <div className="font-display text-xl opacity-40 shrink-0">→</div>
                )}
              </div>
            );
          })}
        </div>
        <div className="font-mono text-[9px] opacity-40 mt-1">Tap a placed block to remove it</div>
      </div>

      {/* Check / result */}
      {!checked ? (
        <button onClick={checkAnswer}
          disabled={chain.slice(0, solutionLength).some(c => c === null)}
          className="brutal-border bg-acid text-ink px-5 py-3 font-display text-xl brutal-press w-full disabled:opacity-40"
        >
          CHECK CHAIN →
        </button>
      ) : (
        <div className={`brutal-border p-4 ${correct ? "bg-acid text-ink" : "bg-hot text-bone"}`}>
          <div className="font-display text-2xl">{correct ? "✓ PERFECT SIGNAL FLOW!" : "✗ NOT QUITE"}</div>
          {!correct && (
            <div className="font-mono text-xs mt-1 opacity-80">{scene.hint}</div>
          )}
          <div className="flex gap-2 mt-3">
            <button onClick={reset} className="brutal-border bg-bone text-ink px-4 py-2 font-mono text-xs uppercase brutal-press">
              ↺ Retry
            </button>
            {correct && (
              <button onClick={nextScene} className="brutal-border bg-ink text-bone px-4 py-2 font-mono text-xs uppercase brutal-press">
                Next Scenario →
              </button>
            )}
          </div>
        </div>
      )}

      <div className="brutal-border bg-sun/20 p-3 font-mono text-xs leading-relaxed">
        <strong>Rule:</strong> Signal always flows Source → Effects → Output. 
        The order of effects matters — EQ before compression sounds different to compression before EQ.
      </div>
    </div>
  );
}
