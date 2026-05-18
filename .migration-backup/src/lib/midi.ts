// Web MIDI hook — wires a physical MIDI controller to in-browser callbacks.
// Works in Chrome/Edge (95%+ desktop market share). Firefox unsupported.
//
// Usage:
//   const { connected, inputs } = useMidi({ onNoteOn, onNoteOff });

import { useEffect, useState } from "react";

export type MidiNoteHandler = (note: number, velocity: number, channel: number) => void;

export interface MidiOptions {
  onNoteOn?: MidiNoteHandler;
  onNoteOff?: MidiNoteHandler;
  onCC?: (cc: number, value: number, channel: number) => void;
}

export function useMidi({ onNoteOn, onNoteOff, onCC }: MidiOptions = {}) {
  const [supported] = useState(
    () => typeof navigator !== "undefined" && "requestMIDIAccess" in navigator,
  );
  const [connected, setConnected] = useState(false);
  const [inputNames, setInputNames] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supported) return;
    let access: MIDIAccess | null = null;

    const handleMsg = (e: MIDIMessageEvent) => {
      const data = e.data ? Array.from(e.data) : [];
      const [status, note, vel] = data;
      const type = status & 0xf0;
      const channel = status & 0x0f;
      if (type === 0x90 && vel > 0) onNoteOn?.(note, vel, channel);
      else if (type === 0x80 || (type === 0x90 && vel === 0)) onNoteOff?.(note, vel, channel);
      else if (type === 0xb0) onCC?.(note, vel, channel);
    };

    const wire = (a: MIDIAccess) => {
      access = a;
      const names: string[] = [];
      a.inputs.forEach((input) => {
        input.onmidimessage = handleMsg as any;
        names.push(input.name ?? "Unknown device");
      });
      setInputNames(names);
      setConnected(names.length > 0);
    };

    const onStateChange = () => {
      if (access) wire(access);
    };

    navigator
      .requestMIDIAccess({ sysex: false })
      .then((a) => {
        wire(a);
        a.onstatechange = onStateChange;
      })
      .catch((err) => setError(err?.message ?? "MIDI access denied"));

    return () => {
      access?.inputs.forEach((input) => {
        input.onmidimessage = null;
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { supported, connected, inputNames, error };
}
