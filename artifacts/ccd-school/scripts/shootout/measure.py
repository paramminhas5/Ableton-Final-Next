"""The sound shootout's measurements: one piece of code for both sides of every pair.

Usage: python3 -I measure.py <dir> [<dir> ...] > results.json
Each <dir> holds one side's renders (48 kHz float wav, the names `engine/src/bin/shootout.rs` and
`theirs.py` write). Every number is computed the same way for every side. Method notes are in
design/sound-shootout.md.
"""
import json, math, os, sys
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfiltfilt, hilbert, find_peaks

SR = 48000


def load(d, name):
    p = os.path.join(d, name + ".wav")
    if not os.path.exists(p):
        return None
    y, sr = sf.read(p, dtype="float64", always_2d=True)
    assert sr == SR, (p, sr)
    return y


def mono(y):
    return y.mean(1)


def bh(n):
    t = 2 * np.pi * np.arange(n) / n
    return 0.35875 - 0.48829 * np.cos(t) + 0.14128 * np.cos(2 * t) - 0.01168 * np.cos(3 * t)


def lufs(y):
    """BS.1770-4 integrated loudness (gated), through pyloudnorm; stereo as two channels."""
    import pyloudnorm as pyln
    return float(pyln.Meter(SR).integrated_loudness(y))


def note_hz(n):
    return 440.0 * 2 ** ((n - 69) / 12)


# ── aliasing ────────────────────────────────────────────────────────────────
def alias_db(y, note, sub=False):
    """Energy off the harmonics of the played note (30 Hz to 20 kHz) against the energy on them, in dB,
    over one steady second. The fundamental is found from the spectrum (a voice may sit a few cents off).
    With `sub`, the harmonics of half the note count as harmonics: our lead adds a quiet sine an octave down,
    and its sums and differences with the note (through the filter's gentle nonlinearity) sit on them."""
    x = mono(y)[int(0.2 * SR):int(0.2 * SR) + 32768]
    n = len(x)
    s = np.abs(np.fft.rfft(x * bh(n))) ** 2
    f = np.fft.rfftfreq(n, 1 / SR)
    f0 = note_hz(note)
    m = (f > f0 * 0.965) & (f < f0 * 1.035)
    k = np.argmax(s * m)
    f0 = f[k]
    if 0 < k < len(s) - 1:  # parabolic peak
        a, b, c = np.log(s[k - 1] + 1e-30), np.log(s[k] + 1e-30), np.log(s[k + 1] + 1e-30)
        f0 = (k + 0.5 * (a - c) / (a - 2 * b + c)) * SR / n
    band = (f >= 30) & (f <= 20000)
    h = np.maximum(np.round(f / f0), 1)
    near = np.abs(f - h * f0) < 6 * SR / n
    if sub:
        h2 = np.maximum(np.round(f / (f0 / 2)), 1)
        near |= np.abs(f - h2 * f0 / 2) < 6 * SR / n
    harm = s[band & near].sum()
    other = s[band & ~near].sum()
    return 10 * math.log10(max(other / harm, 1e-15))


# ── stereo ──────────────────────────────────────────────────────────────────
def stereo(y):
    l, r = y[:, 0], y[:, 1]
    corr = float(np.corrcoef(l, r)[0, 1]) if np.std(l) > 0 and np.std(r) > 0 else 1.0
    mid, side = (l + r) / 2, (l - r) / 2
    return {"lr_corr": round(corr, 3), "side_db": round(10 * math.log10(max((side ** 2).sum() / max((mid ** 2).sum(), 1e-30), 1e-12)), 1)}


# ── filter sweeps ───────────────────────────────────────────────────────────
def sweep_hz(t):
    x = min(max((t - 0.25) / 4.0, 0.0), 1.0)
    return 100.0 * 80 ** x


def sweep(y, f0=note_hz(36)):
    """Frames of 8192 (hop 2048) along the sweep. For each frame: the nominal cutoff, the resonant peak (the
    strongest harmonic between half and twice the cutoff, after taking off the saw's own 1/n slope), its height
    over the passband (the harmonics under a quarter of the cutoff), the fundamental's level, and the energy
    off the harmonics (self-oscillation, aliasing)."""
    x = mono(y)
    n, hop = 8192, 2048
    w = bh(n)
    f = np.fft.rfftfreq(n, 1 / SR)
    out = []
    for i in range(0, len(x) - n, hop):
        t = (i + n / 2) / SR
        fc = sweep_hz(t)
        if not (150 <= fc <= 6000):
            continue
        s = np.abs(np.fft.rfft(x[i:i + n] * w))
        p = s ** 2
        # harmonic amplitudes
        hs = np.arange(1, int(18000 / f0))
        amps = np.array([s[max(0, int(round(h * f0 * n / SR)) - 3):int(round(h * f0 * n / SR)) + 4].max() for h in hs])
        norm = amps * hs  # undo the saw's 1/n
        hz = hs * f0
        win = (hz >= fc / 2) & (hz <= fc * 2)
        pas = hz <= fc / 4
        if win.sum() == 0 or pas.sum() == 0:
            continue
        j = np.argmax(np.where(win, norm, 0))
        peak_db = 20 * math.log10(norm[j] / max(np.median(norm[pas]), 1e-12))
        near = np.zeros_like(f, bool)
        for h in hs:
            near |= np.abs(f - h * f0) < 6 * SR / n
        band = (f >= 30) & (f <= 20000)
        inh = p[band & ~near].sum() / max(p[band & near].sum(), 1e-30)
        # the strongest component off the harmonics, near the cutoff (a self-oscillating filter's sine)
        cand = np.where(band & ~near & (f > fc / 2) & (f < fc * 2), p, 0)
        k = np.argmax(cand)
        osc_hz = f[k] if cand[k] > 0 else float("nan")
        out.append({"t": t, "fc": fc, "peak_hz": float(hz[j]), "peak_db": peak_db, "fund_db": 20 * math.log10(amps[0] + 1e-12),
                    "inh_db": 10 * math.log10(max(inh, 1e-15)), "osc_hz": osc_hz, "osc_rel_db": 10 * math.log10(cand[k] / max(p[band].sum(), 1e-30) + 1e-15)})
    return out


def sweep_summary(fr):
    mid = [r for r in fr if 300 <= r["fc"] <= 3000]
    cents = [1200 * math.log2(r["peak_hz"] / r["fc"]) for r in mid]
    return {"peak_db": round(float(np.median([r["peak_db"] for r in mid])), 1),
            "peak_cents_median": round(float(np.median(cents)), 0),
            "inh_db": round(float(np.median([r["inh_db"] for r in mid])), 1),
            "inh_db_top": round(float(np.median([r["inh_db"] for r in fr if r["fc"] > 2500] or [float("nan")])), 1),
            "fund_db_at_1k": round(float(np.median([r["fund_db"] for r in fr if 800 <= r["fc"] <= 1250])), 1)}


def selfosc(fr):
    """At full resonance: does a sine ring on its own near the cutoff, and does it follow the cutoff?"""
    mid = [r for r in fr if 300 <= r["fc"] <= 3000 and not math.isnan(r["osc_hz"])]
    strong = [r for r in mid if r["osc_rel_db"] > -20]
    if len(strong) < max(3, len(mid) // 3):
        return {"self_osc": False, "osc_share": round(len(strong) / max(len(mid), 1), 2)}
    c = [1200 * math.log2(r["osc_hz"] / r["fc"]) for r in strong]
    # tracking: octaves of measured pitch per octave of cutoff
    lf = np.log2([r["fc"] for r in strong]); lo = np.log2([r["osc_hz"] for r in strong])
    slope = float(np.polyfit(lf, lo, 1)[0]) if len(strong) > 2 else float("nan")
    return {"self_osc": True, "osc_share": round(len(strong) / max(len(mid), 1), 2), "cents_median": round(float(np.median(c)), 0),
            "cents_spread": round(float(np.percentile(c, 90) - np.percentile(c, 10)), 0), "track_slope": round(slope, 3)}


# ── kicks ───────────────────────────────────────────────────────────────────
def kick(y):
    """The first hit: pitch over time (zero crossings of the signal under 400 Hz), the share of energy under
    100 Hz, the attack (time to the envelope's peak), the click (energy over 2 kHz in the first 5 ms) and how
    long it takes to fall 40 dB."""
    x = mono(y)[: int(0.98 * SR)]
    on = np.argmax(np.abs(x) > 1e-4 * np.abs(x).max() + 1e-12)
    x = x[on:]
    lo = sosfiltfilt(butter(4, 400, fs=SR, output="sos"), x)
    zc = np.where((lo[:-1] < 0) & (lo[1:] >= 0))[0]
    zc = zc + (-lo[zc] / (lo[zc + 1] - lo[zc]))
    per = np.diff(zc) / SR
    tmid = (zc[:-1] + zc[1:]) / 2 / SR
    def f_at(t):
        k = np.argmin(np.abs(tmid - t)) if len(tmid) else 0
        return float(1 / per[k]) if len(per) else float("nan")
    env = np.sqrt(np.convolve(x ** 2, np.ones(48) / 48, "same"))
    pk = int(np.argmax(env))
    after = np.where(env[pk:] < env[pk] * 0.01)[0]
    t40 = (pk + after[0]) / SR if len(after) else float("nan")
    first = x[: int(0.005 * SR)]
    hp = sosfiltfilt(butter(4, 2000, "high", fs=SR, output="sos"), x)[: int(0.005 * SR)]
    seg = x[: int(0.5 * SR)]
    lp100 = sosfiltfilt(butter(4, 100, fs=SR, output="sos"), seg)
    crest = 20 * math.log10(np.abs(x[: int(0.01 * SR)]).max() / max(np.sqrt((x[int(0.01 * SR):int(0.1 * SR)] ** 2).mean()), 1e-12))
    return {"f_5ms": round(f_at(0.005), 1), "f_20ms": round(f_at(0.02), 1), "f_100ms": round(f_at(0.1), 1), "f_300ms": round(f_at(0.3), 1),
            "low_share_db": round(10 * math.log10((lp100 ** 2).sum() / (seg ** 2).sum()), 2),
            "attack_ms": round(pk / SR * 1000, 2), "click_db": round(10 * math.log10((hp ** 2).sum() / max((first ** 2).sum(), 1e-30)), 1),
            "crest_db": round(crest, 1), "t40_ms": round(t40 * 1000, 0)}


# ── reverb ──────────────────────────────────────────────────────────────────
def rt60_band(h, fc):
    sos = butter(3, [fc / math.sqrt(2), min(fc * math.sqrt(2), SR / 2 * 0.99)], "band", fs=SR, output="sos")
    b = sosfiltfilt(sos, h)
    e = np.cumsum((b ** 2)[::-1])[::-1]
    edb = 10 * np.log10(e / e[0] + 1e-30)
    i5, i25 = np.argmax(edb <= -5), np.argmax(edb <= -25)
    if i25 <= i5:
        return float("nan")
    t = np.arange(i5, i25) / SR
    slope = np.polyfit(t, edb[i5:i25], 1)[0]
    return -60.0 / slope


def echo_density(h, win=0.02):
    """Abel and Huang's normalised echo density: in a sliding 20 ms window, the share of samples more than one
    standard deviation out, over what Gaussian noise gives (0.3173). 1 is a fully dense (noise-like) tail."""
    n = int(win * SR)
    out = []
    for i in range(0, len(h) - n, n // 4):
        w = h[i:i + n]
        sd = np.std(w)
        out.append(((np.abs(w) > sd).mean() / 0.3173 if sd > 0 else 0.0, (i + n / 2) / SR))
    return out


def reverb(y):
    h = mono(y)
    first = np.argmax(np.abs(h) > np.abs(h).max() * 1e-3)
    ned = echo_density(h[first:])
    t09 = next((t for v, t in ned if v >= 0.9), float("nan"))
    t095 = next((t for v, t in ned if v >= 0.95), float("nan"))
    ned_50 = float(np.mean([v for v, t in ned if t <= 0.05]))
    ned_100 = float(np.mean([v for v, t in ned if 0.05 < t <= 0.1]))
    # Modal smoothness: one long look at the tail with the decay taken off, each bin against its neighbours
    # (a third of an octave). Noise gives 0.56; ringing modes pull it down.
    a, b = first + int(0.3 * SR), first + int(1.3 * SR)
    seg = h[a:b]
    env = np.sqrt(np.convolve(seg ** 2, np.ones(2400) / 2400, "same")) + 1e-12
    s = np.abs(np.fft.rfft(seg / env * bh(len(seg)))) ** 2
    f = np.fft.rfftfreq(len(seg), 1 / SR)
    flats = []
    for lo in np.geomspace(200, 8000, 40):
        m = (f >= lo) & (f < lo * 2 ** (1 / 3))
        v = s[m]
        flats.append(np.exp(np.mean(np.log(v + 1e-30))) / v.mean())
    st = y[a:b]
    corr = float(np.corrcoef(st[:, 0], st[:, 1])[0, 1]) if y.shape[1] > 1 else 1.0
    return {"rt60": {str(fc): round(rt60_band(h[first:], fc), 2) for fc in [125, 250, 500, 1000, 2000, 4000, 8000]},
            "first_ms": round(first / SR * 1000, 1), "ned_0_50ms": round(ned_50, 2), "ned_50_100ms": round(ned_100, 2),
            "dense_09_ms": round(t09 * 1000, 0), "dense_095_ms": round(t095 * 1000, 0),
            "flatness": round(float(np.mean(flats)), 3), "lr_corr_tail": round(corr, 3)}


# ── tape ────────────────────────────────────────────────────────────────────
def tape_sine(y):
    """A 1 kHz sine through the tape: the pitch wobble (cents, from the analytic signal), its main rate, the
    harmonics against the fundamental, and the level change against the input."""
    x = mono(y)[int(0.5 * SR):int(3.9 * SR)]
    bp = sosfiltfilt(butter(4, [700, 1400], "band", fs=SR, output="sos"), x)
    ph = np.unwrap(np.angle(hilbert(bp)))
    inst = np.diff(ph) * SR / (2 * np.pi)
    inst = sosfiltfilt(butter(2, 40, fs=SR, output="sos"), inst)[2400:-2400]
    cents = 1200 * np.log2(np.maximum(inst, 1) / np.median(inst))
    d = cents[::48]  # 1 kHz rate
    spec = np.abs(np.fft.rfft((d - d.mean()) * np.hanning(len(d))))
    fr = np.fft.rfftfreq(len(d), 1 / 1000)
    m = (fr > 0.1) & (fr < 20)
    rate = float(fr[m][np.argmax(spec[m])])
    flut = sosfiltfilt(butter(2, [3, 20], "band", fs=1000, output="sos"), d)
    n = 65536
    s = np.abs(np.fft.rfft(x[:n] * bh(n)))
    f = np.fft.rfftfreq(n, 1 / SR)
    def amp(h):
        m = np.abs(f - 1000 * h) < 30
        return np.sqrt((s[m] ** 2).sum())
    a1 = amp(1)
    return {"wow_pp_cents": round(float(np.percentile(cents, 99) - np.percentile(cents, 1)), 2), "wow_rate_hz": round(rate, 2),
            "flutter_rms_cents": round(float(np.std(flut)), 3), "h2_db": round(20 * math.log10(amp(2) / a1 + 1e-12), 1),
            "h3_db": round(20 * math.log10(amp(3) / a1 + 1e-12), 1), "h5_db": round(20 * math.log10(amp(5) / a1 + 1e-12), 1),
            "out_rms_db": round(20 * math.log10(np.sqrt((x ** 2).mean()) + 1e-12), 2)}


# ── the pairs ───────────────────────────────────────────────────────────────
def side(d):
    r = {}
    for osc in ["saw", "table"]:
        a = {}
        for n in [84, 96, 102, 108]:
            y = load(d, f"alias_{osc}_{n}")
            if y is not None:
                a[str(n)] = round(alias_db(y, n, sub=(osc == "table" and "ours" in d)), 1)
        if a:
            r[f"alias_{osc}"] = a
    y = load(d, "supersaw")
    if y is not None:
        r["supersaw"] = {**stereo(y), "lufs": round(lufs(y), 1)}
    filt = {}
    for f in sorted(os.listdir(d)):
        if f.startswith("filt_") and f.endswith(".wav"):
            k = f[5:-4]
            fr = sweep(load(d, f[:-4]))
            filt[k] = selfosc(fr) if "_r10_" in k else sweep_summary(fr)
    if filt:
        r["filters"] = filt
    for name in ["acid", "fm_ep", "fm_bell", "pad"]:
        y = load(d, name)
        if y is not None:
            r[name] = {"lufs": round(lufs(y), 1), **stereo(y)}
    for name in ["fm_bell"]:
        y = load(d, name)
        if y is not None:
            # the bell's highest note (88, 1319 Hz): energy off its harmonics in the strike's first 250 ms
            seg = y[int(2.4 * SR):int(2.4 * SR) + 12000]
            x = mono(seg); n = len(x); s = np.abs(np.fft.rfft(x * bh(n))) ** 2; f = np.fft.rfftfreq(n, 1 / SR); f0 = note_hz(88)
            near = np.abs(f - np.maximum(np.round(f / f0), 1) * f0) < 8 * SR / n
            band = (f >= 30) & (f <= 20000)
            r[name]["alias_top_db"] = round(10 * math.log10(s[band & ~near].sum() / s[band & near].sum()), 1)
    for name in ["kick_808", "kick_techno"]:
        y = load(d, name)
        if y is not None:
            r[name] = {**kick(y), "lufs": round(lufs(y), 1)}
    for name in ["hall", "plate"]:
        y = load(d, f"ir_{name}")
        if y is not None:
            r[f"ir_{name}"] = reverb(y)
    tp = {}
    for db in [24, 18, 12, 6, 0]:
        y = load(d, f"tape_sine_{db}")
        if y is not None:
            tp[f"-{db}"] = tape_sine(y)
    if tp:
        r["tape"] = tp
    return r


if __name__ == "__main__":
    print(json.dumps({d.rstrip("/").split("/")[-1] if "ours" in d else "/".join(d.rstrip("/").split("/")[-2:]): side(d) for d in sys.argv[1:]}, indent=1))
