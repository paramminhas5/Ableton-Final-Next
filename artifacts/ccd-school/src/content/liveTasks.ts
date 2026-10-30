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
  checks: CheckSpec[];
}

const REVERBS = ["Reverb", "Hybrid", "Echo", "Delay", "FilterDelay"];
const INSTRUMENTS = ["InstrumentVector", "Operator", "Drift", "UltraAnalog", "InstrumentMeld", "OriginalSimpler", "MultiSampler"];

export const LIVE_TASKS: Record<string, LiveTask> = {
  "capture-midi": {
    title: "Play or draw some notes",
    task: "Make a MIDI clip with at least 8 notes in it. Play them in, or draw them. Save the Set.",
    xp: 20,
    checks: [{ id: "notes", label: "A MIDI clip with at least 8 notes", hint: "Make a MIDI track, create a clip, and add notes with the pencil or a keyboard.", check: { type: "midiNotes", min: 8 } }],
  },
  "tracks": {
    title: "Name your tracks",
    task: "Have at least two tracks and give every one of them your own name. Save the Set.",
    xp: 20,
    checks: [{ id: "named", label: "At least two tracks with your own names", hint: "Click a track name, press Cmd or Ctrl R, type a name.", check: { type: "namedTracks", min: 2 } }],
  },
  "arrangement-view": {
    title: "Fill sixteen bars",
    task: "Put clips in the Arrangement so the song runs at least 16 bars. Save the Set.",
    xp: 25,
    checks: [{ id: "bars", label: "Arrangement runs 16 bars or more", hint: "Press Tab for Arrangement View, then drag clips along the timeline or record a Session pass.", check: { type: "arrangementBeats", min: 64 } }],
  },
  "drum-rack": {
    title: "Program a drum beat",
    task: "Load a Drum Rack on a MIDI track, put samples on its pads and write at least 12 notes. Save the Set.",
    xp: 25,
    checks: [{ id: "drums", label: "A Drum Rack with at least 12 notes", hint: "Drag Drum Rack onto a MIDI track, drop samples on pads, then draw notes in a clip.", check: { type: "trackWith", classNames: ["DrumGroupDevice"], minNotes: 12 } }],
  },
  "bass-poli": {
    title: "Write a bass line",
    task: "Put a synth or sampler on a MIDI track and write at least 6 notes for a bass line. Save the Set.",
    xp: 25,
    checks: [{ id: "bass", label: "An instrument track with at least 6 notes", hint: "Load Wavetable, Operator or Drift, then draw a low pattern in a clip.", check: { type: "trackWith", classNames: INSTRUMENTS, minNotes: 6 } }],
  },
  "midi-piano-roll": {
    title: "Draw a chord progression",
    task: "Write notes on at least two MIDI tracks, for example chords and a bass line. Save the Set.",
    xp: 25,
    checks: [{ id: "tracks", label: "Two MIDI tracks that have notes", hint: "Make a second MIDI track and draw a clip on it too.", check: { type: "midiTracksWithNotes", min: 2 } }],
  },
  "scale-awareness": {
    title: "Lock a track to a scale",
    task: "Put the Scale MIDI effect on a MIDI track. Save the Set.",
    xp: 20,
    checks: [{ id: "scale", label: "A Scale device on a MIDI track", hint: "Search for Scale in the browser and drop it before the instrument.", check: { type: "device", classNames: ["MidiScale"], on: "midi" } }],
  },
  "eq-eight": {
    title: "Cut with EQ Eight",
    task: "Put EQ Eight on at least two tracks. Save the Set.",
    xp: 20,
    checks: [{ id: "eq", label: "EQ Eight on two or more tracks", hint: "Drop EQ Eight on a track, then do it again on another.", check: { type: "device", classNames: ["Eq8"], min: 2 } }],
  },
  "saturator-distortion": {
    title: "Add some grit",
    task: "Put Saturator on any track. Save the Set.",
    xp: 15,
    checks: [{ id: "sat", label: "A Saturator on a track", hint: "Search for Saturator in the browser and drop it on a track.", check: { type: "device", classNames: ["Saturator"] } }],
  },
  "compressor": {
    title: "Compress a track",
    task: "Put Compressor or Glue Compressor on any track. Save the Set.",
    xp: 20,
    checks: [{ id: "comp", label: "A Compressor or Glue Compressor", hint: "Search for Compressor in the browser and drop it on a track.", check: { type: "device", classNames: ["Compressor2", "GlueCompressor"] } }],
  },
  "sidechain": {
    title: "Duck the bass under the kick",
    task: "Put a Compressor on a track and set its Sidechain to listen to your kick. Save the Set.",
    xp: 30,
    checks: [{ id: "side", label: "A sidechained compressor", hint: "Open the Compressor's Sidechain section, switch it on and choose the kick track in Audio From.", check: { type: "sidechain" } }],
  },
  "sends-returns": {
    title: "Send to a reverb",
    task: "Put Reverb or a delay on a return track, then turn a send up on at least one track. Save the Set.",
    xp: 30,
    checks: [
      { id: "ret", label: "A reverb or delay on a return track", hint: "Cmd or Ctrl Alt T makes a return. Drop Reverb on it.", check: { type: "device", classNames: REVERBS, on: "return" } },
      { id: "send", label: "A track sending to it", hint: "Turn up a Send knob on a track.", check: { type: "sendUsed" } },
    ],
  },
  "groups-routing": {
    title: "Group your drums",
    task: "Select two or more tracks and group them with Cmd or Ctrl G. Save the Set.",
    xp: 25,
    checks: [{ id: "group", label: "A group holding at least two tracks", hint: "Select tracks with Shift, then press Cmd or Ctrl G.", check: { type: "groupWithChildren", minChildren: 2 } }],
  },
  "automation": {
    title: "Draw a move",
    task: "Draw automation with at least three breakpoints on any parameter in the Arrangement. Save the Set.",
    xp: 30,
    checks: [{ id: "auto", label: "Automation with 3 or more points", hint: "In Arrangement View press A for automation mode, pick a parameter and click to add points.", check: { type: "automation", minPoints: 3 } }],
  },
  "limiter-truepeak": {
    title: "Protect the master",
    task: "Put Limiter on the Master track. Save the Set.",
    xp: 20,
    checks: [{ id: "lim", label: "A Limiter on the Master", hint: "Drop Limiter at the end of the Master track's chain.", check: { type: "device", classNames: ["Limiter"], on: "master" } }],
  },
};
