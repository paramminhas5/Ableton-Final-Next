// SignalFlowSVG — render a textual "A → B → C" pipeline as boxes + arrows.
// High-contrast colors only; never relies on theme variables that could resolve
// to black-on-black.

import { useState } from "react";

export function SignalFlowSVG({ flow, defaultOpen = false }: { flow: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const stages = flow
    .split(/→|->/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (stages.length === 0) return null;

  const boxW = 130;
  const boxH = 44;
  const gap = 22;
  const totalW = stages.length * boxW + (stages.length - 1) * gap;
  const h = boxH + 24;

  const palette = ["#0A0A0A", "#C6FF00", "#FF2E88", "#7C3AED", "#FFD400", "#00B5D8"];

  return (
    <div className="brutal-border bg-bone">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left p-3 font-mono text-[10px] uppercase opacity-80 flex items-center justify-between"
      >
        <span>▸ SIGNAL FLOW</span>
        <span className="font-mono text-xs">{open ? "▾ hide" : "▸ show"}</span>
      </button>
      {open && (
        <div className="p-3 pt-0 overflow-x-auto">
          <svg
            width={totalW}
            height={h}
            viewBox={`0 0 ${totalW} ${h}`}
            className="block"
            role="img"
            aria-label={flow}
          >
            {stages.map((s, i) => {
              const x = i * (boxW + gap);
              const fill = i === 0 ? "#0A0A0A" : i === stages.length - 1 ? "#7C3AED" : palette[(i % (palette.length - 2)) + 1];
              // Ensure readable text: dark fill -> bone text, light fill -> ink text.
              const dark = fill === "#0A0A0A" || fill === "#7C3AED" || fill === "#FF2E88";
              const textFill = dark ? "#FAF9F6" : "#0A0A0A";
              return (
                <g key={i}>
                  <rect x={x} y={12} width={boxW} height={boxH} fill={fill} stroke="#0A0A0A" strokeWidth={3} />
                  <text
                    x={x + boxW / 2}
                    y={12 + boxH / 2 + 4}
                    textAnchor="middle"
                    fill={textFill}
                    style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700 }}
                  >
                    {truncate(s, 16)}
                  </text>
                  {i < stages.length - 1 && (
                    <g>
                      <line x1={x + boxW} y1={12 + boxH / 2} x2={x + boxW + gap - 6} y2={12 + boxH / 2} stroke="#0A0A0A" strokeWidth={2} />
                      <polygon
                        points={`${x + boxW + gap - 6},${12 + boxH / 2 - 5} ${x + boxW + gap},${12 + boxH / 2} ${x + boxW + gap - 6},${12 + boxH / 2 + 5}`}
                        fill="#0A0A0A"
                      />
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
