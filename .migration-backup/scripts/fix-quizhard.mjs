// Repairs quizHard arrays that the pad-foundations.mjs script malformed by
// inserting new questions inside the previous question's `options: [...]`.
//
// Malformation pattern (multiline):
//   options: ["A","B","C","D",
//   { q: "NEW Q", options: ["1","2","3","4"], answer: K },], answer: N, ... }
//
// Recovery: strip the inserted block out of the options array, append it as
// a sibling at the end of the quizHard array.
import fs from "node:fs";
const FILE = "src/content/lesson-deep-foundations.ts";
let src = fs.readFileSync(FILE, "utf8");

// Regex: capture an inserted question that landed mid-options.
// Group 1: leading whitespace + comma (e.g. ",\n      ")
// Group 2: the inserted question object literal (single line)
const RE = /,\n\s+(\{ q: "[^"]+", options: \[[^\]]+\], answer: \d+(?:, explain: "[^"]*")? \}),\]/g;

const moved = [];
src = src.replace(RE, (_m, inserted) => {
  moved.push(inserted);
  return "]";
});

// Now append each `moved` question to its mission's quizHard array.
// They were inserted in file order, and each mission has exactly one extra.
// Strategy: walk through quizHard arrays in file order; for the next mission
// after each repaired location, append the corresponding queued question.
//
// Simpler: re-scan src, for each quizHard array that is now "fixed but missing
// the extra", we append based on slug → text map. But we don't have that map.
//
// Alternative: take EXTRA from pad script, run brace-aware insertion now.
//
// Easier path: just append the moved[] questions back into the quizHard arrays
// in the same file order. Each quizHard block on its own line gets at most one
// extra appended.

// Walk through src finding each `quizHard: [` and append the next moved
// question (in order) just before its matching `]`.
let cursor = 0;
let idx = 0;
const out = [];
while (cursor < src.length && idx < moved.length) {
  const start = src.indexOf("quizHard: [", cursor);
  if (start === -1) break;
  // Find the matching `]` with bracket tracking, respecting strings.
  let i = start + "quizHard: [".length;
  let depth = 1;
  let inStr = false;
  let strCh = "";
  for (; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (c === "\\") { i++; continue; }
      if (c === strCh) inStr = false;
      continue;
    }
    if (c === '"' || c === "'") { inStr = true; strCh = c; continue; }
    if (c === "[") depth++;
    else if (c === "]") { depth--; if (depth === 0) break; }
  }
  // i is index of matching `]`
  // Find indentation just before
  const lineStart = src.lastIndexOf("\n", i) + 1;
  const indent = src.slice(lineStart, i);
  // Insert `\n<indent>  <moved[idx]>,` before the `]`
  const insertion = `  ${moved[idx]},\n${indent}`;
  out.push(src.slice(cursor, i));
  out.push(insertion);
  cursor = i;
  idx++;
}
out.push(src.slice(cursor));
src = out.join("");

fs.writeFileSync(FILE, src);
console.log(`Repaired ${moved.length} quizHard arrays.`);
