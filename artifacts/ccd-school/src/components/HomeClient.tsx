"use client";
/**
 * HomeClient — CCD.SCHOOL landing page.
 * Fully redesigned as a child of CatsCanDance:
 *   - Electric-blue hero with parallax cats
 *   - Bowlby One headlines with chunk-shadow
 *   - SectionReveal on every section
 *   - CcdMarquee strips between sections
 *   - MoonwalkCat + ScrollPaw
 *   - DJ Cat mascot decorating the page
 *   - Star decorations spinning slowly
 */
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useProgress, DAILY_GOAL_XP } from "@/lib/progress";
import { useAuth } from "@/lib/auth";
import { MISSIONS } from "@/content/missions";
import { FOUNDATIONS_MISSIONS } from "@/content/missions-foundations";
import { DJ_WORLD_MISSIONS } from "@/content/missions-dj";
import { chaptersByWorld } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";
import { getMissionContext } from "@/lib/missionContext";
import { rankFor } from "@/lib/ranks";
import { useState, useEffect, useRef } from "react";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import SectionReveal from "@/components/SectionReveal";
import CcdMarquee from "@/components/CcdMarquee";
import MoonwalkCat from "@/components/MoonwalkCat";
import ScrollPaw from "@/components/ScrollPaw";

const ALL_MISSIONS = [...FOUNDATIONS_MISSIONS, ...DJ_WORLD_MISSIONS, ...MISSIONS];
type WorldTab = "fundamentals" | "dj" | "producer";

const WORLD_DATA = {
  fundamentals: {
    label: "Music Foundations", icon: "🎵",
    color: "bg-acid text-ink", borderAccent: "border-l-4 border-acid",
    tagline: "Sound · Rhythm · Melody · Harmony · Music Tech",
    detail: "Everything you need to understand music before you produce or DJ. Built from learningmusic.ableton.com.",
    stat: "40 missions", to: "/world/fundamentals",
  },
  dj: {
    label: "DJ World", icon: "🎧",
    color: "bg-ink text-bone", borderAccent: "border-l-4 border-volt",
    tagline: "Setup · Library · The Mix · Performance · Mastery",
    detail: "rekordbox, beatmatching, crowd reading and career. Built from the Pioneer DJ rekordbox 6.0.0 Manual.",
    stat: "40 missions", to: "/world/dj",
  },
  producer: {
    label: "Producer", icon: "🎛",
    color: "bg-electric-blue text-bone", borderAccent: "border-l-4 border-sun",
    tagline: "First Contact · Sound & MIDI · The Mix · Performance · Advanced",
    detail: "Ableton Live 12 from zero to expert. Built from the Ableton Live 12 Reference Manual.",
    stat: "73 missions", to: "/world/producer",
  },
} as const;

const FAQ = [
  { q: "What's the difference between Flow Mode and Free Mode?", a: "Free Mode is fully open — every mission accessible from the start. Flow Mode gates content sequentially like Duolingo: complete each mission before the next unlocks. Wrong answers cost a heart." },
  { q: "Do I need to start with Fundamentals?", a: "In Free Mode, no — jump anywhere. In Flow Mode, Fundamentals is a hard prerequisite before DJ World and Producer unlock." },
  { q: "What are the sources for the content?", a: "Fundamentals: learningmusic.ableton.com. DJ World: Pioneer DJ rekordbox 6.0.0 Manual. Producer: Ableton Live 12 Reference Manual. All quiz questions cite their source." },
  { q: "How long does it take to complete a world?", a: "At 30 min/day: Fundamentals ≈ 3–4 weeks (40 missions), DJ World ≈ 3–4 weeks (40 missions), Producer ≈ 6–8 weeks (73 missions)." },
  { q: "What are trophies for?", a: "Path trophies (bronze) for completing a path. Chapter trophies (silver) for finishing all paths in a chapter. World trophies (gold) for completing a whole world. CCD Master requires all three." },
];

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ value, label, accent = false }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className={`brutal-border p-4 md:p-5 chunk-shadow ${accent ? "bg-acid text-ink" : "bg-bone text-ink"}`}>
      <div className="font-display text-3xl md:text-4xl tabular-nums leading-none">{value}</div>
      <div className="font-mono text-[10px] uppercase opacity-60 mt-1">{label}</div>
    </div>
  );
}

// ─── Feature pill ─────────────────────────────────────────────────────────────
function FeaturePill({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="brutal-border bg-bone px-3 py-2 flex items-center gap-2 text-sm chunk-shadow-sm">
      <span>{icon}</span>
      <span className="font-mono text-[10px] uppercase opacity-70">{text}</span>
    </div>
  );
}

// ─── World progress helper ────────────────────────────────────────────────────
function worldStats(world: WorldTab, completed: Record<string, unknown>) {
  const missions = ALL_MISSIONS.filter(m => {
    if (world === "fundamentals") return m.world === "foundations";
    return m.world === world;
  });
  const done  = missions.filter(m => !!completed[m.slug]).length;
  const total = missions.length;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
  return { done, total, pct };
}

// ─── Spinning star SVG (CCD style) ───────────────────────────────────────────
function Star({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" className={`w-full h-full ${className}`} aria-hidden>
      <path d="M50 2 L60 38 L98 40 L68 62 L80 98 L50 76 L20 98 L32 62 L2 40 L40 38 Z"
        stroke="hsl(222 47% 4%)" strokeWidth="4" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Hero section ─────────────────────────────────────────────────────────────
function HeroSection({ onGetStarted }: { onGetStarted: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  // Parallax transforms for cat images
  const catDjY    = useTransform(scrollYProgress, [0, 1], reduce ? ["0%","0%"] : ["0%","20%"]);
  const catLeftX  = useTransform(scrollYProgress, [0, 1], reduce ? ["0%","0%"] : ["0%","-60%"]);
  const catRightX = useTransform(scrollYProgress, [0, 1], reduce ? ["0%","0%"] : ["0%","60%"]);
  const catCapY   = useTransform(scrollYProgress, [0, 1], reduce ? ["0%","0%"] : ["0%","35%"]);
  const catHpY    = useTransform(scrollYProgress, [0, 1], reduce ? ["0%","0%"] : ["0%","25%"]);
  const starRotA  = useTransform(scrollYProgress, [0, 1], reduce ? [0,0] : [0, 360]);
  const starRotB  = useTransform(scrollYProgress, [0, 1], reduce ? [0,0] : [0,-360]);
  const titleScale = useTransform(scrollYProgress, [0, 1], reduce ? [1,1] : [1, 1.08]);

  return (
    <section ref={ref} className="relative min-h-[100svh] flex flex-col bg-electric-blue text-bone overflow-hidden">

      {/* Dot-grid texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{ backgroundImage: "radial-gradient(hsl(222 47% 4%) 1px, transparent 1px)", backgroundSize: "4px 4px" }}
        aria-hidden />

      {/* Spinning stars */}
      <motion.div style={{ rotate: starRotA, willChange: "transform" }}
        className="absolute top-24 left-6 md:top-28 md:left-16 z-10 w-16 md:w-32 text-acid"
        aria-hidden>
        <Star />
      </motion.div>
      <motion.div style={{ rotate: starRotB, willChange: "transform" }}
        className="absolute top-32 right-6 md:top-40 md:right-20 z-10 w-14 md:w-28 text-magenta"
        aria-hidden>
        <Star />
      </motion.div>

      {/* Flank cats — top corners */}
      <motion.div style={{ y: catCapY, willChange: "transform" }}
        className="absolute top-[18%] left-[4%] md:left-[10%] z-20 w-20 md:w-36 pointer-events-none wiggle"
        aria-hidden>
        <Image src="/cats/cat-cap.png" alt="" fill={false} width={144} height={144}
          className="w-full h-auto drop-shadow-[4px_4px_0_hsl(222_47%_4%)]" />
      </motion.div>
      <motion.div style={{ y: catHpY, willChange: "transform" }}
        className="absolute top-[18%] right-[4%] md:right-[10%] z-20 w-20 md:w-36 pointer-events-none wiggle"
        aria-hidden>
        <Image src="/cats/cat-headphones-dance.png" alt="" width={144} height={144}
          className="w-full h-auto drop-shadow-[4px_4px_0_hsl(222_47%_4%)]" />
      </motion.div>

      {/* Hero content */}
      <div className="relative z-30 flex-1 flex flex-col justify-center max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-8">
        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-6">
          <span className="brutal-border bg-acid text-ink px-3 py-1 font-display text-xs uppercase tracking-widest chunk-shadow-sm">
            FREE TO START
          </span>
          <span className="font-mono text-xs uppercase opacity-60 tracking-widest">153 missions · 3 worlds</span>
        </div>

        {/* Main headline — Bowlby One, CCD style */}
        <motion.h1
          style={{ scale: titleScale, transformOrigin: "left center", willChange: "transform" }}
          className="font-display leading-[0.85] tracking-tight"
        >
          <span className="block text-[clamp(52px,12vw,140px)] text-bone drop-shadow-[6px_6px_0_hsl(222_47%_4%)]">LEARN</span>
          <span className="block text-[clamp(52px,12vw,140px)] text-bone drop-shadow-[6px_6px_0_hsl(222_47%_4%)]">MUSIC</span>
          <span className="block text-[clamp(52px,12vw,140px)] text-acid drop-shadow-[6px_6px_0_hsl(222_47%_4%)]">PROPERLY.</span>
        </motion.h1>

        {/* Sub-headline */}
        <p className="font-sans text-sm md:text-base opacity-80 leading-relaxed max-w-lg mt-6 md:mt-8">
          The most structured music education on the internet.
          Built from real manuals — Ableton Live 12, rekordbox 6.0 and learningmusic.ableton.com.
          Gamified. Source-verified. Brutally effective.
        </p>

        {/* CTAs — CCD style */}
        <div className="flex flex-wrap gap-3 mt-8 md:mt-10">
          <button onClick={onGetStarted}
            className="brutal-border bg-acid text-ink px-7 py-4 font-display text-xl md:text-2xl brutal-press chunk-shadow hover:bg-sun transition-colors ccd-btn-hover">
            GET STARTED FREE →
          </button>
          <a href="#curriculum"
            className="brutal-border bg-bone/10 border-bone/30 text-bone px-7 py-4 font-display text-xl md:text-2xl brutal-press hover:bg-bone/20 transition-colors">
            SEE CURRICULUM ↓
          </a>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 mt-8">
          <FeaturePill icon="🎓" text="153 structured missions" />
          <FeaturePill icon="🎧" text="47 interactive sims" />
          <FeaturePill icon="🔊" text="Audio-first learning" />
          <FeaturePill icon="🏆" text="XP · Streaks · Badges" />
          <FeaturePill icon="📱" text="Works offline (PWA)" />
        </div>
      </div>

      {/* DJ Cat hero — central mascot */}
      <motion.div
        style={{ y: catDjY, willChange: "transform" }}
        className="absolute bottom-16 md:bottom-4 inset-x-0 mx-auto z-20 w-[70%] md:w-[50%] max-w-[480px] pointer-events-none"
        aria-hidden
      >
        <Image src="/cats/cat-dj-hero.png" alt="" width={480} height={480}
          className="w-full h-auto drop-shadow-[10px_10px_0_hsl(222_47%_4%)]"
          priority />
      </motion.div>

      {/* Left/right cats */}
      <motion.div style={{ x: catLeftX, willChange: "transform" }}
        className="absolute bottom-24 md:bottom-6 left-2 md:left-10 z-30 w-24 md:w-44 drop-shadow-[4px_4px_0_hsl(222_47%_4%)]"
        aria-hidden>
        <Image src="/cats/cat-left.svg" alt="" width={176} height={176} className="w-full h-auto wiggle" />
      </motion.div>
      <motion.div style={{ x: catRightX, willChange: "transform" }}
        className="absolute bottom-24 md:bottom-6 right-2 md:right-10 z-30 w-24 md:w-44 drop-shadow-[4px_4px_0_hsl(222_47%_4%)]"
        aria-hidden>
        <Image src="/cats/cat-right.svg" alt="" width={176} height={176} className="w-full h-auto wiggle" />
      </motion.div>

      {/* Stats strip */}
      <div className="relative z-40 border-t-4 border-ink grid grid-cols-4 bg-ink/60 backdrop-blur-sm">
        {[
          { v: "153", l: "Missions"  },
          { v: "3",   l: "Worlds"    },
          { v: "47",  l: "Live Sims" },
          { v: "0",   l: "Ads. Ever."},
        ].map(({ v, l }) => (
          <div key={l} className="py-4 px-2 text-center border-r-4 border-ink last:border-r-0">
            <div className="font-display text-2xl md:text-3xl text-acid">{v}</div>
            <div className="font-mono text-[9px] uppercase opacity-50 mt-0.5">{l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Dashboard for returning users ───────────────────────────────────────────
function Dashboard() {
  const { progress } = useProgress();
  const { user } = useAuth();
  const router = useRouter();
  const completed = progress.completedMissions;
  const { current: rank } = rankFor(progress.xp);
  const totalDone = ALL_MISSIONS.filter(m => !!completed[m.slug]).length;

  useEffect(() => { router.replace("/dashboard"); }, [router]);

  const continueSlug = (() => {
    const allDoneSlugs = Object.entries(completed)
      .filter(([, v]) => v)
      .sort(([, a], [, b]) => (b?.at ?? 0) - (a?.at ?? 0))
      .map(([slug]) => slug);
    const lastSlug = allDoneSlugs[0];
    const lastCtx = lastSlug ? getMissionContext(lastSlug) : null;
    const nextSlug = lastCtx?.path
      ? (() => {
          const idx = lastCtx.path.missionSlugs.indexOf(lastSlug);
          const ns = lastCtx.path.missionSlugs[idx + 1];
          return ns && !completed[ns] ? ns : null;
        })()
      : null;
    return nextSlug ?? (totalDone === 0 ? "what-is-sound" : null);
  })();

  return (
    <main className="min-h-screen bg-bone pb-24">
      <header className="border-b-4 border-ink bg-electric-blue text-bone">
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-10">
          <div className="flex items-center gap-4 mb-4">
            <Image src="/cats/cat-dj-hero.png" alt="" width={64} height={64}
              className="drop-shadow-[3px_3px_0_hsl(222_47%_4%)] animate-bounce-bob" />
            <div>
              <div className="font-mono text-xs uppercase opacity-60 mb-1">// YOUR DASHBOARD</div>
              <h1 className="font-display text-5xl md:text-7xl leading-none">
                KEEP<br /><span className="text-acid">GOING.</span>
              </h1>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-4 gap-2">
            <div className="brutal-border bg-acid text-ink p-3 chunk-shadow-sm">
              <div className="font-display text-3xl tabular-nums">{progress.xp}</div>
              <div className="font-mono text-[9px] uppercase mt-1">XP</div>
            </div>
            <div className="brutal-border bg-magenta text-bone p-3 chunk-shadow-sm">
              <div className="font-display text-3xl tabular-nums">🔥{progress.streakDays}</div>
              <div className="font-mono text-[9px] uppercase mt-1">Streak</div>
            </div>
            <div className="brutal-border bg-bone text-ink p-3 chunk-shadow-sm">
              <div className="font-display text-3xl tabular-nums">{totalDone}</div>
              <div className="font-mono text-[9px] uppercase mt-1">Lessons</div>
            </div>
            <div className="brutal-border bg-bone text-ink p-3 chunk-shadow-sm">
              <div className="font-mono text-xl mt-1">{rank.emoji}</div>
              <div className="font-display text-sm leading-tight mt-1">{rank.name}</div>
            </div>
          </div>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {continueSlug && (
          <Link href={`/learn/${continueSlug}`}
            className="brutal-border bg-acid text-ink p-5 flex items-center justify-between gap-4 brutal-press chunk-shadow block hover:bg-sun transition-colors mb-3 ccd-btn-hover">
            <div>
              <div className="font-mono text-[9px] uppercase opacity-60 mb-1">CONTINUE LEARNING</div>
              <div className="font-display text-2xl">{continueSlug.replace(/-/g, " ")}</div>
            </div>
            <Image src="/cats/cat-headphones.png" alt="" width={48} height={48}
              className="drop-shadow-[2px_2px_0_hsl(222_47%_4%)] animate-bounce-bob" />
          </Link>
        )}
        <section className="mt-6">
          <div className="font-mono text-xs uppercase opacity-40 mb-3">// YOUR WORLDS</div>
          <div className="grid md:grid-cols-3 gap-3">
            {(["fundamentals", "dj", "producer"] as WorldTab[]).map(world => {
              const ws = worldStats(world, completed);
              const meta = WORLD_DATA[world];
              return (
                <Link key={world} href={meta.to}
                  className={`brutal-border ${meta.color} p-4 brutal-press block transition-opacity hover:opacity-90 chunk-shadow ccd-btn-hover`}>
                  <div className="opacity-60 mb-2">{meta.icon}</div>
                  <div className="font-display text-xl">{meta.label}</div>
                  <div className="h-2 brutal-border bg-bone/20 mt-3 overflow-hidden">
                    <div className="h-full bg-current opacity-80 transition-all duration-700" style={{ width: `${ws.pct}%` }} />
                  </div>
                  <div className="font-mono text-[9px] uppercase opacity-60 mt-1">{ws.done}/{ws.total} · {ws.pct}%</div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

// ─── Full Landing page ────────────────────────────────────────────────────────
function Landing({ onGetStarted }: { onGetStarted: () => void }) {
  const [worldTab, setWorldTab] = useState<WorldTab>("fundamentals");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const chapters = chaptersByWorld(worldTab);

  return (
    <main className="min-h-screen bg-bone overflow-x-hidden">
      <MoonwalkCat />
      <ScrollPaw />

      {/* ── HERO ── */}
      <HeroSection onGetStarted={onGetStarted} />

      {/* ── IDENTITY STRIP ── */}
      <div className="bg-ink border-b-4 border-ink py-3 px-4">
        <p className="max-w-5xl mx-auto font-display text-bone text-xs md:text-sm uppercase tracking-[0.18em] text-center">
          153 missions · 3 worlds · gamified music education · source-verified · free to start
        </p>
      </div>

      {/* ── MARQUEE 1 ── */}
      <CcdMarquee
        items={["LEARN MUSIC 🎧", "ABLETON LIVE 12", "REKORDBOX 6.0", "MUSIC THEORY", "DJ WORLD", "PRODUCER PATH", "FUNDAMENTALS", "FREE TO START 🎵"]}
        bg="bg-acid"
        textColor="text-ink"
      />

      {/* ── HOW IT WORKS ── */}
      <SectionReveal>
        <section className="bg-bone border-b-4 border-ink">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-24">
            <div className="font-mono text-xs uppercase opacity-40 mb-2 tracking-widest">// THE SYSTEM</div>
            <h2 className="font-display text-4xl md:text-6xl mb-3 drop-shadow-[3px_3px_0_hsl(84_81%_56%)]">Built Different.</h2>
            <p className="font-sans text-sm opacity-60 max-w-xl leading-relaxed mb-12">
              Not another YouTube playlist. A structured curriculum built from primary sources, with interactive sims and quizzes on every mission.
            </p>

            <div className="grid md:grid-cols-3 gap-0 brutal-border chunk-shadow">
              {[
                { num: "01", title: "Pick a World",    emoji: "🎵", accent: "bg-acid",          body: "Start with Fundamentals (sound, rhythm, melody, harmony, tech) or jump directly into DJ World or Producer." },
                { num: "02", title: "Follow the Path", emoji: "🐱", accent: "bg-electric-blue text-bone", body: "Each world has chapters. Each chapter has paths. Each path is a mission snake — complete missions in order, earn XP, unlock trophies." },
                { num: "03", title: "Earn Trophies",   emoji: "🏆", accent: "bg-acid",          body: "Path trophies → Chapter trophies → World trophies → CCD Master. Choose Flow Mode (sequential) or Free Mode (open)." },
              ].map((step, i) => (
                <div key={i} className={`p-6 md:p-8 ${i < 2 ? "brutal-border border-y-0 border-l-0" : ""}`}>
                  <div className={`brutal-border ${step.accent} w-12 h-12 flex items-center justify-center font-display text-2xl mb-4 chunk-shadow-sm`}>
                    {step.emoji}
                  </div>
                  <div className="font-mono text-[9px] uppercase opacity-40 mb-1">{step.num}</div>
                  <div className="font-display text-2xl mb-3">{step.title}</div>
                  <div className="font-sans text-sm opacity-70 leading-relaxed">{step.body}</div>
                </div>
              ))}
            </div>

            {/* Us vs them */}
            <div className="mt-10 grid md:grid-cols-2 gap-3">
              <div className="brutal-border bg-hot/10 p-5">
                <div className="font-display text-sm uppercase opacity-50 mb-3">❌ Everywhere else</div>
                <ul className="space-y-2 font-sans text-sm opacity-70">
                  {["Random YouTube videos, no structure","Ads every 2 minutes","No quizzes, no accountability","Content not from official docs","Progress tracked nowhere"].map(t => (
                    <li key={t} className="flex gap-2"><span className="text-hot shrink-0">✗</span>{t}</li>
                  ))}
                </ul>
              </div>
              <div className="brutal-border bg-acid p-5 chunk-shadow">
                <div className="font-display text-sm uppercase opacity-60 mb-3 text-ink">✓ CCD.SCHOOL</div>
                <ul className="space-y-2 font-sans text-sm text-ink">
                  {["153 missions in a structured curriculum","Zero ads, ever","Interactive quiz on every single mission","Built from official Ableton + Pioneer manuals","XP, streaks, spaced repetition, leaderboard"].map(t => (
                    <li key={t} className="flex gap-2"><span className="font-bold shrink-0">✓</span>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* ── MARQUEE 2 — reverse ── */}
      <CcdMarquee
        items={["BEATMATCHING", "CAMELOT WHEEL", "SPACED REPETITION", "XP SYSTEM", "STREAK SHIELDS", "LEADERBOARD", "BADGES", "PLACEMENT TEST"]}
        bg="bg-ink"
        textColor="text-bone"
        reverse
      />

      {/* ── THREE WORLDS ── */}
      <SectionReveal>
        <section className="bg-electric-blue text-bone border-b-4 border-ink">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-24">
            <div className="font-mono text-xs uppercase opacity-60 mb-2 tracking-widest">// THREE WORLDS</div>
            <h2 className="font-display text-4xl md:text-6xl mb-10 drop-shadow-[4px_4px_0_hsl(222_47%_4%)]">Choose Your Path.</h2>
            <div className="space-y-3">
              {(["fundamentals", "dj", "producer"] as WorldTab[]).map((world) => {
                const meta = WORLD_DATA[world];
                const paths = pathsByWorld(world);
                const totalMissions = paths.flatMap(p => p.missionSlugs).length;
                return (
                  <Link key={world} href={meta.to}
                    className={`brutal-border ${meta.color} p-5 md:p-7 flex items-start justify-between gap-4 brutal-press chunk-shadow block ccd-btn-hover`}>
                    <div>
                      <div className="mb-3 opacity-70">{meta.icon}</div>
                      <div className="font-mono text-[9px] uppercase opacity-60 mb-1">{chapters.length} CHAPTERS · {paths.length} PATHS · {totalMissions} MISSIONS</div>
                      <div className="font-display text-3xl md:text-5xl">{meta.label}</div>
                      <div className="font-sans text-sm opacity-70 mt-1">{meta.tagline}</div>
                      <div className="font-sans text-xs opacity-50 mt-2 max-w-lg leading-relaxed">{meta.detail}</div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Cat handstand decoration */}
            <div className="flex justify-center mt-12">
              <Image src="/cats/cat-handstand.png" alt="" width={120} height={120}
                className="drop-shadow-[4px_4px_0_hsl(222_47%_4%)] wiggle" />
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* ── MARQUEE 3 ── */}
      <CcdMarquee
        items={["🎵 FUNDAMENTALS", "🎧 DJ WORLD", "🎛 PRODUCER", "153 MISSIONS", "CCD MASTER", "TROPHIES", "GEM SHOP", "LEADERBOARD"]}
        bg="bg-magenta"
        textColor="text-bone"
        size="sm"
      />

      {/* ── CURRICULUM ── */}
      <SectionReveal>
        <section id="curriculum" className="bg-bone border-b-4 border-ink">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-24">
            <div className="font-mono text-xs uppercase opacity-40 mb-2 tracking-widest">// CURRICULUM</div>
            <h2 className="font-display text-4xl md:text-6xl mb-8">What You&apos;ll Learn.</h2>

            {/* World tabs */}
            <div className="brutal-border flex mb-8 chunk-shadow">
              {(["fundamentals", "dj", "producer"] as WorldTab[]).map((w) => {
                const active = worldTab === w;
                const accentMap = { fundamentals: "bg-acid text-ink", dj: "bg-ink text-bone", producer: "bg-electric-blue text-bone" };
                return (
                  <button key={w} onClick={() => setWorldTab(w)}
                    className={`flex-1 px-4 py-3 font-display text-xs uppercase brutal-press transition-colors border-r-4 border-ink last:border-r-0
                      ${active ? accentMap[w] : "bg-bone hover:bg-acid/30"}`}>
                    {WORLD_DATA[w].icon} {WORLD_DATA[w].label}
                  </button>
                );
              })}
            </div>

            {/* Chapter grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {chapters.map((ch, i) => {
                const paths = pathsByWorld(worldTab).filter(p => p.chapter === ch.slug);
                return (
                  <div key={ch.slug} className="brutal-border p-3 hover:bg-acid/20 transition-colors">
                    <div className="font-mono text-[9px] uppercase opacity-40 mb-1">CH {i + 1}</div>
                    <div className="font-display text-sm leading-tight mb-2">{ch.title}</div>
                    <div className="space-y-0.5">
                      {paths.map(path => (
                        <div key={path.slug} className="font-mono text-[8px] opacity-50 flex items-start gap-1">
                          <span className="opacity-40 mt-px shrink-0">›</span>
                          <span>{path.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stats row */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-2">
              <StatCard value="153" label="Total Missions" accent />
              <StatCard value="32"  label="Paths" />
              <StatCard value="15"  label="Chapters" />
              <StatCard value="47"  label="Interactive Sims" />
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* ── GAMIFICATION ── */}
      <SectionReveal>
        <section className="bg-ink text-bone border-b-4 border-acid">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-24">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-mono text-xs uppercase opacity-40 mb-2 tracking-widest">// GAMIFICATION</div>
                <h2 className="font-display text-4xl md:text-6xl mb-10">Built to Keep You Going.</h2>
              </div>
              <Image src="/cats/cat-raver.png" alt="" width={100} height={100}
                className="hidden md:block drop-shadow-[4px_4px_0_hsl(84_81%_56%)] wiggle shrink-0" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { icon: "⚡", title: "XP System",    body: "Earn XP on every mission. Climb 12 ranks from Bedroom Producer to CCD Master." },
                { icon: "🔥", title: "Daily Streaks", body: "Hit your daily 50 XP goal. Build streaks. Earn a Streak Shield every 7 days." },
                { icon: "♥",  title: "Hearts",        body: "Wrong answers cost a heart in Flow Mode. Run out and you wait — or spend gems." },
                { icon: "💎", title: "Gem Shop",      body: "Earn gems on completions. Spend them to refill hearts or unlock cosmetics." },
                { icon: "🏅", title: "Badges",        body: "Over 20 unique badges. One for every path, chapter, and world completed." },
                { icon: "🧠", title: "Review Queue",  body: "FSRS v4 spaced repetition brings back fading lessons exactly when you need them." },
              ].map(({ icon, title, body }) => (
                <div key={title} className="brutal-border bg-bone/5 p-4 hover:bg-acid/10 transition-colors">
                  <div className="text-2xl mb-2">{icon}</div>
                  <div className="font-display text-base mb-1">{title}</div>
                  <div className="font-sans text-xs opacity-60 leading-relaxed">{body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* ── FAQ ── */}
      <SectionReveal>
        <section className="bg-bone border-b-4 border-ink">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 md:py-24">
            <div className="font-mono text-xs uppercase opacity-40 mb-2 tracking-widest">// FAQ</div>
            <h2 className="font-display text-4xl md:text-6xl mb-8">Questions.</h2>
            <div className="brutal-border chunk-shadow">
              {FAQ.map((item, i) => (
                <div key={i} className={i < FAQ.length - 1 ? "border-b-4 border-ink" : ""}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 hover:bg-acid/20 transition-colors brutal-press">
                    <span className="font-display text-lg md:text-xl leading-tight">{item.q}</span>
                    <span className="font-display text-2xl shrink-0 mt-0.5 text-magenta">{openFaq === i ? "−" : "+"}</span>
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 font-sans text-sm opacity-70 leading-relaxed max-w-2xl animate-fade-in">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* ── FINAL CTA ── */}
      <SectionReveal>
        <section className="bg-acid text-ink border-b-4 border-ink">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-28 text-center">
            <div className="font-mono text-xs uppercase opacity-50 mb-4 tracking-widest">// NO EXCUSES</div>

            {/* DJ Cat CTA */}
            <div className="flex justify-center mb-6">
              <Image src="/cats/cat-dj-hero.png" alt="DJ Pawsworth" width={140} height={140}
                className="drop-shadow-[6px_6px_0_hsl(222_47%_4%)] animate-cat-celebrate" />
            </div>

            <h2 className="font-display text-[clamp(48px,10vw,120px)] leading-[0.85] mb-6 drop-shadow-[4px_4px_0_hsl(222_47%_4%)]">
              START<br />TODAY.
            </h2>
            <p className="font-sans text-sm md:text-base opacity-70 max-w-md mx-auto mb-10 leading-relaxed">
              Free. No account required. 153 missions waiting.
              Begin with Fundamentals — your first lesson takes 5 minutes.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={onGetStarted}
                className="brutal-border bg-ink text-bone px-8 py-5 font-display text-2xl md:text-3xl brutal-press chunk-shadow hover:bg-electric-blue transition-colors ccd-btn-hover animate-pulse-glow">
                GET STARTED FREE →
              </button>
              <Link href="/missions"
                className="brutal-border bg-transparent border-ink px-8 py-5 font-display text-2xl md:text-3xl brutal-press hover:bg-ink/10 transition-colors">
                BROWSE ALL MISSIONS
              </Link>
            </div>
            <div className="mt-8 font-mono text-[10px] uppercase opacity-40">
              No credit card · No download · Works on any device
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* ── BOTTOM MARQUEE ── */}
      <CcdMarquee
        items={["CCD.SCHOOL", "CATSCANDANCE", "LEARN.CATSCANDANCE.COM", "MUSIC EDUCATION", "DJ WORLD", "PRODUCER PATH"]}
        bg="bg-ink"
        textColor="text-bone"
        size="sm"
      />
    </main>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────
export function HomeClient() {
  const { user } = useAuth();
  const router = useRouter();
  const { progress } = useProgress();
  const [showOnboarding, setShowOnboarding] = useState(false);

  let shouldRedirect = false;
  try {
    const hasMissions = Object.keys(progress.completedMissions).length > 0;
    shouldRedirect = !!(user || hasMissions || progress.onboardingDone);
  } catch {
    shouldRedirect = false;
  }

  useEffect(() => {
    if (shouldRedirect) router.replace("/dashboard");
  }, [shouldRedirect, router]);

  if (shouldRedirect) return null;
  if (showOnboarding) return <OnboardingFlow onDone={() => setShowOnboarding(false)} />;

  return <Landing onGetStarted={() => setShowOnboarding(true)} />;
}
