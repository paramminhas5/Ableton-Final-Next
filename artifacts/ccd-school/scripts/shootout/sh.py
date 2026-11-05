"""Shared host helpers for the sound shootout: load a plugin, set its knobs by their shown text, render."""
import re, numpy as np, pedalboard, soundfile as sf
SR = 48000
S = __import__("os").environ.get("SHOOTOUT", "/tmp/shootout")  # where the plugins were downloaded and built, never the repo
PLUG = {
    "surge": f"{S}/dl/surge/x/lib/vst3/Surge XT.vst3",
    "dexed": f"{S}/dl/dexed/x/dexed-0.9.8-lnx/Dexed.vst3",
    "chow": f"{S}/dl/chow/x/usr/lib/vst3/CHOWTapeModel.vst3",
    "hall": f"{S}/dl/dragonfly/x/usr/lib/vst3/DragonflyHallReverb.vst3",
    "plate": f"{S}/dl/dragonfly/x/usr/lib/vst3/DragonflyPlateReverb.vst3",
    "odin": f"{S}/build-odin2/Odin2_artefacts/Release/VST3/Odin2.vst3",
    "vital": "/tmp/claude-0/-home-claude/14482081-5c9f-509e-afde-b9b4be190bf9/scratchpad/shootout/build-vitalium/ports/vitalium.vst3",
}
def load(k):
    return pedalboard.load_plugin(PLUG[k])

def _num(s):
    m = re.search(r"-?\d+(\.\d+)?", s.replace(",", ""))
    if not m: return None
    v = float(m.group(0))
    if re.search(r"\bkHz\b", s): v *= 1000
    if re.search(r"\bs\b", s) and "ms" not in s: v *= 1000  # seconds to ms
    return v

def setp(p, name, value):
    """Set a knob by the text it shows (a choice) or by the number it shows (binary search on raw)."""
    par = p.parameters[name]
    if isinstance(value, str):
        seen = {}
        for i in range(0, 2001):
            par.raw_value = i / 2000
            seen.setdefault(par.string_value.strip(), i / 2000)
        for k, r in seen.items():
            if k.lower() == value.lower():
                par.raw_value = r
                return k
        raise KeyError(f"{name}: {value!r} not in {list(seen)[:60]}")
    lo, hi = 0.0, 1.0
    par.raw_value = 0.0; a = _num(par.string_value)
    par.raw_value = 1.0; b = _num(par.string_value)
    inc = (b if b is not None else 1) > (a if a is not None else 0)
    for _ in range(40):
        mid = (lo + hi) / 2
        par.raw_value = mid
        v = _num(par.string_value)
        if v is None: v = -1e30
        if (v < value) == inc: lo = mid
        else: hi = mid
    par.raw_value = (lo + hi) / 2
    return par.string_value

def raw(p, name, r):
    p.parameters[name].raw_value = r

def midi(notes):
    """notes: (start s, note, length s, velocity 1..127) -> raw midi with times."""
    ev = []
    for t, n, l, v in notes:
        ev.append((bytes([0x90, n, v]), t)); ev.append((bytes([0x80, n, 0]), t + l))
    return sorted(ev, key=lambda e: e[1])

def render(p, notes, dur, auto=None, block=256, warm=0.5):
    """Render an instrument. auto(t) is called every block to move knobs. A warm-up of silence first."""
    p.reset()
    if warm:
        p([], duration=warm, sample_rate=SR, num_channels=2, buffer_size=block, reset=False)
    ev = midi(notes)
    if auto is None:
        y = p(ev, duration=dur, sample_rate=SR, num_channels=2, buffer_size=block, reset=False)
        return y.T.astype(np.float32)
    out = []; n = int(dur * SR); i = 0
    while i < n:
        m = min(block, n - i); t0 = i / SR; t1 = (i + m) / SR
        auto(t0)
        chunk = [(b, t - t0) for b, t in ev if t0 <= t < t1]
        out.append(p(chunk, duration=m / SR, sample_rate=SR, num_channels=2, buffer_size=m, reset=False))
        i += m
    return np.concatenate(out, axis=1).T.astype(np.float32)

def fx(p, x, tail=0.0, block=512):
    """Run audio (n, 2) through an effect, with `tail` seconds of silence after."""
    if x.ndim == 1: x = np.stack([x, x], 1)
    x = np.concatenate([x, np.zeros((int(tail * SR), 2), np.float32)])
    p.reset()
    y = p(x.T.astype(np.float32), SR, buffer_size=block, reset=False)
    return y.T.astype(np.float32)

def save(path, y):
    sf.write(path, y, SR, subtype="FLOAT")
