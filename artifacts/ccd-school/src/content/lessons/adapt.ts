/* Turns a lesson file (resolved for a voice and level) into the Mission the player already understands. Pure. */
import type { LessonScreen, Mission } from "../types";
import type { Lesson } from "./schema";
import { resolveLearn, resolveLesson, voiceText, type ResolveOpts } from "./resolve";
import gen from "./lessons.gen.json";

const KIND_FOR_PART: Record<string, string> = { kick: "kick", hats: "hats", clap: "clap", bass: "bass", chords: "chords", lead: "lead", pad: "pad", perc: "perc" };

const TOOL_LEARNED: Record<string, string> = {
  arp: "turning chords into an arpeggio", key: "moving your song to a new key", grid: "editing notes on the grid",
  mic: "recording your own sound", comp: "comping the best take", sample: "shaping a sample", macro: "one knob that moves several",
  chords: "writing a chord track", player: "letting a session player write a part", chance: "chance and trig conditions on steps",
  length: "a part with its own length and swing", commit: "committing a loop to a new section",
};

export function lessonToMission(lesson: Lesson, opts: ResolveOpts): Mission {
  const steps = resolveLesson(lesson, opts);
  const learn = resolveLearn(lesson, opts.voice);
  const [layer, part = ""] = (lesson.song.adds ?? lesson.song.changes ?? "drums.kick").split(".");
  const screens: LessonScreen[] = [{ kind: "hook", emoji: "", headline: lesson.title, subtext: learn.split(/(?<=[.!?])\s/)[0] ?? learn }];
  const learned: string[] = [];
  let next = "";
  for (const s of steps) {
    switch (s.kind) {
      case "hear": screens.push({ kind: "hear", clip: s.clip, body: s.say, ...(s.deeper.length ? { deeper: s.deeper.map(d => ({ title: d.title, body: d.say })) } : {}) }); break;
      case "say":
        screens.push({ kind: "say", title: s.title, body: s.say, ...(s.clip ? { clip: s.clip } : {}), deeper: s.deeper.map(d => ({ title: d.title, body: d.say })) });
        learned.push(s.title);
        break;
      case "play": screens.push({ kind: "play", layer: s.layer, goal: { notes: s.goal.notes ?? 1, note: s.goal.note, ...(s.goal.on ? { on: s.goal.on } : {}) }, body: s.say, hint: s.hint, ...(s.snap ? { snap: true } : {}) }); break;
      case "shape": learned.push(`shaping it with ${s.knobs.join(" and ")}`); screens.push({ kind: "shape", layer: s.layer, knobs: s.knobs, body: s.say, hint: s.hint }); break;
      case "match": learned.push(`matching a sound by ear with ${s.knobs.join(" and ")}`); screens.push({ kind: "matchsound", layer: s.layer, knobs: s.knobs, target: s.target, level: s.level, body: s.say, hint: s.hint }); break;
      case "copy": learned.push(s.layer === "drums" ? "copying a drum pattern by ear" : s.layer === "chords" ? "copying chords by ear" : `copying a ${s.layer === "bass" ? "bass line" : "melody"} by ear`); screens.push({ kind: "copy", layer: s.layer, pattern: s.pattern, level: s.level, body: s.say, hint: s.hint }); break;
      case "ask": screens.push({ kind: "quiz", q: s.q, options: s.options, answer: s.answer, explain: s.why, hint: s.hint, whyWrong: s.whyWrong, ...(s.more ? { more: true } : {}), ...(s.ear ? { ear: s.ear } : {}) }); break;
      case "ear": screens.push({ kind: "ear", drill: s.drill, rounds: s.rounds, body: s.say }); break;
      case "arrange": learned.push(s.goal === "export" ? "finishing and exporting your song" : s.goal === "fills" ? "adding fills" : s.goal === "risers" ? "building risers" : s.goal === "drop" ? "building a breakdown and a drop" : "arranging your song into sections"); screens.push({ kind: "arrange", body: s.say, goal: s.goal, hint: s.hint }); break;
      case "mix": learned.push(s.goal === "match" ? "matching two tracks by ear" : s.goal === "blend" ? "blending two tracks" : "using the mixer"); screens.push({ kind: "mix", body: s.say, goal: s.goal, bank: s.bank, hint: s.hint }); break;
      case "tempo": learned.push(TOOL_LEARNED[s.set] ?? (s.set === "kit" ? "swapping in a recorded kit" : s.set === "glue" ? "gluing your mix" : s.set === "swing" ? "swinging your groove" : s.set === "scale" ? "choosing your song's scale" : "setting your song's tempo")); screens.push({ kind: "tempo", body: s.say, marks: s.marks, set: s.set, choices: s.choices, layer: s.layer, hint: s.hint }); break;
      case "keep": next = s.next; break;
    }
  }
  screens.push({ kind: "summary", learned: [...learned, next].filter(Boolean) });
  return {
    slug: lesson.slug, world: lesson.world as Mission["world"], number: lesson.number, title: lesson.title,
    tagline: learn.split(/(?<=[.!?])\s/)[0] ?? learn, xp: 50, explainer: [], sim: { type: "none" as never }, quiz: [], screens,
    fromFile: { adds: { layer, kind: KIND_FOR_PART[part] ?? "kick", part }, learn, why: typeof lesson.song.why === "string" ? lesson.song.why : lesson.song.why ? voiceText(lesson.song.why, opts.voice) : "", minutes: lesson.minutes ?? 8, items: lesson.youCan?.length ? lesson.youCan.slice() : learned.slice(), next },
  };
}

const LESSONS = (gen as { lessons: Lesson[] }).lessons;
export const FILE_LESSONS = LESSONS;
export const fileLesson = (slug: string) => LESSONS.find(l => l.slug === slug);
/** Stub missions in the default voice so the world, paths and tests see the lessons. */
export const fileMissions = (): Mission[] => LESSONS.map(l => lessonToMission(l, { voice: "mentor", level: "standard" }));
