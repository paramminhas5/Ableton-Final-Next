/**
 * The names our controls show, and what the same control is called on other instruments (Param, 5 Nov:
 * "not invent new names, people who use this should learn other instruments as well").
 *
 * Rule: if Ableton Live 12 has the control, we use Live's name; otherwise the name most synths share.
 * Every "elsewhere" name below was checked in that instrument's manual (`SOURCES`); where we could not
 * check a name we leave it out rather than guess. design/naming.md has the full table and the old names.
 *
 * Labels for engine params live in engine/src/params.rs (so params.gen.ts carries them); this file holds
 * the stepped knobs' value names, the one label that changes with the oscillator, and the elsewhere notes.
 * Pure, so it is tested (tests/control-names.test.ts).
 */

/** Manuals each name was checked in. */
export const SOURCES = {
  liveFx: "https://www.ableton.com/en/manual/live-audio-effect-reference/",
  liveInst: "https://www.ableton.com/en/manual/live-instrument-reference/",
  liveM4l: "https://www.ableton.com/en/manual/max-for-live-devices/",
  liveMidiFx: "https://www.ableton.com/en/manual/live-midi-effect-reference/",
  liveMidiTools: "https://www.ableton.com/en/manual/midi-tools/",
  liveWarp: "https://www.ableton.com/en/manual/audio-clips-tempo-and-warping/",
  liveRecord: "https://www.ableton.com/en/manual/recording-new-clips/",
  liveRacks: "https://www.ableton.com/en/manual/instrument-drum-and-effect-racks/",
  surge: "https://surge-synthesizer.github.io/manual-xt",
  tb303: "https://rolandcloud.com/getmedia/b3e2da28-1951-467e-bd79-7aae34481570/TB-303-Manual-E.pdf",
  tr808: "https://www.manualslib.com/manual/1294765/Roland-Tr-808.html?page=6",
  elektron: "https://cdn.www.elektron.se/media/downloads/digitakt/Digitakt_Quick_Guide_ENG_220928.pdf",
  valhalla: "https://valhalladsp.com/2019/04/16/valhalladelay-the-mode-control",
  cz: "https://en.wikipedia.org/wiki/Casio_CZ_synthesizers",
  rekordbox: "https://cdn.rekordbox.com/files/20250907160902/CDJ_XDJ_Control_Mapping_en_CDJ-3000X.pdf",
} as const;

/** One place the same control lives: the instrument, and the name printed on it there. */
export type Elsewhere = readonly [where: string, name: string];

export type Control = {
  /** What our UI shows. */
  label: string;
  /** Names this control had before 5 Nov, for design/naming.md and the tests. */
  was?: readonly string[];
  /** The same control on other instruments, checked in their manuals. */
  elsewhere: readonly Elsewhere[];
};

/**
 * By param key (params.gen.ts `key`), plus a few studio tools that are not params ("plock", "density",
 * "capture", "macro", "warp", and the dj controls). Keys whose label is plain and the same everywhere
 * (attack, release, level, pan) still get elsewhere notes when a manual names them differently.
 */
export const CONTROLS: Record<string, Control> = {
  // ── the filter ──
  cutoff: { label: "cutoff", elsewhere: [["live auto filter", "freq"], ["live drift", "freq"], ["tb-303", "cut off freq"]] },
  res: { label: "res", elsewhere: [["live auto filter", "res"], ["live drift", "res"], ["tb-303", "resonance"]] },
  env: { label: "env", elsewhere: [["tb-303", "env mod"]] },
  character: { label: "circuit", was: ["character"], elsewhere: [["live auto filter", "circuit (svf, dfm, ms2, prd)"], ["live wavetable", "circuit (clean, osr, ms2, smp, prd)"]] },
  fdrive: { label: "drive", was: ["filter drive"], elsewhere: [["live auto filter", "drive"], ["live wavetable", "drive"]] },
  fdecay: { label: "f decay", elsewhere: [["tb-303", "decay"]] },
  lp: { label: "cutoff", was: ["filter"], elsewhere: [["live auto filter", "freq"]] },
  filter: { label: "cutoff", was: ["filter"], elsewhere: [["live auto filter", "freq"]] },
  lpres: { label: "resonance", elsewhere: [["live auto filter", "res"]] },
  lpkind: { label: "circuit", was: ["character"], elsewhere: [["live auto filter", "circuit (svf, dfm, ms2, prd)"]] },

  // ── the oscillator ──
  wave: { label: "shape", was: ["wave"], elsewhere: [["live drift", "shape"], ["surge xt classic", "shape"], ["live wavetable", "wave position"], ["tb-303", "waveform (saw or square)"]] },
  osc: { label: "osc", elsewhere: [["surge xt", "classic, wavetable (osc types)"], ["live operator", "feedback"], ["casio cz", "phase distortion, its amount is dcw"]] },
  sub: { label: "sub", elsewhere: [["live wavetable", "sub"]] },
  drift: { label: "drift", elsewhere: [["live drift", "drift"]] },
  detune: { label: "detune", elsewhere: [["live wavetable", "unison amount"], ["live drift", "unison strength"]] },
  spread: { label: "spread", elsewhere: [["live operator", "spread"]] },
  glide: { label: "glide", elsewhere: [["live drift", "glide"], ["live wavetable", "glide"], ["tb-303", "slide"]] },
  fm: { label: "fm", elsewhere: [["live wavetable", "fm amt"], ["live ds fm", "amnt"]] },
  ratio: { label: "ratio", elsewhere: [["live operator", "coarse"], ["live wavetable", "fm tune"]] },
  lfo: { label: "lfo", elsewhere: [["live auto filter", "lfo amt"], ["surge xt", "amplitude"]] },
  lforate: { label: "lfo rate", elsewhere: [["live auto filter", "rate"], ["surge xt", "rate"]] },

  // ── the resonator voices ──
  voice: { label: "exciter", was: ["voice"], elsewhere: [["live tension", "exciter type (plectrum, hammer)"], ["live collision", "mallet"]] },
  ring: { label: "decay", was: ["ring"], elsewhere: [["live collision", "resonator decay"]] },
  bright: { label: "stiffness", was: ["bright"], elsewhere: [["live collision", "mallet stiffness"], ["live tension", "stiffness"]] },

  // ── every part: eq, fx, mix ──
  low: { label: "low", elsewhere: [["live eq three", "low"]] },
  mid: { label: "mid", elsewhere: [["live eq three", "mid"]] },
  high: { label: "high", elsewhere: [["live eq three", "high"]] },
  cut: { label: "low cut", elsewhere: [["live eq eight", "low cut"]] },
  drive: { label: "drive", elsewhere: [["live saturator", "drive"], ["live ds kick", "drive"]] },
  crush: { label: "crush", elsewhere: [["live redux", "bits and rate"]] },
  send: { label: "send", elsewhere: [["live mixer", "send (to a return track with a reverb)"]] },
  echo: { label: "echo", elsewhere: [["live mixer", "send (to a return track with a delay)"]] },

  // ── drums ──
  tune: { label: "tune", elsewhere: [["live ds snare", "tune"], ["live ds kick", "pitch"], ["live drum sampler", "transpose"]] },
  decay: { label: "decay", elsewhere: [["live ds kick", "decay"], ["tb-303", "decay"]] },
  shape: { label: "shape", was: ["body"], elsewhere: [["live saturator", "curve type (soft sine, hard curve, digital clip)"], ["live ds kick", "drive"]] },
  shapeblip: { label: "type", was: ["sound"], elsewhere: [["live", "ds fm, ds clang (each its own drum)"]] },
  shapewood: { label: "type", was: ["sound"], elsewhere: [["live ds clang", "clave switch"]] },
  noise: { label: "noise", elsewhere: [["live drum sampler", "noise amount"], ["tr-808 snare", "snappy"]] },
  snap: { label: "noise decay", was: ["snap"], elsewhere: [["live collision noise", "d (decay)"]] },
  color: { label: "color", elsewhere: [["live drum sampler", "noise color"], ["live ds hh", "tone"]] },
  sweep: { label: "pitch env", was: ["sweep"], elsewhere: [["live drum sampler", "pitch env"], ["live ds kick", "env"], ["live ds tom", "bend"]] },
  wobble: { label: "vibrato", was: ["wobble"], elsewhere: [["live analog", "vib"]] },

  // ── sampler ──
  start: { label: "start", elsewhere: [["live simpler", "start"], ["live drum sampler", "sample start"]] },
  gate: { label: "gate", elsewhere: [["live simpler", "trigger / gate"], ["live drum sampler", "trigger / gate"]] },

  // ── master ──
  glue: { label: "glue", elsewhere: [["live glue compressor", "threshold (lower is more glue)"]] },
  glueratio: { label: "ratio", elsewhere: [["live glue compressor", "ratio"]] },
  sidechain: { label: "sidechain", elsewhere: [["live glue compressor", "sidechain eq"]] },
  gluemix: { label: "dry/wet", was: ["glue mix"], elsewhere: [["live glue compressor", "dry/wet"]] },
  space: { label: "algorithm", was: ["space"], elsewhere: [["live hybrid reverb", "algorithm"]] },
  verbtime: { label: "decay", was: ["verb time"], elsewhere: [["live reverb", "decay"], ["live hybrid reverb", "decay"]] },
  echotype: { label: "echo", elsewhere: [["valhalla delay", "mode (tape, bbd, digital)"]] },
  repeats: { label: "feedback", was: ["repeats"], elsewhere: [["live echo", "feedback"], ["live delay", "feedback"]] },

  // ── studio tools that are not params ──
  plock: { label: "p-lock", was: ["lock", "locked"], elsewhere: [["elektron", "parameter lock (hold a trig, turn a knob)"]] },
  density: { label: "density", was: ["fill"], elsewhere: [["live 12 rhythm generator", "density"], ["live 12 seed generator", "density"]] },
  capture: { label: "capture", elsewhere: [["live", "capture midi"]] },
  macro: { label: "macro", elsewhere: [["live racks", "macro variations"]] },
  warp: { label: "warp", was: ["repitch"], elsewhere: [["live warp modes", "beats, re-pitch"]] },
  swing: { label: "swing", elsewhere: [["live", "global groove amount"]] },

  // ── dj ──
  cue: { label: "cue", elsewhere: [["rekordbox", "hot cue"]] },
  loop: { label: "loop", elsewhere: [["rekordbox", "beat loop"]] },
  sync: { label: "sync", elsewhere: [["rekordbox", "beat sync"]] },
  key: { label: "key", elsewhere: [["rekordbox", "key shift, key sync"]] },
};

/** Names for a stepped knob's positions: what the screen shows when you turn it. */
export const STEPS: Record<string, readonly string[]> = {
  // Filter circuit, by Live's names: our ladder is Live's prd, our Korg35 is ms2 (Sallen-Key, the
  // MS-20's filter), our 2-pole state variable is Live's svf.
  character: ["prd", "ms2", "svf"],
  lpkind: ["prd", "ms2", "svf"],
  // The kick: a pure sine, saturated a little, clipped almost square.
  shape: ["sine", "soft clip", "hard clip"],
  shapeblip: ["fm", "bell", "metal"],
  shapewood: ["wood", "bell", "metal"],
  osc: ["classic", "wavetable", "feedback", "phase dist"],
  // No exciter: the oscillators play. Then a plucked string, a struck bar, struck strings.
  voice: ["off", "plectrum", "mallet", "hammer"],
  space: ["hall", "plate"],
  echotype: ["digital", "tape", "bbd"],
  gate: ["trigger", "gate"],
};

/** A short line after the name, for the stepped knobs whose name alone says little. */
export const STEP_WHAT: Record<string, readonly string[]> = {
  character: ["ladder", "sallen-key", "state variable"],
  lpkind: ["ladder", "sallen-key", "state variable"],
  echotype: ["clean repeats", "wow and flutter", "bucket brigade"],
};

/** Which of a stepped knob's names `n` (0..1) is on, the way the engine steps it. */
export function stepIndex(key: string, n: number): number {
  const names = STEPS[key];
  if (!names) return -1;
  const c = Math.min(1, Math.max(0, n));
  if (names.length === 3) return c < 0.34 ? 0 : c < 0.67 ? 1 : 2;
  if (names.length === 2) return c < 0.5 ? 0 : 1;
  return Math.round(c * (names.length - 1));
}

/** The name a stepped knob shows at `n`, "prd · ladder" style when there is a what line. Null if not stepped. */
export function stepName(key: string, n: number, withWhat = true): string | null {
  const i = stepIndex(key, n);
  if (i < 0) return null;
  const what = withWhat ? STEP_WHAT[key]?.[i] : undefined;
  return what ? `${STEPS[key][i]} · ${what}` : STEPS[key][i];
}

/**
 * The oscillator's shape knob takes the name the same control has on the instrument each osc copies:
 * shape (classic, as on Live's Drift and Surge), wave position (Live's Wavetable), feedback (Live's
 * Operator), dcw (the Casio CZ's phase distortion amount).
 */
export const WAVE_BY_OSC = ["shape", "position", "feedback", "dcw"] as const;

/** The label a knob shows, given the part's other params (normalised, by key). */
export function knobLabel(spec: { key: string; label: string }, byKey?: (key: string) => number | undefined): string {
  if (spec.key === "wave" && byKey) {
    const o = byKey("osc");
    if (o !== undefined) return WAVE_BY_OSC[stepIndex("osc", o)] ?? spec.label;
  }
  return CONTROLS[spec.key]?.label ?? spec.label;
}

/** "live auto filter: freq · tb-303: cut off freq", or null when no other name is known. */
export function elsewhereLine(key: string, max = 3): string | null {
  const c = CONTROLS[key];
  if (!c || !c.elsewhere.length) return null;
  return c.elsewhere.slice(0, max).map(([w, n]) => `${w}: ${n}`).join(" · ");
}

/** For the glossary: the elsewhere line of each control whose label is `term`. */
export function elsewhereForLabel(term: string): string | null {
  const t = term.toLowerCase();
  const keys = Object.keys(CONTROLS).filter(k => CONTROLS[k].label === t);
  const seen = new Set<string>();
  const parts: string[] = [];
  for (const k of keys) for (const [w, n] of CONTROLS[k].elsewhere) {
    const s = `${w}: ${n}`;
    if (!seen.has(s)) { seen.add(s); parts.push(s); }
  }
  return parts.length ? parts.join(" · ") : null;
}
