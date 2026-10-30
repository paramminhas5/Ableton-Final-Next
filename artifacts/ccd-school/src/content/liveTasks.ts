import type { CheckSpec } from "../lib/setstate/checker";

/**
 * "Do it in Live": a small job at the end of a lesson that is checked against the learner's real Set.
 * Reuses the same data-driven checks as Build a Set. Keyed by lesson slug; tests make sure every slug exists.
 */
export interface LiveTask {
  title: string;
  /** what to do, in Live */
  task: string;
  xp: number;
  /** how to do it, one line per step, Live 12 */
  steps: string[];
  /** the mistake people usually make */
  mistake: string;
  checks: CheckSpec[];
}

const REVERBS = ["Reverb", "Hybrid", "Echo", "Delay", "FilterDelay"];
const INSTRUMENTS = ["InstrumentVector", "Operator", "Drift", "UltraAnalog", "InstrumentMeld", "OriginalSimpler", "MultiSampler"];

export const LIVE_TASKS: Record<string, LiveTask> = {
  "capture-midi": {
    title: "Play or draw some notes",
    task: "Make a MIDI clip with at least 8 notes in it. Play them in, or draw them. Save the Set.",
    xp: 20,
    steps: ["Make a MIDI track with an instrument on it and click its arm button.", "Press M to turn on the computer keyboard as a MIDI keyboard, or plug in a real one.", "Play something. Do not press record.", "Press Cmd/Ctrl + Shift + Enter, or click the Capture MIDI button next to the transport. Live makes a clip from what you just played."],
    mistake: "Capture only listens to armed tracks. If nothing appears, check the arm button first.",
    checks: [{ id: "notes", label: "A MIDI clip with at least 8 notes", hint: "Make a MIDI track, create a clip, and add notes with the pencil or a keyboard.", check: { type: "midiNotes", min: 8 } }],
  },
  "tracks": {
    title: "Name your tracks",
    task: "Have at least two tracks and give every one of them your own name. Save the Set.",
    xp: 20,
    steps: ["Press Cmd/Ctrl + Shift + T for a MIDI track and Cmd/Ctrl + T for an audio track.", "Click a track title and press Cmd/Ctrl + R to rename it.", "Name every track by what it does: Kick, Bass, Chords, Lead.", "Save with Cmd/Ctrl + S."],
    mistake: "Leaving names as 'MIDI' and 'Audio' works until you have twelve tracks. Name them while it is still easy.",
    checks: [{ id: "named", label: "At least two tracks with your own names", hint: "Click a track name, press Cmd or Ctrl R, type a name.", check: { type: "namedTracks", min: 2 } }],
  },
  "arrangement-view": {
    title: "Fill sixteen bars",
    task: "Put clips in the Arrangement so the song runs at least 16 bars. Save the Set.",
    xp: 25,
    steps: ["Press Tab to switch between Session and Arrangement.", "Make a 4 bar clip, or select one in Session View and copy it with Cmd/Ctrl + C.", "In Arrangement View, click the track at bar 1 and paste with Cmd/Ctrl + V.", "Select the clip and press Cmd/Ctrl + D three times. Each press places a copy right after the last one.", "Do the same on a second track so the song is not just one loop."],
    mistake: "Pasting puts the clip where the insert marker is. If it lands in the wrong place, click the timeline first.",
    checks: [{ id: "bars", label: "Arrangement runs 16 bars or more", hint: "Press Tab for Arrangement View, then drag clips along the timeline or record a Session pass.", check: { type: "arrangementBeats", min: 64 } }],
  },
  "drum-rack": {
    title: "Program a drum beat",
    task: "Load a Drum Rack on a MIDI track, put samples on its pads and write at least 12 notes. Save the Set.",
    xp: 25,
    steps: ["Drag Drum Rack from Instruments in the browser onto a MIDI track.", "Drag a kick, a snare and a hat from the Drums folder onto three pads.", "With the track selected press Cmd/Ctrl + Shift + M to insert a MIDI clip.", "Press B for draw mode and click notes in. The kick pad is C1 by default.", "Press play and listen. You need at least 12 notes."],
    mistake: "Pads with no sample are silent. If a row of notes makes no sound, that pad is empty.",
    checks: [{ id: "drums", label: "A Drum Rack with at least 12 notes", hint: "Drag Drum Rack onto a MIDI track, drop samples on pads, then draw notes in a clip.", check: { type: "trackWith", classNames: ["DrumGroupDevice"], minNotes: 12 } }],
  },
  "bass-poli": {
    title: "Write a bass line",
    task: "Put a synth or sampler on a MIDI track and write at least 6 notes for a bass line. Save the Set.",
    xp: 25,
    steps: ["Drag Wavetable, Operator or Drift onto a MIDI track.", "Pick a preset from the Bass folder.", "Insert a clip with Cmd/Ctrl + Shift + M and draw 6 or more notes around C1 to C2.", "Keep notes short and leave gaps where the kick lands."],
    mistake: "Bass notes that sit on top of each other turn to mud. One note at a time, with a gap, sounds tighter.",
    checks: [{ id: "bass", label: "An instrument track with at least 6 notes", hint: "Load Wavetable, Operator or Drift, then draw a low pattern in a clip.", check: { type: "trackWith", classNames: INSTRUMENTS, minNotes: 6 } }],
  },
  "midi-piano-roll": {
    title: "Draw a chord progression",
    task: "Write notes on at least two MIDI tracks, for example chords and a bass line. Save the Set.",
    xp: 25,
    steps: ["Make two MIDI tracks, one with a chord sound and one with a bass sound.", "On the first, draw four chords of three notes each, one per bar.", "On the second, draw the root note of each chord in a lower octave.", "Open the clip and use the Scale options to see which notes fit the key."],
    mistake: "Chords that change every bar are easy to follow. Start there before you try faster changes.",
    checks: [{ id: "tracks", label: "Two MIDI tracks that have notes", hint: "Make a second MIDI track and draw a clip on it too.", check: { type: "midiTracksWithNotes", min: 2 } }],
  },
  "scale-awareness": {
    title: "Lock a track to a scale",
    task: "Put the Scale MIDI effect on a MIDI track. Save the Set.",
    xp: 20,
    steps: ["Select a MIDI track that has an instrument on it.", "Drag Scale from MIDI Effects in the browser onto that track, to the left of the instrument.", "Set Base to your key and choose the scale name, for example C Minor.", "Play or draw notes. Anything outside the scale is moved to the nearest note inside it."],
    mistake: "Scale changes notes on the way in. If it sits after the instrument, it does nothing. Put it first in the chain.",
    checks: [{ id: "scale", label: "A Scale device on a MIDI track", hint: "Search for Scale in the browser and drop it before the instrument.", check: { type: "device", classNames: ["MidiScale"], on: "midi" } }],
  },
  "eq-eight": {
    title: "Cut with EQ Eight",
    task: "Put EQ Eight on at least two tracks. Save the Set.",
    xp: 20,
    steps: ["Drag EQ Eight from Audio Effects onto a track that is not the bass or kick.", "Turn on band 1 and set it to the 48 dB low cut. Put it near 30 to 40 Hz.", "Do the same on a second track.", "Open the Spectrum view in EQ Eight and watch what your cut removes."],
    mistake: "Cuts sound natural and boosts sound obvious. If a track sounds dull, try cutting what is covering it before you boost.",
    checks: [{ id: "eq", label: "EQ Eight on two or more tracks", hint: "Drop EQ Eight on a track, then do it again on another.", check: { type: "device", classNames: ["Eq8"], min: 2 } }],
  },
  "saturator-distortion": {
    title: "Add some grit",
    task: "Put Saturator on any track. Save the Set.",
    xp: 15,
    steps: ["Drag Saturator from Audio Effects onto any track.", "Turn Drive up until you hear the sound get thicker.", "Pull Output down so the loudness stays the same.", "Click the device on and off. If you only like it louder, you do not like it."],
    mistake: "Louder always sounds better. Match the level first, then decide.",
    checks: [{ id: "sat", label: "A Saturator on a track", hint: "Search for Saturator in the browser and drop it on a track.", check: { type: "device", classNames: ["Saturator"] } }],
  },
  "compressor": {
    title: "Compress a track",
    task: "Put Compressor or Glue Compressor on any track. Save the Set.",
    xp: 20,
    steps: ["Drag Compressor from Dynamics onto a track.", "Lower Threshold until the gain reduction meter moves 3 to 6 dB on the loud parts.", "Set Ratio around 4:1, Attack 10 to 30 ms and Release 100 to 200 ms.", "Raise Output to make up the lost level, then click the device on and off to compare."],
    mistake: "Heavy compression flattens the groove. If the track feels dead, back off the ratio.",
    checks: [{ id: "comp", label: "A Compressor or Glue Compressor", hint: "Search for Compressor in the browser and drop it on a track.", check: { type: "device", classNames: ["Compressor2", "GlueCompressor"] } }],
  },
  "sidechain": {
    title: "Duck the bass under the kick",
    task: "Put a Compressor on a track and set its Sidechain to listen to your kick. Save the Set.",
    xp: 30,
    steps: ["Drag Compressor onto the bass track.", "Click the small triangle at the top left of the Compressor to open its Sidechain section.", "Switch Sidechain on, then choose your kick track in Audio From.", "Lower Threshold until you see the gain reduction meter move on every kick.", "Set Attack to about 0.1 ms and Release to 100 to 200 ms."],
    mistake: "The Listen button in the sidechain section plays the trigger signal instead of your track. Leave it off or you will hear the kick, not the bass.",
    checks: [{ id: "side", label: "A sidechained compressor", hint: "Open the Compressor's Sidechain section, switch it on and choose the kick track in Audio From.", check: { type: "sidechain" } }],
  },
  "sends-returns": {
    title: "Send to a reverb",
    task: "Put Reverb or a delay on a return track, then turn a send up on at least one track. Save the Set.",
    xp: 30,
    steps: ["Press Cmd/Ctrl + Alt + T to add a return track.", "Drag Reverb onto the return and set its Dry/Wet to 100%.", "On one or more tracks, turn up the Send A knob.", "Play and listen: turning the send up gives you more reverb without touching the return."],
    mistake: "Reverb on a return is always 100% wet. If the Dry/Wet is lower, the dry sound is doubled up.",
    checks: [
      { id: "ret", label: "A reverb or delay on a return track", hint: "Cmd or Ctrl Alt T makes a return. Drop Reverb on it.", check: { type: "device", classNames: REVERBS, on: "return" } },
      { id: "send", label: "A track sending to it", hint: "Turn up a Send knob on a track.", check: { type: "sendUsed" } },
    ],
  },
  "groups-routing": {
    title: "Group your drums",
    task: "Select two or more tracks and group them with Cmd or Ctrl G. Save the Set.",
    xp: 25,
    steps: ["Click the first drum track, then Shift + click the last one to select them.", "Press Cmd/Ctrl + G. Live puts them in a group track.", "Drag Glue Compressor onto the group track and bring Threshold down for 1 to 3 dB of reduction.", "Collapse the group with the arrow to keep the Set tidy."],
    mistake: "A group is a bus. Put processing on the group when you want the tracks to move together.",
    checks: [{ id: "group", label: "A group holding at least two tracks", hint: "Select tracks with Shift, then press Cmd or Ctrl G.", check: { type: "groupWithChildren", minChildren: 2 } }],
  },
  "automation": {
    title: "Draw a move",
    task: "Draw automation with at least three breakpoints on any parameter in the Arrangement. Save the Set.",
    xp: 30,
    steps: ["Press Tab for Arrangement View, then A to turn on Automation Mode.", "Pick a device and parameter in the two choosers under the track name, for example Auto Filter Frequency.", "Click on the lane to add breakpoints. You need at least three.", "Play it through and watch the control move."],
    mistake: "If the Re-Enable Automation button turns orange, you moved a control by hand and Live stopped following the lane. Click it.",
    checks: [{ id: "auto", label: "Automation with 3 or more points", hint: "In Arrangement View press A for automation mode, pick a parameter and click to add points.", check: { type: "automation", minPoints: 3 } }],
  },
  "limiter-truepeak": {
    title: "Protect the master",
    task: "Put Limiter on the Master track. Save the Set.",
    xp: 20,
    steps: ["Click the Master track.", "Drag Limiter from Dynamics to the end of the Master chain.", "Set the Ceiling to -1.0 dB.", "Raise Gain slowly until peaks touch the ceiling. Stop before it sounds crunchy."],
    mistake: "A limiter is a safety net, not a volume knob. If you need more than 3 or 4 dB of gain reduction, fix the mix first.",
    checks: [{ id: "lim", label: "A Limiter on the Master", hint: "Drop Limiter at the end of the Master track's chain.", check: { type: "device", classNames: ["Limiter"], on: "master" } }],
  },
  "midi-effects": {
    title: "Play one note, hear a chord",
    task: "Put Arpeggiator or Chord on a MIDI track, before the instrument. Save the Set.",
    xp: 20,
    steps: ["Pick a MIDI track that has an instrument.", "Drag Chord or Arpeggiator from MIDI Effects onto the track, to the left of the instrument.", "Play or draw a single note and listen to what comes out.", "Change the Shift values in Chord, or Rate in Arpeggiator, and listen again."],
    mistake: "MIDI effects change the notes before the instrument hears them. After the instrument they do nothing.",
    checks: [
      { id: "fx", label: "A Chord or Arpeggiator on a MIDI track", hint: "Search for Chord or Arpeggiator in the browser and drop it before the instrument.", check: {"type": "device", "classNames": ["MidiChord", "MidiArpeggiator"], "on": "midi"} },
    ],
  },
  "midi-effects-tour": {
    title: "Add some life with MIDI effects",
    task: "Put Random or Velocity on a MIDI track. Save the Set.",
    xp: 20,
    steps: ["Pick a MIDI track, ideally a hi-hat or arp.", "Drag Velocity or Random from MIDI Effects onto it, before the instrument.", "Set a low Chance on Random, or Randomize on Velocity.", "Play it back. Every loop should differ a little."],
    mistake: "A little goes a long way. Full randomness sounds broken, not human.",
    checks: [
      { id: "fx", label: "A Random or Velocity device on a MIDI track", hint: "Search for Random or Velocity in the MIDI Effects folder.", check: {"type": "device", "classNames": ["MidiRandom", "MidiVelocity"], "on": "midi"} },
    ],
  },
  "racks-macros": {
    title: "Build a rack",
    task: "Group a device into an Audio Effect Rack. Save the Set.",
    xp: 25,
    steps: ["Drop two or three effects on a track, for example EQ Eight and Saturator.", "Select them all and press Cmd/Ctrl + G. They go into an Audio Effect Rack.", "Click Show/Hide Macros at the rack's left edge.", "Right-click a knob inside and choose Map to Macro 1."],
    mistake: "Grouping with Cmd/Ctrl + G inside a device chain makes a rack. Grouping tracks uses the same shortcut but makes a group track.",
    checks: [
      { id: "rack", label: "An Audio Effect Rack on a track", hint: "Select devices in the chain and press Cmd/Ctrl + G.", check: {"type": "device", "classNames": ["AudioEffectGroupDevice"]} },
    ],
  },
  "instrument-rack": {
    title: "Layer two sounds",
    task: "Build an Instrument Rack on a MIDI track. Save the Set.",
    xp: 25,
    steps: ["Drop an instrument on a MIDI track.", "Press Cmd/Ctrl + G to wrap it in an Instrument Rack.", "Drag a second instrument into the rack's chain list so you have two chains.", "Play a note: both chains sound."],
    mistake: "Layers fight for the same frequencies. Pull one chain down or high-pass it so they do not turn to mud.",
    checks: [
      { id: "rack", label: "An Instrument Rack on a track", hint: "Select the instrument and press Cmd/Ctrl + G.", check: {"type": "device", "classNames": ["InstrumentGroupDevice"]} },
    ],
  },
  "sampler-simpler": {
    title: "Play a sample",
    task: "Load Simpler on a MIDI track and write at least 4 notes. Save the Set.",
    xp: 25,
    steps: ["Drag Simpler from Instruments onto a MIDI track, or drag a sample straight onto the track.", "Drop a sample onto Simpler's waveform area.", "Insert a clip with Cmd/Ctrl + Shift + M and draw 4 or more notes.", "Try Classic, One-Shot and Slice modes at the top and listen."],
    mistake: "A sample plays higher or lower depending on the note. If it sounds wrong, check the Transpose setting.",
    checks: [
      { id: "simpler", label: "Simpler or Sampler on a track with at least 4 notes", hint: "Load Simpler, drop in a sample, then draw notes in a clip.", check: {"type": "trackWith", "classNames": ["OriginalSimpler", "MultiSampler"], "minNotes": 4} },
    ],
  },
  "wavetable": {
    title: "Make a Wavetable patch",
    task: "Put Wavetable on a MIDI track and write at least 4 notes. Save the Set.",
    xp: 25,
    steps: ["Drag Wavetable from Instruments onto a MIDI track.", "Pick a wavetable from Oscillator 1's chooser.", "Draw 4 or more notes in a clip.", "Play and move the Wave Position slider while a note rings."],
    mistake: "Wavetable is Suite only. On Standard or Intro, use Drift or Analog instead.",
    checks: [
      { id: "wt", label: "Wavetable on a track with at least 4 notes", hint: "Drop Wavetable on a MIDI track and draw notes.", check: {"type": "trackWith", "classNames": ["InstrumentVector"], "minNotes": 4} },
    ],
  },
  "operator": {
    title: "Make an FM sound",
    task: "Put Operator on a MIDI track and write at least 4 notes. Save the Set.",
    xp: 25,
    steps: ["Drag Operator from Instruments onto a MIDI track.", "Turn on Oscillator B and raise its level a little to hear it modulate A.", "Draw 4 or more notes.", "Change B's Coarse value in whole steps and listen to the tone change."],
    mistake: "FM is sensitive. Small moves in level change the tone a lot. Go slowly.",
    checks: [
      { id: "op", label: "Operator on a track with at least 4 notes", hint: "Drop Operator on a MIDI track and draw notes.", check: {"type": "trackWith", "classNames": ["Operator"], "minNotes": 4} },
    ],
  },
  "drift": {
    title: "Make a Drift patch",
    task: "Put Drift on a MIDI track and write at least 4 notes. Save the Set.",
    xp: 20,
    steps: ["Drag Drift from Instruments onto a MIDI track.", "Draw 4 or more notes in a clip.", "Turn Drift up a little for analog-style wobble.", "Shape the sound with the filter and the envelopes."],
    mistake: "Drift's wobble is part of its character. If the pitch feels loose, turn Drift down.",
    checks: [
      { id: "drift", label: "Drift on a track with at least 4 notes", hint: "Drop Drift on a MIDI track and draw notes.", check: {"type": "trackWith", "classNames": ["Drift"], "minNotes": 4} },
    ],
  },
  "glue-compressor": {
    title: "Glue your drums",
    task: "Put Glue Compressor on a group track. Save the Set.",
    xp: 25,
    steps: ["Group your drum tracks with Cmd/Ctrl + G.", "Drag Glue Compressor onto the group track.", "Set Attack to 10 to 30 ms and Release to Auto or 0.2 s.", "Lower the Threshold until you see 1 to 3 dB of gain reduction."],
    mistake: "Glue works by being gentle. If you hear it pumping, back off the threshold.",
    checks: [
      { id: "glue", label: "Glue Compressor on a group track", hint: "Group some tracks first, then drop Glue Compressor on the group.", check: {"type": "device", "classNames": ["GlueCompressor"], "on": "group"} },
    ],
  },
  "reverb-delay": {
    title: "Send a vocal to space",
    task: "Put a reverb or delay on a return track. Save the Set.",
    xp: 25,
    steps: ["Press Cmd/Ctrl + Alt + T to make a return track.", "Drop Reverb, Echo or Delay on it.", "On the return, set Dry/Wet to 100%.", "Turn up the Send on a track and listen to the space."],
    mistake: "If everything is soaked in reverb, nothing is close. Send only some tracks.",
    checks: [
      { id: "ret", label: "A reverb or delay on a return track", hint: "Make a return with Cmd/Ctrl + Alt + T and drop a reverb or delay on it.", check: {"type": "device", "classNames": ["Reverb", "Hybrid", "Echo", "Delay", "FilterDelay"], "on": "return"} },
    ],
  },
  "roar": {
    title: "Shape with Roar",
    task: "Put Roar on any track. Save the Set.",
    xp: 20,
    steps: ["Drag Roar from Audio Effects onto a drum or bass track.", "Pick a Shaper type in the Roar display and raise Drive.", "Use Dry/Wet to blend it back.", "Click the device on and off to compare, with levels matched."],
    mistake: "Roar is Suite only. On other editions, Saturator and Overdrive do much of the same job.",
    checks: [
      { id: "roar", label: "A Roar on a track", hint: "Search for Roar in Audio Effects and drop it on a track.", check: {"type": "device", "classNames": ["Roar"]} },
    ],
  },
};
