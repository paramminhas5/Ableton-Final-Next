"""Their side of the sound shootout. Init-style patches written here, no factory presets.
Usage: python3 -I theirs.py <tools dir> <out dir> [prefix]"""
import sys, math, numpy as np
sys.path.insert(0, sys.argv[1])
import sh, jstate
OUT = sys.argv[2]; ONLY = sys.argv[3] if len(sys.argv) > 3 else ""
def want(n): return n.startswith(ONLY) or ONLY.startswith(n.split("_")[0]) if ONLY else True
def save(n, y):
    sh.save(f"{OUT}/{n}.wav", y); print(n, y.shape[0] / sh.SR, "s peak", float(np.abs(y).max()), flush=True)
V = lambda v: int(round(v * 127))
def sweep_hz(t):
    x = min(max((t - 0.25) / 4.0, 0.0), 1.0); return 100.0 * 80 ** x
SUPERSAW = [(0.0, 69, 0.9, V(0.8)), (1.0, 72, 0.4, V(0.8)), (1.5, 76, 0.4, V(0.8)), (2.0, 74, 1.4, V(0.8))]
ACID_BPM = 130.0
ACID = [(0, 33, 1, 0), (2, 33, 0, 0), (3, 45, 0, 1), (4, 43, 1, 0), (6, 33, 0, 0), (7, 36, 0, 1), (8, 38, 1, 0), (10, 33, 0, 0),
        (11, 45, 1, 0), (12, 33, 0, 1), (13, 40, 0, 0), (14, 31, 1, 0), (15, 33, 0, 0), (16, 33, 1, 0), (18, 45, 0, 1), (19, 43, 0, 0)]
def acid_notes():
    step = 60 / ACID_BPM / 4; out = []
    for bar in range(2):
        for k, (s, n, acc, slide) in enumerate(ACID):
            if s >= 16: continue
            nxt = ACID[k + 1][0] if k + 1 < len(ACID) and ACID[k + 1][0] < 16 else 16
            ln = (nxt - s) * step + 0.02 if slide else step * 0.55
            out.append(((bar * 16 + s) * step, n, ln, V(1.0 if acc else 0.7)))
    return out

# ── Surge XT ────────────────────────────────────────────────────────────────
def surge_init(p):
    for k, v in [("a_osc_1_type", "Classic"), ("a_osc_1_unison_voices", "1 voice"), ("a_osc_2_mute", "On"), ("a_osc_3_mute", "On"),
                 ("a_noise_mute", "On"), ("a_filter_1_type", "Off"), ("a_filter_2_type", "Off"), ("a_waveshaper_type", "Off"),
                 ("a_filter_configuration", "Serial 1"), ("a_play_mode", "Poly"), ("character", "Neutral")]:
        sh.setp(p, k, v)
    for k, r in [("a_osc_1_shape", 0.5), ("a_osc_drift", 0.0), ("a_highpass", 0.0), ("a_amp_eg_attack", 0.0), ("a_amp_eg_sustain", 1.0),
                 ("a_filter_1_feg_mod_amount", 0.5), ("a_filter_1_keytrack", 0.5), ("a_osc_1_volume", 1.0), ("a_volume", 0.8908990025520325),
                 ("a_filter_1_resonance", 0.0)]:
        sh.raw(p, k, r)
    sh.setp(p, "a_amp_eg_release", 30.0)
    for slot in ["a1", "a2", "b1", "b2", "s1", "s2", "g1", "g2", "a3", "a4", "b3", "b4", "s3", "s4", "g3", "g4"]:
        sh.setp(p, f"fx_{slot}_fx_type", "Off")
SURGE_CUT = lambda hz: math.log(hz / 13.75) / math.log(25087.71 / 13.75)

def surge():
    p = sh.load("surge")
    # The init patch has its filter slots switched off ("deactivated"), which only the editor can undo;
    # switch them on in the patch itself, then let the plugin load it.
    jstate.surge_xml(p, {"activate": ["a_filter1_type", "a_filter2_type", "a_wstype"]})
    p([], duration=0.1, sample_rate=sh.SR, num_channels=2, buffer_size=256, reset=False)
    surge_init(p)
    if want("alias"):
        for n in [84, 96, 102, 108]:
            save(f"alias_saw_{n}", sh.render(p, [(0.0, n, 1.2, V(0.9))], 1.5))
    if want("supersaw"):
        surge_init(p)
        sh.setp(p, "a_osc_1_unison_voices", "7 voices")
        sh.setp(p, "a_filter_configuration", "Wide")  # Surge's own default: the unison voices spread in stereo
        sh.setp(p, "a_osc_1_unison_detune", 22.0)  # outer voices at +-22 cents, as ours at detune 0.6
        sh.setp(p, "a_amp_eg_release", 300.0)
        save("supersaw", sh.render(p, SUPERSAW, 4.0))
    if want("filt"):
        for cname, typ, subs in [("ladder", "LP Vintage Ladder", ["Type 1", None]), ("k35", "LP K35", ["No Saturation", "Heavy Saturation"]),
                                 ("obxd12", "LP OB-Xd 12 dB", ["Standard", "Pushed"])]:
            for res in [0.3, 0.6, 0.9, 1.0]:
                for di, sub in enumerate(subs):
                    if sub is None or (res >= 1.0 and di > 0): continue
                    surge_init(p)
                    sh.setp(p, "a_filter_1_type", typ); sh.setp(p, "a_filter_1_subtype", sub)
                    sh.raw(p, "a_filter_1_resonance", res)
                    par = p.parameters["a_filter_1_cutoff"]
                    def auto(t, par=par): par.raw_value = SURGE_CUT(sweep_hz(t))
                    auto(0.0)
                    save(f"filt_{cname}_r{round(res*10):02d}_d{6 if di else 0:02d}", sh.render(p, [(0.0, 36, 4.6, V(0.9))], 4.5, auto=auto))

# ── Vitalium ────────────────────────────────────────────────────────────────
VITAL_CUT = lambda hz: ((69 + 12 * math.log2(hz / 440.0)) - 8.0) / 128.0
def vital_init(p):
    for k, v in [("oscillator_1_unison_voices", "1v"), ("filter_1_switch", "Off"), ("filter_2_switch", "Off"), ("oscillator_2_switch", "Off"),
                 ("oscillator_3_switch", "Off"), ("sample_switch", "Off"), ("chorus_switch", "Off"), ("reverb_switch", "Off"), ("delay_switch", "Off"),
                 ("distortion_switch", "Off"), ("compressor_switch", "Off"), ("eq_switch", "Off"), ("legato", "Off")]:
        sh.setp(p, k, v)
    for k, r in [("oscillator_1_wave_frame", 0.0), ("filter_1_drive", 0.0), ("filter_1_key_track", 0.5), ("filter_1_mix", 1.0),
                 ("oscillator_1_distortion_type", 0.0), ("envelope_1_attack", 0.0), ("envelope_1_sustain", 1.0)]:
        sh.raw(p, k, r)
    sh.setp(p, "oscillator_1_level", 0.5); sh.setp(p, "envelope_1_release", 0.03)

def vital():
    p = sh.load("vital")
    vital_init(p)
    if want("alias"):
        for n in [84, 96, 102, 108]:
            save(f"alias_saw_{n}", sh.render(p, [(0.0, n, 1.2, V(0.9))], 1.5))
    if want("supersaw"):
        vital_init(p)
        sh.setp(p, "oscillator_1_unison_voices", "7v")
        sh.setp(p, "oscillator_1_unison_detune", 11.0)  # outer voices at +-22 cents (measured with two voices)
        sh.setp(p, "envelope_1_release", 0.3)
        save("supersaw", sh.render(p, SUPERSAW, 4.0))
    if want("filt"):
        for cname, model, style in [("ladder", "Ladder", "24dB"), ("analog", "Analog", "12dB"), ("digital", "Digital", "12dB")]:
            for res in [0.3, 0.6, 0.9, 1.0]:
                for drv in [0.0, 12.0]:
                    if res >= 1.0 and drv > 0: continue
                    vital_init(p)
                    sh.setp(p, "filter_1_switch", "On"); sh.setp(p, "filter_1_model", model); sh.setp(p, "filter_1_style", style)
                    sh.raw(p, "filter_1_resonance", res); sh.setp(p, "filter_1_drive", drv) if drv else sh.raw(p, "filter_1_drive", 0.0)
                    par = p.parameters["filter_1_cutoff"]
                    def auto(t, par=par): par.raw_value = VITAL_CUT(sweep_hz(t))
                    auto(0.0)
                    save(f"filt_{cname}_r{round(res*10):02d}_d{6 if drv else 0:02d}", sh.render(p, [(0.0, 36, 4.6, V(0.9))], 4.5, auto=auto))
    if want("pad"):
        vital_init(p)
        sh.setp(p, "filter_1_switch", "On"); sh.setp(p, "filter_1_model", "Analog"); sh.setp(p, "filter_1_style", "12dB")
        p.parameters["filter_1_cutoff"].raw_value = VITAL_CUT(4600.0); sh.raw(p, "filter_1_resonance", 0.1)
        sh.setp(p, "envelope_1_attack", 0.8); sh.setp(p, "envelope_1_release", 0.6)
        ev = [(0.0, 57, 1.8, V(0.7)), (0.0, 60, 1.8, V(0.7)), (0.0, 64, 1.8, V(0.7)), (2.0, 55, 1.8, V(0.7)), (2.0, 59, 1.8, V(0.7)), (2.0, 62, 1.8, V(0.7))]
        save("pad", sh.render(p, ev, 4.6))

# ── Odin 2 ──────────────────────────────────────────────────────────────────
def odin():
    p = sh.load("odin")
    # Types live in the patch, not in host knobs: one analog saw, filter 1 the diode ladder, mono legato.
    jstate.xml_attrs(p, {"osc1_type": 2, "osc1_analog_wave": 0, "osc2_type": 1, "osc3_type": 1, "fil1_type": 19, "fil2_type": 1,
                         "fil3_type": 1, "legato": 1, "unison_voices": 1, "dist_on": 0})
    p([], duration=0.1, sample_rate=sh.SR, num_channels=2, buffer_size=256, reset=False)
    for k, v in [("filter1_frequency", 260.0), ("filter1_resonance", 0.75), ("filter1_envelope_amount", 0.65), ("filter1_saturation", 0.3),
                 ("filter1_velocity_amount", 0.3), ("filter1_to_amplifier", 1), ("filter2_to_amplifier", 0),
                 ("filterenv_attack", 0.001), ("filterenv_decay", 0.25), ("filterenv_sustain", 0.0), ("filterenv_release", 0.05),
                 ("ampenv_attack", 0.0015), ("ampenv_decay", 0.45), ("ampenv_sustain", 0.55), ("ampenv_release", 0.045),
                 ("amplifier_velocity", 0.35), ("glide", 0.15), ("osc1_drift", 0.0), ("osc1_volume", 0.0)]:
        sh.setp(p, k, v) if isinstance(v, float) else sh.raw(p, k, v)
    for k in ["filter1_frequency", "filter1_resonance", "filter1_envelope_amount", "glide", "ampenv_decay", "filterenv_decay"]:
        print("  odin", k, p.parameters[k].string_value)
    if want("acid"):
        save("acid", sh.render(p, acid_notes(), 60 / ACID_BPM * 8 + 0.4))

# ── Dexed ───────────────────────────────────────────────────────────────────
def dexed_patch(p, ratio):
    """Algorithm 1 with only operators 1 (carrier) and 2 (its modulator) sounding: the 2-op patch ours is.
    Dexed's knobs are whole numbers, so each is set exactly from its range (a search on the shown text can
    land a step off, and a pitch envelope level a step off 50 detunes every note)."""
    def d(name, v):
        lo, hi = p.parameters[name].range[:2]
        p.parameters[name].raw_value = (v - lo) / (hi - lo)
    d("algorithm", 1); d("feedback", 0); sh.setp(p, "monomode", "POLY"); d("transpose", 0)
    sh.raw(p, "cutoff", 1.0); sh.raw(p, "resonance", 0.0); sh.raw(p, "master_tune_adj", 0.5)
    d("lfo_pm_depth", 0); d("lfo_am_depth", 0)
    for i in range(1, 5): d(f"pitch_eg_level_{i}", 50); d(f"pitch_eg_rate_{i}", 99)
    for op in range(1, 7):
        for k in ["l_scale_depth", "r_scale_depth", "rate_scaling", "a_mod_sens", "key_velocity", "f_fine"]: d(f"op{op}_{k}", 0)
        d(f"op{op}_osc_detune", 0); sh.setp(p, f"op{op}_mode", "RATIO")
        if op > 2: d(f"op{op}_output_level", 0)
    # Carrier: instant attack, a slow fall to a sustain about 1.5 dB down, a release of about 370 ms.
    for k, v in [("rate_1", 99), ("rate_2", 75), ("rate_3", 99), ("rate_4", 70), ("level_1", 99), ("level_2", 97), ("level_3", 97), ("level_4", 0)]:
        d(f"op1_eg_{k}", v)
    d("op1_output_level", 99); d("op1_f_coarse", 1)
    # Modulator: an index of about 3 at the strike settling to about 1.6 over a few hundred ms (ours: 3.0 to 1.6).
    for k, v in [("rate_1", 99), ("rate_2", 65), ("rate_3", 99), ("rate_4", 70), ("level_1", 99), ("level_2", 92), ("level_3", 92), ("level_4", 0)]:
        d(f"op2_eg_{k}", v)
    d("op2_output_level", 82); d("op2_f_coarse", ratio)

def dexed():
    p = sh.load("dexed")
    if want("fm"):
        dexed_patch(p, 1)
        ep = [(0.0, 57, 1.4, V(0.8)), (0.0, 60, 1.4, V(0.8)), (0.0, 64, 1.4, V(0.8)), (1.6, 55, 1.4, V(0.8)), (1.6, 59, 1.4, V(0.8)), (1.6, 62, 1.4, V(0.8))]
        save("fm_ep", sh.render(p, ep, 3.6))
        dexed_patch(p, 4)
        save("fm_bell", sh.render(p, [(0.0, 76, 0.3, V(0.9)), (0.8, 81, 0.3, V(0.9)), (1.6, 84, 0.3, V(0.9)), (2.4, 88, 0.3, V(0.9))], 3.6))

# ── Dragonfly Hall and Plate ─────────────────────────────────────────────────
def dragonfly():
    import soundfile as sf
    D = sys.argv[5]  # our dry renders
    imp = np.zeros((1, 2), np.float32); imp[0] = 1.0
    srcs = {"ir": imp, "snare": sf.read(f"{D}/dry_snare.wav", dtype="float32")[0], "chord": sf.read(f"{D}/dry_chord.wav", dtype="float32")[0]}
    tails = {"ir": 6.0, "snare": 3.4, "chord": 2.8}
    for name in ["hall", "plate"]:
        p = sh.load(name)
        sh.setp(p, "dry_level", 0.0); sh.setp(p, "decay_s", 2.4); sh.setp(p, "low_cut_hz", 200.0)
        if name == "hall":
            sh.setp(p, "predelay_ms", 18.0)  # ours waits 18 ms
        else:
            sh.setp(p, "wet_level", 100.0); sh.setp(p, "predelay_ms", 0.0)
        for k in ["decay_s", "predelay_ms", "low_cut_hz"]: print("  ", name, k, p.parameters[k].string_value)
        for src, x in srcs.items():
            mono = x.mean(1, keepdims=True) if x.shape[0] > 1 else x[:, :1]
            y = sh.fx(p, np.repeat(mono, 2, 1), tail=tails[src])
            save(f"ir_{name}" if src == "ir" else f"{name}_{src}_wet", y)

# ── CHOW Tape ───────────────────────────────────────────────────────────────
def chow():
    import soundfile as sf
    D = sys.argv[5]
    p = sh.load("chow")
    for k, v in [("wow_depth", 0.25), ("wow_rate", 0.25), ("flutter_depth", 0.25), ("flutter_rate", 0.3), ("compression_on_off", "Off"),
                 ("degrade_on_off", "Off"), ("chew_on_off", "Off"), ("dry_wet", 100.0), ("input_gain", 0.0), ("output_gain", 0.0)]:
        sh.setp(p, k, v) if isinstance(v, (str, float)) and not isinstance(v, bool) else sh.raw(p, k, v)
    for db in [24, 18, 12, 6, 0]:
        a = 10 ** (-db / 20); t = np.arange(int(4 * sh.SR)) / sh.SR
        x = (a * np.sin(2 * np.pi * 1000 * t)).astype(np.float32)
        save(f"tape_sine_{db}", sh.fx(p, np.stack([x, x], 1)))
    c = sf.read(f"{D}/dry_chord.wav", dtype="float32")[0].mean(1) * 4.0
    save("tape_chord", sh.fx(p, np.stack([c, c], 1)))

# ── Geonkick (LV2, through tools/lv2host) ───────────────────────────────────
def gk_osc(enabled, freq=100.0, fpts=None, apts=None, amp=1.0, function=0):
    return {"enabled": enabled, "is_fm": False, "function": function, "phase": 0.0, "seed": 0,
            "ampl_env": {"amplitude": amp, "points": apts or [[0.0, 1.0], [1.0, 1.0]]},
            "freq_env": {"amplitude": freq, "points": fpts or [[0.0, 1.0], [1.0, 1.0]]},
            "filter": {"enabled": False, "type": 0, "cutoff": 800.0, "cutoff_env": [[0.0, 1.0], [1.0, 1.0]], "factor": 10.0}}

def gk_kick(length_ms, f_start, fpts, apts, drive=None):
    """An init-style Geonkick kick written here: one sine (layer 1, oscillator 1) with a pitch and an
    amplitude envelope, everything else off; for the techno kick, its distortion on."""
    k = {f"osc{i}": gk_osc(False) for i in range(9)}
    k["osc0"] = gk_osc(True, f_start, fpts, [[0.0, 1.0], [1.0, 1.0]])
    k["kick"] = {"PercussionAppVersion": 131328, "id": 0, "channel": 0, "name": "shootout", "playing_key": -1, "layers": [0],
                 "layers_amplitude": [1.0, 1.0, 1.0], "limiter": 1.0, "tuned_output": False,
                 "ampl_env": {"amplitude": 1.0, "length": length_ms, "points": apts},
                 "filter": {"enabled": False, "type": 0, "cutoff": 800.0, "factor": 10.0, "cutoff_env": [[0.0, 1.0], [1.0, 1.0]]},
                 "compressor": {"enabled": False, "attack": 0.01, "release": 0.01, "threshold": 0.001, "ratio": 1.0, "knee": 0.001, "makeup": 1.0},
                 "distortion": {"enabled": drive is not None, "in_limiter": 1.0, "volume": 1.0 if drive is None else 0.5, "drive": drive or 1.0,
                                "drive_env": [[0.0, 1.0], [1.0, 1.0]]}}
    return k

def geonkick():
    import json, subprocess, soundfile as sf
    host = sys.argv[1] + "/lv2host/host"
    env = dict(__import__("os").environ, LV2_PATH=sh.S + "/dl/geonkick/x/usr/lib/lv2")
    # Pitch and amplitude shaped after ours (measured: 808 224 Hz at 5 ms, 84 at 20 ms, 48 at 100 ms, 46 at 300 ms,
    # down 40 dB at 415 ms; techno 196 / 62 / 46 / 45 Hz, 306 ms), each point a share of the kick's length.
    kicks = {
        "kick_808": gk_kick(700.0, 260.0, [[0.0, 1.0], [0.007, 0.86], [0.029, 0.32], [0.08, 0.2], [0.143, 0.185], [0.43, 0.177], [1.0, 0.173]],
                            [[0.0, 1.0], [0.05, 0.85], [0.2, 0.45], [0.45, 0.15], [0.7, 0.04], [1.0, 0.0]]),
        "kick_techno": gk_kick(500.0, 240.0, [[0.0, 1.0], [0.01, 0.82], [0.04, 0.26], [0.1, 0.2], [0.2, 0.192], [0.6, 0.188], [1.0, 0.186]],
                               [[0.0, 1.0], [0.06, 0.8], [0.25, 0.4], [0.55, 0.12], [0.8, 0.03], [1.0, 0.0]], drive=3.0),
    }
    # The plugin's own default state (saved from a fresh instance), with our kick in its one percussion slot.
    base = json.loads(open(f"{OUT}/default_state.json").read().rstrip("\x00"))
    def merge(a, b):
        for key, v in b.items():
            if isinstance(v, dict) and isinstance(a.get(key), dict): merge(a[key], v)
            else: a[key] = v
    for name, k in kicks.items():
        js = f"{OUT}/{name}.json"; raw = f"{OUT}/{name}.raw"
        st = json.loads(json.dumps(base)); perc = st["KitState"]["percussions"][0]
        for key in ["name", "id", "PercussionAppVersion"]: k["kick"].pop(key, None)
        merge(perc, k)
        open(js, "w").write(json.dumps(st))
        r = subprocess.run([host, "http://geontime.com/geonkick/single", "http://geontime.com/geonkick/single#state", js, raw, "2.0",
                            "36:0.0:127", "36:1.0:127"], env=env, capture_output=True, text=True)
        print(r.stderr.strip())
        y = np.fromfile(raw, np.float32).reshape(-1, 2)
        save(name, y)

if __name__ == "__main__":
    which = sys.argv[4].split(",") if len(sys.argv) > 4 else ["surge"]
    for w in which: globals()[w]()
