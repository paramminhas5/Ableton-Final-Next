// Information-only instrument catalog. These don't have full
// audio-engine emulations yet — they're listed so /devices is complete
// and links the user back to the corresponding mission lab.
export type InstrumentInfo = {
  slug: string;        // mission slug
  name: string;
  category: "INSTRUMENT";
  family: "Synth" | "Sampler" | "Physical" | "Drum" | "MIDI";
  tagline: string;
  overview: string;    // 2-3 sentences: what sounds + when to reach for it
};

export const INSTRUMENTS: InstrumentInfo[] = [
  { slug: "drift", name: "Drift", category: "INSTRUMENT", family: "Synth",
    tagline: "Fast, hands-on subtractive synth.",
    overview: "Live 12's headline synth — two oscillators, a flexible filter, and a modulation matrix on one panel. Reach for it when you want a sound fast: leads, basses, plucks, pads. The whole instrument fits on one screen so you can dial things by ear, not by menus." },
  { slug: "wavetable", name: "Wavetable", category: "INSTRUMENT", family: "Synth",
    tagline: "Sweeping digital textures and basses.",
    overview: "Two wavetable oscillators morph through tables of single-cycle waves. Built for evolving pads, hollow plucks, modern basses and growls. The MPE-friendly mod matrix lets every parameter breathe under your fingers." },
  { slug: "operator", name: "Operator", category: "INSTRUMENT", family: "Synth",
    tagline: "FM synthesis. Bells, basses, classics.",
    overview: "Four-oscillator frequency-modulation synth. Use it for DX7-style electric pianos, metallic bells, glassy keys and acid basses. The fixed-frequency and noise modes make it surprisingly good for percussion too." },
  { slug: "meld", name: "Meld", category: "INSTRUMENT", family: "Synth",
    tagline: "Macro-driven, MPE-native sound exploration.",
    overview: "Two macro-osc engines, a giant XY morph and per-note expression. Designed for happy-accident sound design — pick a preset, twist macros, follow your ears. Pairs perfectly with Push 3's MPE." },
  { slug: "sampler-simpler", name: "Sampler / Simpler", category: "INSTRUMENT", family: "Sampler",
    tagline: "Play any audio as an instrument.",
    overview: "Drag a sample in, get a playable instrument. Simpler is the quick lane: classic, one-shot, or slice modes. Sampler unlocks multi-zone mapping, modulators, filters — useful when you want a recorded piano or your own kit chromatic across the keyboard." },
  { slug: "drum-rack", name: "Drum Rack", category: "INSTRUMENT", family: "Drum",
    tagline: "16 pads of samplers, choke groups, macros.",
    overview: "A grid of cells, each a full instrument chain. Drop a sample on a pad, or nest a Simpler/Operator. Choke groups stop hats stepping on each other; macros automate the whole kit at once. The standard way to build a drum kit in Live." },
  { slug: "granulator-iii", name: "Granulator III", category: "INSTRUMENT", family: "Sampler",
    tagline: "Granular textures and clouds.",
    overview: "Spray a sample into thousands of tiny grains and reshape it into pads, stutters or shimmering clouds. Great on vocals, field recordings and any sound you want to suspend in time. Live 12 ships it built-in for the first time." },
  { slug: "collision-tension-electric", name: "Collision / Tension / Electric", category: "INSTRUMENT", family: "Physical",
    tagline: "Physical-modelling: mallets, strings, e-pianos.",
    overview: "Three different physics simulations. Collision = mallets, bells, marimbas. Tension = plucked & bowed strings. Electric = Rhodes/Wurlitzer electric pianos. Reach for them when a sampled version sounds static — physical models breathe with velocity and pitch." },
  { slug: "bass-poli", name: "Bass & Poli", category: "INSTRUMENT", family: "Synth",
    tagline: "Live 12's dedicated bass + poly classics.",
    overview: "Bass is a focused mono synth for sub, mid-growl and 808-style lines. Poli emulates classic poly-synth voices — warm pads, brass, strings. Use them when you want a great sound out of the box without 200 knobs." },
  { slug: "instrument-rack", name: "Instrument Rack", category: "INSTRUMENT", family: "Synth",
    tagline: "Stack multiple instruments behind one MIDI track.",
    overview: "Layer Drift + Wavetable + a sample for huge stacked sounds. Macros expose 16 knobs that control anything inside. Zones split or velocity-switch chains so you can build expressive multi-sampled instruments without leaving Live." },
  { slug: "midi-effects-tour", name: "MIDI Effects", category: "INSTRUMENT", family: "MIDI",
    tagline: "Arpeggiator, Chord, Scale, Note Length, Pitch, Random, Velocity, Expression Control.",
    overview: "These insert before an instrument and rewrite the MIDI on the fly. Arpeggiator turns held chords into runs; Chord adds harmony; Scale locks notes; Random/Velocity/Pitch add humanity. Live 12 also adds Note Echo and several expressive devices." },
  { slug: "external-instrument", name: "External Instrument", category: "INSTRUMENT", family: "Synth",
    tagline: "Route MIDI to hardware, get audio back.",
    overview: "A bridge device: sends MIDI to a hardware synth (or hardware MIDI port) and lets the audio return live into your set, with latency comp. The clean way to use outboard inside a Live project." },
];
