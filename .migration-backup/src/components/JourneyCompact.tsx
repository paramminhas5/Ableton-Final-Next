// Compact resume card for the home page — small, doesn't dominate the hero.
import { Link } from "@tanstack/react-router";
import { MISSIONS, missionBySlug } from "@/content/missions";
import { WORLDS } from "@/content/worlds";
import { useProgress } from "@/lib/progress";

export function JourneyCompact() {
  const { progress } = useProgress();
  const completed = progress.completedMissions;
  const next = MISSIONS.find((m) => !completed[m.slug]) ?? MISSIONS[0];
  const last = Object.keys(completed).pop();
  const lastM = last ? missionBySlug(last) : null;

  return (
    <div className="brutal-border bg-card p-4 brutal-shadow-sm">
      <div className="font-mono text-xs uppercase mb-3 flex items-center justify-between">
        <span>// JOURNEY</span>
        <Link to="/worlds" className="underline">FULL MAP →</Link>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <Link to="/mission/$slug" params={{ slug: next.slug }}
          className="brutal-border bg-acid p-3 brutal-press block">
          <div className="font-mono text-[10px] uppercase">{lastM ? "RESUME · NEXT UP" : "START HERE"}</div>
          <div className="font-display text-xl mt-1">M{String(next.number).padStart(2,"0")} · {next.title}</div>
          <div className="font-mono text-xs mt-1">{next.tagline}</div>
        </Link>
        <div className="flex items-stretch gap-1">
          {WORLDS.map((w) => {
            const total = MISSIONS.filter((m) => m.world === w.slug).length;
            const done = MISSIONS.filter((m) => m.world === w.slug && completed[m.slug]).length;
            const pct = Math.round((done / total) * 100);
            const colorClass = { acid: "bg-acid", hot: "bg-hot text-bone", volt: "bg-volt text-bone", sun: "bg-sun", bone: "bg-bone", ink: "bg-ink text-bone" }[w.color];
            return (
              <Link key={w.slug} to="/world/$slug" params={{ slug: w.slug }}
                title={`${w.title} — ${done}/${total}`}
                className={`${colorClass} brutal-border flex-1 p-2 flex flex-col justify-between brutal-press`}>
                <div className="font-mono text-[10px] uppercase">W{w.number}</div>
                <div className="font-display text-sm">{pct}%</div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
