// StemSplitterSim — visual demo: drag a "song" through the splitter,
// watch four stems peel out. Toggle each stem on/off to hear isolated parts.
import { useEffect, useRef, useState } from "react";
import { getCtx, getMaster, startLoop, type SampleName, type LoopHandle } from "@/lib/audio";

type Stem = { id: "drums" | "bass" | "vocals" | "other"; label: string; sample: SampleName; color: string };

const STEMS: Stem[] = [
  { id: "drums",  label: "DRUMS",  sample: "drum-loop", color: "bg-acid" },
  { id: "bass",   label: "BASS",   sample: "bass-loop", color: "bg-volt text-bone" },
  { id: "vocals", label: "VOCALS", sample: "vox-chop",  color: "bg-hot text-bone" },
  { id: "other",  label: "OTHER",  sample: "chord-pad", color: "bg-sun" },
];

export function StemSplitterSim() {
  const [split, setSplit] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [enabled, setEnabled] = useState<Record<string, boolean>>({ drums: true, bass: true, vocals: true, other: true });
  const loopsRef = useRef<Record<string, { gain: GainNode; loop: LoopHandle | null }>>({});

  useEffect(() => {
    const c = getCtx(); if (!c) return;
    STEMS.forEach((s) => {
      const g = c.createGain(); g.gain.value = 0.6; g.connect(getMaster());
      loopsRef.current[s.id] = { gain: g, loop: null };
    });
    return () => {
      Object.values(loopsRef.current).forEach((n) => { try { n.loop?.stop(); n.gain.disconnect(); } catch {} });
      loopsRef.current = {};
    };
  }, []);

  useEffect(() => {
    Object.entries(enabled).forEach(([k, on]) => {
      const n = loopsRef.current[k]; if (!n) return;
      n.gain.gain.value = on ? 0.6 : 0;
    });
  }, [enabled]);

  const play = async () => {
    const c = getCtx(); if (!c) return;
    if (c.state !== "running") { try { await c.resume(); } catch {} }
    STEMS.forEach((s) => {
      const n = loopsRef.current[s.id]; if (!n) return;
      n.loop?.stop();
      n.loop = startLoop(s.sample, 100, n.gain);
    });
    setPlaying(true);
  };
  const stop = () => {
    Object.values(loopsRef.current).forEach((n) => { n.loop?.stop(); n.loop = null; });
    setPlaying(false);
  };

  return (
    <div className="space-y-3">
      <div className="brutal-border bg-ink text-bone p-3 flex flex-wrap gap-2 items-center">
        <button onClick={() => (playing ? stop() : play())} className={`brutal-border px-4 py-2 font-display text-lg brutal-press ${playing ? "bg-hot text-bone" : "bg-acid text-ink"}`}>
          {playing ? "■ STOP" : "▶ PLAY MIX"}
        </button>
        <button onClick={() => setSplit((s) => !s)} className={`brutal-border px-3 py-2 font-mono uppercase brutal-press ${split ? "bg-volt text-bone" : "bg-bone text-ink"}`}>
          {split ? "STEMS SPLIT" : "SPLIT STEMS →"}
        </button>
        <span className="ml-auto font-mono text-[10px] uppercase opacity-80">
          {split ? "4 stems on separate tracks" : "1 stereo file"}
        </span>
      </div>

      {!split ? (
        <div className="brutal-border bg-bone p-6 text-center font-display text-2xl">SONG.WAV — stereo file</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {STEMS.map((s) => (
            <button
              key={s.id}
              onClick={() => setEnabled((e) => ({ ...e, [s.id]: !e[s.id] }))}
              className={`brutal-border p-3 brutal-press text-left ${enabled[s.id] ? s.color : "bg-bone opacity-50"}`}
            >
              <div className="font-display text-lg">{s.label}</div>
              <div className="font-mono text-[10px] uppercase">{enabled[s.id] ? "● ON" : "○ MUTED"}</div>
            </button>
          ))}
        </div>
      )}

      <p className="font-mono text-[11px] uppercase opacity-70">
        ▸ Click SPLIT STEMS, then mute/solo any stem. This is exactly what Live 12's stem split does in one right-click.
      </p>
    </div>
  );
}
