import { useEffect, useState } from "react";
import { ensureAudio, getCtx } from "@/lib/audio";

// Mobile Safari requires a user gesture to start AudioContext. Show an
// overlay until ctx.state === 'running'. Renders nothing once unlocked.
export function AudioUnlock() {
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const c = getCtx();
    if (!c) return;
    setLocked(c.state !== "running");
    const onState = () => setLocked(c.state !== "running");
    c.addEventListener("statechange", onState);
    return () => c.removeEventListener("statechange", onState);
  }, []);

  if (!locked) return null;
  const unlock = async () => {
    const ok = await ensureAudio();
    if (ok) setLocked(false);
  };
  return (
    <button
      onClick={unlock}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/85 text-bone font-mono uppercase text-sm"
    >
      <span className="brutal-border bg-acid text-ink px-6 py-4 brutal-shadow">
        ▶ Tap to enable audio
      </span>
    </button>
  );
}
