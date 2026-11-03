#!/usr/bin/env python3
"""CCD School · Model 1 mix: Notch (A) + OP-1 field (light) + Novation (dark)."""
import os, math
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "project")
CAT = "/_blob/6cb473e03d86e151b5e534529d518ad5"
SYNTH = "/_blob/1c5e03eb0914d084edde27e0c4483ea8"

CSS = r"""
body{margin:0}
.dev{font-family:"Archivo",system-ui,sans-serif;-webkit-font-smoothing:antialiased;color:var(--ink)}
.light{--deck:#DEDDD8;--deck2:#D5D4CF;--m1:#F5F4F0;--m2:#EBEAE5;--side:#C8C6BF;--sh:rgba(60,52,40,.17);--ink:#17171A;--sub:#68665F;--ledoff:#D0CEC8;--well:#E1E0DB;--k1:#F7F6F2;--k2:#D6D4CE;--padoff:#E6E5E0;--chip:#E9E8E3;--slot:#2A2A2C;--tick:rgba(0,0,0,.22)}
.dark{--deck:#1B1C1E;--deck2:#161719;--m1:#26272A;--m2:#212225;--side:#0A0A0B;--sh:rgba(0,0,0,.5);--ink:#EDEDEA;--sub:#9A9BA0;--ledoff:#38393D;--well:#17181A;--k1:#3C3D41;--k2:#2A2B2E;--padoff:#2E2F33;--chip:#2A2B2E;--slot:#0B0B0C;--tick:rgba(255,255,255,.22)}
.face{background:linear-gradient(180deg,var(--deck),var(--deck2))}
.g{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}
.cond{font-stretch:72%;font-weight:750;text-transform:uppercase;line-height:.92;letter-spacing:0}
.wm{text-transform:uppercase;font-size:17px;letter-spacing:.02em}
.wm b{font-weight:800}.wm span{font-weight:300}
/* module with the CCD notch */
.m{position:relative;filter:drop-shadow(0 1.5px 0 var(--side)) drop-shadow(0 5px 6px var(--sh));display:block;color:var(--ink);text-decoration:none}
.mf{height:100%;border-radius:12px;background:linear-gradient(180deg,var(--m1),var(--m2));clip-path:polygon(0 0,calc(100% - 11px) 0,100% 11px,100% 100%,0 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;box-sizing:border-box;padding:8px;position:relative}
.dark .mf{background:linear-gradient(180deg,#28292C,#222326)}
.m:active{transform:translateY(1.5px);filter:drop-shadow(0 0 0 var(--side)) drop-shadow(0 2px 2px var(--sh))}
.m.go .mf{background:linear-gradient(180deg,#F0559A,#D2307A);color:#fff}
.m.go{filter:drop-shadow(0 1.5px 0 #96204F) drop-shadow(0 7px 12px rgba(210,48,122,.38))}
.m.on .mf{background:linear-gradient(180deg,#1C1D20,#111214);color:#F2F1EE}
.dark .m.on .mf{background:linear-gradient(180deg,#3A3B40,#303135)}
.nl{position:absolute;top:3px;right:-1px;width:12px;height:3px;border-radius:2px;background:var(--ledoff);transform:rotate(45deg)}
.nl.lit{background:var(--c);box-shadow:0 0 6px var(--c),0 0 2px var(--c)}
/* Novation LED dash */
.dash{width:18px;height:3px;border-radius:2px;background:var(--ledoff)}
.dash.lit{background:var(--c);box-shadow:0 0 6px var(--c),0 0 2px var(--c)}
/* OP-1 knob: knurled ring in a well. Light: coloured cap. Dark: graphite cap (Novation). */
.well{width:54px;height:54px;border-radius:50%;background:var(--well);box-shadow:inset 0 2px 4px var(--sh);display:flex;align-items:center;justify-content:center}
.knurl{width:42px;height:42px;border-radius:50%;background:repeating-conic-gradient(var(--k1) 0 4deg,var(--k2) 4deg 8deg);box-shadow:0 3px 5px var(--sh);display:flex;align-items:center;justify-content:center}
.cap{width:30px;height:30px;border-radius:50%;position:relative;box-shadow:inset 0 -2px 3px rgba(0,0,0,.25)}
.light .cap{background:radial-gradient(circle at 38% 28%,rgba(255,255,255,.5),rgba(255,255,255,0) 55%),var(--c)}
.dark .cap{background:radial-gradient(circle at 38% 28%,rgba(255,255,255,.18),rgba(255,255,255,0) 55%),#2E2F33}
.cap i{position:absolute;left:50%;top:3px;width:2px;height:9px;margin-left:-1px;border-radius:1px;background:#fff;transform-origin:1px 12px}
/* Circuit pads */
.pd{position:relative;display:block;text-decoration:none;color:var(--ink)}
.pdf{height:100%;border-radius:9px;background:var(--padoff);clip-path:polygon(0 0,calc(100% - 9px) 0,100% 9px,100% 100%,0 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;box-shadow:inset 0 1px 0 rgba(255,255,255,.35)}
.pd.lit{filter:drop-shadow(0 0 7px var(--c))}
.pd.lit .pdf{background:radial-gradient(circle at 50% 40%,rgba(255,255,255,.45),rgba(255,255,255,0) 70%),var(--c);color:#141416}
.pd.next .pdf{box-shadow:inset 0 0 0 2px #E8418A}
.pd.dim{opacity:.4}
/* flush black glass */
.scr{position:relative;filter:drop-shadow(0 1px 0 rgba(255,255,255,.5)) drop-shadow(0 6px 10px var(--sh))}
.dark .scr{filter:drop-shadow(0 6px 10px var(--sh))}
.scrf{background:#050506;color:#F3F2EF;border-radius:14px;clip-path:polygon(0 0,calc(100% - 18px) 0,100% 18px,100% 100%,0 100%);position:relative;overflow:hidden;box-sizing:border-box;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06)}
.scrf:after{content:"";position:absolute;inset:0;background:linear-gradient(118deg,rgba(255,255,255,.07),rgba(255,255,255,0) 38%);pointer-events:none}
.ss{color:#8F8F94;font-size:12px;font-weight:500}
.lbl{font-size:11px;font-weight:600;color:var(--sub);letter-spacing:.03em;text-transform:uppercase}
.kw{font-size:12.5px;font-weight:600}
.val{font-size:11px;font-weight:500;color:var(--sub);font-variant-numeric:tabular-nums}
.chip{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border-radius:8px;background:var(--chip);font-size:12.5px;font-weight:600}
svg.i{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.num{font-weight:250;font-size:26px;line-height:1;font-variant-numeric:tabular-nums}
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
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,200..800&amp;display=swap" rel="stylesheet">
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

# Novation-style LED sequence across a row: magenta, lilac, cobalt, mint
LED = {"fund": "#3FDDAE", "dj": "#7D96FF", "prod": "#FF4F9A", "lilac": "#B49BFF", "white": "#F2F1EE"}
CAPS = {"fund": "#35C9A0", "dj": "#5B76F2", "prod": "#E8418A", "grey": "#8E9096", "navy": "#2B355E"}

I = {
 "learn": '<svg class="i" viewBox="0 0 24 24"><path d="M4 6h16M4 12h10M4 18h13"/></svg>',
 "practice": '<svg class="i" viewBox="0 0 24 24"><path d="M3 12h3l2-6 4 12 3-9 2 3h4"/></svg>',
 "studio": '<svg class="i" viewBox="0 0 24 24"><path d="M6 4v16M12 4v16M18 4v16"/><rect x="4" y="13" width="4" height="3" rx="1"/><rect x="10" y="7" width="4" height="3" rx="1"/><rect x="16" y="10" width="4" height="3" rx="1"/></svg>',
 "library": '<svg class="i" viewBox="0 0 24 24"><path d="M5 4v16M10 4v16M15 5l4 15"/></svg>',
 "play": '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg>',
 "stop": '<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>',
 "rec": '<svg viewBox="0 0 24 24" width="17" height="17"><circle cx="12" cy="12" r="6" fill="#FF4A5A"/></svg>',
 "plus": '<svg class="i" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
 "back": '<svg class="i" viewBox="0 0 24 24"><path d="m14 6-6 6 6 6"/></svg>',
 "hear": '<svg class="i" viewBox="0 0 24 24"><path d="M4 10v4h3l5 4V6L7 10z"/><path d="M16 9a4 4 0 0 1 0 6"/></svg>',
 "out": '<svg class="i" viewBox="0 0 24 24"><path d="M12 15V4m-4 4 4-4 4 4M5 14v5h14v-5"/></svg>',
 "check": '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"/></svg>',
 "lock": '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="6" y="11" width="12" height="9" rx="2"/><path d="M9 11V8a3 3 0 0 1 6 0v3"/></svg>',
 "flame": '<svg viewBox="0 0 24 24" width="14" height="14" fill="#E8418A"><path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4-1-6 1-9z"/></svg>',
}


def key(inner, cls="", led=None, href="#", aria="", h=None, style=""):
    nl = f'<span class="nl{" lit" if led else ""}" style="--c:{led or "transparent"}"></span>'
    hh = f"height:{h}px;" if h else ""
    return f'<a href="{href}" class="m {cls}" aria-label="{aria}" style="{hh}{style}"><div class="mf">{inner}</div>{nl}</a>'


def knob(cap, led, label, value, frac, aria=""):
    rot = -135 + 270 * frac
    return (f'<div class="m" role="img" aria-label="{aria or label + " " + value}" style="height:128px"><div class="mf" style="gap:6px;padding-top:12px">'
            f'<div class="well"><div class="knurl"><div class="cap" style="--c:{cap}"><i style="transform:rotate({rot}deg)"></i></div></div></div>'
            f'<span class="dash lit" style="--c:{led}"></span>'
            f'<div style="text-align:center;line-height:1.25"><div class="kw" style="font-size:12px">{label}</div><div class="val">{value}</div></div></div>'
            '<span class="nl"></span></div>')


def pad(inner, cls="", c=None, aria="", h=58, href="#"):
    return f'<a href="{href}" class="pd {cls}" aria-label="{aria}" style="height:{h}px;{f"--c:{c}" if c else ""}"><div class="pdf">{inner}</div></a>'


def fader(name, c, frac, h=150):
    ticks = "".join(f'<span style="position:absolute;left:0;right:0;top:{10 + i*(h-60)/8:.0f}px;display:flex;justify-content:space-between"><i style="width:8px;height:1px;background:var(--tick)"></i><i style="width:8px;height:1px;background:var(--tick)"></i></span>' for i in range(9))
    top = 10 + (1 - frac) * (h - 60)
    return (f'<div class="m" role="img" aria-label="{name} level {int(frac*100)}%" style="height:{h+40}px"><div class="mf" style="justify-content:flex-start;padding:10px 8px">'
            f'<span class="dash lit" style="--c:{c}"></span>'
            f'<div style="position:relative;width:46px;height:{h-28}px;margin-top:8px">{ticks}'
            f'<div style="position:absolute;left:50%;top:6px;bottom:6px;width:4px;margin-left:-2px;border-radius:2px;background:var(--slot)"></div>'
            f'<div style="position:absolute;left:50%;top:{top:.0f}px;width:34px;height:22px;margin-left:-17px;border-radius:4px;background:linear-gradient(180deg,#5A5B60,#2F3034);box-shadow:0 3px 4px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.25)"><i style="position:absolute;left:5px;right:5px;top:10px;height:2px;background:#fff;border-radius:1px"></i></div></div>'
            f'<span class="kw" style="margin-top:auto">{name}</span></div><span class="nl"></span></div>')


def lanes(w, rows, sel=None, head=0.0):
    """OP-1 thin-line track with A's names. rows: (name, color, segs, kind)."""
    lh, gap, nameW = 10, 12, 52
    top = 12
    h = top + len(rows) * (lh + gap)
    x0, x1 = nameW, w
    s = [f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" aria-hidden="true" style="display:block">']
    for i in range(17):
        x = x0 + (x1 - x0) * i / 16
        s.append(f'<path d="M{x:.1f} 0v{6 if i%4==0 else 3}" stroke="#77777B" stroke-width="1"/>')
    for i, (name, col, segs, kind) in enumerate(rows):
        y = top + i * (lh + gap)
        tc = col if (sel == i or kind in ("new", "dash")) else "#A0A0A6"
        s.append(f'<text x="0" y="{y+9}" font-family="Archivo" font-size="12" font-weight="600" fill="{tc}">{name}</text>')
        s.append(f'<rect x="{x0}" y="{y}" width="{x1-x0}" height="{lh}" rx="2" fill="#18181B"/>')
        for a, b in segs:
            xa, xb = x0 + (x1 - x0) * a + 1, x0 + (x1 - x0) * b - 1
            if kind == "dash":
                s.append(f'<rect x="{xa:.1f}" y="{y+.5}" width="{xb-xa:.1f}" height="{lh-1}" rx="2" fill="none" stroke="{col}" stroke-width="1" stroke-dasharray="3 3"/>')
            else:
                op = 1 if (sel is None or sel == i or kind == "new") else .5
                s.append(f'<rect x="{xa:.1f}" y="{y}" width="{xb-xa:.1f}" height="{lh}" rx="2" fill="{col}" opacity="{op}"/>')
    px = x0 + (x1 - x0) * head
    s.append(f'<path d="M{px:.1f} 0V{h}" stroke="#F3F2EF" stroke-width="1.2"/><rect x="{px-3.5:.1f}" y="0" width="7" height="5" rx="1" fill="#F3F2EF"/>')
    s.append("</svg>")
    return "".join(s)

Q = [(0, .25), (.25, .5), (.5, .75), (.75, 1)]
E = [(i / 8, (i + 1) / 8 - .02) for i in range(8)]
S16 = [(i / 16, (i + 1) / 16) for i in (0, 3, 6, 8, 11, 14)]


def nav(active):
    items = [("learn", "MxTodayL.dc.html"), ("practice", "#"), ("studio", "MxStudioD.dc.html"), ("library", "#")]
    out = "".join(key(f'{I[n]}<span class="kw">{n}</span>', cls="on" if n == active else "", led=LED["prod"] if n == active else None, href=h, aria=n, h=62) for n, h in items)
    return f'<nav aria-label="Main" class="g" style="position:absolute;left:14px;right:14px;bottom:24px">{out}</nav>'


def phone(mode, inner, extra=""):
    return f'<div class="dev {mode} face" style="width:390px;height:844px;position:relative;overflow:hidden"><div style="padding:12px 14px 0">{inner}</div>{extra}</div>'


def header(title_right):
    return ('<div style="display:flex;align-items:center;justify-content:space-between;height:44px;padding:0 2px">'
            f'<div style="display:flex;align-items:center;gap:8px"><span style="width:26px;height:26px;border-radius:50%;background:#0B0B0C;display:flex;align-items:center;justify-content:center"><img src="{CAT}" alt="" style="width:21px"></span>'
            '<span class="wm"><b>CCD</b><span>SCHOOL</span></span></div>'
            f'{title_right}</div>')


def today(mode):
    rows = [("kick", LED["fund"], Q, "full"), ("hats", LED["fund"], E, "full"), ("bass", LED["prod"], [(0, 1)], "dash"), ("chords", LED["lilac"], Q, "full")]
    chips = f'<div style="display:flex;gap:6px"><span class="chip">340 xp</span><span class="chip">{I["flame"]}4 days</span></div>'
    scr = (f'<div class="scr" style="margin-top:8px"><div class="scrf" style="padding:16px 16px 18px;height:220px">'
           f'<img src="{CAT}" alt="" style="position:absolute;right:16px;top:14px;width:68px">'
           '<div class="ss">your track</div><div class="cond" style="font-size:34px;margin-top:4px">3 layers</div>'
           '<div class="ss" style="margin-top:4px">120 bpm · bass is next</div>'
           f'<div style="margin-top:20px">{lanes(330, rows)}</div></div></div>')
    nxt = ('<a class="m" style="margin-top:12px;display:block"><div class="mf" style="flex-direction:row;justify-content:flex-start;gap:12px;padding:10px;align-items:center">'
           f'<img src="{SYNTH}" alt="" style="width:62px;height:62px;border-radius:8px;object-fit:cover;flex:none">'
           '<div style="flex:1;min-width:0"><div class="lbl">next · producer 02</div>'
           '<div class="cond" style="font-size:24px;margin-top:4px">bass and poli</div>'
           '<div class="val" style="margin-top:4px;color:#C42A70;font-weight:600">adds bass to your track · 7 min</div></div>'
           '</div><span class="nl"></span></a>')
    go = ('<div class="g" style="margin-top:6px">'
          + key(f'{I["hear"]}<span class="kw">hear</span>', href="MxStudioD.dc.html", aria="Hear your track", h=58)
          + key(f'<span style="display:flex;align-items:center;gap:8px">{I["play"]}<span class="kw" style="font-size:16px;font-weight:650">start lesson</span></span>', cls="go", href="MxWorldL.dc.html", aria="Start lesson", h=58, style="grid-column:span 3")
          + '</div>')
    knobs = ('<div class="g" style="margin-top:12px">'
             + knob(CAPS["fund"], LED["fund"], "basics", "5 / 40", 5 / 40)
             + knob(CAPS["dj"], LED["dj"], "dj", "1 / 40", 1 / 40)
             + knob(CAPS["prod"], LED["prod"], "producer", "1 / 91", 1 / 91)
             + knob(CAPS["navy"] if mode == "light" else CAPS["grey"], LED["lilac"], "today", "20 / 50 xp", .4) + '</div>')
    steps = ('<div style="display:flex;justify-content:space-between;margin:14px 2px 8px"><span class="lbl">producer · first contact</span><span class="lbl">1 of 16</span></div><div class="g">'
             + pad(f'<span class="num" style="font-size:22px;color:#141416">01</span>', "lit", LED["prod"], "Step 1, done", 54)
             + pad('<span class="num" style="font-size:22px">02</span>', "next", None, "Step 2, next", 54, "MxWorldL.dc.html")
             + pad('<span class="num" style="font-size:22px">03</span>', "", None, "Step 3", 54)
             + pad('<span class="num" style="font-size:22px">04</span>', "", None, "Step 4", 54) + '</div>')
    return phone(mode, header(chips) + scr + nxt + go + knobs + steps, nav("learn"))


def world():
    scr = (f'<div class="scr" style="margin-top:8px"><div class="scrf" style="height:188px;display:flex">'
           f'<img src="{SYNTH}" alt="A hand turning a synth knob" style="width:140px;height:100%;object-fit:cover">'
           '<div style="flex:1;padding:16px;display:flex;flex-direction:column;justify-content:space-between">'
           '<div style="display:flex;justify-content:space-between"><span class="ss">step 02</span><span class="ss">7 min</span></div>'
           '<div><div class="cond" style="font-size:30px">bass and poli</div>'
           '<svg width="160" height="26" viewBox="0 0 160 26" aria-hidden="true" style="margin-top:8px;display:block"><path d="M2 13C12 1 22 1 32 13s20 12 30 0 20-12 30 0 20 12 30 0 20-12 30 0" fill="none" stroke="#FF4F9A" stroke-width="2" stroke-linecap="round"/></svg>'
           '<div style="font-size:12.5px;color:#FF6FAE;margin-top:6px;font-weight:600">adds bass to your track</div></div>'
           '<div class="ss">+50 xp</div></div></div></div>')
    pads = ""
    for n in range(1, 17):
        if n == 1:
            pads += pad(f'<span class="num" style="color:#141416">{n:02d}</span><span style="display:flex;align-items:center;gap:2px;font-size:11px;font-weight:600">{I["check"]}done</span>', "lit", LED["prod"], "Step 1, done", 70)
        elif n == 2:
            pads += pad(f'<span class="num">{n:02d}</span><span style="font-size:11px;font-weight:700;color:#C42A70">next</span>', "next", None, "Step 2, next", 70, "MxAddL.dc.html")
        elif n <= 8:
            pads += pad(f'<span class="num">{n:02d}</span><span class="val">&nbsp;</span>', "", None, f"Step {n}", 70)
        else:
            pads += pad(f'<span class="num">{n:02d}</span><span class="val">{I["lock"]}</span>', "dim", None, f"Step {n}, locked", 70)
    head = ('<div style="display:flex;align-items:center;gap:10px;height:48px">'
            + key(I["back"], href="MxTodayL.dc.html", aria="Back", h=44, style="width:46px")
            + '<div style="flex:1"><div class="cond" style="font-size:26px">producer</div><div class="val">first contact · 1 of 91 done</div></div>'
            '<span class="dash lit" style="--c:#FF4F9A"></span></div>')
    body = (head + scr + '<div style="display:flex;justify-content:space-between;margin:14px 2px 8px"><span class="lbl">first contact</span><span class="lbl">16 steps</span></div>'
            + f'<div class="g">{pads}</div>')
    bottom = ('<div class="g" style="position:absolute;left:14px;right:14px;bottom:24px">'
              + key(f'{I["hear"]}<span class="kw">preview</span>', aria="Preview what it adds", h=62)
              + key(f'<span style="display:flex;align-items:center;gap:8px">{I["play"]}<span class="kw" style="font-size:16px;font-weight:650">start step 02</span></span>', cls="go", href="MxAddL.dc.html", aria="Start step 2", h=62, style="grid-column:span 3")
              + '</div>')
    return phone("light", body, bottom)


def studio():
    rows = [("kick", LED["fund"], Q, "full"), ("hats", LED["fund"], E, "full"), ("bass", LED["prod"], S16, "full"), ("chords", LED["lilac"], Q, "full")]
    head = ('<div style="display:flex;align-items:center;justify-content:space-between;height:44px;padding:0 2px">'
            '<span class="wm"><b>STUDIO</b><span> MY TRACK</span></span><span class="val">4 layers · 120 bpm</span></div>')
    scr = (f'<div class="scr" style="margin-top:6px"><div class="scrf" style="padding:14px 16px 16px;height:186px">'
           '<div style="display:flex;justify-content:space-between;align-items:flex-start"><div><div class="ss">editing</div>'
           '<div class="cond" style="font-size:28px;margin-top:3px;color:#FF6FAE">bass</div></div>'
           '<div style="text-align:right"><div class="ss">cutoff</div><div class="cond" style="font-size:28px;margin-top:3px">62%</div></div></div>'
           f'<div style="margin-top:14px">{lanes(330, rows, sel=2)}</div></div></div>')
    knobs = ('<div class="g" style="margin-top:10px">'
             + knob(CAPS["prod"], LED["prod"], "cutoff", "62%", .62) + knob(CAPS["prod"], LED["lilac"], "res", "30%", .3)
             + knob(CAPS["prod"], LED["dj"], "glide", "15%", .15) + knob(CAPS["prod"], LED["fund"], "level", "75%", .75) + '</div>')
    faders = ('<div class="g" style="margin-top:6px">'
              + fader("kick", LED["fund"], .8, 118) + fader("hats", LED["fund"], .5, 118) + fader("bass", LED["prod"], .7, 118) + fader("chords", LED["lilac"], .45, 118) + '</div>')
    sel = ('<div class="g" style="margin-top:6px">'
           + "".join(pad(f'<span style="font-size:11px;font-weight:700">{t}</span>', "lit" if i == 2 else "", c if i == 2 else None, f"Select {t}", 30)
                     for i, (t, c) in enumerate([("select", LED["fund"]), ("select", LED["fund"]), ("editing", LED["prod"]), ("select", LED["lilac"])]))
           + '</div>')
    transport = ('<div class="g" style="margin-top:6px">'
                 + key(f'{I["play"]}<span class="kw">play</span>', cls="go", aria="Play", h=56)
                 + key(f'{I["stop"]}<span class="kw">stop</span>', aria="Stop", h=56)
                 + key(f'{I["plus"]}<span class="kw">layer</span>', aria="Add a layer", h=56)
                 + key(f'{I["out"]}<span class="kw">to live</span>', aria="Export to Ableton Live", h=56) + '</div>')
    return phone("dark", head + scr + knobs + faders + sel + transport, nav("studio"))


def page(name, title, body):
    with open(os.path.join(OUT, name), "w") as f:
        f.write(HEAD.format(title=title, css=CSS, body=body, w=390, h=844))
    print("wrote", name)


if __name__ == "__main__":
    page("MxTodayL.dc.html", "Mix · Today, light", today("light"))
    page("MxTodayD.dc.html", "Mix · Today, dark", today("dark"))
    page("MxWorldL.dc.html", "Mix · Producer world", world())
    page("MxStudioD.dc.html", "Mix · Studio, dark", studio())
