"use client";
/**
 * InlineClassicLesson — scrolling lesson rendered inside /learn/[slug].
 * Used in two situations:
 *   1. Explorer Mode  (learnMode === "classic") — all missions, no hearts
 *   2. Path Mode fallback — missions that have no screens[] yet
 *
 * Renders: mode badge → difficulty toggle → explainer blocks → sim → quiz → next CTA
 * Supports Normal / Hard mode matching the experience in MissionPageClient.
 * No redirect. No separate /mission/ page needed.
 */
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import type { Mission } from "@/content/types";
import { Simulator } from "@/components/sims/Simulator";
import { Quiz } from "@/components/Quiz";
import { CompletionModal } from "@/components/CompletionModal";
import { useProgress } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import { LESSONS } from "@/content/lesson-deep";
import { Glossarized, GlossaryScope } from "@/components/Term";
import { getMissionContext } from "@/lib/missionContext";
import { AnimatedSignalFlow } from "@/components/AnimatedSignalFlow";
import { LessonSourceBar } from "@/components/LessonSourceBar";

interface Props {
  mission: Mission;
  nextSlug?: string;
  isReview?: boolean;
  mode: "path" | "explore";
  onComplete: () => void;
  onWrong?: () => void;
  onCorrect?: () => void;
}

export function InlineClassicLesson({
  mission: m,
  nextSlug,
  isReview,
  mode,
  onComplete,
  onWrong,
  onCorrect,
}: Props) {
  const { progress, completeMission, loseHeart, addXp } = useProgress();
  const { learnMode } = useLearnMode();
  const [earnedXp, setEarnedXp] = useState(0);
  const [done, setDone] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [flowKey, setFlowKey] = useState(0);
  const ctx = getMissionContext(m.slug);
  const deep = LESSONS[m.slug];

  // Hard mode state — default from stored difficulty preference (explorer mode only)
  const defaultHard = learnMode !== "flow" && progress.difficulty === "hard";
  const [internalHardMode, setInternalHardMode] = useState(defaultHard);
  const hasHard = !!(deep?.quizHard?.length || deep?.advanced);

  useEffect(() => {
    setDone(!!progress.completedMissions[m.slug]);
  }, [m.slug, progress.completedMissions]);

  // Reset hard mode when slug changes
  useEffect(() => {
    setInternalHardMode(false);
    setFlowKey(0);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "instant" });
  }, [m.slug]);

  const worldColor =
    m.world === "foundations" ? "bg-acid text-ink"
    : m.world === "dj" ? "bg-ink text-bone"
    : "bg-sun text-ink";

  const accentBar =
    m.world === "foundations" ? "bg-acid"
    : m.world === "dj" ? "bg-volt"
    : "bg-sun";

  // Hard mode: use quizHard if available, strip hints. Normal: standard quiz.
  const quizQs = useMemo(() => {
    if (internalHardMode && deep?.quizHard?.length) {
      return deep.quizHard.map(q => ({ ...q, hint: undefined }));
    }
    if (internalHardMode) {
      return m.quiz.map(q => ({ ...q, hint: undefined }));
    }
    return m.quiz;
  }, [m.slug, internalHardMode, deep, m.quiz]);

  const passThreshold = internalHardMode ? 0.7 : 0.5;

  // Which content track to show
  const track = internalHardMode ? deep?.advanced : deep?.beginner;
  const whatParas = track?.what ?? deep?.definition;

  const allTexts = useMemo(() => {
    const out: string[] = [];
    if (whatParas) out.push(...whatParas);
    else {
      const lead = m.explainer.find(b => b.kind === "lead" || b.kind === "para");
      if (lead && "text" in lead) out.push(lead.text);
    }
    if (!internalHardMode && deep?.beginner?.analogy) out.push(deep.beginner.analogy);
    if (!internalHardMode && deep?.beginner?.why) out.push(...deep.beginner.why);
    if (internalHardMode && deep?.advanced?.edgeCases) out.push(...deep.advanced.edgeCases);
    if (internalHardMode && deep?.advanced?.engineerNotes) out.push(...deep.advanced.engineerNotes);
    if (deep?.listenFor) out.push(...deep.listenFor.slice(0, internalHardMode ? 99 : 3));
    if (deep?.walkthrough) { for (const s of deep.walkthrough) { out.push(s.do); out.push(s.listen); } }
    if (internalHardMode && deep?.proMoves) out.push(...deep.proMoves);
    if (deep?.mistakes) out.push(...deep.mistakes);
    return out;
  }, [m.slug, internalHardMode, deep, whatParas, m.explainer]);

  const onQuizDone = (score: number) => {
    const alreadyDone = !!progress.completedMissions[m.slug];
    const xp = alreadyDone ? 0 : m.xp;
    const badge = score >= passThreshold ? m.badge?.slug : undefined;
    completeMission(m.slug, m.xp, score, badge);
    setEarnedXp(xp);
    setDone(true);
    setShowModal(true); // fire CompletionModal
    onComplete();
  };

  // Fallback explainer blocks when no deep content exists
  const fallbackWhat = m.explainer.find(b => b.kind === "lead" || b.kind === "para");

  return (
    <GlossaryScope resetKey={m.slug} texts={allTexts}>
      {/* Sticky difficulty toggle — only shown when deep lesson content has hard mode */}
      {hasHard && (
        <div className="sticky top-[52px] md:top-[56px] z-20 brutal-border border-x-0 border-t-0 bg-bone flex items-center gap-2 px-4 py-2">
          <span className="font-mono text-[9px] uppercase opacity-50 mr-2">DIFFICULTY:</span>
          <button
            onClick={() => setInternalHardMode(false)}
            className={`brutal-border px-3 py-1 font-mono text-[9px] uppercase brutal-press ${!internalHardMode ? "bg-ink text-bone" : "bg-bone hover:bg-sun"}`}
          >
            📖 Normal
          </button>
          <button
            onClick={() => setInternalHardMode(true)}
            className={`brutal-border px-3 py-1 font-mono text-[9px] uppercase brutal-press ${internalHardMode ? "bg-hot text-bone" : "bg-bone hover:bg-sun"}`}
          >
            🔥 Hard
          </button>
          {internalHardMode && deep?.quizHard?.length && (
            <span className="font-mono text-[9px] opacity-50 ml-2">harder questions loaded</span>
          )}
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-5 pb-24">

        {/* Top bar — matches LessonPlayer chrome */}
        <div className="flex items-center gap-3">
          <Link
            href={ctx.worldRoute || `/world/${m.world === "foundations" ? "fundamentals" : m.world}`}
            className="brutal-border bg-bone px-3 py-2 font-mono text-[10px] uppercase brutal-press shrink-0"
          >
            ✕
          </Link>
          {/* Mode badge */}
          <div className={`brutal-border px-3 py-1 font-mono text-[9px] uppercase font-bold
            ${mode === "explore" ? "bg-bone text-ink" : "bg-acid text-ink"}`}>
            {mode === "explore" ? "🔓 Explore Mode" : "🗺 Path Mode"}
          </div>
          <div className="flex-1" />
          {internalHardMode && (
            <span className="brutal-border bg-hot text-bone px-2 py-1 font-mono text-[9px] uppercase animate-pulse">🔥 HARD MODE</span>
          )}
          {done && (
            <span className="brutal-border bg-acid text-ink px-2 py-1 font-mono text-[9px] uppercase">✓ Done</span>
          )}
        </div>

        {/* Mission header */}
        <header className={`brutal-border ${worldColor} p-5 brutal-shadow`}>
          <div className="font-mono text-[9px] uppercase opacity-60 mb-1">
            {ctx.chapter?.title} › {ctx.path?.title}
          </div>
          <h1 className="font-display text-4xl leading-none">{m.title}</h1>
          <p className="font-mono text-sm opacity-70 mt-2 leading-relaxed">{m.tagline}</p>
          <div className="flex flex-wrap gap-2 mt-3 font-mono text-[9px] uppercase">
            <span className="brutal-border bg-bone/20 px-2 py-1">+{m.xp} XP</span>
            {m.badge && <span className="brutal-border bg-bone/20 px-2 py-1">🏅 {m.badge.name}</span>}
          </div>
        </header>

        {/* ── WHAT YOU NEED TO KNOW ─────────────────────────────────────── */}
        <section className="space-y-3">
          <div className={`brutal-border ${accentBar} text-ink px-4 py-1.5 font-mono text-[9px] uppercase font-bold`}>
            WHAT YOU NEED TO KNOW
          </div>

          {/* Hard mode: advanced.what paragraphs */}
          {internalHardMode && deep?.advanced?.what ? (
            <div className="space-y-2">
              {deep.advanced.what.map((para, i) => (
                <p key={i} className="brutal-border bg-bone p-4 font-mono text-sm leading-relaxed">
                  <Glossarized text={para} />
                </p>
              ))}
            </div>
          ) : deep?.beginner?.what ? (
            <div className="space-y-2">
              {deep.beginner.what.map((para, i) => (
                <p key={i} className="brutal-border bg-bone p-4 font-mono text-sm leading-relaxed">
                  <Glossarized text={para} />
                </p>
              ))}
            </div>
          ) : (
            m.explainer.map((block, i) => {
              if (block.kind === "lead" || block.kind === "para") {
                return (
                  <p key={i} className="brutal-border bg-bone p-4 font-mono text-sm leading-relaxed">
                    <Glossarized text={block.text} />
                  </p>
                );
              }
              if (block.kind === "callout") {
                const tone = block.tone === "tip" ? "bg-acid text-ink" : block.tone === "warn" ? "bg-hot text-bone" : "bg-volt text-bone";
                return (
                  <div key={i} className={`brutal-border ${tone} p-4 font-mono text-sm leading-relaxed`}>
                    <span className="font-bold uppercase text-[9px] block mb-1">
                      {block.tone === "tip" ? "💡 TIP" : block.tone === "warn" ? "⚠ WATCH OUT" : "🔑 KEY"}
                    </span>
                    <Glossarized text={block.text} />
                  </div>
                );
              }
              if (block.kind === "list") {
                return (
                  <ul key={i} className="brutal-border bg-bone p-4 space-y-1.5">
                    {block.items.map((item, j) => (
                      <li key={j} className="font-mono text-sm flex gap-2">
                        <span className="text-acid font-bold shrink-0">›</span>
                        <Glossarized text={item} />
                      </li>
                    ))}
                  </ul>
                );
              }
              return null;
            })
          )}

          {/* Normal mode: beginner analogy + why */}
          {!internalHardMode && deep?.beginner?.analogy && (
            <div className="brutal-border bg-acid text-ink p-4 font-mono text-sm">
              <span className="font-bold uppercase text-[9px] block mb-1">THINK OF IT LIKE →</span>
              <Glossarized text={deep.beginner.analogy} />
            </div>
          )}
          {!internalHardMode && deep?.beginner?.why && (
            <div className="brutal-border bg-volt text-bone p-4">
              <div className="font-mono text-[9px] uppercase font-bold mb-2">▸ WHY YOU CARE</div>
              <ul className="space-y-1 font-mono text-sm">
                {deep.beginner.why.map((item, i) => (
                  <li key={i}>• <Glossarized text={item} /></li>
                ))}
              </ul>
            </div>
          )}

          {/* Hard mode: advanced edge cases + engineer notes */}
          {internalHardMode && deep?.advanced?.edgeCases && (
            <div className="brutal-border bg-hot text-bone p-4">
              <div className="font-mono text-[9px] uppercase font-bold mb-2">⚠ EDGE CASES</div>
              <ul className="space-y-1 font-mono text-sm">
                {deep.advanced.edgeCases.map((item, i) => (
                  <li key={i}>• <Glossarized text={item} /></li>
                ))}
              </ul>
            </div>
          )}
          {internalHardMode && deep?.advanced?.engineerNotes && (
            <div className="brutal-border bg-ink text-bone p-4">
              <div className="font-mono text-[9px] uppercase font-bold mb-2">🔧 ENGINEER NOTES</div>
              <ul className="space-y-1 font-mono text-sm">
                {deep.advanced.engineerNotes.map((item, i) => (
                  <li key={i}>• <Glossarized text={item} /></li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* ── HOW IT WORKS (mechanism + signal flow) ──────────────────────── */}
        {(deep?.mechanism || deep?.flow) && (
          <details open={internalHardMode} className="brutal-border bg-card p-4"
            onToggle={(e) => { if ((e.currentTarget as HTMLDetailsElement).open) setFlowKey(k => k + 1); }}>
            <summary className="font-mono text-[9px] uppercase cursor-pointer font-bold">▸ HOW IT WORKS</summary>
            <div className="mt-3 space-y-3">
              {deep?.mechanism && (
                <p className="font-mono text-sm leading-relaxed brutal-border bg-volt text-bone p-3">
                  {deep.mechanism}
                </p>
              )}
              {deep?.flow && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-mono text-[10px] uppercase opacity-70">▸ Signal flow — watch the dot</div>
                    <button
                      type="button"
                      onClick={() => setFlowKey(k => k + 1)}
                      className="brutal-border bg-acid px-2 py-1 font-mono text-[10px] uppercase brutal-press"
                    >
                      ▶ Replay
                    </button>
                  </div>
                  <AnimatedSignalFlow flow={deep.flow} replayKey={flowKey} legend="Glowing dot = your signal travelling through Live." />
                </div>
              )}
            </div>
          </details>
        )}

        {/* ── LISTEN FOR ──────────────────────────────────────────────────── */}
        {deep?.listenFor && (
          <div className="brutal-border bg-sun p-3">
            <div className="font-mono text-[9px] uppercase mb-2 font-bold">▸ LISTEN FOR</div>
            <ul className="space-y-1 font-mono text-sm">
              {deep.listenFor.slice(0, internalHardMode ? 99 : 3).map((x, i) => (
                <li key={i}>• <Glossarized text={x} /></li>
              ))}
            </ul>
          </div>
        )}

        {/* ── WALKTHROUGH ─────────────────────────────────────────────────── */}
        {deep?.walkthrough && (
          <details open={!internalHardMode} className="brutal-border bg-card p-4">
            <summary className="font-mono text-[9px] uppercase cursor-pointer font-bold">
              ▸ WALKTHROUGH ({deep.walkthrough.length} steps)
            </summary>
            <ol className="space-y-2 mt-3">
              {deep.walkthrough.map((s, i) => (
                <li key={i} className="brutal-border bg-bone p-2 font-mono text-sm">
                  <div><span className="font-bold">{i + 1}. DO:</span> <Glossarized text={s.do} /></div>
                  <div className="opacity-80 mt-1">▸ LISTEN: <Glossarized text={s.listen} /></div>
                </li>
              ))}
            </ol>
          </details>
        )}

        {/* ── PRO MOVES (hard mode only) ───────────────────────────────────── */}
        {internalHardMode && deep?.proMoves && (
          <details open className="brutal-border bg-ink text-bone p-4">
            <summary className="font-mono text-[9px] uppercase cursor-pointer font-bold">▸ PRO MOVES</summary>
            <ul className="space-y-1 mt-2 font-mono text-sm">
              {deep.proMoves.map((x, i) => (
                <li key={i}>★ <Glossarized text={x} /></li>
              ))}
            </ul>
          </details>
        )}

        {/* ── COMMON MISTAKES ─────────────────────────────────────────────── */}
        {deep?.mistakes && (
          <details open={internalHardMode} className="brutal-border bg-hot text-bone p-4">
            <summary className="font-mono text-[9px] uppercase cursor-pointer font-bold">▸ COMMON MISTAKES</summary>
            <ul className="space-y-1 mt-2 font-mono text-sm">
              {deep.mistakes.map((x, i) => (
                <li key={i}>✗ <Glossarized text={x} /></li>
              ))}
            </ul>
          </details>
        )}

        {/* ── RELATED ─────────────────────────────────────────────────────── */}
        {deep?.related && deep.related.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {deep.related.map((r, i) => {
              const href =
                r.kind === "mission" ? `/learn/${r.slug}`
                : r.kind === "device" ? `/device/${r.slug}`
                : `/glossary#${r.slug}`;
              return (
                <a key={i} href={href} className="brutal-border bg-volt text-bone px-3 py-2 font-mono text-[9px] uppercase brutal-press">
                  → {r.label}
                </a>
              );
            })}
          </div>
        )}

        {/* ── SIMULATOR ───────────────────────────────────────────────────── */}
        <section>
          <div className={`brutal-border ${accentBar} text-ink px-4 py-1.5 font-mono text-[9px] uppercase font-bold mb-3`}>
            TRY IT
          </div>
          <Simulator type={m.sim.type} preset={m.sim.preset} />
        </section>

        {/* ── QUIZ ────────────────────────────────────────────────────────── */}
        <section>
          <div className={`brutal-border ${accentBar} text-ink px-4 py-1.5 font-mono text-[9px] uppercase font-bold mb-3`}>
            QUICK QUIZ {internalHardMode ? <span className="text-bone">🔥 HARD</span> : ""}
          </div>
          {internalHardMode && (
            <div className="brutal-border bg-hot text-bone px-3 py-2 font-mono text-[10px] uppercase mb-3">
              Hard mode — no hints · pass threshold 70% · {deep?.quizHard?.length ? "harder questions loaded" : "hints removed from standard questions"}
            </div>
          )}
          <Quiz
            key={`${m.slug}-${internalHardMode}`}
            qs={quizQs}
            resetKey={`${m.slug}-${internalHardMode}`}
            meta={{ missionTitle: m.title, missionNumber: m.number, xpEarned: earnedXp, nextSlug }}
            onComplete={onQuizDone}
            onWrongAnswer={onWrong}
            onCorrectAnswer={onCorrect}
            onPerfect={onCorrect}
          />
        </section>

        {/* ── SOURCE CITATION ─────────────────────────────────────────────── */}
        <LessonSourceBar source={ctx?.path?.source} />

        {/* ── NEXT LESSON CTA ─────────────────────────────────────────────── */}
        {nextSlug && done && (
          <Link
            href={`/learn/${nextSlug}`}
            className="w-full brutal-border bg-acid text-ink py-4 font-display text-2xl brutal-press text-center block"
          >
            NEXT LESSON →
          </Link>
        )}
      </div>

      {/* ── COMPLETION MODAL ─────────────────────────────────────────────── */}
      {showModal && (
        <CompletionModal
          mission={m}
          xpEarned={earnedXp}
          score={done ? 1 : 0}
          badgeName={m.badge?.name}
          nextSlug={nextSlug}
          onClose={() => setShowModal(false)}
        />
      )}
    </GlossaryScope>
  );
}
