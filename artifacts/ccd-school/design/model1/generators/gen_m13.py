#!/usr/bin/env python3
"""Round 5. Practice progress lives on the screen. Studio: pick a layer at the top, then play it
through steps, keys or pads. Bass on pads is a scale grid, drums on keys is one sound per key.
The drum rack sits dim like a real one, and a hit sends a ripple of light."""
import os, math
import gen_m6 as V
import gen_m5 as P
import gen_m7 as L
import gen_m8 as G
import gen_m9 as H
import gen_m11 as K
import gen_m12 as F

OUT = V.OUT
N, I, CAPC = V.N, V.I, V.CAPC
key, silk, header, week_dots, knob = V.key, V.silk, V.header, V.week_dots, V.knob
tray, phone, scr, pic = H.tray, H.phone, F.scr, F.pic
GO, MINT, LILAC, BLUE, AMBER = N["prod"], N["fund"], N["lilac"], N["dj"], "#F3C14F"

EXTRA = r"""
/* drum rack at rest: every pad faintly lit in its colour */
.sp.rest{background:radial-gradient(70% 65% at 50% 55%,color-mix(in srgb,var(--c) 22%,transparent),color-mix(in srgb,var(--c) 6%,transparent) 80%),linear-gradient(180deg,var(--spa),var(--spb))!important}
/* ripple from a hit: neighbours light up and fade with distance */
.sp.rip1{background:radial-gradient(75% 70% at 50% 52%,color-mix(in srgb,var(--c) 62%,transparent),color-mix(in srgb,var(--c) 22%,transparent) 85%),linear-gradient(180deg,var(--spa),var(--spb))!important;box-shadow:inset 0 1.5px 0 rgba(255,255,255,.14),0 0 10px color-mix(in srgb,var(--c) 30%,transparent)!important}
.sp.rip2{background:radial-gradient(75% 70% at 50% 52%,color-mix(in srgb,var(--c) 38%,transparent),color-mix(in srgb,var(--c) 12%,transparent) 85%),linear-gradient(180deg,var(--spa),var(--spb))!important}
.sp.done{opacity:.62}
.dk .kcap.hit{background:linear-gradient(180deg,#8FF0D2,#36C9A0)!important;box-shadow:inset 0 2px 1px rgba(255,255,255,.45),0 1px 0 #1E8F70,0 2px 0 #1E8F70,0 3px 0 #156B54,0 4px 0 #156B54,0 8px 10px -2px var(--shA)!important}
.lyr{height:48px;border-radius:12px;flex-direction:column;justify-content:center;gap:5px;font-size:12px;font-weight:500;color:var(--sub)}
.lyr.on{color:var(--ink);font-weight:600}
.lyr .dash{width:22px}
"""
CSS = F.CSS + EXTRA


def silk_tight(label, right=None):
    return silk(label, right).replace('class="silk"', 'class="silk" style="margin:14px 2px 8px"')


# ── PRACTICE ──────────────────────────────────────────────────────────────
def practice():
    skills = [("eq ear", 6, MINT), ("compression", 3, LILAC), ("tempo", 8, BLUE), ("keys", 4, GO), ("sound", 5, AMBER)]
    rows = "".join(f'<div style="display:flex;align-items:center;gap:12px;margin-top:11px"><span class="ss" style="width:82px;color:#D9D9DC">{n}</span>'
                   f'{H.led_bar(l, 10, c, 168)}<span class="ss" style="margin-left:auto">lv {l}</span></div>' for n, l, c in skills)
    reps = "".join(f'<span style="width:10px;height:10px;border-radius:5px;{"background:" + MINT + ";box-shadow:0 0 6px " + MINT if i < 2 else "background:#1A1A1D;box-shadow:inset 0 1px 1px #000"}"></span>' for i in range(5))
    inner = ('<div style="display:flex;justify-content:space-between;align-items:center"><span class="ss">practice · 5 minutes</span>'
             f'<span style="display:flex;align-items:center;gap:6px">{reps}<span class="ss" style="margin-left:4px">2 of 5</span></span></div>'
             f'<div style="margin-top:8px">{rows}</div>')

    def dp(kind, name, col, state="", tag=None):
        lit = state == "lit"
        ink = "#141416" if lit else "var(--ink)"
        t = f'<span class="tg">{tag}</span>' if tag else ""
        return (f'<a href="#" class="sp {state}" aria-label="{name}" style="--c:{col}">{pic(kind, col if not lit else "#141416", ink)}{t}'
                f'<span class="lb">{name}</span></a>')
    cells = [dp("eq", "which band?", MINT, "lit", "today"), dp("comp", "compressed?", LILAC),
             dp("tempo", "tap the tempo", BLUE, "done", "again"), dp("key", "same key?", GO),
             dp("sound", "name the sound", AMBER, "done", "again"), dp("review", "review", BLUE, "", "8 due")]
    right = f'<div style="display:flex;align-items:center;gap:12px">{week_dots()}<span style="font-size:15px;font-weight:300">340<span class="val" style="margin-left:3px">xp</span></span></div>'
    items = header(right) + scr(inner, 196, "18px 20px") + '<div class="seam"></div>' + silk("drills", "tap one, it lights up") + tray(cells, 2, 3)
    return phone("light", items, G.nav6("practice"))


# ── STUDIO ────────────────────────────────────────────────────────────────
LAYERS = [("drums", MINT), ("hats", AMBER), ("bass", GO), ("chords", LILAC)]


def layer_row(active):
    cells = "".join(f'<a href="#" class="m wide lyr{" on" if n == active else ""}" aria-pressed="{str(n == active).lower()}">'
                    f'<span class="dash{" on" if n == active else ""}" style="--c:{c}"></span>{n}</a>' for n, c in LAYERS)
    return f'<div style="display:grid;grid-template-columns:repeat(4,1fr) 48px;gap:8px">{cells}<a href="#" class="m wide lyr" aria-label="Add a layer">{I["plus"]}</a></div>'


def view_switch(active, views=("steps", "keys", "pads", "mix")):
    return ('<div class="g" style="gap:8px">' + "".join(
        f'<a href="#" class="m wide vk{" on" if v == active else ""}" aria-pressed="{str(v == active).lower()}" style="height:42px">'
        f'<span class="dot{" on" if v == active else ""}" style="--c:#F4F3F0"></span>{v}</a>' for v in views) + '</div>')


def screen(layer, col, touched, val, params, note):
    pbars = "".join(f'<div style="flex:1"><div class="ss" style="display:flex;justify-content:space-between"><span>{n}</span><span style="color:#F3F2EF">{int(v*100)}</span></div>'
                    f'<div style="height:3px;border-radius:2px;background:#1E1E21;margin-top:6px"><div style="width:{v*100:.0f}%;height:100%;border-radius:2px;background:{col if n == touched else "#6E6E74"}"></div></div></div>' for n, v in params)
    return ('<div style="display:flex;justify-content:space-between;align-items:flex-start"><div>'
            f'<div class="big" style="font-size:30px;color:{col}">{layer}</div><div class="ss" style="margin-top:6px">{note}</div></div>'
            f'<div style="text-align:right"><div class="ss">{touched}</div><div class="big" style="font-size:30px;margin-top:2px">{val}</div></div></div>'
            f'<div style="display:flex;gap:14px;margin-top:18px">{pbars}</div>')


def frame(layer, col, view, touched, val, params, knobs, note, surface, how):
    head = ('<div style="display:flex;align-items:center;gap:10px;height:36px;flex:none">'
            f'<a href="#" aria-label="Back" style="color:var(--ink);display:flex">{I["back"]}</a><span class="t22" style="flex:1">studio</span>'
            f'<span class="tag">120 bpm</span><span class="tag">a minor</span></div>')
    transport = ('<div class="g" style="position:absolute;left:16px;right:16px;bottom:24px;grid-template-columns:2fr 1fr 1fr 1fr">'
                 + f'<a href="#" class="m wide" aria-label="Play"><span class="cap go pill" style="width:88%;height:56%;gap:8px;font-size:15px;font-weight:500;margin-top:-12px">{I["play"]}play</span></a>'
                 + key(G.IC["rec"], "rec") + key(G.IC["undo"], "undo") + key(I["out"], "to live") + '</div>')
    caps = [col, CAPC["grey"], CAPC["navy"], CAPC["grey"]]
    kn = '<div class="g" style="margin-top:12px">' + "".join(knob(caps[i], n, v, 36) for i, (n, v) in enumerate(knobs)) + '</div>'
    items = (head + '<div style="height:6px"></div>' + layer_row(layer) + scr(screen(layer, col, touched, val, params, note), 104, "16px 18px", 12)
             + '<div class="seam"></div>' + kn + silk_tight(f"play {layer} on", how) + view_switch(view) + '<div style="height:10px;flex:none"></div>' + surface)
    return phone("dark", items, transport)


BASS_P = [("cutoff", .62), ("res", .30), ("env", .45), ("glide", .15)]
DRUM_P = [("tune", .5), ("decay", .4), ("drive", .2), ("level", .8)]


def bass_steps():
    pat = [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0]
    head_at = 6
    cells = [f'<a href="#" class="sp {("lit" if i == head_at else "on") if on else ""}" style="--c:{GO}" aria-label="Step {i+1}"><span class="lv" style="left:10px;right:auto;top:9px">{i+1}</span></a>' for i, on in enumerate(pat)]
    return frame("bass", "#FF6FAE", "steps", "cutoff", "62", BASS_P, BASS_P, "6 steps on · tap to switch a step", tray(cells, 4, 4), "16 steps")


def bass_keys():
    return frame("bass", "#FF6FAE", "keys", "note", "e2", BASS_P, BASS_P, "play it like a keyboard", K.keys(hit=2).replace("margin-top:18px", "margin-top:14px"), "a keyboard")


def bass_pads():
    # scale grid: a minor, each row a fourth up, roots lit to show where home is
    scale = ["a", "b", "c", "d", "e", "f", "g"]
    cells = []
    for r in range(4):
        for c in range(4):
            deg = (3 - r) * 3 + c
            n = scale[deg % 7]
            octv = 1 + deg // 7
            root = n == "a"
            hit = (3 - r, c) == (1, 1)
            st = "lit" if hit else ("rest" if root else "")
            cells.append(f'<a href="#" class="sp {st}" style="--c:{GO}" aria-label="Note {n}{octv}{", root" if root else ""}"><span class="lb" style="font-size:13px;bottom:10px;left:11px">{n}<span style="font-size:10px;opacity:.6">{octv}</span></span></a>')
    return frame("bass", "#FF6FAE", "pads", "note", "e2", BASS_P, BASS_P, "only notes in a minor · lit pads are a", tray(cells, 4, 4), "a scale grid")


KIT = ["kick", "snare", "clap", "rim", "closed hat", "open hat", "shaker", "ride", "low tom", "mid tom", "high tom", "crash", "perc 1", "perc 2", "fx", "reverse"]


def drum_pads():
    hit = (3, 0)  # kick, bottom left
    cells = []
    for r in range(4):
        for c in range(4):
            name = KIT[(3 - r) * 4 + c]
            d = max(abs(r - hit[0]), abs(c - hit[1]))
            st = "lit" if d == 0 else ("rip1" if d == 1 else ("rip2" if d == 2 else "rest"))
            cells.append(f'<a href="#" class="sp {st}" style="--c:{MINT}" aria-label="{name}"><span class="lb" style="font-size:11px;bottom:9px;left:10px">{name}</span></a>')
    return frame("drums", MINT, "pads", "decay", "40", DRUM_P, DRUM_P, "16 sounds · a hit sends a ripple", tray(cells, 4, 4), "a drum rack")


def drum_steps():
    lanes = [("kick", [1, 0, 0, 0, 1, 0, 0, 0]), ("snare", [0, 0, 1, 0, 0, 0, 1, 0]), ("clap", [0, 0, 1, 0, 0, 0, 1, 1]), ("hat", [1, 1, 1, 1, 1, 1, 1, 1])]
    head_at = 3
    cells = []
    for name, pat in lanes:
        cells.append(f'<div style="display:flex;align-items:center;justify-content:flex-start;padding-left:6px;font-size:11px;font-weight:500;color:var(--sub)">{name}</div>')
        for i, on in enumerate(pat):
            st = ("lit" if i == head_at else "on") if on else ("dim" if i == head_at else "")
            cells.append(f'<a href="#" class="sp {st}" style="--c:{MINT if on else "#F3F2EF"}" aria-label="{name} step {i+1}"></a>')
    t = tray(cells, 9, 4).replace("grid-template-columns:repeat(9,1fr)", "grid-template-columns:44px repeat(8,1fr)")
    pages = '<div style="display:flex;justify-content:flex-end;gap:6px;margin-top:8px;flex:none"><span class="tag" style="color:var(--ink);border-color:var(--ink)">1–8</span><span class="tag">9–16</span></div>'
    return frame("drums", MINT, "steps", "decay", "40", DRUM_P, DRUM_P, "a lane per sound · 8 steps a page", t + pages, "lanes")


def drum_keys():
    names = ["kick", "snare", "clap", "rim", "c hat", "o hat", "tom", "crash"]
    kb = K.keys(hit=0).replace("margin-top:18px", "margin-top:14px")
    for n, nm in zip("cdefgabc", names):
        kb = kb.replace(f'aria-label="Note {n}"', f'aria-label="{nm}"', 1)
    import re
    i = 0
    def sub(m):
        nonlocal i
        out = m.group(1) + names[i] + "</span></a>"
        i += 1
        return out
    kb = re.sub(r'(<span class="ml"[^>]*>)[a-g]</span></a>', sub, kb)
    kb = kb.replace('<div style="position:relative;flex:1', '<div class="dk" style="position:relative;flex:1', 1)
    return frame("drums", MINT, "keys", "decay", "40", DRUM_P, DRUM_P, "one sound per key, like a drum kit in live", kb, "a keyboard")


def write(name, title, body):
    with open(os.path.join(OUT, name), "w") as f:
        f.write(P.HEAD.format(title=title, css=CSS, body=body, w=390, h=844))
    print("wrote", name)


SCREENS = [("V5Practice", "practice · progress on the screen", practice),
           ("V5BassKeys", "bass · keys", bass_keys), ("V5BassPads", "bass · pads, a scale grid", bass_pads), ("V5BassSteps", "bass · steps", bass_steps),
           ("V5DrumPads", "drums · pads, a drum rack", drum_pads), ("V5DrumSteps", "drums · steps, a lane per sound", drum_steps), ("V5DrumKeys", "drums · keys, one sound per key", drum_keys)]

if __name__ == "__main__":
    for n, t, fn in SCREENS:
        write(f"{n}.dc.html", t, fn())
