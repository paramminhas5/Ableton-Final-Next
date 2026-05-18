// Deep lessons for the Synths world (18 missions).
// Original pedagogical writing. Concept flow modelled on learningsynths.ableton.com
// but every paragraph and quiz is our own.
import type { LessonDeep } from "./types";

export const SYNTHS_LESSONS: Record<string, LessonDeep> = {
  "synth-what-is-sound": {
    hook: "A synth doesn't record anything. It pretends to be air.",
    beginner: {
      what: [
        "Before any synth makes sense, hold this picture in your head: a sound is just air being pushed back and forth. Your eardrum is a tiny trampoline that wobbles with that air, and your brain calls the wobble 'sound'.",
        "A synthesiser does not capture air the way a microphone does. It generates a tiny electric current that wiggles back and forth — and that wiggle, sent to a speaker, becomes the air movement your ear feels.",
        "Every knob on a synth changes the wiggle. Pitch knobs change how fast it wiggles. Volume knobs change how big the wiggle is. Filter knobs change which frequencies make it through.",
      ],
      why: [
        "If you know the synth is just shaping a voltage wiggle, no preset is mysterious anymore.",
        "It explains why subs need a big speaker (huge slow wiggles) and why hi-hats sit in tweeters (tiny fast wiggles).",
        "You stop chasing 'better sounds' and start asking 'what should this wiggle look like?'",
      ],
      analogy: "If a microphone is a stenographer transcribing what air says, a synth is an author making up dialogue.",
    },
    advanced: {
      what: [
        "A synth is an audio-rate signal generator. Inside, modules output time-varying voltages (in analogue) or floating-point sample streams (in digital), and those streams are summed and routed to a DAC that drives the speaker.",
        "Everything that follows — oscillators, filters, envelopes, LFOs, FX — is just a way to shape that stream over time. The 'sound' is whatever the stream is doing at the output stage right before it leaves the synth.",
        "This is why synthesis is endlessly flexible: there's no fixed sound source like a recording, only generated functions of time you can re-shape at will.",
      ],
      edgeCases: [
        "Subtractive synths start with a complex wave and remove frequencies; FM/additive synths build complexity instead.",
        "Sample-based instruments (Simpler, Kontakt) blur the line — they generate the stream from a stored recording.",
        "Modular synths expose every signal as a patch point — control voltages and audio are the same kind of signal, just at different rates.",
      ],
      engineerNotes: [
        "An LFO and an oscillator are the same circuit at different speeds — below ~20 Hz you don't hear it as pitch.",
        "All synthesis happens in time. Everything that surprises you about a sound (movement, life, expression) is some signal changing over time.",
      ],
    },
    flow: "Oscillator → Filter → Amp → Out → Speaker → Air → Ear",
    walkthrough: [
      { do: "Put the synth on a track and play a single note.", listen: "That sustained tone is one voltage wiggle being held at one rate." },
      { do: "Move the pitch slider while the note is held.", listen: "The wiggle changes speed — the perceived pitch follows." },
      { do: "Move the volume slider.", listen: "Same wiggle, bigger or smaller swings — only loudness changes." },
      { do: "Pull the filter cutoff down slowly.", listen: "Frequencies disappear from the top. Same fundamental, different colour." },
    ],
    listenFor: [
      "Pitch responds instantly to oscillator frequency.",
      "Loudness scales with amp level, not pitch.",
      "Filter changes timbre without changing pitch.",
      "Releasing a key doesn't end a note instantly — release time takes over.",
    ],
    mistakes: [
      "Thinking presets are 'finished sounds' instead of starting points.",
      "Looking for a 'good preset' instead of asking what the part needs.",
      "Confusing pitch and volume changes when twisting unknown knobs.",
    ],
    proMoves: [
      "Always start by INIT-ing the synth — a single sine, no FX. Build up from nothing to hear every choice.",
      "Whenever you don't know what a knob does, automate it across a held note and listen.",
    ],
    quizHard: [
      { q: "An oscillator running at 5 Hz is", options: ["A bass note", "An LFO (too slow to hear as pitch)", "Inaudible noise"], answer: 1, explain: "Below ~20 Hz we don't perceive pitch — only rhythm or modulation." },
      { q: "What turns the synth's electric signal into sound?", options: ["The CPU", "The speaker cone moving air", "The MIDI cable"], answer: 1, explain: "The speaker is the final transducer — it converts voltage to physical air movement." },
      { q: "Two synths with identical settings might sound different because", options: ["One adds inaudible noise", "Their oscillator algorithms (anti-aliasing, drift, etc.) differ", "MIDI varies"], answer: 1, explain: "Different oscillator implementations have different alias-suppression, drift modelling, and saturation, all of which colour the output." },
    ],
    sources: [{ label: "learningsynths.ableton.com — Sounds", section: "Chapter 1" }],
  },

  "synth-pitch-vs-amplitude": {
    hook: "Two knobs hide in every sound: how fast, and how big.",
    beginner: {
      what: [
        "Every wiggle has two basic measurements. How fast it repeats decides the pitch. How tall each wiggle is decides the loudness.",
        "On a synth those are controlled in different places. The oscillator section chooses pitch. The amp section chooses loudness — usually with an envelope so it can change over the life of a note.",
        "They're independent. You can play a quiet high note or a loud low one; the synth treats those two properties separately.",
      ],
      why: [
        "It explains why turning up the volume doesn't change the pitch — they live in different parts of the signal chain.",
        "It also explains why velocity-to-volume sounds 'expressive' but velocity-to-pitch sounds 'broken'.",
        "When you mix, EQ deals with pitch content and faders deal with loudness — same split.",
      ],
      analogy: "Pitch is how fast you wave your hand; volume is how wide. Try waving fast and small, then slow and huge — same arm, two independent variables.",
    },
    advanced: {
      what: [
        "Pitch = fundamental frequency, expressed in Hz, perceived logarithmically (doubling = +12 semitones).",
        "Amplitude = instantaneous voltage of the waveform, but perception is also logarithmic — humans hear ratios, hence dB.",
        "The amp envelope (ADSR) controls amplitude across time per-note; the oscillator's pitch control is usually set once per-note but can be modulated by glide, LFO, or pitch envelopes for portamento and effects.",
      ],
      edgeCases: [
        "Very low pitches (<40 Hz) blur into 'feel' rather than pitch on small speakers.",
        "Tiny periodic amplitude changes (a few Hz) read as tremolo, not as 'two loudnesses'.",
        "Severely clipping a wave hides amplitude changes — once it's at the ceiling, more level can't be louder.",
      ],
      engineerNotes: [
        "Velocity is conventionally mapped to amp level: harder hit = louder note, matching acoustic intuition.",
        "Most polyphonic synths give each voice its own amp envelope, so notes don't cut each other's tails off.",
      ],
    },
    flow: "Oscillator (pitch) → … → Amp (level) → Out",
    walkthrough: [
      { do: "Init the synth. Play and hold a C3.", listen: "A steady tone at one pitch, one loudness." },
      { do: "Slowly turn the oscillator pitch up an octave while held.", listen: "Loudness doesn't change; only the perceived note moves." },
      { do: "Return to C3. Slowly pull the amp level down.", listen: "Pitch doesn't change; only loudness drops." },
      { do: "Set velocity → amp. Play soft, then hard.", listen: "Hard hits are louder, with the SAME pitch." },
    ],
    listenFor: [
      "Pitch changes feel like the note is climbing or falling.",
      "Loudness changes feel like the note is getting closer or further.",
      "The two never bleed into each other on a sane preset.",
    ],
    mistakes: [
      "Confusing 'I made it brighter' with 'I made it louder' — brightness comes from filter/spectrum, not amp.",
      "Routing velocity to pitch on a polyphonic patch (creates accidental detune chords).",
    ],
    proMoves: [
      "Map mod wheel to amp on pads — manual swells without automation.",
      "When a sound feels lifeless, modulate amp lightly with an LFO at ~3 Hz for breath / tremolo.",
    ],
    quizHard: [
      { q: "Doubling amplitude raises perceived loudness by about", options: ["3 dB / barely audible", "6 dB / clearly louder but not 'twice as loud'", "20 dB / twice as loud"], answer: 1, explain: "+6 dB is a doubling of amplitude; ~+10 dB is the loudness 'doubling' our ears actually perceive." },
      { q: "Velocity is best mapped to", options: ["Pitch", "Amp level and filter cutoff", "Reverb time"], answer: 1, explain: "Velocity-to-amp matches acoustic playing; adding a touch of velocity-to-cutoff makes hard hits also brighter, like a real instrument." },
    ],
    sources: [{ label: "learningsynths.ableton.com — Pitch / Loudness", section: "Chapter 1" }],
  },

  "synth-timbre": {
    hook: "Same pitch, same loudness, different sound. That gap is timbre.",
    beginner: {
      what: [
        "Play a C on a piano and a C on a violin at the same loudness. You hear two different sounds. The 'different' part is timbre — the colour or character of the sound.",
        "Timbre comes from the SHAPE of the wave. A pure sine is the smoothest possible shape; it sounds hollow and flute-like. A saw wave is jagged; it sounds bright and buzzy. Same note, same loudness, different shape, different colour.",
        "Almost all of synth design is reshaping that wave to get the colour you want.",
      ],
      why: [
        "It's why two presets at the same pitch can sit in completely different places in your mix.",
        "It's why a bass and a flute don't fight even when playing the same melody.",
        "Understanding timbre is what lets you swap from 'pick a preset' to 'design a sound'.",
      ],
      analogy: "Pitch is which note. Loudness is how hard. Timbre is which instrument is playing it.",
    },
    advanced: {
      what: [
        "Timbre is determined by the spectrum (which frequencies are present and at what levels) and the envelope (how that spectrum evolves over time).",
        "Two notes at the same fundamental but different spectra sound categorically different. A sine has only the fundamental; a saw has the fundamental plus every integer harmonic at 1/n amplitude.",
        "Time matters too: a piano's harmonic content decays fast, an organ's stays flat. The same spectrum with a different envelope can be unrecognisable.",
      ],
      edgeCases: [
        "Inharmonic spectra (bells, FM metal, noise) have partials that are NOT integer multiples of the fundamental — they sound 'pitched but weird'.",
        "Below ~80 Hz, our perception of timbre weakens — sub-bass mostly feels like 'weight', not 'colour'.",
        "Spectral changes within the first 30 ms of a note dominate timbre identification (the 'attack transient').",
      ],
      engineerNotes: [
        "Removing the attack transient from a piano sample makes it nearly indistinguishable from an organ — proof of how much timbre lives in the first instant.",
        "A spectrum analyser pinned to your master is the fastest way to learn what each preset is doing spectrally.",
      ],
    },
    flow: "Spectrum × Envelope = Timbre",
    walkthrough: [
      { do: "Init the synth to a sine wave. Hold a note.", listen: "Smooth, hollow tone — minimum timbre." },
      { do: "Switch the oscillator to saw without touching pitch or level.", listen: "Brighter, buzzy. Same pitch and loudness — only timbre changed." },
      { do: "Switch to square.", listen: "Hollow / clarinet-like. Different shape, different colour." },
      { do: "Back on saw, open and close the filter cutoff slowly.", listen: "Timbre changes continuously without pitch or loudness moving." },
    ],
    listenFor: [
      "Brightness rising as more harmonics come through.",
      "Hollowness when only odd harmonics are present.",
      "Buzz / edge when all harmonics are present at full level.",
      "The 'attack character' — that first 30 ms defines a lot.",
    ],
    mistakes: [
      "Trying to fix a dull mix with more volume (a louder dull sound is still dull).",
      "Assuming a 'rich' preset is always desirable — sometimes the mix wants a sine for the sub.",
    ],
    proMoves: [
      "When stacking two synths in the same register, give them different spectra (one bright, one dark) so they don't fight.",
      "Print a spectrum snapshot of any reference sound you love — then rebuild it on the synth.",
    ],
    quizHard: [
      { q: "Removing the attack transient from a piano makes it sound like", options: ["A snare", "An organ", "Itself but quieter"], answer: 1, explain: "Most of a piano's identity is in the hammer-strike attack. Without it, the steady portion sounds organ-ish." },
      { q: "Inharmonic partials are typical of", options: ["Sine waves", "Bells and FM metal sounds", "Square waves"], answer: 1, explain: "Bells, gongs and aggressive FM patches have partials at non-integer ratios — pitched, but with a 'metallic' colour." },
    ],
    sources: [{ label: "learningsynths.ableton.com — Sound", section: "Chapter 1" }],
  },

  "synth-harmonics": {
    hook: "Every rich sound is a stack of pure sines pretending to be one note.",
    beginner: {
      what: [
        "If you play a saw wave at 110 Hz, you actually hear a stack of sine waves. The strongest one is at 110 Hz (the fundamental) — that's the note you perceive. On top of it sit weaker sines at 220, 330, 440, 550 Hz, and so on, each at a smaller volume.",
        "Those higher sines are the harmonics. They're what make a saw sound like a saw and not a sine. Different wave shapes give you different harmonic recipes.",
        "A filter is basically a tool for adjusting the volume of those harmonics independently of the fundamental.",
      ],
      why: [
        "Knowing which wave has which harmonics tells you instantly what you'll need to filter to get the colour you want.",
        "It's why a square sounds 'hollow' (no even harmonics) and a saw sounds 'full' (every harmonic present).",
        "It explains why EQ-ing high frequencies on a bass can change its character dramatically — you're trimming the high harmonics of the same fundamental.",
      ],
      analogy: "A wave is a band, not a soloist. The fundamental is the lead singer; the harmonics are the rest of the group, each at their own volume.",
    },
    advanced: {
      what: [
        "Any periodic waveform can be decomposed into a sum of sine waves at integer multiples of the fundamental (Fourier series). The amplitudes of those partials define the wave's spectrum.",
        "Saw: 1/n amplitude on all harmonics → brightest classic wave. Square: 1/n amplitude on odd harmonics only → hollow / nasal. Triangle: 1/n² on odd harmonics → soft, dominated by fundamental.",
        "Any operation that adds, removes, or shifts harmonics changes the timbre. Subtractive synthesis exploits this by starting harmonic-rich and removing; additive does the opposite.",
      ],
      edgeCases: [
        "Real digital oscillators must band-limit their harmonics below Nyquist or you get aliasing — the bright 'cheap' sound of low-quality saws.",
        "Inharmonic content (bell-like sounds, FM) cannot be decomposed into integer-multiple harmonics.",
        "Phase relationships between harmonics affect the wave's silhouette but barely change how the ear perceives the timbre.",
      ],
      engineerNotes: [
        "1/n amplitude rolloff in saws means high harmonics fall off naturally — saws are not as harsh as their reputation if you stay below Nyquist/2.",
        "Removing even harmonics from a sine + harmonics stack moves the perceived character from 'reed' toward 'clarinet'.",
      ],
    },
    flow: "Fundamental + Harmonics (decreasing amplitude) = Complex Wave",
    walkthrough: [
      { do: "Play a sine at A2 (110 Hz). Open a spectrum analyser.", listen: "One peak at 110 Hz. Nothing else." },
      { do: "Switch to saw at A2.", listen: "Peak at 110 Hz, then 220, 330, 440… stair-stepping down in level." },
      { do: "Switch to square at A2.", listen: "Peak at 110, then 330, 550, 770… only odd multiples." },
      { do: "Drop a low-pass filter and slowly close it.", listen: "Top peaks vanish first; fundamental survives last." },
    ],
    listenFor: [
      "Saw → square: a bright wave becomes hollow as even harmonics disappear.",
      "Square → triangle: hollowness softens as upper odd harmonics fall away faster.",
      "Filter closing: a 'darkening' sweep as upper partials are silenced.",
    ],
    mistakes: [
      "Thinking the fundamental disappears when you close the filter (it usually doesn't — it's the safest harmonic).",
      "Boosting 5 kHz to 'add air' to a sound that has zero energy up there to begin with.",
    ],
    proMoves: [
      "Use a spectrum analyser side-by-side with the synth — train your eye to predict your ear.",
      "When two sounds clash, look at their spectra: usually they're competing for the same 2-3 harmonics.",
    ],
    quizHard: [
      { q: "A square wave at 200 Hz contains energy at", options: ["200, 400, 600 Hz…", "200, 600, 1000 Hz… (odd multiples)", "200 Hz only"], answer: 1, explain: "Squares have odd-only harmonics: 1×, 3×, 5×…" },
      { q: "Aliasing in a digital saw sounds like", options: ["Pleasant warmth", "Inharmonic 'cheap' overtones at the top", "Sub-bass rumble"], answer: 1, explain: "Harmonics above Nyquist fold back into the audible range as inharmonic content — the classic 'cheap digital' artefact." },
    ],
    sources: [{ label: "learningsynths.ableton.com — Harmonics", section: "Chapter 1" }],
  },

  "synth-noise": {
    hook: "All frequencies at once. The secret of every hi-hat.",
    beginner: {
      what: [
        "Noise is a special signal that contains every frequency at roughly the same level. Because no single pitch dominates, you don't hear a 'note' — you hear a hiss.",
        "It's the raw material of any sound that isn't pitched: hi-hats, claps, snare bodies, breath, wind, ocean. Shape it with a filter and an envelope and almost any percussive sound is possible.",
        "Mixed quietly under a synth pad it adds 'air' — the impression of breath that makes analogue synths feel alive.",
      ],
      why: [
        "Most drum machines build their unpitched percussion from a noise oscillator.",
        "A pinch of noise behind any pad or vocal makes it sit in the mix more believably.",
        "It's the cheapest way to add movement to a static sound.",
      ],
      analogy: "Noise is the synth equivalent of a snare's wires — buzz with no pitch, ready to be shaped.",
    },
    advanced: {
      what: [
        "White noise has equal energy per Hz (flat spectrum). Pink noise has equal energy per octave (-3 dB/octave roll-off) and matches how the ear perceives 'evenness'.",
        "Shaped through a band-pass filter, noise becomes pitched percussion — closing the bandwidth tightens the tone toward a faint note.",
        "Used as a modulation source (sample-and-hold) it creates random stepped variation — the classic 'computer beeping' sound when routed to pitch.",
      ],
      edgeCases: [
        "True white noise reproduced on small speakers sounds bright-and-tinny because most of its energy is high.",
        "Filtering noise with high resonance can make it sing a note — the resonance peaks become quasi-pitched.",
        "Noise summed with a pitched oscillator at high levels can mask the fundamental — use carefully.",
      ],
      engineerNotes: [
        "Brown noise (-6 dB/oct) sounds like distant rumble; great as foundation for thunder / sub fx.",
        "Sample-and-hold = noise sampled at a slow clock = stepped random values — useful for arpeggio-like cutoff jumps.",
      ],
    },
    flow: "Noise → Filter (shape) → Envelope (length) → Mix",
    walkthrough: [
      { do: "Switch the oscillator to noise. Play a key.", listen: "A hiss. No pitch." },
      { do: "Drop a low-pass filter and close it.", listen: "Hiss becomes a 'shhh' — pink-ish." },
      { do: "Set a snap-fast amp envelope (1 ms attack, 50 ms decay, 0 sustain).", listen: "Closed hi-hat." },
      { do: "Lengthen decay to 300 ms.", listen: "Open hi-hat." },
    ],
    listenFor: [
      "Noise has no pitch — bending the synth pitch barely changes it.",
      "Filter sweeps colour the noise without giving it a note.",
      "Short envelopes turn noise into hats; long envelopes turn it into wind.",
    ],
    mistakes: [
      "Adding too much noise to a pad — air becomes hiss quickly.",
      "Trying to play 'noise melodies' (you can't — no pitch).",
    ],
    proMoves: [
      "Sample-and-hold from a noise source → cutoff = instant 'glitchy' arpeggio effect.",
      "Layer pink noise under a snare for instant body without changing the tonal balance.",
    ],
    quizHard: [
      { q: "Pink noise vs white noise:", options: ["Pink has more highs", "Pink has equal energy per octave (less hiss-y on speakers)", "They are identical"], answer: 1, explain: "Pink rolls off ~3 dB/oct above white, which matches how human ears perceive 'flat'." },
      { q: "Noise + high-Q band-pass filter becomes", options: ["Louder noise", "A quasi-pitched, breathy tone", "Silence"], answer: 1, explain: "High Q + narrow band turns noise's broad energy into a single ringing frequency — pitched-ish percussion." },
    ],
    sources: [{ label: "learningsynths.ableton.com — Noise", section: "Chapter 1" }],
  },

  "synth-oscillators": {
    hook: "Pick the right wave and you're 70% there.",
    beginner: {
      what: [
        "The oscillator is the part of the synth that actually generates sound. Almost every synth offers the same four classic shapes plus noise: sine, triangle, square, sawtooth.",
        "Each shape has a built-in character because of its harmonic content. Sine has none (pure). Triangle is mellow. Square is hollow. Saw is the brightest and most flexible.",
        "Most bass and lead patches start from a saw; pads often layer multiple saws; subs are sines or triangles; FM bells use sines modulating sines.",
      ],
      why: [
        "Choosing the wrong wave makes the rest of the patch a fight. Choosing the right wave gets you most of the way for free.",
        "Recognising the four shapes by ear is one of the fastest 'sound design' skills you can build.",
        "It's the same vocabulary every synth shares, from a 1971 Minimoog to a 2024 soft synth.",
      ],
      analogy: "Oscillator shape is the type of paint. Filter is the brush. Envelope is the gesture. You can't paint a hard edge with thin watercolour.",
    },
    advanced: {
      what: [
        "Each shape has a defined harmonic spectrum: sine (1 partial), triangle (odd harmonics at 1/n²), square (odd at 1/n), saw (all at 1/n). The amplitude rolloff defines the perceived brightness.",
        "Many modern synths offer wavetable oscillators that morph between shapes, and analog-style oscillators with drift and saturation that emulate analogue imperfections.",
        "Pulse-width on a square oscillator continuously deforms the wave, sweeping its spectrum between square and very thin pulse — the iconic '70s sync-lead character.",
      ],
      edgeCases: [
        "Hard-sync oscillators (one resets the other) generate complex inharmonic spectra useful for tearing leads.",
        "FM oscillators expose modulator/carrier pairs instead of shape — they're a different family entirely.",
        "Some 'analog-modelled' synths randomise the starting phase per voice — without that, repeated identical notes can sound artificially uniform.",
      ],
      engineerNotes: [
        "If a patch sounds 'thin', re-pick the oscillator before reaching for EQ — there's likely no signal to boost.",
        "Saw + detuned saw + sine an octave down covers 80% of dance bass and lead patches.",
      ],
    },
    flow: "Pick shape → Pick octave → Pick mix level",
    walkthrough: [
      { do: "Init the synth. Try each of the four shapes at the same pitch and level.", listen: "Sine = hollow, Tri = soft, Square = nasal, Saw = buzzy. Same note." },
      { do: "Put the oscillator one octave below the played note.", listen: "Same shape feels heavier, more 'bass'." },
      { do: "Add a second oscillator at the played octave + the original sub octave.", listen: "Hybrid sound — body + brightness." },
    ],
    listenFor: [
      "Saw has presence in the upper mids — perceived as 'bright'.",
      "Square has a clarinet/hollow vibe — perceived as 'nasal'.",
      "Triangle is essentially a 'soft sine' — gentle.",
      "Sine cuts cleanly through a mix as bass because nothing competes harmonically.",
    ],
    mistakes: [
      "Picking sine for a 'fat lead' (sine has no harmonics — there's nothing for the filter to shape).",
      "Picking saw for a clean sub (too much harmonic content above the fundamental).",
    ],
    proMoves: [
      "Build an 'oscillator audition' rack with one note triggering each shape in turn — sharpens ear training fast.",
      "When making bass, layer a saw (carved with LP filter) over a sine — the saw gives character, the sine gives weight.",
    ],
    quizHard: [
      { q: "Triangle wave harmonics decay at", options: ["1/n (slow)", "1/n² (fast)", "Equally"], answer: 1, explain: "Triangle's 1/n² rolloff is why it sounds much softer than a saw of the same fundamental." },
      { q: "Pulse-width modulation on a square oscillator", options: ["Changes pitch", "Sweeps the spectrum between square and thin pulse", "Adds reverb"], answer: 1, explain: "PWM continuously deforms the wave — the spectrum shifts, creating that classic chorus-y movement." },
    ],
    sources: [{ label: "learningsynths.ableton.com — Oscillators", section: "Chapter 2" }],
  },

  "synth-mixing-oscillators": {
    hook: "One oscillator is a person. Two is a band.",
    beginner: {
      what: [
        "Most synths give you 2 or 3 oscillators you can mix together. Layering them is the fastest way to a bigger, more complex sound — without touching filters or effects.",
        "The four classic layering moves: same shape detuned a few cents (fat / chorus-y), different shapes mixed (hybrid character), one octave below (weight and sub), one octave above (sparkle).",
        "Most great patches use 2-3 oscillators with one of those four relationships.",
      ],
      why: [
        "It's free fattening — no CPU-heavy effects required.",
        "Different shape combinations are how every classic synth bass/lead got its identity.",
        "Once you know the layering moves, you can recreate almost any preset family from scratch.",
      ],
      analogy: "Stacking oscillators is doubling a vocal in the studio. Same melody, two takes, instantly bigger.",
    },
    advanced: {
      what: [
        "Summing two oscillators produces a new spectrum equal to the sum of their individual spectra. With identical waves at small detune, neighbouring harmonics drift in and out of phase — perceived as 'chorus'.",
        "Octave layering populates spectral regions that one oscillator alone leaves empty. A sub octave fills below the fundamental; an octave-up oscillator gives presence without shifting the perceived note.",
        "Mixing two different shapes (e.g. saw + square) creates a hybrid spectrum with both even and odd harmonics weighted differently — a single shape couldn't produce this on its own.",
      ],
      edgeCases: [
        "Identical oscillators perfectly in tune simply sum to one louder oscillator — no fatness without detune.",
        "Wide detune (>20 cents) on a chord causes audible beating with the chord intervals — sounds out of tune.",
        "Sub-octave sines summed with a square can phase-cancel the fundamental if the square's odd harmonics dominate. Pull sub level back if the low end thins.",
      ],
      engineerNotes: [
        "Phase relationships between summed oscillators matter at low frequencies — many synths offer free-running vs key-reset phase.",
        "Test mono compatibility on layered patches; some 'wide' detune unisons collapse to mush in mono.",
      ],
    },
    flow: "Osc 1 + Osc 2 (+ Osc 3) → Mix → Filter → Amp",
    walkthrough: [
      { do: "Two oscillators, both saw, both at 0 cents detune. Play.", listen: "One louder saw. No fatness." },
      { do: "Detune Osc 2 to +7 cents.", listen: "Notes feel warmer and wider — the classic 'two saws' character." },
      { do: "Drop Osc 2 one octave below.", listen: "Bigger bottom, same melody." },
      { do: "Change Osc 2 to a square.", listen: "Hybrid: saw brightness + square hollowness." },
    ],
    listenFor: [
      "Detune adds movement, not pitch.",
      "Octave stacks add weight (down) or air (up) without re-tuning.",
      "Different-shape mixes have a unique colour neither shape achieves alone.",
    ],
    mistakes: [
      "Detuning so much that the chord starts beating audibly.",
      "Stacking three oscillators at the same octave at full level — the patch loses focus.",
    ],
    proMoves: [
      "Pull each oscillator's level so the total never clips at the filter input — leaves headroom for resonance.",
      "Saw + saw +12 + sine -12 is a one-size-fits-most lead recipe to start customising.",
    ],
    quizHard: [
      { q: "Two perfectly in-tune saws summed sound like", options: ["One fatter saw", "One louder saw", "A chord"], answer: 1, explain: "No detune, no phase movement — just a louder copy of the same wave." },
      { q: "A common bass layering recipe is", options: ["3 detuned saws same octave", "Saw (mid) + sine one octave down", "Noise + triangle"], answer: 1, explain: "Saw gives character, sine sub adds weight without competing harmonics — classic separation." },
    ],
    sources: [{ label: "learningsynths.ableton.com — Layering oscillators", section: "Chapter 2" }],
  },

  "synth-detune-unison": {
    hook: "Same wave, slightly out of tune with itself. The defining trick of modern leads.",
    beginner: {
      what: [
        "Detune means deliberately tuning two oscillators slightly apart — usually measured in cents, where 100 cents = 1 semitone. A few cents off and the two waves drift in and out of phase, creating that big chorused 'two singers' effect.",
        "Unison is the synth feature that does this for you automatically: stack 3, 5, 7 copies of the same oscillator and spread them across a small pitch range.",
        "It's the foundation of the 'supersaw' — 7 detuned saws panned wide. Half of mainstream dance music's lead sounds.",
      ],
      why: [
        "Detune turns a thin oscillator into a 'wide' one without any stereo effects.",
        "It's the cheapest possible way to make a patch feel modern.",
        "Knowing how much detune is 'enough' is one of the cleanest taste-judgement skills in synthesis.",
      ],
      analogy: "Detune is a choir. One singer is a note. Seven singers slightly off-pitch is a sound you can feel in your chest.",
    },
    advanced: {
      what: [
        "Detune in cents: 1 cent = 1/1200 of an octave. Small offsets (5-15 ¢) produce slow chorus-like beating. Large offsets (25-50 ¢) push toward the supersaw character.",
        "Unison generates N voices per note. The detune knob spreads them around the played frequency; an additional 'spread' knob pans them in stereo for width.",
        "Beating frequency between two detuned tones = the cents difference scaled to Hz. 5 ¢ at 220 Hz ≈ 0.6 Hz beating — slow movement. 50 ¢ ≈ 6 Hz — fast warble.",
      ],
      edgeCases: [
        "On chords, unison detune multiplies voices fast — a 7-voice unison patch on a 4-note chord = 28 oscillators per chord = CPU spike.",
        "Wide stereo spread on unison can vanish in mono playback (clubs, phones). Always mono-check.",
        "Detune greater than the smallest interval in your chord (e.g. >50 ¢ on a tritone) starts to sound dissonant rather than wide.",
      ],
      engineerNotes: [
        "True random per-voice detune (re-seeded per note) sounds more 'analogue' than fixed offsets.",
        "Drum-style sounds (kick stabs) hate unison detune — the transient blurs and the punch dies.",
      ],
    },
    flow: "1 Osc → N detuned voices → Stereo spread → Sum",
    walkthrough: [
      { do: "Set Osc 1 to saw. Add Osc 2 same saw at 0 ¢. Play C3.", listen: "One louder saw, no movement." },
      { do: "Set Osc 2 detune to +7 ¢.", listen: "Slow shimmer / chorus." },
      { do: "Push to +25 ¢.", listen: "Notably wider, slight beating." },
      { do: "Engage unison 7 voices with moderate detune.", listen: "The supersaw." },
    ],
    listenFor: [
      "Slow beating at small detune (1-2 beats per second).",
      "Faster, more audible warble at wide detune.",
      "Width on unison that collapses if you go mono.",
    ],
    mistakes: [
      "Using unison on bass — it makes the bottom mushy.",
      "Stacking unison on a polyphonic chord patch and surprising your CPU.",
    ],
    proMoves: [
      "Tame unison's high-frequency wash with a gentle LP filter at 6-8 kHz.",
      "When stacking unison + reverb, sidechain the reverb to the lead so it doesn't smear the attack.",
    ],
    quizHard: [
      { q: "Two saws detuned 5 ¢ apart at 440 Hz produce a beating frequency of about", options: ["0.1 Hz", "1.3 Hz", "10 Hz"], answer: 1, explain: "5 cents at 440 Hz ≈ 1.3 Hz frequency difference — slow chorus." },
      { q: "Why does wide unison sometimes vanish in mono?", options: ["Filters cut it", "Phase-cancellation between left and right detune voices", "It's a CPU bug"], answer: 1, explain: "Voices panned opposite with different phases can partially cancel when summed to mono. Always check." },
    ],
    sources: [{ label: "learningsynths.ableton.com — Unison", section: "Chapter 2" }],
  },

  "synth-filters": {
    hook: "Start bright. Take frequencies away. That's subtractive synthesis.",
    beginner: {
      what: [
        "A filter removes frequencies from a signal. The most-used kind by miles is the low-pass: keep the lows, throw away the highs above a chosen cutoff frequency.",
        "Two main controls: cutoff (where the cut begins) and resonance (how much you boost frequencies right AT the cutoff). High resonance makes the filter 'sing' at the cutoff point.",
        "Other shapes: high-pass (keeps highs, cuts lows — thins a bass), band-pass (keeps a slice in the middle — telephone), notch (cuts a slice — useful for de-honking).",
      ],
      why: [
        "The filter is the single most expressive control on any synth. Moving the cutoff changes the entire character of the sound in real time.",
        "Almost every 'wow' moment in dance music is a filter sweep.",
        "It's how you go from 'raw oscillator' to 'finished sound'.",
      ],
      analogy: "Cutoff is the height of a wall. Resonance is the searchlight at the top. Frequencies above the wall can't pass; frequencies right at the wall get extra bright under the light.",
    },
    advanced: {
      what: [
        "A low-pass filter has a corner frequency (cutoff) and a roll-off slope (typically 12 or 24 dB/octave). Steeper slope = more aggressive cut.",
        "Resonance (Q) creates a peak at the cutoff. At Q ≈ 1 it's subtle; at Q ≈ 10+ it rings; at self-oscillation (Q ≈ 20+) the filter becomes a sine oscillator on its own.",
        "Filter character matters as much as shape: Moog ladder, SEM, Roland TB-303, MS-20 — each model the same low-pass response differently, with subtly different saturation and resonance behaviour.",
      ],
      edgeCases: [
        "High resonance at low cutoff can create dangerous bass peaks that exceed your master ceiling. Watch the meter.",
        "Self-oscillating filters can be played as a sine oscillator via key-tracking — a classic trick.",
        "Some filters add distortion at the input stage when driven hard (the 'Moog growl') — feature, not bug.",
      ],
      engineerNotes: [
        "Always EQ your synths AFTER the filter has done its main shaping — fix problems at the source.",
        "Map velocity to a touch of cutoff (10-20%) for natural 'harder = brighter' expression.",
      ],
    },
    flow: "Source → Filter (cutoff + Q) → Amp",
    walkthrough: [
      { do: "Init the synth to a saw. Drop a low-pass filter wide open (cutoff at max).", listen: "Bright, buzzy saw." },
      { do: "Slowly pull cutoff down to ~500 Hz.", listen: "Brightness disappears layer by layer." },
      { do: "Raise resonance to 8.", listen: "A whistle appears at the cutoff frequency." },
      { do: "Sweep cutoff up and down with high resonance.", listen: "The classic 'wah'." },
    ],
    listenFor: [
      "Brightness fades from the top first, not the bottom.",
      "Resonance creates a pitched 'singing' at the cutoff.",
      "Very low cutoff makes even a saw sound dark and muddy.",
    ],
    mistakes: [
      "Pushing cutoff fully closed and wondering where the sound went.",
      "Cranking resonance without a limiter on the master — dangerous peaks.",
    ],
    proMoves: [
      "Cutoff under your mod wheel turns any preset into a performance instrument.",
      "When two synths fight in the mids, HP one of them at 200-300 Hz — instant clarity.",
    ],
    quizHard: [
      { q: "Increasing filter slope from 12 to 24 dB/oct", options: ["Doubles the audible cut", "Halves it", "Makes it more gentle"], answer: 0, explain: "Steeper slope removes more energy per octave above cutoff — twice as aggressive at 24 vs 12." },
      { q: "A self-oscillating filter behaves like", options: ["A noise source", "A sine oscillator at the cutoff frequency", "An echo"], answer: 1, explain: "At very high Q the filter becomes unstable and outputs a sine — playable like an extra oscillator." },
    ],
    sources: [{ label: "learningsynths.ableton.com — Filters", section: "Chapter 3" }],
  },

  "synth-amp-envelope": {
    hook: "ADSR — the shape of every note.",
    beginner: {
      what: [
        "An envelope tells the amplifier how loud the note should be over time. The classic shape is ADSR: Attack, Decay, Sustain, Release.",
        "Attack is the time it takes to climb from silent to full volume after you press the key. Decay is how long it takes to fall from peak to the sustain level. Sustain is the loudness it sits at while you hold the key. Release is how long it takes to fade to silent after you let go.",
        "Different ADSR shapes give you radically different note characters. Short attack + short decay + zero sustain = a pluck. Long attack + high sustain + long release = a pad.",
      ],
      why: [
        "ADSR is the universal language of envelopes. Every synth uses it; every drum machine; every sampler.",
        "Most 'wrong' patches are wrong because of the envelope, not the oscillator.",
        "Tiny envelope changes (5 ms more attack) can turn a sound from harsh to musical.",
      ],
      analogy: "ADSR is a story arc for a note. Attack is the entrance. Decay is the settle. Sustain is the hang. Release is the fade.",
    },
    advanced: {
      what: [
        "Envelopes generate a control signal that ramps between 0 and 1 according to the four ADSR parameters. The amp envelope routes that signal to a VCA-equivalent stage that scales the wave amplitude.",
        "Curves matter: a linear envelope sounds different from an exponential or logarithmic one even with identical time constants. Most digital synths default to exponential decay/release because it matches acoustic decay behaviour.",
        "Re-trigger behaviour: legato (don't restart envelope on next note while previous is held) vs always-retrigger drastically changes how melodic passages feel.",
      ],
      edgeCases: [
        "0 ms attack causes audible click artefacts on some waveforms — a 1 ms minimum attack is usually safer.",
        "Sustain at 0 means release never engages (the note already died during decay). Release only matters when sustain > 0.",
        "Very long release on a polyphonic patch can starve voice count — old notes never finish before new ones start.",
      ],
      engineerNotes: [
        "Use attack to control 'percussive vs sustained' perception. Anything <10 ms reads as percussive.",
        "Curve shape changes perceived loudness even at identical RMS — exponential decays feel more 'natural'.",
      ],
    },
    flow: "Key down → Attack → Decay → Sustain (held) → Key up → Release",
    walkthrough: [
      { do: "Init synth. Set A=0, D=0, S=1.0, R=0.5. Play and hold.", listen: "Instant on, holds, fades out on release. Organ-like." },
      { do: "Set A=0, D=0.2, S=0, R=0.2. Play.", listen: "Pluck — drops to zero even while holding." },
      { do: "Set A=2 s, D=0, S=1, R=2 s. Play.", listen: "Slow pad swell in and out." },
      { do: "Compare 5 ms vs 50 ms attack on a saw lead.", listen: "5 ms feels punchy; 50 ms feels rounded." },
    ],
    listenFor: [
      "Attack longer than ~30 ms removes the percussive 'thwack'.",
      "Sustain 0 = note dies on its own; sustain >0 = note holds.",
      "Release determines how the note overlaps with the next.",
    ],
    mistakes: [
      "Forgetting release is zero on a 'pluck preset' you're trying to use as a pad.",
      "Confusing decay and release — decay is held-key dynamics, release is post-key-up.",
    ],
    proMoves: [
      "Tiny 5-10 ms attack on lead patches removes harshness without sounding 'soft'.",
      "Polyphonic pads need release ≥ 1 s for natural-sounding chord overlaps.",
    ],
    quizHard: [
      { q: "If sustain is 0, the release control", options: ["Has no effect", "Determines the entire fade-out", "Triggers automatically"], answer: 0, explain: "If decay already drove the level to zero while held, there's nothing for release to fade." },
      { q: "An attack time of 0 ms on a pure sine wave often", options: ["Sounds perfectly clean", "Produces an audible click", "Slows the note"], answer: 1, explain: "An instant jump from 0 to peak amplitude is a step discontinuity — broadband click. 1-2 ms eliminates it." },
    ],
    sources: [{ label: "learningsynths.ableton.com — Envelopes", section: "Chapter 4" }],
  },

  "synth-filter-envelope": {
    hook: "Move the cutoff on a schedule. The whole sound transforms.",
    beginner: {
      what: [
        "An envelope doesn't have to control volume. Aim that same ADSR shape at the filter's cutoff and you get an automatic filter sweep on every keypress.",
        "Two extra controls usually appear: 'envelope amount' (how far the cutoff moves) and 'base cutoff' (the cutoff value when the envelope is at zero).",
        "This is where almost all synth character lives. A fast filter envelope with high amount = the classic plucky lead. A slow filter envelope = the 'pad swell'.",
      ],
      why: [
        "It turns a static patch into an expressive one — every note moves.",
        "It's the secret behind plucks, bows, brass attacks, and almost all 'wow' sweeps.",
        "Two envelopes (amp + filter) cover almost every 'expressive instrument' template.",
      ],
      analogy: "If the amp envelope is the volume of a singer, the filter envelope is the brightness of their voice — opening on the attack, closing on the tail.",
    },
    advanced: {
      what: [
        "The filter envelope offsets the cutoff value by the envelope output multiplied by the amount knob. Negative amount reverses the direction (cutoff drops on attack, returns on release).",
        "Common shape: A≈1 ms, D=100-300 ms, S=0 or low, R=matched to amp release. This gives the cutoff a quick 'pluck up' that decays as the note holds.",
        "Some synths support multiple filter envelopes (one per filter stage) or a dedicated 'modulation envelope' that can be routed anywhere.",
      ],
      edgeCases: [
        "If amount is large and base is low, cutoff at the envelope's peak might exceed Nyquist — no audible change above the highest harmonic.",
        "Envelope amount + key-tracking interact: tracking adds cutoff per note, so high notes can end up brighter than intended.",
        "Negative amount with high resonance creates an 'inverse pluck' — the resonance peak descends through the spectrum.",
      ],
      engineerNotes: [
        "Always set BASE cutoff first to define the resting tone, then add ENVELOPE amount to choose how far it travels.",
        "For 80s-style brass: A=10 ms, D=400 ms, S=0.4, amount=mid. The filter slowly closes during the held note.",
      ],
    },
    flow: "Key down → Filter Env → Cutoff offset → Filter → Amp",
    walkthrough: [
      { do: "Saw oscillator. Filter LP. Set base cutoff to 200 Hz. Amp envelope sustaining.", listen: "Dark, lifeless." },
      { do: "Add filter envelope: A=1 ms, D=200 ms, S=0, amount=high.", listen: "Each note 'plucks' bright then closes." },
      { do: "Raise resonance to 5.", listen: "Pluck gains a whistle — classic synth pluck/bass." },
      { do: "Increase D to 1 s, S to 0.6.", listen: "Slower filter movement, brass-like." },
    ],
    listenFor: [
      "Cutoff jumping up on the attack of each new note.",
      "Decay closing the cutoff as the note holds.",
      "Resonance adding a moving whistle that sweeps with the envelope.",
    ],
    mistakes: [
      "Setting amount very high without dropping base cutoff — the envelope just hits the ceiling and does nothing audible.",
      "Forgetting envelope amount = 0 means the filter envelope does literally nothing.",
    ],
    proMoves: [
      "Map velocity to filter envelope amount — soft notes stay dark, hard notes bloom open.",
      "Negative envelope amount + closed base cutoff = 'inverse pluck'. Useful for unique pad textures.",
    ],
    quizHard: [
      { q: "Envelope amount = 0 means", options: ["Cutoff stays at base — envelope has no effect", "Cutoff slams to max", "Filter switches off"], answer: 0, explain: "Amount = 0 disconnects the envelope from the cutoff." },
      { q: "Negative envelope amount on a low-pass filter causes", options: ["Cutoff to rise on attack", "Cutoff to fall on attack and recover on release", "Filter to bypass"], answer: 1, explain: "Negative amount inverts the envelope's direction — cutoff drops at peak then climbs back." },
    ],
    sources: [{ label: "learningsynths.ableton.com — Filter envelope", section: "Chapter 4" }],
  },

  "synth-amp-vs-filter-env": {
    hook: "Two envelopes shape every note. Line them up or offset them — that's the patch.",
    beginner: {
      what: [
        "Every standard synth has at least two envelopes: amp (volume over time) and filter (cutoff over time). They don't have to share settings. The relationship between them is where character lives.",
        "Long amp release + short filter release = a note that fades out duller than it started. Short amp + long filter = the filter never gets to finish moving before the sound dies.",
        "The combinations are infinite, but a handful of recipes cover most cases. Get those into your fingers and you can design quickly.",
      ],
      why: [
        "Most 'this preset is off but I don't know why' moments come down to envelope mismatch.",
        "It's the cleanest way to differentiate similar patches without changing the oscillator.",
        "Lining the two envelopes up vs deliberately offsetting them is the whole craft of envelope design.",
      ],
      analogy: "Amp envelope is when the singer enters and exits. Filter envelope is how bright their voice is at each moment. You can have a singer who walks in dim and brightens, or one who shouts loud and goes hoarse on the held note.",
    },
    advanced: {
      what: [
        "Amp and filter envelopes operate independently in parallel. The amp envelope gates whether you hear the note at all; the filter envelope colours the sound while it's audible.",
        "If amp release = 100 ms and filter release = 1 s, the filter is still moving when the sound ends — only the early portion of the filter release is audible.",
        "Inverse scenario: amp release = 2 s, filter release = 100 ms — the tail of the note holds at a low cutoff, sounding 'dark fade-out'.",
      ],
      edgeCases: [
        "Amp envelope reaching 0 silences the note regardless of where filter is — filter envelope continues 'in the background' on polyphonic synths until the voice is recycled.",
        "Triggering the filter envelope without re-triggering the amp envelope (legato mode) can create smooth filter sweeps across legato passages.",
      ],
      engineerNotes: [
        "Match amp and filter release for the most 'natural' fade. Mismatch them deliberately for character.",
        "On 808-style stabs: amp A=0, D=1.5 s, S=0; filter A=0, D=0.4 s, S=0. The pluck goes dull fast but rings out long.",
      ],
    },
    flow: "Amp Env → Volume\nFilter Env → Cutoff (in parallel)",
    walkthrough: [
      { do: "Match both envelopes (A=10 ms, D=300 ms, S=0.5, R=400 ms). Hold a note.", listen: "Coherent, predictable note shape." },
      { do: "Set filter release to 50 ms while amp release stays 400 ms.", listen: "Tail goes dull quickly, hangs around quiet." },
      { do: "Set filter release to 1.5 s while amp release stays 400 ms.", listen: "Filter never finishes — the bright top is cut off short by amp." },
      { do: "Try amp S=1, filter S=0. Hold the note.", listen: "Steady volume, but cutoff slowly closes — note 'fades dark' while staying loud." },
    ],
    listenFor: [
      "Tail brightness changing relative to tail volume.",
      "'Filter exists past the sound' (you don't hear filter changes once amp = 0).",
      "Different envelope shapes giving the same notes different emotional weight.",
    ],
    mistakes: [
      "Copy-pasting amp envelope into filter envelope and missing the design opportunity.",
      "Setting filter release to 0 — you lose all tail character.",
    ],
    proMoves: [
      "Use velocity → filter envelope amount for instant expressive dynamics that don't change volume.",
      "Offsetting filter attack by 5-10 ms longer than amp attack gives a subtle 'bloom' on every note.",
    ],
    quizHard: [
      { q: "If amp envelope hits 0 before filter envelope finishes, you'll hear", options: ["No filter movement after silence", "Both continuing", "An audible click"], answer: 0, explain: "Amp at 0 mutes the voice; filter changes have nothing to colour." },
      { q: "To make a pluck that 'fades dark' as it rings out", options: ["Amp R=long, Filter R=short", "Amp R=short, Filter R=long", "Match both R values"], answer: 0, explain: "Amp holds the tail audible; short filter R closes brightness while the volume still survives." },
    ],
    sources: [{ label: "learningsynths.ableton.com — Combining envelopes", section: "Chapter 4" }],
  },

  "synth-lfo": {
    hook: "An oscillator running too slow to hear — used to move something else.",
    beginner: {
      what: [
        "An LFO (Low-Frequency Oscillator) is the same circuit as an audio oscillator, but running at 0.1-20 Hz — slow enough that you don't perceive it as a pitch. Instead, you use it to move another parameter up and down.",
        "Four classic destinations: pitch (vibrato), filter cutoff (wobble/wah), amplitude (tremolo), and pan (auto-pan). Each one is a different effect just from re-routing the same LFO.",
        "Most synths give you 2 LFOs with selectable shapes (sine, triangle, square, saw) and rate (in Hz or synced to tempo).",
      ],
      why: [
        "LFOs are the easiest way to make a static sound feel alive.",
        "Every classic 'dubstep wobble', '80s vibrato lead', and '70s tremolo guitar' is an LFO at work.",
        "Once you map an LFO somewhere, the patch breathes — no automation required.",
      ],
      analogy: "An LFO is a hand on a knob, slowly twisting it back and forth on its own.",
    },
    advanced: {
      what: [
        "LFO shapes determine the modulation 'feel': sine = smooth, triangle = symmetric ramp, square = on/off stepping, sawtooth = sweep + reset (great for one-way ramps).",
        "Tempo-synced LFOs lock rate to note divisions (1/4, 1/8T, 2 bars) — essential for rhythmic modulation in produced tracks.",
        "Some LFOs offer phase reset on key-down (so vibrato always starts at the zero crossing) vs free-running (continuous regardless of notes — more 'analogue').",
      ],
      edgeCases: [
        "LFO rates above ~20 Hz become audible as new sidebands — this is the boundary into FM territory.",
        "Square LFOs on amplitude create 'on/off' stuttering — useful for trance gating effects.",
        "An LFO routed to its own rate (LFO modulating LFO speed) generates chaotic, unpredictable modulation.",
      ],
      engineerNotes: [
        "Light LFO → cutoff at 0.3 Hz, depth 5% gives any patch organic 'analogue drift'.",
        "Stack two LFOs on the same destination at different rates for non-repeating motion.",
      ],
    },
    flow: "LFO → Modulation matrix → Destination parameter",
    walkthrough: [
      { do: "Pick a sustained synth tone. Assign LFO 1 (sine, 5 Hz) → pitch with small depth.", listen: "Vibrato." },
      { do: "Re-route the same LFO → filter cutoff.", listen: "Filter wobble." },
      { do: "Re-route → amp.", listen: "Tremolo." },
      { do: "Re-route → pan.", listen: "Auto-pan, sound moves L↔R." },
    ],
    listenFor: [
      "Vibrato wiggles pitch up and down evenly.",
      "Filter LFO opens and closes brightness rhythmically.",
      "Amp LFO pulses loudness; square shape = on/off stutter.",
      "Pan LFO moves sound across the stereo field without changing tone.",
    ],
    mistakes: [
      "Too much LFO depth on pitch — sounds 'seasick' instead of expressive.",
      "Setting LFO rate to non-musical values when the project is tempo-driven (use sync).",
    ],
    proMoves: [
      "Map mod wheel to LFO depth — turn vibrato on as you lean in, like a real player.",
      "Trance gates: square LFO → amp, sync to 1/16. Instant tempo-locked stutter.",
    ],
    quizHard: [
      { q: "An LFO running at 0.5 Hz", options: ["Is audible as a low bass note", "Completes one cycle every 2 seconds — slow modulation", "Is identical to a low-pass filter"], answer: 1, explain: "0.5 Hz = one cycle per 2 s. Way too slow to be a pitch — perfect for slow drift." },
      { q: "An LFO above ~20 Hz routed to pitch is", options: ["Vibrato", "FM synthesis territory", "Tremolo"], answer: 1, explain: "Above ~20 Hz the modulation rate is audio-rate and starts generating sidebands instead of perceptible vibrato." },
    ],
    sources: [{ label: "learningsynths.ableton.com — LFOs", section: "Chapter 5" }],
  },

  "synth-modulation-routing": {
    hook: "Anything can control anything. That's the whole magic.",
    beginner: {
      what: [
        "Modulation routing is the matrix on a synth that decides what controls what. Sources include envelopes, LFOs, velocity, mod wheel, aftertouch, note number, random. Destinations include pitch, cutoff, resonance, oscillator level, FX mix, basically every parameter.",
        "The single best routing you can learn on day one: mod wheel → filter cutoff. It turns every patch into an expressive instrument.",
        "Other classics: velocity → amp + cutoff (harder = louder + brighter), aftertouch → vibrato depth (lean in for vibrato), random → pitch (subtle 'analogue drift').",
      ],
      why: [
        "Modulation is what separates a 'sound' from an 'instrument'. Without it, every note plays identically.",
        "It's free expression — you don't have to draw automation; the synth responds to how you play.",
        "Pro patches use 5-15 modulation routings. Once you see it, you can't un-see it.",
      ],
      analogy: "Modulation is wiring. Sources are switches, destinations are lights. The mod matrix is your patch bay.",
    },
    advanced: {
      what: [
        "Modern synth mod matrices expose each routing as source → amount → destination, often with conditional shaping (curve, lag, depth-per-velocity).",
        "Per-voice modulation (each note has its own envelope + LFOs) sounds more lifelike than per-patch (single envelope shared across all voices).",
        "MPE (MIDI Polyphonic Expression) extends per-note expression to pressure, X/Y, and pitch slide individually for every key — turning the keyboard into a polyphonic instrument with continuous expression per note.",
      ],
      edgeCases: [
        "Too many routings to the same destination can cancel out — careful with bipolar sources stacking.",
        "Long lag/slew on a destination delays the effect; useful for smoothness, lethal for plucks.",
        "Random sources need re-seeding per note or every note is identical — check the source's trigger mode.",
      ],
      engineerNotes: [
        "Map a single mod wheel to three destinations (cutoff up, reverb send up, vibrato in) for instant 'expression macro'.",
        "On MPE synths, set X (pitch slide) per note — turns held chords into expressive sustains without re-triggering.",
      ],
    },
    flow: "Source → Amount → Destination → Audio Engine",
    walkthrough: [
      { do: "Open the modulation matrix. Route mod wheel → filter cutoff, amount = 80%.", listen: "Twist the mod wheel — patch goes from dark to bright." },
      { do: "Add velocity → cutoff, amount = 30%.", listen: "Hit hard — note is brighter. Hit soft — note is darker." },
      { do: "Route aftertouch → LFO depth (pitch).", listen: "Press harder on a held key — vibrato fades in." },
      { do: "Add random → pitch with very small amount.", listen: "Subtle 'analogue drift' on every note." },
    ],
    listenFor: [
      "Identical note inputs producing varying outputs (modulation in action).",
      "Velocity producing both loudness and brightness changes — feels acoustic.",
      "Mod wheel changing the entire emotional character without you replaying.",
    ],
    mistakes: [
      "Routing too many sources to the same destination without managing total depth — confusing behaviour.",
      "Forgetting random sources usually need re-trigger per note to actually be random.",
    ],
    proMoves: [
      "Build an 'expression macro' — one mod wheel routed to cutoff + reverb + vibrato + delay send. Universal patch enhancer.",
      "Use note number → release as a destination so high notes decay faster (matches real instrument behaviour).",
    ],
    quizHard: [
      { q: "MPE allows", options: ["Per-channel expression only", "Per-note expression (pitch, pressure, slide) on every key", "Tempo modulation"], answer: 1, explain: "MPE assigns each note to its own MIDI channel so per-note expression doesn't bleed across the chord." },
      { q: "Routing the same LFO to both cutoff and amp with equal depth", options: ["Doubles the LFO speed", "Modulates both simultaneously in sync", "Cancels out"], answer: 1, explain: "Same LFO, two destinations = both move together. Cool for breath-like patches." },
    ],
    sources: [{ label: "learningsynths.ableton.com — Modulation", section: "Chapter 5" }],
  },

  "synth-fm-basics": {
    hook: "Speed up an LFO until you can hear it. Brand new sounds appear.",
    beginner: {
      what: [
        "If you slowly speed up an LFO modulating pitch (vibrato), it eventually goes so fast it stops sounding like a wobble and starts creating brand new frequencies. Welcome to FM synthesis.",
        "Two oscillators: the 'modulator' (the fast LFO) and the 'carrier' (the one you actually hear). The modulator wiggles the carrier's pitch thousands of times per second. The result has 'sidebands' — extra tones above and below the carrier that you couldn't get from a single wave.",
        "This is how the Yamaha DX7 made all the famous '80s bell, electric piano, marimba, and metallic bass sounds.",
      ],
      why: [
        "FM gets you sounds that subtractive synthesis literally can't produce — metallic, glassy, bell-like timbres.",
        "It's CPU-cheap because each 'instrument' is just a few sine waves modulating each other.",
        "Even one operator pair (1 modulator + 1 carrier) gives you a vast palette.",
      ],
      analogy: "Subtractive synthesis is sculpting marble: start big, chip away. FM is chemistry: combine ingredients to make new molecules.",
    },
    advanced: {
      what: [
        "FM = Frequency Modulation. Modulator frequency × ratio to carrier defines harmonicity (integer ratios = pitched, non-integer = inharmonic / bell-like).",
        "Modulation index (depth) controls how many sidebands are generated and how loud they are. Low index = subtle colour; high index = clangourous metal.",
        "Most FM synths chain multiple 'operators' in algorithms: stacks, parallel pairs, feedback loops. The DX7 used 6 operators in 32 fixed algorithms.",
      ],
      edgeCases: [
        "Non-integer modulator/carrier ratios produce inharmonic spectra — the basis of bells, but harsh as leads.",
        "Feedback (an operator modulating itself) generates noise-like content — useful for hi-hat and breath sounds.",
        "FM is sensitive to phase: same patch played at the same velocity can sound subtly different each time if oscillators free-run.",
      ],
      engineerNotes: [
        "Modulator envelope is at least as important as carrier envelope — FM 'attack character' lives in the modulator decay.",
        "Aliasing is the FM killer: high modulation index pushes sidebands above Nyquist, which fold back as inharmonic noise. Anti-aliased oscillators matter.",
      ],
    },
    flow: "Modulator → modulates carrier frequency → Carrier audio out",
    walkthrough: [
      { do: "Use an FM-capable synth (Operator, FM8, Dexed). Init to 2 sines: mod + carrier.", listen: "Just a sine — modulator off." },
      { do: "Bring modulator level up slowly.", listen: "Sidebands appear; timbre brightens and develops." },
      { do: "Set modulator ratio to 3.5 (non-integer).", listen: "Bell / metallic clang." },
      { do: "Give the modulator a fast envelope (A=0, D=200 ms).", listen: "Classic FM electric piano: bright tine attack, mellow body." },
    ],
    listenFor: [
      "Sidebands appearing above and below the carrier as modulation rises.",
      "Inharmonic 'metal' when ratios are non-integer.",
      "Most of the 'character' arriving in the first 200 ms (modulator envelope).",
    ],
    mistakes: [
      "Cranking modulation index to max and getting noise instead of tone.",
      "Ignoring modulator envelope — FM 'sounds plastic' without it.",
    ],
    proMoves: [
      "Build a DX7-style EP by chaining 2-3 operator pairs at 1:1 ratio with short modulator decays.",
      "Use feedback on a single operator to generate band-limited noise for hat percussion.",
    ],
    quizHard: [
      { q: "Modulator/carrier ratio = 2.0 produces a", options: ["Pitched harmonic spectrum", "Inharmonic / bell spectrum", "Silence"], answer: 0, explain: "Integer ratios give pitched spectra (octaves, fifths, etc.). Non-integers give bells." },
      { q: "Increasing modulation index too high causes", options: ["Cleaner sound", "Aliasing as sidebands exceed Nyquist", "Lower CPU"], answer: 1, explain: "High index = many sidebands. Anything above Nyquist folds back as inharmonic mush." },
    ],
    sources: [{ label: "learningsynths.ableton.com — FM", section: "Chapter 6" }],
  },

  "synth-effects": {
    hook: "The last 20% of every great patch happens AFTER the synth.",
    beginner: {
      what: [
        "Most modern presets are 80% synth and 20% effects. Strip the effects off and you'll be shocked how thin the raw synth sounds. The effect chain is part of the patch.",
        "Four workhorses cover almost everything: chorus (wide / thick), delay (rhythm and space), reverb (room and depth), distortion / saturation (glue and grit).",
        "Order matters. Typical chain: synth → distortion → EQ → chorus → delay → reverb → out.",
      ],
      why: [
        "It's the difference between a dry, mono, lifeless synth and a finished-sounding instrument.",
        "Tempo-synced effects (delay, gated reverb, sidechained compression) lock everything to the groove.",
        "Even great oscillator design can't replace good FX — they're not optional.",
      ],
      analogy: "The synth is the food. Effects are the seasoning. Both matter.",
    },
    advanced: {
      what: [
        "Chorus = short delay (10-40 ms) with LFO-modulated delay time. Multiple LFOs at different phases = ensemble / wider effect.",
        "Delay subdivides into musical values (1/4, 1/8, 1/16, dotted, triplet). Ping-pong alternates L/R. Filtered feedback shapes the tail's tone.",
        "Reverb has many algorithms: room, hall, plate, spring, convolution. Pre-delay, decay time, damping (high-freq absorption) and stereo width all shape character.",
        "Saturation adds harmonics. Tape, tube, transformer and digital wave-shaping each add a different spectrum.",
      ],
      edgeCases: [
        "Stacking chorus + reverb + wide stereo can collapse to mush in mono. Always mono-check.",
        "Long reverb tails on a busy mix create a wash — use shorter tails on percussive parts, longer on pads/leads.",
        "Distortion before vs after filter has very different sonic results — driven filter pre-distortion = aggressive; distortion post-filter = top-end fizz.",
      ],
      engineerNotes: [
        "Sidechain reverb send to the kick for groove-pumping spaciousness.",
        "EQ between distortion and chorus: cut harsh upper-mid resonances added by saturation before they hit modulation FX.",
      ],
    },
    flow: "Synth → Distortion/EQ → Chorus → Delay → Reverb → Master",
    walkthrough: [
      { do: "Play the dry synth.", listen: "Honest, often thin." },
      { do: "Add chorus (rate 0.6 Hz, depth 30%, wet 30%).", listen: "Widens, thickens." },
      { do: "Add tempo-synced ping-pong delay (1/8, feedback 40%, wet 25%).", listen: "Rhythmic echoes bounce L↔R." },
      { do: "Add hall reverb (decay 2 s, wet 20%).", listen: "Lifts the patch into a space." },
    ],
    listenFor: [
      "Chorus widening without changing pitch.",
      "Delay echoes locking to the grid.",
      "Reverb pushing the sound 'back' in the mix.",
      "Saturation adding upper-mid bite without raising peak level.",
    ],
    mistakes: [
      "Drowning the mix in reverb — kills clarity fast.",
      "Forgetting to high-pass the reverb send so low frequencies don't muddy the tail.",
    ],
    proMoves: [
      "Sidechain duck the delay return from the dry source so repeats only bloom in gaps.",
      "Use a short room (0.3-0.5 s) on percussive synths and a long hall (3-6 s) on pads.",
    ],
    quizHard: [
      { q: "Chorus is technically", options: ["A long reverb tail", "A short delay modulated by an LFO", "A pitch shifter"], answer: 1, explain: "Chorus is short delay + LFO-modulated delay time → moving pitch offsets → wide swirl." },
      { q: "Pre-delay on a reverb does what?", options: ["Cuts the dry signal", "Inserts silence before the reverb tail starts, preserving attack", "Mutes the reverb until release"], answer: 1, explain: "Pre-delay separates the dry transient from the reverb wash so attacks stay punchy." },
    ],
    sources: [{ label: "learningsynths.ableton.com — Effects", section: "Chapter 7" }],
  },

  "synth-preset-anatomy": {
    hook: "Every preset family is a recipe. Learn four recipes and you can build almost any sound.",
    beginner: {
      what: [
        "The synth patches you've heard a thousand times — bass, lead, pad, pluck — each follow a predictable pattern. Once you see the patterns, you can build any of them from scratch.",
        "Bass: 1-2 oscillators (saw + sine sub), low cutoff, short snappy amp envelope, no reverb, mono.",
        "Lead: 2-3 detuned saws + unison, mid cutoff with mod-wheel control, slight delay + reverb, mono or duophonic.",
        "Pad: multiple detuned saws + sub, long attack and release, slow filter LFO, big reverb, polyphonic.",
        "Pluck: saw (or triangle), aggressive filter envelope (high amount, short decay), tight amp envelope, tempo-synced ping-pong delay.",
      ],
      why: [
        "Designing 'in the family' is much faster than designing 'from a blank slate'. Recipe first, customise later.",
        "It demystifies preset names — once you know the recipe, the preset author's choices are transparent.",
        "When a track needs 'a bass like that', you have a starting template instead of scrolling presets for hours.",
      ],
      analogy: "Preset families are cocktail families. Once you know a daiquiri is rum + lime + sugar, every variation makes sense. Same for bass = saw + sub + filter + short envelope.",
    },
    advanced: {
      what: [
        "Bass focuses energy 40-200 Hz with a fundamental + a few harmonics. Sub layer below the filter; lead saw above through it. Almost always mono (legato or retrigger) to lock to the bass-line.",
        "Lead lives 200 Hz-3 kHz. Unison detune at 7-25 ¢ + 1-2 octave stack + ping-pong delay + plate reverb. Velocity → cutoff for expression.",
        "Pad sits 80 Hz-12 kHz with slow modulation (multiple LFOs at incommensurate rates) so it never quite repeats. Long release for legato chord blending. Big sidechained reverb.",
        "Pluck = transient-led patch. Filter envelope dominates (high amount, fast decay), amp envelope short. Often paired with rhythmic delay so the pluck creates the rhythm.",
      ],
      edgeCases: [
        "Bass with too much reverb loses focus in the mix — keep wet very low (5-10%) or only on a copy layer.",
        "Pad too bright competes with vocals — set HP at 250 Hz on pad bus when vocals enter.",
        "Pluck with long release acts as pad — choose intentionally.",
      ],
      engineerNotes: [
        "EQ contour: bass = LP at 4 kHz; lead = HP at 200 Hz; pad = HP at 100 Hz, gentle LP at 12 kHz; pluck = HP at 300 Hz to keep low-end clean.",
        "Compression: glue the bass with a slow 2:1 ratio; pump the pad sidechained to the kick; use parallel compression on the lead for impact.",
      ],
    },
    flow: "Pick family → Build recipe → Customise → Mix into context",
    walkthrough: [
      { do: "Build a bass patch: saw + sine sub (octave below), LP filter at 600 Hz, amp A=0, D=200, S=0.4, R=200, monophonic. Play a bass line.", listen: "Focused, present low end." },
      { do: "Build a pluck patch: saw, LP filter base 400 Hz, filter env A=0, D=200, amount=4000. Amp A=0, D=400, S=0, R=200. Add 1/8 ping-pong delay.", listen: "Snappy bright attack, rhythmic tail." },
      { do: "Build a pad: 3 saws (0/+7¢/-7¢), sub sine, LP filter at 4 kHz, amp A=1 s, R=2 s, polyphonic. Add big reverb (4 s decay).", listen: "Lush, slow-breathing pad." },
      { do: "Build a lead: 2 saws (+7¢/-7¢) + saw +12, LP filter at 1.5 kHz with mod-wheel control, amp A=10 ms, R=400 ms. Slap delay + plate reverb.", listen: "Big, expressive lead." },
    ],
    listenFor: [
      "Bass: tight low end, snappy attack, no high-frequency mush.",
      "Pluck: a clear 'tick' on attack followed by the rhythmic delay tail.",
      "Pad: a slow swell that never sits perfectly still.",
      "Lead: presence that cuts through without sounding harsh.",
    ],
    mistakes: [
      "Trying to make one patch do all four jobs — it never sounds right.",
      "Using a 'pluck preset' as a pad just because the chord is held longer — the architecture is wrong.",
    ],
    proMoves: [
      "Save your four recipe patches as starting templates labelled INIT_BASS, INIT_LEAD, INIT_PAD, INIT_PLUCK.",
      "When you love a preset, REVERSE-ENGINEER it: open the patch, INIT it, then rebuild from scratch to identify which features create the magic.",
    ],
    quizHard: [
      { q: "A pad needs", options: ["Short attack and release", "Long attack, long release, modulation", "No filter movement"], answer: 1, explain: "Pads breathe slowly. Long A + long R + slow modulation = breath." },
      { q: "Why is bass usually mono (one voice at a time)?", options: ["CPU", "To avoid bass note collisions phase-cancelling each other", "Stereo bass is illegal"], answer: 1, explain: "Two bass notes ringing simultaneously can cancel low frequencies; mono enforces sequential bass-line motion." },
    ],
    sources: [{ label: "learningsynths.ableton.com — Patches", section: "Chapter 8" }],
  },

  "synth-build-your-own": {
    hook: "If you can build the four basic patches from scratch, you understand synthesis.",
    beginner: {
      what: [
        "Take everything you've learned and design a sound from a blank INIT. Pick a family — bass, lead, pad, or pluck — and follow the recipe. No presets.",
        "Step 1: pick the oscillator(s). Step 2: set the filter. Step 3: shape the amp and filter envelopes. Step 4: add modulation (LFO + velocity). Step 5: add the right effects (chorus, delay, reverb).",
        "If you get stuck, A/B against a preset you like — find the one difference and copy that single setting.",
      ],
      why: [
        "Building from scratch makes every preset readable forever.",
        "It's the difference between a producer who scrolls presets for an hour and one who designs the right sound in five minutes.",
        "It's also the thing that turns 'I'm learning synthesis' into 'I am a sound designer'.",
      ],
      analogy: "If presets are recipes from a cookbook, building from scratch is improvising in your own kitchen. The first time is slow. By the tenth time, it's faster than reading.",
    },
    advanced: {
      what: [
        "A 5-step framework for any patch: 1) Pick voicing (osc shapes/levels). 2) Set tone (filter type/cutoff/Q). 3) Shape time (amp + filter envelopes). 4) Add motion (LFOs, modulation routings). 5) Place in space (FX: chorus/delay/reverb/EQ).",
        "Self-test: can you reproduce a target preset without looking at its panel by ear alone? If yes, you've internalised the synth.",
        "Document patches you love with a one-line recipe in your project notes. Over time you'll build your own personal preset library that thinks like you do.",
      ],
      edgeCases: [
        "Don't tweak everything at once. Change one parameter, listen, decide. The cardinal rule of sound design.",
        "If a patch sounds 'almost there but off', it's almost always envelope or filter — not oscillator choice.",
        "Big effects can fix a thin synth temporarily but never permanently. Fix the source first.",
      ],
      engineerNotes: [
        "Reference your patch against a commercial track in the same genre — A/B at matched loudness with a meter.",
        "Save your best INIT templates per family. Six personal starting points are worth a thousand presets.",
      ],
    },
    flow: "Voicing → Tone → Time → Motion → Space",
    walkthrough: [
      { do: "Set yourself a brief: 'Pluck for a melodic house lead, in F minor'. INIT the synth.", listen: "Silence — blank canvas." },
      { do: "Step 1: pick a saw. Step 2: LP filter base 500 Hz, Q=4.", listen: "Dull saw." },
      { do: "Step 3: amp envelope A=5 ms, D=300, S=0, R=200. Filter envelope A=0, D=250, S=0, amount=3500.", listen: "Plucky character emerges." },
      { do: "Step 4: velocity → cutoff (+20%), random → pitch (tiny). Step 5: 1/8 ping-pong delay, plate reverb 1.5 s decay.", listen: "Finished pluck — polished, expressive." },
    ],
    listenFor: [
      "Each step adding a distinct character that wasn't there before.",
      "Modulation making notes feel different to each other.",
      "Effects placing the sound in a space without burying it.",
    ],
    mistakes: [
      "Reaching for presets when you get stuck — the stuck moment IS the learning.",
      "Treating effects as 'fix-it' tools instead of part of the design.",
    ],
    proMoves: [
      "Set a 5-minute timer per patch. Forces decisive sound design rather than endless tweaking.",
      "Build the same patch on three different synths to learn which features each one uniquely brings.",
    ],
    quizHard: [
      { q: "The 5-step patch framework is", options: ["Mix → master → release", "Voicing → Tone → Time → Motion → Space", "Buy → install → preset → done"], answer: 1, explain: "Voicing (oscillators) → Tone (filter) → Time (envelopes) → Motion (modulation) → Space (FX)." },
      { q: "When a patch is 'almost there but off', the fix is usually in the", options: ["Oscillator shape", "Envelope or filter", "Master EQ"], answer: 1, explain: "Oscillator choice is rarely the problem once you've gotten the family right. Envelopes and filter shape the character." },
    ],
    sources: [{ label: "learningsynths.ableton.com — Sound design", section: "Chapter 8" }],
  },
};
