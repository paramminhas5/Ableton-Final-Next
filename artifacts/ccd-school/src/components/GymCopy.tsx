"use client";
/**
 * The ear gym's "copy by ear" drill (src/lib/copyEar.ts makeCopyQuestion): a one-bar drum pattern, bass
 * line, chord progression or melody plays, generated at the learner's level; they write it on the grid.
 * Checks are unlimited, as in Building Blocks. It counts as right in the gym's streaks when it is solved with
 * two stars or more (a few checks, no more than one hint); "show me" reveals the answer and counts as a miss.
 * The same screen pieces as the lessons' copy step (src/components/m1/CopyEar.tsx).
 */
import { useMemo, useRef } from "react";
import { MAX_LEVEL } from "@/lib/gym/engine";
import { parsePattern, type CopyQuestion } from "@/lib/copyEar";
import { emptyTrackV2, type TrackV2 } from "@/lib/track2";
import { keyName } from "@/lib/theory";
import { CopyGrid, CopyMeter, CopySides, copyTip, useCopyOn, type Level } from "@/components/m1/CopyEar";
import { GoPill, Icon, Key, Screen, Silk } from "@/components/m1/controls";

/** How many rows the grid offers at each gym level: the scale's notes (or the drums used plus a decoy), then every semitone at the top levels. */
export const copyRows = (level: number): Level => (level <= 2 ? "gentle" : level <= 6 ? "standard" : "hard");

export function GymCopy({ q, level, count, feedback, onAnswer, onEnd, onNext, timeUp }: {
  q: CopyQuestion; level: number; count: number;
  feedback: { correct: boolean; note: string } | null;
  onAnswer: (correct: boolean, note: string, answer: string) => void;
  onEnd: () => void; onNext: () => void; timeUp: boolean;
}) {
  const song = useMemo<TrackV2>(() => ({ ...emptyTrackV2(), bpm: q.bpm, root: q.root, scale: q.scale, loop: 4, layers: [] }), [q]);
  const parsed = useMemo(() => parsePattern(q.layer, q.pattern, q.root, q.scale), [q]);
  const c = useCopyOn({ song, layer: q.layer, target: parsed.events, loop: parsed.loop, level: copyRows(level) });
  const answered = useRef(false);
  const tip = copyTip(c, q.layer);
  const check = () => {
    const g = c.check();
    if (!g.done || answered.current) return;
    answered.current = true;
    // c.stars is computed from the state before this check; work it out from the counts after it.
    const checks = c.checks + 1, hints = c.hints.length;
    const cost = Math.max(0, checks - 2) + hints * 2;
    const stars = cost === 0 ? 3 : cost <= 3 ? 2 : 1;
    onAnswer(stars >= 2, `${"★".repeat(stars)}${"☆".repeat(3 - stars)} every note, in ${checks} ${checks === 1 ? "check" : "checks"}${hints ? ` and ${hints} ${hints === 1 ? "hint" : "hints"}` : ""}.`, stars >= 2 ? "copied" : "slow");
  };
  const showMe = () => {
    if (answered.current) return;
    answered.current = true;
    onAnswer(false, "here it is. the notes you didn't have are outlined.", "shown");
  };
  return (
    <>
      <div className="ls-col">
        <div className="fl-inst">
          <Screen>
            <div className="ls-meta">
              <span style={feedback ? { color: feedback.correct ? "var(--led-mint)" : "var(--led-red)" } : undefined}>
                {feedback ? (feedback.correct ? "right" : "not quite") : `copy by ear · ${count}`}
              </span>
              <span>level {level} of {MAX_LEVEL}</span>
            </div>
            <div className="ls-title" aria-live="polite">
              {feedback ? feedback.note : `${q.label}${q.layer === "drums" ? "" : ` in ${keyName(q.root, q.scale)}`}. write it on the grid.`}
            </div>
            <CopyMeter c={c} idle={`${parsed.events.length} notes to find · checks are free`} />
            <CopyGrid c={c} layer={q.layer} locked={!!feedback} reveal={!!feedback} />
            <div className="ls-meta" style={{ marginTop: 10 }}>
              <span>{c.side === "target" ? "playing the target" : "playing yours"}</span>
              <span>{feedback ? "" : tip ?? "two stars or more counts as right"}</span>
            </div>
          </Screen>
          <Silk label="switch between them" right={c.side === "target" ? "the target" : "yours"} />
          <CopySides c={c} />
        </div>
      </div>
      <div className="ls-bottom">
        <div className="m1-g">
          <Key label="end" onClick={onEnd} ariaLabel="End the session"><Icon name="close" /></Key>
          {feedback
            ? <Key label={c.playing ? "stop" : "play"} onClick={c.hear} ariaPressed={c.playing} ariaLabel={c.playing ? "Stop" : "Play"}><Icon name={c.playing ? "stop" : "play"} /></Key>
            : c.checks
              ? <Key label={c.hints.length ? "show me" : "hint"} onClick={() => (c.hints.length ? showMe() : c.hint())} ariaLabel={c.hints.length ? "Show me the answer" : "Show where one missing note goes"}><span aria-hidden style={{ fontSize: 18 }}>?</span></Key>
              : <Key label={c.playing ? "stop" : "play"} onClick={c.hear} ariaPressed={c.playing} ariaLabel={c.playing ? "Stop" : "Play"}><Icon name={c.playing ? "stop" : "play"} /></Key>}
          {feedback
            ? <GoPill onClick={() => { c.engine.stop(); onNext(); }} style={{ gridColumn: "span 2" }}>{timeUp ? "finish" : "next"}</GoPill>
            : <GoPill onClick={check} style={{ gridColumn: "span 2" }} ariaLabel={c.grade ? `${c.grade.right} of ${c.grade.total} right. Check again` : "Check your notes"}>{c.grade ? `${c.grade.right}/${c.grade.total} · check again` : "check"}</GoPill>}
        </div>
      </div>
    </>
  );
}
