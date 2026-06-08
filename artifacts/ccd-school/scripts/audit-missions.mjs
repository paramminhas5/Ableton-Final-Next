#!/usr/bin/env node
/**
 * audit-missions.mjs
 * Audits all mission data files for content quality issues.
 * Usage: node scripts/audit-missions.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, "../src/content");

// Read all mission source files
const missionFiles = [
  "missions-foundations.ts",
  "missions-dj.ts",
  "missions.ts",
].map(f => ({ name: f, content: fs.readFileSync(path.join(SRC, f), "utf8") }));

// Extract slugs + taglines using regex
function extractMissions(content) {
  const missions = [];
  const slugTaglineRe = /slug:\s*"([^"]+)"[^}]*?tagline:\s*"([^"]+)"/gs;
  let m;
  while ((m = slugTaglineRe.exec(content)) !== null) {
    missions.push({ slug: m[1], tagline: m[2] });
  }
  return missions;
}

// Extract quiz questions
function extractQuizQuestions(content) {
  const questions = [];
  const qRe = /\bq:\s*"([^"]+)"/g;
  let m;
  while ((m = qRe.exec(content)) !== null) {
    questions.push(m[1]);
  }
  return questions;
}

// Normalise question stem for duplicate detection
function normaliseQ(q) {
  return q.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

const allMissions = [];
const allQuestions = [];

for (const file of missionFiles) {
  const missions = extractMissions(file.content);
  const questions = extractQuizQuestions(file.content);
  allMissions.push(...missions.map(m => ({ ...m, file: file.name })));
  allQuestions.push(...questions);
}

// 1. Generic taglines
const GENERIC_RE = /^(Learn|Understanding|Introduction to|Intro to|Exploring|Overview of)/i;
const genericTaglines = allMissions.filter(m => GENERIC_RE.test(m.tagline));

// 2. Duplicate quiz questions
const seen = new Map();
const dupes = [];
for (const q of allQuestions) {
  const key = normaliseQ(q);
  if (seen.has(key)) {
    dupes.push({ original: seen.get(key), duplicate: q });
  } else {
    seen.set(key, q);
  }
}

// 3. sim.type === "none" missions
const simNoneRe = /slug:\s*"([^"]+)"[^}]*?sim:\s*\{[^}]*type:\s*"none"/gs;
const simNoneMissions = [];
for (const file of missionFiles) {
  let m;
  const re = new RegExp(simNoneRe.source, "gs");
  while ((m = re.exec(file.content)) !== null) {
    simNoneMissions.push({ slug: m[1], file: file.name });
  }
}

// 4. Generic badge names
const GENERIC_BADGES = ["Mission Complete", "Chapter Done", "Path Finished", "Level Up", "Done", "Badge Earned"];
const badgeRe = /badge:\s*\{[^}]*name:\s*"([^"]+)"/g;
const genericBadges = [];
for (const file of missionFiles) {
  let m;
  const re = new RegExp(badgeRe.source, "g");
  while ((m = re.exec(file.content)) !== null) {
    if (GENERIC_BADGES.some(g => m[1].toLowerCase().includes(g.toLowerCase()))) {
      genericBadges.push({ name: m[1], file: file.name });
    }
  }
}

// Output report
const now = new Date().toISOString();
let report = `# Mission Audit Report\n\nGenerated: ${now}\nTotal missions scanned: ${allMissions.length}\nTotal quiz questions: ${allQuestions.length}\n\n`;

report += `## 1. Missions with sim.type === "none" (${simNoneMissions.length})\n\n`;
if (simNoneMissions.length > 0) {
  report += "| Slug | File |\n|------|------|\n";
  for (const m of simNoneMissions) {
    report += `| ${m.slug} | ${m.file} |\n`;
  }
} else {
  report += "_None found._\n";
}

report += `\n## 2. Generic Taglines (${genericTaglines.length})\n\n`;
if (genericTaglines.length > 0) {
  report += "| Slug | Current Tagline | File |\n|------|----------------|------|\n";
  for (const m of genericTaglines) {
    report += `| ${m.slug} | ${m.tagline} | ${m.file} |\n`;
  }
} else {
  report += "_None found._\n";
}

report += `\n## 3. Duplicate Quiz Questions (${dupes.length} duplicates)\n\n`;
if (dupes.length > 0) {
  for (const d of dupes.slice(0, 20)) {
    report += `- "${d.original}"\n`;
  }
} else {
  report += "_No duplicates found._\n";
}

report += `\n## 4. Generic Badge Names (${genericBadges.length})\n\n`;
if (genericBadges.length > 0) {
  report += "| Name | File |\n|------|------|\n";
  for (const b of genericBadges) {
    report += `| ${b.name} | ${b.file} |\n`;
  }
} else {
  report += "_None found._\n";
}

const outputPath = path.join(__dirname, "../mission-audit-report.md");
fs.writeFileSync(outputPath, report);
console.log(`Report written to: ${outputPath}`);
console.log(`\nSummary:`);
console.log(`  Generic taglines: ${genericTaglines.length}`);
console.log(`  Duplicate quiz questions: ${dupes.length}`);
console.log(`  Missions without sim: ${simNoneMissions.length}`);
console.log(`  Generic badges: ${genericBadges.length}`);
