import { parse } from "yaml";
import * as P from "../../engine/params.gen";
import type { LayerType } from "../../lib/track2";
import { CLIP_IDS } from "./clips";
import { SCALES } from "../../lib/theory";
import { DRILLS, LAYERS, LEVELS, STEP_KINDS, SURFACES, VOICES, type Lesson } from "./schema";

export { resolveLesson, resolveLearn } from "./resolve";

export class LessonError extends Error {
  constructor(public file: string, public problems: string[]) {
    super(problems.join("\n"));
    this.name = "LessonError";
  }
}

const LAYER_KEYS = P.LAYER_PARAMS.map((p) => p.key as string);
const ENGINE_KEYS: Record<LayerType, string[]> = {
  drums: [...P.DRUM_PAD_PARAMS, ...P.DRUM_RACK_PARAMS].map((p) => p.key),
  hats: [...P.DRUM_PAD_PARAMS, ...P.DRUM_RACK_PARAMS].map((p) => p.key),
  bass: P.BASS_PARAMS.map((p) => p.key),
  chords: P.CHORD_PARAMS.map((p) => p.key),
  lead: P.LEAD_PARAMS.map((p) => p.key),
  fx: P.FX_PARAMS.map((p) => p.key),
  sample: P.SAMPLER_PARAMS.map((p) => p.key),
};

/** Knob keys a `shape` step may name for a layer: the layer-wide eq/fx/mix knobs plus its own instrument knobs. */
export function knobsFor(layer: LayerType): string[] {
  return [...new Set([...ENGINE_KEYS[layer], ...LAYER_KEYS])];
}

/** What a `tempo` step can set: song-wide settings and the tools that act on your parts. */
export const TEMPO_SETS = ["tempo", "swing", "scale", "glue", "kit", "arp", "key", "grid", "mic", "comp", "sample", "macro"];

/** What a `mix` step asks for on the two decks. */
export const MIX_GOALS = ["crossfade", "match", "blend", "swap", "key", "cut", "phrase", "echo", "free", "sync", "cue", "loop", "stems", "shift", "curve", "file", "record", "punch"];

const EM_DASH = /—/;
const EMOJI = /\p{Extended_Pictographic}/u;
type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);

const STEP_FIELDS: Record<string, string[]> = {
  hear: ["kind", "clip", "say", "deeper", "levels"],
  say: ["kind", "title", "say", "clip", "deeper", "hint", "levels"],
  play: ["kind", "layer", "surface", "goal", "say", "hint", "levels", "snap"],
  shape: ["kind", "layer", "knobs", "say", "hint", "levels"],
  match: ["kind", "layer", "knobs", "target", "say", "hint", "levels"],
  tempo: ["kind", "say", "marks", "set", "choices", "layer", "hint", "levels"],
  mix: ["kind", "say", "goal", "bank", "hint", "levels"],
  arrange: ["kind", "say", "goal", "hint", "levels"],
  ask: ["kind", "q", "options", "answer", "why", "whyWrong", "hint", "more", "levels"],
  ear: ["kind", "drill", "rounds", "say", "hint", "levels"],
  keep: ["kind", "next", "levels"],
};
const TOP_FIELDS = ["slug", "world", "number", "title", "minutes", "song", "learn", "steps", "youCan"];

function sentenceCase(s: string): boolean {
  return !s
    .split(/\s+/)
    .slice(1)
    .some((w) => /^[A-Z][a-z]/.test(w));
}

export function parseLesson(yamlText: string, fileName: string): Lesson {
  const problems: string[] = [];
  const top = (m: string) => problems.push(`${fileName}: ${m}`);
  let doc: unknown;
  try {
    doc = parse(yamlText);
  } catch (e) {
    throw new LessonError(fileName, [`${fileName}: invalid yaml (${(e as Error).message.split("\n")[0]})`]);
  }
  if (!isObj(doc)) throw new LessonError(fileName, [`${fileName}: file must be a yaml mapping`]);

  // --- generic checkers; `where` is "" for top level or "step N" ---
  const at = (where: string, m: string) => problems.push(where ? `${fileName}: ${where}: ${m}` : `${fileName}: ${m}`);
  const plain = (where: string, field: string, v: unknown) => {
    if (typeof v !== "string" || !v.trim()) return at(where, `${field} must be a non-empty string`), false;
    if (EM_DASH.test(v)) at(where, `${field} has an em dash, rewrite the sentence`);
    if (EMOJI.test(v)) at(where, `${field} has an emoji`);
    return true;
  };
  const voice = (where: string, field: string, v: unknown, required = true) => {
    if (v === undefined && !required) return;
    if (typeof v === "string") return void plain(where, field, v);
    if (!isObj(v)) return at(where, `${field} must be a string or an object with mentor/straight/eli5`);
    if (v.mentor === undefined) at(where, `${field} is missing the mentor voice`);
    for (const k of Object.keys(v)) {
      if (!(VOICES as readonly string[]).includes(k)) at(where, `${field} has unknown voice "${k}"`);
      else plain(where, `${field}.${k}`, v[k]);
    }
  };
  const title = (where: string, field: string, v: unknown) => {
    if (plain(where, field, v) && !sentenceCase(v as string)) at(where, `${field} "${v}" is not sentence case`);
  };
  const levels = (where: string, v: unknown) => {
    if (v === undefined) return;
    if (!Array.isArray(v) || v.length === 0 || v.some((l) => !(LEVELS as readonly string[]).includes(l))) at(where, `levels must be a non-empty list of gentle, standard, hard`);
  };
  const layer = (where: string, v: unknown): v is LayerType => {
    if (!(LAYERS as readonly unknown[]).includes(v)) return at(where, `layer "${String(v)}" is not one of ${LAYERS.join(", ")}`), false;
    return true;
  };
  const posInt = (v: unknown) => typeof v === "number" && Number.isInteger(v) && v > 0;
  const deeperOf = (where: string, deeper: unknown, playOrShape: (w: string, o: Obj) => void) => {
      if (deeper !== undefined) {
        if (!Array.isArray(deeper)) at(where, "deeper must be a list");
        else
          deeper.forEach((d, di) => {
            const dw = `${where} (deeper ${di + 1})`;
            if (!isObj(d)) return at(dw, "must be a mapping");
            unknownKeys(dw, d, ["title", "say", "try"]);
            title(dw, "title", d.title);
            voice(dw, "say", d.say);
            if (d.try !== undefined) {
              if (!isObj(d.try) || (d.try.kind !== "play" && d.try.kind !== "shape")) return at(dw, "try must be a play or shape step");
              unknownKeys(dw, d.try, STEP_FIELDS[d.try.kind]);
              if (d.try.hint !== undefined) voice(dw, "hint", d.try.hint);
              playOrShape(dw, d.try);
            }
          });
      }
  };
  const unknownKeys = (where: string, o: Obj, allowed: string[]) => {
    for (const k of Object.keys(o)) if (!allowed.includes(k)) at(where, `unknown field "${k}"`);
  };

  // --- top level ---
  unknownKeys("", doc, TOP_FIELDS);
  if (doc.youCan !== undefined && (!Array.isArray(doc.youCan) || doc.youCan.some((x) => typeof x !== "string" || !x.trim()))) top("youCan must be a list of short lines");
  if (typeof doc.slug !== "string" || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(doc.slug)) top("slug must be lowercase words joined by hyphens");
  if (typeof doc.world !== "string" || !/^[a-z0-9-]+$/.test(doc.world)) top("world must be a lowercase folder name");
  if (!posInt(doc.number)) top("number must be a positive integer");
  title("", "title", doc.title);
  if (typeof doc.minutes !== "number" || doc.minutes <= 0) top("minutes must be a positive number");
  const m = /^(\d+)-(.+)\.ya?ml$/.exec(fileName.split("/").pop() ?? "");
  if (m) {
    if (Number(m[1]) !== doc.number) top(`number ${String(doc.number)} does not match the file name prefix ${m[1]}`);
    if (m[2] !== doc.slug) top(`slug "${String(doc.slug)}" does not match the file name "${m[2]}"`);
  }
  voice("", "learn", doc.learn);

  // song change: exactly one of adds / changes, shaped <layer>.<part>
  let songLayer: LayerType | undefined;
  let songChanges = false;
  if (!isObj(doc.song)) top("song is required: say what this lesson adds or changes in the learner's song");
  else {
    const s = doc.song;
    unknownKeys("song", s, ["adds", "changes", "why"]);
    const key = s.adds !== undefined ? "adds" : s.changes !== undefined ? "changes" : undefined;
    if (!key || (s.adds !== undefined && s.changes !== undefined)) top("song needs exactly one of adds or changes (missing song change)");
    else {
      const v = s[key];
      const mm = typeof v === "string" ? /^([a-z]+)\.([a-z0-9-]+)$/.exec(v) : null;
      if (!mm || !(LAYERS as readonly string[]).includes(mm[1])) top(`song.${key} must look like <layer>.<part> with layer one of ${LAYERS.join(", ")}`);
      else {
        songLayer = mm[1] as LayerType;
        songChanges = key === "changes";
      }
    }
    voice("song", "why", s.why);
  }

  // --- steps ---
  const steps = doc.steps;
  if (!Array.isArray(steps) || steps.length === 0) top("steps must be a non-empty list");
  else {
    steps.forEach((raw, idx) => {
      const where = `step ${idx + 1}`;
      if (!isObj(raw)) return at(where, "must be a mapping");
      const kind = raw.kind;
      if (typeof kind !== "string" || !(STEP_KINDS as readonly string[]).includes(kind)) return at(where, `unknown step kind "${String(kind)}", use one of ${STEP_KINDS.join(", ")}`);
      unknownKeys(where, raw, STEP_FIELDS[kind]);
      levels(where, raw.levels);
      if (raw.hint !== undefined) voice(where, "hint", raw.hint);

      const playOrShape = (w: string, o: Obj) => {
        if (!layer(w, o.layer)) return;
        if (o.kind === "play") {
          if (songLayer && !songChanges && o.layer !== songLayer) at(w, `play layer "${o.layer}" must match song.adds layer "${songLayer}" (or use song.changes)`);
          if (!(SURFACES as readonly unknown[]).includes(o.surface)) at(w, `surface must be one of ${SURFACES.join(", ")}`);
          if (!isObj(o.goal) || !posInt(o.goal.notes) || (o.goal.note !== undefined && typeof o.goal.note !== "string") || (o.goal.on !== undefined && !["beat", "and", "backbeat"].includes(String(o.goal.on)))) at(w, "goal must look like {notes: <count>, note: <name>, on: beat|and|backbeat}");
        } else {
          const ks = o.knobs;
          if (!Array.isArray(ks) || ks.length < 1 || ks.length > 4) return at(w, "knobs must list one to four knobs");
          const ok = knobsFor(o.layer);
          for (const k of ks) if (!ok.includes(k as string)) at(w, `knob "${String(k)}" does not exist for ${o.layer}, use one of ${ok.join(", ")}`);
        }
        voice(w, "say", o.say);
      };

      switch (kind) {
        case "hear":
          if (typeof raw.clip !== "string" || !CLIP_IDS.has(raw.clip)) at(where, `clip "${String(raw.clip)}" is not in clips.ts (known: ${[...CLIP_IDS].join(", ")})`);
          voice(where, "say", raw.say);
          deeperOf(where, raw.deeper, playOrShape);
          break;
        case "say":
          if (raw.clip !== undefined && (typeof raw.clip !== "string" || !CLIP_IDS.has(raw.clip))) at(where, `clip "${String(raw.clip)}" is not in clips.ts`);
          title(where, "title", raw.title);
          voice(where, "say", raw.say);
          deeperOf(where, raw.deeper, playOrShape);
          break;
        case "play":
        case "shape":
          playOrShape(where, raw);
          break;
        case "match": {
          // The same knobs a shape step may name, each with a hidden target value the learner matches by ear.
          if (!layer(where, raw.layer)) break;
          const ks = raw.knobs;
          const ok = knobsFor(raw.layer);
          if (!Array.isArray(ks) || ks.length < 1 || ks.length > 4) at(where, "knobs must list one to four knobs");
          else for (const k of ks) if (!ok.includes(k as string)) at(where, `knob "${String(k)}" does not exist for ${raw.layer}, use one of ${ok.join(", ")}`);
          const tg = raw.target;
          if (!isObj(tg)) at(where, "target must map each knob to its hidden value, 0 to 1");
          else if (Array.isArray(ks)) {
            for (const k of ks) if (typeof tg[k as string] !== "number" || (tg[k as string] as number) < 0 || (tg[k as string] as number) > 1) at(where, `target.${String(k)} must be a number from 0 to 1`);
            for (const k of Object.keys(tg)) if (!ks.includes(k)) at(where, `target.${k} is not one of the step's knobs`);
          }
          voice(where, "say", raw.say);
          break;
        }
        case "arrange":
          voice(where, "say", raw.say);
          if (!["sections", "drop", "fills", "risers", "export"].includes(String(raw.goal))) at(where, "goal must be sections, drop, fills, risers or export");
          break;
        case "mix":
          voice(where, "say", raw.say);
          if (!MIX_GOALS.includes(String(raw.goal))) at(where, `goal must be one of ${MIX_GOALS.join(", ")}`);
          break;
        case "tempo":
          voice(where, "say", raw.say);
          if (raw.set !== undefined && !TEMPO_SETS.includes(raw.set as string)) at(where, `set must be one of ${TEMPO_SETS.join(", ")}`);
          if (raw.layer !== undefined && !["bass", "chords", "lead", "drums", "hats"].includes(raw.layer as string)) at(where, "layer must be bass, chords, lead, drums or hats");
          if (raw.set === "sample" && raw.choices !== undefined && (!Array.isArray(raw.choices) || raw.choices.length !== 1 || !["hit", "slice", "warp"].includes(String(raw.choices[0])))) at(where, "a sample step's choices names one job: hit, slice or warp");
          if (raw.set !== "sample" && raw.choices !== undefined && (!Array.isArray(raw.choices) || raw.choices.some((c: unknown) => typeof c !== "string" || !(c in SCALES)))) at(where, "choices must be Live 12 scale names (src/lib/theory.ts), lowercase");
          if (raw.marks !== undefined && (!Array.isArray(raw.marks) || raw.marks.some((m: unknown) => typeof m !== "number" || (raw.set === "swing" || raw.set === "glue" ? m < 0 || m > 1 : m < 60 || m > 180)))) at(where, raw.set === "swing" ? "swing marks are between 0 and 0.75" : "marks must be a list of tempos between 60 and 180");
          break;
        case "ask": {
          voice(where, "q", raw.q);
          voice(where, "why", raw.why);
          const opts = raw.options;
          if (!Array.isArray(opts) || opts.length < 2) at(where, "options must list at least two answers");
          else {
            opts.forEach((o) => plain(where, "option", o));
            if (new Set(opts).size !== opts.length) at(where, "options must be unique");
            const a = raw.answer;
            if (typeof a !== "number" || !Number.isInteger(a) || a < 0 || a >= opts.length) at(where, `answer ${String(a)} is not a valid index into ${opts.length} options`);
            else if (raw.whyWrong !== undefined) {
              if (!isObj(raw.whyWrong)) at(where, "whyWrong must map option index to text");
              else
                for (const [k, v] of Object.entries(raw.whyWrong)) {
                  const ki = Number(k);
                  if (!Number.isInteger(ki) || ki < 0 || ki >= opts.length || ki === a) at(where, `whyWrong key ${k} must be a wrong option index`);
                  voice(where, `whyWrong.${k}`, v);
                }
            }
          }
          if (raw.more !== undefined && typeof raw.more !== "boolean") at(where, "more must be true or false");
          break;
        }
        case "ear": {
          if (!(DRILLS as readonly unknown[]).includes(raw.drill)) at(where, `drill must be one of ${DRILLS.join(", ")}`);
          const r = raw.rounds;
          if (isObj(r) && posInt(r.gentle) && posInt(r.standard) && posInt(r.hard)) {
            if (!((r.gentle as number) <= (r.standard as number) && (r.standard as number) <= (r.hard as number))) at(where, "rounds must not shrink from gentle to hard");
          } else if (!posInt(r)) at(where, "rounds must be a count or {gentle, standard, hard} counts");
          if (raw.say !== undefined) voice(where, "say", raw.say);
          break;
        }
        case "keep":
          voice(where, "next", raw.next);
          if (idx !== steps.length - 1) at(where, "keep must be the last step");
          break;
      }
    });
    const last = steps[steps.length - 1];
    if (!isObj(last) || last.kind !== "keep") top(`step ${steps.length}: the last step must be keep`);
    if (steps.filter((s) => isObj(s) && s.kind === "keep").length > 1) top("only one keep step is allowed");
  }

  if (problems.length) throw new LessonError(fileName, problems);
  return { ...(doc as unknown as Lesson), file: fileName };
}
