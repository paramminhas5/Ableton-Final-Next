"use client";
/**
 * InlineClassicLesson — scrolling lesson rendered inside /learn/[slug].
 * Used in two situations:
 *   1. Explorer Mode  (learnMode === "classic") — all missions, no hearts
 *   2. Path Mode fallback — missions that have no screens[] yet
 *
 * Renders: mode badge → explainer blocks → sim → quiz → next CTA
 * No redirect. No separate /mission/ page needed.
 */
import Link from "next/link";
import { useState, useEffect } from "react";
import type { Mission } from "@/content/types";
import { Simulator } from "@/components/sims/Simulator";
import { Quiz } from "@/components/Quiz";
import { useProgress } from "@/lib/progress";
import { LESSONS } from "@/content/lesson-deep";
import { Glossarized, GlossaryScope } from "@/components/Term";
import { getMissionContext } from "@/lib/missionContext";

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
  const [earnedXp, setEarnedXp] = useState(0);
  const [done, setDone] = useState(false);
  const ctx = getMissionContext(m.slug);
  const deep = LESSONS[m.slug];

  useEffect(() => {
    setDone(!!progress.completedMissions[m.slug]);
  }, [m.slug, progress.completedMissions]);

  const worldColor =
    m.world === "foundations" ? "bg-acid text-ink"
    : m.world === "dj" ? "bg-ink text-bone"
    : "bg-sun text-ink";

  const accentBar =
    m.world === "foundations" ? "bg-acid"
    : m.world === "dj" ? "bg-volt"
    : "bg-sun";

  const onQuizDone = (score: number) => {
    const alreadyDone = !!progress.completedMissions[m.slug];
    const xp = alreadyDone ? 0 : m.xp;
    completeMission(m.slug, m.xp, score, score >= 0.5 ? m.badge?.slug : undefined);
    setEarnedXp(xp);
    setDone(true);
    onComplete();
  };

  const allTexts: string[] = [];
  if (deep?.beginner?.what) allTexts.push(...deep.beginner.what);
  else {
    const lead = m.explainer.find(b => b.kind === "lead" || b.kind === "para");
    if (lead && "text" in lead) allTexts.push(lead.text);
  }

  return (
    <GlossaryScope resetKey={m.slug} texts={allTexts}>
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-5 pb-24">

        {/* Top bar — matches LessonPlayer chrome */}
        <div className="flex items-center gap-3">
          <Link
            href={`/world/${m.world === "foundations" ? "fundamentals" : m.world}`}
            className="brutal-border bg-bone px-3 py-2 font-mono text-[10px] uppercase brutal-press shrink-0"
          >
            ✕
          </Link>
          {/* Mode badge */}
          <div className={`brutal-border px-3 py-1 font-mono text-[9px] uppercase font-bold
            ${mode === "explore" ? "bg-bone text-ink" : "bg-sun text-ink"}`}>
            {mode === "explore" ? "🗺 Explorer Mode" : "🔒 Path Mode"}
          </div>
          <div className="flex-1" />
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

        {/* Explainer blocks */}
        <section className="space-y-3">
          <div className={`brutal-border ${accentBar} text-ink px-4 py-1.5 font-mono text-[9px] uppercase font-bold`}>
            WHAT YOU NEED TO KNOW
          </div>

          {deep?.beginner?.what ? (
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

          {deep?.beginner?.analogy && (
            <div className="brutal-border bg-acid text-ink p-4 font-mono text-sm">
              <span className="font-bold uppercase text-[9px] block mb-1">THINK OF IT LIKE →</span>
              <Glossarized text={deep.beginner.analogy} />
            </div>
          )}
          {deep?.beginner?.why && (
            <div className="brutal-border bg-volt text-bone p-4">
              <div className="font-mono text-[9px] uppercase font-bold mb-2">▸ WHY YOU CARE</div>
              <ul className="space-y-1 font-mono text-sm">
                {deep.beginner.why.map((item, i) => (
                  <li key={i}>• <Glossarized text={item} /></li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Simulator */}
        <section>
          <div className={`brutal-border ${accentBar} text-ink px-4 py-1.5 font-mono text-[9px] uppercase font-bold mb-3`}>
            TRY IT
          </div>
          <Simulator type={m.sim.type} preset={m.sim.preset} />
        </section>

        {/* Quiz */}
        <section>
          <div className={`brutal-border ${accentBar} text-ink px-4 py-1.5 font-mono text-[9px] uppercase font-bold mb-3`}>
            QUICK QUIZ
          </div>
          <Quiz
            key={m.slug}
            qs={m.quiz}
            resetKey={m.slug}
            meta={{ missionTitle: m.title, missionNumber: m.number, xpEarned: earnedXp, nextSlug }}
            onComplete={onQuizDone}
            onWrongAnswer={onWrong}
            onCorrectAnswer={onCorrect}
            onPerfect={onCorrect}
          />
        </section>

        {/* Nav */}
        {nextSlug && done && (
          <Link
            href={`/learn/${nextSlug}`}
            className="w-full brutal-border bg-acid text-ink py-4 font-display text-2xl brutal-press text-center block"
          >
            NEXT LESSON →
          </Link>
        )}
      </div>
    </GlossaryScope>
  );
}
