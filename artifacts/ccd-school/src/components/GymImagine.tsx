"use client";
/**
 * The ear gym's "imagine it first" drill (Building Blocks' Mind's Ear; src/lib/imagine.ts makeImagineQuestion):
 * the notes of a one-bar beat, bass line, chord progression or melody show on the grid with no sound; the
 * learner hums it, then plays two or three phrases and picks the one they saw. The first pick counts in the
 * gym's streaks; either way the right one then plays under the notes. Same pieces as the lesson step
 * (src/components/m1/ImagineEar.tsx).
 */
import { useMemo, useRef } from "react";
import { MAX_LEVEL } from "@/lib/gym/engine";
import type { ImagineQuestion } from "@/lib/imagine";
import { emptyTrackV2, type TrackV2 } from "@/lib/track2";
import { keyName } from "@/lib/theory";
import { CopyGrid } from "@/components/m1/CopyEar";
import { Counts, ImagineOptions, useImagine } from "@/components/m1/ImagineEar";
import { GoPill, Icon, Key, Screen, Silk } from "@/components/m1/controls";

export function GymImagine({ q, level, count, feedback, onAnswer, onEnd, onNext, timeUp }: {
  q: ImagineQuestion; level: number; count: number;
  feedback: { correct: boolean; note: string } | null;
  onAnswer: (correct: boolean, note: string, answer: string) => void;
  onEnd: () => void; onNext: () => void; timeUp: boolean;
}) {
  const song = useMemo<TrackV2>(() => ({ ...emptyTrackV2(), bpm: q.bpm, root: q.root, scale: q.scale, loop: 4, layers: [] }), [q]);
  const m = useImagine({ song, layer: q.layer, choices: q.choices, answer: q.answer, level: level <= 2 ? "gentle" : level <= 6 ? "standard" : "hard" });
  const answered = useRef(false);
  const letter = (k: number) => String.fromCharCode(97 + k);
  // The first pick is the answer; a wrong one then shows and plays the right one.
  const view = {
    ...m,
    pick: (k: number) => {
      if (answered.current) return false;
      answered.current = true;
      const ok = m.pick(k, true);
      if (!ok) m.pick(q.answer, true);
      onAnswer(ok, ok ? "yes, that's the one you saw. hear it with the notes." : `it was ${letter(q.answer)}. hear it now, and follow the notes.`, ok ? "imagined" : "missed");
      return ok;
    },
  };
  return (
    <>
      <div className="ls-col">
        <div className="fl-inst">
          <Screen>
            <div className="ls-meta">
              <span style={feedback ? { color: feedback.correct ? "var(--led-mint)" : "var(--led-red)" } : undefined}>
                {feedback ? (feedback.correct ? "right" : "not quite") : `imagine it first · ${count}`}
              </span>
              <span>level {level} of {MAX_LEVEL}</span>
            </div>
            <div className="im-line" aria-live="polite">
              {feedback ? feedback.note : m.phase === "imagine" ? `${q.label}${q.layer === "drums" ? "" : ` in ${keyName(q.root, q.scale)}`}. hum it in your head.` : "now listen, and pick the one you saw."}
            </div>
            <Counts m={m} />
            <CopyGrid c={m.view} layer={q.layer} locked />
          </Screen>
          {m.phase === "imagine"
            ? <div className="ls-hint im-tip">no sound yet. read the notes as the playhead passes them, hum them, then press go.</div>
            : <><Silk label="which one did you see?" right={`${q.choices.length} to try`} /><ImagineOptions m={view} count={q.choices.length} answer={q.answer} /></>}
        </div>
      </div>
      <div className="ls-bottom">
        <div className="m1-g">
          <Key label="end" onClick={() => { m.stop(); onEnd(); }} ariaLabel="End the session"><Icon name="close" /></Key>
          {feedback
            ? <GoPill onClick={() => { m.stop(); onNext(); }} style={{ gridColumn: "span 3" }}>{timeUp ? "finish" : "next"}</GoPill>
            : m.phase === "imagine"
              ? <GoPill onClick={() => m.setPhase("listen")} style={{ gridColumn: "span 3" }} ariaLabel="I can hear it in my head">i can hear it</GoPill>
              : <GoPill disabled style={{ gridColumn: "span 3" }} ariaLabel="Pick the one you saw">pick the one you saw</GoPill>}
        </div>
      </div>
    </>
  );
}
