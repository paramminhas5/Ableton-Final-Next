"""Cut the recorded tour frames into short clips (tour-clips.mjs writes the frames).
Usage: python3 scripts/shots/tour-encode.py <rawdir> <outdir> [--frames]
Each clip: one segment of a product's recording, cropped to the part that matters, H.264, muted, looping.
--frames writes a contact sheet of each segment's middle frame instead, to pick crops."""
import json, subprocess, sys, os
from bisect import bisect_left

raw, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
marks = json.load(open(f"{raw}/marks.json"))
# crop per clip in CSS px of the 390 x 844 screen: (top, height). Output keeps the 390 width.
CROP = {
  "learn-a": (56, 580), "learn-b": (52, 580),
  "practice-a": (0, 580), "practice-b": (20, 580),
  "studio-a": (168, 580), "studio-b": (0, 580),
  "dj-a": (40, 580), "dj-b": (0, 580),
  "library-a": (0, 580), "library-b": (0, 580),
}
OVERRIDE = json.load(open(f"{raw}/crops.json")) if os.path.exists(f"{raw}/crops.json") else {}
CROP.update({k: tuple(v) for k, v in OVERRIDE.items()})

def seg_frames(name, s0, s1):
    ts = json.load(open(f"{raw}/{name}/frames.json"))
    i0 = max(0, bisect_left(ts, s0) - 1)
    i1 = min(len(ts), bisect_left(ts, s1) + 1)
    return ts, i0, i1

if "--frames" in sys.argv:
    from PIL import Image, ImageDraw
    tiles = []
    for name, m in marks.items():
        for seg in "ab":
            s0, s1 = m[seg + "0"], m[seg + "1"]
            ts, i0, i1 = seg_frames(name, s0, s1)
            mid = bisect_left(ts, (s0 + s1) / 2)
            im = Image.open(f"{raw}/{name}/{min(mid, len(ts) - 1):05d}.jpg").convert("RGB").resize((390, 844))
            d = ImageDraw.Draw(im)
            for y in range(0, 844, 50):
                d.line([(0, y), (12 if y % 100 else 24, y)], fill=(255, 0, 0), width=1)
            top, h = CROP[f"{name}-{seg}"]
            d.rectangle([1, top, 388, top + h], outline=(0, 255, 0), width=2)
            tiles.append(im)
    sheet = Image.new("RGB", (400 * 5, 854 * 2), "white")
    for i, t in enumerate(tiles):
        sheet.paste(t, ((i // 2) * 400, (i % 2) * 854))
    sheet.save(f"{out}/contact.png")
    sys.exit()

captions = {}
for name, m in marks.items():
    for seg in "ab":
        key = f"{name}-{seg}"
        s0, s1 = m[seg + "0"], m[seg + "1"]
        ts, i0, i1 = seg_frames(name, s0, s1)
        lst = f"{raw}/{key}.txt"
        with open(lst, "w") as f:
            f.write("ffconcat version 1.0\n")
            for i in range(i0, i1):
                start = max(ts[i], s0)
                end = min(ts[i + 1] if i + 1 < len(ts) else s1, s1)
                if end <= start:
                    continue
                f.write(f"file '{os.path.abspath(raw)}/{name}/{i:05d}.jpg'\nduration {end - start:.4f}\n")
            f.write(f"file '{os.path.abspath(raw)}/{name}/{max(i0, i1 - 1):05d}.jpg'\n")
        top, h = CROP[key]
        hold = 1.2  # the last frame holds, then fades, so the loop never jumps
        total = (s1 - s0) + hold
        vf = f"scale=780:1688,crop=780:{h * 2}:0:{top * 2},fps=30,tpad=stop_mode=clone:stop_duration={hold},fade=t=in:st=0:d=0.3,fade=t=out:st={total - 0.4:.3f}:d=0.4,format=yuv420p"
        mp4 = f"{out}/{key}.mp4"
        # sound: each recorded track lined up to the segment start, mixed, levelled
        tracks = json.load(open(f"{raw}/{name}/audio.json")) if os.path.exists(f"{raw}/{name}/audio.json") else []
        tracks = [t for t in tracks if os.path.getsize(f"{raw}/{name}/{t['file']}") > 2000]
        dur = s1 - s0
        cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lst]
        fc = []
        for j, t in enumerate(tracks):
            cmd += ["-i", f"{raw}/{name}/{t['file']}"]
            off = s0 - t["t0"]
            if off >= 0:
                fc.append(f"[{j + 1}:a]atrim=start={off:.3f},asetpts=PTS-STARTPTS,apad,atrim=0:{dur:.3f}[a{j}]")
            else:
                fc.append(f"[{j + 1}:a]adelay={int(-off * 1000)}:all=1,apad,atrim=0:{dur:.3f}[a{j}]")
        if tracks:
            mix = "".join(f"[a{j}]" for j in range(len(tracks)))
            fc.append(f"{mix}amix=inputs={len(tracks)}:normalize=0,alimiter=limit=0.89:level=false,afade=t=in:d=0.08,afade=t=out:st={max(0, dur - 0.25):.3f}:d=0.25[aout]")
        fc.append(f"[0:v]{vf}[vout]")
        cmd += ["-filter_complex", ";".join(fc), "-map", "[vout]"]
        cmd += (["-map", "[aout]", "-c:a", "aac", "-b:a", "96k"] if tracks else ["-an"])
        cmd += ["-c:v", "libx264", "-preset", "veryfast", "-crf", "21", "-t", f"{total:.3f}", "-movflags", "+faststart", mp4]
        subprocess.run(cmd, check=True)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", "0.05", "-i", mp4, "-frames:v", "1", "-q:v", "3", f"{out}/{key}.jpg"], check=True)
        steps = [{"t": round(max(0.0, c["t"] - s0), 2), "text": c["text"]} for c in m.get("caps", []) if s0 - 0.05 <= c["t"] < s1]
        captions[key] = {"dur": round(total, 2), "steps": steps}
        print(key, f"{s1 - s0:.1f}s", os.path.getsize(mp4) // 1024, "KB", f"{len(tracks)} sound")

json.dump(captions, open(f"{out}/captions.json", "w"), indent=1)
