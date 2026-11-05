"""Cut Param's dj picks into deck-ready files for CCD's private bank. Never run into the repo.

Usage: python3 -I scripts/bank/chop.py <folder of the original files> <out folder outside the repo>

For every track in src/content/djTracks.ts it writes <out>/<id>/full.ogg (the whole track, 160 kbps) and one
16-bar chop per cue (intro.ogg, drums-in.ogg, break.ogg, drop.ogg), cut on the measured bpm from the cue's
bar. Upload <out> to a private bucket and set NEXT_PUBLIC_CCD_BANK_URL to its signed or gated base url only
once CCD has the rights to stream these tracks to learners (design/dj-bank-private.md).
"""
import json, os, re, subprocess, sys

src, out = sys.argv[1], sys.argv[2]
here = os.path.dirname(os.path.abspath(__file__))
repo = os.path.abspath(os.path.join(here, "..", ".."))
if os.path.abspath(out).startswith(os.path.abspath(os.path.join(repo, "..", ".."))):
    sys.exit("refusing to write audio inside the repo")
ts = open(os.path.join(repo, "src", "content", "djTracks.ts")).read()
rows = re.findall(r'real\("([^"]+)", "[^"]*", "([^"]*)", "([^"]*)", ([\d.]+), "[^"]+", "[^"]+", "[^"]+", \d+, \[(.*?)\]\)', ts)
files = os.listdir(src)
for tid, artist, title, bpm, cues in rows:
    bpm = float(bpm)
    words = [w for w in re.split(r"[^a-z0-9]+", (artist + " " + title.split(" (")[0]).lower()) if w]
    match = next((f for f in files if all(w in re.sub(r"[^a-z0-9]+", " ", f.lower()) for w in words)), None)
    if not match:
        print("no file for", tid); continue
    d = os.path.join(out, tid); os.makedirs(d, exist_ok=True)
    path = os.path.join(src, match)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", path, "-c:a", "libvorbis", "-b:a", "160k", os.path.join(d, "full.ogg")], check=True)
    for name, bar in re.findall(r'name: "([^"]+)", bar: (\d+)', cues):
        start = (int(bar) - 1) * 4 * 60 / bpm
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", f"{start:.3f}", "-t", f"{16 * 4 * 60 / bpm:.3f}", "-i", path, "-c:a", "libvorbis", "-b:a", "160k", os.path.join(d, name.replace(" ", "-") + ".ogg")], check=True)
    print("chopped", tid)
