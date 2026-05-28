import type { LessonScreen } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCER MISSION SCREENS  ·  All 91 missions  ·  7–8 screens each
// ─────────────────────────────────────────────────────────────────────────────

export const PRODUCER_SCREENS: Record<string, LessonScreen[]> = {

  // ─── CHAPTER 1: FIRST CONTACT ───────────────────────────────────────────

  "what-is-live": [
    { kind: "hook", emoji: "🎛", headline: "Ableton Live thinks differently", subtext: "Two views, infinite flexibility — here's how Live works." },
    { kind: "concept", title: "Session vs Arrangement", body: "Live has two views: Session for non-linear jamming and launching loops, and Arrangement for timeline composition. Most producers use both.", keyFact: "Session = loop launcher. Arrangement = timeline.", visual: "none" },
    { kind: "concept", title: "Non-destructive by design", body: "Almost everything in Live is non-destructive. Warp audio, reverse samples, slice loops — the original file is never touched.", keyFact: "Undo goes back 100+ steps. Nothing is permanent." },
    { kind: "interact", sim: "interface-tour", prompt: "Click each panel to learn its name" },
    { kind: "quiz", q: "Live's two main views are…", options: ["Mix & Edit", "Session & Arrangement", "Track & Master", "Studio & Live"], answer: 1, explain: "Session for jamming, Arrangement for timeline. Most producers move between both within a single session." },
    { kind: "quiz", q: "Session View is best for…", options: ["Linear songs", "Mastering", "Non-linear loop launching", "Video scoring"], answer: 2, explain: "Session View lets you trigger clips in any order — perfect for live performance and improvising song structure." },
    { kind: "quiz", q: "Audio editing in Live is…", options: ["Destructive", "Non-destructive", "Read-only", "MIDI-only"], answer: 1, explain: "Non-destructive means the original file is never altered — edits are instructions Live reads at playback time." },
    { kind: "summary", learned: ["Session = clip launcher. Arrangement = timeline", "All audio editing is non-destructive", "Tab switches between the two views instantly"] },
  ],

  "interface-tour": [
    { kind: "hook", emoji: "🗺", headline: "Every panel has a job", subtext: "Memorise Live's layout once — produce faster forever." },
    { kind: "concept", title: "Five key areas", body: "Control Bar (top), Browser (left), Main View (centre), Detail View (bottom), Mixer (right in Session). Each area has a single clear purpose.", keyFact: "Tab = toggle Session ↔ Arrangement instantly." },
    { kind: "concept", title: "Detail View power", body: "The Detail View at the bottom shows either Clip Editor or Device View depending on what's selected. Double-click a clip to open notes; click a device to see its controls.", keyFact: "Cmd/Ctrl+Alt+L = hide/show Detail View." },
    { kind: "interact", sim: "interface-tour", prompt: "Click each hotspot to name the panel" },
    { kind: "quiz", q: "What key toggles Session/Arrangement?", options: ["Spacebar", "Tab", "Enter", "Shift"], answer: 1, explain: "Tab is Live's fastest workflow shortcut — you'll hit it hundreds of times per session toggling views." },
    { kind: "quiz", q: "Tempo lives in the…", options: ["Browser", "Detail View", "Control Bar", "Mixer"], answer: 2, explain: "The Control Bar at the top controls BPM, time signature, and transport — your session's master clock." },
    { kind: "quiz", q: "Where do you edit a MIDI clip's notes?", options: ["Control Bar", "Browser", "Detail View", "Info View"], answer: 2, explain: "Detail View (bottom panel) shows notes when you double-click a MIDI clip." },
    { kind: "summary", learned: ["Control Bar = tempo, transport, quantize", "Detail View = clip editor and device view", "Tab = instant view switch"] },
  ],

  "browser": [
    { kind: "hook", emoji: "📂", headline: "Your library lives in the Browser", subtext: "Sounds, presets, packs — find anything in seconds." },
    { kind: "concept", title: "Browser categories", body: "The Browser (left sidebar) organises Sounds, Drums, Instruments, Audio Effects, MIDI Effects, Plug-Ins, Clips, Samples, and Packs — each in its own section.", keyFact: "Live 12 added tag-based Categories for musical search." },
    { kind: "concept", title: "Sound Similarity Search", body: "Drag any sample into the search area and click the similarity button — Live analyses audio content and finds sonically related samples in your library.", keyFact: "Searches timbre, not filename. Game-changing discovery." },
    { kind: "interact", sim: "browser-tour", prompt: "Navigate to Sounds and drag a preset onto a track" },
    { kind: "quiz", q: "Live 12's Similarity Search finds samples by…", options: ["File name", "Sound (timbre)", "Date", "File size"], answer: 1, explain: "Similarity Search analyses audio characteristics — timbre, rhythm, tone — not filenames." },
    { kind: "quiz", q: "Drag from Browser to a track does what?", options: ["Loads preset/sample", "Deletes the track", "Opens preferences", "Exports audio"], answer: 0, explain: "Dragging from the Browser to a track loads the preset or sample directly — primary way to audition and place sounds." },
    { kind: "quiz", q: "Categories were added in…", options: ["Live 9", "Live 10", "Live 11", "Live 12"], answer: 3, explain: "Categories (Drums, Bass, Pads, etc.) were introduced in Live 12 for musical-style library organisation." },
    { kind: "summary", learned: ["Browser holds all sounds, presets, and packs", "Sound Similarity Search finds by audio content", "Live 12 adds tag-based categories"] },
  ],

  "preferences": [
    { kind: "hook", emoji: "⚙️", headline: "Set it up once, correctly", subtext: "Wrong buffer size = glitches. Wrong audio driver = silence." },
    { kind: "concept", title: "Audio preferences", body: "Preferences > Audio sets your driver (ASIO/Core Audio), sample rate (44.1/48 kHz), and buffer size. Buffer size is the key trade-off: lower = less latency, higher = more CPU headroom.", keyFact: "256 samples = safe default. 64–128 for recording, 512+ for mixing." },
    { kind: "concept", title: "MIDI and plugins", body: "Preferences > Link/MIDI activates connected MIDI devices. Preferences > Plug-Ins tells Live where to scan for VST/AU plugins. Always verify plugin folder paths after installing new software.", keyFact: "Re-scan plugins after installing: Preferences > Plug-Ins > Rescan." },
    { kind: "interact", sim: "none", prompt: "Adjust buffer size — observe the latency/CPU trade-off" },
    { kind: "quiz", q: "Lower buffer size means…", options: ["More latency", "Less latency, more CPU load", "Less CPU load", "Better quality"], answer: 1, explain: "Smaller buffer = faster roundtrip between input and output, but the CPU has less time per chunk — works harder." },
    { kind: "quiz", q: "Open Preferences with…", options: ["Cmd/Ctrl+,", "Cmd/Ctrl+P", "F5", "Tab"], answer: 0, explain: "Cmd/Ctrl+, (comma) opens Preferences — the universal macOS/Windows shortcut for app settings." },
    { kind: "quiz", q: "Plugins not showing? First step is…", options: ["Reinstall Live", "Rescan in Preferences > Plug-Ins", "New project", "Freeze tracks"], answer: 1, explain: "When plugins disappear, trigger a re-scan from Preferences > Plug-Ins tab — tells Live where to look." },
    { kind: "summary", learned: ["Buffer size: lower = less latency, more CPU", "Cmd/Ctrl+, opens Preferences", "Rescan Plug-Ins when devices go missing"] },
  ],



  "files-projects": [
    { kind: "hook", emoji: "💾", headline: "A Project is more than one file", subtext: "Lose the folder, lose your samples. Save properly every time." },
    { kind: "concept", title: "Set vs Project", body: "A Live Set (.als) is the project file. The Project folder wraps it alongside recorded audio, bounces, and presets. Always keep them together.", keyFact: ".als = Live Set. Project folder = everything else." },
    { kind: "concept", title: "Collect All and Save", body: "Before sharing or moving a project, use File > Collect All and Save. This copies all referenced samples into the Project folder so nothing goes missing on another machine.", keyFact: "Without this step, shared projects break on other computers." },
    { kind: "interact", sim: "browser-tour", prompt: "Locate a project folder in the Browser and inspect it" },
    { kind: "quiz", q: "A Live Set extension is…", options: [".alp", ".als", ".adv", ".asd"], answer: 1, explain: ".als = Ableton Live Set. Know this to spot projects in Finder or Explorer." },
    { kind: "quiz", q: "To bundle a project for a friend, use…", options: ["Save As", "Collect All and Save", "Export Audio", "Freeze Track"], answer: 1, explain: "Collect All and Save copies all samples into the project folder — self-contained and sharable." },
    { kind: "quiz", q: ".alp files are…", options: ["Live Sets", "Live Packs (bundled libraries)", "Audio clips", "Presets"], answer: 1, explain: "Live Packs (.alp) bundle sounds, presets, or entire instrument packs — installed via Live's browser." },
    { kind: "summary", learned: [".als = Live Set, .alp = Live Pack", "Collect All and Save before sharing", "Auto-save lives in the Project's Backup folder"] },
  ],

  "session-view": [
    { kind: "hook", emoji: "🟩", headline: "Session View is a non-linear launcher", subtext: "Clips fire on demand. Scenes trigger whole rows at once." },
    { kind: "concept", title: "The Session grid", body: "Session View is a matrix of tracks (columns) and scenes (rows). Each cell is a clip slot. Click a clip to launch it; click the scene button to fire all clips in that row simultaneously.", keyFact: "Tracks = columns. Scenes = rows. One clip per track at a time." },
    { kind: "concept", title: "Quantize makes it musical", body: "Global Quantize determines when clips actually start after you click. Set to 1 Bar and every clip starts precisely on the next bar line, staying in musical sync regardless of when you click.", keyFact: "1 Bar Global Quantize = tight, musical transitions every time." },
    { kind: "interact", sim: "session-grid", prompt: "Launch clips and scenes — feel the non-linear flow" },
    { kind: "quiz", q: "A scene is…", options: ["A column of clips", "A row of clips", "A single clip", "A track"], answer: 1, explain: "A scene is a horizontal row — launching it starts every clip in that row simultaneously." },
    { kind: "quiz", q: "Global Quantize 1 Bar means clips start…", options: ["Immediately", "On the next bar line", "On the next beat", "At the end of the set"], answer: 1, explain: "1 Bar Quantize waits for the next bar boundary — every launch stays in perfect musical sync." },
    { kind: "quiz", q: "Each track plays…", options: ["All clips simultaneously", "One clip at a time", "Two clips at once", "Any selected clips"], answer: 1, explain: "A track has only one clip slot active — launching a new clip stops the current one on that track." },
    { kind: "summary", learned: ["Scenes = rows that launch entire rows at once", "Global Quantize keeps transitions musical", "One clip playing per track at any time"] },
  ],

  "arrangement-view": [
    { kind: "hook", emoji: "📅", headline: "Arrangement is your timeline", subtext: "Clips become blocks. Time flows left to right." },
    { kind: "concept", title: "Timeline composition", body: "Arrangement View shows tracks stacked vertically with time running left to right. Clips are blocks you can drag, resize, loop and split — like a traditional DAW timeline.", keyFact: "Tab switches between Session and Arrangement views." },
    { kind: "concept", title: "Recording into Arrangement", body: "Press Record while Live plays in Arrangement to capture Session clip launches or live MIDI input onto the timeline. Use Locators (right-click scrubber) to bookmark song sections like Intro, Verse, Drop.", keyFact: "Locators + Tab = professional song arrangement workflow." },
    { kind: "interact", sim: "arrangement", prompt: "Move and resize clips on the timeline" },
    { kind: "quiz", q: "Locators in Arrangement are…", options: ["Loop markers", "Section bookmarks", "Automation points", "Clips"], answer: 1, explain: "Locators are named bookmarks — right-click the scrubber bar to add them. Invaluable for navigating song sections." },
    { kind: "quiz", q: "Recording Session into Arrangement happens when…", options: ["You press Save", "You hit global Record during playback", "You export", "Always automatic"], answer: 1, explain: "Pressing Record while playing captures Session clip launches as blocks on the Arrangement timeline." },
    { kind: "quiz", q: "Arrangement clips can be…", options: ["Moved and resized", "Only moved", "Only resized", "Neither"], answer: 0, explain: "Arrangement clips are fully editable — drag to move, drag edges to resize, Cmd/Ctrl+E to split." },
    { kind: "summary", learned: ["Arrangement = traditional timeline view", "Locators bookmark song sections (Intro, Drop, etc.)", "Record button captures Session performance to timeline"] },
  ],

  "clips": [
    { kind: "hook", emoji: "🎬", headline: "Two clip types, wildly different powers", subtext: "MIDI holds instructions. Audio holds waveforms. Both loop." },
    { kind: "concept", title: "MIDI clips", body: "A MIDI clip stores notes — pitch, velocity, duration. The instrument on the track creates the sound at playback. Swap the instrument anytime; the notes stay intact with full fidelity.", keyFact: "MIDI is never rendered until playback — edit forever." },
    { kind: "concept", title: "Audio clips", body: "An audio clip stores a recorded waveform. You can transpose, warp, reverse and loop it — but these processes re-interpret existing samples. Extreme changes cause artefacts.", keyFact: "Use MIDI for ideas you'll keep changing. Audio for captures." },
    { kind: "interact", sim: "midi-vs-audio", prompt: "Swap the instrument on the MIDI clip — same notes, new sound" },
    { kind: "quiz", q: "MIDI clips contain…", options: ["Audio samples", "Note instructions (pitch, velocity, length)", "Both equally", "Plugin chains"], answer: 1, explain: "MIDI is a list of musical instructions; the instrument converts them to sound at playback." },
    { kind: "quiz", q: "Why is MIDI editable forever?", options: ["It's compressed", "Nothing is rendered until playback", "It's smaller in file size", "Live caches it"], answer: 1, explain: "MIDI is never 'baked' — it renders through the instrument in real-time, so you can swap instruments or edit notes anytime." },
    { kind: "quiz", q: "Audio clip pitch transpose is…", options: ["Free and lossless", "A re-pitch process — extremes cause artefacts", "Impossible in Live", "MIDI-only"], answer: 1, explain: "Transposing audio re-pitches via stretching — beyond ~6-8 semitones you'll hear time-stretch artefacts." },
    { kind: "summary", learned: ["MIDI = instructions. Audio = recorded waveform", "MIDI: swap instrument, keep notes, no quality loss", "Audio transpose: works well, artefacts at extremes"] },
  ],

  "tracks": [
    { kind: "hook", emoji: "🎚", headline: "Five track types do five different jobs", subtext: "Audio, MIDI, Return, Group, Master — each has a role." },
    { kind: "concept", title: "The five track types", body: "Audio tracks record and play audio. MIDI tracks hold notes and host instruments. Return tracks receive sends for shared effects. Group tracks bus multiple tracks together. Master outputs everything.", keyFact: "MIDI → Instrument → Audio. That's the signal flow." },
    { kind: "concept", title: "Why track types matter", body: "Putting an instrument on an audio track won't work — it needs a MIDI track. Putting reverb on every track is inefficient — use a Return. Understanding types prevents common routing mistakes.", keyFact: "Each type has rules about what it accepts as input." },
    { kind: "interact", sim: "mixer", prompt: "Identify each track type by colour and icon" },
    { kind: "quiz", q: "Reverb sends go to a…", options: ["Group track", "Return track", "Master track", "MIDI track"], answer: 1, explain: "Return tracks receive signal from sends — designed for shared effects like reverb used by many tracks simultaneously." },
    { kind: "quiz", q: "An instrument lives on a…", options: ["Audio track", "MIDI track", "Return track", "Master track"], answer: 1, explain: "MIDI tracks host instruments (Wavetable, Operator, Simpler, etc.) — they output MIDI that the instrument converts to audio." },
    { kind: "quiz", q: "Group tracks are…", options: ["Folders only (no audio)", "Real audio buses with processing", "Plugin containers", "Return variants"], answer: 1, explain: "Group tracks are real audio buses — sum their children, add effects, automate the group as a whole." },
    { kind: "summary", learned: ["Audio = records/plays audio. MIDI = notes + instrument", "Return = shared effects destination via sends", "Group = audio bus for stems and sub-mixes"] },
  ],

  "scenes-follow": [
    { kind: "hook", emoji: "🤖", headline: "Make clips play themselves", subtext: "Follow Actions tell each clip what to do when it ends." },
    { kind: "concept", title: "Scenes as performance tools", body: "A scene launches a whole row. Each scene can store its own tempo and time signature — change the song's feel by firing a new scene during a live set.", keyFact: "Scene tempo overrides project BPM — perfect for live sets." },
    { kind: "concept", title: "Follow Actions", body: "Follow Actions decide what happens when a clip ends: play again, jump to next, jump to random, stop. Set Follow Action time shorter than the clip for generative, evolving structures.", keyFact: "Follow Action chance percentage controls probability of each action." },
    { kind: "interact", sim: "session-grid", prompt: "Set a Follow Action on a clip — watch it self-sequence" },
    { kind: "quiz", q: "Follow Actions trigger…", options: ["When a clip ends", "When you click", "On bar 1 only", "On record"], answer: 0, explain: "Follow Actions fire automatically when a clip reaches its end or a set custom duration." },
    { kind: "quiz", q: "Scenes can override…", options: ["Project tempo", "Sample rate", "Buffer size", "UI theme"], answer: 0, explain: "Each scene can carry its own BPM — firing a scene can change the project tempo instantly." },
    { kind: "quiz", q: "Which is NOT a Follow Action?", options: ["Next", "Other", "Reverse", "Stop"], answer: 2, explain: "Reverse is a clip property, not a Follow Action. Follow Actions are: Again, Next, Previous, Any, Other, Stop." },
    { kind: "summary", learned: ["Scenes fire entire rows and can carry their own BPM", "Follow Actions automate clip sequencing", "Generative music: Follow Action = random, chance = 50/50"] },
  ],

  "capture-midi": [
    { kind: "hook", emoji: "⏮", headline: "The take you forgot to record — recovered", subtext: "Live keeps a rolling MIDI buffer even when record is off." },
    { kind: "concept", title: "How Capture works", body: "Live silently buffers everything you play on a MIDI controller even when Record is off. Hit the Capture button (camera icon) and Live reconstructs those notes at the correct tempo on the armed track.", keyFact: "Capture works without Record. Works in Session and Arrangement." },
    { kind: "concept", title: "Capture tempo detection", body: "Capture is smart — it detects the tempo of what you played and adjusts Live's BPM to match, or fits it into the current project tempo. The result is a quantise-ready MIDI clip.", keyFact: "Say 'wait, that was good' — you probably already have it." },
    { kind: "interact", sim: "piano-roll", prompt: "Review a captured MIDI clip's notes in the piano roll" },
    { kind: "quiz", q: "Capture MIDI requires Record to be on first.", options: ["True", "False"], answer: 1, explain: "Capture MIDI works WITHOUT record enabled — it retroactively captures what you just played from Live's hidden buffer." },
    { kind: "quiz", q: "What gets captured?", options: ["Audio from mic", "MIDI you just played", "Automation only", "Scene data"], answer: 1, explain: "Capture recovers the MIDI notes you just played on any connected controller — your last bars of playing." },
    { kind: "quiz", q: "The captured clip lands on…", options: ["A new track", "The armed/selected MIDI track", "The Master"], answer: 1, explain: "Captured clips appear on the armed (or selected) MIDI track — exactly where you'd continue editing." },
    { kind: "summary", learned: ["Live buffers MIDI even when not recording", "Capture button = retroactive recording", "Works in both Session and Arrangement views"] },
  ],

  "take-lanes": [
    { kind: "hook", emoji: "🎙", headline: "Stack takes, pick the best bits", subtext: "Take Lanes + comping = one perfect take from many." },
    { kind: "concept", title: "What are Take Lanes?", body: "Take Lanes (Live 11+) show each loop pass as a separate row under the main track. Loop a section, hit Record — every pass becomes a new lane you can review and audition.", keyFact: "Right-click track header → Show Take Lanes to enable." },
    { kind: "concept", title: "Comping the lanes", body: "Drag across sections of take lanes to promote the best moments to the top (comp) lane. Live automatically crossfades between comp regions for smooth transitions.", keyFact: "Comping works for both Audio and MIDI takes." },
    { kind: "interact", sim: "arrangement", prompt: "Select sections from different take lanes to build a comp" },
    { kind: "quiz", q: "Take Lanes were added in…", options: ["Live 9", "Live 10", "Live 11", "Live 12"], answer: 2, explain: "Take Lanes arrived in Live 11 — each loop pass records a new row of takes for non-destructive comping." },
    { kind: "quiz", q: "The comp lives on…", options: ["A return track", "The top (master) lane", "The last lane"], answer: 1, explain: "The comp lane is always the topmost — it's where you piece together the best sections from all lanes below." },
    { kind: "quiz", q: "Take Lanes work for…", options: ["Audio only", "MIDI only", "Audio and MIDI both"], answer: 2, explain: "Take Lanes and comping work identically for audio and MIDI recordings." },
    { kind: "summary", learned: ["Take Lanes stack every loop pass as a separate row", "Drag across lanes to build the final comp", "Auto-crossfades smooth comp region boundaries"] },
  ],



  // ─── CHAPTER 2: SOUND & MIDI ─────────────────────────────────────────────

  "midi-piano-roll": [
    { kind: "hook", emoji: "🎹", headline: "Click, drag, compose in the piano roll", subtext: "Every MIDI note is a block you can place and reshape." },
    { kind: "concept", title: "Piano roll basics", body: "Double-click a MIDI clip to open the piano roll. The vertical axis is pitch (piano keyboard left), horizontal axis is time. Draw notes in Pencil Mode (B), select in Pointer Mode.", keyFact: "B = Pencil mode toggle. Cmd/Ctrl+A = select all notes." },
    { kind: "concept", title: "Velocity and quantise", body: "Each note has a velocity (0–127) shown as a bar below. Higher velocity = louder and often brighter. Cmd/Ctrl+U quantises all selected notes to the grid.", keyFact: "Shift+drag a note = constrain to horizontal movement only." },
    { kind: "interact", sim: "piano-roll", prompt: "Draw a 4-note melody — adjust velocities" },
    { kind: "quiz", q: "B key in the piano roll toggles…", options: ["Browser", "Pencil/draw mode", "Bar count", "Bypass"], answer: 1, explain: "B toggles Pencil mode for drawing notes vs the default select/pointer mode." },
    { kind: "quiz", q: "Velocity controls…", options: ["Pitch", "Note length", "How hard/loud the note plays", "Quantise amount"], answer: 2, explain: "Velocity (0–127) maps to how hard the note is struck — instruments often change timbre with velocity too." },
    { kind: "quiz", q: "Live 12 generative MIDI tools are called…", options: ["Macro controls", "Note Transformations", "Follow Actions", "Groove Pool"], answer: 1, explain: "Live 12's Note Transformations (Strum, Pitch Shift, Arpeggiate, etc.) are accessible from the Piano Roll toolbar." },
    { kind: "summary", learned: ["B = draw notes. Pointer = select notes", "Velocity = dynamics (0–127)", "Cmd/Ctrl+U quantises notes to the grid"] },
  ],

  "audio-clips": [
    { kind: "hook", emoji: "🌊", headline: "Audio clips bend to your will", subtext: "Transpose, reverse, loop — original file stays safe." },
    { kind: "concept", title: "Audio clip editor", body: "Click an audio clip to open it in the Detail View. Adjust Transpose (semitones), Detune (cents), Loop start/end, and clip gain — all non-destructively referenced to the original file.", keyFact: "Transpose range: −48 to +48 semitones." },
    { kind: "concept", title: "Warp enables tempo lock", body: "Enable Warp on a clip and it locks to Live's project tempo regardless of its original BPM. Set warp markers at transients for precise grid alignment.", keyFact: "Warp OFF = plays at original speed. Warp ON = follows project BPM." },
    { kind: "interact", sim: "warp-lab", prompt: "Transpose a clip up 5 semitones and enable looping" },
    { kind: "quiz", q: "Editing an audio clip is…", options: ["Destructive", "Non-destructive — original untouched", "Disabled by default", "MIDI-only"], answer: 1, explain: "All clip edits are stored as instructions — the source audio file is never modified." },
    { kind: "quiz", q: "Transpose unit is…", options: ["Hz", "Cents", "Semitones", "Bars"], answer: 2, explain: "Semitones are the standard musical pitch unit — 12 semitones = 1 octave. +7 semitones = a perfect fifth up." },
    { kind: "quiz", q: "Detune unit is…", options: ["Hz", "Cents (hundredths of a semitone)", "Semitones", "Bars"], answer: 1, explain: "Cents are hundredths of a semitone — used for fine-tuning. 100 cents = 1 semitone." },
    { kind: "summary", learned: ["Clip transpose: ±48 semitones, non-destructive", "Detune in cents for fine pitch adjustment", "Warp ON = clip follows project BPM"] },
  ],

  "warping": [
    { kind: "hook", emoji: "⏳", headline: "Lock any sample to your tempo", subtext: "Warping stretches time without changing pitch." },
    { kind: "concept", title: "Warp modes overview", body: "Live has six warp modes optimised for different material: Beats (drums), Tones (melodic), Texture (pads), Re-Pitch (vinyl), Complex (full mixes), Complex Pro (best quality, most CPU).", keyFact: "Start with Beats for drums. Complex Pro for full mixes." },
    { kind: "concept", title: "Warp markers", body: "Place warp markers on transients to pin audio to the grid. Drag a marker to shift timing. Right-click a transient → Warp from Here (Straight) to quick-lock an entire loop to tempo.", keyFact: "Double-click the waveform display to add a warp marker." },
    { kind: "interact", sim: "warp-lab", prompt: "Set warp mode to Beats — adjust a drum loop to tempo" },
    { kind: "quiz", q: "Best warp mode for full mixes?", options: ["Beats", "Tones", "Re-Pitch", "Complex Pro"], answer: 3, explain: "Complex Pro uses a phase vocoder for independent time and pitch — highest quality for full mixes and vocals." },
    { kind: "quiz", q: "Warping changes…", options: ["Pitch only", "Time without changing pitch", "Both time and pitch", "Volume"], answer: 1, explain: "Warping moves audio in time independently from pitch — slow down a track without chipmunking the vocals." },
    { kind: "quiz", q: "Re-Pitch mode behaves like…", options: ["A vocoder", "A tape machine (pitch follows speed)", "A reverb", "A limiter"], answer: 1, explain: "Re-Pitch changes playback speed AND pitch together — classic vinyl or tape speed change behaviour." },
    { kind: "summary", learned: ["Beats = drums. Tones = melodic. Complex Pro = full mixes", "Warp changes timing without affecting pitch (except Re-Pitch)", "Drag warp markers to fix timing to the grid"] },
  ],

  "recording-audio": [
    { kind: "hook", emoji: "🔴", headline: "Get sound into Live", subtext: "Set input, arm the track, check levels, hit record." },
    { kind: "concept", title: "Recording setup", body: "Set the track's Audio From to your interface input. Arm the track (red circle). Set Monitor to Auto so you hear yourself without double playback. Check the meter — aim for peaks around −12 to −6 dBFS.", keyFact: "Never record into the red (0 dBFS). Leave headroom." },
    { kind: "concept", title: "Session vs Arrangement recording", body: "In Session View, record creates new clips in empty slots. In Arrangement, recording writes to the timeline at the playback position. Both honour the active loop brace.", keyFact: "Session records: clips per slot. Arrangement: continuous timeline." },
    { kind: "interact", sim: "mixer", prompt: "Arm a track and observe the input level meter" },
    { kind: "quiz", q: "Arm a track to…", options: ["Solo it", "Enable it for recording", "Mute it", "Group it"], answer: 1, explain: "Track arming (red button) enables recording on that track — only armed tracks capture incoming audio." },
    { kind: "quiz", q: "Monitor 'Auto' means…", options: ["Always on", "Always off", "On while armed, off during playback", "Triggered by clips"], answer: 2, explain: "Auto monitoring is on when the track is armed and Live isn't playing back — perfect for live recording without doubling." },
    { kind: "quiz", q: "Healthy input level peaks around…", options: ["0 dBFS", "−12 to −6 dBFS", "+6 dBFS", "−40 dBFS"], answer: 1, explain: "−12 to −6 dBFS leaves headroom for effects and transients without risking digital clipping." },
    { kind: "summary", learned: ["Arm track → check level (−12 to −6 dBFS) → record", "Monitor: Auto = hear yourself only while armed", "Session: clips. Arrangement: timeline blocks"] },
  ],

  "comping": [
    { kind: "hook", emoji: "✂️", headline: "Stitch the perfect take from many", subtext: "Take Lanes show each pass — drag to pick the best moments." },
    { kind: "concept", title: "Multi-take recording", body: "Enable loop recording and arm a track. Each pass creates a new Take Lane below. Keep recording as many passes as you like — nothing is overwritten.", keyFact: "Loop count shows how many takes you've recorded." },
    { kind: "concept", title: "Comp workflow", body: "In the top (comp) lane, drag across the sections you want from each take lane. Live automatically crossfades at edit points. Delete a lane selection to revert to the previous take.", keyFact: "Comping is non-destructive — all takes are preserved." },
    { kind: "interact", sim: "comp-lake", prompt: "Comp three take lanes into one finished performance" },
    { kind: "quiz", q: "Each recording pass becomes…", options: ["A separate track", "A new Take Lane", "A Scene", "A locator"], answer: 1, explain: "Each loop pass records a new lane below the main track — stacked takes ready for comping." },
    { kind: "quiz", q: "Comping is…", options: ["Destructive (deletes takes)", "Non-destructive (keeps all takes)", "MIDI-only", "Only for vocals"], answer: 1, explain: "All takes are preserved — comping is purely a selection/promotion process, nothing is deleted." },
    { kind: "quiz", q: "Crossfades between comp regions are…", options: ["Manual only", "Automatic", "Not supported", "Only on audio"], answer: 1, explain: "Live automatically creates crossfades between comp region boundaries — clicks at edits are handled transparently." },
    { kind: "summary", learned: ["Loop record = new take lane each pass", "Drag on comp lane to select best regions", "Non-destructive — all takes stay available"] },
  ],

  "slicing": [
    { kind: "hook", emoji: "🔪", headline: "Turn any loop into a playable kit", subtext: "Slice to MIDI chops audio onto Drum Rack pads instantly." },
    { kind: "concept", title: "Slice to New MIDI Track", body: "Right-click any audio clip → Slice to New MIDI Track. Live detects transients (or you set the grid), chops the audio, and maps each slice to a Drum Rack pad.", keyFact: "Slicing creates a Drum Rack with each slice on a pad." },
    { kind: "concept", title: "Remixing with slices", body: "Once sliced, re-trigger pads in any order via MIDI notes. Rearrange the MIDI clip in the piano roll to create entirely new rhythms from the original loop material.", keyFact: "Slice every 16th note for a complete phrase re-trigger toolkit." },
    { kind: "interact", sim: "session-grid", prompt: "Trigger sliced pads in a new rhythmic pattern" },
    { kind: "quiz", q: "Slicing to MIDI creates a…", options: ["Sampler", "Drum Rack with slice pads", "Wavetable preset", "Operator patch"], answer: 1, explain: "Each slice lands on a separate Drum Rack pad — you can process, retrigger, and re-pitch every hit independently." },
    { kind: "quiz", q: "You can slice by…", options: ["Transients only", "Grid only", "Transients, grid, or warp markers"], answer: 2, explain: "Three slice modes: transient detection, fixed rhythmic grid, or existing warp markers — each suits different material." },
    { kind: "quiz", q: "Each slice is triggered by…", options: ["A scene launch", "A MIDI note", "A macro knob", "A send dial"], answer: 1, explain: "Slices map to MIDI notes starting at C1 — play those notes via a MIDI clip or controller to trigger slices." },
    { kind: "summary", learned: ["Right-click clip → Slice to New MIDI Track", "Slices land on Drum Rack pads mapped to MIDI notes", "Rearrange MIDI notes to remix the loop"] },
  ],

  "mpe-tuning": [
    { kind: "hook", emoji: "🌈", headline: "Per-note bends, slides, and pressure", subtext: "MPE turns MIDI from a grid into an expressive instrument." },
    { kind: "concept", title: "What is MPE?", body: "MIDI Polyphonic Expression (MPE) gives each note its own pitch bend, pressure (aftertouch), and slide channel independently. Traditional MIDI applies these to all notes simultaneously.", keyFact: "MPE = per-finger expression. MIDI = all-notes expression." },
    { kind: "concept", title: "Tuning Systems in Live 12", body: "Live 12 added global Tuning Systems — load a Scala (.scl) file to use just intonation, 24-EDO, or historical temperaments. Every MPE-compatible instrument in the Set follows it.", keyFact: "Set tuning once per project — all devices follow automatically." },
    { kind: "interact", sim: "piano-roll", prompt: "Inspect per-note pitch bend data in an MPE clip" },
    { kind: "quiz", q: "MPE stands for…", options: ["MIDI Polyphonic Expression", "Multi Patch Editor", "Modular Performance Engine", "MIDI Pro Edition"], answer: 0, explain: "MPE enables each note to carry independent pitch bend, pressure, and slide — true per-finger expressivity." },
    { kind: "quiz", q: "Tuning Systems were added in…", options: ["Live 10", "Live 11", "Live 12"], answer: 2, explain: "Tuning Systems (Live 12) let you use microtonality, just intonation, and other tuning systems project-wide." },
    { kind: "quiz", q: "A .scl file is…", options: ["A sample file", "A Scala tuning definition file", "A Live preset"], answer: 1, explain: ".scl (Scala) files define alternative tuning systems — thousands are freely available for microtonal experimentation." },
    { kind: "summary", learned: ["MPE = independent pitch bend/pressure per note", "Traditional MIDI applies expression to all notes at once", "Live 12 adds global Tuning Systems via .scl files"] },
  ],

  "warp-modes-deep": [
    { kind: "hook", emoji: "🔬", headline: "Each warp mode has a sweet spot", subtext: "Wrong mode = artefacts. Right mode = transparent stretching." },
    { kind: "concept", title: "Percussive modes", body: "Beats mode slices audio at transients and warps each slice independently — ideal for drums and rhythmic loops. Set the Transient Loop Mode to control how slices fill gaps.", keyFact: "Beats mode: use Transient Envelope to control slice decay." },
    { kind: "concept", title: "Tonal and complex modes", body: "Tones mode uses a phase vocoder optimised for mono melodic material — bass lines, leads. Texture blends grains — great for pads. Complex Pro is Tones + higher quality + formant preservation.", keyFact: "Complex Pro: Formants ON prevents chipmunk effect on vocals." },
    { kind: "interact", sim: "warp-lab", prompt: "Switch modes on a drum loop — hear the difference" },
    { kind: "quiz", q: "Best mode for a bass line?", options: ["Beats", "Tones", "Texture", "Re-Pitch"], answer: 1, explain: "Tones uses a pitch-tracking phase vocoder optimised for monophonic melodic sources like bass lines and leads." },
    { kind: "quiz", q: "Formant preservation is in…", options: ["Beats", "Texture", "Complex Pro", "Re-Pitch"], answer: 2, explain: "Complex Pro includes a Formants control — critical for vocals to prevent the pitch-shifted chipmunk effect." },
    { kind: "quiz", q: "Vinyl-style speed+pitch shift uses…", options: ["Re-Pitch", "Complex Pro", "Beats", "Texture"], answer: 0, explain: "Re-Pitch changes tempo AND pitch together — slowing 50% drops pitch one octave, just like slowing a record." },
    { kind: "summary", learned: ["Beats = drums. Tones = melodic mono. Complex Pro = full mixes", "Complex Pro Formants = preserves vocal character on transpose", "Re-Pitch = classic tape/vinyl speed change behaviour"] },
  ],



  "instruments-overview": [
    { kind: "hook", emoji: "🎸", headline: "Live's built-in synths cover everything", subtext: "FM, wavetable, sampler, physical model — all included." },
    { kind: "concept", title: "The instrument roster", body: "Wavetable (modern workhorse), Operator (4-op FM), Drift (analog), Sampler/Simpler (sample-based), Drum Rack (kit container), Meld (MPE dual-engine, Live 12), Bass + Poli (preset-first, Live 12).", keyFact: "Every instrument is drag-and-drop onto a MIDI track." },
    { kind: "concept", title: "Choosing the right instrument", body: "FM for metallic, electric, complex timbres (Operator). Wavetable for evolving pads and leads. Simpler for one-shot samples. Sampler for multi-sampled instruments across the keyboard.", keyFact: "Drift: warm analog bass/lead. Meld: expressive MPE sound design." },
    { kind: "interact", sim: "device-lab", prompt: "Load Wavetable and explore the preset browser" },
    { kind: "quiz", q: "Meld is what kind of synth?", options: ["FM synthesis", "Subtractive only", "MPE dual-engine", "Granular"], answer: 2, explain: "Meld (Live 12) has two independent engines designed for MPE expression — blend or split them per voice." },
    { kind: "quiz", q: "Operator uses…", options: ["Subtractive synthesis", "FM synthesis", "Wavetable synthesis", "Granular synthesis"], answer: 1, explain: "Operator is a 4-operator FM synth — one operator modulates another's frequency to create complex harmonics." },
    { kind: "quiz", q: "Drift was added in…", options: ["Live 9", "Live 10", "Live 11", "Live 12"], answer: 2, explain: "Drift arrived in Live 11 — a compact subtractive synth with analog-style instability and warm filters." },
    { kind: "summary", learned: ["Wavetable = modern pads/leads. Operator = FM complexity", "Drift = analog warmth. Meld = MPE expression", "Simpler = one sample. Sampler = multi-sample kits"] },
  ],

  "drum-rack": [
    { kind: "hook", emoji: "🥁", headline: "16 pads, infinite kits", subtext: "Each pad is its own instrument chain with effects." },
    { kind: "concept", title: "Drum Rack structure", body: "Drum Rack is a container holding up to 128 pads, each mapped to a MIDI note. Every pad hosts a device chain (typically a Simpler), its own mixer, and its own send amounts.", keyFact: "Drag any sample directly onto a pad to load it instantly." },
    { kind: "concept", title: "Choke groups and macros", body: "Assign pads to Choke groups to make them cut each other off — essential for hi-hats (closed hat cuts open hat). Macro knobs at the top control assigned parameters across the whole rack.", keyFact: "Choke group = open hat + closed hat in same group number." },
    { kind: "interact", sim: "beat-builder", prompt: "Build a 4-on-the-floor pattern using the Drum Rack pads" },
    { kind: "quiz", q: "Choke groups are useful for…", options: ["Reverb busses", "Hi-hat open/close relationships", "Bass lines", "Master volume"], answer: 1, explain: "Choke groups silence other pads in the same group — essential for realistic hi-hat behaviour." },
    { kind: "quiz", q: "Each Drum Rack pad hosts…", options: ["A full track", "An independent device chain", "A scene", "A clip"], answer: 1, explain: "Each pad is a self-contained chain — Simpler + effects — with its own level, pan, and sends." },
    { kind: "quiz", q: "Drum Rack pads map to…", options: ["Audio inputs", "MIDI notes", "Send dials", "Macros"], answer: 1, explain: "Pads map to MIDI notes starting at C1 — your MIDI controller or piano roll triggers them." },
    { kind: "summary", learned: ["Each pad = independent chain with Simpler + effects", "Choke groups: same number = pads cut each other", "Macro knobs control parameters across the whole rack"] },
  ],

  "wavetable": [
    { kind: "hook", emoji: "🌀", headline: "Wavetable is Live's modern workhorse synth", subtext: "Two oscillators scan through waveforms in real time." },
    { kind: "concept", title: "Wavetable architecture", body: "Two oscillators each scan through a wavetable (a library of single-cycle waveforms). Sweep the Position knob to morph through timbres. Each oscillator has a sub-oscillator and noise source.", keyFact: "Two oscillators. Two filters. Two envelopes. Two LFOs." },
    { kind: "concept", title: "Modulation matrix", body: "The modulation matrix at the bottom lets you drag any source (LFO, envelope, MIDI expression, velocity) to any destination. Connect Env 2 to Filter Cutoff for a classic synth filter sweep.", keyFact: "Drag from source row to destination column to patch modulation." },
    { kind: "interact", sim: "device-lab", prompt: "Sweep the oscillator Position knob — hear the wavetable scan" },
    { kind: "quiz", q: "Wavetable's modulation matrix is at the…", options: ["Top of the device", "Bottom of the device", "Side panel", "Separate window"], answer: 1, explain: "The mod matrix occupies the bottom section of Wavetable — drag source to destination to create modulation." },
    { kind: "quiz", q: "Wavetable has how many oscillators?", options: ["1", "2", "4", "6"], answer: 1, explain: "Two oscillators, each with its own wavetable, position control, and sub-oscillator for rich layered tones." },
    { kind: "quiz", q: "Unison mode creates…", options: ["A single clean voice", "Multiple detuned voice copies", "A reverb effect", "Distortion"], answer: 1, explain: "Unison stacks multiple copies of a voice slightly detuned — creates thick, chorus-like pads and supersaw leads." },
    { kind: "summary", learned: ["Position knob scans through the wavetable in real time", "Modulation matrix: drag source to destination", "Unison = stacked detuned voices for thick sound"] },
  ],

  "operator": [
    { kind: "hook", emoji: "🔔", headline: "FM synthesis demystified", subtext: "One oscillator modulates another — complex harmonics emerge." },
    { kind: "concept", title: "Operators and algorithms", body: "Operator has 4 operators (A, B, C, D) arranged in one of 11 algorithms. Carriers make sound; modulators colour it. The algorithm determines which operators feed into which.", keyFact: "Higher modulator output level = more harmonics = brighter sound." },
    { kind: "concept", title: "FM ratios and timbre", body: "The Coarse and Fine ratio controls set the harmonic relationship between operators. Whole-number ratios (1:1, 2:1) produce harmonic timbres. Fractional ratios (1.5, 2.35) produce inharmonic, bell-like tones.", keyFact: "Integer ratios = harmonic. Fractional = metallic/inharmonic." },
    { kind: "interact", sim: "device-lab", prompt: "Adjust operator B's output level — hear harmonics change" },
    { kind: "quiz", q: "Operator has how many operators?", options: ["2", "4", "6", "8"], answer: 1, explain: "Operator has 4 operators in 11 configurable algorithms — same structure as the classic Yamaha DX7." },
    { kind: "quiz", q: "Carriers do what?", options: ["Only modulate", "Output audible sound", "Both modulate and output equally", "Neither"], answer: 1, explain: "Carriers are operators whose output reaches your ears — modulators feed into carriers to colour the timbre." },
    { kind: "quiz", q: "Fractional ratios between operators produce…", options: ["Pure harmonic tones", "Inharmonic / metallic timbres", "No sound", "Noise"], answer: 1, explain: "Non-integer ratio relationships create inharmonic sidebands — the metallic, bell-like character of FM synthesis." },
    { kind: "summary", learned: ["4 operators: Carriers = output. Modulators = colour", "Algorithm sets which operators connect to which", "Integer ratios = harmonic. Fractional = metallic/inharmonic"] },
  ],

  "sampler-simpler": [
    { kind: "hook", emoji: "🎙", headline: "Play any sound as an instrument", subtext: "Drag audio onto a MIDI track — instant playable instrument." },
    { kind: "concept", title: "Simpler — one sample powerhouse", body: "Simpler loads a single sample and lets you play it across the keyboard. Three modes: Classic (looping), One-Shot (non-looping, good for drums), Slice (chops for groove work).", keyFact: "Drag audio to a MIDI track → Live auto-creates a Simpler." },
    { kind: "concept", title: "Sampler — multi-sample instrument", body: "Sampler handles full multi-sampled instruments with key zones, velocity layers, and round-robin switching. Build a concert grand or a sampled brass section — each note has its own sample.", keyFact: "Simpler = 1 sample. Sampler = hundreds mapped across keyboard." },
    { kind: "interact", sim: "device-lab", prompt: "Load a sample into Simpler and play it across the keyboard" },
    { kind: "quiz", q: "Simpler's three modes are…", options: ["Loop, Pad, Drum", "Classic, One-Shot, Slice", "FM, AM, PM", "A, B, C"], answer: 1, explain: "Classic for looping, One-Shot for drums, Slice for chopping — each optimised for different sample workflows." },
    { kind: "quiz", q: "For a multi-sampled piano, use…", options: ["Simpler", "Sampler", "Operator", "Drift"], answer: 1, explain: "Sampler handles key zones and velocity layers — load different samples per range for realistic instruments." },
    { kind: "quiz", q: "Drag audio to a MIDI track creates…", options: ["A Sampler with zones", "A Simpler automatically", "An Operator patch", "A Drum Rack"], answer: 1, explain: "Live auto-creates a Simpler with the dragged sample loaded — quickest way to make any sound playable." },
    { kind: "summary", learned: ["Simpler: 1 sample, 3 modes (Classic/One-Shot/Slice)", "Sampler: multi-sample zones + velocity layers", "Drag audio to MIDI track = instant Simpler"] },
  ],

  "eq-eight": [
    { kind: "hook", emoji: "📊", headline: "Shape every frequency with 8 bands", subtext: "Cut what's wrong before boosting what's right." },
    { kind: "concept", title: "EQ Eight essentials", body: "EQ Eight provides 8 independent parametric bands — each switchable between bell, shelf, high-pass, low-pass, and notch shapes. Boost or cut any frequency range with frequency, gain, and Q controls.", keyFact: "High-pass filter removes low-end rumble below your set frequency." },
    { kind: "concept", title: "Subtractive EQ philosophy", body: "Cut problem frequencies before adding any boosts. Narrow cuts remove resonances cleanly. Broad boosts enhance character. Sweep a boosted band to find the problem — then cut that instead.", keyFact: "EQ subtractive first = more headroom, more transparent mix." },
    { kind: "interact", sim: "device-lab", prompt: "Apply a high-pass filter at 80 Hz to remove sub rumble" },
    { kind: "quiz", q: "EQ Eight has how many bands?", options: ["4", "6", "8", "10"], answer: 2, explain: "8 independent bands cover the full spectrum with multiple filter shapes per band." },
    { kind: "quiz", q: "Remove sub rumble with a…", options: ["High shelf boost", "Low shelf cut", "High-pass filter", "Notch filter"], answer: 2, explain: "A high-pass filter passes frequencies above the cutoff — removing everything below, including low-end rumble." },
    { kind: "quiz", q: "Subtractive EQ means…", options: ["Only boosting", "Cutting first, before boosting", "Using narrow boosts only", "Bypassing bands"], answer: 1, explain: "Subtractive EQ cuts problem areas first — sounds more natural than boosting and creates more headroom." },
    { kind: "summary", learned: ["8 bands — bell, shelf, HP/LP, notch shapes", "High-pass removes rumble below cutoff frequency", "Subtractive first: cut problems before adding boosts"] },
  ],

  "compressor": [
    { kind: "hook", emoji: "🗜", headline: "Tame dynamics, add punch", subtext: "Six parameters, one device — the most important in the chain." },
    { kind: "concept", title: "The six parameters", body: "Threshold sets when compression starts. Ratio sets how much. Attack sets how fast it clamps. Release sets how fast it lets go. Knee controls the transition smoothness. Makeup gain restores level.", keyFact: "Slow attack lets transients through. Fast attack squashes them." },
    { kind: "concept", title: "Compression for feel", body: "Compressor doesn't just control dynamics — it shapes feel. Fast attack + medium release = punch and pump. Slow attack + fast release = transparent levelling. Sidechain view = frequency-dependent shaping.", keyFact: "Knee: hard = abrupt. Soft = gradual. Soft knee sounds more natural." },
    { kind: "interact", sim: "device-lab", prompt: "Compress a drum loop — find the attack/release sweet spot" },
    { kind: "quiz", q: "Slower attack lets through more…", options: ["Bass", "Transients", "Reverb tail", "Pitch information"], answer: 1, explain: "Slow attack means the compressor takes time to engage — transients (fast hits) pass through before it clamps down." },
    { kind: "quiz", q: "4:1 ratio means…", options: ["4 dB over threshold → 1 dB out", "1 dB over → 4 dB out", "No effect", "Infinite limiting"], answer: 0, explain: "4:1 ratio: for every 4 dB above threshold, only 1 dB passes through. More ratio = heavier squash." },
    { kind: "quiz", q: "Makeup gain compensates for…", options: ["Pitch", "Level lost during compression", "Reverb", "CPU load"], answer: 1, explain: "Compression reduces peak levels — makeup gain raises the overall output to compensate and maintain perceived loudness." },
    { kind: "summary", learned: ["Threshold triggers. Ratio squashes. Attack/Release shape the feel", "Slow attack = more transient punch. Fast = squashed", "Makeup gain restores output level after compression"] },
  ],

  "reverb-delay": [
    { kind: "hook", emoji: "🏛", headline: "Space and echo define depth", subtext: "Reverb = room. Delay = echo. Both create dimension." },
    { kind: "concept", title: "Reverb types in Live", body: "Reverb is Live's algorithmic reverb (size, decay, diffusion). Hybrid Reverb (Live 11+) combines convolution IRs with algorithmic processing. Always use Returns for reverb — one instance serves all tracks.", keyFact: "Pre-delay (20–30 ms) keeps vocals clear before the reverb washes in." },
    { kind: "concept", title: "Delay devices", body: "Delay is a simple tempo-synced delay. Echo (Live 11) adds vintage character — wobble, filter, modulation. Set delay time to musical divisions (1/8, 1/4) for rhythmic lock to your project tempo.", keyFact: "Tempo-sync delay: use 1/8 note for a tight slap; 1/4 for classic echo." },
    { kind: "interact", sim: "send-return", prompt: "Route a track to a Return with Reverb — adjust decay" },
    { kind: "quiz", q: "Hybrid Reverb combines…", options: ["Two algorithms", "Convolution IRs + algorithmic processing", "Delay + reverb", "EQ + reverb"], answer: 1, explain: "Hybrid Reverb (Live 11) blends real-room convolution IRs with algorithmic reverb for unprecedented space control." },
    { kind: "quiz", q: "Put reverb on a Return because…", options: ["It sounds better", "One instance serves many tracks (CPU efficient + cohesive)", "It's louder", "Required by Live"], answer: 1, explain: "One reverb on a return track shared by sends from 20 tracks uses far less CPU than 20 separate reverb instances." },
    { kind: "quiz", q: "Echo is…", options: ["A reverb device", "A vintage-flavored delay with character", "A limiter", "An EQ"], answer: 1, explain: "Echo (Live 11) is a multi-mode delay with analog character — wobble, tape-style filtering, and modulation." },
    { kind: "summary", learned: ["Reverb: Hybrid Reverb = convolution + algorithmic", "Pre-delay separates dry signal before reverb tail", "Always use Returns for shared reverb/delay (CPU + cohesion)"] },
  ],

  "saturator-distortion": [
    { kind: "hook", emoji: "🔥", headline: "Add grit, add glue, add life", subtext: "Saturation is the secret ingredient in every great mix." },
    { kind: "concept", title: "Saturator essentials", body: "Saturator applies waveshaping — gently clipping signal peaks to add harmonic content. The Drive knob pushes the signal into the curve. Soft clip = warmth. Hard clip = aggression. Sine fold = complex.", keyFact: "Even harmonics (2nd, 4th) = warmth. Odd harmonics = grit." },
    { kind: "concept", title: "Roar — Live 12's multi-band distortion", body: "Roar (Live 12) splits the signal into up to 3 frequency bands, distorts each independently, and recombines. Feed the mid band aggressively while keeping lows clean for modern bass processing.", keyFact: "Roar's feedback path creates self-oscillating distortion textures." },
    { kind: "interact", sim: "device-lab", prompt: "Apply Saturator to a drum bus — increase Drive gradually" },
    { kind: "quiz", q: "Roar was added in…", options: ["Live 10", "Live 11", "Live 12", "Live 13"], answer: 2, explain: "Roar (Live 12) is a multi-band saturation/distortion device with independent band processing and feedback paths." },
    { kind: "quiz", q: "Drive in Saturator controls…", options: ["Pitch", "How hard the signal hits the waveshaping curve", "Reverb size", "Pan position"], answer: 1, explain: "Drive pushes the signal harder into Saturator's curve — more drive = more harmonics = thicker, grittier tone." },
    { kind: "quiz", q: "Even harmonics (2nd, 4th) sound…", options: ["Gritty and harsh", "Warm and pleasing", "Out of tune", "Like noise"], answer: 1, explain: "Even harmonics are octaves and fifths above the fundamental — they sound musical and warm, which is why tube saturation is pleasant." },
    { kind: "summary", learned: ["Drive pushes signal into the waveshaping curve", "Even harmonics = warmth. Odd harmonics = grit", "Roar (Live 12) = multi-band independent distortion"] },
  ],

  "midi-effects": [
    { kind: "hook", emoji: "🎲", headline: "Process notes before they hit the synth", subtext: "MIDI effects transform notes — transpose, arpeggiate, force to scale." },
    { kind: "concept", title: "The MIDI effects chain", body: "MIDI effects sit before the instrument in a MIDI track's device chain. They transform incoming MIDI notes — adding, removing, delaying, or transposing them before the instrument receives them.", keyFact: "MIDI effects: Arpeggiator → Chord → Scale → Note Echo → Velocity." },
    { kind: "concept", title: "Essential MIDI effects", body: "Arpeggiator fans chord notes into sequences. Chord stacks intervals on every input note. Scale MIDI effect forces all notes into a chosen scale — eliminates wrong notes instantly.", keyFact: "Scale device + any melody = always in key. Great safety net." },
    { kind: "interact", sim: "piano-roll", prompt: "Add an Arpeggiator — hold a chord and hear it play out" },
    { kind: "quiz", q: "Force notes into a scale with…", options: ["Chord device", "Scale MIDI device", "Random device", "Velocity device"], answer: 1, explain: "Scale MIDI device maps all incoming notes to the nearest note in the chosen scale — musical training wheels that work." },
    { kind: "quiz", q: "Arpeggiator turns held chords into…", options: ["Pads", "Sequential note runs", "Reverb", "Bass lines only"], answer: 1, explain: "Arpeggiator takes held chords and plays the notes sequentially — rate, direction, and pattern are configurable." },
    { kind: "quiz", q: "MIDI effects sit…", options: ["After the instrument", "Before the instrument", "On the Master track", "On Return tracks"], answer: 1, explain: "MIDI effects transform note data before it reaches the instrument — always before the synth in the chain order." },
    { kind: "summary", learned: ["MIDI effects sit before the instrument in the chain", "Scale device = guaranteed in-key notes", "Arpeggiator = chords to sequential runs at set rate"] },
  ],

  "racks-macros": [
    { kind: "hook", emoji: "🎛", headline: "Wrap chains, map controls, perform", subtext: "Racks group devices. Macros expose 16 controls on one panel." },
    { kind: "concept", title: "Racks as containers", body: "Instrument Racks, Audio Effect Racks, and MIDI Effect Racks group devices into one unit. Chains inside a Rack can run in parallel (layers) or be split by key zone, velocity, or Chain Selector.", keyFact: "Cmd/Ctrl+G around selected devices = instant Rack." },
    { kind: "concept", title: "Macros and Variations", body: "Right-click any parameter → Map to Macro. Up to 16 macros per Rack expose your most important controls. Macro Variations (Live 12) snapshot all 16 macro values for instant patch switching and morphing.", keyFact: "Macro Variations: save verse sound, save drop sound, morph between." },
    { kind: "interact", sim: "device-chain", prompt: "Map filter cutoff to Macro 1 and automate it" },
    { kind: "quiz", q: "How many macros per Rack (Live 11+)?", options: ["8", "12", "16", "32"], answer: 2, explain: "Live 11 expanded Racks to 16 macros — enough to expose every key parameter from every device in the chain." },
    { kind: "quiz", q: "Macro Variations are…", options: ["Plugin presets", "Snapshots of all 16 macro values", "Scene triggers", "Audio sends"], answer: 1, explain: "Macro Variations (Live 12) snapshot all 16 macro knob positions — instantly recall different sound states." },
    { kind: "quiz", q: "Chain Selector splits chains by…", options: ["MIDI notes only", "Key range, velocity, or chain zone", "Audio level only", "Returns"], answer: 1, explain: "Chain Selector splits by key zone (splits), velocity (dynamics-based), or chain zone (morphing between sounds)." },
    { kind: "summary", learned: ["Racks group devices into one unit with parallel chains", "16 macros map to any parameter across the whole chain", "Macro Variations (Live 12) = snapshot + morph between states"] },
  ],



  // ─── CHAPTER 3: THE MIX ─────────────────────────────────────────────────

  "the-mixer": [
    { kind: "hook", emoji: "🎚", headline: "The mixer is the centre of control", subtext: "Faders, pans, meters — every track has its own strip." },
    { kind: "concept", title: "Mixer anatomy", body: "Each track has a volume fader, pan, mute (M), solo (S), arm button, and cue button. The crossfader assigns tracks to A or B for DJ blending. In Session View the mixer is fully visible on the right.", keyFact: "Don't ride hot — keep faders at unity (0 dB) and use gain staging." },
    { kind: "concept", title: "Gain staging fundamentals", body: "Gain staging means controlling level at every stage — before effects, at the group bus, and at the master. Start with track levels peaking around −6 to −12 dBFS so the mix bus has headroom.", keyFact: "Master fader at unity. Let individual tracks control balance." },
    { kind: "interact", sim: "mixer", prompt: "Balance three tracks — no channel peaks above −6 dBFS" },
    { kind: "quiz", q: "Soloing a track…", options: ["Mutes the soloed track", "Mutes all other tracks", "Records the track", "Groups it with others"], answer: 1, explain: "Solo mutes all other tracks so you hear only the soloed track — essential for checking individual elements." },
    { kind: "quiz", q: "Crossfader is for…", options: ["EQ between tracks", "DJ-style A/B blending", "Reverb amount", "Pitch shifting"], answer: 1, explain: "The crossfader blends tracks assigned to A or B sides — perfect for DJ mixes and live performance transitions." },
    { kind: "quiz", q: "Gain staging targets track peaks around…", options: ["0 dBFS", "−6 to −12 dBFS during mixing", "+3 dBFS", "−40 dBFS"], answer: 1, explain: "−6 to −12 dBFS on individual tracks leaves headroom for effects and the mix bus without clipping." },
    { kind: "summary", learned: ["Fader at unity (0 dB) — use input gain to control levels", "Solo = mutes all other tracks temporarily", "Gain stage: tracks at −6 to −12 dBFS, master at unity"] },
  ],

  "sends-returns": [
    { kind: "hook", emoji: "📬", headline: "Share effects — save CPU — get glue", subtext: "One reverb on a Return serves every track in the mix." },
    { kind: "concept", title: "How sends and returns work", body: "Each track has a Send knob per Return track. Turn up the Send to route a portion of the track's signal to that Return. The Return hosts the shared effect (reverb, delay) and outputs to Master.", keyFact: "Cmd/Ctrl+Alt+T = create new Return track." },
    { kind: "concept", title: "Pre vs Post fader sends", body: "Post-fader (default) sends a proportion of the post-fader signal — when you lower the track volume, the send amount reduces proportionally. Pre-fader sends are independent of the volume fader.", keyFact: "Pre-fader = for monitors. Post-fader = for effects (most common)." },
    { kind: "interact", sim: "send-return", prompt: "Add Send A to multiple tracks — share one reverb instance" },
    { kind: "quiz", q: "Pre-fader send is independent of…", options: ["Pan knob", "Volume fader", "Solo button", "Mute state"], answer: 1, explain: "Pre-fader send level doesn't change when you move the volume fader — useful for monitor mixes and DJ setups." },
    { kind: "quiz", q: "Returns receive…", options: ["MIDI data", "Send signals from tracks", "Audio inputs", "Scene launches"], answer: 1, explain: "Return tracks are the destination for sends — they host shared effects and output to Master." },
    { kind: "quiz", q: "Using a return reverb instead of per-track saves…", options: ["More reverb", "CPU and creates mix cohesion", "Pitch", "Quantize steps"], answer: 1, explain: "One reverb instance on a Return vs 20 instances = fraction of the CPU, and a single reverb space glues the mix." },
    { kind: "summary", learned: ["Send knob routes track signal to Return track", "Post-fader (default) follows volume fader", "Returns: CPU-efficient + creates mix cohesion"] },
  ],

  "groups-routing": [
    { kind: "hook", emoji: "📦", headline: "Groups are real audio buses", subtext: "Compress the drum bus. EQ the vocal group. Automate the stem." },
    { kind: "concept", title: "Creating and using Groups", body: "Select multiple tracks → Cmd/Ctrl+G to create a Group. The Group track is a real audio bus — sum all children, add a compressor for glue, automate the group level as one, or render the stem.", keyFact: "Group bus = sub-mix + shared processing for multiple tracks." },
    { kind: "concept", title: "Advanced routing with Track I/O", body: "Every track's I/O section lets you route to any other track — send a synth through a bus track with extra effects, or use Resampling to capture Live's master output onto an audio track.", keyFact: "Resampling: Audio From = Resampling → captures master mix." },
    { kind: "interact", sim: "routing-puzzle", prompt: "Route three tracks into a Group and add a bus compressor" },
    { kind: "quiz", q: "Group tracks are…", options: ["Folder labels only — no audio", "Real audio buses with processing", "Return track variants", "MIDI-only containers"], answer: 1, explain: "Group tracks sum their children's audio — add compressor, EQ, or any effect to process the whole group as one bus." },
    { kind: "quiz", q: "Resampling sends…", options: ["Track output to hardware", "Master output back to an audio track input", "MIDI to a synth", "Groups to returns"], answer: 1, explain: "Resampling routes master output back to an audio track — capture your mix, effects chain, or live session performance." },
    { kind: "quiz", q: "Cmd/Ctrl+G shortcut…", options: ["Saves the project", "Groups selected tracks", "Quantizes notes", "Starts recording"], answer: 1, explain: "Cmd/Ctrl+G groups the selected tracks instantly — faster than right-clicking the track headers." },
    { kind: "summary", learned: ["Cmd/Ctrl+G = group selected tracks into a bus", "Groups are real audio buses — add effects to the bus", "Resampling captures master output to an audio track"] },
  ],

  "automation": [
    { kind: "hook", emoji: "✏️", headline: "Make parameters move over time", subtext: "Draw automation in Arrangement — or record it live." },
    { kind: "concept", title: "Automation in Arrangement", body: "Press A in Arrangement View to show all automation lanes. Click a parameter lane to see its envelope. Draw breakpoints with the pencil, drag to move — any parameter in any device can be automated.", keyFact: "A = show automation lanes. Cmd/Ctrl+Z = undo any drawn point." },
    { kind: "concept", title: "Clip Envelopes and curved automation", body: "Clip Envelopes store automation inside the clip — they travel with it when moved. Live 11+ adds shaped curves: draw a line between two points, then drag the midpoint to bend it.", keyFact: "Clip envelope + loop = automation repeats with the clip." },
    { kind: "interact", sim: "arrangement", prompt: "Automate a filter cutoff — draw a rise over 8 bars" },
    { kind: "quiz", q: "Show automation lanes in Arrangement with…", options: ["B", "A", "S", "M"], answer: 1, explain: "Pressing A reveals all automation lanes underneath each track — then select which parameter lane to edit." },
    { kind: "quiz", q: "Clip-only automation lives in…", options: ["The Mixer", "Clip Envelopes", "The Master track", "Return lanes"], answer: 1, explain: "Clip Envelopes store automation that loops with the clip and moves with it — unlike track automation which stays in place." },
    { kind: "quiz", q: "Curved automation envelopes arrived in…", options: ["Live 9", "Live 10", "Live 11", "Live 12"], answer: 2, explain: "Curved (Bezier-style) automation curves were added in Live 11 — drag the midpoint of a line segment to curve it." },
    { kind: "summary", learned: ["A = show all automation lanes in Arrangement", "Clip Envelopes: automation that travels with the clip", "Live 11 adds curved (Bezier) automation shapes"] },
  ],

  "modulation-lanes": [
    { kind: "hook", emoji: "〰️", headline: "Modulation stacks on top of automation", subtext: "Live 12's offset-based modulation adds motion without overwriting." },
    { kind: "concept", title: "What is modulation (Live 12)?", body: "Arrangement Modulation lanes add offset-based parameter changes on top of existing automation. The modulation value is added to the automation value — both coexist without conflict.", keyFact: "Automation = absolute position. Modulation = relative offset." },
    { kind: "concept", title: "Practical uses", body: "Combine automation (a filter sweep from A to B over 32 bars) with modulation (a subtle LFO-style wave that adds texture on top). This layered approach creates evolving, non-repetitive movement.", keyFact: "Modulation + automation = macro-level + micro-level movement." },
    { kind: "interact", sim: "arrangement", prompt: "Add a modulation lane to a reverb send — draw gentle variation" },
    { kind: "quiz", q: "Live 12 modulation is…", options: ["Absolute (replaces automation)", "Offset-based (adds to automation)", "MIDI-only", "Disabled by default"], answer: 1, explain: "Modulation is offset-based — it adds to existing automation values rather than replacing them. Both coexist." },
    { kind: "quiz", q: "Modulation stacks with…", options: ["Nothing — they're separate", "Automation values", "Clip gains only", "Solo states"], answer: 1, explain: "Modulation and automation add together on the same parameter — use both for layered, evolving control." },
    { kind: "quiz", q: "Modulation lanes appeared in…", options: ["Live 10", "Live 11", "Live 12"], answer: 2, explain: "Arrangement Modulation lanes are a Live 12 feature — offset-based motion on top of existing automation." },
    { kind: "summary", learned: ["Modulation = offset added on top of automation", "Both can exist on the same parameter simultaneously", "Modulation lanes are a Live 12 Arrangement feature"] },
  ],

  "sidechain": [
    { kind: "hook", emoji: "🎵", headline: "The kick tells the bass to duck", subtext: "Sidechain compression creates the pulse of dance music." },
    { kind: "concept", title: "How sidechain works", body: "A compressor can use a different track as its trigger source — the sidechain input. When the kick hits, it triggers the compressor on the bass or pad track, ducking it momentarily. That duck IS the pump.", keyFact: "Kick → Sidechain Input of Compressor on Bass = classic EDM pump." },
    { kind: "concept", title: "Sculpting the pump shape", body: "Attack determines how quickly the duck happens (fast = immediate grab). Release determines how quickly the signal recovers (medium = musical breathing). The release length shapes the pump's musical feel.", keyFact: "Fast attack + 150–200ms release = the iconic dance floor pump." },
    { kind: "interact", sim: "sidechain", prompt: "Set kick as sidechain source — hear the pad duck on each hit" },
    { kind: "quiz", q: "Sidechain ducks…", options: ["The kick track", "The track the compressor is on", "The reverb return", "The master bus"], answer: 1, explain: "The compressor sits on the track being ducked — sidechain input determines what triggers the compression." },
    { kind: "quiz", q: "Classic pump settings use…", options: ["Slow attack, slow release", "Fast attack, medium release (~150ms)", "No attack, no release", "Soft knee only"], answer: 1, explain: "Fast attack grabs immediately when kick hits. Medium release lets signal breathe back before next kick — the classic EDM pulse." },
    { kind: "quiz", q: "Sidechain input panel is on the…", options: ["EQ Eight device", "Compressor device", "Reverb device", "Saturator device"], answer: 1, explain: "Expand the Sidechain panel inside the Compressor to choose the trigger source track." },
    { kind: "summary", learned: ["Sidechain = external trigger source for a compressor", "Kick → sidechain → bass/pad compressor = EDM pump", "Fast attack + ~150ms release = musical pump shape"] },
  ],

  "max-for-live": [
    { kind: "hook", emoji: "🔌", headline: "Build your own devices in Live", subtext: "Max for Live is a visual programming environment inside Live Suite." },
    { kind: "concept", title: "What is Max for Live?", body: "Max for Live (M4L) integrates Cycling '74's Max environment directly into Live Suite. Connect objects with patch cables visually to build custom synths, sequencers, MIDI tools, and analysis devices.", keyFact: "M4L ships with Suite. Hundreds of free devices at maxforlive.com." },
    { kind: "concept", title: "Essential M4L devices", body: "Live ships with polished M4L devices: LFO (modulate any parameter), Envelope Follower (audio amplitude → modulation), Convolution Reverb (custom IR reverb), Max MIDI Effect (generative sequencing).", keyFact: "LFO device: drag its output to any parameter for instant modulation." },
    { kind: "interact", sim: "device-chain", prompt: "Patch an LFO device to filter cutoff — sweep the frequency" },
    { kind: "quiz", q: "M4L ships with…", options: ["Intro", "Standard", "Suite only", "Lite"], answer: 2, explain: "Max for Live is exclusive to Live Suite — the top-tier license that includes all features and premium devices." },
    { kind: "quiz", q: "Envelope Follower is…", options: ["A clip effect", "An M4L device that tracks audio amplitude", "A scene launcher", "A track type"], answer: 1, explain: "Envelope Follower (M4L) tracks the amplitude of audio and converts it to a modulation signal — duck anything from a kick." },
    { kind: "quiz", q: "Max programming is…", options: ["Text-based (like Python)", "Visual/node-based (patch cables)", "A plugin format", "A file format"], answer: 1, explain: "Max uses visual programming — connect nodes with patch cables to create custom signal processing, no typing required." },
    { kind: "summary", learned: ["M4L = visual programming environment in Live Suite", "LFO, Envelope Follower, Conv. Reverb are essential M4L devices", "Thousands of free M4L devices at maxforlive.com"] },
  ],

  "glue-compressor": [
    { kind: "hook", emoji: "🔗", headline: "Glue Compressor binds a mix together", subtext: "Bus compression makes multiple tracks sound like one." },
    { kind: "concept", title: "What makes Glue Compressor special", body: "Glue Compressor models an SSL G-Bus compressor — famous for making mixes 'stick together'. Low ratios (2:1, 4:1), slow attack, and the Makeup and Dry/Wet controls make subtle bus glue straightforward.", keyFact: "Try: Threshold −10, Ratio 4:1, Attack 30ms, Release Auto." },
    { kind: "concept", title: "Parallel compression", body: "Glue Compressor's Dry/Wet knob enables parallel (New York) compression — mix heavily compressed signal with the dry original. You get the punch of compression without losing transient snap.", keyFact: "Dry/Wet at 30–50% = classic parallel bus compression sound." },
    { kind: "interact", sim: "device-lab", prompt: "Apply Glue Compressor to a drum group — find the sweet spot" },
    { kind: "quiz", q: "Glue Compressor models a…", options: ["Neve 1073 preamp", "SSL G-Bus compressor", "Fairchild 670 limiter", "Urei 1176"], answer: 1, explain: "Glue Compressor emulates the SSL G-Bus master bus compressor — the classic 'glue' sound of commercial mixes." },
    { kind: "quiz", q: "Parallel compression mixes…", options: ["Two reverbs", "Compressed + dry signal together", "Two limiters", "EQ + compressor"], answer: 1, explain: "Parallel (New York) compression blends heavily compressed signal with the uncompressed dry signal for punch + transients." },
    { kind: "quiz", q: "Auto Release on Glue Compressor…", options: ["Disables the release", "Intelligently tracks the music's dynamics", "Applies maximum release", "Bypasses compression"], answer: 1, explain: "Auto Release analyses the audio and adjusts release timing musically — works well for program material." },
    { kind: "summary", learned: ["Glue Compressor = SSL G-Bus model for bus compression", "Low ratio, slow attack = subtle mix glue", "Dry/Wet knob enables parallel compression easily"] },
  ],

  "limiter-truepeak": [
    { kind: "hook", emoji: "🚧", headline: "The limiter is the last line of defence", subtext: "Nothing gets past 0 dBFS. Protect the master." },
    { kind: "concept", title: "Limiter device", body: "Live's Limiter applies a hard ceiling — no signal above the ceiling threshold gets through. Set Ceiling to −0.3 dBFS (not 0!) to account for inter-sample peaks that can clip D/A converters.", keyFact: "Set ceiling to −0.3 to −1 dBFS, not 0 dBFS. ISP prevention." },
    { kind: "concept", title: "True Peak and metering", body: "True Peak metering detects inter-sample peaks (ISP) — audio values between digital samples that can clip on playback even if peak meters read below 0. Modern streaming targets: −14 LUFS integrated.", keyFact: "Streaming standard: −14 LUFS. Leave 1 dB true peak headroom." },
    { kind: "interact", sim: "mixer", prompt: "Set Limiter ceiling and observe true peak meter behaviour" },
    { kind: "quiz", q: "Limiter ceiling is best set to…", options: ["0 dBFS exactly", "−0.3 to −1 dBFS", "+3 dBFS", "−12 dBFS"], answer: 1, explain: "−0.3 to −1 dBFS prevents inter-sample peaks that can clip digital-to-analogue conversion even at 0 dBFS." },
    { kind: "quiz", q: "Inter-sample peaks (ISP) occur…", options: ["Only at 0 dBFS exactly", "Between digital samples — can clip D/A even below 0 dBFS", "Only in 16-bit audio", "Only with limiters"], answer: 1, explain: "ISPs are signal values that exceed 0 dBFS between sample points — True Peak metering detects these correctly." },
    { kind: "quiz", q: "Modern streaming target loudness is around…", options: ["+3 LUFS", "−8 LUFS", "−14 LUFS", "−23 LUFS"], answer: 2, explain: "Spotify, Apple Music, and YouTube normalise to approximately −14 LUFS integrated — master to this for consistent loudness." },
    { kind: "summary", learned: ["Limiter ceiling: −0.3 to −1 dBFS (not 0)", "True Peak catches inter-sample peaks that regular meters miss", "Streaming target: ~−14 LUFS integrated loudness"] },
  ],



  // ─── CHAPTER 4: PERFORMANCE & FLOW ──────────────────────────────────────

  "push-controllers": [
    { kind: "hook", emoji: "🟦", headline: "Get your hands on the music", subtext: "Push 3 is a complete instrument. Not just a controller." },
    { kind: "concept", title: "Push 3 overview", body: "Push 3 has 64 pressure-sensitive pads, 8 encoders, 8 displays, and a colour touchscreen. In controller mode it extends Live on your computer. In Standalone mode it IS Live.", keyFact: "Push 3 Standalone: no laptop needed. Live runs on-device." },
    { kind: "concept", title: "The pad grid", body: "Melodic mode arranges pads in scale intervals — wrong notes don't exist. Drum mode maps 16 pads to kit pieces and uses remaining pads as a step sequencer. Any pad layout follows your session context.", keyFact: "Melodic mode: every pad is in key. Wrong notes are impossible." },
    { kind: "interact", sim: "beat-builder", prompt: "Build a drum pattern using Push's pad layout" },
    { kind: "quiz", q: "Push 3 Standalone runs…", options: ["Live's engine on the hardware itself", "A companion mobile app", "Only MIDI sequences", "Only sample playback"], answer: 0, explain: "Push 3 Standalone contains Live's full audio engine — produce, mix, and perform without a laptop." },
    { kind: "quiz", q: "Melodic mode makes wrong notes…", options: ["Louder", "Impossible — only in-scale pads light up", "Transposed automatically", "Silent"], answer: 1, explain: "Push's melodic mode shows only in-scale pads active — play anything and it's always in key." },
    { kind: "quiz", q: "Popular third-party Push alternatives include…", options: ["Any MIDI keyboard", "Akai APC, Novation Launchpad, any MIDI device", "Bluetooth headphones only", "Audio interfaces"], answer: 1, explain: "Any MIDI controller works with Live's MIDI mapping — APC keys, Launchpad, and others auto-map to Session View." },
    { kind: "summary", learned: ["Push 3: 64 pads, controller and standalone modes", "Melodic mode: in-scale only, wrong notes impossible", "Any MIDI controller maps to Live via MIDI preferences"] },
  ],

  "midi-mapping": [
    { kind: "hook", emoji: "🗺", headline: "Map any knob to anything in Live", subtext: "MIDI Map Mode turns controllers into custom instruments." },
    { kind: "concept", title: "MIDI Map Mode", body: "Cmd/Ctrl+M enters MIDI Map Mode — the interface highlights green showing mappable parameters. Click any green element, then wiggle your hardware control. That parameter is now mapped.", keyFact: "Cmd/Ctrl+M = toggle MIDI Map Mode on/off." },
    { kind: "concept", title: "Mapping ranges and curves", body: "After mapping, click the mapping row to adjust Min/Max range (map 0–100% hardware range to only 50–80% of parameter range). Response curves (linear, logarithmic) shape how the control feels.", keyFact: "Narrow the Min/Max range for fine-detail control on one parameter." },
    { kind: "interact", sim: "midi-map", prompt: "Map a knob to filter cutoff using MIDI Map Mode" },
    { kind: "quiz", q: "Enter MIDI Map Mode with…", options: ["Cmd/Ctrl+K", "Cmd/Ctrl+M", "Cmd/Ctrl+Alt+M", "F5"], answer: 1, explain: "Cmd/Ctrl+M toggles MIDI Map Mode — the interface goes green and every mappable parameter highlights." },
    { kind: "quiz", q: "After MIDI mapping, you can adjust…", options: ["Nothing — it's fixed", "The Min/Max parameter range per mapping", "Only the hardware device", "The track colour"], answer: 1, explain: "Each mapping has Min/Max range controls — limit the hardware travel to a useful parameter range." },
    { kind: "quiz", q: "Key Map Mode (Cmd/Ctrl+K) is for…", options: ["MIDI controllers", "Computer keyboard shortcuts for Live controls", "Plugin parameters", "Track colours"], answer: 1, explain: "Key Map Mode maps computer keys to Live controls — trigger clips, scenes, or parameters from keyboard keys." },
    { kind: "summary", learned: ["Cmd/Ctrl+M = MIDI Map Mode (green overlay)", "Click green parameter, wiggle hardware = mapped", "Adjust Min/Max range per mapping after mapping"] },
  ],

  "tempo-following": [
    { kind: "hook", emoji: "👂", headline: "Live listens and follows your band", subtext: "Tempo Follower (Live 11) syncs to live audio input in real time." },
    { kind: "concept", title: "Tempo Follower", body: "Tempo Follower analyses incoming audio — a drummer, a DJ record, a click track — and adjusts Live's project BPM to match in real time. Enable it in the Control Bar next to the metronome.", keyFact: "Works best with strong rhythmic audio: kicks, snare, click." },
    { kind: "concept", title: "Sync with live musicians", body: "Use Tempo Follower to have Live follow a live drummer instead of forcing musicians to follow a click. Combine with Ableton Link to have multiple devices track together.", keyFact: "Sensitivity knob: higher = faster response to tempo changes." },
    { kind: "interact", sim: "bpm-tap", prompt: "Tap in a tempo — observe how Live's BPM adjusts to match" },
    { kind: "quiz", q: "Tempo Follower was added in…", options: ["Live 9", "Live 10", "Live 11", "Live 12"], answer: 2, explain: "Tempo Follower arrived in Live 11 — it analyses incoming audio and adjusts project BPM to match in real time." },
    { kind: "quiz", q: "Tempo Follower analyses…", options: ["MIDI clock input", "Incoming audio signal", "Scene tempos", "Cue output"], answer: 1, explain: "Tempo Follower listens to an audio input and extracts BPM — it needs audio, not MIDI clock." },
    { kind: "quiz", q: "Best audio input for Tempo Follower is…", options: ["Gentle pad sounds", "Sustained strings", "Strong rhythmic source (kick drum)", "Silence"], answer: 2, explain: "A kick drum or clear rhythmic pulse gives Tempo Follower the most reliable transients to measure BPM accurately." },
    { kind: "summary", learned: ["Tempo Follower (Live 11) = Live follows audio input BPM", "Needs strong rhythmic source for accuracy", "Enable in Control Bar next to metronome toggle"] },
  ],

  "ableton-link-sync": [
    { kind: "hook", emoji: "🔗", headline: "Sync apps wirelessly over a network", subtext: "Ableton Link: no cables, no master, everyone in time." },
    { kind: "concept", title: "How Link works", body: "Link synchronises tempo and beat phase across apps and hardware on the same local Wi-Fi or Ethernet network. No master or slave — every peer is equal. Any device can move the tempo.", keyFact: "Click LINK in Control Bar. All devices on the same network auto-discover." },
    { kind: "concept", title: "Start/Stop sync", body: "By default Link only syncs tempo and phase. Enable Start/Stop sync to also share transport starts and stops across connected devices. Great for perfectly synchronised scene launches.", keyFact: "Start/Stop sync is optional — disable if you want independent transports." },
    { kind: "interact", sim: "session-grid", prompt: "Imagine two Live instances Linked — trigger a scene on one" },
    { kind: "quiz", q: "Link sync uses…", options: ["MIDI cable (5-pin DIN)", "Local Wi-Fi or Ethernet network", "USB cable between computers", "Audio click track"], answer: 1, explain: "Link uses network discovery over your local Wi-Fi or Ethernet — no MIDI cables needed." },
    { kind: "quiz", q: "Link has a master/slave model?", options: ["Yes — one device leads", "No — fully peer-to-peer", "Only Push is master", "Optional in settings"], answer: 1, explain: "Link is fully peer-to-peer — any device can change tempo and all others follow. No hierarchy." },
    { kind: "quiz", q: "Start/Stop sync is…", options: ["Always on by default", "Optional — enabled separately from tempo sync", "Paid add-on", "Hardware-only"], answer: 1, explain: "Start/Stop sync is an optional layer on top of Link — enables synchronised transports, disabled by default." },
    { kind: "summary", learned: ["Link = wireless tempo+phase sync, peer-to-peer", "Enable in Control Bar — same network auto-discovers", "Start/Stop sync is optional — share transports too"] },
  ],

  "push3-workflow": [
    { kind: "hook", emoji: "🎹", headline: "Make a full track without the mouse", subtext: "Push 3 exposes every Live workflow from a single surface." },
    { kind: "concept", title: "Track creation on Push", body: "From Push 3 you can: create tracks (hold Add + tap instrument type), browse presets (Browse button), play melodies or drums on pads, record to clips, and navigate Session scenes — all without touching the keyboard.", keyFact: "Push 3: Add Track → Browse → Play → Record. Full workflow." },
    { kind: "concept", title: "Note and Step sequencers", body: "Melodic mode: 64 pads in 4-octave scale layout. Note length held while pressing pads. Drum mode: bottom 4×4 = pads, top rows = 16-step sequencer per pad with velocity lanes.", keyFact: "64-pad note mode: full melodic step sequencer with length per step." },
    { kind: "interact", sim: "beat-builder", prompt: "Sequence a 16-step pattern using Push's drum grid layout" },
    { kind: "quiz", q: "Push 3 Standalone doesn't need…", options: ["Audio interface", "A laptop/computer at all", "MIDI controller", "Power supply"], answer: 1, explain: "Standalone mode runs Live's engine directly on Push 3 — completely laptop-free production and performance." },
    { kind: "quiz", q: "In Push drum mode, the top rows are…", options: ["Pitch transpose buttons", "A 16-step sequencer for the selected pad", "Scene launchers", "Macro controls"], answer: 1, explain: "In drum mode, the upper pads become the step sequencer for whichever drum pad is currently selected." },
    { kind: "quiz", q: "Push 3 projects are…", options: ["A separate file format from Live", "The same .als file format as Live on computer", "Only playback — not editable on computer", "Cloud-only"], answer: 1, explain: "Push 3 Standalone projects open directly in Live on your computer — same file format, no conversion needed." },
    { kind: "summary", learned: ["Push 3: create, browse, play, record without a mouse", "Drum mode: pads + integrated per-pad step sequencer", "Standalone projects = same .als format as computer Live"] },
  ],

  "macro-variations": [
    { kind: "hook", emoji: "🎭", headline: "Snapshot, recall, morph — live sound design", subtext: "Macro Variations save patch states for instant switching." },
    { kind: "concept", title: "Creating Variations", body: "Set your 16 Rack macros to the sound you want. Click 'New Variation' in the Macro section. Tweak to a different sound state, save again. Now you have two snapshots to switch between instantly.", keyFact: "Each variation stores all 16 macro values simultaneously." },
    { kind: "concept", title: "Morphing between Variations", body: "Live 12 adds smooth morphing between Variations — click a variation and the macros glide to their new values over a set time. Build Intro, Verse, Drop variations and morph between them live.", keyFact: "Morph slider: drag to interpolate between two saved variation states." },
    { kind: "interact", sim: "device-chain", prompt: "Create two Macro Variations with different filter sounds" },
    { kind: "quiz", q: "Variations save…", options: ["Audio clips", "All 16 macro knob values simultaneously", "Project tempo", "Track routing"], answer: 1, explain: "Macro Variations snapshot all 16 macro positions at once — recall any state or morph smoothly between them." },
    { kind: "quiz", q: "Macros per Rack (Live 11+) maximum is…", options: ["8", "16", "32", "64"], answer: 1, explain: "Live 11 expanded Racks from 8 to 16 macros — double the control surface per instrument or effect chain." },
    { kind: "quiz", q: "Live 12 morph between Variations is…", options: ["Instantaneous step-only", "Smooth interpolation over time", "Random", "Not possible"], answer: 1, explain: "Live 12 adds smooth macro morphing — macros glide to their target variation values over the set morph time." },
    { kind: "summary", learned: ["Variations snapshot all 16 macros at once", "Recall instantly or morph smoothly between states", "Build Intro/Verse/Drop variations for live performance"] },
  ],

  "cv-tools": [
    { kind: "hook", emoji: "🔌", headline: "Bridge Live to modular synthesisers", subtext: "CV Tools sends pitch and gates over audio cables." },
    { kind: "concept", title: "What is CV?", body: "Control Voltage (CV) is the language of modular synthesisers. Pitch is typically 1V/octave. Gate signals trigger envelopes. Live's CV Tools devices convert MIDI and automation to CV sent via audio outputs.", keyFact: "Requires a DC-coupled audio interface to pass CV correctly." },
    { kind: "concept", title: "CV Tools devices", body: "CV Instrument sends pitch CV and gate from a MIDI track. CV Triggers sends gate pulses. CV In receives incoming CV and converts to MIDI. All are Max for Live devices included in Live Suite.", keyFact: "CV In = modular sequences → Live MIDI. Bi-directional bridge." },
    { kind: "interact", sim: "signal-flow-builder", prompt: "Build the signal flow: MIDI clip → CV Instrument → Modular" },
    { kind: "quiz", q: "CV requires a DC-coupled interface because…", options: ["CV is AC audio signal", "CV is DC voltage — AC-coupled interfaces block it", "It's louder than normal audio", "Digital interfaces don't work"], answer: 1, explain: "CV voltages are DC (constant or slowly changing). Standard AC-coupled interfaces block DC signals — DC-coupled ones pass them." },
    { kind: "quiz", q: "CV Tools talk to…", options: ["Only software plugins", "Modular synthesisers via CV voltage", "Push 3 only", "Return tracks"], answer: 1, explain: "CV Tools bridges Live to modular gear — sequence your Eurorack from Live MIDI clips or automation lanes." },
    { kind: "quiz", q: "CV In device…", options: ["Sends CV out to modular", "Receives incoming CV and converts to MIDI/modulation", "Sends MIDI to a synth", "Records audio from modular"], answer: 1, explain: "CV In accepts incoming CV voltages from modular gear and converts them to MIDI note or modulation data inside Live." },
    { kind: "summary", learned: ["CV = analog voltage language of modular synthesisers", "CV Tools devices convert MIDI ↔ CV (needs DC-coupled interface)", "CV In: modular → Live. CV Instrument: Live → modular"] },
  ],

  "ableton-link": [
    { kind: "hook", emoji: "🌐", headline: "Sync apps over Wi-Fi — no cables", subtext: "Link keeps hundreds of apps in perfect time on one network." },
    { kind: "concept", title: "Link ecosystem", body: "Link is an open protocol — hundreds of apps and hardware devices support it. Ableton Live, Push, Reason, Traktor, GarageBand iOS, countless modular apps all sync seamlessly on the same network.", keyFact: "Link is free and open — any developer can implement it." },
    { kind: "concept", title: "Phase lock guarantee", body: "Link doesn't just sync tempo — it locks beat phase. All connected devices are always on the same beat, not just the same BPM. You can join a Link session mid-play and immediately lock to the group beat.", keyFact: "Beat phase lock = everyone plays beat 1 at the same moment." },
    { kind: "interact", sim: "session-grid", prompt: "Enable LINK in Control Bar — see the peer count change" },
    { kind: "quiz", q: "Link is…", options: ["Paid per-device licence", "Free and open — built into Live", "Only for Push hardware", "iOS-only"], answer: 1, explain: "Link is completely free, built into Live, and available for any developer to implement — fully open standard." },
    { kind: "quiz", q: "Link syncs…", options: ["Only tempo (BPM)", "Tempo and beat phase together", "Audio content between apps", "Plugin presets"], answer: 1, explain: "Link synchronises both tempo and beat phase — all peers share the same BPM and the same downbeat position." },
    { kind: "quiz", q: "Joining a Link session mid-play…", options: ["Requires restart", "Locks to the group beat immediately", "Creates a new tempo", "Mutes your session"], answer: 1, explain: "Link's phase algorithm immediately aligns your app to the group beat when you connect — seamless mid-play joining." },
    { kind: "summary", learned: ["Link = free, open tempo+phase sync over network", "Hundreds of apps support Link — iOS, macOS, Windows", "Phase lock: all peers share the same downbeat position"] },
  ],

  "exporting": [
    { kind: "hook", emoji: "📤", headline: "Render the final file", subtext: "Cmd/Ctrl+Shift+R opens Export Audio — set the loop brace first." },
    { kind: "concept", title: "Export settings", body: "Cmd/Ctrl+Shift+R opens Export Audio/Video. Set your loop brace to define the region. Choose: WAV/AIFF/MP3/FLAC, sample rate, bit depth. 24-bit WAV at 44.1 kHz for distribution; 32-bit float for mastering handoff.", keyFact: "Normalize OFF — preserve headroom. Mastering engineer will maximise." },
    { kind: "concept", title: "Stems and render options", body: "Render Each Track exports individual stem files — every track as its own WAV. Render as Loop seamlessly loops the export for DJs or sync licensing. Always check the loop brace region before exporting.", keyFact: "Stems: Render Each Track. Full mix: Render Master." },
    { kind: "interact", sim: "none", prompt: "Set loop brace to 32 bars and export a 24-bit WAV" },
    { kind: "quiz", q: "For mastering handoff, use…", options: ["MP3 320kbps", "WAV 16-bit / 44.1 kHz", "WAV 24-bit or 32-bit float / 44.1 kHz", "FLAC 8-bit"], answer: 2, explain: "24-bit or 32-bit float WAV preserves maximum dynamic range for the mastering engineer to work with." },
    { kind: "quiz", q: "Export individual stems with…", options: ["Render Master", "Render Each Track", "Render as Loop", "Render MIDI"], answer: 1, explain: "Render Each Track exports every track as a separate audio file — stems for remixers or mixing engineers." },
    { kind: "quiz", q: "Export shortcut is…", options: ["Cmd/Ctrl+R", "Cmd/Ctrl+Shift+R", "Cmd/Ctrl+E", "F12"], answer: 1, explain: "Cmd/Ctrl+Shift+R opens the Export Audio/Video dialog — define the loop brace first to set the export region." },
    { kind: "summary", learned: ["Cmd/Ctrl+Shift+R = Export Audio/Video dialog", "24-bit WAV for distribution, 32-bit float for mastering", "Render Each Track = stems. Render Master = final mix"] },
  ],

  "live-sets-projects": [
    { kind: "hook", emoji: "📁", headline: "Stay organised — projects, templates, backups", subtext: "A good folder structure prevents catastrophic loss." },
    { kind: "concept", title: "Projects and templates", body: "A Project folder contains the .als Set file plus all recorded audio and bounces. Create a Default Template (save a Set as Default.als in the Templates folder) to start every session with your preferred routing.", keyFact: "File > Save as Default Set = open every new project pre-configured." },
    { kind: "concept", title: "Freeze and Flatten", body: "Freeze a track to temporarily render it to audio — saves CPU while preserving the original devices. Flatten permanently bakes the frozen audio into a new clip, removing the device chain. Flatten is destructive — duplicate first.", keyFact: "Freeze = reversible CPU saver. Flatten = permanent — no undo on devices." },
    { kind: "interact", sim: "arrangement", prompt: "Freeze a heavy synth track — observe CPU meter drop" },
    { kind: "quiz", q: "Freezing a track trades…", options: ["RAM for audio quality", "CPU load for edit flexibility", "Pitch for time", "Sends for returns"], answer: 1, explain: "Freeze renders a track to a temp audio file — saves CPU at the cost of not being able to edit the frozen devices." },
    { kind: "quiz", q: "Bounce in Place…", options: ["Permanently renders track to audio clip", "Deletes the track", "Exports to a file", "Groups the track"], answer: 0, explain: "Bounce in Place permanently renders the track and its devices to a new audio clip in the same position." },
    { kind: "quiz", q: "Default Template is set by…", options: ["Preferences > Templates tab", "File > Save as Default Set", "Renaming an .als file", "Drag from Browser"], answer: 1, explain: "File > Save as Default Set saves the current Set as your default template — opens automatically on new projects." },
    { kind: "summary", learned: ["Project folder = .als + audio. Use Collect All and Save", "Freeze = reversible CPU relief. Flatten = permanent bake", "File > Save as Default Set = your personal start template"] },
  ],

  "troubleshooting": [
    { kind: "hook", emoji: "🔧", headline: "When things break — here's the checklist", subtext: "Most problems have a known fix. Panic optional." },
    { kind: "concept", title: "Audio problems", body: "Crackling or dropouts → raise buffer size, freeze CPU-heavy tracks. Silence → check driver in Preferences > Audio, check track mute/arm state. High latency → check Driver Error Compensation in Preferences.", keyFact: "First fix: raise buffer size to 512. Second fix: freeze heavy tracks." },
    { kind: "concept", title: "Plugin and project problems", body: "Plugins not showing → Rescan in Preferences > Plug-Ins. Project opens with missing files → check the Project folder, use Collect All and Save on original machine before moving. Lost work → check Project > Backup folder.", keyFact: "Auto-backup every 15 min = enable in Preferences > File Folder." },
    { kind: "interact", sim: "none", prompt: "Diagnose a crackle: check buffer, CPU meter, and frozen tracks" },
    { kind: "quiz", q: "First fix for crackling audio is…", options: ["Add more reverb", "Raise buffer size and/or freeze heavy tracks", "Lower the master volume", "Reinstall Live"], answer: 1, explain: "Raising buffer size gives the CPU more time per chunk — almost always fixes crackling and dropout issues." },
    { kind: "quiz", q: "Auto-saves are stored in…", options: ["The Desktop", "The Project's Backup folder", "The Library", "The trash"], answer: 1, explain: "Live saves auto-backup files in a Backup folder inside the Project folder — check there after crashes or mistakes." },
    { kind: "quiz", q: "Plugins not showing after install →", options: ["Reinstall Live entirely", "Rescan plug-ins in Preferences > Plug-Ins", "Create a new project", "Disable MIDI"], answer: 1, explain: "Live needs to rescan plugin folders when new plugins are installed — Preferences > Plug-Ins > Rescan Plug-Ins." },
    { kind: "summary", learned: ["Crackles: raise buffer size, freeze CPU-heavy tracks first", "Missing plugins: Preferences > Plug-Ins > Rescan", "Backups: Project > Backup folder has auto-save recovery files"] },
  ],



  // ─── CHAPTER 5: ADVANCED ────────────────────────────────────────────────

  "sampler-deep": [
    { kind: "hook", emoji: "🗂", headline: "Sampler is a full sample studio", subtext: "Key zones, velocity layers, round-robin — all in one device." },
    { kind: "concept", title: "Zone editor", body: "Sampler's Zone Editor maps samples across key ranges, velocity ranges, and Select zones (round-robin/random). Drop multiple samples and they play the correct one based on which note and how hard you play.", keyFact: "Key zone + velocity zone + select zone = studio-quality instruments." },
    { kind: "concept", title: "Modulation matrix", body: "Sampler has three full envelopes (Amp, Filter, Pitch) and two LFOs with a full modulation matrix. Route MIDI expression — aftertouch, mod wheel, MPE slide — to any destination for expressive playing.", keyFact: "Sampler fully supports MPE — per-note pitch, pressure, and slide." },
    { kind: "interact", sim: "device-lab", prompt: "Explore Sampler's Zone Editor — set a velocity layer" },
    { kind: "quiz", q: "Sampler vs Simpler main difference?", options: ["Sampler is multisampled with zones", "They are identical", "Simpler is multi-sampled"], answer: 0, explain: "Sampler handles multiple samples mapped across key, velocity, and select zones — Simpler plays one sample." },
    { kind: "quiz", q: "Zone types in Sampler are…", options: ["Key + velocity + select (round-robin)", "Only key zones", "Only velocity zones", "Time only"], answer: 0, explain: "Sampler zones combine key range, velocity range, and select mode (round-robin/random) for realistic instrument mapping." },
    { kind: "quiz", q: "Sampler supports MPE?", options: ["Yes — per-note expression", "No", "Only on Push 3"], answer: 0, explain: "Sampler supports MPE — each note can receive independent pitch bend, pressure, and slide for expressive polyphonic playing." },
    { kind: "summary", learned: ["Zone Editor: key + velocity + select zones per sample", "Full modulation matrix: envelopes, LFOs, MIDI expression", "Sampler supports MPE — per-note pitch, pressure, slide"] },
  ],

  "drift": [
    { kind: "hook", emoji: "🌊", headline: "Small synth, big personality", subtext: "Drift brings analog-style warmth to every Live set." },
    { kind: "concept", title: "Drift architecture", body: "Drift has two oscillators, a sub-oscillator, noise, and a vintage-inspired filter with two models (OB-style and ladder). The Drift parameter adds random micro-instability to pitch and timing — the analog wobble.", keyFact: "Drift param = 0: clinical digital. Drift = 100: warm analog." },
    { kind: "concept", title: "Two filter models", body: "Drift's first filter model is a 12dB state-variable (SEM-style) — wide, musical resonance. The second is a 24dB ladder filter — tighter, more classic Moog-like. Switch between them per patch.", keyFact: "SEM = open and musical. Ladder = snappy and tight. Both are great." },
    { kind: "interact", sim: "device-lab", prompt: "Compare the two filter models — hear the character difference" },
    { kind: "quiz", q: "Drift parameter adds…", options: ["Chorus effect", "Analog-style pitch instability", "Reverb tail", "Velocity sensitivity"], answer: 1, explain: "Drift adds random micro-variations to pitch and timing — simulating the natural instability of vintage analog oscillators." },
    { kind: "quiz", q: "Drift was added in…", options: ["Live 9", "Live 10", "Live 11", "Live 12"], answer: 2, explain: "Drift arrived with Live 11 — a compact, expressive subtractive synth with genuine analog character." },
    { kind: "quiz", q: "Drift's synth type is…", options: ["FM synthesis", "Subtractive synthesis", "Wavetable synthesis", "Granular synthesis"], answer: 1, explain: "Drift is subtractive — oscillators generate rich waveforms and the filter sculpts the harmonic content." },
    { kind: "summary", learned: ["Drift = compact subtractive synth with 2 oscillators", "Drift parameter = analog pitch instability", "Two filter models: SEM (open) and Ladder (tight)"] },
  ],

  "granulator-iii": [
    { kind: "hook", emoji: "✨", headline: "Turn any sample into a texture", subtext: "Granulator splits audio into clouds of tiny grains." },
    { kind: "concept", title: "How granular synthesis works", body: "Granulator III plays tiny overlapping fragments (grains) from a sample. The keyboard controls pitch. Position scrubs through the sample. Grain size sets how large each fragment is — small = glitchy, large = smooth.", keyFact: "Granular: sustained texture from any sound, even a single word." },
    { kind: "concept", title: "Key parameters", body: "Spray randomises grain start position — creates shimmer and texture. Spread randomises stereo placement of grains for lush width. Multiple grains per voice adds density. Reverse plays grains backwards.", keyFact: "Position + LFO = endless slowly morphing evolving texture." },
    { kind: "interact", sim: "granular", prompt: "Drag Position across the sample — hear the timbre morph" },
    { kind: "quiz", q: "Granulator plays samples as…", options: ["One-shots", "Overlapping grain fragments", "Loops only", "Wavetables"], answer: 1, explain: "Granular synthesis splits audio into tiny overlapping grains — the foundation of granular time-stretching and texture synthesis." },
    { kind: "quiz", q: "Smaller grain size gives…", options: ["Cleaner, smoother sound", "More glitch and texture artefacts", "Higher pitch", "More volume"], answer: 1, explain: "Small grains lose the sample's recognisable character and create texture and pitch artefacts — the signature granular sound." },
    { kind: "quiz", q: "Spray parameter controls…", options: ["Output volume", "Random variation in grain start positions", "Filter cutoff", "Envelope attack"], answer: 1, explain: "Spray randomises where in the sample each grain starts — creates shimmer, texture, and organic movement." },
    { kind: "summary", learned: ["Granulator = overlapping grain playback from any sample", "Position scrubs through the sample to morph timbre", "Spray = random grain positions → shimmer and texture"] },
  ],

  "collision-tension-electric": [
    { kind: "hook", emoji: "🔔", headline: "Physical models — synthesis from physics", subtext: "Sound emerges from virtual strings, mallets, and piano tines." },
    { kind: "concept", title: "Physical modelling synthesis", body: "Instead of oscillators and filters, physical modelling simulates real acoustic mechanisms. Collision excites a resonator (mallet hitting a bar). Tension models vibrating strings. Electric models electric piano tines and hammers.", keyFact: "Physical models respond to velocity and pressure like real instruments." },
    { kind: "concept", title: "Live's modelling suite", body: "Collision: marimbas, bells, kalimbas, metallics. Tension: bowed strings, plucked strings, piano. Electric: Rhodes and Wurlitzer-style electro-mechanical pianos. Analog: classic 2-oscillator virtual analog. All fully MPE-expressive.", keyFact: "Collision + Tension + Electric + Analog = physical model quartet." },
    { kind: "interact", sim: "device-lab", prompt: "Compare Electric at different velocities — hear the tine character" },
    { kind: "quiz", q: "Tension models…", options: ["Bell resonance (mallets)", "Vibrating strings (bowed and plucked)", "Electric piano mechanics", "Tape saturation"], answer: 1, explain: "Tension physically models string vibration — stiffness, length, pickup position, and bow pressure are all parameters." },
    { kind: "quiz", q: "Electric is for…", options: ["Synthesiser leads", "Electric piano sounds (Rhodes/Wurlitzer)", "Brass instruments", "Vocal synthesis"], answer: 1, explain: "Electric physically models electro-mechanical piano mechanics — tines, hammers, pickups, and the bell tone of vintage EPs." },
    { kind: "quiz", q: "Physical models respond to velocity by…", options: ["Playing louder only", "Changing timbre like real instruments do", "Transposing pitch", "Changing reverb size"], answer: 1, explain: "Physical models simulate how instruments actually behave — a harder hit changes both volume AND tone, like the real thing." },
    { kind: "summary", learned: ["Physical models simulate acoustic mechanics, not oscillators", "Collision = mallets/bells. Tension = strings. Electric = EPs", "All respond to velocity and MPE expression musically"] },
  ],

  "bass-poli": [
    { kind: "hook", emoji: "🎸", headline: "Great sounds in seconds, not hours", subtext: "Bass and Poli are preset-first instruments for fast sketching." },
    { kind: "concept", title: "Preset-first design", body: "Bass and Poli (Live 12) hide complex synthesis behind bespoke macro layouts. Each preset has 8 macros tuned to the most musical controls for that specific sound — no menu-diving required.", keyFact: "Bass: sub-bass, mid-bass, growl. Poli: pads, plucks, keys, leads." },
    { kind: "concept", title: "When to use them", body: "Use Bass or Poli for fast sketch ideas where sound design depth doesn't matter yet. Once the musical idea is locked, swap for Wavetable or Operator if you need deeper customisation.", keyFact: "Sketch with Bass/Poli. Deepen with Wavetable/Operator later." },
    { kind: "interact", sim: "device-lab", prompt: "Browse Bass presets — find a sub-bass sound in under 30 seconds" },
    { kind: "quiz", q: "Bass and Poli were added in…", options: ["Live 10", "Live 11", "Live 12"], answer: 2, explain: "Bass and Poli are Live 12 instruments — preset-first designs for quick sound selection without deep synthesis knowledge." },
    { kind: "quiz", q: "Macros on Bass and Poli are…", options: ["The same for every preset", "Bespoke per preset — best controls for that patch", "All mapped to volume", "Only 2 per patch"], answer: 1, explain: "Each preset has its own macro layout — the 8 macros expose the most musical controls specific to that sound." },
    { kind: "quiz", q: "Poli is optimised for…", options: ["Kick drums and percussion", "Polyphonic parts: pads, plucks, keys, leads", "Sub-bass only", "Vocal processing"], answer: 1, explain: "Poli = polyphonic. It's designed for chord-based and melodic parts — pads, plucks, and keys are its sweet spot." },
    { kind: "summary", learned: ["Bass: fast bass presets with 8 bespoke macros each", "Poli: fast polyphonic presets (pads, plucks, keys)", "Sketch → deepen with Wavetable/Operator if needed"] },
  ],

  "instrument-rack": [
    { kind: "hook", emoji: "🎛", headline: "Stack, layer, split, morph instruments", subtext: "Instrument Rack: multiple synths, one device, infinite possibilities." },
    { kind: "concept", title: "Layering and splitting", body: "Drop multiple instruments into an Instrument Rack to layer them (all play at once). Set Key Zones to split the keyboard: low keys = bass, high keys = lead. Velocity zones trigger different chains dynamically.", keyFact: "Layer = all chains play. Split = key zone determines which chain." },
    { kind: "concept", title: "Chain Selector morphing", body: "Map the Chain Selector to a macro knob. As you sweep the knob, different chains cross-fade in and out — morph between two completely different sounds across 0–100% of one knob.", keyFact: "Chain Selector + Macro = smooth morph between any two sounds." },
    { kind: "interact", sim: "device-chain", prompt: "Create a key split: bass chain on C1-B2, lead chain on C3 up" },
    { kind: "quiz", q: "Layering in Instrument Rack means…", options: ["All chains play simultaneously on every note", "Only the selected chain plays", "Chains alternate each note", "Chains play in sequence"], answer: 0, explain: "In a layer configuration (full key zone overlap), every chain plays every note — creating thick layered timbres." },
    { kind: "quiz", q: "Chain Selector + Macro enables…", options: ["Step sequencing", "Smooth morphing between chains", "MIDI mapping", "Tempo changes"], answer: 1, explain: "Chain Selector defines which zones activate which chains — automating it creates a morph between any two sounds." },
    { kind: "quiz", q: "Velocity zones trigger different chains for…", options: ["Dynamics only (louder/softer)", "Different samples at different velocities", "Pan control", "Reverb levels"], answer: 1, explain: "Velocity zones switch chains based on how hard you play — soft = Rhodes, hard = distorted Rhodes, for example." },
    { kind: "summary", learned: ["Layer: all chains play. Split: key zones route to chains", "Velocity zones: different chains at different dynamics", "Chain Selector + macro = smooth morph between sounds"] },
  ],

  "midi-effects-tour": [
    { kind: "hook", emoji: "🎲", headline: "Deep dive into every MIDI effect", subtext: "Arpeggiator to Velocity — transform notes before they hit the synth." },
    { kind: "concept", title: "Generative MIDI effects", body: "Note Echo creates rhythmic MIDI echo patterns. Random adds pitch randomisation for generative melodies. Velocity generates dynamic variation — either random or following patterns. Stack them for complex generative results.", keyFact: "Random + Scale + Note Echo = self-generating melodic loops." },
    { kind: "concept", title: "Performance MIDI effects", body: "Chord stacks up to 6 intervals on every input note (instant power chords). Pitch transposes with lag/portamento for smooth slides. Expression Control maps MIDI CC to any device parameter.", keyFact: "Expression Control: 1 knob → any parameter anywhere in the rack." },
    { kind: "interact", sim: "piano-roll", prompt: "Chain Chord → Scale → Arpeggiator and hear the transformation" },
    { kind: "quiz", q: "Note Echo creates…", options: ["Audio delay", "Rhythmic MIDI note repetitions", "Reverb", "Pitch shift"], answer: 1, explain: "Note Echo repeats MIDI notes — rhythmic echoes, faster for rolls, slower for atmospheric trails of notes." },
    { kind: "quiz", q: "Chord MIDI effect stacks…", options: ["Only octaves", "Up to 6 intervals on each input note", "Audio chords", "Only thirds"], answer: 1, explain: "Chord stacks up to 6 additional intervals above each input note — instant harmonisation without changing your playing." },
    { kind: "quiz", q: "Expression Control maps…", options: ["Only MIDI CC 1 (mod wheel)", "Any MIDI CC to any device parameter", "Audio level only", "Tempo changes"], answer: 1, explain: "Expression Control maps incoming MIDI CC data (mod wheel, foot pedal, etc.) to any parameter in any device in the chain." },
    { kind: "summary", learned: ["Note Echo = rhythmic MIDI repetitions", "Chord = up to 6 intervals stacked per note", "Expression Control = map any MIDI CC to any device parameter"] },
  ],

  "external-instrument": [
    { kind: "hook", emoji: "🎛", headline: "Control hardware synths from Live", subtext: "External Instrument sends MIDI out and audio back in on one track." },
    { kind: "concept", title: "What External Instrument does", body: "External Instrument (M4L) lets you treat a hardware synth as if it were a software instrument in Live. It sends MIDI to the synth's input and returns audio from the synth's output — all on one MIDI track.", keyFact: "One track: MIDI out → hardware → audio in. Latency compensated." },
    { kind: "concept", title: "Automatic delay compensation", body: "External Instrument handles latency compensation automatically — the round-trip from MIDI out to audio in is measured and compensated so the hardware synth stays in time with the rest of your session.", keyFact: "Enable Hardware Latency in Preferences to calibrate your interface." },
    { kind: "interact", sim: "signal-flow-builder", prompt: "Build: MIDI Clip → External Instrument → Hardware → Return audio" },
    { kind: "quiz", q: "External Instrument is…", options: ["A built-in Live device", "A Max for Live device", "An audio effect", "A mixer channel"], answer: 1, explain: "External Instrument is a Max for Live device included with Live Suite — it bridges software and hardware instruments." },
    { kind: "quiz", q: "It handles…", options: ["Audio only", "MIDI out AND audio return on one track", "MIDI only", "Video only"], answer: 1, explain: "External Instrument manages MIDI output to hardware and audio input from hardware on a single MIDI track." },
    { kind: "quiz", q: "Latency compensation is…", options: ["Manual only", "Automatic with calibration", "Not available", "Only at 44.1 kHz"], answer: 1, explain: "External Instrument automatically compensates for hardware round-trip latency — enable hardware latency in Preferences first." },
    { kind: "summary", learned: ["External Instrument = MIDI out + audio in on one MIDI track", "Treats hardware synths like software instruments", "Automatic latency compensation for hardware round-trip"] },
  ],



  "meld": [
    { kind: "hook", emoji: "🌀", headline: "Live 12's MPE-first dual-engine synth", subtext: "Two engines blend, morph, and respond to touch per note." },
    { kind: "concept", title: "Dual-engine architecture", body: "Meld has two independent synthesis engines — Engine A and Engine B — each with its own oscillator type (classic, noise, FM, formant, additive). They can layer, split, or morph based on MPE expression.", keyFact: "Five oscillator types per engine: Classic, Noise, FM, Formant, Additive." },
    { kind: "concept", title: "MPE expressivity", body: "Meld's entire architecture is designed around per-note MPE data. Pressure can morph between engines. Slide can sweep a filter. Pitch bend per note creates violin-like expression even on polyphonic chords.", keyFact: "Meld without MPE = still great. Meld with MPE = transformative." },
    { kind: "interact", sim: "device-lab", prompt: "Load Meld and morph between engines using the blend control" },
    { kind: "quiz", q: "Meld shipped with…", options: ["Live 10", "Live 11", "Live 12"], answer: 2, explain: "Meld (Live 12) is a new dual-engine synthesiser built specifically for MPE expression and Live 12's broader scale awareness." },
    { kind: "quiz", q: "Meld has how many engines?", options: ["1", "2", "4", "8"], answer: 1, explain: "Meld has two independent engines — the name reflects this duality, and the blend between them is the core sound design tool." },
    { kind: "quiz", q: "Meld is designed primarily for…", options: ["Drum programming", "MPE polyphonic expression", "Mixing and mastering", "Audio effects only"], answer: 1, explain: "Meld's entire signal path responds to MPE — per-note pitch bend, pressure, and slide for truly expressive polyphonic playing." },
    { kind: "summary", learned: ["Meld: two independent engines that blend or morph", "Five oscillator types: Classic, Noise, FM, Formant, Additive", "MPE-first design: per-note pitch, pressure, slide"] },
  ],

  "drum-sampler": [
    { kind: "hook", emoji: "🥁", headline: "Modern multi-sample drum hits", subtext: "Drum Sampler brings velocity layers and round-robin to every pad." },
    { kind: "concept", title: "Drum Sampler vs Simpler", body: "Drum Sampler is a dedicated per-pad instrument in Drum Rack (Live 12). Unlike Simpler on a pad, Drum Sampler supports multiple velocity layers and round-robin switching for realistic acoustic drum behaviour.", keyFact: "Same note, different velocity = different sample. That's realism." },
    { kind: "concept", title: "One-shot and loop modes", body: "Drum Sampler has dedicated One-Shot mode for percussive hits, tuning per velocity layer, choke group support, and direct integration with Drum Rack routing. It replaces Simpler on pads for acoustic-style kits.", keyFact: "Drum Sampler: designed from scratch for drum sounds specifically." },
    { kind: "interact", sim: "beat-builder", prompt: "Play a snare across multiple velocities — hear different layers" },
    { kind: "quiz", q: "Drum Sampler was added in…", options: ["Live 10", "Live 11", "Live 12"], answer: 2, explain: "Drum Sampler (Live 12) is a new purpose-built percussion sampler replacing Simpler for realistic drum kits." },
    { kind: "quiz", q: "Velocity layers in Drum Sampler enable…", options: ["Different volumes only", "Different samples at different hit strengths", "Different pitches only", "Reverb switching"], answer: 1, explain: "Velocity layers map different samples to different force ranges — soft hit = light brush sample, hard hit = full crack." },
    { kind: "quiz", q: "Round-robin switching means…", options: ["The sample plays backwards", "Different samples play each hit to avoid machine-gun effect", "Pads rotate in choke groups", "Patterns loop"], answer: 1, explain: "Round-robin cycles through multiple recordings of the same hit — prevents the robotic repetition of the same sample on every beat." },
    { kind: "summary", learned: ["Drum Sampler: purpose-built for acoustic-style drum kits", "Velocity layers: different samples at different hit strengths", "Round-robin: cycles samples to avoid repetition artefacts"] },
  ],

  "hybrid-reverb": [
    { kind: "hook", emoji: "🏛", headline: "Convolution meets algorithmic — best of both", subtext: "Hybrid Reverb blends real-room IRs with synthetic space." },
    { kind: "concept", title: "Convolution vs Algorithmic", body: "Convolution reverb uses Impulse Responses (IRs) — actual recordings of real rooms. Algorithmic reverb creates synthetic space with mathematical models. Hybrid Reverb (Live 11) combines both in one device with a blend knob.", keyFact: "IR = photographic realism. Algorithmic = sculpted, unrealistic spaces." },
    { kind: "concept", title: "Practical usage", body: "Use the convolution side for realistic room or hall placement. Blend in the algorithmic side for pre-delay, modulation, and size control. The combination lets you put vocals in an impossible room that still feels natural.", keyFact: "Blend to 50%: IR root + algorithmic tail = hybrid space design." },
    { kind: "interact", sim: "send-return", prompt: "Load Hybrid Reverb on a Return — blend IR and algorithmic" },
    { kind: "quiz", q: "Hybrid Reverb uses…", options: ["Only convolution", "Only algorithmic", "Convolution IRs blended with algorithmic processing", "A delay network"], answer: 2, explain: "Hybrid Reverb (Live 11) combines real room IR convolution with algorithmic reverb in one device with a blend control." },
    { kind: "quiz", q: "An IR (Impulse Response) is…", options: ["A random room simulation", "A recording of a real room's acoustic response", "An algorithmic preset", "A MIDI effect"], answer: 1, explain: "An IR records the acoustic fingerprint of a real space — used in convolution reverb to place sound in that actual room." },
    { kind: "quiz", q: "Hybrid Reverb arrived in…", options: ["Live 9", "Live 10", "Live 11", "Live 12"], answer: 2, explain: "Hybrid Reverb was introduced in Live 11 as a premium replacement for older reverb devices." },
    { kind: "summary", learned: ["Hybrid Reverb = convolution IR + algorithmic blend", "IR side: realistic rooms. Algorithmic side: sculpted space", "Blend knob mixes the two approaches continuously"] },
  ],

  "roar": [
    { kind: "hook", emoji: "🦁", headline: "Multi-band saturation with feedback paths", subtext: "Roar sculpts distortion across three frequency bands independently." },
    { kind: "concept", title: "Roar architecture", body: "Roar (Live 12) splits the signal into low, mid, and high bands. Each band has its own saturation circuit type, Drive amount, and Tone control. Independent band processing means you can saturate mids aggressively while keeping the lows clean.", keyFact: "Roar: distort each frequency band independently — surgical saturation." },
    { kind: "concept", title: "Feedback paths", body: "Roar's Feedback control routes the output back into the input, creating self-oscillating resonance and complex harmonic buildup. Low feedback = subtle warmth. High feedback = aggressive feedback distortion textures.", keyFact: "Roar feedback at high values = self-oscillating chaos territory." },
    { kind: "interact", sim: "device-lab", prompt: "Apply Roar to a bass — saturate mid band, keep low clean" },
    { kind: "quiz", q: "Roar was added in…", options: ["Live 10", "Live 11", "Live 12"], answer: 2, explain: "Roar (Live 12) is a new multi-band distortion and saturation device with independent frequency band processing." },
    { kind: "quiz", q: "Roar processes how many frequency bands?", options: ["1", "2", "Up to 3", "8"], answer: 2, explain: "Roar can process up to 3 frequency bands (low, mid, high) independently — or run as a single-band device." },
    { kind: "quiz", q: "Roar's feedback creates…", options: ["Reverb effect", "Self-oscillating harmonic buildup", "Pitch shift", "Delay repeats"], answer: 1, explain: "Feedback routes processed output back into the input — at moderate amounts adds harmonic complexity, at high amounts self-oscillates." },
    { kind: "summary", learned: ["Roar = multi-band saturation (up to 3 independent bands)", "Each band: drive, tone, and saturation circuit type", "Feedback path = harmonic buildup to self-oscillation"] },
  ],

  "stem-separation": [
    { kind: "hook", emoji: "✂️", headline: "AI separates stems from any audio", subtext: "Extract vocals, drums, bass, and melody from a single file." },
    { kind: "concept", title: "Live 12 Stem Separation", body: "Right-click any audio clip → Separate to Stems. Live's built-in AI engine separates the clip into Vocals, Drums, Bass, and Melody tracks. Runs locally on your computer — no cloud, no subscription.", keyFact: "Separate to Stems: right-click audio clip → instant 4-stem output." },
    { kind: "concept", title: "Practical applications", body: "Use Stem Separation to sample-flip (isolate a vocal from a record), remove elements from reference tracks, extend the breakdown of a song, or extract the drum groove for resampling.", keyFact: "Resampling extracted drums through Groove Pool = instant vibe." },
    { kind: "interact", sim: "stem-splitter", prompt: "Separate a full mix — isolate the vocal stem" },
    { kind: "quiz", q: "Stem Separation was added in…", options: ["Live 10", "Live 11", "Live 12"], answer: 2, explain: "Live 12 introduced built-in AI stem separation — right-click any audio clip to extract stems." },
    { kind: "quiz", q: "Stem Separation runs…", options: ["On Ableton's cloud servers", "Locally on your computer", "Requires separate app", "Only on Mac"], answer: 1, explain: "Stem Separation runs Live's built-in AI model locally — no internet, no subscription, processes in real time." },
    { kind: "quiz", q: "The 4 default stem types are…", options: ["Kick, snare, hat, synth", "Vocals, Drums, Bass, Melody", "Lead, pad, bass, FX", "Guitar, keys, vox, perc"], answer: 1, explain: "Live 12 stem separation extracts Vocals, Drums, Bass, and Melody as separate tracks from any audio source." },
    { kind: "summary", learned: ["Right-click audio clip → Separate to Stems (Live 12)", "Extracts: Vocals, Drums, Bass, Melody", "Runs locally — no cloud, no subscription needed"] },
  ],

  "midi-transforms": [
    { kind: "hook", emoji: "🔁", headline: "Transform notes with one click", subtext: "Strum, arpeggiate, ornament — MIDI Transformations rethink your clips." },
    { kind: "concept", title: "What are MIDI Transformations?", body: "Note Transformations (Live 12) are one-shot MIDI tools in the Piano Roll toolbar. Select notes, pick a transformation, preview the result, and commit. Each tool operates on the clip's note data destructively on commit.", keyFact: "Always duplicate the clip before committing a transformation." },
    { kind: "concept", title: "Key transformations", body: "Connect: fills note gaps with connecting notes. Arpeggiate: fans chord across time. Strum: slightly offsets chord notes (guitar-like). Recombine: randomises pitch-rhythm combinations. Ornament: adds grace notes.", keyFact: "Strum + slight timing = instant guitar-like chord strumming." },
    { kind: "interact", sim: "midi-transform", prompt: "Apply Strum to a held chord — adjust offset amount" },
    { kind: "quiz", q: "MIDI Transformations work on…", options: ["Audio clips only", "MIDI clip notes", "Drum Rack pads", "Automation lanes"], answer: 1, explain: "Note Transformations (Live 12) operate on the MIDI notes inside a clip — accessible from the Piano Roll toolbar." },
    { kind: "quiz", q: "Strum transformation…", options: ["Adds reverb to notes", "Offsets chord notes in time slightly (guitar strum effect)", "Doubles note velocity", "Slows down the clip"], answer: 1, explain: "Strum offsets the start time of each chord note slightly — mimicking how a guitarist strums strings one after another." },
    { kind: "quiz", q: "Transformations on commit are…", options: ["Non-destructive — always reversible", "Destructive — modifies the clip's note data", "Saved separately as a preset", "Applied only on export"], answer: 1, explain: "Committing a transformation permanently modifies the clip's MIDI notes — always duplicate first if you want the original." },
    { kind: "summary", learned: ["Note Transformations (Live 12) = one-click MIDI clip operations", "Strum, Arpeggiate, Connect, Recombine, Ornament", "Destructive on commit — always duplicate before committing"] },
  ],

  "scale-awareness": [
    { kind: "hook", emoji: "🎵", headline: "The whole project speaks one scale", subtext: "Set scale once — every MIDI clip and Push grid follows." },
    { kind: "concept", title: "Global Scale in Live 12", body: "Live 12 introduced a project-wide scale setting shown in the Control Bar. Set the root note and scale type once — every MIDI clip, MIDI effect, and Push 3 grid automatically knows the key.", keyFact: "Control Bar scale selector: root note + scale type (Major, Minor, etc.)." },
    { kind: "concept", title: "Per-clip overrides", body: "Individual MIDI clips can override the global scale. Right-click notes to fold to scale or transpose within the scale. Push 3 with scale mode dims out-of-scale pads — only musical notes are active.", keyFact: "Scale mode + right-click notes → Transpose in Scale (guaranteed in-key)." },
    { kind: "interact", sim: "scale-aware", prompt: "Set project scale to D Minor — observe Piano Roll fold" },
    { kind: "quiz", q: "Scale awareness is set…", options: ["Per note in the piano roll", "Per clip only", "Project-wide with per-clip overrides available"], answer: 2, explain: "Scale is set project-wide in the Control Bar — all instruments and Push 3 follow it, with optional per-clip overrides." },
    { kind: "quiz", q: "Push 3 with scale mode…", options: ["Only plays drums", "Hides out-of-scale pads so wrong notes are impossible", "Changes the tempo", "Locks velocity at 100"], answer: 1, explain: "Push 3 scale mode highlights in-scale pads and suppresses out-of-scale ones — every pad is a musical note in key." },
    { kind: "quiz", q: "Scale Awareness was introduced in…", options: ["Live 10", "Live 11", "Live 12"], answer: 2, explain: "Project-wide scale awareness is a Live 12 feature — coordinating key across all MIDI devices, clips, and Push 3." },
    { kind: "summary", learned: ["Live 12: set scale once in Control Bar for whole project", "Push 3: in-scale pads only, wrong notes impossible", "Right-click notes → Transpose in Scale for safe editing"] },
  ],

  "sound-similarity": [
    { kind: "hook", emoji: "🔍", headline: "Find sounds that sound like this one", subtext: "Live 12's Similarity Search finds by audio content, not names." },
    { kind: "concept", title: "How Similarity Search works", body: "Select a sample in the Browser and click the Similarity Search button. Live analyses the audio characteristics — timbre, spectral content, rhythmic feel — and finds perceptually similar samples in your library.", keyFact: "Similarity Search: right-click any sample → Find Similar." },
    { kind: "concept", title: "Combining with filters", body: "Stack Similarity Search with category filters (Kicks, Pads, etc.) and BPM range filters. Start from one sample you love and surf outward — escape preset paralysis by finding sounds you'd never browse to.", keyFact: "Similarity + Tags + BPM filter = highly targeted sound discovery." },
    { kind: "interact", sim: "browser-tour", prompt: "Find Similar on a kick sample — explore the results" },
    { kind: "quiz", q: "Similarity Search compares…", options: ["File names and folder structure", "Audio content: timbre and spectral characteristics", "File size", "Date modified"], answer: 1, explain: "Similarity Search analyses audio characteristics — what sounds like what, not what it's named or where it lives." },
    { kind: "quiz", q: "It works on samples in…", options: ["External hard drives only", "Your Ableton library (packs + user samples)", "Streaming services", "Cloud storage only"], answer: 1, explain: "Similarity Search works on your local Ableton library — factory packs and user samples added to the browser." },
    { kind: "quiz", q: "Best use of Similarity Search is…", options: ["Finding missing MIDI files", "Breaking out of preset paralysis — surf from sounds you like", "Deleting duplicates", "Checking file integrity"], answer: 1, explain: "Start from a sample you love, click Find Similar — discover sounds you'd never find by browsing folders by name." },
    { kind: "summary", learned: ["Similarity Search: finds by audio content, not filename", "Right-click sample → Find Similar in Browser", "Combine with tags and BPM filter for targeted discovery"] },
  ],

  "comping-flow": [
    { kind: "hook", emoji: "🎙", headline: "Multiple takes, one perfect performance", subtext: "Comp lanes + crossfades = professional vocal and instrument takes." },
    { kind: "concept", title: "Recording for comping", body: "Loop a section and record multiple passes. Enable Loop Overdub to have each pass land on a new take lane automatically. Record as many takes as you need — quality beats quantity on each pass.", keyFact: "Record 4–8 takes. Even one great moment per take = a perfect comp." },
    { kind: "concept", title: "The comping workflow", body: "In the take lanes area, click and drag horizontally across sections of each lane. Selected regions turn to the comp colour and appear on the top comp lane. Automatic crossfades handle the boundaries.", keyFact: "Drag edge handles on comp regions to adjust crossfade length." },
    { kind: "interact", sim: "comp-lake", prompt: "Comp three vocal takes into a finished performance" },
    { kind: "quiz", q: "Take Lanes show…", options: ["Only the final take", "Each pass as a separate row", "Only audio (not MIDI)", "Returns and sends"], answer: 1, explain: "Each recording pass creates a new take lane row — you can see and select from all your takes stacked below the comp." },
    { kind: "quiz", q: "Comping crossfades are…", options: ["Manual — you must add them", "Automatic — Live handles them at region boundaries", "Not supported in Live", "Only on audio (not MIDI)"], answer: 1, explain: "Live automatically creates crossfades at comp region boundaries — eliminates clicks at edit points." },
    { kind: "quiz", q: "Comping works on…", options: ["Audio only", "MIDI only", "Both audio and MIDI takes"], answer: 2, explain: "Take Lanes and comping work identically for audio recordings and MIDI performances." },
    { kind: "summary", learned: ["Loop record = new take lane each pass", "Drag to select comp regions — auto-crossfades applied", "Works for audio AND MIDI takes equally"] },
  ],

  "groove-pool": [
    { kind: "hook", emoji: "🕺", headline: "Borrow the swing of any loop", subtext: "Extract a groove from a sample, apply it to anything." },
    { kind: "concept", title: "The Groove Pool", body: "Open Show/Hide Groove Pool in the bottom-left. Drag any audio clip there to extract its timing feel. The groove captures both timing offset and velocity patterns — the full rhythmic personality of the loop.", keyFact: "Right-click audio clip → Extract Groove → Pool. Then drag to any clip." },
    { kind: "concept", title: "Groove controls", body: "Each groove in the Pool has four controls: Timing (how much timing deviation to apply), Random (adds variation), Velocity (how much dynamic feel to apply), Base grid (the reference grid). Commit to bake permanently.", keyFact: "Timing 50% + Velocity 30% = subtle human feel without over-cooking." },
    { kind: "interact", sim: "groove-extractor", prompt: "Extract groove from a drumloop — apply it to a MIDI drum clip" },
    { kind: "quiz", q: "Groove Pool extracts…", options: ["Pitch information", "Timing and velocity feel of a recording", "Reverb characteristics", "BPM only"], answer: 1, explain: "Groove Pool captures the timing offsets and velocity variations of a loop — its rhythmic and dynamic personality." },
    { kind: "quiz", q: "Grooves can be applied to…", options: ["Audio clips only", "MIDI clips only", "Any clip in Session or Arrangement"], answer: 2, explain: "Extracted grooves can be dragged onto any clip — audio or MIDI, Session or Arrangement." },
    { kind: "quiz", q: "Commit bakes the groove…", options: ["As a separate file", "Permanently into the clip's note/warp timing", "Only into audio", "Into the Rack only"], answer: 1, explain: "Commit writes the groove's timing offsets permanently into the clip's data — after commit, the groove reference is no longer needed." },
    { kind: "summary", learned: ["Groove Pool: extract timing feel from any audio loop", "Apply groove to any clip — MIDI or audio", "Commit: bakes groove permanently into clip data"] },
  ],

  "linked-track-editing": [
    { kind: "hook", emoji: "🔗", headline: "Edit multiple tracks as one", subtext: "Split, move, and trim stems in perfect lockstep." },
    { kind: "concept", title: "Linked track editing in Arrangement", body: "Select multiple tracks in Arrangement and link them. Now splits, moves, fades, and razor cuts apply identically to all linked tracks simultaneously. Essential for drum stems, multi-mic recordings, and any multi-track edit.", keyFact: "Shift+click tracks → Link Tracks. All edits now apply in lockstep." },
    { kind: "concept", title: "Why it matters", body: "When you have kick, snare, and overhead mics as separate tracks, you want them perfectly aligned. Linked editing ensures a split at bar 17 on the kick also splits at bar 17 on every other linked track.", keyFact: "Multi-mic drums in phase: always use linked editing." },
    { kind: "interact", sim: "arrangement", prompt: "Link three drum stem tracks — make a split cut on all at once" },
    { kind: "quiz", q: "Linked editing applies the same edit to…", options: ["One track only", "All linked tracks simultaneously", "Return tracks", "The Master only"], answer: 1, explain: "Linked track editing synchronises edits across all linked tracks — a single cut, move, or fade affects every linked track." },
    { kind: "quiz", q: "Linked editing is valuable for…", options: ["Single-instrument tracks", "Multi-mic recordings and stems that must stay aligned", "MIDI-only tracks", "Master effects only"], answer: 1, explain: "Multi-mic drums, vocal doubles, stems — anything where multiple tracks must remain in phase during editing." },
    { kind: "quiz", q: "Linking is…", options: ["Permanent once applied", "Toggleable — can be unlinked anytime", "Only available in Session View", "Only for audio (not MIDI)"], answer: 1, explain: "Linked track editing can be toggled — link, edit, unlink — or kept permanently for the whole project." },
    { kind: "summary", learned: ["Link tracks: same edits apply to all linked tracks at once", "Essential for multi-mic drums, stems, and doubled parts", "Toggleable anytime — link and unlink as needed"] },
  ],

  "push3-standalone": [
    { kind: "hook", emoji: "🎒", headline: "Live's engine in a portable box", subtext: "No laptop, full Live, anywhere." },
    { kind: "concept", title: "Standalone operation", body: "Push 3 Standalone runs Live's complete audio engine on the hardware — including all instruments, effects, and Max for Live devices. USB-C for audio I/O. Battery option available. A complete studio in a travel case.", keyFact: "Push 3: 64 pads, touch display, encoders, I/O — self-contained Live." },
    { kind: "concept", title: "File transfer and compatibility", body: "Transfer projects via USB drive or Wi-Fi — plug Push 3 into a computer and it appears as a network drive. Push 3 Standalone projects open directly in Live on your computer. No conversion, same .als format.", keyFact: "Same .als file: open on Push 3 or computer Live interchangeably." },
    { kind: "interact", sim: "push3", prompt: "Navigate the Push 3 touchscreen — browse presets and load a sound" },
    { kind: "quiz", q: "Push 3 Standalone runs…", options: ["A mobile DAW app", "Live's full audio engine directly on the device", "Only a MIDI sequencer", "Cloud streaming only"], answer: 1, explain: "Push 3 Standalone contains Live's complete audio engine — full plugin support, effects, and instruments." },
    { kind: "quiz", q: "Projects move between Push 3 and computer Live…", options: ["Through a conversion process", "Without any conversion — same .als format", "By exporting to MP3 then re-importing", "Via Ableton servers only"], answer: 1, explain: "Push 3 projects use the same .als file format as computer Live — open them directly on either platform." },
    { kind: "quiz", q: "Push 3 Standalone needs a laptop?", options: ["Yes — always tethered", "No — fully self-contained", "Only for audio playback", "Only for MIDI recording"], answer: 1, explain: "Push 3 Standalone is entirely self-contained — produce, mix, and perform without any laptop at any stage." },
    { kind: "summary", learned: ["Push 3 Standalone = Live's full engine on hardware", "Same .als format — works interchangeably with computer Live", "USB-C audio I/O, optional battery = truly portable studio"] },
  ],

  "cpu-audio-setup": [
    { kind: "hook", emoji: "💻", headline: "When CPU maxes — here's what to do", subtext: "Four levers: buffer, freeze, flatten, and routing efficiency." },
    { kind: "concept", title: "Buffer size and CPU", body: "Larger buffer size gives the CPU more time per audio chunk — the primary lever for reducing dropouts. Trade-off is higher latency. Use 512–1024 samples for mixing-heavy sessions where real-time input isn't critical.", keyFact: "Recording: 128 samples. Mixing/mastering: 512–1024 samples." },
    { kind: "concept", title: "Freeze and Flatten workflow", body: "Freeze renders a track to a temporary audio file — saves CPU while preserving device chain for future edits. Flatten permanently bakes the freeze and removes devices. Duplicate before flattening if you might need the original.", keyFact: "Freeze + Flatten = maximum CPU relief. Duplicate first = safety net." },
    { kind: "interact", sim: "buffer-sim", prompt: "Observe CPU meter — freeze a heavy synth and watch it drop" },
    { kind: "quiz", q: "Bigger buffer size provides…", options: ["Less CPU headroom", "More CPU headroom at cost of more latency", "Better audio quality", "Faster rendering"], answer: 1, explain: "Larger buffer = more time per chunk = CPU has more time to process = less crackling. Trades off against latency." },
    { kind: "quiz", q: "Flatten is different from Freeze because…", options: ["Freeze is destructive — Flatten is not", "Flatten is destructive and removes device chain permanently", "They are identical", "Flatten only works on audio tracks"], answer: 1, explain: "Flatten permanently renders the frozen audio and removes the device chain — unlike Freeze which is always reversible." },
    { kind: "quiz", q: "Freeze writes the track's output to…", options: ["RAM buffer only", "A temporary audio file on disk", "Cloud storage", "The Master track"], answer: 1, explain: "Freeze renders a temp audio file to disk — Live reads from this rather than recalculating devices in real time." },
    { kind: "summary", learned: ["Recording: low buffer (128). Mixing: higher buffer (512+)", "Freeze = reversible CPU relief. Flatten = permanent bake", "Duplicate before Flatten — can't undo device removal"] },
  ],

  "accessibility-features": [
    { kind: "hook", emoji: "♿", headline: "Live 12 makes music accessible to everyone", subtext: "Screen reader, high contrast, keyboard navigation throughout." },
    { kind: "concept", title: "Accessibility in Live 12", body: "Live 12 added formal accessibility support: full screen reader integration, Speak Help (tooltips read aloud), high-contrast UI mode, and comprehensive keyboard navigation across Session, Arrangement, Browser, and Devices.", keyFact: "Preferences > Look/Feel > Accessibility to enable all features." },
    { kind: "concept", title: "Speak Help for everyone", body: "Speak Help reads any tooltip text out loud using the system screen reader. Even sighted producers use it as a quick 'what does this do?' shortcut — hover any unfamiliar knob and hear the explanation instantly.", keyFact: "Speak Help = universal discovery tool, not just for screen reader users." },
    { kind: "interact", sim: "interface-tour", prompt: "Navigate to a device using keyboard only — no mouse" },
    { kind: "quiz", q: "Speak Help reads…", options: ["Audio files aloud", "Tooltip text aloud using the system screen reader", "Clip names only", "MIDI note names"], answer: 1, explain: "Speak Help (Live 12) reads tooltip text aloud — the same text shown in the Info View, spoken by the screen reader." },
    { kind: "quiz", q: "Live 12 accessibility features include…", options: ["Only high-contrast mode", "Screen reader, Speak Help, high contrast, keyboard navigation", "Only keyboard shortcuts", "Only screen reader"], answer: 1, explain: "Live 12 introduced a comprehensive accessibility suite: screen reader support, Speak Help, high contrast, and keyboard nav." },
    { kind: "quiz", q: "Accessibility features benefit…", options: ["Only users with disabilities", "All users — faster discovery and navigation", "Only beginners", "Only advanced users"], answer: 1, explain: "Accessibility features help everyone — keyboard nav, high contrast, and Speak Help speed up workflows for all users." },
    { kind: "summary", learned: ["Live 12: screen reader, high contrast, keyboard navigation", "Speak Help reads any tooltip aloud on hover", "Enable in Preferences > Look/Feel > Accessibility"] },
  ],


  // ─── CHAPTER 6: SYNTHESIS ────────────────────────────────────────────────

  "synth-what-is-sound": [
    { kind: "hook", emoji: "🔊", headline: "Sound is a wave of pressure", subtext: "Everything you hear starts as vibration moving through air." },
    { kind: "concept", title: "Sound as pressure waves", body: "Sound is created when something vibrates — speaker cone, string, vocal cord. The vibration pushes and pulls air molecules, creating pressure waves that travel to your ear at 340 m/s.", keyFact: "No air = no sound. Sound doesn't exist in a vacuum.", visual: "waveform" },
    { kind: "concept", title: "Synthesisers make sound electrically", body: "A synthesiser generates electrical voltage oscillations, shapes them into a desired waveform, then converts to audio via a speaker. No physical vibration needed — mathematics creates the wave.", keyFact: "Synth = electrical signal shaped into a waveform, converted to air movement." },
    { kind: "interact", sim: "waveform-visualizer", prompt: "Tap a waveform — see the shape and hear the character" },
    { kind: "quiz", q: "Sound physically consists of…", options: ["Light waves", "Pressure waves moving through air", "Electrical signals only", "Magnetic fields"], answer: 1, explain: "Sound = pressure waves. Vibration compresses air molecules, and those compressions travel outward as waves." },
    { kind: "quiz", q: "A synthesiser creates sound by…", options: ["Recording microphone input", "Generating electrical oscillations and converting to audio", "Sampling existing sounds", "Triggering physical strings"], answer: 1, explain: "Synths generate electrical voltage oscillations, shape them (filter, envelope), and convert via speaker to physical sound." },
    { kind: "quiz", q: "Sound travels at approximately…", options: ["3,000 m/s", "340 m/s in air", "Speed of light", "1 m/s"], answer: 1, explain: "Sound travels at ~340 m/s in air at room temperature — much slower than light, which is why we see lightning before hearing thunder." },
    { kind: "summary", learned: ["Sound = pressure waves created by vibration", "Synths generate electrical waves and convert to audio", "Sound travels at ~340 m/s in air"] },
  ],

  "synth-pitch-vs-amplitude": [
    { kind: "hook", emoji: "📊", headline: "Frequency is pitch. Amplitude is volume.", subtext: "Two measurements define every sound you hear." },
    { kind: "concept", title: "Frequency = pitch", body: "Frequency is how many times a wave cycles per second, measured in Hertz (Hz). 440 Hz = 440 cycles per second = A4 concert pitch. Double the frequency = one octave higher.", keyFact: "440 Hz = A4. 880 Hz = A5 (one octave up). 220 Hz = A3.", visual: "frequency-bar" },
    { kind: "concept", title: "Amplitude = volume", body: "Amplitude is the height of the wave — how much the air pressure moves. In digital audio, measured in dBFS. 0 dBFS = maximum before clipping. Every 6 dB doubles perceived loudness.", keyFact: "0 dBFS = ceiling. Aim for −6 dBFS peak during mixing.", visual: "amplitude-dial" },
    { kind: "interact", sim: "ear-training", prompt: "Identify the higher-pitched tone — trust your ears" },
    { kind: "quiz", q: "880 Hz compared to 440 Hz is…", options: ["Same pitch, louder", "One octave lower", "One octave higher", "A fifth up"], answer: 2, explain: "Doubling frequency raises pitch by exactly one octave. 880 Hz = A5, one octave above A4 (440 Hz)." },
    { kind: "quiz", q: "Amplitude determines…", options: ["Pitch", "Timbre", "Volume/loudness", "Speed"], answer: 2, explain: "Amplitude is the size (height) of the wave — larger amplitude = more air pressure movement = louder sound." },
    { kind: "quiz", q: "+6 dB approximately…", options: ["Halves the volume", "Doubles perceived loudness", "Raises pitch by an octave", "Has no effect"], answer: 1, explain: "The decibel scale is logarithmic — +6 dB roughly doubles perceived loudness. −6 dB roughly halves it." },
    { kind: "summary", learned: ["Frequency (Hz) = pitch. Double Hz = one octave up", "Amplitude = volume. Larger wave = louder", "0 dBFS = digital ceiling. −6 dBFS = safe peak target"] },
  ],

  "synth-timbre": [
    { kind: "hook", emoji: "🎸", headline: "Same note, totally different sound", subtext: "Piano and guitar play C4 — but sound nothing alike. That's timbre." },
    { kind: "concept", title: "What is timbre?", body: "Timbre (TAM-ber) is tonal colour — what makes a violin different from a flute at the same pitch and volume. Timbre is defined by which harmonics are present and how loud each one is.", keyFact: "Timbre = harmonic recipe. Different ingredients = different character." },
    { kind: "concept", title: "Harmonics shape timbre", body: "A sine wave has zero harmonics — pure tone. A sawtooth has all harmonics — bright and buzzy. A square has only odd harmonics — hollow and woody. A triangle has weak odd harmonics — soft.", keyFact: "More harmonics = brighter. Fewer harmonics = purer and softer.", visual: "waveform" },
    { kind: "interact", sim: "waveform-visualizer", prompt: "Switch waveforms — hear how timbre changes with each shape" },
    { kind: "quiz", q: "Two instruments play the same note at same volume. They differ by…", options: ["Tempo", "Timbre — different harmonic content", "Room size only", "Microphone type"], answer: 1, explain: "Timbre is the harmonic recipe — the mix of overtones that makes every instrument sound unique at the same pitch." },
    { kind: "quiz", q: "A sawtooth is brighter than a sine because…", options: ["It vibrates faster", "It contains all harmonics (odd and even)", "It's louder", "It has a slower attack"], answer: 1, explain: "Sawtooth contains all integer harmonics — all those overtones add up to a bright, buzzy, harmonically rich sound." },
    { kind: "quiz", q: "Timbre in synthesis is shaped by…", options: ["Only the oscillator waveform", "Oscillator waveform + filter + envelope", "Only the filter", "Only the envelope"], answer: 1, explain: "Timbre emerges from the oscillator (what harmonics exist), filter (which to cut), and envelope (how loudness changes over time)." },
    { kind: "summary", learned: ["Timbre = harmonic recipe that makes sounds unique", "Sine = pure (no harmonics). Saw = bright (all harmonics)", "Filter and envelope also shape timbre in synthesis"] },
  ],

  "synth-harmonics": [
    { kind: "hook", emoji: "🎻", headline: "One note contains many frequencies", subtext: "Hit middle C on a piano and hear hidden frequencies above it." },
    { kind: "concept", title: "The harmonic series", body: "Every pitched sound contains a fundamental frequency plus harmonics at 2×, 3×, 4× the fundamental. These are always whole-number multiples. Their relative loudness defines the timbre.", keyFact: "Harmonic 2 = octave. Harmonic 3 = octave+fifth. Harmonic 4 = 2 octaves.", visual: "frequency-bar" },
    { kind: "concept", title: "Harmonics in synthesis", body: "Synthesisers can add or remove harmonics precisely. A low-pass filter cuts high harmonics, making the sound darker. Adding upper partials (overtones) makes it brighter. This is the core of subtractive synthesis.", keyFact: "Low-pass filter = removes high harmonics = darker sound." },
    { kind: "interact", sim: "ear-training", prompt: "Identify the instrument by its harmonic content" },
    { kind: "quiz", q: "If fundamental is 100 Hz, the 3rd harmonic is…", options: ["200 Hz", "300 Hz", "150 Hz", "400 Hz"], answer: 1, explain: "Harmonics are at integer multiples: 1st=100 Hz, 2nd=200 Hz, 3rd=300 Hz. The 3rd harmonic = 3 × fundamental." },
    { kind: "quiz", q: "A low-pass filter makes a synth sound…", options: ["Brighter", "Darker (cuts high harmonics)", "Louder", "More reverberant"], answer: 1, explain: "Low-pass = passes low frequencies, cuts high harmonics. Removing upper partials = darker, warmer sound." },
    { kind: "quiz", q: "The 2nd harmonic is…", options: ["One octave below", "One octave above the fundamental", "A perfect fifth above", "Unrelated to the fundamental"], answer: 1, explain: "The 2nd harmonic = 2 × fundamental = one octave higher. That's why octave-harmonics sound like the 'same note' to our ears." },
    { kind: "summary", learned: ["Harmonics are at 2×, 3×, 4× the fundamental frequency", "2nd harmonic = octave. 3rd = octave + fifth", "Low-pass filter cuts high harmonics → darker sound"] },
  ],

  "synth-noise": [
    { kind: "hook", emoji: "📻", headline: "Noise is all frequencies at once", subtext: "White noise contains every frequency equally — the ultimate source." },
    { kind: "concept", title: "Noise as a synthesis source", body: "White noise contains all audible frequencies at equal energy. Pink noise has equal energy per octave (sounds more natural). Noise is essential for snares, hi-hats, breath sounds, and adding air to synth pads.", keyFact: "White = all frequencies equally. Pink = equal energy per octave." },
    { kind: "concept", title: "Noise in subtractive synthesis", body: "Start with white noise. Apply a short envelope (fast attack, fast decay) and you get a snare transient. Apply a long band-pass filter and you get ocean waves. Noise shaped by envelope and filter = almost anything.", keyFact: "Noise + filter + envelope = snares, waves, wind, breath, explosions." },
    { kind: "interact", sim: "waveform-visualizer", prompt: "Listen to white noise — observe the random waveform" },
    { kind: "quiz", q: "White noise contains…", options: ["Only low frequencies", "Only harmonics", "All audible frequencies at equal energy", "Only odd harmonics"], answer: 2, explain: "White noise = equal energy at all frequencies from 20 Hz to 20 kHz — the most harmonically complex possible source." },
    { kind: "quiz", q: "Noise is used in synths for…", options: ["Bass lines only", "Snares, hi-hats, breath, and air in pads", "Sustained pads only", "Nothing — noise is always unwanted"], answer: 1, explain: "Noise is a crucial synthesis source — combined with envelopes and filters it makes percussion, wind, and textural elements." },
    { kind: "quiz", q: "Pink noise vs white noise…", options: ["Pink is louder", "Pink has equal energy per octave (sounds more natural)", "They are identical", "White has less bass"], answer: 1, explain: "Pink noise has equal energy per octave — because we perceive octaves logarithmically, pink noise sounds more balanced to our ears." },
    { kind: "summary", learned: ["White noise = all frequencies at equal energy", "Noise + envelope + filter = percussion, wind, breath", "Pink noise: equal per octave, sounds more natural than white"] },
  ],



  "synth-oscillators": [
    { kind: "hook", emoji: "📡", headline: "Oscillators are the voice of a synth", subtext: "They generate the raw waveform — everything starts here." },
    { kind: "concept", title: "What oscillators do", body: "An oscillator generates a repeating waveform at a set frequency. The keyboard sets the frequency. The waveform choice (sine, saw, square, triangle, noise) determines the harmonic content and initial timbre.", keyFact: "Oscillator = pitch + waveform. The synth's raw voice." },
    { kind: "concept", title: "Multiple oscillators", body: "Most synths have 2–3 oscillators. Running them at the same pitch creates a fatter sound. Detune them slightly for a chorus effect. Tune one an octave up for brightness, or a fifth for a classic 2-oscillator texture.", keyFact: "2 oscillators slightly detuned = instant super-saw pad width.", visual: "waveform" },
    { kind: "interact", sim: "osc-mixer", prompt: "Add a second oscillator — detune slightly and hear the width" },
    { kind: "quiz", q: "An oscillator generates…", options: ["MIDI notes", "A repeating waveform at a set frequency", "Reverb", "Velocity data"], answer: 1, explain: "Oscillators generate repeating electrical waveforms — the fundamental sound source for all synthesis." },
    { kind: "quiz", q: "Slightly detuning two oscillators creates…", options: ["Out-of-tune sound", "A chorus/width effect", "Pitch instability", "Noise"], answer: 1, explain: "When two oscillators are nearly (but not exactly) the same frequency, they beat against each other — creating the chorus thickening effect." },
    { kind: "quiz", q: "The keyboard controls the oscillator's…", options: ["Volume", "Waveform type", "Frequency (pitch)", "Filter cutoff"], answer: 2, explain: "MIDI notes from the keyboard set the oscillator's playback frequency — higher notes = higher frequency = higher pitch." },
    { kind: "summary", learned: ["Oscillator = waveform generator at set frequency", "Multiple oscillators: same pitch = fat, detuned = chorus", "Keyboard sets the oscillator frequency (pitch)"] },
  ],

  "synth-mixing-oscillators": [
    { kind: "hook", emoji: "🎛", headline: "Mix oscillators to blend timbres", subtext: "Two waveforms at different levels creates a new timbre." },
    { kind: "concept", title: "The oscillator mixer", body: "Between the oscillator(s) and the filter is an oscillator mixer. Blend two or more oscillators at different levels to combine their timbres. 50% saw + 50% square creates a blend you can't get from one wave alone.", keyFact: "Osc mix = timbre blend. 100% Osc1 + 0% Osc2 = pure Osc1 character." },
    { kind: "concept", title: "Sub-oscillator and noise", body: "Many synths include a sub-oscillator (one octave below Osc1) for added bass weight, and a noise generator for air and transient texture. The mixer lets you blend all these sources at independent levels.", keyFact: "Sub osc at 20% + saw at 80% = thick bass that sits low in the mix." },
    { kind: "interact", sim: "osc-mixer", prompt: "Blend sawtooth and square oscillators — find a character between them" },
    { kind: "quiz", q: "Mixing 50% saw + 50% square creates…", options: ["A pure sine wave", "A hybrid timbre blending both characters", "Just louder output", "No sound"], answer: 1, explain: "Blending oscillators creates new timbres — 50/50 saw+square gives a sound between the two, neither bright buzzy nor hollow woody." },
    { kind: "quiz", q: "A sub-oscillator adds…", options: ["High-frequency sparkle", "Low-frequency weight one octave down", "Reverb", "Vibrato"], answer: 1, explain: "Sub-oscillator runs one octave below Osc1 — adds low-end weight and body without a separate bass instrument." },
    { kind: "quiz", q: "The oscillator mixer sits…", options: ["After the filter", "Before the filter and after the oscillators", "After the amp envelope", "Before the oscillators"], answer: 1, explain: "Signal flow: Oscillators → Mixer → Filter → Amp. The mixer blends oscillators before the filter processes them." },
    { kind: "summary", learned: ["Oscillator mixer: blend sources before the filter", "50% saw + 50% square = new hybrid timbre", "Sub-oscillator adds bass weight one octave below"] },
  ],

  "synth-detune-unison": [
    { kind: "hook", emoji: "🎻", headline: "Detune creates width. Unison creates mass.", subtext: "These two techniques separate amateur patches from pro ones." },
    { kind: "concept", title: "Detune and beating", body: "When two oscillators are slightly detuned (a few cents apart), they beat against each other at a rate equal to their frequency difference. 5 Hz apart = five beats per second — heard as slow chorus shimmer.", keyFact: "0 cents = clean. 5–10 cents = chorus. 20+ cents = out of tune." },
    { kind: "concept", title: "Unison voicing", body: "Unison stacks multiple copies of the voice (2, 4, 8, 16) simultaneously, each slightly detuned. The result is a 'supersaw' or thick pad sound. Unison voices are spread stereo for massive width.", keyFact: "Unison 8 voices + detune 10 cents = the classic trance supersawpad." },
    { kind: "interact", sim: "osc-mixer", prompt: "Enable Unison on Wavetable — increase voice count and hear it thicken" },
    { kind: "quiz", q: "Beating between oscillators occurs because…", options: ["They are the same pitch", "They are slightly different frequencies — interference creates oscillation", "One is louder", "They use different waveforms"], answer: 1, explain: "Two frequencies close but not identical create constructive/destructive interference at a rate = their frequency difference." },
    { kind: "quiz", q: "Unison stacks voices by…", options: ["Octave intervals only", "Multiple copies slightly detuned (often spread stereo)", "Adding reverb", "Layering different instruments"], answer: 1, explain: "Unison stacks copies of the same voice at slightly different detune amounts, spread across the stereo field — creates thickness." },
    { kind: "quiz", q: "Too much detune sounds…", options: ["Professional and wide", "Out of tune and incoherent", "Brighter", "More compressed"], answer: 1, explain: "Extreme detuning loses the fundamental pitch relationship — sounds detuned rather than wide. 5–15 cents is the sweet spot." },
    { kind: "summary", learned: ["Detune: slight frequency offset between oscillators = chorus", "5–15 cents = sweet spot for warmth and width", "Unison: multiple detuned voices = thick pad/supersaw sound"] },
  ],

  "synth-filters": [
    { kind: "hook", emoji: "🎛", headline: "Filters sculpt the harmonic content", subtext: "The filter is where subtractive synthesis gets its name." },
    { kind: "concept", title: "The low-pass filter", body: "A low-pass filter (LPF) passes frequencies below the cutoff and removes those above. Sweep the cutoff down and the sound gets darker. Sweep up and brightness returns. The most important control in a synth.", keyFact: "LPF: low frequencies pass. High frequencies cut at the cutoff point." },
    { kind: "concept", title: "Resonance (Q)", body: "Resonance boosts frequencies near the cutoff point — adding a sharp, ringing peak. Low resonance = smooth filtering. High resonance = squelchy, whistling character. At maximum resonance, a filter self-oscillates.", keyFact: "High resonance + cutoff sweep = classic synth 'wah' or 'acid' sound.", visual: "eq-curve" },
    { kind: "interact", sim: "filter-envelope", prompt: "Sweep filter cutoff — listen as harmonics appear and disappear" },
    { kind: "quiz", q: "Low-pass filter passes…", options: ["High frequencies", "Low frequencies (cuts high harmonics)", "All frequencies equally", "Only the fundamental"], answer: 1, explain: "Low-pass: frequencies BELOW the cutoff pass through. Frequencies ABOVE are reduced. Lower cutoff = darker sound." },
    { kind: "quiz", q: "Resonance on a filter…", options: ["Cuts all frequencies", "Boosts frequencies near the cutoff point", "Adds reverb", "Doubles the volume"], answer: 1, explain: "Resonance creates a peak at the cutoff frequency — high resonance gives the squelchy, characteristic 'filter' sound." },
    { kind: "quiz", q: "Filter self-oscillation happens at…", options: ["Zero resonance", "Maximum resonance — produces a sine tone at cutoff freq", "Any resonance setting", "Only on high-pass filters"], answer: 1, explain: "At maximum resonance, the filter feedback loop produces its own sine wave at the cutoff frequency — pure oscillation." },
    { kind: "summary", learned: ["Low-pass filter: passes low, cuts high (darker sound)", "Cutoff: sweep up = brighter. Sweep down = darker", "Resonance: boost at cutoff. Max resonance = self-oscillation"] },
  ],

  "synth-amp-envelope": [
    { kind: "hook", emoji: "📈", headline: "ADSR shapes how a note evolves over time", subtext: "Attack, Decay, Sustain, Release — four knobs, infinite expression." },
    { kind: "concept", title: "The four stages of ADSR", body: "Attack: time to reach full volume after key press. Decay: time to fall from peak to Sustain level. Sustain: volume level held while key is pressed. Release: time to fade to silence after key release.", keyFact: "Attack 0 = immediate. Release 0 = instant cut. Long both = pad shape." },
    { kind: "concept", title: "Envelope shapes define feel", body: "Plucky sound: fast attack, fast decay, zero sustain, medium release. Pad sound: slow attack, no decay, full sustain, slow release. Percussion: fast attack, fast decay, zero sustain, fast release.", keyFact: "Piano: fast attack, medium decay, zero sustain, medium release.", visual: "waveform" },
    { kind: "interact", sim: "filter-envelope", prompt: "Adjust attack and release — hear how the note shape changes" },
    { kind: "quiz", q: "Attack controls…", options: ["How fast sound fades after release", "How long it takes to reach full volume after key press", "The held volume level", "Decay shape"], answer: 1, explain: "Attack = time from key press to peak amplitude. Fast attack = immediate. Slow attack = gradual fade-in (pad quality)." },
    { kind: "quiz", q: "Sustain is…", options: ["A time value like attack", "The volume level held while the key is held", "The time after release", "The decay rate"], answer: 1, explain: "Sustain is a level (not a time) — the amplitude the note holds at as long as the key is depressed." },
    { kind: "quiz", q: "Fast attack + fast decay + zero sustain creates…", options: ["A sustained pad", "A plucky percussive sound", "A violin bow sound", "A long fade-out"], answer: 1, explain: "Fast attack hits peak immediately. Fast decay drops to zero sustain quickly. Result: a short, punchy pluck or stab." },
    { kind: "summary", learned: ["ADSR: Attack (time to peak), Decay (fall to sustain), Sustain (level held), Release (fade after keyup)", "Pluck: fast A, fast D, 0 S, medium R", "Pad: slow A, no D, full S, slow R"] },
  ],

  "synth-filter-envelope": [
    { kind: "hook", emoji: "🌊", headline: "Envelopes control more than just volume", subtext: "Route an envelope to the filter for dynamic timbre changes." },
    { kind: "concept", title: "Filter envelope", body: "A filter envelope modulates the filter cutoff frequency over time. Set the Amount to positive: filter opens on attack, closes on decay. Negative Amount: filter closes on attack, opens on decay (rare, but used for reverse sweeps).", keyFact: "Envelope Amount = how far the filter sweeps from its initial cutoff." },
    { kind: "concept", title: "Combining amp and filter envelopes", body: "Amp envelope shapes volume over time. Filter envelope shapes brightness over time — independently. A note can start bright and get darker (filter decays down) while its volume holds steady (amp sustaining).", keyFact: "Amp env + filter env = complex, evolving, expressive sound design." },
    { kind: "interact", sim: "filter-envelope", prompt: "Set filter envelope amount to 80% — hear cutoff move on each note" },
    { kind: "quiz", q: "Filter envelope Amount controls…", options: ["Volume of the note", "How far the filter cutoff moves from its resting position", "Reverb send level", "Oscillator pitch"], answer: 1, explain: "Envelope Amount sets the depth of filter modulation — how many Hz or semitones the cutoff moves from its base position." },
    { kind: "quiz", q: "Classic synth bass 'boing' uses…", options: ["Slow filter envelope with no decay", "Fast attack, fast decay filter envelope at high resonance", "Only the amp envelope", "No filter at all"], answer: 1, explain: "The 'boing' is a fast filter opening then quickly closing — combined with high resonance it creates that bouncy synth bass character." },
    { kind: "quiz", q: "Negative filter envelope amount…", options: ["Has no effect", "Opens filter on decay (starts dark, brightens over time)", "Is not possible", "Silences the sound"], answer: 1, explain: "Negative envelope amount inverts the sweep — filter starts closed (dark) then opens to Sustain level, which is unusual but expressive." },
    { kind: "summary", learned: ["Filter envelope modulates cutoff frequency over time", "Positive amount = opens on attack. Negative = closes on attack", "Combine amp + filter envelopes for evolving timbres"] },
  ],

  "synth-amp-vs-filter-env": [
    { kind: "hook", emoji: "⚖️", headline: "Amp and filter envelopes work together", subtext: "One shapes volume, one shapes brightness — both shape feel." },
    { kind: "concept", title: "Side by side", body: "Amp envelope controls the overall loudness envelope of the note (ADSR applied to volume). Filter envelope controls the tonal brightness over time (ADSR applied to filter cutoff). They run simultaneously and independently.", keyFact: "Fast filter decay + slow amp decay = starts bright, sustains dark." },
    { kind: "concept", title: "Making sounds dynamic", body: "A static synth (no modulation, envelopes flat) sounds like a lifeless tone. Adding amp envelope gives it a shape. Adding filter envelope gives it tonal movement. Together they make a sound feel alive and played, not generated.", keyFact: "Velocity → envelope depth = dynamics that respond to touch." },
    { kind: "interact", sim: "filter-envelope", prompt: "Set different amp and filter envelope times — observe the independence" },
    { kind: "quiz", q: "Amp envelope controls…", options: ["Filter brightness", "Volume shape over time", "Oscillator pitch", "Reverb amount"], answer: 1, explain: "The amp envelope applies ADSR to the signal's amplitude (volume) — how it gets louder, holds, and fades away." },
    { kind: "quiz", q: "Filter envelope controls…", options: ["Note duration", "Tonal brightness over time via filter cutoff", "Pan position", "Delay time"], answer: 1, explain: "The filter envelope applies ADSR to the filter's cutoff frequency — making the sound dynamically brighter or darker over time." },
    { kind: "quiz", q: "Running both envelopes differently creates…", options: ["Contradiction — only one should run", "Rich, independent tonal and volume movement", "Double the volume", "Cancellation"], answer: 1, explain: "Amp and filter envelopes are independent — different settings create complex relationships between volume shape and tonal evolution." },
    { kind: "summary", learned: ["Amp env = volume shape. Filter env = brightness shape", "Both run simultaneously and independently", "Independent settings create complex, alive-sounding patches"] },
  ],

  "synth-lfo": [
    { kind: "hook", emoji: "〰️", headline: "LFO creates automatic cyclic movement", subtext: "Below 20 Hz — too slow to hear as pitch, but felt as modulation." },
    { kind: "concept", title: "What is an LFO?", body: "A Low Frequency Oscillator (LFO) generates a waveform below the audible range (typically 0.1–20 Hz). Route its output to a parameter — pitch (vibrato), filter (wah), volume (tremolo) — for automatic cyclic movement.", keyFact: "LFO to pitch = vibrato. LFO to filter = wah. LFO to amp = tremolo." },
    { kind: "concept", title: "LFO controls", body: "Rate controls how fast the LFO cycles. Depth controls how much it moves the target. Waveform shapes the movement: sine = smooth, square = binary stepping, S&H = random steps. Sync to tempo for rhythmically locked movement.", keyFact: "LFO synced to 1/4 note rate = filter modulation that pulses on the beat." },
    { kind: "interact", sim: "lfo-lab", prompt: "Route an LFO to filter cutoff — adjust rate and depth" },
    { kind: "quiz", q: "LFO stands for…", options: ["Loud Frequency Oscillator", "Low Frequency Oscillator", "Left Filter Output", "Layered FM Operator"], answer: 1, explain: "LFO = Low Frequency Oscillator — operates below the audible range (under ~20 Hz) as a modulation source." },
    { kind: "quiz", q: "LFO to pitch creates…", options: ["Tremolo", "Vibrato", "Reverb", "Chorus"], answer: 1, explain: "Vibrato = pitch modulation. LFO modulating the oscillator pitch frequency creates the classic vibrato effect." },
    { kind: "quiz", q: "Tempo-sync LFO means…", options: ["Random timing", "LFO rate locks to project BPM", "LFO stops working", "LFO goes faster"], answer: 1, explain: "Tempo-sync locks the LFO rate to musical divisions (1/4, 1/8, etc.) so modulation stays rhythmically in phase with your track." },
    { kind: "summary", learned: ["LFO: sub-audio frequency waveform as modulation source", "LFO → pitch = vibrato. LFO → filter = wah. LFO → amp = tremolo", "Tempo-sync: LFO locks to BPM for rhythmic modulation"] },
  ],

  "synth-modulation-routing": [
    { kind: "hook", emoji: "🗺", headline: "Connect any source to any destination", subtext: "Modulation routing is the superpower of modern synthesis." },
    { kind: "concept", title: "Modulation sources and destinations", body: "Sources: LFO, envelope, velocity, aftertouch, mod wheel, MIDI CC. Destinations: any parameter — filter cutoff, pitch, volume, pan, oscillator position. Route any source to any destination via the modulation matrix.", keyFact: "Velocity → filter cutoff amount = brighter when you play harder." },
    { kind: "concept", title: "Modulation matrix in Wavetable", body: "Wavetable's modulation matrix is at the bottom of the device. Drag from a source row to a destination column. Set the amount (positive or negative). Stack multiple sources modulating the same destination.", keyFact: "Envelope 2 → Filter Cutoff + LFO 1 → Filter Cutoff = complex filter movement." },
    { kind: "interact", sim: "lfo-lab", prompt: "Route velocity to filter cutoff amount — play hard vs soft" },
    { kind: "quiz", q: "A modulation matrix allows…", options: ["Only LFO to filter connections", "Any source to any destination at any amount", "Only envelope connections", "Only MIDI CC routing"], answer: 1, explain: "Modulation matrices allow any modulation source to connect to any parameter destination — open-ended sound design." },
    { kind: "quiz", q: "Velocity → filter cutoff creates…", options: ["Same brightness regardless of how hard you play", "Brighter sounds when playing harder", "More reverb when playing harder", "Louder amp when playing harder"], answer: 1, explain: "Routing velocity to filter cutoff amount makes harder playing open the filter more — dynamic, expressive, responsive pads and leads." },
    { kind: "quiz", q: "Stacking two modulation sources on the same destination…", options: ["Is not possible", "Cancels them out", "Combines their effects for more complex movement", "Requires a separate device"], answer: 2, explain: "Multiple sources can modulate the same destination simultaneously — their effects add together for complex, multi-layered movement." },
    { kind: "summary", learned: ["Modulation matrix: any source → any destination", "Common: velocity → filter, LFO → pitch, envelope → pan", "Stack sources on one destination for complex motion"] },
  ],

  "synth-fm-basics": [
    { kind: "hook", emoji: "📡", headline: "FM synthesis creates complex harmonics from simple oscillators", subtext: "One oscillator modulates another's frequency — mathematics makes music." },
    { kind: "concept", title: "How FM works", body: "In FM synthesis, a Modulator oscillator modulates the frequency of a Carrier oscillator. This creates new frequencies (sidebands) that don't exist in either oscillator alone — complex harmonic spectra from just two sines.", keyFact: "Higher modulator output = more sidebands = brighter, more complex sound." },
    { kind: "concept", title: "Carrier to modulator ratio", body: "The ratio between carrier and modulator frequency determines the character. Integer ratios (1:1, 2:1) produce harmonic timbres — musical and pitched. Non-integer ratios (1:1.41) produce inharmonic timbres — bells, metallic.", keyFact: "Integer ratio = harmonic. Non-integer ratio = inharmonic (metallic, bell)." },
    { kind: "interact", sim: "device-lab", prompt: "In Operator: adjust modulator level — hear harmonics emerge" },
    { kind: "quiz", q: "FM synthesis involves…", options: ["Playing multiple recordings simultaneously", "Modulator oscillator modulating carrier oscillator's frequency", "Sub-bass addition", "Only filter processing"], answer: 1, explain: "FM = Frequency Modulation. One oscillator (modulator) changes the frequency of another (carrier) to create sidebands." },
    { kind: "quiz", q: "Higher modulator output level creates…", options: ["Quieter sound", "More harmonic sidebands (brighter, more complex)", "Pure sine tone", "More noise"], answer: 1, explain: "Modulator output level (FM depth) determines how much frequency modulation occurs — more = more sidebands = more harmonics." },
    { kind: "quiz", q: "Non-integer carrier/modulator ratios produce…", options: ["Harmonic, musical timbres", "Inharmonic, metallic or bell-like timbres", "Pure sine waves", "White noise"], answer: 1, explain: "Non-integer ratios create sidebands that don't align to harmonic series — metallic, bell-like, percussive inharmonic sounds." },
    { kind: "summary", learned: ["FM: modulator changes carrier frequency → sidebands emerge", "More FM depth = more harmonics = brighter, more complex", "Integer ratios = harmonic. Non-integer = metallic/bell-like"] },
  ],

  "synth-effects": [
    { kind: "hook", emoji: "🌀", headline: "Effects bring the synth to life", subtext: "Chorus, reverb, delay, distortion — the final 20% that makes a patch." },
    { kind: "concept", title: "Essential synth effects", body: "Chorus doubles the signal with subtle pitch/time variation — creates width and warmth. Reverb adds space and dimension. Delay adds rhythmic echoes. Distortion/saturation adds harmonics and edge. Each transforms the raw synth sound.", keyFact: "Every great synth pad uses chorus + reverb. Every synth bass uses saturation." },
    { kind: "concept", title: "Effects signal flow", body: "Effects in a synth follow this order: Oscillator → Filter → Amp Envelope → Chorus → EQ → Reverb → Output. Each stage processes the previous. Order matters — distortion before reverb vs reverb before distortion sound completely different.", keyFact: "Distortion before reverb = clean distorted synth in a space. Reversed = muddy." },
    { kind: "interact", sim: "device-chain", prompt: "Add chorus and reverb to a synth — hear the transformation" },
    { kind: "quiz", q: "Chorus creates…", options: ["Pitch shift up an octave", "Width and warmth via slightly detuned doubles", "Hard distortion", "Reverb space"], answer: 1, explain: "Chorus duplicates the signal with slight pitch and timing variation — creates the thick, wide quality of classic pads and strings." },
    { kind: "quiz", q: "Distortion BEFORE reverb vs AFTER reverb…", options: ["Sounds identical either way", "Before = clean signal in space. After = reverb itself gets distorted", "Only before is allowed", "Only after is allowed"], answer: 1, explain: "Signal chain order changes the character completely — distorting a clean signal then adding space sounds different from distorting an already reverberant signal." },
    { kind: "quiz", q: "Saturation adds to a synth sound…", options: ["Only volume", "Harmonics, warmth, and edge", "Only reverb", "Pitch correction"], answer: 1, explain: "Saturation pushes signal into a non-linear curve — adds harmonic content, warmth, and edge that makes synths sound richer." },
    { kind: "summary", learned: ["Chorus = width/warmth. Reverb = space. Saturation = harmonics/edge", "Effect order matters: distortion before reverb = different sound", "Final effects chain is the last 20% that makes a patch feel finished"] },
  ],

  "synth-preset-anatomy": [
    { kind: "hook", emoji: "🔬", headline: "Dissect a preset to learn synthesis", subtext: "Every professional preset uses the same building blocks." },
    { kind: "concept", title: "Reading a preset", body: "Open any preset in Wavetable or Operator. Identify the oscillator waveform, filter cutoff and resonance, amp envelope shape, filter envelope, modulation matrix connections, and effects. Each choice is intentional.", keyFact: "Reverse-engineer 10 great presets and you understand synthesis deeply." },
    { kind: "concept", title: "Common preset categories", body: "Pads: slow attack, full sustain, slow release, chorus, reverb. Bass: fast attack, no release, filter envelope for movement. Lead: medium attack, no sustain (plucky), distortion/unison. Pluck: fast attack, fast decay, zero sustain, reverb.", keyFact: "Attack time alone sets a preset's feel: slow = pad, fast = stab or pluck." },
    { kind: "interact", sim: "subtractive-synth", prompt: "Match the given target sound by adjusting your patch" },
    { kind: "quiz", q: "Slow attack + full sustain + slow release = …", options: ["Punchy bass", "Plucky lead", "Soft evolving pad", "Percussion hit"], answer: 2, explain: "Slow attack fades in. Full sustain holds the note. Slow release fades out. These three together create the classic pad envelope." },
    { kind: "quiz", q: "Best way to learn synthesis is to…", options: ["Only use factory presets", "Reverse-engineer presets and modify each parameter", "Buy more plugins", "Only read manuals"], answer: 1, explain: "Loading a great preset and methodically testing each parameter teaches synthesis faster than any tutorial — direct cause and effect." },
    { kind: "quiz", q: "A bass preset typically has…", options: ["Slow attack and slow release", "Fast attack, fast decay, medium sustain, short release", "Only noise oscillators", "Extreme high resonance always"], answer: 1, explain: "Bass presets respond immediately (fast attack), have a defined envelope (medium sustain), and stop cleanly (short release)." },
    { kind: "summary", learned: ["Every preset is built from oscillator + filter + envelope + effects", "Pad: slow A/R. Bass: fast A, defined S. Lead: medium A, plucky", "Reverse-engineer presets = fastest route to synthesis mastery"] },
  ],

  "synth-build-your-own": [
    { kind: "hook", emoji: "🏗", headline: "Build a patch from scratch", subtext: "Start with Init — every great sound is zero to finished." },
    { kind: "concept", title: "Patch building workflow", body: "1. Start from Init preset. 2. Choose oscillator waveform for the right harmonic base. 3. Set filter cutoff and resonance for the target brightness. 4. Shape the amp envelope for the musical role. 5. Add filter envelope for movement. 6. Modulation for expression. 7. Effects for space.", keyFact: "Init → Osc → Filter → AmpEnv → FilterEnv → Mod → Effects. That's the path." },
    { kind: "concept", title: "Iteration and ear", body: "Sound design is iterative — set a parameter, listen, adjust. Your ear is the final judge, not the numbers. Compare your patch to reference tracks in the same genre. The gap between yours and theirs shows you what to develop.", keyFact: "Reference tracks are your target. What specifically sounds different? Fix that." },
    { kind: "interact", sim: "subtractive-synth", prompt: "Build a plucky lead from Init — match the brief" },
    { kind: "quiz", q: "Starting point for every patch is…", options: ["A complex preset to modify", "Init preset (empty initialised patch)", "A sample", "A drum kit"], answer: 1, explain: "Starting from Init gives you full control — no inherited decisions from previous patches. Pure, clean starting point." },
    { kind: "quiz", q: "Sound design is best learned by…", options: ["Watching tutorials only", "Building patches, comparing to references, iterating", "Only using presets", "Reading manuals cover to cover"], answer: 1, explain: "Sound design is a listening skill — build, compare, adjust. Iteration beats theory for developing ears and technique." },
    { kind: "quiz", q: "When your patch sounds wrong, first check…", options: ["The BPM setting", "Oscillator, filter, and envelope — the core signal path", "The output device", "Whether Link is enabled"], answer: 1, explain: "Core signal path issues (oscillator → filter → envelope) explain 90% of 'my patch sounds wrong' problems — start there." },
    { kind: "summary", learned: ["Build order: Init → Osc → Filter → Env → Mod → Effects", "Iteration + reference tracks = fastest path to improvement", "Every great patch started from an Init and was built by ear"] },
  ],

};
