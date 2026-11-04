"use client";
/**
 * The sampler on your song. Three jobs, picked by the lesson (`choices: [hit]`, `[slice]` or `[warp]`):
 *  hit:   one sound (a recorded hit, your mic, or your own file) played as a drum or as keys, with tune,
 *         start, release and reverse.
 *  slice: a sound cut into eight slices on eight pads; play them in order, shuffled, or tap your own order.
 *  warp:  a drum loop recorded at 120 bpm played at other tempos, with warping off, repitch, or beats.
 * Keep adds the sampler part to your song; the audio stays in this browser.
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { display, INSTRUMENT_BASE, SAMPLER_PARAMS, type ParamSpec } from "@/engine";
import { putSample } from "@/lib/samples";
import { builtin, drumLoop, LOOP_BPM, recordMic, slices, type Rec } from "@/lib/sampleKit";
import { readTrackV2, writeTrackV2, newLayerV2, type LayerV2, type NoteEvent, type TrackV2 } from "@/lib/track2";
import { clipVariants } from "@/content/lessons/clipTracks";
import { decodeFile } from "@/lib/samples";
import { CAP, Knob, Screen } from "./controls";
import { Meta } from "./LessonParts";
import { Chips, Frame, useLoop, type StepProps } from "./ToolSteps";

type Job = "hit" | "slice" | "warp";
type Source = "clap" | "kick" | "snare" | "mic" | "file" | "loop";
const P = (key: string) => SAMPLER_PARAMS.find(p => p.key === key)!;
const idx = (key: string) => P(key).index;
const SLICE_ORDERS: Record<string, number[]> = { "in order": [0, 1, 2, 3, 4, 5, 6, 7], shuffled: [0, 3, 2, 1, 4, 7, 6, 5], "stutter": [0, 0, 2, 2, 4, 5, 4, 7] };
type Warp = "off" | "repitch" | "beats";
const WARP_LABEL: Record<Warp, string> = { off: "warp off", repitch: "repitch", beats: "beats" };

const loopOf = (t: TrackV2) => t.loop || 4;
function everyBar(loop: number, f: (bar: number) => NoteEvent[]): NoteEvent[] {
  const out: NoteEvent[] = [];
  for (let b = 0; b * 4 < loop; b++) out.push(...f(b * 4));
  return out;
}

export function SampleStep({ screen, accent, onNext, tail }: StepProps) {
  const job: Job = screen.set === "mic" ? "hit" : ((screen.choices?.[0] as Job) ?? "hit");
  const [song] = useState<TrackV2>(() => { const t = readTrackV2(); return t.layers.some(l => l.events.length) ? t : clipVariants("four-on-the-floor")[0].track; });
  const [source, setSource] = useState<Source>(job === "hit" ? "clap" : "loop");
  const [rec, setRec] = useState<Rec | null>(null);
  const [ver, setVer] = useState(0); // a new layer id per new sound, so the engine reloads its slots
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [params, setParams] = useState<Record<number, number>>({});
  const [pattern, setPattern] = useState("2 and 4");
  const [order, setOrder] = useState<string>("in order");
  const [mine, setMine] = useState<number[]>([]);
  const [warp, setWarp] = useState<Warp>("off");
  const [bpm, setBpm] = useState(song.bpm && song.bpm !== LOOP_BPM ? song.bpm : 128);
  const file = useRef<HTMLInputElement>(null);
  const id = `smp-${ver}-${useMemo(() => Date.now().toString(36), [])}`;

  // Load the sound for the source.
  useEffect(() => {
    let gone = false;
    const get = async (): Promise<Rec | null> => (source === "loop" ? drumLoop() : source === "mic" || source === "file" ? rec : builtin(source));
    void get().then(r => { if (!gone && r && r !== rec) { setRec(r); setVer(v => v + 1); } });
    return () => { gone = true; };
  }, [source]); // eslint-disable-line react-hooks/exhaustive-deps

  // Put the sound in the slots this job needs.
  const sliced = job === "slice" ? 8 : job === "warp" && warp === "beats" ? 16 : 1;
  const [stored, setStored] = useState("");
  useEffect(() => {
    if (!rec) return;
    const parts = sliced > 1 ? slices(rec, sliced) : [rec];
    void Promise.all(parts.map((r, k) => putSample(id, k, r))).then(() => setStored(`${id}:${sliced}`));
  }, [rec, id, sliced]);

  const events = useMemo((): NoteEvent[] => {
    const L = loopOf(song);
    if (job === "slice") {
      const seq = mine.length ? mine : SLICE_ORDERS[order];
      return everyBar(L, at => seq.map((s, k) => ({ start: at + k * 0.5, len: 0.5, note: 36 + s, vel: 0.9 })));
    }
    if (job === "warp") {
      if (warp === "beats") return everyBar(L, at => Array.from({ length: 16 }, (_, k) => ({ start: at + k * 0.25, len: 0.25, note: 36 + k, vel: 0.9 })));
      return everyBar(L, at => [{ start: at, len: 4, note: 36, vel: 0.9 }]);
    }
    if (pattern === "keys") return everyBar(L, at => [0, 3, 7, 12].map((n, k) => ({ start: at + k, len: 0.9, note: 60 + n, vel: 0.85 })));
    const beats = pattern === "every beat" ? [0, 1, 2, 3] : pattern === "offbeats" ? [0.5, 1.5, 2.5, 3.5] : [1, 3];
    return everyBar(L, at => beats.map(b => ({ start: at + b, len: 0.5, note: 36, vel: 0.9 })));
  }, [song, job, mine, order, warp, pattern]);

  const layer = useMemo((): LayerV2 => {
    const l = newLayerV2("sample", "sample-step");
    const p: Record<number, number> = { ...params };
    if (job === "hit" && pattern === "keys") p[idx("keys")] = 1;
    if (job === "warp") p[idx("tune")] = warp === "repitch" ? Math.max(0, Math.min(1, 0.5 + (12 * Math.log2(bpm / LOOP_BPM)) / 24)) : 0.5;
    if (job === "warp" || job === "slice") p[idx("release")] = p[idx("release")] ?? 0.1;
    return { ...l, id, events, params: p, samples: Object.fromEntries(Array.from({ length: sliced }, (_, k) => [k, `slice ${k + 1}`])) };
  }, [id, events, params, job, pattern, warp, bpm, sliced]);

  // Warping plays the loop alone at the chosen tempo; the other jobs play it inside your song.
  const shown = useMemo((): TrackV2 => {
    if (!stored.startsWith(id)) return { ...song, layers: song.layers };
    if (job === "warp") return { ...song, bpm, loop: 4, sections: undefined, layers: [layer] } as TrackV2;
    return { ...song, layers: [...song.layers, layer].slice(0, 8) };
  }, [song, layer, job, bpm, stored, id]);
  const { beat, playing, toggle } = useLoop(shown);

  const fromMic = async () => {
    setBusy(true); setNote("recording for two seconds: clap, tap the desk, or say a word");
    try { const r = await recordMic(2000); setRec(r); setVer(v => v + 1); setSource("mic"); setNote("got it. that's your sound now."); }
    catch { setNote("no microphone here, or it wasn't allowed. load a file or use a recorded hit instead."); }
    finally { setBusy(false); }
  };
  const fromFile = async (f: File | undefined) => {
    if (!f) return;
    try { const r = await decodeFile(f); setRec({ data: r.data.slice(0, r.rate * 8), rate: r.rate }); setVer(v => v + 1); setSource("file"); setNote(`loaded ${f.name.toLowerCase()}`); }
    catch { setNote("that file wouldn't open. try a wav or mp3."); }
  };
  const keep = () => {
    const t = readTrackV2();
    const has = t.layers.some(l => l.events.length);
    const base = has ? t : song;
    if (base.layers.length >= 8) { setNote("your song has eight parts, the most it can hold. this sound plays here but can't be added."); window.setTimeout(onNext, 1600); return; }
    // Warping keeps the loop playing at your song's tempo the way you chose.
    const kept = job === "warp" ? { ...layer, params: { ...layer.params, [idx("tune")]: warp === "repitch" ? Math.max(0, Math.min(1, 0.5 + (12 * Math.log2((base.bpm || 120) / LOOP_BPM)) / 24)) : 0.5 } } : layer;
    writeTrackV2({ ...base, layers: [...base.layers, kept], updatedAt: Date.now() });
    window.dispatchEvent(new Event("ccd:song"));
    onNext();
  };
  const knobs: ParamSpec[] = job === "hit" ? [P("tune"), P("start"), P("release"), P("reverse")] : job === "slice" ? [P("tune"), P("release")] : [];
  const step = playing ? Math.floor((((beat % 4) + 4) % 4) * (job === "slice" ? 2 : 4)) : -1;
  const sources: Source[] = job === "hit" ? ["clap", "kick", "snare", "mic", "file"] : ["loop", "mic", "file"];
  return (
    <Frame screen={screen} playing={playing} toggle={toggle} tail={tail} onGo={keep} go="add this sound" note={note}
      inst={<>
        <Screen>
          <Meta left={job === "warp" ? `a loop recorded at ${LOOP_BPM} bpm, playing at ${bpm}` : job === "slice" ? "eight slices on eight pads" : "your sample"} right={busy ? "recording" : playing ? "playing" : "press play"} />
          <Wave rec={rec} cuts={sliced} lit={job === "slice" ? (mine.length ? mine : SLICE_ORDERS[order])[step] ?? -1 : job === "warp" && warp === "beats" ? step : -1} accent={accent} start={params[idx("start")] ?? 0} reverse={(params[idx("reverse")] ?? 0) > 0.5} />
        </Screen>
        <Chips label="Sound source" accent={accent} items={sources} value={source} name={s => (s === "mic" ? "record mic" : s === "file" ? "load a file" : s === "loop" ? "drum loop" : s)}
          onPick={s => { if (s === "mic") void fromMic(); else if (s === "file") file.current?.click(); else setSource(s); }} />
        <input ref={file} type="file" accept="audio/*" hidden onChange={e => void fromFile(e.target.files?.[0])} />
        {job === "hit" && <Chips label="Play it" accent={accent} items={["2 and 4", "every beat", "offbeats", "keys"]} value={pattern} onPick={setPattern} name={p => (p === "keys" ? "as keys" : `on ${p}`.replace("on every", "every"))} />}
        {job === "slice" && <>
          <Chips label="Play the slices" accent={accent} items={Object.keys(SLICE_ORDERS)} value={mine.length ? "" : order} onPick={o => { setMine([]); setOrder(o); }} name={o => o} />
          <div className="tl-group">
            <small className="tl-label">your own order: tap the slices{mine.length ? `, ${mine.map(m => m + 1).join(" ")}` : ""}</small>
            <div className="sm-pads" aria-label="Slices: tap to make your own order" style={{ ["--c" as string]: accent } as CSSProperties}>
              {Array.from({ length: 8 }, (_, k) => <button key={k} type="button" className={`sm-pad ${(mine.length ? mine : SLICE_ORDERS[order])[step] === k ? "is-lit" : ""}`} aria-label={`Slice ${k + 1}`} onClick={() => setMine(m => (m.length >= 8 ? [k] : [...m, k]))}>{k + 1}</button>)}
            </div>
            {mine.length > 0 && <button type="button" className="ls-chip" onClick={() => setMine([])}>clear your order</button>}
          </div>
        </>}
        {job === "warp" && <>
          <Chips label="Warp mode" accent={accent} items={["off", "repitch", "beats"] as Warp[]} value={warp} onPick={setWarp} name={w => WARP_LABEL[w]} />
          <Chips label="Tempo" accent={accent} items={[...new Set([100, 120, 128, 140, bpm])].sort((a, b) => a - b)} value={bpm} onPick={setBpm} name={b => `${b} bpm`} />
        </>}
        {knobs.length > 0 && (
          <div className="m1-g" style={{ gridTemplateColumns: `repeat(${knobs.length}, 1fr)`, marginTop: 10 }}>
            {knobs.map((k, i) => <Knob key={k.key} label={k.key === "reverse" ? "reverse" : k.label} color={CAP.navy} size={60} height={120} led={accent}
              value={params[k.index] ?? k.default} defaultValue={k.default} readout={k.key === "reverse" ? ((params[k.index] ?? k.default) > 0.5 ? "on" : "off") : display(k, params[k.index] ?? k.default)} onChange={v => setParams(p => ({ ...p, [k.index]: k.key === "reverse" ? (v > 0.5 ? 1 : 0) : v }))}
              onTouch={(_, v) => setNote(`${k.label} ${k.key === "reverse" ? (v > 0.5 ? "on" : "off") : display(k, v)}`)} />)}
          </div>
        )}
      </>} />
  );
}

/** The sound's wave, cut lines for slices, the lit slice, and where playback starts. */
function Wave({ rec, cuts, lit, accent, start, reverse }: { rec: Rec | null; cuts: number; lit: number; accent: string; start: number; reverse: boolean }) {
  const W = 320, H = 70, N = 160;
  const bars = useMemo(() => {
    if (!rec) return [] as number[];
    const per = Math.max(1, Math.floor(rec.data.length / N));
    return Array.from({ length: N }, (_, i) => { let m = 0; for (let j = i * per; j < (i + 1) * per && j < rec.data.length; j++) m = Math.max(m, Math.abs(rec.data[j])); return m; });
  }, [rec]);
  const peak = Math.max(0.001, ...bars);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="sm-wave" role="img" aria-label={rec ? `The sound's wave${cuts > 1 ? `, cut into ${cuts} slices` : ""}` : "Loading the sound"} style={{ transform: reverse ? "scaleX(-1)" : undefined }}>
      {lit >= 0 && cuts > 1 && <rect x={(lit / cuts) * W} y={0} width={W / cuts} height={H} fill={accent} opacity={0.25} />}
      {bars.map((b, i) => { const h = (b / peak) * (H - 6); return <rect key={i} x={(i / N) * W} y={(H - h) / 2} width={W / N - 0.6} height={Math.max(1, h)} fill={i / N >= start ? accent : "rgba(255,255,255,.2)"} />; })}
      {cuts > 1 && Array.from({ length: cuts - 1 }, (_, k) => <line key={k} x1={((k + 1) / cuts) * W} x2={((k + 1) / cuts) * W} y1={0} y2={H} stroke="rgba(255,255,255,.45)" strokeWidth={1} />)}
      {start > 0 && <line x1={start * W} x2={start * W} y1={0} y2={H} stroke="#fff" strokeWidth={1.5} />}
    </svg>
  );
}
