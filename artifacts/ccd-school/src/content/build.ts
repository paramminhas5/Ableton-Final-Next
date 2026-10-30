import type { CheckSpec } from "@/lib/setstate/checker";

/**
 * "Build a Set": nine stages, in the order a first track usually comes together.
 * Learners upload their saved Set after each stage; every stage is checked against the
 * Set as it stands, so earlier stages must still hold.
 */
export interface BuildStage {
  id: string;
  title: string;
  /** what to do in Live, in plain words */
  task: string;
  /** why a producer does it */
  why: string;
  xp: number;
  /** atlas ids worth reading first */
  learn: string[];
  checks: CheckSpec[];
}

const INSTRUMENTS = ["InstrumentVector", "Operator", "Drift", "UltraAnalog", "InstrumentMeld", "OriginalSimpler", "MultiSampler", "LoungeLizard", "StringStudio", "Collision"];

export const BUILD_STAGES: BuildStage[] = [
  {
    id: "tempo", title: "Pick a tempo", xp: 10, learn: [],
    task: "Set the tempo to something other than 120 and save. Pick a speed that suits your genre: house around 120 to 128, hip hop 80 to 95, drum and bass about 170.",
    why: "Tempo decides the feel before a single note exists. Choosing it on purpose beats living with the default.",
    checks: [{ id: "tempo", label: "Tempo set between 60 and 200, and not left at 120", hint: "Click the tempo box at the top left of Live, type a number and press Enter.", check: { type: "tempo", min: 60, max: 200, not: 120 } }],
  },
  {
    id: "drums", title: "Program a drum beat", xp: 30, learn: ["drum-rack"],
    task: "Put a Drum Rack on a MIDI track, drop in a kick, snare and hi-hat, and write a one or two bar pattern.",
    why: "Drums set the groove everything else locks to.",
    checks: [{ id: "drumrack", label: "A Drum Rack on a track with at least 12 notes", hint: "Drag Drum Rack onto a MIDI track, drag samples onto its pads, then draw notes in a clip.", check: { type: "trackWith", classNames: ["DrumGroupDevice"], minNotes: 12 } }],
  },
  {
    id: "bass", title: "Add a bass line", xp: 30, learn: ["drift", "wavetable"],
    task: "Add a MIDI track with a synth and play or draw a bass line that follows your kick.",
    why: "Bass and kick together are the foundation of the low end.",
    checks: [{ id: "bass", label: "A synth or sampler track with at least 4 notes", hint: "Drag Drift or Wavetable onto a new MIDI track and draw a few low notes.", check: { type: "trackWith", classNames: INSTRUMENTS, minNotes: 4 } }],
  },
  {
    id: "harmony", title: "Add chords or a melody", xp: 30, learn: ["chord", "scale"],
    task: "Add a third MIDI track with chords or a melody on top of the bass.",
    why: "Harmony gives the track a mood. Drums, bass and one more part is a complete idea.",
    checks: [{ id: "tracks", label: "Three MIDI tracks with notes", hint: "Create another MIDI track and add a pad or lead with notes.", check: { type: "midiTracksWithNotes", min: 3 } }],
  },
  {
    id: "names", title: "Name every track", xp: 15, learn: [],
    task: "Rename each track (Ctrl or Cmd + R) so a stranger could read your Set.",
    why: "A readable Set is a Set you finish.",
    checks: [{ id: "named", label: "Every track has your own name", hint: "Select a track and press Ctrl/Cmd + R.", check: { type: "namedTracks" } }],
  },
  {
    id: "space", title: "Add shared space", xp: 30, learn: ["reverb", "echo"],
    task: "Add a return track with Reverb (or Echo) and turn up the Send on at least one track.",
    why: "One shared space makes separate parts sound like they are in the same room.",
    checks: [
      { id: "return-fx", label: "Reverb or delay on a return track", hint: "Add a return with Ctrl/Cmd + Alt + T and drop Reverb on it.", check: { type: "device", classNames: ["Reverb", "Hybrid", "Echo", "Delay", "FilterDelay"], on: "return" } },
      { id: "send", label: "At least one track sends to it", hint: "Raise a Send knob to about 20 percent.", check: { type: "sendUsed" } },
    ],
  },
  {
    id: "duck", title: "Make the bass duck under the kick", xp: 40, learn: ["compressor"],
    task: "Put a Compressor on the bass, switch on its sidechain, and choose your kick as the source.",
    why: "It clears the low end so the kick hits clean and the track pumps.",
    checks: [
      { id: "comp", label: "A Compressor on a track", hint: "Drag Compressor onto the bass track.", check: { type: "device", classNames: ["Compressor2", "GlueCompressor"] } },
      { id: "sc", label: "Its sidechain is fed by another track", hint: "Open Sidechain in the compressor, turn it on, set Audio From to the kick track.", check: { type: "sidechain" } },
    ],
  },
  {
    id: "arrange", title: "Arrange 16 bars", xp: 40, learn: [],
    task: "Switch to Arrangement view and place clips so the track runs for at least 16 bars. Add and remove parts to build a start, a middle and a drop.",
    why: "A loop is not a song. Arrangement is where the track moves.",
    checks: [{ id: "arr", label: "Arrangement runs at least 16 bars", hint: "Press Tab for Arrangement view, then drag clips from Session onto the timeline.", check: { type: "arrangementBeats", min: 64 } }],
  },
  {
    id: "master", title: "Protect the main output", xp: 25, learn: ["limiter"],
    task: "Put a Limiter on the Main track so the whole mix cannot clip.",
    why: "It is the safety net. Without it, a loud moment can distort.",
    checks: [{ id: "limiter", label: "Limiter on the Main track", hint: "Drag Limiter onto the Main track at the right of the mixer.", check: { type: "device", classNames: ["Limiter"], on: "master" } }],
  },
];
