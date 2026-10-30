/**
 * Atlas of Ableton Live's own devices: what each one does and when to reach for it.
 * `xml` lists the names Live uses for the device inside a saved Set, so a Set read on
 * /link can point each device back here. Names marked unverified were not seen in real
 * Sets yet; a wrong alias only means that device does not link, nothing breaks.
 * Which edition includes which device changes between Live versions: check Ableton's
 * edition comparison before telling anyone to buy for one device.
 */
export type AtlasGroup = "instrument" | "midi" | "dynamics" | "eq" | "space" | "drive" | "mod" | "creative" | "utility" | "rack" | "max";

export interface AtlasDevice {
  id: string;
  name: string;
  group: AtlasGroup;
  xml: string[];
  /** one plain sentence: what it is */
  does: string;
  /** the job it is best at */
  reach: string;
  /** one thing that saves time or avoids a common mistake */
  tip: string;
}

export const ATLAS_GROUPS: { id: AtlasGroup; label: string; blurb: string }[] = [
  { id: "instrument", label: "Instruments", blurb: "Make sound from MIDI notes." },
  { id: "midi", label: "MIDI effects", blurb: "Change the notes before they reach an instrument." },
  { id: "eq", label: "EQ and filters", blurb: "Shape which frequencies you hear." },
  { id: "dynamics", label: "Dynamics", blurb: "Control how loud, and how consistently loud." },
  { id: "space", label: "Space and time", blurb: "Reverb and delay: where a sound sits and how it echoes." },
  { id: "drive", label: "Drive and colour", blurb: "Add harmonics, grit and warmth." },
  { id: "mod", label: "Modulation", blurb: "Movement: chorus, phasing, panning, filters that sweep." },
  { id: "creative", label: "Creative and resampling", blurb: "Glitch, pitch, resonance and live looping." },
  { id: "utility", label: "Utility", blurb: "Gain, width, tuning and metering." },
  { id: "rack", label: "Racks and containers", blurb: "Group devices so they work as one." },
  { id: "max", label: "Max for Live", blurb: "Devices built on Max, including ones you download." },
];

export const ATLAS: AtlasDevice[] = [
  // instruments
  { id: "wavetable", name: "Wavetable", group: "instrument", xml: ["InstrumentVector"], does: "A synth that morphs between wave shapes, with two oscillators, a sub, two filters and a modulation matrix.", reach: "Modern basses, evolving pads, leads and plucks.", tip: "Move the Wave Position slider while a note plays. The movement is the point of a wavetable." },
  { id: "operator", name: "Operator", group: "instrument", xml: ["Operator"], does: "A four-oscillator FM synth where oscillators modulate each other's frequency.", reach: "Bells, electric pianos, FM bass, metallic and clangy sounds.", tip: "Start from a preset, then change one oscillator's level. FM is easier to learn by ear than by theory." },
  { id: "drift", name: "Drift", group: "instrument", xml: ["Drift"], does: "A simple analog-style synth with two oscillators, a filter and a few modulation sources, built to sound a little unstable.", reach: "Warm basses, pads and leads fast, with few controls.", tip: "The best first synth to learn subtractive sound design on." },
  { id: "analog", name: "Analog", group: "instrument", xml: ["UltraAnalog"], does: "A virtual analog synth with two oscillators, two filters and two amps.", reach: "Classic subtractive basses, strings and brass.", tip: "Turn on both filters in series for a steeper, more vocal sweep." },
  { id: "meld", name: "Meld", group: "instrument", xml: ["InstrumentMeld"], does: "A synth that runs two sound engines at once and blends them, with macro controls.", reach: "Textures and hybrid sounds you can shift with one macro.", tip: "Change the engine on one side only. Mixing two unlike engines is where Meld gets interesting." },
  { id: "simpler", name: "Simpler", group: "instrument", xml: ["OriginalSimpler"], does: "Plays one sample across the keyboard, with three modes: Classic, One-Shot and Slice.", reach: "Turning any recording into a playable instrument; chopping loops.", tip: "Slice mode plus the Slice by Beat or Transient option turns a drum loop into playable hits." },
  { id: "sampler", name: "Sampler", group: "instrument", xml: ["MultiSampler"], does: "A multisample instrument that maps many samples across keys and velocities.", reach: "Realistic pianos, strings and any library of multisamples.", tip: "Use it for instruments with many recorded notes. For a single sample, Simpler is faster." },
  { id: "drum-rack", name: "Drum Rack", group: "instrument", xml: ["DrumGroupDevice"], does: "A grid of pads, each holding its own sample or instrument and its own effects.", reach: "Every drum pattern. Also layered one-shots and percussion.", tip: "Choke groups let a closed hat cut off an open hat, the way a real kit behaves." },
  { id: "impulse", name: "Impulse", group: "instrument", xml: ["InstrumentImpulse"], does: "An eight-slot drum sampler. Each slot has its own stretch, filter, envelope, saturation, pan and volume.", reach: "Quick drum kits when you do not need a full Drum Rack.", tip: "Drum Rack is more flexible; Impulse is the quicker one to read." },
  { id: "collision", name: "Collision", group: "instrument", xml: ["Collision"], does: "A physical model of a struck object, like a mallet hitting wood or metal.", reach: "Marimbas, bells, struck percussion.", tip: "The Hit position changes the tone a lot. Move it while listening." },
  { id: "electric", name: "Electric", group: "instrument", xml: ["LoungeLizard"], does: "A model of an electric piano with a hammer, a fork (tine and tone bar), a damper and a pickup.", reach: "Rhodes-like keys.", tip: "The pickup section controls the bark and bell of the tone." },
  { id: "tension", name: "Tension", group: "instrument", xml: ["StringStudio"], does: "A physical model of a plucked, bowed or hammered string.", reach: "Guitar-like and bowed string textures.", tip: "Switching the exciter type changes the sound more than any other control." },
  { id: "external-instrument", name: "External Instrument", group: "instrument", xml: [], does: "Sends MIDI to hardware or another program and brings its audio back into Live.", reach: "Playing a hardware synth from Live.", tip: "Set the hardware audio input so you can record its sound back into the Set." },
  // midi
  { id: "arpeggiator", name: "Arpeggiator", group: "midi", xml: ["MidiArpeggiator"], does: "Turns held chords into patterns of single notes.", reach: "Instant rhythm from a held chord.", tip: "Change Rate and Gate first. Those two settings shape most of the feel." },
  { id: "chord", name: "Chord", group: "midi", xml: ["MidiChord"], does: "Adds up to six extra notes to each note you play, each shifted up or down by as much as 36 semitones.", reach: "One-finger chords and stacks.", tip: "Put it before Scale so every added note stays in key." },
  { id: "scale", name: "Scale", group: "midi", xml: ["MidiScale"], does: "Moves incoming notes onto the scale you choose.", reach: "Keeping a melody or random notes in key.", tip: "Pair with Random for generative melodies that never hit a wrong note." },
  { id: "note-length", name: "Note Length", group: "midi", xml: ["MidiNoteLength"], does: "Sets how long each note lasts, or triggers on release.", reach: "Tightening staccato parts; gating a pad to the beat.", tip: "Use Sync mode to snap note lengths to the grid." },
  { id: "pitch", name: "Pitch", group: "midi", xml: ["MidiPitcher"], does: "Transposes notes up or down in semitones.", reach: "Moving a part by an interval without editing it.", tip: "Lowest and Range choose which notes pass through, and Mode decides whether notes outside are blocked, folded or limited." },
  { id: "random", name: "Random", group: "midi", xml: ["MidiRandom"], does: "Randomly changes the pitch of notes by chance and amount.", reach: "Variation in hats, melodies and arps.", tip: "Use a small Choices value, a small Interval and a low Chance for subtle variation." },
  { id: "velocity", name: "Velocity", group: "midi", xml: ["MidiVelocity"], does: "Reshapes note velocities, with a curve.", reach: "Making a stiff drum part feel human, or evening out a played part.", tip: "Use Random to add a little looseness to a programmed part." },
  // eq
  { id: "eq-eight", name: "EQ Eight", group: "eq", xml: ["Eq8"], does: "An eight-band parametric EQ with a spectrum display.", reach: "Cutting mud, fixing a harsh frequency, shaping tone.", tip: "Cut first, boost second. A narrow boost sweep finds the problem; then cut there." },
  { id: "eq-three", name: "EQ Three", group: "eq", xml: ["FilterEQ3"], does: "A three-band EQ for lows, mids and highs, with kill switches.", reach: "Quick tone changes and DJ-style bass kills.", tip: "Kill the low band on a second loop so two basslines do not clash." },
  { id: "auto-filter", name: "Auto Filter", group: "eq", xml: ["AutoFilter", "AutoFilter2"], does: "A filter that can be moved by an envelope, an LFO or a sidechain.", reach: "Sweeps, wobble and a filter that opens on every hit.", tip: "Set Resonance up a little before you automate Frequency; the sweep is easier to hear." },
  // dynamics
  { id: "compressor", name: "Compressor", group: "dynamics", xml: ["Compressor2"], does: "Turns down the loud parts of a sound, with a sidechain input.", reach: "Evening out vocals and bass; ducking one track under another.", tip: "Sidechain on, pick the kick in Audio From, and the bass will duck. Watch the gain reduction meter." },
  { id: "glue-compressor", name: "Glue Compressor", group: "dynamics", xml: ["GlueCompressor"], does: "A bus compressor modelled on a classic console unit.", reach: "Making drums or a whole mix feel like one thing.", tip: "Use a slow attack and 2 to 4 dB of gain reduction. Soft Clip catches peaks but adds distortion, so leave it off unless you like the colour." },
  { id: "multiband", name: "Multiband Dynamics", group: "dynamics", xml: ["MultibandDynamics"], does: "Compresses or expands three frequency bands independently.", reach: "Controlling a boomy low end without dulling the highs.", tip: "Solo each band to hear exactly what it is working on." },
  { id: "limiter", name: "Limiter", group: "dynamics", xml: ["Limiter"], does: "Stops the signal passing a ceiling.", reach: "Last device on the main track to prevent clipping.", tip: "Set the ceiling around -1 dB or just below, so it survives the later steps." },
  { id: "gate", name: "Gate", group: "dynamics", xml: ["Gate"], does: "Silences a sound when it drops below a threshold.", reach: "Cutting noise between hits; tightening drums.", tip: "Use the Flip option for the reverse effect: sound only plays under the threshold." },
  { id: "drum-buss", name: "Drum Buss", group: "dynamics", xml: ["DrumBuss"], does: "A drum processor with drive, compression, a low-end boom and a transient shaper.", reach: "Weight and punch on a drum group.", tip: "Raise Boom and tune it to the key of the track." },
  // space
  { id: "reverb", name: "Reverb", group: "space", xml: ["Reverb"], does: "Simulates the sound of a room, hall or plate.", reach: "Putting sounds in a shared space, on a return track.", tip: "Cut lows and highs in the reverb's own filters so it does not muddy the mix." },
  { id: "hybrid-reverb", name: "Hybrid Reverb", group: "space", xml: ["Hybrid"], does: "A reverb that blends convolution and algorithmic engines.", reach: "Big cinematic spaces and long tails.", tip: "Try a convolution space and an algorithm together, then balance them." },
  { id: "echo", name: "Echo", group: "space", xml: ["Echo"], does: "A delay with filters, modulation, reverb and a ducking option.", reach: "Tape-like and rhythmic delays, dub throws.", tip: "Turn on Ducking so the echoes appear only when the dry sound stops." },
  { id: "delay", name: "Delay", group: "space", xml: ["Delay"], does: "A simple stereo delay with time sync.", reach: "Clean repeats on a return track.", tip: "Set the left and right times to different note values for width." },
  { id: "filter-delay", name: "Filter Delay", group: "space", xml: ["FilterDelay"], does: "Three delay lines, each with its own filter.", reach: "Rhythmic, filtered patterns.", tip: "Give each of the three lines a different filter band." },
  { id: "grain-delay", name: "Grain Delay", group: "space", xml: ["GrainDelay"], does: "A delay that chops the sound into grains and shifts their pitch.", reach: "Shimmer and textural repeats.", tip: "Small Spray values keep it musical; large ones turn it to mush." },
  { id: "corpus", name: "Corpus", group: "space", xml: ["Corpus"], does: "Makes a sound resonate like a physical object such as a tube or a plate.", reach: "Adding a ringing body to drums.", tip: "Match the tune to the key of the track." },
  { id: "resonators", name: "Resonators", group: "space", xml: ["Resonator"], does: "Five resonators tuned to a chord, ringing on the incoming sound.", reach: "Turning noise and hats into pitched tones.", tip: "Keep the Dry/Wet low; it can swamp a part." },
  // drive
  { id: "saturator", name: "Saturator", group: "drive", xml: ["Saturator"], does: "Adds harmonics and soft clipping with several curve shapes.", reach: "Warmth on bass, drums or a whole bus.", tip: "Set Post Clip Mode to Soft Clip and balance Drive against Output." },
  { id: "overdrive", name: "Overdrive", group: "drive", xml: ["Overdrive"], does: "Guitar-pedal style distortion with a frequency control.", reach: "Fuzzy basses and gritty leads.", tip: "Set the band frequency to focus the distortion on the mids." },
  { id: "pedal", name: "Pedal", group: "drive", xml: ["Pedal"], does: "Three kinds of guitar-pedal distortion: overdrive, distortion and fuzz.", reach: "Heavier crunch on any sound.", tip: "The Sub switch adds low end back after distortion." },
  { id: "amp", name: "Amp", group: "drive", xml: ["Amp"], does: "Models several guitar amplifiers.", reach: "Guitar tone; also gritty synths.", tip: "Pair with Cabinet; an amp without a cabinet sounds harsh." },
  { id: "cabinet", name: "Cabinet", group: "drive", xml: ["Cabinet"], does: "Models a guitar speaker cabinet and microphone position.", reach: "Rounding off distorted sounds.", tip: "Mic position changes the high end more than the speaker choice." },
  { id: "dynamic-tube", name: "Dynamic Tube", group: "drive", xml: ["DynamicTube"], does: "A tube-style saturator that reacts to level.", reach: "Warmth that grows when the signal gets louder.", tip: "Bias changes the character most; move it slowly." },
  { id: "erosion", name: "Erosion", group: "drive", xml: ["Erosion"], does: "Degrades a sound by modulating a short delay with a sine wave, filtered noise, or a blend of both.", reach: "Lo-fi grit.", tip: "A narrow Filter Width and a lower Noise Blend keep it from damaging the whole sound." },
  { id: "redux", name: "Redux", group: "drive", xml: ["Redux2"], does: "Reduces sample rate and bit depth.", reach: "Crunchy lo-fi drums and old-sampler tone.", tip: "Rate gives the aliasing and old-sampler edge. Lower Bits adds crunch and noise, and at extreme settings is very harsh." },
  { id: "vinyl", name: "Vinyl Distortion", group: "drive", xml: ["Vinyl"], does: "Adds the harmonic distortion and crackle of vinyl playback.", reach: "Lo-fi texture on a bus.", tip: "Keep Drive and the Crackle Density and Volume low so it stays colour, not noise." },
  { id: "roar", name: "Roar", group: "drive", xml: ["Roar"], does: "A distortion with three stages, feedback and modulation.", reach: "Everything from soft warmth to wild destruction.", tip: "Use the Feedback section for tones that ring and growl." },
  // mod
  { id: "chorus", name: "Chorus-Ensemble", group: "mod", xml: ["Chorus2"], does: "Thickens a sound by mixing delayed, detuned copies.", reach: "Width and shimmer on pads and guitars.", tip: "Keep Dry/Wet low on bass; chorus can weaken the low end." },
  { id: "phaser-flanger", name: "Phaser-Flanger", group: "mod", xml: ["PhaserNew", "Flanger"], does: "Sweeping comb or notch effects with an LFO.", reach: "Swooshing movement on pads and hats.", tip: "Slow Rate and moderate Feedback is subtle; fast and high is dramatic." },
  { id: "auto-pan", name: "Auto Pan-Tremolo", group: "mod", xml: ["AutoPan"], does: "Moves sound left and right, or tremolo volume, with an LFO.", reach: "Movement and rhythmic tremolo.", tip: "Sync the Rate to the tempo so the movement locks with the groove." },
  { id: "frequency-shifter", name: "Frequency Shifter", group: "mod", xml: ["FrequencyShifter"], does: "Legacy device. Live 11.1 replaced it with Shifter, but it still appears in old Sets.", reach: "Metallic and phase-like effects, now done with Shifter in Freq mode.", tip: "In new Sets use Shifter instead." },
  { id: "shifter", name: "Shifter", group: "mod", xml: ["Shifter"], does: "Shifts pitch or frequency, or applies ring modulation, with an optional delay, LFO and envelope follower.", reach: "Harmonies, detune and weird tones.", tip: "Pitch mode moves notes musically. Freq mode shifts by a fixed number of Hz and sounds metallic. Ring mode adds and subtracts the frequency." },
  { id: "transmute", name: "Transmute", group: "creative", xml: ["Transmute"], does: "Resonates the incoming sound at notes you choose.", reach: "Turning drums or noise into tuned textures.", tip: "Play it with MIDI to retune the resonances live." },
  { id: "auto-shift", name: "Auto Shift", group: "mod", xml: ["AutoShift"], does: "Real-time pitch tracking and correction, with controls for vibrato, pitch shifting and formant shifting.", reach: "Tuning a single-note vocal or lead to a scale, and creative pitch effects. Live 12.1 and later.", tip: "It follows one note at a time, so it suits solo vocals, not chords." },
  // creative
  { id: "beat-repeat", name: "Beat Repeat", group: "creative", xml: ["BeatRepeat"], does: "Captures a slice of audio and repeats it on the grid.", reach: "Stutters, fills and build-ups.", tip: "Automate Chance up in the last bar before a drop." },
  { id: "looper", name: "Looper", group: "creative", xml: ["Looper"], does: "Records and layers loops live, with overdub.", reach: "Building a part up while you play.", tip: "Set the loop length to a number of bars so it stays in time." },
  { id: "vocoder", name: "Vocoder", group: "creative", xml: ["Vocoder"], does: "Applies the shape of one sound, like a voice, to another, like a synth.", reach: "Robot voices.", tip: "More bands means clearer words." },
  { id: "spectral-resonator", name: "Spectral Resonator", group: "creative", xml: ["SpectralResonator"], does: "Resonates the spectrum of a sound, optionally tuned to MIDI.", reach: "Metallic and glassy textures.", tip: "Use MIDI mode to play it like an instrument." },
  { id: "spectral-time", name: "Spectral Time", group: "creative", xml: ["SpectralTime"], does: "Freezes and delays parts of a sound's spectrum.", reach: "Frozen drones and smeared tails.", tip: "Freeze on a short moment of a sound for an instant pad." },
  // utility
  { id: "utility", name: "Utility", group: "utility", xml: ["StereoGain"], does: "Gain, width, mono, phase flip and mute in one device.", reach: "Fixing level, mono-ing the low end, checking phase.", tip: "Put it first on a track for a clean gain stage before the effects." },
  { id: "spectrum", name: "Spectrum", group: "utility", xml: ["Spectrum"], does: "A frequency display for any track.", reach: "Seeing where energy sits so you can EQ with your eyes as well as your ears.", tip: "Use it to find a problem, then fix it by ear." },
  { id: "tuner", name: "Tuner", group: "utility", xml: ["Tuner"], does: "Shows the pitch of the incoming sound.", reach: "Tuning an instrument or a sample.", tip: "Use it on a bass sample to find the note to match to the key." },
  // racks
  { id: "audio-effect-rack", name: "Audio Effect Rack", group: "rack", xml: ["AudioEffectGroupDevice"], does: "Holds several effect chains and lets you map macro knobs to controls.", reach: "Parallel processing and reusable effect chains.", tip: "Map the most useful knobs to the Macro Controls (eight shown by default, up to 16), then save the rack." },
  { id: "instrument-rack", name: "Instrument Rack", group: "rack", xml: ["InstrumentGroupDevice"], does: "Holds several instruments and effects with key and velocity zones.", reach: "Layering instruments, splitting the keyboard.", tip: "Key zones let two chains play on different key ranges." },
  { id: "midi-effect-rack", name: "MIDI Effect Rack", group: "rack", xml: ["MidiEffectGroupDevice"], does: "Holds several MIDI effect chains.", reach: "Stacking arps, chords and scale devices.", tip: "Group your favourite combination and save it for next time." },
  // max
  { id: "max-audio", name: "Max for Live audio effect", group: "max", xml: ["MxDeviceAudioEffect"], does: "An audio effect built with Max.", reach: "Specialist effects, including ones from the community.", tip: "Needs a Live edition that includes Max for Live." },
  { id: "max-midi", name: "Max for Live MIDI effect", group: "max", xml: ["MxDeviceMidiEffect"], does: "A MIDI effect built with Max, such as a step sequencer.", reach: "Sequencers and generators.", tip: "Needs a Live edition that includes Max for Live." },
  { id: "max-instrument", name: "Max for Live instrument", group: "max", xml: ["MxDeviceInstrument"], does: "An instrument built with Max.", reach: "Unusual synths and samplers.", tip: "Needs a Live edition that includes Max for Live." },
];

const XML_INDEX = new Map(ATLAS.flatMap((d) => d.xml.map((x) => [x, d.id] as const)));
export const atlasIdForXml = (className: string) => XML_INDEX.get(className);
export const atlasById = (id: string) => ATLAS.find((d) => d.id === id);

/** Device Lab uses its own names; map them to Atlas entries. */
const LAB_ALIASES: Record<string, string> = {
  chorus: "chorus", phaser: "phaser-flanger", flanger: "phaser-flanger", "auto pan": "auto-pan",
};
export function atlasIdForLabName(name: string): string | undefined {
  const k = name.trim().toLowerCase();
  return LAB_ALIASES[k] ?? ATLAS.find((d) => d.name.toLowerCase() === k)?.id;
}

/**
 * Which Live edition a device needs, from Ableton's edition comparison. Devices not listed
 * come with every edition, Intro included. Max for Live comes with Suite and can be added to Standard.
 */
const STANDARD_UP = ["analog", "collision", "electric", "tension", "corpus", "drum-buss", "dynamic-tube", "eq-eight", "filter-delay", "glue-compressor", "multiband", "overdrive", "resonators", "shifter", "spectrum", "vinyl", "vocoder"];
const SUITE_ONLY = ["operator", "sampler", "wavetable", "meld", "amp", "cabinet", "echo", "hybrid-reverb", "pedal", "roar", "spectral-resonator", "spectral-time", "max-audio", "max-midi", "max-instrument"];
export const editionNeeded = (id: string): "Standard" | "Suite" | null =>
  SUITE_ONLY.includes(id) ? "Suite" : STANDARD_UP.includes(id) ? "Standard" : null;
