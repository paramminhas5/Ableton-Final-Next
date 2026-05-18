#!/usr/bin/env node
// Rewrite the `number:` field on every mission so each world starts at 1.
// Walks missions.ts, missions-foundations.ts, missions-dj.ts.
// Strategy: parse object blocks, group by `world:` value, assign per-world counters
// in the order each mission appears in source.
import fs from "node:fs";
import path from "node:path";

const FILES = [
  "src/content/missions.ts",
  "src/content/missions-foundations.ts",
  "src/content/missions-dj.ts",
];

// Per-world counters (shared across files so foundations world keeps 1..N).
const counters = {};

function processFile(file) {
  let src = fs.readFileSync(file, "utf8");
  // Pattern: a mission begins with `slug:` and we want the nearest world + number.
  // We scan linearly and match { slug ... world: "X" ... number: N ... }
  // The trick: replace `number: <digits>` inside each mission with our counter.
  // We approximate a mission block as text between a `slug:` and the next `slug:`.
  const lines = src.split("\n");
  const out = [];
  let buffer = [];
  const blocks = [];
  const slugRe = /^\s*\{?\s*slug:\s*"/;

  // Build list of mission start indices
  const starts = [];
  for (let i = 0; i < lines.length; i++) {
    if (/\bslug:\s*"/.test(lines[i]) && /\bworld:\s*"/.test(lines[i] + (lines[i+1]||"") + (lines[i+2]||""))) {
      starts.push(i);
    }
  }
  // Append sentinel
  starts.push(lines.length);

  for (let s = 0; s < starts.length - 1; s++) {
    const from = starts[s];
    const to = starts[s + 1];
    const block = lines.slice(from, to).join("\n");
    const worldMatch = block.match(/world:\s*"([^"]+)"/);
    const numberMatch = block.match(/number:\s*\d+/);
    if (!worldMatch || !numberMatch) continue;
    const world = worldMatch[1];
    counters[world] = (counters[world] || 0) + 1;
    const next = counters[world];
    const newBlock = block.replace(/number:\s*\d+/, `number: ${next}`);
    for (let i = from; i < to; i++) lines[i] = null;
    // Re-insert as a single joined region
    const newLines = newBlock.split("\n");
    // We'll splice later — simpler: store replacements
    blocks.push({ from, to, newLines });
  }

  // Apply replacements in reverse
  const linesCopy = src.split("\n");
  for (let i = blocks.length - 1; i >= 0; i--) {
    const { from, to, newLines } = blocks[i];
    linesCopy.splice(from, to - from, ...newLines);
  }
  fs.writeFileSync(file, linesCopy.join("\n"));
  console.log(`✓ ${file}`);
}

// Important: process foundations + dj first so their counters start at 1,
// then missions.ts (which contains first-contact, two-views, etc.)
processFile("src/content/missions-foundations.ts");
processFile("src/content/missions-dj.ts");
processFile("src/content/missions.ts");

console.log("\nPer-world counts:");
for (const [w, n] of Object.entries(counters)) console.log(`  ${w}: ${n}`);
