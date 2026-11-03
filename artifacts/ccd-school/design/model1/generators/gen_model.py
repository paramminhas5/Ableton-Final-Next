#!/usr/bin/env python3
"""CCD School · Model 1 — our own instrument. Key screens, light and dark."""
import os, sys, math
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "project")
CAT = "/_blob/6cb473e03d86e151b5e534529d518ad5"
SYNTH = "/_blob/1c5e03eb0914d084edde27e0c4483ea8"

CSS = r"""
body{margin:0}
.dev{font-family:"Archivo",system-ui,sans-serif;font-stretch:100%;-webkit-font-smoothing:antialiased;color:var(--ink)}
.light{--panel:#F2F1ED;--panel2:#EAE9E4;--dots:rgba(0,0,0,.075);--face1:#FFFFFF;--face2:#F0EFEB;--side:#CFCDC6;--sh:rgba(60,52,40,.18);--ink:#17171A;--sub:#6A6862;--ledoff:#D3D1CB;--cap1:#FFFFFF;--cap2:#E4E2DC;--line:rgba(0,0,0,.08);--chip:#E6E5E0}
.dark{--panel:#141518;--panel2:#101113;--dots:rgba(255,255,255,.06);--face1:#2E2F34;--face2:#232428;--side:#08080A;--sh:rgba(0,0,0,.6);--ink:#EEEDEA;--sub:#9D9EA3;--ledoff:#34353A;--cap1:#45464C;--cap2:#2A2B30;--line:rgba(255,255,255,.08);--chip:#24252A}
.pan{background-color:var(--panel);background-image:radial-gradient(circle,var(--dots) 1px,transparent 1.3px);background-size:14px 14px}
.cond{font-stretch:72%;font-weight:750;text-transform:uppercase;letter-spacing:-.005em;line-height:.92}
.k{position:relative;filter:drop-shadow(0 2px 0 var(--side)) drop-shadow(0 6px 7px var(--sh));display:block;text-decoration:none;color:var(--ink)}
.kf{height:100%;border-radius:14px;background:linear-gradient(180deg,var(--face1),var(--face2));clip-path:polygon(0 0,calc(100% - 13px) 0,100% 13px,100% 100%,0 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;box-sizing:border-box;padding:8px}
.k:active{transform:translateY(2px);filter:drop-shadow(0 0 0 var(--side)) drop-shadow(0 2px 3px var(--sh))}
.k.go .kf{background:linear-gradient(180deg,#F0559A,#D2307A);color:#fff}
.k.go{filter:drop-shadow(0 2px 0 #9A1F57) drop-shadow(0 8px 12px rgba(210,48,122,.35))}
.k.sel .kf{background:linear-gradient(180deg,#1E1F23,#111214);color:#F2F1EE}
.k.dim{opacity:.42}
.nl{position:absolute;top:3px;right:-1px;width:13px;height:3px;border-radius:2px;background:var(--ledoff);transform:rotate(45deg);transform-origin:center}
.nl.on{background:var(--c);box-shadow:0 0 6px var(--c),0 0 2px var(--c)}
.kw{font-size:13px;font-weight:550;letter-spacing:0}
.ks{font-size:11px;font-weight:500;color:var(--sub)}
.scr{position:relative;filter:drop-shadow(0 1px 0 rgba(255,255,255,.6)) drop-shadow(0 8px 14px var(--sh))}
.scrf{background:#060607;color:#F3F2EF;border-radius:18px;clip-path:polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,0 100%);position:relative;overflow:hidden;box-sizing:border-box}
.scrf:after{content:"";position:absolute;inset:0;background:linear-gradient(120deg,rgba(255,255,255,.06),rgba(255,255,255,0) 40%);pointer-events:none}
.ss{color:#8F8F94;font-size:12px;font-weight:500}
.chip{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 11px;border-radius:15px;background:var(--chip);font-size:13px;font-weight:550}
.lbl{font-size:12px;font-weight:550;color:var(--sub);letter-spacing:.02em}
svg.i{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.logo{width:30px;height:30px;border-radius:50%;background:#0B0B0C;display:flex;align-items:center;justify-content:center;overflow:hidden}
.logo img{width:24px}
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
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,300..800&amp;display=swap" rel="stylesheet">
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

LED = {"fund": "#3FDDAE", "dj": "#7D96FF", "prod": "#FF4F9A", "lilac": "#B49BFF", "white": "#F2F1EE"}

I = {
 "learn": '<svg class="i" viewBox="0 0 24 24"><path d="M4 6h16M4 12h10M4 18h13"/></svg>',
 "practice": '<svg class="i" viewBox="0 0 24 24"><path d="M3 12h3l2-6 4 12 3-9 2 3h4"/></svg>',
 "studio": '<svg class="i" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9v6M11 11v4M15 8v7M19 12v3"/></svg>',
 "library": '<svg class="i" viewBox="0 0 24 24"><path d="M5 4v16M10 4v16M15 5l4 15"/></svg>',
 "play": '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg>',
 "stop": '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>',
 "plus": '<svg class="i" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
 "back": '<svg class="i" viewBox="0 0 24 24"><path d="m14 6-6 6 6 6"/></svg>',
 "close": '<svg class="i" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
 "hear": '<svg class="i" viewBox="0 0 24 24"><path d="M4 10v4h3l5 4V6L7 10z"/><path d="M16 9a4 4 0 0 1 0 6"/></svg>',
 "out": '<svg class="i" viewBox="0 0 24 24"><path d="M12 15V4m-4 4 4-4 4 4M5 14v5h14v-5"/></svg>',
 "check": '<svg class="i" viewBox="0 0 24 24" style="width:16px;height:16px;stroke-width:2.4"><path d="m5 12 5 5 9-10"/></svg>',
 "lock": '<svg class="i" viewBox="0 0 24 24" style="width:15px;height:15px"><rect x="6" y="11" width="12" height="9" rx="2"/><path d="M9 11V8a3 3 0 0 1 6 0v3"/></svg>',
 "flame": '<svg viewBox="0 0 24 24" width="15" height="15" fill="#FF4F9A"><path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4-1-6 1-9z"/></svg>',
}


def key(inner, cls="", led=None, href="#", aria="", style="", h=None):
    nl = f'<span class="nl{" on" if led else ""}" style="--c:{led or "transparent"}"></span>'
    hh = f"height:{h}px;" if h else ""
    return f'<a href="{href}" class="k {cls}" aria-label="{aria}" style="{hh}{style}"><div class="kf">{inner}</div>{nl}</a>'


def knob(color, label, value, frac, size=62, aria=""):
    r = size / 2
    R = r + 7
    W = size + 18
    a0, a1 = 135, 135 + 270 * frac
    def pt(a, rr): return (W / 2 + rr * math.cos(math.radians(a)), W / 2 + rr * math.sin(math.radians(a)))
    def arc(a, b, rr):
        x0, y0 = pt(a, rr); x1, y1 = pt(b, rr)
        large = 1 if b - a > 180 else 0
        return f"M{x0:.1f} {y0:.1f}A{rr} {rr} 0 {large} 1 {x1:.1f} {y1:.1f}"
    px, py = pt(a1, r - 9)
    ex, ey = pt(a1, R)
    svg = (f'<svg width="{W}" height="{W}" viewBox="0 0 {W} {W}" aria-hidden="true">'
           f'<path d="{arc(135, 405, R)}" fill="none" stroke="var(--ledoff)" stroke-width="3" stroke-linecap="round"/>'
           + (f'<path d="{arc(a0, a1, R)}" fill="none" stroke="{color}" stroke-width="3" stroke-linecap="round" style="filter:drop-shadow(0 0 3px {color})"/>' if frac > 0.005 else "")
           + f'<circle cx="{W/2}" cy="{W/2+2}" r="{r}" fill="var(--sh)"/>'
           f'<circle cx="{W/2}" cy="{W/2}" r="{r}" fill="url(#cg)"/>'
           f'<circle cx="{W/2}" cy="{W/2}" r="{r-0.5}" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="1" opacity=".5"/>'
           f'<path d="M{W/2:.1f} {W/2:.1f}L{px:.1f} {py:.1f}" stroke="var(--ink)" stroke-width="2.4" stroke-linecap="round"/>'
           '<defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--cap1)"/><stop offset="1" stop-color="var(--cap2)"/></linearGradient></defs></svg>')
    return (f'<div role="img" aria-label="{aria or label}" style="display:flex;flex-direction:column;align-items:center;gap:2px">{svg}'
            f'<span class="kw" style="font-size:12px">{label}</span><span class="ks">{value}</span></div>')


def lanes_svg(w, rows, sel=None, cursor=None):
    """rows: (name, color, segments[(a,b)], kind) kind: 'full'|'dash'|'new'"""
    lh, gap, nameW = 18, 8, 54
    h = len(rows) * (lh + gap) - gap
    x0, x1 = nameW, w
    s = [f'<svg width="{w}" height="{h+2}" viewBox="0 0 {w} {h+2}" aria-hidden="true" style="display:block">']
    for i in range(1, 4):
        x = x0 + (x1 - x0) * i / 4
        s.append(f'<path d="M{x:.1f} 0V{h}" stroke="#26262A" stroke-width="1"/>')
    for i, (name, col, segs, kind) in enumerate(rows):
        y = i * (lh + gap)
        tc = col if (sel == i or kind == "new") else "#9A9AA0"
        s.append(f'<text x="0" y="{y+13}" font-family="Archivo" font-size="12" font-weight="600" fill="{tc}">{name}</text>')
        for a, b in segs:
            xa, xb = x0 + (x1 - x0) * a + 1.5, x0 + (x1 - x0) * b - 1.5
            if kind == "dash":
                s.append(f'<rect x="{xa:.1f}" y="{y+.75:.1f}" width="{xb-xa:.1f}" height="{lh-1.5}" rx="5" fill="none" stroke="{col}" stroke-width="1.5" stroke-dasharray="4 4"/>')
            else:
                op = "1" if (sel is None or sel == i or kind == "new") else ".55"
                s.append(f'<rect x="{xa:.1f}" y="{y}" width="{xb-xa:.1f}" height="{lh}" rx="5" fill="{col}" opacity="{op}"/>')
        if kind == "dash":
            s.append(f'<text x="{(x0+x1)/2}" y="{y+13}" text-anchor="middle" font-family="Archivo" font-size="12" font-weight="600" fill="{col}">+ add from a lesson</text>')
    if cursor is not None:
        x = x0 + (x1 - x0) * cursor
        s.append(f'<path d="M{x:.1f} -2V{h+2}" stroke="#F3F2EF" stroke-width="1.5"/>')
    s.append("</svg>")
    return "".join(s)

Q = [(0, .25), (.25, .5), (.5, .75), (.75, 1)]
E = [(i / 8, (i + 1) / 8) for i in range(8)]


def nav(active):
    items = [("learn", "FTodayL.dc.html"), ("practice", "#"), ("studio", "FStudioD.dc.html"), ("library", "#")]
    out = []
    for name, href in items:
        on = name == active
        out.append(key(f'{I[name]}<span class="kw">{name}</span>', cls="sel" if on else "", led=LED["prod"] if on else None, href=href, aria=name, h=62))
    return f'<nav aria-label="Main" style="position:absolute;left:16px;right:16px;bottom:24px;display:grid;grid-template-columns:repeat(4,1fr);gap:8px">{"".join(out)}</nav>'


def header_today():
    return ('<div style="display:flex;align-items:center;justify-content:space-between;height:44px">'
            f'<div style="display:flex;align-items:center;gap:9px"><span class="logo"><img src="{CAT}" alt=""></span><span class="cond" style="font-size:22px">ccd school</span></div>'
            f'<div style="display:flex;gap:6px"><span class="chip">340 xp</span><span class="chip">{I["flame"]}4 days</span></div></div>')


def phone(mode, inner, extra=""):
    return f'<div class="dev {mode} pan" style="width:390px;height:844px;position:relative;overflow:hidden"><div style="padding:12px 16px 0">{inner}</div>{extra}</div>'


def today(mode):
    rows = [("kick", LED["fund"], Q, "full"), ("hats", LED["fund"], E, "full"), ("bass", LED["prod"], [(0, 1)], "dash"), ("chords", LED["lilac"], Q, "full")]
    scr = (f'<div class="scr" style="margin-top:10px"><div class="scrf" style="padding:16px 18px 18px;height:228px">'
           f'<img src="{CAT}" alt="" style="position:absolute;right:16px;top:14px;width:74px;opacity:.95">'
           '<div class="ss">your track</div>'
           '<div class="cond" style="font-size:34px;margin-top:4px">3 layers</div>'
           '<div class="ss" style="margin-top:4px">120 bpm · press play to hear it</div>'
           f'<div style="margin-top:18px">{lanes_svg(318, rows)}</div></div></div>')
    nxt = ('<div class="k" style="margin-top:16px"><div class="kf" style="flex-direction:row;justify-content:flex-start;gap:12px;padding:10px;align-items:center">'
           f'<img src="{SYNTH}" alt="" style="width:64px;height:64px;border-radius:10px;object-fit:cover;flex:none">'
           '<div style="flex:1;min-width:0"><div class="lbl">next · producer 02</div>'
           '<div class="cond" style="font-size:24px;margin-top:3px">bass and poli</div>'
           '<div class="ks" style="margin-top:3px;color:#C42A70">adds bass to your track</div></div>'
           f'</div><span class="nl"></span></div>')
    start = ('<div style="display:grid;grid-template-columns:1fr 2fr;gap:8px;margin-top:10px">'
             + key(f'{I["hear"]}<span class="kw">hear track</span>', href="FStudioD.dc.html", aria="Hear your track", h=60)
             + key(f'<span style="display:flex;align-items:center;gap:8px"><span>{I["play"]}</span><span class="kw" style="font-size:16px;font-weight:650">start lesson</span></span>', cls="go", href="FWorldL.dc.html", aria="Start lesson", h=60)
             + '</div>')
    knobs = ('<div style="display:grid;grid-template-columns:repeat(4,1fr);margin-top:16px;justify-items:center">'
             + knob(LED["fund"], "basics", "5 / 40", 5 / 40, 50) + knob(LED["dj"], "dj", "1 / 40", 1 / 40, 50)
             + knob(LED["prod"], "producer", "1 / 91", 1 / 91, 50) + knob(LED["white"] if mode == "dark" else "#17171A", "today", "20 / 50", .4, 50) + '</div>')
    return phone(mode, header_today() + scr + nxt + start + knobs, nav("learn"))


def world():
    scr = (f'<div class="scr" style="margin-top:8px"><div class="scrf" style="height:200px;display:flex">'
           f'<img src="{SYNTH}" alt="A hand turning a synth knob" style="width:146px;height:100%;object-fit:cover">'
           '<div style="flex:1;padding:16px;display:flex;flex-direction:column;justify-content:space-between">'
           '<div class="ss">step 02 · 7 min</div>'
           '<div><div class="cond" style="font-size:32px">bass and poli</div>'
           '<div style="font-size:13px;color:#FF6FAE;margin-top:6px;font-weight:600">adds bass to your track</div></div>'
           '<div class="ss">+50 xp</div></div></div></div>')
    steps = ""
    for n in range(1, 17):
        num = f'<span class="cond" style="font-size:26px">{n:02d}</span>'
        if n == 1:
            steps += key(num + f'<span class="ks" style="display:flex;align-items:center;gap:3px">{I["check"]}done</span>', led=LED["prod"], aria="Step 1, done", h=74)
        elif n == 2:
            steps += key(num + '<span class="ks" style="color:#fff">next</span>', cls="go", aria="Step 2, next", href="FAddL.dc.html", h=74)
        elif n <= 8:
            steps += key(num + '<span class="ks">&nbsp;</span>', aria=f"Step {n}", h=74)
        else:
            steps += key(f'<span class="cond" style="font-size:26px">{n:02d}</span><span class="ks">{I["lock"]}</span>', cls="dim", aria=f"Step {n}, locked", h=74)
    body = ('<div style="display:flex;align-items:center;gap:10px;height:48px">'
            + key(I["back"], href="FTodayL.dc.html", aria="Back", style="width:44px", h=44)
            + '<div style="flex:1"><div class="cond" style="font-size:26px">producer</div><div class="ks">first contact · 1 of 91 done</div></div>'
            '<span class="nl on" style="position:static;display:block;transform:none;width:18px;--c:#FF4F9A"></span></div>'
            + scr
            + '<div style="display:flex;justify-content:space-between;margin:16px 2px 8px"><span class="lbl">first contact</span><span class="lbl">16 steps</span></div>'
            + f'<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">{steps}</div>')
    bottom = ('<div style="position:absolute;left:16px;right:16px;bottom:24px;display:grid;grid-template-columns:1fr 2fr;gap:8px">'
              + key(f'{I["hear"]}<span class="kw">preview</span>', aria="Preview what it adds", h=62)
              + key(f'<span style="display:flex;align-items:center;gap:8px">{I["play"]}<span class="kw" style="font-size:16px;font-weight:650">start step 02</span></span>', cls="go", href="FAddL.dc.html", aria="Start step 2", h=62)
              + '</div>')
    return phone("light", body, bottom)


def add():
    rows = [("kick", LED["fund"], Q, "full"), ("hats", LED["fund"], E, "full"), ("bass", LED["prod"], E, "new"), ("chords", LED["lilac"], Q, "full")]
    scr = (f'<div class="scr" style="margin-top:8px"><div class="scrf" style="padding:18px;height:300px;display:flex;flex-direction:column;justify-content:space-between">'
           f'<img src="{CAT}" alt="" style="position:absolute;right:16px;top:16px;width:84px">'
           '<div><div class="ss">you learned</div><div class="cond" style="font-size:36px;margin-top:4px;max-width:200px">bass and poli</div>'
           '<div style="font-size:15px;font-weight:650;color:#FF6FAE;margin-top:8px">+50 xp</div></div>'
           f'<div>{lanes_svg(318, rows)}<div class="ss" style="margin-top:10px">new layer: <span style="color:#FF6FAE">bass</span>. it is not in your track until you add it.</div></div></div></div>')
    knobs = ('<div class="lbl" style="margin:18px 2px 6px">shape it first</div>'
             '<div style="display:grid;grid-template-columns:repeat(4,1fr);justify-items:center;align-items:start">'
             + knob(LED["prod"], "cutoff", "40%", .4, 50) + knob(LED["prod"], "res", "30%", .3, 50) + knob(LED["prod"], "glide", "0", 0, 50)
             + '<div style="padding-top:10px">' + key(f'{I["hear"]}<span class="kw">hear</span>', aria="Hear it in your track", style="width:70px", h=64) + '</div></div>')
    head = ('<div style="display:flex;align-items:center;justify-content:space-between;height:48px">'
            + key(I["close"], href="FTodayL.dc.html", aria="Close", style="width:44px", h=44)
            + '<span class="lbl">step 02 done</span><span style="width:44px"></span></div>')
    bottom = ('<div style="position:absolute;left:16px;right:16px;bottom:24px;display:grid;grid-template-columns:1fr 2.4fr;gap:8px">'
              + key('<span class="kw" style="font-size:15px">later</span>', href="FTodayL.dc.html", aria="Not now", h=62)
              + key(f'<span style="display:flex;align-items:center;gap:8px">{I["plus"]}<span class="kw" style="font-size:16px;font-weight:650">add to my track</span></span>', cls="go", href="FStudioD.dc.html", aria="Add to my track", h=62)
              + '</div>')
    return phone("light", head + scr + knobs, bottom)


def studio():
    rows = [("kick", LED["fund"], Q, "full"), ("hats", LED["fund"], E, "full"), ("bass", LED["prod"], E, "full"), ("chords", LED["lilac"], Q, "full")]
    scr = (f'<div class="scr" style="margin-top:8px"><div class="scrf" style="padding:16px 18px 18px;height:214px">'
           '<div style="display:flex;justify-content:space-between;align-items:flex-start"><div><div class="ss">editing</div>'
           '<div class="cond" style="font-size:30px;margin-top:3px;color:#FF6FAE">bass</div></div>'
           '<div style="text-align:right"><div class="ss">cutoff</div><div class="cond" style="font-size:30px;margin-top:3px">62%</div></div></div>'
           f'<div style="margin-top:16px">{lanes_svg(318, rows, sel=2, cursor=0)}</div></div></div>')
    layers = ""
    for i, (n, c) in enumerate([("kick", LED["fund"]), ("hats", LED["fund"]), ("bass", LED["prod"]), ("chords", LED["lilac"])]):
        layers += key(f'<span class="cond" style="font-size:22px">{i+1}</span><span class="kw">{n}</span>', cls="sel" if i == 2 else "", led=c, aria=f"Layer {i+1}, {n}", h=66)
    knobs = ('<div style="display:grid;grid-template-columns:repeat(4,1fr);justify-items:center;margin-top:14px">'
             + knob(LED["prod"], "cutoff", "62%", .62, 50) + knob(LED["prod"], "res", "30%", .3, 50)
             + knob(LED["prod"], "glide", "15%", .15, 50) + knob(LED["prod"], "level", "75%", .75, 50) + '</div>')
    transport = ('<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px">'
                 + key(f'{I["play"]}<span class="kw">play</span>', cls="go", aria="Play", h=60)
                 + key(f'{I["stop"]}<span class="kw">stop</span>', aria="Stop", h=60)
                 + key(f'{I["plus"]}<span class="kw">layer</span>', aria="Add a layer", h=60)
                 + key(f'{I["out"]}<span class="kw">to live</span>', aria="Export to Ableton Live", h=60) + '</div>')
    head = ('<div style="display:flex;align-items:center;justify-content:space-between;height:44px">'
            '<div style="display:flex;align-items:center;gap:9px"><span class="cond" style="font-size:26px">studio</span><span class="chip" style="height:26px">my track</span></div>'
            '<span class="lbl">4 layers · 120 bpm</span></div>')
    body = head + scr + f'<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:14px">{layers}</div>' + knobs + transport
    return phone("dark", body, nav("studio"))


def system():
    def half(mode):
        keys = ('<div style="display:grid;grid-template-columns:repeat(4,96px);gap:10px">'
                + key(f'{I["learn"]}<span class="kw">learn</span>', h=84)
                + key(f'{I["studio"]}<span class="kw">studio</span>', cls="sel", led=LED["prod"], h=84)
                + key('<span class="cond" style="font-size:28px">03</span><span class="ks">step</span>', led=LED["fund"], h=84)
                + key(f'{I["play"]}<span class="kw">start</span>', cls="go", h=84) + '</div>')
        knobs = ('<div style="display:grid;grid-template-columns:repeat(4,96px);gap:10px;justify-items:center">'
                 + knob(LED["fund"], "basics", "5 / 40", .125, 54) + knob(LED["dj"], "dj", "1 / 40", .05, 54)
                 + knob(LED["prod"], "cutoff", "62%", .62, 54) + knob(LED["lilac"], "space", "35%", .35, 54) + '</div>')
        rows = [("kick", LED["fund"], Q, "full"), ("bass", LED["prod"], E, "full"), ("chords", LED["lilac"], Q, "full")]
        scr = (f'<div class="scr"><div class="scrf" style="padding:16px 18px;height:150px">'
               f'<img src="{CAT}" alt="" style="position:absolute;right:16px;top:12px;width:60px">'
               '<div class="ss">your track</div><div class="cond" style="font-size:28px;margin-top:2px">3 layers</div>'
               f'<div style="margin-top:14px">{lanes_svg(380, rows)}</div></div></div>')
        return (f'<div class="dev {mode} pan" style="flex:1;border-radius:30px;padding:28px;display:flex;flex-direction:column;gap:22px;box-shadow:0 0 0 1px var(--line)">'
                f'<div style="display:flex;justify-content:space-between;align-items:baseline"><span class="cond" style="font-size:30px">{mode}</span><span class="lbl">{"warm white panel" if mode=="light" else "graphite panel"}</span></div>'
                f'{scr}{keys}{knobs}</div>')
    sw = lambda c, n, s: f'<div style="display:flex;flex-direction:column;gap:6px"><div style="height:42px;border-radius:10px;background:{c};box-shadow:0 0 16px {c}66"></div><span style="font-size:13px;font-weight:650">{n}</span><span class="lbl">{s}</span></div>'
    colors = "".join([sw(LED["fund"], "mint", "basics"), sw(LED["dj"], "cobalt", "dj"), sw(LED["prod"], "magenta", "producer · go"), sw(LED["lilac"], "lilac", "chords, pads")])
    rule = lambda t, b: f'<div style="display:flex;flex-direction:column;gap:6px"><span class="cond" style="font-size:20px">{t}</span><span style="font-size:14px;line-height:21px;color:#6A6862">{b}</span></div>'
    rules = "".join([
        rule("the notch", "Every key and the screen have one cut corner. A light sits in it when the key is on. It is the CCD mark."),
        rule("the screen", "Black glass with the CCD cat. Your track as named, coloured lanes. Big condensed titles, like the CCD decks."),
        rule("clear", "A word on every key. One magenta key per screen: the thing to do next. Nothing under 12px."),
        rule("touch", "Keys travel 2px. The cat dances only while you play. Nothing moves on its own."),
    ])
    body = ('<div class="dev light" style="width:1440px;height:1040px;box-sizing:border-box;background:#E7E6E1;padding:50px 60px;display:flex;flex-direction:column;gap:26px">'
            '<div style="display:flex;justify-content:space-between;align-items:flex-end"><div style="display:flex;align-items:center;gap:18px">'
            f'<span class="logo" style="width:64px;height:64px"><img src="{CAT}" alt="" style="width:50px"></span>'
            '<div><div class="lbl">ccd school · model 1</div><div class="cond" style="font-size:58px">our own instrument</div></div></div>'
            '<span class="lbl" style="text-align:right">light and dark<br>follows your phone</span></div>'
            f'<div style="display:flex;gap:24px">{half("light")}{half("dark")}</div>'
            f'<div style="display:grid;grid-template-columns:1fr 2fr;gap:44px;align-items:start"><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">{colors}</div>'
            f'<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:22px">{rules}</div></div></div>')
    return body


def page(name, title, w, h, body):
    with open(os.path.join(OUT, name), "w") as f:
        f.write(HEAD.format(title=title, css=CSS, body=body, w=w, h=h))
    print("wrote", name)


if __name__ == "__main__":
    page("MSystem.dc.html", "Model 1 system", 1440, 1040, system())
    page("MTodayL.dc.html", "Today · light", 390, 844, today("light"))
    page("MTodayD.dc.html", "Today · dark", 390, 844, today("dark"))
    page("MWorldL.dc.html", "Producer world", 390, 844, world())
    page("MAddL.dc.html", "Add to your track", 390, 844, add())
    page("MStudioD.dc.html", "Studio", 390, 844, studio())
