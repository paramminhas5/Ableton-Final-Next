"use client";
/**
 * HomeClient — CCD.SCHOOL landing page.
 * Hero is a 1:1 match of CatsCanDance hero:
 *   - hero-center.svg as central cat composition
 *   - cat-left.svg + cat-right.svg at bottom corners (parallax fly-out)
 *   - 4 flank cats bracketing the headline (drift out on scroll)
 *   - title text-[15vw] Bowlby One with drop-shadow
 *   - spinning acid/magenta stars
 *   - CTAs pinned at bottom over the cats
 *   - MoonwalkCat + ScrollPaw on every page
 *   - SectionReveal on every section
 *   - CcdMarquee between sections
 */
"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useProgress } from "@/lib/progress";
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
  fundamentals: { label: "Music Foundations", icon: "🎵", color: "bg-acid text-ink", tagline: "Sound · Rhythm · Melody · Harmony · Music Tech", detail: "Everything you need to understand music before you produce or DJ. Built from learningmusic.ableton.com.", to: "/world/fundamentals" },
  dj:           { label: "DJ World",           icon: "🎧", color: "bg-ink text-bone",          tagline: "Setup · Library · The Mix · Performance · Mastery",            detail: "rekordbox, beatmatching, crowd reading and career. Built from the Pioneer DJ rekordbox 6.0.0 Manual.",     to: "/world/dj" },
  producer:     { label: "Producer",           icon: "🎛", color: "bg-electric-blue text-bone", tagline: "First Contact · Sound & MIDI · The Mix · Performance · Advanced", detail: "Ableton Live 12 from zero to expert. Built from the Ableton Live 12 Reference Manual.",                 to: "/world/producer" },
} as const;

const FAQ = [
  { q: "What's the difference between Flow Mode and Free Mode?", a: "Free Mode is fully open — every mission accessible from the start. Flow Mode gates content sequentially like Duolingo: complete each mission before the next unlocks. Wrong answers cost a heart." },
  { q: "Do I need to start with Fundamentals?",                  a: "In Free Mode, no — jump anywhere. In Flow Mode, Fundamentals is a hard prerequisite before DJ World and Producer unlock." },
  { q: "What are the sources for the content?",                  a: "Fundamentals: learningmusic.ableton.com. DJ World: Pioneer DJ rekordbox 6.0.0 Manual. Producer: Ableton Live 12 Reference Manual. All quiz questions cite their source." },
  { q: "How long does it take to complete a world?",             a: "At 30 min/day: Fundamentals ≈ 3–4 weeks (40 missions), DJ World ≈ 3–4 weeks (40 missions), Producer ≈ 6–8 weeks (73 missions)." },
  { q: "What are trophies for?",                                 a: "Path trophies (bronze) for completing a path. Chapter trophies (silver) for finishing all paths. World trophies (gold) for a whole world. CCD Master requires all three." },
];

function worldStats(world: WorldTab, completed: Record<string, unknown>) {
  const missions = ALL_MISSIONS.filter(m => world === "fundamentals" ? m.world === "foundations" : m.world === world);
  const done = missions.filter(m => !!completed[m.slug]).length;
  const total = missions.length;
  return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
}

// ── Spinning star (same SVG as CCD) ──────────────────────────────────────────
function Star({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" className={`w-full h-full ${className}`} aria-hidden>
      <path d="M50 2 L60 38 L98 40 L68 62 L80 98 L50 76 L20 98 L32 62 L2 40 L40 38 Z"
        stroke="hsl(222 47% 4%)" strokeWidth="4" strokeLinejoin="round" />
    </svg>
  );
}

// ── Feature pill ─────────────────────────────────────────────────────────────
function FeaturePill({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="brutal-border bg-bone/10 border-bone/30 px-3 py-2 flex items-center gap-2">
      <span>{icon}</span>
      <span className="font-mono text-[10px] uppercase opacity-80 text-bone">{text}</span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// HERO — exact CCD structure
// ══════════════════════════════════════════════════════════════════════════════
function HeroSection({ onGetStarted }: { onGetStarted: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  // Big bottom side cats — fly out on scroll (same transforms as CCD)
  const leftX  = useTransform(scrollYProgress, [0, 1], reduce ? ["0%","0%"] : ["0%", "-180%"]);
  const leftY  = useTransform(scrollYProgress, [0, 1], reduce ? ["0%","0%"] : ["0%", "-30%"]);
  const leftRot  = useTransform(scrollYProgress, [0, 1], reduce ? [0,0] : [0, -45]);
  const rightX = useTransform(scrollYProgress, [0, 1], reduce ? ["0%","0%"] : ["0%", "180%"]);
  const rightY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%","0%"] : ["0%", "-30%"]);
  const rightRot = useTransform(scrollYProgress, [0, 1], reduce ? [0,0] : [0, 45]);

  // Center DJ cat — parallax down
  const djY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%","0%"] : ["0%", "18%"]);

  // 4 flank cats — drift outward + fade (same as CCD)
  const tlX = useTransform(scrollYProgress, [0, 1], reduce ? ["0%","0%"] : ["0%", "-120%"]);
  const tlRot = useTransform(scrollYProgress, [0, 1], reduce ? [0,0] : [-12, -40]);
  const trX = useTransform(scrollYProgress, [0, 1], reduce ? ["0%","0%"] : ["0%", "120%"]);
  const trRot = useTransform(scrollYProgress, [0, 1], reduce ? [0,0] : [12, 40]);
  const blX = useTransform(scrollYProgress, [0, 1], reduce ? ["0%","0%"] : ["0%", "-120%"]);
  const blRot = useTransform(scrollYProgress, [0, 1], reduce ? [0,0] : [-12, -40]);
  const brX = useTransform(scrollYProgress, [0, 1], reduce ? ["0%","0%"] : ["0%", "120%"]);
  const brRot = useTransform(scrollYProgress, [0, 1], reduce ? [0,0] : [12, 40]);
  const flankOpacity = useTransform(scrollYProgress, [0, 0.6], reduce ? [1,1] : [1, 0]);

  // Title scales up slightly as cats fly (CCD effect)
  const titleScale = useTransform(scrollYProgress, [0, 1], reduce ? [1,1] : [1, 1.18]);
  const titleY     = useTransform(scrollYProgress, [0, 1], reduce ? ["0%","0%"] : ["0%", "-6%"]);

  // Spinning stars
  const starRotA = useTransform(scrollYProgress, [0, 1], reduce ? [0,0] : [0,  360]);
  const starRotB = useTransform(scrollYProgress, [0, 1], reduce ? [0,0] : [0, -360]);

  const flankBase = "absolute z-30 pointer-events-none drop-shadow-[6px_6px_0_hsl(222_47%_4%)] wiggle w-24 md:w-40";

  const FLANK = [
    { id: "cap",     src: "/cats/cat-cap.png",              pos: "top-[28%] left-[6%]  md:top-[26%] md:left-[14%]",  x: tlX, rot: tlRot },
    { id: "hpdance", src: "/cats/cat-headphones-dance.png", pos: "top-[28%] right-[6%] md:top-[26%] md:right-[14%]", x: trX, rot: trRot },
    { id: "phones",  src: "/cats/cat-headphones.png",       pos: "top-[52%] left-[6%]  md:top-[54%] md:left-[14%]",  x: blX, rot: blRot },
    { id: "hands",   src: "/cats/cat-handstand.png",        pos: "top-[52%] right-[6%] md:top-[54%] md:right-[14%]", x: brX, rot: brRot },
  ];

  return (
    <section ref={ref} id="home" className="relative h-screen overflow-hidden bg-electric-blue">

      {/* Spinning acid star — top left */}
      <motion.div style={{ rotate: starRotA, willChange: "transform" }}
        className="absolute top-24 left-6 md:top-28 md:left-16 z-10 w-16 md:w-32 text-acid drop-shadow-[6px_6px_0_hsl(222_47%_4%)]"
        aria-hidden>
        <Star />
      </motion.div>

      {/* Spinning magenta star — top right */}
      <motion.div style={{ rotate: starRotB, willChange: "transform" }}
        className="absolute top-32 right-6 md:top-40 md:right-20 z-10 w-14 md:w-28 text-magenta drop-shadow-[6px_6px_0_hsl(222_47%_4%)]"
        aria-hidden>
        <Star />
      </motion.div>

      {/* ── HEADLINE — centred, massive, CCD-style ── */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center pointer-events-none">
        <motion.h1
          style={{ scale: titleScale, y: titleY, transformOrigin: "center center", willChange: "transform", fontSize: "clamp(56px, 15vw, 160px)", lineHeight: 0.85, textShadow: "6px 6px 0 hsl(222 47% 4%)" }}
          className="font-display leading-[0.85] text-bone"
        >
          CATS CAN<br />LEARN<span className="text-acid">.</span>
        </motion.h1>
      </div>

      {/* ── 4 FLANK CATS ── */}
      {FLANK.map(c => (
        <motion.div key={c.id}
          style={{ x: c.x, rotate: c.rot, opacity: flankOpacity, willChange: "transform" }}
          className={`${flankBase} ${c.pos}`}
          aria-hidden>
          <Image src={c.src} alt="" width={160} height={160} className="w-full h-auto" />
        </motion.div>
      ))}

      {/* ── CENTER DJ CAT (hero-center.svg — the big composition from CCD) ── */}
      <motion.div
        style={{ y: djY, willChange: "transform" }}
        className="absolute inset-x-0 mx-auto bottom-20 md:-bottom-8 z-30 w-[100%] md:w-[92%] min-w-[300px] max-w-[820px] pointer-events-none"
        aria-hidden>
        <Image
          src="/cats/hero-center.svg"
          alt="DJ Pawsworth"
          width={820}
          height={560}
          priority
          className="w-full h-auto drop-shadow-[10px_10px_0_hsl(222_47%_4%)]"
        />
      </motion.div>

      {/* ── BOTTOM SIDE CATS ── */}
      <motion.div style={{ x: leftX, y: leftY, rotate: leftRot, willChange: "transform" }}
        className="absolute bottom-28 md:bottom-4 left-1 md:left-10 z-40 w-32 md:w-56 drop-shadow-[6px_6px_0_hsl(222_47%_4%)]"
        aria-hidden>
        <Image src="/cats/cat-left.svg" alt="" width={224} height={224} className="w-full h-auto wiggle" />
      </motion.div>
      <motion.div style={{ x: rightX, y: rightY, rotate: rightRot, willChange: "transform" }}
        className="absolute bottom-28 md:bottom-4 right-1 md:right-10 z-40 w-32 md:w-56 drop-shadow-[6px_6px_0_hsl(222_47%_4%)]"
        aria-hidden>
        <Image src="/cats/cat-right.svg" alt="" width={224} height={224} className="w-full h-auto wiggle" />
      </motion.div>

      {/* ── CTAs — pinned at bottom, above cats ── */}
      <div className="hidden md:flex absolute inset-x-0 bottom-16 z-50 flex-row gap-3 justify-center px-4">
        <button onClick={onGetStarted}
          className="bg-acid text-ink font-display text-xl px-7 py-4 border-4 border-ink chunk-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-transform">
          START LEARNING FREE →
        </button>
        <a href="#curriculum"
          className="bg-ink text-bone font-display text-xl px-7 py-4 border-4 border-ink chunk-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-transform">
          SEE CURRICULUM ↓
        </a>
      </div>
      <div className="md:hidden absolute inset-x-0 bottom-6 z-50 flex flex-col gap-2 justify-center px-6">
        <button onClick={onGetStarted}
          className="bg-acid text-ink font-display text-xl px-6 py-4 border-4 border-ink chunk-shadow text-center">
          START LEARNING FREE →
        </button>
        <a href="#curriculum"
          className="bg-ink text-bone font-display text-lg px-6 py-3 border-4 border-ink chunk-shadow text-center">
          SEE CURRICULUM ↓
        </a>
      </div>

      {/* Stats strip */}
      <div className="absolute bottom-0 left-0 right-0 z-50 border-t-4 border-ink grid grid-cols-4 bg-ink/70 backdrop-blur-sm">
        {[{ v:"153",l:"Missions"},{v:"3",l:"Worlds"},{v:"47",l:"Live Sims"},{v:"0",l:"Ads. Ever."}].map(({v,l}) => (
          <div key={l} className="py-3 px-2 text-center border-r-4 border-ink/50 last:border-r-0">
            <div className="font-display text-xl md:text-2xl text-acid">{v}</div>
            <div className="font-mono text-[9px] uppercase opacity-50 mt-0.5">{l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DASHBOARD (returning users → redirect)
// ══════════════════════════════════════════════════════════════════════════════
function Dashboard() {
  const { progress } = useProgress();
  const { user } = useAuth();
  const router = useRouter();
  const completed = progress.completedMissions;
  const { current: rank } = rankFor(progress.xp);
  const totalDone = ALL_MISSIONS.filter(m => !!completed[m.slug]).length;

  useEffect(() => { router.replace("/dashboard"); }, [router]);

  const continueSlug = (() => {
    const last = Object.entries(completed).filter(([,v])=>v).sort(([,a],[,b])=>(b?.at??0)-(a?.at??0)).map(([s])=>s)[0];
    const ctx = last ? getMissionContext(last) : null;
    const next = ctx?.path ? (() => { const i=ctx.path.missionSlugs.indexOf(last!); const n=ctx.path.missionSlugs[i+1]; return n&&!completed[n]?n:null; })() : null;
    return next ?? (totalDone===0?"what-is-sound":null);
  })();

  return (
    <main className="min-h-screen bg-bone pb-24">
      <header className="border-b-4 border-ink bg-electric-blue text-bone">
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-10 flex items-center gap-5">
          <div className="relative w-16 h-16 shrink-0 animate-bounce-bob" style={{filter:"drop-shadow(3px 3px 0 hsl(222 47% 4%))"}}>
            <Image src="/cats/cat-dj-hero.png" alt="" fill className="object-contain" sizes="64px" />
          </div>
          <div>
            <div className="font-mono text-xs uppercase opacity-60 mb-1">// KEEP GOING</div>
            <h1 className="font-display text-5xl md:text-7xl leading-none">KEEP<br /><span className="text-acid">GOING.</span></h1>
          </div>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {continueSlug && (
          <Link href={`/learn/${continueSlug}`}
            className="brutal-border bg-acid text-ink p-5 flex items-center justify-between gap-4 block hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none chunk-shadow transition-transform mb-4 border-4 border-ink">
            <div><div className="font-mono text-[9px] uppercase opacity-60 mb-1">CONTINUE</div><div className="font-display text-2xl">{continueSlug.replace(/-/g," ")}</div></div>
            <Image src="/cats/cat-headphones.png" alt="" width={48} height={48} className="drop-shadow-[2px_2px_0_hsl(222_47%_4%)] animate-bounce-bob" />
          </Link>
        )}
        <div className="grid grid-cols-4 gap-2 mt-4">
          {[{v:progress.xp,l:"XP",bg:"bg-acid text-ink"},{v:`🔥${progress.streakDays}`,l:"Streak",bg:"bg-magenta text-bone"},{v:totalDone,l:"Lessons",bg:"bg-bone text-ink"},{v:rank.emoji,l:rank.name,bg:"bg-bone text-ink"}].map(({v,l,bg})=>(
            <div key={l} className={`brutal-border ${bg} p-3 chunk-shadow-sm`}>
              <div className="font-display text-2xl">{v}</div>
              <div className="font-mono text-[9px] uppercase mt-1 opacity-60">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LANDING PAGE
// ══════════════════════════════════════════════════════════════════════════════
function Landing({ onGetStarted }: { onGetStarted: () => void }) {
  const [worldTab, setWorldTab] = useState<WorldTab>("fundamentals");
  const [openFaq, setOpenFaq]   = useState<number | null>(null);
  const chapters = chaptersByWorld(worldTab);

  return (
    <main className="min-h-screen bg-bone overflow-x-hidden">
      <MoonwalkCat />
      <ScrollPaw />

      {/* HERO */}
      <HeroSection onGetStarted={onGetStarted} />

      {/* Identity strip */}
      <div className="bg-ink border-b-4 border-ink py-3 px-4">
        <p className="max-w-5xl mx-auto font-display text-bone text-xs md:text-sm uppercase tracking-[0.18em] text-center">
          153 missions · 3 worlds · gamified music education · source-verified · free to start
        </p>
      </div>

      {/* Marquee 1 */}
      <CcdMarquee items={["LEARN MUSIC 🎧","ABLETON LIVE 12","REKORDBOX 6.0","MUSIC THEORY","DJ WORLD","PRODUCER PATH","FUNDAMENTALS","FREE TO START 🎵"]} bg="bg-acid" textColor="text-ink" />

      {/* HOW IT WORKS */}
      <SectionReveal>
        <section className="bg-bone border-b-4 border-ink">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-24">
            <div className="font-mono text-xs uppercase opacity-40 mb-2 tracking-widest">// THE SYSTEM</div>
            <h2 className="font-display text-5xl md:text-7xl mb-3" style={{textShadow:"3px 3px 0 hsl(84 81% 56%)"}}>Built Different.</h2>
            <p className="font-sans text-sm opacity-60 max-w-xl leading-relaxed mb-12">Not another YouTube playlist. A structured curriculum built from primary sources, with interactive sims and quizzes on every mission.</p>
            <div className="grid md:grid-cols-3 gap-0 brutal-border chunk-shadow">
              {[
                { num:"01", title:"Pick a World",    emoji:"🎵", accent:"bg-acid",                   body:"Start with Fundamentals (sound, rhythm, melody, harmony, tech) or jump directly into DJ World or Producer." },
                { num:"02", title:"Follow the Path", emoji:"🐱", accent:"bg-electric-blue text-bone", body:"Each world has chapters. Each chapter has paths. Each path is a mission snake — complete in order, earn XP, unlock trophies." },
                { num:"03", title:"Earn Trophies",   emoji:"🏆", accent:"bg-acid",                   body:"Path trophies → Chapter trophies → World trophies → CCD Master. Choose Flow Mode (sequential) or Free Mode (open)." },
              ].map((s,i) => (
                <div key={i} className={`p-6 md:p-8 ${i<2?"brutal-border border-y-0 border-l-0":""}`}>
                  <div className={`brutal-border ${s.accent} w-12 h-12 flex items-center justify-center font-display text-2xl mb-4 chunk-shadow-sm`}>{s.emoji}</div>
                  <div className="font-mono text-[9px] uppercase opacity-40 mb-1">{s.num}</div>
                  <div className="font-display text-2xl mb-3">{s.title}</div>
                  <div className="font-sans text-sm opacity-70 leading-relaxed">{s.body}</div>
                </div>
              ))}
            </div>
            <div className="mt-10 grid md:grid-cols-2 gap-3">
              <div className="brutal-border bg-hot/10 p-5">
                <div className="font-display text-sm uppercase opacity-50 mb-3">❌ Everywhere else</div>
                <ul className="space-y-2 font-sans text-sm opacity-70">
                  {["Random YouTube videos, no structure","Ads every 2 minutes","No quizzes, no accountability","Content not from official docs","Progress tracked nowhere"].map(t=>(
                    <li key={t} className="flex gap-2"><span className="text-hot shrink-0">✗</span>{t}</li>
                  ))}
                </ul>
              </div>
              <div className="brutal-border bg-acid p-5 chunk-shadow">
                <div className="font-display text-sm uppercase opacity-60 mb-3 text-ink">✓ CCD.SCHOOL</div>
                <ul className="space-y-2 font-sans text-sm text-ink">
                  {["153 missions in a structured curriculum","Zero ads, ever","Interactive quiz on every single mission","Built from official Ableton + Pioneer manuals","XP, streaks, spaced repetition, leaderboard"].map(t=>(
                    <li key={t} className="flex gap-2"><span className="font-bold shrink-0">✓</span>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* Marquee 2 */}
      <CcdMarquee items={["BEATMATCHING","CAMELOT WHEEL","SPACED REPETITION","XP SYSTEM","STREAK SHIELDS","LEADERBOARD","BADGES","PLACEMENT TEST"]} bg="bg-ink" textColor="text-bone" reverse />

      {/* THREE WORLDS */}
      <SectionReveal>
        <section className="bg-electric-blue text-bone border-b-4 border-ink">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-24">
            <div className="font-mono text-xs uppercase opacity-60 mb-2 tracking-widest">// THREE WORLDS</div>
            <h2 className="font-display text-5xl md:text-7xl mb-10" style={{textShadow:"4px 4px 0 hsl(222 47% 4%)"}}>Choose Your Path.</h2>
            <div className="space-y-3">
              {(["fundamentals","dj","producer"] as WorldTab[]).map(world => {
                const meta = WORLD_DATA[world];
                const paths = pathsByWorld(world);
                return (
                  <Link key={world} href={meta.to}
                    className={`brutal-border ${meta.color} p-5 md:p-7 flex items-start justify-between gap-4 block chunk-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-transform`}>
                    <div>
                      <div className="mb-3 opacity-70">{meta.icon}</div>
                      <div className="font-mono text-[9px] uppercase opacity-60 mb-1">{paths.length} PATHS · {paths.flatMap(p=>p.missionSlugs).length} MISSIONS</div>
                      <div className="font-display text-4xl md:text-6xl">{meta.label}</div>
                      <div className="font-sans text-sm opacity-70 mt-1">{meta.tagline}</div>
                      <div className="font-sans text-xs opacity-50 mt-2 max-w-lg leading-relaxed">{meta.detail}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="flex justify-center mt-12">
              <Image src="/cats/cat-handstand.png" alt="" width={120} height={120} className="drop-shadow-[4px_4px_0_hsl(222_47%_4%)] wiggle" />
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* Marquee 3 */}
      <CcdMarquee items={["🎵 FUNDAMENTALS","🎧 DJ WORLD","🎛 PRODUCER","153 MISSIONS","CCD MASTER","TROPHIES","GEM SHOP","LEADERBOARD"]} bg="bg-magenta" textColor="text-bone" size="sm" />

      {/* CURRICULUM */}
      <SectionReveal>
        <section id="curriculum" className="bg-bone border-b-4 border-ink">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-24">
            <div className="font-mono text-xs uppercase opacity-40 mb-2 tracking-widest">// CURRICULUM</div>
            <h2 className="font-display text-5xl md:text-7xl mb-8">What You&apos;ll Learn.</h2>
            <div className="brutal-border flex mb-8 chunk-shadow">
              {(["fundamentals","dj","producer"] as WorldTab[]).map(w => {
                const active = worldTab===w;
                const accent = {fundamentals:"bg-acid text-ink",dj:"bg-ink text-bone",producer:"bg-electric-blue text-bone"}[w];
                return (
                  <button key={w} onClick={()=>setWorldTab(w)}
                    className={`flex-1 px-4 py-3 font-display text-xs uppercase transition-colors border-r-4 border-ink last:border-r-0 ${active?accent:"bg-bone hover:bg-acid/30"}`}>
                    {WORLD_DATA[w].icon} {WORLD_DATA[w].label}
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {chapters.map((ch,i)=>{
                const paths=pathsByWorld(worldTab).filter(p=>p.chapter===ch.slug);
                return (
                  <div key={ch.slug} className="brutal-border p-3 hover:bg-acid/20 transition-colors">
                    <div className="font-mono text-[9px] uppercase opacity-40 mb-1">CH {i+1}</div>
                    <div className="font-display text-sm leading-tight mb-2">{ch.title}</div>
                    {paths.map(p=><div key={p.slug} className="font-mono text-[8px] opacity-50 flex items-start gap-1"><span className="opacity-40">›</span><span>{p.title}</span></div>)}
                  </div>
                );
              })}
            </div>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-2">
              {[{v:"153",l:"Missions",a:true},{v:"32",l:"Paths"},{v:"15",l:"Chapters"},{v:"47",l:"Sims"}].map(({v,l,a})=>(
                <div key={l} className={`brutal-border p-4 md:p-5 chunk-shadow ${a?"bg-acid text-ink":"bg-bone text-ink"}`}>
                  <div className="font-display text-3xl md:text-4xl tabular-nums leading-none">{v}</div>
                  <div className="font-mono text-[10px] uppercase opacity-60 mt-1">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* GAMIFICATION */}
      <SectionReveal>
        <section className="bg-ink text-bone border-b-4 border-acid">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-24">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-mono text-xs uppercase opacity-40 mb-2 tracking-widest">// GAMIFICATION</div>
                <h2 className="font-display text-5xl md:text-7xl mb-10">Built to Keep You Going.</h2>
              </div>
              <Image src="/cats/cat-raver.png" alt="" width={100} height={100} className="hidden md:block drop-shadow-[4px_4px_0_hsl(84_81%_56%)] wiggle shrink-0" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[{i:"⚡",t:"XP System",b:"Earn XP on every mission. Climb 12 ranks from Bedroom Producer to CCD Master."},{i:"🔥",t:"Daily Streaks",b:"Hit your daily 50 XP goal. Build streaks. Earn a Streak Shield every 7 days."},{i:"♥",t:"Hearts",b:"Wrong answers cost a heart in Flow Mode. Run out and you wait — or spend gems."},{i:"💎",t:"Gem Shop",b:"Earn gems on completions. Spend them to refill hearts or unlock cosmetics."},{i:"🏅",t:"Badges",b:"Over 20 unique badges. One for every path, chapter, and world completed."},{i:"🧠",t:"Review Queue",b:"FSRS v4 spaced repetition brings back fading lessons exactly when you need them."}].map(({i,t,b})=>(
                <div key={t} className="brutal-border bg-bone/5 p-4 hover:bg-acid/10 transition-colors">
                  <div className="text-2xl mb-2">{i}</div>
                  <div className="font-display text-base mb-1">{t}</div>
                  <div className="font-sans text-xs opacity-60 leading-relaxed">{b}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* FAQ */}
      <SectionReveal>
        <section className="bg-bone border-b-4 border-ink">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 md:py-24">
            <div className="font-mono text-xs uppercase opacity-40 mb-2 tracking-widest">// FAQ</div>
            <h2 className="font-display text-5xl md:text-7xl mb-8">Questions.</h2>
            <div className="brutal-border chunk-shadow">
              {FAQ.map((item,i)=>(
                <div key={i} className={i<FAQ.length-1?"border-b-4 border-ink":""}>
                  <button onClick={()=>setOpenFaq(openFaq===i?null:i)} className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 hover:bg-acid/20 transition-colors">
                    <span className="font-display text-lg md:text-xl leading-tight">{item.q}</span>
                    <span className="font-display text-2xl shrink-0 mt-0.5 text-magenta">{openFaq===i?"−":"+"}</span>
                  </button>
                  {openFaq===i&&<div className="px-5 pb-5 font-sans text-sm opacity-70 leading-relaxed max-w-2xl animate-fade-in">{item.a}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* FINAL CTA */}
      <SectionReveal>
        <section className="bg-acid text-ink border-b-4 border-ink">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-28 text-center">
            <div className="font-mono text-xs uppercase opacity-50 mb-4 tracking-widest">// NO EXCUSES</div>
            <div className="flex justify-center mb-6">
              <Image src="/cats/cat-dj-hero.png" alt="DJ Pawsworth" width={140} height={140} className="drop-shadow-[6px_6px_0_hsl(222_47%_4%)] animate-cat-celebrate" />
            </div>
            <h2 className="font-display leading-[0.85] mb-6 drop-shadow-[4px_4px_0_hsl(222_47%_4%)]" style={{fontSize:"clamp(48px,10vw,120px)"}}>
              START<br />TODAY.
            </h2>
            <p className="font-sans text-sm md:text-base opacity-70 max-w-md mx-auto mb-10 leading-relaxed">Free. No account required. 153 missions waiting. Begin with Fundamentals — your first lesson takes 5 minutes.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={onGetStarted} className="bg-ink text-bone px-8 py-5 font-display text-2xl md:text-3xl border-4 border-ink chunk-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-transform animate-pulse-glow">
                GET STARTED FREE →
              </button>
              <Link href="/missions" className="bg-transparent border-4 border-ink px-8 py-5 font-display text-2xl md:text-3xl hover:bg-ink/10 transition-colors">
                BROWSE ALL MISSIONS
              </Link>
            </div>
            <div className="mt-8 font-mono text-[10px] uppercase opacity-40">No credit card · No download · Works on any device</div>
          </div>
        </section>
      </SectionReveal>

      <CcdMarquee items={["CCD.SCHOOL","CATSCANDANCE","LEARN.CATSCANDANCE.COM","MUSIC EDUCATION","DJ WORLD","PRODUCER PATH"]} bg="bg-ink" textColor="text-bone" size="sm" />
    </main>
  );
}

// ── Root export ───────────────────────────────────────────────────────────────
export function HomeClient() {
  const { user } = useAuth();
  const router = useRouter();
  const { progress } = useProgress();
  const [showOnboarding, setShowOnboarding] = useState(false);

  let shouldRedirect = false;
  try {
    const hasMissions = Object.keys(progress.completedMissions).length > 0;
    shouldRedirect = !!(user || hasMissions || progress.onboardingDone);
  } catch { shouldRedirect = false; }

  useEffect(() => { if (shouldRedirect) router.replace("/dashboard"); }, [shouldRedirect, router]);
  if (shouldRedirect) return null;
  if (showOnboarding) return <OnboardingFlow onDone={() => setShowOnboarding(false)} />;
  return <Landing onGetStarted={() => setShowOnboarding(true)} />;
}
