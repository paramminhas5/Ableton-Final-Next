#!/usr/bin/env python3
"""Model 1 component sheet (light + dark) and the reworked Today."""
import os, math
import gen_m2 as M
import gen_field as F

N, C, I, CAT, SYNTH = M.N, F.C, M.I, M.CAT, M.SYNTH
key, enc, fader, pad, lanes = M.key, M.enc, M.fader, M.pad, M.lanes
RED = "#FF4A5A"

CSS3 = M.CSS + r"""
.panel{border-radius:22px;background:linear-gradient(180deg,var(--deck),var(--deck2));box-shadow:0 0 0 1px var(--line,rgba(0,0,0,.06)),inset 0 1px 0 var(--modhi);padding:22px 24px 26px}
.light{--line:rgba(0,0,0,.07)}.dark{--line:rgba(255,255,255,.07)}
.sec{font-size:22px;font-weight:400;letter-spacing:-.02em;margin:0 0 16px}
.cell{display:flex;flex-direction:column;align-items:center;gap:10px}
.cap2{font-size:12px;font-weight:600;text-align:center;line-height:1.3}
.cap2 span{display:block;font-weight:500;color:var(--sub);font-size:11px}
.rb{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:34px;min-width:64px;padding:0 10px;border-radius:7px;background:linear-gradient(180deg,var(--cap1),var(--cap2));box-shadow:0 2px 0 var(--capside),0 4px 8px var(--sh),inset 0 1px 0 var(--modhi);font-size:11.5px;font-weight:600;color:var(--ink);box-sizing:border-box}
.rb i{width:6px;height:6px;border-radius:3px;background:var(--ledoff)}
.rb i.on{background:var(--c);box-shadow:0 0 6px var(--c)}
.wheel{width:30px;height:110px;border-radius:8px;background:repeating-linear-gradient(180deg,var(--k1) 0 3px,var(--k2) 3px 6px);box-shadow:inset 0 0 0 1px rgba(0,0,0,.15),0 3px 6px var(--sh)}
.slot{border-radius:12px;background:var(--well);box-shadow:inset 0 2px 5px var(--sh);display:flex;align-items:center;justify-content:center}
"""


def board(mode, title, body, w, h):
    html = F.HEAD.format(title=title, css=CSS3, body=body, w=w, h=h)
    return html.replace("family=Outfit:wght@200;300;400;500;600", "family=Outfit:wght@200;300;400;500;600;700")


def write(name, html):
    with open(os.path.join(F.OUT, name), "w") as f:
        f.write(html)
    print("wrote", name)


def cell(inner, name, where, w=None):
    ww = f"width:{w}px;" if w else ""
    return f'<div class="cell" style="{ww}">{inner}<div class="cap2">{name}<span>{where}</span></div></div>'


def sq(inner, w=88, h=88, extra=""):
    return f'<div style="width:{w}px;height:{h}px;{extra}">{inner}</div>'

# ── new parts ────────────────────────────────────────────────────────────

def seven(text, h=34, col=N["prod"]):
    SEG = {"0": "abcdef", "1": "bc", "2": "abged", "3": "abgcd", "4": "fgbc", "5": "afgcd", "6": "afgedc", "7": "abc", "8": "abcdefg", "9": "abcfgd", "-": "g", " ": ""}
    w = h * 0.52; t = h * 0.12; gap = h * 0.18
    out, x = [], 0
    for ch in text:
        if ch == ".":
            out.append(f'<rect x="{x-gap*0.55:.1f}" y="{h-t:.1f}" width="{t:.1f}" height="{t:.1f}" rx="1" fill="{col}"/>')
            continue
        on = SEG.get(ch, "")
        segs = {"a": (x + t, 0, w - 2 * t, t), "g": (x + t, h / 2 - t / 2, w - 2 * t, t), "d": (x + t, h - t, w - 2 * t, t),
                "f": (x, t, t, h / 2 - 1.5 * t), "b": (x + w - t, t, t, h / 2 - 1.5 * t), "e": (x, h / 2 + t / 2, t, h / 2 - 1.5 * t), "c": (x + w - t, h / 2 + t / 2, t, h / 2 - 1.5 * t)}
        for k, (sx, sy, sw, sh) in segs.items():
            lit = k in on
            out.append(f'<rect x="{sx:.1f}" y="{sy:.1f}" width="{sw:.1f}" height="{sh:.1f}" rx="{t/2:.1f}" fill="{col if lit else "#1E1E21"}" {"style=\"filter:drop-shadow(0 0 3px " + col + ")\"" if lit else ""}/>')
        x += w + gap
    W = x
    return f'<svg width="{W:.0f}" height="{h}" viewBox="0 0 {W:.0f} {h}" aria-hidden="true">{"".join(out)}</svg>'


def digits(text, h=34, col=N["prod"], pad_=12):
    return f'<div style="background:#050506;border-radius:8px;padding:{pad_}px {pad_+2}px;box-shadow:0 0 0 3px #000,inset 0 0 0 1px rgba(255,255,255,.06)">{seven(text, h, col)}</div>'


def meter(n=12, lit=5, vertical=True, size=8, length=150):
    cols = [N["fund"]] * 7 + [N["lilac"]] * 3 + [N["prod"]] * 2
    segs = ""
    for i in range(n):
        on = i < lit
        c = cols[i]
        segs += f'<span style="display:block;{"width:22px;height:" + str(size) + "px" if vertical else "height:22px;width:" + str(size) + "px"};border-radius:2px;background:{c if on else "#232326"};{"box-shadow:0 0 6px " + c if on else ""}"></span>'
    d = "column-reverse" if vertical else "row"
    return f'<div style="display:flex;flex-direction:{d};gap:4px;padding:10px;border-radius:10px;background:#050506;box-shadow:0 0 0 3px #000">{segs}</div>'


def beatlights(cur=0):
    return '<div style="display:flex;gap:10px;padding:12px 14px;border-radius:10px;background:#050506;box-shadow:0 0 0 3px #000">' + "".join(f'<span style="width:12px;height:12px;border-radius:6px;background:{(N["prod"] if i == 0 else "#F2F1EE") if i == cur else "#26262A"};{"box-shadow:0 0 8px " + (N["prod"] if i == 0 else "#F2F1EE") if i == cur else ""}"></span>' for i in range(4)) + '</div>'


def vu(frac=.6, w=150):
    h = w * .62
    cx, cy, r = w / 2, h * .95, w * .44
    ticks = ""
    for i in range(11):
        a = math.radians(-150 + i * 12)
        x0, y0 = cx + r * math.cos(a), cy + r * math.sin(a)
        x1, y1 = cx + (r - (9 if i % 2 == 0 else 5)) * math.cos(a), cy + (r - (9 if i % 2 == 0 else 5)) * math.sin(a)
        ticks += f'<path d="M{x0:.1f} {y0:.1f}L{x1:.1f} {y1:.1f}" stroke="{"#D4305F" if i >= 8 else "#2A2622"}" stroke-width="1.5"/>'
    a = math.radians(-150 + frac * 120)
    nx, ny = cx + (r + 2) * math.cos(a), cy + (r + 2) * math.sin(a)
    return (f'<svg width="{w}" height="{h:.0f}" viewBox="0 0 {w} {h:.0f}" aria-hidden="true" style="border-radius:10px;background:linear-gradient(180deg,#F1E9D8,#E2D8C2);box-shadow:0 0 0 3px #000,inset 0 2px 6px rgba(0,0,0,.25)">'
            f'{ticks}<text x="{cx}" y="{h*.62:.0f}" text-anchor="middle" font-family="Outfit" font-size="11" font-weight="600" fill="#2A2622">vu</text>'
            f'<path d="M{cx} {cy}L{nx:.1f} {ny:.1f}" stroke="#141414" stroke-width="1.6"/><circle cx="{cx}" cy="{cy}" r="5" fill="#141414"/></svg>')


def push_enc(color, frac=.45, size=74):
    W = size + 26; c = W / 2
    dots = ""
    for i in range(15):
        a = math.radians(135 + i * 270 / 14)
        x, y = c + (size / 2 + 8) * math.cos(a), c + (size / 2 + 8) * math.sin(a)
        on = i / 14 <= frac
        dots += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="2.6" fill="{color if on else "var(--ledoff)"}" {"style=\"filter:drop-shadow(0 0 3px " + color + ")\"" if on else ""}/>'
    return (f'<div style="position:relative;width:{W}px;height:{W}px"><svg width="{W}" height="{W}" style="position:absolute;inset:0" aria-hidden="true">{dots}</svg>'
            f'<div class="knob" style="position:absolute;left:13px;top:13px;width:{size}px;height:{size}px"><i style="--c:var(--cap2);display:flex;align-items:center;justify-content:center"><span style="font-size:10px;font-weight:600;color:var(--sub)">push</span></i></div></div>')


def mode_dial(sel=2, size=104, labels=("basics", "dj", "producer"), cols=None):
    cols = cols or [N["fund"], N["dj"], N["prod"]]
    W, H = size + 110, size + 62
    cx, cy = W / 2, H / 2 + 14
    out = []
    angs = [-150, -90, -30]
    for i, (lab, a) in enumerate(zip(labels, angs)):
        r = size / 2 + 12
        x0, y0 = cx + r * math.cos(math.radians(a)), cy + r * math.sin(math.radians(a))
        x1, y1 = cx + (r + 8) * math.cos(math.radians(a)), cy + (r + 8) * math.sin(math.radians(a))
        on = i == sel
        out.append(f'<path d="M{x0:.1f} {y0:.1f}L{x1:.1f} {y1:.1f}" stroke="{cols[i] if on else "var(--tick)"}" stroke-width="{3 if on else 1.5}" stroke-linecap="round" {"style=\"filter:drop-shadow(0 0 4px " + cols[i] + ")\"" if on else ""}/>')
        tx, ty = cx + (r + 22) * math.cos(math.radians(a)), cy + (r + 22) * math.sin(math.radians(a))
        if a < -100: tx, anchor, ty = 2, "start", y1 - 10
        elif a > -80: tx, anchor, ty = W - 2, "end", y1 - 10
        else: anchor = "middle"
        out.append(f'<text x="{tx:.1f}" y="{ty+4:.1f}" text-anchor="{anchor}" font-family="Outfit" font-size="12" font-weight="{600 if on else 500}" fill="{"var(--ink)" if on else "var(--sub)"}">{lab}</text>')
    svg = f'<svg width="{W:.0f}" height="{H:.0f}" style="position:absolute;inset:0" aria-hidden="true">{"".join(out)}</svg>'
    rot = angs[sel] + 90
    knob = (f'<div class="knob" style="position:absolute;left:{cx-size/2:.0f}px;top:{cy-size/2:.0f}px;width:{size}px;height:{size}px">'
            f'<i style="--c:var(--cap2);position:relative"><b style="position:absolute;left:50%;top:6%;width:3px;height:30%;margin-left:-1.5px;border-radius:2px;background:{cols[sel]};box-shadow:0 0 6px {cols[sel]};transform:rotate({rot}deg);transform-origin:50% 147%"></b></i></div>')
    return f'<div style="position:relative;width:{W:.0f}px;height:{H:.0f}px" role="img" aria-label="World dial set to {labels[sel]}">{svg}{knob}</div>'


def small_knob(col, frac, s=40):
    return f'<div class="knob" style="width:{s}px;height:{s}px"><i style="--c:{col};position:relative"><b style="position:absolute;left:50%;top:8%;width:2px;height:30%;margin-left:-1px;background:#fff;border-radius:1px;transform:rotate({-135+270*frac:.0f}deg);transform-origin:50% 140%"></b></i></div>'


def eq_strip():
    rows = ""
    for lab, f, kill in [("hi", .5, False), ("mid", .45, False), ("low", .05, True)]:
        rows += (f'<div style="display:flex;align-items:center;gap:10px">{small_knob("#9C9EA4", f)}'
                 f'<span class="rb" style="min-width:52px;height:28px;--c:{RED}"><i class="{"on" if kill else ""}"></i>kill</span>'
                 f'<span class="val" style="width:24px">{lab}</span></div>')
    return f'<div style="display:flex;flex-direction:column;gap:10px">{rows}</div>'


def pitch_fader(h=170):
    ticks = "".join(f'<i style="position:absolute;left:0;top:{6 + j*(h-12)/16:.0f}px;width:{12 if j%8==0 else 6}px;height:1px;background:var(--tick)"></i>' for j in range(17))
    return (f'<div style="position:relative;width:60px;height:{h}px">{ticks}'
            f'<span style="position:absolute;right:0;top:-2px;font-size:10px;color:var(--sub)">-8</span><span style="position:absolute;right:0;top:{h/2-7:.0f}px;font-size:10px;color:{N["fund"]};font-weight:700">0</span><span style="position:absolute;right:0;bottom:-2px;font-size:10px;color:var(--sub)">+8</span>'
            f'<div style="position:absolute;left:26px;top:4px;bottom:4px;width:4px;border-radius:2px;background:var(--slot)"></div>'
            f'<div style="position:absolute;left:12px;top:{h*0.42:.0f}px;width:32px;height:22px;border-radius:5px;background:linear-gradient(180deg,var(--cap1),var(--cap2));box-shadow:0 3px 5px var(--sh),inset 0 1px 0 var(--modhi)"><i style="position:absolute;left:5px;right:5px;top:10px;height:2px;background:var(--ink)"></i></div></div>')


def touch_strip(w=220, lit=(5, 6, 7)):
    dots = "".join(f'<span style="width:7px;height:7px;border-radius:4px;background:{N["dj"] if i in lit else "var(--ledoff)"};{"box-shadow:0 0 6px " + N["dj"] if i in lit else ""}"></span>' for i in range(16))
    return f'<div style="width:{w}px;height:40px;border-radius:10px;background:linear-gradient(180deg,var(--padoff),var(--mod2));box-shadow:inset 0 1px 3px var(--sh);display:flex;align-items:center;justify-content:space-around;padding:0 8px;box-sizing:border-box">{dots}</div>'


def vel_pads():
    v = [.9, .3, .6, .2, .5, 1, .3, .7, .2, .6, .9, .4, 1, .4, .2, .8]
    return '<div style="display:grid;grid-template-columns:repeat(4,40px);gap:6px">' + "".join(f'<span class="pd lit" style="height:40px;--c:rgba(255,79,154,{a})"></span>' for a in v) + '</div>'


def clip_grid():
    cols = [N["fund"], N["fund"], N["dj"], N["dj"], N["prod"], N["prod"], N["lilac"], N["lilac"]]
    cells = ""
    for r in range(8):
        for c in range(8):
            on = (r * 3 + c * 5) % 7 < 3 and r < 6
            playing = r == 2
            cells += f'<span style="width:17px;height:17px;border-radius:3px;background:{cols[c] if on else "var(--padoff)"};{"box-shadow:0 0 6px " + cols[c] if on and playing else ""};opacity:{1 if (on and playing) or not on else .6}"></span>'
    return f'<div style="display:grid;grid-template-columns:repeat(8,17px);gap:4px;padding:10px;border-radius:12px;background:var(--mod2)">{cells}</div>'


def hot_cues():
    cs = [N["prod"], N["fund"], N["dj"], N["lilac"]]
    return '<div style="display:grid;grid-template-columns:repeat(4,44px);gap:6px">' + "".join(f'<span class="pd lit" style="height:44px;--c:{c}">{l}</span>' for c, l in zip(cs, "abcd")) + '</div>'


def quiz_pads():
    ans = [("high-pass", False), ("low-pass", True), ("band-pass", False), ("notch", False)]
    return '<div style="display:grid;grid-template-columns:repeat(2,96px);gap:6px">' + "".join(f'<span class="pd{" lit" if ok else ""}" style="height:52px;{"--c:" + N["fund"] if ok else ""}">{a}</span>' for a, ok in ans) + '</div>'


def wheels():
    return ('<div style="display:flex;gap:12px">'
            + "".join(f'<div style="display:flex;flex-direction:column;align-items:center;gap:6px"><div class="slot" style="width:44px;height:126px"><div class="wheel"></div></div><span class="val">{l}</span></div>' for l in ("pitch", "mod")) + '</div>')


def xy_pad(s=150):
    grid = "".join(f'<i style="position:absolute;left:{p}%;top:0;bottom:0;width:1px;background:var(--line)"></i><i style="position:absolute;top:{p}%;left:0;right:0;height:1px;background:var(--line)"></i>' for p in (25, 50, 75))
    return (f'<div style="position:relative;width:{s}px;height:{s}px;border-radius:12px;background:linear-gradient(180deg,var(--padoff),var(--mod2));box-shadow:inset 0 1px 3px var(--sh);overflow:hidden">{grid}'
            f'<i style="position:absolute;left:62%;top:0;bottom:0;width:1px;background:{N["prod"]};opacity:.6"></i><i style="position:absolute;top:34%;left:0;right:0;height:1px;background:{N["prod"]};opacity:.6"></i>'
            f'<span style="position:absolute;left:62%;top:34%;width:18px;height:18px;margin:-9px;border-radius:9px;background:{N["prod"]};box-shadow:0 0 14px {N["prod"]}"></span>'
            '<span class="val" style="position:absolute;left:8px;bottom:6px">cutoff →</span><span class="val" style="position:absolute;left:8px;top:6px">↑ res</span></div>')


def turntable(s=200):
    return (f'<div style="position:relative;width:{s+40}px;height:{s}px;border-radius:16px;background:linear-gradient(180deg,var(--mod),var(--mod2));box-shadow:inset 0 1px 0 var(--modhi),0 2px 6px var(--sh)">'
            f'<div style="position:absolute;left:12px;top:12px;width:{s-24}px;height:{s-24}px;border-radius:50%;background:repeating-conic-gradient(var(--k1) 0 3deg,var(--k2) 3deg 6deg);box-shadow:0 4px 8px var(--sh)"></div>'
            f'<div class="plat" style="position:absolute;left:22px;top:22px;width:{s-44}px;height:{s-44}px"><div style="width:52px;height:52px;border-radius:50%;background:{N["prod"]};display:flex;align-items:center;justify-content:center"><img src="{CAT}" alt="" style="width:70%"></div></div>'
            f'<svg width="{s+40}" height="{s}" style="position:absolute;inset:0" aria-hidden="true"><circle cx="{s+14}" cy="26" r="10" fill="var(--cap2)" stroke="var(--capside)"/><path d="M{s+14} 26L{s+8} {s*0.62:.0f}L{s-20} {s*0.72:.0f}" fill="none" stroke="#B9B8B3" stroke-width="3.5" stroke-linecap="round"/><rect x="{s-34}" y="{s*0.68:.0f}" width="18" height="10" rx="2" fill="#2A2A2C" transform="rotate(-20 {s-25} {s*0.72:.0f})"/></svg>'
            f'<span class="rb" style="position:absolute;left:12px;bottom:-44px;min-width:56px">33</span><span class="rb" style="position:absolute;left:76px;bottom:-44px;min-width:56px">45</span>'
            f'<span class="rb" style="position:absolute;left:140px;bottom:-44px;min-width:86px;--c:{N["fund"]}"><i class="on"></i>start · stop</span></div>')


def patch():
    jack = lambda x, c: f'<g><circle cx="{x}" cy="30" r="13" fill="var(--cap2)" stroke="var(--capside)" stroke-width="2"/><circle cx="{x}" cy="30" r="5" fill="#0B0B0C"/></g>'
    return (f'<svg width="220" height="110" aria-hidden="true">'
            + jack(30, 0) + jack(90, 0) + jack(150, 0) + jack(200, 0)
            + '<text x="30" y="60" text-anchor="middle" font-family="Outfit" font-size="10" fill="var(--sub)">osc</text><text x="90" y="60" text-anchor="middle" font-family="Outfit" font-size="10" fill="var(--sub)">lfo</text><text x="150" y="60" text-anchor="middle" font-family="Outfit" font-size="10" fill="var(--sub)">filter</text><text x="200" y="60" text-anchor="middle" font-family="Outfit" font-size="10" fill="var(--sub)">out</text>'
            + f'<path d="M30 30C30 100 150 100 150 30" fill="none" stroke="{N["prod"]}" stroke-width="5" stroke-linecap="round"/><path d="M90 30C90 80 200 80 200 30" fill="none" stroke="{N["dj"]}" stroke-width="5" stroke-linecap="round"/></svg>')


def toggle(on=True):
    return (f'<svg width="56" height="80" aria-hidden="true"><rect x="10" y="22" width="36" height="36" rx="18" fill="var(--cap2)" stroke="var(--capside)" stroke-width="2"/>'
            f'<path d="M28 40L{28 + (0 if on else 0)} {8 if on else 72}" stroke="#B9B8B3" stroke-width="7" stroke-linecap="round"/><circle cx="28" cy="40" r="7" fill="#8A8985"/>'
            f'<text x="28" y="{6 if not on else 78}" text-anchor="middle" font-family="Outfit" font-size="9" fill="var(--sub)">{"off" if on else "on"}</text></svg>')


def slide3(sel=2, labels=("light", "dark", "auto")):
    pos = [8, 58, 108]
    return (f'<div style="position:relative;width:160px;height:58px"><div style="position:absolute;left:8px;right:8px;top:8px;height:22px;border-radius:11px;background:var(--well);box-shadow:inset 0 2px 4px var(--sh)"></div>'
            f'<div style="position:absolute;left:{pos[sel]}px;top:4px;width:44px;height:30px;border-radius:8px;background:linear-gradient(180deg,var(--cap1),var(--cap2));box-shadow:0 3px 5px var(--sh),inset 0 1px 0 var(--modhi)"></div>'
            + "".join(f'<span class="val" style="position:absolute;left:{p+22}px;top:40px;transform:translateX(-50%);{"color:var(--ink);font-weight:600" if i == sel else ""}">{l}</span>' for i, (p, l) in enumerate(zip(pos, labels))) + '</div>')


def mini_screen(svg, title, w=220, h=120):
    return f'<div class="scr"><div class="scrf" style="width:{w}px;height:{h}px;padding:10px 12px"><div class="ss">{title}</div><div style="margin-top:6px">{svg}</div></div></div>'


def piano_roll(w=196, h=80):
    notes = [(0, 2, 5), (2, 1, 5), (3, 2, 3), (6, 2, 2), (8, 3, 5), (11, 1, 4), (12, 3, 3)]
    rows = "".join(f'<rect x="0" y="{i*h/8:.0f}" width="{w}" height="{h/8:.0f}" fill="{"#111113" if i%2 else "#0A0A0B"}"/>' for i in range(8))
    nn = "".join(f'<rect x="{s*w/16+1:.0f}" y="{r*h/8+1:.0f}" width="{l*w/16-2:.0f}" height="{h/8-2:.0f}" rx="2" fill="{N["prod"]}"/>' for s, l, r in notes)
    return f'<svg width="{w}" height="{h}" aria-hidden="true">{rows}{nn}</svg>'


def sample_wave(w=196, h=70):
    import random
    random.seed(5)
    bars = "".join(f'<rect x="{i*w/80:.1f}" y="{h/2 - a:.1f}" width="1.6" height="{2*a:.1f}" fill="{"#7D96FF" if 18 <= i <= 58 else "#3A3A40"}"/>' for i, a in ((i, (h / 2 - 3) * (0.25 + 0.75 * random.random()) * (1 - i / 120)) for i in range(80)))
    return f'<svg width="{w}" height="{h}" aria-hidden="true">{bars}<path d="M{18*w/80:.0f} 0V{h}M{58*w/80:.0f} 0V{h}" stroke="#F2F1EE" stroke-width="1.5"/><text x="{18*w/80+3:.0f}" y="10" font-family="Outfit" font-size="9" fill="#F2F1EE">start</text><text x="{58*w/80+3:.0f}" y="10" font-family="Outfit" font-size="9" fill="#F2F1EE">end</text></svg>'


def adsr(w=196, h=70):
    return (f'<svg width="{w}" height="{h}" aria-hidden="true"><path d="M2 {h-4}L30 6L66 26H140L190 {h-4}" fill="rgba(184,156,255,.12)" stroke="{N["lilac"]}" stroke-width="2"/>'
            + "".join(f'<text x="{x}" y="{h-2}" font-family="Outfit" font-size="9" fill="#8F8F94">{l}</text>' for x, l in ((12, "a"), (46, "d"), (100, "s"), (164, "r"))) + '</svg>')


def eq_curve(w=196, h=70):
    return (f'<svg width="{w}" height="{h}" aria-hidden="true"><path d="M0 {h/2}H{w}" stroke="#2A2A2D"/>'
            f'<path d="M0 {h-6}C20 {h-6} 26 {h/2} 40 {h/2}S80 {h/2} 100 {h/2-20} 120 {h/2} 150 {h/2} 180 {h/2+12} {w} {h/2+14}" fill="none" stroke="{N["fund"]}" stroke-width="2"/>'
            f'<circle cx="100" cy="{h/2-20}" r="4" fill="{N["fund"]}"/><circle cx="40" cy="{h/2}" r="4" fill="{N["fund"]}"/></svg>')


def flow(w=196, h=70):
    box = lambda x, t, c: f'<rect x="{x}" y="22" width="44" height="26" rx="5" fill="none" stroke="{c}" stroke-width="1.5"/><text x="{x+22}" y="39" text-anchor="middle" font-family="Outfit" font-size="10" fill="#F2F1EE">{t}</text>'
    return (f'<svg width="{w}" height="{h}" aria-hidden="true">{box(0, "osc", N["prod"])}{box(76, "filter", N["lilac"])}{box(152, "amp", N["fund"])}'
            '<path d="M44 35H76M120 35H152" stroke="#F2F1EE" stroke-width="1.5" marker-end="url(#ar)"/>'
            '<defs><marker id="ar" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0L6 3L0 6z" fill="#F2F1EE"/></marker></defs></svg>')


def section(title, inner):
    return f'<div class="panel"><div class="sec">{title}</div><div style="display:flex;flex-wrap:wrap;gap:30px 34px;align-items:flex-end">{inner}</div></div>'


def sheet(mode):
    keys = section("keys and buttons", "".join([
        cell(sq(key('<span class="leg">1</span>')), "key", "steps, actions"),
        cell(sq(key('<span class="leg">2</span>', cap="blk")), "next key", "the step to do"),
        cell(sq(key('<span class="leg">1</span>', led=N["prod"])), "done key", "light = done"),
        cell(sq(key(I["play"], "learn", cap="go")), "go key", "one per screen"),
        cell(sq(key(I["shift"], "shift")), "shift", "page 2, explain"),
        cell(f'<div style="width:180px;height:88px"><a class="m wide" style="height:88px"><span class="cap go pill" style="width:88%;height:62%;font-size:15px;font-weight:500">add to my track</span></a></div>', "pill key", "big actions"),
        cell('<div style="display:flex;gap:6px">' + "".join(sq(key(I[k], k), 70, 70) for k in ("play", "stop", "rec")) + '</div>', "transport", "studio, dj, lessons"),
        cell('<div style="display:flex;flex-direction:column;gap:6px">' + "".join(f'<span class="rb" style="--c:{c}"><i class="{o}"></i>{t}</span>' for t, c, o in (("mute", N["dj"], ""), ("solo", N["fund"], "on"), ("arm", RED, "on"))) + '</div>', "mute · solo · arm", "launch control"),
        cell(f'<span class="rb" style="min-width:90px;height:44px;--c:{N["prod"]}"><i class="on"></i>tap</span>', "tap tempo", "tempo lessons"),
    ]))
    knobs = section("knobs", "".join([
        cell(sq(enc(C["prod"], N["prod"], "cutoff", "62%", .62)), "knob + led", "every parameter"),
        cell(push_enc(N["dj"]), "push encoder", "library browse"),
        cell(mode_dial(), "mode dial", "pick a world"),
        cell(eq_strip(), "3-band eq + kill", "dj mixer"),
    ]))
    faders = section("faders and strips", "".join([
        cell(f'<div style="width:88px">{fader("level", N["fund"], .7, 150)}</div>', "channel fader", "layers, decks"),
        cell(f'<div style="width:180px">' + M.dj().split('<div class="g" style="margin-top:5px;align-items:end">')[1].split('</div>' * 1)[0] if False else f'<div style="width:180px;height:96px"><div class="m wide" style="height:96px;flex-direction:column;gap:10px"><div style="position:relative;width:130px;height:24px"><div style="position:absolute;top:10px;left:0;right:0;height:4px;border-radius:2px;background:var(--slot)"></div><div style="position:absolute;top:1px;left:54px;width:22px;height:22px;border-radius:4px;background:linear-gradient(180deg,var(--cap1),var(--cap2));box-shadow:0 3px 5px var(--sh)"><i style="position:absolute;top:5px;bottom:5px;left:10px;width:2px;background:var(--ink)"></i></div></div><span class="ml" style="color:var(--ink)">a ◂ ▸ b</span></div></div>', "crossfader", "dj"),
        cell(pitch_fader(), "pitch fader", "beatmatching"),
        cell(touch_strip(), "touch strip", "scrub, bend"),
    ]))
    pads = section("pads", "".join([
        cell('<div style="display:flex;gap:6px">' + pad("sidechain", N["prod"], h=46, style="width:96px") + pad("mute", None, h=46, style="width:70px") + '</div>', "toggle pads", "circuit"),
        cell(vel_pads(), "drum pads", "finger drumming"),
        cell(clip_grid(), "clip grid", "session view"),
        cell(hot_cues(), "hot cues", "dj"),
        cell(quiz_pads(), "answer pads", "every quiz"),
    ]))
    play = section("playing", "".join([
        cell('<div style="display:flex;gap:4px;position:relative;padding-top:18px">' + "".join(f'<a class="m wide" style="width:34px;height:100px;align-items:flex-end;padding-bottom:8px;box-sizing:border-box"><span class="cap pill" style="width:68%;height:70px"></span></a>' for _ in range(7)) + "".join(f'<span style="position:absolute;top:0;left:{(i+1)*38-15}px;width:28px;height:28px;border-radius:50%;background:radial-gradient(circle at 50% 30%,#303032,#0D0D0E 72%);box-shadow:0 2px 0 #000"></span>' for i in (0, 1, 3, 4, 5)) + '</div>', "keyboard", "melody, bass"),
        cell(wheels(), "pitch + mod", "synths"),
        cell(xy_pad(), "xy pad", "effects"),
        cell(M.jog(N["fund"], "a", 150), "jog wheel", "dj"),
        cell(f'<div style="padding-bottom:50px">{turntable()}</div>', "turntable", "dj basics", 260),
    ]))
    read = section("readouts", "".join([
        cell(digits("124.0", 34, N["fund"]), "number display", "bpm, xp"),
        cell(meter(), "led meter", "levels, daily goal"),
        cell(vu(), "vu meter", "gain staging"),
        cell(beatlights(0), "beat lights", "metronome"),
        cell(patch(), "patch cables", "signal flow"),
        cell(toggle(True), "toggle", "on / off"),
        cell(slide3(), "3-way switch", "light, dark, auto"),
    ]))
    screens = section("the screen", "".join([
        cell(mini_screen(lanes(196, [("kick", N["fund"], M.Q, "full"), ("bass", N["prod"], M.E, "full"), ("pad", N["lilac"], [(0, 1)], "dash")]), "your track"), "track", "today, studio"),
        cell(mini_screen(piano_roll(), "piano roll"), "notes", "midi lessons"),
        cell(mini_screen(sample_wave(), "sample"), "sample", "sampling"),
        cell(mini_screen(adsr(), "envelope"), "envelope", "synth lessons"),
        cell(mini_screen(eq_curve(), "eq"), "eq curve", "mixing"),
        cell(mini_screen(flow(), "signal flow"), "signal flow", "routing"),
    ]))
    states = section("states and feedback", "".join([
        cell(sq(key('<span class="leg">3</span>'), 76, 76), "open", ""),
        cell(sq(key('<span class="leg">3</span>', cap="blk"), 76, 76), "next", ""),
        cell(sq(key('<span class="leg">3</span>', led=N["prod"]), 76, 76), "done", ""),
        cell(sq('<div class="m is-dim" style="opacity:.45"><span class="leg" style="color:var(--sub)">3</span></div>', 76, 76), "locked", ""),
        cell(sq(key("✓", led=N["fund"]), 76, 76), "right", "mint light + tick sound"),
        cell(sq(key("✕", led=RED), 76, 76), "wrong", "red light, lose a heart"),
        cell('<span style="display:flex;gap:5px">' + "".join(f'<span style="width:11px;height:11px;border-radius:6px;background:{RED if i < 4 else "var(--ledoff)"};{"box-shadow:0 0 6px " + RED if i < 4 else ""}"></span>' for i in range(5)) + '</span>', "hearts", "flow mode"),
        cell(digits("50", 26, N["prod"], 8), "xp", "counts up once"),
    ]))
    app = section("app shell", "".join([
        cell(f'<div style="width:366px">{M.status()}</div>', "status bar", "every page"),
        cell(f'<div style="width:366px;position:relative;height:96px">{M.nav("learn", N["prod"]).replace("position:absolute;left:12px;right:12px;bottom:22px", "position:absolute;left:0;right:0;bottom:0")}</div>', "mode bar", "learn, practice, studio, library"),
        cell('<div style="width:300px;border-radius:20px 20px 0 0;background:linear-gradient(180deg,var(--mod),var(--mod2));box-shadow:0 -6px 20px var(--sh);padding:10px 16px 18px"><div style="width:36px;height:4px;border-radius:2px;background:var(--ledoff);margin:0 auto 12px"></div><div style="font-size:17px">bass · page 2</div><div class="val" style="margin-top:4px">drive · sub · octave · level</div></div>', "bottom sheet", "layer settings, add to track"),
    ]))
    head = (f'<div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:6px"><div><div class="lbl">ccd school · model 1</div>'
            f'<div style="font-size:52px;font-weight:300;letter-spacing:-.04em;line-height:1.05">components · {mode}</div></div>'
            '<span class="val" style="text-align:right">everything you touch in the app<br>is something you will touch in a studio</span></div>')
    body = (f'<div class="dev {mode}" style="width:1600px;box-sizing:border-box;padding:48px 56px;background:{"#E9E8E4" if mode=="light" else "#0E0E10"};display:flex;flex-direction:column;gap:18px">'
            + head + keys + knobs + faders + pads + play + read + screens + states + app + '</div>')
    return body


# ── NEW TODAY ────────────────────────────────────────────────────────────
def today(mode):
    rows = [("kick", N["fund"], M.Q, "full"), ("hats", N["fund"], M.E, "full"), ("bass", N["prod"], [(0, 1)], "dash"), ("chords", N["lilac"], M.Q, "full")]
    scr = (f'<div class="scr" style="margin-top:6px"><div class="scrf" style="padding:16px 16px 18px;height:224px">'
           f'<img src="{CAT}" alt="" style="position:absolute;right:16px;top:14px;width:64px">'
           '<div class="ss">your track</div><div class="big" style="font-size:36px;margin-top:4px">3 layers</div>'
           '<div class="ss" style="margin-top:6px">120 bpm · press hear to play it</div>'
           f'<div style="margin-top:14px">{lanes(334, rows)}</div></div></div>')
    # zone 2: the one next thing
    nxt = ('<a href="M2World.dc.html" class="m wide" style="margin-top:8px;height:96px;justify-content:flex-start;gap:12px;padding:0 10px 0 12px;box-sizing:border-box">'
           f'<img src="{SYNTH}" alt="" style="width:66px;height:66px;border-radius:9px;object-fit:cover;flex:none">'
           '<div style="flex:1;text-align:left;min-width:0"><div class="lbl">next lesson</div><div style="font-size:22px;font-weight:400;letter-spacing:-.02em;margin-top:2px">bass and poli</div>'
           '<div class="val" style="color:#C42A70;font-weight:600;margin-top:3px">adds bass to your track</div></div>'
           '<span class="cap go" style="width:66px;flex:none">' + I["play"] + '</span></a>')
    # zone 3: world dial + daily meter + hear
    dial = ('<div class="m wide" style="grid-column:span 2;height:176px;flex-direction:column;justify-content:flex-start;padding-top:14px;box-sizing:border-box;gap:0">'
            + mode_dial(2, 66) +
            '<span class="ml" style="color:var(--ink)">producer · 1 of 91</span></div>')
    goal = ('<div class="m wide" style="height:176px;flex-direction:column;justify-content:flex-start;padding-top:14px;box-sizing:border-box">'
            f'{meter(8, 3, True, 6)}<span class="ml" style="color:var(--ink);bottom:20px">today</span><span class="ml">20 / 50 xp</span></div>')
    hear = ('<a href="M2Studio.dc.html" class="m wide" aria-label="Hear your track" style="height:176px;flex-direction:column">'
            f'<span class="cap" style="width:60%;margin-top:-18px">{I["hear"]}</span><span class="ml" style="color:var(--ink);bottom:20px">hear</span><span class="ml">your track</span></a>')
    mid = f'<div class="g" style="margin-top:8px">{dial}{goal}{hear}</div>'
    practice = ('<div style="display:flex;justify-content:space-between;margin:12px 4px 7px"><span class="lbl">practice</span><span class="lbl">2 min each</span></div>'
                '<div class="g">' + pad("review · 3", N["lilac"], "Review, 3 due", 54) + pad("ear gym", h=54) + pad("beat", h=54) + pad("quiz", h=54) + '</div>')
    inner = M.status() + scr + nxt + mid + practice
    return f'<div class="dev {mode} face" style="width:390px;height:844px;position:relative;overflow:hidden"><div style="padding:10px 12px 0">{inner}</div>{M.nav("learn", N["prod"])}</div>'


if __name__ == "__main__":
    write("M3Sheet_light.dc.html", board("light", "Components · light", sheet("light"), 1600, 3000))
    write("M3Sheet_dark.dc.html", board("dark", "Components · dark", sheet("dark"), 1600, 3000))
    write("M3TodayL.dc.html", board("light", "Today · light", today("light"), 390, 844))
    write("M3TodayD.dc.html", board("dark", "Today · dark", today("dark"), 390, 844))
