// Synths World — 18 missions across 3 paths.
// Original content. Concept structure modelled on learningsynths.ableton.com
// chapter flow; every paragraph and quiz is our own writing.
import type { Mission } from "./types";

const soundPath: Mission[] = [
  {
    slug: "synth-what-is-sound",
    world: "producer",
    number: 1,
    title: "Sound, Before The Synth",
    tagline: "A synth makes electricity that pretends to be sound.",
    xp: 40,
    badge: { slug: "synth-initiate", name: "Synth Initiate" },
    explainer: [
      { kind: "lead", text: "Before we touch a synth, remember what sound actually is: pressure waves in air. A speaker pushes air back and forth, and your ear translates that movement into sound." },
      { kind: "para", text: "A synthesiser does not record anything. It generates a voltage that wiggles back and forth, sends it to a speaker, and that wiggle becomes the air movement you hear." },
      { kind: "callout", tone: "key", text: "Everything in synthesis is about shaping a wiggling voltage. Pitch, loudness, brightness, movement — all are just different ways of changing the wiggle." },
    ],
    sim: { type: "osc-mixer" },
    quiz: [
      { q: "A synth generates", options: ["A recording of an instrument", "An electrical wiggle that drives a speaker", "Air directly"], answer: 1, explain: "Synths make voltage that wiggles. The speaker turns that wiggle into air movement." },
      { q: "The 'pitch' of a synth note corresponds to", options: ["How fast the wiggle repeats", "How big the wiggle is", "Its colour"], answer: 0, explain: "Pitch = frequency = how many wiggles per second." },
      { q: "Loudness corresponds to", options: ["How fast the wiggle repeats", "How big the wiggle is", "Its shape"], answer: 1, explain: "Bigger swing = louder. Same as amplitude in any sound." },
    ],
  },
  {
    slug: "synth-pitch-vs-amplitude",
    world: "producer",
    number: 2,
    title: "Pitch vs Amplitude",
    tagline: "Two knobs hidden in every sound.",
    xp: 40,
    explainer: [
      { kind: "lead", text: "Every sound has at least two independent properties: how fast the wave repeats (pitch) and how big each swing is (amplitude / loudness)." },
      { kind: "para", text: "On a synth these are usually controlled by separate sections: an oscillator sets the pitch, and an amplifier (often labelled VCA or Amp) sets the loudness over time." },
    ],
    sim: { type: "osc-mixer" },
    quiz: [
      { q: "Doubling the frequency of a note moves it…", options: ["Up an octave", "Up a fifth", "Down an octave"], answer: 0, explain: "Frequency × 2 = one octave higher. 440 Hz → 880 Hz." },
      { q: "Which property does the Amp section control?", options: ["Pitch over time", "Loudness over time", "Tone colour"], answer: 1, explain: "The Amp envelope shapes how loud the note is from the moment you press a key to the moment it dies." },
      { q: "A tiny wiggle at 440 Hz vs a huge wiggle at 440 Hz differs in", options: ["Pitch", "Loudness", "Both"], answer: 1, explain: "Same speed = same pitch. Different size = different loudness." },
    ],
  },
  {
    slug: "synth-timbre",
    world: "producer",
    number: 3,
    title: "Timbre — Tone Colour",
    tagline: "Why a saw at 220 Hz sounds different to a sine at 220 Hz.",
    xp: 50,
    explainer: [
      { kind: "lead", text: "Timbre (pronounced 'tam-ber') is the character of a sound — what makes a violin and a flute sound different even when they play the same note at the same volume." },
      { kind: "para", text: "Timbre comes from the SHAPE of the wave. A pure sine wave sounds smooth and hollow. A saw wave at the same pitch sounds bright and buzzy because it contains many extra frequencies layered on top." },
      { kind: "callout", tone: "tip", text: "If pitch is which key on a piano, and loudness is how hard you strike it, timbre is which instrument is playing." },
    ],
    sim: { type: "osc-mixer" },
    quiz: [
      { q: "Timbre is determined by", options: ["How fast the wave repeats", "The wave's shape (its spectrum)", "How loud it is"], answer: 1, explain: "Same pitch + same loudness + different shape = different timbre. A saw and a sine at 220 Hz have identical pitch but radically different colour." },
      { q: "A pure sine wave contains", options: ["One frequency only", "Many frequencies", "No frequency"], answer: 0, explain: "Sine is the only single-frequency wave — every other shape is multiple sines stacked together." },
      { q: "Which wave sounds buzziest?", options: ["Sine", "Sawtooth", "Triangle"], answer: 1, explain: "Saw contains every harmonic — that's why it's the brightest classic wave." },
    ],
  },
  {
    slug: "synth-harmonics",
    world: "producer",
    number: 4,
    title: "Harmonics & Overtones",
    tagline: "Every 'rich' sound is many notes pretending to be one.",
    xp: 50,
    explainer: [
      { kind: "lead", text: "Almost every musical sound is actually a stack of pure sine waves at related frequencies. The lowest one (the fundamental) is the pitch you hear. The others (harmonics) sit at 2×, 3×, 4× that frequency and give the sound its colour." },
      { kind: "para", text: "A saw wave contains every harmonic. A square wave contains only odd harmonics (1×, 3×, 5×). A triangle is mostly fundamental plus a few weak odd harmonics. That's why each shape has its own personality." },
    ],
    sim: { type: "osc-mixer" },
    quiz: [
      { q: "The fundamental of a 220 Hz note is", options: ["110 Hz", "220 Hz", "440 Hz"], answer: 1, explain: "The fundamental IS the perceived pitch — 220 Hz here. The other frequencies (440, 660, 880…) are the harmonics on top." },
      { q: "A square wave contains", options: ["All harmonics", "Only odd harmonics", "Only even harmonics"], answer: 1, explain: "Squares have 1×, 3×, 5×, 7× — odd-only. That's why they sound hollow / clarinet-ish." },
      { q: "Adding harmonics makes a sound", options: ["Brighter and more complex", "Duller and simpler", "Quieter"], answer: 0, explain: "More high-frequency content = a brighter, richer timbre." },
    ],
  },
  {
    slug: "synth-noise",
    world: "producer",
    number: 5,
    title: "Noise — The Odd Friend",
    tagline: "All frequencies at once. Useful, surprisingly often.",
    xp: 40,
    explainer: [
      { kind: "lead", text: "Noise is sound with no fixed pitch — a hiss containing every frequency at roughly equal levels. It does not feel 'musical', but it is the secret behind hi-hats, claps, snare bodies, breath sounds, and wind FX." },
      { kind: "para", text: "Most synths offer a noise source you can mix in alongside the tuned oscillators. A pinch of noise added to a pad gives it air. A burst of noise shaped by an envelope is the entire architecture of a hi-hat." },
    ],
    sim: { type: "osc-mixer" },
    quiz: [
      { q: "Noise has", options: ["One clear pitch", "No fixed pitch — all frequencies at once", "Only low frequencies"], answer: 1, explain: "Noise spreads energy across the spectrum. That's why it does not sound 'tuned'." },
      { q: "Hi-hats are often made by", options: ["A pure sine wave", "A noise burst shaped by an envelope", "A square wave"], answer: 1, explain: "Short noise burst + filter + fast envelope = closed hi-hat. Longer envelope = open hi-hat." },
      { q: "Adding a little noise to a pad", options: ["Makes it duller", "Adds 'air' and movement", "Mutes it"], answer: 1, explain: "Subtle noise gives the impression of breath / air, which is why analogue synths often sound 'alive'." },
    ],
  },
];

const shapingPath: Mission[] = [
  {
    slug: "synth-oscillators",
    world: "producer",
    number: 6,
    title: "Oscillators — The Sound Source",
    tagline: "Sine, saw, square, triangle. Pick your raw material.",
    xp: 50,
    explainer: [
      { kind: "lead", text: "An oscillator is the part of a synth that produces the basic wave. Each shape has a personality before any filtering or shaping. Picking the right shape gets you 70% of the way to a great sound." },
      { kind: "list", items: ["Sine — pure, smooth, no harmonics. Bass sub-octaves, soft leads.", "Triangle — slightly brighter sine. Mellow leads, retro FM.", "Square — hollow, clarinet-like. Pulse-width gives nasal leads.", "Sawtooth — brightest, buzziest. The classic synth bass and lead."] },
    ],
    sim: { type: "osc-mixer" },
    quiz: [
      { q: "Which oscillator is brightest?", options: ["Sine", "Triangle", "Sawtooth"], answer: 2, explain: "Saw has all harmonics — maximum brightness out of the basic shapes." },
      { q: "Which oscillator has no harmonics at all?", options: ["Sine", "Square", "Saw"], answer: 0, explain: "Sine is the only single-frequency wave. Pure and hollow." },
      { q: "A classic 'fat bass' typically starts with", options: ["Sine", "Sawtooth", "Noise"], answer: 1, explain: "Saw gives you energy across the spectrum to then carve with a filter." },
    ],
  },
  {
    slug: "synth-mixing-oscillators",
    world: "producer",
    number: 7,
    title: "Mixing Oscillators",
    tagline: "One voice is good. Two is huge.",
    xp: 50,
    explainer: [
      { kind: "lead", text: "Most synths give you 2-3 oscillators. Layering them is the fastest way to get bigger, more complex sounds." },
      { kind: "list", items: ["Same shape, detuned slightly = fat / chorus-y.", "Different shapes mixed = hybrid character.", "One an octave below = weight and sub.", "One an octave above = sparkle and presence."] },
    ],
    sim: { type: "osc-mixer" },
    quiz: [
      { q: "To make a saw lead 'fat' without effects, you usually", options: ["Add a second saw detuned a few cents", "Add a sine an octave up", "Turn off the filter"], answer: 0, explain: "Tiny detune between two identical waves causes them to drift in and out of phase — the classic supersaw / unison fattness." },
      { q: "Adding an oscillator one octave below the main one gives", options: ["Sparkle", "Weight / sub", "Brightness"], answer: 1, explain: "Lower octave = more low-frequency content = perceived weight." },
      { q: "Two oscillators perfectly in tune sound", options: ["Like one louder oscillator", "Way fatter", "Out of tune"], answer: 0, explain: "Without detune they just sum to the same wave at double the level. The fatness comes from the slight tuning offset." },
    ],
  },
  {
    slug: "synth-detune-unison",
    world: "producer",
    number: 8,
    title: "Detune & Unison",
    tagline: "Why supersaws sound enormous.",
    xp: 50,
    explainer: [
      { kind: "lead", text: "Detune means deliberately tuning oscillators slightly apart, usually measured in cents (1 cent = 1/100 of a semitone). Unison is when a synth stacks many copies of the same oscillator and detunes them automatically." },
      { kind: "para", text: "At 5-15 cents you get warmth. At 25-50 cents you get the giant, dance-music supersaw. Too much and the chord 'beats' weirdly." },
    ],
    sim: { type: "osc-mixer" },
    quiz: [
      { q: "1 cent equals", options: ["1/100 of a semitone", "1 semitone", "1 octave"], answer: 0, explain: "100 cents = 1 semitone. 1200 cents = 1 octave." },
      { q: "Unison stacking adds", options: ["A single quieter copy", "Many detuned copies of the same wave", "Different oscillator shapes"], answer: 1, explain: "Unison clones the oscillator several times and spreads them in pitch — that wide, swirly EDM lead sound." },
      { q: "Too much detune on a chord causes", options: ["Cleaner intonation", "Audible beating / out-of-tune feel", "Lower volume"], answer: 1, explain: "Detune sums with the chord intervals; past a point it just sounds wrong." },
    ],
  },
  {
    slug: "synth-filters",
    world: "producer",
    number: 9,
    title: "Filters — Carving The Sound",
    tagline: "Start bright. Take frequencies away.",
    xp: 60,
    badge: { slug: "filter-sculptor", name: "Filter Sculptor" },
    explainer: [
      { kind: "lead", text: "A filter removes frequencies from a sound. Subtractive synthesis is the name of the game: start with a bright, harmonic-rich wave and carve away what you don't want." },
      { kind: "list", items: ["Low-pass (LP) — keeps lows, removes highs. The most-used filter on Earth.", "High-pass (HP) — keeps highs, removes lows. Thins out a bass.", "Band-pass (BP) — keeps a slice in the middle. Telephone / vocal effect.", "Notch — removes a slice, keeps the rest."] },
      { kind: "callout", tone: "key", text: "Cutoff = where the filter starts cutting. Resonance = how loud it boosts the frequencies right AT the cutoff." },
    ],
    sim: { type: "filter-envelope" },
    quiz: [
      { q: "A low-pass filter keeps", options: ["Lows, removes highs", "Highs, removes lows", "Mids only"], answer: 0, explain: "Lows pass through; highs above the cutoff get attenuated. This is how you tame a buzzy saw." },
      { q: "Resonance does what?", options: ["Cuts the cutoff more steeply", "Boosts frequencies right at the cutoff point", "Adds reverb"], answer: 1, explain: "Resonance is a peak at the cutoff frequency — too much and the filter starts to 'sing'." },
      { q: "To remove rumble from a bright pad you'd reach for a", options: ["Low-pass", "High-pass", "Notch"], answer: 1, explain: "HP removes lows. Great for cleaning up sub-rumble from non-bass parts." },
    ],
  },
  {
    slug: "synth-amp-envelope",
    world: "producer",
    number: 10,
    title: "Amp Envelope — ADSR",
    tagline: "Attack, Decay, Sustain, Release. The shape of a note.",
    xp: 60,
    explainer: [
      { kind: "lead", text: "An envelope tells a parameter (usually volume) how to move over time when you press a key. The classic shape is ADSR: Attack, Decay, Sustain, Release." },
      { kind: "list", items: ["Attack — time from silent to peak when you press the key. Short = pluck. Long = pad.", "Decay — time to fall from peak to the sustain level.", "Sustain — the level held while the key is down.", "Release — time to fade back to silent after you release the key."] },
    ],
    sim: { type: "filter-envelope" },
    quiz: [
      { q: "Short attack + short decay + low sustain = ", options: ["Pad", "Pluck", "Drone"], answer: 1, explain: "Fast in, fast out — that's the architecture of a synth pluck or plucked-string sound." },
      { q: "Long attack + high sustain + long release = ", options: ["Pad", "Pluck", "Bass stab"], answer: 0, explain: "Slow swells in, holds, slow swells out — classic pad/string movement." },
      { q: "If you let go of the key, which parameter takes over?", options: ["Sustain", "Release", "Attack"], answer: 1, explain: "Release shapes how the note fades after key-up." },
    ],
  },
  {
    slug: "synth-filter-envelope",
    world: "producer",
    number: 11,
    title: "Filter Envelope",
    tagline: "Move the cutoff over time. The whole sound transforms.",
    xp: 60,
    explainer: [
      { kind: "lead", text: "An envelope can drive ANY parameter, not just volume. Aim one at the filter cutoff and you get the most expressive sound in synthesis: an animated filter sweep on every keypress." },
      { kind: "para", text: "Set a low base cutoff, dial up envelope amount, give it a short decay and you get the classic plucky lead. Long attack on the filter envelope creates that 'wah-opening' pad swell." },
    ],
    sim: { type: "filter-envelope" },
    quiz: [
      { q: "A filter envelope changes", options: ["Volume over time", "The cutoff frequency over time", "The pitch"], answer: 1, explain: "Same ADSR shape, applied to cutoff Hz instead of volume." },
      { q: "Short attack + short decay on the filter envelope gives", options: ["A long pad swell", "A bright, then duller pluck", "Vibrato"], answer: 1, explain: "Cutoff jumps up, then closes — the classic plucky synth bass / lead character." },
      { q: "Envelope Amount controls", options: ["How LOUD the envelope is", "How FAR the cutoff moves", "Decay time"], answer: 1, explain: "Amount = the range of cutoff movement. Zero amount = the envelope does nothing." },
    ],
  },
  {
    slug: "synth-amp-vs-filter-env",
    world: "producer",
    number: 12,
    title: "Two Envelopes, One Voice",
    tagline: "Volume shape and tone shape, working together.",
    xp: 60,
    explainer: [
      { kind: "lead", text: "Almost every synth gives you at least two envelopes — one for the amp (volume) and one for the filter (cutoff). Their interaction is where character comes from." },
      { kind: "para", text: "Long amp release + short filter release = a note that fades out duller than it started. Short amp + long filter = the filter never gets to finish moving. Lining them up versus offsetting them is half the craft." },
    ],
    sim: { type: "filter-envelope" },
    quiz: [
      { q: "If amp release is 500 ms and filter release is 50 ms, the tail will", options: ["Get brighter over time", "Get duller over time", "Stay the same"], answer: 1, explain: "Filter closes long before the volume fades — the last bit of the tail is dark." },
      { q: "A pluck with a long bright tail uses", options: ["Long amp + short filter", "Short amp + long filter", "Long amp + long filter"], answer: 0, explain: "Volume hangs around while the filter has already closed — bright start, dull sustain, slow fade." },
      { q: "Which envelope controls whether you hear the note at all?", options: ["Amp", "Filter", "Both equally"], answer: 0, explain: "If the amp envelope is at zero, the filter is moving but there's no sound coming through." },
    ],
  },
];

const movementPath: Mission[] = [
  {
    slug: "synth-lfo",
    world: "producer",
    number: 13,
    title: "LFO — Slow Oscillator",
    tagline: "An oscillator too slow to hear, used to move something.",
    xp: 60,
    badge: { slug: "modulation-mover", name: "Modulation Mover" },
    explainer: [
      { kind: "lead", text: "An LFO (Low-Frequency Oscillator) is exactly what it sounds like: an oscillator running at 0.1-20 Hz — too slow to be a note, perfect for moving other things up and down." },
      { kind: "list", items: ["LFO → pitch = vibrato.", "LFO → filter cutoff = wobble / dubstep / wah.", "LFO → amplitude = tremolo.", "LFO → pan = auto-pan."] },
    ],
    sim: { type: "lfo-lab" },
    quiz: [
      { q: "An LFO is", options: ["An oscillator running fast enough to hear", "An oscillator running too slow to hear, used to modulate", "A type of filter"], answer: 1, explain: "LFO = sub-audio oscillator. You don't hear it directly; you hear what it does to whatever it's modulating." },
      { q: "LFO → pitch creates", options: ["Tremolo", "Vibrato", "Reverb"], answer: 1, explain: "Pitch wobble = vibrato. The defining sound of a violinist's left hand." },
      { q: "LFO → amplitude creates", options: ["Tremolo", "Vibrato", "Distortion"], answer: 0, explain: "Volume wobble = tremolo. Surf guitar amps had it built in." },
    ],
  },
  {
    slug: "synth-modulation-routing",
    world: "producer",
    number: 14,
    title: "Modulation Routing",
    tagline: "Anything can control anything.",
    xp: 60,
    explainer: [
      { kind: "lead", text: "Modulation routing is the matrix that decides what controls what. A modern synth lets you point any source (envelope, LFO, velocity, mod wheel, aftertouch) at any destination (cutoff, pitch, FX mix, oscillator level)." },
      { kind: "callout", tone: "tip", text: "The first patch you should try when learning a new synth: mod wheel → filter cutoff. It instantly makes every preset more expressive." },
    ],
    sim: { type: "lfo-lab" },
    quiz: [
      { q: "Velocity in synth-speak means", options: ["How fast a note plays", "How hard the key was pressed", "Vibrato depth"], answer: 1, explain: "Velocity = the speed at which the key was struck, read as 'how hard'. Great destination for filter cutoff or amp level." },
      { q: "A useful routing for expression is", options: ["Mod wheel → cutoff", "Note number → reverb send", "LFO → tempo"], answer: 0, explain: "Cutoff under the mod wheel turns every patch into a filter-sweep-able lead." },
      { q: "Aftertouch is", options: ["Pressure after pressing a key", "The release portion of the envelope", "A reverb send"], answer: 0, explain: "Many keys sense how hard you keep pushing after the initial press. Great for adding vibrato as you lean in." },
    ],
  },
  {
    slug: "synth-fm-basics",
    world: "producer",
    number: 15,
    title: "FM — Frequency Modulation",
    tagline: "When one oscillator modulates another's pitch fast, magic happens.",
    xp: 60,
    explainer: [
      { kind: "lead", text: "Frequency Modulation is what happens when an LFO speeds up so much it stops sounding like vibrato and starts creating brand new frequencies. The 'modulator' oscillator changes the 'carrier' oscillator's pitch thousands of times per second, generating sidebands — extra harmonics you couldn't get from a simple wave." },
      { kind: "para", text: "FM is famous for the bell, electric piano, metallic bass, and most '80s synth sounds. Small modulation amount = subtle inharmonic colour. Big amount = clangourous metal." },
    ],
    sim: { type: "lfo-lab" },
    quiz: [
      { q: "FM differs from vibrato because", options: ["The modulator is too slow to hear", "The modulator is in the audio range, creating new harmonics", "It uses a filter"], answer: 1, explain: "At audio-rate, what would have been vibrato becomes new sidebands — the basis of FM tone." },
      { q: "FM is famous for which sound family?", options: ["Bells, electric pianos, metallic stabs", "Lush analogue pads", "Distorted guitar"], answer: 0, explain: "The Yamaha DX7 made FM bells / EPs world-famous in the '80s." },
      { q: "More modulation amount = ", options: ["Cleaner tone", "More inharmonic, metallic content", "Quieter sound"], answer: 1, explain: "Pushing modulation index adds more sidebands → more metallic / clangourous." },
    ],
  },
  {
    slug: "synth-effects",
    world: "producer",
    number: 16,
    title: "Synth Effects — Glue The Voice",
    tagline: "Chorus, delay, reverb. The last 20% of every great patch.",
    xp: 50,
    explainer: [
      { kind: "lead", text: "Most modern synth presets are 80% the synth and 20% effects. Without effects, even the best patch sounds dry and small." },
      { kind: "list", items: ["Chorus — duplicates the signal with tiny pitch wobble. Width and warmth.", "Delay — repeats. Sync to tempo for rhythmic interest.", "Reverb — space. Short room = intimate. Big hall = epic.", "Distortion / saturation — adds harmonics. Glue and grit."] },
    ],
    sim: { type: "lfo-lab" },
    quiz: [
      { q: "Chorus works by", options: ["Adding reverb", "Mixing in slightly-delayed, pitch-wobbled copies", "Compressing"], answer: 1, explain: "Chorus = short delay + LFO on the delay time → moving pitch offsets → wide, thick sound." },
      { q: "Tempo-synced delay creates", options: ["Random noise", "Rhythmic, in-time repeats", "Reverb"], answer: 1, explain: "Setting delay time to a note value (e.g. 1/8) makes the repeats land on the grid." },
      { q: "A big-hall reverb on a lead", options: ["Pushes it forward in the mix", "Pushes it back / makes it feel further away", "Adds bass"], answer: 1, explain: "More reverb = more 'space' between listener and source = perceived distance." },
    ],
  },
  {
    slug: "synth-preset-anatomy",
    world: "producer",
    number: 17,
    title: "Preset Anatomy",
    tagline: "Bass, lead, pad, pluck — what each one needs.",
    xp: 50,
    explainer: [
      { kind: "lead", text: "Every preset family follows a recipe. Once you see the recipes, you can build any sound from scratch." },
      { kind: "list", items: ["Bass — saw or square, low cutoff, short attack, low resonance, mono.", "Lead — saw + unison, mid cutoff, mod wheel → cutoff, slight delay/reverb.", "Pad — multiple saws detuned, slow attack, long release, big reverb, slow filter LFO.", "Pluck — saw, fast filter envelope (high amount, short decay), short amp envelope, ping-pong delay."] },
    ],
    sim: { type: "filter-envelope" },
    quiz: [
      { q: "A pad almost always uses", options: ["Long attack and long release", "Short attack and short release", "No envelope"], answer: 0, explain: "Pads need to breathe in and out slowly to sit under the rest of the mix." },
      { q: "A bass patch is usually", options: ["Polyphonic with lots of unison", "Monophonic with low cutoff", "Stereo-wide with chorus"], answer: 1, explain: "Bass needs to stay focused in the centre and not muddy the low end. Mono + tight filter is the recipe." },
      { q: "A pluck's characteristic 'snap' comes from", options: ["A slow filter envelope", "A fast filter envelope with high amount", "Reverb"], answer: 1, explain: "Cutoff jumps up and closes fast → the brightness only exists for the first 30-100 ms = pluck." },
    ],
  },
  {
    slug: "synth-build-your-own",
    world: "producer",
    number: 18,
    title: "Build Your Own Patch",
    tagline: "Take the test: design a sound from scratch.",
    xp: 80,
    badge: { slug: "synth-graduate", name: "Synth Graduate" },
    explainer: [
      { kind: "lead", text: "Time to put it all together. Open the synth, start from a single sine, and follow the recipe to design a bass, a lead, a pad and a pluck — without using any presets." },
      { kind: "callout", tone: "key", text: "If you can build the four basic patches from scratch, you understand synthesis. Every preset you ever encounter will read like a recipe you already know." },
    ],
    sim: { type: "subtractive-synth" },
    quiz: [
      { q: "What's the most important rule of subtractive synthesis?", options: ["Start dark, add brightness", "Start bright, filter down", "Always use noise"], answer: 1, explain: "Subtractive = remove. You can't filter what isn't there, so start with a harmonic-rich source (saw / square) and carve." },
      { q: "If your patch sounds 'thin', the fix is usually", options: ["Add a sub octave or detuned second oscillator", "Reduce volume", "Increase release"], answer: 0, explain: "Thin = no low-end body or no harmonic complexity. Sub octave fixes the first; detuned unison fixes the second." },
      { q: "If your patch sounds 'static and boring', the fix is usually", options: ["Add modulation — LFO on cutoff or pitch", "Turn off the filter", "Make the envelope shorter"], answer: 0, explain: "Real instruments move. Any modulation source (LFO, envelope, velocity) on any destination instantly adds life." },
    ],
  },
];

export const SYNTHS_MISSIONS: Mission[] = [
  ...soundPath,
  ...shapingPath,
  ...movementPath,
];
