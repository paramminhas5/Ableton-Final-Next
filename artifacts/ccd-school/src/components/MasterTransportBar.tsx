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
    <div aria-hidden className="h-16" />
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-ink text-bone border-t-2 border-bone/20 px-4 py-2.5 flex items-center justify-between gap-3">
      <div className="font-mono text-[11px] uppercase opacity-80">🎧 Best with headphones</div>
      <button onClick={enable} className="bg-acid text-ink px-4 py-2 font-display text-sm brutal-press">▶ SOUND ON</button>
    </div>
    </>
  );
}
