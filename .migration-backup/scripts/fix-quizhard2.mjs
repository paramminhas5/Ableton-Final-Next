// Slug-aware quizHard appender. For each mission slug, if the quizHard array
// does not already contain the curated extra (by question text), append it.
import fs from "node:fs";
const FILE = "src/content/lesson-deep-foundations.ts";
let src = fs.readFileSync(FILE, "utf8");

// Curated extras (must match pad-foundations.mjs EXTRA quizHard entries).
const EXTRAS = {
  "what-is-rhythm": `{ q: "A bar in 4/4 contains how many quarter-note beats?", options: ["2", "3", "4", "8"], answer: 2 }`,
  "groove-feel": `{ q: "Swing of 50% means…", options: ["Maximum shuffle", "Perfectly straight timing", "Triplet feel", "Half-time"], answer: 1 }`,
  syncopation: `{ q: "Syncopation primarily accents…", options: ["On-beats", "Off-beats / weak positions", "The downbeat", "Bar one"], answer: 1 }`,
  "rhythm-in-production": `{ q: "Sidechain compression on a pad creates…", options: ["Constant volume", "Rhythmic ducking", "Pitch shift", "Stereo width"], answer: 1 }`,
  "melody-writing": `{ q: "A melody resolving onto scale degree 1 creates…", options: ["Tension", "Resolution / arrival", "Modulation", "Syncopation"], answer: 1 }`,
  "ear-training": `{ q: "Relative pitch is…", options: ["Naming notes without a reference", "Hearing intervals from a known note", "Reading sheet music", "Tuning by ear"], answer: 1 }`,
  "transposition-modes": `{ q: "Dorian mode is built starting on which degree of the major scale?", options: ["1st", "2nd", "5th", "6th"], answer: 1 }`,
  "chord-types": `{ q: "A diminished triad consists of…", options: ["Root, m3, P5", "Root, M3, P5", "Root, m3, ♭5", "Root, M3, #5"], answer: 2 }`,
  "keys-tonality": `{ q: "Relative minor of C major is…", options: ["A minor", "E minor", "G minor", "F minor"], answer: 0 }`,
  "tension-resolution": `{ q: "A deceptive cadence resolves V to…", options: ["I", "vi", "IV", "ii"], answer: 1 }`,
  "harmony-in-production": `{ q: "Why drop the 3rd of a chord in dense low-frequency mixes?", options: ["To make it major", "To avoid muddy low-mid clash", "To change the key", "To add tension"], answer: 1 }`,
  "song-structure": `{ q: "Purpose of a pre-chorus?", options: ["Repeat the verse", "Build tension into the chorus", "Replace the bridge", "Reduce energy"], answer: 1 }`,
  "listening-actively": `{ q: "Best practice when learning from a reference?", options: ["Listen once casually", "Loop short sections and dissect", "Skip to the drop", "Compare loudness only"], answer: 1 }`,
  "daw-explained": `{ q: "Why does Live use 32-bit float internally?", options: ["Smaller files", "Effectively unclippable headroom on internal buses", "Better latency", "MIDI accuracy"], answer: 1 }`,
  "midi-explained": `{ q: "Why does Note On with velocity 0 equal Note Off?", options: ["Bug in spec", "Bandwidth optimisation on serial MIDI", "Required by VSTs", "Bit-depth limit"], answer: 1 }`,
  "digital-audio": `{ q: "Dither is added when…", options: ["Increasing bit depth", "Reducing bit depth", "Changing sample rate", "Compressing audio"], answer: 1 }`,
  "samples-loops": `{ q: "Which warp mode is generally best for full drum loops?", options: ["Beats", "Tones", "Texture", "Re-Pitch"], answer: 0 }`,
  "signal-chain": `{ q: "Why does plugin order matter?", options: ["It doesn't — they're commutative", "Each device transforms the signal before the next sees it", "Only for MIDI plugins", "Only at master bus"], answer: 1 }`,
  "effects-overview": `{ q: "Why use a send for reverb instead of an insert?", options: ["Lower CPU and consistent space across multiple tracks", "Higher fidelity always", "Required by the DAW", "Reverb only works on sends"], answer: 0 }`,
  "mixing-basics": `{ q: "Best comparison method when referencing?", options: ["Match peaks", "Match LUFS loudness", "Match RMS only", "By eye"], answer: 1 }`,
  "music-tech-integration": `{ q: "Highest-leverage early-career investment?", options: ["More plugins", "Templates + shortcut fluency", "Newer interface", "Studio monitors upgrade"], answer: 1 }`,
};

function findMissionBlock(text, slug) {
  const m = new RegExp(`"${slug}":\\s*{`, "g").exec(text);
  if (!m) return null;
  let depth = 0;
  let i = m.index + m[0].length - 1;
  for (; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}") { depth--; if (depth === 0) return { start: m.index, end: i + 1 }; }
  }
  return null;
}

// Find quizHard: [ ... ] inside block, with proper bracket walk.
function quizHardRange(block) {
  const m = /quizHard:\s*\[/.exec(block);
  if (!m) return null;
  let i = m.index + m[0].length;
  let depth = 1;
  let inStr = false, strCh = "";
  for (; i < block.length; i++) {
    const c = block[i];
    if (inStr) {
      if (c === "\\") { i++; continue; }
      if (c === strCh) inStr = false;
      continue;
    }
    if (c === '"' || c === "'") { inStr = true; strCh = c; continue; }
    if (c === "[") depth++;
    else if (c === "]") { depth--; if (depth === 0) return { open: m.index + m[0].length, close: i }; }
  }
  return null;
}

let added = 0, skipped = 0;
for (const [slug, extra] of Object.entries(EXTRAS)) {
  const loc = findMissionBlock(src, slug);
  if (!loc) { console.log(`SKIP not found: ${slug}`); continue; }
  let block = src.slice(loc.start, loc.end);
  // Already present?
  const questionText = extra.match(/q: "([^"]+)"/)[1];
  if (block.includes(questionText)) { skipped++; continue; }
  const qhRange = quizHardRange(block);
  if (!qhRange) { console.log(`SKIP no quizHard: ${slug}`); continue; }
  const before = block.slice(0, qhRange.close);
  const after = block.slice(qhRange.close);
  // Determine indent from existing items
  const indentMatch = before.match(/quizHard:\s*\[\s*\n(\s+)/);
  const indent = indentMatch ? indentMatch[1] : "      ";
  // Ensure trailing comma on previous item
  const trimmed = before.replace(/\s*$/, "");
  const sep = trimmed.endsWith(",") ? "" : ",";
  const newBlock = `${trimmed}${sep}\n${indent}${extra},\n    ${after}`;
  src = src.slice(0, loc.start) + newBlock + src.slice(loc.end);
  added++;
  console.log(`+ ${slug}`);
}
fs.writeFileSync(FILE, src);
console.log(`\nAdded ${added}, skipped (already present) ${skipped}.`);
