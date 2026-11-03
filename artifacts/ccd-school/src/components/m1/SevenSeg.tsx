/** A seven-segment LED readout: digits, minus, point and colon. Unlit segments stay faintly visible. */
const SEG: Record<string, string> = {
  "0": "abcdef", "1": "bc", "2": "abged", "3": "abgcd", "4": "fgbc", "5": "afgcd", "6": "afgedc", "7": "abc", "8": "abcdefg", "9": "abcdfg", "-": "g", " ": "",
};
const W = 26, H = 46, T = 5;
const PATH: Record<string, string> = {
  a: `M${T + 1} 1h${W - 2 * T - 2}l-${T / 2} ${T}h-${W - 3 * T - 2}z`,
  b: `M${W - 1} ${T + 1}v${H / 2 - T - 2}l-${T} -${T / 2}v-${H / 2 - 2 * T - 1}z`,
  c: `M${W - 1} ${H / 2 + 1}v${H / 2 - T - 2}l-${T} -${T / 2}v-${H / 2 - 2 * T - 1}z`,
  d: `M${T + 1} ${H - 1}h${W - 2 * T - 2}l-${T / 2} -${T}h-${W - 3 * T - 2}z`,
  e: `M1 ${H / 2 + 1}v${H / 2 - T - 2}l${T} -${T / 2}v-${H / 2 - 2 * T - 1}z`,
  f: `M1 ${T + 1}v${H / 2 - T - 2}l${T} -${T / 2}v-${H / 2 - 2 * T - 1}z`,
  g: `M${T} ${H / 2}l${T / 2} -${T / 2}h${W - 3 * T}l${T / 2} ${T / 2}l-${T / 2} ${T / 2}h-${W - 3 * T}z`,
};

export function SevenSeg({ text, color, digits = 3, height = 46 }: { text: string; color: string; digits?: number; height?: number }) {
  // Split into cells: a digit cell can carry a point after it; a colon is its own narrow cell.
  const cells: { ch: string; dot: boolean }[] = [];
  for (const ch of text) {
    if (ch === "." && cells.length) cells[cells.length - 1].dot = true;
    else cells.push({ ch, dot: false });
  }
  const digitCells = cells.filter(c => c.ch !== ":").length;
  for (let i = digitCells; i < digits; i++) cells.unshift({ ch: " ", dot: false });
  let x = 0;
  const parts = cells.map((c, i) => {
    const at = x;
    if (c.ch === ":") {
      x += 12;
      return <g key={i}><circle cx={at + 6} cy={H * 0.32} r={2.6} fill={color} /><circle cx={at + 6} cy={H * 0.68} r={2.6} fill={color} /></g>;
    }
    x += W + 6;
    const on = SEG[c.ch.toLowerCase()] ?? "";
    return (
      <g key={i} transform={`translate(${at} 0) skewX(-6)`}>
        {Object.entries(PATH).map(([k, d]) => <path key={k} d={d} fill={on.includes(k) ? color : "currentColor"} opacity={on.includes(k) ? 1 : 0.09} style={on.includes(k) ? { filter: `drop-shadow(0 0 3px ${color})` } : undefined} />)}
        <circle cx={W + 3} cy={H - 3} r={2.4} fill={c.dot ? color : "currentColor"} opacity={c.dot ? 1 : 0.09} />
      </g>
    );
  });
  return (
    <svg viewBox={`-2 0 ${x + 2} ${H}`} height={height} style={{ display: "block", color: "#fff" }} role="img" aria-label={text.trim() || "empty"}>
      {parts}
    </svg>
  );
}
