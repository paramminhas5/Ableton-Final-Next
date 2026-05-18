import { LESSONS } from "./src/content/lesson-deep.ts";
import { MISSIONS } from "./src/content/missions.ts";
const rows = MISSIONS.map(m => {
  const d = LESSONS[m.slug] || {};
  return {
    slug: m.slug,
    world: m.world,
    beginner: !!(d.beginner?.what?.length),
    why: !!(d.beginner?.why?.length),
    analogy: !!d.beginner?.analogy,
    advanced: !!(d.advanced?.what?.length),
    edge: !!(d.advanced?.edgeCases?.length),
    notes: !!(d.advanced?.engineerNotes?.length),
    walk: !!(d.walkthrough?.length),
    listen: !!(d.listenFor?.length),
    flow: !!d.flow,
    qE: !!(d.quizEasy?.length),
    qH: !!(d.quizHard?.length),
    src: !!(d.sources?.length),
  };
});
const miss = rows.filter(r => !(r.beginner && r.why && r.analogy && r.advanced && r.edge && r.notes && r.walk && r.listen && r.flow && r.qE && r.qH && r.src));
console.log("Total missions:", rows.length, "with gaps:", miss.length);
console.table(miss.map(r => ({slug:r.slug, b:r.beginner?'.':'B', w:r.why?'.':'W', a:r.analogy?'.':'A', adv:r.advanced?'.':'V', e:r.edge?'.':'E', n:r.notes?'.':'N', wk:r.walk?'.':'K', l:r.listen?'.':'L', f:r.flow?'.':'F', qe:r.qE?'.':'e', qh:r.qH?'.':'h', s:r.src?'.':'s'})));
