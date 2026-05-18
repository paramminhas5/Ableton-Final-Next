import type { Mission } from "./types";

// WORLD: FOUNDATIONS — 40 missions, numbers 201-240
// 5 paths: Sound (201-208), Rhythm (209-216), Melody (217-224), Harmony (225-232), Tech (233-240)

const soundPath: Mission[] = [
  {
    slug: "what-is-sound",
    world: "foundations",
    number: 1,
    title: "What Is Sound?",
    tagline: "Invisible waves that shake your ears.",
    xp: 40,
    badge: { slug: "first-wave", name: "First Wave" },
    explainer: [
      { kind: "lead", text: "Sound is mechanical energy — vibrations travelling through air as pressure waves. When something moves back and forth rapidly, it pushes air molecules into alternating zones of high and low pressure that radiate outward." },
      { kind: "para", text: "Those pressure waves reach your eardrum, causing it to vibrate at the same rate. Your inner ear converts those vibrations into electrical signals your brain interprets as sound. Every kick drum, synth, and vocal is ultimately just air moving in a specific pattern." },
      { kind: "callout", tone: "key", text: "Sound needs a medium to travel. In a vacuum there is no air, so no sound — hence the famous movie lie." },
      { kind: "list", items: ["Frequency — how fast the wave vibrates (determines pitch)", "Amplitude — how strong the wave is (determines loudness)", "Timbre — the wave complexity (determines tone colour)", "Phase — where in its cycle the wave is at a given moment"] },
    ],
    sim: { type: "ear-training" },
    quiz: [
      { q: "Sound travels as", options: ["Light beams", "Pressure waves through a medium", "Electrical signals", "Magnetic fields"], answer: 1, explain: "Sound is mechanical pressure waves — alternating compressions and rarefactions travelling through air or another medium.", hint: "Think of ripples spreading out from a stone dropped in water." },
      { q: "What determines the pitch of a sound?", options: ["Its amplitude", "Its frequency", "Its phase", "Its timbre"], answer: 1, explain: "Frequency (measured in Hz) is how many wave cycles occur per second. Higher frequency = higher pitch.", hint: "A bird tweets fast; a bass drum hits slow. Which has higher frequency?" },
      { q: "Sound cannot travel through", options: ["Water", "Steel", "A vacuum", "Wood"], answer: 2, explain: "Sound needs a medium to propagate. In a vacuum there are no molecules to push, so no sound can travel.", hint: "Space films always get this wrong." },
      { q: "The loudness of a sound is determined by its", options: ["Frequency", "Timbre", "Amplitude", "Phase"], answer: 2, explain: "Amplitude is the height of the sound wave — bigger amplitude means more energy and louder volume.", hint: "A bigger wave packs more punch." },
    ],
  },
  {
    slug: "frequency-pitch",
    world: "foundations",
    number: 2,
    title: "Frequency & Pitch",
    tagline: "Why a bass note is low and a flute is high.",
    xp: 40,
    explainer: [
      { kind: "lead", text: "Frequency is the number of complete wave cycles per second, measured in Hertz (Hz). Humans hear roughly 20 Hz to 20,000 Hz. Everything in music occupies a position in this spectrum." },
      { kind: "para", text: "Pitch is your subjective perception of frequency. A4 is internationally defined as 440 Hz. Double the frequency and you go up one octave. Halve it and you go down an octave." },
      { kind: "list", items: ["Sub-bass: 20-60 Hz — felt more than heard (kick body, bass rumble)", "Bass: 60-250 Hz — warmth, weight, fundamental of bass instruments", "Midrange: 250 Hz-4 kHz — most instruments and vocals live here", "High-mid: 4-8 kHz — presence, attack, consonants in speech", "Air: 8-20 kHz — sparkle, shimmer, breath"] },
      { kind: "callout", tone: "tip", text: "Most production decisions happen between 80 Hz and 12 kHz. The extreme lows and highs still matter for feel and shimmer." },
    ],
    sim: { type: "ear-training" },
    quiz: [
      { q: "What unit measures frequency?", options: ["Decibels (dB)", "Hertz (Hz)", "Milliseconds (ms)", "Cents"], answer: 1, explain: "Hz (Hertz) = cycles per second. 440 Hz = 440 complete wave cycles every second.", hint: "Named after physicist Heinrich Hertz." },
      { q: "If you double the frequency of a note, you go up", options: ["A fifth", "An octave", "A semitone", "A major third"], answer: 1, explain: "Doubling frequency = one octave up. A4 = 440 Hz, A5 = 880 Hz. This is the fundamental law of pitch relationships.", hint: "440 to 880. Same note, different register." },
      { q: "Approximately what frequency range can humans hear?", options: ["2-2000 Hz", "20-20000 Hz", "200-20000 Hz", "20-200 Hz"], answer: 1, explain: "The healthy human hearing range is roughly 20 Hz (very low bass) to 20,000 Hz (high treble). This range narrows with age.", hint: "The number is repeated: 20 to 20,000." },
      { q: "Where do most vocals and instruments sit in the frequency spectrum?", options: ["Sub-bass (20-60 Hz)", "Midrange (250 Hz-4 kHz)", "Air (8-20 kHz)", "Infrasound (below 20 Hz)"], answer: 1, explain: "The midrange contains most energy from vocals, guitars, pianos, synths — which is why it is the most competitive range to EQ.", hint: "The middle of the spectrum contains the middle of most music." },
    ],
  },
  {
    slug: "amplitude-volume",
    world: "foundations",
    number: 3,
    title: "Amplitude & Volume",
    tagline: "How we measure and control loudness.",
    xp: 40,
    explainer: [
      { kind: "lead", text: "Amplitude is the physical height of a sound wave — the measure of its pressure variation. We measure it in decibels (dB), a logarithmic scale that matches how our ears perceive loudness." },
      { kind: "para", text: "The decibel scale is logarithmic because our ears are. A sound that is physically twice as powerful sounds only slightly louder — roughly 3 dB more. For a sound to seem twice as loud to a human listener, you need about 10 dB more power." },
      { kind: "list", items: ["0 dB SPL — threshold of human hearing", "30 dB — quiet bedroom at night", "60 dB — normal conversation", "85 dB — prolonged exposure causes hearing damage", "110 dB — live rock concert (front row)", "130 dB — threshold of pain"] },
      { kind: "callout", tone: "warn", text: "In DAWs, 0 dBFS (Full Scale) is the maximum digital level. Going above it causes clipping — harsh digital distortion. Unlike acoustic levels, never exceed 0 dBFS." },
    ],
    sim: { type: "knob-trainer" },
    quiz: [
      { q: "Decibels (dB) use a __ scale because our ears work that way.", options: ["Linear", "Logarithmic", "Exponential", "Quadratic"], answer: 1, explain: "Our ears compress the enormous range of sounds we can hear into a manageable perception. Each 10 dB increase sounds roughly twice as loud despite being 10x more power.", hint: "Doubling physical power only adds 3 dB, not 2x." },
      { q: "In a DAW, what happens if you exceed 0 dBFS?", options: ["The track gets louder", "Digital clipping — harsh distortion", "The volume wraps around", "Nothing — it auto-limits"], answer: 1, explain: "0 dBFS is the absolute ceiling of digital audio. Exceeding it causes clipping where the waveform is literally cut off at the maximum value, creating harsh distortion.", hint: "It is a hard ceiling. You cannot go higher — it clips." },
      { q: "What is dynamic range?", options: ["The EQ curve of a sound", "The difference between loudest and softest levels in audio", "The frequency response of a speaker", "The stereo width of a mix"], answer: 1, explain: "Dynamic range = the spread between quietest and loudest. A large dynamic range feels expressive and live. Over-compression squashes dynamic range.", hint: "Range = distance between two extremes. Loud and soft." },
      { q: "How many dB more does a sound need to seem twice as loud to humans?", options: ["2 dB", "3 dB", "6 dB", "10 dB"], answer: 3, explain: "About 10 dB more power is needed for a sound to seem twice as loud — because of our logarithmic hearing.", hint: "It is more than you would expect — our ears are very efficient compressors." },
    ],
  },
  {
    slug: "timbre-tone",
    world: "foundations",
    number: 4,
    title: "Timbre & Tone Colour",
    tagline: "Why a piano and guitar sound different on the same note.",
    xp: 40,
    explainer: [
      { kind: "lead", text: "Timbre is the tonal quality that makes a piano sound different from a guitar even when they play the same note at the same volume. It is determined by the sound's overtone structure — the combination of the fundamental frequency plus all its harmonics." },
      { kind: "list", items: ["Bright: strong high-frequency harmonics (cymbal, harpsichord, distorted guitar)", "Warm: emphasised low-mids, rolled-off highs (acoustic bass, cello, Rhodes)", "Harsh: excessive upper-midrange harmonics (over-driven amp)", "Airy: prominent high-frequency content (flute, hi-hats, breathy vocals)", "Hollow: scooped midrange (flute, whistling)"] },
      { kind: "callout", tone: "key", text: "In synthesis, you control timbre by choosing a waveform and then filtering it. In mixing, EQ adjusts timbre by boosting or cutting frequency regions." },
    ],
    sim: { type: "ear-training" },
    quiz: [
      { q: "Timbre is best described as", options: ["How loud a sound is", "How fast it vibrates", "The tonal quality or colour of a sound", "The spatial position of a sound"], answer: 2, explain: "Timbre is what makes sounds different from each other even when pitch and loudness are the same. It is determined by the overtone structure.", hint: "Same note, different instrument — what is different?" },
      { q: "What determines a sound's timbre?", options: ["Its fundamental frequency only", "Its amplitude only", "The mix of its fundamental and overtones", "Its attack time only"], answer: 2, explain: "Timbre comes from the specific combination of the fundamental frequency plus all its overtones, each at different relative amplitudes.", hint: "A guitar string vibrates at many frequencies simultaneously." },
      { q: "Which waveform is the purest — containing only a fundamental, no overtones?", options: ["Square wave", "Sawtooth wave", "Triangle wave", "Sine wave"], answer: 3, explain: "A sine wave is a pure single frequency with no harmonics — the simplest possible waveform. All other waveforms contain multiple harmonics.", hint: "The simplest mathematical wave." },
      { q: "In mixing, which tool primarily adjusts timbre?", options: ["Compressor", "Reverb", "EQ", "Limiter"], answer: 2, explain: "An EQ (equaliser) boosts or cuts specific frequency ranges, directly changing the balance of harmonics and thus the perceived timbre of a sound.", hint: "It adjusts the frequency balance — the mix of harmonics." },
    ],
  },
  {
    slug: "waveforms",
    world: "foundations",
    number: 5,
    title: "Waveforms",
    tagline: "The four fundamental shapes of sound.",
    xp: 40,
    explainer: [
      { kind: "lead", text: "A waveform is a graph of a sound's pressure variation over time. The four fundamental synthesiser waveforms — sine, square, sawtooth, and triangle — each have distinct harmonic content and character." },
      { kind: "list", items: ["Sine wave — pure fundamental only. Clean, smooth. Sub bass, simple tones.", "Square wave — fundamental + odd harmonics. Hollow, woody, retro. Organs, clarinets.", "Sawtooth wave — fundamental + ALL harmonics. Bright, buzzy, rich. Strings, brass, bass.", "Triangle wave — fundamental + odd harmonics (weaker). Softer than square. Flutes, muted leads."] },
      { kind: "callout", tone: "tip", text: "In synthesis, you start with one of these basic waveforms and then shape it — filtering removes harmonics, distortion adds them." },
    ],
    sim: { type: "synth-playground" },
    quiz: [
      { q: "Which waveform contains ONLY a fundamental frequency?", options: ["Square", "Sawtooth", "Sine", "Triangle"], answer: 2, explain: "The sine wave is the purest possible waveform — a single frequency with no harmonics.", hint: "The simplest, smoothest wave." },
      { q: "A sawtooth wave contains", options: ["Only odd harmonics", "Only even harmonics", "All harmonics (odd and even)", "No harmonics"], answer: 2, explain: "The sawtooth wave contains the fundamental plus ALL harmonics — both odd and even-numbered. This makes it bright and great for synthesis.", hint: "The all-harmonics wave — brightest and richest." },
      { q: "What does audio clipping do to a waveform?", options: ["Makes it louder without distortion", "Cuts off the peaks, flattening the tops", "Adds reverb", "Increases the frequency"], answer: 1, explain: "Clipping occurs when a waveform exceeds the maximum digital level. The peaks are literally cut flat, adding harsh high-frequency harmonics — digital distortion.", hint: "The wave is clipped — its top cut off like a pruned hedge." },
      { q: "A square wave sounds hollow because it contains", options: ["All harmonics", "No harmonics", "Only odd harmonics", "Only even harmonics"], answer: 2, explain: "Square waves contain the fundamental plus only odd-numbered harmonics. The missing even harmonics give them their characteristic hollow, woody sound.", hint: "Missing the even numbers — hollow in the middle." },
    ],
  },
  {
    slug: "sound-in-space",
    world: "foundations",
    number: 6,
    title: "Sound in Space",
    tagline: "Reverb, reflection, and why rooms have character.",
    xp: 40,
    explainer: [
      { kind: "lead", text: "Sound bounces off walls, floors, ceilings and objects, reaching you from multiple directions and at different times. This combination of direct sound and reflections is what we call reverb, and it is why every space sounds different." },
      { kind: "list", items: ["Direct sound — travels straight from source to ear", "Early reflections — first bounces off nearby surfaces (arrive within 50ms)", "Late reverb — dense, diffuse tail of countless reflections blending together", "RT60 — time for reverb to decay by 60 dB (standard room measurement)"] },
      { kind: "callout", tone: "key", text: "In production, reverb is both a problem (in recording) and a tool (in mixing). We record in dry rooms, then add artificial reverb to place sounds in imagined spaces." },
    ],
    sim: { type: "none" },
    quiz: [
      { q: "Reverb is caused by", options: ["Sound waves speeding up", "Sound reflections off surfaces arriving at different times", "Changes in frequency over time", "Harmonic distortion"], answer: 1, explain: "Reverb is the accumulation of countless reflections from surfaces, each arriving at slightly different times.", hint: "Clap in a cathedral — the sound bounces everywhere." },
      { q: "Hard surfaces (glass, concrete) mostly __ sound.", options: ["Absorb", "Reflect", "Eliminate", "Generate"], answer: 1, explain: "Hard surfaces reflect sound energy. Soft surfaces (carpet, foam) absorb it. Recording studios use soft, irregular materials to deaden reflections.", hint: "Hard = bouncy. Soft = absorby." },
      { q: "What is pre-delay in reverb?", options: ["The loudness of the reverb", "The gap between the dry sound and the start of reverb", "The frequency of the reverb", "The stereo width of the reverb"], answer: 1, explain: "Pre-delay is the time between the original dry sound and when the reverb begins. It helps the dry signal arrive before the reverb cloud, keeping things clear.", hint: "A small gap before the echo starts — letting the direct sound land first." },
      { q: "RT60 is a measurement of", options: ["The highest frequency in a room", "How long it takes reverb to decay by 60 dB", "The recording level in dB", "The tempo of a track"], answer: 1, explain: "RT60 measures how long it takes for a sound to decay by 60 decibels in a room — the standard metric for how live or dead a room is.", hint: "RT = Reverberation Time. 60 = 60 dB of decay." },
    ],
  },
  {
    slug: "overtones-harmonics",
    world: "foundations",
    number: 7,
    title: "Overtones & Harmonics",
    tagline: "The hidden notes inside every note.",
    xp: 40,
    explainer: [
      { kind: "lead", text: "When you play a single note on any real instrument, you are actually hearing dozens of frequencies at once. The lowest is the fundamental. Above it are harmonics at integer multiples of the fundamental that give each instrument its tonal character." },
      { kind: "list", items: ["1st harmonic (fundamental) — the named pitch, strongest component", "2nd harmonic — one octave up from fundamental", "3rd harmonic — one octave + a fifth up", "4th harmonic — two octaves up", "Inharmonics — frequencies that are not integer multiples (bells, cymbals, drums)"] },
      { kind: "callout", tone: "key", text: "The harmonic series is why certain intervals (octave, fifth, fourth) sound consonant — they share harmonics. Dissonant intervals share fewer harmonics, creating beating and tension." },
    ],
    sim: { type: "ear-training" },
    quiz: [
      { q: "If a sound fundamental is 200 Hz, its 3rd harmonic is at", options: ["300 Hz", "400 Hz", "600 Hz", "100 Hz"], answer: 2, explain: "Harmonics are at integer multiples: 3rd = 3 x 200 Hz = 600 Hz.", hint: "3rd harmonic = 3 times the fundamental." },
      { q: "Why do octave intervals sound pure and stable?", options: ["They have the same amplitude", "Their frequencies share many common harmonics", "They are exactly 100 Hz apart", "They are both in the bass range"], answer: 1, explain: "An octave (2:1 ratio) means every harmonic of the higher note coincides with an even harmonic of the lower note — maximum harmonic overlap, maximum consonance.", hint: "Consonance = shared harmonics. Octave = maximum sharing." },
      { q: "Which type of sound has overtones that do NOT follow the harmonic series?", options: ["Violin string", "Brass instrument", "Bell or cymbal", "Flute"], answer: 2, explain: "Bells, cymbals and drums produce inharmonic overtones — their vibration modes do not follow integer multiples of the fundamental, making pitch harder to perceive.", hint: "Bells sound clangy — hard to sing along to a specific pitch." },
      { q: "Adding more high-frequency harmonics to a sound makes it", options: ["Warmer and rounder", "Brighter with more presence", "Quieter", "Lower in pitch"], answer: 1, explain: "High-frequency harmonics add brightness, presence, and edge to a sound. This is what EQ high-shelf boosts and saturation effects do.", hint: "High harmonics = high frequency energy = brightness." },
    ],
  },
  {
    slug: "how-we-hear",
    world: "foundations",
    number: 8,
    title: "How We Hear",
    tagline: "Ears, brains, and why context changes everything.",
    xp: 40,
    badge: { slug: "sound-scientist", name: "Sound Scientist" },
    explainer: [
      { kind: "lead", text: "Hearing is not passive reception — it is active interpretation. Your ears capture sound waves; your brain reconstructs a rich sonic world from that data, filling in gaps and making constant perceptual decisions." },
      { kind: "list", items: ["Frequency masking — a loud sound makes nearby quieter frequencies inaudible", "Temporal masking — a loud sound can mask quieter sounds shortly before or after it", "Equal loudness contours — our ears are more sensitive to midrange than bass or treble at low volumes", "Binaural hearing — tiny time and level differences between our two ears let us locate sound in space", "Auditory fatigue — prolonged loud exposure temporarily reduces sensitivity"] },
      { kind: "callout", tone: "tip", text: "Mix at moderate volumes (around 75-80 dB SPL). Loud mixing causes ear fatigue and the Fletcher-Munson effect — you over-compensate bass and treble because they feel weaker at high volume." },
    ],
    sim: { type: "ear-training" },
    quiz: [
      { q: "What structure in the ear separates frequencies along its length?", options: ["The eardrum", "The ossicles", "The cochlea", "The auditory nerve"], answer: 2, explain: "The cochlea is a fluid-filled spiral tuned along its length — high frequencies activate hair cells near the entrance, low frequencies activate cells near the apex.", hint: "It is spiral-shaped — like a snail shell." },
      { q: "Frequency masking means", options: ["A filter that removes a frequency", "A loud sound makes nearby quieter sounds inaudible", "Reversing the phase of a frequency", "Adding harmonics to a frequency"], answer: 1, explain: "When a loud sound is present, it masks nearby quieter sounds — making them harder or impossible to hear.", hint: "The loud drowns out the quiet — at similar frequencies." },
      { q: "Why should you mix at moderate volume levels?", options: ["To save electricity", "To avoid auditory fatigue and equal-loudness curve effects", "To make mixes sound better on phones", "Loud mixes clip automatically"], answer: 1, explain: "At high volumes all frequencies seem equally loud. At moderate volumes the ear's natural frequency response reveals real balance issues. Also ear fatigue from loud monitoring leads to poor decisions.", hint: "Loud = tired ears + skewed frequency perception." },
      { q: "Which physical cause leads to permanent hearing damage?", options: ["Listening to music at any volume", "Prolonged exposure to sounds above 85 dB", "Using headphones vs speakers", "Listening to bass-heavy music"], answer: 1, explain: "Sound above 85 dB SPL over extended periods destroys cochlear hair cells irreversibly. There are no hair cell stem cells in adult humans — once damaged, gone forever.", hint: "85 dB is the threshold. Time + level = damage." },
    ],
  },
];

const rhythmPath: Mission[] = [
  { slug: "what-is-rhythm", world: "foundations", number: 9, title: "What Is Rhythm?", tagline: "Pattern, pulse and the feel of time.", xp: 40, badge: { slug: "time-keeper", name: "Time Keeper" },
    explainer: [
      { kind: "lead", text: "Rhythm is the organisation of sounds in time — when notes happen and when they do not. The fundamental element is the pulse: a steady regular beat underlying most music. Source: learningmusic.ableton.com/make-beats" },
      { kind: "list", items: ["Pulse — the steady underlying beat (like a heartbeat or clock)", "Tempo — how fast the pulse is (measured in BPM)", "Metre — how pulses group into recurring patterns (4/4, 3/4, etc.)", "Accent — emphasis on certain beats that creates the feel", "Groove — the human feel around the rhythm"] },
      { kind: "callout", tone: "key", text: "Rhythm exists in relationships between sounds. A single note has no rhythm. Two notes at different times start to establish one. The pattern of when things happen is everything." }
    ],
    sim: { type: "drum-pad" },
    quiz: [
      { q: "The pulse in music is", options: ["The melody of a song", "A steady regular underlying beat", "The loudest sound in a mix", "The tempo in BPM"], answer: 1, explain: "The pulse is the steady heartbeat underlying music — the beat you tap your foot to even if it is not explicitly played. Source: learningmusic.ableton.com/make-beats", hint: "Think: metronome click. Steady, regular, constant." },
      { q: "Rhythm is primarily about", options: ["Which notes are played", "When sounds happen in time", "How loud sounds are", "Which key a song is in"], answer: 1, explain: "Rhythm is the organisation of sound in time — the pattern of when events occur and do not occur.", hint: "Replace all notes with the same click — what is left? That is rhythm." },
      { q: "What is groove in rhythm?", options: ["Playing exactly on the grid", "The human feel around the beat — timing variations that create motion", "The BPM of a track", "A type of software"], answer: 1, explain: "Groove is the subtle timing variations around the beat grid that make rhythm feel human and alive.", hint: "A drum machine plays exactly on grid. A human drummer has groove." },
      { q: "What is metre in music?", options: ["The speed of a track", "How pulses group into recurring patterns", "The pitch of the bass note", "The length of a song"], answer: 1, explain: "Metre describes how beats group together in recurring patterns. 4/4 = four beats per bar. 3/4 = three per bar.", hint: "How many counts before the pattern repeats?" }
    ] },
  { slug: "tempo-bpm", world: "foundations", number: 10, title: "Tempo and BPM", tagline: "Measuring the speed of music.", xp: 40,
    explainer: [
      { kind: "lead", text: "Tempo is the speed of music measured in BPM (Beats Per Minute). 60 BPM = one beat per second. 120 BPM = two beats per second. Source: learningmusic.ableton.com/make-beats" },
      { kind: "list", items: ["50-70 BPM — very slow, ballads, ambient", "70-95 BPM — slow groove, blues, R&B, hip-hop", "95-115 BPM — mid-tempo, pop, lo-fi", "115-130 BPM — dance, house, 4x4 club music", "130-145 BPM — techno, hard house, trance", "160-180 BPM — drum and bass, jungle"] },
      { kind: "callout", tone: "tip", text: "Trap and drill use 130-150 BPM but with a half-time feel — the kick and snare pattern makes it feel like 65-75 BPM. Sub-genres often play with perceived tempo vs actual tempo." }
    ],
    sim: { type: "bpm-tap" },
    quiz: [
      { q: "What does BPM stand for?", options: ["Bass Per Measure", "Beats Per Minute", "Bar Phase Marker", "Beat Pulse Modulator"], answer: 1, explain: "BPM = Beats Per Minute. The universal speed measurement in music production and DJing.", hint: "Think: a stopwatch and a metronome." },
      { q: "House music typically runs at", options: ["70-90 BPM", "120-130 BPM", "150-165 BPM", "180-200 BPM"], answer: 1, explain: "House music runs 120-130 BPM, built around a four-on-the-floor kick drum. Source: learningmusic.ableton.com", hint: "Fast enough to dance to, grounded enough to breathe." },
      { q: "At 120 BPM there are __ beats per second.", options: ["1", "2", "4", "0.5"], answer: 1, explain: "120 BPM divided by 60 seconds = 2 beats per second.", hint: "120 BPM divided by 60 seconds per minute." },
      { q: "Drum and bass typically runs at", options: ["120-130 BPM", "140-150 BPM", "160-180 BPM", "200+ BPM"], answer: 2, explain: "Drum and bass (DnB) typically runs at 160-180 BPM — the fastest mainstream dance genre.", hint: "The fastest mainstream dance genre." }
    ] },
  { slug: "bars-time-signatures", world: "foundations", number: 11, title: "Bars and Time Signatures", tagline: "How music is divided into repeating groups.", xp: 40,
    explainer: [
      { kind: "lead", text: "A bar contains a set number of beats. The time signature tells you how many beats are in each bar and what note value counts as one beat. Source: learningmusic.ableton.com/make-beats" },
      { kind: "list", items: ["4/4 — four quarter-note beats per bar. Pop, rock, house, hip-hop, techno", "3/4 — three beats per bar. Waltz, some ballads", "6/8 — six eighth-note beats grouped in two threes. Gospel, blues", "5/4 — five beats (Dave Brubeck Take Five, prog rock)", "7/8 — seven beats, Balkan music, math rock"] },
      { kind: "callout", tone: "key", text: "In a DAW, the session is organised into bars. Loops are usually 1, 2, 4, 8, or 16 bars. Knowing where bar 1 is matters in production and DJing. Source: Ableton Live manual." }
    ],
    sim: { type: "drum-pad" },
    quiz: [
      { q: "In 4/4 time, how many beats are in each bar?", options: ["2", "3", "4", "8"], answer: 2, explain: "The top number of the time signature tells you beats per bar. 4/4 = 4 beats per bar.", hint: "The top number of the time signature = beats per bar." },
      { q: "What is the downbeat?", options: ["Beat 2 of a bar", "The last beat of a bar", "Beat 1 — the strongest most grounded beat", "Any quiet beat"], answer: 2, explain: "The downbeat is beat 1 — the first and strongest beat of each bar. The home base where the bar restarts. DJs align transitions to the downbeat.", hint: "Count: ONE two three four. The ONE is the downbeat." },
      { q: "A waltz uses which time signature?", options: ["4/4", "3/4", "6/8", "5/4"], answer: 1, explain: "A waltz is in 3/4 — three beats per bar. ONE two three ONE two three.", hint: "Waltz: one-two-three, one-two-three. How many in a group?" },
      { q: "In a DAW, why do bars matter?", options: ["They set the volume level", "They determine clip lengths, loop points and arrangement structure", "They control the pitch", "They define the stereo width"], answer: 1, explain: "Everything in a DAW is bar-based. Clip lengths are multiples of bars. Automation aligns to bars. Bars are the building blocks.", hint: "The grid in your DAW? That is bars." }
    ] },
  { slug: "groove-feel", world: "foundations", number: 12, title: "Groove and Feel", tagline: "Why a drum machine does not always sound human.", xp: 40,
    explainer: [
      { kind: "lead", text: "Groove is the subtle timing variation around the beat grid that makes rhythm feel alive. When every note lands exactly on the mathematical grid, music can sound rigid and lifeless. Source: Ableton Live manual — Groove Pool." },
      { kind: "list", items: ["Laid back — notes placed slightly after the beat. Relaxed, deep, hip-hop feel", "Pushing — notes placed slightly before the beat. Urgent, excited, forward motion", "Velocity variation — different hit strengths for natural dynamics", "Humanise — random small timing variations added to a rigid MIDI pattern", "Quantise — snapping notes to the grid (removes human variation)"] },
      { kind: "callout", tone: "tip", text: "In Ableton Live, the Groove Pool lets you extract the groove from any audio sample and apply it to MIDI. You can make programmed drums feel like a specific famous drum break. Source: Ableton Live manual — Groove Pool." }
    ],
    sim: { type: "groove-extractor" },
    quiz: [
      { q: "What is swing in music production?", options: ["Playing notes out of key", "Making off-beats slightly later to create a bouncy feel", "Playing faster than the tempo", "Adding reverb to drums"], answer: 1, explain: "Swing delays the off-beats slightly, giving rhythm a bouncy triplet-like feel. 50% = straight, 67% = full triplet shuffle. Source: Ableton Live manual.", hint: "Jazz and hip-hop both use heavy swing. It makes things bounce." },
      { q: "Quantising a MIDI part means", options: ["Adding swing to it", "Snapping all notes exactly to the grid", "Transposing it to a new key", "Adding velocity variation"], answer: 1, explain: "Quantise moves MIDI notes to the nearest grid position, making them rhythmically exact. Over-quantise and it sounds lifeless.", hint: "Snap to grid — perfectly precise." },
      { q: "A laid back groove means notes are placed", options: ["Exactly on the beat", "Slightly before the beat", "Slightly after the beat", "Randomly throughout the bar"], answer: 2, explain: "Laid back = notes land slightly after the mathematical beat. Creates a relaxed deep feel — classic in hip-hop, soul, blues.", hint: "Laid back = relaxed. Late to the party." },
      { q: "The Groove Pool in Ableton", options: ["Generates random beats", "Extracts groove timing from audio and applies it to MIDI", "Sets the master BPM", "Records audio loops"], answer: 1, explain: "The Groove Pool lets you drag any audio clip in, extract its rhythmic feel, and apply that groove to any MIDI clip. Source: Ableton Live manual.", hint: "Steal the feel from a real drum break." }
    ] },
  { slug: "syncopation", world: "foundations", number: 13, title: "Syncopation", tagline: "Hitting the off-beat — where energy hides.", xp: 40,
    explainer: [
      { kind: "lead", text: "Syncopation is placing accents on beats or subdivisions that are typically unaccented — the off-beats between the main pulse. It creates rhythmic surprise, forward motion and tension. Most popular music is built on syncopation. Source: learningmusic.ableton.com", },
      { kind: "list", items: ["Backbeat — emphasis on beats 2 and 4 (pop/rock snare, handclap)", "Off-beat eighth notes — accenting the and between beats", "Anticipated beat — hitting just before the bar line (common in funk bass)", "Tied syncopation — a note starts on an off-beat and holds through the strong beat", "Clave — the foundational syncopated pattern of Afro-Cuban music"] },
      { kind: "callout", tone: "key", text: "Syncopation is fundamentally African in origin. West African rhythmic systems form the foundation of virtually all popular music: blues, jazz, R&B, rock, funk, hip-hop, house, techno." }
    ],
    sim: { type: "drum-pad" },
    quiz: [
      { q: "Syncopation means", options: ["Playing only on the main beats", "Accenting off-beats or weak beats unexpectedly", "Playing in a different time signature", "Slowing down the tempo"], answer: 1, explain: "Syncopation shifts emphasis to the wrong beats — the off-beats, weak beats, spaces between the main pulse.", hint: "Hitting where you are not supposed to hit." },
      { q: "In 4/4 time the backbeat is on", options: ["Beats 1 and 3", "Beats 2 and 4", "All four beats", "The eighth-note off-beats"], answer: 1, explain: "The backbeat is beats 2 and 4 — where the snare or clap usually lands. The heartbeat of pop, rock, and most dance music.", hint: "When do you clap along to a pop song? The 2 and 4." },
      { q: "Which tradition is the primary origin of syncopation in popular music?", options: ["European classical music", "West African rhythmic traditions", "Indian classical music", "East Asian music"], answer: 1, explain: "West African musical traditions, carried through the transatlantic slave trade, gave popular music its syncopated rhythmic DNA.", hint: "Afro-Cuban clave, blues, jazz — trace their rhythmic roots." },
      { q: "An anticipated beat hits", options: ["Slightly late", "Just before the downbeat creating forward momentum", "Tied over a bar line", "Exactly on the beat"], answer: 1, explain: "An anticipated beat hits just before the bar line — arriving early to create a feeling of rushing forward into the next bar. Very common in funk bass.", hint: "It anticipates what is coming — arrives early." }
    ] },
  { slug: "polyrhythm", world: "foundations", number: 14, title: "Polyrhythm", tagline: "Two rhythms at once — and why it hypnotises.", xp: 50,
    explainer: [
      { kind: "lead", text: "Polyrhythm is the simultaneous use of two or more contrasting rhythms. The most common example is 3 against 2 — one voice plays three evenly-spaced notes while another plays two over the same duration." },
      { kind: "list", items: ["3:2 — three beats against two (the fundamental polyrhythm)", "4:3 — four against three", "Hemiola — alternating between groupings of 3 and 2 within 6/8", "African clave — a 3:2 syncopated pattern foundational to Cuban and jazz music", "Trap hi-hats — often places a 3-beat hi-hat pattern over a 4-beat kick grid"] },
      { kind: "callout", tone: "tip", text: "Try programming an eighth-note hi-hat pattern in groups of three (every 3 sixteenths) over a straight four-on-the-floor kick. The resulting 3-against-4 creates hypnotic forward motion — used constantly in minimal techno and Afrobeats." }
    ],
    sim: { type: "drum-pad" },
    quiz: [
      { q: "Polyrhythm means", options: ["Playing one complex rhythm", "Using two or more contrasting rhythms simultaneously", "Changing time signature mid-song", "Playing faster than normal"], answer: 1, explain: "Polyrhythm = multiple different rhythmic patterns happening at the same time. The interlock between them creates complexity that none of the individual parts has alone.", hint: "Poly = many. Multiple rhythms simultaneously." },
      { q: "In a 3:2 polyrhythm you hear", options: ["Three beats per bar", "Three evenly-spaced notes against two evenly-spaced notes in the same time", "A time signature of 3/2", "Three loud beats and two quiet beats"], answer: 1, explain: "3:2 = three notes evenly distributed while two notes are evenly distributed in the same duration. They only align at the start and end of the cycle.", hint: "Two players, same duration, different subdivisions — they pull against each other." },
      { q: "Polyrhythm originated primarily in", options: ["European classical music", "Indian classical music", "West African drumming traditions", "Medieval church music"], answer: 2, explain: "West African drumming ensembles are built entirely on polyrhythm — multiple interlocking rhythmic patterns layered simultaneously.", hint: "Djembe circles. Talking drums. Ewe, Yoruba, Akan drumming traditions." },
      { q: "How do some trap producers use polyrhythm?", options: ["By using 7/8 time", "By placing a 3-beat hi-hat pattern over a 4-beat kick grid", "By removing all percussion", "By using multiple tempos"], answer: 1, explain: "A common trap technique is programming hi-hats in groups of three sixteenth notes over a standard 4/4 kick — creating a 3-against-4 polyrhythm.", hint: "Count hi-hats: 1-2-3 1-2-3 over a 1-2-3-4 kick." }
    ] },
  { slug: "note-values", world: "foundations", number: 15, title: "Note Values and Subdivision", tagline: "Whole notes, halves, quarters, eighths — the maths of rhythm.", xp: 40,
    explainer: [
      { kind: "lead", text: "Note values describe how long a note is held relative to the bar. In 4/4 time, a whole note fills an entire bar (4 beats). A half note = 2 beats. A quarter note = 1 beat. An eighth note = half a beat. Source: learningmusic.ableton.com/make-beats" },
      { kind: "list", items: ["Whole note (semibreve) — 4 beats in 4/4", "Half note (minim) — 2 beats", "Quarter note (crotchet) — 1 beat — the standard BPM pulse", "Eighth note (quaver) — 1/2 beat — 8 per bar in 4/4", "Sixteenth note (semiquaver) — 1/4 beat — 16 per bar in 4/4", "Triplets — three notes in the space of two (gives swing feel)"] },
      { kind: "callout", tone: "key", text: "The piano roll in your DAW shows time on the horizontal axis. Set the grid to 1/16 and you see 16 positions per bar — each one a sixteenth note. Source: Ableton Live manual — MIDI notes and velocity." }
    ],
    sim: { type: "piano-roll" },
    quiz: [
      { q: "How many eighth notes fit in one bar of 4/4?", options: ["4", "6", "8", "16"], answer: 2, explain: "In 4/4 there are 4 beats. An eighth note = half a beat. 4 beats x 2 eighth notes per beat = 8 per bar.", hint: "One beat = two eighth notes. Four beats = eight eighth notes." },
      { q: "A quarter note lasts", options: ["A quarter of a beat", "One beat (in 4/4)", "Four beats", "Half a bar"], answer: 1, explain: "In 4/4 a quarter note lasts exactly one beat — the standard pulse unit that BPM is measured in.", hint: "Quarter note = one quarter of a 4/4 bar = one beat." },
      { q: "Sixteenth notes are how many per bar in 4/4?", options: ["8", "12", "16", "32"], answer: 2, explain: "Sixteenth note = 1/4 beat. 4 beats x 4 sixteenth notes per beat = 16 per bar.", hint: "16 per bar — hence the name." },
      { q: "A dotted quarter note lasts", options: ["1 beat", "1.5 beats", "2 beats", "0.75 beats"], answer: 1, explain: "A dot adds half the note value. Quarter note = 1 beat. Half of 1 beat = 0.5 beats. Dotted quarter = 1.5 beats.", hint: "Dot = add half again. 1 + (1 divided by 2) = 1.5." }
    ] },
  { slug: "rhythm-in-production", world: "foundations", number: 16, title: "Rhythm in Production", tagline: "How rhythm works inside a DAW.", xp: 40, badge: { slug: "rhythm-builder", name: "Rhythm Builder" },
    explainer: [
      { kind: "lead", text: "In a DAW, rhythm is managed through the piano roll (for MIDI), the drum rack (for individual drum hits), and the audio clip editor. Understanding note values and bar structure lets you work confidently in any of these. Source: Ableton Live manual." },
      { kind: "list", items: ["Step sequencer — grid of boxes each representing a subdivision", "Piano roll — horizontal grid where you draw notes of any length at any position", "MIDI clip — stores note data that an instrument plays back at the project tempo", "Drum rack — maps individual drum sounds to MIDI notes, one pad = one sound", "Quantise — snap MIDI notes to the nearest grid division to tighten timing"] },
      { kind: "callout", tone: "tip", text: "Record your rhythmic ideas at a slower tempo first. Speed the project up once the parts are recorded. Much easier to play accurately at 80 BPM then raise to 140 than to record at 140 from the start." }
    ],
    sim: { type: "drum-pad" },
    quiz: [
      { q: "In a DAW drum rack each pad represents", options: ["A bar of music", "A MIDI note mapped to a specific drum sound", "A tempo setting", "An audio track"], answer: 1, explain: "A drum rack maps individual drum sounds to specific MIDI notes. Triggering MIDI note C1 plays the kick, D1 the snare, etc. Source: Ableton Live manual — Drum Rack.", hint: "Pad = MIDI note = drum sound. One-to-one mapping." },
      { q: "Warping audio in a DAW means", options: ["Reversing the audio", "Stretching or compressing audio so its rhythm aligns with the project tempo without changing pitch", "Adding distortion", "Exporting the file"], answer: 1, explain: "Warping time-stretches audio so it plays at the project BPM without changing pitch. Source: Ableton Live manual — Warping.", hint: "Time-stretch to fit the grid — tempo change without pitch change." },
      { q: "Why add drum pattern variations every 4 bars?", options: ["To change the BPM", "To prevent monotony and signal structural transitions", "To add reverb", "To fix timing errors"], answer: 1, explain: "Using the same drum loop for an entire track becomes monotonous. Small variations create interest and signal section changes.", hint: "Four bars and repeat gets boring. Mix it up." },
      { q: "Recording at a slower BPM first then speeding up is useful because", options: ["It saves file space", "It is easier to play accurately at lower tempos and the grid scales up cleanly", "It changes the key of the recording", "It automatically adds swing"], answer: 1, explain: "Performing at lower BPM lets you play each note accurately. Once recorded, raise the project tempo and MIDI scales perfectly.", hint: "Practice slow, perform fast. DAWs work the same way." }
    ] },
];

const melodyPath: Mission[] = [
  { slug: "notes-and-octaves", world: "foundations", number: 17, title: "Notes and Octaves", tagline: "The 12 notes and why the pattern repeats.", xp: 40, badge: { slug: "note-finder", name: "Note Finder" },
    explainer: [
      { kind: "lead", text: "Western music uses 12 pitch classes arranged in a repeating cycle called the chromatic scale. Source: learningmusic.ableton.com/notes-and-scales" },
      { kind: "list", items: ["Middle C is C4 — roughly the centre of a standard 88-key piano", "Sharps (#) raise a note by one semitone — C# is one above C", "Flats (b) lower a note by one semitone — Bb is one below B", "Enharmonic equivalents — same pitch, different name (C# = Db)", "Scientific pitch notation — C4, D4, E4 (number = octave number)"] },
      { kind: "callout", tone: "key", text: "On a piano keyboard, white keys are the 7 natural notes. Black keys are the sharps/flats. The pattern of 2 black keys + gap + 3 black keys repeats every octave — use it to find any note." }
    ],
    sim: { type: "piano-roll" },
    quiz: [
      { q: "How many semitones are in one octave?", options: ["7", "8", "10", "12"], answer: 3, explain: "There are 12 semitones in one octave — all the half-step steps from C to the next C including sharps and flats.", hint: "Count every key (white AND black) from C to the next C on a piano." },
      { q: "Middle C in scientific pitch notation is", options: ["C3", "C4", "C5", "C6"], answer: 1, explain: "Middle C = C4. It sits in the middle of a standard 88-key piano keyboard. Source: learningmusic.ableton.com/notes-and-scales", hint: "Middle C = C4. The 4 is the octave number." },
      { q: "C# and Db are", options: ["Different pitches", "The same pitch — enharmonic equivalents", "An octave apart", "A perfect fifth apart"], answer: 1, explain: "C# (C sharp) and Db (D flat) are enharmonic equivalents — the same pitch on a keyboard, just named differently depending on context.", hint: "Same black key, two names." },
      { q: "Going up one octave multiplies the frequency by", options: ["10", "3", "2", "1.5"], answer: 2, explain: "One octave up = frequency x 2. A4 = 440 Hz, A5 = 880 Hz. Each octave doubles the frequency.", hint: "Double the frequency = same note one octave higher." }
    ] },
  { slug: "major-scale", world: "foundations", number: 18, title: "The Major Scale", tagline: "Do Re Mi — the brightest most universal scale.", xp: 40,
    explainer: [
      { kind: "lead", text: "The major scale is the most fundamental pitch collection in Western music. Seven notes in a specific pattern of whole steps (W) and half steps (H): W W H W W W H. Starting on C: C D E F G A B. Source: learningmusic.ableton.com/notes-and-scales" },
      { kind: "list", items: ["C major: C D E F G A B (all white keys)", "G major: G A B C D E F# (one sharp)", "F major: F G A Bb C D E (one flat)", "Pattern: W W H W W W H from any starting note", "Each note has a number (scale degree): 1 2 3 4 5 6 7"] },
      { kind: "callout", tone: "tip", text: "Scale degrees matter more than note names. The 1 (tonic) is always home. The 5 (dominant) creates tension. The 7 (leading tone) wants to resolve up to 1. These relationships are the same regardless of key. Source: learningmusic.ableton.com" }
    ],
    sim: { type: "piano-roll" },
    quiz: [
      { q: "The major scale follows which step pattern?", options: ["W H W W H W W", "W W H W W W H", "H W W H W W W", "All whole steps"], answer: 1, explain: "W W H W W W H — whole, whole, half, whole, whole, whole, half. Follow this pattern from any note to build a major scale.", hint: "Two whole steps then a half — then three whole steps then a half." },
      { q: "C major uses", options: ["All black keys", "All white keys", "Mixed black and white keys", "Only C E and G"], answer: 1, explain: "C major uses all seven white keys (C D E F G A B) with no sharps or flats.", hint: "Play only the white keys from C to C. That is C major." },
      { q: "The major scale sounds happy or bright primarily because of its", options: ["Minor third (3 semitones)", "Major third (4 semitones)", "Perfect fifth", "Minor seventh"], answer: 1, explain: "The major third (4 semitones from root to 3rd scale degree) gives major scales their bright quality. The minor scale lowers this by one semitone.", hint: "The 3rd degree is the key difference between major and minor." },
      { q: "What is a scale degree?", options: ["The volume of a note", "The numbered position of a note within a scale (1-7)", "The frequency in Hz", "The octave number"], answer: 1, explain: "Scale degrees number the notes of a scale from 1 (tonic) to 7 (leading tone). Using numbers means the same patterns apply regardless of key.", hint: "1 = home. 5 = tension. 7 = leading tone." }
    ] },
  { slug: "minor-scale", world: "foundations", number: 19, title: "The Minor Scale", tagline: "Darkness, mystery and emotional depth.", xp: 40,
    explainer: [
      { kind: "lead", text: "The natural minor scale follows: W H W W H W W. Starting on A: A B C D E F G — the relative minor of C major, using the same notes but with A as home. Source: learningmusic.ableton.com/notes-and-scales" },
      { kind: "list", items: ["Natural minor: W H W W H W W (darkest, most basic)", "Harmonic minor: raises the 7th by a semitone — dramatic pull to tonic", "Melodic minor: raises both 6th and 7th when ascending — smoother melodic motion", "Relative minor — every major key has a relative minor starting from the 6th degree", "Parallel minor — same root, different notes (C major vs C minor)"] }
    ],
    sim: { type: "piano-roll" },
    quiz: [
      { q: "Compared to the major scale, the minor scale has a lowered", options: ["2nd degree", "3rd degree", "5th degree", "7th degree"], answer: 1, explain: "The minor scale lowers the 3rd degree by one semitone compared to major. This single change gives minor its darker quality.", hint: "The 3rd degree is the key difference. Lower it and it gets sadder." },
      { q: "The relative minor of C major is", options: ["C minor", "A minor", "E minor", "G minor"], answer: 1, explain: "Every major key has a relative minor starting on the 6th scale degree. The 6th degree of C major is A, so A minor is its relative minor.", hint: "Go to the 6th note of C major (C-D-E-F-G-A). Start there = A minor." },
      { q: "The harmonic minor scale is distinctive because it has", options: ["A lowered 5th", "A raised 7th creating a 1.5-step interval", "No sharps or flats", "A raised 3rd"], answer: 1, explain: "Harmonic minor raises the 7th by a semitone, creating a gap of 1.5 steps between the 6th and 7th degrees. Very common in flamenco, classical, and metal.", hint: "The exotic sounding minor. Eastern or dramatic flavour." },
      { q: "Which genres frequently use minor keys?", options: ["Happy birthday songs only", "Dark melancholic dramatic music — metal, dark EDM, blues, film scores", "Only classical music", "Only jazz"], answer: 1, explain: "Minor keys are used wherever darkness, sadness, tension or drama are needed.", hint: "Darkness = minor. Think sad film music." }
    ] },
  { slug: "intervals", world: "foundations", number: 20, title: "Intervals", tagline: "The distance between notes and why it matters.", xp: 40,
    explainer: [
      { kind: "lead", text: "An interval is the distance in pitch between two notes. Intervals determine whether two notes sound stable or tense, consonant or dissonant. Every melody, chord and harmony is built from specific intervals. Source: learningmusic.ableton.com/notes-and-scales" },
      { kind: "list", items: ["Minor 2nd (1 semitone) — very dissonant, tense (Jaws theme)", "Major 2nd (2 semitones) — stepwise motion, neutral", "Minor 3rd (3 semitones) — minor colour, slightly sad", "Major 3rd (4 semitones) — bright, major colour, stable", "Perfect 4th (5 semitones) — strong, open", "Tritone (6 semitones) — most dissonant, devil interval", "Perfect 5th (7 semitones) — powerful, open, stable", "Octave (12 semitones) — perfect consonance"] }
    ],
    sim: { type: "ear-training" },
    quiz: [
      { q: "How many semitones is a perfect fifth?", options: ["5", "6", "7", "8"], answer: 2, explain: "A perfect 5th = 7 semitones. From C to G is 7 semitones. One of the most stable powerful intervals.", hint: "C to G. Count: C C# D D# E F F# G = 7." },
      { q: "The devil interval — most dissonant — is the", options: ["Major 3rd", "Perfect 5th", "Tritone (diminished 5th)", "Minor 2nd"], answer: 2, explain: "The tritone (6 semitones — exactly half an octave) is the most dissonant interval. Historically called diabolus in musica.", hint: "Exactly halfway between unison and octave — maximum tension." },
      { q: "A power chord is built from", options: ["Root major 3rd and 5th", "Root and 5th only — no 3rd", "Root minor 3rd and 5th", "Root and octave only"], answer: 1, explain: "Power chord = root + perfect 5th only. No 3rd = no major or minor quality — just raw powerful ambiguity.", hint: "Root + 5th. No 3rd. Ambiguous = powerful." },
      { q: "Consonant intervals feel", options: ["Tense and unstable", "Stable and pleasant — they do not need to resolve", "Always louder", "Only usable in major keys"], answer: 1, explain: "Consonant intervals (octaves, 5ths, 4ths, 3rds) feel stable and complete. Dissonant intervals create tension wanting resolution.", hint: "Consonant = at rest. Dissonant = restless needing to move." }
    ] },
  { slug: "pentatonic-scales", world: "foundations", number: 21, title: "Pentatonic Scales", tagline: "Five notes. Every culture. Infinite melodies.", xp: 40, badge: { slug: "pentatonic-explorer", name: "Pentatonic Explorer" },
    explainer: [
      { kind: "lead", text: "The pentatonic scale is a five-note scale that appears in virtually every musical culture on earth independently. It works because it avoids the most dissonant intervals. Source: learningmusic.ableton.com/notes-and-scales" },
      { kind: "list", items: ["Major pentatonic (C): C D E G A — bright uplifting country/folk/pop", "Minor pentatonic (A): A C D E G — bluesy dark rock/blues/R&B/hip-hop", "Works over major AND minor chords — very flexible", "No tritone interval — no wrong combinations between these 5 notes", "Chinese, Celtic, African, Native American scales are all pentatonic variants"] },
      { kind: "callout", tone: "tip", text: "If stuck on a melody and nothing sounds right, go pentatonic. Five notes, all consonant. Hard to make a mistake. Add notes from the full scale back in one at a time once you have the contour." }
    ],
    sim: { type: "piano-roll" },
    quiz: [
      { q: "How many notes does a pentatonic scale have?", options: ["4", "5", "6", "7"], answer: 1, explain: "Penta = five. A pentatonic scale has 5 notes compared to 7 in a standard major or minor scale.", hint: "Pentagon has 5 sides. Pentatonic has 5 notes." },
      { q: "The minor pentatonic scale is widely used in", options: ["Classical string quartets", "Blues, rock, and hip-hop lead playing", "12-tone serial music", "Indian classical raga"], answer: 1, explain: "The minor pentatonic is the foundation of blues, rock, and much R&B/hip-hop melodic improvisation.", hint: "Blues guitar. Rock riffs. Sweet Home Chicago. All minor pentatonic." },
      { q: "Why do pentatonic scales appear in so many cultures independently?", options: ["They were invented in China", "They avoid the most dissonant intervals — they are naturally consonant", "They use only 5 fingers", "They are easier to write down"], answer: 1, explain: "Pentatonic scales remove the most dissonant intervals. The remaining notes are all consonant with each other.", hint: "No wrong notes in pentatonic — it is harmonically safe." },
      { q: "The major pentatonic is the major scale with which degrees removed?", options: ["1st and 5th", "3rd and 7th", "4th and 7th", "2nd and 6th"], answer: 2, explain: "Major pentatonic = major scale minus the 4th and 7th degrees — the most dissonant members.", hint: "Remove the two most tense notes: the 4 and the 7." }
    ] },
  { slug: "melody-writing", world: "foundations", number: 22, title: "Writing a Melody", tagline: "Contour, phrases and what makes a hook.", xp: 50,
    explainer: [
      { kind: "lead", text: "A great melody is a small story told in pitch and rhythm. It has contour (going up and down), phrasing (breathing in and out), and usually a climax and resolution. Source: learningmusic.ableton.com/notes-and-scales" },
      { kind: "list", items: ["Stepwise motion — notes move to adjacent scale degrees (smooth, vocal-friendly)", "Leaps — notes jump by a 3rd or more (dramatic, interesting)", "Phrase — a complete melodic idea like a sentence (usually 2 or 4 bars)", "Question and answer — first phrase ends unresolved second completes it", "Motif — a short 3-5 note idea that repeats and transforms throughout the melody"] },
      { kind: "callout", tone: "key", text: "The best hooks often have a surprising note — one that sits just outside the obvious scale or lands on an unexpected beat. Surprise creates memorability. Predictability creates familiarity. You need both." }
    ],
    sim: { type: "piano-roll" },
    quiz: [
      { q: "Melodic contour refers to", options: ["The key a melody is in", "The overall shape — the pattern of rising and falling pitches", "How many notes are in the melody", "The tempo of the melody"], answer: 1, explain: "Contour is the shape of a melody over time — whether it rises, falls, arches, waves, or leaps.", hint: "Draw the melody as a line graph. What shape does it make?" },
      { q: "A melodic motif is", options: ["A full verse melody", "A short recognisable 3-5 note idea used as a building block", "A chord sequence", "A type of drum pattern"], answer: 1, explain: "A motif is a short melodic cell that forms the seed of a melody. It can be repeated, inverted, transposed, or developed.", hint: "Think: da da da DAAA. Short. Recognisable. Repeated." },
      { q: "A question and answer melody structure means", options: ["The first verse is a question the chorus is the answer", "The first phrase ends with tension the second resolves it", "Two different singers trade lines", "An instrumental and vocal trade off"], answer: 1, explain: "The question phrase ends on an unresolved note. The answer phrase resolves to the tonic.", hint: "First phrase: rises feels unfinished. Second phrase: falls home." },
      { q: "What makes a melodic hook memorable?", options: ["Being as complex as possible", "Using as many notes as possible", "A balance of surprise and familiarity", "Using only pentatonic notes"], answer: 2, explain: "The sweet spot is predictable enough to follow but surprising enough to be interesting. One unexpected note in an otherwise simple phrase is the classic formula.", hint: "Simple + one surprise = memorable. Complex throughout = forgettable." }
    ] },
  { slug: "ear-training", world: "foundations", number: 23, title: "Ear Training Basics", tagline: "Training your ear to recognise what you hear.", xp: 40,
    explainer: [
      { kind: "lead", text: "Ear training connects what you hear to what you know — recognising intervals, chords, scale degrees, and rhythms by sound alone. Source: learningmusic.ableton.com" },
      { kind: "list", items: ["Relative pitch — recognising the relationship between notes (interval recognition)", "Interval recognition — hearing the colour of each interval", "Chord quality recognition — hearing major vs minor vs diminished vs dominant 7th", "Rhythmic dictation — clapping back what you hear, identifying note values"] },
      { kind: "callout", tone: "tip", text: "Use reference songs for interval recognition. A major 2nd sounds like Happy Birthday. A perfect 4th sounds like Here Comes the Bride. A perfect 5th sounds like the Star Wars theme. Anchor each interval to a song you know." }
    ],
    sim: { type: "ear-training" },
    quiz: [
      { q: "Relative pitch means", options: ["Having perfect pitch", "Recognising the intervals and relationships between notes by ear", "Always singing at the correct pitch", "Using a reference pitch before playing"], answer: 1, explain: "Relative pitch is the ability to identify intervals and scale degrees by ear — knowing the relationship not necessarily the exact note name.", hint: "Relative = in relation to other notes. Not absolute." },
      { q: "A good strategy for recognising a major 2nd interval is", options: ["Studying music theory books", "Memorising the formula", "Associating it with the opening of Happy Birthday", "Practising scales daily"], answer: 2, explain: "Reference songs are the most effective way to recognise intervals by ear. Happy Birthday opens with a major 2nd.", hint: "Happy Bir-THDAY. The first two notes = major 2nd." },
      { q: "The main benefit of ear training for a producer is", options: ["Memorising music theory", "Shrinking the gap between what you can imagine and what you can execute", "Learning to read sheet music", "Playing faster"], answer: 1, explain: "Ear training connects your inner musical imagination to your technical execution.", hint: "Imagine a melody then find it on the keyboard. Ear training makes that faster." },
      { q: "How often should you do ear training for it to be effective?", options: ["Once a week for 2 hours", "Daily even just 10 minutes", "Only when learning a new instrument", "Only before recording sessions"], answer: 1, explain: "Short daily ear training sessions are far more effective than occasional long sessions.", hint: "Consistency beats intensity. Daily drills not rare marathons." }
    ] },
  { slug: "transposition-modes", world: "foundations", number: 24, title: "Transposition and Modes", tagline: "Moving music to a new key and new moods.", xp: 40, badge: { slug: "key-changer", name: "Key Changer" },
    explainer: [
      { kind: "lead", text: "Transposition means moving a melody or chord up or down by a fixed interval — keeping all relationships the same at a different pitch level. Source: Ableton Live manual — Transposing MIDI." },
      { kind: "list", items: ["Ionian (major) — bright stable happy", "Dorian — minor but with a bright 6th — jazz funk soul (Miles Davis So What)", "Phrygian — dark Spanish flamenco flavour", "Lydian — dreamy floating superhero feel (John Williams themes)", "Mixolydian — major but with a flat 7th — rock blues Beatles", "Aeolian (natural minor) — dark melancholic", "Locrian — extremely tense rarely used"] },
      { kind: "callout", tone: "tip", text: "Dorian is the most used non-major non-minor mode in production. Minor-ish but with a brighter 6th that lifts it out of pure sadness. Funk, soul, and much jazz uses Dorian constantly." }
    ],
    sim: { type: "piano-roll" },
    quiz: [
      { q: "Transposing a MIDI region by +5 semitones means", options: ["Making it louder by 5 dB", "Moving every note 5 semitones higher", "Increasing the tempo by 5 BPM", "Adding 5 notes to the melody"], answer: 1, explain: "Transposition shifts every note by a fixed interval. +5 semitones = every note goes up 5 semitones (a perfect 4th higher). Source: Ableton Live manual.", hint: "Transpose = shift. +5 semitones = 5 half-steps up." },
      { q: "The Dorian mode is best described as", options: ["A major scale starting from G", "A minor scale with a raised brighter 6th degree", "The same as the natural minor scale", "A scale with a tritone as the 2nd note"], answer: 1, explain: "Dorian = natural minor with a raised 6th. Darker than major but brighter than Aeolian. Widely used in jazz funk and soul.", hint: "Minor but not quite as dark. That raised 6th is the difference." },
      { q: "Which mode sounds dreamy or floating due to its raised 4th?", options: ["Phrygian", "Dorian", "Lydian", "Mixolydian"], answer: 2, explain: "Lydian has a raised 4th degree. This creates a dreamy floating otherworldly quality — used extensively in film scoring.", hint: "Many superhero and adventure film themes use Lydian." },
      { q: "Mixolydian is the same as a major scale but with a", options: ["Lowered 3rd", "Lowered 5th", "Raised 6th", "Lowered 7th"], answer: 3, explain: "Mixolydian = major scale with a flat 7th. Blues rock and many Beatles songs imply Mixolydian.", hint: "Major but with a flat 7. Blues rock Beatles — all over Mixolydian." }
    ] },
];


const harmonyPath: Mission[] = [
  { slug: "what-are-chords", world: "foundations", number: 25, title: "What Are Chords?", tagline: "Multiple notes together and the feeling they create.", xp: 40, badge: { slug: "chord-builder", name: "Chord Builder" },
    explainer: [
      { kind: "lead", text: "A chord is three or more notes played simultaneously. The combination creates a harmonic colour — major chords sound bright and stable, minor chords darker, diminished chords tense. Source: learningmusic.ableton.com/chords" },
      { kind: "list", items: ["Root position — lowest note is the root (C E G)", "First inversion — lowest note is the 3rd (E G C)", "Second inversion — lowest note is the 5th (G C E)", "Spread voicing — notes across octaves", "Close voicing — notes packed within one octave"] },
      { kind: "callout", tone: "key", text: "In production, chords are often voiced beyond the basic triad. The same C major chord sounds completely different depending on how the notes are arranged (voicing)." }
    ],
    sim: { type: "piano-roll" },
    quiz: [
      { q: "A triad is built from", options: ["Two notes", "Three notes stacked in thirds", "Four notes", "All seven scale notes"], answer: 1, explain: "A triad = root + 3rd + 5th — the foundation of all Western harmony. Source: learningmusic.ableton.com/chords", hint: "Tri = three. Three notes stacked in thirds." },
      { q: "Chord voicing affects", options: ["The key of the chord", "How the notes are arranged — the sound and texture", "The tempo", "The scale"], answer: 1, explain: "Same notes in different arrangements = very different sound. Voicing is one of the most powerful arrangement tools.", hint: "Same notes different arrangement. Completely changes the feel." },
      { q: "A power chord contains", options: ["Root, 3rd and 5th", "Root and 5th only — no 3rd", "Root and 3rd only", "Root and octave only"], answer: 1, explain: "Power chord = root + perfect 5th. No 3rd = no major or minor quality — just raw powerful ambiguity.", hint: "Root + 5th. No 3rd. Ambiguous = powerful." },
      { q: "First inversion of C major (C E G) has __ as the lowest note.", options: ["C", "E", "G", "A"], answer: 1, explain: "First inversion = 3rd on the bottom. For C major the 3rd is E. So first inversion = E G C.", hint: "First inversion = 3rd on the bottom. For C major the 3rd is E." }
    ] },
  { slug: "chord-types", world: "foundations", number: 26, title: "Chord Types", tagline: "Major, minor, diminished, augmented and beyond.", xp: 40,
    explainer: [
      { kind: "lead", text: "Different chord types produce different emotional qualities. Source: learningmusic.ableton.com/chords/chords.html" },
      { kind: "list", items: ["Major triad — bright stable happy. Root + major 3rd + 5th", "Minor triad — dark sad. Root + minor 3rd + 5th", "Diminished — very tense. Root + minor 3rd + diminished 5th", "Augmented — dreamy floating. Root + major 3rd + augmented 5th", "Dominant 7th (V7) — major triad + minor 7th. Bluesy tense wants to resolve.", "Major 7th — rich lush jazz. Major triad + major 7th", "Minor 7th — smooth soulful. Minor triad + minor 7th", "Sus2/Sus4 — open ambiguous modern. 3rd replaced by 2nd or 4th"] },
      { kind: "callout", tone: "tip", text: "Sus chords (Sus2, Sus4) are everywhere in pop and electronic music — they create openness and modernity without the jazz complexity of full 7th chord harmony." }
    ],
    sim: { type: "piano-roll" },
    quiz: [
      { q: "A minor triad differs from major by", options: ["Having an extra note", "Lowering the 5th", "Lowering the 3rd by one semitone", "Raising the root"], answer: 2, explain: "Major 3rd = 4 semitones (bright). Minor 3rd = 3 semitones (dark). One semitone change transforms the emotional quality. Source: learningmusic.ableton.com", hint: "Lower the middle note of a major chord by one semitone = minor." },
      { q: "A dominant 7th chord is used primarily to", options: ["Stay stable", "Create tension that strongly resolves to the next chord", "Add sadness", "Replace the tonic"], answer: 1, explain: "The V7 chord creates intense drive to resolve to the tonic. Its tritone interval creates the tension.", hint: "G7 desperately wants to resolve to C." },
      { q: "What makes a diminished chord tense?", options: ["It has four notes", "It contains a tritone interval", "It uses the major 3rd", "It is played faster"], answer: 1, explain: "Diminished triad = minor 3rd + diminished 5th (tritone). The tritone is the most dissonant interval.", hint: "Tritone = devil interval. Diminished chords are full of them." },
      { q: "Sus chords replace the 3rd with", options: ["The 7th", "The 2nd or 4th degree", "An octave", "Nothing"], answer: 1, explain: "Suspended chords replace the 3rd with the 2nd or 4th. Since the 3rd determines major/minor quality, Sus chords are tonally ambiguous.", hint: "Sus = suspended. The 3rd is suspended." }
    ] },
  { slug: "chord-progressions", world: "foundations", number: 27, title: "Chord Progressions", tagline: "The journey through harmony — how chords move.", xp: 50,
    explainer: [
      { kind: "lead", text: "A chord progression is a sequence of chords creating tension and release. Roman numerals describe progressions universally. Source: learningmusic.ableton.com/chords/chords.html" },
      { kind: "list", items: ["I-V-vi-IV — the most used progression: C G Am F (Let It Be, Africa, etc.)", "I-IV-V-I — 12-bar blues: foundation of rock blues country", "ii-V-I — the jazz cadence (Dm7 G7 Cmaj7): strongest resolution in jazz", "I-vi-IV-V — 50s progression: C Am F G", "vi-IV-I-V — minor first: Am F C G — slightly darker"] },
      { kind: "callout", tone: "key", text: "The emotional power of a progression comes from expectation and resolution. V always wants to go to I. Subvert that (V to vi instead of I) and you create a deceptive cadence." }
    ],
    sim: { type: "piano-roll" },
    quiz: [
      { q: "In C major what chord is the V chord?", options: ["F major", "G major", "A minor", "D minor"], answer: 1, explain: "V chord built on the 5th degree. In C major the 5th is G. G major is the V chord.", hint: "C D E F G. 5th note is G." },
      { q: "The I-V-vi-IV progression is notable because", options: ["It was invented in the 1960s", "It has been used in thousands of hit songs", "It only works in minor keys", "It must be played slowly"], answer: 1, explain: "I-V-vi-IV is the most ubiquitous chord progression in popular music — spans multiple decades and genres. Source: learningmusic.ableton.com", hint: "Google four chord songs." },
      { q: "A deceptive cadence is when V resolves to", options: ["I as expected", "vi instead of I creating surprise", "IV", "The same chord"], answer: 1, explain: "V to vi instead of V to I. The ear expects I but gets vi — emotional ambiguity.", hint: "The ear expects I. It gets vi instead. Deceived." },
      { q: "Roman numerals in chord progressions are useful because", options: ["They look professional", "They describe chord relationships independent of key", "They only apply to classical music", "They describe chord volume"], answer: 1, explain: "Roman numerals describe relationships independently of key. I-IV-V-I in C has the same relationships as in G major.", hint: "Same pattern any key." }
    ] },
  { slug: "keys-tonality", world: "foundations", number: 28, title: "Keys and Tonality", tagline: "Where home is and why it matters.", xp: 40,
    explainer: [
      { kind: "lead", text: "A key establishes a tonal centre — a home base note and chord that everything gravitates toward. Source: learningmusic.ableton.com/notes-and-scales" },
      { kind: "list", items: ["Tonic (I) — home. Most stable chord.", "Dominant (V) — farthest from home. Maximum tension.", "Subdominant (IV) — away but not tense. Reflective.", "Key signature — the sharps or flats defining the 7 notes in the key", "Modulation — deliberately moving from one key to another during a song"] },
      { kind: "callout", tone: "tip", text: "In Ableton Live 12, Scale Awareness highlights only the notes of your chosen scale in the piano roll — making it easier to write melodies and chords that stay in key. Source: Ableton Live 12 manual." }
    ],
    sim: { type: "scale-aware" },
    quiz: [
      { q: "The tonic of a key is", options: ["The highest note in the scale", "The home base chord/note that everything gravitates toward", "The fastest part", "The bass note"], answer: 1, explain: "The tonic is the note and chord that feels like home. Moving away creates tension; returning creates resolution.", hint: "Tonic = home." },
      { q: "The dominant (V) chord creates", options: ["A sense of rest", "Maximum harmonic tension and a strong pull back to tonic", "A neutral feeling", "A minor colour"], answer: 1, explain: "The dominant is the most harmonically tense chord. It contains the leading tone which pulls strongly up to the tonic.", hint: "Dominant to tonic. Pull to release." },
      { q: "When a song modulates it", options: ["Changes tempo", "Changes time signature", "Moves from one key to another during the song", "Adds more instruments"], answer: 2, explain: "Modulation is a deliberate key change mid-song. Classic: up a whole step before the final chorus.", hint: "Whitney Houston raising the key before the final chorus = modulation." },
      { q: "How many keys major and minor are there in total?", options: ["12", "14", "24", "48"], answer: 2, explain: "12 major + 12 minor = 24 keys total.", hint: "12 major + 12 minor = 24." }
    ] },
  { slug: "tension-resolution", world: "foundations", number: 29, title: "Tension and Resolution", tagline: "The push and pull that makes music go somewhere.", xp: 40,
    explainer: [
      { kind: "lead", text: "Music creates emotional engagement through tension and resolution — the same mechanism as storytelling. Source: learningmusic.ableton.com" },
      { kind: "list", items: ["Harmonic tension — dissonant chords resolve to consonant chords", "Melodic tension — the leading tone (7th degree) resolves up to the tonic", "Rhythmic tension — syncopation resolves to the downbeat", "Dynamic tension — quiet builds to loud then resolves", "Textural tension — complexity resolves by stripping back"] },
      { kind: "callout", tone: "key", text: "In electronic music, the build-up (8-16 bars) followed by the drop (sudden resolution) is the most powerful structural device. All tools — filter sweeps risers crashes — exist to maximise this tension-release ratio." }
    ],
    sim: { type: "none" },
    quiz: [
      { q: "In music resolution means", options: ["Increasing volume", "Moving from tension to consonance — arriving at the stable point", "Changing the key", "Ending the song"], answer: 1, explain: "Resolution is movement from tension to stability. V to I is the fundamental example.", hint: "The satisfying arrival. Like a story reaching its conclusion." },
      { q: "In electronic music what is the drop?", options: ["A quiet interlude", "The moment of maximum energy arrival after a build-up", "A tempo change", "The ending"], answer: 1, explain: "The drop is when tension releases as the full beat bass and arrangement returns at maximum energy.", hint: "Build up everything then it DROPS. Maximum release." },
      { q: "The leading tone (7th scale degree) creates tension because", options: ["It is the loudest note", "It is only a semitone below the tonic and wants to resolve upward", "It has a lower frequency", "It is outside the scale"], answer: 1, explain: "The leading tone is only one semitone below the tonic. This proximity creates a magnetic pull to resolve.", hint: "B to C. One semitone up. The ear demands it." },
      { q: "A filter sweep creates tension by", options: ["Adding reverb", "Gradually removing frequencies creating a muffled tunnel effect before the drop", "Changing the key", "Slowing the tempo"], answer: 1, explain: "A closing filter progressively removes high frequencies. When it opens at the drop the energy release is massive.", hint: "Muffled then building then OPEN. Classic pre-drop technique." }
    ] },
  { slug: "harmony-in-production", world: "foundations", number: 30, title: "Harmony in Production", tagline: "How to use chords in your tracks practically.", xp: 40, badge: { slug: "harmony-maker", name: "Harmony Maker" },
    explainer: [
      { kind: "lead", text: "Understanding harmony theoretically is one thing. Applying it in a session is another. Source: learningmusic.ableton.com/chords" },
      { kind: "list", items: ["Chord stabs — short rhythmically punchy chord hits (house disco funk)", "Pad — long sustained chord texture providing harmonic background", "Arpeggio — chord notes played individually in a pattern", "Bassline — root notes of chords with rhythmic elaboration", "Melodic top line — the melody that sits above the harmonic bed"] },
      { kind: "callout", tone: "tip", text: "In Ableton: use the Chord MIDI effect to automatically add intervals to single notes. Play one key and the device adds your chosen intervals — instant chord stabs. Source: Ableton Live manual — MIDI Effects." }
    ],
    sim: { type: "piano-roll" },
    quiz: [
      { q: "A pad in electronic music is", options: ["A drum hit", "A sustained textural chord sound providing harmonic background", "A short chord stab", "A type of compression"], answer: 1, explain: "A pad is a sustained harmonic texture — long notes providing the bed of harmony beneath melody and rhythm.", hint: "Floaty sustained background harmony. Like a pillow for the melody." },
      { q: "An arpeggio plays chord notes", options: ["All at once", "Individually in a repeating pattern", "In reverse always", "Only on the beat"], answer: 1, explain: "An arpeggio plays chord notes one at a time in a pattern. Ableton's Arpeggiator MIDI device does this automatically.", hint: "Notes of the chord one at a time in a pattern. Like a harp." },
      { q: "Why check your mix in mono?", options: ["To hear the stereo image", "To reveal phase cancellation and harmonic clashing between chord voices", "Mono sounds better", "To check reverb"], answer: 1, explain: "Mono summing reveals frequency clashing and phase cancellation hidden by stereo separation.", hint: "Mono collapses stereo revealing frequency clashes." },
      { q: "The Chord MIDI effect in Ableton", options: ["Adds reverb", "Adds intervals above a played note turning single notes into chords", "Random note variations", "Key detection"], answer: 1, explain: "Chord MIDI device adds configurable intervals above each note you play, transforming single notes into chords. Source: Ableton Live manual.", hint: "Play one note hear a chord." }
    ] },
  { slug: "song-structure", world: "foundations", number: 31, title: "Song Structure", tagline: "Verse chorus bridge — the architecture of music.", xp: 40,
    explainer: [
      { kind: "lead", text: "Song structure is the roadmap of a piece of music — how the sections are ordered. Structure creates expectation, delivers payoff, and guides a listener through an emotional arc. Source: learningmusic.ableton.com/song-structure" },
      { kind: "list", items: ["Intro — establishes mood before the main content", "Verse — storytelling section repeated with different lyrics", "Pre-chorus — builds energy into the chorus", "Chorus — highest energy most memorable section repeated multiple times", "Bridge — contrasting section that breaks repetition", "Outro — winds the track down", "Drop — in electronic music the main event — maximum energy section"] }
    ],
    sim: { type: "arrangement" },
    quiz: [
      { q: "The chorus of a song is typically", options: ["The quietest section", "The highest-energy most melodically memorable section repeated several times", "The instrumental section", "The first section"], answer: 1, explain: "The chorus is the emotional and melodic peak — the section listeners most remember and sing along to.", hint: "The part you keep singing after the song ends." },
      { q: "A bridge in song structure provides", options: ["A way into the chorus", "Contrast and a break from repetition usually once later in the song", "The main verse melody", "An instrumental solo only"], answer: 1, explain: "A bridge is a contrasting section breaking the verse-chorus repetition pattern.", hint: "Contrast before the final return." },
      { q: "In electronic music the drop is", options: ["A tempo reduction", "The point of maximum energy arrival after a build-up", "A bass note going down", "The end"], answer: 1, explain: "The drop is the main event — when tension resolves as the full beat bass and arrangement returns.", hint: "BUILD BUILD BUILD then it DROPS." },
      { q: "Why is structure important in electronic music?", options: ["Required by copyright law", "Creates an emotional arc that engages listeners", "Reduces file size", "Makes mixing easier"], answer: 1, explain: "Structure transforms repeated material into a narrative. Even great loops get boring without structure.", hint: "Structure creates the journey." }
    ] },
  { slug: "listening-actively", world: "foundations", number: 32, title: "Listening Actively", tagline: "Hear everything not just the song.", xp: 40, badge: { slug: "active-listener", name: "Active Listener" },
    explainer: [
      { kind: "lead", text: "Passive listening is enjoying music. Active listening is studying it — identifying the individual elements how they interact and what decisions were made. Source: learningmusic.ableton.com" },
      { kind: "list", items: ["Solo each instrument mentally — what is the kick doing? The bass?", "Count bars — where do sections begin?", "Identify the key — major or minor?", "Listen to the mix — where is each instrument in the stereo field?", "Analyse structure — how long is the intro? When does the drop arrive?", "Notice effects — what is on the vocals? On the snare?"] },
      { kind: "callout", tone: "tip", text: "Reference tracks are a professional production technique. Load a commercially released track in your target genre and regularly compare your mix to it. Every professional does this." }
    ],
    sim: { type: "ear-training" },
    quiz: [
      { q: "Active listening means", options: ["Listening with headphones", "Studying music analytically — identifying elements decisions and techniques", "Listening to new genres", "Listening at high volume"], answer: 1, explain: "Active listening is deliberate analytical engagement with music.", hint: "Passive = enjoy. Active = study. What is the kick doing?" },
      { q: "Using a reference track in production means", options: ["Sampling the track directly", "Regularly comparing your mix to a professionally released track to check balance and quality", "Playing the track at a concert", "Using the track as a loop"], answer: 1, explain: "A reference track is your quality benchmark. Load it in your DAW and switch between your mix and it frequently.", hint: "Your mix sounds great — until you put a pro track next to it." },
      { q: "When actively listening why focus on one element at a time?", options: ["It is the only way to hear music properly", "Isolating one element reveals details masked when you listen to everything at once", "It makes the music slower", "It changes the mixing"], answer: 1, explain: "Focusing on one element lets you hear its specific character without the masking effect of everything playing together.", hint: "Cocktail party effect — you cannot hear one conversation with too much background noise." },
      { q: "How does active listening improve music production?", options: ["It directly improves technical skills", "It builds your library of sonic references — expanding your palette of possibilities", "It automatically makes mixes sound better", "It teaches you music theory"], answer: 1, explain: "Active listening builds a rich mental library of sounds structures techniques and references that feeds your production decisions.", hint: "You cannot replicate what you have not heard. More active listening = bigger sonic vocabulary." }
    ] },
];

const techPath: Mission[] = [
  { slug: "daw-explained", world: "foundations", number: 33, title: "The DAW Explained", tagline: "Your entire studio inside a laptop.", xp: 40, badge: { slug: "studio-bootup", name: "Studio Boot-Up" },
    explainer: [
      { kind: "lead", text: "A Digital Audio Workstation (DAW) is software that replaces an entire recording studio. Source: learningmusic.ableton.com" },
      { kind: "list", items: ["Ableton Live — performance-focused, session grid + arrangement, electronic music standard", "FL Studio — pattern-based, hip-hop and electronic", "Logic Pro — Mac only, comprehensive", "Pro Tools — industry standard for professional recording studios", "GarageBand — free on Mac/iOS, beginner-friendly"] },
      { kind: "callout", tone: "tip", text: "The best DAW is the one you know. Pick one, learn it deeply." }
    ],
    sim: { type: "interface-tour" },
    quiz: [
      { q: "What does DAW stand for?", options: ["Digital Audio Workstation", "Drum And Wave machine", "Direct Audio Writer", "Dynamic Arrangement Window"], answer: 0, explain: "Digital Audio Workstation — software that replaces an entire recording studio.", hint: "It is a workstation that works with digital audio." },
      { q: "Which DAW is the professional industry standard for recording studios?", options: ["GarageBand", "FL Studio", "Pro Tools", "Ableton Live"], answer: 2, explain: "Pro Tools by Avid is the industry standard in professional recording studios.", hint: "Walk into any pro recording studio. What is on the screen?" },
      { q: "The best DAW for a beginner is", options: ["Pro Tools", "The most expensive one", "The one you will actually use consistently and learn deeply", "Ableton Live always"], answer: 2, explain: "The best DAW is the one you know well. Consistency and depth of knowledge matter more than the tool.", hint: "Consistency and depth of knowledge matter more than the tool itself." },
      { q: "What can ALL DAWs do?", options: ["Only record audio", "Record audio, host virtual instruments, run effects, arrange and export", "Only create MIDI sequences", "Only mix live performances"], answer: 1, explain: "All DAWs — record audio, host virtual instruments, run effects, arrange, and export a stereo file.", hint: "Record, arrange, mix, export. The universal DAW workflow." }
    ] },
  { slug: "midi-explained", world: "foundations", number: 34, title: "MIDI Explained", tagline: "The language that instruments use to talk to each other.", xp: 40,
    explainer: [
      { kind: "lead", text: "MIDI (Musical Instrument Digital Interface) is a protocol — instructions, not audio: play note C4, velocity 80, for 500ms. Those instructions drive a virtual instrument to make the actual sound. Source: learningmusic.ableton.com" },
      { kind: "list", items: ["Note On/Off — which note to play and when to stop", "Velocity — how hard the note was struck (0-127). Controls loudness and timbre.", "Channel — 1-16. Route different instruments to different channels.", "CC (Control Change) — values for knobs, mod wheel (0-127)", "Pitch Bend — a smooth continuous pitch variation message", "MIDI Clock — tempo synchronisation between devices"] },
      { kind: "callout", tone: "key", text: "Because MIDI is instructions not sound, it is infinitely editable. Wrong note? Change it. Wrong tempo? Resize the region. Wrong instrument? Change the plugin. Source: Ableton Live manual." }
    ],
    sim: { type: "midi-vs-audio" },
    quiz: [
      { q: "MIDI stores", options: ["Actual recorded audio", "Instructions for playing notes — pitch timing velocity duration", "Compressed MP3 data", "Video data"], answer: 1, explain: "MIDI is not audio. It is a set of instructions. An instrument reads these and produces the actual sound.", hint: "MIDI is sheet music. Instructions, not sound." },
      { q: "MIDI velocity controls", options: ["The pitch of the note", "The volume of the channel", "How hard the note was struck — affecting loudness and often timbre", "The duration of the note"], answer: 2, explain: "Velocity (0-127) represents how hard a key was struck. Higher velocity = louder and often brighter.", hint: "Hit a piano key hard vs soft. MIDI captures that difference." },
      { q: "Why is MIDI more flexible than recorded audio?", options: ["It sounds better", "It can be edited note by note — tempo pitch instrument can all change without re-recording", "It uses less disk space always", "It automatically sounds professional"], answer: 1, explain: "Because MIDI is instructions you can change any parameter after recording: fix a wrong note, transpose the key, change the tempo, switch the instrument.", hint: "Change the instrument, the tempo, the key — no re-recording." },
      { q: "CC (Control Change) messages carry", options: ["Note pitches", "Tempo information", "Continuous parameter data like mod wheel, filter cutoff, volume", "Audio data"], answer: 2, explain: "MIDI CC messages carry continuous 0-127 values for parameters like modulation wheel, filter cutoff, volume, pan, and any assignable knob.", hint: "Knob positions, pedal values, mod wheel — all CC messages." }
    ] },
  { slug: "digital-audio", world: "foundations", number: 35, title: "Digital Audio", tagline: "How sound becomes numbers and back again.", xp: 40,
    explainer: [
      { kind: "lead", text: "Digital audio converts continuous sound waves into sequences of numbers. Sample rate = how many times per second the audio is measured. Bit depth = how many values each sample can have. Source: Ableton Live manual." },
      { kind: "list", items: ["Sample rate (kHz) — snapshots per second. 44.1 kHz = 44100 per second.", "Bit depth — 16-bit = 65536 values. 24-bit = 16777216 values.", "16-bit 44.1 kHz — CD quality. Sufficient for release.", "24-bit 48 kHz — standard for modern production. More headroom.", "WAV — uncompressed audio. Full quality. Large file size.", "MP3/AAC — compressed. Smaller files. Some quality loss."] },
      { kind: "callout", tone: "tip", text: "Record and produce at 24-bit for maximum dynamic range and headroom. Export as 16-bit WAV or 320kbps MP3 for distribution." }
    ],
    sim: { type: "buffer-sim" },
    quiz: [
      { q: "What does sample rate mean?", options: ["How many tracks can play simultaneously", "How many times per second the audio is measured and stored", "The tempo of the recording", "The bit depth"], answer: 1, explain: "Sample rate = measurements per second. 44100 Hz means the waveform is sampled 44100 times every second.", hint: "44100 snapshots every second. Each is one sample." },
      { q: "Why is 44.1 kHz sufficient for human hearing?", options: ["Chosen arbitrarily for CDs", "The Nyquist theorem: sample rate must be at least 2x the highest frequency you want to capture", "It reduces file size optimally", "It matches electrical frequency"], answer: 1, explain: "Nyquist theorem: to capture a frequency you need 2x sample rate. Humans hear to ~20 kHz so 40 kHz minimum. 44.1 kHz provides headroom above that.", hint: "Nyquist: 2x the highest frequency. 20 kHz hearing needs 40 kHz sample rate minimum." },
      { q: "24-bit audio is preferred for production over 16-bit because", options: ["It sounds brighter", "It provides more dynamic range and headroom for editing", "It uses less CPU", "Required by streaming platforms"], answer: 1, explain: "24-bit has a much lower noise floor than 16-bit. This extra headroom is crucial when applying multiple effects and making level adjustments.", hint: "More bits = more dynamic range = more headroom." },
      { q: "WAV vs MP3", options: ["WAV is newer", "WAV = uncompressed full quality large file. MP3 = lossy compressed smaller file some quality loss.", "MP3 is better quality always", "They are the same format"], answer: 1, explain: "WAV stores every sample uncompressed — full quality, large files. MP3 uses perceptual coding to achieve smaller files with some quality loss.", hint: "WAV = perfect quality big file. MP3 = smaller file some quality lost." }
    ] },
  { slug: "samples-loops", world: "foundations", number: 36, title: "Samples and Loops", tagline: "Building blocks from recorded audio.", xp: 40,
    explainer: [
      { kind: "lead", text: "A sample is any piece of recorded audio used in a new production. A loop is a sample designed to repeat seamlessly — starts and ends at the exact same point so it cycles without gaps. Source: Ableton Live manual — Working with Samples." },
      { kind: "list", items: ["One-shot — single sound: drum hit, bass pluck, vocal stab", "Loop — seamless repeating audio: drum loop, bass loop, chord loop", "Sample pack — curated collection of related sounds, usually royalty-free", "Royalty-free — cleared for commercial use without per-use payments", "Warp — time-stretching audio in Ableton to match project tempo without pitch change"] },
      { kind: "callout", tone: "warn", text: "Using someone else's released recording without clearance is copyright infringement. Sample packs labelled royalty-free are safe. Recognisable sections of released songs without clearance are not. Source: Ableton — learningmusic.ableton.com" }
    ],
    sim: { type: "warp-lab" },
    quiz: [
      { q: "A one-shot sample is", options: ["A sample that loops", "A single sound that plays once — a drum hit, bass note, etc.", "A sample with one bar of audio", "A short vocal sample"], answer: 1, explain: "A one-shot is a discrete sound event that plays from start to finish without looping.", hint: "One shot = plays once. No loop." },
      { q: "Audio warping in Ableton means", options: ["Reversing the audio", "Time-stretching audio to match the project tempo without changing pitch", "Adding distortion", "Slicing the audio"], answer: 1, explain: "Warping time-stretches audio so it plays at the project BPM without changing pitch. Source: Ableton Live manual — Warping.", hint: "Stretch time keep pitch. Fits the loop to your tempo." },
      { q: "Royalty-free sample packs are", options: ["Always free to download", "Cleared for commercial use without per-use royalty payments", "Samples from before 1923", "Samples that cost royalties to use"], answer: 1, explain: "Royalty-free = cleared for commercial use. You can use the sounds in any production without additional per-use fees.", hint: "Free OF royalties. Use commercially without per-song payments." },
      { q: "Why can using a recognisable section of a released song be problematic?", options: ["It always improves the track", "Copyright infringement — you need clearance from rights holders", "Streaming platforms do not support samples", "Samples sound lower quality"], answer: 1, explain: "Recorded music is protected by copyright. Using without permission is infringement — takedowns and lawsuits.", hint: "Their recording, their rights. Use without permission = copyright infringement." }
    ] },
  { slug: "signal-chain", world: "foundations", number: 37, title: "The Signal Chain", tagline: "How audio flows from source to your ears.", xp: 40,
    explainer: [
      { kind: "lead", text: "A signal chain is the path audio takes from its source through all processing to its destination. Understanding signal flow is fundamental — it determines what order effects should go in and why certain things sound wrong. Source: Ableton Live manual." },
      { kind: "list", items: ["Source — the original sound (voice, instrument, sample)", "Transducer — microphone or pickup converts sound to electrical signal", "Preamp — amplifies the weak signal to usable level", "ADC — audio interface converts analogue to digital for the DAW", "Channel processing — EQ, compression, effects on the individual track", "Bus processing — EQ/compression on grouped tracks", "Master bus — final processing before output (limiting, metering)", "DAC + speakers — converts digital back to analogue, drives speakers"] },
      { kind: "callout", tone: "key", text: "Order matters. Distortion before EQ sounds completely different from EQ before distortion. Always consider the order of your effects chain." }
    ],
    sim: { type: "routing-puzzle" },
    quiz: [
      { q: "Gain staging means", options: ["Adding distortion", "Managing signal levels at each stage to keep the signal clean and avoid clipping", "Setting the master volume", "Automating volume"], answer: 1, explain: "Gain staging = setting appropriate levels at each stage. Strong enough to be clean, not so strong it clips.", hint: "Not too loud (clips), not too quiet (noisy). At each stage." },
      { q: "Why does the order of effects matter?", options: ["It does not — effects can go in any order", "Each effect processes the output of the previous one — order fundamentally changes the result", "It only matters for vintage gear", "It affects sample rate only"], answer: 1, explain: "Each effect receives the output of the previous one. Compressor before EQ vs EQ before compressor = completely different results.", hint: "A-B-C is not the same as C-B-A." },
      { q: "An ADC does", options: ["Amplifies the signal", "Converts analogue electrical signals to digital data a computer can process", "Adds compression", "Controls monitors"], answer: 1, explain: "An ADC (in your audio interface) converts the analogue electrical signal from a microphone or instrument into a digital binary stream.", hint: "Analogue to Digital. What an audio interface input stage does." },
      { q: "The master bus is", options: ["A hardware mixing desk", "The final stereo output path that carries the summed mix to speakers/export", "A MIDI bus", "A type of audio cable"], answer: 1, explain: "The master bus is where all tracks merge into the final stereo signal. Final limiting, metering, and overall shaping happen here.", hint: "All tracks to master bus to speakers/export. The final destination." }
    ] },
  { slug: "effects-overview", world: "foundations", number: 38, title: "Audio Effects Overview", tagline: "EQ, compression, reverb, delay — what they all do.", xp: 40,
    explainer: [
      { kind: "lead", text: "Audio effects change a sound's character, feel, or place in a mix. The four most important: EQ (tonal shaping), compression (dynamic control), reverb (spatial placement), delay (time-based repetition). Source: Ableton Live manual — Audio Effects." },
      { kind: "list", items: ["EQ (Equaliser) — boosts or cuts specific frequency ranges", "Compression — reduces dynamic range. Controls punch and consistency.", "Reverb — simulates acoustic spaces. Places sound in a room or hall.", "Delay — repeats the signal after a set time. Rhythmic or textural.", "Saturation/Distortion — adds harmonic content. Warmth or aggression.", "Chorus/Flanger/Phaser — modulation effects that create thickness and movement.", "Limiter — hard ceiling that prevents the signal exceeding a set level."] },
      { kind: "callout", tone: "key", text: "The most common EQ mistake is too much boosting. Effective EQ is usually about cutting problem frequencies, not adding desired ones. Cut first, boost sparingly." }
    ],
    sim: { type: "device-lab" },
    quiz: [
      { q: "The primary function of a compressor is", options: ["Adding high-frequency air", "Creating spatial depth", "Reducing dynamic range — making loud parts quieter and quiet parts louder", "Removing frequencies"], answer: 2, explain: "Compression reduces dynamic range by attenuating signals above a threshold. This allows a higher average level — louder, punchier, more controlled. Source: Ableton Live manual — Compressor.", hint: "Squeezing the dynamic range." },
      { q: "Insert vs send effects", options: ["Insert effects are louder", "Insert = dedicated to one track. Send = shared — multiple tracks route to one effect.", "Send effects are higher quality", "Insert effects only work on drums"], answer: 1, explain: "Insert sits directly in the track signal chain. Send/return lets multiple tracks share one effect (usually reverb). Saves CPU and creates sonic cohesion.", hint: "Insert = yours alone. Send = shared resource." },
      { q: "Saturation adds to a sound by", options: ["Removing low frequencies", "Generating additional harmonic content — warmth or grit depending on the amount", "Creating spatial depth", "Making the sound quieter"], answer: 1, explain: "Saturation adds even and odd harmonics by pushing the signal slightly beyond linear range. A little = warmth and presence. A lot = aggressive distortion.", hint: "Harmonics added = warmth, presence, character." },
      { q: "Why is EQ cutting often preferred over boosting?", options: ["Cuts use less CPU", "Cutting removes problematic frequencies without adding gain and potential resonance issues", "Boosts change the tempo", "No difference"], answer: 1, explain: "Cutting removes problems cleanly. Boosting can increase gain and sometimes add resonance. Pro approach: cut what is wrong, boost sparingly.", hint: "Subtractive = more natural. Remove the mud." }
    ] },
  { slug: "mixing-basics", world: "foundations", number: 39, title: "Mixing Basics", tagline: "Balancing all the parts into a whole.", xp: 40,
    explainer: [
      { kind: "lead", text: "Mixing is the process of balancing all tracks in a production so they work cohesively. Source: learningmusic.ableton.com and Ableton Live manual — Mixing." },
      { kind: "list", items: ["Gain staging — set appropriate levels before processing (-18 dBFS average per track)", "Frequency balance — each instrument in its natural frequency range without excessive overlap", "Stereo placement — panning to place elements left/right; bass elements centred", "Dynamic consistency — compression to control unruly peaks", "Reverb/delay for depth — wet signals feel behind dry ones"] },
      { kind: "callout", tone: "tip", text: "Mix at moderate volume (~75 dB SPL). Loud monitoring fools your ears about frequency balance. Regular breaks prevent fatigue. Check in mono regularly. Source: Ableton Live manual." }
    ],
    sim: { type: "mixer" },
    quiz: [
      { q: "The goal of mixing is", options: ["Making everything as loud as possible", "Ensuring every important element is clear, audible and in its right place", "Using as many effects as possible", "Matching a reference track"], answer: 1, explain: "Mixing is about clarity and balance — every element clear and sitting appropriately in the frequency and stereo field.", hint: "Clarity, balance, each element in its space." },
      { q: "Why are bass elements kept centred in the stereo field?", options: ["Music theory rule", "Bass frequencies are omnidirectional — our ears cannot locate them and stereo bass creates mono compatibility issues", "It makes them louder", "To save CPU"], answer: 1, explain: "Our ears cannot locate very low frequencies directionally. Panning bass into stereo creates phase issues when summed to mono.", hint: "You cannot hear where bass comes from directionally. Keep it centred." },
      { q: "A track at -18 dBFS average before processing is", options: ["Too quiet", "Correctly gain-staged — leaving headroom for effects and mixing moves", "Already at mix level", "Too loud"], answer: 1, explain: "-18 dBFS average leaves plenty of headroom for effects, compression, and summing without clipping.", hint: "Headroom = space above average level before 0 dBFS ceiling." },
      { q: "Checking your mix in mono reveals", options: ["The stereo width", "Phase cancellation and frequency clashes hidden by stereo separation", "The tempo", "Reverb levels"], answer: 1, explain: "Mono summing reveals frequency clashing and phase cancellation that stereo separation hides. A good mix works in both.", hint: "Mono reveals problems stereo hides." }
    ] },
  { slug: "music-tech-integration", world: "foundations", number: 40, title: "Putting It All Together", tagline: "Sound, Rhythm, Melody, Harmony, Production = Music.", xp: 50, badge: { slug: "foundations-complete", name: "Foundations Complete" },
    explainer: [
      { kind: "lead", text: "You now have the vocabulary of music. Sound, rhythm, melody, harmony, and production technology. These are not separate subjects — they are one integrated system. Source: learningmusic.ableton.com" },
      { kind: "list", items: ["Sound knowledge — helps you make sounds and hear what is wrong", "Rhythm knowledge — helps you programme beats and understand groove", "Melody knowledge — helps you write hooks and understand what makes them stick", "Harmony knowledge — helps you write chord progressions and understand emotional colour", "Tech knowledge — helps you translate musical ideas into a finished production"] },
      { kind: "callout", tone: "key", text: "You do not need to master all of this before making music. Start now. Come back to these concepts when you encounter the problem they solve." }
    ],
    sim: { type: "none" },
    quiz: [
      { q: "How does music theory relate to production?", options: ["Theory must be mastered before producing", "Theory and production skill develop together — theory gives vocabulary production gives application", "Theory is only for classical musicians", "Theory is unnecessary with good ears"], answer: 1, explain: "Music theory and production practice reinforce each other. Theory gives vocabulary. Production experience shows which concepts are immediately useful.", hint: "Theory + practice together, not theory first then practice." },
      { q: "The DJ World path primarily develops", options: ["Sound synthesis skills", "How to select mix and play music for people — energy management and transition skills", "Advanced composition", "Music notation reading"], answer: 1, explain: "DJ World covers: selecting tracks, beatmatching and mixing, reading the crowd, managing energy over a set.", hint: "DJing = playing music for people. Selection mixing energy timing." },
      { q: "The best time to start making music is", options: ["After finishing all theory", "After buying professional equipment", "Now — make music while learning theory", "After 2 years of instrument lessons"], answer: 2, explain: "Start making music immediately and let practical problems drive your theory learning. Context makes theory stick.", hint: "Start now. Theory makes more sense when you have real problems to solve." },
      { q: "Foundations knowledge of timbre frequency and harmonics is directly useful for", options: ["Reading music faster", "EQ decisions — knowing which frequency range each instrument lives in and why sounds clash", "Typing faster in a DAW", "Reading music contracts"], answer: 1, explain: "Knowing the kick drum fundamental is 60-80 Hz and the bass guitar overlaps there explains why they clash. EQ is applied acoustics.", hint: "Sound physics leads directly to EQ decisions." }
    ] },
];

export const FOUNDATIONS_MISSIONS: Mission[] = [
  ...soundPath,
  ...rhythmPath,
  ...melodyPath,
  ...harmonyPath,
  ...techPath,
];
