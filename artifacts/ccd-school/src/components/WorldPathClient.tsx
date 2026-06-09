"use client";
/**
 * WorldPathClient — FLOW MODE: the focused Duolingo-style snake.
 *
 * Rendered inside WorldShell (embedded), so it has NO hero / chapter strip /
 * mode switch of its own — the rail owns those. This is pure trail.
 *
 * Visual upgrades:
 *  ✓ Continuous central TRAIL line the nodes weave around (real snake feel)
 *  ✓ Chapter "biomes" — tinted bands with a banner header + cat quip
 *  ✓ Parallax decorative cats drifting as you scroll
 *  ✓ Milestone CHEST at the end of every chapter (trophy)
 *  ✓ Polished nodes — depth, springy hover, active node pulse + mascot
 *  ✓ Chapter SKIP test preserved (mini placement test → unlock chapter)
 */
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import type { ReactNode } from "react";
import { useProgress, getLessonStrength, REVIEW_THRESHOLD } from "@/lib/progress";
import { chaptersByWorld } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";
import { FOUNDATIONS_MISSIONS } from "@/content/missions-foundations";
import { DJ_WORLD_MISSIONS } from "@/content/missions-dj";
import { MISSIONS } from "@/content/missions";
import { PLACEMENT_QUESTIONS, scorePlacement } from "@/content/placement-questions";
import {
  WORLD_THEME, CHAPTER_EMOJIS, CHAPTER_CAT_QUIPS, type WorldId,
} from "@/components/world/worldTheme";
import type { Mission } from "@/content/types";
import type { Chapter } from "@/content/chapters";

type NodeState = "locked" | "available" | "complete" | "review";

interface PathNode {
  slug: string;
  title: string;
  xp: number;
  chapterSlug: string;
  chapterIndex: number;
  state: NodeState;
  isFirstInChapter: boolean;
  isLastInChapter: boolean;
}

function getMissions(world: WorldId): Mission[] {
  if (world === "fundamentals") return FOUNDATIONS_MISSIONS;
  if (world === "dj") return DJ_WORLD_MISSIONS;
  return MISSIONS;
}

// Horizontal offset pattern — a smooth sine the trail weaves through
const OFFSETS = [0, -72, -96, -72, 0, 72, 96, 72];

// ─── Parallax hook ────────────────────────────────────────────────────────────
function useParallax(speed: number) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (ref.current) ref.current.style.transform = `translateY(${window.scrollY * speed}px)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, [speed]);
  return ref;
}

// ─── Mini placement test (chapter skip) ───────────────────────────────────────
function MiniPlacementTest({ world, chapterNumber, onUnlock, onClose }: {
  world: WorldId; chapterNumber: number;
  onUnlock: (chapter: number) => void; onClose: () => void;
}) {
  const t = WORLD_THEME[world];
  const questions = PLACEMENT_QUESTIONS.filter((q) => q.world === world);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [picked, setPicked] = useState<number | null>(null);
  const [phase, setPhase] = useState<"picking" | "answered" | "done">("picking");
  const total = questions.length;
  const current = questions[qIdx];

  const pick = useCallback((idx: number) => {
    if (phase !== "picking" || !current) return;
    setPicked(idx);
    setPhase("answered");
    setAnswers((p) => ({ ...p, [current.id]: idx === current.answer }));
  }, [phase, current]);

  const next = useCallback(() => {
    if (qIdx < total - 1) { setQIdx((i) => i + 1); setPhase("picking"); setPicked(null); }
    else setPhase("done");
  }, [qIdx, total]);

  const correct = Object.values(answers).filter(Boolean).length;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <>
      <div className="fixed inset-0 z-[70] bg-ink/75 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        className={`fixed inset-x-4 top-[8vh] z-[80] max-w-md mx-auto brutal-border brutal-shadow animate-pop-in ${t.dark ? "bg-[#0a1228] text-bone" : "bg-bone text-ink"}`}
        role="dialog" aria-modal="true" aria-label="Chapter skip test"
      >
        <div className={`px-5 py-4 border-b-4 border-ink flex items-center justify-between ${t.accentBg} ${t.accentText}`}>
          <div>
            <div className="font-mono text-[9px] uppercase opacity-60">Chapter {chapterNumber} · Skip test</div>
            <div className="font-display text-xl leading-tight">Already know this?</div>
          </div>
          <button onClick={onClose} className="brutal-border bg-ink/20 px-3 py-1.5 font-display text-xs brutal-press" aria-label="Close">✕</button>
        </div>

        <div className="p-5">
          {phase === "done" ? (
            <div className="space-y-4">
              <div className="text-center py-3">
                <div className="text-5xl mb-2">{pct >= 75 ? "🎉" : pct >= 50 ? "👍" : "📚"}</div>
                <div className="font-display text-3xl">{correct}/{total} correct</div>
                <div className="font-mono text-xs opacity-55 mt-1">
                  {pct >= 50 ? "You can skip ahead." : "Worth doing this chapter — but your call."}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onUnlock(chapterNumber)} className="flex-1 brutal-border bg-acid text-ink py-3 font-display text-base brutal-press hover:bg-sun transition-colors">
                  SKIP TO CH {chapterNumber} →
                </button>
                <button onClick={onClose} className="brutal-border px-4 py-3 font-mono text-xs uppercase brutal-press hover:bg-ink/10 transition-colors">Cancel</button>
              </div>
            </div>
          ) : current ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 brutal-border bg-ink/10 overflow-hidden">
                  <div className="h-full bg-acid transition-all duration-300" style={{ width: `${(qIdx / total) * 100}%` }} />
                </div>
                <span className="font-mono text-[9px] opacity-50">{qIdx + 1}/{total}</span>
              </div>
              <div className="brutal-border bg-ink/5 p-4 font-display text-lg leading-snug">{current.q}</div>
              <div className="grid gap-1.5">
                {current.options.map((opt, i) => {
                  let cls = "bg-ink/5 hover:bg-ink/15 brutal-press cursor-pointer";
                  if (phase === "answered") {
                    if (i === current.answer) cls = "bg-acid text-ink font-bold";
                    else if (i === picked) cls = "bg-hot text-bone";
                    else cls = "bg-ink/5 opacity-40 cursor-default";
                  }
                  return (
                    <button key={i} onClick={() => pick(i)} disabled={phase === "answered"}
                      className={`brutal-border px-4 py-3 text-left font-mono text-sm transition-colors ${cls}`}>
                      <span className="opacity-40 mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
                    </button>
                  );
                })}
              </div>
              {phase === "answered" && (
                <div className="space-y-2">
                  <div className={`brutal-border p-3 font-mono text-xs leading-relaxed ${answers[current.id] ? "bg-acid/20" : "bg-hot/15"}`}>
                    {answers[current.id] ? "✓ Correct! " : "✗ Not quite — "}{current.explain}
                  </div>
                  <button onClick={next} className="w-full brutal-border bg-ink text-bone py-3 font-display text-base brutal-press hover:bg-electric-blue transition-colors">
                    {qIdx < total - 1 ? "NEXT →" : "SEE RESULT →"}
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="px-5 py-3 border-t-4 border-ink flex items-center justify-between">
          <span className="font-mono text-[9px] opacity-40">No hearts lost · placement only</span>
          <button onClick={() => onUnlock(chapterNumber)} className="font-mono text-[9px] uppercase opacity-40 hover:opacity-80 transition-opacity">
            Skip test &amp; unlock →
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Animated cat intro (new users) ───────────────────────────────────────────
function AnimatedCatIntro({ world, firstSlug }: { world: WorldId; firstSlug: string }) {
  const t = WORLD_THEME[world];
  const [visible, setVisible] = useState(false);
  const [bubble, setBubble] = useState(false);
  useEffect(() => {
    const a = setTimeout(() => setVisible(true), 100);
    const b = setTimeout(() => setBubble(true), 400);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);

  const WELCOME: Record<WorldId, { headline: string; body: string }> = {
    fundamentals: { headline: "Hi! I'm DJ Pawsworth 🐱", body: "Start with the basics of sound. Each lesson takes ~5 min. Tap START and follow the trail!" },
    dj: { headline: "Ready to DJ? 🎧", body: "I'll guide you through mixing step by step. First: what DJing actually is." },
    producer: { headline: "Welcome to the studio 🎛", body: "We'll tour Ableton Live together — one lesson at a time." },
  };
  const w = WELCOME[world];

  return (
    <div className="flex justify-center mb-10">
      <div className={`transition-all duration-500 ease-out w-full max-w-[340px] ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className={`brutal-border brutal-shadow p-6 ${t.dark ? "bg-[#0a1a3e] text-bone border-t-4 border-t-volt" : world === "fundamentals" ? "bg-acid text-ink" : "bg-sun text-ink"}`}>
          <div className="flex items-start gap-4 mb-4">
            <div style={{ filter: "drop-shadow(3px 3px 0 rgba(0,0,0,0.4))" }} className="shrink-0 animate-bounce-bob">
              <Image src={t.catMain} alt="" width={64} height={64} className="object-contain" />
            </div>
            <div className={`transition-all duration-[400ms] ease-out ${bubble ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"}`}>
              <div className="font-display text-xl leading-tight">{w.headline}</div>
              <div className="font-mono text-[10px] uppercase opacity-55 mt-0.5">Your guide for this world</div>
            </div>
          </div>
          <p className={`font-mono text-xs leading-relaxed mb-5 transition-all duration-500 delay-100 ${bubble ? "opacity-80 translate-y-0" : "opacity-0 translate-y-2"}`}>{w.body}</p>
          <Link href={`/learn/${firstSlug}`} className={`block w-full text-center font-display text-base py-4 brutal-border brutal-press transition-colors ${t.dark ? "bg-volt text-ink hover:bg-acid" : "bg-ink text-bone hover:bg-electric-blue"}`}>
            START FIRST LESSON →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Chapter banner ───────────────────────────────────────────────────────────
function ChapterBanner({ chapter, chapterIndex, world, quip, isUnlocked, onSkip }: {
  chapter: Chapter; chapterIndex: number; world: WorldId; quip: string;
  isUnlocked: boolean; onSkip: () => void;
}) {
  const t = WORLD_THEME[world];
  const emoji = CHAPTER_EMOJIS[chapter.slug] ?? "📖";
  const chNum = String(chapterIndex + 1).padStart(2, "0");
  return (
    <div className="flex justify-center pt-2 pb-8">
      <div className={`brutal-border max-w-[320px] w-full brutal-shadow overflow-hidden border-t-4 ${t.dark ? "border-t-volt bg-volt/10 text-bone" : world === "fundamentals" ? "border-t-acid bg-acid/20 text-ink" : "border-t-sun bg-sun/20 text-ink"}`}>
        <div className="px-5 pt-4 pb-3 text-center">
          <div className="font-mono text-[9px] uppercase opacity-55 mb-1">Chapter {chNum}</div>
          <div className="text-5xl mb-2">{emoji}</div>
          <div className="font-display text-xl leading-tight">{chapter.title}</div>
          <div className="font-mono text-[10px] opacity-55 mt-1 leading-snug uppercase">{chapter.tagline}</div>
        </div>
        <div className={`px-4 py-2.5 flex items-center justify-center gap-2 font-mono text-[10px] italic border-t-2 border-current/15 ${t.dark ? "bg-volt/8" : "bg-ink/5"}`}>
          <span className="shrink-0">🐱</span><span className="opacity-70">&ldquo;{quip}&rdquo;</span>
        </div>
        {!isUnlocked && (
          <div className="px-4 py-3 border-t-2 border-current/15 flex items-center justify-between gap-3">
            <span className="font-mono text-[8px] uppercase opacity-45">Know this already?</span>
            <button onClick={onSkip} className={`brutal-border px-3 py-1.5 font-display text-xs brutal-press transition-colors ${t.dark ? "bg-bone/10 hover:bg-bone/20" : "bg-ink/10 hover:bg-ink/20"}`}>
              Skip chapter →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Milestone chest (end of chapter) ─────────────────────────────────────────
function Milestone({ world, complete, trophyName }: { world: WorldId; complete: boolean; trophyName: string }) {
  const t = WORLD_THEME[world];
  return (
    <div className="flex flex-col items-center gap-2 pt-2 pb-10">
      <div
        className={`w-20 h-20 rounded-full brutal-border flex items-center justify-center transition-transform ${complete ? `${t.accentBg} ${t.accentText}` : t.dark ? "bg-bone/5 text-bone/40 border-bone/20" : "bg-ink/5 text-ink/35 border-ink/20"}`}
        style={complete ? { boxShadow: `0 0 0 6px ${t.glow}` } : undefined}
      >
        <span className="text-3xl">{complete ? "🏆" : "🎁"}</span>
      </div>
      <span className={`font-mono text-[9px] uppercase ${t.textMuted}`}>
        {complete ? trophyName : "Chapter reward"}
      </span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function WorldPathClient({ worldSlug }: { worldSlug: string; embedded?: boolean }) {
  const world = worldSlug as WorldId;
  const t = WORLD_THEME[world];
  const { progress, setPlacement } = useProgress();
  const completed = progress.completedMissions;
  const strengths = progress.lessonStrengths;
  const unlockedChapter = progress.unlockedChapter ?? 1;

  const [jumpChapter, setJumpChapter] = useState<number | null>(null);

  const chapters = chaptersByWorld(world);
  const paths = pathsByWorld(world);
  const missions = getMissions(world);

  // Build node list
  const nodes: PathNode[] = [];
  let prevComplete = true;
  chapters.forEach((ch, chIdx) => {
    const placedPast = chIdx + 1 < unlockedChapter;
    const chPaths = paths.filter((p) => p.chapter === ch.slug).sort((a, b) => a.number - b.number);
    const flat = chPaths.flatMap((p) => p.missionSlugs);
    flat.forEach((slug, i) => {
      const isDone = !!completed[slug];
      const ls = strengths[slug];
      const needsReview = isDone && ls && getLessonStrength(ls) < REVIEW_THRESHOLD;
      let state: NodeState = "locked";
      if (isDone) state = needsReview ? "review" : "complete";
      else if (placedPast) state = "available";
      else if (prevComplete) state = "available";
      nodes.push({
        slug,
        xp: missions.find((m) => m.slug === slug)?.xp ?? 40,
        title: missions.find((m) => m.slug === slug)?.title ?? slug,
        chapterSlug: ch.slug, chapterIndex: chIdx, state,
        isFirstInChapter: i === 0,
        isLastInChapter: i === flat.length - 1,
      });
      prevComplete = isDone || placedPast;
    });
  });

  const total = nodes.length;
  const done = nodes.filter((n) => n.state === "complete" || n.state === "review").length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const isNewUser = done === 0;

  const youAreHereRef = useRef<HTMLDivElement>(null);
  const firstAvailableIdx = nodes.findIndex((n) => n.state === "available");
  const firstAvailableSlug = nodes.find((n) => n.state === "available")?.slug;

  useEffect(() => {
    if (!isNewUser && youAreHereRef.current) {
      const id = setTimeout(() => youAreHereRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 500);
      return () => clearTimeout(id);
    }
  }, [isNewUser]);

  // parallax layers
  const para1 = useParallax(-0.06);
  const para2 = useParallax(0.05);
  const para3 = useParallax(-0.09);

  if (!t) return <div className="p-8 font-mono">World not found: {worldSlug}</div>;

  const handleUnlock = (chapterNumber: number) => {
    setPlacement(chapterNumber);
    setJumpChapter(null);
    const ch = chapters[chapterNumber - 1];
    if (ch) setTimeout(() => document.getElementById(`chapter-${ch.slug}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
  };

  let globalIdx = -1;

  return (
    <div className={`relative ${t.surface} ${t.textPrimary} overflow-hidden`}>

      {/* Parallax decorative cats */}
      <div ref={para1} className="absolute top-24 left-3 w-12 h-12 opacity-15 pointer-events-none wiggle" aria-hidden>
        <Image src={t.deco1} alt="" fill className="object-contain" />
      </div>
      <div ref={para2} className="absolute top-[40%] right-4 w-14 h-14 opacity-10 pointer-events-none spin-slow" aria-hidden>
        <Image src={t.deco2} alt="" fill className="object-contain" />
      </div>
      <div ref={para3} className="absolute top-[70%] left-5 w-10 h-10 opacity-[0.12] pointer-events-none float" aria-hidden>
        <Image src={t.catDeco1} alt="" fill className="object-contain" />
      </div>

      <div className="relative z-10 max-w-xl mx-auto px-4 pt-8 pb-32">

        {isNewUser && firstAvailableSlug && (
          <AnimatedCatIntro world={world} firstSlug={firstAvailableSlug} />
        )}

        {chapters.map((ch, chIdx) => {
          const chNodes = nodes.filter((n) => n.chapterSlug === ch.slug);
          if (chNodes.length === 0) return null;
          const quip = (CHAPTER_CAT_QUIPS[world] ?? [])[chIdx] ?? "Let's go!";
          const isUnlocked = chIdx + 1 < unlockedChapter || chIdx === 0;
          const chDone = chNodes.filter((n) => n.state === "complete" || n.state === "review").length;
          const chComplete = chDone === chNodes.length;

          return (
            <section
              key={ch.slug}
              id={`chapter-${ch.slug}`}
              className={`relative mb-4 ${t.biomeTint} border-l-4 ${t.dark ? "border-l-volt/40" : world === "producer" ? "border-l-sun" : "border-l-acid"}`}
              style={{ scrollMarginTop: "120px" }}
            >
              <ChapterBanner
                chapter={ch} chapterIndex={chIdx} world={world} quip={quip}
                isUnlocked={isUnlocked} onSkip={() => setJumpChapter(chIdx + 1)}
              />

              {/* Trail + nodes */}
              <div className="relative pb-2">
                {/* central trail line */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[3px] rounded-full"
                  style={{ background: t.trail }}
                  aria-hidden
                />
                {chNodes.map((node) => {
                  globalIdx += 1;
                  const offset = OFFSETS[globalIdx % OFFSETS.length];
                  const isHere = nodes.indexOf(node) === firstAvailableIdx;
                  return (
                    <div key={node.slug} className="relative z-10 flex justify-center my-9" style={{ transform: `translateX(${offset}px)` }}>
                      {isHere ? (
                        <div className="flex flex-col items-center gap-1.5">
                          {!isNewUser && (
                            <div className={`brutal-border px-3 py-1 font-display text-[10px] uppercase mb-1 animate-pulse ${t.dark ? "bg-volt text-ink" : "bg-acid text-ink"}`}>
                              🐾 YOU ARE HERE
                            </div>
                          )}
                          <div ref={youAreHereRef}><LessonNode node={node} world={world} /></div>
                          {/* mascot beside active node */}
                          <div className="absolute -right-14 top-1 w-12 h-12 animate-bounce-bob hidden sm:block" aria-hidden style={{ filter: "drop-shadow(2px 2px 0 rgba(0,0,0,0.25))" }}>
                            <Image src={t.catMain} alt="" width={48} height={48} className="w-full h-full object-contain" />
                          </div>
                        </div>
                      ) : (
                        <LessonNode node={node} world={world} />
                      )}
                    </div>
                  );
                })}
              </div>

              <Milestone world={world} complete={chComplete} trophyName={ch.trophy.name} />
            </section>
          );
        })}

        {pct === 100 && (
          <div className={`brutal-border p-8 text-center brutal-shadow mt-4 ${t.dark ? "bg-volt text-ink" : "bg-acid text-ink"}`}>
            <div className="flex justify-center mb-3">
              <Image src={t.catMain} alt="" width={96} height={96} className="drop-shadow-[4px_4px_0_rgba(0,0,0,0.3)] animate-bounce-bob" />
            </div>
            <div className="text-5xl mb-2">🏆</div>
            <div className="font-display text-4xl">WORLD COMPLETE!</div>
            <div className="font-mono text-sm opacity-65 mt-2">You finished {t.title}. Incredible.</div>
            <Link href="/worlds" className="mt-5 brutal-border bg-ink text-bone px-7 py-3.5 font-display text-base inline-block brutal-press hover:bg-electric-blue transition-colors">
              EXPLORE OTHER WORLDS →
            </Link>
          </div>
        )}
      </div>

      {jumpChapter !== null && (
        <MiniPlacementTest world={world} chapterNumber={jumpChapter} onUnlock={handleUnlock} onClose={() => setJumpChapter(null)} />
      )}
    </div>
  );
}

// ─── Lesson node ──────────────────────────────────────────────────────────────
function LessonNode({ node, world }: { node: PathNode; world: WorldId }) {
  const t = WORLD_THEME[world];

  const Label = ({ text, dim }: { text: string; dim?: boolean }) => (
    <span className={`font-mono text-[10px] uppercase leading-tight text-center max-w-[100px] line-clamp-2 ${dim ? "opacity-20" : "opacity-55"}`}>{text}</span>
  );

  if (node.state === "locked") {
    return (
      <div className="flex flex-col items-center gap-2 cursor-not-allowed" title={node.title}>
        <div className="w-14 h-14 rounded-full border-2 border-current/15 bg-current/5 flex items-center justify-center opacity-25">
          <span className="text-lg">🔒</span>
        </div>
        <Label text={node.title} dim />
      </div>
    );
  }

  if (node.state === "complete") {
    return (
      <a href={`/learn/${node.slug}`} className="block brutal-press" title={`${node.title} — completed`}>
        <div className="flex flex-col items-center gap-2 group">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${t.nodeDone} transition-transform group-hover:scale-110 group-hover:-translate-y-0.5`} style={{ boxShadow: "0 5px 0 rgba(0,0,0,0.18)" }}>
            <span className="text-2xl font-bold">✓</span>
          </div>
          <Label text={node.title} />
        </div>
      </a>
    );
  }

  if (node.state === "review") {
    return (
      <a href={`/learn/${node.slug}?review=1`} className="block brutal-press" title={`${node.title} — needs review`}>
        <div className="flex flex-col items-center gap-2 group">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${t.nodeReview} transition-transform group-hover:scale-110`} style={{ animation: "pulse 2s ease-in-out infinite", boxShadow: "0 5px 0 rgba(0,0,0,0.18)" }}>
            <span className="text-2xl">🔥</span>
          </div>
          <Label text="Review" />
        </div>
      </a>
    );
  }

  // available
  return (
    <a href={`/learn/${node.slug}`} className="block brutal-press" title={node.title}>
      <div className="flex flex-col items-center gap-2 group">
        <div
          className={`w-28 h-28 rounded-full flex flex-col items-center justify-center gap-1 ${t.nodeAvail} transition-all group-hover:scale-110 group-hover:-translate-y-1`}
          style={{ boxShadow: `0 0 0 8px ${t.glow}, 0 6px 0 rgba(0,0,0,0.2)` }}
        >
          <span className="font-display text-sm font-bold leading-tight text-center px-3 line-clamp-2">{node.title}</span>
          <span className="font-mono text-[9px] opacity-85 font-bold">+{node.xp} XP</span>
        </div>
        <Label text={node.title} />
      </div>
    </a>
  );
}
