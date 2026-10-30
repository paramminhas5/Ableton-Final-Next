"use client";
// Master bar — audio unlock prompt ONLY.
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

  const enable = async () => {
    const ok = await ensureAudio();
    setUnlocked(ok || isAudioUnlocked());
  };

  if (unlocked) return null;

  return (
    <>
    {/* keeps the last buttons on a page scrollable above the banner */}
    <div aria-hidden className="h-28 md:h-20" />
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-hot text-bone brutal-border border-x-0 border-b-0 p-3 flex items-center justify-between gap-3">
      <div className="font-mono text-[11px] uppercase">🎧 Headphones recommended — click to enable audio (each device & sim has its own ▶ play button)</div>
      <button onClick={enable} className="brutal-border bg-acid text-ink px-4 py-2 font-display brutal-press">▶ ENABLE AUDIO</button>
    </div>
    </>
  );
}
