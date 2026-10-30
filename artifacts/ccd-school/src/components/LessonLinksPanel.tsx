"use client";
import Link from "next/link";
import { LESSON_LINKS } from "@/content/lessonLinks";
import { ATLAS } from "@/content/atlas";
import { PLUGIN_JOBS } from "@/content/plugins";
import { BUILD_STAGES } from "@/content/build";

/** "Use it in Live": sends a learner from a lesson to the device pages, plug-in advice and Build a Set. */
export function LessonLinksPanel({ slug }: { slug: string }) {
  const l = LESSON_LINKS[slug];
  if (!l) return null;
  const devices = (l.devices ?? []).map((id) => ATLAS.find((d) => d.id === id)).filter((d): d is NonNullable<typeof d> => !!d);
  const jobs = (l.jobs ?? []).map((id) => PLUGIN_JOBS.find((j) => j.id === id)).filter((j): j is NonNullable<typeof j> => !!j);
  const stage = l.stage ? BUILD_STAGES.find((s) => s.id === l.stage) : undefined;
  if (!devices.length && !jobs.length && !stage) return null;
  return (
    <div className="brutal-border bg-bone p-5 space-y-3" data-testid="lesson-links">
      <div className="font-mono text-[10px] uppercase opacity-60">USE IT IN LIVE</div>
      {devices.length > 0 && (
        <div>
          <div className="font-mono text-xs mb-1">Devices in this lesson</div>
          <div className="flex flex-wrap gap-2">
            {devices.map((d) => (
              <Link key={d.id} href={`/atlas#${d.id}`} className="brutal-border bg-acid text-ink px-2 py-1 font-mono text-xs brutal-press">{d.name}</Link>
            ))}
          </div>
        </div>
      )}
      {jobs.length > 0 && (
        <div>
          <div className="font-mono text-xs mb-1">Which plug-in for the job</div>
          <div className="flex flex-wrap gap-2">
            {jobs.map((j) => (
              <Link key={j.id} href={`/plugins#${j.id}`} className="brutal-border bg-sun text-ink px-2 py-1 font-mono text-xs brutal-press">{j.job}</Link>
            ))}
          </div>
        </div>
      )}
      {stage && (
        <Link href="/build" className="block brutal-border bg-ink text-bone px-3 py-2 font-mono text-xs brutal-press">
          Try it on your own Set: Build a Set, stage "{stage.title}" →
        </Link>
      )}
    </div>
  );
}
