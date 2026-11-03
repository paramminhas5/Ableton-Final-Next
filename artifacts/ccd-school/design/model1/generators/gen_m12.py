#!/usr/bin/env python3
"""Round 4. Selected pads shine from behind. Dim light only when something wants your attention.
A deeper, more physical screen with less on it. Practice drills carry a picture of what they train.
Studio gets a view switch: steps, keys, pads (a drum rack) and mix."""
import os, math
import gen_m6 as V
import gen_m5 as P
import gen_m4 as R
import gen_m7 as L
import gen_m8 as G
import gen_m9 as H
import gen_m11 as K

OUT = V.OUT
CAT, SYNTH, N, I, CAPC, DUO = V.CAT, V.SYNTH, V.N, V.I, V.CAPC, V.DUO
key, go_pill, silk, header, week_dots, knob = V.key, V.go_pill, V.silk, V.header, V.week_dots, V.knob
tray, phone, sp = H.tray, H.phone, K.sp
GO, RED, MINT, LILAC, BLUE = N["prod"], L.RED, N["fund"], N["lilac"], N["dj"]

EXTRA = r"""
/* a deeper screen: recess, raised bezel, then glass */
.scr{padding:8px!important;border-radius:22px!important;background:linear-gradient(180deg,#2C2C30,#141416)!important;
 box-shadow:0 0 0 3px var(--recess),0 0 0 4px var(--elo),0 1px 0 4px var(--ehi),inset 0 1.5px 0 rgba(255,255,255,.16),inset 0 -2px 2px rgba(0,0,0,.6),0 10px 18px -6px var(--shA)!important}
.scrf{border-radius:14px!important;background:radial-gradient(130% 100% at 50% -10%,#141417,#040405 70%)!important;
 box-shadow:0 0 0 1.5px #000,inset 0 0 0 1px rgba(255,255,255,.04),inset 0 10px 22px rgba(0,0,0,.75),inset 0 -6px 14px rgba(0,0,0,.5)!important}
.scrf:after{background:linear-gradient(115deg,rgba(255,255,255,.11),rgba(255,255,255,.03) 30%,rgba(255,255,255,0) 31%),radial-gradient(80% 50% at 50% 0%,rgba(255,255,255,.05),transparent 60%)!important}
/* selected pad: backlight shines through */
.sp.lit{background:radial-gradient(78% 72% at 50% 50%,color-mix(in srgb,var(--c) 34%,#fff) 0,var(--c) 56%,color-mix(in srgb,var(--c) 80%,#000) 100%)!important;transform:none;
 box-shadow:inset 0 2px 0 rgba(255,255,255,.35),inset 0 -3px 0 rgba(0,0,0,.14),0 0 0 1px color-mix(in srgb,var(--c) 70%,transparent),0 0 14px color-mix(in srgb,var(--c) 55%,transparent),0 0 30px color-mix(in srgb,var(--c) 25%,transparent)!important}
/* attention: a soft glow from below, used only to point at something */
.sp.dim{background:radial-gradient(55% 52% at 50% 55%,color-mix(in srgb,var(--c) 40%,transparent),color-mix(in srgb,var(--c) 8%,transparent) 72%,transparent 100%),linear-gradient(180deg,var(--spa),var(--spb))!important}
.sp.on{color:#141416;background:linear-gradient(180deg,color-mix(in srgb,var(--c) 80%,#fff),var(--c) 55%,color-mix(in srgb,var(--c) 88%,#000))!important;
 box-shadow:inset 0 2px 0 rgba(255,255,255,.38),inset 0 -3px 0 rgba(0,0,0,.14),inset 0 0 0 1px rgba(0,0,0,.12),0 1px 0 rgba(0,0,0,.25)!important}
.sp:not(.lit):not(.on):hover{background:radial-gradient(55% 52% at 50% 55%,color-mix(in srgb,var(--c,#F3F2EF) 40%,transparent),color-mix(in srgb,var(--c,#F3F2EF) 8%,transparent) 72%,transparent 100%),linear-gradient(180deg,var(--spa),var(--spb))!important}
.sp .pic{position:absolute;left:12px;top:12px}
.sp .lv{position:absolute;right:12px;top:12px;font-size:10px;font-weight:600;opacity:.5}
.sp .tg{position:absolute;right:12px;top:11px;font-size:10px;font-weight:600;letter-spacing:.04em;padding:2px 6px;border-radius:5px;border:1px solid currentColor;opacity:.75}
.vk{height:46px;border-radius:11px;justify-content:center;gap:8px;font-size:13px;font-weight:500;color:var(--sub)}
.vk.on{color:var(--ink);font-weight:600}
.vk .dot{position:static;margin:0}
"""
CSS = K.CSS + EXTRA


def scr(inner, h, pad_="18px 18px", mt=8):
    return f'<div class="scr" style="margin-top:{mt}px;flex:none"><div class="scrf" style="padding:{pad_};height:{h}px">{inner}</div></div>'


# ── drill pictures: what each drill trains ────────────────────────────────
def pic(kind, col, ink="currentColor", w=58, h=34):
    s = f'<svg class="pic" width="{w}" height="{h}" viewBox="0 0 58 34" aria-hidden="true" fill="none" stroke-linecap="round" stroke-linejoin="round">'
    if kind == "eq":
        s += f'<path d="M2 26H58" stroke="{ink}" stroke-opacity=".25"/><path d="M2 26C20 26 26 26 31 13S40 4 44 14 48 26 58 26" stroke="{col}" stroke-width="2.4"/>'
        s += f'<path d="M15 30V32M29 30V32M43 30V32" stroke="{ink}" stroke-opacity=".35"/>'
    elif kind == "comp":
        s += "".join(f'<path d="M{3+i*3.3:.1f} {17-a}V{17+a}" stroke="{ink}" stroke-opacity=".45" stroke-width="1.6"/>' for i, a in enumerate([4, 11, 6, 14, 5, 9, 3, 12]))
        s += "".join(f'<path d="M{33+i*3.3:.1f} {17-a}V{17+a}" stroke="{col}" stroke-width="1.6"/>' for i, a in enumerate([6, 8, 7, 8, 6, 8, 6, 7]))
    elif kind == "tempo":
        s += f'<path d="M16 32 22 4H30L36 32Z" stroke="{ink}" stroke-opacity=".45" stroke-width="1.6"/><path d="M26 26 40 8" stroke="{col}" stroke-width="2.4"/>'
        s += "".join(f'<circle cx="{46+i*5}" cy="28" r="1.8" fill="{col if i == 0 else ink}" fill-opacity="{1 if i == 0 else .35}" stroke="none"/>' for i in range(3))
    elif kind == "key":
        s += f'<circle cx="17" cy="17" r="14" stroke="{ink}" stroke-opacity=".35" stroke-width="1.6"/>'
        for a, c in ((-90, col), (-30, col), (90, ink)):
            x, y = 17 + 14 * math.cos(math.radians(a)), 17 + 14 * math.sin(math.radians(a))
            s += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="3.2" fill="{c}" fill-opacity="{1 if c == col else .35}" stroke="none"/>'
        s += f'<path d="M40 12H56M40 22H50" stroke="{ink}" stroke-opacity=".35" stroke-width="1.6"/><path d="M50 22l3 3 5-7" stroke="{col}" stroke-width="2"/>'
    elif kind == "sound":
        s += f'<path d="M3 13v8h5l6 5V8l-6 5z" stroke="{ink}" stroke-opacity=".5" stroke-width="1.6"/>'
        s += f'<path d="M20 17c3-9 5-9 8 0s5 9 8 0 5-9 8 0 5 9 8 0" stroke="{col}" stroke-width="2.2"/>'
    elif kind == "review":
        s += f'<path d="M6 17a11 11 0 0 1 19-7.5l2 2M28 17a11 11 0 0 1-19 7.5l-2-2" stroke="{col}" stroke-width="2.2"/><path d="M27 6v6h-6M7 28v-6h6" stroke="{col}" stroke-width="2.2"/>'
        s += f'<text x="42" y="23" font-family="Outfit" font-size="16" font-weight="300" fill="{ink}" fill-opacity=".7" stroke="none">8</text>'
    return s + '</svg>'


def drill_pad(kind, name, lv, col, state="", tag=None, of=10):
    cs = f"--c:{col};"
    lit = state == "lit"
    ink = "#141416" if lit else "var(--ink)"
    t = f'<span class="tg">{tag}</span>' if tag else ""
    seg = "".join(f'<span style="flex:1;height:5px;border-radius:1.5px;background:{("#141416" if lit else col) if i < lv else ("rgba(0,0,0,.18)" if lit else "color-mix(in srgb," + col + " 18%,var(--spb))")}"></span>' for i in range(of))
    bar = (f'<span style="position:absolute;left:13px;right:13px;bottom:13px;display:flex;align-items:center;gap:8px">'
           f'<span style="flex:1;display:flex;gap:2px">{seg}</span><span style="font-size:10px;font-weight:600;opacity:.6">{"lv " + str(lv) if kind != "review" else str(lv) + "/" + str(of)}</span></span>')
    return (f'<a href="#" class="sp {state}" aria-label="{name}" style="{cs}">{pic(kind, col if not lit else "#141416", ink)}{t}'
            f'<span class="lb" style="bottom:30px">{name}</span>{bar}</a>')


# ── PRACTICE ──────────────────────────────────────────────────────────────
def practice():
    reps = "".join(f'<span style="flex:1;height:8px;border-radius:3px;{"background:" + MINT + ";box-shadow:0 0 6px " + MINT if i < 2 else "background:#1A1A1D"}"></span>' for i in range(5))
    inner = ('<div style="display:flex;justify-content:space-between;align-items:baseline"><span class="ss">practice</span><span class="ss">2 of 5 reps</span></div>'
             '<div style="display:flex;align-items:baseline;gap:10px;margin-top:14px"><span class="big" style="font-size:56px;font-weight:200">5</span><span class="t22" style="color:#C9C9CE">minutes, one thumb</span></div>'
             f'<div style="display:flex;gap:6px;margin-top:20px">{reps}</div>'
             f'<div class="ss" style="margin-top:16px;display:flex;justify-content:space-between"><span>today: <span style="color:{MINT}">which band?</span></span><span>eq ear is your weakest</span></div>')
    cells = [drill_pad("eq", "which band?", 6, MINT, "lit", tag="today"),
             drill_pad("comp", "compressed?", 3, LILAC),
             drill_pad("tempo", "tap the tempo", 8, BLUE, tag="done"),
             drill_pad("key", "same key?", 4, GO),
             drill_pad("sound", "name the sound", 5, "#F3C14F", tag="done"),
             drill_pad("review", "review", 0, BLUE, tag="8 due", of=8)]
    right = f'<div style="display:flex;align-items:center;gap:12px">{week_dots()}<span style="font-size:15px;font-weight:300">340<span class="val" style="margin-left:3px">xp</span></span></div>'
    items = header(right) + scr(inner, 190, "20px 20px") + '<div class="seam"></div>' + silk("drills", "tap one, it lights up") + tray(cells, 2, 3)
    return phone("light", items, G.nav6("practice"))


# ── QUIZ ──────────────────────────────────────────────────────────────────
def quiz():
    cx = 196
    curve = ('<svg width="318" height="132" viewBox="0 0 318 132" aria-hidden="true" style="display:block">'
             + "".join(f'<path d="M{x} 0V116" stroke="#121215"/>' for x in range(0, 319, 53)) +
             f'<path d="M6 46H140C168 46 172 18 {cx} 18S212 74 236 96 270 114 312 116V116H6z" fill="rgba(243,242,239,.05)"/>'
             f'<path d="M6 46H140C168 46 172 18 {cx} 18S212 74 236 96 270 114 312 116" fill="none" stroke="#F3F2EF" stroke-width="2" stroke-linecap="round" style="filter:drop-shadow(0 0 4px rgba(255,255,255,.3))"/>'
             f'<path d="M{cx} 0V116" stroke="#F3F2EF" stroke-opacity=".25" stroke-dasharray="2 3"/><text x="{cx}" y="10" text-anchor="middle" font-family="Outfit" font-size="9" fill="#9A9AA0">cutoff</text>'
             '<path d="M6 116H312" stroke="#2A2A2D"/><text x="6" y="130" font-family="Outfit" font-size="9" fill="#77777B">low</text><text x="312" y="130" text-anchor="end" font-family="Outfit" font-size="9" fill="#77777B">high</text></svg>')
    inner = ('<div style="display:flex;justify-content:space-between"><span class="ss">question 1 of 3</span><span class="ss">+8 xp</span></div>'
             '<div class="t22" style="margin-top:14px;max-width:300px;line-height:1.22;font-size:27px;font-weight:300">which filter keeps the lows and cuts the highs?</div>'
             f'<div style="margin-top:56px">{curve}</div>')
    cells = [sp("high-pass"), sp("low-pass", state="lit", c=GO, aria="low-pass, picked"), sp("band-pass"), sp("notch")]
    t = tray(cells, 2, 2).replace("flex:1;min-height:0", "height:170px;flex:none").replace('class="lb"', 'class="lb" style="font-size:15px;bottom:11px"')
    items = (L.head(4, True, 5) + scr(inner, 396) + '<div class="seam"></div>' + silk("answer", "tap one, it lights up") + t)
    return phone("dark", items, L.bottom(key(I["shift"], "hint"), go_pill("check")))


# ── STUDIO · four views ───────────────────────────────────────────────────
VIEWS = ["steps", "keys", "pads", "mix"]


def view_switch(active):
    return ('<div class="g" style="gap:8px">' + "".join(
        f'<a href="#" class="m wide vk{" on" if v == active else ""}" aria-pressed="{str(v == active).lower()}">'
        f'<span class="dot{" on" if v == active else ""}" style="--c:#F4F3F0"></span>{v}</a>' for v in VIEWS) + '</div>')


def studio_screen(layer, col, touched, val, params, note):
    pbars = "".join(f'<div style="flex:1"><div class="ss" style="display:flex;justify-content:space-between"><span>{n}</span><span style="color:#F3F2EF">{int(v*100)}</span></div>'
                    f'<div style="height:3px;border-radius:2px;background:#1E1E21;margin-top:6px"><div style="width:{v*100:.0f}%;height:100%;border-radius:2px;background:{col if n == touched else "#6E6E74"}"></div></div></div>' for n, v in params)
    return ('<div style="display:flex;justify-content:space-between;align-items:flex-start"><div>'
            f'<div class="big" style="font-size:32px;color:{col}">{layer}</div><div class="ss" style="margin-top:6px">{note}</div></div>'
            f'<div style="text-align:right"><div class="ss">{touched}</div><div class="big" style="font-size:32px;margin-top:2px">{val}</div></div></div>'
            f'<div style="display:flex;gap:14px;margin-top:22px">{pbars}</div>')


def studio_frame(view, layer, col, touched, val, params, note, knobs_html, surface, silk_r):
    head = ('<div style="display:flex;align-items:center;gap:10px;height:40px;flex:none">'
            f'<a href="#" aria-label="Back" style="color:var(--ink);display:flex">{I["back"]}</a><span class="t22" style="flex:1">studio</span>'
            f'<span class="tag">120 bpm</span><span class="tag">my track</span></div>')
    transport = ('<div class="g" style="position:absolute;left:16px;right:16px;bottom:24px;grid-template-columns:2fr 1fr 1fr 1fr">'
                 + f'<a href="#" class="m wide" aria-label="Play"><span class="cap go pill" style="width:88%;height:56%;gap:8px;font-size:15px;font-weight:500;margin-top:-12px">{I["play"]}play</span></a>'
                 + key(G.IC["rec"], "rec") + key(I["plus"], "layer") + key(I["out"], "to live") + '</div>')
    items = (head + scr(studio_screen(layer, col, touched, val, params, note), 122) + '<div class="seam"></div>'
             + (silk(layer, "turn to shape") + knobs_html if knobs_html else "")
             + silk("view", silk_r) + view_switch(view) + '<div style="height:12px;flex:none"></div>' + surface)
    return phone("dark", items, transport)


def knob_row(names, vals, col_first):
    caps = [col_first, CAPC["grey"], CAPC["navy"], CAPC["grey"]]
    return '<div class="g">' + "".join(knob(caps[i], n, v, 40) for i, (n, v) in enumerate(zip(names, vals))) + '</div>'


def studio_steps():
    pat = [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0]
    head_at = 6
    cells = []
    for i, on in enumerate(pat):
        st = ("lit" if i == head_at else "on") if on else ("dim" if i == head_at else "")
        cells.append(f'<a href="#" class="sp {st}" aria-label="Step {i+1}{", on" if on else ""}" style="--c:{GO if on else "#F3F2EF"}"><span class="lv" style="left:10px;right:auto;top:9px">{i+1}</span></a>')
    surface = tray(cells, 4, 4)
    params = [("cutoff", .62), ("res", .30), ("env", .45), ("glide", .15)]
    return studio_frame("steps", "bass", "#FF6FAE", "cutoff", "62", params, "layer 3 · 6 steps on · tap a step to turn it on",
                        knob_row(["cutoff", "res", "env", "glide"], [.62, .3, .45, .15], CAPC["prod"]), surface, "16 steps · the bright one is playing now")


def studio_keys():
    params = [("cutoff", .62), ("res", .30), ("env", .45), ("glide", .15)]
    kb = K.keys(hit=4).replace("margin-top:18px", "margin-top:16px")
    return studio_frame("keys", "bass", "#FF6FAE", "note", "g2", params, "layer 3 · play to hear it, hold rec to record",
                        knob_row(["cutoff", "res", "env", "glide"], [.62, .3, .45, .15], CAPC["prod"]), kb, "play the selected layer")


def studio_pads():
    kit = ["kick", "snare", "clap", "rim", "closed hat", "open hat", "shaker", "ride", "low tom", "mid tom", "high tom", "crash", "perc 1", "perc 2", "fx", "reverse"]
    cells = []
    for i in range(16):
        r, c = divmod(i, 4)
        name = kit[(3 - r) * 4 + c]
        st = "lit" if name == "kick" else ""
        cells.append(f'<a href="#" class="sp {st}" aria-label="{name}{", playing" if st else ""}" style="--c:{MINT}"><span class="lb" style="font-size:11px;bottom:9px;left:10px">{name}</span></a>')
    surface = tray(cells, 4, 4)
    params = [("tune", .5), ("decay", .4), ("drive", .2), ("level", .8)]
    return studio_frame("pads", "drums", MINT, "decay", "40", params, "layer 1 · drum rack · 16 sounds",
                        knob_row(["tune", "decay", "drive", "level"], [.5, .4, .2, .8], CAPC["fund"]), surface, "a drum rack · hit a pad to play it")


def studio_mix():
    layers = [("drums", MINT, .8), ("hats", MINT, .5), ("bass", GO, .7), ("chords", LILAC, .45)]
    strips = ""
    for i, (n, c, lv) in enumerate(layers):
        on = i == 2
        strips += (f'<div class="m wide" style="height:100%;flex-direction:column;justify-content:space-between;padding:14px 0 10px">'
                   f'<span class="dash on" style="--c:{c}"></span>{V.slim_fader(lv, 150, 42)}'
                   f'<span class="eng" style="font-size:11px;font-weight:{600 if on else 500};{"color:var(--ink)" if on else ""}">{n}</span>'
                   f'<a href="#" aria-label="Select {n}" class="cap{" blk" if on else ""}" style="width:40px;text-decoration:none"><span class="leg" style="font-size:16px">{i+1}</span></a></div>')
    surface = (f'<div class="g" style="flex:1;min-height:0">{strips}</div>'
               + '<div style="height:52px;display:flex;margin-top:10px;flex:none">'
               + tray([sp("sidechain", state="lit", c=GO), sp("mute"), sp("solo"), sp("send")], 4, 1).replace('class="lb"', 'class="lb" style="font-size:12px;bottom:10px;left:10px"') + '</div>')
    params = [("drums", .8), ("hats", .5), ("bass", .7), ("chords", .45)]
    return studio_frame("mix", "mix", "#F3F2EF", "bass", "70", params, "4 layers · faders set each level",
                        "", surface, "levels, sidechain, mute, solo")


def write(name, title, body):
    with open(os.path.join(OUT, name), "w") as f:
        f.write(P.HEAD.format(title=title, css=CSS, body=body, w=390, h=844))
    print("wrote", name)


SCREENS = [("V4Quiz", "Round 4 · quiz, smaller answers", quiz), ("V4Practice", "Round 4 · practice, drills you can read", practice),
           ("V4StudioSteps", "Round 4 · studio, steps view", studio_steps), ("V4StudioKeys", "Round 4 · studio, keys view", studio_keys),
           ("V4StudioPads", "Round 4 · studio, pads view (drum rack)", studio_pads), ("V4StudioMix", "Round 4 · studio, mix view", studio_mix)]

if __name__ == "__main__":
    for n, t, fn in SCREENS:
        write(f"{n}.dc.html", t, fn())
