#!/usr/bin/env python3
"""Round 8. Duck shows what it ducks under and how. Each layer gets a fourth surface of its own
(bass: glide strip, drums: circle, chords: chord pads). Mix mode is just levels."""
import os, math
import gen_m6 as V
import gen_m5 as P
import gen_m9 as H
import gen_m11 as K
import gen_m12 as F
import gen_m13 as M
import gen_m14 as S
import gen_m15 as Q

OUT = V.OUT
N, I, CAPC = V.N, V.I, V.CAPC
key, silk, knob = V.key, V.silk, V.knob
tray, phone, scr, sp = H.tray, H.phone, F.scr, K.sp
GO, MINT, LILAC, BLUE, AMBER = N["prod"], N["fund"], N["lilac"], N["dj"], "#F3C14F"
PINK = "#FF6FAE"
CSS = Q.CSS + r"""
.chip{display:inline-flex;align-items:center;gap:5px;height:20px;padding:0 8px;border-radius:10px;border:1px solid #3A3A40;font-size:11px;font-weight:500;color:#F3F2EF}
.chip.on{border-color:currentColor}
.rib{position:relative;border-radius:14px;background:linear-gradient(180deg,#1A1A1D,#0E0E10);box-shadow:inset 0 3px 8px rgba(0,0,0,.7),inset 0 0 0 1px rgba(255,255,255,.04),0 1px 0 var(--hi)}
"""

SPECIAL = {"bass": "glide", "drums": "circle", "chords": "chords", "lead": "xy", "hats": "rolls", "fx": "riser"}


def views(layer, active):
    vs = ["steps", "keys", "pads", SPECIAL[layer]]
    return ('<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:7px;flex:none">' + "".join(
        f'<a href="#" class="m wide vk{" on" if v == active else ""}" style="height:36px"><span class="dot{" on" if v == active else ""}" style="--c:{"#F4F3F0" if i < 3 else GO}"></span>{v}</a>'
        for i, v in enumerate(vs)) + '</div>')


def play(layer, col, view, surface, screen_html, bank_on, knobs, kcol=None):
    items = (Q.header("play") + Q.slots(layer) + scr(screen_html, 96, "14px 18px", 10)
             + silk(f"1 · play {layer} on", "pick how") + views(layer, view) + '<div style="height:8px;flex:none"></div>' + surface
             + silk(f"2 · shape {layer}", "after you play") + Q.shape(bank_on, knobs, kcol or col))
    return phone("dark", items, Q.transport())


# ── 1 · duck: what it ducks under and how ────────────────────────────────
def duck_svg(amount=.6, w=322, h=46):
    hits = [i * w / 8 for i in range(8)]
    pts = []
    for x in range(0, w + 1, 2):
        last = max([hx for hx in hits if hx <= x] or [0])
        t = (x - last) / (w / 8)
        g = 1 - amount * math.exp(-t * 4.2)
        pts.append(f"{x} {4 + (1 - g) * (h - 18):.1f}")
    ticks = "".join(f'<rect x="{hx+1:.1f}" y="{h-8}" width="14" height="6" rx="1.5" fill="{MINT}"/>' for hx in hits)
    return (f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" aria-hidden="true" style="display:block">'
            f'<path d="M0 4H{w}" stroke="#2A2A2E" stroke-dasharray="3 4"/><path d="M{" L".join(pts)}" fill="none" stroke="{PINK}" stroke-width="2"/>{ticks}</svg>')


def bass_duck():
    s = ('<div style="display:flex;justify-content:space-between;align-items:center">'
         f'<span style="display:flex;align-items:center;gap:8px"><span class="big" style="font-size:24px;color:{PINK}">bass</span>'
         f'<span class="ss">ducks under</span><span class="chip on" style="color:{MINT}">drums · kick ▾</span></span>'
         '<span class="big" style="font-size:24px">60%</span></div>'
         f'<div style="margin-top:10px">{duck_svg(.6)}</div>'
         '<div class="ss" style="margin-top:6px;display:flex;justify-content:space-between"><span><span style="color:' + MINT + '">▬</span> kick hits</span><span><span style="color:' + PINK + '">—</span> bass level dips, then comes back</span></div>')
    kb = K.keys(hit=2).replace("margin-top:18px", "margin-top:16px")
    return play("bass", PINK, "keys", kb, s, "mix", [("level", .8), ("pan", .5), ("send", .2), ("duck", .6)])


# ── 2 · bass on its own surface: the glide strip ─────────────────────────
def bass_glide():
    notes = ["a", "b", "c", "d", "e", "f", "g", "a"]
    w = 358
    marks = "".join(f'<div style="position:absolute;left:{12 + i*(w-24)/7:.0f}px;top:0;bottom:0;width:1px;background:rgba(255,255,255,{.18 if n == "a" else .08})"></div>'
                    f'<span style="position:absolute;left:{12 + i*(w-24)/7 - 8:.0f}px;bottom:10px;width:16px;text-align:center;font-size:11px;font-weight:{600 if n == "a" else 500};color:{"#F3F2EF" if n == "a" else "#77777B"}">{n}</span>' for i, n in enumerate(notes))
    fx = 12 + 3.6 * (w - 24) / 7
    trail = f'<div style="position:absolute;left:{12 + 1*(w-24)/7:.0f}px;width:{fx - 12 - (w-24)/7:.0f}px;top:50%;height:4px;margin-top:-2px;border-radius:2px;background:linear-gradient(90deg,rgba(255,111,174,0),{PINK})"></div>'
    finger = f'<div style="position:absolute;left:{fx-22:.0f}px;top:50%;margin-top:-22px;width:44px;height:44px;border-radius:22px;background:radial-gradient(circle,#fff 0 18%,{PINK} 45%,rgba(255,79,154,0) 72%);box-shadow:0 0 18px {PINK}"></div>'
    ribbon = f'<div class="rib" style="height:150px;flex:none">{marks}{trail}{finger}</div>'
    row = ('<div class="g" style="grid-template-columns:1fr 1fr 1fr;margin-top:10px;flex:1;min-height:0">'
           + f'<a href="#" class="m wide" style="height:100%"><span class="cap" style="width:46px;margin-top:-12px"><span style="font-size:13px;font-weight:500">−</span></span><span class="ml">octave</span></a>'
           + f'<a href="#" class="m wide" style="height:100%"><span class="dot on" style="--c:{GO}"></span><span class="cap blk" style="width:46px;margin-top:-12px"><span style="font-size:12px;font-weight:500">hold</span></span><span class="ml" style="color:var(--ink)">hold note</span></a>'
           + f'<a href="#" class="m wide" style="height:100%"><span class="cap" style="width:46px;margin-top:-12px"><span style="font-size:13px;font-weight:500">+</span></span><span class="ml">octave</span></a></div>')
    surf = f'<div style="flex:1;min-height:0;display:flex;flex-direction:column">{ribbon}{row}</div>'
    s = Q.scr_line("bass", PINK, "gliding", "c → e", "slide your finger, the note bends to the next one")
    s += '<div class="ss" style="margin-top:12px">only notes in a minor · glide time follows the glide knob</div>'
    return play("bass", PINK, "glide", surf, s, "sound", [("cutoff", .62), ("res", .3), ("env", .45), ("glide", .7)])


# ── 3 · drums on their own surface: the circle ───────────────────────────
def drums_circle():
    size = 214
    c = size / 2
    hits = {0, 4, 8, 12}
    rot_step = 6
    dots = ""
    for i in range(16):
        a = math.radians(-90 + i * 22.5)
        x, y = c + 88 * math.cos(a), c + 88 * math.sin(a)
        on = i in hits
        now = i == rot_step
        dots += (f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{11 if on else 8}" fill="{MINT if on else "#1C1C1F"}" stroke="{"#F3F2EF" if now else "#000"}" stroke-width="{1.8 if now else 1}" '
                 + (f'style="filter:drop-shadow(0 0 5px {MINT})"' if on else "") + '/>')
    ah = math.radians(-90 + rot_step * 22.5)
    hand = f'<path d="M{c + 34*math.cos(ah):.1f} {c + 34*math.sin(ah):.1f}L{c + 70*math.cos(ah):.1f} {c + 70*math.sin(ah):.1f}" stroke="#F3F2EF" stroke-width="1.5" stroke-linecap="round" opacity=".5"/>'
    ring = (f'<svg width="{size}" height="{size}" viewBox="0 0 {size} {size}" aria-hidden="true"><circle cx="{c}" cy="{c}" r="88" fill="none" stroke="#1A1A1D" stroke-width="30"/>{dots}{hand}'
            f'<text x="{c}" y="{c-2}" text-anchor="middle" font-family="Outfit" font-size="30" font-weight="200" fill="#F3F2EF">4</text>'
            f'<text x="{c}" y="{c+16}" text-anchor="middle" font-family="Outfit" font-size="10" fill="#9A9AA0">kick hits</text></svg>')
    chips = "".join(f'<span class="sp {"lit" if n == "kick" else ""}" style="--c:{MINT};height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600">{n}</span>' for n in ("kick", "snare", "clap", "hat"))
    left = (f'<div style="flex:1;display:flex;flex-direction:column;gap:8px">'
            f'<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px">{chips}</div>'
            f'<div class="rib" style="flex:1;display:flex;align-items:center;justify-content:center">{ring}</div></div>')
    right = ('<div style="width:86px;display:flex;flex-direction:column;gap:8px">'
             + knob(CAPC["fund"], "hits", .25, 34, wide=True, h=None).replace('class="m wide"', 'class="m wide" style="flex:1"', 1)
             + knob(CAPC["grey"], "rotate", .1, 34, wide=True).replace('class="m wide"', 'class="m wide" style="flex:1"', 1) + '</div>')
    surf = f'<div style="flex:1;min-height:0;display:flex;gap:8px">{left}{right}</div>'
    s = Q.scr_line("drums", MINT, "kick", "4/16", "hits spread evenly round the bar")
    s += '<div class="ss" style="margin-top:12px">4 = four on the floor · 3 = tresillo · rotate moves them</div>'
    return play("drums", MINT, "circle", surf, s, "sound", [("tune", .5), ("decay", .4), ("drive", .2), ("level", .8)])


# ── 4 · chords on their own surface: chord pads ──────────────────────────
def chords_pads():
    chords = [("i", "am"), ("iv", "dm"), ("v", "em"), ("VI", "f"), ("III", "c"), ("VII", "g"), ("i7", "am7"), ("iv9", "dm9")]
    cells = []
    for i, (rn, nm) in enumerate(chords):
        st = "lit" if rn == "VI" else ""
        cells.append(f'<a href="#" class="sp {st}" style="--c:{LILAC}" aria-label="{nm}"><span class="sb" style="font-size:12px;opacity:.75">{nm}</span>'
                     f'<span class="lb" style="font-size:26px;font-weight:300">{rn}</span></a>')
    t = tray(cells, 4, 2)
    s = Q.scr_line("chords", LILAC, "playing", "f major", "one pad, one chord, always in a minor")
    s += '<div class="ss" style="margin-top:12px">try i · VI · III · VII, the loop most songs use</div>'
    strum = (silk("strum", "swipe across").replace('class="silk"', 'class="silk" style="margin:10px 2px 6px"')
             + '<div class="rib" style="height:46px;flex:none;display:flex;align-items:center;justify-content:space-between;padding:0 18px">'
             + "".join(f'<span style="width:2px;height:26px;border-radius:1px;background:{"#F3F2EF" if 5 <= i <= 8 else "#3A3A40"};{"box-shadow:0 0 6px rgba(255,255,255,.5)" if 5 <= i <= 8 else ""}"></span>' for i in range(22))
             + '</div>')
    surf = f'<div style="flex:1;min-height:0;display:flex;flex-direction:column">{t}{strum}</div>'
    return play("chords", LILAC, "chords", surf, s, "sound", [("voicing", .5), ("spread", .4), ("attack", .3), ("release", .6)], CAPC["lilac"])


# ── 5 · mix, simplified: only levels ─────────────────────────────────────
def mix():
    L = Q.LAYERS
    meters = "".join(f'<div style="display:flex;flex-direction:column;align-items:center;gap:5px;flex:1">'
                     f'<div style="display:flex;flex-direction:column-reverse;gap:2px">' + "".join(
                         f'<span style="width:16px;height:4px;border-radius:1px;background:{c if i < m else "color-mix(in srgb," + c + " 14%,#0E0E10)"};{"box-shadow:0 0 4px " + c if i < m else ""}"></span>' for i in range(10))
                     + f'</div><span class="ss" style="font-size:9px;color:{c}">{n}</span></div>'
                     for (n, c), m in zip(L + [("", "#3A3A40"), ("", "#3A3A40")], [8, 5, 7, 4, 6, 2, 0, 0]))
    s = f'<div style="display:flex;justify-content:space-between"><span class="ss">the whole track</span><span class="ss">loudest: drums</span></div><div style="display:flex;margin-top:10px">{meters}</div>'
    lv = [.8, .5, .7, .45, .6, .3]
    strips = ""
    for i, (n, c) in enumerate(L):
        strips += (f'<div class="m wide" style="height:100%;flex-direction:column;justify-content:space-between;padding:10px 0 8px;border-radius:10px">'
                   f'<span class="dash on" style="--c:{c};width:14px"></span>{V.slim_fader(lv[i], 250, 30)}'
                   f'<div style="display:flex;flex-direction:column;gap:3px;width:30px">'
                   + "".join(f'<span class="sp mini{" lit" if (t == "m" and n == "fx") else ""}" style="--c:{AMBER};height:22px;font-size:10px">{t}</span>' for t in ("m", "s"))
                   + f'</div><a href="#" class="eng" style="font-size:9px;text-decoration:none">{n}</a></div>')
    for _ in range(2):
        strips += f'<a href="#" class="m wide" aria-label="Add a layer" style="height:100%;flex-direction:column;gap:6px;border-radius:10px;opacity:.8"><span class="cap" style="width:26px">{V.I["plus"].replace("class=\"i\"", "class=\"s\"")}</span><span class="eng" style="font-size:9px">add</span></a>'
    surface = f'<div style="flex:1;min-height:0;display:grid;grid-template-columns:repeat(8,1fr);gap:5px">{strips}</div>'
    items = (Q.header("mix") + scr(s, 96, "14px 18px", 10) + silk("balance the layers", "tap a name to open it")
             + surface)
    return phone("dark", items, Q.transport())


def write(name, title, body):
    with open(os.path.join(OUT, name), "w") as f:
        f.write(P.HEAD.format(title=title, css=CSS, body=body, w=390, h=844))
    print("wrote", name)


SCREENS = [("V8BassDuck", "bass · duck, under the kick", bass_duck), ("V8BassGlide", "bass · its own surface, the glide strip", bass_glide),
           ("V8DrumsCircle", "drums · their own surface, the circle", drums_circle), ("V8ChordPads", "chords · their own surface, chord pads", chords_pads),
           ("V8Mix", "mix · just levels, mute, solo", mix)]

if __name__ == "__main__":
    for n, t, fn in SCREENS:
        write(f"{n}.dc.html", t, fn())
