// Frequency bands for the dj bank's waveforms, measured on the engine's own render (scripts/dj-waves, Rust).
// Usage: npx tsx scripts/dj-waves.ts   (writes src/content/djWaves.gen.json; rerun when the bank or the engine's drums or bass change)
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { DJ_BANK, TRACK_BEATS, bankPattern } from "../src/content/djBank";

const dir = new URL("./dj-waves/", import.meta.url).pathname;
execFileSync("cargo", ["build", "--release", "--quiet"], { cwd: dir, stdio: "inherit" });
const ev = (es: { note: number; vel: number; start: number; len: number }[]) => es.map(e => [e.note, e.vel, e.start, e.len].join(",")).join(";");
const lines = DJ_BANK.map(t => {
  const p = bankPattern(t);
  return [t.id, t.bpm, TRACK_BEATS, `drums:1:0:${ev(p.drums)}`, `hats:1:${t.style === "rolling" ? 4 : 5}:${ev(p.hats)}`, `bass:2:0:${ev(p.bass)}`].join("|");
}).join("\n");
const out = execFileSync(`${dir}target/release/dj-waves`, { input: lines, maxBuffer: 64 << 20 }).toString().trim().split("\n").map(l => JSON.parse(l));
// Bytes as base64: low, mid, high per stem, four bins a beat over the 64-beat track.
const pack = (a: number[]) => Buffer.from(Uint8Array.from(a)).toString("base64");
const json = Object.fromEntries(out.map(t => [t.id, Object.fromEntries(Object.entries(t.stems as Record<string, number[][]>).map(([k, b]) => [k, b.map(pack)]))]));
writeFileSync(new URL("../src/content/djWaves.gen.json", import.meta.url), JSON.stringify({ perBeat: 4, beats: TRACK_BEATS, tracks: json }) + "\n");
console.log("wrote djWaves.gen.json for", out.length, "tracks");
