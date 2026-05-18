// BufferSim — interactive buffer size / latency / CPU simulator.
// Used for: cpu-audio-setup, troubleshooting missions.
import { useState } from "react";

const SAMPLE_RATES = [44100, 48000, 96000];
const BUFFER_SIZES = [64, 128, 256, 512, 1024, 2048];

function calcLatency(buf: number, sr: number) {
  return Math.round((buf / sr) * 1000 * 10) / 10; // ms
}

function calcCpuLoad(buf: number) {
  // Smaller buffer = more interrupts = more CPU overhead
  return Math.max(5, Math.round(100 - (buf / 2048) * 70));
}

type Scenario = "tracking" | "mixing" | "mastering";
const SCENARIOS: Record<Scenario, { label: string; recBuf: number; why: string }> = {
  tracking: {
    label: "Recording (live input)",
    recBuf: 128,
    why: "You need to hear yourself as you record. Low latency (<8ms) is essential — high latency makes playing impossible.",
  },
  mixing: {
    label: "Mixing (no live input)",
    recBuf: 512,
    why: "No live input means latency doesn't matter. Use a larger buffer so the CPU can process your plugin-heavy mix without dropouts.",
  },
  mastering: {
    label: "Mastering / export",
    recBuf: 2048,
    why: "Maximum buffer gives maximum CPU headroom. You're listening critically, not performing — latency is irrelevant.",
  },
};

export function BufferSim() {
  const [buf, setBuf] = useState(512);
  const [sr, setSr] = useState(44100);
  const [scenario, setScenario] = useState<Scenario>("mixing");

  const latency = calcLatency(buf, sr);
  const cpuLoad = calcCpuLoad(buf);
  const recBuf = SCENARIOS[scenario].recBuf;
  const isOptimal = buf === recBuf;
  const isTooLow = buf < recBuf / 2;
  const isTooHigh = buf > recBuf * 2 && scenario === "tracking";

  const statusColor = isOptimal
    ? "bg-acid text-ink"
    : isTooLow
      ? "bg-volt text-bone"
      : isTooHigh
        ? "bg-hot text-bone"
        : "bg-sun text-ink";

  const statusLabel = isOptimal
    ? "OPTIMAL"
    : isTooLow
      ? "TOO SMALL → CPU SPIKES"
      : isTooHigh
        ? "TOO LARGE → UNPLAYABLE LATENCY"
        : "ACCEPTABLE";

  return (
    <div className="space-y-4">
      <div className="brutal-border bg-ink text-bone p-4">
        <div className="font-mono text-[10px] uppercase opacity-60">Audio Setup Simulator</div>
        <div className="font-display text-2xl mt-1">BUFFER SIZE & LATENCY</div>
      </div>

      {/* Scenario selector */}
      <div className="grid grid-cols-3 gap-1">
        {(Object.keys(SCENARIOS) as Scenario[]).map((s) => (
          <button
            key={s}
            onClick={() => setScenario(s)}
            className={`brutal-border px-3 py-2 font-mono text-[10px] uppercase brutal-press ${scenario === s ? "bg-ink text-bone" : "bg-bone"}`}
          >
            {SCENARIOS[s].label}
          </button>
        ))}
      </div>

      <div className="brutal-border bg-sun/30 p-3 font-mono text-xs leading-relaxed">
        <strong>Scenario:</strong> {SCENARIOS[scenario].why}
      </div>

      {/* Buffer picker */}
      <div className="space-y-2">
        <div className="font-mono text-[10px] uppercase opacity-60">Buffer Size</div>
        <div className="grid grid-cols-6 gap-1">
          {BUFFER_SIZES.map((b) => (
            <button
              key={b}
              onClick={() => setBuf(b)}
              className={`brutal-border py-2 font-mono text-xs brutal-press ${buf === b ? "bg-acid text-ink font-bold" : "bg-bone"} ${b === recBuf ? "outline outline-2 outline-volt" : ""}`}
            >
              {b}
            </button>
          ))}
        </div>
        <div className="font-mono text-[9px] opacity-50">
          Samples · outlined = recommended for this scenario
        </div>
      </div>

      {/* Sample rate */}
      <div className="flex gap-2 items-center">
        <span className="font-mono text-[10px] uppercase opacity-60">Sample Rate</span>
        {SAMPLE_RATES.map((s) => (
          <button
            key={s}
            onClick={() => setSr(s)}
            className={`brutal-border px-2 py-1 font-mono text-[10px] brutal-press ${sr === s ? "bg-ink text-bone" : "bg-bone"}`}
          >
            {(s / 1000).toFixed(1)}kHz
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 gap-2">
        <div className="brutal-border p-4 text-center">
          <div className="font-mono text-[10px] uppercase opacity-60">Round-trip latency</div>
          <div className="font-display text-4xl mt-1">{latency}ms</div>
          <div className="font-mono text-[9px] opacity-50 mt-1">
            {latency < 8
              ? "Excellent — play live"
              : latency < 15
                ? "Good"
                : latency < 30
                  ? "OK for mixing"
                  : "Too slow to perform"}
          </div>
        </div>
        <div className="brutal-border p-4 text-center">
          <div className="font-mono text-[10px] uppercase opacity-60">CPU interrupt load</div>
          <div className="font-display text-4xl mt-1">{cpuLoad}%</div>
          <div className="font-mono text-[9px] opacity-50 mt-1">
            {cpuLoad > 75 ? "Risk of dropouts" : cpuLoad > 50 ? "Moderate" : "Comfortable"}
          </div>
        </div>
      </div>

      <div
        className={`brutal-border p-3 font-mono text-sm uppercase font-bold text-center ${statusColor}`}
      >
        {statusLabel}
      </div>

      <div className="brutal-border bg-bone p-3 font-mono text-[10px] uppercase opacity-60 leading-relaxed">
        Formula: Latency = Buffer ÷ Sample Rate × 1000ms.
        {sr > 48000
          ? ` At ${sr / 1000}kHz your CPU works twice as hard for the same buffer.`
          : ""}{" "}
        Freeze CPU-heavy tracks to lower average load without changing buffer.
      </div>
    </div>
  );
}
