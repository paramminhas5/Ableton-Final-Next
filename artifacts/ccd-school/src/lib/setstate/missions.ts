import type { MissionSpec } from "./checker";

/**
 * Missions checked against the learner's own Live Set. Each one is a habit that
 * matters in real sessions, not a trick. Device class names are Live's internal ones.
 */
export const SET_MISSIONS: MissionSpec[] = [
  {
    id: "name-your-tracks",
    title: "Name every track",
    why: "A Set you can read at a glance is a Set you finish. Naming takes ten seconds and saves hours later.",
    checks: [
      {
        id: "named",
        label: "Every track has your own name",
        hint: "Select a track and press Cmd/Ctrl+R to rename it. Try Kick, Bass, Lead instead of 1-MIDI.",
        check: { type: "namedTracks" },
      },
    ],
  },
  {
    id: "pump-the-bass",
    title: "Make the bass duck under the kick",
    why: "Kick and bass fight for the same low frequencies. Sidechain compression lets the kick through first.",
    checks: [
      {
        id: "comp",
        label: "A Compressor on your bass track",
        hint: "Drag Compressor onto the bass track from Audio Effects.",
        check: { type: "device", classNames: ["Compressor2", "GlueCompressor"] },
      },
      {
        id: "sc",
        label: "Its sidechain is fed by another track",
        hint: "Open the compressor, click the small arrow to show Sidechain, switch it on and pick your kick track in Audio From.",
        check: { type: "sidechain" },
      },
    ],
  },
  {
    id: "drum-bus",
    title: "Glue your drums on a group",
    why: "Processing a group treats the kit as one instrument, which is how drums start to sound like a record.",
    checks: [
      {
        id: "group",
        label: "A group with at least two tracks inside",
        hint: "Select two drum tracks and press Cmd/Ctrl+G.",
        check: { type: "groupWithChildren", minChildren: 2 },
      },
      {
        id: "bus-fx",
        label: "A compressor or EQ on the group",
        hint: "Drop Glue Compressor or EQ Eight on the group track's header, not on the single drums.",
        check: { type: "device", classNames: ["GlueCompressor", "Compressor2", "Eq8", "FilterEQ3"], on: "group" },
      },
    ],
  },
  {
    id: "space-with-a-return",
    title: "Add space with a return track",
    why: "One shared reverb makes a mix sound like it sits in a single room, and costs far less CPU than one per track.",
    checks: [
      {
        id: "return-fx",
        label: "Reverb or delay on a return track",
        hint: "Add a return with Cmd/Ctrl+Alt+T, then drop Reverb or Echo on it.",
        check: { type: "device", classNames: ["Reverb", "Hybrid", "Echo", "Delay", "FilterDelay"], on: "return" },
      },
      {
        id: "send",
        label: "At least one track sends to it",
        hint: "Turn up a Send knob on a track. Start low, around 20 percent.",
        check: { type: "sendUsed" },
      },
    ],
  },
];
