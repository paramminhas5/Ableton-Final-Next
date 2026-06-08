"use client";
import Link from "next/link";
import { pathBySlug } from "@/content/paths";
import { chapterBySlug } from "@/content/chapters";
import { missionBySlug, MISSIONS } from "@/content/missions";
import { useProgress } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";

const WORLD_COLORS = {
  fundamentals: { hero: "bg-acid text-ink", accent: "bg-acid", node: "bg-ink text-bone", bar: "bg-ink", cta: "bg-acid text-ink" },
  dj: { hero: "bg-ink text-bone", accent: "bg-volt", node: "bg-volt text-ink", bar: "bg-volt", cta: "bg-volt text-ink" },
  producer: { hero: "bg-sun text-ink", accent: "bg-sun", node: "bg-ink text-bone", bar: "bg-ink", cta: "bg-sun text-ink" },
};

export function PathPageClient({ slug }: { slug: string }) {
  const path = pathBySlug(slug);
  const { progress } = useProgress();
  const { learnMode } = useLearnMode();
  const completed = progress.completedMissions;

  if (!path) return <div className="p-8 font-mono text-xl">Path not found: {slug}</div>;

  const chapter = chapterBySlug(path.chapter);
  const colors = WORLD_COLORS[path.world as keyof typeof WORLD_COLORS] ?? WORLD_COLORS.fundamentals;

  const missions = path.missionSlugs.map((s, idx) => {
    const mission = missionBySlug(s) ?? MISSIONS.find((m) => m.slug === s);
    const isDone = !!completed[s];
    const prevSlug = path.missionSlugs[idx - 1];
    const prevDone = idx === 0 || !!completed[prevSlug];
    const locked = learnMode === "flow" && !prevDone && !isDone;
    return { slug: s, mission, isDone, locked, index: idx };
  });

  const doneCount = missions.filter((m) => m.isDone).length;
  const totalCount = missions.length;
  const pct = Math.round((doneCount / totalCount) * 100);
  const pathComplete = doneCount === totalCount;

  const COLS = 5;
  const getIndent = (idx: number) => {
    const row = Math.floor(idx / COLS);
    const col = row % 2 === 0 ? idx % COLS : COLS - 1 - (idx % COLS);
    return ["ml-0", "ml-[18%]", "ml-[36%]", "ml-[54%]", "ml-[72%]"][col];
  };

  return (
    <main className="min-h-screen bg-bone">
      <header className={`brutal-border border-x-0 border-t-0 ${colors.hero}`}>
        <div className="max-w-3xl mx-auto px-4 py-6 md:py-8">
          <div className="flex items-center gap-1 font-mono text-[9px] uppercase opacity-60 mb-3 flex-wrap">
            <Link href="/worlds" className="hover:opacity-100">Worlds</Link>
            <span>›</span>
            <Link href={`/world/${path.world}`} className="hover:opacity-100 capitalize">{path.world === "dj" ? "DJ World" : path.world}</Link>
            <span>›</span>
            {chapter && <Link href={`/world/${path.world}`} className="hover:opacity-100">{chapter.title}</Link>}
            <span>›</span>
            <span className="opacity-100">{path.title}</span>
          </div>
          <div className="font-mono text-[9px] uppercase opacity-50 mb-1">PATH {path.number} of {chapter?.pathSlugs.length ?? "?"} in {chapter?.title ?? ""}</div>
          <h1 className="font-display text-4xl md:text-6xl leading-none">{path.title.toUpperCase()}</h1>
          <p className="font-mono text-sm mt-2 opacity-70 leading-relaxed max-w-xl">{path.tagline}</p>
          {path.source && <div className="font-mono text-[9px] opacity-40 mt-2">Source: {path.source}</div>}
          <div className="flex items-center gap-3 mt-5">
            <div className={`flex-1 h-2.5 brutal-border overflow-hidden ${path.world === "dj" ? "bg-bone/20" : "bg-ink/10"}`}>
              <div className={`h-full ${colors.bar} transition-all duration-700`} style={{ width: `${pct}%` }} />
            </div>
            <div className="font-mono text-xs uppercase opacity-70 shrink-0">{doneCount}/{totalCount} · {pct}%</div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-10 pb-24">
        <div className="font-mono text-[9px] uppercase opacity-40 mb-6">// MISSION SNAKE — {totalCount} MISSIONS</div>
        <div className="relative space-y-3">
          {missions.map(({ slug: mSlug, mission, isDone, locked, index }) => {
            const indent = getIndent(index);
            const title = mission?.title ?? mSlug.replace(/-/g, " ");
            const xp = mission?.xp ?? 40;
            const isNext = !isDone && !locked && missions.slice(0, index).every((m) => m.isDone || index === 0);
            const nodeContent = (
              <div className={`brutal-border flex items-center gap-3 px-4 py-3 w-full max-w-xs transition-all ${isDone ? colors.node : locked ? "bg-bone opacity-35 cursor-not-allowed" : isNext ? `${colors.cta} brutal-press` : "bg-bone hover:bg-sun brutal-press"}`}>
                <span className={`brutal-border w-8 h-8 shrink-0 flex items-center justify-center font-display text-sm ${isDone ? (path.world === "dj" ? "bg-ink text-bone" : "bg-bone text-ink") : locked ? "bg-bone/50" : "bg-ink text-bone"}`}>
                  {isDone ? "✓" : locked ? "🔒" : index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-display text-sm leading-tight truncate">{title}</div>
                  <div className="font-mono text-[9px] uppercase opacity-60 mt-0.5">{isDone ? `✓ ${xp} XP earned` : locked ? "finish previous first" : `${xp} XP`}</div>
                </div>
              </div>
            );
            return (
              <div key={mSlug} className={`${indent} transition-all`}>
                {locked ? <div>{nodeContent}</div> : <Link href={`/learn/${mSlug}`}>{nodeContent}</Link>}
              </div>
            );
          })}
          <div className="mt-8 ml-0">
            <div className={`brutal-border p-5 max-w-xs ${pathComplete ? (path.world === "dj" ? "bg-volt text-ink" : "bg-acid text-ink") : "bg-bone opacity-40"}`}>
              <div className="font-display text-2xl">🏆 PATH COMPLETE</div>
              <div className="font-mono text-xs mt-1 opacity-70">{pathComplete ? `You've finished ${path.title}. ${pct}% of this path done.` : `Finish all ${totalCount} missions to earn the path trophy`}</div>
            </div>
          </div>
        </div>
        <div className="mt-10 flex gap-3 flex-wrap">
          <Link href={`/world/${path.world}`} className="brutal-border px-4 py-2 font-mono text-xs uppercase brutal-press hover:bg-sun">← BACK TO {path.world === "dj" ? "DJ WORLD" : path.world.toUpperCase()}</Link>
          <Link href="/learn" className="brutal-border px-4 py-2 font-mono text-xs uppercase brutal-press hover:bg-sun">ALL PATHS</Link>
        </div>
      </div>
    </main>
  );
}
