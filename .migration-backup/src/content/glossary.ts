// Single source of truth for glossary terms.
// Consumed by /glossary route and inline <Term> tooltips inside lessons.

export type GlossaryCat =
  | "Workflow"
  | "Devices"
  | "Audio"
  | "MIDI"
  | "Performance"
  | "Files"
  | "Live 12";

export type GlossaryTerm = { term: string; def: string; cat: GlossaryCat };

export const TERMS: GlossaryTerm[] = [
  // Workflow
  { cat: "Workflow", term: "Arrangement View", def: "Live's linear timeline view for composing full songs end-to-end. Tracks stack vertically, time runs left-to-right." },
  { cat: "Workflow", term: "Session View", def: "Live's clip grid for non-linear performance and ideation. Tracks vertical, scenes horizontal." },
  { cat: "Workflow", term: "Clip", def: "A single piece of musical content. MIDI clips contain note instructions; audio clips contain a referenced sample." },
  { cat: "Workflow", term: "Scene", def: "A row in Session View. Launching the scene fires every clip on that row simultaneously." },
  { cat: "Workflow", term: "Locator", def: "A bookmark on the Arrangement timeline (Intro, Verse, Drop). Click to jump." },
  { cat: "Workflow", term: "Loop Brace", def: "The grey bar above the Arrangement that defines the loop region." },
  { cat: "Workflow", term: "Browser", def: "Left sidebar containing Sounds, Drums, Instruments, Audio Effects, MIDI Effects, Samples, Packs and your User Library." },
  { cat: "Workflow", term: "Detail View", def: "Bottom panel that opens when you double-click a clip or device — the editor for whatever you've selected." },
  { cat: "Workflow", term: "Control Bar", def: "Top strip with tempo, transport, metronome, follow, and global quantize controls." },
  { cat: "Workflow", term: "Info View", def: "Bottom-left panel that describes whatever you're hovering — the in-app help." },
  { cat: "Workflow", term: "Crossfader", def: "DJ-style A/B blender at the bottom of the mixer; assign tracks to A or B." },
  { cat: "Workflow", term: "Cue", def: "Headphone monitor send for pre-listening before bringing into the main mix." },
  { cat: "Workflow", term: "Take Lane", def: "Multiple recording passes stacked under a track for comping (Live 11+)." },
  { cat: "Workflow", term: "Comping", def: "Stitching the best moments from multiple takes into a single performance." },
  { cat: "Workflow", term: "Group Track", def: "A folder + audio bus combining multiple child tracks. Press Cmd/Ctrl+G." },
  { cat: "Workflow", term: "Return Track", def: "Destination track for sends; usually hosts shared effects like reverb or delay." },
  { cat: "Workflow", term: "Send / Pre / Post", def: "Pre-fader send is independent of track volume; post-fader follows it." },
  { cat: "Workflow", term: "Macro", def: "One of 16 knobs on a Rack. Map any inner parameter (or many) to one knob." },
  { cat: "Workflow", term: "Macro Variation", def: "A snapshot of all 16 macro values, recallable instantly. Great for live morphing." },
  { cat: "Workflow", term: "Quantize", def: "Snap notes, clips or recordings to a rhythmic grid (1 bar, 1/4, 1/16…)." },
  { cat: "Workflow", term: "Global Quantize", def: "Default launch quantize for all clips — usually 1 Bar so launches stay in time." },
  { cat: "Workflow", term: "Follow Action", def: "Rule for what a clip does after it ends: Stop, Play Again, Next, Previous, Other, Random, etc." },
  { cat: "Workflow", term: "Freeze", def: "Render a track temporarily to audio to save CPU; can be unfrozen anytime." },
  { cat: "Workflow", term: "Bounce in Place", def: "Render a track to audio, replacing the source. Destructive but lighter on CPU." },
  { cat: "Workflow", term: "Resampling", def: "Routing the master output back into a track input to record what you hear." },
  { cat: "Workflow", term: "Ableton Link", def: "Network protocol that keeps multiple apps and devices in tempo sync." },
  { cat: "Workflow", term: "Tempo Follower", def: "Tracks the tempo of an audio input and adjusts the project tempo to match (Live 11+)." },

  // Audio
  { cat: "Audio", term: "Warp", def: "Time-stretching that locks any audio sample to the project tempo without changing pitch." },
  { cat: "Audio", term: "Warp Marker", def: "A pin on the waveform telling Live where a transient lives so it can stretch around it." },
  { cat: "Audio", term: "Beats Mode", def: "Warp algorithm for percussive material — slices around transients." },
  { cat: "Audio", term: "Tones Mode", def: "Warp algorithm for monophonic melodic material like vocals or bass." },
  { cat: "Audio", term: "Texture Mode", def: "Warp algorithm for pads, ambience, polyphonic material." },
  { cat: "Audio", term: "Re-Pitch", def: "Tape-style stretch where pitch follows speed (faster = higher)." },
  { cat: "Audio", term: "Complex / Complex Pro", def: "CPU-heavy warp modes for full mixes. Pro adds formant control." },
  { cat: "Audio", term: "Sample Rate", def: "How many amplitude samples per second a digital recording stores. CD quality = 44.1 kHz." },
  { cat: "Audio", term: "Bit Depth", def: "How many bits per sample. 16-bit = CD; 24-bit = production standard." },
  { cat: "Audio", term: "Buffer Size", def: "How many samples Live processes at a time. Lower = less latency, more CPU strain." },
  { cat: "Audio", term: "Latency", def: "Delay between an action and hearing the result. Mostly determined by buffer size." },
  { cat: "Audio", term: "Headroom", def: "Distance between your loudest peak and 0 dBFS. Aim for 6 dB to leave room for mastering." },
  { cat: "Audio", term: "Transient", def: "The sharp attack at the start of a sound (kick thud, snare crack). What punch is made of." },
  { cat: "Audio", term: "EQ", def: "Equaliser. Cuts or boosts specific frequency ranges to shape tone." },
  { cat: "Audio", term: "High-pass", def: "Filter that removes frequencies below the cutoff. Used to clean low rumble off vocals, hats." },
  { cat: "Audio", term: "Low-pass", def: "Filter that removes frequencies above the cutoff. Makes things darker." },
  { cat: "Audio", term: "Resonance / Q", def: "Boost at the cutoff frequency. High Q = ringy, acid-bass character." },
  { cat: "Audio", term: "Compression", def: "Turning down anything above a threshold to even out dynamics." },
  { cat: "Audio", term: "Threshold", def: "The level at which a compressor or gate starts working." },
  { cat: "Audio", term: "Ratio", def: "How aggressively a compressor squashes signal above the threshold (4:1, 10:1…)." },
  { cat: "Audio", term: "Attack (Comp)", def: "How fast the compressor clamps after threshold is crossed." },
  { cat: "Audio", term: "Release (Comp)", def: "How fast the compressor lets go after the signal drops back below threshold." },
  { cat: "Audio", term: "Knee", def: "How smoothly compression engages around the threshold. Soft = gentle." },
  { cat: "Audio", term: "Makeup Gain", def: "Boost after compression to restore the level you reduced." },
  { cat: "Audio", term: "Sidechain", def: "Use one signal as the trigger that controls processing on another. Classic kick→bass duck." },
  { cat: "Audio", term: "Saturation", def: "Generating harmonics by reshaping the waveform. Adds warmth, grit, or distortion." },
  { cat: "Audio", term: "Reverb", def: "Simulation of how sound decays in a real or imagined space." },
  { cat: "Audio", term: "Predelay", def: "Gap between dry signal and the start of the reverb tail. Keeps vocals upfront." },
  { cat: "Audio", term: "Convolution", def: "Multiplying your signal against an impulse response of a real space." },
  { cat: "Audio", term: "Impulse Response (IR)", def: "A recording of how a space (or hardware) responds to a single click." },
  { cat: "Audio", term: "Delay", def: "Echoes — a delayed copy of the input, optionally feeding back for repeats." },
  { cat: "Audio", term: "Feedback (Delay)", def: "How much of each delay echo gets fed back to create more echoes. >0.9 self-oscillates." },
  { cat: "Audio", term: "Chorus", def: "Modulated short delay summed with dry signal to create width and lushness." },
  { cat: "Audio", term: "Phaser", def: "Notch filters swept by an LFO. The classic 'whoosh'." },
  { cat: "Audio", term: "Flanger", def: "Like chorus but with shorter delay and feedback — jet-engine sweep." },
  { cat: "Audio", term: "LFO", def: "Low-Frequency Oscillator — a slow waveform used to modulate parameters." },
  { cat: "Audio", term: "Stereo Field", def: "The space between your left and right speakers. Pan + width + delay live here." },
  { cat: "Audio", term: "Phase", def: "How two waveforms align in time. Cancellation happens when they're inverted." },
  { cat: "Audio", term: "Limiter", def: "An extreme compressor that prevents signal from passing a ceiling. Used on the master." },
  { cat: "Audio", term: "True Peak", def: "Inter-sample peak measurement. More accurate than sample-peak for digital ceilings." },

  // MIDI
  { cat: "MIDI", term: "MIDI", def: "Musical Instrument Digital Interface. A protocol for sending note and controller data — not audio." },
  { cat: "MIDI", term: "Velocity", def: "How hard a MIDI note is hit. Most instruments map velocity to volume and tone." },
  { cat: "MIDI", term: "Note On / Off", def: "The two MIDI messages that start and stop a note." },
  { cat: "MIDI", term: "CC", def: "Control Change — a MIDI controller value (0–127) for things like mod wheel or filter cutoff." },
  { cat: "MIDI", term: "Aftertouch", def: "MIDI message generated by pressing harder on a key after the initial strike." },
  { cat: "MIDI", term: "MPE", def: "MIDI Polyphonic Expression — per-note pitch, glide, slide, pressure. Meld is MPE-first." },
  { cat: "MIDI", term: "Pencil Mode", def: "Draw notes/automation freely. Toggle with B." },
  { cat: "MIDI", term: "Piano Roll", def: "The MIDI editor — pitches up the side, time across the top." },
  { cat: "MIDI", term: "MIDI Effect", def: "Processes MIDI before it reaches the instrument (Arpeggiator, Chord, Scale)." },
  { cat: "MIDI", term: "MIDI Map", def: "Per-set assignment of a hardware control to a Live parameter (Cmd/Ctrl + M)." },
  { cat: "MIDI", term: "Note Transformations", def: "Live 12 generative MIDI tools: Stacks, Rhythm, Shape, Recombine, Connect, Seed." },
  { cat: "MIDI", term: "Generative MIDI", def: "Algorithms that create or modify note patterns rather than you drawing them." },
  { cat: "MIDI", term: "Quantize (MIDI)", def: "Snap selected notes to a grid value." },
  { cat: "MIDI", term: "Strength (Quantize)", def: "Partial quantize — 50% pulls notes halfway to the grid for a humanised feel." },

  // Devices
  { cat: "Devices", term: "Operator", def: "Live's 4-operator FM synth. Carriers output, modulators warp the carriers' frequency." },
  { cat: "Devices", term: "Wavetable", def: "Live's modern workhorse synth — two oscillators scanning through wavetables." },
  { cat: "Devices", term: "Drift", def: "Analog-modelled mono/poly synth with character (Live 11+)." },
  { cat: "Devices", term: "Meld", def: "MPE-first dual-engine synth in Live 12." },
  { cat: "Devices", term: "Sampler", def: "Multi-sample instrument with key/velocity zones. For full sampled instruments." },
  { cat: "Devices", term: "Simpler", def: "Single-sample instrument with three modes: Classic, One-Shot, Slice." },
  { cat: "Devices", term: "Drum Rack", def: "Container of 16+ pads, each hosting a Simpler or full chain on its own MIDI note." },
  { cat: "Devices", term: "Choke Group", def: "Pads in the same group cut each other off — perfect for hi-hats." },
  { cat: "Devices", term: "Rack", def: "Container of devices with Macros and parallel Chains. Instrument/Audio/MIDI/Drum." },
  { cat: "Devices", term: "Chain Selector", def: "Splits which of a rack's chains receive input by velocity, key, or chain zone." },
  { cat: "Devices", term: "EQ Eight", def: "Live's main EQ — eight parametric bands with multiple shapes per band." },
  { cat: "Devices", term: "Compressor", def: "Live's main dynamics processor with Peak, RMS, and Expand modes." },
  { cat: "Devices", term: "Glue Compressor", def: "SSL-style bus compressor — used on groups and the master to glue a mix." },
  { cat: "Devices", term: "Saturator", def: "Waveshaper with soft, hard, tube, digital and other curves." },
  { cat: "Devices", term: "Roar", def: "Multi-band saturator/distortion in Live 12 with parallel paths and feedback." },
  { cat: "Devices", term: "Hybrid Reverb", def: "Reverb combining convolution + algorithmic engines (Live 11+)." },
  { cat: "Devices", term: "Echo", def: "Analog-flavoured delay with character, modulation and stereo width." },
  { cat: "Devices", term: "Auto Filter", def: "Filter with LFO + envelope follower — classic dub and acid sweeps." },
  { cat: "Devices", term: "Auto Pan", def: "LFO-driven panning for stereo width and rhythm." },
  { cat: "Devices", term: "Vocoder", def: "Imposes the spectrum of one signal (modulator) onto another (carrier)." },
  { cat: "Devices", term: "Max for Live (M4L)", def: "Visual coding environment baked into Live Suite for building custom devices." },

  // Live 12
  { cat: "Live 12", term: "Modulation Lanes", def: "Offset-based parameter movement on top of automation, new in Live 12." },
  { cat: "Live 12", term: "Sound Similarity Search", def: "Browser feature that finds samples sonically similar to a chosen one." },
  { cat: "Live 12", term: "Tags / Categories", def: "Live 12 tagging system that classifies sounds across all your packs." },
  { cat: "Live 12", term: "MIDI Stacks", def: "Generative tool that builds chord stacks from a single note." },
  { cat: "Live 12", term: "Performance Pack", def: "Live 12 system for organising live performances with scenes & macros." },

  // Performance
  { cat: "Performance", term: "Push 3", def: "Ableton's hardware controller; can run Live standalone, no laptop required." },
  { cat: "Performance", term: "Scene Launch", def: "The triangle button that fires an entire row of clips." },
  { cat: "Performance", term: "Capture MIDI", def: "Retroactively grabs the last few bars you played, even without recording armed." },
  { cat: "Performance", term: "Session Record", def: "The bottom-bar record button that captures launched clips into Arrangement." },
  { cat: "Performance", term: "CV Tools", def: "Max for Live devices that send/receive control voltage to modular synths." },
  { cat: "Performance", term: "Aggregate Device", def: "macOS combined audio interface across multiple devices." },

  // Files
  { cat: "Files", term: "Live Set (.als)", def: "A single Live project file." },
  { cat: "Files", term: "Live Pack (.alp)", def: "A bundled, distributable project (often instructional)." },
  { cat: "Files", term: "Live Clip (.alc)", def: "A single saved clip with all its settings, devices, and warp markers." },
  { cat: "Files", term: "Live Device (.adv)", def: "A single saved device preset." },
  { cat: "Files", term: "Analysis File (.asd)", def: "Per-sample metadata Live writes alongside audio (warp markers, etc.)." },
  { cat: "Files", term: "Collect All & Save", def: "Copies every external sample into the project folder so it's portable." },
  { cat: "Files", term: "Auto-Save", def: "Background project snapshot in the Backup folder. Turn it on." },
  { cat: "Files", term: "Library", def: "The folder where Packs install. Set its location in Preferences." },

  // Phase 10a additions
  { cat: "Workflow", term: "Groove Pool", def: "A storage area for swing and timing templates that can be applied to any Clip to change its feel." },
  { cat: "Workflow", term: "Gain Staging", def: "The process of managing signal levels at each stage of the signal path to prevent clipping and minimize noise." },
  { cat: "Workflow", term: "Parallel Processing", def: "Routing a signal to two or more paths simultaneously to mix dry and processed versions together." },
  { cat: "Workflow", term: "Crossfade", def: "A transition between two adjacent audio clips where one fades out while the other fades in." },
  { cat: "Workflow", term: "Time Signature Change", def: "A marker placed in the Arrangement View to alter the meter of the project at a specific point." },
  { cat: "Workflow", term: "Fades", def: "Handles at the start and end of audio clips used to prevent clicks or create volume transitions." },
  { cat: "Workflow", term: "Track Activator", def: "The button that toggles a track on or off, functioning as a mute switch." },
  { cat: "Workflow", term: "Consolidate", def: "A command that joins multiple selected clips into a single new audio or MIDI file." },
  { cat: "Workflow", term: "Scale Mode", def: "A Live 12 feature that highlights or restricts MIDI notes to a specific musical key." },
  { cat: "Workflow", term: "Probability", def: "A MIDI parameter that determines the likelihood of a note playing when triggered." },
  { cat: "Workflow", term: "MIDI Chase", def: "A setting that ensures MIDI notes are triggered even if playback starts in the middle of the note." },
  { cat: "Devices", term: "Utility", def: "A versatile tool for controlling gain, phase, stereo width, and channel routing." },
  { cat: "Devices", term: "Gate", def: "A dynamics processor that silences signals falling below a certain volume threshold." },
  { cat: "Devices", term: "Multiband Dynamics", def: "A tool that provides compression and expansion for three independent frequency bands." },
  { cat: "Devices", term: "Channel EQ", def: "A simple three-band equalizer modeled after traditional mixer channel strips." },
  { cat: "Devices", term: "Pedal", def: "An effect modeling guitar distortion, overdrive, and fuzz circuits." },
  { cat: "Devices", term: "Amp", def: "An effect that emulates the sound and circuitry of classic guitar amplifiers." },
  { cat: "Devices", term: "Cabinet", def: "A device that simulates the frequency response of various guitar speaker enclosures." },
  { cat: "Devices", term: "Erosion", def: "An effect that adds digital artifacts or filtered noise to a signal." },
  { cat: "Devices", term: "Redux", def: "A bit-crusher and downsampler used to create lo-fi digital textures." },
  { cat: "Devices", term: "Vinyl Distortion", def: "An effect that adds crackle, hiss, and harmonic distortion common to vinyl records." },
  { cat: "Devices", term: "Beat Repeat", def: "A performance tool that samples and repeats short snippets of incoming audio rhythmically." },
  { cat: "Devices", term: "Grain Delay", def: "An effect that splits a signal into tiny grains and delays them individually with pitch shifting." },
  { cat: "Devices", term: "Spectral Resonator", def: "An effect that processes audio in the frequency domain for metallic and tonal transformations." },
  { cat: "Devices", term: "Spectral Time", def: "A hybrid delay and freeze effect that operates on the spectral components of a sound." },
  { cat: "Devices", term: "Tuner", def: "A utility device that displays the pitch and frequency of incoming audio." },
  { cat: "Devices", term: "Corpus", def: "An effect that simulates the resonant characteristics of physical objects like tubes or plates." },
  { cat: "Devices", term: "Resonators", def: "A series of parallel tunable filters that add harmonic resonance to a signal." },
  { cat: "Devices", term: "External Instrument", def: "A routing device used to integrate hardware synthesizers into the Live set." },
  { cat: "Devices", term: "External Audio Effect", def: "A routing device used to send audio to outboard hardware and back into Live." },
  { cat: "Devices", term: "CV Clock Out", def: "A tool to sync external modular hardware via Control Voltage timing signals." },
  { cat: "Devices", term: "Envelope Follower", def: "A Max for Live modulator that uses the volume of a signal to control other parameters." },
  { cat: "Audio", term: "Mid/Side (M/S)", def: "A processing technique that separates the center signal from the stereo differences." },
  { cat: "Audio", term: "Dithering", def: "Noise added during bit-depth reduction to prevent quantization distortion." },
  { cat: "Audio", term: "LUFS", def: "Loudness Units relative to Full Scale, the standard for measuring perceived loudness." },
  { cat: "Audio", term: "RMS", def: "Root Mean Square, a measurement of the average energy level of an audio signal." },
  { cat: "Audio", term: "Peak", def: "The maximum instantaneous voltage or numerical value reached by an audio signal." },
  { cat: "Audio", term: "Loudness War", def: "The trend of increasing audio levels in mastering at the expense of dynamic range." },
  { cat: "Audio", term: "Transient Shaper", def: "A processor used to specifically adjust the attack and sustain portions of a sound." },
  { cat: "Audio", term: "Soft Clip", def: "A saturation technique that rounds off peaks to prevent harsh digital clipping." },
  { cat: "Audio", term: "Comb Filtering", def: "A frequency response interference caused by adding a delayed signal to the original." },
  { cat: "Audio", term: "Harmonics", def: "Frequency components that are integer multiples of a fundamental frequency." },
  { cat: "Audio", term: "Inter-Sample Peaks", def: "Peaks that occur between digital samples and can cause clipping in analog conversion." },
  { cat: "Audio", term: "Normalize", def: "The process of increasing the gain of an audio file so its loudest peak reaches 0 dBFS." },
  { cat: "Audio", term: "De-Esser", def: "A frequency-dependent compressor used to reduce sibilance in vocal recordings." },
  { cat: "Audio", term: "Inverse Phase", def: "The process of flipping the polarity of a waveform to fix cancellation issues." },
  { cat: "Audio", term: "Subtractive Synthesis", def: "Creating sound by removing frequencies from a complex waveform using filters." },
  { cat: "Audio", term: "FM Synthesis", def: "Frequency Modulation, where one oscillator's frequency is modulated by another's." },
  { cat: "MIDI", term: "Velocity Range", def: "The span between the lowest and highest velocity values in a MIDI clip." },
  { cat: "MIDI", term: "Program Change", def: "A MIDI message used to switch patches or presets on an instrument." },
  { cat: "MIDI", term: "NRPN", def: "Non-Registered Parameter Number, used for high-resolution control of hardware." },
  { cat: "MIDI", term: "SysEx", def: "System Exclusive messages used to communicate manufacturer-specific data." },
  { cat: "MIDI", term: "Note Echo", def: "A MIDI effect that creates rhythmic repetitions of MIDI notes." },
  { cat: "MIDI", term: "Arpeggiator", def: "A MIDI effect that sequences the notes of a chord into a rhythmic pattern." },
  { cat: "MIDI", term: "MIDI Monitor", def: "A tool used to view incoming MIDI data for troubleshooting purposes." },
  { cat: "MIDI", term: "Note Length", def: "A MIDI effect used to manipulate the duration of incoming MIDI notes." },
  { cat: "MIDI", term: "Random (MIDI)", def: "A device that adds unpredictable pitch variations to incoming MIDI notes." },
  { cat: "MIDI", term: "Chord Device", def: "A MIDI effect that adds up to six pitched harmonies to a single incoming note." },
  { cat: "MIDI", term: "Velocity Device", def: "A MIDI effect used to remap, compress, or randomize note velocities." },
  { cat: "MIDI", term: "Pitch Device", def: "A MIDI effect that transposes incoming notes by a set number of semitones." },
  { cat: "Performance", term: "Clip Envelope", def: "Automation data contained within a clip that can modulate parameters independently." },
  { cat: "Performance", term: "Scene Tempo", def: "A tempo value assigned to a scene name that triggers when the scene is launched." },
  { cat: "Performance", term: "Legato Mode", def: "A clip launch setting where a new clip picks up the playback position of the previous one." },
  { cat: "Performance", term: "Action Time", def: "The quantized duration after which a Follow Action will be triggered." },
  { cat: "Performance", term: "MIDI Remote Script", def: "A Python script that defines how a hardware controller interacts with Live." },
  { cat: "Performance", term: "User Mode", def: "A controller state that allows for custom manual MIDI mapping." },
  { cat: "Live 12", term: "Similarity Search", def: "A browser feature that finds samples or presets with similar sonic characteristics." },
  { cat: "Live 12", term: "View Filter", def: "The side-bar in the Live 12 browser used to toggle visibility of tagged content." },
  { cat: "Live 12", term: "Strum", def: "A MIDI transformation that offsets the start times of notes in a chord." },
  { cat: "Live 12", term: "Arpeggiate (Transform)", def: "A MIDI transformation tool that breaks chords into rhythmic patterns within the clip." },
  { cat: "Live 12", term: "Time Warp", def: "A MIDI transformation that stretches or compresses the timing of selected notes." },
  { cat: "Live 12", term: "Split/Chop", def: "An operation to divide MIDI notes into multiple smaller segments." },
  { cat: "Files", term: "Project Folder", def: "A directory containing the Live Set, samples, and related assets." },
  { cat: "Files", term: "Default Set", def: "The template Live loads every time a new project is created." },
  { cat: "Files", term: "Backups Folder", def: "A folder within a project containing previous versions of the Live Set." },
  { cat: "Files", term: "User Library", def: "The location for storing custom presets, defaults, and user-made content." },
  { cat: "Performance", term: "BPM Tap", def: "A button used to set the global tempo by clicking in time with the music." },
  { cat: "Audio", term: "Warp Mode: Pro", def: "An advanced version of the Complex mode with additional formant control." },
  { cat: "Devices", term: "Sampler Zone", def: "An area in Sampler where specific samples are mapped to ranges of keys or velocities." },
  { cat: "Workflow", term: "Solo Safe", def: "A setting that prevents a track from being muted when another track is soloed." },

  // Foundations — acoustics & psychoacoustics
  { cat: "Audio", term: "Fundamental", def: "The lowest frequency of a periodic waveform. It defines the pitch you perceive; everything above it is a harmonic or overtone." },
  { cat: "Audio", term: "Overtone", def: "Any frequency above the fundamental in a complex tone. Harmonic overtones are integer multiples; inharmonic overtones (cymbals, bells) aren't." },
  { cat: "Audio", term: "Partial", def: "A general term for any single sine component in a complex sound — fundamental and overtones are all partials." },
  { cat: "Audio", term: "Timbre", def: "The 'tone colour' that lets you tell a flute from a guitar at the same pitch. Determined by harmonic content + attack/decay envelope." },
  { cat: "Audio", term: "Wavelength", def: "The physical distance one cycle of a wave covers in air. Inversely proportional to frequency — bass has long wavelengths, treble short." },
  { cat: "Audio", term: "dB SPL", def: "Sound Pressure Level in dB, measuring real-world acoustic loudness. 0 dB SPL = threshold of human hearing; 120 dB SPL = pain." },
  { cat: "Audio", term: "dBFS", def: "Decibels relative to Full Scale — the digital scale where 0 dBFS is the loudest sample value a system can represent. Above that = clipping." },
  { cat: "Audio", term: "K-weighting", def: "The frequency-weighting curve LUFS meters use to mimic human hearing — emphasises mids, rolls off subs and extreme highs." },
  { cat: "Audio", term: "True-Peak", def: "Inter-sample peak measurement that accounts for waveform excursions between digital samples — catches clipping that sample-peak meters miss." },
  { cat: "Audio", term: "Hertz", def: "Cycles per second — the unit of frequency. 440 Hz means 440 wave cycles every second." },
  { cat: "Audio", term: "Nyquist Frequency", def: "Half the sample rate — the highest frequency a digital system can represent without aliasing. At 44.1 kHz, Nyquist = 22.05 kHz." },
  { cat: "Audio", term: "Aliasing", def: "Distortion artefacts that appear when frequencies above Nyquist fold back into the audible range. Anti-alias filters prevent it." },
  { cat: "Audio", term: "Clipping", def: "Distortion that happens when a signal exceeds the maximum level a system can represent — peaks get flattened into squares." },
  { cat: "Audio", term: "Noise Floor", def: "The level of background hiss and electronic noise in a system. Quieter material has to live above it to be audible." },
  { cat: "Audio", term: "Codec", def: "Coder/Decoder — software that compresses audio (MP3, AAC, Opus) for storage or streaming, then decodes it for playback." },

  // Foundations — music theory
  { cat: "Workflow", term: "Octave", def: "The interval between a note and one with double or half its frequency. Notes an octave apart share a letter name and sound 'the same' an octave higher or lower." },
  { cat: "Workflow", term: "Semitone", def: "The smallest interval in Western tuning — one piano key to the next. Twelve semitones make an octave." },
  { cat: "Workflow", term: "Tonic", def: "The 'home' note of a key — the one a melody resolves to and a piece usually ends on. Also called the root." },
  { cat: "Workflow", term: "Dominant", def: "The fifth scale degree (V). Builds tension that wants to resolve to the tonic — the engine of Western harmony." },
  { cat: "Workflow", term: "Subdominant", def: "The fourth scale degree (IV). A gentle pull away from the tonic, often used to set up the dominant." },
  { cat: "Workflow", term: "Modulation", def: "(Theory) Changing key mid-song to lift energy or create contrast. (Synthesis) Routing one signal to vary the value of another parameter." },
  { cat: "Workflow", term: "Cadence", def: "A chord progression that creates a sense of ending or pausing. Authentic = V→I; Plagal = IV→I; Deceptive = V→vi." },
  { cat: "Workflow", term: "Pentatonic", def: "A five-note scale (no half steps). Major pentatonic = 1-2-3-5-6; minor pentatonic = 1-♭3-4-5-♭7. Hard to play 'wrong' over its key." },
  { cat: "Workflow", term: "Chromatic", def: "Using all 12 semitones of the octave rather than staying in one key. A chromatic line walks one semitone at a time." },
  { cat: "Workflow", term: "Triad", def: "A three-note chord built by stacking thirds — the basic building block of harmony. Major, minor, diminished, augmented." },
  { cat: "Workflow", term: "Seventh Chord", def: "A triad with a fourth note (the seventh) stacked on top — gives chords a jazzier, more open quality." },
  { cat: "Workflow", term: "Inversion", def: "A chord voiced with a note other than the root in the bass. First inversion = third on bottom; second = fifth on bottom." },
  { cat: "Workflow", term: "Voicing", def: "How the notes of a chord are spread across octaves and instruments — the same chord can sound thin or huge depending on voicing." },
  { cat: "Workflow", term: "Arpeggio", def: "The notes of a chord played one at a time instead of together. The basis of basslines, plucks, and arp-driven leads." },
  { cat: "Workflow", term: "Consonance", def: "Notes/intervals that sound stable and pleasant together — octaves, fifths, thirds. The 'resolved' end of harmonic tension." },
  { cat: "Workflow", term: "Dissonance", def: "Notes/intervals that clash and want to resolve — minor seconds, tritones. Used deliberately to create motion and pull." },
  { cat: "Workflow", term: "Tritone", def: "The interval of three whole tones (six semitones). Historically 'the devil in music' — extremely tense, the engine of dominant-seventh resolution." },
  { cat: "Workflow", term: "Enharmonic", def: "Two note names for the same pitch — C♯ and D♭ sound identical but are spelled differently depending on the key." },
  { cat: "Workflow", term: "Accidental", def: "A sharp, flat, or natural sign placed in front of a note to alter its pitch from the key signature." },

  // Foundations — rhythm
  { cat: "Workflow", term: "Tuplet", def: "Any rhythmic grouping that doesn't fit the prevailing subdivision — triplets (3-in-2), quintuplets (5-in-4), etc." },
  { cat: "Workflow", term: "Syncopation", def: "Placing accents on weak beats or off-beats instead of the expected strong beats — what makes a groove feel 'pushed' or funky." },
  { cat: "Workflow", term: "Downbeat", def: "The first beat of a bar — the strongest accent in most music. The 'one' you tap your foot to." },
  { cat: "Workflow", term: "Upbeat", def: "The unaccented beat before a downbeat — the 'and' between beats. Pickup notes often start on an upbeat." },
  { cat: "Workflow", term: "Swing", def: "Pushing every other sub-beat slightly later to create a triplet-ish lilt instead of straight 16ths. Swing percentage controls how much." },
  { cat: "Workflow", term: "Shuffle", def: "A swung 8th- or 16th-note feel, common in blues, hip-hop, and UK garage. Heavier than light swing." },

  // Synthesis basics
  { cat: "Audio", term: "Envelope", def: "A control signal that shapes how a parameter changes over the lifetime of a note — typically ADSR for an amp envelope." },
  { cat: "Audio", term: "ADSR", def: "Attack-Decay-Sustain-Release — the four stages of a classic envelope. Attack = fade in; Decay = fall to sustain; Sustain = held level; Release = fade out." },
  { cat: "Audio", term: "Attack", def: "The fade-in time at the start of a sound or envelope stage. Short attack = punchy; long attack = pad-like." },
  { cat: "Audio", term: "Sustain", def: "The held level a synth envelope settles to while a note is pressed, before release kicks in." },
  { cat: "Audio", term: "Filter Cutoff", def: "The frequency where a filter starts attenuating signal. The 'tone knob' of most synth patches." },
];

// Slug an arbitrary term for the glossary anchor + URL.
export const slugTerm = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Words that are too short / common in English — skip in auto-wrap to
// avoid false positives in normal prose ("the cue", "a clip").
const AUTO_WRAP_SKIP = new Set([
  "cue", "clip", "scene", "rack", "amp", "gate", "peak", "rms",
  "knee", "phase", "delay", "ratio", "browser", "library", "tuner",
  "comping", "fades", "consolidate", "normalize", "harmonics",
]);

// Lowercase-keyed lookup. Aliases ("Send / Pre / Post") split on slash.
const _map = new Map<string, GlossaryTerm>();
for (const t of TERMS) {
  _map.set(t.term.toLowerCase(), t);
  for (const v of t.term.split(/\s*\/\s*/)) {
    const k = v.trim().toLowerCase();
    if (k) _map.set(k, t);
  }
}

export const lookupTerm = (s: string) => _map.get(s.toLowerCase());

// Sorted longest-first so multi-word terms win during auto-wrap.
// Filtered to >=4 chars and not in skip list.
export const AUTO_WRAP_KEYS = [..._map.keys()]
  .filter((k) => k.length >= 4 && !AUTO_WRAP_SKIP.has(k))
  .sort((a, b) => b.length - a.length);
