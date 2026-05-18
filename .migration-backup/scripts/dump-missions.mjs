import { LESSONS } from "../src/content/lesson-deep.ts";
import { MISSIONS } from "../src/content/missions.ts";
const need = MISSIONS.filter(m => !LESSONS[m.slug]?.advanced?.engineerNotes?.length);
const out = need.map(m => {
  const d = LESSONS[m.slug];
  return { slug: m.slug, title: m.title, tagline: m.tagline, advanced: d?.advanced?.what?.join(" ") ?? "" };
});
console.log(JSON.stringify(out, null, 2));
