"use client";
/**
 * /wiki: every world, chapter, path and lesson in one reference page, on the Model 1 parts.
 * One world at a time (chips), chapters as panels, paths opened with a key, lessons as rows.
 * Opens on the world in the url hash (#dj) and keeps the hash in step.
 */
import { useEffect, useMemo, useState } from "react";
import { Silk } from "@/components/m1/controls";
import { WORLD_LED } from "@/components/m1/controls";
import { Chips, ListRow, RefPage, SegBar } from "@/components/m1/parts";
import { WORLD_ORDER, WORLD_THEMES, type WorldSlug } from "@/components/world/worldTheme";
import { chaptersByWorld, WORLD_TROPHIES } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";
import { FOUNDATIONS_MISSIONS } from "@/content/missions-foundations";
import { DJ_WORLD_MISSIONS } from "@/content/missions-dj";
import { MISSIONS } from "@/content/missions";
import { useProgress } from "@/lib/progress";

const ALL = [...FOUNDATIONS_MISSIONS, ...DJ_WORLD_MISSIONS, ...MISSIONS];
const titleOf = (slug: string) => ALL.find(m => m.slug === slug)?.title ?? slug.replace(/-/g, " ");
const taglineOf = (slug: string) => ALL.find(m => m.slug === slug)?.tagline ?? undefined;

function PathBlock({ path, done }: { path: ReturnType<typeof pathsByWorld>[number]; done: Record<string, unknown> }) {
  const [open, setOpen] = useState(false);
  const n = path.missionSlugs.filter(s => !!done[s]).length;
  const total = path.missionSlugs.length;
  return (
    <>
      <ListRow
        led={n === total && total > 0 ? "var(--led-mint)" : n > 0 ? "var(--led-mint)" : "var(--ledoff)"}
        title={path.title}
        sub={path.tagline}
        right={<span className="m1-t11">{n}/{total}</span>}
        onClick={() => setOpen(v => !v)}
      />
      {open && (
        <div style={{ marginLeft: 14 }}>
          {path.missionSlugs.map(slug => (
            <ListRow key={slug} href={`/learn/${slug}`} led={done[slug] ? "var(--led-mint)" : "var(--ledoff)"} title={titleOf(slug)} sub={taglineOf(slug)} />
          ))}
        </div>
      )}
    </>
  );
}

export function WikiPageClient() {
  const { progress } = useProgress();
  const done = progress.completedMissions as Record<string, unknown>;
  const [world, setWorld] = useState<WorldSlug>("fundamentals");

  useEffect(() => {
    const h = window.location.hash.replace("#", "") as WorldSlug;
    if (WORLD_ORDER.includes(h)) setWorld(h);
  }, []);
  const pick = (w: string) => {
    setWorld(w as WorldSlug);
    window.history.replaceState(null, "", `#${w}`);
  };

  const view = useMemo(() => {
    const chapters = chaptersByWorld(world);
    const paths = pathsByWorld(world);
    const slugs = paths.flatMap(p => p.missionSlugs);
    const n = slugs.filter(s => !!done[s]).length;
    return { chapters, paths, total: slugs.length, n };
  }, [world, done]);

  const theme = WORLD_THEMES[world];
  const trophy = WORLD_TROPHIES[world];

  return (
    <RefPage title="wiki" back="/dashboard" meta="library" right={`${view.chapters.length} chapters · ${view.paths.length} paths · ${view.total} lessons`}
      intro="every world, chapter, path and lesson in one place. open a path to see its lessons.">
      <Chips options={WORLD_ORDER} value={world} onChange={pick} label="World" />
      <div className="ls-panel" style={{ flexDirection: "column", gap: 10, marginTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", width: "100%", gap: 8 }}>
          <b style={{ fontSize: 19, fontWeight: 500 }}>{theme.title.toLowerCase()}</b>
          <span className="m1-t11">{view.n} of {view.total} done</span>
        </div>
        <span style={{ fontSize: 14, lineHeight: 1.5, color: "var(--sub)" }}>{theme.description}</span>
        <SegBar value={view.total ? view.n / view.total : 0} color={WORLD_LED[world]} label={`${theme.title} progress`} />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <a className="m1-tag" href={`/world/${world}`} style={{ cursor: "pointer" }}>flow mode</a>
          <a className="m1-tag" href={`/world/${world}?view=free`} style={{ cursor: "pointer" }}>free mode</a>
        </div>
      </div>
      {view.chapters.map(ch => {
        const chPaths = view.paths.filter(p => p.chapter === ch.slug).sort((a, b) => a.number - b.number);
        return (
          <section key={ch.slug} id={`chapter-${ch.slug}`}>
            <Silk label={`${ch.number}. ${ch.title.toLowerCase()}`} right={`${chPaths.length} paths`} />
            <p className="ls-sub" style={{ marginTop: 8 }}>{ch.tagline}</p>
            {chPaths.map(p => <PathBlock key={p.slug} path={p} done={done} />)}
            <div className="ls-panel" style={{ marginTop: 8, flexDirection: "column", gap: 4 }}>
              <span className="m1-t11">chapter trophy</span>
              <b style={{ fontSize: 15, fontWeight: 500 }}>{ch.trophy.name}</b>
              <span style={{ fontSize: 13, color: "var(--sub)" }}>{ch.trophy.description}</span>
            </div>
          </section>
        );
      })}
      {trophy ? (
        <div className="ls-panel" style={{ marginTop: 16, flexDirection: "column", gap: 4 }}>
          <span className="m1-t11">world trophy</span>
          <b style={{ fontSize: 17, fontWeight: 500 }}>{trophy.name}</b>
          <span style={{ fontSize: 13, color: "var(--sub)" }}>{trophy.description}</span>
        </div>
      ) : null}
    </RefPage>
  );
}
