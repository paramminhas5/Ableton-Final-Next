"use client";
/**
 * WorldPageClient — FREE MODE: the open "wiki" browser.
 *
 * Rendered inside WorldShell (embedded) — no hero / mode switch of its own.
 * Deliberately a DIFFERENT interface from Flow:
 *  ✓ Dense, scannable, docs-like (mono type, tight rows, columns)
 *  ✓ Live search filter across chapters / paths / missions
 *  ✓ Everything open — no locks, jump anywhere
 *  ✓ Chapter sections anchored (#chapter-<slug>) for rail navigation
 */
import Link from "next/link";
import { useMemo, useState } from "react";
import { chaptersByWorld, WORLD_TROPHIES } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";
import { FOUNDATIONS_MISSIONS } from "@/content/missions-foundations";
import { DJ_WORLD_MISSIONS } from "@/content/missions-dj";
import { MISSIONS } from "@/content/missions";
import { useProgress } from "@/lib/progress";
import { WORLD_THEME, CHAPTER_EMOJIS, type WorldId } from "@/components/world/worldTheme";
import type { Mission } from "@/content/types";

function getMissions(world: WorldId): Mission[] {
  if (world === "fundamentals") return FOUNDATIONS_MISSIONS;
  if (world === "dj") return DJ_WORLD_MISSIONS;
  return MISSIONS;
}

// ─── Mission row ──────────────────────────────────────────────────────────────
function MissionRow({ slug, title, index, done, dark }: {
  slug: string; title: string; index: number; done: boolean; dark: boolean;
}) {
  return (
    <Link
      href={`/learn/${slug}`}
      className={`flex items-center gap-2 px-2.5 py-1.5 border-b border-current/10 last:border-0 font-mono text-xs transition-colors group ${
        dark ? "hover:bg-bone/5" : "hover:bg-ink/5"
      }`}
    >
      <span className={`shrink-0 w-5 text-center ${done ? "text-acid" : "opacity-35"}`}>
        {done ? "✓" : index + 1}
      </span>
      <span className={`flex-1 truncate ${done ? "opacity-60" : "opacity-90"} group-hover:opacity-100`}>
        {title}
      </span>
      <span className="shrink-0 opacity-0 group-hover:opacity-50 transition-opacity">→</span>
    </Link>
  );
}

// ─── Path block ───────────────────────────────────────────────────────────────
function PathBlock({ path, completed, missionTitle, world }: {
  path: ReturnType<typeof pathsByWorld>[number];
  completed: Record<string, unknown>;
  missionTitle: (slug: string) => string;
  world: WorldId;
}) {
  const t = WORLD_THEME[world];
  const done = path.missionSlugs.filter((s) => !!completed[s]).length;
  const total = path.missionSlugs.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const complete = done === total && total > 0;

  return (
    <div className={`brutal-border ${t.dark ? "bg-[#0a1228] border-volt/30" : "bg-bone"} overflow-hidden`}>
      {/* Path header */}
      <div className={`flex items-center justify-between gap-2 px-3 py-2 border-b-2 ${t.dark ? "border-volt/20" : "border-ink/10"}`}>
        <div className="min-w-0">
          <div className="font-mono text-[8px] uppercase opacity-40">Path {path.number}</div>
          <Link href={`/path/${path.slug}`} className={`font-display text-sm leading-tight hover:underline ${t.dark ? "text-bone" : "text-ink"}`}>
            {path.title}
          </Link>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <span className="font-mono text-[9px] opacity-50 tabular-nums">{done}/{total}</span>
          <span className={`brutal-border w-8 h-8 flex items-center justify-center font-display text-[10px] ${complete ? `${t.accentBg} ${t.accentText}` : t.dark ? "bg-bone/5 text-bone/60" : "bg-ink/5 text-ink/60"}`}>
            {complete ? "✓" : `${pct}`}
          </span>
        </div>
      </div>
      {/* Mission list — always visible (wiki) */}
      <div>
        {path.missionSlugs.map((s, i) => (
          <MissionRow key={s} slug={s} title={missionTitle(s)} index={i} done={!!completed[s]} dark={t.dark} />
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function WorldPageClient({ slug }: { slug: string; embedded?: boolean }) {
  const world = slug as WorldId;
  const t = WORLD_THEME[world];
  const { progress } = useProgress();
  const completed = progress.completedMissions;
  const chapters = chaptersByWorld(world);
  const allPaths = pathsByWorld(world);
  const [query, setQuery] = useState("");

  const missionTitle = useMemo(() => {
    const map = new Map(getMissions(world).map((m) => [m.slug, m.title]));
    return (s: string) => map.get(s) ?? s.replace(/-/g, " ");
  }, [world]);

  if (!t) return <div className="p-8 font-mono">World not found</div>;

  const q = query.trim().toLowerCase();
  const matches = (text: string) => text.toLowerCase().includes(q);

  const worldDone = allPaths.flatMap((p) => p.missionSlugs).filter((s) => !!completed[s]).length;
  const worldTotal = allPaths.flatMap((p) => p.missionSlugs).length;
  const trophy = WORLD_TROPHIES[world];

  return (
    <div className={`${t.surface} ${t.textPrimary} min-h-screen`}>
      <div className="max-w-3xl mx-auto px-4 py-6 pb-24">

        {/* Wiki intro + search */}
        <div className="mb-5">
          <div className="font-mono text-[10px] uppercase opacity-45 mb-1">
            📖 Free Mode · open wiki · {worldDone}/{worldTotal} done
          </div>
          <h2 className="font-display text-2xl md:text-3xl leading-tight mb-3">
            Browse {t.title}
          </h2>
          <div className={`brutal-border flex items-center gap-2 px-3 py-2 ${t.dark ? "bg-[#0a1228]" : "bg-bone"}`}>
            <span className="opacity-40 text-sm">🔍</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chapters, paths, lessons…"
              className={`flex-1 bg-transparent outline-none font-mono text-sm placeholder:opacity-35 ${t.dark ? "text-bone" : "text-ink"}`}
            />
            {query && (
              <button onClick={() => setQuery("")} className="opacity-40 hover:opacity-80 font-mono text-xs" aria-label="Clear search">✕</button>
            )}
          </div>
        </div>

        {/* Chapters as wiki sections */}
        <div className="space-y-6">
          {chapters.map((ch) => {
            const chPaths = allPaths.filter((p) => p.chapter === ch.slug).sort((a, b) => a.number - b.number);

            // Filter by query — match chapter, path, or any mission title
            const visiblePaths = q
              ? chPaths.filter((p) =>
                  matches(ch.title) || matches(p.title) || matches(p.tagline) ||
                  p.missionSlugs.some((s) => matches(missionTitle(s))))
              : chPaths;

            if (q && visiblePaths.length === 0 && !matches(ch.title)) return null;

            const slugs = chPaths.flatMap((p) => p.missionSlugs);
            const done = slugs.filter((s) => !!completed[s]).length;
            const totalC = slugs.length;
            const pct = totalC > 0 ? Math.round((done / totalC) * 100) : 0;
            const complete = done === totalC && totalC > 0;
            const emoji = CHAPTER_EMOJIS[ch.slug] ?? "📖";

            return (
              <section key={ch.slug} id={`chapter-${ch.slug}`} style={{ scrollMarginTop: "120px" }}>
                {/* Chapter heading — docs style */}
                <div className={`flex items-center gap-3 pb-2 mb-3 border-b-4 ${t.dark ? "border-volt/30" : "border-ink"}`}>
                  <span className="text-2xl shrink-0">{complete ? "✓" : emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-[8px] uppercase opacity-40">Chapter {ch.number}</div>
                    <h3 className="font-display text-xl leading-tight">{ch.title}</h3>
                  </div>
                  <span className="font-mono text-[10px] opacity-50 tabular-nums shrink-0">{done}/{totalC} · {pct}%</span>
                </div>

                {/* Chapter description */}
                <p className={`font-mono text-[11px] leading-relaxed mb-3 ${t.textMuted}`}>{ch.description}</p>

                {/* Paths — 2-column grid on desktop (dense) */}
                <div className="grid md:grid-cols-2 gap-2.5">
                  {(q ? visiblePaths : chPaths).map((path) => (
                    <PathBlock key={path.slug} path={path} completed={completed} missionTitle={missionTitle} world={world} />
                  ))}
                </div>

                {/* Trophy line */}
                {complete && (
                  <div className={`mt-2.5 brutal-border px-3 py-2 flex items-center gap-2 ${t.accentBg} ${t.accentText}`}>
                    <span className="text-lg">🏆</span>
                    <span className="font-display text-xs">{ch.trophy.name}</span>
                    <span className="font-mono text-[9px] opacity-70 truncate">— {ch.trophy.description}</span>
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* World trophy */}
        {!q && (
          <div className={`brutal-border p-4 mt-8 ${worldDone === worldTotal && worldTotal > 0 ? `${t.accentBg} ${t.accentText}` : t.dark ? "bg-[#0a1228] text-bone/50" : "bg-bone/60 text-ink/50"}`}>
            <div className="font-mono text-[9px] uppercase mb-1">World trophy</div>
            <div className="font-display text-xl flex items-center gap-2"><span>🏆</span><span>{trophy.name}</span></div>
            <div className="font-mono text-[10px] mt-1 opacity-70">{trophy.description}</div>
          </div>
        )}
      </div>
    </div>
  );
}
