"use client";
/**
 * The ear gym's "match this sound" drill (src/lib/gym/match.ts): a short phrase on a kick, a bass, a lead
 * or a pad plays with hidden settings of two to four knobs; switch between the target and yours, turn the
 * knobs, and check. The knobs are notched by level (five positions at levels 1 and 2), and level 1 has one
 * knob, as Syntorial starts. A first check that misses marks each knob green or red and gives one more check
 * (Syntorial's fix-the-red loop); a match (src/lib/matchScore.ts `passes`) on either check counts as right in
 * the gym's streaks. The screen then shows how close it was and where the target's knobs were. The same engine pieces as the lessons' match step (src/components/m1/MatchSound.tsx).
 */
import { useMemo, useState } from "react";
import { MAX_LEVEL } from "@/lib/gym/engine";
import { matchKnob, matchSong, type MatchQuestion } from "@/lib/gym/match";
import { KNOB_TOL, notchesFor, passes, which } from "@/lib/matchScore";
import { MatchKnobs, MatchMeter, MatchSides, useMatch, type K } from "@/components/m1/MatchSound";
import { GoPill, Icon, Key, Screen, Silk } from "@/components/m1/controls";

const PART_NAME = { kick: "a kick", bass: "a bass line", lead: "a lead", pad: "a pad" } as const;

export function GymMatch({ q, level, count, feedback, onAnswer, onEnd, onNext, timeUp }: {
  q: MatchQuestion; level: number; count: number;
  feedback: { correct: boolean; note: string } | null;
  onAnswer: (correct: boolean, note: string, answer: string) => void;
  onEnd: () => void; onNext: () => void; timeUp: boolean;
}) {
  const { song, part } = useMemo(() => matchSong(q), [q]);
  const knobs = useMemo(() => q.knobs.map(k => matchKnob(q.part, k)).filter((k): k is K => !!k), [q]);
  const target = useMemo(() => Object.fromEntries(knobs.map(k => [k.index, q.target[k.spec.key]])) as Record<number, number>, [knobs, q]);
  const start = useMemo(() => Object.fromEntries(knobs.map(k => [k.index, q.start[k.spec.key]])) as Record<number, number>, [knobs, q]);
  const m = useMatch({ song, part, knobs, target, start, notches: notchesFor(level) });
  const [second, setSecond] = useState(false);
  const [touched, setTouched] = useState<string | null>(null);
  const passed = passes(m.result);
  const check = async () => {
    const s = await m.check();
    if (!s) return;
    const ok = passes(s);
    // The first miss marks the knobs and gives one more check.
    if (!ok && !second) { setSecond(true); return; }
    // The knob furthest off says which way the target was.
    let w: { k: K; d: number } | null = null;
    for (const k of knobs) { const d = target[k.index] - m.value(k); if (!w || Math.abs(d) > Math.abs(w.d)) w = { k, d }; }
    const off = w && Math.abs(w.d) > KNOB_TOL ? ` the target's ${w.k.spec.label} was ${which(w.k.spec.key, w.d > 0)}.` : "";
    onAnswer(ok, ok ? `yes, ${s.close}% close.` : `${s.close}% close.${off || " one knob still off."}`, ok ? "match" : "miss");
  };
  return (
    <>
      <div className="ls-col">
        <div className="fl-inst">
          <Screen>
            <div className="ls-meta">
              <span style={feedback ? { color: feedback.correct ? "var(--led-mint)" : "var(--led-red)" } : undefined}>
                {feedback ? (feedback.correct ? "right" : "not quite") : `match this sound · ${count}`}
              </span>
              <span>level {level} of {MAX_LEVEL}</span>
            </div>
            <div className="ls-title" aria-live="polite">
              {feedback ? feedback.note : second ? `${m.result?.close ?? 0}% close. the red ${Object.values(m.marks).filter(x => !x.ok).length === 1 ? "knob is off: fix it" : "knobs are off: fix them"}, then one more check.` : `${PART_NAME[q.part]}, ${["", "one knob", "two knobs", "three knobs", "four knobs"][knobs.length]} set out of sight. turn yours until it sounds the same.`}
            </div>
            <MatchMeter m={m} hint={null} passed={passed} />
            <div className="ls-meta" style={{ marginTop: 10 }}>
              <span>{touched ?? (m.side === "target" ? "playing the target" : "playing yours")}</span>
              <span>{feedback ? "the target's settings are under each knob" : second ? "last check" : "two checks"}</span>
            </div>
          </Screen>
          <Silk label="switch between them" right={m.side === "target" ? "the target" : "yours"} />
          <MatchSides m={m} />
          <MatchKnobs m={m} knobs={knobs} onTouch={setTouched} locked={!!feedback} reveal={feedback ? target : undefined} />
        </div>
      </div>
      <div className="ls-bottom">
        <div className="m1-g">
          <Key label="end" onClick={onEnd} ariaLabel="End the session"><Icon name="close" /></Key>
          <Key label={m.playing ? "stop" : "play"} onClick={m.hear} ariaPressed={m.playing} ariaLabel={m.playing ? "Stop" : "Play"}><Icon name={m.playing ? "stop" : "play"} /></Key>
          {feedback
            ? <GoPill onClick={() => { m.engine.stop(); onNext(); }} style={{ gridColumn: "span 2" }}>{timeUp ? "finish" : "next"}</GoPill>
            : <GoPill onClick={() => void check()} disabled={m.busy} style={{ gridColumn: "span 2" }} ariaLabel="Check how close yours is">{m.busy ? "listening" : "check"}</GoPill>}
        </div>
      </div>
    </>
  );
}
