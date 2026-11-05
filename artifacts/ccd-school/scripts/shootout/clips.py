"""The blind pairs for /sound/compare: each side's render, loudness-matched to -16 LUFS (BS.1770 integrated),
encoded as 224 kb/s mp3 (LAME), into public/audio/compare/<pair>/<side>.mp3.

Usage: python3 -I clips.py <theirs root> <ours before dir> <ours after dir> <out dir>
Reverbs are heard as a mix: the dry sound plus its wet sound, the wet set 8 LU under the dry on both sides
(the same rule for every reverb), so the reverbs are compared at the same send.
"""
import json, os, subprocess, sys, tempfile
import numpy as np
import pyloudnorm as pyln
import soundfile as sf

SR = 48000
THEIRS, BEFORE, AFTER, OUT = sys.argv[1:5]
M = pyln.Meter(SR)

# pair id, their plugin folder, their file, our file (the same name unless given), seconds kept
PAIRS = [
    ("supersaw-surge", "surge", "supersaw", None, 4.0),
    ("supersaw-vital", "vital", "supersaw", None, 4.0),
    ("ladder-surge", "surge", "filt_ladder_r09_d00", "filt_prd_r09_d00", 4.5),
    ("ladder-vital", "vital", "filt_ladder_r09_d00", "filt_prd_r09_d00", 4.5),
    ("ms2-k35", "surge", "filt_k35_r06_d06", "filt_ms2_r06_d06", 4.5),
    ("svf-digital", "vital", "filt_digital_r09_d00", "filt_svf_r09_d00", 4.5),
    ("acid-odin", "odin", "acid", None, 4.0),
    ("ep-dexed", "dexed", "fm_ep", None, 3.6),
    ("bell-dexed", "dexed", "fm_bell", None, 3.6),
    ("pad-vital", "vital", "pad", None, 4.6),
    ("kick808-geonkick", "geonkick", "kick_808", None, 2.0),
    ("kicktechno-geonkick", "geonkick", "kick_techno", None, 2.0),
    ("hall-snare", "dragonfly", "hall_snare_wet", None, 3.4),
    ("hall-chord", "dragonfly", "hall_chord_wet", None, 3.6),
    ("plate-snare", "dragonfly", "plate_snare_wet", None, 3.4),
    ("plate-chord", "dragonfly", "plate_chord_wet", None, 3.6),
    ("tape-chow", "chow", "tape_chord", None, 1.2),
]


def read(path):
    y, sr = sf.read(path, dtype="float64", always_2d=True)
    assert sr == SR
    return y


def lufs(y):
    return M.integrated_loudness(y)


def with_dry(wet, name, drydir):
    """A reverb's wet render plus the dry sound it was fed, wet 8 LU under the dry."""
    dry = read(os.path.join(drydir, "dry_snare.wav" if "snare" in name else "dry_chord.wav"))
    n = max(len(wet), len(dry))
    pad = lambda x: np.vstack([x, np.zeros((n - len(x), 2))])
    wet, dry = pad(wet), pad(dry)
    g = 10 ** ((lufs(dry) - 8.0 - lufs(wet)) / 20)
    return dry + wet * g


def prep(path, name, secs, drydir):
    y = read(path)
    if "_wet" in name:
        y = with_dry(y, name, drydir)
    y = y[: int(secs * SR)]
    # a 5 ms fade at both ends so the loop never clicks
    f = int(0.005 * SR)
    ramp = np.linspace(0, 1, f)[:, None]
    y[:f] *= ramp
    y[-f:] *= ramp[::-1]
    return y


def main():
    index = []
    total = 0
    for pid, plug, theirs, ours, secs in PAIRS:
        ours = ours or theirs
        sides = {"theirs": os.path.join(THEIRS, plug, theirs + ".wav"), "ours": os.path.join(BEFORE, ours + ".wav"), "after": os.path.join(AFTER, ours + ".wav")}
        # their reverbs were fed our dry renders from before; ours after were fed the after ones
        dry = {"theirs": BEFORE, "ours": BEFORE, "after": AFTER}
        ys = {k: prep(p, theirs if k == "theirs" else ours, secs, dry[k]) for k, p in sides.items()}
        # "after" only when the engine change moved it (renders are deterministic, so equal means unchanged)
        changed = not (ys["after"].shape == ys["ours"].shape and np.max(np.abs(ys["after"] - ys["ours"])) < 1e-7)
        if not changed:
            del ys["after"]
        gains = {k: 10 ** ((-16.0 - lufs(y)) / 20) for k, y in ys.items()}
        peak = max(np.abs(y).max() * gains[k] for k, y in ys.items())
        # if -16 LUFS would clip any side, the whole pair goes down together, so it stays matched
        trim = min(1.0, 0.97 / peak)
        os.makedirs(os.path.join(OUT, pid), exist_ok=True)
        for k, y in ys.items():
            z = y * gains[k] * trim
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as t:
                sf.write(t.name, z, SR, subtype="PCM_24")
                dst = os.path.join(OUT, pid, k + ".mp3")
                subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", t.name, "-c:a", "libmp3lame", "-b:a", "224k", dst], check=True)
                os.unlink(t.name)
            total += os.path.getsize(dst)
        index.append({"id": pid, "plugin": plug, "lufs": round(-16.0 + 20 * np.log10(trim), 1), "after": changed})
        print(pid, "after" if changed else "unchanged", f"trim {20 * np.log10(trim):.1f} dB", flush=True)
    json.dump(index, open(os.path.join(OUT, "index.json"), "w"), indent=1)
    print(f"total {total / 1e6:.2f} MB")


main()
