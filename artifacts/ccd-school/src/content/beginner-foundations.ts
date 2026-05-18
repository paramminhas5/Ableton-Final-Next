// ─── BEGINNER FOUNDATIONS ────────────────────────────────────────────────────
// Music concepts explained like you're 5. These are rooted in real sources
// and gate entry to Intermediate mode. Complete all 10 to unlock paths.
//
// Sources cited throughout:
//   [Wikipedia] wikipedia.org
//   [Britannica] britannica.com
//   [Ableton Learning Music] learningmusic.ableton.com
//   [SoundOnSound] soundonsound.com
//   [MusicTheory.net] musictheory.net
// ─────────────────────────────────────────────────────────────────────────────

export type BeginnerMission = {
  slug: string;
  number: number;
  title: string;
  emoji: string;
  tagline: string;
  xp: number;
  badge?: { slug: string; name: string };
  // The "like you're 5" explanation — plain paragraphs
  simple: string[];
  // A relatable analogy
  analogy: string;
  // Slightly deeper — but still accessible — for curious learners
  deeper: string[];
  // Sources that back this up
  sources: { label: string; url: string; section?: string }[];
  quiz: {
    q: string;
    options: string[];
    answer: number;
    explain: string;
    hint: string;
  }[];
};

export const BEGINNER_MISSIONS: BeginnerMission[] = [
  {
    slug: "what-is-sound",
    number: 1,
    title: "What Is Sound?",
    emoji: "🔊",
    tagline: "Invisible waves that shake your ears.",
    xp: 30,
    badge: { slug: "first-wave", name: "First Wave" },
    simple: [
      "Sound is invisible. You can't see it, but you can feel it. When something moves back and forth very fast — like a guitar string or a speaker — it pushes the air around it. Those little pushes travel through the air like ripples in a pond.",
      "When those ripples reach your ear, your eardrum jiggles too, and your brain says: 'Hey, I hear something!' That's literally all sound is — air moving in a pattern.",
      "If the air moves fast and lots of times per second, you hear a high sound — like a bird. If it moves slower, you hear a low sound — like a big drum. Scientists call how many times per second a sound vibrates its frequency.",
    ],
    analogy:
      "Imagine dropping a pebble into still water. You see rings spreading out from the centre. Sound is the same — but instead of water rings, it's invisible air rings. Your ear is waiting at the edge of the pond.",
    deeper: [
      "Frequency is measured in Hertz (Hz). A human can hear roughly 20 Hz (very low bass rumble) to 20,000 Hz (super-high squeak). Most music lives between 80 Hz and 10,000 Hz.",
      "The loudness of a sound is called its amplitude. Louder sounds have bigger waves. In audio production, amplitude is measured in decibels (dB). 0 dB is roughly the quietest sound a human can hear; a rock concert is around 110 dB.",
      "Digital audio captures these waves as numbers, thousands of times per second. The industry standard is 44,100 measurements per second (44.1 kHz) — that's how a CD stores sound.",
    ],
    sources: [
      { label: "Wikipedia — Sound", url: "https://en.wikipedia.org/wiki/Sound" },
      {
        label: "Britannica — Sound Wave",
        url: "https://www.britannica.com/science/sound-physics",
      },
      {
        label: "Ableton Learning Music — Frequencies",
        url: "https://learningmusic.ableton.com",
      },
    ],
    quiz: [
      {
        q: "Sound travels as…",
        options: ["Light beams", "Vibrations through air", "Electrical signals", "Magnetic fields"],
        answer: 1,
        explain:
          "Sound is vibrating air. When something shakes, it pushes air molecules, which push the next ones, forming a wave that reaches your ear.",
        hint: "Think of dropping a pebble in a pond — what spreads out?",
      },
      {
        q: "A high-pitched sound has a…",
        options: [
          "Low frequency",
          "High frequency",
          "High amplitude",
          "Low amplitude",
        ],
        answer: 1,
        explain:
          "Frequency = how fast the air vibrates. Fast vibrations = high pitch (bird). Slow vibrations = low pitch (bass drum).",
        hint: "Think: a bird tweet vs a big drum. Which one shakes faster?",
      },
      {
        q: "What does 'amplitude' mean for sound?",
        options: ["How fast it travels", "How high the pitch is", "How loud it is", "How long it lasts"],
        answer: 2,
        explain:
          "Amplitude is the size of the sound wave — bigger wave, louder sound. Decibels (dB) measure amplitude.",
        hint: "Bigger ripples in the pond = stronger sound.",
      },
    ],
  },

  {
    slug: "what-is-rhythm",
    number: 2,
    title: "Rhythm, Beat & Tempo",
    emoji: "🥁",
    tagline: "The heartbeat of every song.",
    xp: 30,
    badge: { slug: "keeper-of-time", name: "Keeper of Time" },
    simple: [
      "Rhythm is when sounds happen at regular times — like clapping along to a song. The beat is the steady pulse underneath all music, like a clock going tick-tick-tick-tick.",
      "Tempo is just how fast or slow that heartbeat goes. A lullaby has a slow tempo. A dance track has a fast tempo.",
      "Producers and DJs measure tempo in BPM — Beats Per Minute. 60 BPM means exactly one beat every second. 120 BPM (the most common dance music speed) means two beats every second.",
    ],
    analogy:
      "Tempo is like your walking speed. A slow stroll is 60–80 BPM. A brisk walk is 100–110 BPM. Running is 140+ BPM. Most hip-hop walks (80–100 BPM). Most house music runs (120–130 BPM).",
    deeper: [
      "Music is organised into bars (also called measures). In standard 4/4 time, there are 4 beats per bar. Most pop and electronic music uses 4/4. A bar marker in your DAW shows you exactly where you are in the song.",
      "The downbeat (beat 1) feels strong and grounded. The backbeat (beats 2 and 4) is where you typically clap along to pop and rock. Knowing where beat 1 is helps you line up samples, loops and transitions perfectly.",
      "DJs match the BPMs of two tracks before mixing them together — otherwise the rhythms clash and it sounds chaotic. This process is called beatmatching, and it's the foundation of DJing.",
    ],
    sources: [
      {
        label: "Wikipedia — Tempo",
        url: "https://en.wikipedia.org/wiki/Tempo",
      },
      {
        label: "Ableton Learning Music — Rhythm",
        url: "https://learningmusic.ableton.com/make-beats/make-beats.html",
      },
      {
        label: "MusicTheory.net — Rhythm",
        url: "https://www.musictheory.net/lessons/13",
      },
    ],
    quiz: [
      {
        q: "What does BPM stand for?",
        options: ["Bass Per Measure", "Beats Per Minute", "Bar Pulse Marker", "Beat Phase Mode"],
        answer: 1,
        explain: "BPM = Beats Per Minute. It's the universal speed unit in music production and DJing.",
        hint: "Think of a heart monitor — how many heartbeats per minute?",
      },
      {
        q: "How many beats are in a standard 4/4 bar?",
        options: ["2", "3", "4", "8"],
        answer: 2,
        explain:
          "4/4 time means 4 beats per bar. It's by far the most common time signature in pop, electronic, hip-hop and DJ music.",
        hint: "4/4 means the top number is 4.",
      },
      {
        q: "A track at 128 BPM is…",
        options: ["Very slow", "Typical lullaby speed", "Typical house music speed", "Extremely fast"],
        answer: 2,
        explain:
          "House, techno and dance music typically sits between 120–135 BPM. 128 is the sweet spot for most club music.",
        hint: "Think dance floor, not bedtime.",
      },
    ],
  },

  {
    slug: "what-is-melody",
    number: 3,
    title: "What Is Melody?",
    emoji: "🎵",
    tagline: "The tune you hum in the shower.",
    xp: 30,
    simple: [
      "A melody is a sequence of single musical notes played one after the other that forms a recognisable tune. It's what you hum, whistle or sing along to. If you're humming a song right now, that's the melody.",
      "Notes go up and down in pitch. High notes feel bright and exciting. Low notes feel deep and calm. The way notes go up, down, hold, or jump is what gives a melody its character.",
      "Almost every song has one — the main vocal line, a piano riff, a synth lead. Even a simple three-note hook is a melody.",
    ],
    analogy:
      "A melody is like a conversation. Each note is a word, and together they tell a little story. Some melodies are questions that feel unfinished; some are answers that feel resolved.",
    deeper: [
      "Notes are named using letters: A B C D E F G (and then it repeats). On a piano keyboard, C is the white key just to the left of a group of two black keys. Middle C (C4) is roughly the centre of a standard keyboard.",
      "The distance between two notes is called an interval. Small jumps (like C to D) sound smooth and stepwise. Big jumps (like C to G) sound dramatic. Great melodies often mix small steps with the occasional leap.",
      "When you record a melody into a DAW, you typically use MIDI — which stores which note, when it starts, how long it lasts, and how hard it was played. This lets you edit every note without re-recording.",
    ],
    sources: [
      { label: "Wikipedia — Melody", url: "https://en.wikipedia.org/wiki/Melody" },
      { label: "MusicTheory.net — Notes", url: "https://www.musictheory.net/lessons/10" },
      {
        label: "Ableton Learning Music — Notes & Scales",
        url: "https://learningmusic.ableton.com/notes-and-scales/notes-and-scales.html",
      },
    ],
    quiz: [
      {
        q: "A melody is…",
        options: [
          "All the instruments playing at once",
          "A sequence of single notes forming a tune",
          "The steady beat underneath a song",
          "The loudness of a track",
        ],
        answer: 1,
        explain: "Melody = single notes in sequence that form a recognisable tune — the part you hum.",
        hint: "What do you whistle when you think of your favourite song?",
      },
      {
        q: "Musical note names in English go…",
        options: ["1-2-3-4-5-6-7", "A-B-C-D-E-F-G", "Do-Re-Mi only", "High-Low-Mid"],
        answer: 1,
        explain: "Western music uses 7 letter names: A B C D E F G, then they repeat an octave higher.",
        hint: "A for Apple, B for…",
      },
      {
        q: "In a DAW, melodies are usually recorded as…",
        options: ["Audio recordings", "MIDI data", "Video clips", "Text files"],
        answer: 1,
        explain:
          "MIDI stores note information (pitch, timing, length, velocity) — not sound itself. This means you can edit, transpose or change instrument at any time.",
        hint: "MIDI is like sheet music that the computer can read.",
      },
    ],
  },

  {
    slug: "what-is-harmony",
    number: 4,
    title: "Chords & Harmony",
    emoji: "🎹",
    tagline: "Notes that sound beautiful together.",
    xp: 30,
    simple: [
      "When you play two or more notes at the same time and they sound good together, that's harmony. The most common way to make harmony is with a chord — three or more notes played simultaneously.",
      "Chords give songs their mood. A major chord (like C major) sounds happy and bright. A minor chord (like A minor) sounds sad or mysterious. Most pop songs switch between a small number of chords.",
      "The chord progression is the order those chords go in. Lots of famous songs use the same four chords — you can write thousands of songs with just C, G, Am, F.",
    ],
    analogy:
      "Melody is like one person talking. Harmony is like a choir — many voices working together to create something richer than any single voice alone.",
    deeper: [
      "A major triad is built by stacking a root note, then skipping two white keys, then skipping two more: C-E-G. A minor triad uses a slightly different spacing: A-C-E. That one-key difference changes the entire emotional feel.",
      "Keys give songs a home base. A song 'in C major' tends to use the 7 notes of the C major scale (all the white keys on a piano) and feels like it belongs on C. When a song 'changes key' it's called modulation.",
      "In electronic music, chords are often played by synth pads or sampled instruments. You don't need to know music theory to make chords — your DAW's piano roll lets you click and drag notes into place.",
    ],
    sources: [
      { label: "Wikipedia — Chord (music)", url: "https://en.wikipedia.org/wiki/Chord_(music)" },
      {
        label: "Ableton Learning Music — Chords",
        url: "https://learningmusic.ableton.com/chords/chords.html",
      },
      {
        label: "MusicTheory.net — Triads",
        url: "https://www.musictheory.net/lessons/40",
      },
    ],
    quiz: [
      {
        q: "A chord is…",
        options: [
          "A single note played loudly",
          "Two or more notes played together",
          "The tempo of a song",
          "A type of drum pattern",
        ],
        answer: 1,
        explain: "A chord is two or more notes sounding simultaneously. Three notes = a triad.",
        hint: "If you press one piano key it's a note. Press three at once…",
      },
      {
        q: "Major chords tend to sound…",
        options: ["Sad and dark", "Happy and bright", "Scary", "Silent"],
        answer: 1,
        explain:
          "Major = bright, happy, uplifting. Minor = dark, sad, mysterious. This is one of the most powerful tools in music.",
        hint: "Think of 'Happy Birthday' — is it major or minor?",
      },
      {
        q: "A chord progression is…",
        options: [
          "A sequence of chords that repeat",
          "The speed of a song",
          "A type of drum machine",
          "The pitch of a vocal",
        ],
        answer: 0,
        explain:
          "A chord progression is a series of chords played in order, usually repeating. The I-V-vi-IV progression is used in thousands of hit songs.",
        hint: "It's the 'journey' a song takes through different chords.",
      },
    ],
  },

  {
    slug: "what-is-a-daw",
    number: 5,
    title: "What Is a DAW?",
    emoji: "💻",
    tagline: "Your recording studio inside a laptop.",
    xp: 40,
    badge: { slug: "studio-unlocked", name: "Studio Unlocked" },
    simple: [
      "A DAW stands for Digital Audio Workstation. It's software on your computer that lets you record, arrange, edit and mix music. Think of it as an entire recording studio — microphones, mixing desk, instruments, effects — all squeezed into your laptop.",
      "Before DAWs existed, musicians had to book expensive studios with enormous rooms full of physical equipment. Now you can make a professional-sounding track in your bedroom for free (or almost free).",
      "Popular DAWs include Ableton Live (great for electronic music and performance), FL Studio (popular with hip-hop and trap producers), GarageBand (free on Mac, perfect for beginners), and Logic Pro (professional, Mac-only).",
    ],
    analogy:
      "Imagine a LEGO set for music. A DAW gives you all the pieces — drums, synths, recording tools, effects — and you snap them together however you want. No glue, no mess, and you can always undo.",
    deeper: [
      "Inside a DAW, you work on a Project file that saves everything: every track, every note, every effect setting. Projects are stored on your computer's hard drive — not the audio files themselves, but references to them.",
      "Most DAWs have two main views: a timeline (for arranging a song start-to-finish) and some kind of clip or loop launcher (for jamming with loops live). Ableton Live uniquely excels at both.",
      "DAWs process audio using your computer's CPU (processor) and RAM (memory). More tracks and effects require more processing power. Audio interfaces connect real instruments and microphones to your DAW, converting electrical signals to digital data.",
    ],
    sources: [
      {
        label: "Wikipedia — Digital Audio Workstation",
        url: "https://en.wikipedia.org/wiki/Digital_audio_workstation",
      },
      {
        label: "SoundOnSound — What is a DAW?",
        url: "https://www.soundonsound.com/techniques/introduction-daws",
      },
    ],
    quiz: [
      {
        q: "DAW stands for…",
        options: [
          "Digital Audio Workstation",
          "Dynamic Audio Wave",
          "Direct Audio Writer",
          "Digital Arrangement Window",
        ],
        answer: 0,
        explain:
          "Digital Audio Workstation — software that records, edits, arranges and mixes music all in one place.",
        hint: "Think: it's a workstation (like a studio desk) that works with digital audio.",
      },
      {
        q: "Which of these is NOT a DAW?",
        options: ["Ableton Live", "FL Studio", "GarageBand", "Spotify"],
        answer: 3,
        explain:
          "Spotify is a music streaming platform — you listen to finished music on it. DAWs are for creating and producing music.",
        hint: "Which one do you use to listen to music, not make it?",
      },
      {
        q: "Before DAWs, where did musicians record?",
        options: [
          "On their phones",
          "Expensive physical recording studios",
          "In video games",
          "At the cinema",
        ],
        answer: 1,
        explain:
          "Professional recording required expensive studio space with physical equipment. DAWs democratised music production — now anyone with a laptop can produce.",
        hint: "Think big rooms, expensive mixing desks, lots of gear.",
      },
    ],
  },

  {
    slug: "what-is-a-track",
    number: 6,
    title: "Tracks & Channels",
    emoji: "🎚️",
    tagline: "Every instrument gets its own lane.",
    xp: 30,
    simple: [
      "In a DAW, a track is one lane in your song. Imagine you're making a painting with lots of layers of paint — each layer is a track. One track for the drums. One for the bass. One for the main melody. One for the vocals.",
      "Because each instrument lives on its own track, you can control them separately. Turn up the drums. Turn down the bass. Mute the vocals. Change the order. Move them around. It's completely flexible.",
      "When all the tracks play together, you hear the complete song. When you mix a song, you balance those tracks so everything sounds good together — not too loud, not too quiet.",
    ],
    analogy:
      "A track is like one musician in a band. The final mix is what you hear when the whole band plays together. Separate musicians = separate tracks; everyone together = the mix.",
    deeper: [
      "Audio tracks hold recorded sound (a guitar recording, a drum sample). MIDI tracks hold note data that gets sent to an instrument plugin (a virtual piano, a synth). Some DAWs use dedicated 'Instrument tracks' that bundle both together.",
      "Each track has a volume fader, a pan knob (left/right in the stereo field), a mute button and a solo button. These are the basic controls you'll use on every mix.",
      "In Ableton Live, there are three track types: Audio (for recorded sound), MIDI (for note data to instruments) and Return (for shared effects like reverb that multiple tracks can send to).",
    ],
    sources: [
      {
        label: "Wikipedia — Multitrack Recording",
        url: "https://en.wikipedia.org/wiki/Multitrack_recording",
      },
      {
        label: "Ableton Live Manual — Tracks",
        url: "https://www.ableton.com/en/manual/live-concepts/#tracks",
      },
    ],
    quiz: [
      {
        q: "In a DAW, a track is…",
        options: [
          "A finished song",
          "One lane for one instrument or sound",
          "The tempo control",
          "A type of effect",
        ],
        answer: 1,
        explain:
          "Each track holds one 'part' — drums, bass, melody, vocals. Multiple tracks layer together to make the full song.",
        hint: "Think of a band: each musician needs their own 'space' to be heard.",
      },
      {
        q: "What does the Mute button do on a track?",
        options: ["Makes it louder", "Silences that track temporarily", "Deletes the track", "Changes the pitch"],
        answer: 1,
        explain:
          "Mute silences the track without deleting it. Great for A/B comparing a mix or temporarily removing an element.",
        hint: "Mute = quiet, not gone.",
      },
      {
        q: "Which track type holds musical note data (not actual sound)?",
        options: ["Audio track", "MIDI track", "Return track", "Group track"],
        answer: 1,
        explain:
          "MIDI tracks store note information — which note, when, how hard. An instrument plugin converts that data into sound.",
        hint: "MIDI is like digital sheet music. It's instructions, not sound itself.",
      },
    ],
  },

  {
    slug: "midi-vs-audio",
    number: 7,
    title: "MIDI vs Audio",
    emoji: "🎛️",
    tagline: "Instructions vs recordings.",
    xp: 40,
    badge: { slug: "signal-decoded", name: "Signal Decoded" },
    simple: [
      "Audio is a recording of actual sound — like a voice memo, an MP3, or a sample. When you listen to audio, you're hearing the actual sound waves that were captured.",
      "MIDI is not sound. MIDI is instructions — like a player piano roll. It says 'play note C4 at time 0, hold it for 1 second, with 80% force.' Your software instrument reads those instructions and plays the sound.",
      "MIDI is incredibly flexible. You can change the instrument, change the key, fix wrong notes, change the speed — all without re-recording anything. Audio is harder to edit but captures real performance nuance.",
    ],
    analogy:
      "Audio is like a photograph of a concert — it captures exactly what happened. MIDI is like sheet music — it tells a musician (your computer's instrument) what to play, and you can give the same sheet music to any musician (instrument) for a different sound.",
    deeper: [
      "MIDI stands for Musical Instrument Digital Interface. It was invented in 1983 so different electronic instruments could talk to each other. A MIDI message includes: note number (0–127), velocity (how hard, 0–127), channel (1–16), and timing.",
      "MIDI velocity maps to loudness. Velocity 127 = maximum force (fortissimo). Velocity 1 = barely touched (pianissimo). This makes MIDI performances sound human — real musicians don't hit every note with the same force.",
      "When you export a finished track from a DAW, you're exporting audio (usually WAV or MP3). MIDI by itself is unplayable on most devices — it needs an instrument to interpret it.",
    ],
    sources: [
      {
        label: "Wikipedia — MIDI",
        url: "https://en.wikipedia.org/wiki/MIDI",
      },
      {
        label: "SoundOnSound — MIDI Explained",
        url: "https://www.soundonsound.com/techniques/synths-for-beginners-part-9",
      },
    ],
    quiz: [
      {
        q: "Audio files contain…",
        options: ["Note instructions", "Actual recorded sound", "Chord progressions", "Tempo data"],
        answer: 1,
        explain:
          "Audio = actual captured sound waves. MP3, WAV, AIFF are all audio formats containing recorded audio.",
        hint: "Play an MP3 — you hear real sound, not instructions.",
      },
      {
        q: "MIDI velocity controls…",
        options: ["Pitch", "How loud/hard the note sounds", "The tempo", "The key"],
        answer: 1,
        explain:
          "Velocity is the 'force' of a MIDI note. Higher velocity = louder/harder. Lower = softer. It simulates how hard a musician hits a key or drum.",
        hint: "Hit a piano key softly vs hard — MIDI captures that difference.",
      },
      {
        q: "Why is MIDI more flexible than audio?",
        options: [
          "It sounds better",
          "You can edit notes, change instruments, and transpose without re-recording",
          "It uses less storage",
          "It plays back faster",
        ],
        answer: 1,
        explain:
          "MIDI is just data. Change the instrument plugin and the same MIDI plays on a totally different sound. Edit wrong notes, transpose the key — no re-recording needed.",
        hint: "If you change the instrument, the 'sheet music' stays the same but the sound changes.",
      },
    ],
  },

  {
    slug: "what-are-samples",
    number: 8,
    title: "Samples & Loops",
    emoji: "🎧",
    tagline: "Borrowing sounds to make new ones.",
    xp: 30,
    simple: [
      "A sample is a short piece of recorded audio — a drum hit, a piano chord, a clap, a vocal phrase. Producers collect thousands of samples and use them as building blocks for new music.",
      "A loop is a sample that's designed to repeat perfectly — like a 4-bar drum beat that keeps cycling. When a loop is perfectly synced to your tempo, you can layer dozens of loops together and they'll all lock in rhythmically.",
      "Sampling has been central to hip-hop since the 1970s, and to electronic dance music since the 1980s. Many iconic tracks are built entirely from samples of older recordings.",
    ],
    analogy:
      "Think of samples like LEGO bricks. Someone already made the individual bricks (drum hits, bass lines, chord stabs). You collect them and build something new — your own creation, made from pieces others created.",
    deeper: [
      "One-shot samples are single sounds that play once: a snare hit, a hi-hat, a bass pluck. Looping samples are longer audio clips designed to loop seamlessly. Audio warp algorithms let DAWs stretch or compress loops to match your project tempo without changing pitch.",
      "Sample packs are collections of related sounds sold or given away by producers. They often contain drums, bass loops, melodic loops, FX, and one-shots — all in a consistent key and BPM so they work together.",
      "Copyright and sampling: using another artist's recorded music without permission can be a legal issue. Sample packs marked 'royalty-free' are cleared for commercial use. Original recordings from albums may require clearance from rights holders.",
    ],
    sources: [
      {
        label: "Wikipedia — Sampling (music)",
        url: "https://en.wikipedia.org/wiki/Sampling_(music)",
      },
      {
        label: "Ableton Live Manual — Working with Samples",
        url: "https://www.ableton.com/en/manual/working-with-samples/",
      },
    ],
    quiz: [
      {
        q: "A sample in music production is…",
        options: [
          "A short piece of recorded audio used in a new track",
          "A type of synthesiser",
          "The tempo of a song",
          "A MIDI file",
        ],
        answer: 0,
        explain:
          "A sample is any piece of recorded audio — a drum hit, a vocal phrase, a guitar riff — used as a building block in a new production.",
        hint: "Think: a 'sample' of chocolate — a small piece you take from something.",
      },
      {
        q: "A loop is designed to…",
        options: [
          "Play once and stop",
          "Repeat seamlessly",
          "Change key automatically",
          "Record your voice",
        ],
        answer: 1,
        explain:
          "A loop starts and ends at exactly the right point so it can repeat endlessly without clicking or glitching — forming a seamless rhythm or musical phrase.",
        hint: "Loops keep going and going and going…",
      },
      {
        q: "Warp algorithms in DAWs let you…",
        options: [
          "Delete samples",
          "Stretch audio to match tempo without changing pitch",
          "Convert audio to MIDI",
          "Record vocals",
        ],
        answer: 1,
        explain:
          "Warping time-stretches audio so a 120 BPM drum loop can play at your project's 95 BPM — same pitch, different speed. This is fundamental to modern production.",
        hint: "Warp = bend time. The pitch stays the same but the speed changes.",
      },
    ],
  },

  {
    slug: "what-is-mixing",
    number: 9,
    title: "What Is Mixing?",
    emoji: "🎚️",
    tagline: "Balancing everything so it all fits.",
    xp: 30,
    simple: [
      "Mixing is adjusting all the tracks in a song so they sound good together. Imagine everyone in a band is playing at the same time — if the drummer is too loud, you can't hear the singer. The mixer's job is to balance everyone.",
      "The main tools are volume (how loud each track is), panning (whether it sounds like it's coming from the left or right), EQ (cutting or boosting certain frequencies) and effects like reverb (which makes sounds feel like they're in a big room).",
      "A good mix sounds balanced — every instrument can be heard clearly, the vocals sit on top, and the whole thing feels cohesive. A bad mix sounds muddy, harsh, or like everything is fighting for space.",
    ],
    analogy:
      "Mixing is like being a director for a school play. The stars (vocals, main melody) need to be heard clearly at the front. The supporting cast (rhythm, pads) sit behind them. The set (effects, atmosphere) fills the background.",
    deeper: [
      "EQ (equaliser) is one of the most powerful mixing tools. It lets you boost or cut specific frequency ranges. Cut the low rumble from vocals. Boost the mid-range presence of a guitar. Roll off the high frequencies on a dark pad.",
      "Compression reduces the dynamic range of a sound — making loud parts quieter and quiet parts louder. A well-compressed drum kit sits tight and punchy in the mix; over-compressed audio sounds lifeless and flat.",
      "Mastering is the final step after mixing — preparing the finished stereo mix for distribution. A mastering engineer makes the track sound great on all speakers (earbuds, car stereos, club systems) and matches its loudness to commercial standards.",
    ],
    sources: [
      {
        label: "Wikipedia — Audio Mixing",
        url: "https://en.wikipedia.org/wiki/Audio_mixing",
      },
      {
        label: "SoundOnSound — Mixing Essentials",
        url: "https://www.soundonsound.com/techniques/mixing-essentials",
      },
    ],
    quiz: [
      {
        q: "The main goal of mixing is…",
        options: [
          "Making one track louder",
          "Balancing all tracks so they sound good together",
          "Recording new instruments",
          "Changing the tempo",
        ],
        answer: 1,
        explain:
          "Mixing balances volume, frequencies (EQ), spatial position (pan) and effects across all tracks so the whole song sounds cohesive and clear.",
        hint: "Think: every instrument needs to fit in the same room without crowding each other.",
      },
      {
        q: "Panning controls…",
        options: [
          "Volume",
          "Pitch",
          "Left/right position in the stereo field",
          "Speed of the song",
        ],
        answer: 2,
        explain:
          "Pan moves a sound left or right. Centred = mono (heard equally both sides). Hard left = only in left speaker. This creates width in a mix.",
        hint: "A pan moves a camera sideways. In audio, it moves sound left or right.",
      },
      {
        q: "Compression in mixing…",
        options: [
          "Makes a file smaller",
          "Reduces dynamic range so loud and quiet parts are closer together",
          "Adds reverb",
          "Changes the key",
        ],
        answer: 1,
        explain:
          "An audio compressor reduces the difference between the loudest and quietest parts, creating a tighter, more controlled sound.",
        hint: "It 'squeezes' the dynamic range — not the file size.",
      },
    ],
  },

  {
    slug: "what-is-a-genre",
    number: 10,
    title: "Music Genres & Styles",
    emoji: "🎶",
    tagline: "The map of the musical world.",
    xp: 30,
    badge: { slug: "world-mapped", name: "World Mapped" },
    simple: [
      "A genre is a style of music with recognisable characteristics — tempo, instruments, energy, mood. Genre is a shortcut that helps listeners find music they like and helps producers know what conventions to follow (or break).",
      "Electronic dance music (EDM) is a huge family of genres — house, techno, drum & bass, dubstep, ambient, and hundreds of subgenres. Hip-hop, pop, jazz, classical, rock — all different genres, all with different rules and histories.",
      "As a producer or DJ, knowing your genres means knowing what BPM to produce at, what sounds are typical, what the audience expects — and where you can surprise them.",
    ],
    analogy:
      "Genres are like cuisines. 'Italian food' tells you a lot immediately — pasta, olive oil, garlic. 'House music' tells you just as much — 4/4 kick, soulful vocals, 125 BPM. You know roughly what you're getting before the first bite (or bar).",
    deeper: [
      "Key genre BPMs: Hip-hop 70–100 BPM · House 120–130 BPM · Techno 130–145 BPM · Drum & Bass 160–180 BPM · Ambient 60–90 BPM · Pop 100–130 BPM · Trap 130–170 BPM (but uses half-time, so it feels slower).",
      "Subgenres often emerged when producers pushed the sonic or structural limits of a genre. Deep house slowed down and deepened classic house. Minimal techno stripped techno down to almost nothing. Understanding the lineage helps you make informed creative choices.",
      "You don't have to stay in one genre. Many of the most exciting modern tracks blend elements from multiple genres — a trap hi-hat pattern over a house chord progression at 140 BPM. Genre is a tool, not a cage.",
    ],
    sources: [
      {
        label: "Wikipedia — Electronic Dance Music",
        url: "https://en.wikipedia.org/wiki/Electronic_dance_music",
      },
      {
        label: "Wikipedia — Music Genre",
        url: "https://en.wikipedia.org/wiki/Music_genre",
      },
    ],
    quiz: [
      {
        q: "What is a music genre?",
        options: [
          "A brand of headphones",
          "A style of music with recognisable characteristics",
          "The pitch of a vocal",
          "A type of mixing desk",
        ],
        answer: 1,
        explain:
          "Genre = a category of music sharing common characteristics: tempo, instruments, energy, history. House, techno, hip-hop, pop are all genres.",
        hint: "Think: what makes 'Italian food' recognisable vs 'Japanese food'?",
      },
      {
        q: "House music typically sits at…",
        options: ["60–80 BPM", "90–110 BPM", "120–130 BPM", "160–180 BPM"],
        answer: 2,
        explain:
          "House music — from Chicago, 1980s — typically runs 120–130 BPM, built around a four-on-the-floor kick drum pattern.",
        hint: "House is a dance floor genre — what tempo makes you want to move?",
      },
      {
        q: "Which statement about genre is true?",
        options: [
          "You must strictly follow genre rules",
          "Each genre has a fixed number of songs allowed",
          "Genre is a useful guide but you can mix genres freely",
          "Genres never evolve or change",
        ],
        answer: 2,
        explain:
          "Genre is a map, not a prison. The best producers understand genre conventions deeply so they know exactly which rules to follow and which to break creatively.",
        hint: "Rules are made to be understood — then occasionally broken.",
      },
    ],
  },
];

export const beginnerMissionBySlug = (slug: string) =>
  BEGINNER_MISSIONS.find((m) => m.slug === slug);

export const BEGINNER_SLUGS = BEGINNER_MISSIONS.map((m) => m.slug);

export const isBeginnerComplete = (completedMissions: Record<string, unknown>) =>
  BEGINNER_SLUGS.every((slug) => !!completedMissions[slug]);
