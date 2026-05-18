// TransportProvider - Manages global audio playback state
// Place in: src/components/TransportProvider.tsx

import { useEffect, useRef, useState } from 'react';
import { TransportContext, type TransportState } from '@/lib/transport-context';
import { createSource, type SourceHandle } from '@/lib/source';

export function TransportProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TransportState>({
    playing: false,
    bpm: 100,
    sample: 'drum-loop',
  });

  const sourceRef = useRef<SourceHandle | null>(null);

  // Initialize source on mount
  useEffect(() => {
    const source = createSource(state.sample, state.bpm);
    sourceRef.current = source;

    return () => {
      source.stop();
      sourceRef.current = null;
    };
  }, []);

  // Update source when BPM changes
  useEffect(() => {
    if (sourceRef.current) {
      sourceRef.current.setBpm(state.bpm);
    }
  }, [state.bpm]);

  // Update source when sample changes
  useEffect(() => {
    if (sourceRef.current) {
      sourceRef.current.setSample(state.sample);
    }
  }, [state.sample]);

  const togglePlay = () => {
    if (!sourceRef.current) {
      const source = createSource(state.sample, state.bpm);
      sourceRef.current = source;
    }

    if (state.playing) {
      sourceRef.current.stop();
      setState((prev) => ({ ...prev, playing: false }));
    } else {
      sourceRef.current.start();
      setState((prev) => ({ ...prev, playing: true }));
    }
  };

  const setBpm = (bpm: number) => {
    setState((prev) => ({ ...prev, bpm }));
  };

  const setSample = (sample: TransportState['sample']) => {
    setState((prev) => ({ ...prev, sample }));
  };

  const value = {
    ...state,
    togglePlay,
    setBpm,
    setSample,
  };

  return (
    <TransportContext.Provider value={value}>
      {children}
    </TransportContext.Provider>
  );
}
