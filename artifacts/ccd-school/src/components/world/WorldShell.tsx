"use client";
/**
 * WorldShell — dual-pane layout for every /world/[slug] page.
 *
 * Desktop layout uses world-shell-body / world-shell-rail / world-shell-content
 * CSS classes (defined in globals.css) so BOTH panes fill the viewport height
 * and scroll independently — rail stays fixed, content scrolls.
 *
 * Features:
 * - Active chapter tracking via IntersectionObserver on the content pane
 * - Chapter buttons: full names, big tap targets, animated progress bars,
 *   active-chapter accent + tail-wag cat indicator
 * - Rail chapter buttons slide in on mount (staggered slide-in-left)
 * - World switcher always visible on mobile (3 emoji pills in sticky bar)
 * - Scroll-to-top button (contextual world cat) appears after 400px scroll
 */
import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useProgress } from "@/lib/progress";
import { chaptersByWorld } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";
import { ModeSwitch } from "@/components/world/ModeSwitch";
import {
  WORLD_ORDER,
  WORLD_THEMES,
  CHAPTER_EMOJIS,
  getWorldTheme,
  type WorldSlug,
} from "@/components/world/worldTheme";

// ─── Types ────────────────────────────────────────────────────────────────────
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

export interface WorldShellProps {
  worldSlug: WorldSlug;
  view: "flow" | "free";
  children: React.ReactNode;
}

// ─── Hook: per-world stats ────────────────────────────────────────────────────
function useWorldStats(world: WorldSlug) {
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

  return { chapterStats, done, total, pct, paths: paths.length, chapters: chapters.length };
}

// ─── Scroll helpers ───────────────────────────────────────────────────────────
function scrollContentToChapter(contentRef: React.RefObject<HTMLDivElement | null>, slug: string) {
  // Try scrolling inside the content pane first, fallback to window
  const target = document.getElementById(`chapter-${slug}`);
  if (!target) return;
  const pane = contentRef.current;
  if (pane) {
    const paneTop = pane.getBoundingClientRect().top;
    const targetTop = target.getBoundingClientRect().top;
    pane.scrollBy({ top: targetTop - paneTop - 16, behavior: "smooth" });
  } else {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// ─── Progress ring ────────────────────────────────────────────────────────────
function ProgressRing({ pct, dark }: { pct: number; dark: boolean }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const fill = dark ? "#C6FF00" : "hsl(222 47% 4%)";
  const track = dark ? "rgba(198,255,0,0.15)" : "rgba(0,0,0,0.12)";
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" className="shrink-0" aria-hidden>
      <circle cx="28" cy="28" r={r} fill="none" stroke={track} strokeWidth="5" />
      <circle
        cx="28" cy="28" r={r} fill="none"
        stroke={fill} strokeWidth="5" strokeLinecap="round"
        strokeDasharray={`${(circ * Math.min(pct, 100)) / 100} ${circ}`}
        transform="rotate(-90 28 28)"
        style={{ transition: "stroke-dasharray 0.9s ease" }}
      />
      <text x="28" y="32" textAnchor="middle" fontSize="12" fontWeight="700"
        fill="currentColor" fontFamily="inherit">{pct}%</text>
    </svg>
  );
}

// ─── World switcher in rail ───────────────────────────────────────────────────
function WorldSwitcher({ current, view, dark }: { current: WorldSlug; view: "flow" | "free"; dark: boolean }) {
  const suffix = view === "free" ? "?view=free" : "";
  return (
    <div className="flex flex-col gap-1.5">
      {WORLD_ORDER.map((w) => {
        const t = WORLD_THEMES[w];
        const active = w === current;
        return (
          <Link
            key={w}
            href={`/world/${w}${suffix}`}
            className={`brutal-border flex items-center gap-2.5 px-3 py-2.5 font-display text-xs brutal-press transition-all ${
              active
                ? `${t.accentBg} ${t.accentText} chunk-shadow-sm`
                : dark
                ? "bg-bone/6 text-bone hover:bg-bone/14"
                : "bg-ink/5 text-ink hover:bg-ink/12"
            }`}
          >
            <span className="text-lg leading-none shrink-0">{t.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="leading-tight truncate">{t.title}</div>
              {active && (
                <div className="font-mono text-[8px] uppercase mt-0.5 opacity-60">current world</div>
              )}
            </div>
            {active && <span className="shrink-0 text-xs opacity-70">●</span>}
          </Link>
        );
      })}
    </div>
  );
}

// ─── Chapter nav buttons — big, full names, active tracking ──────────────────
function ChapterNavList({
  stats,
  dark,
  activeSlug,
  onPick,
}: {
  stats: ChapterStat[];
  dark: boolean;
  activeSlug: string | null;
  onPick: (slug: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      {stats.map((ch, i) => {
        const isActive = ch.slug === activeSlug;
        const isDone = ch.complete;
        const isStarted = ch.done > 0 && !isDone;

        // State-based styling
        const btnClass = isDone
          ? dark
            ? "bg-volt text-ink border-volt/80 hover:bg-volt/90"
            : "bg-ink text-bone border-ink hover:bg-ink/85"
          : isActive
          ? dark
            ? "bg-volt/20 text-bone border-volt/50 hover:bg-volt/28"
            : "bg-acid/25 text-ink border-ink/40 hover:bg-acid/35"
          : isStarted
          ? dark
            ? "bg-bone/8 text-bone border-bone/20 hover:bg-bone/14"
            : "bg-ink/8 text-ink border-ink/20 hover:bg-ink/14"
          : dark
          ? "bg-transparent text-bone/60 border-bone/10 hover:bg-bone/8 hover:text-bone/85"
          : "bg-transparent text-ink/55 border-ink/10 hover:bg-ink/6 hover:text-ink/85";

        return (
          <button
            key={ch.slug}
            onClick={() => onPick(ch.slug)}
            style={{ animationDelay: `${i * 45}ms` }}
            className={`animate-slide-in-left brutal-border w-full text-left px-3 py-3 brutal-press transition-all group ${btnClass}`}
          >
            <div className="flex items-start gap-2.5">
              {/* Number + active indicator */}
              <div className="shrink-0 flex flex-col items-center gap-0.5 pt-0.5">
                <span className={`font-mono text-[8px] tabular-nums leading-none ${dark ? "opacity-45" : "opacity-35"}`}>
                  {String(ch.number).padStart(2, "0")}
                </span>
                {isActive && (
                  <span className="text-base leading-none animate-tail-wag mt-0.5">
                    {ch.emoji}
                  </span>
                )}
              </div>

              {/* Title + subtitle */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  {!isActive && (
                    <span className="text-sm leading-none shrink-0">
                      {isDone ? "✓" : ch.emoji}
                    </span>
                  )}
                  <span className="font-display text-sm leading-tight">{ch.title}</span>
                </div>

                {/* Progress bar */}
                <div className={`h-1 overflow-hidden ${dark ? "bg-bone/10" : "bg-ink/8"}`}>
                  <div
                    className={`h-full transition-all duration-700 ${dark ? "bg-volt" : "bg-ink"}`}
                    style={{ width: `${ch.pct}%` }}
                  />
                </div>

                {/* Stats line */}
                <div className={`flex items-center justify-between mt-1 font-mono text-[8px] ${dark ? "opacity-45" : "opacity-40"}`}>
                  <span>{ch.done}/{ch.total} lessons</span>
                  {ch.pct > 0 && <span>{ch.pct}%</span>}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Scroll-to-top cat button ─────────────────────────────────────────────────
function ScrollToTopCat({
  contentRef,
  catSrc,
  dark,
}: {
  contentRef: React.RefObject<HTMLDivElement | null>;
  catSrc: string;
  dark: boolean;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const pane = contentRef.current;
    if (!pane) return;
    const onScroll = () => setVisible(pane.scrollTop > 400);
    pane.addEventListener("scroll", onScroll, { passive: true });
    return () => pane.removeEventListener("scroll", onScroll);
  }, [contentRef]);

  const scrollTop = () => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollTop}
      aria-label="Scroll to top"
      className={`fixed bottom-6 right-6 z-40 w-14 h-14 brutal-border brutal-press transition-all animate-cat-peek ${
        dark ? "bg-volt text-ink hover:bg-acid" : "bg-acid text-ink hover:bg-sun"
      } chunk-shadow`}
      style={{ filter: "drop-shadow(3px 3px 0 rgba(0,0,0,0.25))" }}
    >
      <Image
        src={catSrc}
        alt="Scroll to top"
        width={48}
        height={48}
        className="w-10 h-10 object-contain mx-auto animate-bounce-bob"
      />
    </button>
  );
}

// ─── Desktop Rail ─────────────────────────────────────────────────────────────
function Rail({
  world,
  view,
  activeChapter,
  contentRef,
}: {
  world: WorldSlug;
  view: "flow" | "free";
  activeChapter: string | null;
  contentRef: React.RefObject<HTMLDivElement | null>;
}) {
  const t = getWorldTheme(world);
  const { progress } = useProgress();
  const { chapterStats, done, total, pct, paths, chapters } = useWorldStats(world);

  const handlePick = useCallback((slug: string) => {
    scrollContentToChapter(contentRef, slug);
  }, [contentRef]);

  return (
    <aside className={`world-shell-rail hidden md:flex flex-col ${t.railBg} ${t.railBorder} ${t.railText}`}>
      <div className="flex-1 overflow-y-auto">

        {/* World identity */}
        <div className={`p-4 border-b-4 ${t.dark ? "border-bone/10" : "border-ink/10"}`}>
          <Link
            href="/worlds"
            className={`font-mono text-[9px] uppercase mb-3 block transition-opacity hover:opacity-80 ${t.railMuted}`}
          >
            ← All worlds
          </Link>
          <div className="flex items-center gap-3">
            <ProgressRing pct={pct} dark={t.dark} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-2xl leading-none">{t.emoji}</span>
                <span className="font-display text-xl leading-none">{t.title}</span>
              </div>
              <div className={`font-mono text-[9px] uppercase mt-1 ${t.railMuted}`}>
                {done}/{total} missions · {pct}%
              </div>
              <div className={`font-mono text-[8px] uppercase mt-0.5 ${t.railMuted}`}>
                {chapters} chapters · {paths} paths
              </div>
            </div>
          </div>
        </div>

        {/* World switcher */}
        <div className={`p-3 border-b-4 ${t.dark ? "border-bone/10" : "border-ink/10"}`}>
          <div className={`font-mono text-[8px] uppercase mb-2 ${t.railMuted}`}>Switch world</div>
          <WorldSwitcher current={world} view={view} dark={t.dark} />
        </div>

        {/* Mode switch */}
        <div className={`p-3 border-b-4 ${t.dark ? "border-bone/10" : "border-ink/10"}`}>
          <div className={`font-mono text-[8px] uppercase mb-2 ${t.railMuted}`}>View</div>
          <ModeSwitch worldSlug={world} activeView={view} full size="md" />
          <p className={`font-mono text-[8px] mt-2 leading-relaxed ${t.railMuted}`}>
            {view === "flow" ? "🌊 Sequential path — hearts on." : "📖 Open wiki — browse everything."}
          </p>
        </div>

        {/* Chapter nav — the star of the show */}
        <div className="p-3">
          <div className={`font-mono text-[8px] uppercase mb-3 ${t.railMuted}`}>
            {chapterStats.length} chapters
          </div>
          <ChapterNavList
            stats={chapterStats}
            dark={t.dark}
            activeSlug={activeChapter}
            onPick={handlePick}
          />
        </div>
      </div>

      {/* Stats footer */}
      <div className={`border-t-4 p-3 flex items-center gap-1.5 flex-wrap ${t.dark ? "border-bone/10" : "border-ink/10"}`}>
        {[`🔥 ${progress.streakDays}d`, `${progress.xp.toLocaleString()} XP`, `💎 ${progress.gems}`].map((label) => (
          <div
            key={label}
            className={`brutal-border px-2 py-1 font-mono text-[8px] uppercase ${
              t.dark ? "bg-bone/8 text-bone" : "bg-ink/8 text-ink"
            }`}
          >
            {label}
          </div>
        ))}
      </div>
    </aside>
  );
}

// ─── Mobile bar + sheet ───────────────────────────────────────────────────────
function MobileBar({
  world,
  view,
  activeChapter,
  contentRef,
}: {
  world: WorldSlug;
  view: "flow" | "free";
  activeChapter: string | null;
  contentRef: React.RefObject<HTMLDivElement | null>;
}) {
  const t = getWorldTheme(world);
  const { chapterStats, pct } = useWorldStats(world);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { progress } = useProgress();

  const pick = useCallback((slug: string) => {
    setSheetOpen(false);
    setTimeout(() => scrollContentToChapter(contentRef, slug), 120);
  }, [contentRef]);

  const activeChapterTitle = activeChapter
    ? chapterStats.find((c) => c.slug === activeChapter)?.title ?? null
    : null;

  return (
    <div className="md:hidden">
      {/* Compact sticky bar */}
      <div
        className={`${t.railBg} ${t.railText} border-b-4 border-ink sticky z-30`}
        style={{ top: "56px" }}
      >
        <div className="px-3 py-2 flex items-center gap-2">
          <Link href="/worlds" className="text-xl leading-none shrink-0" aria-label="All worlds">
            {t.emoji}
          </Link>
          <div className="min-w-0 flex-1">
            <div className="font-display text-sm leading-none truncate">
              {activeChapterTitle ?? t.title}
            </div>
            <div className={`font-mono text-[8px] uppercase mt-0.5 ${t.railMuted}`}>{pct}%</div>
          </div>

          {/* World switcher — always visible */}
          <div className="flex gap-1 shrink-0">
            {WORLD_ORDER.map((w) => {
              const wt = WORLD_THEMES[w];
              const active = w === world;
              return (
                <Link
                  key={w}
                  href={`/world/${w}${view === "free" ? "?view=free" : ""}`}
                  className={`brutal-border w-9 h-9 flex items-center justify-center text-base brutal-press transition-all ${
                    active
                      ? `${wt.accentBg} ${wt.accentText}`
                      : t.dark ? "bg-bone/8 text-bone/60" : "bg-ink/6 text-ink/55"
                  }`}
                  aria-label={wt.title}
                >
                  {wt.emoji}
                </Link>
              );
            })}
          </div>

          <ModeSwitch worldSlug={world} activeView={view} size="sm" />

          <button
            onClick={() => setSheetOpen(true)}
            className={`brutal-border w-9 h-9 flex items-center justify-center font-display text-sm brutal-press shrink-0 ${
              t.dark ? "bg-bone/10 text-bone" : "bg-ink/8 text-ink"
            }`}
            aria-label="Open chapters"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Chapter sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 bg-ink/75 backdrop-blur-sm" onClick={() => setSheetOpen(false)}>
          <div
            className={`absolute bottom-0 left-0 right-0 max-h-[82vh] overflow-y-auto ${t.railBg} ${t.railText} border-t-4 border-ink animate-slide-up`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`sticky top-0 flex items-center justify-between px-4 py-3 border-b-4 ${t.dark ? "border-bone/15" : "border-ink/15"} ${t.railBg}`}>
              <span className="font-display text-lg">{t.emoji} {t.title}</span>
              <button
                onClick={() => setSheetOpen(false)}
                className={`brutal-border px-3 py-1.5 font-display text-xs brutal-press ${t.dark ? "bg-bone/10" : "bg-ink/8"}`}
              >✕</button>
            </div>

            <div className="p-4 pb-12 space-y-4">
              {/* World switcher */}
              <div>
                <div className={`font-mono text-[8px] uppercase mb-2 ${t.railMuted}`}>Switch world</div>
                <div className="flex gap-2">
                  {WORLD_ORDER.map((w) => {
                    const wt = WORLD_THEMES[w];
                    return (
                      <Link
                        key={w}
                        href={`/world/${w}${view === "free" ? "?view=free" : ""}`}
                        onClick={() => setSheetOpen(false)}
                        className={`flex-1 brutal-border flex flex-col items-center gap-1 py-2.5 font-display text-xs brutal-press transition-all ${
                          w === world
                            ? `${wt.accentBg} ${wt.accentText} chunk-shadow-sm`
                            : t.dark ? "bg-bone/6 text-bone" : "bg-ink/5 text-ink"
                        }`}
                      >
                        <span className="text-xl">{wt.emoji}</span>
                        <span>{wt.title.split(" ")[0]}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Mode */}
              <div>
                <div className={`font-mono text-[8px] uppercase mb-2 ${t.railMuted}`}>Mode</div>
                <ModeSwitch worldSlug={world} activeView={view} full size="md" />
              </div>

              {/* Stats */}
              <div className="flex gap-2">
                {[`🔥 ${progress.streakDays}d`, `${progress.xp} XP`, `💎 ${progress.gems}`].map((l) => (
                  <div key={l} className={`brutal-border px-2.5 py-1.5 font-mono text-[9px] uppercase ${t.dark ? "bg-bone/8 text-bone" : "bg-ink/8 text-ink"}`}>{l}</div>
                ))}
              </div>

              {/* Chapter nav */}
              <div>
                <div className={`font-mono text-[8px] uppercase mb-2 ${t.railMuted}`}>Chapters</div>
                <ChapterNavList
                  stats={chapterStats}
                  dark={t.dark}
                  activeSlug={activeChapter}
                  onPick={pick}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────
export function WorldShell({ worldSlug, view, children }: WorldShellProps) {
  const t = getWorldTheme(worldSlug);
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeChapter, setActiveChapter] = useState<string | null>(null);
  const chapters = chaptersByWorld(worldSlug);

  // IntersectionObserver on content pane to track active chapter
  useEffect(() => {
    const pane = contentRef.current;
    if (!pane) return;

    const observers: IntersectionObserver[] = [];

    chapters.forEach((ch) => {
      const el = document.getElementById(`chapter-${ch.slug}`);
      if (!el) return;

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveChapter(ch.slug);
        },
        {
          root: pane,
          rootMargin: "-5% 0px -70% 0px",
          threshold: 0,
        }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [worldSlug, chapters]);

  return (
    <div className={`${t.surface}`}>
      {/* Mobile bar */}
      <MobileBar
        world={worldSlug}
        view={view}
        activeChapter={activeChapter}
        contentRef={contentRef}
      />

      {/* Dual-pane body */}
      <div className="world-shell-body">
        <Rail
          world={worldSlug}
          view={view}
          activeChapter={activeChapter}
          contentRef={contentRef}
        />

        {/* Content pane */}
        <div ref={contentRef} className="world-shell-content">
          {children}
        </div>
      </div>

      {/* Scroll-to-top cat */}
      <ScrollToTopCat
        contentRef={contentRef}
        catSrc={t.catMain}
        dark={t.dark}
      />
    </div>
  );
}
