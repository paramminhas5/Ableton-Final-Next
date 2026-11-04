"use client";
/**
 * Tool steps: the midi tools a lesson hands you on your own song. Arpeggiator (your chords become a
 * pattern) and key shift (the whole song up or down). Each plays your song as you change it, and keep
 * writes it into the song. Shared frame so every tool step looks and behaves the same.
 */
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { BASS_PARAMS, CHORD_PARAMS, FLAG, LAYER_PARAMS, LEAD_PARAMS, OUT } from "@/engine";
import type { LessonScreen } from "@/content/types";
import { readTrackV2, writeTrackV2, newLayerV2, type LayerType, type TrackV2 } from "@/lib/track2";
import { ARP_LABEL, ARP_MODES, arpOrder, transposed, type Arp, type ArpMode } from "@/lib/arp";
import { NOTE_NAMES } from "@/lib/theory";
import { CAP, GoPill, Icon, Key, Knob, Screen } from "./controls";
import { Meta, useEnter } from "./LessonParts";
import { useEngineTrack } from "./useEngineTrack";
import { Gloss } from "./Gloss";

type Of<K extends LessonScreen["kind"]> = Extract<LessonScreen, { kind: K }>;
export type StepProps = { screen: Of<"tempo">; accent: string; onNext: () => void; tail?: ReactNode };

/** Your song, with a part of `type` in it: yours if you have one, else a simple one so the tool has notes to work on. */
export function withPart(t: TrackV2, type: LayerType): { track: TrackV2; added: boolean } {
  if (t.layers.some(l => l.type === type && l.events.length)) return { track: t, added: false };
  const L = t.loop || 4;
  const root = 57 + (((t.root ?? 45) - 45) % 12);
  const minor = (t.scale ?? "minor") === "minor";
  // i, VI, III, VII in minor; I, V, vi, IV in major. One chord per quarter of the loop.
  const prog = minor ? [[0, 3, 7], [-4, 0, 3], [3, 7, 10], [-2, 2, 5]] : [[0, 4, 7], [-5, -1, 2], [-3, 0, 4], [-7, -3, 0]];
  const l = newLayerV2(type, "__tool");
  const each = L / 4;
  l.events = prog.flatMap((c, i) => (type === "chords" ? c : [c[0]]).map(n => ({ start: i * each, len: each * 0.95, note: root + n + (type === "bass" ? -12 : 0), vel: 0.8 })));
  return { track: { ...t, layers: [...t.layers, l].slice(0, 8) }, added: true };
}

export function useLoop(track: TrackV2) {
  const { engine, ready } = useEngineTrack(track);
  const [beat, setBeat] = useState(-1);
  useEffect(() => engine.on(evs => { for (const e of evs) if (e.kind === OUT.pos) setBeat(e.flags & FLAG.playing ? e.beat : -1); }), [engine]);
  useEffect(() => { let gone = false; void ready().then(() => { if (!gone) { engine.metronome(false); engine.play(); } }).catch(() => { /* needs a tap */ }); return () => { gone = true; try { engine.stop(); } catch { /* not started */ } }; }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const playing = beat >= 0;
  const toggle = async () => { if (playing) { engine.stop(); return; } await ready(); engine.play(); };
  return { beat, playing, toggle };
}

export function Frame({ screen, inst, go, onGo, playing, toggle, tail, note }: { screen: Of<"tempo">; inst: ReactNode; go: string; onGo: () => void; playing: boolean; toggle: () => void; tail?: ReactNode; note?: string | null }) {
  useEnter(onGo);
  return (
    <div className="ls-col">
      <div className="fl-inst">{inst}</div>
      <div className="fl-text">
        {screen.body.split(/\n+/).map((para, i) => <p key={i} className="ls-read"><Gloss>{para}</Gloss></p>)}
        {screen.hint ? <div className="ls-hint"><Gloss>{screen.hint}</Gloss></div> : null}
        {note ? <div className="ls-hint">{note}</div> : null}
        {tail}
      </div>
      <div className="ls-bottom">
        <div className="m1-g">
          <Key label={playing ? "stop" : "play"} onClick={toggle} ariaPressed={playing} ariaLabel={playing ? "Stop" : "Play your song"}><Icon name={playing ? "stop" : "play"} /></Key>
          <GoPill onClick={onGo} style={{ gridColumn: "span 3" }} ariaLabel={go}>{go}</GoPill>
        </div>
      </div>
    </div>
  );
}

export function Chips<T extends string | number>({ label, items, value, onPick, name, accent }: { label: string; items: T[]; value: T; onPick: (v: T) => void; name: (v: T) => string; accent: string }) {
  return (
    <div className="tl-group">
      <small className="tl-label" aria-hidden>{label.toLowerCase()}</small>
      <div className="fl-marks tl-row" role="radiogroup" aria-label={label} style={{ ["--c" as string]: accent } as CSSProperties}>
        {items.map(v => <button key={String(v)} type="button" role="radio" aria-checked={v === value} className={`ls-chip ${v === value ? "is-on" : ""}`} onClick={() => onPick(v)}>{name(v)}</button>)}
      </div>
    </div>
  );
}

// ── arpeggiator ──────────────────────────────────────────────────────────────

export function ArpStep({ screen, accent, onNext, tail }: StepProps) {
  const type = (screen.layer ?? "chords") as LayerType;
  const [base] = useState(() => withPart(readTrackV2(), type));
  const [mode, setMode] = useState<ArpMode | "off">("up");
  const [rate, setRate] = useState<2 | 4>(4);
  const [oct, setOct] = useState<1 | 2>(1);
  const arp: Arp | undefined = mode === "off" ? undefined : { mode, rate, oct };
  const shown = useMemo(() => ({ ...base.track, layers: base.track.layers.map(l => (l.type === type ? { ...l, arp } : l)) }), [base, type, mode, rate, oct]); // eslint-disable-line react-hooks/exhaustive-deps
  const { beat, playing, toggle } = useLoop(shown);
  const part = base.track.layers.find(l => l.type === type);
  // The chord under the playhead and the order the arp walks it.
  const now = playing && part ? part.events.filter(e => { const b = ((beat % (shown.loop || 4)) + (shown.loop || 4)) % (shown.loop || 4); return e.start <= b && e.start + e.len > b; }) : [];
  const order = arp && now.length ? arpOrder(now.map(e => e.note), arp.mode, arp.oct) : [];
  const step = arp ? Math.floor((((beat % 1) + 1) % 1) * arp.rate) : -1;
  const keep = () => {
    const t = readTrackV2();
    const has = t.layers.some(l => l.type === type && l.events.length);
    const next = has ? t : base.track;
    writeTrackV2({ ...next, layers: next.layers.map(l => (l.type === type ? { ...l, arp, id: l.id === "__tool" ? `arp-${Date.now().toString(36)}` : l.id } : l)), updatedAt: Date.now() });
    window.dispatchEvent(new Event("ccd:song"));
    onNext();
  };
  return (
    <Frame screen={screen} playing={playing} toggle={toggle} tail={tail} onGo={keep} go={mode === "off" ? "keep it off" : "keep the arp"}
      note={base.added ? `your song has no ${type} yet, so here are four ${type === "chords" ? "chords" : "notes"} to try it on. keep adds them.` : null}
      inst={<>
        <Screen>
          <Meta left="arpeggiator" right={playing ? (mode === "off" ? "off: your chords as played" : `${ARP_LABEL[mode as ArpMode]}, 1/${rate * 4}`) : "press play"} />
          <div className="ar-arp" aria-label="The notes the arpeggiator plays, in order" style={{ ["--c" as string]: accent } as CSSProperties}>
            {(order.length ? order : [0, 1, 2]).map((n, i) => <i key={i} className={order.length && step >= 0 && i === (Math.floor(beat * (arp?.rate ?? 1)) % order.length) ? "is-on" : ""}>{order.length ? NOTE_NAMES[((n % 12) + 12) % 12] : ""}</i>)}
          </div>
        </Screen>
        <Chips label="Arpeggiator direction" accent={accent} items={["off", ...ARP_MODES] as (ArpMode | "off")[]} value={mode} onPick={setMode} name={m => (m === "off" ? "off" : ARP_LABEL[m as ArpMode])} />
        <Chips label="Arpeggiator rate" accent={accent} items={[2, 4] as (2 | 4)[]} value={rate} onPick={setRate} name={r => `1/${r * 4}`} />
        <Chips label="Octaves" accent={accent} items={[1, 2] as (1 | 2)[]} value={oct} onPick={setOct} name={o => `${o} octave${o > 1 ? "s" : ""}`} />
      </>} />
  );
}

// ── key shift ────────────────────────────────────────────────────────────────

const SHIFT_MIN = -6, SHIFT_MAX = 6;
export function KeyStep({ screen, accent, onNext, tail }: StepProps) {
  const [base] = useState(() => withPart(readTrackV2(), "bass"));
  const [semis, setSemis] = useState(0);
  const shown = useMemo(() => transposed(base.track, semis), [base, semis]);
  const { playing, toggle } = useLoop(shown);
  const root = base.track.root ?? 45;
  const name = (r: number) => `${NOTE_NAMES[((r % 12) + 12) % 12]} ${base.track.scale ?? "minor"}`;
  const keep = () => {
    const t = readTrackV2();
    const has = t.layers.some(l => l.events.length);
    writeTrackV2({ ...transposed(has ? t : base.track, semis), updatedAt: Date.now() });
    window.dispatchEvent(new Event("ccd:song"));
    onNext();
  };
  return (
    <Frame screen={screen} playing={playing} toggle={toggle} tail={tail} onGo={keep} go={semis ? `keep ${name(root + semis)}` : "keep the key"}
      inst={<>
        <Screen>
          <Meta left="key shift" right={playing ? "playing, turn the knob" : "press play"} />
          <div className="fl-bpm"><b style={{ fontSize: 44 }}>{name(root + semis)}</b><span>{semis === 0 ? "your key" : `${semis > 0 ? "up" : "down"} ${Math.abs(semis)} semitone${Math.abs(semis) > 1 ? "s" : ""} from ${name(root)}`}</span></div>
        </Screen>
        <div className="fl-tempo">
          <Knob label="shift" color={CAP.navy} size={92} height={170} led={accent} value={(semis - SHIFT_MIN) / (SHIFT_MAX - SHIFT_MIN)} defaultValue={0.5}
            onChange={v => setSemis(Math.round(SHIFT_MIN + v * (SHIFT_MAX - SHIFT_MIN)))} />
          <Chips label="Shift by" accent={accent} items={[-5, -3, 0, 3, 5]} value={semis} onPick={n => setSemis(Math.max(SHIFT_MIN, Math.min(SHIFT_MAX, n)))} name={n => (n === 0 ? "home" : `${n > 0 ? "+" : ""}${n}`)} />
        </div>
      </>} />
  );
}

// ── macro: one knob that turns several ───────────────────────────────────────

type Target = { key: string; label: string; index: number; from: number; to: number };
function macroTargets(type: LayerType): Target[] {
  const inst = type === "bass" ? BASS_PARAMS : type === "chords" ? CHORD_PARAMS : LEAD_PARAMS;
  const I = (key: string, from: number, to: number): Target | null => { const p = inst.find(x => x.key === key); return p ? { key, label: p.label, index: p.index, from, to } : null; };
  const L = (key: string, from: number, to: number): Target => { const p = LAYER_PARAMS.find(x => x.key === key)!; return { key, label: p.label, index: p.index, from, to }; };
  return [I("cutoff", 0.3, 0.92), I("res", 0.1, 0.6), L("drive", 0, 0.5), L("send", 0, 0.45), I("lfo", 0, 0.55)].filter(Boolean) as Target[];
}

export function MacroStep({ screen, accent, onNext, tail }: StepProps) {
  const type = (screen.layer ?? "lead") as LayerType;
  const [base] = useState(() => withPart(readTrackV2(), type));
  const all = useMemo(() => macroTargets(type), [type]);
  const [on, setOn] = useState<string[]>(() => all.slice(0, 3).map(t => t.key));
  const [m, setM] = useState(0.2);
  const [saved, setSaved] = useState<(number | null)[]>([null, null]);
  const params = useMemo(() => Object.fromEntries(all.filter(t => on.includes(t.key)).map(t => [t.index, t.from + (t.to - t.from) * m])), [all, on, m]);
  const shown = useMemo(() => ({ ...base.track, layers: base.track.layers.map(l => (l.type === type ? { ...l, params: { ...l.params, ...params } } : l)) }), [base, type, params]);
  const { playing, toggle } = useLoop(shown);
  const keep = () => {
    const t = readTrackV2();
    const next = t.layers.some(l => l.type === type && l.events.length) ? t : base.track;
    writeTrackV2({ ...next, layers: next.layers.map(l => (l.type === type ? { ...l, params: { ...l.params, ...params }, id: l.id === "__tool" ? `macro-${Date.now().toString(36)}` : l.id } : l)), updatedAt: Date.now() });
    window.dispatchEvent(new Event("ccd:song"));
    onNext();
  };
  return (
    <Frame screen={screen} playing={playing} toggle={toggle} tail={tail} onGo={keep} go="keep this setting"
      note={base.added ? `your song has no ${type} yet, so here is one to try it on. keep adds it.` : null}
      inst={<>
        <Screen>
          <Meta left={`macro · your ${type}`} right={playing ? "turn the big knob" : "press play"} />
          <div className="mc-map">
            {all.map(t => { const v = on.includes(t.key) ? t.from + (t.to - t.from) * m : null; return (
              <div key={t.key} className={`mc-t ${v === null ? "is-off" : ""}`}><small>{t.label}</small><i style={{ ["--v" as string]: v ?? 0, ["--c" as string]: accent } as CSSProperties} /></div>
            ); })}
          </div>
        </Screen>
        <div className="fl-tempo">
          <Knob label="macro" color={CAP.navy} size={92} height={170} led={accent} value={m} defaultValue={0.2} onChange={setM} />
          <div>
            <div className="fl-marks" role="group" aria-label="What the macro turns" style={{ ["--c" as string]: accent } as CSSProperties}>
              {all.map(t => <button key={t.key} type="button" aria-pressed={on.includes(t.key)} className={`ls-chip ${on.includes(t.key) ? "is-on" : ""}`} onClick={() => setOn(o => (o.includes(t.key) ? o.filter(x => x !== t.key) : [...o, t.key]))}>{t.label}</button>)}
            </div>
            <div className="fl-marks" role="group" aria-label="Saved macro settings" style={{ ["--c" as string]: accent, marginTop: 8 } as CSSProperties}>
              {saved.map((v, i) => <button key={i} type="button" className={`ls-chip ${v !== null && Math.abs(v - m) < 0.01 ? "is-on" : ""}`} onClick={() => (v === null ? setSaved(s => s.map((x, j) => (j === i ? m : x))) : setM(v))}>{v === null ? `save as ${"ab"[i]}` : `variation ${"ab"[i]}`}</button>)}
            </div>
          </div>
        </div>
      </>} />
  );
}
