/**
 * Part cards (9 Nov): one card per part and control, opened the first time it appears in a lesson, from a long
 * press in the studio, and kept in your wiki. Each says what it is, lets you hear your song with and without it,
 * says what it is for, puts its controls live on your song, names where you hear it, and where it is in Live.
 * `heard` names styles for now; named records go in only after each one is checked (waiting on Param's yes).
 */
export type PartCard = {
  id: string;
  name: string;
  /** The layer type in your song this card works on. */
  layer: string;
  line: string;
  forWhat: string;
  /** Param keys from the part's sound bank, played live on your song. */
  knobs: { key: string; does: string }[];
  heard: { where: string; listen: string }[];
  live: string;
  lessons: string[];
};

export const PARTS: PartCard[] = [
  {
    id: "hats",
    name: "hats",
    layer: "hats",
    line: "the short, bright tick that keeps time between your kicks.",
    forWhat: "the kick says where each beat is. the hats fill the gaps in between, so the song feels like it keeps moving forward. a closed hat is a short tick; an open hat rings on for longer.",
    knobs: [
      { key: "decay", does: "how long each hit rings. short is tight and closed, long opens it up" },
      { key: "tune", does: "how high or low it sits. higher sounds smaller and crisper" },
    ],
    heard: [
      { where: "classic house", listen: "an open hat on every \"and\", between the kicks" },
      { where: "uk garage", listen: "hats that swing, so the gaps are uneven" },
      { where: "trap", listen: "fast rolls of closed hats that speed up and slow down" },
    ],
    live: "hats sit on a pad in the Drum Rack. put the closed and the open hat in the same choke group, so the closed one cuts the open one off, the way a real hi-hat does.",
    lessons: ["hats", "noise", "syncopation", "groove-feel"],
  },
];

export const partCard = (id: string) => PARTS.find(p => p.id === id);
