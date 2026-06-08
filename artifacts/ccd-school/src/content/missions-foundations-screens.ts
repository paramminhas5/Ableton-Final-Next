import type { LessonScreen } from "./types";


// ─────────────────────────────────────────────────────────────────────────────
// CHAPTER 1 · SOUND SCIENCE
// Path 1: Acoustics — what-is-sound, frequency-pitch, amplitude-volume, timbre-tone
// Path 2: Perception — waveforms, sound-in-space, overtones-harmonics, how-we-hear
// ─────────────────────────────────────────────────────────────────────────────

export const SCREENS_WHAT_IS_SOUND: LessonScreen[] = [
  {
    kind: "hook",
    emoji: "🔊",
    headline: "Everything you hear is a wave",
    subtext: "Sound is pressure moving through air — nothing more.",
  },
  {
    kind: "concept",
    title: "What is sound?",
    body: "Sound is a wave of pressure changes in air. Something vibrates, pushes air molecules together and apart, and those pressure changes travel to your ear.",
    keyFact: "No air = no sound. There is no sound in space.",
    visual: "waveform",
  },
  {
    kind: "concept",
    title: "Vibration creates sound",
    body: "Every sound source vibrates: a speaker cone, a guitar string, your vocal cords. The faster it vibrates, the higher the pitch. The harder it vibrates, the louder the sound.",
    keyFact: "Vibration frequency = pitch. Vibration size = volume.",
    visual: "waveform",
  },
  {
    kind: "interact",
    sim: "waveform-visualizer",
    prompt: "Tap a waveform — see the shape and hear the sound",
  },
  {
    kind: "quiz",
    q: "What is sound physically made of?",
    options: ["Light waves", "Pressure waves moving through air", "Electrical signals", "Magnetic fields"],
    answer: 1,
    explain: "Sound = pressure waves. Something vibrates, compresses air molecules, and those compressions travel outward as waves.",
  },
  {
    kind: "match",
    prompt: "Match each sound property to its description",
    pairs: [
      { left: "Frequency", right: "How fast the wave vibrates = pitch" },
      { left: "Amplitude", right: "How large the wave is = volume" },
      { left: "Medium", right: "The material sound travels through" },
      { left: "Waveform", right: "The shape of the pressure wave" },
    ],
  },
  {
    kind: "quiz",
    q: "What determines the loudness of a sound?",
    options: ["The speed of vibration", "The frequency of the wave", "The size (amplitude) of the vibration", "The temperature of the air"],
    answer: 2,
    explain: "Amplitude = how much the air pressure moves. Large amplitude = loud. Small amplitude = quiet.",
  },
  {
    kind: "summary",
    learned: ["Sound = pressure waves in air", "Vibration speed = pitch, vibration size = volume", "No medium (air/water) = no sound"],
  },
];


export const SCREENS_FREQUENCY_PITCH: LessonScreen[] = [
  { kind: "hook", emoji: "🎵", headline: "Frequency is the number behind every pitch", subtext: "440 Hz is the A above middle C — that's 440 vibrations per second." },
  {
    kind: "concept",
    title: "Frequency = pitch",
    body: "Frequency is how many times a wave cycles per second, measured in Hertz (Hz). 440 Hz = 440 cycles per second = the note A4.",
    keyFact: "Double the frequency = one octave higher.",
    visual: "frequency-bar",
  },
  {
    kind: "concept",
    title: "Human hearing range",
    body: "Human ears hear roughly 20 Hz to 20,000 Hz. Bass sits at 20–250 Hz. Midrange 250–4,000 Hz. Treble 4,000–20,000 Hz.",
    keyFact: "Sub-bass (20-60 Hz) is felt as much as heard.",
    visual: "frequency-bar",
  },
  { kind: "interact", sim: "ear-training", prompt: "Tap the higher-pitched sound", preset: { mode: "high-low" } },
  {
    kind: "audio-id",
    prompt: "Which frequency range does this tone belong to?",
    audioType: "frequency-bar",
    options: ["Sub-bass (20–60 Hz)", "Bass (60–250 Hz)", "Midrange (250–4k Hz)", "Treble (4k–20k Hz)"],
    answer: 2,
    explain: "The frequency sweep covers the full hearing range. Midrange (250 Hz–4 kHz) is the most audible region — where voices and most instruments live.",
  },
  {
    kind: "quiz",
    q: "A sound at 880 Hz compared to 440 Hz is…",
    options: ["The same pitch", "One octave lower", "One octave higher", "Twice as loud"],
    answer: 2,
    explain: "Doubling frequency raises pitch by exactly one octave. 880 Hz = A5, one octave above A4 (440 Hz).",
  },
  {
    kind: "sequence",
    prompt: "Order these frequency ranges from lowest to highest",
    items: ["Sub-bass (20–60 Hz)", "Bass (60–250 Hz)", "Midrange (250–4,000 Hz)", "Treble (4,000–20,000 Hz)"],
    explain: "Sub-bass → Bass → Midrange → Treble. This ordering mirrors the piano keyboard: left (low) to right (high). Understanding this order is fundamental to EQ work.",
  },
  {
    kind: "summary",
    learned: ["Frequency (Hz) = how many cycles per second", "Higher Hz = higher pitch; double Hz = one octave up", "Humans hear 20 Hz–20,000 Hz"],
  },
];


export const SCREENS_AMPLITUDE_VOLUME: LessonScreen[] = [
  { kind: "hook", emoji: "📊", headline: "Volume is measured in decibels", subtext: "0 dBFS is the digital ceiling — cross it and you get distortion." },
  {
    kind: "concept",
    title: "Amplitude & dBFS",
    body: "Amplitude is the height of a wave — how much the air (or signal) moves. In digital audio we measure amplitude in dBFS (decibels Full Scale). 0 dBFS = maximum before clipping.",
    keyFact: "0 dBFS = clip. Aim for peaks at −6 dBFS.",
    visual: "amplitude-dial",
  },
  {
    kind: "concept",
    title: "The decibel scale",
    body: "Decibels are logarithmic: +6 dB ≈ double the perceived loudness. −∞ dB = silence. Every 3 dB increase roughly doubles the acoustic power.",
    keyFact: "+6 dB ≈ twice as loud. −20 dB is very quiet.",
    visual: "headroom-meter",
  },
  { kind: "interact", sim: "decibel-meter", prompt: "Drag the fader — hear volume change, watch the meter" },
  {
    kind: "type-answer",
    q: "At what dBFS level should your loudest peaks sit during a mix? (Write the number, e.g. −6)",
    acceptableAnswers: ["-6", "−6", "-6 dBFS", "−6 dBFS", "minus 6"],
    explain: "−6 dBFS leaves 6 decibels of headroom for effects, transients, and mastering. Mixing right up to 0 dBFS leaves no room and risks clipping downstream.",
    hint: "It's 6 decibels below the ceiling",
  },
  {
    kind: "quiz",
    q: "What happens when a digital signal exceeds 0 dBFS?",
    options: ["It becomes quieter", "It clips — creating harsh distortion", "It reverbs automatically", "Nothing changes"],
    answer: 1,
    explain: "Digital clipping is hard and ugly. When the signal hits the ceiling (0 dBFS), the tops of the waveform get cut flat, creating harsh harmonic distortion.",
  },
  {
    kind: "summary",
    learned: ["Amplitude = wave height = perceived loudness", "0 dBFS = digital ceiling — stay below it", "Aim for peaks at −6 dBFS while mixing"],
  },
];

export const SCREENS_TIMBRE_TONE: LessonScreen[] = [
  { kind: "hook", emoji: "🎸", headline: "Same note, totally different sound", subtext: "A piano and guitar both play C4 — but sound nothing alike. That's timbre." },
  {
    kind: "concept",
    title: "What is timbre?",
    body: "Timbre (TAM-ber) is the tonal colour of a sound — what makes a violin different from a flute at the same pitch and volume. It's defined by harmonic content and the shape of the attack.",
    keyFact: "Timbre = which harmonics are present + how loud each is.",
    visual: "waveform-compare",
  },
  {
    kind: "concept",
    title: "Harmonics create timbre",
    body: "Every real-world sound contains a fundamental frequency plus overtones (harmonics) at whole-number multiples. A sawtooth wave is bright because it contains ALL harmonics. A sine wave is pure because it has NONE.",
    keyFact: "More harmonics = brighter. Fewer harmonics = purer.",
    visual: "waveform",
  },
  { kind: "interact", sim: "waveform-visualizer", prompt: "Switch waveforms — hear how timbre changes" },
  {
    kind: "audio-id",
    prompt: "Which waveform shape are you hearing?",
    audioType: "waveform-compare",
    options: ["Sine wave (pure, smooth)", "Square wave (hollow, buzzy)", "Sawtooth wave (bright, full)", "Triangle wave (soft, mellow)"],
    answer: 2,
    explain: "The sawtooth contains all harmonics at every integer multiple — that's what creates its buzzy, full sound. It's the classic wave for leads and basses before filtering.",
  },
  {
    kind: "quiz",
    q: "Two instruments play the same note at the same volume. What makes them sound different?",
    options: ["Tempo", "Timbre — different harmonic content", "The room size", "The microphone used"],
    answer: 1,
    explain: "Timbre is determined by the mix of harmonics and the amplitude envelope (attack, decay, sustain, release). Same pitch, different harmonic recipe = different timbre.",
  },
  {
    kind: "summary",
    learned: ["Timbre = tonal colour — what makes sounds distinct", "Harmonics (overtones) shape timbre", "Sine = pure (no harmonics). Saw = bright (all harmonics)"],
  },
];


// Path 2 — Perception
export const SCREENS_WAVEFORMS: LessonScreen[] = [
  { kind: "hook", emoji: "〰️", headline: "4 shapes make every synth sound", subtext: "Sine, square, sawtooth, triangle — these are the building blocks." },
  {
    kind: "concept",
    title: "The 4 fundamental waves",
    body: "Every synthesiser starts with one of four waveforms. Each has a unique harmonic content that gives it a distinctive sound character.",
    keyFact: "Pick a wave → shape it with filters and envelopes → get any sound.",
    visual: "waveform-compare",
  },
  { kind: "interact", sim: "waveform-visualizer", prompt: "Tap each wave — see the shape, hear the character" },
  {
    kind: "match",
    prompt: "Match each waveform to its harmonic content",
    pairs: [
      { left: "Sine", right: "No harmonics — pure fundamental only" },
      { left: "Square", right: "Odd harmonics only (1, 3, 5…)" },
      { left: "Sawtooth", right: "All harmonics (1, 2, 3, 4…)" },
      { left: "Triangle", right: "Weak odd harmonics — mellow" },
    ],
  },
  {
    kind: "quiz",
    q: "Which waveform contains ONLY the fundamental frequency — no harmonics?",
    options: ["Sawtooth", "Square", "Triangle", "Sine"],
    answer: 3,
    explain: "The sine wave is the purest sound in nature — one single frequency, no overtones. Everything else is a combination of sine waves at different frequencies (Fourier theorem).",
  },
  {
    kind: "summary",
    learned: ["Sine = pure (no harmonics)", "Square = hollow (odd harmonics)", "Sawtooth = bright (all harmonics)", "Triangle = soft (weak odd harmonics)"],
  },
];

export const SCREENS_SOUND_IN_SPACE: LessonScreen[] = [
  { kind: "hook", emoji: "🏛", headline: "Every room shapes what you hear", subtext: "The same sound in a church vs a cupboard sounds completely different." },
  {
    kind: "concept",
    title: "Reverb & reflection",
    body: "When sound hits a wall, it reflects back. Hundreds of reflections arriving at slightly different times create reverb — the sense of space. Longer room = longer reverb tail.",
    keyFact: "Reverb time (RT60) = how long a sound takes to fade 60 dB.",
    visual: "signal-chain",
  },
  {
    kind: "concept",
    title: "Room acoustics in production",
    body: "In a DAW, reverb plugins simulate rooms, halls, plates and springs. Pre-delay (the gap before reverb starts) separates the dry sound from the wet tail, adding clarity.",
    keyFact: "Pre-delay = keeps vocal clear while adding space.",
  },
  { kind: "interact", sim: "routing-puzzle", prompt: "Route the signal: Instrument → Reverb → Output" },
  {
    kind: "type-answer",
    q: "What is the standard measurement for how long a reverb tail lasts? (abbreviation)",
    acceptableAnswers: ["RT60", "rt60", "RT-60"],
    explain: "RT60 (Reverberation Time 60 dB) is the standard measure. It's the time in seconds for sound energy to decay by 60 dB after the source stops. A concert hall has RT60 of 2–3 seconds.",
    hint: "It's an abbreviation ending in the number 60",
  },
  {
    kind: "quiz",
    q: "What does pre-delay do on a reverb plugin?",
    options: ["Slows down the attack of the reverb", "Adds a short gap between the dry sound and the reverb tail", "Increases reverb time", "Cuts high frequencies from the reverb"],
    answer: 1,
    explain: "Pre-delay creates a gap (5–30ms typically) before the reverb starts. This lets the direct sound hit your ear first, keeping it clear and intelligible before the space washes in.",
  },
  {
    kind: "summary",
    learned: ["Reverb = reflections creating sense of space", "RT60 = standard measure of reverb decay time", "Pre-delay keeps dry signal clear before reverb tail"],
  },
];


export const SCREENS_OVERTONES_HARMONICS: LessonScreen[] = [
  { kind: "hook", emoji: "🎻", headline: "One note contains many frequencies", subtext: "Hit middle C on a piano and you hear C — plus hidden frequencies above it." },
  {
    kind: "concept",
    title: "The harmonic series",
    body: "When you play a note, you hear the fundamental plus harmonics at 2x, 3x, 4x the fundamental frequency. These harmonics are always present — their relative loudness defines the timbre.",
    keyFact: "Harmonic 2 = octave above. Harmonic 3 = octave + fifth.",
    visual: "frequency-bar",
  },
  { kind: "interact", sim: "ear-training", prompt: "Listen — identify the instrument by its harmonic content", preset: { mode: "timbre" } },
  {
    kind: "sequence",
    prompt: "Order the harmonics of a 100 Hz note from lowest to highest",
    items: ["100 Hz (fundamental)", "200 Hz (2nd harmonic)", "300 Hz (3rd harmonic)", "400 Hz (4th harmonic)"],
    explain: "Harmonics are always at integer multiples of the fundamental: ×1 (fundamental), ×2, ×3, ×4 and so on. The 2nd harmonic (×2) is one octave up.",
  },
  {
    kind: "quiz",
    q: "In synthesis, a filter removes harmonics. What does a low-pass filter do to brightness?",
    options: ["Makes it brighter", "Has no effect on brightness", "Removes high harmonics — makes it darker", "Adds new harmonics"],
    answer: 2,
    explain: "A low-pass filter cuts frequencies above a cutoff point. Removing high harmonics makes a sound darker and warmer — the classic synth 'filter sweep' effect.",
  },
  {
    kind: "summary",
    learned: ["Every note contains harmonics at 2×, 3×, 4× the fundamental", "Harmonic balance = timbre", "Low-pass filter cuts high harmonics → darker sound"],
  },
];

export const SCREENS_HOW_WE_HEAR: LessonScreen[] = [
  { kind: "hook", emoji: "👂", headline: "Your ears are not flat — they have opinions", subtext: "Loud low frequencies need much more power than loud high frequencies." },
  {
    kind: "concept",
    title: "Equal-loudness contours",
    body: "Human hearing is most sensitive between 2–5 kHz (consonants in speech). At the same SPL, a 1 kHz tone sounds much quieter than a 3 kHz tone. This is why mix engineers use reference tracks.",
    keyFact: "We're most sensitive at 2–5 kHz — the speech range.",
    visual: "eq-curve",
  },
  {
    kind: "concept",
    title: "Practical impact on mixing",
    body: "At low listening volumes, bass and treble drop away faster than mids (Fletcher-Munson). Mix at a consistent moderate volume and check on multiple systems — your ears lie when fatigued.",
    keyFact: "Mix loud = bass-heavy result. Mix quiet = check mids.",
  },
  { kind: "interact", sim: "ear-training", prompt: "Which tone sounds louder? Trust your ears", preset: { mode: "loudness" } },
  {
    kind: "quiz",
    q: "Human hearing is most sensitive in which frequency range?",
    options: ["20–100 Hz", "2,000–5,000 Hz", "8,000–12,000 Hz", "100–200 Hz"],
    answer: 1,
    explain: "The ear is tuned for the human voice. 2–5 kHz contains speech consonants — we evolved to hear this range very clearly. This is why harshness in mixes often lives at 3–4 kHz.",
  },
  {
    kind: "match",
    prompt: "Match each mixing scenario to its Fletcher-Munson consequence",
    pairs: [
      { left: "Mixing too loud", right: "Bass-heavy results at normal volume" },
      { left: "Mixing too quiet", right: "Under-boosted mids and treble" },
      { left: "Ear fatigue", right: "Can't accurately judge balance" },
    ],
  },
  {
    kind: "summary",
    learned: ["Ears are most sensitive at 2–5 kHz (speech range)", "Low volumes = bass and treble seem quieter", "Mix at consistent volume, check on multiple systems"],
  },
];


// ─────────────────────────────────────────────────────────────────────────────
// CHAPTER 2 · RHYTHM & TIME
// Path 1: Pulse & Tempo — what-is-rhythm, tempo-bpm, bars-time-signatures, groove-feel
// Path 2: Groove & Subdivision — syncopation, polyrhythm, note-values, rhythm-in-production
// ─────────────────────────────────────────────────────────────────────────────

export const SCREENS_WHAT_IS_RHYTHM: LessonScreen[] = [
  { kind: "hook", emoji: "🥁", headline: "Rhythm is the skeleton of music", subtext: "Without it, notes are just noise. With it, music has direction." },
  {
    kind: "concept",
    title: "Pulse & rhythm",
    body: "The pulse (beat) is the steady underlying tick of music — what you tap your foot to. Rhythm is patterns of sounds laid on top of the pulse, some on the beat, some between.",
    keyFact: "Pulse = steady. Rhythm = pattern on top of the pulse.",
    visual: "bpm-grid",
  },
  { kind: "interact", sim: "beat-builder", prompt: "Tap the pads — build a basic beat on the pulse" },
  {
    kind: "quiz",
    q: "What is the difference between beat and rhythm?",
    options: [
      "They are the same thing",
      "Beat is the steady pulse; rhythm is the pattern of sounds over it",
      "Beat is fast, rhythm is slow",
      "Beat is for drums only; rhythm is for melodic instruments",
    ],
    answer: 1,
    explain: "The beat is the metronomic backbone. Rhythm is what musicians play against it — syncopated notes, rests, accents. Great rhythm feels purposeful against the pulse.",
  },
  {
    kind: "type-answer",
    q: "In 4/4 time, beats 1 and 3 are 'strong' beats. What are beats 2 and 4 called?",
    acceptableAnswers: ["weak beats", "off-beats", "offbeats", "backbeats", "back beats"],
    explain: "Beats 2 and 4 are the weak beats (also called backbeats). In rock and pop, the snare hits on these weak beats — creating the defining push-pull feel of popular music.",
    hint: "Think about what the snare drum plays in most pop songs",
  },
  {
    kind: "summary",
    learned: ["Pulse = the steady underlying beat", "Rhythm = patterns played over the pulse", "Beats 1 & 3 = strong downbeats in 4/4"],
  },
];

export const SCREENS_TEMPO_BPM: LessonScreen[] = [
  { kind: "hook", emoji: "⏱", headline: "BPM is the heartbeat of a track", subtext: "125 BPM house, 140 BPM techno, 90 BPM hip-hop — tempo sets the mood." },
  {
    kind: "concept",
    title: "BPM = Beats Per Minute",
    body: "BPM counts how many beats happen in 60 seconds. 120 BPM = 2 beats per second. Tempo determines the energy and genre feel of a track.",
    keyFact: "BPM range by genre: Hip-hop 80–100, House 120–130, Techno 130–150, D&B 170–180.",
    visual: "bpm-grid",
  },
  { kind: "interact", sim: "bpm-tap", prompt: "Tap the button in time — discover the BPM" },
  {
    kind: "match",
    prompt: "Match each genre to its typical BPM range",
    pairs: [
      { left: "Hip-hop", right: "80–100 BPM" },
      { left: "House", right: "120–130 BPM" },
      { left: "Techno", right: "130–150 BPM" },
      { left: "Drum and Bass", right: "170–180 BPM" },
    ],
  },
  {
    kind: "quiz",
    q: "A track at 140 BPM has how many beats per second?",
    options: ["1.4", "2.33", "14", "70"],
    answer: 1,
    explain: "140 BPM ÷ 60 seconds = 2.33 beats per second. You can feel this — count 1-2-3 quickly in one second and you're close to 140 BPM.",
  },
  {
    kind: "summary",
    learned: ["BPM = beats per minute — the tempo of a track", "Genre determines typical BPM range", "Tap tempo = fastest way to find the BPM of a track"],
  },
];


export const SCREENS_BARS_TIME_SIGNATURES: LessonScreen[] = [
  { kind: "hook", emoji: "📏", headline: "Music is measured in bars", subtext: "A bar is a unit of time. In 4/4, every bar has exactly 4 beats." },
  {
    kind: "concept",
    title: "Bars & time signatures",
    body: "A bar (or measure) groups beats together. The time signature tells you how many beats per bar (top number) and which note value = one beat (bottom number).",
    keyFact: "4/4 = 4 beats per bar, quarter note = 1 beat.",
    visual: "bpm-grid",
  },
  {
    kind: "concept",
    title: "Common time signatures",
    body: "4/4 is standard for pop, rock, electronic. 3/4 is waltz (1-2-3). 6/8 feels like two groups of three. 5/4 is irregular — odd-feeling grooves.",
    keyFact: "Pop music is almost always 4/4.",
  },
  { kind: "interact", sim: "beat-builder", prompt: "Build a 4/4 drum beat — 4 kicks in a bar" },
  {
    kind: "sequence",
    prompt: "Put these time signatures in order from fewest to most beats per bar",
    items: ["3/4 (3 beats)", "4/4 (4 beats)", "5/4 (5 beats)", "6/8 (6 eighth-note beats)"],
    explain: "3/4 has 3 beats per bar (waltz). 4/4 has 4 (pop/rock standard). 5/4 has 5 (odd, used in jazz/prog). 6/8 has 6 eighth-note beats, felt as two groups of three.",
  },
  {
    kind: "quiz",
    q: "In the time signature 4/4, the bottom '4' means…",
    options: ["4 beats per bar", "The quarter note (crotchet) gets one beat", "4 measures per section", "4 seconds per bar"],
    answer: 1,
    explain: "The bottom number indicates which note value = 1 beat. '4' = quarter note. '8' = eighth note. '2' = half note.",
  },
  {
    kind: "summary",
    learned: ["Bars group beats into regular units", "Time sig top = beats per bar; bottom = beat note value", "4/4 dominates pop, electronic, and rock music"],
  },
];

export const SCREENS_GROOVE_FEEL: LessonScreen[] = [
  { kind: "hook", emoji: "🕺", headline: "Groove is the human element in rhythm", subtext: "Perfectly quantised drums feel robotic. Groove puts the life back in." },
  {
    kind: "concept",
    title: "What is groove?",
    body: "Groove is the subtle timing variation that makes rhythm feel alive. Drum machines are perfect — humans are slightly ahead or behind the beat, and that imperfection is what makes you want to dance.",
    keyFact: "Rushing the beat = excitement. Dragging = relaxed.",
    visual: "rhythm-dots",
  },
  {
    kind: "concept",
    title: "Swing & shuffle",
    body: "Swing delays every other 8th note slightly, turning a straight 1-and-2-and into a lopsided 1-(pause)-and feel. Jazz, funk and hip-hop are built on swing.",
    keyFact: "Swing = 50% straight → 67% swing ratio = triplet feel.",
  },
  { kind: "interact", sim: "groove-extractor", prompt: "Hear straight vs swung — feel the difference" },
  {
    kind: "audio-id",
    prompt: "Is this groove straight or swung?",
    audioType: "bpm-grid",
    options: ["Straight 8ths (perfectly even)", "Swung (lopsided, jazzy)", "Triplet feel (3 against 2)", "Dotted rhythm"],
    answer: 0,
    explain: "Straight 8th notes are perfectly even — each 'and' falls exactly halfway between beats. Swing delays these 'ands' to give a lopsided, jazzy feel. Most drum machines default to straight.",
  },
  {
    kind: "quiz",
    q: "What does 'quantising' drums in a DAW do?",
    options: [
      "Adds swing to the pattern",
      "Snaps notes to the nearest grid position — removes human timing variation",
      "Changes the BPM",
      "Transposes the drum sounds to a different pitch",
    ],
    answer: 1,
    explain: "Quantise = snap to grid. It corrects timing but removes the micro-variations that create groove. Most producers use partial quantise (e.g. 70%) to keep some human feel.",
  },
  {
    kind: "summary",
    learned: ["Groove = subtle timing variation that makes rhythm feel alive", "Swing delays every other 8th note for a lopsided feel", "Full quantise removes groove — use partial quantise to preserve feel"],
  },
];


// Path 2 — Groove & Subdivision
export const SCREENS_SYNCOPATION: LessonScreen[] = [
  { kind: "hook", emoji: "🔀", headline: "Syncopation hits when you don't expect it", subtext: "The off-beat accent is what makes funk, reggae, and house feel so good." },
  {
    kind: "concept",
    title: "On-beat vs off-beat",
    body: "In 4/4, beats 1-2-3-4 are 'on-beat'. The 'and' (eighth notes between beats) are 'off-beat'. Syncopation accents the off-beats, creating rhythmic tension.",
    keyFact: "Funk bass lines live almost entirely on off-beats.",
    visual: "rhythm-dots",
  },
  { kind: "interact", sim: "beat-builder", prompt: "Move the kick to beat 2.5 — feel the syncopation" },
  {
    kind: "quiz",
    q: "Syncopation means accenting…",
    options: ["Beat 1 only", "Beats 1 and 3", "The off-beats between main beats", "Every beat equally"],
    answer: 2,
    explain: "Syncopation displaces rhythmic accent to the 'weak' parts of the bar — the 'ands', the 'e's and 'ah's. This rhythmic tension is the basis of funk, reggae, hip-hop and most dance music.",
  },
  {
    kind: "type-answer",
    q: "A note on the 'and' of beat 2 falls exactly halfway between beat 2 and beat 3. What is this position called? (two words)",
    acceptableAnswers: ["off beat", "off-beat", "offbeat", "the and", "upbeat", "up beat"],
    explain: "The 'ands' (eighth note positions between beats) are called off-beats or upbeats. They are the rhythmic tension points — syncopation happens when you accent these instead of the main beats.",
    hint: "It's the opposite of 'on-beat'",
  },
  {
    kind: "summary",
    learned: ["Syncopation = accent on off-beats, not main beats", "Off-beats are the 'ands' between beats 1-2-3-4", "Syncopation is the foundation of funk, reggae, and house"],
  },
];

export const SCREENS_POLYRHYTHM: LessonScreen[] = [
  { kind: "hook", emoji: "🌀", headline: "Two rhythms at once — and they cycle back", subtext: "Polyrhythm is when different subdivisions play simultaneously." },
  {
    kind: "concept",
    title: "What is polyrhythm?",
    body: "Polyrhythm is two or more rhythms with different cycle lengths playing simultaneously. The simplest: 3-against-2 (a triplet over a duplet). They diverge then meet again.",
    keyFact: "3-against-2: they meet again every 6 eighth notes.",
    visual: "rhythm-dots",
  },
  {
    kind: "concept",
    title: "Polyrhythm in electronic music",
    body: "Afrobeat, Brazilian music and African drumming are built on polyrhythm. In electronic music, you create it by setting different pattern lengths (e.g. 8-step kick, 12-step hi-hat).",
    keyFact: "Different pattern lengths = automatic polyrhythm.",
  },
  { kind: "interact", sim: "beat-builder", prompt: "Set kick every 4 steps, hi-hat every 3 steps — hear the pattern" },
  {
    kind: "quiz",
    q: "In a 3-against-2 polyrhythm, the two parts align again after…",
    options: ["3 beats", "2 beats", "6 beats (LCM of 3 and 2)", "12 beats"],
    answer: 2,
    explain: "The lowest common multiple of 2 and 3 is 6. After 6 8th notes, both the duplet (2) and triplet (3) patterns land on the same beat again. That's the cycle length.",
  },
  {
    kind: "match",
    prompt: "Match each world music tradition to its polyrhythmic technique",
    pairs: [
      { left: "West African drumming", right: "Interlocking rhythms across 3+ players" },
      { left: "Brazilian samba", right: "16th-note patterns with offset accents" },
      { left: "Electronic music", right: "Different-length step patterns that cycle out of sync" },
    ],
  },
  {
    kind: "summary",
    learned: ["Polyrhythm = two rhythms with different cycle lengths playing together", "They diverge then realign at the LCM", "Different Ableton pattern lengths create polyrhythm automatically"],
  },
];


export const SCREENS_NOTE_VALUES: LessonScreen[] = [
  { kind: "hook", emoji: "🎼", headline: "Notes have time values, not just pitches", subtext: "A whole note lasts 4 beats. A 16th note lasts a quarter of one beat." },
  {
    kind: "concept",
    title: "Note values",
    body: "Whole = 4 beats. Half = 2 beats. Quarter = 1 beat. Eighth = ½ beat. Sixteenth = ¼ beat. Each halves the previous. In a DAW, these are grid divisions.",
    keyFact: "16th notes are the standard grid in electronic music.",
    visual: "note-lengths",
  },
  { kind: "interact", sim: "beat-builder", prompt: "Switch between 8th and 16th note grids — hear the difference" },
  {
    kind: "sequence",
    prompt: "Order these note values from longest to shortest",
    items: ["Whole note (4 beats)", "Half note (2 beats)", "Quarter note (1 beat)", "Eighth note (½ beat)", "Sixteenth note (¼ beat)"],
    explain: "Each step is half the duration of the previous. Whole → Half → Quarter → Eighth → Sixteenth. In a bar of 4/4: 1 whole, 2 halves, 4 quarters, 8 eighths, or 16 sixteenths.",
  },
  {
    kind: "quiz",
    q: "How many 16th notes fit in one bar of 4/4?",
    options: ["4", "8", "16", "32"],
    answer: 2,
    explain: "4 beats per bar × 4 sixteenth notes per beat = 16 sixteenth notes per bar. This is why the 16-step sequencer is the standard in drum machines.",
  },
  {
    kind: "summary",
    learned: ["Whole=4 beats, Half=2, Quarter=1, Eighth=½, Sixteenth=¼", "Each subdivision halves the previous", "16-step grids are standard in electronic music"],
  },
];

export const SCREENS_RHYTHM_IN_PRODUCTION: LessonScreen[] = [
  { kind: "hook", emoji: "🎛", headline: "The DAW grid is your rhythm map", subtext: "Every note you place sits on a grid position. The grid is the bar, subdivided." },
  {
    kind: "concept",
    title: "The DAW grid",
    body: "In Ableton and any DAW, the horizontal timeline is divided into bars, beats and subdivisions. Snap notes to the grid for tight rhythms, or nudge off-grid for human feel.",
    keyFact: "Tighter grid = more quantised. Off-grid = human feel.",
    visual: "bpm-grid",
  },
  {
    kind: "concept",
    title: "MIDI note length in production",
    body: "In a piano roll, short notes (staccato) create punchy rhythms. Long notes sustain. Note length is as important as position — a 16th-note hi-hat feels very different to a quarter-note hi-hat.",
    keyFact: "Short = staccato/punchy. Long = sustained/smooth.",
  },
  { kind: "interact", sim: "beat-builder", prompt: "Build an 8-bar groove with kick, snare and hi-hat" },
  {
    kind: "match",
    prompt: "Match each groove technique to what it achieves",
    pairs: [
      { left: "Velocity variation", right: "Ghost notes + accents feel human" },
      { left: "Slight off-grid nudge", right: "Timing imperfection = live feel" },
      { left: "Short note length", right: "Staccato, punchy rhythm" },
      { left: "Full quantise", right: "Robotic, locked-in grid feel" },
    ],
  },
  {
    kind: "quiz",
    q: "In Ableton, how do you make a drum pattern feel more human?",
    options: [
      "Use only whole notes",
      "Nudge some notes slightly off-grid and vary velocity",
      "Set BPM to exactly 120",
      "Increase the sample rate",
    ],
    answer: 1,
    explain: "Humanise by: slight off-grid timing (nudge), varying velocity (not all hits at the same volume), and occasional ghost notes. These micro-variations create groove.",
  },
  {
    kind: "summary",
    learned: ["DAW grid = bar divided into beats and subdivisions", "Note position AND length define the rhythm", "Off-grid nudging + velocity variation = human groove feel"],
  },
];


// ─────────────────────────────────────────────────────────────────────────────
// CHAPTER 3 · MELODY & PITCH
// Path 1: Notes & Scales — notes-and-octaves, major-scale, minor-scale, intervals
// Path 2: Ear & Expression — pentatonic-scales, melody-writing, ear-training, transposition-modes
// ─────────────────────────────────────────────────────────────────────────────

export const SCREENS_NOTES_AND_OCTAVES: LessonScreen[] = [
  { kind: "hook", emoji: "🎹", headline: "12 notes repeat across octaves forever", subtext: "C-D-E-F-G-A-B, then back to C — just one octave higher." },
  {
    kind: "concept",
    title: "The 12 notes",
    body: "Western music uses 12 notes: C C# D D# E F F# G G# A A# B. Then the pattern repeats. These 12 notes cover all keys, all scales, all chords.",
    keyFact: "12 semitones = one octave. C4 = middle C = 261.6 Hz.",
    visual: "piano",
  },
  {
    kind: "concept",
    title: "Octaves",
    body: "An octave is the same note at double (or half) the frequency. C4 = 261 Hz. C5 = 522 Hz. They sound like the 'same' note because our brains perceive frequency ratios.",
    keyFact: "Octave up = ×2 frequency. Octave down = ÷2.",
    visual: "piano-octave",
  },
  { kind: "interact", sim: "note-explorer", prompt: "Tap notes on the keyboard — hear pitch change" },
  {
    kind: "type-answer",
    q: "How many semitones (half-steps) are in one octave?",
    acceptableAnswers: ["12", "twelve"],
    explain: "One octave = 12 semitones. Count every key (white and black) from C to the next C on a piano — that's 12 steps. This is the same in every key.",
  },
  {
    kind: "quiz",
    q: "If A4 = 440 Hz, what is A5?",
    options: ["220 Hz", "880 Hz", "480 Hz", "440 Hz"],
    answer: 1,
    explain: "One octave up = double the frequency. A4 = 440 Hz. A5 = 880 Hz. A3 = 220 Hz. This octave doubling relationship is true for every note.",
  },
  {
    kind: "summary",
    learned: ["12 semitones (notes) form one octave", "Octave up = same note, double the frequency", "Middle C = C4 = 261.6 Hz"],
  },
];

export const SCREENS_MAJOR_SCALE: LessonScreen[] = [
  { kind: "hook", emoji: "☀️", headline: "The major scale sounds happy and bright", subtext: "7 notes, a specific pattern of steps — the foundation of Western music." },
  {
    kind: "concept",
    title: "The major scale pattern",
    body: "A major scale uses 7 of the 12 semitones, following the pattern: Whole-Whole-Half-Whole-Whole-Whole-Half steps (W W H W W W H). This pattern gives it its bright, 'happy' quality.",
    keyFact: "C major: C D E F G A B C — all white keys.",
    visual: "scale-steps",
  },
  { kind: "interact", sim: "note-explorer", prompt: "Play C-D-E-F-G-A-B-C — hear the major scale" },
  {
    kind: "sequence",
    prompt: "Put the W/H steps of a major scale in order",
    items: ["W (C→D)", "W (D→E)", "H (E→F)", "W (F→G)", "W (G→A)", "W (A→B)", "H (B→C)"],
    explain: "Major scale: W-W-H-W-W-W-H. The two half-steps (E→F and B→C) are the characteristic sound of major. Apply this pattern from any root note to get any major scale.",
  },
  {
    kind: "quiz",
    q: "C major uses only the white keys on a piano. What is the 5th note of C major?",
    options: ["D", "E", "F", "G"],
    answer: 3,
    explain: "C major: C(1) D(2) E(3) F(4) G(5) A(6) B(7). The 5th degree is G — also called the 'dominant'. It has a special relationship to the root.",
  },
  {
    kind: "summary",
    learned: ["Major scale pattern: W W H W W W H", "Sounds bright and happy", "C major = all white keys on a piano"],
  },
];


export const SCREENS_MINOR_SCALE: LessonScreen[] = [
  { kind: "hook", emoji: "🌙", headline: "The minor scale sounds dark and emotional", subtext: "Same 12 notes as major — just a different starting point and pattern." },
  {
    kind: "concept",
    title: "Natural minor scale",
    body: "The natural minor scale pattern: W H W W H W W. Compared to major, the 3rd, 6th and 7th degrees are flattened by a semitone. This creates its characteristic sadness.",
    keyFact: "A minor: A B C D E F G A — also all white keys.",
    visual: "scale-steps",
  },
  {
    kind: "concept",
    title: "Relative major and minor",
    body: "Every major scale has a 'relative minor' that uses the same notes but starts on the 6th degree. C major and A minor share all the same notes — only the tonic (home note) differs.",
    keyFact: "C major → relative minor = A minor (starts on 6th note).",
    visual: "piano",
  },
  { kind: "interact", sim: "note-explorer", prompt: "Play A-B-C-D-E-F-G-A — hear the minor sound" },
  {
    kind: "audio-id",
    prompt: "Does this scale sound major or minor?",
    audioType: "scale-steps",
    options: ["Major (bright, happy)", "Natural minor (dark, sad)", "Pentatonic (open, neutral)", "Chromatic (tense)"],
    answer: 0,
    explain: "The major scale's W-W-H pattern gives it a bright, resolved quality. The flat 3rd in minor is the key ingredient of 'sadness' — just one semitone makes all the difference.",
  },
  {
    kind: "quiz",
    q: "C major and A minor are 'relative' scales. What does this mean?",
    options: [
      "They have the same tempo",
      "They share the same set of 7 notes, different starting points",
      "They have the same number of sharps",
      "They sound identical",
    ],
    answer: 1,
    explain: "Relative scales share the same key signature (same notes). C major and A minor both use C D E F G A B — but A minor treats A as home, giving a completely different emotional quality.",
  },
  {
    kind: "summary",
    learned: ["Minor scale pattern: W H W W H W W", "Flat 3rd creates the characteristic dark quality", "Relative minor = same notes, starts on the 6th degree of major"],
  },
];

export const SCREENS_INTERVALS: LessonScreen[] = [
  { kind: "hook", emoji: "📐", headline: "An interval is the distance between two notes", subtext: "Minor 2nd = 1 semitone. Octave = 12 semitones. Every interval has a feeling." },
  {
    kind: "concept",
    title: "What is an interval?",
    body: "An interval is the distance between two pitches measured in semitones. Intervals have names: minor 2nd (1 semitone), major 3rd (4 semitones), perfect 5th (7 semitones), octave (12 semitones).",
    keyFact: "Perfect 5th = 7 semitones. Most powerful interval in music.",
    visual: "piano",
  },
  {
    kind: "concept",
    title: "Consonance vs dissonance",
    body: "Consonant intervals (perfect 5th, major/minor 3rd, octave) sound stable and resolved. Dissonant intervals (minor 2nd, tritone, major 7th) sound tense and unresolved.",
    keyFact: "Tritone (6 semitones) = most dissonant interval.",
  },
  { kind: "interact", sim: "ear-training", prompt: "Listen — identify the interval", preset: { mode: "intervals" } },
  {
    kind: "match",
    prompt: "Match each interval to its semitone count",
    pairs: [
      { left: "Minor 2nd", right: "1 semitone" },
      { left: "Major 3rd", right: "4 semitones" },
      { left: "Perfect 5th", right: "7 semitones" },
      { left: "Octave", right: "12 semitones" },
    ],
  },
  {
    kind: "quiz",
    q: "The tritone (diminished 5th) is known for…",
    options: ["Sounding extremely stable and resolved", "Being used as the perfect cadence", "Maximum dissonance — the most tense interval", "Only appearing in major scales"],
    answer: 2,
    explain: "The tritone (6 semitones, e.g. C to F#) splits the octave exactly in half. It sounds intensely tense and unstable — medieval composers called it 'diabolus in musica' (the devil in music).",
  },
  {
    kind: "summary",
    learned: ["Interval = distance between two notes in semitones", "Perfect 5th (7 semitones) = most powerful consonant interval", "Tritone (6 semitones) = maximum dissonance"],
  },
];


// Path 2 — Ear & Expression
export const SCREENS_PENTATONIC_SCALES: LessonScreen[] = [
  { kind: "hook", emoji: "🌍", headline: "5 notes that work everywhere on Earth", subtext: "Every culture independently discovered the pentatonic scale." },
  {
    kind: "concept",
    title: "The pentatonic scale",
    body: "The major pentatonic removes the 4th and 7th degrees of the major scale — the two notes that create the most tension. What remains are 5 notes that sound universally consonant together.",
    keyFact: "Major pentatonic: 1 2 3 5 6 — no tension notes.",
    visual: "piano",
  },
  {
    kind: "concept",
    title: "Why pentatonic works",
    body: "Because there are no semitone clashes between these 5 notes, everything you play sounds good. Blues, folk, rock solos, world music — nearly every genre uses pentatonic as a starting point.",
    keyFact: "C major pentatonic: C D E G A — no F, no B.",
    visual: "scale-steps",
  },
  { kind: "interact", sim: "melody-shaper", prompt: "Play a melody using only pentatonic notes" },
  {
    kind: "type-answer",
    q: "C major pentatonic removes the 4th (F) and 7th (B). Which 5 notes remain? (write them separated by spaces)",
    acceptableAnswers: ["C D E G A", "c d e g a", "C, D, E, G, A"],
    explain: "C D E G A — these 5 notes have no semitone clashes between them. Every combination sounds consonant. That's why pentatonic is the universal 'safe' scale for improvisation.",
    hint: "C major is C D E F G A B — remove F and B",
  },
  {
    kind: "quiz",
    q: "Which two scale degrees are removed to create a major pentatonic?",
    options: ["1st and 5th", "3rd and 6th", "4th and 7th", "2nd and 6th"],
    answer: 2,
    explain: "The 4th and 7th create semitone tension with other notes. Remove them and you're left with 5 'safe' notes that sound consonant together — the pentatonic scale.",
  },
  {
    kind: "summary",
    learned: ["Pentatonic = 5-note scale with tension notes removed", "Major pentatonic: 1 2 3 5 6", "Works universally — all genres, all cultures use it"],
  },
];

export const SCREENS_MELODY_WRITING: LessonScreen[] = [
  { kind: "hook", emoji: "✍️", headline: "A great melody has a shape", subtext: "It rises, peaks, then falls — just like a sentence." },
  {
    kind: "concept",
    title: "Melodic contour",
    body: "Melodic contour is the shape of a melody over time. Good melodies have direction: they build tension by rising, reach a climax (the apex), then resolve by descending.",
    keyFact: "Rise → peak → fall = the shape of almost every great hook.",
    visual: "scale-steps",
  },
  {
    kind: "concept",
    title: "What makes a hook memorable",
    body: "Repetition (hear it again), contour (a distinctive shape), rhythmic identity (a signature rhythm), and a note that surprises then resolves. The gap in your ear is what makes you hum it back.",
    keyFact: "Repetition + one unexpected note = memorable hook.",
  },
  { kind: "interact", sim: "melody-shaper", prompt: "Draw a melody — make it rise and fall" },
  {
    kind: "sequence",
    prompt: "Put the elements of a great melodic hook in order of importance",
    items: ["Strong rhythmic identity", "Distinctive rising contour", "Apex (highest tension point)", "Satisfying resolution/fall"],
    explain: "A great hook needs rhythm first (makes it memorable), then contour (shape), then an apex (climactic moment), then resolution (payoff). All four together = the anatomy of an earworm.",
  },
  {
    kind: "quiz",
    q: "The 'apex' of a melody is…",
    options: ["The first note", "The highest or most dramatic point before resolution", "The final note", "The note that repeats most often"],
    answer: 1,
    explain: "The apex is the climactic high point of a phrase. It creates maximum tension before the melody descends to resolve. Most pop hooks have their apex in the last two bars of a phrase.",
  },
  {
    kind: "summary",
    learned: ["Melodic contour = the rise/fall shape of a melody", "Apex = highest point, creates tension before resolution", "Repetition + one surprising note = memorable hook"],
  },
];

export const SCREENS_EAR_TRAINING: LessonScreen[] = [
  { kind: "hook", emoji: "👂", headline: "Train your ear — hear what you couldn't before", subtext: "Recognising intervals and chords by ear is a learnable skill." },
  {
    kind: "concept",
    title: "Interval recognition",
    body: "Each musical interval has a signature sound. Associate intervals with song references: minor 2nd = Jaws theme. Perfect 5th = Star Wars. Major 6th = My Bonnie. These anchors help ears lock in fast.",
    keyFact: "Star Wars = perfect 5th. Happy Birthday = major 2nd.",
    visual: "piano",
  },
  { kind: "interact", sim: "ear-training", prompt: "Identify the interval — listen carefully", preset: { mode: "intervals" } },
  {
    kind: "match",
    prompt: "Match each interval to its famous song mnemonic",
    pairs: [
      { left: "Minor 2nd (1 semitone)", right: "Jaws theme (dun-dun)" },
      { left: "Perfect 4th (5 semitones)", right: "Here Comes the Bride" },
      { left: "Perfect 5th (7 semitones)", right: "Star Wars theme" },
      { left: "Octave (12 semitones)", right: "Somewhere Over the Rainbow" },
    ],
  },
  {
    kind: "quiz",
    q: "Ear training is mainly useful for…",
    options: [
      "Making music louder",
      "Recognising what you hear so you can reproduce it — transcribing, jamming, correcting pitch",
      "Learning music theory faster",
      "Improving your typing speed in a DAW",
    ],
    answer: 1,
    explain: "Trained ears can identify notes, chords and intervals by sound alone. This means: faster transcription, better jamming, catching pitch problems without looking at a screen.",
  },
  {
    kind: "summary",
    learned: ["Each interval has a recognisable sound character", "Use song mnemonics to anchor interval memory", "Ear training → identify notes/chords by sound alone"],
  },
];

export const SCREENS_TRANSPOSITION_MODES: LessonScreen[] = [
  { kind: "hook", emoji: "🔄", headline: "Same pattern, different starting note", subtext: "Transposing a melody changes its key but keeps its shape identical." },
  {
    kind: "concept",
    title: "Transposition",
    body: "Transposing means moving every note in a melody or chord up or down by the same interval. The shape (intervals between notes) stays identical — only the key changes.",
    keyFact: "Transpose = shift all notes by same amount. Shape stays the same.",
    visual: "piano",
  },
  {
    kind: "concept",
    title: "The 7 modes",
    body: "Modes are scales built by starting a major scale from different degrees. Ionian (1st) = major. Dorian (2nd) = minor with raised 6th (jazzy). Phrygian (3rd) = dark flamenco. Mixolydian (5th) = blues/rock.",
    keyFact: "Dorian = minor that sounds jazzy. Mixolydian = major that sounds bluesy.",
  },
  { kind: "interact", sim: "note-explorer", prompt: "Start the C major scale on D — hear Dorian mode" },
  {
    kind: "match",
    prompt: "Match each mode to its character",
    pairs: [
      { left: "Ionian (1st)", right: "Major scale — bright, happy" },
      { left: "Dorian (2nd)", right: "Minor with raised 6th — jazzy, smooth" },
      { left: "Phrygian (3rd)", right: "Dark, Spanish/flamenco feel" },
      { left: "Mixolydian (5th)", right: "Major with flat 7th — bluesy, rock" },
    ],
  },
  {
    kind: "quiz",
    q: "Transposing a melody up by a perfect 5th means…",
    options: [
      "Playing it 5 notes higher on the keyboard",
      "Moving every note up by 7 semitones",
      "Playing it twice as fast",
      "Changing only the root note",
    ],
    answer: 1,
    explain: "A perfect 5th = 7 semitones. Transpose up by a 5th = shift every note +7 semitones. The melody's internal relationships (all intervals) stay exactly the same.",
  },
  {
    kind: "summary",
    learned: ["Transposition = shift all notes by the same interval", "7 modes = major scale starting from different degrees", "Dorian = jazzy minor. Mixolydian = bluesy major."],
  },
];


// ─────────────────────────────────────────────────────────────────────────────
// CHAPTER 4 · HARMONY & CHORDS
// Path 1: Chords & Keys — what-are-chords, chord-types, chord-progressions, keys-tonality
// Path 2: Music in Motion — tension-resolution, harmony-in-production, song-structure, listening-actively
// ─────────────────────────────────────────────────────────────────────────────

export const SCREENS_WHAT_ARE_CHORDS: LessonScreen[] = [
  { kind: "hook", emoji: "🎵", headline: "3 notes played together = a chord", subtext: "Chords are the emotional engine of music." },
  {
    kind: "concept",
    title: "What is a chord?",
    body: "A chord is three or more notes played simultaneously. The simplest chord is a triad: root + 3rd + 5th. These three notes create a harmonic colour — major = happy, minor = sad.",
    keyFact: "Triad = root + 3rd + 5th. Everything else builds from this.",
    visual: "chord-stack",
  },
  { kind: "interact", sim: "chord-stacker", prompt: "Stack root + 3rd + 5th — hear the chord" },
  {
    kind: "audio-id",
    prompt: "Is this chord major or minor?",
    audioType: "chord-stack",
    options: ["Major (bright, happy)", "Minor (dark, sad)", "Diminished (tense)", "Augmented (floating)"],
    answer: 0,
    explain: "A major chord contains a major 3rd (4 semitones above root). That interval is the defining characteristic of brightness. When the 3rd is lowered one semitone, it becomes minor — sad.",
  },
  {
    kind: "quiz",
    q: "What is the difference between a major and minor triad?",
    options: [
      "Minor has a lower root",
      "Minor uses a flattened (minor) 3rd instead of major 3rd",
      "Major has 4 notes, minor has 3",
      "They are the same",
    ],
    answer: 1,
    explain: "The ONLY difference: minor 3rd (3 semitones) vs major 3rd (4 semitones). One semitone lower on the 3rd makes the chord sound dark instead of bright.",
  },
  {
    kind: "summary",
    learned: ["Chord = 3+ notes simultaneously", "Triad = root + 3rd + 5th", "Major 3rd = bright. Minor 3rd (flat) = dark."],
  },
];

export const SCREENS_CHORD_TYPES: LessonScreen[] = [
  { kind: "hook", emoji: "🎸", headline: "Major, minor, diminished, augmented — 4 essential chord colours", subtext: "Each has a different emotional fingerprint." },
  {
    kind: "concept",
    title: "The 4 triads",
    body: "Major (bright), Minor (dark), Diminished (tense/unsettled — two minor 3rds stacked), Augmented (dreamy/unresolved — two major 3rds stacked). These four cover most music you'll make.",
    keyFact: "Diminished = most tense. Augmented = unresolved floating.",
    visual: "chord-stack",
  },
  {
    kind: "concept",
    title: "7th chords",
    body: "Add a 4th note (a 3rd above the 5th) and you get a 7th chord. Major 7 sounds lush/sophisticated. Dominant 7 sounds bluesy/tense. Minor 7 sounds smooth/jazzy.",
    keyFact: "Dominant 7 (V7) creates the strongest pull to resolve home.",
  },
  { kind: "interact", sim: "chord-stacker", prompt: "Build different chord types — compare the feel" },
  {
    kind: "match",
    prompt: "Match each chord type to its emotional character",
    pairs: [
      { left: "Major triad", right: "Bright, happy, resolved" },
      { left: "Minor triad", right: "Dark, sad, introspective" },
      { left: "Diminished triad", right: "Tense, unstable, wants to resolve" },
      { left: "Dominant 7th", right: "Bluesy tension — pulls strongly to home" },
    ],
  },
  {
    kind: "quiz",
    q: "A diminished triad is built from…",
    options: ["Two major 3rds", "A major 3rd + perfect 5th", "Two minor 3rds (root + b3 + b5)", "A perfect 4th + perfect 5th"],
    answer: 2,
    explain: "Diminished = root + minor 3rd (3 semitones) + diminished 5th (6 semitones = tritone). This double-minor tension makes it sound extremely unstable — it demands resolution.",
  },
  {
    kind: "summary",
    learned: ["4 triads: major (bright), minor (dark), diminished (tense), augmented (floating)", "7th chords add a 4th note for richer colour", "Dominant 7 creates the strongest pull to resolve"],
  },
];


export const SCREENS_CHORD_PROGRESSIONS: LessonScreen[] = [
  { kind: "hook", emoji: "🔁", headline: "4 chords. Infinite songs.", subtext: "I-V-vi-IV is behind thousands of pop songs. The same progression, different tempos and sounds." },
  {
    kind: "concept",
    title: "Roman numeral notation",
    body: "Chord progressions use Roman numerals to describe chords by their position in a key. I = tonic (home). IV = subdominant (lift). V = dominant (tension). vi = relative minor (emotion).",
    keyFact: "I = home. V = tension. IV = lift. vi = sadness.",
    visual: "chord-stack",
  },
  { kind: "interact", sim: "chord-progression", prompt: "Play the I-V-vi-IV progression — hear tension and resolution" },
  {
    kind: "type-answer",
    q: "In C major, the I-V-vi-IV progression uses four specific chords. What are they? (write as: C G Am F)",
    acceptableAnswers: ["C G Am F", "C, G, Am, F", "C G Am F major", "c g am f"],
    explain: "In C major: I=C major, V=G major, vi=A minor, IV=F major. This I-V-vi-IV sequence is in thousands of pop songs. You've heard it your entire life without knowing.",
    hint: "Count up from C: C(1) D(2) E(3) F(4) G(5) A(6) B(7)",
  },
  {
    kind: "quiz",
    q: "The I-V-vi-IV progression in C major uses which chords?",
    options: ["C-G-Am-F", "C-F-G-Am", "Am-F-C-G", "C-Em-Am-F"],
    answer: 0,
    explain: "In C major: I=C, V=G, vi=Am, IV=F. So I-V-vi-IV = C-G-Am-F. You've heard this in hundreds of pop songs across every genre.",
  },
  {
    kind: "summary",
    learned: ["Roman numerals describe chord position in a key", "I=home, IV=lift, V=tension, vi=emotional", "I-V-vi-IV is one of the most used progressions in pop"],
  },
];

export const SCREENS_KEYS_TONALITY: LessonScreen[] = [
  { kind: "hook", emoji: "🏠", headline: "A key is a home base for your music", subtext: "Everything in the key orbits around the tonic — the home chord." },
  {
    kind: "concept",
    title: "What is a key?",
    body: "A key defines which 7 notes (and chords) your music uses and which feels like 'home'. Music in C major gravitates toward C. Everything else creates varying degrees of tension away from that home.",
    keyFact: "Key = set of 7 notes + a tonic (home) note.",
    visual: "chord-stack",
  },
  {
    kind: "concept",
    title: "Key in a DAW",
    body: "In Ableton's Scale Awareness mode, you can lock the piano roll to a key. Notes outside the scale are hidden. This means every note you place sounds good — you're composing within a tonal framework.",
    keyFact: "DAW scale mode = guardrails that keep you in key.",
  },
  { kind: "interact", sim: "note-explorer", prompt: "Stay in C major — hear how everything resolves to C" },
  {
    kind: "quiz",
    q: "Why does music in a key 'want to resolve' to the tonic chord?",
    options: [
      "The tonic is always the loudest chord",
      "Tonal gravity — other chords create tension that the tonic releases",
      "The tonic plays more often",
      "The tonic has more notes",
    ],
    answer: 1,
    explain: "Tonal gravity is the pull toward home. The V chord is furthest from tonic — it creates maximum tension. The I chord resolves it. This tension-resolution cycle is the engine of all tonal music.",
  },
  {
    kind: "match",
    prompt: "Match each chord's function in a key",
    pairs: [
      { left: "I (tonic)", right: "Home — stable, resolved" },
      { left: "IV (subdominant)", right: "Lift — away from home but gentle" },
      { left: "V (dominant)", right: "Maximum tension — wants to go home" },
      { left: "vi (relative minor)", right: "Emotional — dark colour in major key" },
    ],
  },
  {
    kind: "summary",
    learned: ["Key = 7 notes + tonic (home)", "Music creates tension by moving away from tonic", "V chord = maximum tension, I chord = home/resolution"],
  },
];

export const SCREENS_TENSION_RESOLUTION: LessonScreen[] = [
  { kind: "hook", emoji: "💥", headline: "Tension without resolution feels unfinished", subtext: "Music is a cycle of pulling away from home and returning." },
  {
    kind: "concept",
    title: "The tension-resolution engine",
    body: "Every compelling piece of music creates tension (V chord, dissonant notes, rhythmic anticipation) and then resolves it (I chord, consonant arrival). The timing of resolution is where the emotion lives.",
    keyFact: "Delayed resolution = more emotional impact.",
    visual: "chord-stack",
  },
  { kind: "interact", sim: "chord-progression", prompt: "Hear I→V — notice the tension. Then V→I — feel the release" },
  {
    kind: "audio-id",
    prompt: "Does this chord progression feel resolved or unresolved at the end?",
    audioType: "chord-stack",
    options: ["Resolved — ends on home chord", "Unresolved — ends on tension chord", "Neither — neutral ending", "Can't tell"],
    answer: 0,
    explain: "A progression ending on the I chord feels resolved — 'home'. Ending on V feels unresolved and open. This is why pop songs end on I and film composers use V for suspense.",
  },
  {
    kind: "quiz",
    q: "The cadence V→I is called a 'perfect authentic cadence' because…",
    options: [
      "Both chords are major",
      "It creates the strongest sense of resolution — maximum tension to home",
      "It uses the most notes",
      "It only works in major keys",
    ],
    answer: 1,
    explain: "The V chord contains the leading tone (7th degree of the scale) which is just one semitone below the tonic. This creates an almost magnetic pull to resolve upward to the I chord.",
  },
  {
    kind: "summary",
    learned: ["Music = tension → resolution cycles", "V→I = perfect authentic cadence (strongest resolution)", "Delaying resolution builds emotional impact"],
  },
];


export const SCREENS_HARMONY_IN_PRODUCTION: LessonScreen[] = [
  { kind: "hook", emoji: "🎛", headline: "Chords in production sound different to chords on piano", subtext: "Voicing, inversion and register all change the feel." },
  {
    kind: "concept",
    title: "Voicing & register",
    body: "Voicing = how you spread a chord's notes across octaves and instruments. Close voicing (notes tight together) sounds thick. Open voicing (spread across octaves) sounds spacious.",
    keyFact: "Keep bass notes low, chord body in mid-register.",
    visual: "mixer-channel",
  },
  {
    kind: "concept",
    title: "Chord pads vs arpeggios",
    body: "A pad plays all chord notes simultaneously — wide, sustained texture. An arpeggio plays chord notes one at a time in sequence — rhythmic, moving texture. Both from the same chord.",
    keyFact: "Pad = all at once. Arpeggio = notes in sequence.",
  },
  { kind: "interact", sim: "chord-stacker", prompt: "Play a chord as a pad, then spread it as an arpeggio" },
  {
    kind: "quiz",
    q: "A chord inversion means…",
    options: [
      "Playing the chord backwards",
      "Putting a note other than the root in the bass",
      "Playing the chord in a minor key",
      "Reversing the audio file",
    ],
    answer: 1,
    explain: "1st inversion = 3rd in bass. 2nd inversion = 5th in bass. Inversions create smoother basslines (voice leading) because the bass moves by smaller intervals between chords.",
  },
  {
    kind: "match",
    prompt: "Match each chord texture to its production use",
    pairs: [
      { left: "Close voicing", right: "Thick, dense — good for stabs and punchy chords" },
      { left: "Open voicing", right: "Spacious — good for pads and ambient chords" },
      { left: "Arpeggio", right: "Rhythmic movement — good for energy and drive" },
    ],
  },
  {
    kind: "summary",
    learned: ["Voicing spreads chord notes across register", "Pad = simultaneous. Arpeggio = sequential.", "Inversions create smoother voice leading in the bass"],
  },
];

export const SCREENS_SONG_STRUCTURE: LessonScreen[] = [
  { kind: "hook", emoji: "🏗", headline: "Songs have architecture", subtext: "Verse, chorus, bridge — each section has a job." },
  {
    kind: "concept",
    title: "Common song structures",
    body: "Pop/rock: Intro → Verse → Pre-chorus → Chorus → Verse → Chorus → Bridge → Chorus → Outro. Electronic: Intro → Build → Drop → Breakdown → Build → Drop → Outro. Both follow tension-release logic.",
    keyFact: "The drop/chorus is the payload — everything else builds to it.",
    visual: "signal-chain",
  },
  {
    kind: "concept",
    title: "The 8-bar phrase",
    body: "Most Western music organises in 8-bar phrases. 4 bars of tension, 4 bars of release. Sections are usually 8, 16 or 32 bars. This regularity is why listeners can anticipate what's coming.",
    keyFact: "Electronic music: standard section = 16 or 32 bars.",
  },
  { kind: "interact", sim: "song-structure", prompt: "Arrange verse, chorus and bridge into a song structure" },
  {
    kind: "sequence",
    prompt: "Put a typical electronic song structure in order",
    items: ["Intro (8–16 bars)", "Build/rise (16 bars)", "Drop (16–32 bars)", "Breakdown (16 bars)", "Drop 2 (16–32 bars)", "Outro (8–16 bars)"],
    explain: "Electronic structure: Intro establishes mood → Build creates anticipation → Drop delivers energy → Breakdown recovers → Drop 2 repeats payoff → Outro winds down. Every section has a purpose.",
  },
  {
    kind: "quiz",
    q: "In electronic music, the 'drop' serves the same function as the 'chorus' in pop. What do both do?",
    options: [
      "Introduce the main melody for the first time",
      "Deliver maximum energy — the moment the tension resolves into the most powerful section",
      "Slow the track down for contrast",
      "Introduce a new key",
    ],
    answer: 1,
    explain: "The drop/chorus is the emotional payoff. The build/verse exists to create anticipation. When the drop hits, all the tension that was built up releases at once — that's the dopamine hit.",
  },
  {
    kind: "summary",
    learned: ["Songs use Intro→Build→Drop/Chorus structure", "Everything before the chorus builds tension", "8 and 16-bar phrases are the standard structural units"],
  },
];

export const SCREENS_LISTENING_ACTIVELY: LessonScreen[] = [
  { kind: "hook", emoji: "🧠", headline: "Producers listen differently to everyone else", subtext: "They hear layers, processes and decisions — not just songs." },
  {
    kind: "concept",
    title: "Analytical listening",
    body: "When you listen actively, you separate a track into its components: rhythm section, harmony, melody, texture, space. You ask: what key? What tempo? What's creating that sound? What effects?",
    keyFact: "Identify: key, BPM, main chords, effects, structure.",
    visual: "eq-curve",
  },
  {
    kind: "concept",
    title: "Reference tracks",
    body: "A reference track is a finished, mastered song you use to compare your mix against. Active listening to references reveals: how loud is the kick? How much reverb? How bright is the mix?",
    keyFact: "Reference tracks = your calibration tool for mixing.",
  },
  { kind: "interact", sim: "ear-training", prompt: "Identify the key and chord quality", preset: { mode: "chords" } },
  {
    kind: "sequence",
    prompt: "Put these active listening steps in order",
    items: ["Identify the BPM and time signature", "Find the key and main chords", "Analyse the drum and bass relationship", "Identify the effects and texture", "Note the song structure and arrangement"],
    explain: "Active listening builds from rhythm (BPM/time sig) → harmony (key/chords) → production (drums/bass) → texture (effects/layers) → structure (arrangement). This systematic approach reveals everything.",
  },
  {
    kind: "quiz",
    q: "When using a reference track for mixing, you are primarily checking…",
    options: [
      "Whether your song is in the same key",
      "The tonal balance, loudness, and dynamic range of your mix against a professional result",
      "That you use the same instruments",
      "The song structure is identical",
    ],
    answer: 1,
    explain: "Reference mixing means A/B comparing your mix with a mastered professional track at the same loudness. This reveals imbalances: too much bass, not enough high end, narrow stereo image, etc.",
  },
  {
    kind: "summary",
    learned: ["Active listening = analysing layers, effects, structure", "Identify: key, BPM, chords, texture, effects, structure", "Reference tracks calibrate your mix against pro results"],
  },
];


// ─────────────────────────────────────────────────────────────────────────────
// CHAPTER 5 · MUSIC TECHNOLOGY
// Path 1: The Digital Studio — daw-explained, midi-explained, digital-audio, samples-loops
// Path 2: Signal & Mix — signal-chain, effects-overview, mixing-basics, music-tech-integration
// ─────────────────────────────────────────────────────────────────────────────

export const SCREENS_DAW_EXPLAINED: LessonScreen[] = [
  { kind: "hook", emoji: "💻", headline: "A DAW is a recording studio on a laptop", subtext: "It replaces mixing desks, tape machines, racks of gear — all in software." },
  {
    kind: "concept",
    title: "What is a DAW?",
    body: "A Digital Audio Workstation (DAW) is software that lets you record, arrange, edit and mix music. Ableton Live, Logic Pro, Pro Tools, FL Studio — all DAWs. Each has the same core functions, different workflows.",
    keyFact: "DAW = recording + arranging + mixing + mastering in one app.",
    visual: "signal-chain",
  },
  {
    kind: "concept",
    title: "DAW core components",
    body: "Every DAW has: a timeline (arrangement view), a mixer, instruments (virtual synths/samplers), effects (EQ, compressor, reverb), and a way to record audio and MIDI.",
    keyFact: "Track = one layer of sound. Mix = all tracks balanced together.",
    visual: "mixer-channel",
  },
  { kind: "interact", sim: "interface-tour", prompt: "Explore the Ableton interface — find the mixer and arranger" },
  {
    kind: "match",
    prompt: "Match each DAW component to its job",
    pairs: [
      { left: "Arrangement view", right: "Timeline — clips organised left to right in time" },
      { left: "Mixer", right: "Volume faders, sends, and routing for all tracks" },
      { left: "Instrument", right: "Converts MIDI notes into audio sound" },
      { left: "Session view", right: "Non-linear clip launcher for live performance" },
    ],
  },
  {
    kind: "quiz",
    q: "What replaced the physical mixing desk in modern music production?",
    options: ["A synthesiser", "The DAW's virtual mixer", "A sampler", "The audio interface"],
    answer: 1,
    explain: "The DAW contains a virtual mixer with faders, sends, EQ and routing — replacing a physical mixing console that would cost tens of thousands of dollars.",
  },
  {
    kind: "summary",
    learned: ["DAW = recording studio in software", "Core parts: timeline, mixer, instruments, effects", "Ableton Live has two views: Session (jamming) and Arrangement (composing)"],
  },
];

export const SCREENS_MIDI_EXPLAINED: LessonScreen[] = [
  { kind: "hook", emoji: "🎹", headline: "MIDI is instructions, not audio", subtext: "It tells an instrument WHAT to play — the instrument makes the sound." },
  {
    kind: "concept",
    title: "What is MIDI?",
    body: "MIDI (Musical Instrument Digital Interface) is a protocol that sends note data: which note, how hard (velocity), when to start, when to stop. It contains zero audio — it's sheet music for computers.",
    keyFact: "MIDI = instructions. Audio = the actual sound.",
    visual: "piano",
  },
  {
    kind: "concept",
    title: "MIDI vs Audio",
    body: "MIDI can be edited after recording — change a wrong note, transpose to a new key, change the instrument entirely. Audio is the recorded waveform — you can't easily edit individual notes.",
    keyFact: "MIDI: edit any note freely. Audio: stuck with what was recorded.",
    visual: "waveform",
  },
  { kind: "interact", sim: "midi-vs-audio", prompt: "Compare MIDI note data vs audio waveform" },
  {
    kind: "type-answer",
    q: "What does MIDI stand for? (write the full name)",
    acceptableAnswers: ["Musical Instrument Digital Interface", "musical instrument digital interface"],
    explain: "MIDI = Musical Instrument Digital Interface. Developed in 1983, it's been unchanged since — a testament to how fundamental and well-designed it was. Every keyboard, DAW, and synth still uses it.",
    hint: "It's 4 words: M___ I___ D___ I___",
  },
  {
    kind: "quiz",
    q: "You record a MIDI piano part and realise it's in the wrong key. What do you do?",
    options: [
      "Re-record the whole part",
      "Select all MIDI notes and transpose them — no need to re-record",
      "Use pitch correction like Auto-Tune",
      "Nothing — MIDI can't be transposed",
    ],
    answer: 1,
    explain: "MIDI is just data — select all notes, transpose up or down by any amount, and the 'performance' instantly changes key. This is impossible with recorded audio (without pitch-shifting artefacts).",
  },
  {
    kind: "summary",
    learned: ["MIDI = instructions (notes, velocity, timing)", "Audio = actual recorded waveform", "MIDI can be edited freely; audio cannot"],
  },
];


export const SCREENS_DIGITAL_AUDIO: LessonScreen[] = [
  { kind: "hook", emoji: "📱", headline: "Digital audio is millions of snapshots per second", subtext: "Sample rate and bit depth determine audio quality." },
  {
    kind: "concept",
    title: "Sample rate",
    body: "Sample rate = how many times per second the audio is measured (sampled). 44,100 Hz (CD quality) means 44,100 snapshots per second. Higher rates capture higher frequencies.",
    keyFact: "44.1 kHz = standard. 48 kHz = video/broadcast. 96 kHz = hi-res.",
    visual: "waveform-zoom",
  },
  {
    kind: "concept",
    title: "Bit depth",
    body: "Bit depth determines dynamic range — the difference between the quietest and loudest sounds. 16-bit = 96 dB range (CD). 24-bit = 144 dB range (studio). Always record at 24-bit.",
    keyFact: "24-bit gives more headroom than 16-bit — always record at 24.",
    visual: "headroom-meter",
  },
  { kind: "interact", sim: "decibel-meter", prompt: "Observe signal level — dynamic range in action" },
  {
    kind: "match",
    prompt: "Match each sample rate to its primary use",
    pairs: [
      { left: "44.1 kHz", right: "Music CD / most streaming" },
      { left: "48 kHz", right: "Video and broadcast standard" },
      { left: "96 kHz", right: "High-resolution audio recording" },
    ],
  },
  {
    kind: "quiz",
    q: "Why is 24-bit recording better than 16-bit?",
    options: [
      "It plays louder",
      "It provides greater dynamic range and lower noise floor — more headroom for quiet signals",
      "It uses less storage space",
      "It has a higher sample rate",
    ],
    answer: 1,
    explain: "24-bit gives 144 dB of dynamic range vs 96 dB for 16-bit. The extra range means quiet details are captured without noise, and there's more safety margin before clipping.",
  },
  {
    kind: "summary",
    learned: ["Sample rate = snapshots per second. 44.1 kHz = CD standard.", "Bit depth = dynamic range. Use 24-bit for recording.", "Nyquist: sample rate must be 2× the highest frequency"],
  },
];

export const SCREENS_SAMPLES_LOOPS: LessonScreen[] = [
  { kind: "hook", emoji: "🔁", headline: "Samples are pieces of recorded audio you can reuse", subtext: "Most electronic music is built on samples — drum breaks, one-shots, loops." },
  {
    kind: "concept",
    title: "Samples vs loops",
    body: "A sample is a recording of a sound — a single drum hit, a chord, a vocal phrase. A loop is a sample that repeats seamlessly. A one-shot is a sample that plays once and stops.",
    keyFact: "One-shot = plays once. Loop = repeats endlessly.",
    visual: "waveform-zoom",
  },
  {
    kind: "concept",
    title: "Copyright & sampling",
    body: "Sampling a commercial recording without clearance is copyright infringement. 'Royalty-free' samples (like Splice) are licensed for use. Always check the licence before releasing music with samples.",
    keyFact: "Uncleared sample = legal risk. Use royalty-free libraries.",
  },
  { kind: "interact", sim: "warp-lab", prompt: "Warp a loop to match the project tempo" },
  {
    kind: "quiz",
    q: "In Ableton, 'warping' a sample means…",
    options: [
      "Distorting it with a filter",
      "Time-stretching it to fit the project BPM without changing pitch",
      "Reversing the sample",
      "Compressing its dynamic range",
    ],
    answer: 1,
    explain: "Warp markers in Ableton stretch/compress audio to lock it to the project tempo. A drum loop recorded at 100 BPM can be warped to play at 128 BPM without changing pitch.",
  },
  {
    kind: "match",
    prompt: "Match each sample type to how it's used",
    pairs: [
      { left: "One-shot", right: "Single drum hit — triggered per step in a sequencer" },
      { left: "Loop", right: "Repeating phrase — forms the backbone of a groove" },
      { left: "Vocal chop", right: "Short vocal phrase — reordered rhythmically" },
    ],
  },
  {
    kind: "summary",
    learned: ["Sample = recorded audio snippet", "One-shot plays once; loops repeat seamlessly", "Warping = time-stretching to match project BPM"],
  },
];

export const SCREENS_SIGNAL_CHAIN: LessonScreen[] = [
  { kind: "hook", emoji: "⚡", headline: "Signal flows from source to speaker", subtext: "Understanding the signal chain means knowing exactly where a problem is." },
  {
    kind: "concept",
    title: "The signal chain",
    body: "Signal chain: Sound source → Microphone/Instrument → Audio Interface → DAW → Effects → Mixer → Output (Speakers/Headphones). Every stage can add or remove something from the sound.",
    keyFact: "Noise or distortion always enters at a specific stage — trace it back.",
    visual: "signal-chain",
  },
  { kind: "interact", sim: "signal-flow-builder", prompt: "Drag blocks into the correct signal chain order" },
  {
    kind: "sequence",
    prompt: "Order the stages of a recording signal chain",
    items: ["Microphone (captures sound)", "Audio interface (converts to digital)", "DAW track (records the signal)", "Effects chain (EQ, comp, reverb)", "Master output (to speakers)"],
    explain: "Sound → Mic → Interface → DAW → Effects → Output. Each stage must be gain-staged correctly. Noise at any stage compounds downstream. Identify problems by isolating each stage.",
  },
  {
    kind: "quiz",
    q: "Gain staging means…",
    options: [
      "Adding gain at every stage to maximise loudness",
      "Setting appropriate signal levels at each stage to avoid noise and clipping",
      "Using a gate effect on every track",
      "Equalising each instrument separately",
    ],
    answer: 1,
    explain: "Good gain staging: set levels so the signal is loud enough to clear the noise floor, but quiet enough not to clip. Each stage should receive a clean, appropriately loud signal.",
  },
  {
    kind: "summary",
    learned: ["Signal chain: source → interface → DAW → effects → output", "Gain staging = correct levels at every stage", "Trace noise/distortion to the stage where it enters"],
  },
];

export const SCREENS_EFFECTS_OVERVIEW: LessonScreen[] = [
  { kind: "hook", emoji: "🎚", headline: "4 effects you'll use on every track", subtext: "EQ, Compressor, Reverb, Delay — the essential mixing toolkit." },
  {
    kind: "concept",
    title: "EQ & Compression",
    body: "EQ (equaliser) adjusts frequency balance — cut 200 Hz to remove muddiness, boost 10 kHz for air. Compressor controls dynamic range — reduces volume of loud peaks, letting you push overall level.",
    keyFact: "EQ = tone shaping. Compressor = dynamic control.",
    visual: "eq-curve",
  },
  {
    kind: "concept",
    title: "Reverb & Delay",
    body: "Reverb simulates acoustic space — small room to cathedral. Delay repeats the signal at a set time interval — eighth note delay on a guitar creates rhythmic texture. Both create depth and space.",
    keyFact: "Reverb = space. Delay = rhythmic echo.",
    visual: "signal-chain",
  },
  { kind: "interact", sim: "device-chain", prompt: "Add EQ, Compressor, Reverb to a signal chain" },
  {
    kind: "match",
    prompt: "Match each effect to what it does",
    pairs: [
      { left: "EQ", right: "Adjusts frequency balance — cut or boost specific ranges" },
      { left: "Compressor", right: "Reduces loud peaks — controls dynamic range" },
      { left: "Reverb", right: "Simulates room space — adds depth and distance" },
      { left: "Delay", right: "Creates timed repeats — adds rhythmic texture" },
    ],
  },
  {
    kind: "quiz",
    q: "You have a vocal that sounds muddy and too dense. Which effect do you reach for first?",
    options: ["Reverb — to add space", "Compressor — to control dynamics", "EQ — cut the muddy frequencies (usually 200–400 Hz)", "Delay — to add rhythmic texture"],
    answer: 2,
    explain: "Muddiness lives at 200–400 Hz. A surgical EQ cut in that range cleans up the low-mid clutter. Always EQ before adding space effects (reverb/delay) — otherwise you're adding mud on top of mud.",
  },
  {
    kind: "summary",
    learned: ["EQ = frequency balance (cut mud, boost air)", "Compressor = dynamic range control", "Reverb = simulated space. Delay = rhythmic repeat."],
  },
];

export const SCREENS_MIXING_BASICS: LessonScreen[] = [
  { kind: "hook", emoji: "🎛", headline: "Mixing is balancing — everything has a place", subtext: "Volume, pan, EQ, effects — these four tools are mixing." },
  {
    kind: "concept",
    title: "Volume & panning",
    body: "Volume sets how loud each element is in the mix. Panning places it in the stereo field — left to right. Kick and bass are almost always centred. Wide panning creates space for other elements.",
    keyFact: "Kick, bass, lead vocal: centre. Everything else: pan left or right.",
    visual: "stereo-field",
  },
  {
    kind: "concept",
    title: "Frequency layering",
    body: "Each instrument should occupy its own frequency range without crowding others. Bass in the low end. Guitars/pads in midrange. Cymbals/air in high end. EQ each track to give the others room.",
    keyFact: "Cut each track where another one lives — create space.",
    visual: "mixer-channel",
  },
  { kind: "interact", sim: "mixer", prompt: "Balance 4 tracks — adjust volume and pan" },
  {
    kind: "sequence",
    prompt: "Order these mix elements from lowest to highest frequency",
    items: ["Kick drum (sub/bass)", "Bass guitar/synth (low-mid)", "Guitars/pads (mid)", "Lead vocals (upper-mid)", "Cymbals/air (high)"],
    explain: "Frequency layering: Kick→Bass→Guitars/Pads→Vocals→Cymbals. Each layer occupies a range. EQ each to avoid overlap — cut where another instrument is louder. This creates clarity.",
  },
  {
    kind: "quiz",
    q: "Why are kick drum and bass guitar usually panned to centre?",
    options: [
      "They are the most important sounds",
      "Low frequencies are non-directional and carry more energy — centred bass provides a stable mono-compatible foundation",
      "It's a creative choice only",
      "DAWs automatically centre them",
    ],
    answer: 1,
    explain: "Low frequencies are non-directional (our ears can't localise them well). Panning bass off-centre creates phase issues in mono playback and feels unbalanced. Centre = solid, mono-compatible.",
  },
  {
    kind: "summary",
    learned: ["Volume + pan are the primary mixing tools", "Kick and bass stay centred for mono compatibility", "EQ each track to create frequency space for others"],
  },
];

export const SCREENS_MUSIC_TECH_INTEGRATION: LessonScreen[] = [
  { kind: "hook", emoji: "🏁", headline: "Everything connects — you're now a producer", subtext: "Sound physics + rhythm + harmony + technology = making music." },
  {
    kind: "concept",
    title: "The complete picture",
    body: "Fundamentals complete: sound physics (frequency, amplitude, timbre), rhythm (pulse, BPM, subdivision), melody (scales, intervals), harmony (chords, keys, tension), and technology (DAW, MIDI, effects, mixing).",
    keyFact: "Every knob you turn in a DAW changes one of these fundamentals.",
    visual: "signal-chain",
  },
  {
    kind: "concept",
    title: "What's next",
    body: "You have the vocabulary. Now: apply it. DJ World teaches you how to play other people's music brilliantly. Producer World teaches you how to make your own from scratch in Ableton Live 12.",
    keyFact: "Theory without application is just words. Make something.",
  },
  { kind: "interact", sim: "mixer", prompt: "Build a full mix — kick, bass, chords and melody" },
  {
    kind: "sequence",
    prompt: "Order the Fundamentals chapters you've just completed",
    items: ["Sound Science (physics, frequency, timbre)", "Rhythm & Time (pulse, BPM, groove)", "Melody & Pitch (scales, intervals, modes)", "Harmony & Chords (chords, keys, tension)", "Music Technology (DAW, MIDI, effects, mixing)"],
    explain: "These 5 chapters form the complete musical vocabulary: how sound works → how it moves in time → how it moves in pitch → how pitches combine → how it's captured and shaped. You now speak the language.",
  },
  {
    kind: "quiz",
    q: "When you turn up the 'cutoff' on a low-pass filter, you are…",
    options: [
      "Increasing volume",
      "Allowing more high frequencies through — making the sound brighter",
      "Adding reverb",
      "Compressing the signal",
    ],
    answer: 1,
    explain: "A low-pass filter blocks frequencies above the cutoff. Turn the cutoff up = allow higher frequencies through = brighter sound. Turn it down = remove highs = darker, warmer sound.",
  },
  {
    kind: "summary",
    learned: ["All fundamentals connect: physics → rhythm → harmony → tech", "Every DAW control changes one of these fundamentals", "DJ World: play music brilliantly. Producer: make music from scratch."],
    badge: { slug: "fundamentals-complete", name: "Fundamentals Complete" },
  },
];


// ─────────────────────────────────────────────────────────────────────────────
// EXPORT MAP — keyed by mission slug for easy lookup
// ─────────────────────────────────────────────────────────────────────────────
export const FOUNDATIONS_SCREENS: Record<string, LessonScreen[]> = {
  "what-is-sound": SCREENS_WHAT_IS_SOUND,
  "frequency-pitch": SCREENS_FREQUENCY_PITCH,
  "amplitude-volume": SCREENS_AMPLITUDE_VOLUME,
  "timbre-tone": SCREENS_TIMBRE_TONE,
  "waveforms": SCREENS_WAVEFORMS,
  "sound-in-space": SCREENS_SOUND_IN_SPACE,
  "overtones-harmonics": SCREENS_OVERTONES_HARMONICS,
  "how-we-hear": SCREENS_HOW_WE_HEAR,
  "what-is-rhythm": SCREENS_WHAT_IS_RHYTHM,
  "tempo-bpm": SCREENS_TEMPO_BPM,
  "bars-time-signatures": SCREENS_BARS_TIME_SIGNATURES,
  "groove-feel": SCREENS_GROOVE_FEEL,
  "syncopation": SCREENS_SYNCOPATION,
  "polyrhythm": SCREENS_POLYRHYTHM,
  "note-values": SCREENS_NOTE_VALUES,
  "rhythm-in-production": SCREENS_RHYTHM_IN_PRODUCTION,
  "notes-and-octaves": SCREENS_NOTES_AND_OCTAVES,
  "major-scale": SCREENS_MAJOR_SCALE,
  "minor-scale": SCREENS_MINOR_SCALE,
  "intervals": SCREENS_INTERVALS,
  "pentatonic-scales": SCREENS_PENTATONIC_SCALES,
  "melody-writing": SCREENS_MELODY_WRITING,
  "ear-training": SCREENS_EAR_TRAINING,
  "transposition-modes": SCREENS_TRANSPOSITION_MODES,
  "what-are-chords": SCREENS_WHAT_ARE_CHORDS,
  "chord-types": SCREENS_CHORD_TYPES,
  "chord-progressions": SCREENS_CHORD_PROGRESSIONS,
  "keys-tonality": SCREENS_KEYS_TONALITY,
  "tension-resolution": SCREENS_TENSION_RESOLUTION,
  "harmony-in-production": SCREENS_HARMONY_IN_PRODUCTION,
  "song-structure": SCREENS_SONG_STRUCTURE,
  "listening-actively": SCREENS_LISTENING_ACTIVELY,
  "daw-explained": SCREENS_DAW_EXPLAINED,
  "midi-explained": SCREENS_MIDI_EXPLAINED,
  "digital-audio": SCREENS_DIGITAL_AUDIO,
  "samples-loops": SCREENS_SAMPLES_LOOPS,
  "signal-chain": SCREENS_SIGNAL_CHAIN,
  "effects-overview": SCREENS_EFFECTS_OVERVIEW,
  "mixing-basics": SCREENS_MIXING_BASICS,
  "music-tech-integration": SCREENS_MUSIC_TECH_INTEGRATION,
};
