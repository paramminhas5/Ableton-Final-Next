import { Link } from "@tanstack/react-router";
import { MISSIONS } from "@/content/missions";
import { WORLDS } from "@/content/worlds";
import { useProgress } from "@/lib/progress";

// Subway-style journey map: each WORLD is a lane (line) with stops (missions).
// On mobile the lane wraps as a 6-col grid; on desktop it's a horizontal rail.
const WORLD_LINE: Record<string, { bg: string; label: string }> = {
  acid: { bg: "bg-acid", label: "text-ink" },
  hot:  { bg: "bg-ink",  label: "text-bone" },
  volt: { bg: "bg-volt", label: "text-bone" },
  sun:  { bg: "bg-sun",  label: "text-ink" },
  bone: { bg: "bg-bone", label: "text-ink" },
  ink:  { bg: "bg-ink",  label: "text-bone" },
};

export function JourneyMap({ currentSlug }: { currentSlug?: string }) {
  const { progress } = useProgress();
  const done = progress.completedMissions;
  const totalDone = Object.keys(done).length;

  return (
    <div className="brutal-border bg-card p-3 md:p-4 brutal-shadow-sm">
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <div className="font-mono text-[10px] md:text-xs uppercase">
          // JOURNEY MAP — {totalDone}/{MISSIONS.length} stops · {WORLDS.length} lines
        </div>
        <div className="flex gap-1.5 font-mono text-[9px] md:text-[10px] uppercase">
          <span className="brutal-border bg-bone px-2 py-0.5">○ open</span>
          <span className="brutal-border bg-ink text-bone px-2 py-0.5">● now</span>
          <span className="brutal-border bg-acid px-2 py-0.5">✓ done</span>
        </div>
      </div>

      <div className="space-y-3">
        {WORLDS.map((w) => {
          const ms = MISSIONS.filter((m) => m.world === w.slug);
          const line = WORLD_LINE[w.color] ?? WORLD_LINE.bone;
          const worldDone = ms.filter((m) => done[m.slug]).length;
          return (
            <div key={w.slug} className="flex flex-col md:flex-row md:items-center gap-2">
              <div className={`${line.bg} ${line.label} brutal-border px-2 py-1.5 font-mono text-[10px] uppercase md:w-32 shrink-0 leading-tight flex md:flex-col items-center md:items-start gap-2 md:gap-0`}>
                <div className="font-display text-sm">W{w.number}</div>
                <div className="truncate flex-1">{w.title}</div>
                <div className="opacity-70 ml-auto md:ml-0">{worldDone}/{ms.length}</div>
              </div>

              {/* Rail / grid */}
              <div className="grid grid-cols-6 sm:grid-cols-8 md:flex md:flex-wrap gap-1 md:gap-1.5 flex-1">
                {ms.map((m) => {
                  const isDone = !!done[m.slug];
                  const isCur = m.slug === currentSlug;
                  const tone = isCur ? "bg-ink text-bone animate-pulse"
                            : isDone ? "bg-acid text-ink"
                            : "bg-bone text-ink";
                  return (
                    <Link
                      key={m.slug}
                      to="/mission/$slug"
                      params={{ slug: m.slug }}
                      title={`#${m.number} ${m.title}`}
                      className={`${tone} brutal-border aspect-square md:w-8 md:h-8 flex items-center justify-center font-mono text-[10px] brutal-press`}
                    >
                      {isDone ? "✓" : m.number}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 font-mono text-[9px] md:text-[10px] uppercase opacity-60">
        ▸ Each lane is a WORLD. Each square is a mission stop. Tap to jump on.
      </div>
    </div>
  );
}
