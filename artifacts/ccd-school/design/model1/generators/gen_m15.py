#!/usr/bin/env python3
"""Round 7. Studio as one instrument with two modes.
PLAY: pick a layer (up to 8), pick how to play it, play, then shape it. The shape bank includes
the layer's own mix (level, pan, send, duck) with mute and solo, so every layer carries its mix.
MIX: all 8 layers side by side, the same channel strips seen at once."""
import os, math
import gen_m6 as V
import gen_m5 as P
import gen_m7 as L
import gen_m8 as G
import gen_m9 as H
import gen_m11 as K
import gen_m12 as F
import gen_m13 as M
import gen_m14 as S

OUT = V.OUT
N, I, CAPC = V.N, V.I, V.CAPC
key, silk, knob = V.key, V.silk, V.knob
tray, phone, scr, sp = H.tray, H.phone, F.scr, K.sp
GO, MINT, LILAC, BLUE, AMBER, WHITE = N["prod"], N["fund"], N["lilac"], N["dj"], "#F3C14F", "#E9E9E6"

EXTRA = r"""
.slot{height:50px;border-radius:11px;flex-direction:column;justify-content:center;gap:6px;font-size:10px;font-weight:500;color:var(--sub);padding:0}
.slot.on{color:var(--ink);font-weight:600}
.slot .dash{width:16px}
.slot.empty{color:var(--print);opacity:.75}
.mode{display:flex;height:34px;width:150px;border-radius:17px;background:var(--well);box-shadow:inset 0 3px 6px var(--shA),0 1px 0 var(--hi);padding:3px;box-sizing:border-box}
.mode span{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;font-size:13px;font-weight:500;color:var(--sub);border-radius:14px}
.mode span.on{color:var(--ink);font-weight:600;background:linear-gradient(180deg,var(--c1),var(--c0));box-shadow:inset 0 1.5px 0 var(--hi),0 1px 0 var(--cs1),0 2px 0 var(--cs2),0 4px 5px -1px var(--shA)}
.ms{width:34px;height:30px;border-radius:9px;flex:none;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600}
"""
CSS = S.CSS + EXTRA

LAYERS = [("drums", MINT), ("hats", AMBER), ("bass", GO), ("chords", LILAC), ("lead", BLUE), ("fx", WHITE)]


def header(mode):
    sw = f'<div class="mode" role="radiogroup"><span class="{"on" if mode == "play" else ""}">play</span><span class="{"on" if mode == "mix" else ""}">mix</span></div>'
    return ('<div style="display:flex;align-items:center;gap:12px;height:38px;flex:none">'
            f'<a href="#" aria-label="Back" style="color:var(--ink);display:flex">{I["back"]}</a>{sw}<span style="flex:1"></span>'
            '<span class="tag">120 bpm</span><span class="tag">a minor</span></div>')


def slots(active):
    out = ""
    for n, c in LAYERS:
        on = n == active
        out += (f'<a href="#" class="m wide slot{" on" if on else ""}" aria-pressed="{str(on).lower()}">'
                f'<span class="dash{" on" if on else ""}" style="--c:{c}"></span>{n}</a>')
    for _ in range(8 - len(LAYERS)):
        out += f'<a href="#" class="m wide slot empty" aria-label="Add a layer">{V.I["plus"].replace("class=\"i\"", "class=\"s\"")}<span>add</span></a>'
    return f'<div style="display:grid;grid-template-columns:repeat(8,1fr);gap:5px;flex:none;margin-top:8px">{out}</div>'


def transport():
    return ('<div class="g" style="position:absolute;left:16px;right:16px;bottom:24px;grid-template-columns:2fr 1fr 1fr 1fr">'
            + f'<a href="#" class="m wide" aria-label="Play"><span class="cap go pill" style="width:88%;height:56%;gap:8px;font-size:15px;font-weight:500;margin-top:-12px">{I["play"]}play</span></a>'
            + key(G.IC["rec"], "rec") + key(G.IC["undo"], "undo") + key(I["out"], "to live") + '</div>')


def step_label(n, text, right=""):
    r = f'<span style="margin-left:auto">{right}</span>' if right else ""
    return (f'<div style="display:flex;align-items:center;gap:8px;margin:12px 2px 8px;flex:none" class="eng">'
            f'<span style="width:16px;height:16px;border-radius:8px;border:1px solid var(--print);display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:600">{n}</span>'
            f'<span style="font-size:11px;font-weight:500;letter-spacing:.04em">{text}</span>{r}</div>')


def views(active):
    return ('<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;flex:none">' + "".join(
        f'<a href="#" class="m wide vk{" on" if v == active else ""}" style="height:36px"><span class="dot{" on" if v == active else ""}" style="--c:#F4F3F0"></span>{v}</a>' for v in ("steps", "keys", "pads")) + '</div>')


def shape(bank_on, knobs, col, muted=False, solo=False):
    bk = S.bank(bank_on, ("sound", "eq", "fx", "mix")).replace('class="bank"', 'class="bank" style="flex:1"')
    ms = (f'<span class="sp ms{" lit" if muted else ""}" style="--c:{AMBER}">m</span>'
          f'<span class="sp ms{" lit" if solo else ""}" style="--c:{BLUE}">s</span>')
    caps = [col, CAPC["grey"], CAPC["navy"], CAPC["grey"]]
    kn = '<div class="g" style="margin-top:8px;flex:none">' + "".join(knob(caps[i], n, v, 32) for i, (n, v) in enumerate(knobs)) + '</div>'
    return f'<div style="display:flex;gap:6px;align-items:center;flex:none">{bk}{ms}</div>' + kn


def play(layer, col, view, surface, screen_html, bank_on, knobs):
    items = (header("play") + slots(layer) + scr(screen_html, 92, "14px 18px", 10)
             + step_label(1, f"play {layer} on") + views(view) + '<div style="height:8px;flex:none"></div>' + surface
             + step_label(2, f"shape {layer}", "turn after you play") + shape(bank_on, knobs, col))
    return phone("dark", items, transport())


def scr_line(layer, col, label, val, note, extra=""):
    return ('<div style="display:flex;justify-content:space-between;align-items:flex-start"><div>'
            f'<div style="display:flex;align-items:center;gap:8px"><span class="big" style="font-size:28px;color:{col}">{layer}</span>{extra}</div>'
            f'<div class="ss" style="margin-top:6px">{note}</div></div>'
            f'<div style="text-align:right"><div class="ss">{label}</div><div class="big" style="font-size:28px;margin-top:2px">{val}</div></div></div>')


def cut(html):
    s = html[html.index('<div class="tray"'):]
    return s[:s.index('</a></div>') + len('</a></div>')]


# 1 · bass on keys, sound
def bass_keys():
    s = scr_line("bass", "#FF6FAE", "note", "e2", "layer 3 of 6 · the line you played", S.sc_tag("#FF6FAE"))
    s += '<div class="ss" style="margin-top:12px;display:flex;justify-content:space-between"><span>cutoff 62 · res 30 · env 45 · glide 15</span><span>ducks under drums</span></div>'
    kb = K.keys(hit=2).replace("margin-top:18px", "margin-top:16px")
    return play("bass", "#FF6FAE", "keys", kb, s, "sound", [("cutoff", .62), ("res", .3), ("env", .45), ("glide", .15)])


# 2 · drums on pads, the layer's own mix
def drums_mix():
    s = scr_line("drums", MINT, "level", "-2 db", "layer 1 · this layer's own mix")
    s += ('<div style="display:flex;gap:14px;margin-top:12px">' + "".join(
        f'<div style="flex:1"><div class="ss" style="display:flex;justify-content:space-between"><span>{n}</span><span style="color:#F3F2EF">{v}</span></div>'
        f'<div style="height:3px;border-radius:2px;background:#1E1E21;margin-top:5px"><div style="width:{w}%;height:100%;border-radius:2px;background:{MINT if n == "level" else "#6E6E74"}"></div></div></div>'
        for n, v, w in (("level", "-2", 80), ("pan", "c", 50), ("send", "20", 20), ("duck", "off", 0))) + '</div>')
    pads = cut(M.drum_pads())
    return play("drums", MINT, "pads", pads, s, "mix", [("level", .8), ("pan", .5), ("send", .2), ("duck", 0)])


# 3 · bass on pads, eq
def bass_eq():
    s = scr_line("bass", "#FF6FAE", "mid", "-3 db", "eq · room for the chords", S.sc_tag("#FF6FAE")) + f'<div style="margin-top:4px">{S.eq_svg("#FF6FAE", h=40)}</div>'
    pads = cut(M.bass_pads())
    return play("bass", "#FF6FAE", "pads", pads, s, "eq", [("low", .5), ("mid", .35), ("high", .62), ("gain", .5)])


# 4 · mix: up to 8 layers at once
def mix():
    meters = "".join(f'<div style="display:flex;flex-direction:column;align-items:center;gap:5px;flex:1">'
                     f'<div style="display:flex;flex-direction:column-reverse;gap:2px">' + "".join(
                         f'<span style="width:16px;height:4px;border-radius:1px;background:{c if i < m else "color-mix(in srgb," + c + " 14%,#0E0E10)"};{"box-shadow:0 0 4px " + c if i < m else ""}"></span>' for i in range(10))
                     + f'</div><span class="ss" style="font-size:9px;color:{c}">{n}</span></div>'
                     for (n, c), m in zip(LAYERS + [("", "#3A3A40"), ("", "#3A3A40")], [8, 5, 7, 4, 6, 2, 0, 0]))
    s = f'<div style="display:flex;justify-content:space-between"><span class="ss">mix · 6 of 8 layers</span><span class="ss">bass ducks under drums</span></div><div style="display:flex;margin-top:10px">{meters}</div>'
    bk = S.bank("pan", ("pan", "send", "duck", "filter"))
    lv = [.8, .5, .7, .45, .6, .3]
    strips = ""
    for i, (n, c) in enumerate(LAYERS):
        sc = n == "bass"
        strips += (f'<div class="m wide" style="height:100%;flex-direction:column;justify-content:space-between;padding:10px 0 8px;border-radius:10px">'
                   f'<span class="dash on" style="--c:{c};width:14px"></span>{V.slim_fader(lv[i], 190, 30)}'
                   f'<div style="display:flex;flex-direction:column;gap:3px;width:30px">'
                   + "".join(f'<span class="sp mini{" lit" if (t == "sc" and sc) else ""}" style="--c:{GO};height:20px;font-size:9px">{t}</span>' for t in ("sc", "m", "s"))
                   + f'</div><span class="eng" style="font-size:9px">{n}</span></div>')
    for _ in range(2):
        strips += f'<a href="#" class="m wide" aria-label="Add a layer" style="height:100%;flex-direction:column;gap:6px;border-radius:10px;opacity:.8"><span class="cap" style="width:26px">{V.I["plus"].replace("class=\"i\"", "class=\"s\"")}</span><span class="eng" style="font-size:9px">add</span></a>'
    surface = f'<div style="flex:1;min-height:0;display:grid;grid-template-columns:repeat(8,1fr);gap:5px">{strips}</div>'
    kn = '<div style="display:grid;grid-template-columns:repeat(8,1fr);gap:5px;margin-top:8px;flex:none">' + "".join(
        f'<div class="m wide" style="height:52px;border-radius:10px">{V.mini_knob(CAPC["grey"] if i >= 6 else CAPC["grey"], .5, 24)}</div>' for i in range(8)) + '</div>'
    items = (header("mix") + scr(s, 96, "14px 18px", 10) + silk("every layer side by side", "knobs follow the switch")
             + bk.replace('class="bank"', 'class="bank" style="width:100%"') + kn + '<div style="height:10px;flex:none"></div>' + surface)
    return phone("dark", items, transport())


def write(name, title, body):
    with open(os.path.join(OUT, name), "w") as f:
        f.write(P.HEAD.format(title=title, css=CSS, body=body, w=390, h=844))
    print("wrote", name)


SCREENS = [("V7BassKeys", "play · bass on keys, shape the sound", bass_keys), ("V7DrumsMix", "play · drums on pads, this layer's mix", drums_mix),
           ("V7BassEQ", "play · bass on pads, eq", bass_eq), ("V7Mix", "mix · 8 layers side by side", mix)]

if __name__ == "__main__":
    for n, t, fn in SCREENS:
        write(f"{n}.dc.html", t, fn())
