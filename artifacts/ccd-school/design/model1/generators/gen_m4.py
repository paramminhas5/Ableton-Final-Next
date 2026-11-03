#!/usr/bin/env python3
"""CCD School · Model 1 refined. Printed panel, recessed screen, grain, crisp LEDs,
magenta = go/producer only, one grid, black = you are here, knurl on big knobs only,
duotone photos, model name, one icon set, five type sizes."""
import os, math, random
import gen_m3 as m3
import gen_m2 as M
import gen_mix as X
import gen_field as F

OUT = F.OUT
CAT, SYNTH = X.CAT, X.SYNTH
N = {"fund": "#4FE3B6", "dj": "#7D96FF", "prod": "#FF4F9A", "lilac": "#B89CFF", "white": "#F4F3F0", "red": "#FF4A5A"}
CAPC = {"fund": "#36C9A0", "dj": "#5B76F2", "prod": "#E8418A", "lilac": "#9A7BF0", "grey": "#9C9EA4", "navy": "#2B355E"}

GL = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .09 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")"
GD = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .05 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")"

CSS = r"""
body{margin:0}
.dev{font-family:"Outfit",system-ui,sans-serif;-webkit-font-smoothing:antialiased;color:var(--ink);letter-spacing:.005em}
.light{--deck:#DCDBD6;--deck2:#D2D1CC;--mod:#F4F3EF;--mod2:#EAE9E4;--modhi:rgba(255,255,255,.95);--modlo:rgba(0,0,0,.07);--cap1:#FEFDFB;--cap2:#EAE8E3;--capside:#C9C7C0;--ink:#18181A;--sub:#5C5A54;--print:#77756F;--well:#E0DFDA;--sh:rgba(70,62,50,.18);--k1:#F6F5F1;--k2:#D7D5CF;--ledoff:#C9C7C0;--padoff:#E6E5E0;--slot:#2A2A2C;--tick:rgba(0,0,0,.3);--recess:#CBCAC4;--tag:#ADABA5;--line:rgba(0,0,0,.08);--grain:GL}
.dark{--deck:#1D1E20;--deck2:#18191B;--mod:#28292C;--mod2:#222326;--modhi:rgba(255,255,255,.06);--modlo:rgba(0,0,0,.5);--cap1:#3D3E43;--cap2:#2B2C30;--capside:#0B0B0C;--ink:#EEEEEB;--sub:#A6A7AC;--print:#8B8C91;--well:#151618;--sh:rgba(0,0,0,.55);--k1:#47484D;--k2:#2B2C30;--ledoff:#38393D;--padoff:#2F3034;--slot:#0A0A0B;--tick:rgba(255,255,255,.26);--recess:#121314;--tag:#4A4B50;--line:rgba(255,255,255,.08);--grain:GD}
.face{background-image:var(--grain),linear-gradient(180deg,var(--deck),var(--deck2));position:relative}
.t36{font-size:36px;font-weight:300;letter-spacing:-.035em;line-height:1}
.t22{font-size:22px;font-weight:400;letter-spacing:-.02em;line-height:1.1}
.t15{font-size:15px;font-weight:500;line-height:1.3}
.t12{font-size:12px;font-weight:500;line-height:1.3}
.t11{font-size:11px;font-weight:500;line-height:1.3;color:var(--sub)}
.lbl{font-size:11px;font-weight:500;color:var(--sub)}
.val{font-size:11px;font-weight:500;color:var(--sub);font-variant-numeric:tabular-nums}
.ss{color:#9A9AA0;font-size:11px;font-weight:500}
.big{font-weight:300;letter-spacing:-.035em;line-height:1}
.tag{display:inline-flex;align-items:center;border:1px solid var(--tag);border-radius:5px;padding:0 6px;height:18px;font-size:11px;font-weight:500;color:var(--sub)}
.g{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}
.m{position:relative;border-radius:12px;background-image:var(--grain),linear-gradient(180deg,var(--mod),var(--mod2));box-shadow:inset 0 1px 0 var(--modhi),inset 0 -1px 0 var(--modlo),0 1px 1px var(--sh),0 4px 7px -3px var(--sh);display:flex;align-items:center;justify-content:center;aspect-ratio:1;border:0;padding:0;font:inherit;color:var(--ink);text-decoration:none;box-sizing:border-box}
.m.wide{aspect-ratio:auto}
.m.is-dim{opacity:.42}
.cap{width:62%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 50% 28%,var(--cap1),var(--cap2) 78%);box-shadow:0 2px 0 var(--capside),0 5px 8px var(--sh),inset 0 1px 0 var(--modhi);display:flex;align-items:center;justify-content:center;color:var(--ink);transition:transform 70ms,box-shadow 70ms}
.m:active .cap{transform:translateY(2px);box-shadow:0 0 0 var(--capside),0 2px 3px var(--sh)}
.cap.blk{background:radial-gradient(circle at 50% 30%,#323234,#0C0C0D 72%);color:#F2F2F0;box-shadow:0 2px 0 #000,0 5px 8px var(--sh),inset 0 1px 0 rgba(255,255,255,.12)}
.cap.go{background:radial-gradient(circle at 45% 28%,#FF8DBD,#E8418A 60%,#C82D73);color:#fff;box-shadow:0 2px 0 #9C1F57,0 5px 12px rgba(232,65,138,.32),inset 0 1px 0 rgba(255,255,255,.45)}
.cap.pill{aspect-ratio:auto;border-radius:999px}
.leg{font-weight:200;line-height:1;font-variant-numeric:tabular-nums}
.ml{position:absolute;left:0;right:0;bottom:7px;text-align:center;font-size:11px;font-weight:500;color:var(--sub);line-height:1}
.dot{position:absolute;top:8px;left:50%;margin-left:-3px;width:6px;height:6px;border-radius:3px;background:var(--ledoff);box-shadow:inset 0 1px 1px rgba(0,0,0,.25)}
.dot.on{background:radial-gradient(circle at 50% 45%,#fff 0 24%,var(--c) 62%);box-shadow:0 0 4px var(--c)}
.dash{width:18px;height:3px;border-radius:2px;background:var(--ledoff)}
.dash.on{background:linear-gradient(180deg,var(--c),#fff 50%,var(--c));box-shadow:0 0 4px var(--c)}
.dark .dot.on,.dark .dash.on{box-shadow:0 0 3px var(--c)}
.led{display:none}
/* printed panel lettering */
.silk{display:flex;align-items:flex-start;gap:7px;font-size:11px;font-weight:500;color:var(--print);letter-spacing:.05em;margin:10px 2px 6px;line-height:14px}
.silk i{flex:1;height:5px;border-top:1px solid var(--print);opacity:.55;margin-top:7px}
.silk i.l{flex:none;width:8px;border-left:1px solid var(--print)}
.silk i.r{border-right:1px solid var(--print)}
.silk i.rs{flex:none;width:8px;border-right:1px solid var(--print)}
/* recessed flush screen */
.scr{border-radius:18px;padding:5px;background:var(--recess);box-shadow:inset 0 2px 5px var(--sh),inset 0 -1px 0 var(--modhi);clip-path:polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,0 100%)}
.scrf{background:#050506;color:#F3F2EF;border-radius:13px;position:relative;overflow:hidden;box-sizing:border-box;box-shadow:0 0 0 1.5px #000,inset 0 0 0 1px rgba(255,255,255,.05);clip-path:polygon(0 0,calc(100% - 17px) 0,100% 17px,100% 100%,0 100%)}
.scrf:after{content:"";position:absolute;inset:0;background:linear-gradient(115deg,rgba(255,255,255,.08),rgba(255,255,255,.015) 30%,rgba(255,255,255,0) 31%);pointer-events:none}
/* knobs: smooth cap for small, knurl for big */
.kn{width:32px;height:32px;border-radius:50%;background:radial-gradient(circle at 38% 28%,rgba(255,255,255,.45),rgba(255,255,255,0) 55%),var(--c);box-shadow:0 3px 5px var(--sh),0 1px 0 var(--capside),inset 0 -2px 3px rgba(0,0,0,.22);position:relative}
.kn b{position:absolute;left:50%;top:3px;width:2px;height:9px;margin-left:-1px;border-radius:1px;background:#fff;transform-origin:1px 13px}
.well{border-radius:50%;background:var(--well);box-shadow:inset 0 2px 4px var(--sh);display:flex;align-items:center;justify-content:center}
.knob{width:74%;aspect-ratio:1;border-radius:50%;background:repeating-conic-gradient(var(--k1) 0 4deg,var(--k2) 4deg 8deg);box-shadow:0 3px 6px var(--sh),0 1px 0 var(--capside);display:flex;align-items:center;justify-content:center}
.knob>i{display:block;width:72%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 38% 28%,rgba(255,255,255,.5),rgba(255,255,255,0) 55%),var(--c);box-shadow:inset 0 -2px 3px rgba(0,0,0,.28)}
/* pads */
.pd{display:flex;align-items:center;justify-content:center;flex-direction:column;gap:2px;border-radius:9px;background-image:var(--grain),linear-gradient(180deg,var(--padoff),var(--padoff));box-shadow:inset 0 1px 0 rgba(255,255,255,.3),0 1px 0 var(--capside);text-decoration:none;color:var(--ink);font-size:12px;font-weight:500}
.pd.lit{background:radial-gradient(circle at 50% 42%,rgba(255,255,255,.75) 0,rgba(255,255,255,.15) 38%,rgba(255,255,255,0) 70%),var(--c);color:#141416;box-shadow:0 0 8px var(--c),inset 0 1px 0 rgba(255,255,255,.5)}
.dark .pd.lit{box-shadow:0 0 5px var(--c),inset 0 1px 0 rgba(255,255,255,.4)}
.pd.dim{opacity:.45}
.jog{border-radius:50%;background:repeating-conic-gradient(var(--k1) 0 2.5deg,var(--k2) 2.5deg 5deg);box-shadow:0 5px 12px var(--sh),0 2px 0 var(--capside);display:flex;align-items:center;justify-content:center;position:relative}
.plat{border-radius:50%;background:repeating-radial-gradient(circle,#141416 0 2px,#1C1C1F 2px 3px);display:flex;align-items:center;justify-content:center;position:relative;box-shadow:inset 0 0 0 2px #000}
svg.i{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
svg.s{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
""".replace("GL", GL).replace("GD", GD)

SHEET_EXTRA = r"""
.panel{border-radius:22px;background-image:var(--grain),linear-gradient(180deg,var(--deck),var(--deck2));box-shadow:0 0 0 1px var(--line),inset 0 1px 0 var(--modhi);padding:22px 24px 26px}
.sec{font-size:22px;font-weight:400;letter-spacing:-.02em;margin:0 0 16px}
.cell{display:flex;flex-direction:column;align-items:center;gap:10px}
.cap2{font-size:12px;font-weight:600;text-align:center;line-height:1.3}
.cap2 span{display:block;font-weight:500;color:var(--sub);font-size:11px}
.rb{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:34px;min-width:64px;padding:0 10px;border-radius:7px;background:linear-gradient(180deg,var(--cap1),var(--cap2));box-shadow:0 2px 0 var(--capside),0 4px 8px var(--sh),inset 0 1px 0 var(--modhi);font-size:11.5px;font-weight:600;color:var(--ink);box-sizing:border-box}
.rb i{width:6px;height:6px;border-radius:3px;background:var(--ledoff)}
.rb i.on{background:radial-gradient(circle,#fff 0 24%,var(--c) 62%);box-shadow:0 0 4px var(--c)}
.wheel{width:30px;height:110px;border-radius:8px;background:repeating-linear-gradient(180deg,var(--k1) 0 3px,var(--k2) 3px 6px);box-shadow:inset 0 0 0 1px rgba(0,0,0,.15),0 3px 6px var(--sh)}
.slot{border-radius:12px;background:var(--well);box-shadow:inset 0 2px 5px var(--sh);display:flex;align-items:center;justify-content:center}
"""

FONTS = '<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600;700&amp;display=swap" rel="stylesheet">'

# one icon set: 24 grid, 1.6 stroke, round ends
def ic(d, cls="i"): return f'<svg class="{cls}" viewBox="0 0 24 24" aria-hidden="true">{d}</svg>'
P = {
 "learn": '<path d="M4 7h10M4 12h16M4 17h7"/>',
 "practice": '<path d="M9 3.5h6l3.5 17h-13z"/><path d="m12 15 4.5-8"/>',
 "studio": '<path d="M6 4v16M12 4v16M18 4v16"/><path d="M4.5 14h3M10.5 8h3M16.5 11h3"/>',
 "library": '<path d="M5 4v16M10 4v16M14.5 5l4.5 15"/>',
 "hear": '<path d="M4 9.5v5h3.5L12 18V6L7.5 9.5z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
 "plus": '<path d="M12 5v14M5 12h14"/>', "back": '<path d="m14.5 6-6 6 6 6"/>', "close": '<path d="M6 6l12 12M18 6 6 18"/>',
 "out": '<path d="M12 15V4M8 8l4-4 4 4M5 14v6h14v-6"/>', "check": '<path d="m5 12.5 4.5 4.5L19 7"/>',
 "lock": '<rect x="6" y="11" width="12" height="9" rx="2"/><path d="M9 11V8.5a3 3 0 0 1 6 0V11"/>',
 "knob": '<circle cx="12" cy="12" r="7.5"/><path d="M12 12l3.5-4.5"/>',
 "keys": '<rect x="3.5" y="6" width="17" height="12" rx="2"/><path d="M8 6v12M12 6v12M16 6v12"/>',
 "pads": '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
 "fader": '<path d="M12 3v18"/><rect x="8.5" y="9" width="7" height="5" rx="1.5"/>',
 "jog": '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2.5"/>',
}
I = {k: ic(v) for k, v in P.items()}
I.update({
 "play": '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>',
 "stop": '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>',
 "rec": '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="12" cy="12" r="6" fill="#FF4A5A"/></svg>',
 "shift": '<span style="font-size:13px;font-weight:500">shift</span>',
 "cue": '<span style="font-size:12px;font-weight:600;letter-spacing:.04em">cue</span>',
 "sync": '<span style="font-size:12px;font-weight:600;letter-spacing:.04em">sync</span>',
})
SI = {k: ic(v, "s") for k, v in P.items()}

DUO = ('<svg width="0" height="0" style="position:absolute" aria-hidden="true">'
       + "".join(f'<filter id="duo-{k}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 1 0"/>'
                 f'<feComponentTransfer><feFuncR type="table" tableValues=".05 {r}"/><feFuncG type="table" tableValues=".05 {g}"/><feFuncB type="table" tableValues=".06 {b}"/></feComponentTransfer></filter>'
                 for k, (r, g, b) in {"prod": (1, .36, .64), "dj": (.55, .64, 1), "fund": (.36, .92, .76)}.items())
       + '</svg>')

# ── primitives ────────────────────────────────────────────────────────────

def silk(label, right=None):
    if right:
        return f'<div class="silk"><i class="l"></i><span>{label}</span><i></i><span>{right}</span><i class="rs"></i></div>'
    return f'<div class="silk"><i class="l"></i><span>{label}</span><i class="r"></i></div>'


def key(inner, label=None, cap="", led=None, href="#", aria="", style=""):
    dot = f'<span class="dot on" style="--c:{led}"></span>' if led else ""
    lab = f'<span class="ml">{label}</span>' if label else ""
    mt = "margin-top:-9px;" if label else ""
    return f'<a href="{href}" class="m" aria-label="{aria or (label or "")}" style="{style}">{dot}<span class="cap {cap}" style="{mt}">{inner}</span>{lab}</a>'


def scale_svg(size=60, n=11):
    c = size / 2; r0, r1 = size / 2 - 7, size / 2 - 2
    t = ""
    for i in range(n):
        a = math.radians(135 + i * 270 / (n - 1))
        x0, y0, x1, y1 = c + r0 * math.cos(a), c + r0 * math.sin(a), c + r1 * math.cos(a), c + r1 * math.sin(a)
        t += f'<path d="M{x0:.1f} {y0:.1f}L{x1:.1f} {y1:.1f}" stroke="var(--print)" stroke-width="{1.4 if i in (0, n-1, n//2) else 1}" opacity="{.9 if i in (0, n-1, n//2) else .6}" stroke-linecap="round"/>'
    return f'<svg width="{size}" height="{size}" viewBox="0 0 {size} {size}" style="position:absolute;inset:0" aria-hidden="true">{t}</svg>'


def enc(cap, led, label, value, frac=.5, aria=""):
    rot = -135 + 270 * frac
    return (f'<div class="m" role="img" aria-label="{aria or label + " " + value}">'
            f'<span class="dash on" style="--c:{led};position:absolute;top:8px;left:50%;margin-left:-9px"></span>'
            f'<div style="position:relative;width:50px;height:50px;margin-top:-14px;display:flex;align-items:center;justify-content:center">{scale_svg(50)}'
            f'<div class="kn" style="--c:{cap}"><b style="transform:rotate({rot:.0f}deg)"></b></div></div>'
            f'<span class="ml" style="bottom:18px;color:var(--ink)">{label}</span><span class="ml" style="bottom:6px">{value}</span></div>')


def fader(name, led, frac, h=140, aria=None):
    th = h - 60
    ticks = "".join(f'<span style="position:absolute;left:0;right:0;top:{4 + i*th/8:.0f}px;display:flex;justify-content:space-between"><i style="width:{8 if i in (0,8) else 6}px;height:1px;background:var(--tick)"></i><i style="width:{8 if i in (0,8) else 6}px;height:1px;background:var(--tick)"></i></span>' for i in range(9))
    zero = f'<span style="position:absolute;right:-12px;top:{4 + 2*th/8 - 6:.0f}px;font-size:9px;color:var(--print)">0</span>'
    top = (1 - frac) * th - 7
    return (f'<div class="m wide" role="img" aria-label="{aria or name + " level " + str(int(frac*100)) + "%"}" style="height:{h}px;flex-direction:column;justify-content:flex-start;padding-top:10px">'
            f'<span class="dash on" style="--c:{led}"></span>'
            f'<div style="position:relative;width:46px;height:{th+8}px;margin-top:8px">{ticks}{zero}'
            f'<div style="position:absolute;left:50%;top:2px;bottom:2px;width:4px;margin-left:-2px;border-radius:2px;background:var(--slot)"></div>'
            f'<div style="position:absolute;left:50%;top:{top+4:.0f}px;width:34px;height:20px;margin-left:-17px;border-radius:5px;background:linear-gradient(180deg,var(--cap1),var(--cap2));box-shadow:0 3px 5px var(--sh),0 1px 0 var(--capside),inset 0 1px 0 var(--modhi)"><i style="position:absolute;left:6px;right:6px;top:9px;height:2px;background:var(--ink);border-radius:1px"></i></div></div>'
            f'<span class="ml" style="color:var(--ink)">{name}</span></div>')


def pad(label, lit=None, aria="", h=48, style="", cls=""):
    return f'<a href="#" class="pd {cls}{" lit" if lit else ""}" aria-label="{aria or label}" style="height:{h}px;{"--c:"+lit+";" if lit else ""}{style}">{label}</a>'


def lanes(w, rows, sel=None, solo=None, head=0.0):
    """rows: (name, color, segs, kind) kind full|dash|new|ghost"""
    lh, gap, nameW, top = 10, 12, 54, 12
    h = top + len(rows) * (lh + gap)
    x0, x1 = nameW, w
    s = [f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" aria-hidden="true" style="display:block">']
    for i in range(17):
        x = x0 + (x1 - x0) * i / 16
        s.append(f'<path d="M{x:.1f} 0v{6 if i%4==0 else 3}" stroke="#6E6E73" stroke-width="1"/>')
    for i, (name, col, segs, kind) in enumerate(rows):
        y = top + i * (lh + gap)
        dim = (solo is not None and solo != i) or kind == "ghost"
        tc = col if (sel == i or kind in ("new", "dash")) else ("#55555A" if dim else "#A6A6AC")
        s.append(f'<text x="0" y="{y+9}" font-family="Outfit" font-size="12" font-weight="500" fill="{tc}">{name}</text>')
        s.append(f'<rect x="{x0}" y="{y}" width="{x1-x0}" height="{lh}" rx="2" fill="#141416"/>')
        for a, b in segs:
            xa, xb = x0 + (x1 - x0) * a + 1, x0 + (x1 - x0) * b - 1
            if kind in ("dash", "ghost"):
                s.append(f'<rect x="{xa:.1f}" y="{y+.5}" width="{xb-xa:.1f}" height="{lh-1}" rx="2" fill="none" stroke="{col}" stroke-width="1" stroke-dasharray="3 3" opacity="{.35 if kind=="ghost" else 1}"/>')
            else:
                op = .28 if dim else (1 if (sel is None or sel == i or kind == "new") else .55)
                s.append(f'<rect x="{xa:.1f}" y="{y}" width="{xb-xa:.1f}" height="{lh}" rx="2" fill="{col}" opacity="{op}"/>')
        if solo == i:
            s.append(f'<rect x="{x1-34}" y="{y-3}" width="34" height="16" rx="4" fill="{col}"/><text x="{x1-17}" y="{y+9}" text-anchor="middle" font-family="Outfit" font-size="10" font-weight="600" fill="#141416">solo</text>')
    px = x0 + (x1 - x0) * head
    s.append(f'<path d="M{px:.1f} 0V{h}" stroke="#F3F2EF" stroke-width="1.2"/><rect x="{px-3.5:.1f}" y="0" width="7" height="5" rx="1" fill="#F3F2EF"/>')
    s.append("</svg>")
    return "".join(s)

Q, E, S16 = X.Q, X.E, X.S16


def header(right=""):
    return ('<div style="display:flex;align-items:center;justify-content:space-between;height:40px;padding:0 2px">'
            f'<div style="display:flex;align-items:center;gap:8px"><span style="width:26px;height:26px;border-radius:50%;background:#0B0B0C;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 0 var(--modhi)"><img src="{CAT}" alt="" style="width:21px"></span>'
            '<span class="t15" style="font-weight:600;letter-spacing:-.01em">ccd school</span><span class="tag">model 1</span></div>'
            f'{right}</div>')


def xp(n="340"):
    return f'<span style="font-size:15px;font-weight:300;font-variant-numeric:tabular-nums">{n}<span class="lbl" style="margin-left:4px">xp</span></span>'


def nav(active):
    items = [("learn", "M4TodayL.dc.html"), ("practice", "#"), ("studio", "M4Studio.dc.html"), ("library", "#")]
    out = ""
    for n, h in items:
        on = n == active
        out += (f'<a href="{h}" class="m" aria-label="{n}"{" aria-current=page" if on else ""}><span class="dot{" on" if on else ""}" style="--c:#F4F3F0"></span>'
                f'<span class="cap{" blk" if on else ""}" style="width:54%;margin-top:-8px">{I[n]}</span><span class="ml" style="{"color:var(--ink)" if on else ""}">{n}</span></a>')
    return f'<nav aria-label="Main" class="g" style="position:absolute;left:16px;right:16px;bottom:22px">{out}</nav>'


def phone(mode, inner, extra=""):
    return f'<div class="dev {mode} face" style="width:390px;height:844px;overflow:hidden">{DUO}<div style="padding:10px 16px 0">{inner}</div>{extra}</div>'


def week(lit=4):
    days = "mtwtfss"
    cells = "".join(f'<div style="display:flex;flex-direction:column;align-items:center;gap:5px"><span style="width:9px;height:9px;border-radius:5px;background:{"var(--ink)" if i < lit else "var(--ledoff)"};{"box-shadow:0 0 0 2px var(--deck),0 0 0 3px var(--ink)" if i == lit - 1 else ""}"></span><span class="val">{d}</span></div>' for i, d in enumerate(days))
    return f'<div style="display:flex;justify-content:space-between;padding:0 10px">{cells}</div>'


def hw(*names):
    return '<span style="display:inline-flex;align-items:center;gap:6px;color:var(--sub)">' + "".join(f'<span style="display:inline-flex;align-items:center;gap:3px">{SI[n]}<span class="val">{n}</span></span>' for n in names) + '</span>'

# ── 1 · TODAY ─────────────────────────────────────────────────────────────
def today(mode, first=False):
    if first:
        rows = [("kick", N["fund"], [(0, 1)], "dash"), ("hats", "#6E6E73", [(0, 1)], "ghost"), ("bass", "#6E6E73", [(0, 1)], "ghost")]
        scr_in = (f'<img src="{CAT}" alt="" style="position:absolute;right:14px;top:12px;width:96px">'
                  '<div class="ss">your track</div><div class="t22" style="margin-top:6px;max-width:200px">your first lesson adds a kick</div>'
                  '<div class="ss" style="margin-top:6px">every lesson adds a layer</div>'
                  f'<div style="margin-top:14px">{lanes(338, rows)}</div>')
        nx = ("fund", "basics 01", "what is sound", "adds a kick", ("knob", "pads"))
        dial_sel, dial_lab, goal, review = 0, "basics · 0 of 40", 0, None
        wk = 0
    else:
        rows = [("kick", N["fund"], Q, "full"), ("hats", N["fund"], E, "full"), ("bass", N["prod"], [(0, 1)], "dash"), ("chords", N["lilac"], Q, "full")]
        scr_in = (f'<img src="{CAT}" alt="" style="position:absolute;right:14px;top:12px;width:62px">'
                  '<div class="ss">your track</div><div class="t36" style="margin-top:6px">3 layers</div>'
                  '<div class="ss" style="margin-top:6px">120 bpm · tap a lane to solo it</div>'
                  f'<div style="margin-top:14px">{lanes(338, rows)}</div>')
        nx = ("prod", "producer 02", "bass and poli", "adds bass", ("knob", "keys"))
        dial_sel, dial_lab, goal, review = 2, "producer · 1 of 91", 3, N["lilac"]
        wk = 4
    scr = f'<div class="scr" style="margin-top:4px"><div class="scrf" style="padding:14px 16px 16px;height:196px">{scr_in}</div></div>'
    w, sub, title, adds, tools = nx
    nxt = (f'<a href="M4World.dc.html" class="m wide" style="margin-top:8px;height:86px;justify-content:flex-start;gap:12px;padding:0 10px 0 10px">'
           f'<img src="{SYNTH}" alt="" style="width:64px;height:64px;border-radius:9px;object-fit:cover;flex:none;filter:url(#duo-{w})">'
           f'<div style="flex:1;text-align:left;min-width:0"><div class="t11">next · {sub} · {adds}</div><div class="t22" style="margin-top:3px">{title}</div>'
           f'<div style="margin-top:5px">{hw(*tools)}</div></div>'
           f'<span class="cap go" style="width:58px;flex:none">{I["play"]}</span></a>')
    dial = (f'<div class="m wide" style="grid-column:span 2;height:172px;flex-direction:column;justify-content:flex-start;padding-top:10px">'
            f'{m3.mode_dial(dial_sel, 64)}<span class="ml" style="color:var(--ink)">{dial_lab}</span></div>')
    gauge = (f'<div class="m wide" style="height:172px;flex-direction:column;justify-content:flex-start;padding-top:12px">'
             f'{m3.meter(8, goal, True, 6)}<span class="ml" style="color:var(--ink);bottom:19px">today</span><span class="ml">{goal*50//8 if goal else 0} / 50 xp</span></div>')
    hear = (f'<a href="M4Studio.dc.html" class="m wide" aria-label="Hear your track" style="height:172px">'
            f'<span class="cap" style="width:62%;margin-top:-18px">{I["hear"]}</span><span class="ml" style="color:var(--ink);bottom:19px">hear</span><span class="ml">your track</span></a>')
    mid = silk("worlds", "today") + f'<div class="g">{dial}{gauge}{hear}</div>'
    pr = (silk("practice", "2 min each") + '<div class="g">'
          + pad("review · 3" if review else "review", review, "Review") + pad("ear gym") + pad("beat") + pad("quiz") + '</div>')
    wkrow = silk("this week", f"{wk} days" if wk else "start today") + week(wk)
    right = xp("0" if first else "340")
    return phone(mode, header(right) + scr + nxt + mid + pr + wkrow, nav("learn"))

# ── 2 · WORLD ─────────────────────────────────────────────────────────────
def world():
    head = ('<div style="display:flex;align-items:center;gap:10px;height:44px">'
            f'<a href="M4TodayL.dc.html" class="m" aria-label="Back" style="width:44px;aspect-ratio:1">{I["back"]}</a>'
            '<div style="flex:1"><div class="t22">producer</div><div class="t11">first contact · 1 of 91</div></div>'
            f'<span class="dash on" style="--c:{N["prod"]}"></span></div>')
    scr = (f'<div class="scr" style="margin-top:8px"><div class="scrf" style="height:178px;display:flex">'
           f'<img src="{SYNTH}" alt="A hand turning a synth knob" style="width:142px;height:100%;object-fit:cover;filter:url(#duo-prod)">'
           '<div style="flex:1;padding:14px 16px;display:flex;flex-direction:column;justify-content:space-between">'
           '<div style="display:flex;justify-content:space-between"><span class="big" style="font-size:36px;font-weight:200">02</span><span class="ss">7 min</span></div>'
           '<div><div class="t22">bass and poli</div><div class="ss" style="margin-top:5px;color:#F3F2EF">adds bass to your track</div></div>'
           f'<div class="ss" style="display:flex;gap:10px"><span style="display:inline-flex;gap:3px;align-items:center">{SI["knob"]}knob</span><span style="display:inline-flex;gap:3px;align-items:center">{SI["keys"]}keys</span></div></div></div></div>')
    steps = ""
    for n in range(1, 17):
        if n == 1:
            steps += key(f'<span class="leg" style="font-size:24px">{n}</span>', led=N["prod"], aria="Step 1, done")
        elif n == 2:
            steps += key(f'<span class="leg" style="font-size:24px">{n}</span>', cap="blk", href="M4Lesson.dc.html", aria="Step 2, next")
        elif n <= 8:
            steps += key(f'<span class="leg" style="font-size:24px;color:var(--sub)">{n}</span>', aria=f"Step {n}")
        else:
            steps += f'<div class="m is-dim" aria-label="Step {n}, locked"><span class="leg" style="font-size:22px;color:var(--sub)">{n}</span></div>'
    body = head + scr + silk("first contact", "16 steps") + f'<div class="g">{steps}</div>'
    bottom = ('<div class="g" style="position:absolute;left:16px;right:16px;bottom:22px">'
              + key(I["hear"], "preview", aria="Preview what it adds")
              + f'<a href="M4Lesson.dc.html" class="m wide" aria-label="Start step 2" style="grid-column:span 3"><span class="cap go pill" style="width:90%;height:62%;gap:8px;font-size:16px;font-weight:500">{I["play"]}start step 02</span></a></div>')
    return phone("light", body, bottom)

# ── 3 · LESSON ────────────────────────────────────────────────────────────
def lesson():
    cx = 40 + 0.42 * 270
    curve = (f'<svg width="330" height="110" viewBox="0 0 330 110" aria-hidden="true" style="display:block">'
             + "".join(f'<path d="M{40+i*67.5:.0f} 4V100" stroke="#1C1C1F"/>' for i in range(5))
             + '<path d="M40 100H310" stroke="#2A2A2D"/>'
             f'<path d="M40 48H{cx-34:.0f}C{cx-12:.0f} 48 {cx-10:.0f} 18 {cx:.0f} 18S{cx+18:.0f} 56 {cx+40:.0f} 80S{cx+80:.0f} 98 310 100V100H40z" fill="rgba(255,79,154,.10)"/>'
             f'<path d="M40 48H{cx-34:.0f}C{cx-12:.0f} 48 {cx-10:.0f} 18 {cx:.0f} 18S{cx+18:.0f} 56 {cx+40:.0f} 80S{cx+80:.0f} 98 310 100" fill="none" stroke="#FF4F9A" stroke-width="2" stroke-linecap="round"/>'
             f'<path d="M{cx:.0f} 4V100" stroke="#F3F2EF" stroke-width="1" stroke-dasharray="2 3"/>'
             '<text x="40" y="110" font-family="Outfit" font-size="9" fill="#6E6E73">20 hz</text><text x="310" y="110" text-anchor="end" font-family="Outfit" font-size="9" fill="#6E6E73">20 khz</text></svg>')
    pips = "".join(f'<span style="flex:1;height:3px;border-radius:2px;background:{"#FF4F9A" if i<3 else ("var(--ink)" if i==3 else "var(--ledoff)")}"></span>' for i in range(7))
    hearts = "".join(f'<span style="width:7px;height:7px;border-radius:4px;background:radial-gradient(circle,#fff 0 20%,{N["red"]} 62%);box-shadow:0 0 3px {N["red"]}"></span>' for _ in range(5))
    head = (f'<div style="display:flex;align-items:center;gap:12px;height:40px"><a href="M4World.dc.html" aria-label="Close" style="color:var(--ink);display:flex">{I["close"]}</a>'
            f'<div style="flex:1;display:flex;gap:4px">{pips}</div><span style="display:flex;gap:3px" aria-label="5 hearts">{hearts}</span></div>')
    scr = (f'<div class="scr" style="margin-top:6px"><div class="scrf" style="padding:14px 14px 10px;height:236px">'
           '<div style="display:flex;justify-content:space-between;align-items:flex-start;padding:0 2px"><div><div class="ss">try it · 4 of 7</div>'
           '<div class="t15" style="font-weight:400;font-size:18px;margin-top:5px;max-width:220px;line-height:1.3">turn cutoff down until the bass sounds rounder</div></div>'
           '<div style="text-align:right"><div class="ss">cutoff</div><div class="big" style="font-size:30px;margin-top:3px;color:#FF6FAE">640<span style="font-size:13px"> hz</span></div></div></div>'
           f'<div style="margin-top:10px">{curve}</div></div></div>')
    encs = ('<div class="g" style="margin-top:8px">' + enc(CAPC["prod"], N["prod"], "cutoff", "640 hz", .42) + enc(CAPC["grey"], N["prod"], "resonance", "35%", .35)
            + key(I["shift"], "what is this", aria="What is this knob") + key(I["hear"], "a / b", aria="Compare before and after") + '</div>')
    whites = ['c', 'd', 'e', 'f', 'g', 'a', 'b', 'c']
    wk = "".join(f'<a href="#" class="m wide" aria-label="Note {n}" style="height:156px;align-items:flex-end;padding-bottom:9px"><span class="cap pill" style="width:64%;height:116px;align-items:flex-end;padding-bottom:6px;box-sizing:border-box;{"box-shadow:0 0 0 2px #FF4F9A,0 2px 0 var(--capside);" if i==5 else ""}"><span class="val">{n}</span></span></a>' for i, n in enumerate(whites))
    col = (358 - 7 * 4) / 8
    sharps = "".join(f'<a href="#" aria-label="Sharp" style="position:absolute;left:{(i+1)*(col+4)-2-16:.1f}px;top:-18px;width:32px;height:32px;border-radius:50%;background:radial-gradient(circle at 50% 30%,#323234,#0C0C0D 72%);box-shadow:0 2px 0 #000,0 4px 7px var(--sh);z-index:2"></a>' for i in (0, 1, 3, 4, 5))
    keys = silk("keys", "play the bass line") + f'<div style="position:relative;margin-top:22px"><div style="display:grid;grid-template-columns:repeat(8,1fr);gap:4px">{wk}</div>{sharps}</div>'
    bottom = ('<div class="g" style="position:absolute;left:16px;right:16px;bottom:22px">' + key(I["shift"], "hint", aria="Show a hint")
              + '<a href="#" class="m wide" aria-label="Check" style="grid-column:span 3"><span class="cap go pill" style="width:90%;height:62%;font-size:16px;font-weight:500">sounds right</span></a></div>')
    return phone("dark", head + scr + encs + keys, bottom)

# ── 4 · ADD TO MY TRACK ───────────────────────────────────────────────────
def add():
    rows = [("kick", N["fund"], Q, "full"), ("hats", N["fund"], E, "full"), ("bass", N["prod"], S16, "new"), ("chords", N["lilac"], Q, "full")]
    head = ('<div style="display:flex;align-items:center;justify-content:space-between;height:44px">'
            f'<a href="M4TodayL.dc.html" class="m" aria-label="Close" style="width:44px;aspect-ratio:1">{I["close"]}</a>'
            '<span class="t11">step 02 done</span>' + m3.digits("50", 20, N["prod"], 7) + '</div>')
    scr = (f'<div class="scr" style="margin-top:8px"><div class="scrf" style="padding:16px;height:250px;display:flex;flex-direction:column;justify-content:space-between">'
           f'<img src="{CAT}" alt="" style="position:absolute;right:16px;top:14px;width:78px">'
           '<div><div class="ss">you learned</div><div class="t36" style="margin-top:6px;max-width:220px">bass and poli</div></div>'
           f'<div>{lanes(338, rows, sel=2)}<div class="ss" style="margin-top:10px">new layer: bass. it joins your track when you add it.</div></div></div></div>')
    shape = (silk("shape it first") + '<div class="g">' + enc(CAPC["prod"], N["prod"], "cutoff", "40%", .4) + enc(CAPC["grey"], N["prod"], "resonance", "30%", .3)
             + enc(CAPC["navy"], N["prod"], "glide", "0", 0) + key(I["hear"], "hear it", aria="Hear it in your track") + '</div>')
    unlock = (silk("unlocks later") + '<div class="g">'
              + pad(f'{SI["lock"]}<span>sidechain · step 14</span>', None, "Sidechain, unlocks at step 14", 48, "grid-column:span 2", "dim")
              + pad(f'{SI["lock"]}<span>drive · step 9</span>', None, "Drive, unlocks at step 9", 48, "grid-column:span 2", "dim") + '</div>')
    bottom = ('<div class="g" style="position:absolute;left:16px;right:16px;bottom:22px">' + key(I["close"], "later", href="M4TodayL.dc.html", aria="Not now")
              + f'<a href="M4Studio.dc.html" class="m wide" aria-label="Add to my track" style="grid-column:span 3"><span class="cap go pill" style="width:90%;height:62%;gap:8px;font-size:16px;font-weight:500">{I["plus"]}add to my track</span></a></div>')
    return phone("light", head + scr + shape + unlock, bottom)

# ── 5 · STUDIO ────────────────────────────────────────────────────────────
def studio():
    rows = [("kick", N["fund"], Q, "full"), ("hats", N["fund"], E, "full"), ("bass", N["prod"], S16, "full"), ("chords", N["lilac"], Q, "full")]
    head = ('<div style="display:flex;align-items:center;justify-content:space-between;height:40px">'
            f'<div style="display:flex;align-items:center;gap:8px"><a href="M4TodayL.dc.html" aria-label="Back" style="color:var(--ink);display:flex">{I["back"]}</a><span class="t22">studio</span><span class="tag">my track</span></div>'
            '<span class="val">4 layers · 120 bpm</span></div>')
    scr = (f'<div class="scr" style="margin-top:4px"><div class="scrf" style="padding:12px 16px 12px;height:170px">'
           '<div style="display:flex;justify-content:space-between;align-items:flex-start"><div><div class="ss">editing · page 1</div>'
           '<div class="big" style="font-size:30px;margin-top:3px;color:#FF6FAE">bass</div></div>'
           '<div style="text-align:right"><div class="ss">cutoff</div><div class="big" style="font-size:30px;margin-top:3px">62%</div></div></div>'
           f'<div style="margin-top:12px">{lanes(338, rows, sel=2, solo=2)}</div></div></div>')
    layers = ('<div class="g" style="margin-top:8px">' + "".join(key(f'<span class="leg" style="font-size:22px">{i+1}</span>', n, cap="blk" if i == 2 else "", led=c, aria=f"Layer {i+1}, {n}")
              for i, (n, c) in enumerate([("kick", N["fund"]), ("hats", N["fund"]), ("bass", N["prod"]), ("chords", N["lilac"])])) + '</div>')
    encs = ('<div class="g" style="margin-top:6px">' + enc(CAPC["prod"], N["prod"], "cutoff", "62%", .62) + enc(CAPC["grey"], N["prod"], "resonance", "30%", .3)
            + enc(CAPC["navy"], N["prod"], "envelope", "45%", .45) + enc(CAPC["grey"], N["prod"], "glide", "15%", .15) + '</div>')
    faders = ('<div class="g" style="margin-top:6px">' + fader("kick", N["fund"], .8) + fader("hats", N["fund"], .5) + fader("bass", N["prod"], .7) + fader("chords", N["lilac"], .45) + '</div>')
    pads = ('<div class="g" style="margin-top:6px">' + pad("sidechain", N["prod"], "Sidechain on") + pad("mute") + pad("solo", "#F4F3F0", "Solo on") + pad("shift", None, "Shift for page 2") + '</div>')
    transport = ('<div class="g" style="margin-top:6px">' + key(I["play"], "play", cap="go", aria="Play") + key(I["stop"], "stop", aria="Stop")
                 + key(I["plus"], "layer", aria="Add a layer") + key(I["out"], "to live", aria="Export to Ableton Live") + '</div>')
    return phone("dark", head + scr + layers + encs + faders + pads + transport)

# ── 6 · DJ ────────────────────────────────────────────────────────────────
def mini_pitch(h=150, frac=.48):
    th = h - 24
    ticks = "".join(f'<i style="position:absolute;left:{0 if j%8==0 else 3}px;top:{4 + j*th/16:.0f}px;width:{10 if j%8==0 else 5}px;height:1px;background:{N["fund"] if j==8 else "var(--tick)"}"></i>' for j in range(17))
    return (f'<div style="position:relative;width:30px;height:{h}px" role="img" aria-label="Pitch fader">{ticks}'
            f'<div style="position:absolute;left:17px;top:4px;bottom:20px;width:4px;border-radius:2px;background:var(--slot)"></div>'
            f'<div style="position:absolute;left:8px;top:{4 + frac*th - 9:.0f}px;width:22px;height:18px;border-radius:4px;background:linear-gradient(180deg,var(--cap1),var(--cap2));box-shadow:0 3px 5px var(--sh)"><i style="position:absolute;left:4px;right:4px;top:8px;height:2px;background:var(--ink)"></i></div>'
            '<span class="val" style="position:absolute;bottom:0;left:0">pitch</span></div>')


def dj():
    head = ('<div style="display:flex;align-items:center;justify-content:space-between;height:40px">'
            '<div style="display:flex;align-items:center;gap:8px"><span class="t22">dj</span><span class="tag">my mix</span></div><span class="val">step 14 · the blend</span></div>')
    scr = (f'<div class="scr" style="margin-top:4px"><div class="scrf" style="padding:10px 14px;height:142px">'
           f'<div style="display:flex;justify-content:space-between"><span class="ss" style="color:{N["fund"]}">a · my track · 124.0</span><span class="ss" style="color:{N["dj"]}">b · night bus · 124.0</span></div>'
           f'<div style="margin-top:6px">{M.wave(330, 40, 3, N["fund"], .55)}</div><div style="margin-top:6px">{M.wave(330, 40, 9, N["dj"], .2)}</div>'
           '<div class="ss" style="margin-top:6px;text-align:center;color:#F3F2EF">bring b in on the next phrase · 8 beats</div></div></div>')
    jogs = (f'<div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px">{mini_pitch()}'
            f'{M.jog(N["fund"], "a", 140)}{M.jog(N["dj"], "b", 140)}{mini_pitch(frac=.4)}</div>')
    eqs = ('<div class="g" style="margin-top:8px">' + enc(CAPC["grey"], N["fund"], "low a", "-4 db", .4) + enc(CAPC["grey"], N["fund"], "filter a", "off", .5)
           + enc(CAPC["grey"], N["dj"], "filter b", "hp 30%", .65) + enc(CAPC["grey"], N["dj"], "low b", "kill", 0) + '</div>')
    cues = ('<div class="g" style="margin-top:6px;grid-template-columns:repeat(8,1fr)">'
            + "".join(pad(str(i % 4 + 1), c if on else None, f"Hot cue {i%4+1}", 40) for i, (c, on) in enumerate([(N["fund"], 1), (N["fund"], 1), (N["fund"], 0), (N["fund"], 0), (N["dj"], 1), (N["dj"], 0), (N["dj"], 0), (N["dj"], 0)])) + '</div>')
    xf = ('<div class="m wide" style="grid-column:span 2;height:92px;flex-direction:column;gap:10px">'
          '<div style="position:relative;width:130px;height:24px">'
          + "".join(f'<i style="position:absolute;top:0;left:{i*130/8:.0f}px;width:1px;height:5px;background:var(--tick)"></i>' for i in range(9))
          + '<div style="position:absolute;top:10px;left:0;right:0;height:4px;border-radius:2px;background:var(--slot)"></div>'
          '<div style="position:absolute;top:1px;left:46px;width:22px;height:22px;border-radius:4px;background:linear-gradient(180deg,var(--cap1),var(--cap2));box-shadow:0 3px 5px var(--sh),inset 0 1px 0 var(--modhi)"><i style="position:absolute;top:5px;bottom:5px;left:10px;width:2px;background:var(--ink)"></i></div></div>'
          '<span class="ml" style="color:var(--ink)">crossfader</span></div>')
    faders = ('<div class="g" style="margin-top:6px;align-items:end">' + fader("vol a", N["fund"], .85, 92) + xf + fader("vol b", N["dj"], .3, 92) + '</div>')
    btns = ('<div class="g" style="margin-top:6px">' + key(I["cue"], "deck a", aria="Cue deck A") + key(I["play"], "deck a", cap="blk", aria="Deck A playing")
            + key(I["sync"], "deck b", aria="Sync deck B") + key(I["play"], "deck b", cap="go", aria="Play deck B") + '</div>')
    return phone("dark", head + scr + jogs + eqs + cues + faders + btns)

# ── 7 · DESKTOP TODAY ─────────────────────────────────────────────────────
def desktop():
    rows = [("kick", N["fund"], Q, "full"), ("hats", N["fund"], E, "full"), ("bass", N["prod"], [(0, 1)], "dash"), ("chords", N["lilac"], Q, "full")]
    big_lanes = lanes(740, rows).replace('font-size="12"', 'font-size="13"')
    scr = (f'<div class="scr"><div class="scrf" style="padding:26px 28px;height:450px">'
           f'<img src="{CAT}" alt="" style="position:absolute;right:24px;top:20px;width:110px">'
           '<div class="ss">your track</div><div class="t36" style="font-size:52px;margin-top:8px">3 layers</div>'
           '<div class="ss" style="margin-top:8px">120 bpm · tap a lane to solo it · space to hear</div>'
           f'<div style="margin-top:60px">{big_lanes}</div></div></div>')
    nxt = (f'<a href="#" class="m wide" style="height:130px;justify-content:flex-start;gap:16px;padding:0 18px">'
           f'<img src="{SYNTH}" alt="" style="width:80px;height:80px;border-radius:10px;object-fit:cover;filter:url(#duo-prod)">'
           f'<div style="flex:1"><div class="t11">next · producer 02 · adds bass</div><div class="t36" style="font-size:30px;margin-top:4px">bass and poli</div><div style="margin-top:6px">{hw("knob", "keys")}</div></div>'
           f'<span class="cap go" style="width:76px;flex:none">{I["play"]}</span><span class="val" style="position:absolute;right:20px;bottom:8px">enter</span></a>')
    dial = f'<div class="m wide" style="height:260px;flex-direction:column;justify-content:center">{m3.mode_dial(2, 86)}<span class="ml" style="color:var(--ink)">producer · 1 of 91</span></div>'
    gauge = f'<div class="m wide" style="height:260px;flex-direction:column;justify-content:flex-start;padding-top:18px">{m3.meter(12, 5, True, 9)}<span class="ml" style="color:var(--ink);bottom:19px">today</span><span class="ml">20 / 50 xp</span></div>'
    hear = f'<a href="#" class="m wide" style="height:260px"><span class="cap" style="width:58%;margin-top:-16px">{I["hear"]}</span><span class="ml" style="color:var(--ink);bottom:19px">hear</span><span class="ml">space</span></a>'
    right = (f'<div style="width:520px;display:flex;flex-direction:column">{silk("worlds", "today")}'
             f'<div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:8px">{dial}{gauge}{hear}</div>'
             + silk("practice", "2 min each") + '<div class="g" style="gap:8px">' + pad("review · 3", N["lilac"], h=72) + pad("ear gym", h=72) + pad("beat", h=72) + pad("quiz", h=72) + '</div>'
             + silk("this week", "4 days") + week(4) + '</div>')
    left = f'<div style="flex:1;display:flex;flex-direction:column;gap:10px">{scr}{nxt}</div>'
    modes = ""
    for i, (n, on) in enumerate([("learn", 1), ("practice", 0), ("studio", 0), ("library", 0)]):
        modes += (f'<a href="#" class="m" style="width:96px"><span class="dot{" on" if on else ""}" style="--c:#F4F3F0"></span><span class="cap{" blk" if on else ""}" style="width:52%;margin-top:-8px">{I[n]}</span>'
                  f'<span class="ml" style="{"color:var(--ink)" if on else ""}">{n} · {i+1}</span></a>')
    bar = (f'<div style="position:absolute;left:40px;right:90px;bottom:28px;display:flex;align-items:center;gap:8px">{modes}<div style="flex:1"></div>'
           '<span class="val">shift = explain · space = hear · 1-4 = modes · a-k = keys</span></div>')
    side = ('<div style="position:absolute;right:-38px;top:50%;transform:translateY(-50%) rotate(90deg);transform-origin:center;white-space:nowrap" class="t15">'
            '<span style="font-weight:600">ccd school</span><span class="tag" style="margin-left:8px">model 1</span></div>'
            '<div style="position:absolute;right:36px;top:70px;width:1px;height:70px;background:var(--print);opacity:.5"></div><div style="position:absolute;right:30px;top:104px;width:13px;height:1px;background:var(--print);opacity:.5"></div>')
    body = (f'<div class="dev light face" style="width:1440px;height:900px;box-sizing:border-box;padding:28px 90px 28px 40px;overflow:hidden">{DUO}'
            f'{header(xp())}<div style="display:flex;gap:24px;margin-top:12px">{left}{right}</div>{bar}{side}</div>')
    return body

# ── 8 · HOW IT BEHAVES (notes) ────────────────────────────────────────────
def notes():
    def card(t, lines, extra=""):
        li = "".join(f'<li style="margin:0 0 8px">{l}</li>' for l in lines)
        return f'<div class="m wide" style="flex-direction:column;align-items:stretch;justify-content:flex-start;padding:22px 24px;gap:12px"><div class="t22">{t}</div><ul class="t15" style="font-weight:400;margin:0;padding-left:18px;color:var(--sub)">{li}</ul>{extra}</div>'
    shift_card = ('<div class="scr" style="margin-top:6px"><div class="scrf" style="padding:16px;height:170px;display:flex;gap:14px">'
                  '<div style="width:110px;height:138px;border-radius:8px;background:repeating-linear-gradient(90deg,#1A1A1D 0 6px,#121214 6px 12px);display:flex;align-items:center;justify-content:center"><span class="ss">photo of a<br>ddj-400</span></div>'
                  '<div style="flex:1"><div class="ss">shift · what is this</div><div class="t22" style="margin-top:4px">crossfader</div>'
                  '<div class="ss" style="margin-top:8px;color:#F3F2EF;line-height:1.5">blends deck a into deck b. bottom centre on a ddj-400, a djm mixer and most controllers.</div>'
                  '<div class="ss" style="margin-top:8px">learn it in dj step 12</div></div></div></div>')
    share = ('<div style="display:flex;gap:14px;align-items:center;margin-top:6px"><div style="width:96px;height:170px;border-radius:14px;background:#050506;position:relative;overflow:hidden;box-shadow:0 0 0 3px #000">'
             f'<img src="{CAT}" alt="" style="position:absolute;left:18px;top:30px;width:60px">'
             + "".join(f'<span style="position:absolute;left:12px;right:12px;top:{100+i*12}px;height:6px;border-radius:2px;background:{c}"></span>' for i, c in enumerate([N["fund"], N["fund"], N["prod"], N["lilac"]]))
             + '<span class="ss" style="position:absolute;left:0;right:0;bottom:8px;text-align:center;font-size:8px">made on ccd school</span></div>'
             '<div class="t12" style="color:var(--sub)">15 second vertical clip of your screen playing your track, ready for reels and stories.</div></div>')
    cards = "".join([
        card("plug in real gear", ["launch control, circuit, any midi keyboard work over web midi", "knobs, faders and pads drive the same controls on screen", "lessons say which real knob to turn"]),
        card("acts like gear", ["double tap a knob or fader to reset it", "faders click at 0 db, the dial clicks between worlds", "pads hit harder when you tap harder", "knobs turn with a vertical drag, arrow keys work too"]),
        card("sound and touch", ["keys click, knobs tick, pads trigger a drum hit", "a short buzz on phones that support it", "one switch turns all of it off", "nothing moves or plays until you touch it"]),
        card("shift explains", ["hold shift, tap any control", "real name, where it sits on popular gear, what it does"], shift_card),
        card("share your track", ["export from studio", "every share is something someone made"], share),
    ])
    return (f'<div class="dev light face" style="width:1440px;height:820px;box-sizing:border-box;padding:40px 48px">'
            '<div class="t11">ccd school · model 1</div><div class="t36" style="font-size:48px;margin:6px 0 24px">how it behaves</div>'
            f'<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">{cards}</div></div>')

# ── page writer ───────────────────────────────────────────────────────────
HEAD = F.HEAD.replace('<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600&amp;display=swap" rel="stylesheet">', FONTS)


def write(name, title, body, w, h, css=CSS):
    with open(os.path.join(OUT, name), "w") as f:
        f.write(HEAD.format(title=title, css=css, body=body, w=w, h=h))
    print("wrote", name)


def sheet(mode):
    # reuse the component sheet layout with the refined primitives
    m3.key, m3.enc, m3.fader, m3.pad, m3.lanes, m3.I = key, enc, fader, pad, lanes, I
    m3.M.status = lambda: header(xp())
    m3.M.nav = lambda a, c=None: nav(a).replace("position:absolute;left:16px;right:16px;bottom:22px", "position:absolute;left:0;right:0;bottom:0")
    body = m3.sheet(mode)
    body = body.replace("mint light + tick sound", "world colour + tick").replace("red light, lose a heart", "red, lose a heart")
    return body


if __name__ == "__main__":
    write("M4TodayL.dc.html", "Today · light", today("light"), 390, 844)
    write("M4TodayD.dc.html", "Today · dark", today("dark"), 390, 844)
    write("M4TodayFirst.dc.html", "Today · first run", today("light", first=True), 390, 844)
    write("M4World.dc.html", "World", world(), 390, 844)
    write("M4Lesson.dc.html", "Lesson", lesson(), 390, 844)
    write("M4Add.dc.html", "Add to my track", add(), 390, 844)
    write("M4Studio.dc.html", "Studio", studio(), 390, 844)
    write("M4DJ.dc.html", "DJ", dj(), 390, 844)
    write("M4Desktop.dc.html", "Today · desktop", desktop(), 1440, 900)
    write("M4Behaves.dc.html", "How it behaves", notes(), 1440, 820)
    write("M4Sheet_light.dc.html", "Components · light", sheet("light"), 1600, 3000, CSS + SHEET_EXTRA)
    write("M4Sheet_dark.dc.html", "Components · dark", sheet("dark"), 1600, 3000, CSS + SHEET_EXTRA)
