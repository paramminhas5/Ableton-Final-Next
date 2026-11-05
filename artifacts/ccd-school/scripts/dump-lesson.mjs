// Print a lesson as a learner meets it, step by step, for one voice and level (for reviews).
//   npx tsx scripts/dump-lesson.mjs your-kick mentor standard
import { readFileSync } from "node:fs";
import { resolveLesson, resolveLearn } from "../src/content/lessons/resolve.ts";
const [slug = "your-kick", voice = "mentor", level = "standard"] = process.argv.slice(2);
const gen = JSON.parse(readFileSync(new URL("../src/content/lessons/lessons.gen.json", import.meta.url), "utf8"));
const lesson = gen.lessons.find(l => l.slug === slug);
if (!lesson) throw new Error("no lesson " + slug);
const out = [];
out.push(`# ${lesson.title} (voice: ${voice}, level: ${level}, about ${lesson.minutes} minutes)`);
out.push(`\nSCREEN 0, opening. The learner sees the title and this paragraph in large type, a pulsing beat bar, then a list "you'll learn", then a "let's go" key:\n${resolveLearn(lesson, voice)}`);
const UI = {
  hear: "The screen shows a bar-meter animating while a clip plays. Keys: a hear/stop key and a pink next key.",
  say: "The screen shows the title; the text below is the explanation. Deeper cards (if any) are shown below the text for mentor and eli5, or behind a 'go deeper' key for straight. Pink next key.",
  play: "Split screen. A piano-roll style grid with beat numbers 1 to 4 and a caption about the beat grid. A live instruction line ('press rec...') changes as they act. Keys: rec, play, undo, snap (1/16). An 8-pad drum tray with kick outlined. A 'click: on' chip. Pink key 'keep it' stays dim until 4 kicks are recorded.",
  shape: "Two knobs (decay, tune) with the loop playing. Hear key and a pink 'keep it' key.",
  ask: "A question with answer pads a to d, a check key (dim until an answer is picked), then an explanation. A hint key at gentle and standard.",
  ear: "A listening round: two notes play (a new sound each round), the learner taps 'the first' or 'the second' for which was higher, with an 'again' key to replay. Repeats for several rounds.",
  keep: "Final screen: shows what they learned, the kick line, two knobs, an 'add to my track' key, then 'great, you've added a drum to your track.'",
};
resolveLesson(lesson, { voice, level }).forEach((s, i) => {
  out.push(`\n---\nSCREEN ${i + 1}: ${s.kind.toUpperCase()}${s.title ? " - " + s.title : ""}`);
  out.push(`(What the screen is like: ${UI[s.kind] ?? ""})`);
  if (s.say) out.push(s.say);
  if (s.clip) out.push(`[plays the clip "${s.clip}"]`);
  if (s.q) out.push(`QUESTION: ${s.q}\nOptions: ${s.options.map((o, k) => `${"abcd"[k]}) ${o}`).join("   ")}\nCorrect: ${"abcd"[s.answer]}\nExplanation: ${s.why ?? ""}\n${s.whyWrong ? "Wrong-answer notes: " + JSON.stringify(s.whyWrong) : ""}${s.hint ? "\nHint: " + s.hint : ""}`);
  if (s.deeper?.length) s.deeper.forEach(d => out.push(`DEEPER - ${d.title}: ${d.say}`));
  if (s.kind === "ear") out.push(`[ear rounds: ${s.rounds ?? ""} of a generated pitch comparison]`);
  if (s.hint && s.kind !== "ask") out.push(`Hint line: ${s.hint}`);
  if (s.next) out.push(`NEXT: ${s.next}`);
});
console.log(out.join("\n"));
