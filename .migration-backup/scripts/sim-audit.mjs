#!/usr/bin/env node
// Sim-fit audit: produces a markdown report mapping each mission slug to
// its current sim and a recommended sim based on keyword heuristics.
// Run: node scripts/sim-audit.mjs > /mnt/documents/sim-audit.md
import { MISSIONS } from "../src/content/missions.ts";

// Heuristic: keyword in slug/title/tagline -> ideal sim type.
// First match wins.
const RULES = [
  [/interface|tour|control.bar|browser/i, "interface-tour"],
  [/session.grid|scene|clip.launch/i, "session-grid"],
  [/arrangement|timeline|locator|loop.brace/i, "arrangement"],
  [/song.structure|intro|drop|outro|build/i, "song-structure"],
  [/midi.*audio|audio.*midi|what.*midi/i, "midi-vs-audio"],
  [/piano.roll|note.editor/i, "piano-roll"],
  [/midi.map|cc|controller/i, "midi-map"],
  [/midi.transform|scale.*midi|chord.*midi/i, "midi-transform"],
  [/warp|elastic|time.stretch/i, "warp-lab"],
  [/groove|swing|micro.timing/i, "groove-extractor"],
  [/bpm|tempo.tap/i, "bpm-tap"],
  [/beatmatch|sync/i, "beatmatch-trainer"],
  [/hot.cue|cue.point/i, "hot-cue-drill"],
  [/harmonic.mix|camelot|key/i, "harmonic-mix-wheel"],
  [/loop.roll|beat.repeat/i, "loop-roll"],
  [/stem|splitter/i, "stem-splitter"],
  [/drum.pad|drum.rack|sampler/i, "drum-pad"],
  [/beat|kick|snare|hat|groove/i, "beat-builder"],
  [/sidechain|duck|pump/i, "sidechain"],
  [/compress|comp\b/i, "comp-lake"],
  [/send|return|aux/i, "send-return"],
  [/mixer|fader|gain.stag/i, "mixer"],
  [/route|routing|signal.flow/i, "routing-puzzle"],
  [/device.chain|chain|rack/i, "device-chain"],
  [/eq|equaliz/i, "eq-cut"],
  [/granular|grain/i, "granular"],
  [/lfo|modulation/i, "lfo-lab"],
  [/filter|cutoff|resonance/i, "filter-envelope"],
  [/oscillator|wavetable|osc/i, "oscillator-mixer"],
  [/subtractive|synth.basic|synth$/i, "subtractive-synth"],
  [/wavetable|operator|fm/i, "synth-playground"],
  [/chord|harmony|stack/i, "chord-stacker"],
  [/scale|mode|pentaton/i, "scale-aware"],
  [/melody|topline/i, "melody-shaper"],
  [/bass|sub|808/i, "bassline-lab"],
  [/note|octave|pitch/i, "note-explorer"],
  [/interval|ear/i, "ear-training"],
  [/push|controller.hardware/i, "push3"],
];

function recommend(m) {
  const hay = `${m.slug} ${m.title} ${m.tagline ?? ""}`;
  for (const [re, sim] of RULES) if (re.test(hay)) return sim;
  return null;
}

const rows = MISSIONS.map((m) => {
  const current = m.sim?.type ?? "—";
  const rec = recommend(m) ?? current;
  const fit = current === rec ? "✓" : "SWAP";
  return { fit, slug: m.slug, world: m.world, current, rec, title: m.title };
});

const swaps = rows.filter((r) => r.fit === "SWAP");

console.log(`# Sim-Fit Audit\n`);
console.log(`Total missions: **${rows.length}** · Swaps suggested: **${swaps.length}**\n`);
console.log(`| Fit | World | Slug | Title | Current sim | Recommended |`);
console.log(`|-----|-------|------|-------|-------------|-------------|`);
for (const r of rows) {
  console.log(`| ${r.fit} | ${r.world} | \`${r.slug}\` | ${r.title} | \`${r.current}\` | \`${r.rec}\` |`);
}
console.log(`\n## Swaps only (${swaps.length})\n`);
console.log(`| Slug | Current → Recommended |`);
console.log(`|------|-----------------------|`);
for (const r of swaps) {
  console.log(`| \`${r.slug}\` | \`${r.current}\` → \`${r.rec}\` |`);
}
