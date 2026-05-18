export type LearningPath = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  color: string;
  missionSlugs: string[];
  world: "fundamentals" | "dj" | "producer";
  chapter: string;       // chapter slug
  number: number;        // path number within chapter (1, 2, 3)
  source?: string;       // citation for DJ/Fundamentals content
};

export const PATHS: LearningPath[] = [

  // ── FUNDAMENTALS ──────────────────────────────────────────────────────────
  // Chapter 1: Sound Science
  {
    slug: "acoustics",
    world: "fundamentals", chapter: "sound-science", number: 1,
    title: "Acoustics",
    tagline: "How sound travels, vibrates and reaches your ear",
    description: "Sound as mechanical pressure waves, frequency and pitch, amplitude and decibels, timbre and the harmonic series — the physical foundation of everything you hear in music.",
    color: "bg-acid",
    source: "learningmusic.ableton.com",
    missionSlugs: ["what-is-sound", "frequency-pitch", "amplitude-volume", "timbre-tone"],
  },
  {
    slug: "perception",
    world: "fundamentals", chapter: "sound-science", number: 2,
    title: "Perception",
    tagline: "Waveforms, acoustics and how the brain processes sound",
    description: "The four fundamental waveforms, reverb and room acoustics, overtones and the harmonic series, equal-loudness contours and why your ears work the way they do.",
    color: "bg-acid",
    source: "learningmusic.ableton.com",
    missionSlugs: ["waveforms", "sound-in-space", "overtones-harmonics", "how-we-hear"],
  },

  // Chapter 2: Rhythm & Time
  {
    slug: "pulse-and-tempo",
    world: "fundamentals", chapter: "rhythm-and-time", number: 1,
    title: "Pulse & Tempo",
    tagline: "The heartbeat of music — BPM, bars and groove",
    description: "What rhythm is, how tempo is measured in BPM, how music is divided into bars and time signatures, and what groove and feel mean in practice.",
    color: "bg-acid",
    source: "learningmusic.ableton.com/make-beats",
    missionSlugs: ["what-is-rhythm", "tempo-bpm", "bars-time-signatures", "groove-feel"],
  },
  {
    slug: "groove-and-subdivision",
    world: "fundamentals", chapter: "rhythm-and-time", number: 2,
    title: "Groove & Subdivision",
    tagline: "Syncopation, polyrhythm and the maths of rhythm",
    description: "Syncopation and the off-beat, polyrhythm and why it hypnotises, note values from whole notes to 32nds, and how all of this lives inside a DAW.",
    color: "bg-acid",
    source: "learningmusic.ableton.com/make-beats",
    missionSlugs: ["syncopation", "polyrhythm", "note-values", "rhythm-in-production"],
  },

  // Chapter 3: Melody & Pitch
  {
    slug: "notes-and-scales",
    world: "fundamentals", chapter: "melody-and-pitch", number: 1,
    title: "Notes & Scales",
    tagline: "The 12 notes, octaves, major and minor scales and intervals",
    description: "How pitch is named and organised, octaves and frequency doubling, the major scale pattern, the minor scale and its variants, and what an interval is.",
    color: "bg-acid",
    source: "learningmusic.ableton.com/notes-and-scales",
    missionSlugs: ["notes-and-octaves", "major-scale", "minor-scale", "intervals"],
  },
  {
    slug: "ear-and-expression",
    world: "fundamentals", chapter: "melody-and-pitch", number: 2,
    title: "Ear & Expression",
    tagline: "Pentatonic scales, writing hooks and training your ear",
    description: "The universal pentatonic scale, melodic contour and what makes a hook memorable, ear training fundamentals and interval recognition, transposition and the seven modes.",
    color: "bg-acid",
    source: "learningmusic.ableton.com/notes-and-scales",
    missionSlugs: ["pentatonic-scales", "melody-writing", "ear-training", "transposition-modes"],
  },

  // Chapter 4: Harmony & Chords
  {
    slug: "chords-and-keys",
    world: "fundamentals", chapter: "harmony-and-chords", number: 1,
    title: "Chords & Keys",
    tagline: "Triads, chord types, progressions and tonal centres",
    description: "What a chord is and how voicing changes everything, major vs minor vs diminished vs augmented, chord progressions and Roman numerals, and what it means to be in a key.",
    color: "bg-acid",
    source: "learningmusic.ableton.com/chords",
    missionSlugs: ["what-are-chords", "chord-types", "chord-progressions", "keys-tonality"],
  },
  {
    slug: "music-in-motion",
    world: "fundamentals", chapter: "harmony-and-chords", number: 2,
    title: "Music in Motion",
    tagline: "Tension, resolution, structure and active listening",
    description: "How tension and resolution drive music forward, chord pads and arpeggios in production, song structure from verse-chorus to drop, and how to listen actively as a producer.",
    color: "bg-acid",
    source: "learningmusic.ableton.com/chords",
    missionSlugs: ["tension-resolution", "harmony-in-production", "song-structure", "listening-actively"],
  },

  // Chapter 5: Music Technology
  {
    slug: "the-digital-studio",
    world: "fundamentals", chapter: "music-technology", number: 1,
    title: "The Digital Studio",
    tagline: "DAWs, MIDI, digital audio and samples",
    description: "What a DAW replaces, MIDI as instructions vs audio as sound, sample rate and bit depth, samples vs loops and how copyright affects production.",
    color: "bg-acid",
    source: "learningmusic.ableton.com — Ableton Live manual",
    missionSlugs: ["daw-explained", "midi-explained", "digital-audio", "samples-loops"],
  },
  {
    slug: "signal-and-mix",
    world: "fundamentals", chapter: "music-technology", number: 2,
    title: "Signal & Mix",
    tagline: "Signal chain, effects, mixing basics and putting it all together",
    description: "The full signal chain from source to speaker, the four core effects (EQ, compression, reverb, delay), mixing as balancing, and how every concept from Fundamentals connects.",
    color: "bg-acid",
    source: "learningmusic.ableton.com — Ableton Live manual",
    missionSlugs: ["signal-chain", "effects-overview", "mixing-basics", "music-tech-integration"],
  },

  // ── DJ WORLD ──────────────────────────────────────────────────────────────
  // Chapter 1: Setup & Culture
  {
    slug: "gear-and-history",
    world: "dj", chapter: "setup-and-culture", number: 1,
    title: "Gear & History",
    tagline: "DJing's roots, equipment types and the rekordbox ecosystem",
    description: "What DJing is and where it came from, CDJs vs controllers vs turntables, the DJ mixer, rekordbox EXPORT vs PERFORMANCE mode, and the history that shaped modern club culture.",
    color: "bg-ink",
    source: "rekordbox 6.0.0 Instruction Manual (Pioneer DJ) — Introduction p.6 · Wikipedia — Disc jockey, House music, Techno",
    missionSlugs: ["what-is-djing", "dj-equipment", "rekordbox-intro", "dj-culture"],
  },
  {
    slug: "your-first-session",
    world: "dj", chapter: "setup-and-culture", number: 2,
    title: "Your First Session",
    tagline: "Headphones, booth setup, genres and your first mix",
    description: "Cueing in headphones, split cue monitoring, booth signal chain and gain staging, genre BPM ranges from hip-hop to drum and bass, and the mindset and method for your first mix.",
    color: "bg-ink",
    source: "rekordbox 6.0.0 Instruction Manual — PERFORMANCE mode screen p.104 · Preparing for DJ performance p.66",
    missionSlugs: ["headphone-monitoring", "booth-setup", "genre-bpm-reference", "your-first-mix"],
  },

  // Chapter 2: The Library
  {
    slug: "know-your-music",
    world: "dj", chapter: "the-library", number: 1,
    title: "Know Your Music",
    tagline: "Audio formats, BPM analysis, key detection and tagging",
    description: "Audio format quality for club sound systems, rekordbox BPM auto-analysis and beat grids, the Camelot Wheel harmonic mixing system, and My Tags for real-time set filtering.",
    color: "bg-ink",
    source: "rekordbox 6.0.0 Instruction Manual — Analysis p.14 · Key display p.9 · My Tag configuration p.29",
    missionSlugs: ["music-library-dj", "bpm-analysis-dj", "key-detection-dj", "my-tags-dj"],
  },
  {
    slug: "organise-and-export",
    world: "dj", chapter: "the-library", number: 2,
    title: "Organise & Export",
    tagline: "Playlists, crate digging, EXPORT mode and waveform reading",
    description: "Playlist organisation strategy, the art and science of crate digging, the full rekordbox EXPORT mode workflow from import to USB, and reading waveforms to see music before you hear it.",
    color: "bg-ink",
    source: "rekordbox 6.0.0 Instruction Manual — Using a Playlist p.34 · EXPORT mode screen p.48 · Beat grid p.82 · Cues p.77 · SYNC MANAGER p.37",
    missionSlugs: ["playlists-dj", "crate-digging", "export-mode-dj", "waveform-reading"],
  },

  // Chapter 3: The Mix
  {
    slug: "beatmatching-fundamentals",
    world: "dj", chapter: "the-mix-dj", number: 1,
    title: "Beatmatching",
    tagline: "Lock two tracks together by ear and by algorithm",
    description: "Manual beatmatching using pitch fader and jog wheel, the SYNC function and when to use it, memory cues and hot cues, and the three-band EQ bass swap that prevents bass clash.",
    color: "bg-ink",
    source: "rekordbox 6.0.0 Instruction Manual — Playing tracks p.71 · SYNC p.132 · Cues p.77 · Mixer functions p.126",
    missionSlugs: ["beatmatching-manual", "sync-function", "cue-points-dj", "eq-mixing-dj"],
  },
  {
    slug: "transitions",
    world: "dj", chapter: "the-mix-dj", number: 2,
    title: "Transitions",
    tagline: "Long blends, power cuts and loop-based extensions",
    description: "Crossfader technique from blend to cut, the long mix and how to execute it over 16–32 bars, the power cut and when abrupt is right, loops and loop rolls to extend moments and buy time.",
    color: "bg-ink",
    source: "rekordbox 6.0.0 Instruction Manual — Mixing (2 PLAYER mode) p.98 · Loop p.140 · Mixer functions p.126",
    missionSlugs: ["crossfader-technique", "long-mix-blend", "transitions-cut-dj", "loop-function-dj"],
  },

  // Chapter 4: Performance
  {
    slug: "crowd-and-energy",
    world: "dj", chapter: "dj-performance", number: 1,
    title: "Crowd & Energy",
    tagline: "Reading body language, set arcs and harmonic mixing",
    description: "Reading crowd body language and dance floor density, the warm-up to peak to wind-down set arc, harmonic mixing with the Camelot Wheel in practice, and Beat FX used with restraint.",
    color: "bg-ink",
    source: "rekordbox 6.0.0 Instruction Manual — Key display p.9 · Effects in PERFORMANCE mode p.155 · Wikipedia — DJing",
    missionSlugs: ["reading-the-crowd", "set-structure-dj", "harmonic-mixing-dj", "effects-performance-dj"],
  },
  {
    slug: "the-working-dj",
    world: "dj", chapter: "dj-performance", number: 2,
    title: "The Working DJ",
    tagline: "Energy management, set prep and handling live mistakes",
    description: "Energy peaks and valleys over a long set, defining and protecting your sound identity, the full professional set preparation checklist, and how to recover from train wrecks with composure.",
    color: "bg-ink",
    source: "rekordbox 6.0.0 Instruction Manual — Preparing for DJ performance p.66",
    missionSlugs: ["energy-management-dj", "genre-strategy-dj", "preparing-a-set-dj", "live-mistakes-dj"],
  },

  // Chapter 5: Mastery
  {
    slug: "advanced-technique-dj",
    world: "dj", chapter: "dj-mastery", number: 1,
    title: "Advanced Technique",
    tagline: "Effects deep dive, loop performance, key shifting and stems",
    description: "Advanced effects use as an instrument (reverb wash, flanger, phaser), hot cue juggling and loop halving for tension, Master Tempo key shifting for harmonic compatibility, and Stems mode isolating individual elements.",
    color: "bg-ink",
    source: "rekordbox 6.0.0 Instruction Manual — Beat FX p.155 · Loop p.140 · Hot cues p.133 · Key display p.9 · Stems",
    missionSlugs: ["effects-deep-dj", "loop-performance-dj", "harmonic-key-shift-dj", "stem-djing"],
  },
  {
    slug: "career-and-identity",
    world: "dj", chapter: "dj-mastery", number: 2,
    title: "Career & Identity",
    tagline: "Recording, DVS, the business of DJing and your artistic voice",
    description: "Recording your set in rekordbox and with external recorders, DVS and digital vinyl systems (Serato/Traktor), rates and riders and promotional mixes, and what it means to develop a unique artistic identity.",
    color: "bg-ink",
    source: "rekordbox 6.0.0 Instruction Manual — Recording p.163 · Wikipedia — Digital vinyl system",
    missionSlugs: ["recording-your-set-dj", "dvs-basics", "dj-business", "dj-advanced-complete"],
  },

  // ── PRODUCER ──────────────────────────────────────────────────────────────
  // Chapter 1: First Contact
  {
    slug: "the-interface",
    world: "producer", chapter: "first-contact", number: 1,
    title: "The Interface",
    tagline: "The Live mental model, browser, preferences and Session View",
    description: "What Ableton Live is and how it compares to other DAWs, the browser and file management, preferences and audio setup, and Session View — the clip launcher at the heart of Live's unique workflow.",
    color: "bg-sun",
    source: "Ableton Live 12 Reference Manual",
    missionSlugs: ["what-is-live", "interface-tour", "browser", "preferences", "files-projects", "session-view"],
  },
  {
    slug: "clips-and-workflow",
    world: "producer", chapter: "first-contact", number: 2,
    title: "Clips & Workflow",
    tagline: "Arrangement View, clips, tracks, scenes and workflow upgrades",
    description: "Arrangement View for timeline production, the MIDI vs Audio clip distinction, tracks and their types, Scenes and Follow Actions for live performance, Capture MIDI and Take Lanes for non-destructive recording.",
    color: "bg-sun",
    source: "Ableton Live 12 Reference Manual",
    missionSlugs: ["arrangement-view", "clips", "tracks", "scenes-follow", "capture-midi", "take-lanes"],
  },

  // Chapter 2: Sound & MIDI
  {
    slug: "midi-and-audio",
    world: "producer", chapter: "sound-and-midi", number: 1,
    title: "MIDI & Audio",
    tagline: "Piano Roll, warping, recording, comping, slicing and MPE",
    description: "The MIDI Piano Roll in full detail, audio clips and clip properties, all warp modes and when to use each, recording audio with overdub and punch-in, comping takes, slicing to MIDI, MPE and microtuning, and warp modes deep dive.",
    color: "bg-sun",
    source: "Ableton Live 12 Reference Manual",
    missionSlugs: ["midi-piano-roll", "audio-clips", "warping", "recording-audio", "comping", "slicing", "mpe-tuning", "warp-modes-deep"],
  },
  {
    slug: "core-instruments",
    world: "producer", chapter: "sound-and-midi", number: 2,
    title: "Core Instruments",
    tagline: "Every built-in Live instrument from Drum Rack to Sampler",
    description: "Instruments Overview, Drum Rack as beat construction centre, Wavetable for modern synthesis, Operator for FM synthesis, Sampler and Simpler for sample-based production.",
    color: "bg-sun",
    source: "Ableton Live 12 Reference Manual",
    missionSlugs: ["instruments-overview", "drum-rack", "wavetable", "operator", "sampler-simpler"],
  },
  {
    slug: "core-effects",
    world: "producer", chapter: "sound-and-midi", number: 3,
    title: "Core Effects",
    tagline: "EQ Eight, Compressor, Reverb, Delay, Saturator and Racks",
    description: "EQ Eight for surgical and broad tonal shaping, Compressor for dynamic control, Reverb and Delay for space, Saturator and Distortion for harmonic content, MIDI Effects as compositional tools, and Racks with Macros for flexible routing.",
    color: "bg-sun",
    source: "Ableton Live 12 Reference Manual",
    missionSlugs: ["eq-eight", "compressor", "reverb-delay", "saturator-distortion", "midi-effects", "racks-macros"],
  },

  // Chapter 3: The Mix
  {
    slug: "mixing-essentials",
    world: "producer", chapter: "the-mix-producer", number: 1,
    title: "Mixing Essentials",
    tagline: "Mixer, sends, routing, automation and modulation",
    description: "The Live mixer and gain staging, Sends and Returns for shared effects buses, Groups and complex routing architectures, Automation lanes for parameter changes over time, and Modulation Lanes for LFO-style automation.",
    color: "bg-sun",
    source: "Ableton Live 12 Reference Manual",
    missionSlugs: ["the-mixer", "sends-returns", "groups-routing", "automation", "modulation-lanes"],
  },
  {
    slug: "advanced-mixing",
    world: "producer", chapter: "the-mix-producer", number: 2,
    title: "Advanced Mixing",
    tagline: "Sidechain, Max for Live, Glue Compressor and True Peak",
    description: "Sidechain compression and the pumping effect, Max for Live as an extension platform, the Glue Compressor for bus glue, and the Limiter with True Peak mode for mastering-safe output.",
    color: "bg-sun",
    source: "Ableton Live 12 Reference Manual",
    missionSlugs: ["sidechain", "max-for-live", "glue-compressor", "limiter-truepeak"],
  },

  // Chapter 4: Performance & Flow
  {
    slug: "controllers-and-mapping",
    world: "producer", chapter: "performance-and-flow", number: 1,
    title: "Controllers & Mapping",
    tagline: "Push 3, MIDI mapping, Link, Push workflow and Macro Variations",
    description: "Push 3 as a standalone instrument, MIDI Mapping mode for custom control, Tempo Following for reactive tempo, Ableton Link in practice for multi-device sync, Push 3 Workflow deep dive, and Macro Variations for live performance.",
    color: "bg-sun",
    source: "Ableton Live 12 Reference Manual",
    missionSlugs: ["push-controllers", "midi-mapping", "tempo-following", "ableton-link-sync", "push3-workflow", "macro-variations"],
  },
  {
    slug: "live-output",
    world: "producer", chapter: "performance-and-flow", number: 2,
    title: "Live Output",
    tagline: "CV Tools, Ableton Link, exporting and project management",
    description: "CV Tools for modular synthesis integration, Ableton Link protocol, export settings for streaming and distribution, Live Sets and Projects organisation, and Troubleshooting common audio and MIDI issues.",
    color: "bg-sun",
    source: "Ableton Live 12 Reference Manual",
    missionSlugs: ["cv-tools", "ableton-link", "exporting", "live-sets-projects", "troubleshooting"],
  },

  // Chapter 5: Advanced
  {
    slug: "deep-instruments",
    world: "producer", chapter: "advanced-producer", number: 1,
    title: "Deep Instruments",
    tagline: "Sampler, Drift, Granulator III, physical modelling and more",
    description: "Sampler in full depth for advanced sample manipulation, Drift for analog-character synthesis, Granulator III for granular processing, Collision/Tension/Electric/Analog physical modelling instruments, Bass & Poli, Instrument Rack stacking, MIDI Effects Tour and External Instrument.",
    color: "bg-sun",
    source: "Ableton Live 12 Reference Manual",
    missionSlugs: ["sampler-deep", "drift", "granulator-iii", "collision-tension-electric", "bass-poli", "instrument-rack", "midi-effects-tour", "external-instrument"],
  },
  {
    slug: "live12-devices",
    world: "producer", chapter: "advanced-producer", number: 2,
    title: "Live 12 Devices",
    tagline: "Meld, Drum Sampler, Hybrid Reverb and Roar",
    description: "The four new devices introduced in Live 12: Meld for harmonic layering, Drum Sampler for next-generation drum sound design, Hybrid Reverb for algorithmic and convolution reverb, and Roar for analog-character saturation.",
    color: "bg-sun",
    source: "Ableton Live 12 Reference Manual",
    missionSlugs: ["meld", "drum-sampler", "hybrid-reverb", "roar"],
  },
  {
    slug: "live12-power",
    world: "producer", chapter: "advanced-producer", number: 3,
    title: "Live 12 Power Features",
    tagline: "Stem separation, MIDI transforms, Scale Awareness and more",
    description: "Stem Separation for isolating elements of any audio file, MIDI Transformations for generative composition, Scale Awareness for key-locked production, Sound Similarity Search, Comping Flow improvements, Groove Pool, Linked-Track Editing, Push 3 Standalone mode, CPU and audio optimisation, and Accessibility features.",
    color: "bg-sun",
    source: "Ableton Live 12 Reference Manual",
    missionSlugs: ["stem-separation", "midi-transforms", "scale-awareness", "sound-similarity", "comping-flow", "groove-pool", "linked-track-editing", "push3-standalone", "cpu-audio-setup", "accessibility-features"],
  },

  // Chapter 6: Synthesis (learningsynths.ableton.com)
  {
    slug: "synth-sound",
    world: "producer", chapter: "synthesis", number: 1,
    title: "Sound",
    tagline: "What sound is — before you touch a synth",
    description: "Pressure waves, pitch vs amplitude, timbre, harmonics and noise. The physical vocabulary every synth knob ultimately changes.",
    color: "bg-sun",
    source: "learningsynths.ableton.com",
    missionSlugs: ["synth-what-is-sound", "synth-pitch-vs-amplitude", "synth-timbre", "synth-harmonics", "synth-noise"],
  },
  {
    slug: "synth-shaping",
    world: "producer", chapter: "synthesis", number: 2,
    title: "Oscillators & Shaping",
    tagline: "Pick a wave, blend it, filter it, give it an envelope",
    description: "Sine, saw, square and triangle oscillators. Mixing and detuning two oscillators. Low-pass and high-pass filters. Amp and filter envelopes — the four-stage ADSR that turns a buzz into a pluck, a pad or a bass.",
    color: "bg-sun",
    source: "learningsynths.ableton.com",
    missionSlugs: ["synth-oscillators", "synth-mixing-oscillators", "synth-detune-unison", "synth-filters", "synth-amp-envelope", "synth-filter-envelope", "synth-amp-vs-filter-env"],
  },
  {
    slug: "synth-movement",
    world: "producer", chapter: "synthesis", number: 3,
    title: "Movement & Character",
    tagline: "LFOs, modulation, FM, effects and building your own patch",
    description: "LFOs for vibrato, wobble and tremolo. Modulation routing. FM basics. Chorus/delay/reverb on synths. Anatomy of bass, lead, pad and pluck presets — then build your own from scratch.",
    color: "bg-sun",
    source: "learningsynths.ableton.com",
    missionSlugs: ["synth-lfo", "synth-modulation-routing", "synth-fm-basics", "synth-effects", "synth-preset-anatomy", "synth-build-your-own"],
  },
];

export function pathBySlug(slug: string) {
  return PATHS.find((p) => p.slug === slug);
}

export function pathsByChapter(chapterSlug: string) {
  return PATHS.filter((p) => p.chapter === chapterSlug).sort((a, b) => a.number - b.number);
}

export function pathsByWorld(world: LearningPath["world"]) {
  return PATHS.filter((p) => p.world === world);
}
