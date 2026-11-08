// Questions answered by ear, measured: every sound of every by-ear question is rendered through the real engine
// (WebAssembly, as the app hears it) from a small song, and each pair of sounds in a question must differ by
// more than a just-noticeable amount, by spectrum or by level over time (src/lib/matchScore.ts distances).
// A question whose sounds can't be told apart can't be answered by ear.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { Engine } from "../src/engine";
import { syncEngine } from "../src/components/m1/useEngineTrack";
import { OfflineHost, type Wasm } from "../src/lib/bounce";
import { features, mono, type Features } from "../src/lib/matchScore";
import { earTrack } from "../src/lib/askEar";
import { parsePattern } from "../src/lib/copyEar";
import { emptyTrackV2, newLayerV2, type TrackV2 } from "../src/lib/track2";
import { FILE_LESSONS, lessonToMission } from "../src/content/lessons/adapt";

const bytes = readFileSync(join(__dirname, "../public/engine/ccd_engine.wasm"));
const SR = 48_000;
let mod: WebAssembly.Module | null = null;

/** The whole track (every layer the sound kept) for one loop plus a short tail. */
async function render(t: TrackV2) {
  mod ??= await WebAssembly.compile(bytes);
  const inst = await WebAssembly.instantiate(mod, {});
  const x = inst.exports as unknown as Wasm;
  const e = x.ccd_engine_new(SR);
  try {
    const engine = new Engine(new OfflineHost(x, e));
    syncEngine(engine, t, [], { bpm: 0, loop: 0, samples: new Set() });
    engine.play();
    const frames = Math.ceil(((t.loop * 60) / t.bpm + 0.3) * SR);
    const out = new Float32Array(frames), r = new Float32Array(frames);
    for (let done = 0; done < frames; done += 512) {
      const n = Math.min(512, frames - done);
      x.ccd_process(e, n);
      out.set(new Float32Array(x.memory.buffer, x.ccd_out_left(e), n), done);
      r.set(new Float32Array(x.memory.buffer, x.ccd_out_right(e), n), done);
    }
    return features(mono(out, r), SR);
  } finally {
    x.ccd_engine_free(e);
  }
}

/** A learner's song by the end of basics: kick and clap, hats, a bass between the kicks, chords and a lead, in a minor. */
function song(): TrackV2 {
  const p = (layer: "bass" | "chords" | "lead", s: string) => parsePattern(layer, s, 45, "minor").events;
  return {
    ...emptyTrackV2(),
    layers: [
      { ...newLayerV2("drums", "d"), events: parsePattern("drums", { kick: "x...x...x...x...", clap: "....x.......x..." }, 45, "minor").events },
      { ...newLayerV2("hats", "h"), events: parsePattern("drums", { hat: "..x...x...x...x." }, 45, "minor").events },
      { ...newLayerV2("bass", "b"), events: p("bass", ". . 1 . . . 1 . . . 6, . . . 7, .") },
      { ...newLayerV2("chords", "c"), events: p("chords", "1+3+5 - - - - - - - 6,+1+3 - - - - - - -") },
      { ...newLayerV2("lead", "l"), events: p("lead", "5 - 3 - 1 - . . 2 - 3 - 5 - . .") },
    ],
  };
}

/**
 * How far apart two renders are, in dB: the biggest difference in any third-octave band that matters (within
 * 50 dB of the loudest), and the 90th percentile of the frame-by-frame level difference (10 ms frames), so a
 * clap on two beats of a bar counts even though most frames are the same.
 */
function apart(a: Features, b: Features) {
  const top = Math.max(...a.bands, ...b.bands);
  let spec = 0;
  for (let i = 0; i < a.bands.length; i++) if (Math.max(a.bands[i], b.bands[i]) >= top - 50) spec = Math.max(spec, Math.abs(a.bands[i] - b.bands[i]));
  const n = Math.min(a.env.length, b.env.length);
  const d: number[] = [];
  for (let f = 0; f < n; f++) if (a.env[f] > -59.9 || b.env[f] > -59.9) d.push(Math.min(40, Math.abs(a.env[f] - b.env[f])));
  d.sort((x, y) => x - y);
  return { spec, env: d.length ? d[Math.floor(d.length * 0.9)] : 0 };
}
/** Just noticeable: about 1 dB in a band or in the level of a tenth of the frames. */
const JND_DB = 1;
/** Questions where two sounds being the same is the answer ("nothing changes, swing needs sixteenths"). */
const SAME_ON_PURPOSE = ["groove-feel: Your hats on the eighths only"];

describe("asks answered by ear, rendered", () => {
  it("every pair of sounds in a question differs by more than a decibel or so", async () => {
    const base = song();
    const rows: { slug: string; q: string; spec: number; env: number }[] = [];
    for (const l of FILE_LESSONS) {
      const m = lessonToMission(l, { voice: "mentor", level: "standard" });
      for (const s of m.screens ?? []) {
        if (s.kind !== "quiz" || !s.ear) continue;
        const sounds = [...(s.ear.play ?? []), ...(s.ear.sounds ?? [])];
        if (sounds.length < 2) continue;
        const tracks = sounds.map(snd => earTrack(base, snd, { part: s.ear!.part, with: s.ear!.with }));
        const feats = await Promise.all(tracks.map(render));
        // Notes at the same times but other pitches (a scale heard major then minor): a semitone is far past what
        // an ear can tell apart (about 5 cents), even when one note in eight barely moves a third-octave band.
        const when = (t: TrackV2) => JSON.stringify(t.layers.flatMap(l => l.events.map(e => `${l.type}@${e.start.toFixed(3)}`)).sort());
        const what = (t: TrackV2) => JSON.stringify(t.layers.flatMap(l => l.events.map(e => `${l.type}@${e.start.toFixed(3)}:${e.note}`)).sort());
        let worst = { spec: Infinity, env: Infinity };
        for (let i = 0; i < feats.length; i++)
          for (let j = i + 1; j < feats.length; j++) {
            if (when(tracks[i]) === when(tracks[j]) && what(tracks[i]) !== what(tracks[j])) continue;
            const d = apart(feats[i], feats[j]);
            if (Math.max(d.spec, d.env) < Math.max(worst.spec, worst.env)) worst = d;
          }
        if (worst.spec === Infinity) continue; // every pair differs in pitch
        rows.push({ slug: l.slug, q: s.q.slice(0, 70), ...worst });
        if (process.env.EAR_LOG) console.log(`${worst.spec.toFixed(2)} / ${worst.env.toFixed(2)}  ${l.slug}: ${s.q.slice(0, 60)}`);
      }
    }
    rows.sort((a, b) => Math.max(a.spec, a.env) - Math.max(b.spec, b.env));
    console.log(`${rows.length} questions with two or more sounds; the closest pairs (spectrum / level over time, dB):\n` + rows.slice(0, 12).map(r => `  ${r.spec.toFixed(2)} / ${r.env.toFixed(2)}  ${r.slug}: ${r.q}`).join("\n"));
    const quiet = rows.filter(r => Math.max(r.spec, r.env) < JND_DB && !SAME_ON_PURPOSE.some(x => `${r.slug}: ${r.q}`.startsWith(x)));
    expect(quiet.map(r => `${r.slug}: ${r.q}`)).toEqual([]);
  }, 600_000);
});
