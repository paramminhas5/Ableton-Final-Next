// Deep lessons for the Foundations world (52 missions).
// Two-track: beginner (plain English, analogies) + advanced (engineer-grade).
// Original pedagogical writing — structure modelled on learningmusic.ableton.com
// chapter flow, but every paragraph here is our own.
import type { LessonDeep } from "./types";

export const FOUNDATIONS_LESSONS: Record<string, LessonDeep> = {
  // ============================================================
  // PATH 1 — SOUND (what sound actually is)
  // ============================================================
  "what-is-sound": {
    hook: "Every kick, vocal, and synth is just air molecules being shoved back and forth.",
    beginner: {
      what: [
        "Sound is movement. When something vibrates — a speaker cone, a guitar string, your vocal cords — it pushes the air next to it. That push travels outward as a wave of pressure, exactly like a ripple in water after you drop a stone.",
        "Those pressure waves hit your eardrum and shake it at the same rate the original thing was vibrating. Tiny hairs inside your inner ear turn that shaking into electrical pulses your brain reads as 'sound'.",
        "Every musical idea — kick, snare, bass, vocal, reverb tail — is a different pattern of those pressure waves. Production is the craft of shaping that pattern on purpose.",
      ],
      why: [
        "If you know sound is just pressure over time, the waveform view in your DAW stops being a mystery.",
        "Bass you can 'feel' is literally bigger pressure swings shaking your chest.",
        "Cancellations, phase issues and room nulls all make sense once you picture two waves adding or subtracting.",
        "Every effect — EQ, compression, reverb — is a way to reshape that pressure curve.",
      ],
      analogy:
        "Drop a stone in a pond. The ripples spreading out are exactly how sound moves through air — just faster, smaller, and invisible.",
    },
    advanced: {
      what: [
        "Sound is a longitudinal mechanical wave: regions of compression (higher pressure) and rarefaction (lower pressure) propagating through an elastic medium. In air at room temperature it travels ~343 m/s.",
        "A microphone is a transducer that converts pressure variation into voltage. Your DAW samples that voltage thousands of times per second to build the waveform you see on screen.",
        "Every parameter we care about in production — pitch, loudness, timbre, stereo image, room sense — maps directly to a property of that pressure wave (frequency, amplitude, spectrum, phase, decay).",
      ],
      edgeCases: [
        "In a true vacuum (space, evacuated chambers) there is no medium, so no sound — only electromagnetic radiation propagates.",
        "Temperature and humidity change the speed of sound, which subtly shifts the tuning of acoustic instruments outdoors.",
        "Very low frequencies (<20 Hz) are felt as vibration more than heard, but still affect mix translation on big systems.",
        "Pressure waves can superimpose constructively or destructively — the basis of every phase and comb-filter problem.",
      ],
      engineerNotes: [
        "A microphone diaphragm responds to instantaneous pressure, not frequency directly — frequency emerges from how often the diaphragm reverses direction.",
        "Speakers do the inverse transduction: voltage → cone motion → pressure wave.",
        "Sound intensity falls off ~6 dB per doubling of distance in free field (inverse-square law).",
      ],
    },
    mechanism:
      "Vibrating source → air molecules compress and rarefy → wave travels at ~343 m/s → eardrum vibrates → cochlea encodes as nerve signals → brain perceives 'sound'.",
    flow: "Source → Air → Eardrum → Cochlea → Brain",
    walkthrough: [
      { do: "Put your hand on a speaker playing a kick drum.", listen: "You feel pulses — that is literally the air being shoved." },
      { do: "Cup your hands and clap once in a small room.", listen: "The 'tail' is the same pressure wave bouncing off walls." },
      { do: "Open the waveform of any sample in your DAW.", listen: "The height is pressure; the horizontal axis is time. That's the wave itself." },
      { do: "Solo a sub-bass and stand near the speaker.", listen: "Your chest moves before your ears do — low frequencies are pressure you feel." },
      { do: "Play two sine waves close in pitch.", listen: "You hear a slow pulse — that's two pressure waves adding and cancelling." },
    ],
    listenFor: [
      "The 'body' of a kick is low-frequency pressure energy.",
      "Reverb tails are reflected pressure waves arriving slightly later.",
      "Phase cancellation sounds like the bass disappearing when you sum two mics.",
      "Distance attenuation: a far sound is quieter AND duller because air absorbs highs first.",
      "Outdoors sound feels 'dry' because there are no reflective surfaces to send waves back.",
    ],
    mistakes: [
      "Thinking sound is a continuous tone instead of a stream of pressure changes per second.",
      "Believing louder always means 'more frequencies' — louder means bigger pressure swings of the SAME frequencies.",
      "Confusing the waveform's visual shape with what it 'sounds like' (timbre is hidden in the spectrum, not the silhouette).",
      "Assuming bass is 'in the speaker' rather than 'in the room' — low frequencies depend heavily on the space.",
    ],
    proMoves: [
      "Always check mixes at low volume — your ears compress less and you hear the true balance.",
      "Use a spectrum analyser early in your career to connect what you HEAR to what the wave actually is.",
      "Mono-check everything: collapsing left+right exposes phase cancellation immediately.",
      "Walk around the room while a mix plays — every position is a different pressure sum.",
    ],
    quizHard: [
      { q: "What kind of wave is sound, physically?", options: ["Transverse electromagnetic", "Longitudinal pressure", "Standing only", "Quantum"], answer: 1, explain: "Sound is a longitudinal mechanical wave — compressions and rarefactions along the direction of travel.", hint: "Think push/pull along the direction of travel." },
      { q: "Roughly how fast does sound travel in air?", options: ["3 m/s", "34 m/s", "343 m/s", "3,430 m/s"], answer: 2, explain: "About 343 m/s at room temperature — slow enough that you notice delay over ~10 m.", hint: "Slower than light by a factor of about a million." },
      { q: "Inverse-square law: doubling distance from a point source drops SPL by about…", options: ["1 dB", "3 dB", "6 dB", "12 dB"], answer: 2, explain: "~6 dB per doubling of distance in a free field.", hint: "Half the level in dB-power terms." },
      { q: "A bar in 4/4 contains how many quarter-note beats?", options: ["2", "3", "4", "8"], answer: 2 },
    ],
  },

  "first-wave": {
    hook: "A single push of air, drawn as a curve — that's a wave.",
    beginner: {
      what: [
        "A 'wave' in audio is just a picture of pressure over time. The horizontal axis is time moving forward. The vertical axis is how hard the air is being pushed at that instant.",
        "A high peak = a big push. A low trough = a big pull (suction). Zero in the middle = silence at that exact moment.",
        "Every sound you've ever heard could in principle be drawn as one of these wiggly lines. Production is mostly the art of changing the shape of that line.",
      ],
      why: [
        "Once you can read a waveform you can spot clipping, silence, and transients without playing the file.",
        "Editing — trimming, fading, slicing — becomes precise instead of guessy.",
        "It demystifies plugins: every effect simply reshapes this curve.",
      ],
      analogy: "A waveform is a heart-rate monitor for air. The shape tells you what the air was doing every microsecond.",
    },
    advanced: {
      what: [
        "A waveform is a plot of instantaneous amplitude vs time. In a 44.1 kHz/24-bit file, each sample is a 24-bit integer captured 44,100 times per second.",
        "The shape encodes both pitch (cycle rate) and timbre (cycle shape). A pure sine has one frequency; complex waves contain many harmonics summed.",
        "DAWs display the peak envelope, not every sample — zoom in far enough and you see the individual samples and (depending on view) the reconstructed analogue curve between them.",
      ],
      edgeCases: [
        "Clipped peaks are flat lines at the top/bottom — visual confirmation of digital overs.",
        "DC offset shows as a waveform centred above or below the zero line; high-pass at 20 Hz to remove.",
        "Lossy formats (mp3) reconstruct slightly different waveforms each play — never master from mp3 sources.",
      ],
      engineerNotes: [
        "Peak meters react to instantaneous amplitude; loudness meters integrate over time.",
        "True-peak meters interpolate between samples to catch inter-sample peaks invisible in the waveform display.",
      ],
    },
    flow: "Sample → Waveform display → Edit → Render",
    walkthrough: [
      { do: "Drop a vocal and a kick on adjacent tracks.", listen: "Vocal looks dense and continuous; kick looks like a spike with a tail." },
      { do: "Zoom in until you see individual cycles.", listen: "You can literally count the wave repeats per beat." },
      { do: "Cut a clip mid-cycle and play it.", listen: "Clicks at the edges — because the wave doesn't return to zero cleanly." },
    ],
    listenFor: ["Spiky transients = percussion.", "Smooth fat shapes = bass and pads.", "Dense filled rectangles = limited / loud masters."],
    mistakes: ["Cutting clips at non-zero crossings — causes clicks.", "Judging loudness purely by waveform fatness (loudness wars optics).", "Ignoring tiny pre-peaks in compressed material."],
    proMoves: ["Snap edits to zero crossings (Live: Shift while dragging the cut).", "Use waveform colour coding per track type for fast scanning.", "Visually QC every bounce — flat tops mean you clipped."],
    quizHard: [
      { q: "What does a flat-topped waveform indicate?", options: ["Healthy headroom", "Clipping", "Phase issue", "DC offset"], answer: 1, explain: "Flat tops are samples pinned at full scale — classic visual signature of clipping." },
      { q: "Why edit at zero crossings?", options: ["Faster CPU", "Avoids clicks at edit points", "Better compression", "Louder result"], answer: 1, explain: "If the wave is at zero amplitude on both sides of a cut, there is no instantaneous jump to create a click." },
      { q: "Swing of 50% means…", options: ["Maximum shuffle", "Perfectly straight timing", "Triplet feel", "Half-time"], answer: 1 },
    ],
  },

  "frequency-pitch": {
    hook: "Pitch is just how fast a wave wiggles per second.",
    beginner: {
      what: [
        "Frequency is the number of complete wave cycles that happen in one second. We measure it in Hertz (Hz). 100 Hz means 100 full wiggles per second.",
        "Your ear maps frequency onto pitch. Fast wiggles sound high (a flute). Slow wiggles sound low (a sub-bass). The relationship is fixed by biology.",
        "Doubling the frequency = up one octave. Halving = down one octave. Every other interval in music sits between those octave boundaries.",
      ],
      why: [
        "EQ is just turning specific frequency ranges up or down — you can't use it without knowing where things live.",
        "Knowing 'kick at 60 Hz, snare crack at 5 kHz, vocal air at 12 kHz' lets you carve space instead of guessing.",
        "Tuning instruments is literally matching their frequency to a reference (A4 = 440 Hz).",
      ],
      analogy: "Slow flapping = low. Fast flapping = high. Frequency is just the wing-beat rate of the air.",
    },
    advanced: {
      what: [
        "Frequency f (Hz) relates to wavelength λ in air by λ = c/f where c ≈ 343 m/s. So 100 Hz has a 3.43 m wavelength — bigger than most rooms, which is why low end is room-dependent.",
        "Human hearing spans roughly 20 Hz – 20 kHz, with sensitivity peaking around 2–5 kHz (Fletcher-Munson). High-frequency sensitivity declines with age and exposure.",
        "Octave = 2:1 frequency ratio. The 12-tone equal temperament divides that ratio into 12 equal multiplicative steps of 2^(1/12) ≈ 1.0595.",
      ],
      edgeCases: [
        "Below ~30 Hz most speakers and headphones roll off — you may be mixing energy you can't hear.",
        "Inter-sample peaks at high frequencies cause true-peak overs even when sample peaks are clean.",
        "Tuning standards vary: A=440 is modern default, A=432 and A=442 exist in classical contexts.",
      ],
      engineerNotes: [
        "Frequency ranges to memorise: sub 20–60, bass 60–250, low-mid 250–500, mid 500–2k, presence 2k–5k, brilliance 5k–10k, air 10k–20k.",
        "A spectrum analyser uses an FFT to decompose any signal into its component frequencies in real time.",
      ],
    },
    flow: "Vibration rate (Hz) → Perceived pitch → Notation",
    walkthrough: [
      { do: "Load a sine generator and sweep from 20 Hz to 20 kHz.", listen: "Note where it disappears at both ends — that's your monitoring range." },
      { do: "Play A4 = 440 Hz then A5 = 880 Hz.", listen: "Same letter name, doubled frequency, one octave up." },
      { do: "EQ-boost 4 kHz on a vocal.", listen: "Consonants and 'presence' jump forward." },
      { do: "Lower a male vocal one octave with pitch shift.", listen: "Same identity, halved frequency — proves the 2:1 ratio." },
      { do: "Sweep a high-Q EQ bell from 200 Hz to 4 kHz on a snare.", listen: "Body lives ~200 Hz; crack lives ~3–5 kHz." },
    ],
    listenFor: ["Sub energy as feeling, not pitch.", "Mud around 200–400 Hz.", "Harshness 2–5 kHz when boosted too much.", "Air shimmer above 10 kHz.",
      "Beating between two notes a few Hz apart — that's frequency difference made audible.",],
    mistakes: ["Boosting bass to fix a thin mix instead of cutting mud.", "Believing more highs = more clarity (it's often less mud).", "Mixing at one volume only — Fletcher-Munson tricks you."],
    proMoves: ["Sweep an EQ band with high Q to find resonances by ear.", "Learn to identify ~7 anchor frequencies (60, 120, 250, 500, 1k, 4k, 10k Hz).", "A-B at different volumes to catch loudness-curve illusions."],
    quizHard: [
      { q: "Frequency ratio of one octave?", options: ["3:2", "2:1", "5:4", "9:8"], answer: 1 },
      { q: "Approximate wavelength of 100 Hz in air?", options: ["3.4 cm", "34 cm", "3.4 m", "34 m"], answer: 2, explain: "λ = 343/100 ≈ 3.43 m." },
      { q: "Where does human hearing typically peak in sensitivity?", options: ["100 Hz", "500 Hz", "2–5 kHz", "15 kHz"], answer: 2 },
      { q: "Syncopation primarily accents…", options: ["On-beats", "Off-beats / weak positions", "The downbeat", "Bar one"], answer: 1 },
    ],
  },

  "amplitude-volume": {
    hook: "Bigger wave = louder sound. But your ears measure it weirdly.",
    beginner: {
      what: [
        "Amplitude is how big a wave is — how hard the air is being pushed. Bigger pushes = more energy reaching your ear = louder.",
        "We measure loudness in decibels (dB). The scale is logarithmic, which means it bunches up huge real-world differences into small numbers. 60 dB is 1,000× the energy of 30 dB.",
        "In your DAW, 0 dBFS is the absolute ceiling. Going above it doesn't get louder — it clips and distorts.",
      ],
      why: [
        "Fader moves of 1–3 dB make audible mix differences. You don't need huge changes.",
        "Headroom prevents clipping when you stack tracks and add effects.",
        "Perceived loudness depends on duration and frequency, not just peak — which is why LUFS exists.",
      ],
      analogy: "Amplitude is how hard you slap the table. dB is a logarithmic ruler that lets you measure both a tap and a punch on the same scale.",
    },
    advanced: {
      what: [
        "Peak amplitude is the maximum instantaneous excursion. RMS is the average energy over a window. LUFS is loudness perceived by humans, weighted by frequency sensitivity (K-weighting).",
        "dBFS (Full Scale) is digital; 0 dBFS = the largest representable sample value. dB SPL is acoustic; 0 dB SPL = threshold of human hearing.",
        "A 6 dB change = doubling/halving of voltage amplitude. ~10 dB ≈ perceived doubling/halving of loudness.",
      ],
      edgeCases: [
        "True-peak meters catch inter-sample peaks that sample-peak meters miss — important for lossy codecs.",
        "Loudness wars: maximising RMS at the cost of dynamics flattens emotional impact.",
        "Streaming services normalise to LUFS targets (Spotify ~-14, Apple ~-16, YouTube ~-14) — louder masters get turned down.",
      ],
      engineerNotes: [
        "Mix with peaks around -6 dBFS and average ~-18 dBFS RMS to leave room for mastering.",
        "Use VU + LUFS together: VU for vibe, LUFS for compliance.",
        "Gain staging matters per stage — a clean signal hitting a plugin sweet spot sounds better than a hot one fighting it.",
      ],
    },
    flow: "Source level → Track fader → Bus → Master → Limiter → Output",
    walkthrough: [
      { do: "Set a kick at -6 dBFS peak.", listen: "Clean transient, headroom for the rest of the mix." },
      { do: "Push it to +3 dBFS into the master.", listen: "Harsh, crunchy — that's clipping." },
      { do: "Pull master fader -10 dB and re-listen.", listen: "Quieter but cleaner — your ear may even prefer it." },
      { do: "Insert a Utility, drop -6 dB on a loud track.", listen: "Mix breathes; nothing else changed." },
      { do: "Bounce at -1 dBTP and check on a true-peak meter.", listen: "Inter-sample peaks revealed even when sample peaks pass." },
    ],
    listenFor: ["The 'pump' of a limiter doing too much work.", "Subtle distortion on transients = clipping.", "Mix translating quietly = good dynamics.",
      "Loudness perception shifting when volume changes (Fletcher–Munson at work).",],
    mistakes: ["Mixing only at high volume.", "Pushing every track up instead of pulling problem tracks down.", "Trusting peak meters alone — track LUFS too."],
    proMoves: ["Pink-noise reference at -18 dBFS RMS to calibrate monitors.", "Reference commercial masters at matched LUFS.", "Leave at least 6 dB of master headroom before mastering."],
    quizHard: [
      { q: "Doubling voltage amplitude corresponds to…", options: ["+3 dB", "+6 dB", "+10 dB", "+20 dB"], answer: 1 },
      { q: "Typical streaming loudness target?", options: ["-6 LUFS", "-14 LUFS", "-23 LUFS", "-40 LUFS"], answer: 1 },
      { q: "0 dBFS represents…", options: ["Threshold of hearing", "Digital maximum", "Reference level", "Noise floor"], answer: 1 },
      { q: "Sidechain compression on a pad creates…", options: ["Constant volume", "Rhythmic ducking", "Pitch shift", "Stereo width"], answer: 1 },
    ],
  },

  "timbre-tone": {
    hook: "Same note, different instrument — that's timbre, and it lives in the harmonics.",
    beginner: {
      what: [
        "Play middle C on a piano and the same C on a guitar. Same pitch, totally different sound. That difference is called timbre (pronounced 'TAM-ber').",
        "Every musical note isn't one frequency — it's a stack: a fundamental (the note you hear) plus quieter 'harmonics' above it. The mix of how loud each harmonic is gives the instrument its character.",
        "A flute has weak harmonics — sounds pure. A distorted guitar is packed with harmonics — sounds aggressive. Synthesis is the art of deciding which harmonics to include.",
      ],
      why: [
        "EQ-ing for timbre means shaping harmonics, not just 'making it brighter'.",
        "Sound design starts with picking a basic waveform whose harmonic content matches the mood you want.",
        "Mixing problems are often timbral clashes — two instruments fighting in the same harmonic region.",
      ],
      analogy: "Timbre is like the recipe of a sound. Same main ingredient (the fundamental), but different spices (harmonics).",
    },
    advanced: {
      what: [
        "Timbre is determined by the frequency-domain spectrum and its time evolution (ADSR envelope, formants, noise content).",
        "Periodic tones decompose via Fourier into a fundamental + integer harmonic series. Inharmonic sources (bells, cymbals) have non-integer partials.",
        "Perceptual timbre also depends on attack transients and spectral centroid — instruments are partly identified by their first 50 ms.",
      ],
      edgeCases: [
        "Strip the attack from a piano and it sounds like an organ — proving attack carries identity.",
        "Time-stretching too aggressively smears formants and changes perceived timbre even when pitch is preserved.",
        "Two pitched notes can mask each other when their harmonic series overlap densely.",
      ],
      engineerNotes: [
        "Spectral centroid roughly correlates with 'brightness'.",
        "Even harmonics (octave, fifth) sound warm; odd harmonics (third, fifth) sound hollow/aggressive — basis of tape vs transistor distortion character.",
      ],
    },
    flow: "Fundamental + harmonic mix + envelope + noise → perceived timbre",
    walkthrough: [
      { do: "Solo a saw wave and a sine at the same pitch.", listen: "Saw is bright/buzzy; sine is pure — same note, different timbre." },
      { do: "Cut the first 30 ms off a piano sample.", listen: "Sounds organ-like — attack defines instrument identity." },
      { do: "Stack flute + clarinet + sine at the same note.", listen: "A new, blended timbre emerges (the basis of additive synthesis)." },
      { do: "Add 2nd-harmonic saturation to a sub bass.", listen: "Bass becomes audible on tiny speakers without more low end." },
      { do: "Notch an EQ around 3 kHz on a harsh synth.", listen: "Aggressive bite tamed without losing presence." },
    ],
    listenFor: ["Harmonic 'colour' as bright/warm/hollow.", "Attack transients identifying instruments instantly.", "Noise content (breath, bow scrape) carrying realism.",
      "Spectral brightness changing across the same note as a filter sweeps.",],
    mistakes: ["EQ-ing the fundamental only — most timbral character is in harmonics 2–10.", "Killing all transients with a compressor — destroys timbre cues.", "Layering instruments with identical harmonic profiles — they pile up instead of complementing."],
    proMoves: ["Use a spectrum analyser to see why two sounds clash.", "Saturation adds harmonics — use it to thicken thin sources.", "Match attack times across a layered patch for cohesive timbre."],
    quizHard: [
      { q: "Timbre is primarily encoded in…", options: ["Pitch", "Amplitude", "Harmonic spectrum + envelope", "Phase only"], answer: 2 },
      { q: "Even-order harmonics tend to sound…", options: ["Warm/musical", "Harsh/aggressive", "Inaudible", "Random"], answer: 0 },
      { q: "Attack transient duration on most instruments is roughly…", options: ["1 ms", "20–80 ms", "500 ms", "2 s"], answer: 1 },
      { q: "A melody resolving onto scale degree 1 creates…", options: ["Tension", "Resolution / arrival", "Modulation", "Syncopation"], answer: 1 },
    ],
  },

  "waveforms": {
    hook: "Four wave shapes. Four totally different vibes. That's classic synthesis 101.",
    beginner: {
      what: [
        "Synths are built on a few basic waveform shapes: sine, triangle, square, and sawtooth. Each shape contains a different mix of harmonics, so each has its own character.",
        "Sine = pure and round (sub bass, soft leads). Triangle = soft and hollow (flutey leads). Square = buzzy and woody (chiptune, clarinets). Saw = bright and aggressive (most analog leads and brassy sounds).",
        "Most synth presets you've loved are these shapes filtered, layered, modulated and effected. Once you know the raw shapes, you can hear which is hiding under the patch.",
      ],
      why: [
        "Choosing the right starting waveform saves a lot of EQ later.",
        "Sub-bass = sine 99% of the time. Big leads = saw or square. Soft pads = triangle or filtered saw.",
        "Recognising waveforms by ear speeds up sound design hugely.",
      ],
      analogy: "Waveforms are like raw cuts of meat. The recipe (filter, envelope, effects) decides the meal — but you start from the cut.",
    },
    advanced: {
      what: [
        "Sine: only the fundamental, no harmonics. Sawtooth: all integer harmonics, amplitudes 1/n — brightest classic shape. Square: only odd harmonics at 1/n — hollow. Triangle: only odd harmonics at 1/n² — soft and quickly darkening.",
        "Pulse width modulation (PWM) on a square shifts the duty cycle and removes/adds harmonics dynamically — classic 'fattening' move.",
        "Analog oscillators have subtle drift, non-linearities, and slight harmonic imperfections; digital oscillators must alias-protect (band-limited oscillators) to avoid foldover noise.",
      ],
      edgeCases: [
        "Pure digital saws above ~5 kHz fundamental alias badly without band-limiting.",
        "Stacked detuned saws (supersaws) become a single thick waveform via constructive interference.",
        "Sub-bass sines below ~40 Hz often need a tiny click/transient added so they're audible on small speakers.",
      ],
      engineerNotes: [
        "Choose oscillator by harmonic density: sparse (sine/triangle) for clean leads, dense (saw/square) for filter sweeps.",
        "Hard-sync, FM, and ring mod create rich non-harmonic spectra beyond the basic four shapes.",
      ],
    },
    flow: "Oscillator shape → Filter → Amp envelope → FX",
    walkthrough: [
      { do: "Load a synth, pick sine, play C2.", listen: "Pure, round, almost felt." },
      { do: "Switch to saw at same pitch.", listen: "Buzzy, bright, classic synth lead." },
      { do: "Modulate PWM on a square.", listen: "Sound thickens and animates without any other movement." },
      { do: "Stack a sine + saw at the same pitch and balance them.", listen: "Sub weight from sine, presence from saw — classic bass layering." },
      { do: "Slowly modulate PWM with an LFO at 0.3 Hz.", listen: "Static patch becomes living, breathing pad." },
    ],
    listenFor: ["Sine = no buzz.", "Saw = buzzy and bright.", "Square = woody/hollow.", "Triangle = soft, slightly hollow.",
      "Aliasing as metallic ringing when a digital saw plays very high notes.",],
    mistakes: ["Using a saw for sub bass — too many harmonics fight the kick.", "Picking sine for a 'big' lead — too thin without harmonics.", "Forgetting to enable anti-aliasing on digital synths."],
    proMoves: ["Detune three saws by ±5–15 cents for instant width.", "Mix sine sub under a saw bass for both weight and presence.", "Use noise as a fifth 'waveform' for breath and air."],
    quizHard: [
      { q: "Which waveform contains only odd harmonics with 1/n falloff?", options: ["Sine", "Square", "Triangle", "Saw"], answer: 1 },
      { q: "PWM stands for…", options: ["Pulse Wave Mixer", "Pulse Width Modulation", "Peak Wave Modifier", "Phase Width Master"], answer: 1 },
      { q: "Aliasing in digital oscillators is caused by…", options: ["Too low sample rate for the harmonic content", "Too much filtering", "Stereo imaging", "Phase cancellation"], answer: 0 },
      { q: "Relative pitch is…", options: ["Naming notes without a reference", "Hearing intervals from a known note", "Reading sheet music", "Tuning by ear"], answer: 1 },
    ],
  },

  "sound-in-space": {
    hook: "The room is part of the sound — for better and worse.",
    beginner: {
      what: [
        "When sound leaves a speaker, only some of it hits your ears directly. The rest bounces off walls, floor, ceiling and furniture, arriving milliseconds later. That bundle of reflections is what we call reverb.",
        "A small bathroom feels 'splashy' because reflections come back fast and close together. A cathedral feels 'huge' because reflections take seconds to die away.",
        "Your brain uses reflections to figure out room size and source location. That's why a dry mix can sound 'flat' — there are no spatial cues.",
      ],
      why: [
        "Reverb and delay in a mix are imitations of natural reflections.",
        "Treating a room (foam, bass traps) controls which reflections you hear while mixing.",
        "Reflections affect bass response — same speaker, two rooms, totally different low end.",
      ],
      analogy: "Throw a ball in a closet versus a gymnasium. Same ball, very different bounces. Sound does the same thing.",
    },
    advanced: {
      what: [
        "A room impulse response (IR) captures direct sound, early reflections (first ~80 ms), and late reverberation (diffuse tail). Convolution reverbs use IRs to simulate real spaces.",
        "RT60 is the time for reverb to decay 60 dB. Bedrooms ~0.3 s, concert halls 1.5–2.5 s, cathedrals 4+ s.",
        "Room modes (standing waves) create peaks and nulls at low frequencies determined by room dimensions — the dominant problem in untreated mixing rooms.",
      ],
      edgeCases: [
        "Headphone mixes lack room cues — always cross-check on speakers.",
        "Early reflections under 15 ms fuse with the direct sound (Haas / precedence effect) and affect tone, not perception of space.",
        "Bass build-up in corners — never place a sub or mix in a corner.",
      ],
      engineerNotes: [
        "Acoustic treatment goal: tame first reflections, control bass modes, preserve some liveness.",
        "Use a measurement mic + REW to identify your room's modes before buying foam.",
      ],
    },
    flow: "Source → Direct sound → Early reflections → Late reverb tail → Listener",
    walkthrough: [
      { do: "Clap in a small tiled room, then in a carpeted bedroom.", listen: "Tile = splashy short reverb; carpet = dry damped." },
      { do: "Play a mix on the same speakers in two rooms.", listen: "Bass response changes dramatically — that's the room, not the speakers." },
      { do: "Compare a dry vocal and the same vocal with a hall reverb.", listen: "Reverb makes it sit 'in a space' instead of in your head." },
      { do: "Add 30 ms pre-delay to a vocal reverb.", listen: "Vocal stays upfront; room sits behind it." },
      { do: "Walk around your room while a sine sweep plays.", listen: "Nulls and peaks expose room modes you can't EQ away." },
    ],
    listenFor: ["Reverb tail length giving a sense of room size.", "Early reflections colouring the tone.", "Bass nulls when you move 30 cm in your room.",
      "Pre-delay separating source from room without losing the sense of space.",],
    mistakes: ["Mixing in an untreated room and trusting the bass.", "Using too much reverb to hide a weak source.", "Ignoring headphone vs speaker discrepancies."],
    proMoves: ["Use a mono short reverb for 'glue', a long stereo reverb for 'space' — two different jobs.", "EQ reverb returns to cut mud and harshness.", "Pre-delay your reverb 20–40 ms to keep vocals upfront."],
    quizHard: [
      { q: "RT60 measures…", options: ["Reverb decay to -60 dB", "Room temperature", "Round-trip latency", "Reflection at 60°"], answer: 0 },
      { q: "Early reflections fuse with direct sound when they arrive within roughly…", options: ["1 ms", "15 ms", "150 ms", "1500 ms"], answer: 1, explain: "Haas / precedence effect: reflections under ~15 ms fuse with direct sound." },
      { q: "Room modes most affect…", options: ["High frequencies", "Midrange clarity", "Low-frequency response", "Stereo imaging"], answer: 2 },
      { q: "Dorian mode is built starting on which degree of the major scale?", options: ["1st", "2nd", "5th", "6th"], answer: 1 },
    ],
  },

  "overtones-harmonics": {
    hook: "Every musical note is secretly a chord stacked on top of itself.",
    beginner: {
      what: [
        "When you pluck a guitar string at, say, 110 Hz, you don't just get 110 Hz. You also get quieter versions at 220, 330, 440, 550 Hz and so on — whole-number multiples of the original. Those are harmonics.",
        "We mostly perceive the lowest one (the fundamental) as 'the note'. The pattern of all the harmonics above it gives the instrument its character.",
        "This stack is called the harmonic series, and it's why a perfect fifth (3:2) and an octave (2:1) sound consonant — they're already 'inside' every note.",
      ],
      why: [
        "Saturation works by adding harmonics — turning a thin source into a rich one.",
        "EQ surgery is usually about taming a single problematic harmonic, not a whole region.",
        "Why two notes 'clash': overlapping harmonics that aren't whole-number related.",
      ],
      analogy: "A single note is like a chef's special — one named dish, but with five quiet side dishes you barely notice colouring the flavour.",
    },
    advanced: {
      what: [
        "Harmonics are integer multiples of the fundamental: f, 2f, 3f, 4f… Partials is the broader term and includes non-integer (inharmonic) components.",
        "Energy distribution across harmonics defines waveform shape and timbre. A saw has all integer harmonics; a square only odd; a tuning fork is nearly pure sine with one harmonic.",
        "Just intonation builds intervals from small integer ratios (3:2 fifth, 5:4 third). Equal temperament tempers these slightly so all keys are equally usable.",
      ],
      edgeCases: [
        "Stretched-tuned pianos have slightly sharp high partials due to string stiffness.",
        "Bells and cymbals have strong inharmonic partials — cannot be defined by a single fundamental.",
        "FM synthesis generates non-integer sidebands that read as 'metallic' or 'bell-like'.",
      ],
      engineerNotes: [
        "Identify a resonance frequency by sweeping a narrow EQ boost — your ear picks the offending partial.",
        "Subtractive synthesis sculpts these harmonics with a filter; additive sums them; FM creates them via modulation.",
      ],
    },
    flow: "Fundamental + 2f + 3f + 4f + … → Composite waveform",
    walkthrough: [
      { do: "Play A2 on a saw synth, then EQ-cut everything above 200 Hz.", listen: "All you hear is the fundamental — bland and dull." },
      { do: "Open the cut.", listen: "Harmonics return; the note becomes 'an instrument' again." },
      { do: "Compare an electric piano and a tuning fork at the same note.", listen: "Tuning fork is nearly all fundamental; piano is rich with partials." },
      { do: "Play a single low piano note and listen for ~3 seconds.", listen: "Upper harmonics ring above the fundamental as it decays." },
      { do: "Run a clean bass through tape saturation.", listen: "New harmonics appear — same note, richer spectrum." },
    ],
    listenFor: ["The 'brightness' as a count of how many harmonics are active.", "A single offending harmonic causing a piercing note.", "Inharmonic shimmer in bells and cymbals.",
      "Odd vs even harmonic balance shifting tone from warm to hollow.",],
    mistakes: ["Treating timbre as 'EQ shape' instead of 'harmonic ratios'.", "Boosting brightness with a shelf instead of targeting the right harmonic.", "Forgetting that distortion adds harmonics — and energy — to your mix."],
    proMoves: ["Use a harmonic exciter on dull sources to add subtle 2nd/3rd harmonics.", "Tune snares by finding and tuning their dominant partial.", "Reference the harmonic series when picking which notes to layer."],
    quizHard: [
      { q: "A square wave contains…", options: ["All integer harmonics", "Only odd harmonics", "Only even harmonics", "No harmonics"], answer: 1 },
      { q: "Inharmonic partials are characteristic of…", options: ["Pure sine waves", "Bells and cymbals", "Sawtooth synths", "Vocals"], answer: 1 },
      { q: "The 3:2 ratio corresponds to which interval?", options: ["Octave", "Perfect fifth", "Major third", "Minor seventh"], answer: 1 },
      { q: "A diminished triad consists of…", options: ["Root, m3, P5", "Root, M3, P5", "Root, m3, ♭5", "Root, M3, #5"], answer: 2 },
    ],
  },

  "how-we-hear": {
    hook: "Your ears are biased measuring instruments. Mix around their quirks.",
    beginner: {
      what: [
        "The outer ear funnels sound to the eardrum. The eardrum vibrates and pushes three tiny bones in the middle ear, which amplify and pass the motion to the cochlea — a fluid-filled spiral lined with hair cells.",
        "Different positions along the cochlea respond to different frequencies. Hair cells convert that vibration into nerve signals. The brain reads the pattern as pitch, loudness, location, and timbre.",
        "Your hearing is not flat. You're most sensitive around 2–5 kHz (baby cry / consonant range) and less sensitive at the extremes. Low and high content needs more energy to seem 'equal'.",
      ],
      why: [
        "This is why mixes change at different volumes (Fletcher-Munson).",
        "Why ear fatigue is real — and dangerous past 85 dB SPL sustained.",
        "Why presence around 2–4 kHz feels 'forward' even at low boosts.",
      ],
      analogy: "Your ear is a violin's body, not a perfect microphone — every frequency gets coloured before it reaches your brain.",
    },
    advanced: {
      what: [
        "Cochlear hair cells perform a biological spectral analysis (place coding) plus phase locking (temporal coding) up to ~5 kHz.",
        "Equal-loudness contours (ISO 226) describe perceived equal loudness across frequency at different SPLs — they flatten as level rises.",
        "Binaural cues (ITD, ILD, HRTF spectral cues) provide localisation; reverb provides distance and room sense.",
      ],
      edgeCases: [
        "Noise-induced hearing loss preferentially damages 4 kHz region — classic audiogram notch.",
        "Tinnitus often manifests as a phantom tone matching damaged hair cell region.",
        "Headphones bypass HRTF — front/back and elevation cues collapse.",
      ],
      engineerNotes: [
        "Mix at ~75–85 dB SPL average for most accurate balance perception.",
        "Take 10-minute breaks every hour to reset auditory adaptation.",
        "Reference at very low volume to check arrangement balance — when small, only essential elements remain.",
      ],
    },
    flow: "Outer ear → Eardrum → Ossicles → Cochlea → Auditory nerve → Brain",
    walkthrough: [
      { do: "Play a mix at 60 dB then 90 dB SPL.", listen: "Loud version has obviously more bass and treble — same mix, different ears." },
      { do: "Listen to a sine sweep at constant amplitude.", listen: "It seems quieter at 50 Hz and 15 kHz than at 3 kHz — your sensitivity is not flat." },
      { do: "After an hour of loud mixing, take 15 minutes off and re-listen.", listen: "Things you thought were 'fine' suddenly reveal problems — your ears were tired." },
      { do: "Reference a mix at 65 dB SPL, then at 85 dB SPL.", listen: "Bass and highs feel louder at 85 — Fletcher–Munson curve." },
      { do: "Mix for 15 minutes, then take a 5-minute silent break.", listen: "Returning, you hear problems your fatigued ears were hiding." },
    ],
    listenFor: ["The 2–5 kHz 'presence' bias in your perception.", "Volume-dependent EQ balance shifts.", "Stereo image collapse when you nod your head (HRTF in action).",
      "Ear fatigue creeping in after 45–60 minutes — decisions get worse, not better.",],
    mistakes: ["Mixing too loud and adding too little bass.", "Ignoring ear fatigue and trusting late-session decisions.", "Skipping low-volume checks."],
    proMoves: ["Calibrate monitors to a known SPL with pink noise.", "Protect your hearing — your career depends on it.", "Test mixes on phone speakers + car + headphones + monitors — your audience uses all four."],
    quizHard: [
      { q: "Human hearing peaks in sensitivity around…", options: ["100 Hz", "500 Hz", "2–5 kHz", "12 kHz"], answer: 2 },
      { q: "Equal-loudness contours flatten as level…", options: ["Decreases", "Increases", "Stays constant", "Goes negative"], answer: 1 },
      { q: "ITD and ILD provide cues for…", options: ["Pitch", "Loudness", "Timbre", "Localisation"], answer: 3 },
      { q: "Relative minor of C major is…", options: ["A minor", "E minor", "G minor", "F minor"], answer: 0 },
    ],
  },

  "sound-scientist": {
    hook: "Capstone for Sound — prove you can read what your DAW shows you.",
    beginner: {
      what: [
        "You now know sound is pressure waves with frequency (pitch), amplitude (loudness), shape (timbre) and behaviour in space (room).",
        "This mission ties it together: drop a sample, look at the waveform, look at the spectrum, predict what you'll hear, then play it.",
        "If your prediction matches the playback, you've internalised the model. That model is the foundation everything else (mixing, sound design, mastering) sits on top of.",
      ],
      why: [
        "Working visually first, ears second, builds reliable intuition.",
        "Every production decision from here onward references one of these four properties.",
        "Catching problems by eye saves time and ears.",
      ],
    },
    advanced: {
      what: [
        "Apply the four-property model (frequency, amplitude, timbre, space) systematically to any incoming source as triage: where does it live? how loud? what's its harmonic profile? what room sense?",
        "Use waveform + spectrum + meters as triangulation tools — never just one.",
        "Build a personal reference library: 5 favourite kicks, 5 vocals, 5 mixes, all tagged with their measured profile.",
      ],
      edgeCases: ["Phase issues only show in stereo difference views.", "Sub content invisible on small speakers — always meter."],
      engineerNotes: ["Pair eye + ear for every assessment.", "Document your reference library — future you will thank you."],
    },
    flow: "See → Predict → Hear → Adjust mental model",
    walkthrough: [
      { do: "Open three unknown samples.", listen: "Predict pitch range, loudness, brightness from waveform + spectrum, then play to verify." },
      { do: "Repeat with a noisy field recording.", listen: "Note where the prediction was off — those are your blind spots." },
    ],
    listenFor: ["How accurate your eye-only predictions are.", "Which property (pitch, loudness, timbre, space) you read worst — train that one."],
    mistakes: ["Predicting only loudness and skipping spectrum/space.", "Trusting eye over ear when they disagree — eye is a hint, ear is the judge."],
    proMoves: ["Do this drill weekly for a month — predictions become near-instant.", "Add a fifth property — transient shape — once you're comfortable."],
    quizHard: [
      { q: "Which four properties define a sound for mix decisions?", options: ["Tempo, key, length, file size", "Frequency, amplitude, timbre, space", "Reverb, delay, EQ, compression", "Stereo, mono, mid, side"], answer: 1 },
      { q: "The most reliable mix-decision tool is…", options: ["Spectrum analyser alone", "Waveform display alone", "Meters alone", "Eyes + ears together"], answer: 3 },
      { q: "A deceptive cadence resolves V to…", options: ["I", "vi", "IV", "ii"], answer: 1 },
    ],
  },

  // ============================================================
  // PATH 2 — RHYTHM
  // ============================================================
  "what-is-rhythm": {
    hook: "Rhythm is the heartbeat of music — pattern in time.",
    beginner: {
      what: [
        "Rhythm is what happens when sounds are organised in time. Footsteps, ticking clocks and heartbeats all have rhythm — they place events at predictable intervals.",
        "In music, those events are notes and hits. The pattern of when they land — and how long they last — is what your body locks onto when you nod or dance.",
        "Pitch and melody can be powerful, but rhythm is what gets people moving. Most dance music genres are defined by their rhythmic patterns long before their harmonic ones.",
      ],
      why: [
        "Without rhythm, a sequence of notes is just sound — not music.",
        "Groove, swing, tightness and feel all live in the rhythm layer.",
        "Genres are recognised first by their rhythmic fingerprint (4/4 kick, 808 syncopation, dembow, etc.).",
      ],
      analogy: "Rhythm is the skeleton of a song. Melody and harmony are the muscle and skin on top.",
    },
    advanced: {
      what: [
        "Rhythm = the temporal organisation of musical events. It encompasses tempo, meter, subdivision, accent, syncopation, and groove (microtiming).",
        "Pulse (beat) is the underlying steady reference; rhythm is the pattern of accents and durations on top.",
        "Polyrhythms layer two or more independent rhythmic cycles (3-against-2 etc.); polymetric music shifts the bar grouping itself.",
      ],
      edgeCases: [
        "Free-tempo (rubato) music has rhythm without strict pulse.",
        "Sample-based hip-hop often inherits microtiming from the source loop — straight quantising kills the feel.",
        "In 5/4 or 7/8, the 'feel' breaks the usual 4-on-the-floor instinct — count out loud at first.",
      ],
      engineerNotes: [
        "Drum programming priorities: solid quarter-note pulse first, then 8th/16th subdivisions, then accents/ghosts, then swing.",
        "Reference: kick = downbeat, snare = backbeat (2 & 4 in 4/4), hats = subdivision filler.",
      ],
    },
    flow: "Tempo → Meter → Subdivision → Accent pattern → Groove",
    walkthrough: [
      { do: "Tap along to four songs in different genres.", listen: "Each has a distinct pulse and accent pattern — that's rhythm." },
      { do: "Remove the drums from a track using stems.", listen: "Most genre identity walks out the door with the drums." },
      { do: "Loop a single kick at 120 BPM.", listen: "Even one note becomes 'rhythm' once it repeats in time." },
      { do: "Tap a steady pulse, then accent every 4th tap.", listen: "Bars emerge from a flat stream of beats." },
      { do: "Loop a 1-bar drum break and clap the upbeats.", listen: "Counter-rhythm makes the groove feel deeper." },
    ],
    listenFor: ["The pulse — where your foot wants to tap.", "Backbeat accents on 2 and 4.", "Subdivision fillers in hats and percussion.",
      "Backbeat snares pinning the second and fourth beat.",
      "Subtle pulse vs accented downbeat.",],
    mistakes: ["Quantising everything to a hard grid and losing feel.", "Confusing tempo (speed) with rhythm (pattern).", "Building melody before the rhythm sits."],
    proMoves: ["Program drums to a click, then nudge individual hits for feel.", "Steal microtiming from a reference loop with Live's Groove Pool.", "Always check rhythm at half speed — issues become obvious."],
    quizHard: [
      { q: "Which is NOT a rhythmic concept?", options: ["Tempo", "Meter", "Cadence", "Subdivision"], answer: 2, explain: "Cadence is a harmonic concept (chord resolution)." },
      { q: "Backbeat in 4/4 typically lands on beats…", options: ["1 & 3", "2 & 4", "All four", "Off-beats only"], answer: 1 },
      { q: "Why drop the 3rd of a chord in dense low-frequency mixes?", options: ["To make it major", "To avoid muddy low-mid clash", "To change the key", "To add tension"], answer: 1 },
      { q: "A bar in 4/4 contains how many quarter-note beats?", options: ["2", "3", "4", "8"], answer: 2 },
    ],
  },

  "time-keeper": {
    hook: "Lock to the click. Without it, nothing else lines up.",
    beginner: {
      what: [
        "Almost every modern production is built around a metronome — a steady click that defines exactly when each beat lands. Every sample, MIDI note, and automation move is timed to that grid.",
        "When you 'play in time', you're aligning your hits to the click. When you quantise, you're snapping them to the nearest grid point.",
        "Even genres that feel loose (hip-hop, lo-fi, jazz-tinged stuff) usually have a click underneath — the looseness is added on top intentionally.",
      ],
      why: [
        "A grid makes editing, syncing FX, and mixing radically easier.",
        "Live performance with backing tracks requires rock-solid tempo alignment.",
        "Beat-matched DJ sets exist because every track agrees on what 'on the beat' means.",
      ],
      analogy: "The click is the conductor everyone watches. Without it, the orchestra drifts apart.",
    },
    advanced: {
      what: [
        "Project tempo (BPM) defines the master grid. Every clip, MIDI event, and automation point references either grid time (beats) or wall-clock time (seconds).",
        "Quantisation snaps events to the nearest subdivision; humanise/groove templates add controlled deviation back in.",
        "Latency compensation (PDC) keeps tracks aligned despite plugin processing delays — verify it's enabled before recording.",
      ],
      edgeCases: [
        "Tempo changes mid-project: use tempo automation, not tempo edits — the latter shifts all warp markers.",
        "Recording acoustic instruments to a click: feed the performer click in monitors only, never in the mic.",
      ],
      engineerNotes: [
        "Live's Warp engine pins audio to grid via warp markers — manual editing yields tighter results than auto-warp on complex sources.",
        "Use 'Nudge' (small grid offset) for groove instead of disabling quantise entirely.",
      ],
    },
    flow: "BPM → Grid → Quantise → Optional groove offset",
    walkthrough: [
      { do: "Enable metronome and tap kicks on every beat.", listen: "Your hits sit ON the click — that's locked." },
      { do: "Drag one hit 10 ms late.", listen: "The whole pattern feels heavier or laid back." },
      { do: "Quantise everything 100%, then 80%.", listen: "100% = robotic; 80% retains feel while tightening up." },
    ],
    listenFor: ["The click 'disappearing' into the kick when perfectly aligned.", "Drift on long takes without a click.", "Subdivisions snapping to the grid lines."],
    mistakes: ["Recording without a click and trying to grid-edit later.", "Over-quantising live drums — drains the life.", "Ignoring plugin latency compensation."],
    proMoves: ["Set a count-in (1–2 bars) so the performer enters in pocket.", "Use a percussion click (rim, side-stick) instead of a beep — easier on ears.", "Tap-tempo a reference track to find its BPM, then build at exactly that."],
    quizHard: [
      { q: "PDC stands for…", options: ["Pre-Delay Compensation", "Plugin Delay Compensation", "Phase Drift Control", "Peak Detection Curve"], answer: 1 },
      { q: "Quantising at 80% strength…", options: ["Snaps to grid 80% of the way", "Quantises 80% of notes only", "Adds 80 ms swing", "Disables snap"], answer: 0 },
      { q: "Purpose of a pre-chorus?", options: ["Repeat the verse", "Build tension into the chorus", "Replace the bridge", "Reduce energy"], answer: 1 },
    ],
  },

  "tempo-bpm": {
    hook: "BPM = beats per minute. The single most important number on your project.",
    beginner: {
      what: [
        "Tempo is the speed of the pulse, measured in beats per minute (BPM). 120 BPM means 120 beats happen every 60 seconds — two per second.",
        "Different genres cluster around typical tempos: hip-hop 70–100, house 120–128, drum & bass 170–180, techno 125–135.",
        "Every clip, sample, and automation in your DAW is timed against this number. Change the project BPM and (with warping on) the whole arrangement speeds up or slows down without changing pitch.",
      ],
      why: [
        "Picking a tempo first gives every element a common reference.",
        "Tempo affects feel: 130 feels driving, 90 feels heavy, 75 feels patient.",
        "Sync, delay times, LFO rates and arpeggiator speeds all derive from tempo.",
      ],
      analogy: "BPM is the speed limit of your song. Everything inside obeys it.",
    },
    advanced: {
      what: [
        "BPM defines the duration of one quarter-note: 60/BPM seconds. From this every other note value, delay time, and tempo-synced LFO derives.",
        "Tempo automation lets you ritardando/accelerando — but in Live, prefer drawing tempo curves over inserting tempo changes per beat.",
        "Half-time / double-time feels keep the BPM constant but change the perceived subdivision (snare on 3 instead of 2 & 4 doubles the perceived bar).",
      ],
      edgeCases: [
        "Some Warp modes (Complex, Complex Pro) shift formants when tempo changes drastically.",
        "Tempo detection on acoustic recordings is approximate — manual warping yields tighter results.",
        "Some tracks vary BPM (rubato or live drummers) — fixed-tempo warping flattens that feel.",
      ],
      engineerNotes: [
        "Quarter-note delay time in ms = 60,000 / BPM. At 120 BPM that's 500 ms.",
        "Sync everything tempo-related: ducking sidechain release, plate reverb pre-delay, LFO speed.",
      ],
    },
    flow: "BPM → Beat duration (60/BPM s) → All sync times derived",
    walkthrough: [
      { do: "Set project to 120 BPM and play a kick on every quarter.", listen: "Two hits per second — that's 120 BPM." },
      { do: "Change tempo to 90 BPM with warping on.", listen: "Slower, heavier — but the kick stays the same pitch." },
      { do: "Set a delay to 1/4 note and tap-tempo a melody.", listen: "Delay locks to the grid no matter the speed." },
      { do: "Drop a 124 BPM loop into a 128 BPM project.", listen: "Live warps it to fit — pitch usually preserved." },
      { do: "Use tap tempo on a record you love.", listen: "Internalising tempos by feel sharpens production instincts." },
    ],
    listenFor: ["Genre-typical tempo feels.", "Half-time feel making things heavier.", "Sync glitches when BPM doesn't match the source.",
      "BPM mismatch between layered loops causing phasing or flam.",],
    mistakes: ["Building at the wrong tempo and re-warping later.", "Forgetting to sync delays / LFOs to BPM.", "Changing tempo mid-project without checking warp markers."],
    proMoves: ["Tap-tempo a reference song to find its BPM before sampling it.", "Use 'half-time' bus tricks for chorus weight without dropping tempo.", "Lock all sync-able plugins to project tempo from day one."],
    quizHard: [
      { q: "Quarter-note delay time at 120 BPM in milliseconds?", options: ["250 ms", "500 ms", "750 ms", "1000 ms"], answer: 1 },
      { q: "Half-time feel typically moves the snare to which beat in 4/4?", options: ["Beat 1", "Beat 2", "Beat 3", "Beat 4"], answer: 2 },
      { q: "Drum & bass tempo range is typically…", options: ["70–90 BPM", "120–130 BPM", "170–180 BPM", "200–220 BPM"], answer: 2 },
      { q: "Best practice when learning from a reference?", options: ["Listen once casually", "Loop short sections and dissect", "Skip to the drop", "Compare loudness only"], answer: 1 },
    ],
  },

  "bars-time-signatures": {
    hook: "Bars chunk time into groups. Time signature tells you how big each chunk is.",
    beginner: {
      what: [
        "A bar (or measure) is a fixed group of beats. The time signature is the recipe — top number = how many beats per bar, bottom number = which note value counts as one beat.",
        "4/4 is by far the most common: four quarter-notes per bar. 3/4 (waltz) has three. 6/8 (compound) has six eighth-notes felt as two groups of three.",
        "Bars give the song a structure to count against: 'verse is 16 bars, chorus is 8 bars'. Loops, arrangement blocks, and song forms all work in bar counts.",
      ],
      why: [
        "Arrangement decisions are usually in bar units (drop on bar 33, etc.).",
        "Time signature shapes feel — 4/4 driving, 3/4 lilting, 7/8 unsettled.",
        "Loop length, intro/outro length, and transitions all line up to bars.",
      ],
      analogy: "If beats are footsteps, bars are city blocks. The time signature says how many steps make one block.",
    },
    advanced: {
      what: [
        "Time signature notation: numerator = beats per bar, denominator = beat unit (4 = quarter, 8 = eighth, 2 = half).",
        "Simple meters (2/4, 3/4, 4/4) subdivide each beat in two. Compound meters (6/8, 9/8, 12/8) subdivide in three. Odd/asymmetric meters (5/4, 7/8) combine groups of 2 and 3.",
        "Phrase length (4, 8, 16 bars) is a strong perceptual unit — listeners feel cadence points landing on bar boundaries.",
      ],
      edgeCases: [
        "Metric modulation: changing the beat unit without changing total time (common in math rock).",
        "Pickup bars (anacrusis) start a phrase before bar 1.",
        "DAWs sometimes mislabel 6/8 as 6/4 — verify your import settings.",
      ],
      engineerNotes: [
        "Set time signature BEFORE recording — changing it later doesn't re-bar existing material in Live.",
        "Phrase changes typically land on multiples of 4 or 8 bars in dance music.",
      ],
    },
    flow: "Time sig → Bar size → Phrase blocks → Song form",
    walkthrough: [
      { do: "Loop a 1-bar drum pattern at 4/4.", listen: "Four kicks, snare on 2 & 4 — the classic shape." },
      { do: "Change project to 3/4.", listen: "Pattern shifts; you feel a waltz lilt instead of a march." },
      { do: "Set 7/8 and program a beat.", listen: "Feels unsettled, off-balance — short last beat." },
      { do: "Switch a project from 4/4 to 6/8 and play a kick on every count.", listen: "Same tempo, totally different feel." },
      { do: "Write a 4-bar phrase, then add a 1-bar 3/4 fill.", listen: "The break grabs attention before resolving back." },
    ],
    listenFor: ["Phrase landings every 4 or 8 bars.", "Compound subdivisions in 6/8 vs simple 3/4.", "Backbeat shifting when time signature changes.",
      "Phrase boundaries every 4 or 8 bars in dance music.",],
    mistakes: ["Building in 4/4 and forcing odd-meter samples in without re-warping.", "Mis-counting bars during arrangement.", "Mixing simple and compound feels without intent."],
    proMoves: ["Use locators every 8 bars to navigate fast.", "Try a one-bar 5/4 break inside a 4/4 track for tension.", "Phrase your arrangement in question/answer 4-bar blocks."],
    quizHard: [
      { q: "6/8 is which type of meter?", options: ["Simple", "Compound", "Asymmetric", "Free"], answer: 1 },
      { q: "How many quarter-notes are in one bar of 7/4?", options: ["6", "7", "8", "14"], answer: 1 },
      { q: "An anacrusis is…", options: ["Final bar of a phrase", "Pickup notes before bar 1", "Cadence chord", "Half-time section"], answer: 1 },
      { q: "Why does Live use 32-bit float internally?", options: ["Smaller files", "Effectively unclippable headroom on internal buses", "Better latency", "MIDI accuracy"], answer: 1 },
    ],
  },

  "groove-feel": {
    hook: "Groove is microtiming — the tiny shifts that make a beat human.",
    beginner: {
      what: [
        "If every note lands exactly on the grid, the beat sounds robotic. Real drummers — and great programmers — push some notes slightly early or late on purpose. That micro-timing is groove.",
        "Swing is the most famous example: every off-beat 16th note is pushed slightly later, giving a triplet feel inside a straight meter. Hip-hop, shuffle blues and UK garage all live and die by swing amount.",
        "You can also change accent (which hits are loud vs quiet) and articulation (length of each note) to create groove without moving timing at all.",
      ],
      why: [
        "Same notes + different groove = different song.",
        "Groove turns a sketch into a vibe.",
        "DJ-friendly genres rely on groove templates that match across tracks.",
      ],
      analogy: "A perfect grid is a robot walking. Groove is a human swinging their hips.",
    },
    advanced: {
      what: [
        "Microtiming = sub-grid timing deviation, measured in ticks or ms. Velocity layering adds accent variation, while gate length adds articulation.",
        "Live's Groove Pool extracts and applies a groove template (timing, velocity, length) from any clip onto any other.",
        "Swing percentage typically refers to the delay of off-beat 16ths relative to a perfect grid: 50% = straight, 66% = triplet, intermediate values shape the feel.",
      ],
      edgeCases: [
        "Layered drum kits need consistent grooves applied to all layers, or they smear.",
        "Quantising after applying groove undoes the groove — order matters.",
        "Too much swing on fast 16ths starts to sound like triplets — pull it back to 54–58%.",
      ],
      engineerNotes: [
        "Steal grooves from MPC60, SP1200, J Dilla loops for instant character.",
        "Apply groove to bass and hats — not just snares — for genre-correct pocket.",
      ],
    },
    flow: "Grid notes → Microtiming + velocity + length offsets → Groove",
    walkthrough: [
      { do: "Program a straight 16th hi-hat pattern.", listen: "Mechanical, sewing-machine feel." },
      { do: "Apply 66% swing.", listen: "Hats now lope — classic shuffle." },
      { do: "Vary velocities ±20 randomly.", listen: "Suddenly feels played, not programmed." },
      { do: "Apply 56% swing to a straight 16th hat pattern.", listen: "Stiff loop instantly feels human and bouncy." },
      { do: "Nudge the snare 5 ms late on a tight pattern.", listen: "Pocket deepens — laid-back without dragging." },
    ],
    listenFor: ["Late snare backbeats giving a 'laid-back' feel.", "Early hats giving an 'on-top' push.", "Velocity differences accenting beats 1 and 3.",
      "Micro-timing pulling the snare slightly behind the beat.",],
    mistakes: ["Applying swing to a kick drum that should stay locked.", "Random humanisation instead of intentional pattern.", "Forgetting to apply groove consistently across the kit."],
    proMoves: ["Build a personal groove library from your favourite breaks.", "Use accent rather than timing for jazz-leaning feel.", "Solo drums + bass and tweak groove together — they must agree."],
    quizHard: [
      { q: "Swing % of 50% means…", options: ["Straight (no swing)", "Triplet feel", "Half-time", "Shuffle"], answer: 0 },
      { q: "Live's Groove Pool extracts which three parameters?", options: ["Pitch, pan, EQ", "Timing, velocity, length", "Tempo, key, swing", "Reverb, delay, chorus"], answer: 1 },
      { q: "Why does Note On with velocity 0 equal Note Off?", options: ["Bug in spec", "Bandwidth optimisation on serial MIDI", "Required by VSTs", "Bit-depth limit"], answer: 1 },
      { q: "Swing of 50% means…", options: ["Maximum shuffle", "Perfectly straight timing", "Triplet feel", "Half-time"], answer: 1 },
    ],
  },

  "syncopation": {
    hook: "Hit where the beat isn't, and the music suddenly grooves.",
    beginner: {
      what: [
        "Syncopation means placing accents on weak beats or off-beats — the spaces between the strong beats. The pulse stays the same, but the rhythm fights against it.",
        "Funk, reggae and most dance music live on syncopation. A kick on the 'and' of beat 2, a chord stab on the off-beat — these are what make people move.",
        "A straight, un-syncopated pattern feels martial and predictable. Add even one syncopated hit and the whole loop comes alive.",
      ],
      why: [
        "Syncopation is the difference between marching music and dance music.",
        "Off-beat hits create tension that resolves on the next downbeat — your body wants to move to fill that tension.",
        "Genre fingerprints are often a syncopation pattern (reggae offbeat skank, funk 16th-note bass, dembow).",
      ],
      analogy: "If the beat is the heart, syncopation is the dancer skipping a step on purpose. The miss is what makes it cool.",
    },
    advanced: {
      what: [
        "Syncopation = accent shift to metrically weak positions (off-beats, upbeats, sub-divisions).",
        "Three operative tools: anticipation (hit before downbeat), suspension (hold across downbeat), displacement (whole phrase shifted by a subdivision).",
        "Cross-rhythm extends syncopation into rhythms that imply a different meter than the notated one (e.g. 3-against-4).",
      ],
      edgeCases: [
        "Over-syncopation removes the perceived pulse — listeners lose the 'one'.",
        "Sample-based grooves often have built-in syncopation in the source — quantising kills it.",
        "Over-syncopation removes the downbeat anchor — listeners lose 'the one'.",
      ],
      engineerNotes: [
        "Reggae one drop: kick only on 3, skank on off-beats — pure syncopation.",
        "Latin clave patterns are pure syncopation templates that translate across genres.",
      ],
    },
    flow: "Strong beat grid → Accent off-grid notes → Tension → Resolution",
    walkthrough: [
      { do: "Program a kick on 1, 2, 3, 4. Then add a hit on the 'and' of 2.", listen: "The single off-beat hit immediately changes the feel." },
      { do: "Try a 3-3-2 pattern over 8 eighth-notes.", listen: "Classic Latin/EDM syncopation — feels both off and inevitable." },
      { do: "Remove every hit on beats 1 and 3.", listen: "Tension explodes — listener feels the missing beats." },
      { do: "Move a kick from beat 3 to the '+ of 2'.", listen: "Groove instantly leans forward." },
      { do: "Add a ghost snare on the 'e' of 4.", listen: "Bar gains forward motion without louder hits." },
    ],
    listenFor: ["Off-beat accents pulling against the grid.", "Anticipated chord changes one 16th before the downbeat.", "3-3-2 patterns inside 4/4 bars.",
      "Accents landing between the strong beats, creating push and pull.",],
    mistakes: ["Syncopating without an underlying steady pulse — listener loses orientation.", "Random off-beat hits without a recurring pattern.", "Avoiding syncopation entirely — beats stay 'square'."],
    proMoves: ["Anticipate chord changes by an 8th note for drive.", "Use 3-3-2 across hats while kick stays on the floor.", "Reference clave when stuck — it works in almost any genre."],
    quizHard: [
      { q: "Syncopation places accents on…", options: ["Strong beats only", "Weak beats / off-beats", "Downbeats", "Bar lines"], answer: 1 },
      { q: "3-3-2 over 8 eighth-notes is…", options: ["A clave-style syncopation", "Compound triple meter", "Polyrhythm 3:4", "Half-time"], answer: 0 },
      { q: "Dither is added when…", options: ["Increasing bit depth", "Reducing bit depth", "Changing sample rate", "Compressing audio"], answer: 1 },
      { q: "Syncopation primarily accents…", options: ["On-beats", "Off-beats / weak positions", "The downbeat", "Bar one"], answer: 1 },
    ],
  },

  "polyrhythm": {
    hook: "Two rhythms at once that share a downbeat but disagree everywhere else.",
    beginner: {
      what: [
        "A polyrhythm is two or more independent rhythms playing simultaneously, each with its own pulse. The most famous example is '3 against 2' — one voice plays 3 evenly-spaced hits while another plays 2 in the same span.",
        "They line up on beat 1 and at the end of the cycle, but everywhere in between they pull against each other. Your ear flips between hearing the 3 and hearing the 2.",
        "Polyrhythms add motion and complexity without changing tempo. African drumming, prog rock, modern electronic music and jazz all use them constantly.",
      ],
      why: [
        "Adds rhythmic interest without adding faster notes.",
        "Creates an 'awake' feel — the brain has to track two patterns at once.",
        "Common in pop too: triplet hats over straight kick is a polyrhythm.",
      ],
      analogy: "Two people clapping different patterns that meet on beat 1. The longer the cycle, the deeper the trance.",
    },
    advanced: {
      what: [
        "Polyrhythm is two or more rhythmic cycles whose pulse counts are coprime — e.g. 3:2, 4:3, 5:4, 7:4. The two voices share a downbeat and realign every LCM(n,m) sub-pulses. A 3:2 cycle resets every 6 sub-pulses; 5:4 every 20.",
        "Polymeter is distinct: the sub-pulse is shared, but the bar lengths differ. A 4-beat phrase looping against a 3-beat phrase keeps its identity but the *barline* drifts. They reconverge every LCM(bar_a, bar_b) beats.",
        "Tuplets (triplets, quintuplets, septuplets) are micropolyrhythms inside a single voice — 3 notes evenly squeezed into the space of 2 16ths, etc. DAWs notate these as 1/4t (quarter triplet), 1/8t (eighth triplet), and so on.",
        "Auditory streaming research (Bregman, 1990) shows that pitch and timbral separation between the two voices is what lets listeners hear two rhythms rather than one chaotic one — so panning, register, and EQ separation matter as much as timing.",
      ],
      edgeCases: [
        "Most DAW grids assume a single meter — programming polymetric loops needs manual bar locators, multiple clip lengths in Session view, or Live 12's per-clip time-signature changes.",
        "Polyrhythms feel disorienting at fast tempos because the brain can't lock onto either pulse — start under 100 BPM, then speed up once the pattern is set.",
        "Quantizing a polyrhythm to a single grid value flattens it — use multiple groove templates or disable quantize on the off-grid voice.",
        "Phase-aligning two looped MIDI clips of different lengths can drift if 'warp' is off — keep them MIDI and quantized for guaranteed alignment on the downbeat.",
      ],
      engineerNotes: [
        "Loop length = LCM of the two cycle counts. For 5:4, your composite loop is 20 sub-pulses long.",
        "Pan the competing voices a minimum of ~40% apart, or place them in non-overlapping frequency bands (low conga + high block) so the ear can stream them separately.",
        "Sidechain-duck the secondary voice ~2 dB from the kick so the primary pulse always wins on beat 1.",
        "When notating in MIDI, label one voice as the 'primary' and write the other as offsets — easier to edit than two competing grids.",
      ],
    },
    flow: "Voice A (n hits) + Voice B (m hits) over same span → aligns every LCM(n,m)",
    walkthrough: [
      { do: "Program 3 evenly-spaced hits per bar on a conga and 2 per bar on a wood block at 100 BPM.", listen: "Classic 3:2 polyrhythm — both align on beat 1." },
      { do: "Add a 4-pulse kick to ground the pulse.", listen: "Now 4:3:2 — feels endlessly rotating but anchored." },
      { do: "Pan congas hard left and wood block hard right.", listen: "Both patterns audible as separate streams instead of one busy texture." },
      { do: "Loop two MIDI clips of different lengths (4 bars vs 3 bars) — that's polymeter, not polyrhythm.", listen: "Downbeats drift relative to each other until they realign at bar 12." },
      { do: "Slow the tempo to 70 BPM and re-listen.", listen: "Polyrhythm clarifies — your brain can track both voices instead of blurring them." },
    ],
    listenFor: [
      "The downbeat where every voice lands together — your anchor.",
      "Your perception flipping between hearing the 3-pattern and the 2-pattern.",
      "The trance / hypnotic feel that emerges from long cycles.",
      "Stereo or frequency separation that makes each voice trackable.",
    ],
    mistakes: ["Treating triplets as polyrhythm when there's no second steady voice.", "Polyrhythms with no clear downbeat — listener gets lost.", "Loud polyrhythms drowning the main pulse.", "Mixing both voices to mono dead-centre — they collapse into noise."],
    proMoves: ["Use polyrhythm for percussion only while bass + chords stay 'square'.", "Slow tempo to introduce; speed up to hypnotise.", "Sidechain duck the polyrhythm slightly so the kick still owns the one.", "Try 7:4 on hi-hats over a 4/4 beat — instant Aphex Twin energy."],
    quizHard: [
      { q: "3:2 polyrhythm cycles realign every…", options: ["Every beat", "Every 6 sub-pulses", "Every 12 sub-pulses", "Never"], answer: 1, explain: "LCM(3,2) = 6 sub-pulses." },
      { q: "Polymeter differs from polyrhythm because…", options: ["It uses different bar lengths, not different rhythms in the same bar", "It only uses triplets", "It changes tempo", "It is the same thing"], answer: 0, explain: "Polymeter keeps the sub-pulse shared but lets bars differ in length, so downbeats drift." },
      { q: "What helps a listener separate two polyrhythmic voices?", options: ["Identical timbre and pan", "Pitch, timbre, or stereo separation between voices", "Adding more layers", "Removing the downbeat"], answer: 1, hint: "Bregman's auditory streaming." },
      { q: "Which warp mode is generally best for full drum loops?", options: ["Beats", "Tones", "Texture", "Re-Pitch"], answer: 0 },
    ],
  },

  "note-values": {
    hook: "Whole, half, quarter, 8th, 16th — the rhythmic alphabet.",
    beginner: {
      what: [
        "Note values describe how long a note lasts relative to the beat. A quarter-note = one beat in 4/4. A half-note = two beats. An eighth-note = half a beat. Sixteenth-notes = quarter of a beat.",
        "On a piano roll, longer notes draw as longer bars. On a step sequencer, smaller note values mean more steps per beat.",
        "Genres have characteristic note-value choices: 4-on-the-floor kicks are quarter-notes, dnb hats are 16ths, ambient pads are whole notes.",
      ],
      why: [
        "Picking the right note value shapes the energy: 16ths feel busy, halves feel patient.",
        "Quantisation snaps to a chosen note value — wrong value = wrong feel.",
        "Note length affects audibility: a 1/32 hi-hat is barely heard but adds shimmer.",
      ],
      analogy: "Note values are like camera shutter speeds. Long = slow and smooth. Short = fast and detailed.",
    },
    advanced: {
      what: [
        "Each smaller value is half the previous: whole (4 beats), half (2), quarter (1), 8th (0.5), 16th (0.25), 32nd (0.125), 64th (0.0625) in 4/4.",
        "Dotted notes add 50% (dotted quarter = 1.5 beats). Tied notes sum two values. Triplets divide a value into three equal parts.",
        "Articulation (staccato/legato) is a separate axis — same value, different perceived length depending on note-off timing.",
      ],
      edgeCases: [
        "MIDI note length affects synth release behaviour — short notes may cut off envelopes early.",
        "Tempo-synced delays use note values directly (1/4D = dotted quarter).",
        "Dotted notes (1/4 dotted = 1.5 × 1/4) sit between standard divisions — common in delays.",
      ],
      engineerNotes: [
        "Hi-hat shimmer often = 32nd or 16th triplet patterns at low velocity.",
        "Pad parts that last whole notes provide harmonic floor without rhythmic competition.",
      ],
    },
    flow: "Note value choice → Quantise grid → Density & feel",
    walkthrough: [
      { do: "Program a quarter-note kick and an 8th-note hat.", listen: "Foundational dance feel." },
      { do: "Switch hats to 16ths.", listen: "Twice as busy — increases energy." },
      { do: "Convert kick to dotted half-notes.", listen: "Pulse stretches; track feels slower despite same BPM." },
      { do: "Set hat to 1/16, kick to 1/4, snare to 1/2 in a 1-bar loop.", listen: "Three speeds layering into one groove." },
      { do: "Convert straight 1/8 hats to triplet 1/8s.", listen: "Same tempo, totally different feel — 6/8 vs 4/4 motion." },
    ],
    listenFor: ["Hat density defining energy level.", "Pad whole-notes anchoring harmony.", "Triplet feels disrupting straight 8ths.",
      "Subdivision density driving perceived energy without changing BPM.",],
    mistakes: ["Choosing one note value for every voice — pattern feels flat.", "Using 32nds without enough velocity variation — turns to mush.", "Forgetting that note length controls envelope behaviour."],
    proMoves: ["Layer two hat patterns: 8ths loud + 16ths quiet.", "Use whole-note pads in chorus, half-notes in verse for build.", "Dotted note values bring movement without doubling density."],
    quizHard: [
      { q: "How many 16th-notes fit in one bar of 4/4?", options: ["4", "8", "16", "32"], answer: 2 },
      { q: "A dotted quarter equals…", options: ["0.5 beats", "1 beat", "1.5 beats", "2 beats"], answer: 2 },
      { q: "A triplet divides a beat into…", options: ["2", "3", "4", "6"], answer: 1 },
      { q: "Why does plugin order matter?", options: ["It doesn't — they're commutative", "Each device transforms the signal before the next sees it", "Only for MIDI plugins", "Only at master bus"], answer: 1 },
    ],
  },

  "rhythm-in-production": {
    hook: "Drums, bass, hats — rhythm is the load-bearing wall of your track.",
    beginner: {
      what: [
        "In production, rhythm isn't just drums. The bass groove, the chord stab pattern, the vocal phrasing, even sidechain pumping — all are rhythmic decisions that interact.",
        "A typical workflow: lock the kick + bass pattern first, then layer hats and percussion, then add chord rhythm, then melody, then automation/FX rhythm last.",
        "When something feels wrong, the rhythm layer is usually the culprit — competing patterns, ambiguous downbeat, or a section with nothing driving the pulse.",
      ],
      why: [
        "Rhythm decisions determine genre, energy and groove before harmony is even chosen.",
        "Mix problems often vanish when rhythmic clashes between kick + bass are fixed.",
        "Listener attention is grabbed by rhythmic change, not melodic change.",
      ],
      analogy: "Rhythm is the chassis. You can put any body (melody/harmony) on it, but the chassis decides the ride.",
    },
    advanced: {
      what: [
        "Rhythmic arrangement = layering complementary patterns at different note values so each voice owns its slot (kick = quarters, bass = 8ths, hats = 16ths).",
        "Sidechain compression triggered by the kick adds rhythmic pumping to pads and bass — a rhythmic effect on top of harmonic content.",
        "Transitions are rhythmic events: drum fills, snare rolls, reverse cymbals, silence — all reset listener attention at bar boundaries.",
      ],
      edgeCases: [
        "Bass note onset = kick onset is the safest pocket but limits movement; offsetting by an 8th creates funk but risks mud.",
        "Multiple percussion layers at the same note value need varied accents to avoid 'one big noise'.",
        "Quantising every layer to grid removes the human pull — leave some elements off-grid intentionally.",
      ],
      engineerNotes: [
        "Bus drums + bass to a single 'rhythm' group for unified compression and ducking.",
        "Automate hat density across sections to track energy.",
      ],
    },
    flow: "Kick + bass pattern → Hats/perc → Chord rhythm → Melody → FX rhythm",
    walkthrough: [
      { do: "Build a 4-bar loop with kick + bass only.", listen: "If that grooves, the rest is easier. If not, fix this first." },
      { do: "Add 16th hats and shaker.", listen: "Energy lifts; subdivisions fill space." },
      { do: "Sidechain pad to kick.", listen: "Pad now pulses with the rhythm even though it has no rhythm of its own." },
      { do: "Sidechain a pad to the kick.", listen: "Pad ducks on each kick — rhythmic 'pump' without programming notes." },
      { do: "Add a 1/16-dotted delay to a single vocal phrase.", listen: "Polyrhythmic echo against the main pulse." },
    ],
    listenFor: ["Kick + bass pocket as the foundation.", "Each layer owning its note value.", "Sidechain pumping providing rhythmic glue.",
      "Rhythmic interplay between melodic parts and the kick pattern.",],
    mistakes: ["Starting with melody before rhythm is locked.", "Layering too many same-value parts.", "Forgetting to vary rhythm between sections."],
    proMoves: ["Strip a finished beat back to kick + bass — if it still grooves, you nailed it.", "Use silence as rhythm — drop everything for one bar before a chorus.", "Reference target tracks at the rhythm-only stage."],
    quizHard: [
      { q: "Sidechain compression typically adds…", options: ["Harmonic content", "Rhythmic pumping", "Stereo width", "Transient shaping"], answer: 1 },
      { q: "Layering complementary rhythm typically uses…", options: ["The same note value for all parts", "Different note values per voice", "All triplets", "All 32nds"], answer: 1 },
      { q: "Why use a send for reverb instead of an insert?", options: ["Lower CPU and consistent space across multiple tracks", "Higher fidelity always", "Required by the DAW", "Reverb only works on sends"], answer: 0 },
      { q: "Sidechain compression on a pad creates…", options: ["Constant volume", "Rhythmic ducking", "Pitch shift", "Stereo width"], answer: 1 },
    ],
  },

  "rhythm-builder": {
    hook: "Capstone for Rhythm — build a groove from scratch in 8 bars.",
    beginner: {
      what: [
        "Time to put the rhythm path together: pick a tempo, a meter, lay a kick + snare backbone, add subdivision (hats), add syncopation in percussion, apply groove, and finish with one rhythmic FX move.",
        "The goal isn't a finished song — it's proving you can make 8 bars groove with rhythm alone, no melody or chords.",
        "If it makes your head nod with just drums and bass, the rest of the song will fall into place easily.",
      ],
      why: [
        "Tests every concept from Path 2 in one practical loop.",
        "Builds the habit of locking rhythm before harmony.",
        "Gives you a personal template you can reuse.",
      ],
    },
    advanced: {
      what: [
        "Capstone exercise: pick a target genre, identify its rhythmic fingerprint (kick pattern, snare position, hat subdivision, characteristic syncopation), build it from scratch, apply genre-typical groove template, and one transition (fill, reverse, silence).",
        "Test against a reference at the same tempo — your loop should sit in the same pocket without obvious mismatches.",
      ],
      edgeCases: ["Don't quantise everything 100% — leave 80–90% for feel.", "Layered kits need consistent groove application."],
      engineerNotes: ["Bus and compress the rhythm group as one — this is where 'glue' starts."],
    },
    flow: "Tempo → Meter → Kick/snare → Hats → Perc syncopation → Groove → Transition",
    walkthrough: [
      { do: "Pick 120 BPM in 4/4. Kick on every beat, snare on 2 & 4.", listen: "Foundation locked." },
      { do: "Add closed hats on 8ths, open hat on the 'and' of 4.", listen: "Subdivision + pickup." },
      { do: "Add a shaker doing 3-3-2 syncopation.", listen: "Track now has feel." },
      { do: "Apply MPC-60 groove at 50%.", listen: "Stiffness softens." },
      { do: "Drop a reverse crash at bar 8.", listen: "Transition into the next 8 bars." },
    ],
    listenFor: ["Head-nod factor on drums alone.", "Each part occupying its own subdivision.", "Smooth transition out at bar 8."],
    mistakes: ["Adding harmony before rhythm grooves.", "Skipping the groove template step.", "No transition at the boundary — flat momentum."],
    proMoves: ["Bounce the 8-bar loop and listen on phone speakers — translation test.", "Save as a template for future starts.", "Document your tempo + groove choices for repeatability."],
    quizHard: [
      { q: "Best test of a rhythm-only loop?", options: ["Spectrum analyser readout", "Head-nod factor on small speakers", "LUFS measurement", "Bar count"], answer: 1 },
      { q: "Groove templates should typically be applied…", options: ["After all programming is done", "Before any programming", "Never", "Only to kicks"], answer: 0 },
      { q: "Best comparison method when referencing?", options: ["Match peaks", "Match LUFS loudness", "Match RMS only", "By eye"], answer: 1 },
    ],
  },

  // ============================================================
  // PATH 3 — MELODY
  // ============================================================
  "notes-and-octaves": {
    hook: "12 notes. They repeat forever. That's the whole musical alphabet.",
    beginner: {
      what: [
        "Western music uses exactly 12 pitched notes: C, C#, D, D#, E, F, F#, G, G#, A, A#, B. After B, you start over at C — one octave higher.",
        "An octave means the frequency has doubled. C4 (middle C) = 261.6 Hz. C5 one octave up = 523.2 Hz. They sound 'the same note' because the ratio is exactly 2:1.",
        "On a piano, you can see the pattern: groups of 2 black keys + 3 black keys repeating. Each repeat is one octave.",
      ],
      why: [
        "Every scale, chord, and melody is built from these 12 notes across octaves.",
        "Knowing octave registers lets you choose bass vs lead range deliberately.",
        "MIDI uses these same 12 names in 11 octaves (C-2 to G8).",
      ],
      analogy: "12 letters. Infinite copies stacked up the keyboard. Music is words made from those letters.",
    },
    advanced: {
      what: [
        "12-tone equal temperament (12-TET) divides the octave into 12 logarithmically equal steps. Each semitone is a frequency ratio of 2^(1/12) ≈ 1.0595. This compromise lets you play in any key without re-tuning, at the cost of every interval being slightly out of pure ratio.",
        "MIDI assigns a single integer to every semitone across roughly 11 octaves: C-1 = 0, middle C (C4) = 60, A4 = 69 (which is anchored to 440 Hz). The formula frequency_Hz = 440 × 2^((n−69)/12) lets you convert any MIDI note number to its exact pitch.",
        "Octave equivalence — the perceptual fact that frequency f and 2f belong to the 'same pitch class' — is the cornerstone of Western theory. It's why scale steps repeat every octave and why doubling a melody an octave up sounds like thickening, not new notes.",
        "Other tunings exist: just intonation uses small whole-number ratios (3:2 for a fifth) and sounds purer in one key but unusable in others; microtonal systems like 24-TET (quartertones) or 31-TET subdivide the octave further for sounds outside the Western palette.",
      ],
      edgeCases: [
        "Different DAWs use different middle-C conventions. Ableton Live calls middle C 'C3' (MIDI 60); Logic, Cubase, and most theory books call it C4. The MIDI number is the only unambiguous reference.",
        "Microtonal music subdivides the octave further (24-TET quartertones, Arabic maqam systems, Persian dastgah). MPE controllers and Scala-compatible synths support these tunings.",
        "Sub-bass below ~50 Hz disappears on phone speakers, laptop speakers, and earbuds — programming a bassline in the wrong octave can make it inaudible to half your audience.",
        "Octave-up doubling on a melodic line can sound thin if the upper note exceeds ~3 kHz, where the ear's pitch-resolution accuracy drops.",
      ],
      engineerNotes: [
        "Frequency of MIDI note n = 440 × 2^((n−69)/12). MIDI 69 = A4 = 440 Hz exactly.",
        "Cents are 1/100 of a semitone — 1200 cents per octave. Detune offsets on synths are usually expressed in cents.",
        "When layering bass + sub, keep them exactly one octave apart and the sub mono — anything else introduces phase cancellation in the low end.",
        "For melody doubling at the octave, low-pass the upper voice ~6 kHz to avoid harshness; for unison doubling, detune ±5–8 cents.",
      ],
    },
    flow: "Pitch class (one of 12) + Octave number → Specific frequency",
    walkthrough: [
      { do: "Play C across every octave on a synth keyboard.", listen: "Same letter, different registers, all clearly 'C'." },
      { do: "Play A4 (440 Hz) and A5 (880 Hz) together.", listen: "Two notes but they fuse — octave equivalence in action." },
      { do: "Transpose a melody up 12 semitones.", listen: "Identical shape, one octave higher." },
      { do: "Detune one oscillator −12 semitones from another playing the same line.", listen: "Instant 'fat octave' bass — the lower voice adds weight without changing notes." },
      { do: "Play C3, C4 and C5 simultaneously as a chord.", listen: "Open, hollow 'organ' sound — pure octave stacking with no harmonic colour." },
    ],
    listenFor: [
      "Octave fusion — same-named notes blending into one richer pitch.",
      "Bass octave choice changing weight without changing the notes.",
      "Higher octaves reading as 'brighter' instantly, with no EQ change.",
      "The point where octave-doubling gets thin (above ~3 kHz).",
    ],
    mistakes: ["Mixing up sharp and flat naming for the same key.", "Programming bass in the wrong octave (sub-50 Hz disappears on phones).", "Forgetting C3 vs C4 conventions between DAWs.", "Octave-doubling a bassline and not making the sub mono."],
    proMoves: ["Layer bass + sub one octave apart for fullness.", "Doubling a melody at the octave thickens it without harmonic ambiguity.", "Use octave shifts for instant arrangement variation.", "Use cents-level detune (±5–8 cents) for unison fatness without flagrant pitch drift."],
    quizHard: [
      { q: "MIDI note 60 is…", options: ["A4", "Middle C", "C0", "C6"], answer: 1, explain: "MIDI 60 is middle C regardless of DAW-specific labelling (C3 in Live, C4 elsewhere)." },
      { q: "Frequency ratio of one octave?", options: ["3:2", "2:1", "5:4", "4:3"], answer: 1 },
      { q: "How many semitones in an octave?", options: ["7", "8", "12", "13"], answer: 2 },
      { q: "Frequency of MIDI note 69?", options: ["220 Hz", "440 Hz", "880 Hz", "1760 Hz"], answer: 1, explain: "MIDI 69 = A4 = 440 Hz, the global tuning reference." },
      { q: "Highest-leverage early-career investment?", options: ["More plugins", "Templates + shortcut fluency", "Newer interface", "Studio monitors upgrade"], answer: 1 },
    ],
  },

  "note-finder": {
    hook: "Find any note on the keyboard in under 2 seconds.",
    beginner: {
      what: [
        "The piano layout repeats every octave: two black keys, three black keys, two black keys, three black keys. Use this pattern to find any note without counting from C every time.",
        "C is always the white key just left of the 2-black-key group. F is the white key just left of the 3-black-key group. From those two anchors, everything else falls into place.",
        "Sharps (#) are the black key just above a white key. Flats (b) are the black key just below. Same key, two names — depending on context.",
      ],
      why: [
        "Reading and playing piano roll demands instant note recognition.",
        "Quickly placing chord notes saves dozens of minutes per session.",
        "Knowing root notes is the basis of jamming and transposition.",
      ],
      analogy: "The keyboard is a city map. Once you know two landmarks (C and F), you can navigate everywhere.",
    },
    advanced: {
      what: [
        "Enharmonic spellings: C# = Db, D# = Eb, F# = Gb, G# = Ab, A# = Bb. Context (key signature) decides which name is correct.",
        "MIDI keyboards label C with a number; use that as your octave anchor.",
        "Piano roll editors in DAWs colour-code the C-keys for fast scanning.",
      ],
      edgeCases: ["E# = F and B# = C — exist in theory, rare in pop.", "Cb = B and Fb = E — also exist for correct key signatures."],
      engineerNotes: ["Configure your DAW's piano roll to highlight scale notes for the project key."],
    },
    flow: "Visual anchor (2 or 3 black keys) → Find C or F → Count semitones to target",
    walkthrough: [
      { do: "Find every C on the keyboard.", listen: "Same letter name across registers." },
      { do: "Name a random black key.", listen: "Use the anchor to identify it as sharp or flat." },
      { do: "Locate F# starting from the 3-black-key group.", listen: "Middle black key of three — that's F#." },
    ],
    listenFor: ["Speed of recognition improving.", "Anchor-based navigation feeling automatic."],
    mistakes: ["Counting from A every time — slow.", "Confusing sharps and flats in unfamiliar keys."],
    proMoves: ["Practice naming 10 random notes per day for a week.", "Set your DAW's MIDI editor to display note names always."],
    quizHard: [
      { q: "F# is enharmonically equivalent to…", options: ["Eb", "Gb", "Ab", "Bb"], answer: 1 },
      { q: "The white key just left of the 3-black-key group is…", options: ["C", "E", "F", "B"], answer: 2 },
    ],
  },

  "major-scale": {
    hook: "Seven notes. Cheerful, resolved, the default sound of Western music.",
    beginner: {
      what: [
        "A major scale is a set of seven notes that produces the familiar 'happy' or 'bright' sound. C major is the easiest to see: all white keys from C to the next C.",
        "The interval pattern (in semitones) is W W H W W W H — whole, whole, half, whole, whole, whole, half. Apply that pattern to any starting note and you get a major scale in that key.",
        "Every major scale has the same shape; only the starting note (the root or tonic) and which notes get sharps/flats change.",
      ],
      why: [
        "Most pop, EDM and film music sits in a major key.",
        "Picking the scale tells you which 7 notes are 'safe' for melody and chord building.",
        "DAW scale-lock features need you to choose a scale — major is the default.",
      ],
      analogy: "A scale is a colour palette. Major is the bright, sunny set.",
    },
    advanced: {
      what: [
        "Major scale intervals from root: 2, 2, 1, 2, 2, 2, 1 (semitones). Degrees numbered 1–7 (I–VII). Tonic = 1, supertonic = 2, mediant = 3, subdominant = 4, dominant = 5, submediant = 6, leading tone = 7.",
        "Modes derived by starting on each degree: Ionian (major), Dorian, Phrygian, Lydian, Mixolydian, Aeolian (natural minor), Locrian.",
        "Diatonic triads in major: I, ii, iii, IV, V, vi, vii° — the chord vocabulary of the key.",
      ],
      edgeCases: [
        "Modal mixture: borrowing chords from the parallel minor adds colour without leaving the key.",
        "Lydian (raised 4) sounds 'brighter' than Ionian — common in film cues.",
        "Major doesn't always mean 'happy' — context, rhythm and tempo override mode in modern music.",
      ],
      engineerNotes: [
        "Live's Scale device snaps incoming MIDI to a chosen scale — useful for safe improvisation.",
        "Major scale is the default reference — almost all theory books start here.",
      ],
    },
    flow: "Root + W W H W W W H interval pattern → 7-note scale",
    walkthrough: [
      { do: "Play all white keys C to C.", listen: "C major scale — bright and resolved." },
      { do: "Apply the same WWHWWWH pattern starting on G.", listen: "G major — sounds the same shape, but you needed F# to complete it." },
      { do: "Build a melody using only scale notes.", listen: "Cohesive, no 'wrong notes'." },
      { do: "Play C major up two octaves, then back down.", listen: "Whole–whole–half–whole–whole–whole–half — the shape is constant." },
      { do: "Transpose the same melody up a 5th to G major.", listen: "Identical mood, higher position — proves scale = relative pattern." },
    ],
    listenFor: ["The resolved feel of landing on the tonic (note 1).", "The pull of the leading tone (note 7) toward the tonic.", "Major as 'bright' compared to minor.",
      "Resolution onto the tonic feeling 'home'.",],
    mistakes: ["Using non-scale notes accidentally — sounds 'wrong' unless used as chromatic passing.", "Confusing key (scale + tonic) with mode (which scale degree is home).", "Building melody before choosing a key."],
    proMoves: ["Use scale lock plugins to enforce key.", "Visualise the W W H W W W H pattern on every key.", "Transpose your favourite melodies into 3 keys for practice."],
    quizHard: [
      { q: "Major scale interval pattern (semitones)?", options: ["2 2 1 2 2 2 1", "2 1 2 2 1 2 2", "1 2 2 1 2 2 2", "2 2 2 2 1 1 2"], answer: 0 },
      { q: "G major contains which sharp?", options: ["F#", "C#", "G#", "D#"], answer: 0 },
      { q: "The vii° chord in C major is…", options: ["B°", "Bm", "Bmaj7", "Bsus"], answer: 0 },
    ],
  },

  "minor-scale": {
    hook: "Same seven slots, different shape — and a whole different mood.",
    beginner: {
      what: [
        "A minor scale is also seven notes, but with a different interval pattern that produces a 'sad', 'serious' or 'dark' feeling. The natural minor pattern in semitones is W H W W H W W.",
        "A minor (all white keys from A to A) is the easiest example. It shares all the same notes as C major — they're 'relative' scales — but starting on A makes the whole feel shift.",
        "There are three flavours of minor: natural, harmonic (raised 7), and melodic (raised 6 and 7 going up, natural going down). Each adds a different colour.",
      ],
      why: [
        "Most emotional / cinematic / introspective music uses minor.",
        "Hip-hop, drill, trap, deep house often live in minor.",
        "Knowing minor doubles your usable harmonic palette.",
      ],
      analogy: "Same paints, different mixing recipe. Minor is the cool/moody version of the major palette.",
    },
    advanced: {
      what: [
        "Natural minor (Aeolian): W H W W H W W. Harmonic minor: raise 7 → W H W W H 3H 1H (creates augmented 2nd). Melodic minor ascending: raise 6 and 7; descending: revert to natural.",
        "Relative minor = same notes as a major scale starting on the 6th degree (A minor = C major).",
        "Parallel minor = same tonic, different notes (A minor ↔ A major).",
        "Diatonic triads in natural minor: i, ii°, III, iv, v, VI, VII.",
      ],
      edgeCases: [
        "Harmonic minor's V chord is major (because of the raised 7), giving stronger resolution — common in classical/cinematic.",
        "Mixing natural and harmonic minor freely is normal — composers swap as needed for cadence vs melodic flow.",
        "Melodic minor changes its 6th and 7th on the way down — common in jazz, rare in EDM.",
      ],
      engineerNotes: [
        "Set DAW scale to natural minor for default scale-lock; toggle to harmonic when writing dominant cadences.",
        "Most pop-minor songs use natural minor verses and harmonic V chord at the cadence.",
      ],
    },
    flow: "Root + W H W W H W W → natural minor; raise 7 → harmonic; raise 6+7 ascending → melodic",
    walkthrough: [
      { do: "Play A to A on white keys.", listen: "A natural minor — same notes as C major, very different feel." },
      { do: "Raise the 7th (G → G#).", listen: "Harmonic minor — exotic, classical sound." },
      { do: "Resolve G# → A.", listen: "Strong leading-tone pull characteristic of harmonic minor." },
      { do: "Play A natural minor, then A harmonic minor.", listen: "Raised 7th in harmonic minor adds tension on the leading tone." },
      { do: "Loop a single Am chord, improvise notes from A minor.", listen: "Stays inside the mood; no 'wrong' notes." },
    ],
    listenFor: ["Minor's darker, more serious feel vs major.", "Raised 7 creating a strong resolution pull.", "Relative-minor relationship sharing notes with major.",
      "Lowered 3rd as the defining minor colour.",],
    mistakes: ["Treating relative minor as 'just a different start' — the tonic changes everything.", "Forgetting to raise the 7 in harmonic minor cadences.", "Using melodic minor descending notes — switch back to natural."],
    proMoves: ["Borrow harmonic minor's V chord at cadences inside a natural-minor song.", "Modal mixture: use VI from minor inside major for nostalgic colour.", "Build minor melodies around the 5–1 cadence with raised 7."],
    quizHard: [
      { q: "Relative minor of C major is…", options: ["A minor", "D minor", "E minor", "F minor"], answer: 0 },
      { q: "Harmonic minor differs from natural minor by…", options: ["Raised 5", "Raised 6", "Raised 7", "Lowered 3"], answer: 2 },
      { q: "Natural minor interval pattern?", options: ["W H W W H W W", "W W H W W W H", "H W W H W W W", "W W W H W W H"], answer: 0 },
    ],
  },

  "intervals": {
    hook: "The distance between two notes is the building block of melody and harmony.",
    beginner: {
      what: [
        "An interval is the gap between two pitches, measured in semitones. C to D is 2 semitones (a major 2nd). C to G is 7 semitones (a perfect 5th). C to the next C is 12 semitones (an octave).",
        "Each interval has a name (minor 2nd, major 3rd, perfect 5th…) and a characteristic sound. Some sound consonant and stable (3rds, 5ths, 6ths). Some sound tense (2nds, 7ths). Some sound 'in motion' (4ths, tritones).",
        "Chords are stacks of intervals. Melodies are sequences of intervals. Once you hear intervals reliably, music starts to feel like Lego rather than magic.",
      ],
      why: [
        "Building chords by interval works in any key — no need to memorise each chord separately.",
        "Ear training is mostly interval training.",
        "Intervals carry consistent emotional weight across keys.",
      ],
      analogy: "Notes are letters; intervals are the syllables. Music is built from intervals, not isolated notes.",
    },
    advanced: {
      what: [
        "Interval qualities: perfect (unison, 4, 5, 8), major/minor (2, 3, 6, 7), augmented (raised), diminished (lowered).",
        "Interval inversion: invert any interval by subtracting from 9 — a 3rd inverts to a 6th, a 5th to a 4th. Major inverts to minor, perfect stays perfect.",
        "Consonance/dissonance hierarchy (approximate): unison/octave > P5 > 3rds/6ths > P4 > 2nds/7ths > tritone.",
      ],
      edgeCases: [
        "Tritone (augmented 4 / diminished 5) is the famous 'devil's interval' — strong tension demanding resolution.",
        "Compound intervals (9th, 11th, 13th) = simple interval + octave — same quality, different register.",
        "Octave equivalence: a M10 sounds like a M3 + octave — same name family, different register.",
      ],
      engineerNotes: [
        "Train ear with reference songs per interval (e.g., Jaws = minor 2nd, Star Wars = perfect 5th).",
        "Bass + melody octaves are intervals too — track the gap consciously.",
      ],
    },
    flow: "Two notes → Count semitones → Name interval → Hear its character",
    walkthrough: [
      { do: "Play C then G (7 semitones).", listen: "Perfect 5th — open, stable, strong." },
      { do: "Play C then F# (6 semitones).", listen: "Tritone — tense, unresolved." },
      { do: "Play C then E (4 semitones).", listen: "Major 3rd — sweet, characteristic of major chords." },
      { do: "Sing the first two notes of 'Twinkle Twinkle' (a perfect 5th).", listen: "Reference for hearing P5 anywhere." },
      { do: "Play a tritone (C → F#).", listen: "Unresolved, dissonant — the 'devil's interval' in old theory." },
    ],
    listenFor: ["The signature 'colour' of each interval.", "Consonance vs dissonance pull.", "Resolution patterns (tritone → 3rd is classic).",
      "Consonant intervals (P5, P4, M3) vs dissonant (m2, tritone, M7).",],
    mistakes: ["Counting wrong — semitones, not white keys.", "Confusing major and minor 3rd by ear (1 semitone difference).", "Treating tritone as 'wrong' instead of useful tension."],
    proMoves: ["Anchor each interval to a song you know.", "Practice singing intervals up and down from a reference pitch.", "Use intervals to construct chord voicings deliberately."],
    quizHard: [
      { q: "A perfect 5th is how many semitones?", options: ["5", "6", "7", "8"], answer: 2 },
      { q: "A tritone is how many semitones?", options: ["5", "6", "7", "8"], answer: 1 },
      { q: "Inverting a major 3rd gives…", options: ["Minor 6th", "Major 6th", "Perfect 4th", "Minor 3rd"], answer: 0 },
    ],
  },

  "pentatonic-scales": {
    hook: "Five notes. Always sounds good. The training-wheels scale that pros never put down.",
    beginner: {
      what: [
        "A pentatonic scale uses only 5 of the 7 notes from major or minor. By dropping the two 'risky' notes that cause the strongest dissonance, every remaining note sounds great over the key's chords.",
        "Major pentatonic: 1 2 3 5 6. Minor pentatonic: 1 b3 4 5 b7. That's it. Blues, rock, hip-hop, country, J-pop, anime soundtracks — all rely heavily on these five notes.",
        "Because there are no 'wrong' notes inside the scale, pentatonic is perfect for soloing, improvising, and writing melodies that always work.",
      ],
      why: [
        "Removes the fear of 'wrong notes' for beginners.",
        "Pro improvisers still default to pentatonic for safety.",
        "Foundation of nearly every guitar solo and vocal hook ever written.",
      ],
      analogy: "Pentatonic is the safe-mode of melody. You literally cannot pick a clashing note.",
    },
    advanced: {
      what: [
        "Major pentatonic is the major scale with the 4th and 7th degrees removed — exactly the two notes that form half-steps inside the scale (3→4 and 7→1). Removing them eliminates the strongest sources of dissonance, which is why no two notes inside major pentatonic ever form a minor 2nd.",
        "Minor pentatonic is the natural minor scale minus the 2nd and 6th (the half-steps in natural minor: 2→♭3 and 5→♭6). The result — 1 ♭3 4 5 ♭7 — sits perfectly over a minor key's i, iv, and v chords, and the ♭7 gives it the blue, modal character.",
        "Blues scale = minor pentatonic + ♭5 (the 'blue note'). That ♭5 is technically dissonant against most chords, which is exactly the point — it's the friction the genre was built on, and great blues phrases pass *through* it rather than landing on it.",
        "Pentatonics are interchangeable across diatonic chord changes because every note is a chord tone, an unambiguous extension, or a fourth/sixth. There's no tritone inside the scale, so harmonic 'wrongness' is structurally impossible.",
      ],
      edgeCases: [
        "Over a dominant 7 chord, mixolydian pentatonic (1 2 3 5 ♭7) works better than straight major pentatonic — the major 3 + ♭7 explicitly outlines the chord.",
        "Pentatonic over a fully-diminished or altered-dominant chord sounds flat — those chords need notes (♭9, ♭13) that pentatonic excludes by design.",
        "In modal jazz, soloing only on pentatonic flattens the mode's identity — mix in characteristic non-pentatonic notes (lydian's #4, dorian's 6) for colour.",
        "Pentatonic-everywhere can mask weak voice leading. The 'wrong' notes are often the strongest melodic motion when handled correctly.",
      ],
      engineerNotes: [
        "Live 12's Scale device has pentatonic presets in both Major and Minor flavours — instant safe-mode soloing on any MIDI track.",
        "The minor-pentatonic ♭3 → 1 fall is the building block of countless trap and drill melodies. Loop it under a long sustained pad and it sells the whole hook.",
        "When writing for vocal pitch correction (Auto-Tune, Melodyne), constraining the scale to pentatonic dramatically reduces audible 'flips' between notes the correction algorithm has to choose between.",
        "Pentatonic shapes on guitar map to the same five 'box positions' across all 12 keys — which is why guitarists rely on them for fast cross-key improvisation.",
      ],
    },
    flow: "Take major or minor scale → Remove the two half-step notes → 5 safe notes",
    walkthrough: [
      { do: "Play C major pentatonic (C D E G A) over a Cmaj7 chord pad.", listen: "Bright and song-like — no clashing notes." },
      { do: "Switch to A minor pentatonic (A C D E G) over an Am pad.", listen: "Bluesy, soulful, modal." },
      { do: "Add the blue note (E♭) and pass through it on the way to E.", listen: "Classic blues phrase territory — friction then resolution." },
      { do: "Improvise a melody using only the 5 notes over a I–IV–V progression in C.", listen: "Every phrase fits regardless of which chord is sounding." },
      { do: "Play the same shape one octave up, then doubled an octave below.", listen: "Hookable line, instantly orchestrated without changing notes." },
    ],
    listenFor: [
      "Absence of half-step tension — no biting minor 2nds.",
      "Hookable, easy-to-sing shapes that lodge in memory.",
      "The signature blue-note bend or grace note.",
      "Every phrase feeling like it could be 'the chorus'.",
    ],
    mistakes: ["Using major pentatonic over minor-key songs (avoid major 3 against minor 3).", "Sticking only to pentatonic forever — eventually add the missing scale notes for colour.", "Forgetting that pentatonic still has a tonic — phrases want to resolve to 1.", "Treating the blue note as a destination instead of a passing tone."],
    proMoves: ["Combine major + minor pentatonic over blues for the BB King sound.", "Use pentatonic for hooks and full scale for fills.", "Pentatonic + rhythmic syncopation = instant memorable melody.", "Constrain Scale device to pentatonic when sketching to write 'wrong-proof' melodies fast."],
    quizHard: [
      { q: "Minor pentatonic notes in scale degrees?", options: ["1 2 3 5 6", "1 ♭3 4 5 ♭7", "1 ♭3 5 ♭7 ♭9", "1 2 4 5 6"], answer: 1, explain: "1 ♭3 4 5 ♭7 — natural minor with the half-step-causing 2 and ♭6 removed." },
      { q: "Blues scale = minor pentatonic + which note?", options: ["♭2", "♭5", "♯5", "♭7"], answer: 1, explain: "♭5 is the 'blue note' — passes through to add bite without landing." },
      { q: "Why does pentatonic 'always work' over a key's chord changes?", options: ["It contains every possible note", "It excludes the half-steps inside the parent scale, eliminating the strongest dissonance", "It uses microtones", "It transposes itself automatically"], answer: 1, hint: "What gets removed, not what stays." },
    ],
  },

  "pentatonic-explorer": {
    hook: "Improvise a melody that works — guaranteed.",
    beginner: {
      what: [
        "This is the practical drill: pick a key, lock to its pentatonic scale, and improvise for two minutes over a backing track. Every note will work. Focus on rhythm and phrasing instead of fearing wrong notes.",
        "Vary phrase length: some short bursts, some long sustained notes. Vary register: jump up an octave for impact, drop down for weight. Let phrases breathe.",
        "Goal: stop thinking about which note to play. Start thinking about WHEN and HOW LONG.",
      ],
      why: [
        "Frees you from theory anxiety.",
        "Trains rhythm and phrasing — the parts of melody most beginners ignore.",
        "Produces usable hooks immediately.",
      ],
    },
    advanced: {
      what: [
        "Call-and-response phrasing: 2 bars of 'question', 2 bars of 'answer' that resolves to the tonic.",
        "Motivic development: state a 2-3 note motif, repeat with variation (transpose, invert, augment).",
        "Resolve key phrases on chord tones (1, 3, 5) for satisfying landings.",
      ],
      edgeCases: ["Avoid landing every phrase on the tonic — predictable. Mix in 3rd and 5th landings.", "Don't run pentatonic up-and-down scales — sounds like exercises."],
      engineerNotes: ["Record everything — happy accidents become hooks.", "Quantise lightly to keep the human feel."],
    },
    flow: "Backing track → Lock to pentatonic → Improvise short phrases → Develop motifs → Resolve",
    walkthrough: [
      { do: "Loop a 4-chord progression in C major.", listen: "Backing for improvisation." },
      { do: "Play C major pentatonic phrases — short, breathing, varied.", listen: "Every note works." },
      { do: "Build a 4-note motif and develop it.", listen: "Repetition creates a hook." },
    ],
    listenFor: ["Phrasing breath between ideas.", "Motivic repetition with small changes.", "Resolution on chord tones."],
    mistakes: ["Playing constantly — no space.", "All same register / same rhythm.", "Never resolving — phrases hang."],
    proMoves: ["Sing the phrase before playing it.", "Record long takes and edit the best 16 bars.", "Force yourself to use only 3 notes for a minute — limits create creativity."],
    quizHard: [
      { q: "Best phrase landing note for resolution?", options: ["Any non-scale note", "The tritone", "Chord tone (1, 3, 5)", "The b9"], answer: 2 },
      { q: "Motivic development means…", options: ["Random new ideas every bar", "Restating an idea with variation", "Avoiding repetition", "Only major pentatonic"], answer: 1 },
    ],
  },

  "melody-writing": {
    hook: "A great melody is rhythm first, contour second, notes third.",
    beginner: {
      what: [
        "Melody is the part you hum after the song ends. It has a rhythm (when each note happens), a contour (the up-and-down shape over time), and a note selection (which pitches fill that shape).",
        "Most beginners obsess over notes and forget contour and rhythm. But ask anyone to sing 'Happy Birthday' — they remember the shape (up, up, down, down) before they remember the exact notes.",
        "Write the rhythm first. Then sketch the contour. Then pick scale-friendly notes to fit the contour. The result will be memorable.",
      ],
      why: [
        "Memorable melodies are how people remember your song.",
        "Catchy melody trumps complex harmony in pop.",
        "Strong contour reads across instruments — a good melody works on piano, guitar, vocal, or synth.",
      ],
      analogy: "Melody is a story. Rhythm = pacing. Contour = plot arc. Notes = exact words.",
    },
    advanced: {
      what: [
        "Effective melodies use: limited range (often 1 octave), repeated motifs, balanced contour (ups balance downs), and rhythmic variety against repeated pitch material.",
        "Cadence: melodies resolve to chord tones at phrase ends, especially the tonic on final cadence.",
        "Use the rule of 3: state, restate (slight variation), depart (contrasting phrase) — universal phrase structure.",
      ],
      edgeCases: [
        "Melodies that span too wide become unsingable — most pop melodies sit within 9 semitones.",
        "Too much stepwise motion = boring; too many leaps = unstable. Balance is key.",
        "Wide leaps (>P5) are memorable but exhausting — balance with stepwise motion.",
      ],
      engineerNotes: [
        "Sing the melody before playing it on an instrument — singable = memorable.",
        "Strip the melody to its rhythm only — if that grooves, you're 80% there.",
      ],
    },
    flow: "Rhythmic phrase → Contour sketch → Scale-friendly notes → Cadence on tonic",
    walkthrough: [
      { do: "Tap a 4-bar rhythm on a table.", listen: "That's the melodic rhythm." },
      { do: "Hum a contour matching that rhythm — up, down, up, end low.", listen: "Shape is set." },
      { do: "Play the shape using scale notes, resolving to the tonic.", listen: "You have a melody." },
      { do: "Write a 4-bar phrase that ends on the tonic.", listen: "Sense of completion." },
      { do: "Repeat the phrase but end on the 2nd degree.", listen: "Open, unresolved — invites a continuation." },
    ],
    listenFor: ["Singability — can you hum it after one listen?", "Phrase rule of 3 (state, restate, depart).", "Strong cadential resolution.",
      "Contour: where the melody peaks and how it descends.",],
    mistakes: ["Writing melodies on the keyboard before checking if they're singable.", "All stepwise motion — sounds like a scale exercise.", "Too-wide range — listeners can't follow."],
    proMoves: ["Steal rhythm from spoken phrases for melodies.", "Constrain melody to 5 notes (pentatonic) when stuck.", "Test melody by humming it 6 hours later — if it sticks, it's strong."],
    quizHard: [
      { q: "Most singable pop melodies span at most…", options: ["3 semitones", "9 semitones", "2 octaves", "3 octaves"], answer: 1 },
      { q: "Phrase 'rule of 3' typically follows…", options: ["State, restate, depart", "Verse, chorus, bridge", "Tonic, dominant, tonic", "1, 4, 5"], answer: 0 },
      { q: "A melody resolving onto scale degree 1 creates…", options: ["Tension", "Resolution / arrival", "Modulation", "Syncopation"], answer: 1 },
    ],
  },

  "ear-training": {
    hook: "Train your ear and music stops being magic — it becomes pattern recognition.",
    beginner: {
      what: [
        "Ear training is the practice of recognising intervals, chord qualities, scale degrees and rhythms by ear instead of guessing. It is the single highest-leverage music skill — pros are pros because they can hear what's happening.",
        "Start simple: identify whether two notes are 'close' or 'far apart', then narrow down to specific intervals. Anchor each interval to a song you already know (Jaws = minor 2nd, Twinkle Twinkle = perfect 5th).",
        "Five minutes a day for three months will radically change how you make music.",
      ],
      why: [
        "Sampling, remixing and transcribing all rely on ear skills.",
        "Hearing what you imagine and playing it back becomes possible.",
        "Mixing decisions become more confident when your ear is trained.",
      ],
      analogy: "Ear training is like learning to taste wine. The more you do it, the more flavours you notice automatically.",
    },
    advanced: {
      what: [
        "Functional ear training: identify scale degrees relative to the tonic, not absolute pitches. Hear 'that's the 6' rather than 'that's an A in C major'.",
        "Chord quality identification: major / minor / diminished / augmented / dominant 7 / minor 7 / major 7 — each has a fingerprint.",
        "Apps and exercises: tonedear, EarMaster, custom Live racks. Daily practice beats long sessions.",
      ],
      edgeCases: ["Absolute (perfect) pitch is rare and not necessary — relative pitch covers all practical work.", "Train on different timbres — interval recognition on piano doesn't always transfer to synth.",
      "Perfect pitch is rare and not required — relative pitch (intervals from a reference) is what producers actually use.",],
      engineerNotes: ["Sing back what you hear before checking — active recall beats passive listening.", "Record yourself singing scale degrees over chord progressions."],
    },
    flow: "Reference song → Recognise interval → Sing back → Verify on instrument",
    walkthrough: [
      { do: "Play a major 3rd and a minor 3rd back to back.", listen: "Major = brighter; minor = darker. Train the gut response." },
      { do: "Pick a song. Sing the bassline. Then find it on a keyboard.", listen: "You're decoding what your ear hears." },
      { do: "Identify the scale degree of the chorus first note in 5 songs.", listen: "Pattern emerges — pop songs cluster on 1, 3 and 5 starts." },
      { do: "Play C, then sing 'so' (G) without checking.", listen: "Test your internal 5th." },
      { do: "Identify the bass note of a loaded track by ear.", listen: "Confirm against a tuner — repeat daily." },
    ],
    listenFor: ["Interval fingerprints becoming automatic.", "Chord quality identification within 2 seconds.", "Hearing the tonic in any song within 8 bars.",
      "Interval colours becoming instinctive after weeks of drills.",],
    mistakes: ["Practising once a week — daily 5 minutes beats weekly 1 hour.", "Only using one app/timbre — generalise across sources.", "Skipping singing — passive listening doesn't lock in pitches."],
    proMoves: ["Transcribe one chorus per week — fastest way to grow.", "Sing before you play during composition.", "Train in your project key all month — your ear becomes hyper-tuned to that key."],
    quizHard: [
      { q: "Relative pitch is the ability to…", options: ["Name any note in absolute frequency", "Identify intervals and scale degrees relative to a reference", "Play in any key", "Tune by ear"], answer: 1 },
      { q: "Best daily ear-training duration?", options: ["1 hour weekly", "5 min daily", "30 min monthly", "None — passive listening is enough"], answer: 1 },
      { q: "Relative pitch is…", options: ["Naming notes without a reference", "Hearing intervals from a known note", "Reading sheet music", "Tuning by ear"], answer: 1 },
    ],
  },

  "transposition-modes": {
    hook: "Move a melody by a fixed interval, or change which scale degree feels like home.",
    beginner: {
      what: [
        "Transposition means moving every note in a melody up or down by the same interval. C major to G major: every note shifts up 7 semitones. The shape stays identical; only the key changes.",
        "Modes are a different beast: same notes, different tonic. C Ionian = C major. D Dorian uses the same notes but starts on D — and the resulting 'home' shifts the feel from bright to mysterious.",
        "Both are tools for getting more out of the material you already wrote. Transpose to find a key that suits a vocalist; switch modes for instant mood change without learning new chords.",
      ],
      why: [
        "Transposition lets you fit a melody to a singer's range.",
        "Modes give 7 different moods from one scale.",
        "Modulation between keys creates dramatic lifts (key change in a final chorus).",
      ],
      analogy: "Transposition = move the whole painting to a different wall. Modes = look at the same painting from a different angle.",
    },
    advanced: {
      what: [
        "Transposition preserves all intervallic relationships — chord progressions, melodic shape, tension levels remain identical.",
        "Modes of major: Ionian (1), Dorian (2), Phrygian (3), Lydian (4), Mixolydian (5), Aeolian (6), Locrian (7). Each has a characteristic 'avoid note' relative to its tonic.",
        "Modulation techniques: pivot chord (a chord common to both keys), direct (no pivot — abrupt lift), and chromatic (semitone shift, common in pop choruses).",
      ],
      edgeCases: [
        "Modal progressions need to avoid the dominant V-i cadence (which always pulls toward Ionian/Aeolian) — use IV or bVII instead.",
        "Some keys (F#, Db) are uncomfortable on certain instruments — transpose with playability in mind.",
        "MIDI transpose preserves notes; audio transpose changes formants — vocals stretched too far sound chipmunked.",
      ],
      engineerNotes: [
        "Live's MIDI Transform → Pitch can transpose all selected notes instantly.",
        "Use a Scale device to swap modes without rewriting MIDI — change the scale, not the notes.",
      ],
    },
    flow: "Original key/mode → Transpose by N semitones OR Shift tonic to new scale degree → Same notes, new identity",
    walkthrough: [
      { do: "Write a C major melody, then transpose +5 semitones (to F major).", listen: "Identical melody, higher register, same key feel." },
      { do: "Keep the same notes but treat D as tonic.", listen: "D Dorian — same notes, jazzier, less bright." },
      { do: "Modulate from C to D for a final chorus.", listen: "Energy lifts immediately." },
      { do: "Take a C major melody, shift +5 semitones (to F major).", listen: "Same melody, new key — singer comfort or vibe shift." },
      { do: "Play C major notes over a D bass.", listen: "D Dorian mode — same notes, different tonal centre." },
    ],
    listenFor: ["Range shift via transposition.", "Mood shift via mode change despite identical notes.", "Pop chorus key-up lift.",
      "Modal flavour shifting as the tonic moves through the same set of notes.",],
    mistakes: ["Transposing only the melody but leaving chords in the original key.", "Modal progressions accidentally pulling back to major V-I.", "Modulating without setting it up — sounds random."],
    proMoves: ["Transpose to test different keys before committing.", "Modal mixture inside one section for colour.", "Pivot chords for smooth modulation."],
    quizHard: [
      { q: "D Dorian uses the notes of which major scale?", options: ["C major", "D major", "G major", "A major"], answer: 0 },
      { q: "Modulation up one semitone in a final chorus is called…", options: ["Pivot modulation", "Chromatic / 'truck driver' modulation", "Enharmonic modulation", "Modal mixture"], answer: 1 },
      { q: "Dorian mode is built starting on which degree of the major scale?", options: ["1st", "2nd", "5th", "6th"], answer: 1 },
    ],
  },

  "key-changer": {
    hook: "Capstone for Melody — write a 16-bar melody, then transpose and modulate it.",
    beginner: {
      what: [
        "Time to combine everything from the Melody path: pick a key, write a singable 16-bar melody with rule-of-3 phrasing, then transpose it to two new keys, and finally modulate the last 4 bars up one semitone for a lift.",
        "If the melody works in all three keys, the shape is genuinely good — not just key-dependent.",
        "Goal: prove your melody writing is structural, not accidental.",
      ],
      why: ["Tests melody, transposition, and modulation in one practical drill.", "Builds confidence that good melodies translate across keys.", "Standard pop-production move."],
    },
    advanced: {
      what: ["Capstone: compose 4-phrase melody (statement, restatement, departure, cadence), transpose entire phrase set up a 5th, then modulate the final cadence up a semitone with a chromatic lift.", "Verify singability in each transposition (vocal range checks)."],
      edgeCases: ["Avoid awkward keys for the singer.", "Modulate at a strong structural moment (end of chorus, not mid-phrase)."],
      engineerNotes: ["Use Live's MIDI Transform for instant transposition.", "Save each transposition as a separate clip for A/B."],
    },
    flow: "Compose → Transpose → Modulate → Cadence",
    walkthrough: [
      { do: "Write 16 bars in C major with 4-phrase structure.", listen: "Strong singable hook." },
      { do: "Transpose to G major.", listen: "Same shape, higher register." },
      { do: "Modulate final 4 bars to C# major.", listen: "Energy lifts." },
    ],
    listenFor: ["Hook strength surviving transposition.", "Smooth modulation.", "Strong final cadence."],
    mistakes: ["Modulating mid-phrase.", "Forgetting to transpose harmony too.", "Choosing keys outside vocal range."],
    proMoves: ["Test in 3 keys before locking final.", "Save modulated version as 'climax variant'."],
    quizHard: [
      { q: "Best place to modulate up a semitone?", options: ["Mid-verse", "End of final chorus into outro", "Beat 2 of bar 1", "Random"], answer: 1 },
      { q: "Capstone melody should pass which test?", options: ["Sounds good only in original key", "Works across multiple keys", "Uses only triplets", "Requires 5 instruments"], answer: 1 },
    ],
  },

  // ============================================================
  // PATH 4 — HARMONY
  // ============================================================
  "what-are-chords": {
    hook: "Stack two or more notes — that's a chord. Stack the right ones — that's harmony.",
    beginner: {
      what: [
        "A chord is two or more notes played simultaneously. The most common chord type is the triad — three notes stacked in 3rds (skip one scale note each time). A C major triad is C-E-G: count C, skip D, take E, skip F, take G.",
        "Three things define how a triad sounds. The bottom note (the root) names the chord. The middle note (the 3rd) decides whether it's major (bright) or minor (dark). The top note (the 5th) gives it weight and stability.",
        "Almost every song you've heard is built from a sequence of chords. Pop usually moves between 3–5 chords for the whole song; jazz might use 50. Choose the chords well and the song writes itself — your melody gains an emotional context the moment a chord plays under it.",
        "Chord families: major triads sound happy, minor triads sound sad, diminished triads sound tense and unresolved, and augmented triads sound dreamy or unsettling. These four flavours are the entire colour wheel of basic harmony.",
      ],
      why: [
        "Chords carry emotion — major = bright, minor = dark, diminished = tense, augmented = floating.",
        "Most progressions reuse a handful of patterns (I-V-vi-IV, ii-V-I) across thousands of songs.",
        "Chords give a melody its context — the same notes feel triumphant over a major chord and melancholy over a minor one.",
        "Knowing chords unlocks reading chord charts, accompanying singers, and writing without having to invent everything from scratch.",
      ],
      analogy: "If a melody is a sentence, chords are the tone of voice it's spoken in. Same words, totally different meaning.",
    },
    advanced: {
      what: [
        "Triad construction: stack two 3rds above the root. Major = major 3rd + minor 3rd. Minor = minor 3rd + major 3rd. Diminished = two minor 3rds. Augmented = two major 3rds.",
        "Seventh chords add a 3rd above the triad: maj7 (1-3-5-7), min7 (1-♭3-5-♭7), dom7 (1-3-5-♭7), m7♭5 / half-diminished (1-♭3-♭5-♭7), dim7 (1-♭3-♭5-𝄫7). Each carries a distinct emotional fingerprint.",
        "Voicing — the specific arrangement of notes across octaves, including doublings, omissions, and inversions — changes a chord's character far more than people expect. Drop-2 voicings, shell voicings, and quartal voicings all describe the same triad with radically different colour.",
        "Extensions (9, 11, 13) reach above the 7th and add the modal flavour of jazz and neo-soul. ♯11 = lydian; ♭9 = altered dominant; 13 = mixolydian colour. Each tells a key story the basic triad can't.",
      ],
      edgeCases: [
        "Inversions: root, 1st (3rd in bass), 2nd (5th in bass), 3rd (7th in bass for 7-chords) — change the bass line without changing chord function.",
        "Open vs close voicing: open spreads notes across registers for orchestral fullness; close stacks them tightly within an octave for piano-like density.",
        "Avoid stacking a major 3rd in the bass register (below ~E2) — the harmonic series creates muddy beating that masks the chord identity.",
        "Suspended chords (sus2, sus4) replace the 3rd entirely, so they're neither major nor minor — ideal as ambiguous transitions.",
      ],
      engineerNotes: [
        "Avoid doubling the 3rd in major chords (sounds heavy); double the root or 5th instead.",
        "Bass note = perceived root regardless of voicing above. A C/E (C major with E in the bass) reads as 'lighter C' rather than as an E chord.",
        "Voice leading: move each voice the smallest distance between chords for smoothness — a half-step is smoother than a leap of a 4th.",
        "When MIDI-programming pads, low-pass the upper voices ~6 kHz and high-pass below 80 Hz to keep room for kick and bass.",
      ],
    },
    flow: "Root + 3rd + 5th → triad → optional 7th, 9th → voicing decisions",
    walkthrough: [
      { do: "Play C-E-G (C major triad).", listen: "Bright, resolved, complete." },
      { do: "Play C-E♭-G (C minor triad).", listen: "Dark, sad — one note changed the whole emotion." },
      { do: "Play E-G-C (1st inversion C major).", listen: "Same chord, lighter feel because of E in bass." },
      { do: "Add the 7th: play C-E-G-B (Cmaj7).", listen: "Jazzy, dreamy — same chord with a glow added on top." },
      { do: "Voice it open: C in the bass, then E-G-B an octave higher.", listen: "Wider, more orchestral than the close voicing." },
    ],
    listenFor: [
      "Major vs minor flipping the entire mood with one note change.",
      "Inversion changing the bass line without changing chord function.",
      "7ths adding 'jazz' colour without changing the chord's name.",
      "Voicing spread changing 'thin keyboard chord' into 'huge orchestral chord'.",
    ],
    mistakes: ["Always playing chords in root position — bass becomes static.", "Doubling the 3rd in major triads.", "Skipping voice leading — chords sound disconnected.", "Stacking dense voicings low in the register — turns to mud."],
    proMoves: ["Use inversions to make a stepwise bass line under chord progressions.", "Add 7ths to give pop progressions a soulful colour.", "Voice chords differently between verse and chorus for arrangement contrast.", "Drop the 5th when adding extensions — it's the least missed note."],
    quizHard: [
      { q: "A major triad consists of which intervals from the root?", options: ["Maj 3rd + Min 3rd", "Min 3rd + Maj 3rd", "Two Maj 3rds", "Two Min 3rds"], answer: 0, explain: "Major = major 3rd then minor 3rd on top." },
      { q: "A 1st-inversion C major chord has which note in the bass?", options: ["C", "E", "G", "B"], answer: 1 },
      { q: "Diminished triad = root + …", options: ["Maj 3 + Perfect 5", "Min 3 + Diminished 5", "Maj 3 + Augmented 5", "Min 3 + Perfect 5"], answer: 1 },
      { q: "Why is doubling the 3rd in a major triad usually avoided?", options: ["It's illegal in classical theory", "It sounds heavy and over-defines the chord quality", "It causes phase cancellation", "Modern DAWs filter it out"], answer: 1, hint: "Think balance, not rules." },
    ],
  },

  "chord-builder": {
    hook: "Build any chord on any root from a tiny recipe — no memorisation needed.",
    beginner: {
      what: [
        "Every chord type is a formula in semitones from the root. Major triad = 0, 4, 7. Minor triad = 0, 3, 7. Dom7 = 0, 4, 7, 10. Memorise the formulas, not the chords themselves.",
        "Pick a root note, count up semitones for each formula step, and you've built the chord. Works in every key, no exceptions.",
        "Once you know the formulas, you can build chords on the fly during a session instead of reaching for chord charts.",
      ],
      why: ["Frees you from memorising chord names in 12 keys.", "Lets you build any extended chord (9, 11, 13) on the spot.", "Foundation of chord substitution and re-harmonisation."],
      analogy: "Chord formulas are like cooking measurements: 1 cup flour, 2 tsp sugar. The recipe doesn't change just because you're using a different bowl.",
    },
    advanced: {
      what: [
        "Formula table (semitones from root): maj = 0 4 7, min = 0 3 7, dim = 0 3 6, aug = 0 4 8, sus2 = 0 2 7, sus4 = 0 5 7, maj7 = 0 4 7 11, dom7 = 0 4 7 10, min7 = 0 3 7 10, m7b5 = 0 3 6 10, dim7 = 0 3 6 9.",
        "Extensions: 9 = 14, 11 = 17, 13 = 21 (or octave-reduced as 2, 5, 6).",
        "Slash chords (C/E) specify a non-root bass note — used for stepwise bass lines.",
      ],
      edgeCases: ["Dominant 9th typically omits the 11 to avoid clash with the 3rd.", "Half-diminished (m7b5) and fully diminished (dim7) sound similar but function differently."],
      engineerNotes: ["MIDI chord plugins build chords from formulas — useful as scaffolding.", "Drop voicings (drop 2, drop 3) take close voicings and move one note down an octave for a wider sound."],
    },
    flow: "Root + semitone formula → All notes of the chord → Voicing decisions",
    walkthrough: [
      { do: "Build C minor 7: C + 3 + 4 + 3 semitones = C Eb G Bb.", listen: "Smooth minor 7th chord." },
      { do: "Repeat formula on F: F Ab C Eb.", listen: "F minor 7 — same flavour, different root." },
      { do: "Build a Cmaj9 by adding 14 semitones to root.", listen: "Lush jazz colour." },
    ],
    listenFor: ["Formula portability across all roots.", "Extension flavours (9, 11, 13).", "Sus chords as 'in-between' colours."],
    mistakes: ["Memorising chord names in each key instead of formulas.", "Stacking too many extensions — diminishing returns past 13.", "Forgetting that voicing matters as much as note selection."],
    proMoves: ["Drill formulas for 1 chord type per day across all 12 roots.", "Use slash chords for stepwise bass under static harmony.", "Drop voicings for piano-style chord melodies."],
    quizHard: [
      { q: "Semitone formula for a min7 chord?", options: ["0 4 7 11", "0 3 7 10", "0 3 6 9", "0 4 7 10"], answer: 1 },
      { q: "A sus4 chord has which notes from root?", options: ["0 3 7", "0 4 7", "0 5 7", "0 2 7"], answer: 2 },
    ],
  },

  "chord-types": {
    hook: "Each chord quality carries a feeling — learn them all to widen your palette.",
    beginner: {
      what: [
        "Chord quality describes the chord's flavour. The five main families are: major (bright), minor (dark), dominant 7 (bluesy, tense), suspended (open, neutral), and diminished/augmented (tense, leading somewhere).",
        "Each family has a function: major and minor are 'home' chords. Dominant 7 wants to resolve. Suspended is neutral. Diminished/augmented are transition chords.",
        "Choosing the right quality at the right moment is what makes a chord progression feel intentional rather than random.",
      ],
      why: ["Different qualities = different emotions.", "Mixing qualities creates motion in a progression.", "Same notes in a different quality can completely change a song's mood."],
      analogy: "Chord qualities are colour temperatures. Major = warm. Minor = cool. Diminished = electric. Suspended = neutral grey.",
    },
    advanced: {
      what: [
        "Quality functions in tonal harmony: I and IV = tonic/subdominant (stable). V and vii° = dominant (tension). ii and vi = predominant (transition). iii = ambiguous (often substitutes for I).",
        "7th-chord families: maj7 (lush), min7 (smooth), dom7 (tense, wants to resolve), m7b5 (haunting), dim7 (highly tense).",
        "Extended/altered: 9, 11, 13, b9, #9, #11, b13 — each adds a specific colour, mostly used in jazz and neo-soul.",
      ],
      edgeCases: ["Sus chords don't have a 3rd — they don't read as major or minor until resolved.", "Augmented triads divide the octave symmetrically — three different roots, same notes.",
      "Power chords (root + 5th, no 3rd) are mode-neutral — they sit comfortably in major or minor contexts.",],
      engineerNotes: ["Roman numeral analysis lets you transpose progressions between keys easily (I-V-vi-IV in any key)."],
    },
    flow: "Pick quality → Place in progression → Listen for function",
    walkthrough: [
      { do: "Play Cmaj7, Cm7, C7, Csus4, Cdim7 in sequence.", listen: "Five totally different moods from the same root." },
      { do: "Replace one chord in a progression with a different quality.", listen: "Whole feel shifts." },
      { do: "Play a I-V-vi-IV in C using only triads, then again with 7th chords.", listen: "Triads = pop; 7ths = R&B / neo-soul." },
      { do: "Play C major, C minor, C diminished, C augmented in sequence.", listen: "Four moods from one root by altering 3rd and 5th." },
      { do: "Add a 7th to each.", listen: "Maj7 dreamy, m7 smooth, dim7 unstable, dominant 7 itching to resolve." },
    ],
    listenFor: ["Quality changing emotional register.", "Dominant 7 demanding resolution.", "Suspended chords as transitions.",
      "How the 3rd flips the entire emotional weight of the chord.",],
    mistakes: ["Using only major and minor — palette stays narrow.", "Overusing 7ths in punchy pop contexts.", "Forgetting that dim/aug chords need resolution."],
    proMoves: ["Substitute a vi7 for a I to add R&B colour without changing the progression.", "Use sus4 → maj as a delayed resolution for impact.", "Try a tritone substitution (replace V with bII7) for jazz spice."],
    quizHard: [
      { q: "Which chord quality typically demands resolution?", options: ["Major triad", "Suspended", "Dominant 7", "Major 7"], answer: 2 },
      { q: "An augmented triad divides the octave into…", options: ["Two equal halves", "Three equal thirds", "Four equal fourths", "Six equal sixths"], answer: 1 },
      { q: "A diminished triad consists of…", options: ["Root, m3, P5", "Root, M3, P5", "Root, m3, ♭5", "Root, M3, #5"], answer: 2 },
    ],
  },

  "chord-progressions": {
    hook: "Four chords. Thousands of songs. Progressions are the structural skeleton of pop.",
    beginner: {
      what: [
        "A chord progression is a sequence of chords played in order. Some progressions are so common they appear in hundreds of hit songs — I-V-vi-IV (the 'Axis' progression) is probably the most famous.",
        "Roman numerals (I, ii, iii, IV, V, vi, vii°) name chords by their scale degree, so you can talk about progressions independently of key. 'I-V-vi-IV' works in C, G, Eb, or any key.",
        "Learning 5–10 standard progressions covers 80% of pop, rock and EDM. Then you can deviate intentionally for character.",
      ],
      why: ["Progressions provide forward motion and resolution.", "Common progressions are familiar — listeners predict and feel rewarded.", "Lets you transpose songs and reharmonise easily."],
      analogy: "Progressions are like recipes for an emotional journey. Each chord is an ingredient, and the order matters.",
    },
    advanced: {
      what: [
        "Functional harmony cycle: tonic (I, vi) → predominant (ii, IV) → dominant (V, vii°) → tonic. Most progressions traverse this cycle once or multiple times per phrase.",
        "Common patterns: I-IV-V (12-bar blues), I-V-vi-IV (Axis), ii-V-I (jazz cadence), I-vi-IV-V (50s doo-wop), vi-IV-I-V (sad pop).",
        "Reharmonisation = replacing chords while keeping the melody. Substitution rules: any I can become iii or vi; any V can become vii° or bII7.",
      ],
      edgeCases: ["Modal progressions (I-bVII-IV-I etc.) don't follow major-key cadential logic — they cycle without resolution.", "Modulation between progressions creates section change feel.",
      "Modal progressions (e.g. Dorian i–IV) avoid the classical V–I cadence and feel suspended.",],
      engineerNotes: ["Use Roman numerals when discussing chords with collaborators in any key.", "Loop one progression for a whole track — variation comes from rhythm, melody, arrangement, not chord changes."],
    },
    flow: "Tonic → Predominant → Dominant → Tonic → loop",
    walkthrough: [
      { do: "Loop I-V-vi-IV in C major (C-G-Am-F).", listen: "Instantly recognisable pop progression." },
      { do: "Try vi-IV-I-V in same key (Am-F-C-G).", listen: "Sadder, more cinematic." },
      { do: "Add 7ths to all four chords.", listen: "Same progression, neo-soul colour." },
      { do: "Loop I–V–vi–IV in C major.", listen: "Most-used pop progression ever; instant familiarity." },
      { do: "Swap the IV for a iv (minor IV).", listen: "Bittersweet colour from a single semitone change." },
    ],
    listenFor: ["Resolution pull on V → I.", "Familiarity of common progressions.", "Mood shift when reordering same chords.",
      "Functional pull from V back to I.",],
    mistakes: ["Changing chords every bar without thinking about cadential rhythm.", "Skipping dominant function — progressions feel unresolved.", "Always starting on I — try starting on IV or vi."],
    proMoves: ["Borrow chords from parallel minor for unexpected colour.", "Use ii-V-I cadences at section endings.", "Loop one strong 4-chord progression for an entire song — invest the variety elsewhere."],
    quizHard: [
      { q: "The 'Axis' progression is…", options: ["I-IV-V", "I-V-vi-IV", "ii-V-I", "I-vi-IV-V"], answer: 1 },
      { q: "In C major, the chord 'V' is…", options: ["F", "G", "Am", "Bdim"], answer: 1 },
      { q: "A ii-V-I in F major is…", options: ["Gm-C-F", "Am-Dm-G", "Dm-G-C", "Bb-C-F"], answer: 0 },
    ],
  },

  "keys-tonality": {
    hook: "A key is a home base. Everything in the song points back to it.",
    beginner: {
      what: [
        "The key of a song is the scale + tonic that everything resolves to. 'C major' means the song uses C major scale notes and feels resolved on a C major chord.",
        "Tonality is the broader sense of having a home base. Tonal music has clear pull toward the tonic; atonal music intentionally avoids that pull.",
        "Most pop and electronic music is firmly tonal. Knowing the key tells you which notes are safe and which chords function as home, departure, and tension.",
      ],
      why: ["Picking a key sets the safe note/chord palette.", "Mixing decisions (EQ for vocal range) follow the key.", "DJ key compatibility (Camelot wheel) is built on keys."],
      analogy: "The key is your home address. Every musical journey starts and ends there.",
    },
    advanced: {
      what: [
        "Key signature = the set of sharps/flats notated. C major / A minor = no sharps or flats; G major / E minor = one sharp (F#); F major / D minor = one flat (Bb), etc.",
        "Relative vs parallel: relative minor of C major = A minor (same notes); parallel minor = C minor (same tonic).",
        "Modulation = changing key mid-song. Pivot, direct, and chromatic modulations differ in how abrupt the change feels.",
      ],
      edgeCases: ["Key can be ambiguous in modal or chromatic music — listener may flip-flop perception.", "Pop songs sometimes blur major and minor (modal mixture) without truly modulating.",
      "Some tracks are ambiguous (modal interchange, no clear cadence) — analysers can be wrong.",],
      engineerNotes: ["Detect key by ear: find the chord/note the song resolves to. Detect with tools: KeyFinder, Mixed In Key.", "DJ Camelot wheel uses 1A–12B notation for harmonic mixing."],
    },
    flow: "Tonic + scale → Key → Defines safe notes and chord functions",
    walkthrough: [
      { do: "Listen to a pop song's intro. Find which note the chorus resolves to.", listen: "That's the tonic." },
      { do: "Identify whether the resolution chord is major or minor.", listen: "That tells you major or minor key." },
      { do: "Try playing the relative minor scale over the same chord progression.", listen: "Notes work because they share the key." },
      { do: "Detect the key of a favourite track in Live's analysis.", listen: "Cross-check by humming the root over the chorus." },
      { do: "Modulate up a semitone for the last chorus.", listen: "Classic energy lift — Beyoncé and Whitney move." },
    ],
    listenFor: ["Resolution gravity toward tonic.", "Key change creating section lift.", "Ambiguity in modal songs.",
      "Stable tonal centre that the melody and bass return to.",],
    mistakes: ["Confusing relative and parallel keys.", "Treating modulations as 'just transposition' — modulation creates new perceived home.", "Mixing keys across DJ sets without harmonic matching."],
    proMoves: ["Tag your sample library with keys for fast harmonic combinations.", "Pick session keys based on vocalist range, not random preference.", "Use Camelot wheel for compatible DJ transitions."],
    quizHard: [
      { q: "Key signature of D major?", options: ["1 sharp (F#)", "2 sharps (F#, C#)", "3 sharps (F#, C#, G#)", "1 flat (Bb)"], answer: 1 },
      { q: "Parallel minor of C major is…", options: ["A minor", "C minor", "F minor", "G minor"], answer: 1 },
      { q: "Relative minor of C major is…", options: ["A minor", "E minor", "G minor", "F minor"], answer: 0 },
    ],
  },

  "tension-resolution": {
    hook: "Music is the controlled release of tension. Build it. Then resolve it.",
    beginner: {
      what: [
        "Tension is anything that creates expectation — a dissonant chord, a high held note, a missing beat, a key change. Resolution is the satisfying release when that expectation is fulfilled.",
        "Every great moment in music — a chorus drop, a guitar solo peak, a bass entering after a breakdown — is a tension-resolution event. Without tension, music feels flat. Without resolution, it feels frustrating.",
        "You're already doing this with sidechains, drops, EQ filter sweeps, vocal builds. Now do it intentionally with harmony too.",
      ],
      why: ["The emotional engine of music.", "Drops, builds, and choruses are all tension-resolution.", "Same notes feel different depending on tension state."],
      analogy: "Tension is winding the spring. Resolution is letting it snap back. Without both, no music — just sound.",
    },
    advanced: {
      what: [
        "Harmonic tension: dominant chords pulling to tonic, suspended chords resolving to triads, diminished chords leading to neighbours.",
        "Melodic tension: leading tones (b7 → 1), upper neighbours, scale degree 4 → 3, scale degree 2 → 1.",
        "Rhythmic tension: syncopation, anticipation, silence before a downbeat. Resolution arrives on the downbeat.",
        "Arrangement tension: removing the kick before a drop, filtering out highs in a build, raising pitch over a riser.",
      ],
      edgeCases: ["Unresolved tension can be a stylistic choice (modal jazz, post-rock).", "Over-resolution = predictable; under-resolution = fatiguing.",
      "Constant resolution becomes predictable — pop hooks often delay or sidestep the expected I.",],
      engineerNotes: ["Pair harmonic resolution with arrangement events for maximum impact.", "Risers, snares, and reverse cymbals signal incoming resolution."],
    },
    flow: "Build tension (harmony / rhythm / arrangement) → Hold → Resolve at strong structural moment",
    walkthrough: [
      { do: "Play V (G major) and hold it.", listen: "Tension builds — ear wants to hear I." },
      { do: "Resolve to I (C major).", listen: "Release — that's the satisfaction." },
      { do: "Build for 8 bars with riser, filter sweep, snare roll.", listen: "Resolve into a chorus drop — peak release moment." },
      { do: "Play V7 → I in C major (G7 → C).", listen: "Classic textbook resolution — tension fully released." },
      { do: "Replace the I with a vi (deceptive cadence).", listen: "Pull happens, but landing is unexpected — keeps the listener leaning in." },
    ],
    listenFor: ["The 'pull' of dominant chords.", "Resolution arriving on downbeats.", "Arrangement tension matching harmonic tension.",
      "Leading tone (7th degree) resolving up to the tonic.",],
    mistakes: ["Resolving too quickly — listener doesn't feel the release.", "Building tension without delivering — frustrating.", "Stacking only tension or only resolution — no contrast."],
    proMoves: ["Combine harmonic + rhythmic + arrangement tension for big payoffs.", "Delay resolution by 1 bar for extra anticipation.", "Use silence as the ultimate tension."],
    quizHard: [
      { q: "Strongest harmonic resolution is…", options: ["IV → I", "V → I", "ii → I", "vi → I"], answer: 1 },
      { q: "A 'leading tone' is which scale degree?", options: ["b3", "5", "b7", "7"], answer: 3 },
      { q: "A deceptive cadence resolves V to…", options: ["I", "vi", "IV", "ii"], answer: 1 },
    ],
  },

  "harmony-in-production": {
    hook: "Pads, bass, chord stabs — harmony is layered, not played as one block.",
    beginner: {
      what: [
        "In production, harmony rarely lives in one instrument. Typically: bass plays the root, a pad sustains chord tones, a chord stab plays a rhythmic chord, and the melody floats on top.",
        "Each instrument occupies its own register and rhythm, but they all spell the same chord at the same time. The result is fuller than any one part alone.",
        "Layering harmony lets you EQ each part separately, automate them independently, and arrange them differently across sections.",
      ],
      why: ["Spreads harmony across the frequency spectrum.", "Each layer can have its own role (sustain, rhythm, accent).", "Allows arrangement variation — drop pads in verses, bring them back in choruses."],
      analogy: "A chord is a single voice singing all the notes at once. Production splits that voice across an ensemble.",
    },
    advanced: {
      what: [
        "Standard layering: sub-bass (root), bass (root + 5), pad (full chord voicing), chord stab (rhythmic comp), melody (top line).",
        "Voice leading across the full ensemble matters more than within a single instrument — track which voice plays which chord tone.",
        "Frequency separation: bass below 200 Hz, pad mid-range, stab high-mid, melody top — each part gets its own EQ slot.",
      ],
      edgeCases: ["Overlapping ranges of pad + chord stab = mud. Carve EQ to separate.", "Bass + sub doubling needs phase alignment to avoid cancellation.",
      "Doubling a chord at the octave below clashes with bass — leave low harmony to the bass instrument.",],
      engineerNotes: ["Sidechain pad to kick for rhythmic glue.", "Use Live's Chord device or scripts to spread one MIDI chord across multiple synths in different voicings."],
    },
    flow: "Single chord → Distribute notes across bass, pad, stab, melody → Mix",
    walkthrough: [
      { do: "Play a Cmaj7 chord all in one synth.", listen: "Functional but flat." },
      { do: "Split: bass on C, pad on E-G-B, stab on G-C-E, melody on B.", listen: "Same chord, much richer." },
      { do: "Drop the pad in verses; bring it back in choruses.", listen: "Arrangement contrast." },
      { do: "Layer a piano chord with a saw pad voicing the same notes.", listen: "Body + sustain — fuller stack from two timbres." },
      { do: "Drop the 3rd from a chord on bass-heavy sections.", listen: "Open 5th avoids low-mid mud when bass is busy." },
    ],
    listenFor: ["Each layer occupying its own register.", "Sidechain pumping providing rhythmic glue.", "Arrangement variation by removing/adding layers.",
      "Voicing spread keeping low notes wide and high notes close.",],
    mistakes: ["All harmony in one synth — flat and CPU-light but boring.", "Layers competing in the same frequency range.", "Ignoring voice leading across the ensemble."],
    proMoves: ["Use one synth for bass, one for chords, one for pad, one for stab — separate tracks, separate decisions.", "Vary chord rhythm across sections (whole notes in verse, 8ths in chorus).", "Pan stabs slightly off-centre to widen the soundstage."],
    quizHard: [
      { q: "Typical harmonic layer order from bottom to top?", options: ["Sub, bass, pad, stab, melody", "Melody, stab, pad, bass, sub", "Pad, sub, melody, bass, stab", "Random"], answer: 0 },
      { q: "Sidechaining a pad to the kick adds…", options: ["Harmonic content", "Rhythmic pumping", "Stereo width", "Compression"], answer: 1 },
      { q: "Why drop the 3rd of a chord in dense low-frequency mixes?", options: ["To make it major", "To avoid muddy low-mid clash", "To change the key", "To add tension"], answer: 1 },
    ],
  },

  "harmony-maker": {
    hook: "Capstone for Harmony — build a 4-chord progression with layered ensemble.",
    beginner: {
      what: [
        "Time to combine everything from the Harmony path: pick a key, choose a 4-chord progression, voice each chord with intentional inversions, distribute notes across bass + pad + stab + melody, and layer them into a 16-bar loop.",
        "Bonus: borrow one chord from the parallel minor for colour, and end with a strong dominant-to-tonic cadence.",
        "Goal: prove you can take a single progression and build a full harmonic arrangement from it.",
      ],
      why: ["Tests every Harmony concept in a practical loop.", "Builds production-ready arrangement skills.", "Produces a usable demo track."],
    },
    advanced: {
      what: ["Capstone exercise: pick key, choose progression (e.g., I-V-vi-IV with bVI borrowed), voice each chord with smooth voice leading, distribute across 4-instrument ensemble, add sidechain glue, and verify cadential resolution at bar 16."],
      edgeCases: ["Voice leading across ensemble — track each voice as if it were a singer.", "EQ separation per layer."],
      engineerNotes: ["Use Roman numerals to communicate the progression.", "Save as a reusable template."],
    },
    flow: "Key → Progression → Voicings → Layered ensemble → Mix → Cadence",
    walkthrough: [
      { do: "Pick C major. Progression: I-V-vi-IV with bVI substitution.", listen: "Progression flow." },
      { do: "Voice each chord with smooth voice leading.", listen: "Chord changes feel connected." },
      { do: "Distribute notes across sub, bass, pad, stab, melody.", listen: "Ensemble texture." },
      { do: "Sidechain pad to kick. End on V → I.", listen: "Strong cadential close." },
    ],
    listenFor: ["Voice-leading smoothness.", "Layer separation.", "Strong final cadence."],
    mistakes: ["Forgetting voice leading.", "All chords in root position.", "No cadential resolution."],
    proMoves: ["Save the template for future tracks.", "A/B against a reference song.", "Document chord choices for repeatability."],
    quizHard: [
      { q: "Best test of a harmony loop?", options: ["LUFS reading", "Each layer occupying its own register with smooth voice leading", "Number of chords used", "Stereo width"], answer: 1 },
      { q: "Borrowing a chord from parallel minor inside a major progression is called…", options: ["Modulation", "Modal mixture", "Inversion", "Substitution"], answer: 1 },
    ],
  },

  // ============================================================
  // PATH 5 — TECH (production fundamentals)
  // ============================================================
  "song-structure": {
    hook: "Intro, verse, chorus, drop — sections are how listeners follow your story.",
    beginner: {
      what: [
        "Songs are built from sections. Each section has a job: intro = invite the listener in, verse = tell the story, chorus / drop = deliver the hook, bridge = contrast, outro = wind down.",
        "Most genres have a typical section layout: pop is often verse-chorus-verse-chorus-bridge-chorus; EDM is often intro-build-drop-break-build-drop-outro. Listeners subconsciously expect these patterns.",
        "Sections work because they create contrast. A chorus only feels like a chorus because the verse before it didn't have those elements. Arrangement = where you add and remove instruments to create that contrast.",
      ],
      why: ["Without structure, songs feel directionless.", "Contrast between sections is what makes the hook hit.", "Listeners stay engaged when they know where they are in the song."],
      analogy: "A song without sections is a movie without scenes — interesting moments but no story.",
    },
    advanced: {
      what: [
        "Section template (pop): intro (4-8 bars) → verse 1 (16) → pre-chorus (8) → chorus (16) → verse 2 (16) → pre-chorus (8) → chorus (16) → bridge (8) → final chorus (16-32) → outro (8).",
        "Section template (EDM): intro (16-32) → build (8-16) → drop (32) → breakdown (16) → build (8) → drop (32) → outro (16-32).",
        "Contrast tools: arrangement density, register (bass enters in chorus), filtering, key change, dynamic level.",
      ],
      edgeCases: ["Modern pop sections are getting shorter (sub-3-min songs).", "Streaming demands an immediate hook (within 15 seconds).",
      "Dance tracks often use 16- or 32-bar phrases — DJs need predictable lengths for mixing.",],
      engineerNotes: ["Use Live's locators to mark every section.", "Build the arrangement skeleton first (empty sections labelled), then fill with content."],
    },
    flow: "Pick template → Mark sections → Add contrast → Refine transitions",
    walkthrough: [
      { do: "Open a reference song and mark every section with locators.", listen: "Notice typical section lengths." },
      { do: "Map out empty sections for your own track first.", listen: "Skeleton-first arrangement." },
      { do: "Add or remove instruments per section.", listen: "Contrast emerges automatically." },
      { do: "Sketch intro – verse – chorus – verse – chorus – bridge – chorus.", listen: "Familiar pop arc — predictable in the best way." },
      { do: "Add a 4-bar pre-chorus that pulls energy back before the drop.", listen: "Contrast makes the chorus hit harder." },
    ],
    listenFor: ["Section transitions creating expectation.", "Choruses feeling 'bigger' than verses.", "Bridge offering harmonic or rhythmic contrast.",
      "Section boundaries marked by drum changes, filter sweeps or silence.",],
    mistakes: ["No clear section boundaries — song feels like a wandering loop.", "Every section the same density.", "Forgetting the outro — songs stop abruptly."],
    proMoves: ["Build skeleton arrangement before any sound design.", "Use one signature element per section (chord change, vocal chop, filter reveal).", "Always include a contrast moment in the bridge."],
    quizHard: [
      { q: "Typical EDM drop length?", options: ["4 bars", "16 bars", "32 bars", "64 bars"], answer: 2 },
      { q: "First 15 seconds of a streaming song should…", options: ["Build slowly", "Deliver a hook immediately", "Be silent", "Be a long intro"], answer: 1 },
      { q: "Purpose of a pre-chorus?", options: ["Repeat the verse", "Build tension into the chorus", "Replace the bridge", "Reduce energy"], answer: 1 },
    ],
  },

  "listening-actively": {
    hook: "Listening like a producer is a skill — train it deliberately.",
    beginner: {
      what: [
        "Most people listen to music for vibe. Producers listen for craft: what's the kick doing, where's the bass sitting, how's the snare layered, how does the chorus differ from the verse?",
        "Active listening = picking one element at a time and following it through the whole song. Today: kicks. Tomorrow: vocal effects. Next week: arrangement transitions.",
        "Over months, this rewires your ear. You start hearing production decisions everywhere, and your own tracks improve because you've absorbed thousands of examples.",
      ],
      why: ["Best music education available — and it's free.", "Builds taste and reference vocabulary.", "Reveals production tricks invisible on first listen."],
      analogy: "Casual listening is sightseeing. Active listening is being an architect studying buildings.",
    },
    advanced: {
      what: [
        "Structured active listening: pick one element (drums, bass, vocals, FX, automation), one song, one full pass. Note observations.",
        "Compare same song on different systems (headphones, phone, monitors) — different systems reveal different details.",
        "Build a reference library: 5 favourite tracks per genre, tagged with what they do well (kick, vocal, mix balance).",
      ],
      edgeCases: ["Spectrum analysers on commercial tracks reveal frequency balance targets.", "Stem separators (Spleeter, Demucs, RipX) let you isolate parts for study.",
      "Listening on phone vs headphones reveals different mix problems — both are valid references.",],
      engineerNotes: ["Log observations in a notebook — surprisingly hard to remember even one week later.", "Listen to the same track 5 times focusing on different elements."],
    },
    flow: "Pick element → Pick song → Pick listen environment → Note observations",
    walkthrough: [
      { do: "Listen to a chart-topping pop song focusing only on the snare.", listen: "Layering, reverb, dynamics, panning all become visible." },
      { do: "Repeat focusing on vocal effects.", listen: "Reverb sends, delay throws, doubling, automation." },
      { do: "Compare same song on phone speaker vs studio monitors.", listen: "Different mix elements emerge." },
      { do: "Loop one 8-bar section of a reference and list every instrument.", listen: "Forces detail-level awareness over passive listening." },
      { do: "Mute the lead and re-listen.", listen: "Reveals what the backing tracks are actually doing." },
    ],
    listenFor: ["Production decisions per element.", "Arrangement choices per section.", "Mix balance shifts between sections.",
      "Production decisions: reverb size, pan placement, when the bass enters.",],
    mistakes: ["Listening passively and absorbing nothing.", "No notes — observations evaporate.", "Listening only on one system."],
    proMoves: ["Active-listen one new song per day for a month — measurable taste improvement.", "Reverse-engineer mix decisions you like.", "Build a Notion or text file with 'cool moves I want to steal'."],
    quizHard: [
      { q: "Most useful active-listening practice?", options: ["Listen to many songs once each", "Listen to one song 5 times, each focused on a different element", "Listen only on monitors", "Listen only at high volume"], answer: 1 },
      { q: "Why compare systems?", options: ["Saves CPU", "Different systems reveal different mix details", "Required by law", "It doesn't matter"], answer: 1 },
      { q: "Best practice when learning from a reference?", options: ["Listen once casually", "Loop short sections and dissect", "Skip to the drop", "Compare loudness only"], answer: 1 },
    ],
  },

  "active-listener": {
    hook: "Capstone for active listening — analyse a track end to end.",
    beginner: {
      what: [
        "Pick one song you love. Open a fresh document. Listen 5 times, each focused on one layer: drums, bass, harmonic instruments, vocals/leads, FX/automation. Write 3-5 observations per pass.",
        "End with a section-by-section arrangement map: what enters and exits in each bar block.",
        "By the end you'll know that song's production better than 99% of its fans — and you'll have a playbook of moves to steal.",
      ],
      why: ["Concentrates a month of casual listening into one focused session.", "Creates a reference document you'll revisit.", "Highlights gaps in your own production."],
    },
    advanced: {
      what: ["Capstone: choose a reference, perform 5-pass active analysis, build full arrangement map, identify 3 specific production techniques to steal, attempt to replicate one in your own track."],
      edgeCases: ["Pick a song just outside your current ability — stretches without breaking.", "Repeat monthly for fastest growth."],
      engineerNotes: ["Save the analysis document — re-read in 6 months and you'll catch new details.", "Pair with stem separation for deep dives."],
    },
    flow: "Pick song → 5 focused passes → Section map → Identify techniques → Replicate one",
    walkthrough: [
      { do: "Choose a reference track in your target genre.", listen: "5 listens, one focus per listen." },
      { do: "Build arrangement map showing what enters/exits each section.", listen: "Structural understanding." },
      { do: "Replicate one technique in your own work.", listen: "Practical transfer." },
    ],
    listenFor: ["Layer-by-layer detail.", "Section transitions.", "Mix balance decisions."],
    mistakes: ["One-pass listening — misses 80% of detail.", "Skipping the replication step.", "Picking a too-familiar track — bias prevents fresh hearing."],
    proMoves: ["Repeat monthly with new references.", "Build a personal 'moves to steal' library."],
    quizHard: [
      { q: "Best capstone practice for ear training?", options: ["Skim 100 songs", "Deep-dive 1 song with 5 focused passes", "Listen passively for 5 hours", "Use a spectrum analyser only"], answer: 1 },
    ],
  },

  "daw-explained": {
    hook: "Your DAW is a sequencer, mixer, instrument host, and effects rack — all in one window.",
    beginner: {
      what: [
        "A DAW (Digital Audio Workstation) is the software where you create, record, edit, and mix music. Every modern producer's central tool.",
        "It has four main jobs: 1) sequence — arrange clips and MIDI notes in time, 2) host instruments — run synths and samplers, 3) host effects — chain EQ, compression, reverb etc., 4) mix — set levels, panning, and routing.",
        "Ableton Live, FL Studio, Logic, Pro Tools, Cubase — all do these four things. The differences are in workflow philosophy. Pick one and learn it deeply.",
      ],
      why: ["Replaces a million dollars of hardware studio gear.", "Lets you save, recall, and tweak any session forever.", "Plugin ecosystem gives you infinite sounds."],
      analogy: "A DAW is the kitchen. The instruments are the ingredients. The plugins are the spice rack. You're the chef.",
    },
    advanced: {
      what: [
        "Core architecture: an audio engine streams samples at fixed buffer sizes through a directed graph of tracks → devices → buses → master. A separate MIDI engine schedules note events sample-accurate to that audio clock.",
        "Plugin host: VST3 / AU / AAX run as in-process modules; Live additionally hosts Max for Live devices that share the engine without an external IPC bridge.",
        "Automation system: every device parameter is addressable; automation lanes live in clips (Session) or on tracks (Arrangement) and are resolved per-sample during render.",
        "Plugin Delay Compensation walks the graph at start, measures each plugin's reported latency, and inserts compensating delays on parallel paths so downbeats stay aligned.",
        "32-bit float internal headroom means nothing clips until the final master output stage — buses can run hot internally without distortion.",
      
      ],
      edgeCases: ["32-bit float internal processing prevents internal clipping; only the final output stage clips.", "Plugin delay compensation (PDC) keeps tracks aligned despite plugin latency.",
      "Changing sample rate mid-project re-samples audio clips on the fly — saved warp markers may drift slightly.",],
      engineerNotes: ["Set sample rate (44.1 or 48 kHz) at project start — changing later requires careful file handling.", "Save a default template with your standard tracks, buses, and routing."],
    },
    flow: "Browser → Track → MIDI/Audio clip → Devices → Mixer → Master → Output",
    walkthrough: [
      { do: "Open Live, drop an audio sample, then a MIDI instrument.", listen: "DAW handles both fluidly." },
      { do: "Chain an EQ and a compressor on a track.", listen: "Effects process in series." },
      { do: "Save a default template with your favourite setup.", listen: "Future projects start ready to go." },
      { do: "Group three drum tracks into a bus and add a glue compressor.", listen: "Sub-mixing reduces master-bus work and tightens the kit." },
      { do: "Freeze and flatten a CPU-heavy synth track.", listen: "DAW writes audio to disk; CPU drops dramatically." },
    ],
    listenFor: ["DAW transport behaviour (play, stop, loop).", "Plugin chain order affecting sound.", "Routing creating bus structure.",
      "Plugin chain order changing the result (EQ→comp vs comp→EQ are different sounds).",],
    mistakes: ["Switching DAWs every month instead of learning one deeply.", "Not saving a template.", "Ignoring keyboard shortcuts — slow workflow."],
    proMoves: ["Memorise top 20 shortcuts.", "Set up a default template with routing pre-built.", "Use one DAW for at least a year before considering alternatives."],
    quizHard: [
      { q: "Plugin Delay Compensation (PDC) does what?", options: ["Adds reverb", "Aligns tracks despite plugin latency", "Boosts CPU", "Compresses MIDI"], answer: 1 },
      { q: "Live's two main views are…", options: ["Browser and Mixer", "Session and Arrangement", "MIDI and Audio", "Stereo and Mono"], answer: 1 },
      { q: "Why does Live use 32-bit float internally?", options: ["Smaller files", "Effectively unclippable headroom on internal buses", "Better latency", "MIDI accuracy"], answer: 1 },
    ],
  },

  "studio-bootup": {
    hook: "Audio interface → DAW → speakers → mic → MIDI controller. The signal chain you sit inside.",
    beginner: {
      what: [
        "A home studio is built around one central device: the audio interface. It converts analog audio (mic, instrument) into digital (for the DAW) and back (to your speakers/headphones).",
        "Standard setup: interface plugged into computer via USB. Mic and instruments go into the interface inputs. Monitors/headphones go out of the interface outputs. MIDI controller is a separate USB device.",
        "The DAW sends and receives audio through the interface. Latency (the delay between hitting a key and hearing the sound) depends on interface and buffer settings.",
      ],
      why: ["The interface is the single most important hardware purchase.", "Buffer size trades latency for CPU stability.", "Routing knowledge saves you when something doesn't work."],
      analogy: "The interface is the translator between your computer and the analog world.",
    },
    advanced: {
      what: [
        "Buffer size: smaller = less latency but more CPU; larger = more stable but more latency. Use small (64-128 samples) when recording, large (512-1024) when mixing.",
        "Sample rate: 44.1 kHz (CD), 48 kHz (video standard), 96 kHz (high-end). Match the project's intended delivery format.",
        "Bit depth: 24-bit for tracking gives 16M dynamic range. 32-bit float internal is even safer.",
      ],
      edgeCases: ["USB hub conflicts can cause dropouts — plug interface direct.", "Driver mismatch (ASIO/Core Audio) causes glitches — keep drivers updated."],
      engineerNotes: ["Set monitoring path correctly: software monitoring uses DAW; direct monitoring uses interface hardware (lower latency).", "Phantom power (+48V) for condenser mics only — can damage ribbons."],
    },
    flow: "Mic/instrument → Interface in → DAW → Interface out → Monitors/headphones",
    walkthrough: [
      { do: "Plug interface, set sample rate to 48 kHz, buffer to 128 samples.", listen: "DAW connects, low latency." },
      { do: "Test mic input level in DAW.", listen: "Healthy peaks around -12 to -6 dBFS." },
      { do: "Increase buffer to 512 for mixing.", listen: "More plugins possible, more latency." },
    ],
    listenFor: ["Latency feel when monitoring through software.", "Dropouts at too-small buffer sizes.", "Sample rate mismatch artefacts."],
    mistakes: ["Phantom power on ribbon mics.", "Wrong sample rate causing playback issues.", "Buffer too small during mixing → glitches."],
    proMoves: ["Use direct monitoring for tracking to eliminate latency feel.", "Bigger buffer for mixing, smaller for tracking.", "Keep interface firmware/drivers current."],
    quizHard: [
      { q: "Smaller buffer size means…", options: ["Less latency, more CPU", "More latency, less CPU", "Higher sample rate", "Better fidelity"], answer: 0 },
      { q: "Standard sample rate for video work?", options: ["44.1 kHz", "48 kHz", "96 kHz", "192 kHz"], answer: 1 },
    ],
  },

  "midi-explained": {
    hook: "MIDI isn't audio — it's instructions for instruments. Note on, note off, velocity, that's it.",
    beginner: {
      what: [
        "MIDI (Musical Instrument Digital Interface) is a protocol for sending performance instructions: which note, how hard, when on, when off. It's not sound — it's data telling a synth or sampler what to play.",
        "Because MIDI is just data, you can edit it forever without quality loss. Change the notes, transpose, quantise, swap instruments — the underlying performance information is preserved.",
        "Audio = the recorded sound itself. MIDI = the score that produces the sound. Both have their place; modern production uses both heavily.",
      ],
      why: ["Infinitely editable — change anything anytime.", "Instrument-independent — same MIDI, different sound by swapping synths.", "Tiny file size — easy to share and version."],
      analogy: "MIDI is sheet music for robots. Audio is the recording of that music being played.",
    },
    advanced: {
      what: [
        "MIDI 1.0 is a serial protocol of 1- to 3-byte messages on 16 channels; status bytes encode message type and channel, data bytes carry note number, velocity, controller value, or program.",
        "Note On with velocity 0 is functionally identical to Note Off — many controllers use it as a bandwidth optimisation.",
        "Continuous Controllers (CC) are 7-bit (0–127) by default; CC numbers 0/32, 6/38, etc. pair into 14-bit MSB/LSB messages for finer resolution.",
        "MIDI 2.0 introduces bidirectional negotiation, 32-bit data resolution, per-note controllers (true polyphonic expression), and property exchange — adoption is partial across DAWs and hardware.",
        "MPE (MIDI Polyphonic Expression) sits on top of MIDI 1.0 by assigning each note its own channel so pitch bend and CCs can be per-note — Push 3 and ROLI controllers rely on this.",
      
      ],
      edgeCases: ["MIDI doesn't carry sound — receiving instrument decides what each note sounds like.", "Quantising velocity loses dynamic feel — quantise timing only.",
      "Quantising MIDI to grid removes humanisation; use 'Quantize Strength' < 100% to retain feel.",],
      engineerNotes: ["Use Live's MIDI Transform devices (Scale, Chord, Arpeggiator) to manipulate notes non-destructively.", "Capture MIDI = Live records your last played notes even if you forgot to hit Record."],
    },
    flow: "Controller → MIDI data → DAW → MIDI track → Instrument → Audio output",
    walkthrough: [
      { do: "Record a MIDI clip with a soft synth.", listen: "Notes captured as data, not audio." },
      { do: "Swap the synth for a different one.", listen: "Same notes, different sound — proves MIDI is instrument-independent." },
      { do: "Change a few velocities.", listen: "Dynamics change without re-recording." },
      { do: "Map a CC1 (mod wheel) move to a filter cutoff with MIDI Learn.", listen: "Real-time expressive control over a single parameter." },
      { do: "Use Live's Scale device above an instrument to constrain notes to A minor.", listen: "Wrong notes simply can't happen — useful for improv recording." },
    ],
    listenFor: ["Velocity affecting both volume and timbre.", "MIDI editing preserving original performance feel.", "Instant swap of instruments while MIDI stays.",
      "Velocity driving filter brightness as well as volume on well-designed patches.",],
    mistakes: ["Quantising velocity along with timing.", "Recording MIDI and bouncing too early — loses editability.", "Not freezing CPU-heavy synths for performance."],
    proMoves: ["Keep MIDI tracks editable until final mix.", "Use velocity to drive filter/timbre, not just volume.", "Capture MIDI as your safety net for happy accidents."],
    quizHard: [
      { q: "MIDI velocity range?", options: ["0-100", "0-127", "0-255", "0-1000"], answer: 1 },
      { q: "MIDI carries…", options: ["Audio signal", "Performance instructions", "Both equally", "Only volume"], answer: 1 },
      { q: "Why does Note On with velocity 0 equal Note Off?", options: ["Bug in spec", "Bandwidth optimisation on serial MIDI", "Required by VSTs", "Bit-depth limit"], answer: 1 },
    ],
  },

  "digital-audio": {
    hook: "Sample rate + bit depth = the resolution of your audio universe.",
    beginner: {
      what: [
        "Digital audio works by sampling a sound wave thousands of times per second and storing each measurement as a number. Sample rate (Hz) = how many samples per second. Bit depth = how precisely each sample is measured.",
        "44.1 kHz / 16-bit is CD quality. 48 kHz / 24-bit is video / modern studio standard. Higher rates are diminishing returns for most production.",
        "Higher sample rate captures higher frequencies (Nyquist: max audible = SR/2). Higher bit depth gives more dynamic range and less noise floor.",
      ],
      why: ["Pick the right format for your delivery target.", "Avoid rate conversion artefacts by matching project to source.", "Understand why 'high-res' isn't always meaningfully better."],
      analogy: "Sample rate is camera frames per second. Bit depth is image resolution per pixel. Both matter, but past a point, more doesn't help.",
    },
    advanced: {
      what: [
        "Nyquist theorem: to reproduce a frequency f you need a sample rate of at least 2f. 44.1 kHz captures up to ~22 kHz (slightly above human hearing).",
        "Bit depth → dynamic range: 16-bit ≈ 96 dB, 24-bit ≈ 144 dB, 32-bit float ≈ effectively infinite for practical purposes.",
        "Anti-aliasing filters are required at the input to remove frequencies above Nyquist that would alias as audible artefacts.",
      ],
      edgeCases: ["Sample rate conversion (SRC) quality varies between tools — high-quality SRC matters.", "32-bit float files prevent internal clipping but final delivery is still 16-bit or 24-bit fixed.",
      "Sample-rate conversion quality varies between DAWs — bounce at project rate when possible.",],
      engineerNotes: ["Record at 24-bit minimum.", "Match project sample rate to source files to avoid SRC.", "Master at 24-bit, then dither to 16-bit for final delivery."],
    },
    flow: "Analog wave → Sample at SR Hz, quantise to N bits → Digital file → Reconstruct on playback",
    walkthrough: [
      { do: "Set a project to 44.1 kHz / 16-bit.", listen: "CD-quality reference." },
      { do: "Compare with 48 kHz / 24-bit project.", listen: "Slightly more headroom and noise floor margin." },
      { do: "Try 8-bit conversion to hear the noise floor.", listen: "Hissy, lo-fi — proves bit depth limits dynamic range." },
      { do: "Render a session at 44.1 kHz and 96 kHz and A/B in matched playback.", listen: "Most differences are masked once dithered to 16-bit delivery." },
      { do: "Truncate a 24-bit mix to 16-bit without dither.", listen: "Quiet tails reveal quantisation noise; with dither, it disappears." },
    ],
    listenFor: ["Difference between 16 and 24-bit on quiet passages.", "Aliasing artefacts at low sample rates.", "Noise floor at low bit depth.",
      "Quantisation hiss on faded tails when bit depth is wrong.",],
    mistakes: ["Mixing sample rates within a project.", "Using 16-bit for tracking.", "Believing higher sample rates always sound better."],
    proMoves: ["Record 24-bit minimum.", "Dither when reducing bit depth at the end.", "Match project SR to your delivery format."],
    quizHard: [
      { q: "Nyquist frequency at 48 kHz sample rate?", options: ["12 kHz", "24 kHz", "48 kHz", "96 kHz"], answer: 1 },
      { q: "16-bit dynamic range is approximately…", options: ["48 dB", "96 dB", "144 dB", "192 dB"], answer: 1 },
      { q: "Dither is added when…", options: ["Increasing bit depth", "Reducing bit depth", "Changing sample rate", "Compressing audio"], answer: 1 },
    ],
  },

  "samples-loops": {
    hook: "A sample is a snippet of recorded sound. A loop is one that repeats seamlessly.",
    beginner: {
      what: [
        "Samples are pre-recorded audio snippets — kicks, snares, vocal chops, instrument hits, anything. Loops are samples designed to repeat seamlessly across bars, like a drum break.",
        "Modern production is largely sample-based: drum kits, one-shots, foley, vocal phrases, melodic loops. Libraries (Splice, Loopcloud, vinyl rips) provide millions.",
        "Using samples isn't 'cheating' — it's a craft. Choosing, layering, processing, and arranging samples is the skill.",
      ],
      why: ["Faster than designing every sound from scratch.", "Access to professionally recorded sources without studio gear.", "Layering samples creates depth no single sound can."],
      analogy: "Samples are ingredients in a pantry. The dish (your track) is how you combine them.",
    },
    advanced: {
      what: [
        "Sample formats: one-shots (single hits), loops (multi-bar phrases), construction kits (matched stems), Kontakt/Sampler instruments (mapped across keyboard).",
        "Warping: time-stretching a sample to fit project tempo without changing pitch. Pitch-shifting: change pitch without changing tempo.",
        "Sample clearance: commercial samples have licenses. Sample packs (Splice, etc.) are royalty-free by default.",
      ],
      edgeCases: ["Extreme warping (drastic tempo change) introduces artefacts.", "Layering similar samples can phase-cancel — check by inverting one.",
      "Commercial sample packs are usually royalty-free but check the licence on every pack before release.",],
      engineerNotes: ["Tag and organise samples by BPM, key, and genre.", "Use Live's Sampler/Simpler to slice loops by transient or grid.", "EQ and compress samples before layering to avoid mud."],
    },
    flow: "Browse → Audition → Drag to track → Warp/tune → Process → Layer",
    walkthrough: [
      { do: "Drag a drum loop onto an audio track.", listen: "Live warps to project tempo automatically." },
      { do: "Slice the loop with Simpler.", listen: "Each transient becomes a playable pad." },
      { do: "Layer two kick samples (one body, one click).", listen: "Composite kick stronger than either alone." },
      { do: "Drop a 90 BPM break into a 128 BPM project with Complex Pro warping.", listen: "Tempo matches, transients survive." },
      { do: "Slice the same break to a Drum Rack with 1/16 markers.", listen: "Each hit is now playable from a pad — instant remix material." },
    ],
    listenFor: ["Warping artefacts on extreme tempo changes.", "Phase cancellation when layering similar samples.", "Layered composites being stronger than singles.",
      "Warp artefacts (flam, smear) on fast transients — different modes for different sources.",],
    mistakes: ["Using samples at wrong tempo without warping.", "Layering identical samples (no benefit).", "Ignoring sample organisation — wastes hours searching."],
    proMoves: ["Build a personal go-to sample library you know intimately.", "Layer click + body + tail for composite percussion.", "Reverse samples for transitional FX."],
    quizHard: [
      { q: "Warping a sample changes…", options: ["Tempo without pitch", "Pitch without tempo", "Both equally", "Neither"], answer: 0 },
      { q: "Splice samples are typically licensed as…", options: ["Pay-per-use", "Royalty-free", "Copyrighted", "Public domain"], answer: 1 },
      { q: "Which warp mode is generally best for full drum loops?", options: ["Beats", "Tones", "Texture", "Re-Pitch"], answer: 0 },
    ],
  },

  "signal-chain": {
    hook: "Signal chain = the order plugins process audio. Order changes everything.",
    beginner: {
      what: [
        "When you stack plugins on a track, audio flows through them in order — top to bottom in Live. EQ → Compressor processes the EQ-d signal through the compressor. Swap the order and you get a totally different result.",
        "Standard order on a vocal: high-pass → EQ → de-esser → compressor → saturation → reverb/delay sends. Each plugin does its job on a cleaner input than the last.",
        "Effects after the compressor change what gets compressed. Effects before don't. This is the most powerful and most-broken concept in mixing.",
      ],
      why: ["Plugin order is half the mix decision.", "Same plugins, different order = different sound.", "Knowing the order frees you from guessing."],
      analogy: "Signal chain is a cooking order. Salt before searing = different result than salt after.",
    },
    advanced: {
      what: [
        "Standard insert order: subtractive EQ → dynamics (compression, gating) → additive EQ → saturation / character → modulation → time-based (delay, reverb).",
        "Pre vs post: pre-fader sends maintain level regardless of fader; post-fader follow the fader.",
        "Parallel vs serial: serial chains plugins sequentially; parallel splits signal, processes separately, blends.",
      ],
      edgeCases: ["Reverb before compression = compression pumps with reverb tail.", "EQ after distortion shapes the distorted harmonics, not the original signal.",
      "Some devices reset on stop (envelope followers); printing audio captures their settled state.",],
      engineerNotes: ["Use racks to encapsulate parallel chains.", "Always solo a track to hear what each plugin in the chain is doing.", "Use bypass A/B to verify each plugin earns its place."],
    },
    flow: "Source → EQ → Comp → Saturation → Mod → Time FX → Output",
    walkthrough: [
      { do: "Add EQ then comp on a vocal.", listen: "EQ shapes; comp evens dynamics." },
      { do: "Swap order — comp then EQ.", listen: "EQ now shapes the compressed signal — different result." },
      { do: "Add a reverb and move it before vs after the comp.", listen: "Before = comp pumps with reverb; after = reverb floats on top." },
      { do: "Place an EQ before a compressor on a vocal.", listen: "Compressor reacts to the EQ'd signal — less pumping on lows." },
      { do: "Swap the order: compressor before EQ.", listen: "Different result — neither is wrong, but they sound different." },
    ],
    listenFor: ["Order changing perceived punch and clarity.", "Pumping when time-based FX precede dynamics.", "Saturation harmonics shaped differently when EQ comes after.",
      "Bypass-and-compare to confirm each device is earning its place.",],
    mistakes: ["Random plugin order without thinking.", "Reverb before comp causing unwanted pumping.", "EQing to fix problems that ordering would solve."],
    proMoves: ["Establish a default insert order template.", "Use racks to experiment with parallel processing.", "Bypass each plugin to verify its contribution."],
    quizHard: [
      { q: "Reverb placed BEFORE a compressor will…", options: ["Have no effect on compression", "Cause the compressor to pump on reverb tails", "Boost the dry signal", "Cancel the comp"], answer: 1 },
      { q: "Standard plugin order (rough)?", options: ["Reverb → EQ → Comp", "EQ → Comp → Saturation → Reverb", "Comp → Reverb → EQ", "Saturation → Reverb → EQ → Comp"], answer: 1 },
      { q: "Why does plugin order matter?", options: ["It doesn't — they're commutative", "Each device transforms the signal before the next sees it", "Only for MIDI plugins", "Only at master bus"], answer: 1 },
    ],
  },

  "effects-overview": {
    hook: "EQ, compression, reverb, delay, saturation, modulation — six families that cover 95% of mixing.",
    beginner: {
      what: [
        "Audio effects fall into six families: EQ (frequency balance), dynamics (compression/limiting), time-based (reverb/delay), modulation (chorus/flanger/phaser), saturation (harmonic colour), and utility (panning, gain, stereo).",
        "Each family solves a different mix problem. EQ fixes frequency balance. Compression evens dynamics. Reverb places sound in space. Saturation adds warmth or aggression.",
        "Most pro mixes use the same handful of effect types in every track — what changes is how they're tuned and combined.",
      ],
      why: ["Knowing the six families lets you pick the right tool fast.", "Most mix problems map to one of these families.", "Plugin paralysis ends when you know the categories."],
      analogy: "Effects are the spice rack. Six core spices that you blend into every dish.",
    },
    advanced: {
      what: [
        "EQ: linear-phase vs minimum-phase, shelving/peaking/HP/LP filter types, Q (bandwidth), gain (dB).",
        "Dynamics: compressor (ratio, attack, release, threshold, knee, makeup), limiter (max-out brick wall), expander (downward expander = gate).",
        "Time-based: delay (feedback, time, ping-pong), reverb (algorithmic vs convolution, pre-delay, size, damping).",
        "Modulation: LFO modulating pitch/amplitude/filter — chorus, flanger, phaser, tremolo.",
        "Saturation: tape, tube, transistor, transformer — each adds different harmonic profiles.",
      ],
      edgeCases: ["Mid-side EQ targets centre vs sides separately.", "Multiband compression splits frequency ranges for selective dynamics.", "Convolution reverb uses impulse responses of real spaces."],
      engineerNotes: ["Learn one plugin per family deeply before collecting more.", "Built-in DAW plugins are often more than enough.", "A/B with bypass on every plugin."],
    },
    flow: "Identify problem → Choose family → Pick plugin → Tune → Verify with A/B",
    walkthrough: [
      { do: "On a vocal, apply EQ → comp → reverb.", listen: "Three families addressing three issues." },
      { do: "Add saturation between EQ and comp.", listen: "Adds harmonic warmth before dynamics." },
      { do: "Add a subtle stereo widener.", listen: "Utility family adjusting image." },
      { do: "Send a snare to a reverb return at -20 dB.", listen: "Subtle space added without drowning the snare itself." },
      { do: "Insert a transient shaper on a kick.", listen: "Attack sharpened or softened without touching levels." },
    ],
    listenFor: ["Each family solving its specific problem.", "Cumulative effect of the chain.", "When you add more plugins than necessary.",
      "Effects serving a specific job per track, not added by reflex.",],
    mistakes: ["Reaching for the wrong family (EQ when compression is needed).", "Plugin maximalism — fewer is usually better.", "Skipping the A/B bypass check."],
    proMoves: ["Master one EQ and one compressor before adding more tools.", "Use stock plugins until you hit specific limits.", "A/B every plugin — if you can't tell, it's not helping."],
    quizHard: [
      { q: "Convolution reverb uses…", options: ["Algorithmic models", "Impulse responses of real spaces", "Tape simulation", "MIDI"], answer: 1 },
      { q: "Which family fixes dynamic range issues?", options: ["EQ", "Compression", "Reverb", "Modulation"], answer: 1 },
      { q: "Why use a send for reverb instead of an insert?", options: ["Lower CPU and consistent space across multiple tracks", "Higher fidelity always", "Required by the DAW", "Reverb only works on sends"], answer: 0 },
    ],
  },

  "mixing-basics": {
    hook: "Mixing is balance, EQ, dynamics, space — done in that order.",
    beginner: {
      what: [
        "Mixing combines all your tracks into one stereo file that sounds good on every system. The classic process: 1) balance levels with faders, 2) carve EQ to make space, 3) control dynamics with compression, 4) place sounds in stereo and depth.",
        "Start with faders only. Get the rough balance right. Then fix EQ clashes (kick + bass, vocal + lead). Then tame dynamics. Then add reverb/delay for depth.",
        "A good mix translates: it sounds balanced on phone, laptop, car, headphones, monitors. Reference commercial tracks at matched loudness throughout.",
      ],
      why: ["Determines whether your track competes with releases on the same playlists.", "Translates your creative decisions to the listener accurately.", "Skill that separates demos from final releases."],
      analogy: "Mixing is balancing a meal. Every ingredient has its place; none should drown out the rest.",
    },
    advanced: {
      what: [
        "Standard order: gain stage → static balance → subtractive EQ → compression → additive EQ → saturation → effects sends → bus processing → automation → master.",
        "Reference matching: A/B against commercial tracks at matched LUFS — your perception of balance is invalidated by loudness differences.",
        "Translation: check on at least 3 systems (monitors, headphones, phone) before final.",
      ],
      edgeCases: ["Mono compatibility: collapse to mono regularly — phase cancellations vanish in stereo but kill the mix on mono systems.", "Loudness wars: chase LUFS targets, not peak meters.",
      "Mixing on headphones produces wider mixes than monitors — cross-check both.",],
      engineerNotes: ["Mix at low volumes for balance; check at high volume for impact.", "Take breaks every 45-60 minutes — ear fatigue ruins decisions.", "Save mix versions iteratively (v1, v2, v3) — never overwrite."],
    },
    flow: "Gain stage → Balance → EQ → Comp → Space → Bus → Automation → Master",
    walkthrough: [
      { do: "Set all faders to -10 dB and balance with faders only.", listen: "Static balance achieved before any EQ." },
      { do: "Subtractive EQ to remove mud and clashes.", listen: "Each track sits in its slot." },
      { do: "Compress key tracks (vocals, bass, drums).", listen: "Dynamics evened." },
      { do: "Add reverb sends for depth.", listen: "3D image emerges." },
      { do: "Reference your mix against a commercial track at matched LUFS.", listen: "Honest comparison of balance, not loudness." },
      { do: "Mono-sum the master and re-listen.", listen: "Phase issues collapse — anything that vanishes is a problem." },
    ],
    listenFor: ["Balance translation across systems.", "EQ clashes between kick + bass and vocal + lead.", "Reverb providing depth without washing out.",
      "Mix translation across phone, headphones and monitors.",],
    mistakes: ["Reaching for EQ before balancing with faders.", "Compressing everything before EQing.", "Not checking on multiple systems."],
    proMoves: ["Reference at matched LUFS, not matched peak.", "Mono-check every session.", "Take breaks; mix tired ears = bad decisions."],
    quizHard: [
      { q: "Best mixing reference comparison method?", options: ["Match peak meters", "Match LUFS loudness", "Match RMS only", "Compare visually"], answer: 1 },
      { q: "Subtractive EQ typically comes…", options: ["After compression", "Before compression", "After reverb", "Last"], answer: 1 },
      { q: "Best comparison method when referencing?", options: ["Match peaks", "Match LUFS loudness", "Match RMS only", "By eye"], answer: 1 },
    ],
  },

  "music-tech-integration": {
    hook: "DAW + interface + controllers + plugins + monitors — a working production setup.",
    beginner: {
      what: [
        "A modern setup integrates: a computer running the DAW, an audio interface for I/O, a MIDI controller for playing instruments, monitor speakers and headphones for listening, and a plugin library for sounds and effects.",
        "These need to be configured together: interface drivers installed, MIDI controller mapped to DAW, monitors calibrated to a reference level, plugins authorised and organised.",
        "Once set up, you should be able to open a new project and start creating in under a minute — that's the goal of integration.",
      ],
      why: ["A frictionless setup means you create more.", "Every minute spent fighting your tools is a minute not making music.", "Workflow tools (templates, hotkeys, controller mappings) compound over time."],
      analogy: "An integrated setup is a chef's mise en place — every tool ready before service starts.",
    },
    advanced: {
      what: [
        "Default template: pre-routed tracks, sends, bus structure, favourite instruments, monitoring chain.",
        "MIDI controller mapping: transport (play/stop/record), key parameters (volume, send, macro), instrument-specific maps (Push 3 for Ableton).",
        "Plugin organisation: folder structure, favourites, racks for common combinations.",
        "Backup strategy: cloud sync of projects, sample library on dedicated SSD, regular Time Machine / equivalent.",
      ],
      edgeCases: ["Plugin authorisation issues — always document license servers and serial numbers.", "Sample library mounted from network drive — slow load times.",
      "Plugin authorisation expires when libraries move drives — keep a documented list of serials.",],
      engineerNotes: ["Time invested in setup pays back 100× over a year.", "Build templates per genre or workflow (one for tracking, one for mixing).", "Practice opening a fresh project and starting in <60 seconds as a drill."],
    },
    flow: "Computer + Interface + Controllers + Plugins + Monitors → Configured + Templated → Friction-free workflow",
    walkthrough: [
      { do: "Build a default Live template with your standard tracks and routing.", listen: "Every new project ready to go." },
      { do: "Map your MIDI controller's transport and key knobs.", listen: "Hands-on control without mousing." },
      { do: "Organise plugins into a sensible folder structure.", listen: "Faster search means faster creativity." },
      { do: "Build a Live template with sends, bus structure and your favourite drum rack pre-loaded.", listen: "Time to first note drops to seconds." },
      { do: "Map your controller's transport and 8 macros once, save as User Remote Script.", listen: "Hands stay on the controller; mouse stays unused." },
    ],
    listenFor: ["Workflow friction points — automate or template them out.", "Re-occurring setup tasks — script them.", "Time-to-first-note from cold start (aim <60s).",
      "Friction points in your workflow — each is a template or shortcut waiting to happen.",],
    mistakes: ["Tweaking setup more than making music.", "Skipping templates and starting from blank every time.", "Ignoring backup until the disaster happens."],
    proMoves: ["Build genre-specific templates.", "Map a 'panic' shortcut for instant CPU freeze.", "Backup automatically — never manually."],
    quizHard: [
      { q: "Best time investment in early production?", options: ["Buying more plugins", "Building templates and learning shortcuts", "Tweaking monitor placement weekly", "Reading forum threads"], answer: 1 },
      { q: "Most important hardware piece?", options: ["Most expensive synth", "Audio interface", "Most expensive plugin", "RGB lighting"], answer: 1 },
      { q: "Highest-leverage early-career investment?", options: ["More plugins", "Templates + shortcut fluency", "Newer interface", "Studio monitors upgrade"], answer: 1 },
    ],
  },

  "foundations-complete": {
    hook: "You finished the Foundations world. You now have the model every other module sits on.",
    beginner: {
      what: [
        "Capstone for everything: you understand sound (pressure waves with frequency, amplitude, timbre, space), rhythm (tempo, meter, subdivision, groove, syncopation), melody (scales, intervals, pentatonic, phrasing), harmony (chords, progressions, keys, layered arrangement), and tech (DAW, signal chain, effects, mixing basics).",
        "From here, the deeper worlds (First Contact, Devices, Mixing, Performance, MIDI & Instruments, Live 12 Power) zoom into specifics. None of them will surprise you — you have the framework to absorb them.",
        "Final drill: build a 60-second loop that uses one concept from each path. Sound design choice + rhythm pattern + melody + chord progression + signal chain. If you can do that, you've internalised the foundation.",
      ],
      why: ["Every advanced concept builds on what's here.", "You can now learn from any source (YouTube, books, courses) and place new information into a clear mental model.", "You're no longer dependent on tutorials — you can reverse-engineer what you hear."],
    },
    advanced: {
      what: [
        "Synthesis: you can predict what a saw + LP filter + ADSR will sound like before loading it.",
        "Rhythm: you can hear a groove and identify the swing %, syncopation pattern, and likely note values.",
        "Harmony: you can transcribe a chord progression in Roman numerals and transpose to any key.",
        "Mix: you can listen to a commercial mix and identify the signal chain decisions per instrument.",
        "You're production-literate. Now go make a track per week for a year.",
      ],
      edgeCases: ["Beware Dunning-Kruger — you'll hit a wall around month 6 when you start hearing flaws everywhere. That's progress.", "Output over input — make tracks, don't just consume content."],
      engineerNotes: ["Finish projects. Released bad tracks teach more than perfect unreleased ones.", "Find collaborators — feedback accelerates growth.", "Keep returning to fundamentals — pros revisit basics constantly."],
    },
    flow: "Sound + Rhythm + Melody + Harmony + Tech → Working production model → Apply forever",
    walkthrough: [
      { do: "Build a 60-second loop integrating one concept from each path.", listen: "Cohesive idea using full foundation." },
      { do: "Bounce and listen on phone speakers.", listen: "Translation check." },
      { do: "Share with one trusted listener for feedback.", listen: "Growth depends on external ears." },
    ],
    listenFor: ["Cohesion across all elements.", "Translation across systems.", "Your own growing critical ear."],
    mistakes: ["Stopping here and not making music.", "Chasing more theory before applying current knowledge.", "Skipping the 'one track per week' practice."],
    proMoves: ["Make a finished track per week for a year — non-negotiable.", "Share work publicly even when uncomfortable.", "Return to Foundations missions in 6 months — they'll read differently."],
    quizHard: [
      { q: "Best post-Foundations practice?", options: ["More theory courses", "Make one finished track per week", "Watch tutorials all day", "Buy more plugins"], answer: 1 },
      { q: "Sign of real progress?", options: ["Hearing more flaws in your work", "Thinking everything you make is great", "Spending more time on settings", "Buying more gear"], answer: 0 },
    ],
  },
};
