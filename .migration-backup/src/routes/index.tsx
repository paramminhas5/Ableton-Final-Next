import { createFileRoute, Link } from "@tanstack/react-router";
import { useProgress } from "@/lib/progress";
import { useAuth } from "@/lib/auth";
import { MISSIONS } from "@/content/missions";
import { FOUNDATIONS_MISSIONS } from "@/content/missions-foundations";
import { DJ_WORLD_MISSIONS } from "@/content/missions-dj";
import { chaptersByWorld } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";
import { getMissionContext } from "@/lib/missionContext";
import { rankFor } from "@/lib/ranks";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CCD.SCHOOL — Learn Music Production & DJing" },
      { name: "description", content: "The most structured music education on the internet. Fundamentals → DJ World → Producer. 153 missions. Real sources." },
    ],
  }),
  component: Home,
});

const ALL_MISSIONS = [...FOUNDATIONS_MISSIONS, ...DJ_WORLD_MISSIONS, ...MISSIONS];

// ── SVG icons (no emoji) ──────────────────────────────────────────────────────
const WaveIcon = () => (
  <svg viewBox="0 0 40 24" className="w-10 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M2 12 Q8 2 14 12 Q20 22 26 12 Q32 2 38 12" />
  </svg>
);
const VinylIcon = () => (
  <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="20" cy="20" r="17" />
    <circle cx="20" cy="20" r="5" />
    <circle cx="20" cy="20" r="1.5" fill="currentColor" />
    <path d="M20 3 Q28 10 37 20" strokeDasharray="4 3" />
  </svg>
);
const FaderIcon = () => (
  <svg viewBox="0 0 40 32" className="w-10 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="8" y1="4" x2="8" y2="28" />
    <line x1="20" y1="4" x2="20" y2="28" />
    <line x1="32" y1="4" x2="32" y2="28" />
    <rect x="4" y="8" width="8" height="5" rx="0" fill="currentColor" stroke="currentColor" />
    <rect x="16" y="16" width="8" height="5" rx="0" fill="currentColor" stroke="currentColor" />
    <rect x="28" y="10" width="8" height="5" rx="0" fill="currentColor" stroke="currentColor" />
  </svg>
);
const TrophyIcon = () => (
  <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4h20v10a10 10 0 01-20 0V4z" />
    <path d="M6 8H2v4a4 4 0 004 4M26 8h4v4a4 4 0 01-4 4" />
    <line x1="16" y1="24" x2="16" y2="28" />
    <line x1="10" y1="28" x2="22" y2="28" />
  </svg>
);
const SnakeIcon = () => (
  <svg viewBox="0 0 48 20" className="w-12 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="4" cy="10" r="3" fill="currentColor" />
    <line x1="7" y1="10" x2="13" y2="10" />
    <circle cx="16" cy="10" r="3" fill="currentColor" />
    <line x1="19" y1="10" x2="25" y2="10" strokeDasharray="2 2" />
    <circle cx="28" cy="10" r="3" strokeDasharray="none" />
    <line x1="31" y1="10" x2="37" y2="10" strokeDasharray="2 2" />
    <circle cx="40" cy="10" r="3" opacity="0.3" />
  </svg>
);

type WorldTab = "fundamentals" | "dj" | "producer";

const WORLD_DATA = {
  fundamentals: {
    label: "Fundamentals", icon: <WaveIcon />, color: "bg-acid text-ink", accent: "bg-acid",
    tagline: "Sound · Rhythm · Melody · Harmony · Music Tech",
    detail: "Everything you need to understand music before you produce or DJ. Built from learningmusic.ableton.com.",
    to: "/world/fundamentals",
  },
  dj: {
    label: "DJ World", icon: <VinylIcon />, color: "bg-ink text-bone", accent: "bg-volt",
    tagline: "Setup · Library · The Mix · Performance · Mastery",
    detail: "rekordbox, beatmatching, crowd reading and career. Built from the Pioneer DJ rekordbox 6.0.0 Manual.",
    to: "/world/dj",
  },
  producer: {
    label: "Producer", icon: <FaderIcon />, color: "bg-sun text-ink", accent: "bg-sun",
    tagline: "First Contact · Sound & MIDI · The Mix · Performance · Advanced",
    detail: "Ableton Live 12 from zero to expert. Built from the Ableton Live 12 Reference Manual.",
    to: "/world/producer",
  },
} as const;

const FAQ = [
  { q: "What's the difference between Classic and CCD mode?", a: "Classic mode is fully open — every mission, path and chapter is accessible from the start. CCD mode gates content serially like Duolingo: you must complete each mission before the next unlocks. Wrong answers cost a heart. Run out and you wait for refills or switch back to Classic." },
  { q: "Do I need to start with Fundamentals?", a: "In Classic mode, no — jump in anywhere. In CCD mode, Fundamentals is a hard prerequisite before DJ World and Producer unlock. Either way, we recommend it if you're new to music theory." },
  { q: "What are the sources for the content?", a: "Fundamentals is built from learningmusic.ableton.com. DJ World is built chapter-by-chapter from the Pioneer DJ rekordbox 6.0.0 Instruction Manual. Producer is built from the Ableton Live 12 Reference Manual. All quiz questions and explainers cite their source." },
  { q: "How long does it take to complete a world?", a: "At 30 minutes per day: Fundamentals ≈ 3–4 weeks (40 missions), DJ World ≈ 3–4 weeks (40 missions), Producer ≈ 6–8 weeks (73 missions). The full curriculum is about 4–6 months of consistent practice." },
  { q: "What are trophies for?", a: "Path trophies (bronze) for completing a path. Chapter trophies (silver) for finishing all paths in a chapter. World trophies (gold) for completing a whole world. The CCD Master trophy requires all three worlds." },
];

// ── LOGGED-IN DASHBOARD ───────────────────────────────────────────────────────
function Dashboard() {
  const { progress } = useProgress();
  const completed = progress.completedMissions;
  const { current: rank } = rankFor(progress.xp);

  const totalDone = ALL_MISSIONS.filter((m) => !!completed[m.slug]).length;
  const totalMissions = ALL_MISSIONS.length;

  // Find last completed mission to suggest "continue"
  const allDoneSlugs = Object.keys(completed).filter((s) => completed[s]);
  const lastSlug = allDoneSlugs[allDoneSlugs.length - 1];
  const lastCtx = lastSlug ? getMissionContext(lastSlug) : null;
  
  // Find next mission in the same path
  const nextMission = lastCtx?.path
    ? (() => {
        const idx = lastCtx.path.missionSlugs.indexOf(lastSlug);
        const nextSlug = lastCtx.path.missionSlugs[idx + 1];
        return nextSlug && !completed[nextSlug] ? nextSlug : null;
      })()
    : null;

  const worldStats = (world: WorldTab) => {
    const paths = pathsByWorld(world);
    const slugs = paths.flatMap((p) => p.missionSlugs);
    const done = slugs.filter((s) => !!completed[s]).length;
    return { done, total: slugs.length, pct: Math.round((done / slugs.length) * 100) };
  };

  return (
    <main className="min-h-screen bg-bone">
      {/* Dashboard hero */}
      <header className="brutal-border border-x-0 border-t-0 bg-ink text-bone">
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
          <div className="font-mono text-[10px] uppercase opacity-40 mb-1">// CCD.SCHOOL DASHBOARD</div>
          <h1 className="font-display text-5xl md:text-7xl leading-none">
            KEEP<br /><span className="text-acid">GOING.</span>
          </h1>
          <div className="mt-6 grid grid-cols-3 md:grid-cols-4 gap-3">
            <div className="brutal-border bg-acid text-ink p-3">
              <div className="font-display text-4xl">{progress.xp}</div>
              <div className="font-mono text-[9px] uppercase mt-1">XP</div>
            </div>
            <div className="brutal-border bg-volt text-bone p-3">
              <div className="font-display text-4xl">{progress.streakDays}</div>
              <div className="font-mono text-[9px] uppercase mt-1">Streak 🔥</div>
            </div>
            <div className="brutal-border p-3">
              <div className="font-display text-4xl">{totalDone}</div>
              <div className="font-mono text-[9px] uppercase mt-1">Missions</div>
            </div>
            <div className="brutal-border p-3 hidden md:block">
              <div className="font-display text-2xl leading-tight">{rank.name}</div>
              <div className="font-mono text-[9px] uppercase mt-1">Rank</div>
            </div>
          </div>
          <div className="mt-4 h-2 brutal-border overflow-hidden bg-bone/10">
            <div className="h-full bg-acid transition-all duration-700" style={{ width: `${Math.round((totalDone / totalMissions) * 100)}%` }} />
          </div>
          <div className="font-mono text-[9px] uppercase opacity-50 mt-1">{totalDone}/{totalMissions} missions complete</div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-10 pb-24">
        {/* Continue */}
        {(nextMission || lastCtx?.path) && (
          <section>
            <div className="font-mono text-[10px] uppercase opacity-40 mb-3">// CONTINUE</div>
            <Link
              to="/mission/$slug"
              params={{ slug: nextMission ?? lastSlug }}
              className="brutal-border bg-acid text-ink p-5 flex items-start justify-between gap-4 brutal-press brutal-shadow block"
            >
              <div>
                <div className="font-mono text-[9px] uppercase opacity-60">
                  {lastCtx?.world?.toUpperCase()} › {lastCtx?.chapter?.title} › {lastCtx?.path?.title}
                </div>
                <div className="font-display text-2xl mt-1">
                  {nextMission ? `Next: Mission →` : `Review: ${lastSlug.replace(/-/g, " ")}`}
                </div>
                <div className="font-mono text-xs opacity-70 mt-1">
                  {nextMission ? nextMission.replace(/-/g, " ") : "You finished this path"}
                </div>
              </div>
              <div className="font-display text-3xl shrink-0">→</div>
            </Link>
          </section>
        )}

        {/* World progress */}
        <section>
          <div className="font-mono text-[10px] uppercase opacity-40 mb-3">// YOUR WORLDS</div>
          <div className="grid md:grid-cols-3 gap-3">
            {(["fundamentals", "dj", "producer"] as WorldTab[]).map((world) => {
              const ws = worldStats(world);
              const meta = WORLD_DATA[world];
              return (
                <Link key={world} to={meta.to} className={`brutal-border ${meta.color} p-4 brutal-press block`}>
                  <div className="opacity-60 mb-2">{meta.icon}</div>
                  <div className="font-display text-xl">{meta.label}</div>
                  <div className="h-1.5 brutal-border bg-bone/20 mt-3 overflow-hidden">
                    <div className="h-full bg-current opacity-80 transition-all" style={{ width: `${ws.pct}%` }} />
                  </div>
                  <div className="font-mono text-[9px] uppercase opacity-60 mt-1">{ws.done}/{ws.total} · {ws.pct}%</div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Quick access */}
        <section>
          <div className="font-mono text-[10px] uppercase opacity-40 mb-3">// QUICK ACCESS</div>
          <div className="flex flex-wrap gap-2">
            {[
              { to: "/worlds", label: "All Worlds" },
              { to: "/learn", label: "All Paths" },
              { to: "/missions", label: "All Missions" },
              { to: "/profile", label: "Trophies & Profile" },
              { to: "/devices", label: "Devices" },
            ].map(({ to, label }) => (
              <Link key={to} to={to} className="brutal-border px-4 py-2 font-mono text-xs uppercase brutal-press hover:bg-sun">
                {label} →
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

// ── LANDING PAGE ──────────────────────────────────────────────────────────────
function Landing() {
  const [worldTab, setWorldTab] = useState<WorldTab>("fundamentals");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const chapters = chaptersByWorld(worldTab);

  return (
    <main className="min-h-screen bg-bone">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="brutal-border border-x-0 border-t-0 bg-ink text-bone min-h-[90vh] flex flex-col justify-between relative overflow-hidden">
        {/* grain texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(oklch(1 0 0) 1px, transparent 1px)", backgroundSize: "4px 4px" }} />

        <div className="max-w-5xl mx-auto px-4 pt-12 md:pt-20 relative z-10">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-40 mb-4">
            // CCD.SCHOOL · MUSIC EDUCATION · NO FLUFF
          </div>
          <h1 className="font-display leading-[0.85] text-[min(18vw,160px)]">
            LEARN<br />
            MUSIC.<br />
            <span className="text-acid">BRUTALLY.</span>
          </h1>
          <p className="font-mono text-sm md:text-base opacity-60 leading-relaxed max-w-xl mt-6">
            The most structured music education on the internet. 
            153 missions across 3 worlds — Fundamentals, DJ and Producer. 
            Every concept sourced from real manuals.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link to="/world/fundamentals"
              className="brutal-border bg-acid text-ink px-6 py-3 font-display text-xl brutal-press brutal-shadow">
              START LEARNING →
            </Link>
            <a href="#how-it-works"
              className="brutal-border bg-transparent text-bone px-6 py-3 font-display text-xl brutal-press hover:bg-bone/10">
              HOW IT WORKS ↓
            </a>
          </div>
        </div>

        {/* Stats marquee bar */}
        <div className="brutal-border border-x-0 border-b-0 mt-16 overflow-hidden">
          <div className="flex whitespace-nowrap animate-[marquee_20s_linear_infinite] font-mono text-[10px] uppercase opacity-40 py-2">
            {Array.from({ length: 4 }).flatMap(() => [
              "153 MISSIONS", "·", "15 CHAPTERS", "·", "32 PATHS", "·",
              "FUNDAMENTALS", "·", "DJ WORLD", "·", "PRODUCER", "·",
              "rekordbox 6.0", "·", "Ableton Live 12", "·", "Camelot Wheel", "·",
              "Beat Grids", "·", "PRO DJ LINK", "·", "MIDI 2.0", "·",
            ]).map((t, i) => <span key={i} className="px-4">{t}</span>)}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="brutal-border border-x-0 border-b-0 bg-bone">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <div className="font-mono text-[10px] uppercase opacity-40 mb-2">// THE SYSTEM</div>
          <h2 className="font-display text-4xl md:text-6xl mb-12">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-0 brutal-border">
            {[
              {
                icon: <WaveIcon />, num: "01", title: "Pick a World",
                body: "Start with Fundamentals (sound, rhythm, melody, harmony, tech) or jump directly into DJ World or Producer if you already have the basics.",
              },
              {
                icon: <SnakeIcon />, num: "02", title: "Follow the Path",
                body: "Each world has chapters. Each chapter has paths. Each path is a mission snake — complete missions in order, earn XP, unlock trophies.",
              },
              {
                icon: <TrophyIcon />, num: "03", title: "Earn Trophies",
                body: "Path trophies → Chapter trophies → World trophies → CCD Master. Choose Classic (everything open) or CCD mode (strict serial gating like Duolingo).",
              },
            ].map((step, i) => (
              <div key={i} className={`p-6 md:p-8 ${i < 2 ? "brutal-border border-y-0 border-l-0" : ""}`}>
                <div className="opacity-40 mb-4">{step.icon}</div>
                <div className="font-mono text-[9px] uppercase opacity-40 mb-1">{step.num}</div>
                <div className="font-display text-2xl mb-3">{step.title}</div>
                <div className="font-mono text-sm opacity-70 leading-relaxed">{step.body}</div>
              </div>
            ))}
          </div>

          {/* Hierarchy visual */}
          <div className="mt-10 brutal-border p-5 bg-ink text-bone">
            <div className="font-mono text-[9px] uppercase opacity-50 mb-3">THE HIERARCHY</div>
            <div className="flex flex-wrap items-center gap-2 font-display text-lg md:text-2xl">
              {["World", "→", "Chapter", "→", "Path", "→", "Mission", "→", "Quiz", "→", "Trophy"].map((t, i) => (
                <span key={i} className={t === "→" ? "opacity-30" : t === "Trophy" ? "text-acid" : ""}>{t}</span>
              ))}
            </div>
            <div className="font-mono text-[9px] opacity-40 mt-2">
              3 worlds · 15 chapters · 32 paths · 153 missions · quiz on every mission · trophy for every path
            </div>
          </div>
        </div>
      </section>

      {/* ── CHOOSE YOUR WORLD ────────────────────────────────────────────── */}
      <section className="brutal-border border-x-0 border-b-0 bg-bone">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <div className="font-mono text-[10px] uppercase opacity-40 mb-2">// THREE WORLDS</div>
          <h2 className="font-display text-4xl md:text-6xl mb-8">Choose Your World</h2>

          <div className="space-y-3">
            {(["fundamentals", "dj", "producer"] as WorldTab[]).map((world) => {
              const meta = WORLD_DATA[world];
              const chs = chaptersByWorld(world);
              const paths = pathsByWorld(world);
              const totalMissions = paths.flatMap((p) => p.missionSlugs).length;
              return (
                <Link key={world} to={meta.to}
                  className={`brutal-border ${meta.color} p-5 md:p-7 flex items-start justify-between gap-4 brutal-press brutal-shadow block`}>
                  <div>
                    <div className="mb-3 opacity-70">{meta.icon}</div>
                    <div className="font-mono text-[9px] uppercase opacity-60 mb-1">
                      {chs.length} CHAPTERS · {paths.length} PATHS · {totalMissions} MISSIONS
                    </div>
                    <div className="font-display text-3xl md:text-5xl">{meta.label}</div>
                    <div className="font-mono text-sm opacity-70 mt-1">{meta.tagline}</div>
                    <div className="font-mono text-xs opacity-50 mt-2 max-w-lg leading-relaxed">{meta.detail}</div>
                  </div>
                  <div className="font-display text-4xl shrink-0 opacity-60">→</div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── WHAT YOU'LL LEARN ────────────────────────────────────────────── */}
      <section className="brutal-border border-x-0 border-b-0 bg-ink text-bone">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <div className="font-mono text-[10px] uppercase opacity-40 mb-2">// CURRICULUM</div>
          <h2 className="font-display text-4xl md:text-6xl mb-8">What You'll Learn</h2>

          {/* World tabs */}
          <div className="flex gap-0 mb-8 brutal-border">
            {(["fundamentals", "dj", "producer"] as WorldTab[]).map((w) => {
              const meta = WORLD_DATA[w];
              return (
                <button key={w} onClick={() => setWorldTab(w)}
                  className={`flex-1 px-4 py-3 font-mono text-[10px] uppercase brutal-press transition-colors ${
                    worldTab === w ? (w === "dj" ? "bg-volt text-bone" : w === "producer" ? "bg-sun text-ink" : "bg-acid text-ink") : "bg-bone/5 text-bone hover:bg-bone/10"
                  }`}>
                  {meta.label}
                </button>
              );
            })}
          </div>

          {/* Chapter grid */}
          <div className="grid md:grid-cols-5 gap-2">
            {chapters.map((ch, i) => {
              const paths = pathsByWorld(worldTab).filter((p) => p.chapter === ch.slug);
              return (
                <div key={ch.slug} className="brutal-border p-3">
                  <div className="font-mono text-[9px] uppercase opacity-40 mb-1">CH {i + 1}</div>
                  <div className="font-display text-base leading-tight mb-2">{ch.title}</div>
                  <div className="space-y-1">
                    {paths.map((path) => (
                      <div key={path.slug} className="font-mono text-[8px] opacity-60 flex items-center gap-1">
                        <span className="opacity-40">›</span> {path.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="brutal-border border-x-0 border-b-0 bg-bone">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <div className="font-mono text-[10px] uppercase opacity-40 mb-2">// FAQ</div>
          <h2 className="font-display text-4xl md:text-6xl mb-8">Common Questions</h2>
          <div className="space-y-0 brutal-border">
            {FAQ.map((item, i) => (
              <div key={i} className={i < FAQ.length - 1 ? "brutal-border border-x-0 border-t-0" : ""}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 brutal-press hover:bg-sun/20"
                >
                  <span className="font-display text-lg leading-tight">{item.q}</span>
                  <span className="font-display text-xl shrink-0 mt-0.5">{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 font-mono text-sm opacity-70 leading-relaxed max-w-2xl">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GET STARTED ──────────────────────────────────────────────────── */}
      <section className="brutal-border border-x-0 border-b-0 bg-acid text-ink">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <div className="font-mono text-[10px] uppercase opacity-50 mb-2">// START NOW</div>
          <h2 className="font-display text-5xl md:text-8xl leading-[0.85] mb-6">
            Ready?
          </h2>
          <p className="font-mono text-sm opacity-70 max-w-lg mx-auto mb-8 leading-relaxed">
            Begin with Fundamentals — 40 missions covering the vocabulary of music. Free, no account required.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/world/fundamentals"
              className="brutal-border bg-ink text-bone px-8 py-4 font-display text-2xl brutal-press brutal-shadow">
              START FUNDAMENTALS →
            </Link>
            <Link to="/worlds"
              className="brutal-border bg-bone text-ink px-8 py-4 font-display text-2xl brutal-press brutal-shadow">
              EXPLORE ALL WORLDS
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

// ── ROOT COMPONENT ────────────────────────────────────────────────────────────
function Home() {
  const { progress } = useProgress();
  const hasMissions = Object.values(progress.completedMissions).some(Boolean);
  return hasMissions ? <Dashboard /> : <Landing />;
}
