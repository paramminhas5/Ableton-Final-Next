// SendReturnSim — three tracks share one Reverb on a Return.
// Visualise that turning UP a send adds the same reverb to that track.
import { useEffect, useRef, useState } from "react";
import { getCtx, getMaster, midiToFreq, playTone, playKick, playSnare, playHat } from "@/lib/audio";

const BPM = 100;
const BEAT = 60 / BPM;

type TrackId = "DRUMS" | "VOX" | "PAD";

export function SendReturnSim() {
  const [playing, setPlaying] = useState(false);
  const [sends, setSends] = useState<Record<TrackId, number>>({ DRUMS: 0, VOX: 0.6, PAD: 0.3 });
  const refs = useRef<{ stop: () => void } | null>(null);
  const sendGainsRef = useRef<Record<TrackId, GainNode> | null>(null);

  const stop = () => { refs.current?.stop(); refs.current = null; setPlaying(false); };

  const play = () => {
    const c = getCtx(); if (!c) return;
    const dest = getMaster();
    // Build return reverb
    const conv = c.createConvolver();
    const len = c.sampleRate * 2.5;
    const buf = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.2);
    }
    conv.buffer = buf;
    const returnGain = c.createGain(); returnGain.gain.value = 0.7;
    conv.connect(returnGain).connect(dest);

    const sendNodes: Record<TrackId, GainNode> = {
      DRUMS: c.createGain(), VOX: c.createGain(), PAD: c.createGain(),
    };
    (Object.keys(sendNodes) as TrackId[]).forEach((k) => {
      sendNodes[k].gain.value = sends[k];
      sendNodes[k].connect(conv);
    });
    sendGainsRef.current = sendNodes;

    let stopped = false;
    let next = c.currentTime + 0.15;
    const tick = () => {
      if (stopped) return;
      while (next < c.currentTime + 0.4) {
        for (let b = 0; b < 4; b++) {
          const t = next + b * BEAT;
          playKick(t - c.currentTime, dest);
          playKick(t - c.currentTime, sendNodes.DRUMS);
          playHat(t - c.currentTime + BEAT / 2, false, dest);
          playHat(t - c.currentTime + BEAT / 2, false, sendNodes.DRUMS);
          if (b === 1 || b === 3) { playSnare(t - c.currentTime, dest); playSnare(t - c.currentTime, sendNodes.DRUMS); }
        }
        [60, 64, 67].forEach((n) => {
          playTone(midiToFreq(n), next - c.currentTime, BEAT * 4 * 0.9, "triangle", 0.06, dest);
          playTone(midiToFreq(n), next - c.currentTime, BEAT * 4 * 0.9, "triangle", 0.06, sendNodes.PAD);
        });
        [72, 74, 76].forEach((n, i) => {
          playTone(midiToFreq(n), next + i * BEAT - c.currentTime, BEAT * 0.6, "sine", 0.18, dest);
          playTone(midiToFreq(n), next + i * BEAT - c.currentTime, BEAT * 0.6, "sine", 0.18, sendNodes.VOX);
        });
        next += BEAT * 4;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    refs.current = { stop: () => { stopped = true; try { conv.disconnect(); returnGain.disconnect(); Object.values(sendNodes).forEach((n) => n.disconnect()); } catch {} } };
    setPlaying(true);
  };

  const setSend = (id: TrackId, v: number) => {
    setSends((s) => ({ ...s, [id]: v }));
    const node = sendGainsRef.current?.[id];
    if (node) node.gain.value = v;
  };

  useEffect(() => () => stop(), []);

  const TRACKS: { id: TrackId; color: string }[] = [
    { id: "DRUMS", color: "bg-acid" },
    { id: "VOX", color: "bg-hot text-bone" },
    { id: "PAD", color: "bg-sun" },
  ];

  return (
    <div className="space-y-3">
      <div className="brutal-border bg-ink text-bone p-3">
        <button onClick={() => playing ? stop() : play()}
          className={`brutal-border px-4 py-2 font-display text-lg brutal-press ${playing ? "bg-hot text-bone" : "bg-acid text-ink"}`}>
          {playing ? "■ STOP" : "▶ PLAY"}
        </button>
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        {TRACKS.map((t) => (
          <div key={t.id} className="brutal-border bg-card p-3 space-y-2">
            <div className={`${t.color} brutal-border font-display text-center py-1`}>{t.id}</div>
            <label className="font-mono text-xs uppercase block">
              SEND → REVERB: {Math.round(sends[t.id] * 100)}%
              <input type="range" min={0} max={1} step={0.01} value={sends[t.id]}
                onChange={(e) => setSend(t.id, +e.target.value)} className="w-full" />
            </label>
            <div className="h-3 brutal-border bg-bone overflow-hidden">
              <div className="h-full bg-volt" style={{ width: `${sends[t.id] * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="brutal-border bg-volt text-bone p-3 font-mono text-xs uppercase">
        ⤴ RETURN A — REVERB · One device, three tracks share it.
      </div>
      <p className="font-mono text-xs uppercase opacity-70">▶ Push a track's send up to drown it in the same reverb. Cleaner than putting Reverb on every track — and one knob changes the whole space.</p>
    </div>
  );
}
