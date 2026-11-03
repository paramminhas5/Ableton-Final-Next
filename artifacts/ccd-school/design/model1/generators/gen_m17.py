#!/usr/bin/env python3
"""Round 9 · mix. Two ways to see the same mix: faders (a console) and stage (where each layer
sits). Tap any layer and its strip opens wide right there, with its eq, pan, send and duck."""
import os, math
import gen_m6 as V
import gen_m5 as P
import gen_m9 as H
import gen_m11 as K
import gen_m12 as F
import gen_m14 as S
import gen_m15 as Q
import gen_m16 as R

OUT = V.OUT
N, I, CAPC = V.N, V.I, V.CAPC
key, silk, knob = V.key, V.silk, V.knob
phone, scr, sp = H.phone, F.scr, K.sp
GO, MINT, LILAC, BLUE, AMBER = N["prod"], N["fund"], N["lilac"], N["dj"], "#F3C14F"
PINK = "#FF6FAE"
L = Q.LAYERS
CSS = R.CSS + r"""
.stage{position:relative;border-radius:16px;background:radial-gradient(90% 70% at 50% 100%,#17171A,#09090A 75%);box-shadow:inset 0 4px 12px rgba(0,0,0,.8),inset 0 0 0 1px rgba(255,255,255,.04),0 1px 0 var(--hi);overflow:hidden}
.dotl{position:absolute;display:flex;flex-direction:column;align-items:center;gap:5px;transform:translate(-50%,-50%)}
.dotl b{display:block;border-radius:50%}
.dotl span{font-size:10px;font-weight:600}
"""


def mix_views(active):
    return ('<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;flex:none">' + "".join(
        f'<a href="#" class="m wide vk{" on" if v == active else ""}" style="height:36px"><span class="dot{" on" if v == active else ""}" style="--c:#F4F3F0"></span>{v}</a>' for v in ("faders", "stage")) + '</div>')


def meters_screen(note_r):
    meters = "".join(f'<div style="display:flex;flex-direction:column;align-items:center;gap:5px;flex:1">'
                     f'<div style="display:flex;flex-direction:column-reverse;gap:2px">' + "".join(
                         f'<span style="width:16px;height:4px;border-radius:1px;background:{c if i < m else "color-mix(in srgb," + c + " 14%,#0E0E10)"};{"box-shadow:0 0 4px " + c if i < m else ""}"></span>' for i in range(10))
                     + f'</div><span class="ss" style="font-size:9px;color:{c}">{n}</span></div>'
                     for (n, c), m in zip(L + [("", "#3A3A40"), ("", "#3A3A40")], [8, 5, 7, 4, 6, 2, 0, 0]))
    return f'<div style="display:flex;justify-content:space-between"><span class="ss">the whole track</span><span class="ss">{note_r}</span></div><div style="display:flex;margin-top:10px">{meters}</div>'


def faders_expanded():
    lv = [.8, .5, .7, .45, .6, .3]
    cols = []
    for i, (n, c) in enumerate(L):
        if n == "bass":
            eq = S.eq_svg(PINK, w=118, h=34)
            kn = "".join(f'<div style="display:flex;flex-direction:column;align-items:center;gap:3px">{V.mini_knob(CAPC["prod"] if k == "duck" else CAPC["grey"], v, 22)}<span class="eng" style="font-size:9px">{k}</span></div>'
                         for k, v in (("pan", .5), ("send", .2), ("duck", .6)))
            cols.append(f'<div class="m wide" style="height:100%;flex-direction:column;justify-content:flex-start;align-items:stretch;padding:10px 10px 8px;border-radius:12px;gap:8px">'
                        f'<div style="display:flex;align-items:center;gap:6px"><span class="dash on" style="--c:{c};width:14px"></span><span style="font-size:12px;font-weight:600;flex:1">bass</span>'
                        f'<a href="#" aria-label="Close" style="color:var(--sub);display:flex">{I["close"].replace("class=\"i\"", "class=\"s\"")}</a></div>'
                        f'<div class="rib" style="padding:6px 0 4px;display:flex;justify-content:center">{eq}</div>'
                        f'<div style="display:flex;gap:8px;flex:1;min-height:0">'
                        f'<div style="display:flex;flex-direction:column;align-items:center;justify-content:space-between">{V.slim_fader(lv[i], 180, 30)}</div>'
                        f'<div style="flex:1;display:flex;flex-direction:column;justify-content:space-between;align-items:center">{kn}'
                        f'<div style="display:flex;gap:4px">' + "".join(f'<span class="sp mini" style="width:24px;height:22px;font-size:10px">{t}</span>' for t in ("m", "s")) + '</div></div></div>'
                        f'<span class="eng" style="font-size:9px;text-align:center">ducks under drums</span></div>')
        else:
            cols.append(f'<a href="#" class="m wide" aria-label="Open {n}" style="height:100%;flex-direction:column;justify-content:space-between;padding:10px 0 8px;border-radius:10px;text-decoration:none">'
                        f'<span class="dash on" style="--c:{c};width:12px"></span>{V.slim_fader(lv[i], 250, 24)}'
                        f'<div style="display:flex;flex-direction:column;gap:3px;width:24px">'
                        + "".join(f'<span class="sp mini" style="height:20px;font-size:9px">{t}</span>' for t in ("m", "s"))
                        + f'</div><span class="eng" style="font-size:8px">{n}</span></a>')
    cols.append(f'<a href="#" class="m wide" aria-label="Add a layer" style="height:100%;flex-direction:column;gap:6px;border-radius:10px;opacity:.8"><span class="cap" style="width:22px">{V.I["plus"].replace("class=\"i\"", "class=\"s\"")}</span></a>')
    surface = f'<div style="flex:1;min-height:0;display:grid;grid-template-columns:1fr 1fr 3.6fr 1fr 1fr 1fr .8fr;gap:5px">{"".join(cols)}</div>'
    items = (Q.header("mix") + scr(meters_screen("bass is open"), 96, "14px 18px", 10)
             + silk("see the mix as", "same mix, two views") + mix_views("faders")
             + silk("tap a layer to open it", "close to go back") + surface)
    return phone("dark", items, Q.transport())


def stage():
    W, Hh = 358, 352
    # x = pan (left to right), y = level (front = loud, bottom), size = how much space it takes
    pos = {"drums": (.5, .80, 46), "hats": (.68, .42, 26), "bass": (.5, .62, 40), "chords": (.26, .48, 36), "lead": (.74, .58, 32), "fx": (.18, .22, 24)}
    dots = ""
    for n, c in L:
        x, y, s = pos[n]
        sel = n == "bass"
        ring = f"box-shadow:0 0 0 2px #F3F2EF,0 0 18px {c};" if sel else f"box-shadow:0 0 12px {c}88;"
        dots += (f'<div class="dotl" style="left:{x*100:.0f}%;top:{y*100:.0f}%"><b style="width:{s}px;height:{s}px;background:radial-gradient(circle at 40% 35%,color-mix(in srgb,{c} 40%,#fff),{c} 60%);{ring}"></b>'
                 f'<span style="color:{c}">{n}</span></div>')
    grid = "".join(f'<div style="position:absolute;left:0;right:0;top:{y}%;height:1px;background:rgba(255,255,255,.05)"></div>' for y in (25, 50, 75))
    grid += '<div style="position:absolute;top:0;bottom:0;left:50%;width:1px;background:rgba(255,255,255,.07)"></div>'
    lab = ('<span class="ss" style="position:absolute;left:12px;top:10px">back · quiet</span>'
           '<span class="ss" style="position:absolute;left:12px;bottom:10px">front · loud</span>'
           '<span class="ss" style="position:absolute;left:12px;top:50%">left</span>'
           '<span class="ss" style="position:absolute;right:12px;top:50%">right</span>')
    st = f'<div class="stage" style="flex:1;min-height:0">{grid}{lab}{dots}</div>'
    readout = (f'<div style="display:flex;justify-content:space-between;align-items:flex-start"><div><div class="big" style="font-size:28px;color:{PINK}">bass</div>'
               '<div class="ss" style="margin-top:6px">drag a layer: sideways pans it, up and down sets how loud</div></div>'
               '<div style="text-align:right"><div class="ss">pan · level</div><div class="big" style="font-size:26px;margin-top:2px;white-space:nowrap">c · −4 db</div></div></div>'
               '<div class="ss" style="margin-top:12px">bigger dots take more space · two dots on top of each other will clash</div>')
    items = (Q.header("mix") + scr(readout, 96, "14px 18px", 10)
             + silk("see the mix as", "same mix, two views") + mix_views("stage")
             + silk("the stage", "drag to move, tap to open") + st)
    return phone("dark", items, Q.transport())


def write(name, title, body):
    with open(os.path.join(OUT, name), "w") as f:
        f.write(P.HEAD.format(title=title, css=CSS, body=body, w=390, h=844))
    print("wrote", name)


if __name__ == "__main__":
    write("V9MixFaders.dc.html", "mix · faders, bass opened wide", faders_expanded())
    write("V9MixStage.dc.html", "mix · stage, where each layer sits", stage())
