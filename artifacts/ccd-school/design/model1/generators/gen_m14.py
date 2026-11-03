#!/usr/bin/env python3
"""Round 6. Every layer carries the moves you use most: a knob bank switch (sound, eq, fx)
and quick toggles (sidechain, mute, solo). Mix moves into the layer row; + lives in mix."""
import os, math
import gen_m6 as V
import gen_m5 as P
import gen_m7 as L
import gen_m8 as G
import gen_m9 as H
import gen_m11 as K
import gen_m12 as F
import gen_m13 as M

OUT = V.OUT
N, I, CAPC = V.N, V.I, V.CAPC
key, silk, knob = V.key, V.silk, V.knob
tray, phone, scr, sp = H.tray, H.phone, F.scr, K.sp
GO, MINT, LILAC, BLUE, AMBER = N["prod"], N["fund"], N["lilac"], N["dj"], "#F3C14F"

EXTRA = r"""
.bank{display:flex;height:30px;border-radius:15px;background:var(--well);box-shadow:inset 0 3px 6px var(--shA),0 1px 0 var(--hi);padding:3px;box-sizing:border-box;flex:none}
.bank span{flex:1;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:500;color:var(--sub);border-radius:12px}
.bank span.on{color:var(--ink);background:linear-gradient(180deg,var(--c1),var(--c0));box-shadow:inset 0 1.5px 0 var(--hi),0 1px 0 var(--cs1),0 2px 0 var(--cs2),0 4px 5px -1px var(--shA)}
.tg2{height:40px;flex:none}
.tg2 .sp .lb{font-size:12px;bottom:auto;top:50%;transform:translateY(-50%);left:0;right:0;text-align:center}
.mini{height:26px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600}
"""
CSS = M.CSS + EXTRA

LAYERS = [("drums", MINT), ("hats", AMBER), ("bass", GO), ("chords", LILAC)]


def layer_row(active):
    cells = "".join(f'<a href="#" class="m wide lyr{" on" if n == active else ""}" aria-pressed="{str(n == active).lower()}">'
                    f'<span class="dash{" on" if n == active else ""}" style="--c:{c}"></span>{n}</a>' for n, c in LAYERS)
    on = active == "mix"
    mix = (f'<a href="#" class="m wide lyr{" on" if on else ""}" aria-pressed="{str(on).lower()}">'
           f'<span class="dash{" on" if on else ""}" style="--c:#F4F3F0"></span>mix</a>')
    return f'<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:7px;flex:none">{cells}{mix}</div>'


def bank(active, opts=("sound", "eq", "fx")):
    return '<div class="bank" role="radiogroup">' + "".join(f'<span class="{"on" if o == active else ""}" role="radio" aria-checked="{str(o == active).lower()}">{o}</span>' for o in opts) + '</div>'


def toggles(col, sc=True, mute=False, solo=False):
    cells = [sp("sidechain", state="lit" if sc else "", c=col), sp("mute", state="lit" if mute else "", c=AMBER), sp("solo", state="lit" if solo else "", c=BLUE)]
    return '<div class="tg2" style="display:flex">' + tray(cells, 3, 1).replace("flex:1;min-height:0", "flex:1") + '</div>'


def eq_svg(col, lo=.5, mid=.35, hi=.62, w=322, h=52):
    def g(v): return (v - .5) * 2
    pts = []
    for x in range(0, w + 1, 4):
        t = x / w
        y = (g(lo) * math.exp(-((t - .12) / .14) ** 2) + g(mid) * math.exp(-((t - .5) / .14) ** 2) + g(hi) * math.exp(-((t - .86) / .14) ** 2))
        pts.append(f"{x} {h/2 - y*h*.38:.1f}")
    d = "M" + " L".join(pts)
    handles = "".join(f'<circle cx="{w*t:.0f}" cy="{h/2 - g(v)*h*.38:.1f}" r="5" fill="#0A0A0B" stroke="{col if i == 1 else "#F3F2EF"}" stroke-width="1.8"/>' for i, (t, v) in enumerate(((.12, lo), (.5, mid), (.86, hi))))
    return (f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" aria-hidden="true" style="display:block">'
            f'<path d="M0 {h/2}H{w}" stroke="#2A2A2E" stroke-dasharray="3 4"/><path d="{d}" fill="none" stroke="{col}" stroke-width="2"/>{handles}</svg>')


def frame(layer, col, bank_on, knobs, screen_html, view, surface, sc=True, views=("steps", "keys", "pads")):
    head = ('<div style="display:flex;align-items:center;gap:10px;height:34px;flex:none">'
            f'<a href="#" aria-label="Back" style="color:var(--ink);display:flex">{I["back"]}</a><span class="t22" style="flex:1">studio</span>'
            f'<span class="tag">120 bpm</span><span class="tag">a minor</span></div>')
    transport = ('<div class="g" style="position:absolute;left:16px;right:16px;bottom:24px;grid-template-columns:2fr 1fr 1fr 1fr">'
                 + f'<a href="#" class="m wide" aria-label="Play"><span class="cap go pill" style="width:88%;height:56%;gap:8px;font-size:15px;font-weight:500;margin-top:-12px">{I["play"]}play</span></a>'
                 + key(G.IC["rec"], "rec") + key(G.IC["undo"], "undo") + key(I["out"], "to live") + '</div>')
    caps = [col, CAPC["grey"], CAPC["navy"], CAPC["grey"]]
    kn = '<div class="g" style="margin-top:10px;flex:none">' + "".join(knob(caps[i], n, v, 34) for i, (n, v) in enumerate(knobs)) + '</div>'
    vs = ('<div style="display:grid;grid-template-columns:repeat(' + str(len(views)) + ',1fr);gap:8px;flex:none;margin-top:10px">' + "".join(
        f'<a href="#" class="m wide vk{" on" if v == view else ""}" style="height:38px"><span class="dot{" on" if v == view else ""}" style="--c:#F4F3F0"></span>{v}</a>' for v in views) + '</div>')
    items = (head + '<div style="height:6px;flex:none"></div>' + layer_row(layer) + scr(screen_html, 120, "14px 18px", 12)
             + '<div class="seam" style="margin-top:14px"></div><div style="height:12px;flex:none"></div>'
             + bank(bank_on) + kn + '<div style="height:10px;flex:none"></div>' + toggles(col, sc) + vs + '<div style="height:10px;flex:none"></div>' + surface)
    return phone("dark", items, transport)


def head_line(layer, col, right_label, right_val, note, tags=""):
    return ('<div style="display:flex;justify-content:space-between;align-items:flex-start"><div>'
            f'<div style="display:flex;align-items:center;gap:8px"><span class="big" style="font-size:28px;color:{col}">{layer}</span>{tags}</div>'
            f'<div class="ss" style="margin-top:5px">{note}</div></div>'
            f'<div style="text-align:right"><div class="ss">{right_label}</div><div class="big" style="font-size:28px;margin-top:2px">{right_val}</div></div></div>')


def sc_tag(col):
    return f'<span style="font-size:10px;font-weight:600;color:{col};border:1px solid {col};border-radius:5px;padding:1px 5px">sc</span>'


# 1 · bass, keys, sound bank
def bass_sound():
    params = [("cutoff", .62), ("res", .30), ("env", .45), ("glide", .15)]
    bars = "".join(f'<div style="flex:1"><div class="ss" style="display:flex;justify-content:space-between"><span>{n}</span><span style="color:#F3F2EF">{int(v*100)}</span></div>'
                   f'<div style="height:3px;border-radius:2px;background:#1E1E21;margin-top:6px"><div style="width:{v*100:.0f}%;height:100%;border-radius:2px;background:{GO if n == "cutoff" else "#6E6E74"}"></div></div></div>' for n, v in params)
    s = head_line("bass", "#FF6FAE", "cutoff", "62", "sound · ducks under the kick", sc_tag("#FF6FAE")) + f'<div style="display:flex;gap:14px;margin-top:16px">{bars}</div>'
    kb = K.keys(hit=2).replace("margin-top:18px", "margin-top:12px")
    return frame("bass", "#FF6FAE", "sound", params, s, "keys", kb)


# 2 · bass, pads, eq bank
def bass_eq():
    s = head_line("bass", "#FF6FAE", "mid", "-3 db", "eq · a dip in the mids makes room for chords", sc_tag("#FF6FAE")) + f'<div style="margin-top:8px">{eq_svg("#FF6FAE")}</div>'
    pads = M.bass_pads()
    surf = pads[pads.index('<div class="tray"'):]
    surf = surf[:surf.index('</a></div>') + len('</a></div>')]
    return frame("bass", "#FF6FAE", "eq", [("low", .5), ("mid", .35), ("high", .62), ("gain", .5)], s, "pads", surf)


# 3 · drums, pads, fx bank
def drum_fx():
    filt = ('<svg width="322" height="56" viewBox="0 0 322 56" aria-hidden="true" style="display:block">'
            '<path d="M0 14H170C196 14 200 6 212 6S230 34 250 46 290 54 322 55" fill="none" stroke="' + MINT + '" stroke-width="2"/>'
            '<path d="M0 55H322" stroke="#2A2A2E"/></svg>')
    sends = "".join(f'<span class="ss" style="display:flex;align-items:center;gap:6px">{n}<span style="width:44px;height:3px;border-radius:2px;background:#1E1E21;position:relative"><span style="position:absolute;left:0;top:0;bottom:0;width:{v*100:.0f}%;border-radius:2px;background:{MINT if n == "filter" else "#6E6E74"}"></span></span></span>' for n, v in (("filter", .66), ("reverb", .25), ("delay", .1), ("drive", .3)))
    s = head_line("drums", MINT, "filter", "66", "fx · sweep the filter before the drop") + f'<div style="margin-top:6px">{filt}</div>'
    pads = M.drum_pads()
    surf = pads[pads.index('<div class="tray"'):]
    surf = surf[:surf.index('</a></div>') + len('</a></div>')]
    return frame("drums", MINT, "fx", [("filter", .66), ("reverb", .25), ("delay", .1), ("drive", .3)], s, "pads", surf, sc=False)


# 4 · mix: every layer as a strip, + lives here
def mix():
    head = ('<div style="display:flex;align-items:center;gap:10px;height:34px;flex:none">'
            f'<a href="#" aria-label="Back" style="color:var(--ink);display:flex">{I["back"]}</a><span class="t22" style="flex:1">studio</span>'
            f'<span class="tag">120 bpm</span><span class="tag">a minor</span></div>')
    rows = [("drums", MINT, .8, .7), ("hats", AMBER, .5, .4), ("bass", GO, .7, .6), ("chords", LILAC, .45, .35)]
    meters = "".join(f'<div style="display:flex;align-items:center;gap:10px;margin-top:8px"><span class="ss" style="width:46px;color:{c}">{n}</span>{H.led_bar(int(m*12), 12, c, 210)}</div>' for n, c, lv, m in rows).replace("margin-top:8px","margin-top:7px")
    s = ('<div style="display:flex;justify-content:space-between"><span class="ss">mix · 4 layers</span><span class="ss">bass ducks under drums</span></div>' + meters)
    bank_html = bank("filter", ("level", "filter", "low", "reverb"))
    kn = '<div class="g" style="margin-top:10px;flex:none">' + "".join(knob(c, n, v, 34) for n, c, v in (("drums", CAPC["fund"], .5), ("hats", CAPC["grey"], .7), ("bass", CAPC["prod"], .4), ("chords", CAPC["lilac"], .55))) + '</div>'
    strips = ""
    for i, (n, c, lv, m) in enumerate(rows):
        sc_on = n == "bass"
        strips += (f'<div class="m wide" style="height:100%;flex-direction:column;justify-content:space-between;padding:12px 8px 10px;gap:6px">'
                   f'<span class="dash on" style="--c:{c}"></span>{V.slim_fader(lv, 168, 40)}'
                   f'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:3px;width:100%">'
                   + "".join(f'<span class="sp mini{" lit" if (t == "sc" and sc_on) else ""}" style="--c:{GO}">{t}</span>' for t in ("sc", "m", "s"))
                   + f'</div><span class="eng" style="font-size:11px">{n}</span></div>')
    surface = f'<div style="flex:1;min-height:0;display:grid;grid-template-columns:repeat(4,1fr) 44px;gap:8px">{strips}<a href="#" class="m wide" aria-label="Add a layer" style="height:100%;flex-direction:column;gap:8px"><span class="cap" style="width:34px">{I["plus"]}</span><span class="eng" style="font-size:10px">layer</span></a></div>'
    transport = ('<div class="g" style="position:absolute;left:16px;right:16px;bottom:24px;grid-template-columns:2fr 1fr 1fr 1fr">'
                 + f'<a href="#" class="m wide" aria-label="Play"><span class="cap go pill" style="width:88%;height:56%;gap:8px;font-size:15px;font-weight:500;margin-top:-12px">{I["play"]}play</span></a>'
                 + key(G.IC["rec"], "rec") + key(G.IC["undo"], "undo") + key(I["out"], "to live") + '</div>')
    items = (head + '<div style="height:6px;flex:none"></div>' + layer_row("mix") + scr(s, 120, "14px 18px", 12)
             + '<div class="seam" style="margin-top:14px"></div><div style="height:12px;flex:none"></div>' + bank_html + kn
             + '<div style="height:12px;flex:none"></div>' + surface)
    return phone("dark", items, transport)


def write(name, title, body):
    with open(os.path.join(OUT, name), "w") as f:
        f.write(P.HEAD.format(title=title, css=CSS, body=body, w=390, h=844))
    print("wrote", name)


SCREENS = [("V6BassSound", "bass · sound knobs, sidechain on", bass_sound), ("V6BassEQ", "bass · eq knobs, on pads", bass_eq),
           ("V6DrumFX", "drums · fx knobs, on pads", drum_fx), ("V6Mix", "mix · every layer, + lives here", mix)]

if __name__ == "__main__":
    for n, t, fn in SCREENS:
        write(f"{n}.dc.html", t, fn())
