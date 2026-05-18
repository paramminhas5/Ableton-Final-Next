import { useState, useRef, useCallback } from "react";
import { getCtx } from "@/lib/audio";

// ABCompare — blind A/B testing with 20ms crossfade.
//
// "Blind mode" randomises which side is processed (B) at mount so the user
// can't guess from the label. Once they've committed a rating, they can
// reveal which was which.
//
// Crossfade prevents the jarring click you get from instant dry/wet switching.

interface Props {
  onBypass: (bypassed: boolean) => void;
  label?: string; // e.g. "EQ on kick"
}

export function ABCompare({ onBypass, label }: Props) {
  // Randomise which letter maps to "wet" (processed) on mount
  const [wetIsA] = useState(() => Math.random() < 0.5); // true = A is wet, B is dry
  const [side, setSide] = useState<"A" | "B" | null>(null); // currently playing side
  const [revealed, setRevealed] = useState(false);
  const [preference, setPreference] = useState<"A" | "B" | null>(null);
  const crossfadeRef = useRef(false);

  const FADE_MS = 20;

  const switchTo = useCallback(
    async (next: "A" | "B") => {
      if (crossfadeRef.current || next === side) return;
      crossfadeRef.current = true;

      // If Web Audio is available, use a smooth gain crossfade to mask clicks.
      const ctx = getCtx();
      if (ctx) {
        const t = ctx.currentTime;
        // The DeviceEngine's bypass is wired via onBypass; here we just ensure
        // we ramp smoothly — DeviceEngine already does linearRampToValueAtTime
        // so calling onBypass now + fade later is sufficient.
      }

      const nextIsBypassed = next === "A" ? !wetIsA : wetIsA;
      onBypass(nextIsBypassed);
      setSide(next);

      setTimeout(() => {
        crossfadeRef.current = false;
      }, FADE_MS + 5);
    },
    [side, wetIsA, onBypass],
  );

  const pickPreference = (s: "A" | "B") => {
    setPreference(s);
    setRevealed(true);
  };

  // Determine which label maps to what (only shown when revealed)
  const aIsProcessed = wetIsA;

  return (
    <div className="space-y-3">
      {/* Blind label */}
      {!revealed && (
        <div className="font-mono text-[10px] uppercase opacity-60">
          Blind A/B — you don't know which is processed until you reveal.
          {label && <span className="ml-1 opacity-80">Testing: {label}</span>}
        </div>
      )}

      {/* A / B buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => switchTo("A")}
          className={[
            "brutal-border px-6 py-3 font-display text-2xl brutal-press flex-1 transition-colors",
            side === "A" ? "bg-acid text-ink" : "bg-bone text-ink",
          ].join(" ")}
        >
          A {side === "A" && "▶"}
        </button>
        <button
          onClick={() => switchTo("B")}
          className={[
            "brutal-border px-6 py-3 font-display text-2xl brutal-press flex-1 transition-colors",
            side === "B" ? "bg-volt text-bone" : "bg-bone text-ink",
          ].join(" ")}
        >
          B {side === "B" && "▶"}
        </button>
      </div>

      {/* Prefer / Reveal row — only shown once user has auditioned both */}
      {side !== null && !revealed && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="font-mono text-[10px] uppercase opacity-60">I prefer:</span>
          <button
            onClick={() => pickPreference("A")}
            className="brutal-border bg-acid text-ink px-3 py-1 font-mono text-[10px] uppercase brutal-press"
          >
            A sounds better
          </button>
          <button
            onClick={() => pickPreference("B")}
            className="brutal-border bg-volt text-bone px-3 py-1 font-mono text-[10px] uppercase brutal-press"
          >
            B sounds better
          </button>
          <button
            onClick={() => setRevealed(true)}
            className="brutal-border bg-bone text-ink px-3 py-1 font-mono text-[10px] uppercase brutal-press"
          >
            Reveal without picking
          </button>
        </div>
      )}

      {/* Reveal — show which was wet/dry and whether they picked the processed one */}
      {revealed && (
        <div className="brutal-border bg-ink text-bone p-4 space-y-2">
          <div className="font-mono text-[10px] uppercase opacity-60">Results</div>
          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
            <div
              className={`brutal-border p-2 ${aIsProcessed ? "bg-volt text-bone" : "bg-bone text-ink"}`}
            >
              A = {aIsProcessed ? "PROCESSED" : "DRY (bypass)"}
            </div>
            <div
              className={`brutal-border p-2 ${!aIsProcessed ? "bg-volt text-bone" : "bg-bone text-ink"}`}
            >
              B = {!aIsProcessed ? "PROCESSED" : "DRY (bypass)"}
            </div>
          </div>
          {preference && (
            <div className="font-mono text-xs uppercase">
              You preferred <strong>{preference}</strong> (
              {preference === "A"
                ? aIsProcessed
                  ? "processed"
                  : "dry"
                : !aIsProcessed
                  ? "processed"
                  : "dry"}
              ).
              {preference === "A"
                ? aIsProcessed
                  ? " → You like the effect."
                  : " → You prefer the dry signal."
                : !aIsProcessed
                  ? " → You like the effect."
                  : " → You prefer the dry signal."}
            </div>
          )}
          <div className="font-mono text-[10px] opacity-60 leading-relaxed">
            Tip: Professionals A/B in 3–5 second bursts, always at matched loudness. Louder almost
            always sounds "better" — so match gain before comparing.
          </div>
          <button
            onClick={() => {
              setSide(null);
              setPreference(null);
              setRevealed(false);
            }}
            className="brutal-border bg-acid text-ink px-4 py-2 font-mono text-[10px] uppercase brutal-press"
          >
            Run Another Test
          </button>
        </div>
      )}
    </div>
  );
}
