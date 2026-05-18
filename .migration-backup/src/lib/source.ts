// Continuous looping source feeding into a destination AudioNode.
// Used by every device-lab page so the user always has audio to compare.
import { getCtx } from "./audio";
import { startLoop, type SampleName, type LoopHandle } from "./audio";

export type SourceHandle = {
  source: GainNode;
  setSample: (name: SampleName) => void;
  setBpm: (bpm: number) => void;
  start: () => void;
  stop: () => void;
  isPlaying: () => boolean;
};

export const createSource = (initial: SampleName = "drum-loop", initBpm = 100): SourceHandle => {
  const c = getCtx()!;
  const source = c.createGain();
  source.gain.value = 0.9;
  let handle: LoopHandle | null = null;
  let sample: SampleName = initial;
  let bpm = initBpm;
  const start = () => {
    if (handle) return;
    handle = startLoop(sample, bpm, source);
  };
  const stop = () => { handle?.stop(); handle = null; };
  return {
    source,
    setSample(n) { sample = n; if (handle) { stop(); start(); } },
    setBpm(b) { bpm = b; if (handle) { stop(); start(); } },
    start, stop,
    isPlaying: () => !!handle,
  };
};
