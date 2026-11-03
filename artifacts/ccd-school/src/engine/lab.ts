/**
 * Engine lab: one test page for the spike. Plays the engine, shows the audio path,
 * measures touch-to-sound latency, and joins Ableton Link on the phones.
 * Framework-free so the same file runs in the Next app (/lab/engine) and as the
 * Tauri app's own page.
 */
import { DRUM_PAD_NOTES, FLAG, OUT, getEngine, type Engine, type EngineEvent } from "./index";
import { MicTap, knockToSound, median } from "./latency";

const KEYS = [33, 35, 36, 38, 40, 41, 43, 45]; // a minor, a1 up to a2
const KEY_NAMES = ["a", "b", "c", "d", "e", "f", "g", "a"];

const DEMO_DRUMS = [
  ...[0, 1, 2, 3].map(b => ({ note: 36, vel: 1, start: b, len: 0.2 })),
  ...[0, 1, 2, 3].map(b => ({ note: 42, vel: 0.65, start: b + 0.5, len: 0.1 })),
  { note: 39, vel: 0.9, start: 1, len: 0.2 },
  { note: 39, vel: 0.9, start: 3, len: 0.2 },
];
const DEMO_BASS = [
  [0.25, 33, 0.25], [0.75, 33, 0.25], [1.25, 45, 0.3], [1.5, 43, 0.25],
  [2.25, 36, 0.25], [2.75, 33, 0.5], [3.25, 40, 0.25], [3.5, 38, 0.25],
].map(([start, note, len]) => ({ note, vel: 0.9, start, len }));

const css = `
.lab{font:15px/1.4 system-ui,-apple-system,"Outfit",sans-serif;color:#EEEEEB;background:#141416;min-height:100dvh;padding:16px 16px 140px;box-sizing:border-box;display:flex;flex-direction:column;gap:12px;user-select:none;-webkit-user-select:none;touch-action:manipulation}
.lab h1{font-size:22px;font-weight:400;margin:0}
.lab .row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.lab .scr{background:#050506;border-radius:14px;padding:12px 14px;box-shadow:inset 0 6px 16px rgba(0,0,0,.7),0 0 0 1px #000;font-variant-numeric:tabular-nums}
.lab .k{font-size:12px;color:#9A9AA0}
.lab .v{font-size:26px;font-weight:300;letter-spacing:-.02em}
.lab button{font:inherit;color:#EEEEEB;background:linear-gradient(#3A3B40,#25262A);border:0;border-radius:11px;min-height:44px;padding:0 16px;box-shadow:inset 0 1.5px 0 rgba(255,255,255,.13),0 2px 0 #000}
.lab button.on{background:linear-gradient(#FF84B8,#E8418A);color:#fff}
.lab .pad{flex:1;height:150px;border-radius:16px;font-size:17px;touch-action:none}
.lab .pad.hit{background:radial-gradient(#9ff0d6,#36C9A0);color:#111}
.lab .keys{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:5px}
.lab .keys button{height:120px;padding:0;touch-action:none}
.lab .keys button.hit{background:linear-gradient(#FF84B8,#E8418A)}
.lab pre{white-space:pre-wrap;margin:0;font:12px/1.5 ui-monospace,monospace;color:#C9C9CE}
.lab .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
`;

type Stats = { aux: number[]; mic: number[] };

export function mountLab(root: HTMLElement, engine: Engine = getEngine()): () => void {
  const style = document.createElement("style");
  style.textContent = css;
  root.append(style);
  const el = document.createElement("div");
  el.className = "lab";
  root.append(el);

  el.innerHTML = `
    <div class="row"><h1>engine lab</h1><span style="flex:1"></span><button data-a="start" class="on">start audio</button></div>
    <div class="scr"><div class="k">audio path</div><div data-o="path" class="v" style="font-size:16px">not started</div></div>
    <div class="grid">
      <div class="scr"><div class="k">touch to engine</div><div data-o="aux" class="v">-</div></div>
      <div class="scr"><div class="k">estimate, touch to sound</div><div data-o="est" class="v">-</div></div>
      <div class="scr"><div class="k">measured with mic, median</div><div data-o="mic" class="v">-</div></div>
      <div class="scr"><div class="k">beat</div><div data-o="beat" class="v">-</div></div>
    </div>
    <div class="row"><button data-p="rim" class="pad">tap · rim</button><button data-p="kick" class="pad">tap · kick</button></div>
    <div class="keys">${KEYS.map((n, i) => `<button data-n="${n}">${KEY_NAMES[i]}</button>`).join("")}</div>
    <div class="row">
      <button data-a="play">play loop</button><button data-a="slower">-</button><span data-o="tempo">120 bpm</span><button data-a="faster">+</button>
      <button data-a="mic">measure with mic</button><button data-a="link" style="display:none">link</button>
    </div>
    <div class="scr"><div class="k">how to measure: put the phone flat, turn the volume up, start "measure with mic", then tap the rim pad with a fingernail right next to the mic, 20 times. the mic hears your nail on the glass and then the sound. the gap is the real latency.</div></div>
    <div class="scr"><div class="row" style="justify-content:space-between"><span class="k">results, copy these into the chat</span><button data-a="copy">copy</button></div><pre data-o="log"></pre></div>
  `;
  const $ = (s: string) => el.querySelector(s) as HTMLElement;
  const out = (k: string, v: string) => ($(`[data-o="${k}"]`).textContent = v);

  const stats: Stats = { aux: [], mic: [] };
  let started = false;
  let playing = false;
  let tempo = 120;
  let mic: MicTap | null = null;
  let link = false;

  const host = engine.host;
  (window as unknown as { __ccdEngine?: Engine }).__ccdEngine = engine; // for tests and the console
  const ms = (s: number) => `${(s * 1000).toFixed(1)} ms`;

  function pathText() {
    const i = host.info();
    const buf = i.bufferFrames ? `${i.bufferFrames} frames (${ms(i.bufferFrames / i.sampleRate)})` : "buffer ?";
    const linkText = i.link ? ` · link ${i.link.enabled ? `on, ${i.link.peers} peer${i.link.peers === 1 ? "" : "s"}` : "off"}` : "";
    return `${i.kind} · ${i.sampleRate} hz · ${buf} · out ${ms(i.outputLatency)} · cpu ${i.load.toFixed(1)}%${linkText}`;
  }

  function estimate(aux: number) {
    const i = host.info();
    // touch->engine, engine's fixed 2x-stage delay (48 samples), one buffer, output path
    return aux + (48 / i.sampleRate) * 1000 + (i.bufferFrames / i.sampleRate) * 1000 + i.outputLatency * 1000;
  }

  function log() {
    const i = host.info();
    const m = median(stats.mic);
    const a = median(stats.aux);
    const lines = [
      `platform: ${i.kind}`,
      `audio: ${i.sampleRate} hz, ${i.bufferFrames} frames, output latency ${ms(i.outputLatency)}`,
      `touch to engine (median of ${stats.aux.length}): ${a === null ? "-" : a.toFixed(1) + " ms"}`,
      `estimate touch to sound: ${a === null ? "-" : estimate(a).toFixed(1) + " ms"}`,
      `measured with mic (median of ${stats.mic.length}): ${m === null ? "-" : m.toFixed(1) + " ms"}`,
      `mic samples: ${stats.mic.map(v => v.toFixed(1)).join(", ")}`,
      `engine cpu: ${i.load.toFixed(1)}%`,
      `user agent: ${navigator.userAgent}`,
    ];
    out("log", lines.join("\n"));
  }

  async function start() {
    if (started) return;
    started = true;
    out("path", "starting");
    await engine.start();
    if ("unlock" in host) await (host as unknown as { unlock: () => Promise<void> }).unlock();
    engine.instrument(0, "drums");
    engine.instrument(1, "bass");
    engine.pattern(0, DEMO_DRUMS);
    engine.pattern(1, DEMO_BASS);
    engine.duck(1, 0, 36);
    engine.param(1, 11, 0.5); // mix.duck
    engine.param(0, 10, 0.12); // mix.send
    engine.tempo(tempo);
    ($('[data-a="start"]') as HTMLButtonElement).classList.remove("on");
    $('[data-a="start"]').textContent = "running";
    if (host.link) $('[data-a="link"]').style.display = "";
    out("path", pathText());
  }

  const off = engine.on((evs: EngineEvent[]) => {
    for (const e of evs) {
      if (e.kind === OUT.playedOn && e.aux >= 0) {
        stats.aux.push(e.aux);
        out("aux", `${e.aux.toFixed(1)} ms`);
        out("est", `${estimate(e.aux).toFixed(1)} ms`);
        log();
      } else if (e.kind === OUT.pos) {
        out("beat", e.flags & FLAG.playing ? (e.beat + 1).toFixed(2) : "stopped");
        if (Math.abs(e.vel - tempo) > 0.01) {
          tempo = e.vel;
          out("tempo", `${tempo.toFixed(1)} bpm`);
        }
      }
    }
  });

  async function measure(at: number) {
    if (!mic) return;
    // Wait for the sound to finish arriving, then look back.
    await new Promise(r => setTimeout(r, 350));
    const snap = await mic.snapshot();
    const age = (performance.now() - at) / 1000;
    const tapIndex = Math.round(snap.length - age * mic.sampleRate);
    const gap = knockToSound(snap, mic.sampleRate, tapIndex);
    if (gap !== null) {
      stats.mic.push(gap);
      out("mic", `${median(stats.mic)!.toFixed(1)} ms · ${stats.mic.length} taps`);
    } else {
      out("mic", `missed, tap harder near the mic`);
    }
    log();
  }

  const hit = (b: HTMLElement) => {
    b.classList.add("hit");
    setTimeout(() => b.classList.remove("hit"), 90);
  };

  const onDown = (ev: PointerEvent) => {
    const t = ev.target as HTMLElement;
    const pad = t.closest("[data-p]") as HTMLElement | null;
    const key = t.closest("[data-n]") as HTMLElement | null;
    if (!pad && !key) return;
    ev.preventDefault();
    if (!started) void start();
    // Velocity from where on the pad you hit: centre is loudest. Real velocity comes in step 1.
    const r = (pad ?? key)!.getBoundingClientRect();
    const dy = Math.abs((ev.clientY - r.top) / r.height - 0.5) * 2;
    const vel = Math.max(0.35, 1 - dy * 0.5);
    if (pad) {
      const note = pad.dataset.p === "kick" ? DRUM_PAD_NOTES[0] : DRUM_PAD_NOTES[3];
      engine.noteOn(0, note, vel, ev.timeStamp);
      hit(pad);
      void measure(ev.timeStamp);
    } else if (key) {
      engine.noteOn(1, Number(key.dataset.n), vel, ev.timeStamp);
      key.classList.add("hit");
    }
  };
  const onUp = (ev: PointerEvent) => {
    const key = (ev.target as HTMLElement).closest("[data-n]") as HTMLElement | null;
    if (!key) return;
    engine.noteOff(1, Number(key.dataset.n), ev.timeStamp);
    key.classList.remove("hit");
  };

  const onClick = async (ev: MouseEvent) => {
    const a = (ev.target as HTMLElement).closest("[data-a]") as HTMLElement | null;
    if (!a) return;
    const act = a.dataset.a;
    if (act === "start") await start();
    if (!started) await start();
    if (act === "play") {
      playing = !playing;
      if (playing) engine.play();
      else engine.stop();
      a.classList.toggle("on", playing);
      a.textContent = playing ? "stop" : "play loop";
    } else if (act === "faster" || act === "slower") {
      tempo = Math.max(60, Math.min(180, Math.round(tempo) + (act === "faster" ? 2 : -2)));
      engine.tempo(tempo);
      out("tempo", `${tempo} bpm`);
    } else if (act === "mic") {
      if (mic) {
        mic.stop();
        mic = null;
        a.classList.remove("on");
      } else {
        try {
          mic = new MicTap();
          await mic.start();
          a.classList.add("on");
          stats.mic = [];
          out("mic", "tap the rim pad near the mic");
        } catch (e) {
          mic = null;
          out("mic", `no mic: ${(e as Error).message}`);
        }
      }
    } else if (act === "link" && host.link) {
      link = !link;
      await host.link(link);
      a.classList.toggle("on", link);
    } else if (act === "copy") {
      log();
      await navigator.clipboard?.writeText($('[data-o="log"]').textContent ?? "");
      a.textContent = "copied";
      setTimeout(() => (a.textContent = "copy"), 1200);
    }
  };

  el.addEventListener("pointerdown", onDown);
  el.addEventListener("pointerup", onUp);
  el.addEventListener("pointercancel", onUp);
  el.addEventListener("click", onClick);
  const timer = setInterval(() => started && out("path", pathText()), 1000);

  return () => {
    off();
    clearInterval(timer);
    mic?.stop();
    el.remove();
    style.remove();
  };
}
