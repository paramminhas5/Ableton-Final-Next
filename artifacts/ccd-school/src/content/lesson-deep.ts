// Long-form lesson overlay. Two-track: beginner + advanced. Grounded in the
// Ableton Live 12 Reference Manual. The mission renderer reads `mode` and
// swaps `beginner` / `advanced` blocks. Quizzes are also mode-aware.
import type { LessonDeep } from "./types";
import { FOUNDATIONS_LESSONS } from "./lesson-deep-foundations";
import { SYNTHS_LESSONS } from "./lesson-deep-synths";
import { DJ_LESSONS } from "./lesson-deep-dj";

const src = (label: string, section: string) => ({ label, section });

export const LESSONS: Record<string, LessonDeep> = {
  ...FOUNDATIONS_LESSONS,
  ...SYNTHS_LESSONS,
  ...DJ_LESSONS,
  // ============ WORLD 1 — FIRST CONTACT ============
  "what-is-live": {
    hook: "Live is two DAWs in one window. The view you pick changes how you make music.",
    beginner: {
      what: [
        "A DAW is the program you record and mix music in. Most DAWs give you one timeline that runs left to right.",
        "Ableton Live gives you that timeline (Arrangement) AND a grid of clips you can trigger live (Session). Same song, two windows.",
        "Nothing you do here destroys your audio file. Warping, slicing, reversing — your original sample on disk is untouched.",
      ],
      why: [
        "Jam ideas in Session, then drag the result into Arrangement to finish the song.",
        "Switch views any time without stopping playback — the engine never resets.",
        "Try anything. The original file is always safe.",
      ],
      analogy:
        "Session is a sketchpad you can flip through. Arrangement is the final canvas. Same paint, different surface.",
    },
    advanced: {
      what: [
        "Live runs a single non-stop audio engine. Session and Arrangement are two views onto the same set of tracks; Tab swaps the view without interrupting playback.",
        "Edits are non-destructive: warp markers, fades, reversal, pitch and gain all live in the .als project file. The referenced sample on disk is never rewritten.",
        "Every track type (Audio, MIDI, Return, Group, Master) exists in both views simultaneously and shares its devices, mixer state and automation.",
      ],
      edgeCases: [
        "Saving a Set as .als does not embed samples — use File → Collect All and Save before moving the project.",
        "Some destructive actions (Consolidate, Freeze→Flatten) DO bake edits into a new file in Samples/Processed.",
      ],
      engineerNotes: [
        "Project sample rate follows the first audio file you import unless you override it in Preferences → Audio.",
        "Warp settings on a clip are stored alongside the .asd analysis file next to the source sample.",
      ],
    },
    mechanism:
      "One audio engine, two windows. Pressing Tab swaps the view; tracks, devices and clips remain identical underneath.",
    flow: "Browser → Track → Devices → Mixer → Master Out",
    walkthrough: [
      { do: "Press Tab.", listen: "Playback continues — same engine, different window." },
      {
        do: "Drag a sample from the browser onto a track.",
        listen: "It loops at the project tempo automatically (warping).",
      },
      {
        do: "Hit the square Stop button on the clip slot.",
        listen: "Clip stops; the file on disk is untouched.",
      },
    ],
    listenFor: [
      "Tempo never drifts when you Tab between views.",
      "Metronome stays locked regardless of view.",
      "Clips loop seamlessly — that's warping doing its job.",
    ],
    mistakes: [
      "Treating Session as a 'sketch' and Arrangement as the 'real' file. They're equal.",
      "Believing edits change the source file (they don't).",
      "Saving .als and emailing it without Collect All — the samples won't follow.",
    ],
    proMoves: [
      "Set a default template (File → Save Live Set As Template) with your favourite I/O and tracks.",
      "Use Capture MIDI — Live records what you just played even if you forgot to hit Record.",
    ],
    quizEasy: [
      {
        q: "What does DAW stand for?",
        options: ["Digital Audio Workstation", "Dynamic Audio Window", "Drum Audio Wave"],
        answer: 0,
      },
      {
        q: "Which key swaps Session and Arrangement view?",
        options: ["Tab", "Space", "Enter"],
        answer: 0,
      },
      {
        q: "Does warping a sample change the original file on disk?",
        options: ["No", "Yes", "Only if you save"],
        answer: 0,
      },
    ],
    quizHard: [
      { q: "What file type is an Ableton project?", options: [".als", ".alp", ".adv"], answer: 0 },
      {
        q: "Which command bundles your samples with the project?",
        options: ["File → Collect All and Save", "File → Export Audio", "File → Save As"],
        answer: 0,
      },
      {
        q: "Where does Live store warp analysis?",
        options: [".asd file next to the sample", "Inside the .als", "In ~/Library"],
        answer: 0,
      },
      {
        q: "Which action DOES write a new audio file on disk?",
        options: ["Consolidate", "Warp marker drag", "Reverse"],
        answer: 0,
      },
      {
        q: "What sets the project sample rate by default?",
        options: ["First imported audio file", "Operating system", "Preferences only"],
        answer: 0,
      },
    ],
    sources: [
      src("Welcome to Live — concepts", "Live 12 Manual §1"),
      src("Live's Interface", "Live 12 Manual §3"),
    ],
  },

  "interface-tour": {
    hook: "Eight regions. Learn them once, never get lost again.",
    beginner: {
      what: [
        "Live's window has eight main regions: Browser (left), Main view (centre — Session or Arrangement), Detail view (bottom — clip or device editor), Transport (top), Help bar (very bottom), and the right-hand groove pool.",
        "Most beginners only ever look at two: Main view and Detail view. That's normal.",
      ],
      why: [
        "Knowing where things live makes every tutorial 10x faster.",
        "You stop hunting for buttons and start making music.",
      ],
      analogy:
        "Like learning a new car: once you know where the wipers are, you never think about it again.",
    },
    advanced: {
      what: [
        "The interface is divided into Main View (Session/Arrangement), Detail View (Clip/Device), Browser, Info View, Help View, Groove Pool, Transport, and the I/O strips inside the mixer.",
        "Every region can be hidden via the small triangles or the View menu — F11 toggles full-screen, Cmd/Ctrl+Alt+L locks the layout.",
      ],
      edgeCases: [
        "On small screens, hide the Browser and Info View; Detail View is the one you actually need.",
        "Push 3 mirrors Detail View — the device shown on the controller is the device focused on screen.",
      ],
      engineerNotes: [
        "Cmd+Alt+L is essential for reclaimimg screen real estate on single-monitor setups by instantly clearing the Detail View.",
        "Pro workflows rely on Info View during complex routing to verify signal flow without opening the manual.",
        "Toggling between Session and Arrangement with Tab is the fastest way to bridge sketchpad ideas into a linear timeline.",
      ],
    },
    mechanism:
      "Each region is a panel that can be shown or hidden. The triangle handles let you collapse anything to reclaim space.",
    flow: "Browser → Main View → Detail View → Mixer → Master",
    walkthrough: [
      {
        do: "Click the bottom-left triangle to hide the Browser.",
        listen: "Main view widens — more room to work.",
      },
      {
        do: "Click the bottom-right triangle to show Info View.",
        listen: "Hover anything — a description appears.",
      },
      { do: "Press Tab.", listen: "Main view swaps Session ↔ Arrangement." },
    ],
    listenFor: ["Nothing — this lesson is visual."],
    mistakes: [
      "Working with every panel open on a 13\" laptop. Hide what you don't need.",
      "Missing the Info View when stuck — it explains every control on hover.",
    ],
    proMoves: [
      "Cmd/Ctrl+Alt+L locks all panel sizes so you don't nudge them by accident.",
      "Right-click any device header → Group to clean up Detail View.",
    ],
    quizEasy: [
      { q: "Where is the Browser?", options: ["Left side", "Right side", "Top"], answer: 0 },
      {
        q: "What does Tab do?",
        options: ["Switches Session ↔ Arrangement", "Plays", "Records"],
        answer: 0,
      },
      {
        q: "Which panel explains a control on hover?",
        options: ["Info View", "Help View", "Browser"],
        answer: 0,
      },
    ],
    quizHard: [
      {
        q: "Shortcut to lock the panel layout?",
        options: ["Cmd/Ctrl+Alt+L", "Cmd/Ctrl+L", "Cmd/Ctrl+Shift+L"],
        answer: 0,
      },
      {
        q: "Detail View shows which two editors?",
        options: ["Clip and Device", "Track and Mixer", "Browser and Help"],
        answer: 0,
      },
      {
        q: "Which region holds Return tracks?",
        options: ["Mixer (right of regular tracks)", "Browser", "Detail View"],
        answer: 0,
      },
      {
        q: "F11 does what?",
        options: ["Toggle full-screen", "Open Preferences", "Reset window"],
        answer: 0,
      },
      {
        q: "Push 3's screen mirrors which Live panel?",
        options: ["Detail View (device)", "Browser", "Arrangement"],
        answer: 0,
      },
    ],
    sources: [src("Live's Interface", "Live 12 Manual §3"), src("Push", "Live 12 Manual §32")],
  },

  browser: {
    hook: "Sounds, samples, presets, your own files — all one drag away.",
    beginner: {
      what: [
        "The Browser (left side) is your library. Sounds, Drums, Instruments, Audio Effects, MIDI Effects, Samples, and your own folders all live here.",
        "Click anything once → preview it. Drag it onto a track → it's in your song.",
      ],
      why: [
        "You stop hunting through Finder and start auditioning sounds in seconds.",
        "Adding your own folders means your whole sample library is one click away.",
      ],
      analogy: "Like a record crate that auto-plays the needle the moment you touch a sleeve.",
    },
    advanced: {
      what: [
        "The Browser is split into Collections (colour tags), Categories (Sounds, Drums, Instruments, etc.), Places (Packs, User Library, project folders, added paths), and search.",
        "Hot-Swap mode (the orange ⇄ icon on a device or sample slot) ties Browser navigation directly to the slot — arrow keys audition replacements live.",
      ],
      edgeCases: [
        "Live indexes added folders in the background; very large libraries can take minutes to appear in search.",
        "Preview tab is post-fader — the level slider in the bottom-left controls audition volume only.",
      ],
      engineerNotes: [
        "Hot-swap mode is the fastest way to audition textures in context without breaking the creative flow or losing device settings.",
        "Limit Collections to high-frequency utility tools like utility, EQ Eight, and sidechain presets to bypass deep folder diving.",
        "Indexing external sample SSDs under Places prevents the User Library from becoming a bloated, unsearchable dumping ground.",
      ],
    },
    mechanism:
      "Browser → Preview engine → Drag target. Selecting a file streams it through Live's preview bus; dragging copies a reference into your set.",
    flow: "Browser → Preview Bus → Drag Target (Track or Slot)",
    walkthrough: [
      { do: "Click any audio file in Samples.", listen: "It previews in tempo with your set." },
      {
        do: "Drag it onto an empty track.",
        listen: "A clip appears, warped to the project tempo.",
      },
      {
        do: "Click the orange ⇄ on a Drum Rack pad, then arrow up/down.",
        listen: "The pad swaps samples live.",
      },
    ],
    listenFor: [
      "Preview locks to your project BPM automatically.",
      "Hot-swap auditions through the device, including its FX.",
    ],
    mistakes: [
      "Forgetting to click the headphone icon — preview is muted.",
      "Dragging a single hit onto a MIDI track (you want a Simpler instead — drag onto a MIDI track and Live offers it).",
    ],
    proMoves: [
      "Cmd/Ctrl+F focuses the Browser search instantly.",
      "Right-click → Add Folder to Browser to expose your own sample library.",
    ],
    quizEasy: [
      {
        q: "How do you preview a sample?",
        options: ["Click it once", "Drag it", "Double-click"],
        answer: 0,
      },
      {
        q: "Where do your own folders live?",
        options: ["Places", "Sounds", "Categories"],
        answer: 0,
      },
      {
        q: "What's hot-swap?",
        options: ["Swap a sound while keeping the slot", "Save preset", "Export"],
        answer: 0,
      },
    ],
    quizHard: [
      {
        q: "Browser search shortcut?",
        options: ["Cmd/Ctrl+F", "Cmd/Ctrl+B", "Cmd/Ctrl+S"],
        answer: 0,
      },
      {
        q: "Which icon enables hot-swap?",
        options: ["Orange ⇄", "Green play", "Red dot"],
        answer: 0,
      },
      {
        q: "Preview level affects the master?",
        options: ["No, audition only", "Yes", "Only if you arm"],
        answer: 0,
      },
      {
        q: "Where do user-tagged colours live?",
        options: ["Collections", "Places", "Categories"],
        answer: 0,
      },
      {
        q: "How do you add a folder?",
        options: ["Right-click Places → Add Folder", "File → Import", "Drag to Master"],
        answer: 0,
      },
    ],
    sources: [src("Browser", "Live 12 Manual §5"), src("Library", "Live 12 Manual §6")],
  },

  preferences: {
    hook: "Five settings done right = zero pain later.",
    beginner: {
      what: [
        "Open Preferences (Cmd/Ctrl+,). The five tabs you actually need: Audio (your interface and buffer size), Link/Tempo/MIDI (controllers), File/Folder (where samples live), Library (Packs), and Look/Feel (theme).",
        "Set your audio device first. If you hear no sound, this is almost always why.",
      ],
      why: [
        "A correct buffer size = no clicks, no latency surprises.",
        "Setting File/Folder once means new projects never sprawl across your drive.",
      ],
      analogy: "Like adjusting your seat and mirrors before driving. Five minutes saves an hour.",
    },
    advanced: {
      what: [
        "Audio tab: pick driver (CoreAudio/ASIO), in/out config, buffer size (start 256 samples), sample rate. Lower buffer = lower latency = more CPU.",
        "Link/Tempo/MIDI: enable Control Surface for your controller and toggle Track / Sync / Remote on each MIDI port.",
        "Record/Warp/Launch sets defaults for new clips — Default Warp Mode, Auto-Warp Long Samples, Quantize Recording.",
      ],
      edgeCases: [
        "On Apple Silicon, Rosetta-only plugins force Live into Rosetta mode — check About to confirm architecture.",
        "Two devices using the same MIDI port can cause feedback if both Track + Remote are enabled.",
      ],
      engineerNotes: [
        "ASIO or CoreAudio are mandatory for stable clocking and sub-10ms monitoring latency during recording sessions.",
        "A 256 sample buffer provides the ideal balance between responsive MIDI tracking and CPU headroom for heavy plugin chains.",
        "Setting 'Complex' as the default Warp mode prevents unwanted artifacts when dragging loops with varying tempos into a project.",
      ],
    },
    mechanism:
      "Preferences are global — they persist across all projects unless overridden inside the .als (e.g. tempo, time signature).",
    flow: "User → Preferences → Live Engine → Project",
    walkthrough: [
      {
        do: "Cmd/Ctrl+, → Audio → pick your interface.",
        listen: "Test Tone confirms output works.",
      },
      { do: "Set Buffer Size to 256.", listen: "Latency display drops below 10 ms." },
      {
        do: "Link/Tempo/MIDI → enable Control Surface for your controller.",
        listen: "Pads light up and respond.",
      },
    ],
    listenFor: ["Test tone plays cleanly with no clicks or distortion."],
    mistakes: [
      "Buffer too low (32) = crackles. Too high (2048) = laggy keys.",
      "Forgetting to enable Track on the MIDI input port — controller does nothing.",
    ],
    proMoves: [
      "Save a template after configuring (File → Save Live Set As Template).",
      "Use 'Reduced Latency When Monitoring' for live recording sessions.",
    ],
    quizEasy: [
      {
        q: "Shortcut for Preferences?",
        options: ["Cmd/Ctrl+,", "Cmd/Ctrl+P", "Cmd/Ctrl+;"],
        answer: 0,
      },
      {
        q: "Which tab picks your audio interface?",
        options: ["Audio", "MIDI", "Library"],
        answer: 0,
      },
      { q: "What's a good starting buffer size?", options: ["256", "32", "2048"], answer: 0 },
    ],
    quizHard: [
      {
        q: "Lower buffer size means…",
        options: ["Lower latency, more CPU", "Higher latency, less CPU", "No effect"],
        answer: 0,
      },
      {
        q: "Default Warp Mode is set in which tab?",
        options: ["Record/Warp/Launch", "Audio", "Library"],
        answer: 0,
      },
      {
        q: "MIDI port option needed for a controller to play notes?",
        options: ["Track", "Sync", "Remote"],
        answer: 0,
      },
      {
        q: "Reduced Latency When Monitoring is for…",
        options: ["Live recording", "Mixing", "Mastering"],
        answer: 0,
      },
      {
        q: "Where do template settings save?",
        options: ["File → Save Live Set As Template", "Preferences", "Library"],
        answer: 0,
      },
    ],
    sources: [src("Preferences", "Live 12 Manual §28"), src("Audio I/O", "Live 12 Manual §10")],
  },

  "files-projects": {
    hook: "Live Sets, Projects, Packs — three layers that keep your work portable.",
    beginner: {
      what: [
        "A Live Set is one .als file = your song. A Project is the folder around it that holds the .als plus its samples and presets. A Pack (.alp) is a bundle Ableton (or you) ship to share content.",
        "Always save a song into its own Project folder. File → Collect All and Save copies every used sample inside it so you can move the folder anywhere.",
      ],
      why: [
        "Email a Project folder to a friend — they open it and everything works.",
        "Lose nothing when you switch laptops or back up your drive.",
      ],
      analogy: "The .als is a recipe. The Project folder is the box of ingredients next to it.",
    },
    advanced: {
      what: [
        "A Project is any folder containing an Ableton Project Info subfolder. Live tracks all .als files inside it as belonging to that Project and resolves sample paths relative to it first.",
        "Collect All and Save offers granular control: collect from User Library, Factory Packs, Other Project Folders, separately. Use it before archiving.",
      ],
      edgeCases: [
        "Renaming a Project folder in Finder is safe — Live re-resolves paths on next open.",
        "Two .als files in the same Project share the Samples folder. Deleting one's clip can leave orphans — use 'Manage Project' to clean up.",
      ],
      engineerNotes: [
        "Prioritize Collect All and Save before moving projects to prevent broken sample links when external drives aren't mounted.",
        "House multiple .als versions in one Project folder to share a single Samples subfolder and save massive amounts of disk space.",
        "Deeply vet the 'Other Project Folders' toggle during collection to avoid duplicating gigabytes of shared library content unnecessarily.",
      ],
    },
    mechanism:
      "Live → reads .als → resolves sample paths (Project first, then User Library, then absolute path, then last-known location).",
    flow: ".als → Project Folder → Samples Folder → Sample on Disk",
    walkthrough: [
      {
        do: "File → Save → put it in a NEW folder named after your song.",
        listen: "Live creates the Project structure.",
      },
      {
        do: "File → Collect All and Save → tick all sources.",
        listen: "Status bar shows files copying.",
      },
      {
        do: "File → Manage Files → Manage Project.",
        listen: "Lists every sample, missing or unused.",
      },
    ],
    listenFor: ["Status bar reports 'X files collected'."],
    mistakes: [
      "Saving every song into one giant folder — paths break when you move things.",
      "Forgetting Collect All before sending a project to a collaborator.",
    ],
    proMoves: [
      "Use 'Pack as Live Pack' to create a single .alp distributable.",
      "Manage Project shows orphan samples — delete to slim the folder.",
    ],
    quizEasy: [
      {
        q: "What's a .als?",
        options: ["A Live Set (one song)", "A sample", "A preset"],
        answer: 0,
      },
      {
        q: "Which command bundles samples?",
        options: ["Collect All and Save", "Export Audio", "Save As"],
        answer: 0,
      },
      { q: "What's a .alp?", options: ["A Live Pack", "A Live Set", "An audio file"], answer: 0 },
    ],
    quizHard: [
      {
        q: "What makes a folder a 'Project'?",
        options: ["Ableton Project Info subfolder", "Name", "Location"],
        answer: 0,
      },
      {
        q: "Path resolution order starts where?",
        options: ["Project folder", "User Library", "Absolute path"],
        answer: 0,
      },
      {
        q: "Which tool lists missing samples?",
        options: ["Manage Project", "Collect All", "Export"],
        answer: 0,
      },
      {
        q: "Renaming the Project folder in Finder…",
        options: ["Is safe — Live re-resolves", "Breaks everything", "Loses warp data"],
        answer: 0,
      },
      {
        q: "How do you ship a project as one file?",
        options: ["Pack as Live Pack", "Zip the .als", "Export Audio"],
        answer: 0,
      },
    ],
    sources: [src("Managing Files and Sets", "Live 12 Manual §7")],
  },

  // ============ WORLD 2 — TWO VIEWS ============
  "session-view": {
    hook: "A grid you play like an instrument. No timeline required.",
    beginner: {
      what: [
        "Session View is a grid: tracks across the top, scenes down the side. Each cell holds a clip — a loop of audio or MIDI you can launch any time.",
        "Press a clip's play triangle → it loops. Press another clip on the same track → the first stops, the second starts. Press a Scene → every clip on that row launches together.",
      ],
      why: [
        "Jam ideas live without committing to a timeline.",
        "Swap an intro for a chorus mid-performance with one click.",
      ],
      analogy: "Like a launchpad of LEGO blocks. Snap them together in any order, see what fits.",
    },
    advanced: {
      what: [
        "Session View clips are launched according to their Launch Mode (Trigger, Gate, Toggle, Repeat) and Quantization (Global Quantize default 1 bar). Stop slots, follow actions, and Legato all live on the clip launch panel.",
        "The Scene row at the right edge launches every column simultaneously — and can carry tempo and time-signature changes for the whole song.",
      ],
      edgeCases: [
        "If Global Quantize is None, clips launch instantly — useful for jamming, terrible for tight DJ sets.",
        "Follow Actions can chain clips into generative sequences without touching MIDI.",
      ],
      engineerNotes: [
        "Use Legato mode during live takes to preserve the playhead position when jumping between chopped variations of the same vocal or loop.",
        "Hardcode tempo and time signatures into Scene names to automate complex song transitions without touching the master transport.",
        "Disable individual clip Stop Buttons to allow specific textures or pads to sustain while you cycle through different drum and bass scenes.",
      ],
    },
    mechanism:
      "Each clip slot is a launchable container. A scheduler reads Quantization, then triggers the clip on the next musical division.",
    flow: "Click → Quantize → Schedule → Clip Plays → Audio Engine",
    walkthrough: [
      {
        do: "Click any clip's triangle.",
        listen: "It launches on the next bar (default 1-bar quantize).",
      },
      {
        do: "Click a different clip on the same track.",
        listen: "First stops, second starts at the next bar.",
      },
      { do: "Click the Scene row triangle.", listen: "All clips in that row launch together." },
    ],
    listenFor: [
      "Launches snap to the bar — quantize is doing its job.",
      "Stop button (square) silences a track without killing the project.",
    ],
    mistakes: [
      "Setting Global Quantize to None and wondering why clips jump in mid-beat.",
      "Forgetting only one clip per track plays at a time.",
    ],
    proMoves: [
      "Right-click a clip → Set Launch Quantization for per-clip overrides.",
      "Use Follow Actions for evolving textures.",
    ],
    quizEasy: [
      {
        q: "What does a Scene row launch?",
        options: ["All clips in that row", "Just the first track", "All tracks ever"],
        answer: 0,
      },
      {
        q: "How many clips play per track at once?",
        options: ["One", "Unlimited", "Two"],
        answer: 0,
      },
      { q: "Default Global Quantize?", options: ["1 bar", "None", "1/16"], answer: 0 },
    ],
    quizHard: [
      {
        q: "Launch Mode 'Gate' means…",
        options: ["Plays only while button held", "Plays once", "Toggles on/off"],
        answer: 0,
      },
      {
        q: "Follow Actions live on which panel?",
        options: ["Clip launch panel", "Mixer", "Browser"],
        answer: 0,
      },
      {
        q: "Global Quantize None means…",
        options: ["Instant launch", "1-bar launch", "Off until reset"],
        answer: 0,
      },
      {
        q: "Legato launching does what?",
        options: ["Continues from same beat position", "Restarts from 1.1.1", "Loops in reverse"],
        answer: 0,
      },
      {
        q: "Scenes can change…",
        options: ["Tempo and time signature", "Buffer size", "Sample rate"],
        answer: 0,
      },
    ],
    sources: [src("Session View", "Live 12 Manual §8")],
  },

  "arrangement-view": {
    hook: "The timeline. Where ideas become a finished song.",
    beginner: {
      what: [
        "Arrangement View is the linear timeline — left to right, just like every other DAW. Clips, automation and edits live on tracks that play from start to finish.",
        "You can record straight into Arrangement, or record what you jam in Session and the result lands here as audio/MIDI clips.",
      ],
      why: [
        "Build the actual song: intro, verse, chorus, drop, outro.",
        "Edit precisely — chop, fade, automate every parameter to the millisecond.",
      ],
      analogy: "Session is brainstorming on sticky notes. Arrangement is the final essay.",
    },
    advanced: {
      what: [
        "Arrangement View shows tracks as horizontal lanes with clips, automation lanes, and modulation lanes. Locators, time signature changes, and arrangement loop all live on the scrub area.",
        "Recording from Session into Arrangement is one button: arm Arrangement Record (top transport). Live captures clip launches and any played material as Arrangement clips.",
      ],
      edgeCases: [
        "If Arrangement is playing, Session clips override Arrangement playback for that track until you click 'Back to Arrangement' (orange triangle).",
        "Consolidate (Cmd/Ctrl+J) bakes a selected range into a new audio clip — destructive in the sense it creates a new file but original clips remain.",
      ],
      engineerNotes: [
        "Commit your Session performance to Arrangement early to escape the loop-itis trap and see the song's structural flaws.",
        "Use locators with key mappings to jump between song sections instantly during complex tracking or mixing sessions.",
        "Automation in Arrangement is superior for long-form builds and transitions that span across multiple clip boundaries.",
      ],
    },
    mechanism:
      "Tracks → clips → automation/modulation lanes → mixer → master. Playhead reads left to right; loop brace can constrain playback.",
    flow: "Clips on Timeline → Track → Automation → Mixer → Master",
    walkthrough: [
      {
        do: "Hit Arrangement Record (top transport), then play.",
        listen: "Live records both played notes and launched Session clips.",
      },
      { do: "Drag the loop brace and click it on.", listen: "Playback loops within the brace." },
      {
        do: "Click 'Back to Arrangement' (orange triangle).",
        listen: "Arrangement clips resume control.",
      },
    ],
    listenFor: [
      "Arrangement and Session can be at odds — orange triangle tells you so.",
      "Loop brace lights orange when active.",
    ],
    mistakes: [
      "Forgetting Session clips override Arrangement until you click the orange triangle.",
      "Recording without arming the track — nothing captured.",
    ],
    proMoves: [
      "Cmd/Ctrl+L toggles loop. Cmd/Ctrl+E splits clips at the playhead.",
      "Use Locators (Create → Add Locator) to mark song sections; Arrow keys jump between them.",
    ],
    quizEasy: [
      {
        q: "Arrangement View runs…",
        options: ["Left to right", "In a grid", "Top to bottom"],
        answer: 0,
      },
      {
        q: "Big record button records into…",
        options: ["Arrangement", "Session", "Browser"],
        answer: 0,
      },
      {
        q: "Loop brace does what?",
        options: ["Loops a section", "Saves the file", "Mutes a track"],
        answer: 0,
      },
    ],
    quizHard: [
      {
        q: "Orange 'Back to Arrangement' means…",
        options: ["Session is overriding playback", "Arrangement is muted", "Master clipping"],
        answer: 0,
      },
      { q: "Cmd/Ctrl+J does…", options: ["Consolidate", "Loop", "Split"], answer: 0 },
      { q: "Cmd/Ctrl+E does…", options: ["Split at playhead", "Export", "Edit"], answer: 0 },
      {
        q: "Locators are added via…",
        options: ["Create → Add Locator", "File menu", "Right-click track"],
        answer: 0,
      },
      {
        q: "Recording Arrangement captures…",
        options: ["Played + launched Session clips", "Played only", "Launched only"],
        answer: 0,
      },
    ],
    sources: [src("Arrangement View", "Live 12 Manual §9")],
  },

  clips: {
    hook: "Every sound in Live lives in a clip. Master clips, master Live.",
    beginner: {
      what: [
        "A clip is a container for sound. Audio clips hold a sample; MIDI clips hold notes that play an instrument.",
        "Click a clip → its Detail View opens at the bottom: loop length, pitch, gain, warp, envelope.",
      ],
      why: [
        "Tweak any clip without touching the rest of the song.",
        "Loop a 1-bar clip into 32 bars without copying it 32 times.",
      ],
      analogy:
        "A clip is a Tupperware container. Same shape on the outside, totally different contents.",
    },
    advanced: {
      what: [
        "Clip properties: Start, End, Loop start/length, Position, Pitch, Gain, Transpose, Warp on/off, Warp Mode, Sample/Notes editor, Envelopes (Clip and unlinked).",
        "Clip envelopes let you draw modulation that's local to a clip — independent of track automation. Useful for variation per scene without duplicating tracks.",
      ],
      edgeCases: [
        "MIDI clips have no Warp Mode (they're notes, not audio).",
        "Setting Loop length below the clip Length truncates playback — easy to miss.",
      ],
      engineerNotes: [
        "MIDI clips store polyphonic sequencing and CC data, while Audio clips utilize Warp engines to decouple pitch from time in the Sample Editor.",
        "The Warp Mode (Beats, Texture, Complex Pro) defines how audio grain is reshaped; MIDI has no equivalent 'engine' as it triggers external sound.",
        "Unlinked Clip Envelopes allow for polyrhythmic modulation and parameter offsets that cycle independently of the clip's musical bar length.",
      ],
    },
    mechanism: "Clip → Sample/Notes → Warp/Quantize → Envelopes → Track → Mixer.",
    flow: "Sample → Clip → Track → Mixer → Master",
    walkthrough: [
      { do: "Double-click a clip.", listen: "Detail view shows the waveform / piano roll." },
      { do: "Drag the loop brace to make it shorter.", listen: "Clip loops at the new length." },
      {
        do: "Open Envelopes → choose Volume → draw a fade.",
        listen: "Clip volume rides the curve.",
      },
    ],
    listenFor: [
      "Loop length changes immediately repeat-trigger.",
      "Clip envelopes alter playback only inside the loop.",
    ],
    mistakes: [
      "Confusing clip Length with Loop length.",
      "Drawing track automation when you wanted a clip envelope (or vice versa).",
    ],
    proMoves: [
      "Right-click → Crop Sample to commit a trim destructively.",
      "Hold Shift while dragging loop brace to move it without resizing.",
    ],
    quizEasy: [
      {
        q: "What does a clip hold?",
        options: ["Audio or MIDI content", "Just audio", "Just MIDI"],
        answer: 0,
      },
      { q: "Where does Detail View open?", options: ["Bottom", "Top", "Right"], answer: 0 },
      {
        q: "Loop brace controls?",
        options: ["What part repeats", "Master volume", "Tempo"],
        answer: 0,
      },
    ],
    quizHard: [
      {
        q: "Clip Envelopes are independent of…",
        options: ["Track automation", "Clip Length", "Sample"],
        answer: 0,
      },
      { q: "MIDI clips have Warp Mode?", options: ["No", "Yes", "Only if drum"], answer: 0 },
      {
        q: "Crop Sample is…",
        options: ["Destructive trim", "Loop change", "Pitch shift"],
        answer: 0,
      },
      {
        q: "What's the difference between Length and Loop length?",
        options: [
          "Length is total content; Loop is the repeating section",
          "Same thing",
          "Length is for MIDI only",
        ],
        answer: 0,
      },
      {
        q: "Where do clip envelopes live?",
        options: ["Clip Detail View → Envelopes", "Mixer", "Master"],
        answer: 0,
      },
    ],
    sources: [src("Audio Clips", "Live 12 Manual §11"), src("MIDI Clips", "Live 12 Manual §12")],
  },

  tracks: {
    hook: "Tracks are lanes for sound. Pick the right type or fight Live forever.",
    beginner: {
      what: [
        "Audio tracks hold recorded or imported sound. MIDI tracks hold notes that play an instrument. Return tracks receive sends (reverb, delay). Group tracks bundle other tracks. Master is the final output.",
        "Pick the wrong type and nothing works — a sample on a MIDI track is silent.",
      ],
      why: [
        "Right type = sound the first time.",
        "Groups and Returns keep your mix tidy when 30 tracks become 60.",
      ],
      analogy:
        "Tracks are highway lanes. Trucks (audio), motorbikes (MIDI), exit ramps (returns) — they all need their own lane.",
    },
    advanced: {
      what: [
        "Track types: Audio, MIDI, Return, Group (and nested Group), Master. Each has its own Mixer strip with In/Out routing, sends, pan, volume, meter, monitor mode (Audio only).",
        "Routing: any track can route into any other input/output combination, including specific points in another track's signal chain (post-FX, pre-FX). This is how sidechain inputs work.",
      ],
      edgeCases: [
        "Dragging a sample onto an empty area creates an Audio track. Dragging an instrument creates a MIDI track.",
        "Group tracks contain a hidden Master strip — automation on a Group affects all children.",
      ],
      engineerNotes: [
        "Use Return tracks for time-based effects to maintain phase coherence and control the wet/dry balance via a single fader.",
        "Route Group outputs into other Groups to create high-level bus processing hierarchies for complex drum or vocal stems.",
        "Patch sidechain inputs from Pre-FX points to ensure consistency even if you automate the volume or mute the source track.",
      ],
    },
    mechanism:
      "Each track is a signal pipeline: Input → Pre-FX → Devices → Post-FX → Sends → Mixer → Output.",
    flow: "Input → Devices → Mixer → Sends → Output",
    walkthrough: [
      { do: "Cmd/Ctrl+T → new Audio track.", listen: "Empty stereo lane appears." },
      {
        do: "Cmd/Ctrl+Shift+T → new MIDI track.",
        listen: "Lane appears with no instrument — silent until you add one.",
      },
      {
        do: "Select two tracks → Cmd/Ctrl+G.",
        listen: "They group into a folder track with one fader.",
      },
    ],
    listenFor: [
      "Audio tracks meter on input even without arm; MIDI tracks meter only post-instrument.",
    ],
    mistakes: [
      "Putting a sample on a MIDI track (silence).",
      "Forgetting Group tracks have their own automation.",
    ],
    proMoves: [
      "Right-click any track header → Group / Ungroup.",
      "Use coloured tracks to visually section verses, choruses, drums, etc.",
    ],
    quizEasy: [
      { q: "Which track holds notes?", options: ["MIDI", "Audio", "Master"], answer: 0 },
      { q: "Which receives sends?", options: ["Return", "Audio", "MIDI"], answer: 0 },
      { q: "Group shortcut?", options: ["Cmd/Ctrl+G", "Cmd/Ctrl+T", "Cmd/Ctrl+R"], answer: 0 },
    ],
    quizHard: [
      {
        q: "New Audio track shortcut?",
        options: ["Cmd/Ctrl+T", "Cmd/Ctrl+Shift+T", "Cmd/Ctrl+R"],
        answer: 0,
      },
      {
        q: "MIDI track without instrument is…",
        options: ["Silent", "White noise", "Sine wave"],
        answer: 0,
      },
      {
        q: "Sidechain input uses what?",
        options: ["Track routing", "Sends only", "Master"],
        answer: 0,
      },
      {
        q: "Group tracks are…",
        options: ["Folders with own faders + automation", "Mute groups", "Just visual"],
        answer: 0,
      },
      {
        q: "Master track does what?",
        options: ["Final output stage", "Records audio", "Runs MIDI"],
        answer: 0,
      },
    ],
    sources: [src("Tracks and Inputs/Outputs", "Live 12 Manual §15")],
  },

  "scenes-follow": {
    hook: "A Scene launches a row. Follow Actions launch the future.",
    beginner: {
      what: [
        "A Scene is a row of clips you launch together — perfect for sections like 'Verse 1' or 'Drop'.",
        "Follow Actions tell a clip 'when you finish, jump here next'. Use them to chain clips into evolving patterns without touching MIDI.",
      ],
      why: [
        "Sections snap perfectly into place mid-jam.",
        "Generative loops keep moving without you clicking anything.",
      ],
      analogy:
        "Scenes are your set list. Follow Actions are an autopilot that knows the next song.",
    },
    advanced: {
      what: [
        "Scenes can store tempo and time-signature changes — write '128 BPM 4/4' or '90 BPM 6/8' in the Scene name and Live obeys.",
        "Follow Actions: Stop, Play Again, Previous, Next, First, Last, Any, Other, Jump. Two slots (A/B) with independent chance values let you build probabilistic chains.",
      ],
      edgeCases: [
        "Follow Actions only fire after a clip's Length elapses, not its Loop length.",
        "If Follow Action chance A and B both = 0, nothing happens.",
      ],
      engineerNotes: [
        "Hard-coding tempo and meter into scene names ensures complex transitions are sample-accurate and error-free during high-stakes live sets.",
        "Using 'Other' on a 99% probability loop creates subtle generative variation while maintaining the core rhythmic foundation of the track.",
        "Slot B probability allows for 'safety nets' where a clip usually loops but occasionally jumps to a breakdown for automated arrangement logic.",
      ],
    },
    mechanism:
      "Scene click → schedules every clip in row → Quantize → launch. Follow Action timer counts clip length → rolls dice → triggers next clip.",
    flow: "Scene → Schedule Row → Launch → Follow Action Timer → Next Clip",
    walkthrough: [
      { do: "Rename a Scene to '90 BPM'.", listen: "Tempo jumps when the scene launches." },
      {
        do: "Set a clip Follow Action to 'Next' with chance 1:0.",
        listen: "Clip auto-advances to the next slot when it finishes.",
      },
      {
        do: "Set both A=Other (1) and B=Stop (1).",
        listen: "50/50 between random clip and silence.",
      },
    ],
    listenFor: ["Tempo change at the bar boundary on scene launch."],
    mistakes: [
      "Naming a scene '120bpm' (no space) — Live ignores it.",
      "Setting Follow Action time longer than clip Length — clip restarts before action fires.",
    ],
    proMoves: [
      "Combine Follow Actions with Legato to keep grooves continuous.",
      "Scenes inherit colour from selected clips — colour-code sections.",
    ],
    quizEasy: [
      {
        q: "What does a Scene launch?",
        options: ["A whole row of clips", "One clip", "Master out"],
        answer: 0,
      },
      {
        q: "Follow Actions trigger…",
        options: ["The next clip", "The mixer", "A new project"],
        answer: 0,
      },
      {
        q: "Can a Scene change tempo?",
        options: ["Yes (rename it)", "No", "Only in Arrangement"],
        answer: 0,
      },
    ],
    quizHard: [
      {
        q: "Follow Actions fire after…",
        options: ["Clip Length elapses", "Loop length", "Bar"],
        answer: 0,
      },
      {
        q: "Two Follow Action slots are called…",
        options: ["A and B", "1 and 2", "X and Y"],
        answer: 0,
      },
      {
        q: "Scene name '128 6/8' does what?",
        options: ["Sets tempo and time sig", "Renames only", "Errors"],
        answer: 0,
      },
      {
        q: "Action 'Other' picks…",
        options: ["Any clip except current", "First clip", "Last clip"],
        answer: 0,
      },
      {
        q: "Legato launching means…",
        options: ["Continue at same beat position", "Restart at 1.1.1", "Loop reverse"],
        answer: 0,
      },
    ],
    sources: [src("Scenes & Follow Actions", "Live 12 Manual §8.2")],
  },

  // ============ WORLD 3 — MIDI & AUDIO ============
  "midi-piano-roll": {
    hook: "Notes on a grid. The most powerful editor in Live.",
    beginner: {
      what: [
        "MIDI is information about notes — pitch, length, velocity, position. The Piano Roll is where you draw, edit, and tweak them.",
        "Double-click a MIDI clip → grid appears. Pencil tool draws notes; Selection tool moves and resizes them.",
      ],
      why: [
        "Build a melody one note at a time — no instrument needed.",
        "Fix a wrong note, change velocity, transpose — without re-recording.",
      ],
      analogy: "MIDI is sheet music. The Piano Roll is the music stand where you write it.",
    },
    advanced: {
      what: [
        "Piano Roll shows pitch (vertical), time (horizontal), velocity (per-note bar at the bottom). Tools: Draw (B), Selection (default). Grid: 1/16 default, Cmd/Ctrl+1/2/3/4 to halve/double.",
        "Velocity, Chance, Velocity Range and Note Probability give per-note humanisation. Stacked editing across multiple clips lets you edit several patterns at once.",
      ],
      edgeCases: [
        "Notes shorter than one grid cell still trigger — useful for grace notes.",
        "Velocity 0 silences a note without removing it (still occupies its slot).",
      ],
      engineerNotes: [
        "Grid shortcuts are essential because fixed quantization provides the rhythmic backbone that prevents amateurish timing inconsistencies.",
        "Leveraging Randomize and Velocity Range controls is the fastest way to simulate organic human performance without manual clicking.",
        "Multi-clip editing ensures harmonic consistency by letting you align melodic leading tones against bass movements in a single view.",
      ],
    },
    mechanism: "MIDI clip → notes (pitch, time, velocity, length, chance) → instrument → audio.",
    flow: "MIDI Clip → Instrument → Audio Output",
    walkthrough: [
      {
        do: "Double-click a MIDI clip → press B → click the grid.",
        listen: "Note plays through the instrument.",
      },
      { do: "Drag a note's right edge.", listen: "Length changes — sustain changes accordingly." },
      {
        do: "Click the bottom velocity bar and drag.",
        listen: "Note gets quieter or louder per hit.",
      },
    ],
    listenFor: [
      "Velocity scales how hard the instrument is hit (most synths get brighter/louder).",
    ],
    mistakes: [
      "Drawing notes outside the loop brace — they never play.",
      "Forgetting to switch back to Selection tool after drawing.",
    ],
    proMoves: [
      "Cmd/Ctrl+U quantizes selected notes; Cmd/Ctrl+Shift+U opens Quantize Settings.",
      "Use Note Chance for probabilistic grooves.",
    ],
    quizEasy: [
      {
        q: "What does MIDI store?",
        options: ["Note information", "Audio waveform", "Reverb tail"],
        answer: 0,
      },
      { q: "Pencil tool shortcut?", options: ["B", "P", "D"], answer: 0 },
      { q: "Velocity controls…", options: ["How hard a note hits", "Pitch", "Length"], answer: 0 },
    ],
    quizHard: [
      {
        q: "Quantize selected shortcut?",
        options: ["Cmd/Ctrl+U", "Cmd/Ctrl+Q", "Cmd/Ctrl+Y"],
        answer: 0,
      },
      {
        q: "Note Chance does what?",
        options: ["Probability the note plays", "Pitch random", "Length random"],
        answer: 0,
      },
      { q: "Halve grid shortcut?", options: ["Cmd/Ctrl+1", "Cmd/Ctrl+G", "Cmd/Ctrl+/"], answer: 0 },
      {
        q: "Stacked editing means…",
        options: ["Edit multiple clips at once", "Layer instruments", "Stack notes"],
        answer: 0,
      },
      {
        q: "Velocity 0 does what?",
        options: ["Silences but keeps the note", "Removes the note", "Maxes velocity"],
        answer: 0,
      },
    ],
    sources: [src("MIDI Note Editor", "Live 12 Manual §12")],
  },

  "audio-clips": {
    hook: "Recorded sound, ready to bend to your will.",
    beginner: {
      what: [
        "An audio clip plays a sample (a recorded sound). You can chop it, fade it, transpose it, reverse it — without touching the file on disk.",
        "Click an audio clip → Sample Box opens at the bottom. Gain, Pitch, Warp, Loop, Envelopes — all live there.",
      ],
      why: [
        "Use any sample at any tempo, any pitch, any length.",
        "Edit fearlessly — original file is safe.",
      ],
      analogy:
        "Like Photoshop for sound. Layers, edits, transforms — the original photo is untouched.",
    },
    advanced: {
      what: [
        "Audio clip parameters: Start, End, Loop, Position, Gain, Transpose, Detune, Pitch envelope, Warp on/off, Warp Mode (Beats, Tones, Texture, Re-Pitch, Complex, Complex Pro), Warp Markers, Segment BPM.",
        "Reverse, Crop, Consolidate (Cmd/Ctrl+J), Slice to MIDI all live in the right-click menu.",
      ],
      edgeCases: [
        "Re-Pitch warp mode changes speed AND pitch together — like a vinyl pitch fader.",
        "Complex Pro is highest quality but heaviest CPU; commit it via Freeze + Flatten.",
      ],
      engineerNotes: [
        "Segment BPM is the reference anchor; mismatching this with clip tempo causes warping artifacts or unintended time-stretching.",
        "Complex Pro is the gold standard for polyphonic material, but Texture or Tones often preserve transients better on monophonic sources.",
        "Consolidate (Cmd+J) bakes in all Warp and Transpose settings to a new file, freeing CPU and locking in the timing for the arrangement.",
      ],
    },
    mechanism: "Sample → warp engine (per Mode) → gain/pitch → envelopes → track.",
    flow: "Sample → Warp → Gain/Pitch → Envelopes → Track Out",
    walkthrough: [
      { do: "Drop a one-bar drum loop.", listen: "Live warps it to project tempo." },
      { do: "Right-click → Reverse.", listen: "Plays backwards immediately." },
      { do: "Switch Warp Mode to Re-Pitch.", listen: "Tempo and pitch move together." },
    ],
    listenFor: [
      "Warp Mode changes the artefacts — Beats clicks at boundaries, Tones smears transients.",
      "Re-Pitch sounds like a slowed/sped tape.",
    ],
    mistakes: [
      "Warping a sample that doesn't need warping (a one-shot) — turn Warp off for cleaner playback.",
      "Using Beats mode on melodic content — sounds chunky.",
    ],
    proMoves: [
      "Right-click → Slice to New MIDI Track to chop transients into a Drum Rack.",
      "Use Saturator before/after Warp for added grit on Re-Pitch.",
    ],
    quizEasy: [
      { q: "What's a sample?", options: ["A recorded sound", "A note", "A device"], answer: 0 },
      {
        q: "Where do clip controls live?",
        options: ["Sample Box (Detail View)", "Mixer", "Browser"],
        answer: 0,
      },
      {
        q: "Editing a sample changes the original file?",
        options: ["No", "Yes", "Sometimes"],
        answer: 0,
      },
    ],
    quizHard: [
      {
        q: "Re-Pitch mode does what?",
        options: ["Changes speed and pitch together", "Only pitch", "Only speed"],
        answer: 0,
      },
      { q: "Highest quality warp mode?", options: ["Complex Pro", "Beats", "Tones"], answer: 0 },
      {
        q: "Slice to MIDI does what?",
        options: ["Chops transients into a Drum Rack", "Quantizes", "Reverses"],
        answer: 0,
      },
      {
        q: "Consolidate creates…",
        options: ["A new audio file from the selection", "MIDI", "Reverb"],
        answer: 0,
      },
      {
        q: "Best mode for melodic vocals?",
        options: ["Complex / Complex Pro", "Beats", "Re-Pitch"],
        answer: 0,
      },
    ],
    sources: [src("Audio Clips, Tempo and Warping", "Live 12 Manual §11")],
  },

  warping: {
    hook: "Warping locks any sample to your tempo. Without it, Live wouldn't be Live.",
    beginner: {
      what: [
        "Warping stretches a sample so it stays in time even when its original tempo doesn't match yours.",
        "Live places Warp Markers on the waveform. Drag a marker → that beat lines up with the grid.",
      ],
      why: [
        "Drop any sample at any tempo — it instantly fits.",
        "Mash up tracks at different BPMs without re-recording anything.",
      ],
      analogy: "Like rubber-banding a stretchy ruler so its inch marks line up with yours.",
    },
    advanced: {
      what: [
        "Warping is real-time time-stretching driven by warp markers \u2014 anchor points pinned to the audio's transients that tell Live how the file's timeline maps onto Live's beat grid. Move a marker and the audio between it and its neighbours stretches/compresses to match.",
        "Warp Modes choose the algorithm: Beats (transient-locked, best for drums and percussive material), Tones (pitched mono, good for vocals/bass), Texture (slow harmonic stuff), Re-Pitch (no stretch — playback speed and pitch change together, like vinyl), Complex (vocals + light music), Complex Pro (full mixes; CPU-heavy but the cleanest on stretched stems).",
        "Auto-Warp tries to detect the file's tempo and place markers automatically; for clean loops it's nearly always right, for live recordings you usually need to nudge a few markers. Warp is non-destructive \u2014 the source file never changes, only the warp metadata in the .asd sidecar.",
      ],
      edgeCases: [
        "Bad transient detection on smooth pads — switch to Tones or Complex.",
        "Re-Pitch ignores Warp Markers; it's a single global speed multiplier.",
      ],
      engineerNotes: [
        "Use Re-Pitch mode for drums whenever possible to preserve transient punch and avoid digital grain typical of time-stretching algorithms.",
        "Complex Pro is the industry standard for vocals because the Formant slider prevents the 'chipmunk' effect during significant stretching.",
        "Set the Beats mode loop envelope to 0 for percussive loops to instantly create tight, professional gating without extra plugins.",
      ],
    },
    mechanism:
      "Transient detection → Warp Markers placed on the waveform → playback engine stretches/compresses audio between markers to keep marker positions on the grid.",
    flow: "Sample → Transient Analysis → Warp Markers → Stretch Engine → Audio Out",
    walkthrough: [
      {
        do: "Drop a sample with a different BPM.",
        listen: "Live auto-warps; loop matches your tempo.",
      },
      { do: "Drag a Warp Marker on a kick to a downbeat.", listen: "That kick locks to the grid." },
      {
        do: "Switch Warp Mode Beats → Texture.",
        listen: "Smoother but smearier — different artefacts.",
      },
    ],
    listenFor: ["Transients stay sharp in Beats; smear in Texture; vinyl-pitch in Re-Pitch."],
    mistakes: [
      "Trusting auto-warp on noisy live recordings — always check downbeats by ear.",
      "Using Texture on drums — kicks sound mushy.",
    ],
    proMoves: [
      "Right-click marker → Warp From Here (Straight) for clean re-detection.",
      "Save Warp + crop sample for a permanent in-tempo asset.",
    ],
    quizEasy: [
      {
        q: "What does warping do?",
        options: ["Time-stretches a sample", "Reverses it", "Adds reverb"],
        answer: 0,
      },
      { q: "Default Warp Mode for drums?", options: ["Beats", "Tones", "Texture"], answer: 0 },
      {
        q: "Re-Pitch mode changes…",
        options: ["Speed AND pitch together", "Only pitch", "Only speed"],
        answer: 0,
      },
    ],
    quizHard: [
      {
        q: "Best mode for vocals?",
        options: ["Complex / Complex Pro", "Beats", "Re-Pitch"],
        answer: 0,
      },
      {
        q: "Texture mode is granular — best for…",
        options: ["Pads and atmospheres", "Drums", "Vocals"],
        answer: 0,
      },
      {
        q: "Warp Marker right-click 'Warp From Here (Straight)' does what?",
        options: ["Re-detects from that point linearly", "Reverses", "Quantizes"],
        answer: 0,
      },
      { q: "Auto-Warp analyses…", options: ["Transients", "Pitch", "Volume"], answer: 0 },
      { q: "Heaviest CPU warp mode?", options: ["Complex Pro", "Beats", "Re-Pitch"], answer: 0 },
    ],
    sources: [src("Tempo Control & Warping", "Live 12 Manual §11.3")],
  },

  "recording-audio": {
    hook: "Hit record. Capture sound. Don't fight the latency.",
    beginner: {
      what: [
        "Plug in a mic or instrument. On an audio track: set Audio From to your input, arm the track (red circle), hit Record.",
        "Set the buffer size low enough that monitoring feels instant (Preferences → Audio).",
      ],
      why: [
        "Capture vocals, guitar, anything live — straight into your song.",
        "No latency = you can perform comfortably.",
      ],
      analogy: "Like a tape recorder, but the tape is infinite and rewindable.",
    },
    advanced: {
      what: [
        "Recording into Live is just routing: arm a track, set its 'Audio From' to the right input, choose monitor mode (In to hear yourself live, Auto to mute when not recording, Off to never monitor), then hit the global Record. In Arrangement that prints to a new clip on the timeline; in Session it prints into whichever empty slot is selected.",
        "Take Lanes (Live 11+) keep every loop pass underneath the main track so you can comp later. Punch In/Out points let you record only between two timeline markers without overwriting the rest of the track.",
        "Latency matters when you're tracking live with software monitoring on \u2014 Preferences \u2192 Audio shows your round-trip latency. Below ~10 ms most performers don't notice; above that, switch to direct hardware monitoring on the interface and set Live's monitor to Off.",
      ],
      edgeCases: [
        "Monitor=In always passes input; Monitor=Auto only when armed and not playing back; Off mutes monitoring.",
        "Direct monitoring on the interface bypasses Live's latency completely — usually preferred for vocals.",
      ],
      engineerNotes: [
        "Always set monitoring to Off when using an interface's direct monitoring to prevent phase cancellation and latency-induced timing errors.",
        "Use Take Lanes for every vocal session to capture multiple passes without the clutter of creating new tracks for every attempt.",
        "Keep the Buffer Size at 128 samples or lower during tracking to minimize round-trip latency for performers using software monitoring.",
      ],
    },
    mechanism:
      "Input → Audio interface → Live input bus → Track Pre-FX → Track Devices → Mixer → Master + Disk write.",
    flow: "Mic → Interface → Track Input → Devices → Disk + Master",
    walkthrough: [
      { do: "Set Audio From → Ext. In 1.", listen: "Meter shows level even before arming." },
      { do: "Arm the track (red circle).", listen: "Monitor opens — you hear yourself with FX." },
      { do: "Hit Record → play.", listen: "Waveform appears as you record." },
    ],
    listenFor: ["Monitor delay should be under 10 ms at 256-sample buffer."],
    mistakes: [
      "Forgetting to arm — nothing recorded.",
      "Monitor=In during overdubs creates feedback if speakers are loud.",
    ],
    proMoves: [
      "Use Punch In/Out brackets in Arrangement to limit destructive overwrites.",
      "Resample the master into a new track for stem-style bounces.",
    ],
    quizEasy: [
      { q: "Red circle on a track is…", options: ["Arm for record", "Mute", "Solo"], answer: 0 },
      {
        q: "Monitor=In does what?",
        options: ["Always passes input", "Mutes input", "Only plays output"],
        answer: 0,
      },
      {
        q: "Where do you set the audio interface?",
        options: ["Preferences → Audio", "Mixer", "Browser"],
        answer: 0,
      },
    ],
    quizHard: [
      { q: "Default record bit depth?", options: ["32-bit float", "16-bit", "24-bit"], answer: 0 },
      {
        q: "Resampling input means…",
        options: ["Record from Live's master output", "Record external mic", "Bounce MIDI"],
        answer: 0,
      },
      {
        q: "Punch In/Out limits…",
        options: ["Where recording overwrites", "Sample rate", "Tempo"],
        answer: 0,
      },
      {
        q: "Direct monitoring lives where?",
        options: ["On the audio interface", "In Live", "In Preferences"],
        answer: 0,
      },
      { q: "Best buffer to start with?", options: ["256 samples", "32", "2048"], answer: 0 },
    ],
    sources: [src("Recording New Clips", "Live 12 Manual §17")],
  },

  comping: {
    hook: "Take 1 was great in the chorus. Take 4 nailed the verse. Comping = best of both.",
    beginner: {
      what: [
        "Comping lets you record multiple takes (a Take Lane per pass) then quickly assemble the best parts into one clean clip.",
        "Right-click an audio track → Show Take Lanes. Record several passes; highlight the winning regions; Live builds the comp.",
      ],
      why: ["Get a perfect vocal without one perfect take.", "Edit by ear instead of by waveform."],
      analogy: "Like editing a video — pick the best shot from each take, stitch into one cut.",
    },
    advanced: {
      what: [
        "Comping is the act of building one perfect take from many imperfect ones. Take Lanes (right-click a track header \u2192 Show Take Lanes) keep every recorded pass on its own lane underneath the main track, even after you've moved on to the next pass.",
        "To comp, drag across regions in any take lane \u2014 the highlighted segments pop up to the top (the 'comp') lane, replacing whatever was there. Crossfades between adopted segments are automatic, so you don't get clicks at the joins.",
        "It works for both audio and MIDI, which means the same workflow applies to vocals, guitars, MPE keyboard performances and drum-pad playing. The destructive 'pick the best take' workflow from older DAWs is unnecessary \u2014 the source lanes always remain editable.",
      ],
      edgeCases: [
        "Take Lanes also work with MIDI — multiple performance passes can be comped.",
        "Consolidate the comp before export to bake it into a single audio file.",
      ],
      engineerNotes: [
        "Switching to Draw Mode (B) allows one-click comping, letting you audition and select phrases at the speed of thought during playback.",
        "Keeping Take Lanes visible across grouped drum tracks ensures phase-locked edits when comping multi-mic kit recordings.",
        "Nondestructive take lanes allow you to maintain performance energy by focus-shifting to small timing adjustments without losing the raw file.",
      ],
    },
    mechanism:
      "Each pass → Take Lane. Selection on a lane → promoted to main. Live auto-crossfades at boundaries.",
    flow: "Pass 1, 2, 3, 4 → Take Lanes → Selection → Main Lane Comp",
    walkthrough: [
      {
        do: "Right-click track → Show Take Lanes. Loop a 4-bar section. Hit Record 4x.",
        listen: "Each pass lands on its own lane.",
      },
      { do: "Highlight the winning region on Take 1.", listen: "It promotes to the main lane." },
      { do: "Repeat across takes.", listen: "Final comp plays as one seamless take." },
    ],
    listenFor: ["Crossfades hide the joins — listen for any clicks (extend the fade if needed)."],
    mistakes: [
      "Forgetting to enable Show Take Lanes — passes overwrite each other.",
      "Comping by waveform instead of by ear.",
    ],
    proMoves: [
      "Loop record continuously — every loop pass becomes a new take automatically.",
      "Consolidate the comp before final export.",
    ],
    quizEasy: [
      {
        q: "What is comping?",
        options: ["Assembling the best parts of multiple takes", "Compressing", "Composing MIDI"],
        answer: 0,
      },
      {
        q: "Take Lanes appear…",
        options: ["Under the main track lane", "On Master", "In Browser"],
        answer: 0,
      },
      {
        q: "How do you reveal Take Lanes?",
        options: ["Right-click track → Show Take Lanes", "Cmd+T", "Mixer button"],
        answer: 0,
      },
    ],
    quizHard: [
      { q: "Comping works on MIDI too?", options: ["Yes", "No", "Only with Push"], answer: 0 },
      {
        q: "Boundary crossfades are…",
        options: ["Added automatically", "Manual only", "Disabled"],
        answer: 0,
      },
      {
        q: "Loop record + Take Lanes captures…",
        options: ["A new take per loop pass", "Overwrites each pass", "One pass only"],
        answer: 0,
      },
      {
        q: "Consolidating the comp…",
        options: ["Bakes it into a single audio file", "Reverses it", "Quantizes"],
        answer: 0,
      },
      {
        q: "Promoting a region means…",
        options: ["Send it to the main lane", "Mute it", "Delete it"],
        answer: 0,
      },
    ],
    sources: [src("Take Lanes & Comping", "Live 12 Manual §17.5")],
  },

  slicing: {
    hook: "Turn any loop into a playable instrument in two clicks.",
    beginner: {
      what: [
        "Right-click an audio clip → Slice to New MIDI Track. Live cuts the sample at every transient and assigns each slice to a Drum Rack pad.",
        "Now you can replay the loop in any order — make new beats from old breaks.",
      ],
      why: [
        "Re-arrange a break beat without re-recording.",
        "Trigger any slice from MIDI — including Push pads.",
      ],
      analogy: "Like ripping a sandwich into bites and rebuilding it any way you like.",
    },
    advanced: {
      what: [
        "Slice to New MIDI Track analyses an audio clip's transients and chops it into one slice per transient. Live then drops those slices into a Drum Rack with an auto-generated MIDI clip that triggers each slice in order \u2014 you've effectively turned a loop into a kit.",
        "Slice modes vary by source: 'Transients' uses Live's onset detector (sensitivity is adjustable in the clip), 'Beat Divisions' slices on a fixed grid (1/16, 1/8 etc.) regardless of audio content, 'Regions' uses warp markers, and 'Manual' lets you place every slice by hand. Pick by source: drums = transients, melodic = beat divisions or manual.",
        "Once sliced, the loop is a playable instrument — re-sequence slices for new patterns, swap individual pads, layer effects per slice, or use the generated MIDI as a rhythmic seed for new chord progressions.",
      ],
      edgeCases: [
        "Very dense source material → 100+ slices = unwieldy. Pre-cut by Beat or quantize transients first.",
        "Pitching a slice changes its length unless you set the Simpler to Classic mode with Warp on.",
      ],
      engineerNotes: [
        "Slicing by transients on drums lets you isolate the exact snap of the attack without any dead air pre-roll.",
        "Manual slice points are essential for melodic loops to ensure long-tail release samples don't get choked prematurely.",
        "Swapping individual slice samples in the resulting Drum Rack is the fastest way to modernize dated or low-quality breakbeats.",
      ],
    },
    mechanism:
      "Transients (or chosen division) → cuts → each slice loaded into a Simpler → mapped chromatically into Drum Rack.",
    flow: "Audio → Transients → Slices → Drum Rack Pads → MIDI Trigger",
    walkthrough: [
      {
        do: "Right-click clip → Slice to New MIDI Track.",
        listen: "New track + Drum Rack appears.",
      },
      { do: "Play the new MIDI clip.", listen: "Same beat, but each pad now triggers a slice." },
      { do: "Re-arrange the MIDI notes.", listen: "Beat reorders without re-recording." },
    ],
    listenFor: [
      "Slice mode 1-Shot plays full slices regardless of MIDI note length.",
      "Velocity → Volume scaling per slice (default).",
    ],
    mistakes: [
      "Slicing a melodic loop by transient = clicky, weird boundaries — try by Beat instead.",
      "Forgetting each slice is a Simpler — full envelopes available per pad.",
    ],
    proMoves: [
      "Drag slices to other Drum Racks to build hybrid kits.",
      "Use Slice → Region to cut at custom boundaries.",
    ],
    quizEasy: [
      {
        q: "Slice to New MIDI Track creates…",
        options: ["A Drum Rack of slices", "A new song", "An export"],
        answer: 0,
      },
      {
        q: "Each slice becomes a…",
        options: ["Drum Rack pad", "Audio track", "Return"],
        answer: 0,
      },
      {
        q: "What can you do after slicing?",
        options: ["Re-trigger slices in any order", "Only play original", "Only reverse"],
        answer: 0,
      },
    ],
    quizHard: [
      {
        q: "Slice mode options include…",
        options: ["Transients, Warp Markers, Beat, Region", "Only transients", "Only beat"],
        answer: 0,
      },
      {
        q: "Each slice is loaded into…",
        options: ["A Simpler", "An Operator", "A Sampler"],
        answer: 0,
      },
      {
        q: "1-Shot mode means…",
        options: ["Plays full regardless of MIDI length", "Loops forever", "Reverses"],
        answer: 0,
      },
      {
        q: "Slicing 1000 transients gives you…",
        options: ["A bloated unmanageable rack", "Better quality", "Smaller file"],
        answer: 0,
      },
      {
        q: "Pitch a slice in 1-Shot mode → length…",
        options: ["Changes inversely", "Stays the same", "Reverses"],
        answer: 0,
      },
    ],
    sources: [src("Slicing to a New MIDI Track", "Live 12 Manual §11.6")],
  },

  // ============ WORLD 4 — DEVICES ============
  "instruments-overview": {
    hook: "Instruments turn MIDI into sound. Pick the right one and the song writes itself.",
    beginner: {
      what: [
        "An Instrument is a device that takes MIDI notes and outputs audio. Drop it on a MIDI track → play notes → hear sound.",
        "Live's headline instruments: Drum Rack (drums), Wavetable (synth), Operator (FM synth), Simpler/Sampler (samples), Analog/Tension/Electric (modelled), Meld and Drift (newer synths in Live 12).",
      ],
      why: [
        "Knowing what each one's good at saves hours of preset hunting.",
        "Right tool = right sound = right vibe.",
      ],
      analogy:
        "Like picking a guitar vs a piano vs a violin. Same notes, totally different feeling.",
    },
    advanced: {
      what: [
        "Live's built-in instrument lineup spans samplers (Simpler/Sampler/Drum Sampler), classic synthesis (Operator FM, Analog VA, Wavetable), drum tools (Drum Rack, Drum Synths), and Live 12 additions (Meld for MPE, Drift for analog-style, Granulator III for granular). Each lives under Categories \u2192 Instruments in the browser.",
        "The right pick depends on the role: sustained pads → Wavetable/Meld, plucks and bells → Operator, anything sample-based → Sampler/Simpler, drum kits → Drum Rack with Simpler chains, modular textures → Granulator III. Pros learn two or three deeply rather than dabbling in all of them.",
        "Every native instrument supports macros, modulation and (most) MPE, so the workflow you learn on one transfers directly to the next — opening a saved Wavetable preset and knowing instantly how to map a macro feels the same as doing it on Operator or Meld.",
      ],
      edgeCases: [
        "Simpler is single-zone; Sampler is multi-zone with key/velocity mapping — convert via right-click → Simpler↔Sampler.",
        "Drum Rack pads can host any device chain, not just Simplers.",
      ],
      engineerNotes: [
        "Stick to native instruments for ultra-low CPU overhead and seamless Macro mapping across complex Instrument Racks.",
        "Use Operator for percussive plucks because its linear FM and fixed frequency modes offer tighter transient control than wavetables.",
        "Leverage Meld or Wavetable for modern MPE sound design to ensure expressive polyphonic modulation without external hardware.",
      ],
    },
    mechanism: "MIDI notes → Instrument engine → audio → track FX → mixer.",
    flow: "MIDI → Instrument → Audio → FX → Mixer",
    walkthrough: [
      {
        do: "Drop Wavetable onto a MIDI track and play.",
        listen: "Default preset = a clean digital saw.",
      },
      { do: "Swap to Operator → Bass preset.", listen: "FM bass — tight, punchy." },
      { do: "Drop Drum Rack → drag a sample onto a pad.", listen: "Pad fires that sample." },
    ],
    listenFor: [
      "Wavetable: digital, evolving textures.",
      "Operator: FM bells, bass, evolving overtones.",
      "Drum Rack: percussive hits, one per pad.",
    ],
    mistakes: [
      "Using Wavetable for drums (works but inefficient).",
      "Loading Sampler when Simpler is enough.",
    ],
    proMoves: [
      "Hot-swap presets via the orange ⇄ — audition without committing.",
      "Combine instruments in an Instrument Rack with key splits.",
    ],
    quizEasy: [
      { q: "Instruments turn MIDI into…", options: ["Audio", "More MIDI", "Reverb"], answer: 0 },
      {
        q: "Drum Rack is for…",
        options: ["Drums (or any per-pad sound)", "Synth bass", "Vocal FX"],
        answer: 0,
      },
      {
        q: "Operator is what kind of synth?",
        options: ["FM", "Subtractive", "Granular"],
        answer: 0,
      },
    ],
    quizHard: [
      {
        q: "Sampler vs Simpler:",
        options: ["Sampler is multi-zone", "Identical", "Sampler is mono"],
        answer: 0,
      },
      {
        q: "New Live 12 synths include…",
        options: ["Meld and Drift", "Reaktor", "Massive"],
        answer: 0,
      },
      {
        q: "Drum Rack pads can host…",
        options: ["Any device chain", "Only Simpler", "Only audio FX"],
        answer: 0,
      },
      {
        q: "Wavetable's main sound source?",
        options: ["Wavetables", "Samples", "FM operators"],
        answer: 0,
      },
      { q: "Operator has how many operators?", options: ["4", "2", "8"], answer: 0 },
    ],
    sources: [src("Live's Instruments", "Live 12 Manual §24")],
  },

  "drum-rack": {
    hook: "16 pads. Infinite kits. The heart of Live's groove.",
    beginner: {
      what: [
        "Drum Rack is a container with up to 128 pads (you see 16 at a time). Drop any sample onto a pad → it plays from a MIDI note.",
        "Each pad has its own volume, pan, mute, solo, and own device chain — full FX per pad.",
      ],
      why: [
        "Build a custom kit in seconds.",
        "Process the kick separately from the snare without splitting tracks.",
      ],
      analogy:
        "Like a hardware drum machine — each pad is a sound, fully tweakable, all in one rack.",
    },
    advanced: {
      what: [
        "Drum Rack is a specialised Instrument Rack with a 4×4 pad grid (16 visible at a time, 128 total). Each pad is a chain holding one device — usually Simpler with a one-shot — that responds to a single MIDI note. Drag any sample onto any pad and Live builds the chain for you.",
        "Beyond samples, pads can hold full instruments and effect chains. That's how Drum Buss-style processing per pad works: each pad is its own mini mixer with sends to the Drum Rack's internal Return chains, so you can have a kick-only compressor and a snare-only reverb without leaving the rack.",
        "Choke groups silence one pad when another in the same group fires (open vs closed hi-hat is the textbook case). Combined with per-pad MIDI in/out routing, Drum Rack scales from sample player to full Push-driven kit with parallel processing and creative routing built in.",
      ],
      edgeCases: [
        "A pad shows the sample name; the Chain underneath can be much more complex than a single Simpler.",
        "Adding an audio FX rack inside a pad lets you have one chain per drum hit (parallel processing).",
      ],
      engineerNotes: [
        "Using internal Return chains keeps your session mixer clean while allowing parallel drum processing to move as a single preset file.",
        "Map selecting 'Sample Selector' to a Macro on Simpler to cycle through 128 kicks instantly without stopping the sequencer.",
        "Assigning Choke Groups to tonal 808s ensures clean low-end transitions by preventing overlapping sub-frequency tails.",
      ],
    },
    mechanism: "MIDI note → Drum Rack maps to pad → pad's Chain processes → audio out.",
    flow: "MIDI Note → Drum Rack Pad → Chain (Simpler + FX) → Out",
    walkthrough: [
      { do: "Drag a kick onto an empty pad.", listen: "Pad fires that kick." },
      { do: "Drop EQ Eight onto the pad's chain.", listen: "Only the kick is EQ'd." },
      {
        do: "Set pad 9 + pad 10 to Choke Group 1.",
        listen: "Open hat cuts off when closed hat hits.",
      },
    ],
    listenFor: ["Choke groups silence the previous pad immediately."],
    mistakes: [
      "Adding FX outside the Drum Rack when you wanted per-pad processing.",
      "Forgetting to assign Choke Group on hi-hat pairs.",
    ],
    proMoves: [
      "Drop a Drum Rack inside a Drum Rack pad — nested kits.",
      "Send each pad to a return for shared reverb.",
    ],
    quizEasy: [
      {
        q: "How many pads in a Drum Rack?",
        options: ["128 (16 visible)", "16 only", "8"],
        answer: 0,
      },
      { q: "Each pad has its own…", options: ["FX chain", "Master", "Tempo"], answer: 0 },
      {
        q: "Choke groups do what?",
        options: ["Cut each other off", "Mute all", "Reverse"],
        answer: 0,
      },
    ],
    quizHard: [
      {
        q: "Pad chains can host…",
        options: ["Any device", "Only Simpler", "Only audio FX"],
        answer: 0,
      },
      { q: "Default lowest pad note?", options: ["C1", "A0", "C3"], answer: 0 },
      {
        q: "Sending all pads to a Return is for…",
        options: ["Shared reverb / parallel processing", "Saving CPU", "Polyphony"],
        answer: 0,
      },
      {
        q: "Drum Rack inside a Drum Rack is…",
        options: ["Allowed (nested)", "Forbidden", "Crashes Live"],
        answer: 0,
      },
      { q: "Choke groups range…", options: ["1–16", "1–8", "Unlimited"], answer: 0 },
    ],
    sources: [src("Drum Racks", "Live 12 Manual §25")],
  },

  wavetable: {
    hook: "Two oscillators. Hundreds of waveforms. Endless evolving textures.",
    beginner: {
      what: [
        "Wavetable is a synth where each oscillator scans through a wavetable — a series of single-cycle waveforms morphed together.",
        "Move the Position knob → tone changes from one waveform to the next. Modulate it → things start to move.",
      ],
      why: [
        "Build evolving pads, leads, and basses without layering ten synths.",
        "Mod matrix turns small tweaks into big sound changes.",
      ],
      analogy: "Like flipping through a flipbook of waveforms while a note plays.",
    },
    advanced: {
      what: [
        "Wavetable is Live's flagship subtractive/wavetable hybrid. Each voice has two oscillators that scan through a 2D wavetable (a stack of single-cycle waveforms); moving the Position parameter sweeps from one waveform to the next, which is the source of Wavetable's signature evolving timbres. Sub osc, noise, FM and Classic/Modern unison modes round out the source stage.",
        "After the oscillators come two filters (Clean / OSR / MS2 / SMP — the second is the same modelled filters with their own resonance characters) routed in serial or parallel, plus dedicated effect slots for chorus, reverb-style ambience, drive and EQ inside the device. Modulation is handled by 3 envelopes, 2 LFOs and per-voice MPE inputs hitting a generous mod matrix.",
        "What makes it production-ready is how cleanly the macros expose the most musical destinations on the device front panel — load any preset and you can shape it dramatically without ever opening the matrix. Pros lean on it for both pads and basses because the same engine handles slow timbre morphs and tight FM growls.",
      ],
      edgeCases: [
        "Unison spread CPU rises with voice count — keep an eye on CPU meter.",
        "Effect modes change what Position does — FM mode treats Position as FM amount source.",
      ],
      engineerNotes: [
        "Use the Matrix to map LFOs to oscillator position for organic, evolving movements that static subtractive synths can't replicate.",
        "Toggle between Serial and Parallel filters to create complex vowel-like formants or split frequency processing within a single patch.",
        "Engage the Modern unison mode to maintain punchy transients on aggressive bass patches while adding thick stereophonic width.",
      ],
    },
    mechanism: "MIDI note → 2 osc scan tables (modulated by env/LFO) → filters → amp env → output.",
    flow: "MIDI → Osc1+Osc2 (Position) → Filters → Amp Env → Out",
    walkthrough: [
      { do: "Load Wavetable → default preset → hold a note.", listen: "Bright digital saw." },
      { do: "Modulate Position with LFO 1 (depth 50).", listen: "Tone sweeps cyclically." },
      { do: "Switch Effect to FM.", listen: "Tone gets metallic, bell-like." },
    ],
    listenFor: [
      "Position morph adds a sweep — like a filter, but on the source.",
      "FM Effect mode adds harmonic complexity instantly.",
    ],
    mistakes: [
      "Maxing Unison voices on a busy track — CPU spike.",
      "Forgetting the mod matrix exists — most expressive part of the synth.",
    ],
    proMoves: [
      "Modulate Position with the Mod Wheel for performable timbre.",
      "Stack Wavetable preset chains in an Instrument Rack with macro crossfades.",
    ],
    quizEasy: [
      {
        q: "Wavetable's Position knob does what?",
        options: ["Scans through wavetables", "Volume", "Tempo"],
        answer: 0,
      },
      { q: "How many oscillators?", options: ["2 (+ sub)", "4", "1"], answer: 0 },
      {
        q: "What is a modulator?",
        options: ["Source that changes a parameter over time", "Effect", "Sample"],
        answer: 0,
      },
    ],
    quizHard: [
      {
        q: "Effect modes include…",
        options: ["Classic, FM, PWM, Sync", "Only FM", "Only PWM"],
        answer: 0,
      },
      {
        q: "Mod matrix sources include…",
        options: ["LFO, Env, Velocity, Note, Random, Mod Wheel", "Only LFO", "Only Velocity"],
        answer: 0,
      },
      {
        q: "Filter routing options?",
        options: ["Serial / Parallel", "Serial only", "Parallel only"],
        answer: 0,
      },
      {
        q: "Unison voice count affects…",
        options: ["CPU significantly", "Tempo", "Sample rate"],
        answer: 0,
      },
      { q: "Wavetable was added in Live…", options: ["10", "9", "11"], answer: 0 },
    ],
    sources: [src("Wavetable", "Live 12 Manual §24.10")],
  },

  operator: {
    hook: "FM synthesis. Four operators. Bells, basses, brass — clean and digital.",
    beginner: {
      what: [
        "Operator is a 4-operator FM synth. FM = one oscillator modulates another's frequency, creating complex harmonics from simple sine waves.",
        "Drop it, pick a preset, play. Bass and bell sounds are what it does best.",
      ],
      why: [
        "FM bass cuts through any mix — clean and tight.",
        "Bells and metallic textures come effortlessly.",
      ],
      analogy:
        "Like four tuning forks that hit each other — the result is a complex chord from simple parts.",
    },
    advanced: {
      what: [
        "Operator is a four-oscillator FM synth. Each oscillator is called an operator (A, B, C, D). When one operator is wired to modulate another's frequency, it doesn't change the pitch you hear — it bends the receiver's waveform thousands of times a second, producing new harmonics. That's why simple sine waves can become bell-like or brassy.",
        "An algorithm decides who modulates whom and who actually reaches the speakers. Operators feeding the output are called carriers; operators feeding other operators are modulators. Operator ships eight algorithm layouts, plus a feedback loop on A that turns it from a sine into something approaching a saw, then noise as feedback climbs.",
        "Each operator carries its own envelope, level, waveform and frequency ratio (the ratio of its frequency to the played note). Around them sit a global filter, an LFO, a pitch envelope and per-operator velocity scaling — all shared with the whole patch, so changes there affect every note.",
      ],
      edgeCases: [
        "FM ratios determine timbre, not pitch — small ratio shifts = huge tone changes.",
        "Feedback on A turns sine into saw → noise as it climbs.",
      ],
      engineerNotes: [
        "Pitch ratios generate precise harmonic content, whereas fixed frequencies create the non-harmonic disharmonics needed for kick drums.",
        "Using the feedback loop on Operator A is the fastest way to add high-end grit without wasting a second modulator.",
        "Automating the level of your modulators is better than filter sweeps for creating organic, evolving movement in FM patches.",
      ],
    },
    mechanism:
      "Operator A modulates B modulates C → audible operator (carrier). Algorithm dictates the chain.",
    flow: "MIDI → Operators (per Algorithm) → Filter → LFO → Out",
    walkthrough: [
      { do: "Load Operator → Bass preset.", listen: "Tight FM bass." },
      { do: "Increase B's level.", listen: "Tone gets more harmonic / metallic." },
      { do: "Tweak B's coarse ratio.", listen: "Timbre changes dramatically — not pitch." },
    ],
    listenFor: ["Ratio changes shift timbre, not pitch."],
    mistakes: [
      "Tuning operators by ear instead of by ratio — get inharmonic results unintentionally.",
      "Pushing Feedback too high → noise.",
    ],
    proMoves: [
      "Use velocity to modulate operator levels for dynamic timbre.",
      "Transpose individual operators for chord-like timbres from one note.",
    ],
    quizEasy: [
      {
        q: "Operator is what kind of synth?",
        options: ["FM", "Subtractive", "Granular"],
        answer: 0,
      },
      { q: "How many operators?", options: ["4", "2", "8"], answer: 0 },
      {
        q: "FM is short for…",
        options: ["Frequency Modulation", "Filter Modulation", "Final Mix"],
        answer: 0,
      },
    ],
    quizHard: [
      {
        q: "Algorithms determine…",
        options: ["How operators modulate each other", "Filter type", "LFO speed"],
        answer: 0,
      },
      { q: "Feedback is on which operator?", options: ["A", "All", "D"], answer: 0 },
      {
        q: "Operators can be in fixed mode meaning…",
        options: ["Frequency in Hz, ignores note", "Always 440 Hz", "Always C"],
        answer: 0,
      },
      {
        q: "Coarse ratio affects…",
        options: ["Timbre via FM ratio", "Pitch only", "Volume"],
        answer: 0,
      },
      { q: "Number of algorithms?", options: ["8 (+ feedback variants)", "4", "16"], answer: 0 },
    ],
    sources: [src("Operator", "Live 12 Manual §24.7")],
  },

  "sampler-simpler": {
    hook: "Two samplers, two missions. Simpler for one shot. Sampler for symphonies.",
    beginner: {
      what: [
        "Simpler plays one sample mapped across the keyboard. Sampler is the big sibling: many samples mapped by key and velocity (multi-zone).",
        "Drag a sample onto a MIDI track → Live offers Simpler. For full instruments (sampled grand pianos etc.), use Sampler.",
      ],
      why: [
        "Build a one-shot synth-style instrument in 30 seconds (Simpler).",
        "Recreate a real instrument with multiple recordings (Sampler).",
      ],
      analogy: "Simpler is a Polaroid. Sampler is a photo album.",
    },
    advanced: {
      what: [
        "Simpler is a one-sample player with three modes. Classic loops the sample inside a normal ADSR envelope — best for sustained tones. 1-Shot ignores envelopes and note length entirely, playing the sample from start to finish — best for drum hits. Slicing chops the sample at warp markers or transients and maps each slice to a separate pad — best for breakbeats and chopped vocals.",
        "Sampler is the multi-zone version: a single instrument can hold dozens of samples mapped to different key and velocity ranges, so a soft hit triggers one recording and a loud hit triggers another. That's how sampled grand pianos and orchestral libraries are built.",
        "Sampler also exposes a full modulation matrix (three LFOs, multiple envelopes, MIDI sources) plus dedicated Pitch, Filter and MIDI tabs. You convert a Simpler into a Sampler at any time via right-click on the device header — a one-way upgrade that preserves the loaded sample.",
      ],
      edgeCases: [
        "Convert Simpler → Sampler via right-click on header → 'Simpler → Sampler' (one-way).",
        "Slicing mode in Simpler chops a sample into pads internally — alternative to Slice to New MIDI Track.",
      ],
      engineerNotes: [
        "Use 1-Shot mode for drum one-shots to ensure the tail plays out fully without needing to hold the MIDI note down.",
        "Right-click Simpler to Sampler to unlock the modulation matrix when you need complex LFO routing or FM synthesis on your samples.",
        "Stick to Slicing mode for breakbeats to instantly map transients to pads, avoiding the manual labor of cutting individual clips.",
      ],
    },
    mechanism:
      "MIDI note → look up zone (Sampler) or play sample (Simpler) → envelope/filter → out.",
    flow: "MIDI → Zone Lookup → Sample → Envelope/Filter → Out",
    walkthrough: [
      { do: "Drag a sample onto a MIDI track.", listen: "Simpler loads, Classic mode by default." },
      { do: "Switch to 1-Shot.", listen: "No envelopes — useful for drum hits." },
      {
        do: "Right-click → Simpler → Sampler.",
        listen: "Same sound, full multi-zone editor now available.",
      },
    ],
    listenFor: [
      "Classic mode loops the sample by default.",
      "1-Shot ignores note length entirely.",
    ],
    mistakes: [
      "Using Simpler for grand piano (use Sampler for multi-zone).",
      "Pitching down a sample more than an octave in Classic — sounds rough; switch to Warp on.",
    ],
    proMoves: [
      "Sampler velocity zones let you blend soft and loud recordings naturally.",
      "Use Simpler 1-Shot in Drum Rack pads for tight drum hits.",
    ],
    quizEasy: [
      { q: "Simpler holds…", options: ["One sample", "Many", "MIDI"], answer: 0 },
      {
        q: "Sampler is for…",
        options: ["Multi-zone instruments", "Drums only", "Reverb"],
        answer: 0,
      },
      { q: "1-Shot mode is best for…", options: ["Drums", "Pads", "Vocals"], answer: 0 },
    ],
    quizHard: [
      {
        q: "Simpler modes?",
        options: ["Classic, 1-Shot, Slicing", "Only Classic", "Only Slicing"],
        answer: 0,
      },
      {
        q: "Sampler velocity zones do what?",
        options: ["Switch samples by hit strength", "Change tempo", "Reverse"],
        answer: 0,
      },
      {
        q: "Convert direction?",
        options: ["Simpler → Sampler (one-way)", "Both ways", "Sampler → Simpler only"],
        answer: 0,
      },
      {
        q: "Slicing mode internally is similar to…",
        options: ["Slice to MIDI but contained in Simpler", "Beat Repeat", "Drum Rack"],
        answer: 0,
      },
      { q: "Sampler mod LFO count?", options: ["3", "1", "5"], answer: 0 },
    ],
    sources: [src("Simpler", "Live 12 Manual §24.9"), src("Sampler", "Live 12 Manual §24.8")],
  },

  "eq-eight": {
    hook: "Eight bands. The fastest way to surgical or sweeping tone shaping.",
    beginner: {
      what: [
        "EQ Eight boosts or cuts specific frequencies. Low end (20–200 Hz) = bass/kick. Mids (200–3 kHz) = body. Highs (3–20 kHz) = air and clarity.",
        "Drag a band point → boost up, cut down. Hold Q to widen or narrow the slope.",
      ],
      why: [
        "Carve space for vocals — cut where they sit on the kick.",
        "Make muddy tracks tight by trimming low-mid build-up around 200–500 Hz.",
      ],
      analogy: "Like spice on food — a little where it's missing, never everywhere.",
    },
    advanced: {
      what: [
        "EQ Eight is eight independent filter bands chained in series. Each band can be set to a different shape — Low Cut and High Cut remove everything beyond a frequency, Shelves tilt a wide region up or down, Bells boost or cut a focused area, Notches surgically remove a single frequency. Together those shapes cover every common EQ task.",
        "Each band has three controls: Frequency (where it works), Gain (how much boost or cut), and Q (how wide or narrow the action is). Narrow Q is surgical — perfect for hunting a resonance. Wide Q is musical — perfect for tone shaping. Steep cuts also introduce phase shift, which is why mastering engineers prefer gentle Q values whenever they can.",
        "M/S (Mid/Side) mode splits the stereo signal into the centre (mono) and the sides (stereo difference) and lets you EQ them separately. That's how engineers keep low end punchy and mono while opening up high end on the sides for width — a technique impossible with normal stereo EQ.",
      ],
      edgeCases: [
        "Steep cuts (high Q) introduce phase shift — use M/S to keep low end mono while shaping sides.",
        "Boosting more than +6 dB usually means another track needs cutting instead.",
      ],
      engineerNotes: [
        "High-pass the Side channel at 120Hz in M/S mode to clear mud and tighten mono low-end punch.",
        "Use wide-Q bell curves for natural tonal shaping to avoid the phase-shift smear of steep filters.",
        "Identify harsh resonances by sweeping a high-Q boost, then flip to a narrow cut for surgical cleaning.",
      ],
    },
    mechanism:
      "Audio → 8 biquad filters in series → output. Each band is a textbook IIR bell/shelf/cut.",
    flow: "Audio → Band 1 → Band 2 → … → Band 8 → Out",
    walkthrough: [
      {
        do: "Drop EQ Eight on a vocal. Drag band 4 down at 250 Hz by 4 dB.",
        listen: "Vocal loses muddiness, gains clarity.",
      },
      { do: "Switch band 8 to High Shelf, +3 dB at 10 kHz.", listen: "Air, sparkle." },
      { do: "Switch to M/S mode → cut Side at 80 Hz.", listen: "Bass becomes mono and tight." },
    ],
    listenFor: [
      "200–500 Hz cuts unmuddy almost everything.",
      "10 kHz shelf adds 'air' to vocals and cymbals.",
    ],
    mistakes: [
      "Boosting where you should cut.",
      "Forgetting Q — narrow Q = surgical, wide Q = musical.",
    ],
    proMoves: [
      "Use the spectrum to find resonant nodes; sweep a narrow boost to find them, then cut.",
      "M/S mode for mastering-grade stereo cleanup.",
    ],
    quizEasy: [
      { q: "EQ Eight has how many bands?", options: ["8", "4", "16"], answer: 0 },
      { q: "200–500 Hz is often called…", options: ["Mud zone", "Air", "Sub"], answer: 0 },
      { q: "Q controls…", options: ["Bandwidth", "Frequency", "Gain"], answer: 0 },
    ],
    quizHard: [
      {
        q: "M/S mode lets you EQ…",
        options: ["Mid and Side separately", "Only mids", "Only highs"],
        answer: 0,
      },
      { q: "High Q means…", options: ["Narrow bandwidth", "Wide", "No effect"], answer: 0 },
      {
        q: "Steep filters introduce…",
        options: ["Phase shift", "Distortion", "Reverb"],
        answer: 0,
      },
      {
        q: "Edit Single Band lets you…",
        options: ["Solo one band's effect", "Mute one band", "Delete one band"],
        answer: 0,
      },
      { q: "Air shelf typical frequency?", options: ["10 kHz", "100 Hz", "1 kHz"], answer: 0 },
    ],
    sources: [src("EQ Eight", "Live 12 Manual §22.10")],
  },

  compressor: {
    hook: "Tame loud peaks. Bring up quiet bits. Glue everything together.",
    beginner: {
      what: [
        "A Compressor turns down loud sounds when they cross a threshold, by a ratio you set.",
        "Threshold = 'when'. Ratio = 'by how much'. Attack = 'how fast it grabs'. Release = 'how fast it lets go'. Makeup = 'add gain back to match original level'.",
      ],
      why: [
        "Vocals stay even all the way through.",
        "Drums hit harder when compressed and made up.",
      ],
      analogy:
        "An automatic volume knob with reflexes. Loud bit comes → knob turns down. Quiet bit → knob lets go.",
    },
    advanced: {
      what: [
        "A compressor is an automatic volume knob that turns down loud parts of a signal so the difference between loud and quiet shrinks. Threshold sets the level where it starts working, Ratio sets how aggressively (a 4:1 ratio means anything 4 dB over the threshold only comes out 1 dB louder), and Makeup adds back the level lost so you actually hear a louder, more even sound rather than a quieter one.",
        "Attack and Release control timing. A slow attack (say 30 ms) lets the initial transient — the click of a kick, the consonant of a vocal — slip through before clamping the body, which is how compressors add punch instead of removing it. Release decides how quickly the volume recovers; too fast sounds buzzy on bass, too slow makes the track pump unmusically.",
        "Live's Compressor adds a sidechain section so a different signal can trigger the gain reduction (the kick-ducks-bass move), an EQ on that sidechain so you can ignore irrelevant frequencies, and Lookahead (0/1/10 ms) which lets the detector see peaks slightly before they arrive — useful on transient-heavy material.",
      ],
      edgeCases: [
        "Slow attack lets transients through, then clamps the body — punch maker.",
        "Auto Release uses program-dependent timing — usually transparent, sometimes pumps.",
      ],
      engineerNotes: [
        "Use a 30ms attack to let the initial transient through, preserving the 'knock' while controlling the body of the sound.",
        "Engage the sidechain high-pass filter to prevent low-end energy from triggering unpleasant gain reduction pumping.",
        "Set a 1ms lookahead for peak limiting on percussion to catch transients before they clip the digital ceiling.",
      ],
    },
    mechanism:
      "Detector reads input → compares to threshold → calculates gain reduction (ratio) → smooths via attack/release → applied via VCA → makeup → output.",
    flow: "Audio → Detector → Gain Reduction → VCA → Makeup → Out",
    walkthrough: [
      {
        do: "Drop Compressor on a vocal. Threshold so GR meter shows 3–6 dB on peaks.",
        listen: "Loudest words pulled down.",
      },
      {
        do: "Set Attack 30 ms, Release 100 ms.",
        listen: "Transients still poke through, body controlled.",
      },
      { do: "Add 4 dB Makeup.", listen: "Vocal sits steady, louder, present." },
    ],
    listenFor: ["Gain Reduction meter swings on loud peaks.", "Pumping = release too slow."],
    mistakes: [
      "Threshold too low + ratio too high = squashed lifeless.",
      "Forgetting makeup — sounds quieter, not louder.",
    ],
    proMoves: [
      "Drum bus: 4:1 ratio, 30 ms attack, fast release for punch.",
      "Sidechain a Compressor on bass keyed to kick → classic pump.",
    ],
    quizEasy: [
      {
        q: "Threshold sets…",
        options: ["When compression starts", "Final volume", "Reverb"],
        answer: 0,
      },
      { q: "Ratio sets…", options: ["How much it compresses", "Tempo", "Pitch"], answer: 0 },
      {
        q: "Makeup gain does what?",
        options: ["Adds back lost level", "Adds reverb", "Filters"],
        answer: 0,
      },
    ],
    quizHard: [
      {
        q: "Slow attack means…",
        options: ["Transients pass through", "Transients clamped", "No effect"],
        answer: 0,
      },
      {
        q: "Sidechain compression is triggered by…",
        options: ["A different signal", "Same signal", "Random"],
        answer: 0,
      },
      {
        q: "Auto release is…",
        options: ["Program-dependent timing", "Always 100 ms", "Always 10 ms"],
        answer: 0,
      },
      {
        q: "Knee soft vs hard:",
        options: ["Soft = gradual onset", "Soft = no compression", "Hard = no effect"],
        answer: 0,
      },
      { q: "Lookahead options?", options: ["0 / 1 / 10 ms", "0 only", "100 ms"], answer: 0 },
    ],
    sources: [src("Compressor", "Live 12 Manual §22.7")],
  },

  "reverb-delay": {
    hook: "Space and echo. The two effects every record needs.",
    beginner: {
      what: [
        "Reverb adds the sound of a room — small, big, plate, hall. Delay adds discrete echoes — slap, ping-pong, dub.",
        "Use them on Return tracks (sends) so multiple tracks share the same space — the mix sounds glued.",
      ],
      why: [
        "Reverb makes things feel like they're in the same room.",
        "Delay creates depth and movement.",
      ],
      analogy: "Reverb is the room. Delay is someone in the canyon shouting back.",
    },
    advanced: {
      what: [
        "Reverb is the simulated tail of a room. Live's Reverb device builds that tail from an input filter, a brief Predelay (the silence before reflections begin), an early-reflection diffusion network, and a longer decay tail with its own EQ. Hybrid Reverb extends this by blending an algorithmic engine with convolution \u2014 convolution applies a recorded impulse response of a real space, so you get authentic room/hall/plate character that algorithms can't replicate.",
        "Delay is discrete repetition rather than continuous tail. The Delay device runs an independent line per side, each with its own time (synced to grid or free in ms), feedback amount, and a high/low filter band on the feedback path so each repeat dulls or thins. Ping-Pong mode bounces taps L→R, and Freeze captures the current buffer so you can hold an echo while the source moves on.",
        "In a session, both belong on Return tracks. Sending several sources into one shared reverb glues them into the same imaginary room; doing the same with delay creates a unified rhythmic depth across the mix. Inserting reverbs and delays per-track multiplies CPU and smears the stereo field — pros almost always send.",
      ],
      edgeCases: [
        "Predelay separates source from reverb — clarity without losing depth.",
        "Long reverb tails on every track = mud. Use sends.",
      ],
      engineerNotes: [
        "Placing temporal effects on Return tracks preserves transient punch by keeping the source signal completely dry and un-smeared.",
        "The Hybrid Reverb's convolution engine provides actual physical depth, whereas the algorithmic side should be used to add unnatural shimmer.",
        "Applying an EQ Eight after a delay on the return track is essential to cut low-end buildup and prevent repetitions from masking the vocal.",
      ],
    },
    mechanism: "Source → Send → Return Track → Reverb/Delay → back into Master.",
    flow: "Source → Send → Return → Reverb/Delay → Master",
    walkthrough: [
      { do: "On a Return: drop Reverb. Send vocal +6 dB.", listen: "Vocal sits in a room." },
      { do: "Increase Predelay to 30 ms.", listen: "Vocal stays clear, reverb arrives later." },
      {
        do: "Replace with Delay → 1/8 dotted, feedback 30%, ping-pong on.",
        listen: "Stereo dub echoes.",
      },
    ],
    listenFor: ["Predelay = clarity. Diffuse = warmth."],
    mistakes: [
      "Insert reverbs on every track instead of returns — kills the mix.",
      "100% feedback delay = runaway.",
    ],
    proMoves: [
      "Sidechain a duck on the reverb return keyed to the dry vocal — vocal pops out, reverb fills the gaps.",
      "EQ the reverb return — high-pass at 200 Hz for clarity.",
    ],
    quizEasy: [
      { q: "Reverb adds…", options: ["A sense of space", "Pitch", "Tempo"], answer: 0 },
      { q: "Delay adds…", options: ["Echoes", "Reverb", "Distortion"], answer: 0 },
      { q: "Where to put shared FX?", options: ["Return tracks", "Master", "MIDI"], answer: 0 },
    ],
    quizHard: [
      {
        q: "Predelay separates…",
        options: ["Source from reverb tail", "Pitch from time", "Left from right"],
        answer: 0,
      },
      {
        q: "Hybrid Reverb mixes…",
        options: ["Convolution + algorithmic", "Two delays", "EQ + reverb"],
        answer: 0,
      },
      {
        q: "Ping-pong delay does what?",
        options: ["Alternates L/R", "Sums to mono", "Reverses"],
        answer: 0,
      },
      {
        q: "Freeze on reverb…",
        options: ["Sustains the tail indefinitely", "Mutes it", "Filters it"],
        answer: 0,
      },
      {
        q: "Sidechain on reverb return keyed to dry signal…",
        options: ["Ducks reverb when source plays", "Removes reverb", "Doubles reverb"],
        answer: 0,
      },
    ],
    sources: [
      src("Reverb", "Live 12 Manual §22.18"),
      src("Delay", "Live 12 Manual §22.5"),
      src("Hybrid Reverb", "Live 12 Manual §22.13"),
    ],
  },

  "saturator-distortion": {
    hook: "A little harmonic dirt makes everything sound bigger.",
    beginner: {
      what: [
        "Saturator adds harmonics — gentle warmth at low drive, biting distortion at high drive.",
        "Use it on bass to add bite, on drums for grit, on the master bus for glue.",
      ],
      why: ["Thin sounds suddenly feel full.", "Adds presence without raising volume."],
      analogy: "Like a tube amp — just enough drive feels expensive; too much sounds broken.",
    },
    advanced: {
      what: [
        "Saturation is gentle, even-order harmonic distortion \u2014 the kind tape, tubes and transformers add when pushed. Live's Saturator runs the input through a configurable waveshaping curve (Analog, Soft Sine, Tape, etc.), with Drive setting how hard it hits the curve and Output compensating for the level rise. The result is a fatter, denser sound that 'feels louder' before the meter actually moves.",
        "Distortion devices (Overdrive, Pedal, Dynamic Tube, Roar) push further into odd-order harmonics and clipping, where the waveform's peaks are sliced off entirely. They sound aggressive because the new harmonics extend high up the spectrum; that's also why they need EQ after \u2014 to tame the top end they generate.",
        "When you put saturation on the master or a bus, you're adding harmonics that didn't exist in the source \u2014 those harmonics fill perceived gaps in the frequency spectrum, which is why a saturated bus sounds 'glued' even before any compressor touches it. Engineers reach for it as a tonal weapon, not just a distortion effect.",
      ],
      edgeCases: [
        "DC offset can sneak in at extreme drive — use Soft Clip toggle to tame.",
        "Saturator changes loudness perception massively — A/B with bypass.",
      ],
      engineerNotes: [
        "Use Saturator's Soft Sine mode on drum busses to shave off transient peaks and increase RMS without triggering compressor pumping.",
        "Place an EQ Eight with a steep low-pass filter after the Pedal device to remove the brittle high-frequency aliasing of heavy distortion.",
        "Run synths through Dynamic Tube using the 'B' envelope to add movement and reactive warmth that feels like hardware interaction.",
      ],
    },
    mechanism:
      "Audio → optional EQ → waveshaping transfer function (drive curve) → DC removal → soft clip → output.",
    flow: "Audio → Pre-EQ → Waveshaper → DC/Soft Clip → Output",
    walkthrough: [
      {
        do: "Drop Saturator on bass. Type Analog Clip, Drive 6 dB.",
        listen: "Bass thickens, harmonics added.",
      },
      { do: "Drive to 18 dB.", listen: "Audible distortion — overdriven amp." },
      { do: "Switch to Sinoid Fold.", listen: "Folded harmonics — synthesizer-like grit." },
    ],
    listenFor: ["Harmonics fill the gaps between fundamentals."],
    mistakes: [
      "Too much drive on a master = harsh and crushed.",
      "Forgetting Wet/Dry — parallel saturation usually beats fully wet.",
    ],
    proMoves: [
      "Saturator before EQ to harmonically tilt, then EQ to shape result.",
      "Use Waveshaper for surgical custom transfer functions.",
    ],
    quizEasy: [
      {
        q: "Saturator does what?",
        options: ["Adds harmonics / distortion", "Adds reverb", "Adds delay"],
        answer: 0,
      },
      {
        q: "Low drive sounds like…",
        options: ["Warmth / glue", "Harsh distortion", "Reverb"],
        answer: 0,
      },
      { q: "High drive sounds like…", options: ["Distortion", "Compression", "EQ"], answer: 0 },
    ],
    quizHard: [
      {
        q: "Saturator types include…",
        options: ["Analog, Sinoid Fold, Digital Clip, Waveshaper", "Only Analog", "Only Digital"],
        answer: 0,
      },
      {
        q: "Waveshaper mode lets you…",
        options: ["Draw custom transfer curves", "Add reverb", "Sequence drums"],
        answer: 0,
      },
      {
        q: "Soft Clip does what?",
        options: ["Tames extreme peaks gently", "Hard limits", "Compresses"],
        answer: 0,
      },
      {
        q: "Pre-EQ stage is for…",
        options: ["Tilting harmonics before drive", "Final tone", "Sidechain"],
        answer: 0,
      },
      {
        q: "DC offset is removed by…",
        options: ["DC button + Soft Clip path", "Output gain", "Reverb"],
        answer: 0,
      },
    ],
    sources: [src("Saturator", "Live 12 Manual §22.20")],
  },

  "midi-effects": {
    hook: "Effects that change notes before they hit the instrument.",
    beginner: {
      what: [
        "MIDI Effects sit BEFORE an instrument and transform the notes: chord, arpeggio, scale, random, pitch.",
        "Drop Chord on a track → play one note → hear three.",
      ],
      why: [
        "Build chord progressions live without playing all the notes.",
        "Snap any wrong notes into a chosen scale.",
      ],
      analogy: "A translator that rephrases what you play before the instrument hears it.",
    },
    advanced: {
      what: [
        "MIDI effects sit before an instrument and rewrite the note stream on its way in. Because they operate on note data — pitch, velocity, length, timing — and not on audio, they cost almost nothing CPU-wise and can be stacked in series. The order matters: each device reshapes whatever the previous one output.",
        "Live ships a small, deeply useful set: Arpeggiator (held notes become rhythmic patterns), Chord (each note becomes a stacked chord by added intervals), Scale (incoming notes snap to a chosen scale), Pitch (transpose), Random (probabilistic pitch jitter), Note Length (extend/shorten), Velocity (remap dynamics), MIDI Monitor (debug what's flowing through), and Expression Control (route any controller to any device parameter).",
        "Live 12 added a project-wide Scale system, so the Scale device \u2014 and many native instruments \u2014 automatically follow the Set's key. That's why a single-key change in the transport can retune an entire performance without touching the clips.",
      ],
      edgeCases: [
        "Chain order matters — Scale before Arpeggiator gives different results than after.",
        "Arpeggiator timing follows clip groove if Groove is set.",
      ],
      engineerNotes: [
        "Place Velocity before your instrument to compress dynamic range and ensure consistent sample layer triggering without using gain.",
        "Stack Scale after Chord to force complex generated harmonies into your project\u2019s key, preventing accidental dissonant clusters.",
        "Use Note Length in trigger mode to decouple your MIDI clips from the synth\u2019s envelope, creating consistent percussive stabs.",
      ],
    },
    mechanism: "MIDI in → MIDI FX (transform notes) → Instrument → Audio out.",
    flow: "MIDI → MIDI FX → Instrument → Audio",
    walkthrough: [
      {
        do: "Drop Chord on a MIDI track. Set +4 and +7 semitones.",
        listen: "Single note plays as a triad.",
      },
      { do: "Add Arpeggiator → Style Up, Rate 1/16.", listen: "Triad arpeggiates at 1/16 notes." },
      { do: "Add Scale → C Minor.", listen: "Wrong notes snap into key." },
    ],
    listenFor: ["Chord device adds the intervals you set, no fewer, no more."],
    mistakes: [
      "Putting MIDI FX after the instrument — they do nothing.",
      "Forgetting Scale device snaps EVERY note, including ones you wanted out of key.",
    ],
    proMoves: [
      "Chord + Random for cluster effects.",
      "Arpeggiator + Note Length for rhythmic texture sweeps.",
    ],
    quizEasy: [
      {
        q: "MIDI FX sit where?",
        options: ["Before the instrument", "After", "On the master"],
        answer: 0,
      },
      {
        q: "Chord does what?",
        options: ["Adds intervals to each note", "Removes notes", "Adds reverb"],
        answer: 0,
      },
      {
        q: "Arpeggiator does what?",
        options: ["Plays held notes one at a time", "Adds reverb", "Tunes"],
        answer: 0,
      },
    ],
    quizHard: [
      {
        q: "Live 12 added which MIDI effect?",
        options: ["Note Length", "Reverb", "Saturator"],
        answer: 0,
      },
      {
        q: "Scale device snaps to…",
        options: ["Selected scale (or project scale)", "Pentatonic only", "Chromatic"],
        answer: 0,
      },
      {
        q: "Chain order matters because…",
        options: [
          "Each device transforms the previous output",
          "It doesn't matter",
          "Only Arpeggiator cares",
        ],
        answer: 0,
      },
      {
        q: "Arpeggiator timing can follow…",
        options: ["Groove", "Tempo only", "Pitch"],
        answer: 0,
      },
      {
        q: "Pitch device transposes by…",
        options: ["Semitones", "Cents only", "Octaves only"],
        answer: 0,
      },
    ],
    sources: [src("MIDI Effects", "Live 12 Manual §23")],
  },

  "racks-macros": {
    hook: "One knob, eight parameters. Welcome to performable sound design.",
    beginner: {
      what: [
        "A Rack is a container for devices. Macros are 16 knobs you map to ANY parameter inside the rack.",
        "Right-click a parameter → Map to Macro → tweak one knob, control everything you mapped.",
      ],
      why: [
        "Build performance presets where one knob = filter + reverb + delay all at once.",
        "Save complex chains as a single device.",
      ],
      analogy: "Like turning a whole synth's worth of knobs into one big steering wheel.",
    },
    advanced: {
      what: [
        "A Rack is a wrapper that turns any number of devices into a single device. You can group instruments, MIDI effects or audio effects, and inside the Rack each Chain runs in parallel — Live mixes their outputs together. Chain Selectors let those chains respond to key zones, velocity zones, or a macro position, which is how multi-sampled instruments and velocity-switched drums are built.",
        "Macros are sixteen knobs (since Live 11) that sit on the Rack's front panel. Right-click any device parameter inside the Rack and you can map it to a macro, then constrain the mapped range with its own Min and Max. Setting Max below Min inverts the mapping — perfect for one knob that opens a filter while closing a reverb at the same time.",
        "Macro Variations save snapshots of all sixteen macro values and let you recall them instantly, with smooth interpolation between snapshots if you want a morph. That's how performers build single-Rack 'patches' that move from intro to drop with one knob movement.",
      ],
      edgeCases: [
        "Mapped range is set independently for each parameter (Min/Max) — invert by setting Max < Min.",
        "Variations live per-rack and can crossfade smoothly when interpolated.",
      ],
      engineerNotes: [
        "Parallel processing with chains prevents phase cancellation by managing dry/wet signals through identical latency paths in one rack.",
        "Macro range inversion is the most efficient way to maintain perceived loudness by decreasing gain as you boost saturation or drive.",
        "Macro Variations allow for instant preset morphing during live sets without the CPU spikes caused by dragging individual device parameters.",
      ],
    },
    mechanism: "Macro knob → mapped parameters' ranges → live devices receive scaled values.",
    flow: "Macro Knob → Mappings → Devices in Rack → Audio Out",
    walkthrough: [
      { do: "Group 3 devices into an Audio Effect Rack (Cmd/Ctrl+G).", listen: "Wrapper appears." },
      { do: "Right-click filter cutoff → Map to Macro 1.", listen: "Macro 1 now drives cutoff." },
      {
        do: "Map reverb wet to Macro 1 too. Set range 0–60%.",
        listen: "One knob = filter sweep + reverb rise.",
      },
    ],
    listenFor: ["Multiple parameters move in parallel from one knob."],
    mistakes: [
      "Forgetting to set Min/Max ranges — every macro becomes 0–127.",
      "Mapping too many params to one macro = mush.",
    ],
    proMoves: [
      "Variations per rack let you save snapshots and crossfade.",
      "Use Chain selectors with macros for crossfading between sounds.",
    ],
    quizEasy: [
      { q: "Macro count per rack (Live 11+)?", options: ["16", "8", "4"], answer: 0 },
      { q: "Group shortcut?", options: ["Cmd/Ctrl+G", "Cmd/Ctrl+R", "Cmd/Ctrl+T"], answer: 0 },
      {
        q: "Map a parameter via…",
        options: ["Right-click → Map to Macro", "Drag", "Delete"],
        answer: 0,
      },
    ],
    quizHard: [
      {
        q: "Inverting a mapping = ",
        options: ["Set Max < Min", "Hold Shift", "Right-click invert"],
        answer: 0,
      },
      {
        q: "Macro Variations let you…",
        options: ["Snapshot and recall macro states", "Add reverb", "Quantize"],
        answer: 0,
      },
      {
        q: "Rack types include…",
        options: ["Instrument, Drum, MIDI, Audio FX", "Only Instrument", "Only Drum"],
        answer: 0,
      },
      {
        q: "Chain selector lets you…",
        options: ["Crossfade between chains", "Mute chains", "Save chains"],
        answer: 0,
      },
      {
        q: "Variations in Live 12 can…",
        options: ["Interpolate smoothly", "Only step", "Only random"],
        answer: 0,
      },
    ],
    sources: [src("Instrument, Drum and Effect Racks", "Live 12 Manual §21")],
  },

  // ============ WORLD 5 — MIXING ============
  "the-mixer": {
    hook: "Where individual tracks become one record.",
    beginner: {
      what: [
        "The Mixer holds every track's volume, pan, sends, mute, solo, and meter. It's how the song balances.",
        "In Session, the mixer lives at the bottom. In Arrangement, click the M-mixer toggle in the right margin to expand strips.",
      ],
      why: [
        "Balance is the difference between a demo and a record.",
        "Pan creates width; volume creates depth.",
      ],
      analogy:
        "Like a desk at a venue — each musician on a fader, you move them louder or quieter relative to each other.",
    },
    advanced: {
      what: [
        "The Mixer is Live's summing engine: every audio and instrument track ends in a stereo channel strip with volume, pan, mute, solo, sends, and a level meter, and all those strips sum into the Master. The fader is post-fader for sends by default (so muting a track also kills its reverb), but you can flip an individual send pre-fader when you want the FX to keep ringing under a mute.",
        "Section-by-section, a strip is: input/output choice \u2192 device chain \u2192 sends \u2192 fader/pan \u2192 meter \u2192 master. Each section can be inspected and automated independently, which is what makes Live's mixer feel like both a console and a programmable instrument.",
        "Headroom matters because Live mixes in 32-bit float internally — clipping the master is fine in the box but kills any analog gear you print to and exhausts plugin headroom in non-linear devices like Saturator and Limiter. Pros leave 3–6 dB of headroom on the master and use Utility for gain staging instead of pushing channel faders.",
      ],
      edgeCases: [
        "Cue Out routing must be different from Master Out for headphone preview to work.",
        "Solo modes: 'Solo In Place' (default) vs 'Solo Cue' — set in Preferences → Record/Warp/Launch.",
      ],
      engineerNotes: [
        "Leave 6dB of headroom on the master to prevent non-linear plugins from losing their intended harmonic character and dynamic range.",
        "Use Utility for initial gain staging so channel faders can stay near zero where they offer the highest physical resolution for automation.",
        "Flip sends to pre-fader when you want to automate a dry signal's volume without affecting the density of its reverb tail or delay wash.",
      ],
    },
    mechanism:
      "Each track strip is a fixed gain pipeline; sends tap pre/post fader and route to Returns; everything sums into Master.",
    flow: "Tracks → Sends → Returns → Master → Out",
    walkthrough: [
      { do: "Solo a track.", listen: "Only that track plays." },
      { do: "Lower a vocal fader 6 dB.", listen: "It sits further back in the mix." },
      { do: "Pan a guitar -30.", listen: "It moves left of centre." },
    ],
    listenFor: ["Pan widens; volume creates depth."],
    mistakes: [
      "Pushing every fader up — no headroom.",
      "Soloing during full-mix decisions — the mix sounds different in context.",
    ],
    proMoves: [
      "Mix at low volume (around 70 dB SPL) — your decisions translate better.",
      "Use Group tracks to manage drums/synths/vox as bus mixes.",
    ],
    quizEasy: [
      { q: "Pan controls…", options: ["Left/right placement", "Volume", "Pitch"], answer: 0 },
      { q: "Solo does what?", options: ["Mutes other tracks", "Records", "Loops"], answer: 0 },
      { q: "Master is…", options: ["Final output sum", "First track", "MIDI"], answer: 0 },
    ],
    quizHard: [
      {
        q: "Cue out is for…",
        options: ["Headphone preview", "Master mix", "Recording"],
        answer: 0,
      },
      {
        q: "Default sends per track?",
        options: ["12 (configurable)", "Unlimited", "1"],
        answer: 0,
      },
      {
        q: "Solo mode set in…",
        options: ["Preferences → Record/Warp/Launch", "Mixer", "Browser"],
        answer: 0,
      },
      { q: "Volume range?", options: ["-∞ to +6 dB", "-∞ to 0 dB", "0 to +6 dB"], answer: 0 },
      { q: "Pan range?", options: ["-50L to +50R", "-100 to +100", "0 to 100"], answer: 0 },
    ],
    sources: [src("Mixing", "Live 12 Manual §15.4")],
  },

  "sends-returns": {
    hook: "Send a little signal. Get a lot of cohesion.",
    beginner: {
      what: [
        "A Send routes a copy of a track's audio to a Return track. The Return holds an effect (e.g. reverb).",
        "Multiple tracks send to the same return → all share the same reverb → mix sounds glued.",
      ],
      why: ["Save CPU (one reverb instead of ten).", "Cohesion (everything in the same room)."],
      analogy:
        "Like everyone in a band sharing one church hall to sing in. Same space, instant glue.",
    },
    advanced: {
      what: [
        "A Send is a copy of a track's signal that runs alongside the dry mix into a Return track. Return tracks are normal tracks with one job: hold a shared effect (reverb, delay, parallel compressor) that many tracks feed. The Send knob controls how much of each source goes there.",
        "Pre vs. post-fader is the key choice. Post-fader (default) means the send level scales with the channel fader \u2014 turn down the vocal and its reverb turns down too. Pre-fader sends ignore the fader, useful for cue mixes, parallel processing chains, or 'reverb-only' sends where the dry track stays muted.",
        "Sends/returns aren't just CPU savings \u2014 they're how mixes glue. Routing kick, snare and percussion through one shared room creates the impression they were recorded together, even if every sample came from a different library.",
      ],
      edgeCases: [
        "Pre-fader sends are still affected by mute (configurable in Preferences).",
        "Return tracks can also send to other Returns — chain reverb → delay → reverb.",
      ],
      engineerNotes: [
        "Using one shared Reverb on a Return track 'glues' disparate samples into a single acoustic space for a more cohesive professional mix.",
        "Switching to Pre-fader allows you to create a 100% wet signal for sound design while letting you mute the source track independently.",
        "Busing multiple tracks to a shared Return compressor preserves transients on the dry tracks while adding density through parallel processing.",
      ],
    },
    mechanism:
      "Track signal → tap (pre/post) → send knob attenuates → mixed at the Return input → Return processes → sums to Master.",
    flow: "Track → Send → Return → Reverb/Delay → Master",
    walkthrough: [
      {
        do: "Create a Return (Cmd/Ctrl+Alt+T). Drop Reverb on it.",
        listen: "Silent until something is sent.",
      },
      { do: "On any track, raise Send A.", listen: "Reverb tail appears under that track." },
      { do: "Send another track too.", listen: "Both tracks share the same room." },
    ],
    listenFor: [
      "Reverb feels coherent across tracks.",
      "Pre-fader sends keep level when fader drops to 0.",
    ],
    mistakes: [
      "Inserting reverb on every track instead of using sends.",
      "Pre-fader sends accidentally creating cue mixes you didn't want.",
    ],
    proMoves: [
      "Send chain: Reverb → second Return for a 'reverb-of-the-reverb' tail.",
      "Sidechain ducking on the reverb return clears space for the dry source.",
    ],
    quizEasy: [
      {
        q: "What is a Return?",
        options: ["A track that receives sends", "An audio track", "A MIDI track"],
        answer: 0,
      },
      {
        q: "Why use sends?",
        options: ["Share FX, save CPU", "Add tracks", "Tempo change"],
        answer: 0,
      },
      { q: "Default send post or pre fader?", options: ["Post", "Pre", "Both"], answer: 0 },
    ],
    quizHard: [
      {
        q: "New Return shortcut?",
        options: ["Cmd/Ctrl+Alt+T", "Cmd/Ctrl+T", "Cmd/Ctrl+R"],
        answer: 0,
      },
      {
        q: "Pre-fader send means…",
        options: ["Send level independent of fader", "Send follows fader", "Mute disables it"],
        answer: 0,
      },
      {
        q: "Returns can send to other Returns?",
        options: ["Yes (chained)", "No", "Only one level"],
        answer: 0,
      },
      { q: "Max returns per set?", options: ["12", "4", "Unlimited"], answer: 0 },
      {
        q: "Sidechain ducking on a reverb return…",
        options: ["Clears room for dry source", "Mutes reverb", "Doubles reverb"],
        answer: 0,
      },
    ],
    sources: [src("Return Tracks", "Live 12 Manual §15.4.4")],
  },

  "groups-routing": {
    hook: "Groups tame complexity. Routing turns Live into a modular synth.",
    beginner: {
      what: [
        "A Group track wraps multiple tracks into a folder with one fader. Routing lets any track output into any other input.",
        "Cmd/Ctrl+G groups selected tracks. Then process the group as one (drums bus, vox bus, synth bus).",
      ],
      why: [
        "Process all drums together with one compressor.",
        "Build sidechains, parallel chains, complex routings.",
      ],
      analogy:
        "Groups are file folders for tracks. Routing is the patch cables behind your studio rack.",
    },
    advanced: {
      what: [
        "A Group track is a sub-mix: select tracks \u2192 Cmd/Ctrl-G \u2192 Live creates a parent track that receives the children's outputs, with its own devices, mixer strip, sends, and automation. Bouncing a group lane to a single audio file is one drag away when you want to commit a stem.",
        "Routing in Live is freeform: any track's output can be sent to the Master, to a Return, to a Group, to another track's input, or even to an external out. Audio To and Audio From menus on each track header expose the full graph, including pre/post mixer/devices tap points so you can siphon a signal mid-chain.",
        "External Instrument and External Audio Effect devices wrap that flexibility into a single device — useful for hardware synths and outboard FX, since they handle round-trip latency compensation automatically when you set the right buffer.",
      ],
      edgeCases: [
        "Routing 'Sends Only' makes a track contribute via its sends without going to Master.",
        "Audio To another track's 'Post FX' lets you sidechain compressors with that track's processed signal.",
      ],
      engineerNotes: [
        "Group processing allows for cohesive bus compression and saturation that glues individual elements into a single unified instrument.",
        "Using 'Post-Effects' routing to sidechain a compressor ensures your ducking triggers from the raw signal regardless of fader level changes.",
        "External Instrument devices are essential for hardware integration because they automate the sample-accurate latency compensation for you.",
      ],
    },
    mechanism:
      "Group sums children → group's devices process → group's mixer → Master. Inter-track routing reroutes signals before summing.",
    flow: "Tracks → Group Sum → Group FX → Group Mixer → Master",
    walkthrough: [
      { do: "Select all drums → Cmd/Ctrl+G.", listen: "Drums fold under one fader." },
      { do: "Drop a Glue Compressor on the Group.", listen: "All drums compressed together." },
      {
        do: "Route Bass 'Audio To' a sidechain Aux track.",
        listen: "Bass enters that track's input.",
      },
    ],
    listenFor: ["Group compression glues drums; individual hits remain visible."],
    mistakes: [
      "Forgetting Group has its own automation lane.",
      "Routing into a track without arming/monitoring it — silence.",
    ],
    proMoves: [
      "Use 'Sends Only' for parallel processing without doubling the dry signal.",
      "Nested Groups (Group inside a Group) for stems and bus structure.",
    ],
    quizEasy: [
      { q: "Group shortcut?", options: ["Cmd/Ctrl+G", "Cmd/Ctrl+T", "Cmd/Ctrl+R"], answer: 0 },
      {
        q: "Why use a Group?",
        options: ["Process tracks together", "Save audio", "Tempo"],
        answer: 0,
      },
      {
        q: "Routing lets you…",
        options: ["Send any track's audio to any input", "Only to Master", "Only to Returns"],
        answer: 0,
      },
    ],
    quizHard: [
      {
        q: "Audio To 'Sends Only' means…",
        options: ["Track contributes only via sends", "Track muted", "Send disabled"],
        answer: 0,
      },
      {
        q: "Sub-input options on routing?",
        options: ["Pre FX, Post FX, Post Mixer", "Only Post FX", "Only Pre FX"],
        answer: 0,
      },
      { q: "Group track can hold devices?", options: ["Yes", "No", "Only sends"], answer: 0 },
      { q: "Nested Groups allowed?", options: ["Yes", "No", "Only one level"], answer: 0 },
      {
        q: "Resampling input is…",
        options: ["Live's master output", "External in", "Cue out"],
        answer: 0,
      },
    ],
    sources: [
      src("Routing & I/O", "Live 12 Manual §15.5"),
      src("Group Tracks", "Live 12 Manual §15.3"),
    ],
  },

  automation: {
    hook: "Move any knob automatically. The mix becomes a performance.",
    beginner: {
      what: [
        "Automation lets you draw any parameter's value over time. Volume swells, filter sweeps, pan moves — all written into the timeline.",
        "Press A in Arrangement to reveal automation lanes; click a parameter dropdown; draw a curve.",
      ],
      why: [
        "Make every section feel different without copying tracks.",
        "Automate FX wet/dry to dramatize transitions.",
      ],
      analogy: "Like setting up a robot to turn knobs for you, exactly the same way every time.",
    },
    advanced: {
      what: [
        "Automation is Live's way of recording parameter movements over time. In Arrangement view every track and device parameter has an automation lane (yellow line) that you can draw, edit with breakpoints, or record live by tweaking the control while the transport rolls. Re-Enable Automation reactivates a parameter you've manually overridden mid-playback.",
        "In Session view, automation lives inside clips: each clip has an Envelopes tab where you can automate device or mixer parameters relative to that clip. When the clip launches, its envelopes take over \u2014 that's how a single Session clip can carry both notes and a custom filter sweep that follows it.",
        "The 'M' button next to a parameter switches between automation (linear ramps) and modulation (relative offsets that don't fight automation). Modulation lanes were added to make per-clip variation possible without permanently overwriting the device's actual value.",
      ],
      edgeCases: [
        "Automation overrides manual knob movement until you click 'Re-Enable Automation' (top-right pop-up) or stop playback.",
        "Modulation lanes (separate from automation) add deviations on top — see next mission.",
      ],
      engineerNotes: [
        "Use modulation instead of automation for filter sweeps to keep your base cutoff knob free for manual tweaks during a performance.",
        "Record automation in Arrangement View using the pencil tool for surgical precision on volume ducking or frequency carves.",
        "Unlink Clip Envelopes in Session View to create polyrhythmic parameter loops that evolve independently from the MIDI or audio length.",
      ],
    },
    mechanism:
      "Breakpoints on a parameter timeline → playback engine reads value at every sample → sets parameter → device responds.",
    flow: "Parameter → Automation Lane → Playhead → Device",
    walkthrough: [
      {
        do: "Press A in Arrangement → choose Volume lane → click two breakpoints.",
        listen: "Track fades on playback.",
      },
      { do: "Cmd/Ctrl-drag the line between points.", listen: "Curve becomes exponential." },
      { do: "Right-click → Disable Automation.", listen: "Bypassed, but the curve is preserved." },
    ],
    listenFor: ["Volume rises/falls precisely matching the curve."],
    mistakes: [
      "Tweaking a knob and wondering why it snaps back — automation is overriding it.",
      "Forgetting to re-enable automation after recording an override.",
    ],
    proMoves: [
      "Drag with Cmd/Ctrl for exponential curves.",
      "Use clip envelopes for per-clip variations rather than duplicating clips.",
    ],
    quizEasy: [
      { q: "Show automation lanes shortcut?", options: ["A", "M", "S"], answer: 0 },
      {
        q: "Automation makes parameters…",
        options: ["Move automatically over time", "Mute", "Reverse"],
        answer: 0,
      },
      {
        q: "Where to draw?",
        options: ["Automation lane on the track", "Browser", "Mixer only"],
        answer: 0,
      },
    ],
    quizHard: [
      {
        q: "Curved breakpoints via…",
        options: ["Cmd/Ctrl-drag", "Shift-drag", "Alt-drag"],
        answer: 0,
      },
      {
        q: "Re-Enable Automation appears when…",
        options: ["You override a parameter manually", "You start playback", "You mute"],
        answer: 0,
      },
      {
        q: "Clip envelopes vs Arrangement automation?",
        options: [
          "Clip envelope = local to clip; arrangement = timeline",
          "Same thing",
          "Clip envelopes are permanent",
        ],
        answer: 0,
      },
      {
        q: "Disable Automation does what?",
        options: ["Bypass without delete", "Delete", "Render"],
        answer: 0,
      },
      {
        q: "Automation can target…",
        options: ["Almost any parameter", "Only volume", "Only pan"],
        answer: 0,
      },
    ],
    sources: [src("Automation", "Live 12 Manual §20")],
  },

  "modulation-lanes": {
    hook: "Like automation, but additive — the parameter's value is offset, not replaced.",
    beginner: {
      what: [
        "Modulation Lanes (Live 11+) sit alongside automation lanes. They add a deviation on top of the parameter's current value, instead of overwriting it.",
        "Useful when you want a knob to wobble around its set position without losing the manual setting.",
      ],
      why: [
        "Tweak the underlying knob and the modulation moves with it.",
        "Combine multiple modulators on the same parameter cleanly.",
      ],
      analogy:
        "Automation is the GPS taking over the wheel. Modulation is the wind nudging the car around your steering.",
    },
    advanced: {
      what: [
        "Modulation differs from automation: automation sets a parameter's absolute value, modulation adds an offset on top of whatever the parameter currently is. Two clips can therefore modulate the same knob in opposite directions without overwriting each other or the user's last hands-on tweak.",
        "Inside a clip's Envelopes tab, the 'M' toggle next to a chosen parameter switches the lane from automation to modulation. The visual is centred on zero \u2014 a flat line means 'do nothing', a curve means 'add/subtract this much from the underlying value'.",
        "Modulation lanes make Session view performable: you can leave macros free for the player to twist live, while clips quietly nudge filter cutoffs, send levels and effect mixes around to give each clip its own character.",
      ],
      edgeCases: [
        "Total = parameter + modulation, clamped to parameter range.",
        "Drawing modulation past the parameter's range = clipping at min/max — you hear a flatten effect.",
      ],
      engineerNotes: [
        "Modulation preserves your Macro's physical position so you can perform live tweaks without fighting the clip's automation data.",
        "Using modulation allows you to store specific parameter offsets for every clip while keeping the absolute value free for global mixing.",
        "Modulation lanes are essential for non-destructive sound design, letting you add movement without overwriting your baseline parameter settings.",
      ],
    },
    mechanism: "Parameter base value + Modulation deviation = effective value (clamped).",
    flow: "Base Param + Modulation Lane → Effective Value → Device",
    walkthrough: [
      {
        do: "Right-click an automation lane → switch to Modulation.",
        listen: "Lane shows ± from centre.",
      },
      { do: "Draw a sine-wave-ish curve.", listen: "Parameter wobbles around its set value." },
      { do: "Adjust the underlying parameter with the mouse.", listen: "Modulation rides on top." },
    ],
    listenFor: ["Underlying parameter still responds to manual change."],
    mistakes: [
      "Confusing modulation with automation — modulation doesn't fix the value.",
      "Drawing huge modulation values that clip at min/max.",
    ],
    proMoves: [
      "Use modulation for performable wobble; automation for fixed automation moves.",
      "Combine: automate the base value, modulate around it.",
    ],
    quizEasy: [
      {
        q: "Modulation vs Automation?",
        options: ["Modulation adds; automation overwrites", "Same thing", "Reverse"],
        answer: 0,
      },
      {
        q: "Modulation values are…",
        options: ["Bipolar (±)", "Always 0–127", "Always positive"],
        answer: 0,
      },
      { q: "Live 11 introduced…", options: ["Modulation lanes", "Macros", "Operator"], answer: 0 },
    ],
    quizHard: [
      {
        q: "If base + mod exceeds parameter max…",
        options: ["Clamps at max", "Wraps", "Crashes"],
        answer: 0,
      },
      {
        q: "Modulation lane lives where?",
        options: ["Alongside automation", "On Master only", "On clip only"],
        answer: 0,
      },
      {
        q: "Can clip envelopes hold modulation?",
        options: ["Yes (Live 12)", "No", "Only audio"],
        answer: 0,
      },
      {
        q: "Why prefer modulation for performance?",
        options: ["Underlying knob still responds", "It mutes", "It saves CPU"],
        answer: 0,
      },
      {
        q: "Switch lane between Auto/Mod via…",
        options: ["Right-click → Switch to Modulation", "Cmd/Ctrl+M", "Toolbar"],
        answer: 0,
      },
    ],
    sources: [src("Automation & Modulation", "Live 12 Manual §20.6")],
  },

  sidechain: {
    hook: "Use one signal to duck another. The pump is dance music's heartbeat.",
    beginner: {
      what: [
        "Sidechain compression: the kick triggers a compressor on the bass, ducking the bass each time the kick hits.",
        "Open Compressor → enable Sidechain → set Audio From: Kick → set Threshold + Ratio. Bass pumps in time.",
      ],
      why: [
        "Bass gets out of the way of the kick — both sound bigger.",
        "Same trick on pads/synths creates the iconic 'EDM pump'.",
      ],
      analogy:
        "Like crouching every time someone throws a ball at you. The ball (kick) passes; you (bass) come back up.",
    },
    advanced: {
      what: [
        "Sidechaining means letting one signal control how a processor reacts to another. In Live's Compressor you switch the External Sidechain on and pick the trigger source (the kick) under Audio From. The compressor's detector now ignores the bass it sits on and watches the kick instead — every kick hit pulls the bass volume down, then it springs back when the kick stops.",
        "The Sidechain EQ filters the trigger signal before the detector hears it. High-passing around 100 Hz means only the kick's beater click drives the compression, not its sub-tail. Without that filter, sustained sub from the kick would keep the bass ducked the whole bar — pump turns into smear.",
        "Sidechain isn't just for kick-on-bass. Ducking a reverb return with the dry vocal opens space for the lyric and lets the tail breathe between phrases. With Max for Live's Envelope Follower you can sidechain almost any parameter — filter cutoff, delay feedback, macro position — to any audio source.",
      ],
      edgeCases: [
        "If Sidechain Audio From source is muted, gain reduction stops — bass gets loud unexpectedly.",
        "Use the EQ filter to focus the sidechain on the kick's punch frequency only.",
      ],
      engineerNotes: [
        "High-passing the sidechain trigger prevents low-end energy from over-compressing the signal and creates a more rhythmic, snappy release.",
        "Ducking reverb with the dry vocal keeps the lyric intelligible while allowing professional tail swells during vocal gaps.",
        "Using an external kick trigger track instead of the main kick ensures the sidechain stays consistent even when the drum pattern changes.",
      ],
    },
    mechanism:
      "External signal → detector → gain reduction calculator (threshold, ratio) → applied to main audio path.",
    flow: "Kick → SC Detector → GR Engine → Bass Audio Path",
    walkthrough: [
      {
        do: "On bass: Compressor → Sidechain on → Audio From: Kick.",
        listen: "Bass pumps when kick hits.",
      },
      {
        do: "Enable Sidechain EQ → high-pass at 100 Hz.",
        listen: "Compression triggers only on the kick beater click.",
      },
      { do: "Increase ratio to 8:1.", listen: "Pump becomes more dramatic." },
    ],
    listenFor: ["Bass audibly ducks each kick hit, then recovers."],
    mistakes: [
      "Threshold too low → bass barely moves.",
      "Forgetting to enable External Sidechain — compressor uses bass's own signal.",
    ],
    proMoves: [
      "Sidechain reverb returns to the dry vocal — vocal pops, reverb breathes.",
      "Use M4L Envelope Follower for sidechaining non-compressor parameters (filter cutoff, etc.).",
    ],
    quizEasy: [
      {
        q: "Sidechain typically uses…",
        options: ["Kick to duck bass", "Bass to duck kick", "Master to duck Master"],
        answer: 0,
      },
      {
        q: "Where do you enable it?",
        options: ["Compressor → Sidechain", "EQ", "Reverb"],
        answer: 0,
      },
      { q: "Audio From sets…", options: ["The trigger source", "The output", "Tempo"], answer: 0 },
    ],
    quizHard: [
      {
        q: "Sidechain EQ in Compressor lets you…",
        options: ["Filter the trigger signal", "EQ the output", "Add reverb"],
        answer: 0,
      },
      {
        q: "If trigger source is muted…",
        options: ["Compression stops", "Doubles", "Reverses"],
        answer: 0,
      },
      {
        q: "M4L Envelope Follower can…",
        options: ["Sidechain non-compressor params", "Add reverb", "Quantize"],
        answer: 0,
      },
      {
        q: "Best high-pass on SC EQ for kick?",
        options: ["~100 Hz to focus on click", "20 Hz", "10 kHz"],
        answer: 0,
      },
      {
        q: "Sidechain reverb keyed to dry vocal does what?",
        options: ["Ducks reverb when vocal sings", "Mutes reverb", "Adds delay"],
        answer: 0,
      },
    ],
    sources: [src("Compressor – Sidechain", "Live 12 Manual §22.7.3")],
  },

  // ============ WORLD 6 — PERFORMANCE & LIVE ============
  "max-for-live": {
    hook: "Your DAW becomes a programming language. Build any device imaginable.",
    beginner: {
      what: [
        "Max for Live (M4L) is a visual programming environment built into Live (Suite). Devices made in Max behave like any built-in device.",
        "Live ships with dozens of M4L devices: LFO, Envelope Follower, Pitch & Time, Buffer Shuffler, Convolution Reverb Pro, etc.",
      ],
      why: [
        "Modulate things Live can't natively (CV, OSC, custom logic).",
        "Build your own utilities and instruments without writing C++.",
      ],
      analogy: "Lego with electricity. Snap blocks together, get a working device.",
    },
    advanced: {
      what: [
        "Max for Live (M4L) is a visual programming environment baked into Live Suite. Every Max device is a patch \u2014 a graph of 'objects' wired together \u2014 that runs as a real Live device with its own UI, parameters and automation. That's how Ableton ships things like Pitch Hack, LFO and Wavetable: as Max patches with native-feeling front panels.",
        "Because M4L can read MIDI, audio, mixer state and even automate other devices, it's the official extension point for the DAW. Third-party devs use it for granular synths, generative sequencers, OSC/network bridges and visualisers; you can drop those .amxd files into Live like any preset.",
        "Patching is optional \u2014 most users only consume devices \u2014 but if you open a patch in edit mode you get the full Max language: signal-rate audio (msp), event-rate (max), Jitter for video, JS scripting and OSC. It's the ceiling of Live's customisability.",
      ],
      edgeCases: [
        "M4L devices can be CPU-heavy if poorly written; check CPU meter.",
        "Some M4L devices require Cycling '74 Max install — built-in 'Live' Edition is enough for most.",
      ],
      engineerNotes: [
        "Use live.remote~ for sample-accurate modulation of parameters that avoids the CPU overhead of standard automation. ",
        "Leverage the Live Object Model (LOM) to build custom utility scripts that automate tedious housekeeping like track coloring or routing.",
        "Bypass DAW limitations by using Max for Live to bridge external data sources like OSC, MIDI Sysex, or web APIs directly into your set.",
      ],
    },
    mechanism:
      "Max runtime inside Live → patcher graph processes audio/MIDI/control → exposes UI to Live → integrates with mapping, automation, modulation.",
    flow: "MIDI/Audio In → Max Patch → MIDI/Audio/Mod Out → Live Devices",
    walkthrough: [
      {
        do: "Drop M4L → LFO MIDI Effect on a track. Map it to a filter.",
        listen: "Filter sweeps cyclically.",
      },
      {
        do: "Try Envelope Follower → Map to delay feedback.",
        listen: "Delay swells with input volume.",
      },
      { do: "Edit a device → patcher opens.", listen: "Visual nodes editable live." },
    ],
    listenFor: ["LFOs and modulators tied to ANY parameter via Live's Map button."],
    mistakes: [
      "Editing a device and breaking it without backup.",
      "Loading too many M4L devices = CPU spikes.",
    ],
    proMoves: [
      "Build a single-purpose utility (gate, MIDI repeat) and save as a Rack — performable.",
      "Use M4L's API to script project-wide changes.",
    ],
    quizEasy: [
      {
        q: "M4L is included with which Live edition?",
        options: ["Suite", "Standard", "Lite"],
        answer: 0,
      },
      {
        q: "M4L stands for…",
        options: ["Max for Live", "MIDI for Live", "Multi for Live"],
        answer: 0,
      },
      {
        q: "M4L devices can be…",
        options: ["Instruments, MIDI FX, Audio FX", "Only MIDI FX", "Only Instruments"],
        answer: 0,
      },
    ],
    quizHard: [
      { q: "Edit mode opens…", options: ["The Max patcher", "Preferences", "Browser"], answer: 0 },
      {
        q: "M4L exposes parameters to Live's…",
        options: ["Mapping/automation/modulation", "Master only", "Sends only"],
        answer: 0,
      },
      {
        q: "Cycling '74 Max install required for…",
        options: ["Some advanced devices", "All M4L devices", "None"],
        answer: 0,
      },
      {
        q: "Built-in M4L devices include…",
        options: ["LFO, Envelope Follower, Convolution Reverb Pro", "Only LFO", "None"],
        answer: 0,
      },
      {
        q: "M4L can drive any param via…",
        options: ["Live's Map button inside the device", "Only fixed mappings", "Only macros"],
        answer: 0,
      },
    ],
    sources: [src("Max for Live", "Live 12 Manual §27")],
  },

  "push-controllers": {
    hook: "Live in the box. Push pulls it out.",
    beginner: {
      what: [
        "Push (1, 2, 3) is Ableton's hardware controller. 64 velocity-sensitive pads + encoders + display = play, sequence, mix without touching the laptop.",
        "Plug in → Live auto-detects → controller integration is instant.",
      ],
      why: [
        "Play drums and melodies expressively (real fingers, not mouse).",
        "Sequence patterns and tweak parameters away from the screen.",
      ],
      analogy: "Like a piano + drum machine + mixer baked into one box.",
    },
    advanced: {
      what: [
        "Push 3 is Ableton's flagship hardware: 64 RGB pads, two displays, encoders, an audio interface, and (in Standalone units) an internal computer running Live. Connect it to Live and the pads, screens and encoders mirror the device under your cursor \u2014 the workflow is built around never touching the mouse.",
        "Pad layout adapts to context: in melodic mode the grid is tuned to a chosen scale (so wrong notes are physically absent), in drum mode the bottom-left 16 pads are the Drum Rack and the rest become a step sequencer for the selected pad, in 64-pad mode the whole grid is a step sequencer for melodic patterns.",
        "Standalone Push runs Live's playback engine inside the controller, so a finished session can leave the laptop behind for the show. APC, Launchpad and Launchkey controllers do less but follow the same 'mirror the cursor' philosophy with deep, Live-specific firmware.",
      ],
      edgeCases: [
        "Push 3 Standalone has its own .als files; sync via Move/transfer.",
        "Custom MIDI controllers can be added via Preferences → Link/Tempo/MIDI → Control Surface.",
      ],
      engineerNotes: [
        "Scale mode transforms the 64-pad grid into a layout where melodic intervals are geometric and wrong notes are physically impossible.",
        "Using Push in standalone mode eliminates OS background tasks and latency jitter, ensuring a stable environment for live performance.",
        "The step sequencer's visual feedback on the pads allows for rhythmic micro-adjustments and polyrhythmic patterns without screen fatigue.",
      ],
    },
    mechanism:
      "Hardware → MIDI/USB → Live's Control Surface API → selected device/track parameters mirrored on the controller.",
    flow: "Push Pads/Encoders → Live → Track/Device → Audio",
    walkthrough: [
      { do: "Plug Push in.", listen: "Pads light up; mode buttons respond." },
      { do: "Hit Note mode + a pad.", listen: "Selected instrument plays." },
      { do: "Switch to Device mode.", listen: "Encoders control currently-selected device." },
    ],
    listenFor: ["Velocity-sensitive pads = expressive, not on/off."],
    mistakes: [
      "Forgetting to enable Track on the MIDI port for a non-Push controller.",
      "Letting Push display and screen disagree — it always follows screen focus.",
    ],
    proMoves: [
      "Save Push templates per project for instant recall.",
      "Use Repeat + variable rate for human-feel hat patterns.",
    ],
    quizEasy: [
      { q: "How many pads on Push?", options: ["64", "16", "32"], answer: 0 },
      {
        q: "Push 3 Standalone runs without…",
        options: ["A computer", "MIDI", "Audio interface"],
        answer: 0,
      },
      {
        q: "Detection is…",
        options: ["Automatic on plug-in", "Manual config", "Driver install"],
        answer: 0,
      },
    ],
    quizHard: [
      {
        q: "Custom controller is added via…",
        options: ["Preferences → Link/Tempo/MIDI → Control Surface", "Browser", "File menu"],
        answer: 0,
      },
      {
        q: "Push modes include…",
        options: ["Note, Session, Device, Mix, Sequencer, Browse", "Only Note", "Only Mix"],
        answer: 0,
      },
      {
        q: "Push display mirrors…",
        options: ["Detail View (selected device)", "Browser", "Master meter"],
        answer: 0,
      },
      {
        q: "Push 3 Standalone storage?",
        options: ["Internal SSD with .als files", "Cloud only", "Computer only"],
        answer: 0,
      },
      {
        q: "Repeat mode does what?",
        options: ["Auto-repeats hits at chosen rate", "Reverses", "Mutes"],
        answer: 0,
      },
    ],
    sources: [src("Push", "Live 12 Manual §32"), src("Control Surfaces", "Live 12 Manual §29")],
  },

  "midi-mapping": {
    hook: "Map any knob to any parameter in seconds.",
    beginner: {
      what: [
        "Cmd/Ctrl+M enters MIDI Map mode — every mappable parameter goes blue. Click one, move a hardware knob → mapped.",
        "Cmd/Ctrl+M again to exit. Now that hardware knob controls that parameter forever (per project, or via User Remote Scripts).",
      ],
      why: [
        "Hands-on control of any parameter without programming.",
        "Build a custom controller layout for any project.",
      ],
      analogy: "Like assigning shortcuts on your laptop, but for physical knobs.",
    },
    advanced: {
      what: [
        "MIDI Map mode (Cmd/Ctrl-M) shows every Live control as a coloured overlay. Click a control, send any CC or note from your hardware, and Live binds them — that mapping is saved with the Set. Key Map mode (Cmd/Ctrl-K) does the same for computer-keyboard keys, useful for laptops without controllers.",
        "Each mapping has a Min/Max range and a Takeover Mode (None / Pickup / Value Scaling) that decides what happens when the hardware position and the on-screen value disagree. Pickup mode makes the parameter wait for the knob to cross its current value — no jumps when you switch presets.",
        "Mappings are device-relative on Racks: map a knob to Macro 1 once and any rack swap that exposes a 'Macro 1' inherits the mapping. That's the trick behind 'one controller, every patch' performance setups.",
      ],
      edgeCases: [
        "Two parameters mapped to the same CC = both move together.",
        "Relative encoders need Mode=Relative ±64 (or matching mode) — Absolute will jump weirdly.",
      ],
      engineerNotes: [
        "Use Pickup Mode globally to prevent aggressive volume spikes and parameter jumps during live performance scene transitions.",
        "Map to Macro knobs instead of direct parameters to maintain tactile control even when swapping out core devices or instruments.",
        "Bypassing dedicated controllers for Key Mapping common toggles ensures your setup remains functional on a flight or without hardware.",
      ],
    },
    mechanism:
      "Hardware sends CC/Note → Live matches CC to mapping → scales by Min/Max → applies to mapped parameter.",
    flow: "Hardware CC → Mapping → Range Scale → Parameter",
    walkthrough: [
      { do: "Cmd/Ctrl+M → click filter cutoff → move a knob.", listen: "Knob now maps." },
      { do: "Set range Min 30, Max 90.", listen: "Knob sweeps cutoff between 30 and 90 only." },
      { do: "Set Mode Toggle on a Mute button.", listen: "Each press toggles mute." },
    ],
    listenFor: ["Mapped parameter responds smoothly across the knob's range."],
    mistakes: [
      "Forgetting to exit Map mode (still blue) — can't play.",
      "Absolute mode on relative encoders → erratic behaviour.",
    ],
    proMoves: [
      "Map Macro 1 to a knob and remap that macro inside racks per scene.",
      "Use Min>Max to invert (CW lowers value).",
    ],
    quizEasy: [
      { q: "MIDI Map shortcut?", options: ["Cmd/Ctrl+M", "Cmd/Ctrl+K", "Cmd/Ctrl+R"], answer: 0 },
      { q: "Key Map shortcut?", options: ["Cmd/Ctrl+K", "Cmd/Ctrl+M", "Cmd/Ctrl+J"], answer: 0 },
      { q: "Mappings save where?", options: ["Per project", "Global only", "Cloud"], answer: 0 },
    ],
    quizHard: [
      {
        q: "Modes include…",
        options: ["Absolute, Toggle, Relative ±64", "Only Absolute", "Only Toggle"],
        answer: 0,
      },
      {
        q: "Inverting a mapping?",
        options: ["Set Min>Max", "Hold Shift", "Cmd/Ctrl+I"],
        answer: 0,
      },
      {
        q: "Two params mapped to same CC?",
        options: ["Both move together", "Last one wins", "Errors"],
        answer: 0,
      },
      {
        q: "Global mappings live in…",
        options: ["Control Surface preset / User Remote Script", "Set file only", "Browser"],
        answer: 0,
      },
      {
        q: "Relative encoder with Absolute mode?",
        options: ["Erratic jumps", "Works perfectly", "Doesn't move"],
        answer: 0,
      },
    ],
    sources: [src("MIDI and Key Remote Control", "Live 12 Manual §29.3")],
  },

  "tempo-following": {
    hook: "Live can listen to a drummer and follow their tempo.",
    beginner: {
      what: [
        "Tempo Follower analyses an audio input and adjusts Live's tempo to match a live drummer or DJ.",
        "Set up a mic on the kick → enable Tempo Follower → Live's BPM tracks the performer.",
      ],
      why: [
        "Run backing tracks with a live band where the drummer drives tempo.",
        "Sync to external sources without clock cabling.",
      ],
      analogy:
        "Like a metronome that listens and adjusts to your drummer instead of forcing them to a click.",
    },
    advanced: {
      what: [
        "Tempo Follower listens to incoming audio (usually a drummer's overhead mic) and continually updates Live's master tempo to match. Internally it tracks transients and estimates BPM, then adjusts Live's clock so warped clips, MIDI sequences and effects all stay in time with the human in the room.",
        "It's an enabling technology more than a feature: once Live follows the band, every Session-launched loop, every effect tempo-sync and every Push step sequencer rides the same human pulse instead of forcing the band onto a click.",
        "Practical tuning matters — the Sensitivity and Smoothing controls trade off responsiveness against jitter. Too sensitive, the tempo wanders on every snare hit; too smooth, it lags through tempo changes. Most rigs sit somewhere in the middle and use a clean kick or click feed as the source.",
      ],
      edgeCases: [
        "Sparse or syncopated input = unstable tracking.",
        "Sudden tempo changes take a few bars to settle.",
      ],
      engineerNotes: [
        "Use a dedicated drum sub-mix or kick feed rather than the full master to prevent harmonic complexity from confusing the detection engine.",
        "Prioritize manual Smoothing over high Sensitivity to prevent the global clock from jittering on sloppy snare hits or ghost notes.",
        "Route the Follower signal into a separate, muted track to ensure the detection source doesn't bleed into your front-of-house mix.",
      ],
    },
    mechanism:
      "Audio in → onset detection → BPM estimation → smoothing filter → Live's master tempo.",
    flow: "Audio In → Onset Detector → BPM Estimator → Tempo Param",
    walkthrough: [
      {
        do: "Preferences → Link/Tempo/MIDI → Tempo Follower → set input.",
        listen: "Section ready.",
      },
      { do: "Enable on the transport.", listen: "Tempo number tracks the input." },
      { do: "Disable to revert to manual tempo.", listen: "Tempo locks to set BPM." },
    ],
    listenFor: ["Tempo number nudges with the live source."],
    mistakes: [
      "Using a noisy or syncopated source — tracking falls apart.",
      "Forgetting to disable when you go back to programmed material.",
    ],
    proMoves: [
      "Combine Tempo Follower + Link to drive multiple devices off the live drummer.",
      "Use a kick mic with a high-pass filter for cleaner detection.",
    ],
    quizEasy: [
      {
        q: "Tempo Follower listens to…",
        options: ["An audio input", "MIDI clock", "OSC"],
        answer: 0,
      },
      { q: "Where to enable?", options: ["Transport (clock icon)", "Browser", "Mixer"], answer: 0 },
      {
        q: "Best input source?",
        options: ["Clear percussive signal (kick mic)", "Pad", "Vocals only"],
        answer: 0,
      },
    ],
    quizHard: [
      {
        q: "Settings live in…",
        options: ["Preferences → Link/Tempo/MIDI", "Audio prefs", "Library"],
        answer: 0,
      },
      {
        q: "Sparse input causes…",
        options: ["Unstable BPM tracking", "Better tracking", "No effect"],
        answer: 0,
      },
      {
        q: "Tempo Follower + Link can…",
        options: ["Sync external devices to live drummer", "Replace ASIO", "Bypass MIDI"],
        answer: 0,
      },
      {
        q: "How does it estimate BPM?",
        options: ["Onset detection + smoothing", "Random", "Pitch tracking"],
        answer: 0,
      },
      {
        q: "Sudden tempo changes…",
        options: ["Take a few bars to settle", "Instant", "Crash"],
        answer: 0,
      },
    ],
    sources: [src("Tempo Follower", "Live 12 Manual §28.5")],
  },

  "cv-tools": {
    hook: "Send Live's signals into Eurorack. Bring Eurorack signals into Live.",
    beginner: {
      what: [
        "CV Tools is a free Pack of M4L devices for sending and receiving control voltage (CV) and gate signals to/from modular synths via your audio interface.",
        "CV Instrument turns notes into CV+Gate; CV LFO sends modulation; CV In reads a CV signal.",
      ],
      why: [
        "Integrate a Eurorack rig directly into Live's tempo and automation.",
        "Use modular as a sound source or as a controller.",
      ],
      analogy: "Like a USB cable to a 1970s synth.",
    },
    advanced: {
      what: [
        "CV (Control Voltage) is the analog modular world's way of moving values around \u2014 a voltage on a wire instead of a digital number. Live's CV Tools pack adds devices that send CV out a DC-coupled audio interface and read CV in, bridging Live's internal automation/modulation with hardware modular synths.",
        "Key devices are CV Instrument (turn MIDI notes into 1V/oct pitch + gate), CV LFO/Envelope/Shaper (dedicated modulators routed out via CV Out), CV Triggers (clock and reset for hardware sequencers) and CV In (sample an incoming voltage and use it to modulate Live parameters).",
        "Calibration matters: CV pitch is 1 volt per octave with most modular gear but Hz/V on some vintage Korg/Yamaha hardware. CV Tools includes a tuner/calibration pass per output so the rest of the rig stays in tune across patches.",
      ],
      edgeCases: [
        "Audio interface MUST have DC-coupled outputs for CV out to work correctly.",
        "Latency depends on audio buffer — keep low for tight clocking.",
      ],
      engineerNotes: [
        "Always run the calibration routine on the CV Instrument device to compensate for non-linearities in your interface's analog circuitry.",
        "Use CV Clock Out as the master sync source because hardware sequencers track analog pulses more reliably than MIDI clock jitter.",
        "Route CV In to an Expression Control device to map modular knobs or sensors to any parameter inside the Ableton rack.",
      ],
    },
    mechanism: "M4L device → audio output (DC-coupled) → modular CV input.",
    flow: "Live MIDI/Mod → CV Tools → Audio Out → Modular",
    walkthrough: [
      {
        do: "Install CV Tools (free Pack). Drop CV Instrument on a track.",
        listen: "Outputs CV+Gate to selected audio out.",
      },
      { do: "Calibrate V/Oct against your oscillator.", listen: "Notes track 1V/octave." },
      { do: "Add CV LFO → modulate filter cutoff.", listen: "Modular filter sweeps in tempo." },
    ],
    listenFor: ["Tight tempo sync and accurate pitch tracking after calibration."],
    mistakes: [
      "Using AC-coupled outputs — DC drifts; modular won't track.",
      "Skipping calibration → out-of-tune notes.",
    ],
    proMoves: [
      "CV Clock Out lets the modular slave to Live's tempo perfectly.",
      "Use CV In + Envelope Follower to modulate Live params from modular CV.",
    ],
    quizEasy: [
      {
        q: "CV stands for…",
        options: ["Control Voltage", "Click Volume", "Channel Vector"],
        answer: 0,
      },
      {
        q: "CV Tools is…",
        options: ["A free M4L Pack", "A paid plugin", "Built into Live Lite"],
        answer: 0,
      },
      {
        q: "Hardware required?",
        options: ["DC-coupled audio interface", "MIDI interface", "USB hub"],
        answer: 0,
      },
    ],
    quizHard: [
      {
        q: "1V/octave is…",
        options: ["Pitch standard for most modulars", "Volume standard", "Tempo standard"],
        answer: 0,
      },
      {
        q: "AC-coupled outputs can carry CV?",
        options: ["No (drifts)", "Yes, perfectly", "Only with adapter"],
        answer: 0,
      },
      {
        q: "Live tempo to modular via…",
        options: ["CV Clock Out", "MIDI Clock", "OSC"],
        answer: 0,
      },
      {
        q: "Calibration matches…",
        options: ["Live's CV to the synth's V/Oct standard", "Sample rate", "Buffer size"],
        answer: 0,
      },
      {
        q: "Latency with CV?",
        options: ["Tied to audio buffer", "Always 0", "Always 100 ms"],
        answer: 0,
      },
    ],
    sources: [src("CV Tools (Pack)", "Ableton Pack documentation")],
  },

  "ableton-link": {
    hook: "Wireless tempo sync between any Link-enabled apps and devices on the same network.",
    beginner: {
      what: [
        "Ableton Link syncs tempo and beat between multiple devices over Wi-Fi. Two laptops, a phone, and a hardware Link-compatible drum machine all stay in time.",
        "Enable in Preferences → Link/Tempo/MIDI → Link on. Any other Link-enabled app on the network joins automatically.",
      ],
      why: [
        "Jam with another producer or musician's setup without cables.",
        "Sync iPad music apps with Live in seconds.",
      ],
      analogy: "Like everyone tuning in to the same radio station for the conductor's tempo.",
    },
    advanced: {
      what: [
        "Link is a beat-synchronisation protocol over local network. Every Link-enabled app on the same WiFi (or wired LAN) sees a shared tempo and beat grid; start one device and the others fall into phase, change tempo on one and the rest follow. There is no master/slave — every peer is equal.",
        "Inside Live the Link button lives next to the metronome. Once enabled, your Set's tempo, downbeat phase and Start Stop sync (optional) become part of the shared session. Multiple Lives, iOS apps (Koala, Loopy, AUM), Reason, Maschine, Traktor \u2014 anything that supports Link \u2014 joins the same musical clock.",
        "Because it's network-time-protocol-based rather than MIDI-clock-based, jitter is far lower than MIDI sync over USB hubs, and it's resilient to one peer hiccuping. It's how laptop DJ-and-producer collabs work without anyone running cable.",
      ],
      edgeCases: [
        "Firewalls/VPNs can block Link discovery — peers won't see each other.",
        "Tempo changes ramp smoothly, not instantly — a peer changing tempo nudges the group.",
      ],
      engineerNotes: [
        "Choose Link over MIDI clock to eliminate jitter and latency compensation headaches inherent in old serial-based sync protocols.",
        "Eliminate a single point of failure by using peer-to-peer sync where any participant can adjust tempo or drop out without stopping the set.",
        "Enable Start/Stop Sync to align long-form arrangements across multiple laptops without needing complex hardware clock distribution.",
      ],
    },
    mechanism:
      "Local network → Link discovery → shared phase/timeline → each peer aligns its transport.",
    flow: "Device A Tempo → Link Network → Devices B, C, D",
    walkthrough: [
      { do: "Preferences → Link on.", listen: "'Link 0' becomes 'Link 1' as another peer joins." },
      { do: "Hit Start Stop Sync.", listen: "Play/stop syncs across peers." },
      { do: "Change tempo on one device.", listen: "Others ramp to match." },
    ],
    listenFor: ["Counter shows number of connected peers."],
    mistakes: [
      "Using a guest network that isolates clients — Link can't see peers.",
      "Forgetting Start Stop Sync — tempo locks but transport doesn't.",
    ],
    proMoves: [
      "Use Link with iPad sequencers for hybrid setups.",
      "Two Live machines on Link = redundant performance + shared scenes.",
    ],
    quizEasy: [
      {
        q: "Link syncs over…",
        options: ["Local network (Wi-Fi/Ethernet)", "USB", "MIDI cable"],
        answer: 0,
      },
      {
        q: "Where to enable?",
        options: ["Preferences → Link/Tempo/MIDI", "Mixer", "Browser"],
        answer: 0,
      },
      { q: "Counter shows…", options: ["Number of connected peers", "BPM", "Bars"], answer: 0 },
    ],
    quizHard: [
      {
        q: "Start Stop Sync does what?",
        options: ["Syncs play/stop too", "Stops Link", "Resets tempo"],
        answer: 0,
      },
      { q: "Tempo changes are…", options: ["Smoothed/ramped", "Instant", "Random"], answer: 0 },
      {
        q: "Common blocker for Link discovery?",
        options: ["Guest network / firewall", "MIDI driver", "Sample rate"],
        answer: 0,
      },
      {
        q: "Link works with…",
        options: ["Many third-party apps and hardware", "Only Ableton apps", "Only iOS"],
        answer: 0,
      },
      {
        q: "Each peer can change tempo?",
        options: ["Yes, others follow", "No, only host", "Only iPad"],
        answer: 0,
      },
    ],
    sources: [src("Ableton Link", "Live 12 Manual §28.4")],
  },

  // ============ WORLD 7 — SHIP IT ============
  exporting: {
    hook: "Render your song into a file the world can play.",
    beginner: {
      what: [
        "File → Export Audio/Video. Pick what to render (Master, individual tracks, returns), the file format (WAV, AIFF, FLAC, MP3), bit depth, sample rate, and dithering if downsampling.",
        "Click Export → Live renders the selection in the background.",
      ],
      why: ["Share your finished mix as MP3 or WAV.", "Bounce stems for collaboration or remixes."],
      analogy:
        "Like printing a photo. The negative (project) stays; the print (file) is what you share.",
    },
    advanced: {
      what: [
        "Export Audio/Video (Cmd/Ctrl-Shift-R) renders the Master (or any selected track/return) to a file. The dialog lets you pick render length, sample rate, bit depth, file format (WAV/AIFF/FLAC/MP3), dither (only when reducing bit depth), and whether to include the master effects, the metronome and the loop region.",
        "Render-as-loop pads the start so the first beat's reverb/delay tails wrap into the end of the file \u2014 essential for clean loops. Normalize peaks to 0 dBFS, but for streaming masters most engineers leave 1 dB headroom and target -14 LUFS integrated rather than maxing the peak.",
        "Real-Time render forces Live to play the Set audibly while exporting, which is required when external hardware (synths over External Instrument, MIDI-out devices) is part of the chain \u2014 offline render can't drive hardware in real time.",
      ],
      edgeCases: [
        "Dither when going from 32-bit float to 16-bit. Skip dither between same bit depths.",
        "Loop range or selection sets render bounds — accidentally short selection = clipped render.",
      ],
      engineerNotes: [
        "Always use 'Render as Loop' for electronic patterns to ensure reverb and delay tails wrap seamlessly back to the start.",
        "Force 'Real-Time Render' when using external hardware or outboard gear to ensure MIDI triggers and analog signals are captured.",
        "Avoid the Normalize function and instead leave 1.0 dB of true peak headroom to prevent inter-sample clipping during lossy conversion.",
      ],
    },
    mechanism:
      "Live plays selection through routed signal chain → captures master (or per-track) buffer → writes to disk in chosen format.",
    flow: "Project → Render Selection → Encoder → File on Disk",
    walkthrough: [
      {
        do: "Set the loop brace to your full song. File → Export Audio/Video.",
        listen: "Dialog opens.",
      },
      { do: "Pick WAV 24-bit 48 kHz, Master only.", listen: "Reasonable mastering source." },
      { do: "Pick MP3 320 kbps for sharing.", listen: "Smaller file, near-CD quality." },
    ],
    listenFor: ["Status bar shows render progress and elapsed time."],
    mistakes: [
      "Forgetting to set the export range — renders only the loop brace.",
      "Exporting MP3 as your master — keep WAV/AIFF as the master.",
    ],
    proMoves: [
      "Export stems for collaboration: All Individual Tracks at 24-bit WAV.",
      "Use Render Real-Time when an external hardware synth or pedal is in the chain.",
    ],
    quizEasy: [
      {
        q: "Export menu?",
        options: ["File → Export Audio/Video", "File → Save", "Edit → Render"],
        answer: 0,
      },
      { q: "Common share format?", options: ["MP3", "OGG", "FLAC"], answer: 0 },
      { q: "Common master format?", options: ["WAV 24-bit", "MP3 192", "OGG"], answer: 0 },
    ],
    quizHard: [
      { q: "Dither when?", options: ["Going to lower bit depth", "Always", "Never"], answer: 0 },
      {
        q: "Render Real-Time is for…",
        options: ["External hardware in signal chain", "Faster bouncing", "MIDI export"],
        answer: 0,
      },
      {
        q: "Stems = ",
        options: ["All individual tracks rendered", "Master in mono", "MP3 of project"],
        answer: 0,
      },
      {
        q: "Render bounds set by?",
        options: ["Selection or loop brace", "Master fader", "Buffer size"],
        answer: 0,
      },
      {
        q: "Best master output bit depth?",
        options: ["24 or 32-bit", "16-bit", "8-bit"],
        answer: 0,
      },
    ],
    sources: [src("Exporting Audio and Video", "Live 12 Manual §5.2")],
  },

  "live-sets-projects": {
    hook: "Save like a pro. Never lose a session again.",
    beginner: {
      what: [
        "A Live Set (.als) is your song. A Project is the folder around it (Samples, presets, .als).",
        "File → Save the first time, into a NEW folder named after the song. Then File → Collect All and Save before closing.",
      ],
      why: [
        "Move folders between drives without breaking sample paths.",
        "Email a collaborator a working project in one zip.",
      ],
      analogy:
        "The .als is the recipe; the Project folder is the ingredients box. Always travel together.",
    },
    advanced: {
      what: [
        "File → Save Live Set As Template stores your default starting layout (tracks, sends, devices, view).",
        "File → Manage Files → Manage Project lists missing samples, unused samples, plugin info — clean up before archiving.",
      ],
      edgeCases: [
        "Auto-save uses Crash Recovery (Preferences → File/Folder); not a substitute for File → Save.",
        "Live keeps backups inside the Project's Backup folder — useful when you wreck a session.",
      ],
      engineerNotes: [
        "Templates eliminate decision fatigue by pre-routing utility tracks and favorite meters before the creative process begins.",
        "The Collect All and Save command is non-negotiable for project portability to prevent broken sample links across different machines.",
        "Using Manage Project to purge unused samples is the most efficient way to reduce cloud storage costs and bloat before archival.",
      ],
    },
    mechanism:
      "Save writes .als + samples + analysis files. Open re-resolves paths against Project, User Library, Last-Known.",
    flow: "Project Folder ↔ .als + Samples + Analysis Files",
    walkthrough: [
      { do: "File → Save → new folder.", listen: "Project structure created." },
      { do: "File → Collect All and Save → tick all sources.", listen: "All samples copy in." },
      { do: "File → Manage Files → Manage Project.", listen: "Cleanup audit appears." },
    ],
    listenFor: ["Status: 'X files collected'."],
    mistakes: [
      "Saving multiple songs into one folder — sample path conflicts later.",
      "Forgetting Crash Recovery isn't a save — it's only a one-time recovery.",
    ],
    proMoves: [
      "Save a Template after configuring your default tracks/sends.",
      "Periodically clean Backups inside Project to slim folder size.",
    ],
    quizEasy: [
      { q: ".als is…", options: ["Live Set", "Live Pack", "Audio sample"], answer: 0 },
      {
        q: "Bundle samples with project via…",
        options: ["Collect All and Save", "Save As", "Export"],
        answer: 0,
      },
      {
        q: "Template stores…",
        options: ["Default starting layout", "Master fader", "Tempo only"],
        answer: 0,
      },
    ],
    quizHard: [
      {
        q: "Manage Project shows…",
        options: ["Missing/unused samples + plugin info", "Tempo", "Volume"],
        answer: 0,
      },
      {
        q: "Crash Recovery is…",
        options: ["A safety net, not a save replacement", "Auto-save", "Cloud backup"],
        answer: 0,
      },
      {
        q: "Path resolution order starts at…",
        options: ["Project folder", "User Library", "Absolute path"],
        answer: 0,
      },
      {
        q: "Backups live in…",
        options: ["Project's Backup folder", "User Library", "Cloud"],
        answer: 0,
      },
      {
        q: "Save As Template via…",
        options: ["File → Save Live Set As Template", "Preferences", "Browser"],
        answer: 0,
      },
    ],
    sources: [
      src("Managing Files and Sets", "Live 12 Manual §7"),
      src("Collect All and Save", "Live 12 Manual §7.7"),
    ],
  },

  troubleshooting: {
    hook: "When Live misbehaves, the fix is usually obvious — once you know where to look.",
    beginner: {
      what: [
        "No sound? Check audio device + master fader + Cue out routing.",
        "Crackles? Increase buffer size in Preferences → Audio.",
        "MIDI controller dead? Check Preferences → Link/Tempo/MIDI → enable Track on the input port.",
      ],
      why: [
        "Most issues take 30 seconds to fix once you know the trick.",
        "Save hours of forum-searching with a clear checklist.",
      ],
      analogy: "Like rebooting your router — fixes 90% of the issues, 90% of the time.",
    },
    advanced: {
      what: [
        "Live's first-line debug tools live in Preferences \u2192 Audio (Buffer Size, Sample Rate, In/Out Latency) and the Status Bar at the bottom (CPU meter, disk overload light, MIDI in/out activity). 80% of 'why is it crackling' problems are buffer size set too low for the current device count.",
        "Frozen tracks (Right-click track → Freeze) bounce a track + its devices to a temporary audio file so the CPU stops calculating them in real time; Flatten then commits that bounce permanently. Use Freeze on heavy synths and convolution reverbs whenever the CPU climbs above ~70%.",
        "When a project file refuses to open, Collect All and Save into a fresh folder, then try opening the .als from inside that folder \u2014 Live often recovers from missing-sample errors that way. Crash logs live in Preferences \u2192 Library \u2192 'Show in Finder/Explorer' under the Crashes folder for support tickets.",
      ],
      edgeCases: [
        "Project won't open: try Live's recovery mode (File → Open from Backup) inside the project folder.",
        "Plugin missing: Live shows red alert; relink via right-click → 'Show Plug-In Folder'.",
      ],
      engineerNotes: [
        "Increasing buffer size is the fastest fix for CPU spikes, while small buffers are strictly for monitoring input during recording.",
        "Freeze tracks to reclaim CPU headroom on heavy plugins without losing the ability to tweak your MIDI or automation later.",
        "Bypassing corrupt project loads by opening pieces through the Live Browser is more reliable than double-clicking a failing .als file.",
      ],
    },
    mechanism:
      "Each subsystem (Audio, MIDI, CPU, Plugins, Files) has its own check; isolate by section.",
    flow: "Symptom → Subsystem → Check → Fix",
    walkthrough: [
      {
        do: "No sound: Preferences → Audio → check device + buffer.",
        listen: "Test tone confirms output.",
      },
      { do: "Crackles: raise buffer to 512.", listen: "Glitch-free playback." },
      {
        do: "Controller dead: Link/Tempo/MIDI → enable Track on input port.",
        listen: "Pads light up.",
      },
    ],
    listenFor: ["Test tone, controller LEDs, transport CPU meter."],
    mistakes: [
      "Trying to fix without isolating subsystem.",
      "Ignoring the CPU meter when crackles appear.",
    ],
    proMoves: [
      "Freeze (right-click track → Freeze) before Flatten to lock down CPU-heavy chains.",
      "Bundle a Crash Report when filing tickets — Ableton support fixes faster.",
    ],
    quizEasy: [
      {
        q: "Crackles fix?",
        options: ["Raise buffer size", "Lower volume", "Restart Live"],
        answer: 0,
      },
      {
        q: "Controller silent — check what?",
        options: ["Track on MIDI input port", "Master fader", "Cue out"],
        answer: 0,
      },
      { q: "Test tone where?", options: ["Preferences → Audio", "Browser", "Mixer"], answer: 0 },
    ],
    quizHard: [
      {
        q: "Freeze does what?",
        options: ["Pre-renders track to save CPU", "Mutes track", "Locks volume"],
        answer: 0,
      },
      {
        q: "Project won't open — try…",
        options: ["Open from Backup folder", "Reinstall Live", "Update macOS"],
        answer: 0,
      },
      {
        q: "Plugin missing — relink via…",
        options: ["Right-click → Show Plug-In Folder", "File → Save", "Browser → Refresh"],
        answer: 0,
      },
      {
        q: "CPU meter lives…",
        options: ["Top transport bar", "Master strip", "Browser"],
        answer: 0,
      },
      {
        q: "Crash logs (Mac) live in…",
        options: ["~/Library/Logs/DiagnosticReports/", "Desktop", "/Applications/"],
        answer: 0,
      },
    ],
    sources: [
      src("Troubleshooting & Resources", "Live 12 Manual §31"),
      src("Audio I/O & CPU Load", "Live 12 Manual §10.7"),
    ],
  },

  // ============ NEW MISSIONS (round 1 expansion) ============
  "capture-midi": {
    hook: "Live is always quietly listening. Capture rebuilds the take you didn't know you wanted.",
    beginner: {
      what: [
        "Even when the red Record button is off, Live keeps a rolling buffer of every MIDI note that comes in. Capture pulls that buffer out and turns it into a clip.",
        "Press the camera-shaped Capture button at the top-left and the notes you just played land on the armed MIDI track, in time, ready to edit.",
        "It works at any tempo and Live will even guess the tempo from your performance if the project hasn't started playing yet.",
      ],
      why: [
        "You never lose a happy accident again.",
        "Practise freely; commit only the moments worth keeping.",
        "Removes the pressure of 'arming and waiting' that kills first-take feel.",
      ],
      analogy:
        "Like saying 'wait, what did I just say?' and your phone replaying the last 30 seconds for you.",
    },
    advanced: {
      what: [
        "Capture works because Live's MIDI engine writes incoming events into a per-track ring buffer the moment you arm an instrument or load it onto a track. Pressing Capture freezes that buffer into a clip on the armed track.",
        "If transport is stopped, Live derives the clip's tempo from the gaps between your notes and snaps it to the nearest sensible BPM, then sets the project tempo to match. If transport was already running, the clip locks to the project tempo and existing grid.",
        "Captured clips are normal MIDI clips: they keep velocity, channel, MPE expression, and any controller messages. You can quantize, transpose or split them like anything else.",
      ],
      edgeCases: [
        "Capture only sees notes that reached an armed MIDI track — instruments on disarmed tracks pass through but aren't buffered.",
        "External MIDI clock sync can override Capture's tempo guess; in that case Live uses the incoming clock instead.",
      ],
      engineerNotes: [
        "Producers often arm a 'sketch' track at the start of every session and leave it armed all day; Capture turns it into a permanent take pool.",
        "Capture pairs beautifully with Take Lanes — capture the idea, then loop-record passes underneath it for refinement.",
      ],
    },
    mechanism:
      "MIDI in → ring buffer per armed track → press Capture → buffer materialises as a tempo-locked MIDI clip.",
    flow: "Controller → MIDI In → Armed Track Buffer → Capture → New Clip",
    walkthrough: [
      {
        do: "Arm a MIDI track with any instrument and noodle for 20 seconds without pressing Record.",
        listen: "Nothing visible — but Live is buffering.",
      },
      {
        do: "Hit the Capture button (top-left, camera icon).",
        listen: "A new clip appears with your performance, time-corrected.",
      },
      { do: "Press Play.", listen: "Project tempo now matches your performance." },
    ],
    listenFor: [
      "Capture's auto-tempo nailing your groove.",
      "MPE expression preserved on captured clips.",
    ],
    mistakes: [
      "Forgetting to arm a track — no buffer, no capture.",
      "Hitting Capture mid-take and getting only the partial buffer.",
    ],
    proMoves: [
      "Bind Capture to a controller pad for one-handed recall.",
      "Capture, then immediately Take-Lane-loop-record to refine.",
    ],
    quizEasy: [
      {
        q: "Does Capture need Record armed before you play?",
        options: ["Yes", "No, just track armed"],
        answer: 1,
      },
      {
        q: "What does Capture turn the buffer into?",
        options: ["A MIDI clip on the armed track", "A wav file"],
        answer: 0,
      },
      { q: "What's the icon?", options: ["Camera", "Microphone", "Lightning"], answer: 0 },
    ],
    quizHard: [
      {
        q: "Capture sets project tempo when…",
        options: ["Transport is stopped", "Always", "Never"],
        answer: 0,
      },
      { q: "Captured clips preserve MPE?", options: ["Yes", "No"], answer: 0 },
      {
        q: "Capture buffers events on…",
        options: ["Armed MIDI tracks", "All tracks", "Master only"],
        answer: 0,
      },
      {
        q: "External MIDI clock sync makes Capture…",
        options: ["Use the incoming clock for tempo", "Disable", "Crash"],
        answer: 0,
      },
      {
        q: "Best partner workflow?",
        options: ["Capture → Take Lanes refinement", "Capture → Freeze", "Capture → Export"],
        answer: 0,
      },
    ],
    sources: [src("Capture MIDI", "Live 12 Manual §16.6")],
  },

  "take-lanes": {
    hook: "Pros don't sing it perfect. They sing it five times and steal the best half-second from each.",
    beginner: {
      what: [
        "Take Lanes are extra rows that appear underneath any audio or MIDI track. Every time you loop-record, the new pass lands on a fresh lane while the old ones stay visible below.",
        "When you've got a few takes, you draw across the parts you want and Live copies them up to the main lane. That stitched-together main lane is called the 'comp'.",
        "Nothing is ever deleted: muted regions stay in the lanes underneath so you can change your mind tomorrow.",
      ],
      why: [
        "Vocals, guitar solos, drum fills — instantly studio-grade.",
        "Lets you commit to a comfortable performance instead of straining for one perfect take.",
        "Same workflow for MIDI — comp the best fills out of five passes.",
      ],
      analogy: "Like recording five voicemails and texting your friend the highlights only.",
    },
    advanced: {
      what: [
        "Take Lanes (introduced Live 11) attach as child rows to a single track lane. Each loop-record pass writes to a new lane while the previous take is preserved un-muted on its own lane.",
        "Selecting a region on any lane copies that region up to the parent lane and mutes the corresponding region on every other lane — that's the comp. It's non-destructive: clear the comp and the original lanes return.",
        "Lanes share the track's devices and routing; you're comping pre-effects audio (or MIDI), so any plugin chain remains a single processing path.",
      ],
      edgeCases: [
        "Crossfades between comped regions are automatic but can be edited per-clip in Arrangement.",
        "MIDI comping behaves the same way but operates on whole MIDI clips rather than waveform regions; long phrases comp better than per-note slices.",
        "Linked-Track Editing lets you comp several tracks (e.g. multi-mic drums) in lockstep.",
      ],
      engineerNotes: [
        "Always loop-record into Take Lanes rather than over the previous take — you keep an undo history that survives even after you save and close.",
        "Name lanes ('soft pass', 'belt pass', 'whisper') before you record so the comp UI stays readable two days later.",
      ],
    },
    mechanism:
      "Loop record → each pass = new child lane → drag to select best regions → regions promote to parent lane and mute siblings → result is the comp.",
    flow: "Loop Record → Lane 1 → Lane 2 → Lane 3 → Drag-select best → Comp on Parent Lane",
    walkthrough: [
      {
        do: "Right-click an audio track → Show Take Lanes. Loop-record three vocal passes.",
        listen: "Three lanes appear under the track, all preserved.",
      },
      {
        do: "Click-drag across the strongest second of each lane.",
        listen: "Selected regions jump to the parent lane; siblings auto-mute.",
      },
      {
        do: "Solo the parent lane and play.",
        listen: "Crossfades stitch the comp together seamlessly.",
      },
    ],
    listenFor: [
      "Auto-crossfades between comped regions.",
      "Original takes still audible when you click their lane solo.",
    ],
    mistakes: [
      "Recording over the previous take instead of looping into a new lane.",
      "Comping micro-slices on MIDI — work in phrases, not single notes.",
    ],
    proMoves: [
      "Pair with Linked-Track Editing to comp drum mics together.",
      "Name every lane immediately — future-you needs it.",
    ],
    quizEasy: [
      { q: "Take Lanes were introduced in…", options: ["Live 9", "Live 11", "Live 12"], answer: 1 },
      {
        q: "The 'comp' lives on…",
        options: ["The parent (top) lane", "A return", "The Master"],
        answer: 0,
      },
      { q: "Take Lanes work with…", options: ["Audio only", "MIDI only", "Both"], answer: 2 },
    ],
    quizHard: [
      {
        q: "Selecting a region on a child lane…",
        options: ["Promotes to parent + mutes siblings", "Deletes other lanes", "Renders to disk"],
        answer: 0,
      },
      {
        q: "Comping happens at which signal stage?",
        options: ["Pre-device-chain", "Post-master", "After export"],
        answer: 0,
      },
      {
        q: "Linked-Track Editing helps when comping…",
        options: ["Multi-mic drums together", "MIDI only", "Returns"],
        answer: 0,
      },
      {
        q: "Crossfades between comped regions are…",
        options: ["Automatic, editable per-clip", "Manual only", "Disabled"],
        answer: 0,
      },
      {
        q: "Cleared comp →",
        options: ["Original lanes return un-muted", "Lanes deleted", "Track resets"],
        answer: 0,
      },
    ],
    sources: [
      src("Take Lanes", "Live 12 Manual §17.3"),
      src("Comping Recordings", "Live 12 Manual §17.3.4"),
    ],
  },

  "mpe-tuning": {
    hook: "MIDI was built for pianos. MPE turns it into a violin. Tuning Systems let you leave 12-EDO entirely.",
    beginner: {
      what: [
        "Normal MIDI sends one pitch-bend wheel for the whole keyboard, so if you bend one note, every note bends. MPE (MIDI Polyphonic Expression) gives every note its own bend, slide, and pressure channel.",
        "On an MPE controller (Push 3 pads, Roli Seaboard, LinnStrument) you can press harder on one note and only that note gets brighter, or slide one finger and only that note's pitch glides.",
        "Tuning Systems (Live 12) let the whole project play in something other than the standard 12-notes-per-octave system — load a Scala file and you can play just intonation, 24-EDO, historical temperaments, or your own custom scale.",
      ],
      why: [
        "Vocal-style vibrato and slides on a synth, per finger.",
        "Microtonal music without leaving Live.",
        "Dynamic timbre that follows touch instead of a fixed velocity stamp.",
      ],
      analogy:
        "Standard MIDI is like a piano: you hit the key, the hammer falls, done. MPE is like a guitar: after you pluck, you can still bend, vibrate and palm-mute that one string.",
    },
    advanced: {
      what: [
        "MPE allocates a separate MIDI channel to each held note (member channels) plus one master channel, allowing per-note Pitch Bend, CC74 (slide / brightness), and Channel Pressure. Live 11+ routes member-channel data into MPE-aware devices (Wavetable, Sampler, Drift, Meld, Operator, Drum Rack pads).",
        "Tuning Systems (Live 12) replace the equal-tempered note-to-frequency table at the project level. Devices that opt in (Wavetable, Operator, Sampler, Meld, Drift, External Instrument with pitch-bend, plus most third-party plugins via Note Expression) re-tune in real time.",
        "Scala (.scl) and KBM (.kbm) files describe scale ratios and keyboard mapping respectively; Live also exposes a built-in editor for quick tweaks without external files.",
      ],
      edgeCases: [
        "MPE data is stored in the MIDI clip; non-MPE devices ignore the extra channels but pass them through to anything chained after.",
        "Tuning Systems retune via internal pitch-bend on each note — devices that don't support pitch-bend (rare) won't follow the tuning.",
        "Drum Rack pads in MPE mode let you bend a single hi-hat without affecting the kick.",
      ],
      engineerNotes: [
        "Record MPE performances at full controller resolution; you can always quantize / strip later, but you can never re-add expression that wasn't captured.",
        "When swapping a non-MPE synth for an MPE synth, re-record the part — translating note-only data to expressive data after the fact rarely sounds convincing.",
      ],
    },
    mechanism:
      "Per-note MIDI channel → device receives pitch-bend / pressure / slide per voice → tuning table maps note number to frequency via the active Tuning System.",
    flow: "MPE Controller → Per-Note Channels → MPE Device → Tuning Table → Audio",
    walkthrough: [
      {
        do: "Load Wavetable on a MIDI track and enable MPE in the device header.",
        listen: "Pressure on one Push pad bends only that note.",
      },
      {
        do: "Open the Tuning panel (top bar) and load a Scala file.",
        listen: "The same MIDI clip now plays in the new tuning.",
      },
      {
        do: "Play a chord and add slide on one finger.",
        listen: "Single voice glides while others sit still.",
      },
    ],
    listenFor: [
      "One-note vibrato while a chord sustains.",
      "Microtonal beating intervals when not in 12-EDO.",
    ],
    mistakes: [
      "Using a non-MPE synth and wondering why the bends are global.",
      "Forgetting to enable MPE per device — most ship MPE-off by default.",
    ],
    proMoves: [
      "Combine MPE pressure → filter cutoff for breath-controller-style expression.",
      "Save your favourite tunings as .scl files in the User Library for instant recall.",
    ],
    quizEasy: [
      {
        q: "MPE stands for…",
        options: ["MIDI Polyphonic Expression", "Multi Patch Editor"],
        answer: 0,
      },
      { q: "Tuning Systems shipped in…", options: ["Live 11", "Live 12"], answer: 1 },
      { q: ".scl files describe…", options: ["Scale ratios", "Sample loops"], answer: 0 },
    ],
    quizHard: [
      {
        q: "MPE assigns each held note…",
        options: ["Its own MIDI channel", "Its own track", "A new clip"],
        answer: 0,
      },
      { q: "Slide expression rides on…", options: ["CC74", "CC1", "Pitch bend"], answer: 0 },
      {
        q: "Tuning Systems retune via…",
        options: ["Per-note pitch bend behind the scenes", "Sample-rate change", "Resampling"],
        answer: 0,
      },
      {
        q: "MPE devices in Live 12 include…",
        options: ["Wavetable, Sampler, Drift, Meld, Operator", "Compressor", "EQ Eight"],
        answer: 0,
      },
      {
        q: "Drum Rack MPE lets you…",
        options: ["Bend single pads independently", "Resize cells", "Add reverb"],
        answer: 0,
      },
    ],
    sources: [src("MPE", "Live 12 Manual §16.10"), src("Tuning Systems", "Live 12 Manual §16.11")],
  },

  meld: {
    hook: "Two synth engines, MPE-first, designed to feel alive under your fingers.",
    beginner: {
      what: [
        "Meld is a synthesiser that came with Live 12. It has two sound engines stacked together so every note plays both at once — that's why pads and leads from Meld already sound thick out of the box.",
        "Each engine can be a different type: classic analog-style, FM, additive, formant (vowel-y), or noise. Mixing two unlike engines is what gives Meld its character.",
        "It was built around MPE, so on a Push 3 (or any expressive controller) every finger controls its own brightness, slide and bend.",
      ],
      why: [
        "Big evolving pads with no extra layering.",
        "Expressive leads that respond to touch, not just velocity.",
        "Designed to make sound design exploratory — twist the macros and stumble into ideas.",
      ],
      analogy:
        "Two singers harmonising — together they sound bigger and more interesting than either alone.",
    },
    advanced: {
      what: [
        "Meld is a bi-timbral, MPE-native synth. Voice = Engine A + Engine B run in parallel through a shared filter and amp section, then through the modulation matrix.",
        "Each engine offers multiple oscillator models (Classic, Noise, FM, Formant, Additive) with model-specific parameters. The two engines share envelopes and LFOs but have independent levels, detune and panning, which is what produces Meld's characteristic 'ensemble' weight.",
        "The modulation matrix exposes all major destinations to per-note pressure, slide, velocity, two LFOs and two envelopes, with quick macro mapping from the device header for performance use.",
      ],
      edgeCases: [
        "Detuning Engine A and B by a few cents instantly fattens unison patches; large detune values make Meld sound like two synths fighting — useful sparingly.",
        "MPE behaviour is opt-in per device — make sure the MPE switch in Meld's header is on before you record expressive performances.",
      ],
      engineerNotes: [
        "Treat Meld as a sound-design instrument first: load a preset, hit randomize on a destination, keep what surprises you.",
        "Routing macro variations through Meld macros gives you instant patch morphing for live sets.",
      ],
    },
    mechanism:
      "MIDI + MPE → Engine A osc + Engine B osc (parallel) → shared filter / amp → mod matrix → output.",
    flow: "MIDI/MPE → Engine A + Engine B → Filter → Amp → Mod Matrix → Out",
    walkthrough: [
      {
        do: "Load Meld, pick a pad preset, play a chord.",
        listen: "Wide, layered character from one device.",
      },
      { do: "Detune Engine B by +5 cents.", listen: "Chord widens and thickens." },
      {
        do: "Map mod-wheel → Engine B level via the matrix.",
        listen: "Mod-wheel morphs from one timbre into a layered timbre.",
      },
    ],
    listenFor: [
      "Two-engine layering even on a single note.",
      "Per-finger expression on an MPE controller.",
    ],
    mistakes: [
      "Leaving MPE off and wondering why expressive controllers don't track.",
      "Cranking detune until the patch sounds chorus-soaked instead of unified.",
    ],
    proMoves: [
      "Macro Variations + Meld macros = patch morph snapshots.",
      "Pair Meld with Hybrid Reverb for big cinematic pads in two devices flat.",
    ],
    quizEasy: [
      { q: "Meld shipped in…", options: ["Live 11", "Live 12"], answer: 1 },
      { q: "How many sound engines per voice?", options: ["1", "2", "4"], answer: 1 },
      { q: "Meld is designed for…", options: ["MPE expression", "Mastering"], answer: 0 },
    ],
    quizHard: [
      {
        q: "Engine A and B share which sections?",
        options: ["Filter and amp", "Oscillators", "Output bus"],
        answer: 0,
      },
      {
        q: "MPE in Meld is…",
        options: ["Opt-in per device", "Always on", "Unsupported"],
        answer: 0,
      },
      {
        q: "Engine model options include…",
        options: ["Classic, FM, Additive, Formant, Noise", "Sample, Tape, Vinyl", "Compressor, EQ"],
        answer: 0,
      },
      {
        q: "Mod matrix sources include…",
        options: ["Pressure, slide, velocity, 2 LFOs, 2 envelopes", "Only velocity", "Only LFO"],
        answer: 0,
      },
      {
        q: "Easy width trick?",
        options: ["Detune Engine B a few cents", "Add reverb", "Boost EQ"],
        answer: 0,
      },
    ],
    sources: [src("Meld", "Live 12 Manual §24.6")],
  },

  "drum-sampler": {
    hook: "One device per pad, replacing the old Simpler-plus-stack workflow.",
    beginner: {
      what: [
        "Drum Sampler is the new default device on each Drum Rack pad in Live 12. It plays one-shot drum samples and adds the shaping you used to chain after Simpler — pitch envelope, drive, filter, compression — all in one panel.",
        "Drag a folder of velocity layers in and it maps them automatically: soft hits land on low layers, hard hits on high. Round-robin variation cycles between samples on repeated hits so a 16th-note hat doesn't sound like a machine gun.",
      ],
      why: [
        "Punchier drums without stacking devices.",
        "Realistic kits with velocity layers and round-robin out of the box.",
      ],
      analogy:
        "Like upgrading from a single-shot snare cap to a multi-mic kit — same instrument, way more life.",
    },
    advanced: {
      what: [
        "Drum Sampler is a one-shot focused sampler with up to 16 velocity layers per pad and round-robin cycling. Each layer holds its own sample and can be auditioned/replaced independently from the Sample tab.",
        "Built-in shaping covers pitch envelope (fast attack/decay common to electronic kicks), filter with envelope, drive, and a final compressor — the chain Live producers used to assemble manually with Auto Filter, Saturator and Compressor after Simpler.",
        "It still lives inside Drum Rack, so you keep all the Rack benefits (choke groups, per-pad sends, MPE pads on Push 3) while gaining a far better default per-pad sound.",
      ],
      edgeCases: [
        "Round-robin disables when only one sample is loaded — load several variations to hear the variation.",
        "Pitch envelope set too long can detune the start of the hit; for kicks, a 30–80 ms decay is usually right.",
      ],
      engineerNotes: [
        "Use multi-velocity sample folders from packs — Drum Sampler maps them in one drag.",
        "For acoustic kits, pair Drum Sampler velocity layers with a parallel Glue Compressor on the rack output.",
      ],
    },
    mechanism:
      "Trigger note → pick velocity layer → round-robin variant → pitch env + filter + drive + comp → out.",
    flow: "MIDI → Velocity Layer → Pitch Env → Filter → Drive → Comp → Out",
    walkthrough: [
      {
        do: "Drop Drum Sampler on a pad. Drag a multi-velocity snare folder in.",
        listen: "Soft hits soft, hard hits hard.",
      },
      {
        do: "Set pitch env decay to 50 ms, depth +12.",
        listen: "Snare gains a punchy thump on the front.",
      },
      {
        do: "Add round-robin variants.",
        listen: "Repeated 8th-note hits stop sounding identical.",
      },
    ],
    listenFor: ["Velocity does more than just volume.", "Repeated hits subtly differ."],
    mistakes: [
      "Loading one sample and expecting variation.",
      "Cranking drive past the point of crunch.",
    ],
    proMoves: [
      "Bus all Drum Sampler pads through a Glue Compressor for cohesion.",
      "Use Macro Variations to save 'soft kit' vs 'loud kit' snapshots.",
    ],
    quizEasy: [
      { q: "Drum Sampler is in…", options: ["Live 11", "Live 12"], answer: 1 },
      { q: "It replaces…", options: ["Simpler on drum pads", "Operator"], answer: 0 },
      { q: "Round-robin needs…", options: ["Multiple samples", "One sample"], answer: 0 },
    ],
    quizHard: [
      { q: "Max velocity layers per pad?", options: ["16", "4", "128"], answer: 0 },
      {
        q: "Built-in shaping includes…",
        options: ["Pitch env, filter, drive, comp", "Only filter", "Only EQ"],
        answer: 0,
      },
      {
        q: "Drum Sampler lives inside…",
        options: ["Drum Rack pads", "Audio Effect Rack", "Master"],
        answer: 0,
      },
      {
        q: "Why use Drum Sampler over Simpler?",
        options: ["Built-in shaping per pad", "Cheaper CPU", "Loops better"],
        answer: 0,
      },
      { q: "Round-robin avoids…", options: ["Machine-gun repeats", "Pitch drift"], answer: 0 },
    ],
    sources: [src("Drum Sampler", "Live 12 Manual §24.4")],
  },

  "hybrid-reverb": {
    hook: "Convolution realism + algorithmic motion in one device.",
    beginner: {
      what: [
        "Hybrid Reverb runs two reverbs at once — a convolution engine that plays back recordings of real spaces, and an algorithmic engine that builds tails mathematically — and lets you crossfade between them.",
        "Convolution sounds real (because it is — actual halls, plates, springs); algorithmic sounds modern and lush (Quartz, Shimmer, Tides, Ghost). Blending the two is the cheat code for spaces that feel real and big at the same time.",
      ],
      why: [
        "One device covers room, hall, plate, spring, AND modern shimmer.",
        "Crossfade gives you a 'realism dial'.",
      ],
      analogy:
        "Like photographing a real room then painting motion on top — convolution = the photo, algorithmic = the brushwork.",
    },
    advanced: {
      what: [
        "Hybrid Reverb runs a convolution engine and an algorithmic engine in parallel inside one device. The Convolution side loads impulse responses (IRs) — recordings of real or modelled spaces — and applies their frequency/decay character to incoming audio. The Algorithmic side runs one of four modern tail engines (Quartz, Shimmer, Tides, Ghost), each with its own modulation and decay character.",
        "A single Mix slider crossfades between the two engines, with shared input/output EQ, predelay and dry/wet on top. Freeze captures the current tail and holds it indefinitely; Vintage mode tames the high end for a tape-era feel.",
        "Pros use the blend to get cinematic depth without the muddy buildup of two separate reverbs in series. Convolution provides the believable early-reflection signature; algorithmic adds the long, modulated tail underneath.",
      ],
      edgeCases: [
        "Convolution IRs vary wildly in length — long IRs cost CPU; freeze if you only need the tail character, not real-time response.",
        "Predelay too short bleeds the source into the wet — 20–40 ms keeps the source clear.",
      ],
      engineerNotes: [
        "On a vocal: 80% convolution plate + 20% Shimmer = breath that sounds real but lifts.",
        "On a snare: short convolution room only; algorithmic tail muddies the backbeat.",
      ],
    },
    mechanism:
      "Source → Predelay → split → Convolution IR + Algorithmic engine → blended → output EQ → wet/dry → out.",
    flow: "Source → Predelay → Convolution + Algo (parallel) → Blend → EQ → Out",
    walkthrough: [
      {
        do: "On a Return: drop Hybrid Reverb. Pick a Hall IR.",
        listen: "Realistic, slightly dry hall.",
      },
      {
        do: "Set blend to 50/50 with Algo = Shimmer.",
        listen: "Hall gains a long shimmery octave-up tail.",
      },
      { do: "Add 30 ms predelay.", listen: "Source stays clear; reverb arrives just after." },
    ],
    listenFor: [
      "Real-room signature on early reflections.",
      "Algorithmic motion on the long tail.",
    ],
    mistakes: [
      "Long convolution IRs on every track — CPU melts.",
      "Skipping predelay — source disappears into wet.",
    ],
    proMoves: [
      "Sidechain the wet to the dry vocal — reverb ducks under the words.",
      "Freeze a perfect tail and use it as a pad.",
    ],
    quizEasy: [
      {
        q: "Hybrid Reverb blends…",
        options: ["Convolution + algorithmic", "Two delays"],
        answer: 0,
      },
      { q: "Convolution uses…", options: ["Impulse responses", "FM"], answer: 0 },
      { q: "Best place to insert?", options: ["Return track", "Master"], answer: 0 },
    ],
    quizHard: [
      {
        q: "Algorithmic engine options include…",
        options: ["Quartz, Shimmer, Tides, Ghost", "Only Hall"],
        answer: 0,
      },
      {
        q: "Predelay does what?",
        options: ["Separates source from tail", "Boosts gain"],
        answer: 0,
      },
      { q: "Freeze does…", options: ["Holds the current tail", "Mutes wet"], answer: 0 },
      {
        q: "CPU concern with convolution?",
        options: ["Long IRs are heavy", "Short IRs are heavy"],
        answer: 0,
      },
      { q: "Vintage mode…", options: ["Tames high end", "Adds shimmer"], answer: 0 },
    ],
    sources: [src("Hybrid Reverb", "Live 12 Manual §22.13")],
  },

  roar: {
    hook: "Multiband, modulated saturation — Live 12's tonal Swiss Army knife.",
    beginner: {
      what: [
        "Roar is a saturator with up to three stages of distortion. You can run them one after another, in parallel, or split your signal into 2–3 frequency bands and saturate each band differently.",
        "It also has its own LFO and envelope follower built in — modulation that changes the saturation amount over time, without leaving the device.",
      ],
      why: [
        "One device covers warmth, grit, fuzz, bit-crush, wavefolding.",
        "Multiband mode means you can roughen the highs without crunching the lows.",
      ],
      analogy:
        "Like a guitar pedalboard you can configure as series, parallel, or split-by-frequency — all in one box.",
    },
    advanced: {
      what: [
        "Roar exposes up to three saturation stages, each with one of 13 algorithms (Tube, Diode, Wavefolder, Bit, Digital Clip, etc.). Stage routing supports Serial (1→2→3), Parallel (sum the stages), or Multiband split with adjustable crossovers, so you can apply Tube to the lows and Bit to the highs.",
        "Each stage has Drive, Compensation, Tone, and Mix. Two internal modulators (LFO + Envelope Follower) plus the device-wide modulation matrix let you modulate any stage parameter from input dynamics, host time, or external sources.",
        "Feedback creates self-oscillation when pushed; the Tone EQ inside the feedback loop turns Roar into a synth-style noise generator if you want it to be one.",
      ],
      edgeCases: [
        "Multiband crossovers introduce phase shifts — A/B against bypass on tonal material.",
        "Feedback above ~70% with low Tone cutoff produces self-oscillation; back off when you don't want it.",
      ],
      engineerNotes: [
        "On a vocal: multiband, only the top band saturated with Tube + 20% mix — adds air, leaves body alone.",
        "On a bass: serial Tube → Wavefolder, drive both modestly — fundamental fattens, harmonics extend up.",
      ],
    },
    mechanism:
      "Source → optional split → Stage 1 → Stage 2 → Stage 3 → recombine → output → wet/dry.",
    flow: "Source → Split (band) → Stage 1 + 2 + 3 → Recombine → Out",
    walkthrough: [
      {
        do: "Drop Roar on a vocal bus. Set mode to Multiband 2.",
        listen: "Two bands appear at the crossover.",
      },
      {
        do: "Saturate only the top band, Tube algo, mix 20%.",
        listen: "Vocal gains air without grit on the body.",
      },
      {
        do: "Map the LFO to top-band drive, slow rate.",
        listen: "Air content breathes in and out.",
      },
    ],
    listenFor: [
      "Saturation that sits 'inside' the tone, not over it.",
      "Per-band character changes.",
    ],
    mistakes: [
      "Cranking drive on every stage — sound implodes.",
      "Forgetting Mix knob — wet 100% by default.",
    ],
    proMoves: [
      "Use the modulation matrix to make saturation react to playing dynamics.",
      "Pair multiband Roar with Glue on the master for cohesion.",
    ],
    quizEasy: [
      { q: "Roar is a…", options: ["Multiband saturator", "Reverb"], answer: 0 },
      { q: "Max stages?", options: ["3", "1"], answer: 0 },
      { q: "Roar shipped in…", options: ["Live 12", "Live 11"], answer: 0 },
    ],
    quizHard: [
      {
        q: "Routing modes include…",
        options: ["Serial, Parallel, Multiband", "Only Serial"],
        answer: 0,
      },
      { q: "Built-in modulators?", options: ["LFO + Envelope Follower", "Only LFO"], answer: 0 },
      { q: "Feedback can cause…", options: ["Self-oscillation", "Pitch shift"], answer: 0 },
      { q: "Algorithms count?", options: ["13", "3", "5"], answer: 0 },
      {
        q: "Best vocal-air trick?",
        options: ["Multiband, top band only, low mix", "Serial all stages full drive"],
        answer: 0,
      },
    ],
    sources: [src("Roar", "Live 12 Manual §22.20")],
  },

  "glue-compressor": {
    hook: "The bus compressor that makes a mix sound like one record, not many tracks.",
    beginner: {
      what: [
        "Glue Compressor is Live's emulation of the SSL G-bus compressor — the unit on the master bus of countless hit records. On a drum bus or master, 1–3 dB of gain reduction is enough to make everything feel like one cohesive thing.",
        "It's a stereo VCA design with fast attack, musical auto-release, and a soft clipper at the output. Plug it in, set Threshold for 1–3 dB GR, and you're done.",
      ],
      why: [
        "Mixes feel cohesive instead of separate tracks playing together.",
        "Adds punch and density without obvious 'compressed' character.",
      ],
      analogy:
        "Like the glue holding the mix together — invisible if it's working, obvious if it's missing.",
    },
    advanced: {
      what: [
        "Glue is a VCA-style stereo bus compressor modelled on the SSL G master compressor. Its character comes from a fast linear attack curve, a program-dependent auto-release that times itself to the source's envelope, and a soft-clipping output stage that catches transient peaks before the limiter sees them.",
        "Standard bus settings — Ratio 4:1, Attack 10 ms, Release Auto, Threshold for 1–3 dB GR — produce 'glue' (cohesion across the bus) without obvious compression artifacts. Pushing harder (5+ dB GR with fast attack) gives the pumped, hyped sound on EDM masters.",
        "The internal sidechain HPF (60 Hz / 90 Hz / 120 Hz) prevents kick fundamentals from triggering excessive GR on the master bus — essential when the kick is loud and you don't want the whole mix ducking on every beat.",
      ],
      edgeCases: [
        "Auto-release tracks the source — slow material gets long releases, drums get fast — so 'one setting' often works for a whole mix.",
        "Soft clipper engages above 0 dB; if your source is hot enough to clip, that's where Glue's iconic crunch comes from.",
      ],
      engineerNotes: [
        "Mix INTO the Glue, don't add it last — your gain staging changes once Glue's on the bus.",
        "On the drum bus: 4 dB GR, attack 30 ms (lets transients through), gives modern drum punch.",
      ],
    },
    mechanism:
      "Bus signal → sidechain HPF → VCA detector → gain reduction → makeup gain → soft clipper → out.",
    flow: "Bus → SC HPF → Detector → VCA → Makeup → Soft Clip → Out",
    walkthrough: [
      {
        do: "Drop Glue on the master. Threshold for ~2 dB GR.",
        listen: "Mix tightens; nothing obvious.",
      },
      { do: "Switch SC HPF to 90 Hz.", listen: "Kick stops triggering excess GR." },
      { do: "Add 3 dB makeup.", listen: "Mix loudness up without limiter pumping." },
    ],
    listenFor: ["Cohesion — tracks 'lock together'.", "Soft transient catch on peaks."],
    mistakes: [
      "Pushing 6+ dB GR on the master — pumping artifacts.",
      "Skipping SC HPF on bass-heavy material.",
    ],
    proMoves: [
      "Use Glue on the drum bus AND the master, light on each.",
      "A/B with bypass — if you can't hear the difference, GR is too low.",
    ],
    quizEasy: [
      { q: "Glue emulates…", options: ["SSL G-bus", "1176"], answer: 0 },
      { q: "Typical bus GR?", options: ["1–3 dB", "10 dB"], answer: 0 },
      { q: "Output stage has…", options: ["Soft clipper", "Reverb"], answer: 0 },
    ],
    quizHard: [
      {
        q: "Auto-release means…",
        options: ["Program-dependent timing", "Always 100ms"],
        answer: 0,
      },
      { q: "SC HPF prevents…", options: ["Kick triggering excess GR", "Pitch drift"], answer: 0 },
      { q: "Soft clipper engages…", options: ["Above 0 dB output", "Below threshold"], answer: 0 },
      { q: "Drum bus typical attack?", options: ["~30 ms (lets transients)", "0.1 ms"], answer: 0 },
      { q: "Mix INTO glue means…", options: ["Have it on bus from start", "Add last"], answer: 0 },
    ],
    sources: [src("Glue Compressor", "Live 12 Manual §22.10")],
  },

  "limiter-truepeak": {
    hook: "Brick-wall ceiling. The last device on every master.",
    beginner: {
      what: [
        "A Limiter is a hard ceiling: nothing crosses it. You set a Ceiling (the max output level) and a Gain (how much to push the input up), and the Limiter clamps anything that would exceed the ceiling.",
        "On a master, the Limiter's job is loudness control without clipping. Keep ceiling around -1 dBTP for streaming services — that leaves headroom for codec encoding artifacts.",
      ],
      why: [
        "Final loudness for streaming/release.",
        "Catches peaks that would clip your converter.",
      ],
      analogy:
        "Like a height limiter at a parking garage — anything taller than the bar gets squashed flat.",
    },
    advanced: {
      what: [
        "Limiter is a brick-wall, look-ahead, peak-limiting device. Look-ahead (0/1.5/3 ms) lets the compressor 'see' transients before they arrive, so it can ramp gain reduction smoothly instead of clipping. Stereo Linking (None/Left/Right) controls whether one channel's peak triggers the other.",
        "Ceiling sets the absolute output peak; Gain pushes the input up into the ceiling. Auto release is program-dependent. The True Peak option detects inter-sample peaks — peaks that don't exist as sample values but appear when the DAC reconstructs the analog waveform between samples; these can clip even when sample peaks read 0 dBFS.",
        "Streaming codecs (MP3/AAC/Opus) introduce additional peak overshoot during encoding. Mastering to -1 dBTP (true peak) leaves headroom for that overshoot; mastering to 0 dBFS guarantees codec clipping artifacts on aggressive material.",
      ],
      edgeCases: [
        "More than 3–4 dB of limiting on a full mix produces audible pumping on bass-heavy material.",
        "True Peak detection adds CPU cost and a small additional latency — use it on the master only.",
      ],
      engineerNotes: [
        "Mix into the Limiter at low GR (1–2 dB) to set loudness target without squashing dynamics.",
        "For streaming, target -14 LUFS integrated with -1 dBTP ceiling; for club masters, -8 LUFS, -0.5 dBTP.",
      ],
    },
    mechanism:
      "Input → look-ahead delay → peak detector → gain reduction → ceiling clamp → output.",
    flow: "Source → Look-Ahead → Detector → GR → Ceiling → Out",
    walkthrough: [
      {
        do: "Drop Limiter on master. Ceiling -1 dB, Gain 0 dB, Lookahead 3 ms.",
        listen: "Master sounds the same; ceiling protected.",
      },
      { do: "Push Gain +3 dB.", listen: "Mix loudens; tiny GR on transient peaks." },
      { do: "Push Gain +6 dB.", listen: "Pumping on kick/bass — too much." },
    ],
    listenFor: ["Transparent peak control at low GR.", "Pumping/breathing as GR increases."],
    mistakes: [
      "Using Limiter to fix mix problems instead of polish.",
      "Ignoring True Peak then blaming the codec.",
    ],
    proMoves: [
      "Two stages: Glue on master, then Limiter — split the loudness work.",
      "A/B at matched loudness with bypass — louder always sounds 'better' until you match levels.",
    ],
    quizEasy: [
      { q: "Limiter is a…", options: ["Brick-wall compressor", "Reverb"], answer: 0 },
      { q: "Streaming-safe ceiling?", options: ["-1 dBTP", "0 dB"], answer: 0 },
      { q: "True peak prevents…", options: ["Inter-sample clipping", "Pitch drift"], answer: 0 },
    ],
    quizHard: [
      { q: "Look-ahead options?", options: ["0/1.5/3 ms", "0 only"], answer: 0 },
      {
        q: "Auto release means…",
        options: ["Program-dependent timing", "Always 100ms"],
        answer: 0,
      },
      {
        q: "Stereo Linking can…",
        options: ["Trigger one channel from the other", "Pan signal"],
        answer: 0,
      },
      { q: "Streaming target LUFS?", options: ["-14", "-3"], answer: 0 },
      { q: "Excessive GR causes…", options: ["Pumping", "Pitch shift"], answer: 0 },
    ],
    sources: [src("Limiter", "Live 12 Manual §22.15")],
  },

  "warp-modes-deep": {
    hook: "Pick the wrong Warp Mode and your loop sounds mushy. Pick the right one and it sounds like the master.",
    beginner: {
      what: [
        "Live's Warp Modes are different time-stretch algorithms. Each is tuned for a different kind of audio — drums, vocals, pads, full mixes. Picking the right one is the difference between a clean stretch and a smeared mess.",
        "The shortcut: drums → Beats. Vocals/bass → Tones (or Complex Pro for clean vocals). Pads/ambient → Texture. Full mixes → Complex Pro. DJ-style speed-and-pitch-together → Re-Pitch.",
      ],
      why: ["Loops stretch cleanly to your tempo.", "Vocals don't get robotic when slowed down."],
      analogy: "Like choosing the right blade for the right material — a wood saw won't cut metal.",
    },
    advanced: {
      what: [
        "Beats mode chops the audio at transients and crossfades between segments — no pitch shift, just slice-and-fit. It's transparent on percussive material, but pitched content gets stuttery because the algorithm doesn't try to preserve continuous pitch.",
        "Tones uses pitch-synchronous overlap-add (PSOLA) — it tracks the source's fundamental and stretches by relocating individual pitch periods. Excellent on monophonic pitched material (solo vocal, bass) where the pitch is well-defined.",
        "Texture and Complex / Complex Pro use phase vocoder algorithms (FFT-based). They preserve harmonic content over time at the cost of transient sharpness. Complex Pro is the cleanest for full mixes, with formant-correction options that prevent the 'chipmunk' effect when transposing vocals. Re-Pitch alone is non-warping — it just plays the file back at a different speed, like vinyl pitch control.",
      ],
      edgeCases: [
        "Beats mode on melodic material produces audible stutters at every transient — switch to Tones or Complex.",
        "Complex Pro on percussive material softens transients — switch to Beats.",
        "Re-Pitch ignores Live's tempo: a 100 BPM loop dragged into a 120 BPM Set will play at 120 BPM and shift pitch up.",
      ],
      engineerNotes: [
        "For DJ-style 'pitch the whole stem to the new key', Complex Pro with formant-correct on; for analogue vinyl-style time-stretch, Re-Pitch.",
        "Always preview at the destination tempo, not the source — a great-sounding source can fall apart when stretched 20%.",
      ],
    },
    mechanism: "Audio + warp markers → chosen algorithm → time/pitch decoupled output.",
    flow: "Audio → Warp Markers → Algorithm → Stretched Audio → Out",
    walkthrough: [
      { do: "Drop a drum loop, set to Beats. Stretch +20%.", listen: "Tight, no smearing." },
      { do: "Switch to Complex Pro.", listen: "Transients soften; loop loses punch." },
      { do: "Drop a vocal, Tones mode, stretch -20%.", listen: "Clean slow-down." },
    ],
    listenFor: [
      "Transient sharpness on percussive material.",
      "Formant character on stretched vocals.",
    ],
    mistakes: [
      "Defaulting to Complex Pro for everything — CPU and softness.",
      "Forgetting Re-Pitch shifts pitch with speed.",
    ],
    proMoves: [
      "Stem-by-stem warp mode choice when remixing.",
      "Use Beats sensitivity to tune transient detection per loop.",
    ],
    quizEasy: [
      { q: "Best for drums?", options: ["Beats", "Texture"], answer: 0 },
      { q: "Vinyl-style speed+pitch?", options: ["Re-Pitch", "Complex Pro"], answer: 0 },
      { q: "Best for vocals?", options: ["Complex Pro", "Beats"], answer: 0 },
    ],
    quizHard: [
      { q: "Tones uses…", options: ["PSOLA", "Phase vocoder"], answer: 0 },
      {
        q: "Complex Pro is…",
        options: ["FFT phase vocoder with formant correction", "Transient slice"],
        answer: 0,
      },
      {
        q: "Re-Pitch behaviour?",
        options: ["No stretch — speed and pitch shift together", "Time-stretch only"],
        answer: 0,
      },
      {
        q: "Beats on melodic material?",
        options: ["Stutters at transients", "Smooths perfectly"],
        answer: 0,
      },
      {
        q: "Formant correction prevents…",
        options: ["Chipmunk effect on transposed vocals", "Pitch shift"],
        answer: 0,
      },
    ],
    sources: [src("Warp Modes", "Live 12 Manual §10.3")],
  },

  "ableton-link-sync": {
    hook: "Wireless tempo sync between every device on your network. No master, no slave.",
    beginner: {
      what: [
        "Ableton Link is a network protocol that keeps every Link-enabled app on the same WiFi in tempo sync. Click Link in Live, click Link in another Live (or an iOS app, or Maschine, or Reason), and they share tempo + downbeat phase.",
        "There's no leader — every peer is equal. Anyone can change tempo and the rest follow. Anyone can leave or join without disrupting the others.",
      ],
      why: [
        "Two laptops jamming on a phone hotspot, no cables.",
        "Sync iPad apps to Live without MIDI.",
      ],
      analogy:
        "Like a band where everyone hears the same click in their head — nobody's the conductor.",
    },
    advanced: {
      what: [
        "Link is a peer-to-peer protocol that synchronises tempo, beat phase, and (optionally) start/stop transport across applications on a local network. It uses NTP-style clock estimation to compensate for network jitter, so latency is far lower than MIDI clock over USB hubs.",
        "Joining is automatic — any Link-enabled app on the same subnet sees existing peers. Tempo changes propagate live; the protocol maintains beat-phase coherence so peers stay aligned at the bar level, not just BPM.",
        "Start Stop sync is opt-in per peer (Live's Link toggle has a Start Stop sync sub-setting). Without it, transports run independently while sharing tempo — useful when one performer wants to drop in/out without restarting the whole rig.",
      ],
      edgeCases: [
        "Different subnets (different VLANs) won't see each other — everyone needs to be on the same WiFi/router.",
        "iPad apps in airplane mode with Link enabled can sync if WiFi is on independently of cellular.",
      ],
      engineerNotes: [
        "For shows: phone-as-hotspot to a router gives lowest jitter; avoid public WiFi which adds variable latency.",
        "Use Link tempo control from one trusted laptop to avoid 'tempo war' between performers.",
      ],
    },
    mechanism:
      "Each peer broadcasts tempo + beat-phase estimates → consensus algorithm → shared timeline.",
    flow: "Peer A ↔ WiFi ↔ Peer B ↔ Peer C — shared tempo + downbeat",
    walkthrough: [
      {
        do: "Enable Link in Live. Open another Link-enabled app on the same WiFi.",
        listen: "Peer count appears.",
      },
      { do: "Change tempo on either side.", listen: "Both move together." },
      { do: "Enable Start Stop sync. Press play on one.", listen: "Other transport follows." },
    ],
    listenFor: ["Tempo lock across devices.", "Phase lock at the bar level."],
    mistakes: [
      "Different subnets — Link can't see across.",
      "Forgetting Start Stop sync is separate from tempo sync.",
    ],
    proMoves: [
      "Use Link with iPad granular apps as live texture sources.",
      "Hotspot for shows — public WiFi will jitter.",
    ],
    quizEasy: [
      { q: "Link uses…", options: ["Local network", "MIDI cable"], answer: 0 },
      { q: "Master/slave?", options: ["No — peer-to-peer", "Yes"], answer: 0 },
      { q: "Start Stop sync is…", options: ["Optional add-on", "Always on"], answer: 0 },
    ],
    quizHard: [
      {
        q: "Link uses what for clock?",
        options: ["NTP-style estimation", "MIDI clock"],
        answer: 0,
      },
      {
        q: "Maintains coherence at…",
        options: ["Bar/beat-phase level", "Sample level"],
        answer: 0,
      },
      { q: "Cross-subnet?", options: ["Doesn't work", "Always works"], answer: 0 },
      {
        q: "Lowest jitter setup?",
        options: ["Dedicated hotspot/router", "Public WiFi"],
        answer: 0,
      },
      { q: "Tempo change initiator?", options: ["Any peer", "Only first peer"], answer: 0 },
    ],
    sources: [src("Ableton Link", "Live 12 Manual §32")],
  },

  "push3-workflow": {
    hook: "Pads, screens, encoders — and Standalone runs Live inside the box.",
    beginner: {
      what: [
        "Push 3 is Ableton's flagship hardware. 64 RGB pads, two displays, encoders, an audio interface — and the Standalone version has a built-in computer running Live, so the laptop can stay home.",
        "The pads change layout based on what you're doing: scale-aware melodic pads (no wrong notes), drum pads with a built-in step sequencer, or 64-pad melodic step sequencer for full pattern editing.",
      ],
      why: ["Make a track without the mouse.", "Standalone means laptop-free shows."],
      analogy:
        "Like Live grew a body — same software, plus pads and screens that mirror what's under your cursor.",
    },
    advanced: {
      what: [
        "Push 3 is a deeply integrated controller: pads, encoders and screens always reflect the device under Live's cursor, so workflow is identical between mouse and Push. Pad layout adapts contextually — Melodic mode tunes the grid to the project scale, Drum mode dedicates 16 pads to a Drum Rack and 48 to a step sequencer for the selected pad, 64-pad mode turns the whole grid into a melodic step sequencer.",
        "Standalone units run Live's playback engine inside the controller's internal computer; you author on the laptop, sync the project, then unplug for the show. The audio interface is class-compliant and latency is competitive with desktop interfaces.",
        "Push 3 is MPE-native — every pad has per-finger pressure, slide and pitch-bend, which Wavetable, Meld, Sampler, Operator and Drum Rack all consume natively.",
      ],
      edgeCases: [
        "Standalone projects must be authored as 'Push-compatible' — third-party plugins not whitelisted for Push 3 won't run on the device.",
        "Pad pressure calibration matters — recalibrate after firmware updates if expression feels off.",
      ],
      engineerNotes: [
        "Build performance Sets around Macro Variations + Drum Rack + Melodic mode — that's Push's sweet spot.",
        "Use the second screen for sample browsing while playing — keeps the music going while you audition.",
      ],
    },
    mechanism: "Pads/encoders → MIDI/MPE → mirrors selected device → screens reflect device state.",
    flow: "Pads/MPE → Live → Mirrored Device → Audio",
    walkthrough: [
      { do: "Connect Push 3, select a Drum Rack track.", listen: "Pads light up as Drum Rack." },
      {
        do: "Switch to a melodic instrument, hit Melodic mode.",
        listen: "Pads remap to the project scale.",
      },
      { do: "Hit Note + Step Sequencer.", listen: "64-pad melodic step seq active." },
    ],
    listenFor: ["Pad layout matches selected device.", "Encoders mirror the cursor's parameter."],
    mistakes: [
      "Expecting non-whitelisted plugins to run on Standalone.",
      "Mouse-and-Push hybrid workflow — pick one to stay flowing.",
    ],
    proMoves: [
      "Macro Variations on Push = one-encoder song morph.",
      "MPE patches in Wavetable/Meld designed around Push pad expression.",
    ],
    quizEasy: [
      {
        q: "Push 3 Standalone runs…",
        options: ["Live's engine internally", "Only MIDI"],
        answer: 0,
      },
      { q: "Melodic mode hides…", options: ["Out-of-scale notes", "Drums"], answer: 0 },
      { q: "Step seq pads in Drum mode?", options: ["48", "16"], answer: 0 },
    ],
    quizHard: [
      {
        q: "Push pads support…",
        options: ["MPE per-finger expression", "Only velocity"],
        answer: 0,
      },
      { q: "Standalone limit?", options: ["Push-whitelisted plugins only", "No limit"], answer: 0 },
      { q: "64-pad mode is…", options: ["Melodic step sequencer", "Drum only"], answer: 0 },
      {
        q: "Encoders mirror…",
        options: ["The selected device's parameters", "Always master"],
        answer: 0,
      },
      {
        q: "MPE-native devices include…",
        options: ["Wavetable, Meld, Sampler, Drum Rack", "Only Operator"],
        answer: 0,
      },
    ],
    sources: [src("Push 3", "Live 12 Manual §29")],
  },

  "macro-variations": {
    hook: "Snapshot the macro state. Recall in one click. Morph in between.",
    beginner: {
      what: [
        "A Macro Variation is a saved snapshot of all 16 macro values on a Rack. Build a sound, hit New Variation — that's snapshot 1. Tweak the macros, save again — snapshot 2. Click between them to instantly recall the whole macro state.",
        "Live 12 added smooth interpolation: instead of jumping between snapshots, you can drag a slider that morphs all 16 macros in parallel from one variation to the next.",
      ],
      why: [
        "One-click 'verse → chorus' patch changes.",
        "Build performance morphs that fade smoothly.",
      ],
      analogy:
        "Like preset snapshots on a synth — except they include every macro you've assigned, not just the panel.",
    },
    advanced: {
      what: [
        "Macro Variations live in the Rack header next to the macro array. Each variation captures the current values of all 16 macros (or 8 / 4, depending on the rack's macro count) plus their associated mapping ranges. Recall is sample-accurate; you can MIDI-map variation switching to a controller.",
        "Live 12's smooth-interpolation morph slider crossfades between two adjacent variations over time, with linear or curved interpolation. Combined with Live's automation, you can record a morph as a single envelope that drives all the underlying mappings.",
        "Because macros sit at the top of the modulation chain, a variation effectively snapshots an entire patch — every parameter the macros touch moves together. Architects of performance Sets build whole song sections from a single Rack with a handful of variations.",
      ],
      edgeCases: [
        "Variations don't capture device parameters that aren't macro-mapped — if you want it to morph, map it to a macro first.",
        "Smooth morph only interpolates between adjacent variations; non-adjacent jumps step.",
      ],
      engineerNotes: [
        "Build a performance rack: 4 variations = intro / verse / chorus / drop. One controller knob = song flow.",
        "Combine with Drum Rack chain selectors for instant kit swaps inside the same rack.",
      ],
    },
    mechanism:
      "Variation slot stores 16 macro values → recall sets all 16 → morph slider interpolates.",
    flow: "Variation A ↔ Morph Slider ↔ Variation B → All Mapped Devices",
    walkthrough: [
      { do: "Open a Rack. Tweak macros. Hit New Variation.", listen: "Snapshot 1 saved." },
      { do: "Tweak macros differently. Save again.", listen: "Snapshot 2." },
      { do: "Drag the morph slider between them.", listen: "Smooth blend across all 16 macros." },
    ],
    listenFor: ["All mapped parameters move together.", "Smooth morph vs. instant recall."],
    mistakes: [
      "Forgetting to map parameters to macros — variations won't touch them.",
      "Trying to morph between non-adjacent variations.",
    ],
    proMoves: [
      "MIDI-map variation slots to controller pads — one pad = one section.",
      "Automate the morph slider for hands-free song progression.",
    ],
    quizEasy: [
      { q: "Variations save…", options: ["Macro values", "Audio"], answer: 0 },
      { q: "Macros per Rack (Live 11+)?", options: ["16", "8"], answer: 0 },
      { q: "Live 12 morph is…", options: ["Smooth interpolation", "Step only"], answer: 0 },
    ],
    quizHard: [
      {
        q: "Variations capture…",
        options: ["All 16 macro values + mapping ranges", "Only audio output"],
        answer: 0,
      },
      { q: "Smooth morph works between…", options: ["Adjacent variations", "Any two"], answer: 0 },
      {
        q: "Variations don't capture…",
        options: ["Non-macro-mapped parameters", "Anything"],
        answer: 0,
      },
      {
        q: "Performance use case?",
        options: ["Section snapshots morphed live", "Mixing only"],
        answer: 0,
      },
      { q: "Combine well with…", options: ["Drum Rack chain selectors", "Reverb only"], answer: 0 },
    ],
    sources: [src("Macro Variations", "Live 12 Manual §21.3")],
  },

  "sampler-deep": {
    hook: "Simpler loads one sample. Sampler loads a whole instrument.",
    definition: [
      "Sampler is Live's full-featured sampler — it maps different samples across keyboard zones, velocity layers, and round-robin positions. Use it when one sample isn't enough for a realistic instrument.",
    ],
    beginner: {
      what: [
        "Sampler is like Simpler's older sibling. Where Simpler loads one audio file and lets you play it, Sampler lets you load dozens of samples and assign each one to a specific key range and velocity range — so a piano sounds different at C2 vs C5, and a soft press sounds different from a hard one.",
      ],
      why: [
        "Real instruments don't sound the same at every pitch — a violin bowed at the bottom of its range sounds nothing like one at the top. Sampler lets you replicate that by loading multiple recordings.",
        "Velocity layers make soft vs loud playing feel alive and dynamic rather than just quieter.",
        "Round-robin prevents the 'machine gun' effect — Sampler cycles through multiple recordings of the same note so repeated hits never sound identical.",
      ],
      analogy:
        "Sampler is like a filing cabinet full of recordings. You tell it: 'play this recording for keys C2–E3, this one for F3–B4, and when they press hard, use this louder version'.",
    },
    advanced: {
      what: [
        "Sampler's zones are defined by key range (start/end note), velocity range (0–127), and selector (sequential, random, all). Each zone hosts an independent sample with its own amplitude envelope, filter, LFO, and modulation routing. Sampler also supports MPE — per-note pressure, slide, and pitch are fully routable.",
      ],
      edgeCases: [
        "Overlapping key zones play simultaneously — useful for layering but can cause phase issues",
        "High polyphony + long samples = heavy RAM use; freeze the track if sessions bog down",
        "Sample start can be modulated by velocity for transient control without separate layers",
      ],
      engineerNotes: [
        "Use Simpler when you have one sample and want speed. Switch to Sampler the moment you need multiple samples mapped across pitch or velocity.",
        "Load one zone first, duplicate it, adjust the key range — faster than building from scratch.",
        "MPE + Sampler is the cleanest way to add per-note expression to any sample library in Live.",
      ],
    },
    listenFor: [
      "How a piano sample set sounds 'sampled' at the key boundaries where it switches zones",
      "The subtle randomness of round-robin vs the robotic repetition without it",
    ],
    proMoves: [
      "Map velocity 0–80 to a 'room mic' sample and 81–127 to a 'close mic' for instant depth",
      "Modulate sample start by velocity — high velocity starts later in the transient for more snap",
      "Use 'All' selector to layer all zones simultaneously for massive textural pads",
    ],
    mistakes: [
      "Using Sampler for single-sample work — Simpler loads faster and has warp",
      "Forgetting to set crossfade at zone boundaries — you'll hear a click at the switch point",
      "Loading 24-bit 96kHz samples unnecessarily — 16-bit 44.1kHz is transparent and half the RAM",
    ],
  },

  drift: {
    hook: "Analog synths drift. Drift drifts on purpose.",
    definition: [
      "Drift is Live 11's warm, analog-flavored subtractive synthesizer with a built-in instability engine that adds the subtle randomness of vintage hardware.",
    ],
    beginner: {
      what: [
        "Drift is a straightforward synth: oscillators make the sound, a filter shapes it, an envelope controls how it evolves over time. What makes it special is the Drift knob — it adds tiny random variations to pitch and timing that make it feel alive, like a real analog synth that's slightly imperfect in a musical way.",
      ],
      why: [
        "Digital synths are perfectly in tune, every note, every time — which sounds sterile. Drift adds controlled imperfection so chords breathe and beats feel human.",
        "The ladder and SEM filters are modeled on classic hardware — they have a warmth that's hard to replicate with EQ.",
      ],
      analogy:
        "Drift is like a well-maintained vintage synth — it mostly stays in tune, but there's enough randomness to feel alive rather than robotic.",
    },
    advanced: {
      what: [
        "Drift offers two oscillators (with sub) and two filter models: a 4-pole ladder (Moog-style, punchy resonance) and a 2-pole state-variable (SEM-style, smoother). The Drift engine applies correlated noise to pitch, filter, and amplitude — all three drift together like hardware would. The rate and depth of drift are independently controllable.",
      ],
      edgeCases: [
        "High Drift at high polyphony creates micro-detuning that thickens chords naturally — similar to chorus but more organic",
        "The ladder filter self-oscillates at max resonance — a free sine-wave oscillator",
        "Drift's envelopes go negative — pull attack below zero for an immediate transient then ramp",
      ],
      engineerNotes: [
        "Use Drift for bass, leads, and pads where warmth matters more than precision",
        "Pair high Drift with a short delay (12ms, no feedback) on a return for vintage doubling",
        "Automate the Drift amount for a synth that 'warms up' over the course of a track",
      ],
    },
    listenFor: [
      "Chords slowly moving apart and back together with Drift at 50%+",
      "The filter character difference between Ladder (punchy, colored) and SEM (open, smooth)",
    ],
    proMoves: [
      "Detune osc 2 by +7 cents and set to triangle for instant vintage pad thickness",
      "Route the LFO to Filter Cutoff at low rate — the breathing modulation is subtle but critical",
      "Use Drift's built-in unison mode for instant supersaw without a dedicated device",
    ],
    mistakes: [
      "Setting Drift too high on bass sounds — bass needs to sit in tune; use Drift < 20% for bass",
      "Ignoring the sub oscillator — it's a free sine an octave down that can replace a separate bass layer",
    ],
  },

  "granulator-iii": {
    hook: "What if sound was sand? Granulator makes it.",
    definition: [
      "Granulator III is a Max for Live granular synthesizer that slices any audio file into tiny grains and reassembles them — enabling extreme time-stretching, texture creation, and sounds that bear no resemblance to the original.",
    ],
    beginner: {
      what: [
        "Granulator takes a sample and cuts it into tiny pieces called grains — each about 10–500ms long. It plays thousands of these overlapping grains simultaneously, which lets you stretch time without changing pitch, freeze audio into drones, or scatter grains randomly to create dense textures that sound nothing like the source.",
      ],
      why: [
        "It's the tool for creating evolving atmospheric pads and textures that no conventional synth can make.",
        "You can take a drum hit and turn it into a 30-second drone — the source material becomes a starting point, not the end result.",
        "Granular time-stretching sounds completely different from warp modes — more abstract, more 'stretched'.",
      ],
      analogy:
        "Imagine taking a photograph, cutting it into thousands of tiny squares, and spreading them slightly — you can still recognize the image, but it shimmers and floats in a way the original never did.",
    },
    advanced: {
      what: [
        "Key parameters: Position (playhead in the sample), Spray (randomizes position per grain), Size (grain duration), Density (grains per second), Pitch (transposition), Random (pitch randomization per grain). Envelope shapes each grain's amplitude curve. Multiple playheads can scrub the sample at different rates — creating harmonic interference between versions of the same audio.",
      ],
      edgeCases: [
        "Very small grains (< 20ms) become pitched due to the periodicity of repeated short windows — a granular oscillator",
        "High Spray + high Density creates white-noise-like textures regardless of source material",
        "Position modulated by a slow LFO creates automatic morph through the sample's timbral content",
      ],
      engineerNotes: [
        "Load drumbreaks or spoken word for the most interesting timbral material to granulate",
        "Automate Position at 0.001 Hz — the texture evolves over minutes without repeating",
        "Granulator III supports MPE — map pressure to Spray for expressive per-note density control",
      ],
    },
    listenFor: [
      "The shimmer created when grain size matches the fundamental period of a pitched source",
      "How Spray at 0 sounds 'frozen' vs Spray at 100% sounds 'scattered'",
    ],
    proMoves: [
      "Use a vocal sample as source — granulation strips intelligibility and leaves pure vowel texture",
      "Send granulated audio through a convolution reverb using the same source as the IR",
      "Layer two Granulators on the same sample at different positions and sizes for phasing clouds",
    ],
    mistakes: [
      "Using short samples — longer samples give Position room to explore meaningfully",
      "Maxing Density without watching CPU — granular synthesis is expensive; freeze when done",
    ],
  },

  "collision-tension-electric": {
    hook: "Physics-based synthesis — the mallet hits the string, the bow drags, the tine rings.",
    definition: [
      "Collision, Tension, and Electric are physical modeling instruments. Rather than oscillators, they simulate the real-world physics of struck, bowed, and plucked objects — mallets, membranes, strings, and piano tines.",
    ],
    beginner: {
      what: [
        "Physical modeling means the synth calculates how a real object would vibrate rather than playing back a recording or generating a waveform. Collision models percussion (mallets hitting objects), Tension models strings (guitar, harp, bowed instruments), Electric models electric piano tines (Rhodes, Wurlitzer). The result sounds acoustic because it behaves acoustically.",
      ],
      why: [
        "They respond to velocity, modulation, and MPE in ways sampled instruments can't — playing harder changes the character of the sound, not just the volume.",
        "No sample library can capture every combination of mallet hardness, string tension, and damping. Physical models can.",
      ],
      analogy:
        "A sample library takes a photo of a piano. Physical modeling builds a working piano inside the computer.",
    },
    advanced: {
      what: [
        "Collision: Mallet section controls hardness, noise, and initial displacement; Resonator section models the object being struck (membrane, tube, plate, string). Tension: excitation type (pluck, bow, strike) feeds into a physical string model with stiffness, damping, pickup position. Electric: tine + fork model, pickup proximity, damper noise, amp character.",
      ],
      edgeCases: [
        "High string stiffness in Tension creates inharmonic 'piano-like' overtones — the upper partials go sharp",
        "Collision with very low noise in the mallet and high resonance becomes a pitched bell",
        "Electric's pickup position controls even/odd harmonic content — close = brighter, far = mellower",
      ],
      engineerNotes: [
        "Map MPE pressure to mallet noise in Collision — bowing pressure becomes expressive",
        "Automate Tension's bow position for a cello-like vibrato effect without a separate LFO",
        "Layer Electric with Simpler (Rhodes sample) and blend 30/70 — the model adds dynamics the sample lacks",
      ],
    },
    listenFor: [
      "How Tension changes character when you bow vs pluck vs strike the same string setup",
      "The 'mechanical' noise in Electric that makes it feel physical rather than synthesized",
    ],
    proMoves: [
      "Collision with a membrane resonator + long reverb = instant cinematic taiko drums",
      "Tension at high bow pressure + filter automation = string swells without samples",
      "Electric tine volume automation during a note = the classic Rhodes swell technique",
    ],
    mistakes: [
      "Treating these like subtractive synths — their parameters describe physical properties, not audio ones",
      "Low polyphony on physical models — they're CPU-heavy; limit voices aggressively",
    ],
  },

  "bass-poli": {
    hook: "Great presets, eight knobs, instant results. That's Bass & Poli.",
    definition: [
      "Bass and Poli are Live 12 instruments built for immediate playability — curated preset instruments with 8 bespoke macro knobs per patch, optimized for bass sounds and polyphonic pads/keys respectively.",
    ],
    beginner: {
      what: [
        "Bass and Poli are plug-and-play instruments. Load a preset, play some notes, twist the 8 knobs. Each preset has its own custom macro assignments — the knobs control the most useful parameters for that specific sound. You don't need to understand synthesis to get great results; the presets are professionally designed and the knobs are already mapped to the interesting controls.",
      ],
      why: [
        "Sometimes you need a great bass tone in 10 seconds, not an hour of synthesis deep-dive.",
        "The macro assignments are curated per-preset by sound designers — you're always turning the right knob.",
      ],
      analogy:
        "Bass and Poli are like a great restaurant with a curated menu — you don't choose every ingredient, but every dish is designed to work.",
    },
    advanced: {
      what: [
        "Under the hood, Bass and Poli are Instrument Racks containing combinations of Wavetable, Operator, Simpler, and effects chains — each preset hand-built by Ableton's sound design team. The 8 macros are remapped per preset to expose the most musical controls. Macro Variations (Live 12) let you snapshot 8 different 'states' of the same preset and morph between them.",
      ],
      edgeCases: [
        "The underlying rack is fully editable — unfold the chain to see and modify the actual devices",
        "Macro Variations can interpolate between states when morphing is enabled in Live 12",
      ],
      engineerNotes: [
        "Use Bass for sub-bass, bass synths, and bass guitars — its presets are tuned for low-end clarity",
        "Poli excels for pads, keys, plucks, and chord textures — polyphonic and harmonically rich by design",
        "Save custom macro states as Variations before leaving a session — you lose them on close otherwise",
      ],
    },
    listenFor: [
      "How each macro knob changes a fundamentally different aspect of the sound in each preset",
      "The difference in low-end weight between Bass presets vs Poli presets pitched down",
    ],
    proMoves: [
      "Create a Macro Variation for verse sound and one for chorus — one click changes the whole vibe",
      "Route the Macro Variation selector to a MIDI controller for live switching",
      "Unfold Bass and add a Saturator before the output — instantly thickens the low-mids",
    ],
    mistakes: [
      "Thinking you can't edit Bass/Poli — unfolding the rack reveals the full synthesis chain",
      "Ignoring Macro Variations — they're the entire point of having presets with 8 macros",
    ],
  },

  "instrument-rack": {
    hook: "Stack instruments. Split the keyboard. Layer a string pad under your lead. All at once.",
    definition: [
      "An Instrument Rack is a container that holds multiple instrument chains — each chain has its own instrument, effects, and MIDI range. Chains can play simultaneously (layered), or on different parts of the keyboard (split).",
    ],
    beginner: {
      what: [
        "An Instrument Rack lets you combine multiple instruments into one. You can layer a pad underneath a piano so both play whenever you press a key. Or split the keyboard so your left hand plays bass (Wavetable) while your right plays chords (Poli) — all on one track. Up to 16 macro knobs control parameters across all chains simultaneously.",
      ],
      why: [
        "Professional synth sounds are almost always layered — the 'single patch' that sounds huge is usually 3-4 instruments summed together.",
        "Keyboard splits let one MIDI controller drive a complete live performance setup from a single track.",
        "Macros let you control multiple parameters across multiple instruments with one knob.",
      ],
      analogy:
        "An Instrument Rack is like an orchestra section — many players, one conductor (the macro knobs), all reading from the same score (the MIDI notes you play).",
    },
    advanced: {
      what: [
        "Each chain in an Instrument Rack has an independent key zone (which MIDI notes trigger it), velocity zone (which velocities trigger it), and chain selector range (controlled by a macro for dynamic switching/crossfading). Chains can be muted, soloed, and hot-swapped without stopping playback. The Chain Selector enables crossfading between chains — morph from one sound to another with a single knob.",
      ],
      edgeCases: [
        "MIDI effects placed before the Rack affect all chains — place MIDI FX inside individual chains for per-chain behavior",
        "Chain Selector crossfade range: overlap zones so chains fade between each other rather than cutting",
        "16 macros in Live 11+ — earlier versions had 8",
      ],
      engineerNotes: [
        "Use velocity zones to layer a string 'attack' sample at high velocity and a pad at low — the attack becomes an accent rather than a separate part",
        "Randomize chain selector from an LFO for probabilistic sound variation on every note",
        "Name chains and macros descriptively before saving — it's unreadable 6 months later otherwise",
      ],
    },
    listenFor: [
      "The 'thickness' of a layered patch vs its individual components played alone",
      "How crossfading between chains differs from a simple crossfade in the mixer",
    ],
    proMoves: [
      "Layer Drift (analog warmth) + Operator (FM precision) + reverb return for modern lead sounds",
      "Create a 4-chain rack, map Chain Selector to Macro 1, set overlapping zones — one knob morphs through 4 sounds",
      "Put a compressor on the Rack output to glue layered chains together",
    ],
    mistakes: [
      "Forgetting each chain's MIDI FX are independent — put Scale before the Rack, not inside chains, if you want it global",
      "Overlapping key zones accidentally — two chains playing the same notes both consume CPU and can phase",
    ],
  },

  "midi-effects-tour": {
    hook: "Before the note reaches the synth, you can transform it completely.",
    definition: [
      "MIDI effects sit between your MIDI input and the instrument in the device chain. They process note data — pitch, timing, velocity, duration — before any sound is made.",
    ],
    beginner: {
      what: [
        "MIDI effects transform notes before they reach the instrument. Arpeggiator takes held chords and plays them as sequences. Scale locks every note to a musical key — no wrong notes. Chord adds extra notes above or below what you play. Random generates notes you'd never choose yourself. Note Echo creates MIDI delays — repeated note triggers after the original. They're all non-destructive and can be combined in any order.",
      ],
      why: [
        "Scale is the fastest way to play 'in key' without knowing music theory — every pad of Push, every key on the keyboard becomes musical.",
        "Arpeggiator turns held chords into sequences without programming a single note.",
        "Random + Chord creates generative melodic content that sounds intentional but is algorithmically produced.",
      ],
      analogy:
        "MIDI effects are like autocorrect for music — they intercept what you play and improve or transform it before the synth ever hears it.",
    },
    advanced: {
      what: [
        "Signal flow: MIDI Input → MIDI Effects chain → Instrument → Audio Effects → Output. Multiple MIDI effects chain sequentially — Scale quantizes pitch, then Arpeggiator sequences those quantized pitches, then Chord adds harmony to each arpeggiated note. Note Echo is a true MIDI delay — it re-triggers the instrument rather than delaying audio, so each echo goes through the full instrument chain with fresh envelopes.",
      ],
      edgeCases: [
        "MIDI effects only affect the track they're on — they don't process MIDI from other tracks",
        "Random's Chance parameter: 100% = always randomize, 0% = never. Use 20-40% for spice without chaos",
        "Arpeggiator's Hold mode latches notes — keep adding and removing notes while it runs",
      ],
      engineerNotes: [
        "Stack Scale → Chord → Arpeggiator for instant generative melodic patterns from one held chord",
        "Use Note Echo with a dotted-eighth delay time for the classic rhythmic echo effect",
        "Pitch effect transposes incoming MIDI — use it to detune a chain in an Instrument Rack without retuning the instrument itself",
      ],
    },
    listenFor: [
      "How Chord adds notes above vs below your played note — the interval character changes the entire harmonic feel",
      "The rhythmic difference between audio delay and MIDI Note Echo on the same instrument",
    ],
    proMoves: [
      "Arpeggiator in Random mode + high-rate + Scale locked = instant generative arpeggio that always sounds musical",
      "Note Echo with 3 echoes, each getting quieter — 'ghost note' feel on drum MIDI",
      "Velocity MIDI effect before a synth to compress the dynamic range of your playing",
    ],
    mistakes: [
      "Expecting MIDI effects to work on audio tracks — they only process MIDI note data",
      "Putting MIDI effects after the instrument — the signal is audio at that point, not MIDI",
    ],
  },

  "external-instrument": {
    hook: "Your hardware synth is a plugin now.",
    definition: [
      "External Instrument sends MIDI out of Live to a hardware synth, receives the audio back in, and presents the whole thing as a single device on a MIDI track — latency-compensated, automatable, and ready to process with Live's effects.",
    ],
    beginner: {
      what: [
        "External Instrument is a bridge between Live and your hardware gear. It sends MIDI notes from a MIDI track out through your interface to a synthesizer (or drum machine, or effects box), then brings the audio back in through the same interface. From Live's perspective, it's just another instrument — you can record it, automate its parameters via MIDI CC, and run its audio through Live's effects.",
      ],
      why: [
        "Hardware synths have character that's hard to replicate in software — putting them inside Live's workflow makes them first-class citizens rather than a separate rig.",
        "Latency compensation means the hardware's audio arrives back in sync with everything else in your session — no manual delay adjustments.",
        "You can record multiple MIDI performances and commit to audio when you're happy.",
      ],
      analogy:
        "External Instrument is a phone call to your hardware — Live speaks MIDI, the hardware speaks audio back, and External Instrument is the connection.",
    },
    advanced: {
      what: [
        "External Instrument outputs MIDI on a specified port/channel and returns audio on a specified input channel. The Hardware Latency knob compensates for the round-trip delay (measure it with Live's delay compensation tool or by recording a click and aligning it manually). MIDI CC automation in the clip's envelope editor controls hardware parameters over the same MIDI channel.",
      ],
      edgeCases: [
        "USB MIDI interfaces add less latency than DIN MIDI (5-pin) — prefer USB for time-sensitive setups",
        "Some hardware responds to all MIDI channels (Omni mode) — set the hardware to a specific channel to avoid cross-talk",
        "Hardware Latency must be set per-interface — measure once, write it down",
      ],
      engineerNotes: [
        "Use a second External Instrument on the same hardware on a different MIDI channel for multi-timbral gear",
        "Record the hardware's audio to a new audio track when you've committed — frees the MIDI track to control something else",
        "Send MIDI CC from clip envelopes rather than automation lanes for hardware parameter recording that travels with clips",
      ],
    },
    proMoves: [
      "Route hardware audio through Live's effects chain for the best of both worlds — analog character, digital processing",
      "Use Multiple External Instruments to drive different channels of a multi-timbral synth from one Live session",
      "Record hardware MIDI output back into Live with a separate MIDI track for generative hardware sequences",
    ],
    mistakes: [
      "Forgetting to set Hardware Latency — your hardware will sound early or late relative to software instruments",
      "Using audio interface inputs already in use for monitoring — External Instrument needs dedicated input channels",
    ],
  },

  "stem-separation": {
    hook: "Any song. Four stems. In seconds. On your machine.",
    definition: [
      "Stem Separation (Live 12) analyzes a mixed audio file and separates it into four stems — drums, bass, melody, and other — all processed locally using Ableton's built-in AI model.",
    ],
    beginner: {
      what: [
        "Drop any mixed audio clip into Live, right-click it, and choose Separate Stems. Live analyzes the mix using an AI model running on your computer (no internet required) and creates four separate audio clips: drums, bass, melody, and everything else. You can then process each element independently — EQ the bass, add reverb to the melody, or sample the drums into a Drum Rack.",
      ],
      why: [
        "Sample any song without needing the original stems — extract a bassline, isolate a vocal, grab a drum groove.",
        "Fix a mix where elements were baked together — boost the bass on a stem without affecting the drums.",
        "Creative remixing: use the melody stem as a granular source in Granulator III.",
      ],
      analogy:
        "Stem Separation is like reverse engineering a meal — you can figure out what ingredients were used and separate them back out, more or less.",
    },
    advanced: {
      what: [
        "Live 12's separation model is a local neural network (no cloud processing). Output quality depends on source complexity — clearly separated arrangements (sparse electronic music) separate well; dense arrangements (full orchestral) are harder. Each stem is output as a new audio clip in the Arrangement, time-locked to the original. Artifacts are most audible at stem boundaries, particularly on leaky bass frequencies in the drums stem.",
      ],
      edgeCases: [
        "'Other' stem catches anything that isn't drums, bass, or melody — often includes harmony, pads, FX",
        "Mono sources separate more cleanly than stereo — stems from mono mixes have fewer artifacts",
        "Artifacts are most audible in quiet passages where one stem 'bleeds' into another",
      ],
      engineerNotes: [
        "Use drums stem as a reference for groove extraction in Groove Pool — pull the swing of any track",
        "Layer the melody stem with a synthesized version for instant hybrid sounds",
        "The bass stem is often your cleanest source for sub-bass resampling without kick interference",
      ],
    },
    listenFor: [
      "Bleed between stems in complex arrangements — the drums stem will have some bass, the bass stem some kick",
      "How separation quality varies with source material density",
    ],
    proMoves: [
      "Extract the drum stem → slice to Drum Rack → resample with new processing → original feel, new sound",
      "Layer original melody stem with a pitch-shifted copy for instant harmonization",
      "Use stem separation on vintage records to extract basslines uncontaminated by mid-range instruments",
    ],
    mistakes: [
      "Expecting perfect separation — stems always have some bleed; treat them as starting points not final outputs",
      "Trying to separate already heavily processed/limited masters — headroom matters for the AI model",
    ],
  },

  "midi-transforms": {
    hook: "Live 12 puts a studio of MIDI tools directly inside the Piano Roll.",
    definition: [
      "MIDI Transformations are built-in operations in Live 12's Piano Roll that generate, modify, and reorder notes — strum chords, pitch shift patterns, arpeggiate, recombine rhythms, and add ornaments without leaving the clip.",
    ],
    beginner: {
      what: [
        "MIDI Transformations are tools that appear in the Piano Roll when you select notes. Instead of editing notes by hand, you choose a transformation and Live does the work. Strum makes a chord sound like it's being strummed on a guitar. Pitch Shift moves notes up or down in scale steps. Arpeggiate turns held chords into sequences. Recombine shuffles rhythm and pitch separately. Ornament adds grace notes and trills.",
      ],
      why: [
        "Writing a realistic guitar strum by hand requires precise timing offsets for each note — Strum does it in one click.",
        "Recombine lets you break the link between which rhythm uses which pitch — generate unexpected melodic variations from existing material.",
      ],
      analogy:
        "MIDI Transformations are like Photoshop filters for notes — you apply one and the selected notes transform according to musical rules.",
    },
    advanced: {
      what: [
        "Each transformation is non-destructive until you commit it — you preview the result and can adjust parameters before applying. Strum: offset direction (up/down), time per string, velocity curve. Recombine: rhythm and pitch sources can each be the selection, clipboard, or random — mix and match. Ornament: grace note style, trill interval, speed. All transformations respect the project's scale setting when they generate pitches.",
      ],
      edgeCases: [
        "Transformations work on the current selection — select specific notes to apply to a subset of a pattern",
        "Recombine with random pitch source generates different results each time — use it as a starting point and commit when interesting",
        "Strum direction affects perceived harmonic 'voicing' — down strums emphasize bass, up strums emphasize melody",
      ],
      engineerNotes: [
        "Strum + slow rate on full chords = realistic fingerpicked guitar simulation from sustained MIDI chords",
        "Chain transformations: Arpeggiate a chord, then Pitch Shift the arpeggio by scale steps, then Recombine rhythm",
        "Ornament with fast trill interval + very short duration notes = piano trill without drawing each note",
      ],
    },
    listenFor: [
      "How Strum changes a static chord into something that feels performed rather than programmed",
      "The rhythmic interest Recombine creates by decoupling pitch from timing",
    ],
    proMoves: [
      "Strum at 8ms per step + downward direction + velocity curve falling = realistic acoustic guitar chord",
      "Apply Arpeggiate, then manually edit the resulting notes — use it as a grid, not a finished product",
      "Recombine with clipboard rhythm source: copy a drum groove's rhythm, paste as pitch source for a melodic pattern",
    ],
    mistakes: [
      "Committing transformations before previewing all parameter options — always explore first",
      "Applying Strum to monophonic lines — it only makes musical sense on chords of 2+ simultaneous notes",
    ],
  },

  "scale-awareness": {
    hook: "Set the key once. Every instrument, Push, and MIDI tool speaks the same language.",
    definition: [
      "Scale Awareness (Live 12) is a project-wide key and scale setting that MIDI devices, Push, and MIDI Transformations all respect — setting it once keeps everything in key automatically.",
    ],
    beginner: {
      what: [
        "At the top of Live's interface in Live 12, you can set a root note and scale (C Major, F# Minor, D Dorian, etc.). Once set, the Scale MIDI device automatically filters notes to that scale, Push 3's pads highlight in-key notes, and MIDI Transformations generate pitches within the scale. You set it once; everything follows.",
      ],
      why: [
        "Playing a wrong note is impossible when every tool respects the scale — great for live performance and fast sketching.",
        "Chord generators and arpeggiators that use scale steps sound musical automatically rather than generating intervals that clash.",
      ],
      analogy:
        "Scale Awareness is like setting the speed limit for your whole session — every driver (every device) knows the rules without being individually instructed.",
    },
    advanced: {
      what: [
        "The scale setting is stored per Live Set and can be overridden per-clip (Live 12 introduces clip-level scale metadata). The Scale MIDI device reads the project scale setting and updates automatically when it changes. Push 3 in Melodic mode highlights in-scale pads and suppresses out-of-scale notes. MIDI Transformations that generate pitches (Arpeggiate, Ornament, Recombine with random pitch) all use the project scale as their pitch pool.",
      ],
      edgeCases: [
        "Clip-level scale override: useful for modal interchange — a clip in the relative minor within a major key project",
        "Scale device with 'Fold' mode: compresses the keyboard so every key plays an in-scale note — no gaps",
        "Chromatic scale = scale awareness off functionally — all notes pass",
      ],
      engineerNotes: [
        "Change the project scale mid-song to create an instant modal shift — automation on root note creates key changes",
        "Use Fold mode on the Scale device for Ableton Push keyboard playing — every pad is musical",
        "Set scale awareness at the start of every session, even if you know the key — it keeps tools consistent",
      ],
    },
    proMoves: [
      "Automate Root Note to shift key by a perfect fourth at the bridge — instant harmonic lift",
      "Stack Scale device + Chord device: all chords generated will be diatonic to your project key",
      "Use an unconventional scale (Phrygian, Lydian) as the project scale for instant exotic character",
    ],
    mistakes: [
      "Forgetting to update the scale setting when you modulate — the devices keep filtering to the old key",
      "Setting Scale device to restrict notes before a chord device — the chord device needs chromatic input to function correctly",
    ],
  },

  "sound-similarity": {
    hook: "Stop scrolling. Start listening. Similarity Search finds sounds that sound like sounds.",
    definition: [
      "Sound Similarity Search (Live 12) analyzes the audio content of a selected sample and finds perceptually similar samples in your library — searching by timbre, rhythm, and tone rather than filename or tag.",
    ],
    beginner: {
      what: [
        "Right-click any sample in your browser or a clip and choose 'Find Similar Sounds'. Live analyzes the audio — its brightness, rhythm, density, character — and returns a list of samples from your Ableton library that sound similar. It's searching by ear, not by name. A dark, slow bass pad returns other dark slow pads even if they have nothing in common in their file names.",
      ],
      why: [
        "Finding sounds by name is slow and unreliable — 'warm-analog-bass-001.wav' tells you nothing about whether it fits your track.",
        "Similarity Search surfaces sounds you'd never find by browsing — it's stumbling on the right thing without the random walk.",
      ],
      analogy:
        "Similarity Search is like Shazam for your sample library — you hum a song and it finds the match, except here you hold up a sample and it finds its sonic cousins.",
    },
    advanced: {
      what: [
        "Live 12's similarity model analyzes spectral centroid, onset density, tonal vs percussive content, and broad frequency distribution. Results are ranked by perceptual similarity score. Combine similarity search with tag filters (by type, BPM range, or key) to narrow results further. The search runs entirely locally — no audio leaves your machine. Only samples in your configured Ableton library locations are searched.",
      ],
      edgeCases: [
        "Very short samples (< 500ms) return less accurate results — the model needs enough audio to analyze",
        "Highly processed sounds (heavy distortion, extreme pitch shifting) may return unexpected results",
        "Results depend on library size — small libraries return fewer and potentially less relevant matches",
      ],
      engineerNotes: [
        "Use similarity search on your own recordings to find library sounds that complement them tonally",
        "Search from a reference track sample to find library sounds with similar sonic character — instant A/R without guessing",
        "Combine with Groove extraction: find a rhythmically similar sample, extract its groove, apply to your pattern",
      ],
    },
    proMoves: [
      "Drag a reference mix element into a blank slot, search similar, replace it with a library sound that fits — fast sound design by reference",
      "Use the found samples as a curated palette — save them to a project folder before closing",
      "Search from a granulated sample to find 'source material cousins' for layering",
    ],
    mistakes: [
      "Expecting 100% accuracy — similarity is a score, not a match; preview everything before committing",
      "Searching from a sample with heavy reverb — the reverb tail dominates the analysis and confuses results",
    ],
  },

  "comping-flow": {
    hook: "Record 10 takes. Pick the best moment of each. One perfect performance.",
    definition: [
      "Comping is the process of combining the best moments from multiple recorded takes into a single finished performance, using Take Lanes (introduced in Live 11) for non-destructive editing.",
    ],
    beginner: {
      what: [
        "Record a loop as many times as you want — each loop creates a new lane below the main clip showing that full recording. Then switch to comping mode and click any moment in any lane to include it in the final 'comp' at the top. You can mix and match: the first phrase from take 3, the second from take 7, the ending from take 1. Live crossfades the boundaries automatically. Nothing is deleted — every take remains in its lane.",
      ],
      why: [
        "No single take is perfect — comping lets you assemble perfection from real performances.",
        "It's faster than re-recording until you nail it, and more authentic than quantizing everything to a grid.",
      ],
      analogy:
        "Comping is like a film director choosing the best take from each camera angle and editing them together into one scene.",
    },
    advanced: {
      what: [
        "Take Lanes work for both audio and MIDI. The comp lane is always the top track — it shows the assembled result. Each take lane sits below and shows the full recording color-coded to indicate which sections are active in the comp. Loop recording automatically creates new take lanes. Manual recording also creates lanes if take lanes are enabled. Crossfade length at comp boundaries is adjustable — tighter for transient-rich material, looser for legato.",
      ],
      edgeCases: [
        "MIDI comping lets you pick the best bars from multiple MIDI performances — combine timing precision from take 2 with note choices from take 5",
        "Flatten comp bakes the selected regions into one clip and discards the lanes — only do this when you're truly finished",
        "Take lanes expand the track height significantly — collapse them when not comping to reclaim visual space",
      ],
      engineerNotes: [
        "Record 3-5 takes at minimum before comping — you need enough material to find real variation",
        "Mark punch-in/out points to re-record only the problem section without disturbing the rest",
        "Export the comp for the client first, keep the session with lanes in case revisions are needed",
      ],
    },
    proMoves: [
      "Record 8 takes, identify the best 2-3 by ear, then comp only within those — reduces decision fatigue",
      "Use MIDI comping on piano/guitar chord performances: pick the best voicings measure by measure",
      "Comp vocals in sections: verse, pre-chorus, chorus separately — different sections need different energy levels",
    ],
    mistakes: [
      "Flattening the comp before the session is signed off — lanes are your safety net, never delete them early",
      "Comping during the performance session — get all takes first, then comp fresh ears the next day",
    ],
  },

  "groove-pool": {
    hook: "Make your loop swing like that loop.",
    definition: [
      "The Groove Pool extracts the timing and velocity 'feel' from any audio or MIDI clip and lets you apply it to other clips — transferring the groove of one loop to any pattern in your session.",
    ],
    beginner: {
      what: [
        "Every great loop has a feel — notes land slightly early or late compared to the grid, velocities vary in a musical pattern. Groove Pool captures this. Drag any clip to the Groove Pool, and Live creates a groove file from its timing and velocity characteristics. Then drag that groove file onto any other clip and that clip now swings with the same feel. A quantized drum machine pattern can groove like a live jazz drummer.",
      ],
      why: [
        "Groove is what makes beats feel human rather than mechanical — it's the micro-timing that separates a great feel from a stiff grid.",
        "Making all elements of a track share the same groove glues them together in a way that no amount of EQ or compression can achieve.",
      ],
      analogy:
        "Groove Pool is like capturing someone's handwriting style and teaching it to another pen — the letters look different but the hand feels the same.",
    },
    advanced: {
      what: [
        "Grooves are stored as .agr files. Key parameters: Base (which note value the groove is quantized around), Quantize (how much grid-snapping before groove is applied), Timing (how strongly the groove shifts note timing — 0% = no effect, 100% = full groove timing), Velocity (how strongly groove affects note velocity), Random (adds per-note randomization on top of the groove). Commit bakes groove timing into MIDI note positions, creating a new clip with fixed timing — no longer referencing the groove file.",
      ],
      edgeCases: [
        "High Timing + high Quantize creates a 'swung but tight' feel — useful for electronic music that needs groove without sloppiness",
        "Groove applied to audio clips works via clip warping — each warp marker is shifted according to the groove template",
        "Groove from a 4/4 loop applied to a 3/4 pattern creates polyrhythmic timing that can be musical or a mess",
      ],
      engineerNotes: [
        "Extract groove from the main element (kick pattern, bass loop) then apply to everything else — unifies the session feel",
        "Vary Timing across tracks: drums at 100%, bass at 80%, keys at 50% — groove tightens toward the rhythm section",
        "Build a library of .agr groove files from your favorite loops — apply any feel to any project",
      ],
    },
    proMoves: [
      "Extract groove from a vinyl recording — the pitch wobble and timing imprecision becomes a groove that makes digital drums sound like they're on tape",
      "Apply groove at 30% to a quantized pattern for subtle humanization that's invisible to the ear but felt",
      "Use Random parameter at 5-10% on drums — every loop sounds slightly different without losing the core groove",
    ],
    mistakes: [
      "Committing groove before the session is finalized — once committed, the groove is baked and the template is detached",
      "Applying the same groove at 100% to every element — everything sounds the same and the groove loses its purpose",
    ],
  },

  "linked-track-editing": {
    hook: "Edit 8 drum mics at once. One cut. All tracks.",
    definition: [
      "Linked-Track Editing lets you apply identical edits — splits, trims, nudges — across multiple selected tracks simultaneously, keeping multi-track recordings in perfect alignment.",
    ],
    beginner: {
      what: [
        "When you record a drum kit with 8 microphones, every mic captures the same performance from a different position. If you want to cut a section, you need to make the exact same cut on all 8 tracks — otherwise the drums fall out of sync. Linked-Track Editing does this automatically. Select the tracks you want to link, enable linking, and any edit you make on one track happens on all of them at the same time.",
      ],
      why: [
        "Multi-mic recordings, stems, and layered performances all need to stay in sync — linked editing is the only way to do that without manually duplicating every edit.",
        "It's also useful for linked automation — editing the length of a clip automatically adjusts all linked automation.",
      ],
      analogy:
        "Linked editing is like editing a multi-layer document where all layers move together — pull one corner and all layers resize.",
    },
    advanced: {
      what: [
        "Select tracks by clicking their headers (Cmd/Ctrl + click for multi-select). Toggle linked editing per track pair by holding Option/Alt and clicking to link/unlink. Linked tracks share: split points, trim handles, clip length adjustments, and nudge operations. They don't automatically share: clip volume, fade settings, or clip content — only structural editing operations. Useful for: drum stems, multi-mic recordings, layered synth stacks that must stay aligned.",
      ],
      edgeCases: [
        "Mixed clip lengths in linked tracks: edits apply proportionally if clips have different start points — offset linking handles this",
        "Unlinking a track pair mid-session leaves both tracks independently editable going forward — re-link manually",
        "Linked editing works in Arrangement View only — Session View clips are independent",
      ],
      engineerNotes: [
        "Link drum tracks before any editing session — undo doesn't always re-link if you forget",
        "Don't link tracks with genuinely independent timing (e.g., a lead vocal and a background pad) — you'll move things that shouldn't move",
        "Link stems received from a mixer for mastering sessions — any time-align edit keeps all stems together",
      ],
    },
    proMoves: [
      "Link all drum tracks + bus track — editing the bus also edits all individual mics simultaneously",
      "Use linked editing to tighten a drum performance: split at every beat, nudge the late hits earlier, all mics move together",
      "Record a piano with two mics (stereo pair), link them, comp performances knowing both channels always match",
    ],
    mistakes: [
      "Linking tracks that have intentional timing offsets (e.g., delay throws) — linking destroys the offset relationship",
      "Forgetting tracks are linked when doing creative edits — check linked status before any structural edit",
    ],
  },

  "push3-standalone": {
    hook: "No laptop. No cables. Just Push.",
    definition: [
      "Push 3 Standalone contains a full computer running Live's audio engine inside the hardware — no laptop required for composing, performing, or recording.",
    ],
    beginner: {
      what: [
        "Push 3 Standalone is a complete music production studio in a box. It has Live's full audio engine running on a chip inside the unit, a built-in audio interface, a screen showing the session, and all of Push 3's pads and controls. You can create a session from scratch, add instruments, record audio from the built-in or external inputs, and perform a set — all without a laptop. Projects are saved to an internal drive and open on your computer exactly as they are on Push.",
      ],
      why: [
        "For live performance, no laptop means one less thing to go wrong — and no fan noise audible to the audience.",
        "For production, Push Standalone works anywhere: studio, tour bus, couch — no need to set up a computer.",
        "Push 3 projects open in Live on your computer — the workflow is completely continuous.",
      ],
      analogy:
        "Push 3 Standalone is like an iPad that runs the full desktop version of the app — not a lite version, the real thing.",
    },
    advanced: {
      what: [
        "Push 3 Standalone runs Live's audio engine on an Intel Core i3 (base) or i7 (high-spec) embedded module. It supports the full Live device library including Max for Live. Audio I/O: 2 in / 2 out (high-spec: CV I/O for modular). Projects are stored on an internal NVMe drive, accessible via USB when connected to a computer. In Controller mode (connected to a laptop), Push 3 acts as a standard Push controller — standalone mode switches off. MPE is fully supported both standalone and as a controller.",
      ],
      edgeCases: [
        "CPU-intensive projects may need freezing on Push's lower-spec processor — same workflow as on a laptop",
        "External drives not supported standalone — all samples must be on the internal drive (importable via USB)",
        "USB-C connection: charging, data sync, and controller mode use the same port — can't charge while in data sync mode on some hubs",
      ],
      engineerNotes: [
        "Prepare sessions on laptop, copy to Push internal drive for performance — test CPU before the gig",
        "Use Push's built-in audio interface for recording in standalone — quality is sufficient for demos and sketching",
        "Max for Live devices run standalone — important for live sets built around M4L devices",
      ],
    },
    proMoves: [
      "Start a session on Push Standalone during soundcheck, open it in Live at the hotel, finish it, return to Push for the show",
      "Use standalone mode for field recording + sampling sessions — grab a loop, build on it, finish at the studio",
      "Map Push's hardware controls to key parameters before a show — muscle memory on hardware is faster than mouse-hunting in Live",
    ],
    mistakes: [
      "Loading a session with many heavy plugins without testing CPU first — Push's processor is capable but not infinite",
      "Not importing samples to the internal drive before going standalone — missing samples = no sound at the gig",
    ],
  },

  "cpu-audio-setup": {
    hook: "Clicks and pops are your interface telling you it's overwhelmed. Here's how to fix it.",
    definition: [
      "Audio setup and CPU management covers buffer size, sample rate, freeze, flatten, and multichannel routing — the technical foundation that determines whether your session runs cleanly.",
    ],
    beginner: {
      what: [
        "When you hear clicks and pops in your session, it means your computer can't process audio fast enough. The main control is Buffer Size (in Preferences → Audio). Higher buffer = more time to process = no clicks, but more latency between playing a key and hearing the sound. For recording, use a small buffer (64-256 samples). For mixing, use a larger buffer (512-1024 samples). Freeze tracks to temporarily render heavy plugins and free CPU.",
      ],
      why: [
        "Understanding buffer size is the single most useful technical skill for a producer — it's the first thing to fix when something sounds wrong.",
        "Freeze/flatten keeps sessions running on underpowered machines — critical for working with dense sound design.",
      ],
      analogy:
        "Buffer size is like the size of a delivery truck — a bigger truck carries more cargo per trip, but takes longer to load and unload.",
    },
    advanced: {
      what: [
        "Buffer size sets the number of samples processed per block. Latency = buffer size / sample rate (e.g., 512 samples at 44.1kHz = 11.6ms round-trip). CPU spikes (not average usage) cause clicks — use Live's CPU meter and watch for the bar hitting 100% momentarily. Freeze writes a temporary audio render to disk; flatten permanently renders and removes the device chain. Multicore CPU support: Live distributes tracks across cores — a 16-track session uses ~4-8 cores depending on the device complexity per track.",
      ],
      edgeCases: [
        "Plugin delay compensation (PDC) adds latency equal to the plugin's lookahead — can cause timing issues on live monitoring paths",
        "Sample rate above 44.1kHz doubles CPU and disk usage — 48kHz for video, 44.1kHz for music; 96kHz rarely justified",
        "Flatten removes the original devices permanently — always keep a pre-flatten version of the session saved",
      ],
      engineerNotes: [
        "Set buffer to 64-128 for tracking, 512-1024 for mixing — switch in Preferences, no session restart needed",
        "Watch the disk stream indicator (next to CPU) — it going red means drive speed is the bottleneck, not CPU",
        "If a specific plugin spikes CPU, freeze just that track — don't freeze the whole session unnecessarily",
      ],
    },
    proMoves: [
      "Use 'Aggregate Device' on Mac to combine two audio interfaces for more I/O without a new interface",
      "Freeze the most complex tracks at session start so CPU headroom is available for the mix bus chain",
      "Export audio with the buffer at maximum for the fastest render — it only affects real-time monitoring, not render speed",
    ],
    mistakes: [
      "Leaving buffer at 64 samples during a dense mixing session — you'll fight dropouts the whole time",
      "Flattening without saving a pre-flatten session version — you lose the original devices permanently",
    ],
  },

  "accessibility-features": {
    hook: "Ableton Live 12 is the first version of Live built for accessibility from the ground up.",
    definition: [
      "Live 12 introduces screen reader support (Speak Help), high-contrast display mode, improved keyboard navigation, and comprehensive accessibility settings — making Live usable for producers with visual or motor impairments.",
    ],
    beginner: {
      what: [
        "Speak Help reads parameter values and control names aloud using your system's screen reader when you hover over controls. High-contrast mode increases visual differentiation between UI elements. Full keyboard navigation lets you control all of Live's parameters without a mouse. These features are enabled in Preferences → Look/Feel → Accessibility.",
      ],
      why: [
        "Music production shouldn't require perfect vision or motor control — these features open Live to a wider range of producers.",
        "Keyboard navigation shortcuts benefit all users — knowing you can tab through parameters is useful even without screen reader needs.",
      ],
      analogy:
        "Accessibility features are like ramps at a building — they're required for some, but convenient for everyone.",
    },
    advanced: {
      what: [
        "Speak Help integrates with VoiceOver (macOS) and NARRATOR (Windows) — it reads parameter names, current values, and control types on focus. Tab/Shift-Tab navigates the device chain. Arrow keys adjust parameter values. Space bar triggers transport. Full keyboard mapping is documented in Live's Accessibility Guide. High-contrast mode uses a separate CSS-like theme with higher luminance ratios for all UI elements.",
      ],
      edgeCases: [
        "Screen readers may struggle with real-time parameter updates — use automation to set values rather than real-time adjustment when using screen readers",
        "Some third-party Max for Live devices may not be fully accessible — accessibility is the device author's responsibility",
        "Keyboard navigation focus can get lost in complex device chains — use Tab to re-establish focus",
      ],
      engineerNotes: [
        "Even without accessibility needs, keyboard navigation is faster than mouse for precise parameter entry — learn Tab + arrow key workflow",
        "High-contrast mode is useful in bright studio environments regardless of visual needs",
        "Test your Live sessions with Speak Help on briefly — it reveals undescribed parameters and labels that should be improved",
      ],
    },
    proMoves: [
      "Use keyboard navigation for parameter automation recording — Tab to the parameter, record-enable, adjust with arrow keys for perfectly controlled automation",
      "Combine keyboard navigation with MIDI mapping for a fully hardware-controlled workflow with no mouse required",
      "Speak Help + a MIDI controller = eyes-free production session — useful for learning device parameters by ear",
    ],
    mistakes: [
      "Assuming accessibility features only matter for users with disabilities — keyboard navigation and contrast settings benefit everyone",
      "Disabling Speak Help immediately if it's unfamiliar — give it 10 minutes, it's a useful tool for learning new devices",
    ],
  },
};
