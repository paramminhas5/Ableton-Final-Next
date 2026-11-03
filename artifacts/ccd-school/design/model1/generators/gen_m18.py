#!/usr/bin/env python3
"""Round 10 · mix, all improvements. Stage: pan across, pitch up and down, size is loudness,
reverb is a halo, clashes get a red ring and a fix. Faders: screen shows the open layer, names on
top, an engraved 0 db line, a master fader. Both: hold to compare, layer row shows mute and solo."""
import os, math
import gen_m6 as V
import gen_m5 as P
import gen_m9 as H
import gen_m11 as K
import gen_m12 as F
import gen_m14 as S
import gen_m15 as Q
import gen_m17 as X

OUT = V.OUT
N, I, CAPC = V.N, V.I, V.CAPC
key, silk, knob = V.key, V.silk, V.knob
phone, scr, tray = H.phone, F.scr, H.tray
GO, MINT, LILAC, BLUE, AMBER, WHITE = N["prod"], N["fund"], N["lilac"], N["dj"], "#F3C14F", "#E9E9E6"
PINK, RED = "#FF6FAE", "#FF4A5A"
L = Q.LAYERS
CSS = X.CSS + r"""
.slot.muted{opacity:.45}
.slot .solo{position:absolute;top:5px;right:5px;width:6px;height:6px;border-radius:3px;background:#7D96FF;box-shadow:0 0 6px #7D96FF}
.unity{position:absolute;left:-3px;right:-3px;height:2px;border-radius:1px;background:var(--ink);opacity:.55;box-shadow:0 1px 0 var(--ehi)}
.sname{font-size:10px;font-weight:600;color:var(--print);text-shadow:0 1px 0 var(--ehi),0 -1px 0 var(--elo);text-align:center;letter-spacing:.02em}
"""


def slots(muted=(), solo=(), active=None):
    out = ""
    for n, c in L:
        on = n == active
        cls = "m wide slot" + (" on" if on else "") + (" muted" if n in muted else "")
        dash_on = (n not in muted)
        out += (f'<a href="#" class="{cls}" style="position:relative">'
                + ('<span class="solo"></span>' if n in solo else "")
                + f'<span class="dash{" on" if dash_on else ""}" style="--c:{c}"></span>{n}</a>')
    for _ in range(8 - len(L)):
        out += f'<a href="#" class="m wide slot empty" aria-label="Add a layer">{V.I["plus"].replace("class=\"i\"", "class=\"s\"")}<span>add</span></a>'
    return f'<div style="display:grid;grid-template-columns:repeat(8,1fr);gap:5px;flex:none;margin-top:8px">{out}</div>'


def fader_unity(frac, h, w, unity=.75):
    th = h - 30
    y = 6 + (1 - unity) * th
    return f'<div style="position:relative">{V.slim_fader(frac, h, w)}<i class="unity" style="top:{y:.0f}px"></i></div>'


# ── STAGE ─────────────────────────────────────────────────────────────────
def stage_area(pos, clash=True, ghost=None):
    dots = ""
    for n, c in L:
        x, y, s, wet = pos[n]
        halo = f"box-shadow:0 0 {10 + wet*40:.0f}px {wet*20:.0f}px {c}{'66' if wet > .3 else '44'};filter:blur({wet*1.4:.1f}px);" if wet > .05 else f"box-shadow:0 0 8px {c}66;"
        sel = n == "bass"
        ring = "outline:2px solid #F3F2EF;outline-offset:3px;" if sel else ""
        dots += (f'<div class="dotl" style="left:{x*100:.0f}%;top:{y*100:.0f}%"><b style="width:{s}px;height:{s}px;background:radial-gradient(circle at 40% 35%,color-mix(in srgb,{c} 40%,#fff),{c} 60%);{halo}{ring}"></b>'
                 f'<span style="color:{c}">{n}</span></div>')
    if ghost:
        for n, c in L:
            if n in ghost:
                x, y, s, wet = ghost[n]
                dots += f'<div class="dotl" style="left:{x*100:.0f}%;top:{y*100:.0f}%"><b style="width:{s}px;height:{s}px;border:1.5px dashed {c};opacity:.6"></b></div>'
    if clash:
        dots += (f'<div style="position:absolute;left:50%;top:76%;width:96px;height:72px;margin:-36px 0 0 -48px;border-radius:50%;border:2px solid {RED};box-shadow:0 0 14px {RED}88"></div>'
                 f'<span style="position:absolute;left:50%;top:76%;margin:30px 0 0 34px;font-size:10px;font-weight:600;color:{RED}">clash</span>')
    grid = "".join(f'<div style="position:absolute;left:0;right:0;top:{y}%;height:1px;background:rgba(255,255,255,.05)"></div>' for y in (25, 50, 75))
    grid += '<div style="position:absolute;top:0;bottom:0;left:50%;width:1px;background:rgba(255,255,255,.08)"></div>'
    snaps = "".join(f'<i style="position:absolute;left:{x}%;{edge}:0;width:2px;height:8px;margin-left:-1px;background:rgba(255,255,255,.35)"></i>' for x in (0.6, 25, 50, 75, 99.4) for edge in ("top", "bottom"))
    lab = ('<span class="ss" style="position:absolute;left:12px;top:12px">high · hats, air</span>'
           '<span class="ss" style="position:absolute;left:12px;bottom:14px">low · kick, bass</span>'
           '<span class="ss" style="position:absolute;left:10px;top:50%;margin-top:-16px">left</span>'
           '<span class="ss" style="position:absolute;right:10px;top:50%;margin-top:-16px">right</span>'
           '<span class="ss" style="position:absolute;right:12px;top:12px">big = loud · haze = reverb</span>')
    return f'<div class="stage" style="flex:1;min-height:0">{grid}{snaps}{lab}{dots}</div>'


POS = {"drums": (.5, .80, 44, 0), "bass": (.53, .74, 40, 0), "chords": (.28, .5, 34, .55), "lead": (.72, .4, 30, .3), "hats": (.64, .18, 24, 0), "fx": (.2, .22, 24, .9)}
POS_FIXED = {**POS, "bass": (.5, .62, 36, 0)}


def stage():
    s = (f'<div style="display:flex;align-items:center;gap:8px"><span style="width:8px;height:8px;border-radius:4px;background:{RED};box-shadow:0 0 6px {RED}"></span>'
         '<span class="t22" style="font-size:20px">drums and bass clash</span></div>'
         '<div class="ss" style="margin-top:8px;color:#C9C9CE">both low, both in the middle, so they blur into each other</div>'
         '<div class="ss" style="margin-top:14px">fix it with a pad below, or drag the bass up and out</div>')
    fix = ('<div style="height:48px;display:flex;flex:none;margin-top:10px">'
           + tray([K.sp("duck the bass", state="dim", c=GO), K.sp("cut the bass lows", state="dim", c=GO)], 2, 1).replace('class="lb"', 'class="lb" style="font-size:13px;bottom:auto;top:50%;transform:translateY(-50%)"') + '</div>')
    items = (Q.header("mix") + slots() + scr(s, 96, "14px 18px", 10) + fix
             + silk("see the mix as", "same mix, two views") + X.mix_views("stage")
             + silk("the stage", "hold the screen to compare") + stage_area(POS))
    return phone("dark", items, Q.transport())


def stage_compare():
    s = ('<div style="display:flex;justify-content:space-between;align-items:center"><span class="t22" style="font-size:20px">before your changes</span>'
         '<span class="ss" style="color:#F3F2EF">holding</span></div>'
         '<div class="ss" style="margin-top:8px;color:#C9C9CE">you are hearing the mix as it was. let go to hear it now</div>'
         '<div class="ss" style="margin-top:14px">dashed rings show where things sit now</div>')
    items = (Q.header("mix") + slots() + scr(s, 96, "14px 18px", 10)
             + silk("see the mix as", "same mix, two views") + X.mix_views("stage")
             + silk("the stage", "let go to come back") + stage_area(POS, clash=True, ghost={"bass": POS_FIXED["bass"]}).replace('class="stage"', 'class="stage" style="flex:1;min-height:0;box-shadow:inset 0 0 0 2px #F3F2EF55,inset 0 4px 12px rgba(0,0,0,.8)"'))
    return phone("dark", items, Q.transport())


def stage_fixed():
    s = ('<div style="display:flex;justify-content:space-between;align-items:flex-start"><div>'
         f'<div class="big" style="font-size:28px;color:{PINK}">bass</div><div class="ss" style="margin-top:6px">out of the kick’s way</div></div>'
         '<div style="text-align:right"><div class="ss">pan · range</div><div class="big" style="font-size:22px;margin-top:2px;white-space:nowrap">c · low mid</div></div></div>'
         f'<div class="ss" style="margin-top:12px;color:{MINT}">no clashes · nice</div>')
    items = (Q.header("mix") + slots() + scr(s, 96, "14px 18px", 10)
             + silk("see the mix as", "same mix, two views") + X.mix_views("stage")
             + silk("the stage", "hold the screen to compare") + stage_area(POS_FIXED, clash=False))
    return phone("dark", items, Q.transport())


# ── FADERS ────────────────────────────────────────────────────────────────
def faders():
    eq = S.eq_svg(PINK, w=322, h=40)
    pump = R_duck = __import__("gen_m16").duck_svg(.6, w=322, h=30)
    s = (f'<div style="display:flex;justify-content:space-between;align-items:baseline"><span class="big" style="font-size:24px;color:{PINK}">bass</span>'
         '<span class="ss">duck <span class="big" style="font-size:24px;color:#F3F2EF;margin-left:6px">60%</span></span></div>'
         f'<div style="margin-top:4px">{eq}</div><div style="margin-top:2px">{pump}</div>')
    lv = [.8, .5, .7, .45, .6, .3]
    cols = []
    for i, (n, c) in enumerate(L):
        muted = n == "fx"
        if n == "bass":
            kn = "".join(f'<div style="display:flex;flex-direction:column;align-items:center;gap:3px">{V.mini_knob(CAPC["prod"] if k == "duck" else CAPC["grey"], v, 24)}<span class="eng" style="font-size:9px;{"color:var(--ink);font-weight:600" if k == "duck" else ""}">{k}</span></div>'
                         for k, v in (("pan", .5), ("send", .2), ("duck", .6)))
            cols.append(f'<div class="m wide" style="height:100%;flex-direction:column;justify-content:flex-start;align-items:stretch;padding:10px 10px 10px;border-radius:12px;gap:10px">'
                        f'<div style="display:flex;align-items:center;gap:6px"><span class="dash on" style="--c:{c};width:14px"></span><span class="sname" style="font-size:12px;color:var(--ink);flex:1;text-align:left">bass</span>'
                        f'<a href="#" aria-label="Close" style="color:var(--sub);display:flex">{I["close"].replace("class=\"i\"", "class=\"s\"")}</a></div>'
                        f'<div style="display:flex;gap:10px;flex:1;min-height:0">'
                        f'<div style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end">{fader_unity(lv[i], 210, 32)}</div>'
                        f'<div style="flex:1;display:flex;flex-direction:column;justify-content:space-between;align-items:center;padding:6px 0">{kn}</div></div>'
                        f'<div style="display:flex;gap:5px;justify-content:center">' + "".join(f'<span class="sp mini" style="width:40px;height:24px;font-size:10px">{t}</span>' for t in ("mute", "solo")) + '</div></div>')
        else:
            cols.append(f'<a href="#" class="m wide" aria-label="Open {n}" style="height:100%;flex-direction:column;justify-content:space-between;padding:10px 0 10px;border-radius:10px;text-decoration:none">'
                        f'<div style="display:flex;flex-direction:column;align-items:center;gap:5px"><span class="dash{" on" if not muted else ""}" style="--c:{c};width:12px"></span><span class="sname" style="{"opacity:.5" if muted else ""}">{n}</span></div>'
                        f'{fader_unity(lv[i], 230, 24)}'
                        f'<div style="display:flex;flex-direction:column;gap:3px;width:26px">'
                        + "".join(f'<span class="sp mini{" lit" if (t == "m" and muted) else ""}" style="--c:{AMBER};height:20px;font-size:9px">{t}</span>' for t in ("m", "s"))
                        + '</div></a>')
    master = (f'<div class="m wide" style="height:100%;flex-direction:column;justify-content:space-between;padding:10px 0 10px;border-radius:10px">'
              f'<div style="display:flex;flex-direction:column;align-items:center;gap:5px"><span class="dot on" style="--c:{AMBER};position:static;margin:0"></span><span class="sname">out</span></div>'
              f'{fader_unity(.72, 230, 30)}<span class="sname" style="font-size:9px">−1 db</span></div>')
    surface = f'<div style="flex:1;min-height:0;display:grid;grid-template-columns:1fr 1fr 3.2fr 1fr 1fr 1fr 1.15fr;gap:5px">{"".join(cols)}{master}</div>'
    items = (Q.header("mix") + slots(muted=("fx",), solo=()) + scr(s, 96, "14px 18px", 10)
             + silk("see the mix as", "same mix, two views") + X.mix_views("faders")
             + silk("layers", "the line on each fader is 0 db") + surface)
    return phone("dark", items, Q.transport())


def write(name, title, body):
    with open(os.path.join(OUT, name), "w") as f:
        f.write(P.HEAD.format(title=title, css=CSS, body=body, w=390, h=844))
    print("wrote", name)


SCREENS = [("V10Stage", "stage · a clash, and the fix", stage), ("V10StageFixed", "stage · after the fix", stage_fixed),
           ("V10StageCompare", "stage · holding to compare", stage_compare), ("V10Faders", "faders · bass open, master, 0 db line", faders)]

if __name__ == "__main__":
    for n, t, fn in SCREENS:
        write(f"{n}.dc.html", t, fn())
