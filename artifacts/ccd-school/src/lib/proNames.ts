/**
 * Our names first, the pro name second (Param, 5 Nov: "use chill names but also show the secondary ableton
 * or rekordbox ones"). Each control we show keeps its plain name; a line under the controls says what it is
 * called in Ableton Live (producing and basics) or rekordbox (djing), so the step to the real tools is short.
 * Only names that differ are listed: "attack" is "attack" everywhere.
 */
export type ProTool = "ableton" | "rekordbox";

/** Our knob key (params.gen.ts `key`) to Ableton Live's name for the same control. */
const ABLETON: Record<string, string> = {
  cutoff: "filter freq",
  res: "resonance",
  env: "filter envelope amount",
  glide: "glide time",
  wave: "oscillator shape",
  sub: "sub oscillator",
  drift: "drift",
  tune: "transpose",
  decay: "decay",
  character: "auto filter circuit",
  lp: "auto filter frequency",
  lpres: "auto filter resonance",
  lpkind: "auto filter circuit",
  level: "track volume",
  send: "send a (reverb)",
  echo: "send b (delay)",
  duck: "sidechain compression",
  drive: "saturator drive",
  crush: "redux",
  low: "eq three low",
  mid: "eq three mid",
  high: "eq three high",
  cut: "eq eight low cut",
  lfo: "lfo amount",
  rate: "lfo rate",
  lfoto: "lfo destination",
  detune: "unison detune",
  voices: "unison voices",
  fm: "fm amount",
  ratio: "fm ratio",
  fenv: "filter envelope",
  glue: "glue compressor",
  out: "master volume",
  swing: "groove amount",
  tempo: "tempo",
};

/** Our mixer control names to rekordbox's (and the cdj and djm hardware it mirrors). */
const REKORDBOX: Record<string, string> = {
  "deck a": "channel fader",
  "deck b": "channel fader",
  "low a": "low eq",
  "low b": "low eq",
  crossfader: "crossfader",
  "tempo b": "tempo slider",
  "sync b": "beat sync",
  cue: "hot cue",
  loop: "beat loop",
  stems: "stem (track separation)",
  key: "key shift",
  curve: "crossfader curve",
  "echo a": "beat fx: echo",
  record: "recording",
};

export function proName(tool: ProTool, ours: string): string | null {
  const m = tool === "ableton" ? ABLETON : REKORDBOX;
  const n = m[ours.toLowerCase()];
  return n && n !== ours.toLowerCase() ? n : null;
}

/** One line for under a row of controls: "in ableton: cutoff is filter freq, glide is glide time". */
export function proLine(tool: ProTool, ours: string[]): string | null {
  const pairs = ours.map(o => [o, proName(tool, o)] as const).filter(([, p]) => p);
  if (!pairs.length) return null;
  return `in ${tool}: ${pairs.map(([o, p]) => `${o} is ${p}`).join(", ")}`;
}
