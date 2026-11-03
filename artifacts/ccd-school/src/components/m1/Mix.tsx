"use client";
/**
 * Studio, mix mode (canvas "Model 1 · final": ZStage, ZStageFixed, ZCompare, ZFaders).
 *
 * Two views of the same mix. The stage puts every layer where you hear it: pan
 * across, pitch up and down, size is loudness, haze is reverb. Layers fighting for
 * the same band in the same place get a red ring and fix pads that glow. The faders
 * are the same mix as strips, with a master strip; tap a strip to open it wide.
 * Hold the screen (or the stage) to hear the mix as it was before your changes.
 *
 * Positions, loudness and clashes come from the engine's own meters, about 30 times
 * a second. With the transport stopped, the stage estimates from the knobs.
 */
import "./mix.css";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import {
  display,
  LAYER_PARAMS,
  MASTER_PARAMS,
  MixReader,
  panName,
  rangeName,
  stageSize,
  stageY,
  toValue,
  type ClashReading,
  type Engine,
  type EngineEvent,
  type LayerReading,
  type MixFrame,
  type ParamSpec,
} from "@/engine";
import { masterOf, paramOf, TYPE, type LayerV2, type TrackV2 } from "@/lib/track2";
import { CAP, Fader, Icon, Knob, Screen, Silk } from "./controls";

const P = Object.fromEntries(LAYER_PARAMS.map(p => [p.id, p])) as Record<string, ParamSpec>;
const IDX = {
  low: P["eq.low"].index,
  mid: P["eq.mid"].index,
  high: P["eq.high"].index,
  cut: P["eq.cut"].index,
  tone: P["fx.tone"].index,
  level: P["mix.level"].index,
  pan: P["mix.pan"].index,
  send: P["mix.send"].index,
  duck: P["mix.duck"].index,
};
const MUTE_C = "#F3C14F";
const SOLO_C = "#7D96FF";
const OUT_C = "#F3C14F";
const CLASH_C = "#FF4A5A";
const OK_C = "#4FE3B6";
/** How long a touched control stays on the screen. */
const TOUCH_MS = 2500;
/** Hold this long on the stage or the screen to compare. */
const HOLD_MS = 180;

export type MixView = "stage" | "faders";

type Update = (fn: (t: TrackV2) => TrackV2, undoable?: boolean) => void;

type Props = {
  track: TrackV2;
  engine: Engine;
  selId: string | null;
  onSelect: (id: string) => void;
  update: Update;
  playing: boolean;
};

type Spot = { x: number; y: number; size: number; centre: number; pan: number };
type HoldHandlers = {
  onPointerDown: (e: PointerEvent<HTMLElement>) => void;
  onPointerUp: () => void;
  onPointerCancel: () => void;
  onPointerLeave: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
};
type KeyHandlers = { onKeyDown: (e: React.KeyboardEvent) => void; onKeyUp: (e: React.KeyboardEvent) => void };

// ── where a layer sits ──────────────────────────────────────────────────────

/** Where the knobs say a layer should sit, for when nothing is playing. */
const TYPE_CENTRE: Record<LayerV2["type"], number> = { drums: 80, hats: 7500, bass: 110, chords: 650, lead: 1400, fx: 3500 };
const TYPE_LOUD: Record<LayerV2["type"], number> = { drums: -12, hats: -22, bass: -14, chords: -18, lead: -19, fx: -24 };

function estimate(l: LayerV2, t: TrackV2): Spot {
  const v = (k: number) => toValue(LAYER_PARAMS[k], paramOf(l, k));
  let centre = TYPE_CENTRE[l.type];
  centre *= Math.pow(2.2, v(IDX.tone));
  centre *= Math.pow(2, (v(IDX.high) - v(IDX.low)) / 30);
  const cut = v(IDX.cut);
  if (cut > 25) centre = Math.max(centre, cut * 1.6);
  const level = v(IDX.level);
  const anySolo = t.layers.some(x => x.solo);
  const silent = (anySolo ? !l.solo : l.mute) || !Number.isFinite(level);
  const lufs = silent ? -60 : TYPE_LOUD[l.type] + level;
  const pan = v(IDX.pan);
  return { x: (pan + 1) / 2, y: stageY(centre), size: stageSize(lufs), centre, pan };
}

function measured(r: LayerReading): Spot {
  return { x: (r.pan + 1) / 2, y: stageY(r.centreHz), size: stageSize(r.lufs), centre: r.centreHz, pan: r.pan };
}

// ── words ───────────────────────────────────────────────────────────────────

const name = (l: LayerV2 | undefined) => (l ? TYPE[l.type].label : "");

function where(pans: number[]): string {
  if (pans.every(p => Math.abs(p) < 0.2)) return "both in the middle";
  return pans[0] < 0 ? "both on the left" : "both on the right";
}

function fixLabel(fix: ClashReading["fix"], value: number, c: ClashReading, target: string): string {
  if (fix === "duck") return `duck the ${target}`;
  if (fix === "pan") return `pan the ${target} ${value < 0.5 ? "left" : "right"}`;
  return c.group === "low" ? `cut the ${target} lows` : c.group === "mid" ? `dip the ${target} mids` : `dip the ${target} highs`;
}

/** The eq param a fix moves, by analysis band. */
function eqIndex(band: number): number {
  return band < 2 ? IDX.cut : band < 4 ? IDX.mid : IDX.high;
}

/** A line about how a layer sits, for the screen. */
function describe(l: LayerV2, t: TrackV2, spot: Spot): string {
  const src = l.duck.src ? t.layers.find(x => x.id === l.duck.src) : null;
  if (l.mute) return "muted";
  if (src && paramOf(l, IDX.duck) > 0) return src.type === "drums" && l.duck.note === 36 ? "out of the kick's way" : `ducks under the ${name(src)}`;
  const side = Math.abs(spot.pan) < 0.2 ? "in the middle" : spot.pan < 0 ? "on the left" : "on the right";
  return `sits ${rangeName(spot.centre) || "low"}, ${side}`;
}

const minus = (s: string) => s.replace(/^-/, "−");
/** What the screen prints for a value: "60%" for amounts, "−3 db" for levels. */
const readout = (spec: Pick<ParamSpec, "min" | "max" | "curve" | "unit">, v: number) => {
  const t = display(spec, v);
  return spec.unit === "pct" ? `${t}%` : minus(t);
};

/**
 * Nudge dots that sit on top of each other apart, so both stay visible and readable.
 * Only the drawing moves; clash rings still use where the meters put them.
 */
function relax(spots: Spot[], w: number, h: number): { x: number; y: number }[] {
  const pts = spots.map(s => ({ x: s.x * w * 0.86, y: (1 - s.y) * h * 0.78, r: s.size / 2 + 6 }));
  for (let it = 0; it < 4; it++) {
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i], b = pts[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const need = (a.r + b.r) * 0.8;
        if (Math.hypot(dx, dy) >= need) continue;
        // Sideways only: up and down carries meaning (pitch), so keep it. Move them
        // just far enough apart across that they no longer overlap.
        const wantX = Math.sqrt(Math.max(0, need * need - dy * dy));
        const side = Math.abs(dx) > 0.5 ? Math.sign(dx) : j % 2 ? 1 : -1;
        const push = (wantX - Math.abs(dx)) / 2;
        a.x -= side * push;
        b.x += side * push;
      }
    }
  }
  return pts.map(p => ({ x: Math.min(1, Math.max(0, p.x / (w * 0.86))), y: 1 - p.y / (h * 0.78) }));
}

// ── the view ────────────────────────────────────────────────────────────────

export function Mix({ track, engine, selId, onSelect, update, playing }: Props) {
  const [view, setView] = useState<MixView>(() => {
    try {
      return (localStorage.getItem("ccd.mix.view") as MixView) || "stage";
    } catch {
      return "stage";
    }
  });
  const [frame, setFrame] = useState<MixFrame | null>(null);
  const [holding, setHolding] = useState(false);
  const [touched, setTouched] = useState<{ label: string; text: string; at: number } | null>(null);
  const [open, setOpen] = useState<string | null>(selId);
  const [masterOpen, setMasterOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const before = useRef<TrackV2>(track);
  const nowSpots = useRef<Spot[]>([]);
  const lastEdit = useRef(0);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Meters on while mix is open; the mix as it is now becomes "before".
  useEffect(() => {
    const reader = new MixReader();
    const off = engine.on((evs: EngineEvent[]) => {
      const f = reader.feed(evs);
      if (f) setFrame(f);
    });
    engine.analyse(true);
    engine.snapshot();
    before.current = structuredClone(track);
    return () => {
      off();
      engine.compare(false);
      engine.analyse(false);
    };
    // Only on entering mix mode.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine]);

  useEffect(() => {
    try {
      localStorage.setItem("ccd.mix.view", view);
    } catch {
      /* private mode */
    }
  }, [view]);

  // The touched readout fades back to the mix after a moment.
  useEffect(() => {
    if (!touched) return;
    const id = setTimeout(() => setNow(Date.now()), TOUCH_MS + 50);
    return () => clearTimeout(id);
  }, [touched]);

  useEffect(() => {
    if (selId) setOpen(o => (o === null ? null : selId));
  }, [selId]);

  const shown = holding ? before.current : track;
  const layers = track.layers;

  // Readings stay valid a moment after a layer goes quiet between notes.
  const lastActive = useRef<(LayerReading & { at: number })[]>([]);
  const spots: Spot[] = useMemo(() => {
    const t = Date.now();
    return layers.map((l, i) => {
      const r = frame?.layers[i];
      if (r && r.active && r.centreHz > 0) lastActive.current[i] = { ...r, at: t };
      const keep = lastActive.current[i];
      if (playing && keep && t - keep.at < 1500) return measured(keep);
      const src = holding ? before.current.layers.find(x => x.id === l.id) ?? l : l;
      return estimate(src, shown);
    });
  }, [frame, layers, playing, holding, shown]);

  const clashes = useMemo(() => (playing && frame ? frame.clashes.filter(c => layers[c.target] && layers[c.other]) : []), [frame, playing, layers]);
  const worst = clashes[0] ?? null;

  // ── editing ───────────────────────────────────────────────────────────────
  const setLayerParam = useCallback(
    (id: string, index: number, v: number, label?: string) => {
      const t = Date.now();
      const undoable = t - lastEdit.current > 800; // one drag is one undo step
      lastEdit.current = t;
      update(tr => ({
        ...tr,
        layers: tr.layers.map(l => {
          if (l.id !== id) return l;
          const next = { ...l, params: { ...l.params, [index]: v } };
          // Duck with nowhere to duck from: under the drums' kick.
          if (index === IDX.duck && v > 0 && !l.duck.src) {
            const drums = tr.layers.find(x => x.type === "drums" && x.id !== l.id);
            if (drums) next.duck = { src: drums.id, note: 36 };
          }
          return next;
        }),
      }), undoable);
      const spec = LAYER_PARAMS[index];
      setTouched({ label: label ?? spec.label, text: readout(spec, v), at: t });
    },
    [update],
  );

  const setMaster = useCallback(
    (index: number, v: number) => {
      const t = Date.now();
      const undoable = t - lastEdit.current > 800;
      lastEdit.current = t;
      update(tr => ({ ...tr, master: { ...tr.master, [index]: v } }), undoable);
      setTouched({ label: MASTER_PARAMS[index].label, text: readout(MASTER_PARAMS[index], v), at: t });
    },
    [update],
  );

  const toggle = (id: string, key: "mute" | "solo") => update(tr => ({ ...tr, layers: tr.layers.map(l => (l.id === id ? { ...l, [key]: !l[key] } : l)) }));

  const applyFix = (c: ClashReading, which: 1 | 2) => {
    const fix = which === 1 ? c.fix : c.fix2;
    const value = which === 1 ? c.value : c.value2;
    const target = layers[c.target];
    const other = layers[c.other];
    if (!fix || !target || !other) return;
    update(tr => ({
      ...tr,
      layers: tr.layers.map(l => {
        if (l.id !== target.id) return l;
        if (fix === "duck") return { ...l, duck: { src: other.id, note: other.type === "drums" ? 36 : null }, params: { ...l.params, [IDX.duck]: value } };
        if (fix === "pan") return { ...l, params: { ...l.params, [IDX.pan]: value } };
        return { ...l, params: { ...l.params, [eqIndex(c.band)]: value } };
      }),
    }));
    onSelect(target.id);
    setTouched(null);
  };

  // ── hold to compare ───────────────────────────────────────────────────────
  const holdStart = (e: PointerEvent<HTMLElement>) => {
    if (e.button > 0) return;
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = setTimeout(() => {
      nowSpots.current = spots;
      setHolding(true);
      engine.compare(true);
    }, HOLD_MS);
  };
  const holdEnd = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = null;
    if (holding) {
      setHolding(false);
      engine.compare(false);
    }
  };
  const holdHandlers: HoldHandlers = {
    onPointerDown: holdStart,
    onPointerUp: holdEnd,
    onPointerCancel: holdEnd,
    onPointerLeave: holdEnd,
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  };
  // Keyboard: hold space on the stage or the screen.
  const keyHandlers: KeyHandlers = {
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === " " && !e.repeat && !holding) {
        e.preventDefault();
        nowSpots.current = spots;
        setHolding(true);
        engine.compare(true);
      }
    },
    onKeyUp: (e: React.KeyboardEvent) => {
      if (e.key === " ") holdEnd();
    },
  };

  // ── screen ────────────────────────────────────────────────────────────────
  const sel = layers.find(l => l.id === selId) ?? layers[0] ?? null;
  const selIndex = sel ? layers.indexOf(sel) : -1;
  const freshTouch = touched && now - touched.at < TOUCH_MS && Date.now() - touched.at < TOUCH_MS ? touched : null;
  const focus = view === "faders" ? (masterOpen ? null : layers.find(l => l.id === open) ?? sel) : sel;

  let screen: ReactNode;
  if (holding) {
    screen = (
      <>
        <div className="mx-row"><span className="mx-t20">before your changes</span><span className="st-ss" style={{ color: "#F3F2EF" }}>holding</span></div>
        <div className="st-ss" style={{ marginTop: 8, color: "#C9C9CE" }}>you are hearing the mix as it was. let go to hear it now</div>
        <div className="st-ss" style={{ marginTop: 14 }}>{view === "stage" ? "dashed rings show where things sit now" : "the faders show the mix now"}</div>
      </>
    );
  } else if (worst && !freshTouch) {
    const t = layers[worst.target];
    const o = layers[worst.other];
    screen = (
      <>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="mx-led" style={{ ["--c" as string]: CLASH_C } as CSSProperties} />
          <span className="mx-t20">{name(o)} and {name(t)} clash</span>
        </div>
        <div className="st-ss mx-clip" style={{ marginTop: 8, color: "#C9C9CE" }}>both {worst.group}, {where([spots[worst.target]?.pan ?? 0, spots[worst.other]?.pan ?? 0])}, so they blur into each other</div>
        <div className="st-ss mx-clip" style={{ marginTop: 14 }}>fix it with a pad below, or drag the {name(t)} {worst.group === "low" ? "up and out" : "to the side"}</div>
      </>
    );
  } else if (view === "faders" && (focus || masterOpen)) {
    const color = masterOpen ? OUT_C : TYPE[focus!.type].color;
    const label = freshTouch?.label ?? (masterOpen ? "out" : focus && paramOf(focus, IDX.duck) > 0 && focus.duck.src ? "duck" : "level");
    const text = freshTouch?.text ?? (masterOpen ? readout(MASTER_PARAMS[0], masterOf(track, 0)) : focus && label === "duck" ? readout(P["mix.duck"], paramOf(focus, IDX.duck)) : readout(P["mix.level"], paramOf(focus!, IDX.level)));
    const duckSrc = focus?.duck.src ? layers.find(l => l.id === focus.duck.src) : null;
    screen = (
      <>
        <div className="mx-row" style={{ alignItems: "baseline" }}>
          <span className="st-big" style={{ fontSize: 24, color }}>{masterOpen ? "master" : name(focus!)}</span>
          <span className="st-ss">{label} <span className="st-big" style={{ fontSize: 24, color: "#F3F2EF", marginLeft: 6 }}>{text}</span></span>
        </div>
        {masterOpen ? (
          <MasterReadout frame={frame} playing={playing} />
        ) : focus ? (
          <>
            <EqCurve layer={focus} color={color} />
            {duckSrc && paramOf(focus, IDX.duck) > 0 ? <DuckLine track={track} layer={focus} src={duckSrc} /> : null}
          </>
        ) : null}
      </>
    );
  } else if (sel) {
    const spot = spots[selIndex];
    const others = clashes.length;
    screen = (
      <>
        <div className="mx-row" style={{ alignItems: "flex-start" }}>
          <div style={{ minWidth: 0 }}>
            <div className="st-big" style={{ fontSize: 28, color: TYPE[sel.type].color }}>{name(sel)}</div>
            <div className="st-ss mx-clip" style={{ marginTop: 6 }}>{spot ? describe(sel, track, spot) : ""}</div>
          </div>
          <div style={{ textAlign: "right", flex: "none" }}>
            <div className="st-ss">{freshTouch ? freshTouch.label : "pan · range"}</div>
            <div className="st-big" style={{ fontSize: 22, marginTop: 6 }}>{freshTouch ? freshTouch.text : spot ? `${panName(spot.pan)} · ${rangeName(spot.centre)}` : ""}</div>
          </div>
        </div>
        <div className="st-ss" style={{ marginTop: 14, color: !playing ? undefined : others ? CLASH_C : OK_C }}>
          {!playing ? "press play to check for clashes" : others ? `${others} clash${others > 1 ? "es" : ""} to fix` : "no clashes · nice"}
        </div>
      </>
    );
  } else {
    screen = (
      <>
        <div className="st-ss">mix</div>
        <div className="st-big" style={{ fontSize: 24, marginTop: 8 }}>no layers yet</div>
        <div className="st-ss" style={{ marginTop: 6 }}>finish a lesson to add one, or press add</div>
      </>
    );
  }

  const pads = worst && !holding ? (
    <div className="mx-fixes">
      <div className="st-tray" style={{ gridTemplateColumns: `repeat(${worst.fix2 ? 2 : 1},1fr)`, gridTemplateRows: "1fr" }}>
        {[1, 2].map(k => {
          const fix = k === 1 ? worst.fix : worst.fix2;
          if (!fix) return null;
          const t = layers[worst.target];
          const label = fixLabel(fix, k === 1 ? worst.value : worst.value2, worst, name(t));
          return (
            <button key={k} type="button" className="st-sp is-dim" style={{ ["--c" as string]: TYPE[t.type].color } as CSSProperties} onClick={() => applyFix(worst, k as 1 | 2)}>
              <span className="st-lb mx-fix-lb">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  ) : null;

  return (
    <>
      <div className="mx-scr-hold" {...holdHandlers} {...keyHandlers} tabIndex={0} role="button" aria-pressed={holding}
        aria-label={holding ? "Comparing with the mix before your changes. Let go to come back" : "Mix screen. Hold to compare with the mix before your changes"}>
        <Screen className="st-scr" height={96}>{screen}</Screen>
      </div>
      {pads}
      <Silk label="see the mix as" right="same mix, two views" />
      <div className="mx-views" role="radiogroup" aria-label="Mix view">
        {(["faders", "stage"] as MixView[]).map(v => (
          <button key={v} type="button" role="radio" aria-checked={view === v} className={`m1-m is-wide st-vk ${view === v ? "is-on" : ""}`} onClick={() => setView(v)}>
            <span className={`m1-dot ${view === v ? "is-on" : ""}`} style={{ ["--c" as string]: "#F4F3F0" } as CSSProperties} />{v}
          </button>
        ))}
      </div>
      {view === "stage" ? (
        <>
          <Silk label="the stage" right={holding ? "let go to come back" : "hold the screen to compare"} />
          <Stage
            track={track}
            shown={shown}
            spots={spots}
            nowSpots={holding ? nowSpots.current : null}
            clashes={clashes}
            selId={sel?.id ?? null}
            onSelect={onSelect}
            onDrag={(id, pan, tone) => {
              setLayerParam(id, IDX.pan, pan, "pan");
              if (tone !== null) setLayerParam(id, IDX.tone, tone, "tone");
            }}
            holdHandlers={holdHandlers}
            keyHandlers={keyHandlers}
            holding={holding}
          />
        </>
      ) : (
        <>
          <Silk label="layers" right="the line on each fader is 0 db" />
          <Faders
            track={track}
            open={masterOpen ? null : open}
            masterOpen={masterOpen}
            onOpen={id => {
              setMasterOpen(false);
              setOpen(id);
              if (id) onSelect(id);
            }}
            onOpenMaster={o => {
              setMasterOpen(o);
              if (o) setOpen(null);
            }}
            setParam={setLayerParam}
            setMaster={setMaster}
            toggle={toggle}
          />
        </>
      )}
    </>
  );
}

// ── the stage ───────────────────────────────────────────────────────────────

type StageProps = {
  track: TrackV2;
  shown: TrackV2;
  spots: Spot[];
  nowSpots: Spot[] | null;
  clashes: ClashReading[];
  selId: string | null;
  onSelect: (id: string) => void;
  onDrag: (id: string, pan: number, tone: number | null) => void;
  holdHandlers: HoldHandlers;
  keyHandlers: KeyHandlers;
  holding: boolean;
};

const pct = (v: number, lo = 0.08, hi = 0.92) => `${(lo + (hi - lo) * v) * 100}%`;
const xPct = (x: number) => pct(x, 0.07, 0.93);
const yPct = (y: number) => pct(1 - y, 0.1, 0.88);

function Stage({ track, shown, spots, nowSpots, clashes, selId, onSelect, onDrag, holdHandlers, keyHandlers, holding }: StageProps) {
  const [ref, box] = useBox<HTMLDivElement>();
  const drawn = useMemo(() => relax(spots, box.w, box.h), [spots, box.w, box.h]);
  type Drag = { id: string; x: number; y: number; pan: number; tone: number; sx: number; sy: number; moved: boolean };
  const drag = useRef<Drag | null>(null);
  // While you drag, the dot follows your finger; then the meters take over again.
  const [dragSpot, setDragSpot] = useState<{ id: string; x: number; y: number } | null>(null);
  const release = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

  const down = (l: LayerV2, i: number, e: PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    if (release.current) clearTimeout(release.current);
    onSelect(l.id);
    drag.current = { id: l.id, x: e.clientX, y: e.clientY, pan: paramOf(l, IDX.pan), tone: paramOf(l, IDX.tone), sx: spots[i].x, sy: spots[i].y, moved: false };
  };
  const move = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    const box = ref.current?.getBoundingClientRect();
    if (!d || !box) return;
    if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 4) return;
    d.moved = true;
    const dx = (e.clientX - d.x) / (box.width * 0.86);
    const dy = (d.y - e.clientY) / (box.height * 0.78);
    const pan = clamp01(d.pan + dx);
    // Up and down: brighter or darker (the tilt on the fx bank), which moves the
    // layer's pitch centre the way you dragged it.
    const tone = clamp01(d.tone + dy);
    onDrag(d.id, Math.abs(pan - 0.5) < 0.02 ? 0.5 : pan, Math.abs(tone - 0.5) < 0.02 ? 0.5 : tone);
    setDragSpot({ id: d.id, x: clamp01(d.sx + dx), y: clamp01(d.sy + dy) });
  };
  const up = () => {
    const was = drag.current?.moved;
    drag.current = null;
    if (!was) return setDragSpot(null);
    // Let the meters catch up before following them again.
    release.current = setTimeout(() => setDragSpot(null), 700);
  };

  const anySolo = track.layers.some(l => l.solo);
  return (
    <div className={`mx-stage ${holding ? "is-holding" : ""}`} ref={ref} {...holdHandlers} {...keyHandlers} tabIndex={0}
      aria-label={holding ? "Comparing. Let go to come back" : "The stage: pan across, pitch up and down, size is loudness. Hold to compare"}>
      {[25, 50, 75].map(y => <div key={y} className="mx-hl" style={{ top: `${y}%` }} />)}
      <div className="mx-vl" />
      {[0.6, 25, 50, 75, 99.4].map(x => (
        <span key={x}><i className="mx-tick" style={{ left: `${x}%`, top: 0 }} /><i className="mx-tick" style={{ left: `${x}%`, bottom: 0 }} /></span>
      ))}
      <span className="st-ss mx-lbl" style={{ left: 12, top: 12 }}>high · hats, air</span>
      <span className="st-ss mx-lbl" style={{ left: 12, bottom: 14 }}>low · kick, bass</span>
      <span className="st-ss mx-lbl" style={{ left: 10, top: "50%", marginTop: -16 }}>left</span>
      <span className="st-ss mx-lbl" style={{ right: 10, top: "50%", marginTop: -16 }}>right</span>
      <span className="st-ss mx-lbl" style={{ right: 12, top: 12 }}>big = loud · haze = reverb</span>

      {track.layers.map((l, i) => {
        const s = spots[i];
        if (!s) return null;
        const c = TYPE[l.type].color;
        const src = shown.layers.find(x => x.id === l.id) ?? l;
        const send = paramOf(src, IDX.send);
        const silent = anySolo ? !l.solo : l.mute;
        const haze = send > 0.02 ? `0 0 ${Math.round(8 + send * 40)}px ${Math.round(send * 18)}px ${c}66` : `0 0 8px ${c}66`;
        const at = dragSpot?.id === l.id ? dragSpot : drawn[i] ?? s;
        // Anchor on the dot's centre, not the dot and its name.
        const style = {
          left: xPct(at.x),
          top: yPct(at.y),
          transform: `translate(-50%, ${-s.size / 2}px)`,
          opacity: silent ? 0.35 : 1,
        } as CSSProperties;
        const sel = l.id === selId;
        return (
          <button key={l.id} type="button" className={`mx-dot ${dragSpot?.id === l.id ? "is-drag" : ""}`} style={style}
            aria-label={`${TYPE[l.type].label}, ${panName(s.pan)}, ${rangeName(s.centre) || "quiet"}${sel ? ", selected" : ""}. Drag across to pan, up or down to brighten or darken`}
            aria-pressed={sel}
            onPointerDown={e => down(l, i, e)} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
            onClick={() => onSelect(l.id)}>
            <b style={{
              width: s.size, height: s.size,
              background: `radial-gradient(circle at 40% 35%,color-mix(in srgb,${c} 40%,#fff),${c} 60%)`,
              boxShadow: haze,
              filter: send > 0.15 ? `blur(${(send * 1.4).toFixed(1)}px)` : undefined,
              outline: sel ? "2px solid #F3F2EF" : undefined,
              outlineOffset: sel ? 3 : undefined,
            }} />
            <span style={{ color: c }}>{TYPE[l.type].label}</span>
          </button>
        );
      })}

      {nowSpots
        ? track.layers.map((l, i) => {
            const n = nowSpots[i];
            const s = spots[i];
            if (!n || !s || Math.hypot(n.x - s.x, n.y - s.y) < 0.04) return null;
            return <i key={`now${l.id}`} className="mx-now" style={{ left: xPct(n.x), top: yPct(n.y), width: n.size, height: n.size, borderColor: TYPE[l.type].color }} aria-hidden />;
          })
        : null}

      {clashes.map((c, k) => {
        const a = spots[c.target];
        const b = spots[c.other];
        if (!a || !b) return null;
        const x = (a.x + b.x) / 2;
        const y = (a.y + b.y) / 2;
        return (
          <span key={`${c.target}-${c.other}`} aria-hidden>
            <i className="mx-ring" style={{ left: xPct(x), top: yPct(y), opacity: 0.55 + 0.45 * Math.min(1, c.severity * 1.5) }} />
            {k === 0 ? <span className="mx-ring-l" style={{ left: xPct(x), top: yPct(y) }}>clash</span> : null}
          </span>
        );
      })}
    </div>
  );
}

// ── the faders ──────────────────────────────────────────────────────────────

type FadersProps = {
  track: TrackV2;
  open: string | null;
  masterOpen: boolean;
  onOpen: (id: string | null) => void;
  onOpenMaster: (open: boolean) => void;
  setParam: (id: string, index: number, v: number, label?: string) => void;
  setMaster: (index: number, v: number) => void;
  toggle: (id: string, key: "mute" | "solo") => void;
};

function useBox<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [box, setBox] = useState({ w: 358, h: 360 });
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, box] as const;
}

function Faders({ track, open, masterOpen, onOpen, onOpenMaster, setParam, setMaster, toggle }: FadersProps) {
  const [ref, box] = useBox<HTMLDivElement>();
  const fh = Math.max(110, Math.min(260, Math.round(box.h - 132)));
  const anySolo = track.layers.some(l => l.solo);
  const cols = [...track.layers.map(l => (l.id === open ? "3.2fr" : "1fr")), masterOpen ? "3.2fr" : "1.15fr"].join(" ");
  const out = masterOf(track, 0);
  return (
    <div className="mx-strips" ref={ref} style={{ gridTemplateColumns: cols }}>
      {track.layers.map(l => {
        const c = TYPE[l.type].color;
        const level = paramOf(l, IDX.level);
        const silent = anySolo ? !l.solo : l.mute;
        const levelText = display(P["mix.level"], level);
        if (l.id === open) {
          const ducking = paramOf(l, IDX.duck) > 0 && !!l.duck.src;
          return (
            <div key={l.id} className="m1-m is-wide mx-open">
              <div className="mx-ohead">
                <span className={`m1-dash ${silent ? "" : "is-on"}`} style={{ ["--c" as string]: c, width: 14 } as CSSProperties} />
                <span className="mx-sname mx-oname">{TYPE[l.type].label}</span>
                <button type="button" className="mx-x" aria-label={`Close ${TYPE[l.type].label}`} onClick={() => onOpen(null)}><Icon name="close" small /></button>
              </div>
              <div className="mx-obody">
                <div className="mx-ofader">
                  <Fader value={level} height={fh - 20} width={32} capWidth={26} unity defaultValue={P["mix.level"].default}
                    label={`${TYPE[l.type].label} level`} valueText={levelText}
                    onChange={v => setParam(l.id, IDX.level, v, "level")} />
                </div>
                <div className="mx-oknobs">
                  <MixKnob label="pan" value={paramOf(l, IDX.pan)} spec={P["mix.pan"]} onChange={v => setParam(l.id, IDX.pan, v, "pan")} />
                  <MixKnob label="send" value={paramOf(l, IDX.send)} spec={P["mix.send"]} onChange={v => setParam(l.id, IDX.send, v, "send")} />
                  <MixKnob label="duck" value={paramOf(l, IDX.duck)} spec={P["mix.duck"]} on={ducking} onChange={v => setParam(l.id, IDX.duck, v, "duck")} />
                </div>
              </div>
              <div className="mx-oms">
                <button type="button" className={`st-sp mx-mini mx-wide ${l.mute ? "is-lit" : ""}`} style={{ ["--c" as string]: MUTE_C } as CSSProperties} aria-pressed={l.mute} onClick={() => toggle(l.id, "mute")}>mute</button>
                <button type="button" className={`st-sp mx-mini mx-wide ${l.solo ? "is-lit" : ""}`} style={{ ["--c" as string]: SOLO_C } as CSSProperties} aria-pressed={l.solo} onClick={() => toggle(l.id, "solo")}>solo</button>
              </div>
            </div>
          );
        }
        return (
          <div key={l.id} className="m1-m is-wide mx-strip">
            <button type="button" className="mx-top" aria-label={`Open ${TYPE[l.type].label}`} onClick={() => onOpen(l.id)}>
              <span className={`m1-dash ${silent ? "" : "is-on"}`} style={{ ["--c" as string]: c, width: 12 } as CSSProperties} />
              <span className="mx-sname" style={silent ? { opacity: 0.5 } : undefined}>{TYPE[l.type].label}</span>
            </button>
            <Fader value={level} height={fh} width={24} capWidth={18} unity defaultValue={P["mix.level"].default}
              label={`${TYPE[l.type].label} level`} valueText={levelText}
              onChange={v => setParam(l.id, IDX.level, v, `${TYPE[l.type].label} level`)} />
            <div className="mx-ms">
              <button type="button" className={`st-sp mx-mini ${l.mute ? "is-lit" : ""}`} style={{ ["--c" as string]: MUTE_C } as CSSProperties} aria-pressed={l.mute} aria-label={`Mute ${TYPE[l.type].label}`} onClick={() => toggle(l.id, "mute")}>m</button>
              <button type="button" className={`st-sp mx-mini ${l.solo ? "is-lit" : ""}`} style={{ ["--c" as string]: SOLO_C } as CSSProperties} aria-pressed={l.solo} aria-label={`Solo ${TYPE[l.type].label}`} onClick={() => toggle(l.id, "solo")}>s</button>
            </div>
          </div>
        );
      })}
      {masterOpen ? (
        <div className="m1-m is-wide mx-open mx-master">
          <div className="mx-ohead">
            <span className="m1-dot is-on" style={{ ["--c" as string]: OUT_C, position: "static", margin: 0 } as CSSProperties} />
            <span className="mx-sname mx-oname">out</span>
            <button type="button" className="mx-x" aria-label="Close the master" onClick={() => onOpenMaster(false)}><Icon name="close" small /></button>
          </div>
          <div className="mx-obody">
            <div className="mx-ofader">
              <Fader value={out} height={fh - 20} width={32} capWidth={26} unity defaultValue={MASTER_PARAMS[0].default}
                label="Master out" valueText={display(MASTER_PARAMS[0], out)} onChange={v => setMaster(0, v)} />
            </div>
            <div className="mx-oknobs" style={{ justifyContent: "center" }}>
              <MixKnob label="glue" value={masterOf(track, 1)} spec={MASTER_PARAMS[1]} on onChange={v => setMaster(1, v)} />
            </div>
          </div>
          <span className="mx-sname" style={{ fontSize: 9 }}>{readout(MASTER_PARAMS[0], out)}</span>
        </div>
      ) : (
        <div className="m1-m is-wide mx-strip mx-master">
          <button type="button" className="mx-top" aria-label="Open the master" onClick={() => onOpenMaster(true)}>
            <span className="m1-dot is-on" style={{ ["--c" as string]: OUT_C, position: "static", margin: 0 } as CSSProperties} />
            <span className="mx-sname">out</span>
          </button>
          <Fader value={out} height={fh} width={30} capWidth={24} unity defaultValue={MASTER_PARAMS[0].default}
            label="Master out" valueText={display(MASTER_PARAMS[0], out)} onChange={v => setMaster(0, v)} />
          <span className="mx-sname mx-outdb">{readout(MASTER_PARAMS[0], out)}</span>
        </div>
      )}
    </div>
  );
}

function MixKnob({ label, value, spec, on, onChange }: { label: string; value: number; spec: Pick<ParamSpec, "default">; on?: boolean; onChange: (v: number) => void }) {
  return (
    <div className="mx-knob">
      <Knob bare size={22} label={label} value={value} defaultValue={spec.default} color={on ? CAP.go : CAP.grey} onChange={onChange} />
      <span className="m1-eng mx-klabel" style={on ? { color: "var(--ink)", fontWeight: 600 } : undefined}>{label}</span>
    </div>
  );
}

// ── screen graphics ─────────────────────────────────────────────────────────

/** The layer's eq as a curve: low cut, low shelf, mid bell, high shelf. */
function EqCurve({ layer, color }: { layer: LayerV2; color: string }) {
  const W = 322;
  const v = (k: number) => toValue(LAYER_PARAMS[k], paramOf(layer, k));
  const [gl, gm, gh, cut] = [v(IDX.low), v(IDX.mid), v(IDX.high), v(IDX.cut)];
  const db = (f: number) => {
    let d = gl / (1 + (f / 110) ** 2) + gm * Math.exp(-(Math.log2(f / 1000) ** 2) / (2 * 0.9 * 0.9)) + gh / (1 + (6500 / f) ** 2);
    if (cut > 21) d -= 10 * Math.log10(1 + (cut / f) ** 4);
    return Math.max(-18, Math.min(18, d));
  };
  const fx = (x: number) => 20 * Math.pow(1000, x / W);
  const y = (d: number) => 14 - d * 0.6;
  const pts: string[] = [];
  for (let x = 0; x <= W; x += 4) pts.push(`${x} ${y(db(fx(x))).toFixed(1)}`);
  const xOf = (f: number) => (Math.log10(f / 20) / 3) * W;
  const nodes = [110, 1000, 6500];
  return (
    <div style={{ marginTop: 4 }}>
      <svg width="100%" height="28" viewBox={`0 0 ${W} 28`} preserveAspectRatio="none" aria-hidden style={{ display: "block", overflow: "visible" }}>
        <path d={`M0 14H${W}`} stroke="#2A2A2E" strokeDasharray="3 4" />
        <path d={`M${pts.join(" L")}`} fill="none" stroke={color} strokeWidth="2" />
        {nodes.map((f, i) => (
          <circle key={f} cx={xOf(f)} cy={y(db(f))} r="4.5" fill="#0A0A0B" stroke={i === 1 ? color : "#F3F2EF"} strokeWidth="1.8" />
        ))}
      </svg>
    </div>
  );
}

/** The kick's hits and how far this layer dips under each one. */
function DuckLine({ track, layer, src }: { track: TrackV2; layer: LayerV2; src: LayerV2 }) {
  const amt = paramOf(layer, IDX.duck);
  const hits = src.events.filter(e => layer.duck.note === null || e.note === layer.duck.note).map(e => e.start / track.loop);
  const W = 322;
  const rel = (0.06 + amt * 0.22) / 3; // seconds, the engine's duck release
  const relBeats = (rel * track.bpm) / 60 / track.loop;
  const pts: string[] = [];
  for (let x = 0; x <= W; x += 2) {
    const t = x / W;
    let since = Infinity;
    for (const h of hits) since = Math.min(since, (t - h + 1) % 1);
    const dip = since === Infinity ? 0 : amt * 0.92 * Math.exp(-since / Math.max(relBeats, 1e-4));
    pts.push(`${x} ${(3 + dip * 13).toFixed(1)}`);
  }
  return (
    <div style={{ marginTop: 4 }}>
      <svg width="100%" height="24" viewBox={`0 0 ${W} 24`} preserveAspectRatio="none" aria-hidden style={{ display: "block" }}>
        <path d={`M0 3H${W}`} stroke="#2A2A2E" strokeDasharray="3 4" />
        <path d={`M${pts.join(" L")}`} fill="none" stroke={TYPE[layer.type].color} strokeWidth="2" />
        {hits.map((h, i) => <rect key={i} x={h * W} y={19} width={14} height={5} rx={1.5} fill={TYPE[src.type].color} />)}
      </svg>
    </div>
  );
}

/** The master's numbers: true peak, loudness, how hard the glue and limiter work. */
function MasterReadout({ frame, playing }: { frame: MixFrame | null; playing: boolean }) {
  const m = playing ? frame?.master : null;
  const f = (v: number | undefined, unit: string, d = 1) => (v === undefined || v <= -100 ? "·" : `${minus(v.toFixed(d))} ${unit}`);
  return (
    <div className="mx-mread">
      <div><span className="st-ss">peak</span><b>{f(m?.truePeakDb, "dbtp")}</b></div>
      <div><span className="st-ss">loudness</span><b>{f(m?.lufs, "lufs", 0)}</b></div>
      <div><span className="st-ss">glue</span><b>{m ? `${minus((-m.glueGrDb).toFixed(1))} db` : "·"}</b></div>
      <div><span className="st-ss">limit</span><b>{m ? `${minus((-m.limiterGrDb).toFixed(1))} db` : "·"}</b></div>
    </div>
  );
}
