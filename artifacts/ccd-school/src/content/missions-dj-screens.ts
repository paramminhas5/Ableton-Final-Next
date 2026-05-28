import type { LessonScreen } from "./types";

// DJ World CCD Screens
// 40 missions × 7-8 screens each

export const DJ_SCREENS: Record<string, LessonScreen[]> = {

  // ─── 1. WHAT IS DJING ────────────────────────────────────────────────────────
  "what-is-djing": [
    {
      kind: "hook",
      emoji: "🎧",
      headline: "You control the energy of the room",
      subtext: "DJing is the art of selecting and playing music for a crowd.",
    },
    {
      kind: "concept",
      title: "What DJs actually do",
      body: "A DJ curates music for an audience — building excitement, peaking at the right moment, and winding down smoothly. The transition from one track to the next is the fundamental skill.",
      keyFact: "The crowd follows your energy. You lead the room.",
      visual: "vinyl-platter",
    },
    {
      kind: "concept",
      title: "Types of DJs",
      body: "Radio DJs broadcast pre-planned sets. Club DJs read the dance floor in real time. Turntablists use the deck as a musical instrument, scratching and cutting rhythmically.",
      keyFact: "Every DJ type shares one goal: connecting music to audience.",
    },
    {
      kind: "interact",
      sim: "mixer",
      prompt: "Blend two tracks — feel the transition",
    },
    {
      kind: "quiz",
      q: "A DJ primary job is",
      options: ["Producing original music in a studio", "Selecting and playing music to control the energy of an audience", "Teaching music theory", "Selling records"],
      answer: 1,
      explain: "DJing is about curation and energy management — choosing the right track at the right moment.",
    },
    {
      kind: "quiz",
      q: "DJing emerged primarily from which scenes?",
      options: ["Concert orchestras", "Radio disc jockeys, New York discotheques, Bronx hip-hop block parties, Chicago/Detroit underground clubs", "Classical music conservatories", "TV talent shows"],
      answer: 1,
      explain: "Modern DJing grew from radio DJs, the disco era, hip-hop culture, and the underground scenes of Chicago and Detroit in the 1970s–80s.",
    },
    {
      kind: "quiz",
      q: "The most fundamental DJ skill is",
      options: ["Scratching records", "The transition — moving seamlessly from one track to the next", "Knowing every track BPM by heart", "Having the newest equipment"],
      answer: 1,
      explain: "The transition is the core of DJing — beatmatching, timing, and smoothly moving between tracks without disrupting the crowd.",
    },
    {
      kind: "summary",
      learned: ["DJs curate music to control crowd energy", "The transition is the core DJ skill", "Multiple DJ styles: club, radio, turntablist"],
    },
  ],


  // ─── 2. DJ EQUIPMENT ─────────────────────────────────────────────────────────
  "dj-equipment": [
    {
      kind: "hook",
      emoji: "🎛️",
      headline: "Three pieces, infinite possibility",
      subtext: "Decks, mixer, headphones — the DJ's complete toolkit.",
    },
    {
      kind: "concept",
      title: "The core DJ setup",
      body: "Two playback sources (CDJs or turntables), a mixer, and headphones form the classic setup. CDJs are the industry standard — found in every major club worldwide.",
      keyFact: "CDJs + mixer + headphones = professional DJ setup.",
      visual: "mixer-channel",
    },
    {
      kind: "concept",
      title: "The mixer's role",
      body: "The mixer is the creative heart: it controls volume faders, three-band EQ per channel, the crossfader for blending, and effects routing.",
      keyFact: "Mixer = where actual mixing happens — not just volume.",
    },
    {
      kind: "interact",
      sim: "mixer",
      prompt: "Use the mixer — adjust EQ and faders",
    },
    {
      kind: "quiz",
      q: "CDJs are",
      options: ["A type of headphone", "Industry-standard club media players that read USB drives", "A music streaming service", "A type of amplifier"],
      answer: 1,
      explain: "CDJs are Pioneer DJ industry-standard club players found on virtually every professional DJ booth worldwide.",
    },
    {
      kind: "quiz",
      q: "The DJ mixer controls",
      options: ["Only the volume", "Volume, EQ, crossfader, effects routing — the creative centre of a DJ setup", "The tempo of playback", "The key of tracks"],
      answer: 1,
      explain: "The mixer controls volume faders, three-band EQ per channel, crossfader for blending, and effects routing.",
    },
    {
      kind: "quiz",
      q: "Headphones in a DJ setup are primarily used for",
      options: ["Listening to the crowd monitor", "Cueing — privately previewing the next track before bringing it into the mix", "Recording the set", "Controlling the lights"],
      answer: 1,
      explain: "Headphones let you listen to the incoming track privately before bringing it into the mix.",
    },
    {
      kind: "summary",
      learned: ["CDJs are the worldwide club standard", "Mixer controls EQ, faders, crossfader, effects", "Headphones = private preview before the crowd hears"],
    },
  ],


  // ─── 3. REKORDBOX INTRO ───────────────────────────────────────────────────────
  "rekordbox-intro": [
    {
      kind: "hook",
      emoji: "💿",
      headline: "Your music hub before you hit the booth",
      subtext: "rekordbox analyses, organises, and exports your music to CDJs.",
    },
    {
      kind: "concept",
      title: "Two essential modes",
      body: "EXPORT mode prepares USB drives with analysed tracks and playlists for club CDJs. PERFORMANCE mode uses rekordbox itself as playback software with a controller.",
      keyFact: "EXPORT = prepare for clubs. PERFORMANCE = play live with a laptop.",
      visual: "waveform-zoom",
    },
    {
      kind: "concept",
      title: "Auto-analysis power",
      body: "rekordbox analyses every imported track and detects BPM, musical key, waveform shape, and beat grid — automatically.",
      keyFact: "One import → BPM, key, waveform, grid all detected.",
    },
    {
      kind: "interact",
      sim: "browser-tour",
      prompt: "Explore the rekordbox Collection window",
    },
    {
      kind: "quiz",
      q: "rekordbox EXPORT mode is used to",
      options: ["Stream music online", "Prepare USB drives with analysed tracks cue points and playlists for club CDJs", "Apply vocal effects", "Record a set"],
      answer: 1,
      explain: "EXPORT mode analyses your music, organises playlists, and exports everything to USB for CDJs.",
    },
    {
      kind: "quiz",
      q: "rekordbox analyses tracks to detect",
      options: ["Only the file name", "BPM, key, waveform and beat grid", "Your personal taste", "The music copyright status"],
      answer: 1,
      explain: "rekordbox analysis detects BPM, musical key, waveform shape, and beat grid.",
    },
    {
      kind: "quiz",
      q: "PRO DJ LINK is",
      options: ["A social network for DJs", "A network protocol connecting rekordbox to CDJ hardware for seamless integration", "A type of audio cable", "A streaming service"],
      answer: 1,
      explain: "PRO DJ LINK connects rekordbox software to CDJ hardware over a network.",
    },
    {
      kind: "summary",
      learned: ["EXPORT mode preps USB for club CDJs", "PERFORMANCE mode = rekordbox as live software", "Auto-analysis finds BPM, key, waveform, beat grid"],
    },
  ],


  // ─── 4. HEADPHONE MONITORING ──────────────────────────────────────────────────
  "headphone-monitoring": [
    {
      kind: "hook",
      emoji: "🎧",
      headline: "Preview privately — play perfectly",
      subtext: "Cueing lets you hear the next track before the crowd does.",
    },
    {
      kind: "concept",
      title: "What cueing does",
      body: "The CUE button routes a channel to your headphones before it reaches the speakers. You beatmatch, find the right cue point, and confirm the track sounds right — privately.",
      keyFact: "CUE = your private preview. The crowd hears nothing yet.",
      visual: "mixer-channel",
    },
    {
      kind: "concept",
      title: "Split cue monitoring",
      body: "Split cue divides your headphone output: left ear hears the master mix, right ear hears the incoming cued channel. Both simultaneously — the DJ's superpower.",
      keyFact: "Left = master mix. Right = incoming track. Listen to both.",
    },
    {
      kind: "interact",
      sim: "mixer",
      prompt: "Cue a track — preview it in headphones",
    },
    {
      kind: "quiz",
      q: "Cueing allows you to",
      options: ["Play music louder", "Preview the next track in your headphones before the crowd hears it", "Record your set", "Control the lights"],
      answer: 1,
      explain: "Cueing lets you listen to the incoming track privately before bringing it into the mix.",
    },
    {
      kind: "quiz",
      q: "Split cue monitoring means",
      options: ["Splitting a track into stems", "Left ear monitors the master mix right ear monitors the cue channel simultaneously", "Using two separate mixers", "Monitoring in mono only"],
      answer: 1,
      explain: "Split cue divides the stereo headphone output: one ear hears the master, the other hears the cued channel.",
    },
    {
      kind: "quiz",
      q: "When beatmatching by ear in headphones you primarily listen for",
      options: ["The melody", "The kick drum in each ear to align and stop fluttering", "The reverb tail", "The bass note"],
      answer: 1,
      explain: "The kick drum is the most metronomic element. Aligning both kicks until they lock in sync is the foundation of manual beatmatching.",
    },
    {
      kind: "summary",
      learned: ["CUE routes a channel to headphones before speakers", "Split cue: master in one ear, incoming in the other", "Listen for kick drums to lock the beats"],
    },
  ],


  // ─── 5. BOOTH SETUP ───────────────────────────────────────────────────────────
  "booth-setup": [
    {
      kind: "hook",
      emoji: "🔌",
      headline: "Arrive early — check everything",
      subtext: "A correct booth setup prevents dead air when it matters most.",
    },
    {
      kind: "concept",
      title: "Signal chain basics",
      body: "CDJ or laptop → mixer channel input → master output → amplifier → speakers. Every link must be correct. Wrong input assignment = silence or distortion.",
      keyFact: "LINE input for CDJs. PHONO input for vinyl turntables.",
      visual: "signal-chain",
    },
    {
      kind: "concept",
      title: "Gain staging",
      body: "Set channel gains so peaks hit +3 to +6 dB on the mixer meter — not clipping. The booth monitor is a separate speaker only the DJ hears, set independently from the main output.",
      keyFact: "Gain: not clipping, not too quiet. Booth ≠ main speakers.",
    },
    {
      kind: "interact",
      sim: "routing-puzzle",
      prompt: "Connect the signal chain correctly",
    },
    {
      kind: "quiz",
      q: "Gain staging at the DJ mixer means",
      options: ["Setting the crossfader to centre", "Setting channel gains so peaks hit an appropriate level without clipping", "Making the master as loud as possible", "Setting the EQ to flat"],
      answer: 1,
      explain: "Proper gain staging ensures the signal from each CDJ hits the mixer at an appropriate level — enough to be clean, not so much that it clips.",
    },
    {
      kind: "quiz",
      q: "The booth monitor speaker is",
      options: ["The same as the main floor speakers", "An independent speaker in the DJ booth for the DJ to monitor their mix", "A speaker for the crowd", "A backup for when main speakers fail"],
      answer: 1,
      explain: "The booth monitor is a speaker only the DJ hears — for clear monitoring without depending on the main floor speakers.",
    },
    {
      kind: "quiz",
      q: "The input selector on a DJ mixer (LINE vs PHONO) controls",
      options: ["The EQ curve", "Which type of signal the channel expects — line level from CDJ or phono level from turntable", "The headphone monitoring", "The crossfader"],
      answer: 1,
      explain: "LINE input is for line-level signals (CDJs, controllers). PHONO input is for the lower-level signal from turntable cartridges.",
    },
    {
      kind: "summary",
      learned: ["Signal chain: CDJ → mixer → amp → speakers", "Gain peaks at +3 to +6 dB, never clipping", "Always soundcheck before the crowd arrives"],
    },
  ],


  // ─── 6. DJ CULTURE ────────────────────────────────────────────────────────────
  "dj-culture": [
    {
      kind: "hook",
      emoji: "🏙️",
      headline: "From the Bronx to the whole world",
      subtext: "DJ culture was born in Black and underground communities.",
    },
    {
      kind: "concept",
      title: "Hip-hop DJing is born",
      body: "In 1973, Kool Herc isolated and extended drum breaks using two copies of the same record at Bronx block parties. This single innovation birthed hip-hop DJing.",
      keyFact: "Kool Herc + two copies + the break = hip-hop is born.",
      visual: "vinyl-platter",
    },
    {
      kind: "concept",
      title: "House and techno origins",
      body: "House emerged from Chicago's underground clubs in the late 1970s–80s (Frankie Knuckles, The Warehouse). Techno was developed in Detroit by the Belleville Three.",
      keyFact: "House = Chicago warehouse. Techno = Detroit. Both underground.",
    },
    {
      kind: "interact",
      sim: "none",
      prompt: "Think about why DJ culture matters to you",
    },
    {
      kind: "quiz",
      q: "Kool Herc contribution to DJing was",
      options: ["Inventing the CDJ", "Extending drum breaks by using two copies of the same record — giving birth to hip-hop DJing", "Founding the first DJ school", "Creating rekordbox"],
      answer: 1,
      explain: "Kool Herc isolated and extended the drum break section of funk records using two copies. This technique was the foundation of hip-hop DJing.",
    },
    {
      kind: "quiz",
      q: "House music emerged from",
      options: ["London rock clubs", "Chicago underground clubs in the late 1970s–80s — Frankie Knuckles, Larry Levan, Ron Hardy", "New York jazz clubs", "Los Angeles hip-hop parties"],
      answer: 1,
      explain: "House music grew from Chicago underground clubs — The Warehouse, The Music Box.",
    },
    {
      kind: "quiz",
      q: "Techno music originated in",
      options: ["New York", "Detroit — Juan Atkins, Derrick May, Kevin Saunderson (The Belleville Three)", "Chicago", "London"],
      answer: 1,
      explain: "Techno was developed in Detroit by the Belleville Three.",
    },
    {
      kind: "summary",
      learned: ["Kool Herc extended breaks — hip-hop DJing born 1973", "House = Chicago warehouse culture, late 70s–80s", "Techno = Detroit, the Belleville Three"],
    },
  ],


  // ─── 7. GENRE BPM REFERENCE ───────────────────────────────────────────────────
  "genre-bpm-reference": [
    {
      kind: "hook",
      emoji: "⚡",
      headline: "Every genre has its own tempo signature",
      subtext: "Knowing BPM ranges lets you mix without extreme pitch shifts.",
    },
    {
      kind: "concept",
      title: "The BPM spectrum",
      body: "Hip-hop sits at 70–100 BPM. House runs at 120–130. Techno at 130–145. Drum and bass at 160–180. Knowing these ranges guides mixing and track selection.",
      keyFact: "House: 120–130. Techno: 130–145. DnB: 160–180.",
      visual: "bpm-grid",
    },
    {
      kind: "concept",
      title: "Half-time feel explained",
      body: "Trap is technically 130–150 BPM but the kick and snare pattern creates a half-time feel — it grooves at 65–75 BPM. Dubstep works similarly at 138–142 BPM.",
      keyFact: "Half-time: groove feels half as fast as the technical BPM.",
    },
    {
      kind: "interact",
      sim: "bpm-tap",
      prompt: "Tap the beat — identify the BPM",
    },
    {
      kind: "quiz",
      q: "Standard house music runs at approximately",
      options: ["90–100 BPM", "120–130 BPM", "150–165 BPM", "170–180 BPM"],
      answer: 1,
      explain: "House music typically runs at 120–130 BPM — four-on-the-floor kick drum at this tempo.",
    },
    {
      kind: "quiz",
      q: "Drum and bass runs at",
      options: ["120–130 BPM", "140–150 BPM", "160–180 BPM", "200+ BPM"],
      answer: 2,
      explain: "Drum and bass typically runs at 160–180 BPM — the fastest mainstream dance genre.",
    },
    {
      kind: "quiz",
      q: "Trap music is listed at 130–150 BPM but feels like 65–75 BPM because",
      options: ["The tempo is wrong", "It uses a half-time feel — the kick and snare pattern sounds like half the actual BPM", "Trap is always played at double speed", "It uses 3/4 time"],
      answer: 1,
      explain: "Trap uses a half-time rhythmic feel — the kick and snare land in positions that make the groove feel much slower than the technical BPM.",
    },
    {
      kind: "summary",
      learned: ["House: 120–130 BPM. Techno: 130–145. DnB: 160–180", "Half-time feel makes a track groove slower than its BPM", "BPM ranges guide which tracks can be mixed together"],
    },
  ],


  // ─── 8. YOUR FIRST MIX ────────────────────────────────────────────────────────
  "your-first-mix": [
    {
      kind: "hook",
      emoji: "🚀",
      headline: "Every DJ started with one mix",
      subtext: "Start simple — one clean transition beats ten messy ones.",
    },
    {
      kind: "concept",
      title: "The first-mix method",
      body: "Choose two tracks in the same key and similar BPM. Use SYNC to match tempo. Bring in the incoming track at low volume over 8–16 bars, then cut the outgoing track.",
      keyFact: "Simple first. Same key, same BPM, one clean transition.",
      visual: "waveform-zoom",
    },
    {
      kind: "concept",
      title: "Record and listen back",
      body: "Record every practice session. You cannot accurately evaluate your mixing while performing it. Listening back reveals mistakes you missed in the moment.",
      keyFact: "Record → listen back → identify one fix → repeat.",
    },
    {
      kind: "interact",
      sim: "mixer",
      prompt: "Make your first mix — bring in the second track",
    },
    {
      kind: "quiz",
      q: "The best approach for your first mix is",
      options: ["Choose the most complex tracks possible", "Start with two tracks in the same key and similar BPM and focus on a clean basic transition", "Use every effect available", "Mix tracks in random keys"],
      answer: 1,
      explain: "Start simple. Two compatible tracks. One clean transition. Complexity comes with practice.",
    },
    {
      kind: "quiz",
      q: "Why record practice sessions?",
      options: ["To post immediately online", "To listen back critically — you hear things you cannot notice in the moment", "Recording improves technique automatically", "So you never need to practice again"],
      answer: 1,
      explain: "You cannot accurately evaluate your mixing while you are also doing it. Recording and listening back reveals mistakes you missed in the moment.",
    },
    {
      kind: "quiz",
      q: "Using SYNC to beatmatch for your first mixes is",
      options: ["Cheating and should be avoided completely", "Acceptable — it lets you focus on other aspects like EQ and timing while learning the basics", "Only for advanced DJs", "The same as manual beatmatching"],
      answer: 1,
      explain: "SYNC removes the complexity of manual BPM matching so you can focus on EQ blending, timing, and track selection.",
    },
    {
      kind: "summary",
      learned: ["Start with same-key, similar-BPM tracks", "SYNC is acceptable while learning other skills", "Record every session and listen back critically"],
      badge: { slug: "first-mix", name: "First Mix" },
    },
  ],


  // ─── 9. MUSIC LIBRARY DJ ──────────────────────────────────────────────────────
  "music-library-dj": [
    {
      kind: "hook",
      emoji: "🗂️",
      headline: "Your collection is your instrument",
      subtext: "A DJ is only as good as the music they carry.",
    },
    {
      kind: "concept",
      title: "Format and quality",
      body: "WAV or AIFF gives the best quality. 320 kbps MP3 is acceptable. Never use low-bitrate files — club sound systems expose every flaw in audio quality.",
      keyFact: "WAV/AIFF = best. 320 kbps MP3 = acceptable minimum.",
      visual: "waveform",
    },
    {
      kind: "concept",
      title: "Know your music deeply",
      body: "1000 tracks you know deeply is far more useful than 10,000 tracks you cannot navigate under pressure at 2am. Depth beats size every time.",
      keyFact: "Know 1000 deeply > own 10,000 half-known.",
    },
    {
      kind: "interact",
      sim: "browser-tour",
      prompt: "Browse and organise a music collection",
    },
    {
      kind: "quiz",
      q: "The best audio format for DJ use is",
      options: ["128 kbps MP3", "YouTube rips", "WAV or AIFF or minimum 320 kbps MP3", "Any format is fine"],
      answer: 2,
      explain: "WAV/AIFF is uncompressed and sounds best on a club sound system. 320 kbps MP3 is acceptable.",
    },
    {
      kind: "quiz",
      q: "Why should you know your music deeply rather than just owning many tracks?",
      options: ["Having more tracks is always better", "You need to recall the right track instantly under pressure", "It is only about the quantity", "Modern software selects tracks automatically"],
      answer: 1,
      explain: "Under the pressure of a live set you need to recall the right track instantly.",
    },
    {
      kind: "quiz",
      q: "How many backup copies of your music library should you maintain?",
      options: ["None — your computer is reliable", "One backup is enough", "At least two copies in separate locations", "Ten copies minimum"],
      answer: 2,
      explain: "Minimum: primary drive + external backup + cloud backup. Hard drives fail.",
    },
    {
      kind: "summary",
      learned: ["Use WAV/AIFF or 320 kbps MP3 minimum", "Know your music deeply — recall under pressure", "Keep at least two backups in separate locations"],
    },
  ],


  // ─── 10. BPM ANALYSIS DJ ─────────────────────────────────────────────────────
  "bpm-analysis-dj": [
    {
      kind: "hook",
      emoji: "🥁",
      headline: "Every track has a tempo — find it",
      subtext: "Beat grids power SYNC, cue points, and loop accuracy.",
    },
    {
      kind: "concept",
      title: "Auto-analysis and beat grids",
      body: "rekordbox analyses BPM automatically when you import a track and draws a beat grid — a visual overlay showing where every beat falls in the waveform.",
      keyFact: "Beat grid = map of every beat. Inaccurate grid = broken SYNC.",
      visual: "waveform-zoom",
    },
    {
      kind: "concept",
      title: "Common grid errors",
      body: "Complex rhythms, tempo changes, or unusual time signatures can cause incorrect grid detection. Always verify grids for tracks you plan to SYNC — especially drum and bass (often detected at half BPM).",
      keyFact: "DnB at 85 BPM? Hit x2. The real tempo is 170.",
    },
    {
      kind: "interact",
      sim: "bpm-tap",
      prompt: "Tap to find the BPM manually",
    },
    {
      kind: "quiz",
      q: "A beat grid in rekordbox is",
      options: ["A playlist organiser", "A visual overlay showing where beats fall in the waveform", "A type of audio effect", "The export menu"],
      answer: 1,
      explain: "The beat grid shows the position of each beat. Accurate grids are essential for SYNC.",
    },
    {
      kind: "quiz",
      q: "When might rekordbox analyse BPM incorrectly?",
      options: ["Never — it is always accurate", "For tracks with complex rhythms significant tempo changes or unusual time signatures", "Only for old tracks", "Only when your computer is slow"],
      answer: 1,
      explain: "rekordbox auto-analysis is highly accurate for steady-tempo 4/4 music. Complex rhythms may have grid errors.",
    },
    {
      kind: "quiz",
      q: "Why must beat grids be accurate for SYNC to work?",
      options: ["They do not affect SYNC", "SYNC aligns beats using the grid — an inaccurate grid causes SYNC to misalign beats even with correct BPM", "Only manual beatmatching uses the grid", "Grids only affect cue points"],
      answer: 1,
      explain: "SYNC locks the beat position using the beat grid. If the grid is wrong SYNC will be wrong.",
    },
    {
      kind: "summary",
      learned: ["rekordbox auto-analyses BPM on import", "Beat grid shows where every beat falls", "Verify grids before SYNC — especially for DnB"],
    },
  ],


  // ─── 11. KEY DETECTION DJ ────────────────────────────────────────────────────
  "key-detection-dj": [
    {
      kind: "hook",
      emoji: "🔑",
      headline: "Mixing in key makes transitions musical",
      subtext: "Wrong keys clash. Right keys flow. rekordbox shows you both.",
    },
    {
      kind: "concept",
      title: "Key display and Camelot",
      body: "rekordbox displays every track's key in standard notation (Am, Cmaj) and Camelot notation (8A, 5B). Adjacent Camelot numbers are harmonically compatible.",
      keyFact: "Camelot: same number = compatible. Adjacent number = smooth move.",
      visual: "camelot-wheel",
    },
    {
      kind: "concept",
      title: "Compatible key moves",
      body: "Mixing 8A into 8A or 8B is seamless. Moving to 9A creates a subtle energy boost (a fifth relationship). Moving to 7A creates a small tension release.",
      keyFact: "Clockwise = energy lift. Same position = seamless blend.",
    },
    {
      kind: "interact",
      sim: "harmonic-mix-wheel",
      prompt: "Select a compatible key move on the Camelot wheel",
    },
    {
      kind: "quiz",
      q: "The Camelot Wheel adjacent rule means",
      options: ["Tracks at opposite positions always clash", "Tracks one position away are harmonically compatible for smooth transitions", "Only exact same key works", "Key does not matter for electronic music"],
      answer: 1,
      explain: "Adjacent positions on the Camelot Wheel share many notes and create musically smooth transitions.",
    },
    {
      kind: "quiz",
      q: "Moving one step clockwise on the Camelot Wheel (e.g. 8A to 9A) creates",
      options: ["A key clash", "A subtle energy boost — a perfect fifth relationship that feels like a lift", "No harmonic change", "A descent in energy"],
      answer: 1,
      explain: "Moving one position clockwise is a perfect fifth relationship — harmonically smooth and creates a subtle energy uplift.",
    },
    {
      kind: "quiz",
      q: "Key detection in rekordbox helps DJs by",
      options: ["Setting the BPM automatically", "Showing which tracks are harmonically compatible before you hear them", "Replacing the need to learn music theory", "Auto-mixing all tracks"],
      answer: 1,
      explain: "Key detection lets you see harmonic relationships in your library before committing to a transition.",
    },
    {
      kind: "summary",
      learned: ["rekordbox shows key in standard and Camelot notation", "Same Camelot number = seamless. Adjacent = compatible", "Clockwise one step = subtle energy boost"],
    },
  ],


  // ─── 12. MY TAGS DJ ───────────────────────────────────────────────────────────
  "my-tags-dj": [
    {
      kind: "hook",
      emoji: "🏷️",
      headline: "Label your music — find it instantly at 2am",
      subtext: "My Tags are your custom colour-coded track labels in rekordbox.",
    },
    {
      kind: "concept",
      title: "My Tags system",
      body: "My Tags in rekordbox let you create custom colour-coded labels: Peak Hour, Warm Up, Closing, Request, New, Classic. One track can carry multiple tags.",
      keyFact: "One track, multiple tags. Filter by any of them instantly.",
    },
    {
      kind: "concept",
      title: "Filtering in real time",
      body: "During a set you can filter your entire library by any tag — showing only Peak Hour tracks, or only Closing tracks, instantly. Your Comment field stores personal transition notes.",
      keyFact: "Filter live → only relevant tracks visible under pressure.",
    },
    {
      kind: "interact",
      sim: "browser-tour",
      prompt: "Tag tracks and filter by tag",
    },
    {
      kind: "quiz",
      q: "rekordbox My Tags allow you to",
      options: ["Export music to iTunes", "Apply custom labels to tracks for quick filtering during a set", "Auto-mix tracks", "Change a track key"],
      answer: 1,
      explain: "My Tags are custom labels you apply to tracks. Filter by tag in real-time during a set.",
    },
    {
      kind: "quiz",
      q: "Why is having multiple tags on a track useful?",
      options: ["It makes the library harder to search", "A track can belong to multiple categories — filtering by any of them will show it", "Multiple tags slow down rekordbox", "Only one tag is allowed per track"],
      answer: 1,
      explain: "A peak-hour classic at 128 BPM can be tagged as Peak Hour, Classic, and 128BPM. Any of those filters will surface it.",
    },
    {
      kind: "quiz",
      q: "When should you build your tagging system?",
      options: ["The day before a gig", "Gradually over time as you add music — before you need it under pressure", "Only after you have 1000 tracks", "Tagging is not necessary"],
      answer: 1,
      explain: "Build your tagging system gradually as you add music. Trying to tag thousands of tracks at once is overwhelming.",
    },
    {
      kind: "summary",
      learned: ["My Tags = custom colour labels for tracks", "One track can have multiple tags for flexible filtering", "Build tags gradually — not all at once"],
    },
  ],


  // ─── 13. PLAYLISTS DJ ────────────────────────────────────────────────────────
  "playlists-dj": [
    {
      kind: "hook",
      emoji: "📋",
      headline: "Prepare 60 perfect tracks, not 5000 random ones",
      subtext: "Focused playlists let you concentrate on energy, not searching.",
    },
    {
      kind: "concept",
      title: "Playlist organisation strategy",
      body: "Organise playlists by genre (House, Techno, DnB), by energy level (Warm Up, Build, Peak, Wind Down), and by venue or event type for specific gigs.",
      keyFact: "Genre + energy + venue = complete playlist system.",
    },
    {
      kind: "concept",
      title: "History and focused set playlists",
      body: "rekordbox automatically logs every track you play with timestamps. Prepare a focused 50–100 track playlist for each gig — narrow choices force deliberate curation.",
      keyFact: "History log auto-records every played track. Review it.",
    },
    {
      kind: "interact",
      sim: "browser-tour",
      prompt: "Create and organise a set playlist",
    },
    {
      kind: "quiz",
      q: "A good playlist organisation strategy includes",
      options: ["Putting every track in one giant list", "Separating by genre energy level venue type and prepared set playlists", "Only using Auto-Playlists", "Avoiding playlists — browse the full library always"],
      answer: 1,
      explain: "A well-organised playlist structure separates music by genre, energy level, and context.",
    },
    {
      kind: "quiz",
      q: "What does the rekordbox History log do?",
      options: ["Deletes old tracks", "Automatically records which tracks you have played and when", "Creates automatic playlists", "Exports your set as audio"],
      answer: 1,
      explain: "rekordbox History automatically logs every track you play with timestamps.",
    },
    {
      kind: "quiz",
      q: "For a specific gig preparing a focused playlist of 50–100 tracks means",
      options: ["You have fewer choices which is worse", "You can focus on energy and transitions rather than searching — and make more deliberate choices", "It limits your creativity", "The full library is always better"],
      answer: 1,
      explain: "Narrowing your options forces deliberate curation and means you are never lost searching during a set.",
    },
    {
      kind: "summary",
      learned: ["Organise by genre, energy level, and venue", "rekordbox History auto-logs every played track", "50–100 focused tracks beats navigating 5000 live"],
    },
  ],


  // ─── 14. CRATE DIGGING ───────────────────────────────────────────────────────
  "crate-digging": [
    {
      kind: "hook",
      emoji: "🪣",
      headline: "Have music no one else has",
      subtext: "Crate digging is the soul of DJing — and your competitive edge.",
    },
    {
      kind: "concept",
      title: "What crate digging is",
      body: "Originally searching through physical record crates in shops, crate digging now spans Beatport, Bandcamp, Juno, Traxsource, DJ charts, and label watch lists.",
      keyFact: "Exclusive music = unique moments only you can create.",
      visual: "vinyl-platter",
    },
    {
      kind: "concept",
      title: "Sources and strategy",
      body: "Follow labels you love — if you love four releases, trust the fifth. Study top DJ monthly charts to see what's cutting-edge. Mix and radio show sets reveal tracks before release.",
      keyFact: "Labels have a sound. Trust the ones you already love.",
    },
    {
      kind: "interact",
      sim: "none",
      prompt: "Plan your crate digging strategy",
    },
    {
      kind: "quiz",
      q: "Crate digging in modern DJing means",
      options: ["Storing physical records in wooden crates", "Actively seeking out new and interesting music across various sources", "Deleting old tracks from your library", "Organising your collection alphabetically"],
      answer: 1,
      explain: "Crate digging is the practice of actively searching for music.",
    },
    {
      kind: "quiz",
      q: "Following record label releases is useful because",
      options: ["Labels pay DJs to promote their music", "If you love a label output you can trust their new releases to be compatible with your style", "Labels provide free music", "Labels decide which DJs get bookings"],
      answer: 1,
      explain: "Record labels have a distinctive sound. If you love four releases from a label the fifth is likely relevant to your sets.",
    },
    {
      kind: "quiz",
      q: "Having exclusive or rare music others do not have is valuable because",
      options: ["It is illegal to share otherwise", "It creates unique moments in sets that only you can deliver — differentiation", "It impresses only other DJs", "Exclusive music always sounds better technically"],
      answer: 1,
      explain: "Playing a track that no one else has creates a special moment.",
    },
    {
      kind: "summary",
      learned: ["Crate dig across Beatport, Bandcamp, Juno, Traxsource", "Follow labels you love — trust their new releases", "Exclusive music creates unrepeatable moments"],
      badge: { slug: "crate-digger", name: "Crate Digger" },
    },
  ],


  // ─── 15. EXPORT MODE DJ ──────────────────────────────────────────────────────
  "export-mode-dj": [
    {
      kind: "hook",
      emoji: "💾",
      headline: "Prepare your USB — own any CDJ booth",
      subtext: "EXPORT mode is your bridge from laptop to club hardware.",
    },
    {
      kind: "concept",
      title: "The EXPORT workflow",
      body: "Import → auto-analysis → verify beat grids → set memory cues → organise playlists → export to USB via SYNC MANAGER. Every step matters.",
      keyFact: "In order: import, analyse, grids, cues, organise, export.",
      visual: "waveform-zoom",
    },
    {
      kind: "concept",
      title: "Always bring two USBs",
      body: "Hardware fails at the worst possible moments. Export an identical copy to a second USB drive. One is your primary; the other is your insurance policy.",
      keyFact: "Two identical USBs. One fails → plug in the other. Never stop.",
    },
    {
      kind: "interact",
      sim: "browser-tour",
      prompt: "Export a playlist to a USB drive",
    },
    {
      kind: "quiz",
      q: "What is the correct order of EXPORT mode preparation?",
      options: ["Export first then analyse", "Import analyse verify grids set cue points organise export to USB", "Set cue points before importing", "Only export — rekordbox handles the rest"],
      answer: 1,
      explain: "The correct workflow: import → auto-analysis → verify beat grids → set memory cues → organise → export.",
    },
    {
      kind: "quiz",
      q: "Why should you verify beat grids before exporting?",
      options: ["It is not necessary", "Incorrect grids cause SYNC to misalign beats — all cue points dependent on the grid will be wrong", "To improve sound quality", "To reduce file size"],
      answer: 1,
      explain: "Beat grids determine where SYNC locks beats and where bar-aligned cue points sit.",
    },
    {
      kind: "quiz",
      q: "Why bring two USB drives to a gig?",
      options: ["You need one per CDJ", "One is a backup in case the primary fails", "One for the opening act", "Required by Pioneer DJ"],
      answer: 1,
      explain: "Hardware fails at the worst moments. A backup USB ensures a technical failure does not end your set.",
    },
    {
      kind: "summary",
      learned: ["EXPORT: import → analyse → grids → cues → export", "Memory cues mark: intro, drop, breakdown, outro", "Always bring two identical USB drives"],
    },
  ],


  // ─── 16. WAVEFORM READING ────────────────────────────────────────────────────
  "waveform-reading": [
    {
      kind: "hook",
      emoji: "📡",
      headline: "See the music before you hear it",
      subtext: "Waveforms show structure, energy, and frequency at a glance.",
    },
    {
      kind: "concept",
      title: "Reading waveform density",
      body: "A dense, tall waveform section is a full arrangement — drop, chorus, main body. A sparse, short waveform section is a breakdown, intro, or outro.",
      keyFact: "Dense + tall = busy. Sparse + short = quiet/breakdown.",
      visual: "waveform-zoom",
    },
    {
      kind: "concept",
      title: "Colour waveforms",
      body: "On Pioneer CDJ colour waveforms: blue/green represents sub and bass frequencies; red/orange represents midrange; yellow/bright represents high-frequency treble content.",
      keyFact: "Blue = bass. Yellow = treble. Read colour to read frequency.",
    },
    {
      kind: "interact",
      sim: "none",
      prompt: "Identify a breakdown from the waveform shape",
    },
    {
      kind: "quiz",
      q: "A dense packed section of a waveform indicates",
      options: ["A quiet breakdown", "A full busy arrangement — drop chorus or main body of the track", "Technical corruption in the file", "The end of the track"],
      answer: 1,
      explain: "Dense waveform sections have high amplitude from many simultaneous sound sources.",
    },
    {
      kind: "quiz",
      q: "On colour waveforms blue/green represents",
      options: ["High frequency treble content", "Low frequency bass and sub-bass content", "Mid-range frequencies", "Noise and distortion"],
      answer: 1,
      explain: "On Pioneer CDJ colour waveforms blue/purple represents sub and bass frequencies.",
    },
    {
      kind: "quiz",
      q: "The main advantage of reading waveforms is",
      options: ["It looks impressive to the audience", "You can anticipate what is coming in the track before you hear it", "It automatically sets cue points", "It improves audio quality"],
      answer: 1,
      explain: "Reading waveforms lets you see breakdowns, drops, and outros coming before you hear them.",
    },
    {
      kind: "summary",
      learned: ["Dense waveform = busy. Sparse = quiet or breakdown", "Blue = bass. Yellow = treble on colour waveforms", "See the drop or breakdown coming — prepare, not react"],
      badge: { slug: "waveform-reader", name: "Waveform Reader" },
    },
  ],


  // ─── 17. BEATMATCHING MANUAL ─────────────────────────────────────────────────
  "beatmatching-manual": [
    {
      kind: "hook",
      emoji: "🥁",
      headline: "Lock two tracks — with your ears",
      subtext: "Manual beatmatching is the foundational technique of DJing.",
    },
    {
      kind: "concept",
      title: "The beatmatching process",
      body: "Listen in headphones. Is the incoming track faster or slower? Adjust the pitch fader. Then nudge the jog wheel to align beat position. When both kick drums lock and stop fluttering — you are beatmatched.",
      keyFact: "Faster incoming = lower pitch fader. Nudge jog to align phase.",
      visual: "bpm-grid",
    },
    {
      kind: "concept",
      title: "Pitch fader vs jog wheel",
      body: "The pitch fader changes the permanent BPM. The jog wheel nudges the track forward or back momentarily — adjusting beat phase without changing the tempo.",
      keyFact: "Pitch fader = speed. Jog wheel = position. Both are needed.",
    },
    {
      kind: "interact",
      sim: "beatmatch-trainer",
      prompt: "Beatmatch two tracks using pitch and jog",
    },
    {
      kind: "quiz",
      q: "Beatmatching means",
      options: ["Playing two tracks at the same volume", "Aligning the tempo and beat position of two tracks so they play in rhythmic alignment", "Finding tracks with the same key", "Cutting between tracks suddenly"],
      answer: 1,
      explain: "Beatmatching = syncing BPM and beat phase so two tracks play in rhythmic alignment.",
    },
    {
      kind: "quiz",
      q: "If the incoming track is running faster than the master you",
      options: ["Increase the pitch fader", "Decrease the pitch fader to slow the incoming track down", "Use SYNC immediately", "Stop and restart the track"],
      answer: 1,
      explain: "If the incoming track is too fast it will pull ahead of the master. Lower the pitch fader to reduce its BPM until it matches.",
    },
    {
      kind: "quiz",
      q: "The jog wheel is used in beatmatching to",
      options: ["Change the track key", "Fine-tune beat position — nudging ahead or back without changing BPM", "Set cue points", "Adjust the EQ"],
      answer: 1,
      explain: "The jog wheel nudges the track forward or back momentarily adjusting beat position without permanently changing BPM.",
    },
    {
      kind: "summary",
      learned: ["Pitch fader = speed. Jog wheel = beat position", "Faster incoming = lower pitch fader", "Listen for kick drums to lock — stop the flutter"],
      badge: { slug: "beat-surgeon", name: "Beat Surgeon" },
    },
  ],


  // ─── 18. SYNC FUNCTION ───────────────────────────────────────────────────────
  "sync-function": [
    {
      kind: "hook",
      emoji: "🔗",
      headline: "SYNC locks beats so you focus elsewhere",
      subtext: "Automatic beatmatching — a tool, not a shortcut.",
    },
    {
      kind: "concept",
      title: "How SYNC works",
      body: "The SYNC button automatically matches the BPM and beat phase of the incoming deck to the master deck using beat grid data. One deck is always the master tempo reference.",
      keyFact: "SYNC = automatic BPM + phase lock. Grid must be accurate.",
      visual: "bpm-grid",
    },
    {
      kind: "concept",
      title: "When to use SYNC",
      body: "SYNC is most useful when your hands are busy managing EQ transitions or effects. SYNC is least useful when a track has an incorrect or missing beat grid.",
      keyFact: "SYNC frees hands. Bad grid = SYNC fails. Learn manual too.",
    },
    {
      kind: "interact",
      sim: "beatmatch-trainer",
      prompt: "Compare SYNC vs manual beatmatching",
    },
    {
      kind: "quiz",
      q: "The SYNC button on DJ equipment",
      options: ["Records your set", "Automatically matches the BPM and phase of the incoming deck to the master", "Changes the musical key", "Activates effects"],
      answer: 1,
      explain: "SYNC automatically beatmatches the incoming deck to the master tempo reference.",
    },
    {
      kind: "quiz",
      q: "SYNC requires accurate beat grids because",
      options: ["It is a visual feature", "SYNC uses the grid to determine where beats are — wrong grid means SYNC aligns to the wrong position", "Beat grids affect audio quality", "SYNC works better with grids"],
      answer: 1,
      explain: "SYNC aligns beats using the beat grid data. If the grid is inaccurate SYNC will lock the tracks perfectly out of phase.",
    },
    {
      kind: "quiz",
      q: "Which situation is SYNC least suitable for?",
      options: ["Four-deck mixing", "A track with an incorrect or missing beat grid", "Playing in a club with CDJs", "Using EQ while mixing"],
      answer: 1,
      explain: "SYNC relies entirely on accurate beat grid data. A track with no grid or wrong grid cannot be SYNCd.",
    },
    {
      kind: "summary",
      learned: ["SYNC auto-matches BPM and beat phase to master", "Needs accurate beat grids to work correctly", "Learn manual beatmatching alongside SYNC"],
    },
  ],


  // ─── 19. CUE POINTS DJ ───────────────────────────────────────────────────────
  "cue-points-dj": [
    {
      kind: "hook",
      emoji: "📌",
      headline: "Bookmark your tracks — jump to any moment",
      subtext: "Cue points are your navigation system inside every track.",
    },
    {
      kind: "concept",
      title: "Memory cues and hot cues",
      body: "Memory cues are saved in rekordbox and exported to USB — available on any club CDJ. Hot cues give you up to 8 instant-jump performance buttons per deck.",
      keyFact: "Memory cues = permanent. Hot cues = instant performance triggers.",
      visual: "waveform-zoom",
    },
    {
      kind: "concept",
      title: "Where to set cue points",
      body: "Mark key structural moments: intro beat 1, first drop, main breakdown, outro start. These four positions let you navigate any track instantly under pressure.",
      keyFact: "Intro → drop → breakdown → outro. Four cues, total coverage.",
    },
    {
      kind: "interact",
      sim: "hot-cue-drill",
      prompt: "Set and trigger hot cues on a track",
    },
    {
      kind: "quiz",
      q: "A cue point in DJing is",
      options: ["A type of audio effect", "A saved position in a track for instant playback from that point", "The BPM of a track", "A playlist type"],
      answer: 1,
      explain: "A cue point is a bookmark at a specific position in a track.",
    },
    {
      kind: "quiz",
      q: "Memory cues saved in rekordbox",
      options: ["Only work in software not on CDJs", "Travel with your USB and appear on any club CDJ you plug into", "Are deleted after each session", "Cannot be exported"],
      answer: 1,
      explain: "rekordbox memory cues are stored in your library and exported to USB.",
    },
    {
      kind: "quiz",
      q: "Hot cue buttons allow you to",
      options: ["Add reverb effects", "Instantly jump to up to 8 different positions in a track during performance", "Export your music library", "Slow down a track gradually"],
      answer: 1,
      explain: "Hot cues (up to 8 per deck) are performance-focused cue triggers. Pressing one during playback jumps to the saved position instantly.",
    },
    {
      kind: "summary",
      learned: ["Memory cues export to USB — work on any CDJ", "Hot cues = up to 8 instant jump buttons per deck", "Set cues at: intro, drop, breakdown, outro"],
    },
  ],


  // ─── 20. EQ MIXING DJ ────────────────────────────────────────────────────────
  "eq-mixing-dj": [
    {
      kind: "hook",
      emoji: "🎚️",
      headline: "Never two bass lines at full volume",
      subtext: "The three-band EQ swap is the core technique of professional DJ mixing.",
    },
    {
      kind: "concept",
      title: "Three-band EQ and the bass swap",
      body: "Low (bass), Mid (main content), High (treble). The bass swap: cut Low on the incoming track, build it up, then simultaneously swap — Low up on incoming, Low down on outgoing.",
      keyFact: "Two full bass lines = mud. Swap one for the other.",
      visual: "mixer-channel",
    },
    {
      kind: "concept",
      title: "Bass clash explained",
      body: "Bass frequencies are the most powerful in a mix. Two full bass lines simultaneously create an overwhelming, muddy, distorted sound that destroys a mix. The bass swap prevents this.",
      keyFact: "Bass clash = muddiness and distortion. Avoid it always.",
    },
    {
      kind: "interact",
      sim: "mixer",
      prompt: "Perform a three-band EQ bass swap",
    },
    {
      kind: "quiz",
      q: "The bass swap technique means",
      options: ["Swapping the tracks on each deck", "Cutting bass on the incoming track then swapping to give the incoming track full bass and cut it from the outgoing", "Playing two bass lines at maximum volume together", "Using an external bass boost"],
      answer: 1,
      explain: "The bass swap cuts Low EQ on the incoming track then flips: incoming bass up, outgoing bass down.",
    },
    {
      kind: "quiz",
      q: "Why is bass clash a problem?",
      options: ["It only affects professional sound systems", "Two bass lines at full volume simultaneously creates overwhelming muddy distorted sound", "Bass clash improves the energy", "It only happens with certain genres"],
      answer: 1,
      explain: "Two full bass lines create a muddy distorted overwhelming sound — always avoid it.",
    },
    {
      kind: "quiz",
      q: "Mid EQ cuts during a mix can prevent",
      options: ["Tempo drift", "Harmonic and melodic clash between two tracks playing simultaneously", "Beat grid errors", "BPM mismatches"],
      answer: 1,
      explain: "When two tracks play simultaneously their midrange content can clash if they are in different keys. Reducing the mid of the outgoing track reduces this clash.",
    },
    {
      kind: "summary",
      learned: ["Never two full bass lines simultaneously — always bass swap", "Low = kick/bass. Mid = chords/vocals. High = hi-hats", "Cut mid on outgoing to prevent harmonic clash"],
    },
  ],


  // ─── 21. CROSSFADER TECHNIQUE ────────────────────────────────────────────────
  "crossfader-technique": [
    {
      kind: "hook",
      emoji: "⚖️",
      headline: "Blend or cut — one fader rules them all",
      subtext: "The crossfader moves sound from one channel to the other.",
    },
    {
      kind: "concept",
      title: "How the crossfader works",
      body: "Fully left = only Deck A. Fully right = only Deck B. Centre = equal blend. Move slowly for a blend. Move sharply on the downbeat for a cut.",
      keyFact: "Left = A. Right = B. Centre = both. Speed = style.",
      visual: "mixer-channel",
    },
    {
      kind: "concept",
      title: "Crossfader curve and style",
      body: "Sharp (battle) curve for cutting and scratching — immediate transition. Smooth (blend) curve for gradual long crossfades. Professional electronic music DJs rarely use the crossfader — channel faders and EQ do the work.",
      keyFact: "House/techno = channel faders. Hip-hop = crossfader cuts.",
    },
    {
      kind: "interact",
      sim: "mixer",
      prompt: "Blend with the crossfader — sharp cut vs slow blend",
    },
    {
      kind: "quiz",
      q: "The crossfader at centre position means",
      options: ["Only Deck A is heard", "Equal blend of both channels", "Both tracks are muted", "The master is muted"],
      answer: 1,
      explain: "Crossfader centre = equal volume from both channels. Fully left = only Deck A. Fully right = only Deck B.",
    },
    {
      kind: "quiz",
      q: "Crossfader curve adjustment controls",
      options: ["The BPM matching", "How sharply the crossfader cuts between channels — sharp for cutting hip-hop smooth for blending house", "The key of the tracks", "The monitor volume"],
      answer: 1,
      explain: "Sharp (battle) curve is for cutting and scratching. Smooth (blend) curve is for long gradual crossfades.",
    },
    {
      kind: "quiz",
      q: "In professional club DJing with electronic music the crossfader is used",
      options: ["Constantly and dramatically", "Rarely — most blending uses channel faders and EQ rather than the crossfader", "To set the BPM", "Only for headphone monitoring"],
      answer: 1,
      explain: "Professional electronic music DJs primarily use channel faders and EQ to blend.",
    },
    {
      kind: "summary",
      learned: ["Crossfader: left = A, right = B, centre = blend", "Sharp curve = cutting/scratching. Smooth = blending", "House/techno DJs use channel faders, not crossfader"],
    },
  ],


  // ─── 22. LONG MIX BLEND ──────────────────────────────────────────────────────
  "long-mix-blend": [
    {
      kind: "hook",
      emoji: "🌊",
      headline: "The crowd never notices the track changed",
      subtext: "Long blends flow from one track to the next over 16–32 bars.",
    },
    {
      kind: "concept",
      title: "How the long mix works",
      body: "Incoming track starts with bass cut. Over 16–32 bars the channel fader rises gradually. At the midpoint: do the bass swap. Outgoing fader falls. Done.",
      keyFact: "16–32 bars. Incoming rises. Bass swap mid-mix. Outgoing falls.",
      visual: "waveform-zoom",
    },
    {
      kind: "concept",
      title: "DJ-friendly track structure",
      body: "Most dance music is structured for DJs. DJ tool tracks have long intros and outros (32 bars+) designed as mixing zones. Learn to identify them by waveform shape.",
      keyFact: "Long sparse intro + outro = DJ-friendly track. Use those zones.",
    },
    {
      kind: "interact",
      sim: "mixer",
      prompt: "Perform a smooth long blend transition",
    },
    {
      kind: "quiz",
      q: "A long mix transition involves",
      options: ["Cutting sharply between tracks", "Gradually blending two tracks over 16–32 bars", "Playing one track twice", "Using a reverb effect only"],
      answer: 1,
      explain: "The long mix gradually crossfades two tracks over a long period. Classic for house and techno.",
    },
    {
      kind: "quiz",
      q: "When should you cut the outgoing track bass during a long mix?",
      options: ["At the very beginning of the mix", "When the incoming track bass is fully up — doing the bass swap", "Never — keep all frequencies at all times", "Immediately when starting the mix"],
      answer: 1,
      explain: "The bass swap happens mid-transition: incoming track comes up with bass cut then you swap the bass from outgoing to incoming.",
    },
    {
      kind: "quiz",
      q: "DJ-friendly tracks have long intros and outros because",
      options: ["Label requirements", "They are specifically designed to give DJs a safe mixing zone without affecting the crowd-facing sections", "All tracks have long intros", "Intros and outros are padding that adds runtime"],
      answer: 1,
      explain: "DJ-friendly intros and outros give the DJ a safe zone to blend without overlapping the main musical content.",
    },
    {
      kind: "summary",
      learned: ["Long mix: 16–32 bars, gradual blend, bass swap mid-mix", "Start incoming with bass cut, exit before breakdown", "DJ-friendly tracks have 32+ bar mixing zones"],
    },
  ],


  // ─── 23. TRANSITIONS CUT DJ ──────────────────────────────────────────────────
  "transitions-cut-dj": [
    {
      kind: "hook",
      emoji: "✂️",
      headline: "Confidence makes a cut a power move",
      subtext: "Intentional cuts land harder than hesitant blends.",
    },
    {
      kind: "concept",
      title: "The cut transition",
      body: "A cut moves from one track to the next suddenly — on the downbeat of a phrase boundary. The key is precision and confidence. Delivered deliberately, it creates a powerful moment.",
      keyFact: "Precise on the downbeat + confidence = power cut, not train wreck.",
      visual: "bpm-grid",
    },
    {
      kind: "concept",
      title: "Echo out and reverb wash",
      body: "Trigger an echo effect on the last beat before a breakdown — it decays naturally into the new track. Or wash the outgoing track in reverb before cutting to mask the transition.",
      keyFact: "Echo out: musical bridge. Reverb wash: disguises the join.",
    },
    {
      kind: "interact",
      sim: "mixer",
      prompt: "Execute a precise downbeat cut transition",
    },
    {
      kind: "quiz",
      q: "A cut transition is most effective when",
      options: ["Poorly timed and unexpected", "Precisely on the downbeat of a new phrase — delivered with confidence", "Using as many effects as possible", "The crowd is not paying attention"],
      answer: 1,
      explain: "A cut lands powerfully when it is precisely on the musical downbeat of a phrase boundary.",
    },
    {
      kind: "quiz",
      q: "An echo out technique means",
      options: ["Adding echo to the incoming track", "Triggering an echo effect on the outgoing track so it decays naturally into the new track", "Recording with an echo in the room", "Delaying the cut by 8 bars"],
      answer: 1,
      explain: "An echo out lets the outgoing track echo-decay naturally as the incoming track starts.",
    },
    {
      kind: "quiz",
      q: "The difference between a train wreck and a power cut is",
      options: ["The equipment used", "Intention and confidence — a jarring cut delivered deliberately can land powerfully", "The volume level", "The genre of music"],
      answer: 1,
      explain: "A train wreck is an accidental mistake. A power cut is a deliberate choice. The crowd responds to confidence.",
    },
    {
      kind: "summary",
      learned: ["Cut precisely on the downbeat of a phrase boundary", "Echo out bridges the gap naturally", "Confidence = power cut. Hesitation = train wreck"],
    },
  ],


  // ─── 24. LOOP FUNCTION DJ ────────────────────────────────────────────────────
  "loop-function-dj": [
    {
      kind: "hook",
      emoji: "🔁",
      headline: "Capture a moment — hold it forever",
      subtext: "Loops extend breakdowns and buy you unlimited preparation time.",
    },
    {
      kind: "concept",
      title: "Loop basics",
      body: "The loop function captures a section of a track and repeats it indefinitely. Sizes range from 1 beat to 16 bars. Loop halve and double let you tighten or expand while looping.",
      keyFact: "4-bar loop = unlimited time to prepare the next track.",
      visual: "bpm-grid",
    },
    {
      kind: "concept",
      title: "Loop roll",
      body: "A loop roll plays a short repeated section but when you release it, playback returns to where the track would be if it had been playing normally. A rhythmic performance effect, not a sustained hold.",
      keyFact: "Loop roll = temporary rhythmic stutter that snaps back.",
    },
    {
      kind: "interact",
      sim: "loop-roll",
      prompt: "Set a loop and use loop roll",
    },
    {
      kind: "quiz",
      q: "The loop function in DJing is used to",
      options: ["Set the BPM", "Capture and repeat a section of a track indefinitely", "Apply effects", "Set cue points"],
      answer: 1,
      explain: "Looping captures a defined section of a track and plays it repeatedly. Used to extend a moment or buy time.",
    },
    {
      kind: "quiz",
      q: "A loop roll differs from a standard loop because",
      options: ["It is much longer", "It plays a short repeated section and then returns to the main playback position when released — temporary", "It cannot be changed in size", "It only works on CDJ-3000s"],
      answer: 1,
      explain: "A loop roll plays a repeated short section but when you release it playback returns to where the track would be if it had been playing normally.",
    },
    {
      kind: "quiz",
      q: "Loop halve and loop double buttons",
      options: ["Change the BPM", "Halve or double the loop length while staying in loop — great for building tension", "Change the cue point", "Set a new loop from scratch"],
      answer: 1,
      explain: "Loop halve reduces the loop length by half (4 bars to 2 to 1 to 1 beat). Each step increases urgency and tension.",
    },
    {
      kind: "summary",
      learned: ["Loop holds a section indefinitely — buy time to prep", "Loop halve builds tension: 4 → 2 → 1 → 1 beat", "Loop roll = temporary stutter, snaps back to position"],
      badge: { slug: "loop-architect", name: "Loop Architect" },
    },
  ],


  // ─── 25. READING THE CROWD ───────────────────────────────────────────────────
  "reading-the-crowd": [
    {
      kind: "hook",
      emoji: "👁️",
      headline: "The dance floor tells you what to play",
      subtext: "Track selection beats technical skill — every time.",
    },
    {
      kind: "concept",
      title: "Reading body language",
      body: "Watch the dance floor: are people dancing or facing the bar? Grouped or dispersed? Energy rising or fading? Dance floor density and body language are your real-time feedback.",
      keyFact: "People facing the bar = they are not dancing. Read the signals.",
    },
    {
      kind: "concept",
      title: "Time of night matters",
      body: "10pm crowd is arriving, socialising, sober. 2am crowd is in peak mode. 4am crowd is winding down or in a second wind. Each phase needs different music and different energy.",
      keyFact: "10pm ≠ 2am ≠ 4am. Match the crowd's current state.",
    },
    {
      kind: "interact",
      sim: "none",
      prompt: "Assess what this crowd needs right now",
    },
    {
      kind: "quiz",
      q: "The most important non-technical DJ skill is",
      options: ["Scratching", "Reading the room and selecting the right track for the moment", "Knowing every BPM by heart", "Having the newest equipment"],
      answer: 1,
      explain: "Track selection and crowd reading separate great DJs from technically proficient ones.",
    },
    {
      kind: "quiz",
      q: "If people are leaving the dance floor during your track you should",
      options: ["Play it louder", "Continue regardless — the track is too good to change", "Adjust immediately — the crowd is always right", "End the set"],
      answer: 2,
      explain: "The dance floor response is real-time feedback. People leaving = the track is wrong for this moment. Adapt.",
    },
    {
      kind: "quiz",
      q: "A request from the crowd at the booth is",
      options: ["Always annoying and should be ignored", "Direct feedback from the crowd — useful information about what the audience wants", "A sign you should stop playing", "Only relevant at weddings"],
      answer: 1,
      explain: "Crowd requests — even when you cannot play them — tell you what the audience is expecting or craving.",
    },
    {
      kind: "summary",
      learned: ["Watch body language: dancing or facing the bar?", "People leaving the floor = adapt immediately", "Time of night dictates energy level and genre"],
      badge: { slug: "crowd-whisperer", name: "Crowd Whisperer" },
    },
  ],


  // ─── 26. SET STRUCTURE DJ ────────────────────────────────────────────────────
  "set-structure-dj": [
    {
      kind: "hook",
      emoji: "📈",
      headline: "A set is a journey, not a playlist",
      subtext: "Structure turns random tracks into a narrative with an arc.",
    },
    {
      kind: "concept",
      title: "The energy arc",
      body: "Warm up (lower energy, early crowd) → Build (escalating energy) → Peak (maximum energy, best tracks) → Wind down (gradual resolution). Save your best for when the crowd is most receptive.",
      keyFact: "Peak too early → nowhere to go. Build to the peak.",
    },
    {
      kind: "concept",
      title: "Time management",
      body: "Know your slot length. Calculate roughly when each phase should start. A 2-hour set: 30 min warm-up, 45 min build, 30 min peak, 15 min wind-down.",
      keyFact: "Know your slot length. Plan each phase in advance.",
    },
    {
      kind: "interact",
      sim: "arrangement",
      prompt: "Map out an energy arc for a 2-hour set",
    },
    {
      kind: "quiz",
      q: "A DJ set typically follows which arc?",
      options: ["Peak energy from the first track", "Warm up then build then peak then wind down", "Always getting quieter over time", "Random energy throughout"],
      answer: 1,
      explain: "A well-structured set builds gradually. Warm-up eases the crowd in, build creates anticipation, peak hour delivers highest energy, wind-down brings them home satisfied.",
    },
    {
      kind: "quiz",
      q: "Peaking too early in a set means",
      options: ["The crowd loves it", "You have nowhere to go — you cannot increase energy further and must maintain an unsustainable peak", "You can loop the peak indefinitely", "This is the correct approach always"],
      answer: 1,
      explain: "If you play maximum energy tracks at the start you have nowhere to go. All subsequent tracks feel like a comedown.",
    },
    {
      kind: "quiz",
      q: "A warm-up set is different from a headline set because",
      options: ["It uses different equipment", "It must gradually build energy from a low base — the crowd is not yet ready for peak energy", "It is always shorter", "The DJ is less skilled"],
      answer: 1,
      explain: "A warm-up set matches the early arriving crowd energy — people are still sober, still socialising, still not warmed up.",
    },
    {
      kind: "summary",
      learned: ["Warm up → build → peak → wind down is the arc", "Peak too early = nowhere to go. Patience wins.", "Know your slot length and plan each phase"],
    },
  ],


  // ─── 27. HARMONIC MIXING DJ ──────────────────────────────────────────────────
  "harmonic-mixing-dj": [
    {
      kind: "hook",
      emoji: "🎵",
      headline: "Build sets that sound musically beautiful",
      subtext: "Harmonic mixing makes transitions feel inevitable, not jarring.",
    },
    {
      kind: "concept",
      title: "Harmonic mixing in practice",
      body: "Select tracks whose keys are harmonically compatible using the Camelot Wheel. Same number = seamless. Adjacent number = smooth with slight energy shift. Master Tempo lets you fine-tune by semitones.",
      keyFact: "rekordbox shows Camelot key on every track. Use it.",
      visual: "camelot-wheel",
    },
    {
      kind: "concept",
      title: "Key shifting on CDJ",
      body: "Master Tempo + semitone shift buttons allow real-time key adjustment without tempo change. A track 1 semitone away from perfect compatibility can be shifted to match.",
      keyFact: "Shift up/down 1–2 semitones max. Beyond that = artifacts.",
    },
    {
      kind: "interact",
      sim: "harmonic-mix-wheel",
      prompt: "Find a harmonically compatible key move",
    },
    {
      kind: "quiz",
      q: "Harmonic mixing means",
      options: ["Matching the BPM exactly", "Selecting tracks with compatible musical keys so melodies and chords complement each other", "Using the same effect on every track", "Always using the crossfader"],
      answer: 1,
      explain: "Harmonic mixing matches musical keys so the melodies and chords of two tracks work together during the transition.",
    },
    {
      kind: "quiz",
      q: "Moving clockwise on the Camelot Wheel (e.g. 8A to 9A)",
      options: ["Creates a key clash", "Creates a subtle energy boost — a perfect 5th relationship that feels like a lift", "Has no effect on the music", "Should be avoided"],
      answer: 1,
      explain: "Moving one position clockwise on the Camelot Wheel takes you up a perfect 5th — harmonically smooth and creates a subtle energy lift.",
    },
    {
      kind: "quiz",
      q: "Master Tempo on CDJs allows you to",
      options: ["Lock the BPM so it cannot be changed", "Change the musical key without changing the BPM — enabling real-time key shifting for harmonic mixing", "Apply effects automatically", "Set loop points"],
      answer: 1,
      explain: "Master Tempo (key lock) keeps the tempo stable while you shift the key using semitone buttons.",
    },
    {
      kind: "summary",
      learned: ["Camelot Wheel: same = seamless, adjacent = smooth", "Clockwise one step = subtle energy boost", "Master Tempo + semitone shift for key adjustment"],
    },
  ],


  // ─── 28. EFFECTS PERFORMANCE DJ ──────────────────────────────────────────────
  "effects-performance-dj": [
    {
      kind: "hook",
      emoji: "🌀",
      headline: "FX should serve the music, not announce themselves",
      subtext: "Restraint is the golden rule of performance effects.",
    },
    {
      kind: "concept",
      title: "Beat FX and Sound Color FX",
      body: "Beat FX are BPM-synced effects: Echo, Reverb, Flanger, Phaser, Pitch Shift. Sound Color FX are real-time filter effects mapped to one knob per channel on Pioneer mixers.",
      keyFact: "Beat FX = tempo-synced. Sound Color FX = real-time sweep.",
      visual: "waveform",
    },
    {
      kind: "concept",
      title: "Key effect techniques",
      body: "Echo hold: trigger on the last beat before a breakdown — it decays naturally. Filter sweep: close a low-pass filter before the drop for a tunnel effect. Reverb wash: mask a transition join.",
      keyFact: "Restraint: one effect, right moment, maximum impact.",
    },
    {
      kind: "interact",
      sim: "none",
      prompt: "Apply a filter sweep before a breakdown",
    },
    {
      kind: "quiz",
      q: "Beat FX in rekordbox and CDJ equipment are",
      options: ["Effects applied randomly", "Time-synced effects like echo and reverb that lock to the track BPM automatically", "Only available in EXPORT mode", "Types of EQ"],
      answer: 1,
      explain: "Beat FX (Echo, Reverb, Flanger etc.) are synchronised to the track BPM.",
    },
    {
      kind: "quiz",
      q: "A filter sweep before a drop creates",
      options: ["A smooth blend", "Tension and anticipation — the filter closes progressively removing frequencies until the drop hits", "A harmonic transition", "A tempo change"],
      answer: 1,
      explain: "Closing a low-pass filter progressively removes high frequencies creating a tunnel effect. When it opens at the drop the energy release is massive.",
    },
    {
      kind: "quiz",
      q: "The golden rule of DJ effects is",
      options: ["Use as many as possible on every track", "Restraint — effects should serve the music and the moment not announce themselves", "Only use effects at peak hour", "Effects should always be audible"],
      answer: 1,
      explain: "Overusing effects desensitises the crowd. A precisely placed effect at the right moment is powerful.",
    },
    {
      kind: "summary",
      learned: ["Beat FX are BPM-synced: echo, reverb, flanger, phaser", "Filter sweep before a drop = maximum tension build", "Golden rule: restraint. One effect at the right moment"],
    },
  ],


  // ─── 29. ENERGY MANAGEMENT DJ ────────────────────────────────────────────────
  "energy-management-dj": [
    {
      kind: "hook",
      emoji: "⚡",
      headline: "Build tension. Hold. Release. Repeat.",
      subtext: "Energy management is the true art of DJing.",
    },
    {
      kind: "concept",
      title: "The energy arc toolkit",
      body: "Energy tools: BPM, track intensity, arrangement density, effects, mixing style. Building: increase BPM and density gradually. Releasing: sudden drop to lower energy or breakdown — crowd exhales.",
      keyFact: "Peaks and valleys. Contrast makes peaks feel higher.",
    },
    {
      kind: "concept",
      title: "The double-drop",
      body: "A double-drop is when the outgoing and incoming tracks both hit their drops simultaneously — doubling the bass, doubling the percussion, maximising energy impact at one moment.",
      keyFact: "Double-drop = two drops at once. Rare but devastating.",
    },
    {
      kind: "interact",
      sim: "none",
      prompt: "Plan a build-peak-valley energy sequence",
    },
    {
      kind: "quiz",
      q: "Energy management in DJing means",
      options: ["Playing everything as loud as possible", "Strategically controlling the energy arc of a set — when to build hold release and recover", "Setting the master output level", "Only choosing high-energy tracks"],
      answer: 1,
      explain: "Energy management is the deliberate control of the set energy arc — building tension, maintaining peaks, releasing to recoveries, building again.",
    },
    {
      kind: "quiz",
      q: "Peaks and valleys in a set mean",
      options: ["Technical problems during the set", "Intentional variations in energy level — high peaks alternating with lower valleys for contrast", "Alternating between genres randomly", "Volume fluctuations"],
      answer: 1,
      explain: "Long sets benefit from multiple peaks and valleys. Contrast makes peaks feel higher. Valleys give the crowd a breath.",
    },
    {
      kind: "quiz",
      q: "A double-drop means",
      options: ["Dropping the same track twice", "Two tracks playing simultaneously at their drop — doubling the energy impact", "Playing a track at double speed", "Two DJs dropping at the same time"],
      answer: 1,
      explain: "A double-drop is when the outgoing and incoming tracks both hit their drops simultaneously — doubling the bass, doubling the percussion, maximising energy.",
    },
    {
      kind: "summary",
      learned: ["Build → hold → release → recover = the energy cycle", "Peaks and valleys create contrast and impact", "Double-drop = both tracks hit their drops together"],
    },
  ],


  // ─── 30. GENRE STRATEGY DJ ───────────────────────────────────────────────────
  "genre-strategy-dj": [
    {
      kind: "hook",
      emoji: "🎯",
      headline: "Know your sound — own your niche",
      subtext: "Musical identity makes you recognisable and bookable.",
    },
    {
      kind: "concept",
      title: "Define your sound",
      body: "Every DJ has a sound — a musical identity. What genres? What BPM range? What energy range? What time slot? Clear identity = promoters know what to book you for.",
      keyFact: "Identity = recognisability = bookability. Be known for something.",
    },
    {
      kind: "concept",
      title: "Expanding gradually",
      body: "Expand to adjacent genres — not random jumps. A deep house DJ expands to tech house, then to techno. Authentic enthusiasm is audible. Play what you genuinely love.",
      keyFact: "Adjacent expansion. One step at a time. Authentic always.",
    },
    {
      kind: "interact",
      sim: "none",
      prompt: "Define your DJ sound and genre niche",
    },
    {
      kind: "quiz",
      q: "A DJ sound or musical identity is important because",
      options: ["It limits your bookings", "It makes you recognisable and coherent — audiences know what to expect and book you for the right context", "DJs should have no identity", "Only classical musicians need identity"],
      answer: 1,
      explain: "A clear musical identity makes you bookable — promoters know what kind of set you deliver.",
    },
    {
      kind: "quiz",
      q: "Why should you play music you genuinely love?",
      options: ["It is a legal requirement", "Genuine enthusiasm is audible and sustainable — audiences feel the difference", "It is required by rekordbox", "Only for amateur DJs"],
      answer: 1,
      explain: "Authentic enthusiasm for the music you play is immediately perceptible to audiences.",
    },
    {
      kind: "quiz",
      q: "Expanding your genre range should be",
      options: ["Done by randomly adding unrelated genres", "Done gradually by adding adjacent compatible genres", "Done immediately to maximise bookings", "Avoided entirely — never expand"],
      answer: 1,
      explain: "Expanding to adjacent genres is more coherent and musically logical than jumping to completely unrelated styles.",
    },
    {
      kind: "summary",
      learned: ["Clear musical identity = promoters know what to book you for", "Play what you genuinely love — enthusiasm is audible", "Expand to adjacent genres gradually, not randomly"],
    },
  ],


  // ─── 31. PREPARING A SET DJ ──────────────────────────────────────────────────
  "preparing-a-set-dj": [
    {
      kind: "hook",
      emoji: "📦",
      headline: "Preparation separates pros from amateurs",
      subtext: "The professional checklist — from library to stage.",
    },
    {
      kind: "concept",
      title: "Research and curate",
      body: "Research the event: audience type, time slot, context. Then curate 60–100 tracks specific to this gig. Not your full library — every track must be relevant to this specific night.",
      keyFact: "Know the gig. Curate for it. Not your full library.",
    },
    {
      kind: "concept",
      title: "Know your opening three tracks",
      body: "The first track is your statement of intent. Know your opening three tracks before you arrive. Everything after adapts to the room — but start with a clear intention.",
      keyFact: "First track = your statement of intent. Prepare it.",
    },
    {
      kind: "interact",
      sim: "none",
      prompt: "Plan an opening sequence for a warm-up set",
    },
    {
      kind: "quiz",
      q: "Researching the event before a gig means",
      options: ["Looking up the venue address", "Understanding the audience time slot context and energy level expected", "Checking the sound system specifications", "Reviewing your past setlists only"],
      answer: 1,
      explain: "Event research guides your entire preparation — which tracks to select, what energy level to aim for, which opening track sets the right tone.",
    },
    {
      kind: "quiz",
      q: "The most important track to prepare carefully is",
      options: ["The final track", "The first track — it sets the energy context and communicates the nature of your set", "The loudest track", "Any track in the middle"],
      answer: 1,
      explain: "The opening track is your statement of intent. It tells the room who you are and what is coming.",
    },
    {
      kind: "quiz",
      q: "Preparing only 60–100 tracks for a specific set rather than your full library means",
      options: ["You have fewer choices which is always worse", "Focused deliberate curation — every track is relevant and you can navigate quickly under pressure", "You should always take your full library", "Your set will be less creative"],
      answer: 1,
      explain: "A focused gig playlist means every track is relevant to this specific context.",
    },
    {
      kind: "summary",
      learned: ["Research the event before curating your playlist", "First track = statement of intent — prepare it", "60–100 focused tracks. Two identical USB drives."],
    },
  ],


  // ─── 32. LIVE MISTAKES DJ ────────────────────────────────────────────────────
  "live-mistakes-dj": [
    {
      kind: "hook",
      emoji: "🧯",
      headline: "Every DJ makes mistakes — pros recover fast",
      subtext: "Composure and speed of recovery are the real skills.",
    },
    {
      kind: "concept",
      title: "The train wreck and recovery",
      body: "A train wreck: two tracks playing wildly out of sync. Recovery: cut to one track immediately, reset. Cue the second track, beatmatch, bring it back in. Quick and confident.",
      keyFact: "Cut to one. Reset the other. Fast recovery erases mistakes.",
    },
    {
      kind: "concept",
      title: "Confidence over perfection",
      body: "The crowd does not know your plan. They only hear what happens. A confident recovery often goes unnoticed. Panic makes mistakes visible. Stay calm — recover — move on.",
      keyFact: "Confidence in recovery erases the mistake. Panic amplifies it.",
    },
    {
      kind: "interact",
      sim: "none",
      prompt: "Practice a confident recovery from a train wreck",
    },
    {
      kind: "quiz",
      q: "A train wreck in DJing is",
      options: ["A technical equipment failure", "Two tracks wildly out of sync playing simultaneously — the most obvious DJ mistake", "Playing the wrong genre", "A slow energy drop"],
      answer: 1,
      explain: "A train wreck is when two tracks play out of sync for more than a couple of beats.",
    },
    {
      kind: "quiz",
      q: "The fastest recovery from a train wreck is",
      options: ["Fading both tracks out slowly", "Cut cleanly to one track immediately then calmly re-cue and beatmatch the second track", "Stopping the set and apologising", "Playing a third track"],
      answer: 1,
      explain: "Cut to one track immediately. Then reset: cue the second track, beatmatch and bring it back in correctly. Quick and confident.",
    },
    {
      kind: "quiz",
      q: "The correct mindset for live performance mistakes is",
      options: ["Aim for perfection and be devastated by any error", "Accept that mistakes happen to everyone and focus on calm fast recovery", "Avoid them by only playing safe choices", "Cancel the performance if anything goes wrong"],
      answer: 1,
      explain: "Even the greatest DJs in the world make technical errors. Develop fast recovery protocols and maintain composure.",
    },
    {
      kind: "summary",
      learned: ["Train wreck: cut to one track immediately and reset", "Confidence in recovery = crowd doesn't notice", "Mistakes are universal. Recovery is the skill."],
      badge: { slug: "steady-hands", name: "Steady Hands" },
    },
  ],


  // ─── 33. EFFECTS DEEP DJ ─────────────────────────────────────────────────────
  "effects-deep-dj": [
    {
      kind: "hook",
      emoji: "🎭",
      headline: "Use effects as instruments, not accessories",
      subtext: "Advanced effects transform transitions into memorable moments.",
    },
    {
      kind: "concept",
      title: "Echo variants and flanger",
      body: "Echo hold size matters: 1/2 beat echo is tight and rhythmic; 1 bar echo is spacious and dramatic. Flanger creates a sweeping jet-plane sound — powerful on hi-hats and snares.",
      keyFact: "Echo size = character. 1/2 beat = tight. 1 bar = dramatic.",
      visual: "waveform",
    },
    {
      kind: "concept",
      title: "Reverb and phaser",
      body: "Reverb wash: high reverb feedback lets the reverb swell dramatically before you cut the dry signal. Phaser: slower phase-shift creates movement and depth for building texture without aggression.",
      keyFact: "Reverb wash: swell the reverb then cut. Dramatic and musical.",
    },
    {
      kind: "interact",
      sim: "none",
      prompt: "Apply an echo hold before a breakdown",
    },
    {
      kind: "quiz",
      q: "Beat FX in rekordbox and CDJ equipment are",
      options: ["Effects applied randomly", "Time-synced effects like echo and reverb that lock to the track BPM automatically", "Only available in EXPORT mode", "Types of EQ"],
      answer: 1,
      explain: "Beat FX (Echo, Reverb, Flanger etc.) are synchronised to the track BPM.",
    },
    {
      kind: "quiz",
      q: "An echo hold during a breakdown works because",
      options: ["It fixes a bad transition", "The echo extends naturally into the breakdown space giving the track a flowing exit into silence", "It changes the key", "It is required by the CDJ firmware"],
      answer: 1,
      explain: "Pressing BEAT FX Echo on the last beat before a breakdown lets the echo ring out naturally into the breakdown.",
    },
    {
      kind: "quiz",
      q: "The golden rule of DJ effects is",
      options: ["Use as many as possible on every track", "Restraint — effects should serve the music and the moment not announce themselves", "Only use effects at peak hour", "Effects should always be audible"],
      answer: 1,
      explain: "Overusing effects desensitises the crowd. A precisely placed effect at the right moment is powerful.",
    },
    {
      kind: "summary",
      learned: ["Echo size changes character: tight vs spacious", "Flanger = jet-plane sweep on hi-hats and snares", "Restraint: one effect, right moment, maximum impact"],
      badge: { slug: "fx-architect", name: "FX Architect" },
    },
  ],


  // ─── 34. LOOP PERFORMANCE DJ ─────────────────────────────────────────────────
  "loop-performance-dj": [
    {
      kind: "hook",
      emoji: "🌀",
      headline: "Loops are your live remixing power",
      subtext: "Use loops to sculpt time and build tension mid-set.",
    },
    {
      kind: "concept",
      title: "Performance loop strategy",
      body: "Loop a breakdown to buy unlimited preparation time. Loop a peak moment to hold the crowd at maximum energy. Use loop halve to progressively tighten: 4 bars → 2 → 1 → 1 beat.",
      keyFact: "Tighter loops = more tension. Release at the peak moment.",
      visual: "bpm-grid",
    },
    {
      kind: "concept",
      title: "Loop rolls as percussion",
      body: "Loop rolls create rhythmic stutter effects — use on snare or hi-hat sections for performance flair. Loop size matches musical feel: 1/8 or 1/16 bar for rapid stutter, 1 bar for a held effect.",
      keyFact: "Loop roll on snare = rhythmic stutter effect. Release = snaps back.",
    },
    {
      kind: "interact",
      sim: "loop-roll",
      prompt: "Build tension with loop halve sequence",
    },
    {
      kind: "quiz",
      q: "Loop halve is used in performance to",
      options: ["Shorten the track", "Progressively tighten a loop building urgency and tension before a release", "Change the musical key", "Fix a beatgrid error"],
      answer: 1,
      explain: "Loop halve reduces the loop size by half each press. The tighter the loop the more urgent and intense it feels.",
    },
    {
      kind: "quiz",
      q: "A 4-bar loop of a breakdown is useful for",
      options: ["Ending the set immediately", "Buying time to beatmatch the next track while holding the crowd in a tension moment", "Adding bass frequencies", "Recording the set"],
      answer: 1,
      explain: "Looping a breakdown extends it indefinitely. The crowd is held in tension. You have unlimited time to cue, beatmatch and prepare the next track.",
    },
    {
      kind: "quiz",
      q: "The loop function in DJing is used to",
      options: ["Set the BPM", "Capture and repeat a section of a track indefinitely", "Apply effects", "Set cue points"],
      answer: 1,
      explain: "Looping captures a defined section of a track and plays it repeatedly. Used to extend a moment or buy time.",
    },
    {
      kind: "summary",
      learned: ["Loop breakdown = unlimited prep time", "Loop halve: 4 → 2 → 1 → 1 beat builds maximum tension", "Loop roll = temporary stutter for performance flair"],
    },
  ],


  // ─── 35. HARMONIC KEY SHIFT DJ ───────────────────────────────────────────────
  "harmonic-key-shift-dj": [
    {
      kind: "hook",
      emoji: "🎹",
      headline: "Shift pitch without shifting tempo",
      subtext: "Master Tempo unlocks real-time key modulation on any CDJ.",
    },
    {
      kind: "concept",
      title: "Master Tempo and key shift",
      body: "Master Tempo (key lock) decouples pitch from playback speed. When you adjust BPM, the musical key stays constant. Semitone shift buttons then let you move the key up or down independently.",
      keyFact: "Master Tempo ON = BPM changes, key stays fixed.",
      visual: "camelot-wheel",
    },
    {
      kind: "concept",
      title: "Safe shift range",
      body: "Shifting 1–2 semitones is generally undetectable. Beyond 2–3 semitones, pitch-shifting algorithms introduce audible artifacts — especially on vocals and acoustic instruments.",
      keyFact: "1–2 semitones = safe. Beyond 3 = artifacts become audible.",
    },
    {
      kind: "interact",
      sim: "ear-training",
      prompt: "Identify key shift artifacts by ear",
    },
    {
      kind: "quiz",
      q: "Master Tempo in DJing means",
      options: ["Locking the tempo to 120 BPM", "Locking the pitch while the tempo changes — so beatmatching does not change the key of the track", "Setting the master deck", "A Pioneer DJ proprietary BPM system"],
      answer: 1,
      explain: "Master Tempo (key lock) decouples pitch from playback speed. When you adjust BPM the musical key stays the same.",
    },
    {
      kind: "quiz",
      q: "Key shifting is useful for harmonic mixing because",
      options: ["It changes the BPM to match", "It allows you to move a track by 1–2 semitones to match the key of the current track", "It automatically finds compatible keys", "It changes the scale of the track"],
      answer: 1,
      explain: "A track that is 1 semitone away from perfect harmonic compatibility can be shifted to match.",
    },
    {
      kind: "quiz",
      q: "The maximum safe key shift without obvious artifacts is approximately",
      options: ["Half a semitone", "1–2 semitones maximum", "5–6 semitones", "Any shift is fine"],
      answer: 1,
      explain: "Pitch-shifting algorithms introduce audible artifacts at larger shifts — especially on vocals. 1–2 semitones is generally acceptable.",
    },
    {
      kind: "summary",
      learned: ["Master Tempo: BPM changes, key stays constant", "Key shift: 1–2 semitones max before artifacts", "Enable Master Tempo by default when beatmatching"],
    },
  ],


  // ─── 36. STEM DJING ──────────────────────────────────────────────────────────
  "stem-djing": [
    {
      kind: "hook",
      emoji: "🧬",
      headline: "Mix individual elements, not whole tracks",
      subtext: "Stems let you combine bass from here, drums from there.",
    },
    {
      kind: "concept",
      title: "What stems are",
      body: "Stems mode in rekordbox AI-separates tracks into four elements: Bass, Drums, Melody, Vocals. Each can be controlled independently — turned up, muted, or mixed with stems from another track.",
      keyFact: "Four stems: Bass, Drums, Melody, Vocals. Each is independent.",
      visual: "signal-chain",
    },
    {
      kind: "concept",
      title: "Creative transition use",
      body: "During a transition: keep drums of both tracks, fade out melody of Track A while fading in melody of Track B. Rhythm is continuous — only the melodic content changes.",
      keyFact: "Keep both drums. Swap bass and melody. Seamless rhythm.",
    },
    {
      kind: "interact",
      sim: "none",
      prompt: "Plan a stem-based transition strategy",
    },
    {
      kind: "quiz",
      q: "Stems in rekordbox DJing refers to",
      options: ["The physical stands that hold CDJs", "Isolated individual elements of a track: bass drums melody and vocals separated by AI", "A type of cue point", "The support structure of a DJ booth"],
      answer: 1,
      explain: "Stems are AI-separated audio elements of a track. Bass, drums, melody and vocals are isolated for independent control.",
    },
    {
      kind: "quiz",
      q: "A key use of Stems mode for transitions is",
      options: ["Making tracks louder", "Keeping the drums of both tracks playing while swapping bass lines and melodies", "Setting cue points", "Managing the playlist"],
      answer: 1,
      explain: "Stems enable drum continuity across a transition — keep the drums of both tracks, fade out one bass and melody while fading in the next.",
    },
    {
      kind: "quiz",
      q: "Stem accuracy varies because",
      options: ["rekordbox has bugs", "AI separation is not perfect — complex productions may have leakage between stem categories", "Only simple tracks can be stemmed", "Stems only work on new music"],
      answer: 1,
      explain: "AI stem separation is impressive but imperfect. Complex productions may have elements appearing in the wrong stem.",
    },
    {
      kind: "summary",
      learned: ["Stems: Bass, Drums, Melody, Vocals — AI separated", "Keep both drums, swap melody and bass for seamless transition", "AI stems are impressive but imperfect — expect some leakage"],
      badge: { slug: "stem-sculptor", name: "Stem Sculptor" },
    },
  ],


  // ─── 37. RECORDING YOUR SET DJ ───────────────────────────────────────────────
  "recording-your-set-dj": [
    {
      kind: "hook",
      emoji: "⏺️",
      headline: "Record every set — then listen critically",
      subtext: "You cannot evaluate your mixing while you are doing it.",
    },
    {
      kind: "concept",
      title: "Recording methods",
      body: "rekordbox PERFORMANCE mode has built-in recording to WAV from software output. An external recorder (Zoom H6 etc.) connected to the mixer record out captures hardware-independently.",
      keyFact: "Record at −6 dBFS peaks — headroom for post-processing.",
      visual: "headroom-meter",
    },
    {
      kind: "concept",
      title: "Critical listening practice",
      body: "Focused critical listening — identify one specific thing to improve and one success per session. Specific beats vague. Write it down. Fix it in the next session.",
      keyFact: "One fix target + one success per session. Specific, not vague.",
    },
    {
      kind: "interact",
      sim: "none",
      prompt: "Review a recorded transition critically",
    },
    {
      kind: "quiz",
      q: "Recording your DJ sets is important because",
      options: ["Recording improves technique automatically", "It provides critical feedback you cannot hear in the moment and creates content for promotion", "Recordings are required by venues", "It is only useful for professional DJs"],
      answer: 1,
      explain: "Recording enables critical listening after the fact — you hear mistakes you missed while performing.",
    },
    {
      kind: "quiz",
      q: "The recommended recording level for a DJ set is",
      options: ["Maximum 0 dBFS throughout", "Peaks around −6 dBFS leaving headroom for post-processing", "As quiet as possible", "0 VU on an analogue meter"],
      answer: 1,
      explain: "Recording with peaks around −6 dBFS leaves headroom for any unforeseen peaks and for post-production normalisation without clipping.",
    },
    {
      kind: "quiz",
      q: "Critical listening after recording a practice session should focus on",
      options: ["Enjoying the set as a listener", "Identifying one specific improvement area and one success per session for focused learning", "Only technical errors", "Only successful moments"],
      answer: 1,
      explain: "Focused critical listening — one specific thing to improve, one specific success — is far more effective than vague overall assessment.",
    },
    {
      kind: "summary",
      learned: ["Record every session — rekordbox or external recorder", "Peak levels at −6 dBFS for recording headroom", "One fix + one success per critical listen session"],
    },
  ],


  // ─── 38. DVS BASICS ──────────────────────────────────────────────────────────
  "dvs-basics": [
    {
      kind: "hook",
      emoji: "📀",
      headline: "Vinyl feel, digital library",
      subtext: "DVS gives turntablists the best of both worlds.",
    },
    {
      kind: "concept",
      title: "How DVS works",
      body: "DVS uses specially encoded timecode vinyl records. The turntable reads the encoded signal and the software decodes it into playback position and speed — real-time control of digital files.",
      keyFact: "Timecode vinyl = encoded signal → software reads position + speed.",
      visual: "vinyl-platter",
    },
    {
      kind: "concept",
      title: "DVS platforms and requirements",
      body: "Serato DJ Pro dominates hip-hop and turntablist scenes. Traktor Scratch Pro is the Native Instruments solution. Both require a specific certified audio interface to handle timecode input.",
      keyFact: "DVS needs: timecode vinyl + certified audio interface + software.",
    },
    {
      kind: "interact",
      sim: "none",
      prompt: "Map out a DVS signal chain",
    },
    {
      kind: "quiz",
      q: "DVS (Digital Vinyl System) allows",
      options: ["Playing vinyl records on digital speakers", "Using specially encoded timecode vinyl to control digital DJ software — vinyl feel with digital files", "Converting vinyl to MP3 automatically", "A wireless connection between turntables"],
      answer: 1,
      explain: "DVS uses timecode vinyl records. The turntable reads a special encoded signal and the software translates it into playback position and speed.",
    },
    {
      kind: "quiz",
      q: "Serato DJ Pro is used primarily in",
      options: ["Classical music concerts", "The hip-hop and turntablism DJ scene as a leading DVS platform", "Only in radio stations", "Only with CDJs"],
      answer: 1,
      explain: "Serato DJ Pro is the dominant platform in hip-hop and turntablist circles.",
    },
    {
      kind: "quiz",
      q: "DVS is most suitable for DJs who",
      options: ["Only want to use CDJs", "Have a turntablism or vinyl background and want vinyl control while working with digital files", "Prefer controllers to turntables", "Are beginners learning to DJ"],
      answer: 1,
      explain: "DVS is the ideal bridge for turntablists and vinyl-native DJs who want to maintain their physical vinyl workflow while accessing digital music libraries.",
    },
    {
      kind: "summary",
      learned: ["DVS = timecode vinyl controls digital files via software", "Serato = hip-hop/turntablism. Traktor = NI ecosystem", "Requires timecode vinyl + certified audio interface"],
    },
  ],


  // ─── 39. DJ BUSINESS ─────────────────────────────────────────────────────────
  "dj-business": [
    {
      kind: "hook",
      emoji: "💼",
      headline: "Reliability gets more bookings than talent alone",
      subtext: "The business of DJing — bookings, rates, and professionalism.",
    },
    {
      kind: "concept",
      title: "Promotional mix and brand",
      body: "Your promotional mix is your audio CV — 60–90 minutes of your sound at its best. Pair it with a consistent artist identity across all platforms: name, photo, social presence.",
      keyFact: "Promo mix = audio CV. Consistent identity = recognisable brand.",
    },
    {
      kind: "concept",
      title: "Rates, rider, and reliability",
      body: "Research local market rates — don't undercut significantly or you devalue the scene. Your rider lists technical and personal requirements in writing before the gig. Show up on time every time.",
      keyFact: "Reliability + professionalism = repeat bookings. Talent is baseline.",
    },
    {
      kind: "interact",
      sim: "none",
      prompt: "Draft your DJ rider requirements",
    },
    {
      kind: "quiz",
      q: "A promotional DJ mix is important because",
      options: ["It is required by DJ unions", "It showcases your sound at its best and is essential for booking enquiries", "It automatically generates social media followers", "Only famous DJs need promotional mixes"],
      answer: 1,
      explain: "A promotional mix is your audio CV. Promoters and venues listen to it to assess whether your sound matches their event.",
    },
    {
      kind: "quiz",
      q: "A DJ rider is",
      options: ["A type of DJ performance style", "A written list of technical requirements and personal requirements agreed before the gig", "An assistant who carries equipment", "A specific type of DJ contract"],
      answer: 1,
      explain: "A rider is a written document specifying your technical requirements (equipment list, format) and personal requirements (transport, hospitality).",
    },
    {
      kind: "quiz",
      q: "The most reliable path to repeat bookings is",
      options: ["Being the most technically skilled DJ in the city", "Professionalism and reliability — showing up prepared on time and delivering exactly what was promised", "Having the most social media followers", "Playing the most popular music"],
      answer: 1,
      explain: "Promoters book DJs they can rely on. A DJ who shows up on time and plays the right set will be rebooked ahead of a more talented but unreliable alternative.",
    },
    {
      kind: "summary",
      learned: ["Promo mix = your audio CV for booking enquiries", "Rider = written technical and personal requirements", "Reliability + professionalism = repeat bookings"],
    },
  ],


  // ─── 40. DJ ADVANCED COMPLETE ────────────────────────────────────────────────
  "dj-advanced-complete": [
    {
      kind: "hook",
      emoji: "🌟",
      headline: "Take your audience somewhere new",
      subtext: "Technical mastery is the baseline. Artistic identity is the goal.",
    },
    {
      kind: "concept",
      title: "From competent to great",
      body: "Technical competence can be learned by most people willing to practice. Artistic identity — a genuinely unique perspective expressed through music selection and performance — is what makes a DJ unforgettable.",
      keyFact: "Competence = doing it right. Artistry = feeling something unique.",
    },
    {
      kind: "concept",
      title: "The path forward",
      body: "Unique track selection from deep crate digging. Production skills for exclusive edits. Long-form thinking across months and years. Genuine community relationships. Let your sound evolve naturally.",
      keyFact: "Your own music = nobody else has it. Ultimate differentiation.",
    },
    {
      kind: "interact",
      sim: "none",
      prompt: "Define your next artistic development step",
    },
    {
      kind: "quiz",
      q: "What separates a competent DJ from a great one?",
      options: ["More expensive equipment", "Artistic identity — a unique voice and vision expressed through music selection and performance", "Faster beatmatching", "Playing in more venues"],
      answer: 1,
      explain: "Technical competence can be learned by most people willing to practice. Artistic identity — a genuinely unique perspective — is what makes a DJ unforgettable.",
    },
    {
      kind: "quiz",
      q: "Producing your own music as a DJ gives you",
      options: ["Only work for the studio", "Exclusive tracks no other DJ has — differentiation and artistic identity", "Required for DJ bookings", "A separate career only"],
      answer: 1,
      explain: "Original productions and edits give you tracks nobody else can play. Playing your own music during a set creates moments of complete exclusivity.",
    },
    {
      kind: "quiz",
      q: "The ultimate goal in DJing is",
      options: ["Technical perfection on every mix", "Playing to the largest possible audience", "Taking your audience somewhere they have not been before — creating a unique emotional journey", "Having the largest music library"],
      answer: 2,
      explain: "The most memorable DJ sets created a feeling, told a story, or took an audience through an emotional journey they will remember years later.",
    },
    {
      kind: "summary",
      learned: ["Artistry = unique voice beyond technical skill", "Original productions create exclusive moments", "Evolution: let your sound develop naturally over years"],
      badge: { slug: "dj-advanced", name: "DJ Advanced" },
    },
  ],
};
