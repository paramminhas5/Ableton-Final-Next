/* CCD engine AudioWorklet. Runs the Rust engine (compiled to WebAssembly) on the
 * audio thread. Same C ABI as iOS and Android.
 *
 * Main thread -> worklet: { t: "init", bytes } (the .wasm as an ArrayBuffer; Chrome will
 *   not pass a compiled WebAssembly.Module into an AudioWorklet) then { t: "cmds", c: Float64Array }
 *   where c holds groups of 6: kind, layer, a, x, y, z.
 *   For note on/off, y is the wall-clock time of the touch (Date.now() ms), or -1.
 *   The worklet has no performance clock, but it has Date.now(), so both sides agree
 *   to within a millisecond.
 * Worklet -> main: { t: "ready", frame0 }, { t: "ev", e: Float64Array } groups of 7:
 *   kind, layer, note, flags, vel, aux, beat. And { t: "load", ms } every second.
 */
const EV_BYTES = 32;
const EV_MAX = 256;

class CcdEngine extends AudioWorkletProcessor {
  constructor() {
    super();
    this.ready = false;
    this.pending = [];
    this.busy = 0;
    this.blocks = 0;
    this.port.onmessageerror = () => this.port.postMessage({ t: "error", message: "message could not be read in the worklet" });
    this.port.onmessage = (m) => {
      try {
        this.onMessage(m.data);
      } catch (e) {
        this.port.postMessage({ t: "error", message: String(e && e.stack || e) });
      }
    };
  }

  onMessage(d) {
    if (d.t === "ping") {
      this.port.postMessage({ t: "pong", frame: currentFrame });
    } else if (d.t === "init") {
      const mod = new WebAssembly.Module(d.bytes);
      const inst = new WebAssembly.Instance(mod, {});
      this.x = inst.exports;
      this.e = this.x.ccd_engine_new(sampleRate);
      this.evPtr = this.x.ccd_alloc(EV_BYTES * EV_MAX);
      // Engine frame 0 is this context frame. Touch times are mapped onto it.
      this.frame0 = currentFrame;
      this.ready = true;
      this.port.postMessage({ t: "ready", frame0: this.frame0, sampleRate });
    } else if (d.t === "cmds") {
      this.pending.push(d.c);
    } else if (d.t === "sample") {
      // Between blocks, in this same thread: safe to allocate. Order with cmds is kept.
      if (this.pending.length) this.flush();
      const n = d.data.length;
      const ptr = this.x.ccd_alloc(n * 4);
      new Float32Array(this.x.memory.buffer, ptr, n).set(d.data);
      this.x.ccd_sample_load(this.e, d.layer, d.slot, ptr, n, d.rate);
      this.x.ccd_dealloc(ptr, n * 4);
    }
  }

  flush() {
    const x = this.x;
    const nowFrame = x.ccd_frames(this.e);
    const nowMs = Date.now();
    for (const c of this.pending) {
      for (let i = 0; i + 5 < c.length; i += 6) {
        const kind = c[i];
        let y = c[i + 4];
        // Note on/off carry the touch's wall-clock time: turn it into an engine frame.
        if ((kind === 1 || kind === 2) && y >= 0) y = Math.max(0, nowFrame - ((nowMs - y) / 1000) * sampleRate);
        x.ccd_send(this.e, kind, c[i + 1], c[i + 2], c[i + 3], y, c[i + 5]);
      }
    }
    this.pending.length = 0;
  }

  drain() {
    const x = this.x;
    const n = x.ccd_poll(this.e, this.evPtr, EV_MAX);
    if (!n) return;
    const mem = x.memory.buffer;
    const u32 = new Uint32Array(mem, this.evPtr, n * 8);
    const f32 = new Float32Array(mem, this.evPtr, n * 8);
    const f64 = new Float64Array(mem, this.evPtr, n * 4);
    const o = new Float64Array(n * 7);
    for (let i = 0; i < n; i++) {
      const j = i * 7;
      o[j] = u32[i * 8];
      o[j + 1] = u32[i * 8 + 1];
      o[j + 2] = u32[i * 8 + 2];
      o[j + 3] = u32[i * 8 + 3];
      o[j + 4] = f32[i * 8 + 4];
      o[j + 5] = f32[i * 8 + 5];
      o[j + 6] = f64[i * 4 + 3];
    }
    this.port.postMessage({ t: "ev", e: o }, [o.buffer]);
  }

  process(_inputs, outputs) {
    if (!this.ready) return true;
    const t0 = Date.now();
    if (this.pending.length) this.flush();
    const out = outputs[0];
    const frames = out[0].length;
    const x = this.x;
    x.ccd_process(this.e, frames);
    const mem = x.memory.buffer;
    out[0].set(new Float32Array(mem, x.ccd_out_left(this.e), frames));
    if (out[1]) out[1].set(new Float32Array(mem, x.ccd_out_right(this.e), frames));
    this.drain();
    this.busy += Date.now() - t0;
    if (++this.blocks * frames >= sampleRate) {
      // Rough load: time spent rendering per second of audio.
      this.port.postMessage({ t: "load", ms: this.busy });
      this.blocks = 0;
      this.busy = 0;
    }
    return true;
  }
}

registerProcessor("ccd-engine", CcdEngine);
