"use client";
/**
 * InlineClassicLesson — scrolling lesson rendered inside /learn/[slug].
 * Used in two situations:
 *   1. Free Mode  (learnMode === "classic") — all missions, no hearts
 *   2. Flow Mode fallback — missions that have no screens[] yet
 *
 * Redesigned for world-class readability:
 *   - font-sans for all body text (Space Grotesk, not monospaced)
 *   - Consistent card-based layout with uniform padding
 *   - Clear visual hierarchy: title → body → callouts → quiz
 *   - Removed duplicate simulator headers
 *   - Clean section dividers instead of competing colored bars
 */
import Link from "next/link";
import Image from "next/image";
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

const WORLD_BANNERS: Record<string, string> = {
  foundations: "https://v3b.fal.media/files/b/0a9d8573/T1yPDNCVhxrVLWBs3vPLK.jpg",
  dj: "https://v3b.fal.media/files/b/0a9d8573/vkzVEVke8UdYZtUAJEt5P.jpg",
};

interface Props {
  mission: Mission;
  nextSlug?: string;
  isReview?: boolean;
  mode: "path" | "explore";
  onComplete: () => void;
  onWrong?: () => void;
  onCorrect?: () => void;
}

// ── Shared section wrapper ────────────────────────────────────────────────────
function Section({
  label,
  icon,
  accent,
  children,
}: {
  label: string;
  icon?: string;
  accent?: string; // tailwind bg class for the left border accent
  children: React.ReactNode;
}) {
  return (
    <section className="animate-fade-up">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3">
        {icon && <span className="text-base leading-none">{icon}</span>}
        <span className="font-mono text-xs font-bold uppercase tracking-widest opacity-50">
          {label}
        </span>
        <div className="flex-1 h-px bg-ink/10" />
      </div>
      <div className={accent ? `border-l-4 ${accent} pl-4` : ""}>{children}</div>
    </section>
  );
}

// ── Content card ──────────────────────────────────────────────────────────────
function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`brutal-border bg-card rounded-md p-5 ${className}`}>
      {children}
    </div>
  );
}

// ── Difficulty pill ───────────────────────────────────────────────────────────
function DifficultyToggle({
  hard,
  onNormal,
  onHard,
}: {
  hard: boolean;
  onNormal: () => void;
  onHard: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-xs uppercase opacity-50 tracking-wide">
        Difficulty
      </span>
      <div className="flex brutal-border rounded-md overflow-hidden">
        <button
          onClick={onNormal}
          className={`px-4 py-1.5 font-sans text-sm font-medium transition-colors brutal-press ${
            !hard ? "bg-ink text-bone" : "bg-bone hover:bg-ink/10"
          }`}
        >
          📖 Normal
        </button>
        <button
          onClick={onHard}
          className={`px-4 py-1.5 font-sans text-sm font-medium transition-colors brutal-press border-l-2 border-border ${
            hard ? "bg-hot text-bone" : "bg-bone hover:bg-hot/10"
          }`}
        >
          🔥 Hard
        </button>
      </div>
      {hard && (
        <span className="font-mono text-xs uppercase text-hot font-bold animate-fade-in">
          harder questions loaded
        </span>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
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

  // Hard mode state
  const defaultHard = learnMode !== "flow" && progress.difficulty === "hard";
  const [internalHardMode, setInternalHardMode] = useState(defaultHard);
  const hasHard = !!(deep?.quizHard?.length || deep?.advanced);

  useEffect(() => {
    setDone(!!progress.completedMissions[m.slug]);
  }, [m.slug, progress.completedMissions]);

  useEffect(() => {
    setInternalHardMode(false);
    setFlowKey(0);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "instant" });
  }, [m.slug]);

  // World accent colours
  const worldHeaderBg =
    m.world === "foundations" ? "bg-acid text-ink"
    : m.world === "dj"        ? "bg-ink text-bone"
    : "bg-sun text-ink";

  const accentBorder =
    m.world === "foundations" ? "border-acid"
    : m.world === "dj"        ? "border-volt"
    : "border-sun";

  const accentBg =
    m.world === "foundations" ? "bg-acid"
    : m.world === "dj"        ? "bg-volt"
    : "bg-sun";

  // Quiz questions
  const quizQs = useMemo(() => {
    if (internalHardMode && deep?.quizHard?.length) {
      return deep.quizHard.map((q) => ({ ...q, hint: undefined }));
    }
    if (internalHardMode) {
      return m.quiz.map((q) => ({ ...q, hint: undefined }));
    }
    return m.quiz;
  }, [m.slug, internalHardMode, deep, m.quiz]);

  const passThreshold = internalHardMode ? 0.7 : 0.5;

  const track = internalHardMode ? deep?.advanced : deep?.beginner;
  const whatParas = track?.what ?? deep?.definition;

  const allTexts = useMemo(() => {
    const out: string[] = [];
    if (whatParas) out.push(...whatParas);
    else {
      const lead = m.explainer.find((b) => b.kind === "lead" || b.kind === "para");
      if (lead && "text" in lead) out.push(lead.text);
    }
    if (!internalHardMode && deep?.beginner?.analogy) out.push(deep.beginner.analogy);
    if (!internalHardMode && deep?.beginner?.why) out.push(...deep.beginner.why);
    if (internalHardMode && deep?.advanced?.edgeCases) out.push(...deep.advanced.edgeCases);
    if (internalHardMode && deep?.advanced?.engineerNotes) out.push(...deep.advanced.engineerNotes);
    if (deep?.listenFor) out.push(...deep.listenFor.slice(0, internalHardMode ? 99 : 3));
    if (deep?.walkthrough) {
      for (const s of deep.walkthrough) {
        out.push(s.do);
        out.push(s.listen);
      }
    }
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
    setShowModal(true);
    onComplete();
  };

  return (
    <GlossaryScope resetKey={m.slug} texts={allTexts}>
      {/* ── Sticky difficulty toggle ───────────────────────────────────────── */}
      {hasHard && (
        <div className="sticky top-[52px] md:top-[56px] z-20 bg-bone/95 backdrop-blur-sm border-b-2 border-border px-4 py-2.5">
          <DifficultyToggle
            hard={internalHardMode}
            onNormal={() => setInternalHardMode(false)}
            onHard={() => setInternalHardMode(true)}
          />
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-7 pb-28">

        {/* ── Top nav bar ──────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <Link
            href={ctx.worldRoute || `/world/${m.world === "foundations" ? "fundamentals" : m.world}`}
            className="brutal-border bg-bone px-4 py-2 font-mono text-xs uppercase brutal-press shrink-0 rounded-md"
          >
            ✕
          </Link>
          {/* Mode badge */}
          <div
            className={`brutal-border px-3 py-1.5 font-mono text-xs font-bold rounded-md ${
              mode === "explore" ? "bg-bone text-ink" : "bg-acid text-ink"
            }`}
          >
            {mode === "explore" ? "🔓 Free Mode" : "🌊 Flow Mode"}
          </div>
          <div className="flex-1" />
          {internalHardMode && (
            <span className="brutal-border bg-hot text-bone px-3 py-1.5 font-mono text-xs uppercase rounded-md animate-pulse">
              🔥 Hard
            </span>
          )}
          {done && (
            <span className="brutal-border bg-acid text-ink px-3 py-1.5 font-mono text-xs uppercase rounded-md">
              ✓ Done
            </span>
          )}
        </div>

        {/* ── Mission hero card ─────────────────────────────────────────────── */}
        <header
          className={`brutal-border brutal-shadow ${worldHeaderBg} relative overflow-hidden rounded-lg min-h-[200px] flex flex-col justify-end`}
        >
          {WORLD_BANNERS[m.world] && (
            <div className="absolute inset-0 pointer-events-none">
              <Image
                src={WORLD_BANNERS[m.world]}
                alt=""
                fill
                className="object-cover opacity-20 mix-blend-multiply"
                sizes="100vw"
              />
            </div>
          )}
          <div className="relative z-10 p-6">
            <p className="font-mono text-xs opacity-60 mb-1.5 uppercase tracking-wide">
              {ctx.chapter?.title} › {ctx.path?.title}
            </p>
            <h1 className="font-display text-4xl md:text-5xl leading-none mb-3">
              {m.title}
            </h1>
            <p className="font-sans text-base opacity-80 leading-relaxed max-w-lg">
              {m.tagline}
            </p>
            <div className="flex flex-wrap gap-2 mt-4 font-mono text-xs uppercase">
              <span className="brutal-border bg-bone/20 px-2.5 py-1 rounded">
                +{m.xp} XP
              </span>
              {m.badge && (
                <span className="brutal-border bg-bone/20 px-2.5 py-1 rounded">
                  🏅 {m.badge.name}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* ── WHAT YOU NEED TO KNOW ──────────────────────────────────────────── */}
        <Section label="What you need to know" icon="📖" accent={accentBorder}>
          <div className="space-y-3">
            {/* Hard mode: advanced paragraphs */}
            {internalHardMode && deep?.advanced?.what ? (
              deep.advanced.what.map((para, i) => (
                <Card key={i}>
                  <p className="font-sans text-base leading-relaxed">
                    <Glossarized text={para} />
                  </p>
                </Card>
              ))
            ) : deep?.beginner?.what ? (
              deep.beginner.what.map((para, i) => (
                <Card key={i}>
                  <p className="font-sans text-base leading-relaxed">
                    <Glossarized text={para} />
                  </p>
                </Card>
              ))
            ) : (
              m.explainer.map((block, i) => {
                if (block.kind === "lead" || block.kind === "para") {
                  return (
                    <Card key={i}>
                      <p className="font-sans text-base leading-relaxed">
                        <Glossarized text={block.text} />
                      </p>
                    </Card>
                  );
                }
                if (block.kind === "callout") {
                  const styles =
                    block.tone === "tip"
                      ? "bg-acid text-ink"
                      : block.tone === "warn"
                      ? "bg-hot text-bone"
                      : "bg-volt text-bone";
                  return (
                    <div key={i} className={`brutal-border rounded-md p-5 ${styles}`}>
                      <span className="font-mono text-xs font-bold uppercase block mb-2 opacity-70">
                        {block.tone === "tip"
                          ? "💡 Tip"
                          : block.tone === "warn"
                          ? "⚠ Watch out"
                          : "🔑 Key point"}
                      </span>
                      <p className="font-sans text-base leading-relaxed">
                        <Glossarized text={block.text} />
                      </p>
                    </div>
                  );
                }
                if (block.kind === "list") {
                  return (
                    <Card key={i}>
                      <ul className="space-y-2">
                        {block.items.map((item, j) => (
                          <li key={j} className="font-sans text-base flex gap-3">
                            <span className="text-acid font-bold shrink-0 mt-0.5">›</span>
                            <Glossarized text={item} />
                          </li>
                        ))}
                      </ul>
                    </Card>
                  );
                }
                return null;
              })
            )}

            {/* Analogy block — Normal mode only */}
            {!internalHardMode && deep?.beginner?.analogy && (
              <div className="brutal-border bg-acid text-ink p-5 rounded-md relative overflow-hidden">
                <span className="font-display text-5xl opacity-15 absolute left-3 top-0 leading-none select-none pointer-events-none">
                  &ldquo;
                </span>
                <p className="font-mono text-xs uppercase font-bold mb-2 opacity-60 relative z-10">
                  Think of it like →
                </p>
                <p className="font-sans text-base leading-relaxed relative z-10">
                  <Glossarized text={deep.beginner.analogy} />
                </p>
              </div>
            )}

            {/* Why you care — Normal mode */}
            {!internalHardMode && deep?.beginner?.why && (
              <Card className="bg-volt/10 border-volt/40">
                <p className="font-mono text-xs uppercase font-bold mb-3 opacity-60">
                  ▸ Why this matters
                </p>
                <ul className="space-y-2">
                  {deep.beginner.why.map((item, i) => (
                    <li key={i} className="font-sans text-base flex gap-3">
                      <span className="shrink-0 text-volt font-bold">•</span>
                      <Glossarized text={item} />
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Hard mode: edge cases */}
            {internalHardMode && deep?.advanced?.edgeCases && (
              <Card className="bg-hot/10 border-hot/40">
                <p className="font-mono text-xs uppercase font-bold mb-3 opacity-60">
                  ⚠ Edge cases
                </p>
                <ul className="space-y-2">
                  {deep.advanced.edgeCases.map((item, i) => (
                    <li key={i} className="font-sans text-base flex gap-3">
                      <span className="shrink-0 font-bold">•</span>
                      <Glossarized text={item} />
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Hard mode: engineer notes */}
            {internalHardMode && deep?.advanced?.engineerNotes && (
              <Card className="bg-ink text-bone">
                <p className="font-mono text-xs uppercase font-bold mb-3 opacity-50">
                  🔧 Engineer notes
                </p>
                <ul className="space-y-2">
                  {deep.advanced.engineerNotes.map((item, i) => (
                    <li key={i} className="font-sans text-base flex gap-3 opacity-90">
                      <span className="shrink-0 font-bold">•</span>
                      <Glossarized text={item} />
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        </Section>

        {/* ── HOW IT WORKS ───────────────────────────────────────────────────── */}
        {(deep?.mechanism || deep?.flow) && (
          <Section label="How it works" icon="⚙️">
            <div className="space-y-3">
              {deep?.mechanism && (
                <Card className="bg-volt/10 border-volt/30">
                  <p className="font-sans text-base leading-relaxed">
                    {deep.mechanism}
                  </p>
                </Card>
              )}
              {deep?.flow && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-xs uppercase opacity-50 tracking-wide">
                      Signal flow — watch the dot
                    </p>
                    <button
                      type="button"
                      onClick={() => setFlowKey((k) => k + 1)}
                      className="brutal-border bg-acid px-3 py-1.5 font-mono text-xs uppercase brutal-press rounded"
                    >
                      ▶ Replay
                    </button>
                  </div>
                  <AnimatedSignalFlow
                    flow={deep.flow}
                    replayKey={flowKey}
                    legend="Glowing dot = your signal travelling through Live."
                  />
                </div>
              )}
            </div>
          </Section>
        )}

        {/* ── LISTEN FOR ─────────────────────────────────────────────────────── */}
        {deep?.listenFor && (
          <Section label="Listen for" icon="🎧">
            <Card className={`${accentBg}/10`}>
              <ul className="space-y-2.5">
                {deep.listenFor
                  .slice(0, internalHardMode ? 99 : 3)
                  .map((x, i) => (
                    <li key={i} className="font-sans text-base flex gap-3">
                      <span className="shrink-0 text-lg leading-tight">🎵</span>
                      <Glossarized text={x} />
                    </li>
                  ))}
              </ul>
            </Card>
          </Section>
        )}

        {/* ── WALKTHROUGH ────────────────────────────────────────────────────── */}
        {deep?.walkthrough && (
          <Section label={`Walkthrough · ${deep.walkthrough.length} steps`} icon="🚶">
            <ol className="space-y-3">
              {deep.walkthrough.map((s, i) => (
                <li key={i} className="flex gap-4">
                  {/* Step number */}
                  <div className="brutal-border bg-acid text-ink w-8 h-8 rounded-full flex items-center justify-center font-display text-sm shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <Card className="flex-1">
                    <p className="font-sans text-base font-semibold mb-1">
                      <Glossarized text={s.do} />
                    </p>
                    <p className="font-sans text-sm opacity-70 leading-relaxed">
                      🎧 <Glossarized text={s.listen} />
                    </p>
                  </Card>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {/* ── PRO MOVES — hard mode only ─────────────────────────────────────── */}
        {internalHardMode && deep?.proMoves && (
          <Section label="Pro moves" icon="⭐">
            <Card className="bg-ink text-bone">
              <ul className="space-y-2.5">
                {deep.proMoves.map((x, i) => (
                  <li key={i} className="font-sans text-base flex gap-3 opacity-90">
                    <span className="shrink-0 text-acid font-bold">★</span>
                    <Glossarized text={x} />
                  </li>
                ))}
              </ul>
            </Card>
          </Section>
        )}

        {/* ── COMMON MISTAKES ────────────────────────────────────────────────── */}
        {deep?.mistakes && (
          <Section label="Common mistakes" icon="⚠️">
            <Card className="bg-hot/8 border-hot/30">
              <ul className="space-y-2.5">
                {deep.mistakes.map((x, i) => (
                  <li key={i} className="font-sans text-base flex gap-3">
                    <span className="shrink-0 text-hot font-bold">✗</span>
                    <Glossarized text={x} />
                  </li>
                ))}
              </ul>
            </Card>
          </Section>
        )}

        {/* ── RELATED ────────────────────────────────────────────────────────── */}
        {deep?.related && deep.related.length > 0 && (
          <Section label="Related" icon="🔗">
            <div className="flex flex-wrap gap-2">
              {deep.related.map((r, i) => {
                const href =
                  r.kind === "mission"
                    ? `/learn/${r.slug}`
                    : r.kind === "device"
                    ? `/device/${r.slug}`
                    : `/glossary#${r.slug}`;
                return (
                  <a
                    key={i}
                    href={href}
                    className="brutal-border bg-bone hover:bg-sun px-3 py-2 font-sans text-sm brutal-press transition-colors rounded"
                  >
                    → {r.label}
                  </a>
                );
              })}
            </div>
          </Section>
        )}

        {/* ── INTERACTIVE SIM ────────────────────────────────────────────────── */}
        <Section label="Try it" icon="🎛">
          <div className="brutal-border rounded-lg overflow-hidden">
            <Simulator type={m.sim.type} preset={m.sim.preset} />
          </div>
        </Section>

        {/* ── QUIZ ───────────────────────────────────────────────────────────── */}
        <Section label={internalHardMode ? "Quiz · Hard mode 🔥" : "Quick quiz"} icon="🧠">
          {internalHardMode && (
            <div className="brutal-border bg-hot/10 border-hot/30 text-ink px-4 py-3 rounded-md font-sans text-sm mb-4">
              <strong>Hard mode:</strong> no hints · pass threshold 70% ·{" "}
              {deep?.quizHard?.length
                ? "harder questions loaded"
                : "hints removed from standard questions"}
            </div>
          )}

          {/* Context banner */}
          <Card className="bg-volt/10 border-volt/30 mb-4">
            <div className="flex items-start gap-3">
              <span className="text-xl shrink-0">🧠</span>
              <div>
                <p className="font-mono text-xs uppercase opacity-60 mb-1">
                  Test your knowledge
                </p>
                <p className="font-sans text-sm leading-relaxed opacity-90">
                  Based on <strong>{m.title}</strong>. Use what you just read —
                  not general knowledge.
                </p>
              </div>
            </div>
          </Card>

          <Quiz
            key={`${m.slug}-${internalHardMode}`}
            qs={quizQs}
            resetKey={`${m.slug}-${internalHardMode}`}
            meta={{
              missionTitle: m.title,
              missionNumber: m.number,
              xpEarned: earnedXp,
              nextSlug,
            }}
            onComplete={onQuizDone}
            onWrongAnswer={onWrong}
            onCorrectAnswer={onCorrect}
            onPerfect={onCorrect}
          />
        </Section>

        {/* ── SOURCE CITATION ────────────────────────────────────────────────── */}
        <LessonSourceBar source={ctx?.path?.source} />

        {/* ── NEXT LESSON CTA ────────────────────────────────────────────────── */}
        {nextSlug && done && (
          <Link
            href={`/learn/${nextSlug}`}
            className="w-full brutal-border brutal-shadow bg-acid text-ink py-5 font-display text-2xl brutal-press brutal-hover text-center block rounded-lg"
          >
            Next Lesson →
          </Link>
        )}
      </div>

      {/* ── COMPLETION MODAL ───────────────────────────────────────────────── */}
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
