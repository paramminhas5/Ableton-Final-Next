// AnimatedSignalFlow — boxes + arrows with a glowing packet that travels the path.
// Respects prefers-reduced-motion. Per-stage colors with deterministic text contrast.
import { useEffect, useState } from "react";

type Stage = { label: string; bg: string; fg: string };

const PALETTE: Stage[] = [
  { label: "", bg: "#0A0A0A", fg: "#FAF9F6" }, // ink
  { label: "", bg: "#C7F73E", fg: "#0A0A0A" }, // acid
  { label: "", bg: "#FFD400", fg: "#0A0A0A" }, // sun
  { label: "", bg: "#FF4D2E", fg: "#FAF9F6" }, // hot
  { label: "", bg: "#3B49E0", fg: "#FAF9F6" }, // volt
];

export function AnimatedSignalFlow({ flow, legend, replayKey = 0 }: { flow: string; legend?: string; replayKey?: number }) {
  const stages = flow.split(/→|->/).map((s) => s.trim()).filter(Boolean);
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const h = () => setReduce(mq.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  if (stages.length === 0) return null;

  const boxW = 130;
  const boxH = 44;
  const gap = 22;
  const totalW = stages.length * boxW + (stages.length - 1) * gap;
  const h = boxH + 56;
  const cy = 18 + boxH / 2;

  // Friendly stage role labels for the first 6 boxes — generic, helps non-experts read the diagram.
  const ROLES = ["INPUT", "PROCESS", "GAIN", "SEND", "BUS", "OUT"];

  return (
    <div className="brutal-border bg-bone p-3 overflow-x-auto">
      <div className="font-mono text-[10px] uppercase mb-2 opacity-70">▸ SIGNAL FLOW</div>
      <svg key={replayKey} width={totalW} height={h} viewBox={`0 0 ${totalW} ${h}`} className="block" role="img" aria-label={flow}>
        {/* path used by the moving packet */}
        <path id="sf-path" d={`M 0 ${cy} L ${totalW} ${cy}`} fill="none" stroke="transparent" />
        {stages.map((s, i) => {
          const x = i * (boxW + gap);
          const stage = PALETTE[i % PALETTE.length];
          const role = i === stages.length - 1 ? "OUT" : ROLES[i] ?? "STAGE";
          return (
            <g key={i}>
              <rect x={x} y={18} width={boxW} height={boxH} fill={stage.bg} stroke="#0A0A0A" strokeWidth={3} />
              <text x={x + boxW / 2} y={18 + boxH / 2 + 4} textAnchor="middle" fill={stage.fg}
                style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700 }}>
                {truncate(s, 16)}
              </text>
              <text x={x + boxW / 2} y={18 + boxH + 14} textAnchor="middle" fill="#0A0A0A"
                style={{ fontFamily: "monospace", fontSize: 9, fontWeight: 700, opacity: 0.55 }}>
                {role}
              </text>
              {i < stages.length - 1 && (
                <g>
                  <line x1={x + boxW} y1={cy} x2={x + boxW + gap - 6} y2={cy} stroke="#0A0A0A" strokeWidth={2} />
                  <polygon
                    points={`${x + boxW + gap - 6},${cy - 5} ${x + boxW + gap},${cy} ${x + boxW + gap - 6},${cy + 5}`}
                    fill="#0A0A0A"
                  />
                </g>
              )}
            </g>
          );
        })}
        {!reduce && (
          <circle r="6" fill="#C7F73E" stroke="#0A0A0A" strokeWidth={2}>
            <animateMotion dur={`${Math.max(3, stages.length * 1.2)}s`} repeatCount="indefinite" rotate="auto">
              <mpath xlinkHref="#sf-path" />
            </animateMotion>
          </circle>
        )}
      </svg>
      {legend && <div className="font-mono text-[10px] opacity-60 mt-1">{legend}</div>}
    </div>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}