"use client";
import Link from "next/link";
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
import { useState, useEffect } from "react";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { useRouter } from "next/navigation";

// ─── FAL AI generated images (v2 — higher contrast, dark backgrounds) ─────────
const IMAGES = {
  hero:         "https://v3b.fal.media/files/b/0a9d8573/t3x6Pf5Z8pjp4mqwCqgTO.jpg",
  fundamentals: "https://v3b.fal.media/files/b/0a9d8573/T1yPDNCVhxrVLWBs3vPLK.jpg",
  dj:           "https://v3b.fal.media/files/b/0a9d8573/vkzVEVke8UdYZtUAJEt5P.jpg",
  // Producer uses dark modular synth image — shown only on ink-bg cards, NOT on sun-bg
  producer:     "https://v3b.fal.media/files/b/0a9d8573/FWDTuawui9X18aCB004I0.jpg",
} as const;

const ALL_MISSIONS = [...FOUNDATIONS_MISSIONS, ...DJ_WORLD_MISSIONS, ...MISSIONS];

type WorldTab = "fundamentals" | "dj" | "producer";

const WORLD_DATA = {
  fundamentals: {
    label: "Music Foundations", icon: "🎵", color: "bg-acid text-ink",
    borderAccent: "border-l-4 border-acid",
    tagline: "Sound · Rhythm · Melody · Harmony · Music Tech",
    detail: "Everything you need to understand music before you produce or DJ. Built from learningmusic.ableton.com.",
    stat: "40 missions", to: "/world/fundamentals",
  },
  dj: {
    label: "DJ World", icon: "🎧", color: "bg-ink text-bone",
    borderAccent: "border-l-4 border-volt",
    tagline: "Setup · Library · The Mix · Performance · Mastery",
    detail: "rekordbox, beatmatching, crowd reading and career. Built from the Pioneer DJ rekordbox 6.0.0 Manual.",
    stat: "40 missions", to: "/world/dj",
  },
  producer: {
    label: "Producer", icon: "🎛", color: "bg-sun text-ink",
    borderAccent: "border-l-4 border-sun",
    tagline: "First Contact · Sound & MIDI · The Mix · Performance · Advanced",
    detail: "Ableton Live 12 from zero to expert. Built from the Ableton Live 12 Reference Manual.",
    stat: "73 missions", to: "/world/producer",
  },
} as const;

const FAQ = [
  { q: "What's the difference between Flow Mode and Free Mode?", a: "Free Mode is fully open — every mission, path and chapter is accessible from the start. Flow Mode gates content sequentially like Duolingo: you must complete each mission before the next unlocks. Wrong answers cost a heart. Run out and you wait for refills or switch back to Free Mode." },
  { q: "Do I need to start with Fundamentals?", a: "In Free Mode, no — jump in anywhere. In Flow Mode, Fundamentals is a hard prerequisite before DJ World and Producer unlock. Either way, we recommend it if you're new to music theory." },
  { q: "What are the sources for the content?", a: "Fundamentals is built from learningmusic.ableton.com. DJ World is built chapter-by-chapter from the Pioneer DJ rekordbox 6.0.0 Instruction Manual. Producer is built from the Ableton Live 12 Reference Manual. All quiz questions and explainers cite their source." },
  { q: "How long does it take to complete a world?", a: "At 30 minutes per day: Fundamentals ≈ 3–4 weeks (40 missions), DJ World ≈ 3–4 weeks (40 missions), Producer ≈ 6–8 weeks (73 missions). The full curriculum is about 4–6 months of consistent practice." },
  { q: "What are trophies for?", a: "Path trophies (bronze) for completing a path. Chapter trophies (silver) for finishing all paths in a chapter. World trophies (gold) for completing a whole world. The CCD Master trophy requires all three worlds." },
];

// ─── Stat counter card ────────────────────────────────────────────────────────
function StatCard({ value, label, accent = false }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className={`brutal-border p-4 md:p-5 ${accent ? "bg-acid text-ink" : "bg-bone text-ink"}`}>
      <div className="font-display text-3xl md:text-4xl tabular-nums leading-none">{value}</div>
      <div className="font-mono text-[10px] uppercase opacity-60 mt-1">{label}</div>
    </div>
  );
}

// ─── Feature pill ─────────────────────────────────────────────────────────────
function FeaturePill({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="brutal-border bg-bone px-3 py-2 flex items-center gap-2 text-sm">
      <span>{icon}</span>
      <span className="font-mono text-[10px] uppercase opacity-70">{text}</span>
    </div>
  );
}

// ─── Dashboard for returning users ───────────────────────────────────────────
function Dashboard() {
  const { progress, missionsNeedingReview } = useProgress();
  const { user } = useAuth();
  const router = useRouter();
  const completed = progress.completedMissions;
  const { current: rank, next: nextRank } = rankFor(progress.xp);
  const totalDone = ALL_MISSIONS.filter(m => !!completed[m.slug]).length;
  const totalMissions = ALL_MISSIONS.length;

  // Redirect to /dashboard for the full experience
  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  // Show a minimal "loading" state while redirecting
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
      <header className="brutal-border border-x-0 border-t-0 bg-ink text-bone">
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-10">
          <div className="font-mono text-[10px] uppercase opacity-40 mb-1">// YOUR DASHBOARD</div>
          <h1 className="font-display text-5xl md:text-7xl leading-none">
            KEEP<br /><span className="text-acid">GOING.</span>
          </h1>
          <div className="mt-6 grid grid-cols-4 gap-2">
            <div className="brutal-border bg-acid text-ink p-3">
              <div className="font-display text-3xl tabular-nums">{progress.xp}</div>
              <div className="font-mono text-[9px] uppercase mt-1">XP</div>
            </div>
            <div className="brutal-border bg-volt text-bone p-3">
              <div className="font-display text-3xl tabular-nums">🔥{progress.streakDays}{progress.streakShield ? "🛡" : ""}</div>
              <div className="font-mono text-[9px] uppercase mt-1">Streak</div>
            </div>
            <div className="brutal-border bg-bone text-ink p-3">
              <div className="font-display text-3xl tabular-nums">{totalDone}</div>
              <div className="font-mono text-[9px] uppercase mt-1">Lessons</div>
            </div>
            <div className="brutal-border bg-bone text-ink p-3">
              <div className="font-mono text-lg mt-1">{rank.emoji}</div>
              <div className="font-display text-sm leading-tight mt-1">{rank.name}</div>
            </div>
          </div>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {continueSlug ? (
          <Link href={`/learn/${continueSlug}`}
            className="brutal-border bg-acid text-ink p-5 flex items-center justify-between gap-4 brutal-press brutal-shadow block hover:bg-sun transition-colors">
            <div>
              <div className="font-mono text-[9px] uppercase opacity-60 mb-1">CONTINUE LEARNING</div>
              <div className="font-display text-2xl">{continueSlug.replace(/-/g, " ")}</div>
            </div>
            <Link
              href={`/learn/${missionsNeedingReview[0]}?review=1`}
              className="brutal-border bg-hot text-bone p-5 flex items-start justify-between gap-4 brutal-press block">
              <div>
                <div className="font-display text-xl">🔥 REVIEW SESSION</div>
                <div className="font-mono text-xs opacity-80 mt-1">
                  {missionsNeedingReview.length} lesson{missionsNeedingReview.length > 1 ? "s" : ""} need a refresh
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {missionsNeedingReview.slice(0, 3).map(slug => (
                    <span key={slug} className="brutal-border bg-bone/20 px-2 py-0.5 font-mono text-[9px] uppercase">
                      {slug.replace(/-/g, " ")}
                    </span>
                  ))}
                  {missionsNeedingReview.length > 3 && (
                    <span className="font-mono text-[9px] opacity-60">+{missionsNeedingReview.length - 3} more</span>
                  )}
                </div>
              </div>
              <div className="font-display text-4xl shrink-0">↺</div>
            </Link>
          </section>
        )}

        {/* ── WORLDS PROGRESS ── */}
        <section>
          <div className="font-mono text-[10px] uppercase opacity-40 mb-3">// YOUR WORLDS</div>
          <div className="grid md:grid-cols-3 gap-3">
            {(["fundamentals", "dj", "producer"] as WorldTab[]).map(world => {
              const ws = worldStats(world);
              const meta = WORLD_DATA[world];
              return (
                <Link key={world} href={meta.to}
                  className={`brutal-border ${meta.color} p-4 brutal-press block transition-opacity hover:opacity-90 relative overflow-hidden`}>
                  {/* Image only on dark-bg cards — producer (sun/yellow) stays clean for text legibility */}
                  {world !== "producer" && (
                    <div className="absolute inset-0 pointer-events-none">
                      <Image
                        src={IMAGES[world]}
                        alt=""
                        fill
                        className="object-cover opacity-10 mix-blend-multiply"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="relative z-10">
                    <div className="opacity-60 mb-2">{meta.icon}</div>
                    <div className="font-display text-xl">{meta.label}</div>
                    <div className="h-1.5 brutal-border bg-bone/20 mt-3 overflow-hidden">
                      <div className="h-full bg-current opacity-80 transition-all duration-700"
                        style={{ width: `${ws.pct}%` }} />
                    </div>
                    <div className="font-mono text-[9px] uppercase opacity-60 mt-1">
                      {ws.done}/{ws.total} · {ws.pct}%
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── QUICK LINKS ── */}
        <section>
          <div className="font-mono text-[10px] uppercase opacity-40 mb-3">// QUICK ACCESS</div>
          <div className="flex flex-wrap gap-2">
            {[
              { to: "/world/fundamentals", label: "🎵 Fundamentals Path" },
              { to: "/world/dj",           label: "🎧 DJ World Path" },
              { to: "/world/producer",     label: "🎛 Producer Path" },
              { to: "/shop",               label: "💎 Gem Shop" },
              { to: "/leaderboard",        label: "🏆 Leaderboard" },
              { to: "/profile",            label: "👤 Profile & Trophies" },
              { to: "/placement",          label: "📍 Placement Test" },
            ].map(({ to, label }) => (
              <Link key={to} href={to}
                className="brutal-border px-3 py-2 font-mono text-xs uppercase brutal-press hover:bg-sun transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}

// ─── World-class Landing page ─────────────────────────────────────────────────
function Landing({ onGetStarted }: { onGetStarted: () => void }) {
  const [worldTab, setWorldTab] = useState<WorldTab>("fundamentals");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const chapters = chaptersByWorld(worldTab);

  return (
    <main className="min-h-screen bg-bone overflow-x-hidden">

      {/* ═══════════════════════════════════════════════════════════════════
          HERO — Full-bleed, cinematic, brutalist
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[100svh] flex flex-col bg-ink text-bone overflow-hidden">

        {/* Background image */}
        <div className={`absolute inset-0 transition-opacity duration-700 ${heroLoaded ? "opacity-100" : "opacity-0"}`}>
          <Image
            src={IMAGES.hero}
            alt=""
            fill
            priority
            className="object-cover opacity-25 mix-blend-luminosity"
            sizes="100vw"
            onLoad={() => setHeroLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/50 via-ink/30 to-ink/90" />
        </div>

        {/* Dot-grid texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{ backgroundImage: "radial-gradient(oklch(1 0 0) 1px, transparent 1px)", backgroundSize: "4px 4px" }} />

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-8">

          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-6">
            <span className="brutal-border bg-acid text-ink px-3 py-1 font-mono text-[10px] uppercase tracking-widest font-bold">
              FREE TO START
            </span>
            <span className="font-mono text-[10px] uppercase opacity-40 tracking-widest">153 missions · 3 worlds</span>
          </div>

          {/* Main headline */}
          <h1 className="font-display leading-[0.82] tracking-tight">
            <span className="block text-[clamp(56px,13vw,148px)]">LEARN</span>
            <span className="block text-[clamp(56px,13vw,148px)]">MUSIC.</span>
            <span className="block text-[clamp(56px,13vw,148px)] text-acid">PROPERLY.</span>
          </h1>

          {/* Sub-headline */}
          <p className="font-mono text-sm md:text-base opacity-60 leading-relaxed max-w-lg mt-6 md:mt-8">
            The most structured music education on the internet.
            Built from real manuals — Ableton Live 12, rekordbox 6.0 and learningmusic.ableton.com.
            Gamified. Source-verified. Brutally effective.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mt-8 md:mt-10">
            <button
              onClick={onGetStarted}
              className="brutal-border bg-acid text-ink px-7 py-4 font-display text-xl md:text-2xl brutal-press brutal-shadow hover:bg-sun transition-colors"
            >
              GET STARTED FREE →
            </button>
            <a
              href="#curriculum"
              className="brutal-border bg-transparent border-bone/30 text-bone px-7 py-4 font-display text-xl md:text-2xl brutal-press hover:bg-bone/10 transition-colors"
            >
              SEE CURRICULUM ↓
            </a>
          </div>

          {/* Social-proof pills */}
          <div className="flex flex-wrap gap-2 mt-8">
            <FeaturePill icon="🎓" text="153 structured missions" />
            <FeaturePill icon="🎧" text="47 interactive sims" />
            <FeaturePill icon="🔊" text="Audio-first learning" />
            <FeaturePill icon="🏆" text="XP · Streaks · Badges" />
            <FeaturePill icon="📱" text="Works offline (PWA)" />
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative z-10 brutal-border border-x-0 border-b-0 grid grid-cols-4">
          {[
            { v: "153", l: "Missions" },
            { v: "3",   l: "Worlds" },
            { v: "47",  l: "Live Sims" },
            { v: "0",   l: "Ads. Ever." },
          ].map(({ v, l }) => (
            <div key={l} className="py-4 px-2 text-center brutal-border border-y-0 border-l-0 last:border-r-0">
              <div className="font-display text-2xl md:text-3xl text-acid">{v}</div>
              <div className="font-mono text-[9px] uppercase opacity-50 mt-0.5">{l}</div>
            </div>
          ))}
        </div>

        {/* Scroll marquee */}
        <div className="relative z-10 brutal-border border-x-0 border-b-0 overflow-hidden py-2">
          <div className="flex whitespace-nowrap animate-marquee font-mono text-[9px] uppercase opacity-30">
            {Array.from({ length: 5 }).flatMap(() =>
              ["153 MISSIONS","·","ABLETON LIVE 12","·","REKORDBOX 6.0","·","MUSIC THEORY","·",
               "BEAT GRIDS","·","CAMELOT WHEEL","·","SPACED REPETITION","·","FREE TO START","·"]
            ).map((t, i) => <span key={i} className="px-4">{t}</span>)}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          HOW IT WORKS — 3-step visual
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-bone brutal-border border-x-0 border-b-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="font-mono text-[10px] uppercase opacity-40 mb-2 tracking-widest">// THE SYSTEM</div>
          <h2 className="font-display text-4xl md:text-6xl mb-3">Built Different.</h2>
          <p className="font-mono text-sm opacity-60 max-w-xl leading-relaxed mb-12">
            Not another YouTube playlist. Not random blog posts. A structured curriculum built from primary sources, with interactive sims and quizzes on every mission.
          </p>

          <div className="grid md:grid-cols-3 gap-0 brutal-border">
            {[{ icon: <WaveIcon />, num: "01", title: "Pick a World", body: "Start with Fundamentals (sound, rhythm, melody, harmony, tech) or jump directly into DJ World or Producer if you already have the basics." }, { icon: <SnakeIcon />, num: "02", title: "Follow the Path", body: "Each world has chapters. Each chapter has paths. Each path is a mission snake — complete missions in order, earn XP, unlock trophies." }, { icon: <TrophyIcon />, num: "03", title: "Earn Trophies", body: "Path trophies → Chapter trophies → World trophies → CCD Master. Choose Flow Mode (sequential, like Duolingo) or Free Mode (everything open, your pace)." }].map((step, i) => (
              <div key={i} className={`p-6 md:p-8 ${i < 2 ? "brutal-border border-y-0 border-l-0" : ""}`}>
                <div className={`brutal-border ${step.accent} text-ink w-10 h-10 flex items-center justify-center font-display text-xl mb-4`}>
                  {step.emoji}
                </div>
                <div className="font-mono text-[9px] uppercase opacity-40 mb-1">{step.num}</div>
                <div className="font-display text-2xl mb-3">{step.title}</div>
                <div className="font-mono text-sm opacity-70 leading-relaxed">{step.body}</div>
              </div>
            ))}
          </div>

          {/* Comparison block: us vs others */}
          <div className="mt-10 grid md:grid-cols-2 gap-3">
            <div className="brutal-border bg-hot/10 p-5">
              <div className="font-mono text-[10px] uppercase opacity-50 mb-3 font-bold">❌ Everywhere else</div>
              <ul className="space-y-2 font-mono text-sm opacity-70">
                {["Random YouTube videos, no structure","Ads every 2 minutes","No quizzes, no accountability","Content not sourced from official docs","Progress tracked nowhere"].map(t => (
                  <li key={t} className="flex gap-2"><span className="text-hot shrink-0">✗</span>{t}</li>
                ))}
              </ul>
            </div>
            <div className="brutal-border bg-acid p-5">
              <div className="font-mono text-[10px] uppercase opacity-50 mb-3 font-bold text-ink">✓ CCD.SCHOOL</div>
              <ul className="space-y-2 font-mono text-sm text-ink">
                {["153 missions in a structured curriculum","Zero ads, ever","Interactive quiz on every single mission","Built from official Ableton + Pioneer manuals","XP, streaks, spaced repetition, leaderboard"].map(t => (
                  <li key={t} className="flex gap-2"><span className="font-bold shrink-0">✓</span>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          THREE WORLDS
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-ink text-bone brutal-border border-x-0 border-b-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="font-mono text-[10px] uppercase opacity-40 mb-2 tracking-widest">// THREE WORLDS</div>
          <h2 className="font-display text-4xl md:text-6xl mb-10">Choose Your Path.</h2>

          <div className="space-y-3">
            {(["fundamentals", "dj", "producer"] as WorldTab[]).map((world) => {
              const meta = WORLD_DATA[world];
              const paths = pathsByWorld(world);
              const totalMissions = paths.flatMap(p => p.missionSlugs).length;
              return (
                <Link key={world} href={meta.to} className={`brutal-border ${meta.color} p-5 md:p-7 flex items-start justify-between gap-4 brutal-press brutal-shadow block relative overflow-hidden`}>
                  {/* Image only on dark-bg cards — producer (sun/yellow) stays clean for legibility */}
                  {world !== "producer" && (
                    <div className="absolute inset-0 pointer-events-none">
                      <Image
                        src={IMAGES[world]}
                        alt=""
                        fill
                        className="object-cover opacity-15 mix-blend-multiply"
                        sizes="(max-width: 768px) 100vw, 80vw"
                      />
                    </div>
                  )}
                  <div className="relative z-10">
                    <div className="mb-3 opacity-70">{meta.icon}</div>
                    <div className="font-mono text-[9px] uppercase opacity-60 mb-1">{chs.length} CHAPTERS · {paths.length} PATHS · {totalMissions} MISSIONS</div>
                    <div className="font-display text-3xl md:text-5xl">{meta.label}</div>
                    <div className="font-mono text-sm opacity-70 mt-1">{meta.tagline}</div>
                    <div className="font-mono text-xs opacity-50 mt-2 max-w-lg leading-relaxed">{meta.detail}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CURRICULUM DEEP-DIVE
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="curriculum" className="bg-bone brutal-border border-x-0 border-b-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="font-mono text-[10px] uppercase opacity-40 mb-2 tracking-widest">// CURRICULUM</div>
          <h2 className="font-display text-4xl md:text-6xl mb-8">What You&apos;ll Learn.</h2>

          {/* World tabs */}
          <div className="brutal-border flex mb-8">
            {(["fundamentals", "dj", "producer"] as WorldTab[]).map((w) => {
              const active = worldTab === w;
              const accentMap = { fundamentals: "bg-acid text-ink", dj: "bg-volt text-bone", producer: "bg-sun text-ink" };
              return (
                <button key={w} onClick={() => setWorldTab(w)}
                  className={`flex-1 px-4 py-3 font-mono text-[10px] uppercase brutal-press transition-colors
                    ${active ? accentMap[w] : "bg-bone hover:bg-sun/30"}`}>
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
                <div key={ch.slug} className="brutal-border p-3 hover:bg-sun/20 transition-colors">
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
            <StatCard value="32" label="Paths" />
            <StatCard value="15" label="Chapters" />
            <StatCard value="47" label="Interactive Sims" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          GAMIFICATION — what makes it addictive
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-ink text-bone brutal-border border-x-0 border-b-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="font-mono text-[10px] uppercase opacity-40 mb-2 tracking-widest">// GAMIFICATION</div>
          <h2 className="font-display text-4xl md:text-6xl mb-10">Built to Keep You Going.</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { icon: "⚡", title: "XP System",     body: "Earn XP on every mission. Climb 12 ranks from Bedroom Producer to CCD Master." },
              { icon: "🔥", title: "Daily Streaks",  body: "Hit your daily 50 XP goal. Build streaks. Earn a Streak Shield every 7 days." },
              { icon: "♥",  title: "Hearts",         body: "Wrong answers cost a heart in Path Mode. Run out and you wait — or spend gems." },
              { icon: "💎", title: "Gem Shop",       body: "Earn gems on completions. Spend them to refill hearts or unlock cosmetics." },
              { icon: "🏅", title: "Badges",         body: "Over 20 unique badges. One for every path, chapter, and world completed." },
              { icon: "🧠", title: "Review Queue",   body: "FSRS v4 spaced repetition brings back fading lessons exactly when you need them." },
            ].map(({ icon, title, body }) => (
              <div key={title} className="brutal-border bg-bone/5 p-4 hover:bg-bone/10 transition-colors">
                <div className="text-2xl mb-2">{icon}</div>
                <div className="font-display text-base mb-1">{title}</div>
                <div className="font-mono text-[11px] opacity-60 leading-relaxed">{body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FAQ
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-bone brutal-border border-x-0 border-b-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="font-mono text-[10px] uppercase opacity-40 mb-2 tracking-widest">// FAQ</div>
          <h2 className="font-display text-4xl md:text-6xl mb-8">Questions.</h2>
          <div className="brutal-border">
            {FAQ.map((item, i) => (
              <div key={i} className={i < FAQ.length - 1 ? "brutal-border border-x-0 border-t-0" : ""}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 hover:bg-sun/20 transition-colors brutal-press"
                >
                  <span className="font-display text-lg md:text-xl leading-tight">{item.q}</span>
                  <span className="font-display text-2xl shrink-0 mt-0.5 text-acid">{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 font-mono text-sm opacity-70 leading-relaxed max-w-2xl animate-fade-in">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CTA — Final push
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-acid text-ink brutal-border border-x-0 border-b-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-28 text-center">
          <div className="font-mono text-[10px] uppercase opacity-50 mb-4 tracking-widest">// NO EXCUSES</div>
          <h2 className="font-display text-[clamp(48px,10vw,120px)] leading-[0.85] mb-6">
            START<br />TODAY.
          </h2>
          <p className="font-mono text-sm md:text-base opacity-70 max-w-md mx-auto mb-10 leading-relaxed">
            Free. No account required. 153 missions waiting.
            Begin with Fundamentals — your first lesson takes 5 minutes.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={onGetStarted}
              className="brutal-border bg-ink text-bone px-8 py-5 font-display text-2xl md:text-3xl brutal-press brutal-shadow hover:bg-volt transition-colors"
            >
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
    </main>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────
export function HomeClient() {
  const { user } = useAuth();
  const router = useRouter();
  const { progress } = useProgress();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Guard against localStorage being unavailable (e.g. private browsing).
  // If reading completedMissions or onboardingDone throws, default to false
  // so the landing page is shown rather than redirecting.
  let shouldRedirect = false;
  try {
    const hasMissions = Object.keys(progress.completedMissions).length > 0;
    shouldRedirect = !!(user || hasMissions || progress.onboardingDone);
  } catch {
    shouldRedirect = false;
  }

  // Redirect returning users to /dashboard before first paint
  useEffect(() => {
    if (shouldRedirect) {
      router.replace("/dashboard");
    }
  }, [shouldRedirect, router]);

  // Prevent flash: return null while redirecting
  if (shouldRedirect) return null;

  if (showOnboarding) {
    return <OnboardingFlow onDone={() => setShowOnboarding(false)} />;
  }

  // Brand-new user with no history → show the Landing page first.
  // Clicking GET STARTED triggers the OnboardingFlow.
  return <Landing onGetStarted={() => setShowOnboarding(true)} />;
}
