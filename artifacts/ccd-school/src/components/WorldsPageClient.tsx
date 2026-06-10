"use client";
/**
 * WorldsPageClient — /worlds landing.
 *
 * Design: stacked full-width world cards (reference branch).
 * - No sidebar — clean vertical scroll
 * - Each world card: color-block hero, progress %, cat, description
 * - Chapter breadcrumb rail (horizontal scroll)
 * - Single ENTER CTA per world
 * - Scroll-linked card reveal animation
 * - Marquee ticker
 */
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { chaptersByWorld } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";
import { useProgress } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import { WORLD_ORDER, WORLD_THEMES, CHAPTER_EMOJIS, type WorldSlug } from "@/components/world/worldTheme";

// ─── Scroll reveal ─────────────────────────────────────────────────────────────
function useScrollReveal(rootMargin = "0px 0px -60px 0px") {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.06, rootMargin }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [rootMargin]);
  return { ref, visible };
}

// ─── Marquee ──────────────────────────────────────────────────────────────────
function MarqueeStrip() {
  const items = [
    "🎵 153 MISSIONS", "🌍 3 WORLDS", "📚 16 CHAPTERS",
    "🎧 DJ WORLD", "🎛 PRODUCER", "🔊 FUNDAMENTALS",
    "🐱 CATS CAN DANCE", "⚡ GAMIFIED", "🏆 EARN TROPHIES",
    "🌊 FLOW MODE", "📖 FREE MODE",
  ];
  const doubled = [...items, ...items];
  return (
    <div className="border-b-4 border-ink bg-ink text-bone overflow-hidden py-2.5 shrink-0">
      <div className="flex gap-8 animate-marquee whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="font-display text-sm uppercase shrink-0">
            {item}
            <span className="text-acid mx-3 opacity-50">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Chapter breadcrumb rail ──────────────────────────────────────────────────
function ChapterRail({
  world,
  chapterStats,
  visible,
}: {
  world: WorldSlug;
  chapterStats: { slug: string; title: string; number: number; pct: number; complete: boolean }[];
  visible: boolean;
}) {
  const t = WORLD_THEMES[world];
  return (
    <div className={`mt-5 pt-4 border-t-2 ${t.dark ? "border-bone/15" : "border-ink/15"}`}>
      <div className={`font-mono text-[9px] uppercase mb-2.5 ${t.textMuted}`}>
        {chapterStats.length} chapters
      </div>
      <div className="overflow-x-auto pb-1 -mx-1 px-1">
        <div className="flex items-center gap-0 min-w-max">
          {chapterStats.map((ch, i) => {
            const emoji = CHAPTER_EMOJIS[ch.slug] ?? "📖";
            const isDone = ch.complete;
            const isStarted = ch.pct > 0 && !isDone;
            const pillClass = isDone
              ? t.pillDone
              : isStarted
              ? t.pillPartial
              : t.pillEmpty;

            return (
              <div key={ch.slug} className="flex items-center">
                {i > 0 && <div className={`w-3 h-px shrink-0 ${t.pillConnector}`} />}
                <div
                  className={`brutal-border flex items-center gap-1.5 px-2 py-1.5 shrink-0 transition-all duration-500 ${pillClass}`}
                  style={{ transitionDelay: visible ? `${i * 60}ms` : "0ms" }}
                >
                  <span className={`font-mono text-[7px] opacity-50 leading-none`}>
                    {String(ch.number).padStart(2, "0")}
                  </span>
                  <span className="text-sm leading-none">{isDone ? "✓" : emoji}</span>
                  <span className="font-display text-[10px] leading-none max-w-[60px] truncate">
                    {ch.title.split(" ")[0]}
                  </span>
                  {isStarted && (
                    <span className="font-mono text-[7px] opacity-60 leading-none">{ch.pct}%</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── World card ───────────────────────────────────────────────────────────────
function WorldCard({ world, index }: { world: WorldSlug; index: number }) {
  const { progress } = useProgress();
  const { learnMode } = useLearnMode();
  const isFree = learnMode !== "flow";
  const enterHref = isFree ? `/world/${world}?view=free` : `/world/${world}`;
  const completed = progress.completedMissions;
  const { ref, visible } = useScrollReveal();

  const t = WORLD_THEMES[world];
  const chapters = chaptersByWorld(world);
  const paths = pathsByWorld(world);
  const allSlugs = paths.flatMap((p) => p.missionSlugs);
  const done = allSlugs.filter((s) => !!completed[s]).length;
  const total = allSlugs.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const chapterStats = chapters.map((ch) => {
    const chPaths = paths.filter((p) => p.chapter === ch.slug);
    const chSlugs = chPaths.flatMap((p) => p.missionSlugs);
    const chDone = chSlugs.filter((s) => !!completed[s]).length;
    const chPct = chSlugs.length > 0 ? Math.round((chDone / chSlugs.length) * 100) : 0;
    return {
      slug: ch.slug,
      title: ch.title,
      number: ch.number,
      pct: chPct,
      complete: chDone === chSlugs.length && chSlugs.length > 0,
    };
  });

  const progressLabel =
    done === 0 ? `${total} missions` : pct === 100 ? "Complete 🏆" : `${done}/${total}`;

  return (
    <div
      ref={ref}
      className="transition-all duration-700 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transitionDelay: `${index * 80}ms`,
      }}
    >
      <div className={`brutal-border ${t.shadow} overflow-hidden`}>

        {/* Card body */}
        <div className={`${t.heroBg} ${t.heroText} p-5 md:p-7 relative overflow-hidden`}>

          {/* Decorative bg elements */}
          <div
            className="absolute -bottom-8 -right-8 w-40 h-40 opacity-[0.06] pointer-events-none"
            aria-hidden
          >
            <Image src={t.deco1} alt="" fill className="object-contain" />
          </div>
          <div
            className="absolute top-5 right-32 w-9 h-9 opacity-[0.10] spin-slow pointer-events-none"
            aria-hidden
          >
            <Image src={t.deco2} alt="" fill className="object-contain" />
          </div>

          {/* Top row: title + pct + cat */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className={`font-mono text-[9px] uppercase mb-1.5 ${t.textMuted}`}>
                {chapters.length} CH · {paths.length} PATHS · {total} MISSIONS
              </div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl md:text-5xl leading-none">{t.emoji}</span>
                <h2 className="font-display text-3xl md:text-5xl leading-none">
                  {t.title.toUpperCase()}
                </h2>
              </div>
              <p className={`font-display text-sm md:text-base leading-snug ${t.textMuted}`}>
                {t.tagline}
              </p>
            </div>

            <div className="shrink-0 flex flex-col items-end gap-2">
              <div className="text-right">
                <div className="font-display text-4xl md:text-5xl tabular-nums leading-none">{pct}%</div>
                <div className={`font-mono text-[8px] uppercase mt-0.5 ${t.textMuted}`}>
                  {progressLabel}
                </div>
              </div>
              <div
                className="w-16 h-16 md:w-20 md:h-20 wiggle"
                style={{ filter: "drop-shadow(3px 3px 0 rgba(0,0,0,0.2))" }}
                aria-hidden
              >
                <Image
                  src={t.catMain}
                  alt=""
                  width={80}
                  height={80}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <p className={`font-mono text-xs leading-relaxed mt-3 mb-4 max-w-lg ${t.textMuted}`}>
            {t.description}
          </p>

          {/* Progress bar */}
          <div className={`h-2.5 brutal-border overflow-hidden mb-1 ${t.barBg}`}>
            <div
              className={`h-full ${t.barFill} transition-all duration-1000`}
              style={{ width: visible ? `${pct}%` : "0%" }}
            />
          </div>

          {/* Chapter rail */}
          <ChapterRail world={world} chapterStats={chapterStats} visible={visible} />

          {/* Bottom deco cats */}
          <div className={`flex items-end gap-2 mt-4 pt-3 border-t-2 ${t.dark ? "border-bone/10" : "border-ink/10"}`}>
            <div className="w-9 h-9 float opacity-55" style={{ animationDelay: "0.3s" }} aria-hidden>
              <Image
                src={t.catDeco1}
                alt=""
                width={36}
                height={36}
                className="w-full h-full object-contain"
                style={{ filter: "drop-shadow(2px 2px 0 rgba(0,0,0,0.15))" }}
              />
            </div>
            <div className="w-8 h-8 float opacity-45" style={{ animationDelay: "1.2s" }} aria-hidden>
              <Image
                src={t.catDeco2}
                alt=""
                width={32}
                height={32}
                className="w-full h-full object-contain"
                style={{ filter: "drop-shadow(2px 2px 0 rgba(0,0,0,0.12))" }}
              />
            </div>

            {/* Wiki link */}
            <div className="ml-auto">
              <Link
                href={`/wiki#${world}`}
                className={`font-mono text-[9px] uppercase transition-opacity hover:opacity-80 ${t.textMuted}`}
              >
                Wiki →
              </Link>
            </div>
          </div>
        </div>

        {/* Single ENTER CTA */}
        <Link
          href={enterHref}
          className={`flex items-center justify-between border-t-4 border-ink py-4 px-6 brutal-press transition-colors group ${t.flowBtn}`}
        >
          <span className="flex items-center gap-2.5">
            <span className="text-lg">{isFree ? "📖" : "🌊"}</span>
            <span className="font-display text-base">ENTER {t.title.toUpperCase()}</span>
            <span className={`font-mono text-[8px] uppercase opacity-55`}>
              {isFree ? "free · open wiki" : "flow · guided path"}
            </span>
          </span>
          <span className="font-display text-xl group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
    </div>
  );
}

// ─── Page hero ────────────────────────────────────────────────────────────────
function Hero() {
  const { learnMode } = useLearnMode();
  const isFlow = learnMode === "flow";

  return (
    <header className="border-b-4 border-ink bg-bone relative overflow-hidden">
      <div
        className="absolute top-3 right-7 w-12 h-12 opacity-[0.14] wiggle pointer-events-none"
        aria-hidden
      >
        <Image src="/cats/cat-dancer.png" alt="" fill className="object-contain" />
      </div>
      <div
        className="absolute bottom-3 right-28 w-8 h-8 opacity-[0.08] spin-slow pointer-events-none"
        aria-hidden
      >
        <Image src="/cats/star.png" alt="" fill className="object-contain" />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-7 md:py-10 relative z-10">
        <div className="font-mono text-[10px] uppercase opacity-40 mb-2">
          // 3 WORLDS · 153 MISSIONS · 16 CHAPTERS
        </div>
        <h1 className="font-display text-6xl md:text-8xl leading-none mb-3">WORLDS</h1>
        <p className="font-mono text-sm opacity-55 max-w-lg leading-relaxed mb-4">
          Start with Fundamentals — it unlocks everything. Then specialise as a DJ, Producer, or both.
        </p>

        <div className="flex items-center gap-3 flex-wrap">
          <div
            className={`inline-flex items-center gap-2.5 brutal-border px-3 py-2 ${
              isFlow ? "bg-acid text-ink" : "bg-electric-blue text-bone"
            }`}
          >
            <span className="text-base">{isFlow ? "🌊" : "📖"}</span>
            <span className="font-display text-sm">{isFlow ? "Flow Mode" : "Free Mode"}</span>
            <span className="font-mono text-[8px] opacity-45 ml-1">
              {isFlow ? "sequential · hearts on" : "all lessons open"}
            </span>
          </div>
          <Link
            href="/wiki"
            className="brutal-border bg-ink text-bone px-3 py-2 font-display text-sm brutal-press hover:bg-electric-blue transition-colors flex items-center gap-2"
          >
            📖 Browse Wiki →
          </Link>
        </div>
      </div>
    </header>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function WorldsPageClient() {
  return (
    <main className="min-h-screen bg-bone">
      <Hero />
      <MarqueeStrip />
      <div className="max-w-5xl mx-auto px-4 py-7 space-y-6 pb-24">
        {WORLD_ORDER.map((world, i) => (
          <WorldCard key={world} world={world} index={i} />
        ))}
      </div>
    </main>
  );
}
