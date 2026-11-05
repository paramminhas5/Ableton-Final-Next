"""CPU of one voice (instruments) or one effect, through pedalboard: best of three 10 s renders, as a share
of one core. Includes pedalboard's own overhead (small at 512-frame blocks)."""
import sys, time, numpy as np
sys.path.insert(0, sys.argv[1]); import sh
sys.argv = [sys.argv[0], sys.argv[1], "/tmp"]; import theirs as T, jstate
def inst(p, note=60, secs=10.0):
    best = 1e9
    for _ in range(3):
        p.reset(); t = time.perf_counter()
        p([(bytes([0x90, note, 100]), 0.0)], duration=secs, sample_rate=sh.SR, num_channels=2, buffer_size=512, reset=False)
        best = min(best, time.perf_counter() - t)
    return best / secs * 100
def eff(p, secs=10.0):
    x = (np.random.default_rng(1).standard_normal((2, int(secs * sh.SR))) * 0.1).astype(np.float32)
    best = 1e9
    for _ in range(3):
        p.reset(); t = time.perf_counter(); p(x, sh.SR, buffer_size=512, reset=False); best = min(best, time.perf_counter() - t)
    return best / secs * 100
out = {}
p = sh.load("surge"); jstate.surge_xml(p, {"activate": ["a_filter1_type", "a_filter2_type", "a_wstype"]}); p([], duration=0.1, sample_rate=sh.SR, num_channels=2, buffer_size=256, reset=False)
T.surge_init(p); out["surge saw, 1 voice"] = inst(p)
sh.setp(p, "a_osc_1_unison_voices", "7 voices"); out["surge supersaw (7 unison), 1 note"] = inst(p)
T.surge_init(p); sh.setp(p, "a_filter_1_type", "LP Vintage Ladder"); out["surge saw + vintage ladder, 1 voice"] = inst(p)
v = sh.load("vital"); T.vital_init(v); out["vital saw, 1 voice"] = inst(v)
sh.setp(v, "oscillator_1_unison_voices", "7v"); out["vital supersaw (7 unison), 1 note"] = inst(v)
T.vital_init(v); sh.setp(v, "filter_1_switch", "On"); sh.setp(v, "filter_1_model", "Ladder"); out["vital saw + ladder, 1 voice"] = inst(v)
d = sh.load("dexed"); T.dexed_patch(d, 1); out["dexed 2-op, 1 voice"] = inst(d)
o = sh.load("odin"); out["odin 2 init (1 voice)"] = inst(o)
for k in ["hall", "plate", "chow"]: out[f"{k} (stereo effect)"] = eff(sh.load(k))
for k, v_ in out.items(): print(f"{k}: {v_:.2f}%")
