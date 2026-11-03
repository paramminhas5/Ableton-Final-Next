/* Keeps the last second of microphone input. Post "snap" to get it back, oldest first. */
class CcdRecorder extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buf = new Float32Array(sampleRate);
    this.pos = 0;
    this.port.onmessage = () => {
      const n = this.buf.length;
      const out = new Float32Array(n);
      out.set(this.buf.subarray(this.pos), 0);
      out.set(this.buf.subarray(0, this.pos), n - this.pos);
      this.port.postMessage(out, [out.buffer]);
    };
  }
  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (!ch) return true;
    const n = this.buf.length;
    for (let i = 0; i < ch.length; i++) {
      this.buf[this.pos] = ch[i];
      this.pos = (this.pos + 1) % n;
    }
    return true;
  }
}
registerProcessor("ccd-recorder", CcdRecorder);
