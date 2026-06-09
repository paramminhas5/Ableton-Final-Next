"use client";
import Link from "next/link";
import Image from "next/image";
import { chaptersByWorld } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";
import { useProgress } from "@/lib/progress";
import { ModeSwitcherBanner } from "@/components/ModeSwitcherBanner";

// ─── FAL AI generated world banner images (v2) ───────────────────────────────
const WORLD_IMAGES: Record<string, string> = {
  fundamentals: "https://v3b.fal.media/files/b/0a9d8573/T1yPDNCVhxrVLWBs3vPLK.jpg",
  dj:           "https://v3b.fal.media/files/b/0a9d8573/vkzVEVke8UdYZtUAJEt5P.jpg",
  producer:     "https://v3b.fal.media/files/b/0a9d8573/FWDTuawui9X18aCB004I0.jpg",
};

type WorldId = "fundamentals" | "dj" | "producer";
const WORLD_META: Record<WorldId, { title: string; emoji: string; tagline: string; color: string; heroColor: string; description: string; to: string }> = {
  fundamentals: { title: "Fundamentals", emoji: "🎵", tagline: "The vocabulary of music", color: "bg-acid", heroColor: "bg-acid text-ink", description: "Sound, rhythm, melody, harmony and music technology — from absolute zero. Complete this world before specialising as a DJ or Producer.", to: "/world/fundamentals" },
  dj: { title: "DJ World", emoji: "🎧", tagline: "The art of playing for people", color: "bg-ink text-bone", heroColor: "bg-ink text-bone", description: "rekordbox, beatmatching, cue points, the mix, crowd reading and career. Built from the Pioneer DJ rekordbox 6.0.0 Instruction Manual.", to: "/world/dj" },
  producer: { title: "Producer", emoji: "🎛", tagline: "Build music in Ableton Live 12", color: "bg-sun text-ink", heroColor: "bg-sun text-ink", description: "From opening Live for the first time to mastering its deepest instruments, Live 12 power features and professional output.", to: "/world/producer" },
};

export function WorldsPageClient() {
  const { progress } = useProgress();
  const completed = progress.completedMissions;

  const worldStats = (world: WorldId) => {
    const chapters = chaptersByWorld(world);
    const paths = pathsByWorld(world);
    const allSlugs = paths.flatMap((p) => p.missionSlugs);
    const done = allSlugs.filter((s) => !!completed[s]).length;
    const total = allSlugs.length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const chaptersComplete = chapters.filter((ch) =>
      pathsByWorld(world).filter((p) => p.chapter === ch.slug).flatMap((p) => p.missionSlugs).every((s) => !!completed[s]) &&
      pathsByWorld(world).filter((p) => p.chapter === ch.slug).flatMap((p) => p.missionSlugs).length > 0
    ).length;
    return { done, total, pct, chapters: chapters.length, paths: paths.length, chaptersComplete };
  };

  return (
    <main className="min-h-screen bg-bone">
      <header className="brutal-border border-x-0 border-t-0 bg-bone">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="font-mono text-[10px] uppercase opacity-40 mb-2">// THREE WORLDS · 153 MISSIONS</div>
          <h1 className="font-display text-5xl md:text-7xl leading-none">WORLDS</h1>
          <p className="font-mono text-sm mt-3 opacity-70 max-w-xl leading-relaxed">Start with Fundamentals — it unlocks everything. Then specialise as a DJ, a Producer, or both.</p>
        </div>
      </header>

      {/* Prominent mode switcher */}
      <ModeSwitcherBanner variant="bar" />

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 pb-24">
        {(["fundamentals", "dj", "producer"] as WorldId[]).map((world) => {
          const meta = WORLD_META[world];
          const stats = worldStats(world);
          const chapters = chaptersByWorld(world);
          return (
            <Link key={world} href={meta.to} className="block brutal-border brutal-press overflow-hidden">
              <div className={`${meta.heroColor} p-6 md:p-8 relative overflow-hidden`}>
                {/* Image — skipped on producer (sun/yellow bg) to keep text readable.
                    Fundamentals (acid) and DJ (ink) both have enough contrast with multiply blend. */}
                {world !== "producer" && (
                  <div className="absolute inset-0 pointer-events-none">
                    <Image
                      src={WORLD_IMAGES[world]}
                      alt=""
                      fill
                      className="object-cover opacity-20 mix-blend-multiply"
                      sizes="(max-width: 768px) 100vw, 80vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-current/30 to-transparent opacity-40" />
                  </div>
                )}
                <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="font-mono text-[9px] uppercase opacity-60 mb-1">WORLD · {stats.chapters} CHAPTERS · {stats.paths} PATHS · {stats.total} MISSIONS</div>
                    <h2 className="font-display text-4xl md:text-6xl leading-none">{meta.emoji} {meta.title}</h2>
                    <p className="font-display text-xl md:text-2xl mt-1 opacity-80">{meta.tagline}</p>
                    <p className="font-mono text-xs mt-3 opacity-70 leading-relaxed max-w-xl">{meta.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="font-display text-4xl">{stats.pct}%</div>
                    <div className="font-mono text-[9px] uppercase opacity-60">{stats.done}/{stats.total} missions</div>
                    <div className="font-mono text-[9px] uppercase opacity-60">{stats.chaptersComplete}/{stats.chapters} chapters complete</div>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-2 relative z-10">
                  {chapters.map((ch, i) => {
                    const paths = pathsByWorld(world).filter((p) => p.chapter === ch.slug);
                    const chDone = paths.flatMap((p) => p.missionSlugs).filter((s) => !!completed[s]).length;
                    const chTotal = paths.flatMap((p) => p.missionSlugs).length;
                    const chPct = chTotal > 0 ? Math.round((chDone / chTotal) * 100) : 0;
                    const chComplete = chPct === 100;
                    return (
                      <div key={ch.slug} className="flex flex-col items-center gap-1">
                        <div className={`w-8 h-8 brutal-border flex items-center justify-center font-display text-sm transition-all ${chComplete ? (world === "dj" ? "bg-volt text-ink" : "bg-ink text-bone") : chPct > 0 ? (world === "dj" ? "bg-volt/40 text-bone" : "bg-ink/30 text-ink") : (world === "dj" ? "bg-bone/10 text-bone/40" : "bg-ink/10 text-ink/30")}`}>
                          {chComplete ? "✓" : i + 1}
                        </div>
                        {i < chapters.length - 1 && <div className={`w-4 h-0.5 mt-3 ${world === "dj" ? "bg-bone/20" : "bg-ink/20"}`} />}
                      </div>
                    );
                  })}
                  <div className="ml-2 font-mono text-[9px] uppercase opacity-50">{chapters.map((ch) => ch.title.split(" ")[0]).join(" → ")}</div>
                </div>
                <div className={`mt-4 h-2 brutal-border overflow-hidden relative z-10 ${world === "dj" ? "bg-bone/10" : "bg-ink/10"}`}>
                  <div className={`h-full transition-all duration-700 ${world === "dj" ? "bg-volt" : "bg-ink"}`} style={{ width: `${stats.pct}%` }} />
                </div>
              </div>
              <div className={`px-6 py-3 flex items-center justify-between font-mono text-xs uppercase ${world === "fundamentals" ? "bg-acid/60" : world === "dj" ? "bg-ink/90 text-bone" : "bg-sun/60"}`}>
                <span className="opacity-60">{stats.done === 0 ? "Not started" : stats.pct === 100 ? "Complete 🏆" : `${stats.done} missions done`}</span>
                <span className="opacity-80">{stats.done === 0 ? "START →" : stats.pct === 100 ? "REVIEW →" : "CONTINUE →"}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
