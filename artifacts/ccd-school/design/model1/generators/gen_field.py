#!/usr/bin/env python3
"""Generates the Field boards (OP-1 field light / OP-XY dark) for the CCD School canvas."""
import os, sys
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "project")

CSS = r"""
body{margin:0}
.dev{font-family:"Outfit",system-ui,sans-serif;-webkit-font-smoothing:antialiased;color:var(--ink);letter-spacing:.005em}
.light{--deck:#D6D5D0;--deck2:#CFCEC9;--mod:#F2F1ED;--mod2:#E9E8E3;--modhi:rgba(255,255,255,.95);--modlo:rgba(0,0,0,.07);--cap1:#FDFCFA;--cap2:#ECEAE5;--capside:#CFCDC6;--ink:#1C1C1E;--sub:#8E8C86;--well:#E2E1DC;--sh:rgba(70,62,50,.20);--k1:#F6F5F1;--k2:#DAD8D2;--hole:#2B2B2C;--ledoff:#D3D1CB;--ring:#1A1A1B;--tag:#BDBBB5}
.dark{--deck:#0E0E10;--deck2:#0B0B0C;--mod:#212225;--mod2:#1B1C1E;--modhi:rgba(255,255,255,.07);--modlo:rgba(0,0,0,.55);--cap1:#393A3F;--cap2:#28292D;--capside:#0D0D0F;--ink:#ECECEA;--sub:#76777C;--well:#141517;--sh:rgba(0,0,0,.65);--k1:#45464B;--k2:#26272B;--hole:#050506;--ledoff:#2C2D31;--ring:#000;--tag:#3A3B40}
.face{background:linear-gradient(180deg,var(--deck),var(--deck2))}
.g{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px}
.m{position:relative;border-radius:11px;background:linear-gradient(180deg,var(--mod),var(--mod2));box-shadow:inset 0 1px 0 var(--modhi),inset 0 -1px 0 var(--modlo),0 1px 2px var(--sh);display:flex;align-items:center;justify-content:center;aspect-ratio:1;border:0;padding:0;font:inherit;color:inherit;text-decoration:none;-webkit-tap-highlight-color:transparent}
.cap{width:64%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 50% 28%,var(--cap1),var(--cap2) 78%);box-shadow:0 2px 0 var(--capside),0 6px 10px var(--sh),inset 0 1px 0 var(--modhi);display:flex;align-items:center;justify-content:center;color:var(--ink);transition:transform 70ms,box-shadow 70ms}
.m:active .cap{transform:translateY(2px);box-shadow:0 0 0 var(--capside),0 2px 4px var(--sh),inset 0 1px 0 var(--modhi)}
.cap.blk{background:radial-gradient(circle at 50% 30%,#303032,#0D0D0E 72%);color:#F2F2F0;box-shadow:0 2px 0 #000,0 6px 10px var(--sh),inset 0 1px 0 rgba(255,255,255,.12)}
.cap.go{background:radial-gradient(circle at 45% 28%,#FF8DBD,#F2448F 62%,#D5307A);color:#fff;box-shadow:0 2px 0 #A8215E,0 6px 14px rgba(242,68,143,.35),inset 0 1px 0 rgba(255,255,255,.45)}
.pill{width:70%;aspect-ratio:auto;height:74%;border-radius:999px}
.leg{font-weight:200;font-size:30px;line-height:1}
.ml{position:absolute;left:0;right:0;bottom:7px;text-align:center;font-size:11px;font-weight:500;color:var(--sub)}
.led{position:absolute;top:8px;left:50%;margin-left:-8px;width:16px;height:3px;border-radius:2px;background:var(--ledoff)}
.led.on{background:var(--c);box-shadow:0 0 6px var(--c),0 0 1px var(--c)}
.dot{position:absolute;top:9px;left:50%;margin-left:-3px;width:6px;height:6px;border-radius:3px;background:var(--ledoff)}
.dot.on{background:var(--c);box-shadow:0 0 6px var(--c)}
.well{width:70%;aspect-ratio:1;border-radius:50%;background:var(--well);box-shadow:inset 0 2px 5px var(--sh),0 1px 0 var(--modhi);display:flex;align-items:center;justify-content:center}
.knob{width:74%;aspect-ratio:1;border-radius:50%;background:repeating-conic-gradient(var(--k1) 0 4deg,var(--k2) 4deg 8deg);box-shadow:0 3px 6px var(--sh),0 1px 0 var(--capside);display:flex;align-items:center;justify-content:center}
.knob i{width:72%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 38% 28%,rgba(255,255,255,.5),rgba(255,255,255,0) 55%),var(--c);box-shadow:inset 0 -2px 3px rgba(0,0,0,.28),0 0 0 1px rgba(0,0,0,.08)}
.disp{background:#040405;border-radius:9px;position:relative;overflow:hidden;box-shadow:0 0 0 3px var(--ring),0 1px 0 4px var(--modhi)}
.disp:before{content:"";position:absolute;inset:0;background:linear-gradient(118deg,rgba(255,255,255,.075),rgba(255,255,255,0) 36%);pointer-events:none;z-index:2}
.dt{font-family:"Outfit",sans-serif;color:#F4F4F2}
.grille{background-image:radial-gradient(circle,var(--hole) 1.7px,transparent 2.1px);background-size:9px 9px;background-position:center}
.tag{display:inline-block;border:1px solid var(--tag);border-radius:4px;padding:1px 5px;font-size:11px;font-weight:500;color:var(--sub);line-height:14px}
.lbl{font-size:12px;font-weight:500;color:var(--sub)}
svg.i{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
"""

HEAD = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600&amp;display=swap" rel="stylesheet">
<style>{css}</style>
</helmet>
{body}
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":{w},"height":{h}}}}}'>
class Component extends DCLogic {{ renderVals() {{ return {{}}; }} }}
</script>
</body>
</html>
"""

C = {"fund": "#35C9A0", "dj": "#5B76F2", "prod": "#F2448F", "lilac": "#A98BFF", "grey": "#8E9096", "navy": "#24305A"}
NEON = {"fund": "#4FE3B6", "dj": "#7D96FF", "prod": "#FF5AA3", "lilac": "#B89CFF"}

ICONS = {
 "learn": '<svg class="i" viewBox="0 0 24 24"><path d="M4 17V7m5 10V7m5 10V7m5 10V7"/></svg>',
 "practice": '<svg class="i" viewBox="0 0 24 24"><path d="M9 3h6l3.5 18h-13z"/><path d="m12 15 5-9"/></svg>',
 "studio": '<svg class="i" viewBox="0 0 24 24"><circle cx="7" cy="12" r="3.5"/><circle cx="17" cy="12" r="3.5"/><path d="M7 15.5h10"/></svg>',
 "library": '<svg class="i" viewBox="0 0 24 24"><path d="M5 4v16m4.5-16v16M14 5l4.5 15"/></svg>',
 "play": '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg>',
 "stop": '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1.5"/></svg>',
 "rec": '<svg viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="6" fill="#FF3B4E"/></svg>',
 "plus": '<svg class="i" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
 "out": '<svg class="i" viewBox="0 0 24 24"><path d="M12 15V4m-4 4 4-4 4 4M5 14v5h14v-5"/></svg>',
 "back": '<svg class="i" viewBox="0 0 24 24"><path d="m14 6-6 6 6 6"/></svg>',
 "close": '<svg class="i" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
 "hear": '<svg class="i" viewBox="0 0 24 24"><path d="M4 10v4h3l5 4V6L7 10z"/><path d="M16 9a4 4 0 0 1 0 6"/></svg>',
 "shift": '<span style="font-size:13px;font-weight:400">shift</span>',
}


def enc(color, label, led=None, lit=True, aria=""):
    ledh = f'<span class="led{" on" if lit else ""}" style="--c:{led or color}"></span>'
    return (f'<div class="m" role="img" aria-label="{aria or label}">{ledh}'
            f'<div class="well" style="width:62%;margin-top:-8px"><div class="knob"><i style="--c:{color}"></i></div></div>'
            f'<span class="ml">{label}</span></div>')


def key(inner, label=None, cap="", led=None, href="#", aria="", extra_style=""):
    ledh = f'<span class="dot on" style="--c:{led}"></span>' if led else ""
    lab = f'<span class="ml">{label}</span>' if label else ""
    mt = "margin-top:-8px;" if label else ""
    return (f'<a href="{href}" class="m" aria-label="{aria or (label or "")}" style="{extra_style}">{ledh}'
            f'<span class="cap {cap}" style="{mt}">{inner}</span>{lab}</a>')


def nav(active, color):
    out = []
    targets = {"learn": "FTodayL.dc.html", "practice": "#", "studio": "FStudioD.dc.html", "library": "#"}
    for k in ["learn", "practice", "studio", "library"]:
        on = k == active
        ledh = f'<span class="dot{" on" if on else ""}" style="--c:{color}"></span>'
        out.append(f'<a href="{targets[k]}" class="m" aria-label="{k}"{" aria-current=page" if on else ""}>{ledh}'
                   f'<span class="cap" style="width:56%;margin-top:-6px">{ICONS[k]}</span><span class="ml" style="{"color:var(--ink)" if on else ""}">{k}</span></a>')
    return ('<nav aria-label="Main" class="g" style="position:absolute;left:12px;right:12px;bottom:22px">'
            + "".join(out) + "</nav>")


def status(xp="340"):
    dots = "".join(f'<span style="width:5px;height:5px;border-radius:3px;background:{"var(--ink)" if i < 4 else "var(--ledoff)"}"></span>' for i in range(7))
    return (f'<div style="display:flex;align-items:center;justify-content:space-between;height:40px;padding:0 4px">'
            f'<div style="display:flex;align-items:center;gap:7px"><span style="font-size:19px;font-weight:500;letter-spacing:-.02em">ccd</span><span class="tag">school</span></div>'
            f'<div style="display:flex;align-items:center;gap:12px"><span style="font-size:15px;font-weight:300">{xp}<span class="lbl" style="margin-left:3px">xp</span></span>'
            f'<span role="img" aria-label="4 day streak" style="display:flex;gap:3px">{dots}</span></div></div>')


def tape_svg(w, h, lanes, sel=None, big="3", counter="0:16", sub="layers", ghost=None):
    """OP-1 style tape display. lanes: list of (color, segments[(x0,x1)], dashed)."""
    cx1, cx2, cy, R = w * 0.33, w * 0.67, h * 0.36, min(h * 0.22, 34)
    reel = lambda cx, pack: (
        f'<circle cx="{cx}" cy="{cy}" r="{R}" fill="none" stroke="#F4F4F2" stroke-width="1.6"/>'
        f'<circle cx="{cx}" cy="{cy}" r="{R*pack:.1f}" fill="#3A3A3C"/>'
        f'<circle cx="{cx}" cy="{cy}" r="{R*0.5:.1f}" fill="#F4F4F2"/>'
        f'<circle cx="{cx}" cy="{cy}" r="{R*0.13:.1f}" fill="#040405"/>'
        f'<path d="M{cx} {cy-R*0.5:.1f}v{R*0.18:.1f}M{cx-R*0.43:.1f} {cy+R*0.25:.1f}l{R*0.15:.1f} -{R*0.09:.1f}M{cx+R*0.43:.1f} {cy+R*0.25:.1f}l-{R*0.15:.1f} -{R*0.09:.1f}" stroke="#040405" stroke-width="2"/>')
    s = [f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" aria-hidden="true" style="display:block">']
    s.append(f'<text x="14" y="40" class="dt" font-size="36" font-weight="200" fill="#F4F4F2">{big}</text>')
    s.append(f'<text x="15" y="56" font-family="Outfit" font-size="10" fill="#8E8E90">{sub}</text>')
    s.append(f'<text x="{w-14}" y="26" text-anchor="end" font-family="Outfit" font-size="15" font-weight="300" fill="#F4F4F2">{counter}</text>')
    s.append(reel(cx1, 0.9) + reel(cx2, 0.66))
    s.append(f'<path d="M{(cx1+cx2)/2-5} {cy-7}l11 7-11 7z" fill="#F4F4F2"/>')
    # tape path
    s.append(f'<path d="M{cx1-R+4} {cy+R*0.8}Q{cx1} {h*0.66} {(cx1+cx2)/2} {h*0.62}T{cx2+R-4} {cy+R*0.8}" fill="none" stroke="#6A6A6C" stroke-width="1"/>')
    y0, lh, gap = h * 0.70, 6, 5
    x0, x1 = 14, w - 14
    # ticks
    for i in range(17):
        x = x0 + (x1 - x0) * i / 16
        s.append(f'<path d="M{x:.1f} {y0-9}v{4 if i%4 else 7}" stroke="#77777A" stroke-width="1"/>')
    for li, (col, segs, dashed) in enumerate(lanes):
        y = y0 + li * (lh + gap)
        s.append(f'<rect x="{x0}" y="{y:.1f}" width="{x1-x0}" height="{lh}" rx="1" fill="#1C1C1E"/>')
        for a, b in segs:
            xa, xb = x0 + (x1 - x0) * a, x0 + (x1 - x0) * b
            if dashed:
                s.append(f'<rect x="{xa:.1f}" y="{y+.5:.1f}" width="{xb-xa:.1f}" height="{lh-1}" rx="1" fill="none" stroke="{col}" stroke-width="1" stroke-dasharray="3 3"/>')
            else:
                s.append(f'<rect x="{xa:.1f}" y="{y:.1f}" width="{xb-xa:.1f}" height="{lh}" rx="1" fill="{col}"/>')
        if sel == li:
            s.append(f'<path d="M{x0-8} {y+lh/2:.1f}h4" stroke="{col}" stroke-width="2" stroke-linecap="round"/>')
    ph = x0 + (x1 - x0) * 0.25
    s.append(f'<path d="M{ph:.1f} {y0-12}V{y0+len(lanes)*(lh+gap)}" stroke="#F4F4F2" stroke-width="1.2"/>')
    s.append(f'<rect x="{ph-4:.1f}" y="{y0-17}" width="8" height="6" rx="1" fill="#F4F4F2"/>')
    s.append("</svg>")
    return "".join(s)


def page(name, title, w, h, body):
    with open(os.path.join(OUT, name), "w") as f:
        f.write(HEAD.format(title=title, css=CSS, body=body, w=w, h=h))
    print("wrote", name)


LANES_TODAY = [(NEON["fund"], [(0, 1)], False), (NEON["fund"], [(0, .5), (.5, 1)], False),
               (NEON["prod"], [(0, 1)], True), (NEON["lilac"], [(0, .25), (.25, .5), (.5, .75), (.75, 1)], False)]


def today(mode):
    disp = (f'<div class="disp" style="grid-column:span 4;height:200px;display:flex;flex-direction:column">'
            f'{tape_svg(358, 168, LANES_TODAY, big="3", counter="120", sub="layers")}'
            f'<div style="display:flex;justify-content:space-between;padding:0 14px;font-size:12px;color:#8E8E90">'
            f'<span>next</span><span style="color:#F4F4F2">02 bass and poli</span></div></div>')
    encs = (enc(C["fund"], "fund 5", aria="Fundamentals, 5 of 40") + enc(C["dj"], "dj 1", aria="DJ, 1 of 40")
            + enc(C["prod"], "prod 1", aria="Producer, 1 of 91") + enc("#9C9EA4" if mode == "light" else "#6A6B71", "today", led="#F4F4F2", aria="Today, 20 of 50 XP"))
    steps = ""
    for n in range(1, 5):
        if n == 1:
            steps += key(f'<span class="leg">{n}</span>', led=NEON["prod"], aria=f"Step {n}, done")
        elif n == 2:
            steps += key(f'<span class="leg">{n}</span>', cap="blk", aria=f"Step {n}, next", href="FWorldL.dc.html")
        else:
            steps += key(f'<span class="leg" style="color:var(--sub)">{n}</span>', aria=f"Step {n}")
    row4 = ('<div class="m grille" style="grid-column:span 2;aspect-ratio:auto;background-color:transparent;background-image:radial-gradient(circle,var(--hole) 1.7px,transparent 2.1px),linear-gradient(180deg,var(--mod),var(--mod2))" aria-hidden="true"></div>'
            + key(ICONS["hear"], "hear", aria="Hear your track", href="FStudioD.dc.html")
            + key(ICONS["play"], "learn", cap="go", aria="Learn step 02", href="FWorldL.dc.html"))
    body = (f'<div class="dev {mode} face" style="width:390px;height:844px;position:relative;overflow:hidden">'
            f'<div style="padding:10px 12px 0">{status()}'
            f'<div class="g" style="margin-top:6px">{disp}</div>'
            f'<div class="g" style="margin-top:12px">{encs}</div>'
            f'<div class="g" style="margin-top:5px">{steps}</div>'
            f'<div class="g" style="margin-top:5px">{row4}</div></div>'
            f'{nav("learn", NEON["prod"])}</div>')
    return body


def world():
    disp = ('<div class="disp" style="grid-column:span 4;height:190px;display:flex">'
            '<img src="/_blob/1c5e03eb0914d084edde27e0c4483ea8" alt="A hand turning a synth knob" style="width:150px;height:100%;object-fit:cover;filter:saturate(.85)">'
            '<div style="flex:1;padding:14px;display:flex;flex-direction:column;justify-content:space-between">'
            '<div style="display:flex;justify-content:space-between;align-items:flex-start"><span class="dt" style="font-size:40px;font-weight:200;line-height:36px">02</span><span style="font-size:12px;color:#8E8E90">7 min</span></div>'
            '<svg width="170" height="34" viewBox="0 0 170 34" aria-hidden="true"><path d="M2 17C14 2 26 2 38 17s24 15 36 0 24-15 36 0 24 15 36 0 12-8 18-8" fill="none" stroke="#FF5AA3" stroke-width="2" stroke-linecap="round"/></svg>'
            '<div><div class="dt" style="font-size:20px;font-weight:400;letter-spacing:-.01em">bass and poli</div><div style="font-size:12px;color:#FF5AA3;margin-top:2px">adds bass · +50 xp</div></div></div></div>')
    steps = ""
    for n in range(1, 17):
        if n == 1:
            steps += key(f'<span class="leg" style="font-size:24px">{n}</span>', led=NEON["prod"], aria="Step 1, done")
        elif n == 2:
            steps += key(f'<span class="leg" style="font-size:24px">{n}</span>', cap="blk", aria="Step 2, next", href="FAddL.dc.html")
        elif n <= 8:
            steps += key(f'<span class="leg" style="font-size:24px;color:var(--sub)">{n}</span>', aria=f"Step {n}")
        else:
            steps += f'<div class="m" style="opacity:.45" aria-hidden="true"><span class="leg" style="font-size:22px;color:var(--sub)">{n}</span></div>'
    bottom = (key(ICONS["back"], "back", href="FTodayL.dc.html") + key(ICONS["shift"], "shift")
              + key(ICONS["hear"], "preview") + key(ICONS["play"], "play 02", cap="go", href="FAddL.dc.html"))
    body = ('<div class="dev light face" style="width:390px;height:844px;position:relative;overflow:hidden">'
            '<div style="padding:10px 12px 0">'
            '<div style="display:flex;align-items:center;justify-content:space-between;height:40px;padding:0 4px">'
            '<div style="display:flex;align-items:center;gap:8px"><span style="width:16px;height:3px;border-radius:2px;background:#FF5AA3;box-shadow:0 0 6px #FF5AA3"></span><span style="font-size:19px;font-weight:500;letter-spacing:-.02em">producer</span></div>'
            '<span class="lbl">first contact · 1/91</span></div>'
            f'<div class="g" style="margin-top:6px">{disp}</div>'
            f'<div class="g" style="margin-top:12px;grid-template-columns:repeat(4,minmax(0,1fr))">{steps}</div>'
            f'<div class="g" style="margin-top:12px">{bottom}</div>'
            '</div></div>')
    return body


def studio():
    lanes = [(NEON["fund"], [(0, 1)], False), (NEON["fund"], [(0, .5), (.5, 1)], False),
             (NEON["prod"], [(0, .25), (.25, .5), (.5, .75), (.75, 1)], False), (NEON["lilac"], [(0, .25), (.25, .5), (.5, .75), (.75, 1)], False)]
    disp = (f'<div class="disp" style="grid-column:span 4;height:212px;display:flex;flex-direction:column">'
            f'{tape_svg(358, 170, lanes, sel=2, big="4", counter="0:16", sub="layers")}'
            f'<div style="display:flex;justify-content:space-between;padding:2px 14px 0;font-size:12px">'
            f'<span style="color:#FF5AA3">3 · bass</span><span style="color:#8E8E90">cutoff <span style="color:#F4F4F2">62%</span></span></div></div>')
    encs = (enc(C["navy"] if False else "#3B4A8C", "cutoff", led=NEON["prod"]) + enc("#9C9EA4", "res", led=NEON["prod"])
            + enc(C["fund"], "decay", led=NEON["prod"]) + enc(C["prod"], "level", led=NEON["prod"]))
    lanesel = ""
    names = ["kick", "hats", "bass", "chords"]
    cols = [NEON["fund"], NEON["fund"], NEON["prod"], NEON["lilac"]]
    for i, n in enumerate(names):
        cap = "blk" if i == 2 else ""
        lanesel += key(f'<span class="leg" style="font-size:24px">{i+1}</span>', n, cap=cap, led=cols[i], aria=f"Layer {i+1}, {n}")
    transport = (key(ICONS["rec"], "rec") + key(ICONS["play"], "play") + key(ICONS["stop"], "stop") + key(ICONS["plus"], "layer"))
    body = ('<div class="dev dark face" style="width:390px;height:844px;position:relative;overflow:hidden">'
            '<div style="padding:10px 12px 0">'
            '<div style="display:flex;align-items:center;justify-content:space-between;height:40px;padding:0 4px">'
            '<div style="display:flex;align-items:center;gap:7px"><span style="font-size:19px;font-weight:500;letter-spacing:-.02em">studio</span><span class="tag">my track</span></div>'
            '<a href="#" class="lbl" style="text-decoration:none;display:flex;align-items:center;gap:5px">to live <svg class="i" style="width:16px;height:16px" viewBox="0 0 24 24"><path d="M12 15V4m-4 4 4-4 4 4M5 14v5h14v-5"/></svg></a></div>'
            f'<div class="g" style="margin-top:6px">{disp}</div>'
            f'<div class="g" style="margin-top:12px">{encs}</div>'
            f'<div class="g" style="margin-top:5px">{lanesel}</div>'
            f'<div class="g" style="margin-top:5px">{transport}</div></div>'
            f'{nav("studio", NEON["lilac"])}</div>')
    return body


def add():
    lanes = [(NEON["fund"], [(0, 1)], False), (NEON["fund"], [(0, .5), (.5, 1)], False),
             (NEON["prod"], [(0, .25), (.25, .5), (.5, .75), (.75, 1)], False), (NEON["lilac"], [(0, .25), (.25, .5), (.5, .75), (.75, 1)], False)]
    disp = (f'<div class="disp" style="grid-column:span 4;height:250px;display:flex;flex-direction:column;justify-content:space-between">'
            f'<div style="padding:16px 16px 0;display:flex;justify-content:space-between;align-items:flex-start">'
            f'<div><div style="font-size:12px;color:#8E8E90">you learned</div><div class="dt" style="font-size:24px;font-weight:300;margin-top:2px">bass and poli</div></div>'
            f'<span style="font-size:15px;font-weight:300;color:#FF5AA3">+50 xp</span></div>'
            f'{tape_svg(358, 160, lanes, sel=2, big="", counter="", sub="")}'
            f'</div>')
    encs = (enc("#3B4A8C", "cutoff", led=NEON["prod"]) + enc("#9C9EA4", "glide", led=NEON["prod"]) + enc(C["fund"], "octave", led=NEON["prod"]) + key(ICONS["hear"], "hear"))
    body = ('<div class="dev light face" style="width:390px;height:844px;position:relative;overflow:hidden">'
            '<div style="padding:10px 12px 0">'
            '<div style="display:flex;align-items:center;justify-content:space-between;height:40px;padding:0 4px">'
            '<span class="lbl">step 02 · done</span><span class="tag">new layer</span></div>'
            f'<div class="g" style="margin-top:6px">{disp}</div>'
            f'<div class="g" style="margin-top:12px">{encs}</div>'
            '<div style="text-align:center;margin-top:18px" class="lbl">set it how you like, then add it</div></div>'
            '<div class="g" style="position:absolute;left:12px;right:12px;bottom:22px">'
            f'{key(ICONS["close"], "later", href="FTodayL.dc.html")}'
            '<a href="FStudioD.dc.html" class="m" aria-label="Add to my track" style="grid-column:span 3;aspect-ratio:auto">'
            '<span class="cap go pill" style="width:88%;height:66%;gap:8px;font-size:17px;font-weight:500"><svg class="i" viewBox="0 0 24 24" style="stroke-width:2"><path d="M12 5v14M5 12h14"/></svg>add to my track</span></a>'
            '</div></div>')
    return body


def system():
    def half(mode, title):
        keys = (key('<span class="leg">1</span>') + key("", cap="blk") + key(ICONS["studio"], "studio")
                + key(ICONS["play"], "learn", cap="go"))
        encs = (enc(C["fund"], "fund") + enc(C["dj"], "dj") + enc(C["prod"], "prod") + enc("#9C9EA4" if mode == "light" else "#6A6B71", "today", led="#F4F4F2"))
        disp = (f'<div class="disp" style="grid-column:span 3;height:150px">{tape_svg(300, 150, LANES_TODAY[:3], big="3", counter="120")}</div>'
                '<div class="m grille" style="aspect-ratio:auto;background-image:radial-gradient(circle,var(--hole) 1.7px,transparent 2.1px),linear-gradient(180deg,var(--mod),var(--mod2))"></div>')
        return (f'<div class="dev {mode} face" style="flex:1;border-radius:28px;padding:26px;display:flex;flex-direction:column;gap:14px;box-shadow:0 0 0 1px {"#C4C3BE" if mode=="light" else "#000"}">'
                f'<div style="display:flex;justify-content:space-between;align-items:baseline"><span style="font-size:22px;font-weight:400">{title}</span><span class="tag">{"op-1 field" if mode=="light" else "op-xy"} feel</span></div>'
                f'<div class="g" style="grid-template-columns:repeat(4,96px);gap:6px">{disp}</div>'
                f'<div class="g" style="grid-template-columns:repeat(4,96px);gap:6px">{encs}</div>'
                f'<div class="g" style="grid-template-columns:repeat(4,96px);gap:6px">{keys}</div></div>')
    sw = lambda c, n, s: (f'<div style="display:flex;flex-direction:column;gap:6px"><div style="height:44px;border-radius:10px;background:{c};box-shadow:0 0 18px {c}55"></div>'
                          f'<span style="font-size:13px;font-weight:500">{n}</span><span class="lbl">{s}</span></div>')
    colors = "".join([sw(NEON["fund"], "mint", "fundamentals"), sw(NEON["dj"], "cobalt", "dj"), sw(NEON["prod"], "magenta", "producer · go"),
                      sw(NEON["lilac"], "lilac", "studio"), sw("#FF3B4E", "red", "rec + hearts")])
    rule = lambda t, b: f'<div style="display:flex;flex-direction:column;gap:6px"><span style="font-size:17px;font-weight:500">{t}</span><span style="font-size:14px;line-height:21px;color:#7C7B77">{b}</span></div>'
    rules = "".join([
        rule("modules", "Everything sits on a grid of square modules, 5px apart. Keys, knobs, screen."),
        rule("touch", "Keys travel 2px in 70ms. Knobs turn under your finger. Nothing moves on its own."),
        rule("words", "Lowercase, one or two words, thin numerals. The screen draws, it doesn't explain."),
        rule("your track", "A 4-track tape. Each lesson records a layer when you choose. Studio edits it."),
    ])
    body = ('<div class="dev" style="width:1440px;height:1000px;box-sizing:border-box;background:#E9E8E5;padding:52px 60px;display:flex;flex-direction:column;gap:26px;color:#1C1C1E">'
            '<div style="display:flex;justify-content:space-between;align-items:flex-end"><div><div class="lbl" style="color:#8E8C86">ccd school · field</div>'
            '<div style="font-size:54px;font-weight:300;letter-spacing:-.035em;line-height:60px">One instrument. Light and dark.</div></div>'
            '<span class="lbl" style="text-align:right;color:#8E8C86">follows your phone<br>switch in settings</span></div>'
            f'<div style="display:flex;gap:24px">{half("light", "light")}{half("dark", "dark")}</div>'
            f'<div style="display:grid;grid-template-columns:1fr 1.5fr;gap:40px;align-items:start"><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px">{colors}</div>'
            f'<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:22px">{rules}</div></div></div>')
    return body


if __name__ == "__main__":
    which = sys.argv[1:] or ["sys", "tl", "td", "w", "s", "a"]
    if "sys" in which: page("FSystem.dc.html", "Field system", 1440, 1000, system())
    if "tl" in which: page("FTodayL.dc.html", "Today · light", 390, 844, today("light"))
    if "td" in which: page("FTodayD.dc.html", "Today · dark", 390, 844, today("dark"))
    if "w" in which: page("FWorldL.dc.html", "Producer world", 390, 844, world())
    if "a" in which: page("FAddL.dc.html", "Add to your track", 390, 844, add())
    if "s" in which: page("FStudioD.dc.html", "Studio", 390, 844, studio())
