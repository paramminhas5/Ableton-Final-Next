"use client";
// Audio unlock. Listens for the first tap or key press; shows nothing.
// Each device / sim owns its own play button & audio path; no shared transport.
import { useEffect, useState } from 'react';
import { ensureAudio, isAudioUnlocked, onAudioUnlocked } from '@/lib/audio';

export function MasterTransportBar() {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    setUnlocked(isAudioUnlocked());
    return onAudioUnlocked(() => setUnlocked(true));
  }, []);

  // Any first tap or key press counts as the gesture browsers want, so the banner goes away on its own.
  useEffect(() => {
    if (unlocked) return;
    const go = () => { void ensureAudio().then((ok) => setUnlocked(ok || isAudioUnlocked())); };
    window.addEventListener("pointerup", go, { once: true, passive: true });
    window.addEventListener("keydown", go, { once: true });
    return () => { window.removeEventListener("pointerup", go); window.removeEventListener("keydown", go); };
  }, [unlocked]);

  // Model 1: no banner. Every play key unlocks audio itself, and the first tap anywhere does too.
  return null;
}
