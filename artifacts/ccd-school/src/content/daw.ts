/**
 * Where things are in each DAW (10 Nov), for the "in your daw" panel inside lessons. Written conservatively:
 * the place on screen and the standard way to do it. Photos and videos come later with the DAW packs.
 * A lesson names topics in a fold titled "in your daw · tempo, metronome, tap".
 */
export type DawId = "live" | "fl" | "logic";
export const DAWS: { id: DawId; name: string }[] = [
  { id: "live", name: "Ableton Live" },
  { id: "fl", name: "FL Studio" },
  { id: "logic", name: "Logic Pro" },
];

/** One control: its name in that DAW, where it sits (a zone of the top bar, left to right), and how to use it. */
export type DawControl = { name: string; zone: "left" | "middle" | "right" | "editor"; how: string };
export const DAW_TOPICS: Record<string, { label: string } & Record<DawId, DawControl>> = {
  tempo: {
    label: "tempo",
    live: { name: "Tempo field", zone: "left", how: "In the Control Bar along the top, near the left. Click the number and type a new tempo, or drag it up and down." },
    fl: { name: "Tempo (BPM)", zone: "middle", how: "In the toolbar at the top, next to the play and record buttons. Click and drag the number, or right-click it to type a value." },
    logic: { name: "Tempo", zone: "middle", how: "In the display in the middle of the control bar. Double-click the tempo and type a new value, or drag it." },
  },
  metronome: {
    label: "metronome",
    live: { name: "Metronome", zone: "left", how: "The button with two circles, at the left of the Control Bar. Its small menu next to it sets the count-in before recording." },
    fl: { name: "Metronome", zone: "middle", how: "The metronome button in the transport toolbar, beside the tempo. The button next to it turns on a countdown before recording." },
    logic: { name: "Metronome", zone: "middle", how: "The metronome button in the control bar; press K to turn it on and off. Count-in is set in the record settings." },
  },
  tap: {
    label: "tap tempo",
    live: { name: "Tap", zone: "left", how: "The Tap button just left of the tempo field. Tap it on the beat a few times and Live sets the tempo to match." },
    fl: { name: "Tap tempo", zone: "middle", how: "Right-click the tempo and choose Tap. Tap along on the beat and FL sets the tempo." },
    logic: { name: "Tap tempo", zone: "middle", how: "Assign the Tap Tempo key command, then tap it on the beat to set the tempo." },
  },
  quantise: {
    label: "quantise",
    live: { name: "Quantize", zone: "editor", how: "Select the notes in a clip and press Cmd+U (Mac) or Ctrl+U (Windows). Shift plus the same keys opens the settings: grid size and amount." },
    fl: { name: "Quick quantize", zone: "editor", how: "In the piano roll, select the notes and press Ctrl+Q to snap their starts to the grid. Alt+Q opens the full quantize tool." },
    logic: { name: "Quantize", zone: "editor", how: "Select the region or notes and press Q. The Quantize value in the region inspector sets the grid, such as 1/16." },
  },
  swing: {
    label: "swing",
    live: { name: "Groove Pool", zone: "editor", how: "Drag a swing groove from the browser's Grooves onto a clip, then set its amount in the Groove Pool. Or quantize with a swung grid." },
    fl: { name: "Swing knob", zone: "editor", how: "The Swing knob at the top of the Channel Rack swings every step pattern at once." },
    logic: { name: "Q-Swing", zone: "editor", how: "In the region inspector, set Quantize to a sixteenth and turn up Q-Swing." },
  },
};

/** "in your daw · tempo, metronome, tap" gives the topics; anything else gives none. */
export function dawTopicsOf(title: string): string[] | null {
  const m = /^in (?:your daw|live)\s*·\s*(.+)$/i.exec(title.trim());
  if (!m) return null;
  return m[1].split(/\s*,\s*/).map(t => t.toLowerCase()).filter(t => t in DAW_TOPICS);
}
