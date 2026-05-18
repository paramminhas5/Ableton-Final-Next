import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BEGINNER_MISSIONS, beginnerMissionBySlug } from "@/content/beginner-foundations";
import { useProgress } from "@/lib/progress";
import { useState } from "react";

export const Route = createFileRoute("/beginner/$slug")({
  head: ({ params }) => {
    const m = beginnerMissionBySlug(params.slug);
    return {
      meta: [
        { title: `${m?.title ?? "Lesson"} — Beginner · CCD.SCHOOL` },
        { name: "description", content: m?.tagline ?? "" },
      ],
    };
  },
  loader: ({ params }) => {
    const m = beginnerMissionBySlug(params.slug);
    if (!m) throw notFound();
    return m;
  },
  notFoundComponent: () => (
    <div className="p-12 font-mono text-center">
      <div className="font-display text-4xl">404</div>
      <div className="mt-2">Lesson not found.</div>
      <Link to="/beginner" className="brutal-border bg-acid px-4 py-2 mt-4 inline-block font-mono text-xs uppercase">← Back</Link>
    </div>
  ),
  component: BeginnerMissionPage,
});

type Phase = "learn" | "quiz" | "done";

function BeginnerMissionPage() {
  const mission = Route.useLoaderData();
  const { progress, completeMission } = useProgress();
  const [phase, setPhase] = useState<Phase>("learn");
  const [showDeeper, setShowDeeper] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [quizIdx, setQuizIdx] = useState(0);
  const [answers, setAnswers] = useState<{ correct: boolean }[]>([]);
  const [showHint, setShowHint] = useState(false);

  const mIdx = BEGINNER_MISSIONS.findIndex((m) => m.slug === mission.slug);
  const next = BEGINNER_MISSIONS[mIdx + 1];
  const prev = BEGINNER_MISSIONS[mIdx - 1];
  const alreadyDone = !!progress.completedMissions[mission.slug];

  const q = mission.quiz[quizIdx];
  const isLastQ = quizIdx === mission.quiz.length - 1;

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
  };

  const handleNext = () => {
    if (selected === null) return;
    const correct = selected === q.answer;
    const newAnswers = [...answers, { correct }];
    setAnswers(newAnswers);
    setSelected(null);
    setShowHint(false);
    if (!isLastQ) {
      setQuizIdx((i) => i + 1);
    } else {
      const score = newAnswers.filter((a) => a.correct).length / mission.quiz.length;
      completeMission(
        mission.slug,
        mission.xp,
        score,
        score >= 0.6 ? mission.badge?.slug : undefined,
      );
      setPhase("done");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-10 space-y-5">
      {/* Breadcrumb */}
      <nav className="font-mono text-xs uppercase opacity-50 flex gap-2">
        <Link to="/world/$slug" params={{ slug: "fundamentals" }} className="hover:opacity-100">← Fundamentals</Link>
        <span>/</span>
        <span>{mission.number}. {mission.title}</span>
      </nav>

      {/* Header */}
      <header className="brutal-border bg-acid p-5">
        <div className="font-mono text-[9px] uppercase opacity-60">
          FOUNDATION {mission.number}/{BEGINNER_MISSIONS.length} · {mission.xp} XP
        </div>
        <h1 className="font-display text-4xl mt-1">{mission.emoji} {mission.title}</h1>
        <p className="font-mono text-sm mt-1 opacity-70">{mission.tagline}</p>
        {alreadyDone && (
          <div className="mt-2 brutal-border bg-ink text-bone font-mono text-[9px] uppercase px-2 py-1 inline-block">✓ Completed</div>
        )}
      </header>

      {/* LEARN */}
      {phase === "learn" && (
        <>
          <section className="space-y-3">
            <div className="font-mono text-[9px] uppercase opacity-40">// EXPLAINED SIMPLY</div>
            {mission.simple.map((p: string, i: number) => (
              <p key={i} className="text-base leading-relaxed">{p}</p>
            ))}
          </section>

          <div className="brutal-border bg-sun p-4">
            <div className="font-mono text-[9px] uppercase opacity-60 mb-1.5">💡 ANALOGY</div>
            <p className="text-sm leading-relaxed">{mission.analogy}</p>
          </div>

          <button
            onClick={() => setShowDeeper((d) => !d)}
            className="brutal-border bg-bone px-4 py-2 font-mono text-xs uppercase brutal-press hover:bg-sun"
          >
            {showDeeper ? "▲ HIDE DEEPER DIVE" : "▼ GO DEEPER (optional)"}
          </button>
          {showDeeper && (
            <div className="brutal-border p-4 bg-bone space-y-2">
              <div className="font-mono text-[9px] uppercase opacity-40 mb-2">// DEEPER</div>
              {mission.deeper.map((p: string, i: number) => (
                <p key={i} className="text-sm leading-relaxed opacity-80">{p}</p>
              ))}
            </div>
          )}

          <div className="brutal-border border-ink/20 p-3">
            <div className="font-mono text-[9px] uppercase opacity-40 mb-2">SOURCES</div>
            <div className="flex flex-wrap gap-2">
              {mission.sources.map((s: {label: string; url: string; section?: string}, i: number) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                  className="brutal-border bg-bone px-2 py-1 font-mono text-[9px] uppercase opacity-60 hover:opacity-100 hover:bg-sun">
                  ↗ {s.label}
                </a>
              ))}
            </div>
          </div>

          <button
            onClick={() => setPhase("quiz")}
            className="brutal-border bg-ink text-bone px-6 py-3 font-display text-xl brutal-press w-full"
          >
            TAKE THE QUIZ →
          </button>

          <div className="flex gap-3">
            {prev && (
              <Link to="/beginner/$slug" params={{ slug: prev.slug }}
                className="brutal-border bg-bone px-4 py-2 font-mono text-xs uppercase brutal-press">
                ← {prev.title}
              </Link>
            )}
            {next && (
              <Link to="/beginner/$slug" params={{ slug: next.slug }}
                className="ml-auto brutal-border bg-bone px-4 py-2 font-mono text-xs uppercase brutal-press">
                {next.title} →
              </Link>
            )}
          </div>
        </>
      )}

      {/* QUIZ */}
      {phase === "quiz" && (
        <div className="space-y-4">
          <div className="brutal-border bg-volt text-bone p-4">
            <div className="font-mono text-[9px] uppercase opacity-60 mb-1">
              QUESTION {quizIdx + 1}/{mission.quiz.length}
            </div>
            <p className="font-sans text-lg font-semibold">{q.q}</p>
          </div>

          <div className="space-y-2">
            {q.options.map((opt: string, i: number) => {
              const revealed = selected !== null;
              const isCorrect = i === q.answer;
              const isWrong = selected === i && !isCorrect;
              return (
                <button key={i} onClick={() => handleAnswer(i)} disabled={revealed}
                  className={`w-full brutal-border px-4 py-3 text-left text-sm brutal-press ${
                    revealed
                      ? isCorrect ? "bg-acid" : isWrong ? "bg-hot text-bone" : "bg-bone opacity-40"
                      : "bg-bone hover:bg-sun"
                  }`}>
                  <span className="font-mono text-[9px] uppercase opacity-40 mr-2">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </button>
              );
            })}
          </div>

          {selected === null && !showHint && (
            <button onClick={() => setShowHint(true)} className="font-mono text-[10px] uppercase opacity-40 hover:opacity-80 underline">
              Show hint
            </button>
          )}
          {showHint && selected === null && (
            <div className="brutal-border bg-sun p-3 font-mono text-xs">💡 {q.hint}</div>
          )}

          {selected !== null && (
            <>
              <div className={`brutal-border p-3 font-mono text-xs ${selected === q.answer ? "bg-acid" : "bg-hot text-bone"}`}>
                {selected === q.answer ? "✓ CORRECT! " : "✗ NOT QUITE. "}{q.explain}
              </div>
              <button onClick={handleNext}
                className="w-full brutal-border bg-ink text-bone px-4 py-3 font-display text-lg brutal-press">
                {isLastQ ? "FINISH →" : "NEXT →"}
              </button>
            </>
          )}
        </div>
      )}

      {/* DONE */}
      {phase === "done" && (
        <div className="space-y-4">
          <div className="brutal-border bg-acid p-6 text-center">
            <div className="font-display text-5xl">🎉</div>
            <div className="font-display text-3xl mt-2">COMPLETE!</div>
            <div className="font-mono text-sm mt-1 opacity-70">
              {answers.filter((a) => a.correct).length}/{mission.quiz.length} correct · +{mission.xp} XP
            </div>
            {mission.badge && (
              <div className="mt-3 brutal-border bg-ink text-bone font-mono text-xs uppercase px-3 py-1 inline-block">
                🏅 {mission.badge.name}
              </div>
            )}
          </div>
          <div className="flex gap-3">
            {prev && (
              <Link to="/beginner/$slug" params={{ slug: prev.slug }}
                className="flex-1 brutal-border bg-bone px-4 py-3 font-display text-lg brutal-press text-center">← PREV</Link>
            )}
            {next ? (
              <Link to="/beginner/$slug" params={{ slug: next.slug }}
                className="flex-1 brutal-border bg-ink text-bone px-4 py-3 font-display text-lg brutal-press text-center">NEXT →</Link>
            ) : (
              <Link to="/beginner"
                className="flex-1 brutal-border bg-volt text-bone px-4 py-3 font-display text-lg brutal-press text-center">ALL DONE ✓</Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
