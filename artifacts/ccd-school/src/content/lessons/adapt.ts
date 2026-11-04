/* Turns a lesson file (resolved for a voice and level) into the Mission the player already understands. Pure. */
import type { LessonScreen, Mission } from "../types";
import type { Lesson } from "./schema";
import { resolveLearn, resolveLesson, voiceText, type ResolveOpts } from "./resolve";
import gen from "./lessons.gen.json";

const KIND_FOR_PART: Record<string, string> = { kick: "kick", hats: "hats", clap: "clap", bass: "bass", chords: "chords", lead: "lead", pad: "pad", perc: "perc" };

export function lessonToMission(lesson: Lesson, opts: ResolveOpts): Mission {
  const steps = resolveLesson(lesson, opts);
  const learn = resolveLearn(lesson, opts.voice);
  const [layer, part = ""] = (lesson.song.adds ?? lesson.song.changes ?? "drums.kick").split(".");
  const screens: LessonScreen[] = [{ kind: "hook", emoji: "", headline: lesson.title, subtext: learn.split(/(?<=[.!?])\s/)[0] ?? learn }];
  const learned: string[] = [];
  let next = "";
  for (const s of steps) {
    switch (s.kind) {
      case "hear": screens.push({ kind: "hear", clip: s.clip, body: s.say }); break;
      case "say":
        screens.push({ kind: "say", title: s.title, body: s.say, deeper: s.deeper.map(d => ({ title: d.title, body: d.say })) });
        learned.push(s.title);
        break;
      case "play": screens.push({ kind: "play", layer: s.layer, goal: { notes: s.goal.notes ?? 1, note: s.goal.note }, body: s.say, hint: s.hint }); break;
      case "shape": screens.push({ kind: "shape", layer: s.layer, knobs: s.knobs, body: s.say, hint: s.hint }); break;
      case "ask": screens.push({ kind: "quiz", q: s.q, options: s.options, answer: s.answer, explain: s.why, hint: s.hint, whyWrong: s.whyWrong }); break;
      case "ear": screens.push({ kind: "ear", drill: s.drill, rounds: s.rounds, body: s.say }); break;
      case "keep": next = s.next; break;
    }
  }
  screens.push({ kind: "summary", learned: [...learned, next].filter(Boolean) });
  return {
    slug: lesson.slug, world: lesson.world as Mission["world"], number: lesson.number, title: lesson.title,
    tagline: learn.split(/(?<=[.!?])\s/)[0] ?? learn, xp: 50, explainer: [], sim: { type: "none" as never }, quiz: [], screens,
    fromFile: { adds: { layer, kind: KIND_FOR_PART[part] ?? "kick", part }, learn, why: typeof lesson.song.why === "string" ? lesson.song.why : lesson.song.why ? voiceText(lesson.song.why, opts.voice) : "", minutes: lesson.minutes ?? 8 },
  };
}

const LESSONS = (gen as { lessons: Lesson[] }).lessons;
export const FILE_LESSONS = LESSONS;
export const fileLesson = (slug: string) => LESSONS.find(l => l.slug === slug);
/** Stub missions in the default voice so the world, paths and tests see the lessons. */
export const fileMissions = (): Mission[] => LESSONS.map(l => lessonToMission(l, { voice: "mentor", level: "standard" }));
