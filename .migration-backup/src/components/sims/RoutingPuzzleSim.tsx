// Routing Puzzle — match the TARGET send levels within tolerance.
// 5 scenarios teaching real mixing routing concepts.
import { useEffect, useRef, useState } from "react";
import { getCtx, getMaster, midiToFreq, playKick, playSnare, playHat, playTone } from "@/lib/audio";

interface Scenario {
  id: number;
  title: string;
  concept: string;
  why: string;
  tracks: string[];
  returns: { name: string; color: string }[];
  target: Record<string, Record<string, number>>; // track → return → 0-100
  tolerance: number;
}

const SCENARIOS: Scenario[] = [
  {
    id: 1,
    title: "Classic Reverb Send",
    concept: "Shared reverb on a return track",
    why: "One reverb on a return is more CPU-efficient than 4 separate reverbs, and creates a cohesive 'room' that glues the mix.",
    tracks: ["KICK", "SNARE", "VOX", "PAD"],
    returns: [{ name: "REVERB", color: "bg-volt text-bone" }],
    target: {
      KICK: { REVERB: 10 },
      SNARE: { REVERB: 25 },
      VOX: { REVERB: 40 },
      PAD: { REVERB: 60 },
    },
    tolerance: 12,
  },
  {
    id: 2,
    title: "Delay on Vocals Only",
    concept: "Effect only on specific elements",
    why: "Delay on every track creates mud. Targeted sends give space to the main element (vocals) without blurring everything.",
    tracks: ["DRUMS", "BASS", "GUITAR", "VOX"],
    returns: [{ name: "DELAY", color: "bg-hot text-bone" }],
    target: { DRUMS: { DELAY: 0 }, BASS: { DELAY: 0 }, GUITAR: { DELAY: 15 }, VOX: { DELAY: 55 } },
    tolerance: 12,
  },
  {
    id: 3,
    title: "Parallel Compression",
    concept: "New York compression technique",
    why: "Sending drums to a heavily compressed return and blending back adds punch without crushing the transients of the dry signal.",
    tracks: ["KICK", "SNARE", "HATS", "ROOM"],
    returns: [
      { name: "REVERB", color: "bg-volt text-bone" },
      { name: "CRUSH", color: "bg-hot text-bone" },
    ],
    target: {
      KICK: { REVERB: 5, CRUSH: 70 },
      SNARE: { REVERB: 20, CRUSH: 80 },
      HATS: { REVERB: 30, CRUSH: 0 },
      ROOM: { REVERB: 60, CRUSH: 40 },
    },
    tolerance: 14,
  },
  {
    id: 4,
    title: "Cinematic Stems",
    concept: "Multi-bus routing for mixing flexibility",
    why: "Grouping related elements to shared returns lets you process them as one — apply reverb glue to just the strings or just the drums.",
    tracks: ["STRINGS", "BRASS", "PERC", "PIANO"],
    returns: [
      { name: "HALL", color: "bg-volt text-bone" },
      { name: "ROOM", color: "bg-sun" },
    ],
    target: {
      STRINGS: { HALL: 70, ROOM: 20 },
      BRASS: { HALL: 40, ROOM: 30 },
      PERC: { HALL: 10, ROOM: 60 },
      PIANO: { HALL: 50, ROOM: 25 },
    },
    tolerance: 14,
  },
  {
    id: 5,
    title: "Club Mix — Keep It Tight",
    concept: "Send discipline in electronic music",
    why: "Electronic music reverb should be surgical: kick and bass stay mostly dry (reverb blurs transients), hats get shimmer, leads get depth.",
    tracks: ["KICK", "BASS", "HATS", "LEAD"],
    returns: [
      { name: "PLATE", color: "bg-volt text-bone" },
      { name: "DELAY", color: "bg-hot text-bone" },
    ],
    target: {
      KICK: { PLATE: 0, DELAY: 0 },
      BASS: { PLATE: 0, DELAY: 5 },
      HATS: { PLATE: 40, DELAY: 20 },
      LEAD: { PLATE: 30, DELAY: 50 },
    },
    tolerance: 14,
  },
];

function clamp(v: number) {
  return Math.max(0, Math.min(100, v));
}

export function RoutingPuzzleSim() {
  const [scenIdx, setScenIdx] = useState(0);
  const [sends, setSends] = useState<Record<string, Record<string, number>>>({});
  const [checked, setChecked] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [solved, setSolved] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);
  const scen = SCENARIOS[scenIdx];

  // Reset state when scenario changes
  useEffect(() => {
    const init: Record<string, Record<string, number>> = {};
    scen.tracks.forEach((t) => {
      init[t] = {};
      scen.returns.forEach((r) => {
        init[t][r.name] = 0;
      });
    });
    setSends(init);
    setChecked(false);
    setSolved(false);
    setPlaying(false);
  }, [scenIdx]);

  useEffect(
    () => () => {
      stopRef.current?.();
    },
    [],
  );

  const check = () => {
    setChecked(true);
    const ok = scen.tracks.every((t) =>
      scen.returns.every(
        (r) => Math.abs((sends[t]?.[r.name] ?? 0) - scen.target[t][r.name]) <= scen.tolerance,
      ),
    );
    setSolved(ok);
  };

  const togglePlay = () => {
    if (playing) {
      stopRef.current?.();
      setPlaying(false);
      return;
    }
    const ctx = getCtx();
    if (!ctx) return;
    setPlaying(true);
    const master = getMaster();
    const bpm = 110,
      beat = 60 / bpm;
    let stopped = false;
    let next = ctx.currentTime + 0.1;

    // Build audio graph with sends
    const retNodes: Record<string, GainNode> = {};
    scen.returns.forEach((r) => {
      const g = ctx.createGain();
      g.gain.value = 1;
      g.connect(master);
      if (
        r.name.includes("REVERB") ||
        r.name.includes("HALL") ||
        r.name.includes("PLATE") ||
        r.name.includes("ROOM")
      ) {
        const conv = ctx.createConvolver();
        const len = 2 * ctx.sampleRate;
        const ir = ctx.createBuffer(2, len, ctx.sampleRate);
        for (let ch = 0; ch < 2; ch++) {
          const d = ir.getChannelData(ch);
          for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.2);
        }
        conv.buffer = ir;
        g.connect(conv);
        conv.connect(master);
        retNodes[r.name] = g;
      } else if (r.name.includes("DELAY") || r.name.includes("CRUSH")) {
        retNodes[r.name] = g;
      } else {
        retNodes[r.name] = g;
      }
    });

    const trackGains: Record<string, GainNode> = {};
    scen.tracks.forEach((t) => {
      const tg = ctx.createGain();
      tg.gain.value = 0.65;
      tg.connect(master);
      trackGains[t] = tg;
      scen.returns.forEach((r) => {
        const sg = ctx.createGain();
        sg.gain.value = ((sends[t]?.[r.name] ?? 0) / 100) * 0.8;
        tg.connect(sg);
        sg.connect(retNodes[r.name]);
      });
    });

    const sched = () => {
      if (stopped) return;
      while (next < ctx.currentTime + 0.3) {
        const t = next - ctx.currentTime;
        const tk = scen.tracks;
        if (tk.includes("KICK")) {
          playKick(t, trackGains["KICK"]);
          playKick(t + beat * 2, trackGains["KICK"]);
        }
        if (tk.includes("SNARE")) {
          playSnare(t + beat, trackGains["SNARE"]);
          playSnare(t + beat * 3, trackGains["SNARE"]);
        }
        if (tk.includes("HATS")) {
          [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5].forEach((o) =>
            playHat(t + o * beat * 0.5, false, trackGains["HATS"]),
          );
        }
        if (tk.includes("VOX")) {
          [60, 64, 67].forEach((n, i) =>
            playTone(midiToFreq(n), t + i * beat, beat * 0.8, "sine", 0.2, trackGains["VOX"]),
          );
        }
        if (tk.includes("PAD")) {
          playTone(midiToFreq(60), t, beat * 4, "triangle", 0.15, trackGains["PAD"]);
        }
        if (tk.includes("BASS")) {
          [36, 36, 38, 36].forEach((n, i) =>
            playTone(midiToFreq(n), t + i * beat, beat * 0.7, "sawtooth", 0.25, trackGains["BASS"]),
          );
        }
        if (tk.includes("GUITAR")) {
          [52, 57, 60].forEach((n, i) =>
            playTone(midiToFreq(n), t + i * beat, beat * 0.9, "square", 0.12, trackGains["GUITAR"]),
          );
        }
        if (tk.includes("STRINGS")) {
          playTone(midiToFreq(64), t, beat * 4, "sawtooth", 0.18, trackGains["STRINGS"]);
        }
        if (tk.includes("BRASS")) {
          playTone(midiToFreq(60), t + beat, beat * 3, "square", 0.2, trackGains["BRASS"]);
        }
        if (tk.includes("PERC")) {
          playKick(t, trackGains["PERC"]);
          playKick(t + beat * 2.5, trackGains["PERC"]);
        }
        if (tk.includes("PIANO")) {
          [60, 64, 67, 72].forEach((n, i) =>
            playTone(midiToFreq(n), t + i * 0.08, 1.2, "triangle", 0.2, trackGains["PIANO"]),
          );
        }
        if (tk.includes("LEAD")) {
          [72, 74, 72, 69].forEach((n, i) =>
            playTone(midiToFreq(n), t + i * beat, beat * 0.8, "sawtooth", 0.18, trackGains["LEAD"]),
          );
        }
        if (tk.includes("ROOM")) {
          playTone(midiToFreq(48), t, beat * 4, "sine", 0.08, trackGains["ROOM"]);
        }
        if (tk.includes("DRUMS")) {
          playKick(t, trackGains["DRUMS"]);
          playSnare(t + beat, trackGains["DRUMS"]);
        }
        next += beat * 4;
      }
      setTimeout(sched, 60);
    };
    sched();
    stopRef.current = () => {
      stopped = true;
      Object.values(trackGains).forEach((g) => {
        try {
          g.disconnect();
        } catch {}
      });
      Object.values(retNodes).forEach((g) => {
        try {
          g.disconnect();
        } catch {}
      });
    };
  };

  const sendColor = (track: string, ret: string) => {
    if (!checked) return "";
    const diff = Math.abs((sends[track]?.[ret] ?? 0) - scen.target[track][ret]);
    if (diff <= scen.tolerance) return "outline outline-2 outline-acid";
    if (diff <= scen.tolerance * 2) return "outline outline-2 outline-sun";
    return "outline outline-2 outline-hot";
  };

  return (
    <div className="space-y-4">
      {/* Scenario selector */}
      <div className="flex gap-1 flex-wrap">
        {SCENARIOS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setScenIdx(i)}
            className={`brutal-border px-3 py-1 font-mono text-[10px] uppercase brutal-press ${scenIdx === i ? "bg-ink text-bone" : "bg-bone"}`}
          >
            {i + 1}. {s.title.split("—")[0]}
          </button>
        ))}
      </div>

      {/* Goal */}
      <div className="brutal-border bg-ink text-bone p-4 space-y-2">
        <div className="font-mono text-[10px] uppercase opacity-60">
          Scenario {scen.id}/5 — {scen.concept}
        </div>
        <div className="font-display text-2xl">{scen.title}</div>
        <div className="font-mono text-xs leading-relaxed opacity-80">{scen.why}</div>
        <div className="brutal-border bg-volt text-bone px-3 py-2 font-mono text-[10px] uppercase mt-2">
          GOAL: Set each send to approximately match the target levels. Press CHECK when ready.
        </div>
      </div>

      {/* Target diagram */}
      <div className="brutal-border bg-sun/20 p-3">
        <div className="font-mono text-[10px] uppercase opacity-60 mb-2">
          Target routing (approximate)
        </div>
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `120px repeat(${scen.returns.length}, 1fr)` }}
        >
          <div className="font-mono text-[9px] uppercase opacity-40">Track</div>
          {scen.returns.map((r) => (
            <div
              key={r.name}
              className={`${r.color} brutal-border px-2 py-1 font-mono text-[9px] uppercase text-center`}
            >
              {r.name}
            </div>
          ))}
          {scen.tracks.map((t) => (
            <>
              <div key={`l-${t}`} className="font-mono text-[10px] uppercase py-1">
                {t}
              </div>
              {scen.returns.map((r) => {
                const v = scen.target[t][r.name];
                return (
                  <div key={`${t}-${r.name}`} className="flex items-center gap-1">
                    <div className="h-2 brutal-border bg-bone flex-1 overflow-hidden">
                      <div className="h-full bg-ink" style={{ width: `${v}%` }} />
                    </div>
                    <span className="font-mono text-[9px] opacity-50 w-7 text-right">{v}</span>
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>

      {/* Send sliders */}
      <div className="space-y-2">
        <div className="font-mono text-[10px] uppercase opacity-60">
          Your sends — adjust to match target
        </div>
        {scen.tracks.map((t) => (
          <div
            key={t}
            className="brutal-border bg-card p-3 grid gap-2"
            style={{ gridTemplateColumns: `80px repeat(${scen.returns.length}, 1fr)` }}
          >
            <div className="font-mono text-[10px] uppercase self-center">{t}</div>
            {scen.returns.map((r) => (
              <div key={r.name} className="space-y-1">
                <div className="flex justify-between font-mono text-[9px] opacity-60">
                  <span>{r.name}</span>
                  <span>{sends[t]?.[r.name] ?? 0}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={sends[t]?.[r.name] ?? 0}
                  onChange={(e) =>
                    setSends((prev) => ({
                      ...prev,
                      [t]: { ...prev[t], [r.name]: +e.target.value },
                    }))
                  }
                  className={`w-full accent-ink ${sendColor(t, r.name)}`}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={togglePlay}
          className={`brutal-border px-4 py-2 font-display text-lg brutal-press ${playing ? "bg-hot text-bone" : "bg-acid text-ink"}`}
        >
          {playing ? "■ Stop" : "▶ Play"}
        </button>
        <button
          onClick={check}
          className="brutal-border bg-ink text-bone px-4 py-2 font-display text-lg brutal-press"
        >
          CHECK
        </button>
        {checked && (
          <div
            className={`brutal-border px-4 py-2 font-mono text-sm uppercase ${solved ? "bg-acid text-ink" : "bg-hot text-bone"}`}
          >
            {solved ? "✓ CORRECT ROUTING" : "✗ NOT QUITE — adjust highlighted tracks"}
          </div>
        )}
      </div>

      {solved && (
        <div className="brutal-border bg-volt text-bone p-4 font-mono text-xs leading-relaxed">
          <div className="font-display text-xl mb-2">✓ SOLVED</div>
          {scen.why}
          {scenIdx < SCENARIOS.length - 1 && (
            <button
              onClick={() => setScenIdx((i) => i + 1)}
              className="brutal-border bg-bone text-ink px-4 py-2 font-display brutal-press mt-3 block"
            >
              NEXT SCENARIO →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
