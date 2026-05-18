// SkillMap — hexagonal skill map showing acquired skills by world/category.
// Each hex = one mission. Filled = mastered. Color = world. Shows skill "shape".
import { Link } from "@tanstack/react-router";
import { MISSIONS } from "@/content/missions";
import { WORLDS } from "@/content/worlds";
import { useProgress } from "@/lib/progress";

const WORLD_COLORS: Record<string, string> = {
  "first-contact": "#CDFF00", // acid
  "session-arrange": "#FF2D2D", // hot
  "midi-instruments": "#7B2FFF", // volt
  mixing: "#FFB800", // sun
  performance: "#111111", // ink
  "live12-power": "#639922", // green
};

const WORLD_TEXT: Record<string, string> = {
  "first-contact": "#111111",
  "session-arrange": "#F5F0E8",
  "midi-instruments": "#F5F0E8",
  mixing: "#111111",
  performance: "#F5F0E8",
  "live12-power": "#F5F0E8",
};

// Hex grid math — pointy-top hexagons
function hexToPixel(q: number, r: number, size: number) {
  const x = size * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
  const y = size * ((3 / 2) * r);
  return { x, y };
}

function HexPath({ cx, cy, size }: { cx: number; cy: number; size: number }) {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i - 30);
    return `${cx + size * Math.cos(angle)},${cy + size * Math.sin(angle)}`;
  }).join(" ");
  return <polygon points={pts} />;
}

export function SkillMap() {
  const { progress } = useProgress();
  const completed = progress.completedMissions;
  const totalDone = Object.keys(completed).length;
  const totalPct = Math.round((totalDone / MISSIONS.length) * 100);

  // Group missions by world
  const byWorld = WORLDS.map((w) => ({
    world: w,
    missions: MISSIONS.filter((m) => m.world === w.slug),
  }));

  // Calculate world mastery
  const worldStats = byWorld.map(({ world, missions }) => {
    const done = missions.filter((m) => completed[m.slug]).length;
    const total = missions.length;
    const pct = Math.round((done / total) * 100);
    return { world, missions, done, total, pct };
  });

  const size = 22; // hex radius

  return (
    <div className="space-y-6">
      {/* Legend + overall stats */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="brutal-border bg-acid text-ink px-3 py-1.5 font-display text-2xl">
          {totalDone}/{MISSIONS.length} · {totalPct}%
        </div>
        {worldStats.map(({ world, pct }) => (
          <div key={world.slug} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ background: WORLD_COLORS[world.slug] ?? "#ccc" }}
            />
            <span className="font-mono text-[10px] uppercase opacity-70">
              {world.title} {pct}%
            </span>
          </div>
        ))}
      </div>

      {/* Per-world hex clusters */}
      <div className="grid md:grid-cols-2 gap-4">
        {worldStats.map(({ world, missions, done, total, pct }) => {
          const color = WORLD_COLORS[world.slug] ?? "#ccc";
          const textColor = WORLD_TEXT[world.slug] ?? "#111";

          // Lay hexes in a grid pattern, max 8 wide
          const cols = 8;
          const svgWidth = cols * size * Math.sqrt(3) + size * 2;
          const rows = Math.ceil(missions.length / cols);
          const svgHeight = rows * size * 1.5 + size * 2;

          return (
            <div key={world.slug} className="brutal-border p-3 space-y-2">
              {/* World header */}
              <div className="flex items-center justify-between">
                <div className="font-display text-lg" style={{ color }}>
                  {world.title}
                </div>
                <div className="font-mono text-[10px] uppercase opacity-60">
                  {done}/{total} · {pct}%
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1 brutal-border bg-bone overflow-hidden">
                <div
                  className="h-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>

              {/* Hex grid */}
              <svg
                width="100%"
                viewBox={`-${size} -${size} ${svgWidth} ${svgHeight}`}
                style={{ overflow: "visible" }}
              >
                {missions.map((m, i) => {
                  const col = i % cols;
                  const row = Math.floor(i / cols);
                  const q = col;
                  const r = row;
                  const offset = row % 2 === 1 ? (size * Math.sqrt(3)) / 2 : 0;
                  const cx = q * size * Math.sqrt(3) + offset;
                  const cy = r * size * 1.5;
                  const isDone = !!completed[m.slug];
                  const score = completed[m.slug]?.score;

                  return (
                    <Link key={m.slug} to="/mission/$slug" params={{ slug: m.slug }}>
                      <g className="cursor-pointer" style={{ transition: "opacity 0.15s" }}>
                        <HexPath cx={cx} cy={cy} size={size - 1.5} />
                        <polygon
                          points={Array.from({ length: 6 }, (_, idx) => {
                            const angle = (Math.PI / 180) * (60 * idx - 30);
                            return `${cx + (size - 1.5) * Math.cos(angle)},${cy + (size - 1.5) * Math.sin(angle)}`;
                          }).join(" ")}
                          fill={isDone ? color : "transparent"}
                          stroke={isDone ? color : "#ccc"}
                          strokeWidth={isDone ? 0 : 1}
                          opacity={isDone ? (score !== undefined ? 0.4 + score * 0.6 : 0.85) : 0.3}
                        />
                        {isDone ? (
                          <text
                            x={cx}
                            y={cy + 4.5}
                            textAnchor="middle"
                            fontSize="9"
                            fill={textColor}
                            fontWeight="600"
                            style={{ pointerEvents: "none" }}
                          >
                            ✓
                          </text>
                        ) : (
                          <text
                            x={cx}
                            y={cy + 3}
                            textAnchor="middle"
                            fontSize="7"
                            fill="#999"
                            style={{ pointerEvents: "none" }}
                          >
                            {m.number}
                          </text>
                        )}
                        <title>
                          {m.number}. {m.title}
                          {isDone
                            ? ` ✓ ${score !== undefined ? Math.round(score * 100) + "%" : ""}`
                            : ""}
                        </title>
                      </g>
                    </Link>
                  );
                })}
              </svg>
            </div>
          );
        })}
      </div>

      {/* Mastery summary */}
      <div className="brutal-border bg-bone p-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="font-display text-3xl">
            {worldStats.filter((w) => w.pct === 100).length}
          </div>
          <div className="font-mono text-[10px] uppercase opacity-60">Worlds Mastered</div>
        </div>
        <div>
          <div className="font-display text-3xl">{totalDone}</div>
          <div className="font-mono text-[10px] uppercase opacity-60">Missions Done</div>
        </div>
        <div>
          <div className="font-display text-3xl">{progress.badges.length}</div>
          <div className="font-mono text-[10px] uppercase opacity-60">Badges Earned</div>
        </div>
      </div>
    </div>
  );
}
