"use client";
/**
 * ExerciseScreens — new exercise types for the LessonPlayer.
 *
 * AudioIdScreen    — hear → identify (replaces MCQ for audio-based concepts)
 * MatchScreen      — tap pairs to match (term ↔ definition)
 * TypeAnswerScreen — free-text input with fuzzy/exact matching
 * SequenceScreen   — arrange items in correct order
 *
 * All follow the same contract:
 *   onCorrect() — called when the answer is correct
 *   onWrong()   — called when wrong (may be called multiple times for match/sequence)
 *   onNext()    — called to advance to the next screen
 */
import { useState, useEffect, useRef, useCallback } from "react";
import type { LessonScreen } from "@/content/types";
import { playCorrect, playWrong, ensureAudio } from "@/lib/audio";
import { ConceptAudioButton } from "@/components/ConceptAudio";

// ─── AudioIdScreen ────────────────────────────────────────────────────────────

export function AudioIdScreen({
  screen,
  isFlowMode,
  onCorrect,
  onWrong,
  onNext,
}: {
  screen: Extract<LessonScreen, { kind: "audio-id" }>;
  isFlowMode: boolean;
  onCorrect: () => void;
  onWrong: () => void;
  onNext: () => void;
}) {
  const [phase, setPhase] = useState<"listening" | "picking" | "correct" | "wrong">("listening");
  const [picked, setPicked] = useState<number | null>(null);
  const [hasListened, setHasListened] = useState(false);

  const pick = (idx: number) => {
    if (phase !== "picking") return;
    setPicked(idx);
    if (idx === screen.answer) {
      setPhase("correct");
      playCorrect();
      onCorrect();
    } else {
      setPhase("wrong");
      playWrong();
      onWrong();
    }
  };

  return (
    <div className="space-y-4">
      {/* Prompt */}
      <div className="brutal-border bg-ink text-bone p-5">
        <div className="font-mono text-[10px] uppercase opacity-60 mb-2">🎧 LISTEN FIRST</div>
        <div className="font-display text-xl md:text-2xl leading-snug">{screen.prompt}</div>
      </div>

      {/* Audio play button */}
      <div className="brutal-border bg-bone p-4 flex flex-col items-center gap-3">
        <ConceptAudioButton
          visual={screen.audioType as Parameters<typeof ConceptAudioButton>[0]["visual"]}
          label="PLAY AUDIO EXAMPLE"
        />
        {!hasListened && (
          <button
            onClick={() => { setHasListened(true); setPhase("picking"); }}
            className="font-mono text-[9px] uppercase opacity-40 hover:opacity-70 underline"
          >
            skip → answer anyway
          </button>
        )}
        {!hasListened && (
          <div className="font-mono text-[9px] uppercase opacity-40 text-center">
            Play the audio above, then choose your answer
          </div>
        )}
        {!hasListened && (
          // Auto-reveal answer buttons after first play
          <button
            onClick={() => { setHasListened(true); setPhase("picking"); }}
            className="w-full brutal-border bg-acid text-ink py-3 font-display text-xl brutal-press mt-1"
          >
            I&apos;VE LISTENED — SHOW ANSWERS →
          </button>
        )}
      </div>

      {/* Answer options — only shown after listening */}
      {phase !== "listening" && (
        <div className="grid sm:grid-cols-2 gap-2">
          {screen.options.map((opt, i) => {
            let cls = "bg-bone hover:bg-sun/40 brutal-press cursor-pointer";
            if (phase === "correct" || phase === "wrong") {
              if (i === screen.answer) cls = "bg-acid text-ink font-bold";
              else if (i === picked && phase === "wrong") cls = "bg-hot text-bone";
              else cls = "bg-bone opacity-40 cursor-default";
            }
            return (
              <button
                key={i}
                onClick={() => pick(i)}
                disabled={phase !== "picking"}
                aria-label={`Option ${String.fromCharCode(65 + i)}: ${opt}`}
                className={`brutal-border px-4 py-4 text-left font-mono text-sm transition-colors ${cls}`}
              >
                <span className="opacity-40 mr-2">{String.fromCharCode(65 + i)}.</span>
                {opt}
                {(phase === "correct" || phase === "wrong") && i === screen.answer && <span className="ml-2">✓</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Feedback */}
      {(phase === "correct" || phase === "wrong") && (
        <>
          <div
            className={`brutal-border p-4 ${phase === "correct" ? "bg-volt text-bone" : "bg-hot text-bone"}`}
            role="alert"
            aria-live="polite"
          >
            <div className="font-display text-2xl mb-1">
              {phase === "correct" ? "✓ CORRECT!" : "✗ NOT QUITE"}
            </div>
            {phase === "wrong" && (
              <div className="font-mono text-xs opacity-80 mb-1">
                Correct: <strong>{screen.options[screen.answer]}</strong>
                {isFlowMode && <span className="ml-2 opacity-70">−1 heart</span>}
              </div>
            )}
            <div className="font-mono text-sm leading-relaxed border-t border-current/20 pt-2 mt-1">
              {screen.explain}
            </div>
          </div>
          <button
            onClick={onNext}
            className="w-full brutal-border bg-acid text-ink py-4 font-display text-2xl brutal-press brutal-shadow"
          >
            NEXT →
          </button>
        </>
      )}
    </div>
  );
}


// ─── MatchScreen ──────────────────────────────────────────────────────────────

type MatchPair = { left: string; right: string };

export function MatchScreen({
  screen,
  onCorrect,
  onWrong,
  onNext,
}: {
  screen: Extract<LessonScreen, { kind: "match" }>;
  onCorrect: () => void;
  onWrong: () => void;
  onNext: () => void;
}) {
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<Record<number, number>>({}); // leftIdx → rightIdx
  const [wrongFlash, setWrongFlash] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [mistakes, setMistakes] = useState(0);

  // Shuffle right column once on mount
  const rightOrder = useRef<number[]>(
    screen.pairs.map((_, i) => i).sort(() => Math.random() - 0.5)
  );

  const allMatched = Object.keys(matched).length === screen.pairs.length;

  useEffect(() => {
    if (allMatched && !done) {
      setDone(true);
      playCorrect();
      onCorrect();
    }
  }, [allMatched, done, onCorrect]);

  const handleLeft = (i: number) => {
    if (matched[i] !== undefined) return; // already matched
    setSelectedLeft(i);
  };

  const handleRight = (rightShuffledIdx: number) => {
    if (selectedLeft === null) return;
    const rightOrigIdx = rightOrder.current[rightShuffledIdx];
    if (Object.values(matched).includes(rightShuffledIdx)) return; // already used

    if (rightOrigIdx === selectedLeft) {
      // Correct!
      setMatched(m => ({ ...m, [selectedLeft]: rightShuffledIdx }));
      setSelectedLeft(null);
      playCorrect();
    } else {
      // Wrong
      setMistakes(n => n + 1);
      setWrongFlash(rightShuffledIdx);
      setTimeout(() => setWrongFlash(null), 500);
      playWrong();
      onWrong();
      setSelectedLeft(null);
    }
  };

  const matchedRightIndices = new Set(Object.values(matched));

  return (
    <div className="space-y-4">
      <div className="brutal-border bg-ink text-bone p-4">
        <div className="font-mono text-[10px] uppercase opacity-60 mb-1">MATCH THE PAIRS</div>
        <div className="font-display text-xl">{screen.prompt}</div>
      </div>

      <div className="font-mono text-[9px] uppercase opacity-50 text-center">
        {allMatched
          ? `✓ All matched! ${mistakes > 0 ? `(${mistakes} mistake${mistakes > 1 ? "s" : ""})` : "Perfect!"}`
          : "Tap a left item, then its matching right item"}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Left column */}
        <div className="space-y-2">
          {screen.pairs.map((pair, i) => {
            const isMatched = matched[i] !== undefined;
            const isSelected = selectedLeft === i;
            return (
              <button
                key={i}
                onClick={() => !isMatched && handleLeft(i)}
                disabled={isMatched}
                className={`w-full brutal-border px-3 py-3 text-left font-mono text-sm transition-all brutal-press
                  ${isMatched ? "bg-acid text-ink opacity-70 cursor-default" :
                    isSelected ? "bg-volt text-bone" :
                    "bg-bone hover:bg-sun/30"}`}
                aria-pressed={isSelected}
                aria-label={`Left item: ${pair.left}${isMatched ? " (matched)" : ""}`}
              >
                {isMatched && <span className="mr-1">✓ </span>}
                {pair.left}
              </button>
            );
          })}
        </div>

        {/* Right column (shuffled) */}
        <div className="space-y-2">
          {rightOrder.current.map((origIdx, shuffledIdx) => {
            const pair = screen.pairs[origIdx];
            const isMatched = matchedRightIndices.has(shuffledIdx);
            const isWrong = wrongFlash === shuffledIdx;
            return (
              <button
                key={shuffledIdx}
                onClick={() => !isMatched && handleRight(shuffledIdx)}
                disabled={isMatched}
                className={`w-full brutal-border px-3 py-3 text-left font-mono text-sm transition-all brutal-press
                  ${isMatched ? "bg-acid text-ink opacity-70 cursor-default" :
                    isWrong ? "bg-hot text-bone" :
                    "bg-bone hover:bg-sun/30"}`}
                aria-label={`Right item: ${pair.right}${isMatched ? " (matched)" : ""}`}
              >
                {isMatched && <span className="mr-1">✓ </span>}
                {pair.right}
              </button>
            );
          })}
        </div>
      </div>

      {allMatched && (
        <button
          onClick={onNext}
          className="w-full brutal-border bg-acid text-ink py-4 font-display text-2xl brutal-press brutal-shadow"
          aria-label="Continue to next screen"
        >
          NEXT →
        </button>
      )}
    </div>
  );
}


// ─── TypeAnswerScreen ─────────────────────────────────────────────────────────

export function TypeAnswerScreen({
  screen,
  isFlowMode,
  onCorrect,
  onWrong,
  onNext,
}: {
  screen: Extract<LessonScreen, { kind: "type-answer" }>;
  isFlowMode: boolean;
  onCorrect: () => void;
  onWrong: () => void;
  onNext: () => void;
}) {
  const [value, setValue] = useState("");
  const [phase, setPhase] = useState<"typing" | "correct" | "wrong">("typing");
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const normalise = (s: string) => {
    const t = s.trim();
    return screen.caseSensitive ? t : t.toLowerCase();
  };

  const submit = useCallback(() => {
    if (!value.trim()) return;
    const norm = normalise(value);
    const isCorrect = screen.acceptableAnswers.some(a => normalise(a) === norm);
    if (isCorrect) {
      setPhase("correct");
      playCorrect();
      onCorrect();
    } else {
      setPhase("wrong");
      playWrong();
      onWrong();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, screen.acceptableAnswers, screen.caseSensitive, onCorrect, onWrong]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && phase === "typing") submit();
  };

  const isAnswered = phase !== "typing";

  return (
    <div className="space-y-4">
      <div className="brutal-border bg-bone p-5">
        <div className="font-display text-xl md:text-2xl leading-snug">{screen.q}</div>
      </div>

      <div className="space-y-2">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isAnswered}
          placeholder="Type your answer…"
          className={`w-full brutal-border bg-bone px-4 py-4 font-mono text-base outline-none transition-colors
            ${isAnswered ? "opacity-60" : "focus:border-acid"}
            ${phase === "correct" ? "border-acid" : phase === "wrong" ? "border-hot" : ""}`}
          aria-label="Your answer"
          autoComplete="off"
          spellCheck={false}
        />

        {!isAnswered && screen.hint && !showHint && (
          <button
            onClick={() => setShowHint(true)}
            className="font-mono text-[10px] uppercase opacity-40 hover:opacity-70 underline"
          >
            Stuck? See a hint
          </button>
        )}

        {showHint && screen.hint && (
          <div className="brutal-border bg-sun/30 px-4 py-3 font-mono text-xs leading-relaxed">
            <span className="uppercase font-bold mr-2 opacity-60">Hint</span>
            {screen.hint}
          </div>
        )}
      </div>

      {phase === "typing" && (
        <button
          onClick={submit}
          disabled={!value.trim()}
          className="w-full brutal-border bg-acid text-ink py-4 font-display text-2xl brutal-press brutal-shadow disabled:opacity-30"
          aria-label="Submit answer"
        >
          CHECK ANSWER →
        </button>
      )}

      {isAnswered && (
        <>
          <div
            className={`brutal-border p-4 ${phase === "correct" ? "bg-volt text-bone" : "bg-hot text-bone"}`}
            role="alert"
            aria-live="polite"
          >
            <div className="font-display text-2xl mb-1">
              {phase === "correct" ? "✓ CORRECT!" : "✗ NOT QUITE"}
            </div>
            {phase === "wrong" && (
              <div className="font-mono text-xs opacity-80 mb-1">
                Accepted: <strong>{screen.acceptableAnswers[0]}</strong>
                {isFlowMode && <span className="ml-2 opacity-70">−1 heart</span>}
              </div>
            )}
            <div className="font-mono text-sm leading-relaxed border-t border-current/20 pt-2 mt-1">
              {screen.explain}
            </div>
          </div>
          <button
            onClick={onNext}
            className="w-full brutal-border bg-acid text-ink py-4 font-display text-2xl brutal-press brutal-shadow"
          >
            NEXT →
          </button>
        </>
      )}
    </div>
  );
}


// ─── SequenceScreen ───────────────────────────────────────────────────────────

export function SequenceScreen({
  screen,
  onCorrect,
  onWrong,
  onNext,
}: {
  screen: Extract<LessonScreen, { kind: "sequence" }>;
  onCorrect: () => void;
  onWrong: () => void;
  onNext: () => void;
}) {
  // Shuffle items once on mount, keeping track of original indices
  const shuffled = useRef<number[]>(
    screen.items.map((_, i) => i).sort(() => Math.random() - 0.5)
  );

  const [order, setOrder] = useState<number[]>(shuffled.current);
  const [phase, setPhase] = useState<"arranging" | "correct" | "wrong">("arranging");
  const [dragging, setDragging] = useState<number | null>(null);

  const check = () => {
    const isCorrect = order.every((origIdx, pos) => origIdx === pos);
    if (isCorrect) {
      setPhase("correct");
      playCorrect();
      onCorrect();
    } else {
      setPhase("wrong");
      playWrong();
      onWrong();
    }
  };

  const moveUp = (pos: number) => {
    if (pos === 0) return;
    setOrder(o => {
      const next = [...o];
      [next[pos - 1], next[pos]] = [next[pos], next[pos - 1]];
      return next;
    });
  };

  const moveDown = (pos: number) => {
    if (pos === order.length - 1) return;
    setOrder(o => {
      const next = [...o];
      [next[pos], next[pos + 1]] = [next[pos + 1], next[pos]];
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="brutal-border bg-ink text-bone p-4">
        <div className="font-mono text-[10px] uppercase opacity-60 mb-1">PUT IN ORDER</div>
        <div className="font-display text-xl">{screen.prompt}</div>
      </div>

      <div className="font-mono text-[9px] uppercase opacity-50 text-center">
        Use ↑ ↓ to arrange · then tap CHECK ORDER
      </div>

      <div className="space-y-2" role="list" aria-label="Items to order">
        {order.map((origIdx, pos) => (
          <div
            key={origIdx}
            className={`brutal-border flex items-center gap-3 px-4 py-3 bg-bone transition-all
              ${phase === "correct" && origIdx === pos ? "border-acid" : ""}
              ${phase === "wrong" && origIdx !== pos ? "border-hot" : ""}`}
            role="listitem"
          >
            <span className="font-mono text-[10px] opacity-40 w-4 shrink-0">{pos + 1}.</span>
            <span className="flex-1 font-mono text-sm">{screen.items[origIdx]}</span>
            {phase === "arranging" && (
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => moveUp(pos)}
                  disabled={pos === 0}
                  className="brutal-border bg-bone px-2 py-1 font-mono text-xs brutal-press disabled:opacity-20"
                  aria-label={`Move "${screen.items[origIdx]}" up`}
                >
                  ↑
                </button>
                <button
                  onClick={() => moveDown(pos)}
                  disabled={pos === order.length - 1}
                  className="brutal-border bg-bone px-2 py-1 font-mono text-xs brutal-press disabled:opacity-20"
                  aria-label={`Move "${screen.items[origIdx]}" down`}
                >
                  ↓
                </button>
              </div>
            )}
            {phase !== "arranging" && (
              <span className={origIdx === pos ? "text-acid" : "text-hot"}>
                {origIdx === pos ? "✓" : "✗"}
              </span>
            )}
          </div>
        ))}
      </div>

      {phase === "arranging" && (
        <button
          onClick={check}
          className="w-full brutal-border bg-acid text-ink py-4 font-display text-2xl brutal-press brutal-shadow"
          aria-label="Check your order"
        >
          CHECK ORDER →
        </button>
      )}

      {phase !== "arranging" && (
        <>
          <div
            className={`brutal-border p-4 ${phase === "correct" ? "bg-volt text-bone" : "bg-hot text-bone"}`}
            role="alert"
            aria-live="polite"
          >
            <div className="font-display text-2xl mb-1">
              {phase === "correct" ? "✓ CORRECT ORDER!" : "✗ NOT QUITE"}
            </div>
            <div className="font-mono text-sm leading-relaxed border-t border-current/20 pt-2 mt-1">
              {screen.explain}
            </div>
            {phase === "wrong" && (
              <div className="font-mono text-xs opacity-70 mt-2">
                Correct order: {screen.items.map((item, i) => `${i + 1}. ${item}`).join(" → ")}
              </div>
            )}
          </div>
          <button
            onClick={onNext}
            className="w-full brutal-border bg-acid text-ink py-4 font-display text-2xl brutal-press brutal-shadow"
          >
            NEXT →
          </button>
        </>
      )}
    </div>
  );
}
