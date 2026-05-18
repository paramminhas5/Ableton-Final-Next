// ─── DJ PATH MISSIONS ─────────────────────────────────────────────────────────
// Intermediate DJ path — built from the rekordbox 6.0 manual and DJ education
// sources. Designed for someone who completed Beginner foundations.
//
// Sources:
//   [rekordbox Manual] Pioneer DJ rekordbox 6.0.0 Instruction Manual
//   [Pioneer DJ] pioneerdj.com
//   [Wikipedia] wikipedia.org
//   [DJTechTools] djtechtools.com
// ─────────────────────────────────────────────────────────────────────────────

export type DJMission = {
  slug: string;
  number: number;
  tier: "core" | "advanced";
  title: string;
  emoji: string;
  tagline: string;
  xp: number;
  badge?: { slug: string; name: string };
  // Plain-language explainer (intermediate-accessible)
  explainer: string[];
  // rekordbox-specific practical steps (from manual)
  practical?: string[];
  // Advanced deeper content (unlocked in advanced mode)
  advanced?: string[];
  sources: { label: string; section?: string }[];
  quiz: {
    q: string;
    options: string[];
    answer: number;
    explain: string;
    hint: string;
  }[];
};

export const DJ_MISSIONS: DJMission[] = [
  // ── CORE (shown at intermediate) ─────────────────────────────────────────
  {
    slug: "what-is-djing",
    number: 1,
    tier: "core",
    title: "What Is DJing?",
    emoji: "🎧",
    tagline: "The art of playing records for a crowd.",
    xp: 50,
    badge: { slug: "dj-initiate", name: "DJ Initiate" },
    explainer: [
      "A DJ (Disc Jockey) selects and plays music for an audience — in a club, at a party, on the radio, or online. The DJ's job is to curate the energy of a room: build excitement, peak at the right moment, then wind down smoothly.",
      "Modern DJs use either physical turntables (vinyl records), CDJs (professional CD/USB players used in clubs), or DJ controllers (USB devices connected to laptop software). Software like rekordbox, Serato or Traktor manages the music library and provides a virtual mixer on screen.",
      "The most fundamental DJ skill is the transition — moving from one track to the next without the crowd noticing (or noticing in a satisfying, dramatic way). This requires matching the tempo of two tracks, reading the energy of the room, and timing the switch perfectly.",
    ],
    sources: [
      { label: "Wikipedia — Disc Jockey" },
      { label: "Pioneer DJ — What is rekordbox?" },
      { label: "rekordbox Manual — Introduction", section: "p. 6" },
    ],
    quiz: [
      {
        q: "A DJ's primary job is…",
        options: [
          "Producing original music in a studio",
          "Selecting and playing music to control the energy of an audience",
          "Teaching music theory",
          "Selling records",
        ],
        answer: 1,
        explain:
          "DJing is about curation and energy management — choosing the right track at the right moment and transitioning between tracks to keep the crowd engaged.",
        hint: "Think: what's the DJ actually doing that the audience notices?",
      },
      {
        q: "CDJs are…",
        options: [
          "A type of headphone",
          "Professional CD/USB media players used in clubs",
          "A music streaming service",
          "A type of amplifier",
        ],
        answer: 1,
        explain:
          "CDJs (originally CD players, now USB-focused) are Pioneer DJ's industry-standard club players. They read audio from USB drives or connect to software like rekordbox via PRO DJ LINK.",
        hint: "You'll find them on every club DJ booth in the world.",
      },
      {
        q: "What software does Pioneer DJ make for DJs to manage music?",
        options: ["Ableton Live", "rekordbox", "GarageBand", "Pro Tools"],
        answer: 1,
        explain:
          "rekordbox is Pioneer DJ's ecosystem: it manages your music library, analyses tracks, and drives CDJs and DJ controllers.",
        hint: "It's in the name of the PDF manual you have!",
      },
    ],
  },

  {
    slug: "dj-equipment",
    number: 2,
    tier: "core",
    title: "DJ Equipment Explained",
    emoji: "🎛️",
    tagline: "Decks, mixer, headphones — what they all do.",
    xp: 50,
    explainer: [
      "A classic DJ setup has three components: two playback sources (decks), a mixer, and headphones. The decks play your tracks. The mixer lets you blend between them and adjust levels. The headphones let you preview the next track privately while the current one plays for the crowd.",
      "DJ controllers are all-in-one units that pack two virtual decks and a mixer into one USB device connected to laptop software. They're perfect for learning and for smaller venues. Professional club booths use separate CDJs connected to a dedicated hardware mixer.",
      "rekordbox works in two modes: EXPORT mode (prepare your USB stick with analysed tracks for use on CDJs at a club) and PERFORMANCE mode (use rekordbox itself as the playback software with a controller). Understanding both is essential for a working DJ.",
    ],
    practical: [
      "In rekordbox: the Collection is your full music library. Import tracks by dragging from your file explorer into the Collection window.",
      "Analysis happens automatically after import. rekordbox detects BPM, key, waveform, and can auto-set the first cue point at the first beat.",
      "Playlists in rekordbox work like folders — drag tracks in to organise by genre, energy level, or set preparation.",
    ],
    sources: [
      { label: "rekordbox Manual — Collection", section: "p. 7" },
      { label: "rekordbox Manual — EXPORT mode screen", section: "p. 48" },
      { label: "rekordbox Manual — PERFORMANCE mode screen", section: "p. 104" },
    ],
    quiz: [
      {
        q: "In a DJ setup, what do headphones allow you to do?",
        options: [
          "Play music louder",
          "Preview the next track privately without the crowd hearing",
          "Record your set",
          "Control the lights",
        ],
        answer: 1,
        explain:
          "Headphones (cue monitoring) let you listen to the next track in your headphones before bringing it into the mix. This is how DJs prepare seamless transitions.",
        hint: "The crowd hears the speakers. You need a private preview.",
      },
      {
        q: "rekordbox EXPORT mode is used to…",
        options: [
          "Stream music online",
          "Prepare USB drives with analysed tracks for use on club CDJs",
          "Apply vocal effects",
          "Record a set",
        ],
        answer: 1,
        explain:
          "EXPORT mode analyses your music, organises playlists, and exports everything to a USB drive. At the club, you plug that USB into the CDJ. All your cue points, grids and playlists are ready.",
        hint: "Think: you're preparing your bag before heading to the club.",
      },
      {
        q: "rekordbox analyses tracks to detect…",
        options: [
          "Only the file name",
          "BPM, key, waveform and phrase structure",
          "Your personal taste",
          "The music's copyright status",
        ],
        answer: 1,
        explain:
          "rekordbox analysis detects BPM (tempo), musical key, waveform shape, beat grid, and phrase markers — all essential for DJing and library organisation.",
        hint: "Think: what does a DJ need to know about a track before playing it?",
      },
    ],
  },

  {
    slug: "bpm-and-beatmatching",
    number: 3,
    tier: "core",
    title: "BPM & Beatmatching",
    emoji: "⏱️",
    tagline: "Syncing two tracks so they breathe as one.",
    xp: 60,
    badge: { slug: "beat-surgeon", name: "Beat Surgeon" },
    explainer: [
      "Beatmatching is aligning the tempo and beat position of two tracks so they play in perfect rhythmic sync. If two tracks aren't beatmatched, they'll clash — one beat rushing ahead, the other lagging behind, creating an unpleasant stutter effect.",
      "BPM (Beats Per Minute) is the starting point. If track A is at 128 BPM and track B is at 130 BPM, track B is slightly faster. You need to nudge or pitch-adjust one track until they lock together.",
      "Modern DJ software (and CDJs) include sync functions that automatically match the BPM and beat phase of two tracks. Learning to beatmatch by ear first makes you a better DJ — you understand what's happening, not just what button fixes it.",
    ],
    practical: [
      "In rekordbox PERFORMANCE mode: the SYNC button aligns the beat grid of the incoming track to the playing track. The MASTER button designates which deck is the tempo reference.",
      "The tempo slider (pitch fader on CDJs) adjusts the playback speed by ±%: ±6%, ±10%, ±16% are common ranges. Narrower range = finer control; wider = bigger adjustments.",
      "The beat grid (shown as a waveform overlay) helps you see where beats fall. Correct beat grids are essential for sync to work accurately. rekordbox auto-detects grids during analysis.",
    ],
    advanced: [
      "Manual beatmatching by ear trains your timing perception. You nudge the jog wheel to speed up or slow down a track momentarily, listening for the kick drums to line up. A technique called 'rocking' (nudging slightly forward and back) helps you zero in.",
      "Phase matching means not just matching BPM but matching beat position — making sure beat 1 of the incoming track lands on beat 1 of the playing track. A half-beat off sounds almost right but feels wrong.",
      "Some styles (like minimal techno) can tolerate longer, gradual BPM transitions. Others (like drum & bass at 174 BPM) require precise matching because even a tiny phase error is immediately audible at high tempo.",
    ],
    sources: [
      { label: "Wikipedia — Beatmatching" },
      { label: "rekordbox Manual — Playing tracks", section: "p. 71" },
      { label: "rekordbox Manual — SYNC in PERFORMANCE mode", section: "p. 132" },
    ],
    quiz: [
      {
        q: "Beatmatching means…",
        options: [
          "Playing two tracks at the same volume",
          "Aligning the tempo and beat position of two tracks",
          "Finding tracks with the same key",
          "Cutting between tracks suddenly",
        ],
        answer: 1,
        explain:
          "Beatmatching = syncing BPM and beat phase so two tracks play in rhythmic alignment. Without it, tracks clash or sound out of time.",
        hint: "Think: two clocks ticking at exactly the same speed AND starting at the same moment.",
      },
      {
        q: "The SYNC button on DJ equipment…",
        options: [
          "Records your set",
          "Automatically matches the BPM and phase of the incoming track to the master",
          "Changes the musical key",
          "Activates effects",
        ],
        answer: 1,
        explain:
          "SYNC automatically beatmatches the incoming deck to the master tempo reference — useful for complex transitions or when your hands are busy on the mixer.",
        hint: "SYNC does the math so you can focus on the creative side.",
      },
      {
        q: "A beat grid in rekordbox is…",
        options: [
          "A playlist organiser",
          "A visual overlay showing where beats fall in the waveform",
          "A type of audio effect",
          "The export menu",
        ],
        answer: 1,
        explain:
          "The beat grid is a series of markers on the waveform showing the position of each beat. Accurate grids are essential for SYNC to work and for setting cue points on beat.",
        hint: "It's the map that tells the software 'here's where beat 1 is, here's beat 2...'",
      },
    ],
  },

  {
    slug: "cue-points",
    number: 4,
    tier: "core",
    title: "Cue Points & Memory Cues",
    emoji: "📍",
    tagline: "Bookmarks in your tracks for perfect timing.",
    xp: 50,
    explainer: [
      "A cue point is a saved position in a track — like a bookmark. When you trigger a cue, the track jumps back to that exact position and plays from there. DJs use cues to jump straight to the best part of a track, start a track perfectly on beat, or jump between key moments.",
      "Hot cue buttons (usually 8 per deck on modern hardware) let you set and instantly jump to different cue points during live performance. A well-prepared track might have: Cue 1 = intro start, Cue 2 = drop, Cue 3 = breakdown, Cue 4 = outro.",
      "Memory cues are saved in rekordbox and travel with your USB — they're always there when you plug into a club CDJ. Performance cues are set live during a set and don't persist. Understanding both is key to professional preparation.",
    ],
    practical: [
      "In rekordbox: to set a memory cue, position the playhead at the right moment and press the Cue button (or click the cue marker in the waveform view).",
      "rekordbox can automatically set a memory cue at the first beat of a track during analysis. Enable this in Preferences > Analysis > Track Analysis > 'Set Memory Cue at first beat'.",
      "Cue points are stored in your rekordbox library database and exported with your USB. On CDJ-3000s, they display as coloured markers on the waveform display.",
    ],
    sources: [
      { label: "rekordbox Manual — Cues in EXPORT mode", section: "p. 77" },
      { label: "rekordbox Manual — Cues in PERFORMANCE mode", section: "p. 132" },
      { label: "rekordbox Manual — Analysis auto-cue setting", section: "p. 14" },
    ],
    quiz: [
      {
        q: "A cue point in DJing is…",
        options: [
          "A type of audio effect",
          "A saved position in a track for instant playback",
          "The BPM of a track",
          "A playlist type",
        ],
        answer: 1,
        explain:
          "A cue point is a bookmark at a specific position in a track. Trigger it and the track instantly jumps to that moment — perfect for hitting the drop precisely.",
        hint: "Like a dog-eared page in a book — jump straight to the good part.",
      },
      {
        q: "Hot cues allow you to…",
        options: [
          "Add reverb effects",
          "Instantly jump to up to 8 different positions in a track during performance",
          "Export your music library",
          "Slow down a track gradually",
        ],
        answer: 1,
        explain:
          "Hot cues (up to 8 per deck) are performance-focused cue triggers. Pressing them during playback jumps to the saved position instantly — useful for remixing, extended intros, or creative rearrangement.",
        hint: "Hot = instant performance access. Eight bookmarks, one button each.",
      },
      {
        q: "Memory cues saved in rekordbox…",
        options: [
          "Only work in software, not on CDJs",
          "Travel with your USB and appear on club CDJs",
          "Are deleted after each session",
          "Cannot be exported",
        ],
        answer: 1,
        explain:
          "rekordbox memory cues are stored in your library and exported to USB. When you plug that USB into a club CDJ, all your cue points are there — no re-setting needed.",
        hint: "The point of preparation: your cues go with you to the club.",
      },
    ],
  },

  {
    slug: "the-dj-mixer",
    number: 5,
    tier: "core",
    title: "The DJ Mixer",
    emoji: "🎛️",
    tagline: "Volume, EQ and the art of the blend.",
    xp: 50,
    explainer: [
      "The DJ mixer sits between the two decks. It lets you control the volume of each deck, blend between them using the crossfader, and adjust the EQ (equaliser) of each channel. This is where the actual mixing happens.",
      "A standard DJ mixer has 3-band EQ per channel: Low (bass frequencies), Mid (midrange), High (treble). Cutting the bass on the incoming track before bringing it in — then swapping the bass to the new track — is one of the most fundamental mixing techniques. It prevents bass clash (two bass lines fighting each other).",
      "The crossfader moves the sound from one deck to the other. Pushed fully left: you hear deck A. Fully right: deck B. Centred: equal blend of both. DJs can ride the crossfader smoothly for gradual blends, or cut it sharply for dramatic transitions.",
    ],
    practical: [
      "In rekordbox PERFORMANCE mode: each channel has a 3-band EQ (Low, Mid, High knobs), a channel fader, and links to the crossfader.",
      "The channel filter (often on mixers and in rekordbox) lets you sweep a high-pass or low-pass filter across the audio — gradually removing bass or treble — for dramatic transitions.",
      "Gain control sets the input level of each channel before the EQ. Proper gain staging prevents clipping (distortion) and ensures both decks are at a matched level.",
    ],
    sources: [
      { label: "rekordbox Manual — PERFORMANCE mode screen", section: "p. 104" },
      { label: "rekordbox Manual — Mixer functions", section: "p. 126" },
      { label: "Wikipedia — DJ Mixer" },
    ],
    quiz: [
      {
        q: "The crossfader on a DJ mixer controls…",
        options: [
          "The tempo of both decks",
          "Blending between two audio channels",
          "The reverb amount",
          "The key of the track",
        ],
        answer: 1,
        explain:
          "The crossfader fades between two channels. Left = Channel A, Right = Channel B, centre = both equally. Moving it smoothly = blend, moving it sharply = cut.",
        hint: "Cross = crossing between two things. Fader = fade.",
      },
      {
        q: "Why do DJs cut the bass (Low EQ) on the incoming track?",
        options: [
          "To make the track sound quieter overall",
          "To prevent two bass lines clashing when mixing two tracks",
          "To add reverb",
          "To increase the BPM",
        ],
        answer: 1,
        explain:
          "Two bass lines at the same time causes 'bass clash' — a muddy, powerful boom that overwhelms a mix. Rolling off the bass on the incoming track until the swap keeps the mix clean.",
        hint: "Two bass guitars in the same room fighting each other sounds bad. One at a time.",
      },
      {
        q: "3-band EQ on a DJ mixer controls…",
        options: [
          "Low (bass), Mid, and High (treble) frequencies of a channel",
          "Three different tracks simultaneously",
          "Three tempo settings",
          "Three reverb effects",
        ],
        answer: 0,
        explain:
          "Low = bass (kick, bass line), Mid = midrange (vocals, snares, main instruments), High = treble (hi-hats, cymbals, air). Each can be boosted or cut independently.",
        hint: "Three parts of the sound spectrum — bottom, middle, top.",
      },
    ],
  },

  {
    slug: "reading-the-crowd",
    number: 6,
    tier: "core",
    title: "Reading the Room",
    emoji: "👥",
    tagline: "The crowd tells you what to play next.",
    xp: 40,
    badge: { slug: "crowd-whisperer", name: "Crowd Whisperer" },
    explainer: [
      "The most technically skilled DJ who can't read a crowd is less effective than a mediocre technician who picks exactly the right track at the right moment. Reading the room is arguably the most important skill in DJing.",
      "Watch: are people dancing? Are they facing the dance floor or the bar? Are groups forming or dispersing? Body language, energy level, age of audience, time of night — all feed into your next track selection.",
      "Set structure matters: a DJ set typically has an arc. Early evening: warm up with lower-energy tracks, draw people in. Middle: build intensity, more driving tracks. Peak hour: highest energy, the tracks you've been saving for this moment. Wind-down: smooth the crowd home gently.",
    ],
    sources: [
      { label: "Wikipedia — DJing" },
      { label: "DJTechTools — Reading the crowd" },
    ],
    quiz: [
      {
        q: "The most important non-technical DJ skill is…",
        options: [
          "Scratching",
          "Reading the room and selecting the right track",
          "Knowing every BPM by heart",
          "Having the newest equipment",
        ],
        answer: 1,
        explain:
          "Track selection and crowd reading are what separate great DJs from technically proficient ones. The perfect track at the perfect moment moves a crowd more than any technical trick.",
        hint: "What matters more: HOW you play or WHAT you play?",
      },
      {
        q: "A DJ set typically follows what arc?",
        options: [
          "Peak energy from the first track",
          "Warm up → build → peak → wind down",
          "Always getting quieter over time",
          "Random energy throughout",
        ],
        answer: 1,
        explain:
          "A well-structured set builds gradually. Warm-up eases the crowd in, the build creates anticipation, peak hour delivers the highest energy, and the wind-down brings them home satisfied.",
        hint: "Think of a good story: it has a beginning, middle, climax, and resolution.",
      },
    ],
  },

  {
    slug: "dj-transitions",
    number: 7,
    tier: "core",
    title: "Mixing Techniques",
    emoji: "🌊",
    tagline: "How to move from one track to the next.",
    xp: 60,
    badge: { slug: "blendmaster", name: "Blendmaster" },
    explainer: [
      "A transition is how you move from one track to the next. There are many techniques — the choice depends on the energy you want, the tracks you're working with, and your personal style.",
      "The long mix (blend): gradually increase volume of track B while decreasing track A over 16–32 bars. Best for smooth, uninterrupted flow. Most common in house and techno.",
      "The cut: immediate switch from one track to the other, usually on beat 1 of a phrase. Dramatic and impactful. Used in hip-hop, hard techno, or for surprise drops.",
      "The filter sweep: roll off the bass on the outgoing track using the EQ or a filter, bring in the new track's bass, swap. One of the cleanest techniques for avoiding bass clash.",
    ],
    practical: [
      "In rekordbox PERFORMANCE mode: the 2-PLAYER mode (under EXPORT mode) shows two waveforms side by side with shared BPM display — designed for CDJ-CDJ mixing workflow.",
      "The EFX section in rekordbox provides performance effects (echo, reverb, flanger, phaser) that can be used during transitions to add texture and mask the join between two tracks.",
      "Use the loop function to hold a section of a track while you beatmatch the incoming track — this buys you time without the track ending.",
    ],
    sources: [
      { label: "rekordbox Manual — Mixing (2 PLAYER mode)", section: "p. 98" },
      { label: "rekordbox Manual — Effects in PERFORMANCE mode", section: "p. 155" },
    ],
    quiz: [
      {
        q: "A 'long mix' transition involves…",
        options: [
          "Cutting sharply between tracks on the beat",
          "Gradually blending two tracks over 16–32 bars",
          "Playing one track twice",
          "Using a reverb effect only",
        ],
        answer: 1,
        explain:
          "The long mix (blend) gradually crossfades two tracks, usually over 16–32 bars. Classic for house and techno where continuity of energy is valued over dramatic transitions.",
        hint: "Long mix = slow, gradual blend. The crowd may not even notice the track changed.",
      },
      {
        q: "The filter sweep transition technique primarily avoids…",
        options: [
          "Volume clipping",
          "Bass clash from two bass lines playing simultaneously",
          "Tempo differences",
          "Playing the wrong cue",
        ],
        answer: 1,
        explain:
          "By rolling the bass off the outgoing track and swapping the bass to the new track using EQ, you ensure only one bass line is heard at a time — clean and powerful.",
        hint: "Bass + Bass = mud. Roll one off before adding the other.",
      },
    ],
  },

  {
    slug: "music-library-management",
    number: 8,
    tier: "core",
    title: "Library Management",
    emoji: "📚",
    tagline: "Organise your music so you can find it in a dark club.",
    xp: 40,
    explainer: [
      "Professional DJs have thousands of tracks and need to find the perfect one in seconds during a live set. This requires serious organisation. A badly organised library leads to dead air, wrong tracks, and missed moments.",
      "rekordbox's Collection is your full library. Use playlists to group tracks by genre, energy, key, or set context. Playlists can be nested into folders — 'House' folder with subfolders for 'Deep', 'Tech', 'Melodic'.",
      "My Tags in rekordbox let you create custom labels — 'Peak Hour', 'Warm Up', 'Banger', 'Slow Burner' — and apply them to tracks regardless of genre. Then filter by tag during your set to find exactly what you need.",
    ],
    practical: [
      "Import music: in rekordbox Collection window, drag files/folders from File Explorer or Finder into the track list.",
      "Analysis: set Preferences > Analysis > Auto Analysis to Enable so every import is automatically analysed for BPM, key and waveform.",
      "My Tags: right-click a track > Edit Tag to apply custom colour-coded tags. Create your own tag categories in Preferences > My Tag.",
      "Smart Playlists (in Pro plan): automatically populate based on criteria — 'all tracks between 125–130 BPM in key Am added in the last 3 months'.",
    ],
    sources: [
      { label: "rekordbox Manual — Collection window", section: "p. 7" },
      { label: "rekordbox Manual — Using a Playlist", section: "p. 34" },
      { label: "rekordbox Manual — My Tag configuration", section: "p. 29" },
      { label: "rekordbox Manual — Analysis settings", section: "p. 192" },
    ],
    quiz: [
      {
        q: "rekordbox My Tags let you…",
        options: [
          "Export music to iTunes",
          "Apply custom labels to tracks for quick filtering during a set",
          "Auto-mix tracks",
          "Change a track's key",
        ],
        answer: 1,
        explain:
          "My Tags are custom labels ('Peak Hour', 'Warm Up', 'Request') that you apply to tracks. Filter by tag in real-time during a set to find exactly what the moment calls for.",
        hint: "Think: sticky notes on your record crates. 'These are for 2am peak.'",
      },
      {
        q: "Where does rekordbox store your music library?",
        options: [
          "On the internet",
          "On your computer in the rekordbox database (Collection)",
          "On the CDJ directly",
          "On rekordbox servers only",
        ],
        answer: 1,
        explain:
          "rekordbox maintains a local database (Collection) on your computer. Your actual audio files stay where they are — rekordbox references them, adds analysis data, and stores your cues and tags.",
        hint: "It's a catalogue of your music, not a copy of it.",
      },
    ],
  },

  // ── ADVANCED (shown only in advanced mode) ────────────────────────────────
  {
    slug: "key-mixing",
    number: 9,
    tier: "advanced",
    title: "Key Mixing & Harmonic DJing",
    emoji: "🔑",
    tagline: "Mixing in key for musical transitions.",
    xp: 70,
    badge: { slug: "harmonic-architect", name: "Harmonic Architect" },
    explainer: [
      "Harmonic mixing means matching the musical keys of two tracks so their melodies and chords work together during the transition. When keys clash, even a perfectly beatmatched blend sounds wrong — like two musicians playing in different keys.",
      "The Camelot Wheel (also called the Musical Key Notation system) maps all 24 musical keys into a clock-face with numbers (1–12) and letters (A for minor, B for major). Tracks with adjacent numbers or the same number mix harmonically.",
      "rekordbox analyses and displays the detected key of every track. In modern CDJ setups and controller software, the key is visible in the track browser. Setting up key-aware playlists transforms your mixing from rhythmically correct to musically beautiful.",
    ],
    advanced: [
      "The Camelot system: 8A (Am) and 9A (Em) are adjacent and harmonically compatible. 8A and 8B (C major) share the same root note collection — very compatible. Moving two steps apart (8A to 10A) is riskier.",
      "Key shifting: CDJs and some software (including rekordbox PERFORMANCE mode) allow real-time pitch shifting without changing tempo — 'Master Tempo' keeps the BPM locked while you raise or lower the key by semitones. Use this to force compatibility between tracks that are a semitone or two apart.",
      "Energy levels and key: not every transition needs harmonic matching. A dramatic drop to a different key can be powerful if the energy curve is right. Rules are tools — learn them, then decide when to break them.",
    ],
    sources: [
      { label: "Wikipedia — Harmonic mixing" },
      { label: "rekordbox Manual — Key display in Collection", section: "p. 9" },
      { label: "Pioneer DJ — Key analysis in rekordbox" },
    ],
    quiz: [
      {
        q: "Harmonic mixing means…",
        options: [
          "Matching the BPM exactly",
          "Mixing tracks whose musical keys are compatible",
          "Using the same effect on every track",
          "Always using the crossfader",
        ],
        answer: 1,
        explain:
          "Harmonic mixing matches musical keys so melodies and chords of two tracks complement each other during the transition, avoiding musical clashes.",
        hint: "Harmony = notes that sound good together. Harmonic mixing = keys that sound good together.",
      },
      {
        q: "The Camelot Wheel helps DJs…",
        options: [
          "Find the BPM of a track",
          "Identify which musical keys are harmonically compatible",
          "Manage their playlist folders",
          "Set cue points automatically",
        ],
        answer: 1,
        explain:
          "The Camelot Wheel maps all 24 musical keys into a circular system where adjacent keys are harmonically compatible. Adjacent numbers = safe mix. Same number different letter = also compatible.",
        hint: "It's a map of musical keys laid out in a clock pattern.",
      },
    ],
  },

  {
    slug: "dj-effects-deep",
    number: 10,
    tier: "advanced",
    title: "DJ Effects & Creative Tools",
    emoji: "✨",
    tagline: "Echo, filter, reverb — bend the music.",
    xp: 70,
    explainer: [
      "Effects (FX) let DJs add texture, drama and creativity to their sets beyond just mixing two tracks together. A well-placed echo hold during a breakdown, a reverb wash on the outro of a track, or a filter sweep building tension before a drop — these are the tools that separate a memorable set from a functional one.",
      "rekordbox PERFORMANCE mode includes a Quantize Effect section with Beat FX (time-synced effects like echo, reverb, flanger, phaser, pitch shift) and Sound Color FX (real-time filter effects mapped to a single knob).",
      "The key to tasteful FX use: restraint. FX should serve the music and the moment, not announce themselves. A DJ who uses echo on every track becomes predictable. A DJ who deploys a long reverb wash perfectly once in a set creates a moment the crowd remembers.",
    ],
    advanced: [
      "Beat FX in rekordbox/CDJs are synced to BPM: the Echo FX repeats exactly on the beat, the Loop Roll captures and repeats a beat-length portion of audio. This ensures effects sit rhythmically in the track.",
      "The roll/loop function captures a specific bar length (1 bar, 1/2 bar, 1/4) and loops it indefinitely. This is useful for extending breakdowns, building tension, or creating a moment to bring in the next track.",
      "Filter sweeps: many DJ mixers and software include a resonant filter per channel. A slow filter sweep (rolling off the high frequencies over 8 bars) creates a dramatic tunnel effect before a big drop or transition.",
    ],
    sources: [
      { label: "rekordbox Manual — Effects in PERFORMANCE mode", section: "p. 155" },
      { label: "rekordbox Manual — Beat FX", section: "p. 155" },
    ],
    quiz: [
      {
        q: "Beat FX in rekordbox are…",
        options: [
          "Effects applied randomly",
          "Time-synced effects like echo and reverb that lock to the track BPM",
          "Only available in EXPORT mode",
          "Types of EQ",
        ],
        answer: 1,
        explain:
          "Beat FX (Echo, Reverb, Flanger, etc.) in rekordbox PERFORMANCE mode are synchronised to the track BPM — the echo repeats on the beat, the loop captures exactly 1 bar, etc.",
        hint: "Beat FX = effects that follow the beat. No manual timing needed.",
      },
      {
        q: "What is the golden rule of DJ effects?",
        options: [
          "Use as many as possible on every track",
          "Use effects with restraint to serve the music and the moment",
          "Only use effects at peak hour",
          "Effects should always be audible to the audience",
        ],
        answer: 1,
        explain:
          "FX should serve the music — not distract from it. A precisely placed effect at the right moment is powerful. Effects on every track become noise.",
        hint: "Less is more. The rarest moments are the most memorable.",
      },
    ],
  },

  {
    slug: "preparing-a-dj-set",
    number: 11,
    tier: "advanced",
    title: "Preparing a Live DJ Set",
    emoji: "📋",
    tagline: "From library to stage: the professional checklist.",
    xp: 80,
    badge: { slug: "set-ready", name: "Set Ready" },
    explainer: [
      "Professional preparation separates a DJ who wings it from one who delivers every time. Even improvisation-focused DJs have deep preparation — they know their tracks inside-out so they can make spontaneous decisions confidently.",
      "Set preparation in rekordbox: curate a set playlist, analyse all tracks, verify beat grids (fix any that were auto-detected incorrectly), set cue points on every track's key moments (intro, drop, breakdown, outro), check keys and note compatible transitions.",
      "Export your prepared playlist to a USB drive in rekordbox EXPORT mode. Verify the export on a test CDJ if possible. Bring two USB drives (backup). Know your first three tracks before you walk on — everything else adapts to the room.",
    ],
    practical: [
      "Verify beat grids: in rekordbox, zoom in to the waveform and check that the grid markers align with actual beats. Manually correct grids where auto-analysis was wrong (common with complex rhythms or tracks with tempo changes).",
      "Export checklist: Collection > select playlist > sync to device (USB). Check that My Tags, cue points and playlists are included in export settings.",
      "rekordbox manual (p. 66): 'Preparing for DJ performance' — sync tracks to USB, verify on connected device, check PRO DJ LINK cable connection for networked CDJ setups.",
    ],
    sources: [
      { label: "rekordbox Manual — Preparing for DJ performance", section: "p. 66" },
      { label: "rekordbox Manual — Using with DJ equipment (PRO DJ LINK)", section: "p. 67" },
      { label: "rekordbox Manual — SYNC MANAGER", section: "p. 37" },
    ],
    quiz: [
      {
        q: "When preparing a USB for club CDJs, you should…",
        options: [
          "Copy MP3 files directly with no analysis",
          "Use rekordbox to analyse, add cue points, and export via SYNC MANAGER",
          "Use iTunes only",
          "Upload to the internet",
        ],
        answer: 1,
        explain:
          "rekordbox analyses tracks, stores your cue points and beat grids in its database, and exports everything to USB via the SYNC MANAGER. This ensures your cues and organisation are available on any CDJ.",
        hint: "Prepared = analysed + cued + exported. Not just copied.",
      },
      {
        q: "Why should you bring two USB drives to a gig?",
        options: [
          "You need one per CDJ",
          "One is a backup in case the primary fails",
          "One for the opening act",
          "It's required by Pioneer DJ",
        ],
        answer: 1,
        explain:
          "Hardware fails at the worst moments. A backup USB with your full prepared library ensures a technical failure doesn't end your set. Professionals always carry two.",
        hint: "Professional rule: always have a backup. What if the first one fails?",
      },
    ],
  },
];

export const djMissionBySlug = (slug: string) => DJ_MISSIONS.find((m) => m.slug === slug);
export const DJ_CORE_MISSIONS = DJ_MISSIONS.filter((m) => m.tier === "core");
export const DJ_ADVANCED_MISSIONS = DJ_MISSIONS.filter((m) => m.tier === "advanced");
export const DJ_SLUGS = DJ_MISSIONS.map((m) => m.slug);
export const DJ_CORE_SLUGS = DJ_CORE_MISSIONS.map((m) => m.slug);
