import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { parse } from "yaml";
import { CONTROLS, STEPS, elsewhereLine, knobLabel, stepName } from "../src/lib/controlNames";
import { display } from "../src/engine/format";
import {
  BASS_PARAMS, CHORD_PARAMS, DRUM_PAD2_PARAMS, DRUM_PAD_PARAMS, DRUM_RACK_PARAMS, FX_PARAMS, LAYER_PARAMS, LEAD_PARAMS, MASTER_PARAMS, SAMPLER_PARAMS,
} from "../src/engine/params.gen";
import { newLayerV2, emptyTrackV2, paramOf, masterOf, readTrackV2 } from "../src/lib/track2";

const ALL = [...LAYER_PARAMS, ...BASS_PARAMS, ...DRUM_PAD_PARAMS, ...DRUM_RACK_PARAMS, ...DRUM_PAD2_PARAMS, ...CHORD_PARAMS, ...LEAD_PARAMS, ...FX_PARAMS, ...SAMPLER_PARAMS, ...MASTER_PARAMS];
const spec = (id: string) => ALL.find(p => p.id === id)!;

describe("control names (Param, 5 Nov: no invented names)", () => {
  it("every engine label is the label controlNames gives that key", () => {
    for (const p of ALL) {
      const c = CONTROLS[p.key];
      if (c) expect(`${p.id}: ${p.label}`).toBe(`${p.id}: ${c.label}`);
    }
  });

  it("no label or stepped value uses a retired name", () => {
    const old = new Set(Object.values(CONTROLS).flatMap(c => c.was ?? []));
    const shown = new Set([...ALL.map(p => p.label), ...Object.values(STEPS).flat()]);
    for (const w of ["warm", "scream", "smooth", "round", "tight", "body", "snap", "sweep", "wobble", "verb time", "glue mix", "space", "repeats", "filter drive", "character", "ring", "bright", "voice", "pluck", "table", "phase", "clean", "analogue"]) {
      expect(shown.has(w), w).toBe(false);
    }
    for (const w of old) if (w !== "wave") expect(shown.has(w), w).toBe(false);
  });

  it("stepped knobs read the names Live and other instruments print", () => {
    expect(stepName("character", 0)).toBe("prd · ladder");
    expect(stepName("character", 0.5)).toBe("ms2 · sallen-key");
    expect(stepName("lpkind", 1)).toBe("svf · state variable");
    expect(display(spec("drums.pad.shape"), 0.5)).toBe("soft clip");
    expect(display(spec("lead.voice"), 1 / 3)).toBe("plectrum");
    expect(display(spec("lead.osc"), 1)).toBe("phase dist");
    expect(display(spec("master.space"), 0.8)).toBe("plate");
    expect(display(spec("master.echotype"), 0)).toBe("digital · clean repeats");
    expect(display(spec("master.sidechain"), 0)).toBe("off");
    expect(display(spec("sampler.gate"), 1)).toBe("gate");
  });

  it("the shape knob takes the name of the instrument its osc copies", () => {
    const wave = spec("lead.wave");
    expect(knobLabel(wave)).toBe("shape");
    expect(knobLabel(wave, k => (k === "osc" ? 0 : undefined))).toBe("shape");
    expect(knobLabel(wave, k => (k === "osc" ? 1 / 3 : undefined))).toBe("position");
    expect(knobLabel(wave, k => (k === "osc" ? 2 / 3 : undefined))).toBe("feedback");
    expect(knobLabel(spec("bass.wave"), () => undefined)).toBe("shape");
  });

  it("every control we rename teaches where it lives elsewhere", () => {
    for (const [key, c] of Object.entries(CONTROLS)) {
      if (c.was?.length) expect(elsewhereLine(key), key).toBeTruthy();
      for (const [where, name] of c.elsewhere) {
        expect(where).toBe(where.toLowerCase());
        expect(name).toBe(name.toLowerCase());
        expect(`${where} ${name}`).not.toMatch(/—/);
      }
    }
    expect(elsewhereLine("cutoff")).toBe("live auto filter: freq · live drift: freq · tb-303: cut off freq");
  });
});

describe("saved songs from before the rename", () => {
  const store = new Map<string, string>();
  afterEach(() => { vi.unstubAllGlobals(); store.clear(); });

  it("an old save still loads, and shows the new names for the same values", () => {
    // A song as saved before 5 Nov: params by wire index, the bass on scream, the lead's voice on mallet,
    // the kick body on hard, the master on plate with the analogue echo.
    const bass = newLayerV2("bass");
    bass.params = { [spec("bass.character").index]: 0.5 };
    const lead = newLayerV2("lead");
    lead.params = { [spec("lead.voice").index]: 2 / 3, [spec("lead.osc").index]: 1 / 3 };
    const drums = newLayerV2("drums");
    drums.params = { [16 + 80 + spec("drums.pad.shape").index]: 1 };
    const old = { ...emptyTrackV2(), layers: [bass, lead, drums], master: { 5: 1, 7: 1 } };
    store.set("ccd.track.v2", JSON.stringify(old));
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => store.set(k, v), removeItem: (k: string) => store.delete(k) });

    const t = readTrackV2();
    expect(t.layers.map(l => l.type)).toEqual(["bass", "lead", "drums"]);
    const [b, l, d] = t.layers;
    expect(display(spec("bass.character"), paramOf(b, spec("bass.character").index))).toBe("ms2 · sallen-key");
    expect(display(spec("lead.voice"), paramOf(l, spec("lead.voice").index))).toBe("mallet");
    expect(knobLabel(spec("lead.wave"), k => (k === "osc" ? paramOf(l, spec("lead.osc").index) : undefined))).toBe("position");
    expect(display(spec("drums.pad.shape"), paramOf(d, 16 + 80 + spec("drums.pad.shape").index))).toBe("hard clip");
    expect(display(spec("master.space"), masterOf(t, 5))).toBe("plate");
    expect(display(spec("master.echotype"), masterOf(t, 7))).toBe("bbd · bucket brigade");
  });
});

describe("lessons use the names the knobs show", () => {
  const root = join(__dirname, "../src/content/lessons");
  const files = readdirSync(root, { withFileTypes: true }).filter(d => d.isDirectory()).flatMap(d => readdirSync(join(root, d.name)).filter(f => f.endsWith(".yaml")).map(f => join(root, d.name, f)));
  const text = (x: unknown): string => (typeof x === "string" ? x : Array.isArray(x) ? x.map(text).join("\n") : x && typeof x === "object" ? Object.values(x).map(text).join("\n") : "");

  it("no lesson uses a retired control name", () => {
    for (const f of files) {
      const t = text(parse(readFileSync(f, "utf8")));
      expect(t, f).not.toMatch(/\bscream\b|\bcharacter: warm|\bfilter drive\b|\bverb time\b|\bglue mix\b|\bwave knob\b|\b(turn|sweep|swing|try) wave\b/i);
    }
  });

  it("a shape step names its knobs as the knobs show them", () => {
    for (const f of files) {
      const doc = parse(readFileSync(f, "utf8")) as { steps?: { kind: string; knobs?: string[]; say?: unknown }[] };
      for (const s of doc.steps ?? []) {
        if (s.kind !== "shape" || !s.knobs) continue;
        const t = text(s.say);
        if (s.knobs.includes("wave")) {
          expect(t, f).toMatch(/\bshape\b/i);
          expect(t, f).not.toMatch(/^\s*wave\b/im);
        }
        if (s.knobs.includes("character") || s.knobs.includes("lpkind")) {
          expect(t, f).toMatch(/\bcircuit\b/i);
          expect(t, f).not.toMatch(/\bcharacter\b/i);
        }
      }
    }
  });
});
