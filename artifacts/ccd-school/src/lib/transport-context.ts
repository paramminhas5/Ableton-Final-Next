// Global transport — shared play/stop/BPM across all device pages
import { createContext, useContext } from 'react';

export type TransportState = {
  playing: boolean;
  bpm: number;
  sample: 'drum-loop' | 'bass-loop' | 'chord-pad' | 'vox-chop' | 'full-mix';
};

export type TransportActions = {
  togglePlay: () => void;
  setBpm: (bpm: number) => void;
  setSample: (sample: TransportState['sample']) => void;
};

export const TransportContext = createContext<(TransportState & TransportActions) | null>(null);

export const useTransport = () => {
  const ctx = useContext(TransportContext);
  if (!ctx) throw new Error('useTransport must be within TransportProvider');
  return ctx;
};
