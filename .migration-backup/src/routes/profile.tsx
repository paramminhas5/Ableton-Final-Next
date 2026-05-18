import { createFileRoute, Link } from "@tanstack/react-router";
import { useProgress } from "@/lib/progress";
import { RANKS, rankFor } from "@/lib/ranks";
import { MISSIONS } from "@/content/missions";
import { FOUNDATIONS_MISSIONS } from "@/content/missions-foundations";
import { DJ_WORLD_MISSIONS } from "@/content/missions-dj";
import { useAuth, signOut } from "@/lib/auth";
import { CHAPTERS, chaptersByWorld, WORLD_TROPHIES, MASTER_TROPHY } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";
import { RankBadge } from "@/components/HomeWidgets";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — CCD.SCHOOL" },
      { name: "description", content: "Your XP, trophies, rank and progress across all three worlds." },
    ],
  }),
  component: Profile,
});

type WorldId = "fundamentals" | "dj" | "producer";

const ALL_MISSIONS = [...FOUNDATIONS_MISSIONS, ...DJ_WORLD_MISSIONS, ...MISSIONS];

const WORLD_META: Record<WorldId, { title: string; emoji: string; hero: string; accent: string }> = {
  fundamentals: { title: "Fundamentals", emoji: "🎵", hero: "bg-acid text-ink", accent: "bg-acid" },
  dj: { title: "DJ World", emoji: "🎧", hero: "bg-ink text-bone", accent: "bg-volt" },
  producer: { title: "Producer", emoji: "🎛", hero: "bg-sun text-ink", accent: "bg-sun" },
};

function TrophyCard({
  slug, name, description, earned, earnedDate, level,
}: {
  slug: string; name: string; description: string; earned: boolean; earnedDate?: string; level: "path" | "chapter" | "world" | "master";
}) {
  const icons = { path: "🥉", chapter: "🥈", world: "🥇", master: "🏆" };
  const sizes = { path: "p-3", chapter: "p-4", world: "p-5 md:col-span-2", master: "p-6 md:col-span-3" };
  return (
    <div className={`brutal-border ${sizes[level]} ${earned ? "bg-acid text-ink" : "bg-bone opacity-40"} flex flex-col gap-1`}>
      <div className="font-display text-2xl">{icons[level]} {name}</div>
      <div className="font-mono text-[10px] uppercase opacity-60">{level} trophy</div>
      <div className="font-mono text-xs opacity-70 leading-relaxed mt-1">{description}</div>
      {earned && earnedDate && (
        <div className="font-mono text-[9px] opacity-50 mt-1">Earned {earnedDate}</div>
      )}
      {!earned && (
        <div className="font-mono text-[9px] opacity-40 mt-1">Not yet earned</div>
      )}
    </div>
  );
}

function Profile() {
  const { progress, reset } = useProgress();
  const { user } = useAuth();
  const completed = progress.completedMissions;

  const worldStats = (world: WorldId) => {
    const paths = pathsByWorld(world);
    const slugs = paths.flatMap((p) => p.missionSlugs);
    const done = slugs.filter((s) => !!completed[s]).length;
    return { done, total: slugs.length, pct: Math.round((done / slugs.length) * 100), complete: done === slugs.length && slugs.length > 0 };
  };

  const chapterComplete = (chapterSlug: string, world: WorldId) => {
    const paths = pathsByWorld(world).filter((p) => p.chapter === chapterSlug);
    const slugs = paths.flatMap((p) => p.missionSlugs);
    return slugs.length > 0 && slugs.every((s) => !!completed[s]);
  };

  const pathComplete = (missionSlugs: string[]) =>
    missionSlugs.length > 0 && missionSlugs.every((s) => !!completed[s]);

  const totalDone = ALL_MISSIONS.filter((m) => !!completed[m.slug]).length;
  const totalMissions = ALL_MISSIONS.length;
  const allWorldsComplete = (["fundamentals", "dj", "producer"] as WorldId[]).every((w) => worldStats(w).complete);

  const { current: rank } = rankFor(progress.xp);
  const completedList = ALL_MISSIONS.filter((m) => !!completed[m.slug]);

  return (
    <main className="min-h-screen bg-bone">
      {/* Header */}
      <header className="brutal-border border-x-0 border-t-0">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="font-mono text-[10px] uppercase opacity-40 mb-1">// YOUR PROGRESS</div>
          <h1 className="font-display text-5xl md:text-7xl leading-none">PROFILE</h1>

          {/* Auth status */}
          <div className="mt-4 brutal-border p-3 flex items-center justify-between gap-3 flex-wrap">
            {user ? (
              <>
                <div className="font-mono text-sm">Signed in as <strong>{user.email}</strong> — progress synced.</div>
                <button onClick={() => signOut()} className="brutal-border bg-ink text-bone px-3 py-2 font-mono text-xs uppercase brutal-press">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <div className="font-mono text-sm">Not signed in — progress saved on this device only.</div>
                <Link to="/login" className="brutal-border bg-acid px-3 py-2 font-mono text-xs uppercase brutal-press">
                  Sign in / Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-10 pb-24">

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="brutal-border bg-acid p-4 text-center">
            <div className="font-display text-5xl">{progress.xp}</div>
            <div className="font-mono text-[10px] uppercase mt-1 opacity-70">XP Total</div>
          </div>
          <div className="brutal-border bg-ink text-bone p-4 text-center">
            <div className="font-display text-5xl">{progress.streakDays}</div>
            <div className="font-mono text-[10px] uppercase mt-1 opacity-70">Day Streak 🔥</div>
          </div>
          <div className="brutal-border bg-sun p-4 text-center">
            <div className="font-display text-5xl">{totalDone}</div>
            <div className="font-mono text-[10px] uppercase mt-1 opacity-70">Missions Done</div>
          </div>
          <div className="brutal-border p-4 text-center">
            <div className="font-display text-5xl">{Math.round((totalDone / totalMissions) * 100)}%</div>
            <div className="font-mono text-[10px] uppercase mt-1 opacity-70">Total Progress</div>
          </div>
        </div>

        {/* Overall progress bar */}
        <div>
          <div className="flex justify-between font-mono text-[9px] uppercase opacity-50 mb-1">
            <span>Overall curriculum progress</span>
            <span>{totalDone} / {totalMissions} missions</span>
          </div>
          <div className="h-3 brutal-border bg-ink/5 overflow-hidden">
            <div className="h-full bg-acid transition-all duration-700" style={{ width: `${Math.round((totalDone / totalMissions) * 100)}%` }} />
          </div>
        </div>

        {/* Rank */}
        <section>
          <div className="font-mono text-[10px] uppercase opacity-40 mb-3">// CURRENT RANK</div>
          <RankBadge />
        </section>

        {/* ── TROPHIES ───────────────────────────────────────────── */}
        <section>
          <div className="font-mono text-[10px] uppercase opacity-40 mb-1">// TROPHIES</div>
          <h2 className="font-display text-3xl mb-6">Trophies</h2>

          {/* Master trophy */}
          <div className="mb-6">
            <div className={`brutal-border p-6 ${allWorldsComplete ? "bg-acid text-ink" : "bg-bone opacity-40"} flex items-start gap-4`}>
              <div className="font-display text-5xl">🏆</div>
              <div>
                <div className="font-mono text-[9px] uppercase opacity-60 mb-1">MASTER TROPHY</div>
                <div className="font-display text-3xl">{MASTER_TROPHY.name}</div>
                <div className="font-mono text-xs opacity-70 mt-1 leading-relaxed max-w-xl">{MASTER_TROPHY.description}</div>
                {!allWorldsComplete && (
                  <div className="font-mono text-[9px] opacity-40 mt-2">Complete all three worlds to unlock</div>
                )}
              </div>
            </div>
          </div>

          {/* Per-world trophy sections */}
          {(["fundamentals", "dj", "producer"] as WorldId[]).map((world) => {
            const meta = WORLD_META[world];
            const ws = worldStats(world);
            const worldTrophy = WORLD_TROPHIES[world];
            const chapters = chaptersByWorld(world);
            const paths = pathsByWorld(world);

            return (
              <div key={world} className="mb-8">
                {/* World header */}
                <div className={`brutal-border ${meta.hero} px-4 py-3 flex items-center justify-between mb-3`}>
                  <div>
                    <div className="font-mono text-[9px] uppercase opacity-60">{ws.done}/{ws.total} missions · {ws.pct}%</div>
                    <div className="font-display text-2xl">{meta.emoji} {meta.title}</div>
                  </div>
                  <div className={`brutal-border px-3 py-1.5 font-mono text-[9px] uppercase ${ws.complete ? meta.accent + " text-ink" : "bg-bone/20"}`}>
                    {ws.complete ? "🥇 WORLD COMPLETE" : `${ws.pct}% done`}
                  </div>
                </div>

                {/* World trophy */}
                <div className={`brutal-border p-4 mb-3 ${ws.complete ? (world === "dj" ? "bg-volt text-ink" : "bg-acid text-ink") : "bg-bone opacity-50"} flex items-center gap-3`}>
                  <span className="font-display text-3xl">🥇</span>
                  <div>
                    <div className="font-mono text-[9px] uppercase opacity-60">World Trophy</div>
                    <div className="font-display text-xl">{worldTrophy.name}</div>
                    <div className="font-mono text-xs opacity-70">{worldTrophy.description}</div>
                  </div>
                </div>

                {/* Chapter trophies */}
                <div className="grid md:grid-cols-5 gap-2 mb-3">
                  {chapters.map((ch) => {
                    const chComplete = chapterComplete(ch.slug, world);
                    return (
                      <div key={ch.slug} className={`brutal-border p-3 ${chComplete ? "bg-sun text-ink" : "bg-bone opacity-40"}`}>
                        <div className="font-display text-xl">🥈</div>
                        <div className="font-mono text-[9px] uppercase opacity-60 mt-1">Chapter {ch.number}</div>
                        <div className="font-display text-sm leading-tight mt-0.5">{ch.trophy.name}</div>
                        <div className="font-mono text-[8px] opacity-50 mt-1 leading-tight">{ch.title}</div>
                        {!chComplete && (
                          <div className="font-mono text-[8px] opacity-30 mt-1">
                            {pathsByWorld(world).filter((p) => p.chapter === ch.slug).flatMap((p) => p.missionSlugs).filter((s) => !!completed[s]).length}/
                            {pathsByWorld(world).filter((p) => p.chapter === ch.slug).flatMap((p) => p.missionSlugs).length} done
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Path trophies */}
                <details className="brutal-border">
                  <summary className="px-4 py-2 font-mono text-[10px] uppercase cursor-pointer hover:bg-sun/30 brutal-press">
                    PATH TROPHIES ({paths.filter((p) => pathComplete(p.missionSlugs)).length}/{paths.length} earned) 🥉
                  </summary>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2 p-3">
                    {paths.map((path) => {
                      const pComplete = pathComplete(path.missionSlugs);
                      const done = path.missionSlugs.filter((s) => !!completed[s]).length;
                      return (
                        <div key={path.slug} className={`brutal-border p-3 ${pComplete ? "bg-bone" : "bg-bone opacity-40"}`}>
                          <div className="font-display text-lg">🥉</div>
                          <div className="font-display text-sm leading-tight">{path.title}</div>
                          <div className="font-mono text-[8px] opacity-50 mt-1">{done}/{path.missionSlugs.length} missions</div>
                          {!pComplete && (
                            <div className="h-1 bg-ink/10 mt-1 overflow-hidden">
                              <div className="h-full bg-acid" style={{ width: `${Math.round((done / path.missionSlugs.length) * 100)}%` }} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </details>
              </div>
            );
          })}
        </section>

        {/* Theme */}
        <section>
          <div className="font-mono text-[10px] uppercase opacity-40 mb-3">// APPEARANCE</div>
          <h2 className="font-display text-3xl mb-4">Theme</h2>
          <ThemeSwitcher />
        </section>

        {/* Badges */}
        <section>
          <div className="font-mono text-[10px] uppercase opacity-40 mb-3">// MISSION BADGES</div>
          <h2 className="font-display text-3xl mb-4">Badges</h2>
          {progress.badges.length === 0 ? (
            <div className="brutal-border p-4 font-mono text-sm opacity-50">
              No badges yet — complete missions to earn them.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {progress.badges.map((b) => (
                <div key={b} className="brutal-border bg-ink text-bone px-3 py-1.5 font-mono text-xs uppercase">
                  ★ {b.replace(/-/g, " ")}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent missions */}
        <section>
          <div className="font-mono text-[10px] uppercase opacity-40 mb-3">// COMPLETED MISSIONS ({completedList.length})</div>
          <h2 className="font-display text-3xl mb-4">Completed</h2>
          <div className="space-y-1 max-h-96 overflow-y-auto brutal-border p-3">
            {completedList.length === 0 ? (
              <div className="font-mono text-sm opacity-50 py-4">No missions completed yet.</div>
            ) : (
              completedList.map((m) => (
                <Link key={m.slug} to="/mission/$slug" params={{ slug: m.slug }}
                  className="flex items-center gap-3 px-2 py-1.5 hover:bg-sun/30 brutal-press"
                >
                  <span className="w-4 h-4 bg-ink text-bone brutal-border flex items-center justify-center font-mono text-[8px]">✓</span>
                  <span className="font-display text-sm flex-1 truncate">{m.title}</span>
                  <span className="font-mono text-[9px] opacity-40">{(m as any).xp ?? 40} XP</span>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Danger zone */}
        <section>
          <div className="font-mono text-[10px] uppercase opacity-40 mb-3">// DANGER ZONE</div>
          <button
            onClick={() => { if (confirm("Reset ALL progress? This cannot be undone.")) reset(); }}
            className="brutal-border bg-ink text-bone px-4 py-2 font-mono text-xs uppercase brutal-press hover:bg-ink/80"
          >
            Reset all progress
          </button>
        </section>
      </div>
    </main>
  );
}
