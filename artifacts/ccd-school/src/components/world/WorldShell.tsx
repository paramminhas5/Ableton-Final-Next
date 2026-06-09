"use client";
/**
 * WorldShell — the unified "Library" surface.
 *
 * Layout:
 *   ┌─────────────┬───────────────────────────────┐
 *   │   RAIL      │   CONTENT                      │
 *   │ (sticky)    │   Flow snake  OR  Free wiki    │
 *   │ world tabs  │                                │
 *   │ ModeSwitch  │                                │
 *   │ chapters    │                                │
 *   │ progress    │                                │
 *   └─────────────┴───────────────────────────────┘
 *
 * Desktop: persistent left rail (sticky under header).
 * Mobile:  compact top bar (world + ModeSwitch) + a "Chapters" sheet.
 *
 * The rail owns navigation + the mode switch, so the inner views are pure
 * content. Chapter clicks scroll to `#chapter-<slug>` anchors that both
 * the Flow and Free views render.
 */
import Link from "next/link";
import Image from "next/image";
import { useState, useCallback } from "react";
import { useProgress } from "@/lib/progress";
import { chaptersByWorld } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";
import {
  WORLD_THEME, CHAPTER_EMOJIS, WORLD_ORDER, type WorldId,
} from "@/components/world/worldTheme";
import { ModeSwitch } from "@/components/world/ModeSwitch";
import { WorldPathClient } from "@/components/WorldPathClient";
import { WorldPageClient } from "@/components/WorldPageClient";

interface ChapterStat {
  slug: string;
  title: string;
  number: number;
  emoji: string;
  done: number;
  total: number;
  pct: number;
  complete: boolean;
}

function useWorldStats(world: WorldId) {
  const { progress } = useProgress();
  const completed = progress.completedMissions;
  const chapters = chaptersByWorld(world);
  const paths = pathsByWorld(world);

  const chapterStats: ChapterStat[] = chapters.map((ch) => {
    const chPaths = paths.filter((p) => p.chapter === ch.slug);
    const slugs = chPaths.flatMap((p) => p.missionSlugs);
    const done = slugs.filter((s) => !!completed[s]).length;
    const total = slugs.length;
    return {
      slug: ch.slug,
      title: ch.title,
      number: ch.number,
      emoji: CHAPTER_EMOJIS[ch.slug] ?? "📖",
      done,
      total,
      pct: total > 0 ? Math.round((done / total) * 100) : 0,
      complete: done === total && total > 0,
    };
  });

  const allSlugs = paths.flatMap((p) => p.missionSlugs);
  const done = allSlugs.filter((s) => !!completed[s]).length;
  const total = allSlugs.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return { chapterStats, done, total, pct };
}

function scrollToChapter(slug: string) {
  const el = document.getElementById(`chapter-${slug}`);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ─── Progress ring ────────────────────────────────────────────────────────────
function Ring({ pct, dark }: { pct: number; dark: boolean }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" className="shrink-0" aria-hidden>
      <circle cx="26" cy="26" r={r} fill="none" stroke="currentColor" strokeWidth="5" opacity="0.15" />
      <circle
        cx="26" cy="26" r={r} fill="none"
        stroke={dark ? "hsl(84 81% 56%)" : "hsl(222 47% 4%)"}
        strokeWidth="5" strokeLinecap="round"
        strokeDasharray={`${(circ * pct) / 100} ${circ}`}
        transform="rotate(-90 26 26)"
        style={{ transition: "stroke-dasharray 0.7s ease" }}
      />
      <text x="26" y="30" textAnchor="middle" className="font-display" fontSize="13" fill="currentColor">
        {pct}%
      </text>
    </svg>
  );
}

// ─── World switcher ───────────────────────────────────────────────────────────
function WorldTabs({ current, view, compact = false }: { current: WorldId; view: "flow" | "free"; compact?: boolean }) {
  const suffix = view === "free" ? "?view=free" : "";
  return (
    <div className={`flex ${compact ? "gap-1.5" : "gap-1.5"}`}>
      {WORLD_ORDER.map((w) => {
        const t = WORLD_THEME[w];
        const active = w === current;
        return (
          <Link
            key={w}
            href={`/world/${w}${suffix}`}
            title={t.title}
            className={`flex-1 brutal-border flex items-center justify-center gap-1.5 py-2 px-2 font-display text-xs brutal-press transition-all ${
              active ? `${t.accentBg} ${t.accentText} chunk-shadow-sm` : "bg-bone text-ink/50 hover:bg-ink/5"
            }`}
          >
            <span className="text-base leading-none">{t.emoji}</span>
            {!compact && <span className="hidden lg:inline truncate">{t.title.split(" ")[0]}</span>}
          </Link>
        );
      })}
    </div>
  );
}

// ─── Chapter list (rail + sheet) ──────────────────────────────────────────────
function ChapterList({
  stats, dark, onPick,
}: { stats: ChapterStat[]; dark: boolean; onPick: (slug: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      {stats.map((ch) => {
        const cls = ch.complete
          ? dark ? "bg-volt text-ink border-volt" : "bg-ink text-bone border-ink"
          : ch.done > 0
          ? dark ? "bg-volt/20 text-bone border-volt/40" : "bg-ink/10 text-ink border-ink/30"
          : dark ? "bg-bone/5 text-bone/55 border-bone/15" : "bg-bone text-ink/55 border-ink/15";
        return (
          <button
            key={ch.slug}
            onClick={() => onPick(ch.slug)}
            className={`brutal-border ${cls} text-left px-2.5 py-2 flex items-center gap-2.5 brutal-press transition-all hover:translate-x-0.5 group`}
          >
            <span className="font-mono text-[9px] opacity-50 shrink-0 w-4">{String(ch.number).padStart(2, "0")}</span>
            <span className="text-base leading-none shrink-0">{ch.complete ? "✓" : ch.emoji}</span>
            <span className="flex-1 min-w-0">
              <span className="font-display text-xs leading-tight block truncate">{ch.title}</span>
              {/* mini progress bar */}
              <span className="flex items-center gap-1.5 mt-1">
                <span className={`flex-1 h-1 overflow-hidden ${dark ? "bg-bone/15" : "bg-ink/10"}`}>
                  <span
                    className={`block h-full ${dark ? "bg-volt" : "bg-ink"} transition-all duration-500`}
                    style={{ width: `${ch.pct}%` }}
                  />
                </span>
                <span className="font-mono text-[8px] opacity-50 shrink-0 tabular-nums">{ch.done}/{ch.total}</span>
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Rail ─────────────────────────────────────────────────────────────────────
function Rail({ world, view }: { world: WorldId; view: "flow" | "free" }) {
  const t = WORLD_THEME[world];
  const { chapterStats, done, total, pct } = useWorldStats(world);
  const { progress } = useProgress();

  return (
    <aside
      className={`hidden md:flex flex-col w-[270px] shrink-0 border-r-4 border-ink ${t.railBg} ${t.textPrimary} sticky self-start overflow-y-auto`}
      style={{ top: "var(--header-h, 64px)", height: "calc(100vh - var(--header-h, 64px))" }}
    >
      {/* World identity */}
      <div className="p-4 border-b-4 border-ink/20">
        <Link href="/worlds" className="font-mono text-[9px] uppercase opacity-55 hover:opacity-90 transition-opacity block mb-3">
          ← All worlds
        </Link>
        <div className="flex items-center gap-3">
          <Ring pct={pct} dark={t.dark} />
          <div className="min-w-0">
            <div className="font-display text-2xl leading-none flex items-center gap-1.5">
              <span>{t.emoji}</span>
            </div>
            <div className="font-display text-lg leading-tight mt-1 truncate">{t.title}</div>
            <div className="font-mono text-[9px] uppercase opacity-55 mt-0.5">{done}/{total} lessons</div>
          </div>
        </div>
      </div>

      {/* World switcher */}
      <div className="p-3 border-b-4 border-ink/20">
        <div className="font-mono text-[8px] uppercase opacity-45 mb-2">Switch world</div>
        <WorldTabs current={world} view={view} />
      </div>

      {/* Mode switch — the ONE switch, URL-driven */}
      <div className="p-3 border-b-4 border-ink/20">
        <div className="font-mono text-[8px] uppercase opacity-45 mb-2">View</div>
        <ModeSwitch worldSlug={world} activeView={view} full size="md" />
        <p className="font-mono text-[8px] opacity-45 mt-2 leading-relaxed">
          {view === "flow"
            ? "🌊 Focused path — one lesson at a time."
            : "📖 Open wiki — browse everything freely."}
        </p>
      </div>

      {/* Chapter tree */}
      <div className="p-3 flex-1">
        <div className="font-mono text-[8px] uppercase opacity-45 mb-2">
          {chapterStats.length} chapters
        </div>
        <ChapterList stats={chapterStats} dark={t.dark} onPick={scrollToChapter} />
      </div>

      {/* Stats footer */}
      <div className="p-3 border-t-4 border-ink/20 flex items-center gap-2">
        {[`🔥 ${progress.streakDays}`, `${progress.xp} XP`, `💎 ${progress.gems}`].map((label) => (
          <div key={label} className={`brutal-border px-2 py-1 font-mono text-[9px] uppercase ${t.dark ? "bg-bone/10" : "bg-ink/10"}`}>
            {label}
          </div>
        ))}
      </div>
    </aside>
  );
}

// ─── Mobile bar + chapter sheet ───────────────────────────────────────────────
function MobileBar({ world, view }: { world: WorldId; view: "flow" | "free" }) {
  const t = WORLD_THEME[world];
  const { chapterStats, pct } = useWorldStats(world);
  const [sheetOpen, setSheetOpen] = useState(false);

  const pick = useCallback((slug: string) => {
    setSheetOpen(false);
    setTimeout(() => scrollToChapter(slug), 120);
  }, []);

  return (
    <div className="md:hidden">
      {/* Sticky compact bar */}
      <div
        className={`${t.railBg} ${t.textPrimary} border-b-4 border-ink sticky z-30`}
        style={{ top: "var(--header-h, 56px)" }}
      >
        <div className="px-3 py-2.5 flex items-center gap-2">
          <Link href="/worlds" className="text-lg leading-none shrink-0" aria-label="All worlds">{t.emoji}</Link>
          <div className="min-w-0 flex-1">
            <div className="font-display text-sm leading-none truncate">{t.title}</div>
            <div className="font-mono text-[8px] uppercase opacity-55 mt-0.5">{pct}% complete</div>
          </div>
          <ModeSwitch worldSlug={world} activeView={view} />
          <button
            onClick={() => setSheetOpen(true)}
            className={`brutal-border px-2.5 py-1.5 font-display text-xs brutal-press shrink-0 ${t.dark ? "bg-bone/10" : "bg-ink/10"}`}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Chapter sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-[2px]" onClick={() => setSheetOpen(false)}>
          <div
            className={`absolute bottom-0 left-0 right-0 max-h-[75vh] overflow-y-auto ${t.railBg} ${t.textPrimary} brutal-border border-x-0 border-b-0 animate-slide-up`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between px-4 py-3 border-b-4 border-ink/20 bg-inherit">
              <span className="font-display text-lg">Chapters</span>
              <button onClick={() => setSheetOpen(false)} className="brutal-border bg-ink/10 px-3 py-1.5 font-display text-xs brutal-press">✕</button>
            </div>
            <div className="p-4 pb-8">
              <div className="mb-3"><WorldTabs current={world} view={view} compact /></div>
              <div className="mb-3"><ModeSwitch worldSlug={world} activeView={view} full size="md" /></div>
              <ChapterList stats={chapterStats} dark={t.dark} onPick={pick} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────
export function WorldShell({ slug, view }: { slug: WorldId; view: "flow" | "free" }) {
  const t = WORLD_THEME[slug];

  return (
    <main className={`${t.surface} min-h-screen`}>
      <MobileBar world={slug} view={view} />
      <div className="flex">
        <Rail world={slug} view={view} />
        <div className="flex-1 min-w-0">
          {view === "free"
            ? <WorldPageClient slug={slug} embedded />
            : <WorldPathClient worldSlug={slug} embedded />}
        </div>
      </div>
    </main>
  );
}
