import type { Mission } from "./types";
import { FOUNDATIONS_MISSIONS } from "./missions-foundations";
import { DJ_WORLD_MISSIONS } from "./missions-dj";
import { SYNTHS_MISSIONS } from "./missions-synths";

const w1: Mission[] = [
  {
    slug: "what-is-live",
    world: "first-contact",
    number: 1,
    title: "What Is Live?",
    tagline: "A DAW with two brains.",
    xp: 50,
    badge: { slug: "first-boot", name: "First Boot" },
    explainer: [
      {
        kind: "lead",
        text: "Ableton Live is a Digital Audio Workstation built around two complementary views: Session for non-linear jamming, Arrangement for linear composition.",
      },
      {
        kind: "para",
        text: "Where most DAWs only give you a timeline, Live also gives you a grid of clips you can launch in any order. That single idea is why producers, performers, and sound designers all live inside it.",
      },
      {
        kind: "list",
        items: [
          "Session View — clip grid, perfect for ideas, loops, live sets.",
          "Arrangement View — timeline, perfect for full songs.",
          "Devices — instruments and effects, all built in.",
          "Browser — your library of sounds, presets and projects.",
        ],
      },
      {
        kind: "callout",
        tone: "key",
        text: "Almost everything in Live is non-destructive. You can warp, reverse, slice, and the original sample stays intact.",
      },
    ],
    sim: { type: "interface-tour" },
    quiz: [
      {
        q: "Live's two main views are…",
        options: ["Mix & Edit", "Session & Arrangement", "Track & Master", "Studio & Live"],
        answer: 1,
        explain:
          "Session and Arrangement are Live's two core views — Session for jamming, Arrangement for timeline editing.",
        hint: "Think about how DJs vs film composers work differently.",
      },
      {
        q: "Session View is best for…",
        options: ["Linear songs", "Mastering", "Non-linear loop launching", "Video scoring"],
        answer: 2,
        explain:
          "Session View lets you trigger clips in any order, perfect for live performance and improvising song structure.",
        hint: "Which view is more like a loop launcher than a timeline?",
      },
      {
        q: "Audio editing in Live is…",
        options: ["Destructive", "Non-destructive", "Read-only", "MIDI-only"],
        answer: 1,
        explain:
          "Non-destructive means your original audio file is never altered — edits are just instructions Live reads at playback.",
        hint: "Would you want Live to permanently change your audio files?",
      },
    ],
  },
  {
    slug: "interface-tour",
    world: "first-contact",
    number: 2,
    title: "Interface Tour",
    tagline: "Every panel, named.",
    xp: 60,
    badge: { slug: "cartographer", name: "Cartographer" },
    explainer: [
      { kind: "lead", text: "Click the hotspots to learn each region of Live's window." },
      {
        kind: "list",
        items: [
          "Control Bar — tempo, transport, metronome, quantization.",
          "Browser — left sidebar with sounds, samples, packs.",
          "Main View — Session grid or Arrangement timeline.",
          "Detail View — clip & device editor, opens at the bottom.",
          "Info View — hover anything, read what it does.",
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        text: "Tab toggles between Session and Arrangement. Memorize this immediately.",
      },
    ],
    sim: { type: "interface-tour" },
    quiz: [
      {
        q: "What key toggles Session/Arrangement?",
        options: ["Spacebar", "Tab", "Enter", "Shift"],
        answer: 1,
        explain:
          "Tab is Live's fastest workflow shortcut — you'll hit it hundreds of times per session toggling views.",
        hint: "It's the same key you use to switch browser tabs.",
      },
      {
        q: "Tempo lives in the…",
        options: ["Browser", "Detail View", "Control Bar", "Mixer"],
        answer: 2,
        explain:
          "The Control Bar at the top controls BPM, time signature, and transport — your session's master clock.",
        hint: "Where do you look when you need to know how fast your track is?",
      },
      {
        q: "Where do you edit a clip's notes?",
        options: ["Control Bar", "Browser", "Detail View", "Info View"],
        answer: 2,
        explain:
          "The Detail View (bottom) shows either the Clip or Device view depending on what's selected — notes live in Clip view.",
        hint: "It's the bottom panel that expands when you double-click a MIDI clip.",
      },
    ],
  },
  {
    slug: "browser",
    world: "first-contact",
    number: 3,
    title: "The Browser",
    tagline: "Your library, organised.",
    xp: 50,
    explainer: [
      {
        kind: "lead",
        text: "The Browser is where you find sounds, samples, presets and projects. Master it and you'll make tracks twice as fast.",
      },
      {
        kind: "list",
        items: [
          "Sounds — instrument presets you can drag onto tracks.",
          "Drums — drum kits and one-shots.",
          "Samples — your own audio files.",
          "Packs — Ableton's official sound libraries.",
          "Categories — Live's tagging system (since Live 12).",
        ],
      },
      {
        kind: "callout",
        tone: "key",
        text: "Live 12 added Sound Similarity Search — pick a sample and Live finds others that sound like it.",
      },
    ],
    sim: { type: "browser-tour" },
    quiz: [
      {
        q: "Live 12's Similarity Search finds samples by…",
        options: ["File name", "Sound", "Date", "Size"],
        answer: 1,
        explain:
          "Similarity Search (Live 12) analyzes audio content — timbre, rhythm, tone — not filenames, making it genuinely useful.",
        hint: "Think about what's actually IN the sound, not what it's called.",
      },
      {
        q: "Drag-and-drop from the Browser to…",
        options: ["A track", "Only Session", "Only Arrangement", "The Control Bar"],
        answer: 0,
        explain:
          "You can drag from the Browser to any track in Session or Arrangement — it's the primary way to audition and place sounds.",
        hint: "Both views accept drops — pick the one that's NOT just one.",
      },
      {
        q: "Categories were added in…",
        options: ["Live 9", "Live 10", "Live 11", "Live 12"],
        answer: 3,
        explain:
          "Categories (like Drums, Bass, Pads) were introduced in Live 12 to organize the browser more musically.",
        hint: "It's the most recent major version listed.",
      },
    ],
  },
  {
    slug: "preferences",
    world: "first-contact",
    number: 4,
    title: "Preferences",
    tagline: "Set it up once, properly.",
    xp: 40,
    explainer: [
      {
        kind: "lead",
        text: "Open Preferences (Cmd/Ctrl + ,) and configure your audio interface, buffer size, MIDI ports, and file locations before you do anything else.",
      },
      {
        kind: "list",
        items: [
          "Audio — driver, sample rate, buffer size (lower = less latency, more CPU).",
          "Link/Tempo/MIDI — controllers and Ableton Link.",
          "File/Folder — auto-save, plugin folders, max undo.",
          "Library — where Packs install.",
          "Theme — light, dark, high-contrast.",
        ],
      },
      {
        kind: "callout",
        tone: "warn",
        text: "Buffer too low → audio glitches. Too high → noticeable input latency. 256 samples is a safe default for most.",
      },
    ],
    sim: { type: "none", preset: { mode: "buffer" } },
    quiz: [
      {
        q: "Lower buffer size means…",
        options: ["More latency", "Less latency, more CPU", "Less CPU", "Better quality"],
        answer: 1,
        explain:
          "Lower buffer = faster response between input and output, but the CPU must work harder to fill smaller chunks in time.",
        hint: "Buffer size trades latency against CPU load — which is more CPU?",
      },
      {
        q: "Open Preferences with…",
        options: ["Cmd/Ctrl + ,", "Cmd/Ctrl + P", "F5", "Tab"],
        answer: 0,
        explain:
          "Cmd/Ctrl + , (comma) opens Preferences in almost every macOS/Windows app — Live follows the same convention.",
        hint: "It's the universal OS shortcut for preferences/settings.",
      },
      {
        q: "Where do plugins get scanned?",
        options: ["Audio tab", "File/Folder + Plug-Ins tab", "Theme tab", "Library tab"],
        answer: 1,
        explain:
          "Live scans for VST/AU plugins from paths you specify in Preferences > File Folder > Plug-Ins — always check here first.",
        hint: "Where would you tell Live where to look for plugin files?",
      },
    ],
  },
  {
    slug: "files-projects",
    world: "first-contact",
    number: 5,
    title: "Files & Projects",
    tagline: "How Live saves your work.",
    xp: 40,
    explainer: [
      {
        kind: "lead",
        text: "A Live Set is a .als file. A Project is the folder around it that holds samples, recordings and presets.",
      },
      {
        kind: "list",
        items: [
          "Always 'Collect All and Save' before sharing a project.",
          "Live Pack (.alp) bundles a project for distribution.",
          "Auto-save runs in the background — turn it on.",
          "Export Audio/Video renders your finished track.",
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        text: "Name tracks and clips as you work. Future-you will thank present-you.",
      },
    ],
    sim: { type: "browser-tour" },
    quiz: [
      {
        q: "A Live Set extension is…",
        options: [".alp", ".als", ".adv", ".asd"],
        answer: 1,
        explain:
          ".als is Ableton Live Set — your actual project file. Know this extension to spot projects in Finder/Explorer.",
        hint: "ALS = Ableton Live Set. What would the abbreviation be?",
      },
      {
        q: "To bundle a project for a friend, use…",
        options: ["Save As", "Collect All and Save", "Export Audio", "Freeze Track"],
        answer: 1,
        explain:
          "Collect All and Save copies all samples into the project folder so it's self-contained and sharable without missing files.",
        hint: "Which option 'collects' everything in one place?",
      },
      {
        q: ".alp files are…",
        options: ["Live Sets", "Live Packs", "Audio", "Presets"],
        answer: 1,
        explain:
          "Live Packs (.alp) bundle sounds, presets, or entire instrument packs — installed through Live's browser.",
        hint: "ALP = Ableton Live Pack — a bundled collection, not a single project.",
      },
    ],
  },
];

const w2: Mission[] = [
  {
    slug: "session-view",
    world: "two-views",
    number: 1,
    title: "Session View",
    tagline: "The clip grid.",
    xp: 70,
    badge: { slug: "scene-stealer", name: "Scene Stealer" },
    explainer: [
      {
        kind: "lead",
        text: "Session View is a grid: tracks (vertical) and scenes (horizontal). Each cell is a clip slot. Launch clips and scenes to build ideas live.",
      },
      {
        kind: "list",
        items: [
          "Click a clip to launch it.",
          "Click a Scene Launch button to fire a whole row.",
          "Stop button kills clips on a track.",
          "Quantize controls when clips actually start.",
        ],
      },
      {
        kind: "callout",
        tone: "key",
        text: "Set Global Quantize to 1 Bar — clips will sync musically no matter when you click.",
      },
    ],
    sim: { type: "session-grid" },
    quiz: [
      {
        q: "A scene is…",
        options: ["A column of clips", "A row of clips", "A single clip", "A track"],
        answer: 1,
        explain:
          "A scene is a horizontal row of clips across all tracks — launching a scene starts that row simultaneously.",
        hint: "Think about whether it's organized by column or row.",
      },
      {
        q: "Global Quantize 1 Bar means clips start…",
        options: ["Immediately", "On next bar", "On next beat", "Never"],
        answer: 1,
        explain:
          "1 Bar quantize means every clip waits for the next bar line to start, keeping everything in perfect musical sync.",
        hint: "Quantize means 'snap to grid' — which grid boundary is 1 Bar?",
      },
      {
        q: "Each track plays…",
        options: ["All clips at once", "One clip at a time", "Two clips", "Whatever you select"],
        answer: 1,
        explain:
          "Each track has one clip slot active at a time — this is what makes Session View a non-linear launcher, not a mixer.",
        hint: "If two clips played simultaneously on one track, what would happen?",
      },
    ],
  },
  {
    slug: "arrangement-view",
    world: "two-views",
    number: 2,
    title: "Arrangement View",
    tagline: "The timeline.",
    xp: 70,
    explainer: [
      {
        kind: "lead",
        text: "Arrangement is a horizontal timeline. Tracks stack down. Clips are blocks you can move, resize, split and loop.",
      },
      {
        kind: "list",
        items: [
          "Press Tab to switch from Session.",
          "Record Arm + Record captures Session performances into Arrangement.",
          "The Loop Brace repeats a section.",
          "Locators bookmark sections (Intro, Verse, Drop).",
        ],
      },
    ],
    sim: { type: "arrangement" },
    quiz: [
      {
        q: "Locators are…",
        options: ["Loop markers", "Section bookmarks", "Automation points", "Clips"],
        answer: 1,
        explain:
          "Locators are named bookmarks in Arrangement View — right-click the scrubber to add them, great for song sections.",
        hint: "They 'locate' you to a specific point — like a bookmark in a song.",
      },
      {
        q: "Recording Session into Arrangement happens when…",
        options: ["You press Save", "You hit global Record", "You export", "Always automatic"],
        answer: 1,
        explain:
          "Pressing Record while Live plays in Arrangement mode captures Session clips into the Arrangement timeline.",
        hint: "What control actually starts recording on the timeline?",
      },
      {
        q: "Arrangement clips can be…",
        options: ["Moved & resized", "Only moved", "Only resized", "Neither"],
        answer: 0,
        explain:
          "Arrangement clips are fully flexible — drag to move, drag edges to resize, right-click to loop or reverse.",
        hint: "Unlike a DAW that's read-only, Live clips are fully editable.",
      },
    ],
  },
  {
    slug: "clips",
    world: "two-views",
    number: 3,
    title: "Clips 101 — MIDI vs Audio",
    tagline: "Two clip types. Wildly different powers.",
    xp: 70,
    explainer: [
      {
        kind: "lead",
        text: "A clip is a piece of musical content that lives on a track. There are exactly two kinds, and the difference shapes everything you do in Live.",
      },
      {
        kind: "para",
        text: "A MIDI clip stores instructions: 'play C4 at velocity 100 for half a beat'. The track's instrument creates the actual sound at playback. You can change the instrument, transpose every note, slow it down, or rewrite the melody — all without losing fidelity, because nothing has been rendered yet.",
      },
      {
        kind: "para",
        text: "An audio clip stores a recorded waveform — a long list of amplitude samples (44,100 numbers per second at CD quality). The pitch and timing are baked into the file. You can still transpose, stretch and warp it, but those are processes that re-interpret the existing samples — push them too far and you'll hear artefacts.",
      },
      {
        kind: "callout",
        tone: "key",
        text: "Rule of thumb: write with MIDI, capture performance with audio. MIDI for ideas you'll keep changing; audio when the sound itself is the point (vocals, recorded instruments, sampled loops).",
      },
      {
        kind: "list",
        items: [
          "MIDI clip → notes + velocity + length, edited in the Piano Roll.",
          "Audio clip → waveform + warp markers, edited in the Sample editor.",
          "Both can loop, both can hold automation envelopes.",
          "Drag audio to a MIDI track → Live wraps it in a Simpler so you can play it like an instrument.",
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        text: "In the simulator below: change the MIDI instrument and the same melody becomes a saw bass, a sine pad, or a square lead instantly. Try the same on the audio clip — you can only stretch and detune the recording you have.",
      },
      {
        kind: "link",
        to: "mission",
        slug: "midi-piano-roll",
        label: "Next up: edit MIDI in the Piano Roll",
      },
      { kind: "link", to: "mission", slug: "warping", label: "Audio clips deep-dive: Warping" },
    ],
    sim: { type: "midi-vs-audio" },
    quiz: [
      {
        q: "MIDI clips contain…",
        options: [
          "Audio samples",
          "Note instructions (pitch, velocity, length)",
          "Both equally",
          "Plugin chains",
        ],
        answer: 1,
        explain: "MIDI is a list of instructions; the instrument on the track turns it into sound.",
      },
      {
        q: "Why is MIDI editable forever?",
        options: [
          "It's compressed",
          "Nothing is rendered until playback",
          "It's smaller",
          "Live caches it",
        ],
        answer: 1,
        explain:
          "MIDI is never 'baked' — it renders through the instrument in real-time, so you can swap instruments or edit notes forever.",
        hint: "What would happen if MIDI was rendered to audio on save?",
      },
      {
        q: "Audio clip transpose is…",
        options: [
          "Free, lossless",
          "A re-pitch process — extreme values cause artefacts",
          "Impossible",
          "MIDI-only",
        ],
        answer: 1,
        explain:
          "Transposing audio re-pitches via stretching algorithms — go too far (>6–8 semitones) and time-stretch artifacts appear.",
        hint: "It's adjusting pitch — what processing does that require on audio?",
      },
    ],
  },
  {
    slug: "tracks",
    world: "two-views",
    number: 4,
    title: "Tracks",
    tagline: "Audio. MIDI. Return. Group. Master.",
    xp: 50,
    explainer: [
      {
        kind: "list",
        items: [
          "Audio Track — records & plays audio.",
          "MIDI Track — holds MIDI clips, hosts an instrument.",
          "Return Track — destination for sends (reverb, delay).",
          "Group Track — folder for routing many tracks together.",
          "Master Track — the final output.",
        ],
      },
    ],
    sim: { type: "mixer" },
    quiz: [
      {
        q: "Reverb sends go to a…",
        options: ["Group", "Return", "Master", "MIDI"],
        answer: 1,
        explain:
          "Return tracks receive signal from sends — they're designed for shared effects like reverb used by multiple tracks.",
        hint: "Signal flows TO return tracks — what do you call the destination?",
      },
      {
        q: "An instrument lives on a…",
        options: ["Audio", "MIDI", "Return", "Master"],
        answer: 1,
        explain:
          "MIDI tracks host instruments (Wavetable, Operator, Simpler etc.) — they output MIDI data that instruments convert to audio.",
        hint: "An instrument needs MIDI notes to trigger — what track carries MIDI?",
      },
      {
        q: "Group tracks are like…",
        options: ["Folders", "Plugins", "Sends", "Clips"],
        answer: 0,
        explain:
          "Group tracks wrap multiple tracks into a bus, like a folder — great for drums, backing vox, or any stem group.",
        hint: "What organizational metaphor do most apps use for nested items?",
      },
    ],
  },
  {
    slug: "scenes-follow",
    world: "two-views",
    number: 5,
    title: "Scenes & Follow Actions",
    tagline: "Make clips play themselves.",
    xp: 70,
    badge: { slug: "auto-pilot", name: "Auto Pilot" },
    explainer: [
      {
        kind: "lead",
        text: "A scene fires a whole row. Follow Actions tell each clip what to do when it ends — jump to next, loop, play random.",
      },
      {
        kind: "list",
        items: [
          "Set scene tempo & time signature for live sets.",
          "Follow Actions: Stop, Play Again, Previous, Next, First, Last, Any, Other.",
          "Live 11+ added linked Follow Action chances per row.",
        ],
      },
    ],
    sim: { type: "session-grid", preset: { followActions: true } },
    quiz: [
      {
        q: "Follow Actions trigger…",
        options: ["When a clip ends", "When you click", "On bar 1", "On record"],
        answer: 0,
        explain:
          "Follow Actions trigger automatically when a clip reaches its end or a set duration — perfect for generative, evolving sequences.",
        hint: "What condition makes Follow Actions fire?",
      },
      {
        q: "Scenes can override…",
        options: ["Tempo", "Sample rate", "Buffer", "Theme"],
        answer: 0,
        explain:
          "Launching a scene can override the project's current BPM — useful for songs with tempo changes or DJ sets.",
        hint: "Scenes are rows — what master parameter might change per section?",
      },
      {
        q: "Which is NOT a Follow Action?",
        options: ["Next", "Other", "Reverse", "Stop"],
        answer: 2,
        explain:
          "Reverse is a clip/warp operation, not a Follow Action. Valid actions include Again, Next, Previous, Any, Other, Stop.",
        hint: "Think about what Follow Actions actually do — they trigger clips or scenes, not audio transforms.",
      },
    ],
  },
];

const w3: Mission[] = [
  {
    slug: "midi-piano-roll",
    world: "midi-audio",
    number: 1,
    title: "MIDI Piano Roll",
    tagline: "Click. Drag. Compose.",
    xp: 80,
    badge: { slug: "note-ninja", name: "Note Ninja" },
    explainer: [
      {
        kind: "lead",
        text: "Double-click a MIDI clip to open the piano roll. Pencil mode draws notes; default mode selects them.",
      },
      {
        kind: "list",
        items: [
          "B toggles Pencil Mode.",
          "Velocity = how hard a note is hit.",
          "Quantize aligns notes to the grid.",
          "Live 12 added Generative MIDI tools: Stacks, Rhythm, Shape, Seed.",
        ],
      },
      {
        kind: "callout",
        tone: "key",
        text: "Hold Shift to constrain note movement. Hold Cmd/Ctrl while drawing for finer pitch increments.",
      },
    ],
    sim: { type: "piano-roll" },
    quiz: [
      {
        q: "B toggles…",
        options: ["Browser", "Pencil mode", "Bar count", "Bypass"],
        answer: 1,
        explain:
          "B key toggles pencil/draw mode in the Piano Roll — essential for switching between drawing and selecting notes.",
        hint: "It's a single key that looks like a writing instrument.",
      },
      {
        q: "Velocity controls…",
        options: ["Pitch", "Length", "How hard", "Quantize"],
        answer: 2,
        explain:
          "Velocity determines how hard a note is hit — in MIDI it maps 0–127, and instruments often use it to change timbre.",
        hint: "Think about dynamics on a real instrument — what determines softness vs loudness?",
      },
      {
        q: "Live 12 generative MIDI is in…",
        options: ["Mixer", "Browser", "Note transformations", "Master"],
        answer: 2,
        explain:
          "Live 12's Note Transformations (Strum, Pitch Shift, etc.) are generative MIDI tools built directly into the Piano Roll.",
        hint: "Live 12 added a whole new set of MIDI tools — where do you find them?",
      },
    ],
  },
  {
    slug: "audio-clips",
    world: "midi-audio",
    number: 2,
    title: "Audio Clips",
    tagline: "Samples that bend to your will.",
    xp: 60,
    explainer: [
      {
        kind: "lead",
        text: "Audio clips reference a sample file. They can be transposed, reversed, looped, sliced, and warped — all without touching the original.",
      },
      {
        kind: "list",
        items: [
          "Transpose pitch in semitones (-48 to +48).",
          "Detune in cents.",
          "Reverse, Crop, Consolidate.",
          "Set warp markers to align beats.",
        ],
      },
    ],
    sim: { type: "warp-lab" },
    quiz: [
      {
        q: "Editing an audio clip is…",
        options: ["Destructive", "Non-destructive", "Disabled", "MIDI-only"],
        answer: 1,
        explain:
          "Editing audio clips in Live never touches the source file — all changes are stored as clip instructions, always reversible.",
        hint: "Would it be safe if cutting a clip also cut the file on disk?",
      },
      {
        q: "Transpose unit is…",
        options: ["Hz", "Cents", "Semitones", "Bars"],
        answer: 2,
        explain:
          "Semitones are the standard musical pitch unit — 12 semitones = 1 octave. A +7 transpose moves up a perfect fifth.",
        hint: "What's the standard musical unit for pitch intervals?",
      },
      {
        q: "Detune unit is…",
        options: ["Hz", "Cents", "Semitones", "Bars"],
        answer: 1,
        explain:
          "Cents are hundredths of a semitone — 100 cents = 1 semitone. Used for fine tuning and detuning effects.",
        hint: "One hundredth of something — what's the musical unit it subdivides?",
      },
    ],
  },
  {
    slug: "warping",
    world: "midi-audio",
    number: 3,
    title: "Warping",
    tagline: "Lock any sample to your tempo.",
    xp: 90,
    badge: { slug: "warp-wizard", name: "Warp Wizard" },
    explainer: [
      {
        kind: "lead",
        text: "Warping stretches audio in time without changing its pitch. Place warp markers on transients, set a Warp Mode, and the clip follows your project tempo.",
      },
      {
        kind: "list",
        items: [
          "Beats — drums and percussive material.",
          "Tones — melodic mono material.",
          "Texture — pads, ambience.",
          "Re-Pitch — old-school speed up/down (pitch follows).",
          "Complex / Complex Pro — full mixes (CPU heavy).",
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        text: "Drag a transient to set a warp marker. Right-click → Warp From Here (Straight) for a quick lock to grid.",
      },
    ],
    sim: { type: "warp-lab" },
    quiz: [
      {
        q: "Best mode for full mixes?",
        options: ["Beats", "Tones", "Re-Pitch", "Complex Pro"],
        answer: 3,
        explain:
          "Complex Pro uses a phase vocoder to independently time-stretch and pitch-shift — best for full mixes and vocals.",
        hint: "Which mode is described as the highest-quality but most CPU-intensive?",
      },
      {
        q: "Warping changes…",
        options: ["Pitch only", "Time without pitch", "Both equally", "Volume"],
        answer: 1,
        explain:
          "Warping moves audio in time independently from pitch — a DJ can slow a track to match BPM without chipmunking vocals.",
        hint: "Warp = time. What does it NOT change?",
      },
      {
        q: "Re-Pitch behaves like…",
        options: ["A vocoder", "A tape machine", "A reverb", "A limiter"],
        answer: 1,
        explain:
          "Re-Pitch changes playback speed AND pitch together, just like playing a record faster or slower — pure analog behavior.",
        hint: "What happens when you speed up a tape or vinyl record?",
      },
    ],
  },
  {
    slug: "recording-audio",
    world: "midi-audio",
    number: 4,
    title: "Recording Audio",
    tagline: "Get sound in.",
    xp: 60,
    explainer: [
      {
        kind: "list",
        items: [
          "Set the track input (Ext. In 1, etc.).",
          "Arm the track (red circle).",
          "Hit Record. Live records into the focused view.",
          "Monitor: In, Auto, Off.",
        ],
      },
      {
        kind: "callout",
        tone: "warn",
        text: "Always check input level — peak around -12 to -6 dB, never clip into the red.",
      },
    ],
    sim: { type: "mixer", preset: { record: true } },
    quiz: [
      {
        q: "Arm a track to…",
        options: ["Solo it", "Record it", "Mute it", "Group it"],
        answer: 1,
        explain:
          "Track arming (the red circle) tells Live which track to record onto — only armed tracks capture incoming audio.",
        hint: "You have to 'arm' something before it's ready — like a camera shutter.",
      },
      {
        q: "Monitor 'Auto' means…",
        options: [
          "Always on",
          "Always off",
          "On while armed & not playing back",
          "Off while armed",
        ],
        answer: 2,
        explain:
          "Monitor Auto passes input through when armed but not playing — so you hear yourself recording without hearing playback doubled.",
        hint: "Auto = smart — it monitors when it needs to, and stops when it doesn't.",
      },
      {
        q: "Healthy input level is around…",
        options: ["0 dB", "-12 to -6 dB", "+6 dB", "-40 dB"],
        answer: 1,
        explain:
          "-12 to -6 dBFS gives headroom for peaks without clipping — always leave space, especially before adding effects.",
        hint: "0 dBFS is the ceiling. Where should your average level peak?",
      },
    ],
  },
  {
    slug: "comping",
    world: "midi-audio",
    number: 5,
    title: "Comping",
    tagline: "Stitch the perfect take.",
    xp: 70,
    explainer: [
      {
        kind: "lead",
        text: "Take Lanes (Live 11+) let you record multiple passes onto a track and assemble the best moments into one comp.",
      },
      {
        kind: "list",
        items: [
          "Right-click a track header → Show Take Lanes.",
          "Each loop pass becomes a new lane.",
          "Click any segment to promote it to the master comp.",
          "Works for both audio and MIDI.",
        ],
      },
    ],
    sim: { type: "arrangement", preset: { takes: true } },
    quiz: [
      {
        q: "Take Lanes were added in…",
        options: ["Live 9", "Live 10", "Live 11", "Live 12"],
        answer: 2,
        explain:
          "Take Lanes (Live 11+) let you record multiple passes of audio or MIDI and comp between them non-destructively.",
        hint: "Which major version added this feature for recording multiple takes?",
      },
      {
        q: "Comping works on…",
        options: ["Audio only", "MIDI only", "Both", "Returns"],
        answer: 2,
        explain:
          "Take Lanes work for both audio clips and MIDI clips — you can comp between any mix of takes in both formats.",
        hint: "Is there a reason it would only work for one type?",
      },
      {
        q: "Each loop pass becomes…",
        options: ["A scene", "A take lane", "A device", "A locator"],
        answer: 1,
        explain:
          "Each loop pass records a new take lane below — you can keep recording indefinitely and choose the best sections.",
        hint: "What happens to the previous recording when you loop back around?",
      },
    ],
  },
  {
    slug: "slicing",
    world: "midi-audio",
    number: 6,
    title: "Slicing to MIDI",
    tagline: "Turn any loop into a playable kit.",
    xp: 70,
    explainer: [
      {
        kind: "lead",
        text: "Right-click any audio clip → Slice to New MIDI Track. Live chops it on transients (or grid) and loads each slice into a Drum Rack pad.",
      },
      {
        kind: "list",
        items: [
          "Slice by warp markers, beats, or transients.",
          "Each slice maps to a MIDI note.",
          "Re-trigger, re-order, glitch — instant remix.",
        ],
      },
    ],
    sim: { type: "drum-pad", preset: { sliced: true } },
    quiz: [
      {
        q: "Slicing produces a…",
        options: ["Sampler", "Drum Rack", "Wavetable", "Operator"],
        answer: 1,
        explain:
          "Slicing to a Drum Rack maps each slice to a pad/note — you can then trigger, rearrange, and process each slice independently.",
        hint: "Where do the individual slices go after being created?",
      },
      {
        q: "You can slice by…",
        options: [
          "Transients only",
          "Beats only",
          "Transients, beats, or warp markers",
          "Bars only",
        ],
        answer: 2,
        explain:
          "You can slice by audio transients, fixed beat divisions, or existing warp markers — each serves a different workflow.",
        hint: "There are three methods — think audio events, rhythmic grids, and existing markers.",
      },
      {
        q: "Each slice is triggered by…",
        options: ["A scene", "A MIDI note", "A macro", "A send"],
        answer: 1,
        explain:
          "Each slice maps to a MIDI note starting at C1 — Play a MIDI note to trigger that slice, enabling remixing and chopping.",
        hint: "MIDI notes trigger sounds in a Drum Rack — same principle here.",
      },
    ],
  },
];

const w4: Mission[] = [
  {
    slug: "instruments-overview",
    world: "devices",
    number: 1,
    title: "Instruments Overview",
    tagline: "Your built-in synths.",
    xp: 60,
    explainer: [
      {
        kind: "list",
        items: [
          "Operator — FM synth, deep & metallic.",
          "Wavetable — modern wavetable, the workhorse.",
          "Drift — analog-style mono/poly synth (Live 11+).",
          "Sampler / Simpler — play your own audio as instruments.",
          "Drum Rack — kit container.",
          "Meld (Live 12) — MPE-first dual-engine synth.",
        ],
      },
    ],
    sim: { type: "synth-playground", preset: { synth: "wavetable" } },
    quiz: [
      {
        q: "Meld is what kind of synth?",
        options: ["FM", "Subtractive", "MPE dual-engine", "Granular"],
        answer: 2,
        explain:
          "Meld (Live 12) is a dual-engine synth built for MPE — its two engines can be morphed and shaped with expressive controllers.",
        hint: "The name contains a clue about blending two things together.",
      },
      {
        q: "Operator uses…",
        options: ["Subtractive", "FM", "Wavetable", "Granular"],
        answer: 1,
        explain:
          "Operator uses Frequency Modulation (FM) synthesis — oscillators modulate each other's frequency to create complex timbres.",
        hint: "What does FM stand for in the most famous FM synths?",
      },
      {
        q: "Drift was added in…",
        options: ["Live 9", "Live 10", "Live 11", "Live 12"],
        answer: 2,
        explain:
          "Drift was introduced in Live 11 as a warm, analog-inspired subtractive synth with built-in instability and drift parameters.",
        hint: "The number that comes after 10 but before 12.",
      },
    ],
  },
  {
    slug: "drum-rack",
    world: "devices",
    number: 2,
    title: "Drum Rack",
    tagline: "16 pads, infinite kits.",
    xp: 70,
    badge: { slug: "kit-builder", name: "Kit Builder" },
    explainer: [
      {
        kind: "lead",
        text: "Drum Rack is a container — each pad hosts a Simpler (or any device chain) on its own MIDI note.",
      },
      {
        kind: "list",
        items: [
          "Drag samples onto pads.",
          "Each pad has its own chain, mixer, sends.",
          "Choke groups silence other pads (hi-hats).",
          "Right-click pad → Browse for replacements.",
        ],
      },
    ],
    sim: { type: "drum-pad" },
    quiz: [
      {
        q: "Choke groups are useful for…",
        options: ["Reverb", "Hi-hats", "Bass", "Master"],
        answer: 1,
        explain:
          "Choke groups make hi-hats cut each other off — when an open hat is playing and a closed hat hits, the open hat stops.",
        hint: "What musical relationship exists between open and closed hi-hats?",
      },
      {
        q: "Each pad hosts…",
        options: ["A track", "A chain (often a Simpler)", "A scene", "A clip"],
        answer: 1,
        explain:
          "Each Drum Rack pad holds a chain — typically a Simpler with a sample, plus effects — all self-contained per hit.",
        hint: "A chain can hold any instruments and effects — what's the container called?",
      },
      {
        q: "Drum Rack pads map to…",
        options: ["Audio inputs", "MIDI notes", "Sends", "Macros"],
        answer: 1,
        explain:
          "Each Drum Rack pad is mapped to a specific MIDI note — C1=pad 1, C#1=pad 2, and so on up the keyboard.",
        hint: "Pads need something to trigger them — what protocol does that?",
      },
    ],
  },
  {
    slug: "wavetable",
    world: "devices",
    number: 3,
    title: "Wavetable",
    tagline: "Modern synthesis, made friendly.",
    xp: 70,
    explainer: [
      {
        kind: "list",
        items: [
          "Two oscillators scan through wavetables.",
          "Sub osc, noise, two filters, two envelopes, two LFOs.",
          "Modulation matrix at the bottom — drag any source to any destination.",
          "Unison modes for huge stacks.",
        ],
      },
    ],
    sim: { type: "knob-trainer", preset: { synth: "wavetable" } },
    quiz: [
      {
        q: "Wavetable's mod matrix is at the…",
        options: ["Top", "Bottom", "Side", "Hidden"],
        answer: 1,
        explain:
          "Wavetable's modulation matrix is at the bottom of the device — drag from any source to any destination to patch modulation.",
        hint: "Look at the bottom section of Wavetable's UI.",
      },
      {
        q: "Wavetable has how many oscillators?",
        options: ["1", "2", "4", "6"],
        answer: 1,
        explain:
          "Wavetable has two oscillators, each with its own wavetable, position, and sub-oscillator, enabling rich layered timbres.",
        hint: "How many sound sources does a typical synth have?",
      },
      {
        q: "Unison creates…",
        options: ["Single voice", "Layered detuned voices", "Reverb", "Distortion"],
        answer: 1,
        explain:
          "Unison stacks multiple copies of a voice at slightly different pitches — creates the thick, chorus-like quality of many pads.",
        hint: "What does stacking detuned copies of a sound create?",
      },
    ],
  },
  {
    slug: "operator",
    world: "devices",
    number: 4,
    title: "Operator",
    tagline: "FM synthesis demystified.",
    xp: 80,
    explainer: [
      {
        kind: "lead",
        text: "Operator is a 4-operator FM synth. One operator modulates another's frequency to create rich harmonics.",
      },
      {
        kind: "list",
        items: [
          "Pick an algorithm to set how operators connect.",
          "Carriers make sound; modulators shape it.",
          "Higher modulator level = more harmonics.",
          "Coarse/Fine ratio defines the timbre.",
        ],
      },
    ],
    sim: { type: "knob-trainer", preset: { synth: "operator" } },
    quiz: [
      {
        q: "Operator has how many operators?",
        options: ["2", "4", "6", "8"],
        answer: 1,
        explain:
          "Operator has 4 operators arranged in various algorithms — each can be a carrier (outputting sound) or modulator (coloring it).",
        hint: "'Four-operator FM' is how classic FM synths like the DX7 are described.",
      },
      {
        q: "Carriers…",
        options: ["Modulate", "Output sound", "Both", "Neither"],
        answer: 1,
        explain:
          "Carriers are the operators whose output reaches your ears — modulators feed into carriers to add harmonics and character.",
        hint: "In FM, which operator type actually creates audible output?",
      },
      {
        q: "More modulator level →",
        options: ["Quieter", "More harmonics", "Less harmonics", "Lower pitch"],
        answer: 1,
        explain:
          "Modulator level controls how much one operator modulates another's frequency — higher levels = more sidebands = more harmonics.",
        hint: "More modulation = more complexity. What does that sound like?",
      },
    ],
  },
  {
    slug: "sampler-simpler",
    world: "devices",
    number: 5,
    title: "Sampler & Simpler",
    tagline: "Play any sound as an instrument.",
    xp: 60,
    explainer: [
      {
        kind: "list",
        items: [
          "Simpler — one sample, three modes: Classic, One-Shot, Slice.",
          "Sampler — full multi-sample instrument with zones, key/velocity mapping.",
          "Drag any audio onto a MIDI track to auto-create a Simpler.",
        ],
      },
    ],
    sim: { type: "drum-pad", preset: { simpler: true } },
    quiz: [
      {
        q: "Simpler's three modes are…",
        options: ["Loop, Pad, Drum", "Classic, One-Shot, Slice", "FM, AM, PM", "A, B, C"],
        answer: 1,
        explain:
          "Classic for looping samples, One-Shot for non-looping (drums), Slice for chopping — each is optimized for its use case.",
        hint: "Three modes for three different sample playback scenarios.",
      },
      {
        q: "For multi-sampled instruments use…",
        options: ["Simpler", "Sampler", "Operator", "Drift"],
        answer: 1,
        explain:
          "Sampler handles multi-sampled instruments with key zones, velocity layers, and round-robin — complex instrument design.",
        hint: "When you need different samples across the keyboard, which device handles that?",
      },
      {
        q: "Drag audio to a MIDI track →",
        options: ["Sampler", "Simpler", "Operator", "Drum Rack"],
        answer: 1,
        explain:
          "Dragging audio directly to a MIDI track automatically creates a Simpler with that sample loaded and ready to play.",
        hint: "The simpler way to load a sample — what's Live's basic sampler called?",
      },
    ],
  },
  {
    slug: "eq-eight",
    world: "devices",
    number: 6,
    title: "EQ Eight",
    tagline: "Shape every frequency.",
    xp: 70,
    badge: { slug: "frequency-fox", name: "Frequency Fox" },
    explainer: [
      {
        kind: "lead",
        text: "EQ Eight gives you 8 bands of parametric EQ, each with multiple filter shapes.",
      },
      {
        kind: "list",
        items: [
          "High-pass to remove sub rumble.",
          "Bell to boost or cut a focused band.",
          "Shelves for broad tilts.",
          "Hold Cmd/Ctrl + drag for fine adjustments.",
        ],
      },
      {
        kind: "callout",
        tone: "key",
        text: "Subtractive EQ before additive: cut what's wrong before boosting what's right.",
      },
    ],
    sim: { type: "device-lab", preset: { device: "eq" } },
    quiz: [
      {
        q: "EQ Eight has how many bands?",
        options: ["4", "6", "8", "10"],
        answer: 2,
        explain:
          "EQ Eight's 8 bands give you full-spectrum sculpting — bell, shelf, high/low-pass filters all independently configurable.",
        hint: "The device name contains the number of available filter bands.",
      },
      {
        q: "Remove sub rumble with a…",
        options: ["High shelf", "Low shelf", "High-pass", "Notch"],
        answer: 2,
        explain:
          "A high-pass filter removes everything BELOW the cutoff — perfect for eliminating low-end rumble, HVAC noise, or proximity effect.",
        hint: "If it 'passes' high frequencies, what does it remove?",
      },
      {
        q: "Subtractive EQ means…",
        options: ["Boost first", "Cut first", "Only boost", "Only shelf"],
        answer: 1,
        explain:
          "Subtractive EQ means cutting frequencies you don't want rather than boosting — cuts sound more natural and transparent.",
        hint: "Subtract = remove. What are you removing in subtractive EQ?",
      },
    ],
  },
  {
    slug: "compressor",
    world: "devices",
    number: 7,
    title: "Compressor",
    tagline: "Tame dynamics. Add punch.",
    xp: 80,
    badge: { slug: "dyna-master", name: "Dyna Master" },
    explainer: [
      {
        kind: "list",
        items: [
          "Threshold — level above which compression kicks in.",
          "Ratio — how much it squashes.",
          "Attack — how fast it clamps.",
          "Release — how fast it lets go.",
          "Knee — soft vs hard transition.",
          "Makeup — bring level back up.",
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        text: "Slower attack = more transient through. Faster attack = more squash.",
      },
    ],
    sim: { type: "device-lab", preset: { device: "compressor" } },
    quiz: [
      {
        q: "Slower attack lets through more…",
        options: ["Bass", "Transients", "Reverb", "Pitch"],
        answer: 1,
        explain:
          "Slow attack lets transients through before compression kicks in — essential for drum punch and percussive snap.",
        hint: "Attack is how fast compression responds — what happens to fast sounds if it's slow?",
      },
      {
        q: "Ratio of 4:1 means…",
        options: ["4 dB in = 1 dB over", "1 dB in = 4 dB over", "No effect", "Limiter"],
        answer: 0,
        explain:
          "4:1 ratio: for every 4dB above threshold, only 1dB passes through. More ratio = more squash.",
        hint: "The ratio describes input dB vs output dB — 4 in, how many out?",
      },
      {
        q: "Makeup gain compensates for…",
        options: ["Pitch", "Lost level", "Latency", "Width"],
        answer: 1,
        explain:
          "Compression reduces peak levels — makeup gain restores the apparent loudness so the signal doesn't feel 'deflated'.",
        hint: "After compression makes things quieter, what do you need to add back?",
      },
    ],
  },
  {
    slug: "reverb-delay",
    world: "devices",
    number: 8,
    title: "Reverb & Delay",
    tagline: "Space and echo.",
    xp: 60,
    explainer: [
      {
        kind: "list",
        items: [
          "Reverb — space simulation; size, decay, dry/wet.",
          "Hybrid Reverb (Live 11+) blends convolution with algorithmic.",
          "Delay — echoes synced to tempo.",
          "Echo — analog-flavored delay with character.",
          "Always put reverb/delay on a Return for sharing across tracks.",
        ],
      },
    ],
    sim: { type: "send-return", preset: { device: "reverb" } },
    quiz: [
      {
        q: "Hybrid Reverb arrived in…",
        options: ["Live 9", "Live 10", "Live 11", "Live 12"],
        answer: 2,
        explain:
          "Hybrid Reverb (Live 11) blends convolution (real-space IRs) with algorithmic reverb for unprecedented space control.",
        hint: "It combines two reverb types — which major version introduced it?",
      },
      {
        q: "Reverbs are best placed on…",
        options: ["Each track", "Master", "Returns", "Group"],
        answer: 2,
        explain:
          "Reverb on returns means one reverb instance processes many tracks via sends — saves CPU and creates cohesive 'glue'.",
        hint: "What's the most CPU-efficient way to share one effect across all tracks?",
      },
      {
        q: "Echo is…",
        options: ["A reverb", "Analog-flavored delay", "A limiter", "A vocoder"],
        answer: 1,
        explain:
          "Echo is Live's multi-mode delay with character — analogue warmth mode mimics tape delay with saturation and filtering.",
        hint: "Is it a reverb or a delay device?",
      },
    ],
  },
  {
    slug: "saturator-distortion",
    world: "devices",
    number: 9,
    title: "Saturator & Distortion",
    tagline: "Add grit. Add glue.",
    xp: 60,
    explainer: [
      {
        kind: "list",
        items: [
          "Saturator — soft to hard saturation curves.",
          "Drive controls how hard you push the curve.",
          "Pedal, Overdrive, Roar (Live 12) — flavored distortions.",
          "Roar adds multi-band processing & feedback paths.",
        ],
      },
    ],
    sim: { type: "device-lab", preset: { device: "saturator" } },
    quiz: [
      {
        q: "Roar was added in…",
        options: ["Live 10", "Live 11", "Live 12", "Live 13"],
        answer: 2,
        explain:
          "Roar (Live 12) is a multi-band distortion/saturation device with up to 3 frequency bands independently saturated.",
        hint: "Which major Live version added Roar?",
      },
      {
        q: "Drive in Saturator controls…",
        options: ["Pitch", "How hard you hit the curve", "Reverb size", "Pan"],
        answer: 1,
        explain:
          "Drive pushes the signal harder into Saturator's waveshaping curve — more drive = more harmonics = thicker, grittier tone.",
        hint: "Driving something harder into a curve — what happens to the signal?",
      },
      {
        q: "Roar is a…",
        options: ["Reverb", "Multi-band distortion", "Compressor", "Synth"],
        answer: 1,
        explain:
          "Roar is multiband distortion — it splits the signal into bands, distorts each independently, then recombines for precise control.",
        hint: "Multi + distortion — it does saturation in multiple frequency bands.",
      },
    ],
  },
  {
    slug: "midi-effects",
    world: "devices",
    number: 10,
    title: "MIDI Effects",
    tagline: "Process notes before sound.",
    xp: 50,
    explainer: [
      {
        kind: "list",
        items: [
          "Arpeggiator — turn chords into runs.",
          "Chord — stack intervals on each note.",
          "Scale — force notes into a scale.",
          "Note Echo — note repeats.",
          "Random / Velocity — humanise or chaos.",
        ],
      },
    ],
    sim: { type: "piano-roll", preset: { midiFx: true } },
    quiz: [
      {
        q: "Force notes into a scale with…",
        options: ["Chord", "Scale", "Random", "Velocity"],
        answer: 1,
        explain:
          "The Scale MIDI device forces all incoming notes to the nearest note in a chosen scale — eliminates wrong notes instantly.",
        hint: "Which device literally constrains notes to a musical scale?",
      },
      {
        q: "Arpeggiator turns chords into…",
        options: ["Pads", "Runs", "Reverb", "Bass"],
        answer: 1,
        explain:
          "Arpeggiator takes held chords and plays them as sequential notes — rate, direction, and pattern are fully configurable.",
        hint: "Arpeggio = chord notes played sequentially — what device does that?",
      },
      {
        q: "MIDI effects sit…",
        options: ["After instrument", "Before instrument", "On Master", "On Return"],
        answer: 1,
        explain:
          "MIDI effects transform note data before it reaches the instrument — they're always in the device chain before the synth.",
        hint: "MIDI data flows: MIDI FX → Instrument → Audio FX. Where are MIDI effects?",
      },
    ],
  },
  {
    slug: "racks-macros",
    world: "devices",
    number: 11,
    title: "Racks & Macros",
    tagline: "Wrap chains. Map controls.",
    xp: 80,
    badge: { slug: "macro-maxxer", name: "Macro Maxxer" },
    explainer: [
      {
        kind: "lead",
        text: "Racks group devices into a single unit. Macros are 16 knobs you map to any parameter inside the rack.",
      },
      {
        kind: "list",
        items: [
          "Instrument Rack, Audio Effect Rack, MIDI Effect Rack, Drum Rack.",
          "Chain Selector splits zones across chains.",
          "Macro Variations save & recall macro snapshots.",
          "Right-click a parameter → Map to Macro.",
        ],
      },
    ],
    sim: { type: "knob-trainer", preset: { macros: true } },
    quiz: [
      {
        q: "How many macros per rack?",
        options: ["8", "12", "16", "32"],
        answer: 2,
        explain:
          "Live 11 expanded Instrument Racks to 16 macros — more than enough for deep preset customization without menu-diving.",
        hint: "It's the maximum, not the default — think about how many a full rack can have.",
      },
      {
        q: "Macro Variations are…",
        options: ["Plugins", "Snapshots of macro values", "Sends", "Scenes"],
        answer: 1,
        explain:
          "Macro Variations (Live 12) snapshot your macro values so you can instantly switch between different sound 'states' of a patch.",
        hint: "Variations suggests multiple saved states — what do macros control?",
      },
      {
        q: "Chain Selector splits…",
        options: ["MIDI notes only", "Velocity, key or chain zones", "Audio only", "Returns"],
        answer: 1,
        explain:
          "Chain Selector splits chains by key range, velocity range, or chain zone — enabling splits, layers, and velocity-switching.",
        hint: "What three dimensions can determine which chain plays?",
      },
    ],
  },
];

const w5: Mission[] = [
  {
    slug: "the-mixer",
    world: "mixing",
    number: 1,
    title: "The Mixer",
    tagline: "Faders, pans, meters.",
    xp: 70,
    explainer: [
      {
        kind: "list",
        items: [
          "Volume fader — track level (don't ride hot).",
          "Pan — stereo placement.",
          "Mute / Solo — isolate or silence.",
          "Cue — pre-listen for DJ-style monitoring.",
          "Crossfader A/B — DJ blend across tracks.",
        ],
      },
    ],
    sim: { type: "mixer" },
    quiz: [
      {
        q: "Soloing a track…",
        options: ["Mutes others", "Mutes it", "Records it", "Groups it"],
        answer: 0,
        explain:
          "Solo mutes all other tracks temporarily — useful for checking individual elements without stopping the mix.",
        hint: "If you solo one track, what happens to the others?",
      },
      {
        q: "Crossfader is for…",
        options: ["EQ", "DJ-style A/B blend", "Reverb", "Pitch"],
        answer: 1,
        explain:
          "The Crossfader blends between tracks assigned to A or B — perfect for DJ mixes and live performance transitions.",
        hint: "It fades between two sides — what are those sides called?",
      },
      {
        q: "Cue lets you…",
        options: ["Pre-listen", "Record", "Solo", "Pan"],
        answer: 0,
        explain:
          "Cue output sends pre-fader signal to your headphones for previewing the next track before bringing it in on master.",
        hint: "It lets you hear something before the audience does — what's that called?",
      },
    ],
  },
  {
    slug: "sends-returns",
    world: "mixing",
    number: 2,
    title: "Sends & Returns",
    tagline: "Share effects. Save CPU.",
    xp: 70,
    badge: { slug: "send-it", name: "Send It" },
    explainer: [
      {
        kind: "lead",
        text: "Instead of a reverb on every track, put one on a Return and send each track to it. Cleaner, lighter, more cohesive.",
      },
      {
        kind: "list",
        items: [
          "Cmd/Ctrl + Alt + T — create Return Track.",
          "Each track gets a Send knob per Return.",
          "Pre/Post toggle: Pre = send before fader, Post = after.",
        ],
      },
    ],
    sim: { type: "send-return" },
    quiz: [
      {
        q: "Pre-fader send is independent of…",
        options: ["Pan", "Volume fader", "Solo", "Mute"],
        answer: 1,
        explain:
          "Pre-fader sends don't change when you move the volume fader — the send level is independent of track volume.",
        hint: "Pre = before the fader. What does 'before' mean for fader changes?",
      },
      {
        q: "Returns receive…",
        options: ["MIDI", "Sends", "Inputs", "Scenes"],
        answer: 1,
        explain:
          "Returns are the destination for send signals — they host shared effects and output to the master, not directly to tracks.",
        hint: "Sends go somewhere — where do they go?",
      },
      {
        q: "Why use a return reverb?",
        options: ["Louder", "CPU & cohesion", "Pitch shift", "Quantize"],
        answer: 1,
        explain:
          "One reverb on a return shared by 20 tracks uses 1/20th the CPU vs 20 separate reverbs, and glues the mix together.",
        hint: "Efficiency and mixing cohesion — what's the benefit of sharing an effect?",
      },
    ],
  },
  {
    slug: "groups-routing",
    world: "mixing",
    number: 3,
    title: "Groups & Routing",
    tagline: "Sub-mixes and signal flow.",
    xp: 80,
    explainer: [
      {
        kind: "list",
        items: [
          "Cmd/Ctrl + G groups tracks.",
          "Group is a real audio bus — process it.",
          "Track In/Out lets you route any track anywhere.",
          "Audio From: external input, another track, Resampling.",
        ],
      },
    ],
    sim: { type: "routing-puzzle", preset: { groups: true } },
    quiz: [
      {
        q: "Group tracks are…",
        options: ["Folders only", "Real audio buses", "Returns", "MIDI"],
        answer: 1,
        explain:
          "Group tracks are real audio buses that sum their children — you can add effects, automate, and compress the entire group.",
        hint: "Unlike just folders, Group tracks actually process audio. What makes them a bus?",
      },
      {
        q: "Resampling sends Master back to…",
        options: ["A scene", "An audio track input", "A return", "A clip"],
        answer: 1,
        explain:
          "Resampling routes master output back to an audio track input — use it to capture your mix, effects chain, or live performance.",
        hint: "Where does the signal come from in Resampling mode?",
      },
      {
        q: "Cmd/Ctrl + G…",
        options: ["Saves", "Groups", "Quantizes", "Records"],
        answer: 1,
        explain:
          "Cmd/Ctrl + G groups selected tracks into a new Group track — faster than right-clicking for the context menu option.",
        hint: "G = Group. What's the keyboard modifier on Mac/PC?",
      },
    ],
  },
  {
    slug: "automation",
    world: "mixing",
    number: 4,
    title: "Automation",
    tagline: "Make parameters move.",
    xp: 80,
    badge: { slug: "auto-mate", name: "Auto Mate" },
    explainer: [
      {
        kind: "lead",
        text: "Automation records parameter changes over time. Press A in Arrangement to show automation lanes; draw or record.",
      },
      {
        kind: "list",
        items: [
          "Click any parameter then choose it from the lane menu.",
          "Curves: linear, then drag a midpoint to bend.",
          "Live 11+ added shaped automation curves.",
          "Clip Envelopes hold automation inside a single clip.",
        ],
      },
    ],
    sim: { type: "arrangement", preset: { automation: true } },
    quiz: [
      {
        q: "Show automation in Arrangement with…",
        options: ["B", "A", "S", "M"],
        answer: 1,
        explain:
          "Pressing A shows all automation lanes in Arrangement View — you can then see and edit every automated parameter.",
        hint: "A single letter shortcut — which letter stands for Automation?",
      },
      {
        q: "Clip-only automation lives in…",
        options: ["Mixer", "Clip Envelopes", "Master", "Returns"],
        answer: 1,
        explain:
          "Clip envelopes store automation that loops with the clip — they travel with the clip if you move it, unlike track automation.",
        hint: "If automation is 'in the clip', where does it live?",
      },
      {
        q: "Curved automation arrived in…",
        options: ["Live 9", "Live 10", "Live 11", "Live 12"],
        answer: 2,
        explain:
          "Curved automation (Live 11) lets you draw Bezier-style curves between points — much more organic than stepped or linear.",
        hint: "It's the most recent addition to automation — check the version.",
      },
    ],
  },
  {
    slug: "modulation-lanes",
    world: "mixing",
    number: 5,
    title: "Modulation Lanes",
    tagline: "Beyond automation.",
    xp: 70,
    explainer: [
      {
        kind: "lead",
        text: "Modulation in Live 12 is offset-based — it nudges a parameter relative to its current value, on top of automation.",
      },
      {
        kind: "list",
        items: [
          "Arrangement Modulation lanes (Live 12).",
          "Combine with macros and LFOs (Max for Live).",
          "Great for evolving textures.",
        ],
      },
    ],
    sim: { type: "arrangement", preset: { modulation: true } },
    quiz: [
      {
        q: "Modulation in Live 12 is…",
        options: ["Absolute", "Offset-based", "MIDI-only", "Disabled"],
        answer: 1,
        explain:
          "Live 12 modulation is offset-based — it adds to existing automation values rather than replacing them, so both coexist.",
        hint: "Offset means adding on top — how does it interact with automation?",
      },
      {
        q: "Modulation stacks with…",
        options: ["Nothing", "Automation", "Sends only", "Solo"],
        answer: 1,
        explain:
          "Modulation stacks with automation — both can exist simultaneously on the same parameter, giving you layered control.",
        hint: "Do they conflict, or do they add together?",
      },
      {
        q: "Modulation lanes appeared in…",
        options: ["Live 10", "Live 11", "Live 12", "Live 8"],
        answer: 2,
        explain:
          "Modulation lanes are a Live 12 feature — they let clips carry their own LFO-style modulation without using MIDI or automation.",
        hint: "The most recently listed version added them.",
      },
    ],
  },
  {
    slug: "sidechain",
    world: "mixing",
    number: 6,
    title: "Sidechain Compression",
    tagline: "The pump.",
    xp: 90,
    badge: { slug: "sidechain-sniper", name: "Sidechain Sniper" },
    explainer: [
      {
        kind: "lead",
        text: "Use the kick to duck the bass (or pads). Open the Compressor's Sidechain panel and set the kick track as input.",
      },
      {
        kind: "list",
        items: [
          "Threshold sets when the duck starts.",
          "Ratio sets how deep.",
          "Attack & release sculpt the pump shape.",
          "Try fast attack, medium release for classic dance pump.",
        ],
      },
    ],
    sim: { type: "sidechain" },
    quiz: [
      {
        q: "Sidechain ducks…",
        options: ["The kick", "The track being compressed", "The reverb", "Master"],
        answer: 1,
        explain:
          "Sidechain compression ducks (reduces volume of) whatever track the compressor is on — triggered by the sidechain input.",
        hint: "Which track gets ducked — the compressor's track or the sidechain source?",
      },
      {
        q: "Classic pump uses…",
        options: [
          "Slow attack, slow release",
          "Fast attack, medium release",
          "No release",
          "Soft knee only",
        ],
        answer: 1,
        explain:
          "Fast attack grabs transients immediately, medium release lets the signal breathe back before the next kick — the classic EDM pump.",
        hint: "Classic pump: how fast does it clamp, and how fast does it let go?",
      },
      {
        q: "Sidechain input panel is on the…",
        options: ["EQ", "Compressor", "Reverb", "Saturator"],
        answer: 1,
        explain:
          "The sidechain input selector lives inside the Compressor device panel — expand it to choose the trigger source track.",
        hint: "It's inside the device itself — on which device specifically?",
      },
    ],
  },
  {
    slug: "max-for-live",
    world: "mixing",
    number: 7,
    title: "Max for Live",
    tagline: "Build your own devices.",
    xp: 60,
    explainer: [
      {
        kind: "list",
        items: [
          "Max for Live (M4L) is a visual coding env baked into Live Suite.",
          "Hundreds of free devices on maxforlive.com.",
          "Build custom synths, sequencers, MIDI tools.",
          "Convolution Reverb, LFO, Envelope Follower are official M4L devices.",
        ],
      },
    ],
    sim: { type: "none" },
    quiz: [
      {
        q: "M4L ships with…",
        options: ["Intro", "Standard", "Suite", "Lite"],
        answer: 2,
        explain:
          "Max for Live ships exclusively with Live Suite — the top-tier license required for M4L devices and many advanced features.",
        hint: "M4L is a premium feature — which version of Live includes it?",
      },
      {
        q: "Envelope Follower is…",
        options: ["A clip", "An M4L device", "A scene", "A track"],
        answer: 1,
        explain:
          "Envelope Follower is an M4L device that tracks the amplitude of audio and outputs it as modulation signal.",
        hint: "What does an 'envelope follower' do — follow what?",
      },
      {
        q: "Max is…",
        options: ["Audio editor", "Visual programming env", "Mastering tool", "DJ app"],
        answer: 1,
        explain:
          "Max is a visual programming environment from Cycling '74 — you connect objects with patch cables to create custom devices.",
        hint: "Is Max text-based or visual/node-based programming?",
      },
    ],
  },
];

const w6: Mission[] = [
  {
    slug: "push-controllers",
    world: "performance",
    number: 1,
    title: "Push & Controllers",
    tagline: "Get hands on.",
    xp: 60,
    explainer: [
      {
        kind: "list",
        items: [
          "Push 3 — hardware instrument, can run Live standalone.",
          "Auto-mapping for popular controllers.",
          "User Remote Scripts for custom mapping.",
        ],
      },
    ],
    sim: { type: "drum-pad", preset: { push: true } },
    quiz: [
      {
        q: "Push 3 can run…",
        options: ["Only with computer", "Standalone", "MIDI only", "Audio only"],
        answer: 1,
        explain:
          "Push 3 Standalone contains Live's audio engine on the device itself — no laptop needed for performance or production.",
        hint: "Standalone means it runs independently — without what?",
      },
      {
        q: "Custom mapping uses…",
        options: ["Macros", "Remote Scripts", "Sends", "Cue"],
        answer: 1,
        explain:
          "Custom MIDI mapping to Push uses Remote Scripts — Python scripts that define exactly how Live responds to Push's controls.",
        hint: "Remote Scripts are the mechanism — what language are they written in? (trick: the question asks the technology name)",
      },
      {
        q: "Push is…",
        options: ["A plugin", "Hardware", "A scene", "A clip"],
        answer: 1,
        explain:
          "Push is dedicated hardware made by Ableton — not software, not a plugin, but a physical controller and standalone device.",
        hint: "Push exists in the physical world — what category does that put it in?",
      },
    ],
  },
  {
    slug: "midi-mapping",
    world: "performance",
    number: 2,
    title: "MIDI Mapping",
    tagline: "Map any knob to anything.",
    xp: 70,
    badge: { slug: "map-master", name: "Map Master" },
    explainer: [
      {
        kind: "lead",
        text: "Cmd/Ctrl + M enters MIDI Map mode. Click a parameter, move a control, done. Set min/max ranges per mapping.",
      },
      {
        kind: "list",
        items: [
          "Cmd/Ctrl + K — Key Map mode (laptop keys).",
          "Mappings are per Live Set.",
          "Right-click a mapping to invert range.",
        ],
      },
    ],
    sim: { type: "midi-map" },
    quiz: [
      {
        q: "MIDI Map mode shortcut…",
        options: ["Cmd/Ctrl + M", "Cmd/Ctrl + K", "Cmd/Ctrl + L", "Cmd/Ctrl + J"],
        answer: 0,
        explain:
          "Cmd/Ctrl + M enters MIDI Map mode — click any parameter then move a hardware control to assign it.",
        hint: "M for MIDI — what key modifier comes before it on Mac/PC?",
      },
      {
        q: "Key Map shortcut…",
        options: ["Cmd/Ctrl + M", "Cmd/Ctrl + K", "Cmd/Ctrl + L", "Cmd/Ctrl + J"],
        answer: 1,
        explain:
          "Cmd/Ctrl + K enters Key Map mode — assign any computer keyboard key to any Live parameter or button.",
        hint: "K for Key Map — what's the modifier?",
      },
      {
        q: "Mappings save…",
        options: ["Globally", "Per Live Set", "Per Pack", "Per scene"],
        answer: 1,
        explain:
          "MIDI and key mappings save with the Live Set (.als) — they don't transfer between projects automatically.",
        hint: "Mappings are project-specific — where do they live?",
      },
    ],
  },
  {
    slug: "tempo-following",
    world: "performance",
    number: 3,
    title: "Tempo Following",
    tagline: "Live follows you.",
    xp: 60,
    explainer: [
      {
        kind: "lead",
        text: "Tempo Follower (Live 11+) listens to an audio input (e.g. drummer) and tracks tempo in real time.",
      },
      {
        kind: "list",
        items: [
          "Set Audio From in the Tempo Follower preferences.",
          "Engage the Follow button on the tempo display.",
          "Best with strong rhythmic input.",
        ],
      },
    ],
    sim: { type: "bpm-tap" },
    quiz: [
      {
        q: "Tempo Follower added in…",
        options: ["Live 9", "Live 10", "Live 11", "Live 12"],
        answer: 2,
        explain:
          "Tempo Follower (Live 11) analyzes incoming audio in real-time and adjusts Live's BPM to match — great for live band sync.",
        hint: "Which version added real-time audio tempo analysis?",
      },
      {
        q: "It follows…",
        options: ["MIDI clock", "Audio input", "Scene tempo", "Cue"],
        answer: 1,
        explain:
          "Tempo Follower listens to the audio input signal to extract the current BPM — it needs audio, not MIDI.",
        hint: "What type of input does it analyze to extract tempo?",
      },
      {
        q: "Best input is…",
        options: ["Pad", "Strong rhythmic source", "Reverb", "Silence"],
        answer: 1,
        explain:
          "A kick drum or strong rhythmic loop gives Tempo Follower the clearest signal to detect BPM accurately.",
        hint: "What has the clearest, most predictable rhythmic pulse?",
      },
    ],
  },
  {
    slug: "cv-tools",
    world: "performance",
    number: 4,
    title: "CV Tools",
    tagline: "Talk to modular.",
    xp: 50,
    explainer: [
      {
        kind: "list",
        items: [
          "CV Instrument & CV Triggers send pitch/gate to Eurorack via DC-coupled interface.",
          "CV In analyses incoming CV.",
          "Use to sequence hardware from MIDI clips.",
        ],
      },
    ],
    sim: { type: "none" },
    quiz: [
      {
        q: "CV needs a … interface",
        options: ["AC-coupled", "DC-coupled", "USB-only", "MIDI-only"],
        answer: 1,
        explain:
          "CV (Control Voltage) is DC audio — standard audio interfaces block it. DC-coupled interfaces pass CV voltages correctly.",
        hint: "CV is DC voltage — what interface characteristic allows DC to pass?",
      },
      {
        q: "CV Tools talk to…",
        options: ["Plugins", "Modular synths", "Push", "Returns"],
        answer: 1,
        explain:
          "CV Tools converts Live's MIDI/automation into CV signals that control modular synth parameters over analog voltage.",
        hint: "Modular synths speak CV — CV Tools bridges what two worlds?",
      },
      {
        q: "CV In…",
        options: ["Sends CV", "Receives CV", "Sends MIDI", "Records audio"],
        answer: 1,
        explain:
          "CV In receives incoming CV signals from modular gear and converts them to MIDI or modulation inside Live.",
        hint: "In receives, Out sends — which direction is CV In?",
      },
    ],
  },
  {
    slug: "ableton-link",
    world: "performance",
    number: 5,
    title: "Ableton Link",
    tagline: "Sync apps over Wi-Fi.",
    xp: 50,
    explainer: [
      {
        kind: "lead",
        text: "Link keeps multiple devices on the same beat over a local network — no cables, no master clock.",
      },
      {
        kind: "list",
        items: [
          "Toggle in the Control Bar.",
          "Works with hundreds of apps and hardware.",
          "Each peer can change tempo; everyone follows.",
        ],
      },
    ],
    sim: { type: "none" },
    quiz: [
      {
        q: "Link sync uses…",
        options: ["MIDI cable", "Wi-Fi/LAN", "Audio cable", "USB only"],
        answer: 1,
        explain:
          "Link synchronizes tempo and phase across apps and devices on the same Wi-Fi or Ethernet network — no MIDI cable needed.",
        hint: "Modern sync without MIDI — what network technology does it use?",
      },
      {
        q: "Link tempo control is…",
        options: ["Single master", "Anyone can change", "Locked", "Read-only"],
        answer: 1,
        explain:
          "Ableton Link is fully peer-to-peer — any device in the session can change the tempo and all others follow.",
        hint: "There's no master or slave — who controls the tempo?",
      },
      {
        q: "Link is…",
        options: ["Paid plugin", "Free, built-in", "Hardware only", "iOS only"],
        answer: 1,
        explain:
          "Link is completely free and built into Live, Push, and hundreds of third-party apps — no subscription or add-on required.",
        hint: "Is Link a paid extension or included out of the box?",
      },
    ],
  },
  {
    slug: "exporting",
    world: "performance",
    number: 6,
    title: "Exporting",
    tagline: "Render the final file.",
    xp: 60,
    badge: { slug: "shipped-it", name: "Shipped It" },
    explainer: [
      {
        kind: "lead",
        text: "Cmd/Ctrl + Shift + R opens Export Audio/Video. Set the loop brace to define the region first.",
      },
      {
        kind: "list",
        items: [
          "Render as Loop renders just the loop.",
          "WAV 24-bit / 44.1 kHz for distribution; 32-bit float for mastering hand-off.",
          "Normalize off — leave headroom.",
          "Render Each Track separately for stems.",
        ],
      },
    ],
    sim: { type: "none" },
    quiz: [
      {
        q: "For mastering hand-off use…",
        options: ["MP3", "WAV 16-bit", "WAV 24-bit / 32-bit float", "FLAC"],
        answer: 2,
        explain:
          "Mastering engineers need maximum headroom — 24-bit or 32-bit float WAV at full sample rate preserves all dynamic information.",
        hint: "What format gives a mastering engineer the most to work with?",
      },
      {
        q: "Stems come from…",
        options: ["Render Master", "Render Each Track", "Render Loop", "Render MIDI"],
        answer: 1,
        explain:
          "Render Each Track exports individual stems — great for remixing, collaborating, or sending to a mixing engineer.",
        hint: "Stems are separate — what export option gives you each track alone?",
      },
      {
        q: "Export shortcut…",
        options: ["Cmd/Ctrl + R", "Cmd/Ctrl + Shift + R", "Cmd/Ctrl + E", "F12"],
        answer: 1,
        explain:
          "Cmd/Ctrl + Shift + R opens the Export Audio dialog — memorize this if you export often.",
        hint: "R = Render/Export. What modifier combination triggers it?",
      },
    ],
  },
  {
    slug: "live-sets-projects",
    world: "performance",
    number: 7,
    title: "Live Sets & Projects",
    tagline: "Stay organised.",
    xp: 40,
    explainer: [
      {
        kind: "list",
        items: [
          "Project = folder, Set = .als file inside it.",
          "Templates save your default Set.",
          "Bounce in Place freezes a track to audio.",
          "Freeze + Flatten trades CPU for disk.",
        ],
      },
    ],
    sim: { type: "none" },
    quiz: [
      {
        q: "Freezing trades…",
        options: ["RAM for CPU", "CPU for disk", "Disk for RAM", "Quality for size"],
        answer: 1,
        explain:
          "Freeze renders a track temporarily to an audio file, bypassing CPU-intensive devices — saves CPU at cost of edit flexibility.",
        hint: "What are you giving up when you freeze a track?",
      },
      {
        q: "Bounce in Place…",
        options: ["Renders to audio in place", "Deletes a track", "Exports stems", "Locks tempo"],
        answer: 0,
        explain:
          "Bounce in Place permanently renders a track including all its devices to a new audio clip — frees those devices entirely.",
        hint: "Bounce = render permanently. What does 'in place' mean here?",
      },
      {
        q: "Templates set your…",
        options: ["Default Live Set", "Tempo only", "Theme", "Plugin folder"],
        answer: 0,
        explain:
          "Templates are saved Live Sets that open as your starting point — set up with your preferred routing, devices, and preferences.",
        hint: "What do you open at the start of every session?",
      },
    ],
  },
  {
    slug: "troubleshooting",
    world: "performance",
    number: 8,
    title: "Troubleshooting",
    tagline: "When things break.",
    xp: 50,
    explainer: [
      {
        kind: "list",
        items: [
          "Crackling? Raise buffer size, freeze tracks.",
          "Plugins not showing? Re-scan in Preferences.",
          "Latency issues? Check Driver Error Compensation.",
          "Lost project? Check Auto-Save folder.",
        ],
      },
    ],
    sim: { type: "buffer-sim" },
    quiz: [
      {
        q: "Crackling fix #1…",
        options: ["Lower buffer", "Raise buffer / freeze", "Add reverb", "Solo"],
        answer: 1,
        explain:
          "Buffer size determines how many samples are processed at once — larger buffer = more time to calculate = less CPU strain.",
        hint: "What's the first thing to try when you hear clicks and pops?",
      },
      {
        q: "Auto-saves are in the…",
        options: ["Trash", "Project's Backup folder", "Library root", "Master track"],
        answer: 1,
        explain:
          "Live auto-saves to a Backup folder inside the project — if your session crashes, look there for recovery files.",
        hint: "Where does Live save emergency backup copies?",
      },
      {
        q: "Plugins missing →",
        options: ["Re-scan in Preferences", "Reinstall Live", "New project", "Disable MIDI"],
        answer: 0,
        explain:
          "When plugins disappear, Live needs to re-scan your plugin folders — go to Preferences > Plug-Ins and rescan.",
        hint: "Plugins are found by scanning — what do you need to trigger?",
      },
    ],
  },
];

const wExtra: Mission[] = [
  {
    slug: "capture-midi",
    world: "first-contact",
    number: 6,
    title: "Capture MIDI",
    tagline: "The take you didn't record — recovered.",
    xp: 60,
    badge: { slug: "time-traveller", name: "Time Traveller" },
    explainer: [
      {
        kind: "lead",
        text: "Capture MIDI rebuilds the notes you just played even when Record was off. Live keeps a rolling MIDI buffer in the background.",
      },
      {
        kind: "list",
        items: [
          "Press the Capture button (camera icon, top-left) any time after playing.",
          "Live drops the captured notes onto the armed MIDI track at the right tempo.",
          "Works in both Session and Arrangement, with or without the metronome.",
        ],
      },
      {
        kind: "callout",
        tone: "key",
        text: "If you ever say 'wait, that was good' — you almost certainly already have it.",
      },
    ],
    sim: { type: "piano-roll" },
    quiz: [
      {
        q: "Capture MIDI requires Record to be armed first.",
        options: ["True", "False"],
        answer: 1,
        explain:
          "Capture MIDI works WITHOUT record armed — it retroactively captures what you just played even if you weren't recording.",
        hint: "Does Capture require you to be in record mode first?",
      },
      {
        q: "What gets captured?",
        options: ["Audio", "MIDI you just played", "Automation only"],
        answer: 1,
        explain:
          "Capture MIDI captures the MIDI notes you just played on any connected controller — your last few bars of playing.",
        hint: "What musical content does Capture recover?",
      },
      {
        q: "Where does the captured clip land?",
        options: ["A new track", "The armed MIDI track", "The Master"],
        answer: 1,
        explain:
          "Captured clips land on the armed (or selected) MIDI track — exactly where you'd expect to continue working.",
        hint: "Which track receives the captured clip?",
      },
    ],
  },
  {
    slug: "take-lanes",
    world: "two-views",
    number: 6,
    title: "Take Lanes & Comping",
    tagline: "Stack takes. Pick the best bits. Make one perfect take.",
    xp: 80,
    badge: { slug: "comp-king", name: "Comp King" },
    explainer: [
      {
        kind: "lead",
        text: "Take Lanes (Live 11+) record every pass underneath the main track. You then highlight the best moment from each lane and Live composites them into the final clip.",
      },
      {
        kind: "list",
        items: [
          "Right-click a track header → Show Take Lanes.",
          "Loop a section, hit Record — each pass lands on a new lane.",
          "Drag across the parts you like; they appear on the top lane (the comp).",
          "Works for both Audio and MIDI.",
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        text: "Comping is the secret behind 'how did they sing that perfectly?' — they didn't, in one go.",
      },
    ],
    sim: { type: "arrangement" },
    quiz: [
      {
        q: "Take Lanes were introduced in…",
        options: ["Live 9", "Live 10", "Live 11", "Live 12"],
        answer: 2,
        explain:
          "Take Lanes are a Live 11 feature for non-destructive comping of multiple recorded passes of audio or MIDI.",
        hint: "Take Lanes record multiple passes — which version introduced them?",
      },
      {
        q: "The comp lives on…",
        options: ["A return", "The main (top) lane", "The Master"],
        answer: 1,
        explain:
          "The comp lane is always the top lane — it's where you piece together the best sections from all the take lanes below.",
        hint: "The final edit sits at the top — what's it called?",
      },
      {
        q: "Take Lanes work for…",
        options: ["Audio only", "MIDI only", "Audio and MIDI"],
        answer: 2,
        explain:
          "Take Lanes and comping work identically for audio and MIDI — record multiple passes and comp between them.",
        hint: "Is there a reason it would only work for one type?",
      },
    ],
  },
  {
    slug: "mpe-tuning",
    world: "midi-audio",
    number: 7,
    title: "MPE & Tuning Systems",
    tagline: "Per-note bends. Microtonal scales. Beyond 12-EDO.",
    xp: 90,
    badge: { slug: "microtonal", name: "Microtonal" },
    explainer: [
      {
        kind: "lead",
        text: "MPE (MIDI Polyphonic Expression) lets each note carry its own pitch-bend, slide and pressure. Live 11+ supports it natively across Wavetable, Sampler, Arpeggiator and Drum Rack pads.",
      },
      {
        kind: "list",
        items: [
          "Plug in an MPE controller (Push 3, Seaboard, LinnStrument).",
          "Live 12 added Tuning Systems — load a Scala (.scl) file to play in just intonation, 24-EDO, etc.",
          "Tuning is global per Set; every device that supports it follows.",
        ],
      },
      {
        kind: "callout",
        tone: "key",
        text: "MPE turns MIDI from a piano roll into a string instrument: vibrato, slides, dynamic timbre, all per note.",
      },
    ],
    sim: { type: "piano-roll" },
    quiz: [
      {
        q: "MPE stands for…",
        options: ["MIDI Polyphonic Expression", "Multi Patch Editor", "Mod Performance Engine"],
        answer: 0,
        explain:
          "MPE allows each note to carry its own pitch bend, pressure, and slide data — enabling truly expressive polyphonic performance.",
        hint: "MPE = MIDI Polyphonic Expression — what does Polyphonic mean?",
      },
      {
        q: "Tuning Systems arrived in…",
        options: ["Live 10", "Live 11", "Live 12"],
        answer: 2,
        explain:
          "Tuning Systems (Live 12) let you use alternative scales and temperaments — microtonal, just intonation, historic tunings.",
        hint: "Which is the most recent version in the list?",
      },
      {
        q: "A .scl file is…",
        options: ["A sample", "A Scala tuning file", "A preset"],
        answer: 1,
        explain:
          ".scl files are the Scala format for defining alternative tuning systems — thousands are freely available online.",
        hint: "Scala is a historical tool for microtonality — what does its file format end in?",
      },
    ],
  },
  {
    slug: "meld",
    world: "devices",
    number: 12,
    title: "Meld",
    tagline: "Live 12's MPE-first dual-engine synth.",
    xp: 80,
    badge: { slug: "meld-mage", name: "Meld Mage" },
    explainer: [
      {
        kind: "lead",
        text: "Meld is a bi-timbral synth designed around MPE. Two independent engines (each with multiple oscillator types) layer or split across the keyboard.",
      },
      {
        kind: "list",
        items: [
          "Engines: classic, noise, FM, formant, additive — pick one per voice.",
          "Built-in modulation matrix with macro destinations.",
          "Designed to feel expressive on Push 3 and other MPE controllers.",
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        text: "Even without an MPE controller, Meld's two-engine layering makes great evolving pads.",
      },
    ],
    sim: { type: "synth-playground" },
    quiz: [
      {
        q: "Meld shipped with…",
        options: ["Live 10", "Live 11", "Live 12"],
        answer: 2,
        explain:
          "Meld is a new synthesizer that shipped with Live 12, designed around MPE expression and dual-engine sound design.",
        hint: "Which is the newest Live version?",
      },
      {
        q: "How many engines?",
        options: ["1", "2", "4"],
        answer: 1,
        explain:
          "Meld has two independent synthesis engines that can be blended, mixed, or morphed — the name reflects this duality.",
        hint: "Meld implies fusion — how many things can you fuse?",
      },
      {
        q: "Meld is designed for…",
        options: ["MPE expression", "Drum sampling", "Mastering"],
        answer: 0,
        explain:
          "Meld's MPE design means each note responds to pressure, slide, and pitch independently — expressive per-finger control.",
        hint: "Meld was built for which expressive MIDI protocol?",
      },
    ],
  },
  {
    slug: "drum-sampler",
    world: "devices",
    number: 13,
    title: "Drum Sampler",
    tagline: "Modern, multi-sample drum hits with built-in shaping.",
    xp: 70,
    badge: { slug: "kit-builder", name: "Kit Builder" },
    explainer: [
      {
        kind: "lead",
        text: "Drum Sampler (Live 12) replaces Simpler on each pad of the new Drum Rack. Multi-sample, velocity layers, pitch envelope, drive — built for one-shot drums, not loops.",
      },
      {
        kind: "list",
        items: [
          "Drag a folder of velocity layers — Drum Sampler maps them automatically.",
          "Per-pad pitch envelope, filter, drive, compression in one device.",
          "Round-robin so repeated hits don't sound like a machine gun.",
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        text: "If you'd been stacking Saturator + EQ + Simpler on every pad — Drum Sampler is that, in one.",
      },
    ],
    sim: { type: "drum-pad" },
    quiz: [
      {
        q: "Drum Sampler ships with…",
        options: ["Live 11", "Live 12"],
        answer: 1,
        explain:
          "Drum Sampler (Live 12) is a dedicated sampler for drum hits that replaces Simpler on Drum Rack pads with more drum-specific features.",
        hint: "Which is the newest version in this list?",
      },
      {
        q: "It replaces…",
        options: ["Simpler on drum pads", "Operator", "Wavetable"],
        answer: 0,
        explain:
          "Drum Sampler replaces Simpler on individual Drum Rack pads, adding round-robin, one-shot modes, and dedicated drum features.",
        hint: "What device did pads previously use before Drum Sampler?",
      },
      {
        q: "Round-robin avoids…",
        options: ["Machine-gun repeats", "Pitch drift", "Latency"],
        answer: 0,
        explain:
          "Round-robin cycles through multiple samples of the same hit — prevents the robotic 'machine gun' effect of identical repeats.",
        hint: "What problem does playing the same sample repeatedly cause?",
      },
    ],
  },
  {
    slug: "hybrid-reverb",
    world: "devices",
    number: 14,
    title: "Hybrid Reverb",
    tagline: "Convolution + algorithmic, blended in one device.",
    xp: 70,
    badge: { slug: "space-architect", name: "Space Architect" },
    explainer: [
      {
        kind: "lead",
        text: "Hybrid Reverb runs a convolution engine (real-space impulse responses) and an algorithmic engine in parallel and lets you crossfade between them.",
      },
      {
        kind: "list",
        items: [
          "Convolution side: real halls, plates, springs, custom IRs.",
          "Algorithmic side: Quartz, Shimmer, Tides, Ghost — modern character.",
          "Crossfade them with one knob.",
        ],
      },
      {
        kind: "callout",
        tone: "key",
        text: "Use convolution for realism, algorithmic for movement — blend for both.",
      },
    ],
    sim: { type: "send-return" },
    quiz: [
      {
        q: "Hybrid Reverb blends…",
        options: ["Convolution + algorithmic", "Two delays", "EQ + reverb"],
        answer: 0,
        explain:
          "Hybrid Reverb uses a convolution engine (loaded with real acoustic IRs) and an algorithmic engine simultaneously, giving you the best of both.",
        hint: "Hybrid = two types blended. What are the two reverb approaches?",
      },
      {
        q: "Convolution uses…",
        options: ["Recorded impulse responses", "Sine waves", "FM"],
        answer: 0,
        explain:
          "Convolution reverb uses recordings of actual acoustic spaces — fire a gunshot in a cathedral, capture the decay, use it as your reverb.",
        hint: "Convolution uses recorded real-world spaces — how?",
      },
      {
        q: "Best place to insert?",
        options: ["Return track", "Master input", "MIDI clip"],
        answer: 0,
        explain:
          "Returns are the correct place for reverb — one shared reverb for many tracks saves CPU and makes the mix feel like one space.",
        hint: "Where should shared effects like reverb go for efficiency?",
      },
    ],
  },
  {
    slug: "roar",
    world: "devices",
    number: 15,
    title: "Roar",
    tagline: "Multiband, modulated saturation. Tonal weapon.",
    xp: 70,
    badge: { slug: "tone-shaper", name: "Tone Shaper" },
    explainer: [
      {
        kind: "lead",
        text: "Roar (Live 12) is a multi-stage saturator with up to three bands, multiple distortion algorithms per stage, internal modulators, and a feedback path.",
      },
      {
        kind: "list",
        items: [
          "Pick from 13 saturation algorithms (Tube, Diode, Wavefolder, Bit, Digital Clip…).",
          "Run them in series, parallel, or split into 2–3 frequency bands.",
          "Built-in LFO/envelope follower modulates any stage parameter.",
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        text: "Use the multiband mode to saturate only the highs of a vocal — adds air without crunching the body.",
      },
    ],
    sim: { type: "knob-trainer" },
    quiz: [
      {
        q: "Roar is a…",
        options: ["Multiband saturator", "Reverb", "Synth"],
        answer: 0,
        explain:
          "Roar is specifically a multiband saturator/distortion — it splits the signal into bands so you can saturate lows, mids, and highs independently.",
        hint: "Multi + saturation — what does 'multi' refer to?",
      },
      {
        q: "Max bands?",
        options: ["1", "2", "3"],
        answer: 2,
        explain:
          "Roar supports up to 3 independent frequency bands — low, mid, and high — each with its own saturation characteristics.",
        hint: "Think: low, mid, high — how many bands is that?",
      },
      {
        q: "Roar shipped in…",
        options: ["Live 11", "Live 12"],
        answer: 1,
        explain:
          "Roar was introduced with Live 12 as part of Ableton's new creative effects suite alongside Meld and other devices.",
        hint: "New devices come with new versions — which is newest here?",
      },
    ],
  },
  {
    slug: "glue-compressor",
    world: "mixing",
    number: 8,
    title: "Glue Compressor",
    tagline: "The bus compressor that makes a mix feel like one record.",
    xp: 70,
    badge: { slug: "bus-master", name: "Bus Master" },
    explainer: [
      {
        kind: "lead",
        text: "Glue is Live's emulation of the classic SSL G-bus compressor — fast attack, musical release, designed for the master bus or a drum bus.",
      },
      {
        kind: "list",
        items: [
          "Threshold low (1–3 dB gain reduction) is enough.",
          "Attack 10ms, Release Auto, Ratio 4 — start there.",
          "Built-in soft clipper at the output.",
        ],
      },
      {
        kind: "callout",
        tone: "key",
        text: "If your mix sounds like separate tracks, Glue is the cheat code.",
      },
    ],
    sim: { type: "device-lab", preset: { device: "glue-compressor" } },
    quiz: [
      {
        q: "Glue emulates which classic?",
        options: ["1176", "SSL G-bus", "LA-2A"],
        answer: 1,
        explain:
          "Glue Compressor emulates the classic SSL G-series bus compressor — the industry standard for mix bus glue and cohesion.",
        hint: "Glue has a vintage analog model — which iconic console's compressor does it emulate?",
      },
      {
        q: "Typical bus GR?",
        options: ["1–3 dB", "10 dB", "20 dB"],
        answer: 0,
        explain:
          "1–3dB of gain reduction on a mix bus adds cohesion without squashing dynamics — this is 'glue', not limiting.",
        hint: "Bus compression is subtle — how much gain reduction creates cohesion?",
      },
      {
        q: "Output stage has…",
        options: ["Soft clipper", "Reverb", "Limiter"],
        answer: 0,
        explain:
          "Glue's output stage has a built-in soft clipper — this gently limits peaks that would otherwise clip the master output.",
        hint: "The output stage has a safety feature — what does a soft clipper do?",
      },
    ],
  },
  {
    slug: "limiter-truepeak",
    world: "mixing",
    number: 9,
    title: "Limiter & True Peak",
    tagline: "The last device on every master.",
    xp: 70,
    badge: { slug: "loudness", name: "Loudness" },
    explainer: [
      {
        kind: "lead",
        text: "Limiter is a brick-wall: nothing crosses the ceiling. Set Ceiling around -1 dBTP to stay safe for streaming codecs.",
      },
      {
        kind: "list",
        items: [
          "Gain pushes signal up; Ceiling sets the absolute peak.",
          "Lookahead 3 ms is the safe default; longer = cleaner but more latency.",
          "True Peak option detects inter-sample peaks that show up after MP3/AAC encoding.",
        ],
      },
      {
        kind: "callout",
        tone: "warn",
        text: "Limiting more than 3–4 dB will pump and squash. Mix into the limiter, don't fix the mix with it.",
      },
    ],
    sim: { type: "device-lab", preset: { device: "limiter" } },
    quiz: [
      {
        q: "A limiter is a…",
        options: ["Brick-wall compressor", "Reverb", "EQ"],
        answer: 0,
        explain:
          "A limiter is a compressor with an extreme ratio (often ∞:1) — nothing passes above the threshold, creating a hard ceiling.",
        hint: "It's a type of compressor — but with a ratio that bricks the ceiling.",
      },
      {
        q: "Streaming-safe ceiling?",
        options: ["-1 dBTP", "0 dB", "+3 dB"],
        answer: 0,
        explain:
          "Streaming platforms (Spotify, Apple Music) normalize to around -14 LUFS — a true-peak ceiling of -1 dBTP prevents inter-sample distortion.",
        hint: "What ceiling prevents distortion after streaming platform processing?",
      },
      {
        q: "True peak prevents…",
        options: ["Inter-sample clipping", "Pitch drift", "Latency"],
        answer: 0,
        explain:
          "Inter-sample peaks can exceed 0dBFS after D/A conversion even if the digital file shows no clip — true peak catches these.",
        hint: "What kind of clipping happens between digital samples during conversion?",
      },
    ],
  },
  {
    slug: "warp-modes-deep",
    world: "midi-audio",
    number: 8,
    title: "Warp Modes Deep Dive",
    tagline: "Beats, Tones, Texture, Re-Pitch, Complex, Complex Pro — when each wins.",
    xp: 80,
    badge: { slug: "warp-wizard", name: "Warp Wizard" },
    explainer: [
      {
        kind: "lead",
        text: "Each Warp Mode uses a different time-stretch algorithm. Picking the wrong one is the #1 cause of 'why does my loop sound mushy?'",
      },
      {
        kind: "list",
        items: [
          "Beats — drums, percussive loops. Locks to transients.",
          "Tones — pitched mono (vocals, bass).",
          "Texture — slow harmonic material (pads, ambient).",
          "Re-Pitch — no stretch; speed AND pitch shift together (vinyl-style).",
          "Complex / Complex Pro — full mixes, vocals; CPU-heavy but cleanest.",
        ],
      },
      {
        kind: "callout",
        tone: "key",
        text: "Drums → Beats. Vocals → Complex Pro. Mixes → Complex Pro. DJ pitch effect → Re-Pitch.",
      },
    ],
    sim: { type: "warp-lab" },
    quiz: [
      {
        q: "Best Warp Mode for drums?",
        options: ["Beats", "Tones", "Texture"],
        answer: 0,
        explain:
          "Beats mode is optimized for rhythmic material — it slices at transients and warps each slice independently, preserving drum hits.",
        hint: "Drums have strong transient hits — which mode is designed for that?",
      },
      {
        q: "Vinyl-style speed+pitch shift?",
        options: ["Re-Pitch", "Complex Pro", "Beats"],
        answer: 0,
        explain:
          "Re-Pitch changes pitch and speed together like a record — slowing down 50% makes it an octave lower, perfect for vinyl effects.",
        hint: "What playback medium changes pitch when you change speed?",
      },
      {
        q: "Cleanest for vocals?",
        options: ["Complex Pro", "Beats", "Re-Pitch"],
        answer: 0,
        explain:
          "Complex Pro uses a phase vocoder to separate pitch from time — the cleanest algorithm for vocals, full mixes, and pads.",
        hint: "Which mode is highest quality and most CPU-intensive?",
      },
    ],
  },
  {
    slug: "ableton-link-sync",
    world: "performance",
    number: 9,
    title: "Ableton Link in Practice",
    tagline: "Network-sync your Lives, iOS apps, hardware.",
    xp: 70,
    badge: { slug: "linked", name: "Linked" },
    explainer: [
      {
        kind: "lead",
        text: "Link is wireless tempo and beat-phase sync over local network. No master, no slave — every peer is equal.",
      },
      {
        kind: "list",
        items: [
          "Click the LINK button next to the metronome — same WiFi peers see each other.",
          "Tempo changes propagate live; downbeat phase stays locked.",
          "Optional Start Stop sync makes transports follow each other.",
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        text: "Two laptops on a phone hotspot is enough to jam — no audio cables needed.",
      },
    ],
    sim: { type: "session-grid" },
    quiz: [
      {
        q: "Link uses…",
        options: ["Local network", "MIDI cable", "Audio cable"],
        answer: 0,
        explain:
          "Link uses your local Wi-Fi or Ethernet network — no MIDI, no special cables, just network discovery.",
        hint: "What wireless infrastructure does Link rely on?",
      },
      {
        q: "Master/slave model?",
        options: ["Yes", "No — peer-to-peer"],
        answer: 1,
        explain:
          "Link has no master or slave — every connected device is equal. Any device can move the tempo and all others follow.",
        hint: "Is there a hierarchy in Link sessions?",
      },
      {
        q: "Start Stop sync is…",
        options: ["Optional add-on to Link", "Always on", "Separate protocol"],
        answer: 0,
        explain:
          "Start/Stop sync is an optional add-on to Link that also syncs transport start and stop — it's disabled by default.",
        hint: "Tempo sync is built-in — transport sync is what?",
      },
    ],
  },
  {
    slug: "push3-workflow",
    world: "performance",
    number: 10,
    title: "Push 3 Workflow",
    tagline: "Make a track without touching the mouse.",
    xp: 90,
    badge: { slug: "push-fluent", name: "Push Fluent" },
    explainer: [
      {
        kind: "lead",
        text: "Push 3 puts pads, screens, encoders and (in Standalone) the whole computer into one unit. The grid mirrors the device under your cursor.",
      },
      {
        kind: "list",
        items: [
          "Melodic mode — pads tuned to the chosen scale; wrong notes are physically absent.",
          "Drum mode — bottom-left 4×4 = pads, rest = step sequencer for the selected pad.",
          "Note mode + 64 pads — full melodic step sequencer.",
          "Standalone runs Live's engine inside Push for laptop-free shows.",
        ],
      },
      {
        kind: "callout",
        tone: "key",
        text: "Push isn't a controller — it's the same Live, with a body.",
      },
    ],
    sim: { type: "drum-pad" },
    quiz: [
      {
        q: "Push 3 Standalone runs…",
        options: ["Live's engine internally", "Only MIDI", "Only audio"],
        answer: 0,
        explain:
          "Push 3 Standalone has Live's audio engine running directly on the hardware — no computer needed for studio or stage.",
        hint: "Standalone = self-contained. What does it run independently of?",
      },
      {
        q: "Melodic mode hides…",
        options: ["Out-of-scale notes", "Drums", "Velocity"],
        answer: 0,
        explain:
          "Melodic mode on Push 3 highlights in-scale pads and dims out-of-scale ones — impossible notes don't trigger, only musical ones do.",
        hint: "What happens to notes outside the scale in melodic mode?",
      },
      {
        q: "Drum mode dedicates how many pads to step seq?",
        options: ["48", "16", "8"],
        answer: 0,
        explain:
          "In drum mode on Push 3, 32 pads trigger drums and 16 pads (top) become step sequencer steps per kit piece.",
        hint: "Push 3 has 64 total pads — how many are dedicated to the sequencer?",
      },
    ],
  },
  {
    slug: "macro-variations",
    world: "performance",
    number: 11,
    title: "Macro Variations",
    tagline: "Snapshot, recall, morph — patches that perform.",
    xp: 70,
    badge: { slug: "morpher", name: "Morpher" },
    explainer: [
      {
        kind: "lead",
        text: "Macro Variations save the current 16 macro values as a snapshot. Recall by clicking; morph by interpolating between snapshots.",
      },
      {
        kind: "list",
        items: [
          "Set the macros, hit New Variation — that's snapshot 1.",
          "Tweak macros, save again — snapshot 2.",
          "Click between them: instant recall. Drag the morph slider: smooth blend.",
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        text: "Build intro / verse / drop variations on a single Rack — one click changes the song's whole sound.",
      },
    ],
    sim: { type: "knob-trainer" },
    quiz: [
      {
        q: "Variations save…",
        options: ["Macro values", "Audio clips", "Tempo"],
        answer: 0,
        explain:
          "Macro Variations snapshot all 16 macro knob positions — recall different tonal states or morph between them in Live 12.",
        hint: "Variations = saved states. What do they save?",
      },
      {
        q: "Macros per Rack (Live 11+)?",
        options: ["8", "16", "32"],
        answer: 1,
        explain:
          "Live 11 expanded Instrument Racks to 16 macros — enough to expose any parameter from any device in the chain.",
        hint: "It's the maximum count added in a specific version.",
      },
      {
        q: "Live 12 morph between variations is…",
        options: ["Smooth interpolation", "Step-only", "Random"],
        answer: 0,
        explain:
          "Live 12 adds smooth morphing between Variations — click between snapshots and the macros glide to their new values.",
        hint: "Morphing means smoothly transitioning — what do you move between?",
      },
    ],
  },
];

// ============================================================
// WORLD 7 — MIDI & Instruments (instrument-heavy gap fill)
// ============================================================
const w7: Mission[] = [
  {
    slug: "sampler-deep",
    world: "midi-instruments",
    number: 1,
    title: "Sampler — Deep",
    tagline: "Multisamples, zones, modulation. Sampler ≠ Simpler.",
    xp: 70,
    badge: { slug: "zone-lord", name: "Zone Lord" },
    explainer: [
      {
        kind: "lead",
        text: "Sampler is Live's full multisampling instrument: any number of samples mapped across velocity and key zones, with full modulation routing.",
      },
      {
        kind: "list",
        items: [
          "Zone Editor — drop samples across keys/velocity/select.",
          "Pitch / Filter / Amp envelopes with modulation matrix.",
          "LFOs, MIDI sources (aftertouch, mod wheel, MPE).",
          "Slice + Drum Rack are the fastest ways to populate it.",
        ],
      },
      {
        kind: "callout",
        tone: "key",
        text: "Simpler plays one sample. Sampler plays a whole orchestra of samples mapped intelligently.",
      },
    ],
    sim: { type: "device-lab", preset: { device: "sampler" } },
    quiz: [
      {
        q: "Sampler vs Simpler?",
        options: ["Sampler is multisample", "They are identical", "Simpler is multisample"],
        answer: 0,
        explain:
          "Sampler handles multi-sampled instruments with full key/velocity mapping zones — Simpler loads a single sample.",
        hint: "Multi = many samples. Which device handles multiple samples mapped across keys?",
      },
      {
        q: "Zones are arranged by…",
        options: ["Key + velocity + select", "BPM", "Time only"],
        answer: 0,
        explain:
          "Sampler zones are mapped by key range (which notes play the sample), velocity range, and select (round-robin/random).",
        hint: "What three dimensions determine which zone plays?",
      },
      {
        q: "Sampler supports MPE?",
        options: ["Yes", "No"],
        answer: 0,
        explain:
          "Sampler supports MPE — each note can receive independent pitch bend, pressure, and slide, making it fully expressive.",
        hint: "MPE = polyphonic expression. Does Sampler support it?",
      },
    ],
  },
  {
    slug: "drift",
    world: "midi-instruments",
    number: 2,
    title: "Drift",
    tagline: "Small synth, big personality.",
    xp: 60,
    badge: { slug: "drifter", name: "Drifter" },
    explainer: [
      {
        kind: "lead",
        text: "Drift is a compact subtractive synth with two oscillators, a vintage filter and tasteful modulation. Live 12's go-to for fast leads, basses and pads.",
      },
      {
        kind: "list",
        items: [
          "Two oscillators with saturation and FM-ish mod.",
          "Two filter types (OB-style and ladder).",
          "Two envelopes, two LFOs, drift amount = analog wobble.",
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        text: "Start with the Init preset and twist Drift up — instant analog character.",
      },
    ],
    sim: { type: "synth-playground" },
    quiz: [
      {
        q: "Drift's filter section has…",
        options: ["Two model options", "One only", "Six options"],
        answer: 0,
        explain:
          "Drift's filter has two models — a classic ladder filter and an SEM-style state-variable filter, each with different character.",
        hint: "Two different filter circuit designs — how many options?",
      },
      {
        q: "Drift parameter adds…",
        options: ["Analog-style instability", "Reverb", "Distortion"],
        answer: 0,
        explain:
          "The Drift parameter adds random micro-variations to pitch and timing — simulating the instability of vintage analog oscillators.",
        hint: "What do real analog synths do that digital ones typically don't?",
      },
      {
        q: "Drift's synth model is…",
        options: ["Subtractive", "Wavetable", "Granular"],
        answer: 0,
        explain:
          "Drift is a subtractive synth — it starts with harmonically rich oscillators and uses filters to sculpt the tone.",
        hint: "Subtractive = filter harmonics away. What synthesis type is that?",
      },
    ],
  },
  {
    slug: "granulator-iii",
    world: "midi-instruments",
    number: 3,
    title: "Granulator III",
    tagline: "Time stretching into texture.",
    xp: 70,
    badge: { slug: "grain-witch", name: "Grain Witch" },
    explainer: [
      {
        kind: "lead",
        text: "Granulator III plays a sample as a stream of overlapping grains. Move the playhead slowly: textures. Move it fast: glitch. Pitch lives on the keyboard.",
      },
      {
        kind: "list",
        items: [
          "Grain size + spray = smoothness vs glitchiness.",
          "Position knob = where in the sample to read from.",
          "Spread + multi-grain = stereo lushness.",
        ],
      },
      {
        kind: "callout",
        tone: "key",
        text: "Granulator turns any short sample into a sustained instrument.",
      },
    ],
    sim: { type: "granular" },
    quiz: [
      {
        q: "Granulator plays the sample as…",
        options: ["Overlapping grains", "One-shots", "Loops only"],
        answer: 0,
        explain:
          "Granulator splits a sample into tiny overlapping grains and plays them back — the basis of granular synthesis and time-stretching.",
        hint: "Gran = grain. What does granular synthesis split samples into?",
      },
      {
        q: "Smaller grain size = …",
        options: ["More glitch / texture", "Cleaner pitch"],
        answer: 0,
        explain:
          "Small grain size creates more texture and glitch artifacts — larger grains sound more recognizable and smooth.",
        hint: "Smaller = less recognizable sample content, more sonic texture.",
      },
      {
        q: "Position parameter controls…",
        options: ["Read head in sample", "Tempo", "Filter cutoff"],
        answer: 0,
        explain:
          "The Position parameter moves the read head through the sample — scan it to continuously morph through different timbres.",
        hint: "Where in the sample is the read head positioned?",
      },
    ],
  },
  {
    slug: "collision-tension-electric",
    world: "midi-instruments",
    number: 4,
    title: "Collision · Tension · Electric · Analog",
    tagline: "Physical modelling + virtual analog.",
    xp: 80,
    badge: { slug: "physical", name: "Physical" },
    explainer: [
      {
        kind: "lead",
        text: "Live ships four classic modelling instruments that synthesise sound from physics or analog topology instead of samples.",
      },
      {
        kind: "list",
        items: [
          "Collision — mallets, marimbas, bells. Excite a resonator.",
          "Tension — bowed and plucked strings.",
          "Electric — electric pianos (Rhodes / Wurli style).",
          "Analog — two-osc virtual analog synth.",
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        text: "Modelling instruments respond to velocity and aftertouch with real expression — they reward MPE controllers.",
      },
    ],
    sim: { type: "synth-playground" },
    quiz: [
      {
        q: "Tension models…",
        options: ["Strings", "Drums", "Tape"],
        answer: 0,
        explain:
          "Tension models the physics of vibrating strings — string length, stiffness, pickup position, and damping are all physical parameters.",
        hint: "What physical object does Tension's model simulate?",
      },
      {
        q: "Electric is for…",
        options: ["EPs (Rhodes/Wurli)", "Brass", "Vocals"],
        answer: 0,
        explain:
          "Electric models the mechanics of electric pianos — tines, hammers, pickups, and the characteristic bell tone of Rhodes/Wurlitzer.",
        hint: "Which keyboard instruments are modeled in Electric?",
      },
      {
        q: "Collision excites a…",
        options: ["Resonator", "Filter bank", "Sample"],
        answer: 0,
        explain:
          "Collision excites a resonator (mallet, plate, string, etc.) with a noise burst — the physical modeling then determines the tone.",
        hint: "Collision = impact triggering resonance. What does the impact excite?",
      },
    ],
  },
  {
    slug: "bass-poli",
    world: "midi-instruments",
    number: 5,
    title: "Bass & Poli (Live 12)",
    tagline: "Curated synths, one knob away from great.",
    xp: 60,
    badge: { slug: "preset-pro", name: "Preset Pro" },
    explainer: [
      {
        kind: "lead",
        text: "Bass and Poli are Live 12's preset-first instruments: hand-tuned engines under a small panel. You pick a category, twist a few macros, and you're done.",
      },
      {
        kind: "list",
        items: [
          "Bass — sub, mid, growl, sub-bass.",
          "Poli — pads, plucks, keys, leads.",
          "Macro layout per preset is bespoke — read the labels.",
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        text: "Great for sketching — drop in, find the sound, then deepen with Wavetable or Operator if needed.",
      },
    ],
    sim: { type: "knob-trainer" },
    quiz: [
      {
        q: "Bass + Poli are…",
        options: ["Preset-first instruments", "Effects", "Samplers"],
        answer: 0,
        explain:
          "Bass and Poli are preset-based instruments with curated sounds and dedicated macro controls — designed for instant playability.",
        hint: "They prioritize presets over deep editing — what does that make them?",
      },
      {
        q: "Macros per preset are…",
        options: ["Bespoke per patch", "Always the same"],
        answer: 0,
        explain:
          "Each Bass or Poli patch has its own bespoke macro assignments — the 8 macros control the most musical parameters for that specific sound.",
        hint: "Are the macros the same for every patch, or specific to each?",
      },
      {
        q: "Poli is best for…",
        options: ["Pads / plucks / keys", "Kick drums"],
        answer: 0,
        explain:
          "Poli is optimized for polyphonic playing — pads, plucks, keys, and chords are its sweet spot with rich preset options.",
        hint: "Poli = polyphonic. What types of sounds suit a polyphonic preset instrument?",
      },
    ],
  },
  {
    slug: "instrument-rack",
    world: "midi-instruments",
    number: 6,
    title: "Instrument Rack",
    tagline: "Stack, layer, split, morph.",
    xp: 70,
    badge: { slug: "stacker", name: "Stacker" },
    explainer: [
      {
        kind: "lead",
        text: "Instrument Racks let you put multiple instruments inside one device. Use Chain Selector to morph; use Key/Vel zones to split or layer.",
      },
      {
        kind: "list",
        items: [
          "Drag instruments into one Rack → all play at once (layer).",
          "Set Key zones → split keyboard low/mid/high.",
          "Chain Selector + zones → blend between sounds with one knob.",
          "Macros above expose the 8/16 most important controls.",
        ],
      },
      {
        kind: "callout",
        tone: "key",
        text: "Pads = layered Racks. Splits = Key-zoned Racks. Morphs = Chain-Selector Racks.",
      },
    ],
    sim: { type: "knob-trainer" },
    quiz: [
      {
        q: "Layered Rack sounds…",
        options: ["All chains at once", "One at a time"],
        answer: 0,
        explain:
          "Layered Instrument Racks play all chains simultaneously — perfect for fat layered sounds like strings + pad + bass octave.",
        hint: "If chains are layered, do they all play at once?",
      },
      {
        q: "Split = zones on…",
        options: ["Key", "Velocity only", "Time"],
        answer: 0,
        explain:
          "Split zones divide the keyboard by key range — different chains respond to different octaves of the same keyboard.",
        hint: "Split = divide. What dimension are you dividing?",
      },
      {
        q: "Chain Selector lets you…",
        options: ["Morph between chains", "Record audio"],
        answer: 0,
        explain:
          "Chain Selector lets you switch between chains or morph between them using a single mapped controller or automation.",
        hint: "Selector = chooser. What are you selecting between?",
      },
    ],
  },
  {
    slug: "midi-effects-tour",
    world: "midi-instruments",
    number: 7,
    title: "MIDI Effects Tour",
    tagline: "Arpeggiator, Chord, Scale, Random, Note Echo.",
    xp: 60,
    badge: { slug: "midi-shaper", name: "MIDI Shaper" },
    explainer: [
      {
        kind: "lead",
        text: "MIDI effects sit before an instrument. They rewrite incoming notes before the synth ever hears them.",
      },
      {
        kind: "list",
        items: [
          "Arpeggiator — hold a chord, hear a pattern.",
          "Chord — turn one note into a chord.",
          "Scale — force notes into a chosen scale.",
          "Random / Velocity / Pitch — humanise or transpose.",
          "Note Echo — MIDI delay, retrigger notes in time.",
          "MIDI Effect Rack — chain them, expose macros.",
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        text: "Try Arpeggiator → Chord → Scale before a Drift pad. Suddenly you're playing whole songs from one finger.",
      },
    ],
    sim: { type: "piano-roll" },
    quiz: [
      {
        q: "Arpeggiator sits…",
        options: ["Before the instrument", "After it", "On the master"],
        answer: 0,
        explain:
          "MIDI effects process note data before it reaches the instrument — the instrument receives the transformed notes, not the originals.",
        hint: "Signal chain: MIDI → MIDI FX → Instrument. Where in the chain are MIDI effects?",
      },
      {
        q: "Scale device forces notes to…",
        options: ["A chosen scale", "A chord", "C major only"],
        answer: 0,
        explain:
          "The Scale device transposes incoming notes to the nearest note in the chosen scale — quantizes pitch to a musical key.",
        hint: "It forces notes into something — what does it force them into?",
      },
      {
        q: "Note Echo is essentially…",
        options: ["A MIDI delay", "Audio delay"],
        answer: 0,
        explain:
          "Note Echo is a MIDI delay — it creates repeating note echoes at a set interval, triggering the instrument multiple times.",
        hint: "Echo = repeat. But for MIDI notes — what type of device is it?",
      },
    ],
  },
  {
    slug: "external-instrument",
    world: "midi-instruments",
    number: 8,
    title: "External Instrument",
    tagline: "Treat hardware like a plugin.",
    xp: 60,
    badge: { slug: "hardware-buddy", name: "Hardware Buddy" },
    explainer: [
      {
        kind: "lead",
        text: "External Instrument sends MIDI out to a hardware synth and receives its audio back, so your synth feels like an internal plugin in the chain.",
      },
      {
        kind: "list",
        items: [
          "MIDI To — pick the hardware's port/channel.",
          "Audio From — pick the input it returns on.",
          "Hardware Latency — compensate for converter delay.",
        ],
      },
      {
        kind: "callout",
        tone: "warn",
        text: "Set Hardware Latency or your synth will arrive late on bounce — Live can't auto-detect it.",
      },
    ],
    sim: { type: "routing-puzzle" },
    quiz: [
      {
        q: "External Instrument routes…",
        options: ["MIDI out + audio in", "MIDI both ways"],
        answer: 0,
        explain:
          "External Instrument sends MIDI out to your hardware synth and returns its audio back into Live — all in one device.",
        hint: "It handles both directions — what goes out and what comes back?",
      },
      {
        q: "Hardware Latency must be…",
        options: ["Set manually", "Auto-detected"],
        answer: 0,
        explain:
          "Hardware latency must be manually set in External Instrument to compensate for the round-trip audio delay through your interface.",
        hint: "Hardware introduces delay — what do you need to do with that value?",
      },
      {
        q: "Sits on a…",
        options: ["MIDI track", "Audio track"],
        answer: 0,
        explain:
          "External Instrument goes on a MIDI track — it bridges the gap between Live's MIDI routing and external hardware audio return.",
        hint: "MIDI goes to hardware, audio comes back — what track type carries MIDI out?",
      },
    ],
  },
];

// ============================================================
// WORLD 8 — Live 12 Power Tools
// ============================================================
const w8: Mission[] = [
  {
    slug: "stem-separation",
    world: "live12-power",
    number: 1,
    title: "Stem Separation",
    tagline: "Drop a song. Get drums, bass, vocals, melodies.",
    xp: 90,
    badge: { slug: "splitter", name: "Splitter" },
    explainer: [
      {
        kind: "lead",
        text: "Live 12 ships a built-in stem splitter. Drag any audio clip onto a track, right-click → Split Stems, and Live returns four separated stems on new tracks.",
      },
      {
        kind: "list",
        items: [
          "Drums / Bass / Vocals / Other.",
          "Runs offline, no upload, no extra plugin.",
          "Perfect for remixes, edits, learning by reverse-engineering.",
        ],
      },
      {
        kind: "callout",
        tone: "key",
        text: "This single feature replaces an entire generation of third-party SaaS tools.",
      },
    ],
    sim: { type: "stem-splitter" },
    quiz: [
      {
        q: "Stem split returns how many stems?",
        options: ["4", "2", "8"],
        answer: 0,
        explain:
          "Stem Splitter (Live 12) separates audio into 4 stems: drums, bass, melody, and other — all processed locally on your machine.",
        hint: "How many stems does it split into?",
      },
      {
        q: "Runs…",
        options: ["Locally in Live", "On Ableton's servers"],
        answer: 0,
        explain:
          "Stem Splitter runs Live's built-in AI separation engine locally — no cloud upload, no subscription, processes in real-time.",
        hint: "Does it need internet or process on your computer?",
      },
      {
        q: "A common use is…",
        options: ["Remixes / sample-flipping", "Mastering"],
        answer: 0,
        explain:
          "Stem splitting lets you isolate elements from mixed audio for sampling, remixing, or processing individual elements.",
        hint: "What would you do with isolated stems from a mixed track?",
      },
    ],
  },
  {
    slug: "midi-transforms",
    world: "live12-power",
    number: 2,
    title: "MIDI Transformations",
    tagline: "Connect, Arpeggiate, Strum, Recombine, Ornament.",
    xp: 80,
    badge: { slug: "transformer", name: "Transformer" },
    explainer: [
      {
        kind: "lead",
        text: "Transformations are one-shot MIDI tools that operate on a clip's notes. Pick a clip, open Transform, choose a tool, audition, commit.",
      },
      {
        kind: "list",
        items: [
          "Connect — fill gaps between notes (great for melodies).",
          "Arpeggiate — fan a chord across time.",
          "Strum — slight stagger, like a guitar.",
          "Recombine — shuffle pitches/rhythms creatively.",
          "Ornament — adds grace notes.",
          "Quantize, Velocity Shape, Time Warp all live here too.",
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        text: "Transformations are destructive on commit — duplicate the clip first if you want a safe before/after.",
      },
    ],
    sim: { type: "midi-transform" },
    quiz: [
      {
        q: "Transformations operate on…",
        options: ["Clip notes", "Audio only"],
        answer: 0,
        explain:
          "Note Transformations (Live 12) operate on the MIDI notes inside a clip — strum, pitch-shift, arpeggiate, and more.",
        hint: "They transform what's inside the clip — what data is in a MIDI clip?",
      },
      {
        q: "Strum is essentially…",
        options: ["A small time offset across a chord", "A reverb"],
        answer: 0,
        explain:
          "Strum offsets the start time of each note in a chord slightly — mimicking how a guitarist strums strings one after another.",
        hint: "What does a guitarist do that makes a chord sound non-simultaneous?",
      },
      {
        q: "Live 12 ships how many transforms?",
        options: ["Several built-in", "Just one"],
        answer: 0,
        explain:
          "Live 12 ships with several built-in Note Transformations including Strum, Pitch Shift, and more accessible from the Piano Roll.",
        hint: "Live 12 introduced them — and includes several by default.",
      },
    ],
  },
  {
    slug: "scale-awareness",
    world: "live12-power",
    number: 3,
    title: "Scale Awareness",
    tagline: "The whole project speaks one scale.",
    xp: 70,
    badge: { slug: "in-key", name: "In Key" },
    explainer: [
      {
        kind: "lead",
        text: "Live 12 introduces a project-wide scale. Set it once and every MIDI clip, every Push grid, every Scale-aware device locks to it.",
      },
      {
        kind: "list",
        items: [
          "Control bar shows the current scale + root.",
          "Clips can follow the global scale or override.",
          "Push 3 grid hides out-of-scale notes when enabled.",
          "Right-click any note → fold to scale or transpose in scale.",
        ],
      },
      {
        kind: "callout",
        tone: "key",
        text: "Scale-aware editing is the difference between MIDI feeling like programming and MIDI feeling like playing.",
      },
    ],
    sim: { type: "scale-aware" },
    quiz: [
      {
        q: "Scale awareness is set…",
        options: ["Project-wide (with overrides)", "Per clip only", "Per note"],
        answer: 0,
        explain:
          "Scale awareness is set project-wide so all instruments, Push, and MIDI effects know the key — with per-clip overrides available.",
        hint: "One setting affects the whole project — where is scale set?",
      },
      {
        q: "Push 3 with scale on…",
        options: ["Hides out-of-scale pads", "Plays drums only"],
        answer: 0,
        explain:
          "Push 3 with scale mode highlights playable in-scale pads and suppresses out-of-scale ones — every pad is a musical note.",
        hint: "Scale mode guides the player — what happens to out-of-scale pads?",
      },
      {
        q: "Live 12 adds…",
        options: ["Global scale + transforms", "Just a metronome"],
        answer: 0,
        explain:
          "Live 12 introduced global scale settings, scale-aware MIDI transforms, and Push 3 scale integration for a coherent workflow.",
        hint: "The most recent version added the most features — which is it?",
      },
    ],
  },
  {
    slug: "sound-similarity",
    world: "live12-power",
    number: 4,
    title: "Sound Similarity Search",
    tagline: "Find sounds that sound like this one.",
    xp: 60,
    badge: { slug: "ear-search", name: "Ear Search" },
    explainer: [
      {
        kind: "lead",
        text: "Live 12's browser can search your library by audio similarity. Drop a sample, click the similarity button, get sonically related sounds.",
      },
      {
        kind: "list",
        items: [
          "Works across user samples + factory packs.",
          "Combines with tag filters for fast narrowing.",
          "Great for finding replacements (a snappier kick, a darker pad).",
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        text: "Use similarity to break out of preset paralysis: start from one sample you like, surf outwards.",
      },
    ],
    sim: { type: "browser-tour" },
    quiz: [
      {
        q: "Similarity search compares…",
        options: ["Audio content", "File names", "BPM only"],
        answer: 0,
        explain:
          "Similarity Search (Live 12) analyzes audio characteristics — timbre, rhythm, key — and finds perceptually similar samples.",
        hint: "It compares sounds by listening — what is it comparing?",
      },
      {
        q: "It works on…",
        options: ["Library samples", "Only stems"],
        answer: 0,
        explain:
          "Similarity Search works on your Ableton library samples — it can't search external drives unless they're added to the browser.",
        hint: "Where are the samples it searches?",
      },
      {
        q: "Combine it with…",
        options: ["Tag filters", "Master volume"],
        answer: 0,
        explain:
          "Combine Similarity Search with tag filters (Kicks, BPM range, key) for highly targeted sound discovery without endless browsing.",
        hint: "Tags narrow results further — what else can you filter by?",
      },
    ],
  },
  {
    slug: "comping-flow",
    world: "live12-power",
    number: 5,
    title: "Comping Flow",
    tagline: "Take lanes → one perfect take.",
    xp: 80,
    badge: { slug: "comp-king-2", name: "Comp Pro" },
    explainer: [
      {
        kind: "lead",
        text: "Comping turns multiple takes into one composite performance. Live's Take Lanes show every pass underneath the clip; swipe across to choose the best bits.",
      },
      {
        kind: "list",
        items: [
          "Record loop → each pass becomes a Take Lane.",
          "Drag across lanes to select the winning region.",
          "Crossfade boundaries automatically.",
          "Works for vocals, guitars, drums, anything.",
        ],
      },
      {
        kind: "callout",
        tone: "key",
        text: "Comping rewards quantity. Sing 6 takes. Pick the best 2 seconds from each. That's the trick.",
      },
    ],
    sim: { type: "comp-lake" },
    quiz: [
      {
        q: "Take Lanes show…",
        options: ["Each pass as a row", "Only the final take"],
        answer: 0,
        explain:
          "Each recording loop creates a new take lane — a row showing that full pass — so you can see all takes stacked below the comp.",
        hint: "Multiple takes = multiple rows — what are those rows called?",
      },
      {
        q: "Comping crossfades are…",
        options: ["Automatic by default", "Manual only"],
        answer: 0,
        explain:
          "Live automatically crossfades between comp regions — you don't need to manually fade; clicks at edits are handled automatically.",
        hint: "Are crossfades at comp boundaries manual or automatic?",
      },
      {
        q: "Comping fits…",
        options: ["Any recorded source", "Vocals only"],
        answer: 0,
        explain:
          "Comping works on any recorded material — audio stems, MIDI performances, overdubs — whatever was recorded in Take Lanes.",
        hint: "Is there a limitation on what type of recorded content you can comp?",
      },
    ],
  },
  {
    slug: "groove-pool",
    world: "live12-power",
    number: 6,
    title: "Groove Pool",
    tagline: "Borrow the swing of any loop.",
    xp: 70,
    badge: { slug: "swing-thief", name: "Swing Thief" },
    explainer: [
      {
        kind: "lead",
        text: "Live's Groove Pool extracts the rhythm and dynamics of one clip and applies it to another. Make your MIDI drums swing like a sampled break.",
      },
      {
        kind: "list",
        items: [
          "Right-click an audio clip → Extract Groove.",
          "Drop the groove onto any other clip.",
          "Tune timing, random, velocity, base amounts.",
          "Commit to bake it permanently.",
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        text: "Extract grooves from records you love. Apply them to programmed drums. Instant human feel.",
      },
    ],
    sim: { type: "groove-extractor" },
    quiz: [
      {
        q: "Groove Pool extracts…",
        options: ["Timing + velocity feel", "Pitch", "Reverb"],
        answer: 0,
        explain:
          "Groove Pool extracts the timing and velocity feel from a reference clip — apply it to make other clips groove the same way.",
        hint: "What two musical qualities does Groove Pool extract?",
      },
      {
        q: "Grooves can be applied to…",
        options: ["Any clip", "Audio only"],
        answer: 0,
        explain:
          "Grooves extracted from Groove Pool can be dragged onto any clip in Session or Arrangement to apply the feel.",
        hint: "Where can you apply a groove once extracted?",
      },
      {
        q: "Commit makes the groove…",
        options: ["Permanent on the clip", "Reset"],
        answer: 0,
        explain:
          "Commit bakes the groove permanently into the clip's note timing — after commit, the groove is in the MIDI data, not a reference.",
        hint: "Commit = make permanent. What happens to the groove file reference?",
      },
    ],
  },
  {
    slug: "linked-track-editing",
    world: "live12-power",
    number: 7,
    title: "Linked-Track Editing",
    tagline: "Edit several tracks as one.",
    xp: 60,
    badge: { slug: "linked", name: "Linked Editor" },
    explainer: [
      {
        kind: "lead",
        text: "Select multiple tracks and link them — splits, moves and edits in one apply to all of them in lockstep. The classic 'edit drum stems together' workflow.",
      },
      {
        kind: "list",
        items: [
          "Shift-click tracks → Link Tracks.",
          "Now Razor / move / fade affects every linked track.",
          "Unlink any time.",
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        text: "Link your kick / snare / OH stems before doing edits — they'll always stay in phase.",
      },
    ],
    sim: { type: "arrangement" },
    quiz: [
      {
        q: "Linked editing means…",
        options: ["Same edits across multiple tracks", "Pinning a track"],
        answer: 0,
        explain:
          "Linked track editing lets you apply identical edits (split, trim, paste) across multiple tracks simultaneously — perfect for stems.",
        hint: "Linked means synchronized — what do the same edits apply to?",
      },
      {
        q: "Useful for…",
        options: ["Multi-track stems", "Mastering only"],
        answer: 0,
        explain:
          "Linked editing is invaluable for multi-mic drum recordings, stems, or any situation where tracks must stay perfectly aligned.",
        hint: "When would you need edits on multiple tracks to be identical?",
      },
      {
        q: "Linking is…",
        options: ["Toggleable", "Permanent"],
        answer: 0,
        explain:
          "Linked track editing can be toggled on or off per-track pair — hold Option/Alt and click to link or unlink tracks.",
        hint: "Can you turn linking on and off?",
      },
    ],
  },
  {
    slug: "push3-standalone",
    world: "live12-power",
    number: 8,
    title: "Push 3 Standalone",
    tagline: "Live's engine inside a piece of hardware.",
    xp: 80,
    badge: { slug: "untethered", name: "Untethered" },
    explainer: [
      {
        kind: "lead",
        text: "Push 3 Standalone runs the full Live audio engine on-device. No laptop, same Live, your sets travel with you.",
      },
      {
        kind: "list",
        items: [
          "USB-C audio I/O, battery option.",
          "Transfer sets via WiFi or USB drive.",
          "Same project opens identically in Live on a computer.",
        ],
      },
      {
        kind: "callout",
        tone: "key",
        text: "Standalone changes what 'finishing a track' means: you can write, mix and perform from the same box.",
      },
    ],
    sim: { type: "push3" },
    quiz: [
      {
        q: "Push 3 Standalone runs…",
        options: ["Live's engine on-device", "A separate DAW"],
        answer: 0,
        explain:
          "Push 3 Standalone contains Live's complete audio engine — record, produce, perform without a laptop on stage or in the field.",
        hint: "Standalone = no dependency on external hardware. What does it not need?",
      },
      {
        q: "Projects move between Push and Live…",
        options: ["Without conversion", "Through export only"],
        answer: 0,
        explain:
          "Push 3 Standalone projects open directly in Live on your computer and vice versa — they're the same file format with no conversion.",
        hint: "Is a conversion step needed to move between Push 3 and Live?",
      },
      {
        q: "Standalone needs a laptop?",
        options: ["No", "Yes"],
        answer: 0,
        explain:
          "Push 3 Standalone is entirely self-contained — battery or USB power, built-in audio interface, no laptop required at any point.",
        hint: "Standalone = self-sufficient. What external device doesn't it need?",
      },
    ],
  },
  {
    slug: "cpu-audio-setup",
    world: "live12-power",
    number: 9,
    title: "CPU & Audio Setup",
    tagline: "Buffers, freeze, flatten, multichannel.",
    xp: 60,
    badge: { slug: "engineer", name: "Engineer" },
    explainer: [
      {
        kind: "lead",
        text: "When CPU runs out, audio crackles. Learn the four levers: buffer size, freeze, flatten, and multichannel routing.",
      },
      {
        kind: "list",
        items: [
          "Buffer size — bigger = more CPU headroom, more latency.",
          "Freeze — render a track's output to disk temporarily.",
          "Flatten — bake the freeze in, free up devices.",
          "Multichannel — route external in/outs once, reuse everywhere.",
        ],
      },
      {
        kind: "callout",
        tone: "warn",
        text: "Freeze + Flatten is destructive on the track's devices — make a duplicate first if you might revisit.",
      },
    ],
    sim: { type: "buffer-sim" },
    quiz: [
      {
        q: "Bigger buffer = …",
        options: ["More CPU headroom, more latency", "Less of both"],
        answer: 0,
        explain:
          "Larger buffer = more samples processed per chunk = more time for the CPU = less crackling, but more delay between input and output.",
        hint: "Buffer size trades between two things — what are they?",
      },
      {
        q: "Flatten is…",
        options: ["Destructive on devices", "Non-destructive"],
        answer: 0,
        explain:
          "Flatten permanently renders a frozen track and removes its devices — you can't unfreeze or edit the original devices after.",
        hint: "Flatten is permanent — what does it remove from the track?",
      },
      {
        q: "Freeze writes to…",
        options: ["A temp audio file", "RAM only"],
        answer: 0,
        explain:
          "Freeze writes a temporary audio render to disk — Live reads from this file instead of recalculating devices in real-time.",
        hint: "What kind of file does Freeze create?",
      },
    ],
  },
  {
    slug: "accessibility-features",
    world: "live12-power",
    number: 10,
    title: "Accessibility in Live",
    tagline: "Screen reader, narrate, contrast, keyboard.",
    xp: 50,
    badge: { slug: "open-door", name: "Open Door" },
    explainer: [
      {
        kind: "lead",
        text: "Live 12 added formal accessibility support: screen reader, Speak Help, high-contrast and keyboard navigation across the main views.",
      },
      {
        kind: "list",
        items: [
          "Speak Help reads tooltips out loud.",
          "Screen reader exposes most controls.",
          "Keyboard nav covers Session, Arrangement, Browser, Devices.",
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        text: "Even sighted producers can use Speak Help as a fast 'what does this knob do' trick.",
      },
    ],
    sim: { type: "interface-tour" },
    quiz: [
      {
        q: "Speak Help reads…",
        options: ["Tooltips aloud", "Audio files"],
        answer: 0,
        explain:
          "Speak Help (Live 12 accessibility feature) reads tooltip text aloud using the system screen reader — enabled in Preferences.",
        hint: "It reads something aloud — what does it read?",
      },
      {
        q: "Live 12 adds…",
        options: ["Screen reader support", "Removes keyboard nav"],
        answer: 0,
        explain:
          "Live 12 introduced screen reader support, high-contrast mode, and keyboard navigation improvements for accessibility.",
        hint: "Which version added accessibility improvements?",
      },
      {
        q: "Accessibility is for…",
        options: ["Everyone", "Only blind users"],
        answer: 0,
        explain:
          "Accessibility features benefit everyone — keyboard shortcuts, high contrast, and screen reader support help all users work faster.",
        hint: "Are accessibility features only for users with disabilities?",
      },
    ],
  },
];

export const MISSIONS: Mission[] = [
  ...FOUNDATIONS_MISSIONS,
  ...DJ_WORLD_MISSIONS,
  ...SYNTHS_MISSIONS,
  ...w1,
  ...w2,
  ...w3,
  ...w4,
  ...w5,
  ...w6,
  ...wExtra,
  ...w7,
  ...w8,
];

export const missionsByWorld = (world: string) =>
  MISSIONS.filter((m) => m.world === world).sort((a, b) => a.number - b.number);

export const missionBySlug = (slug: string) => MISSIONS.find((m) => m.slug === slug);

export const nextMission = (slug: string) => {
  const i = MISSIONS.findIndex((m) => m.slug === slug);
  return i >= 0 && i < MISSIONS.length - 1 ? MISSIONS[i + 1] : null;
};

export const prevMission = (slug: string) => {
  const i = MISSIONS.findIndex((m) => m.slug === slug);
  return i > 0 ? MISSIONS[i - 1] : null;
};
