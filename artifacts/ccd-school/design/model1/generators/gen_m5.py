#!/usr/bin/env python3
"""Model 1 · physical. Extruded keys, dished caps, deep wells, one light source.
Decluttered: one job per screen, values live on the screen, Studio and DJ split into two pages."""
import os, math
import gen_m4 as R
import gen_m3 as m3
import gen_m2 as M
import gen_field as F

OUT = F.OUT
CAT, SYNTH, N, I, SI, DUO = R.CAT, R.SYNTH, R.N, R.I, R.SI, R.DUO
CAPC = R.CAPC
Q, E, S16 = R.Q, R.E, R.S16

CSS = r"""
body{margin:0}
.dev{font-family:"Outfit",system-ui,sans-serif;-webkit-font-smoothing:antialiased;color:var(--ink);letter-spacing:.005em}
.light{--deck:#D3D2CC;--deck2:#C9C8C2;--vig:rgba(255,255,255,.45);--t1:#F7F6F2;--t2:#E7E6E1;--hi:rgba(255,255,255,1);--lo:rgba(0,0,0,.06);--s1:#CFCDC6;--s2:#BCBAB3;--shA:rgba(55,45,35,.24);--shB:rgba(55,45,35,.16);
 --c0:#ECEAE5;--c1:#FFFFFF;--cs1:#D2D0C9;--cs2:#BFBDB6;--ink:#18181A;--sub:#5C5A54;--print:#77756F;--well:#C7C6C0;--k1:#F8F7F3;--k2:#D3D1CB;--ledoff:#BDBBB4;--padt:#E9E8E3;--pads:#C4C2BB;--slot:#232325;--tick:rgba(0,0,0,.32);--recess:#BDBCB6;--tag:#A9A7A1;--grain:GL}
.dark{--deck:#1A1B1D;--deck2:#151618;--vig:rgba(255,255,255,.035);--t1:#303135;--t2:#25262A;--hi:rgba(255,255,255,.10);--lo:rgba(0,0,0,.35);--s1:#111113;--s2:#0A0A0B;--shA:rgba(0,0,0,.62);--shB:rgba(0,0,0,.45);
 --c0:#2B2C30;--c1:#45464C;--cs1:#151517;--cs2:#0B0B0C;--ink:#EEEEEB;--sub:#A6A7AC;--print:#8B8C91;--well:#101112;--k1:#4A4B50;--k2:#2A2B2F;--ledoff:#3A3B3F;--padt:#323337;--pads:#121214;--slot:#060607;--tick:rgba(255,255,255,.26);--recess:#0E0F10;--tag:#4A4B50;--grain:GD}
.face{background-image:radial-gradient(120% 60% at 30% 0%,var(--vig),transparent 60%),var(--grain),linear-gradient(180deg,var(--deck),var(--deck2));position:relative}
.t36{font-size:36px;font-weight:300;letter-spacing:-.035em;line-height:1}
.t22{font-size:22px;font-weight:400;letter-spacing:-.02em;line-height:1.1}
.t15{font-size:15px;font-weight:500;line-height:1.3}
.t11{font-size:11px;font-weight:500;line-height:1.3;color:var(--sub)}
.val{font-size:11px;font-weight:500;color:var(--sub);font-variant-numeric:tabular-nums}
.ss{color:#9A9AA0;font-size:11px;font-weight:500}
.big{font-weight:300;letter-spacing:-.035em;line-height:1}
.tag{display:inline-flex;align-items:center;border:1px solid var(--tag);border-radius:5px;padding:0 6px;height:18px;font-size:11px;font-weight:500;color:var(--sub)}
.g{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
/* extruded key block, light from above */
.m{position:relative;border-radius:13px;background-image:var(--grain),linear-gradient(180deg,var(--t1),var(--t2));
 box-shadow:inset 0 1.5px 0 var(--hi),inset 0 -2px 3px var(--lo),0 1px 0 var(--s1),0 2px 0 var(--s1),0 3px 0 var(--s2),0 4px 0 var(--s2),0 7px 8px -1px var(--shA),0 16px 20px -8px var(--shB);
 display:flex;align-items:center;justify-content:center;aspect-ratio:1;border:0;padding:0;font:inherit;color:var(--ink);text-decoration:none;box-sizing:border-box;transition:transform 70ms,box-shadow 70ms}
.m.wide{aspect-ratio:auto}
a.m:active,button.m:active{transform:translateY(3px);box-shadow:inset 0 1.5px 0 var(--hi),inset 0 -2px 3px var(--lo),0 1px 0 var(--s2),0 3px 5px var(--shA)}
.m.is-dim{opacity:.45;box-shadow:inset 0 1px 0 var(--hi),0 1px 0 var(--s1),0 2px 3px var(--shB)}
/* dished round cap, OP-1 style: rim catches light, centre dips */
.cap{width:62%;aspect-ratio:1;border-radius:50%;
 background:radial-gradient(circle at 50% 58%,var(--c0) 0 42%,var(--c1) 82%,var(--c0) 100%);
 box-shadow:inset 0 2px 1px var(--hi),inset 0 -1px 1px rgba(0,0,0,.10),0 1px 0 var(--cs1),0 2px 0 var(--cs1),0 3px 0 var(--cs2),0 4px 0 var(--cs2),0 5px 0 var(--cs2),0 9px 10px -2px var(--shA);
 display:flex;align-items:center;justify-content:center;color:var(--ink);transition:transform 70ms,box-shadow 70ms}
.m:active .cap{transform:translateY(3px);box-shadow:inset 0 2px 1px var(--hi),0 1px 0 var(--cs1),0 2px 0 var(--cs2),0 3px 4px var(--shA)}
.cap.blk{background:radial-gradient(circle at 50% 58%,#141416 0 42%,#3B3B3F 84%,#1A1A1C 100%);color:#F2F2F0;box-shadow:inset 0 2px 1px rgba(255,255,255,.18),0 1px 0 #0A0A0B,0 2px 0 #0A0A0B,0 3px 0 #000,0 4px 0 #000,0 5px 0 #000,0 9px 10px -2px var(--shA)}
.cap.go{background:radial-gradient(circle at 50% 58%,#DC3A82 0 40%,#FF7DB4 84%,#E44A8E 100%);color:#fff;box-shadow:inset 0 2px 1px rgba(255,255,255,.55),0 1px 0 #B42766,0 2px 0 #B42766,0 3px 0 #921C51,0 4px 0 #921C51,0 5px 0 #921C51,0 10px 14px -2px rgba(210,48,122,.42)}
.cap.pill{aspect-ratio:auto;border-radius:999px;background:radial-gradient(70% 120% at 50% 60%,#DC3A82 0 45%,#FF7DB4 90%)}
.leg{font-weight:200;line-height:1;font-variant-numeric:tabular-nums}
.ml{position:absolute;left:0;right:0;bottom:6px;text-align:center;font-size:11px;font-weight:500;color:var(--sub);line-height:1}
.dot{position:absolute;top:8px;left:50%;margin-left:-3px;width:6px;height:6px;border-radius:3px;background:var(--ledoff);box-shadow:inset 0 1px 1px rgba(0,0,0,.35),0 1px 0 var(--hi)}
.dot.on{background:radial-gradient(circle at 50% 45%,#fff 0 24%,var(--c) 62%);box-shadow:0 0 4px var(--c),0 1px 0 var(--hi)}
.dash{width:18px;height:3px;border-radius:2px;background:var(--ledoff);box-shadow:inset 0 1px 1px rgba(0,0,0,.3)}
.dash.on{background:linear-gradient(180deg,var(--c),#fff 50%,var(--c));box-shadow:0 0 4px var(--c)}
/* deep screen pocket */
.scr{border-radius:20px;padding:6px;background:var(--recess);box-shadow:inset 0 4px 9px var(--shA),inset 0 -1px 0 var(--hi),0 1px 0 var(--hi)}
.scrf{background:radial-gradient(120% 90% at 50% 0%,#0C0C0E,#030304);color:#F3F2EF;border-radius:14px;position:relative;overflow:hidden;box-sizing:border-box;box-shadow:0 0 0 1.5px #000,inset 0 0 0 1px rgba(255,255,255,.05),inset 0 8px 18px rgba(0,0,0,.6)}
.scrf:after{content:"";position:absolute;inset:0;background:linear-gradient(112deg,rgba(255,255,255,.09),rgba(255,255,255,.02) 32%,rgba(255,255,255,0) 33%);pointer-events:none}
/* knobs: knurled cylinder in a deep well, cast shadow down */
.well{border-radius:50%;background:radial-gradient(circle at 50% 35%,var(--well),var(--deck2));box-shadow:inset 0 4px 8px var(--shA),inset 0 -1px 0 var(--hi),0 1px 0 var(--hi);display:flex;align-items:center;justify-content:center}
.kb{border-radius:50%;background:repeating-conic-gradient(var(--k1) 0 4deg,var(--k2) 4deg 8deg);box-shadow:0 1px 0 var(--cs1),0 2px 0 var(--cs1),0 3px 0 var(--cs2),0 4px 0 var(--cs2),0 5px 0 var(--cs2),0 6px 0 var(--cs2),0 12px 14px -3px var(--shA);display:flex;align-items:center;justify-content:center;position:relative}
.kc{border-radius:50%;background:radial-gradient(circle at 50% 60%,var(--c) 0 48%,color-mix(in srgb,var(--c) 70%,#fff) 92%);box-shadow:inset 0 2px 1px rgba(255,255,255,.55),inset 0 -2px 3px rgba(0,0,0,.25),0 0 0 1px rgba(0,0,0,.12);position:relative}
.kc b{position:absolute;left:50%;top:5%;width:3px;height:30%;margin-left:-1.5px;border-radius:2px;background:#fff;box-shadow:0 0 2px rgba(0,0,0,.3);transform-origin:50% 150%}
.knob{width:74%;aspect-ratio:1;border-radius:50%;background:repeating-conic-gradient(var(--k1) 0 4deg,var(--k2) 4deg 8deg);box-shadow:0 1px 0 var(--cs1),0 3px 0 var(--cs2),0 5px 0 var(--cs2),0 11px 13px -3px var(--shA);display:flex;align-items:center;justify-content:center}
.knob>i{display:block;width:72%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 50% 60%,var(--c0) 0 45%,var(--c1) 90%);box-shadow:inset 0 2px 1px var(--hi),inset 0 -2px 3px rgba(0,0,0,.18)}
/* silicone pads */
.pd{display:flex;align-items:center;justify-content:center;flex-direction:column;gap:2px;border-radius:11px;background:linear-gradient(180deg,var(--padt),color-mix(in srgb,var(--padt) 88%,#000));box-shadow:inset 0 1.5px 0 var(--hi),inset 0 -3px 5px rgba(0,0,0,.10),0 1px 0 var(--pads),0 2px 0 var(--pads),0 3px 0 var(--pads),0 7px 8px -2px var(--shA);text-decoration:none;color:var(--ink);font-size:12px;font-weight:500}
.pd.lit{background:radial-gradient(circle at 50% 40%,rgba(255,255,255,.85) 0,rgba(255,255,255,.2) 34%,rgba(255,255,255,0) 66%),var(--c);color:#141416;box-shadow:inset 0 1.5px 0 rgba(255,255,255,.6),inset 0 -3px 6px rgba(0,0,0,.18),0 1px 0 color-mix(in srgb,var(--c) 60%,#000),0 2px 0 color-mix(in srgb,var(--c) 60%,#000),0 3px 0 color-mix(in srgb,var(--c) 50%,#000),0 0 14px color-mix(in srgb,var(--c) 70%,transparent)}
/* fader */
.fcap{position:absolute;left:50%;width:40px;height:24px;margin-left:-20px;border-radius:5px;background:repeating-linear-gradient(180deg,rgba(0,0,0,0) 0 3px,rgba(0,0,0,.10) 3px 4px),linear-gradient(180deg,var(--c1),var(--c0));box-shadow:inset 0 1.5px 0 var(--hi),0 1px 0 var(--cs1),0 2px 0 var(--cs1),0 3px 0 var(--cs2),0 4px 0 var(--cs2),0 9px 10px -2px var(--shA)}
.fcap i{position:absolute;left:5px;right:5px;top:11px;height:2px;background:var(--ink);border-radius:1px}
.fslot{position:absolute;left:50%;width:6px;margin-left:-3px;border-radius:3px;background:var(--slot);box-shadow:inset 0 2px 3px rgba(0,0,0,.6),0 1px 0 var(--hi)}
.jog{border-radius:50%;background:repeating-conic-gradient(var(--k1) 0 2.5deg,var(--k2) 2.5deg 5deg);box-shadow:0 1px 0 var(--cs1),0 3px 0 var(--cs2),0 6px 0 var(--cs2),0 16px 20px -4px var(--shA);display:flex;align-items:center;justify-content:center;position:relative}
.plat{border-radius:50%;background:repeating-radial-gradient(circle,#141416 0 2px,#1C1C1F 2px 3px);display:flex;align-items:center;justify-content:center;position:relative;box-shadow:inset 0 0 0 2px #000,inset 0 6px 12px rgba(0,0,0,.6)}
.sw{position:relative;display:flex;height:34px;border-radius:17px;background:var(--well);box-shadow:inset 0 3px 6px var(--shA),0 1px 0 var(--hi);padding:3px;box-sizing:border-box}
.sw span{flex:1;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:500;color:var(--sub);border-radius:14px;position:relative;z-index:1}
.sw span.on{color:var(--ink);background:linear-gradient(180deg,var(--c1),var(--c0));box-shadow:inset 0 1.5px 0 var(--hi),0 1px 0 var(--cs1),0 2px 0 var(--cs2),0 5px 6px -1px var(--shA)}
svg.i{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
svg.s{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
""".replace("GL", R.GL).replace("GD", R.GD)


def key(inner, label=None, cap="", led=None, href="#", aria="", style=""):
    dot = f'<span class="dot on" style="--c:{led}"></span>' if led else ""
    lab = f'<span class="ml">{label}</span>' if label else ""
    mt = "width:56%;margin-top:-12px;" if label else ""
    return f'<a href="{href}" class="m" aria-label="{aria or (label or "")}" style="{style}">{dot}<span class="cap {cap}" style="{mt}">{inner}</span>{lab}</a>'


def knob(cap, label, frac, size=46, led=None, wide=False, h=None, aria=""):
    """Physical knob in a module. No value text: values show on the screen when touched."""
    rot = -135 + 270 * frac
    well = size + 18
    sc = R.scale_svg(well + 14) if size >= 50 else ""
    dash = f'<span class="dash on" style="--c:{led};position:absolute;top:9px;left:50%;margin-left:-9px"></span>' if led else ""
    cls = "m wide" if wide else "m"
    hh = f"height:{h}px;" if h else ""
    return (f'<div class="{cls}" role="img" aria-label="{aria or label}" style="{hh}">{dash}'
            f'<div style="position:relative;width:{well+14}px;height:{well+14}px;display:flex;align-items:center;justify-content:center;margin-top:-12px">{sc}'
            f'<div class="well" style="width:{well}px;height:{well}px"><div class="kb" style="width:{size}px;height:{size}px;margin-top:-4px">'
            f'<div class="kc" style="--c:{cap};width:{size*0.68:.0f}px;height:{size*0.68:.0f}px"><b style="transform:rotate({rot:.0f}deg)"></b></div></div></div></div>'
            f'<span class="ml" style="color:var(--ink)">{label}</span></div>')


def fader(name, led, frac, h=200, aria=None):
    th = h - 70
    ticks = "".join(f'<span style="position:absolute;left:0;right:0;top:{12 + i*th/8:.0f}px;display:flex;justify-content:space-between"><i style="width:{9 if i in (0,8,2) else 6}px;height:1px;background:var(--tick)"></i><i style="width:{9 if i in (0,8,2) else 6}px;height:1px;background:var(--tick)"></i></span>' for i in range(9))
    top = 12 + (1 - frac) * th - 12
    return (f'<div class="m wide" role="img" aria-label="{aria or name}" style="height:{h}px;flex-direction:column;justify-content:flex-start;padding-top:10px">'
            f'<span class="dash on" style="--c:{led}"></span>'
            f'<div style="position:relative;width:52px;height:{th+24}px;margin-top:6px">{ticks}'
            f'<div class="fslot" style="top:8px;bottom:8px"></div><div class="fcap" style="top:{top:.0f}px"><i></i></div></div>'
            f'<span class="ml" style="color:var(--ink)">{name}</span></div>')


def pad(label, lit=None, aria="", h=50, style="", cls=""):
    return f'<a href="#" class="pd {cls}{" lit" if lit else ""}" aria-label="{aria or label}" style="height:{h}px;{"--c:"+lit+";" if lit else ""}{style}">{label}</a>'


def switch(opts, sel):
    return '<div class="sw" role="radiogroup">' + "".join(f'<span class="{"on" if i == sel else ""}" role="radio" aria-checked="{str(i==sel).lower()}">{o}</span>' for i, o in enumerate(opts)) + '</div>'


def header(right=""):
    return ('<div style="display:flex;align-items:center;justify-content:space-between;height:40px">'
            f'<div style="display:flex;align-items:center;gap:8px"><span style="width:26px;height:26px;border-radius:50%;background:#0B0B0C;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 0 var(--hi),inset 0 1px 2px rgba(255,255,255,.15)"><img src="{CAT}" alt="" style="width:21px"></span>'
            '<span class="t15" style="font-weight:600;letter-spacing:-.01em">ccd school</span><span class="tag">model 1</span></div>'
            f'{right}</div>')


def week_dots(lit=4):
    return '<span style="display:flex;gap:4px" role="img" aria-label="4 days this week">' + "".join(f'<span style="width:6px;height:6px;border-radius:3px;background:{"var(--ink)" if i < lit else "var(--ledoff)"};box-shadow:inset 0 1px 1px rgba(0,0,0,.2)"></span>' for i in range(7)) + '</span>'


def nav(active):
    items = [("learn", "M5TodayL.dc.html"), ("practice", "#"), ("studio", "M5StudioEdit.dc.html"), ("library", "#")]
    out = ""
    for n, h in items:
        on = n == active
        out += (f'<a href="{h}" class="m" aria-label="{n}"{" aria-current=page" if on else ""}><span class="dot{" on" if on else ""}" style="--c:#F4F3F0"></span>'
                f'<span class="cap{" blk" if on else ""}" style="width:52%;margin-top:-9px">{I[n]}</span><span class="ml" style="{"color:var(--ink)" if on else ""}">{n}</span></a>')
    return f'<nav aria-label="Main" class="g" style="position:absolute;left:16px;right:16px;bottom:24px">{out}</nav>'


def phone(mode, inner, extra=""):
    return f'<div class="dev {mode} face" style="width:390px;height:844px;overflow:hidden">{DUO}<div style="padding:10px 16px 0">{inner}</div>{extra}</div>'


def go_pill(text, href="#", icon=None):
    ic = I.get(icon, "") if icon else ""
    return f'<a href="{href}" class="m wide" aria-label="{text}" style="grid-column:span 3"><span class="cap go pill" style="width:90%;height:58%;gap:8px;font-size:16px;font-weight:500;margin-top:-12px">{ic}{text}</span></a>'

# ── TODAY: four zones only ───────────────────────────────────────────────
def today(mode):
    rows = [("kick", N["fund"], Q, "full"), ("hats", N["fund"], E, "full"), ("bass", N["prod"], [(0, 1)], "dash"), ("chords", N["lilac"], Q, "full")]
    scr = (f'<div class="scr" style="margin-top:6px"><div class="scrf" style="padding:20px 16px 18px;height:262px">'
           f'<img src="{CAT}" alt="" style="position:absolute;right:16px;top:16px;width:70px">'
           '<div class="ss">your track</div><div class="t36" style="margin-top:8px">3 layers</div>'
           f'<div style="margin-top:58px">{R.lanes(338, rows)}</div></div></div>')
    nxt = (f'<a href="M5World.dc.html" class="m wide" style="margin-top:16px;height:112px;justify-content:flex-start;gap:14px;padding:0 12px">'
           f'<img src="{SYNTH}" alt="" style="width:72px;height:72px;border-radius:10px;object-fit:cover;flex:none;filter:url(#duo-prod);box-shadow:inset 0 0 0 1px rgba(0,0,0,.2),0 1px 0 var(--hi)">'
           '<div style="flex:1;text-align:left;min-width:0"><div class="t11">next lesson</div><div class="t22" style="margin-top:4px">bass and poli</div>'
           '<div class="t11" style="margin-top:4px">adds bass</div></div>'
           f'<span class="cap go" style="width:62px;flex:none">{I["play"]}</span></a>')
    dial = (f'<div class="m wide" style="grid-column:span 2;height:196px;flex-direction:column;justify-content:flex-start;padding-top:14px">'
            f'{m3.mode_dial(2, 80)}<span class="ml" style="color:var(--ink)">worlds</span></div>')
    gauge = (f'<div class="m wide" style="height:196px;flex-direction:column;justify-content:flex-start;padding-top:18px">'
             f'{m3.meter(9, 3, True, 8)}<span class="ml" style="color:var(--ink)">today</span></div>')
    hear = (f'<a href="M5StudioEdit.dc.html" class="m wide" aria-label="Hear your track" style="height:196px">'
            f'<span class="cap" style="width:64%;margin-top:-12px">{I["hear"]}</span><span class="ml" style="color:var(--ink)">hear</span></a>')
    mid = f'<div class="g" style="margin-top:16px">{dial}{gauge}{hear}</div>'
    right = f'<div style="display:flex;align-items:center;gap:12px">{week_dots()}<span style="font-size:15px;font-weight:300">340<span class="val" style="margin-left:3px">xp</span></span></div>'
    return phone(mode, header(right) + scr + nxt + mid, nav("learn"))

# ── WORLD ─────────────────────────────────────────────────────────────────
def world():
    head = ('<div style="display:flex;align-items:center;gap:12px;height:48px">'
            f'<a href="M5TodayL.dc.html" class="m" aria-label="Back" style="width:44px">{I["back"]}</a>'
            '<div style="flex:1"><div class="t22">producer</div><div class="t11">first contact</div></div>'
            f'<span class="dash on" style="--c:{N["prod"]}"></span></div>')
    scr = (f'<div class="scr" style="margin-top:10px"><div class="scrf" style="height:170px;display:flex">'
           f'<img src="{SYNTH}" alt="A hand turning a synth knob" style="width:150px;height:100%;object-fit:cover;filter:url(#duo-prod)">'
           '<div style="flex:1;padding:16px;display:flex;flex-direction:column;justify-content:space-between">'
           '<span class="big" style="font-size:40px;font-weight:200">02</span>'
           '<div><div class="t22">bass and poli</div><div class="ss" style="margin-top:6px">adds bass · 7 min</div></div></div></div></div>')
    steps = ""
    for n in range(1, 17):
        if n == 1:
            steps += key(f'<span class="leg" style="font-size:24px">{n}</span>', led=N["prod"], aria="Step 1, done")
        elif n == 2:
            steps += key(f'<span class="leg" style="font-size:24px">{n}</span>', cap="blk", href="M5Lesson.dc.html", aria="Step 2, next")
        elif n <= 8:
            steps += key(f'<span class="leg" style="font-size:24px;color:var(--sub)">{n}</span>', aria=f"Step {n}")
        else:
            steps += f'<div class="m is-dim" aria-label="Step {n}, locked"><span class="leg" style="font-size:22px;color:var(--sub)">{n}</span></div>'
    body = head + scr + f'<div class="g" style="margin-top:16px">{steps}</div>'
    bottom = ('<div class="g" style="position:absolute;left:16px;right:16px;bottom:24px">' + key(I["hear"], "preview", aria="Preview")
              + go_pill("start step 02", "M5Lesson.dc.html", "play") + '</div>')
    return phone("light", body, bottom)

# ── LESSON: two big knobs, keys, one go ──────────────────────────────────
def lesson():
    cx = 30 + 0.42 * 280
    curve = (f'<svg width="330" height="100" viewBox="0 0 330 100" aria-hidden="true" style="display:block">'
             f'<path d="M30 42H{cx-34:.0f}C{cx-12:.0f} 42 {cx-10:.0f} 12 {cx:.0f} 12S{cx+18:.0f} 50 {cx+40:.0f} 74S{cx+80:.0f} 92 310 94V94H30z" fill="rgba(255,79,154,.10)"/>'
             f'<path d="M30 42H{cx-34:.0f}C{cx-12:.0f} 42 {cx-10:.0f} 12 {cx:.0f} 12S{cx+18:.0f} 50 {cx+40:.0f} 74S{cx+80:.0f} 92 310 94" fill="none" stroke="#FF4F9A" stroke-width="2" stroke-linecap="round"/>'
             f'<path d="M30 94H310" stroke="#2A2A2D"/></svg>')
    pips = "".join(f'<span style="flex:1;height:3px;border-radius:2px;background:{"#FF4F9A" if i<3 else ("var(--ink)" if i==3 else "var(--ledoff)")}"></span>' for i in range(7))
    hearts = "".join(f'<span style="width:7px;height:7px;border-radius:4px;background:radial-gradient(circle,#fff 0 20%,{N["red"]} 62%);box-shadow:0 0 3px {N["red"]}"></span>' for _ in range(5))
    head = (f'<div style="display:flex;align-items:center;gap:12px;height:40px"><a href="M5World.dc.html" aria-label="Close" style="color:var(--ink);display:flex">{I["close"]}</a>'
            f'<div style="flex:1;display:flex;gap:4px">{pips}</div><span style="display:flex;gap:3px" aria-label="5 hearts">{hearts}</span></div>')
    scr = (f'<div class="scr" style="margin-top:6px"><div class="scrf" style="padding:16px 14px 12px;height:204px">'
           '<div style="display:flex;justify-content:space-between;align-items:flex-start;padding:0 2px">'
           '<div class="t22" style="max-width:210px;font-weight:300">make the bass rounder</div>'
           '<div class="big" style="font-size:30px;color:#FF6FAE">640<span style="font-size:12px"> hz</span></div></div>'
           f'<div style="margin-top:22px">{curve}</div></div></div>')
    knobs = ('<div class="g" style="margin-top:14px;grid-template-columns:1fr 1fr">'
             + knob(CAPC["prod"], "cutoff", .42, 76, N["prod"], wide=True, h=164) + knob(CAPC["grey"], "resonance", .35, 76, N["prod"], wide=True, h=164) + '</div>')
    whites = "cdefgabc"
    wk = "".join(f'<a href="#" class="m wide" aria-label="Note {n}" style="height:180px;align-items:flex-end;padding-bottom:10px;border-radius:10px"><span class="cap" style="width:66%;height:144px;aspect-ratio:auto;border-radius:999px;{"box-shadow:0 0 0 2px #FF4F9A,0 3px 0 var(--cs2),0 8px 10px -2px var(--shA);" if i==5 else ""}"></span></a>' for i, n in enumerate(whites))
    col = (358 - 7 * 5) / 8
    sharps = "".join(f'<a href="#" aria-label="Sharp" class="cap blk" style="position:absolute;left:{(i+1)*(col+5)-2.5-16:.1f}px;top:-16px;width:32px;height:32px;z-index:2"></a>' for i in (0, 1, 3, 4, 5))
    keys = f'<div style="position:relative;margin-top:30px"><div style="display:grid;grid-template-columns:repeat(8,1fr);gap:5px">{wk}</div>{sharps}</div>'
    bottom = ('<div class="g" style="position:absolute;left:16px;right:16px;bottom:24px">' + key(I["shift"], "hint", aria="Hint") + go_pill("sounds right") + '</div>')
    return phone("dark", head + scr + knobs + keys, bottom)

# ── ADD ──────────────────────────────────────────────────────────────────
def add():
    rows = [("kick", N["fund"], Q, "full"), ("hats", N["fund"], E, "full"), ("bass", N["prod"], S16, "new"), ("chords", N["lilac"], Q, "full")]
    head = ('<div style="display:flex;align-items:center;justify-content:space-between;height:48px">'
            f'<a href="M5TodayL.dc.html" class="m" aria-label="Close" style="width:44px">{I["close"]}</a>'
            '<span style="font-size:15px;font-weight:300;color:var(--ink)">+50<span class="val" style="margin-left:3px">xp</span></span></div>')
    scr = (f'<div class="scr" style="margin-top:10px"><div class="scrf" style="padding:18px 16px;height:300px;display:flex;flex-direction:column;justify-content:space-between">'
           f'<img src="{CAT}" alt="" style="position:absolute;right:16px;top:16px;width:80px">'
           '<div><div class="ss">you learned</div><div class="t36" style="margin-top:8px;max-width:200px">bass and poli</div></div>'
           f'{R.lanes(338, rows, sel=2)}</div></div>')
    knobs = ('<div class="g" style="margin-top:14px;grid-template-columns:1fr 1fr">'
             + knob(CAPC["prod"], "cutoff", .4, 92, N["prod"], wide=True, h=210) + knob(CAPC["navy"], "glide", .1, 92, N["prod"], wide=True, h=210) + '</div>')
    bottom = ('<div class="g" style="position:absolute;left:16px;right:16px;bottom:24px">' + key(I["hear"], "hear", aria="Hear it")
              + go_pill("add to my track", "M5StudioEdit.dc.html", "plus") + '</div>')
    return phone("light", head + scr + knobs, bottom)

# ── STUDIO · edit and mix ────────────────────────────────────────────────
def studio_head(sel):
    return ('<div style="display:flex;align-items:center;gap:10px;height:44px">'
            f'<a href="M5TodayL.dc.html" aria-label="Back" style="color:var(--ink);display:flex">{I["back"]}</a><span class="t22" style="flex:1">studio</span>'
            f'<div style="width:150px">{switch(["edit", "mix"], sel)}</div></div>')


def transport():
    return ('<div class="g" style="position:absolute;left:16px;right:16px;bottom:24px">' + key(I["play"], "play", cap="go") + key(I["stop"], "stop")
            + key(I["plus"], "layer") + key(I["out"], "to live") + '</div>')


def studio_edit():
    rows = [("kick", N["fund"], Q, "full"), ("hats", N["fund"], E, "full"), ("bass", N["prod"], S16, "full"), ("chords", N["lilac"], Q, "full")]
    scr = (f'<div class="scr" style="margin-top:8px"><div class="scrf" style="padding:18px 16px;height:244px">'
           '<div style="display:flex;justify-content:space-between;align-items:baseline"><div class="big" style="font-size:36px;color:#FF6FAE">bass</div>'
           '<div style="text-align:right"><span class="ss">cutoff </span><span class="big" style="font-size:24px">62%</span></div></div>'
           f'<div style="margin-top:56px">{R.lanes(326, rows, sel=2)}</div></div></div>')
    layers = ('<div class="g" style="margin-top:14px">' + "".join(key(f'<span class="leg" style="font-size:22px">{i+1}</span>', n, cap="blk" if i == 2 else "", led=c)
              for i, (n, c) in enumerate([("kick", N["fund"]), ("hats", N["fund"]), ("bass", N["prod"]), ("chords", N["lilac"])])) + '</div>')
    knobs = ('<div class="g" style="margin-top:8px">' + knob(CAPC["prod"], "cutoff", .62, 52, wide=True, h=116) + knob(CAPC["grey"], "res", .3, 52, wide=True, h=116)
             + knob(CAPC["navy"], "env", .45, 52, wide=True, h=116) + knob(CAPC["grey"], "glide", .15, 52, wide=True, h=116) + '</div>')
    pads = ('<div class="g" style="margin-top:12px">' + pad("sidechain", N["prod"], h=58) + pad("mute", h=58) + pad("solo", h=58) + pad("shift", h=58) + '</div>')
    return phone("dark", studio_head(0) + scr + layers + knobs + pads, transport())


def studio_mix():
    lv = [(.8, N["fund"], "kick"), (.5, N["fund"], "hats"), (.7, N["prod"], "bass"), (.45, N["lilac"], "chords")]
    meters = "".join(f'<div style="display:flex;flex-direction:column;align-items:center;gap:6px">{m3.meter(10, int(l*10), True, 6).replace("padding:10px", "padding:0;background:none;box-shadow:none")}<span class="ss">{n}</span></div>' for l, c, n in lv)
    scr = (f'<div class="scr" style="margin-top:8px"><div class="scrf" style="padding:14px 22px;height:200px">'
           '<div style="display:flex;justify-content:space-between"><span class="ss">levels</span><span class="ss">master -3 db</span></div>'
           f'<div style="display:flex;justify-content:space-around;margin-top:12px">{meters}</div></div></div>')
    faders = '<div class="g" style="margin-top:14px">' + "".join(fader(n, c, l, 300) for l, c, n in lv) + '</div>'
    ms = '<div class="g" style="margin-top:12px">' + "".join(pad("m · s", None, f"{n} mute and solo", 52) for _, _, n in lv) + '</div>'
    return phone("dark", studio_head(1) + scr + faders + ms, transport())

# ── DJ · decks and mixer ──────────────────────────────────────────────────
def dj_head(sel):
    return ('<div style="display:flex;align-items:center;gap:10px;height:44px"><span class="t22" style="flex:1">dj</span>'
            f'<div style="width:170px">{switch(["decks", "mixer"], sel)}</div></div>')


def dj_scr(h=150):
    return (f'<div class="scr" style="margin-top:8px"><div class="scrf" style="padding:12px 14px;height:{h}px">'
            f'<div style="display:flex;justify-content:space-between"><span class="ss" style="color:{N["fund"]}">a · 124.0</span><span class="ss" style="color:{N["dj"]}">b · 124.0</span></div>'
            f'<div style="margin-top:8px">{M.wave(326, 40, 3, N["fund"], .55)}</div><div style="margin-top:8px">{M.wave(326, 40, 9, N["dj"], .2)}</div></div></div>')


def dj_decks():
    jogs = f'<div style="display:flex;justify-content:space-between;margin-top:30px;padding:0 2px">{M.jog(N["fund"], "a", 168)}{M.jog(N["dj"], "b", 168)}</div>'
    btns = ('<div style="display:flex;justify-content:center;margin-top:26px">' + m3.beatlights(0) + '</div><div class="g" style="margin-top:26px">' + key(I["cue"], "cue a") + key(I["play"], "play a", cap="blk", led=N["fund"]) + key(I["sync"], "sync b") + key(I["play"], "play b", cap="go") + '</div>')
    return phone("dark", dj_head(0) + dj_scr(190) + jogs + btns)


def dj_mixer():
    eq = ('<div class="g" style="margin-top:14px">' + knob(CAPC["grey"], "low a", .4, 52, N["fund"], True, 118) + knob(CAPC["grey"], "filter a", .5, 52, N["fund"], True, 118)
          + knob(CAPC["grey"], "filter b", .65, 52, N["dj"], True, 118) + knob(CAPC["grey"], "low b", 0, 52, N["dj"], True, 118) + '</div>')
    xf = ('<div class="m wide" style="grid-column:span 2;height:250px;flex-direction:column;justify-content:flex-end;padding-bottom:34px">'
          '<div style="position:relative;width:140px;height:28px">'
          + "".join(f'<i style="position:absolute;top:-6px;left:{i*140/8:.0f}px;width:1px;height:5px;background:var(--tick)"></i>' for i in range(9))
          + '<div class="fslot" style="top:11px;left:0;right:0;width:auto;height:6px;margin-left:0"></div>'
          '<div class="fcap" style="top:2px;left:50%;width:26px;height:26px;margin-left:-13px;background:repeating-linear-gradient(90deg,rgba(0,0,0,0) 0 3px,rgba(0,0,0,.10) 3px 4px),linear-gradient(180deg,var(--c1),var(--c0))"><i style="left:12px;right:auto;width:2px;top:4px;height:18px"></i></div></div>'
          '<span class="ml" style="color:var(--ink)">crossfader</span></div>')
    faders = ('<div class="g" style="margin-top:8px;align-items:end">' + fader("vol a", N["fund"], .85, 250) + xf + fader("vol b", N["dj"], .3, 250) + '</div>')
    cues = ('<div class="g" style="margin-top:12px;grid-template-columns:repeat(8,1fr);gap:6px">'
            + "".join(pad(str(i % 4 + 1), c if on else None, f"Hot cue {i%4+1}", 52) for i, (c, on) in enumerate([(N["fund"], 1), (N["fund"], 1), (N["fund"], 0), (N["fund"], 0), (N["dj"], 1), (N["dj"], 0), (N["dj"], 0), (N["dj"], 0)])) + '</div>')
    return phone("dark", dj_head(1) + dj_scr(140) + eq + faders + cues)

# ── MATERIAL STUDY ────────────────────────────────────────────────────────
def material():
    def half(mode):
        return (f'<div class="dev {mode} face" style="flex:1;border-radius:28px;padding:30px 34px;display:flex;flex-direction:column;gap:26px;box-shadow:0 0 0 1px rgba(0,0,0,.08)">'
                f'<div style="display:flex;justify-content:space-between;align-items:baseline"><span class="t36" style="font-size:32px">{mode}</span><span class="t11">light from above · keys 4px tall · caps dished</span></div>'
                '<div style="display:flex;gap:22px;align-items:flex-end">'
                f'<div style="width:120px">{key("<span class=leg style=font-size:40px>1</span>", "key")}</div>'
                f'<div style="width:120px">{key(I["play"], "go", cap="go")}</div>'
                f'<div style="width:120px">{key("<span class=leg style=font-size:40px>2</span>", "next", cap="blk")}</div>'
                f'<div style="width:150px">{knob(CAPC["prod"], "cutoff", .62, 74, N["prod"], wide=True, h=150)}</div>'
                f'<div style="width:96px">{fader("level", N["fund"], .7, 200)}</div></div>'
                '<div style="display:flex;gap:22px;align-items:center">'
                + pad("pad", None, h=90, style="width:120px") + pad("lit", N["prod"], h=90, style="width:120px") + pad("lit", N["fund"], h=90, style="width:120px")
                + f'<div style="width:220px">{switch(["light", "dark", "auto"], 0 if mode=="light" else 1)}</div></div>'
                f'<div class="scr" style="width:560px"><div class="scrf" style="height:150px;padding:18px"><img src="{CAT}" alt="" style="position:absolute;right:18px;top:16px;width:80px"><div class="ss">screen</div><div class="t36" style="margin-top:8px">flush glass</div><div class="ss" style="margin-top:10px">sits in a pocket, catches one reflection</div></div></div>'
                '</div>')
    return f'<div style="width:1500px;height:860px;display:flex;gap:24px;padding:24px;box-sizing:border-box;background:#A9A8A3">{half("light")}{half("dark")}</div>'


HEAD = R.HEAD


def write(name, title, body, w, h):
    with open(os.path.join(OUT, name), "w") as f:
        f.write(HEAD.format(title=title, css=CSS, body=body, w=w, h=h))
    print("wrote", name)


if __name__ == "__main__":
    write("M5Material.dc.html", "Material", material(), 1500, 860)
    write("M5TodayL.dc.html", "Today · light", today("light"), 390, 844)
    write("M5TodayD.dc.html", "Today · dark", today("dark"), 390, 844)
    write("M5World.dc.html", "World", world(), 390, 844)
    write("M5Lesson.dc.html", "Lesson", lesson(), 390, 844)
    write("M5Add.dc.html", "Add to my track", add(), 390, 844)
    write("M5StudioEdit.dc.html", "Studio · edit", studio_edit(), 390, 844)
    write("M5StudioMix.dc.html", "Studio · mix", studio_mix(), 390, 844)
    write("M5DJDecks.dc.html", "DJ · decks", dj_decks(), 390, 844)
    write("M5DJMixer.dc.html", "DJ · mixer", dj_mixer(), 390, 844)
