// Deep lessons for the DJ world — Path 1: DJ Fundamentals (8 missions).
// Two-track: beginner (high-school clear, analogies) + advanced (engineer-grade
// references to rekordbox controls and pro practice). Paraphrased from general
// DJ knowledge and the rekordbox 6 manual workflows — original prose.
import type { LessonDeep } from "./types";

export const DJ_LESSONS: Record<string, LessonDeep> = {
  // ============================================================
  // PATH 1 — DJ FUNDAMENTALS
  // ============================================================
  "what-is-djing": {
    hook: "A DJ is a live curator. The records do the singing — you choose which one, when, and how it arrives.",
    beginner: {
      what: [
        "DJing is the art of playing recorded music for a room of people and stitching the tracks together so the music never stops. Two songs at a time, one fading in while the other fades out.",
        "Your three jobs are: pick the right track for the moment, blend it in without breaking the dance floor's rhythm, and read what the crowd needs next. Everything else — gear, software, effects — is in service of those three jobs.",
        "You are not making the music. You are arranging a journey using music that already exists. The skill is in the order, the timing, and the transition.",
      ],
      why: [
        "It teaches you to listen actively — you hear structure, energy and key in seconds instead of minutes.",
        "It teaches taste. You build a library and learn why one snare hit lands and another doesn't.",
        "It teaches stage presence. Crowds tell you immediately if you read the room wrong.",
      ],
      analogy:
        "A chef doesn't grow the ingredients. They choose them, time them, and plate them so each course makes the next one feel inevitable. A DJ does the same with tracks.",
    },
    advanced: {
      what: [
        "Technically, DJing is real-time audio mixing of two or more pre-recorded sources synchronised in tempo and beat phase, with EQ and level used to shape the spectral and dynamic crossover between them.",
        "Modern DJing splits into three modes: turntablist (cuts, scratches, juggles on vinyl/CDJs), club mixer (long blends, energy curves over 1–6 hours), and performance DJ (stems, loops, effects, sometimes live remixing in software like rekordbox Performance Mode or Ableton).",
        "The discipline rewards three meta-skills: pattern recognition (structure, key, energy), motor control (beatmatching, faders, EQ rides) and crowd modelling (predicting what 200 people will need in 90 seconds).",
      ],
      edgeCases: [
        "'DJ' covers radio show hosts, weddings, raves, festivals and bedroom streamers — each has different rules. Wedding DJ tools (mic, requests) overlap only partially with club tools.",
        "Sync-only DJs are not 'fake' but lose recovery options when sync drifts on a track with a bad grid — manual beatmatching is the safety net.",
        "Streaming-restricted services (Beatport LINK, TIDAL via rekordbox) are not legal to play in commercial venues in every territory.",
      ],
      engineerNotes: [
        "A DJ mixer is essentially a 2–4 channel summing console with per-channel 3-band EQ, gain, fader, cue bus and a crossfader. Everything you do is volume × frequency × time.",
        "Latency budget matters once you add software FX: aim for <10 ms round-trip on the audio interface or rides feel sluggish.",
      ],
    },
    flow: "Library → Deck A → Mixer → Master / Headphones ← Deck B ← Library",
    walkthrough: [
      { do: "Open rekordbox and load any two tracks you know well to Deck 1 and Deck 2.", listen: "Notice both tracks now show waveforms and the BPM in the top corner — that's your analysis result." },
      { do: "Play Deck 1 through the master, send Deck 2 only to your headphones (cue button).", listen: "You hear the live track in the room and the next track privately. That separation is the entire DJ workflow." },
      { do: "While Deck 1 plays, hit play on Deck 2 in your headphones and find a moment where the two kicks line up.", listen: "When the kicks land together, that's beat phase alignment. Lose it by 20 ms and it sounds 'galloping'." },
      { do: "Slowly raise Deck 2's channel fader and lower Deck 1's at the same rate over 16 bars.", listen: "The room hears one continuous beat — you've done a basic blend." },
      { do: "After the swap, stop Deck 1 and re-cue it for the next track.", listen: "That repeat — load, cue, blend, swap — is one cycle of a DJ set. A 2-hour set is ~40 of those." },
    ],
    listenFor: [
      "The kick drum — it's the anchor for everything else.",
      "The 'phrase' — most dance music is built in 8-bar and 16-bar chunks. Transitions almost always land on a phrase boundary.",
      "Whether the new track has a vocal or hook coming up. Never bury a hook with a transition.",
      "The crowd's body language — heads up means you have their attention; phones out means you're losing them.",
    ],
    mistakes: [
      "Practising only with songs you love. Build technique on tracks you don't care about — you'll be less precious.",
      "Watching the waveforms instead of listening. The screen lies a little; your ears don't.",
      "Pushing the master fader to fix a quiet track. Use the channel gain (trim) instead, then mix.",
      "Treating the first 30 minutes like the peak. Energy is a curve, not a switch.",
    ],
    proMoves: [
      "Record every practice session. Listen back the next morning — your mistakes are obvious in hindsight.",
      "Learn one 4-deck workflow even if you mostly play 2-deck. It rewires how you think about layering.",
      "Memorise the intro length of your top 50 tracks. You'll mix without looking at the screen.",
    ],
    quizHard: [
      { q: "Why is phrase awareness more important than perfect BPM matching?", options: ["It isn't", "Crowds feel structure breaks (vocal cut off mid-line) far more than 1 BPM drift", "Phrases set the key", "Phrases trigger the FX"], answer: 1, explain: "A blend on the wrong bar cuts a hook in half and the dance floor notices instantly. Tempo drift of ±1 BPM over a 32-bar blend is inaudible.", hint: "What does the crowd hear, the math or the chorus?" },
      { q: "The 'cue bus' on a DJ mixer is", options: ["A backup master output", "A separate mix you send to headphones for previewing the next track", "An effect send", "The recording output"], answer: 1, explain: "Cue lets you hear a deck privately so you can beatmatch and prepare before bringing it into the room.", hint: "Private monitoring." },
      { q: "A 'phrase' in dance music usually means", options: ["1 bar", "4 bars", "8 or 16 bars", "A whole track"], answer: 2, explain: "Producers structure dance music in 8 and 16-bar units. Transitions land on these boundaries.", hint: "Count along to almost any house track — you'll feel the reset every 8 or 16." },
    ],
    sources: [{ label: "rekordbox 6 Operating Manual", section: "Overview" }],
  },

  "dj-equipment": {
    hook: "Two sources, one mixer, two outputs (room + headphones). Everything else is decoration.",
    beginner: {
      what: [
        "Every DJ setup is the same shape: two (or four) decks that play music, a mixer that blends them, a speaker output for the room, and a headphone output just for you.",
        "The decks can be turntables, CDJs (Pioneer's CD/USB players), a DJ controller plugged into a laptop, or even just software with a keyboard. They all do the same job: play a track and let you start/stop/loop/cue it.",
        "The mixer is the brain. Each deck plugs into a channel with its own volume, EQ (bass/mid/treble), and a button to send it to your headphones. The crossfader between channels lets you fade A↔B with one slider.",
      ],
      why: [
        "Once you know the layout, you can DJ on any gear in any club within 5 minutes.",
        "Knowing what each control does means you can fix problems live (a deck sounds bassy → cut the low EQ; a track is too loud → lower the channel gain, not the master).",
        "It's how you communicate with a sound engineer at a venue — 'no signal on channel 2' is faster than 'the music thing isn't working'.",
      ],
      analogy:
        "A DJ setup is a kitchen with two stove burners (decks), a counter where you combine ingredients (mixer), a plate you serve from (master out) and a tasting spoon (headphones).",
    },
    advanced: {
      what: [
        "Industry-standard club rig is a Pioneer CDJ-3000 pair plus a DJM-A9 / DJM-900NXS2 mixer over Pro DJ Link (Ethernet). USB sticks formatted with rekordbox library data plug into the CDJs; the mixer handles all summing, EQ, FX and master output.",
        "Controller setups (Pioneer DDJ, Native Instruments S-series) route audio over USB to/from a host laptop running rekordbox/Serato/Traktor — the controller has no audio brain of its own.",
        "Audio paths: each deck → channel strip (gain → EQ → filter/colour FX → fader) → crossfader → master & booth bus → either balanced TRS/XLR to PA or unbalanced RCA for home. Headphone cue is a parallel bus that taps post-fader OR pre-fader (cue) depending on each channel's cue button state.",
      ],
      edgeCases: [
        "Mixing controller + CDJs ('hybrid setup') requires sending the controller's master out into a free mixer channel — easy to forget the channel gain calibration and clip the rig.",
        "Older venues may have an unbalanced RCA-only booth feed; always carry a balanced→unbalanced adapter or an isolator if you encounter ground hum.",
        "Battery-powered all-in-ones (Pioneer XDJ-XZ, Denon Prime 4) replace mixer+decks in one box but their on-board FX and EQ curves differ from a DJM — practise on the actual venue gear when possible.",
      ],
      engineerNotes: [
        "Always check the master meter on the mixer, not the speakers — your monitor's volume is irrelevant to what hits the PA.",
        "Set gain so peaks hit the top of the green / bottom of the orange on each channel meter. Anything in the red is hitting the digital ceiling and clipping.",
      ],
    },
    flow: "Track source → Deck → Mixer channel (Gain → EQ → Filter → Fader) → Crossfader → Master & Booth → PA",
    walkthrough: [
      { do: "Trace the signal path on any DJ setup before you start: USB/deck → channel input → master out → speaker.", listen: "If no sound, walk the path one stage at a time — the silence is always at one specific point in the chain." },
      { do: "Plug headphones into the mixer (not the laptop or controller).", listen: "Only the channel(s) with the Cue button lit will play in your phones — that's by design." },
      { do: "Lower the master fader, then raise channel 1's gain until peaks reach -6 dB on the channel meter.", listen: "This is gain staging — set channels first, then use the master fader for room volume." },
      { do: "Switch the crossfader fully left, then fully right.", listen: "Only the deck on that side plays. Centre = both. This is the most-broken control on rented gear, so check it." },
      { do: "Find the booth output knob (separate from master) and the headphone mix knob (cue/master blend).", listen: "Booth = your stage monitor. Cue mix = how much of the room you hear in your phones vs. the cued track." },
    ],
    listenFor: [
      "Hum or buzz when nothing is playing — usually a ground loop, fix with a DI box or by plugging into the same circuit.",
      "Clipping (distorted peaks) — almost always a channel gain set too hot, not the master.",
      "One side of the stereo image missing — bad cable, or the channel pan is off-centre.",
      "Latency on a controller (you press play, sound arrives late) — increase buffer or check USB hub.",
    ],
    mistakes: [
      "Touching the master fader to balance individual tracks. That's what channel gain and EQ are for.",
      "Using the booth and master at different volumes mid-set without rebalancing — what sounds full in the booth may be thin in the room.",
      "Wrapping a USB stick in keys/coins in your pocket — corrupted file systems are the #1 cause of CDJ no-shows.",
      "Bringing only one USB. Always carry two synced copies (rekordbox Sync Manager handles this).",
    ],
    proMoves: [
      "Carry your own headphone splitter, RCA→3.5mm cable, and at least one spare USB stick.",
      "Take a photo of every connection BEFORE the previous DJ unplugs — saves you in a swap-over panic.",
      "Learn the layout of the DJM-A9, DJM-900NXS2 and DDJ-FLX10. Those three cover ~90% of the venues you'll play.",
    ],
    quizHard: [
      { q: "On a Pioneer DJM mixer, where should you set channel gain?", options: ["Maximum, then lower with the fader", "So peaks land in the green / lower orange of the channel meter", "By ear, the meters are decorative", "Same level as the master fader"], answer: 1, explain: "Gain stages each channel BEFORE the fader and crossfader. Hot gain into a low fader still clips internally.", hint: "Stage before fader." },
      { q: "Pro DJ Link is", options: ["A streaming service", "An Ethernet protocol linking CDJs, mixer and laptop to share BPM, beatgrid, library", "A USB connector type", "A type of XLR cable"], answer: 1, explain: "Pro DJ Link is the Ethernet network that lets CDJs/mixer/rekordbox share tempo, beat phase, library and waveform data.", hint: "Network cable between the decks." },
      { q: "Why send the booth output at a different level than master?", options: ["You don't — they should always match", "Booth feeds your stage monitor; the room PA needs more volume because of distance and crowd absorption", "Booth is mono, master is stereo", "Booth carries the cue signal"], answer: 1, explain: "Booth feeds the DJ; master feeds the room. Crowds and distance absorb high frequencies — booth often runs quieter and slightly different EQ.", hint: "You and the dance floor hear different rooms." },
    ],
    sources: [
      { label: "Pioneer DJM-A9 Operating Instructions", section: "Connections & signal flow" },
      { label: "rekordbox 6 Manual", section: "Connecting hardware (Pro DJ Link)" },
    ],
  },

  "rekordbox-intro": {
    hook: "rekordbox is the database. It analyses every track once, then your decks read that analysis for life.",
    beginner: {
      what: [
        "rekordbox is Pioneer's free software for managing your DJ music library. You drag a track in, it spends a few seconds 'analysing' it (finding the BPM, the key, the beat positions), and then that information lives in the file forever.",
        "There are two main modes: Export Mode (analyse on laptop, copy library to a USB, play on CDJs without the laptop) and Performance Mode (use rekordbox itself like a DJ controller's software, with a controller plugged in).",
        "The layout has 4 panels you'll use 90% of the time: Collection (all your tracks), Playlists (your folders), Browser (file system), and Deck view (the waveforms when you're mixing).",
      ],
      why: [
        "Analysis once, play everywhere. Plug your USB into any CDJ-3000 in any club and your cues, key, BPM and grid are there.",
        "Playlists let you build crates by genre/energy/key — way faster than scrolling 5000 tracks at 2 a.m.",
        "Hot cues you set at home work live — no fiddling under pressure.",
      ],
      analogy:
        "rekordbox is the prep kitchen. You wash, chop, label everything at home so service night is just plating.",
    },
    advanced: {
      what: [
        "rekordbox builds a per-track metadata record: BPM (auto-detected from transient analysis), beatgrid (anchor + tempo curve), musical key (algorithmic harmonic analysis, Camelot notation available), waveform image (3 zoom levels), hot cues (up to 8), memory cues, loops, and your custom My Tags.",
        "Two storage layers: a master SQLite database on your laptop (~/Library/Pioneer/rekordbox/) and per-USB export databases (PIONEER folder on the stick). Sync Manager (cloud or LAN) keeps multiple USBs/laptops aligned.",
        "Export Mode and Performance Mode share the same library — switching is one click. Lighting (DMX), video (rekordbox Video), CDJ tag list, related tracks and intelligent playlists are all built on top of the same metadata.",
      ],
      edgeCases: [
        "Analysis can mis-detect BPM at half/double tempo on drum & bass (often shows 87 instead of 174). Use the Edit Beatgrid panel and the ×2/÷2 buttons.",
        "Variable-tempo tracks (live recordings, edits with tempo curves) need 'Dynamic' grid mode rather than 'Static' — set in Preferences → Analysis.",
        "If you re-encode or re-tag a file outside rekordbox, the database can lose its link to the file. Always tag inside rekordbox or use 'Relocate' if files move.",
        "USB filesystem: FAT32 (universal, 4 GB file limit), exFAT (works on CDJ-3000/2000NXS2, larger files), HFS+ / NTFS are NOT supported on most CDJs.",
      ],
      engineerNotes: [
        "Beatgrid is anchor + tempo, not per-beat — the grid is mathematical from the anchor downwards. A bad anchor = a drifting grid.",
        "Hot cues store position (samples), name, colour and (optionally) a memory loop length. They are read by any CDJ-2000NXS2+ from your USB.",
        "Phrase analysis (Pioneer's 'Beat Jump per Phrase' on CDJ-3000) is a separate algorithm — it can be wrong on intro-less edits and you can override it.",
      ],
    },
    flow: "Drag track → Analyse (BPM/Key/Grid) → Set hot cues → Add to playlist → Export to USB → Plays anywhere",
    walkthrough: [
      { do: "Open rekordbox → drag a track from your Downloads folder into the Collection panel.", listen: "Watch the BPM, Key columns populate after analysis. The waveform appears in the lower preview." },
      { do: "Click the track to load it to a virtual deck (top of the screen).", listen: "Hit play on the deck and the waveform scrolls — that's the same view you'll see on a CDJ-3000." },
      { do: "On the first downbeat after the intro, hit Hot Cue A (numeric keys 1–8 in Performance Mode).", listen: "An orange marker drops on the waveform. From now on, pressing A jumps the playhead there instantly." },
      { do: "Right-click the track → Open in Browser → check the file's actual location on disk.", listen: "rekordbox doesn't move your audio — it just remembers where it lives. Move the file and rekordbox shows a red ! warning." },
      { do: "Create a new Playlist (left panel), drag 5 tracks into it, then Export to a USB stick (File → Export to Device).", listen: "rekordbox copies the audio + database to the stick. Plug into a CDJ and you have your playlist, cues, BPM, key — all of it." },
    ],
    listenFor: [
      "Does the beatgrid line up with the kicks all the way through? Zoom in at 1:00, 2:00, 3:00 — drift is visible.",
      "If the detected key feels wrong (vocal sounds dissonant against a bass note you trust), trust your ears and over-write.",
      "After export, the CDJ shows the same hot cue positions you set. If not, you exported to the wrong USB or didn't 'safely eject'.",
    ],
    mistakes: [
      "Pulling the USB without ejecting — corrupts the PIONEER database and the stick won't load.",
      "Trusting auto-key on tracks with heavy effects or breakdowns — verify by ear with reference tracks.",
      "Building one giant playlist instead of crates by energy/key/role. You'll be scrolling 800 tracks at peak.",
      "Forgetting Sync Manager — playing from a stick that's a week behind your master library is a classic 'where did that track go' moment.",
    ],
    proMoves: [
      "Set hot cue A on every track's first downbeat after the intro. Universal launching position.",
      "Use My Tags for Energy 1–5 and Role (Opener / Builder / Peak / Closer). Filter by tag during the set.",
      "Two USB sticks, identical, kept synced via Sync Manager. One in the deck, one in your pocket.",
      "Set Preferences → Analysis → Quality to High before importing — re-analysis on 5000 tracks later is painful.",
    ],
    quizHard: [
      { q: "Why does drum & bass often get detected at half BPM by rekordbox?", options: ["Bug in the software", "DnB has a half-time feel — kicks land on beats 1 and 3 of a 4/4 bar at 174, which the detector reads as 87", "DnB files are encoded differently", "The detector only goes up to 160"], answer: 1, explain: "The auto-detector picks the strongest pulse rate; DnB's heavy snare-on-3 rhythm reads as 87 BPM in 4/4. Hit ×2 to fix.", hint: "Half-time feel fools the algorithm." },
      { q: "On a CDJ-3000, the hot cues you see are stored", options: ["On the CDJ's internal memory", "In the rekordbox export database on the USB stick you inserted", "In the cloud", "On Pioneer's servers"], answer: 1, explain: "All cue/loop/grid data lives in the PIONEER folder on your USB. The CDJ reads it on insert.", hint: "Pull the USB out and the data goes with it." },
      { q: "Dynamic Beatgrid mode in rekordbox is for", options: ["Tracks with multiple tempos or live-feel timing", "Quantising MIDI", "Stems", "Setting hot cues automatically"], answer: 0, explain: "Static grids assume a constant BPM. Dynamic follows tempo curves — necessary for live recordings, edits with tempo shifts, and many older tracks.", hint: "Live recordings drift; the grid must drift with them." },
    ],
    sources: [
      { label: "rekordbox 6 Operating Manual", section: "Analysis settings & beatgrid editing" },
      { label: "rekordbox 6 Operating Manual", section: "Export Mode / Performance Mode" },
    ],
  },

  "headphone-monitoring": {
    hook: "Your headphones are a private window into the next track. The cue mix is the most under-used knob in the booth.",
    beginner: {
      what: [
        "Headphones in DJing don't replace the speakers — they let you listen to the *next* track privately while the *current* track plays loud in the room. That's how you beatmatch and find the right place to start the new track before anyone in the room hears it.",
        "Every DJ mixer has a 'Cue' button on each channel. Press it and that channel goes to your headphones (only). You can cue multiple channels at once to hear them blended privately.",
        "There's also a 'Cue/Master' or 'Mix' knob on the headphone section. All the way left = only the cued track. All the way right = only the room mix. In the middle = blend of both, which is how most pros monitor live.",
      ],
      why: [
        "You can prepare a transition completely in private — find the downbeat, beatmatch, EQ it — before bringing it into the room.",
        "Cueing both decks at once + Mix knob in the middle lets you hear your transition the way the crowd will hear it, before they hear it.",
        "If the room PA blows up (cable falls out, channel dies), your headphones are your only confirmation that the music is still actually playing.",
      ],
      analogy:
        "Think of headphones as a chef tasting the next dish in the kitchen before it leaves for the dining room.",
    },
    advanced: {
      what: [
        "The cue bus is a parallel summing bus on the mixer. Each channel's CUE button routes a pre-fader (sometimes user-selectable post-fader) signal to the cue bus, summed and sent to the headphone amp.",
        "The Cue/Master crossfade knob blends the cue bus with the master output bus into the headphone amp output. Splitting cue (some mixers: 'split' mode) puts cue in one ear, master in the other — useful for monitoring while wearing one cup.",
        "Closed-back, high-isolation headphones (HDJ-X10, HD25, Sennheiser HD7) are standard. In-ear monitors are increasingly used for hearing protection — sealed IEMs with a wedge or shaker for low-end body.",
      ],
      edgeCases: [
        "On Pioneer DJM-A9 and DJM-V10, the cue tap is post-EQ — so EQ moves on the deck affect what you hear in headphones, which can hide problems if you cut highs and then forget.",
        "Wireless / Bluetooth headphones have unacceptable latency for beatmatching — never use them live.",
        "Long sets with cue volume above 95 dB SPL average risk permanent hearing damage. NIOSH recommends max 85 dB for 8 hours, halve allowed time per +3 dB.",
      ],
      engineerNotes: [
        "Set headphone volume by the loudest source you'll cue against the loudest room moment. Don't keep cranking it through the night — your hearing fatigues but the SPL on your ears keeps rising.",
        "Cue mix at noon (50/50) is the most common pro position — you're always aware of the room while preparing the next track.",
      ],
    },
    flow: "Deck → Mixer channel → Cue button → Cue bus → Cue/Master knob → Headphone amp → Phones",
    walkthrough: [
      { do: "Plug headphones into the front of the mixer (1/4\" TRS jack).", listen: "Silence — even if music is playing in the room. Nothing reaches the cue bus until you press a Cue button." },
      { do: "Press Cue on channel 1 (with a track loaded and playing).", listen: "You hear that channel in your phones. Press it again to release." },
      { do: "Set the Cue/Master mix knob fully to 'Cue' and slowly turn it toward 'Master'.", listen: "You hear the room mix bleed in. Park it at noon for a balanced monitor." },
      { do: "Cue both channel 1 and channel 2 with both decks playing.", listen: "You hear both decks privately blended. This is how you check beatmatch before opening the channel fader to the room." },
      { do: "Open the channel fader on the cued deck while the cue is still active.", listen: "Sound enters the room. Drop the Cue button — your phones now only carry the other deck (the next track), as it should be." },
    ],
    listenFor: [
      "Distortion in headphones — almost always headphone volume too high relative to source, not gain on the channel.",
      "One ear quieter — bad TRS connection or worn jack. Twist the plug 90° to confirm.",
      "Whether the kick on the cued deck and the kick on the room deck arrive together. That's beat phase alignment, audible in <30 ms of drift.",
    ],
    mistakes: [
      "Setting cue mix fully to 'Cue' so you can't hear the room — you lose situational awareness and a dropped PA goes unnoticed.",
      "Cranking headphone volume because the cued track is quiet. Fix the deck's gain, not the headphone amp.",
      "Wearing headphones over both ears all night. Your hearing budget runs out fast — use one cup off when you don't need to cue.",
      "Forgetting to release Cue on the outgoing track. That deck is then absent from your headphones when you need it.",
    ],
    proMoves: [
      "Lower headphone volume between transitions — it gives your ears recovery time and your loud moments stay impactful.",
      "Use the split-cue mode if your mixer has it (cue in one ear, master in the other) when blending in noisy environments.",
      "Invest in flat-response, high-isolation headphones. Hyped low-end headphones make you under-EQ the bass in the room.",
    ],
    quizHard: [
      { q: "What does the Cue/Master knob on a DJ mixer actually do?", options: ["Sets master volume", "Crossfades between the cue bus and master bus into the headphone output", "Turns headphones on/off", "Sets EQ on cue"], answer: 1, explain: "It's a balance between two summed buses going into the headphone amp — neither replaces the other.", hint: "It blends two signals into your phones." },
      { q: "Why are wireless headphones unsuitable for beatmatching?", options: ["They sound worse", "Bluetooth audio latency is typically 150–300 ms — far above the 20 ms you need to feel beat phase", "They aren't loud enough", "They lack bass response"], answer: 1, explain: "You need real-time monitoring. 200 ms of latency means the track you hear is hundreds of ms behind reality.", hint: "Latency, not fidelity." },
      { q: "Safe long-set headphone level is approximately", options: ["Whatever sounds good", "≤85 dB SPL average per ear over 8 hours (NIOSH)", "100 dB", "120 dB"], answer: 1, explain: "Allowable exposure halves per +3 dB. A 4-hour set at 88 dB is the same dose as 8 hours at 85.", hint: "Hearing damage is a dose, not a moment." },
    ],
    sources: [
      { label: "Pioneer DJM-A9 Operating Instructions", section: "Headphone monitoring" },
      { label: "NIOSH 1998 Criteria", section: "Occupational noise exposure" },
    ],
  },

  "booth-setup": {
    hook: "30 seconds of setup checks save 30 minutes of panic. Always assume the previous DJ broke something.",
    beginner: {
      what: [
        "Booth setup is the routine you run from the moment you walk into the booth until your first track plays. Done right, it's invisible. Done wrong, you'll be debugging cables when your set starts.",
        "The basic checklist is: (1) load your USB, (2) check master/booth volume and headphones, (3) test each channel with the master fader down, (4) take over from the previous DJ on a clean phrase, (5) only then turn your master up.",
        "You always assume the EQ knobs, gain, filter, and effects on the mixer are in random positions from the previous DJ. Reset everything to neutral (12 o'clock / off) before bringing your first track in.",
      ],
      why: [
        "A clean takeover is the difference between looking like a pro and looking like an amateur — everyone in the booth notices.",
        "The previous DJ might have cut the high EQ to ride a moment, or left a filter half-on. If you don't reset, your first track sounds wrong and you'll panic-search for the cause.",
        "Knowing your headphone level is set before the takeover means you can cue immediately and not miss the next downbeat.",
      ],
      analogy:
        "Pre-flight check. Pilots don't trust the previous flight's switches — they reset and verify every one before takeoff.",
    },
    advanced: {
      what: [
        "Industry takeover routine: (1) USB inserted to a free CDJ + library loaded, (2) first track loaded but paused on a hot cue, (3) headphones plugged + cue verified, (4) channel gain matched to the outgoing track on the channel meter, (5) EQ + filter + colour FX neutralised, (6) channel fader at zero / crossfader away from your deck, (7) on phrase boundary, ride channel fader up while previous DJ rides theirs down.",
        "Master & booth volume are NEVER touched during a takeover — those belong to the venue's sound engineer or are calibrated to the system. Touch only your own channel.",
        "Effect units and master FX from the previous DJ must be disengaged. The DJM-A9 'BEAT FX' section can still be armed without lighting up — always tap the FX off button to be sure.",
      ],
      edgeCases: [
        "Some venues run Pioneer 'rekordbox lighting' — the DMX layer can desync if a CDJ is unplugged mid-set. Coordinate with the lighting engineer before USB swaps.",
        "Booth feed may have a separate EQ from master — check both meters, not just one.",
        "On hybrid setups (your controller into a free mixer channel), set channel gain to match the CDJs and engage the channel's 'Line' input mode, not 'Phono'.",
      ],
      engineerNotes: [
        "Carry a head torch. Booth lights die, sound desks are dim, and finding a USB port at 2 a.m. is faster with light.",
        "Mark your USB sticks with reflective tape — they vanish into black mixer surfaces.",
      ],
    },
    flow: "Walk in → USB in → Load track → Headphones + cue OK → Match gain → Neutralise EQ/FX → Cue downbeat → Phrase takeover → Master fader stays",
    walkthrough: [
      { do: "Greet the previous DJ. Ask 'how long do you have?' so you know your takeover window.", listen: "Their answer determines whether you have 2 minutes or 20 to set up. Plan accordingly." },
      { do: "Insert USB into an idle CDJ, load your first track, set the playhead on its first hot cue (downbeat after intro), keep it paused.", listen: "The deck shows your waveform. You're armed but silent." },
      { do: "Press the channel's Cue button, set headphone volume by ear against the room volume.", listen: "You hear your track at the volume you need to beatmatch. Master in the room is untouched." },
      { do: "Visually check every EQ knob (low/mid/high), filter, and colour FX on your channel — return any that aren't at 12 o'clock / off to neutral.", listen: "Channel is now a clean slate." },
      { do: "Wait for a phrase boundary (8 or 16 bars) in the outgoing track. On the downbeat, press Play on your deck and bring the channel fader up while the previous DJ brings theirs down.", listen: "Clean takeover. No level change in the master, no EQ collisions, no missed beat." },
    ],
    listenFor: [
      "Sub bass clash on the takeover — the safest first move is to cut your low EQ until the outgoing track's bass is mostly gone.",
      "Master meter staying in the same place during takeover — if it jumps, your gains aren't matched.",
      "Crowd's reaction — a clean takeover gets no reaction (good). A messy one gets heads turning to the booth (bad).",
    ],
    mistakes: [
      "Touching the master fader to 'make sure your track is loud enough' — the venue calibrated that for the room.",
      "Loading a track on a deck the previous DJ is still using.",
      "Forgetting to release the cue on the outgoing track — you'll be hearing the wrong source when you next look for the next track.",
      "Plugging the USB into the deck the previous DJ is currently playing from — yes, this happens, and it can crash the deck.",
    ],
    proMoves: [
      "Arrive 30 minutes before your set. Watch the previous DJ from the floor to learn the room's energy and the system's quirks.",
      "Bring an A4 card with your first 3 transitions noted. Sets where you free-form everything are confident sets; the safety card is for the 1% you need it.",
      "Take a phone photo of the mixer state when you START your set. If you get lost mid-set, you have a known-good reference to return to.",
    ],
    quizHard: [
      { q: "Why is the master fader untouchable during a takeover?", options: ["It's not — adjust freely", "The venue's sound engineer calibrated it for the room/PA; touching it changes the rig's reference level", "It controls the lights", "It's mechanically locked"], answer: 1, explain: "Master + booth output levels are part of the venue's system tuning. Channel gain and channel fader are yours; master belongs to the room.", hint: "Whose calibration is master?" },
      { q: "First move when you sense a sub-bass clash on a takeover is", options: ["Lower the master", "Cut the low EQ on the incoming or outgoing channel until phasing/mud disappears", "Engage a high-pass filter on master", "Reduce headphone volume"], answer: 1, explain: "Two basslines on top of each other = mud and phase issues. Cut low on one channel so only one bass is present at a time.", hint: "Two basses = one too many." },
      { q: "Why neutralise channel EQ/FX before takeover?", options: ["Looks tidy", "Previous DJ's settings can make your first track sound wrong, and you'll waste seconds debugging during your most exposed moment", "Required by Pioneer firmware", "Resets the BPM"], answer: 1, explain: "You can't trust the controls' position from the last user. Reset = predictable starting sound.", hint: "Trust nothing the last DJ left." },
    ],
    sources: [{ label: "rekordbox 6 Manual / Pioneer DJM-A9", section: "Channel signal flow & takeover practice" }],
  },

  "dj-culture": {
    hook: "DJing is older than the equipment. You're joining a 50-year conversation about how to move a room.",
    beginner: {
      what: [
        "DJ culture started in the 1940s with radio DJs picking records, exploded in the 1970s with disco DJs in New York like Francis Grasso (who invented beatmatching) and Larry Levan (who turned a club into a religion at the Paragon Garage).",
        "Hip-hop DJing started in the Bronx with Kool Herc looping the drum breaks of funk records, which led to Grandmaster Flash inventing the cross-fader scratch and turntablism as a musical instrument.",
        "House (Chicago, 1980s, Frankie Knuckles), techno (Detroit, Juan Atkins/Derrick May/Kevin Saunderson), garage (UK), drum & bass, dubstep, EDM, lo-fi — every genre has DJ heroes who set the template for how it's played.",
      ],
      why: [
        "Knowing the history means you can talk to other DJs, promoters and crowds without bluffing.",
        "Every modern technique (cue points, looping, beatmatching, key mixing) was invented by someone in this lineage solving a specific problem. Knowing the why explains the how.",
        "Crowds respect DJs who play the deep records. A 1985 Larry Heard cut in 2026 still works — but only if you know it exists.",
      ],
      analogy:
        "Like a chef who knows escoffier and the regional traditions — you can cook on autopilot, but knowing the lineage makes everything you do intentional.",
    },
    advanced: {
      what: [
        "Lineage you should be able to trace: Disco (Grasso, Mancuso, Levan, Knuckles) → Garage (Paradise Garage, NJ house) → Chicago House (Knuckles, Ron Hardy, Trax/DJ International labels) → Detroit Techno (Belleville Three, Underground Resistance) → UK Rave (Hardcore, Jungle, DnB) → UK Garage → Dubstep → contemporary fragmentation.",
        "Parallel lineage: Bronx hip-hop (Herc, Flash, Bambaataa) → turntablism (DMC, Q-Bert, Mix Master Mike) → modern controllerism / Serato turntablism.",
        "Equipment lineage: Technics SL-1200 (1972) → Pioneer CDJ-100 (1994) → CDJ-1000 (2001, hot cues + waveform) → CDJ-2000 NXS2 → CDJ-3000 + DJM-A9. Each device reshaped what was possible technique-wise.",
      ],
      edgeCases: [
        "'EDM' as a marketing term mostly refers to North American festival house/electro post-2010 — many older European scenes reject the label.",
        "Vinyl-only scenes still exist (some Berlin and Tokyo clubs); knowing why is more useful than dismissing it.",
        "Local scenes matter — your home city's promoters and crews are your real network. Internet fame ≠ booked weekends.",
      ],
      engineerNotes: [
        "Read: Bill Brewster & Frank Broughton 'Last Night a DJ Saved My Life'; Tim Lawrence 'Love Saves the Day'.",
        "Watch: Resident Advisor 'Slices' documentary series; Boiler Room sets from the era you're curious about.",
      ],
    },
    walkthrough: [
      { do: "Pick one decade (e.g. '90s Chicago house) and listen to 5 essential tracks from it on a proper system or good headphones.", listen: "Notice the production limits of the era — drum machines, samplers — and how DJs worked around them." },
      { do: "Watch a Boiler Room or Cercle set from a DJ you've never heard of, all the way through.", listen: "Their track selection tells you who their influences are. Spot the older records." },
      { do: "Read one DJ memoir or oral history of a scene (e.g. Last Night a DJ Saved My Life chapter on the Loft).", listen: "You'll start hearing modern sets as 'descendants of X' rather than isolated artistry." },
      { do: "Identify your local scene's three biggest residents (not touring acts) and listen to their last 5 published sets.", listen: "These are the people you're competing for slots with — know what they play." },
      { do: "Find one classic track per genre you play that's at least 20 years old. Slot it into a set.", listen: "Older heads in the crowd notice. So do promoters." },
    ],
    listenFor: [
      "The 'sound' of an era — disco's live strings, '90s house's MPC swing, '00s minimal's restraint.",
      "Tracks that sample older tracks — a chain backwards is a music history lesson.",
      "Who's quoted on dubplate intros and shout-outs — that's the network of who respects whom.",
    ],
    mistakes: [
      "Assuming culture started with the first DJ you heard of. There's always someone earlier who did it harder.",
      "Treating older genres as nostalgia. They're still being played, mostly because they still work.",
      "Skipping the local scene to chase Instagram-famous DJs. The locals are who book you.",
    ],
    proMoves: [
      "Build a 'roots' playlist of 30 tracks that defined the genre you play — and listen to it once a week.",
      "Show up to other people's parties. The DJ who only DJs is invisible to the scene.",
      "When you find an obscure track that works, share it. Generosity is currency in this culture.",
    ],
    quizHard: [
      { q: "Beatmatching as a DJ technique was popularised by", options: ["Larry Levan", "Francis Grasso, NYC ~1969", "Frankie Knuckles", "Carl Cox"], answer: 1, explain: "Grasso at Sanctuary in NYC built the technique that lets two records be heard as one continuous beat.", hint: "Pre-disco era, late '60s." },
      { q: "The Belleville Three are credited with the foundation of", options: ["Chicago house", "Detroit techno", "UK garage", "Trance"], answer: 1, explain: "Juan Atkins, Derrick May and Kevin Saunderson, all from Belleville, Michigan, defined Detroit techno in the early '80s.", hint: "Detroit, three teenagers, futurist sound." },
      { q: "Why does scene literacy matter for getting booked?", options: ["It doesn't", "Promoters book DJs who fit a scene's identity; knowing the lineage means you can program sets that feel native to a room", "It only matters for older DJs", "Promoters only check social numbers"], answer: 1, explain: "Beyond stats, promoters want DJs whose taste fits the room. Lineage knowledge shows in selection.", hint: "What gets you the second booking, not the first." },
    ],
  },

  "genre-bpm-reference": {
    hook: "BPM is a starting filter. Two tracks at the same BPM can be unmixable if they're from different worlds.",
    beginner: {
      what: [
        "Different styles of dance music live at different tempos. Knowing the rough BPM range of each genre lets you plan a set, find compatible tracks, and decide when to gear-shift the energy.",
        "Rough reference: Hip-hop / RnB 70–100, Reggae / Dub 80–100, House (most flavours) 118–128, Techno 125–140, Disco 110–125, Drum & Bass 160–180, UK Garage 130–140, Trance 130–145, Dubstep 138–150 (often felt at 75 half-time), Hardcore 150–180+.",
        "Within a genre, sub-styles cluster around specific BPMs — Deep house ≈122, Tech house ≈124–127, Peak-time techno 130–138, Liquid DnB 170–175, Footwork 160.",
      ],
      why: [
        "Mixing a 124 BPM track into a 128 BPM track is easy. 124 into 138 is a gear change you have to plan for.",
        "Knowing the genre's pocket means you can prep playlists by BPM bucket, then by key and energy.",
        "Helps you predict the crowd's mood — a 140 BPM crowd is in a different physical state than a 122 BPM one.",
      ],
      analogy:
        "Like cycling — there's a comfortable gear for each terrain. You can shift, but you do it on purpose, not by accident.",
    },
    advanced: {
      what: [
        "Most DJ pitch ranges are ±6%, ±10% or ±16% (selectable on CDJ-3000). At ±6% you can blend between tracks within ~7 BPM of each other before the pitch shift becomes audible on melodies and vocals.",
        "Master Tempo / Key Lock holds the perceived pitch constant while tempo changes — essential beyond ±3% if vocals are present. The algorithm introduces artefacts above ±8%, more obvious on sustained vocals than on percussion.",
        "Half-time / double-time mixes (e.g. 70 BPM hip-hop into 140 BPM dubstep at the same felt pulse) are valid genre bridges if the rhythm halves cleanly.",
      ],
      edgeCases: [
        "Many DnB tracks are written and detected at half-time (87 instead of 174). Plan your set tempo by 'felt' BPM, not detected.",
        "Footwork / juke at 160 has a 4/4 kick but a triplet feel — feels 'faster' than 160 due to rhythmic density.",
        "Old funk and disco have a wide tempo variance within a single track because they were recorded live — beatgrid carefully and use Dynamic mode.",
      ],
      engineerNotes: [
        "Build BPM-bracketed crates: e.g. 118–122, 122–126, 126–130, 130–134. Within each, sort by key and energy.",
        "When ramping tempo across a set, plan inflection points (e.g. +2 BPM every 25 minutes) rather than chasing per-track tempo bumps.",
      ],
    },
    flow: "Genre → BPM range → Pitch tolerance ±6% → Compatible neighbours → Key & energy filter → Slot in set",
    walkthrough: [
      { do: "In rekordbox, sort your collection by BPM ascending.", listen: "You'll see your library cluster around tempos that map to the genres you actually play." },
      { do: "Pick a target tempo (say 124) and select all tracks within ±4 BPM.", listen: "These are easy blends without needing key lock — your immediate-neighbour pool." },
      { do: "Engage Key Lock / Master Tempo on a deck and stretch a 124 track to 128.", listen: "Vocals stay in tune but you hear a slight 'shimmer' — that's the algorithm." },
      { do: "Try the same stretch with Key Lock off.", listen: "Now the pitch rises with tempo. Vocals sound chipmunked — clearly audible above +3%." },
      { do: "Find a 70 BPM hip-hop track and play it under a 140 BPM techno track (kicks on alternating beats).", listen: "If the rhythmic feel matches, that's a half-time bridge — useful for genre transitions." },
    ],
    listenFor: [
      "The 'sweet spot' of a track — most have a 2–4 BPM window where they sound best, not just where they were written.",
      "Half-time vs. double-time feel on detection — if your detected BPM seems wrong, halve or double it and check.",
      "Genre boundaries blur at the edges — 128 BPM is 'fast house' or 'slow techno' depending on production.",
    ],
    mistakes: [
      "Pitching tracks more than ±6% without Key Lock — vocals and melodic content become obviously processed.",
      "Programming a set entirely at one tempo — listenable, but it feels static after 45 minutes.",
      "Trusting auto-detected BPM on DnB / footwork / dubstep without verifying half/double.",
      "Mixing tracks across a 10+ BPM gap by aggressive pitch instead of using a half/double-time bridge.",
    ],
    proMoves: [
      "Memorise the BPM 'home' of the top 5 tracks per genre you play. You'll feel when a track is dragging or rushing instantly.",
      "Build a tempo arc for every set — opener at -4 BPM from peak, peak in the middle third, closer back down -6 BPM.",
      "Use half/double-time tricks to bridge into a genre change without breaking the rhythm.",
    ],
    quizHard: [
      { q: "Why is Master Tempo / Key Lock essential beyond ±3% pitch?", options: ["It isn't", "Pitch shift becomes audible on vocals and melodic content — Key Lock holds perceived pitch while tempo changes", "It only matters for techno", "It changes the BPM display"], answer: 1, explain: "Without Key Lock, ±5% is a ~80 cent pitch shift — clearly perceptible on vocals.", hint: "What does your ear tolerate without flagging?" },
      { q: "A 174 BPM DnB track detected at 87 BPM means", options: ["Bad audio file", "The detector locked onto the half-time pulse — kicks fall on beats 1 and 3, doubling the apparent beat interval", "Wrong file format", "Corrupted analysis"], answer: 1, explain: "DnB's strong snare on 3 reads as a downbeat, halving the perceived BPM. Use ×2 in rekordbox to correct.", hint: "Half-time feel fools the algorithm." },
      { q: "Half-time bridging means", options: ["Slowing the tempo by half mid-mix", "Playing a track at half the BPM of the other so each beat lands on every other beat of the faster track — used to bridge between tempo zones", "Using only the first half of each track", "Loop length set to half a bar"], answer: 1, explain: "70 BPM kicks every 2nd 140 BPM beat = same felt pulse. Useful for genre transitions across big tempo gaps.", hint: "Same pulse felt, different number printed." },
    ],
  },

  "your-first-mix": {
    hook: "Your first mix is two tracks, one fade. Get this right and every other technique is a refinement of it.",
    beginner: {
      what: [
        "A 'mix' between two tracks means: the first one is playing in the room; you start the second one secretly in your headphones; you make their beats line up; you fade the first one down while you fade the second one up; the room only ever hears continuous music.",
        "The simplest version uses just two faders. Track A is up, track B is at zero, you cue B in headphones, find a moment where their kicks line up, then over about 16 bars you raise B and lower A.",
        "Where you start track B matters a lot. Most dance tracks have a 16- or 32-bar intro of just drums — that's the safe runway to layer over the outgoing track's outro. Don't mix into a vocal section.",
      ],
      why: [
        "It's the foundation of everything: long blends, EQ swaps, cuts, effect transitions are all variations of this basic move.",
        "Practising it slowly first builds the muscle memory you need when the crowd is in front of you.",
        "Knowing where the safe intro/outro windows are means you can mix tracks you've never played before, just by reading the waveform.",
      ],
      analogy:
        "Like merging onto a motorway. You match speed in the slip road (cue), wait for the gap (intro), and slide in (fader ride). You don't slam the brakes mid-merge.",
    },
    advanced: {
      what: [
        "A standard 'long blend' is 16–32 bars on 4/4 dance music at 120–130 BPM (~30–60 seconds). The crossover happens on a phrase boundary, not arbitrarily.",
        "Three faders involved: outgoing channel fader (down), incoming channel fader (up), optional crossfader if you DJ in crossfader-centric style (mainly hip-hop/scratch). Most house/techno DJs leave the crossfader centred and use channel faders.",
        "Layered with EQ: as you bring track B in, you typically cut B's lows to prevent two-bass clash. Around the halfway point, you cut A's lows and let B's bass take over. By the end, A is fully out and B is full-range.",
      ],
      edgeCases: [
        "If A and B are in different keys (not Camelot-compatible), shorten the blend window so dissonance doesn't dwell.",
        "If B's intro has a melodic synth, watch for clashes with A's outro — cut B's mids until A is out.",
        "On 4-deck setups, the same blend logic applies but you can layer percussion from a third deck — same EQ discipline required.",
      ],
      engineerNotes: [
        "Practise the blend with the master fader DOWN until you can execute it without looking at the mixer. Then bring master up for the 'real' rehearsal.",
        "Record every practice blend. Listen back the next day — micro-drift and EQ misses you missed in the moment will be obvious.",
      ],
    },
    flow: "A playing → B cued + beatmatched → On phrase, fade B up + A down (16-32 bars) → EQ swap mids/lows → A out, B full",
    walkthrough: [
      { do: "Load two tracks of similar BPM (within 2) and similar genre/energy to Deck 1 and Deck 2.", listen: "Both waveforms now visible. Beat-grid the intro of each so you know where the first downbeat is." },
      { do: "Play Deck 1 to master. Set Deck 2 paused on its first downbeat. Cue Deck 2 in headphones.", listen: "Room hears A. You privately hear B silent (paused)." },
      { do: "Wait for a phrase boundary on A (count 8 bars from any obvious change like a snare roll). On the downbeat, press play on B.", listen: "B starts on a downbeat aligned with A's phrase. Their kicks should land together in your headphones." },
      { do: "Over the next 16 bars, raise B's channel fader gradually while lowering A's. Halfway through, cut A's bass EQ.", listen: "Room hears a continuous beat, B's drums emerging while A's bass leaves. No collision." },
      { do: "By the end of the 16 bars, A is at zero and you bring A's EQ back to centre (ready for the next reload). Release Cue on A.", listen: "Set continues on B. You've completed one blend cycle. Cue the next track on the now-free deck." },
    ],
    listenFor: [
      "The double-kick 'gallop' if your beatmatch drifts — pull your pitch fader by 0.1% to correct.",
      "Bass mud when both kicks/basslines play simultaneously — cut one channel's lows immediately.",
      "Vocal clash — if a vocal phrase is starting on B while A still has its hook, abandon the blend early or wait.",
      "The phrase boundaries in both tracks — they should line up or you'll feel a structural 'jolt'.",
    ],
    mistakes: [
      "Starting B in the middle of a busy section. Always start B from a clean intro point (hot cue A on the first drum-only downbeat).",
      "Doing the blend in fewer than 8 bars on long ambient tracks — feels rushed and abrupt.",
      "Forgetting to swap the bass — two basslines is the #1 cause of muddy mixes.",
      "Watching the screen for beatmatch confirmation instead of trusting your ears. The waveforms can look aligned and still sound off.",
    ],
    proMoves: [
      "Use hot cue A on every track for 'first drum downbeat after intro'. Now every blend starts the same way.",
      "Memorise the 16-bar / 32-bar structure of your top 50 tracks so you know where to land transitions without scrolling.",
      "Practise the EQ swap (bass A down, bass B up) as a single coordinated move — it should feel like one gesture, not two.",
      "Build a 'practice playlist' of 10 tracks at the same BPM. Drill the same blend until it's effortless.",
    ],
    quizHard: [
      { q: "Why is the bass EQ swap necessary during a blend?", options: ["It isn't", "Two simultaneous basslines cause phase issues and frequency masking — only one bass should be active at a time", "It saves CPU", "It changes the BPM"], answer: 1, explain: "Two 50 Hz kicks at slightly different phases sum unpredictably; the mix loses punch and gains mud.", hint: "Two basses = one too many." },
      { q: "Where do experienced DJs almost always start a blend?", options: ["Wherever feels right", "On a phrase boundary — typically every 8 or 16 bars in dance music", "On a snare", "On a bar boundary"], answer: 1, explain: "Crowds feel phrase structure. Mid-phrase blends sound like a glitch.", hint: "Structure not random." },
      { q: "If a vocal phrase starts on the incoming track during your blend, you should", options: ["Continue and ride it out", "Either abandon the blend, accelerate it, or cut the incoming mids until the vocal moment passes", "Stop the outgoing immediately", "Cut all EQ on the outgoing"], answer: 1, explain: "Vocal clashes are the most noticeable mistake. Avoid, accelerate, or duck around them.", hint: "Vocals are the most exposed element." },
    ],
    sources: [
      { label: "rekordbox 6 Operating Manual", section: "Hot cues, beatgrid, blending workflow" },
      { label: "Pioneer DJM-A9 Operating Instructions", section: "Channel fader & EQ" },
    ],
  },

  // ============================================================
  // PATH 2 — LIBRARY & REKORDBOX
  // ============================================================
  "music-library-dj": {
    hook: "Your library is your voice. A thousand tracks you know cold beats ten thousand you half-recognise.",
    beginner: {
      what: [
        "Your music library is the collection of every track you own and could play in a set. It's not just files — it's a curated, organised, named set of tools that you know well enough to recall at 2 a.m. under pressure.",
        "Quality matters: WAV or AIFF (uncompressed) sound best on a club PA. 320 kbps MP3 is acceptable. Anything below 256 kbps is audibly worse on a big system — and the crowd notices, even if they can't say why.",
        "Where you buy matters: Beatport, Bandcamp, Juno Download, Traxsource, and label websites all sell DJ-friendly high-quality files with proper metadata. YouTube rips and streaming captures are low quality and usually unlicensed.",
      ],
      why: [
        "On a club system, low-bitrate compression artefacts (cymbal smear, swimming hi-hats) are obvious in a way they aren't on laptop speakers.",
        "A library you actually know — by ear, by feel — lets you respond to a crowd in seconds rather than scrolling for minutes.",
        "Buying from specialist stores supports the artists making the music you play. The scene shrinks when no one buys.",
      ],
      analogy:
        "A library is a chef's pantry. Stocked, organised, and known by heart. Nobody wants to read every label during dinner service.",
    },
    advanced: {
      what: [
        "Audio quality budget: WAV/AIFF (1411 kbps PCM) > FLAC (lossless ~700-1000 kbps) > 320 kbps MP3 / 256 kbps AAC > anything below. The lossy floor for club use is 256 kbps. Pro DJs avoid going lower.",
        "Tagging discipline: artist, title, BPM, key, year, genre, label, and a personal 'energy' or 'role' tag. Inconsistent tags = an un-searchable library. Use Mp3Tag, Picard or rekordbox's own tag editor consistently.",
        "Backup strategy: 3-2-1 rule — at least 3 copies, on 2 different media types, with 1 off-site (cloud or different physical location). Hard drives fail; SSDs fail less, but USB sticks are the most common loss vector.",
      ],
      edgeCases: [
        "Beatport WAV files are sold without ID3 tags in some cases — you must apply tags manually before importing to rekordbox, or your library becomes search-hostile.",
        "DRM-protected files (some streaming services) cannot be exported to a CDJ USB. Only owned (purchased, unencrypted) files work in Export Mode.",
        "FLAC support on CDJs: CDJ-3000 and CDJ-2000NXS2 (firmware >=1.50) support FLAC; older CDJs do not. Always check the venue's firmware before relying on FLAC.",
      ],
      engineerNotes: [
        "Re-encoding from lossy → lossy (e.g. 256 kbps MP3 → 320 kbps MP3) does not improve quality; it adds artefacts. Always start from the highest-quality source you own.",
        "Sample rate: 44.1 kHz is the dance-music standard; 48 kHz is fine but pointless conversion overhead. Don't upsample.",
      ],
    },
    flow: "Buy from store → Tag properly → Import to rekordbox → Analyse → Organise into playlists → Sync to USB × 2 → Backup off-site",
    walkthrough: [
      { do: "Pick one purchased track in your library. Right-click → Open in Finder/Explorer.", listen: "Note the file format and bitrate. If it's <256 kbps MP3, consider re-buying as WAV from a specialist store." },
      { do: "Open rekordbox Preferences → View → Columns. Enable Bitrate, Sample Rate, File Type.", listen: "Now your Collection view shows the quality of every track at a glance — sort by bitrate and audit the low end." },
      { do: "Find your 5 lowest-quality tracks. Decide: re-buy, keep with a 'low-quality' tag, or delete.", listen: "Library hygiene starts at the bottom of the bitrate column." },
      { do: "Set up a tagging template (artist - title) using your tag editor of choice. Apply to any inconsistently named files.", listen: "Search now works the way you expect — by partial title, partial artist, partial label." },
      { do: "Plug in a second USB stick. Use rekordbox Sync Manager (Cloud or LAN) to mirror your library and playlists.", listen: "Now you have two synced copies. Lose one mid-set, swap in the other — no missed downbeat." },
    ],
    listenFor: [
      "Cymbal smear / 'swimming' high frequencies on low-bitrate MP3s — the easiest cue to a bad source.",
      "Pre-echo on transients (sharp kick attacks) — another lossy-compression giveaway.",
      "Inconsistent volume across the library — different masters from different eras. Don't 'fix' with normalisation; gain-stage per track in the moment.",
    ],
    mistakes: [
      "Treating quantity as a feature. 50,000 tracks you can't recall is worse than 500 you know cold.",
      "Hoarding low-quality files 'just in case'. They reduce trust in your library.",
      "Skipping the tag step on import. The cost compounds across thousands of tracks.",
      "One backup, one USB, one laptop. The first failure deletes years of work.",
    ],
    proMoves: [
      "Audit your library quarterly: delete or upgrade anything you'd be embarrassed to play.",
      "Tag every track with personal metadata the moment you import — energy level, role, scene/year heard, vibe.",
      "Buy on Bandcamp Friday — artists get 100% on those days, and the metadata is usually clean.",
      "Keep a 'graveyard' folder of tracks you used to love but have outgrown. Don't delete; archive. Tastes loop.",
    ],
    quizHard: [
      { q: "Why does low-bitrate MP3 sound worse on a club PA than on laptop speakers?", options: ["It doesn't", "Compression artefacts cluster in upper midrange and treble — frequencies that a club system reproduces accurately and at high SPL", "Club PAs add distortion to MP3", "Laptops hide artefacts with EQ"], answer: 1, explain: "Lossy compression sacrifices high-frequency detail. Laptop speakers can't reproduce those frequencies anyway, so the loss is hidden. A club rig exposes it.", hint: "Where do compression artefacts live, and what reveals them?" },
      { q: "The 3-2-1 backup rule is", options: ["3 hard drives at home", "3 copies, 2 media types, 1 off-site", "3 USBs in your bag", "3 cloud services"], answer: 1, explain: "Industry-standard backup discipline. Survives drive failure, theft, fire, and ransomware.", hint: "Three numbers, three layers of safety." },
      { q: "Why is re-encoding from 256 kbps MP3 to 320 kbps MP3 pointless?", options: ["It is, in fact, an improvement", "Lossy encoding throws data away that no later step can recover — re-encoding adds new artefacts on top of old ones", "320 kbps is identical to 256 kbps", "It corrupts the file"], answer: 1, explain: "Once data is gone, it's gone. Higher bitrate just stores the lossy result in a bigger file with extra generation loss.", hint: "Can you un-shred paper by photocopying the shreds at higher resolution?" },
    ],
    sources: [
      { label: "rekordbox 6 Operating Manual", section: "Importing and managing your collection" },
      { label: "Audio Engineering Society", section: "Perceptual audio coding (lossy formats)" },
    ],
  },

  "bpm-analysis-dj": {
    hook: "BPM is the first number rekordbox prints, and the most often wrong on tracks that don't behave.",
    beginner: {
      what: [
        "BPM (Beats Per Minute) is how many beats happen in one minute. House at 124 BPM = 124 kick drums per minute. Tempo is the heartbeat of every dance track.",
        "When you drop a track into rekordbox, it scans the waveform looking for repeating low-frequency hits (kicks) and times them. The result becomes the track's BPM and a 'beatgrid' — a visual overlay showing where every beat is supposed to land.",
        "Most of the time the auto-analysis is right. But it can be wrong on tracks with: unusual time signatures, half-time/double-time feel, slow intros that confuse the algorithm, or live recordings where the tempo drifts.",
      ],
      why: [
        "Sync, key lock, beat jumps, loops and quantised effects all read the beatgrid. Wrong grid = wrong sync = audible chaos.",
        "Knowing where the grid lies lets you trust hot cues and beat-quantised loops without testing every drop live.",
        "Spotting a wrong grid in 5 seconds (zoom in, look at a downbeat at 2:00) saves you a public mistake.",
      ],
      analogy:
        "A beatgrid is the staff lines on sheet music. The notes can be perfect, but if the lines are crooked the whole reading is off.",
    },
    advanced: {
      what: [
        "rekordbox's analysis engine uses transient detection — short low-frequency energy bursts treated as candidate kicks — then a tempo-locking algorithm that picks the most likely steady pulse and projects a grid from an anchor point.",
        "Static beatgrid mode assumes constant tempo: one anchor + one BPM, grid extrapolated mathematically. Dynamic mode allows tempo curves (multiple BPM zones) — necessary for live recordings, mixes, edits with built-in tempo changes.",
        "Manual correction tools: the Edit Beatgrid panel offers anchor placement, ½× / 2× BPM toggles, fine-tune nudges (±0.01 BPM), shift entire grid left/right by sub-beats, and grid-splitting for tracks with multiple tempo zones.",
      ],
      edgeCases: [
        "Drum & bass tracks (174 BPM) very often detect at 87 BPM half-time. Trance and uptempo tracks (>140) sometimes detect at half. Always sanity-check tempo against genre expectation.",
        "Tracks with no kick in the intro (ambient builds, vocal-only openings) can have their anchor placed on the wrong beat — fix the anchor at the first clear downbeat of the drop.",
        "Imported edits (white labels, bootlegs, your own mash-ups) may have offset bar phases relative to the original — the grid can be on-beat but mis-aligned to the bar.",
        "Variable speed recordings (live techno from a vinyl pressing, old funk) need Dynamic mode and multiple anchors; Static will drift visibly by track end.",
      ],
      engineerNotes: [
        "Always zoom in and inspect the beatgrid at three points: intro (0:30), middle (2:00), and end (4:00+). Drift shows up at the end of long tracks.",
        "After grid editing, save the analysis to the file (rekordbox writes back to the database). Re-export to USB to propagate.",
      ],
    },
    flow: "Import → Auto-analyse (transients → BPM → grid) → Zoom-check grid at 3 points → Fix anchor / x2 / dynamic mode if needed → Save → Export",
    walkthrough: [
      { do: "Import a drum & bass track to rekordbox. Note the detected BPM.", listen: "If it shows ~85-90 BPM, the analyser locked half-time. Click ×2 in the Edit Beatgrid panel — now it reads ~170-180." },
      { do: "Open any track and zoom the waveform to 1-bar view in rekordbox.", listen: "You see the beatgrid as vertical lines. Check that each line lands on a kick transient — that's a healthy grid." },
      { do: "Jump to 3:30 in a 5-minute track and zoom in.", listen: "If the grid lines now sit slightly *before* or *after* the kicks, your grid has drifted — set Dynamic mode and add an anchor at the new tempo zone." },
      { do: "Use the 'Adjust' arrows to nudge the entire grid left or right by sub-beats.", listen: "When the grid sits right on the kicks throughout, you're done. Set hot cues only after grid is locked." },
      { do: "Find a track with a free-form intro (no kick for 30+ seconds). Set the anchor at the first solid downbeat of the drop, not the silent intro.", listen: "Grid extends correctly forwards and backwards from the anchor." },
    ],
    listenFor: [
      "'Gallop' (uneven kick spacing) when you sync to a track — almost always grid drift, not pitch.",
      "Beats arriving before or after the visual grid line — the eye is faster than the ear here.",
      "Hot cues landing slightly off the downbeat after auto-analysis — symptom of a misplaced anchor.",
    ],
    mistakes: [
      "Trusting the auto-grid for sync without zoom-checking at the track's end.",
      "Fixing a drifted grid by adding more anchors when the real fix is switching to Dynamic mode.",
      "Setting hot cues before the grid is correct — you'll re-do every cue when you fix the grid later.",
      "Leaving DnB tracks at half-detected BPM and then 'syncing' them — your software will think they're a different tempo than they sound.",
    ],
    proMoves: [
      "Batch-import new tracks once a week and audit grids the same day — never enter a gig with un-audited tracks.",
      "Keep a 'grid-corrected' tag in My Tags. Filter to find tracks you've verified vs. raw imports.",
      "Set Preferences → Analysis → Mode = Normal for most music; switch to Dynamic temporarily for live recordings and re-analyse those individually.",
    ],
    quizHard: [
      { q: "Static vs. Dynamic beatgrid: which is correct for a live techno recording with subtle tempo drift?", options: ["Static — simpler", "Dynamic — allows multiple anchors and tempo zones to follow the drift", "Doesn't matter", "Neither — disable analysis"], answer: 1, explain: "Live recordings drift. Static assumes constant tempo; Dynamic supports tempo curves. Use Dynamic, place anchors at drift points.", hint: "Curving tempo needs a curving grid." },
      { q: "Why must hot cues be set *after* grid correction?", options: ["They mustn't — set them first", "Cues store absolute positions in the track — if you change the grid, cue positions can drift relative to musical events", "Cues only work with Static grids", "Cues store the grid offset"], answer: 1, explain: "Cues are positions in time. If you re-anchor the grid, the cues stay at the same time but may no longer fall on the musical downbeat they were placed on.", hint: "Cues are absolute; downbeats are relative to the grid." },
      { q: "Half-time detection (174 BPM read as 87) happens because", options: ["The file is corrupted", "The algorithm picked a strong but slower pulse rate — typically the snare-on-3 in DnB looks like a downbeat", "The track is in 6/8", "Software bug"], answer: 1, explain: "Auto-tempo prefers the strongest periodic event. DnB's heavy snare reads as a beat 1, halving the perceived tempo.", hint: "What looks like a beat 1 to a machine?" },
    ],
    sources: [{ label: "rekordbox 6 Operating Manual", section: "Beat analysis & grid editing" }],
  },

  "key-detection-dj": {
    hook: "Two tracks in compatible keys blend; two in clashing keys fight. Key detection turns guesswork into a filter.",
    beginner: {
      what: [
        "Every melodic piece of music has a 'key' — the home note its melody and chords are built around. C major, A minor, F# minor: these are keys.",
        "rekordbox analyses each track and labels its key, usually shown in two forms: musical (Am, Cmaj, F#m) and Camelot (8A, 8B, 11A). Camelot is a cheat code — adjacent numbers and same-numbers across A/B are harmonically compatible.",
        "Harmonic mixing means picking your next track so its key plays nicely with the current one. Same number (8A↔8B) = relative major/minor, very close. Adjacent number same letter (8A→9A or 7A) = up or down a fifth, classic safe move.",
      ],
      why: [
        "Mixing clashing keys creates dissonance during the blend window — the moment two melodies overlap sounds 'wrong' in a way crowds feel even if they can't name it.",
        "Harmonic mixing lets you blend for longer (32 bars instead of 8) without melodic clash, opening up sophisticated transitions.",
        "Moving up the Camelot wheel one step (8A→9A) is the classic 'energy lift' — same harmonic relationship, slightly higher emotional intensity.",
      ],
      analogy:
        "The Camelot wheel is a colour wheel for keys. Neighbours blend smoothly; opposites clash. You can break the rule for effect, but only on purpose.",
    },
    advanced: {
      what: [
        "Pitch class detection algorithms estimate the dominant tonal centre by analysing the spectral content over time — typically harmonic pitch class profiles (chromagrams) fed into a key-templating step.",
        "Camelot notation maps the 24 major/minor keys onto a 12-hour wheel. A = minor (inside), B = major (outside). Same number = relative key pair. ±1 step = perfect fifth relationship. +1 step is 'energy boost' (same key, modal brightness).",
        "Compatibility rules (most→least compatible): same key (8A↔8A) > relative major/minor (8A↔8B) > adjacent fifth (8A↔7A or 9A) > parallel major/minor (Am↔A maj, 8A↔3B) > 'mood shift' across the wheel for dramatic effect.",
      ],
      edgeCases: [
        "Detection fails on heavily atonal or noise-based tracks (some hardcore, harsh techno, industrial). Trust your ear and override.",
        "Vocal samples chopped and resampled in modern dance music can sit in a different key from the underlying chord pads — the algorithm picks one and the other may clash.",
        "Tracks with modulations (key changes mid-track) only get one key tag. Note the modulation in a personal tag if you mix during the second key.",
        "Master Tempo pitch-shift moves the key — pitching a track +3% raises perceived pitch by ~52 cents (half a semitone is 100 cents). Camelot label is wrong post-pitch unless you compensate.",
      ],
      engineerNotes: [
        "Mixed In Key (third-party) is a more accurate detector than rekordbox's built-in for many catalogues — many pros analyse there first and import the result.",
        "Some DJs use 'open key' notation (1d, 2d, 1m, 2m) instead of Camelot — same wheel, different labels. Pick one and stay consistent across your library.",
      ],
    },
    flow: "Track in → Chromagram analysis → Key template match → Camelot label → You filter library by compatible Camelot neighbours → Plan transitions",
    walkthrough: [
      { do: "Open rekordbox preferences → Display → Key format → set to Camelot.", listen: "All tracks now show numeric labels like 8A or 11B in the Key column." },
      { do: "Pick any track. Note its Camelot key — say 8A.", listen: "8A means A minor. Same number means a relative major/minor pair; adjacent means fifth-related." },
      { do: "Filter your collection by key 8A, 8B, 7A, and 9A.", listen: "These are your most compatible neighbours for that starting track. The result is your transition pool." },
      { do: "Play the 8A track. Cue an 8B (relative major) track and blend.", listen: "Notice how the second track feels brighter but never clashes — they share the same notes, just centre on different ones." },
      { do: "Now try blending 8A into 2A (a far point on the wheel).", listen: "You hear the clash — minor 2nd interval. Sometimes this is the artistic move; usually it's an accident to avoid." },
    ],
    listenFor: [
      "Dissonant overlap during a blend — the most common cause is key mismatch, not bad EQ.",
      "Modulations within a single track — common in trance, drum & bass, soulful house. The Camelot label only describes the opening section.",
      "Whether the bass note clashes with the next track's bass note — that's the most exposed clash, even if upper melodies are fine.",
    ],
    mistakes: [
      "Treating Camelot as gospel and never breaking the rule. Mood shifts and dramatic key clashes are part of the art.",
      "Pitching tracks more than ±3% without re-checking the effective key. A 124→128 BPM stretch with Key Lock off changes the key.",
      "Ignoring the detection on melodic tracks while trusting it on busy tracks. The reverse is usually true.",
      "Blending two vocal tracks in clashing keys. Vocals expose key clashes the most.",
    ],
    proMoves: [
      "When you find two tracks in compatible keys that go well, save them as a 'transition pair' in My Tags — you've found a free move for a future set.",
      "Use key shifts (pitch +/- semitones on CDJ-3000) to bring a near-compatible track into compatible range — costs CPU but expands options.",
      "Build your set's key arc, not just BPM arc — sets that hit 5 keys in 10 tracks feel busy; sets that hold 2-3 keys feel coherent.",
    ],
    quizHard: [
      { q: "Why does pitching a track +6% with Key Lock OFF change the Camelot key?", options: ["It doesn't", "Tempo shift shifts pitch by the same ratio — 6% ≈ 1 semitone, moving the key", "Camelot labels are time-based", "rekordbox auto-updates labels"], answer: 1, explain: "Without Key Lock, tempo and pitch move together. 6% ≈ 100 cents ≈ one semitone, so the key shifts by one semitone (e.g. A minor → A# minor = 8A → 3A).", hint: "Pitch and tempo without Key Lock are the same dial." },
      { q: "Adjacent same-letter Camelot positions (e.g. 8A and 9A) are related by what musical interval?", options: ["Major third", "Perfect fifth", "Octave", "Tritone"], answer: 1, explain: "The Camelot wheel is arranged by fifths. 8A=Am, 9A=Em — a perfect fifth apart, harmonically very close.", hint: "Why is the wheel a circle of...?" },
      { q: "Vocal-on-vocal blends are more exposed to key clash because", options: ["Vocals are always louder", "Voice has a clear melodic line and the brain picks pitch clashes in melodic content faster than in percussive content", "Vocals always have wider frequency range", "Vocals are usually doubled"], answer: 1, explain: "Pitched melodic content (especially the human voice) makes key clashes immediately audible. Drums and texture mask key.", hint: "What does the brain hear pitch in most?" },
    ],
    sources: [{ label: "rekordbox 6 Operating Manual", section: "Key analysis & display formats" }],
  },

  "my-tags-dj": {
    hook: "My Tags turn a library into a searchable instrument. Filter by 'peak time + 8A + builder' in two clicks.",
    beginner: {
      what: [
        "My Tags are coloured labels you stick on tracks. You can create your own categories — Peak Hour, Warm Up, Closing, Vocal, Instrumental, Tool, Classic, New — and apply as many as you want to each track.",
        "Once tagged, you can filter your library in real time during a set. Need a peak-hour driving track? Filter by 'Peak Hour' and 'Tool' — your library shrinks from 5000 to 50 in one click.",
        "Tags survive export to USB, so they work on CDJ-3000 and CDJ-2000NXS2 just like in rekordbox. You filter on the deck the same way you filter on your laptop.",
      ],
      why: [
        "Searching by artist/title at 2 a.m. is slow. Searching by mood and role is fast and matches how DJs actually think.",
        "Tags let you re-purpose the same track across multiple roles. A track can be both 'Vocal' and 'Closing' and 'Classic'.",
        "On CDJs, the tag filter is one button press away. You can refine selection without losing the current track's view.",
      ],
      analogy:
        "Tags are like Spotify's mood playlists, except you control the moods and the same song can sit in 6 of them at once.",
    },
    advanced: {
      what: [
        "rekordbox supports up to 8 My Tag categories with up to 8 sub-tags each (configurable in My Tag settings). Common pro setups: Mood (Dark, Bright, Driving), Role (Opener, Builder, Peak, Closer), Vocal (Full, Hook, Instrumental), Energy (1-5).",
        "The CDJ-3000 'Mixer Tags' page lets you filter the deck's browse window by any combination of active tags — including AND/OR logic in firmware ≥1.30.",
        "Tags export to USB as part of the rekordbox database. Lost tags after export usually mean a Sync Manager mismatch or a USB exported from a different machine.",
      ],
      edgeCases: [
        "My Tags do not transfer to other DJ software (Serato, Traktor). If you cross-platform DJ, mirror your tags into the Comments field or use a tag-export script.",
        "Tag names with non-ASCII characters can render oddly on older CDJ firmware. Keep tag names short and ASCII.",
        "Bulk-tagging (multi-select → apply tag) works in rekordbox but not on CDJs — plan tagging at home.",
      ],
      engineerNotes: [
        "Use the Comment field for free-form notes (e.g. 'mixes well into X', 'first drop at 1:12') that aren't filterable but are visible on the deck.",
        "Tag taxonomy matters more than tag quantity. 4 well-defined categories beats 12 overlapping ones.",
      ],
    },
    flow: "Define category schema → Tag tracks at import → Sync to USB → Live: filter by tag combination → Find next track in seconds",
    walkthrough: [
      { do: "Open rekordbox → Preferences → My Tag → set up categories: Mood, Role, Energy, Vocal.", listen: "Save. Categories now appear in the lower panel under any track view." },
      { do: "Pick 20 tracks you know well. For each, apply 1-3 tags.", listen: "Don't over-tag — 2-3 tags per track is plenty. More than 5 dilutes the signal." },
      { do: "Switch to the My Tag view (View menu).", listen: "Tracks now sortable and filterable by your categories. Click 'Peak Hour' — only those tracks appear." },
      { do: "Combine filters: click 'Peak Hour' + '8A'.", listen: "Library shrinks to peak-hour tracks in 8A — your transition pool for one specific moment." },
      { do: "Export to USB. Plug into a CDJ-3000. Press My Tag filter on the deck.", listen: "Same filtering on the deck as in rekordbox. Find tracks under pressure without scrolling." },
    ],
    listenFor: [
      "Whether your tags actually describe how you think about music. If you never filter by 'Genre = Tech House' but always by 'Mood = Dark', drop the genre tag.",
      "Tracks that don't fit any tag — usually they're library bloat you should delete or you need a new tag.",
    ],
    mistakes: [
      "Creating 30 tags. You'll abandon the system within a month. 4-8 well-defined tags max.",
      "Tagging by genre when you already have a genre column. Tags should describe role/mood/use, not file metadata.",
      "Tagging in batch with no listening. Use the cue point view to skim each track for 15 seconds before tagging.",
      "Skipping the tag workflow until 'later'. Later is during a set, and it's too late.",
    ],
    proMoves: [
      "Use a 1-5 energy tag on every track. It becomes your most-used filter.",
      "Create a 'tested live' tag — only tracks you've played out and validated. Filtering by this is your trust-list.",
      "Re-audit tags every 6 months. Tags that you never use should die.",
    ],
    quizHard: [
      { q: "Why is a 4-tag taxonomy usually better than a 12-tag one?", options: ["It isn't — more is always more", "Cognitive load — you can hold 4 categories in active memory under stress; 12 is unusable mid-set", "rekordbox limits to 4", "CDJs only display 4"], answer: 1, explain: "Tag systems exist to be used live. Anything you can't recall and apply in seconds is dead weight.", hint: "How many things can you juggle at 2 a.m.?" },
      { q: "My Tags survive export to a USB stick on", options: ["No CDJ", "All CDJ models", "CDJ-3000 and CDJ-2000NXS2 (firmware-dependent for full filter UI)", "Only the laptop in Performance Mode"], answer: 2, explain: "Tags are stored in the rekordbox export database on the USB and read by compatible CDJs.", hint: "Newer Pioneer hardware reads the full export database." },
      { q: "Bulk-tagging in rekordbox works on", options: ["The laptop only — CDJs apply tags one at a time", "CDJs only", "Both", "Neither"], answer: 0, explain: "Multi-select → apply tag is a rekordbox-only workflow. Do tagging at home; use tagged libraries live.", hint: "Live decks aren't tagging stations." },
    ],
    sources: [{ label: "rekordbox 6 Operating Manual", section: "My Tag configuration & filtering" }],
  },

  "playlists-dj": {
    hook: "Crates beat folders. A good playlist is a question your future self will ask you live.",
    beginner: {
      what: [
        "A playlist (or 'crate') is a saved list of tracks grouped by anything you choose — genre, BPM range, vibe, gig, set position. They don't move files; they're just lists pointing at tracks in your collection.",
        "Smart playlists are dynamic — set rules like 'BPM 122-128 AND Energy 3-5 AND Key = 8A' and the playlist auto-fills with matching tracks as your library grows.",
        "Folder structure beats giant flat lists. A typical pro DJ has folders like: Genres → House → Tech House, Energy → Peak/Build/Close, Sets → 2025-11-22 Warehouse, Tools → Acapellas/Loops.",
      ],
      why: [
        "Live, you don't have time to scroll 5000 tracks. You navigate playlists, not files.",
        "Smart playlists do the curation work for you — when you import 50 new tracks, the relevant ones automatically appear in your peak-time crate.",
        "Set playlists (one per gig) become a record of what you played — invaluable for studying your own decisions later.",
      ],
      analogy:
        "Crates in a vinyl bag. Physical DJs carry 3-5 crates to a gig; digital DJs do the same with playlists.",
    },
    advanced: {
      what: [
        "rekordbox supports nested folders to arbitrary depth and smart playlists with multi-criteria rules (AND/OR logic, range comparisons, tag inclusion/exclusion).",
        "On CDJs, only the top 8 levels of folder nesting are practically navigable on the screen — keep your tree shallow.",
        "Intelligent Playlists (rekordbox term for smart playlists) update on import and on tag change — perfect for 'fresh ≤ 30 days' or 'energy ≥ 4 in 8A'.",
      ],
      edgeCases: [
        "Playlists do not store track order metadata that overrides analyser data. If you re-import a track or it loses its database link, it may drop out of playlists silently.",
        "Smart playlist rules can become slow on libraries >50,000 tracks — split into category folders if you see lag in the browser.",
        "Exporting a playlist to USB takes only the tracks in that playlist — useful for travelling light, dangerous if you forget a tool you need.",
      ],
      engineerNotes: [
        "Playlist hierarchy I recommend: 01_TONIGHT (set playlists for upcoming gigs) / 02_NEW (last 30 days, smart) / 03_GENRE / 04_ENERGY / 05_TOOLS / 99_ARCHIVE.",
        "Number prefixes (01_, 02_) force ordering. Without them, rekordbox sorts alphabetically and you lose mental priority cues.",
      ],
    },
    flow: "Import → Auto-categorise via smart playlist → Manual curation into gig playlist → Export gig playlist → Play",
    walkthrough: [
      { do: "Create a folder called '02_NEW' and inside it a smart playlist with rule: Date Added in last 30 days AND Genre = House.", listen: "It populates with anything fresh from a house import. No manual sorting." },
      { do: "Create '01_TONIGHT_<date>' folder with subfolders Opener / Builder / Peak / Closer.", listen: "Drag 15-20 tracks into each subfolder from your library. Now you have a 60-80 track set pool, structured by role." },
      { do: "Export only the 01_TONIGHT_ folder to a USB stick (right-click → Export to Device).", listen: "Stick is now small, focused, fast to navigate at the gig." },
      { do: "After the gig, in rekordbox, create '99_PLAYED_<date>' and drag the tracks you actually used from the gig folder.", listen: "You now have a record of every track you played — sortable, searchable, learnable from." },
      { do: "Smart playlist: rule 'My Tag includes Peak AND Key = 8A AND Played count < 3 in last 90 days'.", listen: "It surfaces strong peak tracks you haven't been over-playing — your idea-generator for the next set." },
    ],
    listenFor: [
      "Tracks that show up in every gig playlist — those are your signature sounds.",
      "Tracks that smart playlists suggest but you ignore — interrogate why; maybe re-rate or retire.",
    ],
    mistakes: [
      "Flat folder structures with 1000-track playlists. Unnavigable live.",
      "Deeply nested folders >5 levels. CDJ navigation becomes tedious.",
      "Never deleting playlists after gigs. Library becomes a junkyard.",
      "Relying only on smart playlists. Manual curation for the actual set matters.",
    ],
    proMoves: [
      "One folder per gig, deleted (or archived to 99_PLAYED_) after. Keeps the library current.",
      "Maintain a '00_GO_TO' folder — your 50 most-trusted tracks. The safety net for any gig.",
      "Use rekordbox Cloud Library Sync to keep the same playlists on every device.",
    ],
    quizHard: [
      { q: "Smart playlist with rule 'Genre = House AND BPM 122-128 AND Date Added > 30 days ago' will show", options: ["All house tracks", "Recently added house tracks in the 122-128 BPM range", "Old house tracks", "Tracks added more than 30 days ago"], answer: 3, explain: "Date Added > 30 days ago means added MORE than 30 days ago — older tracks. Reverse the operator for 'fresh'.", hint: "Read the operator literally." },
      { q: "Number prefixes (01_, 02_) on folders are useful because", options: ["They're required by rekordbox", "They force alphabetical sort order so your highest-priority folders appear at the top", "They denote BPM", "They're decorative"], answer: 1, explain: "Without prefixes, folders sort alphabetically — your most-used folder may end up at the bottom.", hint: "How does alphabetical sort treat numbers?" },
      { q: "Exporting only a gig folder to USB is useful but risky because", options: ["Risk-free", "You may forget to include a tool (acapella, FX loop, emergency track) that lives outside the folder", "USB will be too big", "Tracks get re-encoded"], answer: 1, explain: "Smaller exports are faster but only contain what you chose. Always include a Tools folder.", hint: "What does 'only export this folder' miss?" },
    ],
    sources: [{ label: "rekordbox 6 Operating Manual", section: "Playlists & smart playlists" }],
  },

  "crate-digging": {
    hook: "Crate digging is the slow, weekly habit that builds a library no algorithm can replicate.",
    beginner: {
      what: [
        "Crate digging means actively searching for music — going beyond the algorithm, beyond the chart, beyond what your friends play. Spending time on Bandcamp, Discogs, label sites, soundcloud, NTS, blogs and second-hand bins to find tracks that hit you personally.",
        "The discipline is regular: 1-2 hours a week, scanning new releases, deep catalogues, reissues, label compilations. Skim fast, save anything that grabs you, audition properly later.",
        "Half of what you save you'll never play. The other half is what gives your sets character no one else has.",
      ],
      why: [
        "Algorithms recommend what's like what you already liked. Digging finds what's outside that loop.",
        "DJs who only play current Beatport top-100 sound like every other DJ playing current Beatport top-100.",
        "The hours you spend digging build taste. Taste is the only thing that can't be copied.",
      ],
      analogy:
        "Like reading widely vs. only reading bestsellers. Both work; only one makes you interesting to talk to.",
    },
    advanced: {
      what: [
        "Discovery sources you should rotate through weekly: Bandcamp (label discover, follow artist), Discogs (artist discography, related releases, marketplace for vinyl), NTS Radio shows, Resident Advisor charts, Boiler Room recent sets, label Soundclouds, Bleep, Phonica/Hardwax/Juno staff picks.",
        "Mining tactics: pick one track you love → check the label's catalogue → check the artist's collaborations → check who remixed it → check what they remixed → 20 minutes later you've expanded your reach by 50 tracks.",
        "Re-issues, archive labels (Soundway, Strut, Music From Memory, Awesome Tapes From Africa) surface deep historical material. Modern DJs lean heavily on these for 'classic' moments.",
      ],
      edgeCases: [
        "Promo lists (label promo pools, artist direct lists) give early access but require relationships — start by buying everything from a label, then ask politely.",
        "Vinyl-only releases force a different workflow: rip to high-quality digital, set hot cues, tag carefully — you can't re-download these.",
        "Pre-release Beatport / Bandcamp drops are timed — being early on a hot track buys you 2-4 weeks before every other DJ plays it.",
      ],
      engineerNotes: [
        "Maintain a 'dig list' (a smart playlist or note) of artists/labels to check monthly. Discipline beats inspiration.",
        "Audition with intent — first 30 seconds is hook check, scan to the drop, scan to the breakdown. ~90 seconds per track when digging.",
      ],
    },
    walkthrough: [
      { do: "Pick one label you trust. Open their Bandcamp page → 'discography' → newest first.", listen: "Audition 30 seconds of every track on every release back ~6 months. Wishlist anything that hits." },
      { do: "Take a track you played last weekend. Search the artist on Discogs.", listen: "Discogs shows every release, every credit, every remix, every label they've worked with. Follow 3 threads outwards." },
      { do: "Open an NTS recent show from a host whose taste overlaps yours. Note 3 tracks from the tracklist.", listen: "Each unfamiliar track is a digging starting point — search the artist, the label, what came out around it." },
      { do: "Set a weekly calendar block: '90 minutes — dig'.", listen: "Without the calendar block, life eats the habit. With it, your library grows by 5-15 keepers a week." },
      { do: "On a 90-minute Bandcamp dig: buy 1-3 tracks, wishlist 5-10, ignore the rest.", listen: "Money concentrates attention. The tracks you buy are the tracks you'll know." },
    ],
    listenFor: [
      "Tracks that grab you in <15 seconds — those are usually the keepers.",
      "Production hallmarks of a label (mix character, drum textures) — they cluster.",
      "Tracks that sample older records — chains backwards through music history.",
    ],
    mistakes: [
      "Only digging when you 'need new music' — by then it's a stressed chore, not a habit.",
      "Hoarding tracks you'll never play. Discipline is also editing what you don't buy.",
      "Only following labels — also follow individual artists and DJs whose taste informs you.",
      "Treating Beatport top 100 as the universe. It's a slice.",
    ],
    proMoves: [
      "Follow 50 labels and 50 artists on Bandcamp — your weekly email is a custom newsletter no algorithm can match.",
      "Buy 1-3 records a week on Bandcamp Friday (artists keep 100% revenue).",
      "Maintain a 'dig journal' — date, source, tracks bought, why. Re-reading it teaches you about your own taste.",
      "Trade dig finds with one or two trusted DJ friends. Your blind spots are different.",
    ],
    quizHard: [
      { q: "Why is algorithmic recommendation weak for DJ digging?", options: ["It isn't", "Algorithms optimise for similarity to what you already played — they cannot surface things outside your past patterns", "Algorithms are biased against dance music", "Algorithms can't read BPM"], answer: 1, explain: "Recommenders are similarity engines. They surface variations on a theme, not break-out finds.", hint: "What does 'similar to' tell you about novelty?" },
      { q: "Pre-release drops on Bandcamp/Beatport are valuable for DJs because", options: ["They sound better", "They give you 2-4 weeks of exclusivity before peers play the same track", "They are cheaper", "They include stems"], answer: 1, explain: "Being first on a track that catches fire is one of the cheapest ways to differentiate a set.", hint: "Early access = scarcity = perceived value." },
      { q: "Discogs is most useful for", options: ["Streaming music", "Mapping artist discographies, label catalogues, collaborations and remix histories — and buying physical media", "Detecting BPM", "Hot cue management"], answer: 1, explain: "Discogs is a music database with marketplace bolted on. It excels at relational digging.", hint: "What's behind the marketplace?" },
    ],
  },

  "export-mode-dj": {
    hook: "Export mode is the bridge from your laptop to the CDJ. Get it right at home; the gig is just plugging in.",
    beginner: {
      what: [
        "Export Mode is rekordbox set up to send your music + database to a USB stick or SD card, which you then plug into a CDJ at the venue. No laptop needed at the gig.",
        "The CDJ reads the stick: your tracks, hot cues, beat grids, key, BPM, playlists, My Tags — all of it appears on the deck exactly as you set it up at home.",
        "Workflow: in rekordbox, switch to Export Mode (top-left menu), prepare playlists/cues, plug in USB, right-click → Export to Device, wait for copy, safely eject.",
      ],
      why: [
        "Most clubs you play will be CDJ-equipped. Knowing Export Mode means you walk in with a stick and play.",
        "No laptop on stage = no driver issues, no audio interface fiddling, no risk of a laptop crash mid-set.",
        "Your prep at home (cues, tags, playlists) survives perfectly to the deck. Live energy goes into mixing, not setup.",
      ],
      analogy:
        "Like cooking a meal at home, transferring it to a thermos, and serving it warm at the destination. All the work happened in the kitchen.",
    },
    advanced: {
      what: [
        "Export Mode writes a PIONEER folder to the USB containing: the audio files (copied or referenced), a SQLite-style database, image cache (waveforms), and per-track metadata (cues, grid, key, tags).",
        "File system: USB must be FAT32 (universal but 4 GB single-file limit) or exFAT (CDJ-3000 / 2000NXS2 firmware ≥ specific versions, supports >4 GB). HFS+, NTFS and APFS are NOT readable by most CDJs.",
        "Performance Mode (the other mode, used with controllers and the rekordbox audio interface) shares the same master library but routes audio through the laptop. Switching between Export and Performance is one menu click and doesn't disturb the library.",
      ],
      edgeCases: [
        "Pulling the USB without 'safely eject' can corrupt the PIONEER database. Symptom: CDJ shows 'No tracks' or hangs on the stick. Fix: re-export from rekordbox.",
        "Newly added tracks not appearing on the stick = you exported BEFORE adding them. Re-export or use rekordbox Cloud Library Sync.",
        "Two sticks exported at different times can drift in cue/grid positions if you continued editing. Use Sync Manager to keep them aligned.",
        "USB hardware quality matters — cheap or counterfeit USB 2.0 sticks can corrupt under repeated writes. Use SanDisk / Samsung / Kingston brands.",
      ],
      engineerNotes: [
        "Always carry TWO USB sticks, identical, exported moments apart. Murphy's law applies most violently at the start of a peak-time set.",
        "Test the stick in a CDJ (your own or a friend's) before every important gig. Catch problems at home, not at the venue.",
      ],
    },
    flow: "Prep in rekordbox → Switch to Export Mode → Insert USB → Right-click playlist → Export to Device → Safely eject → Pocket → Plug into CDJ",
    walkthrough: [
      { do: "Open rekordbox, top-left menu → switch to Export Mode if you're in Performance Mode.", listen: "UI changes slightly — Export Mode hides controller-specific panels and shows the export workflow." },
      { do: "Format a USB stick as exFAT (Disk Utility on Mac, Disk Management on Windows). Name it something memorable.", listen: "Stick is now compatible with modern CDJs and supports files >4 GB." },
      { do: "Insert the stick. In rekordbox, it appears in the left panel under 'Devices'. Right-click your gig folder → Export to Device → choose this stick.", listen: "Copy starts. Time depends on track count and stick speed — 100 tracks ≈ 2-5 minutes on a decent USB 3.0 stick." },
      { do: "When done, click the eject icon next to the device in rekordbox, then OS-level eject before pulling.", listen: "Stick is now safe to remove. Pulling without ejecting risks database corruption." },
      { do: "Plug into a CDJ-3000 (or borrow one). Press USB. Browse — your playlists, cues, tags should all appear.", listen: "If anything is missing, you found a problem at home, not at the venue." },
    ],
    listenFor: [
      "'No tracks' or 'database error' on the CDJ — almost always a corrupt PIONEER folder. Re-export.",
      "Cues missing on the deck but present in rekordbox — you exported before saving the cues. Save → re-export.",
      "Hot cue colours / names not appearing — older CDJ firmware. Update venue firmware if you can, accept basic display otherwise.",
    ],
    mistakes: [
      "Exporting on the day of the gig with 30 minutes to spare. Always export the day before; test the stick.",
      "Single USB stick. Lose it, drop it, snap it — gig over.",
      "Cheap USB sticks bought in bulk. The price of a corrupt PIONEER folder mid-set is much higher than a quality stick.",
      "Formatting the stick as MacOS Extended (HFS+). CDJs can't read it.",
    ],
    proMoves: [
      "Two identical USBs, kept in sync via rekordbox Sync Manager Cloud. Lose one, swap the second in instantly.",
      "Label sticks physically with reflective tape and your initials. Booth lights are dim.",
      "Keep one stick in your bag, one on your person (pocket). If the bag walks, you still have music.",
      "Test stick in a CDJ before EVERY gig. Habits prevent disasters.",
    ],
    quizHard: [
      { q: "Why does exFAT support >4 GB single files where FAT32 doesn't?", options: ["It doesn't", "FAT32's file size field is 32-bit signed (2 GB) → effectively 4 GB cap; exFAT uses 64-bit and supports vast files", "exFAT compresses files", "FAT32 only works on Windows"], answer: 1, explain: "FAT32 is a 1990s file system with a 4 GB single-file limit. exFAT was designed to remove that limit.", hint: "Numerical limits in old file systems." },
      { q: "Safely ejecting the USB matters because", options: ["It doesn't, modern systems handle it", "The PIONEER database may have pending writes cached by the OS; pulling early can leave the database in an inconsistent state", "Voltage spikes corrupt the stick", "It zeroes the index"], answer: 1, explain: "OS file caches buffer writes for speed. Eject flushes them. Pull early = half-written database.", hint: "Where do recent writes live before they hit the stick?" },
      { q: "Performance Mode and Export Mode share", options: ["Nothing", "The same master rekordbox library, cues, tags, playlists — just different audio routing and output", "Only the audio files", "Only the playlists"], answer: 1, explain: "One library, two routing modes. Switching is one click and non-destructive.", hint: "What does 'master library' mean?" },
    ],
    sources: [{ label: "rekordbox 6 Operating Manual", section: "Export Mode & device management" }],
  },

  "waveform-reading": {
    hook: "The waveform tells you the structure of a track in 3 seconds. Once you can read it, you can mix anything.",
    beginner: {
      what: [
        "The waveform is the visual shape of the audio — a graph of loudness over time. Tall = loud, short = quiet. Colour usually indicates frequency content (blue = bass, green = mid, red/yellow = highs in rekordbox's default).",
        "Most dance tracks have a recognisable shape: quiet intro, build, drop (tall colourful section), breakdown (shorter section), second drop, outro. Once you see the shape, you know where to mix in, when to mix out, and what's coming.",
        "rekordbox shows the waveform at two zooms: the 'overview' (whole track, top of the deck) and the 'zoomed' view (a few bars around the playhead). Use overview for structure, zoom for beatmatching.",
      ],
      why: [
        "Reading the waveform lets you mix tracks you've never heard, just from the visual shape.",
        "You spot drops and breakdowns coming and time your transitions to land on the right musical moment.",
        "Colour clues (blue = bass-heavy, red/yellow = high-frequency-heavy) help you predict EQ clashes before they happen.",
      ],
      analogy:
        "Like reading a topographic map. Once you know what hills and valleys mean, you can navigate territory you've never visited.",
    },
    advanced: {
      what: [
        "rekordbox 3-band waveform colouring decomposes the spectrum into low/mid/high energy bands and renders them as overlapping coloured layers — blue (lows ≤ ~200 Hz), green (mids ~200 Hz-2 kHz), red/yellow (highs ≥ ~2 kHz). The colour at any point tells you which band dominates.",
        "Structural shapes to recognise: tall solid block (full mix), tall thin spikes (drum-only section, often the drop or intro), thin solid horizontal (sustained bass / pad, often the breakdown), dense colour clusters (busy mid-frequency content, often the build).",
        "On CDJ-3000 the waveform supports phrase analysis overlays: coloured bars above the waveform marking intro / verse / chorus / outro phrases, computed by rekordbox.",
      ],
      edgeCases: [
        "Mastered loudness affects waveform height. A modern brick-wall-mastered track will look uniformly tall throughout; an older or dynamic track shows real variation. Don't confuse loudness mastering with structural energy.",
        "Hidden hi-hats and percussion (low amplitude but high frequency) show as faint red/yellow speckles — easy to miss but important for groove.",
        "Sub-only sections (bass drop, sub-only outro) read as flat blue rectangles with no spikes. They're loud on the meter but visually unimpressive.",
      ],
      engineerNotes: [
        "Calibrate your eye by reading the waveform while listening — within an hour you'll pattern-match structures without listening.",
        "The 30-second overview waveform plus phrase analysis is enough to plan a transition for a track you've never heard.",
      ],
    },
    flow: "Track loads → Eye scans overview → ID intro/drop/breakdown/outro → Pick transition window (intro or outro) → Beatmatch in zoom view → Execute",
    walkthrough: [
      { do: "Load a familiar track. Look at the full-track waveform (top of the deck).", listen: "Identify the intro (small left), drop (first tall section), breakdown (shorter middle), second drop, outro (small right)." },
      { do: "Load an unfamiliar track. Predict where the drops are from the shape alone, then press play.", listen: "Within 3 tracks you'll be right almost every time." },
      { do: "Look at the colour of each section. The breakdown should be more green/red (mids and highs, no kick); the drop should be a balanced mix of all three.", listen: "Colour patterns confirm structural reading." },
      { do: "Find a track with a sub-only outro (flat blue rectangle at the end).", listen: "It looks quiet but it's full of sub bass — a clean blend opportunity for a track with a tall intro." },
      { do: "Zoom into a transition window (e.g. last 32 bars). Count phrases (8-bar units).", listen: "Phrase boundaries are visible as small density changes in the waveform." },
    ],
    listenFor: [
      "Drum-only sections (intro/outro of dance tracks) — visible as a row of tall thin spikes with little colour fill.",
      "Vocal sections — often visible as long sustained mid-frequency content (green-heavy).",
      "Build-ups — visible as gradually rising amplitude over a section, often with red/yellow filter sweeps.",
    ],
    mistakes: [
      "Trusting the waveform over your ears. The waveform shows amplitude, not necessarily musical content.",
      "Confusing a brick-mastered modern track with constant energy. Listen for actual dynamic structure.",
      "Watching the waveform during a beatmatch instead of feeling the kick. Eye is for structure; ear is for timing.",
      "Ignoring colour — colour is half the information.",
    ],
    proMoves: [
      "Practice reading 5 unfamiliar tracks' waveforms a day. Predict structure before playing. You'll get to >90% accuracy in two weeks.",
      "Memorise the waveform shapes of your top 20 tracks. You'll navigate them on the deck without reading the title.",
      "Use phrase analysis overlays on CDJ-3000 to verify your structural reading — it's a free tutor.",
    ],
    quizHard: [
      { q: "A tall blue rectangle at the end of a waveform means", options: ["The track is clipped", "Sustained sub bass content — often a sub-only outro, great for blending under a high-content intro of the next track", "The file is corrupt", "No high frequencies at all"], answer: 1, explain: "Blue = low frequencies in the rekordbox colour scheme. Tall + sustained = lots of sub. Quiet-looking on meters of an untrained eye but actually loud in the lows.", hint: "Colour code says lows; shape says sustained." },
      { q: "Phrase analysis on CDJ-3000 helps you", options: ["Detect the key", "See computed song structure (intro/verse/chorus/outro/etc.) as overlay bars on the waveform", "Detect BPM", "Set hot cues automatically"], answer: 1, explain: "It's a structural overlay computed by rekordbox and read by the deck.", hint: "Structure visualisation, not pitch/tempo." },
      { q: "Why does a brick-wall-mastered modern track look uniformly tall throughout?", options: ["It's brighter", "Limiting/compression in mastering pushes the entire track to the same peak loudness, hiding structural dynamic variation", "It contains more bass", "Older waveform display issue"], answer: 1, explain: "Loud-as-possible mastering removes amplitude variation. The waveform looks flat even when the music has clear structural shifts.", hint: "What does brick-wall limiting do to peaks?" },
    ],
    sources: [{ label: "rekordbox 6 Operating Manual", section: "Waveform display & phrase analysis" }],
  },

  // ============================================================
  // PATH 3 — MIXING TECHNIQUE
  // ============================================================
  "beatmatching-manual": {
    hook: "Beatmatching by ear is the foundation. Sync is a shortcut; ears are the safety net.",
    beginner: {
      what: [
        "Beatmatching means making two tracks play at the exact same tempo and with their kick drums landing at the same instant.",
        "Two jobs: get the BPM equal (tempo fader), then nudge the second track so its kicks land on top of the first track's kicks (jog wheel).",
        "When it's right, you hear one steady beat. When it's wrong, you hear a gallop or a flam.",
      ],
      why: ["Sync can fail on bad grids — your ears can't.", "Manual beatmatching trains rhythm and trust in your hands.", "Every legendary DJ learned this first."],
      analogy: "Two people clapping the same rhythm. First match the speed, then the moment of the clap.",
    },
    advanced: {
      what: [
        "Beatmatching = matching BPM (tempo) and phase (where in the bar each beat falls). Tempo fader handles speed; jog wheel handles phase.",
        "Drift: even matched tracks drift over time on analog gear because crystals are imperfect. Listen and re-nudge every 16–32 bars.",
      ],
      edgeCases: [
        "Tracks with swung or shuffled drums confuse the ear — match the kick, ignore the hats.",
        "Tracks with no kick (ambient intros) — match the snare or the bassline instead.",
      ],
      engineerNotes: [
        "Pioneer jog wheels in VINYL mode = scratch; in CDJ mode = pitch bend. Pitch bend is what you want for beatmatching.",
        "Tempo fader resolution: ±6%, ±10%, ±16%, WIDE. Use ±6% for the finest control during practice.",
      ],
    },
    flow: "Match BPM → Sync phase with jog → Verify in cue → Bring fader up → Re-check every 16 bars",
    walkthrough: [
      { do: "Load a familiar track to Deck 1 and play it through the master.", listen: "Lock onto its kick drum mentally — that is your reference." },
      { do: "Load Deck 2, press play with headphones on Deck 2 only.", listen: "Hear both kicks at once — they'll be out of phase and probably different speeds." },
      { do: "Adjust Deck 2's tempo until the BPM numbers match, then listen — if it's galloping, the BPM is still off.", listen: "A steady 'thump-thump' means tempo is right; 'tha-thump tha-thump' means it's still off." },
      { do: "Nudge the jog wheel forward or back to align the kick onsets.", listen: "When they land together, the two kicks become one fatter kick — that's lock." },
      { do: "Bring channel 2 up over 8 bars; watch it drift after 32 and re-nudge.", listen: "If it drifts, the BPM wasn't perfect — fine-tune the tempo fader." },
    ],
    listenFor: ["Galloping = BPM mismatch", "Flamming = phase off by ~10–30 ms", "One fat kick = locked", "Slow drift = small BPM error"],
    mistakes: ["Adjusting tempo with the jog wheel — jog is for phase, fader is for speed.", "Trusting the BPM display alone. Numbers can round.", "Bringing the new fader up before it's locked. The room hears every wobble."],
    proMoves: ["Beatmatch with the screen off. Forces you to use ears.", "Practice with tracks whose BPMs differ by 4+ — bigger pitch changes train your ear faster.", "Record practice and listen for drift in the recording."],
    quizHard: [
      { q: "If two kicks 'gallop' at you, the problem is", options: ["Phase only", "Tempo (BPM) — the tracks are at different speeds", "EQ", "Volume"], answer: 1, explain: "Gallop = uneven spacing = different tempos drifting against each other.", hint: "Uneven spacing means uneven speed." },
      { q: "Jog wheel in CDJ mode does what during a mix?", options: ["Scratches the track", "Temporary pitch bend — speeds or slows the deck briefly to nudge phase", "Adjusts tempo permanently", "Triggers a loop"], answer: 1, explain: "Pitch bend mode nudges only while you push; release and tempo returns to fader setting.", hint: "Temporary nudge, not a permanent change." },
      { q: "Why use ±6% tempo range rather than ±16%?", options: ["±6% is louder", "Finer resolution per millimetre of fader travel = more precise BPM control", "It allows faster mixing", "It's required for SYNC"], answer: 1, explain: "Narrower range spreads the same fader length over fewer BPM = finer touch.", hint: "Same fader, smaller range, more precision." },
    ],
    sources: [{ label: "rekordbox 6 Operating Manual", section: "Tempo slider & jog mode" }],
  },

  "sync-function": {
    hook: "SYNC isn't cheating — it's a tool. Knowing when not to trust it is the skill.",
    beginner: {
      what: [
        "SYNC is a button that automatically matches the BPM and phase of one deck to another.",
        "Press it and the deck locks to the master deck's tempo and beat position instantly.",
        "It's reliable when beat grids are accurate. It's wrong when grids are wrong.",
      ],
      why: ["Frees your hands for EQ, effects, four-deck work.", "Lets beginners focus on track selection and energy.", "Standard in modern club DJing — using it is normal."],
      analogy: "Cruise control on a car. Great on a smooth highway, dangerous on a winding road. The road is your beat grid.",
    },
    advanced: {
      what: [
        "SYNC reads BPM and downbeat position from the analyzed grid. It corrects pitch and triggers a phase realignment.",
        "Beat Sync (rekordbox) vs Tempo Sync — Beat Sync aligns both tempo and downbeat; Tempo Sync only matches BPM, you align phase manually.",
      ],
      edgeCases: [
        "Tracks with tempo changes (live drums, rock, hip-hop) often have shifting grids — SYNC will drift mid-track.",
        "Bad downbeat placement causes SYNC to lock on beat 2 or 4 — track will be 'on the offbeat'.",
        "When two SYNC'd decks share the master role, switching master mid-mix can cause a tiny pitch jolt.",
      ],
      engineerNotes: [
        "Quantize mode + SYNC = perfectly aligned cue triggers. Without quantize, hot cues fire on the exact press moment.",
        "Master tempo (key-lock) should be ON when using large tempo shifts to avoid chipmunk pitch.",
      ],
    },
    flow: "Verify grid → Press SYNC → Confirm phase aurally → Use EQ/fader as normal → Disengage if grid drifts",
    walkthrough: [
      { do: "Load a track with a clean grid to Deck 1 and play it.", listen: "Steady tempo — no drift." },
      { do: "Load Deck 2 and press SYNC.", listen: "BPM display jumps to match Deck 1; tracks lock instantly." },
      { do: "Cue Deck 2 and listen alongside Deck 1.", listen: "Kicks land together — verify, don't assume." },
      { do: "Mid-blend, watch the grid markers — if they slip, the original analysis is bad.", listen: "Audible drift = grid problem, not SYNC failure." },
      { do: "If drift starts, disengage SYNC and finish manually with the jog wheel.", listen: "Manual control restored; crisis avoided." },
    ],
    listenFor: ["Snap-to alignment when SYNC engages", "Grid markers staying lined up over time", "Pitch jolt when master changes", "Drift = grid is wrong"],
    mistakes: ["Trusting SYNC on unanalysed or hastily-analysed tracks.", "Forgetting key-lock — high-tempo SYNC sounds like chipmunks.", "Never learning manual beatmatching as a fallback."],
    proMoves: ["Audit every SYNC track in advance — flag bad grids with My Tag 'GRID-BAD'.", "Use SYNC to free your left hand for EQ + FX; the value isn't avoiding work, it's redirecting it.", "Practice manual every week so SYNC failure never panics you."],
    quizHard: [
      { q: "SYNC drifts during a track. Most likely cause?", options: ["Software bug", "Beat grid was incorrectly analysed and slips against the audio over time", "Wrong cable", "Tempo fader broke"], answer: 1, explain: "SYNC follows the grid. Bad grid = SYNC follows the wrong reference.", hint: "Garbage in, garbage out — what's the input SYNC reads?" },
      { q: "Master Tempo (key-lock) ON does what?", options: ["Locks the deck as master", "Keeps the musical key constant when you change tempo, instead of pitch-shifting", "Disables SYNC", "Locks the cue point"], answer: 1, explain: "Key-lock uses time-stretching so pitch stays put when tempo moves.", hint: "Tempo changes but key doesn't." },
      { q: "Quantize ON affects", options: ["Loudness", "When triggered actions (cues, loops, FX) fire — snapping them to the nearest beat", "Track length", "Headphone level"], answer: 1, explain: "Quantize snaps action timing to grid points so everything lands on the beat.", hint: "Snap-to-grid for action timing." },
    ],
    sources: [{ label: "rekordbox 6 Operating Manual", section: "Sync & Quantize" }],
  },

  "cue-points-dj": {
    hook: "Cue points are the chapter markers of your tracks. Set them well and you'll never lose your spot.",
    beginner: {
      what: [
        "A cue point is a saved location in a track — press a button and you jump there instantly.",
        "Memory cues are stored navigation points; hot cues (1–8) are colourful instant-jump buttons on the deck.",
        "Set them on intros, drops, breakdowns and outros — the structural moments you mix from.",
      ],
      why: ["Lets you start a track exactly where you need it.", "Enables creative re-edits live by jumping between sections.", "Removes the 'where do I cue this up' panic mid-set."],
      analogy: "Bookmarks in a book. You don't read every chapter from page 1 — you jump to the bits you need.",
    },
    advanced: {
      what: [
        "rekordbox supports 8 hot cues per track (A–H, formerly 1–8), each colour-coded and labelled.",
        "Memory cues are unlimited; they appear as small triangles in the waveform. Both transfer to USB.",
        "Hot Cue Auto-Load (CDJ-3000) makes hot cues active on track load — no setup needed live.",
      ],
      edgeCases: [
        "Cues set with Quantize OFF can be ~10–30 ms off the beat — re-set with Quantize ON for clean triggering.",
        "Cues on tracks with bad grids may sound wrong when triggered into another deck via Beat Jump.",
      ],
      engineerNotes: [
        "Convention: hot cue 1 = intro start, 2 = first drop, 3 = breakdown, 4 = second drop, 5–8 = creative re-cues.",
        "Colour convention: green = safe entry, orange = build, red = drop, blue = breakdown. Train your eye to read it pre-attentively.",
      ],
    },
    flow: "Listen to track → Identify structure → Pause at point → CUE + MEMORY → Label and colour → Save to USB",
    walkthrough: [
      { do: "Load a track in rekordbox and play it through.", listen: "Note where the intro ends, where the first drop hits, where the breakdown starts." },
      { do: "Pause exactly on the first downbeat of the intro and click MEMORY (or hot cue 1).", listen: "A marker appears on the waveform — that's cue 1." },
      { do: "Find the drop, hit MEMORY again as hot cue 2, colour red.", listen: "Now you have intro + drop saved." },
      { do: "Enable Quantize and re-trigger to confirm cues snap to the beat.", listen: "Triggers land tight on the kick." },
      { do: "Export to USB; on the CDJ, hot cues light up automatically.", listen: "You can now start the track at any structural point with one button." },
    ],
    listenFor: ["Cue triggers landing on the kick = good placement", "Cue triggers landing off-beat = move them with Quantize", "Colour reading speed in live use"],
    mistakes: ["Setting too many cues — 8 is enough; clutter slows decisions.", "Not labelling — 'red cue 3' tells you nothing in a panic.", "Setting cues on phrase boundaries that are 1 bar off — always verify by triggering live."],
    proMoves: ["Adopt one colour convention across your whole library — pre-attentive reading saves seconds.", "Set 'safety cue' on the last possible re-entry before a vocal — for emergencies.", "Hot Cue Auto-Load + colour convention = zero prep time on familiar tracks."],
    quizHard: [
      { q: "Difference between memory cue and hot cue?", options: ["No difference", "Memory cues are navigation markers; hot cues are colour-coded instant-trigger buttons (1–8)", "Memory cues are for loops only", "Hot cues don't save to USB"], answer: 1, explain: "Memory = unlimited markers for navigation. Hot cues = bound to physical pads for instant triggering.", hint: "One is for navigating, one is for performing." },
      { q: "Quantize OFF when setting cues causes", options: ["Crash", "Cues land exactly where you pressed — possibly 10–30 ms off the beat", "Higher quality cues", "Cues to be removed"], answer: 1, explain: "Without Quantize, cues are placed at the press moment, not snapped to a beat.", hint: "Without snap, you get press-timing accuracy only." },
      { q: "Why use a colour convention for hot cues?", options: ["Looks pretty", "Pre-attentive reading — you process colour faster than text or position, vital under stage lights at 2am", "Required by the software", "Saves disk space"], answer: 1, explain: "Colour is read pre-attentively (~200 ms) — faster than reading a label.", hint: "Visual processing speed in stress." },
    ],
    sources: [{ label: "rekordbox 6 Operating Manual", section: "Memory & Hot Cue" }],
  },

  "eq-mixing-dj": {
    hook: "EQ is the surgeon's scalpel. Subtract first, add later.",
    beginner: {
      what: [
        "Every channel on the mixer has 3 EQ knobs: LOW (bass), MID (vocals/snare), HIGH (cymbals/air).",
        "Turning a knob down (cut) reduces those frequencies on that deck. Turning up (boost) adds them.",
        "Most mixes use cuts: kill the bass on Deck B while bringing it in, swap basses between the two tracks.",
      ],
      why: ["Two basslines fighting = mud. Cutting one fixes it instantly.", "EQ shapes energy without changing volume.", "Lets you blend tracks that don't naturally fit."],
      analogy: "EQ is like layering clothes. You don't wear two heavy coats — you take one off when you add the other.",
    },
    advanced: {
      what: [
        "Pioneer DJM mixers use isolator-style EQ: full counter-clockwise = full kill (-∞ dB) of that band.",
        "Crossover frequencies: typically LOW <200 Hz, MID 200–2500 Hz, HIGH >2500 Hz. Varies by mixer.",
        "Bass swap technique: cut Deck B bass, bring channel up, on the phrase boundary cut Deck A bass and uncut Deck B simultaneously.",
      ],
      edgeCases: [
        "EQ boosts (above 12 o'clock) add gain — can clip the channel. Cut before you boost.",
        "Tracks with sub-bass below 60 Hz may not respond audibly on small monitors — trust meters and headphones.",
      ],
      engineerNotes: [
        "Bass clashes are the #1 cause of muddy mixes. Always kill one bass before the other comes in.",
        "EQ rides during long blends: shave 2–4 dB off the outgoing track's MID over 8 bars to clear room for the incoming vocal.",
      ],
    },
    flow: "Cue Deck B → Kill Deck B bass → Bring fader up → On phrase: swap basses → Slowly lower Deck A mid + high → Out",
    walkthrough: [
      { do: "Cue Deck B in headphones; full-cut its LOW EQ (knob fully counter-clockwise).", listen: "Deck B has no bass — sounds thin in headphones." },
      { do: "Bring Deck B's fader up to full while Deck A plays through master.", listen: "You hear Deck A's bass + Deck B's mids and highs layered cleanly." },
      { do: "On the next 16-bar phrase boundary, kill Deck A's LOW and restore Deck B's LOW in one motion.", listen: "Bass has swapped — Deck B now drives the low end." },
      { do: "Over the next 8 bars, gradually lower Deck A's MID then HIGH to wash it out.", listen: "Deck A fades cleanly without a level dip." },
      { do: "Pull Deck A's channel fader down, restore its EQs to 12 o'clock for next time.", listen: "Mix complete; deck reset for reload." },
    ],
    listenFor: ["Mud when both basses are full = bass clash", "Hollow sound when only mid+high = correct intermediate state", "Vocal clarity during blend = mid management"],
    mistakes: ["Boosting EQs to make a track 'louder' — boosts clip; use gain instead.", "Forgetting to reset EQs after a mix — next mix starts in the wrong state.", "Killing all three EQs at once — same as a fader cut, defeats the point."],
    proMoves: ["Practice the bass swap on a phrase boundary until it's muscle memory.", "Use HIGH cut to remove harsh hats from an outgoing track in the last 4 bars.", "Read EQ on the meters — if peak hits red on a boost, pull gain down 2 dB."],
    quizHard: [
      { q: "Why kill the bass on the incoming deck before raising its fader?", options: ["Looks pro", "Two basslines at full level cause phase cancellation and muddy low-end — sweeping bass swap avoids this", "Saves CPU", "Required by the mixer"], answer: 1, explain: "Bass clash = low-end mud and phase issues. Killing one bass at a time keeps the low end clean.", hint: "Two basses fighting at 60 Hz." },
      { q: "Pioneer DJM full-cut EQ means", options: ["-6 dB", "-12 dB", "-∞ dB (complete removal of that band)", "+12 dB"], answer: 2, explain: "Pioneer isolator EQs go to -∞ at full-counter-clockwise — total band kill.", hint: "Isolator EQs go all the way." },
      { q: "Boosting EQ above 12 o'clock can cause", options: ["Better sound", "Channel clipping because EQ boost adds gain", "Slower mix", "Loop errors"], answer: 1, explain: "EQ boost = positive gain. Above unity, peak can exceed the channel ceiling.", hint: "Boost is gain. Gain plus loud signal equals clip." },
    ],
    sources: [{ label: "rekordbox 6 Operating Manual", section: "Mixer EQ" }],
  },

  "crossfader-technique": {
    hook: "The crossfader is a scalpel for turntablists and a switch for everyone else.",
    beginner: {
      what: [
        "The crossfader is the horizontal slider between the channels. Left = only left deck; right = only right deck; middle = both.",
        "Most club DJs leave it in the middle and mix with channel faders + EQ.",
        "Turntablists use it for cuts and scratches — quick left-right movements for rhythmic chops.",
      ],
      why: ["Channel faders give finer per-deck control for long blends.", "Crossfader excels at fast cuts and scratch patterns.", "Curve choice changes feel — sharp for scratches, smooth for blends."],
      analogy: "Channel faders are dimmer switches; crossfader is a light switch with a slider in the middle.",
    },
    advanced: {
      what: [
        "Crossfader curve: 'sharp' (full level achieved within 5% of travel — for scratching) vs 'smooth' (gradual — for blends).",
        "Crossfader assign: each channel can be assigned to crossfader side A, side B, or thru (bypass).",
        "Hamster switch: reverses crossfader direction — left becomes right. Standard scratch DJ tool.",
      ],
      edgeCases: [
        "Worn crossfaders bleed — even at full one side, the other deck leaks through. Replace or use channel faders only.",
        "Some house DJs assign both channels to thru and never touch the crossfader.",
      ],
      engineerNotes: [
        "Innofader / Pro X Fade upgrades give magnetic, contactless faders with adjustable curve and tension — standard for scratch DJs.",
        "Cut-in distance: the % of travel before signal appears. Tight cut-in (3%) for scratch, loose (10–15%) for blends.",
      ],
    },
    flow: "Set curve → Assign channels → Use for cuts/scratches OR leave centered → Reset curve after",
    walkthrough: [
      { do: "Locate the crossfader curve switch on the mixer (front panel usually).", listen: "Three positions: sharp / mid / smooth." },
      { do: "Set to smooth, play Deck A through master, slowly slide crossfader to right.", listen: "Deck A fades out gradually; Deck B fades in — usable for transitions." },
      { do: "Switch to sharp, repeat — the cut is instant.", listen: "On/off behaviour — scratch territory." },
      { do: "Practice a 'baby scratch': play a single sample on Deck B, push/pull jog while flicking crossfader.", listen: "You hear the sample chopped into rhythmic stabs." },
      { do: "Reset crossfader to middle when done; centre channel faders for next mix.", listen: "Mixer at neutral, ready for next deck." },
    ],
    listenFor: ["Bleed = worn fader", "Clean cuts = sharp curve + good fader", "Pop on cut = level mismatch between decks"],
    mistakes: ["Using crossfader for long blends — channel faders + EQ give more control.", "Leaving curve on sharp for a club set — accidentally cuts a deck dead.", "Forgetting one channel was assigned off-crossfader and panicking when it won't fade."],
    proMoves: ["For scratch sets, install an Innofader and dial cut-in to ~3% with sharp curve.", "Map FX dry/wet to crossfader for creative transitions in performance mode.", "Always check curve setting before your set — venue mixers get left in random states."],
    quizHard: [
      { q: "Crossfader 'sharp' curve is preferred for", options: ["Long blends", "Scratching — full level reached within ~5% of travel for fast on/off cuts", "Loop triggers", "EQ rides"], answer: 1, explain: "Scratch needs on/off behaviour; sharp curve delivers that.", hint: "Scratch = fast on/off." },
      { q: "A crossfader 'bleeds' when", options: ["It's brand new", "Worn contacts let the off-side signal through — you hear the silent deck faintly when fader is full to the other side", "It's miswired", "EQ is boosted"], answer: 1, explain: "Bleed = leakage. Worn analog faders develop this; replace or upgrade to magnetic.", hint: "Off should be silent. If it isn't…" },
      { q: "Hamster mode does what?", options: ["Doubles BPM", "Reverses crossfader direction so left input plays when fader is right", "Adds chipmunk pitch", "Enables loop roll"], answer: 1, explain: "Hamster reverses fader polarity — a turntablist preference based on dominant hand and setup orientation.", hint: "Reversal switch." },
    ],
    sources: [{ label: "rekordbox 6 Operating Manual", section: "Crossfader assign & curve" }],
  },

  "long-mix-blend": {
    hook: "A 64-bar blend is half conversation, half choreography. Plan the arc, then ride it.",
    beginner: {
      what: [
        "A long blend is a mix that lasts 32, 64 or even 128 bars — the two tracks overlap for over a minute.",
        "Used for deep, melodic and progressive genres where structure matters more than energy spikes.",
        "Requires both tracks to be harmonically compatible and structurally aligned (intro of B over outro of A).",
      ],
      why: ["Crowd doesn't notice the change — the journey feels seamless.", "Showcases two tracks as one extended piece.", "Less risky in the moment — you have time to react if something goes wrong."],
      analogy: "Two rivers slowly joining — by the time you cross, you can't tell where one ended.",
    },
    advanced: {
      what: [
        "Anatomy: 16 bars under outgoing track / 32 bars true overlap / 16 bars under incoming = 64-bar blend.",
        "EQ choreography: B bass cut → B fader up → bass swap on bar 33 → A high cut → A mid cut → A out.",
        "Harmonic requirement: same key, relative major/minor, or perfect 5th (Camelot ±1) — anything else clashes over a long overlap.",
      ],
      edgeCases: [
        "Tracks with vocals are risky for long blends — two vocals overlap and the words clash.",
        "Tempo drift over 64 bars is audible at >0.1 BPM difference — SYNC or precise manual matching required.",
      ],
      engineerNotes: [
        "Phrase awareness is critical: incoming drop must land where outgoing breakdown ends, not over its peak.",
        "Pre-plan blends in rekordbox using related tracks playlists — saves cognitive load live.",
      ],
    },
    flow: "Verify key + structure → Cue B + kill bass → Fader up at bar 0 → Swap bass at bar 32 → Cut A highs/mids → Pull A at bar 64",
    walkthrough: [
      { do: "Pick a 128-BPM house track A in 8A and a B track in 8A or 9A.", listen: "Same or adjacent Camelot — safe harmonically." },
      { do: "Identify outro of A (last 32 bars, breakdown) and intro of B (first 32 bars, beat-only).", listen: "Find the structural overlap window." },
      { do: "Cue B at intro start, kill its bass, raise fader to full as A enters its outro.", listen: "Both tracks audible; bass only from A." },
      { do: "On bar 33 (midpoint), swap basses — A's LOW kill, B's LOW restore.", listen: "Bass now driven by B." },
      { do: "Over bars 33–56, gradually cut A's HIGH then MID. Pull A's fader at bar 64.", listen: "A washes out cleanly; B continues alone." },
    ],
    listenFor: ["Vocal clashes mid-blend", "Tempo drift after 32 bars", "Phrase misalignment on bar 33 (the bass swap moment)"],
    mistakes: ["Blending tracks with clashing keys — sounds wrong even if BPMs match.", "Bringing B in too loud — masks A and ruins the gradual reveal.", "Not planning structurally — bass swap on bar 27 instead of 33 = phrase break."],
    proMoves: ["Mark blend points with memory cues on both tracks beforehand.", "Use My Tag 'LONG-BLEND' to flag tracks with clean 32-bar intros/outros.", "Record long blends and listen to the midpoint — is the transition magical or just functional?"],
    quizHard: [
      { q: "Why is harmonic compatibility more critical for long blends than short cuts?", options: ["It isn't", "Long overlap = sustained interval clash audible for 60+ seconds; short cuts hide the clash", "Long blends use no EQ", "Short cuts are key-locked"], answer: 1, explain: "Time exposes harmonic conflict. Quick cuts hide it under transient noise.", hint: "More time = more clash exposure." },
      { q: "Bass swap on bar 33 of a 64-bar blend lands on what structural moment?", options: ["The drop", "The midpoint phrase boundary — the most musically natural handover point", "The intro end", "A random bar"], answer: 1, explain: "Bar 33 = start of second 32-bar phrase = natural pivot.", hint: "Halfway through a 64-bar arc." },
      { q: "Tempo drift of 0.15 BPM over 64 bars at 128 BPM equals roughly", options: ["No drift", "About 1 beat of phase drift across the blend — audible to trained ears", "Half a bar drift", "Doesn't affect the mix"], answer: 1, explain: "0.15 BPM × ~30s = ~1 beat phase shift. Manual nudges or SYNC required.", hint: "Small numbers add up over long times." },
    ],
    sources: [{ label: "rekordbox 6 Operating Manual", section: "Long mix techniques" }],
  },

  "transitions-cut-dj": {
    hook: "A cut transition is an honest punch. No fade — just the next track, on the beat.",
    beginner: {
      what: [
        "A cut is the opposite of a blend: you stop track A and start track B at the same instant.",
        "Works when both tracks share strong, similar energy and the cut lands on a downbeat.",
        "Common in hip-hop, scratch sets, and high-energy dance moments where surprise = excitement.",
      ],
      why: ["Adds drama — the crowd feels the change.", "Useful when tracks don't blend cleanly (different keys, structure).", "Faster — you cover more tracks in a set."],
      analogy: "A film cut from one scene to the next. No fade-to-black, just slam to the new scene.",
    },
    advanced: {
      what: [
        "Types: hard cut (channel fader slam), echo-out cut (FX tail covers the swap), spinback cut (Deck A spun back as B enters).",
        "Beat-juggle cut: alternating 1-bar samples between decks using cues + crossfader.",
        "Drop-on-drop: cut from outgoing drop directly into incoming drop — peak-time tool.",
      ],
      edgeCases: [
        "Cuts on phrase mid-bar feel like a mistake — always land on bar 1.",
        "Level mismatch between decks at cut moment = audible jump in volume.",
      ],
      engineerNotes: [
        "Echo-out FX: 1/2 beat echo with feedback ramp covers the cut and bridges energy.",
        "Quantize ON + hot cue on Deck B downbeat = perfect cut every time.",
      ],
    },
    flow: "Match levels → Cue Deck B on downbeat hot cue → Quantize ON → On bar 1: cut A fader / trigger B cue simultaneously",
    walkthrough: [
      { do: "Pick two tracks with similar energy, set hot cue 1 on Deck B's first kick of a drop.", listen: "Cue lit on the downbeat." },
      { do: "Match levels — both deck channel meters should peak similarly.", listen: "No level jump expected on cut." },
      { do: "Enable Quantize so the hot cue snaps to beat.", listen: "Trigger timing handled by software." },
      { do: "On bar 1 of an A phrase, pull A's fader to zero and hit Deck B hot cue 1 in one motion.", listen: "Instant slam to new track — clean cut." },
      { do: "Practice with an echo-out: apply 1/2-beat echo to A for 2 bars before cut, then slam B in.", listen: "FX tail covers any transition gap." },
    ],
    listenFor: ["Level jump = gain mismatch", "Off-beat cut = sounds like a mistake", "Drop-on-drop = peak excitement moment"],
    mistakes: ["Cutting mid-phrase — feels jarring and wrong.", "Forgetting Quantize — finger-press latency makes the cut land slightly late.", "Cutting between two low-energy tracks — no drama, just confusing."],
    proMoves: ["Drop-on-drop cuts at the climax of a set — the cheapest way to send a crowd over the edge.", "Practice echo-out cuts with 1/4 beat to 1/2 beat ramp — bridges any tempo difference.", "Use a spinback (slow Deck A jog backwards while cutting) for a film-style transition."],
    quizHard: [
      { q: "Why must a cut land on bar 1?", options: ["Aesthetic only", "Phrase boundaries are where the crowd expects change — landing elsewhere reads as a mistake", "Required by software", "BPM lock"], answer: 1, explain: "Crowds feel phrase structure. A cut on bar 5 of an 8-bar phrase sounds wrong even if technically clean.", hint: "Crowds count in 8s without knowing it." },
      { q: "Echo-out cut technique uses", options: ["A reverb tail", "A delay/echo applied to outgoing deck with feedback, masking the cut moment and bridging tempo", "EQ kill", "Filter sweep"], answer: 1, explain: "Echo with feedback creates a sustained tail that overlaps the start of the new track.", hint: "FX tail covers the gap." },
      { q: "Drop-on-drop is risky because", options: ["It always works", "Two peak-energy tracks need to be in compatible keys + similar intensity or the cut feels chaotic, not climactic", "It requires SYNC off", "It uses extra CPU"], answer: 1, explain: "Energy stacking only works if both tracks are arrived-at peak; harmonic clash at peak is brutal.", hint: "Stacking peaks needs harmonic agreement." },
    ],
    sources: [{ label: "rekordbox 6 Operating Manual", section: "Cue triggering & quantize" }],
  },

  "loop-function-dj": {
    hook: "A loop turns 4 bars into infinite bars. Use it to buy time, build tension, or rebuild a track live.",
    beginner: {
      what: [
        "A loop repeats a section of the track endlessly until you exit.",
        "Set IN (loop start) and OUT (loop end), or use auto-loop (4-beat, 8-beat, 16-beat presets).",
        "Used to extend an intro, hold a breakdown, or skip a weak section of a track.",
      ],
      why: ["Lets you wait for the right moment to drop the next track.", "Creates new arrangements live by re-looping interesting parts.", "Saves a transition when the next track isn't ready."],
      analogy: "A pause button that keeps the music playing. You stay on the same page until you turn it.",
    },
    advanced: {
      what: [
        "Beat loops: 1/16, 1/8, 1/4, 1/2, 1, 2, 4, 8, 16, 32 beats. Each button halves or doubles the length.",
        "Manual loops: IN/OUT buttons let you capture an irregular section (e.g. 3-bar vocal phrase).",
        "Loop roll: triggers the loop while continuing the playhead — when you release, track resumes where it would have been (a 'stutter' effect).",
      ],
      edgeCases: [
        "Loops on tracks with bad grids drift — manually adjust IN/OUT to fix.",
        "Long loops (16+ bars) over a vocal will repeat words obviously — only safe on instrumental sections.",
      ],
      engineerNotes: [
        "Loop slip mode (rekordbox): exits the loop and jumps to where the playhead would have been — preserves musical timeline.",
        "Saved loops can be stored as memory cues with loop length attached — recall in one button press.",
      ],
    },
    flow: "Find clean 4-bar instrumental → Press 4-beat loop on downbeat → Hold for tension → Halve loop length to build → Exit on phrase",
    walkthrough: [
      { do: "Load a track with a clear instrumental section, play to that point.", listen: "Drums + bass, no vocals." },
      { do: "On the downbeat, press auto-loop 4-beat.", listen: "Track repeats every 4 beats — endless groove." },
      { do: "Halve the loop to 2-beat, then 1-beat.", listen: "Loop tightens — feels like a build." },
      { do: "Use this time to cue Deck B, prep the mix, then exit the loop on a phrase boundary.", listen: "Track resumes naturally; transition follows." },
      { do: "Try loop roll: hold the 1/8-beat button briefly, release, and the track resumes where it would have been.", listen: "Stutter effect with no timeline jump." },
    ],
    listenFor: ["Vocal repetition = bad loop placement", "Phase break on exit = exited on the wrong beat", "Tightening build = halving loop length"],
    mistakes: ["Looping over a vocal — words repeat obviously.", "Exiting mid-phrase — sounds like a mistake.", "Using long loops as a crutch instead of preparing properly."],
    proMoves: ["Halve loop length progressively (4 → 2 → 1 → 1/2 → 1/4) as a built-in tension build.", "Loop a missing section from a different track and layer it via a third deck — instant live edit.", "Save go-to loops as memory points labelled 'BUILD-LOOP'."],
    quizHard: [
      { q: "Loop roll differs from a normal loop because", options: ["No difference", "On exit, the playhead jumps to where the track would have been if not looped — preserving timeline", "Roll loops are longer", "Roll loops affect tempo"], answer: 1, explain: "Roll = stutter effect; track continues underneath silently, resumes seamlessly.", hint: "Imagine the track still played while you looped." },
      { q: "Progressively halving loop length (4 → 2 → 1 → 1/2 beats) creates", options: ["A pause", "A perceptual tension build — faster repetition reads as rising intensity", "An EQ sweep", "A key change"], answer: 1, explain: "Halving loop length accelerates apparent rhythm = tension.", hint: "Faster repetition = more energy." },
      { q: "Why avoid loops on vocal sections?", options: ["Software limitation", "Words repeat audibly — the crowd notices the loop because language is repetitive", "EQ breaks", "Loops can't loop vocals"], answer: 1, explain: "Loops on instrumental are invisible; loops on vocals are obvious.", hint: "Words are memorable; drums are wallpaper." },
    ],
    sources: [{ label: "rekordbox 6 Operating Manual", section: "Loop & Slip mode" }],
  },

  // ============================================================
  // PATH 4 — PERFORMANCE & CRAFT
  // ============================================================
  "reading-the-crowd": {
    hook: "The crowd is your second set of monitors. Watch the floor, then play to it.",
    beginner: {
      what: [
        "Reading the crowd means watching what people do and adjusting your next track choice based on it.",
        "Signals: density of the dance floor, where people are looking, whether they're talking or dancing, energy of movement.",
        "Goal: keep most of them dancing, gradually moving energy in the direction you want the night to go.",
      ],
      why: ["The pre-planned set is a hypothesis; the crowd is the test.", "A great selection in a vacuum is a bad selection if it empties the floor.", "Reading well = repeat bookings."],
      analogy: "A stand-up comic watches the audience between jokes. If they aren't laughing at puns, no more puns.",
    },
    advanced: {
      what: [
        "Floor density curve: track % of capacity dancing every 15 minutes — a steady curve up = correct trajectory.",
        "Body language hierarchy: hands up > heads up > swaying > nodding > talking > phones > leaving.",
        "Genre tolerance: each crowd has a tempo + style band they accept. Stepping outside loses them; stepping just to the edge excites them.",
      ],
      edgeCases: [
        "Early in the night, low engagement is normal — don't panic and drop bangers at 10 PM.",
        "A spike in phones-out = a viral moment incoming (drop) or boredom (mids). Read context.",
      ],
      engineerNotes: [
        "Set markers in your mental model: 'first time hands go up', 'first time someone leaves the floor' — calibrate against these.",
        "DJs who stare at the screen only read the screen — keep eyes up at least 50% of the time.",
      ],
    },
    flow: "Glance at floor → Note density + body language → Compare to expected curve → Adjust next 2 track choices → Repeat every 5 min",
    walkthrough: [
      { do: "At your next set, look up at the floor at the start of every track.", listen: "How many are dancing? Where are they looking?" },
      { do: "When energy dips, switch from your planned next track to a stronger one one Camelot step up.", listen: "Crowd response should rise within 16 bars." },
      { do: "When energy peaks, hold there with similar-energy tracks rather than escalating further.", listen: "Sustained peaks are more memorable than constant climbs." },
      { do: "If you see phones drop and hands rise, you just nailed a moment — note the track for your repertoire.", listen: "Catalogue your hits." },
      { do: "If the floor empties, abandon the next planned track and go to something proven.", listen: "Floor refills within 2 tracks if the recovery is right." },
    ],
    listenFor: ["Floor density changes track-to-track", "Phones up = warning OR viral moment", "Sustained peak vs constant climb"],
    mistakes: ["Sticking to the pre-planned set when the crowd is telling you to change.", "Reading 'no one dancing' as 'play harder' — often it means play more familiar.", "Treating a peak as a launchpad — sometimes it's the ceiling."],
    proMoves: ["Build 3 versions of each set: starter, peak, recovery. Switch versions based on read.", "Glance at the bar — empty bar = engaged floor; full bar = lost the room.", "After the set, recall the 3 strongest crowd moments and what track + transition caused them."],
    quizHard: [
      { q: "Best signal that the floor is engaged?", options: ["Phones in the air", "Heads up, eyes forward, hands moving — 'attentive engagement'", "People at the bar", "Photo flash"], answer: 1, explain: "Attentive body language beats raised hands as a reliable engagement signal.", hint: "Where are they looking?" },
      { q: "Floor empties mid-set. Best response?", options: ["Play harder", "Abandon planned next track, play a proven crowd track to recover", "Stop the set", "Lower volume"], answer: 1, explain: "Recovery = play to the lowest common denominator briefly, then rebuild.", hint: "Floor goes, planned set goes." },
      { q: "Sustained peak vs constant climb — which is more memorable?", options: ["Constant climb always wins", "Sustained peak — the crowd needs time to be in the moment before you escalate", "Both same", "Neither matters"], answer: 1, explain: "Memory forms during sustained engagement, not during transitions. Hold peaks.", hint: "Memory needs time to form." },
    ],
    sources: [{ label: "Club DJ practice", section: "Crowd reading" }],
  },

  "set-structure-dj": {
    hook: "A set is a story. Intro, build, peak, recovery, outro — same shape as every film you've ever loved.",
    beginner: {
      what: [
        "A DJ set has structure: warm-up (low energy), build (rising), peak (highest), come-down (lower energy), close.",
        "BPM and intensity usually rise gradually then peak around 2/3 through, then taper.",
        "Length determines pacing: a 1-hour set has one arc; a 4-hour set has multiple peaks and valleys.",
      ],
      why: ["Crowds need contrast — constant peak = no peak.", "Pacing creates anticipation, which creates memorable drops.", "Structure makes a set feel intentional, not random."],
      analogy: "Like cooking a meal. Appetiser, main, dessert. Serve dessert first and the meal makes no sense.",
    },
    advanced: {
      what: [
        "1-hour opener: start 10 BPM under peak target, climb 2–3 BPM per 15 min, peak at 50-min mark, soft outro.",
        "3-hour headline: 6 mini-arcs (~30 min each) with progressive peaks; biggest peak at hour 2.",
        "Genre transition strategy: don't jump genres at peak — use a breakdown to pivot.",
      ],
      edgeCases: [
        "If the prior DJ ended hot, you can't start cold — match their energy then redirect.",
        "Festival sets are different — 60 minutes of peaks because the audience demands it.",
      ],
      engineerNotes: [
        "Plan 'anchor tracks' — 3–5 known-winners spaced through the set as guaranteed peaks.",
        "Leave 30% of slots empty in your pre-plan for crowd-driven decisions.",
      ],
    },
    flow: "Identify slot length + role → Map energy curve → Place anchor tracks → Fill arcs around them → Leave 30% flexible",
    walkthrough: [
      { do: "Pick a slot: 90 min, peak time.", listen: "Peak slot = climb early, hold high, big finish." },
      { do: "Place 4 anchor tracks (proven winners) at minutes 25, 50, 70, 85.", listen: "Anchors guarantee peaks even if filler is improvised." },
      { do: "Map BPM: start at 124, climb to 128 by anchor 1, 130 by anchor 3.", listen: "Predictable BPM curve = predictable energy rise." },
      { do: "Fill between anchors with progressively energetic tracks from your prepped folder.", listen: "Filler should flow up to each anchor." },
      { do: "Leave 3 slots empty in your written set — to react to the crowd.", listen: "Real sets always swap 30%+ live." },
    ],
    listenFor: ["Energy gaps between anchors", "Genre jumps at peaks (don't)", "Crowd response at each anchor (calibrate next time)"],
    mistakes: ["Peaking too early — leaves nowhere to go.", "All anchors, no breath — exhausting and forgettable.", "Sticking 100% to the plan when crowd says otherwise."],
    proMoves: ["After each gig, re-rate anchor tracks: did they peak or fizz? Update your library.", "Map a 'panic recovery' anchor at minute 40 in case the set is losing energy.", "Study sets you love on Soundcloud — annotate their energy curves."],
    quizHard: [
      { q: "Why peak around 2/3 of the way through, not at the very end?", options: ["Tradition", "Crowds need a come-down period to consolidate the peak as a memory before the close", "Software requires it", "Battery saving"], answer: 1, explain: "Endings without resolution feel abrupt; peak-then-come-down creates a memorable arc.", hint: "Movies don't end on the climax — there's denouement." },
      { q: "An 'anchor track' in a set plan is", options: ["The first track", "A pre-selected proven track placed at strategic energy moments to guarantee a peak", "A loop point", "The closing track"], answer: 1, explain: "Anchors are insurance — the rest can flex around them.", hint: "Insurance peaks." },
      { q: "Why leave 30% of slots empty in a pre-plan?", options: ["Lazy planning", "Live crowd reads require swapping tracks — over-planning makes you rigid and unresponsive", "Software limit", "Reduces fatigue"], answer: 1, explain: "Rigid plans fail when reality disagrees. Slack = responsiveness.", hint: "Plans meet reality; reality often wins." },
    ],
    sources: [{ label: "DJ Magazine - set craft articles", section: "Set structure" }],
  },

  "harmonic-mixing-dj": {
    hook: "Mix in key and even mediocre transitions sound good. Mix out of key and even perfect blends sound wrong.",
    beginner: {
      what: [
        "Harmonic mixing means choosing tracks whose musical keys are compatible.",
        "Compatible keys: same key, the relative minor/major, or one position around the Camelot wheel (5th relationship).",
        "Rekordbox shows the key on every track — letter notation (Am, C) and Camelot (8A, 8B).",
      ],
      why: ["Avoids dissonant clashes on long blends.", "Compatible keys feel emotionally consistent.", "Energy moves up the wheel = energy rises perceptually."],
      analogy: "Painting with colours from the same palette. Mix red with red-orange — beautiful. Mix red with green and it screams.",
    },
    advanced: {
      what: [
        "Camelot Wheel: 12 outer (B = major) and 12 inner (A = minor) positions. Adjacent = compatible.",
        "Energy boost: +1 step clockwise (8A → 9A) = up a perfect 5th = perceived energy lift.",
        "Mood shift: switch between A (minor) and B (major) at same number = same key, different mood — emotional pivot.",
      ],
      edgeCases: [
        "Detected key can be wrong on tracks with key changes or modal ambiguity — verify by ear.",
        "Some genres (techno, minimal) are largely atonal — harmonic mixing matters less.",
      ],
      engineerNotes: [
        "Key Shift (rekordbox): pitch-shift a track ±1 semitone to force harmonic compatibility.",
        "Vocal tracks are most key-sensitive — never key-clash a vocal blend.",
      ],
    },
    flow: "Look up current key (Camelot) → Pick next from {same, +1, -1, same number ±letter} → Verify by ear → Blend",
    walkthrough: [
      { do: "Play a track at 8A.", listen: "The Camelot label shows 8A in rekordbox." },
      { do: "Browse compatible options: 8A (same), 9A (+5th), 7A (-5th), 8B (relative major).", listen: "All four sound harmonically clean against current." },
      { do: "Pick 9A as next track — slight energy lift.", listen: "Blend feels like climbing one step." },
      { do: "Mix in slowly — if vocal clash, abandon and pick a different 8A.", listen: "Your ears outrank the chart." },
      { do: "After 3 tracks at 9A, jump to 9B (mood pivot to major) for a brighter peak.", listen: "Same key root, different colour." },
    ],
    listenFor: ["Vocal clash on melodic blend = key mismatch", "Energy lift on Camelot +1 = harmonic shift working", "Major/minor pivot = mood change"],
    mistakes: ["Trusting the auto-detected key blindly — verify weird-sounding blends by ear.", "Never using same-number A↔B pivots — you miss easy mood shifts.", "Treating Camelot as a rigid rule. It's a guide, not a law."],
    proMoves: ["Plan 'key journeys' across a set — start at 7A, climb to 11A, drop to 11B for the close.", "Use Key Shift to rescue an otherwise-perfect track that's one semitone off.", "Build playlists per key for fast harmonic browsing."],
    quizHard: [
      { q: "Camelot 8A → 8B is", options: ["Incompatible", "Same root, switch from minor to major — emotional/mood pivot, harmonically clean", "A semitone jump", "Sub-bass only"], answer: 1, explain: "8A = A-minor, 8B = C-major (relative major). Same notes, different mood.", hint: "Inner ring vs outer ring at same number." },
      { q: "Camelot +1 step (8A → 9A) creates", options: ["A key clash", "A perfect 5th relationship — perceived energy lift, harmonically smooth", "A semitone drop", "Tempo change"], answer: 1, explain: "Clockwise step = perfect 5th up = brighter, more energetic feeling.", hint: "One step right = one step up energy." },
      { q: "Why is auto-detected key sometimes wrong?", options: ["Software bugs", "Tracks with modulations, modal ambiguity, or atonal elements confuse the detection algorithm", "Always perfect", "Only old tracks"], answer: 1, explain: "Key detection assumes diatonic harmony — exceptions break it.", hint: "Algorithms assume simple cases." },
    ],
    sources: [{ label: "rekordbox 6 Operating Manual", section: "Key & Key Shift" }],
  },

  "effects-performance-dj": {
    hook: "FX are spice. A pinch transforms; a handful ruins.",
    beginner: {
      what: [
        "DJ effects (FX) are real-time audio processors: filter, echo, reverb, flanger, roll, etc.",
        "Applied to a deck or to the master output; controlled by dry/wet (amount) and beats (time division).",
        "Used to transition, build tension, fill a gap, or recover a mistake.",
      ],
      why: ["Filter sweeps mask transitions.", "Echo extends a phrase by repeating it as the next track enters.", "Reverb adds depth to breakdowns."],
      analogy: "FX are like film camera angles. Cut to a dramatic angle for emphasis; use one every shot and the film is unwatchable.",
    },
    advanced: {
      what: [
        "Beat-synced FX (Pioneer Beat FX): time-divided to BPM. 1/4 beat echo at 128 BPM = ~117 ms repeat.",
        "Sound Colour FX (per-channel): filter, noise, dub echo, sweep, crush — twist the colour knob to engage.",
        "Send FX (high-end mixers): bus FX with dedicated return, can apply FX without losing dry signal.",
      ],
      edgeCases: [
        "Reverb on a busy mix = mud. Use sparingly on minimal sections.",
        "Echo with feedback >50% builds quickly — disengage before it overwhelms.",
      ],
      engineerNotes: [
        "Filter sweep transitions: high-pass on outgoing, low-pass on incoming — meets in the middle.",
        "FX chains in rekordbox Performance Mode: stack multiple FX for unique combinations.",
      ],
    },
    flow: "Pick FX → Set time division (beats) → Engage dry/wet gradually → Time release to phrase boundary",
    walkthrough: [
      { do: "Select Echo FX, set time to 1/2 beat.", listen: "Echo will repeat every half-beat at current BPM." },
      { do: "Mid-track, slowly raise dry/wet from 0 to 60%.", listen: "Echo tail builds, fills space." },
      { do: "On a phrase boundary, slam dry/wet to 0.", listen: "FX cuts dead, room punches back to dry signal — dramatic moment." },
      { do: "Try filter sweep: low-pass cutoff swept from 20kHz to 200 Hz over 8 bars.", listen: "Track muffles progressively — transition build." },
      { do: "Practice 'echo out': kick echo at 1 bar from end of phrase, let it tail into next track.", listen: "Phrase extends via echo into the next." },
    ],
    listenFor: ["Reverb mud = too much, too long", "Echo feedback runaway = need to disengage", "Filter sweep landing on phrase = clean transition"],
    mistakes: ["Reverb on every track — every section sounds the same.", "Echo without disengaging before next track enters — clashes.", "FX as a panic button — masks technique problems instead of solving them."],
    proMoves: ["Map dry/wet to a single knob you always know — muscle memory under stress.", "Use Sound Colour FX sparingly — they're meant to be one-shot punctuation.", "Plan one FX moment per 5 tracks; more than that = overuse."],
    quizHard: [
      { q: "Beat-synced echo at 1/2 beat at 128 BPM repeats every", options: ["117 ms", "234 ms", "468 ms", "1 second"], answer: 1, explain: "60000 / 128 = 469 ms per beat; 1/2 beat = ~234 ms.", hint: "60000 / BPM / 2." },
      { q: "Filter sweep transition technique uses", options: ["Reverb on both decks", "High-pass on outgoing + low-pass on incoming, meeting at midpoint frequency", "Echo only", "Bass kill"], answer: 1, explain: "Frequency split = clean handover. Outgoing fades upward, incoming fades downward.", hint: "Two filters meeting in the middle of the spectrum." },
      { q: "Echo feedback >50% causes", options: ["Quieter signal", "Self-feeding loop where each echo is louder than the last — runaway", "Bass loss", "Crash"], answer: 1, explain: "Feedback above unity = compounding repeats = audible runaway.", hint: "Each repeat louder = exponential growth." },
    ],
    sources: [{ label: "rekordbox 6 Operating Manual", section: "Beat FX & Sound Colour FX" }],
  },

  "energy-management-dj": {
    hook: "Energy isn't a number — it's a curve. Manage the curve, not the moment.",
    beginner: {
      what: [
        "Energy = perceived intensity. Affected by BPM, density of arrangement, bass weight, vocal presence, harmonic tension.",
        "A set's energy is a curve over time, not a constant. Even peak sets have moments of release.",
        "Manage by alternating climb / hold / micro-release / climb — never flatline at maximum.",
      ],
      why: ["Constant peak desensitises crowds.", "Strategic dips make subsequent peaks feel bigger.", "Energy curves are how DJs become memorable."],
      analogy: "A roller coaster. The big drop only feels big because you climbed first. A coaster that's all drop is just a fall.",
    },
    advanced: {
      what: [
        "Energy components: tempo (objective), arrangement density (objective), perceived intensity (subjective). All three contribute.",
        "Tag your library: 1–10 energy scale (My Tag) — sortable for live decisions.",
        "Build-release-build: 16 bars climb, 8 bars hold, 16 bars climb beats 40 bars constant climb every time.",
      ],
      edgeCases: [
        "BPM ↑ doesn't always = energy ↑ — a 128 BPM banger feels bigger than a 140 BPM minimal.",
        "Vocal entry = perceived energy spike even with no arrangement change.",
      ],
      engineerNotes: [
        "Plan energy curve before set — sketch it on paper if needed.",
        "Track-rating: re-rate after every gig based on live performance, not studio listen.",
      ],
    },
    flow: "Sketch energy curve → Tag library by energy → Place tracks along curve → Adjust live based on read",
    walkthrough: [
      { do: "Take 10 favourite tracks, rate them 1–10 for energy, write down.", listen: "Forces you to articulate intensity." },
      { do: "Sketch a 90-min curve: start at 4, climb to 8 by min 60, hold, peak at 9 at min 80, close at 6.", listen: "Visual plan to follow." },
      { do: "Place your rated tracks on the curve — energy 7 track at minute 40, energy 9 at minute 80.", listen: "Curve fills with structure." },
      { do: "Identify a 'micro-release' track (energy 6) to drop at minute 70 — pause before the peak.", listen: "Crowd takes a breath; peak hits harder." },
      { do: "Play the set; mark deviations live; review after.", listen: "Real sets always reveal the gap between plan and execution." },
    ],
    listenFor: ["Plateau = need release", "Bass drop = guaranteed energy spike", "Vocal entry = perceived spike without arrangement change"],
    mistakes: ["Constant peak = no peak.", "Releasing too often = no momentum.", "Confusing BPM with energy."],
    proMoves: ["Energy-tag every track 1–10; refine after every gig.", "Design 'release tracks' — known crowd-favourites that lower intensity without losing engagement.", "Treat peak as something you visit, not somewhere you live."],
    quizHard: [
      { q: "Why does constant peak energy fail?", options: ["It doesn't — peak is best", "Sensory adaptation — sustained intensity normalises, perceived energy drops", "Software limits", "Hearing damage"], answer: 1, explain: "Brain adapts to sustained signals; contrast is what registers as intensity.", hint: "Sensory systems adapt to constants." },
      { q: "A 128 BPM peak track can feel bigger than a 140 BPM track because", options: ["Always wrong", "Perceived energy depends on arrangement density, bass weight, and vocals — not BPM alone", "BPM doesn't matter", "140 BPM is too fast for clubs"], answer: 1, explain: "BPM is one input. Mix of all energy factors determines perception.", hint: "Energy is multi-dimensional." },
      { q: "Micro-release before a peak makes the peak feel bigger because", options: ["Just luck", "Contrast — lower preceding intensity widens the gap, perceived as a bigger climb", "Loudness boost", "Tempo trick"], answer: 1, explain: "Perception is relative — bigger contrast = bigger felt jump.", hint: "Big drop needs a low to drop from." },
    ],
    sources: [{ label: "DJ Magazine - performance articles", section: "Energy management" }],
  },

  "genre-strategy-dj": {
    hook: "One genre well > five genres badly. Specialise, then expand.",
    beginner: {
      what: [
        "Picking a primary genre lets you build deep library, technique and reputation in that lane.",
        "Genres differ in tempo, structure, mixing style, and crowd. Trying to play all = mastering none.",
        "Once you're strong in one, adjacent genres become easier to add (house → tech house → minimal).",
      ],
      why: ["Specialists get booked over generalists.", "Mixing style is genre-shaped — same techniques don't work everywhere.", "Crowds remember a DJ for a sound, not a buffet."],
      analogy: "A chef is known for a cuisine, not for every cuisine. Italian first; fusion later.",
    },
    advanced: {
      what: [
        "Tempo families: 90–105 (hip-hop, RnB), 110–124 (deep house), 124–132 (house, tech house), 130–140 (techno), 138–145 (trance), 150–180 (DnB).",
        "Within a family, mixing technique transfers; across families requires bridge tracks.",
        "Cross-genre sets work via 'pivot tracks' — tracks that share elements of both genres.",
      ],
      edgeCases: [
        "Bass-heavy genres (DnB, dubstep) require different sound system handling than melodic (deep house).",
        "Open-format slots (wedding, corporate) reward genre breadth; underground clubs reward depth.",
      ],
      engineerNotes: [
        "Build sub-libraries per genre in rekordbox; never mix them in browsing.",
        "Pivot tracks tagged 'BRIDGE' — invaluable for set evolution.",
      ],
    },
    flow: "Pick primary genre → Build 300+ deep library → Master technique conventions → Add adjacent genre → Use pivots",
    walkthrough: [
      { do: "Choose one genre you love.", listen: "Commitment beats hedging." },
      { do: "Spend 1 month buying only that genre — aim for 100 tracks.", listen: "Depth, not breadth." },
      { do: "Study its mixing conventions: blend lengths, FX use, structure norms.", listen: "Tech house ≠ techno mixing." },
      { do: "Play 5 sets in only that genre.", listen: "Repetition builds skill; constraint reveals nuance." },
      { do: "Then add an adjacent genre — tech house if you started in deep house.", listen: "Adjacent transfer is fast; jump is slow." },
    ],
    listenFor: ["Style mismatches when mixing across genres", "Technique that doesn't transfer (e.g. long blends in DnB)", "Crowd confusion at genre pivots"],
    mistakes: ["Jumping straight to multi-genre before mastering one.", "No pivot tracks for cross-genre = crowd loses thread.", "Treating all genres the same — tech house ≠ techno even at same BPM."],
    proMoves: ["Master one genre in 6–12 months before expanding.", "Cultivate 'pivot' tracks for every cross-genre move you plan.", "Study sets from icons in your genre — annotate their structure and selection logic."],
    quizHard: [
      { q: "Why do specialists get booked over generalists?", options: ["Less competition", "Promoters book sounds, not skills — a specialist signals a known sound; a generalist signals risk", "Cheaper", "Faster setup"], answer: 1, explain: "Promoters need predictability; specialists deliver it.", hint: "Promoters book what they can describe." },
      { q: "A pivot track is", options: ["The last track of a set", "A track sharing elements of two genres, used to bridge between them in a cross-genre set", "A scratch sample", "An FX preset"], answer: 1, explain: "Pivot = bridge. Eases the transition and tells the crowd 'we're going somewhere'.", hint: "Bridge between two sounds." },
      { q: "Tempo families exist because", options: ["Random convention", "Genres developed around specific BPM ranges that suit their groove, instrumentation, and dance style", "BPM regulation", "Software limit"], answer: 1, explain: "Genre = tempo + groove + instrumentation. Tempo is part of the recipe.", hint: "BPM is part of the genre identity." },
    ],
    sources: [{ label: "DJ Mag - genre history articles", section: "Genre strategy" }],
  },

  "preparing-a-set-dj": {
    hook: "An hour of prep beats four hours of panic. Walk in with a plan; walk out with a story.",
    beginner: {
      what: [
        "Set prep = picking, analysing, organising and rehearsing tracks before the gig.",
        "Steps: shortlist 2× the tracks you'll need, analyse all in rekordbox, sort into playlist by intended order, set cues + loops.",
        "Rehearse 3–4 key transitions but leave room for live decisions.",
      ],
      why: ["Removes 90% of in-the-moment thinking — frees you to read crowd.", "Catches bad grids, missing tracks, key clashes in advance.", "Confidence boost — you've already mentally played the set."],
      analogy: "A chef preps mise en place before service. Knives sharp, ingredients chopped, sauces ready. Then the cooking flows.",
    },
    advanced: {
      what: [
        "Shortlist: 2× set length in tracks (60-min set = ~25 tracks at 4-min each, shortlist 50).",
        "Analyse all in rekordbox: BPM, key, beat grids, set hot cues 1–4 (intro/drop/breakdown/outro).",
        "Playlist organisation: rough order, energy-tagged, marked anchors. Leave gaps for live picks.",
      ],
      edgeCases: [
        "Festival / opener slots need 30% more shortlist — you may need to drop the planned set entirely.",
        "Tracks discovered same-day rarely make the set live — pre-prep is non-negotiable.",
      ],
      engineerNotes: [
        "Always carry the set on at least 2 USBs + a laptop backup. Hardware fails.",
        "Verify USB compatibility with venue gear (FAT32, exFAT, file count limits).",
      ],
    },
    flow: "Brief check (slot length, venue, genre) → Shortlist 2× tracks → Analyse + cue → Sort → Rehearse 3 transitions → Export to 2 USBs",
    walkthrough: [
      { do: "Confirm gig details: 90 min, peak slot, tech house.", listen: "Sets the lens for selection." },
      { do: "Shortlist 50 tech-house tracks from your library.", listen: "More than you need — gives live flexibility." },
      { do: "Analyse all in rekordbox, verify beat grids on the 20 strongest.", listen: "Bad grid = no SYNC, no clean cues." },
      { do: "Create playlist 'Gig - VenueName - Date', drag tracks in intended order, mark 4 anchors.", listen: "Plan visible at a glance live." },
      { do: "Export playlist to 2 USBs (FAT32), test load on a CDJ if possible, pack headphones.", listen: "Redundancy + verification = no panic at the booth." },
    ],
    listenFor: ["Unanalysed tracks in your set = bad grids waiting to happen", "Single USB only = single point of failure", "No anchor markers = navigation issue live"],
    mistakes: ["Prepping the night before only.", "Trusting one USB.", "Leaving cues unset.", "Over-prepping rigidly with no live flexibility."],
    proMoves: ["Have a 'panic playlist' of 10 guaranteed crowd-winners per genre — for emergencies.", "Test new USBs at home on real CDJs before a gig.", "Pre-set EQ tendencies per track in your mental notes — 'kill bass at 4 bars in'."],
    quizHard: [
      { q: "Why shortlist 2× the set length in tracks?", options: ["For variety", "Live crowd reads change track choices — having extras prevents running out of options mid-set", "Software requires it", "Tradition"], answer: 1, explain: "Plan deviation is the norm, not exception. Extras = options.", hint: "Plans change; you need spares." },
      { q: "Carrying 2 USBs + laptop backup is", options: ["Excessive", "Standard pro practice — hardware fails and 'I lost my USB' is not an excuse a promoter accepts", "Wasteful", "Required by software"], answer: 1, explain: "Redundancy is professional minimum. USBs corrupt, get lost, fail to mount.", hint: "Single points of failure are unprofessional." },
      { q: "Why analyse tracks in rekordbox before the gig and not at the venue?", options: ["Saves time", "Analysis at the venue takes seconds per track but interrupts flow; pre-analysis ensures grids, keys, BPM all loaded reliably", "It's faster live", "No reason"], answer: 1, explain: "Pre-analysis = ready-to-play. Live analysis = friction.", hint: "Friction in the booth = mistakes." },
    ],
    sources: [{ label: "rekordbox 6 Operating Manual", section: "Playlists, analysis, export" }],
  },

  "live-mistakes-dj": {
    hook: "Mistakes don't sink sets — visible panic does. Recover smoothly and the crowd never knew.",
    beginner: {
      what: [
        "Every DJ makes mistakes live: wrong track, blown transition, key clash, deck stops.",
        "Recovery is the skill. The crowd rarely notices a mistake; they always notice your reaction.",
        "Common recoveries: pull the channel fader, drop to filter sweep, jump to a known cue, slam-cut to the next track.",
      ],
      why: ["Confidence in recovery = confidence in attempting harder mixes.", "Calm under pressure separates pros from amateurs.", "Most legendary 'creative moments' started as mistakes."],
      analogy: "A musician on stage flubs a note; pros play through, amateurs stop. The crowd remembers the stoppage, not the note.",
    },
    advanced: {
      what: [
        "Mistake taxonomy: timing (off-beat cue), levels (clip), key clash, structural (vocal collision), gear (USB ejected, deck stopped).",
        "Recovery moves: fader pull, EQ kill, FX cover (echo/filter), hot cue jump, slam cut, restart the deck.",
        "Mental: never freeze. Decision in <2 seconds, execute, continue.",
      ],
      edgeCases: [
        "USB unmount mid-track: hot-swap to second USB if pre-loaded; otherwise cut to other deck immediately.",
        "Deck reboot: pull fader before reboot to silence; recover when ready.",
      ],
      engineerNotes: [
        "Always keep one deck 'safe' (cued, loaded, EQ neutral) for emergency cut.",
        "Practice recoveries deliberately at home — train muscle memory before they're needed live.",
      ],
    },
    flow: "Detect mistake → Decision in 2 sec → Execute recovery (fader/EQ/FX/cue/cut) → Continue without flinching → Note for review",
    walkthrough: [
      { do: "Mid-mix, force a deliberate mistake: misalign Deck B by 1 beat.", listen: "Hear the gallop. Practice not freezing." },
      { do: "Execute: pull Deck B fader to zero, re-cue, restart cleanly on next phrase.", listen: "Clean recovery." },
      { do: "Try FX cover: apply 1/4 echo to outgoing track while you re-cue.", listen: "Echo bridges the silence." },
      { do: "Slam-cut emergency: pull A fader, hit Deck B hot cue 1, raise B fader.", listen: "Instant new track, no dead air." },
      { do: "Drill each recovery 10× at home until automatic.", listen: "Recovery = muscle memory." },
    ],
    listenFor: ["Dead air (worst sound in DJing)", "Off-beat clash after recovery (re-cue more carefully)", "Crowd response (if no head turns, recovery worked)"],
    mistakes: ["Freezing — every second of silence is heard.", "Apologising via mic — draws attention to the mistake.", "Repeating the same mistake — diagnose at home, not live."],
    proMoves: ["Practice recoveries weekly with deliberate mistakes.", "Have a 'panic track' loaded on a backup deck always — guaranteed safety net.", "Record sets and study mistakes — every error is a free lesson."],
    quizHard: [
      { q: "Worst sound in a DJ set?", options: ["Off-beat mix", "Dead air — total silence", "Wrong key", "Bass clash"], answer: 1, explain: "Mistakes are recoverable; silence is irrecoverable in the moment.", hint: "What's louder than wrong music? Nothing." },
      { q: "Best recovery for a misaligned beatmatch?", options: ["Apologise on mic", "Pull the channel fader, re-cue silently, restart on next phrase", "Stop the set", "Reboot the deck"], answer: 1, explain: "Silent re-cue → clean restart = invisible recovery.", hint: "Make the mistake disappear, not announce it." },
      { q: "Why practice recoveries deliberately at home?", options: ["Waste of time", "Muscle memory transfers under stress — untrained recoveries fail when it matters", "Required by venues", "Software needs it"], answer: 1, explain: "Stress collapses untrained skills. Train under low pressure to perform under high.", hint: "Train before you need it." },
    ],
    sources: [{ label: "DJ practice", section: "Live recovery" }],
  },

  // ============================================================
  // PATH 5 — ADVANCED & PROFESSIONAL
  // ============================================================
  "effects-deep-dj": {
    hook: "Deep FX is signal-processing in real time. Know the algorithm, control the result.",
    beginner: {
      what: [
        "Beyond presets — combining FX, chaining them, automating dry/wet, syncing time divisions to musical structure.",
        "Each FX type does a specific job: time-based (delay, reverb), modulation (flanger, phaser), distortion, filter.",
        "Stacked FX (e.g. filter → delay → reverb) create unique results — chain order matters.",
      ],
      why: ["Custom FX combinations = your signature sound.", "Automation (FX rides) = drama without manual chaos.", "Understanding the algorithm = predicting the result."],
      analogy: "Studio engineer's plugin chain. Order changes the sound. Compressor before reverb = punchy. Reverb before compressor = swimming.",
    },
    advanced: {
      what: [
        "Reverb: pre-delay, decay, EQ. Long decay on bass = mud; short decay on hats = air.",
        "Delay/echo: time, feedback, filter (band-pass on returns avoids low-end pileup).",
        "Modulation FX: LFO rate, depth, mix. Sweep rate matched to bar length for musical effect.",
        "Distortion/bit-crush: drive level, output gain. Always compensate gain — distortion adds loudness.",
      ],
      edgeCases: [
        "Long reverb on a busy track = washout. Apply to single elements (hi-hat, vocal) via send FX.",
        "FX chains exceed CPU on older hardware — monitor performance in rekordbox.",
      ],
      engineerNotes: [
        "rekordbox Performance Mode: FX banks per pad, dry/wet automation, MIDI mapping.",
        "FX send via DJM-V10 or DJM-A9: route to outboard FX (Strymon, Eventide) for unique signature.",
      ],
    },
    flow: "Choose FX → Set time/depth → Pre-listen in cue → Engage with dry/wet ride → Time release to phrase",
    walkthrough: [
      { do: "On a DJM-A9, route Deck 1 to send FX → Strymon BlueSky reverb.", listen: "Outboard reverb returns to mixer." },
      { do: "Apply only to vocal stems via Performance Mode.", listen: "Reverb on vocal, dry drums — clean separation." },
      { do: "Automate dry/wet via MIDI knob: 0 → 70% over 8 bars.", listen: "Vocal washes into space, drums stay tight." },
      { do: "Chain: vocal → filter (high-pass sweep) → reverb.", listen: "Vocal lifts and dissolves." },
      { do: "Release on phrase end — instant return to dry vocal.", listen: "Drama created, recovered cleanly." },
    ],
    listenFor: ["Mud from reverb on wide signals", "Echo pile-up from high feedback", "CPU strain in software FX chains"],
    mistakes: ["Stacking FX without listening — chain order matters.", "Long reverb on bass — mud.", "FX as substitute for selection — never works."],
    proMoves: ["Build 3 FX presets per genre — your signature toolkit.", "Use send FX to apply effects only to mid+high stems, sparing the low end.", "Study studio engineering — translates directly to live FX use."],
    quizHard: [
      { q: "Why does FX chain order matter?", options: ["It doesn't", "Each FX changes the signal before the next sees it — reverb→distortion ≠ distortion→reverb", "Software bug", "Saves CPU"], answer: 1, explain: "Serial processing = order-dependent. Different orders = different sounds.", hint: "First in line shapes what the next one processes." },
      { q: "Long reverb on bass causes", options: ["Better depth", "Frequency masking and mud — sustained low-frequency tails build up in the low end", "Crisp sound", "No issue"], answer: 1, explain: "Low frequencies have long wavelengths; sustained = phase issues + masking.", hint: "Low frequencies are sticky." },
      { q: "Send FX advantage over insert FX?", options: ["No difference", "Send FX run in parallel with dry signal — preserves dry presence while adding wet tail", "Always louder", "Less CPU"], answer: 1, explain: "Insert = serial (replaces signal). Send = parallel (adds to signal). Send preserves clarity.", hint: "Parallel preserves the original." },
    ],
    sources: [{ label: "rekordbox 6 Operating Manual", section: "Performance Mode FX" }],
  },

  "loop-performance-dj": {
    hook: "Loops are micro-edits. Chain them and you're not playing tracks — you're rebuilding them live.",
    beginner: {
      what: [
        "Performance looping = using loops creatively to extend, re-edit or transform tracks live.",
        "Techniques: loop rolls, beat-jump within a loop, layered loops across decks, loops as samples.",
        "Goal: make the track feel like your edit, not just playback.",
      ],
      why: ["Crowds remember the unique moments — your edits stand out from the playlist.", "Fills gaps when no other track fits.", "Builds your performance identity."],
      analogy: "A jazz musician quoting a phrase, then repeating, then twisting it. Same skill, different instrument.",
    },
    advanced: {
      what: [
        "Loop roll: triggered loop while slip mode keeps the timeline running. Stutter without losing position.",
        "Beat-jump within loop: jump forward/back within the loop region — micro-edits.",
        "Multi-deck loop layering: Loop a kick on Deck 3, melody on Deck 4, mix over Deck 1+2 as a 4-deck arrangement.",
        "Loop length morphing: alternate 4-bar and 1-bar loops for build/release within a single phrase.",
      ],
      edgeCases: [
        "Looping across a bar boundary that doesn't align with the grid = drift; manually trim.",
        "Loop on a track with a tempo change inside the loop = audible glitch.",
      ],
      engineerNotes: [
        "rekordbox saved loops + loop slot pads = bank of recall-able mini-edits.",
        "Quantize ON + loop = always-aligned triggers.",
      ],
    },
    flow: "Identify loopable section → Save loop as cue → Recall + automate length morph → Layer across decks",
    walkthrough: [
      { do: "On a track with a strong 2-bar drum break, save it as a loop on hot cue 5.", listen: "Recall trigger ready." },
      { do: "Live, trigger the loop, then halve length: 4→2→1→1/2 beats.", listen: "Build via loop tightening." },
      { do: "Release at phrase end with slip mode ON — track resumes in time.", listen: "Stutter ends cleanly, track continues." },
      { do: "On 4-deck setup, layer a vocal loop on Deck 3 over a different deck pair.", listen: "Live remix — vocal from one track over drums from another." },
      { do: "Practice loop morph 10× per session.", listen: "Builds muscle memory for the tension move." },
    ],
    listenFor: ["Drift on loop = grid issue", "Glitch on loop exit = slip mode off", "Layered loops out of phase = sync issue"],
    mistakes: ["Looping at random — needs musical purpose.", "Forgetting slip mode — loop exit jumps time backwards.", "Layering loops without harmonic awareness."],
    proMoves: ["Build a loop bank: 10 favourite samples saved as recallable loops across your library.", "Loop morphing as a signature transition tool.", "4-deck loop layering for headline sets — separates you from playlist DJs."],
    quizHard: [
      { q: "Slip mode + loop = ?", options: ["Slower playback", "Loop plays but underlying playhead continues; on exit, track resumes where it would have been — preserves timeline", "Crash", "Loop disabled"], answer: 1, explain: "Slip preserves position; loop becomes a stutter overlay rather than a time-warp.", hint: "Loop stutter without rewinding the track." },
      { q: "Layered loops across 4 decks require", options: ["Nothing special", "All decks SYNC'd or manually beat-matched, plus harmonic compatibility across simultaneously sounding elements", "Only deck 1 SYNC", "Half-speed playback"], answer: 1, explain: "Multi-deck = multi-source = needs tempo + key alignment.", hint: "More decks = more alignment work." },
      { q: "Why halve loop length for a build?", options: ["Sounds quieter", "Increasing repetition rate is perceptually equivalent to rising tension", "Required by software", "Saves CPU"], answer: 1, explain: "Faster repetition = higher perceived intensity. Same trick as a drum roll.", hint: "Drum roll principle." },
    ],
    sources: [{ label: "rekordbox 6 Operating Manual", section: "Loop, slip, performance" }],
  },

  "harmonic-key-shift-dj": {
    hook: "Key Shift turns 'almost compatible' into 'perfect'. One semitone, one new option.",
    beginner: {
      what: [
        "Key Shift pitches a track up or down by semitones without changing its tempo.",
        "Lets you force harmonic compatibility — shift a 9A track down 1 semitone to make it 8A and blend with your current 8A.",
        "Available on CDJ-3000 and rekordbox Performance Mode.",
      ],
      why: ["Doubles or triples your harmonic options per track.", "Rescues a track that would otherwise clash.", "Lets you transition between distant keys via small steps."],
      analogy: "A capo on a guitar. Same chord shapes, different actual pitch. The song now fits a different singer.",
    },
    advanced: {
      what: [
        "±2 semitones is safe — sounds natural. Beyond ±2 = audible artefacts (chipmunk or sluggish).",
        "Key Shift works via time-stretching algorithms; quality varies by engine.",
        "Camelot math: +1 semitone = +7 wheel positions modulo 12 (e.g. 8A +1 semitone = 3A).",
      ],
      edgeCases: [
        "Vocals shift in pitch too — known singers become unrecognisable beyond ±1.",
        "Tracks with heavy reverb show artefacts more — reverb tails get pitched too.",
      ],
      engineerNotes: [
        "Rekordbox saves Key Shift state per-track if 'Lock' enabled.",
        "Use Key Shift to plan key journeys across a set — small shifts unlock impossible jumps.",
      ],
    },
    flow: "Identify desired harmonic target → Shift incoming track ±1 or ±2 semitones → Verify by ear → Mix in",
    walkthrough: [
      { do: "Current track at 8A; you want to play a 10A track next (incompatible).", listen: "10A vs 8A = full step apart on Camelot = clash." },
      { do: "Shift the 10A track down 2 semitones → now 8A.", listen: "Now harmonically compatible." },
      { do: "Pre-listen in cue — verify no audible artefacts.", listen: "±2 should be clean." },
      { do: "Mix in normally — blend works.", listen: "Harmonic clash avoided." },
      { do: "Practice plotting 'shift journeys' — distant key reachable via 2 shifts.", listen: "Composition skill on top of selection." },
    ],
    listenFor: ["Pitch artefacts beyond ±2 semitones", "Vocal unfamiliarity at extreme shifts", "Reverb tail artefacts"],
    mistakes: ["Shifting beyond ±2 — sounds wrong.", "Forgetting to reset Key Shift after — next play uses shifted version.", "Shifting vocal-heavy tracks aggressively — unrecognisable."],
    proMoves: ["Plan key journeys using shifts to reach 'impossible' transitions.", "Save shifted versions as dedicated tracks for set-specific use.", "Use ±1 shifts as default — invisible to most listeners."],
    quizHard: [
      { q: "Safe Key Shift range?", options: ["±5 semitones", "±2 semitones for natural sound", "±1 octave", "Unlimited"], answer: 1, explain: "Beyond ±2 = audible time-stretch artefacts.", hint: "More shift = more artefact." },
      { q: "Camelot 8A + 1 semitone = ?", options: ["9A", "3A (because +1 semitone = +7 positions mod 12)", "8B", "7A"], answer: 1, explain: "Wheel math: 8 + 7 = 15; mod 12 = 3.", hint: "Semitones don't equal wheel steps." },
      { q: "Why use Key Shift instead of just picking a compatible track?", options: ["Always avoid Key Shift", "When a specific track is structurally perfect but harmonically off, shifting beats picking a lesser substitute", "Sounds louder", "Required by SYNC"], answer: 1, explain: "Sometimes the right track is the wrong key. Shift to keep the right structure.", hint: "Right track, wrong key — shift it." },
    ],
    sources: [{ label: "rekordbox 6 Operating Manual", section: "Key Shift" }],
  },

  "stem-djing": {
    hook: "Stems break a track into pieces. Now you don't mix tracks — you mix instruments.",
    beginner: {
      what: [
        "Stem DJing separates a track into 4 elements live: vocals, drums, bass, melody/other.",
        "Each stem has its own volume knob. You can drop one element while keeping the others.",
        "Available on rekordbox 6.6+, Stems-enabled CDJ-3000 firmware, and Serato Stems.",
      ],
      why: ["Lets you remove vocals from an outgoing track while bringing in another vocal track — no clash.", "Mix acapellas with instrumentals from any track in your library.", "Live remix without prep."],
      analogy: "A pizza you can pick toppings off in real time. Don't want anchovies on this slice? Gone.",
    },
    advanced: {
      what: [
        "AI-driven stem separation — runs in real time on the deck or app.",
        "Quality varies by source: cleanly produced tracks separate well; lo-fi/dense mixes have bleed.",
        "Vocal stem isolation = instant acapellas; drum stem = instant beatmatch reference.",
      ],
      edgeCases: [
        "Backing vocals often classified as 'melody' — vocal kill may leave backing vocals audible.",
        "Sub-bass below ~60 Hz sometimes bleeds into drum stem.",
        "Stem CPU load is high — older laptops choke during multi-deck stem use.",
      ],
      engineerNotes: [
        "Use vocal stem kill to overlay incoming vocal cleanly with outgoing instrumental.",
        "Stem swap technique: kill bass on Deck A via stems, raise bass on Deck B — clean swap with no EQ involvement.",
      ],
    },
    flow: "Enable Stems on deck → Identify stems to drop (vocal/drum/bass/other) → Use stem knobs alongside EQ → Watch CPU",
    walkthrough: [
      { do: "Enable Stems on Deck 1, play a vocal house track.", listen: "4 stem knobs appear on the deck/app." },
      { do: "Kill the vocal stem.", listen: "Track plays as instrumental only." },
      { do: "Bring in Deck 2 (different track with vocals).", listen: "Two vocals avoided — only Deck 2 vocal heard." },
      { do: "Try stem swap: kill Deck A bass stem, raise Deck B normally.", listen: "Bass swap without EQ touch." },
      { do: "Watch CPU meter — disable stems on idle decks to save load.", listen: "Performance protection." },
    ],
    listenFor: ["Backing vocal bleed when 'vocal off'", "Drum stem bass bleed", "CPU strain causing audio glitches"],
    mistakes: ["Assuming clean stem separation — quality varies.", "Leaving stems on all decks — CPU overload.", "Treating stems as a gimmick — they're a transition tool."],
    proMoves: ["Use vocal-kill for clean vocal-on-vocal transitions impossible otherwise.", "Stem-isolate drums of a track as 'beat reference' for live beatmatching of a key-clashy track.", "Build stem-aware playlists — flag tracks that separate cleanly."],
    quizHard: [
      { q: "Why might vocal kill leave backing vocals?", options: ["Bug", "AI classifier groups backing vocals with melody/other stem — only lead vocal is isolated", "Volume issue", "Sample rate"], answer: 1, explain: "Stem classifier categorises by dominant character, not by every vocal element.", hint: "AI sorts what it can identify clearly." },
      { q: "Best use of stems in a live mix?", options: ["Showing off", "Vocal-on-vocal transitions without clash — kill outgoing vocal, bring in new vocal", "Permanent track edits", "Replacing EQ"], answer: 1, explain: "Stems solve the vocal-clash problem better than any other technique.", hint: "Two vocals = bad. Stems fix it." },
      { q: "Why does stem DJing strain CPU?", options: ["No reason", "Real-time AI separation per deck per stem = heavy parallel processing", "Just badly coded", "Disk I/O"], answer: 1, explain: "Separation is computed live, per stem, per deck.", hint: "AI in real time = expensive." },
    ],
    sources: [{ label: "rekordbox 6.6 Stems documentation", section: "Stem playback" }],
  },

  "recording-your-set-dj": {
    hook: "If you didn't record it, it didn't happen. Recording is your mirror, your demo, your evidence.",
    beginner: {
      what: [
        "Record every practice and gig. The recording is the truthful version — your memory edits.",
        "Sources: rekordbox internal record, mixer record-out into Audacity/Ableton, or a venue recording.",
        "Listen back the next day — mistakes you missed live become obvious.",
      ],
      why: ["Practice without recording = no feedback loop.", "Recordings = demos for promoters and labels.", "Long-form sets reveal pacing problems invisible in the moment."],
      analogy: "An athlete watching game tape. The play feels different than it looked from the field.",
    },
    advanced: {
      what: [
        "Recording paths: rekordbox internal (REC button → WAV) / mixer USB record (DJM-A9) / split out to DAW.",
        "Audio quality: WAV 44.1kHz 16-bit minimum for SoundCloud; 24-bit for further mastering.",
        "Post: light limiter (-1 dB ceiling), maybe a touch of bus compression, no major EQ — represents the live sound.",
      ],
      edgeCases: [
        "Recording at venue sometimes captures hum or DJ booth bleed — test setup before commit.",
        "Long sets (>2h) over 1GB — split before upload to streaming.",
      ],
      engineerNotes: [
        "Always record at 0 dBFS peak budget — leave 3 dB headroom for transients.",
        "Tag and date every recording — your archive is your reputation.",
      ],
    },
    flow: "Setup recording before play → Verify levels mid-set → Save with date/venue → Listen next day → Note 3 wins + 3 fixes",
    walkthrough: [
      { do: "Open rekordbox, hit REC button before starting set.", listen: "Indicator goes red; file path shown." },
      { do: "Mid-set, check levels — peaks should hit -3 to -1 dBFS, not 0.", listen: "Verify no clipping in record file." },
      { do: "After set, STOP REC; locate WAV file, rename 'YYYY-MM-DD - Venue - 90min - 128BPM'.", listen: "Searchable archive." },
      { do: "Listen back next morning at moderate volume.", listen: "Distance reveals what live adrenaline hid." },
      { do: "Note 3 wins (keep doing) and 3 fixes (work on next).", listen: "Concrete actionable feedback per gig." },
    ],
    listenFor: ["Clipping (≥0 dBFS = digital distortion)", "Transitions you remember nailing — were they really clean?", "Pacing — does the energy curve hold up on re-listen?"],
    mistakes: ["Not recording — kills the feedback loop.", "Recording at clipping levels — ruins the file.", "Never listening back — recording without review is pointless."],
    proMoves: ["Upload best recordings to SoundCloud monthly — builds public proof.", "Build a 'best of' folder of strongest sets — your demo reel for bookings.", "Compare year-over-year recordings — concrete proof of growth."],
    quizHard: [
      { q: "Why leave 3 dB headroom when recording?", options: ["Quieter is better", "Live transients (kick hits, FX peaks) often exceed metered level — headroom prevents clipping", "Just convention", "Saves CPU"], answer: 1, explain: "Meters smooth peaks; real peaks are higher. Headroom protects.", hint: "Meters lie about peaks." },
      { q: "Best post-processing for a live set recording?", options: ["Heavy EQ + compression", "Light limiter to control transients, optional gentle bus compression — preserve the live sound", "Reverb on master", "Pitch correction"], answer: 1, explain: "The point is to represent the live performance, not re-master.", hint: "Represent, don't reinvent." },
      { q: "Why listen back next day instead of immediately?", options: ["No reason", "Live adrenaline distorts perception — distance reveals real quality and mistakes", "File needs to settle", "Software requires"], answer: 1, explain: "Time = perspective. Same set sounds different in calm.", hint: "Adrenaline edits memory; time corrects it." },
    ],
    sources: [{ label: "rekordbox 6 Operating Manual", section: "Recording" }],
  },

  "dvs-basics": {
    hook: "DVS = vinyl control of digital files. The feel of records, the library of a hard drive.",
    beginner: {
      what: [
        "DVS = Digital Vinyl System. Special timecode vinyl records control digital tracks via the DJ software.",
        "Setup: turntables → audio interface (Pioneer Interface 2, Rane SL3) → laptop running rekordbox / Serato.",
        "Move the timecode vinyl, the software moves the digital file — same tactile feel as vinyl, infinite library.",
      ],
      why: ["Tactile feedback unmatched by jog wheels.", "Scratch DJs prefer DVS for authentic feel.", "No physical record collection limit."],
      analogy: "Drive an electric car with a manual gear stick. The interface is familiar; the engine is modern.",
    },
    advanced: {
      what: [
        "Timecode signal: a high-frequency audio tone encodes position and direction. Software decodes it 200 times a second.",
        "Calibration: software must read timecode level and threshold; bad needles or worn vinyl break tracking.",
        "Modes: Absolute (vinyl position = file position), Relative (vinyl moves = file moves, but position decoupled), Internal (no vinyl control).",
      ],
      edgeCases: [
        "Dust/scratches on timecode vinyl = tracking drift.",
        "Worn needles = signal degradation; replace every 6–12 months heavy use.",
        "Audio interface latency >5 ms feels sluggish in scratch.",
      ],
      engineerNotes: [
        "Always carry spare timecode vinyl + spare needles.",
        "Test signal before set — software shows timecode quality % live.",
      ],
    },
    flow: "Connect turntables → Audio interface → Software → Calibrate timecode → Load track to virtual deck → Play timecode vinyl",
    walkthrough: [
      { do: "Connect turntables to Pioneer Interface 2, USB to laptop.", listen: "rekordbox detects DVS-capable inputs." },
      { do: "Place timecode vinyl on each turntable, drop needle.", listen: "Software shows green 'timecode OK' indicator." },
      { do: "Load a digital track to Deck 1 virtual.", listen: "Track loaded; ready to play." },
      { do: "Move the vinyl — software follows.", listen: "Tactile control over digital playback." },
      { do: "Scratch the timecode; software cuts and rewinds digitally.", listen: "Vinyl scratch feel, digital source." },
    ],
    listenFor: ["Tracking dropouts = vinyl/needle issue", "Latency in scratch = audio interface buffer too high", "Signal quality % in software"],
    mistakes: ["Old timecode vinyl — degrades fast.", "Wrong needle/cartridge pairing — tracking suffers.", "Skipping calibration — software guesses, badly."],
    proMoves: ["Replace timecode vinyl every 6 months for heavy use.", "Set audio interface buffer to 256 samples or less for scratch.", "Master Internal mode as backup for vinyl failure mid-set."],
    quizHard: [
      { q: "How does DVS know where the vinyl is?", options: ["Optical sensor", "Timecode tone encoded on the vinyl — software decodes pitch and direction of the tone", "Magnetic strip", "Cartridge sensor"], answer: 1, explain: "Audio timecode → software decoder → position info.", hint: "It's all in the audio signal." },
      { q: "Relative mode means", options: ["Vinyl position = file position absolutely", "Vinyl movement controls file movement but absolute position is decoupled — useful for needle drops on damaged vinyl", "No vinyl control", "Higher quality"], answer: 1, explain: "Relative = movement matters, not position. Useful when vinyl skips.", hint: "Movement yes, location no." },
      { q: "Why does worn needle hurt DVS more than regular vinyl?", options: ["No difference", "Signal degradation reduces timecode decoding accuracy — tracking errors and dropouts", "Looks bad", "Louder"], answer: 1, explain: "DVS needs clean signal for accurate decoding; degraded signal = errors.", hint: "Decoder needs clean input." },
    ],
    sources: [{ label: "Pioneer Interface 2 manual", section: "DVS setup" }],
  },

  "dj-business": {
    hook: "Talent gets you noticed; business gets you booked. Both matter equally.",
    beginner: {
      what: [
        "DJing as a career = music + brand + bookings + finances + relationships.",
        "Streams: gig fees, residencies, productions, merchandise, streaming, label deals, teaching.",
        "Brand = consistent visual identity + sound identity + reliable delivery.",
      ],
      why: ["Most pro DJs earn from multiple streams, not just gigs.", "Brand consistency = repeat bookings and recognition.", "Business sense = sustainable career, not flash-in-pan."],
      analogy: "A restaurant: kitchen quality (your skill) gets praise; supply chain, marketing, finance keep the lights on.",
    },
    advanced: {
      what: [
        "Pricing tiers: opening (£100–£300), residency (£200–£500), peak slot (£500–£2000+), headline (£2000+).",
        "Contract essentials: fee, hospitality, travel, accommodation, tech rider, cancellation policy.",
        "Tax: keep all gig income records; deduct gear, travel, music purchases. Get an accountant past £20k/year.",
      ],
      edgeCases: [
        "Free gigs only when strategic — exposure for new market, not as a habit.",
        "Cancellation fees: standard is 50% within 14 days, 100% within 48 hours.",
      ],
      engineerNotes: [
        "Build a press kit: bio, photos, mixes, technical rider, contact.",
        "Social presence: Instagram for visuals, SoundCloud for mixes, Bandcamp for paid downloads.",
      ],
    },
    flow: "Brand identity → Press kit → Booking inquiries → Contract → Deliver → Invoice → Tax records",
    walkthrough: [
      { do: "Define brand: visual (logo, photos), audio (genre + signature mixes), tone (serious/playful).", listen: "Consistency across all touchpoints." },
      { do: "Build press kit: 1-page bio + 3 photos + 2 mix links + tech rider.", listen: "Send to any promoter in 30 seconds." },
      { do: "Set fee tiers for opener/peak/headline, decline below floor.", listen: "Pricing discipline = perceived value." },
      { do: "Use contracts even for small gigs — protects both sides.", listen: "Professional precedent set." },
      { do: "Track every gig income, save 25% for tax, keep receipts for deductibles.", listen: "Sustainable financial habit." },
    ],
    listenFor: ["Inconsistent brand across channels = amateur signal", "No press kit = friction for promoters", "Underpricing = devalues category"],
    mistakes: ["Free gigs as default — devalues the category.", "No contracts — burned by cancellations.", "No tax tracking — disaster at year end."],
    proMoves: ["Set a personal floor fee and stick to it — protects market value.", "Build relationships with 3–5 promoters who book you regularly — beats cold outreach.", "Invest in production — original tracks open doors gigs can't."],
    quizHard: [
      { q: "Why have a press kit?", options: ["Vanity", "Reduces friction for promoters to evaluate and book you — they review hundreds of inquiries", "Required by law", "Marketing trend"], answer: 1, explain: "Friction kills bookings. Press kit = instant decision support.", hint: "Reduce friction for the person paying you." },
      { q: "Standard cancellation fee within 48 hours?", options: ["0%", "100% — the artist held the date and turned down other work", "10%", "Variable"], answer: 1, explain: "Held date + turned-down alternatives = full fee on short-notice cancellation.", hint: "Opportunity cost is real." },
      { q: "Why diversify income beyond gig fees?", options: ["Greed", "Gigs are unpredictable (cancellations, market shifts) — multiple streams = stability", "Tax reasons", "Required by venues"], answer: 1, explain: "Diversification = resilience. One income source = single point of failure.", hint: "Single income = single point of failure." },
    ],
    sources: [{ label: "DJ industry practice", section: "Business" }],
  },

  "dj-advanced-complete": {
    hook: "You finished the path. Now the real work begins — the rest of your career.",
    beginner: {
      what: [
        "You've covered fundamentals, library, technique, performance, and business.",
        "Mastery is not the destination — practice is the destination.",
        "Pick 3 areas to deepen over the next year: more technique, more music knowledge, more performance, more production, more business.",
      ],
      why: ["Plateaus are real — only deliberate practice breaks them.", "DJing rewards consistency over talent.", "The best DJs are still students."],
      analogy: "Black belt in martial arts isn't the end — it's the beginning. Same here.",
    },
    advanced: {
      what: [
        "Next levels: original production (Ableton/Logic), label outreach, A&R relationships, festival circuits, international touring.",
        "Specialisation deepening: pick a niche within your genre — be the best at one thing.",
        "Mentorship: find a DJ 5 years ahead; offer value before asking for time.",
      ],
      edgeCases: [
        "Burnout is real in DJing — schedule recovery weeks.",
        "Genre lifecycles: stay aware of when your scene peaks and what's next.",
      ],
      engineerNotes: [
        "Production unlocks bookings — promoters book producers more than pure DJs.",
        "Build a calendar: practice / production / business / rest in fixed blocks.",
      ],
    },
    flow: "Audit current level → Pick 3 deepening areas → Set 12-month goals → Weekly practice schedule → Review quarterly",
    walkthrough: [
      { do: "Self-audit: rate yourself 1–10 on each path covered.", listen: "Find the lowest 3 — your growth areas." },
      { do: "Set 12-month goals: 'Master harmonic mixing in techno', 'Release first track', '10 paid gigs'.", listen: "Specific + measurable." },
      { do: "Weekly schedule: 3× practice (1h), 1× production (2h), 1× business admin (30min).", listen: "Rhythm beats intensity." },
      { do: "Review quarterly — what worked, what didn't, what to adjust.", listen: "Iteration creates compound growth." },
      { do: "Find a mentor — DJ 5 years ahead, offer value first, ask second.", listen: "Mentorship accelerates everything." },
    ],
    listenFor: ["Plateaus = signal to change practice approach", "Burnout signs = need recovery week", "Production gaps = bookings ceiling"],
    mistakes: ["Plateau without changing practice — same input = same output.", "Skipping production — caps your bookings.", "Asking mentors for time without offering anything in return."],
    proMoves: ["Production + DJing together — strongest path to long career.", "Build a tribe: 5 DJs at your level, share music + feedback weekly.", "Treat DJing as a craft you'll practice for 30 years — not a sprint."],
    quizHard: [
      { q: "Why does production unlock bookings beyond pure DJing?", options: ["Promoters don't care", "Original tracks = unique offering + label/scene credibility + radio + streaming presence — all create booking demand", "Just luck", "Required by law"], answer: 1, explain: "Producers create their own demand; DJs depend on existing demand.", hint: "Producers make their own gravity." },
      { q: "Best way to break a plateau?", options: ["Practice more of the same", "Deliberate practice — identify weakness, design exercises targeting it, measure improvement", "Take a break only", "Buy new gear"], answer: 1, explain: "Plateau = repetitive practice ceiling. Change practice = change result.", hint: "Same practice, same plateau." },
      { q: "How to approach a mentor?", options: ["Ask for time immediately", "Offer value first (engage with their work, contribute, build relationship), ask for time later", "Just DM 'be my mentor'", "Pay upfront"], answer: 1, explain: "Mentors are over-asked; relationships beat requests.", hint: "Value first, ask second." },
    ],
    sources: [{ label: "DJ career practice", section: "Mastery path" }],
  },
};
