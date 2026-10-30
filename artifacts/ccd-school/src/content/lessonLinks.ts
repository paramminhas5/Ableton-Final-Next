/**
 * Connects a lesson to the reference pages: which Live devices it is about (Device Atlas),
 * which plug-in job it touches (Plugin Guide) and which Build-a-Set stage it prepares for.
 * Every id is checked against atlas.ts, plugins.ts and build.ts by tests/lessonlinks.test.ts,
 * so a rename there fails the build here instead of leaving a dead link.
 */
export interface LessonLinks {
  /** ids from atlas.ts */
  devices?: string[];
  /** ids from plugins.ts */
  jobs?: string[];
  /** id of a stage in build.ts */
  stage?: string;
}

export const LESSON_LINKS: Record<string, LessonLinks> = {
  // first contact
  "what-is-live": { devices: ["audio-effect-rack"] },
  "capture-midi": { stage: "tempo" },
  // two views
  "tracks": { stage: "names" },
  "session-view": { stage: "drums" },
  "arrangement-view": { stage: "arrange" },
  // midi and audio
  "midi-piano-roll": { devices: ["scale", "chord"], stage: "bass" },
  "slicing": { devices: ["simpler", "drum-rack"] },
  "warping": { devices: ["simpler"] },
  // devices
  "instruments-overview": { devices: ["wavetable", "operator", "drift", "analog", "simpler", "sampler", "drum-rack"], jobs: ["synth", "sampled"] },
  "drum-rack": { devices: ["drum-rack", "drum-buss"], stage: "drums" },
  "wavetable": { devices: ["wavetable"], jobs: ["synth"] },
  "operator": { devices: ["operator"], jobs: ["fm"] },
  "sampler-simpler": { devices: ["simpler", "sampler"], jobs: ["sampled"] },
  "eq-eight": { devices: ["eq-eight", "eq-three", "auto-filter"], jobs: ["eq"] },
  "compressor": { devices: ["compressor", "glue-compressor", "multiband"], jobs: ["comp"], stage: "duck" },
  "reverb-delay": { devices: ["reverb", "hybrid-reverb", "echo", "delay"], jobs: ["reverb", "delay"], stage: "space" },
  "saturator-distortion": { devices: ["saturator", "overdrive", "pedal", "roar"], jobs: ["drive"] },
  "midi-effects": { devices: ["arpeggiator", "chord", "scale", "note-length", "pitch", "random", "velocity"] },
  "racks-macros": { devices: ["audio-effect-rack", "instrument-rack", "midi-effect-rack"] },
  "meld": { devices: ["meld"], jobs: ["synth"] },
  "drum-sampler": { devices: ["drum-rack", "simpler"] },
  "hybrid-reverb": { devices: ["hybrid-reverb"], jobs: ["reverb"] },
  "roar": { devices: ["roar"], jobs: ["drive"] },
  // mixing
  "the-mixer": { devices: ["utility", "spectrum"], jobs: ["meter"], stage: "names" },
  "sends-returns": { devices: ["reverb", "echo", "hybrid-reverb"], jobs: ["reverb", "delay"], stage: "space" },
  "groups-routing": { devices: ["audio-effect-rack", "glue-compressor"], stage: "harmony" },
  "automation": { stage: "arrange" },
  "sidechain": { devices: ["compressor", "glue-compressor"], jobs: ["comp"], stage: "duck" },
  "max-for-live": { devices: ["max-audio", "max-midi", "max-instrument"] },
  "glue-compressor": { devices: ["glue-compressor"], jobs: ["comp"] },
  "limiter-truepeak": { devices: ["limiter", "spectrum"], jobs: ["limit", "meter"], stage: "master" },
  // midi instruments
  "sampler-deep": { devices: ["sampler"], jobs: ["sampled"] },
  "drift": { devices: ["drift"], jobs: ["synth"] },
  "granulator-iii": { devices: ["grain-delay", "spectral-time"] },
  "collision-tension-electric": { devices: ["collision", "tension", "electric"] },
  "bass-poli": { devices: ["wavetable", "operator", "analog"], jobs: ["synth"], stage: "bass" },
  "instrument-rack": { devices: ["instrument-rack"] },
  "midi-effects-tour": { devices: ["arpeggiator", "chord", "scale", "random", "velocity"] },
  "external-instrument": { devices: ["external-instrument"] },
  // live 12 power
  "midi-transforms": { devices: ["arpeggiator", "chord", "scale"] },
  "scale-awareness": { devices: ["scale"], stage: "harmony" },
  "cpu-audio-setup": { devices: ["spectrum"] },
  // performance
  "macro-variations": { devices: ["audio-effect-rack", "instrument-rack"] },
  "exporting": { devices: ["limiter"], jobs: ["limit", "meter"], stage: "master" },
  // synth world
  "synth-oscillators": { devices: ["wavetable", "operator", "analog"], jobs: ["synth"] },
  "synth-filters": { devices: ["auto-filter", "wavetable", "analog"], jobs: ["synth"] },
  "synth-fm-basics": { devices: ["operator"], jobs: ["fm"] },
  "synth-lfo": { devices: ["wavetable", "drift", "auto-pan"] },
  "synth-effects": { devices: ["chorus", "phaser-flanger", "reverb", "echo", "saturator"], jobs: ["reverb", "delay", "drive"] },
  "synth-build-your-own": { devices: ["wavetable", "operator", "analog"], jobs: ["synth"], stage: "bass" },
};
