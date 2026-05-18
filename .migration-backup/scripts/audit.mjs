// Run with: npx tsx scripts/audit.mjs   (or rename to .ts)
// Uses tsx to execute TypeScript-importing ESM.
import { LESSONS } from "../src/content/lesson-deep.ts";
import { MISSIONS } from "../src/content/missions.ts";

const TH = {
  beginnerWhatChars: 400,
  advancedWhatChars: 350,
  walkthroughSteps: 5,
  listenForItems: 4,
  edgeCases: 3,
  quizHardCount: 3,
};

const JARGON_FLAGS = [
  "transducer","longitudinal","quantization","attenuation","propagation",
  "polyphony","monophonic","aliasing","heterodyne","cardioid","null point",
  "filter slope","resonance Q","oversampling","sidechain compression","look-ahead",
];

const joinLen = (a) => (Array.isArray(a) ? a.join(" ").length : 0);
const hasJargonRaw = (t) => {
  if (!t) return [];
  const s = t.toLowerCase();
  return JARGON_FLAGS.filter((w) => s.includes(w));
};

const onlyWorld = process.argv[2];
const rows = MISSIONS.filter((m) => !onlyWorld || m.world === onlyWorld).map((m) => {
  const d = LESSONS[m.slug] || {};
  const bWhatLen = joinLen(d.beginner?.what);
  const aWhatLen = joinLen(d.advanced?.what);
  return {
    slug: m.slug, world: m.world,
    flags: [
      bWhatLen < TH.beginnerWhatChars && `beginner-thin(${bWhatLen})`,
      aWhatLen < TH.advancedWhatChars && `advanced-thin(${aWhatLen})`,
      (d.walkthrough?.length ?? 0) < TH.walkthroughSteps && `walk(${d.walkthrough?.length ?? 0})`,
      (d.listenFor?.length ?? 0) < TH.listenForItems && `listen(${d.listenFor?.length ?? 0})`,
      (d.advanced?.edgeCases?.length ?? 0) < TH.edgeCases && `edge(${d.advanced?.edgeCases?.length ?? 0})`,
      (d.quizHard?.length ?? 0) < TH.quizHardCount && `quizH(${d.quizHard?.length ?? 0})`,
      !d.beginner?.analogy && "no-analogy",
      !d.advanced && "NO-ADVANCED",
    ].filter(Boolean),
  };
});

const clean = rows.filter((r) => r.flags.length === 0).length;
const need = rows.filter((r) => r.flags.length > 0);
console.log(`Total: ${rows.length} | Clean: ${clean} | Need work: ${need.length}\n`);
const byWorld = need.reduce((a, r) => ((a[r.world] ||= []).push(r), a), {});
for (const [w, list] of Object.entries(byWorld)) {
  console.log(`── ${w.toUpperCase()} (${list.length}) ──`);
  list.forEach((r) => console.log(`  ${r.slug.padEnd(34)} ${r.flags.join(" ")}`));
  console.log("");
}
