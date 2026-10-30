import { describe, it, expect } from "vitest";
import { ATLAS, ATLAS_GROUPS, atlasById, atlasIdForXml } from "../src/content/atlas";
import { PLUGIN_JOBS } from "../src/content/plugins";
import { SETUP } from "../src/content/setup";
import { BUILD_STAGES } from "../src/content/build";
import { checkMissions, type SetState } from "../src/lib/setstate";

describe("content integrity", () => {
  it("atlas ids and xml names are unique", () => {
    const ids = ATLAS.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
    const xml = ATLAS.flatMap((d) => d.xml);
    expect(new Set(xml).size).toBe(xml.length);
  });
  it("every atlas entry is complete and in a known group", () => {
    const groups = new Set(ATLAS_GROUPS.map((g) => g.id));
    for (const d of ATLAS) {
      expect(groups.has(d.group), d.id).toBe(true);
      expect(d.name.trim().length, d.id).toBeGreaterThan(2);
      for (const f of [d.does, d.reach, d.tip]) expect(f.trim().length, d.id).toBeGreaterThan(8);
      expect(JSON.stringify(d), d.id).not.toMatch(/—/); // no em dashes in copy
    }
  });
  it("every device seen in real Sets resolves to an atlas entry", () => {
    const seen = ["Reverb","Echo","Delay","Limiter","FilterEQ3","Eq8","InstrumentVector","InstrumentImpulse","DrumGroupDevice","BeatRepeat","Saturator","Redux2","Vocoder","Transmute","Roar","OriginalSimpler","Resonator","Looper","Vinyl","Drift","Operator","MxDeviceMidiEffect","InstrumentGroupDevice","Compressor2","AudioEffectGroupDevice","Overdrive","InstrumentMeld","MxDeviceAudioEffect","Chorus2","FilterDelay","AutoFilter"];
    for (const x of seen) expect(atlasIdForXml(x), x).toBeTruthy();
  });
  it("plugin jobs only point at real atlas entries", () => {
    for (const j of PLUGIN_JOBS) {
      for (const id of j.stock) expect(atlasById(id), `${j.id}:${id}`).toBeTruthy();
      expect(j.picks.length + j.stock.length).toBeGreaterThan(0);
    }
  });
  it("setup steps and build stages have unique ids and no em dashes", () => {
    const ids = SETUP.flatMap((s) => s.steps.map((x) => x.id));
    expect(new Set(ids).size).toBe(ids.length);
    const bids = BUILD_STAGES.map((b) => b.id);
    expect(new Set(bids).size).toBe(bids.length);
    expect(JSON.stringify([SETUP, BUILD_STAGES, PLUGIN_JOBS])).not.toMatch(/—/);
    for (const b of BUILD_STAGES) for (const id of b.learn) expect(atlasById(id), b.id).toBeTruthy();
  });
});

const trk = (o: Partial<SetState["tracks"][number]>) => ({
  id: "1", name: "x", kind: "midi" as const, devices: [], clips: [],
  mixer: { volumeDb: 0, pan: 0, sendsDb: [], muted: false },
  routing: { sidechainSources: [] }, automation: [], ...o,
});
const dev = (className: string) => ({ name: className, className, params: {} });
const notes = (n: number) => ({ name: "c", view: "session" as const, kind: "midi" as const, lengthBeats: 4, notes: Array.from({ length: n }, (_, i) => ({ pitch: 36, start: i, dur: 0.5, vel: 100 })) });
const stages = BUILD_STAGES.map((b) => ({ id: b.id, title: b.title, why: b.why, checks: b.checks }));
const run = (s: SetState) => Object.fromEntries(checkMissions(stages, s).map((m) => [m.id, m.passed]));

describe("build stages", () => {
  const base: SetState = { source: "upload", liveVersion: "12", tempo: 120, timeSignature: [4, 4], tracks: [], returns: [], master: trk({ kind: "master" }), warnings: [] };
  it("tempo stage rejects the default 120", () => {
    expect(run(base).tempo).toBe(false);
    expect(run({ ...base, tempo: 124 }).tempo).toBe(true);
    expect(run({ ...base, tempo: 120.2 }).tempo).toBe(false);
  });
  it("drum stage needs the rack AND notes on the same track", () => {
    const rackOnly = { ...base, tracks: [trk({ devices: [dev("DrumGroupDevice")] }), trk({ clips: [notes(20)] })] };
    expect(run(rackOnly).drums).toBe(false);
    const ok = { ...base, tracks: [trk({ devices: [dev("DrumGroupDevice")], clips: [notes(16)] })] };
    expect(run(ok).drums).toBe(true);
  });
  it("bass stage accepts a synth with notes, not a drum rack", () => {
    expect(run({ ...base, tracks: [trk({ devices: [dev("DrumGroupDevice")], clips: [notes(8)] })] }).bass).toBe(false);
    expect(run({ ...base, tracks: [trk({ devices: [dev("Drift")], clips: [notes(8)] })] }).bass).toBe(true);
  });
  it("arrangement stage measures the end of the last arrangement clip", () => {
    const clip = (start: number, len: number) => ({ name: "a", view: "arrangement" as const, kind: "audio" as const, startBeat: start, lengthBeats: len });
    expect(run({ ...base, tracks: [trk({ clips: [clip(0, 32)] })] }).arrange).toBe(false);
    expect(run({ ...base, tracks: [trk({ clips: [clip(0, 32), clip(40, 32)] })] }).arrange).toBe(true);
  });
  it("master stage looks at the main track only", () => {
    expect(run({ ...base, tracks: [trk({ devices: [dev("Limiter")] })] }).master).toBe(false);
    expect(run({ ...base, master: trk({ kind: "master", devices: [dev("Limiter")] }) }).master).toBe(true);
  });
});
