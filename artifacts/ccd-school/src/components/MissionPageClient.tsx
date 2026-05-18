"use client";
import Link from "next/link";
import { missionBySlug, nextMission, prevMission } from "@/content/missions";
import { getMissionContext } from "@/lib/missionContext";
import { Simulator } from "@/components/sims/Simulator";
import { Quiz } from "@/components/Quiz";
import { useProgress } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import { useEffect, useMemo, useState } from "react";
import { LESSONS } from "@/content/lesson-deep";
import { AnimatedSignalFlow } from "@/components/AnimatedSignalFlow";
import { CompletionModal } from "@/components/CompletionModal";
import { HeartsWall } from "@/components/HeartsWall";
import { Glossarized, GlossaryScope } from "@/components/Term";
import { useAuth } from "@/lib/auth";
import { useGatingMode } from "@/components/ClientProviders";
import { isLocked } from "@/lib/gating";

export function MissionPageClient({ slug }: { slug: string }) {
  const m = missionBySlug(slug);
  if (!m) return <div className="p-12 font-mono text-xl">Mission not found: {slug}</div>;

  const ctx = getMissionContext(slug);
  const deep = LESSONS[slug];
  const hasAdvanced = !!(deep?.advanced);
  const [advancedTab, setAdvancedTab] = useState(false);
  const { learnMode } = useLearnMode();
  const { progress, completeMission, loseHeart, addXp } = useProgress();
  const { plan } = useAuth();
  const gatingMode = useGatingMode();

  const locked = isLocked(m, plan, gatingMode);

  const [completed, setCompleted] = useState(false);
  const [flowKey, setFlowKey] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [earnedScore, setEarnedScore] = useState(0);
  const [earnedBadge, setEarnedBadge] = useState<string | undefined>();

  useEffect(() => {
    setFlowKey(0);
    setShowModal(false);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "instant" });
  }, [slug]);

  useEffect(() => {
    setCompleted(!!progress.completedMissions[slug]);
  }, [slug, progress.completedMissions]);

  const next = nextMission(slug);
  const prev = prevMission(slug);
  const colorClass = { acid: "bg-acid", hot: "bg-hot text-bone", volt: "bg-volt text-bone", sun: "bg-sun", bone: "bg-bone", ink: "bg-ink text-bone" }[ctx.world === "fundamentals" ? "acid" : ctx.world === "dj" ? "ink" : ctx.world === "producer" ? "sun" : "bone"] ?? "bg-bone text-ink";

  const fallbackWhat = m.explainer.find((b) => b.kind === "lead" || b.kind === "para");
  const track = advancedTab ? deep?.advanced : deep?.beginner;
  const whatParas = track?.what ?? deep?.definition;

  const allTexts = useMemo(() => {
    const out: string[] = [];
    if (whatParas) out.push(...whatParas);
    else if (fallbackWhat && "text" in fallbackWhat) out.push(fallbackWhat.text);
    if (!advancedTab && deep?.beginner?.analogy) out.push(deep.beginner.analogy);
    if (!advancedTab && deep?.beginner?.why) out.push(...deep.beginner.why);
    if (advancedTab && deep?.advanced?.edgeCases) out.push(...deep.advanced.edgeCases);
    if (advancedTab && deep?.advanced?.engineerNotes) out.push(...deep.advanced.engineerNotes);
    if (deep?.listenFor) out.push(...deep.listenFor.slice(0, advancedTab ? 99 : 3));
    if (deep?.walkthrough) { for (const s of deep.walkthrough) { out.push(s.do); out.push(s.listen); } }
    if (advancedTab && deep?.proMoves) out.push(...deep.proMoves);
    if (deep?.mistakes) out.push(...deep.mistakes);
    return out;
  }, [slug, advancedTab, deep, whatParas, fallbackWhat]);

  const quizQs = useMemo(() => m.quiz, [slug]);
  const passThreshold = advancedTab ? 0.6 : 0.5;

  const onQuizDone = (score: number) => {
    const alreadyDone = !!progress.completedMissions[slug];
    const xp = alreadyDone ? 0 : m.xp;
    const badge = score >= passThreshold ? m.badge?.slug : undefined;
    completeMission(slug, m.xp, score, badge);
    setEarnedXp(xp);
    setEarnedScore(score);
    setEarnedBadge(badge ? m.badge?.name : undefined);
    setCompleted(true);
  };

  return (
    <GlossaryScope resetKey={slug} texts={allTexts}>
    <div className="max-w-5xl mx-auto p-4 md:p-12 space-y-6">
      {showModal && <CompletionModal mission={m} xpEarned={earnedXp} score={earnedScore} badgeName={earnedBadge} nextSlug={next?.slug} onClose={() => setShowModal(false)} />}

      <div className="flex items-center gap-1 font-mono text-[9px] uppercase opacity-60 flex-wrap">
        <Link href="/worlds" className="hover:opacity-100">Worlds</Link>
        {ctx.world && <><span>›</span><Link href={ctx.worldRoute} className="hover:opacity-100">{ctx.worldLabel}</Link></>}
        {ctx.chapter && <><span>›</span><span className="opacity-70">{ctx.chapter.title}</span></>}
        {ctx.path && <><span>›</span><Link href={`/path/${ctx.path.slug}`} className="hover:opacity-100">{ctx.path.title}</Link></>}
        <span>›</span><span className="text-ink">{m.title}</span>
      </div>

      {!locked && (
        <nav className="sticky top-[60px] z-30 brutal-border bg-bone p-2 flex flex-wrap gap-1 font-mono text-[10px] uppercase items-center">
          <a href="#hook" className="brutal-border px-2 py-1 bg-acid">Hook</a>
          <a href="#play" className="brutal-border px-2 py-1 bg-sun">Play</a>
          <a href="#how" className="brutal-border px-2 py-1 bg-volt text-bone">How</a>
          <a href="#quiz" className="brutal-border px-2 py-1 bg-hot text-bone">Quiz</a>
          <span className="ml-auto flex items-center gap-1">
            <button onClick={() => setAdvancedTab(false)} disabled={!hasAdvanced} className={`brutal-border px-3 py-1 font-mono text-[9px] uppercase brutal-press ${!advancedTab ? "bg-ink text-bone" : "bg-bone hover:bg-sun"} disabled:opacity-40 disabled:cursor-not-allowed`}>Standard</button>
            <button onClick={() => setAdvancedTab(true)} disabled={!hasAdvanced} className={`brutal-border px-3 py-1 font-mono text-[9px] uppercase brutal-press ${advancedTab ? "bg-ink text-bone" : "bg-bone hover:bg-sun"} disabled:opacity-40 disabled:cursor-not-allowed`}>Advanced</button>
            <span className="opacity-50 font-mono text-[9px] ml-1">M{m.number}</span>
          </span>
        </nav>
      )}

      <header id="hook" className={`${colorClass} brutal-border p-4 md:p-6 brutal-shadow`}>
        <div className="font-mono text-xs uppercase">Mission {String(m.number).padStart(3, "0")}</div>
        <h1 className="font-display text-4xl md:text-6xl mt-2">{m.title}</h1>
        <p className="font-mono mt-2 text-base md:text-lg">{m.tagline}</p>
        {deep?.hook && !locked && <p className="font-display text-xl md:text-2xl mt-3 leading-tight">{deep.hook}</p>}
        <div className="flex flex-wrap gap-2 mt-4 font-mono text-xs uppercase">
          <span className="brutal-border bg-bone text-ink px-2 py-1">+{m.xp} XP</span>
          {m.badge && <span className="brutal-border bg-ink text-bone px-2 py-1">🏅 {m.badge.name}</span>}
          {completed && !locked && <span className="brutal-border bg-acid text-ink px-2 py-1">✓ COMPLETE</span>}
          {locked && <span className="brutal-border bg-ink text-bone px-2 py-1">🔒 PRO</span>}
        </div>
      </header>

      {locked ? (
        <div className="brutal-border bg-ink text-bone p-8 md:p-12 text-center brutal-shadow">
          <div className="font-display text-5xl mb-2">🔒</div>
          <div className="font-display text-3xl md:text-4xl mb-4">PRO MISSION</div>
          <p className="font-mono text-sm opacity-70 mb-6 max-w-md mx-auto leading-relaxed">
            This {m.tier === "deep" ? "advanced" : "later"} mission is part of CCD.SCHOOL PRO.
            Upgrade to unlock all PRO missions, advanced content, and full access to every path.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 text-left max-w-lg mx-auto">
            {["First 3 missions in every path — free forever", "Advanced (deep) tier missions unlocked", "All 3 worlds: Fundamentals, DJ, Producer"].map((f, i) => (
              <div key={i} className="brutal-border bg-bone text-ink p-3 font-mono text-[9px] uppercase">✓ {f}</div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/upgrade" className="brutal-border bg-acid text-ink px-6 py-3 font-mono text-xs uppercase brutal-press hover:bg-volt transition-colors">UPGRADE TO PRO →</Link>
            <Link href="/missions" className="brutal-border bg-bone text-ink px-6 py-3 font-mono text-xs uppercase brutal-press hover:bg-sun transition-colors">FREE MISSIONS ←</Link>
          </div>
        </div>
      ) : (
        <>
          <section>
            <h2 className="font-display text-2xl mb-2">// WHAT IT DOES</h2>
            {whatParas ? (
              <div className="space-y-2">{whatParas.map((para, i) => <p key={i} className="font-mono text-sm md:text-base leading-relaxed"><Glossarized text={para} /></p>)}</div>
            ) : fallbackWhat && "text" in fallbackWhat ? (
              <p className="font-mono text-sm md:text-base leading-relaxed"><Glossarized text={fallbackWhat.text} /></p>
            ) : null}
            {!advancedTab && deep?.beginner?.analogy && (
              <div className="mt-3 brutal-border bg-acid p-3 font-mono text-sm">
                <span className="font-bold uppercase text-xs">Think of it like →</span>{" "}<Glossarized text={deep.beginner.analogy} />
              </div>
            )}
            {!advancedTab && deep?.beginner?.why && (
              <div className="mt-3 brutal-border bg-volt text-bone p-3">
                <div className="font-mono text-xs uppercase font-bold mb-1">▸ WHY YOU CARE</div>
                <ul className="space-y-1 font-mono text-sm">{deep.beginner.why.map((item, i) => <li key={i}>• <Glossarized text={item} /></li>)}</ul>
              </div>
            )}
          </section>

          <section id="play">
            <h2 className="font-display text-2xl mb-2">// SEE & HEAR IT</h2>
            <Simulator key={slug} type={m.sim.type} preset={m.sim.preset} />
          </section>

          {(deep?.mechanism || deep?.flow) && (
            <details id="how" open={advancedTab} className="brutal-border bg-card p-4"
              onToggle={(e) => { if ((e.currentTarget as HTMLDetailsElement).open) setFlowKey((k) => k + 1); }}>
              <summary className="font-mono text-xs uppercase cursor-pointer font-bold">▸ HOW IT WORKS</summary>
              <div className="mt-3 space-y-3">
                {deep?.mechanism && <p className="font-mono text-sm leading-relaxed brutal-border bg-volt text-bone p-3">{deep.mechanism}</p>}
                {deep?.flow && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-mono text-[10px] uppercase opacity-70">▸ Signal flow — watch the dot</div>
                      <button type="button" onClick={() => setFlowKey((k) => k + 1)} className="brutal-border bg-acid px-2 py-1 font-mono text-[10px] uppercase brutal-press">▶ Replay</button>
                    </div>
                    <AnimatedSignalFlow flow={deep.flow} replayKey={flowKey} legend="Glowing dot = your signal travelling through Live." />
                  </div>
                )}
              </div>
            </details>
          )}

          {deep?.listenFor && (
            <div className="brutal-border bg-sun p-3">
              <div className="font-mono text-xs uppercase mb-2 font-bold">▸ LISTEN FOR</div>
              <ul className="space-y-1 font-mono text-sm">{deep.listenFor.slice(0, advancedTab ? 99 : 3).map((x, i) => <li key={i}>• <Glossarized text={x} /></li>)}</ul>
            </div>
          )}

          {deep?.walkthrough && (
            <details open={!advancedTab} className="brutal-border bg-card p-4">
              <summary className="font-mono text-xs uppercase cursor-pointer font-bold">▸ WALKTHROUGH ({deep.walkthrough.length} steps)</summary>
              <ol className="space-y-2 mt-3">{deep.walkthrough.map((s, i) => (
                <li key={i} className="brutal-border bg-bone p-2 font-mono text-sm">
                  <div><span className="font-bold">{i + 1}. DO:</span> <Glossarized text={s.do} /></div>
                  <div className="opacity-80 mt-1">▸ LISTEN: <Glossarized text={s.listen} /></div>
                </li>
              ))}</ol>
            </details>
          )}

          {advancedTab && deep?.proMoves && (
            <details open className="brutal-border bg-ink text-bone p-4">
              <summary className="font-mono text-xs uppercase cursor-pointer font-bold">▸ PRO MOVES</summary>
              <ul className="space-y-1 mt-2 font-mono text-sm">{deep.proMoves.map((x, i) => <li key={i}>★ <Glossarized text={x} /></li>)}</ul>
            </details>
          )}

          {deep?.mistakes && (
            <details open={advancedTab} className="brutal-border bg-hot text-bone p-4">
              <summary className="font-mono text-xs uppercase cursor-pointer font-bold">▸ COMMON MISTAKES</summary>
              <ul className="space-y-1 mt-2 font-mono text-sm">{deep.mistakes.map((x, i) => <li key={i}>✗ <Glossarized text={x} /></li>)}</ul>
            </details>
          )}

          {deep?.related && deep.related.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {deep.related.map((r, i) => {
                const href = r.kind === "mission" ? `/mission/${r.slug}` : r.kind === "device" ? `/device/${r.slug}` : `/glossary#${r.slug}`;
                return <a key={i} href={href} className="brutal-border bg-volt text-bone px-3 py-2 font-mono text-xs uppercase brutal-press">→ {r.label}</a>;
              })}
            </div>
          )}

          <section id="quiz">
            <h2 className="font-display text-2xl mb-2">// QUIZ {advancedTab ? "(PRO)" : "(QUICK)"}</h2>
            {learnMode === "ccd" && progress.hearts === 0 ? <HeartsWall /> : learnMode === "ccd" ? (
              <div className="brutal-border bg-hot text-bone px-3 py-2 font-mono text-[10px] uppercase mb-3 flex items-center gap-2">
                <span>CCD Mode — wrong answers cost a ♥ · {progress.hearts} remaining</span>
              </div>
            ) : null}
            {!(learnMode === "ccd" && progress.hearts === 0) && (
              <Quiz key={slug} qs={quizQs} resetKey={slug}
                meta={{ missionTitle: m.title, missionNumber: m.number, xpEarned: earnedXp, badgeName: earnedBadge, nextSlug: next?.slug }}
                onComplete={onQuizDone}
                onWrongAnswer={learnMode === "ccd" ? loseHeart : undefined}
                onCorrectAnswer={addXp} onPerfect={addXp} />
            )}
          </section>
        </>
      )}

      <div className="flex justify-between gap-2 font-mono text-xs uppercase">
        {prev ? <Link href={`/mission/${prev.slug}`} className="brutal-border bg-bone px-3 py-2 brutal-press">← {prev.title}</Link> : <span />}
        {next ? <Link href={`/mission/${next.slug}`} className="brutal-border bg-acid px-3 py-2 brutal-press">{next.title} →</Link> : <span />}
      </div>
    </div>
    </GlossaryScope>
  );
}
