/**
 * Which plug-in for which job. Stock Live devices come first because they are free
 * with Live, fully saved inside a Set, and work on any computer. Third-party names are
 * well-known picks, not the only picks. Prices and licences change, so every card says
 * to check the maker's page before buying.
 */
export type Price = "free" | "free tier" | "paid";

export interface PluginPick {
  name: string;
  maker: string;
  price: Price;
  why: string;
}

export interface PluginJob {
  id: string;
  job: string;
  /** what the job is, for someone new */
  plain: string;
  /** ids from atlas.ts */
  stock: string[];
  /** when stock is enough, and when it is not */
  beyond: string;
  picks: PluginPick[];
}

export const PLUGIN_JOBS: PluginJob[] = [
  {
    id: "synth", job: "Synths", plain: "Making tones from scratch: basses, leads, pads.",
    stock: ["wavetable", "drift", "operator", "analog"],
    beyond: "Live's synths cover almost every sound. Reach for a third-party synth when you want a specific sound or workflow, or when you want to use a huge preset library.",
    picks: [
      { name: "Vital", maker: "Matt Tytel", price: "free tier", why: "A wavetable synth in the style of Serum, with a free version." },
      { name: "Surge XT", maker: "Surge Synth Team", price: "free", why: "An open-source synth with a very deep set of oscillators and filters." },
      { name: "Serum", maker: "Xfer Records", price: "paid", why: "The wavetable synth most tutorials and presets are built around." },
      { name: "Pigments", maker: "Arturia", price: "paid", why: "Several engines in one, with strong modulation." },
    ],
  },
  {
    id: "fm", job: "FM and DX-style sounds", plain: "Bells, electric pianos and glassy tones made by oscillators modulating each other.",
    stock: ["operator"],
    beyond: "Operator already does FM well. Add a DX7-style synth only if you want that exact classic sound.",
    picks: [{ name: "Dexed", maker: "Digital Suburban", price: "free", why: "A free emulation of the Yamaha DX7 that loads original DX7 patches." }],
  },
  {
    id: "sampled", job: "Realistic instruments", plain: "Pianos, strings, guitars and choirs recorded from real instruments.",
    stock: ["sampler", "simpler"],
    beyond: "Live can play multisamples, but the large libraries come from other makers and usually need their own player.",
    picks: [
      { name: "LABS", maker: "Spitfire Audio", price: "free", why: "Free, simple, great-sounding instruments such as soft piano and strings." },
      { name: "Kontakt", maker: "Native Instruments", price: "paid", why: "The player behind many sample libraries; some libraries run in the free Kontakt Player." },
    ],
  },
  {
    id: "eq", job: "EQ and fixing frequencies", plain: "Cutting mud and harshness, shaping tone.",
    stock: ["eq-eight", "eq-three"],
    beyond: "EQ Eight is enough for nearly all mixing. Third-party EQs add dynamic bands and easier visual feedback.",
    picks: [
      { name: "TDR Nova", maker: "Tokyo Dawn Labs", price: "free", why: "A free dynamic EQ: a band that only acts when a frequency gets too loud." },
      { name: "Pro-Q", maker: "FabFilter", price: "paid", why: "A very clear EQ with a spectrum display and dynamic bands." },
    ],
  },
  {
    id: "comp", job: "Compression", plain: "Making loud parts quieter so a sound feels steady.",
    stock: ["compressor", "glue-compressor", "multiband"],
    beyond: "Live's compressors are very good. Add a third-party one for a visual display or a specific character.",
    picks: [{ name: "Pro-C", maker: "FabFilter", price: "paid", why: "A flexible compressor with a clear display of what it is doing." }],
  },
  {
    id: "multiband", job: "Multiband squash", plain: "Compressing low, mid and high bands separately, for a dense, loud sound.",
    stock: ["multiband"],
    beyond: "Multiband Dynamics can do this. OTT is a popular preset-style shortcut.",
    picks: [{ name: "OTT", maker: "Xfer Records", price: "free", why: "A free one-knob multiband compressor, popular in electronic music." }],
  },
  {
    id: "limit", job: "Limiting and mastering", plain: "The last stage: keeping peaks under the ceiling and getting the final loudness.",
    stock: ["limiter", "glue-compressor", "eq-eight", "utility"],
    beyond: "Live's Limiter is fine for a first release. Dedicated mastering plug-ins add loudness metering and tonal assistants.",
    picks: [
      { name: "Pro-L", maker: "FabFilter", price: "paid", why: "A transparent limiter with a clear loudness display." },
      { name: "Ozone", maker: "iZotope", price: "paid", why: "A mastering suite; its Imager is also available separately for free." },
    ],
  },
  {
    id: "reverb", job: "Reverb", plain: "Making a sound feel like it is in a room.",
    stock: ["reverb", "hybrid-reverb"],
    beyond: "Stock reverbs are fine. People pick up third-party reverbs for a particular colour, such as lush or vintage.",
    picks: [
      { name: "Supermassive", maker: "Valhalla DSP", price: "free", why: "A free reverb and delay for huge, spacey tails." },
      { name: "VintageVerb", maker: "Valhalla DSP", price: "paid", why: "Classic digital reverbs from the 70s to 90s." },
      { name: "Pro-R", maker: "FabFilter", price: "paid", why: "A natural-sounding reverb with a simple control layout." },
    ],
  },
  {
    id: "delay", job: "Delay", plain: "Echoes that repeat in time with the track.",
    stock: ["echo", "delay", "filter-delay"],
    beyond: "Echo covers tape, dub and clean delays. Third-party delays bring a specific vintage tone.",
    picks: [{ name: "EchoBoy", maker: "Soundtoys", price: "paid", why: "Many emulations of classic delays in one plug-in." }],
  },
  {
    id: "drive", job: "Saturation and distortion", plain: "Adding warmth, bite or grit by adding harmonics.",
    stock: ["saturator", "roar", "overdrive", "drum-buss"],
    beyond: "Roar and Saturator cover most needs. Third-party units add a few well-loved flavours.",
    picks: [{ name: "Decapitator", maker: "Soundtoys", price: "paid", why: "A saturator known for warm, thick drums and basses." }],
  },
  {
    id: "meter", job: "Seeing and measuring", plain: "Checking frequencies and loudness so you can trust your ears with proof.",
    stock: ["spectrum", "utility"],
    beyond: "Live shows spectrum and level. For loudness numbers (LUFS) you need a metering plug-in.",
    picks: [
      { name: "SPAN", maker: "Voxengo", price: "free", why: "A free spectrum analyser with many display options." },
      { name: "Loudness Meter", maker: "Youlean", price: "free tier", why: "Shows loudness in LUFS, with a free version." },
    ],
  },
  {
    id: "tune", job: "Vocal tuning", plain: "Correcting or reshaping the pitch of a vocal.",
    stock: [],
    beyond: "Live has no pitch-correction device, so this job always needs another plug-in.",
    picks: [
      { name: "Melodyne", maker: "Celemony", price: "paid", why: "Edit each note's pitch and timing by hand." },
      { name: "Auto-Tune", maker: "Antares", price: "paid", why: "Real-time pitch correction and the classic tuned-vocal effect." },
    ],
  },
  {
    id: "deess", job: "De-essing", plain: "Taming harsh S sounds in a vocal.",
    stock: ["eq-eight", "multiband"],
    beyond: "Live has no dedicated de-esser. A narrow cut with a multiband compressor or dynamic EQ band works, or use a purpose-built plug-in.",
    picks: [{ name: "Pro-DS", maker: "FabFilter", price: "paid", why: "A de-esser that finds and reduces sibilance automatically." }],
  },
];

export const FORMATS = [
  { name: "VST3", where: "Windows and macOS", note: "The current format. Prefer it when a plug-in offers a choice." },
  { name: "VST2", where: "Windows and macOS", note: "Older. Live reads it from a folder you choose in Preferences." },
  { name: "AU (Audio Units)", where: "macOS only", note: "Apple's format. Live scans it automatically." },
];
